# Player Stats

## Tables

```
User
|
+-- PlayerStat (aggregate stats per player per mode)
|     PK: [userId, gameMode, draftMode]
|     userId              -> User.id
|     gameMode            -> GameMode enum (MoC, AS, AA)
|     draftMode           -> DraftMode enum (AllRandom, CaptainDraft, etc.)
|     matchesPlayed, wins, losses, draws
|     matchesSpectated
|     Indexes: by_user [userId], by_user_mode_draft [userId, gameMode, draftMode]
|
+-- PlayerCharacterStat (per-character performance per mode)
|     PK: [userId, characterName, gameMode, draftMode]
|     userId              -> User.id
|     characterName       -> HsrCharacter.name (application-enforced)
|     gameMode            -> GameMode enum
|     draftMode           -> DraftMode enum
|     matchesPlayed, wins, losses
|     Indexes: by_user [userId], by_user_and_character_mode_draft [userId, characterName, gameMode, draftMode]
|
+-- PlayerRelationship (ally/opponent tracking per mode)
      PK: [userId, otherUserId, gameMode, draftMode]
      userId              -> User.id
      otherUserId          -> User.id
      gameMode            -> GameMode enum
      draftMode           -> DraftMode enum
      matchesAsAlly, winsAsAlly
      matchesAsOpponent, winsAsOpponent
      Indexes: by_user [userId], by_user_and_other_mode_draft [userId, otherUserId, gameMode, draftMode]
```

PlayerRelationship replaces the old bestAllyUserId/nemesisUserId columns.
The client derives best ally (max winsAsAlly) and nemesis (max winsAsOpponent)
from subscription data -- no server-side recalculation needed.

## Composite PK Design

All three stat tables use composite primary keys that include gameMode and draftMode:
- PlayerStat: [userId, gameMode, draftMode] -- one row per user per mode combination
- PlayerCharacterStat: [userId, characterName, gameMode, draftMode] -- one row per character per mode
- PlayerRelationship: [userId, otherUserId, gameMode, draftMode] -- one row per opponent pair per mode

This means a player who plays MoC/AllRandom and AS/CaptainDraft has SEPARATE stat rows for each.
The client can show per-mode breakdowns or aggregate across modes by summing.

## Incremental Aggregation Pattern

Stats are updated incrementally, not recomputed from scratch:

### On finalize_match_result:
- PlayerStat: increment matchesPlayed, wins OR losses OR draws for each participant
- PlayerCharacterStat: increment matchesPlayed, wins/losses for each character used
- PlayerRelationship: for each pair of participants -- increment matchesAsAlly/winsAsAlly
  (if same team) or matchesAsOpponent/winsAsOpponent (if opposing team)

### On rollback (if implemented):
- Subtract the same increments. This is why individual match deltas are tracked --
  you need to know exactly what was added to reverse it.

### Derived Values (client-side)
- **Best Ally:** Sort PlayerRelationship by winsAsAlly/matchesAsAlly ratio (where matchesAsAlly >= threshold)
- **Nemesis:** Sort by winsAsOpponent (from OTHER player's perspective -- the opponent who beat you most)
- **Win Rate:** wins / matchesPlayed (can be computed client-side or stored as f32)

These are NOT stored in the database. The client computes them from the raw counters.
This avoids recomputing relationship rankings on every match -- the client just sorts.

## What Triggers Updates

Only `finalize_match_result` updates stat tables. Stats are NEVER updated by:
- submit_match_result (only changes status)
- confirm_match_scores (only sets confirmation flag)
- override_match_result (only changes status/winner)

This ensures stats always reflect finalized, verified match outcomes.

## Flow

1. Match result reaches `Validated` status and MMR processing completes (or MMR disabled)
2. `finalize_match_result` runs:
   - Each participant's `PlayerStat` row updated: increment matchesPlayed, wins/losses/draws
   - `PlayerCharacterStat` updated for each character used in the match
   - `PlayerRelationship` updated for each pair of participants (ally or opponent)
3. MatchResultRecord deleted (ephemeral)

## Key Decisions

- Stats updated incrementally on finalize_match_result -- not computed on-the-fly
- Best Ally / Nemesis derived client-side from PlayerRelationship counters (not stored)
- Character-vs-character win ratio tracked in PlayerCharacterStat per mode
- Composite PKs include gameMode + draftMode for per-mode stat breakdowns
- matchesSpectated on PlayerStat tracks spectator activity separately
