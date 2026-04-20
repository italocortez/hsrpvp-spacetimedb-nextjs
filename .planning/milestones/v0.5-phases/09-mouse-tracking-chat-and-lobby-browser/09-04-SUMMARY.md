---
phase: 09-mouse-tracking-chat-and-lobby-browser
plan: 04
subsystem: database
tags: [spacetimedb, lobby, reducers, ready-up, presets, permissions]

# Dependency graph
requires:
  - phase: 09-01
    provides: LobbyPreset table, LobbyMember isConfirmed/isCaptain columns, lobby enums
  - phase: 09-02
    provides: lobbyHelpers.ts (ensureStageIs, ensureLobbyMember, ensureHostOrAbove), lobbyLifecycle.ts

provides:
  - 5 lobby settings reducers in lobbySettings.ts (update_lobby_settings, set_team_slot, confirm_ready, unconfirm_ready, set_captain)
  - 3 preset CRUD reducers in lobbyPresets.ts (create_lobby_preset, update_lobby_preset, delete_lobby_preset)
  - presetId parameter on create_lobby for preset-based lobby creation
  - Module published to maincloud, bindings regenerated with 8 new reducers

affects: [09-05, 09-06, 09-07, draft-system, start_draft]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Lobby settings mutable only in Waiting stage via ensureStageIs guard (D-28)"
    - "isTournamentControlled guard blocks settings mutation on tournament lobbies (D-65)"
    - "Ranked matchType forces allowMirrorPicks=false server-side (D-42)"
    - "Settings change resets all member isConfirmed via delete+insert loop"
    - "D-31b permission hierarchy: isSystemPreset admin-only, Moderators can edit TO/mod presets"

key-files:
  created:
    - spacetimedb/src/reducers/lobbySettings.ts
    - spacetimedb/src/reducers/lobbyPresets.ts
  modified:
    - spacetimedb/src/reducers/lobbyLifecycle.ts
    - spacetimedb/src/index.ts
    - src/module_bindings/ (regenerated — 8 new reducer files)

key-decisions:
  - "presetId on create_lobby is client-responsibility pattern — client pre-loads preset values into form args; backend only validates preset exists for audit purposes"
  - "isSystemPreset protection: Admin-only gate prevents moderators/TOs from modifying system presets; Moderators can edit other moderator/TO presets"
  - "disconnectForfeitSeconds sentinel 0 = not set (undefined stored) — consistent with existing create_lobby pattern"

patterns-established:
  - "Lobby settings mutation always requires ensureStageIs(lobby, 'Waiting') + ensureHostOrAbove + isTournamentControlled check"
  - "Member re-confirmation reset: iterate lobby_id.filter, delete+insert for any member with isConfirmed=true"

requirements-completed:
  - LBBY-01
  - LBBY-02

# Metrics
duration: 25min
completed: 2026-03-29
---

# Phase 09 Plan 04: Lobby Settings, Ready-Up, and Preset CRUD Summary

**Lobby settings, team slot management, ready-up system (5 reducers), preset CRUD with D-31b role hierarchy (3 reducers), and presetId wired into create_lobby — module published, 8 new reducers in bindings**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-29T00:00:00Z
- **Completed:** 2026-03-29T00:25:00Z
- **Tasks:** 2
- **Files modified:** 5 (+ module_bindings regenerated)

## Accomplishments

- 5 lobby settings reducers: `update_lobby_settings` (Waiting-only lock, D-28/D-65/D-42/D-23, member reconfirm reset), `set_team_slot` (free movement with isConfirmed reset D-27/D-28), `confirm_ready` / `unconfirm_ready` (D-29 ready-up system), `set_captain` (D-30 with refereeCanSetCaptain gate)
- 3 preset CRUD reducers with D-31b permission hierarchy: Admins edit any, Moderators edit mod/TO presets (not system), TOs edit own only; system preset protected behind isSystemPreset guard
- `create_lobby` extended with `presetId: t.u32()` arg — validates preset existence when > 0, client responsible for populating form from preset config

## Task Commits

1. **Task 1: Create lobbySettings.ts with 5 reducers** - `3469058` (feat)
2. **Task 2: Create lobbyPresets.ts and wire presetId into create_lobby** - `68875a9` (feat)

## Files Created/Modified

- `spacetimedb/src/reducers/lobbySettings.ts` - 5 reducers: update_lobby_settings, set_team_slot, confirm_ready, unconfirm_ready, set_captain
- `spacetimedb/src/reducers/lobbyPresets.ts` - 3 reducers: create_lobby_preset, update_lobby_preset, delete_lobby_preset
- `spacetimedb/src/reducers/lobbyLifecycle.ts` - Added presetId parameter and validation to create_lobby
- `spacetimedb/src/index.ts` - Exported 8 new reducers
- `src/module_bindings/` - Regenerated with new reducer files

## Decisions Made

- `presetId` client-responsibility pattern: the backend validates preset existence (for audit/integrity) but does not merge preset fields into args. The client pre-fills form values from the preset and sends them as create_lobby args. This avoids complex server-side merge logic for a pattern that will always require the client to show the current config anyway.
- `isSystemPreset` guard in `ensureCanMutatePreset`: system presets require Admin access. Moderators can modify other moderator/TO presets since they outrank TOs. Creator role looked up via `ctx.db.User.id.find(preset.creatorUserId)`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added reducer exports to index.ts**
- **Found during:** Task 2 (verification step — bindings regenerated without new reducers)
- **Issue:** New reducer files were not exported from `spacetimedb/src/index.ts`, so SpacetimeDB module build did not include them. First publish and generate produced bindings with no new reducers.
- **Fix:** Added two export lines to index.ts for lobbySettings and lobbyPresets reducers, then republished and regenerated bindings.
- **Files modified:** spacetimedb/src/index.ts
- **Verification:** `spacetime generate` output confirmed 8 new reducer files written; bindings list new reducer types.
- **Committed in:** `68875a9` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Blocking issue: reducers were not being registered without index.ts exports. Standard SpacetimeDB pattern — all reducers must be exported from index.ts to be included in the module build.

## Issues Encountered

- First `spacetime publish` prompt for interactive confirmation; resolved with `--yes` flag.
- Pre-existing TypeScript error in `spacetimedb/src/reducers/tournamentLobby.ts` (line 83: `ctx.from` does not exist). Pre-dates this plan, out of scope. Logged here for awareness.

## Next Phase Readiness

- 8 lobby settings/preset reducers live on maincloud
- `start_draft` (Plan 06) can now rely on `isConfirmed` state from confirm_ready/unconfirm_ready
- Preset system ready for bootstrap seeding (system presets referenced in D-31b)
- Pre-existing `tournamentLobby.ts` TS error should be investigated before Phase 9 UAT

## Self-Check: PASSED

- FOUND: spacetimedb/src/reducers/lobbySettings.ts
- FOUND: spacetimedb/src/reducers/lobbyPresets.ts
- FOUND: .planning/phases/09-mouse-tracking-chat-and-lobby-browser/09-04-SUMMARY.md
- FOUND commit: 3469058 (Task 1)
- FOUND commit: 68875a9 (Task 2)
- FOUND commit: ddf1d1f (metadata)

---
*Phase: 09-mouse-tracking-chat-and-lobby-browser*
*Completed: 2026-03-29*
