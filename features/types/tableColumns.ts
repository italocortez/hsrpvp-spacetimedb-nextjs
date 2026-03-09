// Frontend mirror of upsert-eligible table columns.
// Derived from spacetimedb/src/tables/*.ts — keep in sync when columns change.
// Auto-inc columns (e.g. HsrSynergyCost.id) are excluded since upsert payloads don't include them.

export const UPSERT_TABLE_COLUMNS = {
    HsrCharacter: ['name', 'displayName', 'aliases', 'rarity', 'path', 'element', 'role', 'imageUrl'],
    HsrLightcone: ['name', 'displayName', 'aliases', 'path', 'rarity', 'imageUrl', 'posX', 'posY', 'width'],
    HsrCharacterCost: ['characterName', 'gameMode', 'classicCosts', 'auctionBaseBid'],
    HsrLightconeCost: ['lightconeName', 'classicCosts', 'auctionBaseBid'],
    HsrSynergyCost: ['sourceName', 'targetName', 'gameMode', 'costModifier'],
} as const;

export type UpsertTableName = keyof typeof UPSERT_TABLE_COLUMNS;

// Which columns hold enum values, per upsert table (column name → enum key in ENUM_VALUES)
export const TABLE_ENUM_COLUMNS: Record<UpsertTableName, Record<string, string>> = {
    HsrCharacter: { path: 'path', element: 'element', role: 'role' },
    HsrLightcone: { path: 'path' },
    HsrCharacterCost: { gameMode: 'gameMode' },
    HsrLightconeCost: {},
    HsrSynergyCost: { gameMode: 'gameMode' },
};
