---
phase: 15-backend-pre-work
plan: 05
subsystem: seed-pipeline
tags: [backend, seed, templates, data-migration, snake_case]

# Dependency graph
requires:
  - phase: 15-backend-pre-work
    plan: 02
    provides: Spine + positioning columns on hsr_character; HsrCharacter row has 20 columns (14 pre + 6 new)
  - phase: 15-backend-pre-work
    plan: 03
    provides: admin_bulk_upsert partial-update semantics + costSetId tuple match on all 3 cost tables
provides:
  - scripts/seed-data.ts consumes D-22 snake_case shape (cost_set_id, skel_url, atlas_url, atlas_img_url, positioning, source_name/target_name)
  - test/shared/seed-data.ts mirrors the same transform layer (still separate per D-25 convention; no shared transforms.ts extraction)
  - 3-mode cost fan-out (memory_of_chaos / apocalyptic_shadow / anomaly_arbitration) for characters, lightcones, AND pairings
  - cost.cost_set_id lifts to each fanned row's costSetId (no more hardcoded 0)
  - test/data-templates/README.md transform tables reflect current shape
affects:
  - Plan 06 (architecture docs + round-trip test) — can now run post-publish.ts --clear-database end-to-end against a clean DB and assert Spine + positioning + 3-mode costs land correctly
  - post-publish.ts orchestration — unchanged (D-25a audit confirmed no shape coupling; only imports seedAll from ./seed-data)
  - FOUND-01 — no new requirements closed (schema + admin router halves shipped in Plans 02/03); Plan 05 makes the data pipeline honor the contract end-to-end

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Snake-case public shape at the disk/template boundary; camelCase strictly inside the admin_bulk_upsert wire row. Transform layer sits in scripts/seed-data.ts + test/shared/seed-data.ts — two files, same logic, kept in sync by convention (not by shared import — D-25 defers the dedup)."
    - "3-mode cost fan-out: iterate Object.keys(cost).filter(k => k !== 'cost_set_id') rather than a hardcoded 2-mode or 3-mode constant. Unknown modes warn + skip; router validateEnum is defence-in-depth."
    - "costSetId always sourced from cost.cost_set_id (not hardcoded) — honors Plan 03's composite-PK match so non-default cost sets don't overwrite the default set."
    - "positioning.x/y/width -> posX/posY/width (renamed per schema column conventions); missing positioning block defaults every field to 0 (matches D-05a i32 required semantics)."
    - "Spine fields: empty string -> null (optional schema column); missing atlas_img_url -> [] (array sentinel). Compatible with Plan 03's insert branch defaults (r.skelUrl ?? null, r.atlasImgUrls ?? [])."

key-files:
  created: []
  modified:
    - scripts/seed-data.ts
    - test/shared/seed-data.ts
    - test/data-templates/README.md
  audited_only:
    - test/shared/fixtures.ts  # no old-shape references; only a comment mentioning characters_table.json
    - scripts/post-publish.ts  # no direct data-shape coupling; imports seedAll only

key-decisions:
  - "Used positioning.x / positioning.y / positioning.width (as authored in test/data-templates/characters_template.json and test/data/characters_table.json) rather than the plan's interface text which had positioning.posX/posY. Templates are the D-22 contract (per CONTEXT.md: 'downstream agents treat them as the source of truth for the upsert JSON shape') — when plan text and on-disk templates disagreed, on-disk templates won."
  - "test/shared/seed-data.ts now seeds HsrSynergyCost too (3-mode pairing fan-out). Previous version skipped pairings entirely; the production path in scripts/seed-data.ts always seeded them. This is a new table in the test-seed table list but aligned with its acceptance criteria (full 3-mode fan-out for all three types)."
  - "Kept the two seeds separate (no test/shared/transforms.ts extraction), per D-25 + RESEARCH.md Q4 recommendation. Logic drift risk accepted; the files are short and changes land together."
  - "Did NOT modify scripts/post-publish.ts — audit found no data-shape coupling, and feedback_post_publish_only memory rule warns against incidental changes."
  - "Did NOT modify test/shared/fixtures.ts — audit found only a comment reference to characters_table.json (no field access, no imports of the old-shape transform)."
  - "Did NOT delete test/data/*_table_old.json — D-28 says these may be deleted at phase end at Claude's discretion; Plan 05 leaves them for Plan 06 to optionally clean up after the round-trip test confirms green."

requirements-completed: []  # FOUND-01 is phase-level and closes when all backend pre-work is integrated (Plans 02/03 delivered the schema + router halves; Plan 05 delivers the seed pipeline half; Plan 06 will validate the round-trip).

# Metrics
duration: 4m
completed: 2026-04-13
---

# Phase 15 Plan 05: Seed Pipeline D-22 Rework Summary

**Both seed entry points now consume the D-22 snake_case template shape end-to-end: 3-mode cost fan-out (characters 21 rows, lightcones 15, pairings 3 per entity), cost.cost_set_id lifts to each fanned row's costSetId, Spine + positioning pass through to the HsrCharacter camelCase row for the reworked admin_bulk_upsert router.**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-04-13T00:14:34Z
- **Completed:** 2026-04-13T00:18:52Z
- **Tasks:** 2
- **Files modified:** 3 (scripts/seed-data.ts, test/shared/seed-data.ts, test/data-templates/README.md)
- **Files audited (unchanged):** 2 (test/shared/fixtures.ts, scripts/post-publish.ts)
- **Files created:** 0
- **Files deleted:** 0

## Accomplishments

### Task 1: scripts/seed-data.ts (production seed)

- Raw types rewritten to D-22 snake_case: `cost_set_id`, `memory_of_chaos` / `apocalyptic_shadow` / `anomaly_arbitration` blocks, `skel_url`, `atlas_url`, `atlas_img_url`, `positioning` optional, `source_name` / `target_name` on pairings.
- 2-mode `LIGHTCONE_GAME_MODES = ['MemoryOfChaos', 'ApocalypticShadow']` constant **dropped**; lightcone fan-out now iterates `Object.keys(lc.cost).filter(k => k !== 'cost_set_id')` just like characters.
- `GAME_MODE_MAP` renamed keys from the old `memoryofchaos` / `apocalypticshadow` / `anomalyarbitration` concatenated form to the canonical snake_case `memory_of_chaos` / `apocalyptic_shadow` / `anomaly_arbitration`.
- `snakeToPascalMode` helper centralises the 3-entry map; unknown-mode warning preserved (`[seed] Unknown game mode "{k}" for character "{name}" — skipping`).
- `normalizeCharacters` emits Spine + positioning: `skelUrl: empty-string → null`, `atlasUrl: empty-string → null`, `atlasImgUrls: missing → []`, `posX / posY / width: missing block → 0`.
- `normalizeCharacterCosts` / `normalizeLightconeCosts` / `normalizePairings` all fan out 3 modes and lift `cost.cost_set_id` onto each row's `costSetId`.
- `imageUrl` read now snake_case (`c.image_url` / `lc.image_url`) — previous code read `imageUrl` direct, which would silently fail against the migrated data files.

### Task 2: test/shared/seed-data.ts (test-harness seed)

- Same transform-layer rewrite mirrored verbatim (same snakeToPascalMode, same fan-out shape).
- Added pairing support: reads `test/data/pairing_table.json` (optional; missing file skipped) and seeds `HsrSynergyCost` with 3-mode fan-out. Previous version had no pairing path at all.
- Archetype junction seeding preserved (name→id subscription after upserts).
- Table seed list extended from 5 to 6: now emits `HsrSynergyCost` in addition to `HsrCharacter`, `HsrLightcone`, `HsrCharacterCost`, `HsrLightconeCost`, and `Archetype`.

### Task 2: Audits (fixtures.ts + post-publish.ts)

- `test/shared/fixtures.ts`: `grep -E "pair_target|LIGHTCONE_GAME_MODES|memoryofchaos"` returns no matches. Only reference is a JSDoc comment mentioning the `characters_table.json` file by name, no field access. **No changes needed.**
- `scripts/post-publish.ts`: `grep -E "pair_target|memoryofchaos|skel_url|atlas_url|characters_table.json|lightcones_table.json"` returns no matches. File imports `seedAll` from `./seed-data` and calls it; no direct JSON reading or field access. **No changes needed** — `feedback_post_publish_only` memory rule honored.

### Task 2: README.md

- Transform tables rewritten to reflect D-22 shape. Each table documents: direct-copy rules, snake_case → camelCase rules, nested-to-flat renames for positioning, empty-string → null for Spine, and the 3-mode fan-out row counts (characters 21/entity, lightcones 15/entity, pairings 3/entity).
- Notes section expands the `costSetId: 0` sentinel explanation with a reference to Plan 03's composite-PK tuple match (D-09). Clarifies non-zero cost sets round-trip correctly.

## Task Commits

1. **Task 1: Rewrite scripts/seed-data.ts to consume D-22 shape** — `d32fded` (feat)
2. **Task 2: Rewrite test/shared/seed-data.ts + README + audit fixtures/post-publish** — `8593e40` (feat)

## Files Created/Modified

**Modified:**

- `scripts/seed-data.ts` — +113 / −58 lines (type rewrites, new GAME_MODE_MAP, 3-mode fan-out in all three extractors, Spine + positioning passthrough).
- `test/shared/seed-data.ts` — +204 / −45 lines (Raw types, transform mirror, HsrSynergyCost addition, pairing fan-out).
- `test/data-templates/README.md` — full rewrite of transform tables; added notes on costSetId, positioning defaults, Spine empty-string rules.

**Audited, unchanged:**

- `test/shared/fixtures.ts`
- `scripts/post-publish.ts`

**Preserved per D-28:**

- `test/data/characters_table_old.json`
- `test/data/lightcones_table_old.json`
- `test/data/pairing_table_old.json`

## Decisions Made

- **Positioning field names = `x`/`y`/`width` (not `posX`/`posY`):** the plan's `<objective>` block had `positioning.posX`/`posY` in the interface description, but `test/data-templates/characters_template.json`, `test/data-templates/lightcones_template.json`, and the migrated `test/data/*_table.json` files all use `x`/`y`/`width`. Per CONTEXT.md D-22 ("these template files are the contract"), on-disk wins. Transform keeps the names-match semantics: `positioning.x -> posX`, `positioning.y -> posY`, `positioning.width -> width`.
- **Added HsrSynergyCost to test/shared/seed-data.ts:** The acceptance criterion requires 3-mode fan-out for characters, lightcones, AND pairings. The previous test-harness seed skipped pairings entirely, which would have failed the "all three modes populated across all three types" truth. Fixed by reading `pairing_table.json` (gracefully skipped if absent) and fanning out 3 HsrSynergyCost rows per pair.
- **Kept two separate seed files (no shared transforms.ts):** D-25 convention + RESEARCH.md Q4 recommendation; the dedup refactor is explicitly out of scope for Plan 05.
- **Left _old data files alone:** D-28 permits end-of-phase cleanup; Plan 06 can clean up once the round-trip test is green. Conservative default to avoid premature data loss.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking correctness] Plan interface vs. on-disk template field names mismatch**

- **Found during:** Task 1 after reading the template JSON files.
- **Issue:** Plan's `<interfaces>` block described `positioning: { posX: int, posY: int, width: int }` on characters, but `test/data-templates/characters_template.json` and the migrated data files all use `positioning: { x, y, width }`. Running the seed with the plan-literal field names would produce `posX: undefined ?? 0 = 0` for every character, silently corrupting the data.
- **Fix:** Used `positioning.x` / `positioning.y` / `positioning.width` as the READ surface, transformed to `posX` / `posY` / `width` on the WRITE surface (camelCase row). Both seeds consistent.
- **Files modified:** `scripts/seed-data.ts`, `test/shared/seed-data.ts`.
- **Committed in:** `d32fded`, `8593e40`.

**2. [Rule 2 - Missing critical functionality] test/shared/seed-data.ts had no pairing path**

- **Found during:** Task 2 after reading the existing test seed file.
- **Issue:** Previous test-harness seed only seeded `HsrCharacter`, `HsrLightcone`, `HsrCharacterCost`, `HsrLightconeCost`, and `Archetype` — no `HsrSynergyCost`. The plan's acceptance criteria require "3-mode fan-out applies to characters, lightcones, AND pairings" for the test seed path too.
- **Fix:** Added pairing reading (graceful if file missing), 3-mode fan-out transform, and `HsrSynergyCost` batch in the table seed list.
- **Files modified:** `test/shared/seed-data.ts`.
- **Committed in:** `8593e40`.

**3. [Rule 1 - Bug] scripts/seed-data.ts was reading `c.imageUrl` but data files write `c.image_url`**

- **Found during:** Task 1 type-rewrite pass.
- **Issue:** The previous seed's `RawCharacter` / `RawLightcone` types declared `imageUrl?: string`, but the migrated data files (D-23, D-24) use snake_case `image_url`. Seed would silently emit `imageUrl: ''` for every character/lightcone.
- **Fix:** Renamed type field to `image_url`; transform reads `c.image_url ?? ''` -> `imageUrl` on the row.
- **Files modified:** `scripts/seed-data.ts`.
- **Committed in:** `d32fded`.

---

**Total deviations:** 3 auto-fixes, all aligned with the plan's intent (D-22 on-disk shape). No architectural or scope changes.

## Authentication Gates

None. All changes are file edits — no network operations.

## Issues Encountered

- **Type-checker noise unrelated to this plan:** `npx tsc --noEmit -p tsconfig.json` reports ~25 pre-existing errors in unrelated test files (`test/backend/brackets/`, `test/backend/match-session/`, `test/backend/tournaments/`, etc.) — all arising from the tournament-creation test helpers, not touched by Plan 05. Grep confirmed zero errors in `scripts/seed-data.ts`, `test/shared/seed-data.ts`, and `scripts/post-publish.ts`. Logged here for awareness; out of scope for this plan.

## User Setup Required

None for Plan 05 — seed files are code-only changes. The next `post-publish.ts --clear-database` run will exercise the new seed pipeline end-to-end against the Plan 02 schema + Plan 03 router. That round-trip is Plan 06's job.

## Threat Register Discharge

| Threat | Disposition | Status |
|--------|-------------|--------|
| T-15-04 (seed 3-mode fan-out for all three types) | mitigate | DONE — all three transforms (characters, lightcones, pairings) iterate mode keys; Plan 06's round-trip test will assert `count(HsrLightconeCost) ≈ 3 × count(HsrLightcone)`. |
| T-15-seed-A (costSetId leakage) | mitigate | DONE — every row carries `costSetId: cost.cost_set_id` (not hardcoded 0). |
| T-15-seed-B (post-publish info disclosure) | accept | Confirmed no new data surfaces in scripts/post-publish.ts. |
| T-15-seed-C (enum injection via unknown mode) | mitigate | DONE — `snakeToPascalMode` returns undefined for unknown keys; warn-and-skip at seed layer; router `validateEnum` as defence-in-depth. |

## Next Phase Readiness

- **Plan 06 (architecture docs + integration tests)** can now:
  1. Run `post-publish.ts --clear-database` end-to-end on a clean maincloud DB and assert the 5 rows (HsrCharacter + costs, HsrLightcone + costs, HsrSynergyCost) land with correct shape.
  2. Assert Spine + positioning columns populate on character rows (skelUrl nullable, atlasImgUrls array).
  3. Assert 3-mode fan-out counts: 83 characters × 21 = 1743 HsrCharacterCost rows; 156 lightcones × 15 = 2340 HsrLightconeCost rows; 10 pairings × 3 = 30 HsrSynergyCost rows.
  4. Optionally clean up `test/data/*_table_old.json` in a cleanup commit (D-28).

## Self-Check

**Modified files present:**

- FOUND: `scripts/seed-data.ts` (D-22 Raw types + 3-mode fan-out)
- FOUND: `test/shared/seed-data.ts` (mirrors transform + HsrSynergyCost path)
- FOUND: `test/data-templates/README.md` (rewritten transform tables)

**Acceptance criteria verification:**

- PASS: `grep -E "LIGHTCONE_GAME_MODES|pair_target|memoryofchaos" scripts/seed-data.ts` → no matches.
- PASS: `grep -E "memory_of_chaos|apocalyptic_shadow|anomaly_arbitration|source_name|target_name|cost_set_id|costSetId|skel_url|atlas_url|atlas_img_url|skelUrl|atlasUrl|atlasImgUrls|posX|posY|positioning\?\.x" scripts/seed-data.ts` → 40 matches.
- PASS: `grep -E "LIGHTCONE_GAME_MODES|pair_target|memoryofchaos" test/shared/seed-data.ts` → no matches.
- PASS: `grep -E "memory_of_chaos|apocalyptic_shadow|anomaly_arbitration|source_name|target_name|cost_set_id|costSetId|skel_url|atlas_url|atlas_img_url|skelUrl|atlasUrl|atlasImgUrls|sourceName" test/shared/seed-data.ts` → 31 matches.
- PASS: `grep -E "LIGHTCONE_GAME_MODES|pair_target|memoryofchaos" test/shared/fixtures.ts` → no matches (audit clean).
- PASS: `grep -E "LIGHTCONE_GAME_MODES|pair_target|memoryofchaos|skel_url|atlas_url|characters_table\.json|lightcones_table\.json" scripts/post-publish.ts` → no matches (audit clean).
- PASS: `grep -E "cost_set_id|skel_url|positioning|memory_of_chaos|apocalyptic_shadow|anomaly_arbitration" test/data-templates/README.md` → 25 matches.
- PASS: `grep memoryofchaos test/data-templates/README.md` → no matches (old flat mode absent).
- PASS: `ls test/data/{characters,lightcones,pairing}_table_old.json` → all three still present.
- PASS: `cd spacetimedb && npm run build` → "Build finished successfully." (exit 0).
- PASS: `npx tsc --noEmit -p tsconfig.json` → 0 errors in scripts/seed-data.ts / test/shared/seed-data.ts / scripts/post-publish.ts (pre-existing errors in unrelated test files out of scope).

**Commits:**

- FOUND: `d32fded` (Task 1)
- FOUND: `8593e40` (Task 2)

## Self-Check: PASSED

---
*Phase: 15-backend-pre-work*
*Completed: 2026-04-13*
