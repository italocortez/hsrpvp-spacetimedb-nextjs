import { table, t } from 'spacetimedb/server';
import { MatchResultStatus } from '../types/enums';

export const matchResultColumns = {
    id: t.u32().primaryKey().autoInc(),
    bracketMatchId: t.u32().optional(),
    lobbyId: t.u32(),
    player1Id: t.u32(),
    player2Id: t.u32(),
    isTournamentMatch: t.bool(),
    status: MatchResultStatus,
    winnerId: t.u32().optional(),
    mmrProcessedAt: t.timestamp().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const MatchResultRecord = table({
    name: 'match_result_record',
    public: true,
    indexes: [
        { name: 'mr_lobby', accessor: 'mr_lobby', algorithm: 'btree', columns: ['lobbyId'] },
        { name: 'mr_player1', accessor: 'mr_player1', algorithm: 'btree', columns: ['player1Id'] },
        { name: 'mr_player2', accessor: 'mr_player2', algorithm: 'btree', columns: ['player2Id'] },
    ],
}, matchResultColumns);
