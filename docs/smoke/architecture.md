<!-- generated-by: gsd-doc-writer -->
# Smoke Tests & Bootstrap Infrastructure

## Tables

### Private Tables

```
ServerIdentity (singleton — trusted server identity)
|  identity (PK) -> SpacetimeDB sender identity
|  registeredAt   -> Timestamp
|  (public: false — not accessible via client subscriptions)
```

Only one row should ever exist. The registered identity is the only caller allowed to invoke server-only reducers (`server_link_provider`, `server_set_role`, `server_delete_user`, `server_set_mmr`).

```
GcResult (Phase 12.1 — GC audit log)
|  id (u32 PK autoInc)
|  gcType (string)          -- 'identity' | 'lobby'
|  ranAt (timestamp)
|  itemsScanned (u32)
|  itemsDeleted (u32)
|  details (string)         -- JSON breakdown per GC type
|  + audit columns (createdById, createdDate, lastModifiedById, lastModifiedDate)
|  (public: false — dashboard-only visibility)
|  No indexes (small table — one row per GC invocation)
|  Source: spacetimedb/src/tables/gcResult.ts
```

### Scheduled Tables (Phase 12.1)

```
IdentityGcJob (scheduled — weekly identity GC)
|  scheduledId (u64 PK autoInc)
|  scheduledAt (ScheduleAt)
|  Mutable binding pattern for circular-dep avoidance (mirrors LobbyGcJob)
|  Source: spacetimedb/src/tables/identityGcJob.ts
```

## Reducers

| Reducer | File | Permission | Description |
|---------|------|-----------|-------------|
| `register_server` | `reducers/server.ts` | Any (first-come-first-served) | Inserts ServerIdentity row + creates SYSTEM user (id=0) + links identity via UserIdentity. Rejects if ServerIdentity already exists. |
| `server_set_datetime` | `reducers/server.ts` | Server-only | Sets timestamp fields on supported tables (`user_identity/lastSeenAt`, `user_identity/createdDate`, `lobby/createdDate`). Test utility for time-dependent behavior. *(Phase 12.1)* |
| `server_set_online` | `reducers/server.ts` | Server-only | Forces `User.isOnline` flag. Workaround for maincloud disconnect detection delay in tests. *(Phase 12.1)* |
| `run_identity_gc` | `reducers/identityGc.ts` | Scheduled (weekly) | Scans all UserIdentity rows, deletes stale (90-day TTL) and orphaned rows. Writes GcResult only when items deleted. Self-requeues 7 days. *(Phase 12.1)* |
| `admin_gc_identities` | `reducers/identityGc.ts` | Moderator+ | One-shot identity GC with GcResult audit (always writes). No self-requeue. *(Phase 12.1)* |
| `seed_identity_gc_job` | `reducers/identityGc.ts` | Server-only | Idempotent bootstrap for the weekly identity GC chain. Inserts first IdentityGcJob row. *(Phase 12.1)* |
| `admin_gc_lobbies` | `reducers/lobbyGc.ts` | Moderator+ | One-shot lobby GC with GcResult audit (always writes). No self-requeue. *(Phase 12.1)* |

### Lobby GC Restructuring (Phase 12.1)

`run_lobby_gc` was restructured to use a shared `performLobbyGc` helper (extracted from the scheduled reducer). Both `run_lobby_gc` and the new `admin_gc_lobbies` call this helper. Both write GcResult audit rows — scheduled writes only when items were deleted, admin always writes. `seed_lobby_gc_job` was also added (server-only, idempotent) to automate the GC chain bootstrap via post-publish.

### `requireServer(ctx)` helper

Defined in `reducers/server.ts`. Used by all server-only reducers to gate access:

```
ctx.db.ServerIdentity.identity.find(ctx.sender)
  -> found: allow
  -> not found: throw SenderError('Forbidden: caller is not the registered server identity.')
```

## Flow

### Post-Publish Bootstrap (`scripts/post-publish.ts`)

Run immediately after `spacetime publish --clear-database`:

```
npx tsx scripts/post-publish.ts
```

Steps:

1. Connects to SpacetimeDB with **no token** (gets a fresh identity)
2. Calls `register_server` -- marks that identity as trusted, creates SYSTEM user (id=0, role=Admin)
3. Writes the connection token to `.env.local` as `SPACETIMEDB_SERVER_TOKEN`
4. Calls `seedAll()` -- upserts HsrCharacter, HsrLightcone, costs, archetypes, synergies
5. Seeds starter achievements (MMR Elite, Veteran, Solar First Tournament Winner)
6. Seeds identity GC job (`seedIdentityGcJob`) -- first run in 7 days *(Phase 12.1)*
7. Seeds lobby GC job (`seedLobbyGcJob`) -- first run in 15 minutes *(Phase 12.1)*
8. Seeds config tables (EloConfig, AccountRatingConfig)

Configuration is read from `spacetime.json` (database name, server) and env vars (host override).

### Standalone Registration (`scripts/register-server.ts`)

Lightweight alternative -- registers server identity only, prints token to stdout:

```
npx tsx scripts/register-server.ts
```

Does not seed data. Token must be manually added to `.env.local`.

### Test Database Bootstrap (`test/shared/bootstrap.ts`)

Used for test databases. Connects with an **existing** `SPACETIMEDB_SERVER_TOKEN` from `.env.local` and calls `registerServer`. Intended for re-bootstrapping after `--clear-database` on the test DB.

### Test Harness Connection (`test/shared/connection.ts`)

Two harness types for integration tests:

| Harness | Function | Use Case |
|---------|----------|----------|
| Guest | `createTestHarness()` | Permission guard tests -- user remains `isGuest: true` |
| Verified | `createVerifiedTestHarness()` | Feature CRUD tests -- upgrades guest via `server_link_provider` |

Connection flow:

1. `DbConnection.builder()` connects to the test DB (defaults: `wss://maincloud.spacetimedb.com`, `hsrpvp-spacetimedb-nextjs-test1`)
2. Subscribes to all tables
3. Calls `loginAsGuest` to create a User + UserIdentity
4. (Verified only) Opens a **second** connection using `SPACETIMEDB_SERVER_TOKEN`, calls `serverLinkProvider` to upgrade the guest to a verified user with a test Discord ID (`test_<timestamp>_<random>`)
5. Resolves `userId` from the subscription cache by matching guest username pattern (`Guest_<hex8>`) or verified username pattern (`TestUser_*`)

Harness interface:

```typescript
interface TestHarness {
  conn: DbConnection;        // Active WebSocket connection
  identity: string;          // Identity hex string
  userId: number;            // Resolved User.id
  call: DbConnection['reducers'];  // Typed reducer calls (Promise-based)
  sync: (ms?) => Promise<void>;    // Wait for subscription cache sync
  disconnect: () => Promise<void>;
}
```

Utilities:

| Function | Purpose |
|----------|---------|
| `expectReducerError(promise)` | Asserts a reducer call fails, returns the error message |
| `queryPrivateTable(sql)` | Runs `spacetime sql` CLI to read private tables (UserPrivate, BanRecord, etc.) |
| `getTestDiscordId(userId)` | Queries UserPrivate via SQL for the test Discord provider ID |
| `hasServerToken()` | Checks if `SPACETIMEDB_SERVER_TOKEN` is available |
| `sleep(ms)` | Fixed-duration wait |

### Integration Test Configuration (`test/vitest.integration.config.ts`)

- Includes: `test/backend/**/*.test.ts` (excludes `*.unit.test.ts`)
- Timeout: 30s (network round-trips to maincloud)
- Sequential execution: `fileParallelism: false`, `concurrent: false` -- tests share SpacetimeDB state
- Env loading: reads `.env.local` at config time for `SPACETIMEDB_*` vars

### Environment Loading (`test/shared/load-env.ts`)

Parses `.env.local` into `process.env` for standalone scripts that run outside vitest. Not needed for vitest tests (handled by `vitest.integration.config.ts`).

## Key Patterns

- **First-come-first-served registration** -- `register_server` checks `ServerIdentity.iter()` for emptiness. If any row exists, it rejects. No admin override; re-registration requires `--clear-database`.
- **SYSTEM user bootstrap** -- `register_server` creates User id=0 (username=`SYSTEM`, role=Admin) and links it to the server identity via UserIdentity. This allows server-token connections to pass `getAuthenticatedUser` / `ensureAdmin` checks.
- **Token persistence** -- `post-publish.ts` writes `SPACETIMEDB_SERVER_TOKEN` to `.env.local`. All server-only operations (API routes, test harness, seed scripts) read this token.
- **Dual-connection verification** -- `createVerifiedTestHarness` opens two simultaneous connections: one as the test user, one as the server. The server connection calls `serverLinkProvider` to upgrade the test user, mimicking the production API route flow.
- **Private table queries in tests** -- `queryPrivateTable` shells out to `spacetime sql` CLI because private tables (`public: false`) are not accessible via WebSocket subscriptions.
- **Configuration source of truth** -- `spacetime.json` contains the database name and server. Scripts read it directly; the test harness falls back to env vars (`SPACETIMEDB_URI`, `SPACETIMEDB_DB`).

**Behavior specification:** See [contract.md](contract.md)
