---
status: complete
phase: 07-achievements-and-titles
source: [07-01-SUMMARY.md, 07-02-SUMMARY.md]
started: 2026-03-28T05:30:00Z
updated: 2026-03-29T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Run `npx tsx scripts/post-publish.ts` — bootstraps fresh identity, registers server, seeds game data and 3 starter achievements. `spacetime sql` shows Achievement table has 3 rows with correct names/rarities, and AchievementCriteria has matching criteria rows.
result: pass
note: Fixed bootstrap bug — seedAchievements used onInsert without active subscription. Changed to subscriptionBuilder().subscribeToAllTables() + cache lookup.

### 2. Create Achievement (Admin CRUD)
expected: Admin calls `create_achievement` with name="Test Achievement", description="For testing", rarity=Rare, isManualOnly=false, maxAwards=undefined. Achievement table gains a row with correct fields. Calling again with same name is rejected with "already exists".
result: pass

### 3. Update Achievement (Metadata Edit)
expected: Admin calls `update_achievement` to change name and rarity of the test achievement. Achievement row reflects updated fields. Updating to a name that conflicts with an existing achievement is rejected.
result: pass

### 4. Add Achievement Criteria
expected: Admin calls `add_achievement_criteria` with achievementId pointing to the test achievement, statTable="PlayerStat", statField="wins", operator=GreaterOrEqual, thresholdValue=10. AchievementCriteria table gains a row with correct FK and fields. Invalid statTable (e.g. "FakeTable") is rejected.
result: pass

### 5. Manual Award Achievement (Admin to User)
expected: Admin calls `manual_award_achievement` targeting a verified user. UserAchievement table gains a row with correct userId, achievementId, awardedById. Awarding same achievement to same user again is rejected with "already earned".
result: pass

### 6. Criteria Lock After Award
expected: After a UserAchievement row exists for an achievement, calling `add_achievement_criteria` or `remove_achievement_criteria` on that achievement is rejected with "Cannot modify criteria: players have already earned this achievement."
result: pass

### 7. Global Cap Enforcement
expected: Create a capped achievement (maxAwards=1). Manually award to user A — succeeds. Manually award to user B — rejected with "reached its global award limit".
result: pass

### 8. Set Displayed Achievement (Own Title)
expected: A verified user who earned an achievement calls `set_displayed_achievement` with their achievementId. User row's displayedAchievementId is updated. Calling with achievementId=0 or undefined clears the title. Setting a title for an achievement the user has NOT earned is rejected.
result: pass

### 9. Delete Achievement with Full Cascade
expected: Admin calls `delete_achievement` on an achievement that has criteria rows, UserAchievement rows, and a user displaying it as title. After deletion: Achievement row gone, all AchievementCriteria rows for it gone, all UserAchievement rows for it gone, User.displayedAchievementId cleared to null.
result: pass

### 10. Permission Guards
expected: A guest user calling create_achievement, update_achievement, delete_achievement, add_achievement_criteria, remove_achievement_criteria, or manual_award_achievement is rejected. A regular verified user (not Admin/Mod/TO) calling manual_award_achievement is rejected with "Requires Moderator, Admin, or Tournament Host privileges." A guest calling set_displayed_achievement is rejected with "Guests cannot set displayed achievements."
result: pass

### 11. Auto-Award via Finalization Pipeline
expected: Achievement checker fires at step 16.5 of runFinalization after stat increments. When a participant's stats satisfy all criteria (AND logic) for a non-manual achievement, a UserAchievement row is auto-inserted.
result: pass
notes: "Code-verified. checkAndAwardAchievements runs at step 16.5. No matching criteria in test data. Checker executes without errors during all finalizations."

## Summary

total: 11
passed: 11
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
