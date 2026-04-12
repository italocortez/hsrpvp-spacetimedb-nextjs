# Pitfalls Research

**Domain:** Competitive gaming frontend — SpacetimeDB 2.1.0 + Next.js 15 App Router + React 19 + Spine WebGL 4.2 + dual-DOM (desktop/mobile)
**Researched:** 2026-04-12
**Confidence:** HIGH for stack-specific pitfalls (grounded in repo's own v0.9 strategy doc, memory feedback, Phase 12/13 incidents); MEDIUM for SDK-edge-behavior pitfalls (SpacetimeDB SDK 2.1 is young, docs are thin, some inferred from SDK source).

## Top 5 highest-impact pitfalls (ranked)

1. **Subscription-at-wrong-layer bandwidth leak** (bandwidth-budget killer; one bad placement eats the 102,500 energy/month ceiling — see P1)
2. **`(match)` layout prefetch double-fires under Strict Mode + client navigation** (kicks off an 80–100 MB Spine download twice — see P2)
3. **Pedestal WebGL disposal incomplete on draft end / route change / context loss** (GPU leak that accumulates across a play session — see P3)
4. **Historical tables subscribed above profile page scope** (unbounded growth, cross-user leak, violates Decision 8 — see P4)
5. **Service Worker intercepting app-origin or stale-URL assets in dev** (stuck SW after a production test breaks HMR for hours — see P5)

---

## Critical Pitfalls

### P1 — Subscription placed at the wrong layout layer

**What goes wrong:**
A subscription that only matters inside the `(match)` zone (e.g., `lobby_member`, `match_session_step`) gets placed in `(authed)/layout.tsx` or worse, `providers.tsx`. Now every authed user — including people who only visit profile, schedule, costs, or admin — pays egress for match data they never open. Symmetric mistake: a subscription that every authed page needs (e.g., `user`, `player_stats`) placed on `(match)/layout.tsx` resubscribes on every match-zone entry, multiplying initial-state bursts.

**Why it happens:**
- Drag-and-drop from v0.5 `useAuth.ts` (which currently owns `user` — see Decision 6, line 417) without re-evaluating placement.
- Copy-paste from a neighboring page-level hook without asking "where does the *highest* common consumer live?"
- Conflating "needed by this page" with "needed throughout this zone."

**How to avoid:**
- Enforce Decision 6's placement map as a contract — every new subscription's PR must name the exact layout file (`providers.tsx`, `(public)/layout.tsx`, `(authed)/layout.tsx`, `(authed)/(match)/layout.tsx`) or the page file, and justify why that layer is the highest common consumer.
- Before adding a subscription, run `node tools/energy-model.js --scenario growth` with the new row's estimate.
- Never subscribe at `providers.tsx` except: STDB connection, `view_my_profile`, and the six public reference tables (Decision 1 + Decision 6).
- Historical tables (`match_result*`, `mmr_history`, `match_*_history`) are **always** profile-page-scoped via `view_my_*` (Decision 8). Never subscribe these at any layout.

**Warning signs:**
- Energy-model output jumps >20% after a subscription addition.
- A subscription's `consumer` list in its PR crosses zone boundaries.
- Any non-profile page reads from a historical table.
- `grep` for `match_result\|match_session_step` outside `(match)` zone or profile page returns hits.

**Phase to address:**
Phase 2 (route migration) locks in `(authed)/layout.tsx` as the owner of the `user` table. Phase 4 (authed tier) and Phase 5 (match zone) must each PR-review against Decision 6's placement map. Every subsequent phase inherits the discipline.

---

### P2 — Spine prefetch fires twice under React 19 Strict Mode + client navigation

**What goes wrong:**
`ensureSpinePrefetchStarted()` is called from `(match)/layout.tsx`'s `useEffect`. In dev, Strict Mode runs the effect twice (mount → cleanup → mount). Two Web Workers spawn. Each fetches the full 80–100 MB Spine asset set. In prod, fast client-side navigation (`/lobby/5` → `/draft/20` — both under `(match)`, but if the user bounces through a parent, e.g. `/lobby/5 → /profile → /lobby/7`, the layout unmounts and remounts) restarts the prefetch. Users on modest connections see network saturation mid-draft.

**Why it happens:**
- Developers write the effect body assuming single invocation.
- The singleton guard is implemented per-instance (`useRef`) instead of module-level.
- Abort logic on cleanup is missing, so the first worker keeps fetching even after the remount started a second one.

**How to avoid:**
- `ensureSpinePrefetchStarted()` must be a **module-level** idempotent singleton (per Decision 2, line 132 — "module-level singleton"). State lives outside React's lifecycle. First call starts the worker; subsequent calls return immediately. Do not use `useRef` / component state for the guard.
- Guard order (Decision 2): `isRunning || isComplete` → `getRenderTier() === 'image-only'` → storage-quota check → `saveData` check → spawn.
- The worker itself must be idempotent on duplicate URL lists (dedup before `fetch`).
- Cleanup should **not** abort an in-flight prefetch — the SW cache is the destination regardless of which component started the download.

**Warning signs:**
- DevTools Network tab shows Spine assets requested twice on a single navigation.
- Worker count in `chrome://inspect` > 1 for the asset preloader.
- `navigator.storage.estimate()` usage grows faster than expected on dev.
- Console warnings about "singleton already initialized" appearing repeatedly.

**Phase to address:**
Phase 3 (public tier — portrait prefetch sets the singleton pattern). Phase 5 (match zone — Spine prefetch trigger) inherits it. Both phases must include a Strict Mode double-mount regression test. Risk callout in strategy doc line 826 makes this explicit.

---

### P3 — Pedestal WebGL context / AssetManager not disposed on every unmount path

**What goes wrong:**
Draft pedestal holds a live WebGL context, an RAF loop, and a Spine `AssetManager`. If any unmount path fails to dispose, the GPU resources leak. Paths that commonly miss disposal: route change via `router.push`, browser back button, draft-end `matchSession.stage` transition, tab close without beforeunload, WebGL context loss event, and — subtly — Strict Mode's first-mount cleanup. Over a 2-hour tournament session, a leak of one context every 10 picks (Spine re-init without disposing the old one) burns through WebGL's ~16 context browser limit → subsequent canvases fail to initialize → pedestal goes blank.

**Why it happens:**
- `useEffect` cleanup only handles "component unmount" but draft-end is a **state change**, not unmount. Pedestal keeps rendering on stale data or holds resources for a canvas that's no longer visible.
- `assetManager.removeAll()` is called but `assetManager` reference is retained (closure keeps it alive), so Spine's internal GPU buffers stay bound.
- Decision 3's single-canvas layering is violated: a developer adds a second canvas for "just this one transition effect," doubling the context count.
- `webglcontextlost` handler exists but `webglcontextrestored` doesn't re-init cleanly, leaving a zombie canvas.
- The `skeleton.scaleY = -1` hack (noted as a known issue in Decision 3, line 283) masks a deeper camera-projection bug that can cause GPU state corruption on certain driver versions.

**How to avoid:**
- Lifecycle matrix from Decision 3, line 266 is the spec — implement **every row** (mount, update, unmount, hidden, visible, contextlost, contextrestored) with a disposal test.
- Single-canvas invariant: assert exactly one `canvas.spine-canvas` per document via `MutationObserver` in dev; fail loud if two appear.
- Dispose order: (1) cancel RAF, (2) `assetManager.removeAll()`, (3) null out references, (4) lose context deliberately via `WEBGL_lose_context.loseContext()` on unmount (releases GPU resources faster than GC).
- Do not retain the `AssetManager` instance across pick transitions — create a fresh one per character.
- `skeleton.scaleY = -1` is a known-bad workaround. Phase 6 discussion must either fix the camera projection or document why the flip is acceptable and test complex animations (skinning) explicitly.
- Add an integration test that mounts pedestal → simulates 20 pick transitions → unmounts → asserts WebGL context count returned to zero.

**Warning signs:**
- `performance.memory.usedJSHeapSize` grows monotonically during a draft session (GC doesn't reclaim).
- "WARNING: Too many active WebGL contexts" in browser console.
- Pedestal renders correctly the first N picks then fails silently.
- `chrome://gpu` shows rising "WebGL contexts" count per tab.
- Black / white flashes on pick transitions that weren't there at the start of the session.

**Phase to address:**
Phase 6 (draft and pedestal). Risk callout in strategy doc line 827 explicitly flags this: "Disposal must be complete on every unmount path... to avoid GPU resource leaks across a session."

---

### P4 — Historical tables subscribed at a layout layer or cross-user

**What goes wrong:**
A developer adds match history to the profile page quickly via `(authed)/layout.tsx` "because it's convenient to have everywhere." Suddenly every authed user is paying for `match_result`, `match_result_game`, `match_result_participant`, `mmr_history`, `match_session_history`, `match_session_step_history` — tables that grow unbounded over platform lifetime. At ~5k users × 500 lifetime matches × ~6 related rows per match × cross-user visibility, the authed-tier payload blows past the 102,500 energy ceiling. Secondary failure: cross-user profile accidentally subscribes to target user's history, violating Decision 8's privacy rule.

**Why it happens:**
- Decision 8 is a privacy + bandwidth rule simultaneously; developers who only read the bandwidth part skip the "self-scoped via `view_my_*`" requirement.
- The `view_my_match_history` view (backend pre-req) is not yet implemented when the frontend phase starts, so a shortcut subscribes to the raw table "temporarily" and it sticks.
- "Cross-user profile" route (`[userId]/page.tsx`) naively reuses the owner profile's subscription code.

**How to avoid:**
- Historical tables are `public: false` server-side and **only** exposed through `view_my_*` views filtered by `ctx.sender` (Decision 8, line 724). Raw table subscriptions from the client must be impossible — verify in Phase 1 (backend pre-work) that the tables stay private.
- `(authed)/profile/page.tsx` is the only file allowed to subscribe to `view_my_match_history` / `view_my_mmr_history` / `view_my_session_history` / `view_my_participant_history`. Enforce via ESLint rule or a grep check in CI.
- Cross-user profile (`[userId]/page.tsx`, Decision 8 line 742) subscribes to **zero** additional tables — it reads already-subscribed authed-tier data filtered by URL param. PR review: if `[userId]/page.tsx` has a `subscribe()` call, reject.
- `view_my_*` backend views must explicitly filter on `ctx.sender`. Add a test that spoofs a different identity and asserts zero rows returned.

**Warning signs:**
- Authed-tier initial-state payload > 1 MB (profile-scoped data leaking up).
- Energy model shows historical tables consuming > 10% of budget.
- A second user's matches appear in your client cache when you visit their profile.
- `docs/views/` does not include all four `view_my_*` historical views.

**Phase to address:**
Phase 1 (backend pre-work — implement `view_my_*` views with `ctx.sender` filter + tests). Phase 4 (authed tier — profile page scope). Phase 7 (polish — cross-user profile, must not regress).

---

### P5 — Service Worker stuck from a production test, stale CDN cache, or registration race

**What goes wrong:**
Three related failure modes:
(a) Developer runs `NEXT_PUBLIC_ENABLE_SW=true npm run dev` to test SW caching, forgets to unregister, opens `localhost:3000` next morning in normal `npm run dev` → SW still alive, intercepting asset requests, serving stale bundles, HMR broken.
(b) Asset CDN URL on a character changes (UploadThing regenerates URL). SW cache key is the URL — stale asset serves forever because `fetch` hits cache first. Reference data updates via STDB subscription but assets don't.
(c) SW registration is async and not awaited on first navigation. First page load fetches assets directly from CDN (fine). Second load: SW now registered, but a `fetch()` raced between registration and interception returns the uncached response while SW expected to handle it, causing a double-fetch.

**Why it happens:**
- Gating via `NEXT_PUBLIC_ENABLE_SW` (Decision 2 line 200) opts in but doesn't opt out — the SW lingers until explicitly unregistered or cache cleared.
- Decision 2's cache strategy is cache-first forever (`Cache-Control: immutable`), which is correct for content-addressed CDN URLs but assumes URLs never reuse for different content. UploadThing URLs include content hashes, but Imgur-style URLs don't — confirm hosting guarantees.
- SW registration doesn't block first navigation by design; developers assume it does.
- Mobile Safari (out of scope per strategy doc line 55) has its own SW quirks — defensive gating keeps it out.

**How to avoid:**
- Add a dev-mode `unregister-sw.html` page at `/dev-unregister-sw` that calls `navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister()))`. Document it in `README` under "SW stuck? visit this URL."
- On mismatch between `NODE_ENV` and an active SW (prod SW running in dev context), proactively unregister on provider mount.
- CDN must use content-addressed URLs (UploadThing does via `ufs.sh` paths). If a character's asset changes, the URL changes, the cache key changes, no stale serve.
- Bump `CACHE_NAME` (`hsr-assets-v1 → v2`) on any URL-correction event — forces eviction on next activate (Decision 2 line 196).
- On SW registration, `await navigator.serviceWorker.ready` before triggering the portrait prefetch — eliminates the race.
- Verify on Vercel preview deploys (Open Question #4 reminder, strategy doc line 790) that SW actually registers in prod.
- Asset-host allowlist in `sw.js` (`ASSET_HOSTS`) must only match asset CDN hostnames — never app origin. Prevents stuck-bundle issues entirely.

**Warning signs:**
- HMR stops working in dev; `console.log` edits don't appear.
- `Application > Service Workers` in DevTools shows an SW from a different port or origin than current tab.
- Character portrait shows an old image after an admin edit.
- First-load network waterfall shows duplicate asset requests.
- `chrome://serviceworker-internals/` lists multiple SWs for `localhost:3000`.

**Phase to address:**
Phase 3 (public tier — SW and Web Worker implementation). Must include: dev unregister path, `CACHE_NAME` versioning doc, preview-deploy smoke test. Phase 5 (match zone — Spine tier) reuses the same SW; must not add its own SW.

---

### P6 — Token refresh / auth desync on page refresh and cross-tab

**What goes wrong:**
User refreshes mid-session: STDB token in `localStorage` is replayed, WebSocket reconnects, subscriptions re-establish — but there's a window where `view_my_profile` has 0 rows (still authenticating) and `<AuthRequired>` redirects to login. User is bounced mid-draft. Secondary: user links Discord in Tab A while Tab B has the lobby open; Tab B's cached display name is stale, cursor broadcasts under old identity. Tertiary: `stdb_session` cookie and the STDB token go out of sync (cookie set, token cleared, or vice versa) — NavBar shows logged-in name while WebSocket is unauthenticated.

**Why it happens:**
- Auth resolution in the current app depends on `view_my_profile` returning a row (strategy doc line 402) — but there's no explicit "authenticating" intermediate state separate from "logged out."
- `<AuthRequired>` fires its redirect before the subscription's first callback lands.
- Cookie is set on login, cleared on logout, but is not kept in sync with the token on refresh — if `localStorage` is cleared out-of-band (dev tools, browser storage clear), the cookie survives and lies about auth state.
- No `BroadcastChannel` coordination across tabs. Discord-link success in Tab A doesn't tell Tab B "re-read your identity."

**How to avoid:**
- Tri-state auth in `useAuth.ts`: `'connecting' | 'authed' | 'anon'`. `<AuthRequired>` must wait on `'connecting'` with a fallback UI (skeleton, NOT a redirect).
- Use the `hadSessionCookie` ref pattern from the memory feedback (`feedback_session_cookie_pattern.md`) — suppresses LOGIN button during connect.
- On every STDB connection event, reconcile: if token present but no `view_my_profile` row after N seconds + M retries, treat as anon, clear cookie.
- On logout, clear cookie AND localStorage token AND call `conn.disconnect()` before navigating. Order matters — if you redirect first, the next page mounts against a stale connection.
- Add a `BroadcastChannel('hsr-auth')` in `providers.tsx` so Discord link / logout events propagate across tabs. Minimal scope: reload the page on `logout` or `identity-changed` events.
- Middleware cookie check (Open Question #2, strategy doc line 786) is a UX optimization, not a trust boundary — real auth is at the reducer level.

**Warning signs:**
- "Flash of login page" on F5 while authed.
- Stale display name persists after Discord link in a second tab until manual refresh.
- Dev-tools: clear `localStorage`, refresh → cookie-backed NavBar shows old user; WebSocket shows unauthenticated.
- `<AuthRequired>` redirects log ever-increasing "redirect loop suspected" warnings.

**Phase to address:**
Phase 2 (route migration — `useAuth.ts` changes, move `user` subscription out). Phase 4 (authed tier — tri-state handling, `<AuthRequired>` fallback UI, Discord link cross-tab). Open Question #2 resolution happens in Phase 4 discussion per strategy doc line 786.

---

### P7 — Cursor / chat / pick-ban broadcast storm or desync

**What goes wrong:**
Cursor broadcast reducer is called on every mouse-move (60Hz × 20 users = 1,200 events/sec in a busy lobby). Reducer calls are cheap on egress compared to subscription bursts, but 1,200/s chokes the single-threaded STDB connection, delays pick/ban state updates, causes visible jitter. Secondary: chat messages arrive out-of-order because each message is a separate subscription event delivered per-row; the client must use `createdAt` for ordering, which breaks if multiple messages land in the same transaction (identical timestamp). Tertiary: pick/ban "draft" state — optimistic UI shows pick immediately, server rejects (e.g., character already banned), client has to roll back, user sees a ghost.

**Why it happens:**
- Cursor coordinates are broadcast unthrottled. No `requestAnimationFrame`-paced batching.
- Chat renderer sorts by `createdAt` only; ties are undefined order.
- Optimistic updates are stored in local React state without a "server-confirmed" marker. When server state diverges, the reconciliation logic is ad hoc.
- Disconnect / reconnect: subscription re-fetches initial state but local optimistic overlay persists, causing duplicate rows briefly.

**How to avoid:**
- Cursor reducer invocation: throttle at the client to ~30 Hz (Decision-doc-level choice — confirm during Phase 5). Consider `requestAnimationFrame` pacing with position delta threshold (skip if moved < 2 px).
- Chat ordering: sort by `(createdAt, messageId)` — `messageId` breaks ties deterministically. Backend already assigns IDs.
- Pick/ban: treat server state as source of truth. Render "pending" overlay on optimistic pick; roll back clears overlay without jank. Use `match_session_step` table's row appearance as the commit signal — don't inject local rows into subscription cache.
- On reconnect: drop all local optimistic state before re-subscribing. The subscription's initial-state burst will re-populate correctly.
- Disconnect handling per lobby config (existing Phase 10 backend) — UI shows "disconnected, T seconds to forfeit" banner, driven by server timestamps only (never `Date.now()` — could drift).

**Warning signs:**
- Picks feel laggy in lobbies with >10 people.
- Chat messages appear in wrong order (rare but noticeable during pick/ban bursts).
- "Ghost picks" that appear then disappear.
- Reconnect shows duplicate rows briefly.

**Phase to address:**
Phase 5 (match zone — lobby list, cursor foundation) for cursor throttle. Phase 6 (draft and pedestal) for pick/ban optimistic handling. Phase 7 polish revisits chat ordering if issues surface.

---

### P8 — Next.js 15 Server / Client Component boundary crossed with SpacetimeDB

**What goes wrong:**
A developer adds SpacetimeDB SDK import or `useSpacetimeDB` hook to a page that is (correctly for Next.js 15 defaults) a Server Component. Build fails. Developer "fixes" by slapping `'use client'` on the top-level layout, which propagates to the entire tree — now NavBar, landing page, cost tables all bundle client-side, `use client` bundle bloats, Vercel bundle size warning triggers. Secondary: developer tries to pre-fetch data in a Server Component via the REST-ish SpacetimeDB HTTP API and caches it, then passes to Client Component — violating Decision 1's "SpacetimeDB is the single data source" and creating a second data plane.

**Why it happens:**
- Next.js 15 defaults to Server Components; every stateful SDK consumer must opt in.
- Developers new to App Router don't distinguish between "page-level `use client`" (just this leaf) and "layout `use client`" (whole subtree).
- The temptation to cache reference data server-side on revalidate looks rational until you realize STDB subscriptions already propagate changes (Decision 1 rationale).

**How to avoid:**
- Only `use client` at the narrowest leaf that needs SDK access. Layouts stay Server Components by default.
- The STDB connection lives in `providers.tsx`, which **must** be `'use client'`. Every component that reads STDB data renders inside `<Providers>` via the client tree.
- Hard rule (Decision 1): no SSR data fetching of STDB data. No `fetch()` to a STDB HTTP endpoint in `page.tsx`. No `revalidateTag`. If you need data, subscribe.
- Bundle analyzer (`ANALYZE=true npm run build`) in CI; fail if client bundle > N KB threshold.
- Next.js 15's `params` and `searchParams` are now async (Next 15 App Router change). Update every `export default function Page({ params })` to `async function Page({ params }: { params: Promise<{ id: string }> })` and `await params`. Affects every dynamic route — `/lobby/[id]`, `/draft/[matchId]`, `/profile/[userId]`.

**Warning signs:**
- Build error: "You're importing a component that needs `useState`. It only works in a Client Component."
- `'use client'` appears at a layout rather than a leaf.
- Vercel warns about client bundle size growth.
- `params` accessed synchronously in a page component triggers a Next 15 warning.

**Phase to address:**
Phase 2 (route migration — every new layout and page gets the correct directive). Phase 3 onward must follow. Add a `grep` CI check: `'use client'` in a `layout.tsx` file triggers a warning review.

---

### P9 — Turbopack vs Webpack dev-prod behavior drift

**What goes wrong:**
Next.js 15 ships with Turbopack (stable for dev, beta for build). Developer runs `next dev --turbo`, everything works, ships to Vercel which builds with Webpack (or Turbopack build — depends on config). Subtle differences in module resolution (ESM vs CJS), `'use client'` detection, SW registration timing, or dynamic import boundaries cause prod-only bugs. Spine library, for instance, is ESM-only in recent versions — Turbopack handles it natively; a CommonJS-oriented setup may fail.

**Why it happens:**
- Turbopack's dev server is newer and doesn't mirror Webpack's quirks perfectly.
- Dev uses hot reload; prod uses minified bundles — tree-shaking can eliminate code paths that dev keeps.
- Turbopack's `server-only` / `client-only` enforcement is stricter than Webpack's.

**How to avoid:**
- Mandate Vercel preview deploys for every PR — catches prod-only bugs before main merge.
- Run `npm run build` locally at least once before submitting any phase SUMMARY.
- If a library fails only in prod, check its `package.json` `"exports"` field — ensure both `import` and `require` paths exist, or pin to ESM-only consumer.
- Pin Next.js and Turbopack versions explicitly in `package.json`. Avoid auto-updates mid-milestone.

**Warning signs:**
- Works in `npm run dev`, fails in `npm run build`.
- Works on dev, fails on Vercel preview.
- Spine / SDK module import error only in production build.
- `'use client'` warnings in prod build not seen in dev.

**Phase to address:**
Phase 2 (route migration — first build after structural change must pass). Every phase closeout (`/gsd-transition`) should verify `npm run build` clean.

---

### P10 — Dual-DOM hydration mismatch (SSR default vs client-detected viewport)

**What goes wrong:**
Project intent: separate desktop-DOM and mobile-DOM trees (per v0.9 scope — each UX phase has a deferred `XX.1` mobile counterpart). Server has no way to know viewport width at SSR time. Server defaults to desktop-DOM, client detects `matchMedia('(max-width: 768px)')` and swaps to mobile-DOM → hydration mismatch warning, flash of wrong DOM, lost scroll position, interaction handlers re-bound twice. Secondary: bundle ships both DOMs to every client (desktop users download mobile code and vice versa). Tertiary: mid-session rotation of tablet from portrait to landscape triggers a re-render between DOMs, losing all unsaved form state.

**Why it happens:**
- No server-side viewport detection (UA sniffing is unreliable, `Sec-CH-UA-Mobile` client hint is not universally supported).
- Dual-DOM is implemented as two component trees rendered conditionally based on `useMediaQuery` — which returns `undefined` on first render (SSR default) and the actual value after hydration.
- Route segments don't distinguish desktop / mobile (single set of routes rendering either DOM), so there's no natural code-splitting boundary.

**How to avoid:**
- Decision point that needs to land in the milestone: **dual-DOM architecture is a major commitment**. Before Phase 3, decide:
  (a) Dual-DOM via `matchMedia` + `suppressHydrationWarning` + `next/dynamic` `{ ssr: false }` for whichever DOM shouldn't render on server (simplest, ships both bundles).
  (b) Responsive single-DOM via Tailwind breakpoints (smallest bundle, most CSS complexity).
  (c) Dual route groups — `(desktop)` and `(mobile)` — with middleware-based redirect on viewport (cleanest code-split, breaks deep links).
  Strategy doc does not pick one — it's implicit that this is a design task during Phase 3 discussion. The milestone prompt explicitly notes this as a pitfall to call out.
- If going with (a): use `suppressHydrationWarning` only on the outer wrapper, not every child; use `useSyncExternalStore` for media queries (React 18+ pattern that avoids the hydration mismatch entirely); defer the mobile tree behind `next/dynamic(() => import('./Mobile'), { ssr: false })` to avoid server rendering it.
- Viewport rotation mid-session: persist form state to `sessionStorage` on every debounced change. Re-hydrate on DOM swap. Better: render both DOMs and toggle visibility via CSS (no unmount, no state loss) — but doubles DOM weight.
- Bundle duplication: accept it for phases 3-14 (v0.9 UX phases); revisit if bundle size becomes a user-visible problem.

**Warning signs:**
- React warning: "Hydration failed because the initial UI does not match what was rendered on the server."
- First paint is desktop, then flicks to mobile on a phone.
- Form state clears when user rotates tablet.
- Bundle analyzer shows `Mobile*` and `Desktop*` components in the same chunk.
- Lighthouse mobile score drops due to desktop-only imports loading on mobile.

**Phase to address:**
Phase 2 route-migration discussion must nominate the dual-DOM approach; Phase 3 (public tier) is where the first dual-DOM page ships (cost table has a mobile `.1` counterpart). Every `XX.1` mobile phase re-verifies the approach.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Subscribe-to-full-table "until we write the view" | Unblocks frontend phase when backend view isn't ready | Egress leak; sticks in code; violates Decision 1/8 | Never. Block the frontend phase on backend pre-work (Phase 1) instead. |
| `useRef`-based prefetch singleton instead of module-level | Works in isolated component tests | Breaks under Strict Mode + fast nav (P2) | Never. Module-level singleton only. |
| `skeleton.scaleY = -1` Y-flip | Quick visual fix for Spine pedestal | Masks camera projection bug; breaks skinning / lighting (Decision 3 line 283) | MVP only — must be tracked as a Phase 6 TODO and fixed before leaderboard / tournament polish. |
| Double-buffer Spine canvas for crossfade | "Hides" pick transition | Two live WebGL contexts (Decision 3 rejected this explicitly); GPU resource doubling; accelerates P3 | Never. Layered single-canvas model is the contract. |
| Cursor broadcast without throttle | Pixel-perfect cursor on dev laptop | Burns reducer call budget; causes pick/ban lag at lobby scale (P7) | Never. 30Hz throttle minimum. |
| `<AuthRequired>` redirect-on-zero-rows | Simple `if (!profile) redirect('/login')` | Flash-of-login-page on refresh (P6) | Never. Tri-state auth is required. |
| Synchronous `params` access in dynamic routes | Works until Next 15.1+ | Next.js 15 warning, future breaking change | Never. Migrate every page to async params. |
| Cross-user profile reuse of owner profile subscription code | Fast implementation | Subscribes to target user's history (privacy breach + bandwidth — P4) | Never. Decision 8 forbids. |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SpacetimeDB SDK 2.1 `subscribe()` | Not calling `unsubscribe()` or relying on GC; assuming sync removal | `unsubscribe()` is async; use `unsubscribeThen(cb)` when you need to act after removal; tie every `subscribe` to a `useEffect` cleanup. |
| SpacetimeDB reducer timestamps | Passing `BigInt(Date.now() * 1000)` | Use `Timestamp.now()` or `Timestamp.fromDate(new Date(...))` (per memory `reference_reducer_client_patterns.md`). |
| SpacetimeDB optional fields | Passing `undefined` | Pass `null`. `undefined` throws "Cannot convert undefined to a BigInt" on timestamps. |
| SpacetimeDB enum reducer params | Passing `'Admin'` for tagged union types | Check the generated binding: `__t.string()` takes a string; enum-typed params take `{ tag: 'Admin', value: {} }`. |
| SpacetimeDB reducer error pattern | Old `_then()` callback | `.catch()` pattern (Phase 12.2 SDK upgrade). Strategy doc line 129 + key-decision-table. |
| Discord OAuth via NextAuth | Expecting callback URL to Just Work on Vercel preview | Preview URLs are dynamic; whitelist `*.vercel.app` in Discord app OR use a middleware-based `returnTo` that validates against a known prefix. |
| Imgur uploads | Direct hot-link with no backoff | Imgur rate-limits; implement exponential backoff, fallback to Discord-bot storage (strategy doc line 285 plan). |
| UploadThing CDN | Assuming URLs are permanent | URLs include content hashes; confirm before relying on SW cache-forever headers. |
| `next/image` with UploadThing / Imgur | `<img>` everywhere | Use `next/image` with `remotePatterns` in `next.config.ts` for both `ufs.sh` and `i.imgur.com`. |
| FullStory Free tier | Firing events on every frame | 5,000 server-side events/month quota (strategy line 788). Sample deliberately. |
| `navigator.connection` | Trusting it in Firefox | Firefox has partial/variable support. Treat absence as "assume fine" (strategy doc line 520). |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Subscription at wrong layer (P1) | Energy model jumps on PR; initial state bursts on unrelated page mounts | Decision 6 placement map as PR contract | Immediately at ~100 concurrent |
| Spine prefetch storm (P2) | Double network download of 80-100 MB | Module-level singleton | Anyone with Strict Mode dev, anyone navigating fast in prod |
| WebGL context leak (P3) | `usedJSHeapSize` growing monotonically; "too many contexts" warning | Full lifecycle matrix + single-canvas invariant | Long tournament sessions (2+ hours) |
| Historical table creep (P4) | Profile data appearing in non-profile subscriptions | `view_my_*` enforcement + ESLint rule | Budget breach at ~500 active users × 500 matches each |
| Unthrottled cursor broadcast (P7) | Pick/ban lag in busy lobby | 30Hz rAF-paced throttle + delta threshold | Lobbies with > 10 participants |
| Rendering full subscription results in React list without virtualization | Frame drops at > 500 rows | `@tanstack/react-virtual` for leaderboard, match history list | Any list > ~500 rows |
| Reducer called from effect on every render | Reducer call storm; energy drain | `useCallback` + proper dep array; or move to event handler | Dev catches early but slips through in unfamiliar hooks |
| `user` table full replication at scale | 750 KB initial burst per client | Accepted (Decision 6 line 411 — required by design) | ~5k users is OK; at ~50k, revisit |
| Synchronous JSON parse of large subscription snapshots on main thread | UI jank on connect | Accept for v0.9; defer SDK-in-Web-Worker optimization (strategy doc line 767 explicitly out of scope) | At > 100 KB initial state per subscription |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting client-declared identity in reducer args | Impersonation; any user takes any action | `ctx.sender` is the only trusted principal (backend rule, always-in-context) |
| Subscribing to raw `user_private` / historical tables from the client | Data leak of private fields / cross-user history | Tables stay `public: false`; `view_my_*` filtered by `ctx.sender` (Decision 8 + Phase 12) |
| `stdb_session` cookie as auth trust boundary | Fake cookie grants access to UI that shouldn't render | Cookie is **display-only** (strategy doc line 420); real auth at reducer layer |
| Middleware redirect as security gate | Bypassed by API direct hits; not a trust boundary | Middleware is UX optimization (strategy doc line 786); STDB enforces reducer-level auth |
| Storing Discord OAuth tokens in localStorage | XSS → account takeover | NextAuth handles session; don't expose raw tokens to client JS |
| Admin reducers without role check | Any user deletes cost table rows | Role check via `ctx.sender` → `user_role` table at reducer entry (existing pattern — don't regress) |
| Tournament host trust | Host fakes match results | Per existing backend: results validated at reducer, not client claim |
| Chat content XSS | Injecting HTML via chat | Render chat as text, never `dangerouslySetInnerHTML`; strip / escape |
| Imgur URL validation | User pastes a phishing link as match screenshot | Validate URL pattern matches `imgur.com/...` image extensions; CSP allows imgur img-src only |
| CSP headers | No CSP → any injection is effective | Set strict CSP: `default-src 'self'`; explicit allowlist for `ufs.sh`, `imgur.com`, WebSocket origin |
| Service Worker origin scope | SW intercepts app-origin requests → stale JS | Scope SW to asset hostnames only (strategy doc line 200) |
| Error messages leaking data | Reducer errors echo PII | Error messages generic on reducer rejection; detailed logs server-side |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Flash of wrong DOM on first paint (P10) | Jarring; breaks deep links on mobile share | Decide dual-DOM approach before Phase 3; use `useSyncExternalStore` for media queries |
| Flash of login page on F5 (P6) | Appearing-logged-out on refresh | Tri-state auth (`connecting` | `authed` | `anon`) + skeleton fallback |
| Loading spinner during Spine asset fetch | Feels slow | Decision 3: portrait always underneath, acts as built-in loading state (line 279) |
| Pick/ban optimistic then rollback | "Ghost pick" confuses user | Render pending overlay explicitly; commit on server row arrival |
| Disconnect without explanation | User thinks app crashed | Banner: "reconnecting... T seconds" using server timestamps |
| Navbar showing login button during WebSocket connect | Logged-in user sees "Login" briefly | `hadSessionCookie` ref + `isWaitingForData` flag (memory feedback `feedback_session_cookie_pattern.md`) |
| Large initial subscription payload | "App frozen" on first load | Show layout skeleton; subscriptions fill in asynchronously |
| Safari user hits Spine feature | Broken draft experience | Image-only tier + dismissible warning banner (Decision 7) |
| Mid-rotation form state loss (P10) | Tablet user loses unsaved team | `sessionStorage` debounced persist, restore on DOM swap |
| Out-of-order chat messages (P7) | Confusing conversation flow | Sort by `(createdAt, messageId)` composite |
| Historical data showing for 0-match users | Empty state looks broken | Explicit "No matches yet — play your first match" empty state on profile |
| Bracket updates visible before match actually starts | Spoiler / confusing | Match zone subscription strategy: only active sessions, bracket visible per tournament phase |

---

## "Looks Done But Isn't" Checklist

- [ ] **Subscription lifecycle:** Mounted at correct layer per Decision 6 — verify with grep of every `conn.subscriptionBuilder()` call against the placement map.
- [ ] **Subscription cleanup:** Every `subscribe()` has a matching `unsubscribe()` in cleanup — no `unsubscribe` count lower than `subscribe` count after full route tour.
- [ ] **Strict Mode double-mount:** Component behaves correctly with `<StrictMode>` wrapping — no double prefetch, no doubled WebGL contexts, no doubled reducer calls.
- [ ] **Pedestal disposal matrix (Decision 3 line 266):** Every row implemented and tested — mount, update, unmount, hidden, visible, contextlost, contextrestored.
- [ ] **Historical view filter:** `view_my_*` returns zero rows for another identity (test with two identities).
- [ ] **Cross-user profile isolation:** `[userId]/page.tsx` subscribes to ZERO additional tables; verified by grep.
- [ ] **Next 15 async params:** Every dynamic route has `async function Page({ params })` + `await params`.
- [ ] **`'use client'` narrowness:** No `layout.tsx` has `'use client'` (except `providers.tsx`, which is the designated client-root).
- [ ] **Tri-state auth:** `<AuthRequired>` handles `'connecting'` state with skeleton, not redirect.
- [ ] **SW scope:** `sw.js` ASSET_HOSTS doesn't include app origin.
- [ ] **SW unregister path:** `/dev-unregister-sw` exists and documented in README.
- [ ] **Energy model updated:** `tools/energy-model.js` run with current subscription topology; ≤ 102,500/month projection.
- [ ] **Dual-DOM decision logged:** Approach chosen, applied uniformly from Phase 3 onward.
- [ ] **Render tier cache versioning:** `VERSION` constant in `lib/render-tier.ts`; override key separate.
- [ ] **CSP + CORS:** Set for asset CDN, Imgur, WebSocket origin — audited before launch.
- [ ] **Cursor throttle:** 30Hz + delta threshold verified in busy-lobby test.
- [ ] **Build passes locally:** `npm run build` clean before closing any phase.
- [ ] **Vercel preview parity:** Feature verified on preview URL, not just localhost.
- [ ] **Cross-tab auth sync:** `BroadcastChannel` or equivalent tested (logout in tab A → tab B updates).
- [ ] **Spine scaleY fix tracked:** Either camera projection corrected or Phase 6 TODO open with acceptance criteria.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Subscription at wrong layer (P1) | LOW | Move subscribe call to correct layout file; re-test energy model; single PR. |
| Spine prefetch storm (P2) | LOW | Convert guard to module-level singleton; dedup worker URL list; add Strict Mode regression test. |
| WebGL leak (P3) | MEDIUM | Audit full disposal matrix; add integration test that simulates 20+ pick transitions; potentially refactor AssetManager ownership. |
| Historical table creep (P4) | MEDIUM | Implement missing `view_my_*` backend views (adds a phase); remove frontend raw-table subscriptions; re-verify privacy. |
| SW stuck in dev (P5) | LOW | Visit `/dev-unregister-sw` (if implemented) or clear site data in DevTools. Bump `CACHE_NAME` if stale assets persist. |
| Auth desync (P6) | MEDIUM | Implement tri-state `useAuth`; add `<AuthRequired>` skeleton fallback; add `BroadcastChannel`. |
| Cursor broadcast storm (P7) | LOW | Add rAF throttle + delta threshold; verify at 20-user lobby. |
| `'use client'` at layout (P8) | LOW | Move directive to leaf component; re-run bundle analyzer. |
| Turbopack-only behavior (P9) | LOW-MEDIUM | Pin versions; verify via Vercel preview; fall back to Webpack if library incompatibility. |
| Dual-DOM hydration mismatch (P10) | HIGH | Depends on chosen architecture — switching approach post-Phase 3 means revisiting every UX phase. Decide **before** Phase 3 starts. |
| Full GPU context loss (catastrophic) | HIGH | `webglcontextrestored` handler re-inits Spine; if handler missing, user must reload. Portrait stays visible underneath — graceful degradation (Decision 3). |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| P1 — Wrong-layer subscription | Phase 1 (backend pre-work — views exist); Phase 2 (migration); every subsequent phase PR review | `tools/energy-model.js` projection ≤ 102,500; grep of subscribe calls against placement map |
| P2 — Spine prefetch storm | Phase 3 (portrait prefetch pattern); Phase 5 (Spine prefetch) | Strict Mode regression test; worker count = 1 in `chrome://inspect` |
| P3 — Pedestal WebGL leak | Phase 6 (draft and pedestal) | Simulated 20-transition test; WebGL context count returns to zero on unmount |
| P4 — Historical table scope | Phase 1 (backend views); Phase 4 (authed tier / profile page); Phase 7 (cross-user profile polish) | Two-identity isolation test; grep `[userId]/page.tsx` for `subscribe` calls |
| P5 — Service Worker issues | Phase 3 (SW implementation) | Dev unregister path exists; Vercel preview SW smoke test; `CACHE_NAME` versioning documented |
| P6 — Auth desync | Phase 2 (useAuth migration); Phase 4 (authed tier tri-state + cross-tab) | F5 test doesn't flash login; two-tab Discord-link test |
| P7 — Broadcast storm / desync | Phase 5 (cursor throttle); Phase 6 (pick-ban optimistic); Phase 7 (chat ordering) | 20-user lobby test; pick-ban rapid input test; reconnect dedup test |
| P8 — RSC boundary mistakes | Phase 2 (migration); ongoing | `grep "'use client'" app/**/layout.tsx` returns only `providers.tsx`; bundle analyzer under threshold |
| P9 — Turbopack drift | Phase 2 onward; every phase closeout | `npm run build` clean; Vercel preview passes |
| P10 — Dual-DOM hydration | Phase 2 / Phase 3 discussion (decide approach); Phase 3 onward (apply) | No React hydration warnings; rotation test preserves form state |
| Render capability cache staleness | Phase 5 (`lib/render-tier.ts` with VERSION) | Bump VERSION test — cache invalidates |
| `skeleton.scaleY = -1` workaround | Phase 6 (pedestal) — either fix or track | Complex-animation test (skinning character); TODO tracked in phase ledger |
| Discord OAuth preview URL | Phase 4 (authed tier) | Preview deploy auth flow passes |
| CSP / CORS | Phase 3 (public tier baseline); re-verify Phase 6 (pedestal external assets) | Lighthouse best-practices score; manual CSP violation test |
| Large list rendering | Phase 7 (leaderboards, match history) | > 500-row render stays smooth |

---

## Sources

**Repo artifacts (HIGH confidence — project-specific):**
- `D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/PROJECT.md` — v0.9 milestone scope, validated requirements, key decisions
- `D:/GitsWork/hsrpvp-spacetimedb-nextjs/notes/v09-frontend-subscription-strategy.md` — 8 binding decisions, risk callouts at lines 823-827 directly informed P1-P3
- `D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/CLAUDE.md` — SpacetimeDB core rules, always-in-context rules
- Memory `feedback_security_bandwidth_priority.md` — bandwidth/energy architectural priority (P1, P4)
- Memory `feedback_session_cookie_pattern.md` — SSR-safe auth, `hadSessionCookie` ref pattern (P6)
- Memory `reference_reducer_client_patterns.md` — Timestamp / optional / enum pitfalls (integration gotchas)
- Memory `feedback_worktree_safety.md` — Phase 12 / 12.1 / 13 incidents (not a runtime pitfall but artifact-persistence pitfall)
- Memory `feedback_transactional_tables.md` — status-column anti-pattern (architecture-level, backend)
- Memory `project_data_scale.md` — target scale and energy breakdown

**External references (MEDIUM confidence — stack-specific):**
- [React StrictMode docs](https://react.dev/reference/react/StrictMode) — double-mount cleanup semantics (P2, P3)
- [SpacetimeDB Subscriptions docs](https://spacetimedb.com/docs/clients/subscriptions/) — `unsubscribe()` async behavior, `unsubscribeThen`, `isActive`/`isEnded`
- [SpacetimeDB TypeScript Reference](https://spacetimedb.com/docs/clients/typescript/)
- [WebGL HandlingContextLost wiki (Khronos)](https://www.khronos.org/webgl/wiki/HandlingContextLost) — context loss / restore pattern (P3)
- [Spine forum — ts-webgl context lost](http://en.esotericsoftware.com/forum/ts-webgl-Handling-Context-Lost-6861) — Spine AssetManager disposal
- [MDN WEBGL_lose_context](https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_lose_context/loseContext) — deliberate context release

**Sources (MEDIUM-LOW confidence — community discussion of specific failure modes):**
- [DEV — React 19 Strict Mode useEffect double-call](https://dev.to/pockit_tools/why-is-useeffect-running-twice-the-complete-guide-to-react-19-strict-mode-and-effect-cleanup-1n60)
- [React issue #30835 — StrictMode cleanup-for-second-mount bug](https://github.com/facebook/react/issues/30835)
- [WebSocket.org — WebSockets in React: Hooks, Lifecycle, Pitfalls](https://websocket.org/guides/frameworks/react/)

---

*Pitfalls research for: competitive gaming frontend on SpacetimeDB + Next.js 15 + React 19 + Spine WebGL + dual-DOM*
*Researched: 2026-04-12*
