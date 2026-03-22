---
phase: quick
plan: 260318-2ci
subsystem: test-infra, scripts
tags: [test-reorganization, seed-scripts, data-templates, post-publish]
completed: "2026-03-18"
duration: ~25min
tasks_completed: 3
tasks_total: 3
files_created: 20
files_modified: 4
---

# Quick Task 260318-2ci: Restructure Test Suite and Build Post-Publish Scripts

One-liner: Feature-based test layout (shared/, backend/roster/), annotated data templates, and post-publish bootstrap scripts (register_server + seed all game tables).

## What Was Done

### Task 1: Restructure test/ directory

Reorganized from phase-based to feature-based layout:

- Created `test/shared/` with `connection.ts`, `fixtures.ts`, `mocks/spacetimedb-server.ts` (moved from `test/helpers/` and `test/mocks/`)
- Created `test/backend/roster/` with all 5 test files (moved from `test/unit/` and `test/integration/phase-02/`)
- Updated import paths in all moved test files (`../../helpers/` -> `../../shared/`)
- Created README.md placeholders for 6 empty feature domains: auth, tournaments, brackets, cost-sets, match-results, smoke
- Created `test/frontend/README.md`
- Deleted old directories: `test/helpers/`, `test/mocks/`, `test/unit/`, `test/integration/`
- Updated `.gitignore`: removed blanket `test/` rule, added `test/data/` (private) + `!test/data-templates/` (committed)
- Updated `test/vitest.config.ts`: include pattern `backend/**/*.unit.test.ts`, mock alias `shared/mocks/spacetimedb-server.ts`
- Updated `test/vitest.integration.config.ts`: include pattern `backend/**/*.test.ts` (excluding `.unit.test.ts`)
- Updated `test/README.md` to reflect new structure

### Task 2: Create test/data-templates/

Created annotated 2-row sample files for each raw data format:

- `characters_template.json`: 2 characters (acheron 5*, arlan 4*) with per-game-mode EidolonCost
- `lightcones_template.json`: 2 lightcones — one with positioning, one without
- `pairing_template.json`: 2 synergy pairs with per-game-mode cost modifiers
- `README.md`: full transform documentation (3 tables covering all field mappings)

### Task 3: Create scripts/seed-data.ts and scripts/post-publish.ts

- `scripts/seed-data.ts`: Standalone seeder. Loads `test/data/*.json`, normalizes raw format to API format, calls `adminBulkUpsert` for each table (HsrCharacter, HsrLightcone, HsrCharacterCost, HsrLightconeCost, HsrSynergyCost). Exports `seedAll(serverToken)` for import. CLI entry guard prevents auto-run when imported.
- `scripts/post-publish.ts`: Full bootstrap for `--clear-database` publishes. Connects fresh (no token), calls `registerServer({})`, writes token to `.env.local`, then calls `seedAll(token)`.
- Both scripts use `DbConnection.builder()` WebSocket pattern (matches existing `register-server.ts`)
- Normalizer handles all raw-to-API transforms: snake_case -> camelCase, lowercase enums -> PascalCase, E0..E6 -> e0..e6, S1..S5 -> s1..s5, positioning.width "120%" -> 120, source/pair_target -> sourceName/targetName, cost entries expanded to per-gameMode rows

## Verification

- `npm test`: 13 unit tests pass (roster-helpers.unit.test.ts)
- `.gitignore` diff: `test/data/` rule added, blanket `test/` rule removed
- `git check-ignore test/data/characters_table.json`: exit 0 (ignored)
- `git check-ignore test/data-templates/characters_template.json`: exit 1 (not ignored, will be committed)
- All files left unstaged per CLAUDE.md git rules

## Deviations from Plan

**1. [Rule 1 - Bug] Fixed integration test import paths**
- **Found during:** Task 1
- **Issue:** Integration test files written with `'../shared/connection'` but files are 2 levels deep (`test/backend/roster/`), requiring `'../../shared/connection'`
- **Fix:** Updated all 4 integration test files to use `../../shared/` prefix
- **Files modified:** roster-accounts.test.ts, roster-characters.test.ts, roster-migration.test.ts, archetype-crud.test.ts

## Key Files

### Created
- `test/shared/connection.ts`
- `test/shared/fixtures.ts`
- `test/shared/mocks/spacetimedb-server.ts`
- `test/backend/roster/roster-helpers.unit.test.ts`
- `test/backend/roster/roster-accounts.test.ts`
- `test/backend/roster/roster-characters.test.ts`
- `test/backend/roster/roster-migration.test.ts`
- `test/backend/roster/archetype-crud.test.ts`
- `docs/{auth,tournament,brackets,cost-sets,match-results,smoke}/contract.md`
- `test/frontend/README.md`
- `test/data-templates/characters_template.json`
- `test/data-templates/lightcones_template.json`
- `test/data-templates/pairing_template.json`
- `test/data-templates/README.md`
- `scripts/seed-data.ts`
- `scripts/post-publish.ts`

### Modified
- `.gitignore`
- `test/README.md`
- `test/vitest.config.ts`
- `test/vitest.integration.config.ts`

### Deleted
- `test/helpers/` (connection.ts, fixtures.ts)
- `test/mocks/` (spacetimedb-server.ts)
- `test/unit/` (roster-helpers.test.ts)
- `test/integration/` (phase-02/*.test.ts)
