# Phase 16: Route + Global Foundation — Research

**Researched:** 2026-04-18
**Domain:** Next.js 15 App Router foundation (route groups, typedRoutes, middleware, viewport primitives, Service Worker, SpacetimeDB subscription ownership)
**Confidence:** HIGH on Next.js config + middleware + matchMedia + async-params + installed version (verified via npm registry + official docs + codebase grep). MEDIUM on Service Worker cross-origin filter specifics (MDN + sample blogs, no Context7 entry). HIGH on CONTEXT.md-locked SpacetimeDB subscription pattern (carries forward 15.5 harness-proven approach).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

D-01 through D-33 from `16-CONTEXT.md`. Highest-friction items planner MUST honor verbatim (paraphrased for reference — authoritative text lives in CONTEXT.md):

- **D-01:** 7-table layer-0 subscription set (HsrCharacter, HsrCharacterArchetype, Archetype, HsrCharacterCost, HsrLightcone, HsrLightconeCost, HsrSynergyCost). Roadmap's "6 public reference tables" is superseded — 7 is the real count.
- **D-02:** Keep `GameDataProvider` name. Add 2 new `useTable` calls for `HsrCharacterArchetype` + `Archetype`.
- **D-03:** `view_my_profile` subscribe effect relocates from `useAuth.ts` Stage 1 → `AuthProvider`. `useAuth.ts` keeps `readProfileFromConnection`, login/logout, Discord link, guest-login state, soft-delete, and refs.
- **D-04:** `useTable()` is default. `subscriptionBuilder` with explicit SQL only with documented reason at the call site.
- **D-05:** All 7 public-table + `view_my_profile` subscriptions fire on STDB connect regardless of auth state.
- **D-06:** No new providers beyond `AuthProvider` + `GameDataProvider` in Phase 16. Per-need, not by default.
- **D-07:** `User` table subscribe relocates from `useAuth.ts` Stage 2 → `(authed)/layout.tsx`. Route-group mount IS the gate.
- **D-08:** `onUserInsert` / `onUserUpdate` callbacks move with the User subscribe into `(authed)/layout.tsx`.
- **D-09:** 15.5's `hadSessionCookie` / `hadUserIdOnMount` refs stay in `useAuth.ts` (drive `isWaitingForData`, no longer gate subscription).
- **D-10:** `useAuth.ts` loses only the two subscribe effects. Everything else survives unchanged.
- **D-11:** `AuthProvider` + `(authed)/layout.tsx` both use the `subscribedRef` guard pattern.
- **D-12:** 15.5 harness test `test/backend/auth/auth-subscriptions.test.ts` MUST pass post-refactor, unmodified.
- **D-13:** `<AuthRequired>` reads from `currentUser` (derived from `view_my_profile`), not from `User` rows.
- **D-14:** 5-item behavior-preservation checklist from 15.5 — all must remain observable.
- **D-15:** Middleware positive-list matcher: `/profile/:path*`, `/admin-view/:path*`, `/lobby/:path*`, `/draft/:path*`. Explicit excludes: `/`, `/costs`, `/teambuilder`, `/sw.js`, `/_next/*`, `/api/*`. Cookie read: `stdb_session`.
- **D-16:** Next.js bump ≥15.2.3 (CVE-2025-29927 mitigation). Pin written as `next@^15.2.3` at minimum.
- **D-17:** SW asset-CDN allowlist: `ufs.sh` + `i.imgur.com` only. Discord CDN explicitly excluded.
- **D-18:** SW NEVER intercepts app origin. Short-circuit on `url.origin === location.origin`.
- **D-19:** SW registration gate: `NODE_ENV === 'production' || NEXT_PUBLIC_ENABLE_SW === 'true'`. Registered in `app/providers.tsx` inside `useEffect`.
- **D-20:** `/dev-unregister-sw` page is prod-gated via `notFound()` check against `NODE_ENV === 'production' && !NEXT_PUBLIC_ENABLE_SW`.
- **D-21:** `lib/render-tier.ts` owns the pure util (no React imports).
- **D-22:** `components/globals/viewport/` owns the 3 React components (`ViewportGate.tsx`, `ViewportWriter.tsx`, `SafariWarning.tsx`).
- **D-23:** `docs/frontend/component-hygiene.md` ships the 5 R8 rules with Good/Bad examples. Rule 3 reframed tool-agnostic.
- **D-24:** No PR-template infrastructure. Doc is the enforcement surface.
- **D-25:** Phase 16 primitives are styling-tool-agnostic (no HeroUI, no Tailwind).
- **D-26:** Dual-DOM is ONLY for Phases 27 (Calendar), 31 (Match Drafting), 35 (Tournament brackets). Phase 16 builds the primitive; those phases create the sibling files.
- **D-27:** `<ViewportGate />` SSR behavior — Skeleton-first for cookie-less dual-DOM pages. `userAgent()` from `next/server` is NOT used.
- **D-28:** FOUND-11 literal roadmap wording is superseded by D-27 (same observable behavior, simpler code).
- **D-29:** 5-commit rename sequence, each independently buildable with `npm run build && npm run test:typecheck` gate between.
- **D-30:** `/draft/:matchId` becomes authed in Commit 4 (deliberate behavior change).
- **D-31:** `(authed)/(match)/layout.tsx` ships as empty passthrough.
- **D-32:** TypedRoutes pre-existing broken hrefs fixed in Commit 1 scope. No `as Route` casts, no `// @ts-expect-error` silences, no deferral.
- **D-33:** Observability console.log surface with bracketed source tags ([AuthProvider], [authedLayout], [GameDataProvider], [useAuth], [ViewportGate], [ViewportWriter], [renderTier], [SafariWarning], [SW], [middleware]). No environment gating.

### Claude's Discretion

Copied verbatim from CONTEXT.md:

- Safari banner dismissal persistence strategy (per-tab session, localStorage-forever, or time-boxed). FOUND-08 says "dismissible" — planner picks.
- Render-tier user-override UI. FOUND-09 requires override-via-localStorage honor; a user-facing toggle UI is NOT Phase 16 scope. Devtools / manual localStorage edit only for now.
- Exact Skeleton component design + location (reused between ViewportGate SSR-placeholder role and `next/dynamic` loading role).
- Exact matchmedia listener + teardown in ViewportGate.
- Exact structure of the AuthProvider + `(authed)/layout.tsx` subscribe effects (one useEffect vs two, nested conditions vs separate flags).
- Precise Next.js version pin (≥15.2.3 locked; planner chooses the minor at execution time based on then-current patch levels). **Research note:** project is ALREADY on 15.5.12 — see §Standard Stack §Next.js version.
- Async-params audit scope. `/draft/[matchId]` already uses `async params`. Planner greps for other dynamic routes during rename commits and patches any that are missed (unlikely; v0.5 backend phases were backend-only).
- Exact wording of `docs/frontend/component-hygiene.md` examples. Writer drafts per template.

### Deferred Ideas (OUT OF SCOPE)

Copied verbatim from CONTEXT.md — planner MUST NOT research or plan these:

- `useGatedSubscription(sql)` helper hook — inherited from 15.5 deferred list.
- ESLint custom rule for R8 Rule 2 (`useIsMobile` inside components).
- Render-tier user-facing toggle UI.
- Web Worker for asset prefetching — R2 explicit: not in v0.9.
- Moving `hsr_account` subscription to `(authed)/layout.tsx` — Phase 21.
- Tri-state `<AuthRequired>` overhaul — Phase 21.
- Cross-tab `BroadcastChannel` auth sync — Phase 21.
- Match-tier subscriptions at `(authed)/(match)/layout.tsx` — Phase 28.
- `view_active_users` / on-demand read reducers as replacement for `User` subscription.
- Safari banner dismissal persistence strategy revisit (only if UAT surfaces a problem).
- Imgur uploads wiring — Phase 32 (Phase 16 only adds to SW allowlist).

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-03 | Next.js ≥15.2.3 + `experimental.typedRoutes: true` | §Standard Stack §Next.js version — **CORRECTION: project is on 15.5.12 → use top-level `typedRoutes: true`, NOT `experimental.typedRoutes`**; §Pattern 1 (Enabling typedRoutes) |
| FOUND-04 | Route group renames: `(landing-page)→(public)`, `(authenticated)→(authed)`, `(game)/draft → (authed)/(match)/draft`; all `<Link>` and `router.push` callers updated | §Pattern 2 (5-commit rename sequence); §Code Examples §Audit broken hrefs; §Runtime State Inventory (5 absolute-path imports found) |
| FOUND-05 | `user` subscription → `(authed)/layout.tsx`; `useAuth.ts` retains only `view_my_profile` bootstrap | §Pattern 3 (Subscription ownership reshuffle); D-03, D-07, D-10 |
| FOUND-06 | `providers.tsx` subscribes globally to 7 public reference tables + `view_my_profile` | §Pattern 3; D-01, D-02, D-03, D-05 |
| FOUND-07 | Service Worker at `/public/sw.js` caches UploadThing asset CDN | §Pattern 5 (Service Worker scaffold); §Don't Hand-Roll (SW scope) |
| FOUND-08 | Safari warning banner + `getRenderTier()` returns `image-only` for Safari | §Pattern 6 (Render-tier detection); §Code Examples §Safari detection |
| FOUND-09 | `getRenderTier()` with 7-day TTL + VERSION bump invalidation + user override | §Pattern 6; D-21 |
| FOUND-10 | `<ViewportWriter />` writes `vp` cookie (1-year, SameSite=Lax) via matchMedia | §Pattern 7 (ViewportWriter); §Code Examples §matchMedia pattern |
| FOUND-11 | Server Components resolve viewport via cookie → desktop default (D-28: `userAgent()` dropped) | §Pattern 4 (ViewportGate SSR); D-27 reframes this requirement |
| FOUND-12 | `<ViewportGate />` renders `.desktop.tsx` / `.mobile.tsx` via `next/dynamic`; falls back to desktop | §Pattern 4; §Code Examples §next/dynamic sibling |
| FOUND-13 | Middleware positive-list matcher; cookie-less redirect to login; excludes `/sw.js`, `_next/*`, API | §Pattern 8 (Middleware); §Code Examples §middleware.ts |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **npm only** — never pnpm/yarn. All install commands in plans use `npm i`.
- **Windows-first dev environment** — bash via Git Bash. Shell commands use Unix syntax.
- **`.env.local` / `.env` protected** — never committed. Middleware must not touch these.
- **Autonomous execution during `/gsd-execute-phase`** — structural gates provide the safety payoff; don't insert "proceed?" prompts for in-branch commits, file writes inside `files_modified`, or standard tests/builds.
- **Gitignore guardrail** — no `git add -f`; plan `files_modified` frontmatter must not list gitignored paths.
- **Test files are verification layer** — do not create/edit/delete test files without explicit task. Phase 15.5's `auth-subscriptions.test.ts` runs unmodified (D-12).
- **Backend feature docs** — `docs/{feature}/architecture.md` on every backend change. Phase 16 touches `docs/auth/architecture.md` (subscription-ownership section) + ships NEW `docs/frontend/component-hygiene.md`.

---

## Summary

Phase 16 is a **structural-change, zero-new-features** phase. The work is:

1. **Version bump + config** — Pin Next.js ≥15.2.3 (CVE patch). Enable typedRoutes. The project is already on 15.5.12, so `typedRoutes: true` at the top level is the correct key, NOT `experimental.typedRoutes` (promoted stable in 15.5 per official docs).
2. **Rename 3 route groups + collapse `/draft`** via `git mv`, 5-commit sequence, typecheck gate between each.
3. **Add two `useTable` calls** to `GameDataProvider` (the 7-table expansion).
4. **Relocate two subscribe effects**: `view_my_profile` (Stage 1) from `useAuth.ts` → `AuthProvider`; `User` (Stage 2) from `useAuth.ts` → `(authed)/layout.tsx`. Preserve all 15.5 `smooth-experience` behaviors (D-14 checklist).
5. **Write a middleware.ts** with positive-list matcher reading `stdb_session` cookie.
6. **Write a 40-LOC sw.js** that intercepts ONLY `ufs.sh` and `i.imgur.com` hostnames. Register from `providers.tsx` gated on production-or-opt-in.
7. **Ship 3 viewport primitives + 1 utility** — `<ViewportGate>`, `<ViewportWriter>`, `<SafariWarning>`, `getRenderTier()`. Skeleton-first SSR avoids hydration mismatch (D-27).
8. **Ship `docs/frontend/component-hygiene.md`** with 5 R8 rules.

**Primary recommendation:** Plan this as three parallel waves: (a) **config + rename** (blocking — must land first), (b) **subscription reshuffle + middleware + providers wiring** (requires rename to land), (c) **viewport primitives + render-tier + SW + docs** (fully independent of a/b, can be authored alongside). Commit within a wave is sequential for a/b (due to compile dependency); wave c is orthogonal.

**The single highest-risk item:** async test of the behavior-preservation checklist D-14 after subscription relocation. The 15.5 harness `auth-subscriptions.test.ts` is the canonical regression guard and must pass unmodified.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| typedRoutes compile-time href validation | Build toolchain | — | Next.js generates `.next/types/**/*.ts` during `next build`; TypeScript compiler enforces |
| Route-group rename | Filesystem layout | Build toolchain | Route groups are URL-invisible directory conventions consumed at build time |
| `(authed)/layout.tsx` User subscription | Frontend Server (client boundary) | SpacetimeDB WS plane | Subscription is client-side (WS); route-group mount timing IS the privacy gate |
| `view_my_profile` subscription (AuthProvider) | Browser / Client | SpacetimeDB WS plane | Fires on connect regardless of auth state; filtered server-side by `ctx.sender` |
| 7 public-table subscriptions (GameDataProvider) | Browser / Client | SpacetimeDB WS plane | Reference data replication layer; small static rows broadcast on connect |
| Middleware cookie-gate redirect | Edge Runtime (Next.js middleware) | — | Runs at network boundary before route resolution. 15.5 used the Edge default; stays Edge (Node.js runtime is optional and out of scope for Phase 16) |
| Service Worker asset-CDN cache | Browser / Service Worker thread | — | SW runs in its own thread, separate from main. Fetch-event intercepts only when URL origin ≠ app origin |
| `<ViewportGate>` sibling selection | Browser / Client | Frontend Server (Skeleton placeholder) | SSR renders Skeleton when cookie absent (dual-DOM); client matchMedia + `next/dynamic` resolves to sibling |
| `<ViewportWriter>` cookie write | Browser / Client | — | `document.cookie` write post-mount; client-only |
| `getRenderTier()` capability detection | Browser / Client | localStorage (7-day TTL cache) | Feature detection requires `navigator`, `WebGL`, etc.; cache invalidates on VERSION bump |
| `<SafariWarning>` banner | Browser / Client | — | UA-sniff → conditional render; dismissal persistence is client-side |
| typedRoutes catching renamed-group breakage | Build toolchain | — | `next build` fails on stale `<Link>` references; this IS the D-32 safety net |

---

## Standard Stack

### Core — already installed (package.json)

| Library | Installed Version | Purpose | Why Standard |
|---------|-------------------|---------|--------------|
| `next` | `15.5.12` (resolved via `^15.0.0`) | App Router, middleware, `next/link`, `next/dynamic`, `next/headers` | Framework — [VERIFIED: `npm ls next`] |
| `react` + `react-dom` | `18.3.1` | Component tree, hydration, `useEffect`/`useState` hooks | Framework — [VERIFIED: package.json] |
| `next-auth` | `4.24.13` | Discord OAuth; read in `useAuth` via `useSession` | Unchanged in Phase 16 — [VERIFIED: package.json] |
| `spacetimedb` | `2.1.0` | WS connection, `useTable` hook, subscriptionBuilder | Unchanged — [VERIFIED: package.json] |
| `@heroui/*` | `2.x` | UI components for Navbar/Footer/banner — **but not used by Phase 16 primitives per D-25** | Styling-agnostic constraint — [CITED: CONTEXT.md D-25] |
| `typescript` | `~5.6.2` | Enables typedRoutes — [CITED: https://nextjs.org/docs/app/api-reference/config/typescript] | [VERIFIED: package.json] |

### Next.js version decision

**Installed:** `next@15.5.12` [VERIFIED: `npm ls next` 2026-04-18]
**Latest 15.x available:** `15.5.15` [VERIFIED: `npm view "next@>=15.2.3 <16" version`]
**Latest overall:** `16.2.4` [VERIFIED: `npm view next version`]
**CVE-2025-29927 patched in:** `14.2.25` and `15.2.3` [CITED: https://nvd.nist.gov/vuln/detail/CVE-2025-29927, Datadog Security Labs analysis]
**typedRoutes stable at top level as of:** `15.5.0` (August 2025) [CITED: https://nextjs.org/blog/next-15-5]

**CRITICAL planner correction:**
- CONTEXT.md D-16 says pin `next@^15.2.3`. That's a floor; resolved version today is 15.5.12.
- CONTEXT.md D-29 Commit 1 action says "next.config.ts: add experimental: { typedRoutes: true }". **THAT IS WRONG for the installed version.** On 15.5+, the correct key is top-level `typedRoutes: true`.
- The Next.js docs explicitly state: *"This option has been marked as stable, so you should use `typedRoutes` instead of `experimental.typedRoutes`."* [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes, last-updated 2026-04-15]
- `experimental.typedRoutes` still works on 15.5+ (backwards compat) but will be removed in Next.js 16 along with deprecation warnings beginning in 15.5. The project will take a deprecation warning on every `next build` if it uses the experimental key.

**Recommended version pin for package.json:** `"next": "^15.5.0"` (stable typedRoutes + CVE patch + same major). Do NOT jump to `next@latest` — that resolves to 16.x, which renames `middleware.ts` → `proxy.ts` [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/proxy Version History v16.0.0] and triggers a separate migration. Phase 16 stays on 15.5.x.

### Supporting — no new npm dependencies

| Decision | Rationale |
|----------|-----------|
| No `react-responsive` / `usehooks-ts` | `matchMedia` is a ~15-LOC hook when you only need `(pointer: coarse) and (hover: none)`. Adding a dep for Phase 16 breaks D-25's "stdlib React + Next only" mandate for primitives. |
| No `workbox` / `@serwist/next` / `next-pwa` | [CITED: REQUIREMENTS.md Out of Scope table: "Hand-written 40-LOC SW fits our asset-CDN-only caching need (DECISIONS R7 do-not-add list)"] |
| No `bowser` / `ua-parser-js` | Safari detection is one regex against `navigator.userAgent`; adding a dep is overkill. |
| Keep `spacetimedb/react` `useTable` | [CITED: CONTEXT.md D-04] — default mechanism; only swap to explicit `subscriptionBuilder` with documented reason. |

**Installation (none required):**

```bash
# Next.js upgrade is the only install action
npm i next@^15.5.0
```

**Version verification at plan time:** Planner SHOULD run `npm view next@^15.5 version` at execution time to confirm the then-current 15.5.x patch (research captured 15.5.15 as highest 15.5.x).

---

## Architecture Patterns

### System Architecture Diagram

```
                    ┌──────────────────────────────────┐
                    │  First HTTP request (any route)   │
                    └───────────────┬──────────────────┘
                                    │
                    ┌───────────────▼──────────────────┐
                    │   middleware.ts (Edge Runtime)    │
                    │   Positive-list matcher match?    │
                    │   Read stdb_session cookie        │
                    └───┬──────────────────────────┬───┘
                  match │                      no match
                        │                          │
                 cookie present                    │
                   ? y  ? n                        │
                   │    │                          │
                   │    ▼                          │
                   │   NextResponse.redirect(/)    │
                   ▼                               ▼
          NextResponse.next() ────────── page SSR continues
                    │
                    ▼
    ┌───────────────────────────────────────────┐
    │  app/layout.tsx (root)                     │
    │  └─ NavBar + <SafariWarning /> banner      │
    │  └─ <Providers>                            │
    │      └─ SessionProvider (next-auth)        │
    │          └─ HeroUIProvider                 │
    │              └─ SpacetimeDBProvider ───────┼─── WS connect to maincloud
    │                  └─ AuthProvider           │
    │                   (Stage 1: view_my_profile)
    │                      └─ GameDataProvider   │
    │                        (7× useTable fires) │
    │                          └─ <ViewportWriter/>    writes vp cookie
    │                          └─ <SW-register useEffect>
    │                          └─ {children}     │
    └───────────────────────────────────────────┘
                    │
           ┌────────┴────────┐
           │                 │
           ▼                 ▼
     (public)/…         (authed)/layout.tsx
     direct render       <AuthRequired>
                          └─ <DeletionBanner/>
                          └─ Stage 2 User sub (useEffect)
                          └─ (match)/layout.tsx (empty passthrough)
                              └─ draft/[matchId]/page.tsx
                          └─ {children}

    Separately, in browser service worker thread:
    ┌───────────────────────────────────────────┐
    │  /public/sw.js                             │
    │  fetch event →                             │
    │    if origin === location.origin: skip     │
    │    if hostname ∈ {ufs.sh, i.imgur.com}:    │
    │      cache.match || fetch+cache            │
    │    else: skip (passthrough)                │
    └───────────────────────────────────────────┘
```

### Component Responsibilities

| File | Owns | Lines (est.) |
|------|------|--------------|
| `next.config.ts` | `typedRoutes: true` + CSP headers (existing) | +1 line |
| `middleware.ts` (new) | Positive-list matcher, `stdb_session` cookie read, `NextResponse.redirect` to `/` | ~30 |
| `public/sw.js` (new) | `install`/`activate`/`fetch` handlers; origin check; allowlist; cache-first | ~40 |
| `app/providers.tsx` | SW registration useEffect; existing provider stack | +15 |
| `app/layout.tsx` | Mount `<SafariWarning />` + `<ViewportWriter />` inside providers | +2 |
| `app/(public)/…` (renamed) | Same content, new directory | 0 churn |
| `app/(authed)/…` (renamed) | Same content, new directory | 0 churn |
| `app/(authed)/(match)/layout.tsx` (new) | Empty passthrough | 3 |
| `app/(authed)/(match)/draft/[matchId]/page.tsx` (moved) | Existing draft page content | 0 |
| `app/(authed)/layout.tsx` | Stage 2 User subscribe + onUser callbacks | +30 (from 10) |
| `app/dev-unregister-sw/page.tsx` (new) | Dev-only SW/cache unregister page + prod 404 gate | ~40 |
| `components/features/auth/components/AuthProvider.tsx` | Stage 1 `view_my_profile` subscribe effect | +40 (from 13) |
| `components/features/auth/hooks/useAuth.ts` | Loses Stage 1 + Stage 2 effects; keeps everything else | ~-60 |
| `components/features/game-data/components/GameDataProvider.tsx` | +2 `useTable` calls (HsrCharacterArchetype, Archetype); context type +2 fields | +10 |
| `components/globals/viewport/ViewportGate.tsx` (new) | Dynamic sibling selection via matchMedia + next/dynamic | ~50 |
| `components/globals/viewport/ViewportWriter.tsx` (new) | Writes `vp` cookie post-mount | ~25 |
| `components/globals/viewport/SafariWarning.tsx` (new) | UA-sniff + dismissible banner | ~40 |
| `lib/render-tier.ts` (new) | Pure util: `getRenderTier()`, `VERSION`, cache helpers | ~80 |
| `docs/frontend/component-hygiene.md` (new) | 5 R8 rules + Good/Bad examples | ~150 |
| `docs/auth/architecture.md` | Update Subscription Lifecycle section per relocation | +20 |

### Recommended Project Structure (after Phase 16)

```
app/
├── (public)/                          # renamed from (landing-page)
│   ├── costs/
│   ├── teambuilder/
│   ├── layout.tsx
│   └── page.tsx
├── (authed)/                          # renamed from (authenticated)
│   ├── admin-view/
│   ├── lobby/
│   ├── profile/
│   ├── (match)/                       # NEW nested group
│   │   ├── layout.tsx                 # empty passthrough (D-31)
│   │   └── draft/[matchId]/           # moved from (game)/draft
│   │       └── page.tsx
│   └── layout.tsx                     # now owns Stage 2 User subscribe
├── api/
├── dev-unregister-sw/                 # NEW, prod-gated 404
│   └── page.tsx
├── layout.tsx                         # root
└── providers.tsx                      # +SW register useEffect

components/
└── globals/
    ├── layout/                        # existing
    ├── icons/                         # existing
    ├── modals/                        # existing
    └── viewport/                      # NEW per D-22
        ├── ViewportGate.tsx
        ├── ViewportWriter.tsx
        └── SafariWarning.tsx

lib/
├── session-cookie.ts                  # existing
├── spacetimedb.ts                     # existing
└── render-tier.ts                     # NEW per D-21

docs/
├── auth/                              # existing — architecture.md gets Subscription Lifecycle update
├── …
└── frontend/                          # NEW directory
    └── component-hygiene.md           # NEW per D-23

middleware.ts                          # NEW, root level
public/
├── sw.js                              # NEW per D-17/D-18
└── dev-unregister-sw-README.md        # Optional: doc URL
```

### Pattern 1: Enabling typedRoutes on Next.js 15.5+

**What:** Turn on compile-time href validation for `<Link>` and `router.push/replace/prefetch`. Catches stale paths referencing old `(landing-page)` / `(authenticated)` / `(game)` groups.

**When to use:** Permanently on — enforces all future rename phases.

**Gotcha:** Route groups like `(public)` and `(authed)` are URL-invisible — they do NOT appear in the generated `Route` type. A `<Link href="/profile">` is valid whether `profile` is under `(authed)` or at root. What typedRoutes DOES catch:
- A `<Link href="/oldpath">` where no page.tsx at `/oldpath` exists in the filesystem, regardless of route groups.
- A broken `href` like `/profille` (typo). [CITED: https://nextjs.org/docs/app/api-reference/config/typescript]
- A non-literal `href` requires `as Route` cast.

**Implication for Phase 16:** Renaming a route group from `(authenticated)` to `(authed)` does NOT by itself break typedRoutes. What WILL break the build: any absolute-path IMPORT like `import styles from "@/app/(landing-page)/teambuilder/page.module.css"` (5 such sites found in codebase — see §Runtime State Inventory).

**Example:**
```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true, // ✓ correct key on Next 15.5+
  // experimental: { typedRoutes: true }, // ✗ deprecated; triggers warning in 15.5+
  async headers() { /* existing CSP … */ },
};

export default nextConfig;
```

Source: [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes] last-updated 2026-04-15.

### Pattern 2: 5-commit route-group rename sequence

**What:** Rename `(landing-page)→(public)`, `(authenticated)→(authed)`, move `(game)/draft → (authed)/(match)/draft` in 5 atomic commits with typecheck gate between.

**When to use:** Phase 16 Wave A. Locked by D-29.

**Why this sequence:** Each commit is individually buildable; a broken commit in the middle does not leave the repo in a non-compiling state. `git bisect` across these commits remains meaningful.

**Commands (from D-29, annotated):**
```bash
# COMMIT 1 — Prerequisites
npm i next@^15.5.0
# Edit next.config.ts: typedRoutes: true at top level (NOT experimental.typedRoutes — see Pattern 1)
npm run build  # surfaces pre-existing broken hrefs
# Fix each broken href per D-32 (no as Route, no @ts-expect-error)
git commit -m "chore(next): bump to 15.5.x + enable typedRoutes"

# COMMIT 2 — Rename (landing-page) → (public)
git mv app/\(landing-page\) app/\(public\)
# Fix 5 absolute-path imports in components/features/team-builder/* (see Runtime State Inventory)
npm run build && npm run test:typecheck
git commit -m "refactor(app): rename (landing-page) route group to (public)"

# COMMIT 3 — Rename (authenticated) → (authed)
git mv app/\(authenticated\) app/\(authed\)
npm run build && npm run test:typecheck
git commit -m "refactor(app): rename (authenticated) route group to (authed)"

# COMMIT 4 — Move (game)/draft → (authed)/(match)/draft
mkdir "app/(authed)/(match)"
# Create app/(authed)/(match)/layout.tsx as empty passthrough (D-31):
#   export default function MatchLayout({ children }: { children: React.ReactNode }) {
#     return <>{children}</>;
#   }
git mv app/\(game\)/draft app/\(authed\)/\(match\)/draft
rmdir app/\(game\)  # empty
# Manual verify: /draft/abc redirects anon users to login
npm run build && npm run test:typecheck
git commit -m "refactor(app): collapse (game)/draft under (authed)/(match)"

# COMMIT 5 — Sanity sweep
grep -r "app/(landing-page)\|app/(authenticated)\|app/(game)" app/ components/ lib/
# Fix any remaining absolute-path imports
npm run build && npm run test:typecheck
git commit -m "refactor(app): update file-path references after route-group migration"
```

**Windows note:** On Git Bash, unescaped parentheses in paths need backslash-escaping OR double-quoting: `git mv "app/(landing-page)" "app/(public)"`. [VERIFIED: project runs on Windows 11 + Git Bash per CLAUDE.md environment section]

### Pattern 3: SpacetimeDB subscription ownership reshuffle

**What:** Move `view_my_profile` sub from `useAuth.ts` Stage 1 → `AuthProvider`. Move `User` sub from `useAuth.ts` Stage 2 → `(authed)/layout.tsx`.

**When to use:** Phase 16 Wave B. Locked by D-03, D-07, D-08, D-10, D-11.

**Why this is the right structure:** Phase 15.5 landed a functional gate via ref-based condition `currentUser != null || hadUserIdOnMount.current || hadSessionCookie.current`. Phase 16 replaces that gate with a **structural** gate: `(authed)/layout.tsx` only mounts for authed routes, so `useEffect`s inside it never fire for anonymous visitors. Same observable behavior (anon never receives User rows), simpler code path, no runtime ref bookkeeping.

**Strict Mode double-mount defense:** The `subscribedRef` guard pattern (from `useAuth.ts:17`) MUST be replicated in both new locations per D-11. Without it, React 18 Strict Mode's intentional double-mount causes duplicate `.subscribe()` calls, burning energy + risking double-fire of `onApplied`.

**Callback placement:** `onUserInsert` / `onUserUpdate` callbacks MUST register inside the Stage 2 effect in `(authed)/layout.tsx`, not in AuthProvider. Anon visitors never reach this layout, so callbacks are dead code for them anyway. Registering in Stage 1 would be both wrong (anon's User table is empty — nothing to trigger on) and architecturally confusing.

**Reader survives:** `readProfileFromConnection` at `useAuth.ts:208-278` reads from `conn.db.view_my_profile.iter()` directly. It does not care WHICH useEffect triggered the subscription — once data is in the cache, the reader finds it. This is why D-10 allows the reader to stay put.

### Pattern 4: `<ViewportGate>` Skeleton-first SSR (per D-27)

**What:** Dual-DOM pages render `<Skeleton />` on server when `vp` cookie is absent; client post-mount resolves viewport via `matchMedia` and `next/dynamic`-imports the correct sibling.

**When to use:** Only Phases 27 (Calendar), 31 (Match Drafting), 35 (Tournament brackets). Every other page ships single-DOM responsive (R4 + D-26).

**Why Skeleton-first beats `userAgent()` guess:** A `userAgent()` guess [CITED: https://nextjs.org/docs/app/api-reference/functions/userAgent] is an educated guess, not deterministic — `device.type` returns `undefined` for desktop browsers but also for some embedded browsers, game consoles, and ambiguous UAs. If the server guesses desktop and the client resolves mobile, the client must swap — which is exactly the hydration mismatch we wanted to avoid. Skeleton-first sidesteps this entirely: server-rendered content matches the first client render exactly (both render the Skeleton). The sibling swap happens in a `useEffect` post-hydration, which is hydration-safe by definition. [CITED: https://react.dev/reference/react-dom/client/hydrateRoot + https://www.joshwcomeau.com/react/the-perils-of-rehydration/]

**Decision tree in component:**
```
ViewportGate props: { desktop, mobile? }, server cookie `vp`

Server render:
  ├─ mobile is undefined (single-DOM): render desktop directly
  ├─ vp === 'desktop': render desktop directly
  ├─ vp === 'mobile' && mobile: render mobile directly
  └─ vp is undefined: render <Skeleton />

Client mount:
  ├─ typeof window ≠ 'undefined' + useEffect
  ├─ match = window.matchMedia('(pointer: coarse) and (hover: none)')
  ├─ if match.matches && mobile → dynamic-import mobile, render
  ├─ else dynamic-import desktop, render
  └─ (ViewportWriter writes/refreshes vp cookie post-resolution)
```

**Falls back to desktop if mobile sibling absent** — FOUND-12 explicit — and in single-DOM pages (97% of the app) there's no Skeleton at all, zero runtime cost.

### Pattern 5: Service Worker scaffold (40 LOC, asset-CDN-only)

**What:** Intercept fetches to `ufs.sh` + `i.imgur.com` ONLY. Short-circuit everything else to native fetch. Cache-first strategy for asset CDNs.

**When to use:** Registered in production, opt-in via `NEXT_PUBLIC_ENABLE_SW=true` in dev (D-19).

**Why hand-rolled over Workbox:** [CITED: REQUIREMENTS.md Out of Scope table + .planning/research/DECISIONS.md R7] The full asset-CDN-only use case is a single `fetch` handler with a 2-entry hostname allowlist. Workbox is ~20 KB gzipped + a build-step; hand-written sw.js is ~40 LOC uncompressed + zero build step.

**Critical: SW scope vs fetch-event URL filtering are different things.**
- **Scope** (from `navigator.serviceWorker.register('/sw.js', { scope: '/' })`) controls which PAGES the SW can claim clients for. Placing sw.js at `/public/sw.js` serves it at `/sw.js` which gives `/` scope by default [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers]. This is right for HSRPVP — we want SW active on all pages.
- **Fetch-event URL filter** decides what to DO with each intercepted request. The allowlist is applied inside `event.respondWith` — NOT at scope level. Scope cannot limit "only cross-origin fetches"; that's fetch-event logic.

**This is the concrete short-circuit pattern (line-numbered for code-example reference):**

```js
// public/sw.js
const VERSION = 1;
const ASSET_CACHE = `hsrpvp-assets-v${VERSION}`;
const ALLOWED_HOSTS = ['ufs.sh', 'i.imgur.com']; // D-17

self.addEventListener('install', (event) => {
  console.log('[SW] install v' + VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate v' + VERSION);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== ASSET_CACHE).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // D-18: Never intercept app origin
  if (url.origin === self.location.origin) return;

  // D-17: Only intercept allowlisted asset CDNs
  const hostAllowed = ALLOWED_HOSTS.some(
    (h) => url.hostname === h || url.hostname.endsWith('.' + h)
  );
  if (!hostAllowed) return;

  console.log('[SW] intercept', url.hostname, url.pathname);
  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      // Only cache opaque-safe status 200 responses with method GET
      if (response.ok && event.request.method === 'GET') {
        cache.put(event.request, response.clone());
      }
      return response;
    })
  );
});
```

**Cross-origin caveat:** Cross-origin CDN responses are often "opaque" (type: 'opaque') because the CDN does not serve CORS headers. Opaque responses CAN be cached and returned, but you cannot read body/status — you only know the browser did get bytes back. UploadThing serves CORS headers for anonymous reads (verified by existing behavior — portraits load today without SW). Imgur's `i.imgur.com` direct image URLs also serve CORS-friendly responses.

**Reference:** [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers], [CITED: https://dev.to/progressier/handling-opaque-responses-in-a-service-worker-fgd]

### Pattern 6: `getRenderTier()` pure util with 7-day cache

**What:** Returns `'full' | 'image-only'` based on WebGL + core-count + Safari sniff + user override. Cache invalidated via `VERSION` bump.

**When to use:** Consumed by match-pedestal Spine rendering (Phase 31) and asset-prefetch gating (Phase 17 PUB-12).

**Decision chain (per FOUND-08, FOUND-09, D-21):**

```
1. User override in localStorage ('hsrpvp_render_tier_override' = 'full' | 'image-only')
   → honor it, return
2. Safari UA sniff
   → return 'image-only' (D-21 and FOUND-08 lock this)
3. Cache hit with VERSION match AND < 7d old
   → return cached value
4. Feature probe:
   - WebGL context creation succeeds?
   - navigator.hardwareConcurrency >= 4?
   - !UNMASKED_RENDERER contains 'SwiftShader' | 'Basic Render Driver'
   → all pass: 'full'; else 'image-only'
5. Cache the result with VERSION + timestamp
6. Return
```

**Why these checks:** [CITED: https://browserleaks.com/webgl on GPU identification, https://en.wikipedia.org/wiki/WebGL on software renderer detection] Chrome uses SwiftShader for software WebGL (slow); hardwareConcurrency < 4 correlates strongly with low-end devices that struggle with Spine animation (empirical).

**Safari image-only rationale:** [CITED: REQUIREMENTS.md Out of Scope "Safari active support"] — Safari defensively image-only with dismissible warning; bug reports for Safari rejected. This is a hard product decision, not a technical limitation.

**VERSION bump invalidation pattern:**
```ts
// lib/render-tier.ts
export const VERSION = 1; // bump to invalidate all caches

interface CachedTier {
  tier: 'full' | 'image-only';
  version: number;
  ts: number;
}

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CACHE_KEY = 'hsrpvp_render_tier_cache';

function getCached(): CachedTier | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedTier;
    if (parsed.version !== VERSION) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}
```

### Pattern 7: `<ViewportWriter />` matchMedia → cookie

**What:** On mount, evaluate `(pointer: coarse) and (hover: none)`, write `vp=mobile` or `vp=desktop` cookie with 1-year max-age + SameSite=Lax. Re-evaluate on window resize (rare — trackpad/mouse swap).

**When to use:** Mounted once in `app/layout.tsx` root per CONTEXT code_context.

**Why this media query:** [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover] `(pointer: coarse)` alone classifies stylus and touch-pad-hybrid laptops as "coarse" in edge cases. Combining with `(hover: none)` correctly excludes hybrids. This is the standard industry test for "touch-first, no mouse" devices.

**Hydration-safe pattern:** Writer runs inside `useEffect` only. Never during render. Initial render sends no DOM; the component returns `null`. This means:
- SSR renders nothing → client renders nothing → hydration matches trivially.
- `useEffect` runs client-only post-hydration → cookie gets written → any subsequent navigation benefits from the cookie being present at SSR time.

**Race with ViewportGate:** First-ever visit with no cookie → Skeleton renders on server → client mounts → matchMedia + `<ViewportWriter>` both run → Writer writes cookie → Gate swaps to correct sibling. All of this is one React render cycle post-hydration. Acceptable UX.

### Pattern 8: Middleware positive-list matcher

**What:** A `middleware.ts` at repo root. Config exports an array of explicit `/path/:path*` sources. Body reads `request.cookies.get('stdb_session')` and redirects to `/` if absent.

**When to use:** Phase 16 Wave B. Locked by D-15.

**Why positive-list matching is safer than negative regex:** [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/middleware §Matcher] A negative regex like `/((?!api|_next/static|sw.js|…).*)` is a single source of truth but fragile — forgetting one exclusion silently broadens the matcher to run middleware on assets, killing perf. Positive-list is explicit: middleware only runs on paths you enumerated. New authed pages later (Phase 22 admin sub-pages, Phase 24 /profile/[userId], Phase 28 /lobby/[id], Phase 31 /draft/[matchId]) fit the `:path*` wildcards without re-edit.

**Why `has`/`missing` cookie conditions are NOT used:** Tempting idea: `{ source: '/profile/:path*', missing: [{ type: 'cookie', key: 'stdb_session' }] }` — middleware auto-skips matched-but-cookie-present requests. Downside: the cookie PRESENCE doesn't mean the user is authenticated (cookie is client-written and non-secret). Reading it in the body lets you ALSO trace via console.log per D-33 ("cookie-present vs cookie-absent"). Use `has`/`missing` only if observability cost is unacceptable.

**CVE-2025-29927 mitigation:** Upgrading to 15.5.x is sufficient. The patch verifies the `x-middleware-subrequest` header via a cryptographic server-side value [CITED: https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass]. No code change on our side. However, per the official advice, middleware is NOT the auth trust boundary [CITED: REQUIREMENTS.md Out of Scope "Middleware as auth trust boundary: Middleware is UX optimization only; real auth is SpacetimeDB RLS at reducer level"] — our middleware is redirect UX, not security enforcement.

### Anti-Patterns to Avoid

- **`experimental.typedRoutes: true` on Next.js 15.5+** — deprecated. Triggers warning. Use top-level `typedRoutes: true`. [CITED: Next.js 15.5 blog post].
- **`as Route` casts to silence typedRoutes errors** — per D-32, these ARE the bugs typedRoutes is supposed to surface. Fix the href or the route file.
- **`suppressHydrationWarning` on ViewportGate** — masks real hydration bugs. The Skeleton-first pattern eliminates mismatch by construction; never need to suppress.
- **Reading `window` / `document` / `matchMedia` during render** — [CITED: https://nextjs.org/docs/messages/react-hydration-error] causes hydration mismatch. All viewport detection goes inside `useEffect`.
- **Single `subscriptionBuilder('SELECT … view_my_profile … User')`** combining the two — breaks the D-05 anon-safety contract. Stage 1 (public) must fire unconditionally; Stage 2 (private) must fire only when gate opens.
- **Dynamic matcher strings** — [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/middleware] "The matcher values need to be constants so they can be statically analyzed at build-time." No `[".profile", ".admin"].map(p => …)`.
- **`next lint` scripts** — deprecated in 15.5 [CITED: https://nextjs.org/blog/next-15-5]. Package.json has no `next lint`, so no action needed, but don't re-add it.
- **Workbox / next-pwa / @serwist/next** — [CITED: REQUIREMENTS.md Out of Scope "next-pwa / @serwist/next: Hand-written 40-LOC SW fits our asset-CDN-only caching need"].
- **Server-side viewport detection via `userAgent()`** — D-27/D-28 explicitly exclude this. Skeleton-first is the chosen mechanism.
- **SW scope trick with `Service-Worker-Allowed` header** — not needed here. `/public/sw.js` → served at `/sw.js` → default root scope. Overkill for our use case.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route-path validation at compile time | Custom script scanning `<Link href>` strings | `typedRoutes: true` (native Next.js) | Generates `.next/types/**/*.ts`; TypeScript compiler catches invalid hrefs during `next build`. [CITED: https://nextjs.org/docs/app/api-reference/config/typescript] |
| Reading cookies in middleware | `request.headers.get('cookie')` + split | `request.cookies.get('stdb_session')?.value` | Built-in `RequestCookies` API handles parsing, encoding. [CITED: https://nextjs.org/docs/app/api-reference/functions/next-request] |
| HTTP redirects from middleware | Custom `new Response('', { status: 307, headers: { Location } })` | `NextResponse.redirect(new URL('/', request.url))` | Handles URL normalization, RSC headers, status code correctness. [CITED: https://nextjs.org/docs/app/api-reference/functions/next-response] |
| Client-side table subscriptions | Manual `conn.subscriptionBuilder()` + React state sync | `useTable(tables.Foo)` from `spacetimedb/react` | Built-in; handles onApplied, insert/update/delete, unmount cleanup. D-04 locks this choice. |
| WebGL feature detection | Custom canvas-probe + pixel-read checks | `canvas.getContext('webgl2')?.getExtension('WEBGL_debug_renderer_info')` + basic null check | Single API for capability + GPU identification. [CITED: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/By_example/Detect_WebGL] |
| Media-query listener | `window.addEventListener('resize', …)` + custom threshold | `window.matchMedia('(pointer: coarse) and (hover: none)')` + `.addEventListener('change', …)` | Native event is fired only on actual capability change, not on every resize pixel. [CITED: MDN @media/hover Baseline Widely available since 2018] |
| PWA/SW scaffold with precaching | `@serwist/next` / `next-pwa` / workbox plugin | 40-LOC hand-written `public/sw.js` | [CITED: REQUIREMENTS.md + DECISIONS.md R7 do-not-add list] — asset-CDN-only caching doesn't need offline-first, precaching, or routes. |
| Server-side mobile detection | UA regex + project-specific sniffing | `userAgent(request)` from `next/server` IF ever needed | Built-in, parses UA into typed `device` object. [CITED: https://nextjs.org/docs/app/api-reference/functions/userAgent]. Note: **not** used in Phase 16 per D-27. |
| Cross-tab auth sync | BroadcastChannel in Phase 16 | **Defer to Phase 21** | Out of scope; CONTEXT.md Deferred Ideas. |
| Subscription gate via refs | Refs + conditional effect | Route-group mount (D-07) | Route-group is a structural gate; `(authed)/layout.tsx` doesn't mount for anon. Simpler than ref bookkeeping. |

**Key insight:** Next.js 15 and SpacetimeDB together already provide the primitives Phase 16 needs. Every "don't hand-roll" choice above prefers the native primitive. The exceptions (SW, viewport gate, render-tier util) are hand-rolled because the use case is narrow enough that libraries add more surface than they save. This aligns with DECISIONS.md R7 "do-not-add" mindset.

---

## Runtime State Inventory

> Phase 16 is a rename/refactor phase. Runtime state audit is mandatory.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | None — route-group names are compile-time directory names. SpacetimeDB stores no paths. `localStorage` keys in use (`spacetimedb_user_id`, `spacetime_token`, `stdb_session` cookie, future `hsrpvp_render_tier_cache`, future `vp` cookie) are name-stable across rename. | None |
| **Live service config** | None — no external service (Vercel, Datadog, Tailscale, Cloudflare) embeds `(landing-page)` / `(authenticated)` strings in its dashboard configuration. CSP headers in `next.config.ts` don't reference route-group paths (they restrict origins not paths). | None — but planner should double-check CSP headers in Commit 1 and note no route-path references exist |
| **OS-registered state** | None — no Windows Task Scheduler task references this project's route names. No pm2 / launchd / systemd units. | None |
| **Secrets / env vars** | None — `.env.local` contains SpacetimeDB + Discord secrets, no route-path references. `NEXT_PUBLIC_ENABLE_SW` (new, optional) is a NAME, not a renamed thing. | None |
| **Build artifacts / installed packages** | `.next/types/**/*.ts` — stale route types after the rename. Auto-regenerated by `next build`; D-29's typecheck gate between commits forces regeneration. `node_modules/.cache/**` — cleared by `npm i next@^15.5.0` in Commit 1 implicitly (version change busts the cache). | None — handled by D-29 build-between-commits sequence |
| **Source-code string references (grep audit)** | **5 absolute-path imports will break on Commit 2**: `components/features/team-builder/LoadoutControls.tsx`, `LoadoutDropdown.tsx`, `SynergyDisplay.tsx`, `TeamRoster.tsx`, `Teamslot.tsx` — all import `@/app/(landing-page)/teambuilder/page.module.css`. [VERIFIED: Grep tool run against codebase 2026-04-18]. Plus: `docs/auth/architecture.md` has a "Subscription Lifecycle" section referencing the old useAuth 2-stage design — needs content update per D-03/D-07 relocation (this is content not path, but flagged for completeness). | **Fix 5 imports in Commit 2** (before typecheck gate) — update path to `@/app/(public)/teambuilder/page.module.css`. These are the hrefs Commit 5's sanity sweep will CATCH if missed — but they'll ALSO fail Commit 2's typecheck, so planner should include them explicitly in Commit 2 diff. |

**The canonical question:** *After every file in the repo is updated, what runtime systems still have the old string cached, stored, or registered?* **Answer: nothing.** All five categories audited cleanly. The only real runtime state that matters is the 5 absolute-path imports, and the 5-commit sequence catches them at Commit 2's typecheck gate.

---

## Common Pitfalls

### Pitfall 1: `experimental.typedRoutes` on Next.js 15.5+
**What goes wrong:** Using the experimental key works (backwards-compat preserved) but triggers a deprecation warning on every `next build`. In Next.js 16, the key is fully removed and `next build` fails.
**Why it happens:** Training data and older tutorials reference `experimental.typedRoutes`. The Phase 16 CONTEXT even has it locked at D-29 Commit 1. But the docs page explicitly says to use top-level `typedRoutes` on 15.5+.
**How to avoid:** Use `typedRoutes: true` at the top level, NOT `experimental.typedRoutes`. Planner overrides D-29 Commit 1's literal wording in favor of the config-correctness.
**Warning signs:** `next build` output shows "experimental.typedRoutes has been moved to typedRoutes" or similar deprecation banner.

### Pitfall 2: Hydration mismatch from `matchMedia` during render
**What goes wrong:** Writing `const isMobile = typeof window !== 'undefined' && window.matchMedia('…').matches;` during render produces different initial HTML on server vs client → React hydration error.
**Why it happens:** Server has no `window`, returns `false`. Client has `window`, returns `true` for mobile users. The first render mismatches.
**How to avoid:** Follow the 2-pass render pattern. Initial state is always the server-safe default (e.g., `false` / `'desktop'`). Update state inside `useEffect` post-hydration. ViewportGate's Skeleton-first pattern (D-27) is this pattern formalized. [CITED: https://react.dev/reference/react-dom/client/hydrateRoot + https://www.joshwcomeau.com/react/the-perils-of-rehydration/]
**Warning signs:** Console error "Hydration failed because the initial UI does not match what was rendered on the server."

### Pitfall 3: SW `fetch` handler catching app-origin requests
**What goes wrong:** Without the `url.origin === self.location.origin` short-circuit, the SW would intercept every app-origin request — including the Next.js RSC stream, API calls, and SpacetimeDB WebSocket upgrade. Any caching or error in the handler would break the app.
**Why it happens:** SW fetch events fire for EVERY resource the page requests, same-origin AND cross-origin [CITED: https://web.dev/learn/pwa/serving]. Scope controls which PAGES the SW claims, not which URLs it intercepts.
**How to avoid:** FIRST line in the fetch handler is the origin check (D-18). SECOND line is the hostname allowlist check. Anything else is guaranteed to return `undefined` from the handler, passing through to default browser fetch.
**Warning signs:** WebSocket reconnects, 500s on API routes, NavBar flickering — symptoms of the SW cache returning stale responses or errors for app-origin requests.

### Pitfall 4: Middleware runs on `_next/*` or `sw.js` by accident
**What goes wrong:** A negative-regex matcher that forgets to exclude `/sw.js` causes the middleware to redirect even the SW registration fetch. SW silently fails to install.
**Why it happens:** Easy to miss one path in a big negative-regex. Positive-list (D-15) avoids this class of bug entirely.
**How to avoid:** Use the positive-list matcher from D-15. Verify during Wave B by visiting `/sw.js` in a browser while running `next dev` — should return the sw.js content, NOT a redirect.
**Warning signs:** Service Worker not installed (check Application tab in DevTools); static assets 404 on first paint.

### Pitfall 5: `onUserInsert` / `onUserUpdate` callbacks fire on initial subscription apply
**What goes wrong:** SpacetimeDB SDK fires onInsert/onUpdate callbacks for EVERY row that matches the subscription's initial state, tagged with `ctx.event.tag === 'SubscribeApplied'` (not `'Reducer'`). If the callback reads-profile-from-connection on every insert, you double-read on reconnect + anytime StrictMode remounts.
**Why it happens:** The SDK is documenting a truth: rows "arrive" via insert events whether they're new or initial. Callers must filter.
**How to avoid:** Replicate the `isLiveChange(ctx)` helper from `useAuth.ts:87-90` — check `tag === 'Reducer' || tag === 'Transaction'` before acting. [VERIFIED: this pattern is already in use in 15.5's useAuth.ts].
**Warning signs:** `readProfileFromConnection` logs fire twice on mount, or current-user flashes through intermediate states.

### Pitfall 6: Strict Mode double-subscribe
**What goes wrong:** React 18+ Strict Mode intentionally mounts → unmounts → remounts every effect in dev. Without the `subscribedRef` guard, the AuthProvider OR `(authed)/layout.tsx` will call `.subscribe()` twice on first mount.
**Why it happens:** The intentional double-mount surfaces effect lifecycle bugs. SpacetimeDB subscriptions are side effects that survive unmount (until connection closes), so the second `.subscribe()` duplicates work.
**How to avoid:** Replicate `subscribedRef` from `useAuth.ts:17`. D-11 makes this mandatory.
**Warning signs:** Two `[AuthProvider] subscribing: view_my_profile` console logs on single mount.

### Pitfall 7: SW registration fires on every `Providers` remount
**What goes wrong:** `navigator.serviceWorker.register('/sw.js')` returning the same registration is fine (idempotent), but if the effect doesn't have a proper dependency array it runs on every render.
**Why it happens:** `useEffect(() => { register(); }, [])` with empty deps runs once per mount. But if someone accidentally adds a dep (e.g., a ref), it can register multiple times per session.
**How to avoid:** Hard-code the empty dep array. Log `[SW] register called` — should appear exactly once per page load.
**Warning signs:** "SW register" log fires on navigation between route groups.

### Pitfall 8: `vp` cookie write SSRs inconsistent on second navigation
**What goes wrong:** First visit → cookie absent → Skeleton on dual-DOM. Client resolves → writes cookie. Second page navigation → Next.js SSR reads cookie → correct sibling renders. Third visit (next week, cache expired) → cookie still present (1-year max-age) → still correct. This IS correct behavior, but it's worth verifying the cookie is actually 1-year.
**Why it happens:** Cookie max-age in seconds. 1 year = `365 * 24 * 60 * 60 = 31536000` seconds. A typo (e.g., `3153600`) silently gives you 36.5 days instead.
**How to avoid:** Use `60 * 60 * 24 * 365` or a named constant. Verify via DevTools → Application → Cookies → check Expires column.
**Warning signs:** Returning users see Skeleton on dual-DOM pages weeks after their first visit.

### Pitfall 9: `typedRoutes` + route groups gotcha
**What goes wrong:** Expecting `typedRoutes` to catch the `(landing-page) → (public)` rename. It won't — route groups are URL-invisible. The href `/costs` is valid whether it lives under `(public)` or `(landing-page)`. What typedRoutes DOES catch is absolute-path `import styles from "@/app/(landing-page)/…"` — those are IMPORT paths, not route paths.
**Why it happens:** Conceptual conflation between route URLs and filesystem paths.
**How to avoid:** Understand that typedRoutes guards `<Link href>` and `router.push` — not arbitrary `import` statements. The 5 `@/app/(landing-page)/teambuilder/page.module.css` imports break at tsconfig path-resolution time, NOT typedRoutes. Commit 5's grep sweep IS the safety net for those.
**Warning signs:** `npm run build` after Commit 2 fails with "Module not found: Can't resolve '@/app/(landing-page)/…'" — that's expected, that's the import-path bug surfacing.

### Pitfall 10: Async params not awaited in renamed `/draft/[matchId]/page.tsx`
**What goes wrong:** Accessing `params.matchId` instead of `(await params).matchId` throws in Next.js 15. [CITED: https://nextjs.org/docs/messages/sync-dynamic-apis]
**Why it happens:** The file already uses async params correctly per the current audit, but a careless `git mv` that edits the file content (instead of just moving) could break the pattern.
**How to avoid:** `git mv` preserves file content exactly. Don't combine rename + content edit in one commit. D-29 Commit 4 does rename-only — safe.
**Warning signs:** Runtime error "`params` is a Promise and must be awaited" when visiting `/draft/…` post-rename.

---

## Code Examples

### Enabling typedRoutes (Next.js 15.5+)

```ts
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typedRoutes: true, // ✓ top-level on Next.js 15.5+ (do NOT use experimental.typedRoutes)
  async headers() {
    return [{ /* existing CSP … */ }];
  },
};

export default nextConfig;
```
Source: [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes]

### middleware.ts — positive-list matcher + cookie redirect

```ts
// middleware.ts (repo root)
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('stdb_session');
  const path = request.nextUrl.pathname;

  if (!cookie) {
    console.log(`[middleware] redirect: ${path} (no stdb_session cookie)`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log(`[middleware] pass: ${path} (cookie present)`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/admin-view/:path*',
    '/lobby/:path*',
    '/draft/:path*',
  ],
};
```
Sources: [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/middleware], [CITED: https://nextjs.org/docs/app/api-reference/functions/next-response]

### matchMedia-based viewport detection (hydration-safe)

```tsx
// components/globals/viewport/ViewportWriter.tsx
'use client';
import { useEffect } from 'react';

const COOKIE_NAME = 'vp';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year, per FOUND-10

function writeCookie(vp: 'mobile' | 'desktop') {
  document.cookie = `${COOKIE_NAME}=${vp}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  console.log(`[ViewportWriter] wrote vp=${vp}`);
}

export function ViewportWriter() {
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse) and (hover: none)');
    const evaluate = () => writeCookie(mq.matches ? 'mobile' : 'desktop');
    evaluate();
    mq.addEventListener('change', evaluate);
    return () => mq.removeEventListener('change', evaluate);
  }, []);

  return null; // no DOM output
}
```
Sources: [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover], [CITED: https://nextjs.org/docs/messages/react-hydration-error]

### next/dynamic sibling loader (ViewportGate core)

```tsx
// components/globals/viewport/ViewportGate.tsx (excerpt — full version has Skeleton + cookie read)
'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, type ComponentType } from 'react';

interface Props<P> {
  desktop: () => Promise<{ default: ComponentType<P> }>;
  mobile?: () => Promise<{ default: ComponentType<P> }>;
  /** Server-resolved initial viewport from vp cookie (undefined = Skeleton-first). */
  initialViewport?: 'desktop' | 'mobile';
  componentProps: P;
  Skeleton: ComponentType;
}

export function ViewportGate<P>({
  desktop, mobile, initialViewport, componentProps, Skeleton,
}: Props<P>) {
  const [resolved, setResolved] = useState<'desktop' | 'mobile' | null>(
    initialViewport ?? null
  );

  useEffect(() => {
    if (!mobile) { setResolved('desktop'); return; } // single-DOM fallback
    const mq = window.matchMedia('(pointer: coarse) and (hover: none)');
    const next = mq.matches ? 'mobile' : 'desktop';
    console.log(`[ViewportGate] matchMedia → ${next}`);
    setResolved(next);
  }, [mobile]);

  if (resolved === null) return <Skeleton />; // D-27 cookie-absent branch

  const loader = resolved === 'mobile' && mobile ? mobile : desktop;
  const Component = dynamic(loader, { ssr: false, loading: () => <Skeleton /> });
  return <Component {...componentProps} />;
}
```
Sources: [CITED: https://nextjs.org/docs/app/guides/lazy-loading], [CITED: https://nextjs.org/docs/app/api-reference/functions/dynamic]

### Service Worker registration inside Providers

```tsx
// app/providers.tsx (excerpt — additions only)
useEffect(() => {
  const shouldRegister =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

  if (!shouldRegister) {
    console.log('[SW] skip register: NODE_ENV=' + process.env.NODE_ENV);
    return;
  }
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] skip register: serviceWorker API unavailable');
    return;
  }

  navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => console.log('[SW] registered, scope=' + reg.scope))
    .catch((err) => console.error('[SW] register failed:', err));
}, []);
```

### AuthProvider Stage 1 subscribe (D-03 relocation target)

```tsx
// components/features/auth/components/AuthProvider.tsx (new shape)
'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSpacetimeDB } from 'spacetimedb/react';
import { useAuth } from '../hooks/useAuth';

type AuthContextType = ReturnType<typeof useAuth>;
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  const { isActive, getConnection } = useSpacetimeDB();
  const subscribedRef = useRef(false); // D-11 Strict Mode guard

  useEffect(() => {
    if (!isActive || subscribedRef.current) return;
    const conn = getConnection();
    if (!conn) return;
    subscribedRef.current = true;

    console.log('[AuthProvider] subscribing: view_my_profile (always-on, anon-safe)');
    conn.subscriptionBuilder()
      .onApplied(() => { console.log('[AuthProvider] onApplied: view_my_profile'); })
      .subscribe('SELECT * FROM view_my_profile');

    // Callbacks: filter out SubscribeApplied events (Pitfall 5)
    const isLive = (ctx: any) => ctx?.event?.tag === 'Reducer' || ctx?.event?.tag === 'Transaction';
    const onInsert = (ctx: any, row: any) => { if (isLive(ctx)) console.log(`[AuthProvider] view_my_profile.onInsert: id=${row?.id}`); };
    const onUpdate = (ctx: any, oldRow: any, row: any) => { if (isLive(ctx)) console.log(`[AuthProvider] view_my_profile.onUpdate: id=${row?.id}`); };
    conn.db.view_my_profile.onInsert(onInsert);
    conn.db.view_my_profile.onUpdate(onUpdate);

    return () => {
      conn.db.view_my_profile.removeOnInsert(onInsert);
      conn.db.view_my_profile.removeOnUpdate(onUpdate);
      subscribedRef.current = false;
    };
  }, [isActive, getConnection]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
```

**Note:** The readProfile trigger isn't shown here — D-10 keeps `readProfileFromConnection` in `useAuth.ts` and it's called from the `useEffect([isActive, profileReady, …])` that already exists there. The AuthProvider effect is PURELY the subscription lifecycle. The reader is triggered by `profileReady` state flipping, which it can do via a callback passed through context if needed, or via the existing `stage1Ref` → `profileReady` pattern moved alongside the subscribe effect. Planner decides shape per "Claude's Discretion" — "Exact structure of AuthProvider + (authed)/layout.tsx subscribe effects".

### `(authed)/layout.tsx` Stage 2 subscribe (D-07 relocation target)

```tsx
// app/(authed)/layout.tsx (new shape)
'use client';
import React, { useEffect, useRef } from 'react';
import { useSpacetimeDB } from 'spacetimedb/react';
import AuthRequired from '@/components/features/auth/components/AuthRequired';
import DeletionBanner from '@/components/features/auth/components/DeletionBanner';
import styles from './layout.module.css';

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { isActive, getConnection } = useSpacetimeDB();
  const subscribedRef = useRef(false); // D-11 Strict Mode guard

  useEffect(() => {
    if (!isActive || subscribedRef.current) return;
    const conn = getConnection();
    if (!conn) return;
    subscribedRef.current = true;

    console.log('[authedLayout] subscribing: SELECT * FROM user (route-group gate opened)');
    conn.subscriptionBuilder()
      .onApplied(() => { console.log('[authedLayout] onApplied: User subscription active'); })
      .subscribe('SELECT * FROM user');

    const isLive = (ctx: any) => ctx?.event?.tag === 'Reducer' || ctx?.event?.tag === 'Transaction';
    const onUserInsert = (ctx: any, row: any) => { if (isLive(ctx)) console.log(`[authedLayout] User.onInsert: id=${row?.id}`); };
    const onUserUpdate = (ctx: any, oldRow: any, row: any) => { if (isLive(ctx)) console.log(`[authedLayout] User.onUpdate: id=${row?.id}`); };
    conn.db.User.onInsert(onUserInsert);
    conn.db.User.onUpdate(onUserUpdate);

    return () => {
      conn.db.User.removeOnInsert(onUserInsert);
      conn.db.User.removeOnUpdate(onUserUpdate);
      subscribedRef.current = false;
    };
  }, [isActive, getConnection]);

  return (
    <div className={styles.layout_wrapper}>
      <AuthRequired>
        <DeletionBanner />
        {children}
      </AuthRequired>
    </div>
  );
}
```

### Audit broken hrefs (Wave A pre-execution sanity)

```bash
# D-32 pre-gate: run after next.config.ts has typedRoutes enabled, before any rename
npm run build 2>&1 | grep -E "(Type.*Route|invalid.*href|cannot be used|is not assignable)"

# Absolute-path import sweep (Commit 5 + earlier catch)
grep -rn "@/app/(landing-page)\|@/app/(authenticated)\|@/app/(game)" app/ components/ lib/
# Expect 5 hits in components/features/team-builder/* after Commit 2 (before fix)
# Expect 0 hits after Commit 5
```

### Safari detection for `<SafariWarning />` and `getRenderTier()`

```ts
// Simple UA sniff — single source of truth used by both SafariWarning and render-tier util
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // "Safari" but NOT "Chrome" / "Chromium" / "Edg" / "Android"
  return /Safari/.test(ua) && !/Chrome|Chromium|Edg|Android/.test(ua);
}
```

**Why not `bowser` or `ua-parser-js`:** Single regex, single hostname-branded test ("is this Apple WebKit"). Adding a 50 KB dep for this test is overkill and violates D-25's stdlib-only mandate for primitives.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `experimental.typedRoutes: true` | `typedRoutes: true` (top-level) | Next.js 15.5 (Aug 2025) | **CRITICAL for Phase 16 — overrides D-29 Commit 1 literal wording.** Still works but deprecation-warns. Removed in Next.js 16. |
| `middleware.ts` (repo root) | `proxy.ts` (repo root) | Next.js 16.0 (Oct 2025) | **Stay on 15.x for Phase 16.** Pinning `^15.5.0` avoids the rename. `next@latest` resolves to 16.x. |
| Edge Runtime middleware only | Node.js Middleware also supported (stable) | Next.js 15.5 | Edge remains default. Node.js is optional and out of scope for Phase 16 (adds deploy complexity). |
| `params: { slug: string }` (sync) | `params: Promise<{ slug: string }>` (async) | Next.js 15.0 | [VERIFIED] Already applied to `/draft/[matchId]/page.tsx`. No new work in Phase 16. |
| `next lint` built-in command | Deprecated; use `eslint` directly | Next.js 15.5 | Project doesn't use `next lint` — no action needed. |
| `@heroui/*` components | Still current | — | Unchanged; Phase 16 primitives deliberately don't use HeroUI per D-25. |

**Deprecated/outdated (do NOT use):**
- `next lint` — [CITED: https://nextjs.org/blog/next-15-5] deprecated 15.5; removed 16.
- `legacyBehavior` prop on `<Link>` — removed in 16. Project doesn't use it.
- `experimental.ppr` (partial prerendering) — [CITED: REQUIREMENTS.md Out of Scope] explicitly out of scope: "Not needed; subscription-driven data plane makes SSR/streaming benefits marginal".
- `experimental.viewTransition` — out of scope; not needed for Phase 16.
- `bowser`, `ua-parser-js`, `mobile-detect` libraries — overkill for our Safari + (pointer:coarse) tests.
- `react-responsive`, `usehooks-ts` useMediaQuery — ~15 LOC hand-written matches D-25 stdlib-only mandate.
- `@serwist/next`, `next-pwa`, `workbox` — [CITED: DECISIONS.md R7 do-not-add list] for asset-CDN-only use case.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | UploadThing (`ufs.sh`) serves CORS-friendly responses for anonymous reads | Pattern 5 SW | If wrong, cached responses are opaque (type='opaque'); still cacheable but unreadable. SW still works; no functional regression. Low risk. |
| A2 | `i.imgur.com` direct image URLs serve CORS-friendly responses | Pattern 5 SW | Same as A1. Not yet wired (Phase 32), so verification before A1-phase is premature. |
| A3 | Safari UA-string regex `/Safari/` w/o Chrome/Chromium/Edg/Android correctly identifies Apple WebKit | Code Examples Safari detection | False positive on some iOS in-app browsers, false negative on iPadOS desktop-mode (rare). Low impact — at worst, wrong tier classification for <1% of users. |
| A4 | `hardwareConcurrency >= 4` is the right threshold for "full" render tier | Pattern 6 render-tier | Empirical assumption. If wrong, some mid-range devices fall into image-only (safe fallback) or low-end get full (worse UX). Recommend reviewer confirms the threshold aligns with Phase 31 Spine perf targets. Moderate risk. |
| A5 | The existing 15.5 `readProfileFromConnection` continues to work unchanged when subscribes are relocated | Pattern 3 subscription ownership | The reader reads `conn.db.view_my_profile.iter()` and `conn.db.User.id.find(...)` — these are cache accesses not subscription wire. D-12 mandates the 15.5 harness test pass post-refactor, which IS the verification. High confidence. |
| A6 | `next.config.ts` with `typedRoutes: true` top-level is accepted by 15.5.12 (not just 15.5.0+) | Standard Stack | 15.5.12 is a patch on top of 15.5, backwards-compat within minor is guaranteed. Low risk. |
| A7 | The 5 `@/app/(landing-page)/...` absolute-path imports are the ONLY absolute-path route-group references | Runtime State Inventory | Grep was run against `app/`, `components/`, `lib/`, and returned exactly 5 hits. If a dependent tool like Storybook or a custom script reads app paths, it's not in the grep scope. Project has no such tooling per repo audit. Low risk. |

**If the planner needs to confirm any of A1-A7, they should be escalated to discuss-phase before locking into PLAN.md.**

---

## Open Questions

None blocking. A few notes for the planner:

1. **Should `(authed)/layout.tsx`'s Stage 2 subscribe use `conn.subscriptionBuilder()` or `useTable(tables.User)`?**
   - What we know: D-04 says `useTable` is default. `useTable` handles onApplied + insert/update/unmount automatically.
   - What's unclear: The 15.5 Stage 2 subscribes via `subscriptionBuilder` explicitly because the gate semantics require manual lifecycle control. With the gate now being route-group-mount, `useTable` is sufficient.
   - Recommendation: `useTable(tables.User)` inside `(authed)/layout.tsx`. The onInsert/onUpdate callbacks that currently register manually can be attached via `useEffect` post-subscription, or dropped if `readProfileFromConnection` is triggered by the `useTable` rows reference being non-empty (reactive path). Planner picks the exact wiring.

2. **Where does `readProfileFromConnection` trigger from, post-relocation?**
   - What we know: D-10 keeps the reader in `useAuth.ts`. The reader needs to be called when view_my_profile data arrives AND when User data arrives.
   - What's unclear: The existing 15.5 code calls the reader from (a) Stage 1 onApplied, (b) Stage 2 onApplied, (c) live-change callbacks, (d) a `useEffect([isActive, profileReady, identity, …])`.
   - Recommendation: Keep (d) — the effect in useAuth.ts fires whenever identity or profileReady changes; profileReady flips in AuthProvider's onApplied (via a context setter OR via a ref readable from useAuth). Simplest wiring: AuthProvider exposes `profileReady` state through its context; useAuth reads it.

3. **Should the `vp` cookie be `httpOnly: false` or default?**
   - What we know: ViewportWriter writes via `document.cookie` (client JS), so cookie CANNOT be httpOnly. Server reads the cookie via `cookies()` from `next/headers`, which works whether httpOnly or not.
   - Recommendation: `SameSite=Lax`, no Secure flag in dev, Secure flag in prod (add `; Secure` when `location.protocol === 'https:'`).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | All commands | ✓ | `>=24.0.0` (engines.node in package.json) | — |
| npm | All install commands | ✓ | Paired with Node 24 | — |
| Git | `git mv` in rename sequence | ✓ | Standard | — |
| Git Bash (Windows) | `git mv` with parens in paths | ✓ | Project runs on Windows 11 | — |
| TypeScript | `typedRoutes` + typecheck gates | ✓ | `~5.6.2` | — |
| Chrome/Edge/Firefox | SW + matchMedia testing | ✓ | Assumed dev browser | — |
| Safari | Test `<SafariWarning>` renders correctly | Typically unavailable on Windows | — | Use UA-override in DevTools → Network conditions → Custom user agent |
| SpacetimeDB connection | useTable / subscribe tests | ✓ | Maincloud, DB `hsrpvp-spacetimedb-nextjs-test1` | Local SpacetimeDB fallback: `npm run spacetime:publish:local` |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** Safari testing — use Chrome DevTools UA override or [CITED: playwright webkit] for automated testing. Phase 16 doesn't ship automated Safari tests per Test Framework section below.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `vitest@^4.1.0` with two configs: `test/vitest.config.ts` (unit), `test/vitest.integration.config.ts` (integration) |
| Config file | Both configs exist — Phase 16 uses integration only |
| Quick run command | `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` |
| Full suite command | `npm run test:integration` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FOUND-03 | typedRoutes: true enabled + Next 15.5+ resolved | build-time | `npm run build` (must exit 0) | ✅ existing build gate |
| FOUND-04 | Route groups renamed; no broken hrefs | build-time + typecheck | `npm run build && npm run test:typecheck` | ✅ existing gates |
| FOUND-05 + FOUND-06 | Subscription ownership relocated without 15.5 regression | integration | `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` | ✅ 15.5 harness — **D-12 mandate** |
| FOUND-07 | SW registered in prod, skipped in dev | manual + build | Manual: visit `/sw.js`, check DevTools Application tab. No automated test planned. | ❌ manual-only — NOT a test gap |
| FOUND-08 | Safari banner renders on Safari UA | manual UAT | Manual: UA-override to Safari, verify banner. | ❌ manual-only |
| FOUND-09 | `getRenderTier()` caching + VERSION invalidation | unit | `npm run test -- test/lib/render-tier.test.ts` (would need new file) | ❌ Wave 0 gap — see below |
| FOUND-10 | ViewportWriter writes vp cookie | manual UAT | Manual: clear cookie, load page, check vp=desktop|mobile in DevTools cookies. | ❌ manual-only |
| FOUND-11 | SSR uses cookie → desktop default | manual UAT (bash + curl) | `curl -s -I http://localhost:3001/costs | grep -i set-cookie` (verifies no server-side vp write; ViewportWriter is client-only). | ❌ manual-only |
| FOUND-12 | ViewportGate falls back to desktop when mobile sibling absent | manual + build | Build verifies dynamic imports typecheck; manual click-through. | ❌ manual-only |
| FOUND-13 | Middleware redirects cookie-less authed paths | manual UAT | Manual: clear cookies, visit `/profile` → expect redirect to `/`. | ❌ manual-only |

### Sampling Rate

- **Per task commit:** `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` (8 tests, <30s)
- **Per wave merge:** `npm run test:integration` (~600 tests, ~10 min per phase-15.3 experience)
- **Phase gate:** Full suite green + `npm run build` exits 0 before `/gsd-verify-work`.

### Wave 0 Gaps

Per CLAUDE.md "Test files are the verification layer. Do not create, edit, or delete test files without an explicit task":

- **No new test files are planned for Phase 16.** The 15.5 harness `auth-subscriptions.test.ts` is the canonical regression guard for the subscription-ownership reshuffle (D-12).
- `lib/render-tier.ts` unit tests would be ideal but are explicitly out of scope per CLAUDE.md. Devtools + manual verification via UAT step-through in `/gsd-verify-work` is the substitute.
- Middleware / SW / ViewportGate behaviors are UAT-only (manual click-through), matching the repo convention.

**If the user wants unit tests for `lib/render-tier.ts`, that's a plan-phase scope bump requiring an explicit task.**

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Upstream: SpacetimeDB reducer-level auth. Middleware adds cookie-based UX redirect only (NOT a trust boundary per REQUIREMENTS.md Out of Scope). |
| V3 Session Management | yes | `stdb_session` cookie is client-readable display-name cookie — intentionally NOT httpOnly (see `lib/session-cookie.ts` docstring). Real session lives in `spacetime_token` (localStorage). |
| V4 Access Control | yes | Real access control in SpacetimeDB RLS at reducer level. Middleware is UX hint only. |
| V5 Input Validation | no | Phase 16 has no user-input surface; no form data, no URL params processed. |
| V6 Cryptography | no | No crypto hand-rolled. CVE-2025-29927 patch (15.5.x) uses Next.js internal crypto. |
| V7 Error Handling | yes (observability) | D-33 observability logs fire in browser console. No server-side error logging introduced in Phase 16. |

### Known Threat Patterns for Phase 16 stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| CVE-2025-29927 middleware bypass via `x-middleware-subrequest` header | Elevation of Privilege | Next.js 15.5.x cryptographic header verification [CITED: https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass] |
| Middleware-only auth trust boundary (developer misunderstanding) | Spoofing | Documented as anti-pattern in REQUIREMENTS.md Out of Scope + architecturally enforced by SpacetimeDB RLS being the real gate |
| SW cache poisoning via opaque cross-origin responses | Tampering | Narrow allowlist (D-17) + origin check (D-18); status-ok check in cache.put |
| `vp` cookie tampering for UX manipulation | — (low severity) | Cookie values are untrusted; client-side only; no security decisions depend on `vp` |
| CSP regression from route-group rename | — | Next.js CSP headers in `next.config.ts` don't reference route-group paths; verified in Commit 1 scope |
| localStorage exfiltration via XSS | Information Disclosure | Existing CSP in next.config.ts restricts connect-src + script-src; unchanged in Phase 16 |
| Service Worker scope hijack (SW from different origin) | Spoofing | [CITED: https://github.com/w3c/ServiceWorker/issues/940] Browsers prevent SW registration from different origin than page; `/public/sw.js` is same-origin; no risk |

---

## Sources

### Primary (HIGH confidence)
- [CITED: https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes] — typedRoutes config (version 16.2.4, last updated 2026-04-15)
- [CITED: https://nextjs.org/blog/next-15-5] — typedRoutes stable at top level; Node.js Middleware stable; deprecations
- [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/middleware] — middleware conventions (renamed to proxy in 16)
- [CITED: https://nextjs.org/docs/app/api-reference/file-conventions/proxy] — proxy.ts in Next.js 16 (for version-awareness)
- [CITED: https://nextjs.org/docs/app/api-reference/config/typescript] — typedRoutes + route groups interaction, `as Route` cast
- [CITED: https://nextjs.org/docs/app/api-reference/functions/userAgent] — userAgent() device.type values
- [CITED: https://nextjs.org/blog/next-15-2] — Next.js 15.2 release (15.2.3 is CVE patch in this line)
- [CITED: https://nvd.nist.gov/vuln/detail/CVE-2025-29927] — CVE-2025-29927 authoritative vuln record
- [CITED: https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass] — CVE-2025-29927 technical analysis + patch details
- [CITED: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover] — @media hover/pointer features (Baseline 2018)
- [CITED: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers] — SW lifecycle + scope
- [CITED: https://nextjs.org/docs/messages/react-hydration-error] — canonical hydration mismatch guidance
- [CITED: https://nextjs.org/docs/messages/sync-dynamic-apis] — Next.js 15 async params migration
- [VERIFIED: `npm view next version`] = 16.2.4 (latest)
- [VERIFIED: `npm view "next@>=15.2.3 <16" version`] — highest 15.x is 15.5.15
- [VERIFIED: `npm ls next`] = 15.5.12 (installed)
- [VERIFIED: Grep tool audit] — 5 absolute-path imports referencing `@/app/(landing-page)/teambuilder/page.module.css`
- [VERIFIED: Project file read] — `app/(game)/draft/[matchId]/page.tsx` already uses async params

### Secondary (MEDIUM confidence)
- [CITED: Datadog Security Labs — https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/] — CVE analysis corroboration
- [CITED: https://dev.to/progressier/handling-opaque-responses-in-a-service-worker-fgd] — opaque response handling in SW
- [CITED: https://web.dev/learn/pwa/serving] — SW fetch event behavior
- [CITED: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/By_example/Detect_WebGL] — WebGL feature detection
- [CITED: https://browserleaks.com/webgl] — WebGL fingerprinting + GPU identification
- [CITED: https://en.wikipedia.org/wiki/WebGL] — Chrome SwiftShader software renderer
- [CITED: https://react.dev/reference/react-dom/client/hydrateRoot] — hydration behavior
- [CITED: https://www.joshwcomeau.com/react/the-perils-of-rehydration/] — hydration mismatch deep dive

### Tertiary (LOW confidence — not relied on for decisions)
- Community Medium/DEV posts on Service Worker + Next.js — used for pattern discovery, all final decisions verified against MDN/Next.js docs.

---

## Metadata

**Confidence breakdown:**
- Standard stack (versions + Next.js config): HIGH — verified against npm registry + official docs + installed package.json
- Architecture patterns (subscription reshuffle, rename sequence): HIGH — derives from locked CONTEXT.md decisions + 15.5 implementation pattern already proven by harness test
- Middleware positive-list matcher: HIGH — directly cited from official Next.js docs + verified against CVE patch
- Service Worker scoped intercept: MEDIUM — MDN + sample blogs + sw.js pattern is standard but not verified against our specific CDN CORS headers (A1/A2)
- Viewport primitives + render-tier util: MEDIUM — pattern is well-known (useMediaQuery hook variants) but project-specific UX choices (7-day TTL, VERSION bump) carry empirical assumptions (A4)
- Runtime state inventory: HIGH — grep verified, 5 absolute-path imports confirmed
- Common pitfalls: HIGH — each pitfall cites a specific source or prior 15.5 code pattern

**Research date:** 2026-04-18
**Valid until:** 2026-05-18 (Next.js moves fast; 15.5.x patch level should be re-checked at execution time)
