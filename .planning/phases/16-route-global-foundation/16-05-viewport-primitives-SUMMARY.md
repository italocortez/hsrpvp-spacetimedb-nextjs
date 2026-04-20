---
phase: 16-route-global-foundation
plan: 05-viewport-primitives
subsystem: frontend-foundation
tags: [viewport, render-tier, hydration, ssr, safari, matchmedia, cookie, foundation]
requirements_completed: [FOUND-08, FOUND-09, FOUND-10, FOUND-11, FOUND-12]
dependency_graph:
  requires: []
  provides:
    - render-tier.getRenderTier — 'full' | 'image-only' resolver (Phase 17+ Service Worker asset tier gating)
    - render-tier.isSafari — UA sniff reused by SafariWarning and future Spine-gated consumers
    - render-tier.VERSION — single invalidation lever for the 7-day localStorage cache
    - components/globals/viewport/ViewportWriter — writes vp=desktop|mobile cookie for SSR consumers
    - components/globals/viewport/ViewportGate — Skeleton-first sibling-selection primitive (consumed by Phases 27/31/35)
    - components/globals/viewport/SafariWarning — dismissible amber platform-compat banner
  affects:
    - app/layout.tsx (two new mount points, zero refactor of existing tree)
tech_stack:
  added:
    - next/dynamic (used by ViewportGate with ssr:false)
  patterns:
    - 2-pass render for client-conditional UI (SafariWarning mounted gate) — Pitfall 2
    - matchMedia(pointer: coarse and hover: none) for viewport-class detection
    - localStorage-forever dismissal persistence
    - 7-day localStorage cache with VERSION invalidation (getRenderTier)
    - Pure util pattern (D-21 — zero React imports in lib/render-tier.ts)
    - Bracketed-tag logging (D-33) — [renderTier], [SafariWarning], [ViewportWriter], [ViewportGate]
key_files:
  created:
    - lib/render-tier.ts
    - components/globals/viewport/SafariWarning.tsx
    - components/globals/viewport/ViewportWriter.tsx
    - components/globals/viewport/ViewportGate.tsx
  modified:
    - app/layout.tsx
decisions:
  - D-21 honored — lib/render-tier.ts has zero imports of any kind (verified via grep -n '^import '); pure util testable in isolation
  - D-25 honored — SafariWarning uses inline styles only; zero @heroui/@nextui/tailwind references
  - D-27/D-28 honored — ViewportGate is Skeleton-first; literal FOUND-11 'desktop SSR' wording explicitly superseded
  - D-33 honored — all four primitives emit bracketed-tag console logs on decision branches
  - Claude's Discretion — SafariWarning dismissal persists via localStorage-forever (not sessionStorage, not time-boxed). Rationale: platform-compat notice user accepts once; cleanest UX.
  - [Rule 3 - Blocking Issue] ViewportGate generic `<P>` constrained to `<P extends object>` to satisfy tsc strict-mode JSX spread compatibility (IntrinsicAttributes & P requirement). One-token change from plan canonical body; preserves all behavior — every React props type is object-assignable.
metrics:
  tasks_completed: 3
  commits: [b9c93b6, b245eb4, 0edf944]
  completion_date: 2026-04-18
---

# Phase 16 Plan 05: Viewport Primitives Summary

Viewport primitives and render-tier util for Phase 16 root-shell foundation — four styling-tool-agnostic building blocks (lib/render-tier.ts + ViewportWriter + ViewportGate + SafariWarning) mounted into app/layout.tsx, shipped with Skeleton-first SSR per D-27/D-28 and zero hydration mismatches.

## What Shipped

### lib/render-tier.ts (pure util — zero React imports, D-21 verified)

Decision chain in strict precedence order:
1. `localStorage.hsrpvp_render_tier_override` ∈ {'full','image-only'} → honored verbatim (FOUND-09 user-choice wins)
2. Safari UA sniff (`/Safari/.test(ua) && !/Chrome|Chromium|Edg|Android/.test(ua)`) → 'image-only' (FOUND-08)
3. 7-day localStorage cache (`hsrpvp_render_tier_cache`) matching current `VERSION` → return cached
4. Feature probe: WebGL2/WebGL context creation + `WEBGL_debug_renderer_info` software-renderer sniff (SwiftShader, Basic Render Driver) + `navigator.hardwareConcurrency < 4` threshold → 'image-only' on any fail, else 'full'
5. Cache the probe result with VERSION + timestamp

`VERSION = 1` is the sole cache-invalidation lever (bumping forces re-probe for every user). Every browser-API reader guards `typeof window/document/navigator === 'undefined'` (5 guards total). All named exports — no default.

### components/globals/viewport/SafariWarning.tsx (FOUND-08)

Dismissible amber (`#f59e0b` — explicitly not red, per DeletionBanner color ownership) banner rendered only when `isSafari()` is true AND dismissal localStorage key is unset. 2-pass render guard (`mounted` state starts false; first client render matches SSR null; second client render evaluates UA) blocks hydration mismatch per Pitfall 2. Dismissal persists in `localStorage.hsrpvp_safari_warning_dismissed='1'` forever (Claude's Discretion — platform-compat notice user accepts once; cleaner than sessionStorage re-prompts or 7-day re-prompt). Zero HeroUI, zero Tailwind — inline styles only (D-25).

### components/globals/viewport/ViewportWriter.tsx (FOUND-10)

Null-render side-effect component (DeletionBanner null-return precedent). Writes `vp=desktop|mobile` cookie on mount and re-writes on every `matchMedia('(pointer: coarse) and (hover: none)')` change event. MAX_AGE is explicit arithmetic `60 * 60 * 24 * 365` = 31,536,000 seconds (Pitfall 8 — magic-number typo prevention). SameSite=Lax always; `; Secure` conditionally appended when `location.protocol === 'https:'` (harmless on localhost HTTP dev).

### components/globals/viewport/ViewportGate.tsx (FOUND-11, FOUND-12, D-27, D-28)

Skeleton-first sibling-selection primitive. Generic `<P extends object>` wraps strongly-typed props that flow to the resolved sibling. Behavior:
- `initialViewport` prop (server-resolved from `vp` cookie via `cookies()` in future consumers) bypasses the Skeleton branch when set.
- No `mobile` loader → FOUND-12 single-DOM fallback: resolves to 'desktop' immediately (no matchMedia call, no Skeleton flash).
- Dual-DOM cookie-less: initial state `null` → renders `<Skeleton />` on both SSR and first client render (zero hydration mismatch), then `useEffect` runs matchMedia and swaps in the correct sibling.
- Resolved sibling mounts via `next/dynamic(loader, { ssr: false, loading: () => <Skeleton /> })` — `ssr:false` is the critical hydration-safety knob since sibling choice is client-resolved.

Phase 16 ships only the primitive; no consumers yet. Phases 27 (Calendar), 31 (Match Drafting), and 35 (Tournament brackets) will wire `.desktop.tsx` / `.mobile.tsx` sibling loaders per R4 dual-DOM allowlist (D-26).

### app/layout.tsx integration

Existing root-shell tree (`<html>`/`<body>`/`<Providers>`/`<NavBar>`/`<main>`/`<Footer>`) fully preserved. Two new JSX mounts added:
- `<SafariWarning />` inside `<body>` above `<Providers>` → banner paints above NavBar per FOUND-08 "warning banner above the NavBar".
- `<ViewportWriter />` inside `<Providers>` as first child → one cookie writer per render tree.

Zero refactor of fonts, metadata, or existing layout logic. Both new components are `'use client'` — safe inside a Server Component root layout (standard Next.js pattern).

## Truths Confirmed

All 13 `must_haves.truths` items from plan frontmatter:
- lib/render-tier.ts exists as pure util with NO React imports (grep -n "^import " returns zero matches)
- getRenderTier() returns 'full' | 'image-only' via Safari sniff + WebGL/core-count probe + localStorage override + 7-day TTL cache
- VERSION = 1 constant at module top as sole cache-invalidation lever
- ViewportWriter writes vp=desktop|mobile cookie with 1-year max-age + SameSite=Lax (Pitfall 8 verified — arithmetic form, not magic number)
- ViewportWriter uses matchMedia('(pointer: coarse) and (hover: none)') with change-event listener (add+remove pair for cleanup)
- ViewportWriter returns null (DeletionBanner precedent) — no DOM output
- ViewportGate renders Skeleton on server when cookie absent AND dual-DOM, then swaps sibling client-side (D-27 Skeleton-first)
- ViewportGate falls back to desktop sibling when mobile is undefined (FOUND-12 single-DOM fallback)
- SafariWarning renders dismissible amber banner on Safari UA only (FOUND-08)
- SafariWarning uses inline styles — no HeroUI, no Tailwind (D-25)
- app/layout.tsx mounts SafariWarning + ViewportWriter at root shell (architecture diagram adherence)
- All components use D-33 bracketed-tag logging: [renderTier] (7 sites), [SafariWarning] (2 sites), [ViewportWriter] (1 site), [ViewportGate] (4 sites)
- Zero hydration mismatch warnings expected (2-pass render + Skeleton-first pattern structurally eliminates them)

## Verification Gates

All automated gates from plan `<verification>` passed:
- All 4 files exist: `lib/render-tier.ts`, `components/globals/viewport/{SafariWarning,ViewportWriter,ViewportGate}.tsx`
- `app/layout.tsx` mounts both SafariWarning and ViewportWriter
- `npm run test:typecheck` exit 0
- `npm run build` exit 0 (10/10 static pages generated, no warnings)
- `npx vitest run --config test/vitest.integration.config.ts test/backend/auth/auth-subscriptions.test.ts` — 1 test file / 2 tests passed in 13.70s on fresh-DB bootstrap (regression harness green)
- D-33 tagged logs present across all four primitives
- D-26 compliance: `grep -rnE "import.*ViewportGate.*from"` on `app/` + `components/` outside the viewport directory itself → zero matches (no in-phase consumers)

## Manual UAT (deferred)

Chrome DevTools UAT was scoped into each task's action block but is genuinely a human-interactive verification (UA spoofing via Network conditions, DevTools React Profiler hydration-warning inspection, DevTools Application → Cookies Max-Age visual check). The automated gates above confirm structural correctness. The user should run these checks during `/gsd-verify-work` when they exercise the dev server:
- Chrome fresh load: expect `[ViewportWriter] wrote vp=desktop` + `[SafariWarning] mount: isSafari=false dismissed=false show=false`; no banner visible
- DevTools → toggle UA to Safari desktop → reload: amber banner appears above NavBar; `[SafariWarning] mount: isSafari=true` logged
- Click Dismiss → banner disappears; `[SafariWarning] dismissed (persisted to localStorage)` logged; reload keeps it dismissed; clearing `hsrpvp_safari_warning_dismissed` brings it back
- DevTools Console: `localStorage.setItem('hsrpvp_render_tier_override', 'image-only')` → next page load logs `[renderTier] user override → image-only`
- DevTools → Rendering → Emulate coarse pointer → reload: `[ViewportWriter] wrote vp=mobile`; cookie flips in Application → Cookies
- Cookie Max-Age column shows ~31,536,000 (1 year); Secure absent on localhost HTTP, present on HTTPS deploys (Phase 17+ verification)
- DevTools React Profiler: no hydration-mismatch warnings on first load

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] ViewportGate generic constraint required for tsc strict-mode**
- **Found during:** Task 2 typecheck
- **Issue:** Plan canonical body declared `interface Props<P>` and `function ViewportGate<P>`. TypeScript strict-mode rejected `<Component {...componentProps} />` with `error TS2322: Type 'P' is not assignable to type 'IntrinsicAttributes & P'. Type 'P' is not assignable to type 'IntrinsicAttributes'.` — unconstrained `P` can resolve to non-object types that are not JSX-spreadable.
- **Fix:** Added `extends object` constraint to both the interface and the function signature: `interface Props<P extends object>` and `function ViewportGate<P extends object>`. Every realistic React props type is object-assignable, so zero behavior change. One-token addition in two sites.
- **Files modified:** `components/globals/viewport/ViewportGate.tsx`
- **Commit:** `b245eb4` (absorbed into Task 2 commit — the constrained form was committed as the Task 2 delivery)
- **Scope:** Strictly inside plan's `files_modified` frontmatter. No deviation in consumer contract — future Phase 27/31/35 consumers pass real React props (all objects), unaffected.

### Deferred Issues

None.

### Auth Gates

None — plan is UI-only; no backend calls, no auth flow.

## Known Stubs

None. All four primitives ship fully wired:
- `getRenderTier()` is a callable resolver with working decision chain
- `SafariWarning` mounts and evaluates UA + dismissal state on real localStorage
- `ViewportWriter` writes real cookies on real matchMedia events
- `ViewportGate` accepts real loaders; Skeleton render + next/dynamic swap flow wire end-to-end

ViewportGate has no in-phase consumer, but this is an intentional deliverable shape per D-26 (dual-DOM allowlist = Phases 27/31/35 only). The primitive is not a stub — it's the shipped contract.

## Threat Flags

None — plan's `<threat_model>` enumerates all security-relevant surface (vp cookie, localStorage writes, WebGL probe, hydration boundary). No new surface introduced outside that register.

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | render-tier util + SafariWarning primitive | b9c93b6 | lib/render-tier.ts, components/globals/viewport/SafariWarning.tsx |
| 2 | ViewportWriter + ViewportGate primitives | b245eb4 | components/globals/viewport/ViewportWriter.tsx, components/globals/viewport/ViewportGate.tsx |
| 3 | Mount SafariWarning + ViewportWriter in root layout | 0edf944 | app/layout.tsx |

## Notes for Downstream Phases

- **Phase 17+ Service Worker / asset tier gating:** import `getRenderTier()` from `@/lib/render-tier` to switch between `full` (Spine bundle) and `image-only` (portrait-only fallback) at asset-request time. Bump `VERSION` when the probe logic changes to force re-probing across all users.
- **Phase 27 (Calendar), 31 (Match Drafting), 35 (Tournament brackets):** these are the three R4/D-26 dual-DOM allowlist phases. Each will:
  1. Create `.desktop.tsx` + `.mobile.tsx` sibling files.
  2. In the Server Component parent page, read the `vp` cookie via `cookies()` from `next/headers`.
  3. Render `<ViewportGate desktop={() => import('./Page.desktop')} mobile={() => import('./Page.mobile')} initialViewport={cookieValue} componentProps={...} Skeleton={PageSkeleton} />`.
  4. When the cookie is present, SSR renders the cookied sibling directly (no Skeleton flash). When absent, ViewportGate renders Skeleton on both server and first client render (zero hydration mismatch), then matchMedia resolves on the client.
- **Generic constraint `<P extends object>`:** consumers should still pass real React props (which are always objects); the constraint is an internal strict-mode compliance detail.
- **Contract/architecture docs:** this plan is pure frontend infrastructure — no `docs/{feature}/` directory applies. The doc-update checkpoint in `/gsd-verify-work` should show zero touched backend features.

## Self-Check: PASSED

All claims verified:
- `lib/render-tier.ts` — FOUND
- `components/globals/viewport/SafariWarning.tsx` — FOUND
- `components/globals/viewport/ViewportWriter.tsx` — FOUND
- `components/globals/viewport/ViewportGate.tsx` — FOUND
- `app/layout.tsx` mounts both SafariWarning and ViewportWriter — verified via grep
- Commit b9c93b6 — FOUND in git log
- Commit b245eb4 — FOUND in git log
- Commit 0edf944 — FOUND in git log
