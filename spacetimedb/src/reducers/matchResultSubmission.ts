import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser, isRoleAtLeast } from '../helpers/ensurePermissions';
import { auditUpdate } from '../helpers/auditColumns';

// ─── confirm_match_scores ─────────────────────────────────────────────────────
// Allows a match participant's team captain to confirm their team's scores.
// Permission: authenticated match participant who is a captain.

export const confirm_match_scores = spacetimedb.reducer(
    {
        matchResultId: t.u32(),
    },
    (ctx, { matchResultId }) => {
        const user = getAuthenticatedUser(ctx);

        // Find the MatchResultRecord
        const matchResult = ctx.db.MatchResultRecord.id.find(matchResultId);
        if (!matchResult) {
            throw new SenderError('Match result not found.');
        }

        // Validate status is Pending
        if (matchResult.status.tag !== 'Pending') {
            throw new SenderError('Scores can only be confirmed when the match is in Pending status.');
        }

        // Look up MatchResultParticipant by [matchResultId, userId]
        const participant = [...ctx.db.MatchResultParticipant.by_result_and_user.filter([matchResultId, user.id])][0];
        if (!participant) {
            throw new SenderError('You are not a participant of this match.');
        }

        // Only captains can confirm
        if (!participant.isCaptain) {
            throw new SenderError('Only the team captain can confirm match scores.');
        }

        // Update isConfirmed using delete+insert (composite PK pattern)
        ctx.db.MatchResultParticipant.delete(participant);
        ctx.db.MatchResultParticipant.insert({
            ...participant,
            isConfirmed: true,
            ...auditUpdate(ctx, participant, user.id),
        } as any);

        console.log(`[MATCH] Player #${user.id} confirmed scores for match result #${matchResultId}`);
    }
);

// ─── submit_match_result ──────────────────────────────────────────────────────
// Submits the final match result with a winner.
// Permission: lobby referee OR Moderator/Admin (for tournament matches also the TO/assistant).
// Requires: all team captains must have confirmed scores first.

export const submit_match_result = spacetimedb.reducer(
    {
        matchResultId: t.u32(),
        winnerUserId: t.u32(),
    },
    (ctx, { matchResultId, winnerUserId }) => {
        const user = getAuthenticatedUser(ctx);

        // Find the MatchResultRecord
        const matchResult = ctx.db.MatchResultRecord.id.find(matchResultId);
        if (!matchResult) {
            throw new SenderError('Match result not found.');
        }

        // Validate status is Pending
        if (matchResult.status.tag !== 'Pending') {
            throw new SenderError('Match result can only be submitted when in Pending status.');
        }

        // Check all captain participants have confirmed
        const participants = [...ctx.db.MatchResultParticipant.match_result_id.filter(matchResultId)];
        const captains = participants.filter((p: any) => p.isCaptain);
        if (captains.length === 0) {
            throw new SenderError('No captain participants found for this match.');
        }
        const allConfirmed = captains.every((p: any) => p.isConfirmed);
        if (!allConfirmed) {
            throw new SenderError('All team captains must confirm scores before submission.');
        }

        // Validate winnerUserId is a valid participant (or 0 for draw)
        if (winnerUserId !== 0) {
            const winnerParticipant = participants.find((p: any) => p.userId === winnerUserId);
            if (!winnerParticipant) {
                throw new SenderError('Invalid winner: must be a match participant or 0 for a draw.');
            }
        }

        // Validate caller has referee authority:
        // 1. Check if caller is the lobby referee
        let hasAuthority = false;

        const lobbyMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([matchResult.lobbyId, user.id])][0];
        if (lobbyMember && lobbyMember.isReferee) {
            hasAuthority = true;
        }

        // 2. Moderator or Admin can always submit
        if (!hasAuthority && isRoleAtLeast(user.role, 'Moderator')) {
            hasAuthority = true;
        }

        // 3. For tournament matches, also check tournament access (TO/assistant)
        if (!hasAuthority && matchResult.isTournamentControlled && matchResult.tournamentId !== undefined) {
            const tournament = ctx.db.Tournament.id.find(matchResult.tournamentId);
            if (tournament && tournament.organizerId === user.id) {
                hasAuthority = true;
            }
            if (!hasAuthority) {
                const assistant = [...ctx.db.TournamentAssistant.by_tournament_and_user.filter([matchResult.tournamentId, user.id])][0];
                if (assistant && assistant.canValidateResults) {
                    hasAuthority = true;
                }
            }
        }

        if (!hasAuthority) {
            throw new SenderError('You do not have referee authority to submit this match result.');
        }

        // Update the MatchResultRecord
        // NOTE: Phase 3 only records the submission. MMR calculation (Phase 5) and bracket
        // advancement (Phase 4) are triggered by separate downstream processes.
        ctx.db.MatchResultRecord.id.update({
            ...matchResult,
            status: { tag: 'Submitted', value: {} } as any,
            winnerUserId: winnerUserId !== 0 ? winnerUserId : undefined,
            refereeUserId: user.id,
            ...auditUpdate(ctx, matchResult, user.id),
        } as any);

        console.log(`[MATCH] Match result #${matchResultId} submitted by user #${user.id}, winner: #${winnerUserId}`);
    }
);

// ─── dispute_match_result ─────────────────────────────────────────────────────
// Allows a match participant to dispute the submitted result.
// Permission: match participant.
// Constraints: status must be Submitted, only one dispute per match.

export const dispute_match_result = spacetimedb.reducer(
    {
        matchResultId: t.u32(),
        reason: t.string(),
    },
    (ctx, { matchResultId, reason }) => {
        const user = getAuthenticatedUser(ctx);

        // Find the MatchResultRecord
        const matchResult = ctx.db.MatchResultRecord.id.find(matchResultId);
        if (!matchResult) {
            throw new SenderError('Match result not found.');
        }

        // Validate status is Submitted (can only dispute after submission)
        if (matchResult.status.tag !== 'Submitted') {
            throw new SenderError('A match result can only be disputed after it has been submitted.');
        }

        // Validate caller is a match participant via MatchResultParticipant
        const participant = [...ctx.db.MatchResultParticipant.by_result_and_user.filter([matchResultId, user.id])][0];
        if (!participant) {
            throw new SenderError('You are not a participant of this match.');
        }

        // Validate only one dispute per match
        if (matchResult.disputedByUserId !== undefined) {
            throw new SenderError('This match result has already been disputed.');
        }

        // Validate reason length
        const trimmedReason = reason.trim();
        if (trimmedReason.length === 0) {
            throw new SenderError('Dispute reason cannot be empty.');
        }
        if (trimmedReason.length > 1000) {
            throw new SenderError('Dispute reason cannot exceed 1000 characters.');
        }

        // Update the MatchResultRecord
        ctx.db.MatchResultRecord.id.update({
            ...matchResult,
            status: { tag: 'Disputed', value: {} } as any,
            disputedByUserId: user.id,
            disputeReason: trimmedReason,
            ...auditUpdate(ctx, matchResult, user.id),
        } as any);

        console.log(`[MATCH] Match result #${matchResultId} disputed by player #${user.id}`);
    }
);
