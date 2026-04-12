# Phase 9: Mouse Tracking, Chat, and Lobby Browser - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Full lobby lifecycle (create/join/leave/close/kick/ban), ephemeral chat system, lobby browser with projected view, complete draft system (Classic picks/bans with fixed sequences + Auction with dynamic nominations/bidding), post-draft flow (LC equip, lineup arrange, confirm), coach permission guard on all draft actions, cursor throttle, ready-up system, referee power configuration, ownership validation wiring, and all schema changes enabling the deferred test backlog from Phases 3/4/5/7.

This is the most critical phase of the project — it builds the complete match lifecycle chain that enables every deferred test.

Requirements: MOUS-01, MOUS-02, MOUS-03, CHAT-01, CHAT-02, CHAT-03, LBBY-01, LBBY-02

</domain>

<decisions>
## Implementation Decisions

### Lobby Visibility & Join Flow
- **D-01:** Two visibility modes only: Public and Private. Both visible in the lobby browser. Public = joinCode only. Private = joinCode + password. No invite-only mode.
- **D-02:** Password stored as plain string in LobbyPassword (private table, never broadcast). Simple comparison on join. Acceptable for ephemeral lobby session codes.
- **D-03:** joinCode included in the browser view — displayed in UI, copyable, and usable as a search/filter key. join_lobby accepts either lobbyId (from browser click) or joinCode (from search bar / manual paste).
- **D-04:** Joining during Drafting: reconnects (existing LobbyMember marked offline) + new spectators allowed. New players cannot join as Blue/Red during Drafting.

### Lobby Browser View
- **D-05:** Projected server-side view returning only browsing-relevant columns: id, joinCode, gameMode, draftMode, currentPlayerCount, isTournamentControlled, isAnonymousPlayers, stage, isPublic, matchType. Excludes config details (timers, budgets, penalties), disconnect settings, audit columns.
- **D-06:** Tournament name and cost set name resolved via cross-table PK lookup in the view (ctx.db.Tournament.id.find(), ctx.db.CostSet.id.find()). No egress cost — lookups are server-side. No denormalization needed.
- **D-07:** currentPlayerCount (u8) denormalized on Lobby — increment on join, decrement on leave. Zero-cost reads for the browser view.
- **D-08:** Finished lobbies excluded from browser view. Only Waiting + Drafting + Equipping + Scoring shown.
- **D-09:** Client-side filtering on the subscription result. At 100-user scale, lobby count is small enough.

### Chat System
- **D-10:** All lobby members (players, spectators, coaches, referees) can send chat messages.
- **D-11:** System messages for: player joined, player left, stage changes. ChatSenderType.System already exists.
- **D-12:** 500 character limit per message, server-enforced in reducer.
- **D-13:** Rolling window of 50 messages. Oldest deleted on insert when limit reached. Reduces reconnect egress.
- **D-14:** Metadata JSON schema defined now: `{ type: "text" | "reply" | "emoji_only", replyToMessageId?: number }`. emoji_only = standard OS Unicode emojis only (no custom shortcodes until v1). Reducer validates JSON parses correctly.
- **D-15:** Standard OS emojis are Unicode in content string (no asset cost). Custom emojis use `:shortcode:` syntax in content — frontend resolves to images from public/emojis/ in v1. Backend stores shortcodes as-is.
- **D-16:** Custom emoji implementation deferred to frontend milestone. No --clear-database needed later (metadata is JSON string convention, not schema).
- **D-17:** Reply to deleted message = frontend concern. Backend stores dangling replyToMessageId. Client renders "Reply to deleted message" gracefully.
- **D-18:** Anonymous enforcement: chat messages use anonymousLabel when lobby has anonymous mode. Same pattern as cursor events (Phase 6 D-01).

### Lobby Lifecycle
- **D-19:** Hard delete on close: delete all ChatMessage, LobbyMember, LobbyBan, LobbyPassword, LobbyCursorEvent rows, then delete Lobby row. Match data (MatchResultRecord, history tables) survives — already archived by finalization.
- **D-20:** close_lobby allowed in Waiting + Finished stages. Blocked during Drafting, Equipping, and Scoring to prevent mid-match data loss.
- **D-21:** Kick + Ban: host, admin, moderator can kick and ban. Ban creates LobbyBan row (lobbyId + bannedUserId). Banned user cannot rejoin. Ban table hard-deleted with lobby.
- **D-22:** One lobby at a time per user. Creating or joining fails if already in one.
- **D-23:** Guest restrictions: guests can create/join lobbies but enforced ClosedNoRating roster visibility and cannot play Ranked (join or host Ranked).
- **D-24:** Host always gets isReferee=true at lobby creation. Can transfer via existing transfer_referee. On disconnect of referee holder, flag returns to host (existing reclaim_referee logic).

### Lobby GC (Scheduled Cleanup)
- **D-25:** Scheduled cleanup reducer for abandoned/finished lobbies. Waiting + idle > 30 min: hard delete. Finished + idle > 30 min: hard delete. Active stages (Drafting/Equipping/Scoring): never auto-cleaned. Uses lastActivityAt timestamp. By the time a lobby is Finished, finalization has already archived all match data to history — safe to delete.

### Chat Moderation
- **D-26:** Host + referee + admin can delete individual chat messages via delete_chat_message(messageId). Replies to deleted messages = frontend renders "deleted" gracefully (dangling replyToMessageId).

### Team Assignment & Ready-Up
- **D-27:** All players join as Spectator. Free to move themselves to any slot. Host can move members. Overflow when spectator slots full: fill Blue → Red → Coach Blue → Coach Red.
- **D-28:** Free movement between Blue↔Red↔Spectator during Waiting. Moving auto-resets isConfirmed to false (for the mover only). Players can also manually unconfirm. Unconfirm blocked during the 3-second countdown after start_draft is called.
- **D-29:** isConfirmed (bool, default false) added to LobbyMember. Player calls confirm_ready / unconfirm_ready to toggle. start_draft rejects unless all Blue+Red non-coach players are confirmed. Spectators and coaches excluded from the check.
- **D-30:** isCaptain (bool) added to LobbyMember. Defaults to first non-coach player on each team at draft start. Host + referee (when refereeCanSetCaptain=true) can reassign via set_captain reducer.

### Settings & Configuration
- **D-28:** Lobby settings mutable in Waiting stage, locked once Drafting starts. Host can change game mode, draft mode, anonymous, budget, cost set, etc. during Waiting.
- **D-29:** matchType (Casual/Ranked) added to Lobby as config column. Set at creation, mutable during Waiting. Copied to MatchResultRecord at start_draft. Guest restriction: no Ranked.
- **D-30:** LobbyStage expanded: Waiting | Drafting | Equipping | Scoring | Finished. Enables per-stage validation in reducers (picks only in Drafting, equip only in Equipping, scores only in Scoring).
- **D-31:** BanMode.Two removed from enum (only None, Four, Six). Requires --clear-database.
- **D-31b:** LobbyPreset system: new table with all lobby config fields + name + isDefault (bool) + creatorUserId. Admins, moderators, and TOs can create presets. Permission hierarchy for edit/delete: admins can edit/delete any preset including defaults. Moderators can edit/delete their own presets, other moderator presets, and TO presets (not defaults). TOs can only edit/delete their own presets. create_lobby accepts optional presetId — copies all config from preset. Host can override any field during Waiting via "Advanced Settings". Seed system defaults at bootstrap (Standard Ranked, Standard Casual, Tournament Default).

### Referee Power Configuration
- **D-32:** All referee powers individually configurable on Lobby:
  - `refereeCanUndo` (bool, default true) — referee can undo last draft step
  - `refereeCanPause` (bool, default true) — referee can pause (unlimited)
  - `refereeCanSetCaptain` (bool, default true) — referee can assign captains
  - `refereeCanKick` (bool, default false) — referee can kick members
- **D-33:** `allowPlayerPause` (bool, default true) on Lobby — controls whether players get their 3 pauses per team. Independent from referee pause power.

### Cursor Broadcast
- **D-34:** Only players + coaches broadcast cursor. Spectators receive but don't send. broadcast_cursor silently ignores spectator calls.
- **D-35:** Client-side throttle only (30ms / ~33 updates per sec). No server-side throttle — event table auto-deletes prevent timestamp tracking without doubling writes. Throttle rate is frontend-only, changeable without backend changes.
- **D-36:** Frontend stops sending on tab blur (visibilitychange event). Only sends on actual mouse movement.
- **D-37:** Subscription scoping: client subscribes to `WHERE lobbyId = X` — server only pushes matching events. No cross-lobby cursor egress.
- **D-38:** Bandwidth math: max 8 broadcasters × 33/sec = 264 events/sec × 20 members × ~40 bytes = ~211KB/sec per active lobby. Acceptable at 5-10 concurrent drafting lobbies.

### Coach Guard
- **D-39:** Coaches blocked from ALL draft actions (pick, ban, nominate, bid, equip, arrange). Guard wired into existing step recording validation as a simple isCoach check. Coaches can see cursors and chat only.

### Ownership Validation
- **D-40:** pick_character wires ownership validation (ownershipValidation.ts helper from Phase 6 D-20). When Lobby.requireOwnership=true, validates character against HsrAccountCharacter. As promised in Phase 6.
- **D-41:** Lightcone ownership NOT validated. Players don't register owned LCs. LC equipping is unrestricted regardless of requireOwnership setting.

### Character Exclusivity & Timer Expiry
- **D-42:** allowMirrorPicks (bool) on Lobby, default false. When false: character locked after first pick (exclusive). When true: both teams can pick same character. Mirror picks only allowed on Casual matchType (enforced at lobby creation — Ranked forces allowMirrorPicks=false). Auction characters are always exclusive (removed from pool on AuctionSold).
- **D-43:** Turn timer expiry (AFK, not disconnected): default behavior is auto-pick EMPTY CHARACTER for Classic picks, auto-skip for Classic bans, auto-pick EMPTY CHARACTER for Auction nominations, auto-pass for Auction bids. Match continues without interruption.
- **D-43b:** autoRandomPick (bool, default false) on Lobby config. Classic mode only — ignored in Auction (Auction always uses EMPTY CHARACTER / auto-pass on timeout). When true + timer expires: reducer auto-picks a random character from the available pool (not picked/banned, owned if requireOwnership=true) instead of EMPTY CHARACTER. Auto-random bans pick from the global unbanned/unpicked pool. Requires ALL Blue+Red players to have an active HSR account with characters — start_draft validates this. Deterministic randomness via hash: (turnIndex * 31 + lobbyId) % availableCount. Frontend shows "auto-picking in 3...2...1..." countdown.
- **D-44:** refereeFullControl on MatchResultRecord updates dynamically when referee flag transfers. Spectator referee = true, player referee = false. Reflects current state, not locked at start_draft.
- **D-45:** Duplicate tournament lobby prevention: create_lobby rejects if a non-Finished lobby already exists for that bracketMatchId.

### Draft System — Classic Mode
- **D-46:** Fixed DraftStep[] sequences, turnIndex advances linearly:
  - **0ban (None):** 16 picks (8 per team, snake: B-RR-B-R-B-BB-RR-B-BB-RR-B-BB-R)
  - **4ban (Four):** 20 steps (2 bans → 4 picks → 2 bans → 12 picks)
  - **6ban (Six):** 22 steps (2 bans → 4 picks → 2 bans → 4 picks → 2 bans → 8 picks)
  - Exact sequences in notes/draft_order.md
- **D-47:** EMPTY CHARACTER at 0 cost, reusable. Passing on a pick = picking EMPTY CHARACTER. Same reducer, same step recording. Valid strategy in both Classic and Auction.

### Draft System — Auction Mode
- **D-48:** Hybrid approach: draftSequence contains ban steps only. After bans, dynamic auction phase with turn tracking.
- **D-49:** New MatchSession fields for auction state: isAuctionPhase (bool), nextNominatorTeam (TeamLabel), blueCharactersWon (u8), redCharactersWon (u8), currentNomination (string optional), currentBidAmount (f32 optional), currentBidTeam (TeamLabel optional).
- **D-46:** Steal-skip logic: if Blue nominates and Red wins the bid, Blue nominates again (Red's nomination turn is "spent" by winning). Keeps character count balanced.
- **D-47:** Nomination = automatic first bid at base cost (from cost table). Other team can outbid or pass. Each bid/pass uses standardTurnSeconds timer.
- **D-48:** Bidding flow: alternating bids (raise or pass). If a team passes, other team wins at their last bid amount. Budget deducted from winner.

### Auction Budget Model
- **D-49:** Two separate budgets: characterBudget (f32) + lightconeBudget (f32), both configurable on Lobby. Existing `auctionBudget` field replaced.
- **D-50:** Leftover character budget carries over to lightcone budget (additive).
- **D-51:** Leftover unspent budget = advantage. Leftover difference between teams = handicap input. Team with more unspent budget gets the handicap bonus. The auction bidding REPLACES the Classic cost table system for handicap calculation.
- **D-52:** Handicap formula unchanged: MoC/AA = -0.1875 cycles per cost point difference. Apocalyptic Shadow = +30 score per point difference. Input source differs by mode (Classic: cost table sums, Auction: budget spent).
- **D-53:** Server enforces budget cap: bid rejected if amount > remaining character budget. nomination rejected if base cost > remaining budget. Cannot go negative. Minimum raise amount enforced: bid must be ≥ currentBidAmount + Lobby.minimumBidRaise. New Lobby column: minimumBidRaise (f32, default 20). Configurable by host during Waiting.
- **D-54:** 0-cost characters available as fallback when budget exhausted.
- **D-55:** LCs not exclusive — both teams can use the same LC, same team can use duplicates. Strict LC budget enforcement (can't equip if cost > remaining LC budget). Plenty of 0-cost LCs available.

### Post-Draft Flow
- **D-56:** Lightcone equipping and lineup arrangement recorded as backend MatchSessionStep rows (not frontend-only). Enables match replay showing full decision history.
- **D-57:** 3 new ActionType variants: EquipLightcone, ArrangeLineup, ConfirmLineup. With matching StepPayload types.
- **D-58:** Host manually transitions between sub-phases (no auto-advance). "Ready for Scores" button signals scoring phase.
- **D-59:** Stage transitions: Drafting → Equipping (after draft complete) → Scoring (after lineups confirmed) → Finished (after finalization).

### Undo & Pause
- **D-60:** Undo: referee only (when refereeCanUndo=true), last step only. Decrements turnIndex. UndoPayload records originalSequenceId.
- **D-61:** Pause: any player (3 pauses per team limit, tracked on MatchSession as pausesUsedBlue/pausesUsedRed u8) + referee (unlimited, when refereeCanPause=true) + auto-pause on player/referee disconnect.
- **D-62:** Resume: referee OR the original pausing player can resume.

### Draft Reducers
- **D-63:** Separate reducers per action: pick_character, ban_character, nominate_character, place_bid, pass_bid. Classic uses pick+ban. Auction uses ban+nominate+bid+pass. Full validation in each (stage check, turn order, character availability, ownership, coach guard, budget).

### Tournament Lobby Creation & Integrity
- **D-64:** Anyone linked to a bracket match can create its lobby: match participants (via TournamentTeam), TO, tournament assistants, admins, moderators.
- **D-65:** Full settings inheritance from Tournament, locked. isTournamentControlled=true. Settings not changeable even in Waiting.
- **D-66:** Tournament lobbies enforce participant validation for PLAYER slots (Blue/Red). Spectator join stays open. To move to a player slot, user must be either: (a) a TournamentTeam participant for this bracket match, or (b) an approved stand-in via TournamentStandIn table.
- **D-67:** matchType derived from Tournament.countTowardsMmr at MatchResultRecord creation (existing pattern).
- **D-68:** Stand-in system: new TournamentStandIn table (bracketMatchId + userId PK, approvedByUserId, audit columns). TO/admin/moderator calls `approve_stand_in(bracketMatchId, userId)`. Anyone (inside or outside the tournament) can be approved. Approval can happen before or during the lobby.

### Anonymous Mode — Server-Enforced Read Layer
- **D-69:** Upgrade anonymous mode from courtesy (Phase 6 D-09) to server-enforced. Per-client views for ChatMessage, LobbyMember, MatchSessionStep, MatchResultParticipant. Shared helper: `shouldAnonymize(ctx, lobbyId, targetUserId) → bool`.
- **D-70:** View behavior: own team = real identities. Opponent team = userId=0 + anonymousLabel (when lobby anonymous mode on). Spectators = all players anonymized.
- **D-71:** Referee bypass: ONLY spectator referees (teamSlot=Spectator + isReferee=true) see all real identities. Player-referees (on a team) follow normal anonymous rules for opponents.

### Match History Visibility During Active Tournaments
- **D-72:** Add `isPubliclyVisible` (bool, default true) to MatchSessionHistory. At finalization of tournament matches: set to false. When tournament stage transitions to Completed/Cancelled: batch update all associated history records to true.
- **D-73:** Per-client view for MatchSessionHistory: non-participants see only rows where isPubliclyVisible=true OR they're in MatchParticipantHistory for that match. Prevents scouting during active tournaments.
- **D-74:** Standalone (non-tournament) matches: always isPubliclyVisible=true. No filtering.
- **D-75:** History tables keep real userIds (Phase 6 D-02 unchanged). Visibility is controlled by isPubliclyVisible flag, not by anonymizing the data.

### Host Disconnect
- **D-76:** Deferred to Phase 10. Phase 9 marks host offline (LobbyMember.isOnline=false). No auto-transfer of host role in Phase 9.

### Schema Changes Summary
- **D-77:** New Lobby columns: matchType, currentPlayerCount, characterBudget, lightconeBudget, minimumBidRaise (f32, default 20), allowMirrorPicks (bool, default false), autoRandomPick (bool, default false), refereeCanUndo, refereeCanPause, refereeCanSetCaptain, refereeCanKick, allowPlayerPause. Replace auctionBudget with characterBudget + lightconeBudget.
- **D-78:** New LobbyMember columns: isConfirmed, isCaptain.
- **D-71:** New MatchSession columns: isAuctionPhase, nextNominatorTeam, blueCharactersWon, redCharactersWon, currentNomination, currentBidAmount, currentBidTeam, pausesUsedBlue, pausesUsedRed, teamBlueCharBudget, teamRedCharBudget, teamBlueLcBudget, teamRedLcBudget. Existing teamBlueBudget/teamRedBudget may be repurposed or replaced.
- **D-79:** LobbyStage enum: add Equipping, Scoring variants.
- **D-80:** BanMode enum: remove Two variant.
- **D-81:** ActionType enum: add EquipLightcone, ArrangeLineup, ConfirmLineup.
- **D-82:** New table: LobbyBan (lobbyId + bannedUserId PK).
- **D-83:** New table: TournamentStandIn (bracketMatchId + userId PK, approvedByUserId, audit columns).
- **D-83b:** New table: LobbyPreset (id PK autoInc, name, isSystemPreset bool, creatorUserId, all lobby config fields, audit columns). System presets seeded at bootstrap.
- **D-84:** New MatchSessionHistory column: isPubliclyVisible (bool, default true).
- **D-85:** Requires --clear-database (enum changes).

### History Table Rework
- **D-86:** MatchSessionStepHistory: rename `characterName` → `targetName` (covers characters + lightcones). Update finalization extraction logic for new ActionTypes.
- **D-87:** MatchParticipantHistory: add isReferee, isCoach, isCaptain bools.
- **D-88:** MatchSessionHistory: add teamBlueSpent, teamRedSpent, handicapApplied (f32), isPubliclyVisible (bool) for post-match analysis + tournament scouting prevention.
- **D-89:** LobbyConfigSnapshot struct: replace auctionBudget with characterBudget + lightconeBudget.
- **D-90:** Finalization extraction logic: extend for EquipLightcone (targetName = LC name), ArrangeLineup (targetName = null, data in payload JSON), ConfirmLineup (targetName = null).
- **D-91:** Finalization for tournament matches: set isPubliclyVisible=false. Tournament completion (stage→Completed/Cancelled) batch updates to true.

### Server-Enforced Anonymous Views
- **D-92:** 4 per-client views: ChatMessage, LobbyMember, MatchSessionStep, MatchResultParticipant. Shared anonymization helper.
- **D-93:** 1 per-client view: MatchSessionHistory (isPubliclyVisible filter + participant check).

### Doc Updates (MANDATORY)
- **D-94:** match-session/architecture.md requires FULL REWRITE. Current doc describes columns that don't exist (currentPhase, currentTeam, currentStep, isPaused, isCompleted, rosterBlue, rosterRed) and wrong MatchSessionStepHistory structure (single JSON blob vs actual per-step rows).
- **D-95:** chat/architecture.md needs updates for rolling window, metadata schema, and ready-up integration.
- **D-96:** lobby/architecture.md needs updates for all new columns, LobbyBan table, TournamentStandIn table, LobbyStage expansion, and browser view changes.
- **D-97:** match-results/architecture.md needs update for budget-based handicap path (Auction vs Classic cost-table path).
- **D-98:** Existing Phase 5/6 tests referencing `characterName` on step history and `auctionBudget` on config snapshot must be updated for the renames.
- **D-99:** views/architecture.md needs update for all new per-client views (anonymous enforcement + history visibility).

### Claude's Discretion
- Exact StepPayload struct definitions for EquipLightcone, ArrangeLineup, ConfirmLineup
- LobbyBan table audit column inclusion
- System message content formatting
- Exact overflow fill logic when spectator slots are full
- Timer behavior during bidding (standard turn timer vs separate bid timer)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing tables (read before modifying)
- `spacetimedb/src/tables/lobby.ts` — Current Lobby schema, all columns
- `spacetimedb/src/tables/lobbyMember.ts` — Current LobbyMember schema
- `spacetimedb/src/tables/lobbyPassword.ts` — Private password storage
- `spacetimedb/src/tables/lobbyCursorEvent.ts` — Event table, ephemeral cursor
- `spacetimedb/src/tables/chatMessage.ts` — Chat schema with metadata field
- `spacetimedb/src/tables/matchSession.ts` — Draft state, timer, sequence
- `spacetimedb/src/tables/matchResult.ts` — MatchResultRecord schema
- `spacetimedb/src/tables/matchResultParticipant.ts` — isCaptain already exists here
- `spacetimedb/src/tables/matchResultGame.ts` — Per-game scores
- `spacetimedb/src/tables/matchSessionHistory.ts` — History table needing budget columns
- `spacetimedb/src/tables/matchSessionStepHistory.ts` — characterName → targetName rename
- `spacetimedb/src/tables/matchParticipantHistory.ts` — Needs role flag additions

### Existing reducers (read before extending)
- `spacetimedb/src/reducers/cursor.ts` — broadcast_cursor with anonymous mode
- `spacetimedb/src/reducers/scoreEntry.ts` — record_game_scores, captain validation
- `spacetimedb/src/reducers/matchResultSubmission.ts` — confirm/submit/dispute flow
- `spacetimedb/src/reducers/matchFinalization.ts` — finalize + process_tournament_mmr
- `spacetimedb/src/reducers/refereeManagement.ts` — transfer/reclaim/coach reducers
- `spacetimedb/src/helpers/finalizationHelpers.ts` — 18-step pipeline, step extraction logic (lines 267-291)
- `spacetimedb/src/helpers/anonymousLabels.ts` — Deterministic label computation
- `spacetimedb/src/helpers/ownershipValidation.ts` — Character ownership check helper

### Enums and structs
- `spacetimedb/src/types/enums.ts` — LobbyStage, BanMode, ActionType, ChatSenderType, DraftMode
- `spacetimedb/src/types/structs.ts` — DraftStep, StepPayload, TimerState, LobbyConfigSnapshot, all payloads

### Existing views
- `spacetimedb/src/views/securityViews.ts` — view_lobby_browser (line 22-26, needs replacement with projected version)

### Draft sequences
- `notes/draft_order.md` — Classic 0ban/4ban/6ban sequences. Auction sequences are dynamic (D-44).

### Architecture docs (read + update)
- `docs/match-session/architecture.md` — OUTDATED, needs full rewrite (D-82)
- `docs/chat/architecture.md` — Needs updates for rolling window + metadata (D-83)
- `docs/lobby/architecture.md` — Needs updates for new columns + tables (D-84)
- `docs/match-results/architecture.md` — Needs budget handicap path (D-85)

### Behavior contracts (read for deferred test context)
- `docs/tournament/contract.md` — Tournament creation, registration, stage advancement
- `docs/match-results/contract.md` — Score submission, confirmation, dispute flow

### Phase 6 context (anonymous play decisions)
- `.planning/phases/06-anonymous-play-and-player-stats/06-CONTEXT.md` — D-01 through D-48, especially anonymous write-layer enforcement, roster visibility, ownership helper

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ownershipValidation.ts`: Character ownership check helper — wire into pick_character (D-40)
- `anonymousLabels.ts`: computeAnonymousLabel — reuse for chat anonymous enforcement
- `ensurePermissions.ts`: getAuthenticatedUser, isRoleAtLeast — reuse for all new reducers
- `auditColumns.ts`: auditInsert, auditUpdate — standard on all new rows
- `finalizationHelpers.ts`: runFinalization — already called by submit_match_result for casual auto-finalize
- `refereeManagement.ts`: transfer_referee, reclaim_referee, set_coach, remove_coach — existing patterns for LobbyMember manipulation

### Established Patterns
- Event table pattern (LobbyCursorEvent): insert → broadcast → auto-delete. Use for cursor, NOT for chat (chat needs rolling window).
- Composite PK pattern: LobbyMember[lobbyId, userId], MatchResultParticipant[matchResultId, userId]
- Anonymous enforcement: userId=0 + anonymousLabel on public-facing rows
- Captain confirmation flow: isCaptain on MatchResultParticipant → blueConfirmed/redConfirmed on MatchResultRecord
- refereeFullControl: derived from referee's team slot (spectator = full control)

### Integration Points
- start_draft creates: MatchSession + MatchResultRecord + MatchResultParticipant rows. Copies isCaptain from LobbyMember. Sets refereeFullControl based on referee's team slot.
- close_lobby cascade: ChatMessage + LobbyMember + LobbyBan + LobbyPassword + LobbyCursorEvent + Lobby
- finalizationHelpers.ts step extraction (lines 267-291): extend for EquipLightcone/ArrangeLineup/ConfirmLineup
- LobbyConfigSnapshot in finalizationHelpers.ts (lines 237-261): update for characterBudget/lightconeBudget
- securityViews.ts view_lobby_browser (lines 22-26): replace with projected version

</code_context>

<specifics>
## Specific Ideas

- "EMPTY CHARACTER" at 0 cost is a strategic element — use to counter solo-character compositions via synergy cost calculations
- Auction steal-skip mechanic inspired by fairness: the team that "steals" spends a nomination turn, keeping character counts balanced
- Budget-as-cost model means auction replaces the cost table system entirely for handicap calculation — elegant unification
- Ready-up system prevents premature draft starts — all players must confirm

</specifics>

<deferred>
## Deferred Ideas

- Custom emoji asset format (WebP/SVG/PNG) and frontend emoji registry — v1 frontend milestone
- Emoji caching strategy (CDN, browser cache) — v1 frontend concern
- Host disconnect auto-transfer (host → referee → next player) — Phase 10
- Disconnect forfeit timer wiring — Phase 10
- Sabotage round for LC budget (explored during discussion, replaced by budget-as-cost model)
- Tournament lobby join validation was upgraded from "open join" to "participant + stand-in whitelist" during discussion — now included as D-66/D-68
- Lightcone ownership validation — not needed since players don't register owned LCs

### Deferred Tests Enabled by Phase 9
Phase 9 must build the complete lifecycle chain so these deferred tests can finally run:
- **Phase 3**: Tests 12 (referee transfer), 13 (score confirmation), 14 (dispute), 15 (tournament admin ops), 17 (coach management)
- **Phase 4**: Tests 9-12 (bracket advance, submit_and_advance, rollback, DQ auto-advance)
- **Phase 5**: Tests 3-14 (score entry, auto-validation, finalization, ELO, MMR, leaderboard, bracket advancement via finalization)
- **Phase 7**: Test 11 (achievement auto-award via finalization pipeline step 16.5)

</deferred>

---

*Phase: 09-mouse-tracking-chat-and-lobby-browser*
*Context gathered: 2026-03-29*
