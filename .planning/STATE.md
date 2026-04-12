---
gsd_state_version: 1.0
milestone: v1
milestone_name: Frontend
current_phase: null
current_plan: null
status: not_started
last_updated: "2026-04-12T17:30:00.000Z"
progress:
  total_phases: 0
  completed_phases: 0
  total_plans: 0
  completed_plans: 0
  percent: 0
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-12)

**Core value:** Players can organize, play, and track competitive HSR matches and tournaments in one place
**Current focus:** Planning next milestone (v1 Frontend)

## Position

**Milestone:** v1 Frontend
**Current phase:** Not started
**Status:** Planning next milestone

## Previous Milestone

v0.5 Backend Foundation shipped 2026-04-12. See `.planning/MILESTONES.md` for details.

## Decisions

Decisions from v0.5 archived to `milestones/v0.5-ROADMAP.md`. Key conventions that carry forward:

- costSetId=0 is the sentinel for the default cost set
- teamGroupId=0 sentinel in reducer args (u32 not optional)
- winnerId=0 sentinel for draw
- Flat columns over config structs for filterable data
- UserPrivate isolation — profile data only via view_my_profile
- .catch() reducer error pattern (no _then() callbacks)
- BigInt micros as strings for timestamp params in reducers
- Sentinel values for optional u8/u32 reducer params (255/0)

## Blockers

None — clean slate for v1.
