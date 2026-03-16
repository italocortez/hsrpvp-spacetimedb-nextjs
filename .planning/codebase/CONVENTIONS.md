# Coding Conventions

**Analysis Date:** 2026-03-15

## Naming Patterns

**Files:**
- React components: PascalCase (e.g., `AdminTabs.tsx`, `CharacterCostTable.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useAuth.ts`, `useCharacterCostTable.ts`)
- Types/interfaces: PascalCase (e.g., `AdminTab`, `CharacterCostRow`)
- Constants: UPPER_SNAKE_CASE (e.g., `ADMIN_TABS`, `COLUMNS`, `RARITY_COLORS`)
- Utilities/helpers: camelCase (e.g., `toggleInArray`, `validateEnum`)
- Reducers: snake_case with underscores (e.g., `login_as_guest`, `admin_delete_row`)
- Tables: snake_case (e.g., `UserIdentity`, `HsrCharacter`) but referenced with PascalCase in code

**Functions:**
- Frontend: camelCase with descriptive verb-noun pattern (e.g., `toggleRole`, `clearAll`, `validateEnum`)
- Backend reducers: exported as snake_case, defined via `spacetimedb.reducer()` (e.g., `export const login_as_guest`)
- Callback handlers: `onEventName` pattern (e.g., `onTabChange`, `onSelectionChange`, `onSortChange`)

**Variables:**
- camelCase for all local and state variables
- Boolean flags: `is*` or `has*` prefix (e.g., `isActive`, `hasMapping`, `isExpanded`)
- Ref variables: suffix with `Ref` (e.g., `linkingRef`, `autoRegisteredRef`, `hadTokenOnMount`)
- Enum instances: tagged unions with `.tag` property (e.g., `role.tag`, `gameMode.tag`)

**Types:**
- Interfaces: PascalCase, suffixed with specific descriptor (e.g., `UserIdentityRow`, `CharacterCostRow`, `SortDescriptor`)
- Type aliases: PascalCase (e.g., `AuthState`, `AdminTab`)
- Enum-like tagged unions: defined in `enums.ts` files (e.g., `{ tag: 'Admin' | 'User' | ... }`)

## Code Style

**Formatting:**
- No explicit Prettier or ESLint config present
- Observed style: 4-space indentation in TypeScript backend code, mixed 2-4 space in frontend
- Semicolons: used consistently throughout
- String quotes: single quotes preferred in backend (`'field'`), JSX uses double quotes for attributes

**Linting:**
- ESLint integration via `next lint` script but no project-level `.eslintrc` found
- Using Next.js default linting rules
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)

**Import Organization:**
- 1. React and external libraries (`import React from 'react'`)
- 2. Third-party UI libraries (`import { ... } from '@heroui/...'`)
- 3. SpacetimeDB bindings (`import { tables } from '@/src/module_bindings'`)
- 4. Internal modules and hooks (`import { useAuth } from '../hooks/useAuth'`)
- 5. Types and constants (`import type { ... }`, `import { CONSTANT }`)
- 6. Styles/CSS (`import styles from './File.module.css'`)

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json`)
- Relative imports used for local module/component references
- Absolute imports used for cross-feature dependencies

## Error Handling

**Backend (SpacetimeDB):**
- All validation errors throw `SenderError` from `'spacetimedb/server'` (seen in `ensurePermissions.ts`, `admin.ts`)
- Permission checks: Functions like `ensureAdmin()`, `ensureTournamentHost()` throw SenderError if conditions fail
- Enum validation: Strict case-sensitive matching, throws SenderError with full list of valid options
- Key validation: Rows checked for exact key match (no missing, no extra fields) — detailed error messages listing missing/unexpected keys
- Example from `admin.ts` line 24-31: validateEnum throws with "Invalid {field}: {value}. Must be exactly one of: ..."

**Frontend (React/Next.js):**
- Try-catch blocks wrap async operations (e.g., `loginAsGuest`, `deleteGuestAccount` in `useAuth.ts`)
- Errors logged to console with context (e.g., "Auto-register loginAsGuest failed:", error)
- Fetch errors parsed and re-thrown with custom message (line 107 in `useAuth.ts`)
- No global error boundary or exception handler detected — errors surface in dev console
- Reducer call failures silently set flag back to false (`linkingRef.current = false` in finally block)

## Logging

**Framework:** Console-based

**Patterns:**
- Backend: `console.log()` with `[CONTEXT]` prefix tags (e.g., `[ADMIN]`, `[ADMIN]` for audit logging)
- Example: `console.log("[ADMIN] User #${id} soft-deleted. Hard-delete scheduled in 5s.");`
- Example: `console.error("[ADMIN] Bulk upsert REJECTED for table...")` for errors
- Frontend: `console.error()` only for failures, with operation context
- Client connection lifecycle: logged as `console.log("Client connected/disconnected: {identity}")` in `spacetimedb/src/index.ts`

## Comments

**When to Comment:**
- Algorithm explanation: Complex filter/sort logic in hooks (seen in `useCharacterCostTable.ts`)
- State management intent: Multi-step flows with refs and flags (seen in `useAuth.ts` lines 45-51, 70-118)
- Enum construction: How tagged unions map to data (e.g., line 43 in `auth.ts`: `role: { tag: 'User' }`)
- TODO/FIXME: Not observed in codebase (grep found none)

**JSDoc/TSDoc:**
- Observed pattern: Single-line or multi-line block comments above functions
- Example from `ensurePermissions.ts`:
  ```typescript
  /**
   * Resolves ctx.sender (identity) → UserIdentity → User.
   * Returns both the mapping row and the User row.
   * Throws if the identity is not linked to any user.
   */
  ```
- Not consistently applied to all functions
- Function parameters not documented with @param
- Return values not documented with @return

## Function Design

**Size:**
- Small focused functions preferred (10-30 lines typical)
- Complex hooks can be longer (useAuth is 217 lines, but highly structured)
- Data transformation helpers: 10-40 lines
- Reducers: 20-60 lines (some admin operations reach 100+ due to switch cases)

**Parameters:**
- Frontend: Destructured props objects for components
- Backend: SpacetimeDB reducer pattern: `(ctx, args)` where args is destructured
- Callbacks: Single parameter or object with multiple fields
- Type all parameters explicitly (TypeScript strict mode enforced)

**Return Values:**
- React components: Always return JSX or Fragment
- Hooks: Return object with state and action methods (seen in useAuth return at line 209-216)
- Data functions: Return arrays or objects, null for missing data
- Reducer functions: Return void (no return to caller; data changes via ctx.db)

## Module Design

**Exports:**
- Default exports: React components (e.g., `export default function AdminTabs()`)
- Named exports: Hooks, utilities, types, reducers (e.g., `export function useAuth()`, `export const login_as_guest`)
- Re-exports for batch operations: `src/index.ts` re-exports all reducers for SpacetimeDB
- Barrel files for ease of import (e.g., exporting multiple reducers from `index.ts`)

**Barrel Files:**
- `spacetimedb/src/index.ts`: Exports all reducers and lifecycle hooks
- `types` directories: Group type definitions (e.g., `components/features/admin-view/types.ts`)
- `enums.ts`: Centralized enum variant definitions

**File Organization:**
- Feature-based structure: `components/features/{feature-name}/{components,hooks,types}/`
- Backend modules: `spacetimedb/src/{tables,reducers,helpers,types}/`
- Shared types under `components/features/types/`

---

*Convention analysis: 2026-03-15*
