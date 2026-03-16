# Player Stats

## Tables

```
User
│
├── PlayerStats (aggregate stats per player)
│     userId (PK) → User.id
│     matchesPlayed, wins, losses
│     winRate (f32, computed: wins / matchesPlayed)
│     matchesSpectated
│     bestAllyUserId?  → User.id (most shared wins)
│     nemesisUserId?   → User.id (most losses against)
│
└── CharacterStats (per-character performance)
      PK: [userId, characterName]
      userId        → User.id
      characterName → HsrCharacter.name (application-enforced)
      matchesPlayed, wins, losses
      winRate (f32)
```

## Flow

1. Match result reaches `Validated` status
2. Both players' `PlayerStats` rows updated: increment matchesPlayed, wins/losses, recalculate winRate
3. `CharacterStats` updated for each character used in the match
4. Best Ally / Nemesis recalculated from match history data
5. Spectator count incremented when user spectates a match

## Key Decisions

- Stats updated on every confirmed match result — not computed on-the-fly
- Best Ally = userId with most shared wins (both on same team)
- Nemesis = userId with most losses against (opponent who beat you most)
- Character-vs-character win ratio tracked in CharacterStats
- Match history supports step-by-step replay via MatchSessionStepHistory
