# MMR / ELO System

## Tables

```
User
|
+-- MmrRating (current rating snapshot -- one row per user per game mode)
|     PK: [userId, gameMode]
|     userId              -> User.id
|     gameMode            -> GameMode enum (MoC, AS, AA)
|     rating              -> current ELO (e.g., 1523)
|     matchesPlayed       -> for K-factor tiering
|     globalCompositeRating? -> average across all 3 modes
|     seasonId?           -> future season support
|
+-- MmrHistory (changelog -- one row per rating change)
      id (PK, autoInc)
      userId        -> User.id
      gameMode      -> GameMode enum
      matchHistoryId -> MatchSessionHistory.id (permanent record, not ephemeral MatchResultRecord)
      previousRating -> e.g., 1500
      newRating      -> e.g., 1523
      delta          -> e.g., +23 (i32, can be negative)
      seasonId?     -> future season support
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

## Tournament vs Casual MMR Timing

MMR processing timing differs based on match context:

### Casual and Ranked Matches
MMR is processed immediately when the match reaches Validated status.
The existing Flow section above describes this path. Once mmrProcessedAt is stamped,
finalize_match_result can safely delete the MatchResultRecord.

### Tournament Matches
MMR is NOT processed per-match. Tournament matches stay in Validated status with
mmrProcessedAt=null until the tournament ends (Completed or Cancelled stage).

When the tournament ends:
1. `process_tournament_mmr(tournamentId)` is called
2. Reducer iterates all MatchResultRecords with tournamentId and status=Validated and mmrProcessedAt=null
3. For each match: calculate ELO deltas, update MmrRating rows, insert MmrHistory rows
4. Stamp mmrProcessedAt on each processed MatchResultRecord
5. After batch completes, finalize_match_result can run on each record

This batching avoids volatile mid-tournament MMR swings from affecting seeding or
perceived fairness during the event.

### mmrProcessedAt as Finalization Gate
mmrProcessedAt serves as a two-purpose guard:
- **Before set:** MMR has not been applied -- safe to rollback bracket matches (no MMR to reverse)
- **After set:** MMR has been applied -- rollback requires MMR reversal (blocked in current implementation)
- **For finalization:** finalize_match_result checks mmrProcessedAt is set (or MMR disabled) before deleting

### Implementation Status
- process_tournament_mmr reducer: stub exists (Phase 04.1), implementation Phase 5
- finalize_match_result reducer: stub exists (Phase 04.1), implementation Phase 5

## Key Decisions

- `globalCompositeRating` stored (not computed on-the-fly) because it needs btree index for leaderboard sorting
- Tournament matches count toward MMR only if tournament has `countTowardsMmr = true` (default false)
- `delta` is stored in MmrHistory for dashboard display ("+15", "-12") without recalculation
- `seasonId` column exists but seasons are deferred to v1
- `mmr_rating_value` index name (not `mmr_rating`) to avoid namespace collision with the table name
- MmrHistory.matchHistoryId FKs to MatchSessionHistory.id (permanent) because MmrHistory is permanent and MatchResultRecord is ephemeral (deleted after finalization)
