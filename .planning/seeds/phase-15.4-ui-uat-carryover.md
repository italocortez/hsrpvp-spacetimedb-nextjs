---
title: Phase 15.4 UI UAT items deferred to cost-table / admin-panel phases
planted_date: 2026-04-15
trigger_condition: "At the start of /gsd-discuss-phase for Phase 17 (Cost tables — data), Phase 18 (Cost tables — UX), Phase 22 (Admin panel — data), or Phase 23 (Admin panel — UX). Also surface when answering the verify-work question 'is there an existing UAT to fold into this phase's test plan?'"
status: deferred
origin_phase: 15.4-cost-table-draftmode-restructure
origin_artifact: .planning/phases/15.4-cost-table-draftmode-restructure/15.4-UAT.md
---

# Phase 15.4 UI UAT — carry-forward

## Why this seed exists

Phase 15.4 (cost-table draftMode restructure) shipped a load-bearing schema change + minimal frontend fix-to-compile (D-26 scope discipline). The UAT run at phase close covered:

- ✓ Test 1: Cold start smoke — publish + post-publish + homepage load
- ✓ Test 2: Maincloud synergy schema shape — Classic + Auction rows alternate correctly

The remaining six user-observable tests require clicking through UI surfaces that Phase 15.4 explicitly did NOT redesign. Running them now would either:
- Pass trivially against the minimal fix-to-compile surface (low signal), or
- Expose "issues" that are actually documented out-of-D-26-scope items (noise — Plan 02 SUMMARY enumerates them).

So they're deferred to the phase that owns the corresponding UI.

## Tests to fold into future phase UAT plans

| 15.4 Test # | Description | Belongs to |
|-------------|-------------|------------|
| 3 | Admin bulk-upsert UI renders `costs` struct + `draftMode` column; TableExplorer cost-table view | **Phase 22/23 (Admin panel — data/UX)** |
| 4 | Team builder — character cost renders per `(gameMode, draftMode)` | **Phase 19/20 (Team builder — data/UX)** |
| 5 | Team builder — lightcone cost renders deterministically (WR-01 fix regression guard) | **Phase 19/20 (Team builder — data/UX)** |
| 6 | Team builder — pairing synergies display per D-31 filter; Auction synergies hidden until Auction UI exists | **Phase 19/20 (Team builder — data/UX)** |
| 7 | Admin cost-set draft edit → publish → both Classic AND Auction live rows (Pitfall 7 regression guard) | **Phase 22/23 (Admin panel — data/UX)** |

## Explicit deferral context — do not re-discuss at Phase 17/18 unless scope shifts

Phase 17 (Cost tables — data) and Phase 18 (Cost tables — UX) are where idiomatic new-shape frontend code lands (per 15.4-02 SUMMARY). If Phase 17/18 ends up owning the admin cost editor too (rather than Phase 22/23), move Tests 3 + 7 to its UAT plan.

## Known out-of-scope surfaces (do NOT treat as Phase 15.4 regressions)

Documented in `15.4-02-SUMMARY.md` — Plan 02 "No-op inventory for Phase 17":

- `components/features/types/enums.ts` — DraftMode already surfaced
- `components/features/admin-view/components/TableExplorer.tsx` — generic rendering; `getPrimaryKeyJson` for HsrCharacterCost/HsrLightconeCost is stale under the new PK (out of D-26 scope, belongs to Phase 22/23)
- `components/features/team-builder/SynergyDisplay.tsx` — consumes projected `Synergy[]`; D-31 Auction filter applied upstream at provider
- `components/features/team-builder/cost-breakdown-chart/CostBreakdownChart.tsx` — clean cascade through DataHelpers types
- `useLightconeCostTable` + `getLightconeCost` — last-wins collapse across `gameMode` because `LightconeCost` return type has no `gameMode` axis today. WR-01 fix made this deterministic (`MemoryOfChaos` canonical pick), but the full redesign belongs to Phase 17.

If a Phase 17/18/19/20/22/23 UAT reveals one of these as a user-blocker, it's a new phase-specific issue, not a 15.4 carryover.

## Behavioral expectations locked in 15.4 that future UAT must preserve

- Row-absence rule (D-10/D-14): absent `(name, gameMode, draftMode)` row → cost reads as 0, not an error.
- Pitfall 6 (WR-04 fix): postDraft `MatchSessionStep` inserts stamp `gameNumber`. Archival in bestOf>1 matches preserves step-to-game attribution.
- Pitfall 7 (test coverage locked by 15.4-04 `cost-set-lifecycle.test.ts`): `publish_cost_set` copies BOTH Classic and Auction draft rows to live. Admin edit → publish UAT (Test 7 above) must assert this at the SQL level.
- D-13 zero-value-default Auction synergy rows: first-ever seeded. Team builder UAT must not regress these to missing rows.

## Reference artifacts

- Plan SUMMARYs: `.planning/phases/15.4-cost-table-draftmode-restructure/15.4-0{1..4}-SUMMARY.md`
- Verification: `.planning/phases/15.4-cost-table-draftmode-restructure/15.4-VERIFICATION.md`
- Code review + fixes: `15.4-REVIEW.md`, `15.4-REVIEW-FIX.md`
- UAT with tests 1+2 passed, tests 3-8 deferred-skipped with this seed as the forward pointer: `15.4-UAT.md`

## Promotion

When the trigger condition fires, the Phase N planner agent should:

1. Read this seed.
2. Copy the relevant test rows from the table above into the new phase's UAT plan, rephrased against that phase's SUMMARY deliverables.
3. Add the "Behavioral expectations locked in 15.4" list to that phase's regression-guard checks.
4. Mark this seed `promoted` once folded in; leave the origin artifacts in place as historical record.
