---
phase: 10
slug: disconnect-handling-and-cost-parity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-03
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | test/vitest.config.ts |
| **Quick run command** | `npx vitest run test/` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run test/`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 10-01-01 | 01 | 1 | DISC-01 | unit | `npm test` | ⬜ W0 | ⬜ pending |
| 10-01-02 | 01 | 1 | DISC-02 | unit | `npm test` | ⬜ W0 | ⬜ pending |
| 10-01-03 | 01 | 1 | DISC-03 | unit | `npm test` | ⬜ W0 | ⬜ pending |
| 10-01-04 | 01 | 1 | DISC-04 | unit | `npm test` | ⬜ W0 | ⬜ pending |
| 10-01-05 | 01 | 1 | COST-01 | unit | `npm test` | ⬜ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| clientDisconnected lifecycle hook fires on real disconnect | DISC-01 | Requires real WebSocket disconnect against live server | Publish to maincloud, connect two clients, kill one client process, check server logs |
| Rejoin restores full match state without corruption | DISC-02 | Requires real reconnection flow | Disconnect during draft, reconnect, verify match state matches pre-disconnect |

*Automated tests cover reducer logic; manual tests cover real disconnect/reconnect behavior.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
