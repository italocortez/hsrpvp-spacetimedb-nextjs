import { table, t } from 'spacetimedb/server';

export const teamColumns = {
    id: t.u32().primaryKey().autoInc(),
    name: t.string().unique(),
    ownerId: t.u32(),
    isAdHoc: t.bool(),
    tournamentId: t.u32().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const Team = table({
    name: 'team',
    public: true,
    indexes: [
        { accessor: 'owner_id', algorithm: 'btree', columns: ['ownerId'] },
    ],
}, teamColumns);
