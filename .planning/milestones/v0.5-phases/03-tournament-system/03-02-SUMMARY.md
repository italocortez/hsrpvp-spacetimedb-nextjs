---
phase: 03-tournament-system
plan: 02
subsystem: database
tags: [spacetimedb, reducers, tournament, registration, teams]

# Dependency graph
requires:
  - phase: 03-tournament-system/03-01
    provides: Tournament/TournamentParticipant/TournamentTeam/TournamentTeamRequest tables, enums (TournamentStage/Format/ParticipantStatus/ParticipantType), ensureTournamentHost/ensureTournamentAccess/validateStageTransition helpers
provides:
  - 4 tournament management reducers: create_tournament (Draft stage, TournamentHost+), update_tournament (Draft/Registration), advance_tournament_stage (forward-only), cancel_tournament
  - 4 registration reducers: register_for_tournament (full validation incl. waitlist/approval), withdraw_from_tournament, approve_participant, waitlist_promote
  - 6 tournament team reducers: create_tournament_team, request_join_team, accept_team_request, reject_team_request, leave_tournament_team, disband_tournament_team
  - Tournament architecture docs at docs/tournament/architecture.md
affects: [03-03-tournament-bracket, 03-04-frontend]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Composite PK delete+insert: TournamentParticipant and TournamentTeamRequest updated via delete+re-insert since SpacetimeDB has no composite PK update method"
    - "MMR check deferred sentinel: register_for_tournament skips minimumMmr enforcement with explicit comment (Phase 5)"
    - "Waitlist logic: isWaitlisted flag used to separate active vs. waitlisted participants; count check is active-only"
    - "teamGroupId=0 sentinel: u32 field uses 0 as 'no team' since optional u32 not used in reducer params"

key-files:
  created:
    - spacetimedb/src/reducers/tournamentManagement.ts
    - spacetimedb/src/reducers/tournamentRegistration.ts
    - spacetimedb/src/reducers/tournamentTeams.ts
    - docs/tournament/architecture.md
  modified:
    - spacetimedb/src/index.ts

key-decisions:
  - "teamGroupId uses 0 as sentinel in reducer args (u32, not optional) — consistent with costSetId=0 pattern already established"
  - "minimumMmr check intentionally deferred to Phase 5 — MMR tables exist but rating calculation not yet implemented; all players pass for now"
  - "update_tournament allows all fields in both Draft and Registration stages — CONTEXT.md only restricts 'no format changes after seeding', simplicity wins"
  - "disband_tournament_team only deletes pending requests, not accepted/rejected ones — closed requests already mutated participant rows"

patterns-established:
  - "Composite PK upsert: delete row first, then insert with spread + auditUpdate(ctx, existing, userId)"
  - "Tournament access guard: ensureTournamentAccess(ctx, tournamentId) returns { user, tournament } for convenience"
  - "Enum tag construction: { tag: tagString, value: {} } as any for all enum column values"

requirements-completed: [TRNT-02, TRNT-04, TRNT-05, TRNT-06, TEAM-01, TEAM-02, TEAM-03, TEAM-04]

# Metrics
duration: 5min
completed: 2026-03-17
---

# Phase 03 Plan 02: Tournament Management Summary

**14 tournament reducers across 3 files: CRUD + lifecycle (4), participant registration with waitlist/approval (4), and tournament-scoped team formation with captain/join/accept/disband (6) — module published to maincloud**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-17T15:36:51Z
- **Completed:** 2026-03-17T15:41:00Z
- **Tasks:** 3
- **Files modified:** 5 (3 created, 1 modified, 1 docs created)

## Accomplishments

- Tournament lifecycle management: TOs can create tournaments in Draft, update settings, advance through stages (Draft→Registration→Seeding→InProgress→Completed) with forward-only enforcement, and cancel from any non-terminal state
- Registration system: Players can register (with full validation: verified user, active roster, team slot, capacity + waitlist, approval gate), withdraw, and TOs can approve/promote from waitlist
- Tournament-scoped team formation: Players create teams, request to join, captains accept/reject/disband — all with proper state resets via composite PK delete+insert pattern

## Task Commits

Each task was committed atomically:

1. **Task 1: Tournament management reducers (CRUD + lifecycle)** - `d39de6a` (feat)
2. **Task 2: Registration and tournament team reducers** - `dbc6c4c` (feat)
3. **Task 3: Wire exports in index.ts and create tournament docs** - `2dc0287` (feat)

## Files Created/Modified

**Created:**
- `spacetimedb/src/reducers/tournamentManagement.ts` - create_tournament, update_tournament, advance_tournament_stage, cancel_tournament
- `spacetimedb/src/reducers/tournamentRegistration.ts` - register_for_tournament, withdraw_from_tournament, approve_participant, waitlist_promote
- `spacetimedb/src/reducers/tournamentTeams.ts` - create_tournament_team, request_join_team, accept_team_request, reject_team_request, leave_tournament_team, disband_tournament_team
- `docs/tournament/architecture.md` - Full architecture docs with relationship diagram, lifecycle stages, reducer reference table

**Modified:**
- `spacetimedb/src/index.ts` - Added 3 export lines for all 14 new tournament reducers

## Decisions Made

- **teamGroupId=0 as sentinel**: Reducer args use u32 (not optional), 0 means "no team" — mirrors the established costSetId=0 pattern
- **minimumMmr deferred**: MMR tables exist but rating calculation is Phase 5; register_for_tournament skips this check with an explicit TODO comment
- **update_tournament allows all fields in both stages**: Plan noted CONTEXT.md says "can still edit description/rules" in Registration but doesn't block other fields — kept simple, allowing all field updates
- **disband only purges pending requests**: Accepted/rejected requests already closed out their participant row mutations; deleting them would remove audit history without benefit

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all commands executed successfully on first attempt. Module compiled and published without errors.

## User Setup Required

None - no external service configuration required. Module published to maincloud, no database clear needed (only reducers added, no schema changes).

## Next Phase Readiness

- All 14 tournament management reducers implemented and published
- Plan 03 (bracket/seeding reducers) can proceed immediately
- Plan 04 (frontend) can wire up tournament CRUD UI using these reducers
- MMR validation gap (minimumMmr enforcement) documented and deferred to Phase 5

---
*Phase: 03-tournament-system*
*Completed: 2026-03-17*

## Self-Check: PASSED

All files exist and all commits verified:
- spacetimedb/src/reducers/tournamentManagement.ts: FOUND
- spacetimedb/src/reducers/tournamentRegistration.ts: FOUND
- spacetimedb/src/reducers/tournamentTeams.ts: FOUND
- docs/tournament/architecture.md: FOUND
- .planning/phases/03-tournament-system/03-02-SUMMARY.md: FOUND
- Commit d39de6a: FOUND
- Commit dbc6c4c: FOUND
- Commit 2dc0287: FOUND
