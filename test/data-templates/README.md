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
| `cost.memory_of_chaos.E0..E6` | HsrCharacterCost row | gameMode: `"MemoryOfChaos"`, classicCosts+auctionBaseBid: `{e0..e6}`, costSetId: `cost.cost_set_id` |
| `cost.apocalyptic_shadow.E0..E6` | HsrCharacterCost row | gameMode: `"ApocalypticShadow"` |
| `cost.anomaly_arbitration.E0..E6` | HsrCharacterCost row | gameMode: `"AnomalyArbitration"` |
| `E0..E6` (uppercase) | `e0..e6` | lowercase keys in EidolonCost struct |

**Fan-out count:** 7 eidolons × 3 game modes = **21 HsrCharacterCost rows per character**.

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
| `cost.memory_of_chaos.S1..S5` | HsrLightconeCost row | gameMode: `"MemoryOfChaos"`, classicCosts+auctionBaseBid: `{s1..s5}`, costSetId: `cost.cost_set_id` |
| `cost.apocalyptic_shadow.S1..S5` | HsrLightconeCost row | gameMode: `"ApocalypticShadow"` |
| `cost.anomaly_arbitration.S1..S5` | HsrLightconeCost row | gameMode: `"AnomalyArbitration"` |
| `S1..S5` (uppercase) | `s1..s5` | lowercase keys in SuperimpositionCost struct |

**Fan-out count:** 5 superimpositions × 3 game modes = **15 HsrLightconeCost rows per lightcone**. Per-mode blocks carry their own values; they are NOT duplicated across modes at the seed level — whatever the JSON says wins.

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
- `auctionBaseBid` uses the same values as `classicCosts` for now (placeholder; the auction format may diverge in a later phase).
- Unknown mode keys (anything other than the three snake_case modes above) are logged as warnings and skipped at the seed layer. The router's `validateEnum` is a second defensive gate.
