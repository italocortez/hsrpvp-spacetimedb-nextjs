---
name: uat
description: "Verification layer for the 3-layer development process (contract → architecture → verify). Governs behavior specs, test integrity, and failure diagnostics. Use whenever working with behavior specs, writing or running tests, bootstrapping after a database reset, or when an agent needs the intended behavior for a feature. Also trigger when the user mentions contract.md, architecture.md, docs/{feature}, vitest, test:integration, test:phase, verify-work, add-tests, post-publish bootstrap, or test failure diagnosis. Trigger keywords: uat, behavior spec, acceptance scenario, test, smoke test, integration test, test coverage, post-publish, npm test, npm run test:integration, vitest, Given/When/Then, contract.md, verify-work."
---

# UAT — Verification Layer

This skill governs the verification layer of the project's 3-layer development process:

| Layer | Location | Defines |
|-------|----------|---------|
| **Contract** | `docs/{feature}/contract.md` | WHAT should happen — acceptance scenarios, edge cases, error messages |
| **Architecture** | Code + `docs/{feature}/architecture.md` | HOW it's built — tables, reducers, data patterns |
| **Verification** | `test/**/*.test.ts` | COMPARE — does the architecture match the contract? |

Tests are the comparison mechanism. When a test fails, it reveals a gap between what was agreed upon (contract) and what was built (architecture). The user triages each gap: fix the architecture (bug) or update the contract (direction change).

## Table of Contents

1. [Process Integrity](#process-integrity) — Cardinal rules: test ownership, failure reporting, real-user flows
2. [The Spec Contract](#the-spec-contract) — Behavior specs lifecycle, provenance tracking
3. [Centralized Doc Pattern](#centralized-doc-pattern) — Where architecture + contract docs live
4. [Feature Index](#feature-index) — Map of features, spec status, coverage
5. [Writing Tests](#writing-tests) — Harness, fixtures, placement
6. [Running Tests](#running-tests) — Commands and when to use them
7. [Cold Start Smoke Test](#cold-start-smoke-test-maincloud) — Maincloud publish + verify
8. [Post-Publish Bootstrap](#post-publish-bootstrap) — `post-publish.ts` auto-setup
9. [UAT Test Harness](#uat-test-harness) — Primary approach for verify-work testing
10. [Known Limitations](#known-limitations) — `sync()` timing, flaky tests
11. [DB Snapshot Requirements](#db-snapshot-requirements) — Per-action query rules during UAT
12. [UAT Report Cards](#uat-report-cards) — Pause/interrupt documentation
13. [Test Structure](#test-structure) — Directory layout

## Process Integrity

These two guarantees protect the 3-layer process. If either is violated, the verification layer becomes unreliable — you can no longer trust test results to accurately compare contract against architecture.

### 1. Test Code Is User-Controlled

**Never create, edit, or delete any test file without an explicit, direct task from the user.**

This applies to ALL files in the test infrastructure:
- Test files (`test/**/*.test.ts`)
- Shared harness (`test/shared/connection.ts`, `test/shared/fixtures.ts`)
- Mocks (`test/shared/mocks/*`)
- Config files (`test/vitest.config.ts`, `test/vitest.integration.config.ts`)
- Data templates (`test/data-templates/*`)
- Any file under `test/`

**What you CAN do without approval:**
- Read any test file to understand structure, patterns, or coverage
- Research how a test could be written or improved
- Suggest specific changes with code snippets
- Identify gaps in test coverage
- Propose new test scenarios based on behavior specs

**What you CANNOT do without explicit user instruction:**
- Write a new test file
- Modify an existing test file (even "minor" fixes like imports, typos, or formatting)
- Delete or rename a test file
- Update shared test utilities or fixtures
- Change test configuration

When you have suggestions, present them as proposals: *"Here's how I'd write this test — want me to create it?"* Then wait.

**Generation vs. Verification:** Approved generation workflows like `/gsd:add-tests` are an explicit user task — the user has approved test creation through the workflow's approval steps. During generation, fixing your own syntax mistakes before the test is accepted doesn't violate verification integrity. Once tests exist in the repo and you're running them to compare contract vs. architecture, these rules fully apply.

### 2. Failures Are Diagnostic — Report, Never Fix

**When running tests (`npm test`, `npm run test:integration`, etc.), failures are the diagnostic signal. Never auto-fix them.**

A test failure means the architecture doesn't match the contract. That gap is the information — the user triages each failure into one of two outcomes:
- **Architecture bug** — the code doesn't do what the spec says → fix the code
- **Direction change** — the spec needs updating to reflect new intent → update the contract

**On any test failure or error, you must:**
1. Report the full failure output (test name, assertion message, expected vs actual)
2. Identify which behavior spec scenario the failing test maps to
3. Note whether the failure is in the test logic or the backend implementation
4. Log a summary of all failures with clear categorization

**You must NOT:**
- Modify test code to make a failing test pass
- Skip, disable, or mark tests as `.todo` / `.skip`
- Change assertions to match current (broken) behavior
- Fix the backend code that a test is exposing as broken — unless the user gives you that task separately
- Retry tests hoping for a different result (flaky tests are a finding, not a retry opportunity)

**Failure report format:**
```
## Test Run Results — {feature} — {date}

### Failures ({count})

| Test | Spec Scenario | Failure | Category |
|------|--------------|---------|----------|
| {test name} | {spec section reference} | {expected vs actual} | test-logic / backend-bug / env-issue |

### Errors ({count})
{Stack traces or connection errors — raw, unedited}

### Passing ({count})
{Summary only — no need to list each one}
```

**Category definitions:**
- **test-logic** — The test itself may have a bug (wrong assertion, stale fixture, race condition)
- **backend-bug** — The backend behavior doesn't match the spec; the test is correct
- **env-issue** — Connection failures, missing env vars, database not published, timeout

After reporting, you may offer analysis: *"These failures look like an architecture bug — the reducer isn't enforcing the validation from the contract. Want me to investigate the reducer code?"* But do not act without the user's go-ahead.

### 3. Every Fix MUST Mirror Real User Flows — No Exceptions

**After implementing ANY fix — backend or test — you MUST answer this question before moving on: "Is this how a real user would interact with the reducers, or am I just making tests pass?"**

**A test that passes for the wrong reasons is worse than a test that fails.** It gives false confidence that the system works when it doesn't. If your fix requires data, access patterns, or call sequences that a real client would never use, the fix is WRONG — even if the test turns green. You are papering over a real problem.

**MANDATORY checklist — run through ALL of these after every fix:**
- Does the data I'm using come from public subscription tables that a real client would have?
- Does the call sequence match what a real user/client would do (connect → login → subscribe → call reducers)?
- Am I filtering/querying data the same way the frontend would?
- If I added a helper or exposed new data on the test harness, would a real client have equivalent access?

**If the answer to ANY of these is "no", STOP. Do not proceed. Do not commit.** Re-examine the fix. The test infrastructure must simulate real usage — not bypass it.

### 4. `subscribeToAllTables()` Requires View-Accurate Filtering

**The test harness uses `subscribeToAllTables()` for convenience. This is NOT how the real frontend works.** In production, clients subscribe to scoped views that only return data the user should see (e.g., "my accounts", "my tournament"). `subscribeToAllTables()` returns EVERYTHING — all users, all accounts, all data.

**This means: if you use `iter()` after `subscribeToAllTables()`, you MUST filter that data to simulate the view the real client would have.** The filter MUST match exactly how the production view/subscription would scope the data.

| Production pattern | Test equivalent with `subscribeToAllTables()` |
|---|---|
| Subscribe to "my accounts" view → get only my rows | `iter().filter(a => a.userId === h.userId)` |
| Subscribe to tournament X → get only that tournament's data | `iter().filter(m => m.tournamentId === targetId)` |
| Subscribe to lobby members → get only current lobby | `iter().filter(m => m.lobbyId === currentLobbyId)` |

**Unfiltered `iter()` in tests is a bug.** It returns cross-user data that a real client would never see. Tests that pass on unfiltered `iter()` prove nothing — they're testing against data the user would never have. Every `iter()` call in a test MUST be filtered to match the production subscription scope.

**If you don't know how the production view would filter, check:**
1. `spacetimedb/src/views/` for existing view definitions
2. The bandwidth rules in the spacetimedb skill (subscription strategy section)
3. `docs/{feature}/architecture.md` for data access patterns

**Never invent a filter just to make a test pass.** The filter must correspond to a real subscription boundary.

### GSD Integration

The verification layer maps to GSD workflows:

| GSD Workflow | Layer | Verification Rules |
|---|---|---|
| `/gsd:discuss-phase` | Contract | Produces decisions → user approves spec updates |
| `/gsd:execute-phase` | Architecture | Builds the code — does not modify contract during execution |
| Post-execution | Contract | Claude updates contract with additions, tagged `Phase X execution` in Phase History |
| `/gsd:verify-work` | Verification (manual) | Manual harness UAT — exercise reducers step-by-step, confirm behavior with user, find bugs |
| `/gsd:add-tests` | Verification (automated) | Generate vitest files from confirmed-correct behavior — regression safety net |
| `npm test` | Verification (regression) | Run existing tests — failures are diagnostic, never auto-fixed |

**Per-phase order:** Always `verify-work` first, then `add-tests`. Manual UAT finds bugs while context is fresh. Automated tests lock in the confirmed behavior afterward. Writing automated tests before manual UAT is wasteful — bugs found during UAT would invalidate the tests.

---

## The Spec Contract

Every backend feature has a **behavior spec** at `docs/{feature}/contract.md`. This is the single source of truth for expected behavior — acceptance scenarios, edge cases, error messages, and integration points.

### Lifecycle

```
Phase Discussion (CONTEXT.md)
  → User approves behavior spec updates          [source: Phase X CONTEXT.md]
    → Spec becomes the acceptance criteria
      → Execution builds code (may add beyond spec)
        → Claude updates contract with additions  [source: Phase X execution]
          → verify-work: writes tests, runs them, reports results
            → User reviews execution-sourced entries + test results together
              → User approves, modifies, or rejects additions
```

### Rules

1. **Specs update after phase discussions**, when new decisions are finalized — not during execution
2. **Never modify behavior specs during execution.** If a spec has gaps, report what you would write but stop
3. **After execution, update the contract with provenance.** As the final step of the execution workflow (while context is fresh, before `/clear`), add new scenarios, reducers, and edge cases for anything built beyond the original spec. Every addition must be tagged with its source in the Phase History table:
   - User decisions: `Phase 3 CONTEXT.md`
   - Claude additions: `Phase 3 execution`
4. **Each acceptance scenario maps to at least one test case** — scenarios should be concrete enough to become tests
5. **Specs describe WHAT should happen**, not HOW — no implementation details, no code patterns
6. **Track contract coverage honestly.** A spec is "complete" when every reducer has: at least one acceptance scenario, error paths in the edge cases table, and permissions documented. A spec with missing reducers is "partial"

### Creating or Updating a Spec

Read `references/workflow-doc-template.md` for the full template. Key sections:

- **Reducers** — purpose, permissions, parameters, flow, state changes, error cases
- **Acceptance Scenarios** — Given/When/Then format
- **Edge Cases** — boundary conditions and expected behavior
- **Integration Points** — cross-feature dependencies
- **Phase History** — which discussion established each decision (audit trail)

Reference example: `docs/tournament/contract.md` (the most complete spec — but still partial; use it as a structural reference, not a coverage target).

### Provenance Tracking

Every entry in a contract's Phase History table must have a source that identifies where the decision came from:

| Source pattern | Meaning | Example |
|---------------|---------|---------|
| `Phase X CONTEXT.md` | User-approved during discussion | `Stages forward-only, no Paused` |
| `Phase X RESEARCH.md` | Established during research | `BracketSide enum has 5 variants` |
| `Phase X execution` | Claude-added during implementation | `Added reject_team_request — needed for team join flow` |

**Provenance rule of thumb:** If the reducer or behavior was discussed in CONTEXT.md (even at a high level), tag it as `CONTEXT.md` — the specific error messages, parameters, and edge cases inherit the parent reducer's provenance. Tag as `execution` only for supporting reducers the user never mentioned.

During `/gsd:verify-work`, the user reviews execution-sourced entries and approves, modifies, or rejects them. This is how the contract stays current without losing visibility into what was the user's decision vs Claude's discretion.

## Centralized Doc Pattern

Each backend feature has documentation under `docs/{feature}/`:

| Location | Contains | Describes | Update when |
|----------|----------|-----------|-------------|
| `docs/{feature}/architecture.md` | Table diagrams, reducer reference, data patterns | **HOW** data is structured | Backend code changes |
| `docs/{feature}/contract.md` | Acceptance scenarios, edge cases, phase history | **WHAT** should happen | Phase discussions conclude; after execution with provenance tags |

Architecture docs cross-reference behavior specs. No duplication between them.

## Feature Index

Read `references/test-index.md` for the full map of features, their spec status (complete / stub / missing), test coverage, and file paths.

## Writing Tests

> **Reminder:** Test code is user-controlled. Only write or modify tests when the user gives you a direct task to do so. You can research and propose tests at any time, but stop before touching files.

When the user asks you to write tests:

1. Read the **behavior spec** (`docs/{feature}/contract.md`) — this has the acceptance scenarios your tests validate against
2. Optionally read the architecture doc (`docs/{feature}/architecture.md`) for table/reducer context
3. Import `createTestHarness` / `createVerifiedTestHarness` from `test/shared/connection.ts`
4. Use `test/shared/fixtures.ts` for data factories
5. **Use shared helpers from `test/shared/helpers/`** — never inline helpers that already exist there
6. Each test validates a behavior from the spec's Acceptance Scenarios section
7. Place test files in `test/backend/{feature}/`

### Shared Helpers (`test/shared/helpers/`)

Always import from these instead of writing inline copies. Phase 10.5 extracted these to eliminate 70+ duplicated helpers that caused typecheck drift and maintenance burden.

| Helper | File | What it provides |
|--------|------|-----------------|
| `promoteUser`, `promoteToRole` | `promoteUser.ts` | Promote a user to a role via server connection |
| `defaultLobbyArgs` | `lobbies.ts` | Union-superset defaults for `create_lobby` (includes all required fields) |
| `defaultSettingsArgs` | `lobbies.ts` | Union-superset defaults for `update_lobby_settings` |
| `cleanupLobby` | `lobbies.ts` | Leave all members + close lobby (swallows errors) |
| `gameScoreArgs` | `scores.ts` | Defaults for `record_game_scores` with all optional fields as `undefined` |
| `createTournamentArgs` | `tournaments.ts` | Union-superset defaults for `create_tournament` (includes `maxAccountsPerPlayer`) |
| `setupRegistrationTournament` | `tournaments.ts` | Create tournament → Registration → register players |
| `advanceToInProgress` | `tournaments.ts` | Registration → Seeding → seed → generate → InProgress |
| `cleanupTournament` | `tournaments.ts` | Cancel tournament (swallows errors) |
| `completeDraft`, `advanceToScoring` | `drafts.ts` | Run a full draft sequence to completion |
| `ensureHsrAccount` | `hsrAccounts.ts` | Idempotent HSR account creation per user |
| `ensureEloConfig` | `seed.ts` | Idempotent Elo config seeding |
| `getUsername` | `users.ts` | Get username from harness user ID |
| `myLobbies`, `lobbyMembers` | `queries.ts` | Common query shortcuts |

When a new reducer adds a required field (like Phase 10.4 added `maxAccountsPerPlayer`), update the shared helper — all callers inherit the fix.

### afterAll Cleanup Contract

**Every test file that creates lobbies, tournaments, achievements, or calendar events MUST clean up in `afterAll`.** This prevents cross-file state pollution when `npm run test:all` runs files sequentially on the same DB.

Pattern:
```typescript
const createdLobbyIds: number[] = [];
const createdTournamentIds: number[] = [];

// In tests — track every created resource
createdLobbyIds.push(lobbyId);

// afterAll — unconditional cleanup
afterAll(async () => {
    for (const id of createdTournamentIds) {
        await cleanupTournament(toUser, id);
    }
    for (const id of createdLobbyIds) {
        await cleanupLobby(host, members, id);
    }
});
```

**Why:** Phase 10.4 exposed that tests pass in isolation but fail in suite due to leftover rows from earlier files (orphaned lobbies, tournaments, achievements). Phase 10.5 added this contract to all 13 affected files and verified the full suite runs green on both fresh and populated DBs.

### TypeScript Correctness for Reducer Args

When writing reducer calls in tests, match the generated bindings exactly:

1. **Unit enums** — `{ tag: 'BluePlayer' }`, NOT `{ tag: 'BluePlayer', value: {} }`. The SDK tolerates the extra property at runtime but TypeScript flags it.
2. **Optional fields** — pass `undefined` for optional reducer params you don't need (e.g. `teamBlueScore: undefined`). Don't omit them — the generated type requires all keys.
3. **All required fields** — include every field the reducer expects. When new fields are added to reducers, update the shared helpers first, then callers inherit.

### Environment

Integration tests connect to a live SpacetimeDB instance. Configuration:

| Env var | Default | Purpose |
|---------|---------|---------|
| `SPACETIMEDB_URI` | `wss://maincloud.spacetimedb.com` | WebSocket endpoint |
| `SPACETIMEDB_DB` | `hsrpvp-spacetimedb-nextjs-test1` | Database name |
| `SPACETIMEDB_SERVER_TOKEN` | — | Required for verified user tests |

Set these in `.env.local` (written by `post-publish.ts`). The integration test runner (`vitest.integration.config.ts`) loads `.env.local` only — do NOT use `.env.test` (it is not loaded by the test config).

## Running Tests

> **Reminder:** When tests fail, report the results — do not fix them. See "Failures Are Diagnostic" above.

| Command | What it runs | When to use |
|---------|-------------|-------------|
| `npm test` | Unit tests only (fast, no deps) | After any code change |
| `npm run test:integration` | Integration tests (needs live SpacetimeDB) | After spacetime publish |
| `npm run test:phase -- test/backend/{feature}` | Single feature tests | During feature development |
| `npm run test:all` | Unit + integration combined | Full verification |
| `npm run test:watch` | Unit tests in watch mode | During active development |
| `npm run test:integration:watch` | Integration tests in watch mode | Debugging integration issues |

After running any test command, always produce the failure report format from Cardinal Rule 2, regardless of whether you were explicitly asked for a report. If all tests pass, a brief "All {count} tests passing" is sufficient.

## Cold Start Smoke Test (Maincloud)

This project publishes to SpacetimeDB maincloud (hosted). There is no local server to start/stop. A cold start smoke test for this project means:

1. **Publish the module** — `spacetime publish hsrpvp-spacetimedb-nextjs-test1 -y` (compiles and deploys)
2. **Check logs** — `spacetime logs hsrpvp-spacetimedb-nextjs-test1` (no startup errors)
3. **Run a basic query** — `spacetime sql hsrpvp-spacetimedb-nextjs-test1 "SELECT * FROM user"` (returns results or empty set without errors)

Do NOT include `spacetime start` or instructions to "kill the server" — maincloud is always running. Only use `--clear-database` when the plan explicitly requires it (e.g., destructive PK migrations).

## Post-Publish Bootstrap

After every `spacetime publish --clear-database`:

```bash
npx tsx scripts/post-publish.ts
```

This auto-bootstraps: fresh identity → writes token to `.env.local` → `register_server` → seeds game data from `test/data/` JSONs.

## UAT Test Harness

**The test harness is the primary approach for all UAT verification.** Use `test/shared/connection.ts` to write standalone `.ts` scripts that exercise reducers with real WebSocket connections. Do NOT use `spacetime call` — it requires manual CLI identity management, supports only one user, and has no typed error handling.

### Why harness over CLI

| | Test Harness | `spacetime call` |
|---|---|---|
| Multi-user scenarios | Create N harnesses = N independent users | One CLI identity only |
| Typed reducer calls | `h.call.someReducer({...})` with autocomplete | Manual JSON args, easy to misformat |
| Error handling | Promise rejects with SenderError message | Exit code 1, parse stderr |
| Subscription cache | `h.conn.db.Table.iter()` for in-memory reads | Must use `spacetime sql` for everything |
| User creation | Automatic (guest or verified) on connect | Manual bootstrap (login_as_guest + manage-user.ts) |

### Harness types

```typescript
import { createTestHarness, createVerifiedTestHarness, expectReducerError } from 'test/shared/connection';
```

| Function | User type | Use for |
|---|---|---|
| `createTestHarness()` | Guest | Permission guard tests (expect rejection) |
| `createVerifiedTestHarness()` | Verified (discord-linked) | Most feature tests — requires `SPACETIMEDB_SERVER_TOKEN` in `.env.local` |

### Role promotion

The harness creates Guest or Verified (User-role) users. For tests requiring TournamentHost, Admin, or Moderator roles, promote after creation:

```bash
SPACETIMEDB_DB_NAME=<db-name> npx tsx scripts/manage-user.ts set-role <username> <role>
```

To promote within a script, create a server-token connection (same pattern as `verifyUserViaServerConnection` in `test/shared/connection.ts` — connect with `.withToken(SERVER_TOKEN)`, then call `serverConn.reducers.serverSetRole({...})`).

### Writing a UAT test script

Write standalone `.ts` scripts (NOT vitest test files) in `tmp/` for UAT verification. These are disposable — they exist to exercise reducers step-by-step and produce snapshots.

```typescript
// tmp/uat-test-X.ts
import { loadEnvFile } from 'node:process';
loadEnvFile('.env.local');

import { createVerifiedTestHarness, expectReducerError } from '../test/shared/connection';

async function main() {
  // Each harness = independent user with WebSocket connection
  const userA = await createVerifiedTestHarness();
  console.log(`User A: id=${userA.userId}`);

  // Promote role if needed (via manage-user.ts or inline server connection)

  // Step 1: Call a reducer
  await userA.call.someReducer({ param: 'value' });
  await userA.sync();

  // Read from subscription cache (filter to simulate real client view)
  const rows = [...userA.conn.db.SomeTable.iter()].filter(r => r.userId === userA.userId);
  console.log('Rows:', rows);

  // Step 2: Expect a rejection
  const err = await expectReducerError(userA.call.someReducer({ param: 'invalid' }));
  console.log('Expected error:', err);

  // Multi-user: create additional harnesses as needed
  const userB = await createVerifiedTestHarness();
  await userB.call.anotherReducer({ id: 1 });
  await userB.sync();

  await userA.disconnect();
  await userB.disconnect();
}

main().catch(console.error);
```

Run with: `npx tsx tmp/uat-test-X.ts`

### Always in consideration

1. **Test at the correct permission level.** Use `createTestHarness()` (guest) for permission-guard tests. Use `createVerifiedTestHarness()` (verified user) for most feature tests. Promote via `manage-user.ts` only when the test requires an elevated role. Do not promote every harness to Admin — test at the minimum role the feature requires.
2. **Format all table output as markdown tables** in the conversation — never raw ASCII.
3. **Snapshot every table touched** — see [DB Snapshot Requirements](#db-snapshot-requirements). Use `spacetime sql` for authoritative snapshots (the subscription cache may lag behind due to `sync()` timing).

## Known Limitations

### `sync()` is a naive sleep

The test harness's `sync(ms?)` method (from `test/shared/connection.ts`) is a `setTimeout` wrapper, not a real subscription sync. It defaults to 500ms, which is usually enough for the subscription cache to update after a reducer call, but:

- **It can cause flaky tests** if the server is under load or the network is slow — the cache may not have updated within the sleep window
- **It's not event-driven** — there's no "wait until the subscription confirms this row exists" primitive in the SpacetimeDB client SDK yet
- **Workaround:** Increase the sleep duration for tests that depend on seeing inserted rows immediately after a reducer call. The 2000ms initial sync after connection (line 99 of `connection.ts`) is also a sleep.

When SpacetimeDB adds a subscription sync primitive, `sync()` should be replaced. Until then, treat flaky tests that pass on retry as a `sync()` timing issue, not a backend bug — categorize as **test-logic** in the failure report.

## DB Snapshot Requirements

During UAT verification (`/gsd:verify-work`), every reducer call MUST be followed by a live database query showing the actual state of the tables that action touched. Snapshots are the proof that the reducer did what it claims.

### Rules

1. **Query after each individual action.** Run `spacetime sql` on the affected table(s) immediately after each reducer call — not after a batch of calls. Each step gets its own snapshot.
2. **Query the DB after EVERY state-changing action.** A script that runs 8 reducer calls and prints console.log output is NOT a substitute for per-step DB snapshots. The pattern is: call one reducer → `spacetime sql` → call next reducer → `spacetime sql`. The presentation can be batched after all snapshots are collected, but the queries must happen between each step.
3. **Show only tables the action touched.** If a reducer only modifies one table, only query that table. Don't dump unrelated tables.
4. **Never reconstruct snapshots.** If you ran a batch test, the final DB state does NOT count as per-step snapshots. You must run actions individually with a query between each one.
5. **Include snapshots in all outputs:**
   - Inline conversation when presenting checkpoint results to the user
   - Written UAT files (`.planning/phases/XX-name/{phase_num}-UAT.md`)
   - Report cards (`notes/reportcards/uat/backend-testing/`)
6. **Present each snapshot with context.** Every snapshot in the conversation uses this format:

   **{Action Description}** (as a title/header)

   {markdown table from spacetime sql}

   {narration}: "{user id} ({role/label}) does {action} on {target}" — highlight what changed vs the previous snapshot.

   Example:
   ```
   **Moderator promotes target to TournamentHost**

   | id | username | role |
   |----|----------|------|
   | 101 | TestUser_abc | tournamentHost |

   User 100 (Moderator) called `mod_promote_to_host` on user 101 — role changed from `user` → `tournamentHost`.
   ```

   The user must be able to scan the progression and immediately see who acted, what changed, and whether the result is correct. Raw tables without narration force mental diffing — don't do that.

7. **Color-code entities with emoji markers.** Assign colored emoji (🔴🔵🟢🟡🟣🟠) to participant/team/user IDs the first time they appear. Use the same color for that ID across ALL tables and steps so the user can track entities through the progression. Use `*BYE*` for empty opponent slots. Example:

   ```
   | id | participant1 | participant2 | winner |
   |----|--------------|--------------|--------|
   | 101 | 🔴 5 | 🔵 8 | 🔴 5 |
   | 102 | 🟢 6 | *BYE* | 🟢 6 |
   ```

### Implementation

Run each reducer call individually, then immediately `spacetime sql` the affected tables. Collect all snapshot outputs. Then present the full progression as one formatted story.

The pattern:
1. Call reducer (via harness script or `spacetime call`)
2. `spacetime sql` — capture the output
3. Call next reducer
4. `spacetime sql` — capture the output
5. Repeat until done
6. **Present all collected snapshots as a formatted progression** — see format in rule 6

A single harness script CAN do multiple steps, as long as it pauses for a `spacetime sql` query between each one. The rule is **query after each action** — not one script per action.

For rejection tests (no state change), group them in one script with `expectReducerError`. Present results as a summary table of caller/action/error. One final snapshot confirms no state changed.

## UAT Report Cards

When a UAT session is **paused, abandoned, or interrupted** to work on something else (e.g., fixing a different phase's failures), write a report card before switching context.

**Location:** `notes/reportcards/uat/backend-testing/`
**Naming:** `Phase-{X}_{YYYY-MM-DD}_{n}.md` (n increments for multiple reports same day)
**Template:** Read `references/uat-report-card-template.md` for the full template.

**Required sections:**
1. **What we did** — actions taken, commands run, what was verified
2. **Errors encountered** — found+fixed and found+not-fixed, with details
3. **What we covered** — test-by-test status table + additional coverage
4. **Where we stopped and why** — which test, what forced the context switch
5. **Next steps** — what must happen before resuming

This creates a paper trail independent of the UAT.md file. When a UAT spans multiple sessions or context resets, the report cards tell the full story.

## Test Structure

```
test/
├── shared/
│   ├── connection.ts   # Test harness (createTestHarness, createVerifiedTestHarness)
│   ├── fixtures.ts     # Data factories
│   ├── helpers/        # Shared reducer arg helpers (Phase 10.5) — see Writing Tests
│   └── mocks/
├── data/               # GITIGNORED — raw game data JSONs
├── data-templates/     # COMMITTED — shows expected JSON structure
├── backend/{feature}/  # Feature tests (.test.ts files)
└── frontend/           # Future (v1.0)
```
