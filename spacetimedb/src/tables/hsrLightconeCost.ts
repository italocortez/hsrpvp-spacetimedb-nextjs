import { table, t } from 'spacetimedb/server';
import { GameMode } from '../types/enums';
import { SuperimpositionCost } from '../types/structs';

export const hsrLightconeCostColumns = {
    lightconeName: t.string(),
    gameMode: GameMode,
    classicCosts: SuperimpositionCost,
    auctionBaseBid: SuperimpositionCost,
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const HsrLightconeCost = table({
    name: 'hsr_lightcone_cost',
    public: true,
    primaryKey: ['lightconeName', 'gameMode'],
}, hsrLightconeCostColumns);
