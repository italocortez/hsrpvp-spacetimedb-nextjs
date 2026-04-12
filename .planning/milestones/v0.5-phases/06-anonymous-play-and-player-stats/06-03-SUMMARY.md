---
phase: 06-anonymous-play-and-player-stats
plan: 03
subsystem: database
tags: [spacetimedb, finalization, stats, character-stats, global-stats, history, auto-finalize, season]

# Dependency graph
requires:
  - phase: 06-anonymous-play-and-player-stats-01
    provides: "Expanded PK tables (PlayerStat, PlayerCharacterStat, PlayerRelationship, MmrRating, Leaderboard), Season table, GlobalCharacterStat table, MatchResultGameHistory table, MatchSessionStepHistory rework"
provides:
  - "runFinalization 18-step shared pipeline (finalizationHelpers.ts)"
  - "Character stat increments: incrementPlayerCharacterStat, incrementBanStat, incrementFacedStat"
  - "Global character stat increments: incrementGlobalCharacterStat (pick/ban paths)"
  - "Season-aware leaderboard rebuild with getActiveSeasonId"
  - "Auto-finalize casual in submit_match_result (D-37)"
  - "Match replay archival: MatchSessionStepHistory rows, MatchResultGameHistory rows, MatchParticipantHistory with displayName"
  - "MatchSessionStep deletion after archival to history"
  - "matchesSpectated increment for lobby spectators (D-30)"
affects: [07-achievements, 09-lobby-lifecycle, 10-disconnect]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Shared finalization helper (runFinalization) called by both ranked finalize and casual auto-finalize"
    - "Character stat increment split: pick stats, ban stats (all participants), faced stats (opponents)"
    - "StepPayload tagged union traversal for character name extraction (Pick, Ban, AuctionSold, Nominate, Bid)"

key-files:
  created:
    - spacetimedb/src/helpers/finalizationHelpers.ts
    - spacetimedb/src/helpers/characterStatsIncrement.ts
    - spacetimedb/src/helpers/globalCharacterStatsIncrement.ts
  modified:
    - spacetimedb/src/helpers/leaderboardRebuild.ts
    - spacetimedb/src/reducers/matchFinalization.ts
    - spacetimedb/src/reducers/matchResultSubmission.ts
    - docs/match-results/architecture.md
    - docs/player-stats/architecture.md
    - docs/mmr/architecture.md
    - docs/tournament/architecture.md

key-decisions:
  - "runFinalization extracts processMatchMmr and getOrCreateRating into finalizationHelpers.ts rather than keeping them in the reducer file"
  - "Character name extracted from StepPayload tagged union via variant-specific access (Pick/Ban/AuctionSold/Nominate use characterName, Bid uses targetCharacter)"
  - "incrementSpectatedCount implemented inline in finalizationHelpers.ts rather than in statsIncrement.ts for locality"
  - "GlobalCharacterStat lookup uses by_char_mode 2-column index + post-filter (no full 6-column btree index defined)"

patterns-established:
  - "Shared finalization helper pattern: single runFinalization() callable from multiple entry points"
  - "Character stat increment helpers with upsert (delete+insert) on composite PKs"
  - "Season-aware leaderboard rebuild with optional seasonId parameter"

requirements-completed: [STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07, STAT-08]

# Metrics
duration: 8min
completed: 2026-03-22
---

# Phase 06 Plan 03: Finalization Pipeline Summary

**18-step finalization pipeline rewrite with character/global stat increments, match replay archival to individual rows, spectated count tracking, auto-finalize casual inline, and season-aware leaderboard rebuild**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-22T02:21:53Z
- **Completed:** 2026-03-22T02:30:30Z
- **Tasks:** 2/2
- **Files modified:** 11 source files + 4 doc files

## Accomplishments
- 18-step finalization pipeline implemented as shared `runFinalization()` helper callable by both `finalize_match_result` (ranked/tournament) and `submit_match_result` (casual auto-finalize)
- Character stat increments: pick stats (matchesPlayed/wins/losses), ban stats for ALL participants per ban (D-23), faced-against opponent characters (D-24)
- Global character stat aggregates: community-wide pick/ban/win rates (D-34)
- Match replay fully archived: individual MatchSessionStepHistory rows, MatchResultGameHistory rows, MatchParticipantHistory with denormalized displayName
- MatchSessionStep rows deleted after archiving (ephemeral cleanup)
- matchesSpectated incremented for lobby spectators at finalization (D-30)
- Season-aware leaderboard rebuild with getActiveSeasonId helper
- Casual auto-finalize eliminates gap between submit and finalize (D-37)
- Module published to maincloud, bindings generated, all 61 tests pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Stat increment helpers (character stats, global stats) and leaderboard seasonId** - `615a3cb` (feat)
2. **Task 2: Finalization pipeline rewrite, auto-finalize casual, publish, and doc updates** - `1c91abb` (feat)

## Files Created/Modified
- `spacetimedb/src/helpers/characterStatsIncrement.ts` - incrementPlayerCharacterStat, incrementBanStat, incrementFacedStat
- `spacetimedb/src/helpers/globalCharacterStatsIncrement.ts` - incrementGlobalCharacterStat (pick/ban paths)
- `spacetimedb/src/helpers/finalizationHelpers.ts` - runFinalization (18-step pipeline), processMatchMmr, getOrCreateRating, incrementSpectatedCount
- `spacetimedb/src/helpers/leaderboardRebuild.ts` - Added getActiveSeasonId, seasonId parameter, season-filtered queries
- `spacetimedb/src/reducers/matchFinalization.ts` - Simplified to auth+validate+runFinalization; process_tournament_mmr uses processMatchMmr from helpers
- `spacetimedb/src/reducers/matchResultSubmission.ts` - Added runFinalization import and auto-finalize casual inline (D-37)
- `docs/match-results/architecture.md` - Auto-finalize casual flow, MatchResultGameHistory table, 18-step pipeline, requireOwnership
- `docs/player-stats/architecture.md` - Major rework: expanded PKs, character ban/faced columns, GlobalCharacterStat, private tables, spectated count, season support, client summation
- `docs/mmr/architecture.md` - MmrRating PK includes seasonId, Leaderboard PK includes seasonId, Season table reference
- `docs/tournament/architecture.md` - TournamentPlayerAccount table, requireOwnership inheritance

## Decisions Made
- runFinalization extracts processMatchMmr and getOrCreateRating into finalizationHelpers.ts rather than keeping them in the reducer file (minimizes reducer file size)
- Character name extracted from StepPayload tagged union via variant-specific access (Pick/Ban/AuctionSold/Nominate use characterName, Bid uses targetCharacter)
- incrementSpectatedCount implemented inline in finalizationHelpers.ts rather than exported from statsIncrement.ts (locality)
- GlobalCharacterStat lookup uses by_char_mode 2-column index + post-filter (avoids defining a 6-column btree index that would be redundant with the PK)

## Deviations from Plan

None - plan executed exactly as written. statsIncrement.ts already had expanded PKs from Plan 01 auto-fixes, so Task 1's section A was already complete.

## Known Stubs

None. All finalization steps, stat increments, and history archival are fully implemented.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Finalization pipeline complete: all 18 steps operational, character/global stats wired, match replay archived
- Plan 02 (anonymous labels, roster views, ownership helper) can execute independently
- Phase 7 (achievements) can reference character stats and season data
- Phase 9 can wire ownership validation into pick/ban reducers using the requireOwnership flag

## Self-Check: PASSED

- All 3 created files exist on disk
- Commit 615a3cb (Task 1) verified in git log
- Commit 1c91abb (Task 2) verified in git log
- Module published to maincloud successfully
- 61/61 tests pass

---
*Phase: 06-anonymous-play-and-player-stats*
*Completed: 2026-03-22*
