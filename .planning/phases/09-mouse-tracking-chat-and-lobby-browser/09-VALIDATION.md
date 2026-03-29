---
phase: 9
slug: mouse-tracking-chat-and-lobby-browser
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-29
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | TypeScript compiler (`tsc --noEmit`) + SpacetimeDB publish |
| **Config file** | spacetimedb/tsconfig.json |
| **Quick run command** | `cd spacetimedb && npx tsc --noEmit` |
| **Full suite command** | `cd spacetimedb && npx tsc --noEmit && spacetime publish hsrpvp-spacetimedb-nextjs-test1` |
| **Estimated runtime** | ~15-30 seconds |

**Note:** This is a backend-only phase producing SpacetimeDB reducers, helpers, views, and tables. The automated feedback mechanism is TypeScript compilation (`npx tsc --noEmit`) which validates type safety, import correctness, and schema compliance. Module publish (`spacetime publish`) validates the full SpacetimeDB module compiles and deploys. There are no unit test files (jest/vitest) for this phase — compilation + publish is the verification layer. Existing test files from earlier phases run against the published module during UAT.

---

## Sampling Rate

- **After every task:** Run `cd spacetimedb && npx tsc --noEmit`
- **After every plan (final task):** Run full publish: `spacetime publish hsrpvp-spacetimedb-nextjs-test1`
- **After every plan wave:** Regenerate bindings: `spacetime generate --lang typescript --out-dir ../src/module_bindings --project-path .`
- **Before `/gsd:verify-work`:** Full publish + bindings must succeed
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Automated Command | Status |
|---------|------|------|-------------|-------------------|--------|
| 09-01-01 | 01 | 1 | LBBY-01 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-01-02 | 01 | 1 | CHAT-01 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-01-03 | 01 | 1 | MOUS-01 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-02-01 | 02 | 2 | LBBY-02 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-02-02 | 02 | 2 | CHAT-03 | `cd spacetimedb && npx tsc --noEmit && spacetime publish hsrpvp-spacetimedb-nextjs-test1 2>&1 \| tail -5` | pending |
| 09-03-01 | 03 | 3 | CHAT-01/02 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-03-02 | 03 | 3 | MOUS-01/LBBY-01 | `cd spacetimedb && npx tsc --noEmit && spacetime publish hsrpvp-spacetimedb-nextjs-test1 2>&1 \| tail -5` | pending |
| 09-04-01 | 04 | 3 | LBBY-01/02 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-04-02 | 04 | 3 | LBBY-01/02 | `cd spacetimedb && npx tsc --noEmit && spacetime publish hsrpvp-spacetimedb-nextjs-test1 2>&1 \| tail -5` | pending |
| 09-05-01 | 05 | 3 | LBBY-01 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-05-02 | 05 | 3 | LBBY-01 | `cd spacetimedb && npx tsc --noEmit && spacetime publish hsrpvp-spacetimedb-nextjs-test1 2>&1 \| tail -5` | pending |
| 09-06-01 | 06 | 4 | MOUS-03 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-06-02 | 06 | 4 | MOUS-03 | `cd spacetimedb && npx tsc --noEmit && spacetime publish hsrpvp-spacetimedb-nextjs-test1 2>&1 \| tail -5` | pending |
| 09-07-01 | 07 | 5 | MOUS-03 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-07-02 | 07 | 5 | MOUS-03 | `cd spacetimedb && npx tsc --noEmit && spacetime publish hsrpvp-spacetimedb-nextjs-test1 2>&1 \| tail -5` | pending |
| 09-08-01 | 08 | 6 | MOUS-02/CHAT-01/03 | `cd spacetimedb && npx tsc --noEmit` | pending |
| 09-08-02 | 08 | 6 | MOUS-02/CHAT-01/03 | `cd spacetimedb && npx tsc --noEmit && spacetime publish hsrpvp-spacetimedb-nextjs-test1 2>&1 \| tail -5` | pending |
| 09-09-01 | 09 | 7 | all | `npx tsc --noEmit` (docs only, no compile needed) | pending |
| 09-09-02 | 09 | 7 | all | `npx tsc --noEmit` (docs only, no compile needed) | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

Not applicable. This phase uses TypeScript compilation + SpacetimeDB publish as the automated feedback mechanism. Every task has a valid `<automated>` verify command (`npx tsc --noEmit` and/or `spacetime publish`). No separate test stub files are needed.

*Wave 0 is satisfied by the existing TypeScript compiler infrastructure.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cursor broadcast visible to all roles | MOUS-01 | Requires live subscriptions | Publish, connect 2+ clients, verify cursor events appear |
| Chat rolling window cleanup | CHAT-02 | Requires 50+ messages in sequence | Send 51 messages, verify oldest deleted |
| Lobby browser filtering | LBBY-02 | Requires subscription-level verification | Subscribe to browser view, verify filter columns present |
| Tournament history reveal on completion | D-91 | Requires full tournament lifecycle | Run tournament to Completed, verify history records become visible |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands (tsc + publish)
- [x] Sampling continuity: every task runs tsc, every plan-final task runs publish
- [x] Wave 0 not needed — compiler is the feedback mechanism
- [x] No watch-mode flags
- [x] Feedback latency < 30s (tsc ~5s, publish ~15s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated
