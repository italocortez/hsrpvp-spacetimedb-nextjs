---
status: resolved
trigger: "run_user_deletion hard-deletes User row, should soft-delete to preserve history table references"
created: 2026-03-28T00:00:00Z
updated: 2026-03-28T00:00:00Z
---

## Current Focus

hypothesis: run_user_deletion hard-deletes the User row, creating dangling userId references in 25+ tables
test: Traced the full cascade code and mapped every table with a userId/user reference column
expecting: Confirmed -- User row is fully removed; no soft-delete preservation exists
next_action: Present findings to user for scope assessment

## Symptoms

expected: Soft delete -- free the username so it can be reused, but preserve the display name / User row in some form so history tables (match results, tournament participation, achievements, etc.) can still reference it.
actual: run_user_deletion hard-deletes the User row, leaving dangling userId references across history tables.
errors: No runtime errors -- this is a data integrity concern.
reproduction: Call run_user_deletion reducer -- the User row is fully removed.
started: Known since Phase 8 discussion (2026-03-28 session log). Listed as outstanding item.

## Evidence

- timestamp: 2026-03-28
  checked: reducers/userDeletion.ts (run_user_deletion)
  found: |
    Current cascade is only 4 steps:
    1. Delete all UserIdentity rows (via user_id btree index)
    2. Delete all HsrAccountCharacter rows for each HsrAccount
    3. Delete all HsrAccount rows
    4. Hard-delete User row

    The docs (roster/architecture.md lines 138-148) describe 8 steps including
    AvailabilitySlot, SavedCalendar, CalendarEventInvite, CalendarEvent cascades
    (steps 4-7), but these are Phase 8 PLANNED additions -- not yet in code.
  implication: The code-vs-docs gap is expected (Phase 8 not executed yet). The core issue remains -- step 8 hard-deletes the User row.

- timestamp: 2026-03-28
  checked: reducers/admin.ts (admin_delete_row, User case)
  found: |
    The two-step deletion flow is:
    1. admin_delete_row sets deletedAt = ctx.timestamp (soft-delete flag)
    2. Schedules UserDeletionJob for 5 seconds later
    3. run_user_deletion fires and HARD-deletes everything

    The deletedAt field on User already exists and is used as a "pending deletion"
    indicator for client notification. The 5-second window allows clients to see
    the soft-delete before the row vanishes.
  implication: The soft-delete infrastructure (deletedAt column) already exists but is only used as a transient signal, not a permanent state.

- timestamp: 2026-03-28
  checked: reducers/server.ts (server_delete_user)
  found: |
    server_delete_user is a SEPARATE deletion path that bypasses the soft-delete
    entirely. It immediately hard-deletes UserIdentity rows + User row with NO
    cascade of HsrAccount, HsrAccountCharacter, or any other tables.
    This is the manage-user.ts script path -- even less cascade coverage.
  implication: Two deletion paths exist with different cascade scopes. Both hard-delete the User row.

- timestamp: 2026-03-28
  checked: helpers/finalizationHelpers.ts (lines 284, 321)
  found: |
    The match finalization code already handles missing User rows gracefully:
    - actorDisplayName: user ? user.displayName : `User#${step.actorUserId}`
    - displayName: pUser ? pUser.displayName : `User#${p.userId}`
    MatchParticipantHistory and MatchSessionStepHistory denormalize displayName
    at write time, so past match history is self-contained.
  implication: History tables that denormalize displayName at write time are already protected. The problem is tables that only store userId and need to JOIN to User at read time.

- timestamp: 2026-03-28
  checked: All 55 table definition files in spacetimedb/src/tables/
  found: Full inventory of every column referencing User.id (see table below)
  implication: 25 distinct tables have user-reference columns beyond just audit columns

## Eliminated

(none -- this is an investigation, not hypothesis testing)

## Resolution

root_cause: |
  run_user_deletion hard-deletes the User row after a 5-second soft-delete window.
  The deletedAt field exists but is only used as a transient "pending deletion" flag,
  not a permanent soft-delete state. Once the User row is gone, any table storing
  only a userId (without denormalized displayName) has a dangling reference.

fix: Not applied -- investigation only. See recommended approach below.

verification: N/A

files_changed: []

---

# Investigation Report: User Deletion Soft-Delete Scope

## 1. Current Deletion Behavior

### Path A: Admin deletion (admin_delete_row)
1. **Soft-delete:** Sets `User.deletedAt = ctx.timestamp` (5-second grace period for client notification)
2. **Schedule:** Inserts `UserDeletionJob` scheduled for 5 seconds later
3. **Hard-delete cascade** (run_user_deletion fires):
   - Delete all `UserIdentity` rows
   - Delete all `HsrAccountCharacter` rows (per HsrAccount)
   - Delete all `HsrAccount` rows
   - **Hard-delete `User` row** (the problematic step)

### Path B: Server script deletion (server_delete_user)
1. Immediate hard-delete of `UserIdentity` rows
2. Immediate hard-delete of `User` row
3. **No cascade** of HsrAccount, HsrAccountCharacter, or anything else

### Missing from both paths (Phase 8 planned but not implemented):
- AvailabilitySlot cascade
- SavedCalendar cascade (both directions)
- CalendarEventInvite cascade (as invitee)
- CalendarEvent cascade (as organizer + their invites)
- HsrAccountLightcone cascade (descoped from Phase 2, still missing)

## 2. Complete Table Inventory

### Category A: Already Cascade-Deleted (safe)

| Table | Column | Deleted By |
|-------|--------|-----------|
| UserIdentity | userId | run_user_deletion |
| HsrAccountCharacter | (via HsrAccount) | run_user_deletion |
| HsrAccount | userId | run_user_deletion |

### Category B: Active-State Tables (SHOULD be cascade-deleted)

These represent ephemeral/active state. If a user is deleted, their active participation should be cleaned up.

| Table | Column(s) | Notes |
|-------|-----------|-------|
| LobbyMember | userId | Active lobby membership -- admin_delete_row blocks deletion if user has active matches, but should cascade-clean stale memberships |
| Lobby | hostUserId | admin_delete_row blocks if user hosts active lobby -- but closed lobbies may linger |
| MatchSessionStep | actorUserId | Active draft steps -- lobby cleanup should handle |
| LobbyCursorEvent | senderUserId | Ephemeral event table (auto-deletes) -- no concern |
| ChatMessage | senderUserId | Active lobby chat -- tied to lobby lifecycle |
| AvailabilitySlot | userId | Phase 8 planned cascade -- not yet implemented |
| SavedCalendar | userId, targetUserId | Phase 8 planned cascade -- not yet implemented |
| CalendarEventInvite | inviteeUserId | Phase 8 planned cascade -- not yet implemented |
| CalendarEvent | organizerId | Phase 8 planned cascade -- not yet implemented |
| TournamentTeamRequest | userId | Transactional (row-as-state) -- should cascade |
| TournamentAssistant | userId | Active tournament role -- should cascade |
| TournamentPlayerAccount | userId | Active tournament account binding -- should cascade |
| MmrRating | userId | Current rating -- debatable (see below) |
| CostSet | creatorId | Creator attribution -- debatable |

### Category C: History/Record Tables (MUST NOT be deleted -- these are the dangling FK risk)

| Table | Column(s) | Denormalized displayName? | Impact if User Row Gone |
|-------|-----------|--------------------------|------------------------|
| MatchParticipantHistory | userId | YES (displayName column) | LOW -- displayName preserved at write time |
| MatchSessionStepHistory | actorUserId | YES (actorDisplayName column) | LOW -- displayName preserved at write time |
| MmrHistory | userId | NO | HIGH -- cannot display "who gained/lost MMR" |
| PlayerStat | userId | NO | HIGH -- cannot display player stats |
| PlayerCharacterStat (characterStats) | userId | NO | HIGH -- cannot display per-character stats |
| PlayerRelationship | userId, otherUserId | NO | HIGH -- cannot display head-to-head records |
| Leaderboard | userId | NO | HIGH -- leaderboard shows ghost entries |
| MatchResultRecord | winnerUserId, refereeUserId, disputedByUserId | NO | MEDIUM -- cannot display match result attribution |
| MatchResultParticipant | userId | NO | HIGH -- cannot display match result participants |
| MatchResultGame | validatedByUserId | NO | LOW -- optional field, admin attribution |
| TournamentParticipant | userId | NO | HIGH -- cannot display tournament brackets/results |
| Tournament | organizerId | NO | MEDIUM -- cannot display tournament organizer |
| TournamentTeam | captainUserId | NO | MEDIUM -- cannot display team captain |
| UserAchievement | userId, awardedById | NO | HIGH -- cannot display achievement holders |
| GroupStanding | (via teamId, not userId) | N/A | No direct userId -- no concern |

### Category D: Audit Columns (every table)

Every table has `createdById` and `lastModifiedById` referencing User.id. These are present in all 55 tables.

| Impact | Assessment |
|--------|-----------|
| If User deleted | Audit trail shows orphan IDs but these are internal metadata, not user-facing |
| Risk level | LOW -- audit columns are for admin debugging, not display |
| Recommendation | Accept orphan audit IDs (industry standard practice) |

## 3. Dangling FK Inventory Summary

| Risk Level | Count | Tables |
|------------|-------|--------|
| HIGH (user-facing display breaks) | 8 | MmrHistory, PlayerStat, PlayerCharacterStat, PlayerRelationship, Leaderboard, MatchResultParticipant, TournamentParticipant, UserAchievement |
| MEDIUM (admin/attribution display breaks) | 3 | MatchResultRecord (3 optional userId columns), Tournament (organizerId), TournamentTeam (captainUserId) |
| LOW (already denormalized or internal) | 3 | MatchParticipantHistory, MatchSessionStepHistory, MatchResultGame |
| Audit-only (all tables) | 55 | createdById, lastModifiedById on every table |

## 4. What Breaks Without the User Row?

### Frontend display scenarios that fail:
1. **Leaderboard page** -- Shows "rank #5: ???" instead of player name
2. **Match history detail** -- MmrHistory entries reference userId but no name to display
3. **Player profile/stats** -- PlayerStat, PlayerCharacterStat reference a gone userId
4. **Tournament brackets** -- TournamentParticipant entries show blank names
5. **Achievement showcase** -- UserAchievement rows reference nonexistent user
6. **Head-to-head records** -- PlayerRelationship entries become meaningless

### What already works despite deletion:
1. **Match replay** -- MatchParticipantHistory and MatchSessionStepHistory denormalize displayName at write time (fallback: `User#${id}`)
2. **Lobby cursor events** -- Ephemeral, auto-deleted
3. **Audit trails** -- Internal only, orphan IDs acceptable

## 5. Recommended Approach: Soft-Delete Design

### Option A: Keep User Row with isDeleted Flag (Recommended)

**Schema change to User table:**
- Add `isDeleted: t.bool()` (or reuse `deletedAt` as permanent marker)
- On deletion: null out `username` (frees it for reuse), set `isDeleted = true`
- Keep `displayName` intact for history lookups
- Keep `id` intact so all foreign keys still resolve

**Reducer changes:**
- `run_user_deletion`: Instead of `ctx.db.User.id.delete(arg.userId)`, update to set `isDeleted = true`, `username = null` (or a tombstone like `deleted_<id>`)
- All auth/login reducers: Filter out `isDeleted` users
- `admin_delete_row`: Already sets `deletedAt` -- just stop scheduling the hard-delete, or change the scheduled reducer to soft-delete instead of hard-delete
- `server_delete_user`: Same treatment -- soft-delete instead of hard-delete

**Client changes:**
- Any User subscription/query needs `WHERE isDeleted = false` filter (or handle display of deleted users gracefully)
- Profile pages for deleted users show "Deleted User" with preserved displayName

**Advantages:**
- Zero FK breakage -- all history tables still JOIN correctly
- Username freed for reuse (the main user-facing reason to "delete")
- DisplayName preserved for all historical contexts
- Minimal schema change (1 boolean column or reuse existing deletedAt)

**Disadvantages:**
- User rows accumulate forever (but at 100-user scale this is negligible)
- Every user query needs `isDeleted` filter (but SpacetimeDB subscription filters handle this)

### Option B: Denormalize displayName into All History Tables

Copy the displayName into every history/stat table at write time, then allow hard-delete of User.

**Disadvantages:**
- Massive schema change (add displayName column to 11+ tables)
- Data duplication and inconsistency risk
- Still doesn't solve the "who is userId #42?" question for future queries
- NOT RECOMMENDED

### Option C: Tombstone User Row

Replace User row content with a minimal tombstone: `{ id, displayName: "[Deleted User]", isDeleted: true, ... }`.

**Disadvantages:**
- Loses the actual display name (cannot show "PlayerX won this match" in history)
- Simpler but less useful than Option A

## 6. Scope Estimate

### If implementing Option A (recommended):

| Area | Changes | Effort |
|------|---------|--------|
| **User table schema** | Add `isDeleted` bool (or formalize `deletedAt` as permanent) | Trivial |
| **run_user_deletion reducer** | Change hard-delete to soft-delete (null username, set flag) | Small |
| **server_delete_user reducer** | Same soft-delete treatment | Small |
| **admin_delete_row reducer** | Minor -- may simplify (no need for 5s scheduled job if soft-delete is permanent) | Small |
| **Auth helpers** | `getAuthenticatedUser` must reject `isDeleted` users | Small |
| **Login reducers** | `login_as_guest`, `server_link_discord` must check `isDeleted` | Small |
| **Username unique constraint** | Need to handle null/tombstone username + unique index | Medium -- SpacetimeDB may not support nullable unique indexes; may need `deleted_<id>` sentinel |
| **Client subscriptions** | Filter deleted users from active user lists | Small |
| **Cascade cleanup** | Still need to cascade-delete active-state tables (Category B) | Medium (already planned for multiple phases) |
| **Tests** | UAT for deletion + history preservation | Medium |

**Overall scope: MEDIUM** -- Touches ~6-8 files, but each change is small. The hardest part is the username unique constraint handling.

### Does this need a full GSD phase?

**No.** This is a targeted cross-cutting fix, not a new feature. It can be:
- A standalone task within an existing phase execution (e.g., when Phase 8 execution adds the calendar cascade, also fix the soft-delete)
- Or a small dedicated task (~2-3 hours of implementation + testing)

It does NOT require new tables, new reducers, or new frontend features. It's a behavior change to existing reducers + 1 schema column.

## 7. Secondary Finding: server_delete_user Has No Cascade

The `server_delete_user` reducer (used by manage-user.ts script) only deletes UserIdentity + User. It does NOT cascade:
- HsrAccount
- HsrAccountCharacter
- HsrAccountLightcone
- Any active-state tables (lobby, tournament, calendar)

This leaves orphan data in the database. When the soft-delete fix is implemented, `server_delete_user` should be updated to use the same soft-delete logic as the admin path.

## 8. Secondary Finding: Phase 8 Cascade Not Yet in Code

The `run_user_deletion` code only has 4 cascade steps. The docs describe 8 steps (adding AvailabilitySlot, SavedCalendar, CalendarEventInvite, CalendarEvent). These Phase 8 additions are documented but not implemented -- expected since Phase 8 hasn't been executed yet. When Phase 8 is executed, the cascade steps should be added AND the soft-delete change should be applied simultaneously.
