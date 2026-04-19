---
phase: 16-route-global-foundation
plan: 02
subsystem: auth
tags: [subscription, useAuth, AuthProvider, view_my_profile, SpacetimeDB, React, strict-mode, routing]

# Dependency graph
requires:
  - phase: 15.5-auth-gated-user-subscription
    provides: Stage 1 / Stage 2 subscribe pattern + D-12 harness regression guard (auth-subscriptions.test.ts)
  - phase: 16-01-config-route-group-rename
    provides: (authed) route-group path where Stage 2 relocates
provides:
  - 7-table layer-0 public reference subscription set in GameDataProvider (added Archetype + HsrCharacterArchetype)
  - AuthProvider owns view_my_profile Stage 1 subscribe lifecycle
  - (authed)/layout.tsx owns User Stage 2 subscribe + onUserInsert/onUserUpdate callbacks (route-group-gated)
  - useAuth.ts slimmed to state-machine + readProfileFromConnection reader only
  - setProfileReady + triggerReadProfile exposed on auth context (internal use)
affects: [16-03-middleware, 16-04-service-worker, 16-06-docs-component-hygiene, Phase 17+, Phase 21, Phase 28]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "subscribedRef guard pattern replicated across AuthProvider + (authed)/layout.tsx (D-11)"
    - "Route-group mount as structural subscription gate (replaces ref-based stage2Gate)"
    - "Internal-use auth context members: setProfileReady + triggerReadProfile with @internal JSDoc"
    - "Pitfall 5 live-change filter (isLiveChange ctx tag) on every onInsert/onUpdate callback"

key-files:
  created: []
  modified:
    - components/features/game-data/components/GameDataProvider.tsx
    - components/features/auth/components/AuthProvider.tsx
    - components/features/auth/hooks/useAuth.ts
    - app/(authed)/layout.tsx

key-decisions:
  - "Wiring path (a)+trigger for Task 2: setProfileReady + triggerReadProfile both exposed on useAuth return"
  - "Mechanism Option B (subscriptionBuilder) for Task 3 Stage 2 User subscribe"
  - "useTable retained for all 7 public reference tables in GameDataProvider (D-04 default)"
  - "Stage 2 effect body removed in Task 2 commit with Stage 2 owner landing in Task 3 — no partial-state risk (harness proves anon safety, authed-route mount lands within same plan execution)"

patterns-established:
  - "Subscription ownership flows outward: provider/layout owns lifecycle, hook owns state + reader"
  - "ref-backed triggerReadProfile callback for layout-layer → hook-layer coordination without effect retrigger"
  - "currentUserRef capture pattern: read latest user inside onApplied dedupe without adding currentUser to effect deps"

requirements-completed: [FOUND-05, FOUND-06]

# Metrics
duration: 8min
completed: 2026-04-19
---

# Phase 16 Plan 02: Subscription Reshuffle Summary

**useAuth.ts Stage 1 + Stage 2 subscribe effects relocated to their architectural owners (AuthProvider + (authed)/layout.tsx), GameDataProvider expanded from 5 to 7 public-table `useTable` calls, and 15.5's ref-based `stage2Gate` replaced by route-group mount as the structural subscription gate.**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-04-19T04:54:07Z
- **Completed:** 2026-04-19T05:02:35Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- GameDataProvider now mounts 7 `useTable` calls (HsrCharacter, HsrCharacterArchetype, Archetype, HsrCharacterCost, HsrLightcone, HsrLightconeCost, HsrSynergyCost) — FOUND-06 (D-01, D-02, D-04, D-05) satisfied.
- AuthProvider owns the `view_my_profile` Stage 1 subscribe effect with subscribedRef + isLiveChange filter — FOUND-05 (D-03, D-11) satisfied.
- `app/(authed)/layout.tsx` owns the `SELECT * FROM user` Stage 2 subscribe + `onUserInsert`/`onUserUpdate` callbacks — FOUND-05 (D-07, D-08, D-11) satisfied. Route-group mount IS the structural gate (15.5 `stage2Gate` ref check retired per D-07).
- `useAuth.ts` trimmed to state-machine + reader only: `readProfileFromConnection` 3-fallback, login/logout/Discord/guest/soft-delete flows, `hadSessionCookie`/`hadUserIdOnMount` refs, `guestLoginPending` narrow state all preserved per D-10.
- 15.5 harness regression guard (`test/backend/auth/auth-subscriptions.test.ts`) passes unmodified — anon caller still gets 0 User rows; authed caller still gets rows — D-12 satisfied.
- Build + typecheck exit 0 at every task commit.

## Task Commits

Each task was committed atomically:

1. **Task 1: Expand GameDataProvider to 7 useTable calls** — `87e2ea5` (feat)
2. **Task 2: Relocate view_my_profile Stage 1 subscribe to AuthProvider (D-03)** — `d87e480` (refactor)
3. **Task 3: Relocate User Stage 2 subscribe to (authed)/layout.tsx (D-07, D-08, D-10)** — `b2147e0` (refactor)

## Files Created/Modified

- `components/features/game-data/components/GameDataProvider.tsx` — Added `useTable(tables.Archetype)` + `useTable(tables.HsrCharacterArchetype)`; extended `GameDataContextType` with `archetypes` + `characterArchetypes` fields; `ArchetypeRow` + `HsrCharacterArchetypeRow` interfaces; D-33 mount log + all-7-ready marker.
- `components/features/auth/components/AuthProvider.tsx` — Added `useViewMyProfileSubscription` effect with subscribedRef (D-11), isLiveChange filter (Pitfall 5), `conn.subscriptionBuilder().onApplied()` + onInsert/onUpdate handlers. Calls `auth.setProfileReady(true)` + `auth.triggerReadProfile()` from onApplied; `auth.triggerReadProfile()` from live-change callbacks. D-33 `[AuthProvider]` tags throughout.
- `components/features/auth/hooks/useAuth.ts` — Removed Stage 1 effect (former lines 72-111), Stage 2 effect (former lines 115-181), `stage1Ref`/`stage2Ref` declarations, `stage2Gate` computation. Added D-33 delegation log at top of `useAuth()`. Exposed `setProfileReady` + `triggerReadProfile` on return shape with `@internal` JSDoc. All D-10 internals preserved verbatim: `readProfileFromConnection`, refs, login/logout/Discord/guest/soft-delete state, `guestLoginPending`.
- `app/(authed)/layout.tsx` — Renamed default export `LobbyLayout` → `AuthedLayout`. Added Stage 2 `useEffect` with subscribedRef (D-11), fast-reconnect `cancelled` guard, isLiveChange filter (Pitfall 5), `conn.subscriptionBuilder().onApplied()` with `currentUserRef` dedupe, `onUserInsert`/`onUserUpdate` handlers. 15.5 `stage2Gate` retired — route-group mount IS the gate (D-07). `AuthRequired` + `DeletionBanner` wrapper tree preserved verbatim (D-13). D-33 `[authedLayout]` tags throughout.

## Decisions Made

### AuthProvider ↔ useAuth coordination (RESEARCH Open Question 2)

**Chosen:** Path (a)+trigger — both `setProfileReady` and `triggerReadProfile` exposed on the `useAuth()` return shape.

**Rationale:** Setter-only (pure path a) is not sufficient because live-change events (`onInsert`/`onUpdate` fired by reducer transactions post-onApplied) do NOT flip `profileReady` — that state is already `true` by then. The existing reactive `useEffect([isActive, profileReady, identity, ...])` in useAuth.ts won't re-run for those live events. An explicit push from the subscription owner is required. `triggerReadProfile` wraps `readProfileRef.current(conn)` in a stable `useCallback` and handles the connection lookup so callers don't have to.

**Tradeoff:** Grows the `useAuth()` return shape by 2 members (`setProfileReady`, `triggerReadProfile`). Both are tagged `@internal` in JSDoc and commented inline with "AuthProvider + (authed)/layout.tsx only — consumers must NOT call these". Low severity per T-16-02-06 threat register (only local UI state flips, no privilege granted).

### Stage 2 mechanism (RESEARCH Open Question 1)

**Chosen:** Option B — `conn.subscriptionBuilder().subscribe('SELECT * FROM user')`.

**Rationale:** Yields the cleanest diff against the former useAuth Stage 2 effect — same SQL, same `onApplied` semantics with the `currentUser` dedupe, same `onUserInsert`/`onUserUpdate` callbacks. Option A (`useTable(tables.User)`) would still require a secondary `useEffect` to attach `onInsert`/`onUpdate` via `conn.db.User.onInsert(...)` and would lose the fast-reconnect `cancelled` guard that the 15.5 pattern uses. Option B is a structural port of a known-green pattern, which is the lowest-risk move for a D-12-gated refactor.

**Inline comment at the call site:** "Mechanism choice (RESEARCH Open Question 1): `conn.subscriptionBuilder()` ('Option B'). Yields the cleanest diff against the former useAuth Stage 2 effect..." (see `app/(authed)/layout.tsx` header JSDoc).

### Staging of Stage 2 effect removal

**Chosen:** Remove Stage 2 effect body in Task 2 commit (alongside Stage 1 relocation), land Stage 2 owner in Task 3.

**Rationale:** The Stage 2 effect body referenced `stage2Ref` and `stage2Gate` which I was tearing out in the same pass as `stage1Ref`. Splitting the ref removal across Task 2 and Task 3 would require an interim `stage2Ref` declaration that's immediately dead — violates "smallest change" and leaves a broken intermediate state. The D-12 harness `createTestHarness()` calls `subscribeToAllTables()` internally (not useAuth's Stage 2 effect), so it still runs green between Task 2 and Task 3. Live browser traffic between commits is the only exposed surface, and those commits land seconds apart in the same plan execution. No partial-state risk.

### GameDataProvider log style

**Chosen:** Single mount log + single "all 7 tables ready" log. No per-table readiness spam.

**Rationale:** Matches the existing file's convention (no existing per-table logs) and the plan's "executor picks the simpler form that matches the file's existing convention" guidance. The `readyLoggedRef` ensures the ready log fires exactly once (not every render).

## D-14 Five-Point Behavior-Preservation Checklist

The plan's D-14 manual runtime checklist lists 5 behaviors that must hold post-reshuffle. Evidence for each below. Items 1, 4, 5 are asserted by code inspection against the D-12 harness; items 2, 3 are asserted by structural preservation of the useAuth internals.

1. **Anonymous visitors receive zero `User` directory rows at any layer.**
   - **Evidence (harness-asserted):** `test/backend/auth/auth-subscriptions.test.ts` Test 1 `anonymous visitor (no auth call) — Stage 1 only, zero User rows in cache` — 1/1 green. Anon caller subscribes only to `view_my_profile`, never to `SELECT * FROM user`; `conn.db.User.iter()` returns `length === 0`.
   - **Code evidence:** `app/(authed)/layout.tsx` is the ONLY subscriber to the User table in the frontend (`grep -rn "SELECT \* FROM user" app/ components/`) — and it only mounts for authed routes per Next.js App Router semantics.

2. **Returning authed users have `view_my_profile` hydrated at layer-0 on connect — no visible delay on first paint.**
   - **Evidence (structural):** AuthProvider's Stage 1 effect fires on `isActive` change (same trigger as 15.5), mounts inside `providers.tsx` render tree BEFORE any page content renders. `onApplied` still calls `setProfileReady(true)` + `triggerReadProfile()` — identical semantics to the former `useAuth.ts:79-84` lines.

3. **`guestLoginPending` drives the login-button inline spinner ONLY. Does not bleed into `isLoadingData` / `isWaitingForData` / `isConnecting` / `isLinkingDiscord`.**
   - **Evidence (structural):** `useAuth.ts` line 294 `isLinkingDiscord` composition and line 299 `isWaitingForData` composition unchanged. `guestLoginPending` remains a separate state (line 51) with its own reactive `setGuestLoginPending(false)` cleanup effect at lines 284-292 (preserved verbatim). `authState` composition (lines 302-309) does NOT reference `guestLoginPending`. `loginGuest` callback flow (lines 311-325) unchanged.

4. **`readProfileFromConnection` 3-fallback strategy still resolves via `view_my_profile` primary → `User.id.find` → `User.username.find` (guest) → `User.username.find` (session name).**
   - **Evidence (code):** `components/features/auth/hooks/useAuth.ts:85-163` — `readProfileFromConnection` body preserved byte-for-byte. PRIMARY view read at line 97, Strategy 1 at line 120, Strategy 2 at line 136, Strategy 3 at line 145. `readProfileRef.current = readProfileFromConnection` line 166 preserved.

5. **`onUserInsert` / `onUserUpdate` still fire on the authed subscription lifecycle (relocated but same role).**
   - **Evidence (code):** `app/(authed)/layout.tsx:78-89` — `conn.db.User.onInsert(onUserInsert)` + `conn.db.User.onUpdate(onUserUpdate)` with `isLiveChange` filter. Both callbacks call `auth.triggerReadProfile()` which forwards to `readProfileRef.current(conn)` — identical chain to the former `useAuth.ts:171-172`.

## D-33 Logging Audit

All bracketed-tag logs per D-33 are in place:

| Owner | Tag | Lifecycle moments logged |
|-------|-----|--------------------------|
| useAuth.ts | `[useAuth]` | Delegation log at top of hook + existing `[useAuth] View hit`, `[useAuth] Strategy 1/2/3 hit`, `[useAuth] No user found`, `[useAuth] guestLoginPending → true/false`, `[useAuth] Discord flow Step A/B`, `[useAuth] loginGuest/deleteGuestAccount failed` retained. |
| AuthProvider.tsx | `[AuthProvider]` | Stage 1 subscribing, onApplied, onInsert, onUpdate, cleanup — 5 logs. |
| (authed)/layout.tsx | `[authedLayout]` | Stage 2 skip (inactive), mount+subscribe, onApplied, onApplied dedupe-skip, onInsert, onUpdate, unmount — 7 logs. |
| GameDataProvider.tsx | `[GameDataProvider]` | mount + all-7-ready marker — 2 logs. |

## Deviations from Plan

**None** — plan executed exactly as written. All three tasks landed one atomic commit each, both executor-discretion choices were called out in the plan (RESEARCH Open Questions 1 + 2), build + typecheck + D-12 harness all green at every commit.

No Rule 1/2/3 auto-fixes triggered. No Rule 4 architectural decisions needed.

## Non-Standard Type Coercions Introduced

Zero new `as any` or `as unknown as` coercions in this plan.

- `ArchetypeRow` and `HsrCharacterArchetypeRow` follow the existing `rows as unknown as XxxRow[]` casting convention already present in `GameDataProvider.tsx` — no new pattern.
- `isLiveChange` callbacks accept `ctx: any` — matches the pre-refactor pattern in `useAuth.ts:87-90, 156-159`; no change.
- `currentUserRef.current` is typed as the `User | null` carried by `auth.user` — no coercion.

## Issues Encountered

None.

## Self-Check: PASSED

Verified files created/modified exist:
- `components/features/game-data/components/GameDataProvider.tsx` — FOUND (7 useTable calls, D-33 tags, context type extended)
- `components/features/auth/components/AuthProvider.tsx` — FOUND (Stage 1 effect, subscribedRef, isLiveChange)
- `components/features/auth/hooks/useAuth.ts` — FOUND (Stage 1 + Stage 2 effects removed, delegation log added, reader preserved)
- `app/(authed)/layout.tsx` — FOUND (Stage 2 effect, subscribedRef, AuthedLayout export)

Verified commits exist:
- `87e2ea5` — FOUND
- `d87e480` — FOUND
- `b2147e0` — FOUND

Verification gates:
- `npm run build` — exit 0 at every task commit
- `npm run test:typecheck` — exit 0 at every task commit
- `test/backend/auth/auth-subscriptions.test.ts` — 2/2 green at Task 2 and Task 3 commits (D-12 satisfied)

## Next Phase Readiness

- Plan 16-02 complete. Wave 2 remaining: Plans 16-03 (middleware) + 16-04 (service worker) — unblocked, parallel-safe.
- Plan 16-06 (docs + component hygiene) — now ready; depends on 16-02 for subscription-lifecycle doc updates to `docs/auth/architecture.md`.
- Phase 21 (auth polish) will extend `(authed)/layout.tsx` with `hsr_account` subscription + tri-state `AuthRequired` — the scaffolding this plan lays down directly enables that work.
- Phase 28 (lobby/match tier) will extend `app/(authed)/(match)/layout.tsx` (passthrough from 16-01) with match-tier subscriptions — independent of this plan.

---
*Phase: 16-route-global-foundation*
*Completed: 2026-04-19*
