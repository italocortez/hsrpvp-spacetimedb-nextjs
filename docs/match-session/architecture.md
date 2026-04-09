# Match Session -- Architecture

Last updated: 2026-04-09

## Overview

Match sessions manage the real-time draft and game flow within a lobby. A `MatchSession` row is created when a draft starts and acts as the authoritative clock and stage state for that match. `MatchSessionStep` rows record every draft action (picks, bans, coin flips, etc.) as an append-only event log. At the end of a match, `run_finalization` snapshots all session data into history tables (`MatchSessionHistory`, `MatchSessionStepHistory`, `MatchParticipantHistory`) and hard-deletes the ephemeral rows. The timer model uses server-side `timerStartedAt` and `timerDurationSeconds`; pausing accumulates elapsed ms in `timerResumedOffset`. Both Classic and Auction draft modes share the same step infrastructure, differentiated by `stepType`.

## Table Relationships

```
Lobby (id: u32 autoInc PK)
  +-- MatchSession (lobbyId: u32 PK -- same as Lobby.id)  [public: true]
  |     lobbyId -> Lobby.id
  |     stage: MatchSessionStage (Waiting | Drafting | Equipping | Scoring | BetweenGames | AwaitingResult)
  |     currentTurnUserId: u32? -> User.id
  |     timerStartedAt: Timestamp?
  |     timerDurationSeconds: u32
  |     timerPausedAt: Timestamp?
  |     timerResumedOffset: u64 (accumulated elapsed ms before last resume)
  |     blueScore: u8
  |     redScore: u8
  |     currentGame: u8
  |     draftPhase: u8 (which segment of the pick/ban order)
  |     draftTurnIndex: u8 (position within current draftPhase)
  |     auctionBudgets: AuctionBudgetMap (per-user remaining auction budget, serialized)
  |     audit columns
  |
  +-- MatchSessionStep (id: u32 autoInc PK)  [public: true]
  |     lobbyId -> Lobby.id  [btree: lobby_id]
  |     stepType: MatchStepType (Pick | Ban | CoinFlip | AuctionBid | AuctionWin | SystemEvent)
  |     actorUserId: u32 -> User.id (0=anonymous sentinel)
  |     targetCharacterName: string? -> HsrCharacter.name
  |     targetLightconeName: string? -> HsrLightcone.name
  |     teamSide: TeamSide?
  |     bidAmount: u32? (Auction mode only)
  |     payload: string? (JSON -- extra context for system events)
  |     audit columns
  |     Indexes: lobby_id (btree)
  |
  +-- MatchParticipantHistory (PK: [matchResultId, userId])  [public: true]
  |     matchResultId -> MatchResultRecord.id  [btree: match_result_id]
  |     userId -> User.id
  |     teamSide: TeamSide
  |     charactersPicked: string[]
  |     lightconesPicked: string[]
  |     finalTeamScore: u8
  |     isWinner: bool
  |     audit columns
  |
  +-- MatchSessionHistory (matchResultId: u32 PK)  [public: true]
  |     matchResultId -> MatchResultRecord.id
  |     lobbyId: u32 (original lobby, preserved for reference)
  |     gameMode: GameMode
  |     draftMode: DraftMode
  |     teamSize: u8
  |     blueScore: u8
  |     redScore: u8
  |     audit columns
  |
  +-- MatchSessionStepHistory (id: u32 autoInc PK)  [public: true]
        matchResultId -> MatchResultRecord.id  [btree: match_result_id]
        stepType: MatchStepType
        actorUserId: u32
        targetCharacterName: string?
        targetLightconeName: string?
        teamSide: TeamSide?
        bidAmount: u32?
        payload: string?
        audit columns
        Indexes: match_result_id (btree)
```

## Reducer Flows

### initialize_match_session(lobbyId)
1. Called internally when `start_draft` transitions lobby to Drafting
2. Insert `MatchSession` row with `stage=Drafting`, `currentGame=1`, `draftPhase=0`, `draftTurnIndex=0`
3. Set `timerStartedAt=ctx.timestamp`, `timerDurationSeconds` from Lobby setting
4. Compute initial turn order from coin flip result; set `currentTurnUserId`

### flip_coin(lobbyId)
1. `getAuthenticatedUser(ctx)` -- caller must be in lobby
2. Lobby must be in Waiting stage (pre-draft coin flip)
3. Deterministic coin flip: `(lobbyId * 31 + ctx.timestamp.micros) % 2` -- no Math.random()
4. Insert `MatchSessionStep` with `stepType=CoinFlip`, result encoded in `payload`
5. Record which team picks first; stored on `MatchSession` for turn order computation

### submit_draft_action(lobbyId, stepType, characterName?, lightconeName?, bidAmount?)
1. `getAuthenticatedUser(ctx)`
2. Find `MatchSession` -- verify `stage=Drafting`
3. Verify `currentTurnUserId === caller.id` (it is caller's turn)
4. Timer check: if timer expired (elapsed > `timerDurationSeconds * 1000 - timerResumedOffset`): auto-pick or skip
5. Classic mode:
   - Validate `stepType` is `Pick` or `Ban`
   - Validate `characterName` is not already picked/banned in this lobby
   - Validate ownership if `requireOwnership=true`: character must be in caller's `HsrAccountCharacter`
   - Insert `MatchSessionStep`
   - Advance draft: increment `draftTurnIndex`; advance `draftPhase` and flip team at phase boundaries
6. Auction mode:
   - `stepType=AuctionBid`: validate bid <= caller's remaining budget in `auctionBudgets`
   - `stepType=AuctionWin`: resolve auction; deduct winning bid; assign character
   - Insert `MatchSessionStep`
7. Update `MatchSession`: new `currentTurnUserId`, `draftPhase`, `draftTurnIndex`
8. If draft complete: transition `MatchSession.stage=Equipping`; transition `Lobby.stage=Equipping`

### submit_equip_action(lobbyId, characterName, lightconeName)
1. `getAuthenticatedUser(ctx)` -- verify caller is in lobby (Equipping stage)
2. Find `MatchSession` -- verify `stage=Equipping`
3. Validate `lightconeName` path matches `characterName` path (must be same Path enum)
4. Validate lightcone ownership if `requireOwnership=true`
5. Insert `MatchSessionStep` with `stepType=Pick`, `targetCharacterName`, `targetLightconeName`
6. Check if all players have equipped all characters; if so: transition stage to Scoring
7. Update `MatchSession.stage=Scoring`; update `Lobby.stage=Scoring`

### pause_timer(lobbyId) / resume_timer(lobbyId)
1. Permission: host OR referee (if `refereeControlsShelving=true`) OR TO/Mod+
2. `pause_timer`: verify timer running (`timerPausedAt=null`); set `timerPausedAt=ctx.timestamp`
3. `resume_timer`: compute elapsed since pause; add to `timerResumedOffset`; clear `timerPausedAt`; set `timerStartedAt=ctx.timestamp`

### advance_stage(lobbyId, targetStage)
1. Permission: host OR referee OR TO/Mod+
2. Validate stage transition is legal from current `MatchSession.stage`
3. Insert system `MatchSessionStep` with `stepType=SystemEvent`, payload indicating stage change
4. Update `MatchSession.stage` and `Lobby.stage`

### advance_to_next_game(lobbyId)
1. Permission: host OR TO/Assistant/Mod+; referee if `refereeControlsShelving=true`
2. Lobby must be in BetweenGames stage
3. Increment `MatchSession.currentGame`; reset draft state (`draftPhase=0`, `draftTurnIndex=0`)
4. Transition `MatchSession.stage=Drafting`; transition `Lobby.stage=Drafting`
5. Restart timer: `timerStartedAt=ctx.timestamp`, clear `timerPausedAt`, reset `timerResumedOffset=0`

### shelve_series(lobbyId)
1. Permission: host OR TO/Mod+; referee if `refereeControlsShelving=true`
2. Lobby must be in BetweenGames or active stage (not Closed/AwaitingResult)
3. Transition `Lobby.stage=Shelved`; update `MatchSession.stage=Shelved`

### resume_series(lobbyId)
1. Same permission as shelve_series
2. Lobby must be in Shelved stage
3. Transition back to BetweenGames; restart timer

### Finalization snapshot (called from run_finalization)
1. Insert `MatchSessionHistory` row from `MatchSession` fields
2. Copy all `MatchSessionStep` rows to `MatchSessionStepHistory` (swap `lobbyId` for `matchResultId`)
3. Insert `MatchParticipantHistory` rows from `MatchResultParticipant` rows
4. Delete all `MatchSessionStep` rows for this lobby (via `lobby_id` index)
5. Delete `MatchSession` row for this lobby

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| MatchSession uses lobbyId as PK (same as Lobby.id) -- one session per lobby | Phase 07 CONTEXT.md | 2026-03-07 |
| MatchSessionStep append-only event log -- no updates, only inserts and bulk delete on finalization | Phase 07 CONTEXT.md | 2026-03-07 |
| Timer model: server-side timerStartedAt + timerResumedOffset accumulates pause elapsed (D-07) | Phase 07 CONTEXT.md | 2026-03-07 |
| Auction mode: auctionBudgets serialized as JSON map on MatchSession | Phase 07 execution | 2026-03-07 |
| Deterministic coin flip: no Math.random() in reducers | Phase 04 execution | 2026-02-20 |
| History tables (MatchSessionHistory, MatchSessionStepHistory, MatchParticipantHistory): created at finalization, ephemeral rows deleted | Phase 07 execution | 2026-03-07 |
| Equipping stage: lightcone path must match character path (same Path enum) | Phase 07 execution | 2026-03-07 |
| Anonymous enforcement in MatchSessionStep: actorUserId=0 when isAnonymousPlayers | Phase 09 CONTEXT.md | 2026-03-28 |
| BetweenGames stage added for best-of-N series; advance_to_next_game resets draft state | Phase 07 execution | 2026-03-07 |
| Normalized to standard template | Phase 13 normalization | 2026-04-09 |

---

*Last updated: 2026-04-09*
*Feature owner: Phase 07 / Phase 09*

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
