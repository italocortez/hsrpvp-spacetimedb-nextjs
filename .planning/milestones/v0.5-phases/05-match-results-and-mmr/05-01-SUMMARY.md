---
phase: 05-match-results-and-mmr
plan: 01
subsystem: database
tags: [spacetimedb, elo, leaderboard, score-entry, match-results, mmr]

# Dependency graph
requires:
  - phase: 04.1-schema-normalization
    provides: "MatchResultRecord with blueConfirmed/redConfirmed/refereeFullControl/matchType columns, MatchResultParticipant with isCaptain, MatchResultGame with composite PK"
  - phase: 02-roster-management
    provides: "HsrAccount, HsrAccountCharacter, HsrAccountLightcone tables with cost lookups"
provides:
  - "EloConfig single-row admin table with sentinel PK (id=1)"
  - "Leaderboard materialized table with category/rank/userId/rating schema"
  - "accountRating column on HsrAccount (0-1000 roster strength)"
  - "computeAccountRating and updateAccountRating helper functions"
  - "record_game_scores reducer for per-game score entry with captain/referee authority"
  - "admin_seed_elo_config and admin_update_elo_config admin reducers"
  - "Casual auto-validation in submit_match_result (D-04 supersedes MTCH-05 mismatch for Casual)"
  - "Ranked screenshot gate in override_match_result (D-07)"
affects: [05-02-mmr-finalization, mmr, leaderboard, match-results, player-stats]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Single-row sentinel PK config table (EloConfig id=1)"
    - "Materialized leaderboard with composite PK [category, rank]"
    - "Captain-side-enforcement in score entry (captains can only set own side scores)"
    - "Spectator referee full-control path for score entry"
    - "Account rating computed from roster cost lookups"

key-files:
  created:
    - spacetimedb/src/tables/eloConfig.ts
    - spacetimedb/src/tables/leaderboard.ts
    - spacetimedb/src/helpers/accountRating.ts
    - spacetimedb/src/reducers/scoreEntry.ts
    - spacetimedb/src/reducers/eloAdmin.ts
  modified:
    - spacetimedb/src/tables/hsrAccount.ts
    - spacetimedb/src/schema.ts
    - spacetimedb/src/index.ts
    - spacetimedb/src/reducers/matchResultSubmission.ts
    - spacetimedb/src/reducers/tournamentAdmin.ts

key-decisions:
  - "EloConfig table flattens struct fields directly into columns (not using EloConfig struct as column type) -- avoids nested object issues with single-row config table"
  - "Leaderboard uses string category column (not GameMode enum) to support 'Global' category without adding enum variant"
  - "accountRating helper uses MemoryOfChaos as reference game mode for cost lookups with costSetId=0 (default cost set)"
  - "Captain side enforcement rejects any opposite-side score fields (not just scores -- also screenshots, cycles)"

patterns-established:
  - "Single-row config table: sentinel PK id=1, admin_seed creates defaults, admin_update modifies"
  - "Score entry upsert: delete+insert for composite PK tables with existing value preservation"
  - "Side enforcement: participant.teamSide.tag determines which args are allowed"

requirements-completed: [MTCH-01, MTCH-02, MTCH-03, MTCH-04, MTCH-05, MTCH-06, MTCH-07, MMR-03, MMR-07]

# Metrics
duration: 4min
completed: 2026-03-21
---

# Phase 5 Plan 01: Schema Foundation and Score Entry Summary

**EloConfig/Leaderboard tables, record_game_scores reducer with captain side-enforcement, ELO admin reducers, Casual auto-validation (D-04), Ranked screenshot gate (D-07), and accountRating column on HsrAccount**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-21T09:55:31Z
- **Completed:** 2026-03-21T09:59:44Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- EloConfig single-row admin table with all K-factor tiers and modifier settings, plus admin_seed/admin_update reducers
- Leaderboard materialized table with composite PK [category, rank], btree indexes, and support for 4 categories (3 game modes + Global)
- record_game_scores reducer with full captain/referee authority checks and side enforcement
- Casual matches auto-validate on submit (status jumps to Validated), Ranked matches require screenshot validation
- accountRating column on HsrAccount with compute and update helper functions

## Task Commits

Code files left unstaged per project CLAUDE.md rules (code files must NEVER be committed without user review).

1. **Task 1: Create EloConfig table, Leaderboard table, accountRating column, and helper** - unstaged
2. **Task 2: Create score entry reducer, ELO admin reducers, and modify submission reducers** - unstaged

## Files Created/Modified
- `spacetimedb/src/tables/eloConfig.ts` - EloConfig single-row admin table with sentinel PK id=1
- `spacetimedb/src/tables/leaderboard.ts` - Materialized leaderboard with [category, rank] composite PK
- `spacetimedb/src/tables/hsrAccount.ts` - Added accountRating: t.u32() column
- `spacetimedb/src/helpers/accountRating.ts` - computeAccountRating and updateAccountRating functions
- `spacetimedb/src/schema.ts` - Registered EloConfigTable and Leaderboard
- `spacetimedb/src/reducers/scoreEntry.ts` - record_game_scores reducer with captain/referee authority
- `spacetimedb/src/reducers/eloAdmin.ts` - admin_seed_elo_config and admin_update_elo_config reducers
- `spacetimedb/src/reducers/matchResultSubmission.ts` - Casual auto-validation in submit_match_result
- `spacetimedb/src/reducers/tournamentAdmin.ts` - Ranked screenshot gate in override_match_result
- `spacetimedb/src/index.ts` - Exported 3 new reducers

## Decisions Made
- EloConfig table flattens all struct fields directly into columns rather than embedding the EloConfig struct -- single-row config tables work better with flat columns for individual field updates
- Leaderboard category is a plain string ("MemoryOfChaos", "ApocalypticShadow", "AnomalyArbitration", "Global") rather than adding a Global variant to the GameMode enum -- per Research pitfall 5
- accountRating helper uses MemoryOfChaos as reference mode and costSetId=0 for cost lookups, with MAX_EXPECTED_VALUE=500 as tunable normalization constant
- Captain side enforcement rejects ALL opposite-side fields (scores, cycles, boss scores, screenshots) not just score values

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Corrected index accessor names in accountRating helper**
- **Found during:** Task 1 (accountRating helper)
- **Issue:** Plan referenced `by_cost_set_character_mode` and `by_cost_set_and_name` indexes, but actual indexes in codebase are `by_character_mode_and_set` and `by_lightcone_mode_and_set` (columns ordered differently)
- **Fix:** Used actual index names from HsrCharacterCost and HsrLightconeCost table definitions, with correct column order for filter arguments
- **Files modified:** spacetimedb/src/helpers/accountRating.ts
- **Verification:** TypeScript compilation passes

**2. [Rule 3 - Blocking] Used `hsr_account_id` btree index for roster lookups in accountRating**
- **Found during:** Task 1 (accountRating helper)
- **Issue:** Plan referenced `by_account` index, but actual index accessor on HsrAccountCharacter/HsrAccountLightcone is `hsr_account_id`
- **Fix:** Used `hsr_account_id.filter(hsrAccountId)` instead of `by_account.filter(hsrAccountId)`
- **Files modified:** spacetimedb/src/helpers/accountRating.ts
- **Verification:** TypeScript compilation passes

---

**Total deviations:** 2 auto-fixed (2 blocking -- incorrect index references in plan)
**Impact on plan:** Both fixes were trivial name corrections. No scope creep.

## Issues Encountered
- `npx spacetimedb-build` not available as global command -- used `npm run build` (which runs `spacetime build`) instead. Build succeeds.

## Known Stubs
None -- all functions are fully implemented with real logic.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- EloConfig and Leaderboard tables ready for MMR processing in Plan 02
- accountRating column and helper ready for account rating modifier calculations
- record_game_scores reducer ready for UAT testing
- submit_match_result Casual auto-validation path ready for finalization in Plan 02
- override_match_result Ranked screenshot gate ready for UAT testing

## Self-Check: PASSED

All 5 created files verified on disk. SUMMARY.md exists. TypeScript compilation: 0 errors. SpacetimeDB build: succeeded. All acceptance criteria verified via grep.

---
*Phase: 05-match-results-and-mmr*
*Completed: 2026-03-21*
