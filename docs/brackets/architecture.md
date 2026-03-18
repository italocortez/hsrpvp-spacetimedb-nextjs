# Brackets & Group Standings

## Tables

```
Tournament
│   id (PK, autoInc)
│   format            → TournamentFormat enum (SingleElimination|DoubleElimination|GroupOnly|GroupIntoSingleElim|GroupIntoDoubleElim)
│   groupSize         → target group size for round-robin (min 3)
│   groupAdvanceCount → teams advancing from each group to elimination
│   groupAssignmentMode → GroupAssignmentMode (Auto|Manual)
│   has3rdPlaceMatch  → controls 3rd place match generation
│   autoAdvanceBracket → controls auto vs manual advancement
│   winnerAdvantage   → head-start games for WB finalist in GrandFinals
│
├── BracketMatch (one row per match slot in the bracket)
│     id (PK, autoInc)
│     tournamentId     → Tournament.id
│     roundNumber, matchNumber
│     bracketSide      → BracketSide enum (Winners|Losers|GrandFinals|ThirdPlace|Group)
│     groupId?         → group number (for Group bracketSide only)
│     participant1Id?  → TournamentTeam.id (null = slot not yet filled or BYE)
│     participant2Id?  → TournamentTeam.id
│     nextWinnerMatchId? → BracketMatch.id (winner advances here)
│     nextLoserMatchId?  → BracketMatch.id (loser goes here — double elim only)
│     lobbyId?         → Lobby.id (set when match is played)
│     winnerId?        → TournamentTeam.id (pre-set for BYE matches, otherwise set after result)
│     bestOf, gameMode, winnerAdvantage, checkInRequired
│     resultStatus     → MatchResultStatus (Pending|Submitted|Disputed|Validated|Rejected)
│     Indexes: tournament_id (btree), lobby_id (btree)
│
├── GroupStanding (round-robin standings per team per group)
│     PK: [tournamentId, groupId, participantTeamId]
│     tournamentId       → Tournament.id
│     groupId            → group number
│     participantTeamId  → TournamentTeam.id  (renamed from participantUserId in Phase 4)
│     wins, losses, draws, points
│     Index: tournament_id (btree)
│
└── TournamentTeam (tournament-scoped team, also used for solo players)
      id (PK, autoInc)
      tournamentId       → Tournament.id
      name
      captainUserId      → User.id
      seedNumber?        → seeding rank (1 = top seed). Set by seed_bracket or swap_seeds.
      Indexes: tournament_id (btree), captain_user_id (btree)
```

## Reducers

| Reducer | Permission | Description |
|---------|-----------|-------------|
| `generate_bracket` | Tournament Access (TO/assistant/mod/admin) | Generates bracket for all 5 formats. Deletes existing BracketMatch and GroupStanding rows first (regeneration). Tournament must be in Seeding stage. |
| `seed_bracket` | Tournament Access | Assigns seedNumber to all active TournamentTeams. Mode: 'mmr' (sort by captain's MmrRating) or 'random' (deterministic hash). |
| `swap_seeds` | Tournament Access | Exchanges seedNumber between two TournamentTeams. Both must belong to the tournament. |

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
3. Auto-advance BYE matches (place pre-set winnerId in next match's slot)

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

## Flow — Single Elimination

1. TO calls `seed_bracket(mode: 'mmr'|'random')` → seedNumbers assigned to TournamentTeams
2. TO calls `generate_bracket` → creates BracketMatch rows with participant slots filled from seeded teams
   - BYE matches: winnerId pre-set, winner auto-placed in next round slot immediately
   - Inner rounds: participant slots remain empty until advancement fills them
3. `generate_bracket` during Seeding stage = regeneration (deletes all existing bracket rows first)
4. TO calls `advance_tournament_stage` → Seeding -> InProgress (validates bracket is complete)
5. Match results confirmed → `advance_bracket_match` places winner in `nextWinnerMatchId` slot

## Flow — Double Elimination

Same as single, plus:
- Losers route to `nextLoserMatchId` instead of being eliminated
- Losers bracket uses alternating minor/major rounds
- WB losers feed into LB in CROSSED order to minimize rematches
- GrandFinals: bracketSide='GrandFinals', winnerAdvantage from Tournament settings
- Optional ThirdPlace match: bracketSide='ThirdPlace', WB semifinal losers route there

## Flow — Group Phase (GroupOnly)

1. TO calls `generate_bracket` → creates round-robin BracketMatch rows (bracketSide='Group')
   - Auto assignment: snake seeding across groups
   - Manual assignment: sequential (TO can call `swap_seeds` to adjust)
   - GroupStanding rows created (wins/losses/draws/points all start at 0)
2. Match results update GroupStanding rows (via bracket advancement reducers in Phase 4 Plan 03)
3. Top groupAdvanceCount teams per group advance to elimination bracket or complete the tournament

## Flow — Hybrid Formats (GroupIntoSingleElim / GroupIntoDoubleElim)

1. `generate_bracket` creates both group phase matches AND empty elimination bracket
   - Group match positionKeys: "G{groupId}-R{round}-M{match}"
   - Elimination match positionKeys: "E-W-R{round}-M{match}" (prefixed with "E-")
   - All elimination participant slots are empty at generation time
2. Group phase plays out; standings updated per match result
3. When all groups complete, elimination slots filled from standings (handled by advancement reducers)

## Key Decisions

- **BracketSide enum** (5 variants) replaces `isLosersBracket: bool` — supports GrandFinals, ThirdPlace, Group as first-class match types (Phase 4)
- **Explicit FK links** (nextWinnerMatchId, nextLoserMatchId) — no JSON blob storage
- **participantTeamId** on GroupStanding (renamed from participantUserId in Phase 4) — standings track teams
- **seedNumber** on TournamentTeam (moved from TournamentParticipant in Phase 4) — seeding is team-level
- **Solo auto-team**: solo tournament registrations auto-create TournamentTeam rows — bracket generation treats all participants uniformly as teams
- `groupId` is a simple number, not a separate table — groups are implicit within a tournament
- Deterministic seeding hash for 'random' mode: `(tournamentId * 31 + teamId) % 2147483647` — reducers must be deterministic (no Math.random())
