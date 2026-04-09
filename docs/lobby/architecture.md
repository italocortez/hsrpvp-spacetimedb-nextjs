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
│  Disconnect: disconnectPolicy, disconnectForfeitSeconds?, refereeExclusiveConcede
│  Browser: currentPlayerCount (denormalized)
│  Series: bestOf, refereeControlsShelving
│  Lifecycle: stage (LobbyStage), lastActivityAt
│
├── LobbyMemberAccount (PK: [lobbyId, userId, hsrAccountId] — NON-PUBLIC, Phase 10.4)
│     lobbyId, userId, hsrAccountId
│     No audit columns — ephemeral, created at join, deleted at leave/close
│
├── LobbyMember (PK: [lobbyId, userId])
│     isOnline, lobbySlot, isReferee, isConfirmed, isCaptain
│     voluntarilyLeft, disconnectedAt?, disconnectPoolRemainingMs
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
| bestOf | u8 | Best-of series length (1, 3, 5); default 1 (Phase 10.1) |
| refereeControlsShelving | bool | When true, referee can call series management reducers (Phase 10.1) |
| disconnectPolicy | DisconnectPolicy | Standard / Deferred / NoAction (Phase 10 rename) |
| disconnectForfeitSeconds | u32? | Grace period before forfeit eligibility (Standard policy) |
| refereeExclusiveConcede | bool | 3rd party referee exclusive control over concede/forfeit/defer (D-81, D-84) |
| lastActivityAt | timestamp | Updated on join/leave/chat/picks/cursor events |
| stage | LobbyStage | Waiting, Drafting, Equipping, Scoring, BetweenGames, Shelved, AwaitingResult, Finished |
| currentPlayerCount | u8 | Denormalized member count for browser view (D-07) |

**Indexes:** `host_user_id` btree, `stage` btree, `tournament_id` btree, `bracket_match_id` btree (reverse lookup from BracketMatch, Phase 10.1)

---

## LobbyStage Expansion

| Stage | Description |
|-------|-------------|
| Waiting | Pre-draft — team assignment, ready-up, settings changes allowed |
| Drafting | Active draft — picks, bans, auction in progress |
| Equipping | Post-draft — lightcone equipping and lineup arrangement |
| Scoring | Score submission — screenshot upload and captain confirmation |
| BetweenGames | Series game completed; awaiting advance_to_next_game to start next game (Phase 10.1) |
| Shelved | Series paused between games; resume_series to continue (Phase 10.1) |
| AwaitingResult | Set by submit_match_result or concede/defer — players freed to join new lobbies; finalization cascade-deletes the lobby; admin-only resolution for deferred matches (D-45, D-46) |
| Finished | Abandoned closed lobbies only — set by close_lobby on AwaitingResult lobbies; GC safety net target |

`BanMode.Two` was removed in Phase 9 — only `None`, `Four`, `Six` remain.

---

## LobbyMember Table

| Column | Type | Description |
|--------|------|-------------|
| lobbyId | u32 | FK to Lobby.id (composite PK) |
| userId | u32 | FK to User.id (composite PK) |
| isOnline | bool | Whether member is currently connected |
| lobbySlot | LobbySlot | BluePlayer, BlueCoach, RedPlayer, RedCoach, or Spectator |
| isReferee | bool | Has admin powers in this lobby (host has this by default) |
| isConfirmed | bool | Ready-up status (D-29); required for start_draft |
| isCaptain | bool | Can act on behalf of team in draft (D-30) |
| voluntarilyLeft | bool | True when player voluntarily left active match (D-31); row kept for finalization |
| disconnectedAt | timestamp? | When member disconnected (D-08); cleared on reconnect |
| disconnectPoolRemainingMs | u32 | 5-minute budget per player per match (D-10); decremented on reconnect |

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

Active stages (Drafting, Equipping, Scoring, AwaitingResult) are never auto-cleaned. AwaitingResult lobbies are cleaned up by finalization cascade-delete, not GC.

**Phase 12.1 restructuring:** `run_lobby_gc` was refactored to extract a shared `performLobbyGc` helper function. Both the scheduled reducer (`run_lobby_gc`) and the admin on-demand reducer (`admin_gc_lobbies`) call `performLobbyGc`, which returns `{ lobbiesScanned, lobbiesDeleted, deletedByStage }`. Each caller writes a `GcResult` audit row (`gcType='lobby'`) after the run:
- **Scheduled (`run_lobby_gc`):** writes `GcResult` only when `lobbiesDeleted > 0` (no-op runs are silent)
- **Admin (`admin_gc_lobbies`):** writes `GcResult` unconditionally (audit trail for every manual trigger, even if nothing was deleted)

---

## Lobby Browser View

`view_lobby_browser` (anonymous view, accessible without authentication).

**Projected columns (LobbyBrowserRow):**
- id, joinCode, gameMode, draftMode, matchType
- currentPlayerCount, isTournamentControlled, isAnonymousPlayers
- stage, isPublic, teamSize
- tournamentName (resolved via PK lookup on Tournament table, server-side)
- costSetName (resolved via PK lookup on CostSet table; undefined if costSetId=0)

**Filtering (D-08):** Only Waiting, Drafting, Equipping, Scoring stages shown. AwaitingResult and Finished lobbies excluded. Uses the `stage` btree index with 4 individual filter calls.

**Implementation:** Uses `anonymousView` (no authentication required). Tournament and cost set names resolved server-side at view computation time — no extra client roundtrips.

---

## Lobby Lifecycle

### Create (`create_lobby`)
- One lobby per user enforced (D-22)
- Guest restrictions: no Ranked, forced ClosedNoRating (D-23)
- `presetId > 0`: validates preset exists, copies config (D-31b)
- Host inserted as LobbyMember with `isReferee=true`, `lobbySlot=Spectator` (D-24, D-27)
- `currentPlayerCount` starts at 1
- Password stored in private `LobbyPassword` table if `!isPublic`

### Join (`join_lobby`)
- Accepts `lobbyId` or `joinCode` (D-03)
- One lobby per user enforced (D-22)
- Guest restrictions: no Ranked lobbies (D-23)
- Ban check: `LobbyBan[lobbyId, userId]` (D-21)
- Stage-specific join (D-04, D-37):
  - Waiting: normal join
  - Drafting/Equipping/Scoring/AwaitingResult: reconnect (if existing offline member with `voluntarilyLeft=false`) or new spectator only. Reconnect clears `disconnectedAt`, decrements pool by elapsed time, auto-resumes if auto-paused (D-39)
  - `voluntarilyLeft=true` blocks reconnect (D-38)
- Password check for private lobbies (D-02)
- Joined as `lobbySlot=Spectator` (D-27)
- **LobbyMemberAccount auto-created (D-04, D-09, Phase 10.4):** After inserting LobbyMember, creates a `LobbyMemberAccount` row:
  - Non-tournament: uses player's active HsrAccount
  - Tournament: validates active account against TPA; falls back to first locked account if active isn't locked; skips if no TPA entries (stand-in not yet approved)
  - Stand-in (D-26): if `TournamentStandIn` row exists for this user + bracketMatchId and no TPA entries yet, snapshots all user accounts into TPA then creates LMA row
- `currentPlayerCount` incremented
- System chat message: "{name} joined the lobby."

### Leave (`leave_lobby`)
- **Waiting/AwaitingResult/Finished:** Normal leave — removes LobbyMember row, decrements count
- **Active stages (Drafting/Equipping/Scoring):** Sets `voluntarilyLeft=true`, `isOnline=false` (row kept for finalization archival, D-31). Transfers captain/referee/host flags permanently (D-34/D-35/D-36). If last player on team: auto-concede via `performConcede` (D-31), UNLESS `refereeExclusiveConcede` + 3rd party referee present (D-82)
- **LobbyMemberAccount cleanup (D-29, Phase 10.4):** In all exit paths, `LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, userId])` rows are deleted immediately. Account selection is ephemeral — no preservation needed after leave.
- If lobby empties in Waiting: auto-close (`hardDeleteLobby`)
- System chat message: "{name} left the lobby/match."

### Close (`close_lobby`)
- Permission: host, admin, moderator (D-21)
- Stage: Waiting or Finished only (D-20)
- Cascade delete via `_hardDeleteLobby` (D-19, extended in Phase 10.4 D-28):
  1. All ChatMessage rows
  1.5. All LobbyMemberAccount rows for this lobby (D-28, Phase 10.4)
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
- All members join as `lobbySlot=Spectator` (D-27)
- `set_team_slot`: free movement during Waiting; resets `isConfirmed=false` for the mover. Handles both player and coach assignment — BlueCoach/RedCoach slots assign coach role. Only host/referee can assign coach slots to other members.
- Moving others: requires host/admin/moderator (any slot) or host/referee (coach slots)
- Moving self: any member can move to player/spectator slots

### Ready-Up (D-29)
- `confirm_ready`: sets `isConfirmed=true` (Waiting stage only)
- `unconfirm_ready`: clears `isConfirmed` (Waiting stage only)
- Settings change by host resets ALL members' `isConfirmed=false`
- `start_draft` rejects unless all Blue+Red players (lobbySlot=BluePlayer/RedPlayer) are confirmed

### Captain System (D-30)
- `set_captain`: host, admin, or referee with `refereeCanSetCaptain=true` can assign
- Target must be on Blue/Red team as a player (lobbySlot=BluePlayer/RedPlayer, not BlueCoach/RedCoach)
- Auto-assigned at `start_draft` if team has no captain (first Player per team)
- Only captain can perform draft actions (pick/ban/nominate/bid/equip/arrange/confirm)

---

## One-Lobby-Per-User Enforcement (D-22)

`ensureNotInLobby` checks `LobbyMember.user_id.filter(userId)`. Memberships in AwaitingResult lobbies and `voluntarilyLeft=true` members are skipped (D-41). Players are freed to join new lobbies once the result is submitted or they voluntarily leave. If any active membership exists, the create/join is rejected.

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

Runs on schedule via `LobbyGcJob` scheduled table. Hard-deletes abandoned lobbies (D-25, D-47):
- Stage = Waiting AND `lastActivityAt` > 30 minutes ago
- Stage = Finished AND `lastActivityAt` > 30 minutes ago
- Stage = Drafting/Equipping/Scoring AND ALL members offline AND `lastActivityAt` > 30 minutes ago (D-47 — void, no winner)

AwaitingResult lobbies are NEVER GC'd (D-48) — admin-only resolution via `admin_force_finalize` or `admin_void_match`.

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
| `set_team_slot` | lobbySettings.ts | Self (any member) or host for others; coach slots require host/referee | Move to BluePlayer/BlueCoach/RedPlayer/RedCoach/Spectator; resets isConfirmed. Handles coach assignment (replaces set_coach/remove_coach) |
| `confirm_ready` | lobbySettings.ts | Any member | Sets isConfirmed=true; Waiting only |
| `unconfirm_ready` | lobbySettings.ts | Any member | Clears isConfirmed; Waiting only |
| `set_captain` | lobbySettings.ts | Host / Referee (refereeCanSetCaptain) / Admin | Assigns captain for a team |
| `create_lobby_preset` | lobbyPresets.ts | Admin / Moderator / TO | Creates a new preset |
| `update_lobby_preset` | lobbyPresets.ts | Permission hierarchy (see above) | Updates preset fields |
| `delete_lobby_preset` | lobbyPresets.ts | Permission hierarchy (see above) | Deletes preset |
| `create_tournament_lobby` | tournamentLobby.ts | Participants / TO / assistant / Admin / Moderator | Tournament-linked lobby with inherited settings |
| `approve_stand_in` | tournamentLobby.ts | TO / assistant / Admin / Moderator | Approves stand-in player for a bracket match |
| `lobby_gc` | lobbyGc.ts | Scheduled (LobbyGcJob) | Hard-deletes idle Waiting/Finished/abandoned-active lobbies |
| `admin_gc_lobbies` | lobbyGc.ts | Moderator+ | On-demand lobby GC trigger; one-shot (no self-requeue); writes GcResult audit row unconditionally (Phase 12.1) |
| `concede_match` | concede.ts | Any non-spectator/non-coach member (or exclusive referee) | Surrender own side; creates MatchResultRecord with Concede outcome (D-26, D-62) |
| `claim_forfeit` | concede.ts | Any non-spectator/non-coach member (or exclusive referee) | Claim forfeit when all opposing team offline > grace; Standard policy only (D-15, D-61) |
| `defer_match` | concede.ts | Any non-spectator/non-coach member (or exclusive referee) | Shelve match to AwaitingResult for TO/admin resolution; Deferred policy only (D-18, D-63) |

---

## Key Decisions

- `LobbyConfig` struct flattened into Lobby columns — all settings are indexable/filterable
- `LobbyConfigSnapshot` (in structs.ts) used only by MatchSessionHistory for frozen match-time snapshots
- Capacity: max 20 total per lobby — players per team <= teamSize, coaches per team <= 1 (BlueCoach/RedCoach), spectators <= 12 (enforced in join_lobby and set_team_slot)
- `currentPlayerCount` denormalized on Lobby for zero-cost browser view reads (D-07)
- `lastActivityAt` tracked separately from `lastModifiedDate` audit column for GC timeout
- `rosterVisibility` enum (OpenRoster/ClosedWithRating/ClosedNoRating) replaces old `isOpenRoster` bool
- `requireOwnership` auto-defaults from matchType at creation (Casual=false, Ranked=true), locked after creation
- `isTournamentControlled=true` locks settings and grants TO authority for score submission
- `LobbyPassword` in private table — never broadcast to clients
- `LobbyCursorEvent` is an event table — rows auto-deleted after broadcast, no manual cascade needed
- `BanMode.Two` removed in Phase 9 — only None/Four/Six remain
- `isSystemPreset` admin-only in edit/delete permission check — moderators cannot edit system presets

---

## Disconnect Handling (Phase 10)

### DisconnectPolicy Enum
| Variant | Behavior |
|---------|----------|
| Standard | 60s grace on disconnect, auto-pause drafting, opponent can claim forfeit after grace expires (D-05) |
| Deferred | 60s grace on disconnect, auto-pause drafting, no forfeit claim — players call defer_match to shelve (D-06) |
| NoAction | No pause, no pool, no forfeit. Tracking only (D-07) |

### Disconnect Detection
SpacetimeDB `clientDisconnected` lifecycle hook. No application heartbeat (D-01, D-02). Standard/Deferred policies set `disconnectedAt` and auto-pause drafting sessions with `isAutoPause=true` (D-08).

### Disconnect Pool
5-minute budget per player per match (`disconnectPoolRemainingMs`, initialized at `start_draft`). Decremented on reconnect by elapsed disconnect time. When depleted: Standard = forfeit eligible immediately, Deferred = auto-shelve (D-10).

### Flag Transfers (D-34, D-35, D-36)
On disconnect or voluntary leave:
- **Captain:** transfers to next non-coach player on same team (deterministic: lowest userId)
- **Referee:** transfers to host, then next eligible online member
- **Host:** transfers to referee (if online), then longest-tenured non-coach/non-spectator
All transfers are permanent — not restored on reconnect.

### 3rd Party Referee Exclusive Concede (D-81, D-84)
When `refereeExclusiveConcede=true` and a 3rd party referee (Spectator slot, isReferee=true) is present:
- Only the referee can call `concede_match`, `claim_forfeit`, `defer_match`
- Auto-concede on last-player-leave is blocked (referee decides)
- If referee disconnects, flag transfers to host (on a team) — exclusive lock releases

### ensureMatchAlive Guard (D-12)
Every draft/equip/score reducer calls `ensureMatchAlive(ctx, lobby)` at the top. Blocks post-concede actions. Checks lobby stage and MatchResultRecord matchEndReason.
