# Calendar & Scheduling

## Tables

```
User
│
├── AvailabilitySlot (recurring time blocks)
│     id (PK, autoInc)
│     userId → User.id
│     startAt, endAt (base time window, always UTC)
│     isRecurring, recurrenceRule (RecurrenceRule struct: type, interval, day, endDate)
│     expiresAt (auto-expire after 6 months)
│
├── SavedCalendar (subscription links — "I'm watching your calendar")
│     PK: [userId, targetUserId]
│     userId       → User.id (subscriber)
│     targetUserId → User.id (whose calendar)
│     isVisible    → toggle on/off without deleting
│
├── CalendarEvent (concrete scheduled events)
│     id (PK, autoInc)
│     organizerId    → User.id
│     title, startAt, endAt
│     bracketMatchId? → BracketMatch.id (links to tournament match)
│
└── CalendarEventInvite (per-event RSVP)
      PK: [eventId, inviteeUserId]
      eventId       → CalendarEvent.id
      inviteeUserId → User.id
      isAccepted?   → null=pending, true=accepted, false=declined
```

## Flow

1. Players set `AvailabilitySlot` rows with recurrence rules ("I'm free Tuesdays 7-10pm UTC")
2. Player A saves Player B's calendar via `SavedCalendar` — can now see B's availability
3. Common-availability query: find overlapping `AvailabilitySlot` windows between saved calendars
4. TO or player creates `CalendarEvent` at a chosen overlap window, optionally linked to a bracket match
5. `CalendarEventInvite` rows go out to participants — they accept/decline
6. Match day: lobby is created manually, linked to bracket match via `bracketMatchId`

## Key Decisions

- All timestamps UTC — frontend converts to local time
- Slots auto-expire after 6 months, cannot be created more than 6 months ahead
- Hard limit: 5 saved calendars per user (enforced in reducer)
- No approval needed to save someone's calendar (just toggling visibility)
- Auto-sync: suggests overlapping windows only — does not auto-create events
- CalendarEventInvite rows cleaned up when event is deleted or after event passes
- Notifications/reminders deferred to future
