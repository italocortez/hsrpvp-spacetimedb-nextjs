<!-- Sources:
  - Logging: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/00100-how-to/00300-logging.md
  - Reject connections: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/00100-how-to/00500-reject-client-connections.md
  - Migration 2.0: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/00100-how-to/00600-migrating-to-2.0.md
  - PG Wire: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/00100-how-to/00200-pg-wire.md
  - Maincloud deploy: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/00100-how-to/00100-deploy/00100-maincloud.md
  - Row Level Security: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/00100-how-to/00400-row-level-security.md

  To update: fetch the raw GitHub URLs above and compare against this file.
-->

# SpacetimeDB How-To Guides (TypeScript focus)

## Table of Contents
1. [Logging](#logging)
2. [Rejecting Client Connections](#rejecting-client-connections)
3. [Event Tables & Per-Call Callbacks (2.0)](#event-tables--per-call-callbacks)
4. [Confirmed Reads](#confirmed-reads)
5. [PostgreSQL Wire Protocol](#postgresql-wire-protocol)
6. [Maincloud Deployment](#maincloud-deployment)
7. [Reconnection](#reconnection)
8. [Row Level Security (deprecated)](#row-level-security)
9. [v2.1.0 Bug Fixes](#v210-bug-fixes-relevant-to-clients)

---

## Logging

Log messages are **private to the database owner** and not visible to clients.

### TypeScript — use standard console API
```typescript
console.log('Info message');      // info level
console.warn('Warning message');  // warn level
console.error('Error message');   // error level
console.debug('Debug message');   // debug level
```

These are automatically routed through SpacetimeDB's logging system.

### Viewing logs
```bash
spacetime logs <db-name>                        # View recent logs
spacetime logs --follow <db-name>               # Real-time streaming
spacetime logs <db-name> --level error          # Filter by level (error and above)
spacetime logs <db-name> --level info --level-exact  # Exact level only
spacetime logs <db-name> --since "2023-01-01 00:00:00"  # Filter by time
```

### Best practices
- Match log levels: error for failures, warn for concerns, info for events, debug for diagnostics
- Minimize logging in loops and high-frequency reducers
- Never log credentials or PII
- Include contextual info (user ID, lobby ID, etc.) for debugging

---

## Rejecting Client Connections

Throw an error in the `clientConnected` lifecycle hook to reject a connection:

```typescript
spacetimedb.clientConnected((ctx) => {
  // Example: reject if server is in maintenance mode
  const config = ctx.db.serverConfig.id.find(0n);
  if (config?.maintenanceMode) {
    throw new Error('Server is in maintenance mode');
  }
  // Normal connection logic...
});
```

**Client behavior:** TypeScript clients receive a connection error with WebSocket close code 1006. The server logs an ERROR entry with the rejection reason.

Note: Client disconnection behavior is currently "undefined" — the client sees `Disconnected abnormally...`. Handle this gracefully in your `onConnectError` callback.

---

## Event Tables & Per-Call Callbacks

SpacetimeDB 2.0 removed global reducer callbacks in favor of two patterns:

### Per-call callbacks (`_then()`)
For observing results of YOUR OWN reducer calls only:
```typescript
conn.reducers.createItem({ title: 'Hello' })._then((ctx) => {
  // Fires only for THIS specific call
});
```

### Event tables (recommended)
For cross-client notifications. Event tables:
- Must be explicitly subscribed to (excluded from blanket subscriptions)
- Remain empty outside transactions — never accumulate rows in client caches
- Only `onInsert` callbacks are generated
- Are transactionally consistent with the reducer that wrote them

```typescript
// Subscribe to event tables explicitly
conn.subscriptionBuilder().subscribe([
  'SELECT * FROM lobby',
  'SELECT * FROM lobby_cursor_event',  // Event table — explicit!
]);
```

This project uses `LobbyCursorEvent` as an event table.

---

## Confirmed Reads

Transactions require durability confirmation before sending updates to clients. This guarantees consistency but adds latency to every reducer round-trip — the client won't see subscription updates until the server has confirmed the write to durable storage.

**v2.1.0 change:** The TypeScript SDK now defaults to confirmed reads **enabled**. In v2.0.x, the server had confirmed reads on by default but the TypeScript connector did not explicitly opt in — so some clients may see a behavioral change after upgrading. If your app felt fast on 2.0.x and slower on 2.1.0, this is likely the cause.

**Impact:** With confirmed reads enabled (the default), round-trip times of 200ms+ have been observed even when both server and client run on the same machine. Disabling confirmed reads can drop this to ~2ms locally. The setting applies to **both local development and maincloud** — it controls server-side behavior regardless of where the module is hosted.

**Trade-off:** Without confirmed reads, the client may briefly see state from a transaction that hasn't been durably committed. In practice, this matters only if the server crashes between processing a transaction and writing it to disk — an extremely rare event. For games and real-time apps, the latency savings far outweigh this risk.

For latency-sensitive applications (games, real-time), disable confirmed reads:
```typescript
const builder = DbConnection.builder()
  .withUri(SPACETIMEDB_URI)
  .withDatabaseName(MODULE_NAME)
  .withConfirmedReads(false)  // Prioritize speed over consistency
  // ...
```

**When to keep confirmed reads enabled:** Apps where data integrity on every transaction is critical (e.g., financial operations, inventory management) and where 100-200ms latency is acceptable.

---

## PostgreSQL Wire Protocol

SpacetimeDB implements PG wire protocol — you can query it with any PostgreSQL client (`psql`, DBeaver, etc.). Useful for debugging and admin tasks.

### Connection details
| Setting | Maincloud | Local |
|---------|-----------|-------|
| Host | `maincloud.spacetimedb.com` | `localhost` |
| Port | `5432` | Custom via `--pg-port` |
| Username | Any string | Any string |
| Password | Auth token | Auth token |
| SSL | `require` | `disable` |

### Get auth token
```bash
spacetime login show --token
```

### Limitations
- Simple Query Protocol only (no parameterized queries)
- SQL limited to SpacetimeDB's subset
- No real-time subscription updates
- No user-defined transactions (each statement independent)
- Enums display as `Enum`, complex types as `JSON`

---

## Maincloud Deployment

### Publishing
```bash
spacetime publish <db-name> --server maincloud
```
- Compiles module, uploads, runs `init` reducer
- Subsequent deploys **hot-swap code without disconnecting clients**
- Reset data: `spacetime publish <db-name> --server maincloud --delete-data`

### Dashboard
- URL: `https://spacetimedb.com/<db-name>` or `https://spacetimedb.com/@<username>/<db-name>`
- Shows: energy consumption (bytes scanned/written, index seeks, CPU, bandwidth, storage), real-time logs, SQL query interface

### Database states
- **Running** — actively serving
- **Paused** — free tier auto-suspends after inactivity; paid tiers stay available

### Deletion (irreversible!)
```bash
spacetime delete <db-name> --server maincloud
```

---

## Reconnection

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

---

## Row Level Security

**Deprecated.** Use Views instead. See `api-guide.md` section 7 for the recommended view pattern.

RLS is experimental/unstable and requires special pragma flags. Views are simpler, more performant, and provide full row/column access control.

---

## v2.1.0 Bug Fixes (relevant to clients)

These fixes landed in v2.1.0 (released 2026-03-24). No client code changes required — all are server-side or SDK-internal fixes.

- **`useTable` isReady regression** (#4580) — The `subscribe` callback captured a stale `computeSnapshot` closure. After `subscribeApplied` flipped to true, subsequent row events reverted `isReady` back to false. Fixed by adding `computeSnapshot` to the dependency array. If you had intermittent issues where table data appeared to "unload" after initial sync, this is the fix.

- **Client disconnect dropping other clients' subscriptions** (#4648) — When a v2 client disconnected, the cleanup logic double-processed query hashes, decrementing a refcounted index twice. This could remove indexes that other active clients still needed, causing them to stop receiving updates. Critical fix for multi-client scenarios.

- **Anonymous view subscription cleanup** (#4646) — Anonymous views with multiple subscribers were being prematurely dropped when one subscriber disconnected. More reliable view subscriptions in multi-client environments.

- **Query column name correctness** (#4627) — `ColumnExpression` now carries both the TS accessor name and the DB column name. SQL generation uses the DB column name. Fixes a correctness issue for projects where TS accessors differ from DB column names (e.g., camelCase TS vs snake_case DB). For this project, no visible impact since the generated bindings handle the mapping.

- **JS reducer execution throughput** (#4663) — JS reducers now execute on a single dedicated FIFO worker per module instead of a thread pool. Performance improvement from ~50K to ~85K TPS. Primarily affects JS modules, but related infrastructure improvements may benefit Rust modules too.
