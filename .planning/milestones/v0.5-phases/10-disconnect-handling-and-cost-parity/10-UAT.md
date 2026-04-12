---
status: complete
phase: 10-disconnect-handling-and-cost-parity
source: [10-01-SUMMARY.md, 10-02-SUMMARY.md]
started: 2026-04-03T08:30:00Z
updated: 2026-04-03T08:30:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold-Start Smoke Test
expected: Module published, seed data present, schema changes verified (DisconnectPolicy renamed, ConcedeTrigger added, new columns on Lobby/LobbyMember/MatchResultRecord)
result: pass

### 2. concede_match — Voluntary Surrender During Drafting
expected: Two players in a drafting lobby. Blue captain calls concede_match. MatchResultRecord created with matchOutcome=Concede, concedeTrigger=VoluntaryLeave. Lobby moves to AwaitingResult. Winner is Red team.
result: pass

### 3. ensureMatchAlive Guard Post-Concede
expected: After concede from Test 2, any pick_character call on the same lobby is rejected with "Match ended or forfeited"
result: pass

### 4. concede_match — Referee Exclusive Control
expected: Lobby with refereeExclusiveConcede=true and 3rd party spectator referee. Player calls concede_match → rejected. Referee calls concede_match → succeeds with concedeTrigger=RefereeDecision.
result: issue
reported: "Referee on Spectator slot gets 'Spectators cannot concede' — spectator guard (line 123) fires before referee-exclusive check (line 131) in concede.ts. Guard ordering bug: referee-exclusive check must come before spectator/coach guards."
severity: blocker

### 5. leave_lobby During Active Match — voluntarilyLeft + Flag Transfer
expected: Player leaves during drafting. LobbyMember row preserved with voluntarilyLeft=true. Captain flag transfers to next teammate. Player can create a new lobby (ensureNotInLobby skip).
result: pass

### 6. Auto-Concede on Last Player Leave
expected: Last player on a team calls leave_lobby during drafting → auto-concede triggered. MatchResultRecord created with concedeTrigger=VoluntaryLeave. Lobby → AwaitingResult.
result: pass

### 7. defer_match — Deferred Policy
expected: Lobby with Deferred disconnect policy. Player calls defer_match → lobby moves to AwaitingResult. concedeSummary populated with deterministic string. No winner assigned.
result: pass

### 8. claim_forfeit — Standard Policy Disconnect
expected: Lobby with Standard policy. One player disconnects (harness disconnect). After grace, opponent calls claim_forfeit → MatchResultRecord with concedeTrigger=Disconnect. Disconnected team loses.
result: blocked
blocked_by: server
reason: "Harness disconnect() does not trigger clientDisconnected on maincloud even after 15s wait. Server logs show no disconnect event. Requires real browser tab close or network loss — not testable from harness."

### 9. Rejoin After Disconnect During Drafting
expected: Player disconnects during draft. Draft auto-pauses (isAutoPause=true step inserted). Player reconnects via join_lobby → disconnectedAt cleared, disconnectPoolRemainingMs decremented by elapsed time, auto-resume fires.
result: blocked
blocked_by: server
reason: "Same as Test 8 — clientDisconnected does not fire from harness disconnect() on maincloud. Rejoin flow depends on disconnectedAt being set first."

### 10. admin_force_finalize — Resolve Deferred Match
expected: Match in AwaitingResult from Test 7. Admin calls admin_force_finalize(lobbyId, winnerTeamId). Match finalized with stats. Lobby cleaned up.
result: pass

### 11. admin_void_match — Erase Match
expected: Create another deferred match in AwaitingResult. Admin calls admin_void_match(lobbyId). All match data erased (hardDeleteLobby cascade). No stats written.
result: pass

### 12. Concede Finalization Matrix — Casual Non-Tournament Drafting
expected: Casual non-tournament lobby. Concede during Drafting → cleanup only. No win/loss, no stats, no MMR, no archival. MatchResultRecord exists for audit.
result: pass

### 13. Concede Finalization Matrix — Ranked Scoring
expected: Ranked lobby that reached Scoring stage. Concede → win/loss recorded, MMR calculated, player stats updated, steps/session archived. Achievement check skipped.
result: skipped
reason: Requires full draft + equipping completion to reach Scoring stage — heavyweight setup. Will be covered by automated tests.

## Summary

total: 13
passed: 9
issues: 1
pending: 0
skipped: 1
blocked: 2
skipped: 0
blocked: 0

## Gaps

- truth: "3rd party referee (Spectator slot + isReferee) can call concede_match when refereeExclusiveConcede is active"
  status: failed
  reason: "User reported: Referee on Spectator slot gets 'Spectators cannot concede' — spectator guard (line 123) fires before referee-exclusive check (line 131) in concede.ts"
  severity: blocker
  test: 4
  root_cause: "Guard ordering bug in concede.ts performConcede: spectator/coach rejection (lines 123-128) runs before the referee-exclusive bypass (lines 131-137). Same bug exists in claim_forfeit and defer_match reducers."
  artifacts:
    - path: "spacetimedb/src/reducers/concede.ts"
      issue: "Guard ordering: spectator check before referee-exclusive check in all 3 reducers"
  missing:
    - "Move referee-exclusive check (D-81) ABOVE the spectator/coach guards in concede_match, claim_forfeit, and defer_match"
