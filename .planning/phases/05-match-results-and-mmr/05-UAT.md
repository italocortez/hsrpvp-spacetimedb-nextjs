---
status: complete
phase: 05-match-results-and-mmr
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md]
started: 2026-03-21T11:00:00Z
updated: 2026-03-21T12:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Module published with --clear-database. Post-publish bootstrap completes. spacetime sql "SELECT * FROM user" returns SYSTEM user. No startup errors in logs.
result: pass

### 2. EloConfig Admin Setup
expected: Admin calls admin_seed_elo_config — creates row with defaults (K=40/20/10, thresholds 20/100, initial 1000, sizeBonus 150, spreadDivisor 2, maxAccountBonus 200). Admin calls admin_update_elo_config to change kFactorNew to 50 — row updates. Non-admin call rejected with permission error.
result: pass

### 3. Score Entry (Captain — Own Side)
expected: Create a MatchResultRecord. Blue captain calls record_game_scores for game 1 with cycles and screenshot URL. MatchResultGame row created with blue-side values filled, red-side values empty. Red captain calls record_game_scores for same game — red-side values filled. Captain trying to set opposite side's scores is rejected.
result: blocked
blocked_by: prior-phase
reason: "No lobby/match lifecycle reducers exist — MatchResultRecord creation requires lobby creation (Phase 9) → match start → record creation. Deferred to Phase 9 UAT."

### 4. Score Entry (Spectator Referee Full Control)
expected: Spectator referee (has refereeFullControl, no MatchResultParticipant row) calls record_game_scores — can set scores for either side (both blue and red fields). Participant referee (has MatchResultParticipant row) follows captain rules (own side only).
result: blocked
blocked_by: prior-phase
reason: "Requires MatchResultRecord + LobbyMember + MatchResultParticipant. Deferred to Phase 9 UAT."

### 5. Casual Match Auto-Validation
expected: MatchResultRecord with matchType=Casual. Captain calls submit_match_result — status immediately jumps to Validated (skips Submitted). No referee/admin validation needed for Casual.
result: blocked
blocked_by: prior-phase
reason: "Requires MatchResultRecord. Deferred to Phase 9 UAT."

### 6. Ranked Screenshot Gate
expected: MatchResultRecord with matchType=Ranked, status=Submitted. Admin/TO calls override_match_result to validate — rejected if any MatchResultGame row is missing teamBlueScreenshotUrl or teamRedScreenshotUrl. After adding screenshots, validation succeeds.
result: blocked
blocked_by: prior-phase
reason: "Requires MatchResultRecord + MatchResultGame. Deferred to Phase 9 UAT."

### 7. Finalize Casual Match (Full Lifecycle)
expected: Casual match at Validated status. Call finalize_match_result. MatchSessionHistory row written. MatchParticipantHistory rows written. PlayerStat rows incremented (wins/losses/matchesPlayed). Ephemeral records deleted (MatchResultRecord, MatchResultParticipant, MatchResultGame). No MMR changes (Casual skips MMR).
result: blocked
blocked_by: prior-phase
reason: "Requires MatchResultRecord in Validated status. Deferred to Phase 9 UAT."

### 8. Finalize Standalone Ranked Match (Full Lifecycle)
expected: Ranked match at Validated status with mmrProcessedAt=null. Call finalize_match_result. MMR processed inline: MmrRating rows updated with new rating+matchesPlayed, globalCompositeRating recalculated, MmrHistory rows written with delta. mmrProcessedAt stamped. Leaderboard rebuilt. History written. Stats incremented. Ephemeral records deleted.
result: blocked
blocked_by: prior-phase
reason: "Requires MatchResultRecord in Validated status. Deferred to Phase 9 UAT."

### 9. ELO Rating Correctness
expected: Two players at initial rating 1000, K=40 (first match). Player A wins. Player A's new rating > 1000, Player B's new rating < 1000. Deltas are symmetric (A's gain = B's loss). MmrHistory rows show previousRating, newRating, and delta.
result: blocked
blocked_by: prior-phase
reason: "Requires finalize_match_result on real match data. Deferred to Phase 9 UAT."

### 10. Global Composite MMR
expected: After a player has ratings in at least 2 game modes, globalCompositeRating = average of all 3 mode ratings (modes with no matches use initialRating 1000). Stored on MmrRating rows, not computed on-the-fly.
result: blocked
blocked_by: prior-phase
reason: "Requires MMR processing from real match data. Deferred to Phase 9 UAT."

### 11. Leaderboard Top 100
expected: After MMR processing, Leaderboard table has entries for each game mode + Global category. Only players with >= 2 matchesPlayed appear. Entries sorted by rating DESC. Max 100 per category. Rank column reflects position.
result: blocked
blocked_by: prior-phase
reason: "Requires MMR processing to populate leaderboard. Deferred to Phase 9 UAT."

### 12. mmrProcessedAt Double-Processing Guard
expected: Ranked match with mmrProcessedAt already set. Calling finalize_match_result again does NOT re-process MMR (guard prevents double processing). Ephemeral deletion still proceeds.
result: blocked
blocked_by: prior-phase
reason: "Requires MatchResultRecord with mmrProcessedAt set. Deferred to Phase 9 UAT."

### 13. Tournament Batch MMR (process_tournament_mmr)
expected: Tournament with countTowardsMmr=true at Completed stage. Multiple Ranked matches at Validated status with mmrProcessedAt=null. Call process_tournament_mmr. All matches get MMR processed, mmrProcessedAt stamped on each. MmrHistory rows written with matchHistoryId=0 sentinel. Leaderboard rebuilt once at end.
result: blocked
blocked_by: prior-phase
reason: "Requires tournament with MatchResultRecords. Deferred to Phase 9 UAT."

### 14. Bracket Advancement via Finalization (MTCH-08)
expected: Tournament bracket match at Validated status with bracketMatchId set. finalize_match_result advances the bracket (sets winnerTeamId on BracketMatch, places winner in next match). Bracket advancement and MMR happen atomically in same transaction.
result: blocked
blocked_by: prior-phase
reason: "Requires MatchResultRecord linked to BracketMatch. Deferred to Phase 9 UAT."

### 15. Account Rating Computation
expected: User with HsrAccount containing characters and lightcones. accountRating computed from roster cost data (0-1000 range). updateAccountRating recalculates when roster changes.
result: pass
notes: "TEMPORARY formula (Phase 5): each character = 5 × (1 + eidolonLevel), capped at 1000. updateAccountRating wired into batch_upsert_characters, batch_remove_characters, and admin variants during UAT."

## Summary

total: 15
passed: 3
issues: 0
pending: 0
skipped: 0
blocked: 12

## Gaps

[none — all blocked tests are prior-phase dependencies, not code issues]
