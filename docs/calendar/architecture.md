# Calendar & Scheduling — Architecture

*Updated: Phase 8 execution (Plans 01–02) — 2026-03-28*

## Tables

```
User
│
├── AvailabilitySlot (recurring or one-time availability blocks)
│     id (PK, autoInc)
│     userId → User.id  [btree: user_id]
│     startAt, endAt (base time window, always UTC)
│     isRecurring  (bool)
│     recurrenceRule (RecurrenceRule struct)
│       .recurrenceType  RecurrenceType enum (Daily|Weekly|Monthly)
│       .interval        u8 (1 = every period; 0 = sentinel for non-recurring)
│       .dayOfWeek       u8 optional (0-6; 255 = not set sentinel)
│       .dayOfMonth      u8 optional (1-31; 0 = not set sentinel)
│       .endDate         Timestamp optional
│     expiresAt (auto-set to 6 months from creation for recurring; equals endAt for one-time)
│     [audit columns]
│
├── SavedCalendar (subscription bookmark — "I'm watching your calendar")
│     PK: [userId, targetUserId]   [btree: user_id, by_user_and_target]
│     userId       → User.id (subscriber)
│     targetUserId → User.id (whose calendar)
│     isVisible    toggle on/off without deleting (D-16)
│     [audit columns]
│
├── CalendarEvent (concrete scheduled events)
│     id (PK, autoInc)
│     organizerId    → User.id  [btree: organizer_id]
│     title          string
│     description?   string optional (D-26: event notes, appended at end for safe migration)
│     startAt        Timestamp  [btree: start_at]
│     endAt          Timestamp
│     bracketMatchId? u32 optional → BracketMatch.id  [btree: bracket_match_id]
│     [audit columns]
│
└── CalendarEventInvite (per-event RSVP)
      PK: [eventId, inviteeUserId]  [btrees: event_id, invitee_user_id, by_event_and_invitee]
      eventId       → CalendarEvent.id
      inviteeUserId → User.id
      inviteStatus  InviteStatus enum (Pending|Accepted|Declined|Tentative)  (D-01)
      respondedAt?  Timestamp optional  (D-02: when invitee responded)
      [audit columns]
```

## Flow

1. Players set `AvailabilitySlot` rows with recurrence rules ("I'm free Tuesdays 7-10pm UTC")
2. Player A saves Player B's calendar via `SavedCalendar` — can now see B's availability
3. Common-availability computation happens client-side from subscribed slot data
4. TO or player creates `CalendarEvent` at a chosen overlap window, optionally linked to a bracket match
5. `CalendarEventInvite` rows auto-created for bracket match participants (D-17); additional invitees added manually
6. Invitees respond via `respond_to_invite` — status updates to Accepted/Declined/Tentative with respondedAt timestamp
7. Match day: lobby is created manually, linked to bracket match via `bracketMatchId`

## Reducer Reference

| Reducer | File | Permission | Description |
|---------|------|------------|-------------|
| `create_availability_slot` | calendarAvailability.ts | Authenticated, non-guest | Create recurring/one-time slot; cap=10, 6mo window (D-10, D-28) |
| `update_availability_slot` | calendarAvailability.ts | Owner only | Update slot via `id.update()` |
| `delete_availability_slot` | calendarAvailability.ts | Owner or Admin | Delete slot |
| `save_calendar` | calendarSaved.ts | Authenticated, non-guest | Bookmark another user's calendar; cap=5 (D-15) |
| `unsave_calendar` | calendarSaved.ts | Owner only | Remove bookmark |
| `toggle_calendar_visibility` | calendarSaved.ts | Owner only | Toggle isVisible flag; composite PK delete+insert (D-16) |
| `create_calendar_event` | calendarEvents.ts | Auth non-guest (personal); TournamentAccess (tournament-linked, D-20) | Create event; cap=40; auto-invite bracket match participants (D-17, D-18, D-19) |
| `update_calendar_event` | calendarEvents.ts | Organizer or Admin | Update title/description/times; cannot change bracketMatchId (D-08) |
| `delete_calendar_event` | calendarEvents.ts | Organizer or Admin | Delete with invite cascade (D-03, D-08) |
| `invite_to_event` | calendarEvents.ts | Organizer or Admin | Add invitee; cap=9 total (D-04) |
| `remove_invite` | calendarEvents.ts | Organizer or Admin | Remove invitee |
| `respond_to_invite` | calendarInviteResponse.ts | Invitee only | Set Accepted/Declined/Tentative + respondedAt; rejects Pending (D-01, D-02) |

## Data Patterns

### Update patterns
- **Auto-increment PK** (`AvailabilitySlot`, `CalendarEvent`): use `id.update()` to modify rows
- **Composite PK** (`SavedCalendar`, `CalendarEventInvite`): delete + insert pattern (no in-place update)

### Lazy cleanup (deterministic, no timers)
- `cleanupExpiredSlots(ctx, userId)` — deletes AvailabilitySlot rows where `expiresAt + 1 week < now` (D-27)
- `cleanupOldEvents(ctx, userId)` — deletes CalendarEvent rows where `endAt + 90 days < now`, cascade-deletes invites (D-07)
- Both run at the start of their domain's reducers (availability and event reducers respectively)

### Sentinel values for optional u8/u32 reducer params
SpacetimeDB SDK does not support optional params on u8/u32 types, so sentinels are used:
- `dayOfWeek=255` → not set (weekly day not specified)
- `dayOfMonth=0` → not set (monthly day not specified)
- `bracketMatchId=0` → personal event (no bracket match link)

### Zero-value RecurrenceRule sentinel for non-recurring slots
Non-recurring `AvailabilitySlot` rows still carry a `RecurrenceRule` struct but with `interval=0` and `recurrenceType=Daily`. Client-side: check `isRecurring` flag before interpreting the rule.

### Tournament-linked event creation (D-17, D-18)
`create_calendar_event` with `bracketMatchId > 0`:
1. Verifies TO/Admin/Mod/Assistant access for the bracket match's tournament
2. Checks no existing event for that bracketMatchId (D-19)
3. Resolves `BracketMatch → TournamentTeam → TournamentParticipant` for both teams
4. Auto-inserts `CalendarEventInvite` rows for all active participants
5. Manual invitees (from `inviteeUserIds` arg) added after, excluding already-auto-invited users

### One event per bracket match (D-19)
Enforced via `bracket_match_id` btree index: reducer reads `[...ctx.db.CalendarEvent.bracket_match_id.filter(bracketMatchId)]` and rejects if non-empty. To reschedule, delete existing event and create a new one.

### BigInt timestamp params
Calendar reducers use `t.string()` for timestamp args (e.g. `startAt`, `endAt`, `endDate`) with BigInt micros as strings — avoids u64 encoding issues in the SpacetimeDB SDK client calls (D-13 + Phase 08 decision).

## Cross-Feature Cascades

All cascades run in the same transaction as the triggering reducer (no eventual consistency).

| Trigger | Helper Call | Decisions |
|---------|-------------|-----------|
| `cancel_tournament` → `cascadeCleanupTournament` | `deleteCalendarEventsForTournament(ctx, tournamentId)` | D-21 — runs before bracket match row deletion so BracketMatch rows are still readable |
| `rollback_bracket_match` | `deleteCalendarEventForBracketMatch(ctx, bracketMatchId)` | D-22 — runs before rollback logic modifies the bracket match |
| `dq_participant` (auto-advance active match) | `deleteCalendarEventForBracketMatch(ctx, activeMatch.id)` | D-22 — only fires when DQ'd team has an active unresolved bracket match |
| `withdraw_from_tournament` | `deleteUserInvitesForTournament(ctx, user.id, tournamentId)` | D-24 — removes invite rows only (event stays for the opponent) |
| `performUserDeletion` | `deleteAllCalendarDataForUser(ctx, userId)` | D-23 — bidirectional SavedCalendar cleanup (as subscriber and as target) |

### Cascade helper functions (spacetimedb/src/helpers/calendarCascade.ts)

| Function | What it deletes |
|----------|----------------|
| `deleteCalendarEventWithInvites(ctx, eventId)` | All CalendarEventInvite rows for the event, then the CalendarEvent row |
| `deleteCalendarEventForBracketMatch(ctx, bracketMatchId)` | All CalendarEvents linked to the bracket match (via bracket_match_id btree), with invite cascade |
| `deleteCalendarEventsForTournament(ctx, tournamentId)` | Iterates all BracketMatch rows for the tournament, calls deleteCalendarEventForBracketMatch for each |
| `deleteUserInvitesForTournament(ctx, userId, tournamentId)` | All CalendarEventInvite rows for the user linked to the tournament's bracket match events |
| `deleteAllCalendarDataForUser(ctx, userId)` | AvailabilitySlots, SavedCalendar rows as subscriber, SavedCalendar rows as target (iter), organized CalendarEvents with invite cascade, CalendarEventInvite rows as invitee |

### Cascade order in cascadeCleanupTournament
```
1. Team requests
2. Group standings
3. Calendar events (D-21) ← must read BracketMatch rows before step 4 deletes them
4. Bracket matches
5. Tournament player accounts
6. Tournament teams
7. Tournament assistants
```

## Caps and Limits

| Resource | Cap | Decision |
|----------|-----|----------|
| AvailabilitySlot rows per user | 10 | D-10 |
| SavedCalendar rows per user | 5 | D-15 |
| CalendarEvent rows per user (active) | 40 | D-06 |
| CalendarEventInvite rows per event | 9 | D-04 (6 players + 2 coaches + 1 referee) |
| AvailabilitySlot creation window | 6 months ahead | D-28 |
| CalendarEvent retention | 90 days after endAt | D-07 |
| AvailabilitySlot post-expiry grace | 1 week after expiresAt | D-27 |

## Key Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| D-01 | InviteStatus enum: Pending/Accepted/Declined/Tentative | Richer invite picture than bool; follows Google Calendar / Teams pattern |
| D-02 | respondedAt timestamp on CalendarEventInvite | Response timing for display/sorting |
| D-03 | Cascade: delete CalendarEvent → delete CalendarEventInvite | Orphaned invites are waste |
| D-04 | Cap: 9 invitees per event | 6 players + 2 coaches + 1 referee; no role tracking on invites |
| D-05 | All CalendarEvent data fully public | Trusted community; privacy deferred |
| D-06 | Cap: 40 CalendarEvents per user | Reasonable limit; enforced in reducer after lazy cleanup |
| D-07 | Auto-delete CalendarEvents 90 days after endAt | Lazy cleanup via cleanupOldEvents; no scheduled reducer |
| D-08 | Edit/delete CalendarEvent: organizer or Admin only | Invitees only change their own InviteStatus |
| D-09 | Common availability computed client-side | No server-side view needed at 100-user scale |
| D-10 | Cap: 10 AvailabilitySlot rows per user | Configuration rows only; client expands recurrence |
| D-11 | Monthly clamps to last day of month client-side | dayOfMonth stores original target day |
| D-12 | Full CRUD on AvailabilitySlots | create/update (id.update())/delete |
| D-13 | All timestamps UTC | Consistent with rest of system |
| D-14 | Overlapping availability slots allowed | Advisory; no server-side overlap validation |
| D-15 | SavedCalendar: pure bookmark, 5-per-user cap | No approval gate; acts as subscription routing table |
| D-16 | isVisible on SavedCalendar | Frontend UI filter for decluttering; zero schema cost |
| D-17 | Auto-invite bracket participants on tournament-linked event creation | TO picks time, system populates invites |
| D-18 | Auto-invite players only (not coaches/referees) | Roles already tracked in tournament tables |
| D-19 | One CalendarEvent per bracketMatchId | Enforced via bracket_match_id btree; delete+recreate to reschedule |
| D-20 | Tournament-linked events: TO/Admin/Mod/Assistant permission | Same as tournament management access |
| D-21 | cancel_tournament cascades to CalendarEvents | Same transaction; calendar step before bracket match deletion |
| D-22 | rollback_bracket_match and dq_participant cascade to CalendarEvent | Match no longer happening; clean up scheduling |
| D-23 | User deletion cascades all calendar data | Bidirectional SavedCalendar cleanup (subscriber + target) |
| D-24 | withdraw_from_tournament removes player's tournament invites | Player not attending; invite row is stale |
| D-25 | Any authenticated user can create personal CalendarEvents | Tournament-linked requires D-20 permissions |
| D-26 | Optional description on CalendarEvent | Appended at end of column list for safe migration |
| D-27 | Auto-delete AvailabilitySlots 1 week after expiresAt | Lazy cleanup via cleanupExpiredSlots |
| D-28 | 6-month creation window for AvailabilitySlots | ExpiresAt defaults to 6 months from creation |

## Integration Points

- `docs/tournament/architecture.md` — BracketMatch, TournamentParticipant, TournamentTeam are FK targets
- `spacetimedb/src/helpers/tournamentHelpers.ts` — `cascadeCleanupTournament` extended with step 3 (D-21)
- `spacetimedb/src/helpers/userDeletionHelper.ts` — `performUserDeletion` extended with calendar data cascade (D-23)
- `spacetimedb/src/reducers/bracketAdvancement.ts` — `rollback_bracket_match` extended (D-22)
- `spacetimedb/src/reducers/tournamentAdmin.ts` — `dq_participant` extended (D-22)
- `spacetimedb/src/reducers/tournamentRegistration.ts` — `withdraw_from_tournament` extended (D-24)
