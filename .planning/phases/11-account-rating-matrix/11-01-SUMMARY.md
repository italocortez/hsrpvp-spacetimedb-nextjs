---
phase: 11-account-rating-matrix
plan: 01
subsystem: database
tags: [spacetimedb, account-rating, matrix-formula, unit-tests, vitest]

# Dependency graph
requires:
  - phase: 05-match-results-mmr
    provides: accountRating field on HsrAccount, updateAccountRating call sites
  - phase: 09-lobby-draft-overhaul
    provides: Archetype and HsrCharacterArchetype tables already in schema
provides:
  - HsrCharacter table extended with versionReleased (f64) and treatAsVersion (f64) columns
  - AccountRatingConfig single-row config table with 10 tunable f64 parameters
  - computeAccountRating: matrix formula with vertical/horizontal dimensions + age decay
  - computeMaxPossible: normalization ceiling for the matrix formula
  - Comprehensive unit test suite (15 tests) for matrix formula validation
affects:
  - 11-02 (seed scripts need versionReleased/treatAsVersion in normalizeCharacters)
  - 11-03 (admin reducers read AccountRatingConfig, call computeMaxPossible)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Single-row config table with sentinel PK=1 (AccountRatingConfig follows EloConfig pattern)
    - Age-weighted rating formula with role-dependent exponential decay
    - computeMaxPossible as separate exported function for admin recalculation

key-files:
  created:
    - spacetimedb/src/tables/accountRatingConfig.ts
  modified:
    - spacetimedb/src/tables/hsrCharacter.ts
    - spacetimedb/src/schema.ts
    - spacetimedb/src/helpers/accountRating.ts
    - test/backend/match-results/account-rating.unit.test.ts

key-decisions:
  - "computeMaxPossible takes pre-built ageWeightMap to avoid recomputing twice when called from computeAccountRating fallback"
  - "updateAccountRating wrapper kept exactly as-is; 4 existing call sites require no changes (D-31)"
  - "maxVersion computed dynamically from HsrCharacter rows every call (D-16) — no caching to stay current on new character additions"
  - "config.maxPossible > 0 used as the fast path; falls back to computing on-the-fly when not yet seeded"

patterns-established:
  - "AccountRatingConfig: single-row table pattern with sentinel PK=1 (same as EloConfig)"
  - "Matrix formula: vertical × vWeight + horizontal × hWeight, normalized by maxPossible, scaled by config.scale"
  - "Age weight: sqrt(effective/maxVersion)^roleExponent where effective = floor(v) + frac(v)*compression"

requirements-completed: [ARCH-01]

# Metrics
duration: 11min
completed: 2026-04-06
---

# Phase 11 Plan 01: Account Rating Matrix — Schema + Formula Summary

**Matrix-based account rating replacing temporary Phase 5 formula: sqrt age-weighted vertical (eidolon depth, 40%) + archetype coverage horizontal (60%), normalized by maxPossible, 15 unit tests passing**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-06T18:08:26Z
- **Completed:** 2026-04-06T18:19:31Z
- **Tasks:** 2
- **Files modified:** 4 (+ 1 created)

## Accomplishments

- Added `versionReleased` and `treatAsVersion` f64 columns to HsrCharacter, enabling age-based weighting in the formula
- Created AccountRatingConfig single-row table with 10 tunable parameters (weights, exponents, compression, scale, maxPossible) following the EloConfig pattern
- Replaced the TEMPORARY Phase 5 formula (`5 * (1 + eidolonLevel)`, capped at 1000) with the full matrix formula: age-weighted vertical depth + archetype coverage horizontal, normalized by maxPossible
- Comprehensive 15-test TDD suite validating all formula behaviors: edge cases, role-decay ordering, compression effect, dynamic archetype threshold, treatAsVersion override, and normalization

## Task Commits

1. **Task 1: HsrCharacter columns + AccountRatingConfig table** - `73c4481` (feat)
2. **Task 2 RED: Failing unit tests for matrix formula** - `051db9a` (test)
3. **Task 2 GREEN: Matrix formula implementation** - `f3e7718` (feat)

## Files Created/Modified

- `spacetimedb/src/tables/accountRatingConfig.ts` — New single-row config table (AccountRatingConfig) with 10 f64 config columns + audit columns
- `spacetimedb/src/tables/hsrCharacter.ts` — Added `versionReleased: t.f64()` and `treatAsVersion: t.f64()` before audit columns
- `spacetimedb/src/schema.ts` — Import and registration of AccountRatingConfig
- `spacetimedb/src/helpers/accountRating.ts` — Full rewrite of computeAccountRating + new computeMaxPossible export; updateAccountRating wrapper unchanged
- `test/backend/match-results/account-rating.unit.test.ts` — Complete rewrite for new formula (15 tests, all passing)

## Decisions Made

- `computeMaxPossible` takes a pre-built `ageWeightMap` parameter rather than rebuilding it internally, since `computeAccountRating` already computes the map and passes it in the fallback path. This avoids double-computation while keeping the function usable standalone (admin reducers will build the map themselves in Plan 03).
- `maxVersion` is derived from `c.versionReleased` (not `treatAsVersion`) for the pool maximum, consistent with D-16. The `treatAsVersion` only affects a specific character's own age weight, not the normalization ceiling.
- TypeScript `any` typing retained for ctx parameter — consistent with existing codebase pattern across all helpers.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Worktree was created from an old base commit (main branch instead of feature_nath_claude HEAD). Git soft reset + `git checkout HEAD -- .` restored the working tree to the correct state before implementation began. No code impact.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- AccountRatingConfig table and matrix formula are ready for Plan 02 (admin seed + update reducers for AccountRatingConfig)
- HsrCharacter now has `versionReleased` and `treatAsVersion` columns ready for seed script updates in Plan 02
- `computeMaxPossible` is exported and ready for use by `admin_recalculate_all_ratings` in Plan 03
- `updateAccountRating` wrapper unchanged — all 4 existing call sites (roster.ts x2, rosterAdmin.ts x2) work without modification

---
*Phase: 11-account-rating-matrix*
*Completed: 2026-04-06*

## Self-Check: PASSED

- FOUND: spacetimedb/src/tables/hsrCharacter.ts
- FOUND: spacetimedb/src/tables/accountRatingConfig.ts
- FOUND: spacetimedb/src/helpers/accountRating.ts
- FOUND: test/backend/match-results/account-rating.unit.test.ts
- FOUND commit: 73c4481 (Task 1)
- FOUND commit: 051db9a (Task 2 RED)
- FOUND commit: f3e7718 (Task 2 GREEN)
- All 15 unit tests passing
