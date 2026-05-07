---
created: 2026-04-14T14:28:59.981Z
title: Lobby-creation cost-set coverage validation
area: database
files:
  - spacetimedb/src/reducers/lobby.ts
  - spacetimedb/src/tables/costSet.ts
  - spacetimedb/src/tables/hsrCharacterCost.ts
  - spacetimedb/src/tables/hsrLightconeCost.ts
---

## Problem

After Phase 15.1 + the future `draftMode` restructure (see `cost-table-draft-mode-restructure` todo), custom cost sets can ship with **partial coverage** — e.g., only `MemoryOfChaos × Classic` configured, with every other (gameMode × draftMode) combination empty or zero-padded.

When a lobby host selects such a cost set for a lobby whose `gameMode + draftMode` is not covered, every character's cost resolves to **0** via the `?? 0` fallback in `draftClassic.ts:368` / `draftAuction.ts:61` / `postDraft.ts:55`. The draft proceeds but produces a nonsense result — all characters are free, the budget gate is trivial, and the match record is meaningless.

The system doesn't reject this today. There is no `create_lobby` / cost-set-selection validation that verifies the chosen cost set actually covers the lobby's draft context.

This blocks on the `draftMode` restructure because the right coverage check depends on the per-row `draftMode` shape. Under the current shape, "row exists with `auctionBaseBid = {e0:0,…}`" could be either "configured with zero cost" or "zero-padded because not configured" — can't be distinguished.

## Solution

After `cost-table-draft-mode-restructure` lands:

1. Add a helper `doesCostSetCover(costSetId, gameMode, draftMode): boolean` that checks whether at least one `HsrCharacterCost` row exists with the given (costSetId, gameMode, draftMode) tuple (row absence = not configured, with draftMode column distinguishing sides).
2. In `create_lobby` (and any reducer that sets `lobby.costSetId` or changes `lobby.gameMode` / `lobby.draftMode` after creation), reject with a SenderError if `costSetId != 0` and `doesCostSetCover` returns false.
3. Default set (`costSetId = 0`) always passes — the seed invariant guarantees full coverage across all (gameMode × draftMode) combinations, plus the `draftMode=Auction` rows that the restructure phase introduces.
4. Surface a friendly error to the lobby creation UI: "This cost set doesn't have costs for {mode × draftMode}. Pick another set or ask the set owner to extend it."

Coverage granularity:
- "At least one character row" is the loose check — the strict check would require all characters to have rows for the selected (mode × draftMode). Loose is probably right for custom organizer experimentation; strict makes the error noisier. Dedicated phase picks the convention.

Lightcone tables need the same check for lobbies where LC costs matter (classic lobbies? or all?). `HsrLightconeCost` rows are queried during the `EquipLightcone` step via `postDraft.ts:47-61` — if no row exists, LC cost is 0, and the LC budget gate is trivial. Same validation pattern.

Synergy: after the restructure, `HsrSynergyCost` also carries a `draftMode` column. Coverage check for pairings is looser still — pairings are an optional modifier, so "no pairings configured for this mode × draftMode" is a valid state (zero synergy cost), not a rejection condition.

Triggering context: Phase 15.1 discussion (2026-04-14), noted as a follow-on gap that emerges once partial custom sets are allowed.
