/**
 * Integration tests for the match result lifecycle.
 *
 * Covers:
 * - submit_match_result: confirmation required, Casual auto-validates + auto-finalizes,
 *   Ranked → Submitted, lobby → AwaitingResult
 * - dispute_match_result: status gate, single dispute, reason validation
 * - override_match_result: admin validates, Ranked screenshot gate
 * - finalize_match_result: history archive, ephemeral cleanup, lobby cascade-delete
 * - Draw outcome: winnerId=0, MatchSessionHistory.outcome = Draw
 *
 * Contract: docs/match-results/contract.md
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    createVerifiedTestHarness,
    hasServerToken,
    expectReducerError,
    queryPrivateTable,
    type TestHarness,
} from '../../shared/connection';

// ─── Helpers ────────────────────────────────────────────────────────────────

function defaultLobbyArgs(overrides: Record<string, unknown> = {}) {
    return {
        joinCode: '', presetId: 0, teamSize: 1,
        draftMode: { tag: 'Classic' as const, value: {} },
        banMode: { tag: 'None' as const, value: {} },
        gameMode: { tag: 'MemoryOfChaos' as const, value: {} },
        matchType: { tag: 'Casual' as const, value: {} },
        isPublic: true, password: '',
        standardTurnSeconds: 60, reserveBankSeconds: 120,
        characterBudget: 100, lightconeBudget: 50,
        minimumBidRaise: 0.5, rosterDiffAdvantage: 0,
        rosterThreshold: 0, underThresholdAdvantage: 0,
        aboveThresholdPenalty: 0, deathPenalty: 0,
        isAnonymousPlayers: false, isAnonymousSpectators: false,
        rosterVisibility: { tag: 'OpenRoster' as const, value: {} },
        requireOwnership: false, costSetId: 0,
        disconnectPolicy: { tag: 'Deferred' as const, value: {} },
        disconnectForfeitSeconds: 0,
        allowMirrorPicks: true, autoRandomPick: false,
        refereeCanUndo: true, refereeCanPause: true,
        refereeCanSetCaptain: true, refereeCanKick: true,
        allowPlayerPause: true,
        teamBlueAlias: 'Blue', teamRedAlias: 'Red',
        bestOf: 1, refereeControlsShelving: false,
        ...overrides,
    };
}

/** Ensure a test player has an HSR account (needed for D-08 LMA gate on Ranked/MMR lobbies) */
async function ensureHsrAccount(h: TestHarness): Promise<void> {
    const rows = await queryPrivateTable(
        `SELECT * FROM hsr_account WHERE user_id = ${h.userId}`
    );
    if (rows.length > 0) return; // already has an account
    const uid = `8${String(h.userId).padStart(7, '0')}1`;
    await h.call.createHsrAccount({ uid, displayLabel: `Test ${h.userId}` });
    await h.sync(1500);
}

async function setupDraftLobby(
    host: TestHarness, blue: TestHarness, red: TestHarness,
    overrides: Record<string, unknown> = {},
) {
    await host.call.createLobby(defaultLobbyArgs(overrides));
    await host.sync(1500);
    const lobbies = [...host.conn.db.Lobby.iter()].filter(l => l.hostUserId === host.userId);
    const lobby = lobbies[lobbies.length - 1];

    await blue.call.joinLobby({ lobbyId: lobby.id, joinCode: '', password: '' });
    await blue.sync();
    await blue.call.setTeamSlot({ lobbyId: lobby.id, targetUserId: blue.userId, lobbySlot: { tag: 'BluePlayer' as const } });
    await blue.sync();

    await red.call.joinLobby({ lobbyId: lobby.id, joinCode: '', password: '' });
    await red.sync();
    await red.call.setTeamSlot({ lobbyId: lobby.id, targetUserId: red.userId, lobbySlot: { tag: 'RedPlayer' as const } });
    await red.sync();

    await blue.call.confirmReady({ lobbyId: lobby.id });
    await blue.sync();
    await red.call.confirmReady({ lobbyId: lobby.id });
    await red.sync();
    await host.sync();

    return lobby.id;
}

async function completeDraft(blue: TestHarness, red: TestHarness, lobbyId: number) {
    const order = [
        'blue', 'red',  'red',  'blue',
        'red',  'blue', 'blue', 'red',
        'red',  'blue', 'blue', 'red',
        'red',  'blue', 'blue', 'red',
    ] as const;
    // 16 unique characters — required for Ranked (D-42: allowMirrorPicks forced false)
    const blueChars = ['acheron', 'aglaea', 'anaxa', 'archer', 'argenti', 'arlan', 'asta', 'aventurine'];
    const redChars = ['bailu', 'blackswan', 'blade', 'boothill', 'bronya', 'castorice', 'cerydra', 'cipher'];
    let blueIdx = 0;
    let redIdx = 0;
    for (const team of order) {
        const h = team === 'blue' ? blue : red;
        const charName = team === 'blue' ? blueChars[blueIdx++] : redChars[redIdx++];
        await h.call.pickCharacter({ lobbyId, characterName: charName, eidolon: 0 });
        await h.sync(300);
    }
    await blue.sync(1500);
    await red.sync(1500);
}

async function advanceToScoring(host: TestHarness, blue: TestHarness, red: TestHarness, lobbyId: number) {
    await blue.call.confirmLineup({ lobbyId });
    await blue.sync();
    await red.call.confirmLineup({ lobbyId });
    await red.sync();
    await host.call.advanceStage({ lobbyId });
    await host.sync(1500);
    await blue.sync(1500);
    await red.sync(1500);
}

/** Full setup: create lobby → draft → Scoring → record scores → confirm both sides */
async function setupScoredMatch(
    host: TestHarness, blue: TestHarness, red: TestHarness,
    overrides: Record<string, unknown> = {},
    opts: { screenshots?: boolean } = {},
) {
    const lobbyId = await setupDraftLobby(host, blue, red, overrides);
    await host.call.startDraft({ lobbyId });
    await host.sync(1500);
    await blue.sync(1500);
    await red.sync(1500);
    await completeDraft(blue, red, lobbyId);
    await host.sync(1500);
    await advanceToScoring(host, blue, red, lobbyId);

    const mr = [...host.conn.db.MatchResultRecord.iter()].find(r => r.lobbyId === lobbyId)!;

    // Referee records scores (both sides)
    await host.call.recordGameScores({
        matchResultId: mr.id,
        gameNumber: 1,
        winnerTeamSide: 'Blue',
        teamBlueCyclesUsed: 7,
        teamRedCyclesUsed: 10,
        ...(opts.screenshots ? {
            teamBlueScreenshotUrl: 'https://i.imgur.com/blue1.png',
            teamRedScreenshotUrl: 'https://i.imgur.com/red1.png',
        } : {}),
    });
    await host.sync(1000);

    // Confirm both sides
    await blue.call.confirmMatchScores({ matchResultId: mr.id });
    await blue.sync(500);
    await red.call.confirmMatchScores({ matchResultId: mr.id });
    await red.sync(500);
    await host.sync(1000);

    return { lobbyId, matchResultId: mr.id };
}

function getMatchResult(h: TestHarness, lobbyId: number) {
    return [...h.conn.db.MatchResultRecord.iter()].find(mr => mr.lobbyId === lobbyId);
}

function getMatchResultById(h: TestHarness, id: number) {
    return [...h.conn.db.MatchResultRecord.iter()].find(mr => mr.id === id);
}

/** Promote a test user to a role via server connection */
async function promoteToRole(h: TestHarness, roleTag: string) {
    const user = [...h.conn.db.User.iter()].find(u => u.id === h.userId);
    if (!user) throw new Error(`User ${h.userId} not found in cache`);
    const username = user.username;

    const { DbConnection } = await import('@/src/module_bindings');
    const serverToken = process.env.SPACETIMEDB_SERVER_TOKEN || '';
    const uri = process.env.SPACETIMEDB_URI || 'wss://maincloud.spacetimedb.com';
    const db = process.env.SPACETIMEDB_DB || process.env.SPACETIMEDB_DB_NAME || 'hsrpvp-spacetimedb-nextjs-test1';

    await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Server promote timeout')), 10000);
        DbConnection.builder()
            .withUri(uri)
            .withDatabaseName(db)
            .withToken(serverToken)
            .onConnect(async (serverConn) => {
                try {
                    await serverConn.reducers.serverSetRole({ username, roleTag });
                    clearTimeout(timeout);
                    serverConn.disconnect();
                    setTimeout(resolve, 500);
                } catch (err) {
                    clearTimeout(timeout);
                    serverConn.disconnect();
                    reject(err);
                }
            })
            .onConnectError((_ctx: any, err: any) => {
                clearTimeout(timeout);
                reject(new Error(`Server connection failed: ${err}`));
            })
            .onDisconnect(() => {})
            .build();
    });

    await h.sync(1000);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe.skipIf(!hasServerToken())('Match Lifecycle', () => {
    let host: TestHarness;
    let blue: TestHarness;
    let red: TestHarness;
    let admin: TestHarness;
    let outsider: TestHarness;

    beforeAll(async () => {
        host = await createVerifiedTestHarness();
        blue = await createVerifiedTestHarness();
        red = await createVerifiedTestHarness();
        admin = await createVerifiedTestHarness();
        outsider = await createVerifiedTestHarness();
        await host.sync();
        await blue.sync();
        await red.sync();
        await admin.sync();
        await outsider.sync();

        await promoteToRole(admin, 'Admin');
        await admin.sync(1000);

        // Ensure HSR accounts for Ranked lobbies (D-08 LMA gate)
        await ensureHsrAccount(host);
        await ensureHsrAccount(blue);
        await ensureHsrAccount(red);

        // Seed EloConfig if not present (required for Ranked finalization)
        try { await admin.call.adminSeedEloConfig({}); } catch { /* already exists */ }
        await admin.sync(500);
    }, 60000);

    afterAll(async () => {
        await host?.disconnect();
        await blue?.disconnect();
        await red?.disconnect();
        await admin?.disconnect();
        await outsider?.disconnect();
    });

    // ─── Casual Auto-Finalize ────────────────────────────────────────

    describe('Casual Auto-Finalize', () => {
        let lobbyId: number;
        let matchResultId: number;
        let historyCountBefore: number;

        beforeAll(async () => {
            historyCountBefore = [...host.conn.db.MatchSessionHistory.iter()].length;

            const result = await setupScoredMatch(host, blue, red, {
                matchType: { tag: 'Casual' as const, value: {} },
            });
            lobbyId = result.lobbyId;
            matchResultId = result.matchResultId;
        }, 120000);

        it('submit → auto-Validated + auto-finalized', async () => {
            await host.call.submitMatchResult({ matchResultId, winnerId: blue.userId });
            await host.sync(2000);
            await blue.sync(2000);
            await red.sync(2000);

            // Casual auto-validates and auto-finalizes inline
            // MatchResultRecord should be deleted (ephemeral)
            const mr = getMatchResultById(host, matchResultId);
            expect(mr).toBeUndefined();
        }, 20000);

        it('MatchSessionHistory created', () => {
            const historyCount = [...host.conn.db.MatchSessionHistory.iter()].length;
            expect(historyCount).toBeGreaterThan(historyCountBefore);
        });

        it('MatchResultParticipant rows deleted', () => {
            const participants = [...host.conn.db.MatchResultParticipant.iter()]
                .filter(p => p.matchResultId === matchResultId);
            expect(participants.length).toBe(0);
        });

        it('MatchResultGame rows deleted', () => {
            const games = [...host.conn.db.MatchResultGame.iter()]
                .filter(g => g.matchResultId === matchResultId);
            expect(games.length).toBe(0);
        });

        it('lobby cascade-deleted', () => {
            const lobby = [...host.conn.db.Lobby.iter()].find(l => l.id === lobbyId);
            expect(lobby).toBeUndefined();
        });
    });

    // ─── Ranked Submission + Dispute + Override + Finalize ────────────

    describe('Ranked Full Lifecycle', () => {
        let lobbyId: number;
        let matchResultId: number;
        let historyCountBefore: number;

        beforeAll(async () => {
            historyCountBefore = [...host.conn.db.MatchSessionHistory.iter()].length;

            // Ranked lobby with screenshots (required for validation)
            const result = await setupScoredMatch(host, blue, red, {
                matchType: { tag: 'Ranked' as const, value: {} },
            }, { screenshots: true });
            lobbyId = result.lobbyId;
            matchResultId = result.matchResultId;
        }, 120000);

        // ── Pre-submission tests ─────────────────────────────────────

        it('dispute on Pending status rejected', async () => {
            const err = await expectReducerError(
                blue.call.disputeMatchResult({ matchResultId, reason: 'Invalid scores' })
            );
            expect(err).toContain('A match result can only be disputed after it has been submitted.');
        });

        it('submit without authority rejected', async () => {
            const err = await expectReducerError(
                outsider.call.submitMatchResult({ matchResultId, winnerId: blue.userId })
            );
            expect(err).toMatch(/not a member|referee authority|not found/i);
        });

        // ── Submit ───────────────────────────────────────────────────

        it('submit by referee → Submitted', async () => {
            await host.call.submitMatchResult({ matchResultId, winnerId: blue.userId });
            await host.sync(1500);
            await blue.sync(1500);

            const mr = getMatchResultById(host, matchResultId);
            expect(mr).toBeDefined();
            expect(mr!.status.tag).toBe('Submitted');
            expect(mr!.winnerTeamSide?.tag).toBe('Blue');
            expect(mr!.refereeUserId).toBe(host.userId);
        }, 15000);

        it('lobby transitions to AwaitingResult', () => {
            const lobby = [...host.conn.db.Lobby.iter()].find(l => l.id === lobbyId);
            expect(lobby).toBeDefined();
            expect(lobby!.stage.tag).toBe('AwaitingResult');
        });

        it('record scores on non-Pending match rejected', async () => {
            const err = await expectReducerError(
                blue.call.recordGameScores({
                    matchResultId,
                    gameNumber: 2,
                    winnerTeamSide: 'Blue',
                    teamBlueCyclesUsed: 5,
                })
            );
            expect(err).toContain('Scores can only be recorded when the match is in Pending status.');
        });

        // ── Dispute ──────────────────────────────────────────────────

        it('non-participant dispute rejected', async () => {
            const err = await expectReducerError(
                outsider.call.disputeMatchResult({ matchResultId, reason: 'Not fair' })
            );
            expect(err).toContain('You are not a participant of this match.');
        });

        it('empty dispute reason rejected', async () => {
            const err = await expectReducerError(
                red.call.disputeMatchResult({ matchResultId, reason: '' })
            );
            expect(err).toContain('Dispute reason cannot be empty.');
        });

        it('long dispute reason rejected', async () => {
            const err = await expectReducerError(
                red.call.disputeMatchResult({ matchResultId, reason: 'x'.repeat(1001) })
            );
            expect(err).toContain('Dispute reason cannot exceed 1000 characters.');
        });

        it('valid dispute → Disputed', async () => {
            await red.call.disputeMatchResult({ matchResultId, reason: 'Scores were incorrect' });
            await red.sync(1000);
            await host.sync(1000);

            const mr = getMatchResultById(host, matchResultId);
            expect(mr!.status.tag).toBe('Disputed');
            expect(mr!.disputedByUserId).toBe(red.userId);
            expect(mr!.disputeReason).toBe('Scores were incorrect');
        }, 15000);

        it('double dispute rejected', async () => {
            const err = await expectReducerError(
                blue.call.disputeMatchResult({ matchResultId, reason: 'Another dispute' })
            );
            expect(err).toContain('This match result has already been disputed.');
        });

        // ── Override ─────────────────────────────────────────────────

        it('invalid override status tag rejected', async () => {
            const err = await expectReducerError(
                admin.call.overrideMatchResult({
                    matchResultId,
                    newStatusTag: 'Pending',
                    winnerTeamSideTag: 'Blue',
                    reason: 'Test',
                })
            );
            expect(err).toContain('Invalid status override');
        });

        it('admin overrides to Validated', async () => {
            await admin.call.overrideMatchResult({
                matchResultId,
                newStatusTag: 'Validated',
                winnerTeamSideTag: 'Blue',
                reason: 'Reviewed and confirmed',
            });
            await admin.sync(1000);
            await host.sync(1000);

            const mr = getMatchResultById(host, matchResultId);
            expect(mr!.status.tag).toBe('Validated');
            expect(mr!.winnerTeamSide?.tag).toBe('Blue');
            expect(mr!.disputeReason).toBe('Reviewed and confirmed');
        }, 15000);

        // ── Finalize ─────────────────────────────────────────────────

        it('finalize creates history row', async () => {
            await host.call.finalizeMatchResult({ matchResultId });
            await host.sync(2000);
            await blue.sync(2000);
            await red.sync(2000);

            const historyCount = [...host.conn.db.MatchSessionHistory.iter()].length;
            expect(historyCount).toBeGreaterThan(historyCountBefore);
        }, 20000);

        it('finalize deletes ephemeral records', () => {
            const mr = getMatchResultById(host, matchResultId);
            expect(mr).toBeUndefined();

            const participants = [...host.conn.db.MatchResultParticipant.iter()]
                .filter(p => p.matchResultId === matchResultId);
            expect(participants.length).toBe(0);

            const games = [...host.conn.db.MatchResultGame.iter()]
                .filter(g => g.matchResultId === matchResultId);
            expect(games.length).toBe(0);
        });

        it('finalize cascade-deletes lobby', () => {
            const lobby = [...host.conn.db.Lobby.iter()].find(l => l.id === lobbyId);
            expect(lobby).toBeUndefined();
        });
    });

    // ─── Ranked Screenshot Gate ──────────────────────────────────────

    describe('Ranked Screenshot Gate (isolated)', () => {
        let lobbyId: number;
        let matchResultId: number;

        beforeAll(async () => {
            // Ranked lobby WITHOUT screenshots
            const result = await setupScoredMatch(host, blue, red, {
                matchType: { tag: 'Ranked' as const, value: {} },
            }, { screenshots: false });
            lobbyId = result.lobbyId;
            matchResultId = result.matchResultId;

            // Submit to move to Submitted
            await host.call.submitMatchResult({ matchResultId, winnerId: blue.userId });
            await host.sync(1500);
        }, 120000);

        afterAll(async () => {
            // Leave lobby to free users for next describe block.
            // AwaitingResult allows leave — removes LobbyMember rows.
            for (const h of [blue, red, host]) {
                try { await h.call.leaveLobby({ lobbyId }); await h.sync(); } catch {}
            }
            await host.sync(1000);
        });

        it('override to Validated fails without screenshots', async () => {
            const err = await expectReducerError(
                admin.call.overrideMatchResult({
                    matchResultId,
                    newStatusTag: 'Validated',
                    winnerTeamSideTag: 'Blue',
                    reason: 'Attempting validation',
                })
            );
            expect(err).toContain('missing screenshot(s)');
        });

        it('override to Rejected succeeds without screenshots', async () => {
            await admin.call.overrideMatchResult({
                matchResultId,
                newStatusTag: 'Rejected',
                winnerTeamSideTag: '',
                reason: 'No screenshots provided',
            });
            await admin.sync(1000);
            await host.sync(1000);

            const mr = getMatchResultById(host, matchResultId);
            expect(mr!.status.tag).toBe('Rejected');
        }, 15000);
    });

    // ─── Draw Outcome ────────────────────────────────────────────────

    describe('Draw Outcome (Casual)', () => {
        let lobbyId: number;
        let matchResultId: number;
        let historyIdsBefore: Set<number>;

        beforeAll(async () => {
            historyIdsBefore = new Set(
                [...host.conn.db.MatchSessionHistory.iter()].map(h => h.id)
            );

            const result = await setupScoredMatch(host, blue, red, {
                matchType: { tag: 'Casual' as const, value: {} },
            });
            lobbyId = result.lobbyId;
            matchResultId = result.matchResultId;
        }, 120000);

        it('submit with winnerId=0 → auto-finalized', async () => {
            await host.call.submitMatchResult({ matchResultId, winnerId: 0 });
            await host.sync(2000);
            await blue.sync(2000);

            // Casual auto-finalize — MatchResultRecord should be deleted
            const mr = getMatchResultById(host, matchResultId);
            expect(mr).toBeUndefined();
        }, 20000);

        it('MatchSessionHistory.outcome = Draw', () => {
            const newHistories = [...host.conn.db.MatchSessionHistory.iter()]
                .filter(h => !historyIdsBefore.has(h.id));
            expect(newHistories.length).toBe(1);
            expect(newHistories[0].outcome.tag).toBe('Draw');
        });
    });
});
