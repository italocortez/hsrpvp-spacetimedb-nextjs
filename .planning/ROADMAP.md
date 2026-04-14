# Roadmap: HSRPVP Competitive Platform

## Milestones

- Shipped: **v0.5 Backend Foundation** — Phases 1-14 (shipped 2026-04-12)
- Active: **v0.9 Frontend** — Phases 15-41 (planned 2026-04-12)

---

## Phases

<details>
<summary>Shipped: v0.5 Backend Foundation (Phases 1-14) — 2026-04-12</summary>

- [x] Phase 1: Schema Foundation (2/2 plans) — completed 2026-03-16
- [x] Phase 2: Roster Management (2/2 plans) — completed 2026-03-16
- [x] Phase 3: Tournament System (5/5 plans) — completed 2026-03-17
- [x] Phase 4: Bracket Generation (3/3 plans) — completed 2026-03-18
- [x] Phase 04.1: Schema Normalization (3/3 plans) — completed 2026-03-20
- [x] Phase 5: Match Results and MMR (2/2 plans) — completed 2026-03-21
- [x] Phase 6: Anonymous Play & Stats (3/3 plans) — completed 2026-03-22
- [x] Phase 06.1: Landing Page Migration (2/2 plans) — completed 2026-03-22
- [x] Phase 7: Achievements and Titles (2/2 plans) — completed 2026-03-28
- [x] Phase 8: Calendar and Scheduling (2/2 plans) — completed 2026-03-28
- [x] Phase 9: Mouse Tracking, Chat, Lobby (9/9 plans) — completed 2026-03-29
- [x] Phase 10: Disconnect & Cost Parity (2/2 plans) — completed 2026-04-03
- [x] Phase 10.1: Match Schema Rework (6/6 plans) — completed 2026-04-04
- [x] Phase 10.3: TO Views (1/1 plans) — completed 2026-04-04
- [x] Phase 10.4: Account Selection (3/3 plans) — completed 2026-04-04
- [x] Phase 10.5: Test Stabilization (5/5 plans) — completed 2026-04-05
- [x] Phase 11: Account Rating Matrix (2/2 plans) — completed 2026-04-06
- [x] Phase 12: Auth Security Hardening (3/3 plans) — completed 2026-04-08
- [x] Phase 12.1: Identity GC (2/2 plans) — completed 2026-04-08
- [x] Phase 12.2: SDK Upgrade Audit (2/2 plans) — completed 2026-04-09
- [x] Phase 12.3: MMR Rating Snapshot (8/8 plans) — completed 2026-04-11
- [x] Phase 13: Documentation Normalization (4/4 plans) — completed 2026-04-12
- [x] Phase 14: Test Harness Modernization (2/2 plans) — completed 2026-04-12

Full details: `milestones/v0.5-ROADMAP.md`

</details>

### v0.9 Frontend — Phase Summary

- [x] **Phase 15: Backend pre-work** — Spine asset columns on `hsr_character` + self-scoped historical views (completed 2026-04-13)
- [ ] **Phase 16: Route + global foundation** — Route-group migration, ViewportGate, render-tier, SW scaffold, middleware, Next 15.2.3 bump, typedRoutes
- [ ] **Phase 17: Cost tables — data** — Global public subs, cost-table data wiring, main-thread portrait prefetch
- [ ] **Phase 18: Cost tables — UX** — Filter, search, sort interactions on cost tables
- [ ] **Phase 19: Team builder — data** — Team composition state, cost budget, synergy compute, `team_builder_draft` backend + reducers
- [ ] **Phase 20: Team builder — UX** — Click-to-add interaction, saved-draft management, localStorage migration prompt
- [ ] **Phase 21: Authed base layer** — `(authed)/layout.tsx` minimal subs (`user`, `hsr_account`), tri-state `<AuthRequired>`, cross-tab BroadcastChannel
- [ ] **Phase 22: Admin panel — data** — Bulk upsert reducers wired, character/LC/role/ban data wiring
- [ ] **Phase 23: Admin panel — UX** — Admin-only routes with role gate, bulk editing UX
- [ ] **Phase 24: Profile (core) — data** — `view_my_profile` data surface, MMR + achievement subs on profile page
- [ ] **Phase 25: Profile (core) — UX** — Display name/bio edit, avatar upload, title + achievement gallery
- [ ] **Phase 26: Calendar — data** — Availability slots, saved calendars, events, invites data wiring
- [ ] **Phase 27: Calendar — UX (dual-DOM)** — Desktop week/month + mobile day-view sibling, Luxon timezone rendering
- [ ] **Phase 28: Lobby — data** — Lobby browser + detail data, creation, join, match-zone Spine prefetch trigger
- [ ] **Phase 29: Lobby — UX** — Member list, ready state, ephemeral chat UX
- [ ] **Phase 30: Match Drafting — data** — Pick/ban reducer wiring, turn-order enforcement, per-match account selection
- [ ] **Phase 31: Match Drafting — UX (dual-DOM, pedestal)** — Spine pedestal single-canvas, cursor broadcast, stacked mobile sibling
- [ ] **Phase 32: Match Post-Drafting — data** — Score submission, Imgur upload integration, finalization, auto-finalize casual
- [ ] **Phase 33: Match Post-Drafting — UX** — Score form, screenshot upload UI, disconnect timer + rejoin
- [ ] **Phase 34: Tournament — data** — Forked bracket library (stripped styled-components), tournament CRUD + registration + seeding
- [ ] **Phase 35: Tournament — UX (dual-DOM)** — Bracket viz for 4 formats, TO controls, referee validation, vertical round-swipe mobile sibling
- [ ] **Phase 36: Leaderboards — data** — Per-mode + composite MMR leaderboard data surface (paginated)
- [ ] **Phase 37: Leaderboards — UX + polish** — Paginated leaderboard UX (no bulk sub), approach research spike
- [ ] **Phase 38: User & character stats — data** — Win/loss/spectated, per-character, global character stats wiring
- [ ] **Phase 39: User & character stats — UX** — MMR history line chart, win rate breakdown
- [ ] **Phase 40: Historical + replay — data** — `view_my_match_session_history`, `view_my_match_participant_history`, scoped list pagination
- [ ] **Phase 41: Historical + replay — UX** — Match detail page, replay scrubber reusing pedestal read-only, 1x/2x/4x playback

---

## Cross-Phase Commitments (from DECISIONS.md)

These apply to every phase; they are not phases themselves. Call them out in plan reviews and PR descriptions.

- **R2 — No Web Worker in v0.9.** Portrait and Spine prefetch run on main thread via `requestIdleCallback` + fire-and-forget `fetch()`. Service Worker stays for asset caching. Reopen only if measurable main-thread jank surfaces in Phase 28 or 31.
- **R4 — Single-responsive-DOM default.** Dual-DOM (`.desktop.tsx` / `.mobile.tsx` + `<ViewportGate>` + `next/dynamic`) used ONLY for phases 27 (Calendar), 31 (Match Drafting), 35 (Tournament brackets). Every other UX phase ships single-DOM.
- **R7 — Fork `@g-loot/react-tournament-brackets` day one in Phase 34.** Strip `styled-components`, drop `SVGViewer`, keep single/double-elim positioning math, add group/hybrid layout. Internal at `lib/brackets/` (~600-800 LOC). Plan B is custom d3 (~500 LOC) if fork proves untenable.
- **R8 — Component hygiene rules enforced starting Phase 16.** (1) Thin page files. (2) Viewport-agnostic children (no `useIsMobile` inside components). (3) Tailwind responsive utilities for sizing/spacing only, never structural reorganization. (4) State lives in hooks, not pages. (5) Layout-agnostic component props. Violation blocks merge in PR review.
- **R9 — Phase 16 resolves 5 pre-decisions (locked):** (a) `experimental.typedRoutes: true` enabled before route-group renames; (b) Next.js bumped to ≥15.2.3 before middleware ships (CVE-2025-29927); (c) Pattern E dual-DOM sibling files with `next/dynamic`; (d) positive-list middleware matcher (excludes `/sw.js`, `_next/*`, API routes); (e) desktop SSR default for cookie-less first-ever visits.
- **Energy budget ceiling.** 102,500 energy/month on maincloud. Every subscription placement PR justifies its layer. `tools/energy-model.js` is the authoritative pre-merge check.
- **Browser support.** Chrome/Edge/Firefox actively supported. Safari defensively gated to `image-only` render tier with dismissible warning banner.
- **Single data plane.** SpacetimeDB subscriptions only. No SSR data plane, no REST bridge, no `revalidateTag`.

---

## Phase Dependencies

- Phase 16 blocks 17+ (route groups, ViewportGate, render-tier, middleware, SW scaffold all precede feature work).
- Phase 21 blocks 22+ (authed base layer is the parent of every authed page).
- Phase 28 blocks 30+ (lobby data must flow before draft can read from it).
- Phase 31 blocks 40+ (replay reuses pedestal component in read-only mode — must exist first).
- Phase 34 fork blocks Phase 35 (bracket library must be stripped and usable before UX builds on it).
- All other phases run strictly in numeric order.

---

## Mobile (MOBILE-01 — MOBILE-12): deferred XX.1 phases

Per R4, mobile UX refinements are deferred to opportunistic XX.1 insertions. They are **planned but not scheduled**. The v0.9 milestone can ship desktop-complete with partial mobile coverage. Insertion happens via `/gsd-insert-phase` when the team decides.

**Responsive-refinement (single-DOM — cheap):** Desktop UX already works at mobile widths; polish adds mobile-optimized sizing, spacing, ordering without restructuring.

- [ ] **Phase 18.1:** Cost tables mobile refinement (MOBILE-01)
- [ ] **Phase 20.1:** Team builder mobile refinement (MOBILE-02)
- [ ] **Phase 23.1:** Admin panel mobile refinement (MOBILE-03)
- [ ] **Phase 25.1:** Profile (core) mobile refinement (MOBILE-04)
- [ ] **Phase 29.1:** Lobby mobile refinement (MOBILE-05)
- [ ] **Phase 33.1:** Match post-drafting mobile refinement (MOBILE-06)
- [ ] **Phase 37.1:** Leaderboards mobile refinement (MOBILE-07)
- [ ] **Phase 39.1:** User & character stats mobile refinement — no multi-line MMR chart (MOBILE-08)
- [ ] **Phase 41.1:** Historical + replay mobile refinement (MOBILE-09)

**Dual-DOM splits (structural change — already scoped):** These three pages ship dual-DOM from day one in their desktop UX phase. The XX.1 phase builds the `.mobile.tsx` sibling that the desktop phase wired the `<ViewportGate>` for.

- [ ] **Phase 27.1:** Calendar mobile day-view sibling (MOBILE-10, dual-DOM — split already planned in Phase 27)
- [ ] **Phase 31.1:** Match Drafting mobile stacked + resized pedestal + cursor-send disabled (MOBILE-11, dual-DOM — split already planned in Phase 31)
- [ ] **Phase 35.1:** Tournament brackets mobile round-by-round vertical swipe (MOBILE-12, dual-DOM — split already planned in Phase 35)

---

## Phase Details

### Phase 15: Backend pre-work
**Goal**: SpacetimeDB exposes the Spine asset columns and self-scoped historical views that every subsequent frontend phase depends on.
**Depends on**: Nothing (entry phase for v0.9).
**Requirements**: FOUND-01, FOUND-02
**Success Criteria** (what must be TRUE):
  1. Admin can set and update `skelUrl`, `atlasUrl`, `atlasImgUrls` on any `hsr_character` row via reducer; clients reading the published `hsr_character` table see the new columns in their generated SDK bindings.
  2. A signed-in user subscribed to `view_my_match_session_history` receives rows only where they are a participant; rows belonging to other users never appear for them.
  3. `view_my_mmr_history`, `view_my_match_session_step_history`, `view_my_match_participant_history`, and `view_my_match_result_game_history` are each filtered server-side by `ctx.sender` with no client-side filter required.
  4. All five historical views (`view_my_match_session_history`, `view_my_match_session_step_history`, `view_my_match_participant_history`, `view_my_mmr_history`, `view_my_match_result_game_history`) are reachable from regenerated TypeScript bindings and covered by integration tests asserting cross-user isolation.
**Plans**: 6 plans
- [x] 15-01-PLAN.md — View file reorganization (8 domain files; binding surface invariant)
- [x] 15-02-PLAN.md — Spine + positioning columns on hsr_character (schema additions)
- [x] 15-03-PLAN.md — Admin router rework (partial-update + costSetId tuple fix across 5 cases)
- [x] 15-04-PLAN.md — 5 self-scoped history views + ROADMAP/REQUIREMENTS 4→5 rename
- [x] 15-05-PLAN.md — Seed/template/data rework (D-22 shape; both seed entry points)
- [x] 15-06-PLAN.md — Integration tests (isolation, partial-update, cost-set PK, round-trip) + architecture docs

### Phase 15.3: Audit Spread Type Helper (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 15
**Plans:** 6/6 plans complete

Plans:
- [ ] TBD (run /gsd-plan-phase 15.3 to break down)

### Phase 15.2: User Directory View Performance (INSERTED)

**Goal:** [Urgent work - to be planned]
**Requirements**: TBD
**Depends on:** Phase 15
**Plans:** 0 plans

Plans:
- [ ] TBD (run /gsd-plan-phase 15.2 to break down)

### Phase 15.1: Auction Cost Template Extension (INSERTED)

**Goal:** Close Phase 15 IN-10 — extend the committed character + lightcone templates (and both seed pipelines that consume them) to the parallel sibling-block cost shape so auction data is ingested from template JSON instead of silently duplicated from classic values. Schema, reducer signatures, bindings, synergy tables, and pairing data all remain unchanged; scope is surgically template + seed only.
**Requirements**: D-01..D-19 (CONTEXT.md is authoritative — no ROADMAP requirement IDs; decisions are the requirement surface)
**Depends on:** Phase 15
**Plans:** 3/4 plans executed

Plans:
- [x] 15.1-01-PLAN.md — Extend character + lightcone templates to sibling-block shape (D-01, D-02)
- [x] 15.1-02-PLAN.md — Rewrite README transform tables for char/lc; delete L84 placeholder note (D-17)
- [x] 15.1-03-PLAN.md — Rewrite both seed pipelines for sibling-block extraction; local-only data re-migration (D-06..D-16)
- [ ] 15.1-04-PLAN.md — D-18 partial-ingestion regression tests + D-19 guardrail (D-18, D-19)

### Phase 16: Route + global foundation
**Goal**: Every downstream phase builds on a route-group structure, primitives (`<ViewportGate>`, `<ViewportWriter>`, render-tier), middleware, and asset-caching Service Worker that are settled and non-negotiable.
**Depends on**: Phase 15.
**Requirements**: FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, FOUND-09, FOUND-10, FOUND-11, FOUND-12, FOUND-13
**Success Criteria** (what must be TRUE):
  1. `next.config.js` enables `experimental.typedRoutes: true` on Next.js ≥15.2.3; a stale `<Link>` path referencing the old `(landing-page)` or `(authenticated)` group fails at `npm run build`.
  2. Route groups are renamed: `(landing-page)` → `(public)`, `(authenticated)` → `(authed)`, `(game)/draft` collapsed under `(authed)/(match)/draft`; all `<Link>` and `router.push` callers compile against the new paths.
  3. `providers.tsx` subscribes to the 6 public reference tables + `view_my_profile` on load for both anonymous and authenticated sessions; `useAuth.ts` no longer owns the `user` subscription.
  4. Visiting any `(authed)/*` path without the session cookie redirects to login via a positive-list middleware matcher that excludes `/sw.js`, `_next/*`, and API routes.
  5. On Chrome/Edge/Firefox desktop, `<ViewportGate>` mounts the `.desktop.tsx` sibling; on a device matching `(pointer: coarse) and (hover: none)`, it mounts the `.mobile.tsx` sibling; when only the desktop sibling exists, the desktop sibling renders on both and no runtime error occurs.
  6. `<ViewportWriter />` on every page writes a 1-year `SameSite=Lax` `vp` cookie; a cookie-less first-ever visit SSRs as desktop (or `userAgent()` guess when available) and swaps to mobile client-side if incorrect without a hydration mismatch error.
  7. `getRenderTier()` returns `image-only` on Safari, respects a localStorage override, and caches capability detection for 7 days with a VERSION bump invalidation path; Safari users see a dismissible warning banner above the NavBar.
  8. The `/public/sw.js` Service Worker registers in production (and opt-in dev with `NEXT_PUBLIC_ENABLE_SW=true`) and intercepts only asset-CDN hostnames — never the app origin.
**Plans**: TBD
**UI hint**: yes

### Phase 17: Cost tables — data
**Goal**: Cost tables page renders character/lightcone/synergy cost rows sourced from the global public subscriptions; portrait assets warm in cache before the user interacts.
**Depends on**: Phase 16.
**Requirements**: PUB-01, PUB-02, PUB-03, PUB-12
**Success Criteria** (what must be TRUE):
  1. Anonymous visitor loading `/cost-tables` sees every character cost row grouped by the three game modes (Memory of Chaos, Apocalyptic Shadow, Anomaly Arbitration) within one frame after the public subs hydrate.
  2. Lightcone cost rows render for all three game modes on the same page without additional subscriptions beyond the 6 global public tables.
  3. Synergy cost modifiers display source/target pairs with their game-mode-specific cost adjustment and are visible without any authed gate.
  4. After the cost tables page mounts, `requestIdleCallback` fires `fetch()` calls for every `hsr_character.imageUrl` and `hsr_lightcone.imageUrl` on the main thread; on a cached reload, DevTools Network shows zero new requests for those assets (served from Cache API by the SW).
**Plans**: TBD
**UI hint**: yes

### Phase 18: Cost tables — UX
**Goal**: Cost tables become a usable reference tool with filter/search/sort interactions a player can scan quickly.
**Depends on**: Phase 17.
**Requirements**: PUB-04, PUB-05, PUB-06
**Success Criteria** (what must be TRUE):
  1. User can toggle between the three game modes and the table body updates to that mode's cost rows without a route change.
  2. User can filter visible rows by element and path (multi-select), and the row count shown matches the filter predicate applied to the local subscription cache.
  3. Typing in the search box narrows rows in real time by character or lightcone name (case-insensitive substring match), with no flicker or re-subscription.
  4. Clicking a sortable column header toggles ascending → descending → default across cost and name columns; indicator shows current sort state.
**Plans**: TBD
**UI hint**: yes

### Phase 19: Team builder — data
**Goal**: Team composition state, cost-budget validation, synergy computation, and backend persistence for authenticated drafts all flow through a single coherent data layer.
**Depends on**: Phase 17 (public reference subs).
**Requirements**: PUB-07, PUB-08, PUB-09, PUB-13, PUB-14
**Success Criteria** (what must be TRUE):
  1. User can add up to 4 characters and 4 lightcones to a team; state is consumable from a single `useTeamBuilderState()` hook without page-level data fetching.
  2. Given a game mode and cost set, the builder displays a live cost meter (spent / budget) that updates within one frame of any add/remove action and flags over-budget state distinctly.
  3. When team members have synergy entries in `hsr_synergy_cost`, the builder shows the resulting cost modifier next to the affected slot with source → target direction.
  4. Backend exposes a new `team_builder_draft` table keyed by user with `save_team_draft`, `update_team_draft`, `delete_team_draft`, and `list_my_team_drafts` (or `view_my_team_drafts`) reducers/views; only the owning user's rows are ever readable.
  5. Authenticated user's team builder save action writes a row to `team_builder_draft` (not localStorage) and their next load round-trips the same composition back.
**Plans**: TBD
**UI hint**: yes

### Phase 20: Team builder — UX
**Goal**: Team builder ships a click-to-add interaction with a friction-free saved-draft workflow and a migration path from anonymous localStorage to backend persistence.
**Depends on**: Phase 19.
**Requirements**: PUB-10, PUB-11, PUB-15, PUB-16
**Success Criteria** (what must be TRUE):
  1. Anonymous user building a team has their draft auto-saved to localStorage; a hard reload restores the same characters, lightcones, game mode, and cost set.
  2. Adding a character or lightcone uses a single click on the chip or card — there is no drag handle, and keyboard Tab + Enter produces the same result.
  3. Authenticated user can list saved drafts on a panel or sidebar, load any draft into the active composition, rename it inline, and delete it with confirmation.
  4. On first authenticated visit to team builder with localStorage drafts present, a one-time modal offers to migrate them to backend; dismiss preserves localStorage, accept copies every local draft as a new `team_builder_draft` row and clears localStorage.
**Plans**: TBD
**UI hint**: yes

### Phase 21: Authed base layer
**Goal**: Every authed route inherits a minimal, bandwidth-frugal subscription base and a tri-state auth gate that behaves correctly across tabs and reloads.
**Depends on**: Phase 16.
**Requirements**: FOUND-14, FOUND-15
**Success Criteria** (what must be TRUE):
  1. `(authed)/layout.tsx` subscribes only to `user` and `hsr_account`; visiting `/profile` incurs no subscription to calendar, stats, or achievement tables until the profile page itself requests them.
  2. `<AuthRequired>` renders a skeleton for the `unknown` state, a login prompt for `anon`, and children for `authed`; the transition between states never causes a flash of the authed children to an unauthenticated user.
  3. Signing out in one tab causes a second tab on an authed route to receive a `BroadcastChannel('hsr-auth')` message and redirect to the public tier within one second.
  4. A hard reload on an authed page while signed in shows no flash of the login prompt before authed content renders.
**Plans**: TBD
**UI hint**: yes

### Phase 22: Admin panel — data
**Goal**: Admin panel's write paths (bulk cost upsert, character/lightcone edit, role/ban management) are wired end-to-end against the backend with no non-admin leakage.
**Depends on**: Phase 21.
**Requirements**: AUTHED-01, AUTHED-02, AUTHED-03, AUTHED-04
**Success Criteria** (what must be TRUE):
  1. Admin can submit a CSV or JSON payload of character cost rows and a single bulk-upsert reducer call applies them; a non-admin caller of the same reducer is rejected by backend RLS.
  2. Admin can edit a single `hsr_character` row including `skelUrl`, `atlasUrl`, and `atlasImgUrls`; the change is observable to all subscribers within one SpacetimeDB tick.
  3. Admin can edit an `hsr_lightcone` row's balance fields (cost, element, path attributes as applicable); the edit round-trips to the cost tables page without a page reload.
  4. Admin can promote or demote a user's role (admin/user) and ban/unban a user; the banned user's next reducer call after ban is rejected by backend enforcement.
**Plans**: TBD
**UI hint**: yes

### Phase 23: Admin panel — UX
**Goal**: Admin-only routes present the data from Phase 22 with a role gate that hides the navigation entry and blocks direct URL access for non-admins.
**Depends on**: Phase 22.
**Requirements**: AUTHED-05
**Success Criteria** (what must be TRUE):
  1. A non-admin user signed in and typing `/admin` directly into the address bar is redirected (not shown admin content) and sees no admin entry in navigation.
  2. An admin user sees the admin nav entry and lands on a panel that surfaces cost bulk upsert, character edit, lightcone edit, and user role/ban management as distinct sections.
  3. Submitting a bulk upsert shows a before/after diff summary (rows added / updated / unchanged) before the reducer call is sent.
  4. Changing a user's role or ban state shows a confirmation prompt referencing the target user's display name and username.
**Plans**: TBD
**UI hint**: yes

### Phase 24: Profile (core) — data
**Goal**: Profile page reads the authenticated user's display name, avatar, bio, per-mode + composite MMR, and achievements from their scoped subscriptions, without leaking other users' data.
**Depends on**: Phase 21.
**Requirements**: AUTHED-06
**Success Criteria** (what must be TRUE):
  1. Visiting `/profile` mounts subscriptions to `view_my_profile`, MMR rating scoped to the viewing user, and the user's achievement rows — all filtered server-side.
  2. Profile page shows the user's current Memory of Chaos, Apocalyptic Shadow, and Anomaly Arbitration MMR values plus the composite global value, each with the rank tier label.
  3. Profile page lists every achievement earned by the viewing user with earn timestamp, sourced from the achievement subscription (no reducer call, no REST).
  4. Signing out and back in as a different user on the same browser shows that user's profile — never cached data from the previous identity.
**Plans**: TBD
**UI hint**: yes

### Phase 25: Profile (core) — UX
**Goal**: User can edit their own profile display name, bio, avatar, and see title + achievement gallery with polished visuals.
**Depends on**: Phase 24.
**Requirements**: AUTHED-07, AUTHED-08, AUTHED-09
**Success Criteria** (what must be TRUE):
  1. User can click to edit display name and bio inline; saving calls the profile-update reducer and the value persists through a reload.
  2. User can upload a new avatar image (through Imgur or UploadThing per project convention); the new avatar renders everywhere the user appears (NavBar, lobby list, profile) within one subscription tick.
  3. User's currently active title (if set) renders with distinct typography beside the display name; if no title is active, no placeholder label shows.
  4. Achievement gallery shows earned achievements in a grid with icon, name, and earn date; hover or tap reveals the achievement criteria description.
**Plans**: TBD
**UI hint**: yes

### Phase 26: Calendar — data
**Goal**: Calendar page has full data access to the viewing user's availability slots, saved calendars, events, and invites — all scoped, all reactive.
**Depends on**: Phase 21.
**Requirements**: AUTHED-10, AUTHED-11, AUTHED-12, AUTHED-13
**Success Criteria** (what must be TRUE):
  1. Calendar page subscribes to the user's availability slots, saved calendars, and event invite rows; subscription placement is named in the PR and justified at page-level (not layout).
  2. User can create a recurring availability slot (day-of-week + start/end time + timezone); the row persists across reload and appears in the live list.
  3. User can create a calendar event (title, time range, attendees) and send invites to other users by username or user ID; invites land in the target user's invite subscription.
  4. User can create multiple saved calendars and select any one as the active view; the selection round-trips through the backend reducer and survives reload.
**Plans**: TBD
**UI hint**: yes

### Phase 27: Calendar — UX (dual-DOM)
**Goal**: Calendar UX ships a desktop week/month grid and a mobile day-view sibling, both rendering user-local timezone via Luxon.
**Depends on**: Phase 26.
**Requirements**: AUTHED-14, AUTHED-15
**Success Criteria** (what must be TRUE):
  1. Desktop visitor sees a week-view calendar with day columns and hour rows; events and availability slots render at their correct user-local position per Luxon `setZone()`.
  2. Mobile visitor (`(pointer: coarse) and (hover: none)`) sees a day-view sibling via `<ViewportGate>` + `next/dynamic`; swipe or arrow controls advance day forward/back. Desktop sibling is never loaded on mobile and vice versa.
  3. User receiving an event invite sees it flagged with pending status; clicking Accept or Decline calls the corresponding reducer and the invite row updates for both users.
  4. All times displayed on the page reflect the user's local IANA timezone (from user setting or browser); changing the user's timezone setting shifts every rendered time correctly, with no stale server-IP-derived values.
**Plans**: TBD
**UI hint**: yes

### Phase 28: Lobby — data
**Goal**: Lobby browser + creation + join + lobby detail all flow through scoped subscriptions; entering the match zone triggers main-thread Spine prefetch for full-tier devices.
**Depends on**: Phase 21.
**Requirements**: MATCH-01, MATCH-02, MATCH-03, MATCH-04, MATCH-07
**Success Criteria** (what must be TRUE):
  1. User loading `/lobby` sees a list of open lobbies from a filtered view (not a raw `lobby` table subscription); filters for game mode, privacy, and player count alter the query shape, not a client-side filter.
  2. User can create a lobby with game mode, privacy, disconnect behavior, draft preset, cost set, and best-of-N match format; the reducer call creates rows in `lobby` and derived tables and the creator is redirected to the lobby detail page.
  3. User can join a lobby via lobby ID or a join code input; the backend rejects closed or invalid codes with a clear error message.
  4. On first mount of any `(authed)/(match)/*` route, `ensureSpinePrefetchStarted()` fires once per session, skipped when `getRenderTier() === 'image-only'` or `navigator.storage.estimate()` shows insufficient quota.
**Plans**: TBD
**UI hint**: yes

### Phase 29: Lobby — UX
**Goal**: Lobby detail page shows members, their selected accounts, ready state, and ephemeral chat with no storm-of-updates regressions at 10+ members.
**Depends on**: Phase 28.
**Requirements**: MATCH-05, MATCH-06
**Success Criteria** (what must be TRUE):
  1. Lobby members list shows each member's display name, the `hsr_account` they have selected for this match (if any), and ready toggle state; changes from other clients render within one SpacetimeDB tick.
  2. Lobby creator sees join code, current format, and preset; non-creator members see the same read-only.
  3. Chat panel renders ephemeral messages ordered by `(createdAt, messageId)` and auto-scrolls to the newest message when the user is already near the bottom; never auto-scrolls past a user's manual scroll-up.
  4. With 10+ members in a lobby posting messages, UI remains responsive (no frame drops visible in DevTools Performance).
**Plans**: TBD
**UI hint**: yes

### Phase 30: Match Drafting — data
**Goal**: Pick/ban flow, turn-order enforcement, and per-match account selection work correctly against the backend with MMR snapshot captured at draft start.
**Depends on**: Phase 28.
**Requirements**: MATCH-08, MATCH-09, MATCH-11
**Success Criteria** (what must be TRUE):
  1. User on their turn can pick or ban a character; backend rejects out-of-turn actions with an identifiable error surfaced to the client as a toast.
  2. Invalid pick/ban (already used, banned, or not allowed by preset) is rejected with a specific error message referencing the reason ("character already banned", "not your turn", etc.).
  3. Before draft starts, each user can choose one of their `hsr_account` rows for this match; submitting triggers `LobbyMemberAccount` write and `accountRatingSnapshot` capture on `MatchResultParticipant`.
  4. Draft state subscriptions are scoped to the draft match id; other lobbies' drafts are not transmitted to this client.
**Plans**: TBD
**UI hint**: yes

### Phase 31: Match Drafting — UX (dual-DOM, pedestal)
**Goal**: Desktop draft surfaces a Spine-animated pedestal for the last pick/ban with cursor broadcast; mobile sibling ships stacked layout with resized pedestal and cursor-send disabled. Exactly one WebGL context lives at any moment.
**Depends on**: Phase 30.
**Requirements**: MATCH-10, MATCH-12
**Success Criteria** (what must be TRUE):
  1. On `getRenderTier() === 'full'`, the last pick/ban target renders on a Spine-animated pedestal with portrait `<img>` layered underneath and exactly one live WebGL canvas; transitioning through 20 consecutive picks never accumulates a second context (verified via `WEBGL_debug_renderer_info` or context-count test).
  2. On `getRenderTier() === 'image-only'`, the pedestal renders portrait-only with no Spine runtime loaded.
  3. User cursor position broadcasts to other lobby members at ~30 Hz on requestAnimationFrame, throttled by a 2-pixel delta; peer cursors render as absolutely-positioned colored dots following the sender's position with sub-frame perceived lag.
  4. Mobile sibling (`.mobile.tsx`) ships stacked layout, pedestal sized to viewport width, and cursor broadcast disabled (neither send nor receive) — verified by a touch-device test with zero `LobbyCursorEvent` rows written by the mobile user.
**Plans**: TBD
**UI hint**: yes

### Phase 32: Match Post-Drafting — data
**Goal**: Per-game score submission with screenshot URL round-trips through Imgur + SpacetimeDB and triggers MMR + history archival; casual matches auto-finalize.
**Depends on**: Phase 31.
**Requirements**: MATCH-13, MATCH-14, MATCH-15, MATCH-16
**Success Criteria** (what must be TRUE):
  1. User can submit per-game scores along with a screenshot URL; the reducer call writes a `match_result` row with `screenshotUrl` populated and the game index set correctly.
  2. User can upload a screenshot directly from the form to Imgur via `POST https://api.imgur.com/3/image` (anonymous Client-ID), receive the returned URL, and submit it with the score in one flow.
  3. Match finalization reducer invocation computes MMR deltas for every participant and archives `match_session`, `match_session_step`, and `match_result` rows to their `*_history` counterparts; participant MMR changes are observable in `view_my_mmr_history`.
  4. Casual (non-tournament) match auto-finalizes when all required participant scores are submitted, without any admin intervention; the draft match is removed from `match_session` and present in `match_session_history`.
**Plans**: TBD
**UI hint**: yes

### Phase 33: Match Post-Drafting — UX
**Goal**: Score submission form and disconnect handling deliver a clean close to a match with graceful rejoin.
**Depends on**: Phase 32.
**Requirements**: MATCH-17
**Success Criteria** (what must be TRUE):
  1. When a user disconnects mid-match, the lobby/tournament's configured disconnect timer starts; UI shows a visible countdown for remaining players.
  2. Disconnected user can rejoin within the configured window; their slot and drafted state are restored and the timer clears.
  3. If the disconnected user does not rejoin before the timer expires, forfeit is triggered and the match resolves with the configured forfeit outcome (other participants see the result within one tick).
  4. Score submission form validates inputs (e.g., score range per game mode) before enabling submit and shows server-returned errors from the reducer call clearly inline.
**Plans**: TBD
**UI hint**: yes

### Phase 34: Tournament — data
**Goal**: Forked bracket library is committed to the repo with `styled-components` stripped; tournament creation, registration (solo + team), seeding, and TO management data flows all wired.
**Depends on**: Phase 21.
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04
**Success Criteria** (what must be TRUE):
  1. `lib/brackets/` (or `@hsrpvp/tournament-brackets` internal module) exists in the repo with the `styled-components` dependency removed, `SVGViewer` replaced by an internal pan/zoom, and single-elim + double-elim positioning math intact; it builds with no `styled-components` import anywhere in its tree.
  2. User can view `/tournaments` and see a list of open tournaments with format, stage, and registration status, sourced from `view_to_dashboard` or equivalent.
  3. Authorized (TO role) user can create a tournament specifying format (single/double/group/hybrid), stages, and referee config via a reducer; the new tournament appears in the open tournaments view.
  4. User can register solo or as a team member; TO can manage registrations and seed brackets via reducer calls; the seeded bracket is observable as `bracket_match` rows.
**Plans**: TBD
**UI hint**: yes

### Phase 35: Tournament — UX (dual-DOM)
**Goal**: Tournament bracket visualization renders all four formats on desktop and a vertical round-swipe sibling on mobile; TO + referee controls are surfaced.
**Depends on**: Phase 34.
**Requirements**: COMP-05, COMP-06, COMP-07
**Success Criteria** (what must be TRUE):
  1. Desktop user loading a tournament sees the correct layout for its format: single-elim tree, double-elim with winners/losers cross-link, group-stage grid, or hybrid composition; visually rendered from `view_to_bracket_matches` plus group tables.
  2. Mobile sibling (`.mobile.tsx`) shows one round at a time with vertical swipe between rounds; horizontal shrinking is never used.
  3. Tournament organizer can advance the tournament's current stage via a TO-gated control; non-TO users see the stage status but not the control.
  4. Referee can validate or invalidate a posted match result within a stage; state changes propagate to the TO dashboard and affected participants' views within one tick.
**Plans**: TBD
**UI hint**: yes

### Phase 36: Leaderboards — data
**Goal**: Per-game-mode and composite MMR leaderboard data surfaces expose paginated, server-filtered ranges — never a bulk subscription of the full leaderboard.
**Depends on**: Phase 21.
**Requirements**: COMP-08, COMP-09
**Success Criteria** (what must be TRUE):
  1. Leaderboard page loading the first range (e.g., top 50) subscribes only to that range via a filtered/paginated view; subscribing to a page 1-5 scroll does not transmit all users.
  2. Per-mode leaderboard (Memory of Chaos / Apocalyptic Shadow / Anomaly Arbitration) each surface through a named, mode-scoped view with rank, display name, and MMR.
  3. Composite global MMR leaderboard is derived server-side (equal-weight of three modes per existing backend pattern) and exposed through a paginated view.
  4. A user viewing leaderboard page N + 1 adds a subscription for that range and drops the page-1 subscription; energy ledger does not accumulate unbounded.
**Plans**: TBD

### Phase 37: Leaderboards — UX + polish
**Goal**: Leaderboard page renders ranked rows with pagination, rank-tier badging, and a research spike that confirms the chosen paginated approach holds at projected scale.
**Depends on**: Phase 36.
**Requirements**: COMP-10
**Success Criteria** (what must be TRUE):
  1. Leaderboard UX paginates through ranges of 50-100 rows; navigating between pages is smooth (<1s perceived) and never subscribes to the full dataset.
  2. A research-spike plan under this phase produces a design doc for the paginated leaderboard approach (named view shape, subscription lifecycle, edge cases) that the team signs off on before UI finalizes.
  3. Rank-tier badge, display name, and MMR render for each row; clicking a row navigates to that user's public profile (if SOCIAL-01 ships) or falls back to a read-only summary card.
  4. Switching between the three per-mode leaderboards and the composite does not re-subscribe to the full set — only the active range's view is active at any time.
**Plans**: TBD
**UI hint**: yes

### Phase 38: User & character stats — data
**Goal**: Profile page gains user performance stats (win/loss/spectated, per-character stats) and global character stats (platform-wide) through scoped subscriptions.
**Depends on**: Phase 24 (profile data base).
**Requirements**: STATS-01, STATS-02, STATS-03
**Success Criteria** (what must be TRUE):
  1. Viewing user's profile subscribes to that user's win/loss/spectated counters and renders the triple total across all match modes.
  2. Per-character performance stats (games played, win rate, MMR delta average) render for the viewing user only; another user's stats never appear in this subscription.
  3. A separate public subscription surfaces platform-wide character stats (global win rate, pick rate, usage) and is visible to anonymous visitors as well as authed users on the appropriate page.
  4. All three stat surfaces update reactively when a match finalizes (Phase 32 pipe) — no manual refresh required.
**Plans**: TBD

### Phase 39: User & character stats — UX
**Goal**: Stats surfaces render in a polished profile layout with MMR history chart and per-mode win-rate breakdown.
**Depends on**: Phase 38.
**Requirements**: STATS-04, STATS-05
**Success Criteria** (what must be TRUE):
  1. Profile page renders a Chart.js line chart of the user's MMR history per game mode (three lines on desktop, single-mode selector on mobile per anti-feature); point count scales to seasonal data without jank.
  2. Profile displays a per-mode win-rate breakdown (MoC / AS / AA) as a compact donut or bar group with numeric labels via `chartjs-plugin-datalabels`.
  3. Switching the MMR chart's time range (30/90/365 days) re-queries from the existing subscription cache without a new subscription.
  4. Chart renders with no hydration mismatch between SSR placeholder and client-mounted canvas.
**Plans**: TBD
**UI hint**: yes

### Phase 40: Historical + replay — data
**Goal**: Past match list and replay source data are exposed exclusively through the self-scoped `view_my_*` views from Phase 15; cross-user access is server-blocked.
**Depends on**: Phase 15 (views) + Phase 31 (pedestal component reused in replay).
**Requirements**: HIST-01, HIST-06
**Success Criteria** (what must be TRUE):
  1. User's `/profile/matches` (or equivalent) subscribes to `view_my_match_session_history` with a pagination window (e.g., 20 rows); moving through pages swaps the active range without leaking other users' match rows.
  2. Attempting to query match history for a user-id other than `ctx.sender` returns an empty row set server-side — not a blocked error at the client.
  3. `view_my_match_participant_history` and `view_my_match_session_step_history` are consumed on demand by the replay flow (Phase 41); replay pre-loads the step-by-step rows for one match without subscribing to global history.
  4. Historical rows are visible even when the related live tables have been archived; user can browse matches from months prior without re-running the match.
**Plans**: TBD

### Phase 41: Historical + replay — UX
**Goal**: Match detail and replay pages give users a rich look at their past play, reusing the pedestal component in read-only mode to scrub through pick/ban history.
**Depends on**: Phase 40 + Phase 31 (pedestal component).
**Requirements**: HIST-02, HIST-03, HIST-04, HIST-05
**Success Criteria** (what must be TRUE):
  1. User opens a past match detail page that shows all participants, per-game scores, the `hsr_account` snapshot captured at draft start, and MMR delta for the viewing user (or anon label if played as anon).
  2. User can click Replay on a past match and reach a replay page that loads archived `match_session_step_history` rows ordered by step index.
  3. Replay page plays back pick/ban steps on a timeline scrubber with 1x, 2x, 4x speeds (no 0.5x per anti-feature); user can drag the scrubber to any step and the pedestal reflects the correct target.
  4. Pedestal on replay reuses the Phase 31 component in read-only mode (no reducer calls, no cursor broadcast); exactly one WebGL context is live and is disposed on navigation away.
**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 15. Backend pre-work | 6/6 | Complete    | 2026-04-14 |
| 16. Route + global foundation | 0/TBD | Not started | - |
| 17. Cost tables — data | 0/TBD | Not started | - |
| 18. Cost tables — UX | 0/TBD | Not started | - |
| 19. Team builder — data | 0/TBD | Not started | - |
| 20. Team builder — UX | 0/TBD | Not started | - |
| 21. Authed base layer | 0/TBD | Not started | - |
| 22. Admin panel — data | 0/TBD | Not started | - |
| 23. Admin panel — UX | 0/TBD | Not started | - |
| 24. Profile (core) — data | 0/TBD | Not started | - |
| 25. Profile (core) — UX | 0/TBD | Not started | - |
| 26. Calendar — data | 0/TBD | Not started | - |
| 27. Calendar — UX (dual-DOM) | 0/TBD | Not started | - |
| 28. Lobby — data | 0/TBD | Not started | - |
| 29. Lobby — UX | 0/TBD | Not started | - |
| 30. Match Drafting — data | 0/TBD | Not started | - |
| 31. Match Drafting — UX (dual-DOM) | 0/TBD | Not started | - |
| 32. Match Post-Drafting — data | 0/TBD | Not started | - |
| 33. Match Post-Drafting — UX | 0/TBD | Not started | - |
| 34. Tournament — data | 0/TBD | Not started | - |
| 35. Tournament — UX (dual-DOM) | 0/TBD | Not started | - |
| 36. Leaderboards — data | 0/TBD | Not started | - |
| 37. Leaderboards — UX + polish | 0/TBD | Not started | - |
| 38. User & character stats — data | 0/TBD | Not started | - |
| 39. User & character stats — UX | 0/TBD | Not started | - |
| 40. Historical + replay — data | 0/TBD | Not started | - |
| 41. Historical + replay — UX | 0/TBD | Not started | - |

### Milestone Progress

| Milestone | Phases | Plans | Status | Shipped |
|-----------|--------|-------|--------|---------|
| v0.5 Backend Foundation | 23 | 75 | Complete | 2026-04-12 |
| v0.9 Frontend | 27 (+ 12 deferred XX.1) | TBD | Planned | - |

---

*Roadmap authored: 2026-04-12 during v0.9 milestone kickoff. Phase structure per DECISIONS.md R1 (locked during kickoff conversation). Coverage validated: 84/84 core v0.9 requirements mapped; 12 MOBILE requirements tracked as deferred XX.1 phases.*
