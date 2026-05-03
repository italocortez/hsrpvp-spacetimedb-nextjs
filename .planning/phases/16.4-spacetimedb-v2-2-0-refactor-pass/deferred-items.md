# Phase 16.4 Deferred Items

> Issues discovered during Plan 07 verification but not caused by Plans 01-06; out of scope for Phase 16.4. Filed for future plan / quick-task assignment.

---

## D-1: `test/backend/auth/user-deletion.test.ts` — D-17 cascade tests fail because of Plan 02 `isInternal` regression on SDK v2.2.0 [REFUTED → ESCALATED → ROOT CAUSE FOUND → **RESOLVED IN PLAN 07**]

**Status:** **RESOLVED IN PLAN 07** (2026-05-03) by hotfix commits `9c634bc`, `f24fd86`, `ead065d`, `6515a59`. Theory of "test-infra state accumulation" was REFUTED via isolation rerun on 2026-05-03 16:48 UTC. Root cause is a real regression: **Plan 02's `isInternal` guard rejects engine-dispatched scheduled reducers because the SDK v2.2.0 `senderAuth` accessor never returns `isInternal: true` for scheduled dispatch.** User authorized resolution within Plan 07 hotfix scope (no new phase): the 3 guards were reverted; the regression sensor test was updated to document engine-level "no such reducer" rejection as the actual defense; SKILL.md rule was rewritten; AUDIT-NOTES.md was amended with the v0.6 Update reversal record. Post-hotfix isolation rerun: 5/5 PASS (cascade restored). Plan 02 regression sensor still 3/3 PASS.

**Discovered:** Plan 07 Task 1 (`npm run test:integration` full-suite run, 2026-05-03)

**Symptom:**
```
FAIL test/backend/auth/user-deletion.test.ts > D-17: performUserDeletion eviction
  > non-guest with history is evicted to deleted_user, User row removed, history FKs intact
AssertionError: expected 1 to be 0
  test/backend/auth/user-deletion.test.ts:113:32
  expect(userAfter.length).toBe(0);

FAIL test/backend/auth/user-deletion.test.ts > D-17: performUserDeletion eviction
  > guest with no history is hard-deleted, no deleted_user row created
AssertionError: expected 1 to be 0
  test/backend/auth/user-deletion.test.ts:192:32
  expect(userAfter.length).toBe(0);
```
2/2 D-17 cascade tests fail; 3/5 tests in the file pass (D-18 unit tests on resolveUserLabel are unaffected).

Reproduces deterministically against current maincloud test DB after `--clear-database` republish — confirmed via `SKIP_DB_CLEAR=1 npm run test:integration -- --run user-deletion`.

**Root cause analysis:**
The test calls `admin.call.adminDeleteRow({ tableName: 'User', primaryKeyJson })` with `.catch()` to log errors but NOT fail. The `admin_delete_row` reducer (`spacetimedb/src/reducers/admin.ts:139`) has multiple precondition checks in its `case 'User'` branch:
- Line 154-159: refuses if user is hosting an active lobby
- Line 161-167: refuses if user is in any active lobby (`LobbyMember`)
- Line 168-175: refuses if user has any `MatchSessionStep` rows

If any blocker fires, the reducer throws → `deletedAt` is never set → `UserDeletionJob` is never inserted → `run_user_deletion` never dispatches → User row remains → test fails at the `expect(userAfter.length).toBe(0)` assertion.

Live SQL probe of test DB at the time of failure showed:
- `lobby_member`: 102 rows
- `lobby`: 41 rows
- `match_session_step`: 205 rows
- `user_deletion_job`: 0 rows (no jobs queued)
- `deleted_user`: 1 row

The test DB accumulates state across the full integration suite. Earlier tests in the suite create lobbies and match-step rows referencing the verified harness users that `user-deletion.test.ts` then tries to delete. The blocker checks fire; the cascade never starts.

**Original (incorrect) theory — "NOT a Plan 02 regression":** Plan 02 added an `isInternal` guard to `run_user_deletion`, but:
1. `run_user_deletion` is only invoked by SpacetimeDB's internal scheduler dispatch when the `UserDeletionJob` row's `scheduledAt` time arrives. Engine-dispatched scheduled reducers receive `ctx.senderAuth.isInternal === true` per SDK contract (`reducers.d.ts:47-54`).
2. Plan 02's regression test (`test/backend/scheduled-reducer-isInternal-rejection.test.ts`) confirmed external WS callers cannot invoke `run_user_deletion` at all — engine returns `"no such reducer"` (audit finding documented in Plan 02 SUMMARY). Internal dispatch is unaffected.
3. `user-deletion.test.ts` failures occur BEFORE the cascade is even queued: `user_deletion_job` is empty in the live DB. The job was never inserted because `admin_delete_row` threw on a precondition.

**REFUTATION (2026-05-03 16:48 UTC, isolation rerun on clean DB):**

Ran `npm run test:integration -- --run test/backend/auth/user-deletion.test.ts` after the vitest globalSetup auto-republished maincloud with `--clear-database`. Only the user-deletion tests ran — no other suite contributed accumulated state.

**Result: 2/5 tests STILL FAILED with identical assertion errors** (`expected 1 to be 0`, both at `userAfter.length`). Captured in `tmp/16.4-07/isolation-rerun.log`.

Live SQL probe of test DB POST-failure (before any other run):
- `user`: 5 rows (#1 SYSTEM, #2 verified-deleted-pending, #3 admin1, #4 guest-deleted-pending, #5 admin2)
- User #2: `is_guest=false`, `deleted_at=2026-05-03T16:49:00.271771+00:00` (set by admin_delete_row)
- User #4: `is_guest=true`, `deleted_at=2026-05-03T16:49:17.037625+00:00` (set by admin_delete_row)
- `user_deletion_job`: 0 rows (jobs auto-delete after dispatch attempt)
- `deleted_user`: 0 rows (cascade never archived)

The soft-delete (`deletedAt` set) succeeded — proving precondition checks PASSED, contradicting the original test-infra theory. The `UserDeletionJob` was inserted (transactional with `deletedAt` update — both succeed or both roll back).

**SMOKING-GUN maincloud logs** (`spacetime logs hsrpvp-spacetimedb-nextjs-test1`, captured to `tmp/16.4-07/maincloud-cascade-evidence.log`):

```
2026-05-03T16:49:00.273286Z INFO:  admin_delete_row: [ADMIN] User #2 marked for deletion. Cascade scheduled in 5s.
2026-05-03T16:49:05.272509Z ERROR: run_user_deletion: Forbidden: scheduled reducer; cannot be invoked externally.
2026-05-03T16:49:17.038847Z INFO:  admin_delete_row: [ADMIN] User #4 marked for deletion. Cascade scheduled in 5s.
2026-05-03T16:49:22.038610Z ERROR: run_user_deletion: Forbidden: scheduled reducer; cannot be invoked externally.
2026-05-03T17:03:49.434643Z ERROR: run_lobby_gc:        Forbidden: scheduled reducer; cannot be invoked externally.
```

Plan 02's `if (!ctx.senderAuth.isInternal) throw ...` guard is firing on **engine-dispatched scheduled reducer invocations**, which contradicts the SDK contract Plan 02 was written against. The `run_lobby_gc` ERROR at 17:03:49 is a separate scheduled-reducer (LobbyGcJob, seeded by post-publish.ts to fire 15 minutes after publish) — confirms this affects ALL 3 of Plan 02's hardening sites (`run_user_deletion`, `run_lobby_gc`, `run_identity_gc`), not just user-deletion.

**SDK source-level analysis** (`spacetimedb/node_modules/spacetimedb/dist/server/index.mjs`, v2.2.0):

```js
// AuthCtxImpl: only ONE path sets isInternal=true
static internal() {
  return new _AuthCtxImpl({ isInternal: true, ... });   // line 6383-6388
}

// fromSystemTables: ALWAYS sets isInternal=false regardless of connectionId
static fromSystemTables(connectionId, sender) {
  if (connectionId === null) {
    return new _AuthCtxImpl({ isInternal: false, ... });  // line 6394
  }
  return new _AuthCtxImpl({ isInternal: false, ... });    // line 6400
}

// ReducerCtxImpl.senderAuth ONLY calls fromSystemTables — never internal()
get senderAuth() {
  return this.#senderAuth ??= AuthCtxImpl.fromSystemTables(this.connectionId, this.sender);
}
```

`AuthCtxImpl.internal()` is unreachable from any path that produces `ctx.senderAuth`. **`ctx.senderAuth.isInternal` is ALWAYS `false` in v2.2.0.** Plan 02's contract assumption was wrong — the regression test (`scheduled-reducer-isInternal-rejection.test.ts`) only passes because external WS callers can't invoke scheduled reducers at all (engine returns "no such reducer" before our guard runs), giving false confidence in the guard's correctness for the internal-dispatch path.

**Severity:** HIGH — production cascade paths broken on the live test DB. Affects:
- `run_user_deletion`: user-deletion cascade never completes; soft-deleted users remain forever.
- `run_lobby_gc`: lobby garbage collection never runs; expired lobbies + AwaitingResult leaks accumulate.
- `run_identity_gc`: identity GC never runs; orphan UserIdentity rows accumulate over 7-day cycles.

**Resolution options (for user decision):**

1. **Revert Plan 02's `isInternal` guards** — remove the 3 guards in `userDeletion.ts:13`, `lobbyGc.ts:163`, `identityGc.ts:89`. The defense-in-depth is unnecessary: the engine already returns "no such reducer" for external WS callers (Plan 02 SUMMARY line: "external WS callers receive 'no such reducer' from the engine BEFORE our guard fires — the guard is defense-in-depth"). Plan 02's primary value (audit + SKILL rule) is preserved.
2. **Replace the guard with a different signal** — e.g., check `ctx.connectionId === null` (engine-dispatched scheduled reducers should have null connectionId per SDK comment at `index.mjs:6391`). Requires verification that this distinguishes scheduled from external calls correctly.
3. **Wait for upstream fix** — file an issue against SpacetimeDB about `senderAuth.isInternal` always being false; revert Plan 02 in the meantime; re-add when SDK is fixed.

Recommended: option 1 (revert). Preserves Plan 02's audit + SKILL rule (the primary deliverable per Plan 02 SUMMARY), removes broken guard, restores cascade. Add a note to SKILL.md flagging the v2.2.0 SDK limitation and the engine-level "no such reducer" rejection as the actual defense.

**Phase history:**
- 2026-04-15 (Phase 15.2 close): `npm run test:integration -- test/backend/auth/` reported 34/34 PASS. Test suite was smaller then; less accumulated state by the time `user-deletion.test.ts` ran.
- Between 15.2 close and 16.4 close, Phases 15.3, 15.4, 16, 16.1, 16.2, 16.3 added integration tests that create lobbies/matches as side effects on the test users. These persist in the DB through the suite.
- 2026-05-03 (Phase 16.4 Plan 07): full suite reproduces 2/2 D-17 failures.

**Suggested resolution path (deferred):**
1. **Cleanup hooks:** Add `beforeEach` / `afterEach` in `user-deletion.test.ts` that explicitly removes the target user from any lobbies / match-steps before calling `adminDeleteRow`. Most surgical fix.
2. **Test ordering:** Hoist `user-deletion.test.ts` to run early in the suite (before lobby/match tests accumulate state). Vitest sequence options allow this. Trade-off: brittle dependency on suite ordering.
3. **Defensive admin_delete_row:** Could add a `force=true` flag to admin_delete_row that cascades through active references. Larger surface change; not appropriate as a test fix.
4. **Test isolation via .test-only nuke:** Run `nuke_test_data` (Phase 16.4 Plan 01's refactored reducer) before each user-deletion test to wipe accumulated state. Heavy but safe.

**Filed for:** Phase 16.4 BLOCKING issue — must be resolved before phase sign-off (returned to user as a Plan 07 human-action checkpoint, 2026-05-03 16:55 UTC).

**Severity:** HIGH — Plan 02 introduced a real production regression on SpacetimeDB v2.2.0. The 3 `isInternal` guards in scheduled reducers (`run_user_deletion`, `run_lobby_gc`, `run_identity_gc`) reject ALL invocations including legitimate engine dispatch. SC#7 ("no behavioral regressions") explicitly fails. The 16.4 verification gate **CANNOT** PASS in current state.

Phase 16.4 verdict: **BLOCKED** pending resolution decision.

The earlier "test-infra state-accumulation" analysis (kept above for record) was incorrect — root cause is in production code (Plan 02), not test setup.

### RESOLVED — 2026-05-03 (Plan 07 hotfix)

User authorized resolution within Plan 07's scope on the current `feature_nath_claude` branch (no new phase). Selected resolution path: **Option 1 — Revert Plan 02's `isInternal` guards.**

**Hotfix commits (in order):**

| Commit | Type | Subject |
|---|---|---|
| `9c634bc` | `fix(16.4-07)` | Revert Plan 02 isInternal guards (v2.2.0 SDK never sets isInternal=true; engine 'no such reducer' rejection is the actual defense) |
| `f24fd86` | `test(16.4-07)` | Update Plan 02 regression sensor to reflect v2.2.0 engine-level defense (not isInternal guard) |
| `ead065d` | `docs(16.4-07)` | Correct SKILL.md scheduled-reducer rule to reflect v2.2.0 engine-level defense |
| `6515a59` | `docs(16.4-07)` | Amend 16.4-AUDIT-NOTES.md with v2.2.0 internal-dispatch finding and reversal record |

**Post-hotfix verification:**
- `npm run test:integration -- --run test/backend/auth/user-deletion.test.ts` → **5/5 PASS** (was 3/5 pre-hotfix; cascade restored)
- `npm run test:integration -- --run test/backend/scheduled-reducer-isInternal-rejection.test.ts` → **3/3 PASS** (engine-level "no such reducer" defense path still rejects external WS callers)
- Smoke probes 1 + 2 (st_table schema check + gc_result count) confirm no schema delta + table queryable

**What was preserved:**
- Plan 02 AUDIT applicability findings (a)/(b)/(c) (`AuthCtx` not a substitute for `requireServer` / `getAuthenticatedUser` / `ensureXxx`) remain valid.
- The regression sensor test stays in tree (text-only update; assertion logic unchanged; still rejects external WS callers via the engine-level path).
- SKILL.md rule is rewritten (not deleted) — now documents the v2.2.0 internal-dispatch limitation + engine-level defense as the operational truth.
- AUDIT-NOTES.md is appended (not overwritten) — original content preserved as audit trail.

**Operational defense layer (post-hotfix):** SpacetimeDB v2.2.0 engine returns `"no such reducer"` for external WS calls to scheduled-reducer names BEFORE any application code runs. Verified live by the regression sensor test. Future-revisit conditions are documented in AUDIT-NOTES.md "v0.6 Update — Plan 07 Diagnostic Reversal".

Phase 16.4 verdict: **PASS**.

---

## D-2: `spacetime sql` lacks `IS NOT NULL` and `ORDER BY ... DESC` operators (informational)

**Discovered:** Plan 07 diagnostic SQL probes against test DB.

**Symptom:**
```
spacetime sql hsrpvp-spacetimedb-nextjs-test1 "SELECT id FROM user WHERE deleted_at IS NOT NULL"
→ Error: Unsupported expression: deleted_at IS NOT NULL

spacetime sql hsrpvp-spacetimedb-nextjs-test1 "SELECT id FROM user ORDER BY id DESC LIMIT 10"
→ Error: Unsupported: SELECT id ... ORDER BY id DESC LIMIT 10
```

SpacetimeDB's SQL surface is a subset of standard SQL. Workarounds:
- Use `WHERE deleted_at != ...` with a sentinel value, or filter by application-level reducer query
- Use ascending ORDER BY only, or omit ORDER BY (insertion order is stable for autoinc PKs)

**Filed for:** SKILL.md addendum candidate (`### spacetime sql column name gotcha` already exists; could extend with operator limitations). Not blocking; documented for future readers.

**Severity:** Low (documentation only).
