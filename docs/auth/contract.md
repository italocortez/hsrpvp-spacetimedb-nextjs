# Auth

**Architecture:** [architecture.md](architecture.md)

## Feature Overview

Authentication manages how users connect to the SpacetimeDB module, create accounts (guest or Discord-linked), and maintain online presence. The auth system is minimal by design — a single `login_as_guest` reducer handles account creation and reconnection. Discord linking and role management are server-side operations documented in [docs/admin/contract.md](../admin/contract.md).

## Reducers

### login_as_guest

**Purpose:** Create a guest user or reconnect an existing one

**Permission:** Any (no auth required — this IS the auth entry point)

**Parameters:** None (uses `ctx.sender` identity)

**Flow:**
1. Look up `ctx.sender` in UserIdentity table
2. If found → find linked User → update `lastLoginAt`, `isOnline=true`, `lastSeenAt` → return
3. If not found → generate guest username from identity hex (`Guest_{first8chars}`)
4. Insert new User row (isGuest=true, isOnline=true, role=User, avatarCharacterName='march7th')
5. Insert UserIdentity row linking `ctx.sender` → new User

**Expected State Changes:**
- Existing user: `User.lastLoginAt` = ctx.timestamp, `User.isOnline` = true, `UserIdentity.lastSeenAt` = ctx.timestamp
- New user: `User` row inserted, `UserIdentity` row inserted

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| None — reducer always succeeds | — |

### clientConnected (lifecycle hook)

**Purpose:** Mark user as online when their WebSocket connects

**Permission:** System (lifecycle hook, not user-callable)

**Flow:**
1. Look up `ctx.sender` in UserIdentity table
2. If found → set `User.isOnline = true`
3. If not found → no-op (user hasn't called login_as_guest yet)

### clientDisconnected (lifecycle hook)

**Purpose:** Mark user as offline, handle disconnect policies for active lobbies

**Permission:** System (lifecycle hook, not user-callable)

**Flow:**
1. Look up `ctx.sender` in UserIdentity table
2. If found → set `User.isOnline = false`
3. Check for active lobby membership → trigger disconnect handling (see [docs/lobby/contract.md](../lobby/contract.md))

## Acceptance Scenarios

### Guest Login (First Time)
**Given:** No UserIdentity exists for the caller's SpacetimeDB identity
**When:** `login_as_guest` is called
**Then:** User row inserted with `isGuest=true`, `role=User`, `username=Guest_{hex8}`, `avatarCharacterName='march7th'`. UserIdentity row inserted linking identity to user.

### Guest Login (Reconnect)
**Given:** UserIdentity exists for caller, linked to User with id=5
**When:** `login_as_guest` is called
**Then:** `User.lastLoginAt` updated to current timestamp, `User.isOnline=true`, `UserIdentity.lastSeenAt` updated. No new rows created.

### Soft-Deleted User Reconnect
**Given:** UserIdentity exists for caller, linked User has `deletedAt` set
**When:** Any reducer calls `getAuthenticatedUser(ctx)`
**Then:** Throws error — soft-deleted users are rejected

### Connection Lifecycle
**Given:** User is registered (UserIdentity exists)
**When:** Client WebSocket connects
**Then:** `User.isOnline = true`
**When:** Client WebSocket disconnects
**Then:** `User.isOnline = false`

### Unregistered Connection
**Given:** No UserIdentity exists for the connecting identity
**When:** Client WebSocket connects
**Then:** No-op — `clientConnected` silently skips unknown identities

## Edge Cases

| Case | Expected Behavior | Notes |
|------|-------------------|-------|
| Identity hex collision in guest username | Extremely unlikely (8 hex chars = 4 billion combinations) | If it happened, autoInc id makes User rows unique regardless |
| Rapid connect/disconnect | Each lifecycle hook is its own transaction — no race condition | SpacetimeDB serializes reducer calls |
| Guest calls privileged reducer | `ensureVerifiedUser` rejects with error | Per-reducer guard, not auth-level |

## Integration Points

| This Feature | Connects To | How | Direction |
|-------------|------------|-----|-----------|
| `User.id` | All features | FK from virtually every table | reads |
| `UserIdentity.identity` | `getAuthenticatedUser` helper | ctx.sender → User resolution | reads |
| `clientDisconnected` | Lobby disconnect handling | Triggers disconnect policy | writes |
| `User.isOnline` | Lobby browser, cursor tracking | Online presence indicator | reads |

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| Guest login creates User + UserIdentity | Phase 1 execution | 2026-03-16 |
| Soft-delete pattern (deletedAt check in getAuthenticatedUser) | Phase 2 discussion | 2026-03-16 |
| clientDisconnected disconnect handling | Phase 10 execution | 2026-04-03 |
| Auth/Admin doc separation | Pre-Phase 11 cleanup | 2026-04-06 |
