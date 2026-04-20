---
phase: 15-backend-pre-work
plan: 02
subsystem: database
tags: [spacetimedb, schema, hsr_character, spine, positioning]

# Dependency graph
requires:
  - phase: 15-backend-pre-work
    plan: 01
    provides: views/ directory reorg (Plan 02 does not touch views but runs on the reorganized tree)
provides:
  - HsrCharacter schema carries 3 Spine columns (skelUrl, atlasUrl, atlasImgUrls) and 3 positioning columns (posX, posY, width)
  - Regenerated TypeScript bindings exposing the 6 new fields
  - Maincloud schema live with the new columns (confirmed via `spacetime sql`)
affects:
  - 15-03 (admin router rework) — must add the 6 new keys to `EXPECTED_KEYS['HsrCharacter']` and handle them in the partial-update branch
  - 15-05 (seed pipeline) — must transform `skel_url`, `atlas_url`, `atlas_img_url`, `positioning.{x,y,width}` from JSON into the new camelCase columns
  - Phase 31 (Pedestal) — reads skelUrl/atlasUrl/atlasImgUrls from subscription
  - Every v0.9 feature phase that subscribes to hsr_character now sees the 6 new fields in the generated SDK

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Flat columns (not nested struct) for filterable data — matches existing HsrLightcone positioning shape.
    - Spine URLs use `t.string().optional()` because most characters lack Spine initially; `null` beats `''` as "not set".
    - Arrays use empty-array sentinel (`[]`) because `t.array().optional()` is not cost-effective.
    - Required i32 positioning columns with `0` defaults at insert time (seed pipeline / router populate).

key-files:
  created: []
  modified:
    - spacetimedb/src/tables/hsrCharacter.ts
    - spacetimedb/dist/bundle.js
    - src/module_bindings/hsr_character_table.ts
    - src/module_bindings/types.ts
    - src/module_bindings/ (regenerated + prettier reformat across bindings)
  deleted: []

key-decisions:
  - Published with `--clear-database` per the plan's ops-decision language; schema confirmed live on maincloud.
  - Ran `post-publish.ts` as required by project memory (`feedback_post_publish_only`); register_server + .env.local token write succeeded, seedAll() failed at HsrCharacter upsert with `missing: [skelUrl, atlasUrl, atlasImgUrls, posX, posY, width]` — this is the expected contract break that Plans 03 + 05 resolve.
  - Used `spacetime generate --module-path .` (not `--project-path`) per current CLI surface; generated bindings landed in `src/module_bindings/` not `spacetimedb/src/module_bindings/`.
  - Plan text referenced `src/module_bindings/hsr_character_type.ts` for verification; actual generated filename is `hsr_character_table.ts` — binding now uses a single `_table.ts` per table rather than separate `_type.ts` / `_table.ts` files.

requirements-completed: []  # FOUND-01 has schema half + admin router half; this plan delivers only the schema half. FOUND-01 completes when Plan 03 lands.

# Metrics
duration: 3m
completed: 2026-04-13
---

# Phase 15 Plan 02: Spine + Positioning Columns on HsrCharacter Summary

**Added 3 Spine asset columns (`skelUrl`, `atlasUrl`, `atlasImgUrls`) and 3 card positioning columns (`posX`, `posY`, `width`) to `hsr_character`; module builds clean, publishes to maincloud, regenerated bindings expose all 6 new fields.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-12T23:57:14Z
- **Completed:** 2026-04-13T00:00:06Z
- **Tasks:** 1
- **Files modified:** 63 (1 schema, 1 dist bundle, 61 binding regen+prettier)
- **Files created:** 0
- **Files deleted:** 0

## Accomplishments

- 6 new columns added to `hsrCharacterColumns` in the exact shape from D-05/D-05a:
  - `skelUrl: t.string().optional()`
  - `atlasUrl: t.string().optional()`
  - `atlasImgUrls: t.array(t.string())`
  - `posX: t.i32()`, `posY: t.i32()`, `width: t.i32()`
- Build clean: `cd spacetimedb && npm run build` exits 0.
- Published to maincloud (`hsrpvp-spacetimedb-nextjs-test1`) via `--clear-database`; `spacetime sql` confirms live schema has `skel_url`, `atlas_url`, `atlas_img_urls`, `pos_x`, `pos_y`, `width`.
- Regenerated TypeScript bindings include all 6 fields:
  ```
  skelUrl: __t.option(__t.string()).name("skel_url"),
  atlasUrl: __t.option(__t.string()).name("atlas_url"),
  atlasImgUrls: __t.array(__t.string()).name("atlas_img_urls"),
  posX: __t.i32().name("pos_x"),
  posY: __t.i32().name("pos_y"),
  width: __t.i32(),
  ```
- `hsrLightcone.ts` untouched (per D-05c — its positioning columns already exist).
- `admin.ts` untouched (per scope — Plan 03 owns router changes).

## Task Commits

1. **Task 1: Add Spine + positioning columns to hsrCharacterColumns** — `4d2128c` (feat)

## Files Created/Modified

**Modified:**

- `spacetimedb/src/tables/hsrCharacter.ts` — 6 new column declarations between `treatAsVersion` and `createdById` (+11 lines including comments and blank-line separators).
- `spacetimedb/dist/bundle.js` — rebuilt WASM module.
- `src/module_bindings/hsr_character_table.ts` — 6 new fields, snake_case name annotations.
- `src/module_bindings/types.ts` — HsrCharacter row type updated.
- ~60 additional binding files in `src/module_bindings/` — prettier reformat (whitespace-only) across the regen pass; no semantic changes.

## Decisions Made

- **Publish strategy:** Honored plan's `--clear-database` path. Post-publish ran to register the server and persist the new token to `.env.local`; seed step failed at `HsrCharacter` upsert with the expected key-mismatch error (`missing: [skelUrl, atlasUrl, atlasImgUrls, posX, posY, width]`) because the current `admin_bulk_upsert` router and `scripts/seed-data.ts` both predate these columns. Plans 03 (router) and 05 (seed pipeline) own the fix.
- **Binding filename drift:** The plan referenced `src/module_bindings/hsr_character_type.ts`; the current generator emits a single `hsr_character_table.ts` per table. Verified the 6 columns in the actual emitted file — intent satisfied, naming convention documented for future plans.
- **No data reseed in this plan:** Deliberately did not edit `seed-data.ts` or the admin router to rescue the seed — doing so would overlap Plans 03 and 05. The broken seed is the expected interim state; it closes when Plan 03 ships the partial-update semantics + `EXPECTED_KEYS` update.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan referenced stale binding filename**

- **Found during:** Task 1 verification (acceptance criterion on `hsr_character_type.ts`).
- **Issue:** Plan's acceptance criteria + must_haves referenced `src/module_bindings/hsr_character_type.ts`, but the current `spacetime generate` emits a single `hsr_character_table.ts` file per table (no separate `_type.ts`). This was the same convention-drift pattern Plan 01 hit with view counts.
- **Fix:** Verified all 6 columns in the actual emitted file (`hsr_character_table.ts`) — intent satisfied. No code change needed; this is a documentation-drift note.
- **Files modified:** None (documentation-only deviation).
- **Committed in:** N/A (no code change).

**2. [Rule 3 - Blocking issue] `spacetime generate --project-path` flag not supported**

- **Found during:** Bindings regeneration attempt.
- **Issue:** Plan listed `spacetime generate` but the CLI rejects `--project-path` on the current version; the valid flag is `--module-path`.
- **Fix:** Used `cd spacetimedb && spacetime generate --lang typescript --out-dir ../src/module_bindings --module-path .`; produced the expected bindings.
- **Files modified:** None (build-only invocation change).
- **Committed in:** Task 1 commit `4d2128c` (bindings included).

---

**Total deviations:** 2 (both documentation-drift, no functional deviation from plan intent).
**Impact on plan:** None on scope; schema change delivered exactly as specified in D-05/D-05a.

## Issues Encountered

- **Expected:** `post-publish.ts` seedAll() fails on the first `HsrCharacter` upsert because the current `admin_bulk_upsert` router enforces exact key match and the router + `scripts/seed-data.ts` still speak the pre-Phase-15 shape. The error message is the right shape:
  ```
  SenderError: Row 0 key mismatch: missing: [skelUrl, atlasUrl, atlasImgUrls, posX, posY, width].
  Expected exactly: [name, displayName, aliases, rarity, path, element, role, imageUrl,
                     versionReleased, treatAsVersion, skelUrl, atlasUrl, atlasImgUrls, posX, posY, width]
  ```
  This confirms the schema is live and the router sees the new columns; Plan 03 will teach the router to accept partial updates (and add the 6 keys to `EXPECTED_KEYS['HsrCharacter']`), and Plan 05 will rework the seed pipeline to emit the new shape.
- **CLI confirmation prompts:** `spacetime publish --clear-database` on maincloud requires **two** `y` confirmations (non-local server + destroy warning). Handled via `printf "y\ny\n" | spacetime publish ...`.

## User Setup Required

None — schema is live on maincloud, bindings are committed. Seeding will resume once Plan 03 + Plan 05 land.

## Next Phase Readiness

- **Plan 03 (admin router rework)** can start immediately:
  - Add `skelUrl`, `atlasUrl`, `atlasImgUrls`, `posX`, `posY`, `width` to `EXPECTED_KEYS['HsrCharacter']` in `spacetimedb/src/reducers/admin.ts`.
  - Implement partial-update semantics across all 5 table cases (D-08 through D-12).
  - Fix `HsrCharacterCost` composite PK match to include `costSetId` (D-09).
- **Plan 05 (seed + template rework)** can start after or in parallel:
  - Rewrite `scripts/seed-data.ts` + `test/shared/seed-data.ts` to consume the D-22 snake_case shape (`image_url`, `skel_url`, `atlas_url`, `atlas_img_url`, `positioning.{x,y,width}`, 3-mode cost fan-out with `cost_set_id`).
- **Schema surface:** the `hsr_character` row now has 20 columns (14 prior + 6 new). Downstream subscribers get the new fields immediately once they regenerate bindings or consume the committed ones.

## Self-Check

**Modified files present:**

- FOUND: spacetimedb/src/tables/hsrCharacter.ts (lines 16-24 contain the 6 new columns)
- FOUND: src/module_bindings/hsr_character_table.ts (6 new fields with snake_case name annotations)
- FOUND: spacetimedb/dist/bundle.js (rebuilt)

**Acceptance criteria verification:**

- PASS: `grep -cE "skelUrl: t\.string\(\)\.optional\(\)|atlasUrl: t\.string\(\)\.optional\(\)|atlasImgUrls: t\.array\(t\.string\(\)\)|posX: t\.i32\(\)|posY: t\.i32\(\)|width: t\.i32\(\)" src/tables/hsrCharacter.ts` → 6
- PASS: `cd spacetimedb && npm run build` → exit 0 ("Build finished successfully.")
- PASS: `grep -E "skelUrl|atlasUrl|atlasImgUrls|posX|posY|width" src/module_bindings/hsr_character_table.ts` → all 6 identifiers present
- PASS: `grep -E "skelUrl|atlasUrl|atlasImgUrls" spacetimedb/src/tables/hsrLightcone.ts` → no matches (exit 1)
- PASS: `git diff spacetimedb/src/tables/hsrLightcone.ts` → empty
- PASS: `git diff spacetimedb/src/reducers/admin.ts` → empty
- PASS: Maincloud schema verified via `spacetime sql hsrpvp-spacetimedb-nextjs-test1 "SELECT * FROM hsr_character LIMIT 1"` → columns include `skel_url`, `atlas_url`, `atlas_img_urls`, `pos_x`, `pos_y`, `width`.

**Commits:**

- FOUND: 4d2128c (Task 1)

## Self-Check: PASSED

---
*Phase: 15-backend-pre-work*
*Completed: 2026-04-13*
