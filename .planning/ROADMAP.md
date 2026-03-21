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
- [ ] **Phase 5: Match Results and MMR** - Score submission, screenshot verification, ELO calculation, and leaderboard
- [ ] **Phase 6: Anonymous Play and Player Stats** - Server-enforced anonymous mode and full player statistics tables
- [ ] **Phase 7: Achievements and Titles** - Achievement definitions, auto-award logic, manual award, and profile titles
- [ ] **Phase 8: Calendar and Scheduling** - Recurring availability slots, calendar events, auto-sync, and TO scheduling
- [ ] **Phase 9: Mouse Tracking, Chat, and Lobby Browser** - Cursor broadcast, ephemeral chat, and lobby browsing filters
- [ ] **Phase 10: Disconnect Handling and Cost Parity** - Disconnect policies, rejoin logic, liveness checks, and lightcone cost fix

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
**Plans:** 2 plans

Plans:
- [ ] 05-01-PLAN.md — Schema additions (EloConfig table, Leaderboard table, accountRating column), record_game_scores reducer, ELO admin reducers, Casual auto-validation in submit_match_result, Ranked screenshot gate in override_match_result
- [ ] 05-02-PLAN.md — ELO calculation helpers, stats increment helpers, leaderboard rebuild, finalize_match_result implementation, process_tournament_mmr implementation, publish + bindings, doc updates

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
**Plans:** 2 plans
Plans:
- [ ] 06-01-PLAN.md — [To be planned]
- [ ] 06-02-PLAN.md — [To be planned]

### Phase 7: Achievements and Titles
**Goal**: Admins can define achievements, the system auto-awards them on condition, and players can display earned titles on their profile
**Depends on**: Phase 6
**Requirements**: ACHV-01, ACHV-02, ACHV-03, ACHV-04
**Success Criteria** (what must be TRUE):
  1. An admin can create an achievement definition with name, description, criteria type (e.g., wins threshold), and threshold value
  2. At the end of a `validate_match_result` call, an achievement checker runs and inserts a PlayerAchievement row for any newly satisfied thresholds
  3. An admin or TO can call a reducer to manually award an achievement to a specific player
  4. A player can read their collected achievements and call a reducer to set which title is displayed on their profile
**Plans:** 2 plans
Plans:
- [ ] 07-01-PLAN.md — [To be planned]
- [ ] 07-02-PLAN.md — [To be planned]

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
**Plans:** 2 plans
Plans:
- [ ] 08-01-PLAN.md — [To be planned]
- [ ] 08-02-PLAN.md — [To be planned]

### Phase 9: Mouse Tracking, Chat, and Lobby Browser
**Goal**: Full cursor broadcast works for all match roles, ephemeral chat is available per lobby, and players can browse and filter available lobbies
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
**Success Criteria** (what must be TRUE):
  1. A player's full XY cursor position is broadcast via reducer while their browser tab is active; the position is visible in subscriptions to all match participants, spectators, and coaches
  2. A coach role player can see cursor tracking data but calling any pick/ban reducer as a coach is rejected with an authorization error
  3. Chat messages are written to an event table per lobby/match; messages are not persisted to a permanent table and are cleaned up in the same transaction as lobby close
  4. Chat message rows carry a flexible metadata field to support future rich content (emoji, formatting) without schema migration
  5. A lobby list table or view supports filtering by game mode, match status, and player count; lobby visibility (public, private, invite-only) is enforced at the subscription level
**Plans:** 2 plans
Plans:
- [ ] 09-01-PLAN.md — [To be planned]
- [ ] 09-02-PLAN.md — [To be planned]

### Phase 10: Disconnect Handling and Cost Parity
**Goal**: Disconnect behavior is configurable and safe, rejoins preserve full match state, and pick/ban reducers are guarded against post-forfeit action; lightcone cost table gains game-mode parity with character costs
**Depends on**: Phase 5
**Requirements**: DISC-01, DISC-02, DISC-03, DISC-04, COST-01
**Success Criteria** (what must be TRUE):
  1. A tournament or lobby can be configured with a DisconnectPolicy (pause, timer+forfeit, or no action); the policy is read by the `clientDisconnected` lifecycle hook and the correct behavior executes
  2. A player who disconnects and reconnects can call `rejoin_match` and receive full match state without corruption or duplicate entries
  3. Every pick/ban reducer begins with a liveness check that rejects the call if the match has been forfeited or ended since the action was queued
  4. Disconnect forfeit uses the timestamp-check pattern: `disconnectForfeitAt` is written when the timer starts, and the next reducer call checks it rather than running a timer
  5. HsrLightconeCost table gains a gameMode column as part of its primary composite key, matching the structure of HsrCharacterCost
**Plans:** 2 plans
Plans:
- [ ] 10-01-PLAN.md — [To be planned]
- [ ] 10-02-PLAN.md — [To be planned]

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 04.1 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10

Note: Phase 8 (Calendar) depends only on Phase 1 schema and can be parallelized with Phases 3-7 if needed, but serial execution is the default.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Schema Foundation | 2/2 | Complete   | 2026-03-16 |
| 2. Roster Management | 2/2 | Complete   | 2026-03-16 |
| 3. Tournament System | 5/5 | Complete   | 2026-03-17 |
| 4. Bracket Generation | 3/3 | Complete   | 2026-03-18 |
| 04.1. Schema Normalization | 3/3 | Complete    | 2026-03-20 |
| 5. Match Results and MMR | 0/2 | Planned | - |
| 6. Anonymous Play and Player Stats | 0/? | Not started | - |
| 7. Achievements and Titles | 0/? | Not started | - |
| 8. Calendar and Scheduling | 0/? | Not started | - |
| 9. Mouse Tracking, Chat, and Lobby Browser | 0/? | Not started | - |
| 10. Disconnect Handling and Cost Parity | 0/? | Not started | - |
