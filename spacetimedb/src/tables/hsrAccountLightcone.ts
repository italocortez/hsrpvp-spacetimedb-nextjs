import { table, t } from 'spacetimedb/server';

export const hsrAccountLightconeColumns = {
    hsrAccountId: t.u32(),
    lightconeName: t.string(),
    superimpositionLevel: t.u8(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const HsrAccountLightcone = table({
    name: 'hsr_account_lightcone',
    public: true,
    primaryKey: ['hsrAccountId', 'lightconeName'],
    indexes: [
        { name: 'hsr_acc_lc_account_id', accessor: 'hsr_acc_lc_account_id', algorithm: 'btree', columns: ['hsrAccountId'] },
    ],
}, hsrAccountLightconeColumns);
