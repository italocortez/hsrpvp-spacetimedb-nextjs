---
id: SEED-001
status: dormant
planted: 2026-04-17
planted_during: Phase 15.5 — auth-gated user subscription (execution)
trigger_when: Phase 17 (Cost tables — data / global public subs) or Phase 21 (Authed base layer — minimal user + hsr_account subs) discuss-phase
scope: Medium
---

# SEED-001: Layered subscription dedupe pattern — lessons from Phase 15.5

## Why This Matters

Phase 15.5 introduced the **layered subscription pattern** (anon-safe Stage 1 primer + auth-gated Stage 2 full data) for the first time, on `useAuth`. Applying this pattern naively to future phases will repeat design mistakes we had to fix live during UAT:

1. **The SDK auto-persists an anonymous identity token on first connect.** The `.onConnect` callback in `app/providers.tsx` writes the token to `localStorage[SPACETIMEDB_TOKEN_KEY]` for every client — even anon visitors. So `!!localStorage.getItem(SPACETIMEDB_TOKEN_KEY)` does NOT mean "has authenticated before" — it means "has connected before." Using it as a gate signal leaks the auth-gated subscription to anon visitors. The correct signals for "has authenticated" are:
   - `localStorage[USER_ID_KEY]` (only written inside `setResolvedUser` after a real User row resolves)
   - The `stdb_session` cookie (same lifecycle as USER_ID_KEY)
   - Live `currentUser` state (after this session's resolve)

2. **When two subscription stages converge on a shared resolver, you need signature-based dedupe** to prevent redundant state updates. Without it, both Stage 1 and Stage 2 `onApplied` trigger the resolver, which calls `setCurrentUser` twice, which fires the `useEffect([currentUser])` clearing effect twice — benign but noisy in logs and wasteful of renders.

3. **Dedupe implementations coupled across two functions are a future-trap.** The dedupe's field-comparison list must include every field that the state-setter copies out of the row. Miss one and a live update affecting only that field gets silently dropped by the dedupe. Single source of truth beats two parallel field lists.

## When to Surface

**Trigger:** Phase 17 (Cost tables — data / global public subs) or Phase 21 (Authed base layer) discuss-phase.

This seed should be presented during `/gsd-new-milestone` or `/gsd-discuss-phase` when the phase scope matches any of:
- Adding new SpacetimeDB subscriptions in React hooks or providers
- Introducing an anon-safe "primer" subscription + auth-gated "full" subscription pattern
- Touching `app/providers.tsx` onConnect behavior or localStorage token handling
- Designing a shared resolver that multiple subscription callbacks feed into (like `useAuth.readProfileFromConnection`)

## Scope Estimate

**Medium** — Not a new phase itself; a design-time consideration that affects how Phase 17 and Phase 21 are planned. Avoids 2–3 UAT cycles of the exact issues we hit in Phase 15.5 (gate leak, double-resolve, redundant state updates).

## Design Rules (apply at planning time)

**Rule 1 — Default to disjoint-state ownership.**
Each subscription stage writes to its own slice of derived state. Example for Phase 17 / 21:
- `useAuth` writes to `currentUser` (keep as-is)
- Future `useLobbies` writes to lobby-related state
- Future `useHsrAccounts` writes to hsr-account state
- No cross-writing. SpacetimeDB client cache is PK-keyed — overlapping rows between queries are reconciled transparently at the cache layer. **No hand-written dedupe needed** in this common case.

**Rule 2 — Apply signature-based dedupe only when stages must converge on a shared resolver.**
`useAuth` is unusual: Stage 1 (`view_my_profile`) and Stage 2 (`User`) both deliver the caller's own row and both `onApplied` callbacks feed into the same resolver that writes `currentUser`. Stage 2 is intentionally a fallback rescuer (orphan / returning-user path where `view_my_profile` may be empty).

If a future stage pair has the same shape:
- Define a module-level `extractSignature(row)` helper as single source of truth
- The helper MUST include every field copied into derived state (miss one → live updates silently dropped)
- **Use a BigInt-safe JSON replacer.** SpacetimeDB timestamp columns (lastLoginAt, deletedAt, etc.) are `bigint` at the SDK layer, and `JSON.stringify` throws on BigInt with no replacer. Use `JSON.stringify(obj, (_k, v) => typeof v === 'bigint' ? v.toString() : v)`. This bit us mid-UAT in Phase 15.5 (commit `aad6b06`).
- Store the last-resolved signature in a `useRef<string | null>(null)`
- At every resolver call site: `if (sigRef.current === newSig) return; sigRef.current = newSig; /* ...log + setState */`
- Reset the ref in cleanup paths (logout, delete, "no user found" / null-user transitions)

**Rule 3 — Gate signals must be post-auth-only.**
Never use `SPACETIMEDB_TOKEN_KEY` as "has authenticated." Use:
- `USER_ID_KEY` in localStorage (written by `setResolvedUser`, cleared by logout/delete)
- `stdb_session` cookie (same lifecycle)
- Live `currentUser` state

For Phase 21's AuthRequired / tri-state auth gate: the gate check should be `currentUser != null || hadUserIdOnMount.current || hadSessionCookie.current`, mirroring the pattern in useAuth after Phase 15.5's D-01 revision.

## Breadcrumbs

Reference implementation (Phase 15.5 output — stable at these paths):

- `components/features/auth/hooks/useAuth.ts` — `extractProfileSignature` helper (module scope), `resolvedSignatureRef` (line ~45), Stage 1 / Stage 2 `useEffect` blocks with ref guards, `stage2Gate` derivation
- `app/providers.tsx:12-20` — `onConnect` auto-persists token to localStorage (the source of the anon-token gate leak)
- `lib/spacetimedb.ts:5` — `SPACETIMEDB_TOKEN_KEY` definition
- `lib/session-cookie.ts` — `stdb_session` cookie helpers (set by `setResolvedUser`, cleared by logout/orphan-identity paths)

Phase 15.5 artifacts:
- `.planning/phases/15.5-auth-gated-user-subscription/15.5-CONTEXT.md` — D-01 (gate design), D-03 (spinner isolation)
- `.planning/phases/15.5-auth-gated-user-subscription/15.5-02-frontend-stage-split-PLAN.md` — detailed plan that introduced the pattern
- `.planning/phases/15.5-auth-gated-user-subscription/15.5-02-SUMMARY.md` — what actually shipped (includes the gate-signal swap, modal auto-close, signature dedupe not originally in the plan)

Commit trail (for context on what was learned mid-execution):
- `5002c1c` — auto-close login modal (NavBar `!isAuthenticated` guard)
- `790a39c` — swap gate signal token → userId (fix anon-token leak)
- `02d25c6` — Stage 2 onApplied closure dedupe (first pass)
- `6d73b5b` — signature-based dedupe in `readProfileFromConnection` (robust final version)

## Notes

Discovered during Phase 15.5 Plan 02 UAT Scenario 1 and Scenario 2. The plan's D-01 must_have said "no token" as part of the anon-visitor definition, which turned out to be architecturally impossible given the SDK's auto-persist behavior. The fix reinterpreted the signal correctly but the plan's literal wording should be reviewed if Phase 21's `AuthRequired` needs similar logic — don't copy D-01 verbatim, copy the post-fix semantic.

Also: when planning Phase 17's cost-table subscriptions, verify whether the anon-safe portion writes to the same state slice as an auth-gated portion. If yes → use signature dedupe. If they're disjoint (likely for cost data — it's all public read anyway) → no dedupe needed, just two independent subscriptions.
