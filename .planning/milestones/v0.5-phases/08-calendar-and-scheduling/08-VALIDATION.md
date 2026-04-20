---
phase: 8
slug: calendar-and-scheduling
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-28
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (existing) |
| **Config file** | `test/vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose` (regression check)
- **After every plan wave:** Run `npx vitest run --reporter=verbose` + `spacetime publish` verification
- **Before `/gsd:verify-work`:** Full suite must be green, module published
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 08-01-01 | 01 | 1 | CAL-01, CAL-02, CAL-04 | build | `cd spacetimedb && npx spacetimedb-build` | ⬜ pending |
| 08-01-02 | 01 | 1 | CAL-01, CAL-02, CAL-03, CAL-04, CAL-05 | publish | `spacetime publish hsrpvp --skip-clippy && spacetime generate` | ⬜ pending |
| 08-02-01 | 02 | 2 | CAL-05 | build | `cd spacetimedb && npx spacetimedb-build` | ⬜ pending |
| 08-02-02 | 02 | 2 | CAL-05 | regression | `npm test` | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework setup needed.

Per project workflow (`feedback_uat_workflow.md`): **manual UAT first, then `/gsd:add-tests`**. Calendar integration tests will be created after UAT verification, not before execution.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Recurring availability slot creation (daily/weekly/monthly, Feb edge cases) | CAL-01 | Requires published module + spacetime sql verification | Create slots via reducer, verify via `spacetime sql` |
| Calendar subscription cap (5 max) and visibility toggle | CAL-02 | Requires multi-user setup on maincloud | Save 5 calendars, attempt 6th, verify rejection |
| Common availability overlap computation | CAL-03 | Client-side per D-09 — no server reducer | Create overlapping slots for 3 users, verify client can compute windows |
| Calendar event CRUD + invite accept/decline | CAL-04 | Requires multi-user interaction | Create event, invite player, respond, verify via sql |
| TO match scheduling with auto-invite | CAL-05 | Requires full tournament + bracket setup | Create tournament, generate bracket, create calendar event linked to match, verify auto-invites |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify (build/publish/regression)
- [x] Sampling continuity: all tasks have automated verification
- [x] Wave 0: no prerequisites — existing infrastructure sufficient
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-03-28 (manual-UAT-first workflow)
