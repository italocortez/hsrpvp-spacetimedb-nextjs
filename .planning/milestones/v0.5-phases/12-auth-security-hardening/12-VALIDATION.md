---
phase: 12
slug: auth-security-hardening
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-07
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (integration) |
| **Config file** | `test/vitest.integration.config.ts` |
| **Quick run command** | `npx vitest run --config test/vitest.integration.config.ts --reporter verbose test/backend/auth/` |
| **Full suite command** | `npx vitest run --config test/vitest.integration.config.ts` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --config test/vitest.integration.config.ts --reporter verbose test/backend/auth/`
- **After every plan wave:** Run `npx vitest run --config test/vitest.integration.config.ts`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | SEC-01 | T-12-02 | UserPrivate table uses `public: false` | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "UserPrivate is private"` | ❌ W0 | ⬜ pending |
| 12-01-02 | 01 | 1 | SEC-01 | — | Link Discord creates UserPrivate + sets hasDiscordLinked | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "link discord creates UserPrivate"` | ❌ W0 | ⬜ pending |
| 12-02-01 | 02 | 2 | SEC-03 | T-12-03 | Ban discordId then re-link rejected | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "banned provider rejected"` | ❌ W0 | ⬜ pending |
| 12-02-02 | 02 | 2 | SEC-03 | T-12-05 | Banned user soft-deleted triggering logout | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "ban triggers soft delete"` | ❌ W0 | ⬜ pending |
| 12-03-01 | 03 | 3 | SEC-02 | T-12-02 | view_my_identity returns only caller's mapping | integration | `npx vitest run test/backend/auth/auth-security.test.ts -t "view_my_identity"` | ❌ W0 | ⬜ pending |
| 12-03-02 | 03 | 3 | SEC-04 | T-12-01 | Ephemeral connection resolves correct identity | manual | Manual API route test | — | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `test/backend/auth/auth-security.test.ts` — stubs for SEC-01 through SEC-04
- [ ] `test/shared/connection.ts` — update `verifyUserViaServerConnection` to call `serverLinkProvider` and handle private UserIdentity

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Ephemeral connection resolves correct identity | SEC-04 | Requires API route with real SpacetimeDB token | Call `/api/auth/link-discord` with spacetimeToken, verify identity matches |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
