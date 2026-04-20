---
phase: 09-mouse-tracking-chat-and-lobby-browser
plan: 02
subsystem: database
tags: [spacetimedb, lobby, reducers, typescript, validation-helpers]

# Dependency graph
requires:
  - phase: 09-01
    provides: LobbyBan, LobbyMember, Lobby, LobbyPassword, ChatMessage, LobbyCursorEvent tables with all Phase 9 schema changes

provides:
  - lobbyHelpers.ts: ensureNotInLobby, ensureGuestRestrictions, ensureLobbyMember, ensureHostOrAbove, ensureNotBanned, ensureStageIs, canKickOrBan
  - anonymousHelpers.ts: shouldAnonymize with D-70 same-team and D-71 spectator-referee bypass
  - lobbyLifecycle.ts: 6 lobby reducers (create, join, leave, close, kick, ban) live on maincloud
  - Bindings regenerated for all 6 reducers

affects:
  - 09-03 (chat reducers use ensureLobbyMember)
  - 09-04 (draft reducers use ensureStageIs, ensureLobbyMember)
  - 09-05 (ready-up uses ensureLobbyMember, lobby lifecycle validation)
  - all downstream plans that need lobby membership validation

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Composite PK delete: ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, userId])"
    - "Lobby hard-delete cascade order: Chat -> Members -> Bans -> Password -> Steps -> Session -> Lobby"
    - "Enum tag cast: { tag: 'ClosedNoRating', value: {} } as any for TypeScript compatibility"

key-files:
  created:
    - spacetimedb/src/helpers/lobbyHelpers.ts
    - spacetimedb/src/helpers/anonymousHelpers.ts
    - spacetimedb/src/reducers/lobbyLifecycle.ts
  modified:
    - spacetimedb/src/index.ts
    - src/module_bindings/ (regenerated)

key-decisions:
  - "LobbyCursorEvent is an event table — rows auto-delete after broadcast, no manual cleanup needed in close_lobby cascade"
  - "Empty Waiting lobby auto-closes on last member leave — prevents orphaned lobbies without a separate GC pass"
  - "canKickOrBan helper takes caller's LobbyMember row, not target's — needed to check caller's isReferee flag against refereeCanKick"

patterns-established:
  - "shouldAnonymize: shared helper for all anonymous enforcement views (D-69/D-70/D-71)"
  - "ensureNotInLobby: uses user_id btree index for O(1) membership check"
  - "_hardDeleteLobby: file-local helper shared by close_lobby and leave_lobby (empty auto-close)"

requirements-completed: [LBBY-02, CHAT-03]

# Metrics
duration: 15min
completed: 2026-03-29
---

# Phase 09 Plan 02: Lobby Lifecycle Reducers Summary

**6 lobby lifecycle reducers (create/join/leave/close/kick/ban) with shared lobbyHelpers and anonymousHelpers published to maincloud**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-29T11:28:00Z
- **Completed:** 2026-03-29T11:43:00Z
- **Tasks:** 2
- **Files modified:** 5 (3 created, 2 modified)

## Accomplishments
- Created `lobbyHelpers.ts` with 7 validation helpers covering D-22 (one lobby), D-23 (guest restrictions), D-21 (ban/kick permissions), D-32 (referee kick power)
- Created `anonymousHelpers.ts` with `shouldAnonymize` implementing D-69/D-70/D-71 same-team/spectator-referee rules
- Created `lobbyLifecycle.ts` with 6 reducers covering full lobby lifecycle, published to maincloud, bindings regenerated

## Task Commits

Each task was committed atomically:

1. **Task 1: Create lobbyHelpers.ts and anonymousHelpers.ts** - `c3c040f` (feat)
2. **Task 2: Create lobbyLifecycle.ts with 6 reducers** - `23df48e` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `spacetimedb/src/helpers/lobbyHelpers.ts` - 7 shared validation helpers for lobby operations
- `spacetimedb/src/helpers/anonymousHelpers.ts` - shouldAnonymize with D-70/D-71 rules
- `spacetimedb/src/reducers/lobbyLifecycle.ts` - 6 lobby lifecycle reducers
- `spacetimedb/src/index.ts` - added lobby lifecycle reducer exports
- `src/module_bindings/` - regenerated with 6 new reducer files

## Decisions Made
- `LobbyCursorEvent` is an event table (rows auto-delete after broadcast) — removed manual cleanup from `_hardDeleteLobby` cascade since there are no rows to delete
- Empty Waiting lobby on last leave auto-calls `_hardDeleteLobby` internally rather than requiring a separate `close_lobby` call — cleaner UX
- `canKickOrBan` takes the CALLER's LobbyMember row as `member` param (not the target) — the function checks `member.isReferee && lobby.refereeCanKick`, which is a property of the caller, not the target

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] LobbyCursorEvent has no id column or lobby_id index**
- **Found during:** Task 2 (close_lobby cascade)
- **Issue:** Plan specified `ctx.db.LobbyCursorEvent.id.delete(evt.id)` but LobbyCursorEvent is an event table with no `id` column or index. Iterating it would fail at runtime.
- **Fix:** Removed manual LobbyCursorEvent cleanup. Event tables auto-delete after broadcast — no rows persist to clean up.
- **Files modified:** spacetimedb/src/reducers/lobbyLifecycle.ts
- **Verification:** TypeScript compiles clean; event table behavior documented in comment

---

**Total deviations:** 1 auto-fixed (1 bug — event table misidentified in plan)
**Impact on plan:** Fix is correct behavior. Event tables cannot be manually iterated for deletion. No functional scope change.

## Issues Encountered
- TypeScript rejected `{ tag: 'ClosedNoRating', value: {} }` without `as any` cast — standard pattern from tournamentManagement.ts applied

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All lobby validation helpers available for chat reducers (Plan 03)
- Lobby create/join/leave/close/kick/ban live on maincloud and testable via CLI
- `shouldAnonymize` ready for anonymous view plans (Plan 07+)
- Deferred: `ensureStageIs` not yet called with Drafting/Equipping/Scoring variants — those will be used in Plan 04 (draft reducers)

---
*Phase: 09-mouse-tracking-chat-and-lobby-browser*
*Completed: 2026-03-29*
