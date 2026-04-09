# External Integrations

**Analysis Date:** 2026-04-09

## APIs & External Services

**Real-Time Database:**
- SpacetimeDB Maincloud — Primary data store and real-time sync engine for all game state
  - SDK/Client: `spacetimedb` ^2.1.0 (npm, upgraded in Phase 12.2)
  - Client transport: WebSocket (`wss://maincloud.spacetimedb.com`)
  - Client auth: SpacetimeDB identity token stored in `localStorage` under key `${HOST}/${DB_NAME}/auth_token`
  - Server auth: `SPACETIMEDB_SERVER_TOKEN` env var (trusted server identity)
  - Dashboard: `https://spacetimedb.com/@<username>/hsrpvp-spacetimedb-nextjs-test1`
  - Module: 67 tables, 44 reducer files, 32 named views
  - Energy budget: egress is dominant cost on maincloud; bandwidth-critical design patterns in use (views filter private data server-side)

**Discord:**
- Discord OAuth — User identity/authentication only (no bot, no server management, no DMs)
  - SDK/Client: `next-auth/providers/discord` (part of `next-auth` ^4.24.13)
  - Auth: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
  - Scope requested: `identify` only (fetches Discord user ID, username, avatar)
  - CDN access: `https://cdn.discordapp.com` (avatar images; explicitly allowed in CSP)
  - Bridge: Custom `POST /api/auth/link-discord` endpoint connects Discord OAuth session to SpacetimeDB identity
  - Backend reducer: `server_link_provider` (renamed from `server_link_discord` in Phase 12; generic OAuth bridge)
  - Storage: Discord ID and username stored in `UserPrivate` table (`public: false`) — NOT in the public `User` table (CR-01)

**Imgur (Indirect):**
- Screenshot hosting for match results — no API integration
  - Pattern: Players upload screenshots to Imgur externally; paste URLs into match result submission
  - Storage: Screenshot URLs stored as strings in `MatchResultGame` table (`screenshotUrl` column)
  - No server-side validation of URL format or Imgur API used

**Vercel:**
- Next.js hosting and deployment
  - Deployment: `vercel deploy` or Vercel Git integration
  - No special Vercel-specific configuration detected beyond standard Next.js `output` behavior
  - CSP header allows `wss://maincloud.spacetimedb.com` for client WebSocket connections

## Data Storage

**Databases:**
- SpacetimeDB (cloud-hosted, maincloud)
  - Client connection: `NEXT_PUBLIC_SPACETIMEDB_HOST` + `NEXT_PUBLIC_SPACETIMEDB_DB_NAME`
  - Server connection: `SPACETIMEDB_HOST` + `SPACETIMEDB_DB_NAME`
  - Client SDK pattern: `DbConnection.builder().withConfirmedReads(false).build()` (Phase 12.2)
  - Server singleton: `lib/spacetimedb-server.ts` — lazy `Promise<DbConnection>` with reconnect on disconnect
  - Schema: 67 tables covering users, tournaments, lobbies, drafts, match results, MMR, achievements, calendar, chat, leaderboards, rosters, cost sets

**File Storage:**
- None — no S3, GCS, or local file upload integration; Imgur URLs stored as plain strings

**Caching:**
- None — no Redis, Memcached, or Next.js cache directives in use; all real-time state from SpacetimeDB subscriptions

## Authentication & Identity

**Auth Provider:**
- Discord OAuth via NextAuth.js v4
  - Implementation: `app/api/auth/authOptions.ts` — `DiscordProvider` configuration
  - Session route: `app/api/auth/[...nextauth]/` (catch-all NextAuth handler)
  - Session wrapping: `SessionProvider` in `app/providers.tsx`
  - Required env: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
  - Discord ID exposed on session object as `session.user.id` (set in `session` callback; requires `(session.user as any).id` due to v4 type gap)

**SpacetimeDB Identity Linking:**
- Custom bridge: `POST /api/auth/link-discord` (`app/api/auth/link-discord/route.ts`)
  - Flow: Client completes Discord OAuth → calls endpoint with SpacetimeDB `callerIdentityHex` → server verifies NextAuth session → calls `server_link_provider` reducer via trusted server identity connection
  - Trusted server identity registered via `scripts/register-server.ts`; token stored as `SPACETIMEDB_SERVER_TOKEN`
  - Phase 12 change: Discord data now stored in `UserPrivate` (private table), not `User` public table

**Guest Auth:**
- SpacetimeDB `login_as_guest` reducer — anonymous identity without Discord link; `User.isGuest = true`

**Auth Profile Resolution (Phase 12.2):**
1. Primary: `conn.db.view_my_profile.iter()` — per-user view merging `User` + `UserPrivate` (includes `discordId`, `discordUsername`)
2. Fallback: `conn.db.User.iter()` subscription cache
3. Dead: `view_my_identity` SQL subscription removed (D-17)

## Monitoring & Observability

**Error Tracking:**
- None — no Sentry, Datadog, or similar error tracking service

**Logs:**
- `console.log` / `console.error` throughout `lib/spacetimedb-server.ts` and component hooks
- SpacetimeDB server-side logs accessible via `spacetime logs <db-name>` CLI
- Log prefixes for structured identification: `[DISCONNECT]`, `[IDENTITY_GC]`

## CI/CD & Deployment

**Hosting:**
- Vercel (Next.js frontend)
- SpacetimeDB maincloud (backend module)

**CI Pipeline:**
- Not present — no `.github/workflows/`, no CircleCI, no GitLab CI config

**Deployment flow:**
1. Backend: `spacetime publish --module-path spacetimedb --server maincloud` (from root)
2. Generate bindings: `npm run spacetime:generate` (regenerates `src/module_bindings/`)
3. Frontend: `vercel deploy` or git push to Vercel-connected branch

## Environment Configuration

**Required env vars (from `.env.example`):**
- `NEXT_PUBLIC_SPACETIMEDB_HOST` — WebSocket URL for client-side connection (e.g., `wss://maincloud.spacetimedb.com`)
- `NEXT_PUBLIC_SPACETIMEDB_DB_NAME` — Database name exposed to browser
- `SPACETIMEDB_HOST` — WebSocket URL for server-side (API route) connection
- `SPACETIMEDB_DB_NAME` — Database name for server-side connection
- `SPACETIMEDB_SERVER_TOKEN` — Auth token for the trusted server identity (never expose to client)
- `DISCORD_CLIENT_ID` — Discord OAuth app client ID
- `DISCORD_CLIENT_SECRET` — Discord OAuth app client secret
- `NEXTAUTH_SECRET` — NextAuth session signing secret
- `NEXTAUTH_URL` — Public URL of the app (e.g., `http://localhost:3001` for dev)

**Secrets location:**
- `.env.local` (git-ignored, never committed per CLAUDE.md rule)
- `.env.example` is the canonical reference and IS committed

## Client-Side Integration Architecture

Provider stack in `app/providers.tsx`:

1. `SessionProvider` (NextAuth) — Discord session management
2. `HeroUIProvider` (HeroUI) — UI theme and component registry
3. `SpacetimeDBProvider` (SpacetimeDB SDK 2.1.0) — Real-time WebSocket connection; built with `.withConfirmedReads(false)` since Phase 12.2
4. `AuthProvider` (custom) — Bridges Discord session + SpacetimeDB identity; reads `view_my_profile` as primary auth source
5. `GameDataProvider` (custom) — App-level game data subscriptions (characters, lightcones, costs)

## Out of Scope Integrations

The following integrations were explicitly descoped:
- **HoYoverse API** — roster import deferred; API availability uncertain
- **Computer vision** — screenshot roster import deferred; high complexity
- **Voice/video chat** — out of platform scope
- **Payment/monetization** — not needed
- **Email notifications** — not planned

---

*Integration audit: 2026-04-09 (updated from 2026-04-06 to reflect Phase 12 UserPrivate, Phase 12 server_link_provider rename, Phase 12.2 withConfirmedReads(false) and view_my_profile primary auth)*
