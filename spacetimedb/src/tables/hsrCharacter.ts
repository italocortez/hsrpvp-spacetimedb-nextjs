import { table, t } from 'spacetimedb/server';
import { Path, Element, CharRole } from '../types/enums';

export const HsrCharacter = table({
    name: 'hsr_character',
    public: true,
    indexes: [
        { name: 'character_by_path', algorithm: 'btree', columns: ['path'] },
        { name: 'character_by_element', algorithm: 'btree', columns: ['element'] },
        { name: 'character_by_role', algorithm: 'btree', columns: ['role'] },
    ]
}, {
    name: t.string().primaryKey(),
    displayName: t.string(),
    aliases: t.array(t.string()),
    rarity: t.u8(),
    path: Path,
    element: Element,
    role: CharRole,
    imageUrl: t.string(),
});