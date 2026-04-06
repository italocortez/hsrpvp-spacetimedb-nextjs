# Phase 11: Account Rating Matrix - Research

**Researched:** 2026-04-06
**Domain:** SpacetimeDB backend (TypeScript module) -- formula replacement, table schema, seed scripts
**Confidence:** HIGH

## Summary

Phase 11 replaces the temporary account rating formula (Phase 5) with a matrix-based rating measuring vertical investment (eidolon depth with age decay) and horizontal investment (archetype coverage). The scope is well-defined: add two columns to HsrCharacter, create AccountRatingConfig single-row table, rewrite `computeAccountRating`, update seed scripts to handle archetype data, and add an admin recalculation reducer.

The data files are already prepared (`characters_table.json` has `archetype`, `version_released`, `treat_as_version` fields on all 83 characters). The Archetype and HsrCharacterArchetype tables already exist in the schema. The existing `updateAccountRating` wrapper and its 4 call sites (batch_upsert_characters, batch_remove_characters, and admin variants) remain unchanged -- only the inner `computeAccountRating` function changes.

**Primary recommendation:** Structure work as: (1) schema + config table, (2) formula rewrite with unit tests, (3) seed script updates, (4) admin recalculation reducer + auto-trigger on bulk upsert. All changes are backend-only. Requires `--clear-database` publish.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01 through D-42 are locked implementation decisions covering:
  - Data file changes (D-01 to D-03): characters_table.json already updated with archetype/version_released/treat_as_version
  - HsrCharacter schema (D-04 to D-06): versionReleased (f64) + treatAsVersion (f64) columns
  - Archetype seeding (D-07 to D-08): Use admin_bulk_upsert for Archetype, admin_assign_character_archetypes for junction rows
  - AccountRatingConfig table (D-09 to D-11b): Single-row config with f64 columns, admin reducer pattern
  - Rating formula (D-12 to D-27): sqrt base, role-dependent age decay, within-version compression, maxPossible normalization
  - MMR/ELO integration (D-28 to D-30): No ELO code changes needed -- scale=1000 matches existing hardcoded divisor
  - Recalculation triggers (D-31 to D-33b): Per-account on character mutations, bulk on admin command, auto on maxPossible change
  - Seed script changes (D-34 to D-37): Both scripts updated, EXPECTED_KEYS updated, admin_bulk_upsert HsrCharacter case updated
  - Scope boundaries (D-38 to D-42): No playstyle stats, no leaderboard, no client work, --clear-database required, existing tests need rewriting

### Claude's Discretion
No discretion areas specified -- all decisions are locked.

### Deferred Ideas (OUT OF SCOPE)
- GlobalArchetypeStat table for community-level archetype meta analysis
- Per-match archetype tracking (original Phase 11 "playstyle stats" concept)
- Archetype leaderboard / ranking system
- Per-gameMode rating variants (different formula weights per game mode)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ARCH-01 (redefined) | Account rating matrix formula with vertical/horizontal dimensions, age decay, archetype coverage | D-12 through D-27 define the complete formula. computeAccountRating rewrite in accountRating.ts. AccountRatingConfig table provides runtime tuning. |
| ARCH-02 (redefined) | Admin recalculation + auto-trigger on character pool changes | D-31 through D-33b define triggers. admin_recalculate_all_ratings reducer + auto-trigger in admin_bulk_upsert HsrCharacter case. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spacetimedb/server | (project-local) | SpacetimeDB TypeScript module SDK | Project standard -- all backend tables/reducers use this [VERIFIED: codebase] |
| vitest | (project-local) | Unit test framework | Project standard -- existing account-rating.unit.test.ts uses vitest [VERIFIED: codebase] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none new) | -- | -- | No new dependencies needed. All work uses existing project infrastructure. |

**No new packages required.** This phase modifies existing files and adds one new table definition. All dependencies are already installed.

## Architecture Patterns

### Relevant File Structure
```
spacetimedb/src/
  tables/
    hsrCharacter.ts         # ADD versionReleased + treatAsVersion columns
    archetype.ts            # EXISTS - no changes
    hsrCharacterArchetype.ts # EXISTS - no changes
    hsrAccount.ts           # EXISTS - accountRating column already present (u32)
    accountRatingConfig.ts  # NEW - single-row config table
  helpers/
    accountRating.ts        # REWRITE computeAccountRating, keep updateAccountRating wrapper
  reducers/
    admin.ts                # MODIFY admin_bulk_upsert HsrCharacter case (new columns + auto-trigger)
    rosterAdmin.ts          # MODIFY - add admin_recalculate_all_ratings reducer
    eloAdmin.ts             # NO CHANGES (reference for config table pattern)
  index.ts                  # MODIFY - export new reducer(s)
scripts/
  seed-data.ts              # MODIFY normalizeCharacters + archetype seeding step
test/
  shared/seed-data.ts       # MODIFY character normalization + archetype seeding
  backend/match-results/
    account-rating.unit.test.ts  # REWRITE for new formula
  data/
    characters_table.json   # ALREADY UPDATED with archetype + version_released
```

### Pattern 1: Single-Row Config Table (EloConfig precedent)
**What:** Table with PK id=1, admin seed reducer, admin update reducer
**When to use:** Runtime-configurable constants
**Example:**
```typescript
// Source: spacetimedb/src/tables/eloConfig.ts [VERIFIED: codebase]
export const accountRatingConfigColumns = {
    id: t.u32().primaryKey(),  // Sentinel PK, always 1
    verticalWeight: t.f64(),
    horizontalWeight: t.f64(),
    // ... all f64 columns per D-10
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
```

### Pattern 2: EXPECTED_KEYS Extension for admin_bulk_upsert
**What:** When adding columns to HsrCharacter, EXPECTED_KEYS must be updated to include new field names
**When to use:** Any schema addition to bulk-upserted tables
**Example:**
```typescript
// Source: spacetimedb/src/reducers/admin.ts [VERIFIED: codebase]
// EXPECTED_KEYS automatically derived from column definitions:
const EXPECTED_KEYS: Record<string, string[]> = {
    HsrCharacter: Object.keys(hsrCharacterColumns).filter(k => !AUDIT_KEYS.has(k)),
    // Adding versionReleased + treatAsVersion to hsrCharacterColumns
    // automatically extends EXPECTED_KEYS -- no manual change needed
};
```

### Pattern 3: updateAccountRating Wrapper
**What:** The existing wrapper pattern -- compute new rating, compare to old, update if changed
**When to use:** Keeping the same call sites while replacing the inner formula
**Example:**
```typescript
// Source: spacetimedb/src/helpers/accountRating.ts [VERIFIED: codebase]
// updateAccountRating() wrapper stays the same.
// computeAccountRating() is the ONLY function that needs rewriting.
// 4 call sites (roster.ts x2, rosterAdmin.ts x2) remain unchanged.
```

### Pattern 4: Admin Reducer for Bulk Recalculation
**What:** Admin-only reducer that iterates all HsrAccount rows and recomputes ratings
**When to use:** After config changes or data corrections
**Example:**
```typescript
// Pattern from admin_bulk_upsert [VERIFIED: codebase]
// admin_recalculate_all_ratings: ensureAdmin, iterate HsrAccount, 
// call updateAccountRating for each, log count
```

### Anti-Patterns to Avoid
- **Modifying calculateAccountModifier in eloCalculation.ts:** Per D-28/D-29, no ELO code changes needed. Scale=1000 is the same as the hardcoded divisor.
- **Using t.u32() for config columns:** Per D-10, all AccountRatingConfig columns are f64 (except id which is u32 PK).
- **Calling admin_recalculate_all_ratings from within admin_assign/remove_character_archetypes:** Per D-33b, archetype assignment changes do NOT auto-trigger recalculation.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Config table pattern | Custom init logic | Copy EloConfig seed+update pattern | Proven pattern, consistent admin UX |
| Archetype seeding | Manual SQL inserts | admin_bulk_upsert('Archetype') + admin_assign_character_archetypes | Both reducers already exist [VERIFIED: codebase] |
| Key validation for new columns | Custom validation | EXPECTED_KEYS auto-derives from column defs | Adding columns to hsrCharacterColumns auto-extends validation |

## Common Pitfalls

### Pitfall 1: Division by Zero in maxPossible
**What goes wrong:** If no HsrCharacter rows exist (empty database), maxPossible = 0 and the normalization divides by zero.
**Why it happens:** computeAccountRating runs before seed data is loaded.
**How to avoid:** Guard: if maxPossible === 0, return 0. Also guard empty character pool in age weight calculation (max_version = 0).
**Warning signs:** NaN or Infinity in accountRating values.

### Pitfall 2: f64 Precision in SpacetimeDB
**What goes wrong:** SpacetimeDB f64 columns may have floating-point precision issues affecting Math.round().
**Why it happens:** IEEE 754 double precision with accumulated operations.
**How to avoid:** The formula outputs Math.round() at the very end (D-12), storing as u32. Intermediate calculations stay f64. No precision issue since final output is integer.
**Warning signs:** accountRating values off by 1 from expected.

### Pitfall 3: max_version Must Be Dynamic
**What goes wrong:** Hardcoding max_version or computing it once at module load breaks when new characters are added.
**Why it happens:** Developer optimization attempt -- computing max once instead of per call.
**How to avoid:** Per D-16, compute max_version from HsrCharacter rows every time computeAccountRating runs. At 83 rows this is trivial.
**Warning signs:** New characters have no effect on existing ratings.

### Pitfall 4: Archetype Seeding Order Dependency
**What goes wrong:** admin_assign_character_archetypes needs archetypeId (u32), but after admin_bulk_upsert('Archetype'), IDs are auto-incremented and unknown to the seed script.
**Why it happens:** Archetype table uses autoInc PK -- IDs are assigned server-side.
**How to avoid:** Per D-07, seed script must subscribe to Archetype table after seeding to resolve name-to-id mapping before seeding junction rows. This requires a subscription-then-query pattern in the seed script.
**Warning signs:** "Archetype not found" errors during junction seeding.

### Pitfall 5: EXPECTED_KEYS Already Auto-Derives
**What goes wrong:** Developer manually adds keys to EXPECTED_KEYS for HsrCharacter.
**Why it happens:** Not realizing EXPECTED_KEYS uses Object.keys(hsrCharacterColumns).
**How to avoid:** Adding versionReleased + treatAsVersion to hsrCharacterColumns automatically extends EXPECTED_KEYS. The only manual change is in admin_bulk_upsert's HsrCharacter case where the row object is constructed.
**Warning signs:** Duplicate key definitions, out-of-sync validation.

### Pitfall 6: Characters Without Archetypes in Horizontal Score
**What goes wrong:** Characters with empty archetype arrays (17 of 83) are accidentally counted in horizontal calculation.
**Why it happens:** Not filtering by archetype membership.
**How to avoid:** Per D-20, characters without archetypes contribute to vertical only. The horizontal formula (D-21) naturally handles this -- it iterates archetypes, not characters. A character with no archetypes simply never appears in any archetype group.
**Warning signs:** Horizontal score inflated for accounts with many non-archetyped characters.

### Pitfall 7: admin_bulk_upsert Auto-Trigger Infinite Loop
**What goes wrong:** admin_recalculate_all_ratings triggers inside admin_bulk_upsert, which itself modifies data, potentially causing re-entry.
**Why it happens:** Recompute maxPossible + recalculate all is inlined in the HsrCharacter upsert case.
**How to avoid:** The auto-trigger only fires when maxPossible changes (D-33). It calls updateAccountRating directly (a helper, not a reducer), so there is no re-entrant reducer call. Keep the recalculation as direct function calls, not reducer dispatch.
**Warning signs:** Stack overflow or timeout during character seeding.

## Code Examples

### computeAccountRating Rewrite (core formula)
```typescript
// Source: D-12 through D-27 from CONTEXT.md [VERIFIED: user decisions]
export function computeAccountRating(ctx: any, hsrAccountId: number): number {
    const config = ctx.db.AccountRatingConfig.id.find(1);
    if (!config) return 0;

    // Gather all HsrCharacter rows (game data, not player-owned)
    const allChars = [...ctx.db.HsrCharacter.iter()];
    if (allChars.length === 0) return 0;

    // Dynamic max_version (D-16)
    const maxVersion = Math.max(...allChars.map((c: any) => c.versionReleased));
    if (maxVersion === 0) return 0;

    // Role exponent map (D-14)
    const roleExponent: Record<string, number> = {
        Dps: config.roleExponentDps,
        Support: config.roleExponentSupport,
        Sustain: config.roleExponentSustain,
    };

    // Pre-compute age weight for every character in the game
    const ageWeightMap = new Map<string, number>();
    for (const c of allChars) {
        const version = c.treatAsVersion > 0 ? c.treatAsVersion : c.versionReleased;
        const major = Math.floor(version);
        const frac = version - major;
        const effective = major + frac * config.compression;
        const baseWeight = Math.sqrt(effective / maxVersion);
        const exp = roleExponent[c.role.tag] ?? 1.0;
        ageWeightMap.set(c.name, Math.pow(baseWeight, exp));
    }

    // Player's owned characters
    const owned = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(hsrAccountId)];
    if (owned.length === 0) return 0;

    // Vertical score (D-17 to D-20): average depth per owned character
    let verticalSum = 0;
    for (const oc of owned) {
        const aw = ageWeightMap.get(oc.characterName) ?? 0;
        verticalSum += ((1 + oc.eidolonLevel) / 7) * aw;
    }
    const vertical = verticalSum / owned.length;

    // Horizontal score (D-21 to D-24): archetype coverage
    const allArchetypes = [...ctx.db.Archetype.iter()];
    if (allArchetypes.length === 0) return Math.round(
        (vertical * config.verticalWeight / computeMaxPossible(ctx, config, ageWeightMap, allChars, allArchetypes)) * config.scale
    );

    const ownedNames = new Set(owned.map((o: any) => o.characterName));
    let horizontalSum = 0;
    for (const arch of allArchetypes) {
        const junctions = [...ctx.db.HsrCharacterArchetype.archetype_id.filter(arch.id)];
        const archSize = junctions.length;
        const threshold = Math.min(config.archetypeThreshold, archSize);
        if (threshold === 0) continue;
        let ownershipSum = 0;
        for (const j of junctions) {
            if (ownedNames.has(j.characterName)) {
                ownershipSum += ageWeightMap.get(j.characterName) ?? 0;
            }
        }
        horizontalSum += Math.min(ownershipSum / threshold, 1.0);
    }
    const horizontal = allArchetypes.length > 0 ? horizontalSum / allArchetypes.length : 0;

    // Combined + normalize (D-26)
    const combined = vertical * config.verticalWeight + horizontal * config.horizontalWeight;
    if (config.maxPossible <= 0) return 0;
    return Math.round((combined / config.maxPossible) * config.scale);
}
```

### computeMaxPossible (for auto-computation, D-11b)
```typescript
// Source: D-11b, D-26b from CONTEXT.md [VERIFIED: user decisions]
// Hypothetical account owning ALL chars at E6
export function computeMaxPossible(
    ctx: any, config: any,
    ageWeightMap: Map<string, number>,
    allChars: any[], allArchetypes: any[]
): number {
    // Vertical: all chars at E6 -> (1+6)/7 = 1.0 per char, weighted by age
    let verticalSum = 0;
    for (const c of allChars) {
        verticalSum += (7 / 7) * (ageWeightMap.get(c.name) ?? 0);
    }
    const vertical = allChars.length > 0 ? verticalSum / allChars.length : 0;

    // Horizontal: all chars owned at max eidolon
    let horizontalSum = 0;
    for (const arch of allArchetypes) {
        const junctions = [...ctx.db.HsrCharacterArchetype.archetype_id.filter(arch.id)];
        const archSize = junctions.length;
        const threshold = Math.min(config.archetypeThreshold, archSize);
        if (threshold === 0) continue;
        let ownershipSum = 0;
        for (const j of junctions) {
            ownershipSum += ageWeightMap.get(j.characterName) ?? 0;
        }
        horizontalSum += Math.min(ownershipSum / threshold, 1.0);
    }
    const horizontal = allArchetypes.length > 0 ? horizontalSum / allArchetypes.length : 0;

    return vertical * config.verticalWeight + horizontal * config.horizontalWeight;
}
```

### AccountRatingConfig Table Definition
```typescript
// Source: D-09, D-10 from CONTEXT.md [VERIFIED: user decisions]
import { table, t } from 'spacetimedb/server';

export const accountRatingConfigColumns = {
    id: t.u32().primaryKey(),
    verticalWeight: t.f64(),
    horizontalWeight: t.f64(),
    compression: t.f64(),
    roleExponentDps: t.f64(),
    roleExponentSupport: t.f64(),
    roleExponentSustain: t.f64(),
    archetypeThreshold: t.f64(),
    scale: t.f64(),
    maxPossible: t.f64(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const AccountRatingConfig = table({
    name: 'account_rating_config',
    public: true,
}, accountRatingConfigColumns);
```

### Seed Script Archetype Seeding Pattern
```typescript
// Source: D-07, D-35 from CONTEXT.md + existing seed-data.ts pattern [VERIFIED: codebase]
// Step 1: Extract unique archetype names from JSON
const archetypeNames = [...new Set(rawChars.flatMap((c: any) => c.archetype || []))];

// Step 2: Seed Archetype table via admin_bulk_upsert
conn.reducers.adminBulkUpsert({
    tableName: 'Archetype',
    jsonData: JSON.stringify(archetypeNames.map(name => ({ name, description: '' }))),
});

// Step 3: Subscribe to Archetype table to get IDs
// (Need to resolve name -> id after server assigns autoInc IDs)

// Step 4: For each character with archetypes, call admin_assign_character_archetypes
// with resolved archetype IDs
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| TEMPORARY formula: 5*(1+eidolonLevel), cap 1000 | Matrix formula: vertical*0.4 + horizontal*0.6, normalized by maxPossible | Phase 11 | accountRating values will change for all existing accounts |
| No age decay, no archetype awareness | sqrt base curve with role-dependent decay + archetype coverage | Phase 11 | Breadth-dominant: F2P veterans with diverse rosters score higher than narrow whales |

**Deprecated/outdated:**
- The temporary formula in accountRating.ts (Phase 5, D-69 in STATE.md) is being replaced entirely

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (project-local) |
| Config file | test/vitest.config.ts |
| Quick run command | `npm test -- --testPathPattern account-rating` |
| Full suite command | `npm test` (unit tests only) |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ARCH-01 | computeAccountRating returns correct ratings for various scenarios | unit | `npm test -- test/backend/match-results/account-rating.unit.test.ts` | Yes (needs REWRITE) |
| ARCH-01 | Empty roster returns 0 | unit | same file | Yes (needs REWRITE) |
| ARCH-01 | Characters without archetypes contribute to vertical only | unit | same file | No (add test case) |
| ARCH-01 | Age decay applies role-dependent exponents | unit | same file | No (add test case) |
| ARCH-01 | Within-version compression works correctly | unit | same file | No (add test case) |
| ARCH-01 | Dynamic archetype threshold (Elation=2 case) | unit | same file | No (add test case) |
| ARCH-01 | maxPossible normalization produces scale output for all-E6 | unit | same file | No (add test case) |
| ARCH-01 | treatAsVersion overrides versionReleased | unit | same file | No (add test case) |
| ARCH-02 | computeMaxPossible returns expected value | unit | same file | No (add test case) |
| ARCH-02 | admin_recalculate_all_ratings iterates all accounts | integration | manual (requires live DB) | No |

### Sampling Rate
- **Per task commit:** `npm test -- test/backend/match-results/account-rating.unit.test.ts`
- **Per wave merge:** `npm test`
- **Phase gate:** `npm run test:all` (unit + integration green)

### Wave 0 Gaps
- [ ] `test/backend/match-results/account-rating.unit.test.ts` -- REWRITE: existing tests test the old formula, all must be replaced with new formula tests
- [ ] Mock ctx must be extended to include HsrCharacter.iter(), Archetype.iter(), HsrCharacterArchetype.archetype_id.filter(), AccountRatingConfig.id.find()

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | -- |
| V3 Session Management | no | -- |
| V4 Access Control | yes | ensureAdmin() gate on config/recalculation reducers [VERIFIED: codebase pattern] |
| V5 Input Validation | yes | f64 range validation on config update, validateKeys for bulk upsert |
| V6 Cryptography | no | -- |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Admin config manipulation | Elevation of Privilege | ensureAdmin() on all config reducers [VERIFIED: existing pattern] |
| Invalid f64 config values (NaN, Infinity, negative) | Tampering | Validate config values in admin_update_rating_config reducer |
| Bulk recalculation DoS | Denial of Service | Admin-only access; 300 accounts at current scale is trivial [D-32] |

## Assumptions Log

> List all claims tagged [ASSUMED] in this research.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Seed script can subscribe to Archetype table after admin_bulk_upsert to resolve name-to-id mappings | Pitfall 4 / Code Examples | HIGH -- if subscription does not return data before junction seeding, archetype assignments will fail. Mitigation: add a wait/callback after subscription confirms data. |

**All other claims were verified against the codebase or derive directly from locked user decisions (D-01 through D-42).**

## Open Questions (RESOLVED)

1. **Seed script subscription pattern for Archetype ID resolution** [RESOLVED]
   - What we know: admin_bulk_upsert('Archetype') assigns autoInc IDs server-side. The seed script needs those IDs to call admin_assign_character_archetypes.
   - What's unclear: The exact subscription/callback pattern to wait for Archetype rows after seeding. The existing seed scripts (scripts/seed-data.ts, test/shared/seed-data.ts) do not subscribe to any tables -- they fire-and-forget reducers.
   - Recommendation: After seeding Archetype rows, subscribe to the Archetype table, wait for onApplied callback with rows, build name-to-id map, then seed junction rows. Alternatively, use a 2-pass approach: seed archetypes first, disconnect, reconnect with subscription, then seed junctions.
   - **Resolution (Plan 02 Task 3):** Subscribe-then-assign pattern chosen. After admin_bulk_upsert seeds Archetype rows, subscribe to Archetype table with `onApplied` callback, build name-to-id map from subscription results, then call `adminAssignCharacterArchetypes` per character. Production seed uses 8s timeout; test seed uses 3s delay + subscription.

2. **Archetype Seeding in Test Seed Script** [RESOLVED]
   - What we know: test/shared/seed-data.ts uses batched adminBulkUpsert with 1500ms delays between batches.
   - What's unclear: Whether the existing delay-based approach is sufficient for the Archetype -> Junction dependency, or if explicit subscription confirmation is needed.
   - Recommendation: For test seed, use the same approach but add a subscription step between Archetype seeding and junction seeding to guarantee ID availability.
   - **Resolution (Plan 02 Task 3):** Subscription confirmation chosen over pure delay. Test seed waits 3s for Archetype rows to settle, then subscribes to resolve IDs before seeding junction rows. The `onApplied` callback guarantees IDs are available before `adminAssignCharacterArchetypes` calls.

## Sources

### Primary (HIGH confidence)
- Codebase inspection: spacetimedb/src/helpers/accountRating.ts -- current temporary formula
- Codebase inspection: spacetimedb/src/helpers/eloCalculation.ts -- calculateAccountModifier (no changes needed)
- Codebase inspection: spacetimedb/src/reducers/admin.ts -- admin_bulk_upsert pattern, EXPECTED_KEYS
- Codebase inspection: spacetimedb/src/reducers/eloAdmin.ts -- single-row config seed+update pattern
- Codebase inspection: spacetimedb/src/tables/ -- HsrCharacter, Archetype, HsrCharacterArchetype schemas
- Codebase inspection: scripts/seed-data.ts, test/shared/seed-data.ts -- seed script patterns
- Codebase inspection: test/data/characters_table.json -- verified 83 chars, 66 with archetypes, 12 unique archetypes, version range 1.0-4.1
- Codebase inspection: test/backend/match-results/account-rating.unit.test.ts -- existing test structure

### Secondary (MEDIUM confidence)
- Phase 11 CONTEXT.md decisions D-01 through D-42 -- locked user decisions (validated against codebase)
- Phase 11 EXAMPLES.md -- simulation results for formula verification

### Tertiary (LOW confidence)
- A1 (subscription pattern for ID resolution) -- inferred from SDK behavior, not tested

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - no new dependencies, all existing project infrastructure
- Architecture: HIGH - follows existing patterns (EloConfig, admin_bulk_upsert, updateAccountRating wrapper)
- Pitfalls: HIGH - identified from codebase analysis and formula edge cases
- Formula: HIGH - fully specified in locked decisions with simulation validation
- Seed scripts: MEDIUM - archetype ID resolution pattern needs implementation-time validation

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable -- no external dependency changes expected)
