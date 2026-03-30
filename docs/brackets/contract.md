# Brackets & Group Standings

**Architecture:** [architecture.md](architecture.md)

## Acceptance Scenarios

### Seed Bracket (MMR mode)
**Given:** Tournament in Seeding stage, 4 teams with distinct captain MMR ratings (1800, 1600, 1400, 1200)
**When:** `seed_bracket(tournamentId, "mmr")`
**Then:** TournamentTeam.seedNumber assigned by captain's MMR descending -- highest MMR gets seed 1. Ties broken by lower team.id.

### Seed Bracket (Random mode -- deterministic)
**Given:** Tournament in Seeding stage, 4 teams
**When:** `seed_bracket(tournamentId, "random")` called twice
**Then:** Both calls produce identical seed assignments. Hash: `(tournamentId * 31 + teamId) % 2147483647`

### Swap Seeds
**Given:** Tournament in Seeding stage, team A (seed 1), team B (seed 4)
**When:** `swap_seeds(tournamentId, teamA, teamB)`
**Then:** Team A now has seed 4, team B has seed 1. Swap-back restores original.

### Generate Single Elimination Bracket
**Given:** Tournament format=SingleElimination, 5 seeded teams
**When:** `generate_bracket(tournamentId)`
**Then:** 7 BracketMatch rows (bracket size 8 = next power of 2). All bracketSide=Winners. 3 BYE matches have winnerTeamId pre-set + resultStatus=Validated. BYE winners auto-placed in R2 slots. nextWinnerMatchId FK links form bracket tree to finals.

### Generate Single Elimination Bracket (4 teams, no BYEs)
**Given:** Tournament format=SingleElimination, 4 seeded teams
**When:** `generate_bracket(tournamentId)`
**Then:** 3 BracketMatch rows (2 semifinals + 1 final). All bracketSide=Winners. No BYEs. Both R1 matches have nextWinnerMatchId pointing to the finals match.

### Generate Double Elimination Bracket
**Given:** Tournament format=DoubleElimination, 4 seeded teams, winnerAdvantage=1
**When:** `generate_bracket(tournamentId)`
**Then:** 6 BracketMatch rows: 3 Winners + 2 Losers + 1 GrandFinals. WB R1 matches have nextLoserMatchId pointing to LB. GrandFinals match has winnerAdvantage=1.

### Bracket Regeneration
**Given:** Tournament in Seeding stage with existing BracketMatch rows
**When:** `generate_bracket(tournamentId)` called again
**Then:** Existing rows deleted first, new rows created. Supports re-generation after seed changes.

### Advance Bracket Match
**Given:** Tournament InProgress, BracketMatch with winnerTeamId set
**When:** `advance_bracket_match(bracketMatchId)`
**Then:** Winner placed in nextWinnerMatchId slot. In double elim, loser routed to nextLoserMatchId. Group standings updated for Group matches.

### Submit and Advance Bracket
**Given:** Tournament InProgress, MatchResultRecord with winnerUserId (userId), autoAdvanceBracket=true
**When:** `submit_and_advance_bracket(matchResultId)`
**Then:** Maps winnerUserId (userId) -> winnerTeamId via TournamentParticipant. Sets BracketMatch.winnerTeamId. Auto-advances winner to next match.

### Rollback Bracket Match
**Given:** Tournament InProgress, BracketMatch with winnerTeamId set, no MMR processed
**When:** `rollback_bracket_match(bracketMatchId)`
**Then:** winnerTeamId cleared, winner removed from next match slot, loser removed from losers bracket slot. Group standings reversed. If a CalendarEvent is linked to this bracketMatchId, it and its CalendarEventInvite rows are cascade-deleted.

During an active tournament, rollback is FREE because MMR has not been processed yet (tournament MMR is batched at tournament end via process_tournament_mmr). The mmrProcessedAt guard only blocks rollback AFTER the tournament ends and the MMR batch has run. For casual/ranked matches, the guard applies immediately since MMR is processed per-match.

### Group Phase Scoring
**Given:** GroupOnly or hybrid tournament with group phase, matches in a group complete
**When:** `advance_bracket_match` processes group-phase BracketMatch (bracketSide=Group)
**Then:** GroupStanding rows updated: Win=2pts, Draw=1pt, Loss=0pts. Tiebreaker order: head-to-head result, then total points, then seeding.

### Hybrid Format Group-to-Elimination Advancement
**Given:** Hybrid format (GroupIntoSingleElim or GroupIntoDoubleElim) tournament, all group matches complete
**When:** Group winners determined by GroupStanding points + tiebreaker
**Then:** Top N teams from each group (N = tournament.groupAdvanceCount) advance to elimination bracket slots.

### DQ Auto-Advance
**Given:** Tournament InProgress, autoAdvanceBracket=true, team A vs team B in bracket
**When:** `dq_participant(tournamentId, playerA)`
**Then:** Player A status=Disqualified. Team B auto-advanced to next bracket match. If a CalendarEvent is linked to this bracket match, it and its CalendarEventInvite rows are cascade-deleted.

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| seed_bracket invalid mode | Throws "Invalid seeding mode. Must be 'mmr' or 'random'." |
| seed_bracket outside Seeding stage | Throws "seed_bracket can only be called during the Seeding stage." |
| swap_seeds outside Seeding stage | Throws "swap_seeds can only be called during the Seeding stage." |
| swap_seeds by non-TO | Throws "Forbidden: Not authorized for this tournament." |
| swap_seeds with non-existent team | Throws "Team #X not found." |
| swap_seeds with team from different tournament | Throws "Team #X does not belong to tournament #Y." |
| generate_bracket outside Seeding stage | Throws "generate_bracket can only be called during the Seeding stage." |
| generate_bracket with fewer than 2 teams | Throws "At least 2 active teams are required to generate a bracket." |
| advance_bracket_match without winnerTeamId | Throws "No winner set on this bracket match. Submit a result first." |
| advance_bracket_match outside InProgress | Throws "Bracket advancement is only allowed during InProgress stage." |
| rollback after MMR processed | Throws "Cannot rollback: MMR has already been processed for this match." (Only applies after tournament ends + batch MMR runs, or immediately for casual/ranked) |
| rollback without winnerTeamId | Throws "No winner to rollback." |
| submit_and_advance_bracket on non-bracket match | Throws "Not a bracket match" |
| submit_and_advance_bracket without winnerUserId | Throws "No winner on match result. Submit scores first." |
| Hybrid format: fewer teams in group than groupAdvanceCount | All teams in that group advance (no error — groupAdvanceCount is a cap, not a minimum) |
| Client binding uses `has3RdPlaceMatch` (capital R) | SpacetimeDB codegen quirk -- callers must use binding's casing |

## Integration Points

| This Feature | Connects To | Direction |
|-------------|------------|-----------|
| BracketMatch.tournamentId | Tournament.id | Reads |
| BracketMatch.team1Id/team2Id/winnerTeamId | TournamentTeam.id | Reads/Writes |
| BracketMatch.nextWinnerMatchId/nextLoserMatchId | BracketMatch.id | Self-referencing FK |
| GroupStanding.teamId | TournamentTeam.id | Reads/Writes |
| seed_bracket MMR mode | MmrRating (captain's rating) | Reads |
| submit_and_advance_bracket | MatchResultRecord.winnerUserId | Reads |
| submit_and_advance_bracket | TournamentParticipant (userId->teamId mapping) | Reads |
| rollback_bracket_match | MatchResultRecord.mmrProcessedAt | Reads (guard) |
| dq_participant auto-advance | BracketMatch (scans for team's active match) | Reads/Writes |

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| BracketSide enum (5 variants) replaces isLosersBracket bool | Phase 4 CONTEXT.md | 2026-03-17 |
| Explicit FK links (no JSON blob) | Phase 4 CONTEXT.md | 2026-03-17 |
| seedNumber on TournamentTeam (not Participant) | Phase 4 CONTEXT.md | 2026-03-18 |
| GroupStanding.teamId (not userId) | Phase 4 CONTEXT.md | 2026-03-18 |
| Solo auto-team creation on registration | Phase 4 CONTEXT.md | 2026-03-17 |
| Win=2, Draw=1, Loss=0 group point system | Phase 4 CONTEXT.md | 2026-03-17 |
| Grand finals: single match + winnerAdvantage | Phase 4 CONTEXT.md | 2026-03-17 |
| has3rdPlaceMatch toggle | Phase 4 CONTEXT.md | 2026-03-17 |
| autoAdvanceBracket toggle | Phase 4 CONTEXT.md | 2026-03-17 |
| Rollback: one step, MMR reversal deferred to Phase 5 | Phase 4 CONTEXT.md | 2026-03-17 |
| Deterministic seeding hash for random mode | Phase 4 execution | 2026-03-18 |
| MatchResultParticipant junction table for 2v2/3v3 | Phase 4 CONTEXT.md | 2026-03-18 |
| Two-pass FK wiring for BracketMatch self-references | Phase 4 execution | 2026-03-18 |
| Crossed losers feed-in to minimize rematches | Phase 4 execution | 2026-03-18 |
| BYE auto-advancement during generate_bracket | Phase 4 execution | 2026-03-18 |
| dq_participant auto-advance is inline (one transaction) | Phase 4 execution | 2026-03-18 |
| server_set_mmr reducer for test seeding | Phase 4 UAT | 2026-03-19 |
| Slot placement is first-empty-slot, not seed-ordered (frontend sorts by seedNumber) | Phase 4 UAT | 2026-03-19 |
| team1Id/team2Id replace participant1Id/participant2Id, winnerTeamId replaces winnerId | Phase 04.1 execution | 2026-03-20 |
| teamId replaces participantTeamId (GroupStanding) | Phase 04.1 execution | 2026-03-20 |
| Rollback during tournament is free -- MMR not yet processed (batched at tournament end) | Phase 04.1 execution | 2026-03-20 |
| rollback_bracket_match cascade-deletes linked CalendarEvent + CalendarEventInvite | Phase 08 CONTEXT.md (D-22) | 2026-03-28 |
| dq_participant cascade-deletes linked CalendarEvent + CalendarEventInvite | Phase 08 CONTEXT.md (D-22) | 2026-03-28 |
| Finalization step 17 auto-advances bracket (isTournamentControlled + winnerUserId set) | Phase 9 execution | 2026-03-29 |
| Rollback after finalization leaves no re-advance path (match record + lobby deleted) — deferred admin bracket override to Phase 10 | Phase 9 execution | 2026-03-29 |
| Group phase scoring: Win=2pts, Draw=1pt, Loss=0pts; tiebreaker: head-to-head, total points, seeding | Phase 9 execution | 2026-03-29 |
| Hybrid format: groupAdvanceCount determines how many teams per group advance to elimination bracket | Phase 9 execution | 2026-03-29 |

---

*Last updated: 2026-03-29*
