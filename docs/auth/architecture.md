# Auth & Users

## Tables

```
User
│  id (PK, autoInc), displayName, username (unique), role (Role enum)
│  isOnline, isPrivate, isGuest, deletedAt?
│  avatarCharacterName → HsrCharacter.name
│  displayedAchievementId? → Achievement.id
│
├── UserIdentity (maps SpacetimeDB identity → User)
│     identity (PK) → SpacetimeDB sender identity
│     userId         → User.id
│
├── ServerIdentity (private — not broadcast to clients)
│     identity (PK) → trusted server's SpacetimeDB identity
│     registeredAt
│
└── UserDeletionJob (scheduled hard-delete)
      userId → User.id
      scheduledAt → 5 seconds after soft-delete
```

## Flow

1. Client connects → `clientConnected` lifecycle hook fires (sets isOnline=true if UserIdentity exists)
2. `login_as_guest` or `server_link_discord` → creates/finds User + UserIdentity mapping
3. `getAuthenticatedUser(ctx)` resolves `ctx.sender` → UserIdentity → User in any reducer
4. `ensureAdmin(ctx)` / `ensureTournamentHost(ctx)` gate privileged operations
5. Admin calls `admin_delete_row("User", id)` → soft-delete (sets `deletedAt`) → schedules `UserDeletionJob` for 5s later → hard-deletes User, UserIdentity, and related rows
6. Client disconnects → `clientDisconnected` lifecycle hook fires (sets isOnline=false)

## Reducer Reference

| Reducer | File | Permission | Description |
|---------|------|-----------|-------------|
| `login_as_guest` | auth.ts | Any | Creates guest User + UserIdentity, or updates lastLoginAt if already registered |
| `register_server` | server.ts | First caller only | Registers server identity (first-come-first-served) + creates SYSTEM user (discordId="1", role=Admin) + links ServerIdentity→UserIdentity |
| `server_link_discord` | server.ts | Server identity | Links Discord account to user — upgrades guest to verified, re-points identity for returning users, cleans orphaned guests |
| `server_set_role` | server.ts | Server identity | Sets a user's role by username. Used by manage-user.ts script |
| `server_delete_user` | server.ts | Server identity | Deletes a user by username — removes UserIdentity rows + User row. Used by manage-user.ts script |
| `server_set_mmr` | server.ts | Server identity | Upserts MmrRating row for userId + gameMode. Valid modes: MemoryOfChaos, ApocalypticShadow, AnomalyArbitration |
| `admin_delete_row` | admin.ts | Admin | Generic row deletion with table-specific guards (User soft-delete, lobby/match blocking) |
| `admin_bulk_upsert` | admin.ts | Admin | Bulk upsert rows into game data tables (HsrCharacter, HsrLightcone, costs, archetypes). Used by seed-data script |
| `admin_update_user` | admin.ts | Admin | Field-level user updates (role, displayName, avatarCharacterName, etc.) |
| `run_user_deletion` | userDeletion.ts | Scheduled | Hard-delete cascade: UserIdentity → HsrAccountCharacter → HsrAccount → User. Note: HsrAccountLightcone NOT cascaded (lightcone reducers descoped from Phase 2) |

## Key Patterns

- `ctx.sender` is an Identity object — never pass userId as a reducer param for auth
- Guest accounts are blocked from most features (enforced per-reducer via `ensureVerifiedUser`)
- `isOnline` toggled in `clientConnected` / `clientDisconnected` lifecycle hooks (index.ts)
- Server identity is registered once via `register_server` — all `server_*` reducers validate caller via `requireServer(ctx)` which checks ServerIdentity table
- SYSTEM user (id=1, discordId="1") is the audit trail identity for bootstrap/server operations

**Behavior specification:** See [contract.md](contract.md) (stub — full contract pending)
