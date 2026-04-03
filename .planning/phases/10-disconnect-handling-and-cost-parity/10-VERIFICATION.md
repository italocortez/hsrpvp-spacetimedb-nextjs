---
phase: 10-disconnect-handling-and-cost-parity
verified: 2026-04-03T01:37:00Z
status: human_needed
score: 21/21 must-haves verified
re_verification: false
human_verification:
  - test: "Connect two clients to maincloud, kill one client process, observe server logs"
    expected: "LobbyMember.isOnline=false and disconnectedAt set for the disconnected user; auto-pause step inserted if match was in Drafting stage"
    why_human: "clientDisconnected lifecycle hook requires a real WebSocket disconnect against the live SpacetimeDB server — cannot be simulated by unit tests"
  - test: "Disconnect during an active draft, then reconnect with the same identity"
    expected: "Reconnect succeeds, disconnectedAt cleared, disconnect pool decremented by elapsed time, match state (session, steps, member slots) intact"
    why_human: "Reconnect flow requires real SpacetimeDB subscription restore — cannot verify subscription state programmatically"
  - test: "During Drafting stage, call concede_match; then attempt pick_character on the conceeded lobby"
    expected: "concede_match succeeds and transitions lobby to AwaitingResult; pick_character throws 'Match has been conceded.'"
    why_human: "Reducer call sequencing against live server; the ensureMatchAlive guard fires at runtime not testable by static analysis"
---

# Phase 10: Disconnect Handling and Cost Parity — Verification Report

**Phase Goal:** Disconnect behavior is configurable and safe, rejoins preserve full match state, pick/ban reducers are guarded against post-forfeit action; lightcone cost table gains game-mode parity with character costs

**Verified:** 2026-04-03T01:37:00Z
**Status:** human_needed (all automated checks passed; 3 items require live-server testing)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | DisconnectPolicy enum has Standard/Deferred/NoAction variants | VERIFIED | `enums.ts` line 151-155 |
| 2  | MatchOutcome enum has Concede variant (Aborted replaced) | VERIFIED | `enums.ts` line 83-88 |
| 3  | ConcedeTrigger enum exists with Disconnect/VoluntaryLeave/RefereeDecision | VERIFIED | `enums.ts` line 90-94 |
| 4  | LobbyMember has voluntarilyLeft, disconnectedAt, disconnectPoolRemainingMs | VERIFIED | `tables/lobbyMember.ts` lines 13-15 |
| 5  | MatchResultRecord has matchOutcome, concedeSummary, concedeTrigger, concedeAtStage | VERIFIED | `tables/matchResult.ts` lines 20-23 |
| 6  | Lobby has refereeExclusiveConcede; hostDisconnectTime and disconnectForfeitAt removed | VERIFIED | `tables/lobby.ts` line 48; neither removed column present |
| 7  | clientDisconnected handler sets isOnline=false and disconnectedAt for active lobbies | VERIFIED | `index.ts` lines 65-155; Standard/Deferred path sets both |
| 8  | ensureMatchAlive guard called at top of every draft/equip/score reducer | VERIFIED | 18 call sites across draftClassic, draftControl, draftAuction, postDraft, scoreEntry, matchResultSubmission |
| 9  | join_lobby supports reconnect in Equipping, Scoring, and AwaitingResult stages | VERIFIED | `lobbyLifecycle.ts` line 222 — reconnectStages array includes all four |
| 10 | leave_lobby during active match sets voluntarilyLeft=true and transfers flags | VERIFIED | `lobbyLifecycle.ts` lines 361-373 |
| 11 | run_lobby_gc cleans Drafting/Equipping/Scoring lobbies where ALL members offline 30min | VERIFIED | `lobbyGc.ts` lines 91-109 — D-47 comment + implementation |
| 12 | hardDeleteLobby cascade deletes MatchResultParticipant, MatchResultGame, MatchResultRecord | VERIFIED | `lobbyGc.ts` lines 20-27 |
| 13 | ensureNotInLobby skips members where voluntarilyLeft=true | VERIFIED | `lobbyHelpers.ts` line 37 |
| 14 | concede_match creates MatchResultRecord with matchOutcome=Concede and sets lobby to AwaitingResult | VERIFIED | `concede.ts` performConcede lines 36-82 |
| 15 | claim_forfeit checks all opposing team players offline > grace period before granting forfeit | VERIFIED | `concede.ts` line 210 — isForfeitEligible call |
| 16 | defer_match shelves match to AwaitingResult with concedeSummary for TO resolution | VERIFIED | `concede.ts` lines 231-326 — matchOutcome=undefined, status=Pending |
| 17 | Achievement check always skipped for concede outcomes | VERIFIED | `finalizationHelpers.ts` line 262 — doAchievements: false |
| 18 | Bracket advancement never auto-triggers for concede outcomes | VERIFIED | `finalizationHelpers.ts` line 263 — doBracketAdvance: false |
| 19 | admin_force_finalize resolves AwaitingResult via runFinalization then hardDeleteLobby | VERIFIED | `adminMatchTools.ts` line 117 — runFinalization call (finalization calls hardDeleteLobby internally) |
| 20 | admin_void_match erases AwaitingResult via hardDeleteLobby without running finalization | VERIFIED | `adminMatchTools.ts` line 155 — direct hardDeleteLobby call |
| 21 | HsrLightconeCost has gameMode composite key matching HsrCharacterCost | VERIFIED | `tables/hsrLightconeCost.ts` line 20 — primaryKey: ['lightconeName', 'gameMode', 'costSetId'] |

**Score:** 21/21 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `spacetimedb/src/helpers/disconnectHelpers.ts` | ensureMatchAlive, buildConcedeSummary, handleDisconnectPoolUpdate | VERIFIED | All 5 exports present and substantive (106 lines) |
| `spacetimedb/src/helpers/flagTransferHelpers.ts` | transferCaptain, transferReferee, transferHost | VERIFIED | All 3 exports present and substantive (125 lines) |
| `spacetimedb/src/types/enums.ts` | ConcedeTrigger enum, renamed DisconnectPolicy, MatchOutcome.Concede | VERIFIED | All three present at lines 83-155 |
| `spacetimedb/src/tables/matchResult.ts` | matchOutcome, concedeSummary, concedeTrigger, concedeAtStage columns | VERIFIED | All 4 columns present (lines 20-23) |
| `spacetimedb/src/reducers/concede.ts` | concede_match, claim_forfeit, defer_match, performConcede | VERIFIED | All 4 exports present and substantive (327 lines) |
| `spacetimedb/src/reducers/adminMatchTools.ts` | admin_force_finalize, admin_void_match, admin_set_bracket_winner | VERIFIED | All 3 exports present and substantive (205 lines) |
| `spacetimedb/src/helpers/finalizationHelpers.ts` | Extended runFinalization with concede branching | VERIFIED | concedeFlags gating found at 18 branch sites (lines 232-549) |
| `spacetimedb/src/tables/hsrLightconeCost.ts` | gameMode column + composite PK | VERIFIED | gameMode in primaryKey at line 20 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `index.ts` | `flagTransferHelpers.ts` | clientDisconnected calls transferCaptain/transferReferee/transferHost | WIRED | Lines 122-124 in index.ts |
| `reducers/draftClassic.ts` | `helpers/disconnectHelpers.ts` | pick/ban reducers call ensureMatchAlive | WIRED | 3 call sites in draftClassic.ts (lines 253, 447, 584) |
| `reducers/lobbyLifecycle.ts` | `helpers/flagTransferHelpers.ts` | leave_lobby calls flag transfer helpers | WIRED | Lines 371-373 in lobbyLifecycle.ts |
| `reducers/concede.ts` | `helpers/finalizationHelpers.ts` | concede reducers create MatchResultRecord; finalization reads matchOutcome | WIRED | concedeFlags activated by `matchOutcome.tag === 'Concede'` check |
| `reducers/adminMatchTools.ts` | `helpers/finalizationHelpers.ts` | admin_force_finalize calls runFinalization | WIRED | `adminMatchTools.ts` line 117 |
| `reducers/adminMatchTools.ts` | `reducers/lobbyGc.ts` | admin_void_match calls hardDeleteLobby | WIRED | `adminMatchTools.ts` line 155 |
| `reducers/lobbyLifecycle.ts` | `reducers/concede.ts` | leave_lobby auto-concede calls performConcede | WIRED | `lobbyLifecycle.ts` line 390 |

---

### Data-Flow Trace (Level 4)

Not applicable. Phase output is SpacetimeDB backend reducers and tables — no React component rendering dynamic data. All data flows are within server-side reducer chains, verified via key link wiring above.

---

### Behavioral Spot-Checks

Step 7b: SKIPPED — SpacetimeDB reducers require a live server connection; no local runnable entry point exists. Live-server behaviors are routed to human verification.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| DISC-01 | 10-01, 10-02 | Configurable disconnect behavior per tournament/lobby (pause, timer+forfeit, no action) | SATISFIED | DisconnectPolicy enum has Standard/Deferred/NoAction; disconnectPolicy column on Lobby; each policy branch in clientDisconnected handler |
| DISC-02 | 10-01, 10-02 | Graceful rejoin logic preserving full match state | SATISFIED (code) / NEEDS HUMAN (live) | join_lobby reconnectStages includes Equipping/Scoring/AwaitingResult; disconnectedAt cleared on reconnect; real reconnect behavior needs human test |
| DISC-03 | 10-01, 10-02 | Every pick/ban reducer includes liveness check to prevent post-forfeit actions | SATISFIED | ensureMatchAlive wired at 18 call sites across all 6 draft/equip/score reducers; checks both stage (AwaitingResult/Finished) and existing Concede outcome |
| DISC-04 | 10-01, 10-02 | Disconnect forfeit uses timestamp-check pattern | SATISFIED | `disconnectedAt` written on disconnect (index.ts line 117); `isForfeitEligible` computes eligibility from `disconnectedAt` + `disconnectPoolRemainingMs` at reducer call time (D-60 explicitly replaced Lobby.disconnectForfeitAt with per-player LobbyMember.disconnectedAt) |
| COST-01 | 10-01 | HsrLightconeCost gains gameMode composite key (parity with HsrCharacterCost) | SATISFIED | primaryKey: ['lightconeName', 'gameMode', 'costSetId'] matching HsrCharacterCost's ['characterName', 'gameMode', 'costSetId'] |

All 5 requirements from REQUIREMENTS.md Phase 10 row are accounted for by Plans 01 and 02. No orphaned requirements found.

---

### Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|------------|
| `reducers/concede.ts` | `console.log` in performConcede, concede_match, claim_forfeit, defer_match | Info | Diagnostic logging appropriate for a SpacetimeDB backend; consistent with other reducers in codebase |
| `reducers/adminMatchTools.ts` | `console.log` in all three admin reducers | Info | Same pattern — not a stub indicator |

No blockers. No stubs. No placeholder returns. No empty implementations. No hardcoded empty data arrays that reach rendering.

---

### Human Verification Required

#### 1. clientDisconnected lifecycle hook

**Test:** Publish module to maincloud, connect two browser clients in an active Drafting lobby, forcibly close one client's browser tab or kill the network connection.

**Expected:** Server logs show disconnect event; LobbyMember.isOnline flips to false; disconnectedAt populated; auto-pause step inserted in MatchSessionStep; flagTransferHelpers run if the user held captain/referee/host.

**Why human:** SpacetimeDB's clientDisconnected fires on WebSocket close — unreachable by unit tests, requires real connection.

#### 2. Rejoin state preservation

**Test:** Start a draft, disconnect client (close tab), wait 5 seconds, reconnect with the same identity.

**Expected:** join_lobby reconnect path executes; disconnectedAt cleared on LobbyMember; disconnectPoolRemainingMs decremented by elapsed milliseconds; client receives full match subscription state (session, steps, member rows) without reset.

**Why human:** Subscription restore and pool-decrement correctness requires real WebSocket reconnect against live server.

#### 3. Post-concede liveness guard

**Test:** In an active Drafting lobby, call concede_match. Then immediately call pick_character (or any draft reducer) on the same lobby.

**Expected:** concede_match succeeds, lobby moves to AwaitingResult; pick_character throws "Match has been conceded." (from ensureMatchAlive).

**Why human:** Multi-reducer sequencing against the live server is needed to confirm the guard fires on the real state transition. Static analysis only confirms the guard is wired, not that it fires correctly.

---

### Gaps Summary

No gaps. All 21 must-have truths are verified in the codebase. All 5 phase requirements are satisfied. The 3 human verification items are behavioral tests for real-server dynamics (WebSocket lifecycle, subscription state) that cannot be confirmed without running against maincloud — they are not indicators of missing implementation.

The DISC-04 requirement text references `disconnectForfeitAt` by name, but Phase 10 planning explicitly replaced that column with per-player `LobbyMember.disconnectedAt` (Decision D-60 in 10-CONTEXT.md). The implemented timestamp-check pattern — write `disconnectedAt` on disconnect, compute eligibility from it at reducer call time — is the correct fulfillment of the requirement's intent.

No dedicated unit tests exist for disconnect/concede behaviors. The VALIDATION.md records all 5 Phase 10 test tasks as "pending/W0," meaning they depend on existing infrastructure and no new test files were added. This is noted but does not constitute a gap: the 124 existing unit tests all pass, and the lifecycle/integration behaviors are appropriately routed to manual verification against maincloud per the project's established approach for SpacetimeDB hooks.

---

_Verified: 2026-04-03T01:37:00Z_
_Verifier: Claude (gsd-verifier)_
