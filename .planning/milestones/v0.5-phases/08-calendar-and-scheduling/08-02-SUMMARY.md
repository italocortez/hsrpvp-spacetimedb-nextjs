---
phase: 08-calendar-and-scheduling
plan: "02"
subsystem: calendar
tags: [calendar, cascade, tournament, bracket, user-deletion, cross-feature]
dependency_graph:
  requires: ["08-01"]
  provides: ["CAL-05"]
  affects: [tournament, bracket-advancement, user-deletion, tournament-registration, tournament-admin]
tech_stack:
  added: []
  patterns:
    - cross-feature cascade via shared helper functions
    - pre-deletion order: calendar before bracket matches in cascadeCleanupTournament
key_files:
  created:
    - docs/calendar/architecture.md (full rewrite)
    - .planning/phases/08-calendar-and-scheduling/08-02-SUMMARY.md
  modified:
    - spacetimedb/src/helpers/tournamentHelpers.ts
    - spacetimedb/src/helpers/userDeletionHelper.ts
    - spacetimedb/src/reducers/bracketAdvancement.ts
    - spacetimedb/src/reducers/tournamentAdmin.ts
    - spacetimedb/src/reducers/tournamentRegistration.ts
decisions:
  - key: cascade-order-in-cancel-tournament
    description: Calendar events deleted before bracket matches in cascadeCleanupTournament (step 3 of 7) — deleteCalendarEventsForTournament reads BracketMatch rows to find linked events, so it must run before bracket match rows are deleted in step 4
  - key: dq-participant-cascade-scope
    description: deleteCalendarEventForBracketMatch called only inside the activeMatch block (only when DQ'd team has an active unresolved match) — if DQ'd player has no active bracket match, the cascade is a no-op
  - key: withdraw-invite-only
    description: withdraw_from_tournament calls deleteUserInvitesForTournament (removes only the player's CalendarEventInvite rows) — the event itself stays so the opponent is still notified
metrics:
  duration_minutes: 25
  completed_date: "2026-03-28"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 6
---

# Phase 8 Plan 2: Cross-Feature Calendar Cascades Summary

**One-liner:** Five cross-feature cascade integrations wiring calendarCascade helpers into tournament cancellation (D-21), bracket rollback (D-22), DQ (D-22), withdrawal (D-24), and user deletion (D-23), plus full Phase 8 architecture doc rewrite.

## Tasks Completed

| Task | Name | Status | Key Changes |
|------|------|--------|-------------|
| 1 | Cross-feature cascade integrations | Complete | 5 files modified, build passes |
| 2 | Update architecture doc, publish, generate bindings, run tests | Complete | Docs rewritten, published, 85/85 tests pass |

## What Was Built

### Task 1: Cross-feature cascade integrations

Five existing files extended with calendar cascade calls from `calendarCascade.ts`:

**tournamentHelpers.ts** — `cascadeCleanupTournament`
- Added `import { deleteCalendarEventsForTournament } from './calendarCascade'`
- Inserted step 3 (calendar events) BEFORE old step 3 (bracket matches), renumbering steps 3→4, 4→5, 5→6, 6→7
- Critical ordering: `deleteCalendarEventsForTournament` reads BracketMatch rows to find linked events, so it must precede bracket match deletion

**userDeletionHelper.ts** — `performUserDeletion`
- Added `import { deleteAllCalendarDataForUser } from './calendarCascade'`
- Inserted cascade call immediately after the `if (!user) return` guard, before UserIdentity deletion
- Covers: AvailabilitySlots, SavedCalendar rows as subscriber, SavedCalendar rows as target (iter), organized CalendarEvents with invite cascade, CalendarEventInvite rows as invitee

**bracketAdvancement.ts** — `rollback_bracket_match`
- Added `import { deleteCalendarEventForBracketMatch } from '../helpers/calendarCascade'`
- Inserted call after permission check and winner validation, before rollback logic modifies the match

**tournamentAdmin.ts** — `dq_participant`
- Added `import { deleteCalendarEventForBracketMatch } from '../helpers/calendarCascade'`
- Inserted call inside the `if (activeMatch)` block, before auto-advance logic sets opponent as winner

**tournamentRegistration.ts** — `withdraw_from_tournament`
- Added `import { deleteUserInvitesForTournament } from '../helpers/calendarCascade'`
- Inserted call after team request cleanup, before participant status update (re-read pattern)

Build: `spacetime build` passed without errors.

### Task 2: Architecture doc, publish, generate bindings, run tests

**docs/calendar/architecture.md** — complete rewrite:
- Table definitions with all columns, indexes, and Phase 8 additions (InviteStatus enum, respondedAt, description column, bracket_match_id btree index)
- 12-reducer reference table with file, permission, and description columns
- Data patterns: update patterns, lazy cleanup, sentinel values, zero-value RecurrenceRule, tournament-linked event creation flow, one-event-per-match enforcement, BigInt timestamp params
- Cross-feature cascades section: trigger table, helper function inventory, cascade order in cascadeCleanupTournament (numbered 1–7)
- Caps and limits table (10 slots, 5 saved, 40 events, 9 invitees, 6mo window, 90d/1w retention)
- Key decisions table covering D-01 through D-28

**Publish:** `spacetime publish hsrpvp-spacetimedb-nextjs-test1` — hot-swap publish, no schema changes, no --clear-database needed.

**Bindings:** `spacetime generate` — regenerated, 16 calendar-related binding files confirmed (12 reducer files + 4 table files including updated calendar_event and calendar_event_invite).

**Tests:** 85/85 pass (5 test files, 157ms).

## Verification

| Criterion | Result |
|-----------|--------|
| tournamentHelpers.ts imports and calls deleteCalendarEventsForTournament BEFORE bracket match deletion | PASS |
| userDeletionHelper.ts imports and calls deleteAllCalendarDataForUser before UserIdentity cascade | PASS |
| bracketAdvancement.ts imports and calls deleteCalendarEventForBracketMatch in rollback_bracket_match | PASS |
| tournamentAdmin.ts imports and calls deleteCalendarEventForBracketMatch in dq_participant | PASS |
| tournamentRegistration.ts imports and calls deleteUserInvitesForTournament in withdraw_from_tournament | PASS |
| Build passes without errors | PASS |
| docs/calendar/architecture.md contains InviteStatus, all 12 reducers, Cross-feature cascades, D-21–D-24, caps table | PASS |
| Module published to maincloud without error | PASS |
| spacetime generate completes without error | PASS |
| 85/85 existing tests pass | PASS |

## Deviations from Plan

None — plan executed exactly as written.

The plan comment about `--skip-clippy` flag is a deviation in documentation only: the flag does not exist in this version of the CLI. The publish ran without it and succeeded identically. No code or behavior deviation.

## Known Stubs

None. All cascade integration points are wired with real logic from calendarCascade.ts.

## Phase 8 Completion

With Plans 01 and 02 complete:
- 4 new tables: AvailabilitySlot, SavedCalendar, CalendarEvent, CalendarEventInvite (with Phase 8 schema additions)
- 12 calendar reducers: availability (3), saved (3), events (5), invite response (1)
- 2 cleanup helpers: calendarCleanup.ts (lazy expiry), calendarCascade.ts (deletion cascades)
- 5 cross-feature integration points: cancel_tournament, rollback_bracket_match, dq_participant, withdraw_from_tournament, performUserDeletion
- Architecture doc reflecting full Phase 8 state (D-01 through D-28)

## Self-Check: PASSED

Files verified present:
- `docs/calendar/architecture.md` — rewritten with full Phase 8 content
- `spacetimedb/src/helpers/tournamentHelpers.ts` — contains deleteCalendarEventsForTournament call at step 3
- `spacetimedb/src/helpers/userDeletionHelper.ts` — contains deleteAllCalendarDataForUser call
- `spacetimedb/src/reducers/bracketAdvancement.ts` — contains deleteCalendarEventForBracketMatch call
- `spacetimedb/src/reducers/tournamentAdmin.ts` — contains deleteCalendarEventForBracketMatch call
- `spacetimedb/src/reducers/tournamentRegistration.ts` — contains deleteUserInvitesForTournament call

Module published: `Updated database with name: hsrpvp-spacetimedb-nextjs-test1`
Tests: 85/85 pass
