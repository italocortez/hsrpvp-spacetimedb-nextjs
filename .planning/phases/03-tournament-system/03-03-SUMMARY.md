---
phase: 03-tournament-system
plan: "03"
subsystem: database
tags: [spacetimedb, cost-sets, draft-publish, reducers, views, typescript]

requires:
  - phase: 03-01-PLAN
    provides: "CostSet, CostSetDraftCharacter, CostSetDraftLightcone, CostSetDraftSynergy, HsrCharacterCost, HsrLightconeCost, HsrSynergyCost tables; ensurePermissions helpers; auditColumns helpers"

provides:
  - "8 cost set reducers: create_cost_set, edit_draft_character_cost, edit_draft_lightcone_cost, edit_draft_synergy_cost, publish_cost_set, lock_cost_set, unpublish_cost_set, delete_cost_set"
  - "4 per-user security views for draft cost data: view_my_cost_sets, view_my_draft_character_costs, view_my_draft_lightcone_costs, view_my_draft_synergy_costs"
  - "Full draft/publish lifecycle enforced: draft → publish → lock → unpublish → delete"
  - "Cost set architecture docs at docs/cost-sets/architecture.md"

affects:
  - "03-04-PLAN (tournament creation uses costSetId)"
  - "Phase 9 (lobby-close auto-unpublish uses isLocked)"
  - "Frontend cost management UI (TOs create/edit/publish sets)"

tech-stack:
  added: []
  patterns:
    - "Draft/publish workflow: private draft tables → publish copies to live public tables → draft cleanup in same transaction"
    - "Lock → unpublish → delete lifecycle enforced in reducers (never skip steps)"
    - "Per-user views via iter() + Set<id> membership check when no cross-table index exists"
    - "Composite PK upsert via delete + insert (preserving audit fields with auditUpdate)"
    - "costSetId=0 sentinel protection — default set cannot be locked/unpublished/deleted"

key-files:
  created:
    - spacetimedb/src/reducers/costSetManagement.ts
    - docs/cost-sets/architecture.md
  modified:
    - spacetimedb/src/views/securityViews.ts
    - spacetimedb/src/index.ts

key-decisions:
  - "iter() used in per-user draft views because there is no cross-table index on (creatorId, costSetId) — only cost_set_id index exists on draft tables, requiring a Set<id> membership check after filtering by creatorId on CostSet"
  - "publish_cost_set preserves audit history on live rows via auditUpdate when overwriting existing rows (for republishing a cost set after edit)"
  - "HsrSynergyCost update on publish uses id.update() (not delete+insert) to preserve autoInc id PK — differs from character/lightcone composite PK tables"
  - "unpublish_cost_set does NOT delete live cost rows — only toggles isPublished/isLocked metadata flags; rows remain until delete_cost_set is called"

patterns-established:
  - "Composite PK upsert: filter via cost_set_id index + manual .find() match, then delete old row + insert updated row"
  - "costSetId=0 guard at top of lock/unpublish/delete reducers"
  - "Ownership check: costSet.creatorId === user.id || isRoleAtLeast(user.role, 'Moderator')"

requirements-completed: [TRNT-02]

duration: 3min
completed: "2026-03-17"
---

# Phase 03 Plan 03: Cost Set Management Summary

**8 cost set reducers implementing draft/publish/lock/unpublish/delete lifecycle with 4 per-user security views for private draft cost data**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-17T15:36:50Z
- **Completed:** 2026-03-17T15:40:08Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments

- Full draft/publish workflow: TOs clone cost sets from existing published sets, edit privately in draft tables, then publish atomically to live broadcast tables
- Lock → unpublish → delete lifecycle enforced — reducers reject out-of-order operations (e.g. unpublish without lock, delete without unpublish)
- 4 per-user security views allow TOs to read their own private draft cost data without exposing other TOs' unpublished work
- costSetId=0 (the default set) is protected from lock/unpublish/delete by guard clauses in all lifecycle reducers
- Architecture docs written covering table relationships, workflow diagram, key rules, and reducer reference table
- Build verified: `spacetime publish` TypeScript compilation passes without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Cost set management reducers (clone, edit, publish, unpublish, delete)** - `1b81732` (feat)
2. **Task 2: Draft cost views, wire exports, and cost set docs** - `d53894f` (feat)

## Files Created/Modified

- `spacetimedb/src/reducers/costSetManagement.ts` — 8 reducers: create_cost_set, edit_draft_character_cost, edit_draft_lightcone_cost, edit_draft_synergy_cost, publish_cost_set, lock_cost_set, unpublish_cost_set, delete_cost_set
- `spacetimedb/src/views/securityViews.ts` — Added 4 per-user draft cost views (views 6–9)
- `spacetimedb/src/index.ts` — Added export line for all 8 costSetManagement reducers
- `docs/cost-sets/architecture.md` — Cost set architecture docs with table diagram, workflow, key rules, and reducer reference

## Decisions Made

- `iter()` used in per-user draft views because draft tables only have a `cost_set_id` index (not a `creatorId` index), requiring iteration over all draft rows filtered by Set<costSetId> membership
- `publish_cost_set` preserves audit history on live rows via `auditUpdate` when republishing (if a live row already exists for that characterName+gameMode, it is deleted+reinserted with original createdById/createdDate preserved)
- `HsrSynergyCost` update on publish uses `id.update()` rather than delete+insert because it has an autoInc `id` PK — different pattern from `HsrCharacterCost`/`HsrLightconeCost` which use composite PKs
- `unpublish_cost_set` does NOT delete live cost rows — live cost data persists in tables until `delete_cost_set` is called; only the CostSet metadata flags are toggled

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 8 cost set reducers are exported from index.ts and ready for client consumption
- `costSetId` can now be validated in tournament creation reducers (Plan 03-04): check that `CostSet.id.find(costSetId)` exists and `isPublished === true && !isLocked`
- Per-user views are registered and will be available after next `spacetime publish`
- Phase 9 can implement auto-unpublish on last lobby close by checking `isLocked === true && !hasActiveLobbies`

## Self-Check: PASSED

- FOUND: spacetimedb/src/reducers/costSetManagement.ts
- FOUND: docs/cost-sets/architecture.md
- FOUND: .planning/phases/03-tournament-system/03-03-SUMMARY.md
- FOUND: commit 1b81732 (Task 1)
- FOUND: commit d53894f (Task 2)

---
*Phase: 03-tournament-system*
*Completed: 2026-03-17*
