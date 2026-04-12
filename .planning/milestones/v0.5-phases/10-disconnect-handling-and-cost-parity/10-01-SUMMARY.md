---
phase: 10-disconnect-handling-and-cost-parity
plan: 01
subsystem: database
tags: [spacetimedb, disconnect, reconnect, concede, lobby-gc, liveness-guard]

# Dependency graph
requires:
  - phase: 09-mouse-tracking-chat-and-lobby-browser
    provides: LobbyMember schema, lobby lifecycle reducers, draft/equip/score reducers, lobbyGc
provides:
  - DisconnectPolicy renamed (Standard/Deferred/NoAction), MatchOutcome.Concede, ConcedeTrigger enum
  - LobbyMember disconnect columns (voluntarilyLeft, disconnectedAt, disconnectPoolRemainingMs)
  - MatchResultRecord concede columns (matchOutcome, concedeTrigger, concedeSummary, concedeAtStage)
  - Lobby.refereeExclusiveConcede column
  - disconnectHelpers.ts (ensureMatchAlive, buildConcedeSummary, handleDisconnectPoolUpdate, isForfeitEligible, isThirdPartyReferee)
  - flagTransferHelpers.ts (transferCaptain, transferReferee, transferHost)
  - clientDisconnected handler with lobby member tracking and auto-pause
  - ensureMatchAlive guard in all draft/equip/score reducers
  - Extended join_lobby reconnect (Equipping/Scoring/AwaitingResult)
  - Active match leave_lobby with voluntarilyLeft preservation
  - hardDeleteLobby MatchResult* cascade deletion
  - run_lobby_gc active stage cleanup (all offline + 30min)
affects: [10-02, 10.1, 10.2, finalization, bracket-advancement]

# Tech tracking
tech-stack:
  added: []
  patterns: [ensureMatchAlive guard pattern, disconnect pool decrement, flag transfer on disconnect/leave, auto-pause on disconnect]

key-files:
  created:
    - spacetimedb/src/helpers/disconnectHelpers.ts
    - spacetimedb/src/helpers/flagTransferHelpers.ts
  modified:
    - spacetimedb/src/types/enums.ts
    - spacetimedb/src/tables/lobby.ts
    - spacetimedb/src/tables/lobbyMember.ts
    - spacetimedb/src/tables/lobbyPreset.ts
    - spacetimedb/src/tables/matchResult.ts
    - spacetimedb/src/helpers/lobbyHelpers.ts
    - spacetimedb/src/index.ts
    - spacetimedb/src/reducers/lobbyLifecycle.ts
    - spacetimedb/src/reducers/lobbyGc.ts
    - spacetimedb/src/reducers/draftClassic.ts
    - spacetimedb/src/reducers/draftControl.ts
    - spacetimedb/src/reducers/draftAuction.ts
    - spacetimedb/src/reducers/postDraft.ts
    - spacetimedb/src/reducers/scoreEntry.ts
    - spacetimedb/src/reducers/matchResultSubmission.ts
    - spacetimedb/src/reducers/lobbyPresets.ts
    - spacetimedb/src/reducers/lobbySettings.ts
    - spacetimedb/src/reducers/tournamentLobby.ts
    - spacetimedb/src/reducers/tournamentManagement.ts

key-decisions:
  - "DisconnectPolicy enum renamed: Pause->Deferred, TimerThenForfeit->Standard (requires --clear-database)"
  - "MatchOutcome.Aborted replaced with Concede; new ConcedeTrigger enum for disconnect/voluntary/referee causes"
  - "clientDisconnected auto-pauses drafting sessions with isAutoPause=true on disconnect"
  - "Flag transfers (captain/referee/host) are permanent on disconnect, not restored on reconnect"
  - "disconnectPoolRemainingMs initialized to 300000 (5 min) at start_draft for all members"
  - "leave_lobby during active match preserves row with voluntarilyLeft=true; auto-concede deferred to Plan 02"
  - "BigInt(now) - BigInt(disconnectedAt) pattern for safe micros->ms conversion in pool calculations"

patterns-established:
  - "ensureMatchAlive guard: call at top of every draft/equip/score reducer after lobby lookup"
  - "Disconnect pool: 5min budget per player per match, decremented on reconnect by elapsed time"
  - "Flag transfer helpers: deterministic (lowest userId) for captain/referee transfer on disconnect/leave"
  - "Active stage leave: voluntarilyLeft=true preserves member row instead of deletion"

requirements-completed: [DISC-01, DISC-02, DISC-03, DISC-04]

# Metrics
duration: 14min
completed: 2026-04-03
---

# Phase 10 Plan 01: Disconnect Handling Foundation Summary

**Schema contracts (enum renames, concede columns), disconnect detection, liveness guards, reconnect extension, voluntary leave, and GC active-stage cleanup -- all foundational mechanics for Phase 10 concede/forfeit**

## Performance

- **Duration:** 14 min
- **Started:** 2026-04-03T06:02:16Z
- **Completed:** 2026-04-03T06:15:55Z
- **Tasks:** 2/2
- **Files modified:** 21

## Accomplishments

- Renamed DisconnectPolicy enum variants (Standard/Deferred/NoAction) and replaced MatchOutcome.Aborted with Concede; added ConcedeTrigger enum and 7 new table columns across Lobby, LobbyMember, LobbyPreset, and MatchResultRecord
- Created disconnectHelpers.ts (5 exports) and flagTransferHelpers.ts (3 exports) as shared foundation for all disconnect/concede logic
- Wired ensureMatchAlive guard into 18 draft/equip/score/submit reducers, blocking post-concede actions
- Extended clientDisconnected to track lobby member disconnects with auto-pause and flag transfers
- Extended join_lobby reconnect to Equipping/Scoring/AwaitingResult stages with pool decrement and auto-resume
- Extended leave_lobby for active matches with voluntarilyLeft preservation and flag transfers
- Extended hardDeleteLobby with MatchResult* cascade and run_lobby_gc for active stage cleanup
- Published to maincloud with --clear-database, regenerated bindings, all 124 tests pass

## Task Commits

1. **Task 1: Schema changes -- enums, tables, new helper files** - `0070408` (feat)
2. **Task 2: clientDisconnected extension, ensureMatchAlive wiring, rejoin, leave, GC** - `8810151` (feat)

## Files Created/Modified

- `spacetimedb/src/helpers/disconnectHelpers.ts` - ensureMatchAlive, buildConcedeSummary, handleDisconnectPoolUpdate, isForfeitEligible, isThirdPartyReferee
- `spacetimedb/src/helpers/flagTransferHelpers.ts` - transferCaptain, transferReferee, transferHost
- `spacetimedb/src/types/enums.ts` - DisconnectPolicy renamed, MatchOutcome.Concede, ConcedeTrigger added
- `spacetimedb/src/tables/lobby.ts` - refereeExclusiveConcede added, disconnectForfeitAt/hostDisconnectTime removed
- `spacetimedb/src/tables/lobbyMember.ts` - voluntarilyLeft, disconnectedAt, disconnectPoolRemainingMs added
- `spacetimedb/src/tables/lobbyPreset.ts` - refereeExclusiveConcede added
- `spacetimedb/src/tables/matchResult.ts` - matchOutcome, concedeTrigger, concedeSummary, concedeAtStage added
- `spacetimedb/src/helpers/lobbyHelpers.ts` - ensureNotInLobby skips voluntarilyLeft members
- `spacetimedb/src/index.ts` - clientDisconnected extended with lobby member tracking
- `spacetimedb/src/reducers/lobbyLifecycle.ts` - join_lobby reconnect extended, leave_lobby active match handling
- `spacetimedb/src/reducers/lobbyGc.ts` - hardDeleteLobby MatchResult* cascade, run_lobby_gc active stages
- `spacetimedb/src/reducers/draftClassic.ts` - ensureMatchAlive in pick/ban/timer, pool init in start_draft
- `spacetimedb/src/reducers/draftControl.ts` - ensureMatchAlive in undo/pause/resume
- `spacetimedb/src/reducers/draftAuction.ts` - ensureMatchAlive in nominate/bid/pass/timer
- `spacetimedb/src/reducers/postDraft.ts` - ensureMatchAlive in equip/arrange/confirm/advance
- `spacetimedb/src/reducers/scoreEntry.ts` - ensureMatchAlive in record_game_scores
- `spacetimedb/src/reducers/matchResultSubmission.ts` - ensureMatchAlive in confirm/submit/dispute
- `spacetimedb/src/reducers/lobbyPresets.ts` - refereeExclusiveConcede param wired in create/update
- `spacetimedb/src/reducers/lobbySettings.ts` - refereeExclusiveConcede param wired in update
- `spacetimedb/src/reducers/tournamentLobby.ts` - refereeExclusiveConcede, removed old columns
- `spacetimedb/src/reducers/tournamentManagement.ts` - VALID_DISCONNECT_POLICIES updated

## Decisions Made

- DisconnectPolicy enum renamed: Pause->Deferred, TimerThenForfeit->Standard (requires --clear-database)
- MatchOutcome.Aborted replaced with Concede; ConcedeTrigger enum for disconnect/voluntary/referee causes
- clientDisconnected auto-pauses drafting sessions with isAutoPause=true on disconnect
- Flag transfers (captain/referee/host) are permanent on disconnect -- not restored on reconnect
- disconnectPoolRemainingMs initialized to 300000 (5 min) at start_draft for all members
- leave_lobby during active match preserves row with voluntarilyLeft=true; auto-concede deferred to Plan 02
- BigInt(now) - BigInt(disconnectedAt) pattern used for safe micros->ms conversion in pool calculations
- VALID_DISCONNECT_POLICIES in tournamentManagement.ts updated as auto-fix (Rule 3)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated VALID_DISCONNECT_POLICIES in tournamentManagement.ts**
- **Found during:** Task 1 (enum rename)
- **Issue:** tournamentManagement.ts had hardcoded old variant names ['Pause', 'TimerThenForfeit', 'NoAction']
- **Fix:** Updated to ['Standard', 'Deferred', 'NoAction']
- **Files modified:** spacetimedb/src/reducers/tournamentManagement.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 0070408 (Task 1 commit)

**2. [Rule 2 - Missing Critical] Added new LobbyMember columns to fresh insert sites**
- **Found during:** Task 1 (table column additions)
- **Issue:** Fresh LobbyMember inserts (create_lobby, join_lobby, tournament_lobby) lacked new columns voluntarilyLeft, disconnectedAt, disconnectPoolRemainingMs
- **Fix:** Added default values (false, undefined, 0) to all 3 fresh insert sites
- **Files modified:** lobbyLifecycle.ts, tournamentLobby.ts
- **Verification:** TypeScript compiles, module publishes
- **Committed in:** 0070408 (Task 1 commit)

**3. [Rule 1 - Bug] Fixed BigInt/number type mismatch in disconnectHelpers**
- **Found during:** Task 1 (disconnectHelpers creation)
- **Issue:** TypeScript error: `any - any` subtraction result divided by `BigInt(1000)` caused type mismatch
- **Fix:** Wrapped both operands with BigInt() for explicit bigint arithmetic
- **Files modified:** spacetimedb/src/helpers/disconnectHelpers.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 0070408 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (1 bug, 1 missing critical, 1 blocking)
**Impact on plan:** All auto-fixes necessary for correctness. No scope creep.

## Issues Encountered

None -- plan executed smoothly after auto-fixes.

## Known Stubs

- `leave_lobby` auto-concede path (line ~385): console.log placeholder -- Plan 02 wires performConcede here. Intentional per plan scope.

## User Setup Required

None -- no external service configuration required. Database was cleared and republished.

## Next Phase Readiness

- All schema contracts in place for Plan 02's concede/forfeit reducers
- disconnectHelpers and flagTransferHelpers exported and ready for Plan 02 consumption
- ensureMatchAlive guard prevents post-concede actions in all reducer paths
- leave_lobby auto-concede placeholder ready for Plan 02's performConcede wiring

## Self-Check: PASSED

- disconnectHelpers.ts: FOUND
- flagTransferHelpers.ts: FOUND
- 10-01-SUMMARY.md: FOUND
- Commit 0070408: FOUND
- Commit 8810151: FOUND

---
*Phase: 10-disconnect-handling-and-cost-parity*
*Completed: 2026-04-03*
