---
phase: 05
slug: match-results-and-mmr
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-21
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `test/vitest.config.ts` |
| **Quick run command** | `npm run test:integration -- --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:integration -- --reporter=verbose`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | MTCH-01 | integration | `spacetime sql` verify | ❌ W0 | ⬜ pending |
| 05-01-02 | 01 | 1 | MMR-01 | integration | `spacetime sql` verify | ❌ W0 | ⬜ pending |
| 05-02-01 | 02 | 2 | MTCH-02..09 | integration | `spacetime sql` verify | ❌ W0 | ⬜ pending |
| 05-02-02 | 02 | 2 | MMR-02..07 | integration | `spacetime sql` verify | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test harness already exists (`test/helpers/spacetimedb-test-harness.ts`)
- [ ] Existing test suite passing (`npm test`)

*Existing infrastructure covers all phase requirements. Phase 5 UAT uses the spacetimedb test harness for post-publish verification.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Screenshot URL validation (Imgur format) | MTCH-04 | URL format check is in reducer code, but actual Imgur accessibility is external | Verify reducer accepts valid Imgur URLs and rejects non-Imgur URLs via spacetime sql |
| Leaderboard top-100 ordering | MMR-06 | Requires multiple users with different ratings | Verify via spacetime sql ORDER BY on Leaderboard table after processing multiple match results |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
