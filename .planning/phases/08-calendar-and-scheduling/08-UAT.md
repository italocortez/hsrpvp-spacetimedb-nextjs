---
status: complete
phase: 08-calendar-and-scheduling
source: [08-01-SUMMARY.md, 08-02-SUMMARY.md]
started: 2026-03-28T13:00:00Z
updated: 2026-03-28T23:30:00Z
---

## Current Test

[all complete]

## Tests

### 1. Create Availability Slot with Recurrence
expected: Player calls create_availability_slot with weekly recurrence. Row appears in AvailabilitySlot with correct recurrence rule.
result: PASS (after Timestamp constructor fix)

### 2. Update Availability Slot
expected: Player calls update_availability_slot on own slot. Row updates in place via id.update().
result: PASS

### 3. Delete Availability Slot
expected: Player calls delete_availability_slot on own slot. Row removed.
result: PASS

### 4. Availability Slot 10-Cap Enforcement
expected: After 10 slots, 11th create_availability_slot rejected.
result: PASS — "Maximum 10 availability slots per user."

### 5. Save Calendar (Bookmark Another User)
expected: Player calls save_calendar with another user's ID. SavedCalendar row created with isVisible=true.
result: PASS

### 6. Saved Calendar 5-Cap Enforcement
expected: After 5 saves, 6th save_calendar rejected.
result: PASS — "Maximum 5 saved calendars per user."

### 7. Toggle Calendar Visibility
expected: toggle_calendar_visibility flips isVisible via composite PK delete+insert.
result: PASS — toggled false then back to true

### 8. Unsave Calendar
expected: unsave_calendar deletes SavedCalendar row.
result: PASS

### 9. Create Personal Calendar Event
expected: create_calendar_event with bracketMatchId=0. CalendarEvent row created with description, timestamps.
result: PASS (after Timestamp constructor fix)

### 10. Invite User to Event
expected: invite_to_event creates CalendarEventInvite with inviteStatus=Pending.
result: PASS

### 11. Respond to Invite (Accept)
expected: respond_to_invite changes inviteStatus to Accepted, sets respondedAt.
result: PASS — param is `status` not `response`

### 12. Event 9-Invitee Cap Enforcement
expected: After 9 invites, 10th invite_to_event rejected.
result: PASS — "Maximum 9 invitees per event."

### 13. Delete Calendar Event Cascades Invites
expected: delete_calendar_event removes event AND all invites in same transaction.
result: PASS — event + 9 invites all deleted

### 14. Lazy Cleanup — Expired Slots Removed on Next Call
expected: cleanupExpiredSlots runs without error on every reducer call.
result: PASS (shallow — full expired-slot cleanup requires pre-seeded expired data)

### 15. Permission — Non-Organizer Cannot Delete Event
expected: Non-organizer calling delete_calendar_event rejected.
result: PASS — "Forbidden: Only the organizer or an Admin can delete this event."

### 16. Cancel Tournament Cascades Calendar Events
expected: cancel_tournament deletes all linked CalendarEvents and invites.
result: DEFERRED — Requires tournament + bracket match setup (Phase 9 dependencies)

### 17. User Deletion Cascades Calendar Data
expected: User soft-delete cascades all calendar data: AvailabilitySlots, SavedCalendar (both directions), organized CalendarEvents + invites, CalendarEventInvite as invitee.
result: PASS — All 5 categories of calendar data deleted. User anonymized to "deleted_37".

## Summary

total: 17
passed: 15
issues: 1 (Timestamp constructor bug, fixed during UAT)
pending: 0
skipped: 0
blocked: 1 (Test 16 — deferred to Phase 9)

## Bugs Found and Fixed

### BUG-01: Server-side Timestamp construction uses wrong property
**Severity:** Critical (PANIC on every calendar reducer call)
**Found in:** Test 1 (create_availability_slot)
**Root cause:** Calendar reducers used `{ microsSinceUnixEpoch: BigInt }` for Timestamp values. This is the CLIENT-side format. Server-side SDK expects `new Timestamp(BigInt)` which uses the internal `__timestamp_micros_since_unix_epoch__` property.
**Files fixed:**
- `spacetimedb/src/reducers/calendarAvailability.ts` — all Timestamp constructions + RecurrenceRule sentinel values
- `spacetimedb/src/reducers/calendarEvents.ts` — all Timestamp constructions
**Also fixed:** RecurrenceRule optional struct fields now use sentinel values (dayOfWeek=255, dayOfMonth=0, endDate=Timestamp(0n)) instead of null/undefined — SpacetimeDB SDK cannot serialize null/undefined for optional fields inside structs.

## Gaps

### Test 16: Tournament cascade
status: deferred
reason: Requires tournament lifecycle + bracket match infrastructure (Phase 9)
deferred_to: Phase 9 UAT
