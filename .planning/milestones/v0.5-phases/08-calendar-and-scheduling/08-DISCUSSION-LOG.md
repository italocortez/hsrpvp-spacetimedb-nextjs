# Phase 8: Calendar and Scheduling - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 08-calendar-and-scheduling
**Areas discussed:** Invite response model, Common availability computation, Calendar sharing privacy, TO match scheduling

---

## Invite Response Model

| Option | Description | Selected |
|--------|-------------|----------|
| Status column | Add responseStatus: Pending / Accepted / Declined to CalendarEventInvite | |
| 4-state enum | InviteStatus: Pending / Accepted / Declined / Tentative (Google/Microsoft pattern) | ✓ |
| Existence + separate decline | Row exists = pending/accepted, decline deletes row + creates CalendarEventDecline record | |

**User's choice:** 4-state enum — matches Google Calendar and Microsoft Teams best practices.
**Notes:** User asked about how rejected users would know about rejection, and what best practices were. Research confirmed both Google and Microsoft keep the invite record with a status field.

### respondedAt Timestamp

| Option | Description | Selected |
|--------|-------------|----------|
| Add respondedAt timestamp | Track when invitee last changed response | ✓ |
| No extra tracking | Just status enum, lastModifiedDate covers it | |

### Event Deletion Cascade

| Option | Description | Selected |
|--------|-------------|----------|
| Cascade delete | Deleting CalendarEvent deletes all invites in same transaction | ✓ |
| Soft delete with status | CalendarEvent gets Cancelled status, invites persist | |

### Invitee Cap

| Option | Description | Selected |
|--------|-------------|----------|
| Cap at 9 | 6 players + 2 coaches + 1 referee | ✓ |
| Cap at 20 | Generous for community events | |
| No limit | Unlimited invites | |

**User's choice:** Cap at 9, matching the maximum match roster.
**Notes:** User specifically enumerated 6 players max, 2 coaches, 1 referee.

### Invite Role Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| No role tracking | Keep invites simple, roles tracked in tournament tables | ✓ |
| Optional role field | Add inviteRole: Player / Coach / Referee / null | |

## Event Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Everything public | All CalendarEvent data visible to all clients | ✓ |
| Visibility column | isPublic bool, tournament events auto-true | |
| Split public/private | Separate tables for public and private event details | |

**User's choice:** Everything public. Trusted 100-user gaming community.
**Notes:** User initially asked about busy/free masking but recognized it was purely cosmetic with no backend enforcement. Decided simplicity wins.

### Event Limits

**User's choice:** Cap at 40 active events per user (user specified 40).

### Event Cleanup

**User's choice:** Auto-delete events older than 90 days (user specified 90 days).

### Edit Permissions

| Option | Description | Selected |
|--------|-------------|----------|
| Organizer + Admin only | Only organizer/admin can edit/delete events | ✓ |
| Co-edit for accepted invitees | Accepted invitees can also edit | |

## Common Availability Computation

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side | Client subscribes to slots + events, computes overlap locally | ✓ |
| Server-side reducer | Reducer computes overlap, writes to temp table | |
| Server-side view | Pre-calculated overlap table | |

**User's choice:** Client-side. Zero server cost, real-time updates.
**Notes:** User confirmed that availability slots are advisory — events can be created at any time regardless of slot availability.

## Availability Slots

### Slot Cap
**User's choice:** 10 configuration rows per user. User initially confused about whether this meant 10 expanded instances vs 10 templates. Clarified that recurring slots are stored as one rule row, client expands. Cap is on rule rows.

### February Handling
| Option | Description | Selected |
|--------|-------------|----------|
| Clamp to last day | Day 31 → Feb 28/29 | ✓ |
| Skip months | Skip months without that day | |

### CRUD
| Option | Description | Selected |
|--------|-------------|----------|
| Full CRUD | Create, update (id.update()), delete | ✓ |
| Create/delete only | No editing, delete and recreate | |

### Timestamps
**Decision:** All UTC, frontend converts. Consistent with rest of system.

### Overlap Validation
| Option | Description | Selected |
|--------|-------------|----------|
| Allow overlaps | No server-side overlap validation | ✓ |
| Reject overlaps | Check for time conflicts | |

### Slot Cleanup
**User's choice:** Auto-delete 1 week after expiry (not 90 days like events). Availability is ephemeral data.

### Creation Window
**Decision:** Keep 6-month ahead window from architecture doc.

## Calendar Sharing (SavedCalendar)

| Option | Description | Selected |
|--------|-------------|----------|
| Pure bookmark | No approval, no privacy gate, 5-per-user cap | ✓ |
| Target user opt-in | calendarSharingEnabled flag | |
| Mutual consent | Request/accept flow | |

**Notes:** User asked about bandwidth impact — SavedCalendar acts as subscription routing table. Client reads saved userIds, subscribes to those users' AvailabilitySlot data only.

### isVisible Toggle
**Decision:** Keep it. Frontend UI filter for decluttering. Already in schema.
**Notes:** User asked what isVisible was for — explained it's like muting a saved calendar without removing the bookmark.

## TO Match Scheduling

### Auto-invite
| Option | Description | Selected |
|--------|-------------|----------|
| Auto-invite participants | Reducer reads bracket match teams and auto-creates invites | ✓ |
| Manual invites only | TO manually invites each player | |

**Notes:** User initially asked how the system would know the time — clarified that TO picks the time manually based on availability overlap, auto-invite just populates the invite list.

### Auto-invite Scope
| Option | Description | Selected |
|--------|-------------|----------|
| Players only | Only competing players auto-invited | ✓ |
| Players + coaches + referee | All match participants | |

### Match Uniqueness
| Option | Description | Selected |
|--------|-------------|----------|
| One event per match | Reject duplicate bracketMatchId | ✓ |
| Allow multiple | Primary + backup slots | |

### Permissions
**User's choice:** TO + Admin + Moderator + Tournament Assistants.

## Cleanup & Cascades

### Tournament Cancellation
| Option | Description | Selected |
|--------|-------------|----------|
| Cascade delete | Delete all linked CalendarEvents + invites | ✓ |
| Leave events | CalendarEvents persist as orphans | |

### Match Rollback/DQ
| Option | Description | Selected |
|--------|-------------|----------|
| Cascade delete | Delete linked CalendarEvent + invites | ✓ |
| Leave event | Event persists as historical record | |

### User Deletion
| Option | Description | Selected |
|--------|-------------|----------|
| Full cascade | Delete all calendar data (both directions) | ✓ |
| Partial cascade | Keep tournament-linked events | |

### Tournament Withdrawal
| Option | Description | Selected |
|--------|-------------|----------|
| Delete invites | Clean up withdrawn player's match invites | ✓ |
| Leave invites | Let withdrawn player manually decline | |

## Additional Fields

### User Event Creation
| Option | Description | Selected |
|--------|-------------|----------|
| Any user can create | Personal events open to all, tournament-linked events require permissions | ✓ |
| TO/Admin/Mod only | Only privileged roles create events | |

### Description Field
| Option | Description | Selected |
|--------|-------------|----------|
| Add description | Optional string for event notes | ✓ |
| Title only | Minimal schema | |

## Claude's Discretion

- Reducer file organization
- Helper function structure for cleanup logic
- Exact error messages for validation failures
- Whether to consolidate cleanup into a shared helper

## Deferred Ideas

- Notifications/reminders for upcoming events
- Server-side common availability computation
- Row-level privacy for personal events
- Auto-scheduling from overlap
