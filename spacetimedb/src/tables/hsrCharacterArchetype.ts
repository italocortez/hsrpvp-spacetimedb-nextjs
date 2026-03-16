import { table, t } from 'spacetimedb/server';

export const hsrCharacterArchetypeColumns = {
    characterName: t.string(),
    archetypeId: t.u32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const HsrCharacterArchetype = table({
    name: 'hsr_character_archetype',
    public: true,
    primaryKey: ['characterName', 'archetypeId'],
    indexes: [
        { name: 'hsr_char_arch_char', accessor: 'hsr_char_arch_char', algorithm: 'btree', columns: ['characterName'] },
        { name: 'hsr_char_arch_arch', accessor: 'hsr_char_arch_arch', algorithm: 'btree', columns: ['archetypeId'] },
    ],
}, hsrCharacterArchetypeColumns);
