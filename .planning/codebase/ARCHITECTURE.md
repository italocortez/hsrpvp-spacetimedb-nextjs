# Architecture

**Analysis Date:** 2026-03-15

## Pattern Overview

**Overall:** Full-stack real-time multiplayer application using Next.js 15 (App Router) on the frontend and SpacetimeDB as a WebSocket-based real-time database/backend.

**Key Characteristics:**
- SpacetimeDB replaces a traditional REST API + database stack. All persistent state lives in SpacetimeDB tables, mutated exclusively by server-side reducers.
- The Next.js frontend connects to SpacetimeDB directly via WebSocket (client-side) and subscribes to table data reactively via `useTable` hooks from `spacetimedb/react`.
- A trusted server identity (Next.js API route + `lib/spacetimedb-server.ts` singleton) calls privileged reducers that the browser client cannot call directly (Discord linking, role management).
- No traditional REST endpoints for game/user data — all reads come from live SpacetimeDB table subscriptions pushed to the client.

## Layers

**SpacetimeDB Backend:**
- Purpose: Persistent data storage, all game logic, all writes
- Location: `spacetimedb/src/`
- Contains: Table definitions (`tables/`), reducer functions (`reducers/`), shared type definitions (`types/`)
- Depends on: `spacetimedb/server` SDK
- Used by: Frontend via generated client bindings, Next.js API routes via server connection

**Generated Client Bindings:**
- Purpose: Type-safe TypeScript interface to the SpacetimeDB module
- Location: `src/module_bindings/`
- Contains: Auto-generated table accessors, reducer call stubs, `DbConnection` class
- Depends on: SpacetimeDB backend schema (regenerated after each publish via `spacetime generate`)
- Used by: All frontend code that reads data or invokes reducers

**Next.js App (Frontend):**
- Purpose: UI rendering, routing, React state, user interactions
- Location: `app/` (pages/routes), `components/` (feature logic + UI)
- Contains: Route groups, page components, feature hooks, context providers, global layout
- Depends on: Generated bindings, `spacetimedb/react` hooks, NextAuth.js

**Next.js API Routes (Trusted Server Bridge):**
- Purpose: Perform privileged SpacetimeDB operations that require server-side validation (e.g., verifying Discord OAuth before calling trusted reducers)
- Location: `app/api/`
- Contains: `app/api/auth/[...nextauth]/route.ts` (NextAuth handler), `app/api/auth/link-discord/route.ts` (Discord → SpacetimeDB link bridge)
- Depends on: `lib/spacetimedb-server.ts`, NextAuth session
- Used by: Client-side `useAuth` hook via `fetch('/api/auth/link-discord')`

**Global Library:**
- Purpose: Shared configuration constants accessible anywhere in the Next.js app
- Location: `lib/`
- Key files:
  - `lib/spacetimedb.ts` — exports `SPACETIMEDB_HOST`, `SPACETIMEDB_DB_NAME`, `SPACETIMEDB_TOKEN_KEY`
  - `lib/spacetimedb-server.ts` — exports `getServerConnection()` singleton for API routes

## Data Flow

**User Authentication (Guest):**

1. Browser connects to SpacetimeDB via WebSocket (`app/providers.tsx` → `DbConnection.builder()`)
2. SpacetimeDB token is read from `localStorage` on connect; saved on `onConnect` callback
3. `AuthProvider` wraps the app; `useAuth` hook subscribes to `UserIdentity` and `User` tables
4. If no `UserIdentity` mapping exists, user clicks "Login as Guest" → `conn.reducers.loginAsGuest({})` reducer creates `User` + `UserIdentity` rows
5. SpacetimeDB pushes the new rows to the client subscription; `useAuth` derives `currentUser` and `authState`

**User Authentication (Discord OAuth):**

1. User clicks "Connect with Discord" → `sessionStorage.setItem('discord_login_intent', '1')` → `signIn("discord")` via NextAuth
2. After OAuth redirect, NextAuth stores Discord session in cookie
3. `useAuth` detects `nextAuthStatus === 'authenticated'` + `discord_login_intent` flag
4. Client calls `loginAsGuest` first (if no mapping) to create `UserIdentity`
5. Client posts to `POST /api/auth/link-discord` with its `identity.toHexString()`
6. API route verifies Discord session server-side, then calls `conn.reducers.serverLinkDiscord(...)` via the trusted server connection
7. SpacetimeDB reducer upgrades the guest `User` to a Discord-linked user; subscription update propagates back to client

**Game Data Flow (Read-only static data):**

1. `GameDataProvider` subscribes to `HsrCharacter`, `HsrLightcone`, `HsrCharacterCost`, `HsrLightconeCost`, `HsrSynergyCost` tables via `useTable`
2. SpacetimeDB pushes all rows on initial subscription
3. `GameDataProvider` maps raw rows to typed `Character[]`, `Lightcone[]`, `Synergy[]` via helper functions in `components/features/game-data/components/DataHelpers`
4. All feature components access game data via `useGameData()` hook — no duplicate fetches

**Draft/Match Flow:**

1. Lobby created → `Lobby` row inserted; `LobbyMember` rows track participants
2. When draft starts, `MatchSession` row is created (keyed by `lobbyId`)
3. `MatchSessionStep` rows record each pick/ban action with typed `StepPayload` union
4. Draft hooks (`useDraftState`, `useDraftActions`, `useDraftTimer`) subscribe to `MatchSession` and `MatchSessionStep` tables
5. On completion, `MatchSessionHistory` + `MatchSessionStepHistory` rows are written for persistence

**State Management:**
- No Redux or Zustand. All shared state flows through React Context providers:
  - `SpacetimeDBProvider` (from `spacetimedb/react`) — connection + subscriptions root
  - `AuthProvider` — current user and auth actions (`useAuthContext()`)
  - `GameDataProvider` — all HSR game data (`useGameData()`)
- Local component state managed via `useState`/`useReducer` within feature hooks

## Key Abstractions

**SpacetimeDB Table → React Context Pipeline:**
- Purpose: Convert live SpacetimeDB table subscriptions into React-accessible context
- Examples: `components/features/auth/components/AuthProvider.tsx`, `components/features/game-data/components/GameDataProvider.tsx`
- Pattern: `useTable(tables.X)` → transform rows → provide via `createContext` / custom hook

**Reducer Invocation:**
- Purpose: Mutate server state
- Examples: `conn.reducers.loginAsGuest({})`, `conn.reducers.deleteGuestAccount({}`
- Pattern: Get connection via `useSpacetimeDB().getConnection()` → call `conn.reducers.<reducerName>(args)`. Never expect return values; observe table subscription updates instead.

**Trusted Server Identity:**
- Purpose: Authorize privileged operations that the browser must not call directly
- Examples: `server_link_discord`, `server_set_role`, `server_delete_user`
- Pattern: Next.js API route verifies external session → calls `getServerConnection()` → calls reducer under registered server identity. Reducer calls `requireServer(ctx)` to validate the caller.

**Feature Module:**
- Purpose: Self-contained vertical slice of functionality
- Examples: `components/features/auth/`, `components/features/drafting/`, `components/features/profile/`
- Pattern: Each feature folder contains `components/` (presentational + context), `hooks/` (logic), and optionally `types/` (feature-local types)

## Entry Points

**Browser App Entry:**
- Location: `app/layout.tsx`
- Triggers: Every Next.js page load
- Responsibilities: Sets up `Providers` (SessionProvider → HeroUIProvider → SpacetimeDBProvider → AuthProvider → GameDataProvider), renders `Header`, `main`, `Footer`

**SpacetimeDB Module Entry:**
- Location: `spacetimedb/src/index.ts`
- Triggers: Module publish to SpacetimeDB
- Responsibilities: Registers schema, exports all reducers, registers `clientConnected`/`clientDisconnected` lifecycle hooks

**Next.js API Auth Entry:**
- Location: `app/api/auth/[...nextauth]/route.ts`
- Triggers: NextAuth OAuth callbacks (Discord)
- Responsibilities: Delegates to `authOptions` for session management

## Error Handling

**Strategy:** Localized try/catch within hooks and API routes. No global error boundary enforced.

**Patterns:**
- Reducer calls wrapped in `try/catch` inside hook callbacks: `conn.reducers.loginAsGuest({})` in `useAuth`
- API routes return `NextResponse.json({ error })` with appropriate HTTP status codes
- SpacetimeDB connection errors surfaced via `connectionError` from `useSpacetimeDB()`; exposed via `AuthContext`
- Reducer-level errors use `throw new SenderError(...)` from `spacetimedb/server`

## Cross-Cutting Concerns

**Logging:** `console.log` / `console.error` directly. No structured logging library.
**Validation:** Input validation inside reducers via explicit checks + `SenderError`. No Zod or similar on frontend.
**Authentication:** Two-layer — SpacetimeDB identity (token in `localStorage`) for real-time connection; NextAuth Discord OAuth for account linking. Access control enforced in both Next.js route layouts (client-side role check) and SpacetimeDB reducers (`requireServer`, role checks).

---

*Architecture analysis: 2026-03-15*
