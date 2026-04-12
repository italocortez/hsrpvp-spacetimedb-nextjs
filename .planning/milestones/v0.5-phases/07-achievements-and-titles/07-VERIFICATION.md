---
phase: 07-achievements-and-titles
verified: 2026-03-28T06:00:00Z
status: passed
score: 12/12 must-haves verified
re_verification: false
---

# Phase 07: Achievements and Titles Verification Report

**Phase Goal:** Admins can define achievements with flexible criteria, the system auto-awards them during match finalization, TOs/admins can manually award, and players can display earned titles on their profile
**Verified:** 2026-03-28
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Achievement table has slimmed column set: id, name, description, rarity, isManualOnly, maxAwards, audit cols | VERIFIED | `spacetimedb/src/tables/achievement.ts` — exact 10-column definition confirmed, no triggerType/isOneTime/thresholdValue/characterName |
| 2 | AchievementTriggerType enum no longer exists in enums.ts | VERIFIED | `grep -c "AchievementTriggerType" enums.ts` returned 0; absent from module_bindings/types.ts |
| 3 | ComparisonOperator enum exists with all 5 variants | VERIFIED | `enums.ts` lines 162-168 — GreaterOrEqual, GreaterThan, Equal, LessThan, LessOrEqual all present |
| 4 | AchievementCriteria table exists with all specified columns and btree indexes | VERIFIED | `spacetimedb/src/tables/achievementCriteria.ts` — all columns confirmed, by_achievement and by_stat_table indexes present |
| 5 | UserAchievement table has isDisplayed removed and multi-column by_user_achievement index | VERIFIED | `spacetimedb/src/tables/userAchievement.ts` — isDisplayed absent, by_user_achievement index on [userId, achievementId] confirmed |
| 6 | Admin can create an achievement definition with all required fields | VERIFIED | `create_achievement` reducer in achievementManagement.ts — ensureAdmin guard, name/description/rarity/isManualOnly/maxAwards params, duplicate name check, real insert |
| 7 | Admin can add/remove criteria rows; rows are locked once any player has earned the achievement | VERIFIED | `add_achievement_criteria` and `remove_achievement_criteria` — both check `existingAwards.length > 0` and throw before modification |
| 8 | Admin can delete an achievement with full cascade: criteria, UserAchievement rows, User.displayedAchievementId cleared, then Achievement | VERIFIED | `delete_achievement` — 4-step cascade in exact order, all using real DB operations |
| 9 | Achievement checker auto-awards on runFinalization after stat increments (step 16.5) | VERIFIED | `finalizationHelpers.ts` line 452-456 — checkAndAwardAchievements called per participant inside step 16.5 loop after stats |
| 10 | maxAwards enforces per-user uniqueness and global cap | VERIFIED | `checkAndAwardAchievements` — by_user_achievement duplicate check + by_achievement count vs maxAwards in both auto-award and manual_award paths |
| 11 | Admin/Moderator can manually award any achievement; TournamentHost restricted to own tournament participants | VERIFIED | `manual_award_achievement` — isRoleAtLeast('Moderator') unrestricted path, isRoleAtLeast('TournamentHost') scoped to organizer_id tournaments |
| 12 | User can set/clear their displayed title; Admin can set for any user; bootstrap seeds 3 starter achievements | VERIFIED | `set_displayed_achievement` — ownership gating via effectiveUserId, earned-check on self; bootstrap seeds "MMR Elite", "Veteran", "Solar First Tournament Winner" with criteria |

**Score:** 12/12 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `spacetimedb/src/tables/achievement.ts` | Reworked Achievement table | VERIFIED | isManualOnly, maxAwards, by_rarity index; no dropped columns |
| `spacetimedb/src/tables/userAchievement.ts` | Reworked UserAchievement table | VERIFIED | by_user_achievement multi-col index, isDisplayed absent |
| `spacetimedb/src/tables/achievementCriteria.ts` | New AchievementCriteria table | VERIFIED | All criteria columns, both btree indexes, ComparisonOperator import |
| `spacetimedb/src/types/enums.ts` | ComparisonOperator added, AchievementTriggerType removed | VERIFIED | ComparisonOperator with 5 variants at lines 162-168; no AchievementTriggerType anywhere in file |
| `spacetimedb/src/schema.ts` | AchievementCriteria registered | VERIFIED | Import at line 66, registration at line 175 in Achievements section |
| `spacetimedb/src/helpers/achievementChecker.ts` | checkAndAwardAchievements helper | VERIFIED | Full implementation: getField switch map, sumField/maxField semantics, evaluateCriterion, AND logic, per-user + global cap checks |
| `spacetimedb/src/reducers/achievementManagement.ts` | All 7 achievement reducers | VERIFIED | create_achievement, update_achievement, delete_achievement, add_achievement_criteria, remove_achievement_criteria, manual_award_achievement, set_displayed_achievement — all present and substantive |
| `spacetimedb/src/helpers/finalizationHelpers.ts` | Achievement checker hooked into finalization | VERIFIED | import at line 14, call at line 455 within step 16.5 loop |
| `spacetimedb/src/index.ts` | Achievement reducer re-exports | VERIFIED | Line 27: explicit named export of all 7 reducers from achievementManagement |
| `docs/achievements/architecture.md` | Updated architecture docs | VERIFIED | Phase 07 schema, reducer reference table, auto-award pipeline, data patterns — all present |
| `scripts/post-publish.ts` | Bootstrap seeds 3 starter achievements | VERIFIED | MMR Elite (Epic, auto, MmrRating criteria), Veteran (Rare, auto, PlayerStat.wins criteria), Solar First Tournament Winner (Legendary, manual-only, maxAwards=1) |
| `src/module_bindings/achievement_criteria_table.ts` | Generated AchievementCriteria binding | VERIFIED | File exists in module_bindings |
| `src/module_bindings/achievement_table.ts` | Regenerated achievement binding | VERIFIED | isManualOnly and maxAwards present; triggerType/isOneTime absent (confirmed via grep) |
| `src/module_bindings/user_achievement_table.ts` | Regenerated user_achievement binding | VERIFIED | isDisplayed absent (confirmed via grep) |
| `src/module_bindings/types.ts` | ComparisonOperator type added, AchievementTriggerType absent | VERIFIED | ComparisonOperator found; AchievementTriggerType not found |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `achievementCriteria.ts` | `enums.ts` | `import ComparisonOperator` | WIRED | Line 2: `import { ComparisonOperator } from '../types/enums'` |
| `schema.ts` | `achievementCriteria.ts` | import and register AchievementCriteria | WIRED | Import at line 66, used in schema registration block at line 175 |
| `finalizationHelpers.ts` | `achievementChecker.ts` | import and call checkAndAwardAchievements(ctx | WIRED | Import at line 14, call at line 455 with `checkAndAwardAchievements(ctx, p.userId, actingUserId)` |
| `achievementManagement.ts` | `ensurePermissions.ts` | import permission helpers | WIRED | Imports ensureAdmin, getAuthenticatedUser, isRoleAtLeast — all used in reducers. Note: ensureTournamentHost not imported; TH permission uses isRoleAtLeast('TournamentHost') instead, which is functionally equivalent |
| `index.ts` | `achievementManagement.ts` | re-export reducers | WIRED | Line 27: explicit export of all 7 reducer names |
| `scripts/post-publish.ts` | `achievementManagement.ts` | calls create_achievement and add_achievement_criteria via client bindings | WIRED | `connection.reducers.createAchievement` and `connection.reducers.addAchievementCriteria` both called at multiple locations |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| ACHV-01 | 07-01, 07-02 | Admin can create achievement definitions with name, description, criteria type, and threshold | SATISFIED | `create_achievement` reducer with all fields; `add_achievement_criteria` for threshold/criteria; AchievementCriteria table stores flexible criteria as rows |
| ACHV-02 | 07-02 | System auto-awards achievements when conditions are met | SATISFIED | `checkAndAwardAchievements` called in finalization step 16.5; evaluates all non-manual achievements with AND criteria logic against live stat tables |
| ACHV-03 | 07-02 | Admin/TO can manually award achievements to specific players | SATISFIED | `manual_award_achievement` — Admin/Mod unrestricted, TournamentHost scoped to own tournament participants per D-21 |
| ACHV-04 | 07-01, 07-02 | User can view their collected achievements and select a title for display on profile | SATISFIED | UserAchievement table public (clients can subscribe); `set_displayed_achievement` sets User.displayedAchievementId; user must have earned the achievement |

No orphaned requirements for Phase 7. All 4 ACHV requirements mapped and satisfied.

---

### Anti-Patterns Found

No blockers or warnings found.

| File | Pattern | Severity | Notes |
|------|---------|----------|-------|
| All reviewed files | No TODO/FIXME/placeholder markers | — | Clean |
| `achievementChecker.ts` | `iter()` on Achievement table | INFO | Deliberate design choice per code comment: "admin-managed content <100 rows" — not a stub |

---

### Human Verification Required

#### 1. Post-publish bootstrap execution

**Test:** Run `npx tsx scripts/post-publish.ts` against a fresh maincloud deployment
**Expected:** All 3 achievements created with criteria in the live database; no TypeScript/connection errors
**Why human:** Cannot run live DB operations in static verification. Summary documents publish succeeded but bootstrap invocation must be verified against live data.

#### 2. Achievement auto-award end-to-end

**Test:** Run a full match finalization through `finalize_match_result`; verify `user_achievement` rows are inserted for players who cross any criteria threshold
**Expected:** A player with `wins >= 10` receives the "Veteran" achievement row automatically; UserAchievement row visible via `spacetime sql`
**Why human:** Requires live match state, stat rows, and a full finalization cycle.

#### 3. TournamentHost manual award scope enforcement

**Test:** As a TournamentHost, call `manual_award_achievement` targeting a user who is NOT a participant in any of the TO's tournaments
**Expected:** SenderError: "Forbidden: Target user is not a participant in your tournaments."
**Why human:** Requires live identity with TournamentHost role and cross-tournament participant lookup.

---

### Gaps Summary

No gaps. All 12 must-haves verified across both plan waves. The phase goal is fully achieved:

- Schema foundation (07-01): Achievement, UserAchievement, AchievementCriteria tables correctly defined, ComparisonOperator enum added, AchievementTriggerType dropped, module published, bindings regenerated.
- Reducers and pipeline (07-02): All 7 reducers substantive with real permission/validation/DB logic, criteria-driven auto-award hooked into finalization at step 16.5, full cascade deletion, tiered manual award permissions, bootstrap seeding for 3 starter achievements, architecture docs updated.
- One implementation deviation is noted (using `isRoleAtLeast` instead of `ensureTournamentHost` import in `manual_award_achievement`) — this is functionally correct and not a gap.

---

_Verified: 2026-03-28T06:00:00Z_
_Verifier: Claude (gsd-verifier)_
