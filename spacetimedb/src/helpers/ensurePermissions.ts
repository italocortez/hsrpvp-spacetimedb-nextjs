import { SenderError } from 'spacetimedb/server';

/**
 * Retrieves the User record for the sender. Throws if not registered.
 */
export function getAuthenticatedUser(ctx: any) {
    // We access the database directly through the runtime context object
    const userQuery = ctx.db.User.identity.find(ctx.sender);
    if (!userQuery) {
        throw new SenderError("Unauthorized: User not found for this identity.");
    }
    return userQuery;
}

/**
 * Ensures the sender is an Admin.
 */
export function ensureAdmin(ctx: any) {
    const user = getAuthenticatedUser(ctx);
    if (!('Admin' in user.role)) {
        throw new SenderError("Forbidden: Requires Admin privileges.");
    }
    return user;
}

/**
 * Ensures the sender is a TournamentHost OR an Admin.
 */
export function ensureTournamentHost(ctx: any) {
    const user = getAuthenticatedUser(ctx);
    if (!('TournamentHost' in user.role) && !('Admin' in user.role)) {
        throw new SenderError("Forbidden: Requires Tournament Host or Admin privileges.");
    }
    return user;
}