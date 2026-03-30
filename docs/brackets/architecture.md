# Brackets & Group Standings

## Tables

```
Tournament
|
+-- BracketMatch (one row per match slot in the bracket)
|     id (PK, autoInc)
|     tournamentId          -> Tournament.id
|     roundNumber, matchNumber
|     bracketSide           -> BracketSide enum: Winners|Losers|GrandFinals|ThirdPlace|Group
|     groupId?              -> group number (for group phase, set when bracketSide=Group)
|     team1Id?              -> TournamentTeam.id
|     team2Id?              -> TournamentTeam.id
|     nextWinnerMatchId?    -> BracketMatch.id (winner advances here)
|     nextLoserMatchId?     -> BracketMatch.id (loser goes here -- double elim, 3rd place)
|     winnerTeamId?         -> TournamentTeam.id (set when match resolved)
|     lobbyId?              -> Lobby.id (set when match played -- Phase 9)
|     bestOf, gameMode, winnerAdvantage
|     resultStatus          -> MatchResultStatus enum
|
+-- GroupStanding (round-robin standings per group)
      PK: [tournamentId, groupId, teamId]
      tournamentId          -> Tournament.id
      groupId               -> group number
      teamId                -> TournamentTeam.id
      wins, losses, draws, points
```

## BracketSide Enum

| Variant | When Used |
|---------|-----------|
| Winners | Main bracket (single elim) or winners bracket (double elim) |
| Losers | Losers bracket (double elim only) |
| GrandFinals | Final match between WB winner and LB winner (double elim) |
| ThirdPlace | Consolation match between semifinal losers |
| Group | Round-robin group phase matches |

Invariant: bracketSide=Group if and only if groupId is set.

## Team IDs

All participant references on BracketMatch (team1Id, team2Id, winnerTeamId) are **TournamentTeam.id** values, NOT userId values. Even solo players have auto-created TournamentTeam rows.

MatchResultRecord.winnerUserId is a userId. The advancement reducer maps: winnerUserId (userId) -> TournamentParticipant (tournamentId + userId) -> teamGroupId -> BracketMatch team slot.

## Reducers

### Bracket Generation (bracketGeneration.ts)
- `generate_bracket(tournamentId)` -- Creates all BracketMatch rows. Reads Tournament.format and branches to appropriate algorithm. Deletes existing rows first (regeneration). Only during Seeding stage. Rows also cascade-deleted by `cancel_tournament`.
- `seed_bracket(tournamentId, mode)` -- Assigns seedNumber to TournamentTeams. mode='mmr' (sort by captain's MmrRating for tournament gameMode) or mode='random' (deterministic shuffle). Only during Seeding stage.
- `swap_seeds(tournamentId, teamId1, teamId2)` -- Swaps seedNumber between two teams. Only during Seeding stage.

### Bracket Advancement (bracketAdvancement.ts)
- `advance_bracket_match(bracketMatchId)` -- Places winner in nextWinnerMatchId slot. Routes loser to nextLoserMatchId (double elim). Updates GroupStanding for group matches. Requires tournament InProgress.
- `submit_and_advance_bracket(matchResultId)` -- Wrapper for tournament matches. Maps winnerUserId (userId) -> winnerTeamId. Sets BracketMatch.winnerTeamId. If autoAdvanceBracket=true, auto-advances.
- `rollback_bracket_match(bracketMatchId)` -- Cascade-deletes linked CalendarEvent + invites (Phase 8, D-22), then clears winnerTeamId, removes winner/loser from next matches. Blocks if mmrProcessedAt is set on MatchResultRecord. Only during InProgress.

## Flow -- Single Elimination

1. TO creates tournament, sets format=SingleElimination
2. Players register (solo players get auto-created TournamentTeam)
3. TO advances to Seeding stage (requires 2+ active participants)
4. TO calls seed_bracket to assign seeds
5. TO calls generate_bracket -- creates BracketMatch rows with fold seeding
6. TO advances to InProgress (requires bracket rows to exist)
7. Matches played: submit_and_advance_bracket maps result -> advances winner
8. Tournament completes when finals match has winnerTeamId

## Flow -- Double Elimination

Same as single elim, but losers go to Losers bracket via nextLoserMatchId. Winners bracket final (WB) winner meets Losers bracket final (LB) winner in GrandFinals match. GrandFinals has winnerAdvantage (games head-start for WB finalist).

## Flow -- Group Phase

1. generate_bracket creates round-robin BracketMatch rows (bracketSide=Group) + GroupStanding rows
2. Points: Win=2, Draw=1, Loss=0
3. Tiebreaker: head-to-head result first, then game differential
4. Top N per group advance (groupAdvanceCount from Tournament)

## Flow -- Hybrid (GroupIntoSingleElim / GroupIntoDoubleElim)

1. generate_bracket creates group matches AND empty elimination bracket
2. Groups play out; GroupStanding tracks results
3. When all groups complete, group winners/runners-up fill elimination bracket slots
4. Elimination phase plays out normally

## BYE Handling

Odd participant counts produce BYEs. Top seeds get BYEs (null opponent slot). BYE match rows exist for bracket display with winnerTeamId pre-set. Winner auto-advanced during generate_bracket.

## DQ Auto-Advance

When dq_participant is called and autoAdvanceBracket=true, the system scans BracketMatch rows to find the DQ'd team's active match, cascade-deletes any linked CalendarEvent + invites (Phase 8, D-22), then auto-advances the opponent.

## Seeding Algorithms

- **Fold seeding** (elimination): 1v16, 8v9, 2v15, 7v10... ensures top seeds meet in later rounds
- **Snake seeding** (groups): Serpentine distribution for balanced group strength
- **Circle method** (round-robin): Standard algorithm ensuring every team plays every other team exactly once

## Algorithms

### Fold/Mirror Seeding
Standard ATP/WTA-style seeding. For N teams with bracket size = next power of 2:
- Seed 1 vs highest seed, seed 2 vs second-highest, etc.
- Top seeds automatically receive BYEs when N < bracket size
- Algorithm: start [[1,2]], double size each iteration: [a, nextSize+1-a] and [b, nextSize+1-b]

### Two-Pass FK Wiring
BracketMatch rows reference each other via nextWinnerMatchId/nextLoserMatchId, but IDs are
only known after insert (autoInc). Solution:
1. Insert all matches with null FKs, build positionKey -> insertedId map
2. Update each match's nextWinnerMatchId/nextLoserMatchId using the map
3. Auto-advance BYE matches (place pre-set winnerTeamId in next match's slot)

### Circle Method (Round-Robin)
Standard algorithm for group phase scheduling. Fix position 0, rotate rest clockwise each round.
Generates n-1 rounds for n teams, each pair plays exactly once.

### Snake Seeding (Group Distribution)
FIFA/ITTF-standard serpentine distribution. Alternates direction each "row" to balance group strength.
8 teams, 2 groups: Group 0 = [seed1, seed4, seed5, seed8], Group 1 = [seed2, seed3, seed6, seed7]

### Double Elimination Losers Bracket
Alternating minor (internal) and major (WB feed-in) rounds:
- LR1 (minor): pairs of WR1 losers play each other
- LR2 (major): LR1 winners vs WR2 losers (CROSSED to minimize rematches)
- LR3 (minor): LR2 winners play each other
- Pattern continues until 1 LB finalist remains
- Grand Finals: WB finalist vs LB finalist, winnerAdvantage = game head-start for WB winner

## Finalization Integration

Finalization step 17 auto-advances the bracket when `isTournamentControlled=true` and `winnerUserId` is set. It calls `advanceBracketMatch` to place the winner in the next match slot. Rollback (`rollback_bracket_match`) clears `winnerTeamId` and removes the winner from the next match slot.

## Key Decisions

- **BracketSide enum** (5 variants: Winners, Losers, GrandFinals, ThirdPlace, Group) replaces `isLosersBracket: bool` -- supports GrandFinals, ThirdPlace, Group as first-class match types (Phase 4)
- **Explicit FK links** (nextWinnerMatchId, nextLoserMatchId) -- no JSON blob storage
- **teamId** on GroupStanding (renamed from participantUserId in Phase 4, then from participantTeamId in Phase 04.1) -- standings track teams
- **seedNumber** on TournamentTeam (moved from TournamentParticipant in Phase 4) -- seeding is team-level
- **Solo auto-team**: solo tournament registrations auto-create TournamentTeam rows -- bracket generation treats all participants uniformly as teams
- `groupId` is a simple number, not a separate table -- groups are implicit within a tournament
- Deterministic seeding hash for 'random' mode: `(tournamentId * 31 + teamId) % 2147483647` -- reducers must be deterministic (no Math.random())
- **Cancellation cleanup**: BracketMatch and GroupStanding rows cascade-deleted by `cancel_tournament` via `cascadeCleanupTournament()`. MatchResultRecord preserved (player history)
