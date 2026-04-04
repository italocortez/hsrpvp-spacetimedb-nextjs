# Tournament System

Architecture documentation for the tournament system feature domain.

---

## Table Relationships

```
Tournament (PK: id autoInc)
├── TournamentEnrolled (PK: [tournamentId, userId])   [Phase 10.1 — split from TournamentParticipant]
│   └── hsrAccountId? → HsrAccount.id
├── TournamentTeamMember (PK: [teamId, userId])       [Phase 10.1 — split from TournamentParticipant]
│   ├── tournamentId → Tournament.id (+ by_tournament_and_user btree index)
│   └── teamId → TournamentTeam.id
├── TournamentAssistant (PK: [tournamentId, userId])
├── TournamentTeam (PK: id autoInc)
│   └── TournamentTeamRequest (PK: [teamId, userId])
└── BracketMatch (FK: tournamentId) [Phase 4]
```

**Role Hierarchy:**
```
Admin (100) > Moderator (75) > TournamentHost (50) > User (25) > Guest (0)
```

---

## Tournament Lifecycle

```
Draft → Registration → [CheckIn →] Seeding → InProgress → Completed
  └────────────────────────────────────────────────────→ Cancelled
```

- **Forward-only:** Stages can only advance, never go back
- **Manual advancement:** Tournament organizer (or Moderator+) must call `advance_tournament_stage` explicitly
- **CheckIn stage:** Optional, controlled by `Tournament.checkInEnabled`. If enabled, Registration → CheckIn → Seeding. If disabled, Registration → Seeding directly.
- **Cancellation:** Allowed from any non-terminal state. Cascade-deletes all infrastructure rows (see Cancellation Cascade below)
- **Terminal states:** Completed and Cancelled — cannot transition further

### Stage Descriptions

| Stage | Description |
|-------|-------------|
| Draft | Tournament is being configured, not yet open to players |
| Registration | Players can register; organizer can still edit settings |
| CheckIn | Players check in to confirm attendance (optional stage) |
| Seeding | Registration closed; bracket/seed assignment in progress |
| InProgress | Tournament is running; all enrolled players set to Active status |
| Completed | Tournament has ended |
| Cancelled | Tournament was cancelled before completion |

### ParticipantStatus Lifecycle (Phase 10.1 — D-35 through D-41)

| Status | When Set | Meaning |
|--------|----------|---------|
| Registered | On enrollment | Player registered, not yet checked in |
| CheckedIn | `check_in_tournament` called | Player confirmed attendance |
| Withdrawn | `withdraw_from_tournament` | Player voluntarily left |
| Disqualified | `dq_participant` | Player removed by TO/admin |
| Active | Tournament advances to InProgress | All checked-in (or registered) players become Active |
| Eliminated | Final bracket loss | Single elim: any loss; double elim: losers bracket loss |

Status fields are **informational only** — no reducer gating on these values. Existing permission checks already gate behavior.

### Cancellation Cascade

When `cancel_tournament` is called, `cascadeCleanupTournament()` deletes all tournament infrastructure rows. The tournament row itself is preserved with stage=Cancelled.

| Table | Action | Reason |
|-------|--------|--------|
| TournamentTeamRequest | **Deleted** | Transactional rows, no audit value |
| CalendarEvent + CalendarEventInvite | **Deleted** | Events linked to bracket matches + all their invites (Phase 8, D-21) |
| Lobby (shelved/active) | **Deleted** | `hardDeleteLobby` called for each lobby linked via `Lobby.bracketMatchId` (Phase 10.1, D-18) |
| GroupPhaseRecord | **Deleted** | Bracket infrastructure |
| BracketMatch | **Deleted** | Bracket infrastructure |
| TournamentPlayerAccount | **Deleted** | Locked roster snapshots, no value after cancellation |
| TournamentTeamMember | **Deleted** | Team assignment rows |
| TournamentTeam | **Deleted** | Ephemeral per-tournament teams |
| TournamentAssistant | **Deleted** | Staff assignments, no value after cancellation |
| TournamentEnrolled | **Preserved** | Audit trail — who registered, who withdrew |
| MatchResultRecord | **Preserved** | Player-facing match history |
| Tournament | **Preserved** | Stage set to Cancelled; row serves as historical record |

Deletion order: requests → calendar events → shelved lobbies → standings → bracket → accounts → team members → teams → assistants (calendar before bracket — reads BracketMatch rows to find linked events).

### Stage Transition Cleanup

| Transition | Cleanup |
|---|---|
| Registration → Seeding | `cleanupTeamRequests()` — deletes all pending team join requests |
| CheckIn → Seeding | Auto-removes participants who did not check in |
| Any → Cancelled | `cascadeCleanupTournament()` — full cascade (see table above) |

---

## Reducer Reference

| Reducer | File | Permission | Description |
|---------|------|-----------|-------------|
| `create_tournament` | tournamentManagement.ts | TournamentHost+ | Create tournament in Draft stage |
| `update_tournament` | tournamentManagement.ts | TO/Assistant/Mod+ | Update settings (Draft/Registration only) |
| `advance_tournament_stage` | tournamentManagement.ts | TO/Assistant/Mod+ | Forward-only stage transition |
| `cancel_tournament` | tournamentManagement.ts | TO/Assistant/Mod+ | Cancel from any non-terminal state; cascade-deletes infrastructure rows |
| `register_for_tournament` | tournamentRegistration.ts | Authenticated | Register (no team param — enrollment and team assignment decoupled per D-20) |
| `check_in_tournament` | tournamentRegistration.ts | Authenticated | Check in during CheckIn stage (D-36) |
| `withdraw_from_tournament` | tournamentRegistration.ts | Authenticated | Withdraw (Registration/Seeding/CheckIn only); handles captain-transfer, cleans up TournamentTeamMember, requests, and locked accounts |
| `approve_participant` | tournamentRegistration.ts | TO/Assistant/Mod+ | Approve a pending participant |
| `waitlist_promote` | tournamentRegistration.ts | TO/Assistant/Mod+ | Promote from waitlist to active |
| `create_tournament_team` | tournamentTeams.ts | Authenticated | Create team (captain role), must be registered; inserts TournamentTeamMember for captain |
| `request_join_team` | tournamentTeams.ts | Authenticated | Submit join request to a team |
| `accept_team_request` | tournamentTeams.ts | Team Captain | Accept join request; inserts TournamentTeamMember; cleans up user's other pending requests |
| `reject_team_request` | tournamentTeams.ts | Team Captain | Reject and delete a join request |
| `leave_tournament_team` | tournamentTeams.ts | Authenticated | Leave team (non-captain only); deletes TournamentTeamMember row |
| `disband_tournament_team` | tournamentTeams.ts | Team Captain | Disband team; deletes all TournamentTeamMember rows, pending requests, and team row |
| `transfer_referee` | refereeManagement.ts | Current Referee | Transfer referee flag to another lobby member |
| `reclaim_referee` | refereeManagement.ts | Lobby Host | Reclaim referee flag from current holder |
| `confirm_match_scores` | matchResultSubmission.ts | Match Participant | Confirm team's scores |
| `submit_match_result` | matchResultSubmission.ts | Referee/Mod/Admin | Submit match result (requires both teams confirmed; winnerId=0 for draw) |
| `dispute_match_result` | matchResultSubmission.ts | Match Participant | Dispute submitted result (once per match) |
| `dq_participant` | tournamentAdmin.ts | TO/Assistant/Mod/Admin | Disqualify tournament participant; handles captain-transfer (D-21, D-25, D-26) |
| `override_match_result` | tournamentAdmin.ts | TO/Mod/Admin | Override match result status; winnerTeamSideTag ('Blue'/'Red'/'' for draw) |
| `assign_tournament_assistant` | tournamentAdmin.ts | Organizer/Mod/Admin | Assign or update tournament assistant permissions |
| `remove_tournament_assistant` | tournamentAdmin.ts | Organizer/Mod/Admin | Remove tournament assistant |
| `mod_promote_to_host` | tournamentAdmin.ts | Moderator/Admin | Promote User role to TournamentHost |
| `mod_demote_from_host` | tournamentAdmin.ts | Moderator/Admin | Demote TournamentHost role to User |
| `generate_bracket` | bracketGeneration.ts | TO/Assistant/Mod/Admin | Generate bracket for all 5 formats |
| `seed_bracket` | bracketGeneration.ts | TO/Assistant/Mod/Admin | Assign seedNumber to TournamentTeams |
| `swap_seeds` | bracketGeneration.ts | TO/Assistant/Mod/Admin | Swap seedNumber between two teams |
| `advance_bracket_match` | bracketAdvancement.ts | TO/Assistant/Mod/Admin | Place winner in next match slot; route loser (double elim) |
| `submit_and_advance_bracket` | bracketAdvancement.ts | Authenticated | Map winnerTeamSide → winnerTeamId, set BracketMatch.winnerTeamId, auto-advance if enabled |
| `rollback_bracket_match` | bracketAdvancement.ts | TO/Assistant/Mod/Admin | Reverse bracket advancement one step (blocked if MMR processed) |
| `advance_to_next_game` | seriesManagement.ts | Host/TO/Assistant/Mod/Admin; Referee if refereeControlsShelving=true | Advance lobby from BetweenGames to next game in a best-of series (D-07) |
| `shelve_series` | seriesManagement.ts | Host/TO/Assistant/Mod/Admin; Referee if refereeControlsShelving=true | Shelve a lobby between games (sets stage to Shelved) (D-07) |
| `resume_series` | seriesManagement.ts | Host/TO/Assistant/Mod/Admin; Referee if refereeControlsShelving=true | Resume a shelved lobby (transitions from Shelved back to active) (D-07) |
| `server_set_mmr` | server.ts | Server identity | Upsert MmrRating row for a user (test/admin utility) |

### TO/Assistant/Mod+ Access

Tournament management operations (update, advance stage, cancel, approve, waitlist promote) require one of:
- The tournament's `organizerId` (the TO who created it)
- A `TournamentAssistant` row with matching `[tournamentId, userId]`
- `Moderator` or `Admin` role (role level 75+)

This is enforced by `ensureTournamentAccess()` in `helpers/tournamentHelpers.ts`.

---

## Registration Requirements

When a player calls `register_for_tournament`, the following validations run in order:

1. **Tournament stage** — Must be `Registration` or `Seeding`
2. **Duplicate check** — Cannot register twice (composite PK lookup)
3. **requireVerified** — If `true`, guest accounts are rejected
4. **requireRoster** — If `true`, player must have at least one active HSR account
5. **minimumMmr** — MMR check deferred to Phase 5 (not yet enforced)
6. **Capacity check** — Counts non-waitlisted participants vs `maxParticipants`
   - If full and `waitlistEnabled = true`: insert with `isWaitlisted = true`
   - If full and `waitlistEnabled = false`: throw "Tournament is full"
7. **requireApproval** — If `true`, sets `approvedByToAt = undefined` (TO must approve later)
   - If `false`: auto-approves by setting `approvedByToAt = ctx.timestamp`
8. **Solo auto-team** — For `teamSize=1` tournaments, auto-creates `TournamentTeam` + `TournamentTeamMember` on enrollment

### Withdrawal

- `withdraw_from_tournament` marks status as `Withdrawn` but does NOT delete the TournamentEnrolled row
- This preserves audit history and allows TOs to see who registered and left
- Withdrawal is only allowed in `Registration`, `CheckIn`, or `Seeding` stage
- During `InProgress`, only a TO can disqualify a participant

Withdrawal cleanup (in order):
1. **Captain-transfer** — if the withdrawing user captains a team, `transferTournamentCaptain()` transfers captaincy to next team member (D-22). If no other member, team is disbanded.
2. **TournamentTeamMember row deleted** — non-captain withdrawal removes just their membership row (D-23)
3. **Team request cleanup** — deletes all pending TournamentTeamRequest rows from this user to any team in the tournament
4. **Enrollment status** — TournamentEnrolled.status set to Withdrawn
5. **Locked accounts** — all TournamentPlayerAccount rows for this user+tournament deleted

### DQ Flow (Phase 10.1 — D-21, D-25, D-26)

`dq_participant` handles three cases:

1. **Captain DQ** — Transfer captain flag to next team member (D-21). Team survives.
2. **Last member DQ** — Team destroyed; auto-advance opponent on any active bracket match (D-27).
3. **DQ during active lobby** (Drafting/Equipping/Scoring) — Kick DQ'd player from lobby. If last member: force-concede match (D-25).
4. **DQ during Shelved/BetweenGames lobby** — Remove TournamentTeamMember row. Captain DQ: transfer captain. If last member: hard-delete the shelved lobby (D-26).

---

## Tournament-Scoped Teams

Tournament teams (`TournamentTeam`) are ephemeral and scoped per tournament. They differ from persistent organization-level `Team` objects:

| Property | TournamentTeam | Team (org-level) |
|----------|---------------|-----------------|
| Scope | One tournament only | Persistent across time |
| Captain | Any registered player | Owner role in TeamMember |
| Lifecycle | Disbanded when tournament ends | Persists until owner deletes |
| Purpose | Group participants for bracket | Organization, recruitment |

### TournamentEnrolled + TournamentTeamMember (Phase 10.1 — D-20)

`TournamentParticipant` was split into two tables to decouple enrollment from team assignment:

**TournamentEnrolled** (PK: [tournamentId, userId]):
- Registration record: status, isWaitlisted, approvedByToAt, anonymousAlias, allowRandomTeamAssignment, hsrAccountId, audit cols
- No team reference — enrollment and team assignment are fully decoupled

**TournamentTeamMember** (PK: [teamId, userId]):
- Team assignment link
- Contains `tournamentId` column + `by_tournament_and_user` btree index for direct per-tournament membership queries
- Created on team creation (captain) or `accept_team_request`; deleted on `leave_tournament_team`, `disband_tournament_team`, or withdrawal

### Team Formation Flow

```
1. Player calls register_for_tournament → TournamentEnrolled row inserted
   (no team assignment at registration time)

2. Player calls create_tournament_team → TournamentTeam row inserted
   → TournamentTeamMember row inserted for captain

3. Player calls request_join_team → TournamentTeamRequest inserted (transactional — row exists = pending)

4. Captain calls accept_team_request → request row deleted
   → Player's other pending requests in this tournament also deleted
   → TournamentTeamMember row inserted for joiner

   OR

4. Captain calls reject_team_request → request row deleted

5. Non-captain: leave_tournament_team → TournamentTeamMember row deleted
   Captain: disband_tournament_team → ALL TournamentTeamMember rows deleted, all requests deleted, team deleted
```

### Constraints

- Teams can only be created, joined, and disbanded during `Registration` stage
- Captain cannot leave their own team (they must disband it)
- Team size enforced by `tournament.teamSize` — `accept_team_request` checks current member count
- Solo tournaments (`teamSize = 1`) auto-create team on registration (no explicit team management needed)

---

## CostSet Integration

Each tournament can reference a published `CostSet` via `costSetId`:

- `costSetId = 0` → uses the default/global cost set
- `costSetId > 0` → must reference an existing, published CostSet (`isPublished = true`)

This allows TOs to configure custom character/lightcone costs for their tournament without affecting other tournaments or the global defaults.

---

## Data Patterns

### Composite PK Updates (delete + insert)

`TournamentEnrolled` and `TournamentTeamRequest` have composite primary keys. SpacetimeDB does not support in-place updates for composite PK rows, so all updates use the delete + re-insert pattern:

```typescript
ctx.db.TournamentEnrolled.delete(enrolled);
ctx.db.TournamentEnrolled.insert({
    ...enrolled,
    status: { tag: 'Withdrawn', value: {} } as any,
    ...auditUpdate(ctx, enrolled, user.id),
} as any);
```

When upserting, preserve audit fields: if existing row present, use `auditUpdate`; if new, use `auditInsert`.

### Audit Columns

Every table in this domain follows the standard audit pattern:
- `createdById` / `createdDate` — set on insert, never modified
- `lastModifiedById` / `lastModifiedDate` — updated on every write

---

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)

---

## TournamentPlayerAccount (Phase 6 execution — D-21)

Junction table that locks which HSR accounts a player will use in a tournament. Created at registration time.

| Column | Type | Description |
|--------|------|-------------|
| tournamentId | u32 | FK to Tournament.id |
| userId | u32 | FK to User.id |
| hsrAccountId | u32 | FK to HsrAccount.id |

PK: [tournamentId, userId, hsrAccountId]

During tournament matches, pick validation checks against registered accounts (TournamentPlayerAccount), not whatever account is currently active. This prevents mid-tournament account switching for competitive integrity.

### requireOwnership Inheritance (Phase 6 — D-19)

Tournament lobbies inherit `requireOwnership` from `tournament.requireRoster`:
- `requireRoster=true` → lobby `requireOwnership=true` (draft picks validated against HsrAccountCharacter)
- `requireRoster=false` → lobby `requireOwnership=false` (any character allowed)

These are separate concepts: `requireRoster` gates signup eligibility, `requireOwnership` gates draft enforcement.

---

## Bracket Generation (Phase 4)

After Registration closes and Seeding begins:
1. `seed_bracket(tournamentId, 'mmr'|'random')` assigns seed numbers to teams
2. `swap_seeds(tournamentId, teamId1, teamId2)` allows manual seed adjustment
3. `generate_bracket(tournamentId)` creates BracketMatch rows with FK wiring
4. TO advances to InProgress (guards verify bracket exists)

New Tournament columns (Phase 4):
- `groupSize: u8` -- target group size for round-robin (min 3)
- `has3rdPlaceMatch: bool` -- enables 3rd place consolation match
- `autoAdvanceBracket: bool` -- auto-advance winner on result confirmation

Stage transition guards:
- Registration -> Seeding: requires 2+ active participants (2+ complete teams for team tournaments)
- Seeding -> InProgress: requires BracketMatch rows to exist, first-round matches to have participants
