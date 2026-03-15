import { table, t } from 'spacetimedb/server';
import { SuperimpositionCost } from '../types/structs';

export const hsrLightconeCostColumns = {
    lightconeName: t.string().primaryKey(),
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
}, hsrLightconeCostColumns);