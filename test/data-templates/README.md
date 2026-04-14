# Data Templates

Sample JSON files showing the raw format used in `test/data/*_table.json`.
Actual data files are gitignored — these templates exist for reference and onboarding.

**Canonical shape (Phase 15 D-22):** snake_case keys throughout; `cost` is a
wrapping object with `cost_set_id` (int, `0` = default sentinel) + one block per
game mode (`memory_of_chaos`, `apocalyptic_shadow`, `anomaly_arbitration`);
`positioning` is optional in JSON (convention: include with `{0,0,0}` when no
tweak) but DB columns are required `i32` with `0` defaults; Spine fields
(`skel_url`, `atlas_url`, `atlas_img_url`) live only on characters and are
optional (empty string / empty array = absent).

## Field Transforms Applied by seed-data.ts

### characters_table.json -> HsrCharacter + HsrCharacterCost

| Raw field | Target field | Transform |
|-----------|-------------|-----------|
| `name` | `name` | direct copy |
| `display_name` | `displayName` | snake_case -> camelCase |
| `aliases` | `aliases` | direct copy (array); missing -> `[]` |
| `rarity` | `rarity` | direct copy (int) |
| `path` | `path` | lowercase -> PascalCase (e.g. `"nihility"` -> `"Nihility"`) |
| `element` | `element` | lowercase -> PascalCase (e.g. `"lightning"` -> `"Lightning"`) |
| `role` | `role` | lowercase -> CharRole PascalCase (`"dps"` -> `"Dps"`) |
| `image_url` | `imageUrl` | snake_case -> camelCase; missing -> `""` |
| `version_released` | `versionReleased` | snake_case -> camelCase; missing -> `0` |
| `treat_as_version` | `treatAsVersion` | snake_case -> camelCase; missing -> `0` |
| `skel_url` | `skelUrl` | snake_case -> camelCase; empty string -> `null` |
| `atlas_url` | `atlasUrl` | snake_case -> camelCase; empty string -> `null` |
| `atlas_img_url` | `atlasImgUrls` | snake_case -> camelCase; missing -> `[]` |
| `positioning.x` | `posX` | nested -> flat int; missing block -> `0` |
| `positioning.y` | `posY` | nested -> flat int; missing block -> `0` |
| `positioning.width` | `width` | nested -> flat int; missing block -> `0` |
| `cost.cost_set_id` | (lifts to `costSetId` on each fanned row) | missing -> `0` |
| `cost.memory_of_chaos.classic.E0..E6` | HsrCharacterCost.classicCosts | gameMode: `"MemoryOfChaos"`; missing sub-block → zero-pad on insert (D-07); present → apply values |
| `cost.memory_of_chaos.auction.E0..E6` | HsrCharacterCost.auctionBaseBid | gameMode: `"MemoryOfChaos"`; missing sub-block → zero-pad on insert (D-07); present → apply values |
| `cost.apocalyptic_shadow.classic.E0..E6` | HsrCharacterCost.classicCosts | gameMode: `"ApocalypticShadow"`; same rules |
| `cost.apocalyptic_shadow.auction.E0..E6` | HsrCharacterCost.auctionBaseBid | gameMode: `"ApocalypticShadow"`; same rules |
| `cost.anomaly_arbitration.classic.E0..E6` | HsrCharacterCost.classicCosts | gameMode: `"AnomalyArbitration"`; same rules |
| `cost.anomaly_arbitration.auction.E0..E6` | HsrCharacterCost.auctionBaseBid | gameMode: `"AnomalyArbitration"`; same rules |
| (mode block present but both `classic` + `auction` sub-blocks absent) | (no row written) | Skip the mode entirely (D-09/D-10) |
| `E0..E6` (uppercase) | `e0..e6` | lowercase keys in EidolonCost struct |

**Fan-out count:** Up to 7 eidolons × 2 draft modes (classic/auction) × 3 game modes = **42 HsrCharacterCost writable fields per character** (2 struct columns × 3 game modes = 6 row-level slots). A row is written for a game mode only if at least one of `classic` / `auction` is present in the template; the missing side is zero-padded on insert (D-07) and preserved on update (D-06).

### lightcones_table.json -> HsrLightcone + HsrLightconeCost

| Raw field | Target field | Transform |
|-----------|-------------|-----------|
| `name` | `name` | direct copy |
| `display_name` | `displayName` | snake_case -> camelCase |
| `aliases` | `aliases` | direct copy; missing -> `[]` |
| `path` | `path` | lowercase -> PascalCase |
| `rarity` | `rarity` | direct copy (int) |
| `image_url` | `imageUrl` | snake_case -> camelCase; missing -> `""` |
| `positioning.x` | `posX` | nested -> flat int; missing block -> `0` |
| `positioning.y` | `posY` | nested -> flat int; missing block -> `0` |
| `positioning.width` | `width` | plain int (was `"120%"` string with parseInt in pre-D-22 shape; now always int) |
| `cost.cost_set_id` | (lifts to `costSetId` on each fanned row) | missing -> `0` |
| `cost.memory_of_chaos.classic.S1..S5` | HsrLightconeCost.classicCosts | gameMode: `"MemoryOfChaos"`; missing sub-block → zero-pad on insert (D-07); present → apply values |
| `cost.memory_of_chaos.auction.S1..S5` | HsrLightconeCost.auctionBaseBid | gameMode: `"MemoryOfChaos"`; missing sub-block → zero-pad on insert (D-07); present → apply values |
| `cost.apocalyptic_shadow.classic.S1..S5` | HsrLightconeCost.classicCosts | gameMode: `"ApocalypticShadow"`; same rules |
| `cost.apocalyptic_shadow.auction.S1..S5` | HsrLightconeCost.auctionBaseBid | gameMode: `"ApocalypticShadow"`; same rules |
| `cost.anomaly_arbitration.classic.S1..S5` | HsrLightconeCost.classicCosts | gameMode: `"AnomalyArbitration"`; same rules |
| `cost.anomaly_arbitration.auction.S1..S5` | HsrLightconeCost.auctionBaseBid | gameMode: `"AnomalyArbitration"`; same rules |
| (mode block present but both `classic` + `auction` sub-blocks absent) | (no row written) | Skip the mode entirely (D-09/D-10) |
| `S1..S5` (uppercase) | `s1..s5` | lowercase keys in SuperimpositionCost struct |

**Fan-out count:** Up to 5 superimpositions × 2 draft modes (classic/auction) × 3 game modes = **30 HsrLightconeCost writable fields per lightcone** (2 struct columns × 3 game modes = 6 row-level slots). A row is written for a game mode only if at least one of `classic` / `auction` is present; the missing side is zero-padded on insert (D-07) and preserved on update (D-06).

### pairing_table.json -> HsrSynergyCost

| Raw field | Target field | Transform |
|-----------|-------------|-----------|
| `source_name` | `sourceName` | snake_case -> camelCase |
| `target_name` | `targetName` | snake_case -> camelCase |
| `cost.cost_set_id` | (lifts to `costSetId` on each fanned row) | missing -> `0` |
| `cost.memory_of_chaos` | HsrSynergyCost row | gameMode: `"MemoryOfChaos"`, costModifier: value |
| `cost.apocalyptic_shadow` | HsrSynergyCost row | gameMode: `"ApocalypticShadow"`, costModifier: value |
| `cost.anomaly_arbitration` | HsrSynergyCost row | gameMode: `"AnomalyArbitration"`, costModifier: value |

**Fan-out count:** 1 pair × 3 game modes = **3 HsrSynergyCost rows per pairing**.

## Notes

- `costSetId: 0` is the sentinel for the default cost set — seeds always use it. Non-zero values denote custom (per-tournament / per-lobby) cost sets and must round-trip through `admin_bulk_upsert` using the composite-PK tuple match `(name, gameMode, costSetId)` / `(sourceName, targetName, gameMode, costSetId)` introduced in Phase 15 Plan 03 (D-09).
- Characters with no `cost` entry in the JSON get no HsrCharacterCost rows.
- Lightcone `positioning` is optional — omitting the block defaults `posX`/`posY`/`width` to `0`. Characters follow the same rule.
- Spine fields (`skel_url`, `atlas_url`, `atlas_img_url`) are all optional on characters; empty-string -> `null`, missing array -> `[]`. Lightcones have no Spine fields.
- `auctionBaseBid` is populated from `cost.<mode>.auction` sub-blocks (D-01). Missing on insert → zero-padded per D-07. Missing on update → existing value preserved per D-06. There is no silent classic → auction copy at the seed layer (D-08).
- Unknown mode keys (anything other than the three snake_case modes above) are logged as warnings and skipped at the seed layer. The router's `validateEnum` is a second defensive gate.
