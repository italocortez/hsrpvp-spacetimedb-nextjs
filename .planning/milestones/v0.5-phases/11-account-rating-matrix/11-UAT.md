---
status: complete
phase: 11-account-rating-matrix
source: [11-01-SUMMARY.md, 11-02-SUMMARY.md]
started: 2026-04-06T22:10:00Z
updated: 2026-04-06T22:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. admin_seed_rating_config — Seed Config Row
expected: Config row inserted with id=1, verticalWeight=0.4, horizontalWeight=0.6, compression=0.2, roleExponentDps=2.0, roleExponentSupport=1.3, roleExponentSustain=1.0, archetypeThreshold=3.0, scale=1000.0, maxPossible > 0
result: pass

### 2. Archetype Seeding — 12 Archetypes + Junction Rows
expected: 12 distinct Archetype rows covering DPS/Support/Sustain role variants. 110 HsrCharacterArchetype junction rows linking characters to archetypes. Spot-check: a known character (e.g. "acheron") has at least one archetype assignment.
result: pass

### 3. HsrCharacter Version Fields
expected: All 83 characters have versionReleased > 0. Characters without treatAsVersion override show treatAsVersion=0. Version values match HSR release chronology (e.g., launch chars ~1.0, newer chars ~3.x).
result: pass

### 4. End-to-End Rating — Create Account + Add Characters
expected: After creating an HSR account and adding characters with eidolons, accountRating is computed > 0 using the matrix formula. Empty accounts have accountRating = 0.
result: pass

### 5. admin_update_rating_config — Update Scale Parameter
expected: Updating scale from 1000 to 500 via admin_update_rating_config changes the config row. maxPossible is recomputed. Existing account ratings are NOT auto-recalculated (update only changes config, not ratings).
result: pass

### 6. admin_recalculate_all_ratings — Bulk Recalculation
expected: After calling admin_recalculate_all_ratings, all HsrAccount ratings are recomputed using current config (scale=500). Ratings should be ~half of their previous values. maxPossible on config is also refreshed.
result: pass

### 7. Idempotent Seed Guard
expected: Calling admin_seed_rating_config a second time throws "Rating config already seeded. Use admin_update_rating_config to modify."
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
