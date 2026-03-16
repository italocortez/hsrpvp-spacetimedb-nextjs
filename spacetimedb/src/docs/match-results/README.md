# Match Results

## Tables

```
MatchResultRecord (the series — e.g., a BO3)
│  id (PK, autoInc)
│  bracketMatchId? → BracketMatch.id (null for casual matches)
│  lobbyId         → Lobby.id
│  player1Id       → User.id
│  player2Id       → User.id
│  isTournamentMatch
│  status (MatchResultStatus: Pending → Submitted → Disputed → Validated → Rejected)
│  winnerId?       → User.id
│  mmrProcessedAt? → guard against double ELO processing
│
└── MatchResultGame (each individual game within the series)
      PK: [matchResultId, gameNumber]
      matchResultId → MatchResultRecord.id
      gameNumber    → 1, 2, 3... (in a BO3)
      gameMode      → GameMode enum
      player1ScreenshotUrl?, player2ScreenshotUrl?
      player1CyclesUsed?, player2CyclesUsed?     (MoC/AA format)
      player1Score?, player2Score?                (AS format)
      player1Boss1Score?, player1Boss2Score?      (per-boss breakdown)
      player2Boss1Score?, player2Boss2Score?
      winnerId?     → User.id
      validationStatus (ValidationStatus: Pending/Confirmed/Disputed)
      validatedById? → User.id (referee or admin)
```

## Flow

1. Lobby finishes → `MatchResultRecord` created with `status: Pending`
2. Both players submit scores per game → `MatchResultGame` rows inserted/updated
3. **Casual match**: Auto-confirms when both scores match → `status: Validated`
4. **Casual mismatch**: Goes to re-submit flow, then escalates to referee if still disagreed
5. **Tournament match**: Requires referee/admin `validate_match_result` call
6. On `Validated`: `winnerId` set on parent, triggers ELO calculation (Phase 5), bracket advancement (Phase 4)
7. `mmrProcessedAt` is set after ELO processing — prevents double application

## Key Decisions

- Table name is `match_result_record` (not `match_result`) to avoid PascalCase collision with the `MatchResult` enum
- Per-game scoring: each game in a series has independent scores, screenshots, and validation
- Score format varies by game mode: cycles for MoC/AA, score points for Apocalyptic Shadow
