import { table, t } from 'spacetimedb/server';
import { Role } from '../types/enums';

export const User = table({
    name: 'user',
    public: true,
    indexes: [
        { name: 'user_discord_id', accessor: 'user_discord_id', algorithm: 'btree', columns: ['discordId'] },
    ]
}, {
    identity: t.identity().primaryKey(),
    username: t.string().unique(),
    displayName: t.string(),
    isGuest: t.bool(),
    lastLoginAt: t.timestamp(),
    role: Role,
    discordId: t.string().optional(),
    avatarCharacterName: t.string(), // FK reference to HsrCharacter name
});