/**
 * Shared HsrAccount seeding helper.
 *
 * HsrAccount is a private table since Phase 10.4 — existence is checked via
 * queryPrivateTable (spacetime sql CLI) rather than iter(). Idempotent: returns
 * early if the user already has at least one HSR account.
 */

import type { TestHarness } from '../connection';
import { queryPrivateTable } from '../connection';

/**
 * Ensure a test player has an HSR account (needed for D-08 LMA gate on
 * Ranked/MMR lobbies). If the user has any hsr_account row, returns
 * immediately; otherwise creates one using a deterministic UID derived from
 * userId.
 */
export async function ensureHsrAccount(h: TestHarness): Promise<void> {
    const rows = await queryPrivateTable(
        `SELECT * FROM hsr_account WHERE user_id = ${h.userId}`
    );
    if (rows.length > 0) return; // already has an account
    const uid = `8${String(h.userId).padStart(7, '0')}1`;
    await h.call.createHsrAccount({ uid, displayLabel: `Test ${h.userId}` });
    await h.sync(1500);
}
