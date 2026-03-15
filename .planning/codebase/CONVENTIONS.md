# Coding Conventions

**Analysis Date:** 2026-03-15

## Naming Patterns

**Files:**
- React components: PascalCase `.tsx` — `CharacterCard.tsx`, `AuthProvider.tsx`
- React hooks: camelCase prefixed with `use` — `useAuth.ts`, `useCharacterFilters.ts`
- CSS Modules: co-located with component, same base name — `CharacterPool.module.css`
- Type/enum files: lowercase descriptive name — `enums.ts`, `structs.ts`, `types.ts`
- Backend reducers (SpacetimeDB): snake_case — `login_as_guest`, `admin_bulk_upsert`
- Backend tables: camelCase export names matching table name — `User`, `HsrCharacter`

**Functions:**
- React components: PascalCase named exports — `export function CharacterPool(...)`
- Page components: PascalCase default exports — `export default function Header()`
- Hooks: camelCase `use` prefix — `export function useCharacterFilters(...)`
- Utility/helper functions: camelCase — `snakeToCamel`, `validateJson`, `convertKeys`
- Backend reducers: snake_case — `login_as_guest`, `server_link_discord`

**Variables:**
- Regular variables: camelCase — `costMap`, `selectedTable`, `filterState`
- Constants (compile-time): SCREAMING_SNAKE_CASE — `INITIAL_STATE`, `TABLE_TEMPLATES`, `DEFAULT_SORT`
- Enum variant arrays: SCREAMING_SNAKE_CASE with `_VARIANTS` suffix — `PATH_VARIANTS`, `ELEMENT_VARIANTS`, `ACTION_TYPE_VARIANTS`

**Types and Interfaces:**
- Interfaces: PascalCase — `CharacterPoolProps`, `AuthState`, `UseLoadoutsReturn`
- Type aliases derived from `as const` arrays — `export type Team = typeof TEAM_LABEL_VARIANTS[number]`
- Return types for hooks documented as separate interfaces — `UseCharacterFiltersReturn`, `UseLoadoutsReturn`
- Props interfaces named `[ComponentName]Props` and kept in the same file as the component

## Code Style

**Formatting:**
- Prettier is listed in the `generate` script: `prettier --write src/module_bindings`
- No standalone `.prettierrc` or `.eslintrc` detected — only the Next.js default linter (`next lint`)
- Tabs used for indentation in most component files
- Spaces used in some files (inconsistency observed between older and newer files)

**Linting:**
- `next lint` via `npm run lint`
- No custom ESLint rules configured beyond Next.js defaults
- TypeScript strict mode not explicitly configured; some `any` casts appear at SpacetimeDB boundary

## Import Organization

**Order observed in source files:**
1. React and framework imports (`react`, `next/navigation`, `next-auth/react`)
2. SpacetimeDB imports (`spacetimedb/react`, `spacetimedb`)
3. Internal path-aliased imports using `@/` — `@/src/module_bindings`, `@/lib/spacetimedb`
4. Feature-relative imports using `@/components/features/...`
5. Local imports (`./`, `../`)

**Path Aliases:**
- `@/` maps to project root — defined in Next.js tsconfig
- Used for all cross-directory imports: `@/components/features/...`, `@/lib/...`, `@/src/...`

**Example pattern from `useAuth.ts`:**
```typescript
import { useMemo, useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn, signOut } from "next-auth/react";
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { SPACETIMEDB_TOKEN_KEY } from '@/lib/spacetimedb';
import { AuthState, User, UserIdentityRow } from '../types';
```

## Directive Usage

**Client components** always declare `'use client'` as the first line:
- All interactive components, hooks files, and any file using React state/effects
- Provider components: `AuthProvider.tsx`, `GameDataProvider.tsx`, `providers.tsx`

**Server components** (no directive) are only page shells and layout wrappers in `app/`:
- `app/layout.tsx`, `app/(landing-page)/page.tsx`, etc.

## Error Handling

**Frontend patterns:**
- SpacetimeDB reducer calls wrapped in `try/catch`, errors logged to `console.error`
- Failed async operations (fetch) chained with `.catch(e => console.error(...))`
- User-facing error messages stored in component state as `{ type: 'success' | 'error'; text: string } | null`
- Context hooks throw descriptive errors if used outside their provider:
  ```typescript
  if (!ctx) throw new Error('useAuthContext must be used within an AuthProvider');
  ```

**Backend patterns (SpacetimeDB reducers):**
- Permission failures throw `SenderError` from `spacetimedb/server`
- All reducers call `ensureAdmin()` or `ensureTournamentHost()` from `spacetimedb/src/helpers/ensurePermissions.ts`
- Validation errors thrown as `SenderError` with descriptive messages
- Errors logged server-side with `console.error('[ADMIN] ...')` before throwing

## Logging

**Framework:** `console.log` / `console.error` (no structured logger)

**Patterns:**
- SpacetimeDB connection events logged in `app/providers.tsx`: `'Connected to SpacetimeDB with identity:'`
- Backend validation failures use `console.error` with prefix: `[ADMIN]`, caller identity, and reason
- Client-side reducer failures use `console.error("Failed to call [reducer]:", err)`
- No logging in pure data-transformation code (hooks, utilities)

## Comments

**When to Comment:**
- Architecture decisions that are non-obvious — especially Next.js SSR/hydration edge cases
- Multi-step flows numbered inline: `// 1. External state`, `// 2. Subscribe to...`
- SpacetimeDB subscription nuances: `// Note: tables.UserIdentity requires regenerated bindings after publish`
- Section separators using `─` Unicode dividers for visual grouping within longer files

**JSDoc:**
- Used selectively for exported hooks with non-obvious parameters:
  ```typescript
  /**
   * Encapsulates all character filtering logic.
   * Pure state + derived data — no SpacetimeDB or rendering concerns.
   */
  ```
- Architecture notes in block comments explaining *why* a pattern was chosen (see `useLoadouts.ts`)

## Function Design

**Size:** Hooks can be long (100-200 lines) when they encapsulate a complete domain (auth, loadouts). Helper functions stay small (under 30 lines).

**Parameters:**
- Component props always destructured in function signature
- Hooks take primitive/typed params — `useCharacterFilters(characters: Character[])`
- Default parameters used for optional hook behavior: `isAuthenticated = false`

**Return Values:**
- Hooks return named object literals (not arrays) to allow selective destructuring
- Components return JSX directly with no intermediate assignment
- Pure utility functions return typed result objects: `ValidationResult`

## Module Design

**Exports:**
- Named exports for hooks and most components: `export function useAuth()`
- Default exports for page components and some layout components: `export default function Header()`
- No mixed default+named in a single file

**Barrel Files:**
- Used sparingly — only `components/globals/icons/index.ts` observed
- Feature directories do NOT use barrel `index.ts` files; consumers import from full paths

## Context Pattern

All shared state uses the Provider/hook pattern:
1. `createContext<T | null>(null)` — always nullable default
2. Provider component wraps children and passes hook return value
3. Consumer hook checks for null and throws if used outside provider
4. Examples: `AuthProvider.tsx` + `useAuthContext()`, `GameDataProvider.tsx` + `useGameData()`

## Styling

**Approach:** Mix of CSS Modules and Tailwind CSS utility classes
- CSS Modules for component-specific layout and structural styles: `CharacterPool.module.css`
- Tailwind classes for spacing, flex, color, and utility styles (especially in admin/form components)
- HeroUI component library (`@heroui/*`) for form controls, modals, tables, and chips
- `framer-motion` available but used minimally

**CSS Module naming:** Class names in `styles.camelCase` within TSX, kebab-case in the `.module.css` file.

---

*Convention analysis: 2026-03-15*
