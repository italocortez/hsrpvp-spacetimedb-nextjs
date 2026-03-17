import { table, t } from 'spacetimedb/server';
import { Role } from '../types/enums';

export const userColumns = {
    id: t.u32().primaryKey().autoInc(),
    username: t.string().unique(),
    displayName: t.string(),
    isGuest: t.bool(),
    isOnline: t.bool(),
    isPrivate: t.bool(),
    lastLoginAt: t.timestamp(),
    role: Role,
    discordId: t.string().optional(),
    avatarCharacterName: t.string(), // FK reference to HsrCharacter name
    deletedAt: t.timestamp().optional(), // Set by admin soft-delete; scheduled job hard-deletes after 5s
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const User = table({
    name: 'user',
    public: true,
    indexes: [
        { accessor: 'discord_id', algorithm: 'btree', columns: ['discordId'] },
    ]
}, userColumns);
