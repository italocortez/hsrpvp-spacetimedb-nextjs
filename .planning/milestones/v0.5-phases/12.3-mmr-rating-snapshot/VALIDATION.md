---
phase: 12.3
slug: mmr-rating-snapshot
status: planned
nyquist_compliant: true
wave_0_complete: false
created: 2026-04-11
last_updated: 2026-04-11
---

# Phase 12.3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Source of truth: see `## Validation Architecture` in RESEARCH.md — this doc is the operational
> sampling plan; RESEARCH.md is the layering rationale. Do not duplicate rationale here.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (project-wide, see package.json devDependencies) |
| **Config files** | `test/vitest.config.ts` (unit), `test/vitest.integration.config.ts` (integration) |
| **Quick run command (unit only)** | `npm run test` |
| **Quick scoped run** | `npx vitest run <file>` (exits 0 on green; no watch) |
| **Phase-scoped run (integration dir)** | `npm run test:phase <directory>` |
| **Full suite command** | `npm run test:all` |
| **Typecheck gate** | `npm run test:typecheck` |
| **Estimated runtime** | quick ~5s, phase-scoped ~15-30s, full ~60s |

Never use `vitest --watch`. The gsd test harness is `vitest run` only — see `.claude/skills/uat/SKILL.md` and the existing `test/backend/match-results/mmr-stats.test.ts` pattern.

---

## Sampling Rate

- **After every task commit:** Run the relevant file-scoped vitest command (quick run for unit, file-scoped `npx vitest run` for integration)
- **After every plan wave:** Run `npm run test:all`
- **Before `/gsd-verify-work`:** Full suite must be green (Plan 08 Task 4)
- **Max feedback latency:** <15s per task (file-scoped run), <90s per wave (full suite)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 12.3-01-01 | 01 | 1 | MMR-RACE-01 | T-12.3-01 | MRP insert writes accountRatingSnapshot = max across LMA rows at start_draft | integration | `npx vitest run test/backend/match-results/mmr-snapshot.unit.test.ts` | ❌ W3 (Plan 06 Task 1) | ⬜ pending |
| 12.3-01-02 | 01 | 1 | — (D-I / OWN-POOL-01) | T-12.3-03 | timer_expiry_classic auto-pick pool reads LMA, not HsrAccount.isActive | integration | `npx vitest run test/backend/match-session/auto-pick-ownership-pool.test.ts` | ❌ W3 (Plan 07 Task 3) | ⬜ pending |
| 12.3-01-03 | 01 | 1 | MMR-RACE-01 | T-12.3-01 | Module publishes with new column; bindings regenerated cleanly; no manual env edits | checkpoint | `grep -n "accountRatingSnapshot" src/module_bindings/*.ts` (after `npm run spacetime:generate`) | N/A (checkpoint) | ⬜ pending |
| 12.3-02-01 | 02 | 2 | MMR-RACE-01, MMR-RACE-02 | T-12.3-06, T-12.3-07 | processMatchMmr reads participant.accountRatingSnapshot; no HsrAccount.isActive query remains in lines 85-92 | unit + integration | `npm run test:typecheck && npx vitest run test/backend/match-results/mmr-snapshot.unit.test.ts test/backend/match-results/mmr-stats.test.ts` | ❌ W3 (Plan 06 Tasks 1+3) | ⬜ pending |
| 12.3-03-01 | 03 | 2 | MMR-RACE-01 | T-12.3-09, T-12.3-10 | select_match_account monotonic-upward hook runs in both branches; Waiting + stand-in short-circuit; deselect no-op | integration | `npx vitest run test/backend/match-results/mmr-snapshot-betweengames.test.ts` | ❌ W3 (Plan 06 Task 2) | ⬜ pending |
| 12.3-04-01 | 04 | 2 | MMR-RACE-02 (TOURN-ORDER-01) | T-12.3-13, T-12.3-14, T-12.3-15 | finalize_match_result rejects tournament-controlled matches until terminal stage; unconditional; Pitfall 4 defensive rejection | integration | `npx vitest run test/backend/tournaments/tournament-ordering-guard.test.ts` | ❌ W3 (Plan 07 Task 2) | ⬜ pending |
| 12.3-05-01 | 05 | 2 | — (D-D-01) | T-12.3-18 | applyBatchUpsert and applyBatchRemove exist, call updateAccountRating, validate items | typecheck | `npm run test:typecheck` | N/A (helper file) | ⬜ pending |
| 12.3-05-02 | 05 | 2 | — (D-D-02, D-D-03, D-D-04) | T-12.3-18 | Three reducer bodies delegated to helpers; migrate_roster now recomputes both sides' ratings | integration | `npx vitest run test/backend/roster/migrate-roster-rating.test.ts test/backend/roster/roster-characters.test.ts` | ❌ W3 (Plan 07 Task 1); existing roster-characters.test.ts provides regression for wrappers | ⬜ pending |
| 12.3-05-03 | 05 | 2 | ROST-GUARD-01 | T-12.3-19, T-12.3-20 | Four D-G lobby guards in roster.ts using shared buildLobbyGuardError helper and by_account index | integration | `npx vitest run test/backend/match-results/mmr-stats.test.ts test/backend/roster/migrate-roster-rating.test.ts` | ❌ W3 (Plan 06 Task 3 + Plan 07 Task 1) | ⬜ pending |
| 12.3-06-01 | 06 | 3 | MMR-RACE-01 | T-12.3-01 | New test file covers capture, default-0, max-aggregation scenarios | integration | `npx vitest run test/backend/match-results/mmr-snapshot.unit.test.ts` | ✅ Created in this task | ⬜ pending |
| 12.3-06-02 | 06 | 3 | MMR-RACE-01 | T-12.3-09, T-12.3-10 | New test file covers monotonic HIGH→LOW, LOW→HIGH, deselect no-op | integration | `npx vitest run test/backend/match-results/mmr-snapshot-betweengames.test.ts` | ✅ Created in this task | ⬜ pending |
| 12.3-06-03 | 06 | 3 | MMR-RACE-02, ROST-GUARD-01 | T-12.3-06, T-12.3-19 | mmr-stats.test.ts extended with negative-control + three D-G guard rejection tests (pre-existing tests unchanged) | integration | `npx vitest run test/backend/match-results/mmr-stats.test.ts` | ✅ Extended in this task | ⬜ pending |
| 12.3-07-01 | 07 | 3 | ROST-GUARD-01 (via D-D-04 regression) | T-12.3-18, T-12.3-19 | migrate-roster-rating.test.ts covers copy/move recompute + D-G source/target guards + empty-source no-op | integration | `npx vitest run test/backend/roster/migrate-roster-rating.test.ts` | ✅ Created in this task | ⬜ pending |
| 12.3-07-02 | 07 | 3 | MMR-RACE-02 (TOURN-ORDER-01) | T-12.3-13, T-12.3-14, T-12.3-15 | tournament-ordering-guard.test.ts covers MMR / casual / non-tournament branches + Pitfall 4 optional | integration | `npx vitest run test/backend/tournaments/tournament-ordering-guard.test.ts` | ✅ Created in this task | ⬜ pending |
| 12.3-07-03 | 07 | 3 | — (D-I / OWN-POOL-01) | T-12.3-03, T-12.3-26 | auto-pick-ownership-pool.test.ts covers four behavioral corrections (stand-in, multi-account, isActive != LMA, empty-LMA casual) | integration | `npx vitest run test/backend/match-session/auto-pick-ownership-pool.test.ts` | ✅ Created in this task | ⬜ pending |
| 12.3-08-01 | 08 | 4 | MMR-RACE-01, MMR-RACE-02 | T-12.3-28 | docs/match-results/architecture.md documents snapshot lifecycle + D-H cross-ref (C8 compliance) | grep | `grep -c "accountRatingSnapshot" docs/match-results/architecture.md` | N/A (docs) | ⬜ pending |
| 12.3-08-02 | 08 | 4 | ROST-GUARD-01 | T-12.3-28 | docs/roster/architecture.md documents rosterMutations helpers + four D-G guards (C8 compliance) | grep | `grep -c "applyBatchUpsert" docs/roster/architecture.md` | N/A (docs) | ⬜ pending |
| 12.3-08-03 | 08 | 4 | MMR-RACE-02 (TOURN-ORDER-01) + REQUIREMENTS.md backfill | T-12.3-28, T-12.3-29 | docs/tournament/architecture.md documents D-H guard; REQUIREMENTS.md contains MMR-RACE-01/02 + ROST-GUARD-01 in body + Traceability + footer coverage updated | grep | `grep -c "MMR-RACE-01" .planning/REQUIREMENTS.md && grep -c "Phase 12.3" docs/tournament/architecture.md` | N/A (docs + REQS) | ⬜ pending |
| 12.3-08-04 | 08 | 4 | ALL | ALL | Full test suite green (or failures triaged for user sign-off) | checkpoint | `npm run test:typecheck && npm run test:all` | N/A (checkpoint) | ⬜ pending |

### Legend
- **Wave** column indicates when the task runs (W1=Plan 01, W2=Plans 02-05, W3=Plans 06-07, W4=Plan 08)
- **File Exists** column: ✅ means the test file is CREATED by the same task; ❌ W3 means the test file is a Wave 3 dependency (the code-modifying task commits first, then Wave 3 creates the verification file for it)
- The code-modifying tasks in W1/W2 have test coverage deferred to W3 per C10 (test files are only created via explicit tasks, never bundled with code changes)
- `requirements` column shows which phase requirement IDs the task addresses; a dash `—` means the task supports a secondary decision (D-D, D-I, D-H) that maps to a CONTEXT.md-locked requirement not in the three top-level phase requirement IDs

---

## Wave 0 Requirements

Only create test files via explicit tasks (CLAUDE.md C10). Each Wave 0 gap is a dedicated Wave 3 task:

| Test File | Owning Task | New or Extend | Covers |
|-----------|-------------|---------------|--------|
| `test/backend/match-results/mmr-snapshot.unit.test.ts` | Plan 06 Task 1 | NEW | MMR-RACE-01 capture, default-0, max aggregation |
| `test/backend/match-results/mmr-snapshot-betweengames.test.ts` | Plan 06 Task 2 | NEW | MMR-RACE-01 monotonic HIGH→LOW, LOW→HIGH, deselect no-op |
| `test/backend/match-results/mmr-stats.test.ts` | Plan 06 Task 3 | EXTEND | MMR-RACE-02 negative control + 3 D-G guard rejections (ROST-GUARD-01) |
| `test/backend/roster/migrate-roster-rating.test.ts` | Plan 07 Task 1 | NEW | D-D-04 regression (copy + move rating recompute), D-G migrate_roster source/target guards |
| `test/backend/tournaments/tournament-ordering-guard.test.ts` | Plan 07 Task 2 | NEW | MMR-RACE-02 (D-H-01) MMR / casual / non-tournament branches, Pitfall 4 optional |
| `test/backend/match-session/auto-pick-ownership-pool.test.ts` | Plan 07 Task 3 | NEW | D-I-04 four behavioral corrections (stand-in, multi-account, isActive != LMA, empty-LMA casual) |

Framework is already installed — no install task needed. All new files use `createVerifiedTestHarness` from `test/shared/connection.ts`.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Full best-of-N tournament series with per-game account swap producing path-independent ELO deltas | MMR-RACE-02 | Tournament batch path spans multiple reducer calls across the bracket lifecycle. The automated `tournament-ordering-guard.test.ts` covers the guard + post-Completed finalize; a cross-round series with mid-round account swaps is easier to eyeball via `/gsd-verify-work` UAT | Run a 3-round tournament, swap active HSR account between rounds 1 and 2, confirm each round's `MatchResultParticipant.accountRatingSnapshot` reflects the correct round's LMA state (inspect rows via `spacetime sql`) |
| Phase 12.3 `maincloud` dashboard smoke verification | MMR-RACE-01 | The dashboard shows the live `match_result_participant` table with the new column; only the human can confirm the UI state | Open `https://spacetimedb.com/@<owner>/hsrpvp-spacetimedb-nextjs` and confirm the `match_result_participant` row layout shows `account_rating_snapshot` / `accountRatingSnapshot` after Plan 01 Task 3 runs |
| D-I stand-in auto-pick pool contribution if harness cannot simulate stand-ins mid-series | — (OWN-POOL-01) | Stand-in flow may not be exercisable in automated tests depending on harness capabilities | If Plan 07 Task 3 Scenario 3 is `it.skip(...)`, do a manual round with a stand-in joining during BetweenGames and verify their LMA characters appear in the auto-pick pool the next time `timer_expiry_classic` fires |

---

## Validation Sign-Off

- [x] All tasks have `<verify><automated>...</automated></verify>` or Wave 0 dependency documented
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (each code-modifying task in Plans 01-05 has its typecheck + downstream file-scoped vitest run; Plans 06-07 are themselves verify-only; Plan 08 ends with full test suite)
- [x] Wave 0 covers all MISSING references (6 test files/extensions enumerated above)
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending execution
