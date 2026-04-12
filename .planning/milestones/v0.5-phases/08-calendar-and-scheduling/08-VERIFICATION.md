---
phase: 08-calendar-and-scheduling
verified: 2026-03-28T07:10:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
---

# Phase 8: Calendar and Scheduling Verification Report

**Phase Goal:** Players can record recurring availability, view others' calendars, find common windows, and tournament organizers can schedule matches via calendar events
**Verified:** 2026-03-28T07:10:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A player can create recurring availability slot rows with a RecurrenceRule struct (daily/weekly/monthly); a single row change updates all future occurrences | VERIFIED | `calendarAvailability.ts` implements `create_availability_slot`, `update_availability_slot`, `delete_availability_slot` with full RecurrenceRule struct construction; `update` uses `id.update()` pattern for single-row changes |
| 2 | A player can subscribe to up to 5 other players' availability slots; toggle visibility per saved calendar | VERIFIED | `calendarSaved.ts` enforces `MAX_SAVED_CALENDARS = 5`; `toggle_calendar_visibility` updates `isVisible` flag; `AvailabilitySlot` and `SavedCalendar` tables are `public: true`; note: privacy is advisory via `isVisible` client filter (D-15), not a server-side gate — this was an explicit design decision |
| 3 | A common-availability query is available to clients | VERIFIED | `AvailabilitySlot` table is `public: true` with `user_id` btree index; client-side computation per D-09 is the intended design; no server-side reducer needed |
| 4 | A player can create a CalendarEvent and invite other players; invitees can accept or decline | VERIFIED | `create_calendar_event`, `invite_to_event`, `remove_invite` in `calendarEvents.ts`; `respond_to_invite` in `calendarInviteResponse.ts` with Accepted/Declined/Tentative statuses and `respondedAt` timestamp |
| 5 | A TO can create calendar events linked to tournament matches and send invites to participants | VERIFIED | `create_calendar_event` with `bracketMatchId > 0` calls `ensureTournamentAccess`, auto-invites bracket match participants via TournamentParticipant filter; one-event-per-match enforced via D-19 duplicate check |
| 6 | Expired slots (1 week past expiry) and old events (90 days past endAt) are lazily cleaned up | VERIFIED | `calendarCleanup.ts` exports `cleanupExpiredSlots` (ONE_WEEK_MICROS) and `cleanupOldEvents` (NINETY_DAYS_MICROS); called from `calendarAvailability.ts` and `calendarEvents.ts` on every reducer call |
| 7 | Cross-feature cascades: tournament cancel, bracket rollback, DQ, withdrawal, user deletion all clean up calendar data | VERIFIED | All 5 cascade points wired: `tournamentHelpers.ts`, `userDeletionHelper.ts`, `bracketAdvancement.ts`, `tournamentAdmin.ts`, `tournamentRegistration.ts` — confirmed by code inspection |
| 8 | Cancelling a tournament deletes all its linked CalendarEvents and their invites | VERIFIED | `tournamentHelpers.ts:90` calls `deleteCalendarEventsForTournament(ctx, tournamentId)` at step 3 of `cascadeCleanupTournament`, BEFORE bracket match deletion at step 4 |
| 9 | Rolling back a bracket match deletes the linked CalendarEvent and its invites | VERIFIED | `bracketAdvancement.ts:283` calls `deleteCalendarEventForBracketMatch(ctx, bracketMatchId)` inside `rollback_bracket_match` |
| 10 | Disqualifying a participant deletes the CalendarEvent for their active bracket match | VERIFIED | `tournamentAdmin.ts:64` calls `deleteCalendarEventForBracketMatch(ctx, activeMatch.id)` inside the `if (activeMatch)` block of `dq_participant` |
| 11 | Withdrawing from a tournament deletes the player's CalendarEventInvite rows for that tournament's matches | VERIFIED | `tournamentRegistration.ts:170` calls `deleteUserInvitesForTournament(ctx, user.id, tournamentId)` inside `withdraw_from_tournament` |
| 12 | Deleting a user cascades all their calendar data | VERIFIED | `userDeletionHelper.ts:47` calls `deleteAllCalendarDataForUser(ctx, userId)` covering slots, both directions of SavedCalendar, organized events with invites, and invitee rows |

**Score:** 12/12 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `spacetimedb/src/types/enums.ts` | InviteStatus enum (Pending, Accepted, Declined, Tentative) | VERIFIED | Line 180: `export const InviteStatus = t.enum('InviteStatus', {...})` with all 4 variants |
| `spacetimedb/src/tables/calendarEvent.ts` | description column and bracketMatchId index | VERIFIED | Line 14: `description: t.string().optional()`; Line 23: `bracket_match_id` btree index |
| `spacetimedb/src/tables/calendarEventInvite.ts` | inviteStatus and respondedAt columns | VERIFIED | Line 11: `inviteStatus: InviteStatus`; Line 12: `respondedAt: t.timestamp().optional()` |
| `spacetimedb/src/helpers/calendarCleanup.ts` | cleanupExpiredSlots and cleanupOldEvents helpers | VERIFIED | Both exported; BigInt constants ONE_WEEK_MICROS, NINETY_DAYS_MICROS present |
| `spacetimedb/src/helpers/calendarCascade.ts` | 5 cascade helpers | VERIFIED | All 5 functions present and substantive: `deleteCalendarEventWithInvites`, `deleteCalendarEventForBracketMatch`, `deleteCalendarEventsForTournament`, `deleteUserInvitesForTournament`, `deleteAllCalendarDataForUser` |
| `spacetimedb/src/reducers/calendarAvailability.ts` | 3 availability reducers | VERIFIED | 224 lines; all 3 reducers exported with full validation, cap checks, lazy cleanup, RecurrenceRule construction |
| `spacetimedb/src/reducers/calendarSaved.ts` | 3 saved calendar reducers | VERIFIED | All 3 reducers exported; `MAX_SAVED_CALENDARS = 5` enforced; composite PK delete+insert for toggle |
| `spacetimedb/src/reducers/calendarEvents.ts` | 5 event/invite reducers | VERIFIED | 299 lines; all 5 reducers exported; `ensureTournamentAccess`, `cleanupOldEvents`, `deleteCalendarEventWithInvites` all called; bracket_match_id duplicate check present |
| `spacetimedb/src/reducers/calendarInviteResponse.ts` | respond_to_invite reducer | VERIFIED | 47 lines; validates Accepted/Declined/Tentative; composite PK update with `respondedAt: ctx.timestamp` |
| `spacetimedb/src/index.ts` | Exports all 12 calendar reducers | VERIFIED | Lines 28-31: 4 export statements covering all 12 reducers |
| `spacetimedb/src/helpers/tournamentHelpers.ts` | Calendar cascade in cascadeCleanupTournament | VERIFIED | Line 3: `import { deleteCalendarEventsForTournament }`; Line 90: call at step 3 (before bracket match deletion at step 4) |
| `spacetimedb/src/helpers/userDeletionHelper.ts` | Calendar cascade in performUserDeletion | VERIFIED | Line 2: `import { deleteAllCalendarDataForUser }`; Line 47: called before UserIdentity cascade |
| `spacetimedb/src/reducers/bracketAdvancement.ts` | Calendar cascade in rollback_bracket_match | VERIFIED | Line 7: `import { deleteCalendarEventForBracketMatch }`; Line 283: called in rollback_bracket_match |
| `spacetimedb/src/reducers/tournamentAdmin.ts` | Calendar cascade in dq_participant | VERIFIED | Line 6: `import { deleteCalendarEventForBracketMatch }`; Line 64: called in dq_participant active match block |
| `spacetimedb/src/reducers/tournamentRegistration.ts` | Calendar invite cleanup in withdraw_from_tournament | VERIFIED | Line 6: `import { deleteUserInvitesForTournament }`; Line 170: called in withdraw_from_tournament |
| `docs/calendar/architecture.md` | Updated architecture doc with reducer inventory and Phase 8 decisions | VERIFIED | Contains InviteStatus, all 12 reducers, Cross-feature cascades section with D-21–D-24, caps table, key decisions D-01 through D-28 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `calendarEvents.ts` | `calendarCascade.ts` | `deleteCalendarEventWithInvites` in `delete_calendar_event` | WIRED | Line 238 calls `deleteCalendarEventWithInvites(ctx, eventId)` |
| `calendarEvents.ts` | `tournamentHelpers.ts` | `ensureTournamentAccess` for tournament-linked events | WIRED | Line 19 import; Line 68 call with `bracketMatch.tournamentId` |
| `calendarAvailability.ts` | `calendarCleanup.ts` | `cleanupExpiredSlots` on every reducer call | WIRED | Line 15 import; Line 59 call in `create_availability_slot` |
| `calendarEvents.ts` | `calendarCleanup.ts` | `cleanupOldEvents` on every event reducer call | WIRED | Line 21 import; Line 103 call in `create_calendar_event` |
| `spacetimedb/src/index.ts` | all calendar reducers | export statements for all 12 | WIRED | Lines 28-31 cover all 12 reducers in 4 export lines |
| `tournamentHelpers.ts` | `calendarCascade.ts` | import `deleteCalendarEventsForTournament` | WIRED | Line 3 import; Line 90 call confirmed |
| `userDeletionHelper.ts` | `calendarCascade.ts` | import `deleteAllCalendarDataForUser` | WIRED | Line 2 import; Line 47 call confirmed |
| `bracketAdvancement.ts` | `calendarCascade.ts` | import `deleteCalendarEventForBracketMatch` | WIRED | Line 7 import; Line 283 call confirmed |
| `tournamentAdmin.ts` | `calendarCascade.ts` | import `deleteCalendarEventForBracketMatch` | WIRED | Line 6 import; Line 64 call confirmed |
| `tournamentRegistration.ts` | `calendarCascade.ts` | import `deleteUserInvitesForTournament` | WIRED | Line 6 import; Line 170 call confirmed |

### Data-Flow Trace (Level 4)

This phase is backend-only (SpacetimeDB reducers). Data flows from client reducer calls into the database tables; there are no frontend components to trace. The tables (`AvailabilitySlot`, `SavedCalendar`, `CalendarEvent`, `CalendarEventInvite`) are all `public: true` and will populate client subscriptions when reducers insert rows. No hollow props or disconnected data sources.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 12 calendar reducers exported from index.ts | grep count on index.ts export lines | 4 export lines covering all 12 names | PASS |
| calendarCascade.ts exports all 5 cascade functions | Direct file read | All 5 functions present and substantive | PASS |
| calendarCleanup.ts exports cleanupExpiredSlots and cleanupOldEvents | Direct file read | Both functions present with correct BigInt constants | PASS |
| 85 existing tests pass (no regressions) | `npm test` | 85/85 pass, 154ms | PASS |
| Module bindings generated for all 12 reducers | `ls src/module_bindings/ | grep calendar` | 12 binding files present (3 availability + 3 saved + 5 event + 1 response) | PASS |
| InviteStatus in generated types.ts binding | grep on `src/module_bindings/types.ts` | Line 576: `export const InviteStatus = __t.enum(...)` with all variants | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| CAL-01 | 08-01-PLAN.md | Player can set recurring availability slots (daily, weekly, monthly with Feb edge case handling) | SATISFIED | `calendarAvailability.ts`: `create_availability_slot` with Daily/Weekly/Monthly RecurrenceRule; monthly day-of-month stored for client-side Feb edge case handling (D-11) |
| CAL-02 | 08-01-PLAN.md | Player can view up to 5 other players' calendars with toggleable visibility | SATISFIED | `calendarSaved.ts`: `save_calendar` enforces 5-cap; `toggle_calendar_visibility` sets `isVisible`; design uses client-side visibility filter (D-15/D-16) rather than server-side privacy gate — explicit, documented decision |
| CAL-03 | 08-01-PLAN.md | Auto-sync feature finds common availability windows between selected players | SATISFIED | Common availability is client-side per D-09; `AvailabilitySlot` is `public: true` with `user_id` index; `SavedCalendar` provides the bookmark structure for subscriptions — no server reducer needed |
| CAL-04 | 08-01-PLAN.md | Player can create calendar events and invite other players | SATISFIED | `create_calendar_event`, `invite_to_event`, `remove_invite`, `respond_to_invite` all implemented with InviteStatus and respondedAt |
| CAL-05 | 08-01-PLAN.md, 08-02-PLAN.md | Tournament organizers can use calendar for match scheduling and send invites | SATISFIED | `create_calendar_event` with bracketMatchId triggers `ensureTournamentAccess` + auto-invite; cross-feature cascades (D-21 through D-24) all wired |

**All 5 requirements satisfied. No orphaned requirements.**

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None found | - | - | - | - |

Scanned all 10 calendar-related files (4 reducers, 2 helpers, 1 enum, 2 tables, 1 index.ts). Zero TODO/FIXME/placeholder comments, zero stub return patterns, zero empty handlers.

### Human Verification Required

#### 1. Calendar Sharing Privacy Expectation vs Implementation

**Test:** Create two users. User A creates an AvailabilitySlot. User B subscribes to the SpacetimeDB table without calling `save_calendar`. Check if User B can see User A's slot.
**Expected per ROADMAP SC-2:** "those slots are visible only when the target player has enabled calendar sharing"
**Actual implementation:** AvailabilitySlot is `public: true` — all slots visible to all subscribers regardless of SavedCalendar rows. SavedCalendar's `isVisible` is a client-side UI filter.
**Why human:** Requires a judgment call on whether D-15 (pure bookmark, no privacy gate) satisfies the intent of CAL-02. The design decision was documented in CONTEXT.md before planning. The discrepancy is between the original ROADMAP wording and the refined implementation decision. If the intended behavior requires server-side privacy (only see slots when target has "enabled sharing"), this would require a subscription-level filter — not just a client filter.

#### 2. February Edge Case for Monthly Recurrence

**Test:** Create a monthly AvailabilitySlot with dayOfMonth=31 (or 29/30). Expand the recurrence rule client-side for February.
**Expected:** Client expansion clamps to Feb 28 (or 29 in leap year) as per D-11.
**Why human:** Server stores original dayOfMonth (31). February clamp behavior is client-side only. Requires a frontend test to confirm client expansion logic handles this correctly. No server-side enforcement — backend stores whatever dayOfMonth value is passed.

### Gaps Summary

No gaps found. All 12 must-haves from both plans are verified as existing, substantive, and wired. All 5 CAL requirements are satisfied. All 5 cross-feature cascade integration points are confirmed wired. The test suite passes with 85/85 tests and no regressions.

One design trade-off to note: ROADMAP success criterion SC-2 references "visible only when the target player has enabled calendar sharing," but the implementation chose a simpler model (all slots fully public, `isVisible` is a client-side display filter). This was an explicit, documented decision in CONTEXT.md (D-05, D-15) made before planning. It is not a gap but should be confirmed by the project owner if the original privacy intent was important.

---

_Verified: 2026-03-28T07:10:00Z_
_Verifier: Claude (gsd-verifier)_
