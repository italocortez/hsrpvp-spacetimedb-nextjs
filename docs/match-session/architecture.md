# Match Session (Draft System)

## Table Relationships

```
Lobby (PK: id)
│
├── MatchSession (PK: lobbyId → Lobby.id)       -- Active draft state per lobby
│     turnIndex, draftSequence, timerState
│     isAuctionPhase, nextNominatorTeam, blueCharactersWon, redCharactersWon
│     currentNomination, currentBidAmount, currentBidTeam
│     teamBlueCharBudget, teamRedCharBudget, teamBlueLcBudget, teamRedLcBudget
│     pausesUsedBlue, pausesUsedRed
│
├── MatchSessionStep (PK: id autoInc)            -- Per-action records during draft
│     lobbyId → Lobby.id
│     actorUserId → User.id
│     actorSlot: TeamLabel (Blue/Red/Spectator)
│     action: ActionType
│     payload: StepPayload
│
├── MatchSessionHistory (PK: id autoInc)         -- Archived completed matches
│     lobbyCode, playedAt, draftMode, gameMode
│     snapshotConfig: LobbyConfigSnapshot
│     outcome: MatchOutcome
│     teamBlueSpent, teamRedSpent, handicapApplied (Auction mode, D-88)
│     isPubliclyVisible (scouting prevention, D-84)
│
├── MatchSessionStepHistory (PK: [matchHistoryId, sequence]) -- Replay data
│     matchHistoryId → MatchSessionHistory.id
│     actorUserId, actorDisplayName (denormalized), teamSide
│     action: ActionType
│     targetName? (character or LC name)
│     payload? (JSON for action-specific data)
│
└── MatchParticipantHistory (PK: [userId, matchHistoryId])  -- Who played (junction)
      userId → User.id
      matchHistoryId → MatchSessionHistory.id
      teamSide: TeamLabel
      displayName (denormalized)
      isReferee, isCoach, isCaptain
```

---

## MatchSession Table

Active draft state. Created by `start_draft`, deleted by `finalize_match_result`.

**PK:** `lobbyId` (u32) — 1-to-1 with Lobby

| Column | Type | Description |
|--------|------|-------------|
| lobbyId | u32 PK | FK to Lobby.id |
| turnIndex | u32 | Current index into draftSequence (0-based) |
| draftSequence | DraftStep[] | Generated script of turns: [{teamTurn, actionRequired}] |
| timerState | TimerState | Turn timer, reserve bank, pause state |
| isAuctionPhase | bool | False during ban phase; true once all bans complete (Auction mode) |
| nextNominatorTeam | TeamLabel | Which team nominates next in Auction phase |
| blueCharactersWon | u8 | Characters acquired by Blue team so far (Auction) |
| redCharactersWon | u8 | Characters acquired by Red team so far (Auction) |
| currentNomination | string? | Character name currently up for bidding (null = no active auction) |
| currentBidAmount | f32? | Current highest bid amount |
| currentBidTeam | TeamLabel | Team holding the current bid (Spectator = sentinel for "no bid") |
| teamBlueCharBudget | f32 | Remaining character budget for Blue team |
| teamRedCharBudget | f32 | Remaining character budget for Red team |
| teamBlueLcBudget | f32 | Remaining lightcone budget for Blue team |
| teamRedLcBudget | f32 | Remaining lightcone budget for Red team |
| pausesUsedBlue | u8 | Number of player pauses used by Blue team (max 3) |
| pausesUsedRed | u8 | Number of player pauses used by Red team (max 3) |
| createdById | u32 | Audit |
| createdDate | timestamp | Audit |
| lastModifiedById | u32 | Audit |
| lastModifiedDate | timestamp | Audit |

**TimerState struct:**
- `turnStartAt`: timestamp — when current turn began
- `teamBlueReserveMs`: u32 — reserve bank milliseconds remaining for Blue
- `teamRedReserveMs`: u32 — reserve bank milliseconds remaining for Red
- `isPaused`: bool — true while paused
- `accumulatedPauseMs`: f32 — time remaining when paused (restored on resume)

---

## MatchSessionStep Table

Individual step records during an active draft. Deleted on lobby close or finalization.

**PK:** `id` (u32, autoInc)

| Column | Type | Description |
|--------|------|-------------|
| id | u32 autoInc | Primary key |
| lobbyId | u32 | FK to Lobby.id |
| sequence | u32 | Step number within this lobby's draft |
| actorUserId | u32 | Who performed this action (0 = system) |
| anonymousLabel | string? | Anonymized label when lobby has anonymous mode |
| actorSlot | TeamLabel | Blue, Red, or Spectator |
| action | ActionType | Enum of action types (see below) |
| payload | StepPayload | Discriminated union with action-specific data |
| timestamp | timestamp | When the step was recorded |

**ActionType variants:**
| Variant | Description |
|---------|-------------|
| Pick | Classic mode character pick |
| Ban | Character ban (Classic ban phase or Auction ban phase) |
| Nominate | Auction: put character up for bidding |
| Bid | Auction: raise the bid on current nomination |
| AuctionSold | Auction: character awarded to winning team |
| Pause | Draft timer paused |
| Undo | Referee undid last step |
| EquipLightcone | Equipping stage: attach LC to a character |
| ArrangeLineup | Equipping stage: set character position order |
| ConfirmLineup | Equipping stage: mark lineup as finalized |

**StepPayload variants (matching ActionType):**
- `Pick`: `{ characterName, eidolon, costPaid }`
- `Ban`: `{ characterName }`
- `Nominate`: `{ characterName, eidolon }`
- `Bid`: `{ amount, targetCharacter }`
- `AuctionSold`: `{ characterName, winningAmount, winningTeam, eidolon }`
- `Pause`: `{ timeRemainingMs, isAutoPause }`
- `Undo`: `{ originalSequenceId }`
- `EquipLightcone`: `{ characterName, lightconeName, superimposition, costPaid }`
- `ArrangeLineup`: `{ positions }` (JSON array of strings)
- `ConfirmLineup`: `{ confirmed }` (bool)

**Indexes:** `lobby_id` btree

---

## MatchSessionHistory Table

Archived completed matches. Permanent record after finalization.

**PK:** `id` (u32, autoInc)

| Column | Type | Description |
|--------|------|-------------|
| id | u32 autoInc | Primary key |
| lobbyCode | string | Lobby's joinCode at time of match |
| playedAt | timestamp | When match was played |
| draftMode | DraftMode | Classic or Auction |
| gameMode | GameMode | MemoryOfChaos, ApocalypticShadow, AnomalyArbitration |
| teamBlueAlias | string | Blue team name |
| teamRedAlias | string | Red team name |
| snapshotConfig | LobbyConfigSnapshot | Frozen lobby settings at match time |
| outcome | MatchOutcome | BlueWins, RedWins, Draw, Aborted |
| teamBlueSpent | f32? | Budget spent by Blue team (Auction mode, D-88) |
| teamRedSpent | f32? | Budget spent by Red team (Auction mode, D-88) |
| handicapApplied | f32? | Handicap delta applied during finalization (D-88) |
| isPubliclyVisible | bool | False during active tournament (prevents scouting, D-84) |

**Indexes:** `played_at` btree, `game_mode` btree

---

## MatchSessionStepHistory Table

Archived per-step data for match replay. One row per step (not a JSON blob).

**PK:** `[matchHistoryId, sequence]`

| Column | Type | Description |
|--------|------|-------------|
| matchHistoryId | u32 | FK to MatchSessionHistory.id |
| sequence | u32 | Step number (1, 2, 3...) |
| actorUserId | u32 | Who performed the action |
| actorDisplayName | string | Denormalized display name for replay |
| teamSide | TeamLabel | Blue, Red, or Spectator |
| action | ActionType | What action was taken |
| targetName | string? | Character or LC name (null for Pause/Undo/ArrangeLineup/ConfirmLineup) |
| payload | string? | JSON for action-specific data (bid amount, lineup positions, etc.) |

**Indexes:** `by_match_history` btree on [matchHistoryId]

---

## MatchParticipantHistory Table

Junction table linking users to match history records. Enables indexed "show me all matches user X played" queries.

**PK:** `[userId, matchHistoryId]`

| Column | Type | Description |
|--------|------|-------------|
| userId | u32 | FK to User.id |
| matchHistoryId | u32 | FK to MatchSessionHistory.id |
| teamSide | TeamLabel | Blue or Red |
| displayName | string | Denormalized at archival time (D-53/D-64) |
| isReferee | bool | Was this person the referee |
| isCoach | bool | Was this person a coach |
| isCaptain | bool | Was this person a captain |

**Indexes:** `by_user` [userId], `by_match_history` [matchHistoryId], `by_user_and_match` [userId, matchHistoryId]

---

## Stage Transitions

The Lobby.stage field drives which reducers are allowed.

```
Waiting → Drafting → Equipping → Scoring → Finished
```

| Stage | Triggered By | What's Allowed |
|-------|-------------|----------------|
| Waiting | Lobby creation | Settings changes, team assignment, ready-up |
| Drafting | `start_draft` | Picks, bans, nominations, bids, pause/resume, undo |
| Equipping | Last pick/pass (auto) or `advance_stage` | `equip_lightcone`, `arrange_lineup`, `confirm_lineup` |
| Scoring | `advance_stage` (Equipping→Scoring) | Score submission, screenshot upload |
| Finished | `finalize_match_result` | `close_lobby` only |

**Automatic transitions:**
- Classic mode: after last pick → `Equipping`
- Auction mode: after both teams reach target character count → `Equipping`
- Scoring → Finished: only via `finalize_match_result`

**Manual overrides:**
- Host can call `advance_stage` to skip Equipping → Scoring early (D-58)
- Scoring → Finished CANNOT be manually advanced; must finalize

---

## Draft Modes

### Classic Mode

Fixed sequence generated from `BanMode` at `start_draft`:
- `None` (0 bans): Pick-only sequence
- `Four` (2 bans per team): 2 Blue bans, 2 Red bans, then picks
- `Six` (3 bans per team): 3 Blue bans, 3 Red bans, then picks

Draft sequence is a `DraftStep[]` array stored on MatchSession. Each step has `{ teamTurn: TeamLabel, actionRequired: ActionType }`. Turns rotate deterministically; no dynamic logic mid-sequence.

**EMPTY CHARACTER:** When `autoRandomPick=false` and the timer expires, an EMPTY CHARACTER (`characterName="EMPTY"`, `eidolon=0`) is inserted. EMPTY can be picked but costs 0 and contributes nothing. Frontend should render it as "No Pick".

**Mirror picks:** Controlled by `allowMirrorPicks`. When false, a character locked by Pick or Ban is unavailable. Ranked lobbies force `allowMirrorPicks=false`.

### Auction Mode

Two phases:
1. **Ban phase:** Fixed sequence from `BanMode` (same as Classic). `isAuctionPhase=false`.
2. **Auction phase:** After all bans, `isAuctionPhase=true`. Teams take turns nominating characters for bidding.

**Nomination + bidding flow:**
1. `nextNominatorTeam` calls `nominate_character` — sets `currentNomination`, `currentBidAmount` (base cost), `currentBidTeam` (nominating team auto-bids base cost)
2. Opposing team calls `place_bid` to raise or `pass_bid` to concede
3. On `pass_bid`: winning team's character budget decremented, `blueCharactersWon`/`redCharactersWon` incremented, `AuctionSold` step recorded

**Steal-skip logic (D-46):**
- If nominating team wins the auction: other team nominates next (normal rotation)
- If opposing team outbids nominator and wins: nominating team keeps their turn (steal — the opponent "spent" the nominator's slot)

**Auction end:** Each team targets `8 * teamSize` characters. When both reach target, `Equipping` stage begins automatically.

**Budget enforcement (D-49/D-53):**
- Nomination rejected if base cost > remaining `teamBlueCharBudget` / `teamRedCharBudget`
- Bid rejected if bid amount > remaining budget
- If team budget = 0, they must nominate EMPTY CHARACTER (0 cost)

---

## Timer and Pause Model

**Turn timer:** Each turn starts with `standardTurnSeconds`. Client sends `timer_expiry_classic` or `timer_expiry_auction` on expiry. Server validates elapsed time server-side before accepting.

**Reserve bank:** `reserveBankSeconds` per team. Currently tracked in `timerState.teamBlueReserveMs` / `teamRedReserveMs`. When turn timer runs out, reserve bank is used (UI concern; backend validates timer only via elapsed time).

**Player pauses (D-61):**
- Each team gets 3 player pauses (`pausesUsedBlue`, `pausesUsedRed`). Requires `allowPlayerPause=true` on Lobby.
- Spectators cannot pause.
- Pause inserts a `Pause` step with `timeRemainingMs`.

**Referee pauses (D-61):**
- Referee can pause unlimited times when `refereeCanPause=true`. Does NOT decrement team pause counters.

**Resume (D-62):**
- Referee or the original pausing player can resume.
- `accumulatedPauseMs` is set to `timeRemainingMs` from the Pause step so the clock resumes from where it stopped.

---

## Reducer Reference

| Reducer | File | Permission | Stage Required | Description |
|---------|------|-----------|---------------|-------------|
| `start_draft` | draftClassic.ts | Host/Admin/Moderator | Waiting | Creates MatchSession, MatchResultRecord, assigns captains, transitions to Drafting |
| `pick_character` | draftClassic.ts | Captain (or sole player) | Drafting | Records a Pick step; transitions to Equipping when Classic draft complete |
| `ban_character` | draftClassic.ts | Captain (or sole player) | Drafting | Records a Ban step; transitions auction phase when ban sequence complete |
| `timer_expiry_classic` | draftClassic.ts | Any member | Drafting | Auto-pick EMPTY CHARACTER or auto-skip ban on timer expiry |
| `nominate_character` | draftAuction.ts | Captain (nominating team) | Drafting (auction phase) | Sets currentNomination at base cost |
| `place_bid` | draftAuction.ts | Captain (opposing team) | Drafting (auction phase) | Raises current bid with minimum raise enforcement |
| `pass_bid` | draftAuction.ts | Captain (opposing team) | Drafting (auction phase) | Concedes; currentBidTeam wins the character |
| `timer_expiry_auction` | draftAuction.ts | Any member | Drafting (auction phase) | Auto-nominate EMPTY or auto-pass on timer expiry |
| `undo_last_step` | draftControl.ts | Referee (refereeCanUndo=true) | Drafting | Deletes last step, decrements turnIndex, inserts Undo record |
| `pause_draft` | draftControl.ts | Referee or player (allowPlayerPause) | Drafting | Sets timerState.isPaused; inserts Pause step |
| `resume_draft` | draftControl.ts | Referee or original pauser | Drafting | Clears isPaused; restores accumulatedPauseMs |
| `equip_lightcone` | postDraft.ts | Captain (or sole player) | Equipping | Records EquipLightcone step; deducts LC budget |
| `arrange_lineup` | postDraft.ts | Captain (or sole player) | Equipping | Records ArrangeLineup step with JSON position array |
| `confirm_lineup` | postDraft.ts | Captain (or sole player) | Equipping | Records ConfirmLineup step |
| `advance_stage` | postDraft.ts | Host/Admin/Moderator | Drafting or Equipping | Manual stage transition (Drafting→Equipping or Equipping→Scoring) |

---

## Data Patterns

### Composite PK update pattern
MatchSessionStep uses `id` autoInc as PK and is updated via `ctx.db.MatchSessionStep.id.delete()` + `ctx.db.MatchSessionStep.insert()`. MatchSession uses `lobbyId` as PK and is updated via `ctx.db.MatchSession.lobbyId.update()`.

### Turn validation
Every draft action validates:
1. Lobby is in correct stage
2. Caller is a lobby member
3. Caller is NOT a coach (D-39, MOUS-03)
4. `session.draftSequence[session.turnIndex]` exists
5. `actionRequired.tag` matches the action being taken
6. `teamTurn.tag` matches caller's `teamSlot.tag`
7. Captain check: caller is captain, OR team has no captain assigned

### Captain-only actions
`pick_character`, `ban_character`, `nominate_character`, `place_bid`, `pass_bid`, `equip_lightcone`, `arrange_lineup`, `confirm_lineup` all enforce: if the team has any member with `isCaptain=true`, only that member may act. If no captain is set, any team member may act.

### LobbyConfigSnapshot
At `start_draft`, a frozen copy of the lobby configuration is stored in `MatchSessionHistory.snapshotConfig`. This preserves the exact rules used at match time independently of any later lobby settings changes.

---

## Key Decisions

- `lobbyId` is the PK for MatchSession (not an autoInc id) — 1-to-1 with Lobby
- `turnIndex` is an index into `draftSequence[]` — not a counter of steps recorded
- `BanMode.Two` was removed in Phase 9 — only `None`, `Four`, `Six` remain
- Auction state fields only meaningful when `isAuctionPhase=true`
- `currentBidTeam = Spectator` is the sentinel for "no active bid"
- `teamBlueSpent` / `teamRedSpent` on MatchSessionHistory record budget consumption for Auction handicap calculation (D-88)
- `isPubliclyVisible=false` while match is inside an active tournament; set to `true` when tournament completes (prevents scouting, D-84)
- MatchSessionStepHistory stores individual flat rows per step (not a JSON blob), enabling per-step replay queries without deserializing large arrays
- `targetName` on MatchSessionStepHistory replaces the old `characterName` column — covers both characters (Pick/Ban) and lightcones (EquipLightcone)
