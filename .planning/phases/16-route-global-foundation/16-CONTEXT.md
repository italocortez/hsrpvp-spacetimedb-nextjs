# Phase 16: Route + Global Foundation - Context

**Gathered:** 2026-04-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver the frontend foundation every v0.9 UX phase builds on:

- Route-group migration: `(landing-page)→(public)`, `(authenticated)→(authed)`, `(game)/draft → (authed)/(match)/draft`. Route groups are URL-invisible — user-facing URLs are unchanged.
- Next.js 15.2.3+ bump + `experimental.typedRoutes: true` (CVE-2025-29927 mitigation + compile-time `<Link>` validation).
- Four new primitives: `<ViewportGate />`, `<ViewportWriter />`, `getRenderTier()`, `<SafariWarning />`.
- First middleware (positive-list matcher, cookie-gated login redirect).
- Service Worker scaffold (asset-CDN cache only, never app origin).
- `providers.tsx` render tree subscribes to 7 HSR public reference tables; AuthProvider subscribes to `view_my_profile`; `(authed)/layout.tsx` subscribes to `user`.

**In scope (the 11 FOUND-xx requirements):** FOUND-03 through FOUND-13 from REQUIREMENTS.md.

**Out of scope (belongs in Phase 21 or later):**
- Moving `hsr_account` subscription to `(authed)/layout.tsx` — Phase 21.
- Tri-state `<AuthRequired>` overhaul + cross-tab `BroadcastChannel` — Phase 21.
- Match-tier subscriptions (lobby/tournament) at `(authed)/(match)/layout.tsx` — Phase 28.
- Any per-feature UX work (cost tables, team builder, etc.) — Phase 17+.

</domain>

<decisions>
## Implementation Decisions

### Public-table subscription placement (Area 1)

- **D-01:** 7 layer-0 HSR reference tables subscribed at the `providers.tsx` render tree via `GameDataProvider`:
  1. `HsrCharacter`
  2. `HsrCharacterArchetype`
  3. `Archetype`
  4. `HsrCharacterCost`
  5. `HsrLightcone`
  6. `HsrLightconeCost`
  7. `HsrSynergyCost`

  The roadmap and research docs previously said "6 public reference tables" — correction: the correct count is 7. Both `HsrCharacterArchetype` (character↔archetype join) and `Archetype` (archetype reference table with `name`, `description`) are needed for future team-builder synergy filters and drafting auction mode. Joining them server-side via a new view was rejected: no bandwidth win (tiny rows), no privacy win (everything is already `public: true`), and it adds a backend surface that conflicts with SpacetimeDB's "views are for projection/filtering" norm. Client-side JS join is trivial for ~150-250 rows.

- **D-02:** `GameDataProvider` keeps its current name. Add the two missing `useTable` calls (`HsrCharacterArchetype`, `Archetype`) alongside the existing 5. No call-site churn across the codebase.

- **D-03:** `view_my_profile` subscribe effect moves from `useAuth.ts:69-108` into `AuthProvider`. AuthProvider is already a child of `SpacetimeDBProvider` in `providers.tsx`, so the "providers.tsx owns view_my_profile" architectural intent is satisfied. useAuth.ts loses the Stage 1 subscribe effect only; `readProfileFromConnection` (3-fallback strategy), login/logout, Discord link, soft-delete logic, guest-login state, and all refs are retained verbatim.

- **D-04:** `useTable()` is the default subscription mechanism for the 7 public tables. `subscriptionBuilder` with explicit SQL is used only when `useTable` is structurally incapable, with a documented reason in the code comment at the call site.

- **D-05:** All 7 public-table subscriptions + `view_my_profile` fire on STDB connect regardless of auth state (anon + authed). Reference tables are small static rows; no bandwidth concern.

- **D-06:** New React providers (beyond `AuthProvider` and `GameDataProvider`) are per-need, not by default. A provider is justified only when derived state must be shared across deeply nested consumers. Raw table rows are consumed via `useTable(tables.Foo)` in the component directly — no provider wrapper needed. Expected future providers: none in v0.9 unless a feature's derived-state bundle justifies it (rare; would be introduced by the feature phase, not preemptively).

### useAuth ↔ (authed)/layout.tsx User-subscription handoff (Area 2)

- **D-07:** `User` table subscribe moves from `useAuth.ts:34-38` (15.5's Stage 2 effect) into `(authed)/layout.tsx`. The route-group mount IS the new gate: the layout only mounts for authed routes, so anonymous visitors never receive `User` rows. Functionally equivalent to 15.5's explicit ref-based Stage 2 gate, structurally simpler.

- **D-08:** `onUserInsert` / `onUserUpdate` recovery callbacks currently at `useAuth.ts:63-80` move into `(authed)/layout.tsx` alongside the `User` subscribe effect. They remain tied to the User subscription lifecycle; relocation keeps them coherent.

- **D-09:** 15.5's Stage 2 refs (`hadSessionCookie`, `hadTokenOnMount`) stay in `useAuth.ts`. They no longer gate a subscription, but they still drive `isWaitingForData` composition (`useAuth.ts:295`) for the loading UI — this signal is independent of subscription placement.

- **D-10:** `useAuth.ts` retains: `readProfileFromConnection` 3-fallback reader (cached id → username index → session name), login / logout / guest-login / Discord link state machine, `guestLoginPending` narrow state + inline login-button spinner, soft-delete refs. Loses only the two subscribe effects (Stage 1 → AuthProvider, Stage 2 → authed layout).

- **D-11:** Both `AuthProvider` and `(authed)/layout.tsx` use the `subscribedRef` guard pattern (same as `useAuth.ts:17`). Strict Mode double-mount defense is structural, not optional.

- **D-12:** 15.5 harness integration test (`test/backend/auth/auth-subscriptions.test.ts`) MUST pass post-refactor. The gate semantics are preserved (anon never receives `User` rows); only the gate *location* changed. Test is unmodified.

- **D-13:** `<AuthRequired>` reads auth state from `currentUser` (derived from `view_my_profile`), NOT from `User` rows. Routing/redirect decisions are therefore independent of `(authed)/layout.tsx`'s User subscription readiness. Returning-user smoothness is preserved.

### 15.5 behavior-preservation checklist (Area 2 enforcement)

- **D-14:** The following 15.5 behaviors MUST remain observable after the Phase 16 refactor:
  1. Anonymous visitors receive zero `User` directory rows at any layer.
  2. Returning authed users have `view_my_profile` hydrated at layer-0 on connect — no visible delay on first paint regardless of landing route.
  3. `guestLoginPending` drives the login-button inline spinner ONLY. Spinner does not appear during `isLoadingData`, `isWaitingForData`, `isConnecting`, or `isLinkingDiscord` flows.
  4. `readProfileFromConnection` 3-fallback strategy still resolves via `view_my_profile` primary, `User` fallback.
  5. `onUserInsert` / `onUserUpdate` still fire on the authed subscription lifecycle (relocated, but same role).

### Middleware + Service Worker (Area 3)

- **D-15:** Middleware positive-list matcher paths (cookie-less unauthenticated users redirected to login):
  - `/profile/:path*`
  - `/admin-view/:path*`
  - `/lobby/:path*`
  - `/draft/:path*`

  `:path*` on leaf-today paths is future-proofing for Phase 22 (admin sub-pages), Phase 24 (`/profile/[userId]`), Phase 28 (`/lobby/[id]`), Phase 31 (`/draft/[matchId]`). Explicit excludes: `/`, `/costs`, `/teambuilder`, `/sw.js`, `/_next/*`, `/api/*`. Cookie read: `stdb_session` (matches `lib/session-cookie.ts`).

- **D-16:** Next.js bump to ≥15.2.3 precedes middleware ship. Mitigates CVE-2025-29927 (middleware bypass). Pin written as `next@^15.2.3` in `package.json`; planner confirms the resolved version at execution time.

- **D-17:** Service Worker asset-CDN allowlist (day-one): `ufs.sh` (UploadThing — Spine assets + character portraits), `i.imgur.com` (Imgur — match screenshots landing in Phase 32). Both ship in the allowlist from Phase 16 even though Imgur uploads don't wire until Phase 32 — the allowlist is a 2-entry constant array with zero additional logic. Discord CDN is explicitly NOT in the allowlist (Discord is identity-only, no asset work).

- **D-18:** Service Worker NEVER intercepts app origin. `fetch` event handler short-circuits on `url.origin === location.origin`. Only intercepts requests whose hostname matches the allowlist.

- **D-19:** Service Worker registration gate: `NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENABLE_SW === 'true'`. Registration happens in `app/providers.tsx` inside a `useEffect`.

- **D-20:** Dev-unregister mechanism: gated page at `app/dev-unregister-sw/page.tsx`. First thing the page renders checks `process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_SW !== 'true'` — if true, calls `notFound()` (returns 404). In dev/preview, renders one button that iterates `navigator.serviceWorker.getRegistrations()` + `caches.keys()`, unregisters/deletes everything, redirects to `/`. Ships in prod bundle (~1KB) but unreachable. README documents the URL. Trivially removable later if unwanted.

### Primitive file layout + R8 docs (Area 4)

- **D-21:** `lib/render-tier.ts` owns the pure util: `getRenderTier()`, `VERSION` const for cache invalidation, cache helpers (7-day TTL), Safari override logic. No React imports. Testable in isolation.

- **D-22:** `components/globals/viewport/` directory owns the React components:
  - `ViewportGate.tsx`
  - `ViewportWriter.tsx`
  - `SafariWarning.tsx`

  Matches existing layout: `lib/` for pure utils (`session-cookie.ts`, `spacetimedb.ts`), `components/globals/` for shared components grouped by concern.

- **D-23:** `docs/frontend/component-hygiene.md` ships the 5 R8 rules with Good/Bad examples per rule. New `docs/frontend/` directory follows the existing `docs/{feature}/` convention. Content:
  1. Thin page files — pages compose, don't implement business logic.
  2. Viewport-agnostic children — no `useIsMobile` or similar hook calls inside component files.
  3. **[Reframed, tool-agnostic]** Responsive styling — via CSS Modules media queries, Tailwind utilities, or any other mechanism — adjusts sizing/spacing only. Never use responsive styles to reorder sections, swap grid-vs-stack, or hide major content blocks. Structural reorganization requires either a single responsive layout that works at all widths OR a dual-DOM split (R4).
  4. State lives in hooks, not pages.
  5. Layout-agnostic component props.

- **D-24:** No PR-template infrastructure (no checkbox lists). Doc is the enforcement surface. R8's "violation blocks merge in PR review" is satisfied by reviewer attention to `docs/frontend/component-hygiene.md`. An ESLint rule targeting Rule 2 (`useIsMobile` imports inside `components/features/*/components/*.tsx`) is a fast-follow if PR review consistently misses that violation in Phase 17+. Not Phase 16 scope.

- **D-25:** Phase 16 itself is styling-tool-agnostic. The new primitives (render-tier utility, viewport components) use stdlib React + Next only — no HeroUI, no Tailwind. If HeroUI/Tailwind are later removed from the project, Phase 16's output is unaffected.

### ViewportGate SSR mechanism (additional gray area)

- **D-26:** R4 kept: dual-DOM (code-split siblings via `next/dynamic`) is allowed ONLY for Calendar (Phase 27), Match Drafting (Phase 31), and Tournament brackets (Phase 35). Every other page ships single-DOM responsive. Phase 16 builds the `<ViewportGate />` primitive; the 3 consumer phases create the `.desktop.tsx` / `.mobile.tsx` sibling files later.

- **D-27:** `<ViewportGate />` SSR behavior — Skeleton-first for cookie-less dual-DOM pages. `userAgent()` from `next/server` is NOT used. Mechanism:

  ```
  Server render:
    ├─ Only one sibling exists (single-DOM): render it directly
    ├─ vp cookie present: render the matching sibling directly
    └─ vp cookie absent AND dual-DOM page: render <Skeleton />

  Client mount:
    ├─ If hydrated a Skeleton: matchmedia → dynamic-import correct sibling → render → ViewportWriter writes vp cookie
    └─ If hydrated a sibling: matchmedia verifies; if disagrees (rare), swap with Skeleton during dynamic import; ViewportWriter writes corrected cookie
  ```

  Zero hydration mismatch risk (server-rendered content matches first client render exactly; swap happens post-hydration in a useEffect).

- **D-28:** FOUND-11 literal-wording deviation (documented here so the planner doesn't implement the worse pattern by reflex): the roadmap success criterion #6 says *"SSRs as desktop (or `userAgent()` guess when available) and swaps to mobile client-side if incorrect"*. The implemented mechanism in D-27 is a cleaner path to the same outcome — no hydration mismatch, correct sibling renders — by using a deterministic Skeleton placeholder instead of an unreliable `userAgent()` guess. Same observable behavior, simpler code.

### Route-group rename migration sequence (Area 5)

- **D-29:** 5-commit sequence, each independently buildable. `npm run build && npm run test:typecheck` gate between steps.

  ```
  COMMIT 1 — Prerequisites
  ├─ npm i next@^15.2.3
  ├─ next.config.ts: add experimental: { typedRoutes: true }
  ├─ npm run build → triage any PRE-EXISTING broken hrefs (fix in this commit)
  └─ chore(next): bump to 15.2.3 + enable typedRoutes

  COMMIT 2 — Rename (landing-page) → (public)
  ├─ git mv app/(landing-page) app/(public)
  └─ refactor(app): rename (landing-page) route group to (public)

  COMMIT 3 — Rename (authenticated) → (authed)
  ├─ git mv app/(authenticated) app/(authed)
  └─ refactor(app): rename (authenticated) route group to (authed)

  COMMIT 4 — Move (game)/draft → (authed)/(match)/draft
  ├─ mkdir app/(authed)/(match)
  ├─ Create app/(authed)/(match)/layout.tsx as empty passthrough (D-31)
  ├─ git mv app/(game)/draft app/(authed)/(match)/draft
  ├─ rmdir app/(game) (empty)
  ├─ Manual verify: /draft/abc redirects anonymous users to login (D-30)
  └─ refactor(app): collapse (game)/draft under (authed)/(match)

  COMMIT 5 — Sanity sweep
  ├─ grep -r "app/(landing-page)\|app/(authenticated)\|app/(game)" src/ components/ lib/
  ├─ Fix any absolute-path imports found
  └─ refactor(app): update file-path references after route-group migration
  ```

- **D-30:** `/draft/:matchId` becomes authed as a deliberate behavior change in Commit 4. Matches roadmap intent (drafting is an authed feature; Phase 30/31 wires real draft flow behind auth). Anonymous visitors hitting `/draft/abc123` after this commit are redirected to login by the middleware (D-15) and by the `<AuthRequired>` inside `(authed)/layout.tsx`.

- **D-31:** `app/(authed)/(match)/layout.tsx` ships in Phase 16 as an empty passthrough:
  ```tsx
  export default function MatchLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }
  ```
  Zero behavior today. Reserves the architectural slot for Phase 28 match-tier subscriptions (lobby/tournament) per `.planning/research/ARCHITECTURE.md:76`. Phase 28 extends this file rather than creating it.

- **D-32:** TypedRoutes pre-existing broken-href findings are fixed IN Commit 1 scope. No `as Route` casts, no `// @ts-expect-error` silences, no deferral. Clean-slate policy: any broken `<Link href>` surfaced by enabling typedRoutes was already a latent bug — fix it immediately so Commit 1's message matches reality. If more than ~5 broken hrefs surface, the planner can optionally split them into a sub-plan within Phase 16.

### Cross-cutting

- **D-33:** Observability console.log surface with bracketed source tags for every lifecycle-meaningful moment. Matches the existing `[useAuth]` style. No environment gating. Source tags:
  - `[AuthProvider]` — view_my_profile subscribe / onApplied / onInsert / onUpdate / unsubscribe
  - `[authedLayout]` — User subscribe / onApplied / onUserInsert / onUserUpdate; mount + unmount
  - `[GameDataProvider]` — each of 7 `useTable` calls firing; first-rows-available marker per table
  - `[useAuth]` — retained existing logs; add a log at the relocation point making it explicit subscriptions are now delegated
  - `[ViewportGate]` — cookie read / no-cookie branch / matchmedia result / sibling swap / which sibling mounted
  - `[ViewportWriter]` — cookie write with viewport + expiry
  - `[renderTier]` — tier returned / cache hit vs miss / Safari image-only override / user override
  - `[SafariWarning]` — banner mount / dismissal persistence
  - `[SW]` — register / install / activate / fetch-intercept hit+miss per host / unregister
  - `[middleware]` — path matched / cookie-present vs cookie-absent / redirect target

### Claude's Discretion

- Safari banner dismissal persistence strategy (per-tab session, localStorage-forever, or time-boxed). FOUND-08 says "dismissible" — planner picks.
- Render-tier user-override UI. FOUND-09 requires override-via-localStorage honor; a user-facing toggle UI is NOT Phase 16 scope. Devtools / manual localStorage edit only for now.
- Exact Skeleton component design + location (reused between ViewportGate SSR-placeholder role and `next/dynamic` loading role).
- Exact matchmedia listener + teardown in ViewportGate.
- Exact structure of the AuthProvider + `(authed)/layout.tsx` subscribe effects (one useEffect vs two, nested conditions vs separate flags).
- Precise Next.js version pin (≥15.2.3 locked; planner chooses the minor at execution time based on then-current patch levels).
- Async-params audit scope. `/draft/[matchId]` already uses `async params`. Planner greps for other dynamic routes during rename commits and patches any that are missed (unlikely; v0.5 backend phases were backend-only).
- Exact wording of `docs/frontend/component-hygiene.md` examples. Writer drafts per template.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Milestone-level decisions that scope Phase 16
- `.planning/ROADMAP.md:46` — Phase 16 summary entry
- `.planning/ROADMAP.md:75-86` — Cross-Phase Commitments R2, R4, R7, R8, R9 + Energy budget, Browser support, Single data plane
- `.planning/ROADMAP.md:225-239` — Phase 16 full goal + 8 success criteria
- `.planning/REQUIREMENTS.md:20-30` — FOUND-03 through FOUND-13 definitions
- `.planning/research/DECISIONS.md` R2, R3, R4, R5, R6, R8, R9 — full rationale for each cross-phase commitment
- `.planning/research/ARCHITECTURE.md:15-100` — layered subscription architecture diagram + layer ownership table
- `.planning/research/ARCHITECTURE.md:340-400` — subscription bootstrap data flow + logout teardown
- `.planning/research/PITFALLS.md:30-45` — Pitfall 1 (subscription-at-wrong-layer) and warning signs
- `.planning/research/PITFALLS.md:240-245` — Next 15 async-params migration note
- `.planning/research/PITFALLS.md:400-420` — per-phase checklist (Phase 16 items)
- `.planning/research/STACK.md:5-50` — frontend stack additions, do-not-add list, UploadThing / Imgur roles

### Prior-phase context that informs Phase 16
- `.planning/phases/15.5-auth-gated-user-subscription/15.5-CONTEXT.md` — Stage 2 gate pattern, smooth-auth-experience constraints, handoff note line 116 (User subscription placement evolution)
- `.planning/phases/15.5-auth-gated-user-subscription/15.5-DISCUSSION-LOG.md` — Stage 2 gate signal composition rationale
- `.planning/phases/15.2-user-directory-view-performance/15.2-CONTEXT.md` — D-01 (User.public=true stays), D-06 (cosmetic view flip retired by 15.5)

### Backend surface the subscriptions touch
- `spacetimedb/src/tables/hsrCharacter.ts` — public: true, Spine URL columns (Phase 15)
- `spacetimedb/src/tables/hsrCharacterArchetype.ts` — composite PK character↔archetype join, public: true
- `spacetimedb/src/tables/archetype.ts` — reference table name/description, public: true
- `spacetimedb/src/tables/hsrCharacterCost.ts`, `hsrLightcone.ts`, `hsrLightconeCost.ts`, `hsrSynergyCost.ts` — remaining public: true reference tables
- `spacetimedb/src/views/identityViews.ts` — `view_my_profile` definition (self-filtering via ctx.sender)
- `docs/auth/architecture.md` — "Subscription Lifecycle" section added in 15.5 (projection-privacy vs gate-privacy split; anonymous-view exceptions)

### Frontend change surface
- `app/providers.tsx` — Providers composition; `AuthProvider` and `GameDataProvider` sit inside it
- `app/layout.tsx` — root layout, NavBar / Footer / Providers
- `app/(landing-page)/`, `app/(authenticated)/`, `app/(game)/` — route-group directories to be renamed/collapsed
- `components/features/auth/components/AuthProvider.tsx` — wraps useAuth context; receives the view_my_profile subscribe effect per D-03
- `components/features/auth/components/AuthRequired.tsx` — existing auth gate component; reads `currentUser` per D-13
- `components/features/auth/components/DeletionBanner.tsx` — rendered inside `(authed)/layout.tsx`
- `components/features/auth/hooks/useAuth.ts` — source of Stage 1 + Stage 2 subscribe effects; lines 17 (`subscribedRef` pattern), 34-38 (Stage 2 target), 63-80 (onUser callbacks), 69-108 (Stage 1 target), 292-295 (`hadSessionCookie` / `hadTokenOnMount` / `isWaitingForData`), 307-316 (`loginGuest` + `guestLoginPending`)
- `components/features/game-data/components/GameDataProvider.tsx` — existing 5 useTable calls (lines 72-76); adds HsrCharacterArchetype + Archetype per D-02
- `lib/session-cookie.ts` — `stdb_session` cookie helpers used by middleware per D-15
- `next.config.ts` — CSP + headers; typedRoutes + Next bump per D-32

### Test surface (no new tests created during Phase 16 execution per CLAUDE.md)
- `test/backend/auth/auth-subscriptions.test.ts` — 15.5 harness test; must pass post-refactor per D-12

### External references
- https://nextjs.org/blog/next-15-2 — Next.js 15.2 release notes + typedRoutes GA
- CVE-2025-29927 — Next.js middleware bypass (patched in 15.2.3)
- https://spacetimedb.com/docs/functions/views/ — view vs anonymousView semantics (inherited authority from 15.5)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`GameDataProvider` context** (`components/features/game-data/components/GameDataProvider.tsx`): existing provider mounts inside `providers.tsx` render tree; 5 `useTable` calls at layer-0. Adding 2 more tables preserves the existing consumer API.
- **`useTable` hook** (`spacetimedb/react`): auto-subscribes to a table on mount, exposes reactive rows. Matches D-04 default mechanism.
- **`AuthProvider` context** (`components/features/auth/components/AuthProvider.tsx`): thin wrapper around `useAuth`. Receives the `view_my_profile` subscribe effect per D-03 — minimal mechanical change.
- **`AuthRequired` component** (`components/features/auth/components/AuthRequired.tsx`): existing auth gate used by `(authenticated)/layout.tsx`. Reads `currentUser` from `useAuth` context. Works unchanged on `(authed)/layout.tsx` after rename.
- **`DeletionBanner` component**: rendered inside the authed layout. Moves with the layout under the rename.
- **`subscribedRef` pattern** (`useAuth.ts:17, 24`): existing Strict Mode double-subscribe guard. Replicated in AuthProvider and authed layout per D-11.
- **`lib/session-cookie.ts`**: `stdb_session` cookie read/write helpers. Middleware consumes `getSessionCookieFromHeader` per D-15.
- **`readProfileFromConnection`** (`useAuth.ts:113-170`): 3-fallback strategy (cached id → User.id PK, guest username → User.username index, session name → User.username index). Survives the refactor unchanged per D-10.
- **`loginGuest` + `guestLoginPending`** (`useAuth.ts:307-316`): narrow-scoped spinner state set in the loginAsGuest callback, cleared on currentUser resolution or reducer rejection. 15.5 D-03 behavior preserved per D-14.

### Established Patterns

- **`useEffect` per subscription lifecycle with cleanup**: useAuth today has three effects. Splitting Stage 1 into AuthProvider and Stage 2 into authed layout preserves the pattern (one effect per subscription at its new owner).
- **Refs over state for subscription tracking**: avoids re-render churn and double-subscribe races. `hadSessionCookie` / `hadTokenOnMount` / `subscribedRef` are all refs.
- **SpacetimeDB SDK handles disconnect cleanup**: no manual `.unsubscribe()` in the codebase; subscriptions tear down with the connection. `(authed)/layout.tsx` unmount also triggers effect cleanup, but the STDB SDK ensures bounded teardown.
- **Server-side projection as privacy gate** vs **subscription-timing as privacy gate**: distinction documented in `docs/auth/architecture.md` during 15.5. Phase 16's User-sub-at-authed-layout is the subscription-timing pattern (route-group mount is the gate), not a projection.
- **Thin layout files**: `(authenticated)/layout.tsx` today is 10 lines (AuthRequired + DeletionBanner wrapper). R8 Rule 1 ("thin page files") applied to layouts. New `(authed)/layout.tsx` gains the User subscribe useEffect but stays under 40 lines.

### Integration Points

- **`providers.tsx` render tree**: `SessionProvider` > `HeroUIProvider` > `SpacetimeDBProvider` > `AuthProvider` > `GameDataProvider` > `{children}`. Layer-0 subs fire inside the bottom two.
- **`app/layout.tsx`**: root layout mounts NavBar + Footer around `Providers`. Phase 16 adds `<SafariWarning />` + `<ViewportWriter />` here (per ARCHITECTURE.md line 72: "Root shell: NavBar, Safari banner, ViewportGate, Providers").
- **`(authed)/layout.tsx`**: Phase 16 adds User subscribe useEffect + onUser callbacks per D-07/D-08. Phase 21 later adds hsr_account subscribe + tri-state AuthRequired.
- **Middleware** (new file at `middleware.ts`): reads `stdb_session` cookie, matches positive-list paths per D-15, redirects cookie-absent requests to `/` or `/login`.
- **Service Worker** (new file at `public/sw.js`): registered by `providers.tsx` inside a `useEffect` gated on D-19 condition. Intercepts only D-17 hostnames.
- **`GameDataProvider`**: gains 2 new `useTable` calls inside its existing pattern. Context type extends with `archetypes` and `characterArchetypes` arrays.
- **`AuthProvider`**: gains a `useEffect` that subscribes to `view_my_profile` + Strict-Mode-guarded via `subscribedRef`. Exposes rows to `useAuth` via connection cache (no new context field required — `readProfileFromConnection` reads from `conn.db.view_my_profile.iter()` already).

### Phase 15.5 carry-forward

- **Stage 1 pattern** preserved at layer-0 — owner moves from useAuth to AuthProvider, same subscribe SQL (`SELECT * FROM view_my_profile`), same anon-safe behavior.
- **Stage 2 gate logic** retired. The `currentUser != null || hadTokenOnMount || hadSessionCookie` condition is replaced structurally by `(authed)/layout.tsx` mount-only-for-authed-routes. Refs retained for the separate `isWaitingForData` role.
- **Harness integration test** unchanged — same observable behavior, different implementation location.

</code_context>

<specifics>
## Specific Ideas

- **Engineering-first mandate for the 6-vs-7-table question.** The user explicitly said "think what's best from an engineering perspective" on the 6th public table — 7 tables with client-side JS join was chosen over 6-tables-plus-view on engineering grounds (no bandwidth/privacy win for a view, avoids backend surface for a purely convenience layer). Captured in D-01 rationale.
- **"Smooth experience" preservation from 15.5 is load-bearing.** The user paused the discussion to explicitly require that the Phase 16 refactor preserves the 15.5 smooth-auth experience — no regressions on anon bandwidth safety, no spinner bleed, no visible delay for returning users. Captured as D-14 checklist with 5 concrete behaviors.
- **User's preference on provider proliferation:** "are these the only ones we are gonna use and the rest are gonna be a per needed basis? considering all our features" — answered via D-06 principle (per-need, not by default). Documented for downstream phases so no one preemptively creates a LobbyProvider / ProfileProvider without a concrete derived-state justification.
- **User's flag on styling-tool lock-in:** "I'm not really sure if I'm gonna keep tailwind for the project... HeroUI... I may even remove that". Captured via D-25 (Phase 16 styling-agnostic) and D-23 Rule 3 reframe (tool-neutral language). Phase 16 output survives HeroUI removal.
- **User's ask on console logs throughout the development phase:** "make sure to do console log so we can see during testing that we are behaving as expected". Captured as D-33 cross-cutting observability surface with bracketed source tags. Matches existing `[useAuth]` style.
- **User's scrutiny on dev-only utilities shipping to production:** specifically asked "how hard would it be to get rid of it later if needed?" about `/dev-unregister-sw`. Captured via D-20 (prod-gated via `notFound()`, trivially removable, ships ~1KB unreachable code in prod).
- **Terminology sanity check on "dual-DOM":** the user initially read "dual-DOM" as "both DOMs loaded at once" — clarified via explicit comparison table. "Dual-DOM" in R4 context = code-split via `next/dynamic` where only one sibling is downloaded/mounted at runtime. Documented in D-26 to prevent re-litigation.

</specifics>

<deferred>
## Deferred Ideas

- **`useGatedSubscription(sql)` helper hook** — inherited from 15.5 deferred list. Extract a reusable gated-subscription hook only when a second gated subscription lands (likely Phase 22 Admin panel data or Phase 28 Lobby data). Not Phase 16 scope.
- **ESLint custom rule for R8 Rule 2** (`useIsMobile` inside components). Fast-follow if PR review consistently misses the violation in Phase 17+. Requires AST rule authoring + maintenance; deferred until evidence of need.
- **Render-tier user-facing toggle UI** — FOUND-09 honors the localStorage override, but a settings UI to flip the override is deferred. Devtools / manual-localStorage-edit only in v0.9.
- **Web Worker for asset prefetching** — R2 explicit: not in v0.9. Service Worker only. Reopen only if Phase 28 or 31 surfaces measurable main-thread jank.
- **Moving `hsr_account` subscription to `(authed)/layout.tsx`** — Phase 21 work. Phase 16 only moves `user`.
- **Tri-state `<AuthRequired>` overhaul** — Phase 21. Phase 16 uses the existing binary AuthRequired component.
- **Cross-tab `BroadcastChannel` auth sync** — Phase 21.
- **Match-tier subscriptions at `(authed)/(match)/layout.tsx`** — Phase 28. Phase 16 ships the layout as an empty passthrough (D-31).
- **`view_active_users` or on-demand read reducers as replacement for `User` subscription** — 15.5 noted this as a future option if bandwidth at scale becomes a concern. Not needed for Phase 16; the layout-scoped subscribe is the chosen design.
- **Safari banner dismissal persistence strategy** — Claude's discretion during planning. If the picked strategy turns out to be wrong in UAT (e.g., per-tab re-appears annoyingly), revisit in a minor phase.
- **Imgur uploads wiring** — Phase 32. Phase 16 only adds Imgur to the SW allowlist (D-17) in anticipation; upload client code ships later.

</deferred>

---

*Phase: 16-route-global-foundation*
*Context gathered: 2026-04-18*
