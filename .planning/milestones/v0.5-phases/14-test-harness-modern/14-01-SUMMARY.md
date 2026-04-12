---
phase: 14-test-harness-modern
plan: 01
subsystem: testing
tags: [spacetimedb, sdk-2.1.0, vitest, integration-tests, websocket]

# Dependency graph
requires:
  - phase: 12.2-sdk-upgrade
    provides: SDK 2.1.0 confirmed reads pattern in app/providers.tsx
provides:
  - .withConfirmedReads(false) on all 17 DbConnection.builder() sites in test/ and scripts/
  - onApplied-based harness init replacing fixed 2000ms delay in createHarnessInternal
  - ~160s+ test suite speedup (80+ harness creations at 2s each → event-driven)
affects: [all integration test files, scripts, test harness consumers]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "SDK 2.1.0 confirmed reads disabled for real-time apps: .withConfirmedReads(false) in every DbConnection.builder() chain"
    - "onApplied callback for subscription readiness: conn.subscriptionBuilder().onApplied(cb).subscribeToAllTables() replaces setTimeout(2000)"

key-files:
  created: []
  modified:
    - test/shared/connection.ts
    - test/shared/bootstrap.ts
    - test/shared/seed-data.ts
    - test/shared/helpers/promoteUser.ts
    - test/backend/auth/server-link-provider.test.ts
    - test/backend/auth/auth-security.test.ts
    - test/backend/garbage-collector/identity-gc.test.ts
    - test/backend/tournaments/tournament-management.test.ts
    - test/backend/calendar/calendar-events.test.ts
    - scripts/seed-data.ts
    - scripts/register-server.ts
    - scripts/post-publish.ts
    - scripts/manage-user.ts

key-decisions:
  - "onApplied replaces setTimeout(2000) for subscription readiness — event-driven is correct for SDK 2.1.0"
  - "verifyUserViaServerConnection 500ms setTimeout preserved — acceptable per plan (one-off server connection, not main harness init path)"
  - "sync(ms=500) helper on TestHarness preserved unchanged — it serves a different purpose (post-reducer cache settle)"

patterns-established:
  - "Every DbConnection.builder() in test/ and scripts/ must include .withConfirmedReads(false) — established pattern matching app/providers.tsx"
  - "Subscription readiness uses onApplied callback, not fixed delays"

requirements-completed:
  - TEST-MODERN-01
  - TEST-MODERN-02

# Metrics
duration: 35min
completed: 2026-04-09
---

# Phase 14 Plan 01: Test Harness Modernization Summary

**All 17 DbConnection.builder() sites patched with .withConfirmedReads(false) and createHarnessInternal refactored to onApplied-based subscription readiness, eliminating the fixed 2000ms delay per harness creation**

## Performance

- **Duration:** ~35 min
- **Started:** 2026-04-09T00:00:00Z
- **Completed:** 2026-04-09
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Added `.withConfirmedReads(false)` to all 17 `DbConnection.builder()` sites across test/ and scripts/ directories — 100% coverage verified by grep count match
- Replaced the fixed `setTimeout(..., 2000)` subscription delay in `createHarnessInternal` with `subscriptionBuilder().onApplied(cb).subscribeToAllTables()` — harness resolves as soon as data is applied
- Estimated 160s+ savings per full suite run (80+ harness creations × 2s eliminated per creation)

## Task Commits

Each task was committed atomically:

1. **Task 1: Add .withConfirmedReads(false) to all DbConnection.builder() sites** - `48302a5` (feat)
2. **Task 2: Replace 2000ms setTimeout with onApplied in createHarnessInternal** - `a4c6a92` (feat)

## Files Created/Modified
- `test/shared/connection.ts` - Two builder sites patched; onApplied replaces setTimeout(2000) in createHarnessInternal
- `test/shared/bootstrap.ts` - Builder site patched
- `test/shared/seed-data.ts` - Builder site patched
- `test/shared/helpers/promoteUser.ts` - Builder site patched
- `test/backend/auth/server-link-provider.test.ts` - Inline server connection patched
- `test/backend/auth/auth-security.test.ts` - Inline server connection patched
- `test/backend/garbage-collector/identity-gc.test.ts` - Four builder sites patched (setDatetime, linkIdentity, setOnline, seedIdentityGcJob helpers)
- `test/backend/tournaments/tournament-management.test.ts` - Inline server connection patched
- `test/backend/calendar/calendar-events.test.ts` - Inline server connection patched
- `scripts/seed-data.ts` - Builder site patched
- `scripts/register-server.ts` - Builder site patched
- `scripts/post-publish.ts` - Builder site patched
- `scripts/manage-user.ts` - Builder site patched

## Decisions Made
- `verifyUserViaServerConnection`'s `setTimeout(resolve, 500)` was intentionally NOT removed per plan guidance — it's a one-off server connection wait for propagation, not a subscription readiness issue
- `sync(ms = 500)` helper on the TestHarness object kept exactly as-is per D-03 — it's used for post-reducer cache settling, not subscription init
- The 15s connection timeout at line 65 kept unchanged (covers T-14-02: stuck onApplied)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

Worktree was created from `main` instead of `feature_nath_claude` HEAD. The `git reset --soft 32e4025` moved HEAD but left the working directory on the old base, requiring `git checkout HEAD -- test/ scripts/` to materialize the files, followed by re-applying all edits to the worktree directory. No logic changes were needed; this was a git workflow issue only.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Test harness is now SDK 2.1.0 aligned: confirmed reads disabled and event-driven subscription readiness
- All 41 integration test files inherit the improvements automatically through the shared harness
- Phase 14 Plan 02 (if any) can proceed — harness infrastructure is ready

## Self-Check: PASSED

- FOUND: test/shared/connection.ts
- FOUND: test/shared/bootstrap.ts
- FOUND: scripts/manage-user.ts
- FOUND: .planning/phases/14-test-harness-modern/14-01-SUMMARY.md
- FOUND: commit 48302a5 (Task 1)
- FOUND: commit a4c6a92 (Task 2)

---
*Phase: 14-test-harness-modern*
*Completed: 2026-04-09*
