---
created: 2026-07-06T11:45:00.000Z
title: Convert unused auction budget into a boss-score / cycle advantage
area: database
files:
  - spacetimedb/src/reducers/postDraft.ts:283
  - spacetimedb/src/helpers/finalizationHelpers.ts
  - spacetimedb/src/tables/lobby.ts:17
---

## Problem

In Auction mode, leftover budget is currently inert as an end-state. Leftover
*character* budget carries into the *lightcone* budget at Drafting→Equipping
(D-50, `postDraft.ts:283`), but any budget left after Equipping has NO benefit:
it isn't converted, isn't scored, isn't carried between games (each game resets
budgets from lobby config), and finalization only records it for analytics (D-88).

Design goal (user, 2026-07-06): make efficient drafting matter by turning **unused
budget into an in-match competitive advantage expressed as boss score or cycles**
— i.e. a team that spends less should start the actual HSR clear with a points
head-start or a cycle/turn advantage, proportional to what they saved.

Open question is the CALCULATION and the WIRING — how much boss score / how many
cycles per unspent budget point, and how that advantage is represented and
applied. This is unsolved.

## Solution

TBD — research/design todo, not a mechanical change. Things to work out:

1. **Advantage currency** — boss score bonus, cycle/turn advantage, or both?
   (Game modes differ: MemoryOfChaos = cycles, ApocalypticShadow = score,
   AnomalyArbitration = ?). The conversion may need to be per-`gameMode`.
2. **Conversion curve** — linear (X score per budget point), tiered/threshold, or
   capped? Decide the formula and whether it's configurable per lobby/tournament
   or a fixed constant.
3. **Which budget counts** — total unspent (char that never converted + leftover
   LC), or only leftover LC after Equipping? Note char→LC carryover already
   rewards saving character budget once; avoid double-counting.
4. **Where it plugs in** — the scoring path currently ignores ALL budget/handicap
   inputs. The existing roster-handicap fields (`rosterDiffAdvantage`,
   `rosterThreshold`, `underThresholdAdvantage`, `aboveThresholdPenalty`,
   `deathPenalty` on `lobby.ts:17`) are stored-but-unconsumed — see
   [[2026-04-14-synergy-half-assignment-math-and-broadcast]] for the same
   stored-but-dormant pattern. This advantage would need a REAL scoring
   integration: either players enter the result already adjusted, or the match
   record captures the pre-computed handicap and the UI/validation applies it.
   Decide whether this is server-enforced or an informational target players
   honor when submitting the clear.
5. **Interaction with `bestOfNAdvantage`** — both are "start-with-an-edge"
   mechanics; make sure they compose sanely if both apply
   ([[2026-07-06-best-of-n-advantage-and-wire-winner-advantage]]).
6. **Classic mode** — does the same idea apply (leftover cost budget), or is this
   Auction-only? Classic has no bidding budget, so likely Auction-specific.

Likely a spike/discussion before it becomes an implementable phase — the
calculation is a game-design decision, not just code.

Triggering context: Auction economy review 2026-07-06 — leftover LC budget
confirmed inert; user wants unused budget to translate into a boss-score/cycle
advantage.
