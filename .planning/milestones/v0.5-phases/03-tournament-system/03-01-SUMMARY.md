---
phase: 03-tournament-system
plan: 01
subsystem: database
tags: [spacetimedb, schema, enums, permissions, tournament, cost-sets]

# Dependency graph
requires:
  - phase: 02-roster-management
    provides: hsrCharacterCost/hsrLightconeCost tables with costSetId sentinel pattern
provides:
  - Moderator role in Role enum with numeric permission hierarchy (Admin>Moderator>TournamentHost>User)
  - RosterVisibility enum (OpenRoster, ClosedWithRating, ClosedNoRating)
  - Seeding stage in TournamentStage (Paused removed)
  - isRoleAtLeast(), getRoleLevel(), ensureModerator() in ensurePermissions.ts
  - validateStageTransition(), ensureTournamentAccess() in tournamentHelpers.ts
  - 6 new tables: CostSet, CostSetDraftCharacter, CostSetDraftLightcone, CostSetDraftSynergy, TournamentTeam, TournamentTeamRequest
  - Tournament table with rosterVisibility, winnerAdvantage, teamSize, costSetId, registration requirements
  - TournamentParticipant with teamGroupId, isWaitlisted, hsrAccountId
  - MatchResultRecord with confirmation, dispute, and tournamentId fields
  - HsrCharacterCost and HsrLightconeCost PKs expanded to include costSetId
  - Module published to maincloud (--clear-database), client bindings regenerated
affects: [03-02-tournament-crud, 03-03-tournament-registration, 03-04-tournament-bracket]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Numeric role hierarchy: ROLE_LEVEL map + isRoleAtLeast() replaces hard-coded tag comparisons"
    - "Forward-only stage machine: validateStageTransition() enforces Draft→Registration→Seeding→InProgress→Completed"
    - "Cost set isolation: costSetId=0 is default sentinel; tournament-specific sets use CostSet.id"
    - "Draft tables private: CostSetDraft* tables omit public:true so clients never see in-progress edits"

key-files:
  created:
    - spacetimedb/src/helpers/tournamentHelpers.ts
    - spacetimedb/src/tables/costSet.ts
    - spacetimedb/src/tables/costSetDraftCharacter.ts
    - spacetimedb/src/tables/costSetDraftLightcone.ts
    - spacetimedb/src/tables/costSetDraftSynergy.ts
    - spacetimedb/src/tables/tournamentTeam.ts
    - spacetimedb/src/tables/tournamentTeamRequest.ts
    - src/module_bindings/cost_set_table.ts
    - src/module_bindings/tournament_team_table.ts
    - src/module_bindings/tournament_team_request_table.ts
  modified:
    - spacetimedb/src/types/enums.ts
    - spacetimedb/src/helpers/ensurePermissions.ts
    - spacetimedb/src/tables/tournament.ts
    - spacetimedb/src/tables/tournamentParticipant.ts
    - spacetimedb/src/tables/matchResult.ts
    - spacetimedb/src/tables/hsrCharacterCost.ts
    - spacetimedb/src/tables/hsrLightconeCost.ts
    - spacetimedb/src/tables/lobby.ts
    - spacetimedb/src/schema.ts
    - src/module_bindings/index.ts

key-decisions:
  - "Moderator role level 75 — between Admin (100) and TournamentHost (50); accepted by admin_update_user automatically via Object.keys(Role.variants) (TRNT-01)"
  - "Paused stage removed from TournamentStage — pausing handled at application level, not via stage machine"
  - "Seeding stage added between Registration and InProgress for bracket assignment workflow"
  - "CostSetDraft* tables private (no public:true) — draft cost edits not broadcast to clients until published"
  - "costSetId=0 is the sentinel for default cost set (backward compatible with all existing rows)"
  - "TournamentTeam is tournament-scoped and ephemeral; differs from Team which is persistent org-level"
  - "winnerAdvantage (u8) replaces grandFinalsAdvantage (bool) — allows 0, 1, 2, 3+ game head-start configurations"

patterns-established:
  - "Numeric role hierarchy: isRoleAtLeast(user.role, 'Moderator') replaces tag string comparisons"
  - "Stage transition validation: validateStageTransition() throws SenderError on invalid transitions"
  - "Tournament access control: ensureTournamentAccess() checks Moderator+, organizer, or assistant"

requirements-completed: [TRNT-01, TRNT-03, TRNT-08, TRNT-09, TRNT-10, TEAM-05]

# Metrics
duration: 30min
completed: 2026-03-17
---

# Phase 03 Plan 01: Schema Foundation Summary

**SpacetimeDB schema foundation for tournament system: Moderator role, RosterVisibility enum, 6 new tables (CostSet + draft tables + TournamentTeam/Request), Tournament/MatchResult column expansions, cost PK destructive change, module published with --clear-database**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-03-17T15:02:00Z
- **Completed:** 2026-03-17T15:33:09Z
- **Tasks:** 3
- **Files modified:** 26

## Accomplishments

- Role hierarchy upgraded: Moderator added at level 75, all permission checks now use isRoleAtLeast() instead of hard-coded tag comparisons; admin_update_user auto-accepts Moderator via dynamic Object.keys(Role.variants) (TRNT-01)
- 6 new tables created and registered in schema: CostSet (public), CostSetDraftCharacter/Lightcone/Synergy (private), TournamentTeam, TournamentTeamRequest
- Tournament table overhauled: rosterVisibility (3-way enum), winnerAdvantage, teamSize, costSetId, 5 registration requirement flags, scheduling timestamps
- HsrCharacterCost and HsrLightconeCost PKs expanded to include costSetId — enables per-tournament custom cost sets; module published with --clear-database

## Task Commits

Each task was committed atomically:

1. **Task 1: Enum additions, RosterVisibility, permission helpers, tournament helpers** - `c1ceafc` (feat)
2. **Task 2: Table schema changes -- new tables, tournament/cost PK expansion, MatchResultRecord additions** - `e013bd1` (feat)
3. **Task 3: Publish with --clear-database, re-seed game data, generate bindings** - `4fc6d7b` (feat)

## Files Created/Modified

**Created:**
- `spacetimedb/src/helpers/tournamentHelpers.ts` - validateStageTransition() and ensureTournamentAccess()
- `spacetimedb/src/tables/costSet.ts` - CostSet metadata table (public)
- `spacetimedb/src/tables/costSetDraftCharacter.ts` - Draft character costs (private)
- `spacetimedb/src/tables/costSetDraftLightcone.ts` - Draft lightcone costs (private)
- `spacetimedb/src/tables/costSetDraftSynergy.ts` - Draft synergy costs (private)
- `spacetimedb/src/tables/tournamentTeam.ts` - Tournament-scoped team (public)
- `spacetimedb/src/tables/tournamentTeamRequest.ts` - Team join requests (public)
- `src/module_bindings/cost_set_table.ts` - Generated client binding
- `src/module_bindings/tournament_team_table.ts` - Generated client binding
- `src/module_bindings/tournament_team_request_table.ts` - Generated client binding

**Modified:**
- `spacetimedb/src/types/enums.ts` - Added Moderator, Seeding, RosterVisibility; removed Paused
- `spacetimedb/src/helpers/ensurePermissions.ts` - ROLE_LEVEL map, getRoleLevel, isRoleAtLeast, ensureModerator
- `spacetimedb/src/tables/tournament.ts` - rosterVisibility, winnerAdvantage, teamSize, costSetId, registration fields
- `spacetimedb/src/tables/tournamentParticipant.ts` - teamGroupId, isWaitlisted, hsrAccountId
- `spacetimedb/src/tables/matchResult.ts` - team1/2Confirmed, referee, dispute, tournamentId, matchType
- `spacetimedb/src/tables/hsrCharacterCost.ts` - PK expanded to ['characterName', 'gameMode', 'costSetId']
- `spacetimedb/src/tables/hsrLightconeCost.ts` - PK expanded to ['lightconeName', 'gameMode', 'costSetId']
- `spacetimedb/src/tables/lobby.ts` - Added costSetId column
- `spacetimedb/src/schema.ts` - Imports and registers 6 new tables

## Decisions Made

- **Moderator at level 75**: Fits naturally between Admin (100) and TournamentHost (50) — can manage tournaments without full admin access
- **Paused stage removed**: Stage machine is now strictly forward-only; application-level logic handles temporary pauses without advancing the stage
- **CostSet draft tables private**: Editors can modify a draft cost set without clients seeing the in-progress state until `isPublished = true`
- **costSetId=0 sentinel preserved**: All existing cost data implicitly belongs to "default set 0" — no migration needed
- **winnerAdvantage as u8**: Allows 0 (no advantage), 1, 2, or 3 game head-starts in grand finals vs boolean limitation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all commands executed successfully on first attempt.

## User Setup Required

**Game data needs re-seeding.** The database was cleared (`--clear-database`) due to the destructive PK changes on HsrCharacterCost and HsrLightconeCost. Use the admin panel to re-import:
- HSR Characters via `admin_bulk_upsert` (tableName: "HsrCharacter")
- HSR Character Costs via `admin_bulk_upsert` (tableName: "HsrCharacterCost") — include `costSetId: 0` in each row
- HSR Lightcones via `admin_bulk_upsert` (tableName: "HsrLightcone")
- HSR Lightcone Costs via `admin_bulk_upsert` (tableName: "HsrLightconeCost") — include `costSetId: 0` in each row
- HSR Synergy Costs via `admin_bulk_upsert` (tableName: "HsrSynergyCost")

## Next Phase Readiness

- Schema foundation complete — all 03-02/03/04 plans can proceed with tournament CRUD, registration, and bracket reducers
- Permission infrastructure ready: `ensureTournamentHost`, `ensureModerator`, `ensureTournamentAccess` all available
- Stage validation ready: `validateStageTransition` enforces forward-only transitions
- Client bindings updated and available for frontend integration

---
*Phase: 03-tournament-system*
*Completed: 2026-03-17*
