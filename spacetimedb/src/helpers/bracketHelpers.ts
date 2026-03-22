// ─── Bracket Advancement Helpers ─────────────────────────────────────────────
// Extracted from bracketAdvancement.ts for cross-reducer use. Called by both
// bracketAdvancement.ts reducers and matchFinalization.ts.

import { SenderError } from 'spacetimedb/server';
import { auditUpdate } from './auditColumns';

// ─── Group standings points ────────────────────────────────────────────────────
const WIN_POINTS = 2;
const DRAW_POINTS = 1;

/**
 * Places a teamId into the next available slot of a given BracketMatch.
 * If no next match ID resolves, does nothing (this was the final match).
 */
export function placeParticipantInNextMatch(ctx: any, nextMatchId: number, teamId: number, userId: number): void {
    const nextMatch = ctx.db.BracketMatch.id.find(nextMatchId);
    if (!nextMatch) {
        // Could be the final match with no next -- silently return
        return;
    }

    if (!nextMatch.team1Id) {
        ctx.db.BracketMatch.id.update({
            ...nextMatch,
            team1Id: teamId,
            ...auditUpdate(ctx, nextMatch, userId),
        } as any);
    } else if (!nextMatch.team2Id) {
        ctx.db.BracketMatch.id.update({
            ...nextMatch,
            team2Id: teamId,
            ...auditUpdate(ctx, nextMatch, userId),
        } as any);
    } else {
        throw new SenderError('Next match already has both participants assigned.');
    }
}

/**
 * Updates GroupStanding rows for both participants after a group match resolves.
 * Win=2, Draw=1, Loss=0.
 */
export function updateGroupStandings(ctx: any, bracketMatch: any, userId: number): void {
    const groupId = bracketMatch.groupId;
    const tournamentId = bracketMatch.tournamentId;

    const tournamentStandings = [...ctx.db.GroupStanding.tournament_id.filter(tournamentId)];
    const standing1 = tournamentStandings
        .find((row: any) => row.groupId === groupId && row.teamId === bracketMatch.team1Id);
    const standing2 = tournamentStandings
        .find((row: any) => row.groupId === groupId && row.teamId === bracketMatch.team2Id);

    if (!standing1 || !standing2) return;

    let updated1: any;
    let updated2: any;

    if (bracketMatch.winnerTeamId === undefined) {
        // Draw: both get draws+1, points+1
        updated1 = {
            ...standing1,
            draws: standing1.draws + 1,
            points: standing1.points + DRAW_POINTS,
            ...auditUpdate(ctx, standing1, userId),
        };
        updated2 = {
            ...standing2,
            draws: standing2.draws + 1,
            points: standing2.points + DRAW_POINTS,
            ...auditUpdate(ctx, standing2, userId),
        };
    } else if (bracketMatch.winnerTeamId === bracketMatch.team1Id) {
        // Team1 wins
        updated1 = {
            ...standing1,
            wins: standing1.wins + 1,
            points: standing1.points + WIN_POINTS,
            ...auditUpdate(ctx, standing1, userId),
        };
        updated2 = {
            ...standing2,
            losses: standing2.losses + 1,
            ...auditUpdate(ctx, standing2, userId),
        };
    } else {
        // Team2 wins
        updated1 = {
            ...standing1,
            losses: standing1.losses + 1,
            ...auditUpdate(ctx, standing1, userId),
        };
        updated2 = {
            ...standing2,
            wins: standing2.wins + 1,
            points: standing2.points + WIN_POINTS,
            ...auditUpdate(ctx, standing2, userId),
        };
    }

    // Delete + insert pattern for composite PK tables
    ctx.db.GroupStanding.delete(standing1);
    ctx.db.GroupStanding.insert(updated1 as any);

    ctx.db.GroupStanding.delete(standing2);
    ctx.db.GroupStanding.insert(updated2 as any);
}

/**
 * Advances a bracket match: sets winnerTeamId, places winner/loser in next matches,
 * and updates group standings. Called from matchFinalization.ts for tournament bracket
 * matches that need advancement during finalization.
 */
export function advanceBracketMatch(ctx: any, bracketMatchId: number, winnerTeamId: number, userId: number): void {
    const bracketMatch = ctx.db.BracketMatch.id.find(bracketMatchId);
    if (!bracketMatch) {
        throw new SenderError('Bracket match not found.');
    }

    const tournament = ctx.db.Tournament.id.find(bracketMatch.tournamentId);
    if (!tournament || tournament.stage.tag !== 'InProgress') {
        throw new SenderError('Tournament must be InProgress for bracket advancement.');
    }

    // Set winnerTeamId and resultStatus
    ctx.db.BracketMatch.id.update({
        ...bracketMatch,
        winnerTeamId,
        resultStatus: { tag: 'Validated', value: {} } as any,
        ...auditUpdate(ctx, bracketMatch, userId),
    } as any);

    // Re-read for downstream logic
    const updatedBracketMatch = ctx.db.BracketMatch.id.find(bracketMatchId);
    if (!updatedBracketMatch) return;

    if (tournament.autoAdvanceBracket) {
        // Place winner in nextWinnerMatchId
        if (updatedBracketMatch.nextWinnerMatchId) {
            placeParticipantInNextMatch(ctx, updatedBracketMatch.nextWinnerMatchId, winnerTeamId, userId);
        }

        // Route loser to nextLoserMatchId
        if (updatedBracketMatch.nextLoserMatchId) {
            const loserId = updatedBracketMatch.team1Id === winnerTeamId
                ? updatedBracketMatch.team2Id
                : updatedBracketMatch.team1Id;
            if (loserId) {
                placeParticipantInNextMatch(ctx, updatedBracketMatch.nextLoserMatchId, loserId, userId);
            }
        }

        // Update group standings if group match with both teams
        if (updatedBracketMatch.bracketSide.tag === 'Group' &&
            updatedBracketMatch.team1Id &&
            updatedBracketMatch.team2Id) {
            updateGroupStandings(ctx, updatedBracketMatch, userId);
        }
    }
}
