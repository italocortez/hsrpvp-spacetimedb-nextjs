# Phase 4: Bracket Generation and Advancement - Research

**Researched:** 2026-03-18
**Domain:** Tournament bracket generation algorithms, SpacetimeDB TypeScript module patterns
**Confidence:** HIGH

## Summary

Phase 4 implements bracket generation (single elimination, double elimination, group phase round-robin, and hybrid group-into-elimination) as SpacetimeDB server-side reducers. All bracket data is stored as individual `BracketMatch` rows with explicit FK links (`nextWinnerMatchId`, `nextLoserMatchId`) -- no JSON blobs. The phase also implements auto-advancement (winner placed in next match slot when result confirmed), seeding (MMR-based and manual swap), and rollback (one step back).

The core challenge is algorithmic: correctly generating bracket structures for varied participant counts (including odd numbers with byes), wiring FK links between matches, implementing the losers bracket feed-in pattern for double elimination, and handling the round-robin circle scheduling algorithm for groups. All of this must work within SpacetimeDB's transactional reducer model (no async, no random, deterministic execution).

**Primary recommendation:** Implement bracket generation as pure helper functions that compute match arrays, then have the `generate_bracket` reducer call the appropriate helper and batch-insert all rows. Keep helpers in a `helpers/bracketGeneration.ts` file (one file, multiple exported functions per format). Advancement logic goes in a separate `reducers/bracketAdvancement.ts` file.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **BracketSide enum** replaces `isLosersBracket: bool` with 5 variants: `Winners`, `Losers`, `GrandFinals`, `ThirdPlace`, `Group`. Destructive schema change requiring `--clear-database`.
- **Grand Finals**: Single match with advantage, no reset bracket. `winnerAdvantage` copied from `Tournament.winnerAdvantage` into the GrandFinals match row.
- **3rd Place Match**: Controlled by `Tournament.has3rdPlaceMatch: bool`. Semifinal losers routed via `nextLoserMatchId`.
- **Auto-Advancement**: Separate `advance_bracket_match(bracketMatchId)` reducer. `submit_match_result` is NOT modified. Wrapper reducer `submit_and_advance_bracket(matchResultId)` handles tournament flow. Controlled by `Tournament.autoAdvanceBracket: bool`.
- **Winner ID mapping**: `MatchResultRecord.winnerId` (userId) maps through `TournamentParticipant.teamGroupId` to `TournamentTeam.id` for BracketMatch participant slots.
- **BYE handling**: BYE matches have one null participant slot with winnerId pre-set; participant auto-advanced immediately.
- **DQ handling**: `dq_participant` scans BracketMatch by tournamentId to find active match, auto-advances opponent when `autoAdvanceBracket` is on.
- **Rollback**: `rollback_bracket_match(bracketMatchId)` -- one step back, only during InProgress. Checks `mmrProcessedAt` on `MatchResultRecord` via `bracketMatchId` lookup.
- **Seeding**: Two modes: MMR-based (sort by MmrRating for tournament's defaultGameMode) or random. `swap_seeds(tournamentId, teamId1, teamId2)` for manual adjustment during Seeding stage. `seedNumber` moves from `TournamentParticipant` to `TournamentTeam`.
- **Odd brackets allowed**: Don't pad to power of 2. Top seeds get byes.
- **Auto-team for solos in team tournaments**: `TournamentParticipant.allowRandomTeamAssignment: bool`. Groups opt-in solos preferring same HSR account region.
- **Participant IDs on BracketMatch**: Always `TournamentTeam.id`. Even solo players get auto-created `TournamentTeam`.
- **Team name rules**: Solo non-anonymous = forced to player's displayName with lazy sync. Solo anonymous = free edit. Team = captain edits.
- **Group phase mechanics**: Win=2, Draw=1, Loss=0. Tiebreaker: head-to-head then game differential. `groupSize: u8` (min 3), auto-calc group count. Snake seeding across groups. `groupAdvanceCount` controls advancement.
- **Bracket regeneration**: `generate_bracket` during Seeding stage deletes all existing BracketMatch rows and recreates.
- **One reducer**: `generate_bracket(tournamentId)` reads `Tournament.format` and branches internally.
- **Stage transition guards**: Registration->Seeding needs 2+ active participants. Seeding->InProgress needs bracket generated and first-round participants assigned.
- **Schema changes** (all destructive): BracketMatch.bracketSide enum, Tournament.groupSize/has3rdPlaceMatch/autoAdvanceBracket, TournamentParticipant.allowRandomTeamAssignment, TournamentParticipant.seedNumber removed, TournamentTeam.seedNumber added, GroupStanding.participantTeamId renamed from participantUserId.
- **Bracket display**: Frontend computes from BracketMatch rows. No backend metadata table.
- **Bandwidth**: BracketMatch filtered by tournamentId per subscriber.

### Claude's Discretion
- Internal helper organization for bracket generation (separate files per format or one file with functions)
- Index strategy for new `bracketSide` column
- Exact logic for snake seeding distribution algorithm
- How to handle hybrid format transition (group -> elimination) when groups complete at different times
- Error messages and validation details

### Deferred Ideas (OUT OF SCOPE)
- MMR reversal on bracket rollback -- Phase 5
- MMR magnitude function (ELO calculations) -- Phase 5
- Lobby creation/linkage for bracket matches -- Phase 9
- Anonymous team membership view -- Phase 6
- Tournament archiving -- Future
- Bracket display metadata table -- Future
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| BRKT-01 | Single elimination bracket generated with proper seeding | Standard fold/mirror seeding algorithm (1v16, 8v9, etc.), bye distribution to top seeds, nextWinnerMatchId FK wiring |
| BRKT-02 | Double elimination bracket with winners and losers brackets | Winners bracket + losers bracket with alternating minor/major rounds, feed-in positions, GrandFinals match, total 2n-2 matches |
| BRKT-03 | Group phase generates round-robin with standings tracking | Circle method scheduling, GroupStanding rows per team per group, Win=2/Draw=1/Loss=0 point system |
| BRKT-04 | Auto-advance winner to next match slot on confirmed result | `advance_bracket_match` reducer maps winnerId(userId)->teamId, places in nextWinnerMatchId/nextLoserMatchId slot |
| BRKT-05 | Seeding supports manual assignment and MMR-based auto-seeding | MmrRating lookup by tournament's defaultGameMode, `swap_seeds` reducer, auto-seed during generate_bracket |
| BRKT-06 | Explicit FK references (nextWinnerMatchId, nextLoserMatchId) -- no JSON blob | BracketMatch rows use u32 optional FKs pointing to other BracketMatch.id values |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SpacetimeDB TypeScript SDK | (project pinned) | Server-side module runtime | Project standard -- all backend logic runs as SpacetimeDB reducers |

### Supporting
No external libraries needed. Bracket generation is pure algorithmic logic implemented in SpacetimeDB reducer helpers. The algorithms (fold seeding, circle scheduling, bracket wiring) are well-understood and straightforward to implement inline.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled bracket generation | `brackets-manager.js` npm package | Cannot use: SpacetimeDB modules run in WASM, no npm dependency support. All logic must be self-contained in the module's TypeScript source. The algorithms are also simple enough (~200 lines each) that a library would be overkill. |

**Installation:**
No new packages. This phase is entirely SpacetimeDB server-side code using existing project dependencies.

## Architecture Patterns

### Recommended Project Structure
```
spacetimedb/src/
  types/
    enums.ts                    # Add BracketSide enum
  tables/
    bracketMatch.ts             # Modify: replace isLosersBracket with bracketSide
    groupStanding.ts            # Modify: rename participantUserId -> participantTeamId
    tournament.ts               # Modify: add groupSize, has3rdPlaceMatch, autoAdvanceBracket
    tournamentParticipant.ts    # Modify: add allowRandomTeamAssignment, remove seedNumber
    tournamentTeam.ts           # Modify: add seedNumber
  helpers/
    bracketGeneration.ts        # NEW: pure functions for all bracket formats
    tournamentHelpers.ts        # Modify: add stage transition guards
  reducers/
    bracketGeneration.ts        # NEW: generate_bracket, seed_bracket, swap_seeds reducers
    bracketAdvancement.ts       # NEW: advance_bracket_match, submit_and_advance_bracket, rollback_bracket_match
    tournamentAdmin.ts          # Modify: dq_participant gains auto-advance logic
    tournamentRegistration.ts   # Modify: auto-team creation for solo tournaments
    profile.ts                  # Modify: lazy sync team name for solo non-anonymous
  docs/
    brackets/README.md          # Update with new BracketSide enum, advancement flow
    tournament/README.md        # Update with bracket generation section
```

### Pattern 1: Bracket Generation as Pure Helper Functions
**What:** Separate the bracket computation (which matches to create, how to wire FKs) from the database writes. Helper functions return arrays of match descriptors; the reducer does the inserts.
**When to use:** Always for bracket generation -- allows testing the algorithm logic independently.
**Example:**
```typescript
// helpers/bracketGeneration.ts

interface BracketMatchDescriptor {
  roundNumber: number;
  matchNumber: number;
  bracketSide: string; // BracketSide enum tag
  groupId?: number;
  participant1Id?: number;
  participant2Id?: number;
  bestOf: number;
  winnerAdvantage: number;
  // FK links resolved after all matches created (by position reference)
}

// Returns descriptors with position-based references.
// The reducer assigns real IDs after insert and wires the FKs.
export function generateSingleElimBracket(
  teamIds: number[], // sorted by seed
  bestOf: number,
): BracketMatchDescriptor[] { ... }
```

### Pattern 2: Two-Pass FK Wiring
**What:** BracketMatch rows reference each other via `nextWinnerMatchId` and `nextLoserMatchId`, but you can't know the IDs until after insert (autoInc). Solution: insert all matches first with null FKs, then update them.
**When to use:** Every bracket generation.
**Example:**
```typescript
// Pass 1: Insert all matches, collect {position -> insertedId} map
const idMap = new Map<string, number>(); // "R1M1" -> 42
for (const desc of descriptors) {
  const row = ctx.db.BracketMatch.insert({ ...desc, nextWinnerMatchId: undefined, nextLoserMatchId: undefined });
  idMap.set(`R${desc.roundNumber}M${desc.matchNumber}`, row.id);
}

// Pass 2: Update each match with resolved FK IDs
for (const desc of descriptors) {
  if (desc.nextWinnerRef || desc.nextLoserRef) {
    const row = ctx.db.BracketMatch.id.find(idMap.get(desc.key)!);
    ctx.db.BracketMatch.id.update({
      ...row,
      nextWinnerMatchId: desc.nextWinnerRef ? idMap.get(desc.nextWinnerRef) : undefined,
      nextLoserMatchId: desc.nextLoserRef ? idMap.get(desc.nextLoserRef) : undefined,
    });
  }
}
```

### Pattern 3: Fold/Mirror Seeding for Elimination Brackets
**What:** Standard seeding placement used by ATP, WTA, ITF, and virtually all professional tournaments. Ensures top seeds meet in later rounds.
**When to use:** Single and double elimination bracket generation.
**Algorithm:**
```typescript
// For N participants (may be < power of 2):
// 1. Calculate bracket size = next power of 2 >= N
// 2. Generate seed positions using fold method
// 3. Top seeds get BYEs (null opponent slots)

function foldSeeding(bracketSize: number): number[][] {
  // Start with [1, 2] for a 2-slot bracket
  let matchups = [[1, 2]];

  // Double the bracket size each iteration
  let currentSize = 2;
  while (currentSize < bracketSize) {
    const newMatchups: number[][] = [];
    const nextSize = currentSize * 2;
    for (const [a, b] of matchups) {
      // Each existing match splits into two:
      // seed a vs (nextSize + 1 - a), seed b vs (nextSize + 1 - b)
      newMatchups.push([a, nextSize + 1 - a]);
      newMatchups.push([b, nextSize + 1 - b]);
    }
    matchups = newMatchups;
    currentSize = nextSize;
  }
  return matchups;
}

// Example: bracketSize=8 produces: [[1,8],[4,5],[2,7],[3,6]]
// For 6 participants: seeds 7,8 become BYEs (null), top 2 seeds get byes
```

### Pattern 4: Circle Method for Round-Robin Scheduling
**What:** Standard algorithm for generating a round-robin schedule where every team plays every other team exactly once.
**When to use:** Group phase generation (GroupOnly, GroupIntoSingleElim, GroupIntoDoubleElim).
**Algorithm:**
```typescript
function circleSchedule(teamIds: number[]): [number, number][][] {
  const teams = [...teamIds];
  // If odd count, add a BYE sentinel
  if (teams.length % 2 !== 0) teams.push(-1); // -1 = BYE

  const n = teams.length;
  const rounds: [number, number][][] = [];

  for (let round = 0; round < n - 1; round++) {
    const matches: [number, number][] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = teams[i];
      const away = teams[n - 1 - i];
      if (home !== -1 && away !== -1) {
        matches.push([home, away]);
      }
    }
    rounds.push(matches);
    // Rotate: fix teams[0], rotate rest
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }
  return rounds;
}
```

### Pattern 5: Snake Seeding for Group Distribution
**What:** Distribute seeded participants across groups in a serpentine pattern to balance group strength.
**When to use:** Group phase and hybrid format group assignment (when groupAssignmentMode = Auto).
**Algorithm:**
```typescript
function snakeSeedIntoGroups(
  sortedTeamIds: number[], // sorted by seed (index 0 = seed 1)
  groupCount: number,
): Map<number, number[]> { // groupId -> teamIds
  const groups = new Map<number, number[]>();
  for (let g = 0; g < groupCount; g++) groups.set(g, []);

  let forward = true;
  let groupIdx = 0;

  for (const teamId of sortedTeamIds) {
    groups.get(groupIdx)!.push(teamId);

    if (forward) {
      if (groupIdx === groupCount - 1) { forward = false; } // reached end, reverse
      else { groupIdx++; }
    } else {
      if (groupIdx === 0) { forward = true; } // reached start, go forward
      else { groupIdx--; }
    }
  }
  return groups;
}
// 8 teams, 2 groups: Group A = [1,4,5,8], Group B = [2,3,6,7]
```

### Pattern 6: Double Elimination Losers Bracket Feed-In
**What:** Losers from winners bracket rounds feed into specific positions in the losers bracket. The losers bracket has alternating "minor" (internal) and "major" (feed-in from winners) rounds.
**When to use:** Double elimination generation.
**Structure for 8 participants (7 winners matches, 6 losers matches, 1 grand finals = 14 total):**
```
Winners Bracket:
  R1: M1(1v8) M2(4v5) M3(2v7) M4(3v6)  -- 4 matches
  R2: M5(W1vW2) M6(W3vW4)                -- 2 matches (semis)
  R3: M7(W5vW6)                           -- 1 match (WB final)

Losers Bracket:
  LR1 (minor): LM1(L1vL2) LM2(L3vL4)    -- losers from WR1
  LR2 (major): LM3(WLM1vL6) LM4(WLM2vL5) -- LB winners vs WR2 losers (CROSSED)
  LR3 (minor): LM5(WLM3vWLM4)            -- internal LB semi
  LR4 (major): LM6(WLM5vL7)              -- LB final vs WR3 loser

Grand Finals: GF(W-M7 vs W-LM6)          -- 1 match, bracketSide=GrandFinals

3rd Place (optional): TP(L-M7 semifinal losers)
```
**Critical detail:** When feeding winners bracket losers into the losers bracket, the order is CROSSED (reversed) to minimize rematches. WR2 loser from M5 plays against the LR1 winner from the opposite side (LM2), not the same side (LM1).

### Anti-Patterns to Avoid
- **Storing bracket structure as JSON blob:** The entire design uses individual rows with FK links. Never serialize bracket topology into a single field.
- **Modifying `submit_match_result`:** It stays generic. All tournament-specific logic goes in the wrapper `submit_and_advance_bracket`.
- **Using `iter()` to find BracketMatch rows:** Always use `ctx.db.BracketMatch.tournament_id.filter(tournamentId)` -- the index exists.
- **Assuming sequential autoInc IDs:** BracketMatch IDs have gaps. Never compute "next match ID" arithmetically. Always use the FK fields.
- **Padding to power of 2 by adding fake teams:** The decision says odd brackets are allowed. Top seeds get BYEs (null participant slots), not phantom participants.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Round-robin scheduling | Custom nested loop pairings | Circle method algorithm (fixed participant + rotate) | Circle method guarantees every pair plays exactly once with minimal rounds. Custom approaches often miss pairings or create uneven round sizes. |
| Seeding placement | Sequential fill (1,2,3,4...) | Fold/mirror seeding (1v16, 8v9, 2v15, 7v10...) | Sequential seeding means top seeds meet immediately. Fold seeding is the universal professional standard ensuring best players meet in later rounds. |
| Double elim losers bracket | Ad-hoc wiring | Alternating minor/major round pattern with crossed feed-in | The feed-in pattern is mathematically determined. Ad-hoc approaches cause rematches and unbalanced brackets. |
| Group distribution | Random assignment | Snake seeding | Random creates wildly unbalanced groups. Snake seeding is the FIFA/ITTF standard for balanced group strength. |

**Key insight:** Bracket generation algorithms are well-studied and standardized in competitive gaming. The correct algorithms are not complex but must be implemented precisely. The fold seeding, circle scheduling, and losers bracket feed-in patterns are universal standards used by every major tournament platform.

## Common Pitfalls

### Pitfall 1: FK Wiring Before ID Assignment
**What goes wrong:** Trying to set `nextWinnerMatchId` during insert, but the target match hasn't been inserted yet (no ID).
**Why it happens:** AutoInc IDs are assigned at insert time. You can't know match B's ID when inserting match A if B is inserted later.
**How to avoid:** Use the two-pass approach: insert all matches with null FKs, then update FKs in a second pass using a position-to-ID map.
**Warning signs:** `nextWinnerMatchId` pointing to 0 or undefined when it should point to a real match.

### Pitfall 2: Losers Bracket Feed-In Order Causing Rematches
**What goes wrong:** A player who lost in winners round 2 immediately faces the same opponent again in losers bracket.
**Why it happens:** Feeding winners bracket losers into the losers bracket in the same order they appear in the winners bracket.
**How to avoid:** Cross/reverse the feed-in order. Losers from the top half of the winners bracket feed into the bottom half of the losers bracket, and vice versa.
**Warning signs:** Players report "I just played this person and now I play them again."

### Pitfall 3: Off-by-One in Round/Match Numbering
**What goes wrong:** The losers bracket has more rounds than the winners bracket. Using the same numbering scheme for both leads to collisions or incorrect advancement.
**Why it happens:** Losers bracket has roughly 2x the rounds of winners bracket (alternating minor/major).
**How to avoid:** Number rounds within each `bracketSide` independently. A `roundNumber` of 2 in the Winners bracket is different from `roundNumber` 2 in the Losers bracket. The `bracketSide` + `roundNumber` + `matchNumber` triple uniquely identifies a match position.
**Warning signs:** Matches appear in the wrong position when rendering brackets.

### Pitfall 4: Concurrent Group Completion in Hybrid Formats
**What goes wrong:** In GroupIntoSingleElim/GroupIntoDoubleElim, groups complete at different times. When group A finishes, the elimination bracket slots for group A's winners might conflict with group B's expected slots if group B isn't done yet.
**Why it happens:** The elimination bracket is pre-generated with empty participant slots. Group winners need to be placed into the correct slots.
**How to avoid:** Pre-generate the entire elimination bracket structure during `generate_bracket` with all participant slots empty. When a group completes (all group matches have winnerId set), run a helper that fills the appropriate elimination bracket slots based on group standings and the seeding rules (group winners get top seeds). Each group completion fills its own designated slots independently.
**Warning signs:** Elimination bracket has incorrect seeding or missing participants.

### Pitfall 5: Forgetting to Handle the Solo-Player Auto-Team Creation
**What goes wrong:** `generate_bracket` expects all participants to have a `TournamentTeam`, but solo tournament players don't have one yet.
**Why it happens:** In Phase 3, solo tournaments block `create_tournament_team`. Phase 4 must auto-create teams for solo players.
**How to avoid:** During the Registration->Seeding transition (or during `generate_bracket` itself), auto-create `TournamentTeam` rows for any `TournamentParticipant` without a `teamGroupId`. Set team name = player's displayName, captainUserId = player's userId.
**Warning signs:** `generate_bracket` throws errors about missing team IDs for participants.

### Pitfall 6: Winner ID Type Mismatch in Advancement
**What goes wrong:** `MatchResultRecord.winnerId` is a userId (u32), but `BracketMatch.participant1Id`/`participant2Id` are teamIds (TournamentTeam.id). Direct comparison fails.
**Why it happens:** The match result system is generic (works for casual and tournament matches) and uses userIds. The bracket system uses teamIds.
**How to avoid:** The advancement reducer must perform the mapping: `winnerId (userId) -> TournamentParticipant (tournamentId + userId) -> teamGroupId -> place that teamId in next BracketMatch slot`.
**Warning signs:** Advancement sets wrong team in next match, or throws "participant not found."

### Pitfall 7: Destructive Schema Change Requires --clear-database
**What goes wrong:** Publishing fails because `isLosersBracket` column is replaced with `bracketSide` enum.
**Why it happens:** Renaming or replacing a column is a destructive schema change in SpacetimeDB.
**How to avoid:** This is expected and documented. Publish with `spacetime publish <name> --clear-database -y --module-path spacetimedb`. This wipes all existing data. Acceptable because this is a development milestone, not production.
**Warning signs:** Publish error about incompatible schema.

## Code Examples

### BracketSide Enum Definition
```typescript
// types/enums.ts -- ADD
export const BracketSide = t.enum('BracketSide', {
    Winners: t.unit(),
    Losers: t.unit(),
    GrandFinals: t.unit(),
    ThirdPlace: t.unit(),
    Group: t.unit(),
});
```

### Updated BracketMatch Table
```typescript
// tables/bracketMatch.ts -- MODIFIED
import { BracketSide } from '../types/enums'; // new import

export const bracketMatchColumns = {
    id: t.u32().primaryKey().autoInc(),
    tournamentId: t.u32(),
    roundNumber: t.u32(),
    matchNumber: t.u32(),
    bracketSide: BracketSide,         // REPLACES isLosersBracket: t.bool()
    groupId: t.u32().optional(),
    participant1Id: t.u32().optional(),
    participant2Id: t.u32().optional(),
    nextWinnerMatchId: t.u32().optional(),
    nextLoserMatchId: t.u32().optional(),
    bestOf: t.u8(),
    gameMode: GameMode,
    winnerAdvantage: t.u8(),
    scheduledAt: t.timestamp().optional(),
    lobbyId: t.u32().optional(),
    checkInRequired: t.bool(),
    winnerId: t.u32().optional(),
    resultStatus: MatchResultStatus,
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const BracketMatch = table({
    name: 'bracket_match',
    public: true,
    indexes: [
        { accessor: 'tournament_id', algorithm: 'btree', columns: ['tournamentId'] },
        { accessor: 'lobby_id', algorithm: 'btree', columns: ['lobbyId'] },
    ],
}, bracketMatchColumns);
```
**Note on bracketSide index:** An index on `bracketSide` alone has low selectivity (only 5 values). Queries always filter by `tournamentId` first using the existing index, then filter bracketSide in memory. Adding a composite index `[tournamentId, bracketSide]` would help if frequent queries filter both, but given the small row counts per tournament (max ~127 for 64-player double elim), the existing `tournament_id` index is sufficient. No new index recommended.

### Updated Tournament Table (new columns)
```typescript
// tournament.ts -- ADD these columns before audit columns:
    groupSize: t.u8(),                    // NEW: min 3, target group size for round-robin
    has3rdPlaceMatch: t.bool(),           // NEW: controls 3rd place match generation
    autoAdvanceBracket: t.bool(),         // NEW: controls auto vs manual advancement
```

### Updated TournamentTeam Table (add seedNumber)
```typescript
// tournamentTeam.ts -- ADD before audit columns:
    seedNumber: t.u32().optional(),       // NEW: moved from TournamentParticipant
```

### Updated TournamentParticipant Table (add/remove columns)
```typescript
// tournamentParticipant.ts -- MODIFY:
    // REMOVE: seedNumber: t.u32().optional(),
    allowRandomTeamAssignment: t.bool(),  // NEW: opt-in for random team formation
```

### Updated GroupStanding Table (rename column)
```typescript
// groupStanding.ts -- MODIFY:
    participantTeamId: t.u32(),           // RENAMED from participantUserId
    // PK becomes: ['tournamentId', 'groupId', 'participantTeamId']
```

### Advancement Reducer Pattern
```typescript
// reducers/bracketAdvancement.ts
export const advance_bracket_match = spacetimedb.reducer(
    { bracketMatchId: t.u32() },
    (ctx, { bracketMatchId }) => {
        const { user, tournament } = /* permission check */;
        const bracketMatch = ctx.db.BracketMatch.id.find(bracketMatchId);
        if (!bracketMatch) throw new SenderError('Bracket match not found.');
        if (!bracketMatch.winnerId) throw new SenderError('No winner set on this bracket match.');

        // Map winnerId (teamId) to next match slot
        if (bracketMatch.nextWinnerMatchId) {
            const nextMatch = ctx.db.BracketMatch.id.find(bracketMatch.nextWinnerMatchId);
            if (!nextMatch) throw new SenderError('Next winner match not found.');
            // Place winner in the appropriate slot (1 or 2)
            const updated = placeParticipantInNextMatch(nextMatch, bracketMatch.winnerId);
            ctx.db.BracketMatch.id.update({ ...updated, ...auditUpdate(ctx, nextMatch, user.id) } as any);
        }

        // For double elim: route loser to losers bracket
        if (bracketMatch.nextLoserMatchId && bracketMatch.bracketSide.tag !== 'Losers') {
            const loserId = bracketMatch.participant1Id === bracketMatch.winnerId
                ? bracketMatch.participant2Id
                : bracketMatch.participant1Id;
            if (loserId) {
                const loserMatch = ctx.db.BracketMatch.id.find(bracketMatch.nextLoserMatchId);
                if (loserMatch) {
                    const updated = placeParticipantInNextMatch(loserMatch, loserId);
                    ctx.db.BracketMatch.id.update({ ...updated, ...auditUpdate(ctx, loserMatch, user.id) } as any);
                }
            }
        }
    }
);

function placeParticipantInNextMatch(match: any, teamId: number): any {
    if (!match.participant1Id) return { ...match, participant1Id: teamId };
    if (!match.participant2Id) return { ...match, participant2Id: teamId };
    throw new SenderError('Next match already has both participants.');
}
```

### Submit-and-Advance Wrapper Pattern
```typescript
// The wrapper that frontend calls for tournament matches
export const submit_and_advance_bracket = spacetimedb.reducer(
    { matchResultId: t.u32() },
    (ctx, { matchResultId }) => {
        const user = getAuthenticatedUser(ctx);
        const matchResult = ctx.db.MatchResultRecord.id.find(matchResultId);
        if (!matchResult) throw new SenderError('Match result not found.');
        if (!matchResult.bracketMatchId) throw new SenderError('Not a bracket match.');
        if (!matchResult.winnerId) throw new SenderError('No winner on match result.');

        const tournament = ctx.db.Tournament.id.find(matchResult.tournamentId!);
        if (!tournament) throw new SenderError('Tournament not found.');

        // Map winnerId (userId) -> teamId
        const winnerParticipant = (ctx.db.TournamentParticipant as any).primaryKey.find({
            tournamentId: tournament.id,
            userId: matchResult.winnerId,
        });
        if (!winnerParticipant || !winnerParticipant.teamGroupId) {
            throw new SenderError('Winner participant/team not found.');
        }

        // Set winnerId on the BracketMatch (as teamId)
        const bracketMatch = ctx.db.BracketMatch.id.find(matchResult.bracketMatchId);
        if (!bracketMatch) throw new SenderError('Bracket match not found.');

        ctx.db.BracketMatch.id.update({
            ...bracketMatch,
            winnerId: winnerParticipant.teamGroupId,
            resultStatus: { tag: 'Validated', value: {} } as any,
            ...auditUpdate(ctx, bracketMatch, user.id),
        } as any);

        // Then advance (inline the advancement logic)
        // ... place winner in nextWinnerMatch, loser in nextLoserMatch
    }
);
```

### Stage Transition Guard Pattern
```typescript
// helpers/tournamentHelpers.ts -- ADD guard logic
export function validateRegistrationToSeeding(ctx: any, tournamentId: number): void {
    const participants = [...ctx.db.TournamentParticipant.tournament_id.filter(tournamentId)]
        .filter((p: any) =>
            p.status.tag !== 'Withdrawn' &&
            p.status.tag !== 'Disqualified' &&
            !p.isWaitlisted
        );
    if (participants.length < 2) {
        throw new SenderError('At least 2 active participants are required to advance to Seeding.');
    }

    const tournament = ctx.db.Tournament.id.find(tournamentId)!;
    if (tournament.teamSize > 1) {
        // For team tournaments: count complete teams
        const teamCounts = new Map<number, number>();
        for (const p of participants) {
            if (p.teamGroupId) {
                teamCounts.set(p.teamGroupId, (teamCounts.get(p.teamGroupId) || 0) + 1);
            }
        }
        const completeTeams = [...teamCounts.values()].filter(count => count >= tournament.teamSize).length;
        if (completeTeams < 2) {
            throw new SenderError('At least 2 complete teams are required to advance to Seeding.');
        }
    }
}

export function validateSeedingToInProgress(ctx: any, tournamentId: number): void {
    const bracketMatches = [...ctx.db.BracketMatch.tournament_id.filter(tournamentId)];
    if (bracketMatches.length === 0) {
        throw new SenderError('Bracket must be generated before advancing to InProgress.');
    }

    // Check first-round matches have participants
    const firstRoundMatches = bracketMatches.filter((m: any) =>
        m.roundNumber === 1 && m.bracketSide.tag !== 'Losers'
    );
    for (const match of firstRoundMatches) {
        // BYE matches are fine (one participant null)
        if (!match.participant1Id && !match.participant2Id) {
            throw new SenderError(`Match #${match.id} in round 1 has no participants assigned.`);
        }
    }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `isLosersBracket: bool` | `bracketSide: BracketSide` enum (5 variants) | Phase 4 (now) | Enables GrandFinals, ThirdPlace, Group as first-class match types |
| `participantUserId` on GroupStanding | `participantTeamId` on GroupStanding | Phase 4 (now) | Consistent with BracketMatch using teamIds everywhere |
| `seedNumber` on TournamentParticipant | `seedNumber` on TournamentTeam | Phase 4 (now) | Seeding is per-team (even solo players are teams) |
| No bracket generation reducers | `generate_bracket`, `advance_bracket_match`, `submit_and_advance_bracket`, `rollback_bracket_match`, `swap_seeds`, `seed_bracket` | Phase 4 (now) | Full bracket lifecycle management |

**Deprecated/outdated:**
- `isLosersBracket: bool` on BracketMatch -- replaced by `BracketSide` enum
- `seedNumber` on TournamentParticipant -- moved to TournamentTeam
- `participantUserId` on GroupStanding -- renamed to `participantTeamId`

## Open Questions

1. **Hybrid format transition timing**
   - What we know: Group phase matches must complete before elimination bracket slots are filled. Each group completes independently.
   - What's unclear: Should we require ALL groups to complete before populating the elimination bracket, or fill slots as each group finishes? The former is simpler; the latter allows the tournament to start elimination matches sooner.
   - Recommendation: Require all groups to complete before advancing to elimination. The TO calls a reducer (or `advance_tournament_stage` does it automatically when all group matches have winners) that calculates standings and fills elimination bracket slots. This is simpler and avoids partial bracket issues. The group phase and elimination phase are effectively sub-stages of InProgress.

2. **MatchResultRecord.bracketMatchId index**
   - What we know: The rollback reducer needs to look up `MatchResultRecord` by `bracketMatchId` to check `mmrProcessedAt`.
   - What's unclear: There is no index on `MatchResultRecord.bracketMatchId` currently. For rollback, we need to find the MatchResultRecord associated with a given bracketMatchId.
   - Recommendation: Add a btree index on `bracketMatchId` to MatchResultRecord. However, this is a schema change that may or may not be destructive (adding an index to an existing table). Alternatively, use `tournament_id` index + filter by bracketMatchId in memory, which works given the small row counts per tournament. Prefer the memory filter approach to avoid unnecessary schema changes.

3. **Auto-team random formation algorithm details**
   - What we know: Solo players in team tournaments can opt-in to random team assignment. System groups them preferring same HSR account region.
   - What's unclear: Exact algorithm for region-based grouping when team sizes don't divide evenly, and what happens when no region match exists.
   - Recommendation: Sort opt-in players by region (derived from their active HSR account's UID prefix), then fill teams in order. If a team can't be completed with same-region players, fill with closest available. Leftover players who can't form a complete team stay unassigned (TO handles manually). This is a best-effort algorithm.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (existing) |
| Config file | `test/vitest.config.ts` (unit), `test/vitest.integration.config.ts` (integration) |
| Quick run command | `npx vitest run --config test/vitest.config.ts` |
| Full suite command | `npx vitest run --config test/vitest.config.ts && npx vitest run --config test/vitest.integration.config.ts` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BRKT-01 | Single elim bracket generation with proper seeding | unit | `npx vitest run --config test/vitest.config.ts test/unit/bracket-generation.test.ts` | No -- Wave 0 |
| BRKT-02 | Double elim bracket with winners/losers brackets | unit | `npx vitest run --config test/vitest.config.ts test/unit/bracket-generation.test.ts` | No -- Wave 0 |
| BRKT-03 | Group phase round-robin with standings | unit | `npx vitest run --config test/vitest.config.ts test/unit/bracket-generation.test.ts` | No -- Wave 0 |
| BRKT-04 | Auto-advance winner to next match slot | integration | `npx vitest run --config test/vitest.integration.config.ts test/integration/phase-04/bracket-advancement.test.ts` | No -- Wave 0 |
| BRKT-05 | Seeding (manual + MMR-based) | unit | `npx vitest run --config test/vitest.config.ts test/unit/bracket-seeding.test.ts` | No -- Wave 0 |
| BRKT-06 | Explicit FK references, no JSON blobs | unit | `npx vitest run --config test/vitest.config.ts test/unit/bracket-generation.test.ts` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --config test/vitest.config.ts`
- **Per wave merge:** `npx vitest run --config test/vitest.config.ts && npx vitest run --config test/vitest.integration.config.ts`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/unit/bracket-generation.test.ts` -- covers BRKT-01, BRKT-02, BRKT-03, BRKT-06 (pure helper function tests)
- [ ] `test/unit/bracket-seeding.test.ts` -- covers BRKT-05 (fold seeding, snake seeding, MMR sort)
- [ ] `test/integration/phase-04/bracket-advancement.test.ts` -- covers BRKT-04 (requires live SpacetimeDB)
- [ ] `test/mocks/spacetimedb-server.ts` -- may need updates for BracketSide enum mock

## Sources

### Primary (HIGH confidence)
- Project source code: `spacetimedb/src/tables/bracketMatch.ts`, `groupStanding.ts`, `tournament.ts`, `tournamentParticipant.ts`, `tournamentTeam.ts`, `matchResult.ts` -- current schema
- Project source code: `spacetimedb/src/reducers/tournamentManagement.ts`, `tournamentRegistration.ts`, `tournamentAdmin.ts`, `matchResultSubmission.ts` -- existing reducer patterns
- Project source code: `spacetimedb/src/helpers/tournamentHelpers.ts`, `ensurePermissions.ts`, `auditColumns.ts` -- helper patterns
- Project skill: `.claude/skills/spacetimedb/SKILL.md` -- SpacetimeDB API patterns, naming conventions
- Phase CONTEXT.md: `.planning/phases/04-bracket-generation-and-advancement/04-CONTEXT.md` -- all locked decisions

### Secondary (MEDIUM confidence)
- [Turnio Elimination Bracket Guide](https://turnio.net/elimination-bracket-tournament-guide/) -- seeding and bye distribution standards
- [BracketsNinja Double Elimination Guide](https://www.bracketsninja.com/types/double-elimination-bracket) -- double elim structure and match counts
- [Wikipedia: Round-robin tournament](https://en.wikipedia.org/wiki/Round-robin_tournament) -- circle method algorithm
- [Wikipedia: Serpentine system](https://en.wikipedia.org/wiki/Serpentine_system) -- snake seeding standard
- [Rosetta Code: Round-robin tournament schedule](https://rosettacode.org/wiki/Round-robin_tournament_schedule) -- algorithm reference
- [brackets-manager.js](https://github.com/Drarig29/brackets-manager.js/) -- reference implementation (not used as dependency)

### Tertiary (LOW confidence)
- None -- all findings verified against multiple sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new dependencies, pure SpacetimeDB TypeScript following established project patterns
- Architecture: HIGH -- all patterns derived from existing project conventions (helpers/reducers split, audit columns, composite PK delete+insert, index accessors)
- Algorithms: HIGH -- fold seeding, circle scheduling, snake distribution, and double elim feed-in are well-documented universal standards with multiple cross-referenced sources
- Pitfalls: HIGH -- derived from actual code analysis (type mismatches, FK wiring order, schema change requirements)

**Research date:** 2026-03-18
**Valid until:** 2026-04-18 (stable algorithms, project patterns unlikely to change)
