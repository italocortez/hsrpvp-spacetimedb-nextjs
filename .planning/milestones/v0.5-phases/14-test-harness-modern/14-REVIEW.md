---
phase: 14-test-harness-modern
reviewed: 2026-04-09T12:00:00Z
depth: standard
files_reviewed: 13
files_reviewed_list:
  - scripts/manage-user.ts
  - scripts/post-publish.ts
  - scripts/register-server.ts
  - scripts/seed-data.ts
  - test/backend/auth/auth-security.test.ts
  - test/backend/auth/server-link-provider.test.ts
  - test/backend/calendar/calendar-events.test.ts
  - test/backend/garbage-collector/identity-gc.test.ts
  - test/backend/tournaments/tournament-management.test.ts
  - test/shared/bootstrap.ts
  - test/shared/connection.ts
  - test/shared/helpers/promoteUser.ts
  - test/shared/seed-data.ts
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Phase 14: Code Review Report

**Reviewed:** 2026-04-09
**Depth:** standard
**Files Reviewed:** 13
**Status:** issues_found

## Summary

Phase 14 applies two changes across the codebase:

1. **`.withConfirmedReads(false)` added** to every `DbConnection.builder()` chain in scripts, tests, and shared helpers (13 files, 15 call sites). This matches the project's SpacetimeDB skill guidance -- the v2.1.0 SDK defaults to confirmed reads enabled, which introduces 200ms+ latency per reducer call. Disabling it is correct for test harnesses and CLI scripts.

2. **`createHarnessInternal` in `test/shared/connection.ts` refactored** from a `subscribeToAllTables()` fired immediately on connect + a 2000ms `setTimeout` for resolution, to an `onApplied` callback on the subscription builder. This is the correct pattern -- `onApplied` fires when the server confirms all initial subscription data has been delivered to the client cache, eliminating the arbitrary 2000ms wait and the race condition where slow networks could resolve the harness before subscription data arrived.

Both changes are correct, minimal, and consistently applied across all in-scope `DbConnection.builder()` call sites. The `onApplied` refactor is a strict improvement -- it replaces a timing-dependent approach with a deterministic callback.

One issue was found outside the reviewed file set that represents an incomplete application of the confirmed-reads change.

## Warnings

### WR-01: `lib/spacetimedb-server.ts` missing `.withConfirmedReads(false)` -- incomplete rollout

**File:** `lib/spacetimedb-server.ts:45` and `lib/spacetimedb-server.ts:94`
**Issue:** This file contains two `DbConnection.builder()` calls (the production server-side singleton at line 45 and the ephemeral identity verifier at line 94) that were NOT updated with `.withConfirmedReads(false)`. This file is not in the Phase 14 diff, yet it is the production Next.js API route connection -- arguably the most latency-sensitive call site, since it adds 200ms+ to every Discord link and identity verification API call.

Every other `DbConnection.builder()` call in the project (13 files, 15+ call sites) now has `.withConfirmedReads(false)`. This single omission creates an inconsistency and leaves the production API routes on the slower confirmed-reads path.

**Fix:**
```typescript
// lib/spacetimedb-server.ts line 45-48 — getServerConnection()
const _conn = DbConnection.builder()
    .withUri(HOST)
    .withDatabaseName(DB_NAME)
    .withToken(SERVER_TOKEN)
    .withConfirmedReads(false)  // Add this
    .onConnect((connection) => {

// lib/spacetimedb-server.ts line 94-97 — verifyIdentityFromToken()
DbConnection.builder()
    .withUri(HOST)
    .withDatabaseName(DB_NAME)
    .withToken(clientToken)
    .withConfirmedReads(false)  // Add this
    .onConnect((_conn, identity) => {
```

---

_Reviewed: 2026-04-09_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
