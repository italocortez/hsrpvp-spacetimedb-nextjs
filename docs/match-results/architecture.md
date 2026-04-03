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
| matchOutcome | MatchOutcome? | BlueWins, RedWins, Draw, or **Concede** (Phase 10); optional, set when outcome is determined |
| concedeTrigger | ConcedeTrigger? | Disconnect, VoluntaryLeave, or RefereeDecision (Phase 10); what caused the concede |
| concedeSummary | string? | Deterministic audit string (Phase 10): who disconnected, at what step, pool remaining, stage |
| concedeAtStage | string? | LobbyStage tag at time of concede (Phase 10): "Drafting", "Equipping", or "Scoring" |

### Indexes

- `lobby_id` -- filter by lobby
- `tournament_id` -- filter by tournament

### MatchResultParticipant

| Column | Type | Description |
|--------|------|-------------|
| matchResultId | u32 | FK to MatchResultRecord.id |
| userId | u32 | FK to User.id |
| teamSide | TeamSide enum | Blue or Red team assignment |
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
| winnerTeamSide | TeamSide enum | Which team side won this game (Blue or Red) |
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

## Auto-Finalize Casual (Phase 6 execution — D-37)

For Casual matches, `submit_match_result` runs the full finalization pipeline inline:

1. Status set to Validated (auto)
2. `runFinalization()` called immediately within the same transaction
3. All history archival, stat increments, and ephemeral cleanup happen atomically
4. No separate `finalize_match_result` call needed for Casual matches

This eliminates the gap between submit and finalize for Casual matches. Both sides have already agreed via captain confirmation, so there is no dispute window.

---

## MatchResultGameHistory (Phase 6 execution — D-51)

Archival mirror of `MatchResultGame`. Created during finalization (step 9 of the pipeline).

| Column | Type | Description |
|--------|------|-------------|
| matchHistoryId | u32 | FK to MatchSessionHistory.id |
| gameNumber | u8 | Game number in the series |
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
| winnerTeamSide | TeamSide enum | Which team won this game |

PK: [matchHistoryId, gameNumber]

---

## Finalization Pipeline (Phase 6 execution — D-56)

Extracted to `helpers/finalizationHelpers.ts` as `runFinalization()`. Called by both `finalize_match_result` (ranked/tournament) and `submit_match_result` (casual auto-finalize).

### 19-Step Pipeline

**Reads (1-6):**
1. Read MatchResultParticipant rows
2. Read MatchResultGame rows
3. Read Lobby
4. Read MatchSessionStep rows (sorted by sequence)
5. Read active Season (seasonId defaults to 0 for pre-season)
6. Determine gameMode, draftMode, matchType, teamSize

**Writes (7-18):**
7. Write MatchSessionHistory row (no rosterBlue/rosterRed per D-52)
8. Write MatchSessionStepHistory rows — individual rows per step (per D-50/D-54)
9. Write MatchResultGameHistory rows — mirror of MatchResultGame (per D-51)
10. Write MatchParticipantHistory rows — with denormalized displayName (per D-53)
11. Process MMR (standalone Ranked only) — call processMatchMmr, stamp mmrProcessedAt, rebuild leaderboard with seasonId
12. Tournament batch back-fill — update MmrHistory sentinel matchHistoryId
13. Increment PlayerStat per participant (wins/losses/draws)
14. Increment matchesSpectated for lobby spectators (per D-30)
15. Increment PlayerRelationship per participant pair (ally/opponent)
16. Increment character stats — PlayerCharacterStat (pick/ban/faced), GlobalCharacterStat (per D-54)
17. Bracket advancement (tournament-controlled matches)
18. Delete ephemeral records (games, participants, steps, MatchResultRecord)
19. Cascade-delete lobby via `_hardDeleteLobby` (lobby no longer needed — submit_match_result already set AwaitingResult and freed players)

---

## Lobby requireOwnership (Phase 6 execution — D-17/D-18/D-19)

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| requireOwnership | bool | true (Ranked) / false (Casual) | When true, pick reducer validates against HsrAccountCharacter |

- Auto-defaults from matchType at lobby creation (D-18)
- Tournament lobbies inherit from tournament.requireRoster (D-19)
- Locked once lobby is created
- Phase 6 adds the column; Phase 9 wires it into pick/ban reducers

---

## Budget-Based Handicap for Auction Mode (D-51/D-52/D-88)

In Auction mode, the handicap calculation uses **budget spent by each team** instead of cost table sums.

### Classic Mode Handicap (existing)

1. Sum character costs for each team using `HsrCharacterCost` (per eidolon level, per game mode)
2. Difference in total cost between teams → handicap adjustment
3. Formula depends on game mode:
   - Memory of Chaos / Anomaly Arbitration: `-0.1875 cycles per cost point difference`
   - Apocalyptic Shadow: `+30 score per cost point difference`

### Auction Mode Handicap (D-51/D-52)

The cost input is different — Classic uses cost table sums, Auction uses budget consumption:

1. **Budget spent** = `characterBudget` (starting budget per team) − remaining character budget at end of auction
2. `teamBlueSpent` = initial `characterBudget` − `MatchSession.teamBlueCharBudget` at auction end
3. `teamRedSpent` = initial `characterBudget` − `MatchSession.teamRedCharBudget` at auction end
4. These values are stored on `MatchSessionHistory.teamBlueSpent` / `teamRedSpent` during finalization
5. The team that spent MORE got higher-cost characters, so the team with MORE **unspent** budget gets the handicap bonus (they underspent, suggesting weaker draft)
6. `handicapApplied` = the delta used in the formula, stored on `MatchSessionHistory`

**Formula unchanged:** Same MoC/AA and AS formulas as Classic. Only the input source differs.

### Columns on MatchSessionHistory

| Column | Type | Description |
|--------|------|-------------|
| teamBlueSpent | f32? | Budget consumed by Blue in Auction mode; null for Classic |
| teamRedSpent | f32? | Budget consumed by Red in Auction mode; null for Classic |
| handicapApplied | f32? | Handicap delta applied during finalization; null if no handicap |

---

## Phase 3 Scope Notes

- Table name is `match_result_record` (not `match_result`) to avoid PascalCase collision with the `MatchResult` enum
- Phase 3 implements the confirmation and submission flow only -- no per-game scoring rows in this phase
- Per-game scoring (MatchResultGame rows, screenshot URLs, cycle counts) added in Phase 04.1
- `mmrProcessedAt` is reserved for Phase 5 ELO processing and is not set by Phase 3 reducers

---

## ConcedeTrigger Enum (Phase 10)

| Variant | When |
|---------|------|
| Disconnect | All opposing team players offline > grace period; forfeit claimed |
| VoluntaryLeave | Player/team voluntarily surrenders or last player leaves team |
| RefereeDecision | 3rd party referee makes the call |

---

## Admin Match Toolbox (Phase 10)

| Reducer | Permission | Description |
|---------|-----------|-------------|
| `admin_force_finalize` | Moderator+ / TO / assistant | Resolves AwaitingResult match: sets winner, runs full finalization pipeline (D-52) |
| `admin_void_match` | Moderator+ / TO / assistant | Erases AwaitingResult match via hardDeleteLobby — no stats written (D-53) |
| `admin_set_bracket_winner` | Moderator+ / TO / assistant | Directly sets BracketMatch.winnerTeamId and advances bracket; requires winnerTeamId=0 first (D-54) |

### Processed Match Protection (D-56)
Once `mmrProcessedAt` is set, the match result is permanent:
- `admin_force_finalize` rejects
- `admin_void_match` rejects (lobby already gone post-finalization)
- `admin_set_bracket_winner` requires `winnerTeamId=0` (rollback first)

### Tournament Void Workflow (D-55)
`rollback_bracket_match` (undo advancement) -> `admin_void_match` (erase match) -> BracketMatch back to Pending -> TO creates new lobby for rematch

---

## Concede Finalization Matrix (Phase 10)

`runFinalization()` branches on `matchResult.matchOutcome?.tag === 'Concede'`. Each step is gated by `concedeFlags` per the 3-tier x 3-stage matrix.

### Tier 1: Casual Non-Tournament

| Step | Drafting | Equipping | Scoring |
|------|----------|-----------|---------|
| Archive steps/session/participants/games | No | No | No |
| Win/loss | No | No | Yes |
| Relationships | No | No | No |
| Character/global stats | No | No | No |
| MMR/Leaderboard | No | No | No |
| Spectated | No | No | No |
| Achievements | No | No | No |
| Bracket advance | N/A | N/A | N/A |
| Cleanup | Yes | Yes | Yes |

### Tier 2: Casual Tournament

| Step | Drafting | Equipping | Scoring |
|------|----------|-----------|---------|
| Archive steps | What exists | What exists | What exists |
| Archive session | No | No | No |
| Archive participants | Yes | Yes | Yes |
| Archive games | What exists | What exists | What exists |
| Win/loss | Yes | Yes | Yes |
| Relationships | Yes | Yes | Yes |
| Character/global stats | No | No | No |
| MMR/Leaderboard | No | No | No |
| Spectated | No | No | No |
| Achievements | No | No | No |
| Bracket advance | No (TO approval) | No (TO approval) | No (TO approval) |
| Cleanup | Yes | Yes | Yes |

### Tier 3: Ranked (tournament and non-tournament)

| Step | Drafting | Equipping | Scoring |
|------|----------|-----------|---------|
| Archive steps | What exists | What exists | What exists |
| Archive session | Yes | Yes | Yes |
| Archive participants | Yes | Yes | Yes |
| Archive games | What exists | What exists | What exists |
| Win/loss | Yes | Yes | Yes |
| Relationships | Yes | Yes | Yes |
| Character/global stats | No (draft incomplete) | Yes | Yes |
| MMR | Yes (non-tourn) | Yes (non-tourn) | Yes (non-tourn) |
| Leaderboard | Yes (non-tourn) | Yes (non-tourn) | Yes (non-tourn) |
| Spectated | Yes | Yes | Yes |
| Achievements | No | No | No |
| Bracket advance | No (TO approval) | No (TO approval) | No (TO approval) |
| Cleanup | Yes | Yes | Yes |

**Key rules:**
- Achievement check ALWAYS skipped for concede (D-76)
- Bracket advancement NEVER auto-triggers for concede (D-80) — BracketMatch.winnerTeamId set by performConcede, but placeParticipantInNextMatch not called
- Tournament MMR deferred to batch `process_tournament_mmr` (not inline)
