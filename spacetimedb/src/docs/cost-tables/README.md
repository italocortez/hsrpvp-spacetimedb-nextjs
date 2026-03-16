# Cost Tables (Game Data)

## Tables

```
HsrCharacter (character definitions — admin-managed)
│  name (PK), displayName, aliases[], rarity
│  path (Path enum), element (Element enum), role (CharRole enum)
│  imageUrl
│
├── HsrCharacterCost (draft cost per character per game mode)
│     PK: [characterName, gameMode]
│     characterName → HsrCharacter.name
│     gameMode      → GameMode enum
│     classicCosts  → EidolonCost struct (cost at each eidolon level)
│     auctionBaseBid → EidolonCost struct (auction mode base bids)
│
HsrLightcone (lightcone definitions — admin-managed)
│  name (PK), displayName, aliases[], path, rarity, imageUrl
│  posX, posY, width (for visual positioning)
│
├── HsrLightconeCost (draft cost per lightcone per game mode)
│     PK: [lightconeName, gameMode]
│     lightconeName → HsrLightcone.name
│     gameMode      → GameMode enum
│     classicCosts  → SuperimpositionCost struct
│     auctionBaseBid → SuperimpositionCost struct
│
└── HsrSynergyCost (cost modifier when two characters are drafted together)
      id (PK, autoInc)
      sourceName, targetName → HsrCharacter.name
      gameMode → GameMode enum
      costModifier (f32)
```

## Flow

1. Admin bulk-uploads character/lightcone data via `admin_bulk_upsert` reducer
2. Cost tables define how much each character/lightcone "costs" in draft per game mode
3. During draft, costs are read to calculate team budget and roster advantage
4. Account rating (HsrAccount) is calculated from roster composition using these cost tables

## Key Decisions

- All game data tables are admin-managed — players cannot modify
- Composite PKs with gameMode allow per-mode cost differentiation
- HsrLightconeCost gained `gameMode` as part of composite PK (parity with HsrCharacterCost)
- Strict key + enum validation in admin_bulk_upsert prevents malformed data
