---
phase: 09-mouse-tracking-chat-and-lobby-browser
plan: 07
subsystem: database
tags: [spacetimedb, auction-draft, bidding, nominate, steal-skip, budget-enforcement]

# Dependency graph
requires:
  - phase: 09-06
    provides: draftClassic.ts with start_draft + ban/pick pattern; draftSequences.ts with buildAuctionBanSequence; MatchSession with isAuctionPhase/auction state columns

provides:
  - nominate_character: turn-based nomination at base cost from cost table (D-47/D-53)
  - place_bid: alternating bids with minimum raise enforcement and budget cap (D-48/D-53)
  - pass_bid: auction resolution with AuctionSold step, steal-skip logic, budget deduction, auction-end Equipping transition (D-46/D-48)
  - timer_expiry_auction: auto-nominates EMPTY, auto-resolves bid phase on timeout (D-43/D-54)

affects: [09-08, 09-09, uat-auction-draft, docs/match-session/architecture.md]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Auction character exclusivity via getAuctionWonCharacters (AuctionSold step scan)"
    - "Steal-skip: nominatingTeam.tag !== winningTeam.tag → keep nominator; else rotate"
    - "Base cost lookup via auctionCosts[e${eidolon}] on HsrCharacterCost row"
    - "Eidolon retrieval from Nominate step via payload.value cast to any (SpacetimeDB union narrowing)"

key-files:
  created:
    - spacetimedb/src/reducers/draftAuction.ts
    - src/module_bindings/nominate_character_reducer.ts
    - src/module_bindings/pass_bid_reducer.ts
    - src/module_bindings/place_bid_reducer.ts
    - src/module_bindings/timer_expiry_auction_reducer.ts
  modified:
    - spacetimedb/src/index.ts

key-decisions:
  - "getAuctionWonCharacters scans AuctionSold steps for exclusivity — auction characters are always exclusive (D-42)"
  - "Steal-skip implemented by comparing nominatingTeam (from Nominate step actorSlot) vs winningTeam (currentBidTeam)"
  - "Eidolon recovery in pass_bid/timer_expiry uses (nominateStep.payload.value as any).eidolon — TypeScript cannot narrow StepPayload union without explicit cast"
  - "Budget exhaustion auto-pass not auto-triggered in pass_bid: EMPTY CHARACTER at 0 cost always available, so timer expiry handles it naturally"
  - "Auction end check: 8 * lobby.teamSize per team (scales with teamSize)"

patterns-established:
  - "Nominate step actorSlot records the nominating team for steal-skip determination"
  - "AuctionSold step payload carries winningTeam, winningAmount, and eidolon for finalization replay"

requirements-completed: [MOUS-03]

# Metrics
duration: 15min
completed: 2026-03-29
---

# Phase 09 Plan 07: Auction Draft System Summary

**Auction draft with nomination at base cost, alternating bids with minimum raise, steal-skip nominator rotation, and auto-resolve on timer expiry — 4 reducers published to maincloud.**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-29T12:08:31Z
- **Completed:** 2026-03-29T12:23:00Z
- **Tasks:** 1
- **Files modified:** 6

## Accomplishments

- `nominate_character`: turn check via `nextNominatorTeam`, coach guard, character exclusivity (AuctionSold scan), budget check, base cost from cost table, sets `currentNomination`/`currentBidAmount`/`currentBidTeam`
- `place_bid`: validates opposite-team bidder, minimum raise (`currentBidAmount + minimumBidRaise`), budget cap, advances `currentBidTeam`
- `pass_bid`: resolves auction → AuctionSold step, deducts budget, increments `blueCharactersWon`/`redCharactersWon`, steal-skip nominator rotation, transitions to Equipping when both teams reach `8 * teamSize`
- `timer_expiry_auction`: auto-nominates EMPTY (nomination phase) or auto-resolves auction with same steal-skip + end logic as pass_bid (bid phase)

## Task Commits

1. **Task 1: Create draftAuction.ts with nominate, bid, pass, and timer_expiry_auction** - `de2e8c7` (feat)

**Plan metadata:** (pending — see final commit)

## Files Created/Modified

- `spacetimedb/src/reducers/draftAuction.ts` — 4 auction reducers + shared helpers
- `spacetimedb/src/index.ts` — export for all 4 auction reducers added
- `src/module_bindings/nominate_character_reducer.ts` — generated binding
- `src/module_bindings/pass_bid_reducer.ts` — generated binding
- `src/module_bindings/place_bid_reducer.ts` — generated binding
- `src/module_bindings/timer_expiry_auction_reducer.ts` — generated binding

## Decisions Made

- `(nominateStep.payload.value as any).eidolon` cast required — TypeScript cannot narrow the `StepPayload` union type even with a `.tag === 'Nominate'` filter on the step array, since intermediate typed variables don't propagate the narrowing through `.find()` / `.sort()` chains.
- Budget exhaustion auto-pass not inline in `pass_bid`: since EMPTY CHARACTER always costs 0, any team with 0 budget can still nominate. Timer expiry handles the AFK case; no need to auto-skip the nominator in the synchronous flow.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

TypeScript compiler error on `nominateStep.payload.value.eidolon` (TS2339) — `StepPayload` is a union enum; TypeScript loses narrowing after `.sort()[0]`. Fixed with `(nominateStep.payload.value as any).eidolon` cast. Pattern consistent with existing reducer code in this codebase.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Auction draft system complete. All 4 reducers live on maincloud.
- `pass_bid` and `timer_expiry_auction` both handle the Equipping transition when auction ends.
- Ready for Plan 08 (post-draft: equip lightcone, arrange lineup, confirm lineup).

## Self-Check: PASSED

- `spacetimedb/src/reducers/draftAuction.ts` — FOUND
- `.planning/phases/09-mouse-tracking-chat-and-lobby-browser/09-07-SUMMARY.md` — FOUND
- Commit `de2e8c7` — FOUND

---
*Phase: 09-mouse-tracking-chat-and-lobby-browser*
*Completed: 2026-03-29*
