# Cost Tables (Game Data) -- Architecture

Last updated: 2026-04-09

## Overview

Cost tables store the admin-managed game data definitions for HSR characters, lightcones, and synergy cost modifiers. These tables are the source of truth for draft costs. `HsrCharacter` and `HsrLightcone` hold game entity definitions; their associated cost tables (`HsrCharacterCost`, `HsrLightconeCost`, `HsrSynergyCost`) store per-game-mode, per-cost-set pricing. All writes to these tables go through `admin_bulk_upsert` or the cost-set publish workflow. Players cannot write to any of these tables.

## Table Relationships

```
HsrCharacter (name: string PK)  [public: true]
  +-- displayName: string
  +-- aliases: string[]
  +-- rarity: u8
  +-- path: Path (Destruction | Hunt | Erudition | Harmony | Nihility | Preservation | Abundance | Remembrance)
  +-- element: Element (Fire | Ice | Wind | Lightning | Physical | Quantum | Imaginary)
  +-- role: CharRole (Dps | Support | Sustain)
  +-- imageUrl: string
  +-- versionReleased: f64
  +-- treatAsVersion: f64 (override version for rating weight calculation)
  +-- audit columns
  Indexes: by_path (btree), by_element (btree), by_role (btree)

  +-- HsrCharacterCost (PK: [characterName, gameMode, costSetId])  [public: true]
  |     characterName -> HsrCharacter.name
  |     gameMode: GameMode
  |     costSetId: u32 (0=default sentinel, or CostSet.id)  [btree: cost_set_id]
  |     classicCosts: EidolonCost struct (e0-e6 numeric fields)
  |     auctionBaseBid: EidolonCost struct
  |     audit columns
  |     Indexes: cost_set_id (btree), by_character_mode_and_set (btree, [characterName, gameMode, costSetId])

HsrLightcone (name: string PK)  [public: true]
  +-- displayName: string
  +-- aliases: string[]
  +-- path: Path
  +-- rarity: u8
  +-- imageUrl: string
  +-- posX: i32 (CSS positioning correction)
  +-- posY: i32
  +-- width: i32
  +-- audit columns
  Indexes: by_path (btree)

  +-- HsrLightconeCost (PK: [lightconeName, gameMode, costSetId])  [public: true]
        lightconeName -> HsrLightcone.name
        gameMode: GameMode
        costSetId: u32 (0=default sentinel, or CostSet.id)  [btree: cost_set_id]
        classicCosts: SuperimpositionCost struct (s1-s5 numeric fields)
        auctionBaseBid: SuperimpositionCost struct
        audit columns
        Indexes: cost_set_id (btree)

HsrSynergyCost (id: u32 autoInc PK)  [public: true]
  +-- sourceName -> HsrCharacter.name
  +-- targetName -> HsrCharacter.name
  +-- gameMode: GameMode
  +-- costModifier: f32
  +-- costSetId: u32 (0=default sentinel, or CostSet.id)
  +-- audit columns
  Indexes: source_mode (btree, [sourceName, gameMode]), target_name (btree, targetName), cost_set_id (btree)
```

## Reducer Flows

### admin_bulk_upsert(tableName, jsonData) -- for game data tables
1. `ensureAdmin(ctx)` -- requires Admin role
2. Parse `jsonData` as JSON array; `validateKeys(rows, tableName)` -- reject if row keys don't match exactly expected columns
3. Per-table switch:
   - **HsrCharacter**: validate path/element/role enum tags; upsert by `name` PK. Auto-triggers `maxPossible` recalculation and rating recalc for all accounts if `maxPossible` changes (D-33)
   - **HsrLightcone**: validate path enum tag; upsert by `name` PK
   - **HsrCharacterCost**: validate gameMode enum tag; iter-find by [characterName, gameMode] composite; delete+insert
   - **HsrLightconeCost**: validate gameMode enum tag; iter-find by [lightconeName, gameMode] composite; delete+insert
   - **HsrSynergyCost**: validate gameMode enum tag; iter-find by [sourceName, targetName, gameMode]; upsert via `id.update()` if exists, insert if not
   - **Archetype**: upsert by unique name (see archetypes/architecture.md)

### admin_delete_row(tableName, primaryKeyJson) -- for game data tables
1. `ensureAdmin(ctx)` -- requires Admin role
2. Per-table switch:
   - **HsrCharacter**: delete by `name` PK
   - **HsrLightcone**: delete by `name` PK
   - **HsrCharacterCost**: iter-find by `{ characterName, gameModeTag }` JSON key; delete row
   - **HsrLightconeCost**: iter-find by `{ lightconeName, gameModeTag }` JSON key; delete row
   - **HsrSynergyCost**: delete by autoInc `id`

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| All game data tables admin-managed -- players cannot modify | Phase 01 CONTEXT.md | 2026-02-01 |
| costSetId=0 sentinel for default cost set -- backward-compatible with pre-cost-set rows | Phase 03 execution | 2026-02-15 |
| Composite PKs with [..., costSetId] allow per-tournament custom cost configurations | Phase 03 execution | 2026-02-15 |
| HsrCharacterCost and HsrLightconeCost PK expansion required --clear-database (Phase 03-01) | Phase 03 execution | 2026-02-15 |
| Strict key + enum validation in admin_bulk_upsert prevents malformed data | Phase 02 execution | 2026-02-10 |
| versionReleased and treatAsVersion added to HsrCharacter for age-weight account rating calculation | Phase 11 execution | 2026-04-01 |
| admin_bulk_upsert HsrCharacter auto-triggers rating recalc if maxPossible changes (D-33) | Phase 11 execution | 2026-04-01 |
| HsrCharacter.role (CharRole enum: Dps/Support/Sustain) used in rating role-exponent formula | Phase 11 execution | 2026-04-01 |
| posX, posY, width on HsrLightcone for CSS positioning corrections in UI | Phase 02 execution | 2026-02-10 |
| Normalized to standard template | Phase 13 normalization | 2026-04-09 |

---

*Last updated: 2026-04-09*
*Feature owner: Phase 01 / Phase 03 / Phase 11*

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
