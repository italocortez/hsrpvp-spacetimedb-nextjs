---
phase: 01-schema-foundation
plan: 01
subsystem: database
tags: [spacetimedb, typescript, schema, enums, structs, tables]

# Dependency graph
requires: []
provides:
  - 14 new enums exported from enums.ts (TournamentStage, TournamentFormat, MatchResultStatus, ValidationStatus, DisconnectPolicy, RecurrenceType, RosterVisibility, ParticipantStatus, ParticipantType, AchievementRarity, AchievementTriggerType, ChatSenderType, TeamMemberRole, GroupAssignmentMode)
  - 3 new structs: GameScore, RecurrenceRule, EloConfig
  - LobbyConfigSnapshot (renamed from LobbyConfig, used by matchSessionHistory)
  - Flattened Lobby table with 30+ columns (tournament, anonymous play, roster, visibility, disconnect policy, game mode)
  - LobbyMember.isCoach column
  - HsrLightconeCost composite PK ['lightconeName', 'gameMode']
affects:
  - 02-skeleton-tables
  - 03-tournament-core
  - 04-bracket-engine
  - 05-profile-media
  - 06-elo-ranking
  - 07-achievements
  - 08-calendar-events
  - 09-chat-notifications
  - 10-frontend-milestone

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Flat columns over nested config structs for filterable lobby data
    - Composite PK pattern for game-mode-scoped cost tables
    - LobbyConfigSnapshot used only in matchSessionHistory for historical immutability

key-files:
  created: []
  modified:
    - spacetimedb/src/types/enums.ts
    - spacetimedb/src/types/structs.ts
    - spacetimedb/src/tables/lobby.ts
    - spacetimedb/src/tables/lobbyMember.ts
    - spacetimedb/src/tables/matchSessionHistory.ts
    - spacetimedb/src/tables/hsrLightconeCost.ts
    - spacetimedb/src/reducers/admin.ts

key-decisions:
  - "LobbyConfig renamed to LobbyConfigSnapshot — only used by matchSessionHistory for historical snapshot; Lobby table uses flat columns"
  - "HsrLightconeCost composite PK ['lightconeName', 'gameMode'] allows per-mode cost differentiation"
  - "ValidationStatus added as 4th enum beyond the 13 in plan spec (required for MatchResultStatus workflow)"

patterns-established:
  - "Flat columns: all filterable fields go directly on the table, not inside nested struct columns"
  - "Composite PK on game-scoped tables: lightconeName + gameMode for cost lookups"
  - "Snapshot structs: LobbyConfigSnapshot is immutable historical record in matchSessionHistory"

requirements-completed: [SCHM-01, SCHM-02]

# Metrics
duration: 3min
completed: 2026-03-16
---

# Phase 1 Plan 01: Schema Foundation — Enums, Structs, and Table Reworks Summary

**26 enums and 7 structs defined for v0.5 milestone, Lobby table flattened to 30+ queryable columns, HsrLightconeCost given composite PK for per-mode cost differentiation**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-16T03:47:03Z
- **Completed:** 2026-03-16T03:49:22Z
- **Tasks:** 2 of 2
- **Files modified:** 7

## Accomplishments

- Defined all 14 new enums (plus ValidationStatus) appended to enums.ts without touching existing enums
- Renamed LobbyConfig to LobbyConfigSnapshot in structs.ts and added GameScore, RecurrenceRule, EloConfig structs
- Rewrote lobby.ts with 30+ flat columns replacing the nested LobbyConfig struct, added lobby_stage and lobby_tournament indexes
- Added isCoach boolean to LobbyMember table
- Updated HsrLightconeCost to composite PK on ['lightconeName', 'gameMode']

## Task Commits

Each task was committed atomically:

1. **Task 1: Define all new enums and structs** - `e0339c4` (feat)
2. **Task 2: Flatten Lobby, update existing tables, update LightconeCost** - `7390f4b` (feat)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified

- `spacetimedb/src/types/enums.ts` - Added 14 new enums (TournamentStage through GroupAssignmentMode); 26 total enums
- `spacetimedb/src/types/structs.ts` - Renamed LobbyConfig to LobbyConfigSnapshot; added GameScore, RecurrenceRule, EloConfig; imported RecurrenceType
- `spacetimedb/src/tables/lobby.ts` - Complete rewrite: 30+ flat columns replacing nested config; new tournament/anonymous/roster/visibility/disconnect/gameMode columns; lobby_stage and lobby_tournament indexes added
- `spacetimedb/src/tables/lobbyMember.ts` - Added isCoach boolean column after isReferee
- `spacetimedb/src/tables/matchSessionHistory.ts` - Import and column type updated from LobbyConfig to LobbyConfigSnapshot
- `spacetimedb/src/tables/hsrLightconeCost.ts` - Added gameMode column; composite PK ['lightconeName', 'gameMode'] replaces single PK
- `spacetimedb/src/reducers/admin.ts` - Fixed HsrLightconeCost delete and bulk upsert to use iter() for composite PK lookup

## Decisions Made

- LobbyConfig is renamed LobbyConfigSnapshot and restricted to matchSessionHistory as an immutable historical record. The live Lobby table gets all fields as flat columns for queryability.
- ValidationStatus was added (plan listed 13 enums but needed 14 for the MatchResultStatus workflow — listed in plan spec as enum #4 under a different name in the task body).
- HsrLightconeCost composite PK allows each lightcone to have different costs per game mode (MemoryOfChaos vs ApocalypticShadow vs AnomalyArbitration).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed admin.ts HsrLightconeCost accessor after composite PK change**
- **Found during:** Task 2 (Flatten Lobby, update existing tables, update LightconeCost)
- **Issue:** admin.ts was using `ctx.db.HsrLightconeCost.lightconeName.find()` and `.update()` which only work when lightconeName is the sole PK. After switching to composite PK, the named accessor no longer exists.
- **Fix:** Replaced both the delete-by-PK case and the bulk-upsert case with iter()-based lookups matching lightconeName + gameMode.tag, then delete+re-insert pattern (consistent with HsrCharacterCost pattern already in the file).
- **Files modified:** spacetimedb/src/reducers/admin.ts
- **Verification:** TypeScript compiles cleanly with no errors
- **Committed in:** 7390f4b (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 — bug caused by table schema change)
**Impact on plan:** Necessary correctness fix. No scope creep. Admin reducer now consistently uses iter() for all composite-PK tables.

## Issues Encountered

None — plan executed smoothly. The TypeScript compiler immediately surfaced the admin.ts accessor issue which was fixed inline.

## User Setup Required

None — no external service configuration required.

This is a schema-only change. Publishing to maincloud will require `--clear-database` due to:
- Lobby table columns reordered/added/removed (nested config replaced by flat columns)
- HsrLightconeCost PK changed from single to composite

## Next Phase Readiness

- All 14 new enums are available for Plan 02 (skeleton tables) to import
- LobbyConfigSnapshot, GameScore, RecurrenceRule, EloConfig structs are available
- Flat Lobby columns with tournament/anonymous/roster support ready
- HsrLightconeCost ready for per-mode cost admin seeding

---
*Phase: 01-schema-foundation*
*Completed: 2026-03-16*
