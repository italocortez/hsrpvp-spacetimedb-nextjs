---
phase: 07-achievements-and-titles
plan: 02
subsystem: database
tags: [spacetimedb, achievements, titles, reducers, finalization, bootstrap]

# Dependency graph
requires:
  - phase: 07-01
    provides: Achievement/UserAchievement/AchievementCriteria tables, ComparisonOperator enum, AchievementRarity enum

provides:
  - 7 achievement reducers (create/update/delete, add/remove criteria, manual_award, set_displayed_achievement)
  - checkAndAwardAchievements helper with criteria resolver (PlayerStat, PlayerCharacterStat, MmrRating)
  - Achievement checker hooked into finalization pipeline at step 16.5
  - Post-publish bootstrap seeds MMR Elite, Veteran, Solar First Tournament Winner
  - Architecture docs updated to reflect Phase 07 schema

affects:
  - frontend
  - uat
  - post-publish-bootstrap

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Explicit getField switch/case for SpacetimeDB row field access (no string indexing on row objects)
    - AND logic across all AchievementCriteria rows for a single achievement
    - onInsert subscription to capture auto-generated IDs in bootstrap scripts

key-files:
  created:
    - spacetimedb/src/helpers/achievementChecker.ts
    - spacetimedb/src/reducers/achievementManagement.ts
  modified:
    - spacetimedb/src/helpers/finalizationHelpers.ts
    - spacetimedb/src/index.ts
    - docs/achievements/architecture.md
    - scripts/post-publish.ts
    - src/module_bindings/ (regenerated — 7 new reducer files + updated index.ts/types.ts)

key-decisions:
  - "update_achievement rarity param is required (not optional) — AchievementRarity enum type does not support .optional(); callers pass existing rarity value to leave it unchanged"
  - "seedAchievements uses Achievement.onInsert + removeOnInsert pattern (not unsub.remove()) — onInsert returns void in SpacetimeDB v2.1.0 SDK"
  - "Enum values in bootstrap script use { tag: 'Epic' } format (no value field for unit variants)"

patterns-established:
  - "Achievement checker: iter() on Achievement table is acceptable (admin-managed content <100 rows, not user data)"
  - "Criteria evaluation: MmrRating uses Math.max (best-mode semantics); PlayerStat/PlayerCharacterStat use sum (aggregate semantics)"
  - "Bootstrap script step numbering convention: N/4 after adding step 4"

requirements-completed: [ACHV-01, ACHV-02, ACHV-03, ACHV-04]

# Metrics
duration: 9min
completed: 2026-03-28
---

# Phase 07 Plan 02: Achievement Reducers and Finalization Hook Summary

**7 achievement reducers with criteria-driven auto-award hooked into finalization pipeline (step 16.5), full cascade deletion, tiered permissions, and 3 starter achievements seeded via post-publish bootstrap**

## Performance

- **Duration:** 9 min
- **Started:** 2026-03-28T05:14:51Z
- **Completed:** 2026-03-28T05:24:03Z
- **Tasks:** 4
- **Files modified:** 10 (6 source + 4 generated bindings)

## Accomplishments

- Achievement checker helper with explicit field map, AND criteria logic, per-user and global cap enforcement
- 7 reducers covering full CRUD lifecycle: create/update/delete achievement, add/remove criteria, manual_award, set_displayed_achievement
- Cascade deletion covers all 4 entities: criteria rows, UserAchievement rows, User.displayedAchievementId refs, then Achievement row
- Tiered permission for manual_award: Moderator+ unrestricted, TournamentHost scoped to own tournament participants via organizer_id index
- Achievement checker hooked into runFinalization at step 16.5 (after stat increments, before bracket advancement)
- Module published to maincloud with --clear-database; 7 new reducer bindings generated; 61/61 tests pass
- Post-publish bootstrap seeds 3 starter achievements (MMR Elite, Veteran, Solar First Tournament Winner)

## Task Commits

Each task was committed atomically:

1. **Task 1: Create achievement checker helper** - `b12d5cf` (feat)
2. **Task 2: Create achievement management reducers** - `9951125` (feat)
3. **Task 3: Hook checker into finalization, publish, update docs** - `bf8b383` (feat)
4. **Task 4: Add starter achievements to bootstrap script** - `da92ed2` (feat)

## Files Created/Modified

- `spacetimedb/src/helpers/achievementChecker.ts` — Created: checkAndAwardAchievements, evaluateCriterion, getField switch map, applyOperator
- `spacetimedb/src/reducers/achievementManagement.ts` — Created: 7 achievement reducers with full permission/validation logic
- `spacetimedb/src/helpers/finalizationHelpers.ts` — Modified: added achievementChecker import + step 16.5 loop
- `spacetimedb/src/index.ts` — Modified: added achievementManagement re-export
- `docs/achievements/architecture.md` — Rewritten: Phase 07 schema, reducer reference, auto-award pipeline
- `scripts/post-publish.ts` — Modified: seedAchievements function + step 4/4 bootstrap seeding

## Decisions Made

- `update_achievement` rarity parameter is required (not optional) — the `AchievementRarity` enum type does not support `.optional()` in SpacetimeDB SDK. Callers pass existing rarity when not updating.
- `seedAchievements` uses `Achievement.onInsert(cb)` + `Achievement.removeOnInsert(cb)` — onInsert returns `void` in SDK v2.1.0, not an unsubscribe handle
- Enum values in bootstrap script use `{ tag: 'Epic' }` (no `value` field) for unit variant tagged unions in TypeScript client
- MmrRating criteria evaluation uses `Math.max` across all rows (best-mode semantics, not aggregate)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed incorrect t.satsType() API usage in reducer param schema**
- **Found during:** Task 2 (achievement management reducers)
- **Issue:** Plan template used `t.satsType() as any` which is not a real SpacetimeDB API — would cause build failure
- **Fix:** Replaced with actual `AchievementRarity` and `ComparisonOperator` enum type imports
- **Files modified:** spacetimedb/src/reducers/achievementManagement.ts
- **Verification:** spacetime publish succeeded, 61/61 tests pass
- **Committed in:** 9951125 (Task 2 commit)

**2. [Rule 1 - Bug] Fixed onInsert return type — unsub.remove() does not exist**
- **Found during:** Task 4 (post-publish bootstrap)
- **Issue:** Plan showed `const unsub = connection.db.achievement.onInsert(...)` then `unsub.remove()`. onInsert returns void, not a subscription handle
- **Fix:** Stored callback reference; used `removeOnInsert(cb)` for cleanup; fixed table accessor to `Achievement` (PascalCase)
- **Files modified:** scripts/post-publish.ts
- **Verification:** No TypeScript errors after fix
- **Committed in:** da92ed2 (Task 4 commit)

**3. [Rule 1 - Bug] Fixed enum value format in bootstrap script**
- **Found during:** Task 4 (TypeScript type checking)
- **Issue:** Plan used `{ tag: 'Epic', value: undefined }` but SDK unit variant type is `{ tag: 'Epic' }` (no value field)
- **Fix:** Removed `value: undefined` from all rarity/operator literals
- **Files modified:** scripts/post-publish.ts
- **Verification:** No TypeScript errors
- **Committed in:** da92ed2 (Task 4 commit)

---

**Total deviations:** 3 auto-fixed (3 Rule 1 bugs)
**Impact on plan:** All fixes necessary for correctness — would have caused build errors or runtime failures. No scope changes.

## Issues Encountered

None beyond the auto-fixed items above. Module published cleanly, all 61 tests pass.

## Known Stubs

None — all achievement data paths are wired to real reducer logic and stat tables.

## Next Phase Readiness

- Achievement backend is complete: ACHV-01 through ACHV-04 addressed
- Frontend can subscribe to Achievement, UserAchievement, AchievementCriteria tables
- Achievement checker fires automatically on every match finalization
- Post-publish bootstrap seeds initial achievements on fresh deployments

---
*Phase: 07-achievements-and-titles*
*Completed: 2026-03-28*

## Self-Check: PASSED

- spacetimedb/src/helpers/achievementChecker.ts: FOUND
- spacetimedb/src/reducers/achievementManagement.ts: FOUND
- docs/achievements/architecture.md: FOUND
- scripts/post-publish.ts: FOUND
- .planning/phases/07-achievements-and-titles/07-02-SUMMARY.md: FOUND
- Commit b12d5cf: FOUND
- Commit 9951125: FOUND
- Commit bf8b383: FOUND
- Commit da92ed2: FOUND
