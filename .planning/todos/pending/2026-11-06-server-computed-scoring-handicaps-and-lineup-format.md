---
created: 2026-11-06T12:00:00.000Z
title: Server-computed scoring, handicaps and lineup format (halves/thirds)
area: database
files:
  - spacetimedb/src/reducers/matchResultSubmission.ts
  - spacetimedb/src/tables/matchResultGame.ts
  - spacetimedb/src/tables/lobby.ts:17
  - spacetimedb/src/reducers/postDraft.ts
  - spacetimedb/src/helpers/finalizationHelpers.ts
---

## Problem

The lobby's handicap settings (`rosterDiffAdvantage`, `rosterThreshold`, `underThresholdAdvantage`, `aboveThresholdPenalty`, `deathPenalty`, `lobby.ts:17-21`) are stored, shown in the mockups, and never applied. Scoring is manual:
- Captains confirm raw scores.
- `submit_match_result` takes a hand-picked `winnerId` (`matchResultSubmission.ts:82`).
- `MatchResultGame` has fixed columns for only 2 bosses per team (`teamBlue/RedBoss1/2Score`), so it can't hold thirds.
- The server never computes a team's roster cost or an adjusted result.

This is the foundation that the synergy-halves todo and the unused-auction-budget todo both depend on.

## Decided design (user, 2026-11-06)

**Who decides the winner**
- The **server** decides the winner from the submitted results.
- The frontend shows a **live preview** of who wins before submission. The formula lives in ONE shared, pure TypeScript module that both the SpacetimeDB module and the web app import, so the preview and the official result can't disagree.

**Units per game mode**
- Memory of Chaos and Anomaly Arbitration: **cycles**, lower wins.
- Apocalyptic Shadow: **points**, higher wins.
- Handicap values are entered in the mode's unit. An advantage means fewer cycles or more points; a penalty means more cycles or fewer points.

**Lineup format (lobby setting, preset-able)**
- **8 characters → Halves:** 4v4 + 4v4.
- **12 characters → Thirds:** 4v4 + 4v4 + 4v4.
- No other splits (no 6v6 halves) and no bench. The character count *is* the format.

**Result entry (captain or referee)**
- Raw results per team **per group** (half or third): cycles or points.
- **Deaths:** one total per team per game. Only whether a death happened matters, not which group it was in.

**Roster cost per team** (computed by the server when lineups are confirmed)
- Classic: cost-table value of each character at its eidolon + each light cone at its superimposition + synergy surcharges.
- Auction: total budget actually spent (character bids + light cones + synergy surcharges).

**Adjusted result** = sum of the team's group results, plus any additional score modifiers (below), then:
- **Roster Diff Advantage:** the cheaper team gets `rosterDiffAdvantage × |costBlue − costRed|`.
- **Threshold:** a cost below `rosterThreshold` gets `underThresholdAdvantage`; above it gets `aboveThresholdPenalty`. 0 disables.
- **Deaths:** `deathPenalty × deaths`.

Exact numbers get tuned later.

**Additional score modifiers: freeform community bonuses and penalties** (user, 2026-11-06)
- **Why:** tournaments hand out custom penalties and bonuses (late arrival, rule violations, organizer bonuses) that no built-in knob covers.
- **What:** a signed, freeform number per team per game, in the mode's own unit, **added to the team's result**.
  - Memory of Chaos / Anomaly Arbitration: `+2` = two extra cycles, a penalty.
  - Apocalyptic Shadow: `+500` = 500 extra points, a bonus.
  - The UI labels each entry as helping or hurting, so the sign isn't confusing.
- **Shape (recommended):** a small child table of entries rather than one column, so several can stack with itemized reasons.
  - e.g. `MatchResultAdjustment`: result, game, team, value, **required** reason, set by, set at.
  - The adjusted result sums all entries. A single `additionalScoreModifier` column would lose which penalty was which.
- **Who can set it:** the referee, or the tournament organizer / admin in tournament lobbies. Captains see entries in the live preview but can't edit them.
- **Ordering:** adding or changing an entry after captains confirmed scores **resets their confirmations**, so nobody confirms one result and gets another.
- **Applied before tie-breaks,** like the other handicaps.

**Tie-break, if adjusted results are equal** (deaths are already in the adjusted result):
1. Less resources spent in the draft (lower roster cost) wins.
2. More 4★ characters used (`HsrCharacter.rarity`) wins.
3. Fewer total eidolons across the team's 5★ characters wins. Uses the eidolon levels snapshotted for that match from `HsrAccountCharacter.eidolonLevel`.
4. **Still tied: the referee decides** (user, 2026-11-06).
   - New nullable result fields, following the camelCase column convention: `winnerOverride` (TeamSide), `winnerOverrideById`, and an optional `winnerOverrideReason`.
   - When `winnerOverride` is set, it overwrites the computed winner.
   - The server only accepts it when the computed outcome is an **unresolved tie**. Admins already have override tools for disputes (`admin_set_bracket_winner`, `admin_force_finalize`).
   - The override and who made it are kept for audit and replay.

**Separate mechanic:** the Bo3 Point Advantage works at the series level (a one-game head start; see the best-of-n advantage todo). Handicaps work at the game level. They don't interact.

## Open

- ~~Lobbies without a referee~~ **Resolved (user, 2026-11-06):** every lobby always has a referee, because the referee flag defaults to the host. The tie override always has someone allowed to use it.
- **Threshold boundary:** is a cost exactly at the threshold neutral? The proposal says yes.
- **Precision:** handicaps make results fractional (e.g. 7.5 cycles). Compare in fixed-point integers (e.g. hundredths), not f32, so ties are detected deterministically. The handicap fields are `t.f32()` today, so consider migrating them in the backend reset.
- **Eidolon snapshot:** confirm where each pick's eidolon and superimposition level is recorded at draft time. If it's read live from the account roster at scoring time, it can change mid-series.

## Schema impact (fits the pre-launch backend reset, A20)

- **Results:** a per-group results structure (e.g. a child table keyed by result, game, team and group index) replacing the fixed boss1/boss2 columns.
- **Deaths:** a per-team deaths field.
- **Stored computation:** roster cost, adjusted result and the tie-break used, for audit and replay.
- **Lobby:** the `lineupFormat` setting, also stored in presets.
- **Winner:** `submit_match_result` stops taking `winnerId`.
- **Docs:** update the affected `docs/match-results/`, `docs/lobby/` and `docs/match-session/` contracts when this is implemented.
