# MMR / ELO System

## Tables

```
User
|
+-- MmrRating (current rating snapshot -- one row per user per game mode)
|     PK: [userId, gameMode]
|     userId              -> User.id
|     gameMode            -> GameMode enum (MoC, AS, AA)
|     rating              -> current ELO (e.g., 1120)
|     matchesPlayed       -> for K-factor tiering
|     globalCompositeRating? -> average across all 3 modes
|     seasonId?           -> future season support
|
+-- MmrHistory (changelog -- one row per rating change)
|     id (PK, autoInc)
|     userId        -> User.id
|     gameMode      -> GameMode enum
|     matchHistoryId -> MatchSessionHistory.id (permanent record, not ephemeral MatchResultRecord)
|     previousRating -> e.g., 1000
|     newRating      -> e.g., 1028
|     delta          -> e.g., +28 (i32, can be negative)
|     seasonId?     -> future season support
|
+-- EloConfig (single-row config table -- admin-tunable)
      id (PK)             -> sentinel value 1
      kFactorNew          -> 40 (placement: 0-20 matches)
      kFactorMid          -> 20 (settling: 21-100 matches)
      kFactorVet          -> 10 (stable: 100+ matches)
      newThreshold        -> 20 (matches before mid K-factor)
      midThreshold        -> 100 (matches before vet K-factor)
      initialRating       -> 1000 (starting rating for new players)
      sizeBonus           -> 150 (rating points per extra team member)
      spreadDivisor       -> 2 (spread penalty = stdev(team ratings) / this)
      maxAccountBonus     -> 200 (max ELO modifier from account rating gap)
```

## ELO Calculation

### Base Formula (1v1)

```
expectedScore = 1 / (1 + 10^((opponentEffective - playerEffective) / 400))
ratingChange = K × (actualResult - expectedScore)
```

- `actualResult` = 1 (win), 0.5 (draw), 0 (loss)
- `K` = kFactorNew/Mid/Vet based on player's matchesPlayed
- Each player uses their OWN K-factor
- Initial rating for new players: 1000
- Higher rating = better player

### K-Factor Tiers

| Matches played | K-factor | Purpose |
|----------------|----------|---------|
| 0-20 | 40 | Placement — big swings to find true rating fast |
| 21-100 | 20 | Settling — moderate adjustments |
| 100+ | 10 | Stable — small, precise movements |

## Team Size Modifier

For uneven matches (1v2, 1v3, 2v3), the larger team's effective rating is boosted:

```
teamEffective = avg(teamRatings) + sizeBonus × (teamSize - 1) - stdev(teamRatings) / spreadDivisor
```

- **sizeBonus** (default 150): rating points per extra player beyond the first
- **spreadDivisor** (default 2): high skill variance within a team reduces the size advantage

### Examples (all players at 1000, K=40)

**1v2:**
```
Solo effective:  1000
Duo effective:   1000 + 150×1 - 0 = 1150
Solo expected:   30%
Solo wins: +28   Solo loses: -12
Duo wins:  +12   Duo loses:  -28
```

**1v3:**
```
Solo effective:  1000
Trio effective:  1000 + 150×2 - 0 = 1300
Solo expected:   15%
Solo wins: +34   Solo loses: -6
Trio wins:  +6   Trio loses: -34
```

**2v3:**
```
Duo effective:   1000 + 150×1 = 1150
Trio effective:  1000 + 150×2 = 1300
Duo expected:    30%
Duo wins:  +28   Duo loses:  -12
Trio wins: +12   Trio loses: -28
```

### Spread Penalty

A team with mismatched ratings is less effective than an evenly-rated team:

```
1v2 — tight duo (1450 + 1550):
  Duo effective = 1500 + 150 - 50/2 = 1625

1v2 — wide duo (1200 + 1800):
  Duo effective = 1500 + 150 - 300/2 = 1500
  (spread cancels the size bonus entirely)
```

### Self-Balancing

A player who consistently wins uneven matches climbs in rating until the gap shrinks:
- At 1000 vs duo effective 1150: expected 30%, gain +28 per win
- At 1100 vs duo effective 1150: expected 43%, gain +23 per win
- At 1150 vs duo effective 1150: expected 50%, gain +20 per win (stabilized)

The system converges naturally — no special logic needed.

## Account Rating Modifier

Account Rating (0-1000) measures roster strength: characters, eidolons, archetypes owned.
This reflects wallet/grinding advantage, not skill. The gap between players' account ratings
can optionally modify ELO calculations to protect F2P players.

### How It Works

The player with the higher account rating chooses one of two modes per match:

**Fair MMR mode** — Account rating modifier applied to ELO:
```
accountGap = abs(playerA.accountRating - playerB.accountRating)
accountModifier = (accountGap / 1000) × maxAccountBonus
```
The modifier is added to the higher-account-rating player's effective rating,
making the lower-account player the ELO underdog (protected from big losses,
rewarded for upsets).

**Handicap Play mode** — No ELO modifier, accept gameplay disadvantages instead:
- Account modifier zeroed out — pure skill ELO
- Higher-account player takes in-game handicaps (draft cost penalties, pick restrictions)
- Handicap mechanics are Phase 9/10 scope; Phase 5 only tracks the mode choice

### Account Rating Examples (both players 1000 MMR, K=40)

**Fair MMR — whale (account 800) vs F2P (account 200):**
```
Gap: 600 → modifier = (600/1000) × 200 = 120
Whale effective: 1000 + 120 = 1120
F2P effective:   1000

F2P expected: 34%
F2P wins:  +26    F2P loses:  -14
Whale wins: +14   Whale loses: -26
```

**Handicap Play — same players:**
```
Modifier: 0 (handicap mode)
Both effective: 1000
Expected: 50% each
Either wins: +20, loses: -20
```

### Stacking with Team Size

Both modifiers stack. A whale playing solo vs F2P duo:
```
Solo (whale, account 800):  MMR 1000
Duo (F2P, accounts 200+300): MMR 1000+1000

Team size: Duo effective = 1000 + 150 = 1150
Account: avg duo account = 250, gap = 800-250 = 550
  modifier = (550/1000) × 200 = 110 added to solo

Solo effective = 1000 + 110 = 1110
Duo effective  = 1150
Gap: 40 → Solo expected: 44%
```

The whale's roster advantage partially offsets the numbers disadvantage.

### For Team Matches

Account modifier uses team average account ratings:
```
Team Blue accounts: 800, 600 → avg = 700
Team Red accounts:  200, 300 → avg = 250
Gap: 450 → modifier = (450/1000) × 200 = 90
Added to Team Blue's effective rating
```

## Flow

1. `MatchResultRecord.status` reaches `Validated`
2. Check `matchType` — if Casual, skip MMR entirely
3. Check `mmrProcessedAt` is null (guard against double processing)
4. Read EloConfig single-row table
5. Read all participants' `MmrRating` rows for that `gameMode`
6. Calculate effective ratings for each side:
   - Base: avg(team ratings)
   - Team size: + sizeBonus × (teamSize - 1) - stdev / spreadDivisor
   - Account rating: + accountModifier (if Fair MMR mode)
7. Calculate expected score per side using effective ratings
8. Calculate delta per player: K × (actualResult - expectedScore)
9. Update each player's `MmrRating` (new rating, increment matchesPlayed)
10. Recalculate `globalCompositeRating` for each affected player
11. Insert `MmrHistory` row per player with before/after and delta
12. Set `MatchResultRecord.mmrProcessedAt = ctx.timestamp`

## MMR by Match Type

Only **Ranked** matches (matchType=Ranked) process MMR. Casual matches skip MMR entirely.

For tournament matches, matchType is derived from `Tournament.countTowardsMmr`:
- `countTowardsMmr = true` → matchType = Ranked (MMR processed)
- `countTowardsMmr = false` → matchType = Casual (no MMR)

### Ranked Standalone Matches
MMR is processed immediately when the match reaches Validated status.
The Flow section above describes this path. Once mmrProcessedAt is stamped,
finalize_match_result can safely delete the MatchResultRecord.

### Ranked Tournament Matches (countTowardsMmr=true)
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

### Casual Matches (no MMR)
Casual matches (matchType=Casual) auto-validate on submit and finalize immediately.
mmrProcessedAt is never set. finalize_match_result skips the MMR gate check for Casual matches.

### mmrProcessedAt as Finalization Gate
mmrProcessedAt serves as a two-purpose guard for Ranked matches:
- **Before set:** MMR has not been applied -- safe to rollback bracket matches (no MMR to reverse)
- **After set:** MMR has been applied -- rollback requires MMR reversal (blocked in current implementation)
- **For finalization:** finalize_match_result checks mmrProcessedAt is set (Ranked) or matchType=Casual before deleting

### Implementation Status
- process_tournament_mmr reducer: stub exists (Phase 04.1), implementation Phase 5
- finalize_match_result reducer: stub exists (Phase 04.1), implementation Phase 5

## Key Decisions

- Initial rating is 1000; higher = better
- EloConfig is a single-row admin-tunable table (not hardcoded constants)
- Team size bonus (default 150 per extra player) with spread penalty (stdev/2) for uneven matches
- Account rating modifier (max 200) protects F2P players; whale chooses Fair MMR or Handicap Play per match
- `globalCompositeRating` stored (not computed on-the-fly) because it needs btree index for leaderboard sorting
- Tournament `countTowardsMmr` setting determines matchType: true → Ranked (MMR processed), false → Casual (no MMR)
- `delta` is stored in MmrHistory for dashboard display ("+15", "-12") without recalculation
- `seasonId` column exists but seasons are deferred to v1
- `mmr_rating_value` index name (not `mmr_rating`) to avoid namespace collision with the table name
- MmrHistory.matchHistoryId FKs to MatchSessionHistory.id (permanent) because MmrHistory is permanent and MatchResultRecord is ephemeral (deleted after finalization)
