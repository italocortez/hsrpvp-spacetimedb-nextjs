# Lobby System

## Table Relationships

```
Lobby (PK: id autoInc)
│  Core: id, joinCode (unique), hostUserId → User.id
│  Config: teamSize, draftMode, banMode, gameMode, matchType
│  Budget: characterBudget, lightconeBudget, minimumBidRaise
│  Timers: standardTurnSeconds, reserveBankSeconds
│  Draft options: allowMirrorPicks, autoRandomPick
│  Referee powers: refereeCanUndo, refereeCanPause, refereeCanSetCaptain, refereeCanKick
│  Player: allowPlayerPause
│  Handicap: rosterDiffAdvantage, rosterThreshold, underThresholdAdvantage, aboveThresholdPenalty, deathPenalty
│  Anonymous: isAnonymousPlayers, isAnonymousSpectators
│  Roster: rosterVisibility, requireOwnership, costSetId
│  Visibility: isPublic
│  Tournament: tournamentId?, bracketMatchId?, isTournamentControlled
│  Disconnect: disconnectPolicy, disconnectForfeitSeconds?, disconnectForfeitAt?
│  Browser: currentPlayerCount (denormalized)
│  Lifecycle: stage (LobbyStage), lastActivityAt, hostDisconnectTime?
│
├── LobbyMember (PK: [lobbyId, userId])
│     isOnline, participationRole, isReferee, isCoach, teamSlot, isConfirmed, isCaptain
│
├── LobbyBan (PK: [lobbyId, bannedUserId])
│     bannedByUserId → User.id
│
├── LobbyPassword (PK: lobbyId — PRIVATE, never broadcast)
│     passwordHash
│
├── LobbyPreset (PK: id autoInc)
│     name, isSystemPreset, creatorUserId
│     (all lobby config fields mirrored)
│
├── TournamentStandIn (PK: [bracketMatchId, userId])
│     approvedByUserId
│
├── LobbyGcJob (PK: scheduledId autoInc)
│     scheduledAt: scheduleAt
│     → runs lobby_gc reducer (scheduled cleanup)
│
└── LobbyCursorEvent (event table, no PK — auto-deleted after broadcast)
      lobbyId, senderUserId (0 when anonymous), anonymousLabel
      x, y coordinates
```

---

## Lobby Table

| Column | Type | Description |
|--------|------|-------------|
| id | u32 autoInc PK | Primary key |
| joinCode | string unique | Jackbox-style quick join code |
| hostUserId | u32 | FK to User.id |
| teamBlueAlias | string | Blue team display name |
| teamRedAlias | string | Red team display name |
| teamSize | u8 | Players per team (1, 2, 3) |
| draftMode | DraftMode | Classic or Auction |
| banMode | BanMode | None, Four, or Six |
| gameMode | GameMode | MemoryOfChaos, ApocalypticShadow, AnomalyArbitration |
| matchType | MatchType | Casual or Ranked |
| standardTurnSeconds | u32 | Turn timer (seconds) |
| reserveBankSeconds | u32 | Reserve bank per team (seconds) |
| characterBudget | f32 | Per-team character budget (Auction mode) |
| lightconeBudget | f32 | Per-team lightcone budget (Equipping stage) |
| minimumBidRaise | f32 | Minimum increment to raise a bid (Auction mode) |
| allowMirrorPicks | bool | When true, both teams can pick same character; Ranked forces false |
| autoRandomPick | bool | Auto-pick random character on timer expiry instead of EMPTY |
| refereeCanUndo | bool | Referee may undo last draft step (D-32) |
| refereeCanPause | bool | Referee may pause timer unlimited times (D-32) |
| refereeCanSetCaptain | bool | Referee may assign captains (D-32) |
| refereeCanKick | bool | Referee may kick members (D-32) |
| allowPlayerPause | bool | Players get 3 pauses per team (D-33) |
| rosterDiffAdvantage | f32 | Handicap: advantage for roster cost difference |
| rosterThreshold | f32 | Handicap: cost threshold for advantage |
| underThresholdAdvantage | f32 | Handicap multiplier below threshold |
| aboveThresholdPenalty | f32 | Handicap multiplier above threshold |
| deathPenalty | f32 | Handicap: penalty per death |
| tournamentId | u32? | FK to Tournament.id (tournament lobbies only) |
| bracketMatchId | u32? | FK to BracketMatch.id (tournament lobbies only) |
| isTournamentControlled | bool | When true: inherits tournament settings, locked |
| isAnonymousPlayers | bool | Player identities hidden during match |
| isAnonymousSpectators | bool | Spectator identities hidden |
| rosterVisibility | RosterVisibility | OpenRoster / ClosedWithRating / ClosedNoRating |
| requireOwnership | bool | Pick validation requires HsrAccountCharacter ownership |
| costSetId | u32 | FK to CostSet.id (0 = default set) |
| isPublic | bool | Public = no password; Private = password required |
| disconnectPolicy | DisconnectPolicy | Behavior on member disconnect |
| disconnectForfeitSeconds | u32? | Auto-forfeit timeout (TimerThenForfeit policy) |
| disconnectForfeitAt | timestamp? | Set when disconnect timer starts |
| hostDisconnectTime | timestamp? | When host disconnected (for host transfer logic) |
| lastActivityAt | timestamp | Updated on join/leave/chat/picks/cursor events |
| stage | LobbyStage | Waiting, Drafting, Equipping, Scoring, Finished |
| currentPlayerCount | u8 | Denormalized member count for browser view (D-07) |

**Indexes:** `host_user_id` btree, `stage` btree, `tournament_id` btree

---

## LobbyStage Expansion

| Stage | Description |
|-------|-------------|
| Waiting | Pre-draft — team assignment, ready-up, settings changes allowed |
| Drafting | Active draft — picks, bans, auction in progress |
| Equipping | Post-draft — lightcone equipping and lineup arrangement |
| Scoring | Score submission — screenshot upload and captain confirmation |
| Finished | Match finalized — close_lobby allowed |

`BanMode.Two` was removed in Phase 9 — only `None`, `Four`, `Six` remain.

---

## LobbyMember Table

| Column | Type | Description |
|--------|------|-------------|
| lobbyId | u32 | FK to Lobby.id (composite PK) |
| userId | u32 | FK to User.id (composite PK) |
| isOnline | bool | Whether member is currently connected |
| participationRole | ParticipationRole | Player or Spectator |
| isReferee | bool | Has admin powers in this lobby (host has this by default) |
| isCoach | bool | Can view/chat but cannot perform draft actions (MOUS-03) |
| teamSlot | TeamLabel | Blue, Red, or Spectator |
| isConfirmed | bool | Ready-up status (D-29); required for start_draft |
| isCaptain | bool | Can act on behalf of team in draft (D-30) |

**PK:** `[lobbyId, userId]`
**Indexes:** `lobby_id` btree, `user_id` btree, `by_lobby_and_user` btree

---

## LobbyBan Table

Records users banned from a lobby. Hard-deleted when the lobby is closed.

| Column | Type | Description |
|--------|------|-------------|
| lobbyId | u32 | FK to Lobby.id (composite PK) |
| bannedUserId | u32 | FK to User.id (composite PK) |
| bannedByUserId | u32 | Who issued the ban |

**PK:** `[lobbyId, bannedUserId]`
**Indexes:** `lobby_id` btree, `by_lobby_and_user` btree

---

## LobbyPreset Table

Saved lobby configuration templates. Created and managed by admins, moderators, and TOs.

| Column | Type | Description |
|--------|------|-------------|
| id | u32 autoInc PK | Primary key |
| name | string | Display name |
| isSystemPreset | bool | True for admin-seeded presets (e.g., "Standard Ranked") |
| creatorUserId | u32 | FK to User.id |
| (all config fields) | — | Mirror of Lobby config columns: teamSize, draftMode, banMode, gameMode, matchType, standardTurnSeconds, reserveBankSeconds, characterBudget, lightconeBudget, minimumBidRaise, rosterDiffAdvantage, rosterThreshold, underThresholdAdvantage, aboveThresholdPenalty, deathPenalty, isPublic, isAnonymousPlayers, isAnonymousSpectators, rosterVisibility, requireOwnership, costSetId, disconnectPolicy, disconnectForfeitSeconds, allowMirrorPicks, autoRandomPick, refereeCanUndo, refereeCanPause, refereeCanSetCaptain, refereeCanKick, allowPlayerPause |

**Permission hierarchy (D-31b):**
- Admin: create/edit/delete any preset including system presets
- Moderator: create/edit/delete own presets, other mod/TO presets; NOT system presets
- TournamentHost (TO): create/edit/delete own presets only
- When `create_lobby` passes `presetId > 0`: all config fields copied from preset; host can override during Waiting via settings update

**Indexes:** `creator_user_id` btree

---

## TournamentStandIn Table

Approved stand-in players for bracket matches. Allows non-registered players to participate with TO approval.

| Column | Type | Description |
|--------|------|-------------|
| bracketMatchId | u32 | FK to BracketMatch.id (composite PK) |
| userId | u32 | FK to User.id (composite PK) |
| approvedByUserId | u32 | Who approved the stand-in |

**PK:** `[bracketMatchId, userId]`
**Indexes:** `bracket_match_id` btree, `by_match_and_user` btree

---

## LobbyGcJob Table (Scheduled GC)

SpacetimeDB scheduled table. One row = one scheduled run of `lobby_gc`.

| Column | Type | Description |
|--------|------|-------------|
| scheduledId | u64 autoInc PK | Row ID |
| scheduledAt | scheduleAt | When to run |

**Cleanup policy (D-25):** `lobby_gc` runs periodically and hard-deletes:
- Waiting lobbies idle > 30 minutes (`lastActivityAt` check)
- Finished lobbies idle > 30 minutes

Active stages (Drafting, Equipping, Scoring) are never auto-cleaned.

---

## Lobby Browser View

`view_lobby_browser` (anonymous view, accessible without authentication).

**Projected columns (LobbyBrowserRow):**
- id, joinCode, gameMode, draftMode, matchType
- currentPlayerCount, isTournamentControlled, isAnonymousPlayers
- stage, isPublic, teamSize
- tournamentName (resolved via PK lookup on Tournament table, server-side)
- costSetName (resolved via PK lookup on CostSet table; undefined if costSetId=0)

**Filtering (D-08):** Only Waiting, Drafting, Equipping, Scoring stages shown. Finished lobbies excluded. Uses the `stage` btree index with 4 individual filter calls.

**Implementation:** Uses `anonymousView` (no authentication required). Tournament and cost set names resolved server-side at view computation time — no extra client roundtrips.

---

## Lobby Lifecycle

### Create (`create_lobby`)
- One lobby per user enforced (D-22)
- Guest restrictions: no Ranked, forced ClosedNoRating (D-23)
- `presetId > 0`: validates preset exists, copies config (D-31b)
- Host inserted as LobbyMember with `isReferee=true`, `teamSlot=Spectator` (D-24, D-27)
- `currentPlayerCount` starts at 1
- Password stored in private `LobbyPassword` table if `!isPublic`

### Join (`join_lobby`)
- Accepts `lobbyId` or `joinCode` (D-03)
- One lobby per user enforced (D-22)
- Guest restrictions: no Ranked lobbies (D-23)
- Ban check: `LobbyBan[lobbyId, userId]` (D-21)
- Stage-specific join (D-04):
  - Waiting: normal join
  - Drafting: reconnect (if existing offline member) or new spectator only
  - Other stages: rejected
- Password check for private lobbies (D-02)
- Joined as `teamSlot=Spectator` (D-27)
- `currentPlayerCount` incremented
- System chat message: "{name} joined the lobby."

### Leave (`leave_lobby`)
- Removes LobbyMember row
- `currentPlayerCount` decremented
- If lobby empties in Waiting: auto-close (`_hardDeleteLobby`)
- System chat message: "{name} left the lobby."

### Close (`close_lobby`)
- Permission: host, admin, moderator (D-21)
- Stage: Waiting or Finished only (D-20)
- Cascade delete via `_hardDeleteLobby` (D-19):
  1. All ChatMessage rows
  2. All LobbyMember rows
  3. All LobbyBan rows
  4. LobbyPassword (if exists)
  5. All MatchSessionStep rows
  6. MatchSession (if exists)
  7. Lobby row
  - Note: LobbyCursorEvent is an event table — auto-deleted after broadcast, no manual cleanup needed

### Kick (`kick_member`)
- Permission: host, admin, moderator, or referee with `refereeCanKick=true`
- Cannot kick self or host
- System chat message: "{name} was kicked."

### Ban (`ban_member`)
- Permission: host, admin, moderator, or referee with `refereeCanKick=true`
- Inserts LobbyBan row
- Removes LobbyMember if currently present
- System chat message: "{name} was banned."
- Banned user cannot rejoin (checked in `join_lobby`)

---

## Team Assignment

### Slots and Roles
- All members join as `teamSlot=Spectator` (D-27)
- `set_team_slot`: free movement during Waiting; resets `isConfirmed=false` for the mover
- Moving others: requires host/admin/moderator
- Moving self: any member can

### Ready-Up (D-29)
- `confirm_ready`: sets `isConfirmed=true` (Waiting stage only)
- `unconfirm_ready`: clears `isConfirmed` (Waiting stage only)
- Settings change by host resets ALL members' `isConfirmed=false`
- `start_draft` rejects unless all Blue+Red non-coach players are confirmed

### Captain System (D-30)
- `set_captain`: host, admin, or referee with `refereeCanSetCaptain=true` can assign
- Target must be on Blue/Red team and not a coach
- Auto-assigned at `start_draft` if team has no captain (first non-coach player per team)
- Only captain can perform draft actions (pick/ban/nominate/bid/equip/arrange/confirm)

---

## One-Lobby-Per-User Enforcement (D-22)

`ensureNotInLobby` checks `LobbyMember.user_id.filter(userId)`. If any row exists, the create/join is rejected. Users must leave before joining another.

---

## Guest Restrictions (D-23)

- Cannot create or join Ranked lobbies (`matchType=Ranked`)
- Forced `rosterVisibility=ClosedNoRating` (enforced in create/update settings)
- These are enforced server-side and cannot be overridden by lobby settings

---

## Tournament Lobbies

### `create_tournament_lobby`
- Auth: match participants, TO, assistant, admin, moderator (D-64)
- Duplicate prevention: no non-Finished lobby for same `bracketMatchId` (D-45)
- ALL settings inherited from Tournament and locked (`isTournamentControlled=true`) (D-65)
- `matchType` derived from `tournament.countTowardsMmr` (D-67)
- Settings locked — `update_lobby_settings` rejects with error for `isTournamentControlled=true` lobbies

### `approve_stand_in`
- Auth: TO, admin, moderator, tournament assistant (D-68)
- Inserts `TournamentStandIn[bracketMatchId, userId]`
- Allows the stand-in player to be validated as a match participant despite not being a registered tournament participant

---

## Scheduled GC (`lobby_gc`)

Runs on schedule via `LobbyGcJob` scheduled table. Hard-deletes abandoned lobbies (D-25):
- Stage = Waiting AND `lastActivityAt` > 30 minutes ago
- Stage = Finished AND `lastActivityAt` > 30 minutes ago

Active stages (Drafting, Equipping, Scoring) are never auto-cleaned. This protects live matches from accidental cleanup.

---

## Reducer Reference

| Reducer | File | Permission | Description |
|---------|------|-----------|-------------|
| `create_lobby` | lobbyLifecycle.ts | Any authenticated user | Creates lobby, inserts host as referee |
| `join_lobby` | lobbyLifecycle.ts | Any authenticated user | Joins by lobbyId or joinCode |
| `leave_lobby` | lobbyLifecycle.ts | Any member | Removes self from lobby |
| `close_lobby` | lobbyLifecycle.ts | Host / Admin / Moderator | Hard-delete cascade |
| `kick_member` | lobbyLifecycle.ts | Host / Admin / Moderator / Referee (refereeCanKick) | Remove member without ban |
| `ban_member` | lobbyLifecycle.ts | Host / Admin / Moderator / Referee (refereeCanKick) | Remove + ban; cannot rejoin |
| `update_lobby_settings` | lobbySettings.ts | Host / Admin / Moderator | Updates all config; Waiting stage only; resets isConfirmed |
| `set_team_slot` | lobbySettings.ts | Self (any member) or host for others | Move to Blue/Red/Spectator; resets isConfirmed |
| `confirm_ready` | lobbySettings.ts | Any member | Sets isConfirmed=true; Waiting only |
| `unconfirm_ready` | lobbySettings.ts | Any member | Clears isConfirmed; Waiting only |
| `set_captain` | lobbySettings.ts | Host / Referee (refereeCanSetCaptain) / Admin | Assigns captain for a team |
| `create_lobby_preset` | lobbyPresets.ts | Admin / Moderator / TO | Creates a new preset |
| `update_lobby_preset` | lobbyPresets.ts | Permission hierarchy (see above) | Updates preset fields |
| `delete_lobby_preset` | lobbyPresets.ts | Permission hierarchy (see above) | Deletes preset |
| `create_tournament_lobby` | tournamentLobby.ts | Participants / TO / assistant / Admin / Moderator | Tournament-linked lobby with inherited settings |
| `approve_stand_in` | tournamentLobby.ts | TO / assistant / Admin / Moderator | Approves stand-in player for a bracket match |
| `lobby_gc` | lobbyGc.ts | Scheduled (LobbyGcJob) | Hard-deletes idle Waiting/Finished lobbies |

---

## Key Decisions

- `LobbyConfig` struct flattened into Lobby columns — all settings are indexable/filterable
- `LobbyConfigSnapshot` (in structs.ts) used only by MatchSessionHistory for frozen match-time snapshots
- Capacity: 6 players, 2 coaches, 12 spectators = 20 max (enforced in join reducer)
- `currentPlayerCount` denormalized on Lobby for zero-cost browser view reads (D-07)
- `lastActivityAt` tracked separately from `lastModifiedDate` audit column for GC timeout
- `rosterVisibility` enum (OpenRoster/ClosedWithRating/ClosedNoRating) replaces old `isOpenRoster` bool
- `requireOwnership` auto-defaults from matchType at creation (Casual=false, Ranked=true), locked after creation
- `isTournamentControlled=true` locks settings and grants TO authority for score submission
- `LobbyPassword` in private table — never broadcast to clients
- `LobbyCursorEvent` is an event table — rows auto-deleted after broadcast, no manual cascade needed
- `BanMode.Two` removed in Phase 9 — only None/Four/Six remain
- `isSystemPreset` admin-only in edit/delete permission check — moderators cannot edit system presets
