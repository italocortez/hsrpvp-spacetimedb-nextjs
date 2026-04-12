# Phase 12: Auth Security Hardening - Research

**Researched:** 2026-04-07
**Domain:** SpacetimeDB private tables, ban infrastructure, identity verification, auth data isolation
**Confidence:** HIGH

## Summary

Phase 12 hardens the authentication system across four axes: (1) isolating sensitive user data (discordId, email) into a private `UserPrivate` table, (2) adding permanent ban infrastructure via a `BanRecord` table, (3) closing the identity resolution gap in the Discord link API route by using ephemeral SpacetimeDB connections for server-side identity verification, and (4) making `UserIdentity` private with client migration to view subscriptions.

The codebase already has established patterns for every building block needed: private tables (`public: false`) are used for PlayerStat, PlayerCharacterStat, PlayerRelationship, ServerIdentity, and CostSetDraft tables. Security views (`view_my_*`) provide per-user data access with the `ctx.db.UserIdentity.identity.find(ctx.sender)` resolution pattern. The audit column pattern, cascade deletion helper, and role-gated access are all well-established.

**Primary recommendation:** Follow the existing private table + view pattern exactly. The schema changes are straightforward but the impact surface is significant -- `discordId` removal from User touches 5 backend files, 4 frontend files, and 1 test file. The `getSystemUserId` helper that resolves SYSTEM user via `discord_id.filter('1')` must be replaced with a direct `SYSTEM_USER_ID` constant reference since `discordId` will no longer exist on User.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Create a flat `UserPrivate` table (private, `public: false`) with PK `userId` (FK to User). Columns: `discordId?`, `discordUsername?`, `email?` (schema-only, not populated), plus audit columns. No `emailVerified`. Google auth removed from scope.
- **D-02:** Remove `discordId` from the public `User` table. Add `hasDiscordLinked: bool` to `User` for public display (provider badge). Updated whenever UserPrivate changes. Google auth removed from scope.
- **D-03:** On user deletion (soft-delete): hard-delete UserPrivate row. If the user was banned, the BanRecord itself retains the discordId (self-contained ban records outlive user rows).
- **D-04:** Merged view: `view_my_profile` returns User + UserPrivate joined data so the caller sees their own discordId/email in a single subscription.
- **D-05:** Admin/Moderator view: `view_admin_user_private` returns all UserPrivate rows when caller has role >= Moderator (level 75).
- **D-06:** `BanRecord` private table. Ban type: Discord ID ban only. Columns: `id` (PK, autoInc), `banType` (enum: DiscordId), `providerId` (the banned Discord ID string), `reason` (string), `bannedByUserId` (u32), plus audit columns.
- **D-07:** Permanent bans only -- no expiry mechanism.
- **D-08:** Enforcement at three points: (1) link-time, (2) login/reconnect, (3) active session via soft-delete triggering auto-logout.
- **D-09:** Ephemeral connection approach: client sends SpacetimeDB auth token to API route, API creates short-lived DbConnection to extract verified identity from `onConnect`.
- **D-10:** Server identity connection (existing singleton) still used for the actual reducer call.
- **D-11:** Unified `server_link_provider` reducer replaces `server_link_discord`. Signature: `(callerIdentityHex, provider, providerId, providerName)`. Provider is a string enum (`discord` only).
- **D-12:** Two distinct linking paths: (1) initial verification -- guest becomes verified, (2) add second provider from profile.
- **D-13:** No auto-merge between providers.
- **D-14:** Make `UserIdentity` table `public: false`. Client-side `useAuth.ts` switches to `view_my_identity` view.
- **D-15:** Research phase must verify: do views and reducers retain read access to private tables? **VERIFIED: YES** (see Architecture Patterns section).
- **D-16:** `view_user_directory` returns safe subset without auth IDs.
- **D-17:** Integration tests via existing test harness pattern.
- **D-18:** Planning phase must include a full impact audit as a dedicated plan step.
- **CR-01 (CRITICAL):** UserPrivate and BanRecord tables MUST use explicit `public: false` in their table options.
- **WR-01:** `checkProviderBan` helper MUST accept a `banType` parameter and filter by `banType.tag`.
- **WR-02:** Ephemeral connection's `onDisconnect` handler should call `reject()` to fail fast.

### Claude's Discretion
- Internal helper structure for ban checking (inline vs separate helper function)
- UserPrivate index strategy (beyond userId PK)
- Exact error messages for ban rejection
- Ephemeral connection timeout and cleanup logic

### Deferred Ideas (OUT OF SCOPE)
- Google OAuth provider -- no schema columns for Google auth
- BetterAuth migration
- Email population from Discord scope
- Ban expiry (temporary bans)
- IP-based bans
- Google Calendar integration
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SEC-01 | UserPrivate private table isolates sensitive auth data (discordId, email) from public User table | Private table pattern verified with `public: false` across 5 existing tables; view pattern for data access verified in securityViews.ts |
| SEC-02 | UserIdentity table made private, client migrates to view_my_identity | View_my_identity already exists in securityViews.ts (line 139-145); private table + view pattern well-established; client subscription migration approach documented |
| SEC-03 | BanRecord private table with permanent Discord ID bans | Ban enforcement pattern researched at three points; LobbyBan table provides reference pattern; enum-based banType filtering approach documented |
| SEC-04 | Identity resolution fix -- server-side verification via ephemeral SpacetimeDB connection | Ephemeral connection pattern documented using DbConnection.builder() with token auth and onConnect identity extraction |
| SEC-05 | Google OAuth (DESCOPED per CONTEXT.md) | Out of scope -- no implementation needed |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spacetimedb (server) | 2.1.0 | Backend module tables/reducers/views | Already in use, generated bindings at this version [VERIFIED: module_bindings/index.ts] |
| spacetimedb (client) | 2.1.0 | React hooks, subscriptions | Already in use [VERIFIED: app/providers.tsx] |
| next-auth | existing | Discord OAuth session | Already in use for Discord auth [VERIFIED: app/api/auth/authOptions.ts] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | existing | Integration tests | Test harness pattern already established [VERIFIED: test/vitest.integration.config.ts] |

No new dependencies are needed for this phase.

## Architecture Patterns

### D-15 VERIFIED: Private Tables + Views/Reducers Access

**Finding:** Views and reducers retain full read/write access to private (`public: false`) tables. `public: false` only affects client-side subscriptions -- server-side code (reducers, views, lifecycle hooks) can read/write private tables without restriction. [VERIFIED: codebase evidence]

Evidence from this codebase:
1. `PlayerStat` table is `public: false` (characterStats.ts:27), yet `view_my_player_stats` reads it via `ctx.db.PlayerStat.by_user.filter(mapping.userId)` (securityViews.ts:272) [VERIFIED: codebase]
2. `PlayerCharacterStat` is `public: false` (characterStats.ts:27), accessed by `view_my_character_stats` (securityViews.ts:283) [VERIFIED: codebase]
3. `ServerIdentity` is `public: false` (serverIdentity.ts:17), read by `requireServer()` in reducers (server.ts:10-15) [VERIFIED: codebase]
4. SpacetimeDB skill confirms: "Reducers can still read/write private tables -- only client subscriptions are blocked." [VERIFIED: SKILL.md line 524]

**Conclusion:** Making UserIdentity `public: false` will NOT break `getAuthenticatedUser()`, `ensureAdmin()`, or any view that resolves `ctx.sender` via UserIdentity. All 32+ files using `getAuthenticatedUser` will continue to work unchanged.

### D-14 Client Migration: UserIdentity to view_my_identity

**Critical finding:** Views in SpacetimeDB v2.1.0 require **explicit SQL subscription** on the client. They are NOT automatically subscribed via `subscribeToAllTables()` or `useTable(tables.ViewName)`. [VERIFIED: api-guide.md lines 704-710]

The generated module_bindings (v2.1.0) contain NO view-related types or subscriptions. Views must be subscribed to via raw SQL:
```typescript
conn.subscriptionBuilder().subscribe('SELECT * FROM view_my_identity');
```

**Impact on useAuth.ts migration:**
- Current: `useTable(tables.UserIdentity)` -- subscribes to the public UserIdentity table
- After UserIdentity becomes private: `useTable(tables.UserIdentity)` will return empty results (private tables excluded from subscriptions)
- Required: Subscribe to `view_my_identity` via SQL, then either:
  (a) Continue using `useTable(tables.UserIdentity)` if the view populates the same client-side cache (view results may map back to the table type), OR
  (b) Use raw subscription with `onApplied` callback to read view data

**Recommendation:** The `view_my_identity` view already exists (securityViews.ts:139-145) and returns `t.option(UserIdentity.rowType)`. Since it returns the same row type as UserIdentity, subscribing to the view via SQL should populate the UserIdentity cache in the client. The useAuth.ts code that does `allIdentities.find(m => m.identity.toHexString() === identity.toHexString())` should work IF the view subscription populates the same data store. This needs verification during implementation but is the expected behavior based on SpacetimeDB's view architecture. [ASSUMED]

**Alternative approach (safer):** Instead of relying on view-to-table cache mapping, the `useAuth.ts` can use `useSpacetimeDB()` to get the identity directly from the connection state, then subscribe only to `view_my_profile` (which already joins User + UserIdentity data). This eliminates the UserIdentity subscription entirely. [ASSUMED]

### Existing Private Table Pattern

```typescript
// From characterStats.ts — the canonical pattern in this codebase
export const PlayerCharacterStat = table({
    name: 'player_character_stat',
    public: false,  // MUST be explicit (CR-01)
    primaryKey: ['userId', 'characterName', 'gameMode', 'draftMode', 'seasonId', 'matchType', 'teamSize'],
    indexes: [
        { accessor: 'by_user', algorithm: 'btree', columns: ['userId'] },
    ],
}, playerCharacterStatColumns);
```
[VERIFIED: spacetimedb/src/tables/characterStats.ts]

### Existing Security View Pattern

```typescript
// From securityViews.ts — view_my_identity (already exists!)
spacetimedb.view(
    { name: 'view_my_identity', public: true },
    t.option(UserIdentity.rowType),
    (ctx) => {
        return ctx.db.UserIdentity.identity.find(ctx.sender) ?? undefined;
    }
);
```
[VERIFIED: spacetimedb/src/views/securityViews.ts:139-145]

### Existing view_my_profile Pattern (to be extended for D-04)

```typescript
// Current: returns only User row
spacetimedb.view(
    { name: 'view_my_profile', public: true },
    t.option(User.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return undefined;
        return ctx.db.User.id.find(mapping.userId) ?? undefined;
    }
);
```
[VERIFIED: spacetimedb/src/views/securityViews.ts:164-172]

This view must be extended to return a merged row type including UserPrivate fields (discordId, discordUsername, email).

### Ephemeral Connection Pattern (D-09)

The existing server connection singleton (`lib/spacetimedb-server.ts`) demonstrates the DbConnection.builder() pattern. The ephemeral connection for identity verification follows the same structure but with the client's token instead of the server token:

```typescript
// Conceptual pattern for ephemeral identity verification
const identity = await new Promise<string>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Ephemeral connection timeout')), 5000);
    DbConnection.builder()
        .withUri(HOST)
        .withDatabaseName(DB_NAME)
        .withToken(clientSpacetimeToken)  // Client's auth token
        .onConnect((_conn, identity) => {
            clearTimeout(timeout);
            _conn.disconnect();
            resolve(identity.toHexString());
        })
        .onConnectError((_ctx, err) => {
            clearTimeout(timeout);
            reject(err);
        })
        .onDisconnect(() => {
            reject(new Error('Disconnected before identity resolved'));  // WR-02
        })
        .build();
});
```
[VERIFIED: lib/spacetimedb-server.ts for base pattern; adapted per D-09/WR-02]

### Ban Enforcement Pattern

The `LobbyBan` table (lobbyBan.ts) is the existing reference for ban patterns but it's lobby-scoped and public. The new `BanRecord` is global-scoped and private. Key differences:

| Aspect | LobbyBan | BanRecord |
|--------|----------|-----------|
| Scope | Per-lobby | Global |
| PK | Composite (lobbyId, bannedUserId) | autoInc id |
| Public | Yes | **No** (private) |
| Key field | bannedUserId (u32) | providerId (string) + banType (enum) |
| Removal | Cascade with lobby close | Admin manual deletion |

[VERIFIED: spacetimedb/src/tables/lobbyBan.ts]

### getSystemUserId Migration

**Critical impact:** The `getSystemUserId()` helper in `server.ts` (line 20-22) uses `ctx.db.User.discord_id.filter('1')` to find the SYSTEM user. When `discordId` is removed from User, this function breaks. [VERIFIED: server.ts:20-22]

**Fix:** Replace with `SYSTEM_USER_ID` constant (already defined as `0` in auditColumns.ts). The `register_server` reducer creates the SYSTEM user with `id: 0` (autoInc returns the first ID). The filter-based lookup was a defensive fallback but is unnecessary since `SYSTEM_USER_ID` is already used throughout the codebase. [VERIFIED: auditColumns.ts:2, server.ts:47]

Additionally, `register_server` itself sets `discordId: '1'` on the SYSTEM user (server.ts:58). This must change -- either set `discordId: undefined` on User (since the field is being removed), or better: don't set it at all on User, and instead create a UserPrivate row for the SYSTEM user if needed (though SYSTEM likely doesn't need one).

### view_user_directory Update (D-16)

The current `view_user_directory` (securityViews.ts:154-158) returns `User.rowType` which includes `discordId`. After `discordId` is removed from User and replaced with `hasDiscordLinked`, the view automatically reflects this since it returns `User.rowType`. The only change needed is ensuring the User table schema change propagates correctly. [VERIFIED: securityViews.ts:154-158]

### Impact Audit Summary (D-18)

Files referencing `discordId` that must be updated:

**Backend (spacetimedb/src/):**
1. `tables/user.ts` -- Remove `discordId` column, remove `discord_id` index, add `hasDiscordLinked: t.bool()`
2. `reducers/server.ts` -- `getSystemUserId()` fix, `register_server` SYSTEM user creation, entire `server_link_discord` replaced by `server_link_provider`
3. `reducers/auth.ts` -- `login_as_guest` sets `discordId: undefined` (remove this field)
4. `helpers/userDeletionHelper.ts` -- `discordId: undefined` on soft-delete (replace with `hasDiscordLinked: false` + hard-delete UserPrivate)
5. `views/securityViews.ts` -- `view_my_profile` merge with UserPrivate, `view_user_directory` auto-updated by schema change

**Frontend (components/):**
1. `components/features/auth/types.ts` -- `User` interface has `discordId?: string`
2. `components/features/auth/hooks/useAuth.ts` -- `currentUser.discordId !== discordUser.id` check (line 97), UserIdentity subscription migration
3. `components/features/profile/components/DiscordLink.tsx` -- Uses `discordId` for display
4. `components/features/admin-view/components/UserManager.tsx` -- May display `discordId`

**API routes:**
1. `app/api/auth/link-discord/route.ts` -- `callerIdentityHex` body parsing changes to `spacetimeToken`, calls `server_link_provider` instead of `server_link_discord`

**Tests:**
1. `test/shared/connection.ts` -- `verifyUserViaServerConnection` calls `serverLinkDiscord` (must update to `serverLinkProvider`)

**Client types (auto-generated):**
1. `src/module_bindings/` -- Regenerated after publish, auto-updated

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Permission checks | Custom role checking | `ensureAdmin()`, `getAuthenticatedUser()`, `isRoleAtLeast()` from ensurePermissions.ts | Already handles all role levels, soft-delete checks |
| Audit columns | Manual timestamps | `auditInsert()`, `auditUpdate()` from auditColumns.ts | Consistent pattern across 60+ tables |
| User cascade deletion | Custom cleanup | `performUserDeletion()` from userDeletionHelper.ts | Already handles UserIdentity, HsrAccount, Calendar cascade -- extend, don't replace |
| Identity resolution in views | Custom sender lookup | `ctx.db.UserIdentity.identity.find(ctx.sender)` pattern | Standard across all 20+ security views |

## Common Pitfalls

### Pitfall 1: Forgetting `public: false` on sensitive tables
**What goes wrong:** UserPrivate or BanRecord data is broadcast to all connected clients.
**Why it happens:** SpacetimeDB defaults to `public: true` when the key is omitted. The CostSetDraft tables in this codebase actually omit the `public` key entirely (they appear in the schema without `public: false`), yet the CONTEXT.md treats them as private.
**How to avoid:** Always set `public: false` explicitly. CR-01 makes this mandatory.
**Warning signs:** After publish, run `spacetime sql "SELECT * FROM user_private"` from a non-server client -- if it returns results, the table is public.

### Pitfall 2: getSystemUserId breaks after discordId removal
**What goes wrong:** `getSystemUserId()` returns `SYSTEM_USER_ID` (0) fallback, which happens to be correct, but the `discord_id.filter('1')` call errors because the index no longer exists.
**Why it happens:** The `discord_id` index is removed along with the `discordId` column.
**How to avoid:** Replace `getSystemUserId()` with direct `SYSTEM_USER_ID` usage. The fallback already returns 0.
**Warning signs:** Runtime error on any reducer that calls `getSystemUserId()` after schema migration.

### Pitfall 3: Test harness breaks with private UserIdentity
**What goes wrong:** `createHarnessInternal()` calls `subscribeToAllTables()` then reads `connInner.db.UserIdentity.iter()` to find the test user's userId. After UserIdentity becomes private, the subscription excludes it and `iter()` returns empty.
**Why it happens:** `subscribeToAllTables()` only subscribes to public tables.
**How to avoid:** The test harness must either: (a) use `--include-private` during `spacetime generate` for test builds, or (b) subscribe to `view_my_identity` explicitly and read the userId from the view, or (c) use a different method to resolve the userId (e.g., wait for the User table row to appear after `loginAsGuest`).
**Warning signs:** All integration tests fail with `userId: 0` after publish.

### Pitfall 4: Ban check without banType filtering
**What goes wrong:** A ban on Discord ID "12345" incorrectly blocks a future provider (e.g., Google) with the same ID string.
**Why it happens:** Filtering BanRecord by `providerId` alone without checking `banType.tag`.
**How to avoid:** WR-01 mandates `checkProviderBan` accept and filter by `banType` parameter.
**Warning signs:** False positive ban matches in test scenarios with overlapping provider IDs.

### Pitfall 5: Ephemeral connection timeout as silent failure
**What goes wrong:** The ephemeral connection drops without the API route detecting it, causing the request to hang for 5+ seconds.
**Why it happens:** `onDisconnect` is a no-op, so the Promise never rejects.
**How to avoid:** WR-02 mandates `onDisconnect` calls `reject()` to fail fast.
**Warning signs:** API route `/api/auth/link-discord` responds slowly or times out.

### Pitfall 6: View subscription on client requires explicit SQL
**What goes wrong:** After making UserIdentity private, `useTable(tables.UserIdentity)` returns empty, and the developer assumes view_my_identity will auto-subscribe.
**Why it happens:** Views require explicit SQL subscription (`SELECT * FROM view_my_identity`), not `useTable` with a table reference.
**How to avoid:** Add explicit view subscription in the `onConnect` callback or in a useEffect hook.
**Warning signs:** `useAuth.ts` shows `isAuthenticated: false` for all users after publish.

## Code Examples

### UserPrivate Table Definition
```typescript
// spacetimedb/src/tables/userPrivate.ts
import { table, t } from 'spacetimedb/server';

export const userPrivateColumns = {
    userId: t.u32().primaryKey(),  // FK to User.id (1:1)
    discordId: t.string().optional(),
    discordUsername: t.string().optional(),
    email: t.string().optional(),  // schema-only, not populated (D-01)
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const UserPrivate = table({
    name: 'user_private',
    public: false,  // CR-01: MUST be explicit
    indexes: [
        { accessor: 'discord_id', algorithm: 'btree', columns: ['discordId'] },
    ],
}, userPrivateColumns);
```
[Based on: existing table patterns in this codebase]

### BanRecord Table Definition
```typescript
// spacetimedb/src/tables/banRecord.ts
import { table, t } from 'spacetimedb/server';
import { BanType } from '../types/enums';

export const banRecordColumns = {
    id: t.u32().primaryKey().autoInc(),
    banType: BanType,                    // enum: DiscordId
    providerId: t.string(),             // the banned Discord ID string
    reason: t.string(),
    bannedByUserId: t.u32(),            // FK to User.id (the admin who banned)
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const BanRecord = table({
    name: 'ban_record',
    public: false,  // CR-01: MUST be explicit
    indexes: [
        { accessor: 'provider_id', algorithm: 'btree', columns: ['providerId'] },
        { accessor: 'by_type_and_provider', algorithm: 'btree', columns: ['banType', 'providerId'] },
    ],
}, banRecordColumns);
```
[Based on: lobbyBan.ts pattern + D-06 requirements]

### BanType Enum
```typescript
// In spacetimedb/src/types/enums.ts
export const BanType = t.enum('BanType', [
    { name: 'DiscordId' },
]);
```
[Based on: existing enum patterns e.g., GameMode, DraftMode]

### Ban Check Helper (WR-01 compliant)
```typescript
// spacetimedb/src/helpers/banHelper.ts
export function checkProviderBan(ctx: any, banType: any, providerId: string): boolean {
    // Use the by_type_and_provider composite index for efficient lookup
    const matches = [...ctx.db.BanRecord.by_type_and_provider.filter([banType, providerId])];
    return matches.length > 0;
}
```
[Based on: WR-01 constraint + existing index filter patterns]

### Updated view_my_profile (D-04)
```typescript
// Merged view returning User + UserPrivate fields
const MyProfileRow = t.object('MyProfileRow', {
    // User fields
    id: t.u32(),
    username: t.string(),
    displayName: t.string(),
    isGuest: t.bool(),
    isOnline: t.bool(),
    lastLoginAt: t.timestamp(),
    role: Role,
    hasDiscordLinked: t.bool(),
    avatarCharacterName: t.string(),
    displayedAchievementId: t.u32().optional(),
    deletedAt: t.timestamp().optional(),
    // UserPrivate fields (only visible to the user themselves)
    discordId: t.string().optional(),
    discordUsername: t.string().optional(),
    email: t.string().optional(),
    // Audit from User
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
});
```
[Based on: D-04 requirement + existing view patterns]

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `public: true` with discordId on User | `public: false` UserPrivate + views | Phase 12 | discordId no longer broadcast to all clients |
| Client-supplied identityHex in API route | Server-verified identity via ephemeral connection | Phase 12 | Closes identity spoofing attack vector |
| `server_link_discord` reducer | `server_link_provider` (unified, extensible) | Phase 12 | Single reducer for all future OAuth providers |
| UserIdentity public table | UserIdentity private + view_my_identity | Phase 12 | Identity-to-user mappings no longer broadcast |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | View subscription via SQL populates the same client-side cache as the underlying table type | Architecture Patterns (D-14 migration) | useAuth.ts identity resolution breaks; would need a different approach to read view data on client |
| A2 | Ephemeral DbConnection with a client token will resolve to that client's identity in onConnect | Architecture Patterns (D-09) | Identity verification approach fails; would need HTTP API alternative |
| A3 | `register_server` can set `discordId: undefined` on SYSTEM user without breaking anything | Pitfall 2 | SYSTEM user creation fails on publish |

## Open Questions

1. **View subscription client-side caching (A1)**
   - What we know: Views return typed rows (e.g., `UserIdentity.rowType`), and the api-guide says they require explicit SQL subscription
   - What's unclear: Whether subscribing to `SELECT * FROM view_my_identity` populates `conn.db.UserIdentity` on the client, or whether it goes into a separate view-specific store
   - Recommendation: Test during implementation -- subscribe to the view, then check if `useTable(tables.UserIdentity)` returns the view's results. If not, use `ctx.sender` identity from `useSpacetimeDB()` hook directly and skip the UserIdentity lookup on the client entirely (useAuth.ts can resolve userId from view_my_profile instead)

2. **Ephemeral connection identity verification (A2)**
   - What we know: The server connection singleton uses `withToken(SERVER_TOKEN)` and resolves the server's identity in onConnect
   - What's unclear: Whether a client's token (from localStorage) can be used the same way from a Next.js API route server-side
   - Recommendation: The token is a SpacetimeDB auth token (not a JWT from NextAuth). The API route currently receives `callerIdentityHex` in the body. The new approach would receive the SpacetimeDB token and use it to create an ephemeral connection. If tokens work for this purpose, identity verification is complete. If not, fall back to using the HTTP API to verify the token-to-identity mapping.

3. **CostSetDraft tables actually private?**
   - What we know: CONTEXT.md states "Private tables use `public: false` -- already established for CostSetDraft* tables (Phase 3)". But `costSetDraftCharacter.ts` does NOT have `public: false` in its table options.
   - What's unclear: Whether SpacetimeDB defaults `public` to `false` when omitted, or if CostSetDraft tables are actually public
   - Recommendation: This doesn't affect Phase 12 -- CR-01 mandates explicit `public: false` regardless. But the CostSetDraft tables may need a follow-up fix if they're supposed to be private.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| SpacetimeDB CLI | Publish + generate | Assumed | 2.1.0 | -- |
| Node.js | Build, test, scripts | Assumed | -- | -- |
| maincloud | Module hosting | Assumed | -- | -- |
| SPACETIMEDB_SERVER_TOKEN | Server connection, test harness | Required in .env.local | -- | Tests skip if missing |

No new external dependencies needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (integration) |
| Config file | `test/vitest.integration.config.ts` |
| Quick run command | `npx vitest run --config test/vitest.integration.config.ts --reporter verbose` |
| Full suite command | `npx vitest run --config test/vitest.integration.config.ts` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SEC-01 | Link Discord creates UserPrivate + sets hasDiscordLinked | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "link discord creates UserPrivate"` | Wave 0 |
| SEC-01 | UserPrivate not visible in public subscriptions | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "UserPrivate is private"` | Wave 0 |
| SEC-02 | view_my_identity returns only caller's own mapping | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "view_my_identity"` | Wave 0 |
| SEC-03 | Ban discordId then attempt re-link is rejected | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "banned provider rejected"` | Wave 0 |
| SEC-03 | Banned user is soft-deleted triggering logout path | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "ban triggers soft delete"` | Wave 0 |
| SEC-04 | Ephemeral connection resolves correct identity | integration/manual | Manual verification via API route test | Manual |

### Sampling Rate
- **Per task commit:** `npx vitest run --config test/vitest.integration.config.ts --reporter verbose test/backend/auth/`
- **Per wave merge:** `npx vitest run --config test/vitest.integration.config.ts`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `test/backend/auth/auth-security.test.ts` -- covers SEC-01 through SEC-04
- [ ] Test harness update in `test/shared/connection.ts` -- `verifyUserViaServerConnection` must call `serverLinkProvider` instead of `serverLinkDiscord`, and handle private UserIdentity

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | SpacetimeDB identity + NextAuth Discord OAuth |
| V3 Session Management | yes | SpacetimeDB token-based sessions |
| V4 Access Control | yes | `ensureAdmin()`, `isRoleAtLeast()`, `requireServer()` |
| V5 Input Validation | yes | SenderError for invalid inputs in reducers |
| V6 Cryptography | no | No custom crypto -- SpacetimeDB handles identity/token crypto |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Identity spoofing via client-supplied hex | Spoofing | Ephemeral connection verifies identity server-side (D-09) |
| Sensitive data exposure (discordId in public table) | Information Disclosure | UserPrivate table with `public: false` (D-01, CR-01) |
| Ban evasion via provider ID collision | Elevation of Privilege | banType-scoped filtering (WR-01) |
| Unauthorized ban creation | Elevation of Privilege | `ensureAdmin()` guard on ban reducers |
| Stale session after ban | Tampering | Active session enforcement via soft-delete + auto-logout (D-08) |

## Sources

### Primary (HIGH confidence)
- Codebase files: user.ts, userIdentity.ts, server.ts, auth.ts, securityViews.ts, anonymousViews.ts, ensurePermissions.ts, userDeletionHelper.ts, auditColumns.ts, lobbyBan.ts, connection.ts, providers.tsx, useAuth.ts, types.ts
- SpacetimeDB Skill: SKILL.md lines 507-529 (private tables), lines 524 (reducers/views access)
- SpacetimeDB API Guide: api-guide.md lines 620-668 (private table + view pattern), lines 690-710 (view subscription)
- CONTEXT.md: All 18 decisions + 3 prior execution constraints

### Secondary (MEDIUM confidence)
- [SpacetimeDB Views documentation](https://spacetimedb.com/docs/functions/views/) -- server-side view implementation
- [SpacetimeDB Generating Client Bindings](https://spacetimedb.com/docs/sdks/codegen/) -- confirms views included in bindings generation

### Tertiary (LOW confidence)
- WebSearch results about view client-side subscription -- conflicting information about whether views auto-populate table caches

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already in use, no new dependencies
- Architecture: HIGH -- all patterns verified in codebase, 5+ private tables and 20+ views as precedent
- Pitfalls: HIGH -- all 6 pitfalls identified from direct code analysis, not speculation
- Client migration (D-14): MEDIUM -- view subscription client-side caching behavior is assumption A1

**Research date:** 2026-04-07
**Valid until:** 2026-05-07 (stable patterns, SpacetimeDB v2.1.0 is the current version)
