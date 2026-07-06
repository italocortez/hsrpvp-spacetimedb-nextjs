---
created: 2026-07-06T11:30:00.000Z
title: bestOfNAdvantage lobby setting + wire winnerAdvantage into series scoring
area: database
files:
  - spacetimedb/src/tables/lobby.ts:69
  - spacetimedb/src/reducers/draftClassic.ts:151
  - spacetimedb/src/reducers/lobbyLifecycle.ts
  - spacetimedb/src/reducers/lobbySettings.ts
  - spacetimedb/src/reducers/tournamentManagement.ts:104
  - spacetimedb/src/helpers/bracketGeneration.ts
---

## Problem

Tournaments already have a `winnerAdvantage` field (`Tournament.winnerAdvantage`,
u8 validated 0–3) meant to give the winners-bracket finalist a head-start in the
double-elim Grand Finals. Code inspection (2026-07-06) shows it is **completely
inert**: it is validated, stored on `Tournament` and stamped onto the `GF-R1-M1`
`BracketMatch` by the generator — but nothing ever reads it. Series wins live in
`MatchSession.gamesWonBlue/Red`, which `start_draft` (`draftClassic.ts:151`)
hardcodes to `0/0`. So every series starts 0–0; the advantage does nothing.

Separately, we want a lobby-level way to grant a head-start that also works for
standalone (non-tournament) lobbies. Proposed setting: **`bestOfNAdvantage`** —
enum `None | Blue | Red`.

The design tension: `winnerAdvantage` binds to a **team** (known at bracket time);
Blue/Red is a **lobby-local, late-bound** label (only known after `set_team_slot`).
You cannot author Blue/Red at tournament/bracket time.

Simplification from the bo3 cap (see
[[2026-07-06-cap-bestof-to-1-or-3-across-tournaments-and-lobbies]]): with bestOf
maxed at 3, `winsNeeded = ceil(3/2) = 2`, so a 2-game head-start would pre-win the
series. The only meaningful advantage is exactly **1 game** → the magnitude axis
collapses to a boolean, and the `None/Blue/Red` enum alone is sufficient (no
separate "games" count needed). `winnerAdvantage` 0–3 is now effectively 0/1.

## Solution

Two halves of one feature: magnitude lives on the tournament (`winnerAdvantage`,
now boolean-ish), side is resolved at runtime. Implement:

1. **Lobby column** — add `bestOfNAdvantage: enum { None, Blue, Red }`
   (default `None`) to `lobby.ts`. Make it the single field every consumer reads
   (UI badge + seeding).
2. **Standalone path** — host-authored free field in `create_lobby` /
   `update_lobby_settings` (decide if it should be in update or create-only like
   bestOf). Guard: force `None` when `bestOf == 1`.
3. **Tournament path** — LOCK it (add to the D-65 tournament-integrity lock set in
   `update_lobby_settings`); host cannot set it. Derive it at draft start.
4. **Seed at the single MatchSession creation site** (`start_draft`,
   `draftClassic.ts:151`) — replace hardcoded `gamesWonBlue/Red = 0`:
   - standalone: read `lobby.bestOfNAdvantage`
   - tournament: `resolveAdvantageSide(lobby)` from the bracket
   - `gamesWonBlue = side==Blue ? 1 : 0`, same for Red; clamp to 0 if bestOf==1.
   - write the resolved side back onto `lobby.bestOfNAdvantage` for uniform UI.
5. **`resolveAdvantageSide(lobby)`** — read `BracketMatch.winnerAdvantage`; if 0
   return None; find the advantaged team (WB finalist = a known GF slot); map each
   Blue*/Red* player member → their `TournamentTeamMember.teamId`; return the side
   whose players are the advantaged team.
6. **Narrow `winnerAdvantage`** — under bo3 it's 0/1; either tighten validation in
   `tournamentManagement.ts:104/268` to 0–1 or clamp at seed time.

Everything downstream (`winsNeeded`, `advance_to_next_game`, `postDraft.ts` win
tallying) already reads `gamesWonBlue/Red` — no other logic changes. This is the
missing consumer that finally makes `winnerAdvantage` functional.

Preset: `bestOfNAdvantage` must also be stored in `LobbyPreset` — folded into
[[2026-07-06-add-bestof-and-refereecontrolsshelving-to-lobby-preset-syste]].

## Decisions to pin down

1. Which GF slot is the WB finalist — encode as a named helper, don't assume
   `team1Id` (avoid silent drift if the generator changes).
2. Team-on-one-side invariant — filter mapping to players (exclude coaches /
   spectators / stand-ins); fall back to the captain's slot if ambiguous.
3. Bracket reset — true double-elim GF advantage usually pairs with a reset match
   if the LB team wins; generator only emits `GF-R1-M1`. Rule "no reset"
   explicitly or treat reset as a companion feature.
4. Is `bestOfNAdvantage` editable post-create (in `update_lobby_settings`) for
   standalone, or create-only like `bestOf`?

Triggering context: lobby/tournament settings review 2026-07-06; user-proposed
`bestOfNAdvantage` setting + discovery that `winnerAdvantage` is inert.
