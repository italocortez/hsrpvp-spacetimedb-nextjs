---
created: 2026-04-14T00:00:00.000Z
title: Team-builder SynergyDisplay — Auction mode wiring
area: frontend
files:
  - components/features/team-builder/SynergyDisplay.tsx
  - components/features/team-builder/cost-breakdown-chart/CostBreakdownChart.tsx
source: Phase 15.4 D-31 (deferred during plan-checker revision 1)
---

## Problem

`components/features/team-builder/SynergyDisplay.tsx` was locked to Classic-only during Phase 15.4 (D-31). Phase 15.4's goal includes "introduces synergy auction support" at the backend data/reducer layer — the schema now carries `draftMode: 'Auction'` rows on `HsrSynergyCost`, and every default seed produces 30 zero-valued auction synergy rows. However, the team-builder UI has no path to dispatch between Classic and Auction synergy display based on the active lobby's draft mode.

Specifically, `SynergyDisplay.tsx` currently hardcodes a `.filter(r => r.draftMode?.tag === 'Classic')` predicate (per Phase 15.4 D-26 + D-31). Consumers of this component do not pass the active `draftMode` down from the lobby context, so the component has no signal to switch.

## Solution

1. Identify the component's consumer path — where is `SynergyDisplay` rendered? Walk up to the nearest lobby-aware ancestor and surface the active `draftMode` (from the lobby row / match session) as a prop or via a `useActiveLobby()` hook.
2. Replace the hardcoded `'Classic'` filter with a dynamic filter driven by the consumed value. Fall back to `'Classic'` when no lobby context exists (e.g., standalone team-builder preview).
3. `CostBreakdownChart.tsx` likely has the same issue — audit it for similar hardcoded dispatch once the lobby-context plumbing exists.
4. Add a small visual indicator when auction synergies render (so users can tell they're looking at auction-mode values, especially while default seed values are still 0).

## Blocking / Precedence

- Depends on: Phase 15.4 lands cleanly (schema + seed + tests green).
- Does NOT depend on: synergy half-assignment math (`2026-04-14-synergy-half-assignment-math-and-broadcast.md`) — this is purely a display-switching concern.
- Related: if the user opens a follow-up phase for "cost tables — data" (current roadmap Phase 17), this todo may fold into that phase's discuss stage.

## Workaround (interim)

If a developer needs to preview Auction synergy display before this todo lands, they can temporarily swap the hardcoded `'Classic'` → `'Auction'` in `SynergyDisplay.tsx` locally. Do not commit that swap; it's a local-only debug aid.
