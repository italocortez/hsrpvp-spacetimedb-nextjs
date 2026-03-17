import { table, t } from 'spacetimedb/server';

export const characterStatsColumns = {
    userId: t.u32(),
    characterName: t.string(),
    wins: t.u32(),
    losses: t.u32(),
    matchesPlayed: t.u32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const CharacterStats = table({
    name: 'character_stats',
    public: true,
    primaryKey: ['userId', 'characterName'],
    indexes: [
        { accessor: 'user_id', algorithm: 'btree', columns: ['userId'] },
    ],
}, characterStatsColumns);
