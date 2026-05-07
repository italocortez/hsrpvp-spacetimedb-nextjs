---
phase: 05-match-results-and-mmr
plan: 02
subsystem: database
tags: [spacetimedb, elo, mmr, finalization, leaderboard, stats, bracket-advancement]

# Dependency graph
requires:
  - phase: 05-match-results-and-mmr-01
    provides: "EloConfig table, Leaderboard table, accountRating column, record_game_scores reducer, admin ELO reducers"
  - phase: 04-bracket-generation-and-advancement
    provides: "BracketMatch table, advance_bracket_match/submit_and_advance_bracket reducers, bracketAdvancement.ts helpers"
  - phase: 04.1-schema-normalization
    provides: "MatchResultRecord with matchType/mmrProcessedAt, MatchResultParticipant with teamSide, MatchResultGame, MatchSessionHistory, MatchParticipantHistory, PlayerStat, PlayerRelationship, MmrRating, MmrHistory"
provides:
  - "finalize_match_result reducer -- writes history, increments stats, advances bracket, processes inline MMR for standalone Ranked, deletes ephemeral records"
  - "process_tournament_mmr reducer -- batch processes MMR for completed tournaments with mmrProcessedAt guard"
  - "eloCalculation.ts pure math helpers (getKFactor, calculateExpectedScore, calculateRatingChange, calculateTeamEffective, calculateAccountModifier)"
  - "statsIncrement.ts helpers (incrementPlayerStat, incrementPlayerRelationship with composite PK upsert)"
  - "leaderboardRebuild.ts helper (rebuildLeaderboard with top 100 per category, min 2 matches)"
  - "bracketHelpers.ts extracted helpers (advanceBracketMatch, placeParticipantInNextMatch, updateGroupStandings) for cross-reducer use"
affects: [leaderboard, mmr, player-stats, match-history, bracket-advancement, uat-verification]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pure math helper file (eloCalculation.ts) with zero database access for testability"
    - "Cross-reducer helper extraction (bracketHelpers.ts from bracketAdvancement.ts)"
    - "Inline MMR processing for standalone Ranked vs batch processing for tournament Ranked"
    - "MmrHistory sentinel matchHistoryId=0 for tournament batch path, back-filled during finalization"
    - "Ephemeral record deletion order: children first (games, participants) then parent (record)"

key-files:
  created:
    - spacetimedb/src/helpers/eloCalculation.ts
    - spacetimedb/src/helpers/statsIncrement.ts
    - spacetimedb/src/helpers/leaderboardRebuild.ts
    - spacetimedb/src/helpers/bracketHelpers.ts
  modified:
    - spacetimedb/src/reducers/matchFinalization.ts
    - spacetimedb/src/reducers/bracketAdvancement.ts
    - docs/match-results/architecture.md
    - docs/mmr/architecture.md

key-decisions:
  - "EloConfigValues is a TypeScript interface (type-only import) to avoid SpacetimeDB build warning about missing runtime export"
  - "bracketAdvancement.ts keeps removeParticipantFromMatch and reverseGroupStandings as file-local (only used by rollback_bracket_match)"
  - "Fair MMR always applied in Phase 5 -- no per-match choice column needed until Handicap Play gameplay effects in Phase 9/10"
  - "Leaderboard rebuild is inline within the reducer transaction (acceptable for 100-user scale; reconsidered at 500+)"

patterns-established:
  - "Pure math helper file pattern: all functions take plain numbers, return plain numbers, zero ctx.db access"
  - "Cross-reducer helper extraction: shared logic in helpers/, file-specific logic stays in reducer file"
  - "MmrHistory sentinel backfill pattern: batch MMR writes matchHistoryId=0, finalize back-fills real ID"

requirements-completed: [MTCH-08, MTCH-09, MMR-01, MMR-02, MMR-04, MMR-05, MMR-06]

# Metrics
duration: 6min
completed: 2026-03-21
---

# Phase 5 Plan 02: MMR Finalization Pipeline Summary

**ELO calculation helpers, finalize_match_result with history/stats/bracket/ephemeral-deletion, process_tournament_mmr batch processing, leaderboard rebuild, and cross-reducer bracket advancement extraction -- published to maincloud with 38/38 tests passing**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-21T10:04:46Z
- **Completed:** 2026-03-21T10:10:37Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- finalize_match_result fully implemented: writes MatchSessionHistory + MatchParticipantHistory, processes inline MMR for standalone Ranked, increments PlayerStat + PlayerRelationship, advances bracket for tournament matches (MTCH-08), deletes ephemeral records in correct order
- process_tournament_mmr batch-processes MMR for completed tournaments using matchHistoryId=0 sentinel (back-filled during finalization), stamps mmrProcessedAt on each match, rebuilds leaderboard
- Four new pure helper files: eloCalculation (math), statsIncrement (composite PK upsert), leaderboardRebuild (top 100 per category), bracketHelpers (extracted for cross-reducer use)
- Architecture docs updated with implementation status, reducer reference table, bracket advancement rule, EloConfig table, Leaderboard section, and Fair MMR note

## Task Commits

Code files left unstaged per project CLAUDE.md rules (code files must NEVER be committed without user review).

1. **Task 1: Create ELO calculation, stats increment, leaderboard rebuild, and bracket advancement helpers** - unstaged
2. **Task 2: Implement finalize_match_result, process_tournament_mmr, publish, and update docs** - unstaged

## Files Created/Modified
- `spacetimedb/src/helpers/eloCalculation.ts` - Pure ELO math: getKFactor, calculateExpectedScore, calculateRatingChange, calculateTeamEffective, calculateAccountModifier
- `spacetimedb/src/helpers/statsIncrement.ts` - incrementPlayerStat and incrementPlayerRelationship with composite PK delete+insert upsert
- `spacetimedb/src/helpers/leaderboardRebuild.ts` - rebuildLeaderboard: delete all + rebuild top 100 per category (3 modes + Global), min 2 matches
- `spacetimedb/src/helpers/bracketHelpers.ts` - advanceBracketMatch, placeParticipantInNextMatch, updateGroupStandings extracted from bracketAdvancement.ts
- `spacetimedb/src/reducers/matchFinalization.ts` - Full implementation replacing stubs: finalize_match_result + process_tournament_mmr
- `spacetimedb/src/reducers/bracketAdvancement.ts` - Refactored to import shared helpers from bracketHelpers.ts
- `docs/match-results/architecture.md` - Updated implementation status, added Reducer Reference table, updated bracket advancement rule
- `docs/mmr/architecture.md` - Updated implementation status, added Leaderboard section, EloConfig Table section, Fair MMR note

## Decisions Made
- EloConfigValues uses `import type` to avoid SpacetimeDB build warning (interface is erased at runtime)
- bracketAdvancement.ts keeps rollback-specific helpers (removeParticipantFromMatch, reverseGroupStandings) file-local since only rollback_bracket_match uses them
- Fair MMR always applied in Phase 5 -- accountModifierMode column deferred to Phase 9/10 when Handicap Play gameplay effects are implemented
- Leaderboard rebuild runs inline within reducer transaction -- acceptable at 100-user scale with ~300 MmrRating rows and ~600 PlayerStat rows

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed EloConfigValues import warning**
- **Found during:** Task 2 (publish to maincloud)
- **Issue:** SpacetimeDB build warned about `EloConfigValues` not being exported as a runtime value -- it's a TypeScript interface
- **Fix:** Changed to `import type { EloConfigValues }` (separate type-only import line)
- **Files modified:** spacetimedb/src/reducers/matchFinalization.ts
- **Verification:** Build warning resolved, publish succeeds

---

**Total deviations:** 1 auto-fixed (1 blocking -- import type correctness)
**Impact on plan:** Trivial fix. No scope creep.

## Issues Encountered
None -- plan executed cleanly with only the minor type import fix.

## Known Stubs
None -- all functions are fully implemented with real logic. The two Phase 04.1 stubs (finalize_match_result, process_tournament_mmr) are now replaced with full implementations.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 5 is fully complete: all schema, reducers, and helpers for match results + MMR are implemented
- Module published to maincloud with --clear-database, bindings generated
- 38/38 tests pass
- Ready for UAT verification of the full match result lifecycle (score entry -> confirmation -> submission -> validation -> finalization -> history/stats/MMR/leaderboard)
- Ready for UAT verification of tournament batch MMR flow (tournament ends -> process_tournament_mmr -> finalize per match)

## Self-Check: PASSED

All 8 files verified on disk. SUMMARY.md exists. TypeScript compilation: 0 errors. SpacetimeDB build: succeeded. Published to maincloud. Bindings generated. 38/38 tests pass. All acceptance criteria verified via grep.

---
*Phase: 05-match-results-and-mmr*
*Completed: 2026-03-21*
