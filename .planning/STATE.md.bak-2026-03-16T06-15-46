---
gsd_state_version: 1.0
milestone: v0.5
milestone_name: milestone
status: planning
stopped_at: Completed 01-schema-foundation-02-PLAN.md
last_updated: "2026-03-16T04:02:15.192Z"
last_activity: 2026-03-15 — Roadmap created, 84 requirements mapped across 10 phases
progress:
  total_phases: 10
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
  percent: 0
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-15)

**Core value:** Players can organize, play, and track competitive HSR matches and tournaments in one place — from drafting to scoring to leaderboards — without relying on external tools.
**Current focus:** Phase 1 — Schema Foundation

## Current Position

Phase: 1 of 10 (Schema Foundation)
Plan: 0 of ? in current phase
Status: Ready to plan
Last activity: 2026-03-15 — Roadmap created, 84 requirements mapped across 10 phases

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: -
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
| Phase 01-schema-foundation P01 | 3 | 2 tasks | 7 files |
| Phase 01-schema-foundation P02 | 15 | 2 tasks | 57 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Backend-only milestone — all phases produce tables/reducers/helpers; no frontend work
- [Init]: ELO/bracket/achievement logic lives in pure helper functions in `spacetimedb/src/helpers/` — npm packages cannot be imported into WASM-compiled SpacetimeDB module
- [Init]: Roster visibility must be enforced at subscription level (server-side), not display layer
- [Init]: Anonymous play enforced at data write layer — cursor events carry anonymousLabel instead of userId when lobby is anonymous
- [Init]: BracketMatch uses one row per match with explicit nextWinnerMatchId/nextLoserMatchId FKs — no JSON blob storage
- [Phase 01-schema-foundation]: LobbyConfig renamed to LobbyConfigSnapshot — only used by matchSessionHistory for historical snapshot; Lobby table uses flat columns
- [Phase 01-schema-foundation]: HsrLightconeCost composite PK ['lightconeName', 'gameMode'] allows per-mode cost differentiation
- [Phase 01-schema-foundation]: match_result table renamed to match_result_record — SpacetimeDB toPascalCase(tableName) equals MatchResult enum name; use distinct DB name to avoid type collision
- [Phase 01-schema-foundation]: mmr_rating index renamed to mmr_rating_value — table and index names share a SpacetimeDB namespace; suffix index names when they would equal the table name

### Pending Todos

None yet.

### Blockers/Concerns

- [Phase 4]: Double elimination grand finals reset rule — product decision needed before bracket generation
- [Phase 5]: Imgur API v3 rate limits should be re-verified before implementation
- [Phase 8]: react-big-calendar dateFnsLocalizer API signature should be verified before implementation
- [Phase 2]: Verify SpacetimeDB 2.0.3 supports parameterized subscription WHERE filters; if not, use RosterPublicView pattern (separate filtered table maintained by reducers)

## Session Continuity

Last session: 2026-03-16T03:58:23.685Z
Stopped at: Completed 01-schema-foundation-02-PLAN.md
Resume file: None
