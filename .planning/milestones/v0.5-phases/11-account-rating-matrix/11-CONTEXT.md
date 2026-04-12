# Phase 11: Account Rating Matrix - Context

**Gathered:** 2026-04-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace the TEMPORARY accountRating formula (Phase 5) with a matrix-based rating that measures account quality across two dimensions: vertical investment (eidolon depth) and horizontal investment (archetype coverage). Add `versionReleased` and `treatAsVersion` columns to HsrCharacter, seed archetype data from updated JSON, create runtime-configurable AccountRatingConfig table, and update ELO integration.

Requirements: ARCH-01, ARCH-02 (redefined from original "playstyle stats" scope)

</domain>

<decisions>
## Implementation Decisions

### Data File Changes
- **D-01:** `characters_table.json` renamed to `characters_table_old.json`. New `characters_table.json` created from `characters_table_archetype.json` — adds `archetype` (string[]) and `version_released` (float) to all 83 characters. Same costs, same character list. Old file kept for reference.
- **D-02:** `version_released` is the literal game patch number (e.g., 2.5 = patch 2.5), not a relevance score. Range: 1.0-4.0 across current data. All 83 characters have this field.
- **D-03:** 66/83 characters have archetype assignments. 17 characters (mostly 4-stars) have empty archetype arrays — they contribute to vertical score but not horizontal.

### HsrCharacter Table Changes
- **D-04:** New column `versionReleased: t.f64()` — game patch the character was released in. Seeded from JSON `version_released`.
- **D-05:** New column `treatAsVersion: t.f64()` — optional admin override. Default 0.0 = use `versionReleased`. When > 0, overrides `versionReleased` in the age weight calculation. For characters that remain meta-relevant regardless of age.
- **D-06:** Both columns use f64, consistent with AccountRatingConfig. No integer-centesimal conversion needed.

### Archetype Data Seeding
- **D-07:** Archetype names from JSON seeded into existing Archetype table via `admin_bulk_upsert`. Character-archetype assignments seeded into HsrCharacterArchetype junction table via `admin_assign_character_archetypes`. Junction table keeps existing `archetypeId` (u32) FK — seed script subscribes to Archetype table after seeding to resolve name→id mapping.
- **D-08:** Both seed scripts (`scripts/seed-data.ts` and `test/shared/seed-data.ts`) updated to handle new JSON fields and archetype seeding.

### AccountRatingConfig Table
- **D-09:** New single-row config table `AccountRatingConfig` — separate from EloConfig. All columns f64.
- **D-10:** Config columns and defaults:

| Column | Type | Default | Purpose |
|--------|------|---------|---------|
| `verticalWeight` | f64 | 0.4 | Vertical dimension weight (40%) |
| `horizontalWeight` | f64 | 0.6 | Horizontal dimension weight (60%) |
| `compression` | f64 | 0.2 | Within-version spread compression (1.0 = off, 0.0 = snap to major) |
| `roleExponentDps` | f64 | 2.0 | Age decay exponent for Dps role |
| `roleExponentSupport` | f64 | 1.3 | Age decay exponent for Support role |
| `roleExponentSustain` | f64 | 1.0 | Age decay exponent for Sustain role |
| `archetypeThreshold` | f64 | 3.0 | Min characters for full archetype ownership |
| `scale` | f64 | 1000.0 | Output range (also used as ELO divisor) |
| `maxPossible` | f64 | 0.0 | Cached theoretical max (all chars at E6). Auto-computed, not admin-edited. |

- **D-11:** Admin reducer `admin_update_rating_config` for editing. Initialization via admin reducer (same pattern as EloConfig).
- **D-11b:** `maxPossible` is auto-computed (not manually set). Represents the combined score if a hypothetical account owned every HsrCharacter at E6. Used as the normalization denominator so top accounts approach the scale cap.

### Rating Formula

- **D-12:** Output: 0 to `scale` (default 1000), normalized against `maxPossible`. Stored as u32 on `HsrAccount.accountRating`. `Math.round()` at the end.

#### Age Weight (per character)
- **D-13:** Base curve: **sqrt**. Formula:
  ```
  version = treatAsVersion > 0 ? treatAsVersion : versionReleased
  max_version = max(versionReleased) across all HsrCharacter rows (dynamic)
  major = floor(version)
  frac = version - major
  effective = major + frac * compression
  age_weight = sqrt(effective / max_version) ^ role_exponent[role]
  ```
- **D-14:** Role-dependent decay via exponent: Dps decays fastest (^2.0), Support moderate (^1.3), Sustain gentlest (^1.0 = raw sqrt). DPS power-creep faster than supports in HSR meta.
- **D-15:** Within-version compression = 0.2: characters released in the same major version cycle are treated as nearly equal. Cross-version boundaries are significant steps. Set to 1.0 to disable.
- **D-16:** `max_version` computed dynamically from data — auto-adjusts when new characters are added.

#### Vertical Score (40% weight)
- **D-17:** Measures eidolon investment depth per owned character.
  ```
  per_char = ((1 + eidolonLevel) / 7) * age_weight
  vertical = mean(per_char for all owned characters)   → [0, 1]
  ```
- **D-18:** E0 has base value: (1+0)/7 = 0.14. Owning a character at E0 is still worth something.
- **D-19:** Average per owned character, not total/max. A player with 5 E6 chars scores same vertical as 83 E6 chars. Breadth is captured by horizontal.
- **D-20:** Characters without archetypes still contribute to vertical. All owned characters count.

#### Horizontal Score (60% weight)
- **D-21:** Measures archetype coverage breadth.
  ```
  per_archetype:
    threshold = min(archetypeThreshold, archetype_size)
    ownership = min(sum(age_weight for owned chars in archetype) / threshold, 1.0)
  horizontal = mean(ownership for ALL archetypes)   → [0, 1]
  ```
- **D-22:** Dynamic threshold: `min(3, archetype_size)`. Solves Elation (2 chars) — owning both = full ownership.
- **D-23:** Age-weighted ownership: owning 3 old v1 DPS gives less ownership than 3 recent v4 chars. Quality over quantity.
- **D-24:** Multiple archetypes per character evaluated independently. If a character belongs to both Debuff and FuA, it contributes to both.
- **D-25:** No GlobalArchetypeStat table. Removed from scope — small user base, add later if needed.

#### Combined
- **D-26:** `accountRating = Math.round(((vertical * verticalWeight + horizontal * horizontalWeight) / maxPossible) * scale)`
- **D-26b:** `maxPossible` = the combined score (vertical × vWeight + horizontal × hWeight) computed for a hypothetical account owning ALL HsrCharacter rows at E6. This normalizes the output so the best realistic account approaches `scale` (1000).
- **D-27:** Weighted sum with 60% horizontal, 40% vertical. Breadth dominates — in competitive drafting, diverse roster flexibility matters more than a few maxed characters.

### MMR / ELO Integration
- **D-28:** `calculateAccountModifier` remains unchanged — scale is 1000, same as the existing hardcoded `/1000` divisor. No ELO code changes needed.
- **D-29:** No other ELO code changes needed. K-factor, expected score, team effective are unaffected.
- **D-30:** Normalized output (0-1000) is drop-in compatible with the existing ELO integration.

### Recalculation Triggers
- **D-31:** Rating recomputed for a single account when:
  - Player calls `batch_upsert_characters` (add/update chars + eidolons)
  - Player calls `batch_remove_characters` (remove chars)
  - Admin equivalents (`admin_batch_upsert_characters`, `admin_batch_remove_characters`)
- **D-32:** `admin_recalculate_all_ratings` reducer: iterates all HsrAccount rows, recomputes rating using current AccountRatingConfig, updates if changed. ~300 computations at current scale — trivial. Called manually by admin after config changes.
- **D-33:** `admin_bulk_upsert('HsrCharacter', ...)` auto-triggers: recompute `maxPossible` from new character pool, then if `maxPossible` changed, fire `admin_recalculate_all_ratings` to update all account ratings. This ensures new character additions automatically shift the normalization ceiling and propagate to all ratings.
- **D-33b:** Archetype assignment changes (`admin_assign_character_archetypes`, `admin_remove_character_archetypes`) do NOT auto-trigger recalculation. Admin manually calls recalculate after bulk archetype edits.

### Seed Script Changes
- **D-34:** Both seed scripts updated: `normalizeCharacters()` passes `versionReleased` and `treatAsVersion` (default 0.0) through.
- **D-35:** New seed step: extract unique archetype names from JSON → seed Archetype table → subscribe to get IDs → seed HsrCharacterArchetype junction rows.
- **D-36:** `EXPECTED_KEYS` in `admin.ts` updated to include `versionReleased` and `treatAsVersion` for HsrCharacter.
- **D-37:** `admin_bulk_upsert` HsrCharacter case updated to handle new columns.

### Scope Boundaries
- **D-38:** No PlayerArchetypeStat table (original Phase 11 concept removed — phase is about account rating, not playstyle stats).
- **D-39:** No archetype leaderboard or ranking.
- **D-40:** No client-side work (v0.5 is backend-only).
- **D-41:** Requires `--clear-database` publish (new columns on HsrCharacter, new table).
- **D-42:** Existing `account-rating.unit.test.ts` needs rewriting for new formula.

</decisions>

<deferred>
## Deferred Ideas

- GlobalArchetypeStat table for community-level archetype meta analysis
- Per-match archetype tracking (original Phase 11 "playstyle stats" concept)
- Archetype leaderboard / ranking system
- Per-gameMode rating variants (different formula weights per game mode)

</deferred>

<validation>
## Simulation Results (2026-04-06)

Using default config (compression=0.2, sqrt base, role exponents 2.0/1.3/1.0, scale=1000, normalized by maxPossible):

maxPossible ≈ 0.789 (all 83 chars at E6). Ratings normalized: `round((combined / 0.789) * 1000)`.

| Scenario | Vertical | Horizontal | Raw Combined | Rating (/1000) |
|----------|----------|------------|-------------|----------------|
| New player (3 E0 recent DPS) | 6.0% | 9.0% | 0.078 | 99 |
| Moderate (15 chars, mixed E0-E2) | 12.2% | 24.4% | 0.195 | 247 |
| Whale (50 chars, E0-E6 spread) | 26.4% | 77.4% | 0.570 | 722 |
| Focused (8 E6 meta chars) | 37.5% | 12.4% | 0.224 | 284 |
| F2P veteran (30 chars, 4-star E6, 5-star E0) | 15.0% | 60.7% | 0.424 | 537 |
| All 83 at E6 (theoretical max) | ~26% | ~97% | 0.789 | 1,000 |
| Empty account | 0.0% | 0.0% | 0.000 | 0 |

Breadth-dominant as intended: F2P veteran (537) > Focused whale (284).
Normalized: theoretical max account reaches exactly 1000.

See `11-EXAMPLES.md` for role-based account examples and worked calculation flow (reference only, not implementation spec).

</validation>
