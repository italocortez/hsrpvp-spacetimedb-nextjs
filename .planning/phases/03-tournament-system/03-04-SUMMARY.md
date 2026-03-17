---
phase: 03-tournament-system
plan: 04
subsystem: database
tags: [spacetimedb, reducers, match-results, referee, tournament-admin, typescript]

# Dependency graph
requires:
  - phase: 03-01
    provides: schema tables (MatchResultRecord, LobbyMember, TournamentParticipant, TournamentAssistant)
  - phase: 03-02
    provides: tournament management + registration + teams reducers, ensureTournamentAccess helper
  - phase: 03-03
    provides: cost set management reducers, module published to maincloud
provides:
  - 11 new reducers: 2 referee management, 3 match result submission, 6 tournament admin
  - Match result confirmation flow: team1Confirmed + team2Confirmed flags before referee submit
  - Dispute system: single-dispute-per-match enforcement via disputedByUserId lock
  - Referee transfer/reclaim within lobbies (auto-assignment deferred to Phase 9)
  - Tournament admin: DQ, match override, assistant CRUD, moderator role promotion/demotion
  - Module published to maincloud (hsrpvp-spacetimedb-nextjs-test1) — all Phase 3 reducers live
  - 34 reducer bindings generated in src/module_bindings/
  - match-results/README.md architecture docs
  - tournament/README.md updated with all 25 Phase 3 reducers
affects: [04-bracket-system, 05-mmr-calculation, 09-lobby-reducers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "submit_match_result requires both team confirmations (Pending + team1/2Confirmed) before referee can submit"
    - "One-dispute-per-match enforced via disputedByUserId field acting as a set-once lock"
    - "Referee authority check: lobby isReferee flag first, then Moderator+, then tournament TO/assistant"
    - "mod_promote_to_host and mod_demote_from_host scope-limited to User↔TournamentHost transitions"
    - "override_match_result reuses disputeReason field to store admin override reason"
    - "assign_tournament_assistant: organizer or Moderator+ only (existing assistants cannot assign others)"

key-files:
  created:
    - spacetimedb/src/reducers/refereeManagement.ts
    - spacetimedb/src/reducers/matchResultSubmission.ts
    - spacetimedb/src/reducers/tournamentAdmin.ts
    - spacetimedb/src/docs/match-results/README.md
  modified:
    - spacetimedb/src/index.ts
    - spacetimedb/src/docs/tournament/README.md
    - src/module_bindings/ (34 reducer binding files regenerated)
    - spacetimedb/dist/bundle.js

key-decisions:
  - "winnerId=0 sentinel for draw in submit_match_result and override_match_result — avoids optional param, matches costSetId=0 pattern"
  - "override_match_result reuses disputeReason column to store override reason — keeps schema minimal"
  - "submit_match_result does NOT trigger MMR or bracket advancement — Phase 3 only records Submitted status"
  - "reclaim_referee iterates lobby_id index to find current referee holder — no cross-table referee index exists"
  - "assign_tournament_assistant blocks self-assignment (you cannot assign yourself)"

patterns-established:
  - "Referee transfer pattern: delete+insert for both sender and target LobbyMember rows (composite PK)"
  - "Match result confirmation: id.update() on MatchResultRecord (autoInc PK)"
  - "Tournament admin DQ: delete+insert on TournamentParticipant (composite PK)"
  - "User role promotion/demotion: id.update() on User (autoInc PK)"
  - "Assistant upsert: check primaryKey.find first; delete+insert if exists, plain insert if new"

requirements-completed: [TRNT-07, TRNT-11, TRNT-12]

# Metrics
duration: 5min
completed: 2026-03-17
---

# Phase 03 Plan 04: Match Result Submission, Referee Management, and Tournament Admin Summary

**11 reducers for match result confirmation (dual-team confirmation + referee submit + dispute), referee flag transfer within lobbies, and tournament admin operations (DQ, result override, assistant CRUD, role promotion/demotion) — all Phase 3 reducers now live on maincloud**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-17T15:45:05Z
- **Completed:** 2026-03-17T15:50:22Z
- **Tasks:** 3
- **Files modified:** 42 (3 new reducer files, 1 new docs file, 34 regenerated bindings, 4 updated)

## Accomplishments

- 5 referee/match-result reducers: `transfer_referee`, `reclaim_referee`, `confirm_match_scores`, `submit_match_result`, `dispute_match_result` with full validation (dual-team confirmation required, single-dispute enforcement, referee authority hierarchy)
- 6 tournament admin reducers: `dq_participant`, `override_match_result`, `assign_tournament_assistant`, `remove_tournament_assistant`, `mod_promote_to_host`, `mod_demote_from_host` with proper permission scoping
- All 32 Phase 3 reducers published to maincloud and 34 binding files generated — `src/module_bindings/` is now current

## Task Commits

Each task was committed atomically:

1. **Task 1: Referee management and match result submission reducers** - `c6da439` (feat)
2. **Task 2: Tournament admin reducers** - `5731dc0` (feat)
3. **Task 3: Wire exports, publish module, generate bindings, update docs** - `8dc6534` (feat)

## Files Created/Modified

- `spacetimedb/src/reducers/refereeManagement.ts` - transfer_referee, reclaim_referee (composite PK delete+insert)
- `spacetimedb/src/reducers/matchResultSubmission.ts` - confirm_match_scores, submit_match_result, dispute_match_result (id.update())
- `spacetimedb/src/reducers/tournamentAdmin.ts` - 6 admin reducers with permission hierarchy and composite PK patterns
- `spacetimedb/src/index.ts` - 3 new export lines for all 11 reducers
- `spacetimedb/src/docs/match-results/README.md` - full architecture doc (new)
- `spacetimedb/src/docs/tournament/README.md` - updated with all 25 Phase 3 reducers
- `src/module_bindings/` - 34 reducer binding files regenerated from published module

## Decisions Made

- **winnerId=0 sentinel for draw:** `submit_match_result` and `override_match_result` accept `winnerId=0` to indicate a draw (maps to `undefined` stored value). Mirrors the `costSetId=0` pattern used across this project.
- **disputeReason reuse for override reason:** `override_match_result` stores the admin rationale in the existing `disputeReason` column. Keeps schema minimal while preserving audit trail.
- **Phase 3 submit is record-only:** `submit_match_result` only sets status to `Submitted`. MMR (Phase 5) and bracket advancement (Phase 4) are triggered by downstream processes, not from this reducer.
- **Referee authority hierarchy in submit:** checked in order: lobby `isReferee` flag → Moderator/Admin role → tournament organizer/assistant. First match wins.
- **assign_tournament_assistant blocks self-assignment:** added validation that caller cannot assign themselves (would be a no-op but could cause confusion).

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `spacetime publish` requires `-y` flag to skip the "are you sure?" prompt for maincloud publishing. Used `-y` flag as planned.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All Phase 3 reducers are live on maincloud. Phase 3 is complete.
- Phase 4 (bracket system) can now build on the `MatchResultRecord` table with `Submitted` status as the trigger for bracket advancement
- Phase 5 (MMR calculation) can build on `Submitted` status and `mmrProcessedAt` guard column
- Phase 9 (lobby creation reducers) should implement auto-assignment of `isReferee = true` to the lobby host on lobby creation

---
*Phase: 03-tournament-system*
*Completed: 2026-03-17*

## Self-Check: PASSED

- refereeManagement.ts: FOUND
- matchResultSubmission.ts: FOUND
- tournamentAdmin.ts: FOUND
- match-results/README.md: FOUND
- 03-04-SUMMARY.md: FOUND
- Commit c6da439: FOUND
- Commit 5731dc0: FOUND
- Commit 8dc6534: FOUND
