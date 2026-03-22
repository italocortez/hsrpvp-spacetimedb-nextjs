# Data Templates

Sample JSON files showing the raw format used in `test/data/*.json`.
Actual data files are gitignored — these templates exist for reference and onboarding.

## Field Transforms Applied by seed-data.ts

### characters_table.json -> HsrCharacter + HsrCharacterCost

| Raw field | Target field | Transform |
|-----------|-------------|-----------|
| `display_name` | `displayName` | snake_case -> camelCase |
| `path` | `path` | lowercase -> PascalCase (e.g. `"nihility"` -> `"Nihility"`) |
| `element` | `element` | lowercase -> PascalCase (e.g. `"lightning"` -> `"Lightning"`) |
| `role` | `role` | lowercase -> CharRole PascalCase (`"dps"` -> `"Dps"`) |
| `cost.memoryofchaos` | HsrCharacterCost row | gameMode: `"MemoryOfChaos"`, classicCosts+auctionBaseBid: `{e0..e6}` |
| `cost.apocalypticshadow` | HsrCharacterCost row | gameMode: `"ApocalypticShadow"` |
| `E0..E6` (uppercase) | `e0..e6` | lowercase keys in EidolonCost struct |

### lightcones_table.json -> HsrLightcone + HsrLightconeCost

| Raw field | Target field | Transform |
|-----------|-------------|-----------|
| `display_name` | `displayName` | snake_case -> camelCase |
| `path` | `path` | lowercase -> PascalCase |
| `positioning.x` | `posX` | direct copy (int) |
| `positioning.y` | `posY` | direct copy (int) |
| `positioning.width` | `width` | parse `"120%"` -> `120` (parseInt, strips `%`) |
| `cost` (flat S1..S5) | HsrLightconeCost rows | One row per gameMode (MemoryOfChaos, ApocalypticShadow); classicCosts+auctionBaseBid: `{s1..s5}` |
| `S1..S5` (uppercase) | `s1..s5` | lowercase keys in SuperimpositionCost struct |

### pairing_table.json -> HsrSynergyCost

| Raw field | Target field | Transform |
|-----------|-------------|-----------|
| `source` | `sourceName` | rename |
| `pair_target` | `targetName` | rename |
| `cost.memoryofchaos` | HsrSynergyCost row | gameMode: `"MemoryOfChaos"`, costModifier: value |
| `cost.apocalypticshadow` | HsrSynergyCost row | gameMode: `"ApocalypticShadow"`, costModifier: value |

## Notes

- `costSetId: 0` is the sentinel for the default cost set (always used in seeds)
- Characters with no cost entry in the JSON get no HsrCharacterCost rows
- Lightcone `positioning` is optional — omit posX/posY/width defaults to 0
- `auctionBaseBid` uses the same values as `classicCosts` for now (placeholder)
