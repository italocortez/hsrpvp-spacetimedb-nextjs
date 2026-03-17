---
status: testing
phase: 02-roster-management
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md]
started: 2026-03-16T23:00:00Z
updated: 2026-03-16T23:00:00Z
---

## Current Test

number: 2
name: Create HSR Account
expected: |
  Call `create_hsr_account` with a valid 9-digit UID (e.g., "800123456") and a label. Account is created with: correct region derived from first digit, `isActive` set to true (first account), `isRatingPublic` defaults to false, `isDuplicateUid` defaults to false. Verify via `spacetime sql "SELECT * FROM HsrAccount"`.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Publish the module fresh with `spacetime publish hsrpvp-spacetimedb-nextjs-test1 --clear-database`. Module compiles and publishes without errors. `spacetime logs` shows clean startup with no panics.
result: pass

### 2. Create HSR Account
expected: Call `create_hsr_account` with a valid 9-digit UID (e.g., "800123456") and a label. Account is created with: correct region derived from first digit, `isActive` set to true (first account), `isRatingPublic` defaults to false, `isDuplicateUid` defaults to false. Verify via `spacetime sql "SELECT * FROM HsrAccount"`.
result: [pending]

### 3. Account Limit Enforcement
expected: Create 5 accounts for the same user (different UIDs). Attempting a 6th `create_hsr_account` call should fail with an error about the 5-account limit. The 5 existing accounts remain intact.
result: [pending]

### 4. Update HSR Account
expected: Call `update_hsr_account` on an existing account — change the label and set `isRatingPublic` to true. Label and visibility update successfully. Attempting to change the UID should fail or be ignored (UID is immutable after creation).
result: [pending]

### 5. Set Active Account
expected: With multiple accounts, call `set_active_hsr_account` targeting a non-active account. That account becomes active (`isActive = true`), all other accounts for the same user become inactive (`isActive = false`). Calling it on an already-active account is a no-op (no error).
result: [pending]

### 6. Batch Upsert Characters
expected: Call `batch_upsert_characters` with an array of character entries for an account. Characters are inserted into HsrAccountCharacter. If any character entry is invalid (e.g., references a non-existent account), the entire batch should fail and no characters are written (atomic all-or-nothing).
result: [pending]

### 7. Batch Remove Characters
expected: Call `batch_remove_characters` with character IDs belonging to an account. All specified characters are removed. If any ID doesn't exist, the entire batch fails and no characters are removed.
result: [pending]

### 8. Delete Account with Cascade
expected: Call `delete_hsr_account` on an account that has characters. The account AND all its HsrAccountCharacter rows are deleted. If other accounts remain, the oldest one auto-activates. Verify no orphan character rows remain.
result: [pending]

### 9. Migrate Roster
expected: Create two accounts with characters. Call `migrate_roster` in "copy" mode — characters from source appear on target, source retains its characters. Call in "move" mode — characters transfer from source to target, source has none left.
result: [pending]

### 10. Admin Archetype CRUD
expected: Call `admin_upsert_archetype` to create an archetype (e.g., "DPS"). It appears in the Archetype table. Call again with the same name to update it (upsert). Call `admin_delete_archetype` — the archetype is removed AND any HsrCharacterArchetype junction rows referencing it are cascade-deleted.
result: [pending]

### 11. Character Archetype Assignment
expected: With an archetype and a character existing, call `admin_assign_character_archetypes` to link them. The junction row appears in HsrCharacterArchetype. Call `admin_remove_character_archetypes` to unlink — junction row is deleted. Assigning the same pair twice should be idempotent (no error, no duplicate).
result: [pending]

### 12. User Deletion Cascade
expected: Create a user with HSR accounts and characters. Hard-delete the user. All HsrAccount rows for that user are deleted, and all HsrAccountCharacter rows for those accounts are also deleted. No orphan data remains.
result: [pending]

## Summary

total: 12
passed: 1
issues: 0
pending: 11
skipped: 0

## Gaps

[none yet]
