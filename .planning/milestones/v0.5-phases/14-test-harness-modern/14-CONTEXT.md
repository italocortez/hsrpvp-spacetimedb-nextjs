# Phase 14: Test Harness Modernization for SDK 2.1.0 - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix test harness confirmed reads default, replace fixed-timeout subscription sync with event-driven `onApplied` readiness, clean up duplicate helpers, and record improved suite runtime. Cohesive infrastructure pass across test shared code and standalone scripts.

**In scope:** confirmed reads fix, harness init onApplied migration, latestLobby() dedup + opportunistic helper dedup, suite runtime measurement.

**Out of scope:** auth-views.test.ts real view tests (deferred — TEST-MODERN-03 deferred until v1 frontend subscription strategy is locked), inter-reducer sync() replacement, active runtime optimization beyond onApplied gains.

</domain>

<decisions>
## Implementation Decisions

### Confirmed Reads (TEST-MODERN-01)
- **D-01:** Add `.withConfirmedReads(false)` to `DbConnection.builder()` in `test/shared/connection.ts` and all standalone scripts (`bootstrap.ts`, `seed-data.ts`, `promoteUser.ts`) and any test files that create their own connections (e.g., `identity-gc.test.ts`, `server-link-provider.test.ts`).

### Sync Strategy (TEST-MODERN-02)
- **D-02:** Replace the fixed 2000ms `setTimeout` in `createHarnessInternal` (connection.ts:125) with `onApplied` callback-based readiness. The harness should resolve as soon as the subscription's initial data is applied to the client cache, not after an arbitrary delay.
- **D-03:** The existing `sync(ms = 500)` helper for inter-reducer waits stays unchanged. The SDK doesn't offer a "wait until subscription cache reflects this commit" mechanism, and 500ms is pragmatic for sequential test execution against maincloud.
- **D-04:** Do NOT audit or modify individual `h.sync(N)` calls across test files. The harness init fix is the high-ROI target; per-call sync times are secondary.

### View Tests (TEST-MODERN-03)
- **D-05:** DEFERRED. `auth-views.test.ts` placeholder tests remain as-is. Auth view subscription patterns may change during v1 frontend work. Requirement TEST-MODERN-03 is explicitly deferred to a future phase.

### Helper Dedup
- **D-06:** Replace local `latestLobby()` in `anonymous-labels.test.ts` and `draft-control.test.ts` with import from `test/shared/helpers/queries.ts`.
- **D-07:** Opportunistic sweep — while touching test files for confirmed reads/sync fixes, grep for other local helpers that duplicate `test/shared/helpers/*` exports. Fix any found, but don't do a systematic audit.

### Suite Runtime (TEST-MODERN-04)
- **D-08:** Let `onApplied` improvements land naturally. Run full suite after all changes, record new baseline time in `test/README.md` Suite Runtime table. Any measurable improvement over 54m38s satisfies TEST-MODERN-04. No hard runtime target.

### Claude's Discretion
- Exact `onApplied` implementation pattern in `createHarnessInternal` (callback nesting, error handling, timeout fallback)
- Whether `verifyUserViaServerConnection` also needs `onApplied` or if its existing `setTimeout(resolve, 500)` is acceptable
- Which standalone scripts beyond bootstrap.ts/seed-data.ts need `.withConfirmedReads(false)` — discover during implementation
- Order of changes (confirmed reads first vs onApplied first)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Test harness (primary targets)
- `test/shared/connection.ts` — `createHarnessInternal` (line 63), `sync()` (line 115), 2s setTimeout (line 125), `verifyUserViaServerConnection` (line 140)
- `test/shared/seed-data.ts` — existing `onApplied` pattern (line 145) — use as reference implementation
- `test/shared/bootstrap.ts` — standalone script, needs `.withConfirmedReads(false)`
- `test/shared/helpers/queries.ts` — shared `latestLobby()` (line 14) — dedup target

### Duplicate helper sources
- `test/backend/anonymous-play/anonymous-labels.test.ts` — local `latestLobby()` (line 35)
- `test/backend/match-session/draft-control.test.ts` — local `latestLobby()` (line 29)

### Configuration
- `test/vitest.integration.config.ts` — integration test runner config
- `test/README.md` — Suite Runtime table (update with new baseline)

### Phase 12.2 context (WHY confirmed reads is needed)
- `.planning/phases/12.2-sdk-upgrade-audit/12.2-CONTEXT.md` — D-11: confirmed reads disabled on frontend, same needed for test harness

### Phase 10.5 context (cleanup patterns)
- `.planning/phases/10.5-test-suite-stabilization/10.5-CONTEXT.md` — D-02 (helper extraction), D-03 (afterAll contract), D-12 (server identity singleton)

### ROADMAP phase definition
- `.planning/ROADMAP.md` § "Phase 14: Test Harness Modernization for SDK 2.1.0" — requirements TEST-MODERN-01 through TEST-MODERN-04

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`onApplied` pattern in seed-data.ts:145** — proven subscription readiness callback. Replicate in `createHarnessInternal`.
- **`test/shared/helpers/queries.ts`** — already has shared `latestLobby()`, `myLobbies()`, `lobbyMembers()`, `lobbyBans()`. Dedup targets import from here.
- **`expectReducerError()`** (connection.ts:209) — stable, no changes needed.

### Established Patterns
- **Connection builder pattern** — `DbConnection.builder().withUri().withDatabaseName()` chain. Adding `.withConfirmedReads(false)` is a single method call insertion.
- **Harness resolve flow** — `onConnect` → `subscribeToAllTables()` → wait → resolve userId → construct harness. The `onApplied` replaces the "wait" step.
- **Sequential test execution** — `fileParallelism: false`, single worker. Tests share DB state. This means `sync()` reliability matters more than speed.

### Integration Points
- **All 41 integration test files** import from `connection.ts` — changing `createHarnessInternal` propagates automatically.
- **Standalone scripts** (`bootstrap.ts`, `seed-data.ts`) create their own `DbConnection.builder()` — each needs individual `.withConfirmedReads(false)`.
- **`verifyUserViaServerConnection`** (connection.ts:140) — creates a separate server-token connection. Needs confirmed reads fix too.

</code_context>

<specifics>
## Specific Ideas

- The harness init fix is the highest-ROI change — saves ~1.5s per harness creation, multiplied across 80+ harness creations in the suite
- `onApplied` is already proven in this codebase (seed-data.ts) — not a new pattern
- View tests deferred because auth view subscription patterns may change during v1 frontend milestone — implementing now risks rework

</specifics>

<deferred>
## Deferred Ideas

- **Real view integration tests** (TEST-MODERN-03) — deferred until v1 frontend subscription strategy is locked. auth-views.test.ts placeholders remain.
- **Inter-reducer sync() replacement** — event-driven `waitForTableUpdate()` helper is technically correct but over-engineering for current sequential test execution model.
- **Active runtime optimization** — profiling slowest files and optimizing connection patterns beyond onApplied gains. Document as future phase if needed.
- **sync() default reduction** — lowering sync(500ms) to sync(200ms) globally. Possible after onApplied proves stable but not in scope.

</deferred>

---

*Phase: 14-test-harness-modern*
*Context gathered: 2026-04-09*
