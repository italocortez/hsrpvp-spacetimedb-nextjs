# Architecture Research

**Domain:** Competitive HSR PVP Platform — SpacetimeDB Backend (Tournament, MMR, Roster, Calendar, Chat, Achievements)
**Researched:** 2026-03-15
**Confidence:** HIGH (derived from existing codebase + established tournament/ELO patterns)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Next.js)                        │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐   │
│  │ Tournament│  │  Profile  │  │ Calendar  │  │   Lobby /   │   │
│  │  Browser  │  │  & Stats  │  │ Scheduler │  │    Draft    │   │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └──────┬──────┘   │
│        │              │              │               │            │
│  ┌─────┴──────────────┴──────────────┴───────────────┴──────┐    │
│  │           SpacetimeDB Generated Bindings Layer            │    │
│  │         (module_bindings/ — table reads, reducer calls)   │    │
│  └─────────────────────────┬─────────────────────────────────┘   │
└────────────────────────────┼────────────────────────────────────┘
                             │ WebSocket
┌────────────────────────────┼────────────────────────────────────┐
│                   SPACETIMEDB SERVER                              │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                  REDUCERS (Mutations Only)                │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │    │
│  │  │Tournament│ │  Match   │ │   MMR    │ │  Roster /  │  │    │
│  │  │ Lifecycle│ │  Result  │ │  Update  │ │Achievement │  │    │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │    │
│  └───────┼────────────┼────────────┼──────────────┼─────────┘    │
│          ▼            ▼            ▼              ▼               │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │                    TABLE GROUPS                           │    │
│  │ ┌─────────────┐ ┌───────────┐ ┌──────────┐ ┌──────────┐ │    │
│  │ │  Tournament │ │   Match   │ │  Player  │ │  Shared  │ │    │
│  │ │   Tables    │ │  Tables   │ │  Tables  │ │  Tables  │ │    │
│  │ │(bracket,   │ │(session,  │ │(roster,  │ │(user,    │ │    │
│  │ │ group,     │ │ result,   │ │ mmr,     │ │ lobby,   │ │    │
│  │ │ participant)│ │ score,    │ │ achieve, │ │ calendar,│ │    │
│  │ │             │ │ chat)     │ │ stats)   │ │ chat)    │ │    │
│  │ └─────────────┘ └───────────┘ └──────────┘ └──────────┘ │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│             EXTERNAL DEPENDENCIES                                 │
│  ┌──────────────┐  ┌────────────────┐                           │
│  │ Imgur (image │  │ Discord OAuth  │                           │
│  │  uploads)    │  │  (NextAuth)    │                           │
│  └──────────────┘  └────────────────┘                           │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| Tournament tables | Tournament lifecycle, bracket state, participant roster | Match tables (one tournament produces many matches), Player tables (participant identity) |
| Match tables | Draft session, result submission, screenshot evidence, chat events | Tournament tables (FK to tournament match), Player tables (participant stats) |
| Player tables | Roster ownership, MMR per game mode, achievement records, profile stats | Match tables (stats derived from history), Tournament tables (eligibility checks) |
| Calendar tables | Player availability slots, events, scheduling | Tournament tables (TOs schedule matches), Player tables (participant identity) |
| Shared / infrastructure tables | User identity, lobby, audit trail | All other table groups |

---

## Table Architecture: Component by Component

### 1. Tournament System

The tournament system has three bracket formats, each requiring different state shapes, but sharing a common tournament header.

#### Tournament (header)

```
Tournament
  id          u32 PK autoInc
  slug        string unique          -- human-readable URL key
  name        string
  description string
  gameMode    GameMode               -- MoC / AS / AA
  format      TournamentFormat       -- SingleElim | DoubleElim | GroupPhase
  status      TournamentStatus       -- Draft | Registration | Active | Completed | Cancelled
  isAnonymous bool                   -- default anonymous play for all matches in tournament
  rosterVisibility RosterVisibility  -- Open | Closed | PerMatch
  disconnectPolicy DisconnectPolicy  -- Pause | TimerForfeit | ImmediateForfeit
  maxParticipants u32
  createdById  u32
  createdDate  timestamp
  ...audit columns
```

Indexes: `btree(status)`, `btree(gameMode)`

#### TournamentParticipant

```
TournamentParticipant
  tournamentId  u32
  userId        u32           -- composite PK
  seedPosition  u32 optional  -- set by TO during bracket generation
  status        ParticipantStatus -- Registered | Confirmed | Eliminated | Withdrawn
  joinedAt      timestamp
  ...audit columns
```

Primary key: `[tournamentId, userId]`
Indexes: `btree(tournamentId)`, `btree(userId)`

#### BracketMatch (single and double elimination)

Single and double elimination share one table. A `bracketRound` field and `isLosersBracket` bool differentiate double-elimination losers bracket matches from winners.

```
BracketMatch
  id               u32 PK autoInc
  tournamentId     u32
  bracketRound     u32                  -- 1 = first round, increases toward final
  matchNumber      u32                  -- position within round
  isLosersBracket  bool                 -- double-elim losers bracket flag
  participant1Id   u32 optional         -- null = TBD (waiting for earlier match result)
  participant2Id   u32 optional
  winnerId         u32 optional         -- set when match concludes
  loserId          u32 optional
  nextWinnerMatchId  u32 optional       -- FK to next BracketMatch for winner
  nextLoserMatchId   u32 optional       -- FK to losers bracket match (double-elim only)
  lobbyId          u32 optional         -- FK to Lobby when match is live
  matchHistoryId   string optional      -- FK to MatchSessionHistory when finished
  scheduledAt      timestamp optional
  completedAt      timestamp optional
  status           MatchStatus          -- Pending | Ready | Live | Completed | Bye
  ...audit columns
```

Indexes: `btree(tournamentId)`, `btree([tournamentId, bracketRound])`, `btree(lobbyId)`

Rationale: Storing `nextWinnerMatchId` and `nextLoserMatchId` as self-referencing FKs is the standard adjacency list for brackets. When a match completes, the reducer writes the winner's userId into `participant1Id` or `participant2Id` of `nextWinnerMatchId`. This is the only safe approach in a deterministic reducer — no graph traversal, just a direct FK write.

#### GroupPhaseGroup and GroupPhaseStanding

Group phase (soccer-style round-robin) requires a group header and a standings table that tracks W/D/L records.

```
GroupPhaseGroup
  id            u32 PK autoInc
  tournamentId  u32
  groupName     string          -- "Group A", "Group B"
  ...audit columns

GroupPhaseStanding
  groupId       u32
  userId        u32             -- composite PK
  matchesPlayed u32
  wins          u32
  draws         u32
  losses        u32
  pointsFor     u32             -- game-mode-specific score accumulated
  pointsAgainst u32
  ...audit columns
```

Group matches are ordinary BracketMatch rows with `isLosersBracket = false` and `nextWinnerMatchId = null`; they simply record results that update GroupPhaseStanding via reducer.

#### TournamentReferee

```
TournamentReferee
  tournamentId  u32
  userId        u32   -- composite PK
  matchScope    u32 optional  -- null = all matches, set = specific BracketMatch.id
  ...audit columns
```

---

### 2. Match Result and Score Verification

Match results extend the existing MatchSessionHistory with score data and screenshot evidence.

#### MatchResult

```
MatchResult
  matchHistoryId   string PK           -- FK to MatchSessionHistory
  gameMode         GameMode
  blueScore        u32 optional        -- cycles (MoC/AA) or score (AS)
  redScore         u32 optional
  blueScreenshotUrl  string optional   -- Imgur URL
  redScreenshotUrl   string optional
  blueConfirmedAt    timestamp optional
  redConfirmedAt     timestamp optional
  refereeValidatedAt timestamp optional
  refereeUserId      u32 optional
  validationStatus   ValidationStatus  -- Pending | BothSubmitted | Disputed | Validated | AdminOverride
  ...audit columns
```

This table decouples result/score data from the draft session (MatchSessionHistory), which focuses on pick/ban replay.

#### Data flow for match result:

```
Both players finish draft
       ↓
Each player calls submit_match_result(lobbyId, score, imgurUrl)
       ↓
Reducer writes into MatchResult (partial — only that player's side)
       ↓
When both sides submitted: validationStatus → BothSubmitted
       ↓
Casual match: auto-validate if scores agree, flag Disputed if they differ
Tournament match: referee calls validate_match_result(matchHistoryId)
       ↓
Reducer updates BracketMatch.winnerId + advances bracket
Reducer calls update_mmr() for both participants
```

---

### 3. MMR/ELO System

#### PlayerMmr

One row per player per game mode. Global composite is a derived view or computed on read by the client from all three rows.

```
PlayerMmr
  userId       u32
  gameMode     GameMode   -- composite PK
  mmr          f32        -- current ELO/MMR rating
  peakMmr      f32        -- historical peak
  wins         u32
  losses       u32
  draws        u32
  seasonId     u32 optional  -- null = current; future season support
  ...audit columns
```

Primary key: `[userId, gameMode]`
Indexes: `btree(gameMode, mmr DESC)` — enables leaderboard queries

#### MmrHistory (optional, for audit and graph)

```
MmrHistory
  id           u32 PK autoInc
  userId       u32
  gameMode     GameMode
  matchHistoryId string         -- what match caused this change
  mmrBefore    f32
  mmrAfter     f32
  delta        f32              -- positive = gain, negative = loss
  recordedAt   timestamp
  ...audit columns
```

Index: `btree(userId, gameMode)`

#### ELO update reducer pattern

ELO is deterministic — given two ratings and a result, the formula is fixed. This satisfies the SpacetimeDB determinism constraint.

```typescript
// Within confirm_match_result reducer (conceptually)
const K = 32; // K-factor
const expectedBlue = 1 / (1 + Math.pow(10, (redMmr - blueMmr) / 400));
const expectedRed = 1 - expectedBlue;
const actualBlue = result === 'BlueWins' ? 1 : result === 'Draw' ? 0.5 : 0;
const actualRed = 1 - actualBlue;
const newBlueMmr = blueMmr + K * (actualBlue - expectedBlue);
const newRedMmr = redMmr + K * (actualRed - expectedRed);
```

This is pure arithmetic — no randomness, no I/O. Safe in a reducer.

---

### 4. Roster Management

#### HsrAccount (multi-account support)

```
HsrAccount
  id          u32 PK autoInc
  userId      u32
  label       string          -- "Main", "Alt", user-assigned
  isActive    bool            -- which account is used in matches
  visibility  RosterVisibility -- Public | Private
  ...audit columns
```

Index: `btree(userId)`

#### RosterCharacter

```
RosterCharacter
  id           u32 PK autoInc
  accountId    u32             -- FK to HsrAccount
  characterName string         -- FK reference to HsrCharacter
  eidolonLevel u8              -- 0-6
  ...audit columns
```

Index: `btree(accountId)`, `btree([accountId, characterName])` (unique)

#### RosterLightcone

```
RosterLightcone
  id               u32 PK autoInc
  accountId        u32
  lightconeName    string
  superimposition  u8       -- 1-5
  equippedToCharacter string optional
  ...audit columns
```

Index: `btree(accountId)`

Reducers needed: `add_roster_character`, `update_roster_character`, `remove_roster_character`, `set_active_account`, `set_roster_visibility`. Admin variants: `admin_upsert_roster_character`.

---

### 5. Calendar and Scheduling

#### AvailabilitySlot

Recurring availability is stored as discrete rule rows, not expanded time series. This keeps the table lean.

```
AvailabilitySlot
  id           u32 PK autoInc
  userId       u32
  recurrence   RecurrenceType   -- Once | Daily | Weekly | Monthly
  dayOfWeek    u8 optional      -- 0=Sun, 6=Sat (for Weekly)
  dayOfMonth   u8 optional      -- 1-28 (Monthly, capped at 28 for Feb safety)
  startHour    u8               -- 0-23 UTC
  startMinute  u8               -- 0, 15, 30, 45
  durationMins u16              -- length of slot
  isActive     bool
  ...audit columns
```

Index: `btree(userId)`

Client-side expansion: the client fetches all slot rules for up to 5 users and expands them into calendar events locally. This avoids any time-series computation in reducers and respects the determinism constraint.

#### CalendarEvent

```
CalendarEvent
  id           u32 PK autoInc
  creatorId    u32
  title        string
  startAt      timestamp
  endAt        timestamp
  tournamentMatchId u32 optional  -- links to BracketMatch for TO scheduling
  ...audit columns
```

#### CalendarEventInvite

```
CalendarEventInvite
  eventId      u32
  userId       u32   -- composite PK
  status       InviteStatus  -- Pending | Accepted | Declined
  ...audit columns
```

Index: `btree(eventId)`, `btree(userId)`

---

### 6. Ephemeral Chat

Chat uses SpacetimeDB's event table pattern (insert-only, never updated). The client subscribes to the table filtered by lobbyId; rows are deleted when the match ends.

```
LobbyChatMessage
  id        u32 PK autoInc
  lobbyId   u32
  userId    u32
  content   string         -- plain text; future: JSON for rich content
  sentAt    timestamp
  -- NO audit columns: ephemeral, identity tracked by userId
```

Index: `btree(lobbyId)`

Reducers: `send_chat_message(lobbyId, content)` — validates sender is lobby member, inserts row.
Cleanup: when `close_lobby` reducer fires, all `LobbyChatMessage` rows for that `lobbyId` are deleted in the same transaction.

---

### 7. Achievements

#### AchievementDefinition (admin-managed)

```
AchievementDefinition
  id           u32 PK autoInc
  key          string unique    -- "WIN_10_MATCHES", stable reference key
  name         string
  description  string
  iconUrl      string
  criteria     string           -- JSON blob: {type: "match_wins", threshold: 10}
  isAutoAward  bool             -- true = system checks; false = manual only
  ...audit columns
```

#### PlayerAchievement

```
PlayerAchievement
  userId           u32
  achievementId    u32    -- composite PK
  awardedAt        timestamp
  awardedByUserId  u32 optional  -- null if auto-awarded
  isDisplayed      bool          -- user controls which achievements show on profile
  ...audit columns
```

Primary key: `[userId, achievementId]`
Index: `btree(userId)`

Auto-award trigger: The `confirm_match_result` reducer (and other terminal reducers) calls a `check_achievements(ctx, userId)` helper. This helper reads PlayerMmr and MatchSessionHistory counters directly from the table and inserts PlayerAchievement rows where criteria are met. This stays deterministic — all data is within SpacetimeDB tables.

---

### 8. Disconnect and Rejoin

#### DisconnectPolicy handling

Disconnect behavior is stored in the Tournament row (and optionally in the Lobby config for casual matches). The `clientDisconnected` lifecycle hook fires deterministically in SpacetimeDB when a client loses connection.

```
// clientDisconnected lifecycle hook (existing pattern extended)
clientDisconnected: (ctx, identity) => {
    const userIdentity = ctx.db.UserIdentity.identity.find(identity);
    if (!userIdentity) return;
    const userId = userIdentity.userId;

    // Mark user offline (existing pattern)
    // Find any active lobby for this user
    const membership = ctx.db.LobbyMember.user_id.filter(userId);
    for (const m of membership) {
        const lobby = ctx.db.Lobby.id.find(m.lobbyId);
        if (!lobby || lobby.stage.tag !== 'Drafting') continue;
        // Apply disconnect policy from tournament (if tournament match) or lobby config
        applyDisconnectPolicy(ctx, lobby, userId);
    }
}
```

DisconnectPolicy options (enum):
- `Pause` — auto-pause the draft timer (extends PausePayload.isAutoPause = true)
- `TimerForfeit` — start a countdown in Lobby table (`disconnectForfeitAt timestamp`)
- `ImmediateForfeit` — write result immediately

Rejoin: user calls `rejoin_match(lobbyId)`. Reducer validates lobby is still in Drafting stage, updates LobbyMember.isOnline = true, clears `disconnectForfeitAt` if policy is TimerForfeit.

**Forfeit timer without server timers:** SpacetimeDB reducers cannot set timers. The `disconnectForfeitAt` timestamp is written by the disconnect hook. A `check_disconnect_forfeits` reducer is called by the client (or the remaining player calls it) — it checks `disconnectForfeitAt < ctx.timestamp` and fires the forfeit if so. This is the standard pattern for deferred events in SpacetimeDB.

---

## Recommended Project Structure

```
spacetimedb/src/
├── tables/
│   ├── (existing)               # user, lobby, lobbyMember, matchSession, etc.
│   ├── tournament.ts            # Tournament header
│   ├── tournamentParticipant.ts
│   ├── tournamentReferee.ts
│   ├── bracketMatch.ts          # Single + double elimination
│   ├── groupPhaseGroup.ts
│   ├── groupPhaseStanding.ts
│   ├── matchResult.ts           # Score + screenshot evidence
│   ├── playerMmr.ts
│   ├── mmrHistory.ts
│   ├── hsrAccount.ts            # Multi-account
│   ├── rosterCharacter.ts
│   ├── rosterLightcone.ts
│   ├── availabilitySlot.ts
│   ├── calendarEvent.ts
│   ├── calendarEventInvite.ts
│   ├── lobbyChatMessage.ts
│   ├── achievementDefinition.ts
│   └── playerAchievement.ts
│
├── reducers/
│   ├── (existing)               # auth, profile, admin, cursor, server, userDeletion
│   ├── tournament.ts            # create, updateSettings, cancel
│   ├── bracket.ts               # generateBracket, advanceBracket, reportBye
│   ├── groupPhase.ts            # generateGroups, updateStandings
│   ├── matchResult.ts           # submitMatchResult, validateMatchResult, disputeResult
│   ├── mmr.ts                   # updateMmr (called internally by matchResult)
│   ├── roster.ts                # addCharacter, updateCharacter, removeCharacter, setAccount
│   ├── calendar.ts              # upsertSlot, deleteSlot, createEvent, respondInvite
│   ├── chat.ts                  # sendMessage (cleanup called from lobby close)
│   └── achievements.ts          # checkAchievements, awardAchievement (admin), toggleDisplay
│
├── helpers/
│   ├── auditColumns.ts          # (existing)
│   ├── elo.ts                   # Pure ELO calculation helper (no ctx, deterministic)
│   ├── bracketGenerator.ts      # Pure bracket seed → BracketMatch row generation
│   └── achievementChecker.ts   # Pure criteria evaluation helper
│
└── types/
    ├── enums.ts                 # (existing, extend with new enums)
    └── structs.ts               # (existing, extend with new structs)
```

### Structure rationale

- **Reducers split by domain:** Each file owns one system. `matchResult.ts` calls into `mmr.ts` and `achievements.ts` helpers — not via cross-reducer calls (which don't exist in SpacetimeDB), but via shared helper functions imported from `helpers/`.
- **Pure helpers in `helpers/`:** ELO math, bracket generation, and achievement checks are pure functions. They take table data as arguments, return values, and the caller reducer applies the mutations. This makes them testable and keeps reducers thin.
- **Enums/structs extended, not forked:** New status enums (`TournamentStatus`, `MatchStatus`, `ValidationStatus`, `DisconnectPolicy`, `RecurrenceType`) are added to the existing `enums.ts` file.

---

## Data Flow

### Tournament Lifecycle Flow

```
Admin/TO: create_tournament(config)
       ↓ inserts Tournament{status: Draft}
Admin/TO: open_registration()
       ↓ Tournament.status → Registration
Players: register_for_tournament(tournamentId)
       ↓ inserts TournamentParticipant
Admin/TO: generate_bracket(tournamentId, seedOrder[])
       ↓ inserts BracketMatch rows (pure bracketGenerator helper)
       ↓ Tournament.status → Active
Match is scheduled → TO: schedule_bracket_match(matchId, timestamp)
       ↓ BracketMatch.scheduledAt set, CalendarEvent created
Match goes live → create_lobby_for_match(matchId)
       ↓ BracketMatch.lobbyId set, Lobby created
Draft completes → finish_match_session(lobbyId)
       ↓ MatchSessionHistory written (existing flow)
Players submit scores → submit_match_result(matchHistoryId, score, imgurUrl)
       ↓ MatchResult row updated per side
Referee validates → validate_match_result(matchHistoryId)
       ↓ BracketMatch.winnerId set
       ↓ advance_bracket(): next BracketMatch.participant slots filled
       ↓ update_mmr(): PlayerMmr rows updated
       ↓ check_achievements(): PlayerAchievement rows inserted
When all matches complete → Tournament.status → Completed
```

### MMR Update Flow

```
validate_match_result reducer called
       ↓
Read PlayerMmr for both users + gameMode
       ↓
elo.ts helper: compute newBlue, newRed (pure math)
       ↓
Update PlayerMmr rows (wins/losses/mmr/peakMmr)
Insert MmrHistory rows (before/after/delta)
```

### Roster Visibility Flow

```
Player sets roster visibility on HsrAccount
       ↓ RosterVisibility: Public | Private
When player joins a lobby/tournament:
  - If tournament.rosterVisibility = Closed → hide for all regardless of account setting
  - If tournament.rosterVisibility = Open → show regardless of account setting
  - If tournament.rosterVisibility = PerMatch → use account setting
Client reads this from Tournament row directly (no reducer needed — pure read logic)
```

### Disconnect/Rejoin Flow

```
Client disconnects (WebSocket drops)
       ↓ clientDisconnected lifecycle hook fires
       ↓ Finds active LobbyMember for user
       ↓ Reads disconnect policy from Tournament (if tournament match) or LobbyConfig
Policy = Pause:
  ↓ Writes MatchSessionStep{action: Pause, payload: {isAutoPause: true}}
  ↓ Updates MatchSession.timerState.isPaused = true
Policy = TimerForfeit:
  ↓ Writes Lobby.disconnectForfeitAt = ctx.timestamp + policy.timeoutMs
Policy = ImmediateForfeit:
  ↓ Calls finish_match_session with forfeit result

Remaining player calls check_disconnect_forfeits()
  ↓ Reads Lobby.disconnectForfeitAt
  ↓ If < ctx.timestamp: fires forfeit, advances bracket

Player reconnects and calls rejoin_match(lobbyId)
  ↓ Validates lobby still live
  ↓ Sets LobbyMember.isOnline = true
  ↓ Clears Lobby.disconnectForfeitAt (if TimerForfeit policy)
  ↓ If was auto-paused: client can call resume_match()
```

---

## Component Build Order (Dependencies)

Build in this order to avoid forward-dependency problems:

| Phase | Components | Depends On |
|-------|------------|------------|
| 1 | Enums + structs extension | Nothing |
| 2 | Roster (HsrAccount, RosterCharacter, RosterLightcone) | User (existing) |
| 3 | Calendar (AvailabilitySlot, CalendarEvent, CalendarEventInvite) | User (existing) |
| 4 | Ephemeral Chat (LobbyChatMessage) | Lobby (existing) |
| 5 | Tournament header + TournamentParticipant + TournamentReferee | User, Lobby (existing) |
| 6 | BracketMatch + GroupPhaseGroup + GroupPhaseStanding | Tournament, User |
| 7 | MatchResult | MatchSessionHistory (existing), BracketMatch |
| 8 | PlayerMmr + MmrHistory | User, GameMode enum (existing), MatchResult |
| 9 | AchievementDefinition + PlayerAchievement | User, PlayerMmr, MatchSessionHistory |
| 10 | Disconnect policy wiring | All match/tournament tables |

Each phase's reducers follow immediately after its tables. The `elo.ts`, `bracketGenerator.ts`, and `achievementChecker.ts` helpers are written alongside their respective phases (8, 6, 9) as pure modules with no SpacetimeDB imports.

---

## Architectural Patterns

### Pattern 1: State Machine via Enum + Reducer Guards

**What:** Tournament and match status are expressed as enums. Every reducer that mutates status first validates the current status is a valid predecessor state.

**When to use:** Any entity with a lifecycle (Tournament, BracketMatch, MatchResult).

**Trade-offs:** Simple to implement; invalid state transitions throw and roll back the entire transaction.

```typescript
// tournament.ts reducer
const tournament = ctx.db.Tournament.id.find(tournamentId);
if (tournament.status.tag !== 'Registration') {
    throw new Error('Tournament is not in Registration phase');
}
ctx.db.Tournament.id.update({ ...tournament, status: { tag: 'Active' } });
```

### Pattern 2: Pure Helper Functions for Complex Domain Logic

**What:** ELO calculation, bracket generation, and achievement checking are extracted into pure TypeScript functions in `helpers/`. Reducers call these helpers, receive computed values, then apply table mutations.

**When to use:** Any domain logic that is mathematically complex or needs to be reasoned about independently from DB I/O.

**Trade-offs:** Slightly more indirection, but dramatically easier to reason about correctness. Can be unit-tested without a running SpacetimeDB instance.

```typescript
// helpers/elo.ts — no spacetimedb imports
export function computeEloUpdate(
    blueRating: number, redRating: number,
    result: 'BlueWins' | 'RedWins' | 'Draw', K = 32
): { newBlue: number; newRed: number } { ... }
```

### Pattern 3: Deferred Events via Timestamp Columns

**What:** SpacetimeDB reducers cannot schedule future work. Instead, write a `firedAt`-style timestamp column (e.g., `Lobby.disconnectForfeitAt`). Any connected client or the next reducer call checks this column and fires the deferred action if the time has passed.

**When to use:** Disconnect forfeit timers, session expiry, any "fire after N seconds" behavior.

**Trade-offs:** Requires a client or player to trigger the check. For forfeits, the remaining player has strong motivation to call the check reducer. For fully unattended scenarios (no players remaining), this pattern breaks — acceptable given the competitive context.

### Pattern 4: Snapshot + FK Separation for Match History

**What:** When a match ends, `MatchSessionHistory` captures a snapshot of player display names and config at the time of play. The draft steps JSON blob is stored in `MatchSessionStepHistory`. `MatchResult` stores score/verification separately. Three tables, three concerns.

**When to use:** Any entity that needs audit-quality immutability (replay-ability) while keeping live data normalized.

**Trade-offs:** Slightly more complex writes at match end; reads for replay require joining 3 tables. Worth it because match history must be immune to future user renames and config changes.

---

## Anti-Patterns

### Anti-Pattern 1: Bracket State in JSON Blobs

**What people do:** Store the entire bracket as a single JSON string in the Tournament row.

**Why it's wrong:** SpacetimeDB subscriptions operate at row granularity. A JSON blob means every bracket update forces the entire tournament row to be re-broadcasted to all subscribers. Individual match updates cannot be subscribed to independently. Also makes reducer logic for advancing the bracket much harder.

**Do this instead:** One `BracketMatch` row per match with explicit FK columns for `nextWinnerMatchId` / `nextLoserMatchId`. Clients subscribe to `BracketMatch` filtered by `tournamentId`.

### Anti-Pattern 2: Deriving Stats in Reducers at Query Time

**What people do:** When a leaderboard is requested, a reducer computes aggregate stats from MatchSessionHistory and returns them.

**Why it's wrong:** Reducers don't return data. Aggregating across all match history in a reducer is also O(n) per call and would be re-run for every requesting client.

**Do this instead:** Maintain running counters. `PlayerMmr` holds `wins`, `losses`, `draws`. When a match result is confirmed, the `update_mmr` reducer increments these counters atomically. The leaderboard reads `PlayerMmr` rows directly via subscription — O(1) per player.

### Anti-Pattern 3: Using autoInc IDs for Bracket Ordering

**What people do:** Assign bracket position by insertion order, assuming autoInc IDs are sequential.

**Why it's wrong:** SpacetimeDB autoInc IDs are not guaranteed to be sequential (gaps are normal). Round and position within round must be explicit columns (`bracketRound`, `matchNumber`).

**Do this instead:** Generate bracket match rows in the `generate_bracket` reducer with explicit `bracketRound` and `matchNumber` values computed by the `bracketGenerator` helper before any inserts happen.

### Anti-Pattern 4: Calling Reducers from Reducers

**What people do:** The `validate_match_result` reducer tries to call `update_mmr` reducer as if it were a function.

**Why it's wrong:** SpacetimeDB does not support inter-reducer calls. All logic must happen within one transaction initiated by one reducer.

**Do this instead:** Import the MMR update logic from `helpers/elo.ts` as a plain function and call it within the same `validate_match_result` reducer. The helper computes new ratings; the reducer applies all mutations in one transaction.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Imgur | Client uploads image directly; passes public URL to reducer | URLs stored as strings in MatchResult; no server-side image handling |
| Discord OAuth | NextAuth callback → server singleton calls `server_link_discord` reducer | Existing pattern; unchanged |
| SpacetimeDB Maincloud | `spacetime publish` deploys the module | Dashboard at `spacetimedb.com/@<username>/<db-name>` |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Tournament ↔ Lobby/Match | BracketMatch.lobbyId FK | When a bracket match goes live, a Lobby is created and linked |
| MatchResult ↔ MMR | Both mutated in same reducer transaction | No cross-reducer calls; shared helpers |
| MatchResult ↔ Achievements | check_achievements() helper called at end of validate_match_result | Same transaction; no separate reducer |
| Calendar ↔ BracketMatch | CalendarEvent.tournamentMatchId FK optional | TO creates event linked to bracket match for scheduling |
| Roster ↔ Lobby | HsrAccount.visibility checked client-side against Tournament.rosterVisibility | Server enforces visibility at subscription filter level (future); MVP is client-driven |

---

## Scaling Considerations

This is a community-scale competitive platform. Scale targets are realistic for an HSR player community:

| Scale | Architecture Notes |
|-------|--------------------|
| 0–500 concurrent users | Single SpacetimeDB module on Maincloud; current design sufficient. No optimization needed. |
| 500–5k concurrent users | SpacetimeDB handles WebSocket fan-out natively. Watch MmrHistory table growth — consider pruning old records after N months. Chat cleanup critical. |
| 5k+ concurrent users | SpacetimeDB module scaling is managed by Maincloud. Potential hotspot: leaderboard subscription (all clients subscribe to PlayerMmr). Consider pagination or ranked-only subscription filters at this scale. |

### First bottleneck: Leaderboard subscription breadth

All clients subscribing to all `PlayerMmr` rows is fine at small scale. At large scale it creates a high-bandwidth fan-out. Mitigation: subscribe only to `PlayerMmr` where `mmr > threshold` or paginate via client-side filtering.

### Second bottleneck: Chat table accumulation

If `LobbyChatMessage` rows are not cleaned up on lobby close, they accumulate indefinitely. The `close_lobby` reducer must delete all associated chat rows. This is already addressable in the design.

---

## Sources

- Existing codebase: `spacetimedb/src/tables/` and `spacetimedb/src/reducers/` (HIGH confidence — direct inspection)
- Project requirements: `.planning/PROJECT.md` (HIGH confidence — canonical requirements)
- Existing architecture: `.planning/codebase/ARCHITECTURE.md` (HIGH confidence — codebase-derived)
- ELO/Glicko algorithm: well-established deterministic formula, no external source required
- Double elimination bracket adjacency list pattern: standard tournament bracket representation (MEDIUM confidence — training data, but a well-established algorithm with no SpacetimeDB-specific gotchas)
- SpacetimeDB determinism constraints and lifecycle hooks: verified from existing reducer patterns in codebase (HIGH confidence)

---

*Architecture research for: HSRPVP SpacetimeDB backend milestone*
*Researched: 2026-03-15*
