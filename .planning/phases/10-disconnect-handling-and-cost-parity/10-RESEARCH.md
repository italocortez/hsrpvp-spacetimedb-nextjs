# Phase 10: Disconnect Handling and Cost Parity - Research

**Researched:** 2026-04-03
**Domain:** SpacetimeDB lifecycle hooks, disconnect handling, concede/forfeit mechanics, finalization branching
**Confidence:** HIGH

## Summary

Phase 10 implements disconnect detection, configurable disconnect policies, concede/forfeit mechanics, voluntary leave during active matches, rejoin extension, admin tooling for stuck matches, and finalization branching for concede outcomes. COST-01 (lightcone cost parity) is already complete -- the HsrLightconeCost table already has `gameMode` in its composite PK.

The phase is entirely backend SpacetimeDB work -- no frontend, no external dependencies. All decisions are locked in CONTEXT.md with 93 decisions (D-01 through D-93). The existing codebase provides strong foundations: `clientDisconnected` hook, `pause_draft`/`resume_draft` with `isAutoPause`, `hardDeleteLobby` cascade, `ensureNotInLobby` with AwaitingResult skip, `runFinalization` 18-step pipeline, and `slotToTeamSide`/`slotTeam` helpers. The phase requires modifying ~15 existing files and creating ~4-5 new files.

**Primary recommendation:** Split into two plans: Plan 01 for schema changes + new/modified reducers (disconnect detection, concede, forfeit, defer, voluntary leave, rejoin extension, GC extension), and Plan 02 for finalization branching (concede finalization matrix), admin toolbox reducers, and doc updates. This aligns with the 2-plan structure specified in the phase description.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01 through D-93: All implementation decisions are locked. See full CONTEXT.md for details. Key decisions summarized by category:
  - **Terminology (D-68-71):** "Abandonment" dropped. All early endings = "Concede". MatchOutcome gets Concede variant (replaces Forfeit). ConcedeTrigger enum: Disconnect/VoluntaryLeave/RefereeDecision. concedeSummary on MatchResultRecord.
  - **Detection (D-01-03):** SpacetimeDB clientDisconnected hook only. No heartbeat. WebSocket keepalive at transport layer.
  - **Visibility (D-72-73):** Subscription-only via LobbyMember.isOnline. Anonymous label in anonymous lobbies.
  - **Policy enum (D-04-07):** Rename TimerThenForfeit->Standard, Pause->Deferred, NoAction stays. Requires --clear-database.
  - **Grace period/pool (D-08-11):** 60s grace, auto-pause with isAutoPause=true, 5min disconnect pool per player per match, configurable via disconnectForfeitSeconds.
  - **Forfeit timer dual check (D-12-14):** ensureMatchAlive guard in every draft/equip/score reducer + lobby_gc safety net for 30min idle.
  - **Standard policy (D-15-17):** claim_forfeit after grace. Team matches: ALL players on opposing team must be offline.
  - **Deferred policy (D-18-22):** No forfeit. defer_match shelves to AwaitingResult. TO resolves.
  - **NoAction policy (D-23-25):** No pause, no pool, no forfeit. Tracking only.
  - **Concede (D-26-28):** concede_match in all policies, Drafting/Equipping/Scoring. Conceding team loses.
  - **Voluntary leave (D-29-33):** voluntarilyLeft=true, row kept, cannot rejoin, freed from ensureNotInLobby. Flag transfers.
  - **Flag transfers (D-34-36):** Captain->next player same team. Referee->host->next eligible. Host->referee->longest-tenured. All permanent.
  - **Rejoin (D-37-40):** Extend join_lobby to Equipping/Scoring/AwaitingResult. Block if voluntarilyLeft.
  - **ensureNotInLobby (D-41-42):** Skip voluntarilyLeft=true members.
  - **Draft turns (D-43-44):** Team-based, captain picks. Captain transfer handles disconnect.
  - **Auction + disconnect (D-85-87):** timer_expiry is safety net. Captain transfer. Budget per-team.
  - **AwaitingResult (D-45-46):** Never GC'd. Admin-only resolution.
  - **lobby_gc (D-47-49):** Extend to Drafting/Equipping/Scoring: ALL offline + 30min idle -> hard delete.
  - **hardDeleteLobby (D-50-51):** Add MatchResult* cleanup. admin_force_finalize must NOT use extended delete.
  - **Admin toolbox (D-52-55):** admin_force_finalize, admin_void_match, admin_set_bracket_winner.
  - **Processed match protection (D-56):** mmrProcessedAt blocks rollback/void.
  - **Schema changes (D-57-60, D-90-92):** LobbyMember adds voluntarilyLeft/disconnectedAt/disconnectPoolRemainingMs. MatchResultRecord adds concedeSummary/concedeTrigger. DisconnectPolicy rename. MatchOutcome: Forfeit->Concede. New ConcedeTrigger enum. Lobby adds refereeExclusiveConcede.
  - **New reducers (D-61-66):** claim_forfeit, concede_match, defer_match, admin_force_finalize, admin_void_match, admin_set_bracket_winner.
  - **Concede finalization matrix (D-74-79):** Three tiers (casual non-tournament, casual tournament, ranked) x three stages (Drafting, Equipping, Scoring). Stage determines character stats. matchOutcome-based branching in runFinalization.
  - **Bracket (D-80):** Concede NEVER auto-advances brackets. TO manually approves.
  - **3rd party referee (D-81-84):** refereeExclusiveConcede setting. Exclusive lock on concede/forfeit/defer when 3rd party referee present.
  - **MMR abuse (D-88-89):** MatchResultRecord is the audit trail. No new table.
  - **Waiting stage (D-93):** No concede possible. Existing behavior.
  - **COST-01 (D-67):** Already complete. No work needed.

### Claude's Discretion
- Exact concedeSummary string format and field ordering
- ensureMatchAlive helper implementation details
- Internal helper organization (new file vs existing helpers)
- Disconnect pool initialization value (300000ms = 5 min)
- Error message wording for all new reducers
- lobbySlotToTeamSide() helper implementation

### Deferred Ideas (OUT OF SCOPE)
- Post-finalization stat reversal
- AFK detection (connected but not acting)
- Application-level heartbeat
- SpacetimeDB keepalive interval tuning
- ParticipantStatus lifecycle (CheckedIn, Active, Eliminated) -- Phase 10.1
- check_in_tournament reducer -- Phase 10.1
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DISC-01 | Configurable disconnect behavior per tournament/lobby (pause, timer+forfeit, no action) | D-04 through D-07 define DisconnectPolicy enum rename (Standard/Deferred/NoAction). Existing lobby.disconnectPolicy column already supports this. Schema change required for enum variant rename (--clear-database). D-08-11 define grace period + pool mechanics. |
| DISC-02 | Graceful rejoin logic preserving full match state | D-37-40 define join_lobby extension to Equipping/Scoring/AwaitingResult. Existing Drafting reconnect pattern (lobbyLifecycle.ts L214-233) serves as template. voluntarilyLeft blocks reconnect. disconnectedAt cleared on reconnect. |
| DISC-03 | Every pick/ban reducer includes liveness check | D-12 defines ensureMatchAlive(ctx, lobby) guard at top of every draft/equip/score reducer. Checks per-player disconnectedAt values against grace period. Computes forfeit eligibility without timers. |
| DISC-04 | Disconnect forfeit uses timestamp-check pattern | D-12-14 define dual check: reducer guard (fast path using disconnectedAt + computation) + lobby_gc (safety net, 30min idle). D-60 removes Lobby.disconnectForfeitAt in favor of per-player LobbyMember.disconnectedAt. No scheduled timer reducer -- computation at reducer call time. |
| COST-01 | HsrLightconeCost gains gameMode composite key | D-67: Already complete. HsrLightconeCost PK is ['lightconeName', 'gameMode', 'costSetId']. Verified in existing code. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Do NOT auto-commit code changes.** Leave all file changes unstaged for user review.
- Planning/docs (.planning/) may be committed by GSD workflows; code files (spacetimedb/) NEVER auto-committed.
- Must load `/spacetimedb` skill before writing backend code.
- Architecture docs updated on every backend change.
- Behavior specs (contract.md) updated after execution with Phase 10 provenance tags.
- Test files: do not create/edit/delete without explicit task.
- Reducers are transactional, deterministic (no Math.random, no timers, no network).
- Composite PK update pattern: delete + insert.
- Module publish to maincloud with `--clear-database` when enum variants rename.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spacetimedb/server | 1.1.1 | SpacetimeDB TypeScript server SDK | Project standard, all backend code |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 3.x | Test framework | Unit tests for helpers (existing infrastructure) |

**No new dependencies.** This phase is entirely within the existing SpacetimeDB module -- all new code is reducers, helpers, enum definitions, and table schema changes.

## Architecture Patterns

### Recommended File Organization

```
spacetimedb/src/
├── types/
│   └── enums.ts              # MODIFY: DisconnectPolicy rename, MatchOutcome Concede, new ConcedeTrigger
├── tables/
│   ├── lobby.ts              # MODIFY: remove hostDisconnectTime/disconnectForfeitAt, add refereeExclusiveConcede
│   ├── lobbyMember.ts        # MODIFY: add voluntarilyLeft, disconnectedAt, disconnectPoolRemainingMs
│   ├── lobbyPreset.ts        # MODIFY: add refereeExclusiveConcede
│   └── matchResult.ts        # MODIFY: add concedeSummary, concedeTrigger
├── helpers/
│   ├── lobbyHelpers.ts       # MODIFY: ensureNotInLobby voluntarilyLeft skip
│   ├── finalizationHelpers.ts # MODIFY: concede finalization branching in runFinalization
│   ├── disconnectHelpers.ts  # NEW: ensureMatchAlive, handleDisconnect, buildConcedeSummary, lobbySlotToTeamSide
│   └── flagTransferHelpers.ts # NEW: transferCaptain, transferReferee, transferHost
├── reducers/
│   ├── index.ts              # MODIFY: export new reducers
│   ├── lobbyLifecycle.ts     # MODIFY: leave_lobby active stage handling, join_lobby rejoin extension
│   ├── lobbyGc.ts            # MODIFY: hardDeleteLobby + MatchResult* cleanup, run_lobby_gc active stage voiding
│   ├── lobbySettings.ts      # MODIFY: add refereeExclusiveConcede param
│   ├── lobbyPresets.ts       # MODIFY: add refereeExclusiveConcede param
│   ├── draftClassic.ts       # MODIFY: start_draft initializes disconnectPoolRemainingMs, ensureMatchAlive in pick/ban
│   ├── draftControl.ts       # MODIFY: ensureMatchAlive in undo/pause/resume
│   ├── draftAuction.ts       # MODIFY: ensureMatchAlive in nominate/bid/pass/timer_expiry
│   ├── postDraft.ts          # MODIFY: ensureMatchAlive in equip/arrange/confirm/advance_stage
│   ├── scoreEntry.ts         # MODIFY: ensureMatchAlive in record_game_scores
│   ├── matchResultSubmission.ts # MODIFY: ensureMatchAlive in confirm/submit/dispute
│   ├── concede.ts            # NEW: concede_match, claim_forfeit, defer_match
│   └── adminMatchTools.ts    # NEW: admin_force_finalize, admin_void_match, admin_set_bracket_winner
└── index.ts                  # MODIFY: clientDisconnected handler extension
```

### Pattern 1: ensureMatchAlive Guard
**What:** A reusable helper that checks if the match is still alive (not forfeited/conceded). Called at the top of every draft/equip/score reducer.
**When to use:** Every reducer that mutates match state during Drafting/Equipping/Scoring.
**Implementation approach:**
```typescript
// In disconnectHelpers.ts
export function ensureMatchAlive(ctx: any, lobby: any): void {
    // 1. Check lobby stage is still active
    if (lobby.stage.tag === 'AwaitingResult' || lobby.stage.tag === 'Finished') {
        throw new SenderError('Match has ended.');
    }
    
    // 2. For Standard/Deferred policies: check disconnect forfeit eligibility
    if (lobby.disconnectPolicy.tag === 'NoAction') return;
    
    const members = [...ctx.db.LobbyMember.lobby_id.filter(lobby.id)];
    // Check each team: if ALL non-coach players are offline + disconnectedAt expired
    // This is the "fast path" forfeit check per D-12
    // Does NOT auto-forfeit -- just makes the check available
    // The actual forfeit claim is via claim_forfeit reducer
}
```

### Pattern 2: clientDisconnected Handler Extension
**What:** Extend the existing lifecycle hook to handle lobby member disconnect tracking.
**When to use:** On every client disconnection event.
**Implementation approach:**
```typescript
// In index.ts clientDisconnected handler
// 1. Existing: set User.isOnline = false
// 2. NEW: find all LobbyMember rows for this user
// 3. For each active lobby (Drafting/Equipping/Scoring):
//    a. Set LobbyMember.isOnline = false, disconnectedAt = ctx.timestamp
//    b. Decrement disconnect pool if applicable
//    c. If Standard/Deferred policy: insert auto-pause step (isAutoPause=true)
//    d. Transfer flags if needed (captain, referee, host)
```

### Pattern 3: Concede Finalization Matrix
**What:** Branching logic in runFinalization based on matchOutcome + matchType + isTournamentControlled + lobby stage.
**When to use:** When runFinalization is called for a Concede outcome.
**Implementation approach:**
```typescript
// In finalizationHelpers.ts
// After step 6 (determine match metadata), check matchOutcome.tag === 'Concede'
// If concede:
//   - Determine tier: casual non-tournament, casual tournament, or ranked
//   - Determine stage at time of concede (stored on MatchResultRecord or derived)
//   - Skip/include steps per the finalization matrix from CONTEXT.md
//   - Achievement check ALWAYS skipped for concede (D-76)
//   - Bracket advancement NEVER auto-triggers for concede (D-80)
```

### Pattern 4: Voluntary Leave with Row Preservation
**What:** When a player leaves during active match, set voluntarilyLeft=true instead of deleting row.
**When to use:** leave_lobby during Drafting/Equipping/Scoring stages.
**Implementation approach:**
```typescript
// In lobbyLifecycle.ts leave_lobby
// If lobby.stage is Drafting/Equipping/Scoring:
//   - Set voluntarilyLeft=true, isOnline=false on LobbyMember (keep row)
//   - Transfer captain/referee/host flags
//   - If last player on team → auto-concede (unless refereeExclusiveConcede + 3rd party referee)
//   - Player freed from ensureNotInLobby check
// If lobby.stage is Waiting:
//   - Existing behavior (delete row, decrement count)
```

### Pattern 5: Flag Transfer Chain
**What:** Deterministic transfer of captain, referee, and host flags when a player disconnects or leaves.
**When to use:** On disconnect, voluntary leave, or kick during active match.
**Implementation approach:**
```typescript
// Captain: next non-coach player on same team (by userId sort for determinism)
// Referee: host first, then next eligible online non-spectator/non-coach
// Host: referee (if online), then longest-tenured member (lowest userId)
// All transfers are permanent (no transfer back on reconnect)
```

### Anti-Patterns to Avoid
- **Timer-based forfeit:** Do NOT use setTimeout or scheduled reducers for disconnect timers. Use timestamp-check pattern: write `disconnectedAt`, compute eligibility at reducer call time.
- **Auto-forfeiting in clientDisconnected:** The lifecycle hook should only set tracking state. Actual forfeit requires an explicit `claim_forfeit` call from the opponent.
- **Modifying LobbyMember with .update():** Composite PK tables require delete+insert pattern.
- **Reading match state from MatchResultRecord during concede finalization:** Read from LobbyMember instead (D-75). MatchResultParticipant may not be complete for early concedes.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Disconnect detection | Application heartbeat | SpacetimeDB clientDisconnected | D-01/D-02: energy budget prohibits 100 reducer calls/second |
| Timer-based forfeit | Scheduled reducer timer | Timestamp check at reducer call | D-12: deterministic, no race conditions |
| Flag transfer logic | Inline in each reducer | Shared helpers in flagTransferHelpers.ts | Reused by disconnect, leave, kick -- must be consistent |
| Team side derivation from LobbySlot | Switch statement per file | Existing slotTeam/slotToTeamSide from lobbyHelpers.ts | Already exists and covers all variants |
| Finalization branching | Separate concede finalization function | matchOutcome branching in existing runFinalization | D-74: single function, outcome-based branching |

## Common Pitfalls

### Pitfall 1: Race Between Reducer Guard and GC
**What goes wrong:** Both ensureMatchAlive and lobby_gc try to process the same abandoned lobby simultaneously.
**Why it happens:** GC runs on schedule while a stale client fires a reducer.
**How to avoid:** D-14 -- the second actor finds the lobby in the wrong state and no-ops. GC sets lobby to deleted; reducer finds no lobby. Or reducer concedes first; GC finds lobby in AwaitingResult and skips it.
**Warning signs:** Console logs showing "Lobby not found" during GC runs.

### Pitfall 2: Composite PK Delete+Insert for LobbyMember
**What goes wrong:** Calling .update() on a composite PK table silently fails or creates duplicate rows.
**Why it happens:** SpacetimeDB SDK composite PK tables don't support .update() directly.
**How to avoid:** Always use `by_lobby_and_user.delete([lobbyId, userId])` then `insert({...})` pattern. Already established throughout codebase.
**Warning signs:** Duplicate LobbyMember rows for same lobbyId+userId.

### Pitfall 3: Concede Finalization Reading MatchResultParticipant Too Early
**What goes wrong:** For concedes during Drafting, MatchResultParticipant rows exist but are the source for participant data. However, the concede path needs LobbyMember for team side derivation when MatchResultParticipant is incomplete.
**Why it happens:** Normal finalization reads MatchResultParticipant (step 1). Concede at Drafting stage has complete MatchResultParticipant from start_draft.
**How to avoid:** D-75: Concede path reads LobbyMember for participant resolution. Use lobbySlotToTeamSide helper for team derivation. MatchResultParticipant rows exist from start_draft but LobbyMember is the authority for who is still in the match.
**Warning signs:** Missing participants in concede finalization output.

### Pitfall 4: --clear-database Required for Enum Variant Renames
**What goes wrong:** Module publish fails with schema migration error.
**Why it happens:** DisconnectPolicy variant rename (TimerThenForfeit->Standard, Pause->Deferred) and MatchOutcome variant add (Concede replacing Forfeit/Aborted) are not migration-safe in SpacetimeDB.
**How to avoid:** Publish with `--clear-database` flag. Bootstrap and seed must be re-run after. This is expected per D-04, D-90.
**Warning signs:** `spacetime publish` fails with migration error.

### Pitfall 5: Auto-Concede vs Referee Exclusive Lock
**What goes wrong:** Last player leaves team, auto-concede fires, but a 3rd party referee should have exclusive control.
**Why it happens:** leave_lobby auto-concede logic doesn't check refereeExclusiveConcede setting.
**How to avoid:** D-82: When refereeExclusiveConcede is active AND a 3rd party referee (Spectator slot referee) is present, block auto-concede. Referee decides.
**Warning signs:** Tests showing auto-concede when referee should have control.

### Pitfall 6: Pool Depletion During Reconnect Window
**What goes wrong:** Player reconnects but pool was already decremented below the grace threshold.
**Why it happens:** Pool decrement happens at disconnect time in clientDisconnected handler, but the exact time spent disconnected is only known at reconnect.
**How to avoid:** Record disconnectedAt at disconnect time. At reconnect time, compute elapsed = now - disconnectedAt, decrement pool by elapsed. If pool already depleted before reconnect, the next reducer call's ensureMatchAlive would have caught it.
**Warning signs:** Negative pool values, pool not matching expected deduction.

### Pitfall 7: Finalization Matrix Skipping Steps vs Running Steps
**What goes wrong:** Concede finalization runs archival steps that shouldn't run, or skips steps that should run.
**Why it happens:** The 3-tier x 3-stage matrix from CONTEXT.md has nuanced "what exists" and "yes/no" per cell. Easy to miss.
**How to avoid:** Implement the matrix as explicit boolean flags computed at the top of the concede branch, then gate each finalization step on the appropriate flag.
**Warning signs:** Stats incremented for casual non-tournament concede during Drafting (should be cleanup only).

## Code Examples

### ensureMatchAlive Guard Pattern
```typescript
// Source: CONTEXT.md D-12, project pattern from ensureStageIs
export function ensureMatchAlive(ctx: any, lobby: any): void {
    // Check stage hasn't transitioned to terminal
    if (lobby.stage.tag === 'AwaitingResult' || lobby.stage.tag === 'Finished') {
        throw new SenderError('Match has already ended.');
    }
    // Additional: check if forfeit is already being processed
    // (MatchResultRecord with matchOutcome Concede exists for this lobby)
    const existingResult = [...ctx.db.MatchResultRecord.lobby_id.filter(lobby.id)][0];
    if (existingResult && existingResult.matchOutcome?.tag === 'Concede') {
        throw new SenderError('Match has been conceded.');
    }
}
```

### clientDisconnected Extension Pattern
```typescript
// Source: existing index.ts pattern + CONTEXT.md D-01/D-08/D-34
spacetimedb.clientDisconnected((ctx) => {
    // Existing: set User.isOnline = false
    const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
    if (!mapping) return;
    const userId = mapping.userId;
    // ... existing user online update ...

    // NEW: Handle lobby member disconnect
    const memberships = [...ctx.db.LobbyMember.user_id.filter(userId)];
    for (const member of memberships) {
        const lobby = ctx.db.Lobby.id.find(member.lobbyId);
        if (!lobby) continue;
        
        // Only process active stages
        const activeStages = ['Drafting', 'Equipping', 'Scoring'];
        if (!activeStages.includes(lobby.stage.tag)) continue;
        
        // Skip NoAction policy disconnect tracking
        if (lobby.disconnectPolicy.tag === 'NoAction') {
            // Just set isOnline=false
            ctx.db.LobbyMember.by_lobby_and_user.delete([member.lobbyId, userId]);
            ctx.db.LobbyMember.insert({ ...member, isOnline: false, /* audit */ } as any);
            continue;
        }
        
        // Set disconnectedAt, isOnline=false
        ctx.db.LobbyMember.by_lobby_and_user.delete([member.lobbyId, userId]);
        ctx.db.LobbyMember.insert({
            ...member,
            isOnline: false,
            disconnectedAt: ctx.timestamp,
            /* audit */
        } as any);
        
        // Auto-pause if Standard/Deferred and session not already paused
        // Transfer captain/referee/host flags
        // ...
    }
});
```

### Concede Summary Builder Pattern
```typescript
// Source: CONTEXT.md D-71, Claude's discretion
export function buildConcedeSummary(
    ctx: any,
    lobby: any,
    disconnectedMembers: any[],
    triggerUserId: number,
    trigger: string, // 'Disconnect' | 'VoluntaryLeave' | 'RefereeDecision'
): string {
    const parts: string[] = [];
    for (const m of disconnectedMembers) {
        const slot = m.lobbySlot;
        const label = lobby.isAnonymousPlayers
            ? `${slotTeam(slot)}-Player`
            : `User#${m.userId}`;
        parts.push(`${label} (userId: ${m.userId})`);
    }
    const session = ctx.db.MatchSession.lobbyId.find(lobby.id);
    const stepCount = session ? session.turnIndex : 0;
    return `${parts.join(', ')} disconnected at step ${stepCount}, ` +
           `pool remaining: ${disconnectedMembers[0]?.disconnectPoolRemainingMs ?? 0}ms, ` +
           `trigger: ${trigger} by userId:${triggerUserId}`;
}
```

### Flag Transfer Pattern
```typescript
// Source: CONTEXT.md D-34/D-35/D-36
export function transferCaptain(ctx: any, lobbyId: number, leavingUserId: number): void {
    const members = [...ctx.db.LobbyMember.lobby_id.filter(lobbyId)];
    const leavingMember = members.find(m => m.userId === leavingUserId);
    if (!leavingMember || !leavingMember.isCaptain) return;
    
    const team = slotTeam(leavingMember.lobbySlot);
    if (!team) return;
    
    // Find next eligible: same team, non-coach, not voluntarilyLeft, sorted by userId for determinism
    const candidates = members
        .filter(m => 
            m.userId !== leavingUserId &&
            slotTeam(m.lobbySlot) === team &&
            !slotIsCoach(m.lobbySlot) &&
            !m.voluntarilyLeft
        )
        .sort((a, b) => a.userId - b.userId);
    
    if (candidates.length > 0) {
        const newCaptain = candidates[0];
        ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, newCaptain.userId]);
        ctx.db.LobbyMember.insert({
            ...newCaptain,
            isCaptain: true,
            // audit
        } as any);
    }
    
    // Remove captain from leaving member
    ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, leavingUserId]);
    ctx.db.LobbyMember.insert({
        ...leavingMember,
        isCaptain: false,
        // audit
    } as any);
}
```

### Concede Finalization Matrix Implementation
```typescript
// Source: CONTEXT.md D-74 through D-79
// Determine tier and stage flags
const isConcede = matchOutcome.tag === 'Concede';
if (isConcede) {
    const isRanked = matchResult.matchType.tag === 'Ranked';
    const isTournament = matchResult.isTournamentControlled;
    const isCasualNonTournament = !isRanked && !isTournament;
    const isCasualTournament = !isRanked && isTournament;
    
    // Stage at time of concede (from lobby or a field on MatchResultRecord)
    const concedeStage = lobby?.stage.tag ?? 'Scoring'; // fallback
    const isDrafting = concedeStage === 'Drafting';
    const isEquipping = concedeStage === 'Equipping';
    const isScoring = concedeStage === 'Scoring';
    
    // Tier 1: Casual non-tournament
    // Only Scoring gets win/loss. All get cleanup.
    const doArchive = !isCasualNonTournament; // T2/T3 archive what exists
    const doWinLoss = isCasualNonTournament ? isScoring : true; // T1: scoring only. T2/T3: always
    const doRelationships = !isCasualNonTournament; // T2/T3 always
    const doCharStats = isRanked && !isDrafting; // T3: equipping+ only
    const doGlobalCharStats = isRanked && !isDrafting;
    const doMmr = isRanked;
    const doLeaderboard = isRanked;
    const doSpectated = isRanked;
    const doAchievements = false; // D-76: always skipped
    const doBracketAdvance = false; // D-80: never auto-advance
    // ... gate each finalization step on these flags
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lobby.disconnectForfeitAt timestamp | Per-player LobbyMember.disconnectedAt | Phase 10 (D-60) | Timer is computed, not stored on lobby |
| Lobby.hostDisconnectTime | Immediate host flag transfer | Phase 10 (D-60) | Remove column, transfer host on disconnect |
| MatchOutcome: Forfeit/Aborted | MatchOutcome: Concede (replaces both) | Phase 10 (D-90) | Single variant for all early endings |
| DisconnectPolicy: Pause/TimerThenForfeit | DisconnectPolicy: Deferred/Standard | Phase 10 (D-04) | Clearer naming |

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.x |
| Config file | test/vitest.config.ts |
| Quick run command | `npm test` (runs unit tests) |
| Full suite command | `npx vitest run --config test/vitest.config.ts` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DISC-01 | DisconnectPolicy enum variants work, policy applied to lobby | unit | `npx vitest run test/backend/lobby/disconnect-policy.unit.test.ts -x` | Wave 0 |
| DISC-02 | Rejoin restores member state in Equipping/Scoring/AwaitingResult | unit | `npx vitest run test/backend/lobby/rejoin-flow.unit.test.ts -x` | Wave 0 |
| DISC-03 | ensureMatchAlive guard rejects post-concede actions | unit | `npx vitest run test/backend/match-session/match-alive-guard.unit.test.ts -x` | Wave 0 |
| DISC-04 | Timestamp-check forfeit eligibility computation | unit | `npx vitest run test/backend/lobby/disconnect-forfeit.unit.test.ts -x` | Wave 0 |
| COST-01 | HsrLightconeCost PK already has gameMode | manual-only | Verified in code review | N/A (already complete) |

### Sampling Rate
- **Per task commit:** `npm test` (unit tests only, <30s)
- **Per wave merge:** `npx vitest run --config test/vitest.config.ts` (full suite)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/backend/lobby/disconnect-policy.unit.test.ts` -- covers DISC-01 (policy enum, ensureMatchAlive)
- [ ] `test/backend/lobby/disconnect-helpers.unit.test.ts` -- covers flag transfer, concede summary builder, pool mechanics
- [ ] `test/backend/match-results/concede-finalization.unit.test.ts` -- covers concede finalization matrix tiers

## Open Questions

1. **Concede Stage Tracking**
   - What we know: The concede finalization matrix depends on the lobby stage at concede time. But by the time runFinalization runs, the lobby has transitioned to AwaitingResult.
   - What's unclear: Where to store the "stage at concede time." Could be a new field on MatchResultRecord, or derived from existing step data.
   - Recommendation: Add a `concedeAtStage: LobbyStage` optional field to MatchResultRecord (or store as part of concedeSummary). The concede reducers capture the current stage before transitioning to AwaitingResult.

2. **Disconnect Pool Decrement Timing**
   - What we know: Pool tracks total time disconnected per player per match. D-10 says "every disconnect decrements pool by time spent disconnected."
   - What's unclear: Pool should be decremented at reconnect time (compute elapsed = now - disconnectedAt). At disconnect time, we don't know how long they'll be gone.
   - Recommendation: Record disconnectedAt at disconnect. At reconnect or at forfeit check time, compute elapsed and decrement pool. Never decrement pool in clientDisconnected itself.

3. **MatchResultRecord.matchOutcome Population for Concedes**
   - What we know: Current MatchResultRecord has no matchOutcome field -- it's computed in runFinalization. But concede reducers need to set matchOutcome=Concede before finalization.
   - What's unclear: Whether matchOutcome should be added to MatchResultRecord schema or remain computed.
   - Recommendation: Add `matchOutcome: MatchOutcome.optional()` to MatchResultRecord. Concede reducers set it. Normal finalization computes it from scores. This enables the matchOutcome-based branching in runFinalization.

## Sources

### Primary (HIGH confidence)
- Project codebase: All 15+ files read directly (enums.ts, lobby.ts, lobbyMember.ts, lobbyHelpers.ts, lobbyLifecycle.ts, lobbyGc.ts, draftClassic.ts, draftControl.ts, postDraft.ts, finalizationHelpers.ts, matchResultSubmission.ts, matchFinalization.ts, bracketAdvancement.ts, index.ts, structs.ts, matchResult.ts, lobbyPreset.ts, statsIncrement.ts)
- CONTEXT.md: 93 locked decisions (D-01 through D-93) with complete finalization matrix
- REQUIREMENTS.md: DISC-01 through DISC-04, COST-01 requirement definitions
- STATE.md: Project history, accumulated decisions from Phases 1-9

### Secondary (MEDIUM confidence)
- SpacetimeDB skill file (SKILL.md): API patterns, common mistakes, composite PK handling

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, all existing SpacetimeDB patterns
- Architecture: HIGH -- all decisions locked, existing code patterns well-understood, 15+ files audited
- Pitfalls: HIGH -- identified from concrete codebase patterns (composite PK, enum renames, finalization matrix)

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable -- all decisions locked, no external dependency movement)
