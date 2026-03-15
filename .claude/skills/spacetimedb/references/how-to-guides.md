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
7. [Row Level Security (deprecated)](#row-level-security)

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

In 2.0, transactions require durability confirmation before sending updates to clients before notifying subscribers. This guarantees consistency but adds latency to every reducer round-trip — the client won't see subscription updates until the server has confirmed the write to durable storage.

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

## Row Level Security

**Deprecated.** Use Views instead. See `api-guide.md` section 7 for the recommended view pattern.

RLS is experimental/unstable and requires special pragma flags. Views are simpler, more performant, and provide full row/column access control.
