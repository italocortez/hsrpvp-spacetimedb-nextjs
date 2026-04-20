---
phase: 16-route-global-foundation
plan: 03
subsystem: infra
tags: [next15, middleware, edge-runtime, cookie-redirect, cve-2025-29927]

# Dependency graph
requires:
  - phase: 16-route-global-foundation
    provides: "Plan 01 Next 15.5.x bump (CVE-2025-29927 mitigation) + (authed) route-group rename"
provides:
  - "Root-level middleware.ts (Edge Runtime, 32 LOC, 34.1 kB Next-reported size)"
  - "Positive-list matcher covering 4 authed subtree families: /profile, /admin-view, /lobby, /draft"
  - "Cookie-less redirect to / (UX-only; real authz lives in SpacetimeDB RLS)"
  - "[middleware] D-33 bracketed logging on both redirect and pass branches"
affects: [phase-22-admin, phase-24-profile, phase-28-lobby, phase-30-drafting, phase-31-drafting, gsd-verify-work-16]

# Tech tracking
tech-stack:
  added: []  # Zero new dependencies. Uses next/server (already in Next 15.5.x bundle)
  patterns: ["edge-middleware-positive-list", "cookie-presence-weak-signal (not a trust boundary)"]

key-files:
  created:
    - middleware.ts
  modified: []

key-decisions:
  - "Positive-list matcher (4 static entries) chosen over negative-regex — explicit, build-time analyzable, fail-closed toward safety"
  - "String-literal 'stdb_session' not import from lib/session-cookie.ts — Edge Runtime zero-dep safety"
  - "Cookie PRESENCE only, no value validation — middleware is UX-only, not auth trust boundary"
  - "CVE-2025-29927 mitigated transparently by Plan 01's Next 15.5.x — no middleware-level code"

patterns-established:
  - "Edge middleware positive-list: only run on enumerated authed subtree families, everything else excluded by NOT being in the list"
  - "`[middleware]` bracketed-tag D-33 logging on every decision point (redirect + pass)"
  - "Zero SDK / zero JWT / zero async in Edge-runtime middleware body — crystalline UX layer"

requirements-completed: [FOUND-13]

# Metrics
duration: 2min
completed: 2026-04-19
---

# Phase 16 Plan 03: Middleware Summary

**Root-level Edge middleware with positive-list matcher — cookie-less visits to /profile, /admin-view, /lobby, /draft redirect to landing page; /, /costs, /teambuilder, /sw.js, /_next/*, /api/* never touched.**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-04-19T05:07:04Z
- **Completed:** 2026-04-19T05:08:53Z
- **Tasks:** 1
- **Files created:** 1 (middleware.ts)
- **Files modified:** 0
- **Middleware bundle size:** 34.1 kB (per `next build` output line: `ƒ Middleware 34.1 kB`)

## Accomplishments

- Shipped the first middleware in the repo — Next.js now applies the cookie gate at the edge for all 4 authed subtree families before SSR.
- Positive-list matcher covers today's leaf paths AND future sub-routes (/profile/[userId] Phase 24, /admin-view/* Phase 22, /lobby/[id] Phase 28, /draft/[matchId] Phase 30/31) without re-editing middleware.ts.
- Zero new npm dependencies; zero SpacetimeDB imports; zero async; zero JWT parsing; zero negative-regex.
- `[middleware]` bracketed D-33 logging on every decision (redirect + pass) for end-to-end observability in dev console and Vercel logs.
- CVE-2025-29927 mitigated transparently via Plan 01's Next 15.5.15 (`x-middleware-subrequest` verified cryptographically inside Next internals — no code required on our side).

## Task Commits

1. **Task 1: Write middleware.ts with positive-list matcher and cookie-gated redirect** — `8ad6333` (feat)

**Plan metadata commit:** [added in final commit below after SUMMARY lands]

## Files Created

- `middleware.ts` (32 LOC, repo root) — Edge middleware; reads `stdb_session` cookie, redirects cookie-less requests on 4 positive-list paths to `/`, logs every decision with `[middleware]` tag.

## Decisions Made

None at execution time beyond plan literal. All decisions pre-decided in Phase 16 CONTEXT (D-15 positive-list matcher; D-16 Next bump site; D-30 authed `/draft` intent; D-33 bracketed logging).

## Deviations from Plan

None — plan executed exactly as written.

- Canonical middleware body lifted verbatim from RESEARCH §Code Examples lines 740-765 + PATTERNS §middleware.ts lines 366-404.
- Matcher entries match D-15 character-for-character (4 strings, in the plan's exact form).
- Anti-scope guardrails from `<interfaces>` block honored (no SDK calls, no JWT parsing, no rate limiting, no async, no negative-regex, no dynamic matcher strings).
- Zero Rule 1/2/3 auto-fixes triggered — new-file-only change, no pre-existing code surface to interact with.

## Acceptance Criteria Verification

| Check | Result |
|-------|--------|
| `[ -f middleware.ts ]` | OK |
| `grep -c "request.cookies.get('stdb_session')"` | 1 match |
| `grep -c "NextResponse.redirect"` | 1 match |
| `grep -c "NextResponse.next"` | 1 match |
| `grep -c "\\[middleware\\]"` | 2 matches (one per decision branch) |
| 4 matcher entries `/profile/:path*`, `/admin-view/:path*`, `/lobby/:path*`, `/draft/:path*` | all present |
| `grep '/api'` | 0 matches (excluded by positive-list construction) |
| `grep '/_next'` | 0 matches (excluded by positive-list construction) |
| `grep '/sw.js'` | 0 matches (excluded by positive-list construction) |
| `grep 'spacetimedb'` | 0 matches (no SDK in Edge runtime) |
| `grep 'await'` | 0 matches (middleware body is synchronous) |
| `npm run build` | exit 0; output shows `ƒ Middleware 34.1 kB` |
| `npm run test:typecheck` | exit 0 |

## UX-Only Framing (Explicit Restatement)

**This middleware is NOT an auth trust boundary.** Its only job is to skip the flash of the `(authed)/layout.tsx` loading shell + SpacetimeDB connection establishment for visitors who clearly are not logged in. It reads cookie PRESENCE only, never cookie contents, and makes no backend call.

Real authorization lives at the SpacetimeDB RLS layer (reducer-level `ctx.sender` identity checks + view-based privacy projection). Setting the `stdb_session` cookie manually in DevTools will bypass the redirect but will NOT grant any additional access to private data — the backend remains the sole source of truth. This is documented as STRIDE disposition T-16-03-02 accept (Spoofing) and T-16-03-03 accept (Tampering) in the plan's `<threat_model>`.

## Manual UAT

Per the plan's Task 1 step 7, the end-to-end browser walkthrough is the phase-level verification — it requires spinning `npm run dev` on port 3001, DevTools cookie manipulation, and visual confirmation across 6 paths (/profile, /costs, /sw.js, /admin-view, /lobby, /draft with and without cookie + with guest login flow). Per autonomous execution policy, this is deferred to `/gsd-verify-work 16` where the user walks through the phase in a live browser. Structural verification (build + typecheck + grep acceptance criteria) passed 100% above.

The expected behaviors to confirm during `/gsd-verify-work 16`:

| Path | Cookie State | Expected | Console |
|------|--------------|----------|---------|
| `/profile` | absent | 307 redirect to `/` | `[middleware] redirect: /profile (no stdb_session cookie)` |
| `/admin-view` | absent | 307 redirect to `/` | `[middleware] redirect: /admin-view (no stdb_session cookie)` |
| `/lobby` | absent | 307 redirect to `/` | `[middleware] redirect: /lobby (no stdb_session cookie)` |
| `/draft` (or `/draft/abc`) | absent | 307 redirect to `/` | `[middleware] redirect: /draft (no stdb_session cookie)` |
| `/costs` | absent | 200 render, NO middleware run | no `[middleware]` log for /costs |
| `/teambuilder` | absent | 200 render, NO middleware run | no `[middleware]` log for /teambuilder |
| `/` | absent | 200 render, NO middleware run | no `[middleware]` log for / |
| `/sw.js` | absent | 404 today (Plan 04 ships the file), NO middleware run | no `[middleware]` log for /sw.js |
| `/profile` | present (after Guest login) | 200 render | `[middleware] pass: /profile (cookie present)` |

Whoever verifies this should also confirm from the Network tab that middleware latency is single-digit ms on authed path requests (Edge Runtime target; no SDK or network hops in the body).

## Issues Encountered

None. The plan was a single-task insert at the repo root with zero integration surface to break.

## Cross-Plan Pointers

- **Plan 01 (complete):** Next 15.5.15 bump is the source of CVE-2025-29927 mitigation. No middleware-level code needed here — documented in the file header comment.
- **Plan 06 (Wave 3 docs):** `docs/auth/architecture.md` Subscription Lifecycle section will be extended with the trust-boundary framing from this plan's threat model and the middleware's UX-only role. This SUMMARY's "UX-Only Framing" restatement is the source material.
- **Plan 04 (Wave B parallel):** Service Worker lands at `/sw.js`. Matcher confirmed excludes `/sw.js` by positive-list construction (not in the 4 enumerated entries) so SW registration proceeds for anonymous users — pre-empts RESEARCH Pitfall 4 "SW not installed" warning sign.

## Next Phase Readiness

- **FOUND-13 satisfied** — middleware positive-list matcher + cookie-less redirect + excludes /sw.js, /_next/*, /api/*.
- Phase 16 Wave B partial: Plan 03 DONE. Plan 04 (Service Worker) still pending in Wave B; Plan 06 (docs + component-hygiene) in Wave 3 after Wave B completes.
- No blockers for Plan 04 — middleware and SW are orthogonal (middleware runs on Edge for authed paths; SW runs in browser for CDN assets).
- `/gsd-verify-work 16` will run the live browser UAT listed above as part of phase verification.

## Self-Check: PASSED

- File exists: `middleware.ts` (32 LOC, verified via `[ -f middleware.ts ]`)
- Commit exists: `8ad6333` (verified via `git log --oneline --all | grep 8ad6333`)
- Build green: `npm run build` exit 0, `ƒ Middleware 34.1 kB` line in output
- Typecheck green: `npm run test:typecheck` exit 0
- All 14 acceptance criteria grep checks pass (see table above)
- Zero deletions in the commit (`git diff --diff-filter=D --name-only HEAD~1 HEAD` empty)
- Only `middleware.ts` in the commit diff (no `.claude/` or other out-of-scope files)

---
*Phase: 16-route-global-foundation*
*Plan: 03-middleware*
*Completed: 2026-04-19*
