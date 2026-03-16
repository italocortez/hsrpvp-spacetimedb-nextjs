# Codebase Structure

**Analysis Date:** 2026-03-15

## Directory Layout

```
hsrpvp-spacetimedb-nextjs/
├── app/                        # Next.js app directory (routes, API, layouts)
│   ├── (authenticated)/        # Protected routes (require auth)
│   │   ├── admin-view/
│   │   ├── lobby/
│   │   └── profile/
│   ├── (game)/                 # Game-specific routes
│   │   └── draft/[matchId]/
│   ├── (landing-page)/         # Public landing page and tools
│   │   ├── costs/
│   │   └── teambuilder/
│   ├── api/                    # API routes (NextAuth, webhooks)
│   │   └── auth/
│   ├── layout.tsx              # Root layout wrapper
│   ├── providers.tsx           # Global provider setup
│   └── globals.css             # Global styles
├── components/                 # React components (reusable + feature-specific)
│   ├── features/               # Feature modules (one per major feature)
│   │   ├── admin-view/         # Admin dashboard components
│   │   ├── auth/               # Auth-related components
│   │   ├── costs/              # Character/lightcone cost tables
│   │   ├── drafting/           # Game drafting UI (auction, classic)
│   │   ├── game-data/          # Game data providers and helpers
│   │   ├── hooks/              # Custom hooks (filters, loadouts)
│   │   ├── landing/            # Landing page components
│   │   ├── profile/            # User profile components
│   │   ├── team-builder/       # Team composition tool
│   │   └── types/              # Feature-specific types
│   └── globals/                # Global reusable components
│       ├── icons/              # Icon components
│       ├── layout/             # Layout components (Header, Footer)
│       └── modals/             # Modal components
├── lib/                        # Utilities and singleton instances
│   ├── spacetimedb.ts          # Client config (host, db name, token key)
│   └── spacetimedb-server.ts   # Server singleton connection
├── src/                        # Generated code and custom src
│   └── module_bindings/        # AUTO-GENERATED SpacetimeDB bindings
│       ├── index.ts            # Main export (tables, reducers)
│       ├── types.ts            # Generated type definitions
│       └── types/              # Type subdirectory
├── spacetimedb/                # SpacetimeDB Rust backend
│   ├── src/
│   │   ├── helpers/            # Shared backend utilities
│   │   ├── reducers/           # Transactional mutation handlers
│   │   ├── tables/             # Table definitions (schema)
│   │   ├── types/              # Type enums and structs
│   │   ├── index.ts            # Module entry, lifecycle handlers
│   │   └── schema.ts           # Database schema definition
│   ├── Cargo.toml              # Rust dependencies
│   └── tsconfig.json           # TypeScript config for codegen
├── public/                     # Static assets (images, icons)
├── scripts/                    # One-off setup scripts
├── .planning/                  # GSD documentation
│   └── codebase/               # Architecture/structure analysis
├── .claude/                    # Claude IDE configuration
├── tsconfig.json               # TypeScript config (root)
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── postcss.config.mjs          # PostCSS configuration
├── spacetime.json              # SpacetimeDB CLI config
├── package.json                # Node dependencies
└── README.md                   # Project documentation
```

## Directory Purposes

**app/ (Next.js Routes):**
- Purpose: Pages and API routes using Next.js 15+ app directory
- Contains: Page components, layouts, server actions, API handlers
- Key files: `layout.tsx` (root), `providers.tsx` (provider tree), `globals.css`

**(authenticated)/ (Protected Routes):**
- Purpose: Pages requiring user authentication
- Contains: Lobby, profile, admin-view pages
- Access: Guarded by `AuthRequired` wrapper component

**(game)/ (Game Routes):**
- Purpose: In-game experiences (drafting, match sessions)
- Contains: Draft page component with matchId parameter
- Access: Requires active match session

**(landing-page)/ (Public Pages):**
- Purpose: Public pages accessible without authentication
- Contains: Landing page, costs calculator, team builder tool
- Access: No auth required

**api/auth/ (Authentication API):**
- Purpose: NextAuth route handlers and custom auth endpoints
- Key files: `[...nextauth]/route.ts` (NextAuth handler), `link-discord/route.ts` (Discord linking)
- Used by: Frontend auth flows, Discord OAuth callbacks

**components/features/ (Feature Modules):**
- Purpose: Organize components by business feature
- Naming: One directory per major feature (drafting, costs, admin-view, etc.)
- Contains: Feature-specific components, hooks, types
- Pattern: Each feature self-contained; no cross-feature imports

**components/features/hooks/ (Custom Hooks):**
- Purpose: Reusable state and side-effect logic for components
- Key files: `useCharacterFilters.ts`, `useLightconeFilters.ts`, `useLoadouts.ts`, `useIconMaps.ts`
- Used by: Components within features that need shared logic

**components/globals/ (Global Reusable Components):**
- Purpose: Components used across multiple features or pages
- Subdirs:
  - `layout/`: Header, Footer, layout wrappers
  - `icons/`: Icon components (Honkai Star Rail characters, elements, paths)
  - `modals/`: Modal/dialog components

**lib/spacetimedb.ts:**
- Purpose: Client-side SpacetimeDB configuration constants
- Contains: HOST, DB_NAME, TOKEN_KEY computed from env vars
- Used by: `app/providers.tsx` to initialize connection

**lib/spacetimedb-server.ts:**
- Purpose: Server-side SpacetimeDB singleton connection for API routes
- Contains: `getServerConnection()` function (lazy-loaded, reused across routes)
- Used by: API routes that need to call server-only reducers (e.g., `server_link_discord`)

**src/module_bindings/ (AUTO-GENERATED):**
- Purpose: TypeScript bindings generated from SpacetimeDB schema
- Location: Generated by `npm run generate` or `spacetime generate`
- Contains:
  - `index.ts`: Main export with DbConnection class, table accessors, reducer functions
  - `types.ts`: Type definitions for all tables and data structures
  - `*_table.ts`: Individual table class files (auto-generated)
  - `*_reducer.ts`: Individual reducer function files (auto-generated)
- DO NOT EDIT: These are overwritten on every generation

**spacetimedb/src/ (Backend Schema & Logic):**
- Purpose: SpacetimeDB server-side code (Rust)
- Subdirs:
  - `tables/`: Table definitions (schema, indexes, primary keys)
  - `reducers/`: Transactional mutation handlers
  - `helpers/`: Shared utilities (audit columns, permissions)
  - `types/`: Enums and struct definitions
  - `index.ts`: Module entry point, exports reducers, lifecycle hooks

**spacetimedb/src/tables/ (Database Schema):**
- Purpose: Define data model and indexes
- Pattern: One file per table
- Key tables:
  - `user.ts`: User accounts (auth, profile, deleted flag)
  - `userIdentity.ts`: Maps SpacetimeDB identities to user IDs
  - `lobby.ts`: Lobby sessions for match drafting
  - `matchSession.ts`: Active game session state
  - `hsr*.ts`: Static Honkai Star Rail game data (characters, lightcones, costs)

**spacetimedb/src/reducers/ (Mutation Handlers):**
- Purpose: Transactional business logic (mutations only, no return values)
- Pattern: One file per domain
- Key reducers:
  - `auth.ts`: `login_as_guest`, `delete_guest_account`
  - `profile.ts`: `update_display_name`, `update_avatar`
  - `server.ts`: `server_link_discord`, `register_server` (server-only)
  - `admin.ts`: Admin CRUD operations
  - `cursor.ts`: Broadcast cursor events

**spacetimedb/src/helpers/ (Backend Utilities):**
- Purpose: Shared backend code
- Key files:
  - `auditColumns.ts`: Helpers for injecting audit fields (createdAt, createdBy, updatedAt, updatedBy)
  - `ensurePermissions.ts`: Authorization checks

## Key File Locations

**Entry Points:**

- `app/layout.tsx`: Root layout, wraps app in Providers
- `app/providers.tsx`: SpacetimeDB client setup, provider tree nesting
- `spacetimedb/src/index.ts`: Backend module entry, exports reducers, lifecycle hooks

**Configuration:**

- `next.config.ts`: Next.js build and server config
- `tailwind.config.ts`: Tailwind CSS utilities and theme
- `tsconfig.json`: TypeScript compiler config with path alias `@/*` → root
- `spacetime.json`: SpacetimeDB CLI config (module path, server)
- `.env.example`: Template for env vars (HOST, DB_NAME, SERVER_TOKEN)

**Core Logic:**

- `lib/spacetimedb.ts`: Client SpacetimeDB constants
- `lib/spacetimedb-server.ts`: Server SpacetimeDB singleton
- `spacetimedb/src/schema.ts`: Database schema definition (imports all tables)
- `spacetimedb/src/reducers/*.ts`: Business logic for mutations
- `components/features/*/components/*Provider.tsx`: Global state providers

**Testing:**

- No test files found in codebase (testing not yet set up)

## Naming Conventions

**Files:**

- **Pages:** `page.tsx` (Next.js convention)
- **Layouts:** `layout.tsx` (Next.js convention)
- **API Routes:** `route.ts` (Next.js convention)
- **Components:** PascalCase with `.tsx` extension (e.g., `CharacterCard.tsx`)
- **Hooks:** `use*` prefix (e.g., `useCharacterFilters.ts`)
- **Utilities:** camelCase (e.g., `spacetimedb.ts`)
- **Styles:** Component name + `.module.css` (e.g., `CharacterPool.module.css`)
- **Types:** PascalCase, often in `types/` subdirs or inline

**Directories:**

- **Feature directories:** kebab-case (e.g., `admin-view`, `team-builder`)
- **Component directories:** Mirrors component name in PascalCase (e.g., `components/features/drafting/components/`)
- **Table files:** snake_case matching table name (e.g., `user.ts`, `hsr_character.ts`)
- **Reducer files:** snake_case matching reducer name (e.g., `auth.ts`, `profile.ts`)

**Code Identifiers:**

- **Functions:** camelCase (e.g., `getServerConnection()`, `login_as_guest()`)
- **Variables:** camelCase (e.g., `connectionBuilder`, `guestUsername`)
- **Types:** PascalCase (e.g., `AuthContextType`, `DbConnection`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `TOKEN_KEY`, `SYSTEM_USER_ID`)
- **React Components:** PascalCase (e.g., `AuthProvider`, `CharacterCard`)

## Where to Add New Code

**New Feature (UI + Backend):**

1. **Create backend reducers:**
   - File: `spacetimedb/src/reducers/[feature].ts`
   - Pattern: `export const my_reducer = spacetimedb.reducer((ctx) => { ... })`

2. **Create or update backend tables:**
   - File: `spacetimedb/src/tables/[entity].ts`
   - Pattern: Export table with decorators for indexes

3. **Create frontend feature directory:**
   - Directory: `components/features/[feature-name]/`
   - Subdirs: `components/`, `hooks/`, `types/`

4. **Create feature components:**
   - File: `components/features/[feature-name]/components/[Component].tsx`
   - Pattern: React components, use `useSpacetimeDB()` hook for table access

5. **Create feature hooks:**
   - File: `components/features/[feature-name]/hooks/use*.ts`
   - Pattern: Custom hooks for state/side-effects

6. **Create page:**
   - File: `app/[route-group]/[feature]/page.tsx`
   - Pattern: Page component, wrap in layout with `AuthRequired` if needed

7. **Regenerate bindings:**
   - Run: `npm run generate`
   - Auto-generates `src/module_bindings/` from schema

**New Component (UI Only):**

1. If global/reusable: `components/globals/[category]/[Component].tsx`
2. If feature-specific: `components/features/[feature]/components/[Component].tsx`
3. Import and use in pages/parent components

**New Utility/Helper:**

1. **Client utility:** `lib/[name].ts` (if used across features)
2. **Backend helper:** `spacetimedb/src/helpers/[name].ts` (if used across reducers)
3. **Feature utility:** Inside feature directory as needed

**New API Route:**

1. File: `app/api/[route]/route.ts`
2. Pattern: Use `getServerConnection()` if accessing SpacetimeDB
3. Handle NextAuth session if auth-required

## Special Directories

**node_modules/:**
- Purpose: Installed npm dependencies
- Generated: Yes (run `npm install`)
- Committed: No (in .gitignore)

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes (run `npm run build` or `next dev`)
- Committed: No (in .gitignore)

**spacetimedb/node_modules/:**
- Purpose: Backend Rust dependencies compiled to WASM
- Generated: Yes (run `npm install` in spacetimedb dir)
- Committed: No

**src/module_bindings/:**
- Purpose: Auto-generated SpacetimeDB TypeScript bindings
- Generated: Yes (run `npm run generate`)
- Committed: Yes (checked in for IDE support)
- Overwrite: Every generation replaces all files

**.planning/:**
- Purpose: GSD documentation and planning
- Generated: Yes (by GSD commands)
- Committed: Yes

**.claude/, .cursor/, .vscode/:**
- Purpose: IDE configuration for Claude/Cursor/VSCode
- Generated: No (manually created)
- Committed: No (local settings)

---

*Structure analysis: 2026-03-15*
