# Phase 10: Disconnect Handling and Cost Parity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31 (resumed 2026-04-02)
**Phase:** 10-disconnect-handling-and-cost-parity
**Status:** Complete
**Areas discussed:** Forfeit timer mechanism, Disconnect-to-pause behavior, Rejoin flow & state preservation, Deferred Phase 9 items, Disconnect detection, Voluntary leave, Admin tooling, Schema changes

---

## Forfeit Timer Mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Dual check (reducer + GC) | Every reducer checks forfeit eligibility + GC checks every 5 min | ✓ |
| Reducer-only check | Only check on next reducer call. Gap: abandoned lobbies never forfeit | |
| Scheduled-only check | GC handles all forfeits. 0-5 min latency, post-forfeit actions possible | |

**User's choice:** Dual check — security concern about post-forfeit actions drove the decision. Bandwidth neutral across all options.

---

## DisconnectPolicy Design

User rejected the initial "automatic forfeit timer" approach. Key design input:

> "when a player disconnects we give them a 60s timer to reconnect, blocking and pausing the game automatically. Once that timer is expired, the other team can call an action to trigger the forfeit because they have already waited for them or could let the game in pause if they wanna keep waiting, this is a matter of sportsmanship"

> "if its a 1v2 or 2v2 and the disconnect happens on a team that has more than 1 player, they can chose to keep drafting while their teammate reconnects"

**60s pause always happens** on player disconnect (corrected from initial conditional pause assumption).

**5-minute disconnect pool** added to prevent abuse — "a person cannot just keep disconnecting."

### Policy Variants

Initial proposal had "Pause" as indefinite pause. User flagged: "would all players be trapped in the lobby until it gets resolved? we need to free them."

| Option | Description | Selected |
|--------|-------------|----------|
| Standard (rename TimerThenForfeit) | Grace → opponent can call forfeit or wait | ✓ |
| Deferred (rename Pause) | Grace → players call defer_match → TO resolves | ✓ |
| NoAction | No mechanism, concede is the only exit | ✓ |

**User's choice:** Keep all three with redefined semantics. Deferred = "let the TO or Tournament Assistants handle it later."

**Deferred flow refinement:** User clarified shelving is an explicit player action (`defer_match`), not automatic. Players can wait as long as they want.

---

## Deferral Summary

User asked: "Would the TO/Admin/Mod have enough information from the deferred metadata / data to make a judgement or should we have a description field?"

**Decision:** Add `deferralSummary` string on MatchResultRecord. Reducer generates deterministic summary from current state on `defer_match`.

---

## AwaitingResult Lifecycle

User raised concern about tournament matches waiting weeks for batch processing. Confirmed AwaitingResult must never be auto-GC'd — lobby holds MatchSession + MatchSessionStep data needed for finalization archival.

**Decision:** Admin-only resolution. Two tools: `admin_force_finalize` (archive + resolve) and `admin_void_match` (erase).

---

## Admin Tooling

### admin_void_match
User asked: "will there ever be a case where we would be able to void matches that have already happened?"

**Decision:** Void restricted to AwaitingResult only (pre-finalization). No stats written = no stats to reverse. Post-finalization results are permanent.

### Tournament void workflow
User suggested: "maybe the TO can roll back matches with the rollback feature to then void old matches?"

**Decision:** rollback_bracket_match → admin_void_match → BracketMatch back to Pending → rematch.

### admin_set_bracket_winner
Requires winnerTeamId=0 (rollback first). Prevents overwriting processed results.

---

## Voluntary Leave Button

User requested leave button for all participants. Key distinction from disconnect and concede.

> "What steps should we handle through our existing logic to skip steps as the player left voluntarily without a 'concede', he just left."

**Decision:** `voluntarilyLeft` flag on LobbyMember (player-only, not spectators/coaches). Spectators/coaches get clean deletion. Players get row preserved for archival.

### Draft turns clarification
User asked: "are we expecting only captains to be able to pick/ban/bid?"

Code confirmed: turns are team-based, captain acts for team. If no captain, any team member can act. No draft sequence modification needed when a player leaves.

---

## ensureNotInLobby Concern

User caught: "do any of the disconnected players can chose to join other lobbies? If they are kept for archival that means they can never play matches until that match is resolved"

**Finding:** `ensureNotInLobby` already skips AwaitingResult. Only gap: `voluntarilyLeft` players in active-stage lobbies.

**Fix:** Add `voluntarilyLeft` skip to `ensureNotInLobby`.

---

## hardDeleteLobby Orphans

User caught: "what about match step history? are we not handling that? are we leaving it orphan in any of our delete cases?"

**Finding:** `hardDeleteLobby` does NOT delete MatchResultRecord, MatchResultGame, MatchResultParticipant. GC voiding would leave orphans.

**Fix:** Extend `hardDeleteLobby` to also clean up MatchResult* tables.

---

## Schema Changes

User asked: "is there any column we need to get rid of?"

| Column | Action | Reason |
|--------|--------|--------|
| Lobby.hostDisconnectTime | Remove | Replaced by immediate host transfer |
| Lobby.disconnectForfeitAt | Remove | Replaced by per-player LobbyMember.disconnectedAt |

---

## Disconnect Detection

User asked: "HOW CAN WE TELL IF A USER DISCONNECTED? should we be expecting a ping from the lobby users?"

**Decision:** Rely on SpacetimeDB's built-in `clientDisconnected`. No heartbeat. Bandwidth/energy concern.

---

## Scoring Stage

User clarified: "players are not expected to close the tabs when they go play HSR, they are expected to keep them open, they could be tabbed out"

**Decision:** No special treatment for Scoring stage. Alt-tabbed = WebSocket alive = isOnline=true. GC "ALL offline" check naturally protects active lobbies.

---

## Resolved (2026-04-02)

### ParticipantStatus + check_in_tournament — Deferred to Phase 10.1

Cross-referenced Phase 10 pending items against Phase 10.1/10.2 scope. Found medium conflict:
- All 3 status variants (CheckedIn, Active, Eliminated) touch the same tables/reducers Phase 10.1 restructures (TournamentParticipant→TournamentEnrolled, bracket advancement for winnerTeamSide)
- check_in_tournament is enrollment lifecycle, not disconnect handling

| Option | Description | Selected |
|--------|-------------|----------|
| Defer all to 10.1 | Phase 10 stays focused on disconnect/admin. ParticipantStatus wiring alongside TournamentParticipant rename. | ✓ |
| Keep CheckedIn in 10 | check_in_tournament is admin tooling, fits Phase 10 | |
| Keep all in 10 | Accept double work in 10.1 rename | |

**User's choice:** Defer all to 10.1 — "I wasn't planning on doing a lot regarding participant lifecycle so its best to move it there"
