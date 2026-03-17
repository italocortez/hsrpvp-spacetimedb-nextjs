# Match Results

Architecture documentation for match result submission, confirmation, disputes, and administrative overrides.

---

## Match Result Submission Flow

```
Both teams fill scores
        |
        v
Team 1 calls confirm_match_scores --> team1Confirmed = true
        |
        v
Team 2 calls confirm_match_scores --> team2Confirmed = true
        |
        v
Referee calls submit_match_result (requires BOTH confirmed) --> status: Submitted
        |
        +---- Either player can dispute once (dispute_match_result) --> status: Disputed
        |                                                                        |
        v                                                                        v
status: Validated (TO/Mod validates)                             TO/Mod: override_match_result
        |                                                           (Validated or Rejected)
        v
MMR calculation triggered [Phase 5 scope]
Bracket advancement triggered [Phase 4 scope]
```

---

## Match Types

| matchType | Value | Description |
|-----------|-------|-------------|
| Casual | 0 | Non-competitive lobby match |
| Ranked | 1 | Ranked competitive match (counts toward MMR) |
| Tournament | 2 | Tournament bracket match (isTournamentMatch = true) |

---

## Status Lifecycle

```
Pending --> Submitted --> Validated
                 |
                 +--> Disputed --> Validated
                 |             \-> Rejected
                 |
                 (TO/Mod can also override directly)
```

| Status | Description |
|--------|-------------|
| Pending | Match is in progress; teams can confirm scores |
| Submitted | Referee has submitted the result; can be disputed |
| Disputed | A player has contested the result; awaiting TO/Mod review |
| Validated | TO/Mod confirmed the result as official |
| Rejected | TO/Mod rejected the result (rematch may be needed) |

---

## Referee System

### Referee Flag (isReferee on LobbyMember)

- The referee flag is per-lobby and stored as `isReferee: bool` on `LobbyMember`
- There should be exactly one referee per lobby at a time
- **Transfer:** The current referee can transfer the flag to any other lobby member via `transfer_referee`
- **Reclaim:** The lobby host can always reclaim the flag from whoever holds it via `reclaim_referee`
- **Auto-assignment:** Assigning the referee flag to the lobby host at lobby creation time is deferred to **Phase 9** (lobby creation reducers)

### Who Can Submit

`submit_match_result` grants submission authority to (in priority order):
1. The lobby member with `isReferee = true`
2. Any user with `Moderator` or `Admin` role
3. For tournament matches: the tournament organizer or an assistant with `canValidateResults = true`

---

## Tournament Admin Overrides

| Reducer | Who Can Call | When |
|---------|-------------|------|
| `dq_participant` | TO, tournament assistant, Moderator, Admin | Any time participant is not already DQ/Withdrawn |
| `override_match_result` | TO/assistant/Mod/Admin (tournament); Mod/Admin (casual) | Any time; use `newStatusTag: Validated` or `Rejected` |

### Override Reason Storage

The `disputeReason` column on `MatchResultRecord` is reused to store the override reason when a TO/Mod calls `override_match_result`. This keeps the schema minimal while preserving an audit trail.

---

## Key Rules

1. **Both teams must confirm before referee can submit** — `team1Confirmed` AND `team2Confirmed` must both be `true`
2. **One dispute per match** — `disputedByUserId` acts as a lock; once set, further disputes are blocked
3. **Dispute requires Submitted status** — cannot dispute a Pending or already-disputed result
4. **Score confirmation requires Pending status** — cannot re-confirm after submission
5. **MMR calculation deferred to Phase 5** — `submit_match_result` only sets status to `Submitted`; no MMR change happens in Phase 3
6. **Bracket advancement deferred to Phase 4** — the bracket is not updated when a match result is submitted in Phase 3

---

## Table Reference

### MatchResultRecord

| Column | Type | Description |
|--------|------|-------------|
| id | u32 autoInc | Primary key |
| bracketMatchId | u32? | FK to BracketMatch (Phase 4) |
| lobbyId | u32 | FK to Lobby where match was played |
| player1Id | u32 | First player (blue team) |
| player2Id | u32 | Second player (red team) |
| isTournamentMatch | bool | True if this is a tournament bracket match |
| status | MatchResultStatus | Pending, Submitted, Disputed, Validated, Rejected |
| winnerId | u32? | Winning player ID; undefined = draw |
| mmrProcessedAt | timestamp? | Set when MMR is applied (Phase 5) |
| team1Confirmed | bool | Player1 confirmed their scores |
| team2Confirmed | bool | Player2 confirmed their scores |
| refereeUserId | u32? | User who submitted the result |
| disputedByUserId | u32? | User who raised the dispute |
| disputeReason | string? | Dispute reason or admin override reason |
| tournamentId | u32? | FK to Tournament (if isTournamentMatch) |
| matchType | u8 | 0=Casual, 1=Ranked, 2=Tournament |

### Indexes

- `lobby_id` — filter by lobby
- `player_1_id` — filter by player 1
- `player_2_id` — filter by player 2
- `tournament_id` — filter by tournament

---

## Phase 3 Scope Notes

- Table name is `match_result_record` (not `match_result`) to avoid PascalCase collision with the `MatchResult` enum
- Phase 3 implements the confirmation and submission flow only — no per-game scoring rows in this phase
- Per-game scoring (MatchResultGame rows, screenshot URLs, cycle counts) is a future scope item
- `mmrProcessedAt` is reserved for Phase 5 ELO processing and is not set by Phase 3 reducers
