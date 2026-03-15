# Testing Patterns

**Analysis Date:** 2026-03-15

## Test Framework

**Runner:** None detected

No test framework is installed or configured. The `package.json` contains no test script, no `jest`, `vitest`, `mocha`, `playwright`, or any testing library in `dependencies` or `devDependencies`. No test configuration files (`jest.config.*`, `vitest.config.*`) exist in the repository.

**Assertion Library:** None

**Run Commands:**
```bash
# No test commands available
```

## Test File Organization

**Location:** No test files exist in the repository.

No files matching `*.test.*` or `*.spec.*` patterns were found anywhere under the project root (excluding `node_modules`).

## Test Structure

Not applicable — no tests exist.

## Mocking

Not applicable — no test infrastructure exists.

## Fixtures and Factories

**Test Data:** Not applicable.

The closest equivalent to fixtures are the hardcoded template strings in `components/features/admin-view/components/BulkUpsert.tsx` (`TABLE_TEMPLATES` constant), which serve as documentation for expected data shapes rather than test fixtures.

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
# Not available
```

## Test Types

**Unit Tests:** Not present

**Integration Tests:** Not present

**E2E Tests:** Not present

## Current State Assessment

The project has zero automated test coverage. All validation logic is manual:

- **Client-side validation** in `components/features/admin-view/components/BulkUpsert.tsx` — the `validateJson` function (lines 81-150) validates data shapes, enum values, and key consistency before submitting to SpacetimeDB reducers
- **Server-side validation** in `spacetimedb/src/reducers/admin.ts` — `validateKeys` and `validateEnum` functions enforce data integrity at the reducer level, throwing `SenderError` on failure
- **Permission checks** in `spacetimedb/src/helpers/ensurePermissions.ts` — `ensureAdmin`, `ensureTournamentHost`, `getAuthenticatedUser` guard reducer access

These validation functions contain the most logic that would benefit from unit tests.

## Recommended Testing Entry Points

If tests are added, these are the highest-value targets (pure functions with no external dependencies):

1. `components/features/admin-view/components/BulkUpsert.tsx` — `validateJson`, `snakeToCamel`, `convertKeys`
2. `components/features/hooks/useCharacterFilters.ts` — filter and sort logic
3. `components/features/costs/hooks/useCharacterCostTable.ts` — join, filter, sort pipeline
4. `spacetimedb/src/helpers/ensurePermissions.ts` — permission helper functions

## Recommended Setup

To add testing, the minimal viable setup for this Next.js + TypeScript project would be:

```bash
pnpm add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom
```

Config file: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
});
```

Test file naming convention to adopt: `[filename].test.ts` co-located with the source file.

---

*Testing analysis: 2026-03-15*
