# Feature Research — v0.9 Frontend UX Patterns

**Domain:** Competitive gaming / tournament platform (Honkai Star Rail PvP)
**Researched:** 2026-04-12
**Confidence:** MEDIUM-HIGH (backend is locked; UX patterns are cross-referenced with competitive gaming platforms — chess.com, FACEIT, LoL esports overlays, Smogon, Prydwen, start.gg, Challonge, Overwatch League Replay Viewer)

## Scope Note

This is a **subsequent milestone** — backend features are complete and their behavior is locked. This document covers only the **frontend UX patterns** each feature needs. It does not re-discover the features themselves (those are fixed by the v0.5 backend contract). Complexity ratings reflect frontend implementation effort, not backend effort.

The consumer is the GSD phase planner, building phases 15–41 of the v0.9 roadmap. Each feature below informs a distinct phase or phase cluster.

---

## Part 1 — Feature-by-Feature UX Analysis

### 1. Cost Table Browsing

**What it is:** Players browse the full list of character and lightcone costs across game modes (Memory of Chaos, Apocalyptic Shadow, Anomaly Arbitration) to plan teams. Includes synergy costs (archetype modifiers). ~250 char costs + ~470 LC costs + ~200 synergy rows.

**Reference patterns:**
- **Smogon Dex** — filter by type/stat/ability, sort by columns, detail panel opens inline. Power users drive search via keyboard.
- **Prydwen character database** — card grid with filter rail (rarity, path, element, cost tier). Clicking opens detail page.
- **PoE trade/item DBs** — dense tabular view with numeric range filters (min/max).

**UX expectations:**
- Grid/table toggle (cards vs spreadsheet)
- Column filters: path, element, rarity, cost, eidolon level, game mode
- Free-text name search with fuzzy match (users misspell "Hooh" → Huohuo)
- Sort by any numeric column
- Side-by-side game mode comparison (same character's cost in MoC vs AS vs AA)
- Synergy costs shown contextually when a character is hovered/selected (not a separate unrelated tab)

**Category:** Table stakes
**Complexity:** Medium (data is small — ~250 rows — but filter/sort/search UX is non-trivial; virtualization not needed)
**Dependencies:** Public reference subscription (Decision 1 from subscription strategy) — no auth required

**Mobile fidelity loss:**
- Spreadsheet view collapses to card list on < 768px — lose multi-column sortable density
- Side-by-side game mode comparison becomes sequential tabs, not columns
- Filter rail becomes bottom-sheet modal instead of persistent sidebar

---

### 2. Team Builder UX

**What it is:** Manual team composition with cost validation against a game mode's budget. Live cost meter, synergy preview.

**Reference patterns:**
- **Smogon teambuilder** — 6-slot pokemon team, click-to-add from sidebar, each slot expands to moves/items/EV detail.
- **Prydwen team builder** — 4-slot HSR team, slot is a dropdown/modal picker. Shows role coverage (DPS/support/sustain).
- **Hearthstone deck builder** — card list on left, deck on right, click-to-add. Live mana curve chart.
- **LoL draft helpers (mobalytics, u.gg)** — role filters, counter-pick suggestions.

**UX decision: drag-drop vs click-to-add**
- **Recommendation: click-to-add, not drag-drop.** Drag-drop on mobile is painful. Click-to-add works identically desktop/mobile. All the reference tools above use click-to-add.
- Slot can be cleared via × button or right-click.

**Cost meter:**
- Persistent bar near team display (like mana curve in Hearthstone)
- Color-coded: green under budget, amber near limit, red over
- Breakdown: character costs + lightcone costs + synergy modifiers, each component labeled
- Shows both raw cost and remaining budget

**Synergy preview:**
- When a 2nd character is added and has a synergy row with an existing pick, show a delta pill: "+3 from Acheron/Black Swan synergy"
- Don't require a "calculate" button — update live on pick change

**Category:** Table stakes (core value prop — the whole platform is about drafting within a cost system)
**Complexity:** Medium-Large (core interaction pattern; must feel responsive; ties together cost tables + characters + LCs + synergies + game modes)
**Dependencies:** Cost tables (feature 1), public reference subscription. Does NOT require auth.

**Mobile fidelity loss:**
- Character picker becomes fullscreen modal instead of side panel
- Team + cost meter must fit above the fold on phone portrait (6.5" screen) — constrains slot representation size
- Fuzzy search becomes primary entry point on mobile (vs filter rail on desktop)

---

### 3. Draft Pick/Ban UI

**What it is:** Live real-time draft between two players/teams. Each makes ordered picks and bans. Pedestal shows Spine animation of the last picked/banned character (Decision 3). Timer per pick. Cursor broadcasting shown to spectators.

**Reference patterns:**
- **LoL esports champion select overlay** — two vertical panels (Blue left, Red right) with 5 pick slots each, bans in a horizontal row at the top. Center pedestal shows the current picker's focus with splash art.
- **Dota 2 captains mode** — similar two-panel layout, picks and bans interleaved on a central timeline strip showing sequence.
- **LoR/Hearthstone Battlegrounds** — single-player drafting, less applicable here.
- **LHM.gg / league-prod-toolkit** (open source LoL overlay) — gold standard for this visual layout.

**UX layout choices:**
- **Side-by-side (recommended):** Blue team column left, Red team column right, central pedestal, bans as horizontal strip above pedestal. Maps directly to Blue/Red naming in backend. Standard for MOBA audiences.
- **Timeline overlay (alternative):** Rejected — less readable at a glance, doesn't show team coverage (who has what roles)
- **Pedestal placement:** Center, large. Single persistent portrait `<img>` + Spine canvas over it (Decision 3 is locked — don't revisit).

**Timer:**
- Circular countdown around the current picker's slot
- Text timer also visible (accessibility + reduced-motion users)
- Flash red in last 5 seconds
- No timer if backend is in casual (no-timer) mode — hide the UI, don't show a disabled timer

**Phase indicators:**
- Top strip: "Ban Phase 1 / Pick Phase 1 / Ban Phase 2 / Pick Phase 2" — mirrors backend draft mode sequence
- Highlight current phase

**Account selection step (post-draft):**
- Between draft end and match start, each player picks which HSR account they'll play with
- Separate sub-screen; picks already locked at this point

**Category:** Table stakes (core gameplay)
**Complexity:** Large (real-time sync, Spine rendering, multi-state UI — drafting, equipping, scoring, awaiting-result, completed, disconnect handling)
**Dependencies:** Lobby (feature), match session subscription, Spine asset prefetch (Decision 2), match-entity subscription (Decision 6)

**Mobile fidelity loss:**
- **Significant.** Side-by-side layout collapses — picks must stack vertically, pedestal shrinks dramatically.
- Spine animation is preserved on `full` tier mobile but pedestal is ~40% of screen height vs ~60% on desktop.
- Cursor broadcasting (seeing opponent's cursor hover over a champion before locking) is a desktop-only fidelity feature — mobile users don't have a meaningful cursor to broadcast. Consider: on mobile, only *receive* cursor broadcasts as spectators, don't *send*.
- Timer stays identical — no loss.

---

### 4. Tournament Bracket Visualization

**What it is:** Display of tournament structure for single-elim, double-elim, group stage, and hybrid formats. Must show current state, advance matches, reveal winners.

**Reference patterns:**
- **start.gg / Challonge** — horizontal bracket tree, each match a card with two team slots. Double-elim shows upper and lower brackets stacked with a connecting "grand finals reset" node.
- **Liquipedia** — dense horizontal bracket, good for wide viewports, terrible on mobile.
- **Battlefy / Toornament** — zoom/pan canvas-based, works better on tablet.
- **react-tournament-brackets / g6-graph** — common React libraries; usable but may need customization.

**UX standards per format:**
- **Single elim:** left-to-right tree, round headers on top
- **Double elim:** upper bracket top, lower bracket below, grand finals connecting node with "bracket reset" visual if lower-bracket winner forces a second series
- **Group stage:** round-robin table per group (wins/losses/SOS), then brackets after
- **Hybrid:** tabbed or stacked — "Group Stage" tab → "Playoff Bracket" tab

**Zoom/pan:**
- Required for double-elim with 32+ participants
- Pinch-zoom on touch, scroll-zoom on desktop
- Mini-map overlay in corner showing where in the bracket you're looking
- Click a match → scrolls bracket into view centered on that match

**Match card content (what's in each bracket node):**
- Team names (or anonymous labels if enforced)
- Current score (if in progress) or final score (if completed)
- "In Progress" / "Upcoming" / "Complete" state badge
- Click to open match detail modal

**Category:** Table stakes (tournaments are a declared core feature)
**Complexity:** Large (four formats × zoom/pan × responsive × live updates via subscription)
**Dependencies:** Tournament feature, brackets feature, match results, authed subscription layer

**Mobile fidelity loss:**
- **Major.** Horizontal bracket trees are fundamentally desktop-first. Challonge and start.gg both have this problem.
- Mobile pattern: **vertical bracket** — each round is a scrollable column, swipe between rounds. Lose the ability to see full tournament at a glance.
- Alternative: **list view per round** — shows matches as cards in a list, group by round header. Trades visualization for readability.
- **Anti-pattern to avoid:** Trying to shrink a full horizontal bracket to fit a phone — results in illegible 8pt text. Users need to zoom constantly.
- For mobile phase (XX.1): design the bracket as round-by-round swipable columns from day one; don't treat mobile as a responsive afterthought.

---

### 5. Live Spectator View

**What it is:** Non-playing users watch a draft in progress. See pedestal, picks, bans, timer. May also see cursor broadcasts from players (if backend allows for that lobby).

**Reference patterns:**
- **LoL broadcast overlay (esports)** — spectator view is similar to player view but without the "your action" prompts. Often higher production value (team logos, player names).
- **twitch.tv chat beside stream** — if the lobby has chat, spectators see the chat (read-only unless they're also in the lobby)
- **Chess.com live games** — follower count visible, move list on side, board in center

**Player view vs spectator view — what differs:**
- Spectators do **not** see their own "pick now" prompt (they have no pick)
- Spectators see **all** cursor broadcasts from players (players may or may not, depending on anonymous play settings)
- Spectators see both teams' full state, not just their team
- Spectators cannot interact — no pick buttons, no ban buttons, no chat input (unless they're a lobby member in spectator role)
- Coaches (special role) have slight UX differences: can see team they're coaching more privileged info, but cannot pick

**Follower count:**
- Small badge: "12 watching" — derived from lobby members with spectator role
- Low priority polish

**Category:** Table stakes (backend explicitly supports spectator role, anonymous play, cursor broadcast — the UX has to expose it)
**Complexity:** Medium (reuse player draft view components, conditional rendering based on role)
**Dependencies:** Draft UI (feature 3), lobby roles, anonymous label system

**Mobile fidelity loss:**
- Mobile spectator view is actually simpler than mobile player view (no input)
- Cursor broadcasts are still visible on mobile (passive receive) but less meaningful without a large screen
- Chat overlay must be collapsible on mobile or it dominates the screen

---

### 6. Calendar / Scheduling

**What it is:** Users set availability slots, save calendars, create events with invites. Tournament matches can be scheduled. Recurring slots supported.

**Reference patterns:**
- **Calendly / Cal.com** — invitee-centric; shows available slots, click to book. Good for match-scheduling flow.
- **Google Calendar / Outlook** — organizer-centric; traditional week/month grid with drag-to-create.
- **When2meet** — availability heatmap; multiple people overlay their available times to find common slots. **Highly applicable for "when can we both play?" team scheduling.**
- **Discord events** — simple modal create, RSVP list. Applicable for casual lobby scheduling.

**Week vs month view:**
- **Week view (default):** Best for competitive gaming where matches are hour-scale events. 7-column grid, time on Y-axis.
- **Month view:** Secondary; used for tournament-level planning or browsing far-future events.
- **Toggle between them.** Don't force one.

**Timezone handling:**
- All times stored as UTC microseconds in SpacetimeDB (already locked).
- Display in user's local timezone by default (`Intl.DateTimeFormat().resolvedOptions().timeZone`).
- For events with invitees across timezones, show "Their time: X / Your time: Y" dual labels.
- Timezone selector in settings for users who travel/stream under a different zone.
- **Anti-pattern:** Server-side rendering times based on request IP — inaccurate, use client local time.

**Inline invite vs modal:**
- **Create event:** modal (complex form — time, opponents, game mode, best-of-N)
- **Respond to invite:** inline accept/decline buttons in event detail popover. Don't force a modal for a one-click action.
- **View invite list:** dedicated sidebar or tab ("Invitations: 3")

**Availability slots (recurring):**
- Week-template pattern: "every Monday 7-9pm local" → generates slots for N weeks forward
- Edit a single occurrence or the whole series (Google Calendar pattern)

**Saved calendars:**
- User saves "my weekly tournament prep schedule" as a named template, can apply it to future weeks
- Low priority — ship basic scheduling first, saved templates as v0.9.x

**Category:** Table stakes (tournaments need match scheduling; backend has calendar tables)
**Complexity:** Large (timezone math is thorny; week/month views; recurring slot expansion; invite flow)
**Dependencies:** Authed subscription layer (calendar events, invites, availability slots), user table

**Libraries:**
- **react-big-calendar** — month/week/day/agenda views, good default, MIT license. Skip paid options (KendoReact, Syncfusion).
- **date-fns-tz** for timezone conversions (lighter than moment-timezone; already a Next.js-friendly pick)
- **Alternative: FullCalendar (open source edition)** — more polished, more setup

**Mobile fidelity loss:**
- Week view is cramped on phone portrait. Default to **day view on mobile**, swipe between days.
- Drag-to-create slot is broken on mobile — replace with tap-empty-cell → modal form.
- Invitee multi-selector becomes bottom-sheet picker vs desktop combobox.
- When2meet-style heatmap doesn't work on phone — shrink to a dedicated standalone "find a time" page, not embedded in week grid.

---

### 7. Profile Stats Visualization

**What it is:** User profile shows winrate, per-character stats, per-LC stats, MMR history, global character stats, achievements.

**Reference patterns:**
- **FACEIT / Faceit Analyser** — ELO line chart over time, K/D bar chart per weapon/map, recent matches list. Dense but readable.
- **Chess.com profile** — rating chart (multi-line: bullet/blitz/rapid), recent games, win/loss/draw donut, heatmap of activity.
- **OP.GG / League of Graphs** — per-champion win rate bar chart (sorted), mastery distribution, recent match timeline.
- **Tracker.gg** — generic multi-game dashboard; heavily uses sparklines and KPI cards.

**Charts per section:**
| Section | Chart type | Library |
|---------|-----------|---------|
| MMR history | Multi-line chart (one line per game mode) | Recharts or visx |
| Win/loss split | Donut chart | Recharts |
| Per-character win rate | Sorted horizontal bar chart (top 10 with "show all" expand) | Recharts |
| Character pick frequency | Could be donut but better as bar (donuts with >5 slices are unreadable) | Recharts |
| Activity heatmap (matches per day) | GitHub-style contribution grid | @uiw/react-heat-map |
| Achievements | Card grid (earned / locked variants) | Custom |

**Library recommendation:**
- **Recharts** — standard React chart library, server-rendered friendly, small bundle. Covers MMR history, win/loss donut, character bar chart.
- Skip: Chart.js (imperative API conflicts with React), D3 directly (too low-level for this scope), Highcharts (commercial license).

**Self vs other-user profiles:**
- Self profile: sees everything including private history (via `view_my_*` profile-scoped subscriptions, Decision 8)
- Other user profile: sees only public stats via different views. UI should gracefully hide sections if the view returns no rows.

**MMR visualization specifics:**
- Per-game-mode lines: MoC (red), AS (blue), AA (green) — established per backend schema
- Y-axis is rating, X-axis is match sequence or time
- Hover shows delta per match: "+15 vs Player X"

**Category:** Table stakes for competitive platforms (every reference platform has this)
**Complexity:** Medium (chart work is well-trodden; backend provides the data via views)
**Dependencies:** Profile-scoped historical subscription (Decision 8 — mounted only on profile page), match history, MMR history, player stats, global character stats

**Mobile fidelity loss:**
- Multi-line MMR chart becomes single-line (default game mode) with tabs to switch modes — can't read 3 lines on a narrow chart
- Per-character bar chart shows top 5 instead of top 10
- Activity heatmap shows 3 months instead of 12
- Charts are touch-responsive — tap-to-show-tooltip instead of hover

---

### 8. Replay Playback

**What it is:** Users replay completed drafts — the pick/ban sequence, step by step. Backend stores `MatchSessionStepHistory` and `MatchParticipantHistory`. No live rendering of the actual game match — only the draft.

**Reference patterns:**
- **Chess.com move-by-move replay** — left/right arrow keys, board updates per move, move list on side highlighted. Simple scrubber.
- **LoL champ-select replays** (some third-party tools) — shows pick/ban order with timestamps, can step through.
- **CS2 demo viewer** — scrubber, speed 1x/2x/4x/8x, skip to round.
- **Overwatch League Replay Viewer** — full 3D replay; scope overkill for HSR draft replay.

**UX for draft replay:**
- Use the same side-by-side draft UI (feature 3) but in read-only mode
- **Scrubber** at the bottom showing step count (e.g., "step 7 / 24")
- **Prev / Play / Next** buttons
- **Speed control:** 1x / 2x / skip-to-end. No 0.5x — nothing happens slowly enough to benefit.
- **Auto-play:** Off by default. Each pick held for ~1.5 seconds on auto-play.
- **Click scrubber to jump** to any step

**Side-by-side picks (reference pattern):**
- Not applicable for draft replay — the draft is already side-by-side in the main view
- Could be useful for **comparing two matches' drafts** (feature 1 match A vs match B), but this is a v0.9.x addition, not MVP

**Pedestal in replay:**
- Use the same Spine-pedestal component, drive it off the replay step cursor
- On `image-only` tier, only portraits are shown (already handled by pedestal component)

**Category:** Differentiator (backend has the data; most similar tournaments don't expose a dedicated draft replay UI — Smogon has replays but they're game-format specific)
**Complexity:** Medium (reuses most of the draft UI in read-only mode; adds scrubber + step cursor state)
**Dependencies:** Draft UI (feature 3), match history subscription (profile-scoped), pedestal component

**Mobile fidelity loss:**
- Scrubber becomes full-width bottom bar (vs inline on desktop)
- Speed control collapses into a single "speed 1x/2x/4x" cycling button
- Otherwise mostly identical to draft UI — same fidelity loss as feature 3

---

### 9. Match Post-Drafting

**What it is:** After draft ends, players play the actual HSR match externally, then return to submit results. Flow: score submission → screenshot upload (Imgur) → MMR calculation → match finalization. Disconnect handling also lives here.

**Reference patterns:**
- **FACEIT post-match** — veto/pick screen → match summary → K/D breakdown → ELO change animation at the end
- **Chess.com post-game** — result banner, rating change (+12 / -8), accuracy graph
- **Marvel Rivals ranked** — large "+ELO" number animation, celebration confetti for wins
- **start.gg report-match** — score entry form, screenshot attachment, opponent confirmation required

**Score submission flow:**
1. **Equipping phase:** both players confirm their HSR accounts locked in. No input, just a loading/ready indicator.
2. **Scoring phase:** form with score inputs (format depends on game mode — MoC has cycle counts, AS has points, AA has waves). Per game mode the form is different — validate with the backend's MatchResultGame schema.
3. **Screenshot upload:** drag-drop or file picker → uploads to Imgur → URL stored. Preview with crop/rotate optional.
4. **Confirmation:** "Submit result" button. Server triggers finalization reducer after opponent also confirms (or after a referee does for tournaments).
5. **MMR reveal:** animated number counter (current ELO → current ELO + delta). Uses `@react-spring/web` or CSS counter animation.
6. **Post-match summary:** like/dislike opponent (relationship table), rematch button, share replay link.

**Screenshot verification UX:**
- Show screenshot inline in the confirmation step — both players must see it
- Discrepancy flow: if opponent disputes, escalate to referee (tournament) or reset to scoring phase (casual)
- Anti-pattern: burying the screenshot in a modal requiring click-to-open — users won't verify

**MMR reveal animation:**
- Number ticks up/down over ~1.5 seconds
- Green for gain, red for loss
- Show new rank badge if tier changed
- Keep animation short — avoid Korean MMO-style 8-second confetti explosions

**Disconnect handling UI:**
- Player disconnected → banner on the remaining player's screen: "Opponent disconnected. Waiting 60s..."
- Countdown timer to forfeit
- Rejoin button auto-appears if opponent returns
- For the disconnecting player: when they return, resume seamlessly without re-prompting

**Category:** Table stakes (core gameplay loop — can't complete a match without it)
**Complexity:** Medium-Large (multi-phase state machine, file upload, external service integration with Imgur, MMR animation, disconnect edge cases)
**Dependencies:** Match session (feature 3), match results subscription, Imgur upload flow, MMR tables

**Mobile fidelity loss:**
- Screenshot upload must support camera capture on mobile (`<input type="file" accept="image/*" capture>`)
- MMR reveal animation is smaller (less screen-real-estate) but animation itself works fine
- Disconnect banner must not cover critical UI on small screens

---

### 10. Leaderboards & MMR

**What it is:** Per-game-mode leaderboard (MoC, AS, AA). Global rank derived from equal-weight average. Filterable, paginated.

**Reference patterns:**
- **FACEIT hub leaderboards** — paginated table, rank / name / level / elo columns. Filter by region.
- **Chess.com leaderboards** — top 100 per format, jump-to-me button.
- **Dota 2 leaderboards** — seasonal, per-region, per-rank-tier filters.

**UX standards:**
- Table view: rank / username / MMR / wins / losses / winrate
- **Jump to me** button — scroll to your row highlighted
- Pagination: page size 50, infinite scroll OR pagination buttons (infinite scroll is better for exploration, pagination better for "page 7 specifically")
- Filter by game mode (tabs or dropdown)
- **No season filter** — backend supports it but v0.9 explicitly defers season UI (out of scope per PROJECT.md)

**Category:** Table stakes (every competitive platform has this)
**Complexity:** Small-Medium (standard paginated table; backend already has the data)
**Dependencies:** MMR subscription, leaderboard view

**Mobile fidelity loss:**
- Columns drop: show only rank / username / MMR; wins/losses/winrate tucked in expand-row
- Filter dropdown → bottom-sheet picker

---

## Part 2 — Dual-DOM Mobile Fidelity Summary

This project has established "dual-DOM" mobile architecture (per CLAUDE.md patterns). For each feature, the fundamental mobile difference — beyond just CSS layout — is:

| Feature | Mobile fundamentally differs in... | Fidelity loss |
|---------|-----------------------------------|---------------|
| 1. Cost tables | Spreadsheet → card list; no side-by-side mode compare | Medium |
| 2. Team builder | Drag-drop dropped; full-screen picker modal | Low (click-to-add works equally) |
| 3. Draft UI | Layout stacks vertically; cursor broadcast send disabled | **High** |
| 4. Tournament brackets | Horizontal tree → round-by-round swipe | **Critical** |
| 5. Spectator view | Simpler than player; easier to mobile-port | Low |
| 6. Calendar | Week view → day view default; heatmap dropped | Medium-High |
| 7. Profile stats | Multi-line charts → single-line with tabs; fewer data points | Medium |
| 8. Replay playback | Same as draft UI degradation | High |
| 9. Match post-drafting | Camera capture becomes primary; MMR reveal smaller | Low |
| 10. Leaderboards | Table columns collapse; jump-to-me more important | Low |

**Critical mobile phases (XX.1 scope):**
- **Tournament brackets** — needs its own mobile design, not just responsive shrink
- **Draft UI** — needs a distinct mobile composition; Spine pedestal sizing tradeoffs
- **Calendar** — day-view-default is a code path, not a CSS toggle

**Safe for responsive-only (no XX.1 phase needed):**
- Cost tables
- Team builder
- Leaderboards
- Spectator view
- Match post-drafting

---

## Part 3 — Category Summary

### Table Stakes (Minimum Viable UX)

Missing any of these = platform feels broken:

| Feature | Complexity | Phase sizing signal |
|---------|-----------|--------------------|
| 1. Cost table browsing | M | Normal phase |
| 2. Team builder | M-L | Large phase (core value prop) |
| 3. Draft pick/ban UI | **L** | Largest UX phase; plan for spillover |
| 4. Tournament brackets | **L** | Large phase; plan separate mobile phase |
| 5. Spectator view | M | Share with draft UI or small standalone |
| 6. Calendar / scheduling | **L** | Large phase; timezone edge cases |
| 7. Profile stats visualization | M | Normal phase |
| 9. Match post-drafting | M-L | Large phase; external Imgur integration |
| 10. Leaderboards & MMR | S-M | Small phase |

### Differentiators

Features where this platform can stand out:

| Feature | Why differentiating |
|---------|---------------------|
| 8. Replay playback | Most competitive platforms don't expose draft replays in-app; Smogon has replays but not integrated. Backend already stores this data. |
| Live cursor broadcast in draft | Novel for HSR; shows opponent's indecision/focus. Increases engagement. Unique to this platform. |
| Spine pedestal rendering | Visual richness beyond static portraits. No other HSR tournament tool does animated character previews. |
| Cost-set system UX | Multiple cost configurations per game mode (balance patches) is unusual; Prydwen-style wikis don't have versioning. |
| Integrated everything | start.gg + Challonge + Prydwen + Calendly — one platform. Reduces tool fragmentation for HSR community. |

### Anti-Features (Avoid or De-prioritize)

Features that look appealing but create problems:

| Anti-feature | Why requested | Why problematic | Alternative |
|--------------|---------------|-----------------|-------------|
| Horizontal bracket shrink on mobile | "We have a bracket, make it responsive" | Illegible text, constant zoom/pan required (see start.gg/Challonge reviews) | Round-by-round vertical swipe design |
| Drag-drop team builder | "Feels modern" | Breaks on mobile; accessibility issues; click-to-add is faster anyway | Click-to-add with fullscreen picker |
| 0.5x replay speed | "Let users analyze carefully" | Nothing in draft benefits from slow-mo — it's discrete steps | Pause + step-by-step; skip 0.5x |
| Persistent multi-line MMR chart on mobile | "Show all game modes at once" | Unreadable on narrow viewport | Tab-switched single line |
| Drag-to-create calendar events on mobile | "Feels like Google Calendar" | Unreliable touch targets; accidental creates | Tap-empty-cell → modal |
| Real-time everything | "More interactive" | Bandwidth cost; distraction from draft | Real-time only in match-zone; polling elsewhere |
| Long MMR reveal animations | "Celebration for wins" | 8s confetti explosion is Korean-MMO bad UX | 1.5s count-up, subtle rank-up flash |
| Chat persistence | "Users want to re-read" | Backend explicitly ephemeral (PROJECT.md Out of Scope) | Don't build — backend says no |
| SSR-rendered times based on server IP | "Works without JS" | Wrong timezone for 80% of users | Client-side local-time formatting |
| Embedded 3D game replay | "Like Overwatch League" | Not available from HSR API; massive scope | Draft replay only — already scoped |

---

## Part 4 — Feature Dependencies

```
[1. Cost tables]
    └─ required by ─> [2. Team builder]
                          └─ enhances ─> [3. Draft UI] (validation at draft time)

[3. Draft UI]
    ├─ shared components ─> [5. Spectator view]
    ├─ shared components ─> [8. Replay playback]
    └─ feeds ─────────────> [9. Match post-drafting]
                                └─ writes to ─> [7. Profile stats] / [10. Leaderboards]

[6. Calendar]
    ├─ standalone (no hard deps on other features)
    └─ enhances ─> [Tournament creation] (scheduled matches)

[4. Tournament brackets]
    ├─ depends on ─> [3. Draft UI] (match instances are drafts)
    └─ depends on ─> [9. Match post-drafting] (bracket advancement requires finalization)

[7. Profile stats]
    └─ requires ─> [9. Match post-drafting] (writes history)

[10. Leaderboards]
    └─ requires ─> [9. Match post-drafting] (updates MMR)
```

**Critical phase ordering signals:**
- Cost tables → team builder → draft UI → post-drafting forms the **core loop**. Build in order.
- Draft UI, spectator view, and replay playback share components — batch them in nearby phases, or build draft UI first with careful component extraction.
- Post-drafting is the prerequisite for profile stats and leaderboards — don't build those UIs until post-drafting writes data.
- Tournament brackets depend on the full core loop — schedule later, possibly toward end of v0.9.
- Calendar is independent — can be done in parallel with other phases.

---

## Part 5 — Competitor Feature Analysis

| Feature | Prydwen | start.gg | Challonge | FACEIT | Chess.com | Our Approach |
|---------|---------|----------|-----------|--------|-----------|--------------|
| Cost/char browsing | Wiki-style cards | N/A | N/A | N/A | N/A | Hybrid: card grid + table toggle; cost-set aware |
| Team builder | Slot picker, no cost validation | N/A | N/A | N/A | N/A | **Differentiator:** live cost meter + synergy preview |
| Draft UI | N/A | Basic pick/ban per-game | N/A | Game-specific | N/A | **Differentiator:** Spine pedestal + cursor broadcast |
| Tournament brackets | N/A | Dense, desktop-first | Dense, desktop-first | Hub-based | Tournament mode | Round-by-round mobile; same visual density on desktop as start.gg |
| Spectator view | N/A | Live stream links only | Minimal | Stream-embedded | Live board with followers | Integrated in-platform with cursor broadcast visibility |
| Calendar/scheduling | N/A | Event date only | Event date only | Matchmaking | Time controls | **Differentiator:** When2meet-style availability overlap |
| Profile stats | N/A | Per-game results | Match history | Rich charts + ELO | Rich charts + rating per format | Multi-game-mode MMR line; per-character winrate bars |
| Replay playback | N/A | N/A | N/A | Demo download | Move-by-move board | **Differentiator:** in-app draft replay with scrubber |
| Post-match flow | N/A | Report score + dispute | Report score | Screenshot + auto-ELO | Auto result | Screenshot verification + MMR reveal |
| Leaderboards | N/A | Per-event only | Per-event only | Hub leaderboards | Global + format | Per-mode + composite global |

**Where we clearly win:** Integrated single-platform experience (no tool juggling between Prydwen + Challonge + Discord + ELO sheet). Spine-animated draft pedestal (no other HSR tool has this). Cost-set aware team builder. In-app draft replay.

**Where we must match competitors:** Tournament bracket quality (start.gg sets the bar). Profile stat depth (FACEIT / chess.com set the bar). Scheduling UX (Calendly sets the bar for booking flow).

**Where we intentionally don't compete:** Real-time voice/video, payment/monetization, 3D game replay, season UI (all per PROJECT.md Out of Scope).

---

## Part 6 — Roadmap Implications

**Phase sizing recommendations for the planner (phases 15–41):**

1. **Large phases (likely need their own phase + possibly a research phase):**
   - Draft UI (includes Spine pedestal integration, timer, all 4 match states)
   - Tournament brackets (4 formats × zoom/pan × responsive)
   - Calendar / scheduling (timezones + recurring + invites)
   - Team builder (cost meter + synergy preview + picker UX)

2. **Medium phases:**
   - Cost tables
   - Profile stats visualization
   - Match post-drafting
   - Replay playback (reuses draft UI components)
   - Spectator view (reuses draft UI components)

3. **Small phases:**
   - Leaderboards
   - MMR visualization (can be sub-section of profile or standalone page)

4. **Mobile-specific phases (XX.1 scope):**
   - **Must-have XX.1:** tournament brackets, draft UI, calendar
   - **Optional XX.1:** profile stats (multi-line charts), cost tables (table view)
   - **No XX.1 needed:** team builder, leaderboards, spectator view, match post-drafting

5. **Research flags (phases likely needing deeper research during execution):**
   - **Draft UI phase:** Spine rendering edge cases (Y-axis flip issue from Decision 3), WebGL context loss handling, pedestal transition timing
   - **Calendar phase:** timezone library choice (date-fns-tz vs luxon), recurring slot generation algorithm
   - **Brackets phase:** react-tournament-brackets library evaluation vs custom, zoom/pan touch handling
   - **Charts phase:** Recharts bundle size impact, SSR compatibility

6. **Risk areas:**
   - Imgur external dependency for screenshots — plan a fallback (backup Discord-bot hosting noted in decisions doc)
   - Tournament bracket UX is "critical mobile loss" — do not skip the XX.1 phase
   - Cursor broadcast fidelity tradeoffs for mobile (sender vs receiver) — decide early in draft UI phase

---

## Sources

- [Prydwen Institute Team Builder](https://www.prydwen.gg/star-rail/team-builder/) — HSR character planning tool reference
- [StarGuide — Honkai Star Rail Guide & Team Builder](https://starguide.gg/) — alternative HSR tool
- [Fribbels Star Rail Optimizer](https://fribbels.github.io/hsr-optimizer/) — HSR optimization reference
- [Smogon Teambuilder](https://www.smogon.com/forums/threads/teambuilder.3652866/) — competitive team builder UX reference
- [Smogon teambuilder filter UX](https://www.smogon.com/forums/threads/add-additional-move-category-filters-to-the-teambuilder.3712062/) — filter pattern reference
- [LHM.gg League of Legends overlay](https://lhm.gg/features/multiple-game-support/league-of-legends) — pro-grade draft overlay reference
- [RCVolus lol-pick-ban-ui (GitHub)](https://github.com/RCVolus/lol-pick-ban-ui) — open source champion select UI
- [RCVolus league-prod-toolkit (GitHub)](https://github.com/RCVolus/league-prod-toolkit) — production overlay toolkit
- [Overwatch League Replay Viewer](https://overwatch.blizzard.com/en-gb/news/23013835/overwatch-league-replay-viewer-see-matches-from-a-new-perspective/) — replay UI reference
- [Marvel Rivals Replay & Tournament tools](https://boosting-ground.com/marvel-rivals/guides/ranked-and-competitive/competitive-tools-lobbies-and-replays) — pick/ban tournament config reference
- [FACEIT Track Overview](https://support.faceit.com/hc/en-us/articles/17012729714972-FACEIT-Track-Overview) — stats dashboard reference
- [Faceit Analyser](https://faceitanalyser.com/) — ELO chart + stats pattern reference
- [Score7 Best Tournament App 2026](https://kb.score7.io/blog/comparisons/best-tournament-app-2026/) — mobile tournament UX analysis
- [Score7 Best Bracket Maker 2026](https://kb.score7.io/blog/comparisons/best-bracket-maker-2026/) — bracket tool comparisons
- [Challonge Tournament Bracket Generator](https://challonge.com/tournament/bracket_generator) — bracket reference (desktop-first example)
- [LogRocket: Best React Scheduler libraries](https://blog.logrocket.com/best-react-scheduler-component-libraries/) — calendar library comparison
- [Builder.io: Best React calendar components](https://www.builder.io/blog/best-react-calendar-component-ai) — calendar library analysis
- [react-big-calendar (on npm via builder.io review)](https://www.builder.io/blog/best-react-calendar-component-ai) — recommended library for week/month views

---

*Feature research for: HSR PvP platform v0.9 frontend milestone*
*Researched: 2026-04-12*
