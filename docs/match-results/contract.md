# Match Results

**Architecture:** [architecture.md](architecture.md)

## Acceptance Scenarios

### Score Confirmation (Captain)
**Given:** MatchResultRecord in Pending status, caller is a captain (MatchResultParticipant.isCaptain=true)
**When:** `confirm_match_scores(matchResultId)`
**Then:** Caller's side flag set on MatchResultRecord (blueConfirmed or redConfirmed based on teamSide). In 1v1, both participants have isCaptain=true. In team formats, only the designated team captain confirms on behalf of their side.

### Score Confirmation (Spectator Referee)
**Given:** MatchResultRecord in Pending status with refereeFullControl=true, caller is a spectator referee (isReferee=true on LobbyMember, no MatchResultParticipant row)
**When:** `confirm_match_scores(matchResultId)`
**Then:** Both blueConfirmed and redConfirmed set to true on MatchResultRecord.

### Score Confirmation by Participant Referee (own side only)
**Given:** MatchResultRecord in Pending status, caller is both a participant AND referee
**When:** `confirm_match_scores(matchResultId)`
**Then:** Only their own side's flag is set (same as captain path). refereeFullControl is ignored for participant referees.

### Submit Match Result
**Given:** MatchResultRecord with all captains confirmed, caller has referee authority
**When:** `submit_match_result(matchResultId, winnerId)` — winnerId is u32, mapped to winnerTeamSide server-side via MatchResultParticipant lookup
**Then:** Status changes to Submitted. winnerTeamSide and refereeUserId set.

### Submit Without All Confirmations (blocked)
**Given:** MatchResultRecord where blueConfirmed or redConfirmed is false
**When:** Referee calls `submit_match_result`
**Then:** Throws "All team captains must confirm scores before submission."

### Dispute Match Result
**Given:** MatchResultRecord in Submitted status, caller is a match participant (has MatchResultParticipant row)
**When:** `dispute_match_result(matchResultId, reason)`
**Then:** Status changes to Disputed. disputedByUserId and disputeReason set.

### Double Dispute (blocked)
**Given:** MatchResultRecord already disputed
**When:** Another participant calls `dispute_match_result`
**Then:** Throws "This match result has already been disputed"

### Override Match Result
**Given:** MatchResultRecord exists, caller is TO/Mod/Admin
**When:** `override_match_result(matchResultId, "Validated", winnerTeamSideTag, reason)` — winnerTeamSideTag is string: 'Blue'/'Red'/'' for draw
**Then:** Status changes to Validated. winnerTeamSide updated. disputeReason stores override reason.

### Match Finalization (Phase 5)
**Given:** MatchResultRecord in Validated status, MMR processed (or matchType=Casual)
**When:** `finalize_match_result(matchResultId)` is called
**Then:** MatchSessionHistory row written with match outcome. MatchParticipantHistory rows written for each participant. PlayerStat and PlayerCharacterStat incremented. PlayerRelationship updated for ally/opponent pairs. MatchResultRecord, MatchResultParticipant, and MatchResultGame rows all deleted.

**Note:** This reducer is a stub in Phase 04.1. Full implementation in Phase 5. Documenting the contract here so Phase 5 has a behavioral spec to implement against.

### Casual Auto-Validation (Phase 5)
**Given:** MatchResultRecord with matchType=Casual, all captains confirmed
**When:** `submit_match_result(matchResultId, winnerId)` is called
**Then:** Status changes directly to Validated (skips Submitted). Finalization can proceed immediately (no MMR gate).

### Ranked Screenshot Requirement (Phase 5)
**Given:** MatchResultRecord with matchType=Ranked, status=Submitted
**When:** Admin/Mod/TO calls `override_match_result(matchResultId, "Validated", ...)`
**Then:** Validation rejects if any MatchResultGame row is missing teamBlueScreenshotUrl or teamRedScreenshotUrl. All games must have both screenshots before a Ranked match can be validated.

### Casual Auto-Finalize (Phase 6)
**Given:** MatchResultRecord with matchType=Casual, all captains confirmed
**When:** `submit_match_result(matchResultId, winnerId)` is called
**Then:** Status changes to Validated AND finalization runs inline in same transaction -- stats, history, MMR all written atomically. No separate finalize_match_result call needed. (D-37)

### Finalization Pipeline (Phase 6)
**Given:** MatchResultRecord in Validated status
**When:** `finalize_match_result` (ranked) or auto-finalize (casual)
**Then:** 19-step pipeline runs: reads participants/games/lobby/steps/season, then writes MatchSessionHistory, MatchSessionStepHistory (individual rows), MatchResultGameHistory, MatchParticipantHistory (with displayName), processes MMR (ranked only), increments PlayerStat, PlayerCharacterStat, PlayerRelationship, GlobalCharacterStat, advances bracket (tournament), deletes ephemeral records, cascade-deletes lobby. Single transaction -- full rollback on failure. (D-56)

### Referee Transfer
**Given:** Lobby with host and members, host has isReferee=true
**When:** Host calls `transfer_referee(lobbyId, targetUserId)`
**Then:** Host's isReferee=false, target's isReferee=true

### Referee Reclaim
**Given:** Lobby where referee was transferred to another member
**When:** Host calls `reclaim_referee(lobbyId)`
**Then:** Current referee's isReferee=false, host's isReferee=true

### Record Game Scores — Captain Own-Side Scoring
**Given:** MatchResultRecord in Pending status, caller is a Blue captain (MatchResultParticipant.isCaptain=true, teamSide=Blue)
**When:** `record_game_scores(matchResultId, gameNumber, winnerTeamSide, teamBlueCyclesUsed, teamBlueScore, teamBlueScreenshotUrl)` — providing only Blue-side fields
**Then:** MatchResultGame row created (or updated via delete+insert upsert) with Blue-side values set. Red-side fields remain empty (or preserved from prior entry if updating). gameMode inherited from Lobby. validationStatus defaults to Pending.

**Rejection:** Blue captain provides any Red-side field (teamRedCyclesUsed, teamRedScore, teamRedBoss1Score, teamRedBoss2Score, teamRedScreenshotUrl) → error "Captains can only enter scores for their own side." Same logic for Red captain providing Blue-side fields.

**Rejection:** Non-captain participant calls record_game_scores → error "Only the team captain can record game scores."

### Record Game Scores — Spectator Referee Full Control
**Given:** MatchResultRecord in Pending status with refereeFullControl=true, caller is a spectator referee (LobbyMember.isReferee=true, no MatchResultParticipant row)
**When:** `record_game_scores(matchResultId, gameNumber, winnerTeamSide, teamBlueCyclesUsed, teamRedCyclesUsed, teamBlueScore, teamRedScore, teamBlueScreenshotUrl, teamRedScreenshotUrl)` — providing BOTH Blue and Red side fields
**Then:** All fields set in one call on MatchResultGame row. Existing row updated (delete+insert), new row inserted if first entry. gameMode inherited from Lobby.

**Rejection:** Non-participant who is NOT the lobby referee → error "You are not a participant or authorized referee of this match."

**Rejection:** Spectator referee when refereeFullControl=false → error "You are not a participant or authorized referee of this match."

### Process Tournament MMR — Batch MMR
**Given:** Ranked tournament (countTowardsMmr=true) at Completed or Cancelled stage with multiple Validated MatchResultRecords where mmrProcessedAt is undefined
**When:** TO/assistant/Mod/Admin calls `process_tournament_mmr(tournamentId)`
**Then:** All unprocessed Validated matches for that tournament are iterated. For each match: participants and games read, `processMatchMmr` called with matchHistoryId=0 as sentinel (back-filled later by runFinalization step 12), mmrProcessedAt stamped with current timestamp. After all matches processed, leaderboard rebuilt once with active seasonId.

**Rejection:** Tournament stage is not Completed or Cancelled → error "Tournament must be Completed or Cancelled to process MMR."

**Rejection:** Tournament has countTowardsMmr=false → error "This tournament does not count toward MMR (countTowardsMmr=false)."

**No-op:** Zero unprocessed matches found → logs and returns silently (no error).

### Coach Assignment
**Given:** Lobby with host and members
**When:** Host or referee calls `set_team_slot(lobbyId, targetUserId, BlueCoach)` or `set_team_slot(lobbyId, targetUserId, RedCoach)`
**Then:** Target's lobbySlot set to BlueCoach/RedCoach (coach role encoded in slot)
**When:** Host or referee calls `set_team_slot(lobbyId, targetUserId, BluePlayer)` or `set_team_slot(lobbyId, targetUserId, RedPlayer)`
**Then:** Target's lobbySlot set to BluePlayer/RedPlayer (coach role removed)

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Confirm scores on non-Pending match | Throws "Scores can only be confirmed when Pending" |
| Non-participant, non-referee confirms scores | Throws "You are not a participant or referee of this match." |
| Confirm by non-captain participant | Throws "Only the team captain can confirm match scores." |
| Non-spectator referee tries full control confirm | Confirms own side only (participant path) |
| Spectator referee confirms without refereeFullControl | Throws "Referee full control is not enabled for this match." |
| Submit without referee authority | Throws "You do not have referee authority" |
| Dispute a Pending match | Throws "Can only dispute after submission" |
| Dispute with empty reason | Throws "Dispute reason cannot be empty" |
| Dispute reason > 1000 chars | Throws "Dispute reason cannot exceed 1000 characters" |
| Transfer referee to self | Throws "Cannot transfer referee to yourself" |
| Transfer referee when not referee | Throws "You are not the referee" |
| Reclaim referee when not host | Throws "Only the lobby host can reclaim" |
| Self-assign coach slot (BlueCoach/RedCoach) | Throws "Only the lobby host or referee can assign the coach role." |
| Override with invalid status tag | Throws "Invalid status override" |
| Record scores on non-Pending match | Throws "Scores can only be recorded when the match is in Pending status." |
| Record scores — invalid winnerTeamSide | Throws "winnerTeamSide must be \"Blue\" or \"Red\"." |
| Draw outcome (winnerId=0 on submit) | winnerTeamSide stored as undefined on MatchResultRecord. Finalization sets matchEndReason=Draw. Stats increment with isDraw=true (draws+1, no win/loss). MMR uses 0.5 actual result for both sides. |
| Handicap — Classic mode | handicapApplied = rosterDiffAdvantage × (teamBlueAccountRating − teamRedAccountRating). Stored on MatchSessionHistory.handicapApplied. teamBlueSpent/teamRedSpent are null for Classic. |
| Handicap — Auction mode | teamBlueSpent = characterBudget + lightconeBudget − remainingLcBudget (after carryover). teamRedSpent calculated identically. Both stored on MatchSessionHistory. handicapApplied = delta between spent amounts applied via same MoC/AS formula as Classic. |
| process_tournament_mmr — sentinel back-fill | MmrHistory rows written with matchHistoryId=0 during batch MMR. Finalization step 12 finds these sentinel rows per participant and updates the latest one with the real historyRow.id. |

## Testing Notes

**Deferred to Phase 9 UAT:** Tests for score confirmation (13), dispute (14), override (15), referee transfer (12), and coach management (17) require lobby CRUD reducers and MatchResultRecord insert -- both unavailable until Phase 9. Scenarios are documented here for test generation once prerequisites exist.

## Integration Points

| This Feature | Connects To | Direction |
|-------------|------------|-----------|
| MatchResultRecord.lobbyId | Lobby.id | Reads |
| MatchResultParticipant.userId | User.id | Reads |
| MatchResultRecord.bracketMatchId → BracketMatch.tournamentId | Tournament.id | Derived (D-42) |
| MatchResultRecord.bracketMatchId | BracketMatch.id | Phase 4 |
| LobbyMember.isReferee | Referee authority check | Reads |
| LobbyMember.lobbySlot | Coach encoded as BlueCoach/RedCoach | Reads |
| MmrRating | MMR calculation | Phase 5 reads |
| MatchSessionHistory | Finalization writes history | Phase 5 writes |
| MatchParticipantHistory | Finalization writes participant records | Phase 5 writes |
| PlayerStat / PlayerCharacterStat | Finalization increments stats | Phase 5 writes |
| GlobalCharacterStat | Finalization increments community stats | Phase 6 writes |
| PlayerRelationship | Finalization increments ally/opponent stats | Phase 6 writes |
| Season.id | Active season read at finalization | Phase 6 reads |
| TournamentPlayerAccount | Ownership validation for picks | Phase 6 reads |

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
| MatchResultRecord becomes ephemeral (deleted after finalization) | Phase 04.1 execution | 2026-03-20 |
| Captain-based confirmation replaces team1Confirmed/team2Confirmed | Phase 04.1 execution | 2026-03-20 |
| isTournamentControlled replaces isTournamentMatch (behavioral flag) | Phase 04.1 execution | 2026-03-20 |
| Match Finalization scenario documented (Phase 5 contract) | Phase 04.1 execution | 2026-03-20 |
| winnerTeamSide (TeamSide, renamed from TeamLabel) replaces winnerId on MatchResultGame | Phase 04.1 execution | 2026-03-20 |
| teamBlue*/teamRed* replaces player1*/player2* on MatchResultGame | Phase 04.1 execution | 2026-03-20 |
| MatchType.Tournament variant removed — only Casual and Ranked remain | Phase 5 discussion | 2026-03-20 |
| Tournament matchType derived from tournament.countTowardsMmr (true=Ranked, false=Casual) | Phase 5 discussion | 2026-03-20 |
| Casual auto-validates on submit, no MMR, screenshots optional | Phase 5 discussion | 2026-03-20 |
| Ranked requires Admin/Mod/TO validation, screenshots required for validation | Phase 5 discussion | 2026-03-20 |
| EloConfig becomes single-row admin-tunable table (not hardcoded) | Phase 5 discussion | 2026-03-20 |
| Initial MMR rating = 1000, higher = better | Phase 5 discussion | 2026-03-20 |
| Team size modifier: sizeBonus(150) per extra player, spread penalty stdev/spreadDivisor(2) | Phase 5 discussion | 2026-03-20 |
| Account rating modifier: maxAccountBonus(200), whale chooses Fair MMR or Handicap Play per match | Phase 5 discussion | 2026-03-20 |
| isConfirmed moved from MatchResultParticipant to MatchResultRecord (blueConfirmed/redConfirmed) | Phase 5 discussion | 2026-03-20 |
| refereeFullControl (default true): spectator referee can fill scores + confirm both sides | Phase 5 discussion | 2026-03-20 |
| Participant referee ignores refereeFullControl — confirms own side only | Phase 5 discussion | 2026-03-20 |
| Casual auto-finalize inline in submit_match_result (D-37) | Phase 6 CONTEXT.md | 2026-03-21 |
| 19-step finalization pipeline extracted to shared helper (step 19: cascade-deletes lobby) | Phase 6 execution / Phase 9 execution | 2026-03-22 / 2026-03-29 |
| Character stat increments (pick/ban/faced) during finalization | Phase 6 execution | 2026-03-22 |
| GlobalCharacterStat increments during finalization | Phase 6 execution | 2026-03-22 |
| Match replay archival: step rows + game history + participant history | Phase 6 execution | 2026-03-22 |
| Spectated count increment at finalization | Phase 6 execution | 2026-03-22 |
| requireOwnership on Lobby for pick validation helper | Phase 6 CONTEXT.md | 2026-03-21 |
| LobbySlot refactor: set_coach/remove_coach eliminated — coach via set_team_slot(BlueCoach/RedCoach) | Phase 9 execution | 2026-03-29 |
| TeamLabel renamed to TeamSide (same values: Blue, Red, Spectator) | Phase 9 execution | 2026-03-29 |
| Added record_game_scores (captain own-side, spectator referee full control), process_tournament_mmr (batch), handicap, draw scenarios | Phase 9 execution | 2026-03-29 |
| runFinalization step 19: cascade-deletes lobby after ephemeral cleanup | Phase 9 execution | 2026-03-29 |
| Finalization step 19 cascade-deletes lobby (not set Finished). submit_match_result transitions to AwaitingResult first. | Phase 9 execution | 2026-03-29 |
| MatchEndReason.Concede + ConcedeTrigger enum (Disconnect/VoluntaryLeave/RefereeDecision) (D-69, D-70, D-91) | Phase 10 execution | 2026-04-03 |
| MatchResultRecord: matchEndReason, concedeTrigger, concedeSummary, concedeAtStage columns added (D-58, D-71) | Phase 10 execution | 2026-04-03 |
| Concede finalization matrix: 3-tier (casual-nontourn/casual-tourn/ranked) x 3-stage (Drafting/Equipping/Scoring) branching in runFinalization (D-74, D-77-79) | Phase 10 execution | 2026-04-03 |
| Achievement check ALWAYS skipped for concede outcomes (D-76) | Phase 10 execution | 2026-04-03 |
| Bracket advancement NEVER auto-triggers for concede outcomes (D-80) — winnerTeamId set but placeParticipantInNextMatch not called | Phase 10 execution | 2026-04-03 |
| admin_force_finalize: resolves AwaitingResult match with winner via runFinalization (D-52) | Phase 10 execution | 2026-04-03 |
| admin_void_match: erases AwaitingResult match via hardDeleteLobby without finalization (D-53) | Phase 10 execution | 2026-04-03 |
| admin_set_bracket_winner: directly sets BracketMatch.winnerTeamId and advances bracket; requires winnerTeamId=0 (D-54) | Phase 10 execution | 2026-04-03 |
| Processed match protection: mmrProcessedAt blocks force-finalize and void (D-56) | Phase 10 execution | 2026-04-03 |
| submit_match_result param renamed to winnerId (u32, mapped to winnerTeamSide via MatchResultParticipant); override_match_result param renamed to winnerTeamSideTag (string); matchOutcome renamed to matchEndReason (Completed/Draw/Concede); tournamentId column removed from MatchResultRecord (derived via bracketMatchId FK) | Phase 10.1 execution | 2026-04-03 |

---

*Last updated: 2026-04-03*
