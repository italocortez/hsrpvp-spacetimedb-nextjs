import { table, t } from 'spacetimedb/server';
import { GameMode } from '../types/enums';
import { EidolonCost } from '../types/structs';

export const hsrCharacterCostColumns = {
    characterName: t.string(),
    gameMode: GameMode,
    classicCosts: EidolonCost,
    auctionBaseBid: EidolonCost,
    costSetId: t.u32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const HsrCharacterCost = table({
    name: 'hsr_character_cost',
    public: true,
    primaryKey: ['characterName', 'gameMode'],
    indexes: [
        { name: 'char_cost_set_id', accessor: 'char_cost_set_id', algorithm: 'btree', columns: ['costSetId'] },
    ],
}, hsrCharacterCostColumns);