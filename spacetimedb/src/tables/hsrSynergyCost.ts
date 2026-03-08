import { table, t } from 'spacetimedb/server';
import { GameMode } from '../types/enums';

export const HsrSynergyCost = table({
    name: 'hsr_synergy_cost',
    public: true,
    indexes: [
        { name: 'synergy_source_mode', accessor: 'synergy_source_mode', algorithm: 'btree', columns: ['sourceName', 'gameMode'] },
        { name: 'synergy_target', accessor: 'synergy_target', algorithm: 'btree', columns: ['targetName'] },
    ]
}, {
    id: t.u32().primaryKey().autoInc(),
    sourceName: t.string(),
    targetName: t.string(),
    gameMode: GameMode,
    costModifier: t.f32(),
});