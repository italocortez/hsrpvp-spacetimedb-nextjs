import { table, t } from 'spacetimedb/server';
import { SuperimpositionCost } from '../types/structs';

export const HsrLightconeCost = table({
    name: 'hsr_lightcone_cost',
    public: true,
}, {
    lightconeName: t.string().primaryKey(),
    classicCosts: SuperimpositionCost,
    auctionBaseBid: SuperimpositionCost,
});