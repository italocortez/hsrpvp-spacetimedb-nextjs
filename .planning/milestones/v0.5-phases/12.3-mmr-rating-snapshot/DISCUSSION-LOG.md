# Phase 12.3: MMR Rating Snapshot - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered and the reasoning behind each choice.

**Date:** 2026-04-11 (revision session)
**Phase:** 12.3-mmr-rating-snapshot
**Areas discussed:** capture point, snapshot aggregation, best-of-N handling, concede fallback, migrate_roster refactor, schema migration, tournament ordering

---

## Context of this session

Phase 12.3 was inserted into the v0.5 roadmap on 2026-04-10 during the audit close-out, based on findings in `.planning/debug/phase-5-mmr-account-rating-source.md`. The initial CONTEXT.md was written that same day but used plain markdown headers instead of the standard XML structure, and several of its load-bearing claims turned out to not match the code.

This 2026-04-11 session was a verification pass triggered by the user's question *"check if we have any missed logic that may be worth considering asking."* The verification surfaced nine gaps of varying impact. The user selected answers for each. Then I verified three load-bearing decisions against the actual code (D-B, D-C, D-H) and caught one additional correction (D-C is not needed; concede-before-draft-start is unreachable).

---

## Gap 1 — Capture point semantics (D-A)

### Problem surfaced

The original CONTEXT.md D-03 said "Capture at `MatchResultParticipant` insert, inside `runFinalization`, when the final participant list is known (concede / DQ resolved)". Verification against the code showed this is wrong on its face — `MatchResultParticipant.insert` is only called once in the entire codebase, at `draftClassic.ts::start_draft` line 204, at draft-start time. `runFinalization` only READS and later DELETES MRP rows; it never inserts them. So the original D-03's stated location and its stated semantics contradicted each other.

### Options presented

| Option | Description | Trade-offs |
|---|---|---|
| (a) Match-start snapshot | Capture inside the existing MRP insert loop at `draftClassic.ts:204`. Snapshot reflects the user's account rating at the moment the lobby transitions from Waiting → Drafting. | Simplest, single call site, matches code structure naturally. Vulnerable only to mid-match mutations if guards are bypassed. |
| (b) Finalize-time snapshot | Add a new pipeline step in `runFinalization` (before step 11) that reads LMA + `HsrAccount.accountRating` live and UPDATES each MRP row before MMR runs. Matches original D-03's written justification. | Requires new pipeline step, introduces a second write path. |

### User's choice

(a) — match-start snapshot at `start_draft`. User asked for confirmation that this captures at the Waiting→Drafting transition.

### Verification

Confirmed at `draftClassic.ts::start_draft`:
- Line 34: `ensureStageIs(lobby, 'Waiting')` — rejects unless lobby is in Waiting
- Line 178: `MatchResultRecord.insert`
- Line 204: `MatchResultParticipant.insert` (the capture site)
- Line 229: `stage: { tag: 'Drafting' }` — transition to Drafting

The insert loop at line 204 is literally inside the Waiting→Drafting transition. User confirmation received.

### Decision

**D-A:** Snapshot captured inline in the MRP insert loop at `draftClassic.ts:204`. Single reducer, single capture site, no finalize-time update path.

---

## Gap 2+3 — Multi-account selection and best-of-N aggregation (D-B)

### Problem surfaced

`LobbyMemberAccount` PK is `[lobbyId, userId, hsrAccountId]`, and `accountSelection.ts:80` is explicitly additive for tournament lobbies ("Insert new selection (additive for tournament — no replace)") up to `Tournament.maxAccountsPerPlayer`. A user may have multiple LMA rows for a single lobby. The CONTEXT.md's `accountRatingSnapshot: f64` column can only hold one value per `(matchResultId, userId)`. What does it represent when multiple accounts are selected?

Additionally, in a best-of-N series, `select_match_account` is allowed during the `BetweenGames` stage (`accountSelection.ts:34-37`), so a user can legitimately swap LMA selection between games. D-06 test #4 from the original CONTEXT.md expected per-game granularity, which is impossible at the current `MatchResultParticipant` PK.

### Options presented (for Gap 2: multi-account aggregation)

| Option | Description | Trade-offs |
|---|---|---|
| Sum | Sum of ratings across all selected accounts | Overweights players who bring more accounts even if they're low-rated |
| Average | Mean across selected accounts | Gameable — bring one high-rated account to "prove" you have it, plus low-rated accounts to pull the avg down |
| Max | Highest-rated among selected accounts | Anti-gaming: can't deflate your rating by adding weak accounts |
| Per-LMA snapshot | Store rating on LMA or a new table | Requires schema change elsewhere, multiplies downstream complexity |

### Options presented (for Gap 3: best-of-N handling)

| Option | Description | Trade-offs |
|---|---|---|
| (a) Accept game-1-only | Drop test #4. Snapshot reflects only the first game's selection. | Gameable — pick high for game 1, swap to low for games 2+ |
| (b) Per-game granularity | Move snapshot to `MatchResultGame` or a new per-game participant table, recompute MMR per game | Large surgery, crosses Phase 5 boundary |
| (c) Freeze LMA at start_draft | Block `select_match_account` in BetweenGames entirely | Changes Phase 10.4 intent, scope creep |
| (d) Monotonic upward (proposed) | Take max across LMA rows ever seen during the series; updates on `select_match_account` during BetweenGames only go up | Combines Gap 2's "max" rule with Gap 3's "across series" framing |

### User's choice

Gap 2: "use the max rated account for fairness"
Gap 3: "we keep the max account used for the series always, that is your highest powered account. it makes sense to me, if you decide to play with a lower level rated account, its strategic but doesn't mean we need to compensate you on averaging accounts rating"

These two answers combine naturally into option (d) — a single `max` rule that is initialized at `start_draft` and monotonically updated during BetweenGames. User confirmed the combined rule.

### Follow-up clarification

User asked *"about Snapshot value, it is only capture once the draft starts right? the user can still swap around before the draft starts and it wouldn't matter"* — yes, confirmed. `MatchResultRecord` doesn't exist until `start_draft:178`, so the BetweenGames hook's existence-gated lookup returns empty during Waiting stage and is a no-op. LMA can be swapped freely pre-draft.

### Verification

- `MatchResultParticipant` has `by_result_and_user` index at `matchResultParticipant.ts:22` — supports the hook's lookup.
- `MatchResultRecord` has `lobby_id` index — supports the lobbyId → MR lookup.
- Composite PK update pattern (delete + insert preserving audit columns) is established, e.g., `finalizationHelpers.ts:137-147`.
- `matchResultParticipant.ts:9-12` confirms MRP has audit columns, so `auditUpdate` works.
- Edge case 1: stand-ins joining mid-series have LMA but no MRP. Hook short-circuits cleanly with `if (!mrp) return;`. User confirmed: *"Stand ins that suddenly come should not have their MMR affected, this is expected behavior."*
- Edge case 2: casual matches with no LMA at capture. Default `0` matches existing `?? 0` fallback at `finalizationHelpers.ts:87,91`, and `calculateAccountModifier` at `finalizationHelpers.ts:101-105` applies no modifier when both sides are 0. User confirmed: *"I agree with the 0 as long as it doesn't break anything else."* Verified: no breakage.

### Decision

**D-B:** `max` across LMA rows at capture, monotonic-upward update on `select_match_account` during BetweenGames, default 0 when no LMA rows, stand-in-safe no-op.

---

## Gap 4 — Concede-before-draft-start fallback (D-C, DROPPED)

### Problem surfaced

`runFinalization` at `finalizationHelpers.ts:262-270` synthesizes `concedeParticipants` from `LobbyMember` when `participants.length === 0`, and step 11 MMR (`doMmr = isRanked && !isTournament` at line 252) runs regardless of stage. I was worried that ranked concede before any MRP row existed would have no snapshot to read.

### Options presented

| Option | Description |
|---|---|
| (a) Live LMA read in fallback | In the concede-participants synthesis, read LMA + `HsrAccount.accountRating` live for each synthesized participant |
| (b) Skip MMR for pre-draft concede | Gate step 11 on "participants list is non-empty" |
| (c) Eager MRP creation | Create MRP rows at lobby creation or at concede time |

### User's choice

User leaned toward (a), asked for my recommendation. I initially recommended (a) on the grounds that (b) creates a ranked-dodging exploit and (c) adds orphan cleanup burden.

### Verification (and reversal)

Reading `concede.ts:120-123`, `concede.ts:193-196`, `concede.ts:268-271`:

```
const activeStages = ['Drafting', 'Equipping', 'Scoring', 'BetweenGames'];
if (!activeStages.includes(lobby.stage.tag)) {
    throw new SenderError('Concede is only available during Drafting, Equipping, Scoring, or BetweenGames.');
}
```

All three concede-family reducers (`concede_match`, `claim_forfeit`, `defer_match`) explicitly reject in the `Waiting` stage. Since `start_draft` is the only transition out of `Waiting` and it creates MRP rows inline, every concede path runs after MRP rows exist. **The concede-before-draft-start scenario does not exist** via any user-facing reducer. The `runFinalization` fallback at lines 262-270 is defensive dead code for admin-only edge cases.

### Decision

**D-C: DROPPED.** No special pre-draft concede handling is needed. `processMatchMmr` reads from MRP like normal. The defensive fallback stays unchanged; if it ever fires via an admin reducer, synthesized participants get `accountRatingSnapshot = 0` and zero account-modifier contribution. Optional hardening (one-line live LMA read) is left to the planner's discretion.

---

## Gap 5 — migrate_roster stale-rating (D-D)

### Problem surfaced

The original CONTEXT.md rationale point #3 claimed `migrate_roster` calls `updateAccountRating`. Verification at `roster.ts:246-292` showed it does NOT — it only moves `HsrAccountCharacter` rows between accounts. The only roster reducers that call `updateAccountRating` are `batch_upsert_characters` (line 198) and `batch_remove_characters` (line 237). As a consequence, `migrate_roster` leaves both source and target accounts with stale `HsrAccount.accountRating` until some other mutation triggers a recompute.

### Options presented

| Option | Description |
|---|---|
| (a) Standalone calls | Add two `updateAccountRating` calls at the end of `migrate_roster` (minimum change) |
| (b) Helper wrapping | Extract `applyBatchUpsert` / `applyBatchRemove` helpers from the existing batch reducers, have `migrate_roster` call them |

### User's choice

User on (b): *"migrate_roster had a bug, it should calculate the rating as well upon account migration. maybe do it as a wrapper and use the bulk functions inside it? should do the same trick"* — preferring the helper-wrapping approach.

### Verification

Helper extraction is cleaner because:
- De-duplicates validation logic across three reducers (`batch_upsert_characters`, `batch_remove_characters`, `migrate_roster`)
- Auto-inherits `updateAccountRating` for `migrate_roster`
- Matches existing codebase patterns (`rosterHelpers.ts`, `finalizationHelpers.ts`)

No structural blockers.

### Decision

**D-D:** Extract `applyBatchUpsert(ctx, accountId, items, actingUserId)` and `applyBatchRemove(ctx, accountId, names, actingUserId)`. Both call `updateAccountRating` at the end. `batch_upsert_characters` and `batch_remove_characters` become thin wrappers. `migrate_roster` calls `applyBatchUpsert` for the target and `applyBatchRemove` for the source (move mode only). Closes the pre-existing stale-rating latent bug.

---

## Gap 6 — Narrower bug rationale (D-E)

### Problem surfaced

The original CONTEXT.md said the bug is triggered by mid-match LMA swaps via `set_active_hsr_account`. That's technically off because `set_active_hsr_account` toggles `HsrAccount.isActive`, not LMA, and LMA swaps are already stage-guarded to Waiting/BetweenGames at `accountSelection.ts:34-37`. The actual vectors are narrower.

### User's choice

*"Yes update"* — rewrite the rationale to match code reality.

### Decision

**D-E:** Rationale correctly identifies three vectors:
1. `processMatchMmr` reads `HsrAccount.isActive`, which is mutable via `set_active_hsr_account` (no guard).
2. `HsrAccount.accountRating` is recomputed in place by `updateAccountRating` during roster character mutations.
3. `process_tournament_mmr` re-reads `isActive` at tournament-end, when `isActive` may have rotated.

LMA swaps are NOT a vector because `select_match_account` has its own stage guard.

---

## Gap 7 — Schema migration posture (D-F)

### Problem surfaced

CONTEXT.md claimed "backward-compatible, new column". SpacetimeDB schema changes historically require `--clear-database`. Is 12.3 shipping with or without a wipe?

### User's choice

*"adding columns does not imply a db wipe as long as new column comes with a default value, this is true. we can wipe it now because we are on test, this is not a lie."*

### Decision

**D-F:** `MatchResultParticipant.accountRatingSnapshot: t.f64()` required column with default `0`. DB wipe via existing `--clear-database` workflow and `post-publish.ts`. No backfill, no null-fallback in the read path.

---

## Gap 8 — set_active_hsr_account guard rationale (D-G)

### Problem surfaced

After the snapshot fix, `set_active_hsr_account` no longer affects in-flight MMR. Is its guard still justified?

### User's choice

*"should be blocked for the UX. this is just a reducer guard. if we need to change it later is a very small fix. no hurt having it now either."*

### Decision

**D-G:** Four UX guards kept as written. Rationale is explicit in the CONTEXT.md — guards are user-facing clarity, not correctness.

---

## Gap 9 — Tournament ordering (D-H)

### Problem surfaced

`finalize_match_result` at `matchFinalization.ts:13-58` has no stage gate for tournament-controlled matches. `runFinalization` step 18 (`finalizationHelpers.ts:549-555`) deletes `MatchResultParticipant`, `MatchResultGame`, `MatchResultRecord`, and `MatchSessionStep` unconditionally. Step 19 hardDeletes the lobby. `process_tournament_mmr` at `matchFinalization.ts:86-90` reads those same tables. If an admin calls `finalize_match_result` on a tournament match before the tournament ends, the MMR input is silently lost. This is a **latent bug in current code**, not one introduced by 12.3, but 12.3 makes it worse because the snapshot lives on rows that get deleted.

### Options presented

| Option | Description |
|---|---|
| (a) Code guard | `finalize_match_result` rejects tournament matches unless parent tournament is Completed/Cancelled |
| (b) Preserve snapshot post-finalization | Copy to `MatchParticipantHistory` at finalize time |
| (c) MMR before delete | Move MMR processing earlier in `runFinalization` for tournament matches |

### User's choice (first round)

*"worth checking a solution here, either by guard or by assuring order of operations"* — open to either.

I initially proposed option (a) conditioned on `countTowardsMmr === true`, reasoning that casual (non-MMR) tournaments don't need the guard because there's no batch MMR step to preserve.

### User's choice (second round)

User rejected the `countTowardsMmr` condition: *"whats the final decision on D-H? if a tournament is casual (doesnt count towards mmr) then we are allowed to close the matches individually or we can still close them all at the end on batch? we keep the matches resolve at the end because we may rollback a braket match, effectively invalidating a match and therefore not making weird mmr calculations when rollback happens"*

The user's rollback argument is the deciding factor: even casual tournaments need rollback capability. Keeping ephemeral data alive until the tournament terminal stage supports rollback regardless of MMR.

### Decision

**D-H (final):** Unconditional tournament-stage guard on `finalize_match_result`. Rejects any tournament-controlled match when the parent tournament stage is not `Completed` or `Cancelled`, regardless of `countTowardsMmr`. Error message cites both MMR batch processing and bracket rollback capability. Actual rollback mechanism is out of scope; D-H just preserves the option.

---

## Corrections made to the original (2026-04-10) CONTEXT.md

| Original claim | Correction |
|---|---|
| "Capture at `MatchResultParticipant` insert, inside `runFinalization`, when the final participant list is known" | MRP is inserted at `draftClassic.ts:204`, not in `runFinalization`. Capture is at match start, not at finalize. |
| "`migrate_roster` calls `updateAccountRating`" | It doesn't. Separate latent bug surfaced — now fixed as part of this phase via D-D. |
| "A user can toggle their active account mid-match" (implying LMA) | Mid-match `set_active_hsr_account` toggles `HsrAccount.isActive`, not LMA. LMA is already stage-guarded. |
| "Backward-compatible, new column" (implying no wipe) | Wipe is accepted; column is required with default 0, no null fallback in read path. |
| D-06 test #4: "best-of-N with per-game account changes → each game's snapshot reflects the account-for-that-game rating" | Impossible at current MRP PK granularity. Replaced with monotonic-upward rule: snapshot = max across the entire series. |

## Claude's Discretion

- Exact file location for `applyBatchUpsert` / `applyBatchRemove` helpers (new file vs. existing `rosterHelpers.ts`)
- Exact shape of lobby-guard error messages (which identifier to cite alongside "this lobby")
- Optional hardening of the defensive concede-fallback at `finalizationHelpers.ts:262-270` with a live LMA read
- Test file organization

## Deferred Ideas

- Stand-in mid-series MMR attribution — pre-existing gap, planner should verify whether a replacement flow exists elsewhere
- Historical backfill for existing `MatchResultParticipant` rows — unnecessary with DB wipe
- Bracket rollback reducer — future phase; D-H preserves the capability
- `hsrAccountIdAtMatch` attribution column for v1 frontend per-account history display
- Auto-random-pick reads `isActive` instead of LMA at `draftClassic.ts:653-668` — same class of bug as the MMR read path, not migrated from Phase 10.4; logical next cleanup phase

---

## Post-session correction (2026-04-11, same day)

### Incorrect claim caught by the user

After CONTEXT.md and DISCUSSION-LOG.md were written, the user asked: *"im reading that HsrAccount.isActive is no longer used for anything other than cosmetic UI, can you explain to me why is it no needed anymore? is not part of any fallback?"*

The original deferred item I wrote in CONTEXT.md claimed:
> After this phase, `isActive` is no longer read by `processMatchMmr`. Its only remaining use is as the "default account for display" flag. Some day this could be renamed (e.g., `isDefault`) for clarity...

This was factually wrong. A grep of `spacetimedb/src` for `isActive` revealed four non-cosmetic reads against `HsrAccount` that Phase 12.3 does not touch:

| Location | Purpose |
|---|---|
| `lobbyLifecycle.ts:323-338` | Auto-seed `LobbyMemberAccount` on lobby join using `isActive` as the default selection |
| `tournamentRegistration.ts:41-44` | `requireRoster` tournament presence check |
| `draftClassic.ts:653-668` | Auto-random-pick ownership pool (same class of bug as the MMR read) |
| `roster.ts:137-149`, `rosterAdmin.ts:110-119` | Invariant preservation on delete (auto-activate oldest remaining) |

The only purely cosmetic use is the view exposure at `securityViews.ts:565,580`.

### Impact on Phase 12.3

Scope unchanged. Phase 12.3 still only touches the two `isActive` reads at `finalizationHelpers.ts:86,90`. But two things had to change:

1. **CONTEXT.md deferred section corrected.** The incorrect "rename to `isDefault`" item was replaced with an accurate breakdown of where `isActive` still does functional work, plus a new deferred item for the `draftClassic.ts:653-668` auto-random-pick bug.
2. **A new related bug was surfaced.** The `requireOwnership` auto-random-pick path at `draftClassic.ts:653-668` reads `isActive` instead of LMA. It wasn't migrated when Phase 10.4 introduced per-match account selection. Logically it's the next cleanup phase, out of scope for Phase 12.3 which is scoped to MMR specifically.

### Verification method

Single grep: `Grep(pattern="isActive", path="spacetimedb/src", output_mode="content", -C=1)`. All matches reviewed. Season.isActive (unrelated table) and module_bindings (auto-generated) filtered out manually. Five distinct `HsrAccount.isActive` read-use cases identified.

### Lesson

Deferred-section claims should be verified, not asserted. The user caught this one; I should have greppped before writing the rename suggestion in the first place.

---

## Gap 10 — Auto-random-pick ownership pool migration (D-I, scope expansion)

### Trigger

Immediately after the post-session correction landed, the user said: *"This part, worth refactoring now I think, it wires into what we are doing, should be easy and we should avoid the filter i think if possible, but think through it"* — pointing at the `draftClassic.ts:653-668` auto-pick block that was in the deferred section.

### Verification

Read `draftClassic.ts:580-740` to understand the full `timer_expiry_classic` reducer. Read `ownershipValidation.ts` to confirm the manual-pick path already uses LMA. Greppled `draftAuction.ts` for `isActive` and `HsrAccount.user_id` — zero matches, so auction draft has no equivalent bug.

### Key findings

1. **`validateCharacterOwnership` at `ownershipValidation.ts:21-36` is the canonical pattern.** Uses `ctx.db.LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, userId])` with the explicit D-14 comment *"Check characters from LobbyMemberAccount entries only"*. The manual-pick path at `draftClassic.ts:334` correctly delegates to this helper.
2. **Same-file precedent at `draftClassic.ts:76-96`.** The `start_draft` autoRandomPick validation block already uses the correct LMA pattern. It's literally ~500 lines above the broken `timer_expiry_classic` auto-pick pool. Same author, same file, same feature — but two sites and only one was migrated during Phase 10.4.
3. **Auction draft has no similar bug.** `draftAuction.ts` doesn't use ownership pools in the same way; it uses bids.

### Filter count analysis (answering the user's "avoid the filter" ask)

| Operation | Old | New |
|---|---|---|
| Per team member | `HsrAccount.user_id.filter(memberId)` + `.find(a => a.isActive)` linear scan + `HsrAccountCharacter.hsr_account_id.filter(accountId)` | `LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, memberId])` + `HsrAccountCharacter.hsr_account_id.filter(accountId)` per LMA row |
| Total ops per member (non-tournament) | 3 ops, 1 linear scan | 2 ops, 0 linear scans |
| Total ops per member (N selected accounts) | 3 ops, 1 linear scan | `1 + N` ops, 0 linear scans |

The linear `.find(a => a.isActive)` JS scan is eliminated entirely. The over-fetching `HsrAccount.user_id.filter` (up to 5 rows) is eliminated. "Avoid the filter" wasn't literally possible (SpacetimeDB indexed reads always use `.filter`), but we achieved the spirit of it by removing the post-filter JS scan.

### Helper extraction

Considered. The pattern now appears in three sites with three different output shapes (count, Set, early-return bool). A single helper would be awkward because `validateCharacterOwnership` needs early return on first character match for performance. **Rejected — inline refactor instead**, matching the same-file style at `draftClassic.ts:76-96`.

### Behavioral corrections (items the refactor actually fixes)

- **Stand-ins:** contribute LMA-selected characters (previously contributed global `isActive` account's, which the stand-in may never have associated with this match).
- **Multi-account tournament users:** union across all selected LMA accounts (previously only their global `isActive`, which may not even be one of the tournament-locked accounts).
- **Non-tournament LMA ≠ isActive users:** pool reflects LMA selection (previously reflected `isActive`).
- **requireOwnership casual with no LMA:** empty set (previously guessed from `isActive`). Empty is more honest.

### Scope expansion justification

Phase 12.3 was originally titled "MMR Rating Snapshot". Adding D-I expands the scope to "finish Phase 10.4's LMA migration". Justified because:
- Same root cause (migration gap from Phase 10.4)
- Same read-path pattern
- ~10 line diff, no new surface area
- Converges three call sites (`validateCharacterOwnership`, `start_draft` autoRandomPick validation, `timer_expiry_classic` auto-pick pool) onto one pattern
- Avoids a single-file single-function future phase

### Decision

**D-I:** Inline refactor of `draftClassic.ts:651-668` to iterate `LobbyMemberAccount.by_lobby_and_user` per team member and union their character pools. No helper extraction. New requirement OWN-POOL-01. New integration test. Auto-pick bullet removed from `<deferred>`. Phase boundary updated to reflect the scope expansion.
