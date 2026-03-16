---
phase: 02-roster-management
plan: 01
subsystem: database
tags: [spacetimedb, typescript, schema, roster, archetypes, cost-tables, helpers]

# Dependency graph
requires:
  - phase: 01-schema-foundation
    provides: HsrAccount, HsrAccountCharacter, HsrCharacterCost, HsrLightconeCost, HsrSynergyCost, admin reducer pattern, ensurePermissions helpers
provides:
  - HsrAccount with isRatingPublic and isDuplicateUid columns
  - costSetId column with btree index on all three cost tables
  - Archetype and HsrCharacterArchetype tables registered in schema
  - Admin support for Archetype bulk upsert and cascade delete
  - ensureVerifiedUser helper in ensurePermissions.ts
  - rosterHelpers.ts with validateUid, deriveRegion, recalcDuplicateUid
  - User deletion cascade to HsrAccount and HsrAccountCharacter
affects: [02-02-roster-reducers, phase 03 cost-set views, admin panel]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Column additions: add new bool/u32 columns before audit columns (not at end) when they are semantically non-trailing"
    - "Archetype pattern: admin-managed reference table + junction table with composite PK and two btree indexes"
    - "costSetId=0 sentinel: default cost set is 0, all existing rows implicitly belong to set 0"
    - "recalcDuplicateUid: full UID group sweep — update all accounts sharing a UID atomically in one reducer call"

key-files:
  created:
    - spacetimedb/src/tables/archetype.ts
    - spacetimedb/src/tables/hsrCharacterArchetype.ts
    - spacetimedb/src/helpers/rosterHelpers.ts
    - spacetimedb/src/docs/archetypes/README.md
  modified:
    - spacetimedb/src/tables/hsrAccount.ts
    - spacetimedb/src/tables/hsrCharacterCost.ts
    - spacetimedb/src/tables/hsrLightconeCost.ts
    - spacetimedb/src/tables/hsrSynergyCost.ts
    - spacetimedb/src/schema.ts
    - spacetimedb/src/reducers/admin.ts
    - spacetimedb/src/helpers/ensurePermissions.ts
    - spacetimedb/src/reducers/userDeletion.ts
    - spacetimedb/src/docs/roster/README.md

key-decisions:
  - "Used id.update() for Archetype upsert (not name.update()) — unique index accessor lacks update() method in SpacetimeDB SDK"
  - "costSetId added mid-column (before audit cols) not at end — acceptable for dev-mode since --clear-database is used at publish"
  - "HsrAccountLightcone not cascaded in user deletion — lightcone reducers descoped from Phase 2, noted in code comment"
  - "recalcDuplicateUid updates only accounts where isDuplicateUid state actually changes — minimizes unnecessary writes"

patterns-established:
  - "Verified-user guard: call ensureVerifiedUser(ctx) at top of any roster write reducer — prevents guest writes"
  - "UID validation flow: validateUid() then deriveRegion() before any insert — always in that order"
  - "Cascade delete order: child rows before parent row — characters before account, identities before user"

requirements-completed: [ROST-03, ROST-07, ROST-08]

# Metrics
duration: 25min
completed: 2026-03-16
---

# Phase 02 Plan 01: Roster Schema Foundation Summary

**HsrAccount extended with isRatingPublic/isDuplicateUid, cost tables gain costSetId with btree indexes, Archetype + HsrCharacterArchetype tables created, roster helpers (validateUid, deriveRegion, recalcDuplicateUid) implemented, and user deletion cascade extended to HSR data**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-16T00:00:00Z
- **Completed:** 2026-03-16T00:25:00Z
- **Tasks:** 2
- **Files modified:** 9 (5 modified, 4 created)

## Accomplishments
- Schema foundation for roster reducers: HsrAccount now tracks rating visibility and duplicate UID status
- Cost tables are cost-set-aware via costSetId column and btree index, enabling Phase 3 anonymous views
- Archetype/HsrCharacterArchetype tables provide admin-managed character tagging with cascade delete
- Roster helper utilities ready for import by Phase 2 reducers — UID validation, region derivation, duplicate flag recalc
- User deletion fully cascades HSR data (accounts + characters)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add columns, archetype tables, and admin support** - `938ab80` (feat)
2. **Task 2: Add roster helpers and extend user deletion cascade** - `4363814` (feat)

**Plan metadata:** (pending)

## Files Created/Modified
- `spacetimedb/src/tables/hsrAccount.ts` - Added isRatingPublic and isDuplicateUid columns
- `spacetimedb/src/tables/hsrCharacterCost.ts` - Added costSetId column + char_cost_set_id btree index
- `spacetimedb/src/tables/hsrLightconeCost.ts` - Added costSetId column + lc_cost_set_id btree index
- `spacetimedb/src/tables/hsrSynergyCost.ts` - Added costSetId column + synergy_cost_set_id btree index
- `spacetimedb/src/tables/archetype.ts` - New: Archetype table with unique name and audit columns
- `spacetimedb/src/tables/hsrCharacterArchetype.ts` - New: junction table with composite PK and two btree indexes
- `spacetimedb/src/schema.ts` - Registered Archetype and HsrCharacterArchetype
- `spacetimedb/src/reducers/admin.ts` - Added Archetype EXPECTED_KEYS, bulk upsert case, delete cases with cascade; costSetId threaded through all cost table upserts
- `spacetimedb/src/helpers/ensurePermissions.ts` - Added ensureVerifiedUser
- `spacetimedb/src/helpers/rosterHelpers.ts` - New: validateUid, deriveRegion, recalcDuplicateUid
- `spacetimedb/src/reducers/userDeletion.ts` - Extended cascade to HsrAccount and HsrAccountCharacter
- `spacetimedb/src/docs/roster/README.md` - Updated with new columns, helpers, cascade notes
- `spacetimedb/src/docs/archetypes/README.md` - New: archetype domain documentation

## Decisions Made
- Used `id.update()` instead of `name.update()` for Archetype upsert — SpacetimeDB unique index accessor does not expose an `update()` method, only `find()`. Primary key accessor must be used for updates.
- HsrAccountLightcone rows are NOT cascaded in user deletion — lightcone reducers are descoped from Phase 2. A comment in userDeletion.ts marks where to extend when lightcone reducers are added.
- `recalcDuplicateUid` only writes rows where the flag actually changes — avoids unnecessary writes when multiple accounts already have the correct isDuplicateUid value.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Archetype upsert to use id.update() instead of name.update()**
- **Found during:** Task 1 (TypeScript compilation)
- **Issue:** Plan specified `ctx.db.Archetype.name.update(...)` but the unique index accessor only provides `find()`, not `update()` — TypeScript error TS2339
- **Fix:** Changed to `ctx.db.Archetype.id.update(...)` using the primary key accessor, which supports update
- **Files modified:** spacetimedb/src/reducers/admin.ts
- **Verification:** TypeScript compilation passed with no errors
- **Committed in:** 938ab80 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Fix required for correctness; behavior is identical since the update targets the same row.

## Issues Encountered
None beyond the TypeScript error caught during compilation and fixed inline.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All schema foundations in place for Phase 02 Plan 02 roster reducers
- ensureVerifiedUser, validateUid, deriveRegion, recalcDuplicateUid all importable and ready to use
- Archetype table can be seeded via admin_bulk_upsert with tableName='Archetype'

---
*Phase: 02-roster-management*
*Completed: 2026-03-16*
