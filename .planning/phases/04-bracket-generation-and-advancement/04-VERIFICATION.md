---
phase: 04-bracket-generation-and-advancement
verified: 2026-03-18T15:00:00Z
status: passed
score: 22/22 must-haves verified
re_verification: false
---

# Phase 4: Bracket Generation and Advancement Verification Report

**Phase Goal:** Brackets are pre-generated as individual rows with explicit FK links, seeded correctly, and auto-advance when a match result is confirmed
**Verified:** 2026-03-18T15:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | BracketSide enum exists with 5 variants: Winners, Losers, GrandFinals, ThirdPlace, Group | VERIFIED | `spacetimedb/src/types/enums.ts` lines 182–188 |
| 2 | BracketMatch table uses bracketSide enum instead of isLosersBracket bool | VERIFIED | `bracketMatch.ts` line 9: `bracketSide: BracketSide`; zero `isLosersBracket` occurrences in codebase |
| 3 | Tournament table has groupSize, has3rdPlaceMatch, and autoAdvanceBracket columns | VERIFIED | `tournament.ts` lines 39–41 |
| 4 | TournamentTeam has seedNumber column; TournamentParticipant no longer has seedNumber | VERIFIED | `tournamentTeam.ts` line 8; `tournamentParticipant.ts` has no `seedNumber` |
| 5 | GroupStanding uses participantTeamId instead of participantUserId | VERIFIED | `groupStanding.ts` line 6; zero `participantUserId` occurrences in codebase |
| 6 | MatchResultParticipant junction table exists with PK [matchResultId, userId] and teamSide column | VERIFIED | `matchResultParticipant.ts` lines 16–17; registered in `schema.ts` lines 47 and 138 |
| 7 | Solo tournament registration auto-creates a TournamentTeam row | VERIFIED | `tournamentRegistration.ts`: `tournament.teamSize === 1 && teamGroupId === 0` triggers `TournamentTeam.insert` |
| 8 | Stage transition Registration->Seeding requires 2+ active participants | VERIFIED | `tournamentHelpers.ts` lines 62–96: `validateRegistrationToSeeding` throws on < 2 active participants; called in `tournamentManagement.ts` line 309 |
| 9 | Stage transition Seeding->InProgress requires bracket rows to exist | VERIFIED | `tournamentHelpers.ts` lines 103–130: `validateSeedingToInProgress` throws when 0 BracketMatch rows; called in `tournamentManagement.ts` line 312 |
| 10 | Updating displayName syncs to TournamentTeam.name for solo non-anonymous tournaments | VERIFIED | `profile.ts` lines 70–78: `TournamentTeam.captain_user_id.filter` + `teamSize === 1` check |
| 11 | generate_bracket creates correct single elimination bracket with fold seeding and BYE handling | VERIFIED | `helpers/bracketGeneration.ts` `generateSingleElimBracket`: fold seeding applied, BYE matches get `winnerId` pre-set and are auto-advanced in pass 3 of `insertBracketMatches` |
| 12 | generate_bracket creates correct double elimination bracket with winners, losers, GrandFinals, and optional ThirdPlace matches | VERIFIED | `generateDoubleElimBracket` generates Winners, Losers (alternating minor/major), GrandFinals, optional ThirdPlace descriptors |
| 13 | generate_bracket creates correct group phase round-robin with GroupStanding rows | VERIFIED | `generateGroupPhaseBracket` uses circle scheduling; `insertGroupStandings` creates standing rows for each team per group |
| 14 | generate_bracket handles hybrid formats (GroupIntoSingleElim, GroupIntoDoubleElim) | VERIFIED | `reducers/bracketGeneration.ts` lines 221–251: explicit branches for both hybrid formats via `generateHybridBracket` |
| 15 | seed_bracket assigns seedNumbers to TournamentTeams by MMR or randomly | VERIFIED | `seed_bracket` reducer: `mmr` mode sorts by `MmrRating` for tournament's `defaultGameMode`; `random` mode uses deterministic hash `(tournamentId * 31 + teamId) % 2147483647` |
| 16 | swap_seeds exchanges seedNumber values between two teams during Seeding stage | VERIFIED | `swap_seeds` reducer: validates both teams exist and belong to tournament, swaps `seedNumber` values |
| 17 | Bracket matches use explicit FK links (nextWinnerMatchId, nextLoserMatchId) not JSON blobs | VERIFIED | Two-pass FK wiring: pass 1 inserts with null FKs + builds `positionKey->id` map; pass 2 updates FK columns |
| 18 | BYE matches have winnerId pre-set and participant auto-advanced immediately | VERIFIED | Pass 3 of `insertBracketMatches`: iterates BYE descriptors and places winner in next match's available slot |
| 19 | Regenerating bracket during Seeding deletes all existing BracketMatch rows first | VERIFIED | `generate_bracket` lines 148–159: deletes all BracketMatch rows + GroupStanding rows before generating |
| 20 | advance_bracket_match places winner in next match slot via nextWinnerMatchId and routes loser via nextLoserMatchId | VERIFIED | `bracketAdvancement.ts` lines 243–260: `placeParticipantInNextMatch` called for winner and loser slots |
| 21 | submit_and_advance_bracket maps winnerId (userId) to teamId and auto-advances in one transaction | VERIFIED | `submit_and_advance_bracket`: maps via `TournamentParticipant.primaryKey.find`; `tournament.autoAdvanceBracket` check for inline advancement |
| 22 | rollback_bracket_match clears winnerId and reverses advancement, but blocks if mmrProcessedAt is set | VERIFIED | `rollback_bracket_match` lines 391–397: scans `MatchResultRecord.tournament_id` and throws `'Cannot rollback: MMR has already been processed'` if `mmrProcessedAt` is set |

**Score:** 22/22 truths verified

---

## Required Artifacts

| Artifact | Status | Details |
|----------|--------|---------|
| `spacetimedb/src/types/enums.ts` | VERIFIED | BracketSide enum with 5 variants present at lines 182–188 |
| `spacetimedb/src/tables/bracketMatch.ts` | VERIFIED | `bracketSide: BracketSide` column; imports BracketSide from enums; `nextWinnerMatchId` and `nextLoserMatchId` FK columns present |
| `spacetimedb/src/tables/tournament.ts` | VERIFIED | `groupSize`, `has3rdPlaceMatch`, `autoAdvanceBracket` columns present at lines 39–41 |
| `spacetimedb/src/tables/tournamentTeam.ts` | VERIFIED | `seedNumber: t.u32().optional()` column at line 8 |
| `spacetimedb/src/tables/groupStanding.ts` | VERIFIED | `participantTeamId: t.u32()` at line 6; PK includes `participantTeamId` |
| `spacetimedb/src/tables/matchResultParticipant.ts` | VERIFIED | Junction table with PK `[matchResultId, userId]`; `teamSide: TeamLabel` column |
| `spacetimedb/src/helpers/tournamentHelpers.ts` | VERIFIED | `validateRegistrationToSeeding` and `validateSeedingToInProgress` exported functions with correct error messages |
| `spacetimedb/src/helpers/bracketGeneration.ts` | VERIFIED | 564 lines; exports `BracketMatchDescriptor` interface and 7 functions (`foldSeeding`, `generateSingleElimBracket`, `generateDoubleElimBracket`, `circleSchedule`, `snakeSeedIntoGroups`, `generateGroupPhaseBracket`, `generateHybridBracket`); zero `ctx.db` references |
| `spacetimedb/src/reducers/bracketGeneration.ts` | VERIFIED | `generate_bracket`, `seed_bracket`, `swap_seeds` reducers; two-pass FK wiring; all 5 format branches; GroupStanding creation |
| `spacetimedb/src/reducers/bracketAdvancement.ts` | VERIFIED | `advance_bracket_match`, `submit_and_advance_bracket`, `rollback_bracket_match` reducers; all 4 internal helpers present |
| `spacetimedb/src/reducers/tournamentManagement.ts` | VERIFIED | Stage guards wired at lines 309 and 312; `groupSize`, `has3rdPlaceMatch`, `autoAdvanceBracket` in create/update args |
| `spacetimedb/src/reducers/tournamentRegistration.ts` | VERIFIED | Auto-team creation for solo tournaments (`teamSize === 1`); `allowRandomTeamAssignment: false` default; no `seedNumber` column reference |
| `spacetimedb/src/reducers/profile.ts` | VERIFIED | Display name sync via `TournamentTeam.captain_user_id.filter` with `teamSize === 1` guard |
| `spacetimedb/src/reducers/tournamentAdmin.ts` | VERIFIED | `dq_participant` has `tournament.autoAdvanceBracket` check; scans `BracketMatch.tournament_id.filter`; logs `Auto-advanced team` |
| `docs/brackets/architecture.md` | VERIFIED | Contains `BracketSide`, all 5 variants, all 6 reducers, `Win=2 Draw=1 Loss=0`, `TournamentTeam.id` participant ID note |
| `docs/tournament/architecture.md` | VERIFIED | `Bracket Generation (Phase 4)` section; `groupSize`, `has3rdPlaceMatch`, `autoAdvanceBracket` documented; `generate_bracket` in reducer table |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `bracketMatch.ts` | `types/enums.ts` | BracketSide import | WIRED | Line 2: `import { GameMode, MatchResultStatus, BracketSide } from '../types/enums'` |
| `reducers/tournamentManagement.ts` | `helpers/tournamentHelpers.ts` | stage transition guards | WIRED | Line 4 import; lines 309–312 call sites |
| `reducers/bracketGeneration.ts` | `helpers/bracketGeneration.ts` | import helper functions | WIRED | Lines 5–11: all 5 helper functions imported and called in reducer body |
| `reducers/bracketGeneration.ts` | `tables/bracketMatch.ts` | BracketMatch.insert and id.update | WIRED | `ctx.db.BracketMatch.insert` (pass 1); `ctx.db.BracketMatch.id.update` (pass 2 FK wiring) |
| `reducers/bracketGeneration.ts` | `tables/groupStanding.ts` | GroupStanding.insert | WIRED | `ctx.db.GroupStanding.insert` in `insertGroupStandings` helper |
| `reducers/bracketAdvancement.ts` | `tables/bracketMatch.ts` | BracketMatch.id.find and id.update | WIRED | `ctx.db.BracketMatch.id.find` and `ctx.db.BracketMatch.id.update` throughout advancement logic |
| `reducers/bracketAdvancement.ts` | `tables/matchResult.ts` | MatchResultRecord lookup for userId->teamId mapping | WIRED | `ctx.db.MatchResultRecord.id.find` + `ctx.db.MatchResultRecord.tournament_id.filter` |
| `reducers/tournamentAdmin.ts` | `tables/bracketMatch.ts` | DQ auto-advance scans bracket matches | WIRED | `ctx.db.BracketMatch.tournament_id.filter(tournamentId)` in dq_participant |
| `schema.ts` | `tables/matchResultParticipant.ts` | MatchResultParticipant registration | WIRED | Line 47 import; line 138 registration in schema array |
| `index.ts` | `reducers/bracketGeneration.ts` | exports | WIRED | Line 21: `export { generate_bracket, seed_bracket, swap_seeds }` |
| `index.ts` | `reducers/bracketAdvancement.ts` | exports | WIRED | Line 22: `export { advance_bracket_match, submit_and_advance_bracket, rollback_bracket_match }` |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| BRKT-01 | 04-02 | Single elimination bracket generated from participants with proper seeding | SATISFIED | `generateSingleElimBracket` with fold seeding; `generate_bracket` SingleElimination branch |
| BRKT-02 | 04-02 | Double elimination bracket with winners and losers brackets | SATISFIED | `generateDoubleElimBracket` with Winners, Losers (alternating minor/major), GrandFinals, optional ThirdPlace |
| BRKT-03 | 04-02 | Group phase generates round-robin groups with standings tracking | SATISFIED | `generateGroupPhaseBracket` with circle scheduling; `GroupStanding` rows inserted with Win=2/Draw=1/Loss=0 |
| BRKT-04 | 04-03 | Bracket auto-advances winner to next match slot on confirmed result | SATISFIED | `submit_and_advance_bracket` with `tournament.autoAdvanceBracket` inline advancement; `advance_bracket_match` for manual advancement |
| BRKT-05 | 04-01, 04-02 | Seeding supports manual assignment and MMR-based auto-seeding | SATISFIED | `seed_bracket` with `mmr` (captain MmrRating lookup) and `random` (deterministic hash) modes; `swap_seeds` for manual adjustment |
| BRKT-06 | 04-01, 04-02, 04-03 | Each BracketMatch row has explicit FK references (nextWinnerMatchId, nextLoserMatchId) — no JSON blob storage | SATISFIED | Two-pass FK wiring in `insertBracketMatches`; `nextWinnerMatchId` and `nextLoserMatchId` are FK columns on BracketMatch |

All 6 BRKT requirements satisfied. No orphaned requirements found for Phase 4.

---

## Anti-Patterns Found

None detected. Scanned all new and modified files for:
- TODO/FIXME/HACK/PLACEHOLDER stub markers (none found — "placeholder" in bracketGeneration.ts comments refers to algorithm design, not unimplemented code)
- Empty implementations or return stubs (none found)
- `ctx.db` references in pure helper file (zero — confirmed pure)
- TypeScript compilation errors (none — `tsc --noEmit` exits clean)

---

## Human Verification Required

### 1. Fold Seeding Correctness at Scale

**Test:** Call `seed_bracket` then `generate_bracket` with 8, 16, and non-power-of-2 counts (e.g., 5, 6, 12 teams). Verify bracket structure matches expected fold seeding: seed 1 vs seed N, seed N/2 vs seed N/2+1.
**Expected:** Top seeds meet only in later rounds. BYE winners are correctly pre-advanced.
**Why human:** Algorithm correctness at runtime requires real SpacetimeDB execution to verify match rows and FK links are correct.

### 2. Double Elimination Loser Feed-in Order

**Test:** Run `generate_bracket` for double elimination with 8 teams. Verify that winners bracket round 1 losers feed into the correct losers bracket positions (crossed order to minimize rematches).
**Expected:** WB round 1 loser from match 1 feeds into LB round 1 in the crossed/mirrored position.
**Why human:** Crossed losers position logic uses `crossedLosersPosition` function; correctness requires inspecting actual inserted BracketMatch rows and their FK links.

### 3. Hybrid Group-Into-Elim Flow

**Test:** Run `generate_bracket` for `GroupIntoSingleElim`. Verify that group matches are generated with bracketSide=Group AND an empty elimination bracket is simultaneously created with undefined participant slots.
**Expected:** Both sets of BracketMatch rows exist; elimination bracket has all participant slots as null/undefined at generation time.
**Why human:** Two separate `insertBracketMatches` calls; requires runtime inspection of inserted rows to confirm they co-exist correctly.

### 4. Auto-Advance End-to-End

**Test:** With a running module, register 4 players for a single elimination tournament, advance to Seeding, call `seed_bracket` + `generate_bracket`, advance to InProgress, call `submit_and_advance_bracket` on a round 1 match with `autoAdvanceBracket=true`. Verify the winner is placed in the round 2 match.
**Expected:** The winner's `teamId` appears in `participant1Id` or `participant2Id` of the round 2 BracketMatch row.
**Why human:** Requires live SpacetimeDB execution and client-side subscription to verify the cascade.

---

## Gaps Summary

No gaps. All phase goals achieved:

- Schema foundation complete: BracketSide enum, updated tables (BracketMatch, Tournament, TournamentTeam, TournamentParticipant, GroupStanding), MatchResultParticipant junction table registered.
- Stage transition guards enforce participant minimums (Registration->Seeding) and bracket existence (Seeding->InProgress).
- Bracket generation algorithms implemented as pure helpers with two-pass FK wiring covering all 5 tournament formats.
- Seeding via MMR or deterministic hash; manual seed swapping available.
- Advancement and rollback reducers wired with userId->teamId mapping, mmrProcessedAt guard, and group standings Win=2/Draw=1/Loss=0.
- DQ auto-advance integrated into dq_participant.
- Architecture docs updated with BracketSide enum table, all 6 reducers, 5 format flows, BYE handling, seeding algorithm descriptions.
- Module published to maincloud (destructive publish with --clear-database); client bindings generated.
- TypeScript compiles clean.

---

_Verified: 2026-03-18T15:00:00Z_
_Verifier: Claude (gsd-verifier)_
