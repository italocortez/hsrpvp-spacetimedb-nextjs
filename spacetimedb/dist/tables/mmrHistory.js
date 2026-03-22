import { table, t } from 'spacetimedb/server';
import { GameMode } from '../types/enums';
export const mmrHistoryColumns = {
    id: t.u32().primaryKey().autoInc(),
    userId: t.u32(),
    gameMode: GameMode,
    matchResultId: t.u32(),
    previousRating: t.u32(),
    newRating: t.u32(),
    delta: t.i32(),
    seasonId: t.u32().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
export const MmrHistory = table({
    name: 'mmr_history',
    public: true,
    indexes: [
        { name: 'mh_user_id', accessor: 'mh_user_id', algorithm: 'btree', columns: ['userId'] },
        { name: 'mh_match_result', accessor: 'mh_match_result', algorithm: 'btree', columns: ['matchResultId'] },
    ],
}, mmrHistoryColumns);
