---
phase: 14-test-harness-modern
type: debug-session
status: mitigated
started: 2026-04-09
updated: 2026-04-10
rounds: 9
mitigation: test/global-setup.ts (Round 9)
---

# Phase 14 Post-Execution Debug Session

## TL;DR

Phase 14 is **officially complete** (verifier passed 7/7, ROADMAP marked done). Post-execution debugging ran 9 rounds. **Round 8 suggested "environmental, accept"; Round 9 superseded that with the real root cause: cumulative state accumulation on maincloud across runs.** A post-Round-8 audit of DB row counts found 58 leaked `User` rows, 4 leaked `Lobby` rows in `AwaitingResult`, 6 leaked `MatchResultRecord` rows, and 3 cancelled-but-persistent `Tournament` rows — all from just 111 Round 8 tests. Three distinct leak mechanisms identified, all rooted in intentional backend design (D-48 awaitingResult skip, historical-record tournament persistence, no user deletion path). Round 9 mitigation: `test/global-setup.ts` Vitest globalSetup hook that clears + reseeds the maincloud test DB once per suite invocation (~11.4s overhead, <1% of a 57min run). Intra-suite accumulation remains a possible concern but should be measured under the new clean-baseline invariant.

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
| **Round 8 — Isolation (all 6 flaky files, fresh DB)** | **~13 min total** | **0** | **0** | **All 6 files 100% clean in isolation** |

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

## Round 8 — Isolation Reruns on Fresh DB

**Date:** 2026-04-10
**Branch:** `feature_nath_claude` at `668b7b5`
**Database state:** `hsrpvp-spacetimedb-nextjs-test1` freshly cleared + reseeded via `post-publish.ts`

### Method

Each of the 6 historically-flaky files was run in isolation using:
```
npx vitest run --config test/vitest.integration.config.ts <file>
```
No other test files ran concurrently. This removes full-suite connection contention as a variable.

### Results

| File | Start (UTC) | End (UTC) | Runtime | Pass | Fail | Skip | Verdict |
|------|-------------|-----------|---------|------|------|------|---------|
| chat/chat-messages.test.ts | 20:53:03 | 20:55:02 | 118s | 22 | 0 | 0 | CLEAN |
| match-results/match-lifecycle.test.ts | 20:55:06 | 20:57:51 | 164s | 24 | 0 | 0 | CLEAN |
| match-session/draft-control.test.ts | 20:57:54 | 21:00:56 | 182s | 8 | 0 | 0 | CLEAN |
| match-session/post-draft.test.ts | 21:01:00 | 21:02:38 | 97s | 24 | 0 | 0 | CLEAN |
| lobby/disconnect-admin-tools.test.ts | 21:02:41 | 21:03:43 | 60s | 5 | 0 | 0 | CLEAN |
| brackets/bracket-advancement.test.ts | 21:03:46 | 21:06:22 | 155s | 28 | 0 | 0 | CLEAN |
| **TOTAL** | | | **~13 min** | **111** | **0** | **0** | **ALL CLEAN** |

### Interpretation

Every single file that has flaked in full-suite runs passed 100% in isolation. No deterministic failures exist. This is unambiguous: the failures in rounds 1–7 were caused by **maincloud bandwidth contention when all files run in parallel**, not by any bug in test logic, harness code, or backend reducers.

### Round 8 Conclusion

**Root cause: environmental (full-suite connection contention on maincloud).**

- Confidence: HIGH. All 6 flaky files pass cleanly in isolation. The only variable that changes between isolation (pass) and full-suite (flake) is the number of concurrent SpacetimeDB connections hitting maincloud simultaneously.
- There are zero deterministic bugs to fix.
- All timeout bumps from rounds 1–4 are appropriate headroom — they absorb maincloud jitter and should be kept.

**Recommended next step:** Accept the current state. The suite is architecturally sound. Full-suite flakiness is a maincloud latency artifact. Options ranked by effort:
1. **(Low effort, accept)** Run `npm run test:all` under stable network; expect occasional non-zero failures on maincloud. The suite is correct.
2. **(Medium effort, mitigate)** Serialize the integration test files (run sequentially, not in parallel) by adding `--pool=forks --poolOptions.forks.singleFork` or equivalent vitest config. This reduces peak concurrency at the cost of longer runtime.
3. **(High effort, structural)** Move integration tests to a self-hosted or local SpacetimeDB instance to eliminate maincloud latency variance entirely.

---

## Round 9 — Cumulative State Accumulation (Root Cause Correction)

**Date:** 2026-04-10
**Branch:** `feature_nath_claude` at `668b7b5`

Round 8's conclusion ("environmental, accept") was **partially wrong**. A follow-up audit of the maincloud database *after* Round 8 completed revealed that the six isolated files — which Round 8 reported as "clean" because all tests passed — had in fact left behind a large footprint of leaked rows. Running `SELECT COUNT(*)` on the key tables immediately after Round 8 (with no other runs between) returned:

| Table | Count after 111 passing isolated tests | Expected |
|-------|---------------------------------------:|---------:|
| User | 58 | 0 |
| UserPrivate | 57 | 0 |
| UserIdentity | 58 | 0 |
| HsrAccount | 7 | 0 |
| Lobby | 4 | 0 |
| LobbyMember | 6 | 0 |
| Tournament | 3 (all in `Cancelled`) | 0 |
| TournamentEnrolled | 12 | 0 |
| MatchSession | 4 | 0 |
| MatchSessionStep | 38 | 0 |
| MatchResultRecord | 6 (all `pending` or `rejected`) | 0 |
| MatchResultParticipant | 8 | 0 |
| PlayerStat | 8 | 0 |
| MmrRating | 2 | 0 |
| ChatMessage | 23 | permanent (expected to grow) |
| MatchSessionHistory | 5 | permanent (expected to grow) |
| MatchSessionStepHistory | 76 | permanent (expected to grow) |

Round 8 passed *because* those tables were still relatively small. The full suite flakes because after all 58 integration files have run, those same tables are an order of magnitude larger, and later files scan inflated indexes until timeouts cascade.

### Three distinct leak categories

Inspecting the actual leaked row contents identified **three independent mechanisms**, not one:

#### 1. Permanent identity leak (unbounded, fastest growth)

`createVerifiedTestHarness()` creates a `User` + `UserPrivate` + `UserIdentity` row per call. There is **no deletion path** for these on `disconnect()` — identity rows persist forever by design. With ~111 tests leaking 58 Users, the rate is ~0.5 Users/test. A full suite of ~1,000+ tests leaks ~500 Users per run, compounding across runs.

#### 2. `AwaitingResult` lobbies leaked by rejection tests (bounded per test, but permanent)

Evidence from the leaked rows:

- **Lobby 24 / MR 3**: `status=rejected`, `dispute_reason="No screenshots provided"` — from a match-lifecycle dispute test that verifies rejection but doesn't clean up.
- **Lobby 38 / MR 18, 19**: `concede_summary="DeferMatch by userId:42"`, two MatchResultRecords for the same lobby. From a `disconnect-admin-tools` test that verified `admin_force_finalize` rejection path (non-admin caller) — when the call is rejected, no finalization runs, so the lobby and both MRs persist.
- **Lobby 40 / MR 22, 23**: Same pattern as Lobby 38 with different user IDs.

Root cause: `spacetimedb/src/reducers/lobbyGc.ts:101-102` explicitly skips `AwaitingResult` lobbies:

```ts
// D-48: AwaitingResult NEVER GC'd (admin-only resolution)
if (lobby.stage.tag === 'AwaitingResult') continue;
```

This is **intentional per D-48** — `AwaitingResult` requires admin resolution (`admin_force_finalize` or `admin_void_match`). Tests that verify *rejection* of these admin reducers (non-admin callers, wrong state, etc.) put a lobby into `AwaitingResult`, verify the rejection, and disconnect — but the backend design guarantees the lobby will never be auto-cleaned. These are real leaks with no backend mitigation.

#### 3. `Tournament` rows persist when cancelled (by design)

`spacetimedb/src/reducers/tournamentManagement.ts:415-419` — `cancel_tournament` updates stage to `Cancelled` but does not delete the `Tournament` row:

```ts
ctx.db.Tournament.id.update({
    ...tournament,
    stage: { tag: 'Cancelled', value: {} } as any,
    ...auditUpdate(ctx, tournament, user.id),
} as any);
```

This is correct for production (cancelled tournaments are historical records). But bracket-advancement tests create 3 tournaments per run, each gets cancelled in teardown, and all 3 persist forever. No backend change is appropriate here — this is a test-side responsibility.

### Backend cleanup path verification

Per `spacetimedb/src/helpers/finalizationHelpers.ts:549-558`, the full finalization pipeline DOES delete ephemeral records:

```ts
// 18. Delete ephemeral records (children first, then steps, then record) — always runs
for (const g of games) { ctx.db.MatchResultGame.delete(g); }
for (const p of participants) { ctx.db.MatchResultParticipant.delete(p); }
for (const step of steps) { ctx.db.MatchSessionStep.delete(step); }
const finalResult = ctx.db.MatchResultRecord.id.find(matchResult.id);
if (finalResult) { ctx.db.MatchResultRecord.delete(finalResult); }

// 19. Cascade-delete lobby — always runs
hardDeleteLobby(ctx, matchResult.lobbyId);
```

So the cleanup path is correct. The leaks happen only when the finalization pipeline is **never reached** — i.e., matches that stay in `pending`/`rejected`/`awaitingResult` forever because the test intentionally tested an error path.

### Root cause (corrected)

**Full-suite flakiness is caused by cumulative state accumulation on maincloud across runs, amplified by three leak mechanisms that are rooted in backend design choices (intentional D-48 and historical-record persistence) and Vitest test patterns (no `afterAll` cleanup hooks for rejection tests).**

Round 8 missed this because it only measured within a single run, not across runs. Test isolation *within* a single Round 8 invocation was clean because the database started clean. But successive runs without a `--clear-database` between them compound the accumulation — which is exactly what happens during normal development.

### Mitigation: `test/global-setup.ts` (Round 9 fix)

Added a Vitest `globalSetup` hook that runs once before the entire integration suite (not per-file) and:

1. Loads `PUBLIC_SPACETIMEDB_DB_NAME` from `.env.local`.
2. Refuses to run unless the name contains `-test` (safety guard against accidental production wipes).
3. Honours `SKIP_DB_CLEAR=1` env var for single-file iteration.
4. Runs `spacetime publish --clear-database -y --module-path spacetimedb`.
5. Runs `npx tsx scripts/post-publish.ts` to reseed characters, lightcones, archetypes, achievements, configs, and GC jobs.

Wired into `test/vitest.integration.config.ts` via `globalSetup: ['./test/global-setup.ts']`.

**Measured cost: 11.4s per suite invocation** (much faster than the 60-90s I estimated). On a ~57min full run this is <1% overhead for a dramatically more deterministic baseline.

**Smoke test:** `npx vitest run test/backend/auth/auth-views.test.ts` — globalSetup ran, cleared the DB, reseeded, then tests passed 4/4. Post-setup row counts verified: `User=1` (just the post-publish server identity), all ephemeral tables `=0`.

### What this does and doesn't solve

**Solves:**
- Cross-run accumulation. Every full-suite invocation now starts from the same clean baseline.
- The primary cause of the "flakes get worse after successive runs" pattern.

**Does not solve:**
- Intra-suite accumulation within a single run. By the end of the suite, tables are still large (~500 Users, ~70 lobbies, etc.) and later-running files still face inflated tables.
- The underlying backend design choices (D-48 awaitingResult skip, tournament historical-record persistence, no user deletion path on disconnect) — these are intentional and out of scope for test infrastructure.

**If intra-suite flakiness persists after this fix**, the next options (not implemented in Round 9):

1. **Add `afterAll` cleanup hooks to rejection tests** — currently blocked by the project rule "Test files are the verification layer. Do not create, edit, or delete test files without an explicit task." Would need explicit authorization.
2. **Add a test-only `admin_nuke_test_data` reducer** that wipes all non-seed tables, called from a vitest `afterAll` at the suite level. Backend-side addition, doesn't touch test files.
3. **Periodic mid-suite clear** — run the globalSetup logic every N files via a custom reporter.

### Round 9 Conclusion

Round 8's "environmental, accept" verdict is **superseded**. The root cause is cumulative state accumulation, primarily compounding *across runs* — fixed by the globalSetup. Intra-suite accumulation is a remaining concern but should be measured under the new clean-baseline invariant before deciding whether to pursue further mitigation.

**Next step:** Run `npm run test:all` under the new globalSetup, measure post-suite row counts, and compare to the pre-Round-9 table. If the full suite passes cleanly now, accept. If it still flakes, measure how much the intra-suite accumulation contributes and decide between options 1-3 above.

---

*Session updated: 2026-04-10 — Round 9 complete. Root cause corrected: cumulative state accumulation, mitigated by globalSetup.*
