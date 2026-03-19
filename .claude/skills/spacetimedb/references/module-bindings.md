# Module Bindings Reference

> **Auto-generated summary.** Rebuild after every `spacetime generate`.
> A PostToolUse hook reminds you to do this automatically.
> Last synced from SpacetimeDB CLI v2.0.5 — 2026-03-18 (260318-r63: multi-column btree indexes on 19 composite PK tables)

Source: `src/module_bindings/` (never edit generated files)

**Convention:** All tables have 4 audit columns at the end (`createdById: u32`, `createdDate: timestamp`, `lastModifiedById: u32`, `lastModifiedDate: timestamp`). These are **omitted** from column tables below to save space.

---

## Table of Contents

1. [Imports](#imports)
2. [Tables](#tables-43-subscribable) — User, Lobby, Match, HSR, Costs, Roster, Tournament, Teams, MMR, Achievements, Calendar, Stats, Chat
3. [Reducers](#reducers-63-total) — Auth, User, Admin, Server, Lobby, Roster, Archetypes, Cost Set, Tournament, Tournament Team, Match Result, Moderation
4. [Enums](#enums)
5. [Tagged Unions](#tagged-unions)
6. [Custom Objects](#custom-objects)
7. [Private Tables](#private-tables-types-only-not-subscribable)
8. [DbConnection Exports](#dbconnection-exports)
9. [Permission Hierarchy](#permission-hierarchy)

---

## Imports

```typescript
import { DbConnection, tables, reducers } from './module_bindings';
// tables.User, tables.Lobby, tables.MatchSession, tables.CostSet, tables.Tournament, etc.
```

---

## Tables (43 subscribable)

### User & Identity

#### User
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `username` | string | unique |
| `displayName` | string | |
| `isGuest` | bool | |
| `isOnline` | bool | |
| `isPrivate` | bool | |
| `lastLoginAt` | timestamp | |
| `role` | Role | enum |
| `discordId` | string? | optional |
| `avatarCharacterName` | string | |
| `deletedAt` | timestamp? | optional, soft-delete |

**Indexes:** `discord_id` (discordId), `id` (PK+unique), `username` (unique)

#### UserIdentity
| Column | Type | Notes |
|--------|------|-------|
| `identity` | identity | PK, unique |
| `userId` | u32 | |
| `lastSeenAt` | timestamp | |

**Indexes:** `identity` (unique), `user_id` (userId)

---

### Lobby & Match

#### Lobby
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
| `costSetId` | u32 | custom cost set |
| `isPublic` | bool | |
| `disconnectPolicy` | DisconnectPolicy | enum |
| `gameMode` | GameMode | enum |
| `hostDisconnectTime` | timestamp? | optional |
| `lastActivityAt` | timestamp | |
| `stage` | LobbyStage | enum |

**Indexes:** `host_user_id` (hostUserId), `id` (PK+unique), `joinCode` (unique), `stage` (stage), `tournament_id` (tournamentId)

#### LobbyMember
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
**Indexes:** `lobby_id` (lobbyId), `user_id` (userId), `by_lobby_and_user` ([lobbyId, userId])

#### LobbyCursorEvent (event table)
| Column | Type | Notes |
|--------|------|-------|
| `lobbyId` | u32 | |
| `senderUserId` | u32 | |
| `x` | f32 | |
| `y` | f32 | |
| `timestamp` | timestamp | |

Event table: auto-deletes after delivery.

#### MatchSession
| Column | Type | Notes |
|--------|------|-------|
| `lobbyId` | u32 | PK, unique |
| `turnIndex` | u32 | |
| `draftSequence` | DraftStep[] | array of objects |
| `timerState` | TimerState | object |
| `teamBlueBudget` | f32 | |
| `teamRedBudget` | f32 | |

#### MatchSessionStep
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

**Indexes:** `id` (PK+unique), `lobby_id` (lobbyId)

#### MatchSessionHistory
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

**Indexes:** `game_mode` (gameMode), `id` (PK+unique), `played_at` (playedAt)

#### MatchSessionStepHistory
| Column | Type | Notes |
|--------|------|-------|
| `matchId` | string | PK, unique |
| `steps` | string | JSON string |

#### MatchResultRecord
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
| `team1Confirmed` | bool | |
| `team2Confirmed` | bool | |
| `refereeUserId` | u32? | optional |
| `disputedByUserId` | u32? | optional |
| `disputeReason` | string? | optional |
| `tournamentId` | u32? | optional |
| `matchType` | u8 | 0=casual, 1=ranked, 2=tournament |

**Indexes:** `id` (PK+unique), `lobby_id` (lobbyId), `player_1_id` (player1Id), `player_2_id` (player2Id), `tournament_id` (tournamentId)

#### MatchResultGame
| Column | Type | Notes |
|--------|------|-------|
| `matchResultId` | u32 | |
| `gameNumber` | u8 | |
| `gameMode` | GameMode | enum |
| `player1ScreenshotUrl` | string? | optional |
| `player2ScreenshotUrl` | string? | optional |
| `player1CyclesUsed` | u32? | optional |
| `player2CyclesUsed` | u32? | optional |
| `player1Score` | u64? | optional |
| `player2Score` | u64? | optional |
| `player1Boss1Score` | u64? | optional |
| `player1Boss2Score` | u64? | optional |
| `player2Boss1Score` | u64? | optional |
| `player2Boss2Score` | u64? | optional |
| `winnerId` | u32? | optional |
| `validationStatus` | ValidationStatus | enum |
| `validatedById` | u32? | optional |

**PK:** `[matchResultId, gameNumber]`
**Indexes:** `match_result_id` (matchResultId), `by_result_and_game` ([matchResultId, gameNumber])

#### MatchResultParticipant
| Column | Type | Notes |
|--------|------|-------|
| `matchResultId` | u32 | |
| `userId` | u32 | |
| `teamSide` | TeamLabel | enum |
| `createdById` | u32 | audit |
| `createdDate` | Timestamp | audit |
| `lastModifiedById` | u32 | audit |
| `lastModifiedDate` | Timestamp | audit |

**PK:** `[matchResultId, userId]`
**Indexes:** `match_result_id` (matchResultId), `user_id` (userId), `by_result_and_user` ([matchResultId, userId])

---

### HSR Data

#### HsrCharacter
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

**Indexes:** `by_element` (element), `name` (PK+unique), `by_path` (path), `by_role` (role)

#### HsrLightcone
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

**Indexes:** `name` (PK+unique), `by_path` (path)

#### HsrCharacterCost
| Column | Type | Notes |
|--------|------|-------|
| `characterName` | string | |
| `gameMode` | GameMode | enum |
| `classicCosts` | EidolonCost | object |
| `auctionBaseBid` | EidolonCost | object |
| `costSetId` | u32 | 0 = default set |

**PK:** `[characterName, gameMode, costSetId]`
**Indexes:** `cost_set_id` (costSetId), `by_character_mode_and_set` ([characterName, gameMode, costSetId])

#### HsrLightconeCost
| Column | Type | Notes |
|--------|------|-------|
| `lightconeName` | string | |
| `gameMode` | GameMode | enum |
| `classicCosts` | SuperimpositionCost | object |
| `auctionBaseBid` | SuperimpositionCost | object |
| `costSetId` | u32 | 0 = default set |

**PK:** `[lightconeName, gameMode, costSetId]`
**Indexes:** `cost_set_id` (costSetId), `by_lightcone_mode_and_set` ([lightconeName, gameMode, costSetId])

#### HsrSynergyCost
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `sourceName` | string | |
| `targetName` | string | |
| `gameMode` | GameMode | enum |
| `costModifier` | f32 | |
| `costSetId` | u32 | 0 = default set |

**Indexes:** `cost_set_id` (costSetId), `id` (PK+unique), `source_mode` (sourceName+gameMode), `target_name` (targetName)

---

### Cost Sets

#### CostSet
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `name` | string | |
| `creatorId` | u32 | |
| `gameMode` | GameMode | enum |
| `isPublished` | bool | |
| `isDraft` | bool | |
| `isLocked` | bool | |

**Indexes:** `creator_id` (creatorId), `id` (PK+unique)

---

### Roster (HSR Accounts)

#### HsrAccount
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `userId` | u32 | |
| `uid` | string | game UID |
| `region` | string | |
| `displayLabel` | string | |
| `isActive` | bool | |
| `isRosterPublic` | bool | |
| `isRatingPublic` | bool | |
| `isDuplicateUid` | bool | |

**Indexes:** `id` (PK+unique), `uid` (uid), `user_id` (userId)

#### HsrAccountCharacter
| Column | Type | Notes |
|--------|------|-------|
| `hsrAccountId` | u32 | |
| `characterName` | string | |
| `eidolonLevel` | u8 | |

**PK:** `[hsrAccountId, characterName]`
**Indexes:** `hsr_account_id` (hsrAccountId), `by_account_and_character` ([hsrAccountId, characterName])

#### HsrAccountLightcone
| Column | Type | Notes |
|--------|------|-------|
| `hsrAccountId` | u32 | |
| `lightconeName` | string | |
| `superimpositionLevel` | u8 | |

**PK:** `[hsrAccountId, lightconeName]`
**Indexes:** `hsr_account_id` (hsrAccountId), `by_account_and_lightcone` ([hsrAccountId, lightconeName])

#### Archetype
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `name` | string | unique |
| `description` | string | |

**Indexes:** `id` (PK+unique), `name` (unique)

#### HsrCharacterArchetype
| Column | Type | Notes |
|--------|------|-------|
| `characterName` | string | |
| `archetypeId` | u32 | |

**PK:** `[characterName, archetypeId]`
**Indexes:** `archetype_id` (archetypeId), `character_name` (characterName), `by_character_and_archetype` ([characterName, archetypeId])

---

### Tournament

#### Tournament
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
| `teamSize` | u8 | |
| `isAnonymousDefault` | bool | |
| `isAnonymousSpectators` | bool | |
| `rosterVisibility` | RosterVisibility | enum |
| `disconnectPolicy` | DisconnectPolicy | enum |
| `checkInEnabled` | bool | |
| `checkInPerRound` | bool | |
| `autoForfeitEnabled` | bool | |
| `autoForfeitMinutes` | u32 | |
| `bracketRevealAt` | timestamp? | optional |
| `winnerAdvantage` | u8 | |
| `groupAssignmentMode` | GroupAssignmentMode | enum |
| `groupAdvanceCount` | u8 | |
| `costSetId` | u32 | FK to CostSet.id |
| `seasonId` | u32? | optional |
| `countTowardsMmr` | bool | |
| `defaultBestOf` | u8 | |
| `requireVerified` | bool | |
| `requireRoster` | bool | |
| `minimumMmr` | u32? | optional |
| `requireApproval` | bool | |
| `waitlistEnabled` | bool | |
| `scheduledStartAt` | timestamp? | optional |
| `registrationDeadline` | timestamp? | optional |

**Indexes:** `id` (PK+unique), `organizer_id` (organizerId), `stage` (stage)

#### TournamentParticipant
| Column | Type | Notes |
|--------|------|-------|
| `tournamentId` | u32 | |
| `userId` | u32 | |
| `teamGroupId` | u32? | optional, FK to TournamentTeam.id |
| `participantType` | ParticipantType | enum |
| `status` | ParticipantStatus | enum |
| `seedNumber` | u32? | optional |
| `anonymousAlias` | string? | optional |
| `isWaitlisted` | bool | |
| `approvedByToAt` | timestamp? | optional |
| `hsrAccountId` | u32? | optional |

**PK:** `[tournamentId, userId]`
**Indexes:** `tournament_id` (tournamentId), `user_id` (userId), `by_tournament_and_user` ([tournamentId, userId])

#### TournamentAssistant
| Column | Type | Notes |
|--------|------|-------|
| `tournamentId` | u32 | |
| `userId` | u32 | |
| `canValidateResults` | bool | |
| `canOverrideResults` | bool | |
| `canDqParticipants` | bool | |
| `canManageBracket` | bool | |
| `canAssignSeeds` | bool | |

**PK:** `[tournamentId, userId]`
**Indexes:** `tournament_id` (tournamentId), `user_id` (userId), `by_tournament_and_user` ([tournamentId, userId])

#### TournamentTeam
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `tournamentId` | u32 | |
| `name` | string | |
| `captainUserId` | u32 | |

**Indexes:** `captain_user_id` (captainUserId), `id` (PK+unique), `tournament_id` (tournamentId)

#### TournamentTeamRequest
| Column | Type | Notes |
|--------|------|-------|
| `teamId` | u32 | |
| `userId` | u32 | |
| `isPending` | bool | |

**PK:** `[teamId, userId]`
**Indexes:** `team_id` (teamId), `user_id` (userId), `by_team_and_user` ([teamId, userId])

#### BracketMatch
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `tournamentId` | u32 | |
| `roundNumber` | u32 | |
| `matchNumber` | u32 | |
| `isLosersBracket` | bool | |
| `groupId` | u32? | optional |
| `participant1Id` | u32? | optional |
| `participant2Id` | u32? | optional |
| `nextWinnerMatchId` | u32? | optional |
| `nextLoserMatchId` | u32? | optional |
| `bestOf` | u8 | |
| `gameMode` | GameMode | enum |
| `winnerAdvantage` | u8 | |
| `scheduledAt` | timestamp? | optional |
| `lobbyId` | u32? | optional |
| `checkInRequired` | bool | |
| `winnerId` | u32? | optional |
| `resultStatus` | MatchResultStatus | enum |

**Indexes:** `id` (PK+unique), `lobby_id` (lobbyId), `tournament_id` (tournamentId)

#### GroupStanding
| Column | Type | Notes |
|--------|------|-------|
| `tournamentId` | u32 | |
| `groupId` | u32 | |
| `participantUserId` | u32 | |
| `wins` | u32 | |
| `losses` | u32 | |
| `draws` | u32 | |
| `points` | u32 | |

**PK:** `[tournamentId, groupId, participantTeamId]`
**Indexes:** `tournament_id` (tournamentId), `by_tournament_group_and_team` ([tournamentId, groupId, participantTeamId])

---

### Teams (persistent)

#### Team
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `name` | string | unique |
| `ownerId` | u32 | |
| `isAdHoc` | bool | |
| `tournamentId` | u32? | optional |

**Indexes:** `id` (PK+unique), `name` (unique), `owner_id` (ownerId)

#### TeamMember
| Column | Type | Notes |
|--------|------|-------|
| `teamId` | u32 | |
| `userId` | u32 | |
| `memberRole` | TeamMemberRole | enum |

**PK:** `[teamId, userId]`
**Indexes:** `team_id` (teamId), `user_id` (userId), `by_team_and_user` ([teamId, userId])

#### TeamInvite
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `teamId` | u32 | |
| `inviteeUserId` | u32 | |
| `inviterUserId` | u32 | |
| `isPending` | bool | |

**Indexes:** `id` (PK+unique), `invitee_user_id` (inviteeUserId), `team_id` (teamId)

---

### MMR

#### MmrRating
| Column | Type | Notes |
|--------|------|-------|
| `userId` | u32 | |
| `gameMode` | GameMode | enum |
| `rating` | u32 | |
| `matchesPlayed` | u32 | |
| `globalCompositeRating` | u32? | optional |
| `seasonId` | u32? | optional |

**PK:** `[userId, gameMode]`
**Indexes:** `rating` (rating), `user_id` (userId), `by_user_and_mode` ([userId, gameMode])

#### MmrHistory
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `userId` | u32 | |
| `gameMode` | GameMode | enum |
| `matchResultId` | u32 | |
| `previousRating` | u32 | |
| `newRating` | u32 | |
| `delta` | i32 | |
| `seasonId` | u32? | optional |

**Indexes:** `id` (PK+unique), `match_result_id` (matchResultId), `user_id` (userId)

---

### Achievements

#### Achievement
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `name` | string | unique |
| `description` | string | |
| `triggerType` | AchievementTriggerType | enum |
| `rarity` | AchievementRarity | enum |
| `isOneTime` | bool | |
| `thresholdValue` | u32? | optional |
| `characterName` | string? | optional |

**Indexes:** `id` (PK+unique), `name` (unique)

#### UserAchievement
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `userId` | u32 | |
| `achievementId` | u32 | |
| `awardedById` | u32 | |
| `isDisplayed` | bool | |

**Indexes:** `achievement_id` (achievementId), `id` (PK+unique), `user_id` (userId)

---

### Calendar

#### AvailabilitySlot
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `userId` | u32 | |
| `startAt` | timestamp | |
| `endAt` | timestamp | |
| `isRecurring` | bool | |
| `recurrenceRule` | RecurrenceRule | object |
| `expiresAt` | timestamp | |

**Indexes:** `id` (PK+unique), `start_at` (startAt), `user_id` (userId)

#### CalendarEvent
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `organizerId` | u32 | |
| `title` | string | |
| `startAt` | timestamp | |
| `endAt` | timestamp | |
| `bracketMatchId` | u32? | optional |

**Indexes:** `id` (PK+unique), `organizer_id` (organizerId), `start_at` (startAt)

#### CalendarEventInvite
| Column | Type | Notes |
|--------|------|-------|
| `eventId` | u32 | |
| `inviteeUserId` | u32 | |
| `isAccepted` | bool? | optional |

**PK:** `[eventId, inviteeUserId]`
**Indexes:** `event_id` (eventId), `invitee_user_id` (inviteeUserId), `by_event_and_invitee` ([eventId, inviteeUserId])

#### SavedCalendar
| Column | Type | Notes |
|--------|------|-------|
| `userId` | u32 | |
| `targetUserId` | u32 | |
| `isVisible` | bool | |

**PK:** `[userId, targetUserId]`
**Indexes:** `user_id` (userId), `by_user_and_target` ([userId, targetUserId])

---

### Stats

#### PlayerStats
| Column | Type | Notes |
|--------|------|-------|
| `userId` | u32 | PK, unique |
| `matchesPlayed` | u32 | |
| `wins` | u32 | |
| `losses` | u32 | |
| `draws` | u32 | |
| `matchesSpectated` | u32 | |

**Indexes:** `userId` (PK+unique), `wins` (wins)

#### CharacterStats
| Column | Type | Notes |
|--------|------|-------|
| `userId` | u32 | |
| `characterName` | string | |
| `wins` | u32 | |
| `losses` | u32 | |
| `matchesPlayed` | u32 | |

**PK:** `[userId, characterName]`
**Indexes:** `user_id` (userId)

---

### Chat

#### ChatMessage
| Column | Type | Notes |
|--------|------|-------|
| `id` | u32 | PK, unique |
| `lobbyId` | u32 | |
| `senderUserId` | u32 | |
| `senderType` | ChatSenderType | enum |
| `content` | string | |
| `metadata` | string? | optional |
| `anonymousLabel` | string? | optional |

**Indexes:** `id` (PK+unique), `lobby_id` (lobbyId)

---

## Reducers (63 total)

### Authentication
| Reducer | Parameters |
|---------|-----------|
| `login_as_guest` | _(none)_ |
| `register_server` | _(none)_ |
| `delete_guest_account` | _(none)_ |

### User Management
| Reducer | Parameters |
|---------|-----------|
| `update_username` | `newUsername: string` |
| `update_display_name` | `newDisplayName: string` |
| `update_avatar` | `characterName: string` |

### Admin
| Reducer | Parameters |
|---------|-----------|
| `admin_bulk_upsert` | `tableName: string, jsonData: string` |
| `admin_delete_row` | `tableName: string, primaryKeyJson: string` |
| `admin_update_user` | `userId: u32, displayName: string, username: string, roleTag: string` |

### Server-only
| Reducer | Parameters |
|---------|-----------|
| `server_delete_user` | `username: string` |
| `server_link_discord` | `callerIdentityHex: string, discordId: string, discordUsername: string` |
| `server_set_role` | `username: string, roleTag: string` |

### Lobby
| Reducer | Parameters |
|---------|-----------|
| `broadcast_cursor` | `lobbyId: u32, x: f32, y: f32` |
| `transfer_referee` | `lobbyId: u32, targetUserId: u32` |
| `reclaim_referee` | `lobbyId: u32` |
| `set_coach` | `lobbyId: u32, targetUserId: u32` |
| `remove_coach` | `lobbyId: u32, targetUserId: u32` |

### Roster (HSR Accounts)
| Reducer | Parameters |
|---------|-----------|
| `create_hsr_account` | `uid: string, displayLabel: string` |
| `update_hsr_account` | `hsrAccountId: u32, displayLabel: string, isRosterPublic: bool, isRatingPublic: bool` |
| `delete_hsr_account` | `hsrAccountId: u32` |
| `set_active_hsr_account` | `hsrAccountId: u32` |
| `batch_upsert_characters` | `hsrAccountId: u32, charactersJson: string` |
| `batch_remove_characters` | `hsrAccountId: u32, characterNamesJson: string` |
| `migrate_roster` | `sourceAccountId: u32, targetAccountId: u32, mode: string` |

### Admin Roster
| Reducer | Parameters |
|---------|-----------|
| `admin_create_hsr_account` | `targetUserId: u32, uid: string, displayLabel: string` |
| `admin_update_hsr_account` | `hsrAccountId: u32, displayLabel: string, isRosterPublic: bool, isRatingPublic: bool` |
| `admin_delete_hsr_account` | `hsrAccountId: u32` |
| `admin_batch_upsert_characters` | `hsrAccountId: u32, charactersJson: string` |
| `admin_batch_remove_characters` | `hsrAccountId: u32, characterNamesJson: string` |

### Archetypes (Admin)
| Reducer | Parameters |
|---------|-----------|
| `admin_upsert_archetype` | `name: string, description: string` |
| `admin_delete_archetype` | `archetypeId: u32` |
| `admin_assign_character_archetypes` | `characterName: string, archetypeIdsJson: string` |
| `admin_remove_character_archetypes` | `characterName: string, archetypeIdsJson: string` |

### Cost Set
| Reducer | Parameters |
|---------|-----------|
| `create_cost_set` | `name: string, sourceSetId: u32, gameModeTag: string` |
| `delete_cost_set` | `costSetId: u32` |
| `lock_cost_set` | `costSetId: u32` |
| `publish_cost_set` | `costSetId: u32` |
| `unpublish_cost_set` | `costSetId: u32` |
| `edit_draft_character_cost` | `costSetId: u32, characterName: string, gameModeTag: string, classicCostsJson: string, auctionBaseBidJson: string` |
| `edit_draft_lightcone_cost` | `costSetId: u32, lightconeName: string, gameModeTag: string, classicCostsJson: string, auctionBaseBidJson: string` |
| `edit_draft_synergy_cost` | `costSetId: u32, sourceName: string, targetName: string, gameModeTag: string, costModifier: f32` |

### Tournament
| Reducer | Parameters |
|---------|-----------|
| `create_tournament` | `name: string, description: string, format: string, teamSize: u8, defaultGameMode: string, maxParticipants: u32, rosterVisibility: string, isAnonymousDefault: bool, disconnectPolicy: string, costSetId: u32, defaultBestOf: u8, countTowardsMmr: bool, winnerAdvantage: u8, requireVerified: bool, requireRoster: bool, minimumMmr: u32, requireApproval: bool, waitlistEnabled: bool, scheduledStartAt: string, registrationDeadline: string` |
| `update_tournament` | `tournamentId: u32, name: string, description: string, rosterVisibility: string, isAnonymousDefault: bool, disconnectPolicy: string, costSetId: u32, defaultBestOf: u8, winnerAdvantage: u8, requireVerified: bool, requireRoster: bool, minimumMmr: u32, requireApproval: bool, waitlistEnabled: bool, scheduledStartAt: string, registrationDeadline: string` |
| `cancel_tournament` | `tournamentId: u32` |
| `advance_tournament_stage` | `tournamentId: u32, nextStage: string` |
| `register_for_tournament` | `tournamentId: u32, teamGroupId: u32` |
| `withdraw_from_tournament` | `tournamentId: u32` |
| `approve_participant` | `tournamentId: u32, userId: u32` |
| `dq_participant` | `tournamentId: u32, userId: u32, reason: string` |
| `waitlist_promote` | `tournamentId: u32, userId: u32` |
| `assign_tournament_assistant` | `tournamentId: u32, userId: u32, canValidateResults: bool, canOverrideResults: bool, canDqParticipants: bool, canManageBracket: bool, canAssignSeeds: bool` |
| `remove_tournament_assistant` | `tournamentId: u32, userId: u32` |

### Tournament Team
| Reducer | Parameters |
|---------|-----------|
| `create_tournament_team` | `tournamentId: u32, teamName: string` |
| `disband_tournament_team` | `teamId: u32` |
| `leave_tournament_team` | `teamId: u32` |
| `request_join_team` | `teamId: u32` |
| `accept_team_request` | `teamId: u32, userId: u32` |
| `reject_team_request` | `teamId: u32, userId: u32` |

### Match Result
| Reducer | Parameters |
|---------|-----------|
| `submit_match_result` | `matchResultId: u32, winnerId: u32` |
| `confirm_match_scores` | `matchResultId: u32` |
| `dispute_match_result` | `matchResultId: u32, reason: string` |
| `override_match_result` | `matchResultId: u32, newStatusTag: string, winnerId: u32, reason: string` |

### Moderation
| Reducer | Parameters |
|---------|-----------|
| `mod_promote_to_host` | `userId: u32` |
| `mod_demote_from_host` | `userId: u32` |

**Client-side calls use camelCase and object syntax:**
```typescript
conn.reducers.loginAsGuest({});
conn.reducers.updateUsername({ newUsername: 'alice' });
conn.reducers.createTournament({ name: 'Weekly', description: '...', format: 'SingleElimination', ... });
conn.reducers.submitMatchResult({ matchResultId: 1, winnerId: 42 });
```

---

## Enums

| Enum | Variants |
|------|----------|
| AchievementRarity | Rare, Epic, Legendary |
| AchievementTriggerType | StatThreshold, CharacterSpecific, Manual |
| ActionType | Pick, Ban, Nominate, Bid, AuctionSold, Pause, Undo |
| BanMode | None, Two, Four, Six |
| CharRole | Dps, Sustain, Support |
| ChatSenderType | Player, System |
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
| RecurrenceType | Daily, Weekly, Monthly |
| Role | Admin, Moderator, TournamentHost, User |
| RosterVisibility | OpenRoster, ClosedWithRating, ClosedNoRating |
| TeamLabel | Spectator, Blue, Red |
| TeamMemberRole | Owner, Player, Coach |
| TournamentFormat | SingleElimination, DoubleElimination, GroupOnly, GroupIntoSingleElim, GroupIntoDoubleElim |
| TournamentStage | Draft, Registration, Seeding, InProgress, Completed, Cancelled |
| ValidationStatus | Pending, Confirmed, Disputed |

---

## Tagged Unions

### StepPayload
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
| LobbyConfigSnapshot | `teamSize: u8, draftMode: DraftMode, banMode: BanMode, standardTurnSeconds: u32, reserveBankSeconds: u32, auctionBudget: f32?, rosterDiffAdvantage: f32, rosterThreshold: f32, underThresholdAdvantage: f32, aboveThresholdPenalty: f32, deathPenalty: f32` |
| TimerState | `turnStartAt: timestamp, teamBlueReserveMs: u32, teamRedReserveMs: u32, isPaused: bool, accumulatedPauseMs: u32` |
| PlayerSnapshot | `userId: u32, displayName: string, avatarUrl: string` |
| RecurrenceRule | `recurrenceType: RecurrenceType, interval: u8, dayOfWeek: u8?, dayOfMonth: u8?, endDate: timestamp?` |
| PickPayload | `characterName: string, eidolon: u8, costPaid: f32` |
| BanPayload | `characterName: string` |
| BidPayload | `amount: f32, targetCharacter: string` |
| AuctionSoldPayload | `characterName: string, winningAmount: f32, winningTeam: TeamLabel, eidolon: u8` |
| NominatePayload | `characterName: string, eidolon: u8` |
| PausePayload | `timeRemainingMs: u32, isAutoPause: bool` |
| UndoPayload | `originalSequenceId: u32` |

---

## Private Tables (types only, not subscribable)

These types are generated in `types.ts` but have no table subscriptions in `index.ts`. Reducers can read/write them server-side, but clients cannot subscribe.

| Type | Fields | Purpose |
|------|--------|---------|
| LobbyPassword | `lobbyId: u32 (PK), passwordHash: string` | Private lobby passwords |
| CostSetDraftCharacter | `costSetId: u32, characterName: string, gameMode: GameMode, classicCosts: EidolonCost, auctionBaseBid: EidolonCost` | Draft cost edits (character) |
| CostSetDraftLightcone | `costSetId: u32, lightconeName: string, gameMode: GameMode, classicCosts: SuperimpositionCost, auctionBaseBid: SuperimpositionCost` | Draft cost edits (lightcone) |
| CostSetDraftSynergy | `costSetId: u32, sourceName: string, targetName: string, gameMode: GameMode, costModifier: f32` | Draft cost edits (synergy) |
| ServerIdentity | `identity: identity (PK), registeredAt: timestamp` | Server auth (no audit columns) |
| UserDeletionJob | `scheduledId: u64, scheduledAt: scheduleAt, userId: u32` | Scheduled table for delayed user deletion |

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

## Permission Hierarchy

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
