# Codebase Structure

**Analysis Date:** 2026-04-06

## Directory Layout

```
hsrpvp-spacetimedb-nextjs/
├── app/                        # Next.js App Router — pages and API routes
│   ├── (authenticated)/        # Route group: auth-gated pages (lobby, profile, admin)
│   ├── (game)/                 # Route group: live draft page
│   ├── (landing-page)/         # Route group: public pages (home, costs, teambuilder)
│   ├── api/                    # Server-side API routes
│   │   └── auth/               # NextAuth handler + Discord link endpoint
│   ├── layout.tsx              # Root layout (fonts, Providers, NavBar, Footer)
│   ├── providers.tsx           # Client providers tree (SpacetimeDB, NextAuth, HeroUI)
│   ├── globals.css             # Global styles
│   └── tokens.css              # Design token CSS variables
├── components/                 # Reusable React components
│   ├── features/               # Feature-scoped components
│   │   ├── admin-view/         # Admin panel components
│   │   ├── auth/               # Auth components, hooks, types
│   │   ├── costs/              # Cost table display components
│   │   ├── drafting/           # Draft UI: classic + auction modes
│   │   ├── game-data/          # GameDataProvider + mapping helpers
│   │   ├── hooks/              # Shared feature hooks (filters, loadouts, icons)
│   │   ├── landing/            # Landing page section components
│   │   ├── profile/            # Profile card + Discord link components
│   │   ├── team-builder/       # Team roster builder components
│   │   └── types/              # Shared frontend types (enums, structs, tableColumns)
│   └── globals/                # App-wide shared components
│       ├── icons/              # Icon components
│       ├── layout/             # NavBar, Footer, Logo, GearIcon
│       └── modals/             # Global modal components
├── src/
│   └── module_bindings/        # Generated SpacetimeDB TypeScript bindings (DO NOT EDIT)
│       ├── index.ts            # Barrel export for all bindings
│       ├── types.ts            # Shared binding types
│       ├── types/              # procedures.ts, reducers.ts
│       ├── *_table.ts          # One file per SpacetimeDB table
│       └── *_reducer.ts        # One file per SpacetimeDB reducer
├── spacetimedb/                # SpacetimeDB module source (TypeScript → WASM)
│   ├── src/
│   │   ├── index.ts            # Module entry: reducer exports, lifecycle hooks
│   │   ├── schema.ts           # Table registration with SpacetimeDB schema()
│   │   ├── tables/             # Table definitions (one file per table)
│   │   ├── reducers/           # Reducer implementations (grouped by domain)
│   │   ├── helpers/            # Shared server-side utilities
│   │   ├── views/              # Security and anonymous views
│   │   └── types/              # Server-side enums and structs
│   ├── dist/                   # Compiled JS output (generated, committed)
│   └── package.json            # Separate package for the module
├── lib/
│   ├── spacetimedb.ts          # Client-side connection constants (host, db name, token key)
│   └── spacetimedb-server.ts   # Server-side SpacetimeDB connection singleton
├── test/
│   └── backend/                # Integration and unit tests for the SpacetimeDB module
│       ├── achievements/
│       ├── anonymous-play/
│       ├── brackets/
│       ├── calendar/
│       ├── chat/
│       ├── cost-sets/
│       ├── lobby/
│       ├── match-results/
│       ├── match-session/
│       └── roster/
├── docs/                       # Feature documentation
│   └── {feature}/              # Per-feature: architecture.md + contract.md
├── public/                     # Static assets served by Next.js
├── scripts/                    # One-off setup scripts (e.g., register-server.ts)
├── tools/                      # Development tooling
├── notes/                      # Developer notes and UAT report cards
├── .planning/                  # GSD project planning artifacts
├── next.config.ts              # Next.js configuration (CSP headers, port 3001)
├── tsconfig.json               # TypeScript config (@/* alias maps to repo root)
├── tailwind.config.ts          # Tailwind CSS configuration
├── spacetime.json              # SpacetimeDB CLI project config (maincloud)
└── package.json                # Root npm package (Next.js app)
```

## Directory Purposes

**`app/(authenticated)/`:**
- Purpose: Auth-gated pages requiring a logged-in SpacetimeDB user
- Contains: `lobby/page.tsx`, `profile/page.tsx`, `admin-view/page.tsx`, shared `layout.tsx` (wraps in `AuthRequired`)
- Key files: `app/(authenticated)/layout.tsx` (auth guard), `app/(authenticated)/lobby/page.tsx`, `app/(authenticated)/profile/page.tsx`

**`app/(game)/`:**
- Purpose: Live in-match draft interface, accessible by match participants
- Contains: `draft/[matchId]/page.tsx` — dynamic route for active draft sessions
- Key files: `app/(game)/draft/[matchId]/page.tsx`

**`app/(landing-page)/`:**
- Purpose: Public-facing pages (no auth required)
- Contains: Home page, costs reference page, team builder tool
- Key files: `app/(landing-page)/page.tsx`, `app/(landing-page)/costs/page.tsx`, `app/(landing-page)/teambuilder/page.tsx`

**`app/api/auth/`:**
- Purpose: Server-side auth endpoints
- Contains: NextAuth catch-all handler, Discord-to-SpacetimeDB identity linker
- Key files: `app/api/auth/[...nextauth]/route.ts`, `app/api/auth/link-discord/route.ts`, `app/api/auth/authOptions.ts`

**`components/features/`:**
- Purpose: Feature-scoped components organized by domain, each with `components/`, `hooks/`, and optionally `types.ts`
- Contains: One subdirectory per feature area
- Key files: `components/features/auth/hooks/useAuth.ts`, `components/features/game-data/components/GameDataProvider.tsx`, `components/features/drafting/hooks/useDraftState.ts`

**`components/globals/`:**
- Purpose: App-wide shared UI components not tied to any feature
- Contains: Navigation, layout chrome, icons, modals
- Key files: `components/globals/layout/NavBar.tsx`, `components/globals/layout/Footer.tsx`

**`src/module_bindings/`:**
- Purpose: Auto-generated TypeScript client bindings for the SpacetimeDB module — regenerated with `spacetime generate` after every publish
- Contains: Table subscription classes, reducer call classes, shared types
- Key files: `src/module_bindings/index.ts` (import `tables` and `DbConnection` from here)
- Generated: Yes — never edit these files manually

**`spacetimedb/src/tables/`:**
- Purpose: SpacetimeDB table schema definitions
- Contains: One TypeScript file per table; each exports a `Table` class with column types and indexes
- Key files: `spacetimedb/src/tables/user.ts`, `spacetimedb/src/tables/lobby.ts`, `spacetimedb/src/tables/matchSession.ts`

**`spacetimedb/src/reducers/`:**
- Purpose: Server-side mutation handlers grouped by domain
- Contains: Domain-grouped files (e.g., `lobbyLifecycle.ts`, `draftClassic.ts`, `tournamentManagement.ts`)
- Key files: `spacetimedb/src/reducers/auth.ts`, `spacetimedb/src/reducers/lobbyLifecycle.ts`, `spacetimedb/src/reducers/matchFinalization.ts`

**`spacetimedb/src/helpers/`:**
- Purpose: Shared server-side utilities called by reducers
- Contains: Permission guards, audit columns, draft sequences, bracket logic, ELO calculation, flag transfer
- Key files: `spacetimedb/src/helpers/ensurePermissions.ts`, `spacetimedb/src/helpers/auditColumns.ts`, `spacetimedb/src/helpers/eloCalculation.ts`

**`spacetimedb/src/views/`:**
- Purpose: Server-computed data projections — per-user views for private tables, anonymous views for public browsing
- Contains: `securityViews.ts` (22 named views for roster visibility, auth, tournament organizer access), `anonymousViews.ts` (history/draft replay views)
- Key files: `spacetimedb/src/views/securityViews.ts`

**`test/backend/`:**
- Purpose: Integration tests for the SpacetimeDB module, grouped by feature domain
- Contains: `*.test.ts` (integration tests against a live/test module), `*.unit.test.ts` (pure logic unit tests)
- Key files: `test/backend/lobby/lobby-lifecycle.test.ts`, `test/backend/match-session/draft-classic.test.ts`

**`docs/{feature}/`:**
- Purpose: Per-feature documentation — architecture diagrams and acceptance contracts
- Contains: `architecture.md` (table relationships, reducer reference), `contract.md` (Given/When/Then specs)
- Key files: `docs/tournament/architecture.md`, `docs/lobby/contract.md`, `docs/match-session/architecture.md`

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root Next.js layout — all pages pass through here
- `app/providers.tsx`: SpacetimeDB connection initialization and React context tree
- `spacetimedb/src/index.ts`: SpacetimeDB module entry — reducer exports and lifecycle hooks

**Configuration:**
- `next.config.ts`: Next.js config (CSP security headers, runs on port 3001)
- `tsconfig.json`: TypeScript config with `@/*` path alias (root-relative)
- `tailwind.config.ts`: Tailwind CSS configuration
- `spacetime.json`: SpacetimeDB CLI config (maincloud server, database name)
- `lib/spacetimedb.ts`: Client-side connection constants (`SPACETIMEDB_HOST`, `SPACETIMEDB_DB_NAME`, `SPACETIMEDB_TOKEN_KEY`)

**Core Logic:**
- `spacetimedb/src/schema.ts`: Complete table registry
- `spacetimedb/src/helpers/ensurePermissions.ts`: Role-based permission guards for all reducers
- `spacetimedb/src/helpers/auditColumns.ts`: Audit field helpers (createdById/Date, lastModifiedById/Date)
- `components/features/auth/hooks/useAuth.ts`: Auth state machine (SpacetimeDB identity + NextAuth Discord session)
- `components/features/game-data/components/GameDataProvider.tsx`: Static HSR game data context

**Testing:**
- `test/backend/`: All backend integration and unit tests
- `test/README.md`: Test setup and harness documentation

## Naming Conventions

**Files:**
- Next.js pages: `page.tsx`, `layout.tsx` (Next.js convention)
- Next.js API routes: `route.ts`
- React components: PascalCase (`AuthProvider.tsx`, `CharacterPool.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`, `useDraftState.ts`)
- CSS modules: Same name as component (`AuthRequired.module.css`)
- SpacetimeDB tables: camelCase (`lobbyMember.ts`, `matchSession.ts`)
- SpacetimeDB reducers: camelCase grouped by domain (`lobbyLifecycle.ts`, `draftClassic.ts`)
- SpacetimeDB helpers: camelCase descriptive (`ensurePermissions.ts`, `auditColumns.ts`)
- Generated bindings: snake_case (matches SpacetimeDB naming: `lobby_member_table.ts`, `start_draft_reducer.ts`)

**Directories:**
- Feature components: lowercase with hyphens (`admin-view/`, `team-builder/`, `game-data/`)
- Route groups: parentheses (`(authenticated)/`, `(game)/`, `(landing-page)/`)
- Dynamic routes: square brackets (`[matchId]/`)
- Doc features: lowercase with hyphens (`match-session/`, `cost-sets/`)

## Where to Add New Code

**New Page (authenticated):**
- Create: `app/(authenticated)/{page-name}/page.tsx` and `app/(authenticated)/{page-name}/page.module.css`
- Auth guard is inherited from `app/(authenticated)/layout.tsx` — no extra wiring needed

**New Page (public):**
- Create: `app/(landing-page)/{page-name}/page.tsx`

**New API Route:**
- Create: `app/api/{domain}/route.ts`
- Use `getServerConnection()` from `lib/spacetimedb-server.ts` for SpacetimeDB calls; use `getServerSession(authOptions)` for auth verification

**New Feature Component:**
- Create feature directory: `components/features/{feature-name}/`
- Components go in: `components/features/{feature-name}/components/`
- Hooks go in: `components/features/{feature-name}/hooks/`
- Feature-local types go in: `components/features/{feature-name}/types.ts`

**New SpacetimeDB Table:**
- Create: `spacetimedb/src/tables/{tableName}.ts`
- Register: Add to `spacetimedb/src/schema.ts` schema object
- Regenerate bindings after publishing: `spacetime generate`

**New SpacetimeDB Reducer:**
- Add to existing domain file in `spacetimedb/src/reducers/` if it fits, or create new file
- Export from: `spacetimedb/src/index.ts`
- Always call `getAuthenticatedUser(ctx)` or appropriate `ensure*` guard at the start
- Always spread `auditInsert`/`auditUpdate` on rows modified

**New SpacetimeDB View:**
- Add to `spacetimedb/src/views/securityViews.ts` (per-user) or `spacetimedb/src/views/anonymousViews.ts` (public)
- Use `spacetimedb.view(...)` for authenticated views, `spacetimedb.anonymousView(...)` for public

**New Test:**
- Integration test: `test/backend/{domain}/{feature-name}.test.ts`
- Unit test: `test/backend/{domain}/{helper-name}.unit.test.ts`

**Utilities:**
- Shared frontend hooks: `components/features/hooks/`
- Shared frontend types: `components/features/types/enums.ts` or `components/features/types/structs.ts`
- Server-side SpacetimeDB helpers: `spacetimedb/src/helpers/{helperName}.ts`

## Special Directories

**`src/module_bindings/`:**
- Purpose: Auto-generated SpacetimeDB client bindings
- Generated: Yes — by `spacetime generate` after `spacetime publish`
- Committed: Yes — checked into git for type availability without a live module
- Never edit manually

**`spacetimedb/dist/`:**
- Purpose: Compiled output of the SpacetimeDB TypeScript module
- Generated: Yes — by `tsc` in the `spacetimedb/` package
- Committed: Yes — SpacetimeDB CLI publishes from dist

**`.planning/`:**
- Purpose: GSD project management artifacts (phases, milestones, research, codebase docs)
- Generated: Partially (by GSD workflows)
- Committed: Yes

**`tmp/`:**
- Purpose: Temporary scratch files
- Generated: Yes
- Committed: No (excluded from tsconfig)

---

*Structure analysis: 2026-04-06*
