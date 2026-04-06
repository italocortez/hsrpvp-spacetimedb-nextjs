# External Integrations

**Analysis Date:** 2026-04-06

## APIs & External Services

**Real-Time Database:**
- SpacetimeDB Maincloud - Primary data store and real-time sync engine for all game state
  - SDK/Client: `spacetimedb` ^2.0.3 (npm)
  - Client transport: WebSocket (`wss://maincloud.spacetimedb.com`)
  - Client auth: SpacetimeDB identity token stored in `localStorage` under key `${HOST}/${DB_NAME}/auth_token`
  - Server auth: `SPACETIMEDB_SERVER_TOKEN` env var (trusted server identity)
  - Dashboard: `https://spacetimedb.com/@<username>/hsrpvp-spacetimedb-nextjs-test1`

**Discord:**
- Discord OAuth - User identity/authentication only (no bot, no server management)
  - SDK/Client: `next-auth/providers/discord` (part of `next-auth` ^4.24.13)
  - Auth: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
  - Scope requested: `identify` only (fetches Discord user ID, username, avatar)
  - CDN access: `https://cdn.discordapp.com` (avatar images; explicitly allowed in CSP)

## Data Storage

**Databases:**
- SpacetimeDB (cloud-hosted, maincloud)
  - Connection: `NEXT_PUBLIC_SPACETIMEDB_HOST` (client) / `SPACETIMEDB_HOST` (server)
  - Database name: `NEXT_PUBLIC_SPACETIMEDB_DB_NAME` / `SPACETIMEDB_DB_NAME`
  - Client: `spacetimedb` SDK — `DbConnection.builder()` pattern; bindings generated to `src/module_bindings/`
  - Server singleton: `lib/spacetimedb-server.ts` — lazy `Promise<DbConnection>` with reconnect on disconnect
  - Schema: ~50+ tables defined in `spacetimedb/src/schema.ts`, covering users, tournaments, lobbies, drafts, match results, MMR, achievements, calendar, chat, leaderboards

**File Storage:**
- Not detected (no S3, GCS, or local file upload integration)

**Caching:**
- None detected (no Redis, Memcached, or Next.js cache directives in use)

## Authentication & Identity

**Auth Provider:**
- Discord OAuth via NextAuth.js
  - Implementation: `app/api/auth/authOptions.ts` — `DiscordProvider` configuration
  - Session route: `app/api/auth/[...nextauth]/` (catch-all NextAuth handler)
  - Session wrapping: `SessionProvider` in `app/providers.tsx`
  - Required env: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - Discord ID exposed on session object as `session.user.id` (set in `session` callback)

**SpacetimeDB Identity Linking:**
- Custom bridge: `POST /api/auth/link-discord` (`app/api/auth/link-discord/route.ts`)
  - Flow: Client completes Discord OAuth → calls this endpoint with its SpacetimeDB `callerIdentityHex` → server verifies NextAuth session → calls `server_link_discord` reducer on SpacetimeDB via trusted server connection
  - Trusted server identity registered via `scripts/register-server.ts`; token stored as `SPACETIMEDB_SERVER_TOKEN`

**Guest Auth:**
- SpacetimeDB `login_as_guest` reducer — anonymous identity without Discord link

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry, Datadog, or similar)

**Logs:**
- `console.log` / `console.error` throughout `lib/spacetimedb-server.ts` and component hooks
- SpacetimeDB server-side logs accessible via `spacetime logs <db-name>` CLI

## CI/CD & Deployment

**Hosting:**
- Vercel (detected via active Vercel plugin in tooling environment)

**CI Pipeline:**
- Not detected in repo (no `.github/workflows/`, no CircleCI, no GitLab CI config found)

## Environment Configuration

**Required env vars (from `.env.example`):**
- `NEXT_PUBLIC_SPACETIMEDB_HOST` — WebSocket URL for client-side SpacetimeDB connection (e.g., `wss://maincloud.spacetimedb.com`)
- `NEXT_PUBLIC_SPACETIMEDB_DB_NAME` — Database name exposed to browser
- `SPACETIMEDB_HOST` — WebSocket URL for server-side (API route) connection
- `SPACETIMEDB_DB_NAME` — Database name for server-side connection
- `SPACETIMEDB_SERVER_TOKEN` — Auth token for the trusted server identity (never expose to client)
- `DISCORD_CLIENT_ID` — Discord OAuth app client ID
- `DISCORD_CLIENT_SECRET` — Discord OAuth app client secret
- `NEXTAUTH_SECRET` — NextAuth session signing secret
- `NEXTAUTH_URL` — Public URL of the app (e.g., `http://localhost:3000`)

**Secrets location:**
- `.env.local` (git-ignored, never committed per project rules)
- `.env.example` is the canonical reference and IS committed

## Webhooks & Callbacks

**Incoming:**
- None detected (no webhook receivers beyond the standard NextAuth OAuth callback at `/api/auth/callback/discord`)

**Outgoing:**
- None detected (no outgoing webhook calls to external services)

## Client-Side Integration Architecture

The app uses a provider-stack pattern in `app/providers.tsx`:

1. `SessionProvider` (NextAuth) — Discord session
2. `HeroUIProvider` (HeroUI) — UI theme
3. `SpacetimeDBProvider` (SpacetimeDB SDK) — Real-time WebSocket connection, built from `DbConnection.builder()` with localStorage token persistence
4. `AuthProvider` (custom, `components/features/auth/`) — Bridges Discord session + SpacetimeDB identity
5. `GameDataProvider` (custom, `components/features/game-data/`) — App-level game data subscriptions

---

*Integration audit: 2026-04-06*
