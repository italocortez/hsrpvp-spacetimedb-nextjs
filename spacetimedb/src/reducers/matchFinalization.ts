import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser, isRoleAtLeast } from '../helpers/ensurePermissions';
import { ensureTournamentAccess } from '../helpers/tournamentHelpers';
import { auditInsert, auditUpdate, SYSTEM_USER_ID } from '../helpers/auditColumns';
import { getKFactor, calculateExpectedScore, calculateRatingChange, calculateTeamEffective, calculateAccountModifier } from '../helpers/eloCalculation';
import type { EloConfigValues } from '../helpers/eloCalculation';
import { incrementPlayerStat, incrementPlayerRelationship } from '../helpers/statsIncrement';
import { rebuildLeaderboard } from '../helpers/leaderboardRebuild';
import { advanceBracketMatch } from '../helpers/bracketHelpers';

// ─── Internal helper: getOrCreateRating ─────────────────────────────────────
// Returns existing MmrRating row for user+mode, or creates a new one at initialRating.

function getOrCreateRating(ctx: any, userId: number, gameMode: any, initialRating: number, actingUserId: number): any {
    const existing = [...ctx.db.MmrRating.by_user_and_mode.filter([userId, gameMode])][0];
    if (existing) return existing;

    // Create new rating row for first-time ranked player
    const newRow = {
        userId,
        gameMode,
        rating: initialRating,
        matchesPlayed: 0,
        globalCompositeRating: undefined,
        seasonId: undefined,
        ...auditInsert(ctx, actingUserId),
    };
    ctx.db.MmrRating.insert(newRow as any);
    return { ...newRow };
}

// ─── Internal helper: processMatchMmr ───────────────────────────────────────
// Pure MMR processing for a single match. Reads EloConfig, calculates rating
// changes for all participants, updates MmrRating + globalCompositeRating,
// writes MmrHistory rows.

function processMatchMmr(
    ctx: any,
    matchResult: any,
    participants: any[],
    gameMode: any,
    matchHistoryId: number,
    actingUserId: number
): void {
    // 1. Read EloConfig
    const config = ctx.db.EloConfigTable.id.find(1);
    if (!config) {
        throw new SenderError('ELO config not initialized. Call admin_seed_elo_config first.');
    }

    // 2. Convert to EloConfigValues interface
    const cv: EloConfigValues = {
        kFactorNew: config.kFactorNew,
        kFactorMid: config.kFactorMid,
        kFactorVet: config.kFactorVet,
        newThreshold: config.newThreshold,
        midThreshold: config.midThreshold,
        initialRating: config.initialRating,
        sizeBonus: config.sizeBonus,
        spreadDivisor: config.spreadDivisor,
        maxAccountBonus: config.maxAccountBonus,
    };

    // 3. Separate participants by team
    const blueParticipants = participants.filter((p: any) => p.teamSide.tag === 'Blue');
    const redParticipants = participants.filter((p: any) => p.teamSide.tag === 'Red');

    // 4. Get or create MmrRating for each participant and collect team ratings
    const blueRatings = blueParticipants.map((p: any) =>
        getOrCreateRating(ctx, p.userId, gameMode, cv.initialRating, actingUserId).rating
    );
    const redRatings = redParticipants.map((p: any) =>
        getOrCreateRating(ctx, p.userId, gameMode, cv.initialRating, actingUserId).rating
    );

    // 5-6. Calculate team effective ratings (D-18)
    let blueEffective = calculateTeamEffective(blueRatings, cv.sizeBonus, cv.spreadDivisor);
    let redEffective = calculateTeamEffective(redRatings, cv.sizeBonus, cv.spreadDivisor);

    // 7. Apply account rating modifier (Fair MMR always in Phase 5 -- D-22 through D-28)
    const blueAccountRatings = blueParticipants.map((p: any) => {
        const activeAccount = [...ctx.db.HsrAccount.user_id.filter(p.userId)].find((a: any) => a.isActive);
        return activeAccount?.accountRating ?? 0;
    });
    const redAccountRatings = redParticipants.map((p: any) => {
        const activeAccount = [...ctx.db.HsrAccount.user_id.filter(p.userId)].find((a: any) => a.isActive);
        return activeAccount?.accountRating ?? 0;
    });

    const blueAvgAccount = blueAccountRatings.length > 0
        ? blueAccountRatings.reduce((a: number, b: number) => a + b, 0) / blueAccountRatings.length
        : 0;
    const redAvgAccount = redAccountRatings.length > 0
        ? redAccountRatings.reduce((a: number, b: number) => a + b, 0) / redAccountRatings.length
        : 0;

    if (blueAvgAccount > redAvgAccount) {
        blueEffective += calculateAccountModifier(blueAvgAccount, redAvgAccount, cv.maxAccountBonus);
    } else if (redAvgAccount > blueAvgAccount) {
        redEffective += calculateAccountModifier(redAvgAccount, blueAvgAccount, cv.maxAccountBonus);
    }

    // 8. Determine actual result
    let blueActualResult: number;
    let redActualResult: number;

    if (matchResult.winnerUserId === undefined) {
        // Draw
        blueActualResult = 0.5;
        redActualResult = 0.5;
    } else {
        const winnerParticipant = participants.find((p: any) => p.userId === matchResult.winnerUserId);
        if (winnerParticipant && winnerParticipant.teamSide.tag === 'Blue') {
            blueActualResult = 1;
            redActualResult = 0;
        } else {
            blueActualResult = 0;
            redActualResult = 1;
        }
    }

    // 9-12. For each participant, calculate and apply rating change
    for (const participant of participants) {
        const playerRating = getOrCreateRating(ctx, participant.userId, gameMode, cv.initialRating, actingUserId);
        const isBlue = participant.teamSide.tag === 'Blue';
        const playerEffective = isBlue ? blueEffective : redEffective;
        const opponentEffective = isBlue ? redEffective : blueEffective;
        const expected = calculateExpectedScore(playerEffective, opponentEffective);
        const k = getKFactor(playerRating.matchesPlayed, cv);
        const actualResult = isBlue ? blueActualResult : redActualResult;
        const delta = calculateRatingChange(k, actualResult, expected);
        const newRating = Math.max(0, playerRating.rating + delta); // Floor at 0

        // 10. Update MmrRating (delete + insert for composite PK)
        const currentRating = [...ctx.db.MmrRating.by_user_and_mode.filter([participant.userId, gameMode])][0];
        if (currentRating) {
            ctx.db.MmrRating.delete(currentRating);
        }
        ctx.db.MmrRating.insert({
            userId: participant.userId,
            gameMode,
            rating: newRating,
            matchesPlayed: (currentRating?.matchesPlayed ?? 0) + 1,
            globalCompositeRating: currentRating?.globalCompositeRating,
            seasonId: currentRating?.seasonId,
            ...(currentRating ? auditUpdate(ctx, currentRating, actingUserId) : auditInsert(ctx, actingUserId)),
        } as any);

        // 11. Update globalCompositeRating for this player (D-17)
        const allRatings = [...ctx.db.MmrRating.user_id.filter(participant.userId)];
        if (allRatings.length > 0) {
            const avgRating = Math.round(allRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / allRatings.length);
            for (const r of allRatings) {
                ctx.db.MmrRating.delete(r);
                ctx.db.MmrRating.insert({
                    ...r,
                    globalCompositeRating: avgRating,
                    ...auditUpdate(ctx, r, actingUserId),
                } as any);
            }
        }

        // 12. Insert MmrHistory row (MMR-04)
        ctx.db.MmrHistory.insert({
            id: 0, // autoInc
            userId: participant.userId,
            gameMode,
            matchHistoryId,
            previousRating: playerRating.rating,
            newRating,
            delta,
            seasonId: currentRating?.seasonId,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }
}

// ─── finalize_match_result ──────────────────────────────────────────────────
// Writes permanent history, increments stats, advances bracket, processes
// inline MMR for standalone Ranked, and deletes ephemeral records.
// Permission: Admin/Mod, match referee, or tournament TO/assistant.

export const finalize_match_result = spacetimedb.reducer(
    {
        matchResultId: t.u32(),
    },
    (ctx, { matchResultId }) => {
        const user = getAuthenticatedUser(ctx);

        // 2. Find MatchResultRecord
        const matchResult = ctx.db.MatchResultRecord.id.find(matchResultId);
        if (!matchResult) {
            throw new SenderError('Match result not found.');
        }

        // 3. Verify status is Validated
        if (matchResult.status.tag !== 'Validated') {
            throw new SenderError('Match result must be Validated before finalization.');
        }

        // 6. Verify caller has authority
        let hasAuthority = false;
        if (isRoleAtLeast(user.role, 'Moderator')) {
            hasAuthority = true;
        }
        if (!hasAuthority && matchResult.refereeUserId === user.id) {
            hasAuthority = true;
        }
        if (!hasAuthority && matchResult.isTournamentControlled && matchResult.tournamentId !== undefined) {
            try {
                ensureTournamentAccess(ctx, matchResult.tournamentId);
                hasAuthority = true;
            } catch (_e) {
                // Not authorized via tournament access
            }
        }
        if (!hasAuthority) {
            throw new SenderError('You do not have authority to finalize this match result.');
        }

        // 7. Read all related data
        const participants = [...ctx.db.MatchResultParticipant.match_result_id.filter(matchResultId)];
        const games = [...ctx.db.MatchResultGame.match_result_id.filter(matchResultId)];
        const lobby = ctx.db.Lobby.id.find(matchResult.lobbyId);

        // 8. Determine match outcome
        let matchOutcome: any;
        if (matchResult.winnerUserId === undefined) {
            matchOutcome = { tag: 'Draw', value: {} };
        } else {
            const winnerP = participants.find((p: any) => p.userId === matchResult.winnerUserId);
            if (winnerP && winnerP.teamSide.tag === 'Blue') {
                matchOutcome = { tag: 'BlueWins', value: {} };
            } else {
                matchOutcome = { tag: 'RedWins', value: {} };
            }
        }

        // 9. Write MatchSessionHistory row
        const historyRow = ctx.db.MatchSessionHistory.insert({
            id: 0, // autoInc
            lobbyCode: lobby ? lobby.joinCode : 'UNKNOWN',
            playedAt: matchResult.createdDate,
            draftMode: lobby ? lobby.draftMode : { tag: 'Classic', value: {} },
            gameMode: lobby ? lobby.gameMode : games[0]?.gameMode ?? { tag: 'MemoryOfChaos', value: {} },
            teamBlueAlias: lobby ? lobby.teamBlueAlias : 'Blue',
            teamRedAlias: lobby ? lobby.teamRedAlias : 'Red',
            snapshotConfig: lobby ? {
                teamSize: lobby.teamSize,
                draftMode: lobby.draftMode,
                banMode: lobby.banMode,
                standardTurnSeconds: lobby.standardTurnSeconds,
                reserveBankSeconds: lobby.reserveBankSeconds,
                auctionBudget: lobby.auctionBudget,
                rosterDiffAdvantage: lobby.rosterDiffAdvantage,
                rosterThreshold: lobby.rosterThreshold,
                underThresholdAdvantage: lobby.underThresholdAdvantage,
                aboveThresholdPenalty: lobby.aboveThresholdPenalty,
                deathPenalty: lobby.deathPenalty,
            } : {
                teamSize: 1,
                draftMode: { tag: 'Classic', value: {} },
                banMode: { tag: 'None', value: {} },
                standardTurnSeconds: 60,
                reserveBankSeconds: 120,
                auctionBudget: undefined,
                rosterDiffAdvantage: 0,
                rosterThreshold: 0,
                underThresholdAdvantage: 0,
                aboveThresholdPenalty: 0,
                deathPenalty: 0,
            },
            outcome: matchOutcome,
            rosterBlue: '[]', // Roster snapshot deferred -- would need MatchSessionStep data
            rosterRed: '[]',
            ...auditInsert(ctx, user.id),
        } as any);

        // 10. Standalone Ranked: process MMR inline
        if (matchResult.matchType.tag === 'Ranked' && !matchResult.isTournamentControlled) {
            processMatchMmr(ctx, matchResult, participants, lobby?.gameMode ?? games[0]?.gameMode, historyRow.id, user.id);
            // Stamp mmrProcessedAt
            const freshResult = ctx.db.MatchResultRecord.id.find(matchResultId)!;
            ctx.db.MatchResultRecord.id.update({
                ...freshResult,
                mmrProcessedAt: ctx.timestamp,
                ...auditUpdate(ctx, freshResult, user.id),
            } as any);
            // Rebuild leaderboard after MMR processing
            rebuildLeaderboard(ctx, user.id);
        }

        // 11. Tournament batch path: back-fill MmrHistory sentinel matchHistoryId
        if (matchResult.isTournamentControlled && matchResult.mmrProcessedAt !== undefined) {
            const participantUserIds = new Set(participants.map((p: any) => p.userId));
            for (const uid of participantUserIds) {
                const mmrRows = [...ctx.db.MmrHistory.user_id.filter(uid)]
                    .filter((h: any) => h.matchHistoryId === 0);
                // Only update the most recent one per user (latest ID) for this match
                if (mmrRows.length > 0) {
                    const latest = mmrRows.sort((a: any, b: any) => b.id - a.id)[0];
                    ctx.db.MmrHistory.id.update({
                        ...latest,
                        matchHistoryId: historyRow.id,
                        ...auditUpdate(ctx, latest, user.id),
                    } as any);
                }
            }
        }

        // 12. Write MatchParticipantHistory per participant
        for (const p of participants) {
            ctx.db.MatchParticipantHistory.insert({
                userId: p.userId,
                matchHistoryId: historyRow.id,
                teamSide: p.teamSide,
                ...auditInsert(ctx, user.id),
            } as any);
        }

        // 13. Increment PlayerStat per participant
        const gameMode = lobby?.gameMode ?? games[0]?.gameMode ?? { tag: 'MemoryOfChaos', value: {} };
        const draftMode = lobby?.draftMode ?? { tag: 'Classic', value: {} };
        for (const p of participants) {
            let participantWon = false;
            if (matchResult.winnerUserId !== undefined) {
                const winnerParticipant = participants.find((wp: any) => wp.userId === matchResult.winnerUserId);
                participantWon = winnerParticipant ? winnerParticipant.teamSide.tag === p.teamSide.tag : false;
            }
            const isDraw = matchResult.winnerUserId === undefined;
            incrementPlayerStat(ctx, p.userId, gameMode, draftMode, participantWon, isDraw, user.id);
        }

        // 14. Increment PlayerRelationship per participant pair
        for (let i = 0; i < participants.length; i++) {
            for (let j = i + 1; j < participants.length; j++) {
                const a = participants[i];
                const b = participants[j];
                const isAlly = a.teamSide.tag === b.teamSide.tag;
                let aWon = false;
                let bWon = false;
                if (matchResult.winnerUserId !== undefined) {
                    const winnerP = participants.find((wp: any) => wp.userId === matchResult.winnerUserId);
                    aWon = winnerP ? winnerP.teamSide.tag === a.teamSide.tag : false;
                    bWon = winnerP ? winnerP.teamSide.tag === b.teamSide.tag : false;
                }
                // Bidirectional: A -> B and B -> A
                incrementPlayerRelationship(ctx, a.userId, b.userId, gameMode, draftMode, isAlly, aWon, user.id);
                incrementPlayerRelationship(ctx, b.userId, a.userId, gameMode, draftMode, isAlly, bWon, user.id);
            }
        }

        // 15. Bracket advancement (MTCH-08)
        if (matchResult.isTournamentControlled && matchResult.bracketMatchId !== undefined && matchResult.winnerUserId !== undefined) {
            const bracketMatch = ctx.db.BracketMatch.id.find(matchResult.bracketMatchId);
            if (bracketMatch && bracketMatch.winnerTeamId === undefined) {
                // Map winnerUserId to teamId via TournamentParticipant
                const winnerParticipant = [...ctx.db.TournamentParticipant.by_tournament_and_user
                    .filter([matchResult.tournamentId!, matchResult.winnerUserId])][0];
                if (winnerParticipant && winnerParticipant.teamGroupId) {
                    advanceBracketMatch(ctx, matchResult.bracketMatchId, winnerParticipant.teamGroupId, user.id);
                }
            }
            // If winnerTeamId is already set, bracket was already advanced by submit_and_advance_bracket -- skip
        }

        // 16. Delete ephemeral records (children first)
        for (const g of games) { ctx.db.MatchResultGame.delete(g); }
        for (const p of participants) { ctx.db.MatchResultParticipant.delete(p); }
        const finalResult = ctx.db.MatchResultRecord.id.find(matchResultId);
        if (finalResult) { ctx.db.MatchResultRecord.delete(finalResult); }

        // 17. Log
        console.log(`[MATCH] Match result #${matchResultId} finalized by user #${user.id}. History ID: ${historyRow.id}`);
    }
);

// ─── process_tournament_mmr ─────────────────────────────────────────────────
// Batch-processes MMR for all Validated, unprocessed matches in a completed
// tournament. Uses matchHistoryId=0 as sentinel (back-filled by finalize_match_result).
// Permission: TO/assistant/Moderator/Admin.

export const process_tournament_mmr = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
    },
    (ctx, { tournamentId }) => {
        // 1. Verify tournament access
        const { user, tournament } = ensureTournamentAccess(ctx, tournamentId);

        // 2. Verify tournament is Completed or Cancelled
        if (tournament.stage.tag !== 'Completed' && tournament.stage.tag !== 'Cancelled') {
            throw new SenderError('Tournament must be Completed or Cancelled to process MMR.');
        }

        // 3. Verify tournament counts toward MMR
        if (!tournament.countTowardsMmr) {
            throw new SenderError('This tournament does not count toward MMR (countTowardsMmr=false).');
        }

        // 4. Find all Validated, unprocessed MatchResultRecords for this tournament
        const matchResults = [...ctx.db.MatchResultRecord.tournament_id.filter(tournamentId)]
            .filter((mr: any) => mr.status.tag === 'Validated' && mr.mmrProcessedAt === undefined);

        // 5. If no matches found, log and return
        if (matchResults.length === 0) {
            console.log('[MMR] No unprocessed matches for tournament #' + tournamentId);
            return;
        }

        // 6. Read EloConfig once
        const config = ctx.db.EloConfigTable.id.find(1);
        if (!config) {
            throw new SenderError('ELO config not initialized. Call admin_seed_elo_config first.');
        }

        // 7. For each match result, process MMR
        for (const mr of matchResults) {
            const participants = [...ctx.db.MatchResultParticipant.match_result_id.filter(mr.id)];
            const games = [...ctx.db.MatchResultGame.match_result_id.filter(mr.id)];
            const lobby = ctx.db.Lobby.id.find(mr.lobbyId);
            const gameMode = lobby?.gameMode ?? games[0]?.gameMode ?? { tag: 'MemoryOfChaos', value: {} };

            // MmrHistory rows inserted with matchHistoryId=0 as sentinel
            processMatchMmr(ctx, mr, participants, gameMode, 0, user.id);

            // Stamp mmrProcessedAt
            const freshMr = ctx.db.MatchResultRecord.id.find(mr.id);
            if (freshMr) {
                ctx.db.MatchResultRecord.id.update({
                    ...freshMr,
                    mmrProcessedAt: ctx.timestamp,
                    ...auditUpdate(ctx, freshMr, user.id),
                } as any);
            }
        }

        // 8. Rebuild leaderboard once after all matches processed
        rebuildLeaderboard(ctx, user.id);

        // 9. Log
        console.log(`[MMR] Processed ${matchResults.length} tournament matches for tournament #${tournamentId}`);
    }
);
