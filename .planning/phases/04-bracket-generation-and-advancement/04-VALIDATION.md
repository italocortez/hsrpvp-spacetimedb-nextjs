---
phase: 04
slug: bracket-generation-and-advancement
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-18
---

# Phase 04 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | SpacetimeDB `spacetime publish` (TypeScript compilation) + `spacetime generate` (binding verification) |
| **Config file** | `spacetimedb/tsconfig.json` |
| **Quick run command** | `cd spacetimedb && npx tsc --noEmit` |
| **Full suite command** | `spacetime publish hsrpvp-spacetimedb-nextjs-test1 --module-path spacetimedb` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd spacetimedb && npx tsc --noEmit`
- **After every plan wave:** Run full `spacetime publish`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 1 | BRKT-06 | compile | `npx tsc --noEmit` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | BRKT-01, BRKT-02, BRKT-03 | compile + grep | `npx tsc --noEmit && grep -c "generate_bracket" spacetimedb/src/reducers/bracketGeneration.ts` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 1 | BRKT-05 | compile + grep | `npx tsc --noEmit && grep -c "seed_bracket\|swap_seeds" spacetimedb/src/reducers/bracketGeneration.ts` | ❌ W0 | ⬜ pending |
| 04-02-01 | 02 | 2 | BRKT-04 | compile + grep | `npx tsc --noEmit && grep -c "advance_bracket_match" spacetimedb/src/reducers/bracketAdvancement.ts` | ❌ W0 | ⬜ pending |
| 04-02-02 | 02 | 2 | BRKT-04 | compile | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing TypeScript compilation infrastructure covers all phase requirements
- No additional test framework needed — SpacetimeDB publish validates module correctness

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bracket FK links are correct for 8-player single elim | BRKT-01 | Requires live database to verify inserted rows | Publish module, call generate_bracket via client, query BracketMatch rows |
| Double elim losers bracket cross-feed prevents rematches | BRKT-02 | Algorithmic correctness requires manual bracket inspection | Generate 8-player double elim, verify losers bracket feed-in is crossed |
| Auto-advancement places winner in correct next slot | BRKT-04 | Requires live match result submission + bracket state check | Submit match result, verify winnerId propagates to next BracketMatch |
| MMR-based seeding sorts correctly | BRKT-05 | Requires MmrRating rows + live generate_bracket call | Seed with known MMR values, verify order |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
