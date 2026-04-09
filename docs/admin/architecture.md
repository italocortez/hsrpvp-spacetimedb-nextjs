# Admin & Server Operations -- Architecture

Last updated: 2026-04-09

## Overview

The admin feature covers privileged server operations: server identity bootstrapping, user management, ban enforcement, and generic row deletion/bulk upsert for game data tables. A trusted server identity (the Next.js API server) is registered once via `register_server` and gates all `server_*` reducers. Admin match tools (`admin_force_finalize`, `admin_void_match`, `admin_set_bracket_winner`) provide override capabilities for stuck or disputed matches.

The SYSTEM user (id=1) is created during `register_server` and serves as the audit trail identity for bootstrap and server-initiated operations.

## Table Relationships

```
ServerIdentity (identity: Identity PK)  [PRIVATE -- public: false]
  +-- identity -> SpacetimeDB sender identity (hex)
  +-- registeredAt: Timestamp

UserDeletionJob (scheduledId: u64 autoInc PK)  -- scheduled table
  +-- scheduledAt: ScheduleAt
  +-- userId -> User.id (user to cascade-delete)
  +-- audit columns

BanRecord (id: u32 autoInc PK)  [PRIVATE -- public: false]
  +-- banType: BanType (DiscordId)
  +-- providerId: string (the banned Discord snowflake)
  +-- reason: string
  +-- bannedByUserId -> User.id (admin who issued ban)
  +-- audit columns
  Indexes: ban_record_provider_id (btree, providerId)
```

## Reducer Flows

### register_server()
1. First-come-first-served: any caller can register if `ServerIdentity` table is empty
2. Insert `ServerIdentity` row with `ctx.sender` as identity
3. Create SYSTEM user: `id=1, discordId="1", role=Admin, username="SYSTEM"`
4. Insert `UserIdentity` linking `ServerIdentity.identity -> SYSTEM user.id`

### server_link_provider(identity, discordId, discordUsername, email?)
1. `requireServer(ctx)` -- validate caller is in ServerIdentity table
2. Look up `UserIdentity` by provided identity
3. Check ban: `rejectIfBanned(ctx, discordId)` -- reject if BanRecord exists
4. Three merge cases based on current state (see auth/architecture.md for case details)
5. Write `UserPrivate` (discordId, discordUsername, email), set `User.hasDiscordLinked=true`

### server_set_role(username, roleTag)
1. `requireServer(ctx)` -- validate caller is in ServerIdentity table
2. Find user by `User.username.find(username)` -- reject if not found
3. Validate roleTag against Role enum variants
4. `User.id.update()` with new role

### server_delete_user(username)
1. `requireServer(ctx)` -- validate caller is in ServerIdentity table
2. Find user by `User.username.find(username)` -- reject if not found
3. Call `performUserDeletion(ctx, userId, callerId)` -- same cascade as scheduled path

### server_set_mmr(userId, gameModeTag, rating)
1. `requireServer(ctx)` -- validate caller is in ServerIdentity table
2. Validate gameModeTag against GameMode enum variants
3. Upsert `MmrRating` row for userId + gameMode

### admin_delete_row(tableName, primaryKeyJson)
1. `ensureAdmin(ctx)` -- requires Admin role
2. Switch on `tableName` with table-specific guards:
   - `User`: soft-delete (set `deletedAt`), block if hosting/in active lobby or match step, schedule `UserDeletionJob` for 5s cascade
   - `UserIdentity`: iter-scan (no hex->Identity conversion)
   - `HsrCharacter`, `HsrLightcone`: delete by name PK
   - `HsrCharacterCost`, `HsrLightconeCost`: iter-find by composite key
   - `HsrSynergyCost`: delete by autoInc id
   - `Archetype`: cascade-delete `HsrCharacterArchetype` junction rows first
   - `HsrCharacterArchetype`: delete single junction row by composite key
   - `Lobby`, `MatchSession`, `MatchSessionStep`, `MatchSessionHistory`, `MatchSessionStepHistory`: direct delete
   - Unknown table: `SenderError`

### admin_bulk_upsert(tableName, jsonData)
1. `ensureAdmin(ctx)` -- requires Admin role
2. Parse `jsonData` as JSON array
3. `validateKeys(rows, tableName)` -- every row must have exactly expected keys (audit cols excluded)
4. Switch on `tableName`:
   - `HsrCharacter`: validate path/element/role enums, upsert by name PK. If `maxPossible` changes, auto-recompute all account ratings (D-33)
   - `HsrLightcone`: validate path enum, upsert by name PK
   - `HsrCharacterCost`, `HsrLightconeCost`: validate gameMode enum, delete+insert (composite PK)
   - `HsrSynergyCost`: validate gameMode enum, upsert via id.update() on existing or insert new
   - `Archetype`: upsert by name unique index
   - Unknown table: `SenderError`

### admin_update_user(userId, displayName, username, roleTag)
1. `ensureAdmin(ctx)` -- requires Admin role
2. Find user by id -- reject if not found
3. Validate `roleTag` against Role enum variants
4. If username changing: check uniqueness via `User.username.find()`
5. `User.id.update()` with new display name, username, role

### admin_ban_user(banTypeTag, providerId, reason)
1. `ensureAdmin(ctx)` -- requires Admin role
2. Validate `banTypeTag` is `'DiscordId'`; validate providerId non-empty and <=32 chars; validate reason non-empty and <=500 chars
3. Check for existing ban: `ban_record_provider_id.filter(providerId)` + in-memory banType filter (D-WR-01: multi-column index causes PANIC)
4. Insert `BanRecord` row
5. Find user via `UserPrivate.user_private_discord_id.filter(providerId)`, soft-delete if found (D-08 enforcement point 3)

### admin_unban_user(banRecordId)
1. `ensureAdmin(ctx)` -- requires Admin role
2. Find `BanRecord` by id -- reject if not found
3. Hard-delete the `BanRecord` row

### admin_force_finalize(lobbyId, winnerTeamId)
1. `getAuthenticatedUser(ctx)` + `ensureAdminOrOrganizer(ctx, user, lobby)` -- Moderator+ or tournament organizer/assistant
2. Find lobby -- reject if not in `AwaitingResult` stage (D-52)
3. Find `MatchResultRecord` via `lobby_id` index -- reject if not found
4. Reject if `mmrProcessedAt` already set (D-56)
5. Map `winnerTeamId` to `winnerTeamSide` (Blue/Red) via bracket match team slots
6. Update `MatchResultRecord` with winner and `Validated` status
7. Call `runFinalization(ctx, updatedResult, userId)` -- archives, writes stats/MMR, hard-deletes lobby

### admin_void_match(lobbyId)
1. `getAuthenticatedUser(ctx)` + `ensureAdminOrOrganizer(ctx, user, lobby)` -- Moderator+ or tournament organizer/assistant
2. Find lobby -- reject if not in `AwaitingResult` stage (D-53)
3. Find `MatchResultRecord` -- reject if `mmrProcessedAt` set (D-56)
4. Call `hardDeleteLobby(ctx, lobbyId)` -- erases match result and lobby without finalization

### admin_set_bracket_winner(bracketMatchId, winnerTeamId)
1. `getAuthenticatedUser(ctx)` -- Moderator+ or tournament organizer/assistant
2. Find bracket match -- reject if not found
3. Reject if bracket match already has `winnerTeamId` set (D-54)
4. Validate `winnerTeamId` is team1Id or team2Id on the bracket match
5. Call `advanceBracketMatch(ctx, bracketMatchId, winnerTeamId, userId)`

### run_user_deletion(job) -- scheduled
1. Scheduled reducer, fires 5 seconds after `UserDeletionJob` inserted
2. Calls `performUserDeletion(ctx, job.userId, job.createdById)`:
   - Hard-delete active-state rows: UserIdentity, HsrAccountCharacter, HsrAccount, AvailabilitySlot, SavedCalendar, CalendarEventInvite, CalendarEvent
   - If user has history references: soft-delete (set username='deleted_\<id\>', clear discordId, preserve displayName)
   - If guest with no history references: hard-delete User row

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| register_server is first-come-first-served; SYSTEM user id=1 created on bootstrap | Phase 01 execution | 2026-02-01 |
| User deletion is always async (5s delay via UserDeletionJob) to avoid blocking transaction | Phase 01 execution | 2026-02-01 |
| admin_bulk_upsert validates field keys per table (EXPECTED_KEYS map) and rejects unknown fields | Phase 02 execution | 2026-02-10 |
| admin_delete_row guards User deletion: blocks if hosting/in active lobby or match | Phase 02 execution | 2026-02-10 |
| admin_force_finalize, admin_void_match, admin_set_bracket_winner added (D-52, D-53, D-54) | Phase 09 execution | 2026-03-28 |
| BanRecord table added [PRIVATE]; ban enforcement at three points (link, reconnect, ban-time) (D-08) | Phase 12 execution | 2026-04-05 |
| Multi-column index on BanRecord causes PANIC in SpacetimeDB TS SDK; use single-column index + in-memory filter (D-WR-01) | Phase 12 execution | 2026-04-05 |
| HsrCharacter bulk upsert auto-triggers account rating recalc if maxPossible changes (D-33) | Phase 11 execution | 2026-04-01 |
| Normalized to standard template | Phase 13 normalization | 2026-04-09 |

---

*Last updated: 2026-04-09*
*Feature owner: Phase 01 / Phase 09 / Phase 12*

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
