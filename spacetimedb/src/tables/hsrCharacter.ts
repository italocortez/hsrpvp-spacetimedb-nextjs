import { table, t } from 'spacetimedb/server';
import { Path, Element, CharRole } from '../types/enums';

export const hsrCharacterColumns = {
    name: t.string().primaryKey(),
    displayName: t.string(),
    aliases: t.array(t.string()),
    rarity: t.u8(),
    path: Path,
    element: Element,
    role: CharRole,
    imageUrl: t.string(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

// People from the forums say we dont need "name": XXXXXXXXX on indexes anymore
export const HsrCharacter = table({
    name: 'hsr_character',
    public: true,
    indexes: [
        { accessor: 'by_path', algorithm: 'btree', columns: ['path'] },
        { accessor: 'by_element', algorithm: 'btree', columns: ['element'] },
        { accessor: 'by_role', algorithm: 'btree', columns: ['role'] },
    ]
}, hsrCharacterColumns);