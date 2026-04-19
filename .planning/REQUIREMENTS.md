# Requirements: HSRPVP — v0.9 Frontend Milestone

**Defined:** 2026-04-12
**Core Value:** Players can organize, play, and track competitive HSR matches and tournaments in one place — from drafting to scoring to leaderboards — without relying on external tools.

**Architectural source of truth:** `notes/v09-frontend-subscription-strategy.md` + `.planning/research/DECISIONS.md` (R1–R10 refinements). `DECISIONS.md` wins where it conflicts with notes; notes apply otherwise.

---

## v0.9 Requirements

Requirements for the v0.9 Frontend Milestone. Each maps to exactly one phase (15–41) via traceability table below.

### Foundation (FOUND)

Infrastructure delivery. Enables every feature phase.

- [x] **FOUND-01**: Backend exposes `skelUrl`, `atlasUrl`, `atlasImgUrls` columns on `hsr_character` with admin editing reducer
- [x] **FOUND-02**: Backend exposes `view_my_match_session_history`, `view_my_match_session_step_history`, `view_my_match_participant_history`, `view_my_mmr_history`, `view_my_match_result_game_history` — all filtered server-side by `ctx.sender`
- [x] **FOUND-03**: Frontend runs on Next.js ≥15.2.3 with `experimental.typedRoutes: true` enabled
- [x] **FOUND-04**: Route groups renamed: `(landing-page)` → `(public)`, `(authenticated)` → `(authed)`, `(game)/draft` collapsed into `(authed)/(match)/draft`; all `<Link>` and `router.push` callers updated
- [x] **FOUND-05**: `user` subscription moved from `useAuth.ts` to `(authed)/layout.tsx`; `useAuth.ts` retains only `view_my_profile` bootstrap
- [x] **FOUND-06**: `providers.tsx` subscribes globally to 6 public reference tables + `view_my_profile` for all sessions (anon and authed)
- [x] **FOUND-07**: Service Worker at `/public/sw.js` caches UploadThing asset CDN requests, gated to `NODE_ENV === 'production'` or `NEXT_PUBLIC_ENABLE_SW === 'true'`
- [x] **FOUND-08**: Safari users see dismissible warning banner above NavBar; `getRenderTier()` returns `image-only` for Safari
- [x] **FOUND-09**: `getRenderTier()` correctly classifies device capability (full vs image-only) using WebGL + software-rasterizer + core-count + user preferences; cached 7-day TTL with VERSION bump invalidation; user override honored
- [x] **FOUND-10**: `<ViewportWriter />` component writes `vp=desktop|mobile` cookie (1-year, `SameSite=Lax`) on every page mount based on `matchMedia('(pointer: coarse) and (hover: none)')` + `innerWidth`
- [x] **FOUND-11**: Server Components resolve viewport via cookie → `userAgent()` from `next/server` → desktop default
- [x] **FOUND-12**: `<ViewportGate />` primitive renders exactly one of sibling `.desktop.tsx` / `.mobile.tsx` files via `next/dynamic`, falls back to desktop sibling if mobile sibling absent; shows `<Skeleton />` during dynamic import
- [x] **FOUND-13**: Middleware redirects cookie-less unauthenticated users from authed paths to login using positive-list matcher; excludes `/sw.js`, `_next/*`, API routes
- [ ] **FOUND-14**: `(authed)/layout.tsx` subscribes only to `user` and `hsr_account` (minimal base); each authed feature page owns its own additional subscriptions
- [ ] **FOUND-15**: `<AuthRequired>` gate handles tri-state (unknown, anon, authed) and integrates with middleware; cross-tab auth sync via `BroadcastChannel('hsr-auth')`

### Foundation — Phase 15.4 cost-table draftMode restructure (REQ-154)

Schema migration foundation that must land before Phase 16/17. Sourced from `.planning/todos/pending/2026-04-14-cost-table-draft-mode-restructure.md` and CONTEXT.md decisions D-01..D-30.

- [ ] **REQ-154-01**: `HsrCharacterCost` / `HsrLightconeCost` / `HsrSynergyCost` table definitions drop `classicCosts` + `auctionBaseBid`; add single `costs` struct (char/lc) and `draftMode: DraftMode` discriminator on all three; PK tuples extended to include `draftMode`; `by_character_mode_and_set` / `by_lightcone_mode_and_set` / `by_tuple` btree indexes extended to multi-col (D-01, D-02, D-03, D-06, D-07, D-08).
- [ ] **REQ-154-02**: `CostSetDraftCharacter` / `CostSetDraftLightcone` / `CostSetDraftSynergy` mirror REQ-154-01 schema shape; composite-PK tuple extended to include `draftMode`; `by_tuple` btree on draft synergy (D-04, D-09).
- [ ] **REQ-154-03**: PkTest probe artifacts removed in same publish: `spacetimedb/src/tables/pkTest.ts`, `spacetimedb/src/reducers/pkTest.ts` deleted; `pk_test` table dropped via `--delete-data=on-conflict` (D-23).
- [ ] **REQ-154-04**: Module bindings regenerated for both `spacetimedb/src/module_bindings/` and `src/module_bindings/`; new `costs` / `draftMode` accessors present on hsr_character_cost_table, hsr_lightcone_cost_table, hsr_synergy_cost_table; old `classicCosts` / `auctionBaseBid` removed; bindings committed.
- [ ] **REQ-154-05**: `admin_bulk_upsert` HsrCharacterCost / HsrLightconeCost / HsrSynergyCost cases rewritten — tuple match uses extended btree filter (4-tuple char/lc, 5-tuple synergy) including `draftMode`; insert payload uses single `costs` (char/lc) + `draftMode: { tag, value }`; `mergeForUpdate` field arrays shrunk to `['costs']` (char/lc) / `['costModifier']` (synergy); no zero-padding branch (D-19).
- [ ] **REQ-154-06**: `edit_draft_character_cost` / `edit_draft_lightcone_cost` reducer signatures replace `classicCostsJson` + `auctionBaseBidJson` with `costsJson` + `draftModeTag`; `edit_draft_synergy_cost` adds `draftModeTag` arg; one call = one row per (name, gameMode, draftMode, costSetId) (D-16, D-17, D-18).
- [ ] **REQ-154-07**: `create_cost_set` clone carries `draftMode` through unchanged on all three draft tables; `publish_cost_set` `existingLive.find` predicate extended to include `r.draftMode.tag === draft.draftMode.tag` for chars/lcs/synergies (Pitfall 7 fix) (D-20, D-21).
- [ ] **REQ-154-08**: Reader filters: `draftClassic.getCharacterBaseCost` matches `draftMode.tag === 'Classic'` and reads `costRow.costs[eidolonKey]`; `draftAuction.getCharacterBaseCost` matches `draftMode.tag === 'Auction'` (removes `auctionBaseBid` access); `postDraft.ts` LC lookup extends btree filter to 4 positional values with `CLASSIC_DRAFT_MODE` and reads `costRow.costs`; absence returns 0 (D-10, D-11).
- [ ] **REQ-154-09**: Frontend fix-to-compile across `DataHelpers.ts`, `useCharacterCostTable.ts`, `useLightconeCostTable.ts`, `SynergyDisplay.tsx`, `CostBreakdownChart.tsx`, `BulkUpsert.tsx`, `TableExplorer.tsx`, `CharacterCostTable.tsx`, `tableColumns.ts`, `enums.ts`, `GameDataProvider.tsx`; `npm run build` exits 0 with no `classicCosts` / `auctionBaseBid` references remaining; `UPSERT_TABLE_COLUMNS` map updated per D-27 (D-26, D-27).
- [ ] **REQ-154-10**: `docs/cost-sets/architecture.md` and `docs/cost-tables/architecture.md` updated during execution to reflect new `draftMode` column, extended PK tuples, btree index changes, and row-absence semantic; updates land in the same plan as the code they describe (D-28).
- [ ] **REQ-154-11**: Seed pipelines (`scripts/seed-data.ts` and `test/shared/seed-data.ts`) emit one row per present sub-block — no zero-padding fallback; `pairing_template.json` extended to sibling-block `{ classic?, auction? }` shape with both modifiers; `test/data-templates/README.md` transform tables rewritten for char / lc / pairing all three; `ZERO_EIDOLON` / `ZERO_SUPERPOSITION` constants removed (D-12, D-14, D-15).
- [x] **REQ-154-12**: 7 affected test files (`seed-cost-extraction.test.ts`, `cost-set-pk.test.ts`, `partial-update.test.ts`, `cost-set-lifecycle.test.ts`, `round-trip.test.ts`, `post-draft.test.ts`, plus `test/shared/seed-data.ts` harness) rewritten/updated against new shape; new coverage added for synergy auction round-trip (first-ever) and `draftMode` filter assertions; full `npm run test:integration` suite green (D-24, D-25).

### Public Features (PUB)

Anonymous-accessible pages. No auth gate.

- [ ] **PUB-01**: User can view all character costs by game mode in cost tables page
- [ ] **PUB-02**: User can view all lightcone costs by game mode in cost tables page
- [ ] **PUB-03**: User can view synergy cost modifiers between characters/lightcones in cost tables page
- [ ] **PUB-04**: User can filter cost tables by game mode, element, and path
- [ ] **PUB-05**: User can search cost tables by character or lightcone name
- [ ] **PUB-06**: User can sort cost tables by cost or name columns
- [ ] **PUB-07**: User can compose a team using characters and lightcones in the team builder
- [ ] **PUB-08**: Team builder validates team composition against cost budget for the selected game mode
- [ ] **PUB-09**: Team builder computes and displays synergy cost modifiers between team members
- [ ] **PUB-10**: Team builder persists draft compositions to localStorage for anonymous users
- [ ] **PUB-11**: Team builder uses click-to-add interaction (not drag-and-drop) for character/LC selection
- [ ] **PUB-12**: Portrait assets prefetch on main thread via `requestIdleCallback` after public page load
- [ ] **PUB-13**: Backend exposes `team_builder_draft` table keyed by user with save/load/list/delete reducers (user-scoped)
- [ ] **PUB-14**: Authenticated users' team builder drafts persist to backend via `team_builder_draft`
- [ ] **PUB-15**: User can list, load, rename, and delete own saved team drafts
- [ ] **PUB-16**: On sign-up or first authed team builder visit, user is prompted to migrate localStorage drafts to backend

### Authed Features (AUTHED)

Requires authentication. Authed base layer + feature-specific subscriptions.

**Admin panel**

- [ ] **AUTHED-01**: Admin can bulk upsert character and lightcone cost rows via admin panel
- [ ] **AUTHED-02**: Admin can edit individual character rows including Spine asset URLs (`skelUrl`, `atlasUrl`, `atlasImgUrls`)
- [ ] **AUTHED-03**: Admin can edit individual lightcone rows
- [ ] **AUTHED-04**: Admin can manage user roles (admin / user) and ban/unban users
- [ ] **AUTHED-05**: Admin panel enforces role-based access — non-admin users cannot access admin routes

**Profile (core)**

- [ ] **AUTHED-06**: User can view own profile showing display name, avatar, bio, current per-mode + composite MMR, and earned achievements
- [ ] **AUTHED-07**: User can edit own display name and bio on own profile
- [ ] **AUTHED-08**: User can upload avatar image on own profile
- [ ] **AUTHED-09**: Profile displays user's active title (if set) and achievement gallery

**Calendar**

- [ ] **AUTHED-10**: User can view own calendar with availability slots, saved calendars, and events
- [ ] **AUTHED-11**: User can create and edit recurring availability slots
- [ ] **AUTHED-12**: User can create calendar events and invite other users
- [ ] **AUTHED-13**: User can view and switch between saved calendars
- [ ] **AUTHED-14**: User can accept or decline calendar event invites
- [ ] **AUTHED-15**: Calendar displays times in user's local timezone via Luxon/Intl

### Match (MATCH)

Lobby → draft → post-draft flow. Core match loop.

**Lobby**

- [ ] **MATCH-01**: User can browse list of open lobbies with filters (game mode, privacy, player count)
- [ ] **MATCH-02**: User can create a new lobby with game mode, privacy, disconnect behavior, and format settings
- [ ] **MATCH-03**: User can join a lobby by lobby ID or join code
- [ ] **MATCH-04**: Lobby creator can configure draft preset, cost set, and match format (including best-of-N series)
- [ ] **MATCH-05**: User can view lobby members with their selected accounts and ready status
- [ ] **MATCH-06**: Lobby members can send and receive ephemeral chat messages within the lobby
- [ ] **MATCH-07**: Spine assets prefetch on main thread when user enters `(authed)/(match)` zone, gated by `getRenderTier() === 'full'`

**Match Drafting**

- [ ] **MATCH-08**: User can pick and ban characters during active draft according to preset rules
- [ ] **MATCH-09**: Draft enforces turn order and prevents invalid picks/bans with clear error messages
- [ ] **MATCH-10**: Draft displays Spine-animated pedestal for last pick/ban on full render tier; portrait-only on image-only tier
- [ ] **MATCH-11**: User can select from own `hsr_account` rows per match before draft start (account rating snapshot captured)
- [ ] **MATCH-12**: User cursor position broadcasts to other lobby members at ~30 Hz throttled by 2-pixel delta

**Match Post-Drafting**

- [ ] **MATCH-13**: User can submit per-game match scores with screenshot URL after draft completes
- [ ] **MATCH-14**: User can upload match screenshot directly to Imgur from score submission form
- [ ] **MATCH-15**: Match finalization triggers MMR changes and archives match to history tables
- [ ] **MATCH-16**: Casual matches auto-finalize when all required scores are submitted
- [ ] **MATCH-17**: Disconnect handling triggers per-lobby configured timer + forfeit behavior with graceful rejoin window

### Competitive (COMP)

Tournament + leaderboard features. Tail of the core milestone.

**Tournament**

- [ ] **COMP-01**: User can view list of open tournaments with format, stage, and registration status
- [ ] **COMP-02**: Authorized user (TO role) can create tournament with format (single/double/group/hybrid), stages, and referee config
- [ ] **COMP-03**: User can register for tournament solo or as part of a team
- [ ] **COMP-04**: Tournament organizer can manage registrations and seed brackets
- [ ] **COMP-05**: User can view tournament bracket visualization for all formats (single/double/group/hybrid) using forked bracket library
- [ ] **COMP-06**: Tournament organizer can advance tournament stages
- [ ] **COMP-07**: Referee can validate or invalidate match results during stages

**Leaderboards**

- [ ] **COMP-08**: User can view per-game-mode MMR leaderboard (Memory of Chaos, Apocalyptic Shadow, Anomaly Arbitration)
- [ ] **COMP-09**: User can view composite global MMR leaderboard
- [ ] **COMP-10**: Leaderboards load only displayed range via server-side filtered/paginated view (NO bulk subscription of full leaderboard); approach requires Phase 37 exploration

### Stats (STATS)

User and character statistics displayed on profile. Second-to-last priority.

- [ ] **STATS-01**: User can view own win/loss/spectated counts on profile
- [ ] **STATS-02**: User can view own per-character performance stats on profile
- [ ] **STATS-03**: User can view global character stats (platform-wide win rate, usage, pick rate)
- [ ] **STATS-04**: Profile displays MMR history over time as line chart per game mode
- [ ] **STATS-05**: Profile displays win rate breakdown per game mode

### Historical & Replay (HIST)

Past match browsing and pick/ban replay. Last priority.

- [ ] **HIST-01**: User can view list of own past matches on profile, paginated
- [ ] **HIST-02**: User can view detail page for a past match showing participants, scores, account snapshots, and MMR changes
- [ ] **HIST-03**: User can open a replay page from a past match
- [ ] **HIST-04**: Replay page plays back pick/ban steps with a timeline scrubber (no 0.5× speed)
- [ ] **HIST-05**: Replay reuses pedestal component in read-only mode using archived `match_session_step_history` data
- [ ] **HIST-06**: Historical data (match/MMR/session history) is accessible only for own identity; server-side views enforce this

### Mobile UX (MOBILE) — deferred XX.1 phases

Mobile-optimized UX counterparts for every desktop feature phase. Per DECISIONS R4, some are single-responsive-DOM (cheap refinement) and others require dual-DOM split (structural change). All are deferred and inserted opportunistically.

**Single-responsive-DOM refinement (cheap):**

- [ ] **MOBILE-01**: Cost tables render with mobile-optimized responsive layout on small viewports
- [ ] **MOBILE-02**: Team builder renders with mobile-optimized responsive layout
- [ ] **MOBILE-03**: Admin panel renders with mobile-optimized responsive layout
- [ ] **MOBILE-04**: Profile (core) renders with mobile-optimized responsive layout
- [ ] **MOBILE-05**: Lobby pages render with mobile-optimized responsive layout
- [ ] **MOBILE-06**: Match post-drafting renders with mobile-optimized responsive layout
- [ ] **MOBILE-07**: Leaderboards render with mobile-optimized responsive layout
- [ ] **MOBILE-08**: User & character stats render with mobile-optimized responsive layout (no multi-line MMR chart on mobile per anti-feature)
- [ ] **MOBILE-09**: Historical + replay render with mobile-optimized responsive layout

**Dual-DOM split required (structural change):**

- [ ] **MOBILE-10**: Calendar renders with day-view default on mobile via `.mobile.tsx` sibling (dual-DOM, already planned split from Phase 27)
- [ ] **MOBILE-11**: Match Drafting renders stacked layout with resized pedestal and cursor-send disabled on mobile via `.mobile.tsx` sibling (dual-DOM, already planned split from Phase 31)
- [ ] **MOBILE-12**: Tournament brackets render with round-by-round vertical swipe UX on mobile via `.mobile.tsx` sibling (dual-DOM, already planned split from Phase 35)

---

## v1.x Requirements (deferred to future)

Not in v0.9 roadmap. Tracked for future milestones.

### Roster import

- **IMPORT-01**: HoYoverse API roster import (if API supports it)
- **IMPORT-02**: Computer-vision screenshot roster import

### Season & progression

- **SEASON-01**: Season lifecycle implementation (schema supports, UI deferred)
- **SEASON-02**: Season-based leaderboard resets
- **SEASON-03**: Seasonal achievements and rewards

### Engagement

- **SOCIAL-01**: Cross-user profile viewing with public data only (may be included in v0.9 if scope allows — Open Question in notes)
- **SOCIAL-02**: Follow/friends social graph display UI
- **SOCIAL-03**: Activity feed of followed users

### Team builder shared builds

- **TEAM-03**: Shared team builds (public URL) — deferred, v0.9 covers personal persistence only

### Engineering

- **ENG-01**: SpacetimeDB SDK offloaded to Web Worker (if profiling justifies)
- **ENG-02**: Offscreen canvas for Spine (if profiling justifies)

---

## Out of Scope

Explicitly excluded from v0.9 milestone. Each with rationale to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Web Worker for prefetch | Main-thread `requestIdleCallback` + fire-and-forget `fetch()` is near-free; no heavy client-side compute workload justifies it (DECISIONS R2) |
| Real-time voice/video chat | Out of platform scope; community uses Discord externally |
| Mobile native app | Web-first strategy; responsive + dual-DOM handles mobile web adequately |
| Payment/monetization | Free competitive platform, no revenue model planned |
| Chat message persistence | Ephemeral by design; rolling cleanup prevents match replay of chat |
| Drag-and-drop team builder | Click-to-add is superior on both desktop and mobile per research; drag-drop adds complexity without UX benefit |
| Horizontal bracket shrink on mobile | Anti-feature — start.gg and Challonge both fail here; vertical round-swipe required instead |
| 0.5× replay playback speed | Anti-feature — only 1×, 2×, 4× speeds ship |
| Drag-to-create calendar events on mobile | Anti-feature — tap-to-create is the mobile pattern |
| Long MMR reveal animations | Anti-feature — quick reveal preferred over celebratory confetti |
| Embedded 3D match replay | Out of scope; pick/ban replay only |
| Server-IP-based time SSR | Anti-pattern — all times resolved client-side via user timezone |
| Safari active support | Safari defensively gated to image-only tier with dismissible warning; bug reports for Safari rejected |
| Middleware as auth trust boundary | Middleware is UX optimization only; real auth is SpacetimeDB RLS at reducer level |
| `experimental.ppr` (partial prerendering) | Not needed; subscription-driven data plane makes SSR/streaming benefits marginal |
| Vercel Workflow / durable workflows | No workflow primitives needed — SpacetimeDB reducers are transactional |
| shadcn/ui migration | Existing HeroUI is fit-for-purpose; rewrite would be scope explosion |
| next-pwa / @serwist/next | Hand-written 40-LOC SW fits our asset-CDN-only caching need (DECISIONS R7 do-not-add list) |

---

## Traceability

Each requirement maps to exactly one phase. Coverage validated by roadmapper.

| REQ-ID | Phase | Status |
|--------|-------|--------|
| FOUND-01 | 15 | Complete |
| FOUND-02 | 15 | Complete |
| FOUND-03 | 16 | Complete |
| FOUND-04 | 16 | Complete |
| FOUND-05 | 16 | Complete |
| FOUND-06 | 16 | Complete |
| FOUND-07 | 16 | Complete |
| FOUND-08 | 16 | Complete |
| FOUND-09 | 16 | Complete |
| FOUND-10 | 16 | Complete |
| FOUND-11 | 16 | Complete |
| FOUND-12 | 16 | Complete |
| FOUND-13 | 16 | Complete |
| FOUND-14 | 21 | Pending |
| FOUND-15 | 21 | Pending |
| REQ-154-01 | 15.4 | Pending |
| REQ-154-02 | 15.4 | Pending |
| REQ-154-03 | 15.4 | Pending |
| REQ-154-04 | 15.4 | Pending |
| REQ-154-05 | 15.4 | Pending |
| REQ-154-06 | 15.4 | Pending |
| REQ-154-07 | 15.4 | Pending |
| REQ-154-08 | 15.4 | Pending |
| REQ-154-09 | 15.4 | Pending |
| REQ-154-10 | 15.4 | Pending |
| REQ-154-11 | 15.4 | Pending |
| REQ-154-12 | 15.4 | Complete |
| PUB-01 | 17 | Pending |
| PUB-02 | 17 | Pending |
| PUB-03 | 17 | Pending |
| PUB-04 | 18 | Pending |
| PUB-05 | 18 | Pending |
| PUB-06 | 18 | Pending |
| PUB-07 | 19 | Pending |
| PUB-08 | 19 | Pending |
| PUB-09 | 19 | Pending |
| PUB-10 | 19 | Pending |
| PUB-11 | 20 | Pending |
| PUB-12 | 17 | Pending |
| PUB-13 | 19 | Pending |
| PUB-14 | 19 | Pending |
| PUB-15 | 20 | Pending |
| PUB-16 | 20 | Pending |
| AUTHED-01 | 22 | Pending |
| AUTHED-02 | 22 | Pending |
| AUTHED-03 | 22 | Pending |
| AUTHED-04 | 22 | Pending |
| AUTHED-05 | 23 | Pending |
| AUTHED-06 | 24 | Pending |
| AUTHED-07 | 25 | Pending |
| AUTHED-08 | 25 | Pending |
| AUTHED-09 | 25 | Pending |
| AUTHED-10 | 26 | Pending |
| AUTHED-11 | 26 | Pending |
| AUTHED-12 | 26 | Pending |
| AUTHED-13 | 26 | Pending |
| AUTHED-14 | 27 | Pending |
| AUTHED-15 | 27 | Pending |
| MATCH-01 | 28 | Pending |
| MATCH-02 | 28 | Pending |
| MATCH-03 | 28 | Pending |
| MATCH-04 | 28 | Pending |
| MATCH-05 | 29 | Pending |
| MATCH-06 | 29 | Pending |
| MATCH-07 | 28 | Pending |
| MATCH-08 | 30 | Pending |
| MATCH-09 | 30 | Pending |
| MATCH-10 | 31 | Pending |
| MATCH-11 | 30 | Pending |
| MATCH-12 | 31 | Pending |
| MATCH-13 | 32 | Pending |
| MATCH-14 | 32 | Pending |
| MATCH-15 | 32 | Pending |
| MATCH-16 | 32 | Pending |
| MATCH-17 | 33 | Pending |
| COMP-01 | 34 | Pending |
| COMP-02 | 34 | Pending |
| COMP-03 | 34 | Pending |
| COMP-04 | 34 | Pending |
| COMP-05 | 35 | Pending |
| COMP-06 | 35 | Pending |
| COMP-07 | 35 | Pending |
| COMP-08 | 36 | Pending |
| COMP-09 | 36 | Pending |
| COMP-10 | 37 | Pending |
| STATS-01 | 38 | Pending |
| STATS-02 | 38 | Pending |
| STATS-03 | 38 | Pending |
| STATS-04 | 39 | Pending |
| STATS-05 | 39 | Pending |
| HIST-01 | 40 | Pending |
| HIST-02 | 41 | Pending |
| HIST-03 | 41 | Pending |
| HIST-04 | 41 | Pending |
| HIST-05 | 41 | Pending |
| HIST-06 | 40 | Pending |
| MOBILE-01 | 18.1 | Deferred |
| MOBILE-02 | 20.1 | Deferred |
| MOBILE-03 | 23.1 | Deferred |
| MOBILE-04 | 25.1 | Deferred |
| MOBILE-05 | 29.1 | Deferred |
| MOBILE-06 | 33.1 | Deferred |
| MOBILE-07 | 37.1 | Deferred |
| MOBILE-08 | 39.1 | Deferred |
| MOBILE-09 | 41.1 | Deferred |
| MOBILE-10 | 27.1 | Deferred |
| MOBILE-11 | 31.1 | Deferred |
| MOBILE-12 | 35.1 | Deferred |

**Coverage:**
- Core v0.9 requirements: 96 total (FOUND 15 + REQ-154 12 + PUB 16 + AUTHED 15 + MATCH 17 + COMP 10 + STATS 5 + HIST 6)
- Mapped to core phases (15–41 plus 15.4): 96
- Unmapped: 0 ✓
- Mobile XX.1 requirements: 12 (deferred, opportunistic)
- Total: 108

---

*Requirements defined: 2026-04-12*
*Last updated: 2026-04-14 — REQ-154-XX family added during /gsd-plan-phase 15.4 to seed phase 15.4 traceability from todo source spec*
