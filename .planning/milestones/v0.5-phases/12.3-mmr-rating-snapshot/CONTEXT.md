# Phase 12.3: MMR Rating Snapshot - Context

**Gathered:** 2026-04-10 (initial), revised 2026-04-11 (D-A through D-H)
**Status:** Ready for planning

<domain>
## Phase Boundary

Freeze the account-rating input to ELO at match-record time so MMR deltas remain correct regardless of post-capture mutations to `HsrAccount.accountRating` or `HsrAccount.isActive`. Persist the frozen value on a new `MatchResultParticipant.accountRatingSnapshot: f64` column. Switch `processMatchMmr` to read the snapshot instead of re-querying `HsrAccount.isActive`. Add UX lobby guards to four roster/account reducers. Add a tournament-ordering guard on `finalize_match_result` to preserve batch MMR processing and bracket rollback capability. Finish the Phase 10.4 LMA migration by also migrating the `timer_expiry_classic` auto-random-pick ownership pool — the last **in-gameplay runtime read** of `HsrAccount.isActive`. Note: `lobbyLifecycle.ts:323` still reads `isActive` as the **default seed value** when creating LMA rows on lobby join; that read is intentional and stays. After Phase 12.3, `isActive` serves as the bootstrap default for LMA, but once LMA rows exist they are the per-match source of truth for both MMR input and character ownership.

**In scope:** schema column, capture at `start_draft`, monotonic-upward update between games in a best-of-N series, `processMatchMmr` read-path change, four UX guards, `migrate_roster` stale-rating fix via helper refactor, tournament-ordering guard on `finalize_match_result`, auto-random-pick ownership pool migration from `isActive` to LMA, test coverage.

**Out of scope:** historical backfill, UI changes, changes to ELO math or the account-rating computation formula, bracket rollback mechanism itself, stand-in mid-series MMR attribution, per-account match-history display (v1 concern).

</domain>

<decisions>
## Implementation Decisions

### Capture point

- **D-A-01:** The snapshot is captured inline in the `MatchResultParticipant` insert loop at `spacetimedb/src/reducers/draftClassic.ts::start_draft` (line 204). This is the exact moment the lobby transitions from `Waiting` → `Drafting` (verified: `ensureStageIs(lobby, 'Waiting')` at line 34, `stage: { tag: 'Drafting' }` at line 229). One reducer, one capture site. There is no separate update path at finalization.
- **D-A-02:** Before `start_draft` fires (while the lobby is still in `Waiting`), users can freely select, deselect, and swap LMA rows with no effect on any snapshot — nothing is persisted yet because `MatchResultParticipant` rows don't exist. Only the state of LMA at the instant `start_draft` fires becomes the initial snapshot.

### Snapshot value

- **D-B-01:** `accountRatingSnapshot` equals `max(HsrAccount.accountRating)` taken across all `LobbyMemberAccount` rows for `(lobbyId, userId)` at capture time. For a single-LMA user (non-tournament, always one row by the replace-on-insert pattern at `accountSelection.ts:81-86`), this is trivially that account's rating. For tournament matches where a user may have up to `Tournament.maxAccountsPerPlayer` selected accounts (additive at `accountSelection.ts:80`), it's the highest-rated one among them.
- **D-B-02:** If a user has no LMA rows at capture time, the snapshot defaults to `0`. This can only happen for casual matches — `start_draft` at `draftClassic.ts:59-73` rejects ranked and MMR-counted-tournament matches when any player has zero LMA rows. A `0` snapshot matches the existing `?? 0` fallback at `finalizationHelpers.ts:87,91` and produces zero account-modifier contribution in `calculateAccountModifier` (verified: the `if (blueAvgAccount > redAvgAccount)` branch at `finalizationHelpers.ts:101` is false when both sides are 0, so no modifier is applied). Behavior for casual matches is preserved.
- **D-B-03:** During the `BetweenGames` stage in a best-of-N series, `select_match_account` (in `accountSelection.ts`) is extended with a monotonic-upward update hook. After inserting the new LMA row, the reducer looks up `MatchResultRecord` by `lobbyId`; if found, it looks up the MRP row by `(matchResultId, userId)` and updates `accountRatingSnapshot = Math.max(existing_snapshot, newAccount.accountRating)`. `deselect_match_account` does NOT touch the snapshot — removing an account from the current selection can never lower the max.
- **D-B-04:** The hook is gated by MRP existence, not by lobby stage. In `Waiting` stage no `MatchResultRecord` exists (it's created at `draftClassic.ts:178` inside `start_draft`), so the lookup returns empty and the hook is a no-op. In `BetweenGames` the record exists and the hook runs. No explicit stage check is needed — the data lifecycle handles the gating.
- **D-B-05:** Stand-ins joining after `start_draft` have `LobbyMemberAccount` rows but no `MatchResultParticipant` row (MRP is only ever inserted at `start_draft:204`). The hook short-circuits cleanly (`if (!mrp) return;`) so stand-in account selection never errors. Stand-ins receive no MMR delta because `processMatchMmr` iterates MRP rows, not `LobbyMember`. **This is intentional:** stand-ins are substitutes whose rating history is not affected by matches they join mid-series. A code comment on the hook documents this behavior explicitly so future readers don't mistake it for a bug.
- **D-B-06:** **Stand-in handling is intentionally asymmetric between D-B and D-I.** D-B (MMR snapshot) iterates `MatchResultParticipant` rows, which do NOT include stand-ins, so stand-ins receive no MMR delta. D-I (auto-pick ownership pool) iterates `LobbyMember`, which DOES include stand-ins, so their characters contribute to the pool. This is not a contradiction — it reflects the correct semantic split: stand-ins should not gain or lose rating from a match they joined mid-series (that's what D-B-05 protects), but their characters ARE available for the team to pick from because they are actively playing the match. A future phase that adds stand-in MMR attribution should touch D-B's data path, not D-I's.

### Read-path change in `processMatchMmr`

- **D-readpath-01:** `spacetimedb/src/helpers/finalizationHelpers.ts` lines 85-92 are rewritten to read `participant.accountRatingSnapshot` directly instead of querying `HsrAccount.user_id.filter(p.userId).find(a => a.isActive)`. Both `blueAccountRatings` and `redAccountRatings` maps become one-liners: `participants.map(p => p.accountRatingSnapshot)`.
- **D-readpath-02:** This single change fixes both the standalone-ranked path (`runFinalization` step 11 at `finalizationHelpers.ts:408-420`) and the tournament-batch path (`process_tournament_mmr` at `matchFinalization.ts:108-127`). Both paths call the same `processMatchMmr` helper, so the fix is path-independent by construction.

### Guards (user-facing UX, not correctness)

- **D-G-01:** Add lobby guards to four reducers in `spacetimedb/src/reducers/roster.ts`:
    - `set_active_hsr_account` (lines 75-96)
    - `batch_upsert_characters` (lines 160-200)
    - `batch_remove_characters` (lines 206-239)
    - `migrate_roster` (lines 246-292)
- **D-G-02:** Each guard rejects when the caller has any active `LobbyMemberAccount` binding (`ctx.db.LobbyMemberAccount.by_account.filter(hsrAccountId)` for account-specific reducers; a broader `filter by userId` for roster-level reducers that mutate any of the caller's accounts). Error message names the conflicting lobby (lobby join code and/or name).
- **D-G-03:** The guards exist for UX clarity, not correctness — the snapshot alone makes the system correct even if every guard is bypassed by an admin reducer. They mirror the existing guard on `delete_hsr_account` at `roster.ts:112-115` and prevent the "I thought I swapped accounts for my active match" confusion. Dropping them later is a small fix; keeping them now has no downside.

### `migrate_roster` stale-rating fix

- **D-D-01:** Extract two pure helpers (planner's call on file location — new `spacetimedb/src/helpers/rosterMutations.ts` or additions to existing `spacetimedb/src/helpers/rosterHelpers.ts`):
    - `applyBatchUpsert(ctx, accountId, items, actingUserId)` — validate all, upsert all `HsrAccountCharacter` rows via composite-PK delete+insert, then call `updateAccountRating(ctx, accountId, actingUserId)`.
    - `applyBatchRemove(ctx, accountId, names, actingUserId)` — validate all names exist, delete all, then call `updateAccountRating(ctx, accountId, actingUserId)`.
- **D-D-02:** Refactor `batch_upsert_characters` and `batch_remove_characters` reducers into thin wrappers: auth validation + ownership check + delegate to the helper. Behavior unchanged.
- **D-D-03:** Refactor `migrate_roster` to use the helpers:
    - For copy and move modes: call `applyBatchUpsert(ctx, targetAccountId, sourceChars, user.id)` — upserts characters into target AND recomputes target rating.
    - For move mode only: additionally call `applyBatchRemove(ctx, sourceAccountId, sourceCharNames, user.id)` — removes from source AND recomputes source rating.
- **D-D-04:** This fixes a pre-existing latent bug at `roster.ts:246-292` where `migrate_roster` never called `updateAccountRating` on either account, leaving both with stale `HsrAccount.accountRating` values until some other mutation triggered a recompute. The bug was surfaced by the same audit that diagnosed the MMR issue, so it's in scope for 12.3.

### Tournament ordering

- **D-H-01:** Add a stage guard near the top of `finalize_match_result` at `spacetimedb/src/reducers/matchFinalization.ts:13-58`, after the `matchResult` lookup and before the authority check. When `matchResult.isTournamentControlled === true`, derive the parent tournament via `BracketMatch.tournamentId` (same derivation as the existing authority check at lines 39-50), look up `Tournament.stage`, and reject unless stage is `Completed` or `Cancelled`.
- **D-H-02:** The guard is unconditional. `countTowardsMmr` is NOT consulted. Rationale: the guard protects two properties, not just one:
    1. **MMR batch processing.** `process_tournament_mmr` at `matchFinalization.ts:86-90` reads `MatchResultRecord` and `MatchResultParticipant` rows that `runFinalization` step 18 (`finalizationHelpers.ts:549-555`) deletes unconditionally on any finalization. Without the guard, an admin finalizing an individual MMR-tournament match mid-tournament silently loses its MMR input.
    2. **Bracket rollback capability.** A tournament organizer may need to invalidate a bracket match after the fact (disputed result, cheating discovered, wrong score submitted). Keeping the ephemeral data alive until the tournament reaches a terminal stage means a rollback is a local row operation rather than historical reconstruction from `MatchSessionHistory`. This holds for casual tournaments too — rollback can be needed regardless of whether MMR is at stake.
- **D-H-03:** Error message: `"Tournament match cannot be finalized while the tournament is still active. Wait for the tournament to reach Completed or Cancelled — this preserves MMR batch processing and bracket rollback capability."`
- **D-H-04:** Behavioral matrix:
    - Non-tournament matches: unchanged, finalize freely once validated.
    - MMR-tournament matches: blocked until terminal stage → `process_tournament_mmr` runs (reads surviving snapshots) → then per-match `finalize_match_result` succeeds.
    - Casual-tournament matches: blocked until terminal stage → per-match `finalize_match_result` succeeds (no batch MMR step because `process_tournament_mmr` still rejects at `matchFinalization.ts:79-81` when `countTowardsMmr === false`).
- **D-H-05:** The actual bracket rollback mechanism is NOT implemented in this phase. D-H makes it possible; implementing it is a future phase.

### Auto-random-pick ownership pool migration (scope expansion)

- **D-I-01:** `timer_expiry_classic` at `spacetimedb/src/reducers/draftClassic.ts:651-668` builds the auto-pick ownership pool from `HsrAccount.isActive` — reading `ctx.db.HsrAccount.user_id.filter(memberId)` then `.find(a => a.isActive)` then filtering that account's `HsrAccountCharacter` rows. This is the **same class of bug as the MMR read path** — Phase 10.4 made `LobbyMemberAccount` the per-match account source, but the auto-pick pool construction was missed during that migration. The manual-pick path at `draftClassic.ts:334` correctly delegates to `validateCharacterOwnership` at `spacetimedb/src/helpers/ownershipValidation.ts:21-36`, which already uses LMA with the comment *"D-14: Check characters from LobbyMemberAccount entries only"*. Only the auto-pick fallback remains broken.
- **D-I-02:** Refactor the ownership pool block to match the pattern already used by the autoRandomPick validation block at `draftClassic.ts:76-96` and by `validateCharacterOwnership`. Read each team member's `LobbyMemberAccount` rows via `ctx.db.LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, member.userId])`, then union their `HsrAccountCharacter` rows into the owned set.
    ```ts
    for (const member of teamMembers) {
        // D-12, D-14 (Phase 10.4): union across selected accounts, not HsrAccount.isActive
        const selectedAccounts = [...ctx.db.LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, member.userId])];
        for (const lma of selectedAccounts) {
            const chars = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(lma.hsrAccountId)];
            for (const c of chars) {
                ownedSet.add(c.characterName);
            }
        }
    }
    ```
- **D-I-03:** The refactor eliminates the linear `.find(a => a.isActive)` JS scan and the over-fetching `HsrAccount.user_id.filter` (up to 5 rows per member). Net operation count per member: 1 indexed composite filter (LMA) + 1 indexed filter per selected LMA row (characters). No linear scans. For single-account non-tournament users this is 2 operations vs the old 3; for multi-account tournament users it's `1 + N` where `N = Tournament.maxAccountsPerPlayer`. The existing `[...ownedSet].filter(name => !bannedChars.has(name) && !pickedChars.has(name))` JS filter at line 666 is unchanged — it's a Set intersection, not a database read.
- **D-I-04:** Behavioral corrections the refactor lands:
    - **Stand-ins** now contribute their LMA-selected characters to the auto-pick pool (previously contributed their global `isActive` account's characters, which the stand-in may never have tied to this match).
    - **Multi-account tournament users** get the union of characters across all their selected accounts (previously only their global `isActive` account, which may not even be one of the tournament-locked accounts).
    - **Non-tournament users** who toggle `isActive` → account X but select account Y via `select_match_account` get Y's pool (correct per Phase 10.4 intent; previously got X).
    - **Users with `requireOwnership=true` but no LMA rows** (only possible in casual matches — ranked/MMR-tournament `start_draft` rejects this at lines 59-73) contribute an empty set. Previously contributed their `isActive` account's pool. Empty is more honest: if the user didn't select a match account, the system shouldn't guess.
- **D-I-05:** Helper extraction considered and rejected. The "union character names across a member's LMA" pattern now appears in three sites (`draftClassic.ts:76-96`, the refactor target, and `ownershipValidation.ts:21-36`), but each wants a different output shape (count, Set, early-return bool), so a single helper would be awkward. Inlining matches the existing style in the same file.
- **D-I-06:** This is a scope expansion beyond "MMR snapshot". Justification: same root cause (Phase 10.4 migration gap), same read-path pattern, ~10 line diff, no new surface area, converges three call sites onto one pattern. Folding it in keeps Phase 12.3 as the canonical "finish Phase 10.4's LMA migration" work rather than leaving a loose end for a single-file future phase.

### Schema

- **D-F-01:** `MatchResultParticipant.accountRatingSnapshot: t.f64()` is added as a required column with default `0`. Not optional. No null-fallback is needed in the read path because every row written after this phase has a valid snapshot, and the DB wipe covers pre-phase rows.
- **D-F-02:** Adding a column requires republish. For v0.5 test environment we wipe via the existing `--clear-database` workflow and `post-publish.ts` re-bootstrap. No historical backfill. The snapshot column is introduced cleanly without migration complexity.

### Rationale correction (replaces the previous "Why This Phase Exists" section)

- **D-E-01:** The previous CONTEXT.md claimed the bug was about mid-match LMA swaps. That's incorrect — `select_match_account` is already stage-guarded to `Waiting` and `BetweenGames` at `accountSelection.ts:34-37`, so LMA cannot change during any active game. The real vectors are:
    1. `processMatchMmr` reads `HsrAccount.isActive`, which is mutable via `set_active_hsr_account` (no guard) at any time, including during an active match.
    2. `HsrAccount.accountRating` is recomputed in place by `updateAccountRating` whenever `batch_upsert_characters` or `batch_remove_characters` runs (unguarded), so a user editing their roster mid-match changes their MMR input without touching `isActive`.
    3. `process_tournament_mmr` re-reads `isActive` at tournament-end (potentially hours or days after matches were played), by which time the user's active account may have rotated for any reason.
- **D-E-02:** The fix is still "snapshot the rating at `start_draft`". Freezing the rating makes all three vectors irrelevant: by the time `set_active_hsr_account` or roster edits could run during a match, the snapshot is already written and `processMatchMmr` no longer cares what `isActive` points to.

### Claude's Discretion

- Exact file location for the extracted `applyBatchUpsert` / `applyBatchRemove` helpers (new file `rosterMutations.ts` vs. additions to existing `rosterHelpers.ts`) — either is fine as long as both reducers and `migrate_roster` share the same implementation.
- Exact form of the lobby-guard error messages (which of `lobbyJoinCode`, lobby id, or team name to include alongside "this lobby").
- Whether to harden the defensive concede fallback at `finalizationHelpers.ts:262-270` with a live LMA read. The path is unreachable via any user-facing reducer (concede is stage-gated post-draft at `concede.ts:120-123`, `:193-196`, `:268-271`) and only exists for admin-level edge cases. Adding a one-line live LMA read is defense-in-depth; leaving it with `accountRatingSnapshot = 0` for synthesized participants is acceptable. Planner decides.
- Test file organization — single `mmr-snapshot` test file vs. splitting by concern (capture, monotonic, guards, tournament-ordering).

### Folded Todos

None.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Debug investigation
- `.planning/debug/phase-5-mmr-account-rating-source.md` — 2026-04-10 debug session documenting the bug, Phase 6 commit `1c91abb` as the origin, and the confirmed mechanism.

### Prior phase context (read for LMA lifecycle and account-rating formula)
- `.planning/phases/05-match-results-and-mmr/` — original ELO/MMR flow decisions. Phase 12.3 surgically touches the account-modifier input.
- `.planning/phases/10.4-per-match-account-selection/` — LMA lifecycle, D-29 ephemeral pattern, per-match account selection.
- `.planning/phases/11-account-rating-matrix/` — `computeAccountRating` / `updateAccountRating` formula, matrix-based rating.

### Backend behavior docs (to be updated post-execution per CLAUDE.md rules)
- `docs/match-results/architecture.md` — document the snapshot column, capture pattern, and read-path change.
- `docs/match-results/contract.md` — MMR snapshot scenarios (normal match, best-of-N monotonic, casual default-0, tournament batch read).
- `docs/roster/contract.md` — four-reducer lobby-guard invariants and the `migrate_roster` rating-recompute behavior.
- `docs/tournament/contract.md` — `finalize_match_result` ordering guard semantics and rollback-window rationale.

### Code reference points (load-bearing for the planner)
- `spacetimedb/src/reducers/draftClassic.ts:178-211` — `start_draft`, `MatchResultRecord` + `MatchResultParticipant` insert site. D-A capture point is inside the loop at line 204.
- `spacetimedb/src/reducers/draftClassic.ts:59-73` — LMA-presence enforcement for ranked/MMR-counted matches. Casual matches can legitimately reach capture without LMA (D-B-02).
- `spacetimedb/src/helpers/finalizationHelpers.ts:85-92` — current buggy `isActive` read. D-readpath-01 change target.
- `spacetimedb/src/helpers/finalizationHelpers.ts:101-105` — `calculateAccountModifier` invocation; verifies 0/0 → no modifier.
- `spacetimedb/src/helpers/finalizationHelpers.ts:262-270` — defensive concede-fallback (dead code for normal flows; optional hardening discretion).
- `spacetimedb/src/helpers/finalizationHelpers.ts:408-420` — step 11 MMR gate.
- `spacetimedb/src/helpers/finalizationHelpers.ts:549-558` — step 18/19, unconditional MRP/MR/lobby deletion. D-H relies on this being unchanged.
- `spacetimedb/src/reducers/matchFinalization.ts:13-58` — `finalize_match_result`. D-H guard insertion point; reuses `BracketMatch → Tournament` derivation at lines 39-50.
- `spacetimedb/src/reducers/matchFinalization.ts:65-135` — `process_tournament_mmr`. Confirms ordering expectation via lines 79-81 (`countTowardsMmr` gate) and lines 86-90 (reads MR + MRP from surviving rows).
- `spacetimedb/src/reducers/accountSelection.ts:18-91` — `select_match_account`. D-B-03 hook insertion point. Stage guard at lines 34-37 verifies LMA can only change in Waiting/BetweenGames.
- `spacetimedb/src/reducers/accountSelection.ts:80,86` — additive vs. replace LMA insert pattern (tournament vs. non-tournament), confirms multi-row LMA in tournament mode.
- `spacetimedb/src/reducers/concede.ts:120-123,193-196,268-271` — concede-family stage guards confirming concede-before-draft-start is unreachable (justifies D-C drop).
- `spacetimedb/src/reducers/concede.ts:91-96` — non-tournament concede auto-finalizes via `runFinalization`. Tournament concede defers to admin.
- `spacetimedb/src/reducers/roster.ts:75-96` — `set_active_hsr_account`, D-G-01 target.
- `spacetimedb/src/reducers/roster.ts:102-154` — existing `delete_hsr_account` guard at lines 112-115, the pattern D-G mirrors.
- `spacetimedb/src/reducers/roster.ts:160-200` — `batch_upsert_characters`, D-D-02 wrapper target.
- `spacetimedb/src/reducers/roster.ts:206-239` — `batch_remove_characters`, D-D-02 wrapper target.
- `spacetimedb/src/reducers/roster.ts:246-292` — `migrate_roster`, D-D-03 refactor target (currently missing both guards and rating recompute).
- `spacetimedb/src/helpers/accountRating.ts:147-159` — `updateAccountRating`, called by the new D-D-01 helpers. Unchanged.
- `spacetimedb/src/helpers/eloCalculation.ts:63` — `calculateAccountModifier` formula, unchanged.
- `spacetimedb/src/tables/matchResultParticipant.ts` — D-F-01 schema change target. Composite PK `[matchResultId, userId]`, `by_result_and_user` index at line 22 supports the D-B-03 lookup.
- `spacetimedb/src/tables/lobbyMemberAccount.ts` — LMA table, PK `[lobbyId, userId, hsrAccountId]` confirms multi-row per user per lobby for tournament additive path.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- **`updateAccountRating(ctx, accountId, actingUserId)`** at `spacetimedb/src/helpers/accountRating.ts:147-159` — called by the new D-D-01 helpers. The function itself needs no changes; only its call sites are refactored.
- **`by_result_and_user` index on `MatchResultParticipant`** at `spacetimedb/src/tables/matchResultParticipant.ts:22` — supports the D-B-03 hook's `(matchResultId, userId)` lookup. No new index required.
- **`lobby_id` index on `MatchResultRecord`** (used at `lobbyGc.ts:28,29`) — supports the D-B-03 hook's `lobbyId → MatchResultRecord` lookup. No new index required.
- **`auditUpdate(ctx, existingRow, actingUserId)`** and **`auditInsert(ctx, actingUserId)`** from `spacetimedb/src/helpers/auditColumns.ts` — standard audit column pattern. The D-B-03 hook's delete+insert update preserves audit columns via `auditUpdate`.
- **`MmrRating` composite-PK update at `finalizationHelpers.ts:137-147`** — reference template for the D-B-03 hook's composite-PK delete+insert on `MatchResultParticipant`.
- **Existing `delete_hsr_account` lobby guard** at `spacetimedb/src/reducers/roster.ts:112-115` — reject pattern the four D-G guards mirror exactly.
- **`BracketMatch → Tournament` derivation** at `matchFinalization.ts:39-50` — already used for the authority check in `finalize_match_result`. D-H-01 reuses the same path.
- **`ensureTournamentAccess`** helper — used by authority check and `process_tournament_mmr`. Not directly needed by D-H (which only reads `Tournament.stage`), but relevant context for the planner.

### Established Patterns

- **Composite-PK update = delete + insert** preserving audit columns. Required for updating `accountRatingSnapshot` on `MatchResultParticipant` via the D-B-03 hook. Codebase examples: `finalizationHelpers.ts:137-147` (`MmrRating`), `roster.ts:186-194` (`HsrAccountCharacter`).
- **Stage-guard pattern** already used at `accountSelection.ts:34-37` (`select_match_account` restricted to Waiting/BetweenGames), `concede.ts:120-123,193-196,268-271` (concede family restricted to Drafting/Equipping/Scoring/BetweenGames). D-H follows the same reject-with-`SenderError` style.
- **`SenderError(message)`** for user-facing rejections from all guards.
- **Lifecycle-managed ephemeral tables.** `LobbyMemberAccount`, `MatchResultRecord`, `MatchResultParticipant`, `MatchResultGame`, `MatchSessionStep` all live from creation through finalization step 18, then get deleted, then the lobby is hardDeleted at step 19 (which also cascades LMA via `lobbyGc.ts:44-47`). D-H depends on this lifecycle: deferring finalization keeps all of it alive for rollback operations.
- **Helper extraction for cross-reducer shared logic** — several codebase helpers already follow this pattern (`finalizationHelpers.ts`, `rosterHelpers.ts`, `eloCalculation.ts`). D-D-01 is a natural extension.

### Integration Points

- **`processMatchMmr`** at `finalizationHelpers.ts:41-176` — single function called from both `runFinalization` step 11 (standalone-ranked) and `process_tournament_mmr` (tournament batch). Changing the account-rating read path inside this function (D-readpath-01) fixes both call sites with one edit.
- **`concede.ts::performConcede`** at lines 91-96 auto-finalizes non-tournament concedes. Always runs after `start_draft` (because concede is stage-gated post-draft), so MRP rows with populated snapshots always exist when `runFinalization` is called through this path. No special handling needed.
- **Tournament concede** (`performConcede`, tournament branch at line 91) creates `MatchResultRecord` with `status: Validated`, transitions lobby to `AwaitingResult`, and defers finalization to an admin/TO. When the admin later calls `finalize_match_result`, D-H's guard kicks in and blocks until the tournament is `Completed` or `Cancelled`. The snapshot persists through this wait because MRP is still alive.
- **`select_match_account`** (D-B-03 hook target) — adds a post-insert block that:
    1. Looks up `MatchResultRecord` by `lobbyId` (no MR → no-op, covers Waiting stage and stand-ins without MRP).
    2. Looks up MRP by `(mr.id, user.id)` (no MRP → no-op, covers stand-ins).
    3. Reads the newly-inserted `HsrAccount.accountRating` for `hsrAccountId` and computes `max(existing_snapshot, newAccount.accountRating)`.
    4. Updates MRP via delete + insert preserving audit columns.
- **`finalize_match_result`** — D-H-01 guard block is added between the existing `matchResult` lookup (line 22) and the authority check (line 30), reusing `BracketMatch` derivation.

</code_context>

<specifics>
## Specific Ideas

- **"Max across series, monotonic upward"** — the user's explicit fairness rule for best-of-N with multi-account selection in tournaments. Quote: *"if you decide to play with a lower-level rated account, it's strategic but doesn't mean we need to compensate you on averaging account ratings."* A user who brings a high-rated account for game 1 and swaps to a low-rated account for game 2 still has MMR computed against the high rating — the strategic choice doesn't get rewarded with a smaller loss penalty. Averaging was explicitly rejected.
- **Rollback as a first-class concern** — user explicitly wanted the D-H guard applied to casual tournaments too, not just MMR-counted ones. Quote: *"we may rollback a bracket match, effectively invalidating a match and therefore not making weird mmr calculations when rollback happens."* The actual rollback mechanism is a future phase; D-H's job is to preserve the option without implementing it.
- **Wrapper-style `migrate_roster` fix** — user preferred the helper-extraction approach over adding standalone `updateAccountRating` calls to `migrate_roster`. Quote: *"maybe do it as a wrapper and use the bulk functions inside it? should do the same trick."* The helpers also de-duplicate validation logic across three reducers.
- **DB wipe is acceptable for v0.5** — user confirmation: *"adding columns does not imply a db wipe as long as new column comes with a default value, this is true. we can wipe it now because we are on test, this is not a lie."* D-F-02 takes the wipe route for simplicity.
- **Guards are pure UX, keep them** — user on D-G: *"should be blocked for the UX. this is just a reducer guard. if we need to change it later is a very small fix. no hurt having it now either."*

</specifics>

<deferred>
## Deferred Ideas

- **Stand-in mid-series MMR attribution.** Pre-existing gap: stand-ins joining a lobby after `start_draft` get `LobbyMemberAccount` rows via `lobbyLifecycle.ts:330-364` but no `MatchResultParticipant` row. They therefore receive no MMR delta even if they play one or more games in the series. Phase 12.3 does NOT fix this — the D-B-03 hook explicitly short-circuits with a code comment that this is intentional. Planner should verify whether there's a stand-in replacement flow elsewhere that mutates MRP (swaps old participant for new one). If not, this is a genuine gap for a future phase — probably coupled with tournament stand-in lifecycle.
- **Historical backfill for existing `MatchResultParticipant` rows.** DB wipe handles test-env rows. If any environment later carries production data across the 12.3 boundary, pre-phase rows would have `accountRatingSnapshot = 0` and any retroactive MMR recomputation would use 0 instead of the historical rating. Out of scope for v0.5.
- **Bracket rollback reducer.** D-H preserves the capability by keeping ephemeral data alive until tournament end. Actually implementing the "invalidate this bracket match and redo downstream" flow is its own phase. It should be planned in coordination with `process_tournament_mmr` so the rollback can undo MMR deltas cleanly.
- **`hsrAccountIdAtMatch` attribution column on `MatchResultParticipant`.** Needed if v1 frontend wants per-account display of match history. Per the previous iteration's D-01, no persisted stat table currently references `hsrAccountId` so the column has zero consumers in v0.5.
- **Optional hardening of the defensive concede-fallback** at `finalizationHelpers.ts:262-270` with a live LMA read. The fallback is unreachable via user-facing reducers (all concede paths are post-draft stage-gated), but adding a one-line live LMA read would make admin-only edge cases well-defined at low cost. Planner's call whether to include or skip. Listed here rather than in decisions because it's genuinely optional.
- **`HsrAccount.isActive` continues to be functional after Phase 12.3.** The only `isActive` read this phase removes is the one inside `processMatchMmr`. The flag remains load-bearing for:
    1. **Auto-LMA seed on lobby join** at `lobbyLifecycle.ts:323-338` — when a user joins a lobby, the system auto-creates a `LobbyMemberAccount` row using `isActive` as the default selection. Without this, every user would need an explicit `select_match_account` call after joining.
    2. **Tournament registration presence check** at `tournamentRegistration.ts:41-44` — `requireRoster` tournaments reject registration when no `isActive` account exists.
    3. **Invariant preservation on delete** at `roster.ts:137-149` and `rosterAdmin.ts:110-119` — when the active account is deleted, the oldest remaining is auto-activated, keeping "exactly one active if any exist" intact.
    4. **View exposure** at `securityViews.ts:565,580` — exposed to the frontend for "current default" rendering. This is the only purely cosmetic use.

  **Removed in Phase 12.3:** the auto-random-pick ownership pool read (previously at `draftClassic.ts:653-668`) migrates to LMA via D-I. No rename is justified; `isActive` is still doing functional work in the remaining four sites.

</deferred>

## Files Expected to Change

### New
- `spacetimedb/src/helpers/rosterMutations.ts` — new file OR additions to existing `spacetimedb/src/helpers/rosterHelpers.ts` (planner's call) containing `applyBatchUpsert` and `applyBatchRemove`.
- `test/backend/match-results/mmr-snapshot.unit.test.ts` — unit tests for snapshot capture at `start_draft`, default-0 behavior, and the `max` aggregation.
- `test/backend/match-results/mmr-snapshot-betweengames.test.ts` — integration test for monotonic-upward update across best-of-N series with per-game LMA changes.
- `test/backend/tournament/tournament-ordering-guard.test.ts` — integration test for D-H (finalize rejection during active tournament, success after Completed/Cancelled).
- `test/backend/roster/migrate-roster-rating.test.ts` — regression test for D-D (pre-existing stale-rating bug).
- `test/backend/draft/auto-pick-ownership-pool.test.ts` — integration test for D-I: auto-pick pool built from LMA. Covers the four behavioral corrections from D-I-04: (1) stand-in joining mid-series contributes their LMA-selected characters to the pool, (2) multi-account tournament user's pool is the union across all selected accounts, (3) user with `isActive = A` but `LMA = B` gets B's characters (not A's), (4) casual `requireOwnership=true` match with one member having no LMA — that member contributes empty set, pool assembles from the other members and auto-pick still succeeds.

### Modified
- `spacetimedb/src/tables/matchResultParticipant.ts` — add `accountRatingSnapshot: t.f64()` column with default `0`.
- `spacetimedb/src/reducers/draftClassic.ts` — two changes: (1) `start_draft` MRP insert loop at line 204 populates `accountRatingSnapshot` from `max` across the participant's LMA rows; (2) `timer_expiry_classic` auto-pick ownership pool at lines 651-668 is rewritten to read `LobbyMemberAccount` instead of `HsrAccount.isActive` (D-I).
- `spacetimedb/src/helpers/finalizationHelpers.ts` — lines 85-92 read `participant.accountRatingSnapshot` directly. Optional: line 262-270 defensive concede fallback gets a live LMA read.
- `spacetimedb/src/reducers/accountSelection.ts` — `select_match_account` adds MRP-lookup + monotonic-upward update hook after the LMA insert.
- `spacetimedb/src/reducers/matchFinalization.ts` — `finalize_match_result` adds D-H tournament-stage guard after the `matchResult` lookup and before the authority check.
- `spacetimedb/src/reducers/roster.ts` — add D-G lobby guards to `set_active_hsr_account`, `batch_upsert_characters`, `batch_remove_characters`, `migrate_roster`; refactor the latter three to delegate to the new helpers.
- `test/backend/match-results/mmr-stats.test.ts` — extend with D-G race-condition integration tests for the four guards.
- `docs/match-results/architecture.md` — document the snapshot column + capture pattern (post-execution update per CLAUDE.md).
- `docs/match-results/contract.md` — add MMR snapshot behavior scenarios (post-execution update).
- `docs/roster/contract.md` — document the four lobby-guard invariants and the `migrate_roster` rating-recompute behavior (post-execution update).
- `docs/tournament/contract.md` — document the `finalize_match_result` ordering guard (post-execution update).

### Not modified
- `spacetimedb/src/helpers/eloCalculation.ts` — ELO math untouched. `calculateAccountModifier` formula unchanged, only its input changes.
- `spacetimedb/src/helpers/accountRating.ts` — `updateAccountRating` / `computeAccountRating` unchanged.
- `spacetimedb/src/tables/lobbyMemberAccount.ts` — LMA schema unchanged.
- `spacetimedb/src/tables/hsrAccount.ts` — `HsrAccount.accountRating` column unchanged; it remains the live recomputed rating for all non-match-input use cases.
- Any other downstream consumer of `accountRating` (profile views, leaderboards, rating history display) — they keep reading live `HsrAccount.accountRating`, which is correct for non-match-input contexts.

## Requirements

- **MMR-SNAPSHOT-01:** `processMatchMmr` uses `MatchResultParticipant.accountRatingSnapshot` as its account-modifier input. No `HsrAccount.isActive` reads remain in `processMatchMmr`.
- **MMR-SNAPSHOT-02:** The snapshot value equals the maximum `HsrAccount.accountRating` across all `LobbyMemberAccount` rows for `(lobbyId, userId)` observed from `start_draft` through series end. Updates are monotonic upward only.
- **MMR-SNAPSHOT-03:** `processMatchMmr` is path-independent — both standalone-ranked finalization (via `runFinalization` step 11) and `process_tournament_mmr` produce identical results for the same MRP row.
- **MMR-SNAPSHOT-04:** Users with no LMA rows at capture time have `accountRatingSnapshot = 0`, matching the pre-phase casual-match fallback behavior. `calculateAccountModifier` applies no modifier when both teams' average is 0.
- **ROST-GUARD-01:** `set_active_hsr_account`, `batch_upsert_characters`, `batch_remove_characters`, and `migrate_roster` reject with a clear error identifying the conflicting lobby when the caller has any active `LobbyMemberAccount` binding.
- **ROST-MIGRATE-01:** `migrate_roster` (invoked out of any lobby) recomputes `HsrAccount.accountRating` for both source and target accounts via `updateAccountRating`. Closes the pre-existing stale-rating latent bug surfaced by the audit.
- **TOURN-ORDER-01:** `finalize_match_result` rejects tournament-controlled matches when the parent tournament's stage is not `Completed` or `Cancelled`, regardless of `countTowardsMmr`. The error message explains the MMR-batch and rollback rationale.
- **OWN-POOL-01:** `timer_expiry_classic`'s auto-random-pick ownership pool (at `draftClassic.ts:651-668`) is built from `LobbyMemberAccount` rows per team member, not from `HsrAccount.isActive`. Per-member character sets are unioned across all selected LMA accounts. No linear `.find(a => a.isActive)` scan remains in this code path. Mirrors the pattern used by `validateCharacterOwnership` and the `start_draft` autoRandomPick validation block.

## Phase History

| Decision | Source |
|---|---|
| Bug diagnosed as real, low severity, document-worthy | `.planning/debug/phase-5-mmr-account-rating-source.md` (2026-04-10 debug session) |
| Simplified from "freeze rating + persist account" to "freeze rating only" (stats architecture confirmed user-level) | 2026-04-10 discussion (original D-01) |
| Snapshot lives on `MatchResultParticipant`, not a new table | 2026-04-10 discussion (original D-02) |
| Lobby guards are defense-in-depth, not required for correctness | 2026-04-10 discussion (original D-04) |
| Test coverage required as part of phase scope | 2026-04-10 user request |
| Phase scoped to v0.5 close-out (not deferred to v1.0) | 2026-04-10 user decision |
| Capture point clarified: `start_draft` MRP insert loop = Waiting→Drafting transition (original D-03 described finalize-time semantics but pointed at insert-site code; revised to match code reality) | 2026-04-11 discussion (D-A) |
| Snapshot value = `max` across LMA rows, monotonic upward during BetweenGames, default 0 when no LMA rows, stand-in-safe no-op | 2026-04-11 discussion (D-B) |
| Concede-before-draft-start path confirmed unreachable via user reducers (stage guards at `concede.ts:120-123,193-196,268-271`); no live-read fallback needed | 2026-04-11 verification (D-C dropped) |
| `migrate_roster` refactored via extracted `applyBatchUpsert` / `applyBatchRemove` helpers, also fixes pre-existing stale-rating bug | 2026-04-11 discussion (D-D) |
| Rationale narrowed: real vectors are `isActive` + roster-char mutations, not LMA swaps (which are already stage-guarded at `accountSelection.ts:34-37`) | 2026-04-11 discussion (D-E) |
| Schema: required `f64` column, default 0, DB wipe acceptable for v0.5 test environment | 2026-04-11 discussion (D-F) |
| UX guards kept for parity with `delete_hsr_account` | 2026-04-11 discussion (D-G) |
| Tournament-ordering guard on `finalize_match_result` unconditional (protects both MMR batch processing AND bracket rollback); `countTowardsMmr` NOT consulted | 2026-04-11 discussion (D-H) |
| Scope expansion: auto-random-pick ownership pool at `timer_expiry_classic` (`draftClassic.ts:651-668`) migrated from `HsrAccount.isActive` to `LobbyMemberAccount` — surfaced while auditing remaining `isActive` reads after D-B was locked | 2026-04-11 discussion (D-I) |

---
*Phase: 12.3-mmr-rating-snapshot*
*Context revised: 2026-04-11*
