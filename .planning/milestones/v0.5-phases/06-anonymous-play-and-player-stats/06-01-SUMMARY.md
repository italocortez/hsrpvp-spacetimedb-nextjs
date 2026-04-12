---
phase: 06-anonymous-play-and-player-stats
plan: 01
subsystem: database
tags: [spacetimedb, schema, tables, indexes, season, stats, anonymous-play, history]

# Dependency graph
requires:
  - phase: 05-match-results-and-mmr
    provides: "MmrRating, Leaderboard, PlayerStat, PlayerCharacterStat, PlayerRelationship, matchFinalization, statsIncrement, leaderboardRebuild"
provides:
  - "5 PK expansions with seasonId/matchType/teamSize on stat/leaderboard tables"
  - "Season table with admin CRUD reducers"
  - "GlobalCharacterStat table for community aggregates"
  - "TournamentPlayerAccount junction table for locked accounts"
  - "MatchResultGameHistory table for score history archival"
  - "Lobby.rosterVisibility enum, requireOwnership bool, isTournamentControlled bool"
  - "anonymousLabel column on LobbyCursorEvent and MatchSessionStep"
  - "MatchSessionStepHistory reworked to individual step rows (no JSON blob)"
  - "MatchParticipantHistory.displayName for self-contained replay"
  - "PlayerStat/PlayerCharacterStat/PlayerRelationship set to private (public:false)"
affects: [06-02, 06-03, 07-achievements, 09-lobby-lifecycle, 10-disconnect]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Season-aware PK pattern: all stat/MMR/leaderboard tables include seasonId in PK"
    - "Private stat tables with per-user views (public:false + view pattern)"
    - "isTournamentControlled flag for tournament config inheritance"

key-files:
  created:
    - spacetimedb/src/tables/season.ts
    - spacetimedb/src/tables/globalCharacterStat.ts
    - spacetimedb/src/tables/tournamentPlayerAccount.ts
    - spacetimedb/src/tables/matchResultGameHistory.ts
    - spacetimedb/src/reducers/seasonAdmin.ts
  modified:
    - spacetimedb/src/tables/playerStats.ts
    - spacetimedb/src/tables/characterStats.ts
    - spacetimedb/src/tables/playerRelationship.ts
    - spacetimedb/src/tables/mmrRating.ts
    - spacetimedb/src/tables/leaderboard.ts
    - spacetimedb/src/tables/lobby.ts
    - spacetimedb/src/tables/lobbyCursorEvent.ts
    - spacetimedb/src/tables/matchSessionStep.ts
    - spacetimedb/src/tables/matchSessionHistory.ts
    - spacetimedb/src/tables/matchSessionStepHistory.ts
    - spacetimedb/src/tables/matchParticipantHistory.ts
    - spacetimedb/src/schema.ts
    - spacetimedb/src/index.ts
    - spacetimedb/src/helpers/statsIncrement.ts
    - spacetimedb/src/helpers/leaderboardRebuild.ts
    - spacetimedb/src/reducers/matchFinalization.ts
    - spacetimedb/src/reducers/admin.ts
    - spacetimedb/src/reducers/cursor.ts

key-decisions:
  - "Active season lookup via btree index on isActive; seasonId defaults to 0 for pre-season (D-45)"
  - "set_active_season deactivates all active seasons before activating target (single-active pattern)"
  - "Stale private table bindings manually deleted after generate (player_stat, player_character_stat, player_relationship)"

patterns-established:
  - "Season-aware finalization: active season read at finalization time, seasonId passed through all stat/MMR helpers"
  - "Composite PK delete+insert upsert with expanded PK fields (seasonId, matchType, teamSize)"

requirements-completed: [STAT-01, STAT-02, STAT-05, STAT-06, STAT-07, STAT-08, ANON-01, ANON-02, ANON-03, ANON-04]

# Metrics
duration: 8min
completed: 2026-03-22
---

# Phase 06 Plan 01: Schema Foundation Summary

**Season-aware PK expansions on 5 stat/MMR tables, 4 new tables (Season, GlobalCharacterStat, TournamentPlayerAccount, MatchResultGameHistory), Lobby roster/anonymous columns, and MatchSessionStepHistory rework from JSON blob to flat rows**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-22T02:10:47Z
- **Completed:** 2026-03-22T02:18:17Z
- **Tasks:** 2/2
- **Files modified:** 21 source files + 20 binding files

## Accomplishments
- 5 PK expansions landed: PlayerStat, PlayerCharacterStat, PlayerRelationship (+seasonId, matchType, teamSize), MmrRating (+seasonId), Leaderboard (+seasonId)
- 4 new tables created and registered: Season, GlobalCharacterStat, TournamentPlayerAccount, MatchResultGameHistory
- Lobby upgraded: isOpenRoster -> rosterVisibility (RosterVisibility enum), +requireOwnership, +isTournamentControlled (ANON-02 enabler)
- MatchSessionStepHistory reworked from single JSON blob to individual step rows with denormalized actorDisplayName
- Season admin reducers (create_season, set_active_season) created and exported
- Module published to maincloud with --clear-database, bindings regenerated
- All 61 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Schema changes -- PK expansions, column modifications, 4 new tables** - `94c5557` (feat)
2. **Task 2: Season admin reducers, publish --clear-database, generate bindings** - `e3c667b` (feat)

## Files Created/Modified
- `spacetimedb/src/tables/season.ts` - Season table (id autoInc PK, name, startDate, endDate, isActive)
- `spacetimedb/src/tables/globalCharacterStat.ts` - Community aggregate character stats (6-column composite PK)
- `spacetimedb/src/tables/tournamentPlayerAccount.ts` - Lock HSR accounts to tournaments (3-column PK)
- `spacetimedb/src/tables/matchResultGameHistory.ts` - Archival mirror of MatchResultGame with matchHistoryId FK
- `spacetimedb/src/reducers/seasonAdmin.ts` - create_season and set_active_season admin reducers
- `spacetimedb/src/tables/playerStats.ts` - PK expanded to 6 columns, public:false
- `spacetimedb/src/tables/characterStats.ts` - PK expanded to 7 columns, +4 ban/faced columns, public:false
- `spacetimedb/src/tables/playerRelationship.ts` - PK expanded to 7 columns, public:false
- `spacetimedb/src/tables/mmrRating.ts` - seasonId now required (not optional), part of PK
- `spacetimedb/src/tables/leaderboard.ts` - seasonId now required, part of PK
- `spacetimedb/src/tables/lobby.ts` - rosterVisibility enum, requireOwnership, isTournamentControlled
- `spacetimedb/src/tables/lobbyCursorEvent.ts` - +anonymousLabel optional string
- `spacetimedb/src/tables/matchSessionStep.ts` - +anonymousLabel optional string
- `spacetimedb/src/tables/matchSessionHistory.ts` - Removed rosterBlue/rosterRed
- `spacetimedb/src/tables/matchSessionStepHistory.ts` - Complete rework: JSON blob -> individual rows
- `spacetimedb/src/tables/matchParticipantHistory.ts` - +displayName denormalized
- `spacetimedb/src/helpers/statsIncrement.ts` - Updated signatures for new PK fields
- `spacetimedb/src/helpers/leaderboardRebuild.ts` - seasonId now required (defaults to 0)
- `spacetimedb/src/reducers/matchFinalization.ts` - Active season lookup, updated all helper calls
- `spacetimedb/src/reducers/admin.ts` - Updated MatchSessionStepHistory deletion for composite PK
- `spacetimedb/src/reducers/cursor.ts` - Added anonymousLabel:undefined to insert

## Decisions Made
- Active season lookup via btree index on isActive; seasonId defaults to 0 for pre-season (D-45)
- set_active_season deactivates all active seasons before activating target (single-active guarantee)
- Stale private table bindings (player_stat, player_character_stat, player_relationship) manually deleted after generate

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated statsIncrement.ts function signatures for expanded PKs**
- **Found during:** Task 1 (PK expansions)
- **Issue:** incrementPlayerStat and incrementPlayerRelationship used old 4-column btree accessors and didn't accept seasonId/matchType/teamSize
- **Fix:** Added seasonId, matchType, teamSize parameters; updated accessor names and insert calls
- **Files modified:** spacetimedb/src/helpers/statsIncrement.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 94c5557 (Task 1 commit)

**2. [Rule 3 - Blocking] Updated matchFinalization.ts for new accessor names and season awareness**
- **Found during:** Task 1 (PK expansions)
- **Issue:** by_user_and_mode renamed to by_user_mode_season; processMatchMmr needed seasonId; rosterBlue/rosterRed removed from history insert
- **Fix:** Updated all accessor references, added seasonId parameter chain, active season lookup, displayName denormalization
- **Files modified:** spacetimedb/src/reducers/matchFinalization.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 94c5557 (Task 1 commit)

**3. [Rule 3 - Blocking] Updated leaderboardRebuild.ts for required seasonId**
- **Found during:** Task 1 (Leaderboard PK expansion)
- **Issue:** seasonId changed from optional to required in Leaderboard PK; insert calls used optional values
- **Fix:** Changed undefined -> 0 for Global category, added ?? 0 fallback for per-mode entries
- **Files modified:** spacetimedb/src/helpers/leaderboardRebuild.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 94c5557 (Task 1 commit)

**4. [Rule 3 - Blocking] Updated admin.ts for MatchSessionStepHistory composite PK**
- **Found during:** Task 1 (MatchSessionStepHistory rework)
- **Issue:** admin_delete_row used .matchHistoryId.find() which no longer exists (PK now [matchHistoryId, sequence])
- **Fix:** Changed to parse JSON PK array, filter by matchHistoryId index, find by sequence
- **Files modified:** spacetimedb/src/reducers/admin.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 94c5557 (Task 1 commit)

**5. [Rule 3 - Blocking] Updated cursor.ts for required anonymousLabel column**
- **Found during:** Task 1 (LobbyCursorEvent column addition)
- **Issue:** broadcast_cursor insert missing required anonymousLabel field
- **Fix:** Added anonymousLabel: undefined to the insert call
- **Files modified:** spacetimedb/src/reducers/cursor.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 94c5557 (Task 1 commit)

---

**Total deviations:** 5 auto-fixed (5 blocking - all caused by schema changes propagating to existing code)
**Impact on plan:** All auto-fixes necessary for compilation. No scope creep.

## Known Stubs

None. All tables, columns, and reducers are fully defined with no placeholder data or TODO markers.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Schema foundation complete: all PK expansions, column modifications, and new tables are live on maincloud
- Plan 02 can build anonymous label computation, roster visibility views, and ownership validation helper
- Plan 03 can build the expanded finalization pipeline with stat/history archival logic

## Self-Check: PASSED

- All 5 created files exist on disk
- Commit 94c5557 (Task 1) verified in git log
- Commit e3c667b (Task 2) verified in git log
- 4 new tables confirmed on maincloud via spacetime sql
- 61/61 tests pass

---
*Phase: 06-anonymous-play-and-player-stats*
*Completed: 2026-03-22*
