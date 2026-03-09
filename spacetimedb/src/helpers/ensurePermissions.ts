import { SenderError } from 'spacetimedb/server';

/**
 * Resolves ctx.sender (identity) → UserIdentity → User.
 * Returns both the mapping row and the User row.
 * Throws if the identity is not linked to any user.
 */
export function getAuthenticatedUser(ctx: any) {
    const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
    if (!mapping) {
        throw new SenderError("Unauthorized: No user linked to this identity.");
    }
    const user = ctx.db.User.id.find(mapping.userId);
    if (!user) {
        throw new SenderError("Unauthorized: User record not found.");
    }
    return user;
}

/**
 * Ensures the sender is an Admin.
 */
export function ensureAdmin(ctx: any) {
    const user = getAuthenticatedUser(ctx);
    if (user.role.tag !== 'Admin') {
        throw new SenderError("Forbidden: Requires Admin privileges.");
    }
    return user;
}

/**
 * Ensures the sender is a TournamentHost OR an Admin.
 */
export function ensureTournamentHost(ctx: any) {
    const user = getAuthenticatedUser(ctx);
    if (user.role.tag !== 'TournamentHost' && user.role.tag !== 'Admin') {
        throw new SenderError("Forbidden: Requires Tournament Host or Admin privileges.");
    }
    return user;
}
