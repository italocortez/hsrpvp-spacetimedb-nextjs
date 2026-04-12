# Phase 8: Calendar and Scheduling - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Players can record recurring availability, view others' calendars, find common availability windows, and create calendar events with invites. Tournament organizers can schedule matches via calendar events linked to bracket matches with auto-invite. All calendar data is public. This phase builds all calendar/scheduling reducers on top of the 4 existing skeleton tables (AvailabilitySlot, SavedCalendar, CalendarEvent, CalendarEventInvite).

</domain>

<decisions>
## Implementation Decisions

### Invite Response Model
- **D-01:** Add InviteStatus enum (Pending | Accepted | Declined | Tentative) to CalendarEventInvite. Row persists across all states — organizer sees full attendee picture. Follows Google Calendar / Microsoft Teams best practice.
- **D-02:** Add `respondedAt` timestamp to CalendarEventInvite for response timing.
- **D-03:** Cascade delete — deleting a CalendarEvent deletes all its CalendarEventInvite rows in the same transaction.
- **D-04:** Cap at 9 invitees per event (6 players + 2 coaches + 1 referee). No role tracking on invites — match roles already tracked in tournament tables, bracketMatchId links the event.

### Event Visibility & Limits
- **D-05:** All CalendarEvent data fully public. No busy/free masking — trusted community. If privacy needed later, split into public/private tables.
- **D-06:** Cap at 40 active CalendarEvents per user.
- **D-07:** Auto-delete CalendarEvents older than 90 days (+ cascade invites). Triggered lazily when any calendar reducer runs — deterministic, no timers.
- **D-08:** Only organizer or admin can edit/delete CalendarEvents. Invitees can only change their own InviteStatus.

### Common Availability Computation
- **D-09:** Common availability computed client-side from AvailabilitySlot + CalendarEvent subscriptions. AvailabilitySlots are advisory — events/invites can be created at any time regardless of slot availability.

### Availability Slots
- **D-10:** Cap at 10 AvailabilitySlot configuration rows per user (recurrence rules, not expanded instances). Client expands recurrence rules locally.
- **D-11:** Monthly recurrence clamps to last day of month (day 31 → Feb 28/29). Client-side expansion handles this. RecurrenceRule.dayOfMonth stores the original target day.
- **D-12:** Full CRUD on AvailabilitySlots — create, update (id.update()), delete.
- **D-13:** All timestamps UTC — consistent with the rest of the system. Frontend handles timezone conversion.
- **D-14:** Overlapping availability slots allowed. Slots are advisory — no server-side overlap validation. Keeps reducer logic simple.

### Calendar Sharing (SavedCalendar)
- **D-15:** SavedCalendar is a pure bookmark — no approval, no privacy gate. Simple CRUD (create/delete) with 5-per-user cap. Acts as a subscription routing table for bandwidth optimization.
- **D-16:** Keep `isVisible` on SavedCalendar — frontend UI filter for decluttering. Already in schema, zero cost to keep.

### TO Match Scheduling
- **D-17:** When creating a CalendarEvent with bracketMatchId, auto-invite all match participants (BracketMatch → TournamentTeam → TournamentParticipant). TO picks time, system populates invites.
- **D-18:** Auto-invite players only from bracket match. Coaches and referees added manually by TO if needed.
- **D-19:** One CalendarEvent per bracketMatchId — reducer rejects duplicates. Delete and recreate to reschedule.
- **D-20:** Tournament-linked CalendarEvents can be created by TO, Admin, Moderator, or Tournament Assistants.

### Cleanup & Cascades
- **D-21:** Tournament cancellation cascades to all linked CalendarEvents + their invites. Extends the existing cancel_tournament cleanup. Same transaction.
- **D-22:** Bracket match rollback and DQ cascade-delete linked CalendarEvents + invites.
- **D-23:** User deletion cascades all calendar data — AvailabilitySlots, SavedCalendars (both directions), organized CalendarEvents + invites, CalendarEventInvite rows as invitee. Extends UserDeletionJob.
- **D-24:** Tournament withdrawal deletes the player's CalendarEventInvite rows for that tournament's scheduled matches.

### Event Schema Additions
- **D-25:** Any authenticated user can create personal CalendarEvents. Tournament-linked events (bracketMatchId set) require TO/Admin/Mod/Assistant permissions (D-20).
- **D-26:** Add optional `description` (string) to CalendarEvent for event notes.

### Availability Slot Cleanup
- **D-27:** Auto-delete AvailabilitySlots 1 week after expiry (endAt for one-time, expiresAt for recurring). Same lazy cleanup pattern as D-07. Architecture doc to be updated.
- **D-28:** 6-month creation window for AvailabilitySlots. ExpiresAt auto-set to 6 months from creation if not explicitly provided.

### Claude's Discretion
- Reducer file organization (new file vs extending existing)
- Helper function structure for cleanup logic
- Exact error messages for validation failures
- Whether to consolidate cleanup into a shared helper or keep inline per reducer

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Calendar Architecture
- `docs/calendar/architecture.md` — Table relationships, flow, key decisions (needs updating for D-07, D-27 retention changes)

### Existing Schema
- `spacetimedb/src/tables/availabilitySlot.ts` — AvailabilitySlot table definition (skeleton from Phase 1)
- `spacetimedb/src/tables/savedCalendar.ts` — SavedCalendar table definition (skeleton from Phase 1)
- `spacetimedb/src/tables/calendarEvent.ts` — CalendarEvent table definition (needs description column D-26)
- `spacetimedb/src/tables/calendarEventInvite.ts` — CalendarEventInvite table definition (needs InviteStatus enum + respondedAt D-01/D-02)

### Types
- `spacetimedb/src/types/enums.ts` — RecurrenceType enum (Daily/Weekly/Monthly), add InviteStatus enum here
- `spacetimedb/src/types/structs.ts` — RecurrenceRule struct (recurrenceType, interval, dayOfWeek, dayOfMonth, endDate)

### Cascade Patterns
- `spacetimedb/src/reducers/userDeletion.ts` — UserDeletionJob cascade pattern (extend for D-23)
- `spacetimedb/src/reducers/tournamentManagement.ts` — cancel_tournament cascade (extend for D-21)
- `spacetimedb/src/reducers/bracketAdvancement.ts` — rollback_bracket_match (extend for D-22)
- `spacetimedb/src/reducers/tournamentRegistration.ts` — withdraw_from_tournament (extend for D-24)

### Permission Helpers
- `spacetimedb/src/helpers/ensurePermissions.ts` — Permission checking patterns
- `spacetimedb/src/helpers/tournamentHelpers.ts` — Tournament permission checks (TO/Admin/Mod/Assistant)
- `spacetimedb/src/helpers/auditColumns.ts` — Audit column patterns

### Bracket Integration
- `spacetimedb/src/tables/bracketMatch.ts` — BracketMatch FK target for CalendarEvent.bracketMatchId
- `spacetimedb/src/tables/tournamentParticipant.ts` — Participant lookup for auto-invite (D-17)
- `spacetimedb/src/tables/tournamentTeam.ts` — Team → participant resolution for auto-invite

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ensurePermissions.ts`: Permission checks (admin, moderator, TO) — reuse for D-20, D-25
- `tournamentHelpers.ts`: Tournament permission validation — reuse for tournament-linked event permissions
- `auditColumns.ts`: `auditCreate()` / `auditUpdate()` helpers — apply to all calendar reducers
- `accountRating.ts` pattern: Lazy computation triggered by reducer calls — model for lazy cleanup (D-07, D-27)

### Established Patterns
- Auto-increment PK with `id.update()` for updates (AvailabilitySlot, CalendarEvent)
- Composite PK with delete+insert for updates (SavedCalendar, CalendarEventInvite)
- Cascade deletion in same transaction (UserDeletionJob, cancel_tournament)
- Reducer-level cap enforcement via `.filter().length >= N` check
- `iter()` acceptable for small tables (<100 rows per user)

### Integration Points
- `cancel_tournament` reducer: Add CalendarEvent cascade (D-21)
- `rollback_bracket_match` reducer: Add CalendarEvent cascade (D-22)
- `withdraw_from_tournament` reducer: Add CalendarEventInvite cleanup (D-24)
- `UserDeletionJob`: Add calendar data cascade (D-23)
- Schema registration in `schema.ts`: Tables already imported (lines 63-67, 167-171)

</code_context>

<specifics>
## Specific Ideas

- "Upcoming matches" tab on homescreen — client subscribes to CalendarEvent where bracketMatchId IS NOT NULL and startAt > now, joins against BracketMatch/Tournament for display details
- SavedCalendar acts as a subscription routing table — client reads saved userIds, then subscribes to those users' AvailabilitySlot data for bandwidth efficiency
- True availability = AvailabilitySlot windows minus accepted CalendarEvents (client-side computation)
- Blocked time = personal CalendarEvent with no invitees (no extra table needed)
- All caps (10 slots, 40 events, 9 invitees, 5 saved calendars) enforced in reducer logic — changeable without --clear-database

</specifics>

<deferred>
## Deferred Ideas

- Notifications/reminders for upcoming events — future phase (mentioned in architecture doc)
- Server-side common availability computation (view/reducer) — unnecessary at 100-user scale, client handles it
- Row-level privacy for personal events (split public/private tables) — deferred until needed
- Auto-scheduling (system picks time from overlap) — deferred, TOs pick time manually

</deferred>

---

*Phase: 08-calendar-and-scheduling*
*Context gathered: 2026-03-28*
