---
created: 2026-04-14T14:28:59.981Z
title: Synergy half-assignment math + lobby broadcast
area: database
files:
  - spacetimedb/src/reducers/postDraft.ts
  - spacetimedb/src/reducers/draftClassic.ts
  - spacetimedb/src/reducers/draftAuction.ts
  - spacetimedb/src/tables/hsrSynergyCost.ts
---

## Problem

Synergy cost modifiers (`HsrSynergyCost.costModifier`) are currently **dormant** — defined in schema and broadcast in `view_my_draft_synergy_costs`, but no draft reducer reads them. User's intended behavior, stated during Phase 15.1 discussion:

> "This happens during the phase of the draft that the players select to which half (first half or second half) their drafted characters would go. Like, if 2 characters have synergy cost and they both go to the same half, their cost increases; and if they don't go to the same half, they don't increase cost. This has to be shown to everybody in the lobby, not just the player that is moving stuff around. Auction mode may be a bit different, but we basically would consume extra point of their budget after the bid phase is done to see if they can fit both characters in the same half using their lightcone budget."

So the feature is:

1. **Post-draft "half assignment" step** — each team assigns its drafted characters to first-half vs second-half slots. This assignment is player-visible lobby state; dragging a character between halves must broadcast to every lobby member, not just the player making the edit.
2. **Classic mode:** while a player is arranging halves, if any pair in `HsrSynergyCost` where `sourceName` and `targetName` both land in the same half, the pairing's `costModifier` is added to that team's running cost total. Other team members watch the deltas live.
3. **Auction mode:** same pair-in-same-half detection, but the cost surcharge is deducted from the team's **lightcone budget** after the auction bid phase completes. If the team can't afford the surcharge, the arrangement is invalid — they must either split the pair across halves or free up LC budget.

Blocked by: the **cost-table draftMode restructure** (`cost-table-draft-mode-restructure` todo). That phase introduces synergy auction support (`draftMode=Auction` rows on `HsrSynergyCost`). Before then, only classic synergy values exist.

## Solution

This is a Match-Data phase (user's term, not yet a roadmap phase). Likely shape:

Schema additions (probably):
- New table or extension that records per-character half assignment, subscribed by all lobby members. Candidate: extend `MatchSessionStep` with an `ArrangeLineup` action (already exists in `StepPayload` — `ArrangeLineupPayload.positions` is a JSON string of position array).
- Or a dedicated `MatchSessionLineup` row per (lobbyId, teamSide, characterName, half).

Reducer additions:
- `arrange_lineup(lobbyId, teamSide, positionsJson)` — mutates the per-character half state. `ctx.sender` authorization: member of the team. Broadcast via subscription ensures all lobby members see the change.
- Classic mode: the arrangement itself does not affect budget (cost already paid); synergy calculation becomes a derived/frontend concern, but the SERVER must still compute it into the final match record at finalization.
- Auction mode: `arrange_lineup` runs synergy math, compares against `teamBlueLcBudget` / `teamRedLcBudget`, rejects the mutation if it overflows.

Frontend consumers (Phase 40/41 replay + match-drafting UI):
- Subscribe to `MatchSessionLineup` (or the chosen mechanism) to render each team's half assignment in real time.
- Show per-team current synergy cost and remaining budget.

Questions to resolve in the dedicated phase:
- Should the lineup assignment be finalized via `ConfirmLineup` step (already exists in `StepPayload`) before the match can start?
- How to handle auction-mode invalid arrangements — soft warning + blocker on `ConfirmLineup`, or hard reject on every `arrange_lineup` call?
- Replay: `MatchSessionStep` logs `ArrangeLineup` / `ConfirmLineup` payloads — is that sufficient, or do we need a separate history snapshot?

Triggering context: Phase 15.1 discussion (2026-04-14), GA-2 clarification that synergy math lives in a future Match-Data phase.
