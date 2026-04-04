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

### Stage Advancement (blocked — no brackets generated)
**Given:** Tournament in Seeding, no BracketMatch rows exist
**When:** `advance_tournament_stage(id, "InProgress")`
**Then:** Throws "Bracket must be generated before advancing to InProgress"

### Cancel Tournament
**Given:** Tournament in Registration stage with teams, assistants, and pending requests
**When:** `cancel_tournament(id)`
**Then:** Stage changes to Cancelled. Cascade deletes: TournamentTeamRequest, GroupPhaseRecord, BracketMatch, TournamentPlayerAccount, TournamentTeam, TournamentAssistant, CalendarEvent + CalendarEventInvite (for all linked bracket matches). TournamentEnrolled rows preserved (audit trail). MatchResultRecord rows preserved (player history).

### Cancel InProgress Tournament
**Given:** Tournament in InProgress with generated bracket, group standings, and match results
**When:** `cancel_tournament(id)`
**Then:** Stage=Cancelled. BracketMatch and GroupPhaseRecord rows deleted. CalendarEvent + CalendarEventInvite rows for linked bracket matches deleted. MatchResultRecord rows preserved. TournamentEnrolled rows preserved with their current status unchanged.

### Player Registration
**Given:** Tournament in Registration, verified user with active roster
**When:** `register_for_tournament(id)`
**Then:** TournamentEnrolled row inserted with isWaitlisted=false, status=Registered

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
**Then:** Participant row status set to Withdrawn (row preserved for audit). TournamentPlayerAccount rows deleted. TournamentTeamMember row deleted. Pending TournamentTeamRequest rows from this user deleted. CalendarEventInvite rows for this user on any CalendarEvents linked to this tournament's bracket matches deleted.

### Captain Withdrawal Auto-Transfers Captaincy
**Given:** Captain of a team with 2+ members, Player C has pending request
**When:** Captain calls `withdraw_from_tournament(tournamentId)`
**Then:** Captaincy transfers to lowest-userId remaining member. Captain's TournamentTeamMember row deleted, participant status=Withdrawn, TournamentPlayerAccount rows deleted. Player C's pending request preserved (team still exists).

### Solo Registration with Auto-Team
**Given:** Solo tournament (teamSize=1) in Registration
**When:** `register_for_tournament(id)`
**Then:** TournamentEnrolled row created. TournamentTeam auto-created (name=displayName). TournamentTeamMember row links participant to team.

### Registration with Account Locking (Phase 6)
**Given:** Player with 2 HSR accounts registers for tournament in Registration stage
**When:** `register_for_tournament(tournamentId)`
**Then:** TournamentEnrolled row created AND TournamentPlayerAccount rows created for ALL user HSR accounts (not just active). Accounts locked to this tournament for pick validation during matches. (D-21)
Note: TournamentEnrolled row does NOT contain hsrAccountId — that column was removed in Phase 10.4 (D-23). TournamentPlayerAccount is the sole source of truth for locked accounts.

### Account Selection in Tournament Lobby (Phase 10.4)
**Given:** Player enrolled in tournament with 2 locked accounts (TPA rows), in Waiting stage tournament lobby
**When:** `select_match_account(lobbyId, hsrAccountId)` called with a locked account
**Then:** LobbyMemberAccount row created for [lobbyId, userId, hsrAccountId]. If maxAccountsPerPlayer=1 (default), replaces existing selection. If maxAccountsPerPlayer=2+, row added additively. (D-05, D-07, D-11, Phase 10.4 execution)

### Account Selection Exceeds maxAccountsPerPlayer
**Given:** Tournament with maxAccountsPerPlayer=1, player already has 1 LobbyMemberAccount row
**When:** `select_match_account(lobbyId, anotherHsrAccountId)`
**Then:** Throws error — player has reached the maximum number of accounts for this tournament. (D-11, Phase 10.4 execution)

### Account Selection Non-Tournament (Replace Behavior)
**Given:** Non-tournament lobby, player with account A selected (LobbyMemberAccount row for account A)
**When:** `select_match_account(lobbyId, accountB.id)` called with a different owned account
**Then:** LobbyMemberAccount row for account A deleted, new row for account B inserted. Always max 1 account in non-tournament lobbies. (D-07, Phase 10.4 execution)

### Stand-In Account Snapshot at Lobby Join (Phase 10.4)
**Given:** Approved stand-in (TournamentStandIn row exists for bracketMatchId + userId), no TPA entries yet for this tournament
**When:** Stand-in calls `join_lobby` for a tournament lobby linked to that bracketMatchId
**Then:** All stand-in's HSR accounts snapshotted into TournamentPlayerAccount. LobbyMemberAccount row auto-created with their active account. (D-26, Phase 10.4 execution)

### Withdrawal Cleans Up Account Locks
**Given:** Player registered for tournament with locked accounts
**When:** `withdraw_from_tournament(tournamentId)`
**Then:** Participant status=Withdrawn AND all TournamentPlayerAccount rows for this user+tournament deleted.

### Team Join Request
**Given:** Team tournament, Team A (1 member), Player B registered individually
**When:** Player B calls `request_join_team(teamId)`
**Then:** TournamentTeamRequest row created (row exists = pending)
**When:** Captain calls `accept_team_request(teamId, playerB)`
**Then:** Request row deleted. Player B's other pending requests in this tournament also deleted. TournamentTeamMember row created linking Player B to team.

### Team Reject Request
**Given:** TournamentTeamRequest exists
**When:** Captain calls `reject_team_request(teamId, playerB)`
**Then:** Request row deleted. Player B remains without a team (no TournamentTeamMember row created).

### Leave Tournament Team
**Given:** Non-captain team member
**When:** `leave_tournament_team(teamId)`
**Then:** Member's TournamentTeamMember row deleted

### Disband Tournament Team
**Given:** Captain of a team with 3 members
**When:** `disband_tournament_team(teamId)`
**Then:** Team row deleted. All TournamentTeamMember rows deleted. All pending requests deleted.

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

### Check-In Tournament
**Given:** Tournament in CheckIn stage, participant with status=Registered
**When:** `check_in_tournament(tournamentId)`
**Then:** Participant status changes to CheckedIn

### Check-In Already Checked In
**Given:** Participant with status=CheckedIn
**When:** `check_in_tournament(tournamentId)`
**Then:** Throws "You have already checked in"

### Check-In Wrong Stage
**Given:** Tournament NOT in CheckIn stage
**When:** `check_in_tournament(tournamentId)`
**Then:** Throws stage error

### Captain Transfer on Withdrawal
**Given:** Team captain with 2+ members
**When:** Captain calls `withdraw_from_tournament(tournamentId)`
**Then:** Captaincy transfers to lowest-userId remaining TournamentTeamMember. Captain's member row deleted, status=Withdrawn.

### Captain Transfer on DQ
**Given:** Team captain with 2+ members, tournament InProgress
**When:** `dq_participant(tournamentId, captainUserId)`
**Then:** Captain status=Disqualified. Captaincy transfers to lowest-userId remaining TournamentTeamMember.

### Last Member Leaves Team
**Given:** Team with single remaining member
**When:** Last member calls `withdraw_from_tournament` or is DQ'd
**Then:** Team destroyed (TournamentTeam row + all TournamentTeamMember rows deleted)

### Stage Transition: Registration → CheckIn
**Given:** Tournament in Registration, checkInEnabled=true
**When:** `advance_tournament_stage(id, "CheckIn")`
**Then:** Stage changes to CheckIn

### Stage Transition: CheckIn → Seeding
**Given:** Tournament in CheckIn, some participants still status=Registered (unchecked-in)
**When:** `advance_tournament_stage(id, "Seeding")`
**Then:** Unchecked-in participants auto-removed. Stage changes to Seeding.

### Stage Transition: Registration → Seeding (skip CheckIn)
**Given:** Tournament in Registration, checkInEnabled=false
**When:** `advance_tournament_stage(id, "Seeding")`
**Then:** Stage changes to Seeding (CheckIn stage skipped)

### ParticipantStatus Lifecycle
**Given:** Participant with status=Registered
**When:** `check_in_tournament` → status=CheckedIn
**When:** Tournament advances to InProgress → status=Active (bulk update for all CheckedIn/Registered participants)
**When:** Final bracket loss → status=Eliminated

### Series Management: Advance to Next Game
**Given:** Active match series with gameNumber=1, draft state exists
**When:** `advance_to_next_game(matchSessionId)`
**Then:** Draft state reset, gameNumber incremented to 2

### Series Management: Shelve Series
**Given:** Active match series needing long pause
**When:** `shelve_series(matchSessionId)`
**Then:** Series transitions to Shelved status

### Series Management: Resume Series
**Given:** Shelved match series
**When:** `resume_series(matchSessionId)` with 1+ player per team present
**Then:** Series resumes from where it left off

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Register full tournament, waitlist off | Throws "Tournament is full" |
| Register full tournament, waitlist on | Inserted with isWaitlisted=true |
| Register duplicate | Throws "Already registered" |
| Register on Draft stage | Throws stage error |
| Captain tries to leave team (solo captain) | Throws "Captain cannot leave. Use disband." |
| Disband during InProgress | Throws "Teams can only be disbanded during Registration" |
| Advance Draft → InProgress (skip) | Throws stage transition error |
| Advance backward (Seeding → Registration) | Throws stage transition error |
| Cancel completed tournament | Throws "Cannot cancel terminal state" |
| Cancel already-cancelled tournament | Throws "Cannot cancel terminal state" |
| Advance Registration → Seeding with pending team requests | `cleanupTeamRequests()` deletes all pending TournamentTeamRequest rows for the tournament. Teams with no accepted members are NOT deleted — only requests are cleaned up. |
| DQ already withdrawn participant | Throws "Cannot disqualify a participant who has already withdrawn" |
| DQ already disqualified participant | Throws "Participant is already disqualified" |
| Update tournament during InProgress | Throws "Can only update during Draft or Registration" |
| Update cancelled tournament | Throws "Can only update during Draft or Registration" |
| Withdraw when already withdrawn | Throws "Already withdrawn" |
| Captain withdraws from tournament (team has other members) | Captaincy transfers to lowest-userId remaining member, captain marked Withdrawn |
| Last member withdraws from team | Team destroyed (team row + all TournamentTeamMember rows deleted) |
| Cancel tournament with no infrastructure rows | Stage=Cancelled, no errors (cascade is no-op on empty tables) |
| Accept request when user has requests to other teams | Accepted request deleted, other pending requests also deleted |
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
| Tournament.maxAccountsPerPlayer | select_match_account limit | Reads (Phase 10.4) |
| TournamentPlayerAccount | HsrAccount.id | Reads/Writes |
| LobbyMemberAccount | TournamentPlayerAccount (validation) | Reads (Phase 10.4) |
| TournamentTeamMember.teamId | TournamentTeam.id | Reads/Writes |
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
| GroupPhaseRecord.teamId (renamed from participantTeamId) | Phase 4 CONTEXT.md | 2026-03-18 |
| MatchResultParticipant for 2v2/3v3 | Phase 4 CONTEXT.md | 2026-03-18 |
| Team name rules by format + anonymous | Phase 4 CONTEXT.md | 2026-03-17 |
| Groups: Win=2, Draw=1, Loss=0 | Phase 4 CONTEXT.md | 2026-03-17 |
| Rollback: one step, MMR reversal Phase 5 | Phase 4 CONTEXT.md | 2026-03-17 |
| Tournament update, cancel, withdraw, waitlist/approval scenarios | Phase 3 execution | 2026-03-19 |
| Team reject, leave, disband scenarios | Phase 3 execution | 2026-03-19 |
| Tournament assistant assign/remove/self-block | Phase 3 execution | 2026-03-19 |
| Moderator promote/demote with role guards | Phase 3 execution | 2026-03-19 |
| Withdraw preserves row (status=Withdrawn), double-withdraw guard | Phase 3 execution | 2026-03-19 |

| Stage guard: Seeding->InProgress requires bracket rows | Phase 4 execution | 2026-03-18 |
| server_set_mmr reducer for test seeding | Phase 4 UAT | 2026-03-19 |
| participantTeamId -> teamId in GroupPhaseRecord references | Phase 04.1 execution | 2026-03-20 |
| TournamentPlayerAccount locks all HSR accounts at registration (D-21) | Phase 6 CONTEXT.md | 2026-03-21 |
| TPA rows cleaned up on withdrawal | Phase 6 execution | 2026-03-22 |
| requireOwnership inherited from tournament.requireRoster (D-19) | Phase 6 CONTEXT.md | 2026-03-21 |
| cancel_tournament cascade-deletes infrastructure rows (teams, bracket, standings, assistants, player accounts, requests) | Retroactive cleanup | 2026-03-28 |
| withdraw_from_tournament auto-disbands captain's team, cleans up pending requests | Retroactive cleanup | 2026-03-28 |
| accept_team_request cleans up user's other pending requests in tournament | Retroactive cleanup | 2026-03-28 |
| Registration→Seeding cleans up pending team requests | Retroactive cleanup | 2026-03-28 |
| Registration→Seeding cleanup edge case: teams with no accepted members preserved | Phase 9 execution | 2026-03-29 |
| TournamentEnrolled and MatchResultRecord preserved on cancellation (audit trail / player history) | Retroactive cleanup | 2026-03-28 |
| cancel_tournament cascade-deletes CalendarEvent + CalendarEventInvite via bracketMatchId FK (not tournamentId — events link to bracket matches, not tournaments directly) | Phase 08 CONTEXT.md (D-21) | 2026-03-28 |
| withdraw_from_tournament deletes player's CalendarEventInvite rows for tournament's scheduled matches | Phase 08 CONTEXT.md (D-24) | 2026-03-28 |
| TournamentParticipant split into TournamentEnrolled + TournamentTeamMember; teamGroupId removed from enrollment | Phase 10.1 execution | 2026-04-03 |
| GroupStanding renamed to GroupPhaseRecord | Phase 10.1 execution | 2026-04-03 |
| register_for_tournament no longer takes teamGroupId — enrollment and team assignment fully decoupled | Phase 10.1 execution | 2026-04-03 |
| check_in_tournament reducer: CheckIn stage + Registered status → CheckedIn | Phase 10.1 execution | 2026-04-03 |
| Captain transfer on withdrawal/DQ: captaincy to lowest-userId remaining member | Phase 10.1 execution | 2026-04-03 |
| Last member leaves/DQ'd: team destroyed | Phase 10.1 execution | 2026-04-03 |
| CheckIn stage transitions: Registration→CheckIn (when enabled), CheckIn→Seeding (auto-remove unchecked-in), Registration→Seeding (skip when disabled) | Phase 10.1 execution | 2026-04-03 |
| ParticipantStatus lifecycle: Registered→CheckedIn→Active→Eliminated | Phase 10.1 execution | 2026-04-03 |
| Series management: advance_to_next_game, shelve_series, resume_series | Phase 10.1 execution | 2026-04-03 |
| TournamentEnrolled.hsrAccountId removed — TournamentPlayerAccount is sole source of truth for locked accounts (D-23) | Phase 10.4 execution | 2026-04-04 |
| Tournament.maxAccountsPerPlayer column added (u8, default 1) — controls per-match account selection limit (D-10, D-33) | Phase 10.4 execution | 2026-04-04 |
| select_match_account: tournament path additive (up to maxAccountsPerPlayer), non-tournament path replace (always 1) | Phase 10.4 execution | 2026-04-04 |
| Stand-in TPA snapshot conditional on bracketMatchId being truthy | Phase 10.4 execution | 2026-04-04 |
| view_tournament_registrant_accounts new view: locked accounts per tournament respecting rosterVisibility | Phase 10.4 execution | 2026-04-04 |

---

*Last updated: 2026-04-04*
