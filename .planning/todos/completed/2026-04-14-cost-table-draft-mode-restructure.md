---
created: 2026-04-14T14:28:59.981Z
updated: 2026-04-14T15:30:00Z (full blast-radius audit after Phase 15.1 close)
title: Cost-table draftMode column restructure
area: database
roadmap_phase: 15.4 (inserted 2026-04-14, commit b19b873)
files:
  # Schema + tables (6)
  - spacetimedb/src/tables/hsrCharacterCost.ts
  - spacetimedb/src/tables/hsrLightconeCost.ts
  - spacetimedb/src/tables/hsrSynergyCost.ts
  - spacetimedb/src/tables/costSetDraftCharacter.ts
  - spacetimedb/src/tables/costSetDraftLightcone.ts
  - spacetimedb/src/tables/costSetDraftSynergy.ts
  - spacetimedb/src/schema.ts
  # Reducers (6)
  - spacetimedb/src/reducers/admin.ts (HsrCharacterCost / HsrLightconeCost / HsrSynergyCost cases — old line refs ~491-624 stale post-Phase 15.1)
  - spacetimedb/src/reducers/costSetManagement.ts (create_cost_set + publish_cost_set clone/copy logic)
  - spacetimedb/src/reducers/draftClassic.ts (getCharacterBaseCost — filter by draftMode=Classic)
  - spacetimedb/src/reducers/draftAuction.ts (getCharacterBaseCost — filter by draftMode=Auction; remove auctionBaseBid key access)
  - spacetimedb/src/reducers/postDraft.ts (lightcone cost lookup — filter by draftMode=Classic)
  - spacetimedb/src/reducers/server.ts (touches cost types — verify scope during discussion)
  # Views (1)
  - spacetimedb/src/views/costSetViews.ts
  # Frontend (10) — module bindings regen will break TS across all of these
  - components/features/game-data/components/DataHelpers.ts (toEidolonCost / toSuperimpositionCost — collapse to costs filtered by draftMode)
  - components/features/game-data/components/GameDataProvider.tsx
  - components/features/costs/components/CharacterCostTable.tsx
  - components/features/costs/hooks/useCharacterCostTable.ts (filter by draftMode column instead of struct field selection)
  - components/features/costs/hooks/useLightconeCostTable.ts (same pattern)
  - components/features/admin-view/components/BulkUpsert.tsx (admin payload shape)
  - components/features/admin-view/components/TableExplorer.tsx
  - components/features/team-builder/SynergyDisplay.tsx (synergy auction support is new — display path)
  - components/features/team-builder/cost-breakdown-chart/CostBreakdownChart.tsx
  - components/features/types/enums.ts (DraftMode enum location — add if not present)
  - components/features/types/tableColumns.ts
  # Seed (1)
  - scripts/seed-data.ts
  # Test files (7) — full audit, NOT just the 4 from Phase 15.1
  - test/backend/reducers/admin/seed-cost-extraction.test.ts (40 hits — full rewrite, D-18 scenarios)
  - test/backend/reducers/admin/cost-set-pk.test.ts (30 hits — full rewrite, PK tuple is the point)
  - test/backend/reducers/admin/partial-update.test.ts (20 hits — heavy rewrite, struct-column preservation tests)
  - test/shared/seed-data.ts (17 hits — harness rewrite, mirrors prod seed)
  - test/backend/cost-sets/cost-set-lifecycle.test.ts (10 hits — full rewrite, draft→live copy semantics)
  - test/backend/seed/round-trip.test.ts (9 hits — full rewrite, serialization shape)
  - test/backend/match-session/post-draft.test.ts (1 hit — minor update, lightcone cost via reducer call)
  # Module bindings (regen via `spacetime generate`) — both dirs
  - spacetimedb/src/module_bindings/hsr_character_cost_table.ts
  - spacetimedb/src/module_bindings/hsr_lightcone_cost_table.ts
  - spacetimedb/src/module_bindings/hsr_synergy_cost_table.ts
  - spacetimedb/src/module_bindings/edit_draft_character_cost_reducer.ts
  - spacetimedb/src/module_bindings/edit_draft_lightcone_cost_reducer.ts
  - spacetimedb/src/module_bindings/edit_draft_synergy_cost_reducer.ts
  - spacetimedb/src/module_bindings/{index.ts, types.ts}
  - src/module_bindings/* (mirror — same file set, regenerated together)
  - src/module_bindings/view_my_draft_{character,lightcone,synergy}_costs_table.ts
  # Templates (no shape change — confirm)
  - test/data-templates/README.md (mention 15.4 if seed transformation layer changes affect docs)
---

## Problem

Current cost-table schema encodes draft mode as **two parallel struct columns** on each row (`classicCosts` + `auctionBaseBid` on `HsrCharacterCost` / `HsrLightconeCost`; `costModifier` only on `HsrSynergyCost` — no auction counterpart at all). This shape has three consequences:

1. **Ambiguity between "not configured" and "zero cost"** — Phase 15.1 introduces zero-padding on insert for unprovided draft modes. A row with `auctionBaseBid = {e0:0, ..., e6:0}` could mean either "organizer explicitly set auction to free" or "organizer didn't configure auction and we zero-padded." The draft reducers can't tell which, so tournament lobbies can accidentally use a cost set where all characters cost zero in a mode the organizer never configured.
2. **Synergy asymmetry** — `HsrSynergyCost` has no auction column today. Phase 15.1 deferred adding one because the correct shape is the restructure below, not another parallel column that would immediately be thrown away.
3. **Row count inefficiency at custom-set scale** — a tournament organizer who wants to configure a single game mode × single draft mode still has to carry both draft modes' data on each row (real + zero-padded), roughly doubling their payload and DB footprint.

The correct design is a `draftMode: DraftMode` column (enum: `Classic | Auction`) on all three cost tables (and their `CostSetDraft*` counterparts), with the PK tuple extended to include `draftMode`. One row = one (name, gameMode, draftMode, costSetId) combination. Row absence = not configured. This collapses the parallel columns into a single `costs: EidolonCost` / `costs: SuperimpositionCost` / `costModifier: f32` column and makes synergy auction support fall out naturally (just insert a row with `draftMode=Auction`).

**Blocking impact:** Must land **before Phase 16 and Phase 17**. Phase 16 subscribes to cost tables as part of the global foundation; Phase 17 (Cost tables — data) renders cost rows on the frontend. If the restructure ships after them, both phases get rewritten; if it ships before, Phase 17 is written once against the clean shape.

Roadmap slot candidate: **Phase 15.4 (new decimal phase, to be inserted)**.

## Solution

Schema changes:
- `HsrCharacterCost`: drop `classicCosts`, `auctionBaseBid`. Add `costs: EidolonCost` + `draftMode: DraftMode`. PK tuple becomes `(characterName, gameMode, draftMode, costSetId)`.
- `HsrLightconeCost`: same pattern with `SuperimpositionCost`.
- `HsrSynergyCost`: keep `costModifier: f32`. Add `draftMode: DraftMode`. Tuple match becomes `(sourceName, targetName, gameMode, draftMode, costSetId)`. Synergy auction costs land as rows with `draftMode=Auction` — first-ever synergy auction support, no legacy migration needed.
- `CostSetDraftCharacter` / `CostSetDraftLightcone` / `CostSetDraftSynergy`: mirror the above.
- Add `DraftMode` enum to `spacetimedb/src/types/enums.ts` if not present.

Reducer changes:
- `admin_bulk_upsert`: rewrite HsrCharacter/LightconeCost/SynergyCost cases. Tuple match includes `draftMode`. Payload shape: one row per (character/lightcone/pair, mode, draftMode). Partial-update preserves on update; no zero-padding needed (absent row = not configured).
- `edit_draft_character_cost`: drop `classicCostsJson` + `auctionBaseBidJson`; add `costsJson: t.string()` + `draftModeTag: t.string()`.
- `edit_draft_lightcone_cost`: same pattern.
- `edit_draft_synergy_cost`: add `draftModeTag: t.string()` argument.
- `create_cost_set`: clone logic filters draft rows by matching gameMode (unchanged); each source row's `draftMode` carries through.
- `publish_cost_set`: same copy pattern — draft → live row shape is identical, so the copy is a direct struct map.
- `draftClassic.ts:getCharacterBaseCost`: filter cost lookup by `draftMode=Classic`.
- `draftAuction.ts:getCharacterBaseCost`: filter by `draftMode=Auction`. Remove `auctionBaseBid` key access (column no longer exists).
- `postDraft.ts:47-61` lightcone cost lookup: filter by `draftMode=Classic` (equip happens in the classic draft context; verify against match session state).

Seed rewrite:
- `scripts/seed-data.ts` + `test/shared/seed-data.ts`: emit one row per (name, mode, draftMode) combination. Absent sub-block in template → no row emitted (not a zero-row).
- Template JSON shape survives unchanged from Phase 15.1 (still `cost.<mode>.classic` + `cost.<mode>.auction`); the transformation layer fans out differently.

Frontend consumers:
- `DataHelpers.ts:30-54`: replace `toEidolonCost(sheet.classicCosts)` / `toEidolonCost(sheet.auctionBaseBid)` with `sheet.costs` filtered by `sheet.draftMode`.
- `useCharacterCostTable.ts:92` + `useLightconeCostTable.ts:52`: subscription already filters by current draft mode context; rewrite to filter on the `draftMode` column instead of picking between two struct fields.

Test rewrite:
- `test/backend/cost-sets/cost-set-lifecycle.test.ts` — every assertion updates to per-draftMode row shape.
- `test/backend/reducers/admin/cost-set-pk.test.ts` — PK tuple tests updated.
- `test/shared/seed-data.ts` — harness seed updated.
- New tests: synergy auction row insertion/update round-trip; draftMode-based filter coverage.

Data file re-migration:
- `test/data/characters_table.json` / `lightcones_table.json` / `pairing_table.json`: template shape unchanged; only the seed transformation layer changes.
- Pairing entries that carry `cost.<mode>.auction` (currently zero everywhere because synergy auction doesn't exist yet) emit synergy auction rows for the first time.

Module bindings: regenerate after publish. Breaking TS change — every consumer of `classicCosts` / `auctionBaseBid` / `costModifier` struct access is flagged by compiler. Catch-and-fix during the phase.

Not in scope:
- Synergy cost application during half-assignment (separate todo: `synergy-half-assignment-math-and-broadcast`).
- Lobby-creation validation that a cost set covers the lobby's (mode × draft mode) (separate todo: `lobby-creation-cost-set-coverage-validation`).

Promote to a roadmap phase when ready: `/gsd-insert-phase` as Phase 15.4 ("Cost-table draftMode restructure") with `Depends on: Phase 15.1`, slotted before Phase 16.

Triggering context: Phase 15.1 discussion (2026-04-14), where the surgical scope of 15.1 deferred this restructure.
