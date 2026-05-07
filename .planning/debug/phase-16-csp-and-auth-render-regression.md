---
phase: 16-route-global-foundation
trigger: /gsd-verify-work 16 — Test 1 (cookie-less middleware redirect)
date: 2026-04-19
status: resolved (3 commits landed, Test 1 unblocked)
commits:
  - c6c3391 fix(16): dev CSP unsafe-eval gate for HMR + maincloud-only cleanup
  - 42994fa perf(16): collapse redundant auth reads + memoize useAuth return
  - c6ae014 test(16): UAT session — Test 1 blocker logged, port 3001→3000
---

# Phase 16 UAT — CSP blocker and auth-render regression investigation

Test 1 of the Phase 16 UAT ("cookie-less visit to authed path redirects to landing") could not run: the dev server hung at the IPC spinner in Firefox. Diagnosing the blocker surfaced two related Phase 16 regressions in the auth surface (D-33 refactor era). All three issues are fixed; the investigation also produced a reusable dataflow trace of the anon cold-load path.

## What triggered the investigation

`npm run dev` → visit `/` → Firefox console:
```
Uncaught EvalError: call to eval() blocked by CSP
Content-Security-Policy: "script-src 'self' 'unsafe-inline'" (Missing 'unsafe-eval')
```
App never finishes loading.

## Issues found

### 1. CSP breaks `next dev` (WR-04 over-reach)
- **File:** `next.config.ts`
- **What WR-04 did:** dropped `'unsafe-eval'` from `script-src` unconditionally with the comment "modern Next prod builds do not require eval()".
- **What was wrong:** headers are applied to dev + prod alike. React Fast Refresh and webpack HMR use `eval()` — `next dev` cannot run without `'unsafe-eval'` in the CSP. Firefox enforces CSP strictly and halts hot chunks.
- **Fix:** `const isDev = process.env.NODE_ENV === 'development'` + template-literal gate on the directive. Prod keeps WR-04 intent (strict CSP, no eval). Dev gets the minimum needed.

### 2. Three redundant "No user found" reads per anon cold-load
Each render that fired the readProfileFromConnection path did a fresh sequence of local-cache lookups (view_my_profile.iter, User.id.find, User.username.find) and clearSessionCookie, even though nothing had changed since the previous attempt. Three fires meant ~30-50 unnecessary local operations on every anon page load.

Two compounding causes:

**2a. `useAuth.ts:169` useEffect listed `readProfileFromConnection` as a dep.**
That callback's own deps include `session`, which next-auth regenerates on every status transition even when the payload is identical. Effect re-invalidates → re-fires → redundant read.
- **Fix:** Use `readProfileRef.current(conn)` in the effect body (the ref is already assigned on every render on line 166) and drop `readProfileFromConnection` from the effect deps. The effect now only fires on genuine state transitions; the latest reader is always called via the ref.

**2b. `AuthProvider.onApplied` called both `setProfileReady(true)` AND `triggerReadProfile()`.**
- `setProfileReady(true)` flips a useEffect dep → useEffect reads profile.
- `triggerReadProfile()` calls the reader directly.
- Result: two reads per subscription-apply.
- **Fix:** Drop `triggerReadProfile()` from onApplied. `setProfileReady(true)` alone drives the read via the useEffect. `triggerReadProfile()` is still needed in `onInsert`/`onUpdate` (those fire when profileReady is already true, so the useEffect wouldn't re-run).

### 3. Context-value cascade — 9 consumers re-rendering on every AuthProvider render
`useAuth()` returned a freshly-constructed object literal on every render. `AuthProvider` passed it as `value={auth}` to `AuthContext.Provider`. New object ref → React notifies **every** useAuthContext consumer even when semantic values are unchanged.

On every upstream-provider cascade (WebSocket handshake pumps, session loading → unauthenticated, etc.), all 9 consumers would re-render:

- `components/globals/layout/NavBar.tsx`
- `components/features/auth/components/AuthRequired.tsx`
- `components/features/auth/components/DeletionBanner.tsx`
- `components/features/profile/components/DiscordLink.tsx`
- `components/features/profile/hooks/useProfile.ts`
- `components/features/admin-view/components/TableExplorer.tsx`
- `app/(authed)/admin-view/layout.tsx`
- `app/(authed)/layout.tsx`
- `app/(public)/teambuilder/page.tsx` (calls useAuth directly, not useAuthContext — still affected)

**Fix:** Wrap `useAuth`'s return in `useMemo`, listing each semantically meaningful value as a dep. Now the context ref is stable when auth state is unchanged, so consumers skip re-render during upstream churn.

### 4. Diagnostic log was not diagnostic (collateral cleanup)
`useAuth.ts:42` had a static `console.log('[useAuth] subscription ownership delegated to AuthProvider + (authed)/layout.tsx')` — identical text every render. It acted as a mute render counter rather than a diagnostic, and the user (correctly) pushed back on calling it "just noise": logs ARE signals of work.
- **Fix:** Replaced with structured log carrying `{ isActive, idShort, profileReady, nextAuthStatus, hasUser }`. Each line now names the state change that triggered the render. Enabled the subsequent analysis in this doc.

## What we did NOT fix (SDK-level, accepted)

The remaining 4-render cluster while `isActive:false` is driven by the SpacetimeDB SDK's `ConnectionManager.updateState` pattern:

```js
// node_modules/spacetimedb/dist/react/index.mjs:1545-1548
const updateState = (updates) => {
  managed.state = { ...managed.state, ...updates };  // new object ref every call
  this.#notify(managed);                              // always fires listeners
};
```

The SDK uses `useSyncExternalStore` (React 18's correct pattern for external state) but does not check whether the new snapshot differs from the previous one before notifying. Result: re-renders fire even for semantically no-op updates during connection setup (retain, initial identity pending, etc.).

Options considered and rejected:
- **Fork/patch the SDK.** Lost on `npm install`. Not worth it.
- **Wrap `useSpacetimeDB()` in a project-local memoizer.** Would stabilize downstream consumers but not AuthProvider itself (it directly consumes the context). Marginal net win.

Accepted as library behavior. StrictMode doubles it further in dev; disappears in prod.

## Measured impact on anon cold-load of `/`

| Metric | Before | After |
|--------|--------|-------|
| `useAuth` renders | 12 | 9 |
| `No user found` fires | 3 | 1 |
| Context cascade to 9 consumers | every AuthProvider render | only on semantic change |
| Dev server loads in Firefox | hangs | works |

## Reference: anon cold-load dataflow trace

Useful for future debugging. Provider tree:
```
SessionProvider (next-auth)
  └── HeroUIProvider
      └── SpacetimeDBProvider
          └── AuthProvider (calls useAuth → logs render)
              └── GameDataProvider (7 useTable)
                  └── children
```

Each `[useAuth] render` = one AuthProvider re-evaluation.

| Phase | Log(s) | Dataflow |
|-------|--------|----------|
| A. Initial mount | `[useAuth] render` ×2 (isActive:false, loading) | Providers tree mounts top-down. `useSyncExternalStore` returns `fallbackStateRef.current`. `useSession()` returns `{ status: 'loading' }`. StrictMode doubles render. |
| B. Child effects commit | SafariWarning mount / ViewportWriter cookie write / GameDataProvider mount / WS connecting / SW skip | Effects run post-commit. `ViewportWriter` writes `vp=desktop` for SSR hydration match. `SpacetimeDBProvider.useEffect` calls `ConnectionManager.retain` → `builder.build()` → WebSocket CONNECT frame sent. |
| C. SDK external-store pumps | `[useAuth] render` ×4 (isActive:false, loading) | `ConnectionManager.updateState` fires during retain with all-falsy initial values. Each call notifies → new snapshot ref → useSyncExternalStore re-renders. Plus StrictMode. **The SDK-level waste.** |
| D. next-auth resolves | `[useAuth] render` ×2 (nextAuthStatus: "unauthenticated") | `SessionProvider` internally fetches `/api/auth/session`; no session cookie → resolves to unauthenticated. First semantically meaningful transition. |
| E. WS connects | `Connected to SpacetimeDB with identity: ...` + `[useAuth] render` ×2 (isActive:true, idShort set) | WS `Identity` frame arrives. `providers.tsx onConnect` writes token to localStorage. `ConnectionManager.onConnect` calls updateState with real values. |
| F. Subscriptions attach | `Stage 1 subscribing` / `all 7 tables ready` / `Stage 1 onApplied` | `useViewMyProfileSubscription.useEffect` registers `subscribe('SELECT * FROM view_my_profile')`. Parallel: 7 `useTable` subscriptions. Server filters `view_my_profile` by `ctx.sender` → 0 rows for anon. `SubscribeApplied` frame returns. |
| G. profileReady flips | `[useAuth] render` ×2 (profileReady:true) + `No user found` | `setProfileReady(true)` commits → useAuth re-renders → useEffect at line 169 fires → `readProfileRef.current(conn)`. Reader runs 4 local-cache lookups: `view_my_profile.iter` empty, `localStorage.spacetimedb_user_id` null, `User.username.find('Guest_c20075f3')` miss, `session.user.name` undefined → no-user path. |
| H. Tail | `[useAuth] render` ×2 | `setProfileReady(true)` (no-op) + `setCurrentUser(null)` (no-op) + StrictMode double. |

Final steady state for anon visitor:
- `isActive: true, identity: c20075f3…, profileReady: true`
- `nextAuthStatus: unauthenticated, hasUser: false`
- Derived: `isOrphanedIdentity: true` → UI shows LOGIN button

## Collateral file changes (maincloud-only cleanup)

User noted during the port-3001 detour that multiple parts of the project still reference a local SpacetimeDB server that does not exist in this setup (project publishes to maincloud only, `spacetime.json` server is `maincloud`, `*** maincloud` is the CLI default).

Cleaned during this session:
- `next.config.ts:5` — comment about "Use port 3001 to avoid conflict with SpacetimeDB on port 3000" (removed; port 3000 is free, no local STDB)
- `.planning/phases/16-route-global-foundation/16-RESEARCH.md:1058` — "Local SpacetimeDB fallback: `npm run spacetime:publish:local`" (removed; script was also unused)
- `16-HUMAN-UAT.md` — all `localhost:3001` → `localhost:3000` (npm run dev defaults to 3000)

Memory also saved: `memory/feedback_maincloud_only_no_local_spacetime.md` — future sessions should not suggest running a local SpacetimeDB server or recommend port-3001 workarounds.

Not cleaned (out of scope unless explicitly authorized):
- `package.json:16` — unused `spacetime:publish:local` npm script (user chose not to touch this in this session)
- Archived phase artifacts (`.planning/milestones/v0.5-phases/`, prior phase dirs) — immutable history

## Unrelated noise explained (for reference)

`Source map error: installHook.js.map 404` with resource URL `http://localhost:3000/<anonymous code>` — this is the Firefox React DevTools browser extension injecting `installHook.js` into every page. Firefox synthesizes the `<anonymous code>` URL for inline-injected code; it then tries to fetch the nonexistent sourcemap and logs a 404. Not our code; Chrome silences the same error; safe to ignore.

## Outcome

UAT Test 1 unblocked. Dev server loads cleanly. Auth state resolves to anon with one read cycle. Ready to resume middleware redirect verification in `16-HUMAN-UAT.md`.
