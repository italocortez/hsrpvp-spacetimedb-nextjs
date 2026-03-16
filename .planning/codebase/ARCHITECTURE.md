# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** Distributed client-server architecture with SpacetimeDB as the realtime multiplayer backend and Next.js as the frontend framework.

**Key Characteristics:**
- Client-driven state sync via SpacetimeDB subscriptions (reactive, not server-polled)
- Transactional reducers on the backend (no return values, mutations only)
- NextAuth for authentication with Discord OAuth integration
- Real-time cursor/movement events and game state synchronization
- Audit trail on all user-facing tables (createdAt, createdBy, updatedAt, updatedBy)
- Lazy server connection for API routes (singleton pattern)

## Layers

**Presentation Layer:**
- Purpose: React components, pages, layouts rendered by Next.js
- Location: `app/`, `components/`
- Contains: Page components, feature-specific UI components, layout wrappers
- Depends on: React Context (AuthProvider, GameDataProvider), SpacetimeDB client bindings, Next.js routing
- Used by: Browser clients, nextauth callbacks

**API/Backend Layer:**
- Purpose: Server-side business logic, authentication flows, webhooks
- Location: `app/api/`
- Contains: NextAuth route handlers, Discord OAuth linking, server reducers
- Depends on: SpacetimeDB server connection, NextAuth session
- Used by: Presentation layer via fetch, external services via webhooks

**State Management Layer:**
- Purpose: Global state, hooks, context providers
- Location: `components/features/*/components/*Provider.tsx`, `components/features/hooks/`
- Contains: AuthProvider, GameDataProvider, custom hooks for data access
- Depends on: SpacetimeDB client subscriptions, React Context
- Used by: All consuming components

**Database Layer:**
- Purpose: SpacetimeDB backend - schema, tables, reducers, lifecycle hooks
- Location: `spacetimedb/src/`
- Contains: Table definitions, reducers (transactional mutations), client lifecycle handlers
- Depends on: SpacetimeDB runtime
- Used by: Client via generated bindings, server via singleton connection

**Bindings Layer:**
- Purpose: Generated TypeScript client bindings from SpacetimeDB schema
- Location: `src/module_bindings/`
- Contains: Auto-generated table classes, reducer stubs, type definitions
- Depends on: SpacetimeDB server schema
- Used by: All client code that reads/writes data

## Data Flow

**User Login Flow:**

1. Browser visits app → `app/layout.tsx` wraps in `Providers` component
2. `Providers` connects SpacetimeDB client via `DbConnection.builder()` (`app/providers.tsx`)
3. SpacetimeDB client auto-connects and authenticates with token from localStorage
4. On successful connection, `onConnect` callback stores token and logs identity (`app/providers.tsx`)
5. NextAuth handles Discord OAuth callback at `app/api/auth/[...nextauth]/route.ts`
6. Server reducer `server_link_discord` links Discord account to user via server connection (`spacetimedb/src/reducers/server.ts`)
7. `AuthProvider` context wraps components, provides `useAuthContext()` hook
8. Components guard auth-required routes with `AuthRequired` wrapper (`components/features/auth/components/AuthRequired.tsx`)

**Game Session Data Flow:**

1. Component calls reducer via generated stub: `MyReducer.reducer(args)` (e.g., `login_as_guest.login_as_guest()`)
2. Client sends mutation request to SpacetimeDB server
3. Server executes reducer transactionally: `spacetimedb.reducer((ctx) => { ... })`
4. Reducer mutates tables via `ctx.db.TableName.operation()`
5. On completion, server broadcasts table row changes to all subscribed clients
6. Client receives updates in real-time, components re-render via React hooks

**Cursor Broadcast Flow:**

1. Component detects user input/movement event
2. Calls `broadcast_cursor` reducer with position data
3. Server stores cursor event in `LobbyCursorEvent` table with audit columns
4. Server emits to all lobby members via subscription
5. All clients see cursor position update in real-time

**Admin/Server Operations:**

1. Server needs to call trusted reducers (e.g., Discord linking)
2. Server uses singleton connection via `getServerConnection()` (`lib/spacetimedb-server.ts`)
3. Connection authenticates with `SPACETIMEDB_SERVER_TOKEN` from `.env.local`
4. Server calls reducers: `conn.server_link_discord(discordId, userId)`
5. Reducers verify caller identity with `requireServer()` helper
6. Returns nothing; client/caller reads result via table subscriptions

**State Management:**

- SpacetimeDB acts as source of truth (optimistic updates on client)
- Each component/hook subscribes to specific tables it needs
- Subscriptions are reactive - React re-renders when tables change
- GameDataProvider abstracts character/lightcone cost data access
- AuthProvider provides session and user context globally

## Key Abstractions

**DbConnection (SpacetimeDB Client):**
- Purpose: Establishes and maintains WebSocket connection to SpacetimeDB server
- Examples: `lib/spacetimedb.ts`, `app/providers.tsx`
- Pattern: Builder pattern with fluent API for configuration, connection lifecycle callbacks

**Reducers (Backend Mutations):**
- Purpose: Transactional, deterministic mutations of database state
- Examples: `spacetimedb/src/reducers/auth.ts`, `spacetimedb/src/reducers/profile.ts`
- Pattern: `spacetimedb.reducer((ctx) => { ctx.db.Table.operation(...) })`
- Key rule: Reducers never return data to callers; they only mutate state

**Tables (SpacetimeDB Data Model):**
- Purpose: Define schema, indexes, and primary keys
- Examples: `spacetimedb/src/tables/user.ts`, `spacetimedb/src/tables/lobby.ts`
- Pattern: TypeScript classes with decorators for indexes and primary keys

**Audit Columns:**
- Purpose: Track who created/updated each row and when
- Implementation: `spacetimedb/src/helpers/auditColumns.ts`
- Used by: All mutation helpers inject `auditInsert()` and `auditUpdate()`
- Fields: `createdAt`, `createdBy`, `updatedAt`, `updatedBy` on all user-facing tables

**Context Providers:**
- Purpose: Global application state and configuration
- Examples: `AuthProvider`, `GameDataProvider`, `SessionProvider`
- Pattern: React Context with custom hooks for consumption
- Nested hierarchy: SessionProvider → HeroUIProvider → SpacetimeDBProvider → AuthProvider → GameDataProvider

**Generated Bindings:**
- Purpose: Auto-generated TypeScript stubs for table access and reducer calls
- Location: `src/module_bindings/`
- Pattern: Table classes with CRUD methods, reducer functions with typed arguments
- Refresh: `npm run generate` regenerates from SpacetimeDB schema

## Entry Points

**Frontend Root:**
- Location: `app/layout.tsx`
- Triggers: Browser navigation to any URL path
- Responsibilities: Wrap application in providers, configure global styles, set metadata

**Authentication Entry:**
- Location: `app/api/auth/[...nextauth]/route.ts`
- Triggers: NextAuth callback, Discord OAuth redirects
- Responsibilities: Handle authentication flow, create sessions, call server-side reducers

**Landing Page:**
- Location: `app/(landing-page)/page.tsx`
- Triggers: GET / (root path)
- Responsibilities: Serve public landing page, redirect to appropriate next page based on auth state

**Authenticated Routes:**
- Location: `app/(authenticated)/*/page.tsx`
- Triggers: Authenticated users navigating to protected routes
- Responsibilities: Require auth via `AuthRequired` wrapper, load user-specific data

**Draft Game:**
- Location: `app/(game)/draft/[matchId]/page.tsx`
- Triggers: User joins a draft match
- Responsibilities: Load match session, subscribe to real-time updates, render game UI

**Backend Setup:**
- Location: `spacetimedb/src/index.ts`
- Triggers: SpacetimeDB server starts
- Responsibilities: Register reducers, export public reducer interface, attach lifecycle hooks (clientConnected/clientDisconnected)

## Error Handling

**Strategy:** Try-catch with SenderError for authorization, promise-based for async operations

**Patterns:**

- Server reducers throw `SenderError` for authorization failures (e.g., `requireServer()` check)
- Client connection errors logged to console, caller app handles gracefully
- Failed mutations rejected in promise chain, caller responsible for retry/fallback
- API routes use Next.js error handling (throw Error, caught by error.tsx or default error page)
- Guest account cleanup via background job in `UserDeletionJob` table and `run_user_deletion` reducer

## Cross-Cutting Concerns

**Logging:** Console logging only. Server logs client connections/disconnections. Errors logged to console.

**Validation:**
- Input validation in reducers (check args match expected types)
- Authorization via identity checks (`ctx.sender` for clients, `ServerIdentity` for server)
- No explicit schema validation; SpacetimeDB enforces table structure

**Authentication:**
- Discord OAuth via NextAuth (session-based)
- SpacetimeDB identity (ephemeral per connection, stored in `UserIdentity` table)
- Server token via `SPACETIMEDB_SERVER_TOKEN` env var for trusted operations
- Guest login via `login_as_guest` reducer (creates User + UserIdentity mapping)

---

*Architecture analysis: 2026-03-15*
