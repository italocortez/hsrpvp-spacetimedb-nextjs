# Phase 1: Schema Foundation - Context

**Gathered:** 2026-03-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Define all new enums, structs, and table schemas for the entire v0.5 backend milestone. Flatten existing LobbyConfig into Lobby columns. No reducers in this phase — only data contracts. Module must publish and generate valid client bindings.

</domain>

<decisions>
## Implementation Decisions

### Table Design Philosophy
- Flat columns for all 1:1 data — no config structs for grouping settings
- Table bloat is acceptable; players filter Lobbies and Tournaments frequently, so indexable columns matter
- Existing LobbyConfig struct will be flattened into Lobby table columns
- Only use structs for genuinely repeated/nested data (e.g., EidolonCost with 7 identical fields, RecurrenceRule as a self-contained concept)
- No foreign keys in SpacetimeDB — use u32 columns with application-level enforcement in reducers

### Tournament Data Model
- **5 tournament formats** as a single enum: SingleElimination, DoubleElimination, GroupOnly, GroupIntoSingleElim, GroupIntoDoubleElim
- **Tournament stage lifecycle**: Draft → Registration → Seeding → InProgress → Paused → Completed → Cancelled
- All tournament settings as flat columns: isAnonymousDefault, isOpenRoster, disconnectPolicy, defaultGameMode, maxParticipants, checkInEnabled, checkInPerRound, autoForfeitEnabled, autoForfeitMinutes, bracketRevealAt (optional scheduled timestamp), description (text field for TO, follow best practices on max length)
- **Best-of series**: up to BO5, configurable per round (not just per tournament). Convenience feature: cascade update BO count up to specific rounds (semis, finals)
- **Grand finals advantage**: winners bracket finalist starts with 1 win advantage (configurable, default on). In BO1 tournaments, no advantage but TO can toggle
- **Per-round game mode override**: default game mode set per tournament, but TO can override per round. Default is everyone plays same mode
- **Group phase**: groups can be auto-generated (by seed/MMR) or manually assigned by TO. Max top 2 advance per group (configurable: top 1 or top 2). Group-only tournaments are also valid (no elimination phase)
- **Check-in**: optional per tournament AND per round (people's schedules change)
- **Pause vs Cancel**: pause blocks new match creation but in-progress lobbies continue; cancel voids results but NEVER wipes match history (replay is priority)
- **Manual lobby creation**: players/TO manually create lobbies and link to bracket matches. Calendar facilitates scheduling
- **No-show handling**: default is TO override. Auto-forfeit only available when match was pre-arranged via calendar event where both agreed. Auto-forfeit wait time is configurable
- **TO Assistants**: TO can assign assistant users with a permission template (referee + partial TO powers). Default template provided, customizable per assistant

### Teams
- Persistent teams exist as orgs with rosters
- Ad-hoc groups allowed for tournament-only participation
- Coach role on team: can observe match (cursor tracking) but cannot pick/ban

### Roster & Account Model
- Many-to-many: 1 user can have many HSR accounts, many users can claim the same HSR UID (no blocking, just warning of duplicate UID)
- Each HSR account has its own character/lightcone roster — same character can exist on multiple accounts with different eidolons
- Lightcones are ownership only, no equip tracking (no lightcone-to-character assignment)
- Account rating = sum of character costs (by eidolon) + lightcone costs, varies per game mode/ruleset, mapped to labeled breakpoints via existing cost tables
- Roster visibility: public or private per user, overridden by tournament/lobby settings
  - **Admins**: always see all rosters
  - **TO**: sees roster only for participants in their tournament, loses visibility when tournament ends
  - **Opponents**: only while in the same lobby/match (if tournament/lobby says open roster)
  - **Everyone else**: respects user's public/private setting

### Match Result & MMR Model
- **Per-game scoring in series**: each individual game in a BO3/BO5 series has its own score, screenshots, and verification (not combined)
- Score format is game-mode-specific: cycles for MoC/Anomaly Arbitration, score for Apocalyptic Shadow, with optional per-boss breakdown
- Both players upload Imgur screenshot URLs and submit scores
- **Casual matches**: auto-confirm on matching scores; mismatch goes to re-submit flow, then escalates to ref if still disagreed
- **Tournament matches**: require referee/admin validation
- **Dispute flow**: re-submit first, escalate to ref only if still disagreed after re-submission
- **MMR and tournaments**: tournament matches count toward MMR is an opt-in setting per tournament (default false). When enabled, same weight as casual
- ELO delta (+15, -12) saved in MmrHistory alongside new rating and match reference — for dashboards
- ELO changes always visible to players

### Anonymous Play Model
- **Per-match**: random codenames (fun themed names from a pool) — reset each match
- **Per-tournament**: "Tournament Player N" alias persists across all matches in the tournament, displayed on brackets
- Tournament lobby inherits tournament alias, overwriting per-match codenames
- **Separate toggles** for hiding player names and hiding spectator names (at both tournament and match level)
- After tournament ends, real names revealed on brackets
- Anonymous enforcement at data write layer — cursor events and match events carry anonymousLabel instead of userId

### Calendar & Scheduling Model
- **All timestamps UTC** — frontend converts to local time. Never save non-UTC timestamps
- Standard calendar recurrence: daily, weekly (monthly with Feb handling from requirements)
- Availability slots auto-expire after 6 months, cannot be created more than 6 months ahead
- SavedCalendar: userId + targetUserId + isVisible toggle. Hard limit of 5 saved calendars enforced at reducer level. No approval needed to save someone's calendar
- Auto-sync: suggests overlapping windows only, does not auto-create events
- CalendarEvent has optional bracketMatchId (u32) to link scheduling to tournament matches
- Notifications/reminders deferred to future

### Achievement System
- Trigger types: stat thresholds (win count, match count, etc.), character-specific (win X with character, use all chars from a path/element), special/manual (admin-only)
- No tournament placement auto-awards — those are manual by admin/TO
- Rarity tiers: Common, Rare, Epic, Legendary — affects display
- Threshold achievements are repeatable by default unless admin marks one-time. Manual achievements are always one-time
- Player selects which earned title to display on profile

### Chat
- Raw text + shortcodes for emoji (":thumbsup: nice pick" stored as plain string, frontend renders)
- System messages in same table with a 'system' sender type flag (e.g., "Player X joined", "Match paused")
- 500 character limit per message
- Ephemeral — cleaned up on lobby close in same transaction

### Lobby Rework
- Flatten LobbyConfig struct into Lobby columns
- Add tournament reference columns: tournamentId (u32, optional), bracketMatchId (u32, optional)
- Add anonymous toggles: isAnonymousPlayers, isAnonymousSpectators
- Add open roster toggle: isOpenRoster
- Lobby capacity: 6 players, 2 coaches, 12 spectators = 20 max total (hardcoded in reducer)
- Visibility: public or private (password-protected). Both have joinCode for quick invite (Jackbox-style)
- Disconnect policy column on lobby (inherits from tournament if tournament lobby)

### Guest Account Restrictions
- Guest accounts blocked from: calendar, roster management, tournament participation, team creation, achievement collection, chat
- Enforced at reducer level — every feature reducer checks isGuest and rejects if true

### Claude's Discretion
- Exact struct definitions for genuinely nested data (RecurrenceRule, etc.)
- Index strategy per table (which columns get BTree indexes)
- Enum variant naming conventions (follow existing codebase patterns)
- Column ordering within tables
- Whether to add a Notification table stub now for future use

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `spacetimedb/src/types/enums.ts`: Existing enums (Role, GameMode, LobbyStage, TeamLabel, etc.) — extend this file with new enums
- `spacetimedb/src/types/structs.ts`: Existing structs (LobbyConfig, EidolonCost, StepPayload, etc.) — add new structs here, flatten LobbyConfig
- `spacetimedb/src/helpers/auditColumns.ts`: `auditInsert()` and `auditUpdate()` helpers — apply to all new tables
- `spacetimedb/src/helpers/ensurePermissions.ts`: `getAuthenticatedUser()`, `ensureAdmin()` — extend with `ensureTournamentOrganizer()`, `ensureVerifiedUser()`

### Established Patterns
- Enums: `t.enum('Name', { Variant: t.unit() })` for simple enums, `t.enum('Name', { Variant: StructRef })` for sum types
- Structs: `t.object('Name', { field: t.type() })`
- Tables: `table({ name: 'snake_case', public: true, indexes: [...] }, columns)` with columns exported separately
- Composite primary keys: `primaryKey: ['col1', 'col2']` on table config
- Auto-increment IDs: `t.u32().primaryKey().autoInc()` — pass 0 on insert
- All tables are `public: true`
- Audit columns on every table: createdById, createdDate, lastModifiedById, lastModifiedDate
- Schema assembly in `spacetimedb/src/schema.ts` — import all tables, organize by category

### Integration Points
- `spacetimedb/src/schema.ts`: All new tables must be registered here
- `spacetimedb/src/index.ts`: Reducer exports (Phase 1 has no reducers, but schema must be importable)
- `spacetimedb/src/tables/lobby.ts`: Must be refactored to flatten LobbyConfig and add new columns
- `spacetimedb/src/types/enums.ts` and `structs.ts`: All new type definitions go here

</code_context>

<specifics>
## Specific Ideas

- LobbyConfig must be flattened (user is not married to existing struct pattern)
- HSR account UID validation can be checked via https://mihoyo.riyugan.com/hsr-checker/ (future frontend feature, but schema should store the UID)
- Tournament bracket reveal supports a scheduled timestamp (TO sets a specific date/time for reveal)
- Anonymous codenames should be fun themed names (not generic "Player 1" for per-match mode)
- Tournament description field should follow best practices on max string length

</specifics>

<deferred>
## Deferred Ideas

- HoYoverse API integration for roster import — future milestone
- Computer vision screenshot import — future milestone
- Season implementation logic — schema supports it (seasonId column), logic deferred
- Notification/reminder system for calendar — deferred
- Automated anti-smurf detection — deferred until player base is large enough

</deferred>

---

*Phase: 01-schema-foundation*
*Context gathered: 2026-03-15*
