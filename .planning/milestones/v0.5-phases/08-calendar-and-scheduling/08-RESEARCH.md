# Phase 8: Calendar and Scheduling - Research

**Researched:** 2026-03-28
**Domain:** SpacetimeDB backend reducers -- calendar, scheduling, availability, event invites, cross-feature cascades
**Confidence:** HIGH

## Summary

Phase 8 implements the calendar and scheduling feature on top of 4 existing skeleton tables (AvailabilitySlot, SavedCalendar, CalendarEvent, CalendarEventInvite). The tables are already imported into `schema.ts` (lines 63-67, 167-171) and registered. The work is purely reducer and helper code -- no new table definitions needed, though 3 schema modifications are required (adding `description` to CalendarEvent, adding `inviteStatus` + `respondedAt` to CalendarEventInvite, and adding the `InviteStatus` enum).

The phase has two distinct workstreams: (1) standalone calendar CRUD reducers (availability slots, saved calendars, events, invites) and (2) cross-feature cascade extensions to 5 existing reducers (cancel_tournament, rollback_bracket_match, dq_participant, withdraw_from_tournament, UserDeletionJob). Both workstreams follow well-established patterns already present in the codebase.

The hard-delete cascade bug referenced in the Phase 8 context has been fixed (commit 0062b0b). The user deletion system now uses soft-delete for users with history references, preserving FK integrity. Calendar cascade deletions operate on calendar-specific rows (not the User row itself), so they are straightforward delete operations within the existing transaction.

**Primary recommendation:** Split into 2 plans: (1) schema modifications + standalone calendar reducers, (2) cross-feature cascade extensions. Schema changes are additive (new enum, new columns at end of tables), so no `--clear-database` is needed.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: Add InviteStatus enum (Pending | Accepted | Declined | Tentative) to CalendarEventInvite. Row persists across all states -- organizer sees full attendee picture.
- D-02: Add respondedAt timestamp to CalendarEventInvite for response timing.
- D-03: Cascade delete -- deleting a CalendarEvent deletes all its CalendarEventInvite rows in the same transaction.
- D-04: Cap at 9 invitees per event (6 players + 2 coaches + 1 referee). No role tracking on invites.
- D-05: All CalendarEvent data fully public. No busy/free masking.
- D-06: Cap at 40 active CalendarEvents per user.
- D-07: Auto-delete CalendarEvents older than 90 days (+ cascade invites). Triggered lazily when any calendar reducer runs.
- D-08: Only organizer or admin can edit/delete CalendarEvents. Invitees can only change their own InviteStatus.
- D-09: Common availability computed client-side from AvailabilitySlot + CalendarEvent subscriptions.
- D-10: Cap at 10 AvailabilitySlot configuration rows per user.
- D-11: Monthly recurrence clamps to last day of month. Client-side expansion handles this. RecurrenceRule.dayOfMonth stores the original target day.
- D-12: Full CRUD on AvailabilitySlots -- create, update (id.update()), delete.
- D-13: All timestamps UTC -- consistent with the rest of the system.
- D-14: Overlapping availability slots allowed. No server-side overlap validation.
- D-15: SavedCalendar is a pure bookmark -- no approval, no privacy gate. CRUD (create/delete) with 5-per-user cap.
- D-16: Keep isVisible on SavedCalendar -- frontend UI filter.
- D-17: When creating a CalendarEvent with bracketMatchId, auto-invite all match participants (BracketMatch -> TournamentTeam -> TournamentParticipant).
- D-18: Auto-invite players only from bracket match. Coaches and referees added manually.
- D-19: One CalendarEvent per bracketMatchId -- reducer rejects duplicates. Delete and recreate to reschedule.
- D-20: Tournament-linked CalendarEvents can be created by TO, Admin, Moderator, or Tournament Assistants.
- D-21: Tournament cancellation cascades to all linked CalendarEvents + their invites.
- D-22: Bracket match rollback and DQ cascade-delete linked CalendarEvents + invites.
- D-23: User deletion cascades all calendar data.
- D-24: Tournament withdrawal deletes the player's CalendarEventInvite rows for that tournament's scheduled matches.
- D-25: Any authenticated user can create personal CalendarEvents. Tournament-linked events require TO/Admin/Mod/Assistant permissions.
- D-26: Add optional description (string) to CalendarEvent for event notes.
- D-27: Auto-delete AvailabilitySlots 1 week after expiry. Same lazy cleanup pattern as D-07.
- D-28: 6-month creation window for AvailabilitySlots. ExpiresAt auto-set to 6 months from creation if not explicitly provided.

### Claude's Discretion
- Reducer file organization (new file vs extending existing)
- Helper function structure for cleanup logic
- Exact error messages for validation failures
- Whether to consolidate cleanup into a shared helper or keep inline per reducer

### Deferred Ideas (OUT OF SCOPE)
- Notifications/reminders for upcoming events
- Server-side common availability computation
- Row-level privacy for personal events
- Auto-scheduling (system picks time from overlap)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAL-01 | Player can set recurring availability slots (daily, weekly, monthly with Feb edge case handling) | AvailabilitySlot table exists with RecurrenceRule struct. Reducers: create/update/delete_availability_slot. Cap=10, 6-month window (D-10/D-28). Feb clamping is client-side (D-11). |
| CAL-02 | Player can view up to 5 other players' calendars with toggleable visibility | SavedCalendar table exists with composite PK [userId, targetUserId]. Reducers: save_calendar, unsave_calendar, toggle_calendar_visibility. Cap=5 (D-15/D-16). |
| CAL-03 | Auto-sync feature finds common availability windows between selected players | Computed client-side (D-09). No server reducer needed. Client reads AvailabilitySlot data via subscriptions routed through SavedCalendar entries. |
| CAL-04 | Player can create calendar events and invite other players | CalendarEvent + CalendarEventInvite tables exist. Schema additions needed: description column (D-26), InviteStatus enum + respondedAt (D-01/D-02). Reducers: create/update/delete_calendar_event, respond_to_invite, invite_to_event, remove_invite. Cap=40 events, 9 invitees (D-06/D-04). |
| CAL-05 | Tournament organizers can use calendar for match scheduling and send invites | create_calendar_event with bracketMatchId triggers auto-invite via BracketMatch -> TournamentTeam -> TournamentParticipant chain (D-17). Permission: ensureTournamentAccess (D-20). One event per match (D-19). Cross-feature cascades: cancel_tournament (D-21), rollback/DQ (D-22), withdraw (D-24), user deletion (D-23). |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spacetimedb/server | 2.1.0 | SpacetimeDB server SDK -- table definitions, reducers, SenderError | Project standard, already installed |
| spacetimedb | 2.1.0 | SpacetimeDB shared types (Timestamp) | Project standard, already installed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | (existing) | Unit test framework | Calendar unit tests for helper logic |

No new dependencies required. All work uses the existing SpacetimeDB SDK and project helpers.

## Architecture Patterns

### Recommended File Organization

```
spacetimedb/src/
  types/
    enums.ts                    # ADD InviteStatus enum
  tables/
    calendarEvent.ts            # MODIFY: add description column
    calendarEventInvite.ts      # MODIFY: add inviteStatus + respondedAt columns
  reducers/
    calendarAvailability.ts     # NEW: create/update/delete_availability_slot
    calendarEvents.ts           # NEW: create/update/delete_calendar_event, invite_to_event, remove_invite
    calendarSaved.ts            # NEW: save_calendar, unsave_calendar, toggle_calendar_visibility
    calendarInviteResponse.ts   # NEW: respond_to_invite
  helpers/
    calendarCleanup.ts          # NEW: shared lazy cleanup helpers (D-07, D-27)
    calendarCascade.ts          # NEW: cascade deletion helpers for cross-feature use
  index.ts                      # MODIFY: export new reducers
```

**Rationale for file split:** Calendar has 4 distinct concerns (availability, events, saved calendars, invite responses). Grouping by concern keeps files focused. The cleanup helper consolidates lazy deletion logic (D-07, D-27) to avoid duplication across reducers.

**Alternative (fewer files):** Combine all calendar reducers into one `calendarManagement.ts` file. Tradeoff: simpler structure but 300+ lines in a single file. Given 12+ reducers, the split is preferred.

### Pattern 1: Schema Modifications (Additive Columns)

**What:** Adding new columns to existing published tables.
**When to use:** D-26 (description on CalendarEvent), D-01/D-02 (inviteStatus + respondedAt on CalendarEventInvite).
**Key rule:** New columns MUST be added at the END of the column definition. They MUST have defaults or be optional. This avoids `--clear-database`.

```typescript
// CalendarEvent -- add description at end (before audit columns won't work;
// add AFTER lastModifiedDate since audit columns are already at the end)
// IMPORTANT: Actually, adding between existing columns requires --clear-database.
// description must be optional and added at the end.
export const calendarEventColumns = {
    id: t.u32().primaryKey().autoInc(),
    organizerId: t.u32(),
    title: t.string(),
    description: t.string().optional(),  // NEW (D-26)
    startAt: t.timestamp(),
    endAt: t.timestamp(),
    bracketMatchId: t.u32().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
```

**CRITICAL FINDING:** Adding `description` between `title` and `startAt` is a column insertion in the MIDDLE of an existing table. This requires `--clear-database`. The same applies to adding `inviteStatus` and `respondedAt` to CalendarEventInvite between existing columns.

**Options:**
1. Add new columns at the VERY END (after lastModifiedDate) -- safe, no `--clear-database`
2. Add in logical position -- requires `--clear-database`

Since these are skeleton tables with no production data yet (Phase 8 is greenfield), either approach works. The planner should decide based on whether a `--clear-database` publish is acceptable.

**Recommendation:** Add columns at the very end of each table definition (after audit columns) to avoid needing `--clear-database`. The column position in the definition does not affect query or code usability -- only the physical storage layout.

### Pattern 2: Lazy Cleanup (D-07, D-27)

**What:** Piggyback expired-data cleanup on regular reducer calls.
**When to use:** Deterministic cleanup without timers (reducers must be deterministic -- no `setInterval`, no `setTimeout`).
**Model:** Similar to how `accountRating.ts` recomputes on roster changes.

```typescript
// calendarCleanup.ts
export function cleanupExpiredSlots(ctx: any, userId: number): void {
    const slots = [...ctx.db.AvailabilitySlot.user_id.filter(userId)];
    const oneWeekAgoMicros = ctx.timestamp.microsSinceUnixEpoch - BigInt(7 * 24 * 60 * 60) * BigInt(1_000_000);
    for (const slot of slots) {
        const expiryMicros = slot.expiresAt.microsSinceUnixEpoch;
        if (expiryMicros + BigInt(7 * 24 * 60 * 60) * BigInt(1_000_000) < ctx.timestamp.microsSinceUnixEpoch) {
            ctx.db.AvailabilitySlot.id.delete(slot.id);
        }
    }
}

export function cleanupOldEvents(ctx: any, userId: number): void {
    const events = [...ctx.db.CalendarEvent.organizer_id.filter(userId)];
    const ninetyDaysAgoMicros = ctx.timestamp.microsSinceUnixEpoch - BigInt(90 * 24 * 60 * 60) * BigInt(1_000_000);
    for (const event of events) {
        if (event.endAt.microsSinceUnixEpoch < ninetyDaysAgoMicros) {
            // Cascade delete invites first
            const invites = [...ctx.db.CalendarEventInvite.event_id.filter(event.id)];
            for (const invite of invites) {
                ctx.db.CalendarEventInvite.delete(invite);
            }
            ctx.db.CalendarEvent.id.delete(event.id);
        }
    }
}
```

**Key consideration:** Lazy cleanup runs in the same transaction as the calling reducer. At the current scale (~100 users, max 10 slots + 40 events per user), iterating a user's rows is trivial. No performance concern.

### Pattern 3: Auto-Invite Resolution Chain (D-17)

**What:** When creating a tournament-linked CalendarEvent, automatically resolve match participants and create invite rows.
**Resolution chain:** `BracketMatch.id` -> `BracketMatch.team1Id/team2Id` -> `TournamentParticipant.tournament_id.filter(tournamentId)` with `teamGroupId === teamId`.

```typescript
function autoInviteMatchParticipants(ctx: any, bracketMatch: any, eventId: number, actorId: number): number {
    const participantUserIds: number[] = [];

    // Resolve both teams' players
    for (const teamId of [bracketMatch.team1Id, bracketMatch.team2Id]) {
        if (!teamId) continue;
        const participants = [...ctx.db.TournamentParticipant.tournament_id.filter(bracketMatch.tournamentId)]
            .filter((p: any) => p.teamGroupId === teamId && p.status.tag !== 'Withdrawn' && p.status.tag !== 'Disqualified');
        for (const p of participants) {
            participantUserIds.push(p.userId);
        }
    }

    // Create invite rows
    for (const userId of participantUserIds) {
        ctx.db.CalendarEventInvite.insert({
            eventId,
            inviteeUserId: userId,
            inviteStatus: { tag: 'Pending', value: {} } as any,
            respondedAt: undefined,
            ...auditInsert(ctx, actorId),
        } as any);
    }

    return participantUserIds.length;
}
```

**Important:** D-18 says auto-invite players only (not coaches). The `TournamentParticipant` table does not have a coach flag -- coaches are tracked via `set_coach` on `LobbyMember`. Tournament participants are all players. This means filtering by status (not withdrawn/DQ'd) is sufficient.

### Pattern 4: Cross-Feature Cascade Helpers (D-21 through D-24)

**What:** Shared helper functions for deleting calendar data from existing reducers.
**When to use:** Extending cancel_tournament, rollback_bracket_match, dq_participant, withdraw_from_tournament, UserDeletionJob.

```typescript
// calendarCascade.ts

/** Delete a CalendarEvent and all its invites (D-03) */
export function deleteCalendarEventWithInvites(ctx: any, eventId: number): void {
    const invites = [...ctx.db.CalendarEventInvite.event_id.filter(eventId)];
    for (const invite of invites) {
        ctx.db.CalendarEventInvite.delete(invite);
    }
    ctx.db.CalendarEvent.id.delete(eventId);
}

/** Delete all CalendarEvents linked to a bracket match (D-22) */
export function deleteCalendarEventForBracketMatch(ctx: any, bracketMatchId: number): void {
    // No btree index on bracketMatchId -- must scan by organizer or iter
    // Since bracketMatchId is optional, need to find events that link to this match
    const allEvents = [...ctx.db.CalendarEvent.iter()];
    for (const event of allEvents) {
        if (event.bracketMatchId === bracketMatchId) {
            deleteCalendarEventWithInvites(ctx, event.id);
        }
    }
}

/** Delete all tournament-linked CalendarEvents for a tournament (D-21) */
export function deleteCalendarEventsForTournament(ctx: any, tournamentId: number): void {
    const bracketMatches = [...ctx.db.BracketMatch.tournament_id.filter(tournamentId)];
    for (const match of bracketMatches) {
        deleteCalendarEventForBracketMatch(ctx, match.id);
    }
}

/** Delete a user's CalendarEventInvites for a tournament's scheduled matches (D-24) */
export function deleteUserInvitesForTournament(ctx: any, userId: number, tournamentId: number): void {
    const bracketMatches = [...ctx.db.BracketMatch.tournament_id.filter(tournamentId)];
    const bracketMatchIds = new Set(bracketMatches.map((m: any) => m.id));

    const userInvites = [...ctx.db.CalendarEventInvite.invitee_user_id.filter(userId)];
    for (const invite of userInvites) {
        const event = ctx.db.CalendarEvent.id.find(invite.eventId);
        if (event && event.bracketMatchId && bracketMatchIds.has(event.bracketMatchId)) {
            ctx.db.CalendarEventInvite.delete(invite);
        }
    }
}
```

**Note on `iter()` usage:** `deleteCalendarEventForBracketMatch` uses `iter()` on CalendarEvent because there is no btree index on `bracketMatchId`. At the scale of this project (max 40 events per user, maybe a few hundred total), this is acceptable. Adding a btree index on `bracketMatchId` would be an optimization if needed, but it only applies to the subset of events that have `bracketMatchId` set. The planner may choose to add this index.

**Index consideration:** Adding `{ accessor: 'bracket_match_id', algorithm: 'btree', columns: ['bracketMatchId'] }` to CalendarEvent would make D-19 (duplicate check) and D-21/D-22 (cascade lookup) more efficient. This is an optional optimization the planner can include in schema modifications.

### Pattern 5: Composite PK Update (SavedCalendar, CalendarEventInvite)

**What:** Tables with composite primary keys use delete+insert for updates (no `id.update()`).
**Established pattern:** Used throughout the codebase (TournamentParticipant, GroupStanding, etc.).

```typescript
// toggle_calendar_visibility -- composite PK update
const existing = [...ctx.db.SavedCalendar.by_user_and_target.filter([userId, targetUserId])][0];
if (!existing) throw new SenderError("Calendar not saved.");
ctx.db.SavedCalendar.delete(existing);
ctx.db.SavedCalendar.insert({
    ...existing,
    isVisible,
    ...auditUpdate(ctx, existing, userId),
} as any);
```

### Anti-Patterns to Avoid
- **Using `ctx.db.CalendarEvent.bracketMatchId.find()` without an index:** bracketMatchId is optional, not a PK. Use `iter()` or add a btree index.
- **Returning data from reducers:** Reducers are fire-and-forget. Common availability is computed client-side, not returned from a reducer.
- **Using timers for cleanup:** Reducers must be deterministic. No `setTimeout` or `setInterval`. Use lazy cleanup triggered by reducer calls.
- **Modifying CalendarEvent.bracketMatchId after creation:** D-19 says delete and recreate to reschedule. bracketMatchId should be treated as immutable.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Permission checks | Custom role checks | `getAuthenticatedUser()`, `ensureAdmin()`, `ensureTournamentAccess()` from helpers | Established patterns handle all role levels consistently |
| Audit columns | Manual timestamp/actor assignment | `auditInsert(ctx, userId)`, `auditUpdate(ctx, existing, userId)` | Single source of truth for audit patterns |
| Tournament access verification | Inline role/organizer/assistant checks | `ensureTournamentAccess(ctx, tournamentId)` | Already handles Admin/Mod/TO/Assistant chain |
| Timestamp arithmetic | Manual BigInt calculations | Define constants for common durations (ONE_WEEK_MICROS, NINETY_DAYS_MICROS) | Avoids repeated error-prone BigInt math |

**Key insight:** This phase is almost entirely "glue code" connecting existing patterns. Every reducer follows the same structure: auth check -> validation -> cap check -> lazy cleanup -> insert/update/delete -> audit columns. No novel algorithms needed.

## Common Pitfalls

### Pitfall 1: Column Insertion Position Causes --clear-database
**What goes wrong:** Adding a column in the middle of an existing table definition requires `--clear-database`, destroying all data.
**Why it happens:** SpacetimeDB's schema migration detects column position changes as breaking changes.
**How to avoid:** Add new columns at the END of the column definition (after audit columns), or accept `--clear-database` for skeleton tables. For this phase, the calendar tables have no production data, so either approach is safe.
**Warning signs:** `spacetime publish` fails with a schema migration error.

### Pitfall 2: BigInt Timestamp Comparison
**What goes wrong:** Comparing timestamps using JavaScript `number` type loses precision. `ctx.timestamp.microsSinceUnixEpoch` returns a `BigInt`.
**Why it happens:** JavaScript numbers lose precision above 2^53. Timestamps in microseconds are well within this range in practice, but the SDK returns BigInt for consistency.
**How to avoid:** Always use `BigInt` arithmetic: `BigInt(90 * 24 * 60 * 60) * BigInt(1_000_000)` for 90 days in microseconds.
**Warning signs:** Silent wrong comparisons where events are not cleaned up or are cleaned up too early.

### Pitfall 3: Missing Cascade on CalendarEvent Deletion
**What goes wrong:** Deleting a CalendarEvent without first deleting its CalendarEventInvite rows leaves orphaned invite rows.
**Why it happens:** SpacetimeDB has no FK constraints -- cascading is manual.
**How to avoid:** Always delete CalendarEventInvite rows BEFORE deleting CalendarEvent. Encapsulate in `deleteCalendarEventWithInvites()` helper.
**Warning signs:** Orphaned CalendarEventInvite rows with eventId pointing to deleted events.

### Pitfall 4: iter() on CalendarEvent for bracketMatchId Lookup
**What goes wrong:** Without a btree index on `bracketMatchId`, finding events for a bracket match requires full table scan via `iter()`.
**Why it happens:** `bracketMatchId` is optional and not indexed in the current schema.
**How to avoid:** Either (a) add a btree index on bracketMatchId, or (b) use a different lookup strategy (e.g., scan tournament's bracket matches, then look up events per match). At current scale, `iter()` is acceptable but should be documented.
**Warning signs:** Slow cascade operations on tournament cancellation if many events exist.

### Pitfall 5: Invitee Count Validation Must Include Auto-Invites
**What goes wrong:** When creating a tournament-linked event with manual invitees, the total count (auto + manual) exceeds the 9-invitee cap.
**Why it happens:** Auto-invites are created first, then manual invites are added without checking the combined total.
**How to avoid:** Count auto-invited participants first, then validate `autoCount + manualCount <= 9` before inserting any manual invite rows.
**Warning signs:** Events with 10+ invitees despite the 9-invitee cap.

### Pitfall 6: SavedCalendar Bidirectional Deletion on User Delete
**What goes wrong:** When deleting a user, only their owned SavedCalendar rows are removed, but other users' SavedCalendar rows targeting the deleted user remain.
**Why it happens:** SavedCalendar has a composite PK [userId, targetUserId]. Deletion must clean both directions.
**How to avoid:** D-23 explicitly requires deleting both `userId = deletedUser` AND `targetUserId = deletedUser`. Use both `user_id.filter(userId)` and iterate to find targetUserId matches.
**Warning signs:** SavedCalendar rows pointing to deleted users.

**Note on targetUserId lookup:** SavedCalendar has no btree index on `targetUserId` alone. For user deletion, iterate all SavedCalendar rows for the user (small set, max 5 per user), plus scan for rows where targetUserId matches. At 100-user scale with max 5 saved calendars each, this is at most 500 rows total -- acceptable for `iter()`. Alternatively, add a btree index on `targetUserId` to the table definition.

## Code Examples

### Example 1: AvailabilitySlot Reducer with Lazy Cleanup

```typescript
// Source: Follows established patterns from roster.ts, achievementManagement.ts
import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser } from '../helpers/ensurePermissions';
import { auditInsert } from '../helpers/auditColumns';
import { cleanupExpiredSlots } from '../helpers/calendarCleanup';

const SIX_MONTHS_MICROS = BigInt(180 * 24 * 60 * 60) * BigInt(1_000_000);
const MAX_AVAILABILITY_SLOTS = 10;

export const create_availability_slot = spacetimedb.reducer(
    {
        startAt: t.string(),     // BigInt microseconds as string
        endAt: t.string(),
        isRecurring: t.bool(),
        recurrenceType: t.string(),  // "Daily" | "Weekly" | "Monthly" or ""
        interval: t.u8(),
        dayOfWeek: t.u8(),       // 0-6 or 255 sentinel for "not set"
        dayOfMonth: t.u8(),      // 1-31 or 0 sentinel for "not set"
        endDate: t.string(),     // BigInt microseconds as string or "" for default
    },
    (ctx, { startAt, endAt, isRecurring, recurrenceType, interval, dayOfWeek, dayOfMonth, endDate }) => {
        const user = getAuthenticatedUser(ctx);
        if (user.isGuest) throw new SenderError("Guests cannot create availability slots.");

        const parsedStartAt = BigInt(startAt);
        const parsedEndAt = BigInt(endAt);
        if (parsedStartAt >= parsedEndAt) throw new SenderError("Start time must be before end time.");

        // 6-month window check (D-28)
        const sixMonthsFromNow = ctx.timestamp.microsSinceUnixEpoch + SIX_MONTHS_MICROS;
        if (parsedStartAt > sixMonthsFromNow) {
            throw new SenderError("Cannot create availability more than 6 months in the future.");
        }

        // Lazy cleanup (D-27)
        cleanupExpiredSlots(ctx, user.id);

        // Cap check (D-10)
        const existingSlots = [...ctx.db.AvailabilitySlot.user_id.filter(user.id)];
        if (existingSlots.length >= MAX_AVAILABILITY_SLOTS) {
            throw new SenderError("Maximum of 10 availability slots reached.");
        }

        // Recurrence validation
        if (isRecurring && !recurrenceType) {
            throw new SenderError("Recurrence type is required for recurring slots.");
        }

        // Calculate expiresAt (D-28)
        let expiresAtMicros: bigint;
        if (isRecurring) {
            expiresAtMicros = endDate ? BigInt(endDate) : (ctx.timestamp.microsSinceUnixEpoch + SIX_MONTHS_MICROS);
        } else {
            expiresAtMicros = parsedEndAt;
        }

        ctx.db.AvailabilitySlot.insert({
            id: 0,  // autoInc
            userId: user.id,
            startAt: { microsSinceUnixEpoch: parsedStartAt },
            endAt: { microsSinceUnixEpoch: parsedEndAt },
            isRecurring,
            recurrenceRule: isRecurring ? {
                recurrenceType: { tag: recurrenceType, value: {} } as any,
                interval: interval || 1,
                dayOfWeek: dayOfWeek !== 255 ? dayOfWeek : undefined,
                dayOfMonth: dayOfMonth !== 0 ? dayOfMonth : undefined,
                endDate: endDate ? { microsSinceUnixEpoch: BigInt(endDate) } : undefined,
            } : {
                recurrenceType: { tag: 'Daily', value: {} } as any,
                interval: 0,
                dayOfWeek: undefined,
                dayOfMonth: undefined,
                endDate: undefined,
            },
            expiresAt: { microsSinceUnixEpoch: expiresAtMicros },
            ...auditInsert(ctx, user.id),
        } as any);
    }
);
```

**Note on RecurrenceRule for non-recurring slots:** The RecurrenceRule struct is required on the table (not optional). For non-recurring slots, insert a "zero" RecurrenceRule with interval=0. The planner may decide to make `recurrenceRule` optional in the schema modification if a `--clear-database` is acceptable, or use the zero-value pattern shown above.

### Example 2: Cross-Feature Cascade Extension

```typescript
// In tournamentHelpers.ts -- extend cascadeCleanupTournament
import { deleteCalendarEventsForTournament } from './calendarCascade';

export function cascadeCleanupTournament(ctx: any, tournamentId: number): void {
    // ... existing cleanup (requests, standings, bracket, accounts, teams, assistants) ...

    // Calendar cascade (D-21) -- delete tournament-linked CalendarEvents + invites
    deleteCalendarEventsForTournament(ctx, tournamentId);
}
```

### Example 3: Composite PK InviteStatus Update

```typescript
// respond_to_invite -- composite PK delete+insert pattern
const invite = [...ctx.db.CalendarEventInvite.by_event_and_invitee.filter([eventId, user.id])][0];
if (!invite) throw new SenderError(`You have no invite for event #${eventId}.`);

if (status === 'Pending') throw new SenderError("Cannot respond with Pending status.");

ctx.db.CalendarEventInvite.delete(invite);
ctx.db.CalendarEventInvite.insert({
    ...invite,
    inviteStatus: { tag: status, value: {} } as any,
    respondedAt: ctx.timestamp,
    ...auditUpdate(ctx, invite, user.id),
} as any);
```

## Schema Modification Details

### CalendarEvent: Add description Column (D-26)

**Current columns (in order):** id, organizerId, title, startAt, endAt, bracketMatchId, createdById, createdDate, lastModifiedById, lastModifiedDate

**Safe addition (no --clear-database):** Add `description: t.string().optional()` AFTER lastModifiedDate.

**Logical addition (requires --clear-database):** Add `description` between `title` and `startAt`.

### CalendarEventInvite: Add inviteStatus + respondedAt (D-01, D-02)

**Current columns (in order):** eventId, inviteeUserId, createdById, createdDate, lastModifiedById, lastModifiedDate

**Safe addition (no --clear-database):** Add both after lastModifiedDate.

**Logical addition (requires --clear-database):** Add between inviteeUserId and createdById.

### InviteStatus Enum (D-01)

Add to `spacetimedb/src/types/enums.ts`:

```typescript
export const InviteStatus = t.enum('InviteStatus', {
    Pending: t.unit(),
    Accepted: t.unit(),
    Declined: t.unit(),
    Tentative: t.unit(),
});
```

### RecurrenceRule Struct Optionality

**Current:** `recurrenceRule: RecurrenceRule` (required) on AvailabilitySlot.
**Issue:** Non-recurring slots must still provide a RecurrenceRule value. Two approaches:
1. Use a "zero" RecurrenceRule with interval=0 as sentinel (no schema change)
2. Make it optional: `recurrenceRule: RecurrenceRule.optional()` -- but this may require `--clear-database` if SpacetimeDB does not support making a required field optional in a migration

**Recommendation:** Use zero-value sentinel to avoid schema change risk. The contract already documents that `isRecurring=false` means recurrenceRule is meaningless.

### Optional bracketMatchId Index

Adding `{ accessor: 'bracket_match_id', algorithm: 'btree', columns: ['bracketMatchId'] }` to CalendarEvent would optimize D-19 (duplicate check) and cascade lookups (D-21, D-22). Adding an index is a safe schema change (no `--clear-database`).

## Reducer Inventory

Based on the contract.md, these are all reducers needed:

| Reducer | File | Permission | Key Logic |
|---------|------|------------|-----------|
| `create_availability_slot` | calendarAvailability.ts | Authenticated, non-guest | Cap=10, lazy cleanup, 6mo window |
| `update_availability_slot` | calendarAvailability.ts | Owner only | id.update(), preserve unchanged |
| `delete_availability_slot` | calendarAvailability.ts | Owner or Admin | Simple delete |
| `save_calendar` | calendarSaved.ts | Authenticated, non-guest | Cap=5, no self-save, target exists |
| `unsave_calendar` | calendarSaved.ts | Owner only | Composite PK delete |
| `toggle_calendar_visibility` | calendarSaved.ts | Owner only | Composite PK delete+insert |
| `create_calendar_event` | calendarEvents.ts | Auth user (personal) or TournamentAccess (linked) | Cap=40, auto-invite, lazy cleanup |
| `update_calendar_event` | calendarEvents.ts | Organizer or Admin | id.update(), validate startAt < endAt |
| `delete_calendar_event` | calendarEvents.ts | Organizer or Admin | Cascade-delete invites first |
| `respond_to_invite` | calendarInviteResponse.ts | Invitee only | Composite PK delete+insert, set respondedAt |
| `invite_to_event` | calendarEvents.ts | Organizer or Admin | Cap=9 total, user exists check |
| `remove_invite` | calendarEvents.ts | Organizer or Admin | Composite PK delete |

**Total: 12 new reducers + 5 cascade extensions to existing reducers.**

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| isAccepted bool on invite | InviteStatus enum (4 states) | Phase 8 D-01 | Architecture doc showed bool; now uses enum with Tentative state |
| No event description | Optional description column | Phase 8 D-26 | Minor schema addition |
| No lazy cleanup | Lazy cleanup on reducer call | Phase 8 D-07/D-27 | Deterministic alternative to scheduled jobs |

**Deprecated/outdated:**
- The architecture doc (`docs/calendar/architecture.md`) still shows `isAccepted?` on CalendarEventInvite. This needs to be updated to reflect the InviteStatus enum pattern from D-01.

## Open Questions

1. **Column insertion position vs --clear-database**
   - What we know: Adding columns in the middle of a table requires `--clear-database`. Adding at the end is safe.
   - What's unclear: Does the user prefer logical column ordering (requires `--clear-database`) or safe addition at end?
   - Recommendation: Add at end. Calendar tables are skeleton-only with no production data, but `--clear-database` also wipes all other tables' data. Unless a `--clear-database` is needed for another reason, the safe approach preserves existing data from Phases 1-7.

2. **Reducer parameter types for timestamps**
   - What we know: Existing reducers use `t.string()` for timestamp parameters (see `create_tournament`'s `scheduledStartAt`), then parse with `BigInt()`.
   - What's unclear: Whether the SpacetimeDB SDK supports `t.timestamp()` as a reducer parameter type directly.
   - Recommendation: Follow the established `t.string()` + `BigInt()` pattern used in `tournamentManagement.ts`.

3. **RecurrenceRule for non-recurring slots**
   - What we know: The struct is required on the table. Non-recurring slots need some value.
   - What's unclear: Whether the SpacetimeDB SDK allows a struct field to be made optional in a migration.
   - Recommendation: Use zero-value sentinel (interval=0, recurrenceType='Daily') for non-recurring slots. No schema change needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | `test/vitest.config.ts` (unit), `test/vitest.integration.config.ts` (integration) |
| Quick run command | `npx vitest run --config test/vitest.config.ts` |
| Full suite command | `npx vitest run --config test/vitest.integration.config.ts` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CAL-01 | Create/update/delete availability slots with recurrence | integration | `npx vitest run --config test/vitest.integration.config.ts test/backend/calendar/calendar-availability.test.ts` | Wave 0 |
| CAL-02 | Save/unsave/toggle calendars with cap enforcement | integration | `npx vitest run --config test/vitest.integration.config.ts test/backend/calendar/calendar-saved.test.ts` | Wave 0 |
| CAL-03 | Common availability computed client-side | manual-only | N/A | N/A (client logic, no server test) |
| CAL-04 | Create events with invites, respond, cap enforcement | integration | `npx vitest run --config test/vitest.integration.config.ts test/backend/calendar/calendar-events.test.ts` | Wave 0 |
| CAL-05 | Tournament-linked events, auto-invite, cascades | integration | `npx vitest run --config test/vitest.integration.config.ts test/backend/calendar/calendar-tournament.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --config test/vitest.config.ts` (unit tests, <5s)
- **Per wave merge:** `npx vitest run --config test/vitest.integration.config.ts` (full integration suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/backend/calendar/calendar-availability.test.ts` -- covers CAL-01
- [ ] `test/backend/calendar/calendar-saved.test.ts` -- covers CAL-02
- [ ] `test/backend/calendar/calendar-events.test.ts` -- covers CAL-04
- [ ] `test/backend/calendar/calendar-tournament.test.ts` -- covers CAL-05
- [ ] Framework install: None needed -- Vitest already configured

**Note:** Integration tests require a published module on maincloud and WebSocket connections. Test files should follow the patterns in `test/backend/achievements/` and use shared fixtures from `test/shared/`.

## Project Constraints (from CLAUDE.md)

- **Do NOT auto-commit code changes.** Leave all file changes unstaged for user review.
- **Load spacetimedb skill** before any backend code work.
- **Reducers are transactional** -- no return values, no timers, no random.
- **All timestamps UTC** -- consistent with the rest of the system.
- **Update architecture docs** (`docs/calendar/architecture.md`) whenever backend code changes.
- **Never modify behavior specs** (`docs/calendar/contract.md`) during execution -- update after execution with provenance tags.
- **Energy budget matters** -- calendar tables are public and contribute to subscription load. At 100 users with max 10 slots + 40 events each, this is ~1000 slots + 4000 events total -- small.
- **Audit columns on every table** -- enforced, use `auditInsert`/`auditUpdate` helpers.
- **Make smallest change necessary** -- no unrelated file modifications.
- **Index accessors** use snake_case; table/reducer names use conventions from SKILL.md.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `spacetimedb/src/tables/availabilitySlot.ts`, `savedCalendar.ts`, `calendarEvent.ts`, `calendarEventInvite.ts` -- current schema definitions
- Existing codebase: `spacetimedb/src/types/enums.ts`, `structs.ts` -- RecurrenceType, RecurrenceRule already defined
- Existing codebase: `spacetimedb/src/helpers/ensurePermissions.ts`, `tournamentHelpers.ts`, `auditColumns.ts` -- reusable patterns
- Existing codebase: `spacetimedb/src/reducers/tournamentManagement.ts` -- cancel_tournament cascade pattern
- Existing codebase: `spacetimedb/src/reducers/bracketAdvancement.ts` -- rollback_bracket_match pattern
- Existing codebase: `spacetimedb/src/reducers/tournamentRegistration.ts` -- withdraw_from_tournament pattern
- Existing codebase: `spacetimedb/src/helpers/userDeletionHelper.ts` -- UserDeletionJob cascade pattern
- `docs/calendar/architecture.md` -- existing calendar architecture documentation
- `docs/calendar/contract.md` -- full behavior spec with all reducers, flows, and acceptance scenarios
- `.claude/skills/spacetimedb/SKILL.md` -- SpacetimeDB SDK patterns, naming conventions, schema change rules

### Secondary (MEDIUM confidence)
- SpacetimeDB schema migration behavior (adding columns at end is safe, in middle requires --clear-database) -- verified from SKILL.md "Dangerous schema changes" section

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing patterns
- Architecture: HIGH -- all 4 tables already exist, contract fully specifies all 12 reducers + 5 cascade extensions
- Pitfalls: HIGH -- all identified from codebase analysis and established project patterns
- Schema modifications: MEDIUM -- column insertion position rules verified from SKILL.md, but exact behavior of optional struct fields in migrations not tested

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable domain, no external dependencies)
