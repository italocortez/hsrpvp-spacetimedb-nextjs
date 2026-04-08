# Auth & Users

## Tables

### Public Tables

```
User
│  id (PK, autoInc), displayName, username (unique), role (Role enum)
│  isOnline, isPrivate, isGuest, hasDiscordLinked (bool), deletedAt?
│  avatarCharacterName → HsrCharacter.name
│  displayedAchievementId? → Achievement.id
│  lastLoginAt (Timestamp), createdDate, lastModifiedDate, audit columns
```

### Private Tables (public: false — not accessible via client subscriptions)

```
UserIdentity (maps SpacetimeDB identity → User)  [PRIVATE — Phase 12]
│  identity (PK) → SpacetimeDB sender identity
│  userId         → User.id
│  lastSeenAt     → Timestamp
│  (Accessor: identity, user_id)

UserPrivate (stores sensitive provider data)  [NEW — Phase 12]
│  userId (PK)     → User.id (1:1 relationship)
│  discordId?      → Discord user ID (snowflake)
│  discordUsername? → Discord display name
│  email?          → email address
│  (Index: user_private_discord_id on discordId)
│  Audit columns: createdById, createdDate, lastModifiedById, lastModifiedDate

BanRecord (ban infrastructure)  [NEW — Phase 12]
│  id (PK, autoInc)
│  banType         → BanType enum { DiscordId }
│  providerId      → the banned provider ID (e.g., Discord snowflake)
│  reason          → human-readable ban reason
│  bannedByUserId  → User.id (admin who issued the ban)
│  (Index: ban_record_provider_id on providerId)
│  Audit columns: createdById, createdDate, lastModifiedById, lastModifiedDate
```

## Enums

```
BanType: { DiscordId }   — identifies which provider the ban applies to
```

## Views

| View | Scope | Returns |
|------|-------|---------|
| `view_my_profile` | ctx.sender only | Merged User + UserPrivate fields (MyProfileRow) — includes discordId, discordUsername |
| `view_my_identity` | ctx.sender only | Caller's UserIdentity row |
| `view_admin_user_private` | Moderator+ only | All UserPrivate rows |
| `view_user_directory` | All clients | Projected UserDirectoryRow — safe D-16 subset: excludes audit cols, deletedAt, lastLoginAt, isPrivate, auth IDs |

### MyProfileRow fields (view_my_profile)

```
id, username, displayName, isGuest, isOnline, isPrivate, lastLoginAt, role,
hasDiscordLinked, avatarCharacterName, displayedAchievementId?, deletedAt?,
discordId?, discordUsername?, email?,
createdById, createdDate, lastModifiedById, lastModifiedDate
```

## Flow

1. Client connects → `clientConnected` lifecycle hook fires
   - Sets `User.isOnline = true` if UserIdentity exists
   - D-08 enforcement point 2: if UserPrivate.discordId is banned → soft-delete user
2. `login_as_guest` → creates/finds User + UserIdentity mapping (`hasDiscordLinked: false`)
3. `server_link_provider` (server-only) → writes UserPrivate, sets `User.hasDiscordLinked = true`
   - D-08 enforcement point 1: `rejectIfBanned` called at link-time
4. `getAuthenticatedUser(ctx)` resolves `ctx.sender` → UserIdentity → User in any reducer
5. Client disconnects → `clientDisconnected` lifecycle hook fires (sets isOnline=false)

## API Route: /api/auth/link-discord (D-09, D-10)

The Next.js API route performs ephemeral connection identity verification:

1. Verify the NextAuth (Discord OAuth) session server-side → get `discordId`, `discordUsername`
2. Parse `spacetimeToken` from request body
3. Create an ephemeral SpacetimeDB connection using the client's token → extract server-verified identity hex (WR-02: fail-fast on disconnect)
4. Call `server_link_provider` via the trusted server connection with the verified identity

This replaces the previous approach of trusting client-supplied identity hex (SEC-04).

## Reducer Reference

| Reducer | File | Permission | Description |
|---------|------|-----------|-------------|
| `login_as_guest` | auth.ts | Any | Creates guest User + UserIdentity, or updates lastLoginAt if already registered |
| `server_link_provider` | server.ts | Server identity only | Links a provider (Discord) to a User: writes UserPrivate, sets hasDiscordLinked, handles guest-upgrade + cross-device redirect cases |
| `admin_ban_user` | banAdmin.ts | Admin only | Creates BanRecord + soft-deletes affected user (D-08 point 3) |
| `admin_unban_user` | banAdmin.ts | Admin only | Hard-deletes BanRecord by id |

> **Other admin/server reducers** (admin_update_user, server_set_role, server_delete_user, etc.) are documented in [docs/admin/architecture.md](../admin/architecture.md).

## Ban Enforcement (D-08: Three-Point Enforcement)

| Enforcement Point | Where | When |
|------------------|-------|------|
| Point 1 (link-time) | `server_link_provider` | `rejectIfBanned` called before any user mutation |
| Point 2 (reconnect) | `clientConnected` | Ban check on reconnect; if banned → soft-delete immediately |
| Point 3 (ban-time) | `admin_ban_user` | Soft-deletes the currently linked user on ban creation |

## Key Patterns

- `ctx.sender` is an Identity object — never pass userId as a reducer param for auth
- Guest accounts are blocked from most features (enforced per-reducer via `ensureVerifiedUser`)
- `isOnline` toggled in `clientConnected` / `clientDisconnected` lifecycle hooks (index.ts)
- `getAuthenticatedUser` rejects soft-deleted users (checks `deletedAt`)
- UserIdentity is private (Phase 12): clients subscribe to `view_my_identity` instead of directly querying the table
- `discordId` removed from public User table (Phase 12): use `hasDiscordLinked` for link status, `view_my_profile` for actual Discord data

**Behavior specification:** See [contract.md](contract.md)
