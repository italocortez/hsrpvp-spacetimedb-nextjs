---
phase: 10-disconnect-handling-and-cost-parity
plan: 02
subsystem: database
tags: [spacetimedb, concede, forfeit, finalization, admin-tools, disconnect]

# Dependency graph
requires:
  - phase: 10-disconnect-handling-and-cost-parity
    plan: 01
    provides: DisconnectPolicy rename, MatchOutcome.Concede, ConcedeTrigger, LobbyMember disconnect columns, disconnectHelpers, flagTransferHelpers, ensureMatchAlive guard, clientDisconnected extension, join_lobby reconnect, leave_lobby voluntarilyLeft, hardDeleteLobby MatchResult* cascade, lobby_gc active-stage cleanup
provides:
  - concede_match, claim_forfeit, defer_match reducers with 3rd party referee exclusive control
  - performConcede shared helper for reducer and auto-concede paths
  - Concede finalization matrix (3-tier x 3-stage) branching in runFinalization
  - admin_force_finalize, admin_void_match, admin_set_bracket_winner reducers
  - leave_lobby auto-concede wired for last-player-on-team scenario
  - Architecture and contract docs updated with Phase 10 content
affects: [10.1, 10.2, finalization, bracket-advancement, tournament-admin]

# Tech tracking
tech-stack:
  added: []
  patterns: [concedeFlags gating pattern in runFinalization, admin toolbox for AwaitingResult resolution, performConcede shared helper]

key-files:
  created:
    - spacetimedb/src/reducers/concede.ts
    - spacetimedb/src/reducers/adminMatchTools.ts
  modified:
    - spacetimedb/src/helpers/finalizationHelpers.ts
    - spacetimedb/src/reducers/lobbyLifecycle.ts
    - spacetimedb/src/index.ts
    - docs/lobby/architecture.md
    - docs/lobby/contract.md
    - docs/match-results/architecture.md
    - docs/match-results/contract.md

key-decisions:
  - "organizerUserId field name corrected to organizerId (auto-fix from TypeScript error)"
  - "Admin export deferred from Task 1 to Task 2 since adminMatchTools.ts created in Task 2"
  - "Non-tournament admin_force_finalize uses winnerTeamId=1 for Blue, winnerTeamId=2 for Red (admin convention)"
  - "concedeParticipants fallback reads LobbyMember when MatchResultParticipant rows absent (early-stage concede)"

patterns-established:
  - "concedeFlags gating: each runFinalization step checks (!isConcede || concedeFlags.doXxx) for clean branching"
  - "performConcede helper: shared by concede_match, claim_forfeit, and leave_lobby auto-concede — single source of truth"
  - "Admin toolbox pattern: ensureAdminOrOrganizer validates Moderator+ OR tournament organizer/assistant"

requirements-completed: [DISC-01, DISC-02, DISC-03, DISC-04, COST-01]

# Metrics
duration: 11min
completed: 2026-04-03
---

# Phase 10 Plan 02: Concede Reducers, Finalization Matrix, Admin Toolbox Summary

**Concede/forfeit/defer reducers with 3rd party referee exclusive control, 3-tier x 3-stage concede finalization matrix in runFinalization, admin toolbox for AwaitingResult resolution, and leave_lobby auto-concede wiring**

## Performance

- **Duration:** 11 min
- **Started:** 2026-04-03T06:19:37Z
- **Completed:** 2026-04-03T06:30:39Z
- **Tasks:** 2/2
- **Files modified:** 15

## Accomplishments

- Created concede.ts with performConcede shared helper, concede_match (voluntary surrender), claim_forfeit (Standard policy disconnect forfeit), and defer_match (Deferred policy shelve to AwaitingResult) reducers
- Wired 3rd party referee exclusive concede control in all three reducers and leave_lobby auto-concede path
- Added concede finalization matrix to runFinalization with concedeFlags gating all 18 pipeline steps per tier (casual-nontourn / casual-tourn / ranked) and stage (Drafting / Equipping / Scoring)
- Created adminMatchTools.ts with admin_force_finalize (runs full finalization), admin_void_match (erases via hardDeleteLobby), admin_set_bracket_winner (direct bracket fix)
- Replaced leave_lobby Plan 01 auto-concede placeholder with actual performConcede call
- Published to maincloud, regenerated bindings (6 new reducer bindings), all 124 tests pass
- Updated lobby and match-results architecture/contract docs with Phase 10 content

## Task Commits

1. **Task 1: Concede/forfeit/defer reducers, auto-concede wiring, index exports** - `234c08e` (feat)
2. **Task 2: Concede finalization matrix, admin toolbox, docs** - `46cdc25` (feat)

## Files Created/Modified

- `spacetimedb/src/reducers/concede.ts` - performConcede helper, concede_match, claim_forfeit, defer_match reducers
- `spacetimedb/src/reducers/adminMatchTools.ts` - admin_force_finalize, admin_void_match, admin_set_bracket_winner reducers
- `spacetimedb/src/helpers/finalizationHelpers.ts` - Concede detection, concedeFlags matrix, concedeParticipants fallback, step gating
- `spacetimedb/src/reducers/lobbyLifecycle.ts` - leave_lobby auto-concede wired via performConcede
- `spacetimedb/src/index.ts` - Exports for 6 new reducers (3 concede + 3 admin)
- `docs/lobby/architecture.md` - Disconnect handling section, updated table schemas, new reducer entries
- `docs/lobby/contract.md` - Phase 10 execution entries in Phase History table
- `docs/match-results/architecture.md` - MatchResultRecord concede columns, ConcedeTrigger enum, admin toolbox, concede finalization matrix
- `docs/match-results/contract.md` - Phase 10 execution entries in Phase History table
- `src/module_bindings/` - 6 new reducer binding files + updated index.ts and types/reducers.ts

## Decisions Made

- Tournament field name is `organizerId` (not `organizerUserId`) -- auto-fixed from TypeScript compilation error
- Admin tool exports deferred from Task 1 to Task 2 since adminMatchTools.ts is created in Task 2 (prevents compile error)
- Non-tournament admin_force_finalize uses winnerTeamId=1 for Blue, winnerTeamId=2 for Red as admin convention
- concedeParticipants derived from LobbyMember when MatchResultParticipant rows are absent (supports early-stage concedes before participants are created)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Deferred admin exports to Task 2**
- **Found during:** Task 1 (index.ts export wiring)
- **Issue:** Plan specifies both concede and admin exports in Task 1, but adminMatchTools.ts doesn't exist until Task 2
- **Fix:** Added only concede exports in Task 1; added admin exports in Task 2 after file creation
- **Files modified:** spacetimedb/src/index.ts
- **Verification:** TypeScript compiles cleanly in both tasks
- **Committed in:** 234c08e (Task 1) and 46cdc25 (Task 2)

**2. [Rule 1 - Bug] Fixed organizerUserId -> organizerId**
- **Found during:** Task 2 (adminMatchTools.ts creation)
- **Issue:** Plan references `tournament.organizerUserId` but the actual field name is `organizerId`
- **Fix:** Changed all occurrences in adminMatchTools.ts to `organizerId`
- **Files modified:** spacetimedb/src/reducers/adminMatchTools.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 46cdc25 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for correctness. No scope creep.

## Issues Encountered

None -- plan executed smoothly after auto-fixes.

## Known Stubs

None -- all functionality fully wired.

## User Setup Required

None -- no external service configuration required. Module published to maincloud.

## Next Phase Readiness

- Phase 10 disconnect handling feature complete (Plan 01 schema + Plan 02 reducers)
- All 6 new reducers live on maincloud (concede_match, claim_forfeit, defer_match, admin_force_finalize, admin_void_match, admin_set_bracket_winner)
- Concede finalization matrix handles all 9 combinations of tier x stage
- Architecture and contract docs fully updated
- Ready for Phase 10.1 (match schema rework) and Phase 10.2 (tournamentId removal)

## Self-Check: PASSED

- concede.ts: FOUND
- adminMatchTools.ts: FOUND
- 10-02-SUMMARY.md: FOUND
- Commit 234c08e: FOUND
- Commit 46cdc25: FOUND

---
*Phase: 10-disconnect-handling-and-cost-parity*
*Completed: 2026-04-03*
