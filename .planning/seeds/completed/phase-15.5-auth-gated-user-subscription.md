---
title: Phase 15.5 — Auth-Gated User Subscription
planted_date: 2026-04-16
trigger_condition: "At the start of /gsd-insert-phase 15.5 or /gsd-discuss-phase 15.5. Also surface when /gsd-plan-phase 16 begins — Phase 16 FOUND-03 will build on top of this."
status: ready-to-plan
origin_phase: 15.2-user-directory-view-performance
origin_artifact: .planning/phases/15.2-user-directory-view-performance/15.2-UAT.md (Test 4)
---

# Phase 15.5 — Auth-Gated User Subscription

## Why this seed exists

During Phase 15.2 UAT Test 4 (2026-04-16), runtime verification on maincloud revealed that the D-06 "auth flip" (`spacetimedb.anonymousView` → `spacetimedb.view`) does NOT produce server-side rejection of anonymous subscribers. A harness (`tmp/uat-15.2-test4-view-directory-auth.ts`) connected without `loginAsGuest` and still received the full `view_user_directory` row set.

Investigation against the SpacetimeDB docs (https://spacetimedb.com/docs/functions/views/) confirmed this is by design:

> `view`: Uses `ViewContext`, which provides `ctx.sender()` to access the caller's identity
> `anonymousView`: Uses `AnonymousViewContext`, which does not provide caller information
>
> **Both can be called by any client.** The difference is *what data each view can access*, not *who can call it*.

The premise Phase 15.2 was built on (`CONTEXT.md:151-155` — "`view` → callable only by authenticated clients") was wrong. The SDK's `makeViewExport` vs `makeAnonViewExport` only toggles an `isAnonymous` flag in the module def; no host-level rejection exists. Authentication is application-level and must be enforced inside the view body.

Separately, the actual bandwidth leak this phase was supposed to close is not `view_user_directory` (no frontend ever subscribed to it — confirmed by grep across `app/`, `components/`, `lib/`, `src/hooks/`). The real leak is in `components/features/auth/hooks/useAuth.ts:38`:

```ts
conn.subscriptionBuilder()
  .onApplied(() => { readProfileFromConnection(conn); })
  .subscribe('SELECT * FROM user');   // fires unconditionally on isActive, pre-auth
```

This subscription fires as soon as the SpacetimeDB connection is active, before any auth check, delivering the full user directory to every anonymous browser that lands on the site. Since `User.public = true` (D-01, kept intentionally), the server streams rows to anyone who asks.

Phase 15.2's stated goal (`CONTEXT.md:174`):

> "I don't want anonymous users to automatically subscribe through the front end, we do that subscription for them once they are logged"

Was NOT delivered. This phase (15.5) exists to close that goal.

## What 15.2 DID deliver (keep intact)

| Deliverable | Status |
|---|---|
| Ghost-user cleanup via `DeletedUser` archive (D-05, D-09) | ✅ Shipped, real value |
| R1 latent bug fix — `admin_ban_user` + `clientConnected` now schedule UserDeletionJob (D-10) | ✅ Shipped, real value |
| `resolveUserLabel` helper at render sites (D-12) | ✅ Shipped, real value |
| `isPrivate` dead-code removal (D-02) | ✅ Shipped, real value |
| Nuke flow cleanup of DeletedUser (D-11) | ✅ Shipped, real value |
| `view_user_directory` source flip (D-06) | ⚠️  Cosmetic — no runtime effect, no client subscriber |

15.5 DOES NOT revisit any of the above. It only closes the frontend subscription gap and retires the dead view.

## Goal

**Anonymous visitors must not automatically subscribe to any User data.** The authenticated client gets User table access (same bandwidth profile as today for authed users). Anonymous visitors get zero User rows until they explicitly authenticate (`loginAsGuest` or Discord login).

Sensitive data (email, discordId, provider fields) stays in the existing `UserPrivate` table (`public: false`) — already private, already accessed only via `view_my_profile`'s `ctx.sender` filter. No new view needed.

## Technical design

### The two-stage subscription lifecycle

```
Connect → Stage 1 (always): view_my_profile subscription
            │
            ├─ Anon visitor   → 0 rows delivered (ctx.sender filter) → halt, no Stage 2
            └─ Has User row   → 1 row delivered → currentUser populates → Stage 2 fires
                                        │
                                        └─ Stage 2: SELECT * FROM user subscription
```

**Why this is race-free:**
- `view_my_profile` is `ctx.sender`-filtered server-side. Anonymous callers receive 0 rows; that's free bandwidth-wise and authoritative (server enforces).
- Stage 2 only fires *after* `currentUser` is resolved. Single deterministic trigger.
- No reliance on localStorage as truth — localStorage is a UX hint only ("suppress login-button flicker for returning users").

### Gate condition (the one critical line)

```ts
const stage2Gate = currentUser != null || hadTokenOnMount.current;
```

Both conditions needed:
- `currentUser != null` — authoritative gate (works for first-time guests, Discord logins, reconnecting returning users once view_my_profile resolves)
- `hadTokenOnMount` — UX optimization for returning visitors; opens Stage 2 immediately so lobby/chat/match components don't flicker while view_my_profile round-trips. If the token is stale/revoked, the SpacetimeDB connection itself fails at handshake (so `isActive` stays false, and Stage 2 never fires regardless).

### What gets deleted

| File | Change |
|------|--------|
| `spacetimedb/src/views/identityViews.ts` | Delete `UserDirectoryRow` type + `view_user_directory` export (current lines ~30-70) |
| `spacetimedb/src/index.ts` | Remove `view_user_directory` from re-exports (line ~23) |
| `spacetimedb/src/module_bindings/` | Regen (delete `view_user_directory_table.ts`, remove `ViewUserDirectoryRow` imports from `index.ts`) |
| `src/module_bindings/` | Regen — same |
| `test/backend/auth/auth-views.test.ts` | Delete VIEW-01 placeholder tests (D-15, D-16) — they assert `expect(true).toBe(true)` and document an enforcement model that doesn't exist |
| `docs/views/architecture.md` | Remove `view_user_directory` section; add Phase 15.5 execution entry noting removal as dead code |
| `docs/views/contract.md` | Same as above |

### What gets added

| File | Change |
|------|--------|
| `components/features/auth/hooks/useAuth.ts` | Split the single `useEffect` (lines 20-84) into two: Stage 1 on `isActive`, Stage 2 on `stage2Gate`. Separate `stage1Ref` and `stage2Ref` refs. |
| `test/backend/auth/auth-subscriptions.test.ts` (new) | Integration test asserting: (a) raw connection without `loginAsGuest` → harness cache `conn.db.User.iter().length === 0` remains 0 (harness never subscribes because it models useAuth's gate); (b) authenticated harness → User rows present. **Note:** this tests our frontend behavior, not server rejection (server WILL still deliver rows to any SQL subscription because `User.public=true` — accepted per D-01). |
| `docs/auth/architecture.md` | New section "Subscription Lifecycle" — document the two-stage pattern + Stage 2 gate rule |

## Engineering principles informing the design

1. **Single source of truth for auth state.** `currentUser` derived from `view_my_profile` (server-filtered). localStorage is a UX hint only. Avoids "phantom auth" bugs where stale storage tricks the client.
2. **Explicit subscription refs, never rely on state.** Prevents double-subscribe on reconnect — matches existing `subscribedRef` pattern in useAuth.
3. **No manual subscription teardown on logout.** SpacetimeDB SDK cleans subscriptions on disconnect. Manual `.unsubscribe()` introduces teardown-vs-reconnect race bugs. On logout: `signOut()` → token cleared → reload triggers fresh reconnect → subscriptions re-establish cleanly per new auth state.
4. **Server enforcement through sender-filtered views, not through `.view()` vs `.anonymousView()` flips.** `view_my_profile`'s existing `ctx.sender` filter is load-bearing security; we're not adding new server-side gates that the SDK doesn't actually enforce.
5. **Accept the D-01 tradeoff openly.** `User.public=true` means a malicious actor subscribing to `SELECT * FROM user` manually (not via our frontend) still gets rows. Closing that requires `User.public=false` + new on-demand reducers (explicitly rejected 15.2 D-01 / deferred in `CONTEXT.md:188`). 15.5 scope is "OUR frontend doesn't auto-subscribe anon" — not "adversarial clients can't query User at all."

## Plan breakdown

| Plan | Wave | Content | Est. LOC |
|------|------|---------|----------|
| 15.5-01 | 1 | Backend cleanup: remove `view_user_directory` (view body, row type, export re-exports, server + client bindings regen) | ~50 deleted |
| 15.5-02 | 2 | Frontend auth gate: split `useAuth.ts` subscriptions into two stages with separate refs | ~30 added / ~15 modified |
| 15.5-03 | 2 | Test updates: delete VIEW-01 placeholders (`auth-views.test.ts`), add `auth-subscriptions.test.ts` | ~40 |
| 15.5-04 | 3 | Docs: `docs/auth/architecture.md` subscription lifecycle section, `docs/views/{architecture,contract}.md` removal entries with Phase History provenance | ~60 |

Wave 1 and Wave 2 are independent after Wave 1 lands (bindings regen). Wave 3 docs follow everything else.

## Risks / things to watch during planning + execution

1. **`loginAsGuest` timing for first-time visitors** — ~300ms gap between click and Stage 2 firing (reducer → view_my_profile.onInsert → currentUser populates). Acceptable, or add a small spinner. Low risk.
2. **Module bindings regeneration ripple** — dropping `view_user_directory` removes types from `src/module_bindings/types.ts` and `index.ts`. Grep already confirmed zero client references; safe.
3. **Other anonymous subscriptions in the codebase** — `view_public_accounts`, `view_lobby_browser` both remain `anonymousView`. Audit during discuss-phase:
   - Does anything on the frontend subscribe to them pre-auth? Grep first.
   - If yes, scope extension (probably same gate pattern).
   - If no, defer.
4. **`GameDataProvider` subscriptions** — static reference data (characters, lightcones, synergies, costs). Keep unconditional. NOT scope of 15.5.
5. **`test/backend/auth/auth-security.test.ts` SEC-02** — verifies the `user_identity` raw table via SQL. Not affected by this phase (server-side check, not client subscription).
6. **Phase 16 FOUND-03 handoff** — 16 will build on top of 15.5. FOUND-03 was "subscribe to `view_user_directory` only after login." 15.5 retires the view entirely, so 16 FOUND-03 either restates as "subscribe to `SELECT * FROM user` only after login" (which 15.5 already does) OR migrates to a new `view_active_users` / on-demand reducer if bandwidth at scale becomes a concern. Update the FOUND-03 scope during Phase 16 discussion.

## Key references (downstream agents MUST read before planning)

### From Phase 15.2
- `.planning/phases/15.2-user-directory-view-performance/15.2-CONTEXT.md` — full decision history including D-01 (User.public stays true), D-06 (cosmetic flip we're now retiring)
- `.planning/phases/15.2-user-directory-view-performance/15.2-DISCUSSION-LOG.md` §9 — the original framing of "frontend doesn't auto-subscribe anonymous" and its explicit handoff to Phase 16
- `.planning/phases/15.2-user-directory-view-performance/15.2-UAT.md` Test 4 — the runtime proof of the gap

### Current subscription code (change surface)
- `components/features/auth/hooks/useAuth.ts:20-84` — the useEffect that currently fires both subscriptions unconditionally
- `app/providers.tsx:30-60` — SpacetimeDB provider setup (no changes needed; connection is orthogonal to subscription state)
- `lib/session-cookie.ts` — `stdb_session` cookie helpers (used for UX flicker suppression only; no truth value for auth)

### Current view layer (cleanup surface)
- `spacetimedb/src/views/identityViews.ts` — all 5 identity views; we're removing only `view_user_directory` + `UserDirectoryRow`
- `spacetimedb/src/index.ts` §20-26 — view re-export block

### Dead code references to confirm during planning
- Grep command: `grep -rn "view_user_directory\|viewUserDirectory\|ViewUserDirectory" app components lib src/hooks src/app test/frontend` (should return 0 hits)
- Grep in server module bindings: `grep -rn "ViewUserDirectoryRow" spacetimedb/src/module_bindings` (these disappear on regen)

### SpacetimeDB docs (read once for shared understanding)
- https://spacetimedb.com/docs/functions/views/ — authoritative on `view` vs `anonymousView` semantics. Quote: "Both can be called by any client. The difference is what data each view can access, not who can call it."

### Phase 16 dependency
- `.planning/phases/15.2-user-directory-view-performance/15.2-CONTEXT.md:164` — Phase 16 FOUND-03 handoff note (must be revisited in 16's discuss to reflect 15.5's completion)

## Decisions already locked by this seed

- **S-01:** `view_user_directory` is deleted, not kept. No defense-in-depth value given `User.public=true` and zero client subscribers.
- **S-02:** No new view is created. `view_my_profile`'s `ctx.sender` filter already provides anonymous-safe access to private data.
- **S-03:** Frontend auth gate uses two-stage subscription pattern. Stage 1 always-on (view_my_profile, self-filtering). Stage 2 gated on `currentUser != null || hadTokenOnMount`.
- **S-04:** `User.public = true` stays (inherits 15.2 D-01). Adversarial subscribers are out of scope.
- **S-05:** Test strategy is unit-test on the useAuth hook (spy subscription calls) + harness-level integration test modeled on our frontend's gate logic. We do NOT test "server rejects anonymous" because the server doesn't — and we accept that.

## Open questions for discussion phase

1. Should we also gate `view_public_accounts` and `view_lobby_browser` behind auth, or keep them as intentional anonymous views (e.g., for public lobby browsing pre-login)? Audit during discuss.
2. Is there a need to preserve `view_user_directory` as a bookmark for future on-demand use (e.g., public profile rendering)? Current view: delete cleanly, add back when needed (YAGNI).
3. How should the "returning user flicker" UX be handled — spinner, skeleton, or just accept the 300ms gap? Likely a UX call during execution, not worth blocking planning on.

---

*Seed planted 2026-04-16 during Phase 15.2 UAT (Test 4 diagnosis session). Promote via `/gsd-insert-phase 15.5` after Phase 15.2 verify-work completes.*
