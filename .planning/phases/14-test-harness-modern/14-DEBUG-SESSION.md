---
phase: 14-test-harness-modern
type: debug-session
status: in-progress
started: 2026-04-09
updated: 2026-04-10
---

# Phase 14 Post-Execution Debug Session

## TL;DR

Phase 14 is **officially complete** (verifier passed 7/7, ROADMAP marked done). But during post-execution test runs, the full suite flakes with 3–16 failures per run — different files each time. Investigation concluded the root cause is **maincloud latency variance**, not anything architectural in Phase 14's changes. All mitigation changes are committed. The suite needs a clean run under stable network conditions to confirm 0 failures is achievable.

## Context

Phase 14 delivered three changes:
1. `withConfirmedReads(false)` on all `DbConnection.builder()` sites in test/ and scripts/
2. `onApplied` subscription-readiness callback replacing `setTimeout(2000)` in `createHarnessInternal`
3. View refactor: `view_my_identity` / `view_my_roster` replacing `spacetime sql` CLI roundtrips

All three changes verified working. The test flakiness emerged during the **verification run** of the full suite.

## Environmental Note

User reported: "I lost internet for a few minutes" during one of the runs. Multiple runs happened across the session — some may have caught network instability. Maincloud itself appears to be slower than the Phase 10.5 baseline (54m38s) even without our changes.

## Investigation Timeline

### Round 1 — bracket-advancement.test.ts timeouts (3 fail + 8 skip)
- **Symptom**: Tournament B test 1 `setupTournamentMatch` timed out at 120s; Tournament C `beforeAll` timed out at 90s; cascade skipped 8 tests
- **Fix**: Bumped Tournament B test 1 → 180s, Tournament C `beforeAll` → 120s, `afterAll` cleanup → 90s. Reduced single-reducer `sync(1500)` → `sync(1000)` in `setupTournament` / `setupTournamentMatch`.
- **Commits**: `e166371`, `294d981`
- **Isolated rerun**: 28/28 passed (177s, was 327s)

### Round 2 — 502 Bad Gateway from spacetime sql CLI
- **Symptom**: `ensureHsrAccount` and `createHarnessInternal` called `queryPrivateTable` which used `spacetime sql` subprocess. Transient 502s from maincloud caused test failures.
- **Fix**: Refactored to use SpacetimeDB views (no CLI roundtrip):
  - `createHarnessInternal` now reads `conn.db.view_my_identity.iter()` for userId
  - `ensureHsrAccount` now checks `conn.db.view_my_roster.iter().length > 0`
- **Commit**: `f15524f`
- **Validation rerun (4 previously-failing files)**: 53/53 passed

### Round 3 — New flakiness (1 fail + 26 skip)
- **Symptom**: Different files failed: `draft-control.test.ts` (15s connection timeout), `post-draft.test.ts` (120s hook timeout), `match-lifecycle.test.ts` (20s test timeout)
- **Fix**: Bumped `createHarnessInternal` connection timeout 15s → 30s; post-draft `beforeAll` 120s → 180s; match-lifecycle finalize test 20s → 30s; draft-control coach-guard `beforeAll` 60s → 120s
- **Commit**: `cc20f9f`

### Round 4 — Global defaults too tight (17 fail — most in chat-messages cascade)
- **Symptom**: `chat-messages.test.ts` `beforeAll(30s)` timed out; `match-lifecycle` Casual Auto-Finalize 20s timeouts
- **Fix**: Raised vitest integration defaults `testTimeout: 30s → 60s`, `hookTimeout: 30s → 120s`. Bumped specific tight tests to 30s.
- **Commit**: `dc57133`

### Round 5 — Internet dropped mid-run (3 fail + 12 skip)
- Failures in bracket-advancement, disconnect-admin-tools, match-lifecycle
- User reported internet dropped for a few minutes during this run

### Round 6 — Focused rerun of 3 failing files (13 fail + 31 skip)
- Ran only the 3 failed files. Got WORSE results than the full suite.
- This is suspicious: maincloud may have been genuinely slow, or focused reruns don't get the warmup the full suite provides.

### Round 7 — The `withConfirmedReads(false)` experiment
- **Hypothesis**: Phase 14 cargo-culted `withConfirmedReads(false)` from the frontend (where it's for UI latency) to the test harness (which needs deterministic reducer-to-cache sync). Reverting should stabilize tests.
- **Experiment**: Reverted `withConfirmedReads(false)` on all test files only (kept frontend and scripts as-is). Ran full suite.
- **Result**: **Made things worse.**
  - Runtime: 57 min → **88 min** (+31 min of latency overhead)
  - Failures: 3–13 → **16**
  - Skipped: 12–26 → **70**
- **Commit (experiment)**: `b5138f5`
- **Revert of experiment**: `d7ecb47`
- **Conclusion**: Hypothesis was wrong. `confirmed=false` is objectively better for tests. This is consistent with Phase 12.2 D-11's rationale ("avoid latency increase"). The flakiness is NOT from the confirmed-reads flag.

## Evidence Summary

| Config | Runtime | Failures | Skipped | Notes |
|--------|---------|----------|---------|-------|
| SDK 2.0.3 (Phase 10.5 baseline) | 54m38s | 0 | 0 | Pre-2.1.0, no confirmed-reads option |
| SDK 2.1.0 default (Phase 12.2) | ~63 min | 0 | 8 | `confirmed=true` by default, 2 pre-existing flaky in anonymous-labels |
| Phase 14 (`confirmed=false` + onApplied + views) | ~57 min | 3–13 | 12–26 | Flaky varies by run |
| Experiment (revert to `confirmed=true`) | **88 min** | **16** | **70** | Latency overhead pushed MORE tests over timeouts |

## Current State of Test Harness

All mitigation commits landed. Test harness state:
- `withConfirmedReads(false)` — KEPT (experiment proved it's better)
- `onApplied` — KEPT (clean win, event-driven readiness)
- `view_my_identity` / `view_my_roster` — KEPT (eliminates CLI subprocess + 502s)
- Connection timeout: 15s → 30s
- vitest global defaults: `testTimeout: 60s`, `hookTimeout: 120s`
- Per-test bumped timeouts across bracket-advancement, match-lifecycle, disconnect-admin-tools, chat-messages, draft-control, post-draft

## Key Commits (in order)

```
831d624 feat(14-01): withConfirmedReads(false) + onApplied subscription readiness
f09d995 docs(14-02): record Phase 14 test suite runtime baseline
c57acb2 docs(14-02): complete helper dedup verification + runtime baseline
a133790 docs(phase-14): complete phase execution — verification passed
e166371 fix(test): increase bracket-advancement timeouts and reduce sync waits
294d981 fix(test): add afterAll timeout for bracket-advancement cleanup
f15524f refactor(test): replace spacetime sql with view subscriptions in hot paths
cc20f9f fix(test): bump timeouts for transient maincloud slowness
dc57133 fix(test): raise default timeouts for maincloud latency headroom
b5138f5 revert(test): restore confirmed reads default on test harness    [EXPERIMENT]
d7ecb47 Revert "revert(test): restore confirmed reads default on test harness"  [REVERT OF EXPERIMENT]
```

Everything from `831d624` through `d7ecb47` is committed on `feature_nath_claude`.

## Open Questions

1. **Is the flakiness purely environmental?** The evidence strongly suggests yes — failures vary by run, concentrate in heavy-network tests, and the confirmed-reads experiment proved architectural theories wrong. But we haven't had a clean run under stable conditions to confirm.

2. **Has maincloud gotten structurally slower?** The Phase 10.5 baseline was 54m38s on SDK 2.0.3. Phase 12.2 saw ~63 min on SDK 2.1.0 default. Phase 14 sees ~57 min. None of these are identical conditions, but the range is 54–88 min for similar suite sizes.

3. **Are the timeout bumps still right?** They were added as headroom for maincloud jitter. If maincloud is permanently slower, they're correct. If it's transient, they could be tightened later.

4. **Are there any DETERMINISTIC failures hidden in the noise?** So far, each run fails different tests — all look environmental. But we should look for any test that consistently fails to rule out real bugs.

## Next Session — What To Try

1. **Clean rerun under stable network**: Wait for stable internet + maincloud load. Run `npm run test:all`. If 0 failures, we're done; record the baseline and declare Phase 14 test-wise complete.

2. **If failures persist after a clean run**: Look for pattern — are the same tests failing across runs, or different ones?
   - Same tests → deterministic bug, investigate those specific tests
   - Different tests → confirmed environmental; consider further mitigations

3. **Potential mitigations to try if environmental**:
   - Retry logic wrapper for flaky reducer calls (adds complexity, masks issues)
   - Move tests from maincloud to a local/staging SpacetimeDB instance
   - Ping maincloud maintainers about latency regression
   - Add test isolation (more `afterEach` cleanup) to prevent state bleed

4. **If things are clean**: Consider whether the aggressive timeout bumps can be tightened back down without re-introducing flakiness.

## Files Modified (cumulative across this debug work)

- `test/shared/connection.ts` — withConfirmedReads(false), onApplied, view_my_identity, 30s connection timeout
- `test/shared/helpers/hsrAccounts.ts` — uses view_my_roster instead of queryPrivateTable
- `test/vitest.integration.config.ts` — testTimeout 60s, hookTimeout 120s
- `test/backend/brackets/bracket-advancement.test.ts` — timeout bumps, sync reductions
- `test/backend/lobby/disconnect-admin-tools.test.ts` — 45s → 90s on 4 tests
- `test/backend/match-results/match-lifecycle.test.ts` — 20s → 30s → 60s escalating
- `test/backend/match-session/post-draft.test.ts` — 120s → 180s beforeAll
- `test/backend/match-session/draft-control.test.ts` — 60s → 120s coach-guard beforeAll
- `test/backend/chat/chat-messages.test.ts` — 30s → 120s beforeAll

## How to Resume

1. Read this file (`.planning/phases/14-test-harness-modern/14-DEBUG-SESSION.md`)
2. Check current branch: `feature_nath_claude` at `d7ecb47` (or later)
3. Verify internet + maincloud are stable: try one quick integration test first
4. Run `npm run test:all` and compare results against the table above
5. If stable, update the test/README.md Suite Runtime row with final numbers
6. If still flaky, look at which tests fail and decide between deterministic-bug investigation vs. environmental-accept

---

*Session paused: 2026-04-10 after Phase 14 marked complete but test suite verification incomplete due to environmental flakiness*
