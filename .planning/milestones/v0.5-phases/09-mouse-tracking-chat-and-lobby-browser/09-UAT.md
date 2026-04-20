---
status: complete
phase: 09-mouse-tracking-chat-and-lobby-browser
source: [09-01-SUMMARY.md, 09-02-SUMMARY.md, 09-03-SUMMARY.md, 09-04-SUMMARY.md, 09-05-SUMMARY.md, 09-06-SUMMARY.md, 09-07-SUMMARY.md, 09-08-SUMMARY.md, 09-09-SUMMARY.md]
started: 2026-03-29T18:00:00Z
updated: 2026-03-29T23:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Create Lobby — Host Becomes Referee (LBBY-01, LBBY-02)
expected: create_lobby inserts Lobby (stage=Waiting, currentPlayerCount=1) and LobbyMember (host userId, teamSlot=Spectator, isReferee=true)
result: pass
notes: Verified pre-schema-change; behavior unchanged by ParticipationRole/cap changes

### 2. Join Lobby — Public + Private Password (LBBY-01, LBBY-02)
expected: UserB joins via joinCode → currentPlayerCount=2. Create private lobby with password → join with wrong password fails, correct password succeeds.
result: pass
notes: password_hash column name is cosmetic — no actual hashing for lobby passwords (plain string, private table)

### 3. One-Lobby Enforcement (LBBY-01)
expected: User already in lobbyA tries to create or join lobbyB → error "Already in a lobby"
result: pass

### 4. Leave Lobby — Count Decrement (LBBY-01)
expected: User calls leave_lobby → LobbyMember deleted, Lobby.currentPlayerCount decrements by 1
result: pass
notes: Fixed during UAT — server-generated 6-char join codes (Jackbox-style), duplicate joinCode guard added, joinCode param now ignored by server

### 5. Send Chat + Metadata + 500-Char Limit (CHAT-01, CHAT-02)
expected: send_chat_message inserts ChatMessage with content and senderUserId. Metadata '{"type":"text"}' accepted, invalid JSON rejected. Content > 500 chars rejected.
result: pass
notes: Fixed during UAT — empty metadata now defaults to {"type":"text"} server-side instead of storing none

### 6. Kick + Ban Members (LBBY-02)
expected: Host kicks playerB → LobbyMember deleted, playerB can rejoin. Host bans playerC → LobbyBan row created, playerC tries rejoin → error.
result: pass
notes: Re-verified post-schema-change (ParticipationRole refactor, --clear-database). New schema confirmed: participation_role column present, no is_coach column.

### 7. Close Lobby — Cascade Delete (LBBY-01)
expected: Host calls close_lobby in Waiting → Lobby, LobbyMember, LobbyBan, LobbyPassword, ChatMessage rows all deleted. Query each table → 0 rows for that lobbyId.
result: pass
notes: Re-verified post-schema-change on fresh DB.

### 8. Chat Rolling Window — 50 Messages (CHAT-01)
expected: Insert 50 messages → count=50. Insert 51st → count still 50, oldest message deleted.
result: pass
notes: Verified pre-schema-change; behavior unchanged by ParticipationRole/cap changes

### 9. Delete Chat — Permission Check (CHAT-01)
expected: Host calls delete_chat_message → message deleted. Regular player calls delete_chat_message → error. Dangling replyToMessageId allowed (no cascade).
result: pass
notes: Re-verified post-schema-change. Reply sent after deletion referencing deleted msg id accepted.

### 10. Lobby Browser Projected View (LBBY-01)
expected: view_lobby_browser returns rows with joinCode, gameMode, currentPlayerCount, stage. Finished lobbies excluded. Config details (timers, budgets) not in response.
result: pass
notes: Code-verified — procedural anonymousView not callable via harness/SQL but code review confirms correct projected columns, Finished exclusion via stage btree, and tournament/costSet name resolution.

### 11. Cursor Spectator Silencing (MOUS-01, MOUS-02)
expected: Blue player calls broadcast_cursor(x,y) → LobbyCursorEvent inserted. Spectator calls broadcast_cursor → silently returns, no event row inserted.
result: pass
notes: LobbyCursorEvent is event table (auto-deletes). Blue call succeeded, Spectator call silently returned. No SQL verification possible for event tables.

### 12. Team Slot + Confirm/Unconfirm + Move Resets (LBBY-01)
expected: set_team_slot(Blue) → LobbyMember.teamSlot=Blue. confirm_ready → isConfirmed=true. set_team_slot(Red) → isConfirmed auto-resets to false. unconfirm_ready works.
result: pass

### 13. start_draft Validation — All Confirmed (MOUS-03)
expected: 1+ Blue + 1+ Red confirmed required. Unconfirmed → error. All confirmed → MatchSession + MatchResultRecord + MatchResultParticipant created, stage=Drafting.
result: pass
notes: Tested with 1v1 (asymmetric allowed). Auto-captain assignment confirmed for sole player per team.

### 14. Classic Pick/Ban — Turn Order + Coach Guard (MOUS-03)
expected: pick_character inserts MatchSessionStep, advances turnIndex. Wrong-turn player rejected. Coach calls pick_character → error. ban_character works on ban turns.
result: pass
notes: Coach guard uses new participationRole.tag === 'Coach' check. Six-ban sequence verified.

### 15. Character Exclusivity — Mirror Picks (MOUS-03)
expected: allowMirrorPicks=false → Blue picks "firefly", Red picks "firefly" → error "Character already picked."
result: pass

### 16. Timer Expiry — Auto-Pick EMPTY (MOUS-03)
expected: timer_expiry_classic on pick turn → auto-picks EMPTY CHARACTER at 0 cost. On ban turn → auto-skips with "SKIP". System actor userId=0.
result: pass
notes: Used standardTurnSeconds=1 with 2s wait. Server validates elapsed time. Ban auto-skips as "SKIP", pick auto-picks "EMPTY" at cost 0. Client-driven timer with server-side validation (no server-side scheduled timeout).

### 17. Auction — Nominate/Bid/Pass + Budget (MOUS-03)
expected: nominate_character sets currentNomination at base cost from cost table. place_bid enforces >= currentBidAmount + minimumBidRaise. Budget cap: bid > remaining budget → error. pass_bid resolves: AuctionSold step, budget deducted.
result: pass
notes: Bug found & fixed: costRow.auctionCosts → costRow.auctionBaseBid (wrong field name caused PANIC). Hotfixed and re-verified. Nominate/bid/pass/AuctionSold flow + budget enforcement all working.

### 18. Auction — Steal-Skip + End Condition (MOUS-03)
expected: Blue nominates, Red wins bid → nextNominatorTeam stays Blue (steal-skip). Auction ends when both teams have 8 characters (fixed, not 8*teamSize). Coach blocked from all auction actions.
result: pass
notes: Bug found & fixed: isAuctionPhase not set when banMode=None + Auction mode (empty ban sequence). Fixed in start_draft. Steal-skip confirmed (Blue keeps turn after Red steals). End condition at 8/8 → Equipping verified.

### 19. Undo + Pause/Resume (MOUS-02, MOUS-03)
expected: Referee undo_last_step → turnIndex decrements, Undo step inserted. refereeCanUndo=false → error. Player pause_draft → pausesUsedBlue increments (max 3). Referee pause unlimited. allowPlayerPause=false → player blocked. Resume restores timer.
result: pass
notes: Lobby A (all enabled): undo deleted pick step, inserted Undo audit record (originalSequenceId=2), turnIndex 3→2. Player pause incremented pausesUsedBlue 0→1, referee pause left counters unchanged. Resume restored timer. Lobby B (disabled): all three rejection errors correct.

### 20. Equip LC + Budget + Stage Transitions (CHAT-03)
expected: equip_lightcone inserts EquipLightcone step, deducts from teamBlueLcBudget. advance_stage transitions Drafting→Equipping→Scoring→Finished. System chat message on each transition. Coach blocked from equip/arrange.
result: pass
notes: Budget rollover confirmed (charBudget 500 + lcBudget 300 = 800). equip_lightcone deducted 0.5 (asecretvow S1). System chats: "Draft complete. Stage: Equipping" and "Lineups set. Stage: Scoring". Coach blocked from equip and arrange. Scoring→Finished correctly requires finalize_match_result.

### 21. Budget Carryover — Char→LC at Equipping (MOUS-03)
expected: After draft, leftover characterBudget carries to lightconeBudget. E.g., 500 char budget, spent 400 → 100 carries to LC budget. teamBlueLcBudget = originalLcBudget + 100.
result: pass
notes: Classic mode doesn't consume charBudget during picks (budget is Auction-only). Full 500 carried to lcBudget (300+500=800). D-50 formula confirmed: newLcBudget = oldLcBudget + remainingCharBudget. Auction-mode partial spend verified in tests 17-18.

### 22. Tournament Lobby + Stand-In (LBBY-01)
expected: create_tournament_lobby inherits Tournament settings, isTournamentControlled=true. update_lobby_settings locks tournament-integrity fields but allows referee QoL fields. Duplicate bracketMatchId → error. approve_stand_in creates TournamentStandIn row. Approved user can set_team_slot(Blue).
result: pass
notes: Full tournament lifecycle tested (create→register→seed→bracket→InProgress→lobby). isTournamentControlled=true confirmed. Settings split implemented during UAT: locked fields (teamSize, gameMode, matchType, anonymity, rosterVisibility, costSetId, disconnectPolicy, allowMirrorPicks) preserved; free fields (draftMode, banMode, timers, budgets, referee powers, aliases) changeable. Duplicate bracketMatchId blocked. Stand-in approved and joined Blue slot.

### 23. Anonymous Mode — Server-Enforced Views (MOUS-02, CHAT-01)
expected: Anonymous lobby: own-team chat shows real userId. Opponent chat shows userId=0 + anonymousLabel. Spectator referee (isReferee=true, Spectator slot) sees all real identities. Player-referee on Blue sees Red anonymized.
result: pass

### 24. Lobby Preset — Create + Load (LBBY-01, LBBY-02)
expected: create_lobby_preset saves config with name. create_lobby(presetId=X) → Lobby fields match preset values. Admin can delete any preset. TO can only delete own.
result: pass
notes: Preset created with correct fields. create_lobby validates presetId existence (frontend copies values, backend validates reference). Invalid presetId=999 rejected. TO can't delete another TO's preset. Admin can delete any. Owner can delete own. No locking — presets are templates only.

### 25. Lobby Cap Enforcement — teamSize + Coach + Spectator Limits (NEW)
expected: set_team_slot to Blue when Blue has teamSize players → error. set_team_slot to Blue as Coach when Blue already has a coach → error. join_lobby when lobby has 20 members → error. join_lobby when 12 spectators → error.
result: pass
notes: All caps verified with teamSize=1 lobby. LobbySlot refactor executed during UAT: merged teamSlot+participationRole into single LobbySlot enum (BluePlayer, BlueCoach, RedPlayer, RedCoach, Spectator). TeamLabel renamed to TeamSide. set_coach/remove_coach eliminated — coach assignment now via set_team_slot with host/referee guard. Published with --clear-database. Smoke test confirmed: BluePlayer, BlueCoach, Spectator transitions, coach self-assign blocked.

## Summary

total: 25
passed: 25
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]

## Schema Changes During UAT

- **ParticipationRole refactor**: `{ Player, Spectator }` → `{ Player, Coach }`. Dropped `isCoach` boolean from LobbyMember. Coach status now via `participationRole.tag === 'Coach'`. Required --clear-database.
- **Lobby cap enforcement**: Added to `set_team_slot` (players <= teamSize, coaches <= 1, spectators <= 12) and `join_lobby` (total <= 20, spectators <= 12). New test 25 added.
- **Auction end condition**: Fixed from `8 * teamSize` to fixed `8` (game mode driven).
- **Tournament settings split**: `isTournamentControlled` no longer blanket-locks all settings. Tournament-integrity fields (teamSize, gameMode, matchType, anonymity, rosterVisibility, costSetId, disconnectPolicy, allowMirrorPicks) are locked; referee/match QoL fields (draftMode, banMode, timers, budgets, referee powers, aliases) are free.
- **LobbySlot refactor**: Merged `teamSlot` (TeamLabel) + `participationRole` (ParticipationRole) into single `lobbySlot` (LobbySlot: BluePlayer, BlueCoach, RedPlayer, RedCoach, Spectator). TeamLabel renamed to TeamSide. set_coach/remove_coach reducers eliminated — coach assignment via set_team_slot with host/referee guard. Required --clear-database.
- **Coach-Spectator invariant**: Coaches must be on Blue or Red. Moving a coach to Spectator reverts to Spectator. Self-assigning coach role blocked — host/referee only.
- **Affected files**: 16 backend source, 7 docs, 6 match/history table imports, regenerated bindings.
