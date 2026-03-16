# Roster Management

## Tables

```
User
│
└── HsrAccount (one per user-HSR UID pair)
    │  id (PK, autoInc), userId → User.id
    │  uid (HSR UID string), region, displayLabel
    │  isActive (only one active per user), isRosterPublic
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
```

## Data Model

- **Many-to-many**: One user can have multiple HSR accounts. Multiple users can claim the same HSR UID (no blocking, just warning on duplicate UID)
- **Each HsrAccount row is per-user**: User A claiming UID "800123456" gets HsrAccount(id=1), User B claiming same UID gets HsrAccount(id=2) — separate roster management
- **Lightcones are ownership only**: No equip tracking (no lightcone-to-character assignment)

## Visibility Rules

| Viewer | Can see roster when |
|--------|---------------------|
| Admin | Always |
| TO | Only participants in their active tournament |
| Opponent | Only while in same lobby/match with open-roster setting |
| Everyone else | Only if `isRosterPublic = true` |

Visibility enforcement is at the subscription/reducer level, not display layer.

## Account Rating (Phase 2 reducer logic — not yet implemented)

Rating = sum of character costs (by eidolon) + lightcone costs, per game mode, mapped to labeled breakpoints via HsrCharacterCost / HsrLightconeCost tables.
