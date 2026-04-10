# Phase 14: Test Harness Modernization for SDK 2.1.0 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 14-test-harness-modern
**Areas discussed:** Sync replacement depth, Runtime target, Helper dedup scope

---

## View Test Scope

**Not selected for discussion.** User chose not to discuss — ROADMAP's "DEFERRED" status stands. TEST-MODERN-03 deferred to future phase.

---

## Sync Replacement Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Harness init only | Replace 2s setTimeout with onApplied in createHarnessInternal + standalone scripts. Keep sync(500ms) for inter-reducer waits. Best ROI. | |
| Init + audit inflated syncs | Fix harness init AND scan for h.sync(1000+) calls that look like workarounds for the bad init. Reduce those to sync(500). | |
| Full event-driven overhaul | Replace sync() itself with event-driven mechanism (e.g., waitForTableUpdate). Touches every test file. High risk, high reward. | |

**User's initial response:** Asked for engineering rationale — "what would be the correct way to solve this from an engineering perspective? What benefits does the harness init solve for us?"

**Follow-up explanation provided:** Harness init `onApplied` is the correct fix (event-driven vs time-based, saves ~1.5s per harness, eliminates timing flakes). Inter-reducer `sync()` stays time-based because the SDK doesn't offer "wait until cache reflects this commit" — 500ms is pragmatic for sequential execution.

**Final selection:** Harness init only (Recommended)

---

## Runtime Target

| Option | Description | Selected |
|--------|-------------|----------|
| Measure naturally | Let onApplied improvements land, run suite, record new time. Any improvement satisfies TEST-MODERN-04. No hard target. | :heavy_check_mark: |
| Target under 50 minutes | Set concrete goal. Profile top-5 slowest files and optimize connection patterns. | |
| Profile only, no optimization | Measure per-file times, document slowest files, but don't optimize beyond onApplied. | |

**User's choice:** Measure naturally (Recommended)
**Notes:** No hard runtime target. onApplied gains measured organically.

---

## Helper Dedup Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Named files only | Strictly the 2 latestLobby() duplicates. Minimal scope, minimal risk. | |
| Opportunistic sweep | Fix the named 2, plus grep for other local helpers that duplicate shared/helpers/* during the pass. | :heavy_check_mark: |
| Full dedup audit | Systematic scan of all test files for any remaining local helper with shared equivalent. | |

**User's choice:** Opportunistic sweep
**Notes:** Fix named duplicates + catch others encountered during the pass. No systematic audit.

---

## Claude's Discretion

- Exact onApplied implementation pattern in createHarnessInternal
- Whether verifyUserViaServerConnection needs onApplied
- Which standalone scripts need .withConfirmedReads(false)
- Order of changes during execution

## Deferred Ideas

- Real view integration tests (TEST-MODERN-03) — deferred until v1 frontend subscription strategy locked
- Inter-reducer sync() event-driven replacement — over-engineering for current model
- Active runtime optimization beyond onApplied gains
- sync() default reduction (500ms → 200ms)
