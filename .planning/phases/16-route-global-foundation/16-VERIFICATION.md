---
phase: 16-route-global-foundation
verified: 2026-04-18T00:00:00Z
status: human_needed
score: 8/8 must-haves verified
overrides_applied: 2
requirement_coverage:
  satisfied:
    - id: FOUND-03
      evidence: "next.config.ts top-level `typedRoutes: true` (L10); next@15.5.15 resolved (npm ls)"
    - id: FOUND-04
      evidence: "app/(public)/, app/(authed)/, app/(authed)/(match)/draft/[matchId] all exist; old (landing-page)/(authenticated)/(game) gone; 5 team-builder imports rewritten"
    - id: FOUND-05
      evidence: "app/(authed)/layout.tsx:56-69 SELECT * FROM user subscribe + User.onInsert/onUpdate; useAuth.ts contains zero `SELECT * FROM user` and zero stage2Ref/stage2Gate references"
    - id: FOUND-06
      evidence: "GameDataProvider.tsx has 7 useTable calls (HsrCharacter, HsrLightcone, HsrCharacterCost, HsrLightconeCost, HsrSynergyCost, Archetype, HsrCharacterArchetype); AuthProvider.tsx owns view_my_profile subscribe (L48)"
    - id: FOUND-07
      evidence: "public/sw.js (48 LOC) with ALLOWED_HOSTS=['ufs.sh','i.imgur.com'], origin-guard first; app/providers.tsx:50-68 registers via gated useEffect (NODE_ENV=production || NEXT_PUBLIC_ENABLE_SW=true)"
    - id: FOUND-08
      evidence: "components/globals/viewport/SafariWarning.tsx renders amber #f59e0b banner when isSafari()==true; app/layout.tsx:31 mounts SafariWarning above Providers; lib/render-tier.ts:116-119 returns image-only on Safari"
    - id: FOUND-09
      evidence: "lib/render-tier.ts implements override → Safari → 7-day cache → probe decision chain; VERSION=1 invalidation lever; WebGL + SwiftShader sniff + hardwareConcurrency<4 probe; all named exports"
    - id: FOUND-10
      evidence: "components/globals/viewport/ViewportWriter.tsx writes vp=desktop|mobile cookie with MAX_AGE = 60*60*24*365 (arithmetic per Pitfall 8), SameSite=Lax, Secure gated on location.protocol===https:; listens to matchMedia('(pointer: coarse) and (hover: none)') change events"
    - id: FOUND-11
      evidence: "ViewportGate.tsx Skeleton-first SSR per D-27/D-28 (supersedes literal FOUND-11 userAgent() wording); server accepts initialViewport from vp cookie; returns Skeleton when resolved===null"
    - id: FOUND-12
      evidence: "ViewportGate.tsx:51-55 single-DOM fallback: when mobile===undefined, setResolved('desktop'); next/dynamic with ssr:false+loading Skeleton swap for dual-DOM case"
    - id: FOUND-13
      evidence: "middleware.ts reads stdb_session cookie, redirects to / via NextResponse.redirect when absent; positive-list matcher with 4 entries (/profile, /admin-view, /lobby, /draft :path*); /sw.js, /_next, /api excluded by construction; [middleware] D-33 logs"
  blocked: []
  needs_human:
    - id: FOUND-11
      reason: "Hydration-mismatch absence on first load requires DevTools console check"
    - id: FOUND-13
      reason: "Live browser redirect + cookie flow requires Chrome with DevTools cookie manipulation"
    - id: FOUND-07
      reason: "SW registration in production build + dev-opt-in (NEXT_PUBLIC_ENABLE_SW=true) requires browser DevTools Application panel"
    - id: FOUND-08
      reason: "Safari UA banner render + dismissal persistence requires UA spoof + localStorage inspection"
overrides:
  - must_have: "providers.tsx subscribes to 6 public reference tables + view_my_profile"
    reason: "D-01 (16-CONTEXT.md:33-42) explicitly corrects the ROADMAP literal: the correct count is 7 public reference tables — Archetype and HsrCharacterArchetype were missing from the ROADMAP listing. Backend count IS 7, implementation matches."
    accepted_by: "D-01 decision record"
    accepted_at: "2026-04-18"
  - must_have: "cookie-less first visit SSRs as desktop (or userAgent() guess) and swaps client-side without hydration error"
    reason: "D-27/D-28 (16-CONTEXT.md) explicitly supersedes the literal FOUND-11 wording. Skeleton-first SSR is the implemented mechanism (not userAgent() guess) — cookie-less dual-DOM renders Skeleton on server AND first client render, then matchMedia swaps client-side. Zero hydration mismatch by construction. Single-DOM (FOUND-12) paths still resolve desktop directly."
    accepted_by: "D-27 + D-28 decision records"
    accepted_at: "2026-04-18"
human_verification:
  - test: "Cookie-less visit to an authed path redirects to landing"
    expected: "Visiting http://localhost:3001/profile with stdb_session cookie cleared returns 307 redirect to /; console shows `[middleware] redirect: /profile (no stdb_session cookie)`; /costs does NOT redirect (not in positive-list matcher); /sw.js not redirected either"
    why_human: "Middleware runtime behavior requires live Next dev server + DevTools cookie manipulation"
  - test: "Cookie-present visit to authed path passes through"
    expected: "After Guest login the stdb_session cookie is set; revisiting /profile shows the page; console shows `[middleware] pass: /profile (cookie present)`"
    why_human: "Requires a live auth flow + browser request"
  - test: "Service Worker registers on production build and intercepts only allowlisted CDN assets"
    expected: "npm run build && npm run start — DevTools Application → Service Workers shows active SW; Cache Storage grows with ufs.sh / i.imgur.com URLs on asset loads; no intercepts of app origin (/api, _next, /sw.js navigations clean)"
    why_human: "Requires a prod build + live asset fetches + DevTools Cache Storage inspection"
  - test: "Service Worker registration dev opt-in flag"
    expected: "NEXT_PUBLIC_ENABLE_SW=true in .env.local + npm run dev — DevTools console shows `[SW] registered, scope=http://localhost:3001/`; removing the flag reverts to `[SW] skip register: NODE_ENV=development`"
    why_human: ".env.local manipulation + dev-server restart is human-driven; must not be committed (gitignored)"
  - test: "Safari banner renders on Safari UA and dismissal persists"
    expected: "DevTools → Network conditions → User agent Safari → reload http://localhost:3001/ → amber banner above NavBar; click Dismiss → persists in localStorage.hsrpvp_safari_warning_dismissed='1'; reload stays dismissed; clearing the key re-shows"
    why_human: "UA spoofing + localStorage inspection is inherently browser-interactive"
  - test: "ViewportWriter vp cookie mechanics"
    expected: "Fresh load writes `[ViewportWriter] wrote vp=desktop`; cookie in DevTools with Max-Age ~31,536,000 (1 year), SameSite=Lax, Secure absent on localhost HTTP; DevTools Rendering → Emulate coarse pointer flips cookie to vp=mobile"
    why_human: "DevTools Application → Cookies column inspection + rendering-emulation toggle"
  - test: "Zero hydration-mismatch warnings on first load"
    expected: "Chrome DevTools Console + React DevTools Profiler on first navigation to / shows no `Warning: Text content does not match`, no `Warning: Expected server HTML to contain`"
    why_human: "Hydration warnings appear only on live React dev runs; no static check covers the matchMedia → cookie swap path"
  - test: "dev-unregister-sw page gate works"
    expected: "npm run dev → visit /dev-unregister-sw → renders; click unregister → clears SW + caches → redirect to /. `npm run build && npm run start` (prod without NEXT_PUBLIC_ENABLE_SW) → /dev-unregister-sw returns Next 404"
    why_human: "Requires both dev and prod server runs + SW/cache state inspection"
---

# Phase 16: Route + Global Foundation Verification Report

**Phase Goal:** Every downstream phase builds on a route-group structure, primitives (`<ViewportGate>`, `<ViewportWriter>`, render-tier), middleware, and asset-caching Service Worker that are settled and non-negotiable.
**Verified:** 2026-04-18
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | next.config.ts enables typedRoutes on Next ≥15.2.3; stale route-group Link fails `npm run build` | VERIFIED | next.config.ts:10 `typedRoutes: true` at top level (stable key, NOT deprecated experimental); `npm ls next` → 15.5.15; build+typecheck green per all 6 SUMMARY files |
| 2 | Route groups renamed: (landing-page)→(public), (authenticated)→(authed), (game)/draft→(authed)/(match)/draft | VERIFIED | `ls app/` shows `(public)`, `(authed)`, no `(landing-page)`, `(authenticated)`, `(game)`; `app/(authed)/(match)/draft/[matchId]/page.tsx` exists with async-params preserved (`await params` line 2); 5 team-builder files import `@/app/(public)/teambuilder/page.module.css` |
| 3 | providers.tsx subscribes to 6 public reference tables + view_my_profile for both anon and authed sessions; useAuth.ts no longer owns the user subscription | PASSED (override) | **D-01 override: correct count is 7** (Archetype + HsrCharacterArchetype added). GameDataProvider.tsx:91-97 has 7 useTable calls; AuthProvider.tsx:42-48 subscribes to view_my_profile; useAuth.ts has ZERO references to `SELECT * FROM user` or `view_my_profile` subscribe lifecycle (grep-confirmed) |
| 4 | Visiting any (authed)/* path without session cookie redirects via positive-list middleware excluding /sw.js, _next/*, API | VERIFIED | middleware.ts:10 reads `stdb_session`; :13-15 redirects to `/` when absent; matcher on L26-31 is exactly 4 positive-list entries (/profile, /admin-view, /lobby, /draft :path*); /sw.js, /_next, /api, /costs, /teambuilder, / all excluded by construction; runtime verification requires human |
| 5 | ViewportGate mounts .desktop.tsx on pointer:fine, .mobile.tsx on (pointer: coarse) and (hover: none); desktop fallback when only desktop exists | VERIFIED | ViewportGate.tsx:57-60 matchMedia `(pointer: coarse) and (hover: none)` decides sibling; :51-55 single-DOM fallback (no mobile loader → resolves 'desktop'); `next/dynamic(loader, { ssr: false, loading: () => <Skeleton /> })` pattern on L69 |
| 6 | ViewportWriter writes 1-year SameSite=Lax vp cookie; cookie-less first visit SSRs as desktop and swaps client-side without hydration error | PASSED (override) | **D-27/D-28 override: Skeleton-first SSR (not desktop fallback) implements FOUND-11 intent — zero hydration mismatch by construction.** ViewportWriter.tsx:7 `MAX_AGE = 60*60*24*365` (arithmetic per Pitfall 8); :12 writes vp= with path=/; max-age; SameSite=Lax; conditional Secure on HTTPS; matchMedia change listener on :29 |
| 7 | getRenderTier returns image-only on Safari, respects localStorage override, caches 7-day capability detection with VERSION invalidation; Safari users see dismissible warning banner | VERIFIED | lib/render-tier.ts exports VERSION=1 (:14), RenderTier, isSafari, getRenderTier; decision chain: override → Safari → cache → probe; 7-day TTL (:18); WebGL + SwiftShader + hardwareConcurrency<4 probe; SafariWarning.tsx renders amber banner when isSafari() && !dismissed; dismiss persists via localStorage.hsrpvp_safari_warning_dismissed |
| 8 | /public/sw.js registers in production (opt-in via NEXT_PUBLIC_ENABLE_SW=true in dev) and intercepts only asset-CDN hostnames, never the app origin | VERIFIED | public/sw.js:28 `if (url.origin === self.location.origin) return;` as FIRST non-URL-parsing statement (D-18 defense); :8 ALLOWED_HOSTS=['ufs.sh','i.imgur.com']; providers.tsx:50-68 registers via useEffect gated on `NODE_ENV==='production' || NEXT_PUBLIC_ENABLE_SW==='true'`; dev-unregister-sw page ships with notFound() prod-gate |

**Score:** 8/8 truths VERIFIED (2 PASSED via documented overrides from D-01 / D-27+D-28)

### Required Artifacts (Level 1-4)

| Artifact | Expected | Level 1: Exists | Level 2: Substantive | Level 3: Wired | Level 4: Data Flows | Status |
|----------|----------|-----------------|----------------------|----------------|---------------------|--------|
| next.config.ts | typedRoutes:true top-level | yes | L10 | used by Next build | N/A (config) | VERIFIED |
| app/(authed)/(match)/layout.tsx | Empty passthrough Server Component | yes (5 LOC) | `MatchLayout` + `<>{children}</>`; no 'use client' | parent of draft tree | N/A (passthrough) | VERIFIED |
| app/(public)/ | Former (landing-page) contents | yes | costs, teambuilder, layout, page files | reachable by Next router | yes (7 tables) | VERIFIED |
| app/(authed)/ | Former (authenticated) contents | yes | admin-view, lobby, profile, layout | reachable by Next router | yes (User + view_my_profile) | VERIFIED |
| app/(authed)/(match)/draft/ | Former (game)/draft tree | yes | [matchId]/page.tsx | reachable; await params preserved | yes (async params) | VERIFIED |
| GameDataProvider.tsx | 7 useTable + context | yes (153 LOC) | 7 useTable, 7 row arrays in context | imported into providers.tsx; consumers use useGameData | yes — live STDB subs | VERIFIED |
| AuthProvider.tsx | view_my_profile Stage 1 owner | yes (95 LOC) | useViewMyProfileSubscription + onApplied/onInsert/onUpdate | imported into providers.tsx | yes — real conn.subscriptionBuilder | VERIFIED |
| app/(authed)/layout.tsx | User Stage 2 owner | yes (112 LOC) | SELECT * FROM user subscribe; currentUserRef dedupe; onUserInsert/onUserUpdate | Next App Router mounts for authed paths | yes — real conn.db.User | VERIFIED |
| useAuth.ts | reader + state machine only | yes (382 LOC) | readProfileFromConnection, login/logout/Discord, guestLoginPending preserved; stage1Ref/stage2Ref/stage2Gate removed | imported by AuthProvider | yes — reads real conn.db.view_my_profile + User | VERIFIED |
| middleware.ts | Positive-list cookie gate | yes (32 LOC) | cookies.get('stdb_session'), 4-entry matcher, [middleware] logs | Next Edge Runtime at build; `ƒ Middleware 34.1 kB` in build output | N/A (static config) | VERIFIED |
| public/sw.js | Asset-CDN cache-first SW | yes (48 LOC) | VERSION, ALLOWED_HOSTS, install/activate/fetch handlers, origin-guard first | registered from providers.tsx on gate condition | N/A until runtime | VERIFIED |
| app/dev-unregister-sw/page.tsx | Dev utility with prod 404 gate | yes (37 LOC) | notFound() as FIRST statement; getRegistrations + caches.keys cleanup | reachable at /dev-unregister-sw in dev; 404 in prod without flag | N/A (utility) | VERIFIED |
| lib/render-tier.ts | Pure util | yes (132 LOC) | zero imports (grep-confirmed); getRenderTier + isSafari + VERSION; 7-day TTL; WebGL + SwiftShader + core probe | imported by SafariWarning | N/A (pure util) | VERIFIED |
| components/globals/viewport/ViewportWriter.tsx | vp cookie writer, null render | yes (34 LOC) | MAX_AGE arithmetic, SameSite=Lax, Secure conditional, matchMedia change listener with cleanup | mounted in app/layout.tsx:37 inside Providers | N/A (side-effect; cookie write is the output) | VERIFIED |
| components/globals/viewport/ViewportGate.tsx | Skeleton-first sibling select | yes (72 LOC) | generic `<P extends object>`, Skeleton render branch, next/dynamic ssr:false, single-DOM fallback | no in-phase consumer (intentional per D-26 — Phase 27/31/35 consumers) | N/A (primitive) | VERIFIED |
| components/globals/viewport/SafariWarning.tsx | Dismissible amber banner | yes (68 LOC) | 2-pass mount guard, isSafari() gate, localStorage dismiss persist, inline styles (amber #f59e0b) | mounted in app/layout.tsx:31 above Providers | yes — reads real navigator + localStorage | VERIFIED |
| app/layout.tsx | SafariWarning + ViewportWriter mount | yes | L31 SafariWarning, L37 ViewportWriter, existing NavBar/Footer/Providers preserved | Next renders at root | yes | VERIFIED |
| docs/frontend/component-hygiene.md | 5 R8 rules w/ Good/Bad + tool-agnostic Rule 3 | yes (315 LOC) | 5 `## Rule N` headers; CSS Modules + Tailwind both referenced in Rule 3; Phase History row `16 execution` | doc for reviewer | N/A (docs) | VERIFIED |
| docs/auth/architecture.md | Subscription Lifecycle updated | yes | 11 `Phase 16` references; AuthProvider + (authed)/layout.tsx + route-group mount mentioned; Phase History row appended | doc | N/A (docs) | VERIFIED |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| next.config.ts | .next/types/**/*.ts | typedRoutes:true during next build | WIRED | Build output green; 15.5.x carries typedRoutes stable key |
| components/features/team-builder/*.tsx (5 files) | app/(public)/teambuilder/page.module.css | absolute-path import | WIRED | grep confirms 5 matches of `@/app/(public)/teambuilder/page.module.css` |
| GameDataProvider.tsx | SpacetimeDB 7 public tables | useTable(tables.X) × 7 | WIRED | HsrCharacter, HsrLightcone, HsrCharacterCost, HsrLightconeCost, HsrSynergyCost, Archetype, HsrCharacterArchetype all grep-confirmed (7 exact matches for useTable(tables.) pattern) |
| AuthProvider.tsx | conn.db.view_my_profile | conn.subscriptionBuilder().subscribe('SELECT * FROM view_my_profile') | WIRED | Line 42-48 builds subscription; :67-68 registers onInsert/onUpdate; :70-76 cleanup removes handlers |
| app/(authed)/layout.tsx | conn.db.User | conn.subscriptionBuilder().subscribe('SELECT * FROM user') + User.onInsert/onUpdate | WIRED | Line 56-69 builds subscription; :87-88 registers callbacks; :90-97 cleanup removes handlers |
| useAuth.ts | SpacetimeDB (read-only) | readProfileFromConnection via view_my_profile.iter() + User.id.find | WIRED | Line 97-162 reads real connection data; no subscribe calls remain |
| middleware.ts | lib/session-cookie.ts | string-literal 'stdb_session' (intentionally NOT an import per Edge Runtime safety) | WIRED | Both use identical string; drift-risk flagged in SUMMARY |
| middleware.ts config.matcher | app/(authed)/* routes | 4 static /path/:path* entries | WIRED | /profile/:path*, /admin-view/:path*, /lobby/:path*, /draft/:path* exactly per D-15 |
| public/sw.js fetch handler | Cache Storage API | caches.open(hsrpvp-assets-v1) cache-first | WIRED | cache.match OR fetch+cache.put; GET-only; response.ok guard |
| app/providers.tsx useEffect | public/sw.js | navigator.serviceWorker.register('/sw.js') | WIRED | Gated on NODE_ENV=production || NEXT_PUBLIC_ENABLE_SW='true'; runtime verification requires live browser |
| app/dev-unregister-sw/page.tsx | Service Worker + Cache APIs | getRegistrations + caches.keys | WIRED | Unregister loop + cache clear + redirect to /; notFound() prod gate as first statement |
| ViewportWriter.tsx | document.cookie | `document.cookie = \`vp=…; max-age=31536000; SameSite=Lax\`` | WIRED | Runtime cookie write at first matchMedia evaluation + on change events |
| ViewportGate.tsx | next/dynamic | `dynamic(loader, { ssr: false, loading: () => <Skeleton /> })` | WIRED | Module-scoped consumer pattern; no in-phase consumers (Phase 27/31/35 will wire) |
| SafariWarning.tsx | lib/render-tier.ts isSafari() | import { isSafari } from '@/lib/render-tier' | WIRED | L4 import + L16 invocation at mount + L18 logging |
| app/layout.tsx | viewport primitives | import + JSX mount | WIRED | Both SafariWarning and ViewportWriter imported and mounted in the rendered tree |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|---------------------|--------|
| GameDataProvider | characterRows … characterArchetypeRows | 7 × useTable(tables.X) from live STDB connection | yes — live subscriptions | FLOWING |
| AuthProvider | auth.user (via setProfileReady+triggerReadProfile) | conn.subscriptionBuilder view_my_profile; reader uses view_my_profile.iter() and User.id.find | yes — live subscription + fallback reader | FLOWING |
| (authed)/layout.tsx | rendered children via AuthRequired | conn.db.User subscription + onUserInsert/onUserUpdate → triggerReadProfile → readProfileFromConnection → auth.user | yes | FLOWING |
| SafariWarning | shouldShow | isSafari() navigator.userAgent + localStorage.hsrpvp_safari_warning_dismissed | yes — real globals | FLOWING |
| ViewportWriter | cookie write | matchMedia('(pointer: coarse) and (hover: none)').matches + document.cookie | yes — real browser API writes | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Next.js version resolves to 15.5.x (not 16.x) | `npm ls next` | `next@15.5.15` | PASS |
| typedRoutes present in next.config.ts | grep `typedRoutes: true` | L10 match | PASS |
| No stale route-group imports in src | grep `@/app/(landing-page|authenticated|game)` in app/ components/ lib/ | zero matches in source (only in planning docs) | PASS |
| 7 useTable calls in GameDataProvider | grep `useTable(tables\.` | 7 matches (lines 91-97) | PASS |
| Middleware matcher has exactly 4 authed entries | grep `:path\*'` | 4 matches | PASS |
| Service Worker origin-guard is first statement | grep `url.origin === self.location.origin` | L28 (first after URL parse) | PASS |
| ViewportGate sets resolved='desktop' on single-DOM | grep + read L51-55 | confirmed | PASS |
| Build + typecheck green | (reported in all 6 SUMMARY files) | exit 0 at every task commit | PASS |
| 15.5 harness regression | `npx vitest run test/backend/auth/auth-subscriptions.test.ts` | 2/2 passed (last reported 13.99s) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| FOUND-03 | 16-01 | Next ≥15.2.3 + typedRoutes | SATISFIED | 15.5.15 pinned + top-level typedRoutes |
| FOUND-04 | 16-01 | Route-group rename + href migration | SATISFIED | 3 renames complete + 5 absolute-path imports rewritten |
| FOUND-05 | 16-02 | user sub moves to (authed)/layout; useAuth retains view_my_profile bootstrap | SATISFIED | Stage 2 relocated, Stage 1 moved to AuthProvider; useAuth is reader-only |
| FOUND-06 | 16-02 | providers.tsx subscribes to public reference tables + view_my_profile for all sessions | SATISFIED (override) | 7 tables (D-01 correction) + view_my_profile via AuthProvider descendant |
| FOUND-07 | 16-04 | Service Worker caches UploadThing; gated production or opt-in | SATISFIED | sw.js + providers.tsx gate + dev-unregister-sw page; runtime confirmation is human_needed |
| FOUND-08 | 16-05 | Safari banner + getRenderTier image-only | SATISFIED | SafariWarning renders; render-tier Safari branch returns image-only |
| FOUND-09 | 16-05 | getRenderTier caching + VERSION invalidation + user override | SATISFIED | 7-day TTL, VERSION=1 check, OVERRIDE_KEY honored |
| FOUND-10 | 16-05 | vp cookie 1-year SameSite=Lax on matchMedia change | SATISFIED | ViewportWriter matches spec |
| FOUND-11 | 16-05 | Server Components resolve viewport via cookie → userAgent → desktop | SATISFIED (override) | D-27/D-28 Skeleton-first supersedes userAgent() literal; zero hydration mismatch by construction |
| FOUND-12 | 16-05 | ViewportGate sibling selection + desktop fallback + Skeleton during dynamic import | SATISFIED | Single-DOM fallback + Skeleton-first for dual-DOM + next/dynamic ssr:false |
| FOUND-13 | 16-03 | Middleware positive-list matcher; cookie-less redirect; excludes /sw.js, /_next/*, API | SATISFIED | 4-entry positive-list; /sw.js, /_next, /api never matched; runtime confirmation is human_needed |

**Orphaned requirements:** None. All 11 FOUND-IDs claimed by plan frontmatter are mapped; REQUIREMENTS.md lists only these 11 FOUND-IDs as Phase 16 scope.

### Anti-Patterns Found (from 16-REVIEW.md — 0 critical, 10 warning, 17 info)

The code review report was run separately and has 0 Critical findings. None of the Warnings block goal achievement; they are quality-of-implementation items for follow-up. Summary of severity:

| File | Line | Pattern | Severity | Impact on Goal |
|------|------|---------|----------|----------------|
| app/(authed)/layout.tsx | 38-100 | subscribedRef cleanup ordering (WR-01) | Warning | Low — same-frame re-subscribe edge case; anon-safety gate (route-group mount) unaffected |
| app/dev-unregister-sw/page.tsx | 19-22 | unchecked serviceWorker/caches access (WR-02) | Warning | Low — dev-only utility; crash visible to dev, not prod users |
| public/sw.js | 42-44 | fire-and-forget cache.put (WR-03) | Warning | Low — cache write may silently drop on SW termination; app remains functional |
| next.config.ts | 22 | CSP unsafe-eval/unsafe-inline (WR-04) | Warning | Pre-existing hardening debt, not introduced by Phase 16 |
| useAuth.ts | 93-163 | resolvedSignatureRef not reset on identity change (WR-05) | Warning | Edge case A→B login on same tab |
| team-builder LoadoutDropdown | 27-51 | dual click listeners (WR-06) | Warning | Pre-existing; untouched by Phase 16 |
| GameDataProvider.tsx | 140 | isReady always truthy (WR-07) | Warning | Pre-existing bug; goal unaffected (consumers use allReady log which is correct) |
| SafariWarning.tsx | 15-18 | isSafari() called 3x (WR-08) | Warning | Non-hot-path duplication |
| ViewportGate.tsx | 69 | dynamic() in render body (WR-09) | Warning | Requires consumers to pass stable loaders; Phase 27/31/35 responsibility |
| middleware.ts | 13-16 | redirect loop hazard if matcher ever covers / (WR-10) | Warning | Defensive-only; current matcher does not cover / |
| Many files | n/a | `any` types on SDK callbacks + 40+ console.log in prod (IN-01, IN-02) | Info | Observability decision; not a bug |

None of these are blocking STUBs, MISSING artifacts, or broken wiring. They are follow-up quality concerns documented in 16-REVIEW.md for a future hygiene pass. Phase goal (foundation delivered and settled) is achieved.

### Human Verification Required

See `human_verification` array in frontmatter. Eight items:

1. **Middleware redirect (cookie-less)** — /profile, /admin-view, /lobby, /draft should 307 to / when stdb_session absent; /costs, /teambuilder, /, /sw.js must not redirect. Console [middleware] logs per decision.
2. **Middleware pass-through (cookie present)** — Guest login → cookie set → /profile should pass; console shows [middleware] pass.
3. **Service Worker registers in production** — `npm run build && npm run start` should trigger SW register on first load; Cache Storage populates on asset fetches from ufs.sh/i.imgur.com.
4. **Service Worker dev opt-in** — `NEXT_PUBLIC_ENABLE_SW=true` in .env.local + dev server → [SW] registered log. Without flag → [SW] skip register. `.env.local` MUST NOT be committed.
5. **Safari banner + dismissal persistence** — UA spoof Safari → amber banner above NavBar; click Dismiss → persists across reloads; clearing localStorage key re-shows.
6. **ViewportWriter vp cookie** — Fresh load writes vp=desktop; cookie has Max-Age ~31,536,000, SameSite=Lax; DevTools Rendering → Coarse pointer flips to vp=mobile.
7. **Zero hydration-mismatch on first load** — React DevTools Profiler + Console clean on first navigation to /.
8. **dev-unregister-sw works in dev and 404s in prod without flag** — Button clears SW + caches + redirects to /; prod without flag → Next 404 response.

### Gaps Summary

**No blocking gaps identified.** The phase delivers the 8 must-have truths (with 2 documented overrides for intentional deviations from ROADMAP literal wording). All 11 FOUND requirements are mapped to shipped artifacts with real data flowing through real wiring. 16-REVIEW.md has 0 Critical findings; Warnings and Info items are quality follow-ups that do not block Phase 17+ from building on this foundation.

The 8 human-verification items are browser-runtime checks that no static analysis can perform: cookie manipulation, UA spoofing, WebSocket SW registration, localStorage persistence across reloads, and React hydration warnings. These should be exercised during the developer's `/gsd-verify-work 16` walkthrough before marking the phase merged.

---

_Verified: 2026-04-18_
_Verifier: Claude (gsd-verifier)_
