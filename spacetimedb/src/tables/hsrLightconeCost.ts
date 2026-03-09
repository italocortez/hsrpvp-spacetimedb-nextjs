import { table, t } from 'spacetimedb/server';
import { SuperimpositionCost } from '../types/structs';

export const hsrLightconeCostColumns = {
    lightconeName: t.string().primaryKey(),
    classicCosts: SuperimpositionCost,
    auctionBaseBid: SuperimpositionCost,
};

export const HsrLightconeCost = table({
    name: 'hsr_lightcone_cost',
    public: true,
}, hsrLightconeCostColumns);