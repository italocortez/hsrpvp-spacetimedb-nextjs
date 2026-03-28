import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { auditInsert, auditUpdate, SYSTEM_USER_ID } from '../helpers/auditColumns';
import { performUserDeletion } from '../helpers/userDeletionHelper';

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
 * Helper: get the system user (discordId = "1"). Created during register_server.
 */
function getSystemUserId(ctx: any): number {
    const results = [...ctx.db.User.discord_id.filter('1')];
    return results.length > 0 ? results[0].id : SYSTEM_USER_ID;
}

/**
 * Bootstrap reducer: register the calling identity as the trusted server.
 * Only works when no server identity exists yet (first-come-first-served).
 * Also creates a SYSTEM user (discordId = "1") for audit trail purposes.
 *
 * Run via: npx tsx scripts/register-server.ts
 */
export const register_server = spacetimedb.reducer((ctx) => {
    // iter() required: checking table emptiness — no count/isEmpty API exists, and PK is identity (unknown value)
    const existing = [...ctx.db.ServerIdentity.iter()];
    if (existing.length > 0) {
        throw new SenderError('Server identity already registered. To re-register, clear the database first.');
    }

    // Register the server identity (no audit columns on this table)
    ctx.db.ServerIdentity.insert({
        identity: ctx.sender,
        registeredAt: ctx.timestamp,
    });

    // Create the SYSTEM user — the first user in the database.
    // discordId = "1" is the sentinel for the system account.
    const systemUser = ctx.db.User.insert({
        id: 0,
        username: 'SYSTEM',
        displayName: 'SYSTEM',
        isGuest: false,
        isOnline: false,
        isPrivate: false,
        lastLoginAt: ctx.timestamp,
        role: { tag: 'Admin' },
        discordId: '1',
        avatarCharacterName: 'march7th',
        displayedAchievementId: undefined,
        deletedAt: undefined,
        ...auditInsert(ctx, SYSTEM_USER_ID),
    });

    // Link server identity to SYSTEM user so server-token connections
    // pass getAuthenticatedUser/ensureAdmin checks (e.g. seed-data.ts)
    ctx.db.UserIdentity.insert({
        identity: ctx.sender,
        userId: systemUser.id,
        lastSeenAt: ctx.timestamp,
        ...auditInsert(ctx, SYSTEM_USER_ID),
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
    const systemUserId = getSystemUserId(ctx);

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
    //    iter() required: identity is an opaque object with no fromHexString() constructor.
    //    The API route only provides the hex string, so we must scan and compare via .toHexString().
    //    This is a one-shot operation (once per user lifetime) so O(n) on ~600 rows is negligible.
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
    const existingByDiscord = [...ctx.db.User.discord_id.filter(discordId)];
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
                ...auditUpdate(ctx, userMapping, systemUserId),
            });

            ctx.db.User.id.update({
                ...discordOwner,
                lastLoginAt: ctx.timestamp,
                ...auditUpdate(ctx, discordOwner, systemUserId),
            });

            if (wasGuest) {
                const remainingLinks = [...ctx.db.UserIdentity.user_id.filter(oldGuestId)];
                if (remainingLinks.length === 0) {
                    performUserDeletion(ctx, oldGuestId, systemUserId);
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
            ...auditUpdate(ctx, currentUser, systemUserId),
        });
        ctx.db.UserIdentity.identity.update({
            ...userMapping,
            lastSeenAt: ctx.timestamp,
            ...auditUpdate(ctx, userMapping, systemUserId),
        });
        return;
    }

    // No UserIdentity mapping exists for this identity yet
    if (discordOwner) {
        // Case 2: Cross-device login — client must call login_as_guest first.
        throw new SenderError('Identity not registered. Call login_as_guest first.');
    }

    // Case 3: Same problem — can't create UserIdentity without the Identity object.
    throw new SenderError('Identity not registered. Call login_as_guest first.');
});

/**
 * Server-only reducer: set a user's role.
 * Called via: npx tsx scripts/manage-user.ts set-role <username> <role>
 */
export const server_set_role = spacetimedb.reducer({
    username: t.string(),
    roleTag: t.string(),
}, (ctx, { username, roleTag }) => {
    requireServer(ctx);
    const systemUserId = getSystemUserId(ctx);

    if (!username || username.length === 0) {
        throw new SenderError('username is required');
    }

    const validRoles = ['Admin', 'Moderator', 'TournamentHost', 'User'];
    if (!validRoles.includes(roleTag)) {
        throw new SenderError(`Invalid role "${roleTag}". Must be one of: ${validRoles.join(', ')}`);
    }

    // Use unique index instead of .iter()
    const targetUser = ctx.db.User.username.find(username);
    if (!targetUser) {
        throw new SenderError(`User "${username}" not found`);
    }

    ctx.db.User.id.update({
        ...targetUser,
        role: { tag: roleTag, value: {} } as any,
        ...auditUpdate(ctx, targetUser, systemUserId),
    });
});

/**
 * Server-only reducer: delete a user by username.
 * Called via: npx tsx scripts/manage-user.ts delete <username>
 * Guest users with no history references are hard-deleted; others are soft-deleted.
 */
export const server_delete_user = spacetimedb.reducer({
    username: t.string(),
}, (ctx, { username }) => {
    requireServer(ctx);

    if (!username || username.length === 0) {
        throw new SenderError('username is required');
    }

    // Use unique index instead of .iter()
    const targetUser = ctx.db.User.username.find(username);
    if (!targetUser) {
        throw new SenderError(`User "${username}" not found`);
    }

    const systemUserId = getSystemUserId(ctx);
    performUserDeletion(ctx, targetUser.id, systemUserId);
});

/**
 * Server-only reducer: set MMR rating for a user.
 * Upserts MmrRating row for the given userId + gameMode.
 * Useful for test seeding and future admin tools.
 *
 * Called via server-token connection (e.g. test harness or manage-user.ts).
 */
export const server_set_mmr = spacetimedb.reducer({
    userId: t.u32(),
    gameMode: t.string(),
    rating: t.u32(),
}, (ctx, { userId, gameMode, rating }) => {
    requireServer(ctx);
    const systemUserId = getSystemUserId(ctx);

    const user = ctx.db.User.id.find(userId);
    if (!user) {
        throw new SenderError(`User #${userId} not found`);
    }

    const validModes = ['MemoryOfChaos', 'ApocalypticShadow', 'AnomalyArbitration'];
    if (!validModes.includes(gameMode)) {
        throw new SenderError(`Invalid gameMode "${gameMode}". Must be one of: ${validModes.join(', ')}`);
    }

    // Filter by userId, then find matching gameMode in memory
    const existing = [...ctx.db.MmrRating.user_id.filter(userId)]
        .find((r: any) => r.gameMode.tag === gameMode);

    if (existing) {
        // Delete + re-insert (composite PK)
        ctx.db.MmrRating.delete(existing);
        ctx.db.MmrRating.insert({
            ...existing,
            rating,
            ...auditUpdate(ctx, existing, systemUserId),
        } as any);
    } else {
        ctx.db.MmrRating.insert({
            userId,
            gameMode: { tag: gameMode, value: {} } as any,
            rating,
            matchesPlayed: 0,
            globalCompositeRating: undefined,
            seasonId: undefined,
            ...auditInsert(ctx, systemUserId),
        } as any);
    }
});
