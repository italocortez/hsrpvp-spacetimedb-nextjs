# Match Results

Architecture documentation for match result submission, confirmation, disputes, and administrative overrides.

---

## Match Result Submission Flow

```
  Each participant's captain fills scores per game (MatchResultGame rows)
          |
          v
  Captain A calls confirm_match_scores --> MatchResultParticipant.isConfirmed = true
          |                                  (looked up by isCaptain=true for their side)
          v
  Captain B calls confirm_match_scores --> MatchResultParticipant.isConfirmed = true
          |
          v
  ALL captains confirmed? (every MatchResultParticipant with isCaptain=true has isConfirmed=true)
          |
          v
  Referee calls submit_match_result --> status: Submitted
          |
          +---- Any participant can dispute once (dispute_match_result) --> status: Disputed
          |                                                                        |
          v                                                                        v
  status: Validated (TO/Mod validates)                             TO/Mod: override_match_result
          |                                                           (Validated or Rejected)
          v
  Finalization path triggered [Phase 5 scope -- see Match Result Lifecycle]
  Bracket advancement triggered [Phase 4 scope]
```

---

## Match Types

| matchType | Description |
|-----------|-------------|
| Casual | Non-competitive lobby match |
| Ranked | Ranked competitive match (counts toward MMR) |
| Tournament | Tournament bracket match (isTournamentControlled = true) |

### isTournamentControlled vs matchType

These two fields serve different purposes and both remain on MatchResultRecord:

- **matchType** (MatchType enum: Casual, Ranked, Tournament) -- Client-facing filter category.
  Used for match history filtering, stat breakdowns, and UI display.

- **isTournamentControlled** (bool) -- Behavioral flag that changes how the match operates:
  - When true: lobby inherits tournament configuration (game mode, draft mode, cost set, disconnect policy)
  - When true: TO and assistants (canValidateResults) gain override/submission authority
  - When true: settings are locked -- players cannot change inherited config

A match can have matchType=Tournament but isTournamentControlled=false (e.g., a custom match
labeled "tournament" for organizational purposes without actual tournament integration).

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
| Pending | Match is in progress; captains can confirm scores |
| Submitted | Referee has submitted the result; can be disputed |
| Disputed | A player has contested the result; awaiting TO/Mod review |
| Validated | TO/Mod confirmed the result as official |
| Rejected | TO/Mod rejected the result (rematch may be needed) |

---

## Match Result Lifecycle

MatchResultRecord is operational and ephemeral -- it exists only while the match result
is being confirmed, submitted, and processed. After finalization, the record is DELETED
and all permanent data lives in history tables.

### Finalization Paths

**Non-MMR path (MMR disabled on tournament/lobby):**
Validated -> finalize_match_result -> write MatchSessionHistory + MatchParticipantHistory + update PlayerStat/PlayerCharacterStat/PlayerRelationship -> delete MatchResultRecord

**Casual/Ranked MMR path:**
Validated -> process MMR immediately -> stamp mmrProcessedAt -> finalize_match_result -> write history + stats -> delete MatchResultRecord

**Tournament MMR path:**
Validated -> match stays (tournament still in progress) -> tournament ends or cancelled -> process_tournament_mmr (batch all Validated matches) -> stamp mmrProcessedAt on each -> finalize_match_result per match -> write history + stats -> delete all MatchResultRecords

### Implementation Status
- finalize_match_result reducer: stub exists (Phase 04.1), implementation Phase 5
- process_tournament_mmr reducer: stub exists (Phase 04.1), implementation Phase 5
- mmrProcessedAt column: present on MatchResultRecord, used as finalization gate

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

1. **All captains must confirm before referee can submit** -- All MatchResultParticipant rows with isCaptain=true must have isConfirmed=true
2. **One dispute per match** -- `disputedByUserId` acts as a lock; once set, further disputes are blocked
3. **Dispute requires Submitted status** -- cannot dispute a Pending or already-disputed result
4. **Score confirmation requires Pending status** -- cannot re-confirm after submission
5. **MMR calculation deferred to Phase 5** -- `submit_match_result` only sets status to `Submitted`; no MMR change happens in Phase 3
6. **Bracket advancement deferred to Phase 4** -- the bracket is not updated when a match result is submitted in Phase 3

---

## Table Reference

### MatchResultRecord

| Column | Type | Description |
|--------|------|-------------|
| id | u32 autoInc | Primary key |
| bracketMatchId | u32? | FK to BracketMatch (Phase 4) |
| lobbyId | u32 | FK to Lobby where match was played |
| isTournamentControlled | bool | Behavioral flag: true if lobby inherits tournament config and TO has authority |
| status | MatchResultStatus | Pending, Submitted, Disputed, Validated, Rejected |
| winnerUserId | u32? | Winning user ID; undefined = draw |
| mmrProcessedAt | timestamp? | Set when MMR is applied (Phase 5); finalization gate |
| refereeUserId | u32? | User who submitted the result |
| disputedByUserId | u32? | User who raised the dispute |
| disputeReason | string? | Dispute reason or admin override reason |
| tournamentId | u32? | FK to Tournament (if isTournamentControlled) |
| matchType | MatchType enum | Casual, Ranked, Tournament (client-facing filter category) |

### Indexes

- `lobby_id` -- filter by lobby
- `tournament_id` -- filter by tournament

### MatchResultParticipant

| Column | Type | Description |
|--------|------|-------------|
| matchResultId | u32 | FK to MatchResultRecord.id |
| userId | u32 | FK to User.id |
| teamSide | TeamLabel enum | Blue or Red team assignment |
| isCaptain | bool | True if this participant confirms scores on behalf of their team |
| isConfirmed | bool | True when captain has confirmed scores for their side |

PK: [matchResultId, userId]

Confirmation pattern: In 1v1, both participants have isCaptain=true (each confirms for themselves). In team formats, only the designated team captain confirms on behalf of their side.

### Indexes

- `match_result_id` -- filter by match result
- `user_id` -- filter by user
- `by_result_and_user` -- composite lookup

### MatchResultGame

| Column | Type | Description |
|--------|------|-------------|
| matchResultId | u32 | FK to MatchResultRecord.id |
| gameNumber | u8 | Game number in the series (1, 2, 3...) |
| gameMode | GameMode enum | MoC, AS, AA |
| teamBlueScreenshotUrl | string? | Screenshot proof for blue team |
| teamRedScreenshotUrl | string? | Screenshot proof for red team |
| teamBlueCyclesUsed | u32? | Cycles used by blue team |
| teamRedCyclesUsed | u32? | Cycles used by red team |
| teamBlueScore | u64? | Blue team score |
| teamRedScore | u64? | Red team score |
| teamBlueBoss1Score | u64? | Blue team boss 1 score |
| teamBlueBoss2Score | u64? | Blue team boss 2 score |
| teamRedBoss1Score | u64? | Red team boss 1 score |
| teamRedBoss2Score | u64? | Red team boss 2 score |
| winnerTeamSide | TeamLabel enum | Which team side won this game (Blue or Red) |
| validationStatus | ValidationStatus enum | Pending, Validated, Rejected |
| validatedByUserId | u32? | User who validated this game |

PK: [matchResultId, gameNumber]

### Indexes

- `match_result_id` -- filter by match result
- `by_result_and_game` -- composite lookup

---

## Table Relationships

MatchResultRecord is the hub. MatchResultParticipant and MatchResultGame are siblings
that both FK to MatchResultRecord -- they are NOT parent-child of each other.

```
  MatchResultParticipant (who played, which side, captain flag, confirmation)
          |
          |  FK: matchResultId -> MatchResultRecord.id
          |
  MatchResultRecord (lifecycle status, bracket link, dispute, MMR guard, ephemeral)
          |
          |  FK: matchResultId -> MatchResultRecord.id
          |
  MatchResultGame (per-game scores by team side, screenshots, validation)
```

Participants track WHO is in the match and their confirmation status.
Games track WHAT happened in each game of the series.
The Record tracks the overall lifecycle and administrative state.

All three are deleted together when finalize_match_result runs.

---

## Phase 3 Scope Notes

- Table name is `match_result_record` (not `match_result`) to avoid PascalCase collision with the `MatchResult` enum
- Phase 3 implements the confirmation and submission flow only -- no per-game scoring rows in this phase
- Per-game scoring (MatchResultGame rows, screenshot URLs, cycle counts) added in Phase 04.1
- `mmrProcessedAt` is reserved for Phase 5 ELO processing and is not set by Phase 3 reducers
