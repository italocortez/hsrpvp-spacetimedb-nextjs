/**
 * Integration tests for record_game_scores and confirm_match_scores.
 *
 * Covers:
 * - record_game_scores: captain own-side, captain cross-side rejection,
 *   spectator referee full control, outsider rejection, invalid winnerTeamSide,
 *   upsert preserves other side's data
 * - confirm_match_scores: captain confirms own side, non-participant rejected,
 *   spectator referee confirms both sides (isolated lobby)
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
        matchType: { tag: 'Ranked' as const, value: {} },
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

/** Advance lobby to Scoring: Drafting → Equipping → Scoring */
async function advanceToScoring(host: TestHarness, blue: TestHarness, red: TestHarness, lobbyId: number) {
    // Equipping stage — confirm lineups and advance
    await blue.call.confirmLineup({ lobbyId });
    await blue.sync();
    await red.call.confirmLineup({ lobbyId });
    await red.sync();
    await host.call.advanceStage({ lobbyId });
    await host.sync(1500);
    await blue.sync(1500);
    await red.sync(1500);
}

function getMatchResult(h: TestHarness, lobbyId: number) {
    return [...h.conn.db.MatchResultRecord.iter()].find(mr => mr.lobbyId === lobbyId);
}

function getMatchGames(h: TestHarness, matchResultId: number) {
    return [...h.conn.db.MatchResultGame.iter()].filter(g => g.matchResultId === matchResultId);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe.skipIf(!hasServerToken())('Score Entry + Confirmation', () => {
    let host: TestHarness;
    let blue: TestHarness;
    let red: TestHarness;
    let outsider: TestHarness;
    let lobbyId: number;
    let matchResultId: number;

    beforeAll(async () => {
        host = await createVerifiedTestHarness();
        blue = await createVerifiedTestHarness();
        red = await createVerifiedTestHarness();
        outsider = await createVerifiedTestHarness();
        await host.sync();
        await blue.sync();
        await red.sync();
        await outsider.sync();

        // Ensure HSR accounts for Ranked lobby (D-08 LMA gate)
        await ensureHsrAccount(host);
        await ensureHsrAccount(blue);
        await ensureHsrAccount(red);

        // Ranked lobby → draft → Equipping → Scoring
        lobbyId = await setupDraftLobby(host, blue, red);
        await host.call.startDraft({ lobbyId });
        await host.sync(1500);
        await blue.sync(1500);
        await red.sync(1500);
        await completeDraft(blue, red, lobbyId);
        await host.sync(1500);
        await advanceToScoring(host, blue, red, lobbyId);

        const mr = getMatchResult(host, lobbyId);
        expect(mr).toBeDefined();
        matchResultId = mr!.id;
    }, 120000);

    afterAll(async () => {
        for (const h of [blue, red, host]) {
            try { await h?.call.leaveLobby({ lobbyId }); await h?.sync(); } catch {}
        }
        await host?.disconnect();
        await blue?.disconnect();
        await red?.disconnect();
        await outsider?.disconnect();
    });

    // ─── record_game_scores ──────────────────────────────────────────

    describe('record_game_scores', () => {
        it('blue captain records Blue-side MoC scores', async () => {
            await blue.call.recordGameScores({
                matchResultId,
                gameNumber: 1,
                winnerTeamSide: 'Blue',
                teamBlueCyclesUsed: 8,
            });
            await blue.sync(1000);
            await host.sync(1000);

            const games = getMatchGames(host, matchResultId);
            const game1 = games.find(g => g.gameNumber === 1);
            expect(game1).toBeDefined();
            expect(game1!.winnerTeamSide.tag).toBe('Blue');
            expect(game1!.teamBlueCyclesUsed).toBe(8);
            expect(game1!.gameMode.tag).toBe('MemoryOfChaos');
        }, 15000);

        it('blue captain rejected from providing Red-side fields', async () => {
            const err = await expectReducerError(
                blue.call.recordGameScores({
                    matchResultId,
                    gameNumber: 2,
                    winnerTeamSide: 'Blue',
                    teamBlueCyclesUsed: 7,
                    teamRedCyclesUsed: 10,
                })
            );
            expect(err).toContain('Captains can only enter scores for their own side.');
        });

        it('red captain records Red-side scores', async () => {
            await red.call.recordGameScores({
                matchResultId,
                gameNumber: 1,
                winnerTeamSide: 'Blue',
                teamRedCyclesUsed: 12,
            });
            await red.sync(1000);
            await host.sync(1000);

            const games = getMatchGames(host, matchResultId);
            const game1 = games.find(g => g.gameNumber === 1);
            expect(game1).toBeDefined();
            // Blue-side data preserved from prior entry
            expect(game1!.teamBlueCyclesUsed).toBe(8);
            // Red-side data newly recorded
            expect(game1!.teamRedCyclesUsed).toBe(12);
        }, 15000);

        it('spectator referee records both sides at once', async () => {
            await host.call.recordGameScores({
                matchResultId,
                gameNumber: 2,
                winnerTeamSide: 'Red',
                teamBlueCyclesUsed: 9,
                teamRedCyclesUsed: 6,
                teamBlueScreenshotUrl: 'https://i.imgur.com/blue2.png',
                teamRedScreenshotUrl: 'https://i.imgur.com/red2.png',
            });
            await host.sync(1000);

            const games = getMatchGames(host, matchResultId);
            const game2 = games.find(g => g.gameNumber === 2);
            expect(game2).toBeDefined();
            expect(game2!.winnerTeamSide.tag).toBe('Red');
            expect(game2!.teamBlueCyclesUsed).toBe(9);
            expect(game2!.teamRedCyclesUsed).toBe(6);
            expect(game2!.teamBlueScreenshotUrl).toBe('https://i.imgur.com/blue2.png');
            expect(game2!.teamRedScreenshotUrl).toBe('https://i.imgur.com/red2.png');
        }, 15000);

        it('outsider rejected', async () => {
            const err = await expectReducerError(
                outsider.call.recordGameScores({
                    matchResultId,
                    gameNumber: 3,
                    winnerTeamSide: 'Blue',
                    teamBlueCyclesUsed: 5,
                })
            );
            expect(err).toContain('You are not a participant or authorized referee of this match.');
        });

        it('invalid winnerTeamSide rejected', async () => {
            const err = await expectReducerError(
                blue.call.recordGameScores({
                    matchResultId,
                    gameNumber: 3,
                    winnerTeamSide: 'Green',
                    teamBlueCyclesUsed: 5,
                })
            );
            expect(err).toContain('winnerTeamSide must be "Blue" or "Red".');
        });

        it('upsert preserves other sides data', async () => {
            // Blue captain re-records game 1 Blue-side with updated cycles
            await blue.call.recordGameScores({
                matchResultId,
                gameNumber: 1,
                winnerTeamSide: 'Blue',
                teamBlueCyclesUsed: 7,
                teamBlueScreenshotUrl: 'https://i.imgur.com/blue1.png',
            });
            await blue.sync(1000);
            await host.sync(1000);

            const games = getMatchGames(host, matchResultId);
            const game1 = games.find(g => g.gameNumber === 1);
            expect(game1).toBeDefined();
            // Blue-side updated
            expect(game1!.teamBlueCyclesUsed).toBe(7);
            expect(game1!.teamBlueScreenshotUrl).toBe('https://i.imgur.com/blue1.png');
            // Red-side preserved from prior red captain entry
            expect(game1!.teamRedCyclesUsed).toBe(12);
        }, 15000);
    });

    // ─── confirm_match_scores (captain path) ─────────────────────────

    describe('confirm_match_scores — captain path', () => {
        it('non-participant rejected', async () => {
            const err = await expectReducerError(
                outsider.call.confirmMatchScores({ matchResultId })
            );
            expect(err).toContain('You are not a participant or referee of this match.');
        });

        it('blue captain confirms → blueConfirmed=true', async () => {
            const mrBefore = getMatchResult(host, lobbyId);
            expect(mrBefore!.blueConfirmed).toBe(false);

            await blue.call.confirmMatchScores({ matchResultId });
            await blue.sync(1000);
            await host.sync(1000);

            const mrAfter = getMatchResult(host, lobbyId);
            expect(mrAfter!.blueConfirmed).toBe(true);
            expect(mrAfter!.redConfirmed).toBe(false);
        }, 15000);

        it('red captain confirms → redConfirmed=true', async () => {
            await red.call.confirmMatchScores({ matchResultId });
            await red.sync(1000);
            await host.sync(1000);

            const mrAfter = getMatchResult(host, lobbyId);
            expect(mrAfter!.blueConfirmed).toBe(true);
            expect(mrAfter!.redConfirmed).toBe(true);
        }, 15000);
    });

    // ─── confirm_match_scores (spectator referee path) ───────────────

    describe('confirm_match_scores — spectator referee full control (isolated)', () => {
        let refHost: TestHarness;
        let refBlue: TestHarness;
        let refRed: TestHarness;
        let refLobbyId: number;
        let refMatchResultId: number;

        beforeAll(async () => {
            refHost = await createVerifiedTestHarness();
            refBlue = await createVerifiedTestHarness();
            refRed = await createVerifiedTestHarness();
            await refHost.sync();
            await refBlue.sync();
            await refRed.sync();

            // Ensure HSR accounts for Ranked lobby (D-08 LMA gate)
            await ensureHsrAccount(refHost);
            await ensureHsrAccount(refBlue);
            await ensureHsrAccount(refRed);

            refLobbyId = await setupDraftLobby(refHost, refBlue, refRed);
            await refHost.call.startDraft({ lobbyId: refLobbyId });
            await refHost.sync(1500);
            await refBlue.sync(1500);
            await refRed.sync(1500);
            await completeDraft(refBlue, refRed, refLobbyId);
            await refHost.sync(1500);
            await advanceToScoring(refHost, refBlue, refRed, refLobbyId);

            const mr = getMatchResult(refHost, refLobbyId);
            refMatchResultId = mr!.id;

            // Record scores so there's something to confirm
            await refHost.call.recordGameScores({
                matchResultId: refMatchResultId,
                gameNumber: 1,
                winnerTeamSide: 'Blue',
                teamBlueCyclesUsed: 5,
                teamRedCyclesUsed: 10,
            });
            await refHost.sync(1000);
        }, 120000);

        afterAll(async () => {
            for (const h of [refBlue, refRed, refHost]) {
                try { await h?.call.leaveLobby({ lobbyId: refLobbyId }); await h?.sync(); } catch {}
            }
            await refHost?.disconnect();
            await refBlue?.disconnect();
            await refRed?.disconnect();
        });

        it('spectator referee confirms both sides at once', async () => {
            const mrBefore = getMatchResult(refHost, refLobbyId);
            expect(mrBefore!.blueConfirmed).toBe(false);
            expect(mrBefore!.redConfirmed).toBe(false);

            await refHost.call.confirmMatchScores({ matchResultId: refMatchResultId });
            await refHost.sync(1000);

            const mrAfter = getMatchResult(refHost, refLobbyId);
            expect(mrAfter!.blueConfirmed).toBe(true);
            expect(mrAfter!.redConfirmed).toBe(true);
        }, 15000);
    });

    // ─── Non-captain score recording guard (teamSize=2) ──────────────

    describe('non-captain participant rejected from recording scores (isolated)', () => {
        let ncHost: TestHarness;
        let ncBlue1: TestHarness;  // captain (first to join)
        let ncBlue2: TestHarness;  // non-captain
        let ncRed: TestHarness;
        let ncLobbyId: number;
        let ncMatchResultId: number;

        beforeAll(async () => {
            ncHost = await createVerifiedTestHarness();
            ncBlue1 = await createVerifiedTestHarness();
            ncBlue2 = await createVerifiedTestHarness();
            ncRed = await createVerifiedTestHarness();
            await ncHost.sync();
            await ncBlue1.sync();
            await ncBlue2.sync();
            await ncRed.sync();

            // teamSize=2 Casual lobby (Casual avoids D-42 mirror-pick restriction)
            await ncHost.call.createLobby(defaultLobbyArgs({
                matchType: { tag: 'Casual' as const, value: {} },
                teamSize: 2,
            }));
            await ncHost.sync(1500);
            const lobbies = [...ncHost.conn.db.Lobby.iter()].filter(l => l.hostUserId === ncHost.userId);
            ncLobbyId = lobbies[lobbies.length - 1].id;

            // Blue1 joins first → will be auto-captain (D-30)
            await ncBlue1.call.joinLobby({ lobbyId: ncLobbyId, joinCode: '', password: '' });
            await ncBlue1.sync();
            await ncBlue1.call.setTeamSlot({ lobbyId: ncLobbyId, targetUserId: ncBlue1.userId, lobbySlot: { tag: 'BluePlayer' as const } });
            await ncBlue1.sync();

            // Blue2 joins second → non-captain
            await ncBlue2.call.joinLobby({ lobbyId: ncLobbyId, joinCode: '', password: '' });
            await ncBlue2.sync();
            await ncBlue2.call.setTeamSlot({ lobbyId: ncLobbyId, targetUserId: ncBlue2.userId, lobbySlot: { tag: 'BluePlayer' as const } });
            await ncBlue2.sync();

            // Red joins
            await ncRed.call.joinLobby({ lobbyId: ncLobbyId, joinCode: '', password: '' });
            await ncRed.sync();
            await ncRed.call.setTeamSlot({ lobbyId: ncLobbyId, targetUserId: ncRed.userId, lobbySlot: { tag: 'RedPlayer' as const } });
            await ncRed.sync();

            // All non-coach players confirm ready
            await ncBlue1.call.confirmReady({ lobbyId: ncLobbyId });
            await ncBlue1.sync();
            await ncBlue2.call.confirmReady({ lobbyId: ncLobbyId });
            await ncBlue2.sync();
            await ncRed.call.confirmReady({ lobbyId: ncLobbyId });
            await ncRed.sync();
            await ncHost.sync();

            // Start draft — D-30 auto-assigns captain to first blue player in btree order
            await ncHost.call.startDraft({ lobbyId: ncLobbyId });
            await ncHost.sync(1500);
            await ncBlue1.sync(1500);
            await ncBlue2.sync(1500);
            await ncRed.sync(1500);

            // Detect actual captain (btree order may differ from join order)
            const participants = [...ncHost.conn.db.MatchResultParticipant.iter()]
                .filter(p => [...ncHost.conn.db.MatchResultRecord.iter()]
                    .some(mr => mr.lobbyId === ncLobbyId && mr.id === p.matchResultId));
            const blueCaptain = participants.find(
                p => p.teamSide.tag === 'Blue' && p.isCaptain
            );
            const blueCaptainHarness = blueCaptain?.userId === ncBlue1.userId ? ncBlue1 : ncBlue2;

            // Complete draft: actual captain picks for blue team
            await completeDraft(blueCaptainHarness, ncRed, ncLobbyId);
            await ncHost.sync(1500);

            // Advance to Scoring (captain confirms lineup, not non-captain)
            await blueCaptainHarness.call.confirmLineup({ lobbyId: ncLobbyId });
            await blueCaptainHarness.sync();
            await ncRed.call.confirmLineup({ lobbyId: ncLobbyId });
            await ncRed.sync();
            await ncHost.call.advanceStage({ lobbyId: ncLobbyId });
            await ncHost.sync(1500);
            await blueCaptainHarness.sync(1500);
            await ncRed.sync(1500);

            const mr = getMatchResult(ncHost, ncLobbyId);
            ncMatchResultId = mr!.id;
        }, 120000);

        afterAll(async () => {
            for (const h of [ncBlue1, ncBlue2, ncRed, ncHost]) {
                try { await h?.call.leaveLobby({ lobbyId: ncLobbyId }); await h?.sync(); } catch {}
            }
            await ncHost?.disconnect();
            await ncBlue1?.disconnect();
            await ncBlue2?.disconnect();
            await ncRed?.disconnect();
        });

        it('exactly one blue participant is captain, the other is not', () => {
            const participants = [...ncHost.conn.db.MatchResultParticipant.iter()]
                .filter(p => p.matchResultId === ncMatchResultId && p.teamSide.tag === 'Blue');
            expect(participants.length).toBe(2);
            const captains = participants.filter(p => p.isCaptain);
            expect(captains.length).toBe(1);
        });

        it('non-captain rejected from recording scores', async () => {
            // Identify the non-captain blue participant
            const participants = [...ncHost.conn.db.MatchResultParticipant.iter()]
                .filter(p => p.matchResultId === ncMatchResultId && p.teamSide.tag === 'Blue');
            const nonCaptain = participants.find(p => !p.isCaptain)!;
            const nonCaptainH = nonCaptain.userId === ncBlue1.userId ? ncBlue1 : ncBlue2;

            const err = await expectReducerError(
                nonCaptainH.call.recordGameScores({
                    matchResultId: ncMatchResultId,
                    gameNumber: 1,
                    winnerTeamSide: 'Blue',
                    teamBlueCyclesUsed: 5,
                })
            );
            expect(err).toContain('Only the team captain can record game scores.');
        });

        it('non-captain rejected from confirming scores', async () => {
            // Captain records scores first so there's something to confirm
            const participants = [...ncHost.conn.db.MatchResultParticipant.iter()]
                .filter(p => p.matchResultId === ncMatchResultId && p.teamSide.tag === 'Blue');
            const captain = participants.find(p => p.isCaptain)!;
            const captainH = captain.userId === ncBlue1.userId ? ncBlue1 : ncBlue2;
            const nonCaptain = participants.find(p => !p.isCaptain)!;
            const nonCaptainH = nonCaptain.userId === ncBlue1.userId ? ncBlue1 : ncBlue2;

            await captainH.call.recordGameScores({
                matchResultId: ncMatchResultId,
                gameNumber: 1,
                winnerTeamSide: 'Blue',
                teamBlueCyclesUsed: 5,
            });
            await captainH.sync(1000);

            const err = await expectReducerError(
                nonCaptainH.call.confirmMatchScores({ matchResultId: ncMatchResultId })
            );
            expect(err).toContain('Only the team captain can confirm match scores.');
        }, 15000);
    });
});
