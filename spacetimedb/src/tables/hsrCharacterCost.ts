import { table, t } from 'spacetimedb/server';
import { GameMode } from '../types/enums';
import { EidolonCost } from '../types/structs';

export const hsrCharacterCostColumns = {
    characterName: t.string(),
    gameMode: GameMode,
    classicCosts: EidolonCost,
    auctionBaseBid: EidolonCost,
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const HsrCharacterCost = table({
    name: 'hsr_character_cost',
    public: true,
    primaryKey: ['characterName', 'gameMode'],
}, hsrCharacterCostColumns);