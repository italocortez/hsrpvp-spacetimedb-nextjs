// ─── Finalization Pipeline Helpers ────────────────────────────────────────────
// Shared 18-step finalization logic callable by both finalize_match_result
// (ranked/tournament) and submit_match_result (casual auto-finalize per D-37).

import { SenderError } from 'spacetimedb/server';
import { auditInsert, auditUpdate } from './auditColumns';
import { getKFactor, calculateExpectedScore, calculateRatingChange, calculateTeamEffective, calculateAccountModifier } from './eloCalculation';
import type { EloConfigValues } from './eloCalculation';
import { incrementPlayerStat, incrementPlayerRelationship } from './statsIncrement';
import { incrementPlayerCharacterStat, incrementBanStat, incrementFacedStat } from './characterStatsIncrement';
import { incrementGlobalCharacterStat } from './globalCharacterStatsIncrement';
import { rebuildLeaderboard } from './leaderboardRebuild';
import { advanceBracketMatch } from './bracketHelpers';
import { checkAndAwardAchievements } from './achievementChecker';

// ─── Internal: getOrCreateRating ─────────────────────────────────────────────
// Returns existing MmrRating row for user+mode+season, or creates a new one.

function getOrCreateRating(ctx: any, userId: number, gameMode: any, seasonId: number, initialRating: number, actingUserId: number): any {
    const existing = [...ctx.db.MmrRating.by_user_mode_season.filter([userId, gameMode, seasonId])][0];
    if (existing) return existing;

    const newRow = {
        userId,
        gameMode,
        rating: initialRating,
        matchesPlayed: 0,
        globalCompositeRating: undefined,
        seasonId,
        ...auditInsert(ctx, actingUserId),
    };
    ctx.db.MmrRating.insert(newRow as any);
    return { ...newRow };
}

// ─── Internal: processMatchMmr ───────────────────────────────────────────────
// Pure MMR processing for a single match.

export function processMatchMmr(
    ctx: any,
    matchResult: any,
    participants: any[],
    gameMode: any,
    seasonId: number,
    matchHistoryId: number,
    actingUserId: number
): void {
    // 1. Read EloConfig
    const config = ctx.db.EloConfigTable.id.find(1);
    if (!config) {
        throw new SenderError('ELO config not initialized. Call admin_seed_elo_config first.');
    }

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

    // 2. Separate participants by team
    const blueParticipants = participants.filter((p: any) => p.teamSide.tag === 'Blue');
    const redParticipants = participants.filter((p: any) => p.teamSide.tag === 'Red');

    // 3. Get or create MmrRating for each participant
    const blueRatings = blueParticipants.map((p: any) =>
        getOrCreateRating(ctx, p.userId, gameMode, seasonId, cv.initialRating, actingUserId).rating
    );
    const redRatings = redParticipants.map((p: any) =>
        getOrCreateRating(ctx, p.userId, gameMode, seasonId, cv.initialRating, actingUserId).rating
    );

    // 4. Calculate team effective ratings
    let blueEffective = calculateTeamEffective(blueRatings, cv.sizeBonus, cv.spreadDivisor);
    let redEffective = calculateTeamEffective(redRatings, cv.sizeBonus, cv.spreadDivisor);

    // 5. Apply account rating modifier (Fair MMR always in Phase 5)
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

    // 6. Determine actual result
    let blueActualResult: number;
    let redActualResult: number;

    if (matchResult.winnerUserId === undefined) {
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

    // 7. For each participant, calculate and apply rating change
    for (const participant of participants) {
        const playerRating = getOrCreateRating(ctx, participant.userId, gameMode, seasonId, cv.initialRating, actingUserId);
        const isBlue = participant.teamSide.tag === 'Blue';
        const playerEffective = isBlue ? blueEffective : redEffective;
        const opponentEffective = isBlue ? redEffective : blueEffective;
        const expected = calculateExpectedScore(playerEffective, opponentEffective);
        const k = getKFactor(playerRating.matchesPlayed, cv);
        const actualResult = isBlue ? blueActualResult : redActualResult;
        const delta = calculateRatingChange(k, actualResult, expected);
        const newRating = Math.max(0, playerRating.rating + delta);

        // Update MmrRating (delete + insert for composite PK)
        const currentRating = [...ctx.db.MmrRating.by_user_mode_season.filter([participant.userId, gameMode, seasonId])][0];
        if (currentRating) {
            ctx.db.MmrRating.delete(currentRating);
        }
        ctx.db.MmrRating.insert({
            userId: participant.userId,
            gameMode,
            rating: newRating,
            matchesPlayed: (currentRating?.matchesPlayed ?? 0) + 1,
            globalCompositeRating: currentRating?.globalCompositeRating,
            seasonId,
            ...(currentRating ? auditUpdate(ctx, currentRating, actingUserId) : auditInsert(ctx, actingUserId)),
        } as any);

        // Update globalCompositeRating
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

        // Insert MmrHistory row
        ctx.db.MmrHistory.insert({
            id: 0, // autoInc
            userId: participant.userId,
            gameMode,
            matchHistoryId,
            previousRating: playerRating.rating,
            newRating,
            delta,
            seasonId,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }
}

// ─── runFinalization ─────────────────────────────────────────────────────────
// 18-step pipeline: reads ephemeral data, archives to history, increments all
// stats, processes MMR (if applicable), advances bracket, deletes ephemeral.

export function runFinalization(
    ctx: any,
    matchResult: any,
    actingUserId: number
): void {
    // ── Reads (1-6) ──────────────────────────────────────────────────────────

    // 1. Read participants
    const participants = [...ctx.db.MatchResultParticipant.match_result_id.filter(matchResult.id)];

    // 2. Read games
    const games = [...ctx.db.MatchResultGame.match_result_id.filter(matchResult.id)];

    // 3. Read lobby
    const lobby = ctx.db.Lobby.id.find(matchResult.lobbyId);

    // 3b. Read match session (for budget analysis in step 7, D-88)
    const session = ctx.db.MatchSession.lobbyId.find(matchResult.lobbyId);

    // 4. Read steps (sorted by sequence)
    const steps = [...ctx.db.MatchSessionStep.lobby_id.filter(matchResult.lobbyId)]
        .sort((a: any, b: any) => a.sequence - b.sequence);

    // 5. Read active season
    const activeSeason = [...ctx.db.Season.is_active.filter(true)][0];
    const seasonId = activeSeason ? activeSeason.id : 0;

    // 6. Determine match metadata
    const gameMode = lobby?.gameMode ?? games[0]?.gameMode ?? { tag: 'MemoryOfChaos', value: {} };
    const draftMode = lobby?.draftMode ?? { tag: 'Classic', value: {} };
    const matchType = matchResult.matchType;
    const teamSize = lobby ? lobby.teamSize : 1;

    // Determine match outcome
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

    // ── Writes (7-18) ────────────────────────────────────────────────────────

    // 7. Write MatchSessionHistory row (no rosterBlue/rosterRed per D-52/D-57)
    const historyRow = ctx.db.MatchSessionHistory.insert({
        id: 0, // autoInc
        lobbyCode: lobby ? lobby.joinCode : 'UNKNOWN',
        playedAt: matchResult.createdDate,
        draftMode: lobby ? lobby.draftMode : { tag: 'Classic', value: {} },
        gameMode,
        teamBlueAlias: lobby ? lobby.teamBlueAlias : 'Blue',
        teamRedAlias: lobby ? lobby.teamRedAlias : 'Red',
        snapshotConfig: lobby ? {
            teamSize: lobby.teamSize,
            draftMode: lobby.draftMode,
            banMode: lobby.banMode,
            standardTurnSeconds: lobby.standardTurnSeconds,
            reserveBankSeconds: lobby.reserveBankSeconds,
            characterBudget: lobby.characterBudget,
            lightconeBudget: lobby.lightconeBudget,
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
            characterBudget: 0,
            lightconeBudget: 0,
            rosterDiffAdvantage: 0,
            rosterThreshold: 0,
            underThresholdAdvantage: 0,
            aboveThresholdPenalty: 0,
            deathPenalty: 0,
        },
        outcome: matchOutcome,
        // D-88: Budget analysis (after carryover: charBudget=0, lcBudget = original LC + leftover char)
        // totalSpent = characterBudget + lightconeBudget - remainingLcBudget (correct carryover math)
        teamBlueSpent: session && lobby ? (lobby.characterBudget + lobby.lightconeBudget - session.teamBlueLcBudget) : 0,
        teamRedSpent: session && lobby ? (lobby.characterBudget + lobby.lightconeBudget - session.teamRedLcBudget) : 0,
        handicapApplied: 0,
        // D-84/D-91: Tournament matches hidden until tournament completes; standalone matches always visible
        isPubliclyVisible: lobby?.isTournamentControlled ? false : true,
        ...auditInsert(ctx, actingUserId),
    } as any);

    // 8. Write MatchSessionStepHistory rows (per D-50/D-54/D-86/D-90)
    for (const step of steps) {
        const user = ctx.db.User.id.find(step.actorUserId);
        // Extract targetName from payload based on variant tag (D-86)
        // Covers characters (Pick/Ban/AuctionSold/Nominate), LCs (EquipLightcone), and Bid targetCharacter
        // ArrangeLineup and ConfirmLineup: targetName stays undefined
        let targetName: string | undefined;
        if (step.payload) {
            const tag = step.payload.tag;
            if (tag === 'Pick' || tag === 'Ban' || tag === 'AuctionSold' || tag === 'Nominate') {
                targetName = step.payload.value?.characterName;
            } else if (tag === 'Bid') {
                targetName = step.payload.value?.targetCharacter;
            } else if (tag === 'EquipLightcone') {
                targetName = step.payload.value?.lightconeName;
            }
            // ArrangeLineup and ConfirmLineup: targetName stays undefined
        }

        ctx.db.MatchSessionStepHistory.insert({
            matchHistoryId: historyRow.id,
            sequence: step.sequence,
            actorUserId: step.actorUserId,
            actorDisplayName: user ? user.displayName : `User#${step.actorUserId}`,
            teamSide: step.actorSlot,
            action: step.action,
            targetName,
            payload: step.payload ? JSON.stringify(step.payload) : undefined,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }

    // 9. Write MatchResultGameHistory rows (per D-51)
    for (const game of games) {
        ctx.db.MatchResultGameHistory.insert({
            matchHistoryId: historyRow.id,
            gameNumber: game.gameNumber,
            gameMode: game.gameMode,
            teamBlueScreenshotUrl: game.teamBlueScreenshotUrl,
            teamRedScreenshotUrl: game.teamRedScreenshotUrl,
            teamBlueCyclesUsed: game.teamBlueCyclesUsed,
            teamRedCyclesUsed: game.teamRedCyclesUsed,
            teamBlueScore: game.teamBlueScore,
            teamRedScore: game.teamRedScore,
            teamBlueBoss1Score: game.teamBlueBoss1Score,
            teamBlueBoss2Score: game.teamBlueBoss2Score,
            teamRedBoss1Score: game.teamRedBoss1Score,
            teamRedBoss2Score: game.teamRedBoss2Score,
            winnerTeamSide: game.winnerTeamSide,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }

    // 10. Write MatchParticipantHistory per participant (per D-53/D-87)
    for (const p of participants) {
        const pUser = ctx.db.User.id.find(p.userId);
        // D-87: Include role flags from LobbyMember
        const memberRow = [...ctx.db.LobbyMember.by_lobby_and_user.filter([matchResult.lobbyId, p.userId])][0];
        ctx.db.MatchParticipantHistory.insert({
            userId: p.userId,
            matchHistoryId: historyRow.id,
            teamSide: p.teamSide,
            displayName: pUser ? pUser.displayName : `User#${p.userId}`,
            isReferee: memberRow ? memberRow.isReferee : false,
            isCoach: memberRow ? memberRow.isCoach : false,
            isCaptain: p.isCaptain,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }

    // 11. Process MMR — standalone Ranked only (not tournament-controlled)
    if (matchResult.matchType.tag === 'Ranked' && !matchResult.isTournamentControlled) {
        processMatchMmr(ctx, matchResult, participants, gameMode, seasonId, historyRow.id, actingUserId);
        // Stamp mmrProcessedAt
        const freshResult = ctx.db.MatchResultRecord.id.find(matchResult.id)!;
        ctx.db.MatchResultRecord.id.update({
            ...freshResult,
            mmrProcessedAt: ctx.timestamp,
            ...auditUpdate(ctx, freshResult, actingUserId),
        } as any);
        // Rebuild leaderboard with season awareness
        rebuildLeaderboard(ctx, actingUserId, seasonId);
    }

    // 12. Tournament batch back-fill MmrHistory sentinel matchHistoryId
    if (matchResult.isTournamentControlled && matchResult.mmrProcessedAt !== undefined) {
        const participantUserIds = new Set(participants.map((p: any) => p.userId));
        for (const uid of participantUserIds) {
            const mmrRows = [...ctx.db.MmrHistory.user_id.filter(uid)]
                .filter((h: any) => h.matchHistoryId === 0);
            if (mmrRows.length > 0) {
                const latest = mmrRows.sort((a: any, b: any) => b.id - a.id)[0];
                ctx.db.MmrHistory.id.update({
                    ...latest,
                    matchHistoryId: historyRow.id,
                    ...auditUpdate(ctx, latest, actingUserId),
                } as any);
            }
        }
    }

    // 13. Increment PlayerStat per participant
    for (const p of participants) {
        let participantWon = false;
        if (matchResult.winnerUserId !== undefined) {
            const winnerParticipant = participants.find((wp: any) => wp.userId === matchResult.winnerUserId);
            participantWon = winnerParticipant ? winnerParticipant.teamSide.tag === p.teamSide.tag : false;
        }
        const isDraw = matchResult.winnerUserId === undefined;
        incrementPlayerStat(ctx, p.userId, gameMode, draftMode, seasonId, matchType, teamSize, participantWon, isDraw, actingUserId);
    }

    // 14. Increment matchesSpectated for spectators
    const spectators = [...ctx.db.LobbyMember.lobby_id.filter(matchResult.lobbyId)]
        .filter((m: any) => m.teamSlot.tag === 'Spectator' && !m.isCoach && !m.isReferee);
    for (const spec of spectators) {
        incrementSpectatedCount(ctx, spec.userId, gameMode, draftMode, seasonId, matchType, teamSize, actingUserId);
    }

    // 15. Increment PlayerRelationship per participant pair
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
            incrementPlayerRelationship(ctx, a.userId, b.userId, gameMode, draftMode, seasonId, matchType, teamSize, isAlly, aWon, actingUserId);
            incrementPlayerRelationship(ctx, b.userId, a.userId, gameMode, draftMode, seasonId, matchType, teamSize, isAlly, bWon, actingUserId);
        }
    }

    // 16. Increment character stats (per D-54)
    // Build a map of participant userId -> teamSide tag for quick lookup
    const participantTeamMap = new Map<number, string>();
    for (const p of participants) {
        participantTeamMap.set(p.userId, p.teamSide.tag);
    }
    // Determine winner's team side
    let winnerTeamSideTag: string | undefined;
    if (matchResult.winnerUserId !== undefined) {
        const winnerP = participants.find((wp: any) => wp.userId === matchResult.winnerUserId);
        winnerTeamSideTag = winnerP?.teamSide.tag;
    }

    for (const step of steps) {
        const actionTag = step.action.tag;
        // Extract character name from payload
        let charName: string | undefined;
        if (step.payload) {
            const payloadTag = step.payload.tag;
            if (payloadTag === 'Pick' || payloadTag === 'Ban' || payloadTag === 'AuctionSold' || payloadTag === 'Nominate') {
                charName = step.payload.value?.characterName;
            } else if (payloadTag === 'Bid') {
                charName = step.payload.value?.targetCharacter;
            }
        }
        if (!charName) continue;

        const actorTeamSide = step.actorSlot?.tag;

        if (actionTag === 'Pick' || actionTag === 'AuctionSold') {
            // Determine if the actor won
            const didActorWin = winnerTeamSideTag !== undefined && actorTeamSide === winnerTeamSideTag;

            // Increment pick stat for the actor
            incrementPlayerCharacterStat(ctx, step.actorUserId, charName, gameMode, draftMode, seasonId, matchType, teamSize, didActorWin, actingUserId);

            // Increment faced stat for each OPPONENT participant
            for (const p of participants) {
                if (p.teamSide.tag !== actorTeamSide) {
                    const didOpponentWin = winnerTeamSideTag !== undefined && p.teamSide.tag === winnerTeamSideTag;
                    incrementFacedStat(ctx, p.userId, charName, gameMode, draftMode, seasonId, matchType, teamSize, didOpponentWin, actingUserId);
                }
            }

            // Increment global character stat (pick)
            incrementGlobalCharacterStat(ctx, charName, gameMode, draftMode, seasonId, matchType, teamSize, true, didActorWin, actingUserId);
        }

        if (actionTag === 'Ban') {
            // Increment ban stat for ALL participants (per D-23)
            for (const p of participants) {
                incrementBanStat(ctx, p.userId, charName, gameMode, draftMode, seasonId, matchType, teamSize, actingUserId);
            }

            // Increment global character stat (ban)
            incrementGlobalCharacterStat(ctx, charName, gameMode, draftMode, seasonId, matchType, teamSize, false, false, actingUserId);
        }
    }

    // 16.5. Check and award achievements per participant (D-14)
    // Runs after all stat increments (steps 13-16) so criteria evaluate against up-to-date data
    for (const p of participants) {
        checkAndAwardAchievements(ctx, p.userId, actingUserId);
    }

    // 17. Bracket advancement
    if (matchResult.isTournamentControlled && matchResult.bracketMatchId !== undefined && matchResult.winnerUserId !== undefined) {
        const bracketMatch = ctx.db.BracketMatch.id.find(matchResult.bracketMatchId);
        if (bracketMatch && bracketMatch.winnerTeamId === undefined) {
            const winnerParticipant = [...ctx.db.TournamentParticipant.by_tournament_and_user
                .filter([matchResult.tournamentId!, matchResult.winnerUserId])][0];
            if (winnerParticipant && winnerParticipant.teamGroupId) {
                advanceBracketMatch(ctx, matchResult.bracketMatchId, winnerParticipant.teamGroupId, actingUserId);
            }
        }
    }

    // 18. Delete ephemeral records (children first, then steps, then record)
    for (const g of games) { ctx.db.MatchResultGame.delete(g); }
    for (const p of participants) { ctx.db.MatchResultParticipant.delete(p); }
    // Delete MatchSessionStep rows (archived to history in step 8)
    for (const step of steps) { ctx.db.MatchSessionStep.delete(step); }
    const finalResult = ctx.db.MatchResultRecord.id.find(matchResult.id);
    if (finalResult) { ctx.db.MatchResultRecord.delete(finalResult); }

    console.log(`[MATCH] Match result #${matchResult.id} finalized by user #${actingUserId}. History ID: ${historyRow.id}`);
}

// ─── revealTournamentHistory ──────────────────────────────────────────────────
// Batch-updates all MatchSessionHistory rows associated with a tournament to
// isPubliclyVisible=true. Called when tournament stage transitions to
// Completed or Cancelled per D-91.

export function revealTournamentHistory(ctx: any, tournamentId: number): void {
    // Find all MatchResultRecord rows for this tournament via index
    const matchResults = [...ctx.db.MatchResultRecord.tournament_id.filter(tournamentId)];

    // Build a set of lobby join codes that belong to this tournament.
    // We look up each lobby by lobbyId. Finished lobbies may still be alive
    // within the 30-min GC window; if already GC'd the reveal is a no-op for
    // that match (history row's lobbyCode won't match any active lobby, but
    // the MatchSessionHistory row still exists and can be found via lobbyCode).
    const lobbyCodes = new Set<string>();
    for (const mr of matchResults) {
        const lobby = ctx.db.Lobby.id.find(mr.lobbyId);
        if (lobby) {
            lobbyCodes.add(lobby.joinCode);
        }
    }

    if (lobbyCodes.size === 0) return;

    // Iterate MatchSessionHistory and reveal any row whose lobbyCode matches
    // a lobby belonging to this tournament.
    // Note: MatchSessionHistory has no lobbyId column or tournamentId column,
    // so we use iter() to scan. Acceptable for tournament completion
    // (infrequent batch operation, not a hot path).
    for (const history of ctx.db.MatchSessionHistory.iter()) {
        if (!history.isPubliclyVisible && lobbyCodes.has(history.lobbyCode)) {
            ctx.db.MatchSessionHistory.id.update({
                ...history,
                isPubliclyVisible: true,
                ...auditUpdate(ctx, history, 0),
            } as any);
        }
    }
}

// ─── Internal: incrementSpectatedCount ───────────────────────────────────────
// Increments matchesSpectated on PlayerStat for a spectator (per D-30/D-31/D-32).

function incrementSpectatedCount(
    ctx: any,
    userId: number,
    gameMode: any,
    draftMode: any,
    seasonId: number,
    matchType: any,
    teamSize: number,
    actingUserId: number
): void {
    const existing = [...ctx.db.PlayerStat.by_user_mode_draft_season_type_size
        .filter([userId, gameMode, draftMode, seasonId, matchType, teamSize])][0];

    if (existing) {
        ctx.db.PlayerStat.delete(existing);
        ctx.db.PlayerStat.insert({
            userId,
            gameMode,
            draftMode,
            matchesPlayed: existing.matchesPlayed,
            wins: existing.wins,
            losses: existing.losses,
            draws: existing.draws,
            matchesSpectated: existing.matchesSpectated + 1,
            seasonId,
            matchType,
            teamSize,
            ...auditUpdate(ctx, existing, actingUserId),
        } as any);
    } else {
        ctx.db.PlayerStat.insert({
            userId,
            gameMode,
            draftMode,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            matchesSpectated: 1,
            seasonId,
            matchType,
            teamSize,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }
}
