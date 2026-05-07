---
phase: 11
slug: account-rating-matrix
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-06
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run test/backend/match-results/account-rating.unit.test.ts` |
| **Full suite command** | `npm run test:all` |
| **Estimated runtime** | ~120 seconds (full suite) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run test/backend/match-results/account-rating.unit.test.ts`
- **After every plan wave:** Run `npm run test:all`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-T1 | 11-01 | 1 | ARCH-01 | T-11-01 | Admin-only config write | compile | `npx tsc --noEmit --project spacetimedb/tsconfig.json` | n/a (type check) | ⬜ pending |
| 01-T2 | 11-01 | 1 | ARCH-01 | T-11-02 | Formula handles empty inputs, div-by-zero guards | unit | `npx vitest run test/backend/match-results/account-rating.unit.test.ts` | Yes (rewrite) | ⬜ pending |
| 02-T1 | 11-02 | 2 | ARCH-01, ARCH-02 | T-11-04, T-11-05 | ensureAdmin gate, f64 validation (NaN/Infinity/negative) | compile | `npx tsc --noEmit --project spacetimedb/tsconfig.json` | n/a (type check) | ⬜ pending |
| 02-T2 | 11-02 | 2 | ARCH-02 | T-11-07 | Auto-trigger only fires on maxPossible change | compile + regression | `npx tsc --noEmit --project spacetimedb/tsconfig.json && npx vitest run test/backend/match-results/account-rating.unit.test.ts` | n/a (type check + regression) | ⬜ pending |
| 02-T3 | 11-02 | 2 | ARCH-01, ARCH-02 | T-11-08 | Seed resolves IDs via subscription | compile + regression | `npx tsc --noEmit --project spacetimedb/tsconfig.json && npx vitest run test/backend/match-results/account-rating.unit.test.ts` | n/a (type check + regression) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Rewrite `test/backend/match-results/account-rating.unit.test.ts` — covered by Plan 11-01 Task 2 (TDD plan: tests written first in RED phase)

*Existing infrastructure covers all other phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Seed script archetype ID resolution | ARCH-02 | Requires live SpacetimeDB subscription | Run seed script against published module, verify archetype rows created |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
