# Tournament System

Architecture documentation for the tournament system feature domain.

---

## Table Relationships

```
Tournament (PK: id autoInc)
├── TournamentParticipant (PK: [tournamentId, userId])
│   └── teamGroupId → TournamentTeam.id
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
Draft → Registration → Seeding → InProgress → Completed
  └────────────────────────────────────────→ Cancelled
```

- **Forward-only:** Stages can only advance, never go back
- **Manual advancement:** Tournament organizer (or Moderator+) must call `advance_tournament_stage` explicitly
- **Cancellation:** Allowed from any non-terminal state (Draft, Registration, Seeding, InProgress)
- **Terminal states:** Completed and Cancelled — cannot transition further

### Stage Descriptions

| Stage | Description |
|-------|-------------|
| Draft | Tournament is being configured, not yet open to players |
| Registration | Players can register; organizer can still edit settings |
| Seeding | Registration closed; bracket/seed assignment in progress |
| InProgress | Tournament is running; bracket matches being played |
| Completed | Tournament has ended |
| Cancelled | Tournament was cancelled before completion |

---

## Reducer Reference

| Reducer | File | Permission | Description |
|---------|------|-----------|-------------|
| `create_tournament` | tournamentManagement.ts | TournamentHost+ | Create tournament in Draft stage |
| `update_tournament` | tournamentManagement.ts | TO/Assistant/Mod+ | Update settings (Draft/Registration only) |
| `advance_tournament_stage` | tournamentManagement.ts | TO/Assistant/Mod+ | Forward-only stage transition |
| `cancel_tournament` | tournamentManagement.ts | TO/Assistant/Mod+ | Cancel from any non-terminal state |
| `register_for_tournament` | tournamentRegistration.ts | Authenticated | Register with full requirement validation |
| `withdraw_from_tournament` | tournamentRegistration.ts | Authenticated | Withdraw (Registration/Seeding only) |
| `approve_participant` | tournamentRegistration.ts | TO/Assistant/Mod+ | Approve a pending participant |
| `waitlist_promote` | tournamentRegistration.ts | TO/Assistant/Mod+ | Promote from waitlist to active |
| `create_tournament_team` | tournamentTeams.ts | Authenticated | Create team (captain role), must be registered |
| `request_join_team` | tournamentTeams.ts | Authenticated | Submit join request to a team |
| `accept_team_request` | tournamentTeams.ts | Team Captain | Accept a pending join request |
| `reject_team_request` | tournamentTeams.ts | Team Captain | Reject and delete a join request |
| `leave_tournament_team` | tournamentTeams.ts | Authenticated | Leave team (non-captain only) |
| `disband_tournament_team` | tournamentTeams.ts | Team Captain | Disband team, reset all members |
| `transfer_referee` | refereeManagement.ts | Current Referee | Transfer referee flag to another lobby member |
| `reclaim_referee` | refereeManagement.ts | Lobby Host | Reclaim referee flag from current holder |
| `set_coach` | refereeManagement.ts | Lobby Host or Referee | Set isCoach=true on a lobby member |
| `remove_coach` | refereeManagement.ts | Lobby Host or Referee | Set isCoach=false on a lobby member |
| `confirm_match_scores` | matchResultSubmission.ts | Match Participant | Confirm team's scores |
| `submit_match_result` | matchResultSubmission.ts | Referee/Mod/Admin | Submit match result (requires both teams confirmed) |
| `dispute_match_result` | matchResultSubmission.ts | Match Participant | Dispute submitted result (once per match) |
| `dq_participant` | tournamentAdmin.ts | TO/Assistant/Mod/Admin | Disqualify tournament participant |
| `override_match_result` | tournamentAdmin.ts | TO/Mod/Admin | Override match result status (Validated or Rejected) |
| `assign_tournament_assistant` | tournamentAdmin.ts | Organizer/Mod/Admin | Assign or update tournament assistant permissions |
| `remove_tournament_assistant` | tournamentAdmin.ts | Organizer/Mod/Admin | Remove tournament assistant |
| `mod_promote_to_host` | tournamentAdmin.ts | Moderator/Admin | Promote User role to TournamentHost |
| `mod_demote_from_host` | tournamentAdmin.ts | Moderator/Admin | Demote TournamentHost role to User |
| `generate_bracket` | bracketGeneration.ts | TO/Assistant/Mod/Admin | Generate bracket for all 5 formats |
| `seed_bracket` | bracketGeneration.ts | TO/Assistant/Mod/Admin | Assign seedNumber to TournamentTeams |
| `swap_seeds` | bracketGeneration.ts | TO/Assistant/Mod/Admin | Swap seedNumber between two teams |
| `advance_bracket_match` | bracketAdvancement.ts | TO/Assistant/Mod/Admin | Place winner in next match slot; route loser (double elim) |
| `submit_and_advance_bracket` | bracketAdvancement.ts | Authenticated | Map userId winner -> teamId, set BracketMatch.winnerId, auto-advance if enabled |
| `rollback_bracket_match` | bracketAdvancement.ts | TO/Assistant/Mod/Admin | Reverse bracket advancement one step (blocked if MMR processed) |
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
6. **Team validation** — If `teamGroupId != 0`, validates team exists and has room
7. **Capacity check** — Counts non-waitlisted participants vs `maxParticipants`
   - If full and `waitlistEnabled = true`: insert with `isWaitlisted = true`
   - If full and `waitlistEnabled = false`: throw "Tournament is full"
8. **requireApproval** — If `true`, sets `approvedByToAt = undefined` (TO must approve later)
   - If `false`: auto-approves by setting `approvedByToAt = ctx.timestamp`

### Withdrawal

- `withdraw_from_tournament` marks status as `Withdrawn` but does NOT delete the row
- This preserves audit history and allows TOs to see who registered and left
- Withdrawal is only allowed in `Registration` or `Seeding` stage
- During `InProgress`, only a TO can disqualify a participant

---

## Tournament-Scoped Teams

Tournament teams (`TournamentTeam`) are ephemeral and scoped per tournament. They differ from persistent organization-level `Team` objects:

| Property | TournamentTeam | Team (org-level) |
|----------|---------------|-----------------|
| Scope | One tournament only | Persistent across time |
| Captain | Any registered player | Owner role in TeamMember |
| Lifecycle | Disbanded when tournament ends | Persists until owner deletes |
| Purpose | Group participants for bracket | Organization, recruitment |

### Team Formation Flow

```
1. Captain calls create_tournament_team → TournamentTeam row inserted
   → Captain's TournamentParticipant updated to teamGroupId=newTeamId, type=Team

2. Player calls request_join_team → TournamentTeamRequest inserted (transactional — row exists = pending)

3. Captain calls accept_team_request → request row deleted
   → Player's TournamentParticipant updated to teamGroupId=teamId, type=Team

   OR

3. Captain calls reject_team_request → request row deleted

4. Non-captain: leave_tournament_team → participant.teamGroupId=undefined, type=Individual
   Captain: disband_tournament_team → ALL members reset, all requests deleted, team deleted
```

### Constraints

- Teams can only be created, joined, and disbanded during `Registration` stage
- Captain cannot leave their own team (they must disband it)
- Team size enforced by `tournament.teamSize` — `accept_team_request` checks current member count
- Solo tournaments (`teamSize = 1`) do not support team creation

---

## CostSet Integration

Each tournament can reference a published `CostSet` via `costSetId`:

- `costSetId = 0` → uses the default/global cost set
- `costSetId > 0` → must reference an existing, published CostSet (`isPublished = true`)

This allows TOs to configure custom character/lightcone costs for their tournament without affecting other tournaments or the global defaults.

---

## Data Patterns

### Composite PK Updates (delete + insert)

`TournamentParticipant` and `TournamentTeamRequest` have composite primary keys. SpacetimeDB does not support in-place updates for composite PK rows, so all updates use the delete + re-insert pattern:

```typescript
ctx.db.TournamentParticipant.delete(participant);
ctx.db.TournamentParticipant.insert({
    ...participant,
    status: { tag: 'Withdrawn', value: {} } as any,
    ...auditUpdate(ctx, participant, user.id),
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
