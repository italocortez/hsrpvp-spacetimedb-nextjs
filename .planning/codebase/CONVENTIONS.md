# Coding Conventions

**Analysis Date:** 2026-04-06

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` (`AuthProvider.tsx`, `CharacterCostTable.tsx`, `NavBar.tsx`)
- Hooks: camelCase prefixed with `use`, `.ts` extension (`useAuth.ts`, `useDraftState.ts`, `useCharacterCostTable.ts`)
- Backend reducers: camelCase `.ts` (`lobbyLifecycle.ts`, `tournamentManagement.ts`, `draftClassic.ts`)
- Backend helpers: camelCase `.ts` (`eloCalculation.ts`, `bracketGeneration.ts`, `auditColumns.ts`)
- Backend tables: camelCase `.ts` (`user.ts`, `matchSession.ts`, `tournamentTeamMember.ts`)
- Backend enums/types: camelCase `.ts` (`enums.ts`, `structs.ts`)
- Test files: kebab-case with `.test.ts` suffix (`roster-accounts.test.ts`, `lobby-lifecycle.test.ts`)
- Unit test files: kebab-case with `.unit.test.ts` suffix (`elo-calculation.unit.test.ts`, `lobby-slot-helpers.unit.test.ts`)
- CSS Modules: PascalCase matching component (`NavBar.module.css`, `CharacterCostTable.module.css`)

**Functions:**
- React components: PascalCase named exports (`export function AuthProvider`, `export const NavBar`)
- Hooks: camelCase prefixed with `use` (`export function useAuth()`, `export function useDraftState()`)
- Backend reducers: snake_case exported constants (`export const login_as_guest`, `export const create_hsr_account`)
- Backend helpers: camelCase functions (`getKFactor`, `calculateExpectedScore`, `ensureAdmin`, `auditInsert`)
- Test helpers: camelCase (`createTestHarness`, `expectReducerError`, `defaultLobbyArgs`, `cleanupLobby`)
- Factory functions: camelCase noun+verb (`createAccountArgs`, `characterBatch`, `createTournamentArgs`)

**Variables:**
- camelCase throughout (`hostUserId`, `tournamentId`, `displayLabel`)
- Constants: SCREAMING_SNAKE_CASE for true constants (`SYSTEM_USER_ID`, `ROLE_LEVEL`, `NAV_ITEMS`, `COLUMNS`, `UIDS`, `INVALID_UIDS`)
- Enum-like fixed objects: SCREAMING_SNAKE_CASE (`ARCHETYPES`, `KNOWN_CHARACTERS`)

**Types/Interfaces:**
- PascalCase interfaces (`TestHarness`, `AuthState`, `EloConfigValues`, `CharacterCostTableProps`)
- Type aliases: PascalCase (`UserRole`, `SortDescriptor`, `CostTableFilters`)
- SpacetimeDB enums: PascalCase via `t.enum()` (`Role`, `LobbySlot`, `TournamentStage`)
- Table column exports: camelCase variable (`userColumns`, `lobbyColumns`)
- Table exports: PascalCase (`User`, `Lobby`, `MatchSession`)

## Code Style

**Formatting:**
- Prettier is used (confirmed via `npm run generate` script which runs `prettier --write`)
- 4-space indentation in backend `.ts` files and test files
- 2-space indentation in some frontend `.tsx` files (NavBar, CharacterCostTable)
- Single quotes for imports; template literals for interpolation
- Trailing commas in object/array literals

**Linting:**
- `next lint` (ESLint via Next.js) — configured via Next.js built-in config
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)
- `noEmit: true` — type checking without build output

**TypeScript Strictness:**
- `strict: true` — all strict checks enabled
- Prefer typed over `any`; `any` only appears in helper boundaries where SpacetimeDB's `ctx` type is not exported (`ctx: any`, `role: any`)
- Use `as const` for fixed literal arrays and objects
- `as any` cast only at SpacetimeDB insert boundaries where TypeScript cannot infer auto-increment fields

## Import Organization

**Order:**
1. React and framework imports (`import React, { ... } from 'react'`, `import { ... } from 'next/navigation'`)
2. Third-party library imports (`import { ... } from 'spacetimedb/react'`, `import { ... } from 'next-auth/react'`)
3. Internal absolute imports using `@/` alias (`import { ... } from '@/src/module_bindings'`, `import { ... } from '@/lib/spacetimedb'`)
4. Relative imports (`import { ... } from '../hooks/useAuth'`, `import { ... } from './AuthProvider'`)
5. Side-effect imports last (`import './views/securityViews'`)

**Path Aliases:**
- `@/*` resolves to project root (`./`) — defined in `tsconfig.json`
- Use `@/src/module_bindings` for generated SpacetimeDB bindings
- Use `@/lib/...` for shared utilities
- Use `@/components/...` for cross-feature component references
- Relative imports for same-feature files

**Backend Import Pattern:**
```typescript
import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { ensureVerifiedUser } from '../helpers/ensurePermissions';
import { auditInsert, auditUpdate } from '../helpers/auditColumns';
```

## Error Handling

**Backend (SpacetimeDB reducers):**
- Throw `SenderError` for all user-facing errors — this is the only error type that SpacetimeDB surfaces to the client
- Error messages are human-readable strings: `'Maximum 5 HSR accounts per user'`, `'Display label cannot be empty'`, `'Forbidden: Requires Admin privileges.'`
- Permission check helpers (`ensureAdmin`, `ensureVerifiedUser`, `ensureAuthenticated`) throw `SenderError` with consistent prefixes: `"Unauthorized: ..."` or `"Forbidden: ..."`
- No try/catch in reducers — errors bubble up and abort the transaction

**Frontend:**
- Async reducer calls wrapped in try/catch where failure is expected (`conn.reducers.loginAsGuest({})` wrapped with `console.error`)
- `fetch` chains use `.then(res => { if (!res.ok) return res.json().then(...) })` pattern
- Ref guards (`linkingRef.current`, `deletionHandledRef.current`) prevent duplicate side effects
- Context hooks throw synchronously when used outside provider: `throw new Error('useAuthContext must be used within an AuthProvider')`

**Test error assertions:**
- `expectReducerError(promise)` helper from `test/shared/connection.ts` wraps reducer calls expected to fail
- Pattern: `const msg = await expectReducerError(h.call.someReducer({...})); expect(msg).toContain('...')`

## Logging

**Framework:** `console.error` (no structured logging library)

**Patterns:**
- Frontend only — no logging in backend reducers (SpacetimeDB handles server logs)
- `console.error` for failed async operations in hooks (`"Auto-register loginAsGuest failed:"`, `"Failed to link Discord:"`)
- `console.log` used in standalone scripts (`bootstrap.ts`, `seed-data.ts`) for progress output
- No logging in component render paths or hooks outside of error cases

## Comments

**When to Comment:**
- File-level JSDoc blocks describing purpose, coverage, and requirements
- Section dividers using `// ─── Section Name ─────────────────────────` (box-drawing dashes)
- Inline comments for non-obvious design decisions referencing decision IDs (`// D-14`, `// D-35`, Phase references)
- Table/column inline comments for schema rationale (`// FK reference to HsrCharacter name`, `// Set by admin soft-delete; scheduled job hard-deletes after 5s`)

**JSDoc pattern for files:**
```typescript
/**
 * Integration tests for lobby lifecycle reducers.
 *
 * Covers:
 * - create_lobby: defaults, one-per-user, guest restrictions
 *
 * Requires: SPACETIMEDB_SERVER_TOKEN in .env.local
 *
 * Contract: docs/lobby/contract.md — Lobby Lifecycle scenarios
 */
```

**Backend reducer section headers:**
```typescript
// ─── create_hsr_account ───────────────────────────────────────────────────────
// Creates a new HSR account entry for the authenticated user.
// Validates UID format, derives region, enforces 5-account cap,
// auto-defaults label, and auto-activates if it is the user's first account.
```

## Function Design

**Reducer pattern (backend):**
```typescript
export const reducer_name = spacetimedb.reducer(
    { param1: t.string(), param2: t.u32() },
    (ctx, { param1, param2 }) => {
        const user = ensureVerifiedUser(ctx);  // auth guard first
        // ... validation
        // ... DB operations
    }
);
```

**Helper function pattern (backend):**
- Pure functions with no DB access: accept plain values, return plain values — unit testable
- DB-touching helpers: accept `ctx: any` as first argument
- Auth helpers: accept `ctx: any`, throw `SenderError`, return the resolved user

**React component pattern:**
```typescript
'use client';  // only when using hooks/browser APIs

interface ComponentProps {
    prop1: string;
    prop2?: number;
}

export function ComponentName({ prop1, prop2 }: ComponentProps) {
    // hooks first
    // derived state (useMemo)
    // handlers (useCallback)
    // JSX return
}
```

**Hook pattern:**
```typescript
export function useHookName() {
    // external state hooks first (useRouter, useSession, useSpacetimeDB)
    // subscription hooks (useTable)
    // derived state (useMemo)
    // side effects (useEffect) — numbered with comments (// 1., // 2., etc.)
    // actions (useCallback)
    // return object
}
```

## Module Design

**Exports:**
- Backend: named exports only — one reducer per export at the file level; `src/index.ts` re-exports all reducers
- Frontend components: named exports from component files; `default export` for page-level components used as Next.js routes
- Table definitions: named column exports (`userColumns`) + named table export (`User`) from table files

**Barrel Files:**
- `spacetimedb/src/index.ts` is the single barrel for all backend reducers (re-exports every reducer with `export { ... } from './reducers/...'`)
- No component barrel files — components are imported directly by path
- `test/shared/` acts as a test utility barrel — connection, fixtures, helpers all imported directly

**SpacetimeDB-specific patterns:**
- Reducers must be exported from `spacetimedb/src/index.ts` to be registered with the module
- Views registered via side-effect imports in `index.ts` (`import './views/securityViews'`)
- Table files export column definitions separately from the table registration to allow type reuse
- `spacetimedb` schema object imported from `./schema` in each reducer file

---

*Convention analysis: 2026-04-06*
