---
phase: 12-auth-security-hardening
reviewed: 2026-04-08T00:00:00Z
depth: standard
files_reviewed: 22
files_reviewed_list:
  - app/api/auth/link-discord/route.ts
  - components/features/admin-view/components/UserManager.tsx
  - components/features/auth/hooks/useAuth.ts
  - components/features/auth/types.ts
  - components/features/profile/components/DiscordLink.tsx
  - lib/spacetimedb-server.ts
  - spacetimedb/src/helpers/banHelper.ts
  - spacetimedb/src/helpers/userDeletionHelper.ts
  - spacetimedb/src/index.ts
  - spacetimedb/src/reducers/auth.ts
  - spacetimedb/src/reducers/banAdmin.ts
  - spacetimedb/src/reducers/server.ts
  - spacetimedb/src/schema.ts
  - spacetimedb/src/tables/banRecord.ts
  - spacetimedb/src/tables/serverIdentity.ts
  - spacetimedb/src/tables/user.ts
  - spacetimedb/src/tables/userIdentity.ts
  - spacetimedb/src/tables/userPrivate.ts
  - spacetimedb/src/types/enums.ts
  - spacetimedb/src/views/securityViews.ts
  - test/backend/auth/auth-security.test.ts
  - test/shared/connection.ts
findings:
  critical: 1
  warning: 4
  info: 3
  total: 8
status: issues_found
---

# Phase 12: Code Review Report

**Reviewed:** 2026-04-08
**Depth:** standard
**Files Reviewed:** 22
**Status:** issues_found

## Summary

Phase 12 introduces the core auth security hardening layer: `UserPrivate` and `BanRecord` private tables, migration of `discordId` off the public `User` table, server-identity-gated `server_link_provider`, ephemeral connection identity verification in the API route, and event-driven view subscriptions in the frontend. The architecture is sound and the principal decisions (D-02, D-08, D-09, D-14) are correctly implemented.

One critical issue was found: a race condition in `lib/spacetimedb-server.ts` where a disconnect during server startup nulls `connectionPromise` while a concurrent caller already holds the in-flight promise, leading to a dangling connection that is never awaited or cleaned up. Four warnings cover a missing reconnect path after `onDisconnect` resets the promise, the O(n) identity scan in `server_link_provider` being unbounded with a note that may not hold at scale, missing input length bounds on user-supplied strings in `admin_ban_user`, and an unsafe SQL string interpolation in the test helper. Three informational items cover the `as any` proliferation in reducers, a dead `discordId` field surfaced to the `User` frontend type, and the reconnect-on-disconnect gap in the test harness.

---

## Critical Issues

### CR-01: Concurrent callers get different promises after `onDisconnect` resets `connectionPromise`

**File:** `lib/spacetimedb-server.ts:18-55`

**Issue:** `connectionPromise` is set to `null` inside `onDisconnect` (line 50). If a first caller is awaiting `getServerConnection()` and the connection disconnects before `onConnect` fires, `connectionPromise` is nulled. A second concurrent caller that calls `getServerConnection()` immediately after sees `null`, creates a new promise, and assigns it. The first caller still holds a reference to the original rejected/abandoned promise but the module-level variable is now pointing to the new one. More concretely: if the WebSocket drops *after* `connectionPromise` is assigned but *before* `onConnect` resolves it, the original promise never resolves or rejects (the `onConnectError` handler resets the variable but the `onDisconnect` handler fires first for a clean disconnect, leaving the promise perpetually pending). Any API route awaiting that promise will hang until the Vercel function timeout.

**Fix:** Reject the in-flight promise when `onDisconnect` fires before it has resolved, and clear the module reference so subsequent callers get a fresh attempt:

```typescript
connectionPromise = new Promise<DbConnection>((resolve, reject) => {
    let settled = false;
    const _conn = DbConnection.builder()
        .withUri(HOST)
        .withDatabaseName(DB_NAME)
        .withToken(SERVER_TOKEN)
        .onConnect((connection) => {
            settled = true;
            console.log('[SpacetimeDB Server] Connected as server identity');
            resolve(connection);
        })
        .onConnectError((_ctx, err) => {
            settled = true;
            console.error('[SpacetimeDB Server] Connection failed:', err);
            connectionPromise = null;
            reject(err);
        })
        .onDisconnect(() => {
            console.log('[SpacetimeDB Server] Disconnected');
            connectionPromise = null;
            if (!settled) {
                // Promise was never resolved — reject so awaiting callers don't hang
                settled = true;
                reject(new Error('SpacetimeDB server connection dropped before ready'));
            }
        })
        .build();
});
```

---

## Warnings

### WR-01: No reconnect after `onDisconnect` in server connection singleton

**File:** `lib/spacetimedb-server.ts:48-51`

**Issue:** When the server-side WebSocket disconnects (network blip, server restart), `connectionPromise` is set to `null`. The next API route call will attempt a reconnect, which is correct. However, there is no reconnect attempt for in-flight WebSocket operations that were dispatched on the now-dead connection *after* `onConnect` resolved but before the disconnect notification arrived. The reducer call `conn.reducers.serverLinkProvider(...)` in `route.ts:59` is fire-and-forget — if the connection is mid-drop when the call is dispatched, it silently fails with no error surfaced to the caller. The `route.ts` try/catch at line 67 only catches synchronous throw; a dropped WebSocket send typically does not throw synchronously.

**Fix:** After calling the reducer, add a brief wait and confirm no error occurred, or switch to a pattern that awaits the reducer result. At minimum, document that the fire-and-forget behavior means the `ok: true` response does not guarantee reducer commitment:

```typescript
// In route.ts — add explicit comment about fire-and-forget risk
conn.reducers.serverLinkProvider({ ... });
// NOTE: reducer calls are fire-and-forget over WebSocket.
// A connection drop between dispatch and server processing will silently lose the call.
// The client's hasDiscordLinked flag will remain false and the UI will retry on next load.
return NextResponse.json({ ok: true });
```

If silent loss is unacceptable for the link operation, the safer path is to verify `hasDiscordLinked` via a follow-up SQL query before returning `ok: true`.

---

### WR-02: O(n) full table scan in `server_link_provider` with no length guard on `callerIdentityHex`

**File:** `spacetimedb/src/reducers/server.ts:111-116`

**Issue:** The comment at line 109 states "O(n) on ~600 rows is negligible." However there is no upper bound enforced on `callerIdentityHex` itself. A malformed or excessively long hex string (e.g. 10,000 characters) passed by a rogue server connection would still trigger the full scan and string comparison on every row. While the server-only guard (`requireServer`) means only the trusted server process can call this reducer, the lack of input validation is a latent correctness issue: a hex string that is not exactly 64 characters cannot match any `identity.toHexString()` and the loop will always exhaust all rows before returning `null`.

**Fix:** Validate that `callerIdentityHex` is exactly 64 hex characters before entering the scan:

```typescript
// After the existing empty-string check at line 92
if (!/^[0-9a-f]{64}$/i.test(callerIdentityHex)) {
    throw new SenderError('callerIdentityHex must be a 64-character hex string');
}
```

---

### WR-03: `admin_ban_user` accepts unbounded `providerId` and `reason` strings

**File:** `spacetimedb/src/reducers/banAdmin.ts:23-28`

**Issue:** The reducer validates that `providerId` and `reason` are non-empty, but sets no upper length limit. A Discord snowflake ID is at most 20 digits; a `reason` field that is 100,000 characters long would be stored in a private table that is never cleaned. While the admin-only gate limits who can trigger this, the absence of length bounds is a code quality gap that could waste storage and make the ban record SQL export unreadable.

**Fix:**

```typescript
if (providerId.length > 64) {
    throw new SenderError('providerId must be 64 characters or fewer');
}
if (reason.length > 500) {
    throw new SenderError('reason must be 500 characters or fewer');
}
```

---

### WR-04: SQL string interpolation in `queryPrivateTable` is command-injectable

**File:** `test/shared/connection.ts:232`

**Issue:** The helper concatenates caller-supplied SQL directly into a shell command:

```typescript
execSync(`spacetime sql ${db} "${sql.replace(/"/g, '\\"')}"`, ...)
```

The escaping only replaces `"` with `\"`. A SQL argument containing backticks, `$()`, or single quotes can still break out of the double-quote context on some shells. In test code this is lower severity since the test runner controls the input, but the `queryPrivateTable` function is exported and its contract does not say "safe for untrusted input." If a test ever generates a username or Discord ID that contains a shell-special character and interpolates it into a SQL string passed to this helper, it could silently truncate or corrupt the query result, causing a false-passing test.

**Fix:** Sanitize beyond just `"`:

```typescript
const safeSql = sql.replace(/[\\"'`;$()]/g, (c) => `\\${c}`);
const raw = execSync(`spacetime sql ${db} "${safeSql}"`, { ... });
```

Or better, write the SQL to a temp file and use `spacetime sql --file` to avoid shell interpretation entirely.

---

## Info

### IN-01: `as any` casts throughout reducer files suppress type safety

**Files:** `spacetimedb/src/reducers/server.ts` (lines 101, 137, 169, 185, etc.), `spacetimedb/src/reducers/banAdmin.ts` (line 42), `spacetimedb/src/index.ts` (lines 71, 121, 127, etc.)

**Issue:** The `as any` pattern is pervasive — used for enum literals (`{ tag: 'DiscordId', value: {} } as any`), table row spreads, and ctx.db accesses. This is a known limitation of the SpacetimeDB TS SDK's generated types. It is not a bug introduced by this phase, but it does mean type errors in reducer arguments (e.g. passing wrong field names to `.insert()`) will not be caught at compile time.

**Fix:** No immediate action required. Document in the team conventions that the `as any` pattern is the approved workaround for the current SDK version, so future reviewers don't flag it as a code smell specific to this phase.

---

### IN-02: `discordId` and `discordUsername` on the frontend `User` type may confuse callers

**File:** `components/features/auth/types.ts:22-24`

**Issue:** The `User` interface exposes `discordId?: string` and `discordUsername?: string` as optional fields. These are only populated when reading from `view_my_profile` (Strategy A path in `useAuth.ts`). In the Strategy B fallback path (lines 113-114 of `useAuth.ts`), they are explicitly set to `undefined`. Any component that accesses `user.discordId` expecting it to be present when `user.hasDiscordLinked === true` will get `undefined` if the fallback path was taken. The `DiscordLink.tsx` component correctly uses `user.hasDiscordLinked` and never reads `discordId`, so there is no bug in the current code — but the type is silently lying to future callers.

**Fix:** Add a comment to the type definition to make the conditional availability explicit:

```typescript
// Only populated when the current user's profile is read via view_my_profile (Strategy A).
// Always undefined in Strategy B (User table fallback). Do NOT use these fields
// to determine link status — use hasDiscordLinked instead.
discordId?: string;
discordUsername?: string;
```

---

### IN-03: `serverSetRole` call in test uses `targetUserId` but `server_set_role` reducer takes `username`

**File:** `test/backend/auth/auth-security.test.ts:108-111`

**Issue:** The test at line 108 calls:

```typescript
serverConn.reducers.serverSetRole({
    targetUserId: admin.userId,
    roleTag: 'Admin',
});
```

But `server_set_role` in `reducers/server.ts:210-237` is defined with `username: t.string()` and `roleTag: t.string()` — it takes a username string, not a userId. The generated bindings will likely either silently ignore the `targetUserId` field and fail because `username` is missing, or the TypeScript compiler will catch this as a type error at build time. This test case would fail at runtime as written. Since this is test-only code and not production behavior, severity is Info rather than Warning.

**Fix:**

```typescript
serverConn.reducers.serverSetRole({
    username: admin.conn.db.User.iter()
               ? [...admin.conn.db.User.iter()].find((u: any) => u.id === admin.userId)?.username ?? ''
               : '',
    roleTag: 'Admin',
});
```

Or resolve the username before the call and store it in the harness. Alternatively, if the intent is to promote by userId, `server_set_role` would need a variant that accepts a userId — but that is a backend change, not a test fix.

---

_Reviewed: 2026-04-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
