---
status: diagnosed
trigger: "Investigate whether processMatchMmr in finalizationHelpers.ts reads the wrong account for MMR modifier — does it use HsrAccount.isActive instead of LobbyMemberAccount for the match?"
created: 2026-04-10T00:00:00Z
updated: 2026-04-10T00:00:00Z
---

# Phase 5 MMR account rating source — is this a bug?

## Original Concern (from gsd-integration-checker)

> `processMatchMmr` in `spacetimedb/src/helpers/finalizationHelpers.ts:85-92` reads `HsrAccount.user_id.filter(uid).find(a => a.isActive)` rather than the `LobbyMemberAccount` row for the specific match. Per Phase 10.4 D-29, `LobbyMemberAccount` is explicitly ephemeral (deleted in `hardDeleteLobby` cascade), so there's no audit trail of which account was used for MMR. A player could toggle their globally-active account between match start and finalization — the MMR modifier reflects the new active account, not the one actually used.
>
> Affected REQs: MMR-01, ROST-08, ARCH-01
> Severity: low — may be intentional per Phase 10.4 D-29, but semantically inconsistent with per-match selection goal.

## Symptoms

- **Expected:** MMR modifier reflects the HsrAccount the player actually selected for this match (the one pinned in `LobbyMemberAccount` at match start).
- **Actual:** `processMatchMmr` lines 85-92 iterate `HsrAccount.user_id.filter(p.userId)` and pick whichever row happens to have `isActive = true` at finalization time.
- **Reproduction (theoretical):**
  1. User has accounts A (rating 200) and B (rating 900), with A marked `isActive`.
  2. User calls `select_match_account(lobbyId, A.id)` — LMA row written for account A.
  3. User plays a ranked match.
  4. Before `finalize_match_result` is called, user calls `set_active_hsr_account(B.id)`. This is permitted: `set_active_hsr_account` has NO lobby/match guard.
  5. Match finalizes. `processMatchMmr` reads `isActive` → gets account B (rating 900).
  6. Fair-MMR modifier is computed using the wrong rating. Modifier direction can flip entirely.

## Hypotheses

**H1 — Real race, produces wrong MMR modifier.**
`processMatchMmr` deliberately uses `isActive`; no invariant prevents a user from mutating `isActive` or the active account's roster between `select_match_account` and `finalize_match_result`. Expected evidence: `set_active_hsr_account` has no lobby guard; `processMatchMmr` ignores `LobbyMemberAccount`.

**H2 — Race is blocked by a reducer invariant I haven't found yet.**
Maybe `select_match_account` pins / locks the HsrAccount, or `set_active_hsr_account` checks for active lobby membership, or a `LobbyMember.isInActiveMatch` flag rejects the swap. Expected evidence: explicit guard in `roster.ts` or `accountSelection.ts`.

**H3 — Race is possible but the MMR path actually reads LobbyMemberAccount via an indirect path I misread.**
Maybe `processMatchMmr` is wrapped by a helper that resolves participants via LMA first. Expected evidence: an adapter/helper in the call chain.

## Evidence

### E1 — Order of operations inside `runFinalization`
`spacetimedb/src/helpers/finalizationHelpers.ts` lines 408-420 (step 11 MMR), then 557-558 (step 19 hardDeleteLobby).

```
// 11. Process MMR — standalone Ranked only (not tournament-controlled)
if (!isConcede || concedeFlags.doMmr) {
    if (matchResult.matchType.tag === 'Ranked' && !matchResult.isTournamentControlled) {
        processMatchMmr(ctx, matchResult, effectiveParticipants, gameMode, seasonId, historyRow ? historyRow.id : 0, actingUserId);
        ...
    }
}
...
// 19. Cascade-delete lobby — always runs
hardDeleteLobby(ctx, matchResult.lobbyId);
```

So `LobbyMemberAccount` rows are **still alive** when `processMatchMmr` runs in the standalone-ranked path. The code at lines 85-92 is CHOOSING to ignore them, not being forced by data deletion. **Refutes the "data already gone" justification for the current implementation.**

### E2 — `processMatchMmr` body (`finalizationHelpers.ts:85-92`)
```typescript
const blueAccountRatings = blueParticipants.map((p: any) => {
    const activeAccount = [...ctx.db.HsrAccount.user_id.filter(p.userId)].find((a: any) => a.isActive);
    return activeAccount?.accountRating ?? 0;
});
const redAccountRatings = redParticipants.map((p: any) => {
    const activeAccount = [...ctx.db.HsrAccount.user_id.filter(p.userId)].find((a: any) => a.isActive);
    return activeAccount?.accountRating ?? 0;
});
```
Filters by `userId` + `isActive`. `LobbyMemberAccount` is never consulted. Participants carry `userId` but not `hsrAccountId`; the hsrAccountId is only knowable via the LMA rows keyed `[lobbyId, userId]`.

### E3 — `set_active_hsr_account` has NO lobby/match guard (`spacetimedb/src/reducers/roster.ts:75-96`)
```typescript
export const set_active_hsr_account = spacetimedb.reducer(
    { hsrAccountId: t.u32() },
    (ctx, { hsrAccountId }) => {
        const user = ensureVerifiedUser(ctx);

        const account = ctx.db.HsrAccount.id.find(hsrAccountId);
        if (!account) throw new SenderError('HSR account not found');
        if (account.userId !== user.id) throw new SenderError('Not your account');

        // No-op if already active
        if (account.isActive) return;

        const allAccounts = [...ctx.db.HsrAccount.user_id.filter(user.id)];
        for (const acc of allAccounts) {
            if (acc.isActive && acc.id !== hsrAccountId) {
                ctx.db.HsrAccount.id.update({ ...acc, isActive: false, ...auditUpdate(ctx, acc, user.id) });
            }
        }
        ctx.db.HsrAccount.id.update({ ...account, isActive: true, ...auditUpdate(ctx, account, user.id) });
    }
);
```
Nothing checks `LobbyMember`, `LobbyMemberAccount`, or lobby stage. A user CAN toggle `isActive` while they're inside a Ranked lobby mid-match. This **refutes H2**.

### E4 — `select_match_account` does NOT touch `isActive` (`spacetimedb/src/reducers/accountSelection.ts:18-91`)
The reducer writes to `LobbyMemberAccount` only. It does not update `HsrAccount.isActive`, does not lock the account, does not mark it "in-use." The only side effect outside LMA is the `delete_hsr_account` guard which reads back LMA. This proves the two concepts are fully decoupled.

### E5 — `delete_hsr_account` DOES have an LMA guard (`spacetimedb/src/reducers/roster.ts:111-115`)
```typescript
// D-24: Block deletion if account is currently selected in an active lobby
const activeLma = [...ctx.db.LobbyMemberAccount.by_account.filter(hsrAccountId)];
if (activeLma.length > 0) {
    throw new SenderError('Cannot delete an account that is selected in an active lobby. Leave the lobby first.');
}
```
The team understood LMA is the authoritative per-match binding when building Phase 10.4 — the delete path protects it. The MMR path just forgot.

### E6 — Other roster mutations also lack guards
- `batch_upsert_characters` (line 160) — no LMA guard. Adding characters triggers `updateAccountRating()` (line 198), writing a new `accountRating` to `HsrAccount`.
- `batch_remove_characters` (line 206) — no LMA guard. Same `updateAccountRating` side effect.
- `migrate_roster` (line 246) — no LMA guard.

Even if the user never calls `set_active_hsr_account`, they can change the roster of their currently-active account mid-match and the MMR modifier will silently use the new (higher or lower) rating.

### E7 — `LobbyMemberAccount` table carries `hsrAccountId` and is readable at step 11
`spacetimedb/src/tables/lobbyMemberAccount.ts:10-14`:
```typescript
export const lobbyMemberAccountColumns = {
    lobbyId: t.u32(),
    userId: t.u32(),
    hsrAccountId: t.u32(),
};
```
Non-public but fully accessible from server reducers. Index `by_lobby_and_user` at line 22 means a lookup `[matchResult.lobbyId, participant.userId]` is cheap.

### E8 — `hardDeleteLobby` cascade runs at the very end of `runFinalization` (`lobbyGc.ts:44-47`)
```typescript
// 1.5. Delete all LobbyMemberAccount rows (D-28)
for (const lma of [...ctx.db.LobbyMemberAccount.lobby_id.filter(lobbyId)]) {
    ctx.db.LobbyMemberAccount.delete(lma);
}
```
And `runFinalization` only calls this at line 558 (step 19). So in the **standalone ranked path** (`finalize_match_result` → `runFinalization`), LMA is readable throughout steps 1-18.

### E9 — BUT the tournament batch path has a genuine data gap
`spacetimedb/src/reducers/matchFinalization.ts:65-135` — `process_tournament_mmr`:
- Runs AFTER `tournament.stage` is `Completed` or `Cancelled`.
- By that time, each match's lobby has already been hard-deleted (per-match finalization already cascaded through `hardDeleteLobby`).
- So `process_tournament_mmr` calls `processMatchMmr(ctx, mr, participants, ...)` with the ephemeral participant rows it reads from `MatchResultParticipant` — but LMA is GONE. There is no way for it to recover the per-match hsrAccountId.
- The current `isActive` lookup works here, but it's reading whatever the user's `isActive` happens to be days/weeks later when the tournament completes. This is even more divorced from "the account they actually played with."

### E10 — Phase 10.4 D-29 rationale (`10.4-CONTEXT.md:75`)
```
- **D-29:** `leave_lobby`: delete `LobbyMemberAccount` rows immediately for departing member
  (no preservation for finalization — account selection is ephemeral).
```
This decision was made in the context of *what should `leave_lobby` do*, not *what should MMR do*. The "no preservation for finalization" clause is an explicit statement that the feature deliberately does NOT pipe LMA through to finalization. In other words: Phase 10.4 acknowledged the gap but did not close it.

### E11 — The lines were written in Phase 6 (`git log -L 85,92:finalizationHelpers.ts`)
Commit `1c91abb feat(06-03): finalization pipeline rewrite, auto-finalize casual, publish, docs` introduced the exact `isActive` lookup at lines 85-92. Phase 6 predates Phase 10.4 (per-match selection). At the time of Phase 6, `isActive` was the ONLY available signal for "which account is this player using." Phase 10.4 added the LMA ground truth but **never migrated `processMatchMmr` to consume it.**

### E12 — Phase 10.4 CONTEXT lists `runFinalization` only as a cleanup touchpoint (`10.4-CONTEXT.md:168`)
> `runFinalization` (finalizationHelpers.ts) — cleanup step deletes lobby via hardDeleteLobby, which cascades LobbyMemberAccount

Phase 10.4's integration-point list touches `runFinalization` only as a "cleanup step." The MMR modifier inside `processMatchMmr` was out of scope / unconsidered.

### E13 — No test exercises multi-account MMR path
- `test/backend/match-results/mmr-stats.test.ts` — no `set_active_hsr_account`, no `select_match_account`, no references to `accountRating` in the MMR flow.
- `test/backend/match-results/elo-calculation.unit.test.ts` — pure math only.
- `account-rating.unit.test.ts` — roster-formula math, no MMR integration.

A grep for `set_active_hsr_account | select_match_account | multiple.*accounts | swap.*account | toggle.*active` across `test/backend/match-results/` returns zero hits. The race has never been tested because the integration tests don't swap accounts.

## Evaluation of Hypotheses

- **H1 (real race):** CONFIRMED. E1 proves the choice is deliberate, not forced. E3 proves `isActive` can be toggled mid-match. E4+E7 prove LMA is the authoritative source and is readable. E6 proves even roster mutations on the unchanged account can shift `accountRating` mid-match. E13 proves this path is untested.
- **H2 (invariant blocks race):** REFUTED by E3 (no guard on `set_active_hsr_account`) and E6 (no guards on `batch_upsert_characters`, `batch_remove_characters`, `migrate_roster`).
- **H3 (indirect LMA read):** REFUTED by direct read of `processMatchMmr` (E2). The helper does not consume LMA anywhere in the call chain.

## Verdict

### REAL BUG — document-only / low priority (plus recommended Phase 11 fix)

**Why it's a real bug:**
The MMR modifier in `processMatchMmr` (`finalizationHelpers.ts:85-92`) reads from `HsrAccount.isActive` instead of the `LobbyMemberAccount` row bound at match start. A user who toggles `isActive` (via `set_active_hsr_account`) OR mutates the currently-active account's roster (via `batch_upsert_characters` / `batch_remove_characters` / `migrate_roster`) between `select_match_account` and `finalize_match_result` will have their MMR modifier computed from the wrong `accountRating`. In adversarial terms, it is an exploit: a player can pin a weak account for draft ownership validation and a strong account for MMR modifier math, or vice-versa.

**Why it's LOW priority (not "fix required"):**

1. **Standalone-Ranked path has a fix available but limited exploit surface in v0.5.** The per-match account selection UI is only reachable via client reducers. v0.5 is backend-only with no frontend. Any exploit requires direct reducer calls via CLI — a sophisticated attacker path that is not within the playtest threat model.

2. **Tournament batch path (`process_tournament_mmr`) is UNFIXABLE without a schema change.** By the time `process_tournament_mmr` runs, every lobby has already been hard-deleted; LMA rows are gone. To fix this path, `MatchResultParticipant` would need an `hsrAccountId` column (or a new `MatchParticipantHistory.hsrAccountId` column) populated at finalize time — a schema migration that is out of scope for v0.5 cleanup.

3. **The Fair-MMR modifier is a small adjustment, not a direct rating grant.** `calculateAccountModifier()` in `eloCalculation.ts:61-64` returns `round((gap/1000) * maxAccountBonus)`. With `maxAccountBonus=200`, the max modifier is capped at 200 rating points of "effective rating" (not rating delta). The downstream rating delta is further compressed by the sigmoid in `calculateExpectedScore` and the K-factor. So even with a pathological swap, the rating change distortion is bounded and small.

4. **The concern is exposed by audit, not by symptoms.** No player has reported it; no test catches it; no telemetry has flagged it. The integration-checker noted "semantically inconsistent" — that's the right framing.

5. **D-29 "no preservation for finalization" was a conscious (if incomplete) decision.** Phase 10.4 chose not to build the LMA→MatchHistory pipe. Closing the loop retroactively is a Phase 11 concern, not a v0.5 blocker.

**Severity comparison with other Phase 12 audit findings:** This is strictly lower severity than an energy-budget leak, a data-corruption bug, or an authorization bypass. It's a correctness gap in a bonus modifier.

## Recommended Action

### 1. Update the contract docs (MANDATORY)

Add to `docs/roster/contract.md` (or `docs/tournament/contract.md` — whichever owns MMR decisions) a **Known Gaps / Phase History** entry:

> **Phase 5 MMR account-rating modifier source (known gap)** — `processMatchMmr` reads `HsrAccount.isActive` at finalization time, not `LobbyMemberAccount.hsrAccountId`. For the standalone-ranked path, this means a player who calls `set_active_hsr_account` (or mutates their active account's roster) between `select_match_account` and `finalize_match_result` will have their Fair-MMR modifier computed from the WRONG account. For the tournament batch path (`process_tournament_mmr`), the LMA rows have already been cascade-deleted via `hardDeleteLobby` by the time batch MMR runs, so the gap is unfixable without a schema migration (e.g. adding `hsrAccountId` to `MatchParticipantHistory`). Accepted as low-severity for v0.5 (backend-only, no frontend, bounded modifier magnitude). To be addressed in Phase 11 (account rating formula + MMR refinement). Tag: `Phase 12 audit`.

Also add to `docs/lobby/contract.md` Phase History (since Phase 10.4 D-29 lives there): "D-29's 'no preservation for finalization' note was scoped to leave_lobby cleanup; the MMR integration gap surfaced in Phase 12 audit is tracked separately in the roster/tournament contract." Tag: `Phase 12 audit`.

### 2. Add a regression test placeholder (OPTIONAL, prevents silent re-intro)

Add a `test.skip` stub in `test/backend/match-results/mmr-stats.test.ts` documenting the expected future behavior:
```typescript
it.skip('FUTURE Phase 11: MMR modifier uses LobbyMemberAccount, not HsrAccount.isActive', async () => {
  // See .planning/debug/phase-5-mmr-account-rating-source.md
  // Scenario: user A with account A1 (low rating) selects A1 for match via select_match_account,
  // plays match, then set_active_hsr_account(A2) (high rating) before finalize,
  // then finalize_match_result. Assert MmrHistory delta reflects A1's rating, not A2's.
});
```
This keeps the finding visible to anyone reading the test file without forcing an immediate implementation.

### 3. When Phase 11 addresses this — two-part fix

**Part A (standalone path, cheap):** In `processMatchMmr`, when called from `runFinalization` (lobby still alive), read `LobbyMemberAccount.by_lobby_and_user.filter([matchResult.lobbyId, p.userId])` → `hsrAccountId` → `HsrAccount.id.find(hsrAccountId)`. Fallback to `isActive` only if LMA is empty (backwards-compat / casual non-ranked fallback). For multi-account tournament lobbies, sum or average the ratings of all selected accounts for that user.

**Part B (tournament batch path, schema migration):** Add `hsrAccountId: t.u32()` to `MatchResultParticipant` (and/or to `MatchParticipantHistory` if retention is needed). Populate at draft/finalize time from LMA. `process_tournament_mmr` then reads from the archived column instead of live `isActive`. This requires a publish with `--clear-database` or a backfill migration.

### 4. Also consider adding a lobby guard to `set_active_hsr_account` (defense in depth)

Regardless of the MMR fix, `set_active_hsr_account` should probably reject swaps while the caller is in an active `Ranked` lobby past the `Waiting`/`BetweenGames` stage (same pattern as `select_match_account`'s stage guard). This is a small patch that reduces the attack surface without needing the Phase 11 rework. Two lines of code:
```typescript
const activeLma = [...ctx.db.LobbyMemberAccount.by_account.filter(hsrAccountId)];
if (activeLma.length > 0) {
    // or: check current active account instead, and any lobby it's bound to
    throw new SenderError('Cannot change active account while participating in an active match.');
}
```
(Similar thinking applies to `batch_upsert_characters` / `batch_remove_characters`: consider rejecting roster mutations while the account is bound to an active Ranked LMA. Phase 11 decision.)

## Resolution

- **root_cause:** `processMatchMmr` (lines 85-92, introduced in Phase 6 commit `1c91abb`) reads `HsrAccount.isActive` instead of the Phase 10.4 `LobbyMemberAccount` row. Phase 10.4 added per-match account selection but did not migrate the MMR consumer. `set_active_hsr_account` and roster-mutation reducers have no lobby guards, making the race reachable.
- **fix:** NOT applied in this debug session. Recommended as Phase 11 work (see above). For v0.5, document in contracts + add skipped regression test.
- **verification:** N/A — diagnosis only.
- **files_changed:** none (diagnosis only).
- **files_to_change_in_phase_11:**
  - `spacetimedb/src/helpers/finalizationHelpers.ts` — rewrite lines 85-92 to read LMA first, fallback to isActive.
  - `spacetimedb/src/tables/matchResultParticipant.ts` — add `hsrAccountId` column (tournament batch path).
  - `spacetimedb/src/reducers/matchResultSubmission.ts` or wherever MatchResultParticipant is inserted — populate `hsrAccountId` from LMA at insert time.
  - `spacetimedb/src/reducers/roster.ts` — add lobby guards to `set_active_hsr_account`, `batch_upsert_characters`, `batch_remove_characters`, `migrate_roster`.
  - `docs/roster/contract.md`, `docs/tournament/contract.md` — contract entries and phase history.
  - `test/backend/match-results/mmr-stats.test.ts` — unskip regression test.
