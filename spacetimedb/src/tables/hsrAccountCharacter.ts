import { table, t } from 'spacetimedb/server';

export const hsrAccountCharacterColumns = {
    hsrAccountId: t.u32(),
    characterName: t.string(),
    eidolonLevel: t.u8(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const HsrAccountCharacter = table({
    name: 'hsr_account_character',
    public: true,
    primaryKey: ['hsrAccountId', 'characterName'],
    indexes: [
        { accessor: 'hsr_account_id', algorithm: 'btree', columns: ['hsrAccountId'] },
    ],
}, hsrAccountCharacterColumns);
