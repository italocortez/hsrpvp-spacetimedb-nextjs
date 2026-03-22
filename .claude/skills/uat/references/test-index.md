# UAT Feature Index

Entry point for any agent or human working with behavior specs and tests. Maps every feature to its spec status, architecture doc, and test coverage.

> **A PostToolUse hook reminds you to update this index** when test files or docs change. Keep it current.

## Backend Features

| Feature | Behavior Spec | Coverage | Architecture Doc | Tests | Phases |
|---------|--------------|----------|-----------------|-------|--------|
| **Auth** | Stub | -- | `docs/auth/architecture.md` | None yet | Phase 1 |
| **Roster** | `docs/roster/contract.md` | Complete | `docs/roster/architecture.md` | 5 test files | Phase 2 |
| **Tournaments** | `docs/tournament/contract.md` | Partial (10/20 reducers missing) | `docs/tournament/architecture.md` | None yet | Phase 3, 4 |
| **Brackets** | Stub | -- | `docs/brackets/architecture.md` | None yet | Phase 4 |
| **Cost Sets** | Stub | -- | `docs/cost-sets/architecture.md` | None yet | Phase 3 |
| **Match Results** | Stub | -- | `docs/match-results/architecture.md` | None yet | Phase 3, 5 |
| **Smoke** | Stub | -- | -- (cross-cutting) | None yet | Cross-phase |
| **Achievements** | No spec | -- | `docs/achievements/architecture.md` | None yet | Future |
| **Archetypes** | No spec | -- | `docs/archetypes/architecture.md` | None yet | Future |
| **Calendar** | No spec | -- | `docs/calendar/architecture.md` | None yet | Future |
| **Chat** | No spec | -- | `docs/chat/architecture.md` | None yet | Future |
| **Cost Tables** | No spec | -- | `docs/cost-tables/architecture.md` | None yet | Future |
| **Lobby** | No spec | -- | `docs/lobby/architecture.md` | None yet | Future |
| **Match Session** | No spec | -- | `docs/match-session/architecture.md` | None yet | Future |
| **MMR** | No spec | -- | `docs/mmr/architecture.md` | None yet | Future |
| **Player Stats** | No spec | -- | `docs/player-stats/architecture.md` | None yet | Future |
| **Teams** | No spec | -- | `docs/teams/architecture.md` | None yet | Future |
| **Views** | No spec | -- | `docs/views/architecture.md` | None yet | Future |

> **Coverage key:**
> - **Complete** = every implemented reducer has acceptance scenarios and error paths documented
> - **Partial** = contract exists with some scenarios but not all implemented reducers are covered
> - **Stub** = placeholder contract exists at `docs/{feature}/contract.md` but has no acceptance scenarios yet
> - **No spec** = architecture doc exists but no contract.md yet -- will be added as development reaches this feature
>
> Use `references/workflow-doc-template.md` when creating or fleshing out a behavior spec.

## Frontend Features

| Feature | Test Directory | Status |
|---------|---------------|--------|
| *(None yet)* | `test/frontend/` | Placeholder -- v1.0 milestone |

## Shared Infrastructure

| File | Purpose |
|------|---------|
| `test/shared/connection.ts` | WebSocket test harness -- `createTestHarness()`, `createVerifiedTestHarness()`, `expectReducerError()`, `sleep()`, `hasServerToken()` |
| `test/shared/fixtures.ts` | Data factories -- `nextUid()`, `createAccountArgs()`, `characterBatch()`, `resetUidCounter()`, etc. |
| `test/shared/mocks/spacetimedb-server.ts` | Mock for unit tests (no live SpacetimeDB needed) |

## Operational Scripts

| Script | Purpose | When to run |
|--------|---------|-------------|
| `scripts/post-publish.ts` | Bootstrap after `--clear-database` -- identity, server, seed data | After every destructive publish |
| `scripts/seed-data.ts` | Standalone game data seeder (characters, lightcones, costs) | When you need to re-seed without full bootstrap |
| `scripts/register-server.ts` | Register server identity only | First-time setup or manual re-register |
| `scripts/manage-user.ts` | User management utilities (set-role, delete) | Admin operations |

## Data

| Directory | Committed | Contents |
|-----------|-----------|----------|
| `test/data/` | No (gitignored) | Raw game data JSONs -- private |
| `test/data-templates/` | Yes | Example JSON structure with 1-2 rows per template |

## Updating This Index

A PostToolUse hook at `.claude/hooks/post-test-index-reminder.js` fires after Write/Edit operations and reminds you to update this file when relevant changes are detected. Update this file when:
- A new `docs/{feature}/` directory is created
- A `contract.md` is created or its coverage changes
- Tests are added to a feature
- New shared utilities or scripts are added

Keep the tables above current -- this is the first thing any agent reads when loading the uat skill.
