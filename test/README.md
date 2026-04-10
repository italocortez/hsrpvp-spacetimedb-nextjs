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

## Suite Runtime

Measured baseline for regression detection. Update this entry when the suite composition materially changes (new files, new fixtures, major refactors).

| Run | Date | Wall-Clock Time | File Count | Notes |
|-----|------|-----------------|------------|-------|
| Pre-stabilization (Phase 10.5 baseline) | 2026-04-05 | 54m39s | 41 integration files (486 tests) + 11 unit files (187 tests) | Captured on fresh `--delete-data=always` + bootstrap + seed — 0 failures, all 673/673 pass |
| Post-stabilization (Phase 10.5 final) | 2026-04-05 | 54m38s | 41 integration files (486 tests) + 11 unit files (187 tests) | 0 failures, 0 skipped — baseline after audit + cleanup refactor (helpers extracted + afterAll contract + pollution bisect) |
| Post-harness-modernization (Phase 14) | 2026-04-09 | 56m57s | 47 integration files (531 tests) + 11 unit files (197 tests) | onApplied subscription readiness replaces 2s setTimeout; .withConfirmedReads(false) on all builders; duplicate helpers deduplicated to shared queries.ts. 3 pre-existing bracket-advancement timeouts (210s+ of timeout waits); suite grew +6 files +45 tests vs Phase 10.5 baseline. Per-test time improved. |

**Commands:**
- Full suite: `npm run test:all`
- Integration only: `npm run test:integration`
- Single file: `npx vitest run --config test/vitest.integration.config.ts <path>`

**Reset sequence** (when test DB gets corrupted):
1. `spacetime publish --module-path spacetimedb --server maincloud --delete-data=always --yes hsrpvp-spacetimedb-nextjs-test1`
2. `spacetime generate --lang typescript --out-dir src/module_bindings --module-path spacetimedb`
3. `npx tsx test/shared/bootstrap.ts`
4. `npx tsx test/shared/seed-data.ts`
5. `npm run test:all`
