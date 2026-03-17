# Module Bindings Reference

> **Auto-generated summary.** Rebuild this file whenever `spacetime generate` is run.
> Last generated from SpacetimeDB CLI v2.0.5 — Phase 03-05 gap closure: set_coach, remove_coach reducers added

Source: `src/module_bindings/` (do NOT edit generated files directly)

## Imports

```typescript
import { DbConnection, tables } from './module_bindings';
// tables.user, tables.lobby, tables.matchSession, tables.costSet, tables.tournamentTeam, etc.
```

---

## Tables (public tables — 37 total)

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
| `isOnline` | bool | |
| `isPrivate` | bool | |
| `deletedAt` | timestamp? | optional |

**Indexes:** `user_discord_id` (discordId), `username` (unique)

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
| `teamSize` | u8 | |
| `draftMode` | DraftMode | enum |
| `banMode` | BanMode | enum |
| `standardTurnSeconds` | u32 | |
| `reserveBankSeconds` | u32 | |
| `auctionBudget` | f32? | optional |
| `rosterDiffAdvantage` | f32 | |
| `rosterThreshold` | f32 | |
| `underThresholdAdvantage` | f32 | |
| `aboveThresholdPenalty` | f32 | |
| `deathPenalty` | f32 | |
| `tournamentId` | u32? | optional |
| `bracketMatchId` | u32? | optional |
| `isAnonymousPlayers` | bool | |
| `isAnonymousSpectators` | bool | |
| `isOpenRoster` | bool | |
| `costSetId` | u32 | NEW: custom cost set for non-tournament matches |
| `isPublic` | bool | |
| `disconnectPolicy` | DisconnectPolicy | enum |
| `gameMode` | GameMode | enum |
| `hostDisconnectTime` | timestamp? | optional |
| `lastActivityAt` | timestamp | |
| `stage` | LobbyStage | enum |

**Indexes:** `host_user_id` (hostUserId), `stage` (stage), `tournament_id` (tournamentId)

### LobbyMember
| Column | Type | Notes |
|--------|------|-------|
| `lobbyId` | u32 | |
| `userId` | u32 | |
| `isOnline` | bool | |
| `participationRole` | ParticipationRole | enum |
| `isReferee` | bool | |
| `isCoach` | bool | |
| `teamSlot` | TeamLabel | enum |

**PK:** `[lobbyId, userId]`
**Indexes:** `lobby_id` (lobbyId), `user_id` (userId)

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
| `snapshotConfig` | LobbyConfigSnapshot | object |
| `result` | MatchResult | enum |
| `rosterBlue` | string | |
| `rosterRed` | string | |

**Indexes:** `history_game_mode` (gameMode), `history_played_at` (playedAt)

### MatchSessionStepHistory
| Column | Type | Notes |
|--------|------|-------|
| `matchId` | string | PK, unique |
| `steps` | string | JSON string |

### MatchResultRecord
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `bracketMatchId` | u32? | optional |
| `lobbyId` | u32 | |
| `player1Id` | u32 | |
| `player2Id` | u32 | |
| `isTournamentMatch` | bool | |
| `status` | MatchResultStatus | enum |
| `winnerId` | u32? | optional |
| `mmrProcessedAt` | timestamp? | optional |
| `team1Confirmed` | bool | NEW |
| `team2Confirmed` | bool | NEW |
| `refereeUserId` | u32? | optional, NEW |
| `disputedByUserId` | u32? | optional, NEW |
| `disputeReason` | string? | optional, NEW |
| `tournamentId` | u32? | optional, NEW |
| `matchType` | u8 | NEW: 0=casual, 1=ranked, 2=tournament |

**Indexes:** `lobby_id` (lobbyId), `player_1_id` (player1Id), `player_2_id` (player2Id), `tournament_id` (tournamentId)

### MatchResultGame
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `matchResultId` | u32 | |
| `gameNumber` | u8 | |
| `winnerId` | u32? | optional |
| `blueScore` | GameScore | object |
| `redScore` | GameScore | object |

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
| `costSetId` | u32 | 0 = default set |

**PK:** `[characterName, gameMode, costSetId]` (expanded from 2 columns — requires --clear-database)
**Indexes:** `cost_set_id` (costSetId)

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
| `lightconeName` | string | |
| `gameMode` | GameMode | enum |
| `classicCosts` | SuperimpositionCost | object |
| `auctionBaseBid` | SuperimpositionCost | object |
| `costSetId` | u32 | 0 = default set |

**PK:** `[lightconeName, gameMode, costSetId]` (expanded from 2 columns — requires --clear-database)
**Indexes:** `cost_set_id` (costSetId)

### HsrSynergyCost
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `sourceName` | string | |
| `targetName` | string | |
| `gameMode` | GameMode | enum |
| `costModifier` | f32 | |
| `costSetId` | u32 | 0 = default set |

**Indexes:** `source_mode` (sourceName, gameMode), `target_name` (targetName), `cost_set_id` (costSetId)

### CostSet (NEW — Phase 03-01)
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `name` | string | |
| `creatorId` | u32 | |
| `gameMode` | GameMode | enum |
| `isPublished` | bool | |
| `isDraft` | bool | |
| `isLocked` | bool | |

**Indexes:** `creator_id` (creatorId)

> Note: `CostSetDraftCharacter`, `CostSetDraftLightcone`, `CostSetDraftSynergy` are private tables — no client bindings generated.

### Tournament
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `name` | string | |
| `description` | string | |
| `organizerId` | u32 | |
| `format` | TournamentFormat | enum |
| `stage` | TournamentStage | enum |
| `defaultGameMode` | GameMode | enum |
| `maxParticipants` | u32 | |
| `teamSize` | u8 | NEW |
| `isAnonymousDefault` | bool | |
| `isAnonymousSpectators` | bool | |
| `rosterVisibility` | RosterVisibility | NEW enum (replaces isOpenRoster) |
| `disconnectPolicy` | DisconnectPolicy | enum |
| `checkInEnabled` | bool | |
| `checkInPerRound` | bool | |
| `autoForfeitEnabled` | bool | |
| `autoForfeitMinutes` | u32 | |
| `bracketRevealAt` | timestamp? | optional |
| `winnerAdvantage` | u8 | NEW: replaces grandFinalsAdvantage |
| `groupAssignmentMode` | GroupAssignmentMode | enum |
| `groupAdvanceCount` | u8 | |
| `costSetId` | u32 | NEW: FK to CostSet.id |
| `seasonId` | u32? | optional |
| `countTowardsMmr` | bool | |
| `defaultBestOf` | u8 | |
| `requireVerified` | bool | NEW |
| `requireRoster` | bool | NEW |
| `minimumMmr` | u32? | optional, NEW |
| `requireApproval` | bool | NEW |
| `waitlistEnabled` | bool | NEW |
| `scheduledStartAt` | timestamp? | optional, NEW |
| `registrationDeadline` | timestamp? | optional, NEW |

**Indexes:** `organizer_id` (organizerId), `stage` (stage)

### TournamentParticipant
| Column | Type | Notes |
|--------|------|-------|
| `tournamentId` | u32 | |
| `userId` | u32 | |
| `teamGroupId` | u32? | optional, NEW: FK to TournamentTeam.id (replaces teamId) |
| `participantType` | ParticipantType | enum |
| `status` | ParticipantStatus | enum |
| `seedNumber` | u32? | optional |
| `anonymousAlias` | string? | optional |
| `isWaitlisted` | bool | NEW |
| `approvedByToAt` | timestamp? | optional, NEW |
| `hsrAccountId` | u32? | optional, NEW |

**PK:** `[tournamentId, userId]`
**Indexes:** `tournament_id` (tournamentId), `user_id` (userId)

### TournamentAssistant
| Column | Type | Notes |
|--------|------|-------|
| `tournamentId` | u32 | |
| `userId` | u32 | |

**PK:** `[tournamentId, userId]`

### TournamentTeam (NEW — Phase 03-01)
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `tournamentId` | u32 | |
| `name` | string | |
| `captainUserId` | u32 | |

**Indexes:** `tournament_id` (tournamentId), `captain_user_id` (captainUserId)

### TournamentTeamRequest (NEW — Phase 03-01)
| Column | Type | Notes |
|--------|------|-------|
| `teamId` | u32 | |
| `userId` | u32 | |
| `isPending` | bool | |

**PK:** `[teamId, userId]`
**Indexes:** `team_id` (teamId), `user_id` (userId)

### Team
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `name` | string | |
| `tag` | string | |
| `logoUrl` | string? | optional |
| `ownerId` | u32 | |

### TeamMember
| Column | Type | Notes |
|--------|------|-------|
| `teamId` | u32 | |
| `userId` | u32 | |
| `role` | TeamMemberRole | enum |

**PK:** `[teamId, userId]`

### TeamInvite
| Column | Type | Notes |
|--------|------|-------|
| `teamId` | u32 | |
| `invitedUserId` | u32 | |
| `invitedByUserId` | u32 | |
| `isPending` | bool | |

**PK:** `[teamId, invitedUserId]`

### BracketMatch / GroupStanding — omitted for brevity

### MmrRating
| Column | Type | Notes |
|--------|------|-------|
| `userId` | u32 | PK, unique |
| `gameMode` | GameMode | enum |
| `rating` | u32 | |
| `gamesPlayed` | u32 | |

### HsrAccount / HsrAccountCharacter / HsrAccountLightcone — see roster feature

### Archetype / HsrCharacterArchetype — see archetype feature

### Achievement / UserAchievement — see achievement feature

### Calendar tables (AvailabilitySlot, SavedCalendar, CalendarEvent, CalendarEventInvite) — see calendar feature

### PlayerStats / CharacterStats — see stats feature

### ChatMessage — see chat feature

---

## Reducers

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
| `admin_update_user` | `userId: u32, displayName: string, username: string, roleTag: string` | Admin edit user (accepts Moderator since Phase 03-01) |
| `admin_upsert_archetype` | `name: string, description: string` | Upsert archetype |
| `admin_delete_archetype` | `archetypeId: u32` | Delete archetype + junctions |
| `admin_assign_character_archetypes` | `characterName: string, archetypeIds: u32[]` | Set character archetypes |
| `admin_remove_character_archetypes` | `characterName: string, archetypeIds: u32[]` | Remove character archetypes |
| `admin_batch_upsert_characters` | `jsonData: string` | Batch upsert character+cost rows |
| `admin_batch_remove_characters` | `names: string[]` | Batch delete characters |
| `admin_create_hsr_account` | `targetUserId: u32, accountName: string, ...` | Admin create HSR account |
| `admin_update_hsr_account` | `targetUserId: u32, accountId: u32, ...` | Admin update HSR account |
| `admin_delete_hsr_account` | `targetUserId: u32, accountId: u32` | Admin delete HSR account |

### Server-only
| Reducer | Parameters | Description |
|---------|-----------|-------------|
| `server_delete_user` | `username: string` | Server deletes user |
| `server_link_discord` | `callerIdentityHex: string, discordId: string, discordUsername: string` | Link Discord account |
| `server_set_role` | `username: string, roleTag: string` | Set user role |

### Roster
| Reducer | Parameters | Description |
|---------|-----------|-------------|
| `create_hsr_account` | `accountName: string, gameUid: string, server: string` | Create HSR account |
| `update_hsr_account` | `accountId: u32, ...` | Update HSR account |
| `delete_hsr_account` | `accountId: u32` | Delete HSR account |
| `set_active_hsr_account` | `accountId: u32` | Set active account |
| `batch_upsert_characters` | `jsonData: string` | Batch upsert character roster |
| `batch_remove_characters` | `names: string[]` | Batch remove characters |
| `migrate_roster` | (none) | Migrate legacy roster data |

### Lobby
| Reducer | Parameters | Description |
|---------|-----------|-------------|
| `broadcast_cursor` | `lobbyId: u32, x: f32, y: f32` | Send cursor position |
| `transfer_referee` | `lobbyId: u32, targetUserId: u32` | Transfer referee flag to another member (caller must be referee) |
| `reclaim_referee` | `lobbyId: u32` | Reclaim referee flag back to lobby host |
| `set_coach` | `lobbyId: u32, targetUserId: u32` | Set isCoach=true on a lobby member (host or referee only) |
| `remove_coach` | `lobbyId: u32, targetUserId: u32` | Set isCoach=false on a lobby member (host or referee only) |

**Client-side calls use camelCase and object syntax:**
```typescript
conn.reducers.loginAsGuest({});
conn.reducers.updateUsername({ newUsername: 'alice' });
conn.reducers.broadcastCursor({ lobbyId: 1, x: 0.5, y: 0.3 });
conn.reducers.adminBulkUpsert({ tableName: 'HsrCharacter', jsonData: '...' });
```

---

## Enums

| Enum | Variants |
|------|----------|
| ActionType | Pick, Ban, Nominate, Bid, AuctionSold, Pause, Undo |
| AchievementRarity | Rare, Epic, Legendary |
| AchievementTriggerType | StatThreshold, CharacterSpecific, Manual |
| BanMode | None, Two, Four, Six |
| CharRole | Dps, Sustain, Support |
| DisconnectPolicy | Pause, TimerThenForfeit, NoAction |
| DraftMode | Classic, Auction |
| Element | Fire, Ice, Imaginary, Lightning, Physical, Quantum, Wind |
| GameMode | MemoryOfChaos, ApocalypticShadow, AnomalyArbitration |
| GroupAssignmentMode | Auto, Manual |
| LobbyStage | Waiting, Drafting, Finished |
| MatchResult | BlueWins, RedWins, Draw, Aborted |
| MatchResultStatus | Pending, Submitted, Disputed, Validated, Rejected |
| ParticipantStatus | Registered, CheckedIn, Active, Eliminated, Disqualified, Withdrawn |
| ParticipantType | Individual, Team |
| ParticipationRole | Player, Spectator |
| Path | Abundance, Destruction, Erudition, Harmony, Hunt, Nihility, Preservation, Remembrance, Elation |
| Role | Admin, **Moderator** (NEW), TournamentHost, User |
| RosterVisibility | **OpenRoster, ClosedWithRating, ClosedNoRating** (NEW — Phase 03-01) |
| TeamLabel | Spectator, Blue, Red |
| TeamMemberRole | Owner, Player, Coach |
| TournamentFormat | SingleElimination, DoubleElimination, GroupOnly, GroupIntoSingleElim, GroupIntoDoubleElim |
| TournamentStage | Draft, Registration, **Seeding** (NEW), InProgress, Completed, Cancelled — **Paused removed** |
| ValidationStatus | Pending, Confirmed, Disputed |

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
| LobbyConfigSnapshot | `teamSize: u8, draftMode, banMode, standardTurnSeconds: u32, reserveBankSeconds: u32, auctionBudget: f32?, rosterDiffAdvantage: f32, rosterThreshold: f32, underThresholdAdvantage: f32, aboveThresholdPenalty: f32, deathPenalty: f32` |
| TimerState | `turnStartAt: timestamp, teamBlueReserveMs: u32, teamRedReserveMs: u32, isPaused: bool, accumulatedPauseMs: u32` |
| PlayerSnapshot | `userId: u32, displayName: string, avatarUrl: string` |
| GameScore | `cyclesUsed: u32?, scorePoints: u64?, boss1Score: u64?, boss2Score: u64?` |
| EloConfig | `kFactorNew: u8, kFactorMid: u8, kFactorVet: u8, newThreshold: u32, midThreshold: u32, initialRating: u32` |
| PickPayload | `characterName: string, eidolon: u8, costPaid: f32` |
| BanPayload | `characterName: string` |
| BidPayload | `amount: f32, targetCharacter: string` |
| AuctionSoldPayload | `characterName: string, winningAmount: f32, winningTeam: TeamLabel, eidolon: u8` |
| NominatePayload | `characterName: string, eidolon: u8` |
| PausePayload | `timeRemainingMs: u32, isAutoPause: bool` |
| UndoPayload | `originalSequenceId: u32` |

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

---

## Permission Hierarchy (Phase 03-01)

```typescript
// ROLE_LEVEL mapping in ensurePermissions.ts
Admin: 100, Moderator: 75, TournamentHost: 50, User: 25, Guest: 0

// Helpers
getRoleLevel(role)           // returns numeric level
isRoleAtLeast(role, 'Admin') // boolean check
ensureAdmin(ctx)             // throws if < Admin
ensureModerator(ctx)         // throws if < Moderator
ensureTournamentHost(ctx)    // throws if < TournamentHost
ensureVerifiedUser(ctx)      // throws if isGuest
ensureTournamentAccess(ctx, tournamentId)  // in tournamentHelpers.ts
validateStageTransition(currentTag, nextTag) // forward-only, cancel allowed
```
