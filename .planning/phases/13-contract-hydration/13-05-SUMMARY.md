---
phase: 13-contract-hydration
plan: "05"
subsystem: docs
tags: [documentation, frontend-handoff, erd, schema]
dependency_graph:
  requires: [13-02, 13-03, 13-04]
  provides: [frontend-handoff-rewritten, erd-complete]
  affects: [docs/FRONTEND-HANDOFF.md, notes/erd-mermaid.md]
tech_stack:
  added: []
  patterns: [frontend-handoff-from-normalized-docs, erd-mermaid-67-tables]
key_files:
  created: []
  modified:
    - docs/FRONTEND-HANDOFF.md
    - notes/erd-mermaid.md
decisions:
  - FRONTEND-HANDOFF.md rewritten from scratch (D-14) referencing all 19 normalized feature docs from Plans 02/03
  - ERD updated with identity_gc_job and gc_result (the 2 missing Phase 12.1 tables) bringing entity count to 67
  - notes/erd-mermaid.md is gitignored but force-added (pre-existing state; not introduced by this plan)
metrics:
  duration: "~30 minutes"
  completed_date: "2026-04-09"
  tasks_completed: 2
  files_modified: 2
---

# Phase 13 Plan 05: Frontend Handoff + ERD Update Summary

FRONTEND-HANDOFF.md rewritten from scratch with accurate counts (67 tables, ~155 reducers, 32 views, SDK 2.1.0). ERD mermaid updated with all 67 production tables including the 2 missing Phase 12.1 additions (identity_gc_job, gc_result).

## What Was Done

### Task 1: Rewrite FRONTEND-HANDOFF.md (commit c90a820)

Complete rewrite of `docs/FRONTEND-HANDOFF.md` from scratch. The previous version had accumulated significant drift since Phase 6.1:

**Stale content removed:**
- Reference to `docs/teams/` directory (does not exist)
- Claim that Phases 7-11 are incomplete (all 20 backend phases are complete)
- "80+ reducers" claim (actual: ~155 exports)
- "55 tables" claim (actual: 67)
- Phase 12 auth changes missing (UserPrivate, view_my_profile, .catch() pattern)

**New content:**
- Backend Summary section with accurate stats: 67 tables, ~155 reducers, 32 views, SDK 2.1.0, 83 requirements
- Feature Map table covering all 19 feature areas with table counts, reducer counts, and links to both architecture.md and contract.md
- Authentication Flow section documenting guest → Discord → verified path, UserPrivate privacy, stdb_session cookie pattern
- Data Access Patterns section: subscriptions, views (32 named views with key examples), reducer calls with Phase 12.2 `.catch()` pattern
- Key Conventions section: enum tag objects, timestamp conversion, sentinel values, anonymous labels, roster visibility, tournament/match lifecycle stages, series management
- Existing Frontend Pages table with current status (working vs stub)
- Missing from Backend section (deferred items: seasons, HoYo API, CV import, Swiss brackets, persistent teams)
- Project Planning References and Code Locations tables (accurate paths and counts)
- Development Entry Points section directing to roster as start, then auth, then core gameplay loop

### Task 2: Update ERD Mermaid (commit 38970b3)

Updated `notes/erd-mermaid.md` to include the 2 tables missing from the previous 65-entity diagram:

| Table | Phase | Columns Added |
|-------|-------|---------------|
| `identity_gc_job` | 12.1 | scheduledId (PK autoInc), scheduledAt |
| `gc_result` | 12.1 | id (PK autoInc), gcType, ranAt, itemsScanned, itemsDeleted, details, createdById (FK) |

Also updated:
- Header: `66 tables` → `67 tables. All v0.5 tables included. Updated 2026-04-09`
- Color legend: Added `identity_gc_job` and `gc_result` to the blue row
- Relationship section: Added `gc_result }o--|| user : "createdById (many-to-one)"` under Phase 12.1 comment
- `identity_gc_job` has no FK relationships (it's a scheduled table with no foreign references)

**Verification:** All 124 relationship lines have explicit cardinality annotation text. No references to removed tables (TournamentParticipant, GroupStanding). Entity count matches actual 67 table files.

## Deviations from Plan

### notes/erd-mermaid.md is gitignored

**Found during:** Task 2 commit
**Issue:** `notes/` directory is in `.gitignore`; `git add notes/erd-mermaid.md` was rejected
**Fix:** Used `git add -f notes/erd-mermaid.md` to force-add the file. This is pre-existing behavior (the file was previously committed via force-add); this plan did not change the gitignore state.
**Impact:** None — file committed successfully at `38970b3`

Otherwise: plan executed exactly as written.

## Known Stubs

None. Documentation files only — no data flow stubs apply.

## Threat Flags

None. Both files are internal project documentation. No secrets disclosed (per T-13-05 and T-13-06 accept dispositions in plan threat model).

## Self-Check: PASSED

Files exist and have content:
- `docs/FRONTEND-HANDOFF.md`: 312 lines ✓
- `notes/erd-mermaid.md`: 503 lines ✓

Commits exist:
- `c90a820`: docs(13-05): rewrite FRONTEND-HANDOFF.md from scratch ✓
- `38970b3`: docs(13-05): update ERD mermaid with missing Phase 12.1 tables ✓

Acceptance criteria:
- FRONTEND-HANDOFF.md first line contains `HSRPVP Backend -- Frontend Handoff` ✓
- Contains `Last updated: 2026-04-09` ✓
- References `architecture.md` 24 times (all 19 features) ✓
- References `contract.md` 21 times ✓
- Does NOT reference `docs/teams/` ✓
- Does NOT claim phases 7-11 are incomplete ✓
- Mentions `~155` reducer exports ✓
- Mentions `67` tables ✓
- Mentions SpacetimeDB SDK `2.1.0` ✓
- Mentions `32` server-side views ✓
- Contains Authentication, Data Access Patterns, and Entry Points sections ✓
- ERD contains `erDiagram` ✓
- ERD entity count is 67 (matches actual table count) ✓
- ERD contains `identity_gc_job` entity ✓
- ERD contains `gc_result` entity ✓
- ERD contains 124 cardinality annotation strings ✓
- No references to removed tables (TournamentParticipant, GroupStanding) ✓
- ERD header date updated to 2026-04-09 ✓
