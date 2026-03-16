# Roster Management

## Tables

```
User
│
└── HsrAccount (one per user-HSR UID pair)
    │  id (PK, autoInc), userId → User.id
    │  uid (HSR UID string), region, displayLabel
    │  isActive (only one active per user), isRosterPublic
    │  isRatingPublic (whether cost breakdown is public)
    │  isDuplicateUid (true when 2+ users claim same UID)
    │
    ├── HsrAccountCharacter (owned characters)
    │     PK: [hsrAccountId, characterName]
    │     hsrAccountId → HsrAccount.id
    │     characterName → HsrCharacter.name (application-enforced)
    │     eidolonLevel (u8, 0-6)
    │
    └── HsrAccountLightcone (owned lightcones)
          PK: [hsrAccountId, lightconeName]
          hsrAccountId → HsrAccount.id
          lightconeName → HsrLightcone.name (application-enforced)
          superimpositionLevel (u8, 1-5)

Archetype (admin-managed)
│  id (PK, autoInc), name (unique), description
│
└── HsrCharacterArchetype (character-to-archetype junction)
      PK: [characterName, archetypeId]
      characterName → HsrCharacter.name (application-enforced)
      archetypeId → Archetype.id (application-enforced)
      Indexes: hsr_char_arch_char (characterName), hsr_char_arch_arch (archetypeId)
```

## Data Model

- **Many-to-many**: One user can have multiple HSR accounts. Multiple users can claim the same HSR UID (no blocking, just warning on duplicate UID via `isDuplicateUid`)
- **Each HsrAccount row is per-user**: User A claiming UID "800123456" gets HsrAccount(id=1), User B claiming same UID gets HsrAccount(id=2) — separate roster management
- **Lightcones are ownership only**: No equip tracking (no lightcone-to-character assignment)
- **Archetypes are admin-defined** labels for characters (e.g. "sustain", "hyper-carry"). Junction table allows many-to-many.

## Visibility Rules

| Viewer | Can see roster when |
|--------|---------------------|
| Admin | Always |
| TO | Only participants in their active tournament |
| Opponent | Only while in same lobby/match with open-roster setting |
| Everyone else | Only if `isRosterPublic = true` |

Visibility enforcement is at the subscription/reducer level, not display layer.

## UID Validation

UIDs are 9-digit strings. First digit maps to region:
- `6` → America
- `7` → Europe
- `8` → Asia
- `9` → TW_HK_MO

Helpers in `helpers/rosterHelpers.ts`:
- `validateUid(uid)` — throws SenderError if format invalid
- `deriveRegion(uid)` — returns region string from first digit
- `recalcDuplicateUid(ctx, uid, actorId)` — syncs `isDuplicateUid` flag across all accounts sharing a UID

## Permission Guards

- `ensureVerifiedUser(ctx)` in `helpers/ensurePermissions.ts` — blocks guest users from all roster write operations. Guests can browse public data but cannot create/modify rosters.

## User Deletion Cascade

`run_user_deletion` (reducers/userDeletion.ts) cascades in order:
1. Delete UserIdentity rows
2. Delete HsrAccountCharacter rows for each HsrAccount owned by user
3. Delete HsrAccount rows
4. Hard-delete User row

Note: HsrAccountLightcone rows are NOT cascaded yet (lightcone reducers descoped from Phase 2).

## Account Rating (Phase 2 reducer logic — not yet implemented)

Rating = sum of character costs (by eidolon) + lightcone costs, per game mode, mapped to labeled breakpoints via HsrCharacterCost / HsrLightconeCost tables.
