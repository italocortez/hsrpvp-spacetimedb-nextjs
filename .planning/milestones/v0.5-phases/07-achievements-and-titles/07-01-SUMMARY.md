---
phase: 07-achievements-and-titles
plan: 01
subsystem: database
tags: [spacetimedb, achievements, schema, enums, tables, maincloud]

# Dependency graph
requires:
  - phase: 06-anonymous-play-and-player-stats
    provides: PlayerStat, PlayerCharacterStat tables that AchievementCriteria will reference by statTable/statField strings
  - phase: 05-match-results-and-mmr
    provides: MmrRating table that AchievementCriteria will reference
provides:
  - AchievementCriteria table with achievementId FK, statTable/statField strings, ComparisonOperator, threshold, optional filters
  - Reworked Achievement table with isManualOnly + maxAwards replacing triggerType/isOneTime/thresholdValue/characterName
  - Reworked UserAchievement table with by_user_achievement multi-column btree index, isDisplayed dropped
  - ComparisonOperator enum with 5 variants (GreaterOrEqual, GreaterThan, Equal, LessThan, LessOrEqual)
  - Module published to maincloud with --clear-database, client bindings regenerated
affects: [07-02, achievement-reducers, finalization-pipeline, manual-award, set-displayed-achievement]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Criteria-driven achievement system: AchievementCriteria rows define auto-award conditions as data, not code"
    - "string-based stat resolver: statTable/statField as strings resolved by hardcoded map in checker (D-09)"
    - "optional filters as t.string().optional(): SpacetimeDB enum types don't support .optional(), use string for filter columns"

key-files:
  created:
    - spacetimedb/src/tables/achievementCriteria.ts
  modified:
    - spacetimedb/src/types/enums.ts
    - spacetimedb/src/tables/achievement.ts
    - spacetimedb/src/tables/userAchievement.ts
    - spacetimedb/src/schema.ts
    - src/module_bindings/achievement_table.ts
    - src/module_bindings/achievement_criteria_table.ts
    - src/module_bindings/user_achievement_table.ts
    - src/module_bindings/types.ts
    - src/module_bindings/index.ts

key-decisions:
  - "AchievementTriggerType enum dropped; replaced by isManualOnly bool (D-03)"
  - "maxAwards replaces isOneTime: null=unlimited, 1=one-time, N=globally-capped (D-04)"
  - "AchievementCriteria filter columns (filterGameMode, filterMatchType) use t.string().optional() not enum types — SpacetimeDB enum types do not support .optional()"
  - "by_user_achievement multi-column btree index enables efficient duplicate-award check without full scan (D-13)"
  - "Module published with --delete-data=always (CLI v2+ syntax replacing --clear-database)"

patterns-established:
  - "Criteria as rows pattern: achievement conditions stored in AchievementCriteria rows, checked by resolver at runtime"
  - "ComparisonOperator enum: use for all threshold comparisons in checker logic"

requirements-completed: [ACHV-01, ACHV-04]

# Metrics
duration: 4min
completed: 2026-03-28
---

# Phase 07 Plan 01: Achievement Schema Foundation Summary

**Achievement and UserAchievement tables reworked with criteria-driven design, new AchievementCriteria table and ComparisonOperator enum added, module published to maincloud with --clear-database, bindings regenerated**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-28T05:09:00Z
- **Completed:** 2026-03-28T05:11:28Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Dropped `AchievementTriggerType` enum and replaced with `ComparisonOperator` enum (5 variants: GreaterOrEqual, GreaterThan, Equal, LessThan, LessOrEqual)
- Reworked Achievement table: dropped `triggerType`, `isOneTime`, `thresholdValue`, `characterName`; added `isManualOnly` (bool) and `maxAwards` (optional u32) with `by_rarity` btree index
- Reworked UserAchievement table: dropped `isDisplayed`; added `by_user_achievement` multi-column btree index for efficient duplicate-award checks; renamed single-column indexes to `by_user`/`by_achievement`
- Created new AchievementCriteria table with all criteria columns (statTable, statField, operator, thresholdValue, three optional string filters) and `by_achievement`/`by_stat_table` btree indexes
- Registered AchievementCriteria in schema.ts; published to maincloud with full data clear; regenerated all client bindings

## Task Commits

Per project CLAUDE.md, code files (spacetimedb/, src/) are NOT committed by GSD workflows — left unstaged for user review.

1. **Task 1: Rework enums, Achievement table, UserAchievement table** - unstaged (code change)
2. **Task 2: Create AchievementCriteria table and register in schema** - unstaged (code change)
3. **Task 3: Publish to maincloud and generate bindings** - unstaged (code change + generated bindings)

**Plan metadata:** committed via GSD final commit

## Files Created/Modified
- `spacetimedb/src/types/enums.ts` - Dropped AchievementTriggerType, added ComparisonOperator with 5 variants
- `spacetimedb/src/tables/achievement.ts` - Reworked columns (isManualOnly, maxAwards), added by_rarity index
- `spacetimedb/src/tables/userAchievement.ts` - Dropped isDisplayed, added by_user_achievement multi-col index
- `spacetimedb/src/tables/achievementCriteria.ts` - NEW: AchievementCriteria table with criteria columns and two btree indexes
- `spacetimedb/src/schema.ts` - Added AchievementCriteria import and registration
- `src/module_bindings/achievement_table.ts` - Regenerated: isManualOnly + maxAwards, no triggerType
- `src/module_bindings/achievement_criteria_table.ts` - NEW: Generated AchievementCriteria binding
- `src/module_bindings/user_achievement_table.ts` - Regenerated: no isDisplayed
- `src/module_bindings/types.ts` - Updated: ComparisonOperator added, AchievementTriggerType absent
- `src/module_bindings/index.ts` - Regenerated with new table registrations

## Decisions Made
- CLI syntax changed from `--clear-database` to `--delete-data=always` in SpacetimeDB v2+ CLI — plan used old flag syntax, actual command used correct v2 syntax
- `filterGameMode` and `filterMatchType` stored as `t.string().optional()` per plan note (SpacetimeDB enum types don't support `.optional()`)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] CLI flag syntax correction: --clear-database → --delete-data=always**
- **Found during:** Task 3 (Publish to maincloud)
- **Issue:** Plan specified `--clear-database` flag but SpacetimeDB v2+ CLI uses `--delete-data=always`; running the old flag returned exit code 2 with "unexpected argument" error
- **Fix:** Used `--delete-data=always -y` which is the correct v2 syntax for clearing and skipping confirmation
- **Files modified:** None (CLI invocation only)
- **Verification:** Publish succeeded with exit 0, database cleared and republished
- **Committed in:** N/A (no files changed by this fix)

---

**Total deviations:** 1 auto-fixed (1 Rule 1 - CLI syntax bug)
**Impact on plan:** One-line flag correction, no scope creep. Publish succeeded.

## Issues Encountered
- CLI flag `--clear-database` no longer valid in SpacetimeDB v2+ CLI — resolved by using `--delete-data=always`. The plan's CLI examples reflect v1 syntax.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Schema foundation complete. Ready for 07-02: Achievement CRUD reducers (create_achievement, update_achievement, delete_achievement with cascade, add/remove criteria)
- AchievementCriteria table registered and live on maincloud
- ComparisonOperator enum available in client bindings for frontend progress display
- `User.displayedAchievementId` FK remains intact (no changes needed per plan)

## Known Stubs
None - this plan is schema-only. No data or reducers wired. Stubs will be addressed in 07-02 (reducers) and 07-03 (auto-award hook).

## Self-Check: PASSED
- `spacetimedb/src/tables/achievementCriteria.ts` — FOUND
- `spacetimedb/src/types/enums.ts` — FOUND (ComparisonOperator present, AchievementTriggerType absent)
- `spacetimedb/src/tables/achievement.ts` — FOUND (isManualOnly, maxAwards present; triggerType absent)
- `spacetimedb/src/tables/userAchievement.ts` — FOUND (by_user_achievement present; isDisplayed absent)
- `spacetimedb/src/schema.ts` — FOUND (AchievementCriteria registered)
- `src/module_bindings/achievement_criteria_table.ts` — FOUND
- Module published to maincloud: identity c2005439f74300bfd5f275871c810689906f7724e12896cd03fda072a4d115d6

---
*Phase: 07-achievements-and-titles*
*Completed: 2026-03-28*
