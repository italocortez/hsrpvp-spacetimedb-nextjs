import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { Identity } from 'spacetimedb';
import { auditInsert, auditUpdate, SYSTEM_USER_ID } from '../helpers/auditColumns';
import { performUserDeletion } from '../helpers/userDeletionHelper';
import { rejectIfBanned } from '../helpers/banHelper';

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
 * Also creates a SYSTEM user for audit trail purposes.
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
    const systemUser = ctx.db.User.insert({
        id: 0,
        username: 'SYSTEM',
        displayName: 'SYSTEM',
        isGuest: false,
        isOnline: false,
        isPrivate: false,
        lastLoginAt: ctx.timestamp,
        role: { tag: 'Admin' },
        hasDiscordLinked: false,
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
 * Server-only reducer: link an OAuth provider to a user identity.
 * Replaces server_link_discord with a unified, extensible approach.
 * Currently supports: discord (only provider in scope).
 *
 * Called by the Next.js API route after verifying the OAuth session.
 *
 * The callerIdentityHex is the verified SpacetimeDB identity hex of the
 * end-user (verified via ephemeral connection in the API route).
 */
export const server_link_provider = spacetimedb.reducer({
    callerIdentityHex: t.string(),
    provider: t.string(),       // 'discord' -- extensible for future providers
    providerId: t.string(),
    providerName: t.string(),
}, (ctx, { callerIdentityHex, provider, providerId, providerName }) => {
    // 1. Verify caller is the trusted server
    requireServer(ctx);
    const systemUserId = SYSTEM_USER_ID;

    // 2. Validate inputs
    if (!providerId || providerId.length === 0) {
        throw new SenderError('providerId is required');
    }
    if (!providerName || providerName.length === 0) {
        throw new SenderError('providerName is required');
    }
    if (!callerIdentityHex || callerIdentityHex.length === 0) {
        throw new SenderError('callerIdentityHex is required');
    }

    // 3. Validate provider and map to BanType
    const validProviders = ['discord'];
    if (!validProviders.includes(provider)) {
        throw new SenderError(`Invalid provider "${provider}". Must be one of: ${validProviders.join(', ')}`);
    }
    const banType = { tag: 'DiscordId', value: {} } as any;  // Only discord for now

    // 4. Ban check (D-08 enforcement point 1: link-time)
    rejectIfBanned(ctx, banType, providerId);

    // 5. Resolve the end-user's identity -> UserIdentity -> User
    let callerIdentity: any;
    try {
        callerIdentity = Identity.fromString(callerIdentityHex);
    } catch {
        throw new SenderError('callerIdentityHex is not a valid identity');
    }
    const userMapping: any = ctx.db.UserIdentity.identity.find(callerIdentity);

    let currentUser: any = null;
    if (userMapping) {
        currentUser = ctx.db.User.id.find(userMapping.userId);
    }

    // 6. Check if a UserPrivate row with this providerId already exists
    const existingByProvider = [...ctx.db.UserPrivate.user_private_discord_id.filter(providerId)];
    const providerOwnerPrivate = existingByProvider.length > 0 ? existingByProvider[0] : null;
    const providerOwner = providerOwnerPrivate ? ctx.db.User.id.find(providerOwnerPrivate.userId) : null;

    if (currentUser) {
        if (providerOwner && providerOwner.id !== currentUser.id) {
            // Case 1b: Identity currently points to a different user (guest),
            // but the provider account belongs to an existing verified user.
            // Re-point identity to the provider owner, clean up orphaned guest.
            const oldGuestId = currentUser.id;
            const wasGuest = currentUser.isGuest;

            ctx.db.UserIdentity.identity.update({
                ...userMapping,
                userId: providerOwner.id,
                lastSeenAt: ctx.timestamp,
                ...auditUpdate(ctx, userMapping, systemUserId),
            });

            ctx.db.User.id.update({
                ...providerOwner,
                lastLoginAt: ctx.timestamp,
                ...auditUpdate(ctx, providerOwner, systemUserId),
            });

            if (wasGuest) {
                const remainingLinks = [...ctx.db.UserIdentity.user_id.filter(oldGuestId)];
                if (remainingLinks.length === 0) {
                    performUserDeletion(ctx, oldGuestId, systemUserId);
                }
            }
            return;
        }

        // Case 1a / 1c: Upgrade guest or refresh provider info
        // Update User table
        ctx.db.User.id.update({
            ...currentUser,
            username: currentUser.isGuest ? providerName : currentUser.username,
            displayName: currentUser.isGuest ? providerName : currentUser.displayName,
            isGuest: false,
            hasDiscordLinked: true,
            lastLoginAt: ctx.timestamp,
            ...auditUpdate(ctx, currentUser, systemUserId),
        });
        ctx.db.UserIdentity.identity.update({
            ...userMapping,
            lastSeenAt: ctx.timestamp,
            ...auditUpdate(ctx, userMapping, systemUserId),
        });

        // Upsert UserPrivate row
        const existingPrivate = ctx.db.UserPrivate.userId.find(currentUser.id);
        if (existingPrivate) {
            ctx.db.UserPrivate.userId.update({
                ...existingPrivate,
                discordId: providerId,
                discordUsername: providerName,
                ...auditUpdate(ctx, existingPrivate, systemUserId),
            });
        } else {
            ctx.db.UserPrivate.insert({
                userId: currentUser.id,
                discordId: providerId,
                discordUsername: providerName,
                email: undefined,
                ...auditInsert(ctx, systemUserId),
            });
        }
        return;
    }

    // No UserIdentity mapping exists for this identity yet
    if (providerOwner) {
        // Case 2: Cross-device login -- client must call login_as_guest first.
        throw new SenderError('Identity not registered. Call login_as_guest first.');
    }

    // Case 3: Same problem -- can't create UserIdentity without the Identity object.
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
    const systemUserId = SYSTEM_USER_ID;

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

    performUserDeletion(ctx, targetUser.id, SYSTEM_USER_ID);
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
    const systemUserId = SYSTEM_USER_ID;

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
