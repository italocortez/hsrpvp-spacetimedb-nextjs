import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';

/**
 * Helper: verify the caller is the registered server identity.
 */
function requireServer(ctx: any) {
    const server = ctx.db.ServerIdentity.identity.find(ctx.sender);
    if (!server) {
        throw new SenderError('Forbidden: caller is not the registered server identity.');
    }
    return server;
}

/**
 * Bootstrap reducer: register the calling identity as the trusted server.
 * Only works when no server identity exists yet (first-come-first-served).
 * To re-register, clear-publish the database first.
 *
 * Run via: npx tsx scripts/register-server.ts
 */
export const register_server = spacetimedb.reducer((ctx) => {
    const existing = [...ctx.db.ServerIdentity.iter()];
    if (existing.length > 0) {
        throw new SenderError('Server identity already registered. To re-register, clear the database first.');
    }

    ctx.db.ServerIdentity.insert({
        identity: ctx.sender,
        registeredAt: ctx.timestamp,
    });
});

/**
 * Server-only reducer: link a Discord account to a user identity.
 * Called by the Next.js API route after verifying the Discord OAuth session.
 *
 * The callerIdentityHex is the SpacetimeDB identity hex of the end-user's
 * browser client. The server passes it along so we know which UserIdentity
 * to update.
 */
export const server_link_discord = spacetimedb.reducer({
    callerIdentityHex: t.string(),
    discordId: t.string(),
    discordUsername: t.string(),
}, (ctx, { callerIdentityHex, discordId, discordUsername }) => {
    // 1. Verify caller is the trusted server
    requireServer(ctx);

    // 2. Validate inputs
    if (!discordId || discordId.length === 0) {
        throw new SenderError('discordId is required');
    }
    if (!discordUsername || discordUsername.length === 0) {
        throw new SenderError('discordUsername is required');
    }
    if (!callerIdentityHex || callerIdentityHex.length === 0) {
        throw new SenderError('callerIdentityHex is required');
    }

    // 3. Resolve the end-user's identity → UserIdentity → User
    //    We need to find the UserIdentity row by iterating (identity is an object,
    //    and we only have the hex string from the API route).
    let userMapping: any = null;
    for (const row of ctx.db.UserIdentity.iter()) {
        if (row.identity.toHexString() === callerIdentityHex) {
            userMapping = row;
            break;
        }
    }

    let currentUser: any = null;
    if (userMapping) {
        currentUser = ctx.db.User.id.find(userMapping.userId);
    }

    // 4. Check if a User with this discordId already exists
    const existingByDiscord = [...ctx.db.User.user_discord_id.filter(discordId)];
    const discordOwner = existingByDiscord.length > 0 ? existingByDiscord[0] : null;

    if (currentUser) {
        if (discordOwner && discordOwner.id !== currentUser.id) {
            // Case 1b: User's identity currently points to a different user (guest),
            // but the Discord account belongs to an existing verified user.
            // Re-point identity to the Discord owner, clean up orphaned guest.
            const oldGuestId = currentUser.id;
            const wasGuest = currentUser.isGuest;

            ctx.db.UserIdentity.identity.update({
                ...userMapping,
                userId: discordOwner.id,
                lastSeenAt: ctx.timestamp,
            });

            ctx.db.User.id.update({
                ...discordOwner,
                lastLoginAt: ctx.timestamp,
            });

            if (wasGuest) {
                const remainingLinks = [...ctx.db.UserIdentity.user_identity_user_id.filter(oldGuestId)];
                if (remainingLinks.length === 0) {
                    ctx.db.User.id.delete(oldGuestId);
                }
            }
            return;
        }

        // Case 1a / 1c: Upgrade guest or refresh Discord info
        ctx.db.User.id.update({
            ...currentUser,
            username: currentUser.isGuest ? discordUsername : currentUser.username,
            displayName: currentUser.isGuest ? discordUsername : currentUser.displayName,
            isGuest: false,
            discordId,
            lastLoginAt: ctx.timestamp,
        });
        ctx.db.UserIdentity.identity.update({
            ...userMapping,
            lastSeenAt: ctx.timestamp,
        });
        return;
    }

    // No UserIdentity mapping exists for this identity yet
    if (discordOwner) {
        // Case 2: Cross-device login — we need to create a UserIdentity for this hex.
        // But we only have the hex string, not the Identity object. We can't insert
        // a UserIdentity without the Identity type. So instead, we'll store the
        // discordId on a pending basis and let the client call login_as_guest first,
        // which creates the UserIdentity. Then this reducer upgrades it.
        //
        // For this to work, the client flow must be:
        //   1. Client connects → login_as_guest (creates UserIdentity + guest User)
        //   2. Client authenticates Discord → API route calls server_link_discord
        //
        // Since login_as_guest always runs first (AuthGate), the mapping will exist.
        throw new SenderError('Identity not registered. Call login_as_guest first.');
    }

    // Case 3: Same problem — can't create UserIdentity without the Identity object.
    throw new SenderError('Identity not registered. Call login_as_guest first.');
});

/**
 * Server-only reducer: promote a user to Admin role.
 * Called via: npx tsx scripts/promote-admin.ts <username>
 */
export const server_promote_admin = spacetimedb.reducer({
    username: t.string(),
}, (ctx, { username }) => {
    requireServer(ctx);

    if (!username || username.length === 0) {
        throw new SenderError('username is required');
    }

    // Find user by iterating (username is unique but not indexed for filter)
    let targetUser: any = null;
    for (const row of ctx.db.User.iter()) {
        if (row.username === username) {
            targetUser = row;
            break;
        }
    }

    if (!targetUser) {
        throw new SenderError(`User "${username}" not found`);
    }

    ctx.db.User.id.update({
        ...targetUser,
        role: { tag: 'Admin' },
    });
});
