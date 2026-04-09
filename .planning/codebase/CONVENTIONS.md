# Coding Conventions

**Analysis Date:** 2026-04-09

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` (`AuthProvider.tsx`, `CharacterCostTable.tsx`, `NavBar.tsx`)
- Hooks: camelCase prefixed with `use`, `.ts` extension (`useAuth.ts`, `useDraftState.ts`)
- Backend reducers: camelCase `.ts` grouped by domain (`lobbyLifecycle.ts`, `tournamentManagement.ts`, `draftClassic.ts`)
- Backend helpers: camelCase `.ts` (`eloCalculation.ts`, `bracketGeneration.ts`, `auditColumns.ts`, `ensurePermissions.ts`)
- Backend tables: camelCase `.ts` (`user.ts`, `matchSession.ts`, `tournamentTeamMember.ts`)
- Backend views: camelCase `.ts` (only 2 files: `securityViews.ts`, `anonymousViews.ts`)
- Backend enums/types: camelCase `.ts` (`enums.ts`, `structs.ts`)
- Test files: kebab-case with `.test.ts` suffix (`roster-accounts.test.ts`, `lobby-lifecycle.test.ts`)
- Unit test files: kebab-case with `.unit.test.ts` suffix (`elo-calculation.unit.test.ts`)
- CSS Modules: PascalCase matching component (`NavBar.module.css`, `CharacterCostTable.module.css`)

**Functions:**
- React components: PascalCase named exports (`export function AuthProvider`, `export const NavBar`)
- Hooks: camelCase prefixed with `use` (`export function useAuth()`, `export function useDraftState()`)
- Backend reducers: snake_case exported constants (`export const login_as_guest`, `export const create_hsr_account`)
- Backend views: snake_case with `view_` prefix (`export const view_my_lobbies`, `export const view_my_profile`)
- Backend helpers: camelCase functions (`getKFactor`, `calculateExpectedScore`, `ensureAdmin`, `auditInsert`)
- Test helpers: camelCase (`createTestHarness`, `expectReducerError`, `defaultLobbyArgs`, `cleanupLobby`)
- Factory functions: camelCase noun+verb (`createAccountArgs`, `characterBatch`, `createTournamentArgs`)

**Variables:**
- camelCase throughout (`hostUserId`, `tournamentId`, `displayLabel`)
- Constants: SCREAMING_SNAKE_CASE (`SYSTEM_USER_ID`, `ROLE_LEVEL`, `NAV_ITEMS`, `IDENTITY_TTL_DAYS`, `UIDS`, `INVALID_UIDS`)
- Enum-like fixed objects: SCREAMING_SNAKE_CASE (`ARCHETYPES`, `KNOWN_CHARACTERS`)

**Types/Interfaces:**
- PascalCase interfaces (`TestHarness`, `AuthState`, `EloConfigValues`, `CharacterCostTableProps`)
- Type aliases: PascalCase (`UserRole`, `SortDescriptor`, `CostTableFilters`)
- SpacetimeDB enums: PascalCase via `t.enum()` (`Role`, `LobbySlot`, `TournamentStage`)
- Table column exports: camelCase variable (`userColumns`, `lobbyColumns`)
- Table exports: PascalCase (`User`, `Lobby`, `MatchSession`, `UserPrivate`)

## Code Style

**Formatting:**
- Prettier is used (runs after `npm run spacetime:generate` via `prettier --write`)
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
- Prefer typed over `any`; `any` only appears at SpacetimeDB SDK boundaries where typed ctx is not exported
- `as const` for fixed literal arrays and objects
- `as any` cast at SpacetimeDB insert boundaries where auto-increment fields prevent full inference

## Import Organization

**Order:**
1. React and framework imports (`import React, { ... } from 'react'`, `import { ... } from 'next/navigation'`)
2. Third-party library imports (`import { ... } from 'spacetimedb/react'`, `import { ... } from 'next-auth/react'`)
3. Internal absolute imports using `@/` alias (`import { ... } from '@/src/module_bindings'`, `import { ... } from '@/lib/spacetimedb'`)
4. Relative imports (`import { ... } from '../hooks/useAuth'`, `import { ... } from './AuthProvider'`)
5. Side-effect imports last (legacy only — Phase 12.2 replaced with named re-exports for views)

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

## Reducer Pattern (Backend)

```typescript
export const reducer_name = spacetimedb.reducer(
    { param1: t.string(), param2: t.u32() },
    (ctx, { param1, param2 }) => {
        const user = ensureVerifiedUser(ctx);  // auth guard always first
        // validation: throw new SenderError('message') for input errors
        // DB operations: ctx.db.Table.index.find/filter/update/insert
    }
);
```

**Key rules:**
- Auth guard is always the first statement in every reducer body
- No try/catch in reducers — errors bubble up and abort the transaction
- No network, filesystem, timers, or randomness in reducers (must be deterministic)
- `ctx.sender` is the authenticated principal — never trust identity args from the caller

## Permission Pattern

```typescript
// Role hierarchy: Admin=100, Moderator=75, TournamentHost=50, User=25, Guest=0
getAuthenticatedUser(ctx)    // resolves ctx.sender -> UserIdentity -> User; throws if unlinked
ensureVerifiedUser(ctx)      // requires User.isGuest === false
ensureAdmin(ctx)             // requires role level >= 100
ensureModerator(ctx)         // requires role level >= 75
ensureTournamentHost(ctx)    // requires role level >= 50
ensureAuthenticated(ctx)     // just resolves identity (allows guests)
ensureTournamentAccess(ctx, tournamentId)  // checks host or assistant
```

**Error message conventions:**
- `"Unauthorized: No user linked to this identity."`
- `"Unauthorized: User record not found."`
- `"Unauthorized: This account has been deleted."`
- `"Forbidden: Requires Admin privileges."`

## Table Access Patterns

**By primary key (fastest):**
```typescript
ctx.db.User.id.find(userId)           // returns row | undefined
ctx.db.HsrAccount.id.find(accountId)
```

**By btree index (preferred for filtering):**
```typescript
ctx.db.HsrAccount.user_id.filter(userId)           // returns iterable
ctx.db.Lobby.stage.filter({ tag: 'Waiting', value: {} })
ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, userId])[0]  // composite btree
```

**Full table scan (iter() — use sparingly):**
```typescript
[...ctx.db.Achievement.iter()]   // acceptable for admin-only tables (<100 rows)
```

**When to use each:**
- `PK.find(id)` — single row by known ID
- `btreeIndex.filter(value)` — filter by indexed column; preferred for large tables
- `.iter()` — only for small admin-content tables (<100 rows) or with explicit justification; always document why

## Audit Columns Pattern

Every INSERT and UPDATE spreads audit fields:
```typescript
// INSERT new row:
ctx.db.Foo.insert({
    id: 0,  // 0 triggers autoInc
    field1: value,
    ...auditInsert(ctx, user.id),
} as any);

// UPDATE existing row:
ctx.db.Foo.id.update({
    ...existing,
    field1: newValue,
    ...auditUpdate(ctx, existing, user.id),  // preserves created*, updates lastModified*
} as any);
```

`SYSTEM_USER_ID = 0` is used for scheduled/system-initiated operations (GC jobs, lifecycle hooks).

## View Export Pattern (Phase 12.2)

Views MUST be `export const` for `[registerExport]` to fire during module init:

```typescript
// CORRECT (Phase 12.2):
export const view_my_profile = spacetimedb.view(
    { name: 'view_my_profile', public: true },
    t.array(ProfileRow),
    (ctx) => { /* ... */ }
);
```

All views must also be re-exported from `spacetimedb/src/index.ts`:
```typescript
export { view_my_profile, view_lobby_browser, ... } from './views/securityViews';
export { view_my_lobby_chat, view_match_history, ... } from './views/anonymousViews';
```

The old side-effect import pattern (`import './views/securityViews'`) is DEAD — views registered that way are NOT registered in the module.

## Reducer Error Handling (Frontend — Phase 12.2)

SDK 2.1.0 reducer calls return `Promise<void>`. Use `.catch()`:

```typescript
// CORRECT (SDK 2.1.0):
conn.reducers.loginAsGuest({}).catch((err: any) => {
    console.error('loginAsGuest failed:', err);
});

// WRONG (stale _then() pattern — does not exist in SDK 2.1.0):
// conn.reducers.loginAsGuest({})._then(undefined, (err) => { ... })
```

## Privacy Markers

Tables with sensitive data use `public: false`:
```typescript
export const UserPrivate = table({
    name: 'user_private',
    public: false,   // CR-01: MUST be explicit
    ...
}, userPrivateColumns);
```

**Private tables (public: false):** `UserPrivate`, `BanRecord`, `UserIdentity`, `ServerIdentity`, `CharacterStat`, `PlayerStat`, `PlayerRelationship`, `GcResult`

Clients access private data only through named views (e.g., `view_my_profile`, `view_my_player_stats`).

## TypeScript Patterns (Backend)

**Type-only imports for SDK types:**
```typescript
import type { EloConfigValues } from '../types/structs';  // avoids build warning
```

**BigInt handling:**
- SpacetimeDB timestamps are `BigInt` (microseconds since Unix epoch)
- Use explicit arithmetic: `BigInt(days * 24 * 60 * 60) * 1_000_000n`
- For client reducer timestamp args: pass as strings (`t.string()`) to avoid u64 encoding issues

**Enum variant access:**
```typescript
{ tag: 'Admin', value: {} }       // Role.Admin
{ tag: 'Waiting', value: {} }     // LobbyStage.Waiting
user.role.tag === 'Admin'         // correct comparison
```

## Error Handling

**Backend (SpacetimeDB reducers):**
- Throw `SenderError` for all user-facing errors — only type SpacetimeDB surfaces to the client
- Error messages are human-readable strings: `'Maximum 5 HSR accounts per user'`, `'Display label cannot be empty'`
- No try/catch in reducers — errors abort the transaction

**Frontend:**
- Reducer calls: `.catch(err => console.error(...))` (Phase 12.2)
- `fetch` chains: `.then(res => { if (!res.ok) return res.json().then(...) })` pattern
- Ref guards (`linkingRef.current`, `deletionHandledRef.current`) prevent duplicate side effects

**Test error assertions:**
```typescript
const msg = await expectReducerError(h.call.someReducer({...}));
expect(msg).toContain('expected error text');
```

## Logging

**Framework:** `console.error` (no structured logging library)

**Patterns:**
- Frontend: `console.error` for failed async operations; `console.log` in standalone scripts only
- Backend: `console.log` with prefix tags: `[DISCONNECT]`, `[IDENTITY_GC]`
- No logging in component render paths or hooks outside of error cases

## Comments

**When to comment:**
- File-level JSDoc blocks (purpose, coverage, contract reference)
- Section dividers: `// ─── Section Name ──────────────────────────────────────────────`
- Inline references: `// D-14`, `// CR-01`, `// Phase 12.2`
- Schema rationale on columns: `// FK to User.id (1:1)`, `// D-02: replaces sensitive auth ID`

**Backend file JSDoc pattern:**
```typescript
/**
 * Security views — per-caller projections for private table data.
 *
 * Covers:
 * - view_my_profile: merged User + UserPrivate fields (D-01)
 *
 * Phase 12.2: All views must be export const for [registerExport] to fire.
 */
```

## Function Design

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

**Backend barrel:** `spacetimedb/src/index.ts` is the single barrel for all backend reducers AND views (re-exports every reducer and view)

**View registration requirement:** Views must be re-exported from `index.ts` (named re-export), not just imported as side effects — this is the Phase 12.2 breaking change

**No component barrel files** — components imported directly by path

---

*Convention analysis: 2026-04-09 (updated from 2026-04-06 to reflect Phase 12 UserPrivate privacy markers, Phase 12.2 view export pattern, SDK 2.1.0 .catch() reducer error handling)*
