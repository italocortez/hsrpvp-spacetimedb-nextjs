---
phase: 04-bracket-generation-and-advancement
plan: 03
subsystem: database
tags: [spacetimedb, typescript, tournament, bracket, advancement, group-standings]

# Dependency graph
requires:
  - phase: 04-bracket-generation-and-advancement
    provides: Plan 02 bracket generation reducers (generate_bracket, seed_bracket, swap_seeds) and schema foundation
  - phase: 03-tournament-system
    provides: MatchResultRecord, TournamentParticipant, dq_participant, ensureTournamentAccess helper

provides:
  - advance_bracket_match reducer: places winner in next match slot, routes loser via nextLoserMatchId
  - submit_and_advance_bracket reducer: userId->teamId mapping + auto-advance wrapper
  - rollback_bracket_match reducer: reverses advancement, blocks if mmrProcessedAt set
  - dq_participant updated: auto-advances opponent when autoAdvanceBracket=true
  - Group standings Win=2/Draw=1/Loss=0 point system with reversal
  - Updated docs/brackets/architecture.md with complete BracketSide enum, all flows, all reducers
  - Updated docs/tournament/architecture.md with Phase 4 bracket generation section and full reducer table

affects:
  - 04-bracket-generation-and-advancement
  - 05-mmr-and-ranking (mmrProcessedAt check gates rollback; rollback not possible after MMR processed)
  - phase-9-lobby (lobbyId linkage on BracketMatch deferred)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "delete+insert for composite PK updates on GroupStanding (same as TournamentParticipant pattern)"
    - "userId->teamId mapping: MatchResultRecord.winnerId -> TournamentParticipant composite PK -> teamGroupId"
    - "BracketMatch.id.find() + BracketMatch.id.update() for single-PK advancement"
    - "tournament_id.filter() for bracket match scan in dq_participant"

key-files:
  created:
    - spacetimedb/src/reducers/bracketAdvancement.ts
  modified:
    - spacetimedb/src/index.ts
    - spacetimedb/src/reducers/tournamentAdmin.ts
    - spacetimedb/src/reducers/auth.ts
    - spacetimedb/src/reducers/server.ts
    - docs/brackets/architecture.md
    - docs/tournament/architecture.md

key-decisions:
  - "submit_and_advance_bracket re-reads bracketMatch after update to get fresh state for downstream auto-advance logic"
  - "rollback reads MatchResultRecord via tournament_id.filter + bracketMatchId match (no direct index on bracketMatchId)"
  - "dq_participant auto-advance inline (not calling advance_bracket_match reducer) to keep it one transaction"
  - "Group standings use Math.max(0, ...) guard on reversal to prevent negative counters"

patterns-established:
  - "Advancement helpers (placeParticipantInNextMatch, removeParticipantFromMatch) are private functions, not reducers"
  - "Group standing updates use delete+insert (composite PK); point constants WIN_POINTS=2, DRAW_POINTS=1 defined at file level"

requirements-completed:
  - BRKT-04
  - BRKT-06

# Metrics
duration: 5min
completed: 2026-03-18
---

# Phase 04 Plan 03: Bracket Advancement and DQ Auto-Advance Summary

**Bracket lifecycle complete: advance_bracket_match / submit_and_advance_bracket / rollback_bracket_match reducers + dq_participant auto-advance + group standings Win=2/Draw=1/Loss=0, published to maincloud**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-18T14:25:14Z
- **Completed:** 2026-03-18T14:30:08Z
- **Tasks:** 2
- **Files modified:** 7 (+ 3 new binding files generated)

## Accomplishments
- Created `bracketAdvancement.ts` with 3 reducers: advance_bracket_match (winner/loser routing), submit_and_advance_bracket (userId->teamId wrapper with auto-advance), rollback_bracket_match (one-step reversal blocked if MMR processed)
- Updated dq_participant in tournamentAdmin.ts to scan BracketMatch.tournament_id and auto-advance opponent when autoAdvanceBracket=true and tournament is InProgress
- Group standings updated with Win=2, Draw=1, Loss=0 point system including full reversal logic for rollback
- Updated docs/brackets/architecture.md with complete rewrite: BracketSide enum table, all reducer descriptions, 5 flow diagrams, BYE handling, DQ auto-advance, seeding algorithm summaries
- Updated docs/tournament/architecture.md: added Phase 4 bracket generation section and all 8 Phase 4 reducers to the reducer reference table
- Module published to maincloud (destructive -- clear-database due to prior schema changes)
- Client bindings generated: advance_bracket_match_reducer.ts, submit_and_advance_bracket_reducer.ts, rollback_bracket_match_reducer.ts

## Task Commits

Each task was committed atomically:

1. **Task 1: Create bracket advancement, submit-and-advance, and rollback reducers** - `97e79f7` (feat)
2. **Task 2: Update dq_participant with auto-advance and update architecture docs** - `d10bee8` (feat)
3. **[Rule 1 - Bug] Fix missing displayedAchievementId in User inserts** - `ec36a2a` (fix)

**Plan metadata:** (docs commit below)

## Files Created/Modified
- `spacetimedb/src/reducers/bracketAdvancement.ts` - New: advance_bracket_match, submit_and_advance_bracket, rollback_bracket_match reducers + 4 internal helpers
- `spacetimedb/src/index.ts` - Added exports for the 3 new advancement reducers
- `spacetimedb/src/reducers/tournamentAdmin.ts` - dq_participant updated with auto-advance block (tournament.autoAdvanceBracket check)
- `spacetimedb/src/reducers/auth.ts` - Bug fix: added displayedAchievementId: undefined to User insert
- `spacetimedb/src/reducers/server.ts` - Bug fix: added displayedAchievementId: undefined to User insert
- `docs/brackets/architecture.md` - Full rewrite with BracketSide enum, all reducers, all flows
- `docs/tournament/architecture.md` - Phase 4 bracket generation section + reducer reference table updated

## Decisions Made
- submit_and_advance_bracket re-reads bracketMatch after the winnerId update to ensure downstream auto-advance logic uses fresh state (avoids stale spread)
- rollback_bracket_match scans MatchResultRecord via tournament_id.filter + manual bracketMatchId match (no direct index on bracketMatchId on MatchResultRecord)
- dq_participant auto-advance is inline code rather than calling advance_bracket_match reducer — keeps it one atomic transaction
- Group standings reversal uses Math.max(0, ...) guards to prevent negative counters on edge cases

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed missing displayedAchievementId field blocking module publish**
- **Found during:** Output step (spacetime publish)
- **Issue:** auth.ts and server.ts had User insert calls missing `displayedAchievementId: undefined`. The field was added to the User table in a prior phase but these inserts were not updated. TypeScript was strict enough to catch it at publish time even though `--noEmit` check showed same errors.
- **Fix:** Added `displayedAchievementId: undefined` to the User.insert() calls in auth.ts line 46 and server.ts line 57
- **Files modified:** spacetimedb/src/reducers/auth.ts, spacetimedb/src/reducers/server.ts
- **Verification:** `npx tsc --noEmit` exits clean, `spacetime publish` succeeded
- **Committed in:** `ec36a2a`

---

**Total deviations:** 1 auto-fixed (1 pre-existing bug blocking publish)
**Impact on plan:** Auto-fix necessary to unblock module publish. No scope creep.

## Issues Encountered
- Module publish used database name `hsrpvp-spacetimedb-nextjs-test1` (from spacetime.json) not `hsrpvp` as in the plan's output section — resolved by reading config files

## Next Phase Readiness
- Bracket lifecycle complete: generate (02) + advance/rollback (03) are both live on maincloud
- Phase 04 all 3 plans complete: schema (01), generation (02), advancement (03)
- Ready for Phase 05 (MMR and Ranking) — mmrProcessedAt rollback guard already in place
- Client bindings for all bracket reducers available in src/module_bindings/

---
*Phase: 04-bracket-generation-and-advancement*
*Completed: 2026-03-18*

## Self-Check: PASSED

- FOUND: spacetimedb/src/reducers/bracketAdvancement.ts
- FOUND: docs/brackets/architecture.md
- FOUND: docs/tournament/architecture.md
- FOUND: commit 97e79f7 (Task 1)
- FOUND: commit d10bee8 (Task 2)
- FOUND: commit ec36a2a (Rule 1 bug fix)
