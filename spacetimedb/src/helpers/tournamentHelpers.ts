import { SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser, isRoleAtLeast } from './ensurePermissions';

// Forward-only stage order (Cancelled is handled separately as a terminal transition)
const STAGE_ORDER = ['Draft', 'Registration', 'Seeding', 'InProgress', 'Completed'];

/**
 * Validates a tournament stage transition.
 * Transitions must be forward-only and cannot skip stages.
 * Cancellation is always allowed from any non-terminal state.
 */
export function validateStageTransition(currentTag: string, nextTag: string): void {
    // Cancellation is always allowed from any non-terminal state
    if (nextTag === 'Cancelled') {
        if (currentTag === 'Completed' || currentTag === 'Cancelled') {
            throw new SenderError(`Cannot cancel a tournament that is already ${currentTag}.`);
        }
        return;
    }
    const currentIdx = STAGE_ORDER.indexOf(currentTag);
    const nextIdx = STAGE_ORDER.indexOf(nextTag);
    if (currentIdx === -1 || nextIdx === -1) {
        throw new SenderError(`Invalid stage: ${currentTag} or ${nextTag}`);
    }
    if (nextIdx <= currentIdx) {
        throw new SenderError(`Cannot transition from ${currentTag} to ${nextTag} (forward-only).`);
    }
    if (nextIdx > currentIdx + 1) {
        throw new SenderError(`Cannot skip stages: must go from ${currentTag} to ${STAGE_ORDER[currentIdx + 1]}.`);
    }
}

/**
 * Verifies the caller has access to manage the given tournament.
 * Access is granted to: Admin/Moderator (always), tournament organizer, tournament assistants.
 */
export function ensureTournamentAccess(ctx: any, tournamentId: number): { user: any; tournament: any } {
    const user = getAuthenticatedUser(ctx);
    const tournament = ctx.db.Tournament.id.find(tournamentId);
    if (!tournament) throw new SenderError('Tournament not found.');

    // Admin/Moderator always has access
    if (isRoleAtLeast(user.role, 'Moderator')) return { user, tournament };

    // TO who owns the tournament
    if (tournament.organizerId === user.id) return { user, tournament };

    // Tournament assistant
    const assistant = (ctx.db.TournamentAssistant as any).primaryKey.find({
        tournamentId, userId: user.id
    });
    if (assistant) return { user, tournament };

    throw new SenderError('Forbidden: Not authorized for this tournament.');
}
