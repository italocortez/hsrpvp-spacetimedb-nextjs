---
status: partial
phase: 11-account-rating-matrix
source: [11-VERIFICATION.md]
started: 2026-04-06T13:37:00Z
updated: 2026-04-06T13:37:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. admin_seed_rating_config on live DB
expected: Row id=1 inserted with verticalWeight=0.4, horizontalWeight=0.6, compression=0.2, roleExponentDps=2.0, roleExponentSupport=1.3, roleExponentSustain=1.0, archetypeThreshold=3.0, scale=1000.0, maxPossible>0.0
result: [pending]

### 2. Archetype junction seeding via seed scripts
expected: 12 distinct Archetype rows, 66+ HsrCharacterArchetype junction rows present in the database after seeding
result: [pending]

### 3. admin_recalculate_all_ratings on live DB
expected: All HsrAccount rows have accountRating recalculated using matrix formula (non-zero if roster has characters); log shows correct account count
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
