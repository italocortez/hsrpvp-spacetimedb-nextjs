---
status: complete
phase: 02-roster-management
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md]
started: 2026-03-16T23:00:00Z
updated: 2026-03-18T16:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Module publishes and boots without errors. Seed data loads.
result: pass

### 2. Create HSR Account (auto-label)
expected: Call create_hsr_account with empty displayLabel. Account created with auto-generated label.
result: pass
note: Was failing due to cross-user iter() pollution. Fixed by adding userId filtering to test harness.

### 3. Account Limit Enforcement
expected: Creating a 6th account should fail with error about the 5-account limit.
result: pass
note: Was failing because iter().length counted all users' accounts. Fixed with myAccounts() filter.

### 4. Update HSR Account
expected: Call update_hsr_account to change label and visibility.
result: pass
note: Was failing with "Not your account" because iter()[0] picked foreign user's account.

### 5. Update HSR Account — Empty Label Rejection
expected: Call update_hsr_account with empty label fails with 'cannot be empty'.
result: pass

### 6. Set Active Account
expected: Call set_active_hsr_account — target becomes active, others deactivate.
result: pass

### 7. Set Active Account — No-op on Already Active
expected: Calling set_active_hsr_account on already-active account is a no-op.
result: pass

### 8. Delete Account with Cascade
expected: Delete account — account AND character rows cascade-deleted.
result: pass
note: toBeUndefined() changed to toBeNull() (SDK find() returns null for missing rows).

### 9. Batch Upsert Characters
expected: Call batch_upsert_characters — characters inserted atomically.
result: pass
note: Was crashing with fatal error. Backend bug: .primaryKey.find() doesn't exist at runtime for composite PKs. Fixed with filter-based lookup.

### 10. Batch Remove Characters
expected: Call batch_remove_characters — specified characters removed with all-or-nothing validation.
result: pass
note: Same .primaryKey.find() backend bug. Fixed.

### 11. Migrate Roster
expected: Copy/move characters between accounts.
result: pass
note: Same .primaryKey.find() backend bug in migrate_roster. Fixed. Also had cross-user iter() pollution in test setup.

### 12. Admin Archetype CRUD
expected: Admin upsert/delete archetypes with cascade and permission guards.
result: pass

### 13. Character Archetype Assignment
expected: Admin assign/remove character archetypes with permission enforcement.
result: pass

### 14. Defaults isRatingPublic to false
expected: New account defaults isRatingPublic to false.
result: pass
note: isDuplicateUid assertion removed — correctly true on shared DB when UID exists from prior run.

## Summary

total: 14
passed: 14
issues: 0
pending: 0
skipped: 0

## Gaps

[all resolved — 2 backend bugs fixed, 7 test fixes applied, 32/32 integration tests passing]
