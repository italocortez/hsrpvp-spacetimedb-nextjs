---
phase: 16
slug: route-global-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-18
---

# Phase 16 — Validation Strategy

> Per-phase validation contract. Source: 16-RESEARCH.md § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest@^4.1.0` — two configs: `test/vitest.config.ts` (unit), `test/vitest.integration.config.ts` (integration) |
| **Config file** | Both exist — Phase 16 uses integration only |
| **Quick run command** | `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` |
| **Full suite command** | `npm run test:integration` |
| **Estimated runtime** | Quick: ~30s (8 tests). Full: ~10 min (~600 tests, per Phase 15.3 experience) |

---

## Sampling Rate

- **After every task commit:** `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` (D-12 regression guard)
- **After every plan wave:** `npm run test:integration`
- **Before `/gsd-verify-work`:** Full suite green + `npm run build` exits 0
- **Max feedback latency:** 30 seconds (quick run)

---

## Per-Task Verification Map

Plan-level mapping. Filled during planning — each plan must set per-task `<automated>` commands or Wave 0 file gaps.

| Req ID | Behavior | Test Type | Automated Command | File Exists | Status |
|--------|----------|-----------|-------------------|-------------|--------|
| FOUND-03 | `typedRoutes: true` top-level + Next ≥15.5 resolved | build-time | `npm run build` exits 0 | ✅ existing build gate | ⬜ pending |
| FOUND-04 | Route groups renamed; no broken `<Link>` / `router.push` | build-time + typecheck | `npm run build && npm run test:typecheck` | ✅ existing gates | ⬜ pending |
| FOUND-05 + FOUND-06 | Subscription ownership moved to providers without 15.5 regression | integration | `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` | ✅ 15.5 harness — **D-12 mandate** | ⬜ pending |
| FOUND-07 | SW registers in prod, skipped in dev (opt-in via `NEXT_PUBLIC_ENABLE_SW`) | manual + build | Manual: visit `/sw.js`, DevTools Application tab | ❌ manual-only — NOT a Wave 0 gap | ⬜ pending |
| FOUND-08 | Safari banner renders on Safari UA | manual UAT | UA-override to Safari, verify banner | ❌ manual-only | ⬜ pending |
| FOUND-09 | `getRenderTier()` caching + VERSION invalidation | manual (see Wave 0 note) | DevTools localStorage inspection | ❌ manual-only | ⬜ pending |
| FOUND-10 | `<ViewportWriter />` writes `vp=desktop|mobile` cookie | manual UAT | Clear cookie → load page → check DevTools cookies | ❌ manual-only | ⬜ pending |
| FOUND-11 | SSR renders safe default (Skeleton-first per D-27/D-28), client swap, no hydration error | manual UAT + console check | `curl` for server HTML; DevTools console for hydration warnings | ❌ manual-only | ⬜ pending |
| FOUND-12 | `<ViewportGate>` falls back to desktop when mobile sibling absent | build + manual | Dynamic imports typecheck; manual click-through | ❌ manual-only | ⬜ pending |
| FOUND-13 | Middleware redirects cookie-less `(authed)/*` paths | manual UAT | Clear cookies → visit `/profile` → expect redirect | ❌ manual-only | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

**No new test files are planned for Phase 16**, per CLAUDE.md "Test files are the verification layer. Do not create, edit, or delete test files without an explicit task":

- The 15.5 harness `test/backend/auth/auth-subscriptions.test.ts` is the canonical regression guard for the subscription-ownership reshuffle (D-12).
- `lib/render-tier.ts` unit tests would be ideal but are explicitly out of scope. Manual verification via UAT step-through in `/gsd-verify-work` is the substitute.
- Middleware / SW / ViewportGate behaviors are UAT-only (manual click-through), matching repo convention.

*If the user wants unit tests for `lib/render-tier.ts`, that's a plan-phase scope bump requiring an explicit task.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| SW registration in prod | FOUND-07 | No headless-SW harness in repo; opt-in dev flag covers local testing | Visit `/sw.js` in prod build; DevTools Application tab shows activated SW |
| Safari banner | FOUND-08 | UA sniff runs on real browser; no Safari CI | UA-override in DevTools → Safari desktop → banner should render above NavBar |
| `vp` cookie write | FOUND-10 | Client-only effect; no SSR assertion needed | Clear cookies → load any page → DevTools cookies shows `vp=desktop` or `vp=mobile`, 1yr expiry, SameSite=Lax |
| SSR hydration safety | FOUND-11 | Skeleton-first render (D-27/D-28) verified by absence of console warnings | Cold reload any page → React hydration-mismatch console must be empty |
| ViewportGate fallback | FOUND-12 | Dynamic import behavior | Temporarily delete a `.mobile.tsx` sibling → page still renders desktop sibling on coarse pointer (no thrown error) |
| Middleware redirect | FOUND-13 | UX-only redirect | Clear `stdb_session` → visit `/profile` → expect 307 to login |
| `getRenderTier()` cache | FOUND-09 | 7-day localStorage TTL + VERSION bump | Set localStorage override → reload → banner reflects override; bump VERSION constant in source → reload → cache invalidated |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or are listed in Manual-Only Verifications
- [ ] Sampling continuity: D-12 regression harness runs after every backend-adjacent commit
- [ ] Wave 0 covers all MISSING references — confirmed zero new test files per CLAUDE.md
- [ ] No watch-mode flags in plan task commands
- [ ] Feedback latency < 30s for quick run
- [ ] `nyquist_compliant: true` set after planning completes

**Approval:** pending
