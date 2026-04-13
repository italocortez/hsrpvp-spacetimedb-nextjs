/**
 * Phase 15 D-20: Two-identity test helper for cross-user isolation tests.
 *
 * Wave-0 spike result (run 2026-04-13):
 *   conn.db.view_my_mmr_history defined: YES
 *   conn.db.view_my_match_participant_history defined: YES
 *   conn.db.view_my_match_session_history defined: YES
 *   conn.db.view_my_match_session_step_history defined: YES
 *   conn.db.view_my_match_result_game_history defined: YES
 *
 * All 5 new history-view bindings are present in src/module_bindings/index.ts
 * (lines ~1690-1710) and re-exported through DbConnection.db — verified by
 * grep on `view_my_mmr_history:` against the generated barrel. Views are
 * auto-subscribed via `subscribeToAllTables()` in `createVerifiedTestHarness`
 * (test/shared/connection.ts:127), so the isolation tests use the
 * subscription + `.iter()` path (preferred) rather than SQL fallback.
 *
 * SQL-on-backing-table cross-check is still used in some assertions to verify
 * that the VIEW rows are a subset of what the backing table contains for the
 * caller's userId — i.e. the view's filter logic matches a direct `WHERE user_id = X`
 * query on the underlying table.
 */

import { createVerifiedTestHarness, hasServerToken, type TestHarness } from './connection';

export interface TwoIdentities {
    userA: TestHarness;
    userB: TestHarness;
}

/**
 * Creates two fresh verified harnesses (distinct Discord IDs).
 * Each call to `createVerifiedTestHarness` generates a unique
 * `test_<timestamp>_<random>` provider ID, so userA and userB end up
 * as independent UserIdentity → User rows on the server.
 */
export async function createTwoVerifiedHarnesses(): Promise<TwoIdentities> {
    const [userA, userB] = await Promise.all([
        createVerifiedTestHarness(),
        createVerifiedTestHarness(),
    ]);
    return { userA, userB };
}

export async function disconnectBoth(pair: TwoIdentities | undefined): Promise<void> {
    if (!pair) return;
    await Promise.allSettled([
        pair.userA?.disconnect(),
        pair.userB?.disconnect(),
    ]);
}

export { hasServerToken };
