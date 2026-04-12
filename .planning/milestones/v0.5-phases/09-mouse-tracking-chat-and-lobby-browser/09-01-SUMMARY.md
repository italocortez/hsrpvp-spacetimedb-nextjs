---
phase: 09-mouse-tracking-chat-and-lobby-browser
plan: 01
subsystem: backend/schema
tags: [schema, enums, tables, spacetimedb, publish, bindings]
dependency_graph:
  requires: []
  provides:
    - LobbyStage enum with Equipping + Scoring variants
    - BanMode enum without Two variant
    - ActionType enum with EquipLightcone/ArrangeLineup/ConfirmLineup
    - LobbyConfigSnapshot with dual budgets
    - StepPayload with 3 new action payload types
    - Lobby table with all Phase 9 columns
    - LobbyMember with isConfirmed + isCaptain
    - MatchSession with auction state + split budgets + pause tracking
    - MatchSessionHistory with budget analysis + isPubliclyVisible
    - MatchSessionStepHistory with targetName (renamed from characterName)
    - MatchParticipantHistory with isReferee/isCoach/isCaptain
    - LobbyBan table (composite PK [lobbyId, bannedUserId])
    - LobbyPreset table (autoInc PK, full config mirror)
    - TournamentStandIn table (composite PK [bracketMatchId, userId])
    - LobbyGcJob table (scheduled columns, reducer wired in Plan 05)
  affects:
    - All downstream Phase 9 plans that use these tables
    - finalizationHelpers.ts (characterName -> targetName in step extraction)
    - LobbyConfigSnapshot usage in finalizationHelpers.ts (auctionBudget -> split budgets)
tech_stack:
  added: []
  patterns:
    - Composite PK pattern: LobbyBan[lobbyId, bannedUserId], TournamentStandIn[bracketMatchId, userId]
    - Scheduled table without reducer (LobbyGcJob deferred, not LobbyGcJob.scheduled — wired in Plan 05)
    - Dual budget model replacing single auctionBudget
key_files:
  created:
    - spacetimedb/src/tables/lobbyBan.ts
    - spacetimedb/src/tables/lobbyPreset.ts
    - spacetimedb/src/tables/tournamentStandIn.ts
    - spacetimedb/src/tables/lobbyGcJob.ts
    - src/module_bindings/lobby_ban_table.ts
    - src/module_bindings/lobby_preset_table.ts
    - src/module_bindings/tournament_stand_in_table.ts
  modified:
    - spacetimedb/src/types/enums.ts
    - spacetimedb/src/types/structs.ts
    - spacetimedb/src/tables/lobby.ts
    - spacetimedb/src/tables/lobbyMember.ts
    - spacetimedb/src/tables/matchSession.ts
    - spacetimedb/src/tables/matchSessionHistory.ts
    - spacetimedb/src/tables/matchSessionStepHistory.ts
    - spacetimedb/src/tables/matchParticipantHistory.ts
    - spacetimedb/src/schema.ts
    - src/module_bindings/index.ts (+ all updated binding files)
decisions:
  - "LobbyGcJob scheduled property omitted — SpacetimeDB rejects module when scheduled reducer is undefined; will be wired in Plan 05 when GC reducer is implemented"
  - "--clear-database required due to BanMode.Two removal (enum variant changes are breaking)"
metrics:
  duration: "287s (~4m)"
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_modified: 18
---

# Phase 09 Plan 01: Schema Foundation Summary

Phase 9 schema foundation — all enum changes, struct updates, 8 modified tables, and 4 new tables. Dual budget model (characterBudget + lightconeBudget) replaces single auctionBudget; auction state, post-draft action types, and tournament stand-in infrastructure added.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Update enums, structs, and modify existing tables | e39f59f | enums.ts, structs.ts, lobby.ts, lobbyMember.ts, matchSession.ts, matchSessionHistory.ts, matchSessionStepHistory.ts, matchParticipantHistory.ts |
| 2 | Create 4 new tables, register in schema, publish and generate bindings | d438a75 | lobbyBan.ts, lobbyPreset.ts, tournamentStandIn.ts, lobbyGcJob.ts, schema.ts, module_bindings/* |

## Changes Applied

### Enum Changes (enums.ts)
- **LobbyStage** (D-79): Added `Equipping` and `Scoring` variants (was: Waiting, Drafting, Finished → now: Waiting, Drafting, Equipping, Scoring, Finished)
- **BanMode** (D-80): Removed `Two` variant (now: None, Four, Six) — breaking change requiring --clear-database
- **ActionType** (D-81): Added `EquipLightcone`, `ArrangeLineup`, `ConfirmLineup` variants (total: 10)

### Struct Changes (structs.ts)
- **LobbyConfigSnapshot** (D-89): Replaced `auctionBudget: t.f32().optional()` with `characterBudget: t.f32()` + `lightconeBudget: t.f32()`
- **EquipLightconePayload** (D-57): New — characterName, lightconeName, superimposition, costPaid
- **ArrangeLineupPayload** (D-57): New — positions (JSON string)
- **ConfirmLineupPayload** (D-57): New — confirmed bool
- **StepPayload** (D-57): Added EquipLightcone/ArrangeLineup/ConfirmLineup variants

### Table Modifications
- **Lobby** (D-77): Added matchType, currentPlayerCount, characterBudget, lightconeBudget, minimumBidRaise, allowMirrorPicks, autoRandomPick, refereeCanUndo, refereeCanPause, refereeCanSetCaptain, refereeCanKick, allowPlayerPause; removed auctionBudget
- **LobbyMember** (D-78): Added isConfirmed, isCaptain
- **MatchSession** (D-71): Replaced teamBlueBudget/teamRedBudget with full auction state (isAuctionPhase, nextNominatorTeam, blueCharactersWon, redCharactersWon, currentNomination, currentBidAmount, currentBidTeam) + split budgets (teamBlueCharBudget, teamRedCharBudget, teamBlueLcBudget, teamRedLcBudget) + pause tracking (pausesUsedBlue, pausesUsedRed)
- **MatchSessionHistory** (D-84/D-88): Added teamBlueSpent, teamRedSpent, handicapApplied, isPubliclyVisible
- **MatchSessionStepHistory** (D-86): Renamed characterName → targetName
- **MatchParticipantHistory** (D-87): Added isReferee, isCoach, isCaptain

### New Tables
- **LobbyBan** (D-82): Composite PK [lobbyId, bannedUserId], btree indexes
- **LobbyPreset** (D-83b): AutoInc PK, full config field mirror, creator index
- **TournamentStandIn** (D-83/D-68): Composite PK [bracketMatchId, userId], btree indexes
- **LobbyGcJob** (D-25): Scheduled table columns only (scheduler wired in Plan 05)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed `scheduled:` property from LobbyGcJob**
- **Found during:** Task 2 — first publish attempt failed
- **Issue:** SpacetimeDB module rejects if a table has `scheduled:` property pointing to `undefined` function. The plan said "define columns only" but still included the `scheduled:` property with the lazy resolver pattern, which fails at publish time because `_runLobbyGcReducer` is never assigned.
- **Fix:** Removed `scheduled: () => _runLobbyGcReducer` from the table definition. Kept the mutable binding pattern (`_runLobbyGcReducer`, `setRunLobbyGcReducer`) so Plan 05 can wire it in when the GC reducer is created.
- **Files modified:** spacetimedb/src/tables/lobbyGcJob.ts
- **Commit:** d438a75

## Known Stubs

None — this is a schema-only plan. No data flows to UI.

## Downstream Impact

Tests referencing `characterName` on step history or `auctionBudget` on config snapshot will fail — this is expected per plan. Will be fixed in Plan 09 (test updates).

## Self-Check: PASSED
