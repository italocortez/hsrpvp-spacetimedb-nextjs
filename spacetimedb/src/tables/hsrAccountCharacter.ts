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
        { name: 'hsr_acc_char_account_id', accessor: 'hsr_acc_char_account_id', algorithm: 'btree', columns: ['hsrAccountId'] },
    ],
}, hsrAccountCharacterColumns);
