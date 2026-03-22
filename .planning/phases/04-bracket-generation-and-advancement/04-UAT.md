---
status: complete
phase: 04-bracket-generation-and-advancement
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md, 04-03-SUMMARY.md]
started: 2026-03-18T15:00:00Z
updated: 2026-03-19T08:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Module is published to maincloud and running. Check `spacetime logs hsrpvp-spacetimedb-nextjs-test1` — no startup errors. The SpacetimeDB dashboard shows all new tables (BracketMatch with bracketSide column, MatchResultParticipant, GroupStanding with participantTeamId). No TypeScript compilation errors on `npx tsc --noEmit`.
result: pass

### 2. Create Tournament with Bracket Fields
expected: Calling `create_tournament` with `groupSize`, `has3rdPlaceMatch`, and `autoAdvanceBracket` parameters succeeds. The Tournament row in the database reflects these new column values. Omitting them also works (defaults applied).
result: pass

### 3. Solo Registration Auto-Creates Team
expected: When a player calls `register_for_tournament` on a solo-format tournament, a TournamentTeam row is automatically created with the player's display name and linked via teamGroupId. The player does NOT need to manually create a team first.
result: pass

### 4. Stage Transition Guards
expected: Calling `advance_tournament_stage` from Registration to Seeding fails with an error if fewer than the minimum number of participants are registered. With enough participants, the transition succeeds. Advancing from Seeding to InProgress fails if no BracketMatch rows exist yet (brackets not generated).
result: pass

### 5. Seed Bracket (MMR and Random Modes)
expected: Calling `seed_bracket` with mode "mmr" assigns seedNumber to TournamentTeams ordered by their captain's MMR rating. Calling with mode "random" assigns deterministic pseudo-random seeds (same result if called again with same data). Only works during Seeding stage.
result: pass

### 6. Generate Single Elimination Bracket
expected: Calling `generate_bracket` on a SingleElimination tournament creates the correct number of BracketMatch rows (e.g., 7 matches for 8 teams). Each match has bracketSide=Winners. Matches have nextWinnerMatchId FK links forming the bracket tree. BYE matches (where one team slot is empty) are auto-advanced — the present team is placed as winner.
result: pass

### 7. Generate Double Elimination Bracket
expected: Calling `generate_bracket` on a DoubleElimination tournament creates both Winners and Losers bracket matches plus a GrandFinals match. Losers bracket matches have bracketSide=Losers. Winners bracket matches have nextLoserMatchId pointing to the losers bracket. GrandFinals match exists with bracketSide=GrandFinals.
result: pass

### 8. Swap Seeds
expected: During Seeding stage, a TO calling `swap_seeds` with two teamIds exchanges their seedNumber values. Fails if tournament is not in Seeding stage or if caller is not the TO.
result: pass

### 9. Advance Bracket Match
expected: After a match result exists, calling `advance_bracket_match` places the winning team into the next match slot (via nextWinnerMatchId). In double elimination, the losing team is routed to the losers bracket (via nextLoserMatchId). The source match is marked complete (winnerId set).
result: deferred
reason: Requires MatchResultRecord creation — no insert reducer exists until Phase 5

### 10. Submit and Advance Bracket
expected: `submit_and_advance_bracket` is a convenience wrapper — it takes a userId (not teamId), maps to the team via TournamentParticipant, then performs the advancement. This is the primary reducer clients call after match results are submitted.
result: deferred
reason: Requires MatchResultRecord creation — no insert reducer exists until Phase 5

### 11. Rollback Bracket Match
expected: `rollback_bracket_match` reverses a previous advancement — removes the winner from the next match slot, clears winnerId on the source match. Fails with an error if the match result has already been processed for MMR (mmrProcessedAt is set). Group standings are also reversed if applicable.
result: deferred
reason: Requires MatchResultRecord with winnerId set — depends on Phase 5 match result flow

### 12. DQ Auto-Advance
expected: When `dq_participant` is called and the tournament has `autoAdvanceBracket=true` and is InProgress, any BracketMatch involving the DQ'd team's group is auto-advanced — the opponent is placed as the winner. If autoAdvanceBracket is false, no auto-advance occurs.
result: deferred
reason: DQ auto-advance scans BracketMatch for the team's active match — testable in isolation but full verification needs match results from Phase 5

## Summary

total: 12
passed: 8
issues: 0
pending: 0
skipped: 0
deferred: 4

## Gaps

- truth: "No TypeScript compilation errors across project including test/"
  status: fixed
  reason: "User reported: test/shared/connection.ts:128 uses identityHex but generated binding expects callerIdentityHex"
  severity: major
  test: 1
  root_cause: "Parameter renamed to callerIdentityHex in reducer but test file not updated"
  artifacts:
    - path: "test/shared/connection.ts"
      issue: "identityHex should be callerIdentityHex on line 128"
  missing: []
