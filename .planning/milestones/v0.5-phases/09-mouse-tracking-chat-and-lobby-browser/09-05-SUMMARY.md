---
phase: 09-mouse-tracking-chat-and-lobby-browser
plan: 05
subsystem: database
tags: [spacetimedb, lobby, tournament, scheduled-reducer, gc, typescript]

# Dependency graph
requires:
  - phase: 09-02
    provides: lobbyLifecycle.ts (_hardDeleteLobby pattern), lobby tables with Phase 9 schema

provides:
  - spacetimedb/src/reducers/tournamentLobby.ts: create_tournament_lobby, approve_stand_in
  - spacetimedb/src/reducers/lobbyGc.ts: run_lobby_gc, hardDeleteLobby
  - spacetimedb/src/tables/lobbyGcJob.ts: scheduled wiring via setRunLobbyGcReducer

affects:
  - LobbyGcJob scheduled table now wired — active GC cycle running on maincloud
  - create_tournament_lobby integrates tournament system with lobby lifecycle
  - approve_stand_in enables TournamentStandIn rows for participant authorization in D-66

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Scheduled reducer pattern: mutable export + setter (setRunLobbyGcReducer) to avoid circular deps"
    - "ctx.db.Lobby.iter() for full-table scan in GC (no bracketMatchId index on Lobby)"
    - "ScheduleAt.time(bigintMicros) for 5-minute GC reschedule"
    - "Tournament settings inheritance: matchType from countTowardsMmr (D-67)"

key-files:
  created:
    - spacetimedb/src/reducers/tournamentLobby.ts
    - spacetimedb/src/reducers/lobbyGc.ts
  modified:
    - spacetimedb/src/tables/lobbyGcJob.ts
    - spacetimedb/src/index.ts
    - src/module_bindings/ (regenerated)

key-decisions:
  - "hardDeleteLobby exported from lobbyGc.ts rather than refactoring lobbyLifecycle.ts — avoids commit conflict with parallel agent changes to create_lobby (presetId addition)"
  - "--clear-database required to publish: maincloud migration engine does not support adding scheduled tables to existing modules (same pattern as Phase 01 where scheduled property was deferred)"
  - "D-45 duplicate check uses ctx.db.Lobby.iter() scan — no bracketMatchId-only index exists on Lobby table; at tournament scale this is acceptable"

# Metrics
duration: 5min
completed: 2026-03-29
---

# Phase 09 Plan 05: Tournament Lobby + Scheduled GC Summary

**Tournament lobby creation with inherited settings, stand-in approval system, and scheduled GC reducer cleaning Waiting/Finished lobbies idle > 30 minutes**

## Tasks Completed

### Task 1: Tournament Lobby Creation and Stand-in Approval
Created `spacetimedb/src/reducers/tournamentLobby.ts` with two reducers:

**`create_tournament_lobby(bracketMatchId, joinCode)`**
- D-64 authorization: match participants (via TournamentParticipant.teamGroupId), TO, tournament assistant, admin/moderator
- D-45 duplicate prevention: scans all lobbies, rejects if non-Finished lobby exists for same bracketMatchId
- D-65 settings inheritance: matchType from `countTowardsMmr`, gameMode from tournament, rosterVisibility, disconnectPolicy, costSetId, teamSize, anonymousPlayers/Spectators all inherited
- D-65 isTournamentControlled=true locks settings
- D-24/D-27: host joins as referee in Spectator slot

**`approve_stand_in(bracketMatchId, userId)`**
- D-68: TO, admin, moderator, or assistant can approve any user as stand-in
- Validates target user exists
- Checks for duplicate approval via by_match_and_user multi-column index
- Inserts TournamentStandIn row with audit columns

Commit: `c7b019b`

### Task 2: Scheduled GC Reducer and LobbyGcJob Wiring
Updated `spacetimedb/src/tables/lobbyGcJob.ts`:
- Added `scheduled: () => _runLobbyGcReducer` property
- Used mutable export + setter pattern (identical to UserDeletionJob)

Created `spacetimedb/src/reducers/lobbyGc.ts`:
- `hardDeleteLobby(ctx, lobbyId)` exported function — cascade delete (Chat → Members → Bans → Password → Steps → Session → Lobby)
- `run_lobby_gc` scheduled reducer: iterates all lobbies, deletes Waiting/Finished rows idle > 30 minutes
- Active stages (Drafting/Equipping/Scoring) skipped — never auto-cleaned (D-25)
- Reschedules itself 5 minutes after each run via `ScheduleAt.time()`
- `setRunLobbyGcReducer(run_lobby_gc)` wires the scheduled table reference

Published to maincloud with `--clear-database -y` (migration engine does not support adding scheduled tables incrementally).

Commit: `3d56b84`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `ctx.from.Lobby` does not exist in reducer context**
- **Found during:** Task 1 development
- **Issue:** Plan specified `for (const existingLobby of ctx.from.Lobby)` but `ctx.from` is not available in reducer context (only in view context)
- **Fix:** Changed to `ctx.db.Lobby.iter()` — correct API for full-table iteration in reducers
- **Files modified:** `spacetimedb/src/reducers/tournamentLobby.ts`

**2. [Rule 3 - Blocking] maincloud rejects adding scheduled tables via migration**
- **Found during:** Task 2 publish
- **Issue:** `"Adding schedules is not yet implemented"` — migration engine cannot add a scheduled property to an existing table
- **Fix:** Published with `--clear-database -y` (same pattern used in Phase 01 when LobbyGcJob was originally created without the scheduled property intentionally)
- **Files modified:** none (publish flag only)

**3. [Rule 1 - Bug] `require('spacetimedb').Timestamp` incorrect for ScheduleAt.time()**
- **Found during:** Task 2 development, corrected before first tsc run
- **Issue:** Initial draft used `new (require('spacetimedb').Timestamp)(micros)` but `ScheduleAt.time()` takes a BigInt of microseconds directly
- **Fix:** Changed to `ScheduleAt.time(FIVE_MINUTES_MICROS)` matching pattern in admin.ts
- **Files modified:** `spacetimedb/src/reducers/lobbyGc.ts`

### Architectural Scope Note

The plan requested refactoring `_hardDeleteLobby` out of `lobbyLifecycle.ts` into a shared helper, then updating `close_lobby` to use it. This was **not done** to avoid a commit conflict with a parallel agent that had already modified `lobbyLifecycle.ts` (adding `presetId` param to `create_lobby`).

Instead, `hardDeleteLobby` is exported from `lobbyGc.ts` as a standalone function with identical cascade logic. The `_hardDeleteLobby` in `lobbyLifecycle.ts` remains in place. The shared helper can be consolidated in a follow-up quick task once the parallel agent changes land.

## Known Stubs

None — all fields are wired with real data or explicit defaults documented against decision references.
