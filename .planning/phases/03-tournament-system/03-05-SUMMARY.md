---
phase: 03-tournament-system
plan: 05
subsystem: backend
tags: [gap-closure, docs, requirements, coach-role, lobby]
dependency_graph:
  requires: [03-04]
  provides: [TEAM-05-functional, TEAM-01-02-03-scoped-out]
  affects: [.planning/REQUIREMENTS.md, .planning/ROADMAP.md, spacetimedb/src/reducers/refereeManagement.ts]
tech_stack:
  added: []
  patterns: [delete-insert-composite-pk, audit-update, no-op-guard, role-permission-check]
key_files:
  created:
    - src/module_bindings/set_coach_reducer.ts
    - src/module_bindings/remove_coach_reducer.ts
  modified:
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
    - .planning/phases/03-tournament-system/03-02-PLAN.md
    - spacetimedb/src/reducers/refereeManagement.ts
    - spacetimedb/src/index.ts
    - spacetimedb/src/docs/tournament/README.md
    - .claude/skills/spacetimedb/references/module-bindings.md
decisions:
  - "TEAM-01/02/03 (persistent teams) reclassified as Out of Scope for v0.5 — tournament-scoped teams (TEAM-04) cover all Phase 3 needs"
  - "set_coach and remove_coach placed in refereeManagement.ts alongside isReferee flag management — both are per-lobby role flags with identical permission model"
  - "Coach pick/ban guard enforcement deferred to Phase 9 — reducers set the flag only, enforcement is a separate concern"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-03-17"
  tasks_completed: 2
  files_changed: 9
---

# Phase 03 Plan 05: Gap Closure — TEAM reclassification and coach reducers Summary

**One-liner:** Reclassified TEAM-01/02/03 as Out of Scope across planning docs and implemented set_coach/remove_coach reducers using the delete+insert pattern with host-or-referee permission.

## What Was Built

This gap closure plan addressed two verification gaps from 03-VERIFICATION.md:

1. **Documentation correction:** TEAM-01 (create persistent team), TEAM-02 (invite to team), and TEAM-03 (accept/decline invitations) were incorrectly marked as Complete in planning docs. Persistent teams are a v1+ feature; tournament-scoped ephemeral teams (TEAM-04) cover Phase 3 needs. All three were reclassified as Out of Scope (v0.5) across REQUIREMENTS.md, ROADMAP.md, and the 03-02-PLAN.md frontmatter.

2. **Coach reducer implementation:** TEAM-05 requires the coach role to be settable. The `isCoach` field existed on `LobbyMember` since Phase 1 schema but had no reducers to set it. `set_coach` and `remove_coach` were added to `refereeManagement.ts`, following the same delete+insert pattern as `transfer_referee` and `reclaim_referee`. Permission check: caller must be the lobby host OR the current referee. No-op guards prevent redundant writes.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Reclassify TEAM-01/02/03 as Out of Scope | 3c44e77 | REQUIREMENTS.md, ROADMAP.md, 03-02-PLAN.md |
| 2 | Implement set_coach and remove_coach reducers | b0597ef | refereeManagement.ts, index.ts, bindings, docs |

## Decisions Made

- **TEAM-01/02/03 reclassified Out of Scope:** These requirements describe persistent org-level teams (recruit, invite, accept). The tournament system uses ephemeral per-tournament teams (TEAM-04). Persistent teams are a v1+ concept and were never implemented in Phase 3 despite being marked Complete. Corrected to reflect actual state.

- **Coach reducers in refereeManagement.ts:** Both `isReferee` and `isCoach` are per-lobby role flags managed by the host or referee. Grouping them in the same file avoids scattering per-lobby role management across multiple files.

- **Pick/ban guard deferred to Phase 9:** The `isCoach` flag is settable but the enforcement rule ("coach cannot pick") lives in pick/ban reducers, which are Phase 9 scope. This follows the same pattern as referee auto-assignment (deferred to Phase 9).

## Verification Results

All checks passed:
1. `grep -c "Out of Scope" .planning/REQUIREMENTS.md` — 8 matches (TEAM-01/02/03 annotations + traceability table + out-of-scope table + footer)
2. `grep "TEAM-01" .planning/ROADMAP.md` — only appears in the out-of-scope note line, not in the active requirements list
3. `grep "requirements:" .planning/phases/03-tournament-system/03-02-PLAN.md` — `[TRNT-02, TRNT-04, TRNT-05, TRNT-06, TEAM-04]` (no TEAM-01/02/03)
4. `grep "set_coach\|remove_coach" refereeManagement.ts` — 2 matches (both exports)
5. `grep "set_coach\|remove_coach" index.ts` — export line present
6. `ls src/module_bindings/set_coach_reducer.ts` — exists
7. `ls src/module_bindings/remove_coach_reducer.ts` — exists
8. Module published to maincloud without errors

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files verified:
- FOUND: `.planning/REQUIREMENTS.md` — Out of Scope annotations present
- FOUND: `spacetimedb/src/reducers/refereeManagement.ts` — set_coach and remove_coach exported
- FOUND: `spacetimedb/src/index.ts` — export line updated
- FOUND: `src/module_bindings/set_coach_reducer.ts`
- FOUND: `src/module_bindings/remove_coach_reducer.ts`
- FOUND: commit `3c44e77` — docs(03-05): reclassify TEAM-01/02/03
- FOUND: commit `b0597ef` — feat(03-05): implement set_coach and remove_coach reducers
