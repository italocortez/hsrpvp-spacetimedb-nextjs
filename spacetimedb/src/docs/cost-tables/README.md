# Cost Tables (Game Data)

## Tables

```
CostSet (NEW — Phase 03-01: named cost sets for different tournament configurations)
│  id (PK, autoInc)
│  name, creatorId → User.id
│  gameMode → GameMode enum
│  isPublished, isDraft, isLocked
│  [public table — clients can read published cost sets]
│
│  Draft Cost Set tables (private — not broadcast to clients):
│  ├── CostSetDraftCharacter  PK: [costSetId, characterName, gameMode]
│  ├── CostSetDraftLightcone  PK: [costSetId, lightconeName, gameMode]
│  └── CostSetDraftSynergy    PK: [costSetId, sourceName, targetName, gameMode]
│

HsrCharacter (character definitions — admin-managed)
│  name (PK), displayName, aliases[], rarity
│  path (Path enum), element (Element enum), role (CharRole enum)
│  imageUrl
│
├── HsrCharacterCost (draft cost per character per game mode per cost set)
│     PK: [characterName, gameMode, costSetId]  ← costSetId added Phase 03-01 (DESTRUCTIVE)
│     characterName → HsrCharacter.name
│     gameMode      → GameMode enum
│     costSetId     → 0 = default set (sentinel value), or CostSet.id
│     classicCosts  → EidolonCost struct (cost at each eidolon level)
│     auctionBaseBid → EidolonCost struct (auction mode base bids)
│
HsrLightcone (lightcone definitions — admin-managed)
│  name (PK), displayName, aliases[], path, rarity, imageUrl
│  posX, posY, width (for visual positioning)
│
├── HsrLightconeCost (draft cost per lightcone per game mode per cost set)
│     PK: [lightconeName, gameMode, costSetId]  ← costSetId added Phase 03-01 (DESTRUCTIVE)
│     lightconeName → HsrLightcone.name
│     gameMode      → GameMode enum
│     costSetId     → 0 = default, or CostSet.id
│     classicCosts  → SuperimpositionCost struct
│     auctionBaseBid → SuperimpositionCost struct
│
└── HsrSynergyCost (cost modifier when two characters are drafted together)
      id (PK, autoInc)
      sourceName, targetName → HsrCharacter.name
      gameMode → GameMode enum
      costModifier (f32)
      costSetId → 0 = default, or CostSet.id
```

## Flow

1. Admin bulk-uploads character/lightcone data via `admin_bulk_upsert` reducer
2. Cost tables define how much each character/lightcone "costs" in draft per game mode
3. `costSetId = 0` is the sentinel for the default cost set (backward-compatible)
4. Tournaments reference `costSetId` for non-default cost configurations
5. During draft, costs are read to calculate team budget and roster advantage
6. Account rating (HsrAccount) is calculated from roster composition using cost tables

## Key Decisions

- All game data tables are admin-managed — players cannot modify
- `costSetId = 0` is the default cost set sentinel — existing rows belong to set 0
- Composite PKs with `[..., costSetId]` allow per-tournament custom cost configurations
- Draft CostSet tables are private — admins/TOs can edit in-progress cost sets without clients seeing the draft
- HsrCharacterCost and HsrLightconeCost PK expansion required --clear-database (Phase 03-01)
- Strict key + enum validation in admin_bulk_upsert prevents malformed data
