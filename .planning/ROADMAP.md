# Roadmap: HSRPVP Competitive Platform — v0.5 Backend Milestone

## Overview

This milestone builds the complete SpacetimeDB backend for the HSRPVP competitive platform — tables, reducers, helpers, and edge case handling. Starting from the existing foundation (auth, lobbies, match sessions, cost tables), the work progresses through a strict dependency order: schema contracts first, roster management second (prerequisite for roster-aware drafting), then tournament lifecycle, bracket generation, match result and MMR in a single phase, followed by anonymous play and player stats, then achievements, calendar scheduling, lobby/chat/mouse tracking polish, and finally disconnect safety and cost table parity. No frontend is in scope. The output of this milestone is a fully published SpacetimeDB module with all tables, reducers, and helpers ready for the v1 frontend milestone to build against.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Schema Foundation** - Define all enums, structs, and table schemas before any reducer is written (completed 2026-03-16)
- [x] **Phase 2: Roster Management** - HSR account and character/lightcone ownership with server-enforced visibility (completed 2026-03-16)
- [x] **Phase 3: Tournament System** - Tournament lifecycle, participant registration, teams, and referee assignment (completed 2026-03-17)
- [x] **Phase 4: Bracket Generation** - Single/double elimination and group phase bracket rows with explicit FK advancement (completed 2026-03-18)
- [x] **Phase 04.1: Schema Normalization & Match Result Rework** - Retroactive naming cleanup and structural rework before Phase 5 (INSERTED) (completed 2026-03-20)
- [x] **Phase 5: Match Results and MMR** - Score submission, screenshot verification, ELO calculation, and leaderboard (completed 2026-03-21)
- [x] **Phase 6: Anonymous Play and Player Stats** - Server-enforced anonymous mode and full player statistics tables (completed 2026-03-22)
- [x] **Phase 06.1: Landing Page Migration** - Design tokens, NavBar, hero/features/contact sections from design reference (INSERTED) (completed 2026-03-22)
- [x] **Phase 7: Achievements and Titles** - Achievement definitions, auto-award logic, manual award, and profile titles (completed 2026-03-28)
- [x] **Phase 8: Calendar and Scheduling** - Recurring availability slots, calendar events, auto-sync, and TO scheduling (completed 2026-03-28)
- [x] **Phase 9: Mouse Tracking, Chat, and Lobby Browser** - Cursor broadcast, ephemeral chat, and lobby browsing filters (completed 2026-03-29)
- [x] **Phase 10: Disconnect Handling and Cost Parity** - Disconnect policies, rejoin logic, liveness checks, and lightcone cost fix (completed 2026-04-03)
- [x] **Phase 10.1: Match Schema Rework** - Best-of-N series, team-centric model, winnerTeamSide, tournamentId/lobbyId removal (INSERTED) (completed 2026-04-04)
- [x] **Phase 10.3: Tournament Organizer Views** - TO-scoped server-side views replacing full-table subscriptions (INSERTED) (completed 2026-04-04)
- [x] **Phase 10.4: Account Selection Per Match** - Multi-account support per match, account switching between games, drop redundant hsrAccountId (INSERTED) (completed 2026-04-04)
- [ ] **Phase 10.5: Test Suite Stabilization** - Comprehensive audit of integration test suite to fix cross-file failures, test isolation issues, and stale assertions exposed after Phase 10.4 (INSERTED)
- [ ] **Phase 11: Archetype Playstyle Stats** - PlayerArchetypeStat table, auto-increment when 3+ picks share an archetype tag, same PK pattern as stat tables

## Phase Details

### Phase 1: Schema Foundation
**Goal**: All data contracts, enums, struct types, and table schemas are settled and published before any reducer is written
**Depends on**: Nothing (first phase)
**Requirements**: SCHM-01, SCHM-02, SCHM-03
**Success Criteria** (what must be TRUE):
  1. All new enums are defined in `enums.ts` (TournamentStage, TournamentFormat, MatchResultStatus, ValidationStatus, DisconnectPolicy, RecurrenceType, RosterVisibility, ParticipantStatus, ParticipantType, GameMode extensions)
  2. All new struct types are defined in `structs.ts` (Score per game mode, RecurrenceRule, EloConfig)
  3. Every new table carries the standard audit columns (createdAt, createdBy, updatedAt, updatedBy)
  4. Module publishes to maincloud without error and `spacetime generate` produces valid client bindings
**Plans:** 2/2 plans complete
Plans:
- [ ] 01-01-PLAN.md - Define all new enums, structs, flatten LobbyConfig, update existing tables
- [ ] 01-02-PLAN.md - Create all skeleton tables, register in schema, publish and generate

### Phase 2: Roster Management
**Goal**: Players can record which HSR characters and lightcones they own, manage multiple accounts, and control roster visibility — enforced at the server level
**Depends on**: Phase 1
**Requirements**: ROST-01, ROST-02, ROST-03, ROST-04, ROST-05, ROST-06, ROST-07, ROST-08
**Success Criteria** (what must be TRUE):
  1. A player can call a reducer to create an HSR account entry, add characters with eidolon levels, and add lightcones with superimposition levels
  2. A player can mark one of their HSR accounts as active; only the active account is used for drafting eligibility
  3. A player can set roster visibility to public or private; private rosters are not returned in subscriptions to other users
  4. Roster visibility is overridden to open when a lobby or tournament enforces open-roster settings
  5. An admin can create or update roster entries on behalf of any user via a dedicated reducer
  6. A per-account rating value is stored and recalculated when roster contents change
**Plans:** 2/2 plans complete
Plans:
- [ ] 02-01-PLAN.md — Schema changes, new tables, helpers, user deletion cascade
- [ ] 02-02-PLAN.md — User and admin roster reducers, archetype CRUD, exports, docs, publish

### Phase 3: Tournament System
**Goal**: Tournament organizers can create and manage tournament lifecycle, players can register solo or as tournament-scoped teams, referees operate per-match (not per-tournament), cost sets have draft/publish workflow, and the expanded role hierarchy (Moderator, TournamentHost) is enforced
**Depends on**: Phase 2
**Requirements**: TRNT-01, TRNT-02, TRNT-03, TRNT-04, TRNT-05, TRNT-06, TRNT-07, TRNT-08, TRNT-09, TRNT-10, TRNT-11, TRNT-12, TEAM-04, TEAM-05
*(TEAM-01, TEAM-02, TEAM-03 reclassified as Out of Scope — persistent teams deferred beyond v0.5)*
**Success Criteria** (what must be TRUE):
  1. Admin can promote a user to TournamentHost or Moderator via existing admin_update_user reducer (no TO request flow)
  2. A TO can create a tournament with format, game mode, all settings, and it advances through explicit stage transitions (Draft -> Registration -> Seeding -> InProgress -> Completed/Cancelled)
  3. A player can sign up for a tournament individually; in team formats, players form tournament-scoped teams with captain/join/accept flow
  4. Referee is a per-match (per-lobby) flag, transferable within the lobby; host auto-assigned
  5. Tournament-level settings (anonymous play, roster visibility with 3 variants, disconnect policy, cost set) are stored and readable by match reducers
  6. A TO or admin can override match results and disqualify participants via explicit reducers
  7. Cost sets support draft/publish workflow with private draft tables
**Plans:** 5/5 plans complete
Plans:
- [x] 03-01-PLAN.md — Schema changes: enums (Moderator, Seeding, RosterVisibility), new tables (CostSet, drafts, TournamentTeam), cost PK expansion, permission helpers, publish --clear-database
- [x] 03-02-PLAN.md — Tournament CRUD, lifecycle, registration, tournament-scoped team reducers
- [x] 03-03-PLAN.md — Cost set management: clone, draft edit, publish, unpublish, delete, per-user views
- [x] 03-04-PLAN.md — Match result submission, referee management, tournament admin overrides, final publish + bindings
- [x] 03-05-PLAN.md — Gap closure: reclassify TEAM-01/02/03 as out of scope, implement coach reducers

### Phase 4: Bracket Generation and Advancement
**Goal**: Brackets are pre-generated as individual rows with explicit FK links, seeded correctly, and auto-advance when a match result is confirmed
**Depends on**: Phase 3
**Requirements**: BRKT-01, BRKT-02, BRKT-03, BRKT-04, BRKT-05, BRKT-06
**Success Criteria** (what must be TRUE):
  1. Calling `generate_bracket` for a single elimination tournament creates one BracketMatch row per match with correct nextWinnerMatchId FKs and no JSON blob storage
  2. Calling `generate_bracket` for a double elimination tournament creates separate winners and losers bracket rows with correct nextWinnerMatchId and nextLoserMatchId FKs
  3. Group phase tournaments produce round-robin groups with standing rows tracking wins, losses, draws, and points per participant
  4. When a match result is confirmed, the bracket auto-advances the winner to the correct next match slot without manual TO action
  5. Seeding supports both manual slot assignment and MMR-based auto-seeding
**Plans:** 3/3 plans complete
Plans:
- [ ] 04-01-PLAN.md — Schema changes: BracketSide enum, table updates (BracketMatch, Tournament, TournamentParticipant, TournamentTeam, GroupStanding), stage transition guards, auto-team creation, display name sync
- [ ] 04-02-PLAN.md — Bracket generation helpers (fold seeding, circle scheduling, snake distribution) and generate_bracket, seed_bracket, swap_seeds reducers
- [ ] 04-03-PLAN.md — Bracket advancement (advance_bracket_match, submit_and_advance_bracket, rollback_bracket_match), DQ auto-advance, architecture docs, publish + bindings

### Phase 04.1: Schema Normalization & Match Result Rework (INSERTED)

**Goal:** Normalize column naming (Blue/Red over player1/player2), rework MatchResultRecord to use MatchResultParticipant-based confirmation, add MatchType/MatchOutcome enums, restructure history tables (u32 PK, junction table), and create PlayerRelationship + MatchParticipantHistory tables before Phase 5 builds on top
**Requirements**: NORM-01, NORM-02, NORM-03, NORM-04, NORM-05, NORM-06
**Depends on:** Phase 4
**Plans:** 3/3 plans complete

Plans:
- [ ] 04.1-01-PLAN.md — Enums (MatchOutcome, MatchType), struct removal (PlayerSnapshot), all table definition changes, 2 new tables, schema registration, BracketMatchDescriptor interface rename
- [ ] 04.1-02-PLAN.md — All reducer/helper updates, admin.ts PK type fix, publish --clear-database, generate bindings, test updates, full test suite pass
- [ ] 04.1-03-PLAN.md — Documentation updates: match-results, brackets, tournament, MMR, player-stats, match-session docs, skill file, codebase map

### Phase 5: Match Results and MMR
**Goal**: Players can submit and verify match results with screenshots; validated results trigger ELO updates and bracket advancement atomically in one transaction
**Depends on**: Phase 04.1
**Requirements**: MTCH-01, MTCH-02, MTCH-03, MTCH-04, MTCH-05, MTCH-06, MTCH-07, MTCH-08, MTCH-09, MMR-01, MMR-02, MMR-03, MMR-04, MMR-05, MMR-06, MMR-07
**Deferred from Phase 4 UAT**: Tests 9, 10, 11, 12 require MatchResultRecord creation which doesn't exist until Phase 5. Retest as part of Phase 5 UAT once match result reducers are implemented:
  - Test 9: Advance Bracket Match (needs MatchResultRecord to set BracketMatch.winnerTeamId)
  - Test 10: Submit and Advance Bracket (needs MatchResultRecord creation)
  - Test 11: Rollback Bracket Match (needs MatchResultRecord with winnerUserId)
  - Test 12: DQ Auto-Advance (testable in isolation but full verification needs match results)
**Success Criteria** (what must be TRUE):
  1. Both players can submit a score in the correct game-mode format (cycles for MoC/AA, score for Apocalyptic Shadow) with optional per-boss breakdown and Imgur screenshot URL
  2. A casual match auto-confirms when both players submit matching scores; mismatched scores set status to Disputed
  3. A tournament match requires a referee or admin to call `validate_match_result` before the result is confirmed; disputed results can be rejected
  4. ELO is only updated after a result reaches Validated status; `mmrProcessedAt` guard prevents any result from being processed twice
  5. Each player's per-game-mode MMR is stored with a tiered K-factor (K=40 first 20 matches, K=20 for 21-100, K=10 for 100+); `matchesPlayedPerMode` counter is tracked from first match
  6. A global composite MMR (equal-weight average across game modes) is stored alongside per-mode ratings
  7. An MMR history row is written for every rating change with a reference to the source match
  8. A leaderboard table or view is queryable sorted by per-mode MMR and by global composite MMR; schema includes seasonId column
**Plans:** 2/2 plans complete

Plans:
- [x] 05-01-PLAN.md — Schema additions (EloConfig table, Leaderboard table, accountRating column), record_game_scores reducer, ELO admin reducers, Casual auto-validation in submit_match_result, Ranked screenshot gate in override_match_result
- [x] 05-02-PLAN.md — ELO calculation helpers, stats increment helpers, leaderboard rebuild, finalize_match_result implementation, process_tournament_mmr implementation, publish + bindings, doc updates

### Phase 6: Anonymous Play and Player Stats
**Goal**: Anonymous mode is enforced at the data write layer, and complete player statistics are tracked and queryable
**Depends on**: Phase 5
**Requirements**: ANON-01, ANON-02, ANON-03, ANON-04, STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07, STAT-08
**Success Criteria** (what must be TRUE):
  1. When a lobby or match has anonymous mode enabled, cursor events and match events carry an anonymousLabel (e.g., "Blue-1") instead of userId at the write layer — not just at display
  2. Tournament-level anonymous play default is inherited by individual matches; a match-level override can change it
  3. Open/closed roster visibility toggle operates independently of anonymous name settings
  4. A player's win count, loss count, match count, and win rate are tracked in a stats table updated on each confirmed match result
  5. Matches spectated count is tracked per player
  6. Best Ally (userId with most shared wins) and Nemesis (userId with most losses against) are computable from stored match data
  7. Per-character win rate, loss rate, and character-vs-character win ratio are tracked in a character stats table
  8. Match history supports step-by-step replay by reading MatchSessionStepHistory; final result with game-mode-specific scoring is readable from the match result table
**Plans:** 3 plans

Plans:
- [x] 06-01-PLAN.md — Schema foundation: PK expansions (PlayerStat, PlayerCharacterStat, PlayerRelationship, MmrRating, Leaderboard), column changes (Lobby, LobbyCursorEvent, MatchSessionStep, MatchSessionHistory, MatchSessionStepHistory, MatchParticipantHistory), 4 new tables (Season, GlobalCharacterStat, TournamentPlayerAccount, MatchResultGameHistory), Season admin reducers, publish --clear-database
- [x] 06-02-PLAN.md — Anonymous play helpers (label computation, ownership validation), broadcast_cursor anonymous enforcement, roster/stat visibility views, TournamentPlayerAccount wiring into registration
- [x] 06-03-PLAN.md — Finalization pipeline rewrite (18-step shared helper), character/global stat increments, match replay archival, auto-finalize casual, publish + doc updates

### Phase 06.1: Landing Page Migration (INSERTED)

**Goal:** Migrate the designed landing page from the reference project into HSRPVP, replacing the existing Header and landing page with a new NavBar, video hero, feature carousel, and contact section -- integrating the design token system and auth context
**Requirements**: LP-INFRA, LP-NAV, LP-SECTIONS, LP-PAGE
**Depends on:** Phase 6
**Plans:** 2/2 plans complete

Plans:
- [x] 06.1-01-PLAN.md — Design tokens, fonts, video asset, NavBar + Logo + GearIcon components, Header replacement in all layouts
- [x] 06.1-02-PLAN.md — HeroSection, FeaturesSection, ContactSection migration with icon-lucide SVG conversion, landing page composition, visual checkpoint

### Phase 7: Achievements and Titles
**Goal**: Admins can define achievements with flexible criteria, the system auto-awards them during match finalization, TOs/admins can manually award, and players can display earned titles on their profile
**Depends on**: Phase 6
**Requirements**: ACHV-01, ACHV-02, ACHV-03, ACHV-04
**Success Criteria** (what must be TRUE):
  1. An admin can create an achievement definition with name, description, criteria type (e.g., wins threshold), and threshold value
  2. At the end of a `validate_match_result` call, an achievement checker runs and inserts a PlayerAchievement row for any newly satisfied thresholds
  3. An admin or TO can call a reducer to manually award an achievement to a specific player
  4. A player can read their collected achievements and call a reducer to set which title is displayed on their profile
**Plans:** 2/2 plans complete

Plans:
- [x] 07-01-PLAN.md — Schema rework: drop AchievementTriggerType enum, add ComparisonOperator enum, rework Achievement/UserAchievement tables, create AchievementCriteria table, publish --clear-database
- [x] 07-02-PLAN.md — Achievement checker helper, 7 CRUD/award/title reducers, finalization pipeline hook at step 16.5, architecture docs rewrite, publish + bindings

### Phase 8: Calendar and Scheduling
**Goal**: Players can record recurring availability, view others' calendars, find common windows, and tournament organizers can schedule matches via calendar events
**Depends on**: Phase 1
**Requirements**: CAL-01, CAL-02, CAL-03, CAL-04, CAL-05
**Success Criteria** (what must be TRUE):
  1. A player can create recurring availability slot rows with a RecurrenceRule struct (daily, weekly, monthly with February edge case handling); a single row change updates all future occurrences
  2. A player can subscribe to up to 5 other players' availability slots; those slots are visible only when the target player has enabled calendar sharing
  3. A common-availability query or view returns time windows where all selected players have overlapping availability
  4. A player can create a CalendarEvent and invite other players; invitees can accept or decline
  5. A TO can create calendar events linked to tournament matches and send invites to participants
**Plans:** 2/2 plans complete

Plans:
- [x] 08-01-PLAN.md — Schema modifications (InviteStatus enum, description column, inviteStatus+respondedAt columns), calendar cleanup and cascade helpers, 12 standalone calendar reducers (availability CRUD, saved calendar CRUD, event CRUD + invites, invite response), publish + bindings
- [x] 08-02-PLAN.md — Cross-feature cascade integrations (cancel_tournament, rollback_bracket_match, dq_participant, withdraw_from_tournament, user deletion), architecture doc update, publish + tests

### Phase 9: Mouse Tracking, Chat, and Lobby Browser
**Goal**: Full lobby lifecycle (create/join/leave/close), complete draft system (Classic + Auction), post-draft flow (equip/arrange/confirm), ephemeral chat, cursor broadcast refinement, lobby browser, per-client anonymous views, and all schema changes enabling deferred tests from Phases 3/4/5/7
**Depends on**: Phase 6
**Requirements**: MOUS-01, MOUS-02, MOUS-03, CHAT-01, CHAT-02, CHAT-03, LBBY-01, LBBY-02
**Deferred from Phase 3 UAT**: Tests 12, 13, 14, 15, 17 require prerequisite state that doesn't exist yet — lobby members (no lobby CRUD reducers) and MatchResultRecord rows (no insert reducer). Retest as part of Phase 9 UAT once lobby lifecycle reducers are implemented:
  - Test 12: Referee Transfer & Reclaim (needs lobby + members)
  - Test 13: Match Score Confirmation & Submission (needs MatchResultRecord + lobby referee)
  - Test 14: Match Dispute (needs MatchResultRecord in Submitted status)
  - Test 15: Tournament Admin Operations (override_match_result needs MatchResultRecord; dq + assistants testable but deferred for full coverage)
  - Test 17: Coach Role Management (needs lobby + members)
**Deferred from Phase 4 UAT**:
  - Bracket display slot order: `placeParticipantInNextMatch` uses first-empty-slot, not seed order. R2+ slots may flip vs traditional bracket convention. Frontend should sort by `TournamentTeam.seedNumber` for display, not by team1Id/team2Id slot position.
  - Tests 9-12 (advance/submit_and_advance/rollback bracket match, DQ auto-advance): require MatchResultRecord creation which depends on lobby lifecycle
**Deferred from Phase 5 UAT**: Tests 3-14 require MatchResultRecord, Lobby, LobbyMember prerequisite data that only exists once lobby lifecycle reducers are implemented:
  - Test 3: Score Entry (Captain — Own Side)
  - Test 4: Score Entry (Spectator Referee Full Control)
  - Test 5: Casual Match Auto-Validation
  - Test 6: Ranked Screenshot Gate
  - Test 7: Finalize Casual Match (Full Lifecycle)
  - Test 8: Finalize Standalone Ranked Match (Full Lifecycle)
  - Test 9: ELO Rating Correctness
  - Test 10: Global Composite MMR
  - Test 11: Leaderboard Top 100
  - Test 12: mmrProcessedAt Double-Processing Guard
  - Test 13: Tournament Batch MMR
  - Test 14: Bracket Advancement via Finalization (MTCH-08)
**Deferred from Phase 7 UAT**: Auto-award via finalization requires full match lifecycle (lobby -> match -> scores -> finalize) to trigger `checkAndAwardAchievements` at step 16.5:
  - Test 11: Auto-Award via Finalization Pipeline (achievement checker fires after stat increments, inserts UserAchievement for satisfied criteria)
**Success Criteria** (what must be TRUE):
  1. A player's full XY cursor position is broadcast via reducer while their browser tab is active; the position is visible in subscriptions to all match participants, spectators, and coaches
  2. A coach role player can see cursor tracking data but calling any pick/ban reducer as a coach is rejected with an authorization error
  3. Chat messages are written to an event table per lobby/match; messages are not persisted to a permanent table and are cleaned up in the same transaction as lobby close
  4. Chat message rows carry a flexible metadata field to support future rich content (emoji, formatting) without schema migration
  5. A lobby list table or view supports filtering by game mode, match status, and player count; lobby visibility (public, private, invite-only) is enforced at the subscription level
**Plans:** 9/9 plans complete
Plans:
- [x] 09-01-PLAN.md — Schema foundation: enum changes (LobbyStage +Equipping/Scoring, BanMode -Two, ActionType +3), struct updates (LobbyConfigSnapshot dual budgets, new payloads), table mods (Lobby, LobbyMember, MatchSession, history tables), 4 new tables (LobbyBan, LobbyPreset, TournamentStandIn, LobbyGcJob), publish --clear-database
- [x] 09-02-PLAN.md — Lobby lifecycle: lobbyHelpers.ts + anonymousHelpers.ts shared validation, 6 reducers (create/join/leave/close/kick/ban), one-lobby-per-user, guest restrictions, cascade delete
- [x] 09-03-PLAN.md — Chat + cursor + browser: send/delete chat with rolling window + metadata validation, cursor spectator silencing, projected view_lobby_browser with finished exclusion
- [x] 09-04-PLAN.md — Lobby settings + ready-up + presets: update_lobby_settings (Waiting-only), set_team_slot, confirm/unconfirm ready, set_captain, LobbyPreset CRUD with permission hierarchy
- [x] 09-05-PLAN.md — Tournament lobby + stand-in + GC: create_tournament_lobby with settings inheritance, approve_stand_in, scheduled lobby GC reducer (30-min idle cleanup)
- [x] 09-06-PLAN.md — Classic draft: draftSequences.ts (0/4/6 ban), start_draft (match state init), pick/ban/timer_expiry with coach guard + ownership validation + mirror picks, undo/pause/resume
- [x] 09-07-PLAN.md — Auction draft: nominate/bid/pass/timer_expiry with steal-skip logic, dual budget enforcement, minimum raise, EMPTY CHARACTER fallback
- [x] 09-08-PLAN.md — Post-draft + finalization + views: equip_lightcone/arrange_lineup/confirm_lineup/advance_stage, finalization pipeline updates (new ActionTypes, budget columns, targetName rename, role flags, isPubliclyVisible), 5 per-client anonymous/history views
- [x] 09-09-PLAN.md — Doc rewrites + test fixes: full rewrite of match-session/architecture.md, updates to chat/lobby/match-results/views docs, test file field name updates

### Phase 10: Disconnect Handling and Cost Parity
**Goal**: Disconnect behavior is configurable and safe (Standard/Deferred/NoAction policies), rejoins preserve full match state across all active stages, concede/forfeit/defer reducers handle early match endings with a 3-tier finalization matrix, admin toolbox resolves stuck AwaitingResult matches, and all pick/ban reducers are guarded against post-concede action
**Depends on**: Phase 9
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, COST-01
**Success Criteria** (what must be TRUE):
  1. A tournament or lobby can be configured with a DisconnectPolicy (Standard, Deferred, or NoAction); the clientDisconnected lifecycle hook detects disconnects and triggers auto-pause + flag transfers for Standard/Deferred policies
  2. A player who disconnects and reconnects via join_lobby receives full match state in Drafting, Equipping, Scoring, and AwaitingResult stages without corruption or duplicate entries
  3. Every pick/ban/equip/score reducer begins with an ensureMatchAlive liveness check that rejects the call if the match has been conceded
  4. Disconnect forfeit uses the timestamp-check pattern: per-player disconnectedAt is written at disconnect time, and claim_forfeit computes eligibility at call time rather than running a timer
  5. COST-01 already complete: HsrLightconeCost PK is ['lightconeName', 'gameMode', 'costSetId'] — no work needed
**Plans:** 2/2 plans complete

Plans:
- [x] 10-01-PLAN.md — Schema changes (enum renames, new ConcedeTrigger enum, LobbyMember disconnect columns, MatchResultRecord concede columns), new helpers (disconnectHelpers, flagTransferHelpers), clientDisconnected extension, ensureMatchAlive guard in all reducers, join_lobby reconnect extension, leave_lobby active-match handling, GC + hardDeleteLobby extension, publish --clear-database
- [x] 10-02-PLAN.md — Concede/forfeit/defer reducers (concede_match, claim_forfeit, defer_match), concede finalization matrix branching in runFinalization (3 tiers x 3 stages), admin toolbox (admin_force_finalize, admin_void_match, admin_set_bracket_winner), auto-concede wiring in leave_lobby, architecture + contract doc updates

### Phase 10.1: Match Schema Rework — Multi-Draft, Team-Centric Model, winnerTeamSide (INSERTED)

**Goal:** Six structural fixes before frontend: (A) rename GroupStanding -> GroupPhaseRecord, (B) best-of-N multi-draft with BetweenGames/Shelved stages and series management reducers, (C) replace TournamentParticipant with TournamentEnrolled + TournamentTeamMember with captain-transfer on DQ/withdrawal, (D) replace winnerUserId with winnerTeamSide + rename MatchOutcome -> MatchEndReason, (E) wire ParticipantStatus lifecycle (CheckedIn/Active/Eliminated), (F) remove tournamentId from MatchResultRecord and lobbyId from BracketMatch
**Requirements**: D-01 through D-44 (44 decisions from discuss-phase)
**Depends on:** Phase 10
**Success Criteria** (what must be TRUE):
  1. GroupPhaseRecord table exists (renamed from GroupStanding), all references updated
  2. Best-of-N series works: Lobby.bestOf, MatchSession tracks currentGameNumber/gamesWon, advance_to_next_game/shelve_series/resume_series reducers functional, GC skips Shelved lobbies
  3. TournamentEnrolled + TournamentTeamMember replace TournamentParticipant; captain-transfer on DQ/withdrawal; DQ during active/shelved lobby handled
  4. MatchResultRecord uses winnerTeamSide (TeamSide?) and matchEndReason (MatchEndReason: Completed/Draw/Concede); winnerUserId and MatchOutcome eliminated
  5. check_in_tournament reducer works; advance to InProgress sets Active status; bracket loss sets Eliminated status
  6. tournamentId removed from MatchResultRecord (derived from bracketMatch); lobbyId removed from BracketMatch (navigate via Lobby.bracketMatchId)
  7. All tests pass, module published to maincloud, bindings generated, docs updated
**Plans:** 6/6 plans complete

Plans:
- [x] 10.1-01-PLAN.md — Schema foundation: enum changes (MatchEndReason, LobbyStage +BetweenGames/Shelved, TournamentStage +CheckIn), table renames (GroupPhaseRecord), new tables (TournamentEnrolled, TournamentTeamMember), column changes (winnerTeamSide, matchEndReason, bestOf, series tracking, gameNumber), column removals (tournamentId from MatchResultRecord, lobbyId from BracketMatch), schema.ts registration
- [x] 10.1-02-PLAN.md — Finalization pipeline + bracket system migration: winnerTeamSide in 6+ pipeline steps, matchEndReason, tournamentId derivation, GroupPhaseRecord rename, TournamentTeamMember, Eliminated status wiring
- [x] 10.1-03-PLAN.md — Tournament rewiring: TournamentEnrolled + TournamentTeamMember across registration, teams, admin, helpers, lobby, calendar, deletion (14 source files), captain-transfer helper, DQ lobby-aware handling
- [x] 10.1-04-PLAN.md — Match reducer migration: concede, admin tools, submit, draft, finalization MMR — winnerTeamSide, matchEndReason, tournamentId removal, series column initialization, process_tournament_mmr query rewrite
- [x] 10.1-05-PLAN.md — New features: series management reducers (advance/shelve/resume), GC Shelved/BetweenGames extensions, concede in BetweenGames, check-in reducer, tournament stage transitions (CheckIn, Active), bestOf wiring, post-draft series logic
- [x] 10.1-06-PLAN.md — Tests (15 files, 122+ occurrences), architecture docs (4 files), publish --clear-database, generate bindings, full test suite green

### Phase 10.3: Tournament Organizer Views (INSERTED)

**Goal:** Server-side SpacetimeDB views scoped to tournament organizers — replacing 5+ full-table client subscriptions with targeted TO-scoped views to reduce bandwidth
**Depends on:** Phase 10.1 (TournamentEnrolled/TournamentTeamMember model, bracket_match_id indexes)
**Requirements**: TO-VIEW-01, TO-VIEW-02, TO-VIEW-03
**Success Criteria** (what must be TRUE):
  1. `view_my_tournaments` returns tournaments where caller is organizerId or tournament assistant
  2. `view_tournament_dashboard` returns aggregated participant count, team count, bracket match status for a given tournament in one subscription
  3. `view_tournament_match_status` returns bracket matches with their current lobby stage and result status in one row per match
  4. All views use btree indexes (no iter() scans on large tables)
**Plans:** 1/1 plans complete
Plans:
- [x] 10.3-01-PLAN.md — getMyTournamentIds shared helper, 8 TO-scoped views (tournaments, enrolled, teams, team members, matches, match results, lobbies, group standings), architecture docs, publish + bindings

### Phase 10.4: Account Selection Per Match (INSERTED)

**Goal:** Players choose which enrolled HSR account(s) to use per match. Tournament setting controls whether 1 or multiple accounts are allowed per player per match (default: 1). Multi-account mode enables asymmetric formats like 1v2 where one player drafts from 2 accounts. Account selection happens at lobby join for tournament lobbies and is changeable between games in best-of-N series. Drop redundant `TournamentEnrolled.hsrAccountId`. Stand-ins select account on lobby join (same flow).
**Depends on:** Phase 10.1 (TournamentEnrolled/TournamentTeamMember, TournamentPlayerAccount, series management)
**Requirements**: ACCT-01, ACCT-02, ACCT-03, ACCT-04, ACCT-05
**Success Criteria** (what must be TRUE):
  1. `Tournament.maxAccountsPerPlayer` (u8, default 1) controls how many HSR accounts a player can activate per match
  2. `LobbyMember.selectedAccountIds` tracks which account(s) a player has activated for this match — validated against `TournamentPlayerAccount` for tournament lobbies
  3. `select_tournament_account` reducer lets a player choose/change account(s) during Waiting and BetweenGames stages, validated against enrolled accounts and the maxAccountsPerPlayer limit
  4. `validateCharacterOwnership` checks only the player's selected account(s), not all locked accounts
  5. `TournamentEnrolled.hsrAccountId` column removed (redundant with TournamentPlayerAccount)
  6. For casual (non-tournament) lobbies, account selection uses the player's currently active account (existing behavior)
  7. Stand-ins select account on lobby join using the same `select_tournament_account` flow
**Plans:** 3/3 plans complete
Plans:
- [x] 10.4-01-PLAN.md — Schema foundation: LobbyMemberAccount table, Tournament.maxAccountsPerPlayer, TournamentEnrolled.hsrAccountId removal, HsrAccount/HsrAccountCharacter privacy, select_match_account reducer
- [x] 10.4-02-PLAN.md — Cascade wiring: join_lobby auto-create, leave_lobby cascade, hardDeleteLobby cascade, deletion guards, ownership validation refactor, start_draft gate
- [x] 10.4-03-PLAN.md — Views + docs: roster visibility update + anon fix, 3 new views, architecture + contract docs, publish --clear-database, generate bindings

### Phase 10.5: Test Suite Stabilization (INSERTED)

**Goal:** Audit and stabilize the integration test suite so the full suite (`npm run test:all`) runs green end-to-end. Phase 10.4 exposed multiple cross-file interference issues (DB state pollution, missing cleanup, sequential dependencies) that don't appear when tests run in isolation. Address them systematically rather than patching each failure as it arises.
**Depends on:** Phase 10.4 (all schema + test migration in place)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria** (what must be TRUE):
  1. `npm run test:all` passes with 0 failures and 0 cross-file interference skips on a fresh `--clear-database` + bootstrap
  2. Every test file that creates lobbies/tournaments cleans them up in `afterAll` (close_lobby, cancel_tournament, disconnect harnesses) — no stale rows left for the next file
  3. Test files with sequential dependencies on shared DB state (e.g. ELO config seeding in mmr-stats) are either self-contained (seed their own dependencies) or explicitly documented in test-ordering docs
  4. Integration test harness helpers (`ensureHsrAccount`, `promoteUser`, etc.) are extracted to `test/shared/` so they don't drift across duplicate copies in individual test files
  5. Full suite runtime is documented with a baseline — regression detection in future phases
  6. Test failure reports distinguish "file passes in isolation but fails in suite" from "file fails in isolation" — cross-file bugs get fixed at suite level, not per-file
**Plans:** 1/5 plans executed
Plans:
- [x] 10.5-01-PLAN.md — Capture baseline failure inventory + AUDIT.md seed + test/README runtime entry
- [ ] 10.5-02-PLAN.md — Extract ~70 inline test helpers to test/shared/helpers/ (8 domain files)
- [ ] 10.5-03-PLAN.md — Add strict afterAll cleanup to 13 RED-category test files (D-03)
- [ ] 10.5-04-PLAN.md — Bisect cross-file failures + fix root causes (D-01) until test:all is green
- [ ] 10.5-05-PLAN.md — Finalize AUDIT.md lessons learned + post-fix runtime baseline

### Phase 11: Archetype Playstyle Stats
**Goal**: Track playstyle stats when 3+ picks in a draft share an archetype tag; auto-increment during finalization pipeline
**Depends on**: Phase 6 (player stats infrastructure), Phase 2 (archetype tables)
**Requirements**: ARCH-01, ARCH-02
**Success Criteria** (what must be TRUE):
  1. PlayerArchetypeStat table exists with same PK pattern as other stat tables (userId, gameMode, draftMode, seasonId, matchType, teamSize, archetypeId)
  2. During finalization, if a player's picked characters include 3+ that share an archetype tag, the corresponding PlayerArchetypeStat row is incremented
  3. Stats track matches played, wins, losses per archetype per player
**Plans:** 1 plan
Plans:
- [ ] 11-01-PLAN.md — [To be planned]

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 04.1 -> 5 -> 6 -> 06.1 -> 7 -> 8 -> 9 -> 10 -> 10.1 -> 10.3 -> 10.4 -> 11

Note: Phase 8 (Calendar) depends only on Phase 1 schema and can be parallelized with Phases 3-7 if needed, but serial execution is the default.
Note: Phase 10.2 (tournamentId/lobbyId removal) was completed inside Phase 10.1 as Scope F.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Schema Foundation | 2/2 | Complete   | 2026-03-16 |
| 2. Roster Management | 2/2 | Complete   | 2026-03-16 |
| 3. Tournament System | 5/5 | Complete   | 2026-03-17 |
| 4. Bracket Generation | 3/3 | Complete   | 2026-03-18 |
| 04.1. Schema Normalization | 3/3 | Complete    | 2026-03-20 |
| 5. Match Results and MMR | 2/2 | Complete | 2026-03-21 |
| 6. Anonymous Play and Player Stats | 3/3 | Complete | 2026-03-22 |
| 06.1. Landing Page Migration | 2/2 | Complete    | 2026-03-22 |
| 7. Achievements and Titles | 2/2 | Complete   | 2026-03-28 |
| 8. Calendar and Scheduling | 2/2 | Complete   | 2026-03-28 |
| 9. Mouse Tracking, Chat, and Lobby Browser | 9/9 | Complete   | 2026-03-29 |
| 10. Disconnect Handling and Cost Parity | 2/2 | Complete   | 2026-04-04 |
| 10.1. Match Schema Rework | 6/6 | Complete    | 2026-04-04 |
| 10.3. Tournament Organizer Views | 1/1 | Complete    | 2026-04-04 |
| 10.4. Account Selection Per Match | 3/3 | Complete    | 2026-04-04 |
| 11. Archetype Playstyle Stats | 0/? | Not started | - |

