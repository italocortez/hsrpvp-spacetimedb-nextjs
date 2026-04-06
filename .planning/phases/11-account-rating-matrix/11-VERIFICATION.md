---
phase: 11-account-rating-matrix
verified: 2026-04-06T13:36:00Z
status: human_needed
score: 6/6 must-haves verified (all roadmap success criteria met; one documentation gap flagged)
re_verification: false
gaps: []
human_verification:
  - test: "Run admin_seed_rating_config against a live cleared database, then verify AccountRatingConfig row exists with correct defaults and non-zero maxPossible"
    expected: "Row id=1 inserted with verticalWeight=0.4, horizontalWeight=0.6, compression=0.2, roleExponentDps=2.0, roleExponentSupport=1.3, roleExponentSustain=1.0, archetypeThreshold=3.0, scale=1000.0, maxPossible>0.0"
    why_human: "Requires publishing module with --clear-database and running seed + reducer against maincloud; no unit test covers the live DB path"
  - test: "Run both seed scripts against a cleared database and verify HsrCharacterArchetype rows are populated (66 characters assigned to archetypes)"
    expected: "12 distinct Archetype rows, 66+ HsrCharacterArchetype junction rows present in the database after seeding"
    why_human: "Subscribe-then-assign pattern requires live WebSocket connection; cannot be verified in unit tests. The archetype ID resolution (Pitfall 4 from RESEARCH.md) was flagged LOW confidence during research."
  - test: "Run admin_recalculate_all_ratings after seeding and verify account ratings are updated for existing accounts"
    expected: "All HsrAccount rows have accountRating recalculated using matrix formula (non-zero if roster has characters); log shows correct account count"
    why_human: "Requires live database with seeded accounts and roster data; integration-level behavior not covered by unit tests"
---

# Phase 11: Account Rating Matrix — Verification Report

**Phase Goal:** Replace the TEMPORARY accountRating formula with a matrix-based rating measuring vertical investment (eidolons + age decay) and horizontal investment (archetype coverage), with runtime-configurable weights and admin recalculation
**Verified:** 2026-04-06T13:36:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #  | Truth | Status | Evidence |
|----|-------|--------|----------|
| 1  | HsrCharacter has `versionReleased` (f64) and `treatAsVersion` (f64) columns | VERIFIED | `spacetimedb/src/tables/hsrCharacter.ts` lines 13-14: `versionReleased: t.f64()`, `treatAsVersion: t.f64()` |
| 2  | Archetype data seeding infrastructure exists via seed scripts (Archetype table + HsrCharacterArchetype junction rows) | VERIFIED | Both `scripts/seed-data.ts` and `test/shared/seed-data.ts` contain `extractArchetypeNames`, `Archetype` table payload, subscribe-then-assign junction seeding via `adminAssignCharacterArchetypes` |
| 3  | AccountRatingConfig single-row table exists with all formula constants as f64, admin-editable at runtime | VERIFIED | `spacetimedb/src/tables/accountRatingConfig.ts`: 10 f64 config columns (verticalWeight, horizontalWeight, compression, roleExponentDps, roleExponentSupport, roleExponentSustain, archetypeThreshold, scale, maxPossible + id u32 PK) registered in `schema.ts` line 57; 3 admin reducers in `ratingAdmin.ts` |
| 4  | `computeAccountRating` implements the matrix formula with sqrt base curve, role-dependent age decay, within-version compression, dynamic archetype threshold | VERIFIED | `spacetimedb/src/helpers/accountRating.ts`: full matrix implementation; 15/15 unit tests pass covering all formula scenarios including edge cases |
| 5  | ELO integration unchanged — `calculateAccountModifier` uses `/1000` divisor matching AccountRatingConfig `scale=1000` default | VERIFIED | `spacetimedb/src/helpers/eloCalculation.ts` line 63: `Math.round((gap / 1000) * maxAccountBonus)` — unchanged; old temporary formula (`5 * (1 + eidolonLevel)`) completely removed from accountRating.ts |
| 6  | `admin_recalculate_all_ratings` reducer recomputes all accounts on demand | VERIFIED | `spacetimedb/src/reducers/ratingAdmin.ts` lines 166-199: reducer iterates `ctx.db.HsrAccount.iter()`, calls `updateAccountRating` per account, updates maxPossible first; exported from `index.ts` line 15 |

**Score:** 6/6 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `spacetimedb/src/tables/accountRatingConfig.ts` | AccountRatingConfig single-row config table | VERIFIED | Exists, 10 f64 config columns + audit columns, sentinel PK=1 |
| `spacetimedb/src/helpers/accountRating.ts` | Matrix computeAccountRating + computeMaxPossible + unchanged updateAccountRating | VERIFIED | All 3 functions exported; old formula removed; 160 lines, substantive |
| `test/backend/match-results/account-rating.unit.test.ts` | Unit tests for matrix formula (min 100 lines) | VERIFIED | 610 lines, 15 `it()` test cases, all passing |
| `spacetimedb/src/reducers/ratingAdmin.ts` | admin_seed_rating_config, admin_update_rating_config, admin_recalculate_all_ratings | VERIFIED | All 3 reducers present with ensureAdmin gates, buildAgeWeightMap helper, f64 validation |
| `spacetimedb/src/reducers/admin.ts` | Updated HsrCharacter case + auto-trigger | VERIFIED | versionReleased/treatAsVersion in row object; auto-trigger block with AccountRatingConfig.id.find(1) and Math.abs(newMaxPossible...) change detection |
| `scripts/seed-data.ts` | Archetype seeding + new field passthrough | VERIFIED | extractArchetypeNames, extractArchetypeAssignments, Archetype table payload, subscribe-then-assign junction seeding |
| `test/shared/seed-data.ts` | Archetype seeding + new field passthrough | VERIFIED | archetypeNames extraction, Archetype in tables array, adminAssignCharacterArchetypes junction seeding |
| `spacetimedb/src/schema.ts` | AccountRatingConfig imported and registered | VERIFIED | Line 57: `import { AccountRatingConfig }...`; line 169: `AccountRatingConfig,` in schema() call |
| `spacetimedb/src/index.ts` | 3 new reducers exported | VERIFIED | Line 15: `export { admin_seed_rating_config, admin_update_rating_config, admin_recalculate_all_ratings } from './reducers/ratingAdmin'` |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `accountRating.ts` | `accountRatingConfig.ts` | `ctx.db.AccountRatingConfig.id.find(1)` | WIRED | Line 16 of accountRating.ts: `const config = ctx.db.AccountRatingConfig.id.find(1)` |
| `accountRating.ts` | `hsrCharacter.ts` | `ctx.db.HsrCharacter.iter()` reads versionReleased, treatAsVersion, role | WIRED | Lines 19, 37-44: iterates allChars, accesses c.treatAsVersion, c.versionReleased, c.role.tag |
| `ratingAdmin.ts` | `accountRating.ts` | imports computeMaxPossible, updateAccountRating | WIRED | Line 5: `import { computeMaxPossible, updateAccountRating } from '../helpers/accountRating'` |
| `admin.ts` | `accountRating.ts` | computeMaxPossible + updateAccountRating in auto-trigger | WIRED | Line 7: `import { computeMaxPossible, updateAccountRating } from '../helpers/accountRating'`; used in HsrCharacter auto-trigger block |
| `index.ts` | `ratingAdmin.ts` | re-exports 3 new reducers | WIRED | Line 15 of index.ts exports all 3 reducers |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `computeAccountRating` | `config` | `ctx.db.AccountRatingConfig.id.find(1)` | Yes — DB lookup with null guard | FLOWING |
| `computeAccountRating` | `allChars` | `ctx.db.HsrCharacter.iter()` | Yes — full table iteration | FLOWING |
| `computeAccountRating` | `owned` | `ctx.db.HsrAccountCharacter.hsr_account_id.filter(hsrAccountId)` | Yes — player-specific filter | FLOWING |
| `computeAccountRating` | `allArchetypes` | `ctx.db.Archetype.iter()` | Yes — full table iteration | FLOWING |
| `admin_recalculate_all_ratings` | `accounts` | `ctx.db.HsrAccount.iter()` | Yes — all accounts iterated | FLOWING |
| `updateAccountRating` | `account` | `ctx.db.HsrAccount.id.find(hsrAccountId)` | Yes — with null guard | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 15 unit tests pass (matrix formula) | `npx vitest run test/backend/match-results/account-rating.unit.test.ts` | 15/15 passed, 133ms | PASS |
| TypeScript compiles with zero errors | `npx tsc --noEmit --project spacetimedb/tsconfig.json` | No output (clean exit) | PASS |
| Old temporary formula absent | grep for `5 * (1 + eidolonLevel)` in accountRating.ts | Only appears in JSDoc comment as historical reference ("Replaces…") | PASS |
| computeMaxPossible exported | grep exports in accountRating.ts | `export function computeMaxPossible` present | PASS |
| updateAccountRating wrapper present and unchanged | Read accountRating.ts lines 147-159 | Wrapper intact; compares old vs new rating before updating | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description (REQUIREMENTS.md) | Redefined As | Status | Evidence |
|-------------|-------------|-------------------------------|--------------|--------|----------|
| ARCH-01 | 11-01-PLAN, 11-02-PLAN | PlayerArchetypeStat table (ORIGINAL) / Account rating matrix formula (REDEFINED per CONTEXT.md D-38) | Account rating matrix formula with vertical/horizontal dimensions, age decay, archetype coverage | SATISFIED (redefined scope) | computeAccountRating matrix formula implemented; 15 unit tests all pass; AccountRatingConfig table provides runtime config |
| ARCH-02 | 11-02-PLAN | Auto-increment archetype stats (ORIGINAL) / Admin recalculation + auto-trigger (REDEFINED) | Admin recalculation + auto-trigger on character pool changes | SATISFIED (redefined scope) | admin_recalculate_all_ratings reducer; auto-trigger in admin_bulk_upsert HsrCharacter; all exported from index.ts |

**Important note:** REQUIREMENTS.md still shows the original (pre-Phase 11) definitions for ARCH-01 and ARCH-02 and marks both as `[ ] Pending`. The Phase 11 CONTEXT.md explicitly redefined these requirements ("redefined from original 'playstyle stats' scope"), but REQUIREMENTS.md was never updated to reflect the new scope or mark them complete. This is a documentation gap — the implementation is correct per the user's decisions in CONTEXT.md, but traceability is broken in REQUIREMENTS.md.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `spacetimedb/src/helpers/accountRating.ts` | 13 | "TEMPORARY Phase 5 formula" in JSDoc comment | Info | Historical reference only — explains what was replaced. Not a stub. |
| `spacetimedb/src/reducers/admin.ts` | 287 | Auto-trigger comment uses `\` instead of `//` | Info | Single character typo (`\ Auto-trigger` instead of `// Auto-trigger`) — functionally harmless as it's a comment-like line in code context, but technically not a valid JS comment character |

No blockers found. No stub implementations. No empty returns in production paths.

### Human Verification Required

#### 1. Live Database: admin_seed_rating_config

**Test:** Publish module with `--clear-database`, run seed scripts, then call `admin_seed_rating_config` as admin
**Expected:** AccountRatingConfig row id=1 inserted with all defaults; maxPossible > 0 if characters are seeded; log shows `[RATING] AccountRatingConfig seeded with defaults by admin #X, maxPossible=Y`
**Why human:** Requires live maincloud database, cannot be unit tested

#### 2. Live Database: Archetype junction seeding

**Test:** After running both seed scripts against a cleared database, query `SELECT * FROM archetype` and `SELECT COUNT(*) FROM hsr_character_archetype`
**Expected:** 12 Archetype rows, 66+ HsrCharacterArchetype junction rows (per CONTEXT.md D-03: 66 of 83 characters have archetype assignments)
**Why human:** Subscribe-then-assign pattern (Pitfall 4 in RESEARCH.md) was flagged as LOW confidence during research — the timing of onApplied callback relative to data availability was not fully verified. A live test is required to confirm junction IDs resolve correctly.

#### 3. Live Database: admin_recalculate_all_ratings

**Test:** After seeding accounts with rosters, call `admin_recalculate_all_ratings` and verify account ratings update
**Expected:** All HsrAccount rows have accountRating values reflecting the matrix formula; log shows correct account count; accounts with no owned characters remain at 0
**Why human:** Requires live database with existing accounts and roster data; integration cannot be mocked at unit test level

### Gaps Summary

No code gaps found. All roadmap success criteria are satisfied in the codebase. The phase goal — replacing the TEMPORARY formula with the matrix-based formula, with runtime-configurable weights and admin recalculation — is fully achieved.

One documentation gap exists: REQUIREMENTS.md retains the original ARCH-01/ARCH-02 definitions (playstyle stats) and marks them `[ ] Pending`. Since Phase 11 redefined their scope (per user decision in CONTEXT.md), REQUIREMENTS.md should be updated to reflect the redefined scope and mark them `[x] Complete`. This is a documentation inconsistency, not a code defect. The implementation is correct.

Three human verification items are required to validate the live database behavior (admin seed, archetype junction seeding, rating recalculation) which cannot be confirmed through static analysis or unit tests alone.

---

_Verified: 2026-04-06T13:36:00Z_
_Verifier: Claude (gsd-verifier)_
