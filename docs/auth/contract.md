# Auth

**Architecture:** [architecture.md](architecture.md)

## Feature Overview

Authentication manages how users connect to the SpacetimeDB module, create accounts (guest or Discord-linked), and maintain online presence. The auth system is minimal by design — a single `login_as_guest` reducer handles account creation and reconnection. Discord linking and role management are server-side operations.

## Reducers

### login_as_guest

**Purpose:** Create a guest user or reconnect an existing one

**Permission:** Any (no auth required — this IS the auth entry point)

**Parameters:** None (uses `ctx.sender` identity)

**Flow:**
1. Look up `ctx.sender` in UserIdentity table
2. If found → find linked User → update `lastLoginAt`, `isOnline=true`, `lastSeenAt` → return
3. If not found → generate guest username from identity hex (`Guest_{first8chars}`)
4. Insert new User row (isGuest=true, isOnline=true, role=User, avatarCharacterName='march7th', hasDiscordLinked=false)
5. Insert UserIdentity row linking `ctx.sender` → new User

**Expected State Changes:**
- Existing user: `User.lastLoginAt` = ctx.timestamp, `User.isOnline` = true, `UserIdentity.lastSeenAt` = ctx.timestamp
- New user: `User` row inserted (hasDiscordLinked=false), `UserIdentity` row inserted

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| None — reducer always succeeds | — |

### server_link_provider

**Purpose:** Link a provider (Discord) to a User; upgrade guest to verified; create UserPrivate record

**Permission:** Server identity only (requireServer)

**Parameters:** `callerIdentityHex`, `provider` ('discord'), `providerId`, `providerName`

**Flow:**
1. Resolve UserIdentity from callerIdentityHex
2. `rejectIfBanned(ctx, 'DiscordId', providerId)` — D-08 enforcement point 1
3. Case 1a: Guest user → update User (isGuest=false, hasDiscordLinked=true, username=providerName)
4. Case 1b: Verified user with different identity → redirect existing user to this identity
5. Case 1c: Upgrade existing mapping
6. Upsert UserPrivate with discordId + discordUsername

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Provider is banned | "Discord ID \<id\> is banned" |
| Identity not registered | "Identity not registered. Call login_as_guest first" |

### clientConnected (lifecycle hook)

**Purpose:** Mark user as online when their WebSocket connects; enforce bans on reconnect

**Permission:** System (lifecycle hook, not user-callable)

**Flow:**
1. Look up `ctx.sender` in UserIdentity table
2. If found → set `User.isOnline = true`
3. Check UserPrivate for discordId → if banned → soft-delete user (D-08 point 2)
4. If not found → no-op (user hasn't called login_as_guest yet)

### clientDisconnected (lifecycle hook)

**Purpose:** Mark user as offline, handle disconnect policies for active lobbies

**Permission:** System (lifecycle hook, not user-callable)

**Flow:**
1. Look up `ctx.sender` in UserIdentity table
2. If found → set `User.isOnline = false`
3. Check for active lobby membership → trigger disconnect handling (see [docs/lobby/contract.md](../lobby/contract.md))

### admin_ban_user

**Purpose:** Ban a provider ID; soft-delete affected users; prevent future linking

**Permission:** Admin only

**Parameters:** `banTypeTag` ('DiscordId'), `providerId`, `reason`

**Flow:**
1. Verify caller is Admin
2. Check for duplicate ban (single-col index + in-memory banType filter)
3. Insert BanRecord
4. Find User with matching discordId in UserPrivate
5. Soft-delete affected user (deletedAt = ctx.timestamp) — D-08 enforcement point 3

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Caller is not Admin | Unauthorized |
| Duplicate ban exists | "A ban for this provider ID already exists" |

### admin_unban_user

**Purpose:** Remove a ban by BanRecord ID (permanent ban model — D-07)

**Permission:** Admin only

**Parameters:** `banRecordId` (u32)

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| BanRecord not found | "BanRecord \<id\> not found" |
| Caller is not Admin | Unauthorized |

## Acceptance Scenarios

### Guest Login (First Time)
**Given:** No UserIdentity exists for the caller's SpacetimeDB identity
**When:** `login_as_guest` is called
**Then:** User row inserted with `isGuest=true`, `role=User`, `username=Guest_{hex8}`, `avatarCharacterName='march7th'`, `hasDiscordLinked=false`. UserIdentity row inserted linking identity to user.

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

### Provider Linking (Discord) — Phase 12
**Given:** Guest user exists, UserIdentity maps identity to User
**When:** `server_link_provider` called by server identity with provider='discord', valid providerId
**Then:** User row updated: `isGuest=false`, `hasDiscordLinked=true`, `username=providerName`. UserPrivate row inserted with `discordId`, `discordUsername`.

### Ban Enforcement at Link-Time — Phase 12
**Given:** A BanRecord exists for a Discord ID
**When:** `server_link_provider` called with the banned Discord ID
**Then:** Reducer throws with "Discord ID \<id\> is banned". No UserPrivate written. User unchanged.

### Ban Enforcement at Reconnect — Phase 12
**Given:** A BanRecord exists for a Discord ID; user with that discordId in UserPrivate reconnects
**When:** Client WebSocket connects (`clientConnected`)
**Then:** User soft-deleted immediately (deletedAt set). User cannot interact with the system.

### Ban Enforcement at Ban-Time — Phase 12
**Given:** A verified user has UserPrivate with discordId='abc123'
**When:** `admin_ban_user` called with providerId='abc123'
**Then:** BanRecord inserted. User soft-deleted (deletedAt set).

### UserIdentity Privacy — Phase 12
**Given:** Client subscribes to all tables
**When:** Client iterates UserIdentity from subscription cache
**Then:** Empty — UserIdentity is private (public:false). Client must use `view_my_identity` SQL subscription to see own mapping.

### Direct Discord Login (no guest first) — Phase 12 execution
**Given:** Fresh browser, no SpacetimeDB user exists for this identity
**When:** User clicks "Login with Discord", completes OAuth
**Then:** Step A auto-creates guest via `loginAsGuest`. Step B calls `/api/auth/link-discord` → `server_link_provider` upgrades guest to verified user. NavBar shows Discord username.

### Logout and Re-Login via Discord (identity merge) — Phase 12 execution
**Given:** User "nathyron" (id=2) exists with Discord linked. User logs out (clears localStorage). New SpacetimeDB identity is generated.
**When:** User clicks "Login with Discord", completes OAuth
**Then:** Step A creates a temporary guest (id=3). Strategy 3 finds "nathyron" by session username. Step B calls link API. `server_link_provider` Case 1b: re-points new identity to user id=2, deletes orphaned guest id=3. NavBar shows "nathyron". Both old and new identities map to user id=2 in UserIdentity.

### Cross-Browser Discord Login (identity merge) — Phase 12 execution
**Given:** User "nathyron" exists on browser A. User opens browser B (new SpacetimeDB identity).
**When:** User clicks "Login with Discord" on browser B
**Then:** Same merge flow as logout/re-login. New identity mapped to existing user. Orphaned guest deleted.

### Stale NextAuth Session Does Not Auto-Link — Phase 12 execution
**Given:** User has a stale NextAuth session cookie (from previous Discord login). User clicks "Login as Guest".
**When:** Guest is created, `nextAuthStatus` is "authenticated"
**Then:** Discord linking does NOT auto-trigger. `hasDiscordIntent` is false (no explicit "Login with Discord" click). User stays as guest.

## Edge Cases

| Case | Expected Behavior | Notes |
|------|-------------------|-------|
| Identity hex collision in guest username | Extremely unlikely (8 hex chars = 4 billion combinations) | If it happened, autoInc id makes User rows unique regardless |
| Rapid connect/disconnect | Each lifecycle hook is its own transaction — no race condition | SpacetimeDB serializes reducer calls |
| Guest calls privileged reducer | `ensureVerifiedUser` rejects with error | Per-reducer guard, not auth-level |
| Banned user tries to link again | `rejectIfBanned` blocks at link-time | BanRecord + hasDiscordLinked=false prevents re-entry |
| Stale cached userId after DB clear | Strategy 1 miss → clears cache → falls through to Strategy 2/3 | Self-healing: no manual localStorage clear needed |
| Multiple identities for same user | All map to same User.id in UserIdentity | Accumulate over logouts/new browsers; cleanup planned in Phase 12.1 |
| `getServerSession` returns null in POST handler | Direct cookie read + JWT decode bypasses next-auth pipeline | Known next-auth 4.x bug in App Router POST routes |
| Client/server database name mismatch | Server imports from shared `lib/spacetimedb.ts` | Single source of truth prevents silent WebSocket failures |
| DiscordLink component bypasses intent flag | Uses `loginDiscord()` from auth context (not direct `signIn`) | Ensures `hasDiscordIntent` is set for Step B |

## Integration Points

| This Feature | Connects To | How | Direction |
|-------------|------------|-----|-----------|
| `User.id` | All features | FK from virtually every table | reads |
| `UserIdentity.identity` | `getAuthenticatedUser` helper | ctx.sender → User resolution | reads |
| `UserPrivate.discordId` | `checkProviderBan` helper | Ban enforcement at link/reconnect | reads |
| `clientDisconnected` | Lobby disconnect handling | Triggers disconnect policy | writes |
| `User.isOnline` | Lobby browser, cursor tracking | Online presence indicator | reads |
| `User.hasDiscordLinked` | Frontend components | Link status display (replaces discordId) | reads |

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| Guest login creates User + UserIdentity | Phase 1 execution | 2026-03-16 |
| Soft-delete pattern (deletedAt check in getAuthenticatedUser) | Phase 2 discussion | 2026-03-16 |
| clientDisconnected disconnect handling | Phase 10 execution | 2026-04-03 |
| Auth/Admin doc separation | Pre-Phase 11 cleanup | 2026-04-06 |
| UserPrivate private table stores discordId/email (replaces public User.discordId) | Phase 12 discussion | 2026-04-08 |
| BanRecord private table for ban infrastructure | Phase 12 discussion | 2026-04-08 |
| UserIdentity made private (public:false); clients use view_my_identity | Phase 12 discussion | 2026-04-08 |
| server_link_provider replaces server_link_discord (unified provider linking) | Phase 12 discussion | 2026-04-08 |
| hasDiscordLinked bool replaces discordId on public User table (D-02) | Phase 12 execution | 2026-04-08 |
| Ephemeral connection for identity verification in API route (D-09, SEC-04) | Phase 12 execution | 2026-04-08 |
| view_my_profile merges User + UserPrivate for caller's own data | Phase 12 execution | 2026-04-08 |
| view_admin_user_private for Moderator+ access to UserPrivate data | Phase 12 execution | 2026-04-08 |
| view_user_directory projects to UserDirectoryRow safe subset (D-16) | Phase 12 execution | 2026-04-08 |
| D-08 three-point ban enforcement: link-time + reconnect + ban-time | Phase 12 execution | 2026-04-08 |
| ViewMyProfile not generated by spacetime generate (views not in codegen) — useAuth.ts uses User table fallback (Strategy B) | Phase 12 execution | 2026-04-08 |
| getServerSession replaced with direct cookie read + JWT decode (next-auth 4.x App Router POST bug) | Phase 12 execution | 2026-04-08 |
| spacetimedb-server.ts imports HOST/DB_NAME from shared lib/spacetimedb.ts (prevents database name mismatch) | Phase 12 execution | 2026-04-08 |
| Reactive User table callbacks (onInsert/onUpdate) replace setTimeout-based profile re-reads | Phase 12 execution | 2026-04-08 |
| Strategy 3 (NextAuth session username lookup) handles post-merge identity recovery | Phase 12 execution | 2026-04-08 |
| hasDiscordIntent gates Discord linking — stale NextAuth sessions don't auto-link | Phase 12 execution | 2026-04-08 |
| DiscordLink.tsx uses loginDiscord() instead of direct signIn("discord") | Phase 12 execution | 2026-04-08 |
| server_link_provider Case 1b: identity merge (re-point identity, delete orphaned guest) verified across all 4 auth paths | Phase 12 execution | 2026-04-08 |
| Phase 12.1 planned: Identity garbage collection — cleanup stale UserIdentity rows after 30 days inactivity | Phase 12 execution | 2026-04-08 |
