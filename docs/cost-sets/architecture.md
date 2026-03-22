# Cost Set Management

## Overview

Cost sets define the point values for characters, lightcones, and synergies used in drafts. Tournament organizers (TOs) create custom cost sets via a draft/publish workflow that keeps unfinished edits private until they are ready to broadcast.

## Table Relationships

```
CostSet (PK: id autoInc, public: true)
  id           — auto-incremented identifier
  name         — human-readable label (1–100 chars)
  creatorId    — FK to User.id (the TO who created this set)
  gameMode     — GameMode enum (MemoryOfChaos | ApocalypticShadow | AnomalyArbitration)
  isPublished  — true after publish_cost_set; false for drafts and after unpublish
  isDraft      — true while editable; false after publish_cost_set
  isLocked     — true after lock_cost_set; required precursor to unpublish
  audit columns

Private draft tables (public: false — not broadcast to clients):
├── CostSetDraftCharacter (PK: [costSetId, characterName, gameMode])
│     costSetId, characterName, gameMode, classicCosts (EidolonCost), auctionBaseBid (EidolonCost)
│     Index: cost_set_id
│
├── CostSetDraftLightcone (PK: [costSetId, lightconeName, gameMode])
│     costSetId, lightconeName, gameMode, classicCosts (SuperimpositionCost), auctionBaseBid (SuperimpositionCost)
│     Index: cost_set_id
│
└── CostSetDraftSynergy (PK: [costSetId, sourceName, targetName, gameMode])
      costSetId, sourceName, targetName, gameMode, costModifier (f32)
      Index: cost_set_id

Live cost tables (public: true — broadcast to all subscribers):
├── HsrCharacterCost (PK: [characterName, gameMode, costSetId])
│     characterName, gameMode, classicCosts, auctionBaseBid, costSetId
│     Index: cost_set_id
│
├── HsrLightconeCost (PK: [lightconeName, gameMode, costSetId])
│     lightconeName, gameMode, classicCosts, auctionBaseBid, costSetId
│     Index: cost_set_id
│
└── HsrSynergyCost (PK: id autoInc)
      id, sourceName, targetName, gameMode, costModifier, costSetId
      Indexes: source_mode [sourceName, gameMode], target_name, cost_set_id
```

## Draft/Publish Workflow

```
create_cost_set (clone from source)
        |
        v
  CostSet metadata row inserted
  isDraft=true, isPublished=false
        |
        v
  CostSetDraft* tables populated
  (private — only TO can see via views)
        |
        v
edit_draft_*_cost (repeat as needed)
        |
        v
publish_cost_set
        |
        v
  Draft rows copied → HsrCharacterCost / HsrLightconeCost / HsrSynergyCost
  CostSet: isDraft=false, isPublished=true
  CostSetDraft* rows deleted
        |
        v
  (cost data now visible to all subscribers via live tables)
        |
        v
lock_cost_set (optional — prevents new lobbies from selecting this set)
        |
        v
unpublish_cost_set (requires isLocked=true)
  CostSet: isPublished=false, isLocked=false
  (live rows remain — just metadata toggled)
        |
        v
delete_cost_set (requires isPublished=false)
  Cascades: deletes all HsrCharacterCost / HsrLightconeCost / HsrSynergyCost rows
  + any remaining draft rows + CostSet metadata row
```

## Key Rules

- **costSetId=0** is the sentinel for the default (system) cost set. It cannot be locked, unpublished, or deleted via these reducers.
- **Draft tables are private** — `CostSetDraftCharacter`, `CostSetDraftLightcone`, `CostSetDraftSynergy` have no `public: true`, so they are never broadcast to clients directly.
- **Per-user views** (`view_my_cost_sets`, `view_my_draft_character_costs`, `view_my_draft_lightcone_costs`, `view_my_draft_synergy_costs`) allow TOs to read only their own draft data.
- **Cost sets are per-game-mode** — one CostSet covers one GameMode. When cloning, only rows matching `gameModeTag` are copied.
- **Publish is atomic** — all three live tables are updated in the same transaction as the draft cleanup and metadata update.
- **Lock → unpublish → delete lifecycle** — enforced by `unpublish_cost_set` (checks `isLocked`) and `delete_cost_set` (checks `!isPublished`). Never delete live cost data directly via these reducers.
- **Ownership check** on all edit/publish/lock/unpublish/delete: `costSet.creatorId === user.id OR isRoleAtLeast(user.role, 'Moderator')`.

## Reducer Reference

| Reducer | Permission | Args | Description |
|---------|-----------|------|-------------|
| `create_cost_set` | TournamentHost+ | name, sourceSetId, gameModeTag | Creates draft by cloning from existing published set |
| `edit_draft_character_cost` | Creator or Moderator+ | costSetId, characterName, gameModeTag, classicCostsJson, auctionBaseBidJson | Upserts character cost in draft |
| `edit_draft_lightcone_cost` | Creator or Moderator+ | costSetId, lightconeName, gameModeTag, classicCostsJson, auctionBaseBidJson | Upserts lightcone cost in draft |
| `edit_draft_synergy_cost` | Creator or Moderator+ | costSetId, sourceName, targetName, gameModeTag, costModifier | Upserts synergy cost modifier in draft |
| `publish_cost_set` | Creator or Moderator+ | costSetId | Copies draft → live tables, marks set as published |
| `lock_cost_set` | Creator or Moderator+ | costSetId | Sets isLocked=true; prevents new selections |
| `unpublish_cost_set` | Creator or Moderator+ | costSetId | Requires locked; toggles isPublished=false |
| `delete_cost_set` | Creator or Moderator+ | costSetId | Requires unpublished; cascade-deletes all cost rows |

## Per-User Views

| View | Returns | Purpose |
|------|---------|---------|
| `view_my_cost_sets` | `CostSet[]` | All cost sets owned by the caller |
| `view_my_draft_character_costs` | `CostSetDraftCharacter[]` | Draft character costs across all of caller's sets |
| `view_my_draft_lightcone_costs` | `CostSetDraftLightcone[]` | Draft lightcone costs across all of caller's sets |
| `view_my_draft_synergy_costs` | `CostSetDraftSynergy[]` | Draft synergy costs across all of caller's sets |

All 4 views resolve `ctx.sender → UserIdentity → User`, then filter by `creatorId`.
