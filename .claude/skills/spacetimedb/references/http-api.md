<!-- Sources:
  - Authorization: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/00200-reference/00200-http-api/00100-authorization.md
  - Identity: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/00200-reference/00200-http-api/00200-identity.md
  - Database: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/00200-reference/00200-http-api/00300-database.md
-->

# SpacetimeDB HTTP API Reference

Base URL: `https://maincloud.spacetimedb.com` (maincloud) or `http://localhost:3000` (local)

## Authorization

All protected endpoints use Bearer token auth:
```
Authorization: Bearer <token>
```

Tokens can be obtained via:
1. **OpenID Connect** — SpacetimeDB derives identity from `sub` and `iss` claims of any OIDC-compliant JWT
2. **HTTP endpoint** — `POST /v1/identity` returns a new identity + token (cluster-specific)
3. **WebSocket** — anonymous connection auto-generates identity + token via `IdentityToken` message

---

## Connectivity

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/ping` | No | Health check — verify connectivity |

---

## Identity Endpoints (`/v1/identity`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v1/identity` | No | Generate new identity + token |
| POST | `/v1/identity/websocket-token` | Yes | Short-lived token for untrusted contexts (embedded URLs) |
| GET | `/v1/identity/public-key` | No | Fetch public key for token verification (PEM format) |
| POST | `/v1/identity/:identity/set-email` | Yes | Associate email with identity (`?email=...`) |
| GET | `/v1/identity/:identity/databases` | No | List all databases owned by identity |
| GET | `/v1/identity/:identity/verify` | Yes | Verify identity/token pair (204=valid, 400=mismatch, 401=invalid) |

### Generate identity
```bash
curl -X POST https://maincloud.spacetimedb.com/v1/identity
# Response: { "identity": "hex-string", "token": "jwt-string" }
```

### Verify identity
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://maincloud.spacetimedb.com/v1/identity/$IDENTITY/verify
# 204 No Content = valid
```

---

## Database Endpoints (`/v1/database`)

### Publishing & Management

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v1/database` | Yes | Publish unnamed database (body: WASM binary) |
| POST | `/v1/database/:name_or_identity` | Yes | Publish to named database (`?clear=true` to reset) |
| GET | `/v1/database/:name_or_identity` | No | Get database info (identity, owner, host type, WASM hash) |
| DELETE | `/v1/database/:name_or_identity` | Yes | Delete database (irreversible) |
| GET | `/v1/database/:name_or_identity/identity` | No | Get database identity as hex string |
| GET | `/v1/database/:name_or_identity/schema` | No | Get schema as JSON RawModuleDef |

### Database Naming

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/database/:name_or_identity/names` | No | List database names |
| POST | `/v1/database/:name_or_identity/names` | Yes | Add a name (body: string) |
| PUT | `/v1/database/:name_or_identity/names` | Yes | Replace all names (body: JSON array) |

### Operations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v1/database/:name_or_identity/call/:reducer` | Yes | Invoke reducer (body: JSON array of args) |
| POST | `/v1/database/:name_or_identity/sql` | Yes | Execute SQL queries (semicolon-separated) |
| GET | `/v1/database/:name_or_identity/logs` | Yes | Stream logs (`?num_lines=N&follow=true`) |

### WebSocket

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/v1/database/:name_or_identity/subscribe` | Yes | WebSocket connection |

WebSocket protocols: `v1.bsatn.spacetimedb` (binary, recommended) or `v1.json.spacetimedb` (JSON)

---

## Common Usage Examples

### Call a reducer via HTTP
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '["arg1", 42]' \
  https://maincloud.spacetimedb.com/v1/database/my-db/call/my_reducer
```

### Run SQL query
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: text/plain" \
  -d "SELECT * FROM user WHERE id = 1" \
  https://maincloud.spacetimedb.com/v1/database/my-db/sql
```

### Stream logs
```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://maincloud.spacetimedb.com/v1/database/my-db/logs?num_lines=100&follow=true"
```

### Publish module
```bash
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/wasm" \
  --data-binary @module.wasm \
  "https://maincloud.spacetimedb.com/v1/database/my-db"
```

---

## Using from Next.js API Routes

The HTTP API is useful for server-side operations in Next.js API routes where you can't use the WebSocket SDK:

```typescript
// app/api/example/route.ts
const SPACETIMEDB_URL = 'https://maincloud.spacetimedb.com';
const DB_NAME = 'my-database';

// Get auth token from CLI: spacetime login show --token
const TOKEN = process.env.SPACETIMEDB_TOKEN;

// Query data server-side
export async function GET() {
  const res = await fetch(`${SPACETIMEDB_URL}/v1/database/${DB_NAME}/sql`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'text/plain',
    },
    body: 'SELECT * FROM user LIMIT 10',
  });
  const data = await res.json();
  return Response.json(data);
}

// Call reducer server-side
export async function POST(request: Request) {
  const body = await request.json();
  const res = await fetch(
    `${SPACETIMEDB_URL}/v1/database/${DB_NAME}/call/my_reducer`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([body.arg1, body.arg2]),
    }
  );
  return new Response(null, { status: res.status });
}
```
