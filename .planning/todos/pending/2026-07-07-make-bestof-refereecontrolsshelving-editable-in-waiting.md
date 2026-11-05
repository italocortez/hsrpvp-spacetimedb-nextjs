---
created: 2026-07-07T00:00:00.000Z
title: Make bestOf + refereeControlsShelving editable post-creation via update_lobby_settings
area: database
files:
  - spacetimedb/src/reducers/lobbySettings.ts:20
  - spacetimedb/src/reducers/lobbySettings.ts:71
  - spacetimedb/src/reducers/lobbySettings.ts:98
  - spacetimedb/src/tables/lobby.ts:69
  - docs/lobby/contract.md
  - docs/lobby/architecture.md
---

## Problem

`bestOf` (u8) and `refereeControlsShelving` (bool) are **create-time-only** fields
on the lobby. They are set in `create_lobby` (`lobbyLifecycle.ts:150-152`) and
`create_tournament_lobby` (`tournamentLobby.ts:180-183`), but they are NOT
parameters of `update_lobby_settings`. Once a room exists, the host cannot change
the series length or the shelving-control policy — even during `Waiting`, before
the game has started, when every other lobby setting is freely editable.

This is a UX gap: a host sets up a room, realizes they want bo3 instead of bo1
(or wants to flip referee-controlled shelving), and their only recourse today is
to close the lobby and recreate it. Every other gameplay/QoL setting is editable
in Waiting via `update_lobby_settings` (D-28); these two are the outliers.

Confirmed by code inspection (2026-07-07):
- `update_lobby_settings` args (`lobbySettings.ts:20-57`) — no `bestOf` or
  `refereeControlsShelving`.
- The reducer is already `Waiting`-only (`ensureStageIs(lobby, 'Waiting')`,
  `lobbySettings.ts:71`), so adding these two fields inherits the correct
  "editable before the game starts, frozen after" semantics for free.

**Tournament linkage is a shipped, LOCKED decision (Phase 10.1, ~2026-04-03) —
do NOT break it.** `bestOf` originated as a tournament series-length concept and
flows down an inheritance chain that this edit path must preserve:

```
Tournament.defaultBestOf  →  BracketMatch.bestOf  →  Lobby.bestOf
   (tournament setting)       (per-match series)      (copied on lobby create)
```

- `bracketGeneration.ts:41` copies `defaultBestOf` → `BracketMatch.bestOf`;
  `tournamentLobby.ts:180` copies `BracketMatch.bestOf` → `Lobby.bestOf`.
- `create_tournament_lobby` also hardcodes `refereeControlsShelving=true`
  (`tournamentLobby.ts:183`).
- Provenance: `docs/brackets/architecture.md:26`, `docs/brackets/contract.md:337`,
  phase history `docs/brackets/contract.md:417` ("tournament lobbies inherit
  bestOf for series play | Phase 10.1 execution"), `docs/lobby/architecture.md:246`.

Implication: there are **two `bestOf` sources**, and only one is editable —
  - **Tournament lobby** → bestOf is bracket-authoritative; MUST stay locked.
  - **Standalone lobby** → bestOf is host-authored at `create_lobby`; this is the
    ONLY path this todo makes editable.

Distinct from the existing preset todo
([[2026-07-06-add-bestof-and-refereecontrolsshelving-to-lobby-preset-syste]]),
which only makes the `LobbyPreset` table *store* these fields so a saved preset
round-trips them. That todo explicitly notes the create-only limitation as
background but does not fix it. This todo is the editability fix itself.

## Solution

Seed for a phase (do NOT execute now). Scope:

1. **Reducer args** — add `bestOf: t.u8()` and `refereeControlsShelving: t.bool()`
   to the `update_lobby_settings` arg schema (`lobbySettings.ts:20`).
2. **Writes** — write both into the `Lobby.id.update(...)` call
   (`lobbySettings.ts:98`), but **gate them behind `isTournamentControlled`**
   exactly like the existing tournament-locked fields
   (`isTournamentLocked ? lobby.bestOf : args.bestOf`, and likewise for
   `refereeControlsShelving`). This is NOT an open question — the Phase 10.1
   inheritance chain above is authoritative: a tournament lobby's series length
   comes from its `BracketMatch` and MUST remain locked; a host may never
   override it via this edit path. Only **standalone** (`isTournamentControlled
   == false`) lobbies accept `args.bestOf` / `args.refereeControlsShelving`.
   Net effect: these two behave like the other integrity fields (free for casual,
   locked for tournament) rather than the always-free QoL fields.
3. **bestOf sentinel + cap** — mirror `create_lobby`'s `bestOf > 0 ? bestOf : 1`
   sentinel. If the cap todo has landed, apply the same `bestOf ∈ {1,3}` guard
   here so the edit path can't reintroduce bo5/bo7
   ([[2026-07-06-cap-bestof-to-1-or-3-across-tournaments-and-lobbies]]).
4. **isConfirmed reset** — `update_lobby_settings` already resets all members'
   `isConfirmed` on any settings change (`lobbySettings.ts:160-169`); changing
   series length should ride that same reset (players re-ready after a
   structural change). No extra work — just confirm it's in the changed path.
5. **Bindings** — regenerate module bindings (`spacetime generate`).
6. **Docs** — update the `update_lobby_settings` field list in
   `docs/lobby/contract.md` (mark `bestOf` / `refereeControlsShelving` as now
   editable in Waiting, with the tournament-lock note) and the mutable-fields
   note in `docs/lobby/architecture.md`. Tag the contract entry with the
   executing phase per the doc-provenance rule.
7. **Frontend** — the lobby settings form needs controls for both (series-length
   selector honoring the {1,3} cap; shelving-control toggle). Confirm the form
   reads/writes them once the reducer accepts them.

## Sequencing

Independent of, but naturally paired with, the preset todo and the cap todo —
all three touch the same two fields. Cleanest executed together as one
"series-config editability" phase: cap validation + update-path editability +
preset round-trip in one pass, sharing the `{1,3}` guard helper.

Triggering context: surfaced 2026-07-07 during a lobby-settings editability
review (what can/cannot be edited after room creation, before the game starts).
