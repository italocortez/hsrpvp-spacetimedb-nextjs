# Project Research Summary — v0.9 Frontend Milestone

**Project:** HSR PVP — v0.9 Frontend Milestone (phases 15–41)
**Domain:** Competitive gaming platform — Next.js 15 App Router frontend on SpacetimeDB 2.1.0
**Researched:** 2026-04-12
**Confidence:** HIGH on stack + architecture + pitfalls (cross-referenced against 8 binding decisions in `notes/v09-frontend-subscription-strategy.md`); MEDIUM on dual-DOM SSR-first-visit UX and tournament-library maintenance risk.

## Executive Summary

v0.9 is a **frontend-only** milestone atop a locked v0.5 backend (67 tables, 32 views, ~156 reducers). The four research axes converge: the milestone's hard problems are not feature complexity — they are **architectural invariants** every phase must respect. The strategy doc's 8 binding decisions are the spine; research found no reason to reopen any of them.

Stack additions are small and opinionated — `@esotericsoftware/spine-webgl@4.2`, `@dnd-kit/*@6.3`, `@g-loot/react-tournament-brackets`, `luxon`, plus hand-written primitives (imgur client, viewport detection, 40-LOC Service Worker). Chart.js stays. There is an explicit do-not-add list (next-pwa, react-dnd, react-device-detect, tldraw, recharts, date-fns-tz, Imgur SDK, `@esotericsoftware/spine-player`) that PR review must enforce — every rejection has a concrete reason.

Dominant risks: bandwidth (subscription at wrong layer → energy ceiling breach), GPU leaks (WebGL context accumulation across 2-hour sessions), auth/hydration flashes. Each maps to a specific phase + verification test. If Phase 15 ships `view_my_*` views and Phase 16 lands the primitives correctly, the rest is feature work against a stable substrate.

## Key Findings

### Stack Additions to Commit

| Package | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| `@esotericsoftware/spine-webgl` | `^4.2.109` | Spine pedestal WebGL runtime | Lower-level primitive required by Decision 3's layered single-canvas model |
| `@dnd-kit/core` + `sortable` + `utilities` | `^6.3.1` / `^8.0.0` / `^3.2.2` | Team builder slot reorder (accessible) | `react-dnd` stalled; stick with 6.x stable |
| `@g-loot/react-tournament-brackets` | `^1.0.0` | Single + double elim bracket viz | Only mainstream lib with winners/losers cross-link; MEDIUM maintenance confidence — Plan B is a custom d3 bracket (~300 LOC) |
| `luxon` | `^3.5.0` | IANA timezone math | `Intl`-native — skips 36 KB DB penalty of date-fns-tz |
| `@next/bundle-analyzer` | latest | Dev-only bundle regression guard | `ANALYZE=true` per milestone |

**Hand-written (no dep):** Imgur upload (~20 LOC), SW (~40 LOC, asset-CDN hostname filter), viewport detection (~80 LOC), cursor overlay (~100 LOC).

**Already installed:** `chart.js@^4.5.1` + `react-chartjs-2@^5.3.1` + `chartjs-plugin-datalabels` — covers all charts. Do not add recharts.

**Do-not-add list:** next-pwa, @serwist/next, workbox-webpack-plugin, react-dnd, react-device-detect, react-responsive, tldraw, recharts, date-fns-tz, moment, uploadthing (client), @esotericsoftware/spine-player, SpacetimeDB SDK in Web Worker, any second realtime-sync library, any middleware-level auth library, detect-gpu.

**Web Worker note:** Per user preference, **no Web Worker** for prefetch. Portrait prefetch runs on main thread via `requestIdleCallback`. Service Worker alone handles asset caching.

Bundle impact: ~110–150 KB gzipped on draft route (Spine dominates). Public/anon tier unchanged.

### Feature Categorization

**Table stakes (must ship v0.9):** Cost tables (M), Team builder click-to-add with cost meter + synergy (M-L), Draft pick/ban + Spine pedestal + cursor broadcast (**Largest**), Tournament brackets — 4 formats (**L**), Spectator view (M — shares draft components), Calendar + scheduling — week/month/recurring/invites (**L**), Profile stats (M), Match post-drafting — Imgur upload + MMR reveal (M-L), Leaderboards per game mode + composite (S-M).

**Differentiators:** In-app draft replay scrubber, live cursor broadcast, Spine pedestal, cost-set aware team builder, When2meet-style availability overlap.

**Anti-features (reject):** Horizontal bracket shrink on mobile, drag-drop team builder (click-to-add beats drag/drop), 0.5× replay speed, persistent multi-line MMR chart on mobile, drag-to-create calendar on mobile, long MMR confetti animations, chat persistence, server-IP-based time SSR, embedded 3D game replay.

**Critical mobile (XX.1) phases** — need own design not CSS responsive: Tournament brackets (round-by-round swipe), Draft UI (stacked + pedestal resize + cursor-send off), Calendar (day-view default).
**Safe for responsive-only:** team builder, cost tables, leaderboards, spectator view, match post-drafting.

### Open Phase 16 Decisions (must resolve before feature phases start)

1. **Dual-DOM folder pattern** — recommend sibling `cost-table.desktop.tsx` + `cost-table.mobile.tsx` via `next/dynamic({ ssr: false })` within a `page.tsx` that uses `<ViewportGate>`.
2. **Viewport SSR default on first-ever visit** — recommend **desktop-default**; returning visitors get correct SSR from `vp` cookie.
3. **Middleware matcher shape** — recommend **positive list** of authed paths over negative lookahead. Must exclude `/sw.js` and `_next/*`.
4. **`experimental.typedRoutes: true`** — enable **before** Phase 16 step 1 (rename `(landing-page)` → `(public)`, `(authenticated)` → `(authed)`) so stale `<Link>` paths fail at build.
5. **Next.js version bump to ≥15.2.3** — required for CVE-2025-29927 middleware bypass. Current `^15.0.0` may resolve vulnerable. Land **before** middleware ships.

### Top 10 Pitfalls (ranked by impact) with Phase Ownership

| # | Pitfall | Phase ownership | Prevention signal |
|---|---------|-----------------|-------------------|
| 1 | **Subscription at wrong layer** (bandwidth ceiling) | Phase 16 + every PR | `tools/energy-model.js` ≤ 102,500; Decision 6 map grep |
| 2 | **Spine prefetch fires twice** (Strict Mode / client nav) | Public-tier + match-zone prefetch phases | Module-level singleton (NOT `useRef`); Strict Mode regression test |
| 3 | **Pedestal WebGL not fully disposed** (GPU leak) | Draft/pedestal phase (31) | Full Decision 3 lifecycle matrix; `MutationObserver` single-canvas invariant; 20-transition test |
| 4 | **Historical tables subscribed above profile scope** | Phase 15 + historical phase (40-41) | `view_my_*` filter on `ctx.sender`; ESLint/grep rule |
| 5 | **Service Worker stuck in dev** from prod test | Phase 16 SW scaffold | `/dev-unregister-sw` helper; `CACHE_NAME` versioning; Vercel preview smoke test |
| 6 | **Auth desync** (flash of login on F5 / cross-tab) | Phase 16 + Phase 21 | Tri-state auth; `BroadcastChannel('hsr-auth')`; sign-out clears all three artifacts in order |
| 7 | **Cursor / chat / pick-ban storm** (lobby >10 users) | Match-zone phases (28-33) | 30 Hz rAF cursor throttle + 2 px delta; `(createdAt, messageId)` sort; pending-overlay for optimistic picks |
| 8 | **`'use client'` at a layout** (bundle bloat) | Phase 16 + ongoing | `grep` check; bundle analyzer threshold |
| 9 | **Turbopack ↔ Webpack dev-prod drift** | Every phase closeout | `npm run build` clean + Vercel preview mandatory |
| 10 | **Dual-DOM hydration mismatch** | Phase 16 + every XX.1 | `useSyncExternalStore` for matchMedia; `vp` cookie SSR hint |

Plus: **Next 15 async `params`** — every dynamic route (`/lobby/[id]`, `/draft/[matchId]`, `/profile/[userId]`) must be `async function Page({ params }: { params: Promise<{ id: string }> })` + `await params`. Affects every Phase 16 route migration.

### Phase Sizing Signals

- **Large (plan for spillover):** Draft UI + Spine pedestal (31), Tournament brackets (35), Calendar (27), Team builder (20)
- **Medium:** Cost tables (18), profile stats viz (39), match post-drafting (33), replay playback (41), spectator view
- **Small:** Leaderboards (37), MMR chart
- **Small foundational:** Phase 15 (backend pre-work), Phase 16 (many small pieces), Phase 21 (thin authed base)

### Cross-Phase Patterns Every Phase Must Know

1. **Subscription placement** — name the layout file + highest-common-consumer justification in the PR. No exceptions.
2. **Viewport consumption** — `const vp = useViewport(); if (!vp) return <Skeleton />;` then branch. Never CSS-toggle both trees.
3. **SW hostname filter** — intercepts ONLY asset CDN hostnames (UploadThing `ufs.sh`). Never app origin. Imgur passthrough.
4. **Next 15 async params** — every dynamic page/layout.
5. **`'use client'` discipline** — leaves only; layouts stay Server. Sole exception: `providers.tsx`.
6. **Reducer client patterns** — `Timestamp.now()`, `null` for optional, tagged-union enums, `.catch()` errors.
7. **Strict Mode symmetry** — every `subscribe()` ↔ `unsubscribe()`; singletons module-level not `useRef`.
8. **Cross-user routes subscribe to ZERO additional tables** — reject PRs that do otherwise.

## Implications for Roadmap

### Foundation phases (15, 16, 21)

**Phase 15 — Backend pre-work.** Rationale: `view_my_*` historical views + Spine schema are prereqs; skipping is the #1 tech-debt source. Delivers `view_my_match_history / mmr_history / session_history / participant_history` filtered on `ctx.sender` + Spine URL columns on `hsr_character`. Avoids Pitfall 4.

**Phase 16 — Route + global foundation.** Rationale: All 5 open integration items must resolve before any feature phase. Also migrates groups, collapses `(game)/draft` under `(authed)/(match)`, trims `useAuth.ts`. Delivers route group structure, middleware.ts, ViewportGate, render-tier.ts, SafariWarning, SW scaffold (no Web Worker — main-thread prefetch), async-params migration, Next bump, typedRoutes. Avoids Pitfalls 1/8/10 + CVE-2025-29927.

**Phase 21 — Authed base.** Rationale: Minimal authed base per user preference — tri-state `<AuthRequired>`, `user` sub moved to `(authed)/layout.tsx`, cross-tab `BroadcastChannel`. Avoids Pitfall 6.

### Feature phases (17–41)

Data/UX pair pattern per feature; XX.1 mobile phases opportunistic.

- **Public tier (17-20):** Cost tables + team builder — drives `(public)` group, SW portrait prefetch, first dual-DOM verification
- **Admin + profile + calendar (22-27):** Lower-risk feature work against established patterns
- **Core match loop (28-33):** Lobby → draft + Spine → post-drafting. Largest phases. Pitfalls 2/3/7 materialize here.
- **Tail (34–41):** Tournament (34-35) → Leaderboards (36-37) → User/char stats (38-39) → Historical/replay (40-41). Tournament mandatory XX.1.

### Research Flags

**Needs research-phase:** Phase 15 (view composite indexes + Spine schema), Phase 31 (scaleY workaround, pick-ban optimistic), Phase 27 (recurring slots + DST + overlap algo), Phase 35 (React 19 peer confirmation / Plan B cost).

**Standard patterns (skip research):** Phase 16 (research already covers it), Phase 21 (pattern locked), Phase 37 Leaderboards, Phase 33 Match post-drafting, spectator.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified at research date; binding decisions internal authoritative; only MEDIUM item is g-loot/react-tournament-brackets maintenance (Plan B ready) |
| Features | MEDIUM-HIGH | Backend locked; UX patterns cross-referenced with chess.com/FACEIT/start.gg/Prydwen/Smogon |
| Architecture | HIGH (App Router + middleware); MEDIUM (dual-DOM — no ecosystem convention, pattern is project-specific synthesis) | ViewportGate novel composition of known primitives |
| Pitfalls | HIGH (stack-specific grounded in strategy doc + memory + Phase 12/13 incidents); MEDIUM (STDB SDK 2.1 edge behavior — young, thin docs) | P1-P3 highest impact, all have verification tests |

**Overall: HIGH.** Locked backend + 8 committed architectural decisions + alternatives-considered tables for every stack pick. Feature-phase research is largely "execute pattern," not "discover pattern."

### Gaps to Address

- **Dual-DOM first-ever-visit UX** — Phase 16 design call
- **`@g-loot/react-tournament-brackets` React 19 peer** — verify before Phase 34; fork-Plan-B ready
- **Spine `skeleton.scaleY = -1`** — Phase 31 must fix camera projection OR document + test skinning
- **FullStory 5k events/month** — sampling strategy needed (low priority)
- **Imgur rate-limit fallback** — Discord-bot storage plan exists but not scoped; flag for Phase 32 (match post-drafting data)
- **Vercel preview Discord OAuth** — dynamic callback URLs; `*.vercel.app` whitelist OR `returnTo` validator; flag for Phase 21

## Ready for Requirements

Synthesis complete. Orchestrator can proceed to requirements definition. The five Phase 16 integration items (dual-DOM folder pattern, viewport SSR default, middleware matcher, typedRoutes enablement, Next 15.2.3 bump) should be explicitly called out as "must resolve in Phase 16" during roadmap phase definition so the roadmapper scopes them into the phase rather than scattering them across feature phases.
