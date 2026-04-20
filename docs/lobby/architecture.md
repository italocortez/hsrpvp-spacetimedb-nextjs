# Lobby -- Architecture

Last updated: 2026-04-09

## Overview

Lobbies are the per-match rooms where players draft characters and play games. Each lobby can be standalone or tournament-linked (via `bracketMatchId`). Lobbies advance through stages: Waiting -> Drafting -> Equipping -> Scoring -> (BetweenGames for best-of-N series) -> AwaitingResult. A garbage collection job (`LobbyGcJob`) auto-closes inactive lobbies after a configurable timeout. Players hold at most one active lobby membership at a time; `join_lobby` enforces the one-lobby-per-user invariant. Anonymous play is enforced by zeroing out `senderUserId` in event rows at write time. Lobby presets let users save and restore settings. Stand-ins (TournamentStandIn) track approved substitutes who may join tournament lobbies.

## Table Relationships

```
Lobby (id: u32 autoInc PK)  [public: true]
  +-- hostUserId -> User.id  [btree: host_user_id]
  +-- bracketMatchId: u32? -> BracketMatch.id  [btree: bracket_match_id]
  +-- tournamentId: u32? -> Tournament.id  [btree: tournament_id]
  +-- costSetId: u32 (0=default sentinel)
  +-- stage: LobbyStage (Waiting | Drafting | Equipping | Scoring | BetweenGames | Shelved | AwaitingResult | Closed)
  +-- gameMode: GameMode
  +-- draftMode: DraftMode (Classic | Auction)
  +-- teamSize: u8
  +-- bestOf: u8 (series length)
  +-- currentGame: u8 (1-based game counter in series)
  +-- blueScore: u8 / redScore: u8
  +-- timerDurationSeconds: u32
  +-- timerPausedAt: Timestamp?
  +-- timerResumedOffset: u64 (accumulated elapsed ms before last resume)
  +-- requireOwnership: bool
  +-- isAnonymousPlayers: bool
  +-- isAnonymousSpectators: bool
  +-- refereeControlsShelving: bool
  +-- maxSpectators: u8
  +-- allowSpectators: bool
  +-- name: string
  +-- isPrivate: bool
  +-- password: string?
  +-- gcJobId: u64? -> LobbyGcJob.scheduledId  [btree: gc_job_id]
  +-- audit columns

  +-- LobbyMember (PK: [lobbyId, userId])  [public: true]
  |     lobbyId -> Lobby.id  [btree: lobby_id]
  |     userId -> User.id  [btree: user_id]
  |     teamSide: TeamSide (Blue | Red | Spectator)
  |     isReady: bool
  |     isReferee: bool
  |     isTournamentStandIn: bool
  |     audit columns
  |     Indexes: lobby_id (btree), user_id (btree)
  |
  +-- LobbyMemberAccount (PK: [lobbyId, userId, hsrAccountId])  [PRIVATE]
  |     lobbyId -> Lobby.id  [btree: lobby_id]
  |     userId -> User.id
  |     hsrAccountId -> HsrAccount.id
  |     Indexes: lobby_id (btree), by_lobby_and_user (btree, [lobbyId, userId]), by_account (btree, hsrAccountId)
  |
  +-- LobbyBan (PK: [lobbyId, userId])  [PRIVATE]
  |     lobbyId -> Lobby.id  [btree: lobby_id]
  |     userId -> User.id
  |     audit columns
  |
  +-- LobbyCursorEvent (id: u32 autoInc PK)  [public: true]
  |     lobbyId -> Lobby.id  [btree: lobby_id]
  |     senderUserId: u32 -> User.id (0=anonymous sentinel)
  |     eventType: CursorEventType
  |     payload: string (JSON)
  |     audit columns
  |
  +-- LobbyGcJob (scheduledId: u64 autoInc PK)  [PRIVATE]
  |     scheduledAt: Timestamp
  |     scheduledReducer: string
  |     data: LobbyGcJobData
  |       .lobbyId: u32
  |       .hostIdentityToken: string
  |
  +-- LobbyPreset (id: u32 autoInc PK)  [public: true]
        userId -> User.id  [btree: user_id]
        name: string
        settings: string (JSON blob of lobby config fields)
        audit columns

TournamentStandIn (PK: [tournamentId, userId])  [public: true]
  tournamentId -> Tournament.id  [btree: tournament_id]
  userId -> User.id
  approvedByUserId -> User.id
  approvedAt: Timestamp
  audit columns
  Indexes: tournament_id (btree)
```

## Reducer Flows

### create_lobby(params)
1. `getAuthenticatedUser(ctx)` -- reject guests
2. Validate lobby settings: name length, team size, bestOf, gameMode, draftMode, timer duration, max spectators
3. Check one-lobby-per-user: query `LobbyMember` by `user_id` index -- reject if caller already has an active membership
4. If tournament-linked (`bracketMatchId > 0`): verify caller has TO/Assistant/Mod+ access; verify BracketMatch is in correct state
5. Insert `Lobby` row with `stage=Waiting`
6. Insert `LobbyMember` row for host (teamSide=Blue, isReady=false, isReferee=false)
7. Schedule `LobbyGcJob` via `ctx.db.LobbyGcJob.insert({ scheduledAt, data: { lobbyId, hostIdentityToken } })`
8. Select HSR account: if `requireOwnership=true`, validate account ownership; insert `LobbyMemberAccount`

### join_lobby(lobbyId, password?, teamSide?, hsrAccountId?)
1. `getAuthenticatedUser(ctx)` -- reject guests
2. Find Lobby -- reject if not found, not in Waiting stage, or Closed
3. One-lobby-per-user: reject if caller already has active LobbyMember row (via `user_id` index)
4. Ban check: reject if `LobbyBan` row exists for `[lobbyId, userId]`
5. Spectator path: validate `allowSpectators=true` and spectator count <= `maxSpectators`
6. Player path: validate team side balance; if `isPrivate=true`, validate password
7. Tournament-linked join: verify caller is enrolled in the tournament OR is an approved `TournamentStandIn`
8. Stand-in path: if `isTournamentStandIn=true`, snapshot active accounts into `TournamentPlayerAccount`
9. Insert `LobbyMember` row
10. If `requireOwnership=true` and player path: validate `hsrAccountId` ownership; insert `LobbyMemberAccount`
11. Insert system chat message via `insertSystemChatMessage`

### leave_lobby(lobbyId)
1. `getAuthenticatedUser(ctx)`
2. Find `LobbyMember` row -- reject if not found
3. If host: if other members remain, transfer host to next member; if empty after leave, trigger `hardDeleteLobby`
4. Delete `LobbyMemberAccount` rows for this user in this lobby (via `by_lobby_and_user` index)
5. Delete `LobbyMember` row
6. Insert system chat message

### kick_member(lobbyId, targetUserId)
1. `getAuthenticatedUser(ctx)`
2. Permission: lobby host OR `LobbyMember.isReferee=true` OR Moderator+
3. Find target `LobbyMember` -- reject if not found; cannot kick self or host
4. Insert `LobbyBan` row to prevent re-join
5. Delete `LobbyMemberAccount` rows for target
6. Delete `LobbyMember` row
7. Insert system chat message

### ban_member(lobbyId, targetUserId) / unban_member(lobbyId, targetUserId)
1. Permission: host OR Moderator+
2. `ban_member`: insert/update `LobbyBan` row (if member present: kick flow)
3. `unban_member`: delete `LobbyBan` row by `[lobbyId, targetUserId]`

### set_ready(lobbyId, isReady)
1. `getAuthenticatedUser(ctx)`
2. Find `LobbyMember` -- verify caller is in Waiting stage lobby
3. Update `LobbyMember.isReady` (delete+insert composite PK pattern)

### start_draft(lobbyId)
1. Permission: host OR TO/Assistant/Mod+
2. Verify lobby in Waiting stage; verify all non-spectator members ready
3. Tournament-linked: verify tournament is InProgress
4. Transition lobby stage to Drafting
5. Insert system chat message

### update_lobby_settings(lobbyId, params)
1. Permission: host OR TO/Assistant/Mod+
2. Lobby must be in Waiting stage
3. Update allowed settings: name, isPrivate, password, allowSpectators, maxSpectators, refereeControlsShelving, isAnonymousPlayers, isAnonymousSpectators, timerDurationSeconds, costSetId
4. Update Lobby row (delete+insert for composite PK if needed; direct column update for non-PK fields)

### transfer_host(lobbyId, newHostUserId)
1. Caller must be current host OR Admin/Mod
2. Find `LobbyMember` for new host -- reject if not in lobby
3. Update `Lobby.hostUserId`

### assign_referee(lobbyId, targetUserId) / remove_referee(lobbyId)
1. Permission: host OR TO/Assistant/Mod+
2. `assign_referee`: find target member; set `isReferee=true` (delete+insert)
3. `remove_referee`: find current referee; set `isReferee=false`

### transfer_referee(lobbyId, newRefereeUserId)
1. Caller must be current referee
2. Find target `LobbyMember`; set target `isReferee=true`, caller `isReferee=false`

### reclaim_referee(lobbyId)
1. Caller must be lobby host
2. Find current referee `LobbyMember`; set `isReferee=false`; set host `isReferee=true`

### send_cursor_event(lobbyId, eventType, payload)
1. `getAuthenticatedUser(ctx)` OR anonymous sentinel check
2. Find `LobbyMember` for caller
3. Anonymous enforcement: if `isAnonymousPlayers || isAnonymousSpectators`, write `senderUserId=0`; otherwise write real userId
4. Insert `LobbyCursorEvent` row

### create_lobby_preset(name, settingsJson) / update_lobby_preset(presetId, name?, settingsJson?) / delete_lobby_preset(presetId)
1. `getAuthenticatedUser(ctx)`
2. `create`: cap check (<=10 presets per user via `user_id` index); insert `LobbyPreset`
3. `update`: find preset -- verify owner; update fields
4. `delete`: find preset -- verify owner OR Admin; delete row

### approve_stand_in(tournamentId, targetUserId) / remove_stand_in(tournamentId, targetUserId)
1. `ensureTournamentAccess(ctx, tournamentId)` -- TO/Assistant/Mod+
2. `approve_stand_in`: verify `TournamentEnrolled` exists for target; insert `TournamentStandIn`
3. `remove_stand_in`: delete `TournamentStandIn` by `[tournamentId, targetUserId]`

### LobbyGcJob (scheduled reducer: lobby_gc)
1. Fired at scheduled time via `ctx.db.LobbyGcJob` scheduled table
2. Read `data.lobbyId` -- find Lobby
3. If lobby is Closed or does not exist: no-op (already cleaned up)
4. If host `identityToken` has disconnected (phase 12.1 GC restructuring): trigger `hardDeleteLobby`
5. `hardDeleteLobby`: cascade-delete LobbyMember, LobbyMemberAccount, LobbyBan, LobbyCursorEvent, ChatMessage; delete Lobby row; cancel pending GcJob

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| One-lobby-per-user: LobbyMember.user_id btree enforces single active membership | Phase 05 CONTEXT.md | 2026-02-25 |
| isAnonymousPlayers / isAnonymousSpectators: real userId zeroed at write time (D-92) | Phase 09 CONTEXT.md | 2026-03-28 |
| LobbyBan uses composite PK [lobbyId, userId] -- row existence = banned state | Phase 05 execution | 2026-02-25 |
| LobbyPreset: save/restore settings, 10-per-user cap | Phase 09 execution | 2026-03-28 |
| TournamentStandIn: approved substitutes tracked per tournament, snapshotted into TPA at join | Phase 10.4 execution | 2026-03-29 |
| LobbyMemberAccount: per-match account selection table, non-public (D-02) -- tournament path additive, non-tournament path replace | Phase 10.4 execution | 2026-03-29 |
| select_match_account / deselect_match_account: additive for tournament (maxAccountsPerPlayer), replace for non-tournament | Phase 10.4 execution | 2026-03-29 |
| BracketMatch.lobbyId removed; relationship inverted -- Lobby.bracketMatchId with btree index | Phase 10.1 execution | 2026-03-25 |
| LobbyGcJob scheduled table: fires at configurable timeout; checks host disconnect before auto-close | Phase 12.1 execution | 2026-04-04 |
| hardDeleteLobby cascade order: LobbyMemberAccount -> LobbyMember -> LobbyBan -> LobbyCursorEvent -> ChatMessage -> GcJob -> Lobby | Phase 12.1 execution | 2026-04-04 |
| refereeControlsShelving flag: allows referee to call advance_to_next_game / shelve_series / resume_series | Phase 10.1 execution | 2026-03-25 |
| Normalized to standard template | Phase 13 normalization | 2026-04-09 |
| Phase 16 route-group rename: frontend lobby page moved from `app/(authenticated)/lobby/page.tsx` → `app/(authed)/lobby/page.tsx`. Backend reducers, tables, views, and behavior unchanged — this is a pure file-path change driven by the `(authenticated)` → `(authed)` route-group convention locked in Phase 16 Plan 01 | Phase 16 execution | 2026-04-18 |

---

*Last updated: 2026-04-18*
*Feature owner: Phase 05 / Phase 09 / Phase 10.1 / Phase 10.4 / Phase 12.1 / Phase 16*

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
