# Testing Patterns

**Analysis Date:** 2026-03-15

## Test Framework

**Status:** No testing framework detected

**Finding:** No test files (`.test.*`, `.spec.*`) exist in the codebase. No Jest, Vitest, Mocha, or other test runners configured. No test-related dependencies in `package.json`.

**Run Commands:** None defined
- No npm scripts for `test`, `test:watch`, or `coverage`
- Manual testing only (via dev server or deployed environment)

## Test File Organization

**Not applicable** — No test files present in repository.

## Test Structure

Not applicable — No tests to analyze.

## Mocking

Not applicable — No test framework, no mocking library in use.

## Fixtures and Factories

Not applicable — No test data infrastructure present.

## Coverage

**Requirements:** None enforced

**Current Status:** No coverage tooling configured or tracked.

## Test Types

### Unit Tests
Not written. Backend functions and utilities lack unit test coverage.

### Integration Tests
Not written. Frontend hooks and components lack integration test coverage.

### E2E Tests
Not used. No Cypress, Playwright, or other E2E framework detected.

## Manual Testing Approach

**Observed Development Pattern:**

1. **Backend (SpacetimeDB):**
   - Reducers tested via client calls in development
   - `spacetime logs <db-name>` used to check server-side behavior (reference in CLAUDE.md debugging checklist)
   - Admin panel UI (`/admin-view`) used to manually test table operations (`admin_bulk_upsert`, `admin_delete_row`)
   - Permission checks verified through UI attempts (e.g., non-admin trying to access admin endpoints)

2. **Frontend (React/Next.js):**
   - Development server: `npm run dev`
   - Manual navigation through pages and user flows
   - Browser console checked for `console.error()` logs
   - Session/Auth tested by simulating login, logout, deletion flows
   - Filters and sorting verified in CharacterCostTable by user interaction

3. **Data Validation:**
   - Enum validation in bulk upsert tested via admin panel textarea (line 229 in BulkUpsert.tsx shows JSON paste interface)
   - Key schema validation happens at reducer execution time, errors shown in console

## Where Tests Would Go

**If testing were implemented:**

**Frontend Tests:**
- Location: `components/**/*.test.tsx` or `__tests__/` parallel to source
- Hooks: `components/features/auth/hooks/__tests__/useAuth.test.ts`
- Components: `components/features/admin-view/components/__tests__/AdminTabs.test.tsx`
- Data hooks: `components/features/costs/hooks/__tests__/useCharacterCostTable.test.ts`

**Backend Tests:**
- Location: `spacetimedb/src/**/*.test.ts`
- Reducers: `spacetimedb/src/reducers/__tests__/auth.test.ts`
- Helpers: `spacetimedb/src/helpers/__tests__/ensurePermissions.test.ts`
- Validators: `spacetimedb/src/reducers/__tests__/admin.test.ts` (focus on validateEnum, validateKeys)

## Critical Untested Areas

**High Risk:**

1. **Authentication Flow** (`components/features/auth/hooks/useAuth.ts`, lines 45-142)
   - Discord linking with intent flag expiry
   - Session management with SpacetimeDB connection
   - Auto-registration and subscription waiting
   - Deletion detection and logout flow

2. **Permission Enforcement** (`spacetimedb/src/helpers/ensurePermissions.ts`, `spacetimedb/src/reducers/admin.ts`)
   - ensureAdmin() and ensureTournamentHost() gate all admin operations
   - Enum validation with exact case-sensitive matching
   - Key schema validation (missing/extra field detection)
   - User deletion blocking rules (active lobbies, match steps)

3. **Data Synchronization** (`components/features/costs/hooks/useCharacterCostTable.ts`)
   - Cost map construction and filtering logic (lines 52-75)
   - Synergy lookup and pairing (lines 62-74, 95-100)
   - Sort direction and column handling (lines 143-157)

4. **Admin Operations** (`spacetimedb/src/reducers/admin.ts`)
   - Bulk upsert with key validation (lines 48-68)
   - Enum validation across all table types (lines 16-32)
   - Row deletion with state checks (lines 72-220)

**Medium Risk:**

1. **Error Handling** - Fetch failures in Discord link (useAuth.ts, line 101-110) not retried
2. **State Management** - Refs (`linkingRef`, `autoRegisteredRef`, `hadTokenOnMount`) not tested for race conditions
3. **Component Rendering** - Synergy expansion/collapse logic (CharacterCostTable.tsx, lines 90-132) has no coverage

## Recommended Test Strategy

**If test coverage were to be added, prioritize:**

1. **Unit tests** for validation functions (validateEnum, validateKeys, getAuthenticatedUser)
2. **Integration tests** for auth hook with mocked SpacetimeDB/NextAuth
3. **Component tests** for admin UI (BulkUpsert, TableExplorer) with form validation
4. **Reducer tests** simulating client reducer calls with varying permissions and data states

---

*Testing analysis: 2026-03-15*
