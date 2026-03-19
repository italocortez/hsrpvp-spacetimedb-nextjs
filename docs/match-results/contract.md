# Match Results

**Architecture:** [architecture.md](architecture.md)

## Acceptance Scenarios

### Score Confirmation
**Given:** MatchResultRecord in Pending status, caller is player1
**When:** `confirm_match_scores(matchResultId)`
**Then:** team1Confirmed=true. If caller is player2, team2Confirmed=true.

### Submit Match Result
**Given:** MatchResultRecord with both teams confirmed, caller has referee authority
**When:** `submit_match_result(matchResultId, winnerId)`
**Then:** Status changes to Submitted. winnerId and refereeUserId set.

### Submit Without Both Confirmations (blocked)
**Given:** MatchResultRecord with only team1Confirmed=true
**When:** Referee calls `submit_match_result`
**Then:** Throws "Both teams must confirm scores before submission"

### Dispute Match Result
**Given:** MatchResultRecord in Submitted status, caller is a match participant
**When:** `dispute_match_result(matchResultId, reason)`
**Then:** Status changes to Disputed. disputedByUserId and disputeReason set.

### Double Dispute (blocked)
**Given:** MatchResultRecord already disputed
**When:** Another participant calls `dispute_match_result`
**Then:** Throws "This match result has already been disputed"

### Override Match Result
**Given:** MatchResultRecord exists, caller is TO/Mod/Admin
**When:** `override_match_result(matchResultId, "Validated", winnerId, reason)`
**Then:** Status changes to Validated. winnerId updated. disputeReason stores override reason.

### Referee Transfer
**Given:** Lobby with host and members, host has isReferee=true
**When:** Host calls `transfer_referee(lobbyId, targetUserId)`
**Then:** Host's isReferee=false, target's isReferee=true

### Referee Reclaim
**Given:** Lobby where referee was transferred to another member
**When:** Host calls `reclaim_referee(lobbyId)`
**Then:** Current referee's isReferee=false, host's isReferee=true

### Coach Assignment
**Given:** Lobby with host and members
**When:** Host or referee calls `set_coach(lobbyId, targetUserId)`
**Then:** Target's isCoach=true
**When:** Host or referee calls `remove_coach(lobbyId, targetUserId)`
**Then:** Target's isCoach=false

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Confirm scores on non-Pending match | Throws "Scores can only be confirmed when Pending" |
| Non-participant confirms scores | Throws "You are not a participant" |
| Submit without referee authority | Throws "You do not have referee authority" |
| Dispute a Pending match | Throws "Can only dispute after submission" |
| Dispute with empty reason | Throws "Dispute reason cannot be empty" |
| Dispute reason > 1000 chars | Throws "Dispute reason cannot exceed 1000 characters" |
| Transfer referee to self | Throws "Cannot transfer referee to yourself" |
| Transfer referee when not referee | Throws "You are not the referee" |
| Reclaim referee when not host | Throws "Only the lobby host can reclaim" |
| Set coach by non-host/non-referee | Throws "Only the lobby host or referee can assign" |
| Override with invalid status tag | Throws "Invalid status override" |

## Testing Notes

**Deferred to Phase 9 UAT:** Tests for score confirmation (13), dispute (14), override (15), referee transfer (12), and coach management (17) require lobby CRUD reducers and MatchResultRecord insert — both unavailable until Phase 9. Scenarios are documented here for test generation once prerequisites exist.

## Integration Points

| This Feature | Connects To | Direction |
|-------------|------------|-----------|
| MatchResultRecord.lobbyId | Lobby.id | Reads |
| MatchResultRecord.player1Id/player2Id | User.id | Reads |
| MatchResultRecord.tournamentId | Tournament.id | Reads |
| MatchResultRecord.bracketMatchId | BracketMatch.id | Phase 4 |
| LobbyMember.isReferee | Referee authority check | Reads |
| LobbyMember.isCoach | Coach role flag | Writes |
| MmrRating | MMR calculation | Phase 5 reads |

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| Both teams must confirm before submit | Phase 3 CONTEXT.md | 2026-03-17 |
| One dispute per match | Phase 3 CONTEXT.md | 2026-03-17 |
| Referee is per-lobby (isReferee on LobbyMember) | Phase 3 CONTEXT.md | 2026-03-17 |
| Referee auto-assign at lobby creation deferred to Phase 9 | Phase 3 execution | 2026-03-19 |
| disputeReason reused for admin override reason | Phase 3 execution | 2026-03-19 |
| Coach set/remove by host or referee only | Phase 3 execution | 2026-03-19 |
| All match result/referee/coach tests deferred to Phase 9 (no lobby CRUD) | Phase 3 execution | 2026-03-19 |

---

*Last updated: 2026-03-19*
