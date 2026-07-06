---
created: 2026-07-06T11:07:33.504Z
title: Add bestOf + refereeControlsShelving to lobby preset system
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

(Note: `teamBlueAlias` / `teamRedAlias` are also omitted from presets, but those
are intentional cosmetic labels — out of scope for this todo unless revisited.)

## Solution

Seed for a new phase (do NOT execute now). Scope:

1. **Table** — add `bestOf: t.u8()` and `refereeControlsShelving: t.bool()` to
   `lobbyPresetColumns` in `spacetimedb/src/tables/lobbyPreset.ts`.
2. **Reducers** — add both as params + writes in `create_lobby_preset` and
   `update_lobby_preset` (`spacetimedb/src/reducers/lobbyPresets.ts`). Mirror the
   `bestOf` `0 → 1` sentinel used by `create_lobby` for consistency.
3. **Bindings** — regenerate module bindings (`spacetime generate`).
4. **Docs** — update the preset field list in `docs/lobby/architecture.md`
   (LobbyPreset "full flat copy" note ~line 87) and `docs/lobby/contract.md` if
   the preset field table there enumerates columns. Tag any contract entry with
   the executing phase per the doc-provenance rule.

Follow-up consideration: presets still can't be *applied* server-side (D-31b —
`create_lobby` only validates preset existence, the frontend copies values), so
adding these columns only helps if the create-lobby form reads them. Verify the
frontend preset picker populates `bestOf` / `refereeControlsShelving` as part of
this work.
