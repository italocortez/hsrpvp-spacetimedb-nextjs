# Phase 5: Match Results and MMR - Research

**Researched:** 2026-03-21
**Domain:** SpacetimeDB backend -- match result finalization, ELO rating system, leaderboard materialization
**Confidence:** HIGH

## Summary

Phase 5 implements the core match result lifecycle (score entry, confirmation, validation, finalization) and a full ELO-based MMR system with team size and account rating modifiers. The phase builds on extensive groundwork from Phases 3 and 04.1 -- existing reducer stubs (`finalize_match_result`, `process_tournament_mmr`), table schemas (MatchResultRecord/Game/Participant, MmrRating, MmrHistory, PlayerStat, PlayerCharacterStat, PlayerRelationship, MatchSessionHistory, MatchParticipantHistory), and behavioral contracts (confirm, submit, dispute, override flows) are all already in place.

The primary implementation work is: (1) a new `record_game_scores` reducer for per-game score entry with upsert semantics, (2) modifications to `submit_match_result` for Casual auto-validation, (3) modifications to `override_match_result` for Ranked screenshot validation, (4) the full `finalize_match_result` implementation (MMR processing, history writes, stat increments, ephemeral record deletion), (5) the full `process_tournament_mmr` implementation (batch MMR for tournament matches), (6) a new `EloConfig` table with admin reducer, and (7) a new `Leaderboard` materialized table. The ELO math is deterministic and formulaic (no external dependencies), making it well-suited for SpacetimeDB reducers.

**Primary recommendation:** Split into two plans -- Plan 1 for schema additions (EloConfig table, Leaderboard table, record_game_scores reducer, submit/override modifications) and Plan 2 for finalization logic (ELO calculation helpers, finalize_match_result, process_tournament_mmr, leaderboard rebuild, stat increments).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01 through D-03: MatchType enum reduced to Casual | Ranked; Tournament variant removed; tournament matchType derived from countTowardsMmr at creation time
- D-04 through D-08: Casual auto-validates, skips MMR, screenshots optional; Ranked stays Submitted until Admin/Mod/TO validates, screenshots required for validation
- D-09 through D-11: Three finalization paths (Casual, Ranked standalone, Ranked tournament batch)
- D-12 through D-17: ELO system -- initial 1000, EloConfig single-row table, K-factor tiers (40/20/10), base formula, individual K-factors, stored globalCompositeRating
- D-18 through D-21: Team size modifier with sizeBonus (150) and spreadDivisor (2)
- D-22 through D-28: Account rating modifier with Fair MMR / Handicap Play choice, maxAccountBonus (200), team averages, stacking
- D-29 through D-31: EloConfig table schema (sentinel PK id=1, admin-only, future-matches-only changes)
- D-32 through D-35: Confirmation moved to record-level (blueConfirmed/redConfirmed on MatchResultRecord)
- D-36 through D-39: refereeFullControl for spectator referee (already implemented)
- D-40 through D-43: Score entry flow -- MatchResultRecord created at match start, captains enter own side, record_game_scores upserts
- D-44 through D-51: Leaderboard -- 400-row materialized table, MmrRating stays public, minimum 2 matches, inline rebuild after MMR processing

### Claude's Discretion
- EloConfig table file creation and schema registration
- Exact reducer signatures for score entry (record_game_scores)
- Admin reducer for EloConfig updates (admin_update_elo_config)
- How refereeFullControl is inherited from lobby/tournament settings to MatchResultRecord
- Whether gameMode on Leaderboard uses existing GameMode enum + a Global variant, or a separate LeaderboardCategory enum
- Leaderboard rebuild helper implementation details (delete-all-for-mode + re-insert top 100)

### Deferred Ideas (OUT OF SCOPE)
- Handicap Play gameplay disadvantages (draft cost penalties, pick restrictions) -- Phase 9/10 scope
- Season implementation logic -- schema supports it (seasonId columns), deferred to v1
- Account rating formula details (how 0-1000 is calculated from roster) -- descoped to frontend in Phase 2
- Leaderboard pagination beyond top 100
- MmrRating visibility change to private + view
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MTCH-01 | Both players can submit their score for a match | `record_game_scores` reducer (new) + existing `confirm_match_scores` + `submit_match_result` |
| MTCH-02 | Score format is game-mode-specific: cycles for MoC/AA, score for AS | MatchResultGame schema already has teamBlueCyclesUsed/teamBlueScore columns per game mode |
| MTCH-03 | Both players can upload screenshots (Imgur URLs) | `record_game_scores` accepts screenshot URL params; MatchResultGame has teamBlue/RedScreenshotUrl |
| MTCH-04 | Support for per-boss scoring (2 bosses per game mode) and combined | MatchResultGame has boss1Score/boss2Score columns already defined |
| MTCH-05 | Casual matches auto-confirm when both agree on scores | Modify `submit_match_result`: Casual -> status=Validated directly |
| MTCH-06 | Tournament matches require referee/admin validation | Already implemented: Ranked stays at Submitted; `override_match_result` validates |
| MTCH-07 | Explicit verification status lifecycle | MatchResultStatus enum already has Pending/Submitted/Disputed/Validated/Rejected |
| MTCH-08 | Validated results trigger ELO + bracket advancement atomically | `finalize_match_result` implementation + bracket integration via `submit_and_advance_bracket` |
| MTCH-09 | mmrProcessedAt guard prevents duplicate ELO | mmrProcessedAt column exists on MatchResultRecord; checked before MMR processing |
| MMR-01 | Per-game-mode ELO rating stored | MmrRating table exists with [userId, gameMode] composite PK |
| MMR-02 | Global composite MMR = equal-weight average | MmrRating.globalCompositeRating column exists (stored, not computed) |
| MMR-03 | Tiered K-factor (40/20/10) | EloConfig table (new) with kFactorNew/Mid/Vet + threshold columns |
| MMR-04 | MMR history log with match reference | MmrHistory table exists with matchHistoryId FK to MatchSessionHistory |
| MMR-05 | matchesPlayedPerMode counter | MmrRating.matchesPlayed column exists |
| MMR-06 | Leaderboard sorted by MMR per mode and global | New Leaderboard table (materialized, 400 rows max) |
| MMR-07 | Season ID column in schema | MmrRating.seasonId and MmrHistory.seasonId already exist as optional u32 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spacetimedb | 2.0.5 | Backend runtime | Project standard -- all tables and reducers run here |
| TypeScript | 5.x | Language | Project standard |

### Supporting
No new external dependencies needed. The ELO calculation is pure arithmetic (no external math libraries). All tables already exist or follow established patterns.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled ELO | glicko2 / trueskill npm | Overkill -- project uses standard ELO with simple K-factor tiers; external libs would need deterministic guarantees for SpacetimeDB reducers |
| Materialized Leaderboard table | SpacetimeDB view | View would recompute on every MmrRating change; materialized table rebuilt only after MMR processing is more predictable and efficient |

## Architecture Patterns

### New Files
```
spacetimedb/src/
  tables/
    eloConfig.ts          # EloConfig single-row admin table (new)
    leaderboard.ts        # Leaderboard materialized table (new)
  reducers/
    scoreEntry.ts         # record_game_scores reducer (new)
    eloAdmin.ts           # admin_update_elo_config, admin_seed_elo_config (new)
  helpers/
    eloCalculation.ts     # ELO math: getKFactor, calculateExpectedScore, calculateRatingChange, calculateTeamEffective, calculateAccountModifier (new)
    leaderboardRebuild.ts # rebuildLeaderboard helper (new)
    statsIncrement.ts     # incrementPlayerStats, incrementCharacterStats, incrementRelationships helpers (new)
```

### Modified Files
```
spacetimedb/src/
  schema.ts               # Add EloConfig, Leaderboard imports
  index.ts                # Export new reducers
  reducers/
    matchResultSubmission.ts   # submit_match_result: add Casual auto-validation path
    tournamentAdmin.ts         # override_match_result: add Ranked screenshot gate
    matchFinalization.ts       # Full implementation of finalize_match_result + process_tournament_mmr
```

### Pattern 1: EloConfig Single-Row Table
**What:** Admin-tunable config table with sentinel PK (id=1), same pattern as established in project
**When to use:** Any admin-configurable system parameter
**Example:**
```typescript
// tables/eloConfig.ts
export const EloConfigTable = table({
    name: 'elo_config',
    public: true,
}, {
    id: t.u32().primaryKey(),  // sentinel value 1
    kFactorNew: t.u8(),       // 40
    kFactorMid: t.u8(),       // 20
    kFactorVet: t.u8(),       // 10
    newThreshold: t.u32(),    // 20
    midThreshold: t.u32(),    // 100
    initialRating: t.u32(),   // 1000
    sizeBonus: t.u32(),       // 150
    spreadDivisor: t.u8(),    // 2
    maxAccountBonus: t.u32(), // 200
    // audit columns...
});
```

### Pattern 2: Leaderboard Materialized Table
**What:** Public table rebuilt after MMR changes, 400 rows max (100 per game mode x 3 + 100 global)
**When to use:** When a sorted view would be too expensive to recompute on every source table change
**Example:**
```typescript
// tables/leaderboard.ts
export const Leaderboard = table({
    name: 'leaderboard',
    public: true,
    indexes: [
        { accessor: 'by_category_and_rank', algorithm: 'btree', columns: ['category', 'rank'] },
    ],
}, {
    category: t.string(),  // "MemoryOfChaos", "ApocalypticShadow", "AnomalyArbitration", "Global"
    rank: t.u16(),
    userId: t.u32(),
    rating: t.u32(),
    matchesPlayed: t.u32(),
    wins: t.u32(),
    seasonId: t.u32().optional(),
    // audit columns...
});
```

**Design decision for category column:** Use a plain `t.string()` with the 4 category values ("MemoryOfChaos", "ApocalypticShadow", "AnomalyArbitration", "Global") rather than adding a "Global" variant to the existing GameMode enum. Reason: GameMode is used across 10+ tables and reducers; adding a Global variant would require guards everywhere else to reject it (lobbies, match results, cost sets, stats). A string column avoids polluting the enum. The planner may choose differently -- this is Claude's discretion territory.

### Pattern 3: ELO Calculation as Pure Helper Functions
**What:** All ELO math in a standalone helper file, no database access -- just numbers in, numbers out
**When to use:** Deterministic calculations that should be unit-testable in isolation
```typescript
// helpers/eloCalculation.ts
export function getKFactor(matchesPlayed: number, config: EloConfigRow): number {
    if (matchesPlayed <= config.newThreshold) return config.kFactorNew;
    if (matchesPlayed <= config.midThreshold) return config.kFactorMid;
    return config.kFactorVet;
}

export function calculateExpectedScore(playerEffective: number, opponentEffective: number): number {
    return 1 / (1 + Math.pow(10, (opponentEffective - playerEffective) / 400));
}

export function calculateTeamEffective(
    teamRatings: number[],
    sizeBonus: number,
    spreadDivisor: number
): number {
    const avg = teamRatings.reduce((a, b) => a + b, 0) / teamRatings.length;
    const stdev = Math.sqrt(
        teamRatings.reduce((sum, r) => sum + (r - avg) ** 2, 0) / teamRatings.length
    );
    return avg + sizeBonus * (teamRatings.length - 1) - stdev / spreadDivisor;
}

export function calculateAccountModifier(
    playerAccountRating: number,
    opponentAccountRating: number,
    maxAccountBonus: number
): number {
    const gap = Math.abs(playerAccountRating - opponentAccountRating);
    return (gap / 1000) * maxAccountBonus;
}
```

### Pattern 4: Finalization Transaction (Delete Ephemeral, Write Permanent)
**What:** `finalize_match_result` in a single reducer transaction: write history, increment stats, delete ephemeral
**When to use:** Converting operational data to permanent records
```
finalize_match_result(matchResultId):
  1. Read MatchResultRecord -- verify status=Validated
  2. For Ranked: verify mmrProcessedAt is set
  3. For Casual: skip MMR gate (mmrProcessedAt will be null)
  4. Read all MatchResultParticipant rows for this match
  5. Read all MatchResultGame rows for this match
  6. Read Lobby for match context (gameMode, draftMode, lobbyCode, etc.)
  7. Write MatchSessionHistory row
  8. Write MatchParticipantHistory row per participant
  9. Increment PlayerStat per participant (delete+insert for composite PK)
  10. Increment PlayerCharacterStat per character used (requires draft history -- see Open Questions)
  11. Increment PlayerRelationship per participant pair (delete+insert for composite PK)
  12. Delete all MatchResultGame rows for this match
  13. Delete all MatchResultParticipant rows for this match
  14. Delete MatchResultRecord
```

### Anti-Patterns to Avoid
- **Floating-point in ELO storage:** Store ratings as u32 integers. Use f64 only for intermediate calculation, round at the end. Avoids precision drift.
- **Processing MMR for Casual matches:** The matchType check must be the FIRST thing in any MMR processing path. Casual matches never touch MmrRating.
- **Recomputing globalCompositeRating on read:** It's stored for btree index sorting. Must be updated every time any per-mode rating changes.
- **iter() for leaderboard rebuild:** Use `by_user_and_mode` btree index on MmrRating, not iter(). However, for rebuild we need sorted data -- get all rows for a mode via btree, sort in memory, take top 100.
- **Forgetting audit columns on upserted stat rows:** Composite PK tables use delete+insert for updates; must preserve createdById/createdDate from the existing row.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Standard deviation | Manual loop | `Math.sqrt(arr.reduce(...) / arr.length)` | Population stdev, not sample -- one formula line |
| Leaderboard sorting | View with ORDER BY | Materialized table with delete-all + insert top 100 | Views recompute on every source change; materialized is cheaper |
| Account rating | Backend calculation | Frontend-computed from roster subscription data | ROST-08 was descoped to frontend in Phase 2 -- no HsrAccount.accountRating column exists |
| MMR initialization | Lazy creation in ELO calc | Explicit MmrRating row creation when match is first finalized | Avoids race conditions; clear initialization point |

**Key insight:** The account rating modifier uses `HsrAccount` data that does NOT have a stored `accountRating` column. ROST-08 was descoped to frontend computation in Phase 2 verification. This means Phase 5 either needs to: (a) add an `accountRating` column to HsrAccount and compute it server-side (schema change, requires `--clear-database`), or (b) compute account rating inline in the MMR reducer from roster data (HsrAccountCharacter + cost tables). Option (b) avoids schema changes but adds complexity to the reducer. This is flagged as an Open Question for the planner.

## Common Pitfalls

### Pitfall 1: Account Rating Column Missing
**What goes wrong:** CONTEXT.md states "HsrAccount.accountRating already exists (ROST-08)" but verification shows HsrAccount has NO accountRating column. ROST-08 was descoped to frontend computation in Phase 2.
**Why it happens:** CONTEXT.md was written based on REQUIREMENTS.md showing ROST-08 as "Complete", but the Phase 2 verification clarified it as "PARTIAL -- frontend-computed".
**How to avoid:** Plan must either add an accountRating column to HsrAccount (safe if appended at end with default value, no --clear-database needed) or compute it inline in the MMR reducer.
**Warning signs:** Any code referencing `hsrAccount.accountRating` will fail at runtime.

### Pitfall 2: Double MMR Processing
**What goes wrong:** A race condition or retry could process MMR twice for the same match, doubling rating changes.
**Why it happens:** mmrProcessedAt guard isn't checked, or is checked but not atomically set.
**How to avoid:** Check `mmrProcessedAt === undefined` BEFORE processing, set it IMMEDIATELY after processing, all in the same reducer transaction (SpacetimeDB transactions are atomic).
**Warning signs:** MmrHistory shows two entries with the same matchHistoryId.

### Pitfall 3: Composite PK Update Pattern
**What goes wrong:** Trying to use `.id.update()` on tables with composite primary keys (PlayerStat, PlayerCharacterStat, PlayerRelationship, MmrRating).
**Why it happens:** Composite PK tables don't have a single `.id` accessor -- they require delete + insert.
**How to avoid:** Use the established `delete(existing) + insert({...existing, updatedFields, ...auditUpdate()})` pattern.
**Warning signs:** TypeError at runtime on `.primaryKey.find()` calls.

### Pitfall 4: BigInt Comparison in Score Columns
**What goes wrong:** Score columns (teamBlueScore, teamRedScore, boss scores) are u64 (BigInt). Comparing with plain numbers silently returns false.
**Why it happens:** SpacetimeDB maps u64 to BigInt in TypeScript; `score === 0` is always false when score is `0n`.
**How to avoid:** Always use BigInt literals (0n, 1n) or explicit BigInt() conversion when comparing score values.
**Warning signs:** Score comparisons that should match but don't.

### Pitfall 5: Leaderboard Enum Pollution
**What goes wrong:** Adding a "Global" variant to GameMode enum for the leaderboard category ripples across the entire codebase.
**Why it happens:** GameMode is used in 10+ tables, lobby config, match config, etc. A "Global" game mode makes no sense for actual gameplay.
**How to avoid:** Use a string column or a separate LeaderboardCategory enum for the leaderboard table.
**Warning signs:** New validation guards needed in every reducer that accepts GameMode.

### Pitfall 6: MmrRating Row Not Existing for New Players
**What goes wrong:** First-time ranked match finalization tries to read MmrRating for a player who has never played ranked.
**Why it happens:** MmrRating rows are not created at user registration -- they're created on first ranked match.
**How to avoid:** In MMR processing, if no MmrRating row exists for a player+gameMode, create one with initialRating from EloConfig and matchesPlayed=0 before calculating deltas.
**Warning signs:** Null reference on `existingRating.rating` for new players.

### Pitfall 7: globalCompositeRating Requires All 3 Modes
**What goes wrong:** globalCompositeRating averages across 3 game modes, but a player may only have played 1 mode.
**Why it happens:** Not all players play all 3 game modes.
**How to avoid:** Only average across modes where the player has an MmrRating row. If only 1 mode, globalComposite = that mode's rating.
**Warning signs:** globalCompositeRating = 333 for a player at 1000 in one mode and unrated in two others.

### Pitfall 8: Forgetting to Delete MatchResultGame Rows in Finalization
**What goes wrong:** MatchResultRecord is deleted but MatchResultGame and MatchResultParticipant rows are orphaned.
**Why it happens:** Deletion order matters -- child rows must be deleted before or alongside the parent.
**How to avoid:** Delete in order: MatchResultGame rows, MatchResultParticipant rows, then MatchResultRecord.
**Warning signs:** Orphaned rows in match_result_game table with no matching match_result_record.

## Code Examples

### Score Entry Reducer (record_game_scores)
```typescript
// reducers/scoreEntry.ts
export const record_game_scores = spacetimedb.reducer(
    {
        matchResultId: t.u32(),
        gameNumber: t.u8(),
        teamBlueCyclesUsed: t.u32().optional(),
        teamRedCyclesUsed: t.u32().optional(),
        teamBlueScore: t.u64().optional(),
        teamRedScore: t.u64().optional(),
        teamBlueBoss1Score: t.u64().optional(),
        teamBlueBoss2Score: t.u64().optional(),
        teamRedBoss1Score: t.u64().optional(),
        teamRedBoss2Score: t.u64().optional(),
        teamBlueScreenshotUrl: t.string().optional(),
        teamRedScreenshotUrl: t.string().optional(),
        winnerTeamSide: t.string(),  // "Blue" or "Red" -- TeamLabel tag
    },
    (ctx, args) => {
        // 1. Auth + find match result
        // 2. Verify status is Pending
        // 3. Verify caller is captain for their side OR spectator referee with refereeFullControl
        // 4. Determine which fields the caller can set (own side only, or both for referee)
        // 5. Upsert: find existing MatchResultGame by [matchResultId, gameNumber]
        //    - If exists: delete + insert with updated fields
        //    - If not: insert new row
    }
);
```

### ELO Processing in finalize_match_result (Ranked path)
```typescript
// Inside finalize_match_result, after validation:
function processMatchMmr(ctx: any, matchResult: any, participants: any[], games: any[], userId: number): number {
    // Returns matchHistoryId for MmrHistory FK

    const config = ctx.db.EloConfigTable.id.find(1);
    if (!config) throw new SenderError('ELO config not initialized.');

    const gameMode = games[0].gameMode;  // All games in a match share gameMode

    // Separate blue and red participants
    const blueParticipants = participants.filter(p => p.teamSide.tag === 'Blue');
    const redParticipants = participants.filter(p => p.teamSide.tag === 'Red');

    // Get or create MmrRating for each participant
    // Calculate team effective ratings
    // Apply account modifier if Fair MMR
    // Calculate expected scores
    // Determine actual result (1/0.5/0)
    // Calculate deltas per player
    // Update MmrRating rows (delete + insert)
    // Update globalCompositeRating for each affected player
    // Insert MmrHistory rows
}
```

### Leaderboard Rebuild Helper
```typescript
// helpers/leaderboardRebuild.ts
export function rebuildLeaderboard(ctx: any, userId: number): void {
    // 1. Delete all existing Leaderboard rows
    for (const row of [...ctx.db.Leaderboard.iter()]) {
        ctx.db.Leaderboard.delete(row);
    }

    // 2. For each of the 3 game modes + Global:
    const categories = ['MemoryOfChaos', 'ApocalypticShadow', 'AnomalyArbitration', 'Global'];

    for (const category of categories) {
        let entries: Array<{ userId: number; rating: number; matchesPlayed: number; wins: number }>;

        if (category === 'Global') {
            // Get all users with globalCompositeRating, sorted desc, top 100
            // Filter: matchesPlayed >= 2 (across any mode)
        } else {
            // Get all MmrRating rows for this gameMode, sorted by rating desc, top 100
            // Filter: matchesPlayed >= 2
        }

        // 3. Insert top 100 as Leaderboard rows with rank 1..N
    }
}
```

### Stat Increment Pattern (Composite PK Upsert)
```typescript
// helpers/statsIncrement.ts
export function incrementPlayerStat(
    ctx: any, userId: number, gameMode: any, draftMode: any,
    isWin: boolean, isDraw: boolean, actingUserId: number
): void {
    const existing = [...ctx.db.PlayerStat.by_user_mode_draft.filter([userId, gameMode, draftMode])][0];

    if (existing) {
        ctx.db.PlayerStat.delete(existing);
        ctx.db.PlayerStat.insert({
            ...existing,
            matchesPlayed: existing.matchesPlayed + 1,
            wins: existing.wins + (isWin ? 1 : 0),
            losses: existing.losses + (!isWin && !isDraw ? 1 : 0),
            draws: existing.draws + (isDraw ? 1 : 0),
            ...auditUpdate(ctx, existing, actingUserId),
        } as any);
    } else {
        ctx.db.PlayerStat.insert({
            userId, gameMode, draftMode,
            matchesPlayed: 1,
            wins: isWin ? 1 : 0,
            losses: !isWin && !isDraw ? 1 : 0,
            draws: isDraw ? 1 : 0,
            matchesSpectated: 0,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| MatchType had Tournament variant | Casual and Ranked only | Phase 5 discussion (2026-03-20) | Tournament matchType derived from countTowardsMmr |
| isConfirmed on MatchResultParticipant | blueConfirmed/redConfirmed on MatchResultRecord | Phase 04.1 (2026-03-20) | Record-level confirmation is already implemented |
| player1Id/player2Id on MatchResultRecord | MatchResultParticipant junction table | Phase 04.1 (2026-03-20) | Supports 2v2/3v3 via junction rows |
| HsrAccount.accountRating column | Frontend-computed from roster data | Phase 2 verification (2026-03-17) | No server-side accountRating exists |

## Open Questions

1. **Account Rating Source for MMR Modifier**
   - What we know: HsrAccount does NOT have an accountRating column. ROST-08 was descoped to frontend computation. The ELO system needs account ratings to calculate the account rating modifier (D-22 through D-28).
   - What's unclear: Should Phase 5 (a) add an accountRating column to HsrAccount (safe -- appended at end with default), (b) compute it inline from HsrAccountCharacter + cost data in the reducer, or (c) defer the account rating modifier entirely to a later phase?
   - Recommendation: Option (a) -- add `accountRating: t.u32()` with default value 0 to the end of HsrAccount columns. This is a safe schema addition (no --clear-database). Add a helper function that computes it from roster data and call it when roster changes. This way the backend has the value for MMR processing. The frontend can still compute it independently for display. If the user prefers deferring, the modifier can be stubbed to 0 and implemented later.

2. **Character Stats Source for finalize_match_result**
   - What we know: PlayerCharacterStat tracks per-character wins/losses. finalize_match_result needs to know which characters each player used.
   - What's unclear: The character data lives in MatchSessionStep (draft picks) or could be captured in the match result flow. How does finalize_match_result access draft picks?
   - Recommendation: Read MatchSessionStep rows for the lobby's MatchSession to extract character picks (steps with actionType=Pick). If MatchSession has already been cleaned up, this data is lost. Alternatively, capture character names in MatchParticipantHistory during finalization (would need a schema addition). The planner should decide whether PlayerCharacterStat updates happen in Phase 5 or are deferred to Phase 6 (STAT-05).

3. **Handicap Play / Fair MMR Choice Tracking**
   - What we know: D-23 says the higher-account-rating player chooses Fair MMR or Handicap Play per match. Handicap gameplay effects are Phase 9/10.
   - What's unclear: Where is this choice stored? MatchResultRecord doesn't have a column for it. Do we need one?
   - Recommendation: Add an optional `accountModifierMode` column (string or enum: "FairMmr" | "Handicap") to MatchResultRecord. For Phase 5, only "FairMmr" is functional; "Handicap" would zero out the modifier but gameplay handicaps are deferred. If not needed yet, default to FairMmr for all matches in Phase 5.

4. **Leaderboard Wins Column Source**
   - What we know: Leaderboard table (D-47) includes a `wins` column. MmrRating does NOT have a wins column -- only rating and matchesPlayed.
   - What's unclear: Where does the wins count come from for leaderboard entries?
   - Recommendation: Join against PlayerStat during leaderboard rebuild. PlayerStat has wins per userId/gameMode/draftMode. Sum wins across draftModes for the given gameMode to get total wins for leaderboard.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest 3.x |
| Config file | `test/vitest.config.ts` |
| Quick run command | `npx vitest run --config test/vitest.config.ts` |
| Full suite command | `npx vitest run --config test/vitest.config.ts` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MTCH-01 | Score entry via record_game_scores | unit | `npx vitest run test/backend/match-results/score-entry.unit.test.ts -x` | No -- Wave 0 |
| MTCH-02 | Game-mode-specific score format validation | unit | `npx vitest run test/backend/match-results/score-entry.unit.test.ts -x` | No -- Wave 0 |
| MTCH-03 | Screenshot URL storage | unit | `npx vitest run test/backend/match-results/score-entry.unit.test.ts -x` | No -- Wave 0 |
| MTCH-04 | Per-boss scoring columns | unit | `npx vitest run test/backend/match-results/score-entry.unit.test.ts -x` | No -- Wave 0 |
| MTCH-05 | Casual auto-validation | unit | `npx vitest run test/backend/match-results/submission.unit.test.ts -x` | No -- Wave 0 |
| MTCH-06 | Tournament match validation gate | unit | `npx vitest run test/backend/match-results/submission.unit.test.ts -x` | No -- Wave 0 |
| MTCH-07 | Status lifecycle | unit | `npx vitest run test/backend/match-results/submission.unit.test.ts -x` | No -- Wave 0 |
| MTCH-08 | Validated -> ELO + bracket in same transaction | unit | `npx vitest run test/backend/match-results/finalization.unit.test.ts -x` | No -- Wave 0 |
| MTCH-09 | mmrProcessedAt guard | unit | `npx vitest run test/backend/match-results/finalization.unit.test.ts -x` | No -- Wave 0 |
| MMR-01 | Per-mode ELO storage | unit | `npx vitest run test/backend/match-results/elo-calculation.unit.test.ts -x` | No -- Wave 0 |
| MMR-02 | Global composite calculation | unit | `npx vitest run test/backend/match-results/elo-calculation.unit.test.ts -x` | No -- Wave 0 |
| MMR-03 | K-factor tiers | unit | `npx vitest run test/backend/match-results/elo-calculation.unit.test.ts -x` | No -- Wave 0 |
| MMR-04 | MMR history with match ref | unit | `npx vitest run test/backend/match-results/finalization.unit.test.ts -x` | No -- Wave 0 |
| MMR-05 | matchesPlayed counter | unit | `npx vitest run test/backend/match-results/elo-calculation.unit.test.ts -x` | No -- Wave 0 |
| MMR-06 | Leaderboard sorted by MMR | unit | `npx vitest run test/backend/match-results/leaderboard.unit.test.ts -x` | No -- Wave 0 |
| MMR-07 | seasonId column | manual-only | Schema inspection | N/A -- already exists |

### Sampling Rate
- **Per task commit:** `npx vitest run --config test/vitest.config.ts`
- **Per wave merge:** `npx vitest run --config test/vitest.config.ts`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/backend/match-results/score-entry.unit.test.ts` -- covers MTCH-01, MTCH-02, MTCH-03, MTCH-04
- [ ] `test/backend/match-results/submission.unit.test.ts` -- covers MTCH-05, MTCH-06, MTCH-07
- [ ] `test/backend/match-results/finalization.unit.test.ts` -- covers MTCH-08, MTCH-09, MMR-04
- [ ] `test/backend/match-results/elo-calculation.unit.test.ts` -- covers MMR-01, MMR-02, MMR-03, MMR-05
- [ ] `test/backend/match-results/leaderboard.unit.test.ts` -- covers MMR-06

## Sources

### Primary (HIGH confidence)
- Existing codebase: all table schemas, reducer implementations, helper patterns read directly from source
- `docs/match-results/architecture.md` -- match result submission flow, status lifecycle, table reference
- `docs/match-results/contract.md` -- acceptance scenarios for confirmation, submission, dispute, override, finalization
- `docs/mmr/architecture.md` -- full ELO model, K-factor tiers, team size modifier, account rating modifier, finalization flow
- `docs/player-stats/architecture.md` -- PlayerStat, PlayerCharacterStat, PlayerRelationship incremental aggregation
- `05-CONTEXT.md` -- all user decisions (D-01 through D-51)

### Secondary (MEDIUM confidence)
- Phase 2 verification (`02-VERIFICATION.md`) -- confirmed ROST-08 was descoped to frontend, no accountRating column exists

### Tertiary (LOW confidence)
- None -- all findings verified against source code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new external dependencies; all SpacetimeDB patterns well-established in codebase
- Architecture: HIGH -- builds on 5 phases of established patterns; file structure, naming, audit columns all documented
- ELO calculation: HIGH -- standard formula with clear spec in mmr/architecture.md; pure arithmetic
- Account rating modifier: MEDIUM -- the accountRating column gap needs resolution before implementation
- Pitfalls: HIGH -- derived from verified codebase patterns and known SpacetimeDB SDK behaviors

**Research date:** 2026-03-21
**Valid until:** 2026-04-21 (stable -- no external dependency changes expected)
