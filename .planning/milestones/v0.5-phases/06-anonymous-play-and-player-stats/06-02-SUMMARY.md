---
phase: 06-anonymous-play-and-player-stats
plan: 02
subsystem: database
tags: [spacetimedb, anonymous-play, ownership-validation, roster-visibility, views, helpers]

# Dependency graph
requires:
  - phase: 06-01
    provides: "Schema foundation: Lobby rosterVisibility/requireOwnership/isTournamentControlled, TournamentPlayerAccount table, LobbyCursorEvent.anonymousLabel, stat table PK expansions, private stat tables"
provides:
  - "computeAnonymousLabel helper for deterministic team-based labels"
  - "validateCharacterOwnership helper for pick eligibility checking"
  - "broadcast_cursor anonymous mode enforcement (userId=0 + label)"
  - "3 per-user stat visibility views (view_my_player_stats, view_my_character_stats, view_my_relationships)"
  - "Per-user roster visibility view (view_my_roster_visibility) enforcing D-10 through D-16"
  - "TournamentPlayerAccount wiring into registration and withdrawal"
affects: [06-03, phase-09, phase-10]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Anonymous label computation from team side + join order"
    - "Ownership validation with tournament account locking"
    - "Roster visibility enforcement via per-user views with referee override"
    - "Sentinel userId=0 for anonymous mode in event tables"
    - "RosterVisibilityRow custom struct for view return types"

key-files:
  created:
    - spacetimedb/src/helpers/anonymousLabels.ts
    - spacetimedb/src/helpers/ownershipValidation.ts
  modified:
    - spacetimedb/src/reducers/cursor.ts
    - spacetimedb/src/views/securityViews.ts
    - spacetimedb/src/reducers/tournamentRegistration.ts

key-decisions:
  - "Used t.object() for RosterVisibilityRow struct type instead of t.product() (which does not exist in SpacetimeDB SDK)"
  - "All HSR accounts locked at registration (not just active) per D-21 -- tournament validation checks any locked account"

patterns-established:
  - "Custom struct return types for views using t.object('Name', {...})"
  - "Roster visibility rules: referee sees all, own team always visible, opponents controlled by rosterVisibility enum"
  - "ClosedWithRating sentinel: empty characterName row with rating only"

requirements-completed: [ANON-01, ANON-02, ANON-03, ANON-04]

# Metrics
duration: 4min
completed: 2026-03-22
---

# Phase 06 Plan 02: Anonymous Play Enforcement Summary

**Anonymous label helper, ownership validation helper, 4 per-user views (stats + roster visibility), cursor anonymous enforcement, and TournamentPlayerAccount registration wiring**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-22T02:21:51Z
- **Completed:** 2026-03-22T02:26:12Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- computeAnonymousLabel computes deterministic labels from team side + join order (Blue-1, Red-2, Coach-Blue, Spectator-1)
- validateCharacterOwnership checks HsrAccountCharacter for non-tournament lobbies and TournamentPlayerAccount for tournament lobbies
- broadcast_cursor enforces anonymous mode at the write layer: userId=0 + anonymousLabel when lobby is anonymous, with separate checks for isAnonymousSpectators vs isAnonymousPlayers
- 3 per-user stat visibility views make private stat tables accessible to their owners
- Per-user roster visibility view enforces D-10 through D-16 rules with referee override, team-based visibility, and rosterVisibility enum control
- TournamentPlayerAccount rows locked at registration, cleaned up on withdrawal

## Task Commits

Each task was committed atomically:

1. **Task 1: Anonymous label helper, ownership validation helper, and cursor enforcement** - `5546801` (feat)
2. **Task 2: Stat visibility views and TournamentPlayerAccount wiring** - `9d86959` (feat)
3. **Task 3: Per-user roster visibility view (D-15, ANON-04)** - `0c9520f` (feat)

## Files Created/Modified
- `spacetimedb/src/helpers/anonymousLabels.ts` - Deterministic anonymous label computation from team side + join order
- `spacetimedb/src/helpers/ownershipValidation.ts` - Character ownership validation for pick eligibility (supports tournament locked accounts)
- `spacetimedb/src/reducers/cursor.ts` - Anonymous mode enforcement: userId=0 + label when lobby is anonymous
- `spacetimedb/src/views/securityViews.ts` - 4 new views: view_my_player_stats, view_my_character_stats, view_my_relationships, view_my_roster_visibility
- `spacetimedb/src/reducers/tournamentRegistration.ts` - TournamentPlayerAccount insert at registration, delete on withdrawal

## Decisions Made
- Used `t.object('RosterVisibilityRow', {...})` for custom struct return type -- `t.product()` does not exist in SpacetimeDB SDK
- All HSR accounts (not just active) locked at registration per D-21 -- tournament pick validation checks any locked account
- ClosedWithRating uses sentinel row (empty characterName, eidolonLevel=0) with accountRating to signal "rating only, no roster data"

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed t.product() to t.object() for RosterVisibilityRow**
- **Found during:** Task 3 (Per-user roster visibility view)
- **Issue:** Plan specified `t.product({...})` for the custom struct, but `t.product()` does not exist in SpacetimeDB SDK
- **Fix:** Changed to `t.object('RosterVisibilityRow', {...})` which is the correct API
- **Files modified:** spacetimedb/src/views/securityViews.ts
- **Verification:** TypeScript compiles cleanly
- **Committed in:** 0c9520f (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Necessary correction for a non-existent API call. No scope creep.

## Issues Encountered
None

## Known Stubs
None -- all helpers, views, and wiring are fully functional. The ownership validation helper is intentionally not yet wired into pick/ban reducers (Phase 9 scope per D-20).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Anonymous label and ownership helpers ready for Phase 9 pick/ban reducer wiring
- Stat visibility views ready for client subscription
- Roster visibility view ready for client integration
- Plan 03 (finalization pipeline, stats increment, history archival) can proceed

## Self-Check: PASSED

All 5 files verified present. All 3 commit hashes verified in git log.

---
*Phase: 06-anonymous-play-and-player-stats*
*Completed: 2026-03-22*
