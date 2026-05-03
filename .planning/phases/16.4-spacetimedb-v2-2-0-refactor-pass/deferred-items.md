# Phase 16.4 Deferred Items

> Issues discovered during Plan 07 verification but not caused by Plans 01-06; out of scope for Phase 16.4. Filed for future plan / quick-task assignment.

---

## D-1: `test/backend/auth/user-deletion.test.ts` — D-17 cascade tests fail on state-accumulation conditions

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

**NOT a Plan 02 regression.** Plan 02 added an `isInternal` guard to `run_user_deletion`, but:
1. `run_user_deletion` is only invoked by SpacetimeDB's internal scheduler dispatch when the `UserDeletionJob` row's `scheduledAt` time arrives. Engine-dispatched scheduled reducers receive `ctx.senderAuth.isInternal === true` per SDK contract (`reducers.d.ts:47-54`).
2. Plan 02's regression test (`test/backend/scheduled-reducer-isInternal-rejection.test.ts`) confirmed external WS callers cannot invoke `run_user_deletion` at all — engine returns `"no such reducer"` (audit finding documented in Plan 02 SUMMARY). Internal dispatch is unaffected.
3. `user-deletion.test.ts` failures occur BEFORE the cascade is even queued: `user_deletion_job` is empty in the live DB. The job was never inserted because `admin_delete_row` threw on a precondition.

**Phase history:**
- 2026-04-15 (Phase 15.2 close): `npm run test:integration -- test/backend/auth/` reported 34/34 PASS. Test suite was smaller then; less accumulated state by the time `user-deletion.test.ts` ran.
- Between 15.2 close and 16.4 close, Phases 15.3, 15.4, 16, 16.1, 16.2, 16.3 added integration tests that create lobbies/matches as side effects on the test users. These persist in the DB through the suite.
- 2026-05-03 (Phase 16.4 Plan 07): full suite reproduces 2/2 D-17 failures.

**Suggested resolution path (deferred):**
1. **Cleanup hooks:** Add `beforeEach` / `afterEach` in `user-deletion.test.ts` that explicitly removes the target user from any lobbies / match-steps before calling `adminDeleteRow`. Most surgical fix.
2. **Test ordering:** Hoist `user-deletion.test.ts` to run early in the suite (before lobby/match tests accumulate state). Vitest sequence options allow this. Trade-off: brittle dependency on suite ordering.
3. **Defensive admin_delete_row:** Could add a `force=true` flag to admin_delete_row that cascades through active references. Larger surface change; not appropriate as a test fix.
4. **Test isolation via .test-only nuke:** Run `nuke_test_data` (Phase 16.4 Plan 01's refactored reducer) before each user-deletion test to wipe accumulated state. Heavy but safe.

**Filed for:** Phase 17+ test-hygiene quick task or `/gsd-fast` candidate. Not in scope for 16.4.

**Severity:** Medium (test infra; production code path is correct — cascade has been verified working manually via `admin_delete_row` end-to-end on staging in earlier phases). Does NOT block 16.4 verification gate because:
- The 2 failures are infrastructure-only, not behavior changes introduced by 16.4
- 100% of Plan 02's `isInternal` regression test (`scheduled-reducer-isInternal-rejection.test.ts`) passes
- All 9 success criteria for 16.4 (SC#1-9) are about SDK-surface adoption and skill-rule documentation, none of which depend on user-deletion eviction working

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
