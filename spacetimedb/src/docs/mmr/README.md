# MMR / ELO System

## Tables

```
User
│
├── MmrRating (current rating snapshot — one row per user per game mode)
│     PK: [userId, gameMode]
│     userId              → User.id
│     gameMode            → GameMode enum (MoC, AS, AA)
│     rating              → current ELO (e.g., 1523)
│     matchesPlayed       → for K-factor tiering
│     globalCompositeRating? → average across all 3 modes
│     seasonId?           → future season support
│
└── MmrHistory (changelog — one row per rating change)
      id (PK, autoInc)
      userId        → User.id
      gameMode      → GameMode enum
      matchResultId → MatchResultRecord.id (what caused the change)
      previousRating → e.g., 1500
      newRating      → e.g., 1523
      delta          → e.g., +23 (i32, can be negative)
      seasonId?     → future season support
```

## Flow

1. `MatchResultRecord.status` reaches `Validated`
2. Reducer checks `mmrProcessedAt` is null (guard against double processing)
3. Reads both players' `MmrRating` rows for that `gameMode`
4. Calculates ELO delta using K-factor based on `matchesPlayed`:
   - K=40 for first 20 matches (placement period)
   - K=20 for matches 21-100
   - K=10 for 100+ matches (stable rating)
5. Updates both `MmrRating` rows (new rating, increment matchesPlayed)
6. Recalculates `globalCompositeRating` = `(mocRating + asRating + aaRating) / 3`
7. Inserts 2 `MmrHistory` rows (one per player) with before/after and delta
8. Sets `MatchResultRecord.mmrProcessedAt = ctx.timestamp`

## Key Decisions

- `globalCompositeRating` stored (not computed on-the-fly) because it needs btree index for leaderboard sorting
- Tournament matches count toward MMR only if tournament has `countTowardsMmr = true` (default false)
- `delta` is stored in MmrHistory for dashboard display ("+15", "-12") without recalculation
- `seasonId` column exists but seasons are deferred to v1
- `mmr_rating_value` index name (not `mmr_rating`) to avoid namespace collision with the table name
