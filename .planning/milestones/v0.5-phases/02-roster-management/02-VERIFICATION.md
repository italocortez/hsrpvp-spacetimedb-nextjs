---
phase: 02-roster-management
verified: 2026-03-16T23:00:00Z
status: passed
score: 16/16 must-haves verified
re_verification: false
---

# Phase 2: Roster Management Verification Report

**Phase Goal:** Players can record which HSR characters and lightcones they own, manage multiple accounts, and control roster visibility — enforced at the server level
**Verified:** 2026-03-16T23:00:00Z
**Status:** passed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | HsrAccount table has isRatingPublic and isDuplicateUid columns | VERIFIED | hsrAccount.ts lines 11-12 |
| 2 | Cost tables have costSetId column with default 0 | VERIFIED | All three cost tables contain `costSetId: t.u32()` with btree indexes |
| 3 | Archetype and HsrCharacterArchetype tables exist and are registered | VERIFIED | Both files exist; schema.ts imports and registers them at lines 17-18, 97-98 |
| 4 | ensureVerifiedUser helper blocks guest users from roster operations | VERIFIED | ensurePermissions.ts lines 46-52; checks user.isGuest with descriptive error |
| 5 | rosterHelpers module provides UID validation, region derivation, duplicate UID recalculation | VERIFIED | rosterHelpers.ts exports validateUid, deriveRegion, recalcDuplicateUid; all substantive |
| 6 | User deletion cascades to HsrAccount and HsrAccountCharacter rows | VERIFIED | userDeletion.ts lines 19-28; loops accounts then characters before deleting account |
| 7 | User can create an HSR account with UID validation and auto-derived region | VERIFIED | create_hsr_account in roster.ts: validates UID, derives region, enforces 5-limit, auto-activates first |
| 8 | User can batch upsert characters with atomic all-or-nothing validation | VERIFIED | batch_upsert_characters: Phase 1 validates ALL, Phase 2 writes ALL |
| 9 | User can batch remove characters from an account | VERIFIED | batch_remove_characters: validates ALL names exist before deleting ANY |
| 10 | User can update display label and visibility toggles on an account | VERIFIED | update_hsr_account: label + isRosterPublic + isRatingPublic, ownership checked |
| 11 | User can delete an HSR account with cascade to characters and auto-activate oldest remaining | VERIFIED | delete_hsr_account: cascades characters, auto-activates by createdDate sort |
| 12 | User can set an account as active (deactivating all others) | VERIFIED | set_active_hsr_account: no-op guard, deactivates others, activates target |
| 13 | User can migrate roster between their own accounts in copy or move mode | VERIFIED | migrate_roster: validates both accounts belong to user, supports copy/move modes |
| 14 | Admin can proxy all roster operations on behalf of any user | VERIFIED | rosterAdmin.ts: 5 proxy reducers using ensureAdmin, no ownership checks |
| 15 | Admin can CRUD archetypes and assign characters to archetypes | VERIFIED | rosterAdmin.ts: admin_upsert_archetype, admin_delete_archetype (cascade), admin_assign_character_archetypes, admin_remove_character_archetypes |
| 16 | All reducers are exported and callable from clients | VERIFIED | index.ts lines 12-13: both roster and rosterAdmin fully exported; 16 generated binding files confirmed |

**Score:** 16/16 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `spacetimedb/src/tables/hsrAccount.ts` | HsrAccount with isRatingPublic, isDuplicateUid | VERIFIED | Both bool columns present at correct position before audit columns |
| `spacetimedb/src/tables/archetype.ts` | Admin-managed Archetype table | VERIFIED | Table with unique name column, audit columns, public=true |
| `spacetimedb/src/tables/hsrCharacterArchetype.ts` | Character-to-archetype junction table | VERIFIED | Composite PK [characterName, archetypeId], two btree indexes |
| `spacetimedb/src/helpers/rosterHelpers.ts` | UID validation, region derivation, duplicate recalc | VERIFIED | All three functions exported; REGION_MAP covers 6/7/8/9; regex `^\d{9}$` |
| `spacetimedb/src/helpers/ensurePermissions.ts` | Guest blocking helper | VERIFIED | ensureVerifiedUser checks user.isGuest; throws with Discord-link message |
| `spacetimedb/src/reducers/roster.ts` | 7 user-facing roster reducers | VERIFIED | All 7 exports present and substantive |
| `spacetimedb/src/reducers/rosterAdmin.ts` | 9 admin proxy/CRUD reducers | VERIFIED | All 9 exports present and substantive |
| `spacetimedb/src/index.ts` | All reducer exports wired | VERIFIED | Both export lines present; all 16 reducers covered |
| `docs/roster/architecture.md` | Architecture documentation | VERIFIED | Contains table relationships, all reducer flows, visibility rules, archetype system |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `spacetimedb/src/schema.ts` | `spacetimedb/src/tables/archetype.ts` | import and register | WIRED | Line 17: `import { Archetype } from './tables/archetype'`; line 97: registered in schema() call |
| `spacetimedb/src/schema.ts` | `spacetimedb/src/tables/hsrCharacterArchetype.ts` | import and register | WIRED | Line 18 import; line 98 registered |
| `spacetimedb/src/reducers/userDeletion.ts` | `spacetimedb/src/tables/hsrAccount.ts` | cascade delete | WIRED | `HsrAccount.hsr_account_user_id.filter` + `HsrAccount.id.delete` present |
| `spacetimedb/src/reducers/roster.ts` | `spacetimedb/src/helpers/rosterHelpers.ts` | import | WIRED | Line 5: `import { validateUid, deriveRegion, recalcDuplicateUid } from '../helpers/rosterHelpers'` |
| `spacetimedb/src/reducers/roster.ts` | `spacetimedb/src/helpers/ensurePermissions.ts` | import | WIRED | Line 3: `import { ensureVerifiedUser } from '../helpers/ensurePermissions'` |
| `spacetimedb/src/index.ts` | `spacetimedb/src/reducers/roster.ts` | re-export | WIRED | Line 12: `export { create_hsr_account, ... } from './reducers/roster'` |
| `spacetimedb/src/index.ts` | `spacetimedb/src/reducers/rosterAdmin.ts` | re-export | WIRED | Line 13: `export { admin_create_hsr_account, ... } from './reducers/rosterAdmin'` |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence / Notes |
|-------------|------------|-------------|--------|-----------------|
| ROST-01 | 02-02 | User can create an HSR account entry with a display label and set it as active | SATISFIED | create_hsr_account reducer: UID validation, region derivation, 5-account limit, auto-activate first |
| ROST-02 | 02-02 | User can add owned characters with eidolon level (0-6) to an HSR account | SATISFIED | batch_upsert_characters: validates HsrCharacter.name exists, eidolonLevel 0-6 range, atomic upsert |
| ROST-03 | 02-01 | User can add owned lightcones with superimposition level (1-5) to an HSR account | DESCOPED (schema only) | HsrAccountLightcone table exists from Phase 1 with superimpositionLevel column. No reducer implemented — explicitly descoped in CONTEXT.md and VALIDATION.md. Functional reducers deferred to a later phase. |
| ROST-04 | 02-02 | User can manage multiple HSR accounts and select which is active for play | SATISFIED | set_active_hsr_account deactivates others atomically; delete_hsr_account auto-activates oldest remaining; migrate_roster supports copy/move |
| ROST-05 | 02-02 | Admin can add/edit roster entries on behalf of any user | SATISFIED | 5 proxy reducers in rosterAdmin.ts all use ensureAdmin; no ownership checks; audit uses admin.id |
| ROST-06 | 02-02 | User can set roster visibility to public or private | SATISFIED | update_hsr_account accepts isRosterPublic and isRatingPublic toggles; ownership verified before update |
| ROST-07 | 02-01 | Roster visibility is overridden by lobby/tournament open-roster settings | PARTIAL — data model only | Lobby.isOpenRoster column exists (lobby.ts line 33). Enforcement at subscription/reducer level deferred to Phase 9 lobby reducers. Explicitly documented in VALIDATION.md as "data model validated only". |
| ROST-08 | 02-01 | Account rating is calculated from roster composition (characters + eidolons + lightcones owned) | PARTIAL — frontend-computed | Raw data is available: HsrAccountCharacter (public), HsrCharacterCost (public, with costSetId), archetype tags (public). No backend rating column or reducer — explicitly descoped to frontend in CONTEXT.md ("No backend rating caching — fully frontend-computed from subscribed data"). |

---

### Notes on ROST-03, ROST-07, ROST-08

These three requirements are marked Complete in REQUIREMENTS.md but were explicitly descoped in CONTEXT.md and VALIDATION.md before Phase 2 execution began. The scoping decisions are documented and intentional:

- **ROST-03**: Schema exists (HsrAccountLightcone with superimpositionLevel). Reducers intentionally deferred. This is a known gap acknowledged in the planning files.
- **ROST-07**: Data model in place (Lobby.isOpenRoster). Enforcement requires lobby join/query reducers that belong to Phase 9. Phase 2 cannot enforce a constraint against a system that does not yet exist.
- **ROST-08**: Rating computation is frontend-side by design. All required raw data is available via public subscriptions. No server-side numeric cache is needed.

The REQUIREMENTS.md traceability table marks all three as Complete at Phase 2, which overstates what was delivered. The actual deliverable is the data foundation for these requirements; behavioral enforcement happens in later phases.

---

### Anti-Patterns Found

No anti-patterns found. Scanned roster.ts, rosterAdmin.ts, rosterHelpers.ts, ensurePermissions.ts, userDeletion.ts:
- No TODO/FIXME/PLACEHOLDER comments
- No stub return values (null, empty arrays without queries)
- No handlers that only call console.log or preventDefault
- No empty implementations

---

### Human Verification Required

#### 1. Module Published to Maincloud

**Test:** Navigate to https://spacetimedb.com/@hsrpvp-spacetimedb-nextjs-test1 and verify the module is live.
**Expected:** Module dashboard shows current version with all 16 new reducers visible.
**Why human:** Cannot confirm live cloud deployment state programmatically from this environment.

#### 2. Lightcone Reducer Gap Acceptance

**Test:** Confirm with product owner that ROST-03 (lightcone reducers) deferred from Phase 2 is acceptable for Phase 2 sign-off.
**Expected:** Acknowledged as intentional descope; a future plan will add batch_upsert_lightcones and batch_remove_lightcones.
**Why human:** This is a product/scope decision, not a code defect.

#### 3. ROST-07 Enforcement Timeline

**Test:** Confirm that Phase 9 lobby reducers will read Lobby.isOpenRoster when returning character data to clients, overriding the per-account isRosterPublic flag.
**Expected:** Phase 9 plan explicitly references isOpenRoster and the enforcement pattern.
**Why human:** Cross-phase contract cannot be verified from Phase 2 code alone.

---

### Gaps Summary

No gaps block the Phase 2 goal. The core goal — "Players can record which HSR characters they own, manage multiple accounts, and control roster visibility, enforced at the server level" — is fully achieved for characters.

The three partially-delivered requirements (ROST-03, ROST-07, ROST-08) were explicitly descoped before execution began. They represent intentional deferral to later phases or frontend implementation, not implementation failures. The REQUIREMENTS.md traceability should be noted as aspirational for Phase 2; the functional reducers for lightcones and the enforcement logic for lobby visibility override are work that must be tracked to completion in subsequent phases.

---

## TypeScript Compilation

```
npx tsc --noEmit --project spacetimedb/tsconfig.json
EXIT_CODE=0
```

Zero errors. All modified and created files compile cleanly.

---

## Module Bindings Generated

16 new reducer binding files confirmed in `src/module_bindings/`:
- create_hsr_account_reducer.ts
- update_hsr_account_reducer.ts
- set_active_hsr_account_reducer.ts
- delete_hsr_account_reducer.ts
- batch_upsert_characters_reducer.ts
- batch_remove_characters_reducer.ts
- migrate_roster_reducer.ts
- admin_create_hsr_account_reducer.ts
- admin_update_hsr_account_reducer.ts
- admin_delete_hsr_account_reducer.ts
- admin_batch_upsert_characters_reducer.ts
- admin_batch_remove_characters_reducer.ts
- admin_upsert_archetype_reducer.ts
- admin_delete_archetype_reducer.ts
- admin_assign_character_archetypes_reducer.ts
- admin_remove_character_archetypes_reducer.ts

New table binding files:
- archetype_table.ts
- hsr_character_archetype_table.ts

---

_Verified: 2026-03-16T23:00:00Z_
_Verifier: Claude (gsd-verifier)_
