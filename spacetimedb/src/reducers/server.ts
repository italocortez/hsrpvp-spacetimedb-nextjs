import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { Identity, Timestamp } from 'spacetimedb';
import { auditInsert, auditUpdate, SYSTEM_USER_ID } from '../helpers/auditColumns';
import { performUserDeletion } from '../helpers/userDeletionHelper';
import { rejectIfBanned, DISCORD_BAN_TYPE } from '../helpers/banHelper';

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
    const banType = DISCORD_BAN_TYPE;  // Only discord for now

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
/**
 * Server-only reducer: set a datetime field on a supported table.
 * General-purpose timestamp manipulation for testing time-dependent behavior
 * (e.g. aging identities past GC TTL, backdating lobby creation).
 *
 * Supported table/field combos:
 *   user_identity / lastSeenAt    — GC TTL testing
 *   user_identity / createdDate   — creation age testing
 *   lobby / createdDate           — lobby GC age testing
 *
 * Called via server-token connection (test harness scripts).
 */
export const server_set_datetime = spacetimedb.reducer({
    tableName: t.string(),
    primaryKey: t.string(),
    field: t.string(),
    timestampMicros: t.string(),  // BigInt micros as string
}, (ctx, { tableName, primaryKey, field, timestampMicros }) => {
    requireServer(ctx);

    const ts = new Timestamp(BigInt(timestampMicros));

    if (tableName === 'user_identity') {
        const identity = Identity.fromString(primaryKey);
        const row = ctx.db.UserIdentity.identity.find(identity);
        if (!row) throw new SenderError(`UserIdentity not found for identity ${primaryKey.slice(0, 16)}...`);

        if (field === 'lastSeenAt') {
            ctx.db.UserIdentity.identity.update({
                ...row,
                lastSeenAt: ts,
                lastModifiedById: SYSTEM_USER_ID,
                lastModifiedDate: ctx.timestamp,
            });
        } else if (field === 'createdDate') {
            ctx.db.UserIdentity.identity.update({
                ...row,
                createdDate: ts,
                lastModifiedById: SYSTEM_USER_ID,
                lastModifiedDate: ctx.timestamp,
            });
        } else {
            throw new SenderError(`Unsupported field "${field}" for user_identity. Supported: lastSeenAt, createdDate`);
        }
    } else if (tableName === 'lobby') {
        const lobbyId = parseInt(primaryKey, 10);
        if (isNaN(lobbyId)) throw new SenderError(`Invalid lobby ID: ${primaryKey}`);
        const row = ctx.db.Lobby.id.find(lobbyId);
        if (!row) throw new SenderError(`Lobby #${lobbyId} not found`);

        if (field === 'createdDate') {
            ctx.db.Lobby.id.update({
                ...row,
                createdDate: ts,
                lastModifiedById: SYSTEM_USER_ID,
                lastModifiedDate: ctx.timestamp,
            });
        } else {
            throw new SenderError(`Unsupported field "${field}" for lobby. Supported: createdDate`);
        }
    } else {
        throw new SenderError(`Unsupported table "${tableName}". Supported: user_identity, lobby`);
    }
});

/**
 * Server-only reducer: force a user's isOnline flag.
 * Test utility — maincloud disconnect detection can be delayed 30-60s,
 * making it unreliable in test windows. This lets tests explicitly
 * set a user offline before running GC or other online-sensitive logic.
 */
export const server_set_online = spacetimedb.reducer({
    userId: t.u32(),
    isOnline: t.bool(),
}, (ctx, { userId, isOnline }) => {
    requireServer(ctx);

    const user = ctx.db.User.id.find(userId);
    if (!user) throw new SenderError(`User #${userId} not found`);

    ctx.db.User.id.update({
        ...user,
        isOnline,
        ...auditUpdate(ctx, user, SYSTEM_USER_ID),
    });
});

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

/**
 * Server-only reducer: wipe all test state from non-seed tables.
 *
 * Fast alternative to `spacetime publish --clear-database` + post-publish.ts
 * (expected ~100ms vs ~11s) for tests that need a clean slate mid-suite or
 * for suite-level afterAll cleanup.
 *
 * Preserves:
 *   - ServerIdentity
 *   - SYSTEM user (id=0) and its UserIdentity mapping
 *   - Seed data: HsrCharacter, HsrLightcone, HsrCharacterCost, HsrLightconeCost,
 *     HsrSynergyCost, Archetype, HsrCharacterArchetype
 *   - Starter achievements: Achievement + AchievementCriteria
 *   - Config: EloConfigTable, AccountRatingConfig
 *   - Scheduled jobs: IdentityGcJob, LobbyGcJob (seeded by post-publish.ts)
 *
 * Deletes everything else: users (except SYSTEM), rosters, lobbies, tournaments,
 * match sessions + history, chat, stats, cost sets, calendar events, leaderboards,
 * pending user deletion jobs, bans, gc audit logs.
 *
 * Safety:
 *   - Gated by requireServer() — only callable with SPACETIMEDB_SERVER_TOKEN
 *   - Requires confirmation="NUKE_TEST_DATA" to prevent accidental invocation
 *   - DO NOT CALL IN PRODUCTION
 */
export const server_nuke_test_data = spacetimedb.reducer({
    confirmation: t.string(),
}, (ctx, { confirmation }) => {
    requireServer(ctx);

    if (confirmation !== 'NUKE_TEST_DATA') {
        throw new SenderError(
            'server_nuke_test_data requires confirmation="NUKE_TEST_DATA". ' +
            'This reducer wipes all test state and must never be called in production.'
        );
    }

    let totalDeleted = 0;

    // Helper: delete all rows from a table. iter() snapshot is spread into an
    // array first to avoid mutating during iteration.
    const nuke = (tableAccessor: any, name: string): number => {
        const rows = [...tableAccessor.iter()];
        for (const row of rows) {
            tableAccessor.delete(row);
        }
        if (rows.length > 0) {
            console.log(`[NUKE] ${name}: ${rows.length}`);
        }
        return rows.length;
    };

    // Delete order: children before parents is not strictly required
    // (SpacetimeDB does not enforce FKs) but follows the natural dependency
    // graph for readability.

    // ── Match session ephemeral
    totalDeleted += nuke(ctx.db.MatchSessionStep, 'MatchSessionStep');
    totalDeleted += nuke(ctx.db.MatchSession, 'MatchSession');

    // ── Match result ephemeral
    totalDeleted += nuke(ctx.db.MatchResultGame, 'MatchResultGame');
    totalDeleted += nuke(ctx.db.MatchResultParticipant, 'MatchResultParticipant');
    totalDeleted += nuke(ctx.db.MatchResultRecord, 'MatchResultRecord');

    // ── Match history (permanent under normal ops; wiped on nuke)
    totalDeleted += nuke(ctx.db.MatchSessionStepHistory, 'MatchSessionStepHistory');
    totalDeleted += nuke(ctx.db.MatchSessionHistory, 'MatchSessionHistory');
    totalDeleted += nuke(ctx.db.MatchParticipantHistory, 'MatchParticipantHistory');
    totalDeleted += nuke(ctx.db.MatchResultGameHistory, 'MatchResultGameHistory');
    totalDeleted += nuke(ctx.db.PlayerRelationship, 'PlayerRelationship');

    // ── Lobby ephemeral (children first)
    totalDeleted += nuke(ctx.db.LobbyCursorEvent, 'LobbyCursorEvent');
    totalDeleted += nuke(ctx.db.LobbyMemberAccount, 'LobbyMemberAccount');
    totalDeleted += nuke(ctx.db.LobbyMember, 'LobbyMember');
    totalDeleted += nuke(ctx.db.LobbyBan, 'LobbyBan');
    totalDeleted += nuke(ctx.db.LobbyPassword, 'LobbyPassword');
    totalDeleted += nuke(ctx.db.LobbyPreset, 'LobbyPreset');
    totalDeleted += nuke(ctx.db.Lobby, 'Lobby');

    // ── Bracket + group phase
    totalDeleted += nuke(ctx.db.BracketMatch, 'BracketMatch');
    totalDeleted += nuke(ctx.db.GroupPhaseRecord, 'GroupPhaseRecord');

    // ── Tournaments (children first)
    totalDeleted += nuke(ctx.db.TournamentStandIn, 'TournamentStandIn');
    totalDeleted += nuke(ctx.db.TournamentAssistant, 'TournamentAssistant');
    totalDeleted += nuke(ctx.db.TournamentTeamRequest, 'TournamentTeamRequest');
    totalDeleted += nuke(ctx.db.TournamentTeamMember, 'TournamentTeamMember');
    totalDeleted += nuke(ctx.db.TournamentTeam, 'TournamentTeam');
    totalDeleted += nuke(ctx.db.TournamentEnrolled, 'TournamentEnrolled');
    totalDeleted += nuke(ctx.db.TournamentPlayerAccount, 'TournamentPlayerAccount');
    totalDeleted += nuke(ctx.db.Tournament, 'Tournament');

    // ── Chat
    totalDeleted += nuke(ctx.db.ChatMessage, 'ChatMessage');

    // ── Stats, MMR, leaderboard
    totalDeleted += nuke(ctx.db.MmrHistory, 'MmrHistory');
    totalDeleted += nuke(ctx.db.MmrRating, 'MmrRating');
    totalDeleted += nuke(ctx.db.Leaderboard, 'Leaderboard');
    totalDeleted += nuke(ctx.db.PlayerCharacterStat, 'PlayerCharacterStat');
    totalDeleted += nuke(ctx.db.PlayerStat, 'PlayerStat');
    totalDeleted += nuke(ctx.db.GlobalCharacterStat, 'GlobalCharacterStat');

    // ── Calendar
    totalDeleted += nuke(ctx.db.CalendarEventInvite, 'CalendarEventInvite');
    totalDeleted += nuke(ctx.db.CalendarEvent, 'CalendarEvent');
    totalDeleted += nuke(ctx.db.SavedCalendar, 'SavedCalendar');
    totalDeleted += nuke(ctx.db.AvailabilitySlot, 'AvailabilitySlot');

    // ── Seasons
    totalDeleted += nuke(ctx.db.Season, 'Season');

    // ── Cost sets (user-defined; seed data lives in HsrCharacterCost etc.)
    totalDeleted += nuke(ctx.db.CostSetDraftSynergy, 'CostSetDraftSynergy');
    totalDeleted += nuke(ctx.db.CostSetDraftLightcone, 'CostSetDraftLightcone');
    totalDeleted += nuke(ctx.db.CostSetDraftCharacter, 'CostSetDraftCharacter');
    totalDeleted += nuke(ctx.db.CostSet, 'CostSet');

    // ── Rosters
    totalDeleted += nuke(ctx.db.HsrAccountCharacter, 'HsrAccountCharacter');
    totalDeleted += nuke(ctx.db.HsrAccount, 'HsrAccount');

    // ── User achievements (keep Achievement/AchievementCriteria seed data)
    totalDeleted += nuke(ctx.db.UserAchievement, 'UserAchievement');

    // ── GC audit
    totalDeleted += nuke(ctx.db.GcResult, 'GcResult');

    // ── Pending user deletion jobs (would fail referencing deleted users anyway)
    totalDeleted += nuke(ctx.db.UserDeletionJob, 'UserDeletionJob');

    // ── Bans
    totalDeleted += nuke(ctx.db.BanRecord, 'BanRecord');

    // ── Users: preserve the SYSTEM user and its auth chain.
    // SYSTEM_USER_ID is a SENTINEL (0) used for audit columns during bootstrap,
    // NOT the actual User.id of the SYSTEM row — User.id is autoInc, so the real
    // SYSTEM row gets whatever the first autoInc value was (typically 1). We
    // identify it by its unique username 'SYSTEM'.
    const systemUser = ctx.db.User.username.find('SYSTEM');
    const systemUserRowId = systemUser?.id;

    const userPrivates = [...ctx.db.UserPrivate.iter()]
        .filter((up: any) => systemUserRowId === undefined || up.userId !== systemUserRowId);
    for (const up of userPrivates) { ctx.db.UserPrivate.delete(up); }
    if (userPrivates.length > 0) console.log(`[NUKE] UserPrivate: ${userPrivates.length}`);
    totalDeleted += userPrivates.length;

    const userIdents = [...ctx.db.UserIdentity.iter()]
        .filter((ui: any) => systemUserRowId === undefined || ui.userId !== systemUserRowId);
    for (const ui of userIdents) { ctx.db.UserIdentity.delete(ui); }
    if (userIdents.length > 0) console.log(`[NUKE] UserIdentity: ${userIdents.length}`);
    totalDeleted += userIdents.length;

    const users = [...ctx.db.User.iter()]
        .filter((u: any) => systemUserRowId === undefined || u.id !== systemUserRowId);
    for (const u of users) { ctx.db.User.delete(u); }
    if (users.length > 0) console.log(`[NUKE] User: ${users.length}`);
    totalDeleted += users.length;

    console.log(`[NUKE] server_nuke_test_data complete: ${totalDeleted} rows deleted`);
});
