# Module Bindings Reference

> **Auto-generated summary.** Rebuild this file whenever `spacetime generate` is run.
> Last generated from SpacetimeDB CLI v2.0.3

Source: `src/module_bindings/` (do NOT edit generated files directly)

## Imports

```typescript
import { DbConnection, tables } from './module_bindings';
// tables.user, tables.lobby, tables.matchSession, etc.
```

---

## Tables (14 total)

### User
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `username` | string | unique |
| `displayName` | string | |
| `isGuest` | bool | |
| `lastLoginAt` | timestamp | |
| `role` | Role | enum |
| `discordId` | string? | optional |
| `avatarCharacterName` | string | |
| `deletedAt` | timestamp? | optional |

**Indexes:** `user_discord_id` (discordId)

### UserIdentity
| Column | Type | Notes |
|--------|------|-------|
| `identity` | identity | PK, unique |
| `userId` | u32 | |
| `lastSeenAt` | timestamp | |

**Indexes:** `user_identity_user_id` (userId)

### Lobby
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `joinCode` | string | unique |
| `hostUserId` | u32 | |
| `teamBlueAlias` | string | |
| `teamRedAlias` | string | |
| `hostDisconnectTime` | timestamp? | optional |
| `lastActivityAt` | timestamp | |
| `stage` | LobbyStage | enum |
| `config` | LobbyConfig | object |

**Indexes:** `lobby_host` (hostUserId)

### LobbyMember
| Column | Type | Notes |
|--------|------|-------|
| `lobbyId` | u32 | |
| `userId` | u32 | |
| `isOnline` | bool | |
| `participationRole` | ParticipationRole | enum |
| `isReferee` | bool | |
| `teamSlot` | TeamLabel | enum |

**Indexes:** `lobby_member_lobby_id` (lobbyId)

### LobbyCursorEvent (event table)
| Column | Type | Notes |
|--------|------|-------|
| `lobbyId` | u32 | |
| `senderUserId` | u32 | |
| `x` | f32 | |
| `y` | f32 | |
| `timestamp` | timestamp | |

### MatchSession
| Column | Type | Notes |
|--------|------|-------|
| `lobbyId` | u32 | PK, unique |
| `turnIndex` | u32 | |
| `draftSequence` | DraftStep[] | array of objects |
| `timerState` | TimerState | object |
| `teamBlueBudget` | f32 | |
| `teamRedBudget` | f32 | |

### MatchSessionStep
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `lobbyId` | u32 | |
| `sequence` | u32 | |
| `actorUserId` | u32 | |
| `actorSlot` | TeamLabel | enum |
| `action` | ActionType | enum |
| `payload` | StepPayload | tagged union |
| `timestamp` | timestamp | |

**Indexes:** `match_history_lobby` (lobbyId)

### MatchSessionHistory
| Column | Type | Notes |
|--------|------|-------|
| `id` | string | PK, unique |
| `lobbyCode` | string | |
| `playedAt` | timestamp | |
| `draftMode` | DraftMode | enum |
| `gameMode` | GameMode | enum |
| `teamBlueAlias` | string | |
| `teamRedAlias` | string | |
| `blueTeamMembers` | PlayerSnapshot[] | array |
| `redTeamMembers` | PlayerSnapshot[] | array |
| `snapshotConfig` | LobbyConfig | object |
| `result` | MatchResult | enum |
| `rosterBlue` | string | |
| `rosterRed` | string | |

**Indexes:** `history_game_mode` (gameMode), `history_played_at` (playedAt)

### MatchSessionStepHistory
| Column | Type | Notes |
|--------|------|-------|
| `matchId` | string | PK, unique |
| `steps` | string | JSON string |

### HsrCharacter
| Column | Type | Notes |
|--------|------|-------|
| `name` | string | PK, unique |
| `displayName` | string | |
| `aliases` | string[] | |
| `rarity` | u8 | |
| `path` | Path | enum |
| `element` | Element | enum |
| `role` | CharRole | enum |
| `imageUrl` | string | |

**Indexes:** `character_by_path` (path), `character_by_element` (element), `character_by_role` (role)

### HsrCharacterCost
| Column | Type | Notes |
|--------|------|-------|
| `characterName` | string | |
| `gameMode` | GameMode | enum |
| `classicCosts` | EidolonCost | object |
| `auctionBaseBid` | EidolonCost | object |

### HsrLightcone
| Column | Type | Notes |
|--------|------|-------|
| `name` | string | PK, unique |
| `displayName` | string | |
| `aliases` | string[] | |
| `path` | Path | enum |
| `rarity` | u8 | |
| `imageUrl` | string | |
| `posX` | i32 | |
| `posY` | i32 | |
| `width` | i32 | |

**Indexes:** `lightcone_by_path` (path)

### HsrLightconeCost
| Column | Type | Notes |
|--------|------|-------|
| `lightconeName` | string | PK, unique |
| `classicCosts` | SuperimpositionCost | object |
| `auctionBaseBid` | SuperimpositionCost | object |

### HsrSynergyCost
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `sourceName` | string | |
| `targetName` | string | |
| `gameMode` | GameMode | enum |
| `costModifier` | f32 | |

**Indexes:** `synergy_source_mode` (sourceName, gameMode), `synergy_target` (targetName)

---

## Reducers (13 total)

### Authentication
| Reducer | Parameters | Description |
|---------|-----------|-------------|
| `login_as_guest` | (none) | Create guest account |
| `register_server` | (none) | Register server identity |
| `delete_guest_account` | (none) | Delete caller's guest account |

### User Management
| Reducer | Parameters | Description |
|---------|-----------|-------------|
| `update_username` | `newUsername: string` | Change username |
| `update_display_name` | `newDisplayName: string` | Change display name |
| `update_avatar` | `characterName: string` | Set avatar character |

### Admin
| Reducer | Parameters | Description |
|---------|-----------|-------------|
| `admin_bulk_upsert` | `tableName: string, jsonData: string` | Bulk insert/update rows |
| `admin_delete_row` | `tableName: string, primaryKeyJson: string` | Delete row by PK |
| `admin_update_user` | `userId: u32, displayName: string, username: string, roleTag: string` | Admin edit user |

### Server-only
| Reducer | Parameters | Description |
|---------|-----------|-------------|
| `server_delete_user` | `username: string` | Server deletes user |
| `server_link_discord` | `callerIdentityHex: string, discordId: string, discordUsername: string` | Link Discord account |
| `server_set_role` | `username: string, roleTag: string` | Set user role |

### Lobby
| Reducer | Parameters | Description |
|---------|-----------|-------------|
| `broadcast_cursor` | `lobbyId: u32, x: f32, y: f32` | Send cursor position |

**Client-side calls use camelCase and object syntax:**
```typescript
conn.reducers.loginAsGuest({});
conn.reducers.updateUsername({ newUsername: 'alice' });
conn.reducers.broadcastCursor({ lobbyId: 1, x: 0.5, y: 0.3 });
conn.reducers.adminBulkUpsert({ tableName: 'hsr_character', jsonData: '...' });
```

---

## Enums

| Enum | Variants |
|------|----------|
| ActionType | Pick, Ban, Nominate, Bid, AuctionSold, Pause, Undo |
| BanMode | None, Two, Four, Six |
| CharRole | Dps, Sustain, Support |
| DraftMode | Classic, Auction |
| Element | Fire, Ice, Imaginary, Lightning, Physical, Quantum, Wind |
| GameMode | MemoryOfChaos, ApocalypticShadow, AnomalyArbitration |
| LobbyStage | Waiting, Drafting, Finished |
| MatchResult | BlueWins, RedWins, Draw, Aborted |
| ParticipationRole | Player, Spectator |
| Path | Abundance, Destruction, Erudition, Harmony, Hunt, Nihility, Preservation, Remembrance, Elation |
| Role | Admin, TournamentHost, User |
| TeamLabel | Spectator, Blue, Red |

---

## Tagged Union: StepPayload

```typescript
type StepPayload =
  | { tag: 'Pick', value: PickPayload }
  | { tag: 'Ban', value: BanPayload }
  | { tag: 'Bid', value: BidPayload }
  | { tag: 'AuctionSold', value: AuctionSoldPayload }
  | { tag: 'Nominate', value: NominatePayload }
  | { tag: 'Undo', value: UndoPayload }
  | { tag: 'Pause', value: PausePayload }
```

---

## Custom Objects

| Type | Fields |
|------|--------|
| DraftStep | `actionRequired: ActionType, teamTurn: TeamLabel` |
| EidolonCost | `e0, e1, e2, e3, e4, e5, e6: f32` |
| SuperimpositionCost | `s1, s2, s3, s4, s5: f32` |
| LobbyConfig | `teamSize: u8, draftMode: DraftMode, banMode: BanMode, standardTurnSeconds: u32, reserveBankSeconds: u32, auctionBudget: f32?, rosterDiffAdvantage: f32, rosterThreshold: f32, underThresholdAdvantage: f32, aboveThresholdPenalty: f32, deathPenalty: f32` |
| TimerState | `turnStartAt: timestamp, teamBlueReserveMs: u32, teamRedReserveMs: u32, isPaused: bool, accumulatedPauseMs: u32` |
| PlayerSnapshot | `userId: u32, displayName: string, avatarUrl: string` |
| PickPayload | `characterName: string, eidolon: u8, costPaid: f32` |
| BanPayload | `characterName: string` |
| BidPayload | `amount: f32, targetCharacter: string` |
| AuctionSoldPayload | `characterName: string, winningAmount: f32, winningTeam: TeamLabel, eidolon: u8` |
| NominatePayload | `characterName: string, eidolon: u8` |
| PausePayload | `timeRemainingMs: u32, isAutoPause: bool` |
| UndoPayload | `originalSequenceId: u32` |
| UserDeletionJob | `scheduledId: u64, scheduledAt: scheduleAt, userId: u32` |
| ServerIdentity | `identity: identity, registeredAt: timestamp` |

---

## DbConnection Exports

```typescript
import {
  DbConnection,        // Main connection class
  DbConnectionBuilder, // Builder pattern for connections
  SubscriptionBuilder, // Subscribe to tables
  EventContext,         // Context for all events
  ReducerEventContext,  // Context for reducer callbacks
  SubscriptionEventContext, // Context for subscription callbacks
  ErrorContext,         // Context for error callbacks
  SubscriptionHandle,  // Handle for active subscriptions
  tables,              // All table accessors
  reducers,            // All reducer accessors (not commonly imported directly)
} from './module_bindings';
```
