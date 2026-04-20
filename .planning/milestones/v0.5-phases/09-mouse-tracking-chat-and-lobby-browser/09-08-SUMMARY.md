---
phase: 09-mouse-tracking-chat-and-lobby-browser
plan: 08
subsystem: backend
tags: [post-draft, finalization, anonymous-views, tournament-history, lobby-lifecycle]
dependency_graph:
  requires: [09-07]
  provides: [post-draft-reducers, finalization-pipeline-v2, anonymous-views, tournament-history-reveal]
  affects: [finalization, tournament-management, match-session, match-history]
tech_stack:
  added: []
  patterns:
    - "Post-draft step recording (EquipLightcone/ArrangeLineup/ConfirmLineup as MatchSessionStep rows)"
    - "Budget carryover pattern: char→LC at Drafting→Equipping transition"
    - "shouldAnonymize() chained view pattern: LobbyMember.user_id → lobby → filter with shouldAnonymize"
    - "GameMode btree scan for MatchSessionHistory (3 filter calls, no iter())"
    - "revealTournamentHistory: MatchResultRecord.tournament_id → lobby joinCodes → iter MatchSessionHistory"
key_files:
  created:
    - spacetimedb/src/reducers/postDraft.ts
    - spacetimedb/src/views/anonymousViews.ts
  modified:
    - spacetimedb/src/helpers/finalizationHelpers.ts
    - spacetimedb/src/reducers/tournamentManagement.ts
    - spacetimedb/src/index.ts
decisions:
  - "MatchSession uses lobbyId as PK (not id) — ctx.db.MatchSession.lobbyId.find() pattern, matching draftClassic.ts/draftControl.ts"
  - "LC cost lookup: HsrLightconeCost.by_lightcone_mode_and_set index; SuperimpositionCost.s1..s5 fields map to superimposition param"
  - "revealTournamentHistory iterates MatchSessionHistory via iter() — acceptable for infrequent tournament completion batch, no lobbyId column on MatchSessionHistory"
  - "view_match_history scans via 3 GameMode btree filter calls to avoid .iter() anti-pattern in views"
  - "handicapApplied set to 0 in MatchSessionHistory insert — no handicapApplied column on MatchResultRecord; Phase 10 will wire handicap calculation"
metrics:
  duration_minutes: 12
  completed_date: "2026-03-29T12:24:43Z"
  tasks_completed: 2
  tasks_total: 2
  files_created: 2
  files_modified: 3
---

# Phase 09 Plan 08: Post-Draft Flow, Finalization Pipeline, Anonymous Views Summary

Post-draft flow (equip/arrange/confirm/advance), finalization pipeline surgical updates (6 changes), tournament history reveal on completion, and 5 per-client server-enforced anonymous + visibility views.

## Objective

Completes the full match lifecycle chain from draft through equipping, scoring, and finalization. Server-enforced anonymous mode replaces the courtesy-based Phase 6 approach. Tournament match history hides from non-participants during active tournaments, revealed on Completed/Cancelled.

## What Was Built

### Task 1: postDraft.ts + finalizationHelpers.ts + tournamentManagement.ts

**postDraft.ts (4 reducers):**

- `equip_lightcone`: LC cost via `HsrLightconeCost.by_lightcone_mode_and_set`, superimposition mapped to `classicCosts.s1..s5`; strict LC budget enforcement per D-55; deducts from `teamBlueLcBudget`/`teamRedLcBudget`; inserts `EquipLightcone` step.
- `arrange_lineup`: JSON validation of positions array; inserts `ArrangeLineup` step; coach guard.
- `confirm_lineup`: Inserts `ConfirmLineup` step with `confirmed: true`; coach guard.
- `advance_stage`: Host-only; `Drafting→Equipping` carries over `teamBlueCharBudget + teamBlueLcBudget → teamBlueLcBudget` (D-50); `Equipping→Scoring` host-forced; system chat on each transition (D-11).

**finalizationHelpers.ts (6 surgical changes):**

1. LobbyConfigSnapshot: `auctionBudget` → `characterBudget + lightconeBudget` (D-89)
2. Step extraction: renamed `characterName` → `targetName`, added `EquipLightcone` case (D-86/D-90)
3. MatchSessionStepHistory insert: uses `targetName` field (not `characterName`)
4. MatchParticipantHistory insert: added `isReferee`, `isCoach`, `isCaptain` from LobbyMember lookup (D-87)
5. MatchSessionHistory insert: added `teamBlueSpent`/`teamRedSpent` (carryover formula: `charBudget + lcBudget - remainingLcBudget`), `handicapApplied: 0`, `isPubliclyVisible: !isTournamentControlled` (D-88/D-91)
6. New `revealTournamentHistory` export: batch-reveals all MatchSessionHistory rows for a tournament via lobbyCode matching (D-91)

**tournamentManagement.ts:**

- Import `revealTournamentHistory` from finalizationHelpers
- `advance_tournament_stage` calls `revealTournamentHistory(ctx, tournamentId)` when `nextStage === 'Completed'`
- `cancel_tournament` calls `revealTournamentHistory(ctx, tournamentId)` after Tournament update

### Task 2: anonymousViews.ts (5 per-client views)

`view_my_lobby_chat`: Chains from `LobbyMember.user_id.filter(callerUserId)` → `ChatMessage.lobby_id.filter(lobbyId)`. Applies `shouldAnonymize()` per message; senderUserId→0 + anonymousLabel for anonymized rows.

`view_my_lobby_members`: Same chain. Resolves `displayName` from User table; `computeAnonymousLabel()` for opponent display names; userId→0 for anonymized.

`view_my_match_steps`: Chains to `MatchSessionStep.lobby_id.filter(lobbyId)`. `actorUserId→0` + `anonymousLabel` for anonymized actor steps.

`view_my_match_participants`: Chains to `MatchResultRecord.lobby_id.filter(lobbyId)` → `MatchResultParticipant.match_result_id.filter(matchResult.id)`. Anonymizes opponent participants.

`view_match_history`: Collects caller's `participatedIds` via `MatchParticipantHistory.by_user.filter(callerUserId)`. Scans MatchSessionHistory via 3 GameMode btree filter calls (avoiding `.iter()`). Returns rows where `isPubliclyVisible === true` OR caller participated.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] MatchSession primary key is lobbyId not id**
- **Found during:** Task 1 TypeScript compilation
- **Issue:** Plan referenced `ctx.db.MatchSession.id.find(lobbyId)` but MatchSession uses `lobbyId` as PK (no `id` column)
- **Fix:** Changed to `ctx.db.MatchSession.lobbyId.find(lobbyId)` and `.lobbyId.update()` throughout postDraft.ts and finalizationHelpers.ts
- **Files modified:** postDraft.ts, finalizationHelpers.ts

**2. [Rule 1 - Bug] HsrLightconeCost has no (lightconeName, superimposition) index**
- **Found during:** Task 1 implementation
- **Issue:** Plan suggested filtering by name+superimposition directly, but the table uses `by_lightcone_mode_and_set` (name, gameMode, costSetId) with `SuperimpositionCost` struct fields
- **Fix:** Lookup via `by_lightcone_mode_and_set` index, then access `classicCosts.s{N}` field using superimposition as key suffix
- **Files modified:** postDraft.ts

**3. [Rule 2 - Missing] handicapApplied not on MatchResultRecord**
- **Found during:** Task 1 finalizationHelpers update
- **Issue:** Plan referenced `matchResult.handicapApplied` but the MatchResultRecord schema has no such field
- **Fix:** Hardcoded `handicapApplied: 0` in the insert; handicap calculation from budget comparison will be wired in a future plan when handicap is computed pre-finalization
- **Files modified:** finalizationHelpers.ts

## Known Stubs

None - all fields are functionally wired. `handicapApplied: 0` is noted as a pending calculation (not a UI stub), documented in decisions.

## Self-Check: PASSED

| Item | Status |
|------|--------|
| postDraft.ts exists | FOUND |
| anonymousViews.ts exists | FOUND |
| 09-08-SUMMARY.md exists | FOUND |
| Task 1 commit a7d1b29 | FOUND |
| Task 2 commit 8328908 | FOUND |
| TypeScript noEmit | PASS |
| Module published | PASS |
| Bindings regenerated | PASS |
