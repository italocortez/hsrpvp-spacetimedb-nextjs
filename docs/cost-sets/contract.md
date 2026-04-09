# Cost Sets

**Architecture:** [architecture.md](architecture.md)

## Feature Overview

Cost sets define the per-character, per-lightcone, and synergy cost values used during draft sessions. A cost set follows a lifecycle: created as a draft (cloned from an existing published set), edited in draft tables, published to live tables, optionally locked to prevent new lobbies from selecting it, unpublished, and finally deleted. The default cost set (id=0) is protected and cannot be locked, unpublished, or deleted. Draft tables are private; live cost tables are public. TournamentHost+ can create and manage their own cost sets; Moderator+ can edit any cost set.

## Reducers

### create_cost_set

**Purpose:** Create a new draft cost set by cloning costs from an existing published set (or the default set)

**Permission:** TournamentHost, Moderator, or Admin (`ensureTournamentHost`)

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Cost set name (1–100 chars after trim) |
| sourceSetId | u32 | Yes | Source cost set to clone from (0 = default set) |
| gameModeTag | string | Yes | "MemoryOfChaos", "ApocalypticShadow", or "AnomalyArbitration" |

**Flow:**
1. `ensureTournamentHost` — require TournamentHost+ role
2. Validate name: 1–100 chars after trim
3. Validate gameModeTag is one of the 3 valid values
4. If sourceSetId !== 0: verify source exists and isPublished=true
5. Insert CostSet row (isDraft=true, isPublished=false, isLocked=false, creatorId=caller)
6. Clone HsrCharacterCost rows from source into CostSetDraftCharacter, filtered by gameModeTag
7. Clone HsrLightconeCost rows from source into CostSetDraftLightcone, filtered by gameModeTag
8. Clone HsrSynergyCost rows from source into CostSetDraftSynergy, filtered by gameModeTag

**Expected State Changes:**
- CostSet row inserted (isDraft=true, isPublished=false)
- CostSetDraftCharacter rows inserted (cloned from source, filtered by gameMode)
- CostSetDraftLightcone rows inserted (cloned from source, filtered by gameMode)
- CostSetDraftSynergy rows inserted (cloned from source, filtered by gameMode)

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Caller lacks TournamentHost+ | Permission error from ensureTournamentHost |
| Name too short or too long | "Cost set name must be between 1 and 100 characters." |
| Invalid gameModeTag | "Invalid gameModeTag. Must be one of: MemoryOfChaos, ApocalypticShadow, AnomalyArbitration" |
| Source set not found | "Source cost set {sourceSetId} not found." |
| Source set not published | "Source cost set {sourceSetId} must be published before cloning." |

### edit_draft_character_cost

**Purpose:** Upsert a character's cost row in the draft table (delete+insert pattern for composite PK)

**Permission:** Cost set owner or Moderator+

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| costSetId | u32 | Yes | Target draft cost set |
| characterName | string | Yes | Character to edit |
| gameModeTag | string | Yes | Game mode for this cost entry |
| classicCostsJson | string | Yes | JSON object with e0–e6 numeric fields (EidolonCost) |
| auctionBaseBidJson | string | Yes | JSON object with e0–e6 numeric fields (auction base bids) |

**Flow:**
1. Authenticate caller
2. Find CostSet by ID
3. Ownership check: caller is creator or Moderator+
4. Verify costSet.isDraft=true
5. Parse and validate classicCostsJson and auctionBaseBidJson: must be valid JSON with numeric e0–e6 fields
6. Find existing CostSetDraftCharacter row (by costSetId + characterName + gameModeTag)
7. If found: delete old row, insert updated row (composite PK upsert pattern)
8. If not found: insert new row

**Expected State Changes:**
- CostSetDraftCharacter row upserted for (costSetId, characterName, gameModeTag)

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Cost set not found | "Cost set {costSetId} not found." |
| Not owner and not Moderator+ | "Forbidden: You do not own this cost set and are not a Moderator." |
| Cost set not in draft state | "Cannot edit a cost set that is not in draft state. Publish creates a live copy; clone to make a new draft." |
| Invalid JSON or missing e0–e6 fields | "classicCostsJson and auctionBaseBidJson must be valid JSON objects." / "classicCostsJson must have numeric field \"{key}\"." |

### edit_draft_lightcone_cost

**Purpose:** Upsert a lightcone's cost row in the draft table

**Permission:** Cost set owner or Moderator+

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| costSetId | u32 | Yes | Target draft cost set |
| lightconeName | string | Yes | Lightcone to edit |
| gameModeTag | string | Yes | Game mode for this cost entry |
| classicCostsJson | string | Yes | JSON object with s1–s5 numeric fields (SuperimpositionCost) |
| auctionBaseBidJson | string | Yes | JSON object with s1–s5 numeric fields |

**Flow:**
1. Authenticate caller; find CostSet; ownership check; verify isDraft
2. Parse and validate classicCostsJson and auctionBaseBidJson: must be valid JSON with numeric s1–s5 fields
3. Upsert CostSetDraftLightcone row (delete+insert for composite PK)

**Expected State Changes:**
- CostSetDraftLightcone row upserted for (costSetId, lightconeName, gameModeTag)

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Cost set not found | "Cost set {costSetId} not found." |
| Not owner and not Moderator+ | "Forbidden: You do not own this cost set and are not a Moderator." |
| Cost set not in draft state | "Cannot edit a cost set that is not in draft state." |
| Invalid JSON or missing s1–s5 fields | "classicCostsJson and auctionBaseBidJson must be valid JSON objects." / "classicCostsJson must have numeric field \"{key}\"." |

### edit_draft_synergy_cost

**Purpose:** Upsert a synergy cost modifier in the draft table

**Permission:** Cost set owner or Moderator+

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| costSetId | u32 | Yes | Target draft cost set |
| sourceName | string | Yes | Source character name for synergy |
| targetName | string | Yes | Target character name for synergy |
| gameModeTag | string | Yes | Game mode for this synergy entry |
| costModifier | f32 | Yes | Synergy cost modifier value |

**Flow:**
1. Authenticate caller; find CostSet; ownership check; verify isDraft
2. Find existing CostSetDraftSynergy row (by costSetId + sourceName + targetName + gameModeTag)
3. Upsert (delete+insert for composite PK)

**Expected State Changes:**
- CostSetDraftSynergy row upserted for (costSetId, sourceName, targetName, gameModeTag)

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Cost set not found | "Cost set {costSetId} not found." |
| Not owner and not Moderator+ | "Forbidden: You do not own this cost set and are not a Moderator." |
| Cost set not in draft state | "Cannot edit a cost set that is not in draft state." |

### publish_cost_set

**Purpose:** Copy all draft rows to live cost tables, clean up draft tables, mark CostSet as published

**Permission:** Cost set owner or Moderator+

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| costSetId | u32 | Yes | Draft cost set to publish |

**Flow:**
1. Authenticate caller; find CostSet; ownership check
2. Verify costSet.isDraft=true
3. Phase A: For each CostSetDraftCharacter row → upsert into HsrCharacterCost (delete existing live row if present, then insert)
4. Phase B: For each CostSetDraftLightcone row → upsert into HsrLightconeCost
5. Phase C: For each CostSetDraftSynergy row → upsert into HsrSynergyCost (id.update if exists, insert if not — preserves autoInc id)
6. Phase D: Delete all CostSetDraft* rows for this costSetId
7. Phase E: Update CostSet: isPublished=true, isDraft=false

**Expected State Changes:**
- HsrCharacterCost rows upserted from draft (live table updated)
- HsrLightconeCost rows upserted from draft
- HsrSynergyCost rows upserted from draft
- All CostSetDraftCharacter, CostSetDraftLightcone, CostSetDraftSynergy rows deleted
- CostSet.isPublished=true, CostSet.isDraft=false

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Cost set not found | "Cost set {costSetId} not found." |
| Not owner and not Moderator+ | "Forbidden: You do not own this cost set and are not a Moderator." |
| Cost set not in draft state | "Cannot publish a cost set that is not in draft state." |

### lock_cost_set

**Purpose:** Set isLocked=true on a published cost set, preventing new lobbies/tournaments from selecting it

**Permission:** Cost set owner or Moderator+

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| costSetId | u32 | Yes | Published cost set to lock |

**Flow:**
1. Reject if costSetId=0 (default set protected)
2. Authenticate caller; find CostSet; ownership check
3. Verify costSet.isPublished=true
4. Verify costSet.isLocked=false
5. Update CostSet.isLocked=true

**Expected State Changes:**
- CostSet.isLocked = true

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Attempting to lock default set | "The default cost set (id=0) cannot be locked." |
| Cost set not found | "Cost set {costSetId} not found." |
| Not owner and not Moderator+ | "Forbidden: You do not own this cost set and are not a Moderator." |
| Cost set not published | "Cannot lock a cost set that is not published." |
| Already locked | "Cost set is already locked." |

### unpublish_cost_set

**Purpose:** Remove a cost set from public availability (requires locking first)

**Permission:** Cost set owner or Moderator+

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| costSetId | u32 | Yes | Locked cost set to unpublish |

**Flow:**
1. Reject if costSetId=0 (default set protected)
2. Authenticate caller; find CostSet; ownership check
3. Verify costSet.isPublished=true
4. Verify costSet.isLocked=true (must lock before unpublishing)
5. Update CostSet: isPublished=false, isLocked=false

**Expected State Changes:**
- CostSet.isPublished = false, CostSet.isLocked = false
- Live cost rows (HsrCharacterCost etc.) remain in tables but CostSet metadata signals "inactive"

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Attempting to unpublish default set | "The default cost set (id=0) cannot be unpublished." |
| Cost set not found | "Cost set {costSetId} not found." |
| Not owner and not Moderator+ | "Forbidden: You do not own this cost set and are not a Moderator." |
| Not published | "Cost set is not published." |
| Not locked first | "Cost set must be locked before it can be unpublished. Call lock_cost_set first." |

### delete_cost_set

**Purpose:** Permanently delete a cost set and all associated live and draft cost rows

**Permission:** Cost set owner or Moderator+

**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| costSetId | u32 | Yes | Unpublished cost set to delete |

**Flow:**
1. Reject if costSetId=0 (default set protected)
2. Authenticate caller; find CostSet; ownership check
3. Verify costSet.isPublished=false (must unpublish first)
4. Delete all HsrCharacterCost rows with this costSetId
5. Delete all HsrLightconeCost rows with this costSetId
6. Delete all HsrSynergyCost rows with this costSetId (via id.delete)
7. Delete all remaining CostSetDraftCharacter, CostSetDraftLightcone, CostSetDraftSynergy rows
8. Delete the CostSet row

**Expected State Changes:**
- All HsrCharacterCost rows for this costSetId deleted
- All HsrLightconeCost rows for this costSetId deleted
- All HsrSynergyCost rows for this costSetId deleted
- All draft rows deleted
- CostSet row deleted

**Error Cases:**
| Condition | Error Message |
|-----------|--------------|
| Attempting to delete default set | "The default cost set (id=0) cannot be deleted." |
| Cost set not found | "Cost set {costSetId} not found." |
| Not owner and not Moderator+ | "Forbidden: You do not own this cost set and are not a Moderator." |
| Still published | "Cost set must be unpublished before deleting. Call unpublish_cost_set first." |

## Acceptance Scenarios

### Create Cost Set (clone from source)
**Given:** User with TournamentHost+ role, source cost set exists and is published
**When:** `create_cost_set(name, sourceSetId, gameModeTag)`
**Then:** CostSet row created (isDraft=true, isPublished=false). Draft tables populated with cloned rows from source set filtered by gameMode.

### Edit Draft Costs
**Given:** Unpublished cost set owned by caller
**When:** `edit_draft_character_cost(costSetId, characterName, gameModeTag, classicCostsJson, auctionBaseBidJson)`
**Then:** Draft character cost row upserted
**When:** `edit_draft_lightcone_cost(costSetId, lightconeName, gameModeTag, classicCostsJson, auctionBaseBidJson)`
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

| Case | Expected Behavior | Notes |
|------|-------------------|-------|
| Lock default set (id=0) | Throws "The default cost set (id=0) cannot be locked" | |
| Unpublish default set (id=0) | Throws "The default cost set (id=0) cannot be unpublished" | |
| Delete default set (id=0) | Throws "The default cost set (id=0) cannot be deleted" | |
| Unpublish without locking first | Throws "Cost set must be locked before it can be unpublished. Call lock_cost_set first." | |
| Delete while still published | Throws "Cost set must be unpublished before deleting. Call unpublish_cost_set first." | |
| Edit draft of another user's cost set (non-Moderator) | Throws "Forbidden: You do not own this cost set and are not a Moderator." | |
| Clone from unpublished source | Throws "Source cost set {id} must be published before cloning." | |
| Name too long (>100 chars) | Throws "Cost set name must be between 1 and 100 characters." | |
| Empty name after trim | Throws "Cost set name must be between 1 and 100 characters." | |
| classicCostsJson missing e0 field for character | Throws "classicCostsJson must have numeric field \"e0\"." | |
| classicCostsJson missing s1 field for lightcone | Throws "classicCostsJson must have numeric field \"s1\"." | |

## Integration Points

| This Feature | Connects To | How | Direction |
|-------------|------------|-----|-----------|
| CostSet.creatorId | User.id | FK reference | Reads |
| Tournament.costSetId | CostSet.id | Tournament reads active cost set | Reads |
| HsrCharacterCost.costSetId | CostSet.id | Live cost rows keyed to set | Writes on publish |
| HsrLightconeCost.costSetId | CostSet.id | Live cost rows keyed to set | Writes on publish |
| HsrSynergyCost.costSetId | CostSet.id | Live cost rows keyed to set | Writes on publish |
| CostSetDraftCharacter/Lightcone/Synergy | CostSet.id | Draft rows private per set | Writes on edit |

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
| Full hydration from codebase — Reducers section added | Phase 13 normalization | 2026-04-09 |

---

*Last updated: 2026-04-09*
*Feature owner: Phase 3*
