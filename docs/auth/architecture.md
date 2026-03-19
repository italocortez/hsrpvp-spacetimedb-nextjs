# Auth & Users

## Tables

```
User
│  id (PK, autoInc), displayName, username (unique), role (Role enum)
│  isOnline, isPrivate, isGuest, deletedAt?
│
├── UserIdentity (maps SpacetimeDB identity → User)
│     identity (PK) → SpacetimeDB sender identity
│     userId         → User.id
│
└── UserDeletionJob (scheduled hard-delete)
      userId → User.id
      scheduledAt → 5 seconds after soft-delete
```

## Flow

1. Client connects → `clientConnected` lifecycle hook fires
2. `login_as_guest` or `server_link_discord` → creates/finds User + UserIdentity mapping
3. `getAuthenticatedUser(ctx)` resolves `ctx.sender` → UserIdentity → User in any reducer
4. `ensureAdmin(ctx)` / `ensureTournamentHost(ctx)` gate privileged operations
5. Admin calls `admin_delete_row("User", id)` → soft-delete (sets `deletedAt`) → schedules `UserDeletionJob` for 5s later → hard-deletes User, UserIdentity, and related rows

## Key Patterns

- `ctx.sender` is an Identity object — never pass userId as a reducer param for auth
- Guest accounts are blocked from most features (enforced per-reducer)
- `isOnline` toggled in `clientConnected` / `clientDisconnected` lifecycle hooks
