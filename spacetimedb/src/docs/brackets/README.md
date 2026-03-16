# Brackets & Group Standings

## Tables

```
Tournament
│
├── BracketMatch (one row per match slot in the bracket)
│     id (PK, autoInc)
│     tournamentId     → Tournament.id
│     roundNumber, matchNumber
│     bracketSide      → "winners" / "losers" / "grand_finals" / "group"
│     groupId?         → group number (for group phase)
│     participant1Id?  → TournamentParticipant (conceptual FK)
│     participant2Id?
│     nextWinnerMatchId? → BracketMatch.id (winner advances here)
│     nextLoserMatchId?  → BracketMatch.id (loser goes here — double elim only)
│     lobbyId?         → Lobby.id (set when match is played)
│     winnerId?        → User.id
│     bestOf
│
└── GroupStanding (round-robin standings per group)
      PK: [tournamentId, groupId, participantUserId]
      tournamentId      → Tournament.id
      groupId           → group number
      participantUserId → User.id
      wins, losses, draws, points
```

## Flow — Single Elimination

1. TO calls `generate_bracket` → creates BracketMatch rows with `nextWinnerMatchId` FKs
2. Seeding fills `participant1Id`/`participant2Id` on first-round matches
3. Players create lobby, link to bracket match via `lobbyId`
4. Match result confirmed → `winnerId` set → winner auto-placed in `nextWinnerMatchId` slot

## Flow — Double Elimination

Same as single, but losers go to `nextLoserMatchId` instead of being eliminated. Grand finals has `bracketSide: "grand_finals"` with `grandFinalsAdvantage` from Tournament settings.

## Flow — Group Phase

1. `generate_bracket` creates round-robin BracketMatch rows with `bracketSide: "group"`
2. `GroupStanding` rows track wins/losses/draws/points per participant per group
3. Top N advance (`groupAdvanceCount` from Tournament) into elimination bracket

## Key Decisions

- **Explicit FK links** (nextWinnerMatchId, nextLoserMatchId) — no JSON blob storage
- `groupId` is a simple number, not a separate table — groups are implicit within a tournament
- Seeding supports manual assignment and MMR-based auto-seeding
