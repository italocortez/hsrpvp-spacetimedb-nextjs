# Project Research Summary

**Project:** HSRPVP Competitive Platform — Tournament, MMR, Calendar, and Screenshot Milestone
**Domain:** Competitive gaming / esports tournament platform (Honkai: Star Rail PVP)
**Researched:** 2026-03-15
**Confidence:** MEDIUM (stack additions MEDIUM; architecture HIGH based on existing codebase; pitfalls MEDIUM-HIGH)

## Executive Summary

This milestone extends a working SpacetimeDB + Next.js draft/lobby platform into a full competitive tournament system. The existing stack (SpacetimeDB 2.0.3, Next.js 15, React 18, Tailwind CSS 4, HeroUI 2, NextAuth 4) is locked. The additive work requires only two new npm dependencies — `react-big-calendar` and `date-fns` for the calendar/scheduling feature. All other new logic — ELO calculation, bracket generation, achievement evaluation — belongs inside the SpacetimeDB module as pure TypeScript helper functions, because npm packages cannot be imported into a WASM-compiled SpacetimeDB module. The recommended implementation approach is: define the full schema and state machine enums first, then layer reducers on top of stable tables, and defer frontend UI until the backend is verified.

The core differentiator of this platform over generic tools (Challonge, start.gg) is HSR-native integration: roster-constrained drafting, per-game-mode MMR (MemoryOfChaos, ApocalypticShadow, AnomalyArbitration), anonymous play mode, and screenshot-based result verification via Imgur. Every generic competitor is game-agnostic; none can model character ownership, eidolon levels, or connect pick/ban directly to tournament brackets. These features form the product's identity and must be built correctly from the start because schema migrations in SpacetimeDB are costly.

The most dangerous risks for this milestone are: (1) implementing ELO updates before match result verification is complete — once incorrect MMR is applied it is expensive to reverse; (2) storing tournament and bracket state without explicit enum-driven state machines — boolean flag soup produces impossible-to-audit reducer logic; and (3) enforcing anonymous play and roster visibility only at the display layer, when SpacetimeDB subscriptions are accessible to any client that connects. All three require schema-level design decisions before any reducer is written, not UI-layer fixes added later.

---

## Key Findings

### Recommended Stack

The existing stack handles all new features except calendar visualization. Only `react-big-calendar@^1.14.x` and `date-fns@^3.x` are added as net-new npm dependencies; date-fns is react-big-calendar's required localizer and provides timezone-safe date arithmetic for recurring availability patterns. Custom SVG/React components are recommended for bracket visualization (not `@g-loot/react-tournament-brackets`) because HSR-specific design requirements — character images in match slots, anonymous label substitution, live SpacetimeDB subscription updates — cannot be satisfied by off-the-shelf bracket libraries without fighting their styling system. Screenshot upload uses a Next.js API route proxying to Imgur API v3 (raw `fetch`, no wrapper package) to keep the Imgur Client ID server-side. The `IMGUR_CLIENT_ID` environment variable is the only new environment variable required.

**Core technologies:**
- `react-big-calendar` + `date-fns`: Calendar grid for recurring player availability — the only valid open-source option for availability-style display (not a date picker); date-fns is the non-deprecated localizer
- Custom SVG bracket component: Tournament bracket visualization — required for HSR-specific slot rendering, live subscription updates, and anonymous mode label substitution
- Imgur API v3 via Next.js API route: Screenshot hosting — anonymous upload pattern keeps Client ID server-side; store both URL and `deleteHash` for dispute cleanup
- Inline ELO implementation in `spacetimedb/src/helpers/elo.ts`: MMR calculation — npm packages cannot be imported in WASM modules; ELO is ~20 lines of deterministic arithmetic
- Inline bracket seeding in `spacetimedb/src/helpers/bracketGenerator.ts`: Bracket generation — pure function, pre-generates all match slots with explicit FK relationships before any reducer touches the database

### Expected Features

**Must have (table stakes — users assume these exist):**
- Bracket visualization (single elimination minimum) — every competitive platform shows this; absence reads as "unfinished"
- Tournament self-registration with status enum (Draft / Registration / Active / Completed / Cancelled) — players cannot work with organizer-only enrollment
- Dual-submission match result reporting (both players submit, auto-confirm on agreement, flag on disagreement) — mutual confirmation is the standard for screenshot-based platforms
- Bracket auto-advancement on confirmed result — manual advancement is painful at tournament scale
- MMR per game mode with global composite — competitive players need a skill number; per-mode is expected given multiple scoring axes in HSR
- Leaderboard sorted by MMR — required accompaniment to any rating system
- Seeding (manual minimum; MMR-based auto-seed once MMR exists) — top seeds avoiding each other early is a universal competitive expectation
- Admin / TO override for match state and result disputes — without override capability, a single bad result breaks an entire bracket
- Player profile with win/loss stats and match history — absence reads as unprofessional

**Should have (differentiators — this platform's competitive advantage):**
- HSR-native draft integration per tournament match — the primary differentiator; no generic tool does this
- Per-game-mode ELO (MoC / AS / AA) with per-mode leaderboards — generic tools collapse multi-mode skill into one number
- Screenshot verification with referee workflow (dual submission + referee validation + dispute path) — correct model for non-API-accessible game data
- Roster-aware drafting (owned characters + eidolon levels constrain legal picks) — requires Roster Management to be complete first
- Anonymous play mode (identity withheld in draft and match data, enforced at data layer) — unique feature; enforced server-side or it is meaningless
- Availability calendar with recurring slot rules and auto-overlap detection — #1 scheduling friction in grassroots tournaments; few platforms do this natively
- Achievement / title system with admin-defined criteria and auto-award on condition
- Step-by-step match replay viewer (data tables already exist; frontend is the remaining work)
- Ephemeral per-match chat via SpacetimeDB event table pattern (already established in codebase)
- Referee assignment scoped per tournament (not a global role)
- Coach role (observer with cursor visibility, no action reducers)

**Defer (v2+):**
- Season leaderboards and MMR resets — defer until MMR baseline is validated and player base is established
- Double elimination bracket — implement after single elimination is stable and tested
- Group stage / round-robin — highest complexity bracket type; add last
- Automated achievement triggers — start with manual admin award
- Roster import from HoYoverse API — undocumented, unstable; manual entry first
- Computer vision score extraction from screenshots — maintenance burden outweighs value; human referee verification is more reliable and auditable

### Architecture Approach

The backend follows SpacetimeDB's established pattern: enums drive all lifecycle state machines, pure helper functions in `spacetimedb/src/helpers/` contain all complex domain logic (ELO, bracket generation, achievement checking), and reducers are thin orchestrators that validate state, call helpers, and apply mutations in a single transaction. The match result verification pipeline is a critical sequence: result submitted by both players → validationStatus transitions → referee validates → ELO updated (in same transaction) → bracket advanced → achievements checked. All of these steps happen within a single reducer call to avoid partial-state race conditions. External integrations (Imgur, Discord OAuth) remain outside SpacetimeDB; Imgur URLs are stored as strings in match result tables alongside structured score and referee decision fields.

**Major components:**
1. Tournament tables (Tournament, TournamentParticipant, TournamentReferee, BracketMatch, GroupPhaseGroup, GroupPhaseStanding) — tournament lifecycle, bracket state, participant roster
2. Match result and verification tables (MatchResult with separate screenshotUrl, score, and referee verification columns) — decoupled from MatchSessionHistory which handles pick/ban replay
3. Player tables (PlayerMmr with per-mode records + MmrHistory audit log, HsrAccount, RosterCharacter, RosterLightcone, PlayerAchievement) — ratings, ownership, progression
4. Calendar tables (AvailabilitySlot as recurrence rule rows, CalendarEvent, CalendarEventInvite) — scheduling with recurring patterns; client expands rules into calendar events
5. Infrastructure tables (LobbyChatMessage for ephemeral chat, AchievementDefinition for admin-managed criteria) — shared support systems

### Critical Pitfalls

1. **Tournament state machine via booleans instead of explicit enum** — define `TournamentStage` enum (Draft | Registration | Seeding | InProgress | Completed | Cancelled) before writing any reducer; every reducer asserts valid predecessor stage or throws
2. **ELO applied before result is verified** — add `mmrProcessedAt: timestamp | null` to match result; ELO reducer throws if already set; a separate `verify_match_result` reducer (called by referee) is the only trigger for ELO updates
3. **ELO K-factor frozen at one value** — use tiered K-factor (K=40 for first 20 verified matches, K=20 for 21-100, K=10 for 100+); store `matchesPlayedPerMode` counter on PlayerMmr from day one
4. **Anonymous play enforced at display layer only** — cursor events and match events must carry `anonymousLabel` (e.g., "Blue-1") instead of `userId` at the write layer when lobby is anonymous; verify by querying SpacetimeDB table directly
5. **Bracket state stored as JSON blob in Tournament row** — use one `BracketMatch` row per match with explicit `nextWinnerMatchId` / `nextLoserMatchId` FK columns; SpacetimeDB subscriptions operate at row granularity and JSON blobs force full tournament re-broadcast on any match update
6. **Roster visibility enforced only on the frontend** — SpacetimeDB tables are accessible to any connected client; roster subscription must use row-level filter (`WHERE userId = :sender OR visibility = 'Public'`); client-side hiding is not sufficient

---

## Implications for Roadmap

Based on the research, the milestone naturally decomposes into 7 phases ordered by hard dependencies. Backend-first is mandatory because the frontend cannot be built against tables that do not exist, and SpacetimeDB requires publishing a module before generating client bindings.

### Phase 1: Schema Foundation and Enums
**Rationale:** All state machines, FK relationships, and data contracts must be settled before any reducer is written. Schema changes after reducers are in place require module re-publish and binding regeneration, breaking the frontend. This is the most critical ordering constraint in the entire milestone.
**Delivers:** All new table definitions, new enum values (TournamentStage, TournamentFormat, MatchStatus, ValidationStatus, DisconnectPolicy, RecurrenceType, RosterVisibility, ParticipantStatus), extended `enums.ts` and `structs.ts`, and the full project file structure (`spacetimedb/src/tables/`, `reducers/`, `helpers/`)
**Addresses:** Pitfall 1 (state machine enums defined before reducers), Pitfall 3 (matchesPlayedPerMode counter in schema from day one), Pitfall 5 (BracketMatch row-per-match with explicit FK columns), Pitfall 9 (recurrence rule struct instead of flat timestamps), Pitfall 10 (visibility field on roster rows)
**Research flag:** Standard pattern — skip research phase. SpacetimeDB table definition patterns are well-established in the existing codebase.

### Phase 2: Roster Management
**Rationale:** Roster data is a prerequisite for roster-aware drafting (a tournament-phase feature). It is also the simplest new system — no inter-table dependencies beyond User — and validates the new table/reducer structure before more complex systems are built.
**Delivers:** HsrAccount, RosterCharacter, RosterLightcone tables and reducers; roster visibility enforcement at subscription level; admin upsert variants
**Uses:** Existing User table; `spacetime generate` pattern for binding refresh
**Avoids:** Pitfall 10 (roster visibility must be server-enforced, not display-layer)

### Phase 3: Tournament System Foundation
**Rationale:** Tournament, TournamentParticipant, TournamentReferee, and the full tournament lifecycle reducers must exist before bracket generation can be implemented. Depends on Roster Management (participant eligibility checks use roster data).
**Delivers:** Tournament CRUD, registration open/close, participant signup and confirmation, referee assignment per tournament, TO authorization checks
**Addresses:** Pitfall 1 (stage machine via TournamentStage enum, single `advance_tournament_stage` reducer), Security (TO authorization scoped to `tournament.createdById`)
**Research flag:** Standard pattern — skip research phase. State machine implementation is well-understood.

### Phase 4: Bracket Generation and Advancement
**Rationale:** Depends on Tournament (Phase 3) for the tournament FK and stage transitions. Bracket generation produces BracketMatch rows and must be completed before match result submission can reference specific matches.
**Delivers:** `bracketGenerator.ts` pure helper, `generate_bracket` reducer for single elimination, BracketMatch rows with explicit nextWinnerMatchId / nextLoserMatchId FKs, `advance_bracket` reducer triggered from match result validation
**Addresses:** Pitfall 5 (pre-generated bracket tree with explicit slot FKs, no race condition), Anti-Pattern 3 (bracketRound and matchNumber as explicit columns, not autoInc order)
**Research flag:** Double elimination bracket advancement mapping (round-to-losers-bracket slot table) may benefit from additional research during planning. Single elimination is standard.

### Phase 5: Match Result, Screenshot Verification, and MMR
**Rationale:** This is the most interdependent phase. MatchResult depends on MatchSessionHistory (existing) and BracketMatch (Phase 4). ELO update depends on MatchResult reaching `Validated` status. Bracket advancement (Phase 4 reducer) is triggered from within this phase's validate reducer. These three concerns must be built together in one phase to avoid partial state.
**Delivers:** MatchResult table with separate score/screenshot/referee columns; `submit_match_result` reducer; `validate_match_result` reducer (referee-only, triggers ELO update and bracket advancement); `elo.ts` pure helper; PlayerMmr and MmrHistory tables and update logic; Imgur upload Next.js API route; `IMGUR_CLIENT_ID` environment variable
**Addresses:** Pitfall 2 (ELO only after `verifiedAt` is set; `mmrProcessedAt` guard), Pitfall 3 (tiered K-factor with `matchesPlayedPerMode` counter), Pitfall 6 (idempotent ELO via `mmrProcessedAt`), Pitfall 7 (structured evidence schema: separate URL / score / referee decision columns), Integration gotcha (Imgur URL validated by regex before storing)
**Research flag:** Needs deeper research during planning — Imgur API v3 rate limits and anonymous upload behavior should be verified before implementation, as Imgur has changed these constraints before.

### Phase 6: Calendar, Scheduling, and Achievements
**Rationale:** Calendar and achievements are independent of the tournament core (they enhance it but are not required for a tournament to run). Calendar depends on User and optionally links to BracketMatch for TO scheduling. Achievements depend on PlayerMmr and MatchSessionHistory counters which are complete after Phase 5.
**Delivers:** AvailabilitySlot (recurrence rule rows), CalendarEvent, CalendarEventInvite tables and reducers; `react-big-calendar` + `date-fns` frontend integration; AchievementDefinition and PlayerAchievement tables; `achievementChecker.ts` pure helper called from `validate_match_result` end-of-reducer
**Uses:** `react-big-calendar@^1.14.x`, `date-fns@^3.x` (two new npm packages installed here)
**Avoids:** Pitfall 9 (recurrence rule struct — single row change affects all future occurrences)
**Research flag:** react-big-calendar version compatibility and date-fns localizer setup should be verified during planning (`dateFnsLocalizer` from `react-big-calendar/lib/localizers/date-fns`).

### Phase 7: Disconnect Handling, Anonymous Play, and Supporting Features
**Rationale:** These features depend on the full match/tournament system being in place. Disconnect handling extends existing LobbyStage patterns. Anonymous play requires cursor event and match event writers to be modified. Supporting features (ephemeral chat, coach role, leaderboard frontend, match replay viewer) can be added now that the data is available.
**Delivers:** DisconnectPolicy integration in `clientDisconnected` lifecycle hook; `rejoin_match` reducer; `check_disconnect_forfeits` client-callable reducer; anonymous play enforcement at cursor event write layer (anonymousLabel substitution in LobbyCursorEvent); LobbyChatMessage table and `send_chat_message` / cleanup reducers; leaderboard frontend reading PlayerMmr; bracket visualization custom SVG component; match replay viewer (reads existing MatchSessionStepHistory)
**Addresses:** Pitfall 4 (liveness check in every pick/ban/bid reducer before forfeit can race with queued calls), Pitfall 8 (anonymous play enforced at data write layer, not display layer)
**Research flag:** Standard patterns for most of this phase. Custom SVG bracket component is a build task, not a research question.

### Phase Ordering Rationale

- Schema must precede all reducers because SpacetimeDB bindings are generated from the published module; any table change forces a regeneration and potentially breaks frontend code
- Roster before Tournament because roster data is needed for roster-aware drafting eligibility, and it is the simplest system to validate the new patterns
- Tournament before Bracket because bracket rows FK to Tournament and the stage machine must be in place before bracket generation can fire the correct stage transition
- Bracket before Match Result because MatchResult rows reference BracketMatch.id; validation reducer triggers bracket advancement
- ELO in the same phase as Match Result because they share a single reducer transaction — separating them into different phases would leave a phase with partial logic that cannot be functionally tested
- Calendar and Achievements after core tournament/MMR because they are enhancements, not prerequisites; they also benefit from the match data that only exists after Phase 5 completes
- Disconnect, anonymous play, and supporting UI last because they are hardening and experience layers on top of a functioning tournament core

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (Bracket Generation):** Double elimination losers bracket slot mapping — standard round-to-losers-slot tables exist in tournament theory but the SpacetimeDB-specific pre-generated FK pattern should be planned carefully before implementation
- **Phase 5 (Match Result + MMR):** Imgur API v3 current rate limits, anonymous upload constraints, and supported file format list should be re-verified before implementation; these have changed historically
- **Phase 6 (Calendar):** react-big-calendar `dateFnsLocalizer` integration and version compatibility verification — install and test before committing to this library

Phases with standard patterns (skip research phase):
- **Phase 1 (Schema):** Pure SpacetimeDB table definition — patterns are fully established in existing codebase
- **Phase 2 (Roster):** Standard CRUD with FK to User — no novel patterns
- **Phase 3 (Tournament Foundation):** State machine enum + lifecycle reducers — well-documented in existing LobbyStage pattern
- **Phase 7 (Disconnect + Supporting):** clientDisconnected hook pattern exists; cursor anonymization is a targeted modification

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Existing stack (locked) is HIGH confidence. New additions: react-big-calendar/date-fns version numbers are MEDIUM (training cutoff Aug 2025; verify before install). Custom SVG bracket recommendation is HIGH confidence. Imgur API v3 pattern is MEDIUM (rate limits change). |
| Features | MEDIUM | Competitor analysis (Challonge, start.gg, FACEIT) is MEDIUM — training data, no live verification. Feature priority relative to the HSR-specific differentiators is HIGH confidence — derived from PROJECT.md (authoritative). |
| Architecture | HIGH | Derived directly from existing codebase patterns and SpacetimeDB determinism constraints. Table schemas, reducer patterns, and helper function structure are all grounded in working codebase evidence. |
| Pitfalls | MEDIUM-HIGH | Codebase-specific pitfalls (state machine, ELO timing, anonymous play) are HIGH. Tournament bracket race conditions and K-factor tuning are MEDIUM — general competitive gaming patterns applied to SpacetimeDB's transaction model. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Imgur API v3 current rate limits:** Re-verify before Phase 5 implementation. Anonymous IP-based limits have changed historically. If limits are too restrictive for tournament match volume, consider signed uploads or a secondary image host as fallback.
- **react-big-calendar version:** Verify current stable version and `dateFnsLocalizer` API signature before Phase 6. Library is actively maintained but minor API changes between 1.x versions are possible.
- **SpacetimeDB row-level subscription filtering:** Architecture calls for server-side roster visibility filtering. Verify that SpacetimeDB 2.0.3 supports parameterized subscription filters (WHERE clause by sender identity) before designing the roster visibility implementation; if not supported, the `RosterPublicView` pattern (separate filtered table maintained by reducers) is the fallback.
- **Double elimination grand finals reset logic:** Standard double elimination has a "grand finals reset" rule (losers bracket winner can force a bracket reset). Whether this project needs it should be a product decision made before Phase 4 bracket generation is implemented.
- **K-factor calibration:** K=40/20/10 tiering is recommended but the thresholds (20 games / 100 games) are derived from chess.com patterns. Adjust based on expected match volume and community feedback after launch.

---

## Sources

### Primary (HIGH confidence)
- `spacetimedb/src/tables/`, `spacetimedb/src/reducers/`, `spacetimedb/src/helpers/` — existing codebase patterns, reducer determinism constraints, lifecycle hooks
- `.planning/PROJECT.md` — authoritative project requirements, key decisions (Imgur, Discord OAuth, anonymous play, bracket formats)
- `.planning/codebase/ARCHITECTURE.md` and `.planning/codebase/CONCERNS.md` — existing system boundaries and known fragile areas
- ELO formula — Arpad Elo, "The Rating of Chessplayers, Past and Present" (1978); public domain deterministic math

### Secondary (MEDIUM confidence)
- react-big-calendar documentation (jquense.github.io/react-big-calendar) — React 18 compatibility and date-fns localizer pattern; version numbers as of Aug 2025 training cutoff
- Imgur API v3 documentation (apidocs.imgur.com) — anonymous upload, Client-ID pattern, rate limits; rate limits should be re-verified before implementation
- Training-data knowledge of Challonge, start.gg, FACEIT, chess.com, lichess.org — competitor feature analysis for table stakes and differentiator identification
- SpacetimeDB 2.x transaction model and subscription filter behavior — training knowledge; verify against current SpacetimeDB docs for row-level filter support

### Tertiary (LOW confidence)
- `@g-loot/react-tournament-brackets` capability and styling limitations — training knowledge; library exists but suitability assessment is inference from general React library patterns

---

*Research completed: 2026-03-15*
*Ready for roadmap: yes*
