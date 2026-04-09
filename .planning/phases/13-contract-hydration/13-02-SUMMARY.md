---
phase: 13
plan: "02"
subsystem: docs
tags: [architecture, normalization, documentation]
dependency_graph:
  requires: []
  provides: [normalized-architecture-docs]
  affects: [all-features]
tech_stack:
  added: []
  patterns: [architecture-template-D01-D05, tree-notation, numbered-reducer-steps]
key_files:
  created: []
  modified:
    - docs/achievements/architecture.md
    - docs/admin/architecture.md
    - docs/anonymous-play/architecture.md
    - docs/archetypes/architecture.md
    - docs/auth/architecture.md
    - docs/brackets/architecture.md
    - docs/calendar/architecture.md
    - docs/chat/architecture.md
    - docs/cost-sets/architecture.md
    - docs/cost-tables/architecture.md
    - docs/lobby/architecture.md
    - docs/match-results/architecture.md
    - docs/match-session/architecture.md
    - docs/mmr/architecture.md
    - docs/player-stats/architecture.md
    - docs/roster/architecture.md
    - docs/smoke/architecture.md
    - docs/tournament/architecture.md
    - docs/views/architecture.md
decisions:
  - All 19 architecture files normalized to D-01 through D-05 template standard with content sourced from spacetimedb/src/ files
  - views/architecture.md uses View Definitions section instead of Reducer Flows (no client-callable reducers)
  - anonymous-play/architecture.md documents write-layer enforcement in other reducers rather than direct reducers
  - player-stats/architecture.md documents internal helpers only (no direct client reducers)
metrics:
  duration: "~90 minutes (continued across context boundary)"
  completed_date: "2026-04-09"
  tasks_completed: 2
  files_modified: 19
---

# Phase 13 Plan 02: Architecture Normalization Summary

All 19 `docs/{feature}/architecture.md` files normalized to the D-01 through D-05 template standard, with content sourced directly from `spacetimedb/src/` table and reducer files rather than trusting prior stale doc content.

## What Was Done

Normalized all 19 architecture files across the `docs/` directory to a single consistent template:

- `# {Feature} -- Architecture` title (em dash to double-dash)
- `Last updated: 2026-04-09`
- `## Overview` (2-4 sentence feature summary)
- `## Table Relationships` (tree notation with `+--` connectors, PK/FK/index annotations, `[PRIVATE]` for non-public tables)
- `## Reducer Flows` (numbered steps per reducer, or `## View Definitions` for views/read-only features)
- `## Phase History` (decision table with source and date, plus normalization provenance entry)

Content was sourced from actual source files in `spacetimedb/src/` to ensure accuracy over stale existing docs.

## Tasks

### Task 1 -- achievements through cost-tables (10 files)
**Commit:** `f041a23`

| File | Key Content Added/Corrected |
|------|----------------------------|
| achievements/architecture.md | Auto-Award Pipeline, AchievementCriteria table, 7 reducers |
| admin/architecture.md | ServerIdentity, UserDeletionJob scheduled table, 11 reducers |
| anonymous-play/architecture.md | Write-layer enforcement, computeAnonymousLabel, 7 views |
| archetypes/architecture.md | Rating integration, 4 admin reducers |
| auth/architecture.md | Ban enforcement D-08, Discord link flow, 4 views |
| brackets/architecture.md | BracketMatch/GroupPhaseRecord, 9 reducers |
| calendar/architecture.md | 12 reducers with numbered steps, cross-feature cascades table |
| chat/architecture.md | Rolling window, system messages, lifecycle cleanup |
| cost-sets/architecture.md | 6 tables (3 private draft + 3 live), 8 reducers, 4 views |
| cost-tables/architecture.md | HsrCharacter/Lightcone/Synergy tables, admin_bulk_upsert flows |

### Task 2 -- lobby through views (9 files)
**Commit:** `585a3f8`

| File | Key Content Added/Corrected |
|------|----------------------------|
| lobby/architecture.md | LobbyGcJob scheduled table, LobbyMemberAccount, TournamentStandIn, 15+ reducers |
| match-results/architecture.md | Status lifecycle, 19-step finalization pipeline, concede flows |
| match-session/architecture.md | Timer model, Auction mode, history snapshot, 10+ reducers |
| mmr/architecture.md | ELO formula, EloConfig singleton, Season, Leaderboard, 5 reducers |
| player-stats/architecture.md | Private stat tables, GlobalCharacterStat, internal helpers only |
| roster/architecture.md | Private HsrAccount tables, archetype system, deletion guards D-24 |
| smoke/architecture.md | ServerIdentity singleton, GcResult audit log, self-rescheduling GC |
| tournament/architecture.md | Full lifecycle, TournamentEnrolled/TeamMember split D-20, cancel cascade |
| views/architecture.md | 20+ named views, anonymous enforcement D-92, security vs anonymous view split |

## Deviations from Plan

None -- plan executed exactly as written. All 19 files normalized to template standard with codebase-sourced content.

## Known Stubs

None. Architecture files are documentation only -- no data flow stubs apply.

## Self-Check: PASSED

Files exist:
- docs/lobby/architecture.md: FOUND
- docs/match-results/architecture.md: FOUND
- docs/match-session/architecture.md: FOUND
- docs/mmr/architecture.md: FOUND
- docs/player-stats/architecture.md: FOUND
- docs/roster/architecture.md: FOUND
- docs/smoke/architecture.md: FOUND
- docs/tournament/architecture.md: FOUND
- docs/views/architecture.md: FOUND

Commits exist:
- f041a23: docs(13-02): normalize architecture files -- achievements through cost-tables (10 files)
- 585a3f8: docs(13-02): normalize architecture files -- lobby through views
