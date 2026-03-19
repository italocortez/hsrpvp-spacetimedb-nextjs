---
status: testing
phase: 03-tournament-system
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md]
started: 2026-03-18T00:00:00Z
updated: 2026-03-19T01:30:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 10
name: Cost Set Lifecycle
expected: |
  Call `create_cost_set` — CostSet row created with isPublished=false. Call `edit_draft_character_cost` / `edit_draft_lightcone_cost` / `edit_draft_synergy_cost` — draft rows appear in private draft tables. Call `publish_cost_set` — draft costs copied to live HsrCharacterCost/HsrLightconeCost/HsrSynergyCost tables, isPublished=true. Call `lock_cost_set` — isLocked=true. Call `unpublish_cost_set` — isPublished=false. Call `delete_cost_set` — CostSet row and all associated live cost rows removed.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: Publish module to maincloud, check logs for errors, run a basic SQL query.
result: pass

### 2. Create Tournament
expected: Call `create_tournament` as a TournamentHost+ user with valid parameters (name, format, bestOf, teamSize, etc.). A new Tournament row appears with stage=Draft, the caller set as organizerId, and all provided fields stored correctly.
result: pass

### 3. Update Tournament
expected: Call `update_tournament` on a Draft-stage tournament. Fields update successfully. Repeat in Registration stage — still works. Attempt on a Seeding/InProgress/Completed tournament — rejected with error.
result: pass (retest — blocker fix verified)

### 4. Tournament Stage Advancement
expected: Call `advance_tournament_stage` to move Draft→Registration→Seeding→InProgress→Completed. Each transition succeeds in order. Attempting to skip a stage (e.g., Draft→InProgress) or go backward (e.g., Seeding→Registration) is rejected with an error.
result: pass

### 5. Cancel Tournament
expected: Call `cancel_tournament` on a non-terminal (non-Completed, non-Cancelled) tournament. Tournament stage changes to Cancelled. Attempting to cancel an already-Cancelled or Completed tournament is rejected.
result: pass

### 6. Player Registration
expected: With tournament in Registration stage, call `register_for_tournament` as a verified user with an active roster. A TournamentParticipant row appears with the player's identity, isWaitlisted=false (if capacity allows), and status=Registered.
result: pass

### 7. Waitlist & Approval Flow
expected: Create a tournament with requireApproval=true and limited maxParticipants. Register players — they appear as waitlisted or pending approval. Call `approve_participant` — participant moves to active. When at capacity, new registrants go to waitlist. Call `waitlist_promote` — waitlisted player becomes active.
result: pass (after fixes: removed participantType column, waitlist_promote now auto-approves)

### 8. Withdraw from Tournament
expected: Call `withdraw_from_tournament` as a registered participant. The TournamentParticipant row is removed. Attempting to withdraw when not registered is rejected.
result: pass (after fix: added guard for already-withdrawn status)

### 9. Tournament Team Workflow
expected: Call `create_tournament_team` — TournamentTeam row created with caller as captain. Another player calls `request_join_team` — TournamentTeamRequest row created. Captain calls `accept_team_request` — requester's TournamentParticipant gets teamGroupId set. `reject_team_request` removes the request. `leave_tournament_team` resets teamGroupId. `disband_tournament_team` removes the team and resets all members' teamGroupId.
result: pass

### 10. Cost Set Lifecycle
expected: Call `create_cost_set` — CostSet row created with isPublished=false. Call `edit_draft_character_cost` / `edit_draft_lightcone_cost` / `edit_draft_synergy_cost` — draft rows appear in private draft tables. Call `publish_cost_set` — draft costs copied to live HsrCharacterCost/HsrLightconeCost/HsrSynergyCost tables, isPublished=true. Call `lock_cost_set` — isLocked=true. Call `unpublish_cost_set` — isPublished=false. Call `delete_cost_set` — CostSet row and all associated live cost rows removed.
result: [pending]

### 11. Cost Set Default Protection
expected: Attempting to call `lock_cost_set`, `unpublish_cost_set`, or `delete_cost_set` with costSetId=0 (the default set) is rejected with an error. The default set cannot be modified through lifecycle reducers.
result: [pending]

### 12. Referee Transfer & Reclaim
expected: In a lobby, the host calls `transfer_referee` targeting another member. That member's isReferee becomes true, host's becomes false. Host calls `reclaim_referee` — referee flag returns to host.
result: [pending]

### 13. Match Score Confirmation & Submission
expected: With a MatchResultRecord in Pending status, Team 1 captain calls `confirm_match_scores` — team1Confirmed=true. Team 2 captain calls `confirm_match_scores` — team2Confirmed=true. Referee calls `submit_match_result` with winnerId — status changes to Submitted. Attempting to submit without both confirmations is rejected.
result: [pending]

### 14. Match Dispute
expected: After a match result is submitted, a participant calls `dispute_match_result` with a reason. disputedByUserId is set and disputeReason recorded. A second dispute attempt (by anyone) on the same match is rejected — single-dispute-per-match enforcement.
result: [pending]

### 15. Tournament Admin Operations
expected: Moderator+ or organizer calls `dq_participant` — participant status changes to Disqualified. `override_match_result` changes the winner and stores the reason in disputeReason. `assign_tournament_assistant` adds an assistant (self-assignment blocked). `remove_tournament_assistant` removes the assistant.
result: [pending]

### 16. Moderator Role Management
expected: A Moderator+ calls `mod_promote_to_host` on a User-role player — their role changes to TournamentHost. `mod_demote_from_host` on a TournamentHost — role reverts to User. Attempting to promote/demote Admin or Moderator roles is rejected.
result: [pending]

### 17. Coach Role Management
expected: In a lobby, the host or referee calls `set_coach` targeting a member — that member's isCoach becomes true. `remove_coach` sets isCoach back to false. Non-host/non-referee callers are rejected.
result: [pending]

## Summary

total: 17
passed: 9
issues: 0
pending: 8
skipped: 0

## Gaps

[none — blocker from test 3 was fixed and retest passed]
