---
phase: 15-backend-pre-work
plan: 04
subsystem: views
tags: [spacetimedb, views, history, isolation, foundation]

# Dependency graph
requires:
  - phase: 15-backend-pre-work
    plan: 01
    provides: matchHistoryViews.ts (permanent home for self-scoped history views)
provides:
  - 5 self-scoped history views (1:1 with *_history tables) filtered server-side by ctx.sender
  - Regenerated TypeScript bindings exposing the 5 new views (32 -> 37)
  - Canonical view names in ROADMAP.md + REQUIREMENTS.md FOUND-02 (4 abbreviated -> 5 canonical)
affects:
  - 15-05 (seed pipeline) — unaffected; independent code path
  - 15-06 (integration tests) — cross-user isolation tests target these 5 views
  - Phase 24+ / 40 / 41 (profile + historical + replay) — subscription targets now canonical
  - FOUND-02 — schema half delivered; isolation proof deferred to Plan 06

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Pattern A: direct user-index filter for tables with userId column (MmrHistory.user_id, MatchParticipantHistory.by_user)."
    - "Pattern B: participant-first iteration — seed with MatchParticipantHistory.by_user, fan out via per-table by_match_history index or PK lookup (MatchSessionHistory / MatchSessionStepHistory / MatchResultGameHistory)."
    - "ctx.sender -> UserIdentity.identity.find(...) -> mapping.userId at the top of every view body; unmapped returns []."

key-files:
  created: []
  modified:
    - spacetimedb/src/views/matchHistoryViews.ts
    - spacetimedb/src/index.ts
    - spacetimedb/dist/bundle.js
    - src/module_bindings/index.ts
    - src/module_bindings/types.ts
    - .planning/ROADMAP.md
    - .planning/REQUIREMENTS.md
  generated:
    - src/module_bindings/view_my_match_session_history_table.ts
    - src/module_bindings/view_my_match_session_step_history_table.ts
    - src/module_bindings/view_my_match_participant_history_table.ts
    - src/module_bindings/view_my_mmr_history_table.ts
    - src/module_bindings/view_my_match_result_game_history_table.ts

key-decisions:
  - "Binding count pre-Plan-04 was 32 (per 15-01-SUMMARY's correction of the historical 29 number); post-Plan-04 is 37, not the 34 the plan text projected. Invariant preserved: count grew by exactly +5."
  - "All 5 views use `public: true` — SpacetimeDB public view semantics with server-side ctx.sender gate, matching all 32 existing view_my_* entries."
  - "Participant-first iteration chosen over schema denormalisation (explicit D-18 decision). O(user's matches) not O(all matches) — acceptable at 100-user / 156-match scale."
  - "Naming collision preserved: view_my_match_participant_history (new, this task) and view_match_participant_history (existing, visibility-filtered) both live in matchHistoryViews.ts. The `my_` prefix distinguishes strict self-scope from scouting-safe visibility."

requirements-completed:
  - FOUND-02

# Metrics
duration: 4m
completed: 2026-04-13
---

# Phase 15 Plan 04: Self-Scoped History Views Summary

**Added 5 self-scoped history views (one per `*_history` table) to `matchHistoryViews.ts`; every view resolves `ctx.sender` server-side via `UserIdentity.identity.find` before any row read; bindings regenerated (32 -> 37) and both ROADMAP.md + REQUIREMENTS.md switched from the 4 abbreviated names to the 5 canonical ones (D-14).**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-13T00:10:00Z
- **Completed:** 2026-04-13T00:14:00Z
- **Tasks:** 2
- **Files modified:** 7
- **Files generated:** 5 new binding files

## Accomplishments

- 5 new views authored directly in `matchHistoryViews.ts` — their permanent home (Plan 01 created the file):
  - `view_my_mmr_history` — Pattern A, `MmrHistory.user_id.filter`.
  - `view_my_match_participant_history` — Pattern A, `MatchParticipantHistory.by_user.filter`.
  - `view_my_match_session_history` — Pattern B, participant-first iteration + `MatchSessionHistory.id.find` per match.
  - `view_my_match_session_step_history` — Pattern B, participant-first iteration + `MatchSessionStepHistory.by_match_history.filter`.
  - `view_my_match_result_game_history` — Pattern B, participant-first iteration + `MatchResultGameHistory.by_match_history.filter`.
- All 5 views registered in `spacetimedb/src/index.ts` matchHistoryViews barrel (Phase 12.2 named re-export rule).
- Build clean: `cd spacetimedb && npm run build` exits 0.
- Publish clean: `spacetime publish` reports "Updated database" with no `[registerExport]` warnings. Publish log confirms `Created view: view_my_mmr_history` (and equivalents for the other 4).
- Bindings regenerated + prettier-formatted: 5 new `view_*_table.ts` files under `src/module_bindings/`; total view bindings grew from 32 to 37.
- ROADMAP.md and REQUIREMENTS.md now use the 5 canonical names in every location — grep for the abbreviated names `view_my_match_history($|[^_])`, `view_my_session_history`, `view_my_participant_history` returns zero matches.
- 3 existing views in `matchHistoryViews.ts` (`view_match_history`, `view_match_participant_history`, `view_match_step_history`) untouched — D-03 move-only invariant from Plan 01 preserved.

## Task Commits

1. **Task 1: Add 5 new history views to matchHistoryViews.ts** — `cde4296` (feat)
2. **Task 2: Register in barrel + canonicalise ROADMAP/REQUIREMENTS + regenerate bindings** — `d5d0f5d` (feat)

## Files Created/Modified

**Modified:**

- `spacetimedb/src/views/matchHistoryViews.ts` — header comment updated to list 8 views; new imports (`MatchResultGameHistory`, `MmrHistory`); 5 new `export const view_my_* = spacetimedb.view(...)` blocks appended after `buildVisibleMatchIds`.
- `spacetimedb/src/index.ts` — matchHistoryViews barrel block now re-exports 8 views (3 existing + 5 new).
- `spacetimedb/dist/bundle.js` — rebuilt (Task 1 + Task 2 each rebuilt).
- `src/module_bindings/index.ts` — regenerated to include the 5 new table exports.
- `src/module_bindings/types.ts` — regenerated.
- `.planning/ROADMAP.md` — 4 locations updated (line 70 Phase-40 bullet; line 133 success criterion 2; lines 134-135 criteria 3-4 with "four" -> "five" + 5 canonical names listed; line 440 Phase-40 criterion 1; line 442 Phase-40 criterion 3).
- `.planning/REQUIREMENTS.md` — line 19 FOUND-02: 4 abbreviated names replaced with the 5 canonical names.

**Generated (new binding files):**

- `src/module_bindings/view_my_match_session_history_table.ts`
- `src/module_bindings/view_my_match_session_step_history_table.ts`
- `src/module_bindings/view_my_match_participant_history_table.ts`
- `src/module_bindings/view_my_mmr_history_table.ts`
- `src/module_bindings/view_my_match_result_game_history_table.ts`

## Decisions Made

- **Binding count invariant:** plan text projected post-count = 34 (assuming 29 pre); actual pre-count was 32 (per Plan 01's recorded correction), so actual post-count is 37. Acceptance intent ("all 5 new bindings present, count grew by exactly +5") satisfied.
- **Naming collision left in place intentionally:** the file now holds two views with near-identical names — `view_match_participant_history` (existing, visibility-filtered) and `view_my_match_participant_history` (new, self-scoped). Both are correct per D-13 and the file-level comment was updated to call out the distinction.
- **Did not modify architecture/contract docs:** per CLAUDE.md guidance, contract docs are updated after execution. Plan 06 owns the architecture.md + contract.md updates for the history-view subsystem.
- **No integration tests added:** FOUND-02 success criterion #4 (cross-user isolation tests) is explicitly owned by Plan 06 per that plan's scope. This plan delivered the schema half of FOUND-02.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Plan's projected binding count was stale**

- **Found during:** Task 2 verification (acceptance criterion `ls view_*_table.ts | wc -l` == 34).
- **Issue:** Plan said pre-count = 29 and post-count = 34, but actual pre-count was 32 (documented in 15-01-SUMMARY as an earlier doc-drift correction). Actual post-count = 37.
- **Fix:** Verified the invariant that actually matters — all 5 new binding files exist and total grew by exactly +5. No code change needed.
- **Files modified:** None (documentation-drift note).
- **Committed in:** N/A.

**2. [Rule 2 - Missing functionality] ROADMAP had old abbreviated names in 3 additional places beyond the plan's enumerated spots**

- **Found during:** Task 2 grep sweep for stale names.
- **Issue:** Plan called out line 70, 133-134, FOUND-02. An additional 3 locations used the abbreviated names: Phase 40 plans line (line 70 bullet — already noted), Phase 40 success criterion 1 (line 440), Phase 40 success criterion 3 (line 442). Plan text said "also update any other place in ROADMAP.md that lists the 4 old abbreviated names" — so this was anticipated.
- **Fix:** Updated all 3 Phase-40 references: criterion 1 `view_my_match_history` -> `view_my_match_session_history`; criterion 3 `view_my_participant_history` + `view_my_session_history` -> `view_my_match_participant_history` + `view_my_match_session_step_history`; Phase-40 bullet line 70 same replacement.
- **Files modified:** `.planning/ROADMAP.md`.
- **Committed in:** `d5d0f5d`.

Line 348 in ROADMAP (Phase 32 success criterion 3) references `view_my_mmr_history` — this is already the canonical name, left unchanged.

---

**Total deviations:** 2 (one doc-drift note, one scope-expected "other places" cleanup). No functional deviation from plan intent.

## Authentication Gates

None during execution. `spacetime publish` to maincloud required one `y` confirmation for non-local-server; handled via `printf "y\n"` pipe.

## Issues Encountered

None. Build, publish, generate, and all acceptance-criterion greps passed on first attempt.

## User Setup Required

None — views are live on maincloud; bindings committed.

## Next Phase Readiness

- **Plan 05 (seed + template rework)** — unaffected; no overlap with view code.
- **Plan 06 (integration tests + architecture docs)** — now has all 5 views available for cross-user isolation testing. Architecture doc must mirror the D-13 canonical names and document Pattern A vs Pattern B (RESEARCH.md §Architecture Patterns).
- **Downstream feature phases (24+, 40, 41):** subscription targets are now stable and canonical. Any frontend plan that wrote against the old abbreviated names will need to update to the canonical names before execution.

## Self-Check

**Modified files present:**

- FOUND: spacetimedb/src/views/matchHistoryViews.ts (contains 5 new `name: 'view_my_*'` strings)
- FOUND: spacetimedb/src/index.ts (matchHistoryViews export block contains 8 names)
- FOUND: .planning/ROADMAP.md (5 canonical names present; 4 abbreviated names absent)
- FOUND: .planning/REQUIREMENTS.md (FOUND-02 lists 5 canonical names)

**Generated binding files present:**

- FOUND: src/module_bindings/view_my_match_session_history_table.ts
- FOUND: src/module_bindings/view_my_match_session_step_history_table.ts
- FOUND: src/module_bindings/view_my_match_participant_history_table.ts
- FOUND: src/module_bindings/view_my_mmr_history_table.ts
- FOUND: src/module_bindings/view_my_match_result_game_history_table.ts

**Acceptance criteria verification:**

- PASS: `grep -c "name: 'view_my_...'"` on matchHistoryViews.ts -> 5.
- PASS: `cd spacetimedb && npm run build` -> exit 0 ("Build finished successfully.").
- PASS: `grep -c` new names on src/index.ts -> 5.
- PASS: `grep -cE` old abbreviated names on ROADMAP.md + REQUIREMENTS.md -> no matches.
- PASS: `grep -c "view_my_match_session_history"` REQUIREMENTS.md -> 1.
- PASS: `ls src/module_bindings/view_*_table.ts | wc -l` -> 37 (32 pre + 5 new).
- PASS: All 5 new binding files exist (`ls` enumeration confirmed).
- PASS: `spacetime publish` output contains `Created view: view_my_mmr_history` (and 4 more); no `[registerExport]` warnings.

**Commits:**

- FOUND: cde4296 (Task 1)
- FOUND: d5d0f5d (Task 2)

## Self-Check: PASSED

---
*Phase: 15-backend-pre-work*
*Completed: 2026-04-13*
