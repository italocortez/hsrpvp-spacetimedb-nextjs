---
phase: 1
slug: schema-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-15
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | SpacetimeDB publish + inspect pattern (no test runner) |
| **Config file** | N/A — no test runner config exists |
| **Quick run command** | `spacetime publish hsrpvp --clear-database -y --module-path spacetimedb/` |
| **Full suite command** | `spacetime generate --lang typescript --out-dir src/module_bindings --module-path spacetimedb/ && npx tsc --noEmit` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `spacetime publish hsrpvp --clear-database -y --module-path spacetimedb/`
- **After every plan wave:** Run `spacetime generate --lang typescript --out-dir src/module_bindings --module-path spacetimedb/ && npx tsc --noEmit`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 1 | SCHM-01 | build-smoke | `spacetime publish hsrpvp --clear-database -y --module-path spacetimedb/` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 1 | SCHM-02 | build-smoke | `spacetime publish hsrpvp --clear-database -y --module-path spacetimedb/` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | SCHM-03 | build-smoke + inspect | `spacetime generate ... && grep audit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Verify `spacetime server list` shows maincloud as default (marked `***`)
- [ ] Confirm database name from existing publish config
- [ ] Verify `spacetime publish` succeeds with current codebase before making changes

*Existing infrastructure covers compilation — the publish pipeline IS the test.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Audit columns present on all new tables | SCHM-03 | Generated bindings must be visually inspected for createdAt/createdBy/updatedAt/updatedBy | Run `spacetime generate`, open each new binding file, confirm 4 audit columns exist |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
