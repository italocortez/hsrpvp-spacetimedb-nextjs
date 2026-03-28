# Achievements & Titles — Architecture

**Last updated:** Phase 07 execution
**Tables:** Achievement, AchievementCriteria, UserAchievement
**Reducers:** 7 (CRUD + criteria + award + title)

## Table Relationships

```
Achievement (PK: id autoInc)
  ├── name (unique)
  ├── description
  ├── rarity: AchievementRarity (Rare | Epic | Legendary)
  ├── isManualOnly: bool
  ├── maxAwards: u32? (null=unlimited, 1=one-time, N=capped)
  └── audit cols

AchievementCriteria (PK: id autoInc)
  ├── achievementId (FK → Achievement.id)
  ├── statTable: string ('PlayerStat' | 'PlayerCharacterStat' | 'MmrRating')
  ├── statField: string (resolved via explicit field map)
  ├── operator: ComparisonOperator (>=, >, ==, <, <=)
  ├── thresholdValue: u32
  ├── filterGameMode?: string (GameMode tag)
  ├── filterCharacterName?: string
  ├── filterMatchType?: string (MatchType tag)
  └── audit cols
  Indexes: by_achievement (achievementId), by_stat_table (statTable)

UserAchievement (PK: id autoInc)
  ├── userId (FK → User.id)
  ├── achievementId (FK → Achievement.id)
  ├── awardedById (FK → User.id)
  └── audit cols
  Indexes: by_user (userId), by_achievement (achievementId), by_user_achievement ([userId, achievementId])

User.displayedAchievementId → Achievement.id (title display FK)
```

## Reducer Reference

| Reducer | Permission | Description |
|---------|-----------|-------------|
| create_achievement | Moderator+ | Create achievement definition |
| update_achievement | Moderator+ | Edit name/description/rarity (always editable) |
| delete_achievement | Admin only | Cascade delete: criteria, awards, displayed title refs |
| add_achievement_criteria | Moderator+ | Add criteria row (locked after first award) |
| remove_achievement_criteria | Moderator+ | Remove criteria row (locked after first award) |
| manual_award_achievement | Admin/Mod: any; TO: own tournament participants | Award achievement to a user |
| set_displayed_achievement | User: own title; Admin only: any user | Set or clear profile title |

## Auto-Award Pipeline

Achievement checker runs in `runFinalization` step 16.5, after all stat increments:

1. Load all non-manual achievements (iter() — admin content, <100 rows)
2. For each achievement, for each participant:
   a. Skip if user already has it (by_user_achievement index)
   b. Skip if global cap reached (by_achievement count vs maxAwards)
   c. Load criteria rows (by_achievement index)
   d. Evaluate ALL criteria (AND logic) against stat tables
   e. Award if all pass

Criteria resolution uses a hardcoded resolver map (not string indexing):
- PlayerStat: sum across filtered rows (by_user index)
- PlayerCharacterStat: sum across filtered rows (by_user index)
- MmrRating: max across all rows (user_id index)

## Data Patterns

- **Criteria lock:** AchievementCriteria rows cannot be added/removed once any UserAchievement exists for that achievement (D-25)
- **maxAwards dual enforcement:** Per-user (no duplicates) AND global (cap on total awards across all users) (D-04)
- **Cascade deletion:** Achievement → AchievementCriteria → UserAchievement → User.displayedAchievementId (D-23)
- **Title = Achievement.name:** No separate title table; displayedAchievementId on User is the FK (D-17, D-18)
- **No revocation:** Once earned, always kept (D-16)
- **Notification via subscription:** UserAchievement is public; SpacetimeDB subscription pushes new rows to clients (D-26)
