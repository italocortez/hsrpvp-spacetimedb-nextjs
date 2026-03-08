import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';

/**
 * Login as a guest user.
 * Creates a new User row with isGuest=true and a generated guest name.
 * If the caller already has a user record, this is a no-op (returns silently).
 */
export const login_as_guest = spacetimedb.reducer((ctx) => {
    // Check if user already exists
    const existing = ctx.db.User.identity.find(ctx.sender);
    if (existing) {
        // Already registered — just update lastLoginAt
        ctx.db.User.identity.update({
            ...existing,
            lastLoginAt: ctx.timestamp,
        });
        return;
    }

    // Generate a guest username from the identity hex (first 8 chars)
    const shortId = ctx.sender.toHexString().slice(0, 8);
    const guestUsername = `Guest_${shortId}`;

    ctx.db.User.insert({
        identity: ctx.sender,
        username: guestUsername,
        displayName: guestUsername,
        isGuest: true,
        lastLoginAt: ctx.timestamp,
        role: { tag: 'User' },
        discordId: undefined,
        avatarCharacterName: '',
    });
});

/**
 * Register/link a Discord account to the caller's identity.
 * - If the caller has no user record, creates a verified (non-guest) user.
 * - If the caller is a guest, upgrades them to a verified user with Discord info.
 * - If the caller is already verified, updates their Discord info.
 *
 * discordId:       The Discord user ID (snowflake string)
 * discordUsername:  The Discord username (e.g. "nath#1234" or "nath")
 * avatarUrl:        Optional Discord avatar URL (not stored, but could be used later)
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

    const existing = ctx.db.User.identity.find(ctx.sender);

    if (existing) {
        // Update existing user — upgrade guest or refresh Discord info
        ctx.db.User.identity.update({
            ...existing,
            username: discordUsername,
            displayName: existing.isGuest ? discordUsername : existing.displayName,
            isGuest: false,
            discordId,
            lastLoginAt: ctx.timestamp,
        });
    } else {
        // Create new verified user
        ctx.db.User.insert({
            identity: ctx.sender,
            username: discordUsername,
            displayName: discordUsername,
            isGuest: false,
            lastLoginAt: ctx.timestamp,
            role: { tag: 'User' },
            discordId,
            avatarCharacterName: '',
        });
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

    const existing = ctx.db.User.identity.find(ctx.sender);
    if (!existing) {
        throw new SenderError('User not found — login first');
    }

    ctx.db.User.identity.update({
        ...existing,
        displayName: trimmed,
    });
});

/**
 * Update the caller's avatar character.
 * The characterName should reference an existing HsrCharacter name.
 */
export const update_avatar = spacetimedb.reducer({
    characterName: t.string(),
}, (ctx, { characterName }) => {
    const existing = ctx.db.User.identity.find(ctx.sender);
    if (!existing) {
        throw new SenderError('User not found — login first');
    }

    ctx.db.User.identity.update({
        ...existing,
        avatarCharacterName: characterName,
    });
});
