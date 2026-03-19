---
name: spacetimedb
description: "Build and debug SpacetimeDB TypeScript modules and React clients, including multiplayer sync patterns. Use this skill whenever the user is working with SpacetimeDB — adding tables, writing reducers, creating views, setting up React subscriptions, publishing modules, debugging connection or query issues, implementing multiplayer features (movement sync, projectiles, combat, client-side prediction, interpolation), or any feature that touches the SpacetimeDB backend or client bindings. Also trigger when the user mentions spacetimedb, reducers, module_bindings, spacetime publish, spacetime generate, ctx.db, multiplayer sync, real-time multiplayer, table schema, subscription, BigInt, SenderError, useTable, or DbConnection."
---

# SpacetimeDB TypeScript Development

This skill guides you through building correct SpacetimeDB applications. SpacetimeDB has many API pitfalls that LLMs commonly hallucinate — this skill exists to prevent those mistakes and keep you on the correct APIs.

## This is a maincloud SpacetimeDB project. Connection: `wss://maincloud.spacetimedb.com` / database name in `spacetime.json`. No local server — do not use `spacetime start`. `spacetime call` uses the CLI identity (not an app user) so avoid it for testing authenticated reducers.

**Maintaining this skill:** When updating any pattern or API behavior in this file: (1) check whether the content already exists before adding — grep SKILL.md and references to avoid duplication, (2) check whether the same topic appears in the reference files (especially `references/api-guide.md` — see its table of contents) and update those too. Stale or duplicated references are worse than none — they teach agents the wrong pattern or waste context.

## When to load references

Read `references/api-guide.md` when you need detailed syntax for any of:
- Table definitions, column types, index configuration
- Reducer/procedure definitions and patterns
- Client-side React integration (useTable, subscriptions, provider setup)
- Views (procedural and query-builder)
- Scheduled tables and timestamps
- Common mistakes table (server-side and client-side)

**Module bindings** — read the generated files directly (always up-to-date, never stale):

| What you need | Read this file |
|---|---|
| Table schemas, indexes, constraints, reducer list | `src/module_bindings/index.ts` |
| Type definitions (enums, structs, tagged unions) | `src/module_bindings/types.ts` |
| Reducer parameter names for a specific reducer | `src/module_bindings/<reducer_name>_reducer.ts` |

Read `references/spacetime-json.md` when editing `spacetime.json` or `spacetime.local.json` — covers all config fields, generate targets, environment overrides, `spacetime dev` setup, and child database inheritance.

Read `references/http-api.md` when working with:
- Server-side SpacetimeDB access from Next.js API routes
- Calling reducers or running SQL via HTTP (not WebSocket)
- Identity/token management, database publishing via API
- Any scenario where the WebSocket SDK isn't available

Read `references/how-to-guides.md` for operational topics:
- Logging (console API, `spacetime logs --follow`, level filtering)
- Rejecting client connections in `clientConnected`
- Event tables and per-call callbacks (`_then()`)
- Confirmed reads toggle for latency-sensitive apps
- PostgreSQL wire protocol for admin/debugging queries
- Maincloud deployment (hot-swap, dashboard, database states)

Read `references/multiplayer-sync-patterns.md` when implementing:
- Real-time multiplayer features (movement, projectiles, combat)
- Client-side prediction and server reconciliation
- Entity interpolation for remote players
- Any feature where multiple clients need to see the same game state

For quick tasks where you already know the pattern, the cheat sheet below may suffice.

## Quick cheat sheet

### Imports
```typescript
// Server
import { schema, table, t, SenderError } from 'spacetimedb/server';
import { Timestamp, ScheduleAt } from 'spacetimedb';

// Client — ONLY these packages exist
import { DbConnection, tables, reducers } from './module_bindings';  // Generated!
import { SpacetimeDBProvider, useTable, useReducer, useSpacetimeDB } from 'spacetimedb/react';
import { Identity } from 'spacetimedb';
```

### Table definition & schema export
`table(OPTIONS, COLUMNS)` — indexes go in OPTIONS (1st arg), never COLUMNS (2nd arg causes `"reading 'tag'"` error). `schema()` takes exactly one object arg. See `references/api-guide.md` § 2 for full syntax, column types, exported columns pattern, and examples.

### Reducers — name from export, object params, no return values
The SDK derives the reducer name from the `export const` binding. There is no string-based registration — `reducer('name', ...)` doesn't exist. Parameters must be an object because the SDK generates typed destructuring from the schema; positional args would lose parameter names.
```typescript
export const create_item = spacetimedb.reducer(
  { title: t.string() },
  (ctx, { title }) => {
    ctx.db.myTable.insert({ id: 0n, ownerId: ctx.sender, title });
  }
);
```

### Client reducer calls — object syntax, never positional
```typescript
conn.reducers.createItem({ title: 'Hello' });  // camelCase on client
```

### The SpacetimeDB mindset: fire-and-forget, react to events
SpacetimeDB is event-driven (CQRS-style), not request-response like REST. The biggest habit to break coming from web dev: **don't try to get a reference back from a reducer call.** Instead, fire the reducer and handle the result in a subscription/onInsert callback elsewhere.

```typescript
// ❌ REST mindset — expecting a reference back
const newElement = await createItem({ title: 'Hello' });  // This doesn't work!

// ✅ SpacetimeDB mindset — fire and forget
conn.reducers.createItem({ title: 'Hello' });

// ...elsewhere in your app, react to the insert
conn.db.item.onInsert((ctx, row) => {
  console.log('New item:', row);
});
// Or in React: const [items, isReady] = useTable(tables.item);
```

Reducer callbacks exist in 2.0+ but don't return data about what was created. When the callback fires, rows are in the local cache — but you can't distinguish YOUR insert from another user's.

If you genuinely need immediate response data (rare once you adopt the pattern), two alternatives:
1. **Procedures** — can return data directly to the caller. See `references/api-guide.md` section 9.
2. **Event tables** — reducer inserts into an event table, client gets it via onInsert. Event tables auto-delete after delivery (insert + delete), acting as ephemeral response channels. This project uses this pattern with `LobbyCursorEvent`.

### High latency? Disable confirmed reads
If reducer round-trips feel slow (200ms+ even locally), the likely cause is confirmed reads — the default in SpacetimeDB 2.0. Add `.withConfirmedReads(false)` to the connection builder for games and real-time apps. This applies to both local dev and maincloud. See `references/how-to-guides.md` § Confirmed Reads for the full trade-off.

### Reconnection workaround (temporary)
SpacetimeDB's reconnect API is being improved. For the current workaround (unmount/remount provider via key prop), see `references/how-to-guides.md` § Reconnection.

### Data access in React
```typescript
const [rows, isReady] = useTable(tables.myTable);  // Tuple!

// With query builder filter
const [online, isReady] = useTable(tables.user.where(r => r.online.eq(true)));

// With callbacks
const [users, isReady] = useTable(tables.user, {
  onInsert: (row) => toast(`${row.name} joined`),
});
```

### Handling reducer errors on the client
Reducers don't return data, so errors surface via callbacks. Use `_then()` to detect failures from a specific call, and `ctx.event.status` to read the `SenderError` message:
```typescript
// Per-call error handling — fires only for THIS call
conn.reducers.updateUsername({ newUsername: 'alice' })._then((ctx) => {
  if (ctx.event.status.tag === 'Failed') {
    toast.error(ctx.event.status.value);  // SenderError message string
  }
});

// Global reducer listener — fires for ALL calls to this reducer
conn.reducers.onUpdateUsername((ctx) => {
  if (ctx.event.status.tag === 'Failed') {
    console.error('updateUsername failed:', ctx.event.status.value);
  }
});
// Status tags: 'Committed' | 'Failed' (value = error message) | 'OutOfEnergy'
```

### CRUD operations (server)
```typescript
// Create — 0n placeholder for autoInc
const row = ctx.db.myTable.insert({ id: 0n, ... });

// Read — accessor API depends on how the column was declared:
//   .primaryKey()  → has .find() only (returns row or null)
//   .unique()      → has .find() only (returns row or null)
//   btree index    → has .filter() only (returns iterator)
const item = ctx.db.myTable.id.find(itemId);                   // PK → single row or null
const user = ctx.db.User.username.find('alice');                // unique → single row or null
const items = [...ctx.db.myTable.owner_id.filter(ownerId)];    // btree → iterator (spread to array)

// Multi-column btree index — .filter([val1, val2]) maps positionally to columns array
const row = [...ctx.db.MyJoinTable.by_col1_and_col2.filter([val1, val2])][0];

// Update — spread existing row (SpacetimeDB replaces the full row, so omitted fields become defaults/zero)
ctx.db.myTable.id.update({ ...existing, title: newTitle });

// Delete — by PK value
ctx.db.myTable.id.delete(itemId);

// Composite PK lookup — BEST: define a multi-column btree index, then .filter([val1, val2])
// See "Accessor types" section below for the 3 declaration types and their APIs
```

### Accessor types — verified runtime behavior (2026-03-18)

Each column declaration type produces a different accessor with a different API. Mixing them up causes TypeErrors or silent data loss. A column can be functionally unique (e.g., `discordId`) but declared as a btree index — in that case it only has `.filter()`, not `.find()`.

| Declaration | Example | Has `.find()` | Has `.filter()` |
|---|---|---|---|
| `t.xxx().primaryKey()` | `id: t.u32().primaryKey().autoInc()` | YES (row or null) | NO (TypeError) |
| `t.xxx().unique()` | `username: t.string().unique()` | YES (row or null) | NO (TypeError) |
| btree index (`indexes: [...]`) | `{ accessor: 'owner_id', algorithm: 'btree', columns: ['ownerId'] }` | NO (TypeError) | YES (iterator) |

**`.filter()` argument rules for btree indexes:**

| Index type | Correct usage | Silent failures (0 rows, no error) |
|---|---|---|
| Single-column btree | `.filter(scalar)` | `.filter({obj})`, `.filter([val1, val2])` |
| Multi-column btree | `.filter([val1, val2])` (positional to columns array) | `.filter({obj})` |

Single-column btree with `.filter([val])` (one-element array) auto-coerces to scalar and works, but prefer `.filter(scalar)` for clarity.

**Multi-column btree index definition and usage:**
```typescript
// Table definition with multi-column btree index
export const TournamentParticipant = table({
  name: 'tournament_participant',
  public: true,
  indexes: [
    { accessor: 'by_tournament_and_user', algorithm: 'btree', columns: ['tournamentId', 'userId'] },
  ]
}, {
  tournamentId: t.u32(),
  userId: t.u32(),
  // ... other columns
});

// Usage — values map positionally to the columns array
const participant = [...ctx.db.TournamentParticipant.by_tournament_and_user.filter([tid, uid])][0];

// Fallback if no multi-column index exists: filter on one column, find on the other
const fallback = [...ctx.db.TournamentParticipant.tournament_id.filter(tid)].find(r => r.userId === uid);
```

### Errors in reducers — use `SenderError`
A plain `throw new Error()` logs to the server but the client only sees a generic failure. `SenderError` serializes the message into the reducer response so the calling client can display it.
```typescript
import { SenderError } from 'spacetimedb/server';

if (!item) throw new SenderError('Item not found.');
```

### BigInt — all u64/i64 fields
Use `0n`, `1n`, `100n` — never plain numbers for ID/u64 fields. JavaScript `number` loses precision above 2^53, so SpacetimeDB maps 64-bit integers to BigInt. Mixing `number` and `BigInt` (e.g. `row.id === 5`) silently returns `false` — no error, just wrong behavior.

### Timestamps on client
```typescript
const date = new Date(Number(row.createdAt.microsSinceUnixEpoch / 1000n));
```

## Multiplayer sync patterns (summary)

**Don't sync positions. Sync time.** Two patterns cover all multiplayer entities:

| Pattern | When to use | Network cost | Examples |
|---------|------------|--------------|----------|
| **Write once, compute anywhere** | Behavior expressible as a formula | 1 insert + 1 delete per entity lifetime | Bullets, grenades, AoE, cooldowns, patrol routes |
| **Stream and interpolate** | Unpredictable input every frame | ~20 writes/sec per entity | Player movement, aiming, vehicle steering |

**Write once:** Store origin + direction + speed + timestamp. All clients compute `pos(t) = origin + direction * speed * (t - fired_at)` locally. Remote clients do time catchup at spawn. Client predicts before server confirms.

**Stream:** Owner sends position at fixed rate. Server validates each update. Remote clients lerp between received positions.

**They combine:** Streamed player positions mean write-once projectiles can do local collision checks against reasonably current positions. Two patterns, zero coupling.

**Validation:** Start with ownership checks (`bullet.owner === ctx.sender`) and basic state (`player.health > 0`). Add server recomputation only when cheating is observed. Full simulation is rarely worth it.

See `references/multiplayer-sync-patterns.md` for full implementation details, code examples, and the complete fire/hit/kill/respawn lifecycle.

## Dangerous schema changes (require user confirmation)

These operations **destroy all existing data** and require `--clear-database` to republish:

- **Renaming a column** on a published table
- **Dropping a column** from a published table
- **Adding a column in the middle** of an existing table (not at the end)

Safe schema changes (no data loss):
- **Adding a column at the end** of a table — but it **must have a default value**, otherwise the publish will fail for existing rows.

Before making any of these dangerous changes, always confirm with the user that a full database reset is acceptable.

## Critical "do nots"

These are APIs that don't exist — LLMs hallucinate them frequently:

| Hallucinated API | What to use instead |
|---|---|
| `import { SpacetimeDBClient } from "@clockworklabs/spacetimedb-sdk"` | `import { DbConnection } from './module_bindings'` |
| `SpacetimeDBClient.connect(...)` | `DbConnection.builder().withUri(...).build()` |
| `conn.reducers.foo("val")` (positional) | `conn.reducers.foo({ param: "val" })` (object) |
| `reducer('name', params, fn)` | `export const name = spacetimedb.reducer(params, fn)` |
| `User.filterByName(...)` | `useTable(tables.user)` + filter in JS |
| `tables.user.filter(u => ...)` | `useTable(tables.user)` returns array, filter that |
| `const rows = useTable(table)` | `const [rows, isReady] = useTable(tables.user)` |
| `.subscribeToAll()` | `.subscribeToAllTables()` — method name changed |
| `throw new Error('msg')` in reducers | `throw new SenderError('msg')` — surfaces message to the calling client |
| `(ctx.db.Table as any).primaryKey.find({...})` | Define a multi-column btree index and use `.filter([val1, val2])` — `.primaryKey` is undefined at runtime, causes PANIC |
| `ctx.db.Table.index.filter({col1, col2})` (object arg) | `.filter(scalar)` for single-col, `.filter([val1, val2])` for multi-col btree — object arg silently returns 0 rows |
| `ctx.db.Table.singleColIdx.filter([val1, val2])` (array on single-col) | `.filter(scalar)` — passing an array to a single-column btree index silently returns 0 rows |
| `ctx.db.Table.btreeIdx.find(val)` | `[...ctx.db.Table.btreeIdx.filter(val)]` — btree indexes only have `.filter()`, not `.find()` (TypeError) |
| `ctx.db.Table.pkCol.filter(val)` | `ctx.db.Table.pkCol.find(val)` — PK/unique columns only have `.find()`, not `.filter()` (TypeError) |

## Feature implementation checklist

When implementing a feature that spans backend and client:

1. **Backend:** Define table(s) in `tables/` folder (one file per table), then import in `schema.ts`
2. **Backend:** Define reducer(s) in `reducers/` folder (grouped by domain), then re-export in `index.ts`
3. **Backend:** Publish module (`spacetime publish`)
4. **Backend:** Generate bindings (`spacetime generate`)
5. **Client:** Subscribe to the table(s)
6. **Client:** Call the reducer(s) from UI
7. **Client:** Render data from `useTable(tables.tableName)`

Common mistake: building backend tables/reducers but forgetting to wire up the client to call them.

## CLI commands

### Connecting to the database

The database name and server are configured in `spacetime.json` at the project root:
- `database` — the published database name (use this as `<name>` in all CLI commands)
- `server` — the target server nickname (e.g. `maincloud`)

**When running CLI commands from the project root**, `spacetime.json` is auto-detected — so you can omit `-s <server>` and sometimes even `<name>`. But always prefer being explicit to avoid confusion.

```bash
# Read the database name from spacetime.json before running any CLI command:
#   "database": "hsrpvp-spacetimedb-nextjs-test1"
#   "server": "maincloud"
```

### Common commands

```bash
spacetime publish <name> --module-path <dir>       # Publish module
spacetime publish <name> --clear-database -y --module-path <dir>  # Clear & republish
spacetime generate --lang typescript --out-dir <client>/src/module_bindings --module-path <dir>
spacetime logs <name>                              # View logs
spacetime logs <name> --level warn                 # Filter by log level (warn and above)
spacetime sql <name> "SELECT * FROM table_name"    # Query tables via SQL
spacetime call <name> <reducer_name> [args...]     # Call a reducer
```

### `spacetime sql` column name gotcha

`spacetime sql` auto-converts camelCase column definitions to snake_case, but the conversion splits at every case boundary including before digits. This produces non-obvious names:

| Column definition (camelCase) | SQL column name (snake_case) |
|------|------|
| `groupSize` | `group_size` |
| `autoAdvanceBracket` | `auto_advance_bracket` |
| `has3rdPlaceMatch` | `has_3_rd_place_match` (not `has_3rd_place_match`) |
| `participantTeamId` | `participant_team_id` |

**When in doubt, use `SELECT * FROM table LIMIT 1`** to see the actual column names before writing filtered queries.

## Project structure (this repo)

### Backend (`spacetimedb/src/`)
```
schema.ts              -> Imports all tables, exports spacetimedb via schema({...})
index.ts               -> Imports all reducers, views, lifecycle hooks (clientConnected/Disconnected)
tables/                -> One file per table (e.g. user.ts, lobby.ts, hsrCharacter.ts)
  └── Each exports column definitions + table() call
reducers/              -> One file per domain (e.g. auth.ts, admin.ts, roster.ts, rosterAdmin.ts)
  └── Each imports spacetimedb from ../schema
views/                 -> Security views limiting client data access (e.g. securityViews.ts)
helpers/               -> Shared utilities (ensurePermissions.ts, auditColumns.ts, rosterHelpers.ts)
types/
  ├── enums.ts         -> All enum definitions (Path, Element, CharRole, GameMode, etc.)
  └── structs.ts       -> All struct/object type definitions (EidolonCost, LobbyConfig, etc.)
docs/ (project root)   -> Feature architecture docs (one folder per domain with architecture.md and contract.md)
```

### Frontend
```
src/module_bindings/    -> Generated client bindings (don't edit! Regenerate with spacetime generate)
app/                    -> Next.js App Router pages
  ├── (authenticated)/  -> Protected routes (admin-view, lobby, profile)
  ├── (game)/           -> Game routes (draft/[matchId])
  ├── (landing-page)/   -> Public routes (costs, teambuilder)
  └── api/              -> API routes (auth, discord linking)
components/features/    -> Feature-based component organization
  ├── admin-view/       -> Admin panel components
  ├── auth/             -> Authentication components + hooks
  ├── costs/            -> Cost display components + hooks
  ├── drafting/         -> Draft UI (classic + auction modes)
  ├── game-data/        -> Game data display components
  └── landing/          -> Landing page components
lib/                    -> Shared utilities and configuration
```

### Key conventions
- **New tables** go in `spacetimedb/src/tables/` as individual files, then import in `schema.ts`
- **New reducers** go in `spacetimedb/src/reducers/` grouped by domain, then import in `index.ts`
- **New enums/structs** go in `spacetimedb/src/types/enums.ts` or `structs.ts`
- **New views** go in `spacetimedb/src/views/`, then import in `index.ts`
- **New frontend features** go in `components/features/<feature-name>/` with `components/` and `hooks/` subdirs
- **Private tables** (e.g. `LobbyPassword`) use `public: false` to keep sensitive data off the wire — see pattern below

## Naming conventions (this repo — ENFORCED)

| Layer | Convention | Examples |
|-------|-----------|----------|
| Table columns | `camelCase` | `hostUserId`, `avatarCharacterName`, `createdById` |
| Struct/object fields | `camelCase` | `teamSize`, `characterName`, `isPaused` |
| Enum variants | `PascalCase` | `MemoryOfChaos`, `BlueWins`, `TournamentHost` |
| Reducer export names | `snake_case` | `login_as_guest`, `server_link_discord` |
| Index accessors (code-facing) | `snake_case` | `host_user_id`, `discord_id`, `user_id` |
| Table names (in `table()`) | `snake_case` | `'user'`, `'hsr_character'`, `'lobby_member'` |
| Helper functions | `camelCase` | `getAuthenticatedUser`, `ensureAdmin`, `auditInsert` |
| Constants | `UPPER_SNAKE_CASE` | `SYSTEM_USER_ID`, `DISCORD_INTENT_KEY` |

**Never mix conventions within a layer.** All struct fields and table columns MUST be camelCase. Enum variants MUST be PascalCase (standard TypeScript enum convention).

**Index definitions only need `accessor`** — SpacetimeDB auto-generates the DB catalog `name`, so omit it. The `accessor` is the code-facing handle used in `ctx.db.Table.accessor.find/filter()`. Keep it short — accessors are scoped per-table, so no table prefix needed.

```typescript
// ✅ Clean — single-column, accessor only, name auto-generated
indexes: [{ accessor: 'owner_id', algorithm: 'btree', columns: ['ownerId'] }]

// ✅ Multi-column btree — use for composite PK lookups; .filter([val1, val2]) maps positionally
indexes: [{ accessor: 'by_tournament_and_user', algorithm: 'btree', columns: ['tournamentId', 'userId'] }]

// ❌ Never omit accessor
indexes: [{ algorithm: 'btree', columns: ['ownerId'] }]

// ❌ Unnecessary — name is auto-generated, don't declare it
indexes: [{ name: 'my_table_owner_id_idx_btree', accessor: 'owner_id', algorithm: 'btree', columns: ['ownerId'] }]
```

## Audit columns policy (this repo — ENFORCED)

Every table MUST have these 4 columns at the end of its column definition (exception: `ServerIdentity`):

```typescript
createdById: t.u32(),
createdDate: t.timestamp(),
lastModifiedById: t.u32(),
lastModifiedDate: t.timestamp(),
```

**Rules:**
- Each table defines its own audit columns inline — do NOT import/spread a shared object. SpacetimeDB's `table()` resolves column types at call time, so if tables share a column definition object, a change to that object silently alters every table that uses it — causing unintended schema migrations or `--clear-database` requirements.
- Use `auditInsert(ctx, userId)` from `helpers/auditColumns.ts` when inserting a new row
- Use `auditUpdate(ctx, existingRow, userId)` from `helpers/auditColumns.ts` when updating a row — this preserves original `createdById`/`createdDate`
- `SYSTEM_USER_ID = 0` is used for bootstrap operations (e.g. `register_server` creating the SYSTEM user) and scheduled reducers
- The SYSTEM user (discordId = `"1"`, role = Admin) is created during `register_server` as the first user
- When upserting (delete + re-insert for composite PK tables), preserve audit fields from the deleted row: `...(existing ? auditUpdate(ctx, existing, userId) : auditInsert(ctx, userId))`
- Admin reducers should capture `const admin = ensureAdmin(ctx)` once at the top and use `admin.id` for all audit fields

## Data access best practices (this repo — ENFORCED)

**Always prefer indexed lookups over `.iter()`** — `.iter()` performs a full table scan (O(n)), while `.find()` and `.filter()` on indexes are O(log n). In views, `.iter()` is especially dangerous: the view re-evaluates on *any* row change in the source table, so an iter-based view touching a 10k-row table fires 10k scans per write.

| Scenario | Use | NOT |
|----------|-----|-----|
| Lookup by PK (`.primaryKey()`) | `ctx.db.Table.pkCol.find(value)` | `.pkCol.filter()` (TypeError — PK only has `.find()`) |
| Lookup by unique col (`.unique()`) | `ctx.db.Table.uniqueCol.find(value)` | `.uniqueCol.filter()` (TypeError — unique only has `.find()`) |
| Lookup by btree index (`indexes: [...]`) | `[...ctx.db.Table.idx.filter(value)]` | `.idx.find()` (TypeError — btree only has `.filter()`) |
| Multi-column lookup (multi-col btree) | `[...ctx.db.Table.by_col1_and_col2.filter([val1, val2])]` | `.filter({col1, col2})` (object arg silently returns 0 rows!) |
| Multi-column lookup (single-col btree fallback) | `[...ctx.db.Table.idx.filter(col1Val)].find(r => r.col2 === col2Val)` | `.filter([val1, val2])` on single-col index (silently returns 0 rows!) |
| Composite PK lookup | Define multi-col btree index, then `[...ctx.db.Table.by_col1_and_col2.filter([val1, val2])]` | `.primaryKey.find()` (undefined at runtime — PANIC!) |
| Identity hex string match | `.iter()` (no hex→Identity conversion exists) | N/A — iter is the only option |
| Composite key upsert (no PK accessor) | `.iter()` + match | N/A — iter is the only option |

**When `.iter()` is unavoidable**, add a comment explaining why (e.g. "identity is an object, we only have the hex string").

## TypeScript patterns in SpacetimeDB (SDK limitations)

**`ctx: any` in helper functions** — The SpacetimeDB SDK exports `ReducerCtx` but it's generic and requires the full schema type parameter. Using `any` for `ctx` in standalone helper functions (`ensureAdmin`, `getAuthenticatedUser`, `auditInsert`) is the accepted pattern. Do NOT try to import or construct the generic context type.

**`as any` on enum values** — When constructing enum values from runtime strings (e.g. `{ tag: roleTag, value: {} } as any`), the `as any` cast is necessary because TypeScript can't narrow a `string` variable to the specific literal union the enum type expects. This is expected.

**`export let` for scheduled table reducers** — The `userDeletionJob.ts` pattern (`export let _reducer: any` + setter function) is the documented way to avoid circular dependencies between scheduled tables and their reducers. Do not refactor this.

## User table special fields

- `isOnline: t.bool()` — set `true` in `clientConnected`, `false` in `clientDisconnected`
- `isPrivate: t.bool()` — defaults to `false`, for future privacy features
- `deletedAt: t.timestamp().optional()` — soft-delete pattern, triggers scheduled hard-delete after 5s

## Private tables — keeping sensitive data off the wire

When a table has columns that should never reach the client (passwords, tokens, secrets), extract those columns into a separate `public: false` table linked by FK. This project uses `LobbyPassword` as the canonical example:

```typescript
// lobbyPassword.ts — private table, never broadcast to clients
export const LobbyPassword = table({
  name: 'lobby_password',
  // public: false is the default, but explicit is better
  indexes: [{ accessor: 'lobby_id', algorithm: 'btree', columns: ['lobbyId'] }]
}, {
  lobbyId: t.u64().primaryKey(),  // FK to Lobby.id
  passwordHash: t.string(),
  // audit columns...
});
```

Reducers can still read/write private tables — only client subscriptions are blocked.

## Admin proxy reducer pattern

For features where users have self-service reducers, create a parallel set of `admin_*` reducers that mirror the user operations but act on behalf of any user. The pattern:

```typescript
export const admin_create_thing = spacetimedb.reducer(
  { targetUserId: t.u32(), /* same params as user reducer */ },
  (ctx, { targetUserId, ...params }) => {
    const admin = ensureAdmin(ctx);
    // Same logic as user reducer, but use targetUserId instead of ctx.sender
  }
);
```

See `reducers/rosterAdmin.ts` for the full example (9 admin proxy reducers mirroring `roster.ts`).

## Foreign keys

SpacetimeDB does NOT support FK constraints. Referential integrity must be enforced in reducer code. This is by design — SpacetimeDB's distributed architecture prioritizes write throughput over relational constraints. Check for the existence of referenced rows in reducers before inserting, and cascade-delete related rows manually when removing parents.

## Energy budget & bandwidth rules (ENFORCED)

This project runs on SpacetimeDB maincloud with a **40,000 energy/month budget**. Egress is the dominant cost driver (~99% of energy in growth scenarios). Every table and reducer decision must consider bandwidth impact.

**Energy rates:**
- 1M reducer calls = 840 energy
- 10GB egress = 2,000 energy
- 1GB storage = 2,592 energy

**The #1 cost driver is initial subscription load** — every user connection downloads all subscribed public table data. At scale, this dwarfs real-time broadcasts.

### Subscription strategy (MUST follow)

- **Never subscribe to all tables.** Users subscribe only to tables relevant to their current view.
- **Match history tables are on-demand** — `match_session_history`, `match_session_step_history` are NOT in default subscriptions. Load only when user views match history.
- **Cost tables**: Subscribe only to the active `costSetId`, not all cost sets.
- **Tournament data**: Subscribe only for tournaments the user is viewing/participating in.
- **Static data** (characters, lightcones, archetypes): Safe to subscribe globally — small and rarely updated.
- **Transient tables** (lobby, match_session, chat): Subscribe only when in a lobby.

### Table design rules for bandwidth

| Rule | Why |
|------|-----|
| Prefer `public: false` + views over `public: true` for user-scoped data | Prevents broadcasting to all subscribers |
| Prefer computed values on frontend over stored columns | Saves writes, storage, AND egress (e.g., `winRate = wins / matchesPlayed`) |
| Use transactional tables (row exists = pending, delete = resolved) | Fewer rows = less storage and egress |
| Minimize string columns on high-row-count tables | Strings have 4-byte overhead + content; use enums or u8 codes where possible |
| Split large tables by access pattern | History/audit data separate from live data users always subscribe to |
| Keep audit columns (24 bytes/row) — they're tiny vs string columns | Don't remove audit for "savings" — the overhead is negligible |

### When to run the energy model

Run `node tools/energy-model.js` to check energy impact:
- Before adding new public tables (especially unbounded-growth ones)
- When changing subscription strategy
- During phase discussions to compare design options
- Use `--scenario growth --months 12` for forward-looking analysis

```bash
node tools/energy-model.js                                    # Current baseline
node tools/energy-model.js --scenario growth --months 12      # Growth projection
node tools/energy-model.js --users 300 --matches-per-day 40   # Custom scenario
node tools/energy-model.js --all                              # Compare all scenarios
```

### Tradeoff reporting

When proposing any design that adds tables, columns, or changes visibility:
1. State the bandwidth impact (rough: "adds ~X MB to initial subscription load per user")
2. State the storage growth rate ("~X rows/month at Y bytes/row = Z MB/year")
3. Compare alternatives if they exist
4. Flag if the change moves the growth scenario closer to budget limits

## Updating docs from SpacetimeDB GitHub

The skill references are currently based on **SpacetimeDB v2.0.5**. When the user asks to update the skill docs (e.g. "update spacetimedb docs", "check for new SpacetimeDB changes", "sync with upstream"), or when you notice `spacetimedb` in `package.json` has been bumped past this version:

1. **Check the latest release** — fetch `https://github.com/clockworklabs/SpacetimeDB/releases/latest` and compare the version against what's documented in our references
2. **Fetch upstream how-to docs** — each reference file has `<!-- Sources: ... -->` comments at the top with the exact GitHub URLs. Fetch the raw versions of those URLs (swap `github.com/.../blob/` to `raw.githubusercontent.com/.../`) and compare against our current content
3. **Update reference files** — rewrite any sections that have changed, keeping the TypeScript focus. Update the source comment URLs to the new commit hash
4. **Update SKILL.md** if new patterns, APIs, or breaking changes affect the cheat sheet

Key upstream doc paths:
- How-to guides: `docs/docs/00300-resources/00100-how-to/`
- CLI reference: `docs/docs/00300-resources/01000-reference/00100-cli-reference/`
- Releases: `https://github.com/clockworklabs/SpacetimeDB/releases`
