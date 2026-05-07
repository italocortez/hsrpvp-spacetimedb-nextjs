---
status: complete
phase: 15-backend-pre-work
source: [15-01-SUMMARY.md, 15-02-SUMMARY.md, 15-03-SUMMARY.md, 15-04-SUMMARY.md, 15-05-SUMMARY.md, 15-06-SUMMARY.md]
started: 2026-04-13T14:52:09Z
updated: 2026-04-13T15:55:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Run `spacetime publish --delete-data` + `npx tsx scripts/post-publish.ts`. Module republishes, server registers, token writes to .env.local, seedAll() completes end-to-end with no "missing key" errors.
result: pass
evidence: |
  All 7 bootstrap steps green. Seed counts:
  - HsrCharacter 83 / HsrLightcone 156
  - HsrCharacterCost 249 (83×3 modes) / HsrLightconeCost 468 (156×3) / HsrSynergyCost 30 (10×3)
  - Archetype 12, 66 archetype assignments
  - Achievements, EloConfig, AccountRatingConfig, IdentityGcJob, LobbyGcJob all seeded.

### 2. HsrCharacter Schema Has Spine + Positioning Columns
expected: `spacetime sql` on hsr_character shows skel_url, atlas_url, atlas_img_urls, pos_x, pos_y, width populated per D-05a defaults.
result: pass
evidence: |
  `SELECT name, skel_url, atlas_url, atlas_img_urls, pos_x, pos_y, width FROM hsr_character LIMIT 5` returned all 6 columns live.
  skelUrl/atlasUrl = `(none = ())` (optional, templates had empty strings → null), atlas_img_urls = `[]` sentinel, posX/posY/width = 0 (no positioning block in current templates).

### 3. Three-Mode Cost Fan-Out On All Cost Tables
expected: Each cost table has exactly 3 game_mode variants with counts matching entity count.
result: pass
evidence: |
  hsr_character_cost: 83 / 83 / 83 (MoC / AS / AA) = 249.
  hsr_lightcone_cost: 156 / 156 / 156 = 468 — confirms LIGHTCONE_GAME_MODES 2-mode constant was dropped; AnomalyArbitration populates.
  hsr_synergy_cost: 10 / 10 / 10 = 30.

### 4. Five Self-Scoped History Views Are Subscribable
expected: 5 binding files exist, 5 barrel exports, filter logic verified.
result: pass
evidence: |
  - All 5 view_my_*_table.ts bindings present in src/module_bindings/.
  - spacetimedb/src/index.ts lines 49-53 export all 5 with // Phase 15 D-13 tags.
  - Standalone run of test/backend/views/matchHistoryViews/isolation.test.ts → 18/18 green (5.57s), proving I1-I4 invariants on filter logic via two-identity harness.

### 5. Distinct costSetId Rows Coexist (PK Fix)
expected: admin_bulk_upsert with same (characterName, gameMode) and different costSetId produces two rows (no silent overwrite).
result: pass
evidence: |
  Live maincloud demo: acheron had 3 rows (costSetId=0, 3 modes). Called admin_bulk_upsert with (acheron, MemoryOfChaos, costSetId=5) via scripts/uat-15-cost-set-pk.ts.
  After: 4 rows — the pre-existing (acheron, MoC, 0) coexists with new (acheron, MoC, 5). D-09 tuple-match fix (name, mode, costSetId) confirmed live.

### 6. Partial Update Preserves Unsent Fields
expected: admin_bulk_upsert with { name, skelUrl: <new> } and all other fields null changes ONLY skelUrl; other fields preserved.
result: pass
evidence: |
  Live maincloud demo via scripts/uat-15-partial-update.ts. Before: skel_url=`(none = ())`, display_name="Acheron", image_url=URL, rarity=5.
  After: skel_url=`(some = "https://uat.example/acheron.skel")`; every other field byte-identical. D-08/D-10 mergeForUpdate preserved all null-valued fields.

  Noted design boundary (not a gap): null=preserve wire convention means admin_bulk_upsert cannot transition an optional column back to `(none)`. User acknowledged; if needed later, a narrow admin_unset_fields reducer is the clean path (matches admin_delete_row pattern).

### 7. Integration Test Suite Green
expected: 30/30 tests pass across isolation + partial-update + cost-set-pk + round-trip.
result: pass
evidence: |
  `npx vitest run --config test/vitest.integration.config.ts test/backend/seed/round-trip.test.ts test/backend/reducers/admin/ test/backend/views/matchHistoryViews/isolation.test.ts` → 4 files, 30/30 tests, 31.68s.
  Green despite Tests 5 & 6 mutating live maincloud state (tests use pu-test-/cs-test- prefixes to avoid collision).

### 8. View Reorg Preserved Binding Surface (32 → 37)
expected: 37 view bindings emitted; 8 domain view files; god files deleted.
result: pass
evidence: |
  - `ls src/module_bindings/view_*_table.ts | wc -l` → 37.
  - spacetimedb/src/views/ contains 8 files: lobby, identity, costSet, stats, social, match, matchHistory, tournament Views.ts.
  - securityViews.ts and anonymousViews.ts absent (Plan 01 god-file split).

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]

## Notes

**Maincloud state mutations from live UAT:**
- acheron.skel_url = `(some = "https://uat.example/acheron.skel")` (Test 6) — set from `(none)`
- hsr_character_cost has an extra row: (acheron, MemoryOfChaos, costSetId=5) with all-99 classic_costs (Test 5)

**Cleanup options (operator decision):**
- Leave as-is (small cosmetic drift; harmless for next phases since Phase 16 does not read these specific values).
- Or re-run `spacetime publish --delete-data hsrpvp-spacetimedb-nextjs-test1` + `npx tsx scripts/post-publish.ts` to restore a clean seeded state.

**Scratch scripts created during UAT:**
- scripts/uat-15-cost-set-pk.ts
- scripts/uat-15-partial-update.ts

Safe to delete (one-off demos; same assertions covered by vitest files in Plan 06).
