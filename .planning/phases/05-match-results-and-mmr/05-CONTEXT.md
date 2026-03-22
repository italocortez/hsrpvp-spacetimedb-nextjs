# Phase 5: Match Results and MMR - Context

**Gathered:** 2026-03-20 (updated 2026-03-21)
**Status:** Ready for planning

<domain>
## Phase Boundary

Players can submit and verify match results with screenshots; validated results trigger ELO updates and bracket advancement. Implements finalize_match_result, process_tournament_mmr, ELO calculation with team size and account rating modifiers, score entry reducers, and leaderboard.

Requirements: MTCH-01 through MTCH-09, MMR-01 through MMR-07

</domain>

<decisions>
## Implementation Decisions

### Match Types — Simplified to Casual and Ranked
- **D-01:** MatchType enum reduced to `Casual | Ranked` — Tournament variant removed
- **D-02:** Tournament matches derive matchType from `Tournament.countTowardsMmr` setting:
  - `countTowardsMmr = true` → matchType = Ranked
  - `countTowardsMmr = false` → matchType = Casual
- **D-03:** Derivation happens at MatchResultRecord creation time — self-contained after that

### Casual vs Ranked Behavior
- **D-04:** Casual matches auto-validate on submit (status → Validated immediately, skips Submitted)
- **D-05:** Casual matches skip MMR entirely, screenshots optional
- **D-06:** Ranked matches stay at Submitted until Admin/Mod/TO manually validates
- **D-07:** Ranked validation rejects if any MatchResultGame row is missing teamBlueScreenshotUrl or teamRedScreenshotUrl
- **D-08:** Only Ranked matches process MMR

### Finalization Paths
- **D-09:** Casual path: submit → auto-Validated → finalize_match_result → write history + stats → delete ephemeral records
- **D-10:** Ranked standalone path: submit → Submitted → Admin/Mod validates (screenshots required) → Validated → process MMR immediately → stamp mmrProcessedAt → finalize → delete
- **D-11:** Ranked tournament path: submit → Submitted → TO/referee validates (screenshots required) → Validated → match stays until tournament ends → process_tournament_mmr (batch) → stamp mmrProcessedAt → finalize per match → delete all

### ELO System
- **D-12:** Initial rating = 1000. Higher = better.
- **D-13:** EloConfig is a single-row admin-tunable table, not hardcoded constants
- **D-14:** K-factor tiers: K=40 (0-20 matches), K=20 (21-100), K=10 (100+)
- **D-15:** Base formula: `expectedScore = 1 / (1 + 10^((opponentEffective - playerEffective) / 400))`, `ratingChange = K × (actualResult - expectedScore)`
- **D-16:** Each player uses their OWN K-factor based on their matchesPlayed
- **D-17:** globalCompositeRating = average of all 3 game mode ratings, stored (not computed on-the-fly) for btree index sorting

### Team Size Modifier (uneven matches)
- **D-18:** `teamEffective = avg(teamRatings) + sizeBonus × (teamSize - 1) - stdev(teamRatings) / spreadDivisor`
- **D-19:** sizeBonus default = 150 rating points per extra player
- **D-20:** spreadDivisor default = 2 (high skill variance within a team reduces size advantage)
- **D-21:** Self-balancing: player rating climbs until wins are no longer upsets, gains shrink to match losses

### Account Rating Modifier (F2P protection)
- **D-22:** Account Rating (0-1000) measures roster strength (characters, eidolons, archetypes) — wallet power, not skill
- **D-23:** Higher-account-rating player chooses per match: Fair MMR or Handicap Play
- **D-24:** Fair MMR: `accountModifier = (accountGap / 1000) × maxAccountBonus` added to whale's effective rating. F2P is ELO underdog (protected from big losses, rewarded for upsets)
- **D-25:** Handicap Play: account modifier zeroed out, whale accepts in-game handicaps (Phase 9/10 scope). Pure skill ELO.
- **D-26:** maxAccountBonus default = 200
- **D-27:** For team matches, account modifier uses team average account ratings
- **D-28:** Both modifiers (team size + account rating) stack

### EloConfig Table
- **D-29:** Single-row table with sentinel PK (id=1), admin-editable:
  - kFactorNew (u8, default 40), kFactorMid (u8, default 20), kFactorVet (u8, default 10)
  - newThreshold (u32, default 20), midThreshold (u32, default 100)
  - initialRating (u32, default 1000)
  - sizeBonus (u32, default 150), spreadDivisor (u8, default 2)
  - maxAccountBonus (u32, default 200)
- **D-30:** Config changes apply to future matches only — existing ratings stay as-is
- **D-31:** Admin only can edit (same as other admin reducers)

### Confirmation Model — Record-Level Flags
- **D-32:** isConfirmed removed from MatchResultParticipant (only captains used it — wasted on non-captains)
- **D-33:** blueConfirmed and redConfirmed added to MatchResultRecord
- **D-34:** Captain confirms their own side → sets blueConfirmed or redConfirmed based on teamSide
- **D-35:** isCaptain stays on MatchResultParticipant (gates who CAN confirm)

### Referee Full Control
- **D-36:** refereeFullControl (bool, default true) on MatchResultRecord — inherited from lobby/tournament settings
- **D-37:** When true AND referee is a spectator (no MatchResultParticipant row): referee can fill scores for either side AND confirm both sides at once
- **D-38:** When referee IS a participant: refereeFullControl is ignored for confirmation — they confirm their own side only like any captain
- **D-39:** Participant referee still has submission authority via submit_match_result

### Score Entry Flow
- **D-40:** MatchResultRecord created at match start (so scores can be entered incrementally during the match)
- **D-41:** Each captain enters own side's scores; spectator referee can enter either side
- **D-42:** Screenshots follow same pattern — each side uploads own, spectator referee can set either
- **D-43:** `record_game_scores` reducer upserts — creates or updates a MatchResultGame row

### Leaderboard — Top-100 Materialized Table
- **D-44:** Dedicated Leaderboard table (`public: true`), 400 rows max (100 per game mode × 3 + 100 global)
- **D-45:** MmrRating stays `public: true` — small table (~3 rows per user, ~50 bytes each), allows opponent MMR lookup on profile/lobby/tournament pages without extra complexity
- **D-46:** Minimum 2 matches played to appear on leaderboard
- **D-47:** Leaderboard columns: rank (u16), userId (u32), gameMode (GameMode enum — MoC/AS/AA + a Global variant or separate column), rating (u32), matchesPlayed (u32), wins (u32)
- **D-48:** Leaderboard rebuild triggered inline after MMR processing — at end of finalize_match_result (standalone ranked) and process_tournament_mmr (tournament batch)
- **D-49:** No display name denormalization — client joins on userId from User table (already subscribed)
- **D-50:** `anonymousView` NOT used for leaderboard — materialized table rebuilt by reducer is more predictable (view would recompute full sort on every MmrRating change)
- **D-51:** Personal MMR access via direct MmrRating subscription (public table, ~15KB at 100 users)

### Claude's Discretion
- EloConfig table file creation and schema registration
- Exact reducer signatures for score entry (record_game_scores)
- Admin reducer for EloConfig updates (admin_update_elo_config)
- How refereeFullControl is inherited from lobby/tournament settings to MatchResultRecord
- Whether gameMode on Leaderboard uses existing GameMode enum + a Global variant, or a separate LeaderboardCategory enum
- Leaderboard rebuild helper implementation details (delete-all-for-mode + re-insert top 100)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Match Results
- `docs/match-results/architecture.md` — Table reference, submission flow (updated with Casual/Ranked paths, referee full control, record-level confirmation)
- `docs/match-results/contract.md` — Acceptance scenarios (updated with auto-validation, screenshot requirement, spectator referee confirmation)

### MMR System
- `docs/mmr/architecture.md` — Full ELO model: EloConfig table, K-factor tiers, team size modifier, account rating modifier, finalization flow (fully rewritten)

### Player Stats
- `docs/player-stats/architecture.md` — PlayerStat, PlayerCharacterStat, PlayerRelationship tables, incremental aggregation pattern

### Brackets (integration)
- `docs/brackets/architecture.md` — BracketMatch advancement, submit_and_advance_bracket
- `docs/brackets/contract.md` — Advancement scenarios, deferred tests 9-12

### Tournament (integration)
- `docs/tournament/contract.md` — Tournament lifecycle, countTowardsMmr setting

### Schema (source of truth)
- `spacetimedb/src/tables/matchResult.ts` — MatchResultRecord (updated with blueConfirmed, redConfirmed, refereeFullControl)
- `spacetimedb/src/tables/matchResultParticipant.ts` — MatchResultParticipant (isConfirmed removed)
- `spacetimedb/src/tables/matchResultGame.ts` — MatchResultGame schema
- `spacetimedb/src/tables/mmrRating.ts` — MmrRating table
- `spacetimedb/src/tables/mmrHistory.ts` — MmrHistory table
- `spacetimedb/src/tables/playerStats.ts` — PlayerStat table
- `spacetimedb/src/tables/characterStats.ts` — PlayerCharacterStat table
- `spacetimedb/src/tables/playerRelationship.ts` — PlayerRelationship table
- `spacetimedb/src/tables/matchSessionHistory.ts` — MatchSessionHistory (permanent)
- `spacetimedb/src/tables/matchParticipantHistory.ts` — MatchParticipantHistory (permanent)
- `spacetimedb/src/types/enums.ts` — MatchType (Casual, Ranked), MatchOutcome, GameMode
- `spacetimedb/src/types/structs.ts` — EloConfig (updated with sizeBonus, spreadDivisor, maxAccountBonus)

### Reducers (existing, need updates in Phase 5)
- `spacetimedb/src/reducers/matchResultSubmission.ts` — confirm, submit, dispute (updated with record-level confirmation)
- `spacetimedb/src/reducers/matchFinalization.ts` — finalize_match_result, process_tournament_mmr (stubs)
- `spacetimedb/src/reducers/tournamentAdmin.ts` — override_match_result (needs screenshot gate for Ranked)
- `spacetimedb/src/reducers/bracketAdvancement.ts` — submit_and_advance_bracket (integration point)

</canonical_refs>

<specifics>
## Specific Ideas

- winnerId=0 sentinel for draw in submit_match_result — maps to undefined stored value. Renamed to winnerUserId.
- EloConfig struct already exists in structs.ts with new fields (sizeBonus, spreadDivisor, maxAccountBonus) — needs a table wrapper
- HsrAccount.accountRating already exists (ROST-08) — source of the 0-1000 value for account rating modifier
- finalize_match_result and process_tournament_mmr stubs exist in matchFinalization.ts — ready for implementation
- confirm_match_scores already rewritten with spectator referee path — no Phase 5 rewrite needed
- submit_match_result already uses record-level blueConfirmed/redConfirmed — no Phase 5 rewrite needed
- Leaderboard rebuild is a delete-all-for-mode + re-insert top 100 pattern — cheap reducer call, runs in same transaction as MMR update

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `auditUpdate` helper: standard audit column pattern for all table updates
- `getAuthenticatedUser` / `isRoleAtLeast`: permission helpers
- `ensureTournamentHost` / `TournamentAssistant.canValidateResults`: tournament authority checks
- Composite PK delete+insert pattern: established for tables without autoInc PK

### Established Patterns
- Record-level flags (blueConfirmed/redConfirmed) — already implemented in confirm_match_scores
- Spectator referee detection: check MatchResultParticipant existence (no row = spectator)
- Tournament config inheritance via isTournamentControlled + tournamentId FK
- Ephemeral tables (MatchResultRecord/Participant/Game) deleted by finalize_match_result
- Single-row config table pattern: sentinel PK (id=1), admin-only edit — use for EloConfig

### Integration Points
- BracketMatch.winnerTeamId: set when match result is validated, triggers bracket advancement
- Tournament stage transitions: process_tournament_mmr called when tournament reaches Completed/Cancelled
- MatchSessionHistory: finalize_match_result writes permanent history before deleting ephemeral records
- PlayerStat/PlayerCharacterStat/PlayerRelationship: incremented by finalize_match_result
- Leaderboard table: rebuilt at end of MMR processing (finalize_match_result + process_tournament_mmr)

</code_context>

<deferred>
## Deferred Ideas

- Handicap Play gameplay disadvantages (draft cost penalties, pick restrictions) — Phase 9/10 scope
- Season implementation logic — schema supports it (seasonId columns), deferred to v1
- Account rating formula details (how 0-1000 is calculated from roster) — already implemented in ROST-08
- Leaderboard pagination beyond top 100 — revisit if player base exceeds 500 active ranked players
- MmrRating visibility change to private + view — revisit if MmrRating subscription size becomes a bandwidth concern at scale

</deferred>

---

*Phase: 05-match-results-and-mmr*
*Context gathered: 2026-03-20, completed 2026-03-21*
