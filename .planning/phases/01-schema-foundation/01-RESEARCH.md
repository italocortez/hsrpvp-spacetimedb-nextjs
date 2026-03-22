# Phase 1: Schema Foundation - Research

**Researched:** 2026-03-15
**Domain:** SpacetimeDB TypeScript module — enums, structs, table definitions, module publishing
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Table Design Philosophy**
- Flat columns for all 1:1 data — no config structs for grouping settings
- Table bloat is acceptable; players filter Lobbies and Tournaments frequently, so indexable columns matter
- Existing LobbyConfig struct will be flattened into Lobby table columns
- Only use structs for genuinely repeated/nested data (e.g., EidolonCost with 7 identical fields, RecurrenceRule as a self-contained concept)
- No foreign keys in SpacetimeDB — use u32 columns with application-level enforcement in reducers

**Tournament Data Model**
- 5 tournament formats as a single enum: SingleElimination, DoubleElimination, GroupOnly, GroupIntoSingleElim, GroupIntoDoubleElim
- Tournament stage lifecycle: Draft → Registration → Seeding → InProgress → Paused → Completed → Cancelled
- All tournament settings as flat columns: isAnonymousDefault, isOpenRoster, disconnectPolicy, defaultGameMode, maxParticipants, checkInEnabled, checkInPerRound, autoForfeitEnabled, autoForfeitMinutes, bracketRevealAt (optional scheduled timestamp), description (text field for TO, follow best practices on max length)
- Best-of series: up to BO5, configurable per round (not just per tournament). Convenience feature: cascade update BO count up to specific rounds (semis, finals)
- Grand finals advantage: winners bracket finalist starts with 1 win advantage (configurable, default on). In BO1 tournaments, no advantage but TO can toggle
- Per-round game mode override: default game mode set per tournament, but TO can override per round. Default is everyone plays same mode
- Group phase: groups can be auto-generated (by seed/MMR) or manually assigned by TO. Max top 2 advance per group (configurable: top 1 or top 2). Group-only tournaments are also valid (no elimination phase)
- Check-in: optional per tournament AND per round (people's schedules change)
- Pause vs Cancel: pause blocks new match creation but in-progress lobbies continue; cancel voids results but NEVER wipes match history (replay is priority)
- Manual lobby creation: players/TO manually create lobbies and link to bracket matches. Calendar facilitates scheduling
- No-show handling: default is TO override. Auto-forfeit only available when match was pre-arranged via calendar event where both agreed. Auto-forfeit wait time is configurable
- TO Assistants: TO can assign assistant users with a permission template (referee + partial TO powers). Default template provided, customizable per assistant

**Teams**
- Persistent teams exist as orgs with rosters
- Ad-hoc groups allowed for tournament-only participation
- Coach role on team: can observe match (cursor tracking) but cannot pick/ban

**Roster & Account Model**
- Many-to-many: 1 user can have many HSR accounts, many users can claim the same HSR UID (no blocking, just warning of duplicate UID)
- Each HSR account has its own character/lightcone roster — same character can exist on multiple accounts with different eidolons
- Lightcones are ownership only, no equip tracking
- Account rating = sum of character costs (by eidolon) + lightcone costs, varies per game mode/ruleset, mapped to labeled breakpoints via existing cost tables
- Roster visibility: public or private per user, overridden by tournament/lobby settings
  - Admins: always see all rosters
  - TO: sees roster only for participants in their tournament, loses visibility when tournament ends
  - Opponents: only while in the same lobby/match (if tournament/lobby says open roster)
  - Everyone else: respects user's public/private setting

**Match Result & MMR Model**
- Per-game scoring in series: each individual game in a BO3/BO5 series has its own score, screenshots, and verification (not combined)
- Score format is game-mode-specific: cycles for MoC/Anomaly Arbitration, score for Apocalyptic Shadow, with optional per-boss breakdown
- Both players upload Imgur screenshot URLs and submit scores
- Casual matches: auto-confirm on matching scores; mismatch goes to re-submit flow, then escalates to ref if still disagreed
- Tournament matches: require referee/admin validation
- ELO delta (+15, -12) saved in MmrHistory alongside new rating and match reference
- ELO changes always visible to players

**Anonymous Play Model**
- Per-match: random codenames (fun themed names from a pool) — reset each match
- Per-tournament: "Tournament Player N" alias persists across all matches in the tournament
- Tournament lobby inherits tournament alias, overwriting per-match codenames
- Separate toggles for hiding player names and hiding spectator names
- After tournament ends, real names revealed on brackets
- Anonymous enforcement at data write layer

**Calendar & Scheduling Model**
- All timestamps UTC — frontend converts to local time. Never save non-UTC timestamps
- Standard calendar recurrence: daily, weekly (monthly with Feb handling from requirements)
- Availability slots auto-expire after 6 months, cannot be created more than 6 months ahead
- SavedCalendar: userId + targetUserId + isVisible toggle. Hard limit of 5 saved calendars enforced at reducer level
- Auto-sync: suggests overlapping windows only, does not auto-create events
- CalendarEvent has optional bracketMatchId (u32) to link scheduling to tournament matches
- Notifications/reminders deferred to future

**Achievement System**
- Trigger types: stat thresholds, character-specific, special/manual (admin-only)
- No tournament placement auto-awards — those are manual by admin/TO
- Rarity tiers: Common, Rare, Epic, Legendary
- Threshold achievements are repeatable by default unless admin marks one-time. Manual achievements are always one-time
- Player selects which earned title to display on profile

**Chat**
- Raw text + shortcodes for emoji stored as plain string, frontend renders
- System messages in same table with a 'system' sender type flag
- 500 character limit per message
- Ephemeral — cleaned up on lobby close in same transaction

**Lobby Rework**
- Flatten LobbyConfig struct into Lobby columns
- Add tournament reference columns: tournamentId (u32, optional), bracketMatchId (u32, optional)
- Add anonymous toggles: isAnonymousPlayers, isAnonymousSpectators
- Add open roster toggle: isOpenRoster
- Lobby capacity: 6 players, 2 coaches, 12 spectators = 20 max total (hardcoded in reducer)
- Visibility: public or private (password-protected). Both have joinCode for quick invite
- Disconnect policy column on lobby (inherits from tournament if tournament lobby)

**Guest Account Restrictions**
- Guest accounts blocked from: calendar, roster management, tournament participation, team creation, achievement collection, chat
- Enforced at reducer level — every feature reducer checks isGuest and rejects if true

### Claude's Discretion
- Exact struct definitions for genuinely nested data (RecurrenceRule, etc.)
- Index strategy per table (which columns get BTree indexes)
- Enum variant naming conventions (follow existing codebase patterns)
- Column ordering within tables
- Whether to add a Notification table stub now for future use

### Deferred Ideas (OUT OF SCOPE)
- HoYoverse API integration for roster import — future milestone
- Computer vision screenshot import — future milestone
- Season implementation logic — schema supports it (seasonId column), logic deferred
- Notification/reminder system for calendar — deferred
- Automated anti-smurf detection — deferred until player base is large enough
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SCHM-01 | All new enums defined (TournamentStage, TournamentFormat, MatchResultStatus, ValidationStatus, DisconnectPolicy, RecurrenceType, RosterVisibility, ParticipantStatus, ParticipantType, GameMode extensions) | Enum syntax confirmed from codebase patterns; all variant names specified below |
| SCHM-02 | All new struct types defined (Score per game mode, RecurrenceRule, EloConfig) | Struct syntax confirmed; field types derived from data model decisions; existing EidolonCost pattern shows array-of-fields approach |
| SCHM-03 | Audit column pattern applied to all new tables (createdAt, createdBy, updatedAt, updatedBy) | auditColumns.ts already defines the exact 4-column pattern; all new tables must inline these columns |
</phase_requirements>

---

## Summary

Phase 1 is a pure schema phase: define enums, structs, flatten one existing struct (LobbyConfig into Lobby), and add skeleton table files for every domain that will be implemented in Phases 2–10. No reducers are written. The module must publish successfully to maincloud and `spacetime generate` must produce valid client bindings.

The codebase has highly consistent, enforced conventions. Every pattern needed already exists in the repo — this phase is about applying those patterns to 15+ new tables and 9+ new enums. The primary risk is not knowing which tables to add now (schema completeness) versus which can be added in later phases. The answer is: add ALL tables now (schema-only, no reducers), because the planner for later phases depends on established columns/indexes.

The secondary risk is the Lobby rework. The existing `LobbyConfig` struct is used in both `lobby.ts` and `matchSessionHistory.ts` (as a snapshot). Flattening LobbyConfig into Lobby table columns requires updating both files and removing the struct from `structs.ts`. The history table snapshot of LobbyConfig must be handled — since history is append-only, the old struct can remain as `LobbyConfigSnapshot` in structs.ts for that one table (or the history table is updated to inline the fields too).

**Primary recommendation:** Add all new tables as skeleton files (columns + indexes only, no reducers) in a single wave. Flatten LobbyConfig into Lobby columns. Write enums to `enums.ts` and structs to `structs.ts`. Register every table in `schema.ts`. Publish and generate to confirm the build is clean.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `spacetimedb/server` | (project version) | `table()`, `t.*` type builders, `schema()` | The only backend import available in WASM-compiled modules |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `spacetimedb` | (project version) | `Timestamp`, `ScheduleAt` types | When a column holds a timestamp or schedule |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Flat columns (locked) | Nested structs | Structs are not filterable; flats are indexable |
| `t.string()` for description max length | External validation | SpacetimeDB has no `maxLength` column constraint; length check in reducer instead |

**No installation needed** — the backend module already has all dependencies.

---

## Architecture Patterns

### Recommended Project Structure (after Phase 1)

```
spacetimedb/src/
├── types/
│   ├── enums.ts         # All enum definitions — extend with new enums
│   └── structs.ts       # All struct/object types — add new, remove LobbyConfig
├── tables/
│   ├── lobby.ts         # REWORK: flatten LobbyConfig, add tournament columns
│   ├── lobbyMember.ts   # Extend with coach role (isCoach bool)
│   ├── matchSession.ts  # No change
│   ├── matchSessionHistory.ts  # REWORK: LobbyConfig → LobbyConfigSnapshot
│   │
│   │   # NEW Phase 2 skeleton tables:
│   ├── hsrAccount.ts
│   ├── hsrAccountCharacter.ts
│   ├── hsrAccountLightcone.ts
│   │
│   │   # NEW Phase 3 skeleton tables:
│   ├── tournament.ts
│   ├── tournamentParticipant.ts
│   ├── tournamentAssistant.ts
│   ├── team.ts
│   ├── teamMember.ts
│   ├── teamInvite.ts
│   │
│   │   # NEW Phase 4 skeleton tables:
│   ├── bracketMatch.ts
│   ├── groupStanding.ts
│   │
│   │   # NEW Phase 5 skeleton tables:
│   ├── matchResult.ts
│   ├── matchResultGame.ts
│   ├── mmrRating.ts
│   ├── mmrHistory.ts
│   │
│   │   # NEW Phase 7 skeleton tables:
│   ├── achievement.ts
│   ├── userAchievement.ts
│   │
│   │   # NEW Phase 8 skeleton tables:
│   ├── availabilitySlot.ts
│   ├── savedCalendar.ts
│   ├── calendarEvent.ts
│   ├── calendarEventInvite.ts
│   │
│   │   # NEW Phase 10 skeleton tables:
│   └── (chat/cursor handled in existing tables, cost table update)
├── helpers/
│   └── auditColumns.ts  # No change
└── schema.ts            # Register ALL new tables
```

### Pattern 1: Enum Definition
**What:** Simple unit enums for discriminating states or categories
**When to use:** For all new discriminated types (TournamentStage, TournamentFormat, etc.)
```typescript
// Source: spacetimedb/src/types/enums.ts (confirmed from codebase)
export const TournamentStage = t.enum('TournamentStage', {
    Draft: t.unit(),
    Registration: t.unit(),
    Seeding: t.unit(),
    InProgress: t.unit(),
    Paused: t.unit(),
    Completed: t.unit(),
    Cancelled: t.unit(),
});
```

### Pattern 2: Struct Definition
**What:** Object type for genuinely nested/repeated data
**When to use:** Only when data is a self-contained concept (RecurrenceRule, EloConfig) or has 5+ identical-typed fields (EidolonCost pattern)
```typescript
// Source: spacetimedb/src/types/structs.ts (confirmed from codebase)
export const RecurrenceRule = t.object('RecurrenceRule', {
    recurrenceType: RecurrenceType,
    interval: t.u8(),          // Every N days/weeks
    dayOfWeek: t.u8().optional(), // 0=Sun..6=Sat, for weekly
    endDate: t.timestamp().optional(),
});
```

### Pattern 3: Table with Auto-Inc PK and BTree Indexes
**What:** Standard table layout for most domain entities
**When to use:** Any entity with its own identity, filtered by foreign references
```typescript
// Source: spacetimedb/src/tables/lobby.ts and lobbyMember.ts (confirmed from codebase)
export const tournamentColumns = {
    id: t.u32().primaryKey().autoInc(),
    name: t.string(),
    organizerId: t.u32(),           // FK: User.id
    format: TournamentFormat,
    stage: TournamentStage,
    // ... flat settings columns ...
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const Tournament = table({
    name: 'tournament',
    public: true,
    indexes: [
        { name: 'tournament_organizer', accessor: 'tournament_organizer', algorithm: 'btree', columns: ['organizerId'] },
        { name: 'tournament_stage', accessor: 'tournament_stage', algorithm: 'btree', columns: ['stage'] },
    ]
}, tournamentColumns);
```

### Pattern 4: Composite Primary Key Table
**What:** Junction table for many-to-many or child-of-parent relationships
**When to use:** Participant lists, team memberships, per-user-per-target rows
```typescript
// Source: spacetimedb/src/tables/lobbyMember.ts (confirmed from codebase)
export const TournamentParticipant = table({
    name: 'tournament_participant',
    public: true,
    primaryKey: ['tournamentId', 'userId'],
    indexes: [
        { name: 'tp_tournament_id', accessor: 'tp_tournament_id', algorithm: 'btree', columns: ['tournamentId'] },
        { name: 'tp_user_id', accessor: 'tp_user_id', algorithm: 'btree', columns: ['userId'] },
    ]
}, tournamentParticipantColumns);
```

### Pattern 5: Flattening an Existing Struct into a Table
**What:** Replace a struct column with individual flat columns
**When to use:** LobbyConfig → Lobby columns
```typescript
// BEFORE (existing lobby.ts):
//   config: LobbyConfig,  // one nested struct column
//
// AFTER (reworked lobby.ts):
//   teamSize: t.u8(),
//   draftMode: DraftMode,
//   banMode: BanMode,
//   standardTurnSeconds: t.u32(),
//   reserveBankSeconds: t.u32(),
//   auctionBudget: t.f32().optional(),
//   rosterDiffAdvantage: t.f32(),
//   rosterThreshold: t.f32(),
//   underThresholdAdvantage: t.f32(),
//   aboveThresholdPenalty: t.f32(),
//   deathPenalty: t.f32(),
//   // NEW columns:
//   tournamentId: t.u32().optional(),
//   bracketMatchId: t.u32().optional(),
//   isAnonymousPlayers: t.bool(),
//   isAnonymousSpectators: t.bool(),
//   isOpenRoster: t.bool(),
//   isPublic: t.bool(),
//   disconnectPolicy: DisconnectPolicy,
```

### Anti-Patterns to Avoid
- **Struct for grouping settings:** "LobbyConfig" pattern is being removed. Never group 1:1 settings in a struct unless the data is truly repeated or self-contained.
- **Missing audit columns:** Every table (except `ServerIdentity`) must end with the 4 audit columns. Missing them causes reducer failures.
- **Duplicate index names:** Index names must be unique across the ENTIRE module. Use table-prefix naming: `tournament_organizer`, `tp_tournament_id`, etc.
- **Spreading audit columns from a shared object:** The SKILL.md explicitly forbids importing/spreading audit columns. Each table defines them inline.
- **Skipping schema.ts registration:** Adding a table file but not importing it in `schema.ts` means it does not exist in the published module.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audit timestamps and actor tracking | Custom timestamp helper | `auditInsert()` / `auditUpdate()` from `helpers/auditColumns.ts` | Already handles created vs updated distinction, SYSTEM_USER_ID sentinel |
| ID generation for auto-inc tables | Custom counter | `t.u32().primaryKey().autoInc()` + pass `0` on insert | SpacetimeDB handles ID generation; gaps are expected and normal |
| Foreign key constraints | Custom validate-on-insert logic | u32 reference columns + reducer-level checks | SpacetimeDB has no FK constraints; this is by design |
| Optional columns | Nullable wrapper | `t.type().optional()` | Built into the SDK |

**Key insight:** Phase 1 has zero custom logic — it is purely declarative. All complexity is deferred to reducer phases. The schema must be stable because column renames/drops in published tables destroy data and require `--clear-database`.

---

## Common Pitfalls

### Pitfall 1: LobbyConfig Still Referenced in matchSessionHistory
**What goes wrong:** Removing `LobbyConfig` from `structs.ts` breaks `matchSessionHistory.ts` which uses it as `snapshotConfig: LobbyConfig`.
**Why it happens:** The history table captures the config at the time of the match for replay — a legitimate use of the struct as a snapshot type.
**How to avoid:** Rename `LobbyConfig` to `LobbyConfigSnapshot` in `structs.ts` and update `matchSessionHistory.ts` to use the renamed type. Remove the import from `lobby.ts`. The snapshot struct can keep its nested form since it is never used for filtering.
**Warning signs:** TypeScript compile error on `LobbyConfig` not found during `spacetime publish`.

### Pitfall 2: Duplicate Index Names Across Tables
**What goes wrong:** Two tables both declare an index named (e.g.) `user_id` → module fails to publish with a conflict error.
**Why it happens:** Index names are globally unique in SpacetimeDB — they are not scoped to a table.
**How to avoid:** Always prefix index names with the table name abbreviation. Convention already established: `lobby_host`, `lobby_member_lobby_id`, `user_discord_id`. New tables: `tournament_organizer`, `tp_tournament_id`, `mmr_user_id`, etc.
**Warning signs:** Publish error mentioning index name conflict.

### Pitfall 3: Optional Timestamp Columns for Scheduled Reveals
**What goes wrong:** `bracketRevealAt: t.timestamp()` (non-optional) forces every tournament to have a reveal time, breaking tournaments that reveal immediately.
**Why it happens:** Forgetting `.optional()` when a column represents a conditional future event.
**How to avoid:** Use `t.timestamp().optional()` for `bracketRevealAt` on the Tournament table.

### Pitfall 4: Missing Schema Registration
**What goes wrong:** A new table file is created but not imported in `schema.ts` — the table does not exist in the published module. Reducers in later phases that reference it will fail at publish time.
**Why it happens:** Schema assembly is manual — nothing auto-discovers table files.
**How to avoid:** Add the import and the table name to the `schema({})` object in `schema.ts` immediately when creating the table file. Group by category (same pattern as existing schema.ts).

### Pitfall 5: Dangerous Column Order Changes on Existing Tables
**What goes wrong:** Inserting new columns in the middle of `lobbyColumns` (rather than at the end) destroys existing data on publish.
**Why it happens:** SpacetimeDB column ordering is fixed after first publish. Middle-inserts are breaking changes.
**How to avoid:** When reworking `lobby.ts`, treat the rework as a breaking change that requires `--clear-database`. Since this is Phase 1 before any production data, it is acceptable. Document this explicitly in the plan task.

### Pitfall 6: Score Struct Needing Game-Mode Specificity
**What goes wrong:** A single `Score` struct that tries to unify MoC (cycles), Apocalyptic Shadow (score), and Anomaly Arbitration (cycles) leads to many optional fields and confusion.
**Why it happens:** Three game modes have different scoring units.
**How to avoid:** Define a `Score` struct that uses a `gameMode` discriminator with optional per-mode fields, OR define separate structs `MocScore`, `AsScore`, `AaScore`. Given the CONTEXT.md says "Score per game mode", separate structs OR a single struct with optionals are both valid — this is Claude's discretion territory. Recommended: single `GameScore` struct with optionals and a comment explaining the mode-specific semantics.

### Pitfall 7: EloConfig Struct vs Flat Columns
**What goes wrong:** Defining EloConfig as a struct used as a table column re-introduces the grouped-struct anti-pattern the user is eliminating.
**Why it happens:** EloConfig feels like a config group (like LobbyConfig was).
**How to avoid:** EloConfig is a type-level concept for passing ELO parameters within reducer logic — it should be defined as a struct in `structs.ts` but NOT used as a table column. Instead, any table that stores ELO config (e.g., a future global config table) should flatten those fields. For Phase 1, define EloConfig as a struct so it exists for Phase 5's reducer use.

---

## Complete Enum Specification (SCHM-01)

All new enums to add to `spacetimedb/src/types/enums.ts`:

```typescript
// TournamentStage — lifecycle states for a tournament
export const TournamentStage = t.enum('TournamentStage', {
    Draft: t.unit(),
    Registration: t.unit(),
    Seeding: t.unit(),
    InProgress: t.unit(),
    Paused: t.unit(),
    Completed: t.unit(),
    Cancelled: t.unit(),
});

// TournamentFormat — bracket structure type
export const TournamentFormat = t.enum('TournamentFormat', {
    SingleElimination: t.unit(),
    DoubleElimination: t.unit(),
    GroupOnly: t.unit(),
    GroupIntoSingleElim: t.unit(),
    GroupIntoDoubleElim: t.unit(),
});

// MatchResultStatus — verification pipeline for result submission
export const MatchResultStatus = t.enum('MatchResultStatus', {
    Pending: t.unit(),
    Submitted: t.unit(),
    Disputed: t.unit(),
    Validated: t.unit(),
    Rejected: t.unit(),
});

// ValidationStatus — per-game validation within a series
export const ValidationStatus = t.enum('ValidationStatus', {
    Pending: t.unit(),
    Confirmed: t.unit(),
    Disputed: t.unit(),
    Overridden: t.unit(),
});

// DisconnectPolicy — behavior when a player disconnects during a match
export const DisconnectPolicy = t.enum('DisconnectPolicy', {
    Pause: t.unit(),           // Pause match, wait for rejoin
    TimerThenForfeit: t.unit(), // Start timer; forfeit if no rejoin
    NoAction: t.unit(),        // Game continues without intervention
});

// RecurrenceType — calendar availability recurrence
export const RecurrenceType = t.enum('RecurrenceType', {
    Daily: t.unit(),
    Weekly: t.unit(),
    Monthly: t.unit(),
});

// RosterVisibility — user-set roster visibility preference
export const RosterVisibility = t.enum('RosterVisibility', {
    Public: t.unit(),
    Private: t.unit(),
});

// ParticipantStatus — state of a tournament participant
export const ParticipantStatus = t.enum('ParticipantStatus', {
    Registered: t.unit(),
    CheckedIn: t.unit(),
    Active: t.unit(),
    Eliminated: t.unit(),
    Disqualified: t.unit(),
    Withdrawn: t.unit(),
});

// ParticipantType — whether participant is an individual or a team
export const ParticipantType = t.enum('ParticipantType', {
    Individual: t.unit(),
    Team: t.unit(),
});

// AchievementRarity — display tier for achievements
export const AchievementRarity = t.enum('AchievementRarity', {
    Common: t.unit(),
    Rare: t.unit(),
    Epic: t.unit(),
    Legendary: t.unit(),
});

// AchievementTriggerType — how an achievement is awarded
export const AchievementTriggerType = t.enum('AchievementTriggerType', {
    StatThreshold: t.unit(),
    CharacterSpecific: t.unit(),
    Manual: t.unit(),
});

// ChatSenderType — distinguishes player chat from system messages
export const ChatSenderType = t.enum('ChatSenderType', {
    Player: t.unit(),
    System: t.unit(),
});

// TeamMemberRole — role within a persistent team
export const TeamMemberRole = t.enum('TeamMemberRole', {
    Owner: t.unit(),
    Player: t.unit(),
    Coach: t.unit(),
});

// GroupAssignmentMode — how group participants are assigned
export const GroupAssignmentMode = t.enum('GroupAssignmentMode', {
    Auto: t.unit(),   // By seed/MMR
    Manual: t.unit(), // TO assigns
});
```

**Note on GameMode extensions:** The existing `GameMode` enum already has the three modes (MemoryOfChaos, ApocalypticShadow, AnomalyArbitration). SCHM-01 lists "GameMode extensions" — there are no new variants needed per the locked decisions. No change to GameMode enum. If a "None" or "All" sentinel is needed for tournament default game mode, that can be handled with `t.enum('GameMode')` using `.optional()` on the column.

---

## Complete Struct Specification (SCHM-02)

All new structs to add to `spacetimedb/src/types/structs.ts`:

```typescript
// GameScore — per-game score within a BO series
// Used in MatchResultGame table rows (not as a table column directly)
export const GameScore = t.object('GameScore', {
    // MoC / Anomaly Arbitration: cycles used (lower = better)
    cyclesUsed: t.u32().optional(),
    // Apocalyptic Shadow: score points (higher = better)
    scorePoints: t.u64().optional(),
    // Per-boss breakdown (2 bosses per floor/stage)
    boss1Score: t.u64().optional(),
    boss2Score: t.u64().optional(),
});

// RecurrenceRule — self-contained recurrence specification for availability slots
export const RecurrenceRule = t.object('RecurrenceRule', {
    recurrenceType: RecurrenceType,
    interval: t.u8(),              // Every N units (1 = every day/week/month)
    dayOfWeek: t.u8().optional(),  // 0=Sunday..6=Saturday; only for Weekly
    dayOfMonth: t.u8().optional(), // 1-31; only for Monthly (Feb edge case handled in reducer)
    endDate: t.timestamp().optional(),
});

// EloConfig — parameters for ELO calculation (used in reducer logic, not as a table column)
export const EloConfig = t.object('EloConfig', {
    kFactorNew: t.u8(),       // K=40 for first 20 matches
    kFactorMid: t.u8(),       // K=20 for matches 21-100
    kFactorVet: t.u8(),       // K=10 for matches 100+
    newThreshold: t.u32(),    // 20 matches
    midThreshold: t.u32(),    // 100 matches
    initialRating: t.u32(),   // Starting MMR (typically 1000 or 1200)
});

// LobbyConfigSnapshot — preserved for MatchSessionHistory (replay use)
// Rename from LobbyConfig — the Lobby table now uses flat columns
export const LobbyConfigSnapshot = t.object('LobbyConfigSnapshot', {
    teamSize: t.u8(),
    draftMode: DraftMode,
    banMode: BanMode,
    standardTurnSeconds: t.u32(),
    reserveBankSeconds: t.u32(),
    auctionBudget: t.f32().optional(),
    rosterDiffAdvantage: t.f32(),
    rosterThreshold: t.f32(),
    underThresholdAdvantage: t.f32(),
    aboveThresholdPenalty: t.f32(),
    deathPenalty: t.f32(),
});
```

---

## Complete Table Specification (SCHM-03)

All new tables with columns, PKs, and recommended indexes. Every table ends with the 4 audit columns inline.

### Lobby Table Rework (lobby.ts)

Replace `config: LobbyConfig` with flat columns. This is a breaking change requiring `--clear-database` on publish.

```typescript
export const lobbyColumns = {
    id: t.u32().primaryKey().autoInc(),
    joinCode: t.string().unique(),
    hostUserId: t.u32(),
    teamBlueAlias: t.string(),
    teamRedAlias: t.string(),

    // Flattened from LobbyConfig:
    teamSize: t.u8(),
    draftMode: DraftMode,
    banMode: BanMode,
    standardTurnSeconds: t.u32(),
    reserveBankSeconds: t.u32(),
    auctionBudget: t.f32().optional(),
    rosterDiffAdvantage: t.f32(),
    rosterThreshold: t.f32(),
    underThresholdAdvantage: t.f32(),
    aboveThresholdPenalty: t.f32(),
    deathPenalty: t.f32(),

    // Tournament linkage (optional):
    tournamentId: t.u32().optional(),
    bracketMatchId: t.u32().optional(),

    // Anonymous play:
    isAnonymousPlayers: t.bool(),
    isAnonymousSpectators: t.bool(),

    // Roster:
    isOpenRoster: t.bool(),

    // Visibility:
    isPublic: t.bool(),
    passwordHash: t.string().optional(), // For private lobbies

    // Disconnect behavior:
    disconnectPolicy: DisconnectPolicy,

    // Lifecycle & Garbage Collection:
    hostDisconnectTime: t.timestamp().optional(),
    lastActivityAt: t.timestamp(),
    stage: LobbyStage,

    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: lobby_host (hostUserId), lobby_stage (stage), lobby_tournament (tournamentId)
```

### LobbyMember Table (add isCoach)

Add `isCoach: t.bool()` column. Coaches observe but cannot pick/ban (enforced at reducer level).

### HSR Account Tables (Phase 2 skeleton)

```typescript
// hsrAccount.ts — one user can have many HSR accounts
export const hsrAccountColumns = {
    id: t.u32().primaryKey().autoInc(),
    userId: t.u32(),           // FK: User.id
    uid: t.string(),           // In-game UID (not unique — duplicates allowed, warning only)
    displayLabel: t.string(),  // User-given label (e.g. "Main Account")
    isActive: t.bool(),        // Only one active per user (enforced in reducer)
    rosterVisibility: RosterVisibility,
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: hsr_account_user_id (userId), hsr_account_uid (uid)

// hsrAccountCharacter.ts — characters owned per HSR account
export const hsrAccountCharacterColumns = {
    accountId: t.u32(),
    characterName: t.string(),  // FK: HsrCharacter.name
    eidolonLevel: t.u8(),       // 0-6
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['accountId', 'characterName']
// Index: hsr_acc_char_account_id (accountId)

// hsrAccountLightcone.ts — lightcones owned per HSR account (no equip tracking)
export const hsrAccountLightconeColumns = {
    accountId: t.u32(),
    lightconeName: t.string(),  // FK: HsrLightcone.name
    superimpositionLevel: t.u8(), // 1-5
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['accountId', 'lightconeName']
// Index: hsr_acc_lc_account_id (accountId)
```

### Tournament Tables (Phase 3 skeleton)

```typescript
// tournament.ts
export const tournamentColumns = {
    id: t.u32().primaryKey().autoInc(),
    name: t.string(),
    description: t.string(),   // Max length enforced in reducer (~2000 chars typical)
    organizerId: t.u32(),      // FK: User.id
    format: TournamentFormat,
    stage: TournamentStage,
    defaultGameMode: GameMode,
    maxParticipants: t.u32(),

    // Anonymous play defaults:
    isAnonymousDefault: t.bool(),
    isOpenRoster: t.bool(),

    // Disconnect:
    disconnectPolicy: DisconnectPolicy,

    // Check-in:
    checkInEnabled: t.bool(),
    checkInPerRound: t.bool(),

    // Auto-forfeit:
    autoForfeitEnabled: t.bool(),
    autoForfeitMinutes: t.u32(),

    // Bracket reveal:
    bracketRevealAt: t.timestamp().optional(),

    // Grand finals advantage (double elim):
    grandFinalsAdvantage: t.bool(),  // Default true

    // Group phase:
    groupAssignmentMode: GroupAssignmentMode,
    groupAdvanceCount: t.u8(),       // 1 or 2

    // Season (deferred logic, schema support):
    seasonId: t.u32().optional(),

    // MMR counting:
    countTowardsMmr: t.bool(),       // Default false

    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: tournament_organizer (organizerId), tournament_stage (stage)

// tournamentParticipant.ts
export const tournamentParticipantColumns = {
    tournamentId: t.u32(),
    userId: t.u32(),           // Individual participant (or team captain)
    teamId: t.u32().optional(), // If participating as a team
    participantType: ParticipantType,
    status: ParticipantStatus,
    seedNumber: t.u32().optional(), // Assigned during Seeding stage
    anonymousAlias: t.string().optional(), // "Tournament Player N" for anonymous tournaments
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['tournamentId', 'userId']
// Indexes: tp_tournament_id (tournamentId), tp_user_id (userId)

// tournamentAssistant.ts — TO assistant / referee assignments
export const tournamentAssistantColumns = {
    tournamentId: t.u32(),
    userId: t.u32(),
    canValidateResults: t.bool(),
    canOverrideResults: t.bool(),
    canDqParticipants: t.bool(),
    canManageBracket: t.bool(),
    canAssignSeeds: t.bool(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['tournamentId', 'userId']
// Indexes: ta_tournament_id (tournamentId), ta_user_id (userId)
```

### Team Tables (Phase 3 skeleton)

```typescript
// team.ts
export const teamColumns = {
    id: t.u32().primaryKey().autoInc(),
    name: t.string().unique(),
    ownerId: t.u32(),          // FK: User.id
    isAdHoc: t.bool(),         // True = tournament-only group, no persistence
    tournamentId: t.u32().optional(), // Only set if isAdHoc=true
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: team_owner (ownerId)

// teamMember.ts
export const teamMemberColumns = {
    teamId: t.u32(),
    userId: t.u32(),
    memberRole: TeamMemberRole,
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['teamId', 'userId']
// Indexes: tm_team_id (teamId), tm_user_id (userId)

// teamInvite.ts
export const teamInviteColumns = {
    id: t.u32().primaryKey().autoInc(),
    teamId: t.u32(),
    inviteeUserId: t.u32(),
    inviterUserId: t.u32(),
    isPending: t.bool(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: ti_team_id (teamId), ti_invitee_id (inviteeUserId)
```

### Bracket Tables (Phase 4 skeleton)

```typescript
// bracketMatch.ts
export const bracketMatchColumns = {
    id: t.u32().primaryKey().autoInc(),
    tournamentId: t.u32(),
    roundNumber: t.u32(),
    matchNumber: t.u32(),      // Position within the round
    isLosersBracket: t.bool(), // For double elimination
    groupId: t.u32().optional(), // For group phase matches

    // Participants (u32=0 means TBD):
    participant1Id: t.u32().optional(), // FK: tournamentParticipant userId
    participant2Id: t.u32().optional(),

    // Advancement routing (BRKT-06: explicit FKs):
    nextWinnerMatchId: t.u32().optional(),
    nextLoserMatchId: t.u32().optional(),

    // Series config:
    bestOf: t.u8(),            // 1, 3, or 5
    gameMode: GameMode,        // May override tournament default

    // Grand finals advantage:
    winnerAdvantage: t.u8(),   // 0 or 1 (wins head start)

    // Scheduling:
    scheduledAt: t.timestamp().optional(),
    lobbyId: t.u32().optional(),

    // Check-in:
    checkInRequired: t.bool(),

    // Result:
    winnerId: t.u32().optional(),
    resultStatus: MatchResultStatus,

    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: bm_tournament_id (tournamentId), bm_round (tournamentId + roundNumber as composite? or separate)
// Recommendation: bm_tournament (tournamentId), bm_lobby (lobbyId)

// groupStanding.ts — group phase standings tracking
export const groupStandingColumns = {
    tournamentId: t.u32(),
    groupId: t.u32(),
    participantUserId: t.u32(),
    wins: t.u32(),
    losses: t.u32(),
    draws: t.u32(),
    points: t.u32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['tournamentId', 'groupId', 'participantUserId']
// Indexes: gs_tournament_group (tournamentId + groupId)
```

### Match Result Tables (Phase 5 skeleton)

```typescript
// matchResult.ts — series-level result (e.g. a BO3 series)
export const matchResultColumns = {
    id: t.u32().primaryKey().autoInc(),
    bracketMatchId: t.u32().optional(), // Linked to tournament bracket
    lobbyId: t.u32(),
    player1Id: t.u32(),
    player2Id: t.u32(),
    isTournamentMatch: t.bool(),
    status: MatchResultStatus,
    winnerId: t.u32().optional(),
    mmrProcessedAt: t.timestamp().optional(), // Guard against duplicate ELO application
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: mr_lobby (lobbyId), mr_player1 (player1Id), mr_player2 (player2Id)

// matchResultGame.ts — per-game result within a series
export const matchResultGameColumns = {
    matchResultId: t.u32(),
    gameNumber: t.u8(),         // 1, 2, 3 (up to 5 in BO5)
    gameMode: GameMode,
    player1ScreenshotUrl: t.string().optional(), // Imgur URL
    player2ScreenshotUrl: t.string().optional(),
    player1CyclesUsed: t.u32().optional(),       // MoC/AA scoring
    player2CyclesUsed: t.u32().optional(),
    player1Score: t.u64().optional(),            // AS scoring
    player2Score: t.u64().optional(),
    player1Boss1Score: t.u64().optional(),       // Per-boss breakdown
    player1Boss2Score: t.u64().optional(),
    player2Boss1Score: t.u64().optional(),
    player2Boss2Score: t.u64().optional(),
    winnerId: t.u32().optional(),
    validationStatus: ValidationStatus,
    validatedById: t.u32().optional(),           // Referee who validated
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['matchResultId', 'gameNumber']
// Indexes: mrg_match_result (matchResultId)

// mmrRating.ts — per-player, per-game-mode ELO rating
export const mmrRatingColumns = {
    userId: t.u32(),
    gameMode: GameMode,
    rating: t.u32(),            // ELO rating (e.g. 1200)
    matchesPlayed: t.u32(),     // For K-factor tiering
    seasonId: t.u32().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['userId', 'gameMode']
// Indexes: mmr_user_id (userId)

// mmrHistory.ts — log of every rating change
export const mmrHistoryColumns = {
    id: t.u32().primaryKey().autoInc(),
    userId: t.u32(),
    gameMode: GameMode,
    matchResultId: t.u32(),
    previousRating: t.u32(),
    newRating: t.u32(),
    delta: t.i32(),             // Signed: can be negative
    seasonId: t.u32().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: mh_user_id (userId), mh_match_result (matchResultId)
```

### Achievement Tables (Phase 7 skeleton)

```typescript
// achievement.ts — achievement definitions (admin-created)
export const achievementColumns = {
    id: t.u32().primaryKey().autoInc(),
    name: t.string().unique(),
    description: t.string(),
    triggerType: AchievementTriggerType,
    rarity: AchievementRarity,
    isOneTime: t.bool(),        // Threshold = repeatable by default; manual = always one-time
    thresholdValue: t.u32().optional(), // For StatThreshold/CharacterSpecific
    characterName: t.string().optional(), // For CharacterSpecific
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

// userAchievement.ts — awarded achievements per user
export const userAchievementColumns = {
    id: t.u32().primaryKey().autoInc(),
    userId: t.u32(),
    achievementId: t.u32(),
    awardedById: t.u32(),        // Admin/system user who awarded it
    isDisplayed: t.bool(),       // User's selected title to display
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: ua_user_id (userId), ua_achievement_id (achievementId)
```

### Calendar Tables (Phase 8 skeleton)

```typescript
// availabilitySlot.ts
export const availabilitySlotColumns = {
    id: t.u32().primaryKey().autoInc(),
    userId: t.u32(),
    startAt: t.timestamp(),        // UTC
    endAt: t.timestamp(),          // UTC
    isRecurring: t.bool(),
    recurrenceRule: RecurrenceRule, // Optional per-slot, only if isRecurring
    expiresAt: t.timestamp(),       // 6-month auto-expiry
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: avail_user_id (userId), avail_start_at (startAt)

// savedCalendar.ts — up to 5 saved calendars per user
export const savedCalendarColumns = {
    userId: t.u32(),
    targetUserId: t.u32(),
    isVisible: t.bool(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['userId', 'targetUserId']
// Indexes: sc_user_id (userId)

// calendarEvent.ts
export const calendarEventColumns = {
    id: t.u32().primaryKey().autoInc(),
    organizerId: t.u32(),           // FK: User.id
    title: t.string(),
    startAt: t.timestamp(),         // UTC
    endAt: t.timestamp(),           // UTC
    bracketMatchId: t.u32().optional(), // Optional tournament link
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// Indexes: ce_organizer (organizerId), ce_start_at (startAt)

// calendarEventInvite.ts
export const calendarEventInviteColumns = {
    eventId: t.u32(),
    inviteeUserId: t.u32(),
    isAccepted: t.bool().optional(), // null=pending, true=accepted, false=declined
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
// PK: ['eventId', 'inviteeUserId']
// Indexes: cei_event_id (eventId), cei_invitee_id (inviteeUserId)
```

### HsrLightconeCost Table Update (COST-01 skeleton)

The existing `HsrLightconeCost` table uses `lightconeName` as a single primary key. To add `gameMode` as a composite key (parity with HsrCharacterCost), the table definition must be updated. This is a breaking schema change requiring `--clear-database`.

```typescript
// Updated hsrLightconeCost.ts
export const hsrLightconeCostColumns = {
    lightconeName: t.string(),
    gameMode: GameMode,         // NEW — composite key with lightconeName
    classicCosts: SuperimpositionCost,
    auctionBaseBid: SuperimpositionCost,
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const HsrLightconeCost = table({
    name: 'hsr_lightcone_cost',
    public: true,
    primaryKey: ['lightconeName', 'gameMode'],
}, hsrLightconeCostColumns);
```

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected — SpacetimeDB module tests require publish + inspect pattern |
| Config file | N/A — no test runner config exists |
| Quick run command | `spacetime publish <db-name> --clear-database -y --module-path spacetimedb/` |
| Full suite command | `spacetime generate --lang typescript --out-dir src/module_bindings --module-path spacetimedb/ && npx tsc --noEmit` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SCHM-01 | All new enums defined and compile | build-smoke | `spacetime publish ... --clear-database -y` | ❌ Wave 0 |
| SCHM-02 | All new struct types defined and compile | build-smoke | `spacetime publish ... --clear-database -y` | ❌ Wave 0 |
| SCHM-03 | All new tables have 4 audit columns | build-smoke + manual inspect | `spacetime generate ...` then grep generated bindings | ❌ Wave 0 |

**Note:** SpacetimeDB schema validation is the publish step itself. A successful `spacetime publish` with `--clear-database` is the definitive test that all enums, structs, and tables are valid. The `spacetime generate` step confirms client bindings are producible. There is no unit test framework for schema-only phases — the compiler and the publish pipeline ARE the tests.

### Sampling Rate
- **Per task commit:** `spacetime publish <name> --clear-database -y --module-path spacetimedb/`
- **Per wave merge:** `spacetime generate --lang typescript --out-dir <client>/src/module_bindings --module-path spacetimedb/`
- **Phase gate:** Both publish and generate succeed cleanly before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] Verify `spacetime server list` shows maincloud as default (marked `***`) before publishing
- [ ] Confirm database name from existing `spacetime.json` or `spacetime.local.json`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `LobbyConfig` as nested struct column | Flat columns on Lobby table | Phase 1 | Columns are indexable; queries do not require struct traversal |
| Single `lightconeName` PK on HsrLightconeCost | Composite `['lightconeName', 'gameMode']` PK | Phase 1 / COST-01 | Parity with HsrCharacterCost for per-mode cost lookups |
| No explicit tournament/bracket schema | Full skeleton tables for all 10 phases | Phase 1 | Reducers in later phases reference established column names and types |

**Deprecated/outdated:**
- `LobbyConfig` struct: replaced by flat Lobby columns. Keep as `LobbyConfigSnapshot` for MatchSessionHistory use only.

---

## Open Questions

1. **Notification table stub**
   - What we know: Notifications/reminders are deferred. User is undecided on whether to add a stub now.
   - What's unclear: Whether a stub table now saves refactoring cost in Phase 8+ or adds noise.
   - Recommendation: Add a minimal `notificationStub.ts` with just `id`, `userId`, `message`, `isRead`, and audit columns — it costs one table registration and prevents a breaking schema change later. Mark it as "stub — not yet used by any reducer."

2. **isCoach on LobbyMember vs TeamMember enum**
   - What we know: Coach role exists on teams (TeamMemberRole enum covers this). LobbyMember already has `isReferee`. Coach in a lobby context needs to be observable.
   - What's unclear: Should `isCoach` be a separate bool on LobbyMember, or can the `participationRole` enum be extended?
   - Recommendation: Add `isCoach: t.bool()` as a flat column on LobbyMember. Extending ParticipationRole to add `Coach` would also work, but a bool is simpler and more searchable.

3. **MatchSessionHistory with LobbyConfigSnapshot**
   - What we know: matchSessionHistory.ts has `snapshotConfig: LobbyConfig`. LobbyConfig will be renamed.
   - Recommendation: Rename to `LobbyConfigSnapshot` and update matchSessionHistory.ts. The rename is safe because matchSessionHistory.ts is the only consumer.

---

## Sources

### Primary (HIGH confidence)
- Codebase direct inspection: `spacetimedb/src/types/enums.ts`, `structs.ts`, `helpers/auditColumns.ts`, `schema.ts`, all `tables/*.ts` files — all patterns verified by reading actual source
- `.claude/skills/spacetimedb/SKILL.md` — enforced naming conventions, audit column policy, index naming rules, dangerous schema change warnings

### Secondary (MEDIUM confidence)
- `.planning/phases/01-schema-foundation/01-CONTEXT.md` — all locked decisions derive from user discussions; treated as HIGH confidence for scope
- `.planning/REQUIREMENTS.md` — requirement IDs SCHM-01, SCHM-02, SCHM-03 and their definitions

### Tertiary (LOW confidence)
- None — all findings based on direct code inspection

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all patterns verified from existing codebase files
- Architecture: HIGH — every pattern has a working example in the repo
- Pitfalls: HIGH — derived from SKILL.md enforced rules and direct code inspection
- Enum/struct/table specs: HIGH for structure; MEDIUM for which index columns to choose (performance implications unknown without load data)

**Research date:** 2026-03-15
**Valid until:** Stable — SpacetimeDB TypeScript SDK patterns do not change frequently; re-verify if SDK version is bumped
