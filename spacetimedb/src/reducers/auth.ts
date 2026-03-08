import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';

/**
 * Helper: resolve ctx.sender → UserIdentity → User.
 * Returns { mapping, user } or null if identity is not linked.
 */
function resolveUser(ctx: any) {
    const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
    if (!mapping) return null;
    const user = ctx.db.User.id.find(mapping.userId);
    if (!user) return null;
    return { mapping, user };
}

/**
 * Login as a guest user.
 * - If identity already linked → update lastLoginAt (no-op).
 * - Otherwise → create a new User + UserIdentity mapping.
 */
export const login_as_guest = spacetimedb.reducer((ctx) => {
    const resolved = resolveUser(ctx);
    if (resolved) {
        // Already registered — update lastLoginAt and lastSeenAt
        ctx.db.User.id.update({
            ...resolved.user,
            lastLoginAt: ctx.timestamp,
        });
        ctx.db.UserIdentity.identity.update({
            ...resolved.mapping,
            lastSeenAt: ctx.timestamp,
        });
        return;
    }

    // Generate a guest username from the identity hex (first 8 chars)
    const shortId = ctx.sender.toHexString().slice(0, 8);
    const guestUsername = `Guest_${shortId}`;

    // Create the User row (id is autoInc, pass 0)
    const newUser = ctx.db.User.insert({
        id: 0,
        username: guestUsername,
        displayName: guestUsername,
        isGuest: true,
        lastLoginAt: ctx.timestamp,
        role: { tag: 'User' },
        discordId: undefined,
        avatarCharacterName: 'march7th',
    });

    // Link this identity to the new user
    ctx.db.UserIdentity.insert({
        identity: ctx.sender,
        userId: newUser.id,
        lastSeenAt: ctx.timestamp,
    });
});

/**
 * Helper: delete a guest User if no identities remain linked to it.
 */
function cleanupOrphanedGuest(ctx: any, guestUserId: number) {
    const remainingLinks = [...ctx.db.UserIdentity.user_identity_user_id.filter(guestUserId)];
    if (remainingLinks.length === 0) {
        ctx.db.User.id.delete(guestUserId);
    }
}

/**
 * Register/link a Discord account.
 *
 * Case 1a: Identity linked to a user that already owns this discordId → refresh login.
 * Case 1b: Identity linked to a guest, but another user owns this discordId →
 *           re-point identity to the existing Discord user, delete orphaned guest.
 * Case 1c: Identity linked to a guest, discordId not taken → upgrade guest in-place.
 * Case 2:  Identity NOT linked, but a User with this discordId exists →
 *           link this identity to that existing user (cross-device login).
 * Case 3:  Neither → create a new verified user + link identity.
 */
export const register_discord_user = spacetimedb.reducer({
    discordId: t.string(),
    discordUsername: t.string(),
}, (ctx, { discordId, discordUsername }) => {
    if (!discordId || discordId.length === 0) {
        throw new SenderError('discordId is required');
    }
    if (!discordUsername || discordUsername.length === 0) {
        throw new SenderError('discordUsername is required');
    }

    // Check if a User with this discordId already exists
    const existingByDiscord = [...ctx.db.User.user_discord_id.filter(discordId)];
    const discordOwner = existingByDiscord.length > 0 ? existingByDiscord[0] : null;

    const resolved = resolveUser(ctx);

    if (resolved) {
        if (discordOwner && discordOwner.id !== resolved.user.id) {
            // Case 1b: Guest is linking Discord, but that Discord account belongs
            // to another user. Re-point this identity to the existing Discord user
            // and clean up the orphaned guest.
            const oldGuestId = resolved.user.id;
            const wasGuest = resolved.user.isGuest;

            // Update the identity mapping to point to the Discord owner
            ctx.db.UserIdentity.identity.update({
                identity: ctx.sender,
                userId: discordOwner.id,
                lastSeenAt: ctx.timestamp,
            });

            // Update lastLoginAt on the Discord owner
            ctx.db.User.id.update({
                ...discordOwner,
                lastLoginAt: ctx.timestamp,
            });

            // If the old user was a guest, clean it up if no other identities remain
            if (wasGuest) {
                cleanupOrphanedGuest(ctx, oldGuestId);
            }
            return;
        }

        // Case 1a / 1c: Either already owns this discordId, or discordId is unclaimed.
        // Upgrade guest or refresh Discord info on the current user.
        ctx.db.User.id.update({
            ...resolved.user,
            username: resolved.user.isGuest ? discordUsername : resolved.user.username,
            displayName: resolved.user.isGuest ? discordUsername : resolved.user.displayName,
            isGuest: false,
            discordId,
            lastLoginAt: ctx.timestamp,
        });
        ctx.db.UserIdentity.identity.update({
            ...resolved.mapping,
            lastSeenAt: ctx.timestamp,
        });
        return;
    }

    // Identity not linked yet
    if (discordOwner) {
        // Case 2: Cross-device login — link this new identity to the existing user
        ctx.db.UserIdentity.insert({
            identity: ctx.sender,
            userId: discordOwner.id,
            lastSeenAt: ctx.timestamp,
        });
        ctx.db.User.id.update({
            ...discordOwner,
            lastLoginAt: ctx.timestamp,
        });
        return;
    }

    // Case 3: Brand new verified user
    const newUser = ctx.db.User.insert({
        id: 0,
        username: discordUsername,
        displayName: discordUsername,
        isGuest: false,
        lastLoginAt: ctx.timestamp,
        role: { tag: 'User' },
        discordId,
        avatarCharacterName: 'march7th',
    });

    ctx.db.UserIdentity.insert({
        identity: ctx.sender,
        userId: newUser.id,
        lastSeenAt: ctx.timestamp,
    });
});

/**
 * Delete a guest account permanently.
 * Only works for guest users (no Discord linked).
 * Removes the UserIdentity mapping and the User row.
 */
export const delete_guest_account = spacetimedb.reducer((ctx) => {
    const resolved = resolveUser(ctx);
    if (!resolved) {
        throw new SenderError('No account found for this identity.');
    }
    if (!resolved.user.isGuest) {
        throw new SenderError('Only guest accounts can be deleted this way. Verified accounts persist across devices.');
    }

    // Delete the UserIdentity mapping for this identity
    ctx.db.UserIdentity.identity.delete(ctx.sender);

    // Check if any other identities still point to this user
    const remainingLinks = [...ctx.db.UserIdentity.user_identity_user_id.filter(resolved.user.id)];
    if (remainingLinks.length === 0) {
        // No more identities linked — safe to delete the User row
        ctx.db.User.id.delete(resolved.user.id);
    }
});

/**
 * Update the caller's display name.
 * Only non-empty strings are accepted. Max 32 characters.
 */
export const update_display_name = spacetimedb.reducer({
    newDisplayName: t.string(),
}, (ctx, { newDisplayName }) => {
    const trimmed = newDisplayName.trim();
    if (trimmed.length === 0) {
        throw new SenderError('Display name cannot be empty');
    }
    if (trimmed.length > 32) {
        throw new SenderError('Display name must be 32 characters or fewer');
    }

    const resolved = resolveUser(ctx);
    if (!resolved) {
        throw new SenderError('User not found — login first');
    }

    ctx.db.User.id.update({
        ...resolved.user,
        displayName: trimmed,
    });
});

/**
 * Update the caller's username.
 * Only verified (non-guest) users with a linked Discord can change their username.
 * Uniqueness is enforced by the database constraint.
 */
export const update_username = spacetimedb.reducer({
    newUsername: t.string(),
}, (ctx, { newUsername }) => {
    const trimmed = newUsername.trim();
    if (trimmed.length === 0) {
        throw new SenderError('Username cannot be empty');
    }
    if (trimmed.length > 32) {
        throw new SenderError('Username must be 32 characters or fewer');
    }

    const resolved = resolveUser(ctx);
    if (!resolved) {
        throw new SenderError('User not found — login first');
    }
    if (resolved.user.isGuest) {
        throw new SenderError('Guest users cannot change their username. Link your Discord account first.');
    }

    ctx.db.User.id.update({
        ...resolved.user,
        username: trimmed,
    });
});

/**
 * Update the caller's avatar character.
 * The characterName should reference an existing HsrCharacter name.
 */
export const update_avatar = spacetimedb.reducer({
    characterName: t.string(),
}, (ctx, { characterName }) => {
    const resolved = resolveUser(ctx);
    if (!resolved) {
        throw new SenderError('User not found — login first');
    }

    ctx.db.User.id.update({
        ...resolved.user,
        avatarCharacterName: characterName,
    });
});
