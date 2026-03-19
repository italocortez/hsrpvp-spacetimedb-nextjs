# Tournaments

**Architecture:** [architecture.md](architecture.md)

## Acceptance Scenarios

### Tournament Creation
**Given:** User with TournamentHost role
**When:** `create_tournament` with valid settings
**Then:** Tournament inserted with stage=Draft, organizerId=caller

### Tournament Update (Draft)
**Given:** Tournament in Draft stage
**When:** `update_tournament` with new name, bestOf, has3rdPlaceMatch
**Then:** Fields update successfully, tournament remains in Draft

### Tournament Update (Registration)
**Given:** Tournament in Registration stage
**When:** `update_tournament` with new rosterVisibility, disconnectPolicy
**Then:** Fields update successfully, tournament remains in Registration

### Stage Advancement (full chain)
**Given:** Tournament in Draft
**When:** `advance_tournament_stage` called repeatedly: Draft→Registration→Seeding→InProgress→Completed
**Then:** Each transition succeeds in order

### Stage Advancement (blocked — insufficient participants)
**Given:** Tournament in Registration, 1 active participant
**When:** `advance_tournament_stage(id, "Seeding")`
**Then:** Throws "At least 2 active participants are required"

### Cancel Tournament
**Given:** Tournament in Registration stage
**When:** `cancel_tournament(id)`
**Then:** Stage changes to Cancelled

### Player Registration
**Given:** Tournament in Registration, verified user with active roster
**When:** `register_for_tournament(id)`
**Then:** TournamentParticipant row inserted with isWaitlisted=false, status=Registered

### Waitlist & Approval Flow
**Given:** Tournament with requireApproval=true, maxParticipants=2, waitlistEnabled=true
**When:** 3 players register
**Then:** First 2 get isWaitlisted=false, approvedByToAt=null (pending approval). Third gets isWaitlisted=true.
**When:** TO calls `approve_participant` on player 1
**Then:** approvedByToAt set to timestamp
**When:** TO calls `waitlist_promote` on waitlisted player
**Then:** isWaitlisted=false, approvedByToAt auto-set (implicit approval)

### Withdraw from Tournament
**Given:** Registered participant
**When:** `withdraw_from_tournament(id)`
**Then:** Participant row status set to Withdrawn (row preserved for audit)

### Solo Registration with Auto-Team
**Given:** Solo tournament (teamSize=1) in Registration
**When:** `register_for_tournament(id, teamGroupId=0)`
**Then:** TournamentTeam auto-created (name=displayName). Participant inserted with teamGroupId=team.id

### Team Join Request
**Given:** Team tournament, Team A (1 member), Player B registered individually
**When:** Player B calls `request_join_team(teamId)`
**Then:** TournamentTeamRequest row created (row exists = pending)
**When:** Captain calls `accept_team_request(teamId, playerB)`
**Then:** Request row deleted. Player B's participant: teamGroupId=teamId

### Team Reject Request
**Given:** TournamentTeamRequest exists
**When:** Captain calls `reject_team_request(teamId, playerB)`
**Then:** Request row deleted. Player B's teamGroupId unchanged.

### Leave Tournament Team
**Given:** Non-captain team member
**When:** `leave_tournament_team(teamId)`
**Then:** Member's teamGroupId reset to undefined

### Disband Tournament Team
**Given:** Captain of a team with 3 members
**When:** `disband_tournament_team(teamId)`
**Then:** Team row deleted. All members' teamGroupId reset. All pending requests deleted.

### Tournament Assistant Management
**Given:** Tournament organizer
**When:** `assign_tournament_assistant(tournamentId, userId, permissions...)`
**Then:** TournamentAssistant row inserted with specified permissions
**When:** `assign_tournament_assistant` called again with same userId, different permissions
**Then:** Permissions updated (upsert)
**When:** `remove_tournament_assistant(tournamentId, userId)`
**Then:** Assistant row deleted

### DQ Auto-Advance
**Given:** Tournament InProgress, autoAdvanceBracket=true, A vs B in bracket
**When:** `dq_participant(tournamentId, playerA)`
**Then:** A status=Disqualified. B auto-advances to next bracket match

### Moderator Promote to Host
**Given:** User with Moderator or Admin role, target user with User role
**When:** `mod_promote_to_host(targetUserId)`
**Then:** Target user's role changes from User to TournamentHost

### Moderator Demote from Host
**Given:** User with Moderator or Admin role, target user with TournamentHost role
**When:** `mod_demote_from_host(targetUserId)`
**Then:** Target user's role changes from TournamentHost to User

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Register full tournament, waitlist off | Throws "Tournament is full" |
| Register full tournament, waitlist on | Inserted with isWaitlisted=true |
| Register duplicate | Throws "Already registered" |
| Register on Draft stage | Throws stage error |
| Captain tries to leave team | Throws "Captain cannot leave. Use disband." |
| Disband during InProgress | Throws "Teams can only be disbanded during Registration" |
| Advance Draft → InProgress (skip) | Throws stage transition error |
| Advance backward (Seeding → Registration) | Throws stage transition error |
| Cancel completed tournament | Throws "Cannot cancel terminal state" |
| Cancel already-cancelled tournament | Throws "Cannot cancel terminal state" |
| DQ already withdrawn participant | Throws "Cannot disqualify a participant who has already withdrawn" |
| DQ already disqualified participant | Throws "Participant is already disqualified" |
| Update tournament during InProgress | Throws "Can only update during Draft or Registration" |
| Update cancelled tournament | Throws "Can only update during Draft or Registration" |
| Withdraw when already withdrawn | Throws "Already withdrawn" |
| Self-assign as tournament assistant | Throws "You cannot assign yourself" |
| Promote already-TournamentHost | Throws "Can only promote users with the User role" |
| Demote a User-role player | Throws "Can only demote users with the TournamentHost role" |
| Self-promote/demote via mod reducer | Throws "You cannot change your own role" |
| Promote Admin-role user | Throws "Can only promote users with the User role. Current role: Admin" |
| Non-moderator calls promote/demote | Throws "Requires Moderator or Admin privileges" |

## Integration Points

| This Feature | Connects To | Direction |
|-------------|------------|-----------|
| Tournament.costSetId | CostSet.id | Reads |
| TournamentParticipant.hsrAccountId | HsrAccount.id | Reads |
| TournamentParticipant.teamGroupId | TournamentTeam.id | Reads/Writes |
| BracketMatch.tournamentId | Tournament.id | Phase 4 writes |
| MatchResultRecord.tournamentId | Tournament.id | Phase 3 writes |
| MmrRating | Auto-seeding | Phase 4 reads |

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| Stages forward-only, no Paused | Phase 3 CONTEXT.md | 2026-03-17 |
| TournamentTeamRequest transactional (no isPending) | Phase 3 review | 2026-03-17 |
| Role hierarchy: Admin>Mod>TO>User | Phase 3 CONTEXT.md | 2026-03-17 |
| winnerAdvantage u8 replaces bool | Phase 3 CONTEXT.md | 2026-03-17 |
| Cost set lock→unpublish→delete lifecycle | Phase 3 CONTEXT.md | 2026-03-17 |
| Solo players auto-create TournamentTeam | Phase 4 CONTEXT.md | 2026-03-17 |
| BracketSide enum (5 variants) | Phase 4 CONTEXT.md | 2026-03-17 |
| Grand finals: single match + advantage | Phase 4 CONTEXT.md | 2026-03-17 |
| 3rd place match via has3rdPlaceMatch | Phase 4 CONTEXT.md | 2026-03-17 |
| autoAdvanceBracket toggle | Phase 4 CONTEXT.md | 2026-03-17 |
| seedNumber on TournamentTeam (not Participant) | Phase 4 CONTEXT.md | 2026-03-18 |
| GroupStanding.participantTeamId | Phase 4 CONTEXT.md | 2026-03-18 |
| MatchResultParticipant for 2v2/3v3 | Phase 4 CONTEXT.md | 2026-03-18 |
| Team name rules by format + anonymous | Phase 4 CONTEXT.md | 2026-03-17 |
| Groups: Win=2, Draw=1, Loss=0 | Phase 4 CONTEXT.md | 2026-03-17 |
| Rollback: one step, MMR reversal Phase 5 | Phase 4 CONTEXT.md | 2026-03-17 |
| Tournament update, cancel, withdraw, waitlist/approval scenarios | Phase 3 execution | 2026-03-19 |
| Team reject, leave, disband scenarios | Phase 3 execution | 2026-03-19 |
| Tournament assistant assign/remove/self-block | Phase 3 execution | 2026-03-19 |
| Moderator promote/demote with role guards | Phase 3 execution | 2026-03-19 |
| Withdraw preserves row (status=Withdrawn), double-withdraw guard | Phase 3 execution | 2026-03-19 |

---

*Last updated: 2026-03-19*
