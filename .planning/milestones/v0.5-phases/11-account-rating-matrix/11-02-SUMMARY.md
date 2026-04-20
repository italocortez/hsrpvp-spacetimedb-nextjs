---
phase: 11-account-rating-matrix
plan: 02
subsystem: database
tags: [spacetimedb, account-rating, admin-reducers, seed-scripts, archetype-seeding]

# Dependency graph
requires:
  - phase: 11-01
    provides: AccountRatingConfig table, computeMaxPossible, updateAccountRating, HsrCharacter versionReleased/treatAsVersion columns
provides:
  - admin_seed_rating_config: seeds AccountRatingConfig row with defaults, computes initial maxPossible
  - admin_update_rating_config: validates f64 inputs, updates config, recomputes maxPossible
  - admin_recalculate_all_ratings: recomputes maxPossible + iterates all HsrAccount rows
  - admin_bulk_upsert HsrCharacter: passes versionReleased/treatAsVersion, auto-triggers recalc on maxPossible change
  - seed scripts: normalizeCharacters with new fields, Archetype table seeding, junction row seeding via subscribe-then-assign
affects:
  - 11-03 (UAT/verification can now call admin_seed_rating_config + admin_recalculate_all_ratings)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - buildAgeWeightMap extracted as file-local helper in ratingAdmin.ts to avoid duplication across 3 reducers
    - Auto-trigger pattern: inline maxPossible recomputation + conditional all-ratings recalc after HsrCharacter bulk upsert
    - Subscribe-then-assign pattern for resolving auto-increment Archetype IDs before seeding junction rows

key-files:
  created:
    - spacetimedb/src/reducers/ratingAdmin.ts
  modified:
    - spacetimedb/src/reducers/admin.ts
    - spacetimedb/src/index.ts
    - scripts/seed-data.ts
    - test/shared/seed-data.ts

key-decisions:
  - "buildAgeWeightMap extracted as file-local helper in ratingAdmin.ts — identical logic needed in all 3 reducers, not worth a shared export"
  - "admin.ts uses `admin.id` (not `user.id`) for auto-trigger — consistent with existing ensureAdmin variable naming in that file"
  - "Change detection threshold 0.0001 for maxPossible comparison — avoids unnecessary all-ratings recalc on floating-point noise"
  - "test/shared/seed-data.ts moves console.log/disconnect/exit into archetype callback when assignments exist — ensures process doesn't exit before junction seeding completes"

# Metrics
duration: 22min
completed: 2026-04-06
---

# Phase 11 Plan 02: Admin Reducers + Seed Script Updates Summary

**Three AccountRatingConfig admin reducers (seed/update/recalculate), auto-trigger in admin_bulk_upsert HsrCharacter, and both seed scripts updated with versionReleased/treatAsVersion passthrough and archetype junction seeding**

## Performance

- **Duration:** 22 min
- **Started:** 2026-04-06T18:08:00Z
- **Completed:** 2026-04-06T18:30:26Z
- **Tasks:** 3
- **Files modified:** 4 (+ 1 created)

## Accomplishments

- Created `ratingAdmin.ts` with 3 admin reducers following the EloConfig pattern: `admin_seed_rating_config` (inserts row with defaults + computed maxPossible), `admin_update_rating_config` (validates all f64 args, recomputes maxPossible after change), `admin_recalculate_all_ratings` (updates maxPossible then iterates all HsrAccount rows). All gated with `ensureAdmin`.
- Updated `admin_bulk_upsert` HsrCharacter case to pass `versionReleased` and `treatAsVersion` through to the row object (EXPECTED_KEYS auto-includes them via `hsrCharacterColumns`). Added inline auto-trigger after the for-loop: recomputes maxPossible and fires `updateAccountRating` on all accounts if maxPossible changed by > 0.0001.
- Updated `scripts/seed-data.ts`: RawCharacter type extended, `normalizeCharacters` passes new fields, `extractArchetypeNames` + `extractArchetypeAssignments` helpers added, `buildSeedPayloads` includes Archetype table, `seedAll` adds post-upsert subscribe-then-assign junction seeding with 8s timeout when assignments exist.
- Updated `test/shared/seed-data.ts`: chars mapping includes new fields, archetypes extracted and added to tables array, archetype junction seeding added after batch upserts using subscribe-then-assign pattern with process.exit(0) inside callback.
- All 15 unit tests passing (no regression).
- TypeScript compiles cleanly (zero errors).

## Task Commits

1. **Task 1: ratingAdmin.ts + index.ts exports** - `7730a47` (feat)
2. **Task 2: admin_bulk_upsert HsrCharacter update** - `14bcee8` (feat)
3. **Task 3: Both seed scripts updated** - `d567aa7` (feat)

## Files Created/Modified

- `spacetimedb/src/reducers/ratingAdmin.ts` — New file: 3 admin reducers + buildAgeWeightMap helper
- `spacetimedb/src/reducers/admin.ts` — HsrCharacter case: versionReleased/treatAsVersion fields + auto-trigger block
- `spacetimedb/src/index.ts` — Added export line for all 3 new reducers from ratingAdmin.ts
- `scripts/seed-data.ts` — RawCharacter type, normalizeCharacters, archetype helpers, Archetype payload, junction seeding
- `test/shared/seed-data.ts` — chars mapping, archetypes extraction, Archetype in tables array, junction seeding

## Decisions Made

- `buildAgeWeightMap` extracted as a file-local helper in `ratingAdmin.ts`. The identical age-weight computation is needed in all 3 reducers (seed uses defaults, update uses merged config, recalculate uses current config). A file-local function avoids duplication without polluting the shared helper exports.
- `admin.ts` auto-trigger uses `admin.id` for `auditUpdate` calls, consistent with the variable name already established by `const admin = ensureAdmin(ctx)` earlier in that reducer. `ratingAdmin.ts` uses `user.id` following the `eloAdmin.ts` pattern.
- Change detection threshold of 0.0001 for maxPossible comparison in the auto-trigger prevents unnecessary all-ratings recalculation when floating-point arithmetic produces negligible differences.
- `test/shared/seed-data.ts` junction seeding: when archetype assignments exist, `console.log('Seed complete.')`, `conn.disconnect()`, and `process.exit(0)` are moved inside the `onApplied` callback to ensure the process doesn't exit before junction rows are seeded.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Worktree branch was on old base (main instead of feature_nath_claude HEAD at 8b8d8a1). Git soft reset + `git checkout HEAD -- .` restored the working tree, but the checkout brought previously-untracked files (node_modules, app/, etc.) into the staging area. Fixed by running `git reset HEAD -- .` to unstage everything, then staging only the specific target files before each commit.

## User Setup Required

None — no external service configuration required for this plan. Database publish with `--clear-database` remains required before the new columns and table become effective (noted in D-41, scoped to the overall Phase 11 delivery).

## Next Phase Readiness

- All 3 admin reducers ready for UAT (Phase 11 verification): `admin_seed_rating_config`, `admin_update_rating_config`, `admin_recalculate_all_ratings`
- Both seed scripts ready to run against a cleared database with the updated JSON (archetype + version fields)
- `admin_bulk_upsert HsrCharacter` auto-trigger wired: adding new characters via bulk upsert will automatically recalculate all ratings if maxPossible changes

---
*Phase: 11-account-rating-matrix*
*Completed: 2026-04-06*

## Self-Check: PASSED

- FOUND: spacetimedb/src/reducers/ratingAdmin.ts
- FOUND: spacetimedb/src/reducers/admin.ts
- FOUND: spacetimedb/src/index.ts
- FOUND: scripts/seed-data.ts
- FOUND: test/shared/seed-data.ts
- FOUND commit: 7730a47 (Task 1: ratingAdmin.ts + index.ts exports)
- FOUND commit: 14bcee8 (Task 2: admin_bulk_upsert HsrCharacter update)
- FOUND commit: d567aa7 (Task 3: both seed scripts updated)
- TypeScript: zero errors
- Unit tests: 15/15 passing
