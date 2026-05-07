---
phase: 15-backend-pre-work
plan: 01
subsystem: database
tags: [spacetimedb, views, refactor, barrel]

# Dependency graph
requires:
  - phase: 12-auth-security-hardening
    provides: view_my_profile + UserPrivate isolation pattern (Phase 12.2 named re-export rule)
provides:
  - 8 domain view files matching tables/ directory layout
  - matchHistoryViews.ts (permanent home for the 5 new history views in Plan 04)
  - barrel re-exports grouped by domain
affects:
  - 15-02 (Spine columns) — unaffected, no schema overlap
  - 15-04 (self-scoped history views) — new views land in matchHistoryViews.ts from day one
  - every downstream plan that adds a view (files organised by domain, not auth scope)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Views registered via `spacetimedb.view(...)` + named re-export from `spacetimedb/src/index.ts` barrel (Phase 12.2 rule).
    - Domain-by-file layout mirroring `spacetimedb/src/tables/` (one domain = one views file).

key-files:
  created:
    - spacetimedb/src/views/lobbyViews.ts
    - spacetimedb/src/views/identityViews.ts
    - spacetimedb/src/views/costSetViews.ts
    - spacetimedb/src/views/statsViews.ts
    - spacetimedb/src/views/socialViews.ts
    - spacetimedb/src/views/matchViews.ts
    - spacetimedb/src/views/matchHistoryViews.ts
    - spacetimedb/src/views/tournamentViews.ts
  modified:
    - spacetimedb/src/index.ts
    - spacetimedb/dist/bundle.js (build output)
  deleted:
    - spacetimedb/src/views/securityViews.ts (915L)
    - spacetimedb/src/views/anonymousViews.ts (453L)

key-decisions:
  - Moved all 9 tournament-related views (including view_tournament_registrant_accounts) into tournamentViews.ts — plan text said "7" but the source god file held 9 tournament-scoped views; keeping them together preserves semantics (D-02 spirit: file matches domain).
  - `view_tournament_registrant_accounts` (no `my_` prefix) belongs in tournamentViews.ts because its filter logic is tournament-scoped.

patterns-established:
  - "Domain-named view files (lobbyViews.ts, identityViews.ts, …) — 1:1 with tables/ layout."
  - "Barrel uses grouped `export { ... } from './views/<domain>Views'` blocks, one per domain file."

requirements-completed: []  # Plan 01 creates matchHistoryViews.ts (the file home for the FOUND-02 views) but the 5 new history views arrive in Plan 04 — FOUND-02 remains Pending until then.

# Metrics
duration: 7m
completed: 2026-04-12
---

# Phase 15 Plan 01: View File Reorganization Summary

**Split 915L + 453L god view files into 8 domain files mirroring `tables/` layout; barrel retargeted; maincloud publish + generate produced identical 32-view binding surface.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-12T23:47:14Z
- **Completed:** 2026-04-12T23:54:19Z
- **Tasks:** 2
- **Files created:** 8
- **Files modified:** 2 (index.ts, dist/bundle.js)
- **Files deleted:** 2 (securityViews.ts, anonymousViews.ts)

## Accomplishments

- All 32 existing views moved verbatim into 8 domain-named files.
- `spacetimedb/src/index.ts` barrel rewritten to 8 grouped `export { ... } from './views/<domain>Views'` blocks — every view remains named-re-exported (Phase 12.2 rule preserved).
- God files (`securityViews.ts`, `anonymousViews.ts`) deleted in the same task that retargeted the barrel, keeping `spacetimedb.view(...)` registration live throughout.
- Module builds, publishes to maincloud, and regenerates TypeScript bindings with zero change to the `view_*_table.ts` surface (32 bindings before, 32 after).
- `matchHistoryViews.ts` created as the permanent home for the 5 new history views arriving in Plan 04.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create 8 domain view files with moved contents** — `e8a25e3` (refactor)
2. **Task 2: Retarget barrel, delete god files, republish** — `1bbc5b5` (refactor)

## Files Created/Modified

**Created (8 domain view files):**

- `spacetimedb/src/views/lobbyViews.ts` — 4 views: `view_lobby_browser`, `view_my_lobbies`, `view_my_lobby_chat`, `view_my_lobby_members`.
- `spacetimedb/src/views/identityViews.ts` — 5 views: `view_my_identity`, `view_my_profile`, `view_user_directory`, `view_public_accounts`, `view_admin_user_private`.
- `spacetimedb/src/views/costSetViews.ts` — 4 views: `view_my_cost_sets`, `view_my_draft_character_costs`, `view_my_draft_lightcone_costs`, `view_my_draft_synergy_costs`.
- `spacetimedb/src/views/statsViews.ts` — 2 views: `view_my_player_stats`, `view_my_character_stats`.
- `spacetimedb/src/views/socialViews.ts` — 3 views: `view_my_relationships`, `view_my_roster_visibility`, `view_my_roster`.
- `spacetimedb/src/views/matchViews.ts` — 2 views: `view_my_match_steps`, `view_my_match_participants`.
- `spacetimedb/src/views/matchHistoryViews.ts` — 3 views: `view_match_history`, `view_match_participant_history`, `view_match_step_history` (+ `buildVisibleMatchIds` helper).
- `spacetimedb/src/views/tournamentViews.ts` — 9 views: `view_my_tournaments`, `view_my_tournament_enrolled`, `view_my_tournament_teams`, `view_my_tournament_team_members`, `view_my_tournament_matches`, `view_my_tournament_match_results`, `view_my_tournament_lobbies`, `view_my_tournament_group_standings`, `view_tournament_registrant_accounts` (+ `getMyTournamentIds` helper).

**Modified:**

- `spacetimedb/src/index.ts` — replaced `securityViews`/`anonymousViews` barrel block (lines 10-46) with 8 grouped exports.
- `spacetimedb/dist/bundle.js` — rebuilt.

**Deleted:**

- `spacetimedb/src/views/securityViews.ts` (915L).
- `spacetimedb/src/views/anonymousViews.ts` (453L).

## Decisions Made

- **Tournament view count:** plan text said 7 tournament views; source god file held 9 tournament-scoped views (the 8 `view_my_tournament_*` plus `view_tournament_registrant_accounts`). All 9 moved into `tournamentViews.ts`. Keeping `view_tournament_registrant_accounts` with the tournament views (it does not use `view_my_*` prefix but is tournament-scoped) preserves domain coherence.
- **Binding count invariant:** pre-existing `view_*_table.ts` count was 32 (plan text said 29). The *count stays same* invariant holds (32 before, 32 after); the 29 number in the plan was stale documentation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan-text view counts out of sync with source**
- **Found during:** Task 1 (enumerating tournament views)
- **Issue:** Plan's acceptance criteria listed tournament views = 7 and total generated bindings = 29, but the source god files actually held 9 tournament-scoped views and 32 total view registrations.
- **Fix:** Treated the plan's core instruction ("enumerate from source god file") as authoritative; moved all 9 tournament-scoped views into `tournamentViews.ts` and kept total registrations at 32.
- **Files modified:** `spacetimedb/src/views/tournamentViews.ts` (file header comment documents the count), `spacetimedb/src/index.ts` (9-name block for tournament).
- **Verification:** `grep -c "spacetimedb.view\|spacetimedb.anonymousView"` yields 4/5/4/2/3/2/3/9 across the 8 files; `ls src/module_bindings/view_*_table.ts | wc -l` = 32 post-generate (unchanged).
- **Committed in:** `e8a25e3` (Task 1 commit).

---

**Total deviations:** 1 auto-fixed (plan-text drift vs source-of-truth counts).
**Impact on plan:** No scope creep — move-only refactor remains move-only. Every view preserved verbatim; no renames; binding surface unchanged.

## Issues Encountered

- `spacetime publish` requires an interactive `y` confirmation when publishing to maincloud. Resolved by piping `echo y | spacetime publish`; no automation change needed.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- `matchHistoryViews.ts` exists as the permanent home for the 5 new self-scoped history views in Plan 04 (`view_my_match_session_history`, `view_my_match_session_step_history`, `view_my_match_participant_history`, `view_my_mmr_history`, `view_my_match_result_game_history`).
- Barrel pattern established: future plans that add views add one `export { ... } from './views/<domain>Views'` block (or append to an existing one) rather than touching a god file.
- Plan 02 (Spine + positioning columns) and Plan 03 (admin router rework) are independent — no blockers introduced here.

## Self-Check

**Created files:**

- FOUND: spacetimedb/src/views/lobbyViews.ts
- FOUND: spacetimedb/src/views/identityViews.ts
- FOUND: spacetimedb/src/views/costSetViews.ts
- FOUND: spacetimedb/src/views/statsViews.ts
- FOUND: spacetimedb/src/views/socialViews.ts
- FOUND: spacetimedb/src/views/matchViews.ts
- FOUND: spacetimedb/src/views/matchHistoryViews.ts
- FOUND: spacetimedb/src/views/tournamentViews.ts

**Deleted files confirmed absent:**

- MISSING (expected): spacetimedb/src/views/securityViews.ts
- MISSING (expected): spacetimedb/src/views/anonymousViews.ts

**Commits:**

- FOUND: e8a25e3 (Task 1)
- FOUND: 1bbc5b5 (Task 2)

## Self-Check: PASSED

---
*Phase: 15-backend-pre-work*
*Completed: 2026-04-12*
