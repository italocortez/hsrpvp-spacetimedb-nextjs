# Phase 12.3 Context: MMR Rating Snapshot

## Phase Goal

Freeze `HsrAccount.accountRating` at match-record time so ELO deltas remain correct even if the user swaps their active account or mutates their roster mid-match. Persist the frozen value on `MatchResultParticipant` and switch `processMatchMmr` to read it instead of re-querying `HsrAccount.isActive`. Add defense-in-depth lobby guards to the active-account and roster-mutation reducers so the invariant becomes user-visible rather than implicit.

## Why This Phase Exists

Design bug diagnosed on 2026-04-10 during the v0.5 milestone audit. Full investigation at `.planning/debug/phase-5-mmr-account-rating-source.md`.

The gsd-integration-checker flagged an architectural mismatch in `spacetimedb/src/helpers/finalizationHelpers.ts::processMatchMmr`. The function reads `HsrAccount.user_id.filter(uid).find(a => a.isActive)` rather than the per-match account selection. The debugger confirmed this is a real bug (not just a design smell) because:

1. **`runFinalization` ordering** — `processMatchMmr` runs at step 11 (`finalizationHelpers.ts:411`), long before `hardDeleteLobby` at step 19. `LobbyMemberAccount` rows are still alive when MMR runs in the standalone-ranked path, so the `isActive` lookup is a deliberate choice, not forced by data deletion.
2. **No guards on `set_active_hsr_account`** (`roster.ts:75-96`) — a user can toggle their active account mid-match without any rejection.
3. **No guards on roster mutators** — `batch_upsert_characters`, `batch_remove_characters`, and `migrate_roster` all call `updateAccountRating` which mutates the rating on the in-use account. The user's MMR input changes without their `isActive` flag moving at all.
4. **Tournament-batch path is unfixable without a snapshot** — `process_tournament_mmr` (`matchFinalization.ts:116`) runs after the tournament completes, by which time every lobby is hard-deleted and LMA is gone. The only surviving source of truth for "what rating applied to this match" has to live on a persistent row.
5. **`delete_hsr_account` already has a lobby guard** (`roster.ts:112-115`) — proving the team's intent was "LMA is the per-match authority", the MMR path just wasn't migrated when Phase 10.4 introduced per-match account selection.
6. **`isActive`-based lookup origin** — `git log -L 85,92:finalizationHelpers.ts` shows the lines came from Phase 6 commit `1c91abb`, predating Phase 10.4. Phase 10.4 CONTEXT listed `runFinalization` only as a cleanup touchpoint; the MMR modifier was never in scope.

### Why it's low severity (but still worth fixing)

- **v0.5 is backend-only.** No frontend UI exists to trigger the account swap in normal play.
- **Fair-MMR modifier is bounded** — `maxAccountBonus = 200` effective rating points, further compressed through the ELO sigmoid. The incorrect delta is small in absolute terms.
- **Phase 10.4 D-29** was a conscious decision to make `LobbyMemberAccount` ephemeral. The bug is the consequence of that decision not propagating to the MMR read path.
- **No reported incidents.** This surfaced from a paper audit, not a gameplay complaint.

### Why the fix is small and additive

- One new column on one table (`MatchResultParticipant.accountRatingSnapshot: f64`).
- One read-site change (`processMatchMmr` reads the snapshot column).
- Four lobby guards using an existing pattern already in the codebase.
- No schema migration of existing data — new column, backward-compatible.
- Both the standalone-ranked path and the tournament-batch path become correct from a single change.

## Key Decisions

### D-01: Stats stay user-level, no `hsrAccountIdAtMatch` column

Confirmed via schema read on 2026-04-10:

| Table | Keyed by | Account-aware? |
|---|---|---|
| `MmrRating` | `(userId, gameMode, seasonId)` | No |
| `PlayerStat` | `userId + mode/draft/season/type/size` | No |
| `PlayerCharacterStat` | `userId + characterName + ...` | No |
| `GlobalCharacterStat` | `characterName + ...` | No (character-only) |
| `MatchResultParticipant` | `(matchResultId, userId)` | No |
| `MatchParticipantHistory` | `(userId, matchHistoryId)` | No |

No persisted stat table references `hsrAccountId`. The only persistent account-aware tables are `TournamentPlayerAccount` (enrollment) and the roster join tables (`HsrAccountCharacter`, `HsrAccountLightcone`). Persisting `hsrAccountIdAtMatch` would have zero downstream consumer. **Drop the attribution column; freeze only the rating value.**

### D-02: Snapshot lives on `MatchResultParticipant`, not on a new table

`MatchResultParticipant` is PK'd on `(matchResultId, userId)` — natural per-player per-match granularity. In best-of-N tournament series each game produces its own `MatchResultGame` rows, but MMR is computed per `MatchResult`, so the snapshot granularity matches the calculation granularity. Adding a new `MmrRatingSnapshot` table would introduce a join for no benefit.

### D-03: Capture at `MatchResultParticipant` insert, not at lobby creation

The snapshot capture point is inside `runFinalization`, at the moment `MatchResultParticipant` rows are being inserted for this match result. At that point:
- LMA is still alive (step runs before step 19 `hardDeleteLobby`)
- The final participant list is known (concede / DQ / normal-end already resolved)
- The rating value to freeze is whatever the user's `HsrAccount.accountRating` is RIGHT NOW, reflecting any roster changes up to this moment

An earlier capture point (lobby creation, lobby transition to Drafting) is also valid, but the later capture simplifies the code path — there's no intermediate state to maintain and no need to deal with mid-match participant swaps (stand-ins, forfeits) updating the snapshot.

### D-04: Defense-in-depth guards are user-facing clarity, not correctness

The snapshot alone makes the system correct — a user who swaps accounts mid-match still has the right rating frozen for their in-flight match. The guards on `set_active_hsr_account`, `batch_upsert_characters`, `batch_remove_characters`, and `migrate_roster` are NOT required for correctness. They exist to:
- Give the user a clear error ("can't do this while in a match") instead of silently accepting a no-op change
- Prevent accidental confusion where the user thinks they swapped accounts for their active match
- Match the existing pattern at `delete_hsr_account` (`roster.ts:112-115`) which already rejects if LMA is present

**Important:** the roster-mutation guards should NOT reject when the mutation is part of a normal out-of-match workflow. The rejection fires only when the caller has an active `LobbyMemberAccount` binding. Users without an active LMA can edit their roster freely.

### D-05: `process_tournament_mmr` becomes path-independent

After the fix, `processMatchMmr` reads `participant.accountRatingSnapshot` regardless of which caller invoked it. Both `runFinalization` step 11 (standalone-ranked) and `matchFinalization.ts::process_tournament_mmr` (tournament batch) get the same correct behavior from a single function body. This eliminates the "unfixable tournament-batch path" identified in the debug session.

### D-06: Test coverage is mandatory for this phase

Per user explicit request. The phase includes:
- **Unit test** for snapshot capture at `MatchResultParticipant` insert
- **Integration test** for account-swap race (user tries to swap mid-match → guard rejects; rating remains frozen even if guard is bypassed via an admin reducer)
- **Integration test** for roster-mutation race (user tries to batch_upsert_characters mid-match → guard rejects; rating remains frozen even if bypassed)
- **Integration test** for best-of-N tournament series with per-game account changes (Account A for game 1, Account B for game 2 → each game's snapshot reflects the account-for-that-game rating)
- **Regression test** promoted from the `it.skip` stub proposed in the debug session

## Integration Points

- **Phase 5 (Match Results and MMR):** Phase 12.3 corrects the ELO input that Phase 5 calculates against. No other Phase 5 behavior changes.
- **Phase 10.4 (Account Selection Per Match):** Phase 12.3 honors the `LobbyMemberAccount` source-of-truth that Phase 10.4 established. The snapshot capture reads LMA at write time.
- **Phase 11 (Account Rating Matrix):** Phase 12.3 freezes the output of Phase 11's `computeAccountRating` / `updateAccountRating` helpers. The formula itself is unchanged.
- **Phase 6 (commit `1c91abb`):** Phase 12.3 replaces the `HsrAccount.isActive` lookup introduced in Phase 6. The read path is reworked; the rest of `processMatchMmr` is untouched.
- **Phase 12.1 (Identity GC):** No interaction.
- **Phase 12.2 (SDK Upgrade):** No interaction — this fix is SDK-version-agnostic.

## Out of Scope

- **Schema migration to make historical match results correct** — existing `MatchResultParticipant` rows have no snapshot. They will continue to use the live `isActive` lookup if any downstream process retroactively computes MMR, which is not expected. Historical MMR deltas are frozen.
- **Backfilling snapshots for existing match history** — not possible without losing the original rating context.
- **Changing stats aggregation granularity** — stats remain user-level per D-01. Per-account stats are out of scope for v0.5.
- **UI changes** — none. v0.5 is backend-only.
- **Changes to `calculateAccountModifier` math** — the formula `Math.round((gap / 1000) * maxAccountBonus)` in `helpers/eloCalculation.ts:63` is untouched. Only its input changes.
- **Schema migration adding `hsrAccountId` to `MatchResultParticipant` for attribution** — deferred to v1.0 if the frontend milestone requires per-account display of match history.

## Files Expected to Change

### New
- `spacetimedb/src/tables/matchResultParticipant.ts` — add `accountRatingSnapshot: f64` column (reuse existing file)
- `test/backend/match-results/mmr-snapshot.unit.test.ts` — new unit test file

### Modified
- `spacetimedb/src/helpers/finalizationHelpers.ts` — lines 85-92 (read snapshot instead of `isActive`) + `MatchResultParticipant` insert site (capture snapshot)
- `spacetimedb/src/reducers/roster.ts` — add lobby guard to `set_active_hsr_account`, `batch_upsert_characters`, `batch_remove_characters`, `migrate_roster`
- `test/backend/match-results/mmr-stats.test.ts` — add race-condition integration tests
- `test/backend/tournament/` — add best-of-N multi-account integration test (file TBD by planner)
- `docs/match-results/architecture.md` — document the snapshot pattern
- `docs/roster/contract.md` — document the lobby-guard invariants

### Not modified
- `spacetimedb/src/helpers/eloCalculation.ts` — math unchanged
- `spacetimedb/src/reducers/accountSelection.ts` — already correct; writes LMA as before
- `spacetimedb/src/reducers/matchFinalization.ts` — gets correct behavior automatically once `processMatchMmr` reads the snapshot
- Any other downstream consumer of `accountRating` — they keep reading `HsrAccount.accountRating` live, which is correct for all non-match-input use cases

## Requirements

- **MMR-RACE-01:** `processMatchMmr` ELO delta uses the `accountRating` value that was in effect at the moment the match record was created, not at finalize time.
- **MMR-RACE-02:** `processMatchMmr` is path-independent — both standalone-ranked finalization and `process_tournament_mmr` tournament batch produce identical results for the same `MatchResultParticipant` row.
- **ROST-GUARD-01:** `set_active_hsr_account`, `batch_upsert_characters`, `batch_remove_characters`, and `migrate_roster` reject with a clear error when the caller has any active `LobbyMemberAccount` binding. The error message names the conflicting lobby.

## Phase History

| Decision | Source |
|---|---|
| Bug diagnosed as real, low severity, document-worthy | `.planning/debug/phase-5-mmr-account-rating-source.md` (2026-04-10 debug session) |
| Simplified from "freeze rating + persist account" to "freeze rating only" after stats architecture confirmed user-level | 2026-04-10 discussion with user (D-01) |
| Snapshot lives on `MatchResultParticipant`, not a new table | 2026-04-10 discussion (D-02) |
| Capture at `MatchResultParticipant` insert time, not lobby creation | 2026-04-10 discussion (D-03) |
| Lobby guards are defense-in-depth, not required for correctness | 2026-04-10 discussion (D-04) |
| Test coverage required as part of phase scope | 2026-04-10 user request |
| Phase scoped to v0.5 close-out (not deferred to v1.0) | 2026-04-10 user decision |

---
*Phase inserted: 2026-04-10, after Phase 12.2, before Phase 13, during v0.5 milestone audit close-out*
