---
phase: 04-bracket-generation-and-advancement
plan: "02"
subsystem: database
tags: [spacetimedb, tournament, bracket, algorithms, seeding, fold-seeding, double-elimination, round-robin, snake-seeding]

# Dependency graph
requires:
  - phase: 04-bracket-generation-and-advancement
    plan: "01"
    provides: BracketSide enum, updated BracketMatch/TournamentTeam/GroupStanding/Tournament tables, stage transition guards
provides:
  - Pure bracket generation helper functions (fold seeding, circle scheduling, snake distribution, single/double/group/hybrid bracket creation)
  - generate_bracket reducer: creates BracketMatch rows for all 5 tournament formats with two-pass FK wiring
  - seed_bracket reducer: assigns seedNumber to TournamentTeams by MMR (captain's rating) or deterministic hash
  - swap_seeds reducer: exchanges seedNumber between two teams during Seeding stage
  - Updated brackets architecture doc
affects:
  - 04-03: advance_bracket_match and submit_and_advance_bracket depend on nextWinnerMatchId/nextLoserMatchId FK links created here

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure helper pattern — bracket generation algorithms in helpers/bracketGeneration.ts with no DB access; reducer calls helpers then persists
    - Two-pass FK wiring — insert all BracketMatch rows with null FKs (pass 1), update FK links via positionKey->id map (pass 2), auto-advance BYE matches (pass 3)
    - Deterministic seeding — (tournamentId * 31 + teamId) % 2147483647 for 'random' mode; no Math.random() (reducers must be deterministic)

key-files:
  created:
    - spacetimedb/src/helpers/bracketGeneration.ts
    - spacetimedb/src/reducers/bracketGeneration.ts
  modified:
    - spacetimedb/src/index.ts
    - docs/brackets/architecture.md

key-decisions:
  - "Deterministic seeding hash (tournamentId * 31 + teamId) % 2147483647 for 'random' mode — SpacetimeDB reducers must be deterministic; no Math.random()"
  - "groupMatchNumber resets per group, globalMatchCounter increments globally for unique matchNumber across groups in generateGroupPhaseBracket"
  - "Hybrid format elimination bracket generated with placeholder teamIds (1..advancingCount) to size the bracket correctly; all participant slots cleared to undefined before insertion"
  - "Crossed losers feed-in implemented via crossedLosersPosition helper — reverses position within LB match count to minimize rematches"

patterns-established:
  - "Two-pass FK wiring: insert all matches with null FKs, build positionKey->insertedId map, then update FKs — avoids chicken-and-egg problem with autoInc IDs"
  - "Pure helper + reducer split: helpers/bracketGeneration.ts has zero ctx.db references; reducers/bracketGeneration.ts handles all DB operations"

requirements-completed:
  - BRKT-01
  - BRKT-02
  - BRKT-03
  - BRKT-05
  - BRKT-06

# Metrics
duration: 4min
completed: 2026-03-18
---

# Phase 4 Plan 02: Bracket Generation Algorithms and Reducers Summary

**Fold seeding, circle scheduling, snake distribution, and two-pass FK wiring for all 5 tournament formats across 570 lines of pure helpers + 3 reducers (generate_bracket, seed_bracket, swap_seeds)**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-03-18T14:18:04Z
- **Completed:** 2026-03-18T14:22:17Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Created `helpers/bracketGeneration.ts` (pure functions, zero DB access): `foldSeeding`, `generateSingleElimBracket`, `generateDoubleElimBracket`, `circleSchedule`, `snakeSeedIntoGroups`, `generateGroupPhaseBracket`, `generateHybridBracket` with full `BracketMatchDescriptor` interface
- Created `reducers/bracketGeneration.ts`: `generate_bracket` (all 5 formats, two-pass FK wiring, BYE auto-advancement, GroupStanding creation), `seed_bracket` (MMR and deterministic random modes), `swap_seeds` (validates team ownership, swaps seedNumber)
- All 5 tournament formats branch in `generate_bracket`: SingleElimination, DoubleElimination, GroupOnly, GroupIntoSingleElim, GroupIntoDoubleElim
- Updated brackets architecture doc to reflect Phase 4 schema changes and new reducers

## Task Commits

Per CLAUDE.md: code changes are NOT committed. Changes are left unstaged for user review in VS Code before committing.

1. **Task 1: Create bracket generation helper functions** - unstaged
2. **Task 2: Create bracket generation, seeding, and swap_seeds reducers** - unstaged

## Files Created/Modified

- `spacetimedb/src/helpers/bracketGeneration.ts` - NEW: pure bracket generation algorithms (BracketMatchDescriptor interface + 7 exported functions, ~260 lines)
- `spacetimedb/src/reducers/bracketGeneration.ts` - NEW: generate_bracket, seed_bracket, swap_seeds reducers with insertBracketMatches and insertGroupStandings internal helpers (~380 lines)
- `spacetimedb/src/index.ts` - Added export for generate_bracket, seed_bracket, swap_seeds
- `docs/brackets/architecture.md` - Updated with Phase 4 schema changes, new reducers table, algorithm descriptions, and all 5 tournament flows

## Decisions Made

- **Deterministic hash for 'random' seeding mode**: `(tournamentId * 31 + teamId) % 2147483647` — SpacetimeDB reducers must be deterministic; Math.random() is forbidden. This gives consistent but shuffled ordering across calls.
- **Hybrid bracket placeholder trick**: `generateHybridBracket` generates elimination bracket structure using `Array.from({length: advancingCount}, (_, i) => i + 1)` as placeholder IDs, then clears all participant slots to `undefined` before insertion. This correctly sizes the bracket without phantom team data.
- **Crossed losers feed-in**: `crossedLosersPosition` reverses position within the LB match count to minimize rematches per the RESEARCH.md specification.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

Two pre-existing TypeScript errors in auth.ts and server.ts (missing `displayedAchievementId` on User inserts) were present before this plan and remain unchanged. These are out of scope and documented in deferred-items.

## User Setup Required

None - no external service configuration required. Database will need republishing with `--clear-database` when the user is ready to go live with Phase 4 changes (schema changes from plan 01 still require this).

## Next Phase Readiness

- Bracket generation complete — Phase 4 Plan 03 (bracket advancement reducers) can proceed
- All BracketMatch rows use explicit FK links (nextWinnerMatchId, nextLoserMatchId) ready for advancement logic
- GroupStanding rows created for group-phase formats, ready for win/loss tracking
- seed_bracket and swap_seeds enable TO to control seeding before calling generate_bracket

---
*Phase: 04-bracket-generation-and-advancement*
*Completed: 2026-03-18*
