# Test Suite

Automated tests for the HSRPVP SpacetimeDB project.

## Structure

```
test/
├── vitest.config.ts                  # Unit test config (no SpacetimeDB needed)
├── vitest.integration.config.ts      # Integration test config (needs running SpacetimeDB)
├── tsconfig.json                     # TypeScript config for test files
├── shared/
│   ├── connection.ts                 # SpacetimeDB WebSocket test harness
│   ├── fixtures.ts                   # Test data factories and constants
│   └── mocks/
│       └── spacetimedb-server.ts     # Mock for spacetimedb/server (unit tests only)
├── backend/
│   ├── roster/                       # Roster management tests (Phase 2)
│   │   ├── roster-accounts.test.ts
│   │   ├── roster-characters.test.ts
│   │   ├── roster-migration.test.ts
│   │   ├── archetype-crud.test.ts
│   │   └── roster-helpers.unit.test.ts
│   ├── auth/                         # Auth reducer tests (future)
│   ├── tournaments/                  # Tournament reducer tests (future)
│   ├── brackets/                     # Bracket reducer tests (future)
│   ├── cost-sets/                    # Cost set reducer tests (future)
│   ├── match-results/                # Match result reducer tests (future)
│   └── smoke/                        # Cold-start smoke tests (future)
└── frontend/                         # UI component tests (future)
```

## Commands

| Command | What it runs |
|---------|-------------|
| `npm test` | Unit tests only (fast, no deps) |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run test:integration` | Integration tests (needs SpacetimeDB running) |
| `npm run test:integration:watch` | Integration tests in watch mode |
| `npm run test:all` | Unit + integration |

## Prerequisites

### Unit tests
None. Just run `npm test`.

### Integration tests
1. SpacetimeDB module published: `npm run spacetime:publish`
2. SpacetimeDB server running (maincloud or local)
3. Set env vars if not using defaults:
   - `SPACETIMEDB_URI` (default: `wss://maincloud.spacetimedb.com`)
   - `SPACETIMEDB_DB` (default: `hsrpvp-spacetimedb-nextjs-test1`)

## Adding tests for new features

1. Create a directory under `test/backend/{feature}/`
2. Add `*.test.ts` files organized by reducer group
3. Connect via `createTestHarness()` from `test/shared/connection.ts`
4. Use `test/shared/fixtures.ts` for shared test data constants
