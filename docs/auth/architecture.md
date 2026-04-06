# Auth & Users

## Tables

```
User
│  id (PK, autoInc), displayName, username (unique), role (Role enum)
│  isOnline, isPrivate, isGuest, deletedAt?
│  avatarCharacterName → HsrCharacter.name
│  displayedAchievementId? → Achievement.id
│
└── UserIdentity (maps SpacetimeDB identity → User)
      identity (PK) → SpacetimeDB sender identity
      userId         → User.id
```

## Flow

1. Client connects → `clientConnected` lifecycle hook fires (sets isOnline=true if UserIdentity exists)
2. `login_as_guest` or `server_link_discord` → creates/finds User + UserIdentity mapping
3. `getAuthenticatedUser(ctx)` resolves `ctx.sender` → UserIdentity → User in any reducer
4. Guest accounts are blocked from most features (enforced per-reducer via `ensureVerifiedUser`)
5. Client disconnects → `clientDisconnected` lifecycle hook fires (sets isOnline=false)

## Reducer Reference

| Reducer | File | Permission | Description |
|---------|------|-----------|-------------|
| `login_as_guest` | auth.ts | Any | Creates guest User + UserIdentity, or updates lastLoginAt if already registered |

> **Admin & server reducers** (admin_bulk_upsert, admin_delete_row, admin_update_user, server_link_discord, server_set_role, etc.) are documented in [docs/admin/architecture.md](../admin/architecture.md).

## Key Patterns

- `ctx.sender` is an Identity object — never pass userId as a reducer param for auth
- Guest accounts are blocked from most features (enforced per-reducer via `ensureVerifiedUser`)
- `isOnline` toggled in `clientConnected` / `clientDisconnected` lifecycle hooks (index.ts)
- `getAuthenticatedUser` rejects soft-deleted users (checks `deletedAt`)

**Behavior specification:** See [contract.md](contract.md) (stub — full contract pending)
