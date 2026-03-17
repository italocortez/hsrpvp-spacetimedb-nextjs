# Archetypes

Admin-managed labels for HSR characters. Used for draft strategy tagging (e.g. "sustain", "hyper-carry", "follow-up").

## Tables

```
Archetype
│  id (PK, autoInc)
│  name (unique string)
│  description (string)
│  [audit columns]
│
└── HsrCharacterArchetype (junction)
      PK: [characterName, archetypeId]
      characterName → HsrCharacter.name (application-enforced)
      archetypeId → Archetype.id (application-enforced)
      Indexes:
        character_name (characterName) — look up all archetypes for a character
        archetype_id (archetypeId)    — look up all characters in an archetype
```

## Admin Operations

Via `admin_bulk_upsert` with `tableName = 'Archetype'`:
- Upserts by `name` (unique key)
- Required fields: `name`, `description`

Via `admin_delete_row` with `tableName = 'Archetype'`:
- Cascades: deletes all `HsrCharacterArchetype` rows for the archetype before deleting the `Archetype` row

Via `admin_delete_row` with `tableName = 'HsrCharacterArchetype'`:
- Deletes a single junction row by composite key `{ characterName, archetypeId }`
