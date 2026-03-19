import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser } from '../helpers/ensurePermissions';
import { ensureTournamentAccess } from '../helpers/tournamentHelpers';
import { auditUpdate } from '../helpers/auditColumns';

// ─── Group standings points ────────────────────────────────────────────────────
// Win=2, Draw=1, Loss=0 (per CONTEXT.md)
const WIN_POINTS = 2;
const DRAW_POINTS = 1;
// const LOSS_POINTS = 0;  // implied

// ─── Internal helper: placeParticipantInNextMatch ─────────────────────────────
// Places a teamId into the next available slot of a given BracketMatch.
// If no next match ID resolves, does nothing (this was the final match).

function placeParticipantInNextMatch(ctx: any, nextMatchId: number, teamId: number, userId: number): void {
    const nextMatch = ctx.db.BracketMatch.id.find(nextMatchId);
    if (!nextMatch) {
        // Could be the final match with no next — silently return
        return;
    }

    if (!nextMatch.participant1Id) {
        ctx.db.BracketMatch.id.update({
            ...nextMatch,
            participant1Id: teamId,
            ...auditUpdate(ctx, nextMatch, userId),
        } as any);
    } else if (!nextMatch.participant2Id) {
        ctx.db.BracketMatch.id.update({
            ...nextMatch,
            participant2Id: teamId,
            ...auditUpdate(ctx, nextMatch, userId),
        } as any);
    } else {
        throw new SenderError('Next match already has both participants assigned.');
    }
}

// ─── Internal helper: removeParticipantFromMatch ──────────────────────────────
// Removes the slot containing teamId from a BracketMatch. Also clears winnerId if it was that team.

function removeParticipantFromMatch(ctx: any, matchId: number, teamId: number, userId: number): void {
    const match = ctx.db.BracketMatch.id.find(matchId);
    if (!match) return;

    const updatedMatch: any = {
        ...match,
        ...auditUpdate(ctx, match, userId),
    };

    // Clear the slot containing this teamId
    if (match.participant1Id === teamId) {
        updatedMatch.participant1Id = undefined;
    } else if (match.participant2Id === teamId) {
        updatedMatch.participant2Id = undefined;
    }

    // Also clear winnerId if it was this team
    if (match.winnerId === teamId) {
        updatedMatch.winnerId = undefined;
    }

    ctx.db.BracketMatch.id.update(updatedMatch as any);
}

// ─── Internal helper: updateGroupStandings ────────────────────────────────────
// Updates GroupStanding rows for both participants after a group match resolves.
// Win=2, Draw=1, Loss=0

function updateGroupStandings(ctx: any, bracketMatch: any, userId: number): void {
    const groupId = bracketMatch.groupId;
    const tournamentId = bracketMatch.tournamentId;

    const tournamentStandings = [...ctx.db.GroupStanding.tournament_id.filter(tournamentId)];
    const standing1 = tournamentStandings
        .find((row: any) => row.groupId === groupId && row.participantTeamId === bracketMatch.participant1Id);
    const standing2 = tournamentStandings
        .find((row: any) => row.groupId === groupId && row.participantTeamId === bracketMatch.participant2Id);

    if (!standing1 || !standing2) return;

    let updated1: any;
    let updated2: any;

    if (bracketMatch.winnerId === undefined) {
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
    } else if (bracketMatch.winnerId === bracketMatch.participant1Id) {
        // Participant1 wins
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
        // Participant2 wins
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

// ─── Internal helper: reverseGroupStandings ───────────────────────────────────
// Reverses GroupStanding changes for a group match (used during rollback).

function reverseGroupStandings(ctx: any, bracketMatch: any, userId: number): void {
    const groupId = bracketMatch.groupId;
    const tournamentId = bracketMatch.tournamentId;

    const tournamentStandings = [...ctx.db.GroupStanding.tournament_id.filter(tournamentId)];
    const standing1 = tournamentStandings
        .find((row: any) => row.groupId === groupId && row.participantTeamId === bracketMatch.participant1Id);
    const standing2 = tournamentStandings
        .find((row: any) => row.groupId === groupId && row.participantTeamId === bracketMatch.participant2Id);

    if (!standing1 || !standing2) return;

    let updated1: any;
    let updated2: any;

    if (bracketMatch.winnerId === undefined) {
        // Was a draw: reverse draws+1 and points+1 for both
        updated1 = {
            ...standing1,
            draws: Math.max(0, standing1.draws - 1),
            points: Math.max(0, standing1.points - DRAW_POINTS),
            ...auditUpdate(ctx, standing1, userId),
        };
        updated2 = {
            ...standing2,
            draws: Math.max(0, standing2.draws - 1),
            points: Math.max(0, standing2.points - DRAW_POINTS),
            ...auditUpdate(ctx, standing2, userId),
        };
    } else if (bracketMatch.winnerId === bracketMatch.participant1Id) {
        // Was participant1 win: reverse
        updated1 = {
            ...standing1,
            wins: Math.max(0, standing1.wins - 1),
            points: Math.max(0, standing1.points - WIN_POINTS),
            ...auditUpdate(ctx, standing1, userId),
        };
        updated2 = {
            ...standing2,
            losses: Math.max(0, standing2.losses - 1),
            ...auditUpdate(ctx, standing2, userId),
        };
    } else {
        // Was participant2 win: reverse
        updated1 = {
            ...standing1,
            losses: Math.max(0, standing1.losses - 1),
            ...auditUpdate(ctx, standing1, userId),
        };
        updated2 = {
            ...standing2,
            wins: Math.max(0, standing2.wins - 1),
            points: Math.max(0, standing2.points - WIN_POINTS),
            ...auditUpdate(ctx, standing2, userId),
        };
    }

    // Delete + insert pattern for composite PK tables
    ctx.db.GroupStanding.delete(standing1);
    ctx.db.GroupStanding.insert(updated1 as any);

    ctx.db.GroupStanding.delete(standing2);
    ctx.db.GroupStanding.insert(updated2 as any);
}

// ─── advance_bracket_match ────────────────────────────────────────────────────
// Places winner in nextWinnerMatchId slot. Routes loser to nextLoserMatchId (double elim).
// Updates GroupStanding for group matches.
// Permission: Tournament Access (TO/assistant/mod/admin).

export const advance_bracket_match = spacetimedb.reducer(
    {
        bracketMatchId: t.u32(),
    },
    (ctx, { bracketMatchId }) => {
        const bracketMatch = ctx.db.BracketMatch.id.find(bracketMatchId);
        if (!bracketMatch) {
            throw new SenderError('Bracket match not found.');
        }

        const { user, tournament } = ensureTournamentAccess(ctx, bracketMatch.tournamentId);

        // Verify tournament is InProgress
        if (tournament.stage.tag !== 'InProgress') {
            throw new SenderError('Bracket advancement is only allowed during InProgress stage.');
        }

        // Verify winner is set
        if (bracketMatch.winnerId === undefined) {
            throw new SenderError('No winner set on this bracket match. Submit a result first.');
        }

        // Place winner in nextWinnerMatchId slot (if exists)
        if (bracketMatch.nextWinnerMatchId) {
            placeParticipantInNextMatch(ctx, bracketMatch.nextWinnerMatchId, bracketMatch.winnerId, user.id);
        }

        // Route loser to nextLoserMatchId (for double elim, 3rd place)
        if (bracketMatch.nextLoserMatchId) {
            const loserId = bracketMatch.participant1Id === bracketMatch.winnerId
                ? bracketMatch.participant2Id
                : bracketMatch.participant1Id;
            if (loserId) {
                placeParticipantInNextMatch(ctx, bracketMatch.nextLoserMatchId, loserId, user.id);
            }
        }

        // Update group standings if this is a group match
        if (bracketMatch.bracketSide.tag === 'Group' && bracketMatch.participant1Id && bracketMatch.participant2Id) {
            updateGroupStandings(ctx, bracketMatch, user.id);
        }

        console.log(`[BRACKET] Bracket match #${bracketMatchId} advanced: winner team #${bracketMatch.winnerId}`);
    }
);

// ─── submit_and_advance_bracket ───────────────────────────────────────────────
// Wrapper reducer for tournament bracket matches. Maps winnerId (userId) to teamId
// and auto-advances in one transaction. Frontend calls this for tournament matches
// instead of submit_match_result directly.
// Permission: Authenticated user (referee/TO authority validated inline).

export const submit_and_advance_bracket = spacetimedb.reducer(
    {
        matchResultId: t.u32(),
    },
    (ctx, { matchResultId }) => {
        const user = getAuthenticatedUser(ctx);

        // Find MatchResultRecord by id
        const matchResult = ctx.db.MatchResultRecord.id.find(matchResultId);
        if (!matchResult) {
            throw new SenderError('Match result not found.');
        }

        // Verify it has bracketMatchId set
        if (matchResult.bracketMatchId === undefined) {
            throw new SenderError('Not a bracket match -- use submit_match_result for non-tournament matches.');
        }

        // Verify it has winnerId set (userId)
        if (matchResult.winnerId === undefined) {
            throw new SenderError('No winner on match result. Submit scores first.');
        }

        // Find the tournament — matchResult.tournamentId is required for bracket matches
        if (matchResult.tournamentId === undefined) {
            throw new SenderError('Match result is not linked to a tournament.');
        }
        const tournament = ctx.db.Tournament.id.find(matchResult.tournamentId);
        if (!tournament) {
            throw new SenderError('Tournament not found.');
        }

        // Verify tournament is InProgress
        if (tournament.stage.tag !== 'InProgress') {
            throw new SenderError('Bracket advancement is only allowed during InProgress stage.');
        }

        // Map winnerId (userId) to teamId via TournamentParticipant
        const winnerParticipant = [...ctx.db.TournamentParticipant.by_tournament_and_user.filter([matchResult.tournamentId, matchResult.winnerId])][0];
        if (!winnerParticipant || !winnerParticipant.teamGroupId) {
            throw new SenderError('Winner participant or team not found in tournament.');
        }
        const winnerTeamId = winnerParticipant.teamGroupId;

        // Find the BracketMatch and set winnerId to winnerTeamId
        const bracketMatch = ctx.db.BracketMatch.id.find(matchResult.bracketMatchId);
        if (!bracketMatch) throw new SenderError('Bracket match not found.');

        ctx.db.BracketMatch.id.update({
            ...bracketMatch,
            winnerId: winnerTeamId,
            resultStatus: { tag: 'Validated', value: {} } as any,
            ...auditUpdate(ctx, bracketMatch, user.id),
        } as any);

        // Re-read the updated bracketMatch for downstream logic
        const updatedBracketMatch = ctx.db.BracketMatch.id.find(matchResult.bracketMatchId);
        if (!updatedBracketMatch) throw new SenderError('Bracket match not found after update.');

        // If autoAdvanceBracket is true, run advancement inline
        if (tournament.autoAdvanceBracket) {
            // Place winner in nextWinnerMatchId
            if (updatedBracketMatch.nextWinnerMatchId) {
                placeParticipantInNextMatch(ctx, updatedBracketMatch.nextWinnerMatchId, winnerTeamId, user.id);
            }

            // Route loser to nextLoserMatchId
            if (updatedBracketMatch.nextLoserMatchId) {
                const loserId = updatedBracketMatch.participant1Id === winnerTeamId
                    ? updatedBracketMatch.participant2Id
                    : updatedBracketMatch.participant1Id;
                if (loserId) {
                    placeParticipantInNextMatch(ctx, updatedBracketMatch.nextLoserMatchId, loserId, user.id);
                }
            }

            // Update group standings if group match
            if (updatedBracketMatch.bracketSide.tag === 'Group' &&
                updatedBracketMatch.participant1Id &&
                updatedBracketMatch.participant2Id) {
                updateGroupStandings(ctx, updatedBracketMatch, user.id);
            }
        }

        console.log(`[BRACKET] submit_and_advance_bracket: match result #${matchResultId}, winner team #${winnerTeamId}, auto-advance: ${tournament.autoAdvanceBracket}`);
    }
);

// ─── rollback_bracket_match ───────────────────────────────────────────────────
// Reverses one step of bracket advancement. Clears winnerId, removes winner/loser
// from next matches. Blocks if mmrProcessedAt is set on MatchResultRecord.
// Permission: Tournament Access (TO/assistant/mod/admin).

export const rollback_bracket_match = spacetimedb.reducer(
    {
        bracketMatchId: t.u32(),
    },
    (ctx, { bracketMatchId }) => {
        const bracketMatch = ctx.db.BracketMatch.id.find(bracketMatchId);
        if (!bracketMatch) {
            throw new SenderError('Bracket match not found.');
        }

        const { user, tournament } = ensureTournamentAccess(ctx, bracketMatch.tournamentId);

        // Verify tournament is InProgress
        if (tournament.stage.tag !== 'InProgress') {
            throw new SenderError('Bracket rollback is only allowed during InProgress stage.');
        }

        // Verify there is a winner to rollback
        if (bracketMatch.winnerId === undefined) {
            throw new SenderError('No winner to rollback.');
        }

        // Check if MMR has been processed for any match result linked to this bracket match
        const matchResults = [...ctx.db.MatchResultRecord.tournament_id.filter(bracketMatch.tournamentId)]
            .filter((mr: any) => mr.bracketMatchId === bracketMatch.id);
        for (const mr of matchResults) {
            if (mr.mmrProcessedAt) {
                throw new SenderError('Cannot rollback: MMR has already been processed for this match. MMR reversal is deferred to Phase 5.');
            }
        }

        const winnerId = bracketMatch.winnerId;

        // Reverse advancement — remove winner from next winner match
        if (bracketMatch.nextWinnerMatchId) {
            removeParticipantFromMatch(ctx, bracketMatch.nextWinnerMatchId, winnerId, user.id);
        }

        // Reverse loser routing — remove loser from losers bracket next match
        if (bracketMatch.nextLoserMatchId) {
            const loserId = bracketMatch.participant1Id === winnerId
                ? bracketMatch.participant2Id
                : bracketMatch.participant1Id;
            if (loserId) {
                removeParticipantFromMatch(ctx, bracketMatch.nextLoserMatchId, loserId, user.id);
            }
        }

        // Reverse group standings if group match
        if (bracketMatch.bracketSide.tag === 'Group' && bracketMatch.participant1Id && bracketMatch.participant2Id) {
            reverseGroupStandings(ctx, bracketMatch, user.id);
        }

        // Re-read bracketMatch in case it was updated by removeParticipantFromMatch above
        const currentBracketMatch = ctx.db.BracketMatch.id.find(bracketMatchId);
        if (!currentBracketMatch) throw new SenderError('Bracket match not found after reversal.');

        // Clear winnerId and reset resultStatus to Pending
        ctx.db.BracketMatch.id.update({
            ...currentBracketMatch,
            winnerId: undefined,
            resultStatus: { tag: 'Pending', value: {} } as any,
            ...auditUpdate(ctx, currentBracketMatch, user.id),
        } as any);

        console.log(`[BRACKET] rollback_bracket_match: bracket match #${bracketMatchId} rolled back by user #${user.id}`);
    }
);
