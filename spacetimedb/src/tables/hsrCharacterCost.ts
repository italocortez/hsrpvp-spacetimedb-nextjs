import { table, t } from 'spacetimedb/server';
import { GameMode } from '../types/enums';
import { EidolonCost } from '../types/structs';

export const HsrCharacterCost = table({
    name: 'hsr_character_cost',
    public: true,
    primaryKey: ['characterName', 'gameMode'],
}, {
    characterName: t.string(),
    gameMode: GameMode,
    classicCosts: EidolonCost,
    auctionBaseBid: EidolonCost,
});