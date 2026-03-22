# Cost Sets

**Architecture:** [architecture.md](architecture.md)

## Acceptance Scenarios

### Create Cost Set (clone from source)
**Given:** User with TournamentHost+ role, source cost set exists and is published
**When:** `create_cost_set(name, sourceSetId, gameModeTag)`
**Then:** CostSet row created (isDraft=true, isPublished=false). Draft tables populated with cloned rows from source set filtered by gameMode.

### Edit Draft Costs
**Given:** Unpublished cost set owned by caller
**When:** `edit_draft_character_cost(costSetId, characterName, gameModeTag, costs)`
**Then:** Draft character cost row upserted
**When:** `edit_draft_lightcone_cost(costSetId, lightconeName, gameModeTag, costs)`
**Then:** Draft lightcone cost row upserted
**When:** `edit_draft_synergy_cost(costSetId, sourceName, targetName, gameModeTag, costModifier)`
**Then:** Draft synergy cost row upserted

### Publish Cost Set
**Given:** Draft cost set with edits
**When:** `publish_cost_set(costSetId)`
**Then:** Draft rows copied to live HsrCharacterCost/HsrLightconeCost/HsrSynergyCost tables. Draft rows deleted. CostSet: isDraft=false, isPublished=true.

### Lock Cost Set
**Given:** Published cost set
**When:** `lock_cost_set(costSetId)`
**Then:** CostSet: isLocked=true

### Unpublish Cost Set
**Given:** Locked cost set
**When:** `unpublish_cost_set(costSetId)`
**Then:** CostSet: isPublished=false, isLocked=false

### Delete Cost Set
**Given:** Unpublished cost set
**When:** `delete_cost_set(costSetId)`
**Then:** CostSet row deleted. All associated HsrCharacterCost, HsrLightconeCost, HsrSynergyCost rows cascade-deleted. Any remaining draft rows deleted.

### Default Cost Set Protection
**Given:** costSetId=0 (the default/system cost set)
**When:** `lock_cost_set(0)`, `unpublish_cost_set(0)`, or `delete_cost_set(0)`
**Then:** All three rejected with "The default cost set (id=0) cannot be {locked/unpublished/deleted}"

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Lock default set (id=0) | Throws "The default cost set (id=0) cannot be locked" |
| Unpublish default set (id=0) | Throws "The default cost set (id=0) cannot be unpublished" |
| Delete default set (id=0) | Throws "The default cost set (id=0) cannot be deleted" |
| Unpublish without locking first | Throws error (requires isLocked=true) |
| Delete while still published | Throws error (requires isPublished=false) |
| Edit draft of another user's cost set (non-Moderator) | Throws ownership error |

## Integration Points

| This Feature | Connects To | Direction |
|-------------|------------|-----------|
| CostSet.creatorId | User.id | Reads |
| Tournament.costSetId | CostSet.id | Tournament reads |
| HsrCharacterCost.costSetId | CostSet.id | Writes on publish |
| HsrLightconeCost.costSetId | CostSet.id | Writes on publish |
| HsrSynergyCost.costSetId | CostSet.id | Writes on publish |

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| Cost set lock→unpublish→delete lifecycle | Phase 3 CONTEXT.md | 2026-03-17 |
| costSetId=0 is protected default set | Phase 3 CONTEXT.md | 2026-03-17 |
| Draft tables are private (public: false) | Phase 3 CONTEXT.md | 2026-03-17 |
| Per-user views for draft access | Phase 3 execution | 2026-03-19 |
| Clone-from-source filters by gameMode | Phase 3 execution | 2026-03-19 |
| Publish is atomic (all 3 live tables + draft cleanup in one transaction) | Phase 3 execution | 2026-03-19 |
| Full lifecycle verified: create→edit→publish→lock→unpublish→delete | Phase 3 execution | 2026-03-19 |
| Default protection verified on all 3 lifecycle reducers | Phase 3 execution | 2026-03-19 |

---

*Last updated: 2026-03-19*
