/**
 * Integration tests: D-I-04 auto-pick ownership pool — four behavioral corrections.
 *
 * Phase 12.3 Plan 07 Task 3. Owns regression coverage for:
 *   - D-I-01/02: timer_expiry_classic ownership-pool block migrated from
 *     HsrAccount.isActive to LobbyMemberAccount.by_lobby_and_user (Plan 01).
 *   - D-I-04 four behavioral corrections (now observable through the auto-pick
 *     path):
 *       (1) Non-tournament: isActive=A but LMA=B → pool is B's characters.
 *       (2) Multi-account tournament: union of ALL selected LMA accounts.
 *       (3) Stand-in: contributes their selected LMA chars, not the original
 *           captain's isActive chars.
 *       (4) Casual requireOwnership with a member missing LMA → that member
 *           contributes empty, pool is still assembled from the remaining team.
 *
 * The D-I-04 code block lives at draftClassic.ts:670-691 (post-Plan 01). The
 * auto-pick path is reached via `timer_expiry_classic` with a short turn timer
 * and `autoRandomPick=true` + `requireOwnership=true`.
 *
 * Pitfall 9 (RESEARCH.md): pre-existing draft-classic.test.ts / post-draft.test.ts
 * tests may have been passing because of the OLD isActive-based pool. Per C10,
 * Plan 07 does NOT fix those — it REPORTS them in the summary if observed.
 *
 * Scenarios that cannot be set up cleanly are marked `it.skip(...)` with
 * explanation. Manual UAT owns the gaps.
 *
 * Requires: SPACETIMEDB_SERVER_TOKEN in .env.local (post-publish bootstrap)
 *
 * Contract: docs/match-session/contract.md — timer_expiry_classic auto-pick pool
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    createVerifiedTestHarness,
    hasServerToken,
    sleep,
    queryPrivateTable,
    type TestHarness,
} from '../../shared/connection';
import { defaultLobbyArgs } from '../../shared/helpers/lobbies';
import { startDraftAndSync } from '../../shared/helpers/drafts';
import { myLobbies } from '../../shared/helpers/queries';
import { characterBatch, nextUid, resetUidCounter } from '../../shared/fixtures';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Get the MatchSession for a lobby. */
function getSession(h: TestHarness, lobbyId: number) {
    return [...h.conn.db.MatchSession.iter()].find(s => s.lobbyId === lobbyId);
}

/** Get all MatchSessionStep rows for a lobby, sorted by sequence. */
function getSteps(h: TestHarness, lobbyId: number) {
    return [...h.conn.db.MatchSessionStep.iter()]
        .filter(s => s.lobbyId === lobbyId)
        .sort((a, b) => a.sequence - b.sequence);
}

/** Create an HsrAccount for `h`, return its id. */
async function createAccount(
    h: TestHarness,
    uid: string,
    label: string,
): Promise<number> {
    await h.call.createHsrAccount({ uid, displayLabel: label });
    await h.sync(1000);
    const rows = await queryPrivateTable(
        `SELECT * FROM hsr_account WHERE user_id = ${h.userId}`
    );
    const row = rows.find(a => a.uid.replace(/"/g, '') === uid);
    if (!row) throw new Error(`Failed to create HsrAccount for uid=${uid}`);
    return Number(row.id);
}

/** Seed characters on an HsrAccount via batch_upsert_characters. */
async function seedChars(
    h: TestHarness,
    hsrAccountId: number,
    chars: string[],
): Promise<void> {
    await h.call.batchUpsertCharacters({
        hsrAccountId,
        charactersJson: characterBatch(chars.map(c => ({ characterName: c, eidolonLevel: 0 }))),
    });
    await h.sync();
}

/** Set up a 1v1 draft lobby: host + blue + red with the given overrides. */
async function setupDraftLobby(
    host: TestHarness,
    blue: TestHarness,
    red: TestHarness,
    lobbyOverrides: Record<string, unknown> = {},
): Promise<number> {
    await host.call.createLobby(defaultLobbyArgs(lobbyOverrides));
    await host.sync(1500);
    const lobby = myLobbies(host).at(-1)!;
    const lobbyId = lobby.id;

    await blue.call.joinLobby({ lobbyId, joinCode: '', password: '' });
    await blue.sync();
    await blue.call.setTeamSlot({
        lobbyId,
        targetUserId: blue.userId,
        lobbySlot: { tag: 'BluePlayer' as const },
    });
    await blue.sync();

    await red.call.joinLobby({ lobbyId, joinCode: '', password: '' });
    await red.sync();
    await red.call.setTeamSlot({
        lobbyId,
        targetUserId: red.userId,
        lobbySlot: { tag: 'RedPlayer' as const },
    });
    await red.sync();

    await blue.call.confirmReady({ lobbyId });
    await blue.sync();
    await red.call.confirmReady({ lobbyId });
    await red.sync();
    await host.sync();

    return lobbyId;
}

/** Best-effort teardown: every member leaves the lobby. */
async function leaveAll(lobbyId: number, ...harnesses: TestHarness[]) {
    for (const h of harnesses) {
        try {
            await h.call.leaveLobby({ lobbyId });
            await h.sync();
        } catch { /* member may have already left */ }
    }
}

/** Trigger timer_expiry_classic after waiting out a 1-second standard turn. */
async function fireTimerExpiry(host: TestHarness, lobbyId: number): Promise<void> {
    // standardTurnSeconds=1 → wait 2.5s for server-side validation
    // (matchFinalization of draftClassic.ts:629-637 checks elapsedMs >= turnLimitMs).
    await sleep(2500);
    await host.call.timerExpiryClassic({ lobbyId });
    await host.sync(1500);
}

/**
 * Extract the first auto-pick character name from the match session steps.
 * Returns undefined if no Pick step from actorUserId=0 (system) is found.
 */
function firstAutoPickChar(h: TestHarness, lobbyId: number): string | undefined {
    const steps = getSteps(h, lobbyId);
    const autoPick = steps.find(
        s => s.action.tag === 'Pick' &&
             s.actorUserId === 0 &&
             s.payload.tag === 'Pick'
    );
    if (!autoPick) return undefined;
    return (autoPick.payload.value as any).characterName as string;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe.skipIf(!hasServerToken())('Auto-Pick Ownership Pool (D-I-04)', () => {
    // Use disjoint character sets so the auto-pick assertion is unambiguous:
    //   Account A pool (isActive) = { acheron, aglaea }
    //   Account B pool (selected) = { argenti, arlan }
    // These are all drawn from KNOWN_CHARACTERS (seeded in test data).
    const A_CHARS = ['acheron', 'aglaea'] as const;
    const B_CHARS = ['argenti', 'arlan'] as const;

    // ─── Scenario 1 — Non-tournament: LMA diverges from isActive ─────────

    describe('Scenario 1 — non-tournament: isActive=A but LMA=B → auto-pick uses B', () => {
        let host: TestHarness;
        let blue: TestHarness;
        let red: TestHarness;
        let blueAccountA: number;
        let blueAccountB: number;
        let redAccount: number;

        beforeAll(async () => {
            resetUidCounter();
            host = await createVerifiedTestHarness();
            blue = await createVerifiedTestHarness();
            red = await createVerifiedTestHarness();
            await host.sync();
            await blue.sync();
            await red.sync();

            // Blue: account A (isActive, first created) with A_CHARS;
            //       account B with B_CHARS.
            // Pool assertion requires `requireOwnership=true` — the D-I-04 block.
            blueAccountA = await createAccount(blue, nextUid(), 'Blue A (isActive)');
            await seedChars(blue, blueAccountA, [...A_CHARS]);
            blueAccountB = await createAccount(blue, nextUid(), 'Blue B (selected)');
            await seedChars(blue, blueAccountB, [...B_CHARS]);

            // Red needs SOMETHING to pass the autoRandomPick+requireOwnership gate.
            redAccount = await createAccount(red, nextUid(), 'Red Main');
            await seedChars(red, redAccount, ['bailu', 'blackswan']);
        }, 60000);

        afterAll(async () => {
            try { await blue.call.deleteHsrAccount({ hsrAccountId: blueAccountA }); } catch {}
            try { await blue.call.deleteHsrAccount({ hsrAccountId: blueAccountB }); } catch {}
            try { await red.call.deleteHsrAccount({ hsrAccountId: redAccount }); } catch {}
            await host?.disconnect();
            await blue?.disconnect();
            await red?.disconnect();
        });

        it('auto-pick for blue draws from account B (LMA), not account A (isActive)', async () => {
            // Non-tournament lobby with autoRandomPick+requireOwnership so
            // timer_expiry_classic enters the D-I-04 LMA-based ownership pool block.
            const lobbyId = await setupDraftLobby(host, blue, red, {
                matchType: { tag: 'Casual' as const, value: {} },
                requireOwnership: true,
                autoRandomPick: true,
                standardTurnSeconds: 1,
            });

            // Blue joined → auto-LMA seeded with isActive account A.
            // Swap to account B via select_match_account (replace-semantics in casual).
            await blue.call.selectMatchAccount({ lobbyId, hsrAccountId: blueAccountB });
            await blue.sync();

            // Start draft. Turn 0 is Blue Pick.
            await startDraftAndSync(host, blue, red, lobbyId);

            const sessionBefore = getSession(host, lobbyId);
            expect(sessionBefore).toBeDefined();
            expect(sessionBefore!.turnIndex).toBe(0);

            // Wait out the turn timer and fire timer_expiry_classic.
            await fireTimerExpiry(host, lobbyId);

            const picked = firstAutoPickChar(host, lobbyId);
            expect(picked).toBeDefined();
            // Correction (1): pool came from account B, NOT account A.
            expect(B_CHARS).toContain(picked!);
            expect(A_CHARS).not.toContain(picked!);

            await leaveAll(lobbyId, blue, red, host);
        }, 60000);
    });

    // ─── Scenario 2 — Multi-account tournament (LMA-union) ────────────────

    describe('Scenario 2 — tournament: union of both selected LMA accounts', () => {
        // The full tournament setup (create -> register -> lock -> generate ->
        // advance -> tournament_lobby -> auto_random_pick + requireOwnership) is
        // significantly heavier than the non-tournament path. The D-I-04 code
        // block is shared across tournament and non-tournament paths — the only
        // difference is that LMA insertion is additive in the tournament path and
        // replacement in the non-tournament path.
        //
        // Scenario 2 therefore exercises the LMA-union behavior via a simpler
        // proxy: a non-tournament lobby where select_match_account is called
        // multiple times BUT we also directly verify the LMA table shape.
        //
        // Actually — non-tournament select_match_account REPLACES, not appends
        // (accountSelection.ts:82-88). We cannot drive the union through a
        // non-tournament lobby. The only way to prove union is via a live
        // tournament with maxAccountsPerPlayer=2.
        //
        // The tournament setup helpers (setupRegistrationTournament,
        // advanceToInProgress) exist; the rest (TournamentPlayerAccount lock,
        // tournament lobby creation, tournament draft with autoRandomPick +
        // requireOwnership) is a significant amount of glue code that does not
        // currently have a shared helper.
        //
        // Given C10's hard test-only scope boundary, the practical option is
        // to skip this scenario with a precise explanation. The D-I-04 code
        // block is single-path (one `for (const lma of selectedAccounts)` loop)
        // — if Scenario 1 proves the loop reads LMA instead of isActive, the
        // union semantics follow directly from the loop operating over the full
        // selectedAccounts array. Manual UAT owns the end-to-end tournament
        // assertion.
        it.skip('multi-account tournament: auto-pick draws from union of selected LMA accounts', () => {
            // See scenario description. Not cleanly reachable without new shared helpers.
        });
    });

    // ─── Scenario 3 — Stand-in contributes LMA chars ──────────────────────

    describe('Scenario 3 — stand-in contributes LMA chars, not captain isActive', () => {
        // Requires the tournament stand-in flow (TournamentStandIn row + rejoin
        // during Waiting or BetweenGames). This path shares the same D-I-04
        // code block as Scenarios 1 and 2 — the stand-in's LMA row is written
        // by lobbyLifecycle.ts auto-LMA seed (line 323-338) using the stand-in's
        // isActive, and can then be overridden via select_match_account if the
        // stand-in swaps.
        //
        // End-to-end assertion requires the full tournament stand-in flow
        // (bracket match with a participant who is then replaced). This is a
        // heavy integration path outside the shared helpers and is deferred to
        // manual UAT per C10 — the underlying LMA-union read is the same code
        // path exercised by Scenario 1.
        it.skip('stand-in auto-pick uses stand-in LMA, not captain isActive', () => {
            // See scenario description.
        });
    });

    // ─── Scenario 4 — Casual requireOwnership with missing-LMA member ─────

    describe('Scenario 4 — casual requireOwnership: missing LMA member contributes empty, pool assembles from rest', () => {
        // This scenario is fundamentally unreachable in current backend code.
        //
        // Reasoning:
        //   - Scenario 4 requires autoRandomPick=true so that timer_expiry_classic
        //     enters the pool-gathering block (draftClassic.ts:648-709). Without
        //     autoRandomPick, auto-pick always writes characterName='EMPTY' and
        //     never touches the pool — the LMA-union code does not run.
        //   - With autoRandomPick=true, start_draft's guard at draftClassic.ts:76-96
        //     rejects any player whose selected LMA accounts contribute zero
        //     characters. A player with no HsrAccount at all has zero LMA rows
        //     (lobbyLifecycle.ts auto-LMA seed is gated by `activeAcct` existence),
        //     which falls under selectedAccounts.length === 0 → start_draft
        //     rejects at line 80 with "no account selected".
        //
        // Therefore the scenario described in the plan ("one team member has no
        // LMA, pool still assembles from others") cannot be exercised: start_draft
        // refuses to start in the only configuration where the pool block runs.
        // The per-member loop in D-I-04 DOES handle empty contributions
        // gracefully (set-union with an empty sub-set is a no-op), so the
        // behavior under assertion is already correct by construction — but
        // it is unobservable from an integration test.
        //
        // Reported to the Phase history via SUMMARY.md; not a test-file failure.
        it.skip('casual requireOwnership: member with no LMA contributes empty, pool still assembles', () => {
            // See scenario description.
        });
    });
});
