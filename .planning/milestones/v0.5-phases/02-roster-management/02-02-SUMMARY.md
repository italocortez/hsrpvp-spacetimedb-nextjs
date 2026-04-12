---
phase: 02-roster-management
plan: 02
subsystem: database
tags: [spacetimedb, typescript, reducers, roster, archetypes, admin-proxy]

# Dependency graph
requires:
  - phase: 02-roster-management
    plan: 01
    provides: HsrAccount/HsrAccountCharacter tables, Archetype/HsrCharacterArchetype tables, ensureVerifiedUser, rosterHelpers (validateUid/deriveRegion/recalcDuplicateUid)
provides:
  - create_hsr_account, update_hsr_account, set_active_hsr_account, delete_hsr_account
  - batch_upsert_characters, batch_remove_characters, migrate_roster
  - admin_create/update/delete_hsr_account (proxy reducers)
  - admin_batch_upsert/remove_characters (proxy reducers)
  - admin_upsert_archetype, admin_delete_archetype
  - admin_assign/remove_character_archetypes
  - 16 new reducer bindings in src/module_bindings/
  - Updated roster architecture docs
affects: [admin panel, frontend roster management UI, phase 03 cost views]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Atomic validate-then-write: Phase 1 validate ALL items before Phase 2 writes ANY — ensures all-or-nothing semantics without explicit transactions"
    - "Composite PK upsert: find via primaryKey.find({...}) → delete + insert, carrying audit fields from deleted row"
    - "Admin proxy pattern: mirrors user reducer logic but swaps ensureVerifiedUser for ensureAdmin and removes ownership checks"
    - "Auto-activate oldest: sort remaining accounts by createdDate.microsSinceUnixEpoch (BigInt) before selecting first"

key-files:
  created:
    - spacetimedb/src/reducers/roster.ts
    - spacetimedb/src/reducers/rosterAdmin.ts
    - src/module_bindings/create_hsr_account_reducer.ts
    - src/module_bindings/update_hsr_account_reducer.ts
    - src/module_bindings/set_active_hsr_account_reducer.ts
    - src/module_bindings/delete_hsr_account_reducer.ts
    - src/module_bindings/batch_upsert_characters_reducer.ts
    - src/module_bindings/batch_remove_characters_reducer.ts
    - src/module_bindings/migrate_roster_reducer.ts
    - src/module_bindings/admin_create_hsr_account_reducer.ts
    - src/module_bindings/admin_update_hsr_account_reducer.ts
    - src/module_bindings/admin_delete_hsr_account_reducer.ts
    - src/module_bindings/admin_batch_upsert_characters_reducer.ts
    - src/module_bindings/admin_batch_remove_characters_reducer.ts
    - src/module_bindings/admin_upsert_archetype_reducer.ts
    - src/module_bindings/admin_delete_archetype_reducer.ts
    - src/module_bindings/admin_assign_character_archetypes_reducer.ts
    - src/module_bindings/admin_remove_character_archetypes_reducer.ts
    - src/module_bindings/archetype_table.ts
    - src/module_bindings/hsr_character_archetype_table.ts
  modified:
    - spacetimedb/src/index.ts
    - docs/roster/architecture.md
    - spacetimedb/dist/bundle.js
    - src/module_bindings/index.ts
    - src/module_bindings/types.ts
    - src/module_bindings/types/reducers.ts

key-decisions:
  - "admin_upsert_archetype uses id.update() not name.update() — established pattern from Plan 01: unique index accessor lacks update() method in SpacetimeDB SDK"
  - "migrate_roster sorts by createdDate.microsSinceUnixEpoch BigInt using Number() cast for sort comparator — BigInt subtraction produces BigInt, Number() converts for sort"
  - "admin_batch_remove_characters does not need audit (row deleted, no audit trail on deletes)"
  - "admin_remove_character_archetypes throws if ANY assignment missing — consistent all-or-nothing with other batch operations"

requirements-completed: [ROST-01, ROST-02, ROST-04, ROST-05, ROST-06]

# Metrics
duration: 3min
completed: 2026-03-16
---

# Phase 02 Plan 02: Roster Reducers Summary

**16 roster reducers implemented (7 user-facing + 9 admin proxy/CRUD), wired in index.ts, module published to maincloud, bindings regenerated, roster docs replaced with comprehensive architecture reference**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-16T22:46:14Z
- **Completed:** 2026-03-16T22:49:00Z
- **Tasks:** 2
- **Files modified/created:** 22 backend + 22 generated bindings

## Accomplishments

- All 7 user-facing roster reducers: create (UID validation, region derivation, 5-account limit, auto-active first), update (label + visibility only, UID immutable), set_active (deactivate others, no-op guard), delete (cascade + auto-activate oldest), batch_upsert_characters (atomic all-or-nothing), batch_remove_characters (atomic all-or-nothing), migrate_roster (copy/move modes)
- All 9 admin reducers: 5 proxy reducers mirroring user operations (no ownership checks, admin audit), 4 archetype CRUD (upsert, delete with cascade, assign many-to-many idempotent, remove validated)
- index.ts wired with 2 export lines covering all 16 new reducers
- Roster architecture docs replaced with complete reference: table relationships, all reducer flows, visibility rules table, admin proxy pattern, archetype system, UID validation helpers
- Module published to maincloud (https://spacetimedb.com/hsrpvp-spacetimedb-nextjs-test1), bindings generated with all 16 reducer files

## Task Commits

1. **Task 1: User-facing roster reducers** — `10381a9` (feat)
2. **Task 2: Admin proxy reducers, archetype CRUD, wire exports, update docs** — `aca5bcb` (feat)

## Files Created/Modified

- `spacetimedb/src/reducers/roster.ts` — New: 7 user-facing reducers
- `spacetimedb/src/reducers/rosterAdmin.ts` — New: 9 admin reducers
- `spacetimedb/src/index.ts` — Added roster + rosterAdmin export lines
- `docs/roster/architecture.md` — Complete rewrite with full architecture
- `spacetimedb/dist/bundle.js` — Compiled module bundle
- `src/module_bindings/` — 16 new reducer files + 2 new table files + updated index/types

## Decisions Made

- admin_upsert_archetype: used `id.update()` not `name.update()` — unique index accessor lacks `update()`, established in Plan 01 (Archetype upsert in admin.ts uses the same pattern)
- Atomic validate-then-write pattern applied consistently to all batch operations (upsert_characters, remove_characters, assign_archetypes, remove_archetypes) — Phase 1 validates ALL before Phase 2 writes ANY
- `Number()` cast on BigInt subtraction in sort comparator — `a.createdDate.microsSinceUnixEpoch - b.createdDate.microsSinceUnixEpoch` produces BigInt; sort comparator requires number

## Deviations from Plan

None — plan executed exactly as written. TypeScript compiled cleanly on first attempt for both tasks.

## Issues Encountered

None. All reducers compiled and published without errors.

## User Setup Required

None. Module is live on maincloud, bindings are generated.

## Next Phase Readiness

- All 16 roster reducers callable from frontend via generated bindings
- Reducer naming in bindings matches camelCase convention (createHsrAccount, batchUpsertCharacters, etc.)
- Archetype table seeded via existing admin_bulk_upsert with tableName='Archetype'
- Phase 3 cost-set views can build on costSetId indexes added in Plan 01

---

## Self-Check

**Checking created files exist:**

- [x] spacetimedb/src/reducers/roster.ts — created
- [x] spacetimedb/src/reducers/rosterAdmin.ts — created
- [x] docs/roster/architecture.md — updated
- [x] src/module_bindings/create_hsr_account_reducer.ts — generated

**Checking commits exist:**

- [x] 10381a9 — feat(02-02): implement user-facing roster reducers
- [x] aca5bcb — feat(02-02): implement admin proxy reducers, archetype CRUD, wire exports, update docs

## Self-Check: PASSED

*Phase: 02-roster-management*
*Completed: 2026-03-16*
