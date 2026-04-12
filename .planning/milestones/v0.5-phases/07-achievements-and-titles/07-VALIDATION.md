---
phase: 7
slug: achievements-and-titles
status: draft
nyquist_compliant: false
wave_0_complete: true
created: 2026-03-27
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm run test:integration` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm run test:integration`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | ACHV-01 | integration | `spacetime publish --clear-database && npm test` | --- | pending |
| 07-01-02 | 01 | 1 | ACHV-01 | integration | `npm test` | --- | pending |
| 07-02-01 | 02 | 2 | ACHV-02 | integration | `npm test` | --- | pending |
| 07-02-02 | 02 | 2 | ACHV-03 | integration | `npm test` | --- | pending |
| 07-02-03 | 02 | 2 | ACHV-04 | integration | `npm test` | --- | pending |
| 07-02-04 | 02 | 2 | ACHV-01 | structural | `grep -c "seedAchievements" scripts/post-publish.ts` | --- | pending |

*Status: pending / green / red / flaky*

---

## Wave 0 Requirements

- [x] Achievement test data fixtures addressed by 07-02 Task 4 (post-publish bootstrap seeds 3 starter achievements per D-27)
- [x] Test helpers for achievement creation and criteria setup — covered by reducer CRUD in 07-02 Task 2; bootstrap uses them directly

*Existing test infrastructure (vitest, SpacetimeDB test harness) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Achievement progress visibility | ACHV-04 | Client-side computation from public tables | Verify AchievementCriteria rows are public and stat tables are queryable |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
