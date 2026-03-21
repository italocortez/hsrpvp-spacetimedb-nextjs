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
  submit_match_result --> status depends on matchType:
          |
          +---- Casual: status -> Validated (auto) -> finalize immediately (no MMR)
          |
          +---- Ranked: status -> Submitted -> awaits Admin/Mod/TO validation
                    |
                    +---- Any participant can dispute once --> status: Disputed
                    |                                                   |
                    v                                                   v
            override_match_result("Validated")            override_match_result
            (screenshots required for Ranked)             (Validated or Rejected)
                    |
                    v
            Finalization path triggered [see Match Result Lifecycle]
            Bracket advancement triggered [Phase 4 scope]
```

---

## Match Types

| matchType | Description |
|-----------|-------------|
| Casual | Non-competitive match. Auto-validates on submit. No MMR. Screenshots optional. |
| Ranked | Competitive match. Requires Admin/Mod/TO validation. Counts toward MMR. Screenshots required. |

### matchType Derivation for Tournament Matches

For tournament-controlled matches, matchType is derived from the tournament's `countTowardsMmr` setting:
- `countTowardsMmr = true` → matchType = **Ranked**
- `countTowardsMmr = false` → matchType = **Casual**

This derivation happens at MatchResultRecord creation time. After creation, matchType on the
record is self-contained -- no need to re-check the tournament setting.

### isTournamentControlled vs matchType

These two fields serve different purposes and both remain on MatchResultRecord:

- **matchType** (MatchType enum: Casual, Ranked) -- Determines validation and MMR behavior.
  Casual auto-validates and skips MMR. Ranked requires manual validation and processes MMR.
  Also used for match history filtering, stat breakdowns, and UI display.

- **isTournamentControlled** (bool) -- Behavioral flag that changes how the match operates:
  - When true: lobby inherits tournament configuration (game mode, draft mode, cost set, disconnect policy)
  - When true: TO and assistants (canValidateResults) gain override/submission authority
  - When true: settings are locked -- players cannot change inherited config

A match can be isTournamentControlled=true with matchType=Casual (tournament with
countTowardsMmr=false) or matchType=Ranked (tournament with countTowardsMmr=true).

---

## Status Lifecycle

```
                    Casual: auto-Validated on submit
                   /
Pending --> Submitted
                   \
                    Ranked: stays Submitted until Admin/Mod/TO validates
                         |
                         +--> Disputed --> Validated
                         |             \-> Rejected
                         |
                         (TO/Mod can also override directly)
```

| Status | Description |
|--------|-------------|
| Pending | Match is in progress; captains can confirm scores |
| Submitted | Result submitted; Casual auto-validates here, Ranked awaits Admin/Mod/TO |
| Disputed | A player has contested the result; awaiting TO/Mod review |
| Validated | Result confirmed as official (auto for Casual, manual for Ranked) |
| Rejected | TO/Mod rejected the result (rematch may be needed) |

---

## Match Result Lifecycle

MatchResultRecord is operational and ephemeral -- it exists only while the match result
is being confirmed, submitted, and processed. After finalization, the record is DELETED
and all permanent data lives in history tables.

### Finalization Paths

**Casual path (matchType=Casual):**
Submit -> auto-Validated -> finalize_match_result -> write MatchSessionHistory + MatchParticipantHistory + update PlayerStat/PlayerCharacterStat/PlayerRelationship -> delete MatchResultRecord
No MMR processing. Screenshots optional.

**Ranked path (matchType=Ranked, standalone):**
Submit -> Submitted -> Admin/Mod validates (screenshots required) -> Validated -> process MMR immediately -> stamp mmrProcessedAt -> finalize_match_result -> write history + stats -> delete MatchResultRecord

**Ranked tournament path (matchType=Ranked, isTournamentControlled=true):**
Submit -> Submitted -> TO/referee validates (screenshots required) -> Validated -> match stays (tournament in progress) -> tournament ends or cancelled -> process_tournament_mmr (batch all Validated matches) -> stamp mmrProcessedAt on each -> finalize_match_result per match -> write history + stats -> delete all MatchResultRecords

### Implementation Status
- finalize_match_result reducer: implemented (Phase 5) -- writes history, increments stats, advances bracket, deletes ephemeral records
- process_tournament_mmr reducer: implemented (Phase 5) -- batch processes MMR for tournament matches, stamps mmrProcessedAt
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

For **Casual** matches, submit also auto-validates — no separate validation step needed.
For **Ranked** matches, submit sets status to Submitted; a separate `override_match_result("Validated")` is required (by Admin/Mod/TO), and all MatchResultGame rows must have both screenshot URLs.

### Referee Full Control (refereeFullControl)

When `refereeFullControl=true` (default) and the referee is a **spectator** (not a participant):
- Referee can fill scores for either side via `record_game_scores`
- Referee can confirm both sides at once via `confirm_match_scores` (sets both blueConfirmed and redConfirmed)

When the referee IS a **participant** (has a MatchResultParticipant row):
- `refereeFullControl` is ignored for confirmation — they can only confirm their own side
- They still have submission authority via `submit_match_result`

This setting is inherited from the lobby/tournament configuration.

---

## Tournament Admin Overrides

| Reducer | Who Can Call | When |
|---------|-------------|------|
| `dq_participant` | TO, tournament assistant, Moderator, Admin | Any time participant is not already DQ/Withdrawn |
| `override_match_result` | TO/assistant/Mod/Admin (tournament); Mod/Admin (standalone Ranked) | Any time; `newStatusTag: Validated` (screenshots required for Ranked) or `Rejected` |

### Override Reason Storage

The `disputeReason` column on `MatchResultRecord` is reused to store the override reason when a TO/Mod calls `override_match_result`. This keeps the schema minimal while preserving an audit trail.

---

## Key Rules

1. **Both sides must confirm before referee can submit** -- MatchResultRecord.blueConfirmed and redConfirmed must both be true. Captains confirm their own side; spectator referee with refereeFullControl=true can confirm both.
2. **One dispute per match** -- `disputedByUserId` acts as a lock; once set, further disputes are blocked
3. **Dispute requires Submitted status** -- cannot dispute a Pending or already-disputed result
4. **Score confirmation requires Pending status** -- cannot re-confirm after submission
5. **Casual matches auto-validate on submit** -- `submit_match_result` sets status directly to Validated for Casual matches; Ranked stays at Submitted
6. **Ranked validation requires screenshots** -- `override_match_result("Validated")` rejects if any MatchResultGame row is missing teamBlueScreenshotUrl or teamRedScreenshotUrl
7. **MMR only for Ranked matches** -- Casual matches skip MMR entirely; Ranked matches process MMR (immediate for standalone, batched for tournaments)
8. **Bracket advancement runs atomically during finalization** -- finalize_match_result calls advanceBracketMatch when bracketMatchId is set and winnerTeamId isn't already assigned (idempotent with submit_and_advance_bracket)

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
| blueConfirmed | bool | True when Blue side captain (or spectator referee) has confirmed scores |
| redConfirmed | bool | True when Red side captain (or spectator referee) has confirmed scores |
| refereeFullControl | bool | When true, spectator referee can fill scores and confirm both sides (default true) |
| matchType | MatchType enum | Casual or Ranked (derived from tournament.countTowardsMmr for tournament matches) |

### Indexes

- `lobby_id` -- filter by lobby
- `tournament_id` -- filter by tournament

### MatchResultParticipant

| Column | Type | Description |
|--------|------|-------------|
| matchResultId | u32 | FK to MatchResultRecord.id |
| userId | u32 | FK to User.id |
| teamSide | TeamLabel enum | Blue or Red team assignment |
| isCaptain | bool | True if this participant can confirm scores on behalf of their team |

PK: [matchResultId, userId]

Captain pattern: In 1v1, both participants have isCaptain=true (each confirms for themselves). In team formats, only the designated team captain can confirm. Confirmation state is stored on MatchResultRecord (blueConfirmed/redConfirmed), not on participants.

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

## Reducer Reference

| Reducer | Permission | Description |
|---------|-----------|-------------|
| confirm_match_scores | Captain or spectator referee | Confirms scores for a side |
| submit_match_result | Referee/Mod/Admin/TO | Submits result; Casual auto-validates (D-04) |
| dispute_match_result | Match participant | Disputes submitted result |
| override_match_result | TO/Mod/Admin | Override to Validated/Rejected; Ranked requires screenshots |
| record_game_scores | Captain or spectator referee | Upserts per-game scores and screenshots |
| finalize_match_result | Referee/Mod/Admin/TO | Writes history, stats, advances bracket, deletes ephemeral; inline MMR for standalone Ranked |
| process_tournament_mmr | TO/Mod/Admin | Batch MMR for completed tournament |

---

## Phase 3 Scope Notes

- Table name is `match_result_record` (not `match_result`) to avoid PascalCase collision with the `MatchResult` enum
- Phase 3 implements the confirmation and submission flow only -- no per-game scoring rows in this phase
- Per-game scoring (MatchResultGame rows, screenshot URLs, cycle counts) added in Phase 04.1
- `mmrProcessedAt` is reserved for Phase 5 ELO processing and is not set by Phase 3 reducers
