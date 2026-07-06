---
created: 2026-07-06T11:20:00.000Z
title: Cap bestOf to 1 or 3 across tournaments and lobbies
area: database
files:
  - spacetimedb/src/reducers/tournamentManagement.ts:99
  - spacetimedb/src/reducers/tournamentManagement.ts:263
  - spacetimedb/src/reducers/lobbyLifecycle.ts:150
  - docs/tournament/contract.md
---

## Problem

Product decision: the platform only supports **best-of-1 and best-of-3** for
tournaments and lobbies. Anything higher (bo5 / bo7) should be rejected. Current
code allows up to bo7.

Code inspection (2026-07-06) — actual state, which differs from the "lower the
cap from 5 to 3" framing:

1. **Tournament is the only real whitelist, and it's `1/3/5/7`:**
   - `tournamentManagement.ts:99` (create_tournament) and `:263`
     (update_tournament) — identical:
     `if (defaultBestOf !== 1 && !== 3 && !== 5 && !== 7) throw
     'defaultBestOf must be 1, 3, 5, or 7.'`
2. **Lobbies have NO cap.** `create_lobby` (`lobbyLifecycle.ts:150`) only does
   `bestOf > 0 ? bestOf : 1` — it accepts 5, 7, or any u8. `bestOf` is not a
   param of `update_lobby_settings` (create-only). So there is no existing
   "best of 5" cap to lower on the lobby side — enforcing bo3 there means
   ADDING a check that doesn't exist yet.
3. **Inheritance is automatic.** bestOf flows `tournament.defaultBestOf` →
   `BracketMatch.bestOf` → `create_tournament_lobby` copies it. Capping the
   tournament whitelist constrains brackets + tournament lobbies for free.
4. **No frontend bestOf selector found** in `components/` or `app/` (zero
   matches). The "tournament list" dropdown referenced by the user is either not
   built yet or lives elsewhere — confirm before assuming a UI edit is needed.

## Solution

Core change is small; the rest is decisions + follow-through.

1. **Tournament validation → `{1, 3}`.** Update both blocks in
   `tournamentManagement.ts` (create L99-100 + update L263-264) and the error
   string to "defaultBestOf must be 1 or 3." This alone caps tournaments,
   bracket matches, and tournament lobbies.
2. **DECISION — cap standalone lobbies?** To enforce bo3 in non-tournament
   lobbies, ADD a validation in `create_lobby` rejecting `bestOf ∉ {1,3}`
   (currently unbounded). This is an addition, not a lowering. Confirm intent.
3. **Preset backdoor.** Cross-reference the preset todo
   ([[2026-07-06-add-bestof-and-refereecontrolsshelving-to-lobby-preset-syste]]):
   if presets start storing `bestOf`, `create_lobby_preset` /
   `update_lobby_preset` need the same `{1,3}` guard or presets bypass the cap.
4. **Tests.** Update any test asserting bo5/bo7 as valid — candidates:
   `test/backend/tournaments/tournament-management.test.ts`,
   `test/backend/brackets/bracket-generation.unit.test.ts`,
   `test/backend/match-session/post-draft.test.ts`,
   `test/backend/match-results/mmr-snapshot-betweengames.test.ts`,
   `test/backend/lobby/lobby-tournament.test.ts`. Only under an explicit task;
   failures are diagnostic per project rules.
5. **Docs.** Update `1/3/5/7` references in `docs/tournament/contract.md`,
   `docs/brackets/*`, `docs/match-session/*` to `1/3`.
6. **Frontend.** When/where a tournament-creation bestOf dropdown exists, it
   must offer only 1 and 3 (and the lobby-create series control likewise).
7. **Existing data.** Validation is write-time only; pre-existing bo5/bo7 rows
   on maincloud are not retroactively changed. Decide if a backfill matters
   (likely test data — probably not).

## Out of scope

Series-counting math is bestOf-agnostic and needs no change:
`winsNeeded = ceil(bestOf/2)`, `MatchSession.seriesBestOf`,
`advance_to_next_game`, `postDraft.ts` win tallying all read whatever bestOf is
stored — no hardcoded 5/7.

Triggering context: product decision surfaced 2026-07-06 during lobby/tournament
settings review.
