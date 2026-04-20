# Stack Research — v0.9 Frontend Milestone Additions

**Domain:** Competitive HSR PVP platform — Next.js 15 App Router frontend on SpacetimeDB 2.1.0
**Researched:** 2026-04-12
**Confidence:** HIGH on Spine, drag-and-drop, dual-DOM, imgur, charts, dates, Service Worker. MEDIUM on bracket library choice (two comparable options). HIGH on "do not add" list.

---

## Context (read this before the tables)

The **existing** stack is validated and will not change:

- **Framework**: Next.js 15 App Router (`^15.0.0`), React `^18.3.1`, React-DOM `^18.3.1`
- **UI kit**: HeroUI (`@heroui/*` 2.2.x / 2.4.x), TailwindCSS 4 (`^4.2.1` via `@tailwindcss/postcss`), framer-motion 12
- **Auth**: next-auth 4.24 (Discord OAuth) + SpacetimeDB identity token in localStorage
- **Data plane**: SpacetimeDB 2.1.0 WebSocket subscriptions — the **single** data source (no REST, no SSR data bridge, no `revalidateTag`)
- **Charts (already installed)**: `chart.js@^4.5.1`, `react-chartjs-2@^5.3.1`, `chartjs-plugin-datalabels@^2.2.0`
- **Package manager**: npm. Node `>=24`. TypeScript ~5.6.

The research below covers **only additions** driven by v0.9 features the existing stack does not solve.

Key architectural constraints from `notes/v09-frontend-subscription-strategy.md` (binding):

1. **Service Worker** is in scope. **Web Worker** (asset preloader) is in scope. **SDK-in-Worker offload is explicitly OUT of scope for v0.9**.
2. Browser support: **Chrome, Edge, Firefox only**. Safari is defensively gated to `image-only` tier.
3. Spine pedestal is single-canvas layered over a persistent `<img>` portrait. Exactly **one WebGL context** live at any moment.
4. **UploadThing** hosts Spine + portrait assets; **imgur** hosts user-uploaded match screenshots. No UploadThing SDK — CDN is fetched by URL only.
5. All historical data is self-scoped via `view_my_*` SpacetimeDB views; no client-side date/time filtering primitives that compete with server filters.

---

## Recommended Stack

### Core New Dependencies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@esotericsoftware/spine-webgl` | `^4.2.109` (latest 4.2.x) | Spine 2D skeletal animation WebGL runtime for the draft pedestal (Feature 1, Phase 31) | Official first-party runtime from Esoteric Software. `spine-player` is higher-level but ships a UI shell we don't want (we render a single canvas layered under/over our own DOM per Decision 3). `spine-webgl` is the canonical lower-level runtime exposed through `AssetManager` + `SceneRenderer` — the exact primitives Decision 3's disposal lifecycle requires. Match the Spine editor version the artist exports from; 4.2 is current as of April 2026. License: per Spine license — the project already owns Spine (implied by Decision 4's asset pipeline). |
| `@dnd-kit/core` | `^6.3.1` | Drag-and-drop primitives for team builder (Feature 7, Phase for `/teambuilder`) | `react-dnd` is effectively dormant (HTML5 backend stale, no React 19 commitment). `@dnd-kit` is accessible, keyboard-navigable, works under React 18.3.1 today and is the chosen migration target for React 19. Supports pointer + keyboard + touch sensors without a backend dependency. Roughly 10 KB gzipped core + optional sortable preset. Emits `'use client'`-compatible hooks. `@dnd-kit/sortable` adds ordered-team-slot reordering. `@dnd-kit/react` (0.3.x — NEW API) is under active refactor; stick with the stable `6.3.1` line for v0.9. |
| `@dnd-kit/sortable` | `^8.0.0` | Sortable extension for team slot ordering | Peer-matched to `@dnd-kit/core` 6.x. Enables keyboard-accessible reordering of the 4-character team grid without custom drag logic. |
| `@dnd-kit/utilities` | `^3.2.2` | CSS helpers for transforms (`CSS.Transform.toString`) | Required peer for sortable; ~1 KB. |
| `@g-loot/react-tournament-brackets` | `^1.0.0` (track releases; last publish is old) | Single/double-elim bracket visualization (Feature 5, Phase for tournaments UX) | Exports `SingleEliminationBracket`, `DoubleEliminationBracket`, `Match`, `SVGViewer` (pan/zoom). Data model is a flat array of matches referencing `nextMatchId` + `nextLooserMatchId` — matches cleanly to `bracket_match` rows from `view_to_bracket_matches`. SVG-based, prints well, theme-able. See "Alternatives Considered" — this is the recommendation over `react-brackets` for double-elim support and the built-in pan/zoom. **Risk**: maintenance cadence is slow; if peer-react range blocks the upgrade we may need to fork-and-publish under our scope. **Group/hybrid stages** are not library-supported — build those as a custom grid component consuming `view_to_dashboard`. |
| `imgur-anonymous-uploader` | latest | Match-screenshot upload (Feature 11) | Thin wrapper around `POST https://api.imgur.com/3/image` with `Authorization: Client-ID <id>`. Alternative: ~20 lines of `fetch()` directly — acceptable instead of pulling a dep. **Recommendation**: write the 20-line client in `lib/imgur.ts` rather than add a dependency. The endpoint, form-data shape, and error surface are all stable since v3. Client-ID goes in `NEXT_PUBLIC_IMGUR_CLIENT_ID`. Client-side upload only (browser → imgur), so no server route needed. |
| `luxon` | `^3.5.0` | Timezone arithmetic for calendar / availability / scheduling (Feature 9) | Calendar events need IANA timezone rendering (user sees their local time; stored as UTC in `calendar_event.time`). Luxon uses the native `Intl` API for timezone data → does not bundle the IANA DB (unlike `date-fns-tz` which pulls ~36 KB). Trade-off: Luxon itself is ~10–15 KB gzipped and not tree-shakeable, but the total is still smaller than date-fns + date-fns-tz + locale data for our usage. Single fluent API (`DateTime.now().setZone('America/New_York').plus({days: 1})`) beats `date-fns`'s functional composition for a recurring-availability UI. |

### Device / Viewport Detection (dual-DOM architecture)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js built-in `userAgent` helper from `next/server` | (bundled with Next 15) | SSR-safe initial device class in `app/layout.tsx` | Native API: `import { userAgent } from 'next/server'` and call it from a Server Component via `headers()`. No dependency, no UA-parser bundle, officially maintained by Vercel, already covered by Next.js updates. Returns `{ device: { type: 'mobile' \| 'tablet' \| undefined } }`. Set a `data-device` attribute on `<html>` during SSR; hydration reads the dynamic `window.matchMedia` value once and updates React state. Components consume a context provider `<ViewportProvider>` that exposes `isMobile`. |
| No new dependency | — | Client-side reactive viewport — use `window.matchMedia('(max-width: 768px)')` + `matchMedia.addEventListener('change', …)` in a 30-line `useIsMobile()` hook. | `react-device-detect` populates from UA only → gives wrong answer on resize; `react-responsive` pulls css-mediaquery dep for matching we already have natively. Neither is justified. |

**Dual-DOM pattern (recommended)**: One **shared container component** per page selects between `<DesktopView />` and `<MobileView />` children. Only one sub-tree mounts at a time via `isMobile ? <MobileView /> : <DesktopView />` — not `display: none`, not `hidden` class. This is a JS-level pattern, not a library.

```tsx
// app/(authed)/(match)/lobby/[id]/page.tsx (example shape)
'use client';
import { useIsMobile } from '@/lib/viewport';
import { LobbyDesktop } from '@/components/features/lobby/LobbyDesktop';
import { LobbyMobile } from '@/components/features/lobby/LobbyMobile';

export default function LobbyPage({ params }: { params: { id: string } }) {
  const isMobile = useIsMobile(); // hydrates from <html data-device>
  return isMobile ? <LobbyMobile id={params.id} /> : <LobbyDesktop id={params.id} />;
}
```

The SSR-initial value from `userAgent().device.type === 'mobile'` is passed to `<ViewportProvider initialIsMobile={...}>` so the first paint matches the device class and no flash occurs. No library — this is a `lib/viewport/useIsMobile.ts` + `lib/viewport/ViewportProvider.tsx` pair (~80 LOC total).

### Charts / Leaderboards (Feature 8)

| Technology | Version | Purpose | Why Keep (not add) |
|------------|---------|---------|-----------------|
| `chart.js` (already installed) | `^4.5.1` | MMR history line chart, win-rate donut, character usage bar | Already in `package.json`. Canvas-based → handles hundreds of data points (a heavy user's `mmr_history` could have 500+ points over a season) without SVG layout thrash. `chartjs-plugin-datalabels` covers the in-chart labels we need. `recharts` would be the SVG alternative, but migrating adds 85 KB gzipped with no user-visible upside at our dataset sizes. |
| `react-chartjs-2` (already installed) | `^5.3.1` | React wrapper | Already in. Compatible with React 18.3.1 and React 19 on release. |

**Decision: do not add a second charting library.** Reach for Chart.js with appropriate chart types (`line`, `doughnut`, `bar`). For sparklines in the leaderboard table, consider inline SVG or a minimal sparkline via Chart.js `type: 'line'` with all axes/legend disabled — no additional dep.

### Service Worker + Web Worker (Feature 2)

No library. The SW is ~40 LOC of vanilla JS at `/public/sw.js` (shape already specified in Decision 2 of the subscription strategy doc). The Web Worker is a plain TypeScript file at `/workers/assetPreloader.ts` — Next.js supports `new Worker(new URL('./worker.ts', import.meta.url))` natively since Next 13 with Turbopack and `/** @type {WorkerModule} */` loader.

**Do not use** `workbox-webpack-plugin`, `next-pwa`, or `@serwist/next`:

- Decision 2's SW deliberately intercepts only asset-CDN hostnames, not the app origin. Full PWA frameworks generate app-shell + precache manifests that conflict with the asset-only design.
- Next.js 15 App Router + Turbopack compatibility with `next-pwa` is still shaky as of April 2026 (upstream issues).
- Rolling our own 40-line SW is correct per the architecture doc — wrapping it in a PWA framework would re-introduce the dev-time HMR problems the architecture specifically avoids.

### Drawing / Annotation (Feature 10 — mouse tracking during draft)

**Recommendation: build it yourself, do not add a drawing library.**

The draft-phase mouse tracking described in `docs/chat/` + `LobbyCursorEvent` is **pointer broadcasting**, not free-form annotation. Each player's cursor position streams through `LobbyCursorEvent` rows and renders as colored dot + optional trail on an absolutely-positioned overlay div. This is ~100 LOC of React + CSS transforms — not a whiteboard.

If annotation capability (drawing a circle around a character avatar during coaching) is added later:

- **tldraw** (`tldraw@^3.x`) is heavy (~1 MB gzip + dependencies) and overkill — infinite canvas, shape primitives, snapping — wrong fit for a fixed-layout draft overlay.
- **perfect-freehand** (`perfect-freehand@^1.2.x`, ~3 KB) produces the SVG path from pointer input but requires you to wire your own SVG layer. Appropriate if coaching annotation is actually added — but **not needed for v0.9's cursor-broadcast feature**. Defer the library decision to the annotation phase, if/when it ships.

**v0.9 decision**: no drawing library. Cursor overlay is pure React + transform3d.

### Screenshot verification workflow (Feature 12)

No new library. The workflow is:

1. User takes a screenshot → uploads to imgur → gets URL (Feature 11 above handles this).
2. URL is passed to a reducer that stores it on `match_result`.
3. Referee views the URL in a modal (HeroUI `<Modal>` + `<img>`).

No OCR, no computer vision, no image diffing — those are explicitly out-of-scope in `PROJECT.md` ("Computer vision screenshot roster import — high complexity, future milestone"). Verification is eyeball + referee authority.

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Next.js typed routes (`experimental.typedRoutes: true`) | Compile-time catch of `<Link href=...>` against renamed paths after Decision 5's route-group migration | Turn on during Phase 16 (route migration). Specifically flagged as a risk mitigation for Phase 2 of the subscription-strategy doc. |
| Bundle analyzer | Detect bundle regressions on the Spine/Worker boundary | Use `@next/bundle-analyzer` (only add to `devDependencies`). Run locally before each milestone ship. |

No new testing/linting dependencies — the project's existing vitest + `tsc --noEmit` + `next lint` stack covers frontend work.

---

## Installation

```bash
# Core additions for v0.9 (Phase 16 installs these)
npm install @esotericsoftware/spine-webgl @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @g-loot/react-tournament-brackets luxon

# Dev dependency (one-off for bundle checks)
npm install -D @next/bundle-analyzer

# NOT installed (write directly):
# - imgur client: ~20 LOC in lib/imgur.ts
# - Service Worker: /public/sw.js (40 LOC)
# - Web Worker: /workers/assetPreloader.ts
# - Viewport detection: lib/viewport/ (~80 LOC)
# - Cursor overlay: component-level (~100 LOC)
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `@esotericsoftware/spine-webgl` | `@esotericsoftware/spine-player` | If you wanted a self-contained widget with built-in UI controls. **We don't** — Decision 3 specifies our own single-canvas layered render. `spine-player` also forces a DOM wrapper that fights the layering model. |
| `@esotericsoftware/spine-webgl` | `@esotericsoftware/spine-pixi` (v4.2) | If the project were already rendering with Pixi.js. It isn't — adding Pixi solely for Spine is ~130 KB of unnecessary weight. |
| `@dnd-kit/core` (stable 6.x) | `@dnd-kit/react` (new 0.3.x API) | Once the new API stabilizes and a migration guide exists. As of April 2026, it lacks `'use client'` at the provider (GH issue #1654) and has API churn. Revisit post-v0.9. |
| `@dnd-kit/*` | `react-dnd` | Never for this project — maintenance has stalled, React 19 support is a years-old open issue, and its HTML5 backend is clunky on mobile touch. |
| `@dnd-kit/*` | native HTML5 `draggable="true"` | For trivially simple drag-and-drop (e.g., file drop zones). The team builder needs accessible keyboard reordering and sortable semantics — native `draggable` cannot deliver that without a full reimplementation of `@dnd-kit`. |
| `@g-loot/react-tournament-brackets` | `react-brackets` | If you only need single-elimination and want a more actively-maintained repo. `react-brackets` is simpler but does not handle double-elim with a winners/losers cross-link — which v0.5's `bracket_match` schema emits. |
| `@g-loot/react-tournament-brackets` | Custom SVG bracket | If the library won't upgrade its React peer range in time. Viable fallback: a d3-layout-driven custom component is ~300 LOC. Keep this as Plan B. |
| `@g-loot/react-tournament-brackets` | `react-flow` / `@xyflow/react` | Overkill: react-flow is for node-based DAG editors; brackets don't need its zoom/pan/edge-routing machinery when `SVGViewer` already ships with the g-loot package. |
| `luxon` | `date-fns` + `date-fns-tz` | If the app did zero timezone math. It does. Luxon's Intl-native timezone handling wins at our usage. |
| `luxon` | `dayjs` + `dayjs/plugin/timezone` | dayjs/timezone also uses Intl — roughly break-even on bundle. Pick luxon because its fluent API is more readable for the recurring-availability UI and its docs for DST arithmetic are clearer. If dayjs is already in your head, it's an acceptable substitute. |
| `luxon` | native `Intl.DateTimeFormat` only | For pure formatting, yes. For recurring-availability logic ("every Tuesday 7pm EST, skipping the next occurrence") + invite timezone arithmetic, no — we'd reinvent `DateTime` wrappers inside our codebase. |
| Built-in `userAgent()` + `matchMedia` | `react-device-detect` | `react-device-detect` parses UA only, never updates on resize, and pulls ~30 KB of UAParser. Our needs are resize-reactive. |
| Built-in `userAgent()` + `matchMedia` | `react-responsive` | Acceptable if you want prebuilt media-query components. Not needed — the pattern is one hook + one provider. |
| Hand-written Imgur client | `imgur` npm package | The `imgur` package adds OAuth flows + album management we don't use. ~20 LOC direct `fetch` is more auditable and has zero dep-chain risk. |
| Custom cursor overlay (no dep) | Ably Spaces / Liveblocks | These are realtime-sync SaaS platforms. We already have SpacetimeDB for realtime sync — adding another sync layer is duplicative and violates the "single data plane" decision. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `next-pwa`, `@serwist/next`, `workbox-webpack-plugin` | These frameworks generate app-shell + precache manifests that conflict with Decision 2's asset-CDN-only Service Worker. Also brittle with Next 15 + Turbopack on some combos. | Hand-written `public/sw.js` per Decision 2 spec (~40 LOC). |
| `react-dnd` | Stalled maintenance, no React 19 commitment, HTML5 backend is mobile-hostile. | `@dnd-kit/core` + `@dnd-kit/sortable`. |
| `react-device-detect` | UA-only, no resize reactivity, hydration-mismatch prone. | Next.js built-in `userAgent()` for SSR + `window.matchMedia` for live updates. |
| `tldraw` (for v0.9) | 1 MB+ of infinite-canvas SDK when we need a pointer dot, not a whiteboard. | Pure React overlay on top of the draft DOM. Revisit if annotation becomes a requirement. |
| `recharts` | We already have Chart.js; adding recharts is 85 KB of duplication with no feature gap. | Keep `chart.js` + `react-chartjs-2`. |
| `date-fns-tz` | Bundles ~36 KB of IANA data the browser's `Intl` already has. | `luxon` (Intl-native). |
| `moment` / `moment-timezone` | Deprecated by its own maintainers. | `luxon`. |
| `uploadthing` SDK on the client | Per Decision 3, UploadThing hosts architectural assets only, fetched by URL. No client-side upload is needed. Match screenshots go to imgur, not UploadThing. | `<img src={character.imageUrl}>` + direct `fetch()`; imgur for user uploads. |
| `@esotericsoftware/spine-player` (with UI) | Ships its own DOM shell that fights Decision 3's single-canvas layered architecture. | `@esotericsoftware/spine-webgl` — the lower-level runtime that exposes `AssetManager` + `SceneRenderer` directly. |
| SpacetimeDB SDK inside a Web Worker | Explicitly out of scope for v0.9 (see subscription-strategy doc: "Out of scope: SpacetimeDB SDK main-thread offload"). | Keep SDK on main thread; move only asset prefetch to the Web Worker. |
| Any additional realtime-sync library (Liveblocks, Ably, Socket.io) | We have SpacetimeDB. A second realtime plane violates the single-data-plane architecture. | `LobbyCursorEvent` + subscriptions. |
| Any middleware-level auth library | Decision doc specifies a **cookie-presence-only** middleware check — no JWT verification, no role checks at middleware. | Next.js built-in middleware at `middleware.ts` checking `stdb_session` / NextAuth cookie. |
| `detect-gpu` for render-tier detection | Decision 7 explicitly excludes it ("dependency weight, restricted APIs"). Also `WEBGL_debug_renderer_info` is increasingly throttled across browsers. | `getRenderTier()` implementation in the decision doc — pure feature detection, no library. |

---

## Stack Patterns by Feature

**If Feature 1 (Spine pedestal):**
- Use `@esotericsoftware/spine-webgl` 4.2.x
- Match the Spine editor export version byte-for-byte; `.skel` binary format has breaking changes between majors
- Dispose via `assetManager.removeAll()` + null the renderer on every route unmount — Decision 3's lifecycle table is load-bearing

**If Feature 3 (dual-DOM mobile/desktop):**
- Use built-in Next `userAgent()` for SSR initial class + `matchMedia` for client updates
- Render EXACTLY ONE subtree (`isMobile ? <Mobile /> : <Desktop />`), no `display: none`
- Wrap each page in `<ViewportProvider initialIsMobile={serverValue}>` to avoid hydration mismatch

**If Feature 5 (tournament brackets):**
- `@g-loot/react-tournament-brackets` for single/double elimination
- Custom grid component (plain Tailwind + HeroUI `<Table>`) for group stages, consuming `view_to_dashboard`
- Hybrid stages = conditional render of one or the other based on `stage.type`

**If Feature 9 (calendar/scheduling):**
- `luxon` for all timezone math
- Store all timestamps UTC in SpacetimeDB; render with `DateTime.fromMillis(utc).setZone(user.tz)`
- No calendar UI library — HeroUI already provides `<DateInput>` (via `@heroui/input`). Build the recurring-availability grid as a plain Tailwind component. `react-big-calendar` is not needed unless the UX explicitly shows a month/week grid with events — if that UX ships, revisit and likely add `react-big-calendar@^1.19.4` (React 19 ready since 1.18.0)

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@esotericsoftware/spine-webgl@4.2.x` | React 18.3.1, React 19, Next.js 15 | Framework-agnostic (plain TS) — no React peer. Must match Spine editor export version. |
| `@dnd-kit/core@6.3.1` | React 18.3.1. React 19: works in practice; GH #1654 tracks a `'use client'` polish fix for the new `@dnd-kit/react` 0.3.x package (not the 6.x line). | Stick with 6.x for v0.9. |
| `@g-loot/react-tournament-brackets@1.x` | React 18.3.1. React 19: confirm peer range when upgrading; may need a fork-and-publish. | Slow upstream cadence — monitor. |
| `luxon@3.5.x` | No React peer. Node and browser. | Uses Intl — no timezone DB bundling. |
| `react-big-calendar@1.19.4` (if added later) | React 19 ready since 1.18.0. React 18.3.1 compatible. | Only add if calendar-grid UX is confirmed. |
| `chart.js@4.5.1` + `react-chartjs-2@5.3.1` | React 18.3.1 + React 19 | Already installed; no change needed. |
| Next.js 15 `userAgent()` | Next 15 App Router Server Components | Import from `next/server`. Works with `headers()` from `next/headers`. |

**Peer-dependency cliff to watch**: when the project moves from React 18.3.1 → React 19 (a separate decision, not part of this stack addition list), verify `@dnd-kit/core@6.3.1` and `@g-loot/react-tournament-brackets` against that upgrade. Both should be fine but are the two libraries most likely to need attention.

---

## Integration Points with Existing Stack

| New Library | Existing Stack Integration |
|-------------|----------------------------|
| `@esotericsoftware/spine-webgl` | Renders into a `<canvas>` element inside a HeroUI-free component (`components/features/draft/Pedestal.tsx`). Portrait underneath is a plain `<img>` — do NOT wrap in `<Image>` from `next/image` (the persistent-visibility lifecycle fights Next.js image optimization). The canvas element sits inside a Tailwind-styled absolute container. |
| `@dnd-kit/*` | Wraps the HeroUI character card components. `<DndContext>` goes at the team-builder page level; `useDraggable` on each character chip; `useDroppable` on each team slot. |
| `@g-loot/react-tournament-brackets` | Consumes `view_to_bracket_matches` rows directly — write a thin mapper `toBracketMatchesPropShape(rows)` in `lib/tournament.ts`. Wrap in HeroUI `<Card>` for the page chrome. The bracket SVG itself is unstyled by HeroUI — use the library's theme prop with tokens from `app/tokens.css`. |
| `luxon` | Consumed by `lib/time/*.ts` utilities. UI inputs stay HeroUI — luxon is a computation layer, not a UI layer. |
| Viewport detection | `<ViewportProvider>` wraps children in `app/providers.tsx` (same file that owns the SpacetimeDB connection). Consumer pattern: `const isMobile = useIsMobile();` — integrates with Decision 5's route-group layouts without touching them. |
| Imgur client | Called from a Server Action in `app/actions/upload-screenshot.ts`. Client-ID lives in `NEXT_PUBLIC_IMGUR_CLIENT_ID`. The returned URL is passed to a SpacetimeDB reducer (`submit_match_result` or similar) — no persistent state in Next.js. |
| Service Worker | Registered in `app/providers.tsx` inside a `useEffect` gated on `NODE_ENV === 'production' \|\| NEXT_PUBLIC_ENABLE_SW === 'true'` (see Decision 2 dev-mode handling). |
| Web Worker | Instantiated from `app/(authed)/(match)/layout.tsx` via the `ensureSpinePrefetchStarted()` singleton in `lib/spine-prefetch.ts`. Reads `hsr_character` rows from the already-established SpacetimeDB subscription (Decision 1). |

---

## Bundle Size Impact (gzipped, estimated)

| Addition | Approx Size | Notes |
|----------|-------------|-------|
| `@esotericsoftware/spine-webgl` | ~80–100 KB | Dominant new weight. Loaded only on `(authed)/(match)/**` routes via route-group code-splitting (Decision 5). Anonymous visitors pay zero. |
| `@dnd-kit/core` + `sortable` + `utilities` | ~12–15 KB combined | Loaded only on `/teambuilder` and any authed page using drag. |
| `@g-loot/react-tournament-brackets` | ~25–35 KB | Loaded only on tournament pages. |
| `luxon` | ~15 KB | Loaded wherever calendar/schedule UX surfaces. Not in the public-tier bundle. |
| Imgur client (custom ~20 LOC) | <0.5 KB | Negligible. |
| Service Worker, Web Worker | N/A | Separate files, not part of the JS bundle. |
| Viewport detection (custom) | ~1 KB | Negligible. |
| **Total new weight on heaviest route (draft)** | ~110–150 KB gzipped | Spine dominates. All other additions are rounding error in comparison. |

**Anonymous-tier bundle is unaffected**: the public route group (`(public)/*`) pulls in none of these — only existing Chart.js + framer-motion + HeroUI.

---

## Sources

- `notes/v09-frontend-subscription-strategy.md` — 8 binding decisions (Decisions 1–8) — HIGH confidence (internal, authoritative)
- `.planning/PROJECT.md` — validated capabilities from v0.5 (tournament, MMR, scheduling, mouse tracking, lobbies) — HIGH
- `package.json` — current installed versions — HIGH
- [@esotericsoftware/spine-webgl on npm](https://www.npmjs.com/package/@esotericsoftware/spine-webgl) — 4.2.109 latest, published ~10 days before research date — HIGH
- [Spine Runtimes 4.2 README](https://github.com/EsotericSoftware/spine-runtimes/blob/4.2/spine-ts/README.md) — module structure, ESM format — HIGH
- [@dnd-kit/core on npm](https://www.npmjs.com/package/@dnd-kit/core) — 6.3.1 latest — HIGH
- [dnd-kit GH #1654](https://github.com/clauderic/dnd-kit/issues/1654) — React 19 + `'use client'` on the NEW `@dnd-kit/react` 0.3.x package (not 6.x) — HIGH
- [@g-loot/react-tournament-brackets](https://github.com/g-loot/react-tournament-brackets) — double-elim + SVGViewer pan/zoom — MEDIUM (maintenance cadence slow; confirmed present, version confirmation pending direct repo check during Phase 16)
- [react-big-calendar #2701](https://github.com/jquense/react-big-calendar/issues/2701) — React 19 support landed in 1.18.0; latest 1.19.4 — HIGH
- [Next.js userAgent function](https://nextjs.org/docs/app/api-reference/functions/userAgent) — official SSR UA helper — HIGH
- [Luxon tree-shaking issue #94 + #854](https://github.com/moment/luxon/issues/94) — Luxon is not tree-shakeable but uses Intl, so timezone DB is free — HIGH
- [date-fns vs Luxon bundle comparison 2026](https://www.pkgpulse.com/blog/best-javascript-date-libraries-2026) — confirms ~36 KB IANA-DB penalty for date-fns-tz — MEDIUM
- [Imgur API v3 anonymous upload](https://api.imgur.com/3/image) endpoint + `Authorization: Client-ID` pattern — HIGH (stable since v3 launch)
- [tldraw + perfect-freehand discussion](https://github.com/steveruizok/perfect-freehand/discussions/38) — confirms tldraw uses perfect-freehand; both confirmed heavyweight for our use case — HIGH

---

*Stack research for: v0.9 Frontend Milestone — additions beyond v0.5 backend + landing-page baseline*
*Researched: 2026-04-12*
