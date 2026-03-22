---
status: partial
phase: 06-anonymous-play-and-player-stats
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md]
started: 2026-03-22T03:00:00Z
updated: 2026-03-22T04:15:00Z
---

## Current Test

[testing paused — 10 items deferred to Phase 9]

## Tests

### 1. Season Admin — Create Season
expected: Admin calls `create_season` reducer with name, startDate, endDate. `spacetime sql "SELECT * FROM season"` shows one row with autoInc id, correct name/dates, isActive=false, audit columns populated.
result: pass

### 2. Season Admin — Single-Active Guarantee
expected: Create a second season. Call `set_active_season` on season 1 — it becomes active. Call `set_active_season` on season 2 — season 1 deactivates, only season 2 is active. `SELECT * FROM season` confirms exactly one isActive=true row at any time.
result: pass

### 3. Schema — 4 New Tables Exist
expected: `spacetime sql "SELECT COUNT(*) FROM season"`, `"SELECT COUNT(*) FROM global_character_stat"`, `"SELECT COUNT(*) FROM tournament_player_account"`, `"SELECT COUNT(*) FROM match_result_game_history"` all return 0 (tables exist, empty). No SQL errors.
result: pass

### 4. Schema — PlayerStat PK Expansion
expected: `spacetime sql "DESCRIBE player_stat"` shows columns including userId, gameMode, draftMode, seasonId, matchType, teamSize in the primary key. All 6 PK fields present.
result: pass

### 5. Lobby Schema — Anonymous and Roster Columns
expected: `spacetime sql "DESCRIBE lobby"` shows rosterVisibility (enum/string), requireOwnership (bool), isTournamentControlled (bool) columns. isOpenRoster column no longer exists (replaced by rosterVisibility enum).
result: pass

### 6. MatchSessionStepHistory — Individual Step Rows
expected: `spacetime sql "DESCRIBE match_session_step_history"` shows matchHistoryId + sequence as composite PK, with individual columns (stepNumber, actorUserId, actorDisplayName, payload, etc.) instead of a single JSON blob.
result: pass

### 7. TournamentPlayerAccount — Registration Locks Accounts
expected: After bootstrap + creating a user with HSR accounts + creating a tournament, calling `register_for_tournament` creates TournamentPlayerAccount rows for ALL of the user's HSR accounts (not just active). SQL confirms one TPA row per account.
result: pass

### 8. TournamentPlayerAccount — Withdrawal Cleans Up
expected: After test 7, calling `withdraw_from_tournament` deletes all TournamentPlayerAccount rows for that user+tournament. SQL confirms zero TPA rows for the withdrawn user.
result: pass

### 9. Anonymous Label Computation
expected: computeAnonymousLabel produces deterministic team-based labels: "Blue-1", "Blue-2" for blue team by join order; "Red-1", "Red-2" for red; "Coach-Blue", "Coach-Red" for coaches; "Spectator-1" for spectators. Same inputs always produce same label.
result: blocked
blocked_by: prior-phase
reason: "Requires Lobby with LobbyMembers — lobby CRUD reducers don't exist until Phase 9"

### 10. broadcast_cursor Anonymous Mode Enforcement
expected: In an anonymous lobby, calling broadcast_cursor writes LobbyCursorEvent with userId=0 and anonymousLabel (e.g., "Blue-1") instead of the real userId. Non-anonymous lobbies write real userId with anonymousLabel=undefined.
result: blocked
blocked_by: prior-phase
reason: "Requires Lobby with LobbyMembers — lobby CRUD reducers don't exist until Phase 9"

### 11. Per-User Stat Visibility Views
expected: Private stat tables (PlayerStat, PlayerCharacterStat, PlayerRelationship) are not visible in global subscriptions. Calling view_my_player_stats / view_my_character_stats / view_my_relationships returns only the calling user's own rows.
result: blocked
blocked_by: prior-phase
reason: "Requires stat rows from finalization, which requires lobby lifecycle (Phase 9)"

### 12. Per-User Roster Visibility View
expected: view_my_roster_visibility returns own+allies' rosters always. For opponents: OpenRoster shows full roster, ClosedWithRating shows only accountRating, ClosedNoRating hides everything. Referee override shows all rosters regardless.
result: blocked
blocked_by: prior-phase
reason: "Requires Lobby with participants and team assignments — lobby CRUD reducers don't exist until Phase 9"

### 13. Finalization Pipeline — Full 18-Step Lifecycle
expected: After a match result reaches Validated status, calling finalize_match_result runs all 18 steps: ELO calculation, stats increment, character stats, global stats, best ally/nemesis, match replay archival, ephemeral cleanup, spectated count, leaderboard rebuild.
result: blocked
blocked_by: prior-phase
reason: "Requires MatchResultRecord + Lobby + LobbyMember prerequisite data — lobby lifecycle reducers don't exist until Phase 9"

### 14. Auto-Finalize Casual Match
expected: When both players submit matching scores in a casual match, submit_match_result auto-validates AND auto-finalizes in one transaction.
result: blocked
blocked_by: prior-phase
reason: "Requires Lobby + MatchResultRecord — lobby lifecycle reducers don't exist until Phase 9"

### 15. Character Stat Increments — Pick/Ban/Faced
expected: After finalization: picked characters get matchesPlayed/wins/losses incremented. ALL participants get timesBannedInMatch incremented for each ban. Opponents' picked characters get timesFaced/winsAgainst/lossesAgainst incremented.
result: blocked
blocked_by: prior-phase
reason: "Requires finalization pipeline to run, which requires lobby lifecycle (Phase 9)"

### 16. Global Character Stat Aggregates
expected: After finalization: GlobalCharacterStat rows created/updated with community-wide timesPicked, timesWon, timesBanned per character+gameMode combination.
result: blocked
blocked_by: prior-phase
reason: "Requires finalization pipeline to run, which requires lobby lifecycle (Phase 9)"

### 17. Season-Aware Leaderboard Rebuild
expected: Leaderboard entries include seasonId. Rebuilding leaderboard filters by active season. Pre-season entries use seasonId=0.
result: blocked
blocked_by: prior-phase
reason: "Requires finalization pipeline to produce leaderboard entries — lobby lifecycle (Phase 9)"

### 18. Spectated Count Tracking
expected: At finalization, spectators present in the lobby get matchesSpectated incremented on their PlayerStat row.
result: blocked
blocked_by: prior-phase
reason: "Requires finalization with spectators in lobby — lobby lifecycle (Phase 9)"

## Summary

total: 18
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 10

## Gaps

[none — all blocked tests are prior-phase dependencies, not code issues]
