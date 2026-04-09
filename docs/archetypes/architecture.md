# Archetypes

**Contract:** [contract.md](contract.md)

Admin-managed labels for HSR characters. Used for draft strategy tagging (e.g. "sustain", "hyper-carry", "follow-up") and account rating horizontal score calculation.

## Tables

```
Archetype                                  (public)
│  id (PK, u32, autoInc)
│  name (unique, string)
│  description (string)
│  [audit columns]
│
└── HsrCharacterArchetype                  (public, junction)
      characterName (string)
      archetypeId (u32)
      [audit columns]
      Indexes:
        character_name (btree, characterName)
        archetype_id (btree, archetypeId)
        by_character_and_archetype (btree, [characterName, archetypeId])
      FKs (application-enforced):
        characterName → HsrCharacter.name
        archetypeId → Archetype.id
```

## Reducer Reference

| Reducer | File | Permission | Description |
|---------|------|------------|-------------|
| `admin_upsert_archetype` | rosterAdmin.ts | Admin | Create or update archetype by name (upsert). Trims name, validates non-empty. |
| `admin_delete_archetype` | rosterAdmin.ts | Admin | Delete archetype + cascade all junction rows. |
| `admin_assign_character_archetypes` | rosterAdmin.ts | Admin | Assign archetypes to character. All-or-nothing validation, idempotent writes. Param: `archetypeIdsJson` (JSON string array). |
| `admin_remove_character_archetypes` | rosterAdmin.ts | Admin | Remove archetype assignments. All-or-nothing validation. Param: `archetypeIdsJson` (JSON string array). |

### Generic Admin Operations

| Reducer | tableName | Behavior |
|---------|-----------|----------|
| `admin_bulk_upsert` | 'Archetype' | Upserts by `name` (unique key). Fields: `name`, `description`. |
| `admin_delete_row` | 'Archetype' | Cascades: deletes all junction rows before archetype row. |
| `admin_delete_row` | 'HsrCharacterArchetype' | Deletes single junction row by composite key `{ characterName, archetypeId }`. |

## Data Patterns

**Upsert via unique index:** `admin_upsert_archetype` looks up by `name.find()` (unique index), then uses `id.update()` for the update path. Unique indexes don't have an `.update()` method — must go through PK.

**All-or-nothing validation:** Both assign and remove reducers validate ALL inputs before writing ANY rows. If archetype #3 doesn't exist, archetype #1 is NOT assigned either.

**Idempotent assign:** `admin_assign_character_archetypes` checks `by_character_and_archetype.filter([name, id])` before each insert. Existing assignments are skipped silently.

## Rating Integration

Archetypes feed the **horizontal score** component of account ratings (see `helpers/accountRating.ts`):

```
per_archetype = min(sum(age_weight for owned chars in archetype) / archetypeThreshold, 1.0)
horizontal_score = mean(per_archetype for ALL archetypes)
final_rating = (vertical * verticalWeight + horizontal * horizontalWeight) * scale
```

- `archetypeThreshold` (default 3.0) is configurable via `admin_update_rating_config`
- Archetypes with zero assigned characters are skipped
- After bulk archetype edits, `admin_recalculate_all_ratings` must be called manually (D-32)
