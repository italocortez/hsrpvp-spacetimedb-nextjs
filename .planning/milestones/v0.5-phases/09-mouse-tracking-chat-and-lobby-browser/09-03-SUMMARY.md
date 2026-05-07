---
phase: 09-mouse-tracking-chat-and-lobby-browser
plan: 03
subsystem: database
tags: [spacetimedb, lobby, chat, cursor, views, typescript]

# Dependency graph
requires:
  - phase: 09-02
    provides: lobbyHelpers.ts (ensureLobbyMember, ensureHostOrAbove), anonymousHelpers.ts (shouldAnonymize), LobbyLifecycle reducers, full Phase 9 schema

provides:
  - spacetimedb/src/reducers/chat.ts: send_chat_message (500-char limit, 50-msg rolling window, metadata JSON validation, anonymous label) and delete_chat_message (host/referee/admin/moderator permission)
  - spacetimedb/src/reducers/cursor.ts: D-34 spectator silencing — teamSlot.tag === 'Spectator' returns silently
  - spacetimedb/src/views/securityViews.ts: projected view_lobby_browser returning LobbyBrowserRow (excludes config/audit columns, resolves tournament/costSet names, excludes Finished lobbies)
  - src/module_bindings/: regenerated with send_chat_message and delete_chat_message reducers

affects:
  - 09-04 (draft reducers — chat available during Drafting stage)
  - 09-05 (ready-up — lobby stage guards use same LobbyStage enum)
  - frontend milestone (lobby browser uses projected view, chat UI calls new reducers)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Rolling window delete: sort by createdDate ascending, delete messages[0].id when length >= 50"
    - "Stage-indexed browser view: filter active stages via btree index instead of iterating full table"
    - "Anonymous label on insert: store real senderUserId always; populate anonymousLabel field when lobby is anonymous"

key-files:
  created:
    - spacetimedb/src/reducers/chat.ts
    - src/module_bindings/send_chat_message_reducer.ts
    - src/module_bindings/delete_chat_message_reducer.ts
  modified:
    - spacetimedb/src/reducers/cursor.ts
    - spacetimedb/src/views/securityViews.ts
    - spacetimedb/src/index.ts
    - src/module_bindings/ (regenerated, all files)
    - spacetimedb/dist/bundle.js

key-decisions:
  - "Stage btree index used in view_lobby_browser procedural view — filter 4 active stages individually instead of iterating all lobbies; avoids iter() performance issue"
  - "cursor.ts simplified after D-34 guard — isSpectator variable removed since we return before reaching isAnon calculation; only isAnonymousPlayers used (no spectator cursor paths remain)"
  - "delete_chat_message checks caller's LobbyMember row for isReferee — same pattern as canKickOrBan from lobbyHelpers"

patterns-established:
  - "LobbyBrowserRow projected type: t.object() with only browsing-relevant columns, no config/audit/disconnect fields"
  - "Rolling window: sort by createdDate, delete oldest when count >= N"

requirements-completed: [MOUS-01, MOUS-02, CHAT-01, CHAT-02, LBBY-01]

# Metrics
duration: 20min
completed: 2026-03-29
---

# Phase 09 Plan 03: Chat, Cursor Silencing, Lobby Browser Summary

**Ephemeral chat with 500-char limit and 50-msg rolling window, spectator cursor silencing, and projected lobby browser view — all live on maincloud with regenerated bindings**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-03-29T11:50:00Z
- **Completed:** 2026-03-29T12:10:00Z
- **Tasks:** 2
- **Files modified:** ~165 (2 source, 3 source modified, 160 bindings regenerated)

## Accomplishments
- Created `chat.ts` with `send_chat_message` (D-12 content validation, D-13 rolling window, D-14 metadata JSON, D-18 anonymous label) and `delete_chat_message` (D-26 host/referee/admin permissions)
- Updated `cursor.ts` with D-34 spectator silencing — pure Spectator teamSlot returns without broadcasting
- Replaced full `Lobby.rowType` browser view with projected `LobbyBrowserRow` type (D-05), stage-indexed to exclude Finished lobbies (D-08), with server-side tournament/cost-set name resolution (D-06)
- Module published to maincloud, bindings regenerated with 2 new reducer files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create chat.ts with send_chat_message and delete_chat_message** - `5f45c4d` (feat)
2. **Task 2: Update cursor.ts spectator silencing and replace lobby browser view** - `8d47765` (feat)
3. **Bundle update** - `904f513` (chore)

## Files Created/Modified
- `spacetimedb/src/reducers/chat.ts` — 2 reducers: send_chat_message + delete_chat_message with all Phase 9 chat rules
- `spacetimedb/src/reducers/cursor.ts` — Added D-34 spectator guard, simplified isAnon logic
- `spacetimedb/src/views/securityViews.ts` — Replaced view_lobby_browser with projected LobbyBrowserRow; added Tournament + enum imports
- `spacetimedb/src/index.ts` — Exported send_chat_message and delete_chat_message
- `src/module_bindings/` — Regenerated; new: send_chat_message_reducer.ts, delete_chat_message_reducer.ts

## Decisions Made
- Stage btree index used in procedural `view_lobby_browser` — filter 4 active stages via `ctx.db.Lobby.stage.filter(stageVal)` instead of `ctx.from.Lobby` (query builder not iterable in procedural views) or `iter()` (performance issue per skill rules)
- `cursor.ts` `isSpectator` variable removed after D-34 guard — TypeScript correctly flags `teamSlot.tag === 'Spectator'` comparison after narrowing via early return; `isAnon` simplified to `isAnonymousPlayers` only (spectators never reach this code path)
- `delete_chat_message` directly checks `callerMember?.isReferee` rather than re-using `canKickOrBan` — that helper is lobby-level (kick/ban), this is a message-level permission

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript type narrowing error in cursor.ts after D-34 guard**
- **Found during:** Task 2 (cursor.ts spectator silencing)
- **Issue:** After `if (membership.teamSlot.tag === 'Spectator') return;`, the existing `const isSpectator = membership.teamSlot.tag === 'Spectator'` on the next line caused TS2367 — TypeScript narrows the union to never after the guard, making the comparison against 'Spectator' impossible.
- **Fix:** Removed the `isSpectator` variable and simplified `isAnon` to `lobby?.isAnonymousPlayers` (since only Blue/Red team members reach the broadcast code after D-34 guard)
- **Files modified:** spacetimedb/src/reducers/cursor.ts
- **Verification:** `npx tsc --noEmit` passes with no errors
- **Committed in:** `8d47765` (Task 2 commit)

**2. [Rule 3 - Blocking] ctx.from.Lobby not iterable in procedural anonymousView**
- **Found during:** Task 2 (securityViews.ts lobby browser)
- **Issue:** `for (const lobby of ctx.from.Lobby)` caused TS2488 — query builder objects are not directly iterable in procedural views; they must be returned as a query expression.
- **Fix:** Replaced with stage btree index lookups: iterate 4 active stage values, call `ctx.db.Lobby.stage.filter(stageVal)` for each to collect active lobby rows, then iterate those.
- **Files modified:** spacetimedb/src/views/securityViews.ts
- **Verification:** `npx tsc --noEmit` passes; module publishes successfully
- **Committed in:** `8d47765` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes required for compilation — no scope or behavior change. The stage-index approach is actually better performance than iterating `ctx.from.Lobby` since Finished lobbies are skipped at the index level.

## Issues Encountered
- Worktree was on the original `2eba181` commit — had to merge `feature_nath_claude` before source files were available. Fast-forward merge succeeded cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- `send_chat_message` and `delete_chat_message` live on maincloud and callable via CLI
- `broadcast_cursor` now silences spectators — MOUS-01/02 fulfilled
- `view_lobby_browser` returns projected `LobbyBrowserRow` — LBBY-01 fulfilled
- Chat reducers ready for Plan 04 (draft system — chat available in Drafting stage)
- System messages (join/leave/stage change) deferred to plan where those events occur (lobby lifecycle already has join/leave hooks)

## Self-Check: PASSED

- chat.ts: FOUND at spacetimedb/src/reducers/chat.ts
- cursor.ts: FOUND with teamSlot.tag === 'Spectator' guard
- securityViews.ts: FOUND with LobbyBrowserRow type and Finished exclusion
- send_chat_message_reducer.ts: FOUND in src/module_bindings/
- delete_chat_message_reducer.ts: FOUND in src/module_bindings/
- Commits 5f45c4d, 8d47765, 904f513: FOUND in git log
- Module published to maincloud: CONFIRMED (dashboard: https://spacetimedb.com/hsrpvp-spacetimedb-nextjs-test1)

---
*Phase: 09-mouse-tracking-chat-and-lobby-browser*
*Completed: 2026-03-29*
