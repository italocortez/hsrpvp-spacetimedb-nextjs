# Testing Patterns

**Analysis Date:** 2026-04-12

## Test Framework

**Runner:**
- Vitest ^4.1.0
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
npm run test:all                # Unit + integration (full suite — triggers global-setup.ts DB clear)
npm run test:phase -- <path>    # Single directory integration tests
npx vitest run --config test/vitest.integration.config.ts <file>  # Single integration file
SKIP_DB_CLEAR=1 npm run test:all  # Full suite but skip DB clear (preserves existing state)
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
│                                         # Phase 14: globalSetup points to global-setup.ts; testTimeout=60s, hookTimeout=120s
├── global-setup.ts                       # Phase 14: pre-suite DB clear + reseed (spacetime publish --clear-database)
├── tsconfig.json                         # Test-specific TS config
├── shared/
│   ├── connection.ts                     # WebSocket test harness (createTestHarness, createVerifiedTestHarness)
│   │                                     # Phase 14: .withConfirmedReads(false), onApplied subscription readiness
│   ├── fixtures.ts                       # Test data constants + factories (UIDs, createAccountArgs)
│   ├── seed-data.ts                      # CLI script — seeds game data tables after publish
│   ├── bootstrap.ts                      # CLI script — register_server on fresh database
│   ├── load-env.ts                       # Loads .env.local vars for test process
│   ├── mocks/
│   │   └── spacetimedb-server.ts         # Mock for spacetimedb/server module (unit tests)
│   └── helpers/                          # Shared async setup/teardown flows (Phase 10.5)
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
    ├── achievements/                     # achievement-auto-award, achievement-checker.unit, achievement-management
    ├── anonymous-play/                   # anonymous-labels
    ├── auth/                             # auth-security, auth-views, ban-admin, server-link-provider
    ├── brackets/                         # bracket-generation.unit, bracket-advancement, group-to-elimination
    ├── calendar/                         # calendar-availability, calendar-events, calendar-saved
    ├── chat/                             # chat-messages
    ├── cost-sets/                        # cost-set-lifecycle
    ├── garbage-collector/                # identity-gc (Phase 12.1)
    ├── lobby/                            # account-selection, disconnect-*, lobby-lifecycle, lobby-presets, lobby-settings, lobby-slot-helpers.unit, lobby-tournament, ownership-validation.unit, flag-transfer-helpers.unit
    ├── match-results/                    # account-rating.unit, elo-calculation.unit, match-lifecycle, mmr-stats, rating-admin, referee-coach, score-entry
    │   ├── mmr-snapshot.test.ts          # NEW Phase 12.3 — accountRatingSnapshot captured at start_draft
    │   └── mmr-snapshot-betweengames.test.ts  # NEW Phase 12.3 — monotonic snapshot hook during BetweenGames
    ├── match-session/                    # draft-auction, draft-classic, draft-control, post-draft
    │   └── auto-pick-ownership-pool.test.ts   # NEW Phase 12.3 — timer_expiry_classic uses LMA pool for requireOwnership
    ├── roster/                           # account-deletion-guard, archetype-crud, roster-accounts, roster-characters, roster-helpers.unit, roster-migration
    │   └── migrate-roster-rating.test.ts      # NEW Phase 12.3 — D-D-04 migrate_roster rating recompute + D-G lobby guards
    ├── season/                           # season-admin, tournament-player-account
    └── tournaments/                      # tournament-admin, tournament-cancel-cleanup, tournament-helpers.unit, tournament-management, tournament-mmr, tournament-registration, tournament-stage-validation.unit, tournament-stages, tournament-teams
        └── tournament-ordering-guard.test.ts  # NEW Phase 12.3 — D-H-01 ordering guard + process_tournament_mmr
```

**Total test files: 63** (as of Phase 12.3 + Phase 14)
- 53 integration tests (`.test.ts`)
- 10 unit tests (`.unit.test.ts`)
- 58 pre-Phase 12.3 + 5 new Phase 12.3 files

## Phase 12.3 Test Files

| File | Tests |
|------|-------|
| `test/backend/match-results/mmr-snapshot.test.ts` | Verifies `accountRatingSnapshot` is captured on `MatchResultParticipant` when `start_draft` is called; checks value matches account's current rating |
| `test/backend/match-results/mmr-snapshot-betweengames.test.ts` | Verifies monotonic snapshot update during BetweenGames stage — changing account rating between games only updates snapshot if new value >= existing |
| `test/backend/match-session/auto-pick-ownership-pool.test.ts` | Verifies `timer_expiry_classic` auto-picks from the LobbyMemberAccount character pool when `requireOwnership=true` on the tournament |
| `test/backend/roster/migrate-roster-rating.test.ts` | Verifies D-D-04 fix: `migrate_roster` now recomputes `accountRating` on both source and target accounts; also verifies D-G lobby guard blocks migration when accounts are in active lobbies |
| `test/backend/tournaments/tournament-ordering-guard.test.ts` | Verifies D-H-01: `process_tournament_mmr` is blocked until tournament reaches terminal stage (Completed/Cancelled); verifies guard fires on in-progress tournaments |

## Phase 14 Test Infrastructure

**`test/global-setup.ts` (pre-suite database clear):**
- Runs ONCE before the entire integration suite via vitest `globalSetup`
- Executes `spacetime publish {dbName} --clear-database -y --module-path spacetimedb`
- Runs `npx tsx scripts/post-publish.ts` to re-register server identity and seed game data
- Refreshes `process.env.SPACETIMEDB_SERVER_TOKEN` with the rotated token from `.env.local`
- Safety guard: Refuses to wipe databases whose name does not contain `-test`
- Skip with `SKIP_DB_CLEAR=1` env var (useful when iterating on a single failing file)
- Why needed: Tests leak state with no auto-cleanup path (AwaitingResult lobbies, User rows, Cancelled Tournament rows). Without this, tables grow across runs and later tests hit timeout ceilings.

**`.withConfirmedReads(false)` on test connections:**
- Added in Phase 14 to match app behavior (Phase 12.2)
- Applied in `test/shared/connection.ts` on both the main connection builder and the server-token verification connection
- Ensures test subscription semantics match production subscription semantics

**`onApplied` subscription readiness:**
- Phase 14 replaced fixed-timeout `sync()` for initial subscription load with `subscriptionBuilder().onApplied(callback)`
- `onApplied` fires exactly when the initial subscription batch is committed to the client cache
- Resolves the TestHarness promise — subsequent test code can safely read from `conn.db.*`
- `sync()` is still used between reducer calls within tests (500ms default) to allow push updates to propagate

**Vitest timeout changes (Phase 14):**
- `testTimeout`: 60s (was 30s) — allows for more complex multi-user scenarios
- `hookTimeout`: 120s (was 30s) — allows for 6+ harness creation in `beforeAll` with verification roundtrips

## Vitest Configuration Details

**Unit config (`test/vitest.config.ts`):**
- Includes: `test/backend/**/*.unit.test.ts` only
- Aliases: `spacetimedb/server` → `test/shared/mocks/spacetimedb-server.ts` (module swap for all unit tests)
- Timeout: 5s test, 10s hook
- Fast: no SpacetimeDB connection required

**Integration config (`test/vitest.integration.config.ts`):**
- Includes: `test/backend/**/*.test.ts`, excludes `*.unit.test.ts`
- Loads `.env.local` via inline `loadEnvLocal()` function (Vite's envDir only exposes `VITE_*` prefixed vars)
- Timeout: 60s test, 120s hook — network round-trips to maincloud (raised in Phase 14)
- Sequential execution: `fileParallelism: false`, `sequence.concurrent: false` — tests share SpacetimeDB state
- Global setup: `['./test/global-setup.ts']` — pre-suite DB clear + reseed (Phase 14)
- Requires `SPACETIMEDB_SERVER_TOKEN` in `.env.local` for verified user test harnesses

## Test Structure

**Integration suite template:**
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
import { cleanupLobby } from '../../shared/helpers/lobbies';

describe.skipIf(!hasServerToken())('Domain Name', () => {
    let host: TestHarness;
    let joiner: TestHarness;
    const openedLobbyIds: number[] = [];

    beforeAll(async () => {
        host = await createVerifiedTestHarness();
        joiner = await createVerifiedTestHarness();
        // Note: harnesses resolve only after onApplied fires (Phase 14)
        // No explicit sync() needed after createVerifiedTestHarness() returns
    }, 120000);  // Phase 14: 120s hook timeout

    afterAll(async () => {
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

**Unit suite template:**
```typescript
/**
 * Unit tests for spacetimedb/src/helpers/{helperName}.ts
 *
 * Tests pure functions — no DB context needed.
 * Contract: docs/{feature}/architecture.md — {Section}
 */

import { describe, it, expect } from 'vitest';
import { functionName } from '../../../spacetimedb/src/helpers/helperName';

describe('functionName', () => {
    it('description of behavior', () => {
        expect(functionName(args)).toBe(expectedValue);
    });
});
```

**Key patterns:**
- `beforeAll` / `afterAll` only — no `beforeEach` / `afterEach`; state persists across tests in a suite (shared DB)
- Section comments inside `describe` blocks: `// ── section name ──────────────`
- Cleanup registered in arrays (`openedLobbyIds: number[]`) and swept in `afterAll`
- `describe.skipIf(!hasServerToken())` guards suites requiring a server token
- Harnesses resolve after `onApplied` — no `sync()` call needed immediately after creation (Phase 14)

## Phase 10.5 Cleanup Pattern (afterAll)

Phase 10.5 established the canonical cleanup pattern. All suites that open lobbies or tournaments use shared helpers:

```typescript
afterAll(async () => {
    for (const id of openedLobbyIds) {
        await cleanupLobby(host, [joiner], id).catch(() => {});
    }
    await host?.disconnect();
    await joiner?.disconnect();
});
```

`cleanupLobby` (from `test/shared/helpers/lobbies.ts`):
```typescript
export async function cleanupLobby(host, members, lobbyId): Promise<void> {
    for (const m of members) {
        try { await m.call.leaveLobby({ lobbyId }); } catch (_) {}
    }
    try { await host.call.closeLobby({ lobbyId }); } catch (_) {}
}
```

Cleanup helpers swallow all errors — test state may already be in a different shape.

## Mocking

**Strategy 1: Alias-based module swap (preferred for unit tests)**

The vitest unit config aliases `spacetimedb/server` to `test/shared/mocks/spacetimedb-server.ts` for all unit tests. No per-test mock declarations needed.

```typescript
// test/shared/mocks/spacetimedb-server.ts
export class SenderError extends Error { ... }
export function schema(...args: any[]) {
    return { reducer: (_config: any, handler: any) => handler };
}
export function table(...args: any[]) { return {}; }
function deepProxy(): any {
    return new Proxy(() => deepProxy(), {
        get: (_target, _prop) => deepProxy(),
    });
}
export const t = deepProxy();
```

**Strategy 2: `vi.mock` for specific dependencies**
```typescript
vi.mock('../../../spacetimedb/src/helpers/auditColumns', () => ({
    auditUpdate: vi.fn(() => ({})),
}));
const { validateUid } = await import('../../../spacetimedb/src/helpers/rosterHelpers');
```

**Strategy 3: Manual ctx mock objects**
```typescript
function mockCtx(opts: { matchResults?: any[]; lobbyMembers?: any[] }) {
    return {
        db: {
            MatchResultRecord: {
                lobby_id: {
                    filter: (lobbyId: number) =>
                        (opts.matchResults ?? []).filter((r: any) => r.lobbyId === lobbyId),
                },
            },
        },
    };
}
```

**What to mock:** `spacetimedb/server` module in all unit tests (via alias config); specific helper modules; `ctx.db` table access for helpers accepting `ctx: any`

**What NOT to mock:** Nothing in integration tests — all calls go to the live SpacetimeDB database on maincloud

## Fixtures and Factories

**Test Data Constants (`test/shared/fixtures.ts`):**
```typescript
export const UIDS = {
    america: '600000001',
    europe: '700000001',
    asia: '800000001',
    twHkMo: '900000001',
} as const;

export const INVALID_UIDS = {
    tooShort: '80012345',
    // ...
} as const;

let uidCounter = 0;
export function nextUid(region: '6' | '7' | '8' | '9' = '8'): string { ... }
export function resetUidCounter(): void { uidCounter = 0; }
```

**Factory functions (override pattern):**
```typescript
export function defaultLobbyArgs(overrides: Record<string, unknown> = {}) {
    return {
        joinCode: '',
        presetId: 0,
        teamSize: 1,
        draftMode: { tag: 'Classic' as const, value: {} },
        // ... all required fields with sensible defaults
        ...overrides,
    };
}
```

## Common Patterns

**Async State Read After Reducer Call:**
```typescript
await h.call.createHsrAccount({ uid, displayLabel: 'Label' });
await h.sync();  // waits 500ms for subscription cache to update
const row = [...h.conn.db.HsrAccount.iter()].find(r => r.uid === uid);
expect(row).toBeDefined();
```

**Private Table Query (non-public tables):**
```typescript
const rows = await queryPrivateTable(
    `SELECT * FROM hsr_account WHERE user_id = ${h.userId}`
);
// Parse string values from raw CLI output:
expect(account.is_active).toBe('true');          // boolean comes as string
expect(account.uid.replace(/"/g, '')).toBe(uid); // strings may have quotes
```

**Error Testing:**
```typescript
const msg = await expectReducerError(
    h.call.createHsrAccount({ uid: '8001234', displayLabel: 'Bad' })
);
expect(msg).toContain('9 digits');
```

**Multi-User Setup:**
```typescript
beforeAll(async () => {
    host = await createVerifiedTestHarness();
    joiner = await createVerifiedTestHarness();
    guest = await createTestHarness();  // unverified — for permission guard tests
    // All three resolve only after onApplied fires — subscription cache is ready
}, 120000);  // Phase 14: 120s covers 3+ harnesses on slow connections
```

**Conditional Suite Skip:**
```typescript
describe.skipIf(!hasServerToken())('Suite Name', () => {
    // Only runs when SPACETIMEDB_SERVER_TOKEN is in .env.local
});
```

**Idempotent Seeding:**
```typescript
export async function ensureEloConfig(admin: TestHarness): Promise<void> {
    try { await admin.call.adminSeedEloConfig({}); } catch (_) {}
    await admin.sync(500);
}
```

**Local Query Helpers (per-test file):**
```typescript
function myLobbies(h: TestHarness) {
    return [...h.conn.db.Lobby.iter()].filter(l => l.hostUserId === h.userId);
}
```
Reusable versions live in `test/shared/helpers/queries.ts`.

## Coverage

**Requirements:** No coverage thresholds enforced — no `--coverage` flag in any npm script

**Manual baseline:** Tracked in `test/README.md` — wall-clock time, file count, pass counts logged per milestone

## Test Types

**Unit Tests (`*.unit.test.ts`):**
- Target: pure helper functions in `spacetimedb/src/helpers/`
- No SpacetimeDB connection, no network
- Mock `spacetimedb/server` via vitest alias config
- Run with: `npm test` (fast, CI-safe)

**Integration Tests (`*.test.ts`):**
- Target: reducer behavior end-to-end against live SpacetimeDB on maincloud
- Connect via `createTestHarness()` or `createVerifiedTestHarness()` from `test/shared/connection.ts`
- Run sequentially — shared DB state
- Initial subscription cache ready via `onApplied` callback (Phase 14)
- Read state via WebSocket subscription cache (`conn.db.TableName.iter()`)
- Query private (non-public) tables via `spacetime sql` CLI (`queryPrivateTable()` helper)
- Require `SPACETIMEDB_SERVER_TOKEN` in `.env.local` for verified user harnesses
- Run with: `npm run test:integration`
- Timeout: 60s per test, 120s per hook (Phase 14)

**E2E Tests:**
- Not present — `test/frontend/` directory exists with only a README placeholder

---

*Testing analysis: 2026-04-12 (regenerated from 2026-04-09 to reflect Phase 12.3: 5 new test files (63 total), descriptions of new test coverage; Phase 14: global-setup.ts pre-suite DB clear, .withConfirmedReads(false) on test connections, onApplied subscription readiness, raised timeouts)*
