---
name: spacetimedb
description: "Build and debug SpacetimeDB TypeScript modules and React clients, including multiplayer sync patterns. Use this skill whenever the user is working with SpacetimeDB — adding tables, writing reducers, creating views, setting up React subscriptions, publishing modules, debugging connection or query issues, implementing multiplayer features (movement sync, projectiles, combat, client-side prediction, interpolation), or any feature that touches the SpacetimeDB backend or client bindings. Also trigger when the user mentions spacetimedb, reducers, module_bindings, spacetime publish, spacetime generate, ctx.db, multiplayer sync, or real-time multiplayer."
---

# SpacetimeDB TypeScript Development

This skill guides you through building correct SpacetimeDB applications. SpacetimeDB has many API pitfalls that LLMs commonly hallucinate — this skill exists to prevent those mistakes and keep you on the correct APIs.

## When to load references

Read `references/api-guide.md` when you need detailed syntax for any of:
- Table definitions, column types, index configuration
- Reducer/procedure definitions and patterns
- Client-side React integration (useTable, subscriptions, provider setup)
- Views (procedural and query-builder)
- Scheduled tables and timestamps
- Common mistakes table (server-side and client-side)

Read `references/module-bindings.md` instead of reading `src/module_bindings/` files directly. This saves tokens — it contains all tables, reducers, enums, types, and indexes in a compact format.

**To regenerate `references/module-bindings.md`** (do this after every `spacetime generate` or when the user asks):
1. Read all `.ts` files in `src/module_bindings/` (tables, reducers, types, index.ts)
2. Extract: table names, columns with types, PKs, indexes, reducer names with params, enums, custom types
3. Rewrite `references/module-bindings.md` in the same compact format, updating the CLI version at the top

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
import { schema, table, t } from 'spacetimedb/server';
import { Timestamp, ScheduleAt } from 'spacetimedb';

// Client — ONLY these packages exist
import { DbConnection, tables, reducers } from './module_bindings';  // Generated!
import { SpacetimeDBProvider, useTable, useReducer, useSpacetimeDB } from 'spacetimedb/react';
import { Identity } from 'spacetimedb';
```

### Table definition — `table(OPTIONS, COLUMNS)`
Indexes go in OPTIONS (1st arg), never in COLUMNS (2nd arg).
```typescript
export const MyTable = table({
  name: 'my_table',
  public: true,
  indexes: [{ name: 'my_table_owner_id', accessor: 'my_table_owner_id', algorithm: 'btree', columns: ['ownerId'] }]
}, {
  id: t.u64().primaryKey().autoInc(),
  ownerId: t.identity(),
  title: t.string(),
});
```

### Schema export — exactly ONE object argument
```typescript
const spacetimedb = schema({ myTable, otherTable });
export default spacetimedb;
```

### Reducers — name from export, object params, no return values
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
SpacetimeDB's reconnect story is being improved, but currently the only reliable way is to unmount and remount the `SpacetimeDBProvider` by toggling a key prop:

```typescript
const [connectionKey, setConnectionKey] = useState(0);

// In your onDisconnect callback:
setTimeout(() => setConnectionKey(k => k + 1), 2000);

// This forces React to destroy and recreate the entire provider tree
<SpacetimeDBProvider key={connectionKey} connectionBuilder={builder}>
  {children}
</SpacetimeDBProvider>
```

This is a known rough edge — expect a better API for this soon.

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

### CRUD operations (server)
```typescript
// Create — 0n placeholder for autoInc
const row = ctx.db.myTable.insert({ id: 0n, ... });

// Read — .find() for unique/PK, .filter() for indexed
const item = ctx.db.myTable.id.find(itemId);
const items = [...ctx.db.myTable.my_table_owner_id.filter(ownerId)];

// Update — spread existing row
ctx.db.myTable.id.update({ ...existing, title: newTitle });

// Delete — by PK value
ctx.db.myTable.id.delete(itemId);
```

### Exported columns — reuse column definitions across backend components
Extract column definitions into a named object so other backend files (reducers, helpers, validators) can import and reference the column shape without exposing data to clients. Define the columns object and table in the same schema file:
```typescript
// schema.ts (or tables/my_table.ts)
import { table, t } from 'spacetimedb/server';

// Export columns separately — other backend code can import this
export const myTableColumns = {
  name: t.string().primaryKey(),
  displayName: t.string(),
  category: t.string(),
  imageUrl: t.string(),
};

// Pass the columns object as the 2nd arg to table()
export const MyTable = table({
  name: 'my_table',
  public: true,
  indexes: [
    { name: 'my_table_category', accessor: 'my_table_category', algorithm: 'btree', columns: ['category'] },
  ]
}, myTableColumns);
```
Other backend files can then `import { myTableColumns } from '../tables/my_table'` to reference the column types for validation, type-safe helpers, or building related tables that share a subset of columns — all without making the data public to clients.

### BigInt — all u64/i64 fields
Use `0n`, `1n`, `100n` — never plain numbers for ID/u64 fields.

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

## Feature implementation checklist

When implementing a feature that spans backend and client:

1. **Backend:** Define table(s) in `schema.ts`
2. **Backend:** Define reducer(s) in `index.ts` (or reducers/ folder)
3. **Backend:** Publish module (`spacetime publish`)
4. **Backend:** Generate bindings (`spacetime generate`)
5. **Client:** Subscribe to the table(s)
6. **Client:** Call the reducer(s) from UI
7. **Client:** Render data from `useTable(tables.tableName)`

Common mistake: building backend tables/reducers but forgetting to wire up the client to call them.

## CLI commands

```bash
spacetime start                                    # Start local server
spacetime publish <name> --module-path <dir>       # Publish module
spacetime publish <name> --clear-database -y --module-path <dir>  # Clear & republish
spacetime generate --lang typescript --out-dir <client>/src/module_bindings --module-path <dir>
spacetime logs <name>                              # View logs
spacetime logs <name> --level warn                 # Filter by log level (warn and above)
```

## Project structure (this repo)

### Backend (`spacetimedb/src/`)
```
schema.ts              -> Imports all tables, exports spacetimedb via schema({...})
index.ts               -> Imports all reducers, lifecycle hooks (clientConnected/Disconnected)
tables/                -> One file per table (e.g. user.ts, lobby.ts, hsrCharacter.ts)
  └── Each exports column definitions + table() call
reducers/              -> One file per domain (e.g. auth.ts, admin.ts, profile.ts, server.ts)
  └── Each imports spacetimedb from ../schema
helpers/               -> Shared utilities (e.g. ensurePermissions.ts)
types/
  ├── enums.ts         -> All enum definitions (Path, Element, CharRole, GameMode, etc.)
  └── structs.ts       -> All struct/object type definitions (EidolonCost, LobbyConfig, etc.)
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
- **New frontend features** go in `components/features/<feature-name>/` with `components/` and `hooks/` subdirs

## Naming conventions (this repo — ENFORCED)

| Layer | Convention | Examples |
|-------|-----------|----------|
| Table columns | `camelCase` | `hostUserId`, `avatarCharacterName`, `createdById` |
| Struct/object fields | `camelCase` | `teamSize`, `characterName`, `isPaused` |
| Enum variants | `PascalCase` | `MemoryOfChaos`, `BlueWins`, `TournamentHost` |
| Reducer export names | `snake_case` | `login_as_guest`, `server_link_discord` |
| Index names & accessors | `snake_case` | `lobby_host`, `user_discord_id` |
| Table names (in `table()`) | `snake_case` | `'user'`, `'hsr_character'`, `'lobby_member'` |
| Helper functions | `camelCase` | `resolveUser`, `ensureAdmin`, `auditInsert` |
| Constants | `UPPER_SNAKE_CASE` | `SYSTEM_USER_ID`, `DISCORD_INTENT_KEY` |

**Never mix conventions within a layer.** All struct fields and table columns MUST be camelCase. Enum variants MUST be PascalCase (standard TypeScript enum convention).

**Index definitions MUST include `accessor`** — as of SpacetimeDB 2.0.4 the SDK requires it (previously optional). The `accessor` value must match `name`:
```typescript
// ✅ Project convention — always include accessor matching name
indexes: [{ name: 'my_table_col', accessor: 'my_table_col', algorithm: 'btree', columns: ['col'] }]

// ❌ Never omit accessor in this project
indexes: [{ name: 'my_table_col', algorithm: 'btree', columns: ['col'] }]
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
- Each table defines its own audit columns inline — do NOT import/spread a shared object. Tables must not be coupled through column definitions.
- Use `auditInsert(ctx, userId)` from `helpers/auditColumns.ts` when inserting a new row
- Use `auditUpdate(ctx, existingRow, userId)` from `helpers/auditColumns.ts` when updating a row — this preserves original `createdById`/`createdDate`
- `SYSTEM_USER_ID = 0` is used for bootstrap operations (e.g. `register_server` creating the SYSTEM user) and scheduled reducers
- The SYSTEM user (discordId = `"1"`, role = Admin) is created during `register_server` as the first user
- When upserting (delete + re-insert for composite PK tables), preserve audit fields from the deleted row: `...(existing ? auditUpdate(ctx, existing, userId) : auditInsert(ctx, userId))`
- Admin reducers should capture `const admin = ensureAdmin(ctx)` once at the top and use `admin.id` for all audit fields

## Data access best practices (this repo — ENFORCED)

**Always prefer indexed lookups over `.iter()`:**

| Scenario | Use | NOT |
|----------|-----|-----|
| Lookup by PK | `ctx.db.Table.pkColumn.find(value)` | `for (const r of ctx.db.Table.iter())` |
| Lookup by unique column | `ctx.db.Table.uniqueCol.find(value)` | `.iter()` + manual filter |
| Lookup by indexed column | `[...ctx.db.Table.index_name.filter(value)]` | `.iter()` + manual filter |
| Multi-column index lookup | `[...ctx.db.Table.idx_name.filter({col1, col2})]` | `.iter()` + manual match on each column |
| Composite PK lookup | `(ctx.db.Table as any).primaryKey.find({...})` | `.iter()` + manual match |
| Identity hex string match | `.iter()` (no hex→Identity conversion exists) | N/A — iter is the only option |
| Composite key upsert (no PK accessor) | `.iter()` + match | N/A — iter is the only option |

**When `.iter()` is unavoidable**, add a comment explaining why (e.g. "identity is an object, we only have the hex string").

## TypeScript patterns in SpacetimeDB (SDK limitations)

**`ctx: any` in helper functions** — The SpacetimeDB SDK exports `ReducerCtx` but it's generic and requires the full schema type parameter. Using `any` for `ctx` in standalone helper functions (`ensureAdmin`, `resolveUser`, `auditInsert`) is the accepted pattern. Do NOT try to import or construct the generic context type.

**`as any` on enum values** — When constructing enum values from runtime strings (e.g. `{ tag: roleTag, value: {} } as any`), the `as any` cast is necessary because TypeScript can't narrow a `string` variable to the specific literal union the enum type expects. This is expected.

**`export let` for scheduled table reducers** — The `userDeletionJob.ts` pattern (`export let _reducer: any` + setter function) is the documented way to avoid circular dependencies between scheduled tables and their reducers. Do not refactor this.

## User table special fields

- `isOnline: t.bool()` — set `true` in `clientConnected`, `false` in `clientDisconnected`
- `isPrivate: t.bool()` — defaults to `false`, for future privacy features
- `deletedAt: t.timestamp().optional()` — soft-delete pattern, triggers scheduled hard-delete after 5s

## Foreign keys

SpacetimeDB does NOT support FK constraints. Referential integrity must be enforced in reducer code. This is expected — not a bug or missing feature.

## Updating docs from SpacetimeDB GitHub

When the user asks to update the skill docs (e.g. "update spacetimedb docs", "check for new SpacetimeDB changes", "sync with upstream"):

1. **Check the latest release** — fetch `https://github.com/clockworklabs/SpacetimeDB/releases/latest` and compare the version against what's documented in our references
2. **Fetch upstream how-to docs** — each reference file has `<!-- Sources: ... -->` comments at the top with the exact GitHub URLs. Fetch the raw versions of those URLs (swap `github.com/.../blob/` to `raw.githubusercontent.com/.../`) and compare against our current content
3. **Update reference files** — rewrite any sections that have changed, keeping the TypeScript focus. Update the source comment URLs to the new commit hash
4. **Update SKILL.md** if new patterns, APIs, or breaking changes affect the cheat sheet

Key upstream doc paths:
- How-to guides: `docs/docs/00300-resources/00100-how-to/`
- CLI reference: `docs/docs/00300-resources/01000-reference/00100-cli-reference/`
- Releases: `https://github.com/clockworklabs/SpacetimeDB/releases`
