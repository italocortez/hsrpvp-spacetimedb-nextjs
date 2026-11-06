---
created: 2026-07-06T11:07:33.504Z
title: Add bestOf + refereeControlsShelving + bestOfNAdvantage to lobby preset system
area: database
files:
  - spacetimedb/src/tables/lobbyPreset.ts
  - spacetimedb/src/reducers/lobbyPresets.ts:56
  - spacetimedb/src/reducers/lobbyPresets.ts:155
  - docs/lobby/architecture.md:87
---

## Problem

The lobby preset system (`LobbyPreset` table) captures 31 of the lobby config
fields but omits `bestOf` (u8) and `refereeControlsShelving` (bool). Both are
create-time-only fields on the lobby — they are set in `create_lobby` /
`create_tournament_lobby` but are NOT parameters of `update_lobby_settings`, so
they can only be configured at lobby creation. Because presets don't store them,
a saved preset cannot round-trip a full best-of-N series configuration: a TO/Mod/
Admin who saves a preset loses the series length and the shelving-control policy.

Confirmed by code inspection (2026-07-06):
- `spacetimedb/src/tables/lobbyPreset.ts` — `lobbyPresetColumns` has no `bestOf`
  or `refereeControlsShelving` columns.
- `spacetimedb/src/reducers/lobbyPresets.ts` — neither `create_lobby_preset` nor
  `update_lobby_preset` accepts or writes these two fields.

Additionally, the new **`bestOfNAdvantage`** lobby setting (enum None/Blue/Red —
grants a one-game head-start to a side in a bo3 series; see its own feature todo
[[2026-07-06-best-of-n-advantage-and-wire-winner-advantage]]) must ALSO be stored
in presets. It is host-authored for standalone lobbies (create-time), so a saved
preset should round-trip it exactly like the other series-config fields. NOTE the
dependency: `bestOfNAdvantage` does not exist as a `Lobby` column yet — the
feature todo adds it first; this preset work extends it to `LobbyPreset`.

(Note: `teamBlueAlias` / `teamRedAlias` are also omitted from presets, but those
are intentional cosmetic labels — out of scope for this todo unless revisited.)

## Solution

Seed for a new phase (do NOT execute now). Scope:

1. **Table** — add `bestOf: t.u8()`, `refereeControlsShelving: t.bool()`, and
   `bestOfNAdvantage` (the None/Blue/Red enum) to `lobbyPresetColumns` in
   `spacetimedb/src/tables/lobbyPreset.ts`. (`bestOfNAdvantage` depends on the
   feature todo landing the enum + Lobby column first.)
2. **Reducers** — add all three as params + writes in `create_lobby_preset` and
   `update_lobby_preset` (`spacetimedb/src/reducers/lobbyPresets.ts`). Mirror the
   `bestOf` `0 → 1` sentinel used by `create_lobby`; for `bestOfNAdvantage`
   default to `None`. If the bestOf cap todo has landed, apply the same
   `bestOf ∈ {1,3}` guard here so presets can't reintroduce bo5
   ([[2026-07-06-cap-bestof-to-1-or-3-across-tournaments-and-lobbies]]).
3. **Bindings** — regenerate module bindings (`spacetime generate`).
4. **Docs** — update the preset field list in `docs/lobby/architecture.md`
   (LobbyPreset "full flat copy" note ~line 87) and `docs/lobby/contract.md` if
   the preset field table there enumerates columns. Tag any contract entry with
   the executing phase per the doc-provenance rule.

Follow-up consideration: presets still can't be *applied* server-side (D-31b —
`create_lobby` only validates preset existence, the frontend copies values), so
adding these columns only helps if the create-lobby form reads them. Verify the
frontend preset picker populates `bestOf` / `refereeControlsShelving` /
`bestOfNAdvantage` as part of this work.

Sequencing: land the `bestOfNAdvantage` feature todo first (adds the enum +
`Lobby` column + start_draft seeding), then this preset todo extends all three
create-time series fields into `LobbyPreset`. Cleanest if executed as one phase.

## Update (user, 2026-11-06): presets also store `lineupFormat`

Presets also save the new **`lineupFormat`** setting (8 characters in halves, or 12 in thirds; see
`2026-11-06-server-computed-scoring-handicaps-and-lineup-format.md`). Because Auction bids and
Classic cost values live on different scales, handicap values in presets are effectively
**per draft mode**: a preset carries values tuned for its own draft mode.
