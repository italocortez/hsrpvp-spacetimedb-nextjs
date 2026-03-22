---
phase: 04-bracket-generation-and-advancement
plan: "01"
subsystem: database
tags: [spacetimedb, tournament, bracket, schema, enums, stage-transitions]

# Dependency graph
requires:
  - phase: 03-tournament-system
    provides: Tournament, TournamentParticipant, TournamentTeam, BracketMatch, GroupStanding, MatchResultRecord tables + management/registration reducers
provides:
  - BracketSide enum with 5 variants (Winners, Losers, GrandFinals, ThirdPlace, Group)
  - BracketMatch updated: bracketSide replaces isLosersBracket
  - Tournament updated: groupSize, has3rdPlaceMatch, autoAdvanceBracket columns
  - TournamentTeam updated: seedNumber column added
  - TournamentParticipant updated: seedNumber removed, allowRandomTeamAssignment added
  - GroupStanding updated: participantTeamId replaces participantUserId
  - MatchResultParticipant junction table for 2v2/3v3 match participant tracking
  - Stage transition guards: validateRegistrationToSeeding, validateSeedingToInProgress
  - Solo tournament auto-team creation on register_for_tournament
  - Display name lazy sync to TournamentTeam.name for active solo non-anonymous tournaments
affects:
  - 04-02: generate_bracket reducer depends on BracketSide enum and updated schema
  - 04-03: bracket_advancement reducers depend on bracketSide column

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Stage transition guard pattern — dedicated helper functions called in advance_tournament_stage before the DB update
    - Auto-team creation at registration — solo players get an invisible TournamentTeam row linked via teamGroupId
    - Lazy sync — displayName changes propagate to TournamentTeam.name for active solo non-anonymous tournaments

key-files:
  created:
    - spacetimedb/src/tables/matchResultParticipant.ts
  modified:
    - spacetimedb/src/types/enums.ts
    - spacetimedb/src/tables/bracketMatch.ts
    - spacetimedb/src/tables/tournament.ts
    - spacetimedb/src/tables/tournamentParticipant.ts
    - spacetimedb/src/tables/tournamentTeam.ts
    - spacetimedb/src/tables/groupStanding.ts
    - spacetimedb/src/schema.ts
    - spacetimedb/src/helpers/tournamentHelpers.ts
    - spacetimedb/src/reducers/tournamentManagement.ts
    - spacetimedb/src/reducers/tournamentRegistration.ts
    - spacetimedb/src/reducers/profile.ts

key-decisions:
  - "bracketSide (BracketSide enum) replaces isLosersBracket (bool) on BracketMatch — supports GrandFinals, ThirdPlace, Group match types not expressible as a bool"
  - "seedNumber moved from TournamentParticipant to TournamentTeam — seeding is a team-level concept, not per-player"
  - "GroupStanding uses participantTeamId instead of participantUserId — standings track teams, not individual users"
  - "Solo tournament registration auto-creates TournamentTeam with teamGroupId — bracket generation treats all participants as teams uniformly"
  - "allowRandomTeamAssignment default false on TournamentParticipant insert — opt-in behavior for future team auto-assignment feature"
  - "MatchResultParticipant junction table added for 2v2/3v3 tracking — MatchResultRecord only holds 2 userIds (player1Id/player2Id)"

patterns-established:
  - "Stage guard pattern: export function validateX(ctx, tournamentId) throws SenderError — called in advance_tournament_stage between validateStageTransition and the DB update"
  - "Auto-team insert: solo tournaments get TournamentTeam row on register_for_tournament; teamGroupId is updated via delete+re-insert composite PK pattern"

requirements-completed:
  - BRKT-05
  - BRKT-06

# Metrics
duration: 30min
completed: 2026-03-18
---

# Phase 4 Plan 01: Schema Foundation for Bracket Generation Summary

**BracketSide enum + 7 table schema changes + stage transition guards + solo auto-team creation + display name sync for bracket generation foundation**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-18T13:44:00Z
- **Completed:** 2026-03-18T14:14:48Z
- **Tasks:** 2
- **Files modified:** 11

## Accomplishments

- Added BracketSide enum (5 variants: Winners, Losers, GrandFinals, ThirdPlace, Group) replacing isLosersBracket bool on BracketMatch
- Updated 5 table schemas: Tournament (3 new columns), TournamentParticipant (seedNumber removed, allowRandomTeamAssignment added), TournamentTeam (seedNumber added), GroupStanding (participantTeamId), BracketMatch (bracketSide)
- Created MatchResultParticipant junction table for 2v2/3v3 match participant tracking and registered in schema.ts
- Added validateRegistrationToSeeding and validateSeedingToInProgress stage transition guards with minimum participant/bracket existence enforcement
- Modified register_for_tournament to auto-create TournamentTeam rows for solo tournaments and updated update_display_name to lazy-sync team names
- Updated create_tournament and update_tournament reducers to accept groupSize, has3rdPlaceMatch, autoAdvanceBracket

## Task Commits

Per CLAUDE.md: code changes are NOT committed. Changes are left unstaged for user review in VS Code before committing.

1. **Task 1: Add BracketSide enum and update all table schemas** - unstaged
2. **Task 2: Stage transition guards, auto-team creation, display name sync** - unstaged

## Files Created/Modified

- `spacetimedb/src/types/enums.ts` - Added BracketSide enum with 5 variants
- `spacetimedb/src/tables/bracketMatch.ts` - Replaced isLosersBracket with bracketSide: BracketSide
- `spacetimedb/src/tables/tournament.ts` - Added groupSize, has3rdPlaceMatch, autoAdvanceBracket columns
- `spacetimedb/src/tables/tournamentParticipant.ts` - Removed seedNumber, added allowRandomTeamAssignment
- `spacetimedb/src/tables/tournamentTeam.ts` - Added seedNumber column
- `spacetimedb/src/tables/groupStanding.ts` - Renamed participantUserId to participantTeamId, updated PK
- `spacetimedb/src/tables/matchResultParticipant.ts` - NEW: junction table for 2v2/3v3 participant tracking
- `spacetimedb/src/schema.ts` - Imported and registered MatchResultParticipant
- `spacetimedb/src/helpers/tournamentHelpers.ts` - Added validateRegistrationToSeeding and validateSeedingToInProgress
- `spacetimedb/src/reducers/tournamentManagement.ts` - Added stage guards in advance_tournament_stage, added 3 new columns to create/update
- `spacetimedb/src/reducers/tournamentRegistration.ts` - Auto-team creation for solo tournaments, removed seedNumber, added allowRandomTeamAssignment
- `spacetimedb/src/reducers/profile.ts` - Lazy sync displayName to active solo tournament team names

## Decisions Made

- bracketSide (BracketSide enum) replaces isLosersBracket (bool) — 5-variant enum supports GrandFinals, ThirdPlace, and Group match types not expressible as a boolean
- seedNumber moved from TournamentParticipant to TournamentTeam — seeding is a team-level concept
- GroupStanding uses participantTeamId — standings track teams, not individual players
- Solo tournaments auto-create an invisible TournamentTeam on registration — bracket generation can treat all participants uniformly as teams
- MatchResultParticipant junction table accommodates 2v2/3v3 where MatchResultRecord only holds 2 user IDs

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Two pre-existing TypeScript errors in auth.ts and server.ts (missing `displayedAchievementId` on User inserts) were present before this plan and remain unchanged. These are out of scope and have been noted to deferred-items.

## User Setup Required

None - no external service configuration required. Database must be republished with `--clear-database` flag since multiple columns were renamed/removed on existing tables (participantUserId -> participantTeamId on GroupStanding, seedNumber removed from TournamentParticipant, isLosersBracket -> bracketSide on BracketMatch).

## Next Phase Readiness

- Schema foundation complete — Phase 4 Plan 02 (generate_bracket reducer) can proceed
- BracketSide enum is available for all bracket generation and advancement reducers
- Stage guard functions enforce participant minimums before bracket generation can begin
- MatchResultParticipant table ready for Phase 4 match advancement to populate

---
*Phase: 04-bracket-generation-and-advancement*
*Completed: 2026-03-18*
