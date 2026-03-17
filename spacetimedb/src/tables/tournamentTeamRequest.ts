import { table, t } from 'spacetimedb/server';

export const tournamentTeamRequestColumns = {
    teamId: t.u32(),
    userId: t.u32(),
    isPending: t.bool(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const TournamentTeamRequest = table({
    name: 'tournament_team_request',
    public: true,
    primaryKey: ['teamId', 'userId'],
    indexes: [
        { accessor: 'team_id', algorithm: 'btree', columns: ['teamId'] },
        { accessor: 'user_id', algorithm: 'btree', columns: ['userId'] },
    ],
}, tournamentTeamRequestColumns);
