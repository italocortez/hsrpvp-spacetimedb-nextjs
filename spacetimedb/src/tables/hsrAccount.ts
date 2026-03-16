import { table, t } from 'spacetimedb/server';

export const hsrAccountColumns = {
    id: t.u32().primaryKey().autoInc(),
    userId: t.u32(),
    uid: t.string(),
    region: t.string(),
    displayLabel: t.string(),
    isActive: t.bool(),
    isRosterPublic: t.bool(),
    isRatingPublic: t.bool(),
    isDuplicateUid: t.bool(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const HsrAccount = table({
    name: 'hsr_account',
    public: true,
    indexes: [
        { name: 'hsr_account_user_id', accessor: 'hsr_account_user_id', algorithm: 'btree', columns: ['userId'] },
        { name: 'hsr_account_uid', accessor: 'hsr_account_uid', algorithm: 'btree', columns: ['uid'] },
    ],
}, hsrAccountColumns);
