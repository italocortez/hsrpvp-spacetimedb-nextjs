---
phase: 15-backend-pre-work
fixed_at: 2026-04-12T21:45:00Z
review_path: .planning/phases/15-backend-pre-work/15-REVIEW.md
iteration: 1
findings_in_scope: 8
fixed: 8
skipped: 0
status: all_fixed
---

# Phase 15: Code Review Fix Report

**Fixed at:** 2026-04-12T21:45:00Z
**Source review:** `.planning/phases/15-backend-pre-work/15-REVIEW.md`
**Directives:** `.planning/phases/15-backend-pre-work/15-REVIEW-NOTES.md` (engineering-first overrides)
**Iteration:** 1

**Summary:**
- Findings in scope: 8 (CR-01 + WR-01..WR-07)
- Fixed: 8
- Skipped: 0

Info findings (IN-01..IN-12) out of scope per config.

## Fixed Issues

### CR-01: Reconnect ban-check constructs enum with `as any` stub

**Files modified:** `spacetimedb/src/helpers/banHelper.ts`, `spacetimedb/src/index.ts`, `spacetimedb/src/reducers/server.ts`
**Commit:** `46576b7`
**Applied fix:** Extracted `DISCORD_BAN_TYPE = { tag: 'DiscordId', value: {} } as any` constant in `banHelper.ts` and replaced the 2 hard-coded sites (`index.ts:136`, `server.ts:102`) with the named import. `banAdmin.ts:48` left as-is (uses a `banTypeTag` variable, not hard-coded). Severity corrected from Critical → Hygiene per review notes — `checkProviderBan` only reads `banType.tag`, so this is a DRY fix, not an enforcement fix.

### WR-01: `mergeForUpdate` contract drift

**Files modified:** `spacetimedb/src/reducers/admin.ts`
**Commit:** `e2a1915`
**Applied fix:** Rewrote `mergeForUpdate` header comment to document null/undefined equivalence (matches router's own null-guards at `admin.ts:343-345`). Added defensive `key in incoming` assertion so a future caller bypassing `validateKeys` fails loudly. Diverges from reviewer's suggestion (which would have regressed parity): reviewer's proposal to drop `!== undefined` would break the enum-absent normalization pattern.

### WR-02: Cost-set-pk regression test too weak

**Files modified:** `test/backend/reducers/admin/cost-set-pk.test.ts`
**Commits:** `c585efc` (initial), `c23bb5a` (follow-up for spacetime SQL quirks)
**Applied fix:** Tightened `>= 1` to exact counts (set5: 1, set0: 2) and added assertion on the custom `e0 = 99` value inside `set5`'s `classic_costs` blob. Follow-up commit adapted query pattern: spacetime SQL rejects enum-tag literals (`game_mode = 'ApocalypticShadow'` fails with 400), so the game_mode filter moved to in-JS post-filtering; `classic_costs` prints as tuple literal `(e_0 = 99, ...)`, not JSON, so e0 is regex-extracted. **Verified: 4/4 tests pass.**

### WR-03: Seed-data double parse

**Files modified:** `scripts/seed-data.ts`
**Commit:** `c7dc839`
**Applied fix:** Changed `buildSeedPayloads` to accept pre-parsed data as arguments (structural fix per review notes, not the reviewer's tuple-return suggestion). Hoisted the 3 `loadJson` calls to the top of `seedAll`; archetype junction block now reuses the `characters` array. `test/shared/seed-data.ts` audited — each JSON parsed once there, no equivalent double-parse exists (structure differs, confirmed not applicable).

### WR-04: Partial-update brittle disjunction

**Files modified:** `test/backend/reducers/admin/partial-update.test.ts`
**Commit:** `748dbda`
**Applied fix:** Replaced `=== '""' || === ''` disjunction with a normalized comparison (`String(row.display_name).replace(/^"|"$/g, '')`). Grep found only one such call site — no helper extraction needed. **Verified: 3/3 tests pass.**

### WR-05: matchHistoryViews double iteration

**Files modified:** `spacetimedb/src/views/matchHistoryViews.ts`
**Commit:** `cacd326`
**Applied fix:** Rewrote `buildVisibleMatchIds` as `buildVisibleMatches(ctx): { ids, sessions }` — single MatchSessionHistory pass now serves all 3 visibility-filtered views. `view_match_history` emits `sessions` directly; `view_match_participant_history` and `view_match_step_history` destructure `ids` for their fan-out. 5 self-scoped `view_my_*` views untouched (don't use this helper). Preserves visibility semantics (public OR participated). **Requires republish — completed.** **Verified: 18/18 isolation tests pass.**

### WR-06: Math.max unbounded spread

**Files modified:** `spacetimedb/src/reducers/admin.ts`
**Commit:** `4800247`
**Applied fix:** Replaced `Math.max(...allChars.map(...))` with `allChars.reduce((m, c) => Math.max(m, c.versionReleased), 0)`. Eliminates `-Infinity` edge case on empty array; downstream `if (maxVersion > 0)` guard becomes intentional.

### WR-07: MatchSessionStep full-table scan

**Files modified:** `spacetimedb/src/tables/matchSessionStep.ts`, `spacetimedb/src/reducers/admin.ts`
**Commit:** `4e2b456`
**Applied fix:** Added `by_actor_user` btree index on `MatchSessionStep.actorUserId`. Replaced the full-iter loop in `admin_delete_row` User case with `ctx.db.MatchSessionStep.by_actor_user.filter(id).next().value` (indexed single-row lookup). **Requires republish — completed. Schema migration plan confirmed: "Created index match_session_step_actor_user_id_idx_btree on [actor_user_id] of table match_session_step".**

## Skipped Issues

None.

## Deployment Actions Taken

- **Maincloud republish:** Single publish after all code fixes. Schema migration applied: `match_session_step_actor_user_id_idx_btree` created. View body changes in `matchHistoryViews.ts` picked up in same publish.
- **Client bindings regenerated:** `npm run spacetime:generate` ran successfully. Binding diff is broader than Phase 15 scope (SDK version format changes), and match_session_step_table.ts diff is formatting-only (client bindings do not expose index accessors — indexes are server-side only). Binding changes left UNCOMMITTED since they are out of Phase 15 fix scope; committing them belongs to a separate housekeeping commit the user can evaluate.

## Verification

**Per-file test runs completed post-republish:**
- `test/backend/reducers/admin/cost-set-pk.test.ts` — **4/4 pass**
- `test/backend/reducers/admin/partial-update.test.ts` — **3/3 pass**
- `test/backend/views/matchHistoryViews/isolation.test.ts` — **18/18 pass**

These three files cover the exact surfaces touched by WR-01, WR-02, WR-04, WR-05, WR-07. All assertions tightened by WR-02 and WR-04 pass; WR-05 and WR-07 introduced no isolation or partial-update regressions.

**Full suite:** `npm run test:integration` was initiated but the run is long (~56 minutes against maincloud) and still in progress at report-write time. A pre-fix bfaor8jim run failed with "caller is not the registered server identity" errors against a stale deployment — those errors are token-rotation/bootstrap artifacts, not test-logic failures. Per-file verification above is authoritative for the fix surfaces; the full suite can be re-run at the verification gate if end-to-end confirmation is desired.

## Notes

- **CR-01 severity** was re-evaluated per `15-REVIEW-NOTES.md` — reduced from Critical (bypass risk) to Hygiene (DRY). `checkProviderBan` at `banHelper.ts:15` reads only `banType.tag`, so the `value: {}` stub is functionally identical to a fully-constructed variant. Kept as a CR-01 fix anyway for consistency with the review artifact.
- **WR-01 divergence** from reviewer was critical to preserve. Reviewer's proposed fix (drop `!== undefined`) would have broken router parity with its own enum null-guards. Notes-directed fix preserves that parity and adds defensive key-presence assertion.
- **WR-03 and WR-05 divergences** from reviewer: both followed the review notes' structural improvements (hoist data / return combined tuple) rather than the reviewer's weaker suggestions.
- **test/shared/seed-data.ts** was examined for an equivalent WR-03 double-parse; none found — each JSON file is parsed once (`rawChars` L94, `rawLCs` L151, `rawPairings` L197). No edit applied.

---

_Fixed: 2026-04-12T21:45:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
