# Cost Sets -- Architecture

Last updated: 2026-04-09

## Overview

Cost sets define per-game-mode point values for characters, lightcones, and synergies used in drafts. Tournament organizers create custom cost sets via a draft/publish workflow: edits stay private in draft tables until `publish_cost_set` copies them atomically to the live public tables. `costSetId=0` is the sentinel for the default (system) cost set and cannot be modified via these reducers.

## Table Relationships

```
CostSet (id: u32 autoInc PK)  [public: true]
  +-- name: string (1-100 chars)
  +-- creatorId -> User.id  [btree: creator_id]
  +-- gameMode: GameMode (MemoryOfChaos | ApocalypticShadow | AnomalyArbitration)
  +-- isPublished: bool
  +-- isDraft: bool
  +-- isLocked: bool
  +-- audit columns

Private draft tables (public: false -- not broadcast to clients):
  +-- CostSetDraftCharacter (PK: [costSetId, characterName, gameMode])
  |     costSetId -> CostSet.id  [btree: cost_set_id]
  |     characterName -> HsrCharacter.name
  |     gameMode: GameMode
  |     classicCosts: EidolonCost struct (e0-e6 numbers)
  |     auctionBaseBid: EidolonCost struct
  |
  +-- CostSetDraftLightcone (PK: [costSetId, lightconeName, gameMode])
  |     costSetId -> CostSet.id  [btree: cost_set_id]
  |     lightconeName -> HsrLightcone.name
  |     gameMode: GameMode
  |     classicCosts: SuperimpositionCost struct (s1-s5 numbers)
  |     auctionBaseBid: SuperimpositionCost struct
  |
  +-- CostSetDraftSynergy (PK: [costSetId, sourceName, targetName, gameMode])
        costSetId -> CostSet.id  [btree: cost_set_id]
        sourceName -> HsrCharacter.name
        targetName -> HsrCharacter.name
        gameMode: GameMode
        costModifier: f32

Live cost tables (public: true -- broadcast to all subscribers):
  +-- HsrCharacterCost (PK: [characterName, gameMode, costSetId])
  |     characterName -> HsrCharacter.name
  |     gameMode: GameMode
  |     costSetId -> CostSet.id (0=default)  [btree: cost_set_id]
  |     classicCosts: EidolonCost
  |     auctionBaseBid: EidolonCost
  |
  +-- HsrLightconeCost (PK: [lightconeName, gameMode, costSetId])
  |     lightconeName -> HsrLightcone.name
  |     gameMode: GameMode
  |     costSetId -> CostSet.id (0=default)  [btree: cost_set_id]
  |     classicCosts: SuperimpositionCost
  |     auctionBaseBid: SuperimpositionCost
  |
  +-- HsrSynergyCost (id: u32 autoInc PK)
        sourceName -> HsrCharacter.name
        targetName -> HsrCharacter.name
        gameMode: GameMode
        costModifier: f32
        costSetId -> CostSet.id (0=default)  [btree: cost_set_id]
        Indexes: source_mode (btree, [sourceName, gameMode]), target_name (btree), cost_set_id (btree)
```

## Reducer Flows

### create_cost_set(name, sourceSetId, gameModeTag)
1. `ensureTournamentHost(ctx)` -- requires TournamentHost+ role
2. Validate name length 1-100 chars (after trim)
3. Validate `gameModeTag` is a valid GameMode variant
4. If `sourceSetId != 0`: verify source exists and `isPublished=true`
5. Insert `CostSet` row (`isDraft=true`, `isPublished=false`, `isLocked=false`)
6. Clone from source: copy `HsrCharacterCost`, `HsrLightconeCost`, `HsrSynergyCost` rows matching `gameModeTag` into their respective `CostSetDraft*` tables (filtered via `cost_set_id` index)

### edit_draft_character_cost(costSetId, characterName, gameModeTag, classicCostsJson, auctionBaseBidJson)
1. `getAuthenticatedUser(ctx)` -- ownership check: `costSet.creatorId === user.id` OR Moderator+
2. Find `CostSet` -- reject if not found; reject if `!isDraft`
3. Parse and validate `classicCostsJson` and `auctionBaseBidJson` as `EidolonCost` objects (e0-e6 numeric fields)
4. Find existing draft row via `cost_set_id` index + in-memory filter; delete if found
5. Insert new `CostSetDraftCharacter` row (delete+insert composite PK upsert)

### edit_draft_lightcone_cost(costSetId, lightconeName, gameModeTag, classicCostsJson, auctionBaseBidJson)
1. Same ownership/draft-state checks as character variant
2. Parse and validate as `SuperimpositionCost` (s1-s5 numeric fields)
3. Delete+insert upsert on `CostSetDraftLightcone`

### edit_draft_synergy_cost(costSetId, sourceName, targetName, gameModeTag, costModifier)
1. Same ownership/draft-state checks
2. Delete+insert upsert on `CostSetDraftSynergy` (find by `cost_set_id` index + in-memory match)

### publish_cost_set(costSetId)
1. Ownership check -- creator or Moderator+; reject if `!isDraft`
2. Phase A: copy `CostSetDraftCharacter` -> `HsrCharacterCost` (delete existing live row then insert; preserves audit history via `auditUpdate` when overwriting)
3. Phase B: copy `CostSetDraftLightcone` -> `HsrLightconeCost` (same pattern)
4. Phase C: copy `CostSetDraftSynergy` -> `HsrSynergyCost` (existing live row: `id.update()` to preserve autoInc id; new row: insert)
5. Phase D: delete all `CostSetDraft*` rows for this `costSetId`
6. Phase E: update `CostSet` metadata: `isDraft=false`, `isPublished=true`

### lock_cost_set(costSetId)
1. Ownership check; reject `costSetId=0`; reject if not published; reject if already locked
2. `CostSet.id.update()` with `isLocked=true`

### unpublish_cost_set(costSetId)
1. Ownership check; reject `costSetId=0`; reject if not published; reject if `!isLocked` (must lock first)
2. `CostSet.id.update()` with `isPublished=false`, `isLocked=false`
3. Live cost rows remain -- only metadata toggled (rows persist until `delete_cost_set`)

### delete_cost_set(costSetId)
1. Ownership check; reject `costSetId=0`; reject if `isPublished=true` (must unpublish first)
2. Delete all `HsrCharacterCost` rows via `cost_set_id` index
3. Delete all `HsrLightconeCost` rows via `cost_set_id` index
4. Delete all `HsrSynergyCost` rows via `cost_set_id` index (by autoInc `id`)
5. Delete any remaining `CostSetDraft*` rows (all three tables)
6. Delete the `CostSet` metadata row

## View Definitions

| View | Returns | Purpose |
|------|---------|---------|
| `view_my_cost_sets` | `CostSet[]` | All cost sets owned by the caller (via `creator_id` index) |
| `view_my_draft_character_costs` | `CostSetDraftCharacter[]` | Caller's draft character costs across all owned sets |
| `view_my_draft_lightcone_costs` | `CostSetDraftLightcone[]` | Caller's draft lightcone costs |
| `view_my_draft_synergy_costs` | `CostSetDraftSynergy[]` | Caller's draft synergy costs |

All 4 views resolve `ctx.sender -> UserIdentity -> User`, then filter by `creatorId`.

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| costSetId=0 sentinel for default cost set -- existing rows belong to set 0 | Phase 03 CONTEXT.md | 2026-02-15 |
| Draft tables are private (no public:true) -- draft edits not broadcast to clients | Phase 03 execution | 2026-02-15 |
| publish_cost_set preserves audit history via auditUpdate when live row already exists (supports republishing) | Phase 03 execution | 2026-02-15 |
| HsrSynergyCost uses id.update() on publish (autoInc PK); character/lightcone use delete+insert (composite PK) | Phase 03 execution | 2026-02-15 |
| unpublish_cost_set does NOT delete live cost rows -- only toggles isPublished/isLocked metadata | Phase 03 execution | 2026-02-15 |
| iter() used in per-user draft views -- no cross-table (creatorId, costSetId) index | Phase 03 execution | 2026-02-15 |
| Normalized to standard template | Phase 13 normalization | 2026-04-09 |

---

*Last updated: 2026-04-09*
*Feature owner: Phase 03*

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
