# Phase 10: Disconnect Handling and Cost Parity - Context

**Gathered:** 2026-03-31 (in progress — ParticipantStatus lifecycle still to discuss)
**Status:** Discussion in progress

<domain>
## Phase Boundary

Disconnect behavior is configurable and safe, rejoins preserve full match state, pick/ban reducers are guarded against post-forfeit action, and admin tools exist for resolving stuck matches. Lightcone cost table already has game-mode parity (COST-01 complete). Deferred Phase 9 items (ParticipantStatus gaps, admin bracket override, AwaitingResult resolution) are folded in.

Requirements: DISC-01, DISC-02, DISC-03, DISC-04, COST-01

</domain>

<decisions>
## Implementation Decisions

### Disconnect Detection
- **D-01:** Rely on SpacetimeDB's built-in `clientDisconnected` lifecycle hook for detection. No application-level heartbeat. WebSocket ping/pong handles keepalive at the transport layer. Detection time: instant for clean closes, ~10-30s for network drops.
- **D-02:** No heartbeat reducer needed. The 60s grace period absorbs detection delay. SpacetimeDB client SDK auto-reconnects. Bandwidth/energy priority — 100 users x 1 ping/second would be 100 reducer calls/second, unacceptable.
- **D-03:** Players are expected to keep browser tabs open during Scoring (alt-tab to play HSR). Backgrounded tabs maintain WebSocket connections. `clientDisconnected` only fires on actual tab close / network loss.

### DisconnectPolicy Enum Rework
- **D-04:** Rename enum variants: `TimerThenForfeit` → `Standard`, `Pause` → `Deferred`, `NoAction` stays. Requires `--clear-database`.
- **D-05:** **Standard** (default): 60s pause on player disconnect → opponent can call forfeit after grace expires (or wait, sportsmanship). For all matches.
- **D-06:** **Deferred**: 60s pause on player disconnect → NO forfeit call available. Players call `defer_match` to shelve to AwaitingResult. TO/Admin resolves later. For tournament matches where TOs control outcomes.
- **D-07:** **NoAction**: No pause, no pool, no forfeit mechanism. Just `isOnline=false`. Concede is the only exit. For casual/practice lobbies.

### Grace Period & Disconnect Pool
- **D-08:** 60s grace period always triggers on any player disconnect (Standard and Deferred policies). Game auto-pauses using internal pause logic — insert Pause step with `isAutoPause=true`. Does NOT count toward 3-per-team player pause limit.
- **D-09:** Grace period configurable via `Lobby.disconnectForfeitSeconds` (default 60).
- **D-10:** 5-minute disconnect pool per player per match. Tracked via `LobbyMember.disconnectPoolRemainingMs` (initialized at match start at `start_draft`). Every disconnect decrements pool by time spent disconnected. When depleted: Standard → forfeit eligible immediately (no grace). Deferred → auto-shelve to AwaitingResult immediately.
- **D-11:** Reconnect within grace clears `disconnectedAt` and cancels pending forfeit eligibility. If draft was auto-paused (`isAutoPause=true`), auto-resume timer from `accumulatedPauseMs`.

### Forfeit Timer — Dual Check
- **D-12:** Reducer guard (fast path): Every draft/equip/score reducer calls `ensureMatchAlive(ctx, lobby)` at the top. Computes forfeit eligibility from per-player `disconnectedAt` values — "are ALL players on a team offline with `now - disconnectedAt > disconnectForfeitSeconds`?"
- **D-13:** lobby_gc (safety net): Extended to check active lobbies (Drafting/Equipping/Scoring) where ALL members are offline + idle > 30 min → hard delete (void, no winner). Catches abandoned lobbies where no reducer fires.
- **D-14:** Race safety: If both reducer guard and GC try to act, the second finds lobby in wrong state and no-ops.

### Standard Policy Flow
- **D-15:** After grace expires, opposing team can call `call_forfeit(lobbyId)` → disconnected team loses → lobby → AwaitingResult → finalization.
- **D-16:** In team matches (2v2+): forfeit only callable when ALL players on the opposing team are offline > grace period. If one teammate is still active, opposing team cannot call forfeit.
- **D-17:** Team with disconnected player can self-forfeit at any time via `call_forfeit` targeting their own team.

### Deferred Policy Flow
- **D-18:** After grace expires: NO forfeit call available to opposing team.
- **D-19:** Remaining players can wait as long as they want for reconnect.
- **D-20:** When they want out: call `defer_match(lobbyId)` — only exit besides waiting.
- **D-21:** `defer_match` generates deterministic `deferralSummary` string on MatchResultRecord capturing: who disconnected, when, at what draft state, pool remaining, who triggered deferral.
- **D-22:** Lobby → AwaitingResult, all players freed. TO resolves later.

### NoAction Policy Flow
- **D-23:** No pause, no pool, no forfeit. `clientDisconnected` still sets `LobbyMember.isOnline=false` (tracking only).
- **D-24:** Remaining player's exit: concede (surrender own side). If everyone leaves: GC catches after 30 min idle.
- **D-25:** No `disconnectPoolRemainingMs` or `disconnectedAt` tracking for NoAction lobbies.

### Concede (Universal)
- **D-26:** `concede_match(lobbyId)` available in ALL policies, at ANY time, for either side (non-spectator/non-coach players).
- **D-27:** Conceding team loses. Creates MatchResultRecord with `matchOutcome=Forfeit`, `status=Validated`, sets `winnerTeamId` on BracketMatch if tournament.
- **D-28:** Lobby → AwaitingResult → normal finalization pipeline. Handles mid-draft concede by skipping Equipping/Scoring stages.

### Voluntary Leave Button
- **D-29:** Spectators/Coaches: clean `LobbyMember` deletion. No `voluntarilyLeft` flag. Available in any stage. Zero gameplay impact.
- **D-30:** Players during Waiting: existing behavior — remove member, decrement counter, auto-close if empty.
- **D-31:** Players during Drafting/Equipping/Scoring: set `voluntarilyLeft=true`, `isOnline=false` on LobbyMember (row KEPT for finalization archival). Transfer captain/referee flags. If last player on team → team forfeits.
- **D-32:** `voluntarilyLeft=true` players cannot rejoin (blocks reconnect in `join_lobby`). Immediately freed to join other lobbies (`ensureNotInLobby` skips `voluntarilyLeft` members).
- **D-33:** No grace period, no pool consumed — they chose to leave.

### Flag Transfers on Disconnect/Leave
- **D-34:** Captain: transfers to next non-coach player on same team. Permanent for session (no transfer back on reconnect).
- **D-35:** Referee: transfers to host first, then next eligible online non-spectator/non-coach. Permanent for session.
- **D-36:** Host: transfers to referee (if online), then longest-tenured non-coach/non-spectator member. Permanent for session. If no eligible member, host stays (GC handles abandoned lobby).

### Rejoin Flow
- **D-37:** Extend `join_lobby` to handle reconnect in Equipping, Scoring, and AwaitingResult stages (same pattern as existing Drafting reconnect: find offline member → set `isOnline=true`).
- **D-38:** Block reconnect if `voluntarilyLeft=true`.
- **D-39:** On reconnect: clear `disconnectedAt`, cancel pending forfeit timer. If draft was auto-paused, auto-resume.
- **D-40:** If match was already forfeited/deferred while gone: reconnect succeeds but lobby is in AwaitingResult — no actions possible.

### ensureNotInLobby Fix
- **D-41:** Extend to also skip members where `voluntarilyLeft=true` (new). Existing AwaitingResult skip stays.
- **D-42:** Disconnected players (isOnline=false, voluntarilyLeft=false) stay locked in until match resolves → AwaitingResult → freed by existing skip.

### Draft Turns Are Team-Based
- **D-43:** Draft sequence is `[{teamTurn, actionRequired}]` — team turns, not individual. Captain picks/bans/bids for the team. If no captain, any non-coach team member can act.
- **D-44:** When a player leaves/disconnects in 2v2+: captain transfers, new captain takes all turns. No draft sequence modification needed.

### AwaitingResult — Never Auto-GC'd
- **D-45:** Preserves MatchSession, MatchSessionStep, LobbyMember for finalization archival. Tournament matches may sit in AwaitingResult for weeks.
- **D-46:** Admin-only resolution: `admin_force_finalize` or `admin_void_match`.

### lobby_gc Extension
- **D-47:** Uniform across active stages. Drafting/Equipping/Scoring: ALL members offline + idle 30 min → hard delete (void, no winner). Scoring does NOT get special treatment — players expected to keep tabs open (alt-tab to HSR).
- **D-48:** AwaitingResult: still skipped (admin only).
- **D-49:** Waiting + Finished: same as today (30 min idle).

### hardDeleteLobby Extension
- **D-50:** Extended to also delete MatchResultParticipant, MatchResultGame, and MatchResultRecord (by lobbyId) — prevents orphaned rows when GC or void deletes a lobby without running finalization first.
- **D-51:** `admin_force_finalize` must NOT use the extended delete for MatchResult* — finalization needs those records alive to archive them first. Finalization deletes them itself after archival.

### Admin Toolbox
- **D-52:** `admin_force_finalize(lobbyId, winnerTeamId)` — AwaitingResult only. Sets winner, runs finalization pipeline (archives data, writes stats/MMR), then hardDeleteLobby. Data preserved.
- **D-53:** `admin_void_match(lobbyId)` — AwaitingResult only. Erases match completely via hardDeleteLobby (extended). No stats written. Pre-finalization only — no stats to reverse. For rematch scenarios.
- **D-54:** `admin_set_bracket_winner(bracketMatchId, winnerTeamId)` — Only when current winnerTeamId is 0/undefined (rollback was called first). Directly sets winner on BracketMatch and places team in next match. For post-finalization bracket fixes.
- **D-55:** Tournament void workflow: `rollback_bracket_match` (undo advancement) → `admin_void_match` (erase match) → BracketMatch back to Pending → TO creates new lobby for rematch.

### Processed Match Protection
- **D-56:** Once MMR is processed (`mmrProcessedAt` set), the match result is permanent. `rollback_bracket_match` blocks. `admin_void_match` requires AwaitingResult (post-finalization lobby is gone). `admin_set_bracket_winner` requires winnerTeamId=0 (rollback first). No stat reversal mechanism in v0.5.

### Schema Changes
- **D-57:** LobbyMember add: `voluntarilyLeft: t.bool()` (default false), `disconnectedAt: t.timestamp().optional()`, `disconnectPoolRemainingMs: t.u32()` (initialized at start_draft).
- **D-58:** MatchResultRecord add: `deferralSummary: t.string().optional()`.
- **D-59:** DisconnectPolicy enum: rename `TimerThenForfeit` → `Standard`, `Pause` → `Deferred`. Requires `--clear-database`.
- **D-60:** Lobby remove: `hostDisconnectTime` (replaced by immediate host transfer), `disconnectForfeitAt` (replaced by per-player `disconnectedAt` + computation).

### New Reducers
- **D-61:** `call_forfeit(lobbyId)` — Non-spectator/non-coach player. Claim forfeit after grace expires (Standard policy only). Checks all opposing team players offline > grace period.
- **D-62:** `concede_match(lobbyId)` — Non-spectator/non-coach player. Surrender own side. Any policy, any time.
- **D-63:** `defer_match(lobbyId)` — Non-spectator/non-coach player. Shelve match to AwaitingResult (Deferred policy only). Generates deferralSummary.
- **D-64:** `admin_force_finalize(lobbyId, winnerTeamId)` — Admin/TO/Mod. Resolve deferred match with winner.
- **D-65:** `admin_void_match(lobbyId)` — Admin/TO/Mod. Erase match completely (AwaitingResult only).
- **D-66:** `admin_set_bracket_winner(bracketMatchId, winnerTeamId)` — Admin/TO. Fix bracket post-finalization.

### COST-01 — Already Complete
- **D-67:** HsrLightconeCost PK `['lightconeName', 'gameMode', 'costSetId']` already matches HsrCharacterCost. No work needed.

### Claude's Discretion
- Exact `deferralSummary` string format and content
- `ensureMatchAlive` helper implementation details
- Internal helper organization (new file vs existing helpers)
- Disconnect pool initialization value (300000ms = 5 min)
- Error message wording for all new reducers

### Pending Discussion
- ParticipantStatus lifecycle (CheckedIn, Active, Eliminated — deferred from Phase 4)
- check_in_tournament reducer (Tournament.checkInEnabled exists but no reducer)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Disconnect & Lobby Lifecycle
- `docs/lobby/contract.md` — Lobby lifecycle scenarios, stage guards, join/leave/close behavior, D-04 reconnect during Drafting
- `docs/lobby/architecture.md` — Lobby table schema (disconnect columns, stage enum), LobbyMember columns
- `docs/match-session/contract.md` — Pause/resume behavior (D-61/D-62), timer handling, draft sequences, captain checks
- `docs/match-session/architecture.md` — MatchSession table, TimerState struct, PausePayload struct (isAutoPause)

### Match Results & Finalization
- `docs/match-results/contract.md` — Match result lifecycle, validation, finalization paths
- `docs/match-results/architecture.md` — MatchResultRecord schema, MatchResultGame, MatchResultParticipant
- `docs/brackets/contract.md` — Bracket advancement, rollback behavior, group standings
- `docs/brackets/architecture.md` — BracketMatch schema, winnerTeamId, resultStatus

### Existing Code
- `spacetimedb/src/index.ts` — clientDisconnected handler (lines 62-77, currently only sets User.isOnline)
- `spacetimedb/src/reducers/lobbyGc.ts` — hardDeleteLobby cascade + run_lobby_gc scheduled reducer
- `spacetimedb/src/reducers/lobbyLifecycle.ts` — join_lobby reconnect flow (lines 213-234), close_lobby stage guard, leave_lobby
- `spacetimedb/src/helpers/lobbyHelpers.ts` — ensureNotInLobby (lines 32-41, AwaitingResult skip)
- `spacetimedb/src/reducers/draftControl.ts` — pause_draft/resume_draft, isAutoPause=false (line 187)
- `spacetimedb/src/reducers/bracketAdvancement.ts` — rollback_bracket_match (lines 268-343)
- `spacetimedb/src/types/enums.ts` — DisconnectPolicy (line 145), LobbyStage (line 55), ParticipantStatus (line 158)
- `spacetimedb/src/types/structs.ts` — PausePayload.isAutoPause (line 103), TimerState (line 35)
- `spacetimedb/src/tables/lobby.ts` — disconnect columns (lines 66-68, 74), hostDisconnectTime (line 74)
- `spacetimedb/src/tables/lobbyMember.ts` — isOnline, lobbySlot, isCaptain, isReferee

### Memory References
- `project_phase10_deferred.md` — 3 deferred items from Phase 9 UAT (AwaitingResult stuck, bracket rollback, ParticipantStatus)
- `project_phase9_structural_changes.md` — LobbySlot refactor, AwaitingResult stage, finalization cascade-delete

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `hardDeleteLobby` (lobbyGc.ts): cascade delete helper — extend with MatchResult* cleanup
- `ensureNotInLobby` (lobbyHelpers.ts): one-lobby-per-user guard — extend with voluntarilyLeft skip
- `pause_draft`/`resume_draft` (draftControl.ts): existing pause logic with isAutoPause field — reuse for system pause
- `PausePayload.isAutoPause` (structs.ts): already defined, currently always false — set true for disconnect pauses
- `run_lobby_gc` (lobbyGc.ts): scheduled every 5 min — extend with active-stage voiding
- `join_lobby` reconnect path (lobbyLifecycle.ts): Drafting reconnect exists — extend to Equipping/Scoring/AwaitingResult
- `ensureTournamentAccess` (bracketAdvancement.ts): permission helper for TO/assistant/mod/admin

### Established Patterns
- Stage guard: `ensureStageIs(lobby, 'Waiting', 'Finished')` — used throughout for stage-restricted actions
- Captain check: `if (!member.isCaptain && hasCaptain)` — team-based action gating in all draft reducers
- Composite PK delete+insert: LobbyMember updates use delete+insert pattern (no .update() on composite PKs)
- Audit columns: `auditInsert(ctx, userId)` / `auditUpdate(ctx, existingRow, userId)` on all mutations

### Integration Points
- `clientDisconnected` handler (index.ts): entry point for all disconnect logic — currently minimal, needs lobby lookup chain
- `start_draft` (draftClassic.ts): initialize `disconnectPoolRemainingMs` on all LobbyMembers at match start
- Finalization pipeline (finalizationHelpers.ts): `admin_force_finalize` reuses this pipeline with a pre-set winner
- MatchResultRecord creation: `concede_match` and `call_forfeit` need to create records mid-draft (skip Equipping/Scoring)

</code_context>

<specifics>
## Specific Ideas

- Sportsmanship-based forfeit: opposing team CHOOSES to call forfeit rather than automatic. "We have already given the disconnected players some leeway to connect back."
- Deferred policy for tournaments: "let the TO or Tournament Assistants handle it later, they can invalidate the match or give a win to someone"
- Disconnect pool prevents abuse: "a person cannot just keep disconnecting"
- In team matches with remaining active player: "they can choose to keep drafting while their teammate reconnects"
- Flag transfers are permanent: "flags stay where they are" — no transfer back on reconnect
- Deferral summary for TO decision-making: deterministic string capturing what happened so TO doesn't need to dig through raw data
- Tournament void workflow: rollback bracket first, then void, then rematch

</specifics>

<deferred>
## Deferred Ideas

- Post-finalization stat reversal (reversing ELO, decrementing stats, rebuilding leaderboard after voiding a processed match) — too complex for v0.5, would need full stat undo infrastructure
- AFK detection (connected but not acting) — v1 concern, turn timers handle it during drafting
- Application-level heartbeat for faster disconnect detection — conflicts with energy budget, 60s grace period absorbs detection delay
- SpacetimeDB keepalive interval tuning — worth checking docs during implementation, not a design decision

</deferred>

---

*Phase: 10-disconnect-handling-and-cost-parity*
*Context gathered: 2026-03-31 (in progress)*
