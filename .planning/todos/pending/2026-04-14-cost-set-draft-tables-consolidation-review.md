---
created: 2026-04-14T14:28:59.981Z
title: CostSetDraft* tables consolidation review
area: database
files:
  - spacetimedb/src/tables/costSetDraftCharacter.ts
  - spacetimedb/src/tables/costSetDraftLightcone.ts
  - spacetimedb/src/tables/costSetDraftSynergy.ts
  - spacetimedb/src/reducers/costSetManagement.ts
  - spacetimedb/src/tables/costSet.ts
  - spacetimedb/src/tables/matchSessionHistory.ts
  - docs/cost-sets/architecture.md
---

## Problem

The cost-set system maintains three `CostSetDraft*` tables (`CostSetDraftCharacter`, `CostSetDraftLightcone`, `CostSetDraftSynergy`) as `public: false` staging tables. Organizers edit drafts; `publish_cost_set` atomically copies draft → live (`HsrCharacterCost` / `HsrLightconeCost` / `HsrSynergyCost`); `unpublish_cost_set` toggles metadata only. The stated purpose is to prevent in-progress edits from broadcasting to every connected client and to hide "unfinished" cost sets from lobby selection.

User surfaced a design question during Phase 15.1 discussion:
> "Maybe we don't need the costSetDraft or maybe just for specific cases, the whole idea to had them was to avoid users from using 'unfinished' cost sets for their drafts, but maybe a view could solve that?"

Counter-arguments that need to be addressed before any removal:

1. **Broadcast cost.** Current `HsrCharacterCost` scale is 83 chars × 3 modes = 249 rows per cost set; `HsrLightconeCost` is 156 × 3 = 468 rows. If live tables become the editing surface, every keystroke during cost editing pushes a row update to every subscribed client (lobby-browser users, cost-table page visitors, etc.). At 100 concurrent users and a tournament organizer tuning costs, that's hundreds of egress broadcasts per minute. `CostSetDraft*` exists precisely to avoid this — private tables don't broadcast.
2. **History integrity.** `match_session_history.cost_set_id` references the CostSet at match-finalization time. If organizers can mutate live cost values post-publish (which they can today only by re-unpublishing → editing → republishing through the draft flow), replay fidelity is already at risk. Removing the draft staging makes mutation of in-flight live values the default, and replays would silently misquote historical costs unless the history layer starts snapshotting cost-set contents per match. That's a schema addition, not a deletion.
3. **View-based gating doesn't replace private tables.** A view filters what clients SEE, but SpacetimeDB public table changes broadcast to all subscribers independently of any view. You can't view-gate a write broadcast without making the backing table private.

## Solution

Architectural review phase — not a simple "delete the tables" task. Before any code change:

1. **Quantify broadcast cost.** Instrument the dev environment: measure bytes-per-keystroke broadcast overhead if `HsrCharacterCost` were the editing surface vs the current draft flow. Compare against the v0.5 energy budget (see `project_data_scale` memory).
2. **Decide on history snapshot strategy.** If drafts are kept, replay is safe as-is. If drafts are removed, every match-finalization must snapshot the cost-set contents (either into `match_session_history` as denormalized rows, or into a new `MatchCostSetSnapshot` table). Schema + reducer work required.
3. **Evaluate hybrid options.**
    - Keep drafts for "work-in-progress" edits; once published, allow direct edits on live rows via a new `edit_published_cost_set_*` reducer that bumps a version on `CostSet` and triggers a history snapshot.
    - Or keep drafts always, but simplify the `publish_cost_set` copy semantics (e.g., move rather than copy).
4. **Document outcome.** Update `docs/cost-sets/architecture.md` and `docs/cost-sets/contract.md` with the decision and phase provenance.

This is likely a backlog investigation, not a next-up phase. Promote to a roadmap phase only after broadcast measurement confirms it's worth the refactor and history strategy is decided.

Triggering context: Phase 15.1 discussion (2026-04-14), user-surfaced design question about staging tables.
