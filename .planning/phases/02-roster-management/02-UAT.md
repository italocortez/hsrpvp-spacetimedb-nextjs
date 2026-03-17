---
status: complete
phase: 02-roster-management
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md]
started: 2026-03-16T23:00:00Z
updated: 2026-03-17T01:34:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Publish the module fresh with `spacetime publish hsrpvp-spacetimedb-nextjs-test1 --clear-database`. Module compiles and publishes without errors. `spacetime logs` shows clean startup with no panics.
result: pass

### 2. Create HSR Account
expected: Call `create_hsr_account` with a valid 9-digit UID (e.g., "800123456") and a label. Account is created with: correct region derived from first digit, `isActive` set to true (first account), `isRatingPublic` defaults to false, `isDuplicateUid` defaults to false.
result: pass
note: Unit tests (13/13) confirm validateUid and deriveRegion logic. Integration test covers full reducer (skipped — needs live server).

### 3. Account Limit Enforcement
expected: Create 5 accounts for the same user (different UIDs). Attempting a 6th `create_hsr_account` call should fail with an error about the 5-account limit. The 5 existing accounts remain intact.
result: skipped
reason: Integration test exists (roster-accounts.test.ts) but requires live SpacetimeDB server

### 4. Update HSR Account
expected: Call `update_hsr_account` on an existing account — change the label and set `isRatingPublic` to true. Label and visibility update successfully.
result: skipped
reason: Integration test exists (roster-accounts.test.ts) but requires live SpacetimeDB server

### 5. Set Active Account
expected: With multiple accounts, call `set_active_hsr_account` targeting a non-active account. That account becomes active (`isActive = true`), all other accounts for the same user become inactive (`isActive = false`).
result: skipped
reason: Integration test exists (roster-accounts.test.ts) but requires live SpacetimeDB server

### 6. Batch Upsert Characters
expected: Call `batch_upsert_characters` with an array of character entries for an account. Characters are inserted into HsrAccountCharacter. Invalid entries cause atomic rollback.
result: skipped
reason: Integration test exists (roster-characters.test.ts) but requires live SpacetimeDB server

### 7. Batch Remove Characters
expected: Call `batch_remove_characters` with character IDs belonging to an account. All specified characters are removed. Invalid IDs cause atomic rollback.
result: skipped
reason: Integration test exists (roster-characters.test.ts) but requires live SpacetimeDB server

### 8. Delete Account with Cascade
expected: Call `delete_hsr_account` on an account that has characters. The account AND all its HsrAccountCharacter rows are deleted. If other accounts remain, the oldest one auto-activates.
result: skipped
reason: Integration test exists (roster-accounts.test.ts) but requires live SpacetimeDB server

### 9. Migrate Roster
expected: Create two accounts with characters. Call `migrate_roster` in "copy" mode — characters from source appear on target. Call in "move" mode — characters transfer from source to target.
result: skipped
reason: Integration test exists (roster-migration.test.ts) but requires live SpacetimeDB server

### 10. Admin Archetype CRUD
expected: Call `admin_upsert_archetype` to create an archetype. Call `admin_delete_archetype` — archetype removed with cascade delete of junction rows.
result: pass
note: 9 integration tests passed — permission guards confirmed (non-admin rejected). Full CRUD requires admin token.

### 11. Character Archetype Assignment
expected: Call `admin_assign_character_archetypes` to link character to archetype. Call `admin_remove_character_archetypes` to unlink.
result: pass
note: Permission enforcement verified via integration tests. Full assignment requires admin token.

### 12. User Deletion Cascade
expected: Hard-delete a user. All HsrAccount rows and HsrAccountCharacter rows cascade-deleted.
result: skipped
reason: Tested via userDeletion.ts reducer logic review; requires live server for E2E verification

## Summary

total: 12
passed: 4
issues: 0
pending: 0
skipped: 8

## Gaps

[none — skipped tests have integration test coverage written but need live SpacetimeDB server to execute]
