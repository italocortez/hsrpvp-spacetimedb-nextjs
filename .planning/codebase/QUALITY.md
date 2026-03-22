# Code Quality

**Analysis Date:** 2026-03-16

## Patterns (Good)

**Consistent audit columns:** Every user-facing table includes `createdById`, `createdDate`, `lastModifiedById`, `lastModifiedDate`. Two helper functions (`auditInsert`, `auditUpdate`) enforce this in all reducers.

**Clean permission model:** `getAuthenticatedUser()`, `ensureAdmin()`, `ensureTournamentHost()`, `requireServer()` form a clear authorization layer. All reducers use these consistently.

**Feature-based frontend organization:** Components are grouped by business domain (`admin-view`, `auth`, `costs`, `drafting`, `profile`, `team-builder`) with co-located hooks and types.

**Type-safe enums:** 27 SpacetimeDB enums defined as tagged unions. Backend validates strictly (case-sensitive). Bindings generate matching client types.

**Type-safe action payloads:** Draft step actions use a sum type (`StepPayload`) instead of raw JSON strings, providing compile-time safety for pick/ban/bid/auction/pause/undo actions.

**Flat column design:** Lobby table uses flat columns instead of nested config structs, enabling SpacetimeDB index filtering on any field. This is a deliberate design decision per project conventions.

**Singleton server connection:** `lib/spacetimedb-server.ts` uses lazy initialization with reconnect-on-disconnect, preventing connection leak in API routes.

## Conventions

**Naming:**
- Components: PascalCase (`CharacterCard.tsx`)
- Hooks: `use*` prefix (`useAuth.ts`)
- Reducers: snake_case (`login_as_guest`)
- Constants: UPPER_SNAKE_CASE (`SYSTEM_USER_ID`)
- Booleans: `is*` / `has*` prefix
- Refs: `*Ref` suffix

**File structure:**
- One table definition per file in `spacetimedb/src/tables/`
- One reducer domain per file in `spacetimedb/src/reducers/`
- CSS modules co-located with components (`Component.module.css`)

**Imports:** React/external first, then UI libs, then SpacetimeDB bindings, then internal modules, then types, then styles. Path alias `@/*` maps to project root.

## Anti-Patterns (Observed)

**Pervasive `any` casts:** Admin reducers cast to `any` for table operations (`as any` on inserts/updates). Frontend casts `(session.user as any).id` and `(conn.reducers as any)`. This bypasses TypeScript's safety net.

**Full-table scans for composite key lookups:** `admin.ts` uses `.iter()` loops to find rows by composite keys (characterName + gameMode) in HsrCharacterCost, HsrLightconeCost, HsrSynergyCost. Should use compound indexes.

**No error boundaries:** Frontend has no React error boundary. Reducer call failures are caught in try-catch and logged to console but not surfaced to users.

**No input sanitization:** Admin panel accepts arbitrary strings for usernames and display names without format validation (length check only, no character restrictions).

**Long switch statements:** `admin_delete_row` (14 cases) and `admin_bulk_upsert` (5 cases) require manual updates when new tables are added. No compile-time check ensures all tables are handled.

## Test Coverage

**Zero.** No test runner configured. No test files exist. All backend reducers, frontend hooks, auth flows, and admin operations are untested.

## Documentation

**Backend feature docs:** `docs/` contains architecture.md and contract.md files for 17 feature domains (auth, roster, lobby, match-results, mmr, tournament, teams, brackets, achievements, calendar, chat, player-stats, cost-tables, match-session, cost-sets, views, archetypes). These document table relationships and reducer flows.

**Code comments:** JSDoc on helper functions in `ensurePermissions.ts` and `auditColumns.ts`. Inline comments explain complex auth flows in `useAuth.ts`. Reducer files have explanatory comments.

---

*Quality analysis: 2026-03-16*
