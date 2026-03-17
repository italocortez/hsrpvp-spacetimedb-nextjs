import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser, ensureModerator, isRoleAtLeast } from '../helpers/ensurePermissions';
import { ensureTournamentAccess } from '../helpers/tournamentHelpers';
import { auditInsert, auditUpdate } from '../helpers/auditColumns';

// Valid override status tags
const VALID_OVERRIDE_STATUSES = ['Validated', 'Rejected'];

// ─── dq_participant ───────────────────────────────────────────────────────────
// Disqualifies a tournament participant.
// Permission: TO/assistant/moderator/admin (ensureTournamentAccess).

export const dq_participant = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
        userId: t.u32(),
        reason: t.string(),
    },
    (ctx, { tournamentId, userId, reason }) => {
        const { user } = ensureTournamentAccess(ctx, tournamentId);

        // Find the TournamentParticipant
        const participant = (ctx.db.TournamentParticipant as any).primaryKey.find({ tournamentId, userId });
        if (!participant) {
            throw new SenderError('Participant not found in this tournament.');
        }

        // Validate participant is not already Disqualified or Withdrawn
        if (participant.status.tag === 'Disqualified') {
            throw new SenderError('Participant is already disqualified.');
        }
        if (participant.status.tag === 'Withdrawn') {
            throw new SenderError('Cannot disqualify a participant who has already withdrawn.');
        }

        // Update status to Disqualified (delete + insert for composite PK)
        ctx.db.TournamentParticipant.delete(participant);
        ctx.db.TournamentParticipant.insert({
            ...participant,
            status: { tag: 'Disqualified', value: {} } as any,
            ...auditUpdate(ctx, participant, user.id),
        } as any);

        console.log(`[TOURNAMENT] Participant #${userId} disqualified from tournament #${tournamentId}: ${reason}`);
    }
);

// ─── override_match_result ────────────────────────────────────────────────────
// Overrides a match result status (Validated or Rejected).
// Permission: TO/assistant/mod/admin for tournament matches; Moderator+ for non-tournament matches.

export const override_match_result = spacetimedb.reducer(
    {
        matchResultId: t.u32(),
        newStatusTag: t.string(),
        winnerId: t.u32(),
        reason: t.string(),
    },
    (ctx, { matchResultId, newStatusTag, winnerId, reason }) => {
        // Validate newStatusTag before permission check
        if (!VALID_OVERRIDE_STATUSES.includes(newStatusTag)) {
            throw new SenderError(`Invalid status override: "${newStatusTag}". Must be one of: ${VALID_OVERRIDE_STATUSES.join(', ')}`);
        }

        // Find the MatchResultRecord
        const matchResult = ctx.db.MatchResultRecord.id.find(matchResultId);
        if (!matchResult) {
            throw new SenderError('Match result not found.');
        }

        // Check permission based on whether it's a tournament match
        let actingUserId: number;
        if (matchResult.isTournamentMatch && matchResult.tournamentId !== undefined) {
            // Tournament match: TO/assistant/mod/admin can override
            const { user } = ensureTournamentAccess(ctx, matchResult.tournamentId);
            actingUserId = user.id;
        } else {
            // Non-tournament match: only Moderator/Admin can override
            const user = ensureModerator(ctx);
            actingUserId = user.id;
        }

        // For Validated: winnerId must be player1, player2, or 0 for draw
        if (newStatusTag === 'Validated') {
            if (winnerId !== 0 && winnerId !== matchResult.player1Id && winnerId !== matchResult.player2Id) {
                throw new SenderError('Invalid winner for override: must be player1, player2, or 0 for a draw.');
            }
        }

        // Update the MatchResultRecord
        // For Rejected: clear the winnerId. For Validated: set the provided winnerId.
        ctx.db.MatchResultRecord.id.update({
            ...matchResult,
            status: { tag: newStatusTag, value: {} } as any,
            winnerId: newStatusTag === 'Validated' ? (winnerId !== 0 ? winnerId : undefined) : undefined,
            disputeReason: reason, // Reuse disputeReason field to store override reason
            ...auditUpdate(ctx, matchResult, actingUserId),
        } as any);

        console.log(`[MATCH] Match result #${matchResultId} overridden to "${newStatusTag}" by user #${actingUserId}: ${reason}`);
    }
);

// ─── assign_tournament_assistant ─────────────────────────────────────────────
// Assigns or updates a tournament assistant with granular permissions.
// Permission: tournament organizer or Moderator/Admin (existing assistants cannot assign others).

export const assign_tournament_assistant = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
        userId: t.u32(),
        canValidateResults: t.bool(),
        canOverrideResults: t.bool(),
        canDqParticipants: t.bool(),
        canManageBracket: t.bool(),
        canAssignSeeds: t.bool(),
    },
    (ctx, { tournamentId, userId, canValidateResults, canOverrideResults, canDqParticipants, canManageBracket, canAssignSeeds }) => {
        const callerUser = getAuthenticatedUser(ctx);

        // Find the tournament
        const tournament = ctx.db.Tournament.id.find(tournamentId);
        if (!tournament) {
            throw new SenderError('Tournament not found.');
        }

        // Only the organizer or Moderator+ can assign assistants (existing assistants cannot)
        const isOrganizer = tournament.organizerId === callerUser.id;
        const isModerator = isRoleAtLeast(callerUser.role, 'Moderator');
        if (!isOrganizer && !isModerator) {
            throw new SenderError('Only the tournament organizer or a Moderator/Admin can assign tournament assistants.');
        }

        // Validate the target user exists
        const targetUser = ctx.db.User.id.find(userId);
        if (!targetUser) {
            throw new SenderError('Target user not found.');
        }

        // Cannot assign yourself as an assistant
        if (userId === callerUser.id) {
            throw new SenderError('You cannot assign yourself as a tournament assistant.');
        }

        // Check if assistant row already exists (upsert pattern)
        const existing = (ctx.db.TournamentAssistant as any).primaryKey.find({ tournamentId, userId });

        if (existing) {
            // Delete + re-insert with updated permissions
            ctx.db.TournamentAssistant.delete(existing);
            ctx.db.TournamentAssistant.insert({
                ...existing,
                canValidateResults,
                canOverrideResults,
                canDqParticipants,
                canManageBracket,
                canAssignSeeds,
                ...auditUpdate(ctx, existing, callerUser.id),
            } as any);
            console.log(`[TOURNAMENT] Updated assistant #${userId} permissions for tournament #${tournamentId}`);
        } else {
            // Insert new assistant row
            ctx.db.TournamentAssistant.insert({
                tournamentId,
                userId,
                canValidateResults,
                canOverrideResults,
                canDqParticipants,
                canManageBracket,
                canAssignSeeds,
                ...auditInsert(ctx, callerUser.id),
            } as any);
            console.log(`[TOURNAMENT] Assigned user #${userId} as assistant for tournament #${tournamentId}`);
        }
    }
);

// ─── remove_tournament_assistant ─────────────────────────────────────────────
// Removes a tournament assistant.
// Permission: tournament organizer or Moderator/Admin.

export const remove_tournament_assistant = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
        userId: t.u32(),
    },
    (ctx, { tournamentId, userId }) => {
        const callerUser = getAuthenticatedUser(ctx);

        // Find the tournament
        const tournament = ctx.db.Tournament.id.find(tournamentId);
        if (!tournament) {
            throw new SenderError('Tournament not found.');
        }

        // Only the organizer or Moderator+ can remove assistants
        const isOrganizer = tournament.organizerId === callerUser.id;
        const isModerator = isRoleAtLeast(callerUser.role, 'Moderator');
        if (!isOrganizer && !isModerator) {
            throw new SenderError('Only the tournament organizer or a Moderator/Admin can remove tournament assistants.');
        }

        // Find the assistant row
        const assistant = (ctx.db.TournamentAssistant as any).primaryKey.find({ tournamentId, userId });
        if (!assistant) {
            throw new SenderError('Tournament assistant not found.');
        }

        // Delete the assistant row
        ctx.db.TournamentAssistant.delete(assistant);

        console.log(`[TOURNAMENT] Removed assistant #${userId} from tournament #${tournamentId} by user #${callerUser.id}`);
    }
);

// ─── mod_promote_to_host ──────────────────────────────────────────────────────
// Promotes a User-role account to TournamentHost.
// Permission: Moderator or Admin only.
// Constraint: can only promote from User role (not TournamentHost or higher).

export const mod_promote_to_host = spacetimedb.reducer(
    {
        userId: t.u32(),
    },
    (ctx, { userId }) => {
        const moderator = ensureModerator(ctx);

        // Find the target user
        const targetUser = ctx.db.User.id.find(userId);
        if (!targetUser) {
            throw new SenderError('Target user not found.');
        }

        // Cannot promote yourself
        if (userId === moderator.id) {
            throw new SenderError('You cannot change your own role via this reducer.');
        }

        // Validate target role is User (promoting User → TournamentHost only)
        if (targetUser.role.tag !== 'User') {
            throw new SenderError(
                `Can only promote users with the "User" role to TournamentHost. Current role: ${targetUser.role.tag}`
            );
        }

        // Update user role to TournamentHost
        ctx.db.User.id.update({
            ...targetUser,
            role: { tag: 'TournamentHost', value: {} } as any,
            ...auditUpdate(ctx, targetUser, moderator.id),
        } as any);

        console.log(`[ADMIN] User #${userId} promoted to TournamentHost by moderator #${moderator.id}`);
    }
);

// ─── mod_demote_from_host ─────────────────────────────────────────────────────
// Demotes a TournamentHost back to User.
// Permission: Moderator or Admin only.
// Constraint: can only demote from TournamentHost role (not other roles).

export const mod_demote_from_host = spacetimedb.reducer(
    {
        userId: t.u32(),
    },
    (ctx, { userId }) => {
        const moderator = ensureModerator(ctx);

        // Find the target user
        const targetUser = ctx.db.User.id.find(userId);
        if (!targetUser) {
            throw new SenderError('Target user not found.');
        }

        // Cannot demote yourself
        if (userId === moderator.id) {
            throw new SenderError('You cannot change your own role via this reducer.');
        }

        // Validate target role is TournamentHost (demoting TournamentHost → User only)
        if (targetUser.role.tag !== 'TournamentHost') {
            throw new SenderError(
                `Can only demote users with the "TournamentHost" role to User. Current role: ${targetUser.role.tag}`
            );
        }

        // Update user role to User
        ctx.db.User.id.update({
            ...targetUser,
            role: { tag: 'User', value: {} } as any,
            ...auditUpdate(ctx, targetUser, moderator.id),
        } as any);

        console.log(`[ADMIN] User #${userId} demoted from TournamentHost to User by moderator #${moderator.id}`);
    }
);
