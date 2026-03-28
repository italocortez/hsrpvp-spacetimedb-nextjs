# Roster Management — Architecture

## Overview

Players create HSR account entries (up to 5), add owned characters with eidolon levels,
control visibility, and migrate rosters between accounts. Admins can proxy all operations.
Archetype tagging enables frontend diversity scoring.

## Table Relationships

```
User (id)
  └── HsrAccount (userId → User.id)
        ├── isActive (default preference, per-lobby selection overrides)
        ├── isRosterPublic, isRatingPublic (visibility toggles)
        ├── isDuplicateUid (auto-recalculated when accounts share a UID)
        └── HsrAccountCharacter (hsrAccountId → HsrAccount.id)
              ├── characterName → HsrCharacter.name (validated on write)
              └── eidolonLevel (u8, 0-6)

Archetype (id, name unique, description) — admin-managed
  └── HsrCharacterArchetype (characterName + archetypeId) — junction
        ├── characterName → HsrCharacter.name (application-enforced)
        └── archetypeId → Archetype.id (application-enforced)

HsrCharacterCost, HsrLightconeCost, HsrSynergyCost
  └── costSetId (u32, default 0 = default cost set, Phase 3 adds CostSet table)
```

## Reducer Flows

### create_hsr_account(uid, displayLabel)
1. ensureVerifiedUser → validates non-guest
2. validateUid → 9-digit regex, valid region digit (6/7/8/9)
3. deriveRegion → first digit maps to region string
4. Check 5-account limit per user
5. Auto-default label to "Account N" if empty
6. First account auto-activates (isActive = true)
7. Insert HsrAccount
8. recalcDuplicateUid → updates isDuplicateUid for all accounts sharing this UID

### update_hsr_account(hsrAccountId, displayLabel, isRosterPublic, isRatingPublic)
1. ensureVerifiedUser → ownership check (account.userId === user.id)
2. Validate displayLabel not empty after trim
3. Update label and visibility flags
4. UID and region are immutable — not accepted by this reducer

### set_active_hsr_account(hsrAccountId)
1. ensureVerifiedUser → ownership check
2. No-op if account is already active
3. Deactivate all other accounts for this user
4. Activate the target account

### delete_hsr_account(hsrAccountId)
1. ensureVerifiedUser → ownership check
2. Cascade: delete all HsrAccountCharacter rows for this account
3. Delete HsrAccount
4. If was active: auto-activate oldest remaining (sort by createdDate ascending)
5. recalcDuplicateUid for the deleted UID

### batch_upsert_characters(hsrAccountId, charactersJson)
1. ensureVerifiedUser → ownership check
2. Parse JSON array of {characterName, eidolonLevel}
3. Phase 1: Validate ALL (character exists in HsrCharacter, eidolon 0-6)
4. Phase 2: Upsert ALL (composite PK find → delete + insert pattern)
5. Atomic: any validation failure rejects entire batch

### batch_remove_characters(hsrAccountId, characterNamesJson)
1. ensureVerifiedUser → ownership check
2. Parse JSON array of characterName strings
3. Phase 1: Validate ALL names exist on this account
4. Phase 2: Delete ALL
5. Atomic: any name not found rejects entire batch

### migrate_roster(sourceAccountId, targetAccountId, mode)
1. ensureVerifiedUser → both accounts must belong to the same user
2. Validate source !== target
3. Copy mode: upsert source chars into target (overwrite eidolon level if exists)
4. Move mode: same as copy, then delete all source chars

## Visibility Rules

- isRosterPublic: controls whether other users can see character roster
- isRatingPublic: controls whether other users see computed rating
- Lobby/tournament override (Phase 3+): isOpenRoster on Lobby forces visibility
- Admins always see everything
- Rating = frontend-computed from character costs + archetype diversity (see HsrCharacterCost)

| Viewer | Can see roster when |
|--------|---------------------|
| Admin | Always |
| TO | Only participants in their active tournament |
| Opponent | Only while in same lobby/match with open-roster setting |
| Everyone else | Only if isRosterPublic = true |

## Admin Proxy

All admin_* reducers mirror user reducers but:
- Use ensureAdmin(ctx) instead of ensureVerifiedUser
- Accept targetUserId parameter (for create) or operate on any account
- No ownership checks
- Audit trail uses admin.id

### Admin proxy reducers

- admin_create_hsr_account(targetUserId, uid, displayLabel)
- admin_update_hsr_account(hsrAccountId, displayLabel, isRosterPublic, isRatingPublic)
- admin_delete_hsr_account(hsrAccountId)
- admin_batch_upsert_characters(hsrAccountId, charactersJson)
- admin_batch_remove_characters(hsrAccountId, characterNamesJson)

## Archetype System

- Admin-managed via admin_upsert_archetype(name, description) and admin_delete_archetype(archetypeId)
- Characters assigned via admin_assign_character_archetypes(characterName, archetypeIdsJson)
- Characters removed via admin_remove_character_archetypes(characterName, archetypeIdsJson)
- Many-to-many: one character can have many archetypes; one archetype covers many characters
- Used by frontend for horizontal diversity scoring (e.g. "sustain", "hyper-carry", "support")
- Delete archetype cascades to all HsrCharacterArchetype junction rows
- admin_upsert_archetype uses id.update() not name.update() — unique index accessor lacks update()

## UID Validation

UIDs are 9-digit strings. First digit maps to region:
- 6 → America
- 7 → Europe
- 8 → Asia
- 9 → TW_HK_MO

Helpers in helpers/rosterHelpers.ts:
- validateUid(uid) → throws SenderError if format invalid
- deriveRegion(uid) → returns region string from first digit
- recalcDuplicateUid(ctx, uid, actorId) → syncs isDuplicateUid flag across all accounts sharing the UID

## User Deletion Cascade

run_user_deletion (reducers/userDeletion.ts) cascades in order:
1. Delete UserIdentity rows
2. Delete HsrAccountCharacter rows for each HsrAccount owned by user
3. Delete HsrAccount rows
4. Delete AvailabilitySlot rows (Phase 8)
5. Delete SavedCalendar rows — both as subscriber and as target (Phase 8)
6. Delete CalendarEventInvite rows as invitee (Phase 8)
7. Delete CalendarEvent rows as organizer + cascade their invites (Phase 8)
8. Hard-delete User row

Note: Step 8 hard-deletes the User row, but multiple history tables (MatchParticipantHistory, MmrHistory, PlayerStat, Leaderboard, TournamentParticipant) reference userId. This may need rework to preserve the User row — tracked separately from Phase 8.

Note: HsrAccountLightcone rows are NOT cascaded yet (lightcone reducers descoped from Phase 2).
A comment in userDeletion.ts marks where to extend when lightcone reducers are added.

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
