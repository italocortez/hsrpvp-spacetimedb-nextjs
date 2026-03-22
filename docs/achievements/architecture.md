# Achievements & Titles

## Tables

```
Achievement (definitions — created by admins)
│  id (PK, autoInc), name (unique), description
│  triggerType (AchievementTriggerType: StatThreshold / CharacterSpecific / Manual)
│  rarity (AchievementRarity: Rare / Epic / Legendary)
│  isOneTime (false = repeatable, true = one-time)
│  thresholdValue? (e.g., 10 for "Win 10 matches")
│  characterName?  (for character-specific achievements)
│
└── UserAchievement (earned by players)
      PK: [userId, achievementId]
      userId        → User.id
      achievementId → Achievement.id
      awardedById?  → User.id (admin/TO for manual awards, null for auto)
      earnedCount   → how many times earned (for repeatable achievements)
```

## Flow

1. Admin creates `Achievement` definition with trigger type and threshold
2. **Auto-award**: After `validate_match_result`, achievement checker runs — checks stat thresholds against PlayerStats, inserts `UserAchievement` for newly satisfied conditions
3. **Manual award**: Admin/TO calls a reducer to directly insert `UserAchievement`
4. Player reads their `UserAchievement` rows to see collected achievements
5. Player calls reducer to select which earned title to display on profile

## Key Decisions

- No tournament placement auto-awards — those are manual by admin/TO
- Rarity tiers: Rare, Epic, Legendary (affects display styling)
- Repeatable by default unless `isOneTime: true`. Manual achievements are always one-time
