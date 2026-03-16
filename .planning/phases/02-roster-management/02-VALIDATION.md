---
phase: 2
slug: roster-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-16
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | SpacetimeDB module publish + manual reducer calls |
| **Config file** | spacetimedb/spacetime.json |
| **Quick run command** | `spacetime publish hsrpvp-test --clear-database -y --module-path spacetimedb` |
| **Full suite command** | Publish + call reducers via client or `spacetime sql` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `spacetime publish hsrpvp-test --clear-database -y --module-path spacetimedb`
- **After every plan wave:** Run full publish + manual reducer call verification
- **Before `/gsd:verify-work`:** Full suite must be green (module publishes, all reducers callable)
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | ROST-01 | smoke | Publish + call create_hsr_account | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | ROST-02 | smoke | Publish + call batch_upsert_characters | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | ROST-04 | smoke | Create multiple accounts, verify isActive | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | ROST-05 | smoke | Call admin roster reducers as admin | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | ROST-06 | smoke | Call update visibility toggles | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] No automated test framework for SpacetimeDB reducers (platform limitation — tests are manual publish + call)
- [ ] Verify existing `run_user_deletion` reducer handles HSR data cascade

*Note: SpacetimeDB modules are validated primarily through successful publish (compilation) and manual reducer invocation. No unit test framework is available for SpacetimeDB TypeScript modules.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lightcone ownership | ROST-03 | **DESCOPED** — schema exists from Phase 1, no reducers | N/A |
| Lobby visibility override | ROST-07 | Requires lobby system (Phase 9) — data model validated only | Verify isOpenRoster column exists on Lobby table |
| Rating from roster | ROST-08 | **DESCOPED to frontend** — verify raw data availability only | Confirm HsrAccountCharacter + HsrCharacterCost tables are public and subscribable |

---

## Validation Sign-Off

- [ ] All tasks have automated verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
