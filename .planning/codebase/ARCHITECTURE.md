# Architecture

**Analysis Date:** 2026-04-06

## Pattern Overview

**Overall:** Dual-tier real-time application — SpacetimeDB WASM module (backend) + Next.js App Router (frontend), connected via persistent WebSocket subscriptions.

**Key Characteristics:**
- All persistent state lives in SpacetimeDB tables on maincloud; there is no traditional REST API for game data
- Clients subscribe to table data and receive live push updates — no polling
- Reducers (server-side functions) replace mutation endpoints; they are transactional and return no data
- A thin Next.js API layer (`app/api/`) exists solely for trusted server-to-server operations (Discord OAuth bridge)
- Views (`spacetimedb/src/views/`) gate per-user data access server-side — private tables are never broadcast, only exposed through views

## Layers

**SpacetimeDB Module (Backend):**
- Purpose: Single source of truth for all game and user state; processes all mutations via reducers
- Location: `spacetimedb/src/`
- Contains: Table definitions (`tables/`), reducer handlers (`reducers/`), helper utilities (`helpers/`), security/anonymous views (`views/`), types (`types/`)
- Depends on: `spacetimedb/server` SDK, internal helper modules
- Used by: Next.js frontend via generated client bindings in `src/module_bindings/`

**Generated Client Bindings:**
- Purpose: Type-safe TypeScript bridge between the frontend and SpacetimeDB module
- Location: `src/module_bindings/`
- Contains: One file per table (`*_table.ts`), one file per reducer (`*_reducer.ts`), shared types (`types.ts`, `types/`)
- Depends on: SpacetimeDB module (must republish + regenerate after schema changes)
- Used by: All frontend components and hooks that interact with backend data

**Next.js App (Frontend):**
- Purpose: UI layer — renders pages, manages client-side state, handles user interactions
- Location: `app/`, `components/`, `lib/`
- Contains: Route groups, page components, feature components, hooks, providers
- Depends on: `src/module_bindings/`, `spacetimedb/react` hooks, NextAuth, HeroUI
- Used by: End users via browser

**Next.js API Routes:**
- Purpose: Trusted server-side operations that require secrets unavailable to the browser (Discord linking, server identity calls)
- Location: `app/api/`
- Contains: `auth/[...nextauth]/route.ts` (NextAuth handler), `auth/link-discord/route.ts` (Discord→SpacetimeDB bridge)
- Depends on: `lib/spacetimedb-server.ts` (server-side SpacetimeDB singleton), NextAuth session
- Used by: Client via `fetch()` after Discord OAuth redirect

**Server Connection Singleton:**
- Purpose: Persistent SpacetimeDB WebSocket connection on the Next.js server process, authenticated as a privileged server identity
- Location: `lib/spacetimedb-server.ts`
- Contains: Lazy-initialized `DbConnection` singleton; reconnects on disconnect
- Depends on: `SPACETIMEDB_SERVER_TOKEN` environment variable, `src/module_bindings/`
- Used by: `app/api/auth/link-discord/route.ts`

## Data Flow

**Real-Time Game Data (Primary Path):**

1. On page load, `app/providers.tsx` initializes `DbConnection.builder()` with the stored auth token and connects via WebSocket to SpacetimeDB maincloud
2. `SpacetimeDBProvider` (from `spacetimedb/react`) makes the connection available to all child components
3. Feature hooks call `useTable(tables.TableName)` to subscribe to table rows; updates arrive as push deltas
4. Components render from subscribed table state — no fetch calls for game data

**Mutation Flow:**
1. UI component calls a reducer via `conn.reducers.reducerName(args)`
2. SpacetimeDB processes the reducer transactionally on the server
3. Affected table rows are broadcast back to all subscribed clients
4. React re-renders from the updated subscription state

**Discord Authentication Flow:**
1. User clicks "Connect with Discord" — `sessionStorage` intent flag is set, `signIn("discord")` is called
2. After OAuth redirect, `useAuth` detects `nextAuthStatus === "authenticated"` + intent flag
3. If no SpacetimeDB identity mapping exists yet, `loginAsGuest` reducer is called to create one
4. Client calls `POST /api/auth/link-discord` with its identity hex
5. API route verifies the NextAuth session server-side, then calls `server_link_discord` via the server identity connection
6. SpacetimeDB updates the `User` row; subscription delivers the update back to the client

**State Management:**
- No global client state store (no Redux/Zustand) — all authoritative state is in SpacetimeDB subscriptions
- React Context is used for derived auth state (`AuthContext`) and static game data (`GameDataContext`)
- `useAuth` hook in `components/features/auth/hooks/useAuth.ts` is the single auth orchestrator

## Key Abstractions

**SpacetimeDB Views:**
- Purpose: Server-computed, per-caller projections of private table data
- Examples: `spacetimedb/src/views/securityViews.ts`, `spacetimedb/src/views/anonymousViews.ts`
- Pattern: `spacetimedb.view(...)` for authenticated views (ctx.sender resolved to userId), `spacetimedb.anonymousView(...)` for public projections. Used to enforce roster visibility, private stats, and tournament organizer-only data

**Reducer Permission Guards:**
- Purpose: Consistent authorization check at the start of every reducer
- Examples: `spacetimedb/src/helpers/ensurePermissions.ts`
- Pattern: `getAuthenticatedUser(ctx)` resolves identity → user; `ensureAdmin`, `ensureModerator`, `ensureTournamentHost`, `ensureVerifiedUser` throw `SenderError` if unauthorized. Role levels: Admin=100, Moderator=75, TournamentHost=50, User=25, Guest=0

**Audit Columns:**
- Purpose: Track who created/modified every row and when
- Examples: `spacetimedb/src/helpers/auditColumns.ts`
- Pattern: `auditInsert(ctx, userId)` returns `{createdById, createdDate, lastModifiedById, lastModifiedDate}`. `auditUpdate(ctx, existing, userId)` preserves original created fields. Spread onto every INSERT/UPDATE.

**Route Groups (Next.js):**
- Purpose: Shared layout and auth guard per section without adding URL segments
- Examples: `app/(authenticated)/`, `app/(game)/`, `app/(landing-page)/`
- Pattern: `(authenticated)` wraps pages in `AuthRequired`; `(game)` wraps live draft page; `(landing-page)` is public. Each group has its own `layout.tsx`.

**GameDataProvider:**
- Purpose: Subscribe to static HSR game data (characters, lightcones, costs) once at app root and share via context
- Location: `components/features/game-data/components/GameDataProvider.tsx`
- Pattern: Subscribes to `HsrCharacter`, `HsrLightcone`, `HsrCharacterCost`, `HsrLightconeCost`, `HsrSynergyCost` tables; exposes both raw rows and mapped domain objects via `useGameData()`

## Entry Points

**Frontend App Root:**
- Location: `app/layout.tsx`
- Triggers: Next.js request for any route
- Responsibilities: Sets up fonts, global CSS, wraps all pages in `<Providers>` (SpacetimeDB connection, NextAuth session, HeroUI, AuthProvider, GameDataProvider), renders NavBar and Footer

**Provider Initialization:**
- Location: `app/providers.tsx`
- Triggers: Rendered by root layout on every page load
- Responsibilities: Builds `DbConnection` with stored token, provides WebSocket connection to the component tree, initializes NextAuth `SessionProvider` and HeroUI

**SpacetimeDB Module Entry:**
- Location: `spacetimedb/src/index.ts`
- Triggers: SpacetimeDB server on module load
- Responsibilities: Registers all reducers via exports, registers `clientConnected`/`clientDisconnected` lifecycle handlers (online status, disconnect-triggered draft pause/flag transfer)

**SpacetimeDB Schema Registry:**
- Location: `spacetimedb/src/schema.ts`
- Triggers: Imported by `index.ts`
- Responsibilities: Registers all table types with the SpacetimeDB schema builder

## Error Handling

**Strategy:** Fail-fast in reducers via `SenderError` (surfaces to client as reducer error); silent catch + console.error on client reducer calls.

**Patterns:**
- Backend: `throw new SenderError("message")` in reducers for permission/validation failures — these abort the transaction and report to the caller
- Frontend reducer calls: `try { conn.reducers.x(args) } catch (err) { console.error(...) }` — errors are logged but not surfaced in UI unless explicitly handled
- API routes: `try/catch` with `NextResponse.json({ error }, { status: 5xx })` responses
- Auth: Connection errors stored in `connectionError` from `useSpacetimeDB()`, exposed via `AuthContext`

## Cross-Cutting Concerns

**Logging:** `console.log`/`console.error` on both client and server; SpacetimeDB server logs include `clientConnected`/`clientDisconnected` events with identity hex

**Validation:** Reducer-side only — inputs validated in reducer body; client sends args and waits for subscription update or reducer error

**Authentication:** Two-layer: SpacetimeDB identity (WebSocket token stored in `localStorage`) + NextAuth Discord session (JWT cookie). These are bridged by `POST /api/auth/link-discord`. Identity resolution in reducers always goes via `UserIdentity` table: `ctx.sender → UserIdentity.identity → User.id`.

---

*Architecture analysis: 2026-04-06*
