# Testing Patterns

**Analysis Date:** 2026-04-06

## Test Framework

**Runner:**
- Vitest 4.x
- Unit config: `test/vitest.config.ts`
- Integration config: `test/vitest.integration.config.ts`

**Assertion Library:**
- Vitest built-in (`expect`) — no separate assertion library

**Run Commands:**
```bash
npm test                        # Unit tests only (fast, no SpacetimeDB needed)
npm run test:watch              # Unit tests in watch mode
npm run test:integration        # Integration tests (requires live SpacetimeDB on maincloud)
npm run test:integration:watch  # Integration tests in watch mode
npm run test:all                # Unit + integration (full suite)
npm run test:phase -- <path>    # Single directory integration tests
npm run test:typecheck          # TypeScript type checking (tsc --noEmit)
npx vitest run --config test/vitest.integration.config.ts <file>  # Single integration file
```

## Test File Organization

**Location:** Separate `test/` directory (not co-located with source)

**Naming:**
- Integration tests: `test/backend/{feature}/{feature-group}.test.ts`
- Unit tests: `test/backend/{feature}/{subject}.unit.test.ts`
- The `.unit.test.ts` suffix is the discriminator — unit config includes only `*.unit.test.ts`; integration config excludes them

**Structure:**
```
test/
├── vitest.config.ts                      # Unit runner — includes *.unit.test.ts only
├── vitest.integration.config.ts          # Integration runner — includes *.test.ts, excludes *.unit.test.ts
├── tsconfig.json                         # Test-specific TS config
├── shared/
│   ├── connection.ts                     # WebSocket test harness (createTestHarness, createVerifiedTestHarness)
│   ├── fixtures.ts                       # Test data constants + factories (UIDs, createAccountArgs)
│   ├── seed-data.ts                      # CLI script — seeds game data tables after publish
│   ├── bootstrap.ts                      # CLI script — register_server on fresh database
│   ├── load-env.ts                       # Loads .env.local vars for test process
│   ├── mocks/
│   │   └── spacetimedb-server.ts         # Mock for spacetimedb/server module (unit tests)
│   └── helpers/
│       ├── lobbies.ts                    # defaultLobbyArgs, defaultSettingsArgs, cleanupLobby
│       ├── tournaments.ts                # createTournamentArgs, setupRegistrationTournament, advanceToInProgress
│       ├── users.ts                      # getUsername
│       ├── queries.ts                    # myLobbies, latestLobby, lobbyMembers, lobbyBans
│       ├── hsrAccounts.ts               # HSR account query helpers
│       ├── scores.ts                     # Score entry helpers
│       ├── drafts.ts                     # Draft flow helpers
│       ├── promoteUser.ts               # promoteUser (grants role via server token)
│       └── seed.ts                       # ensureEloConfig (idempotent seeding helpers)
└── backend/
    ├── roster/                           # roster-accounts, roster-characters, archetype-crud, etc.
    ├── lobby/                            # lobby-lifecycle, lobby-settings, disconnect-*, etc.
    ├── match-results/                    # elo-calculation (unit), match-lifecycle, mmr-stats, etc.
    ├── match-session/                    # draft-classic, draft-auction, draft-control, post-draft
    ├── tournaments/                      # tournament-management, tournament-registration, etc.
    ├── brackets/                         # bracket-generation (unit), bracket-advancement
    ├── achievements/                     # achievement-management, achievement-auto-award
    ├── season/                           # season-admin, tournament-player-account
    ├── calendar/                         # calendar-availability, calendar-events, calendar-saved
    ├── chat/                             # chat-messages
    ├── cost-sets/                        # cost-set-lifecycle
    └── anonymous-play/                   # anonymous-labels
```

## Test Structure

**Integration suite organization:**
```typescript
/**
 * Integration tests for {domain} reducers.
 *
 * Covers:
 * - reducer_name: scenario 1, scenario 2
 *
 * Requires: SPACETIMEDB_SERVER_TOKEN in .env.local
 *
 * Contract: docs/{feature}/contract.md — {Feature} scenarios
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createVerifiedTestHarness, hasServerToken, expectReducerError, type TestHarness } from '../../shared/connection';

describe.skipIf(!hasServerToken())('Domain Name', () => {
    let host: TestHarness;
    let joiner: TestHarness;
    const openedLobbyIds: number[] = [];

    beforeAll(async () => {
        host = await createVerifiedTestHarness();
        joiner = await createVerifiedTestHarness();
        await host.sync();
        await joiner.sync();
    }, 30000);  // extended timeout for multi-harness setup

    afterAll(async () => {
        // Cleanup all resources opened during the suite
        for (const id of openedLobbyIds) {
            await cleanupLobby(host, [joiner], id).catch(() => {});
        }
        await host?.disconnect();
        await joiner?.disconnect();
    });

    describe('reducer_name', () => {
        it('does the expected thing', async () => {
            await host.call.someReducer({ param: value });
            await host.sync();
            // assert via subscription cache
            const row = [...host.conn.db.TableName.iter()].find(r => r.field === value);
            expect(row).toBeDefined();
        });

        it('rejects invalid input', async () => {
            const msg = await expectReducerError(
                host.call.someReducer({ param: 'invalid' })
            );
            expect(msg).toContain('expected error text');
        });
    });
});
```

**Unit suite organization:**
```typescript
/**
 * Unit tests for spacetimedb/src/helpers/{helperName}.ts
 *
 * Tests pure functions — no DB context needed.
 * Contract: docs/{feature}/architecture.md — {Section}
 */

import { describe, it, expect } from 'vitest';
import { functionName, type TypeName } from '../../../spacetimedb/src/helpers/helperName';

const FIXTURE = { ... };

describe('functionName', () => {
    it('description of behavior', () => {
        expect(functionName(args)).toBe(expectedValue);
    });

    it('boundary case', () => {
        expect(functionName(boundaryArgs)).toBeCloseTo(0.5, 5);
    });
});
```

**Patterns:**
- `beforeAll` / `afterAll` — no `beforeEach` / `afterEach`; state persists across tests in a suite (shared DB)
- Section comments inside `describe` blocks: `// ── section name ──────────────`
- Cleanup registered in arrays (`openedLobbyIds: number[]`) and swept in `afterAll`
- `describe.skipIf(!hasServerToken())` guards suites requiring a server token (verified user tests)
- Nested `describe` groups match the reducer name being tested

## Mocking

**Framework:** Vitest built-in (`vi.mock`, `vi.fn`) + manual mock pattern

**Unit test approach — two strategies:**

**Strategy 1: Alias-based module swap (preferred)**
The vitest config in `test/vitest.config.ts` aliases `spacetimedb/server` to `test/shared/mocks/spacetimedb-server.ts` for all unit tests. No per-test mock declarations needed — the entire module is replaced at import time.

```typescript
// test/shared/mocks/spacetimedb-server.ts
export class SenderError extends Error { ... }
export function schema(...args: any[]) {
    return { reducer: (_config: any, handler: any) => handler };
}
export function table(...args: any[]) { return {}; }
// Fully recursive proxy — any property access or function call returns another proxy
function deepProxy(): any {
    return new Proxy(() => deepProxy(), {
        get: (_target, _prop) => deepProxy(),
    });
}
export const t = deepProxy();
```

**Strategy 2: `vi.mock` for specific dependencies**
Used when only a subset of an imported module needs mocking:
```typescript
vi.mock('../../../spacetimedb/src/helpers/auditColumns', () => ({
    auditUpdate: vi.fn(() => ({})),
}));

const { validateUid, deriveRegion } = await import(
    '../../../spacetimedb/src/helpers/rosterHelpers'
);
```

**Strategy 3: Manual ctx mock objects**
For helpers that take `ctx: any`, construct minimal mock objects:
```typescript
function mockCtx(opts: {
    matchResults?: any[];
    lobbyMembers?: any[];
    matchSession?: any;
}) {
    return {
        db: {
            MatchResultRecord: {
                lobby_id: {
                    filter: (lobbyId: number) =>
                        (opts.matchResults ?? []).filter((r: any) => r.lobbyId === lobbyId),
                },
            },
            // ... other tables
        },
    };
}
```

**What to Mock:**
- `spacetimedb/server` module in all unit tests (via alias config)
- Specific helper modules that touch tables when testing a caller that uses them (`auditColumns`)
- `ctx.db` table access when testing helpers that accept `ctx: any`

**What NOT to Mock:**
- Nothing in integration tests — all calls go to the live SpacetimeDB database on maincloud
- The pure math functions under test (`eloCalculation.ts`, `bracketGeneration.ts`) — these take plain numbers/arrays and need no mocking

## Fixtures and Factories

**Test Data Constants (`test/shared/fixtures.ts`):**
```typescript
// Typed region-keyed UID constants
export const UIDS = {
    america: '600000001',
    europe: '700000001',
    asia: '800000001',
    twHkMo: '900000001',
} as const;

// Invalid UIDs for negative tests
export const INVALID_UIDS = {
    tooShort: '80012345',
    // ...
} as const;

// Counter-based unique UID generator (call resetUidCounter() in beforeAll)
let uidCounter = 0;
export function nextUid(region: '6' | '7' | '8' | '9' = '8'): string { ... }
export function resetUidCounter(): void { uidCounter = 0; }
```

**Factory Functions (override pattern):**
```typescript
export function defaultLobbyArgs(overrides: Record<string, unknown> = {}) {
    return {
        joinCode: '',
        teamSize: 1,
        draftMode: { tag: 'Classic' as const, value: {} },
        // ... all required fields with sensible defaults
        ...overrides,  // caller overrides only what they care about
    };
}
```

**Location:** `test/shared/fixtures.ts` — test data constants and simple factories; `test/shared/helpers/` — reusable async setup/teardown flows

**Cleanup pattern:**
```typescript
export async function cleanupLobby(host, members, lobbyId): Promise<void> {
    for (const m of members) {
        try { await m.call.leaveLobby({ lobbyId }); } catch (_) {}
    }
    try { await host.call.closeLobby({ lobbyId }); } catch (_) {}
}
```
Cleanup helpers swallow all errors — the test state may already be in a different shape.

## Coverage

**Requirements:** No coverage thresholds enforced — no `--coverage` flag in any npm script

**View Coverage:**
```bash
npx vitest run --config test/vitest.config.ts --coverage
```

**Tracking:** Manual baseline table in `test/README.md` — wall-clock time, file count, pass counts logged per milestone.

## Test Types

**Unit Tests (`*.unit.test.ts`):**
- Target: pure helper functions in `spacetimedb/src/helpers/`
- No SpacetimeDB connection, no network
- Mock `spacetimedb/server` via vitest alias config
- Mock `ctx.db` with plain objects matching the DB access pattern
- Run with: `npm test` (fast, CI-safe)
- Located alongside integration tests in same feature subdirectory

**Integration Tests (`*.test.ts`):**
- Target: reducer behavior end-to-end against live SpacetimeDB on maincloud
- Connect via `createTestHarness()` or `createVerifiedTestHarness()` from `test/shared/connection.ts`
- Run sequentially (`fileParallelism: false`, `sequence.concurrent: false`) — shared DB state
- Read state via WebSocket subscription cache (`conn.db.TableName.iter()`)
- Query private (non-public) tables via `spacetime sql` CLI (`queryPrivateTable()` helper)
- Require `SPACETIMEDB_SERVER_TOKEN` in `.env.local` for verified user harnesses
- Run with: `npm run test:integration`
- Timeout: 30s per test, 30s per hook

**E2E Tests:**
- Not present — `test/frontend/` directory exists with only a README placeholder

## Common Patterns

**Async State Read After Reducer Call:**
```typescript
await h.call.createHsrAccount({ uid, displayLabel: 'Label' });
await h.sync();  // waits 500ms for subscription cache to update
const row = [...h.conn.db.TableName.iter()].find(r => r.field === value);
expect(row).toBeDefined();
```

**Private Table Query:**
```typescript
const rows = await queryPrivateTable(
    `SELECT * FROM hsr_account WHERE user_id = ${h.userId}`
);
// Parse string values from raw CLI output:
const account = rows[0];
expect(account.is_active).toBe('true');          // boolean comes as string
expect(account.uid.replace(/"/g, '')).toBe(uid); // strings may have quotes
```

**Error Testing:**
```typescript
const msg = await expectReducerError(
    h.call.createHsrAccount({ uid: '8001234', displayLabel: 'Bad' })
);
expect(msg).toContain('9 digits');  // partial string match
```

**Multi-User Setup:**
```typescript
beforeAll(async () => {
    host = await createVerifiedTestHarness();
    joiner = await createVerifiedTestHarness();
    guest = await createTestHarness();  // unverified — for permission guard tests
    await host.sync();
    await joiner.sync();
    await guest.sync();
}, 30000);  // 30s hook timeout for connection establishment
```

**Conditional Suite Skip:**
```typescript
describe.skipIf(!hasServerToken())('Suite Name', () => {
    // Only runs when SPACETIMEDB_SERVER_TOKEN is in .env.local
});
```

**Local Query Helpers (per-test file):**
Integration tests often define local query helpers at the top of the file for filtering subscription cache rows to the current user's data:
```typescript
function myLobbies(h: TestHarness) {
    return [...h.conn.db.Lobby.iter()].filter(l => l.hostUserId === h.userId);
}
```
Reusable versions live in `test/shared/helpers/queries.ts`.

**Idempotent Seeding:**
```typescript
// Seed singleton rows without caring if they already exist
await admin.call.adminSeedEloConfig({});
// Wrap in try/catch — subsequent inserts throw on duplicate
export async function ensureEloConfig(admin: TestHarness): Promise<void> {
    try { await admin.call.adminSeedEloConfig({}); } catch (_) {}
    await admin.sync(500);
}
```

---

*Testing analysis: 2026-04-06*
