---
phase: 05-match-results-and-mmr
verified: 2026-03-21T10:30:00Z
status: passed
score: 8/8 success criteria verified
re_verification: false
---

# Phase 5: Match Results and MMR Verification Report

**Phase Goal:** Players can submit and verify match results with screenshots; validated results trigger ELO updates and bracket advancement atomically in one transaction
**Verified:** 2026-03-21T10:30:00Z
**Status:** PASSED
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Both players can submit a score in the correct game-mode format (cycles for MoC/AA, score for AS) with optional per-boss breakdown and Imgur screenshot URL | VERIFIED | `record_game_scores` reducer in `scoreEntry.ts` accepts all fields: `teamBlueCyclesUsed`, `teamBlueScore`, `teamBlueBoss1Score`, `teamBlueBoss2Score`, `teamBlueScreenshotUrl` (and Red equivalents). Game mode is read from Lobby. Captain side-enforcement prevents cross-side entry. |
| 2 | A casual match auto-confirms when both players submit matching scores; mismatched scores set status to Disputed | VERIFIED | `submit_match_result` in `matchResultSubmission.ts:145` sets `tag: 'Validated'` when `matchType.tag === 'Casual'`. D-04 comment at line 142 explicitly notes supersession of MTCH-05 mismatch clause for Casual -- all Casual auto-validate on submit. |
| 3 | A tournament match requires a referee or admin to call validate_match_result before the result is confirmed; disputed results can be rejected | VERIFIED | `submit_match_result` sets Ranked to `tag: 'Submitted'` (not Validated). `override_match_result` in `tournamentAdmin.ts` handles validation with screenshot gate at line 151 for Ranked. `dispute_match_result` in `matchResultSubmission.ts:167` allows participants to dispute. |
| 4 | ELO is only updated after a result reaches Validated status; mmrProcessedAt guard prevents any result from being processed twice | VERIFIED | `finalize_match_result` at line 198 requires `status.tag === 'Validated'`. Standalone Ranked stamps `mmrProcessedAt` at line 287 then deletes ephemeral record (double processing impossible). `process_tournament_mmr` at line 404 filters `mmrProcessedAt === undefined`. |
| 5 | Each player's per-game-mode MMR is stored with tiered K-factor (K=40/20/10); matchesPlayedPerMode counter tracked from first match | VERIFIED | `MmrRating` table has composite PK `[userId, gameMode]` with `matchesPlayed` column. `getKFactor` in `eloCalculation.ts:22` implements the 3 tiers using `newThreshold` (20) and `midThreshold` (100). `processMatchMmr` at line 144 increments `matchesPlayed` on each rating update. |
| 6 | A global composite MMR (equal-weight average across game modes) is stored alongside per-mode ratings | VERIFIED | `processMatchMmr` at lines 150-162 computes `avgRating` across all `MmrRating` rows for the user and writes `globalCompositeRating` to every row. `MmrRating.globalCompositeRating` is `t.u32().optional()`. |
| 7 | An MMR history row is written for every rating change with a reference to the source match | VERIFIED | `processMatchMmr` at lines 164-176 inserts `MmrHistory` row with `matchHistoryId`, `previousRating`, `newRating`, `delta`. `MmrHistory` table has `matchHistoryId: t.u32()` field. Tournament batch path uses sentinel `matchHistoryId=0` backfilled during finalization at lines 294-310. |
| 8 | A leaderboard table is queryable sorted by per-mode MMR and by global composite MMR; schema includes seasonId column | VERIFIED | `Leaderboard` table in `leaderboard.ts` with composite PK `[category, rank]`, btree indexes `by_category_and_rank` and `by_user`. `rebuildLeaderboard` in `leaderboardRebuild.ts` builds top 100 per category (3 game modes + Global) from `MmrRating` data. `seasonId: t.u32().optional()` present on both `Leaderboard` and `MmrRating`. |

**Score:** 8/8 truths verified

### Required Artifacts (Plan 01)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `spacetimedb/src/tables/eloConfig.ts` | EloConfig single-row admin table | VERIFIED | `name: 'elo_config'`, sentinel PK `id: t.u32().primaryKey()` (not autoInc), all K-factor tiers and modifier settings, audit columns |
| `spacetimedb/src/tables/leaderboard.ts` | Leaderboard materialized table | VERIFIED | `name: 'leaderboard'`, composite PK `['category', 'rank']`, btree indexes, `seasonId` optional |
| `spacetimedb/src/reducers/scoreEntry.ts` | record_game_scores reducer | VERIFIED | Full implementation with captain/referee authority, side enforcement, composite PK upsert, game mode from Lobby |
| `spacetimedb/src/reducers/eloAdmin.ts` | EloConfig admin reducers | VERIFIED | `admin_seed_elo_config` (defaults id=1) and `admin_update_elo_config` (optional field updates) |
| `spacetimedb/src/helpers/accountRating.ts` | Account rating calculation helper | VERIFIED | `computeAccountRating` (roster cost sum + normalization) and `updateAccountRating` (DB wrapper) |

### Required Artifacts (Plan 02)

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `spacetimedb/src/helpers/eloCalculation.ts` | Pure ELO math functions | VERIFIED | 5 exported functions: `getKFactor`, `calculateExpectedScore`, `calculateRatingChange`, `calculateTeamEffective`, `calculateAccountModifier` -- zero DB access |
| `spacetimedb/src/helpers/leaderboardRebuild.ts` | Leaderboard rebuild helper | VERIFIED | `rebuildLeaderboard` deletes all rows, rebuilds top 100 per category (3 modes + Global), min 2 matches |
| `spacetimedb/src/helpers/statsIncrement.ts` | Stat increment helpers | VERIFIED | `incrementPlayerStat` and `incrementPlayerRelationship` with composite PK delete+insert upsert |
| `spacetimedb/src/helpers/bracketHelpers.ts` | Extracted bracket advancement helpers | VERIFIED | `advanceBracketMatch`, `placeParticipantInNextMatch`, `updateGroupStandings` -- imported by both `bracketAdvancement.ts` and `matchFinalization.ts` |
| `spacetimedb/src/reducers/matchFinalization.ts` | Finalization and tournament MMR reducers | VERIFIED | `finalize_match_result` (history + stats + bracket + MMR + ephemeral deletion) and `process_tournament_mmr` (batch processing with mmrProcessedAt guard) |

### Modified Artifacts

| Artifact | Change | Status | Details |
|----------|--------|--------|---------|
| `spacetimedb/src/tables/hsrAccount.ts` | Added `accountRating: t.u32()` | VERIFIED | Line 13, positioned after `isDuplicateUid` and before audit columns |
| `spacetimedb/src/schema.ts` | Registered EloConfigTable and Leaderboard | VERIFIED | Imports at lines 56-57, schema registration at lines 152-153 |
| `spacetimedb/src/index.ts` | Exported 5 new reducers | VERIFIED | `record_game_scores` (line 21), `admin_seed_elo_config`, `admin_update_elo_config` (line 11), `finalize_match_result`, `process_tournament_mmr` (line 25) |
| `spacetimedb/src/reducers/matchResultSubmission.ts` | Casual auto-validation in submit_match_result | VERIFIED | Lines 141-158: `matchType.tag === 'Casual'` sets Validated, Ranked sets Submitted. D-04 supersession comment present. |
| `spacetimedb/src/reducers/tournamentAdmin.ts` | Ranked screenshot gate in override_match_result | VERIFIED | Lines 151-161: Rejects Ranked validation if any game missing `teamBlueScreenshotUrl` or `teamRedScreenshotUrl` |

### Key Link Verification (Plan 01)

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `scoreEntry.ts` | `MatchResultGame` | delete+insert upsert on composite PK | WIRED | Lines 95-96 (delete+insert for existing), lines 117-135 (insert for new) |
| `matchResultSubmission.ts` | Casual auto-validation | `matchType.tag === 'Casual'` sets Validated | WIRED | Lines 145-147: conditional status assignment |
| `tournamentAdmin.ts` | Ranked screenshot gate | `teamBlueScreenshotUrl`/`teamRedScreenshotUrl` check | WIRED | Lines 151-161: iterates games and rejects if missing |
| `schema.ts` | EloConfigTable and Leaderboard imports | schema registration | WIRED | Lines 56-57 (imports), lines 152-153 (registration) |

### Key Link Verification (Plan 02)

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `matchFinalization.ts` | `eloCalculation.ts` | ELO helper function calls | WIRED | Line 6: imports 5 functions; used in `processMatchMmr` at lines 78-79, 129-132 |
| `matchFinalization.ts` | `statsIncrement.ts` | incrementPlayerStat/incrementPlayerRelationship calls | WIRED | Line 8: imports both; used at lines 332 and 349-350 |
| `matchFinalization.ts` | `leaderboardRebuild.ts` | rebuildLeaderboard call after MMR | WIRED | Line 9: import; used at line 291 (standalone Ranked) and line 440 (tournament batch) |
| `matchFinalization.ts` | `bracketHelpers.ts` | advanceBracketMatch for tournament bracket | WIRED | Line 10: import; used at line 362 |
| `matchFinalization.ts` | `MmrRating` table | delete+insert for composite PK updates | WIRED | Lines 137-148: delete existing + insert updated rating |
| `matchFinalization.ts` | Ephemeral record deletion | delete games, participants, then record | WIRED | Lines 369-372: children first (games, participants), then parent (record) |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| MTCH-01 | 05-01 | Both players can submit their score for a match | SATISFIED | `record_game_scores` reducer with captain/referee authority paths |
| MTCH-02 | 05-01 | Score format is game-mode-specific: cycles for MoC/AA, score for AS | SATISFIED | `scoreEntry.ts` accepts `teamBlueCyclesUsed`, `teamBlueScore` (and Red) -- game mode from Lobby |
| MTCH-03 | 05-01 | Both players can upload score screenshots (stored as Imgur URLs) | SATISFIED | `teamBlueScreenshotUrl` and `teamRedScreenshotUrl` string fields in MatchResultGame, accepted by `record_game_scores` |
| MTCH-04 | 05-01 | Support for per-boss scoring (2 bosses per game mode) and combined scoring | SATISFIED | `teamBlueBoss1Score`, `teamBlueBoss2Score`, `teamRedBoss1Score`, `teamRedBoss2Score` (per-boss) + `teamBlueScore`/`teamRedScore` (combined) |
| MTCH-05 | 05-01 | Casual matches auto-confirm when both players agree on scores | SATISFIED | `submit_match_result` auto-validates Casual on submit (D-04 supersedes mismatch clause -- all Casual auto-validate) |
| MTCH-06 | 05-01 | Tournament matches require referee or admin validation before confirmation | SATISFIED | Ranked goes to Submitted status; `override_match_result` in `tournamentAdmin.ts` handles validation with referee/admin authority check |
| MTCH-07 | 05-01 | Match result has explicit verification status (Pending to Submitted to Disputed to Validated to Rejected) | SATISFIED | `MatchResultStatus` enum has all 5 variants; status transitions enforced in `submit_match_result`, `dispute_match_result`, `override_match_result` |
| MTCH-08 | 05-02 | Validated results trigger ELO update and bracket advancement in same transaction | SATISFIED | `finalize_match_result` processes MMR (line 282) and advances bracket (line 362) in same reducer (atomic transaction) |
| MTCH-09 | 05-02 | mmrProcessedAt guard prevents duplicate ELO application | SATISFIED | Standalone: stamps mmrProcessedAt then deletes ephemeral record. Tournament batch: filters `mmrProcessedAt === undefined` at line 404 and stamps at line 433 |
| MMR-01 | 05-02 | Per-game-mode ELO rating stored for each player | SATISFIED | `MmrRating` table with composite PK `[userId, gameMode]` -- 3 game modes (MoC, AS, AA) |
| MMR-02 | 05-02 | Global composite MMR calculated as equal-weight average of per-mode ratings | SATISFIED | `processMatchMmr` lines 150-162: `avgRating` across all modes, written to `globalCompositeRating` |
| MMR-03 | 05-01 | Tiered K-factor: K=40 first 20 matches, K=20 for 21-100, K=10 for 100+ | SATISFIED | `getKFactor` in `eloCalculation.ts:22` with `EloConfigTable` default values (40/20/10, thresholds 20/100) |
| MMR-04 | 05-02 | MMR history log records every rating change with match reference | SATISFIED | `MmrHistory` insert at lines 164-176 with `matchHistoryId`, `previousRating`, `newRating`, `delta` |
| MMR-05 | 05-02 | matchesPlayedPerMode counter tracked from day one for K-factor tiering | SATISFIED | `MmrRating.matchesPlayed` incremented at line 144 of `processMatchMmr`; used by `getKFactor` |
| MMR-06 | 05-02 | Leaderboard table/view sorted by MMR per game mode and global | SATISFIED | `Leaderboard` table with top 100 per category, `rebuildLeaderboard` builds from `MmrRating` sorted by rating desc |
| MMR-07 | 05-01 | Season ID column in schema (seasons not implemented yet, but schema supports it) | SATISFIED | `seasonId: t.u32().optional()` on `Leaderboard` (line 10), `MmrRating` (line 10), `MmrHistory` (line 12) |

**Orphaned requirements:** None. All 16 requirement IDs from ROADMAP (MTCH-01 through MTCH-09, MMR-01 through MMR-07) are covered across Plan 01 and Plan 02 frontmatter.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `matchFinalization.ts` | 275-276 | `rosterBlue: '[]'` / `rosterRed: '[]'` hardcoded empty arrays | Info | Known deferral: roster snapshots require MatchSessionStep data from live match, not available during finalization. Commented as "Roster snapshot deferred". Does not affect Phase 5 goal. |

### Human Verification Required

### 1. Full Match Result Lifecycle

**Test:** Create a lobby, record game scores via `record_game_scores`, confirm scores via `confirm_match_scores`, submit via `submit_match_result` (Casual path), then finalize via `finalize_match_result`. Verify MatchSessionHistory row exists and ephemeral records are deleted.
**Expected:** MatchSessionHistory row created with correct outcome. MatchResultRecord, MatchResultGame, and MatchResultParticipant rows deleted. PlayerStat rows incremented.
**Why human:** End-to-end reducer chain requires live database execution to verify transactional behavior.

### 2. Ranked MMR Processing with K-Factor Tiers

**Test:** Process a standalone Ranked match for a new player (0 matches played). Verify K=40 applied. Process 21st match and verify K=20. Process 101st match and verify K=10.
**Expected:** MmrRating.rating changes match expected K-factor application. MmrHistory rows show correct delta values.
**Why human:** Requires multiple sequential reducer calls with state accumulation that cannot be verified by static analysis.

### 3. Tournament Batch MMR Flow

**Test:** Complete a tournament, then call `process_tournament_mmr`. Verify all Validated matches get MMR processed, mmrProcessedAt stamped, and calling again produces no reprocessing.
**Expected:** First call processes N matches. Second call logs "No unprocessed matches". Leaderboard rebuilt once.
**Why human:** Batch processing behavior with tournament lifecycle requires live database interaction.

### 4. Bracket Advancement via Finalization

**Test:** Finalize a tournament match result. Verify the BracketMatch.winnerTeamId is set and winner is placed in the next bracket match.
**Expected:** `advanceBracketMatch` called during finalization sets winnerTeamId and routes winner to next match slot.
**Why human:** Cross-table state changes (MatchResultRecord -> BracketMatch -> next BracketMatch) require live execution.

### Gaps Summary

No gaps found. All 8 success criteria verified. All 16 requirements satisfied. All artifacts exist, are substantive (not stubs), and are properly wired. TypeScript compilation clean. No blocking anti-patterns.

The one Info-level note (empty rosterBlue/rosterRed in MatchSessionHistory) is a known deferral that does not impact the Phase 5 goal of match results, MMR processing, and bracket advancement.

---

_Verified: 2026-03-21T10:30:00Z_
_Verifier: Claude (gsd-verifier)_
