# Admin & Server Operations

## Tables

```
ServerIdentity (private — not broadcast to clients)
│  identity (PK) → trusted server's SpacetimeDB identity
│  registeredAt
│
UserDeletionJob (scheduled deletion cascade)
│  userId → User.id
│  scheduledAt → 5 seconds after admin marks for deletion
```

## Server Identity

The server identity is a trusted SpacetimeDB identity registered once via `register_server` (first-come-first-served). All `server_*` reducers validate the caller via `requireServer(ctx)` which checks the ServerIdentity table.

**SYSTEM user:** id=1, discordId="1", role=Admin. Created during `register_server` as the audit trail identity for bootstrap/server operations.

## User Deletion

All deletion paths (admin, server, orphan cleanup) use the shared `performUserDeletion` helper:

1. `admin_delete_row("User", id)` or `server_delete_user` → marks for deletion (sets `deletedAt`) → schedules `UserDeletionJob` for 5s later
2. `run_user_deletion` fires → cascade-deletes active-state rows (UserIdentity, HsrAccountCharacter, HsrAccount, AvailabilitySlot, SavedCalendar, CalendarEventInvite, CalendarEvent)
3. **Soft-delete** if user has history references: `username='deleted_<id>'` (frees unique constraint), `discordId=undefined`, `displayName` preserved for history table FK lookups
4. **Hard-delete** if guest user with no history references (checked via `hasHistoryReferences`)

## Reducer Reference

| Reducer | File | Permission | Description |
|---------|------|-----------|-------------|
| `register_server` | server.ts | First caller only | Registers server identity (first-come-first-served) + creates SYSTEM user (discordId="1", role=Admin) + links ServerIdentity→UserIdentity |
| `server_link_discord` | server.ts | Server identity | Links Discord account to user — upgrades guest to verified, re-points identity for returning users, cleans orphaned guests |
| `server_set_role` | server.ts | Server identity | Sets a user's role by username. Used by manage-user.ts script |
| `server_delete_user` | server.ts | Server identity | Deletes a user by username via `performUserDeletion` (same cascade + soft/hard-delete logic as scheduled path). Used by manage-user.ts script |
| `server_set_mmr` | server.ts | Server identity | Upserts MmrRating row for userId + gameMode. Valid modes: MemoryOfChaos, ApocalypticShadow, AnomalyArbitration |
| `admin_delete_row` | admin.ts | Admin | Generic row deletion with table-specific guards (User soft-delete, lobby/match blocking) |
| `admin_bulk_upsert` | admin.ts | Admin | Bulk upsert rows into game data tables (HsrCharacter, HsrLightcone, costs, archetypes). Used by seed-data script |
| `admin_update_user` | admin.ts | Admin | Field-level user updates (role, displayName, avatarCharacterName, etc.) |
| `run_user_deletion` | userDeletion.ts | Scheduled | Cascade via `performUserDeletion` — see User Deletion section above |

## Permission Helpers

| Helper | File | What it checks |
|--------|------|---------------|
| `ensureAdmin(ctx)` | helpers/permissionHelpers.ts | Resolves sender → User, verifies role === Admin |
| `ensureTournamentHost(ctx)` | helpers/permissionHelpers.ts | Resolves sender → User, verifies role >= TournamentHost |
| `requireServer(ctx)` | helpers/permissionHelpers.ts | Checks sender identity exists in ServerIdentity table |

## Key Patterns

- `ensureAdmin` / `ensureTournamentHost` gate all privileged operations — every admin/TO reducer calls one of these first
- Server identity is registered once via `register_server` — all `server_*` reducers validate via `requireServer(ctx)`
- `admin_bulk_upsert` validates field keys per table (`EXPECTED_KEYS` map) and rejects unknown fields
- User deletion is always async (5s delay via UserDeletionJob) to avoid blocking the caller's transaction

**Behavior specification:** See [contract.md](contract.md) (pending — admin-specific scenarios to be written)
