import { table, t } from 'spacetimedb/server';
import { GameMode } from '../types/enums';
import { SuperimpositionCost } from '../types/structs';

export const hsrLightconeCostColumns = {
    lightconeName: t.string(),
    gameMode: GameMode,
    classicCosts: SuperimpositionCost,
    auctionBaseBid: SuperimpositionCost,
    costSetId: t.u32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const HsrLightconeCost = table({
    name: 'hsr_lightcone_cost',
    public: true,
    primaryKey: ['lightconeName', 'gameMode'],
    indexes: [
        { name: 'lc_cost_set_id', accessor: 'lc_cost_set_id', algorithm: 'btree', columns: ['costSetId'] },
    ],
}, hsrLightconeCostColumns);
