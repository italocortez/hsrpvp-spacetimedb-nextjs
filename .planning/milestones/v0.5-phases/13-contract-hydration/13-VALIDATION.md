---
phase: 13
slug: contract-hydration
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-09
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification (docs-only phase — no code changes) |
| **Config file** | none |
| **Quick run command** | `ls docs/*/architecture.md docs/*/contract.md \| wc -l` |
| **Full suite command** | `find docs/ -name "architecture.md" -exec head -1 {} \; \| grep -c "Architecture"` |
| **Estimated runtime** | ~2 seconds |

---

## Sampling Rate

- **After every task commit:** Verify file heading format matches template
- **After every plan wave:** Count normalized files vs total expected
- **Before `/gsd-verify-work`:** All 19 architecture.md + 18 contract.md must match template structure
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | D-01 to D-05 | — | N/A (docs only) | manual | `head -2 docs/roster/architecture.md` | N/A | ⬜ pending |
| 13-02-01 | 02 | 2 | D-01 to D-05 | — | N/A | grep | `grep -c "Architecture" docs/*/architecture.md` | N/A | ⬜ pending |
| 13-03-01 | 03 | 2 | D-06 to D-11 | — | N/A | grep | `grep -c "## Reducers" docs/*/contract.md` | N/A | ⬜ pending |
| 13-04-01 | 04 | 3 | D-12 to D-13 | — | N/A | file-check | `ls .planning/codebase/*.md \| wc -l` | N/A | ⬜ pending |
| 13-05-01 | 05 | 3 | D-14 to D-16 | — | N/A | file-check | `head -5 docs/FRONTEND-HANDOFF.md` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework needed for docs-only phase.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Content accuracy | D-09 (full hydration) | Reducer docs must match actual code — grep can verify section exists but not content accuracy | Spot-check 3-5 reducer docs against source code |
| ERD cardinality | D-15, D-16 | Mermaid cardinality annotations must match actual FK relationships | Compare ERD against table definitions |

---

## Validation Sign-Off

- [x] All tasks have automated verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
