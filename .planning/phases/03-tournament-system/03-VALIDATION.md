---
phase: 03
slug: tournament-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 4.x |
| **Config file** | `test/vitest.config.ts` (unit), `test/vitest.integration.config.ts` (integration) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test:all` |
| **Estimated runtime** | ~5 seconds (unit), ~10s (integration with live server) |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test:all`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | TRNT-01 | unit | `npm test` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | TRNT-02,03,04 | unit | `npm test` | ❌ W0 | ⬜ pending |
| 03-01-03 | 01 | 1 | TRNT-08,09,10 | unit | `npm test` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | TRNT-05,06 | integration | `npm run test:integration` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | TEAM-01,02,03 | integration | `npm run test:integration` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | TRNT-07,11,12 | integration | `npm run test:integration` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/unit/role-hierarchy.test.ts` — role level comparison, promotion/demotion rules
- [ ] `test/unit/tournament-stages.test.ts` — stage transition validation
- [ ] `test/integration/phase-03/` — directory for tournament integration tests
- [ ] Test mock update for new enums (Moderator, TournamentHost, RosterVisibility)

*Existing test infrastructure (vitest, mocks) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cost set draft/publish workflow | CostSet CRUD | Requires live SpacetimeDB + multi-user scenario | Publish module, create cost set as TO, edit drafts, publish, verify broadcast |
| Tournament lifecycle transitions | TRNT-04 | Requires sequential state mutations + verification | Create tournament, advance stages, verify each transition |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
