---
created: 2026-07-09T00:00:00.000Z
title: Merged synthetic account rating for multi-account play (display + MMR)
area: database
files:
  - spacetimedb/src/helpers/accountRating.ts:15
  - spacetimedb/src/helpers/accountRating.ts:147
  - spacetimedb/src/reducers/draftClassic.ts:196
  - spacetimedb/src/reducers/accountSelection.ts:102
  - spacetimedb/src/helpers/finalizationHelpers.ts:86
  - spacetimedb/src/tables/matchResultParticipant.ts:9
  - spacetimedb/src/tables/hsrAccount.ts:13
  - spacetimedb/src/tables/lobbyMemberAccount.ts
  - docs/mmr/contract.md
  - docs/match-results/contract.md
  - docs/roster/architecture.md
---

## Goal

When a player fields **multiple HSR accounts** in a single match (asymmetric
formats like 1v2, enabled by `Tournament.maxAccountsPerPlayer > 1`), compute a
**single synthetic "merged roster power" rating** representing the union of the
selected accounts' rosters, and use that one number for BOTH:

1. **Display** — show opponents the merged roster power during the lobby Waiting
   stage (main motivation: UI/transparency — "how strong is this multi-account
   player").
2. **MMR** — feed the merged value into the Fair-MMR handicap instead of the
   current MAX rule (see Decision below).

The synthetic is calculated **on the fly, match-to-match**, at account-selection
time during Waiting (and re-snapshotted at draft start for MMR).

## Background — how rating + MMR work today (confirmed by code inspection 2026-07-09)

- **`accountRating`** is a cached `u32` (0–1000) on `HsrAccount.accountRating`
  (`hsrAccount.ts:13`), written only by `updateAccountRating` →
  `computeAccountRating(ctx, hsrAccountId)` (`accountRating.ts:15,147`).
  Recomputed synchronously on **every roster mutation** (batch upsert/remove,
  migrate, admin recalc). It is NOT computed at match time.
- **Formula** (matrix, Phase 11): `0.4·vertical + 0.6·horizontal`, normalized by
  `maxPossible` (a hypothetical account owning ALL characters at E6 — a FIXED
  denominator independent of any merge) and scaled to 0–1000.
  - Vertical = **mean** over OWNED chars of `((1+eidolon)/7)·ageWeight`.
  - Horizontal = archetype-coverage breadth, mean over all archetypes.
- **`MatchResultParticipant.accountRatingSnapshot`** (`f64`,
  `matchResultParticipant.ts:9`) is captured at `start_draft`
  (`draftClassic.ts:196-219`) as **MAX across the user's selected
  `LobbyMemberAccount` rows**, and updated **monotonic-upward** on mid-series
  swaps (`accountSelection.ts:102-117`).
- **MMR** is User-level ELO (`MmrRating`). Account rating enters MMR ONLY as the
  "Fair MMR" handicap: `processMatchMmr` averages each team's
  `accountRatingSnapshot` and adds `calculateAccountModifier(higherAvg, lowerAvg,
  maxAccountBonus)` to the stronger side's effective rating
  (`finalizationHelpers.ts:86-108`). The `/1000` divisor assumes the 0–1000
  scale. Snapshot (not live `accountRating`) is read so post-capture edits can't
  retroactively change the delta.

## Decision — use the merged number for MMR, drop MAX (locked 2026-07-09)

Reasoning we converged on:

- **MAX under-counts multi-account advantage.** Today a player bringing two
  700-rated accounts is treated identically to one 700 account — the second
  account is free (zero extra handicap). That is a real fairness gap.
- **Merge is NOT inflation.** The union is bounded by the fixed 90-ish character
  universe and normalized against the same fixed `maxPossible`. A merged 25/90
  roster is a genuinely larger, honestly-normalized pool — not double-counting.
  (This retired an earlier "breadth balloons to the ceiling" objection, which was
  wrong given the fixed denominator.)
- Using the SAME merged number for display and MMR also removes any
  display-vs-handicap transparency mismatch — opponents see the number that the
  fairness math actually uses.

Formula-behavior nuance to keep in mind (not a blocker): vertical is a **mean**,
so merging a **wide-but-shallow** second account (many E0 chars) can pull vertical
DOWN even as horizontal rises. Net is usually up but NOT guaranteed — a merge can
occasionally land below one account's solo rating. That's the formula honestly
reporting "added breadth, diluted average investment." Do not assume merged ≥ MAX.

## Solution — scope for a phase (do NOT execute now)

1. **Refactor `computeAccountRating` to accept a character-set.** Extract the core
   so it takes an owned-character list `[{characterName, eidolonLevel}]` instead of
   reading `HsrAccountCharacter.hsr_account_id.filter(hsrAccountId)`. Keep a thin
   wrapper for the existing single-account callers (no behavior change). Pure
   function, no schema change — cheap and testable.
2. **Define the merge rule.** Union the selected accounts' owned characters; for a
   character owned by more than one account, take the **MAX eidolon** across
   accounts (best copy). Run the refactored formula on that union against the
   unchanged `maxPossible`. Single account → identical to today (merge of one).
3. **Display path (Waiting).** Compute the merged synthetic when a user selects/
   deselects accounts (`select_/deselect_match_account`, Waiting/BetweenGames) and
   surface it to other lobby members. Note `HsrAccount.accountRating` is NOT public
   (`hsrAccount.ts` — exposed only via views gated by `isRatingPublic`); the
   synthetic display needs its own view/broadcast path and a visibility rule
   (decide: always visible in-lobby, or honor `isRatingPublic`).
4. **MMR path — write merged into the snapshot.**
   - At `start_draft` (`draftClassic.ts:196-219`): replace the MAX-across-accounts
     capture with the **merged** value (compute over all the member's selected
     `LobbyMemberAccount` rows). Casual `0`-default when no LMA rows stays.
   - **Preserve the monotonic-upward guard** (`accountSelection.ts:102-117`): the
     merged snapshot must only ever ratchet UP on later selection changes. This is
     the ONE thing that genuinely needs care — a merged value DROPS when an account
     is deselected (or when a dilution-select lowers vertical), which would reopen
     the mid-series gaming vector (D-B-03) the monotonic rule was built to close.
     Apply the existing ratchet to the new number; do NOT lower on deselect.
   - `finalizationHelpers.ts:86-108` needs no change — it already averages the
     per-user snapshot and the merged value stays in 0–1000, so
     `calculateAccountModifier`'s `/1000` divisor still holds.
5. **Bindings** — regenerate (`spacetime generate`) if any table/field changes
   (e.g. if a synthetic display field is added).
6. **Docs** — update `docs/mmr/contract.md` (snapshot rule: MAX → merged; note the
   monotonic guard), `docs/match-results/contract.md` (finalization account
   modifier input), and `docs/roster/architecture.md` (rating formula now callable
   over a character-set / merged roster). Tag entries with the executing phase per
   the doc-provenance rule.
7. **Tests** — under an explicit task only. Candidates: account-rating unit tests,
   `mmr-snapshot-betweengames` test (monotonic behavior now over merged value),
   finalization/MMR tests. Failures are diagnostic per project rules.

## Scope / impact notes

- **Narrow blast radius.** Multi-account is tournament-only
  (`maxAccountsPerPlayer`, default 1) and the MMR handicap only fires for
  `countTowardsMmr` matches. For single-account players the merged value equals
  today's number exactly — behavior is unchanged for the vast majority of matches.
- **Roster-advantage lobby fields** (`rosterDiffAdvantage`, `rosterThreshold`,
  `underThresholdAdvantage`, `aboveThresholdPenalty`) are NOT connected to
  `accountRating` — pure pass-through metadata archived into match history. Out of
  scope; don't confuse them for a hook.

Triggering context: surfaced 2026-07-09 exploring "combine multiple accounts into
one synthetic rating for multi-account (1v2) play" — display motivation, MMR
fairness follow-through.
