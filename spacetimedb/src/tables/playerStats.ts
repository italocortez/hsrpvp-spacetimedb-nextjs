import { table, t } from 'spacetimedb/server';

export const playerStatsColumns = {
    userId: t.u32().primaryKey(),
    matchesPlayed: t.u32(),
    wins: t.u32(),
    losses: t.u32(),
    draws: t.u32(),
    matchesSpectated: t.u32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const PlayerStats = table({
    name: 'player_stats',
    public: true,
    indexes: [
        { accessor: 'wins', algorithm: 'btree', columns: ['wins'] },
    ],
}, playerStatsColumns);
