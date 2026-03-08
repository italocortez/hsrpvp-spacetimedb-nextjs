import { t } from 'spacetimedb/server';
import spacetimedb from '../schema';

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
        const existingUser = ctx.db.User.identity.find(ctx.sender);

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