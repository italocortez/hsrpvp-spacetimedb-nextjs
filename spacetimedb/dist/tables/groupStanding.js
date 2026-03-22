import { table, t } from 'spacetimedb/server';
export const groupStandingColumns = {
    tournamentId: t.u32(),
    groupId: t.u32(),
    participantUserId: t.u32(),
    wins: t.u32(),
    losses: t.u32(),
    draws: t.u32(),
    points: t.u32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
export const GroupStanding = table({
    name: 'group_standing',
    public: true,
    primaryKey: ['tournamentId', 'groupId', 'participantUserId'],
    indexes: [
        { name: 'gs_tournament_group', accessor: 'gs_tournament_group', algorithm: 'btree', columns: ['tournamentId'] },
    ],
}, groupStandingColumns);
