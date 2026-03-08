import { t } from 'spacetimedb/server';
import spacetimedb from '../schema';
import { SenderError } from 'spacetimedb/server';

const DEFAULT_AVATAR = "match7th";

export const register_guest = spacetimedb.reducer(
    { displayName: t.string() },
    (ctx, { displayName }) => {
        const existingUser = ctx.db.User.identity.find(ctx.sender);

        if (existingUser) {
            ctx.db.User.identity.update({
                ...existingUser,
                displayName,
                lastLoginAt: ctx.timestamp,
            });
            return;
        }

        ctx.db.User.insert({
            identity: ctx.sender,
            username: `guest_${ctx.sender.toHexString().substring(0, 24)}`,
            displayName: displayName,
            isGuest: true,
            lastLoginAt: ctx.timestamp,
            role: { tag: 'User' },
            discordId: undefined,
            avatarCharacterName: DEFAULT_AVATAR,
        });
    }
);

export const register_discord_user = spacetimedb.reducer(
    {
        discordId: t.string(),
        username: t.string(),
        displayName: t.string(),
    },
    (ctx, { discordId, username, displayName }) => {
        // 1. Fast O(1) lookup first
        const existingUser = ctx.db.User.identity.find(ctx.sender);

        // 2. Only do the expensive O(N) table scan if necessary.
        if (!existingUser || existingUser.discordId !== discordId) {
            // Using .some() is faster than .find() because it stops searching 
            // the millisecond it finds a single match.
            const isTaken = Array.from(ctx.db.User.iter()).some(
                user => user.discordId === discordId
            );

            if (isTaken) {
                throw new Error("This Discord ID is already registered to another user.");
            }
        }

        // 3. Proceed with Update or Insert
        if (existingUser) {
            ctx.db.User.identity.update({
                ...existingUser,
                username,
                displayName,
                discordId,
                lastLoginAt: ctx.timestamp,
                isGuest: false,
            });
            return;
        }

        ctx.db.User.insert({
            identity: ctx.sender,
            username,
            displayName,
            isGuest: false,
            lastLoginAt: ctx.timestamp,
            role: { tag: 'User' },
            discordId,
            avatarCharacterName: DEFAULT_AVATAR,
        });
    }
);