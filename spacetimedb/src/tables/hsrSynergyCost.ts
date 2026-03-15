import { table, t } from 'spacetimedb/server';
import { GameMode } from '../types/enums';

export const hsrSynergyCostColumns = {
    id: t.u32().primaryKey().autoInc(),
    sourceName: t.string(),
    targetName: t.string(),
    gameMode: GameMode,
    costModifier: t.f32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

// Columns expected in upsert payloads (excludes auto-inc id and audit columns)
const AUDIT_KEYS = ['createdById', 'createdDate', 'lastModifiedById', 'lastModifiedDate'];
export const hsrSynergyCostUpsertKeys = Object.keys(hsrSynergyCostColumns).filter(k => k !== 'id' && !AUDIT_KEYS.includes(k));

export const HsrSynergyCost = table({
    name: 'hsr_synergy_cost',
    public: true,
    indexes: [
        { name: 'synergy_source_mode', accessor: 'synergy_source_mode', algorithm: 'btree', columns: ['sourceName', 'gameMode'] },
        { name: 'synergy_target', accessor: 'synergy_target', algorithm: 'btree', columns: ['targetName'] },
    ]
}, hsrSynergyCostColumns);