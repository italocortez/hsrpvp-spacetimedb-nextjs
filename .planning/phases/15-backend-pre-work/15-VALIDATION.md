---
phase: 15
slug: backend-pre-work
status: executed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-12
updated_by_planner: 2026-04-12
updated_by_executor: 2026-04-13
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Updated by planner after PLAN.md authoring — task IDs now map to the 6 plans.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing project harness — see `test/backend/**`) |
| **Config file** | `vitest.config.ts` (at repo root, per existing backend tests) |
| **Quick run command** | `npx vitest run test/backend/views/matchHistoryViews` |
| **Full suite command** | `npx vitest run test/backend` |
| **Estimated runtime** | ~30s backend slice; ~2min full backend |

Wave-0 spike (moved into Plan 06 Task 1): confirm whether `conn.db.viewMyMmrHistory` is bound through the typed client post-`spacetime generate`. If bound, isolation tests use subscription + `.iter()`; if not, fall back to `queryPrivateTable` on backing tables filtered by `user_id`.

---

## Sampling Rate

- **After every task commit:** Run the targeted slice relevant to the touched file (e.g., `npx vitest run test/backend/reducers/admin` after router changes).
- **After every plan wave:** Run `npx vitest run test/backend`.
- **Before `/gsd-verify-work`:** Full backend suite must be green AND `spacetime publish` must succeed AND `post-publish.ts` reseed round-trip test (Plan 06 Task 2, D-21a) must pass.
- **Max feedback latency:** ~30s per task-scoped slice; ~2min for full backend suite.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | FOUND-02 | T-15-reorg-A, T-15-reorg-B | 8 domain view files; view-name strings verbatim | build+grep | `cd spacetimedb && npm run build && grep -c "spacetimedb.view(" src/views/lobbyViews.ts src/views/identityViews.ts src/views/costSetViews.ts src/views/statsViews.ts src/views/socialViews.ts src/views/matchViews.ts src/views/matchHistoryViews.ts src/views/tournamentViews.ts` | ✅ | ✅ green |
| 15-01-02 | 01 | 1 | FOUND-02 | T-15-reorg-A, T-15-reorg-B | Barrel updated; god files deleted; 29 bindings invariant | build+publish | `cd spacetimedb && npm run build && spacetime publish && ls src/module_bindings/view_*_table.ts \| wc -l` (must equal 29) | ✅ | ✅ green |
| 15-02-01 | 02 | 1 | FOUND-01 | T-15-schema-A, T-15-schema-B | 6 new columns on hsr_character; bindings expose them | build+generate+grep | `cd spacetimedb && npm run build && grep -E "skelUrl\|atlasUrl\|atlasImgUrls\|posX\|posY\|width" src/module_bindings/hsr_character_type.ts` | ✅ | ✅ green |
| 15-03-01 | 03 | 2 | FOUND-01 | T-15-router-A | EXPECTED_KEYS extended; `mergeForUpdate` helper + wire-convention doc | build+grep | `cd spacetimedb && npm run build && grep -c "'skelUrl'\|'atlasUrl'\|'atlasImgUrls'\|'posX'\|'posY'\|'width'" src/reducers/admin.ts` (≥ 6) | ✅ | ✅ green |
| 15-03-02 | 03 | 2 | FOUND-01 | T-15-01, T-15-03, T-15-04 | 5 cases reworked; partial-update merge + costSetId tuple | build+publish+grep | `cd spacetimedb && npm run build && spacetime publish && grep -c "e\.costSetId === " src/reducers/admin.ts` (≥ 3) | ✅ | ✅ green |
| 15-04-01 | 04 | 2 | FOUND-02 | T-15-02, T-15-view-A, T-15-view-B | 5 new views with ctx.sender filter patterns | build+grep | `cd spacetimedb && npm run build && grep -c "name: 'view_my_match_session_history'\|name: 'view_my_match_session_step_history'\|name: 'view_my_match_participant_history'\|name: 'view_my_mmr_history'\|name: 'view_my_match_result_game_history'" src/views/matchHistoryViews.ts` (= 5) | ✅ | ✅ green |
| 15-04-02 | 04 | 2 | FOUND-02 | T-15-view-B | Barrel + ROADMAP/REQUIREMENTS canonicalised; 34 bindings | publish+generate+grep | `cd spacetimedb && spacetime publish && spacetime generate && ls src/module_bindings/view_*_table.ts \| wc -l` (= 34) | ✅ | ✅ green |
| 15-05-01 | 05 | 3 | FOUND-01 | T-15-04, T-15-seed-A, T-15-seed-C | scripts/seed-data.ts consumes D-22 shape; 3-mode fan-out | typecheck+grep | `grep -c "cost_set_id\|skel_url\|source_name\|target_name" scripts/seed-data.ts` AND `grep -cE "LIGHTCONE_GAME_MODES = \[" scripts/seed-data.ts` (= 0) | ✅ | ✅ green |
| 15-05-02 | 05 | 3 | FOUND-01 | T-15-seed-B | test seed + fixtures + post-publish audited; README current | grep | `grep -cE "pair_target\|LIGHTCONE_GAME_MODES\|memoryofchaos" test/shared/seed-data.ts test/shared/fixtures.ts scripts/post-publish.ts` (= 0) | ✅ | ✅ green |
| 15-06-01 | 06 | 4 | FOUND-02 | T-15-02 | Two-identity harness + 5 cross-user isolation tests | integration | `npx vitest run test/backend/views/matchHistoryViews/isolation.test.ts` | ✅ W0→filled | ✅ green |
| 15-06-02 | 06 | 4 | FOUND-01 | T-15-01, T-15-03, T-15-04 | partial-update + cost-set PK + seed round-trip tests | integration | `npx vitest run test/backend/reducers/admin/ test/backend/seed/` | ✅ W0→filled | ✅ green |
| 15-06-03 | 06 | 4 | FOUND-01, FOUND-02 | T-15-docs-A | Architecture docs updated; VALIDATION.md Per-Task Map current | grep | `grep -c "Phase 15" docs/admin/architecture.md docs/match/architecture.md` (≥ 2) | ✅ | ✅ green |

*Status: ✅ green · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Wave-0 artifacts are created inside Plan 06 Tasks 1 and 2 (test-file creation is authorized by FOUND-02 success criterion #4 — this is the single exception to the project "no test-file edits during execution" rule).

- [x] `test/shared/two-identity-harness.ts` — Plan 06 Task 1 (spike + helper). **DONE** — commit 71426db.
- [x] `test/backend/views/matchHistoryViews/isolation.test.ts` — Plan 06 Task 1 (5 view isolation tests, 18 assertions). **DONE** — commit 71426db.
- [x] `test/backend/reducers/admin/partial-update.test.ts` — Plan 06 Task 2 (D-08/D-10 preservation). **DONE** — commit 1e3c98d.
- [x] `test/backend/reducers/admin/cost-set-pk.test.ts` — Plan 06 Task 2 (D-09 PK tuple). **DONE** — commit 1e3c98d.
- [x] `test/backend/seed/round-trip.test.ts` — Plan 06 Task 2 (D-21a clean-DB reseed). **DONE** — commit 1e3c98d.

**Wave-0 spike (embedded in Plan 06 Task 1):** verify whether `conn.db.viewMyMmrHistory.iter()` works from the test harness post-regeneration. **Result (2026-04-13): YES** — all 5 new view bindings are present in `src/module_bindings/index.ts` and subscribable via `.iter()` after `subscribeToAllTables()`. Isolation tests use the subscription path; SQL-on-backing-table is retained as a cross-check for invariant I2.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Generated TypeScript bindings expose new columns + 5 views | FOUND-01, FOUND-02 #4 | Binding artifacts regenerate during publish; verify by inspection | After `spacetime publish`, grep `src/module_bindings/hsr_character_table.ts` for `skelUrl`, `atlasUrl`, `atlasImgUrls`, `posX`, `posY`, `width`; `ls src/module_bindings/view_my_match_session_history_table.ts src/module_bindings/view_my_match_session_step_history_table.ts src/module_bindings/view_my_match_participant_history_table.ts src/module_bindings/view_my_mmr_history_table.ts src/module_bindings/view_my_match_result_game_history_table.ts` — all 5 exist |
| ROADMAP.md + REQUIREMENTS.md updated 4→5 view names (D-14) | FOUND-02 | Doc update, no test | `grep -E "view_my_match_history[^_]\|view_my_session_history\|view_my_participant_history" .planning/ROADMAP.md .planning/REQUIREMENTS.md` returns no matches; the 5 canonical names each appear at least once |
| `post-publish.ts` reseed dry-run on clean DB | FOUND-01, D-21a | Requires operator to run `spacetime publish --clear-database && npx tsx scripts/post-publish.ts` before the round-trip integration test runs | After operator runs the reseed, the round-trip test in Plan 06 Task 2 picks up the resulting state and asserts 3-mode cost rows + Spine/positioning |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies filled in Plan 06
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (met — every task above has one)
- [x] Wave 0 covers all MISSING references (5 test files + 1 harness, all authorized by FOUND-02 #4)
- [x] No watch-mode flags (every command ends in `run` not `watch`)
- [x] Feedback latency < 120s (scoped slice ≈ 30s; full suite ≈ 2min)
- [x] `nyquist_compliant: true` — flipped in frontmatter (Plan 06 Task 3 complete; full backend suite green on 2026-04-13)

**Approval:** approved — Plan 06 Task 3 completed 2026-04-13. Full integration suite green (29/29 Phase-15-scoped tests pass; global setup reseeds maincloud before suite).
