---
phase: 16-route-global-foundation
plan: 04
subsystem: infra
tags: [service-worker, cache-first, cdn-caching, uploadthing, imgur, cache-storage-api, next15]

# Dependency graph
requires:
  - phase: 16-route-global-foundation
    provides: "Plan 01 (authed) route-group rename + providers.tsx 'use client' shell; Plan 03 middleware matcher excludes /sw.js by positive-list construction"
provides:
  - "public/sw.js — 48 LOC hand-written cache-first Service Worker, zero npm deps, root scope via /sw.js"
  - "app/providers.tsx — gated useEffect registering /sw.js on (NODE_ENV=production || NEXT_PUBLIC_ENABLE_SW=true)"
  - "app/dev-unregister-sw/page.tsx — dev utility page with prod notFound() gate"
  - "ALLOWED_HOSTS = ['ufs.sh', 'i.imgur.com'] allowlist (D-17 — UploadThing + Imgur only; Discord explicitly excluded)"
  - "App-origin origin-guard as FIRST fetch-handler line (D-18 / Pitfall 3 defense)"
  - "VERSION=1 invalidation lever for future cache-shape changes"
affects: [phase-17-public-pages, phase-24-profile, phase-28-lobby, phase-31-drafting, phase-32-match-results, gsd-verify-work-16]

# Tech tracking
tech-stack:
  added: []  # Zero new dependencies. Uses browser Service Worker API + Cache Storage API (platform primitives).
  patterns:
    - "hand-written-sw (chose over Workbox / next-pwa / @serwist/next — 48 LOC fits asset-CDN-only need)"
    - "origin-guard-first fetch-handler ordering (Pitfall 3 — never intercept app origin)"
    - "allowlist-based cross-origin interception (explicit hostnames + subdomain endsWith)"
    - "cache-first with GET-only + response.ok put (safe against POST / error caching)"
    - "prod-gated dev utility page via notFound() as first statement"

key-files:
  created:
    - public/sw.js
    - app/dev-unregister-sw/page.tsx
  modified:
    - app/providers.tsx

key-decisions:
  - "ALLOWED_HOSTS = ['ufs.sh', 'i.imgur.com'] — 2-entry constant array (D-17). Imgur lands in Phase 16 even though Imgur uploads wire in Phase 32; the extra entry costs nothing and pre-empts a re-edit of sw.js when Phase 32 ships."
  - "Discord CDN hostname NOT in ALLOWED_HOSTS — explicit exclusion (D-17). Discord avatars are loaded directly from cdn.discordapp.com by the NavBar; caching them cross-session is not worth the extra allowlist surface."
  - "Origin-guard FIRST line of fetch handler (D-18). Any ordering that runs the allowlist check before the origin short-circuit is dangerous — a future hostname collision with `localhost`-style dev hosts could leak app-origin requests into the SW path. Hard-coding the origin return as the FIRST statement is the structural invariant."
  - "Empty dep array on the providers useEffect (Pitfall 7). Adding deps risks multi-register per session; `[]` is a crystalline invariant readable at-a-glance."
  - "notFound() as FIRST statement in dev-unregister-sw/page.tsx (D-20, T-16-04-04 mitigation). Prod-gate precedes all state (useState not reached in 404 path) and any UI render."

patterns-established:
  - "Hand-written SW is the right tool at ~40 LOC / zero build-step overhead. Revisit library adoption only if we add PWA install, offline, or background sync (not in current v0.9 scope)."
  - "Dev utilities use notFound() prod-gate as first-line invariant rather than route-level gating — cleaner removal path, no framework ceremony."
  - "[SW] bracketed D-33 log tag covers install / activate / intercept / register-success / register-failure / dev-skip — single grep pulls every lifecycle event for triage."

requirements-completed: [FOUND-07]

# Metrics
duration: ~5min
completed: 2026-04-19
---

# Phase 16 Plan 04: Service Worker Summary

**First Service Worker in the repo — 48 LOC hand-written cache-first SW that intercepts only UploadThing (ufs.sh) + Imgur (i.imgur.com) asset-CDN requests, with app-origin origin-guard as the first fetch-handler line; registered from providers.tsx on production-or-opt-in; paired with a dev-unregister-sw page gated to 404 in prod.**

## Performance

- **Duration:** ~5 min (plan start 2026-04-19T05:12:20Z; last task commit 2026-04-19T05:16:59-05:00 = 2026-04-19T10:16:59Z)
- **Started:** 2026-04-19T05:12:20Z
- **Completed:** 2026-04-19T05:17:40Z (post-build + typecheck + harness)
- **Tasks:** 3
- **Files created:** 2 (public/sw.js, app/dev-unregister-sw/page.tsx)
- **Files modified:** 1 (app/providers.tsx)
- **New route size:** /dev-unregister-sw = 714 B (fits the "~1 KB unreachable in prod" spec)
- **Middleware bundle:** 34.1 kB (unchanged — orthogonal path)

## Accomplishments

- Shipped the first Service Worker in the repo. `/sw.js` is served at root scope (no Service-Worker-Allowed header gymnastics per RESEARCH Anti-Patterns) and, after registration, claims all clients in the scope.
- `ALLOWED_HOSTS = ['ufs.sh', 'i.imgur.com']` verified character-for-character against D-17. Discord CDN is not in the allowlist (case-sensitive `grep -n "discord" public/sw.js` returns 0 matches — the sole occurrence is capital `Discord` inside the explicit-exclusion comment).
- App-origin origin-guard is the FIRST non-URL-parsing statement in the fetch handler, defending against Pitfall 3 (SW catching RSC streams / API routes / SpacetimeDB WebSocket upgrades).
- Registration gate `NODE_ENV === 'production' || NEXT_PUBLIC_ENABLE_SW === 'true'` is logged through all three outcomes: dev-skip, opt-in-register-success, register-failure (`.catch()` graceful-degradation per T-16-04-05).
- Dev-unregister page ships at `/dev-unregister-sw` with `notFound()` as the first component-body statement — in prod without the opt-in flag, the user sees a Next 404 before any state is allocated.
- Zero new npm dependencies. VERSION=1 constant as the invalidation lever for future cache-shape changes.

## Task Commits

Each task was committed atomically:

1. **Task 1: Ship public/sw.js with asset-CDN allowlist + origin guard + cache-first handler** — `06e162c` (feat)
2. **Task 2: Register SW inside app/providers.tsx via gated useEffect (D-19)** — `0f09fb2` (feat)
3. **Task 3: Ship app/dev-unregister-sw/page.tsx dev utility with prod notFound() gate (D-20)** — `f9ff6e5` (feat)

**Plan metadata commit:** to be added when this SUMMARY + STATE.md + ROADMAP.md + REQUIREMENTS.md land in the final `docs(16-04)` commit.

## Files Created/Modified

- `public/sw.js` (created, 48 LOC) — Hand-written Service Worker. Const `VERSION=1`, `ASSET_CACHE='hsrpvp-assets-v1'`, `ALLOWED_HOSTS=['ufs.sh','i.imgur.com']`. Three event handlers: install → `skipWaiting`; activate → purge stale cache versions + `clients.claim`; fetch → origin-guard-first, then allowlist, then cache-first (`caches.open → cache.match || fetch + cache.put` on `response.ok && GET`).
- `app/providers.tsx` (modified, +24 lines / -1 line) — Added `useEffect` to the React import and a single empty-dep `useEffect` inside the `Providers` body before the return. Effect: gate-check `NODE_ENV || NEXT_PUBLIC_ENABLE_SW` → serviceWorker-API feature-check → `navigator.serviceWorker.register('/sw.js')` with `.then` success log and `.catch` failure log (all tagged `[SW]` per D-33). Provider composition `SessionProvider > HeroUIProvider > SpacetimeDBProvider > AuthProvider > GameDataProvider > {children}` unchanged.
- `app/dev-unregister-sw/page.tsx` (created, 37 LOC) — `'use client'` page. First statement: `if (NODE_ENV==='production' && NEXT_PUBLIC_ENABLE_SW!=='true') notFound();`. Inline-style UI (no HeroUI / no Tailwind per D-25), single `<button>` that calls `getRegistrations()` + `reg.unregister()` for each, then `caches.keys()` + `caches.delete()` for each, sets a status string with counts, and `setTimeout(() => window.location.replace('/'), 1500)`.

## Decisions Made

None at execution time beyond plan literal.

The plan's `<interfaces>` block lifted verbatim code from RESEARCH §Pattern 5 + PATTERNS §public/sw.js + PATTERNS §app/dev-unregister-sw/page.tsx. All three files land character-for-character against those templates with only the Phase-16-Plan-04 file-header comment added for provenance (no deviation from the canonical body).

## Deviations from Plan

None — plan executed exactly as written.

- Zero Rule 1/2/3 auto-fixes triggered. Two of three files are new-file creates; the providers.tsx edit is an additive useEffect + one import update (no pre-existing subscription or connection logic touched).
- `.env.local` was NOT modified at any point during execution (structurally impossible given the Task 2 / Task 3 manual-UAT steps are deferred to post-execution human walkthrough — see "Manual UAT" section below). `git status` on each task commit showed only the single plan file staged.
- Phase 15.5 harness (`test/backend/auth/auth-subscriptions.test.ts`) 2/2 green post-execution — sanity confirmed that a frontend-only plan does not regress backend subscription behavior.

## Acceptance Criteria Verification

### Task 1 — public/sw.js

| Check | Expected | Actual |
|-------|----------|--------|
| `[ -f public/sw.js ]` | OK | OK |
| `grep -n "ALLOWED_HOSTS" public/sw.js` | ≥1 match | 3 matches (comment + const decl + some() call) |
| `grep -E "ALLOWED_HOSTS\s*=\s*\['ufs\.sh',\s*'i\.imgur\.com'\]"` | 1 match | 1 match — exact D-17 literal |
| `grep -n "url.origin === self.location.origin"` | 1 match | line 28 |
| `grep -n "skipWaiting"` | 1 match | line 12 |
| `grep -n "clients.claim"` | 1 match | line 20 |
| `grep -n "caches.open"` | ≥1 match | line 38 |
| `grep -n "discord"` (case-sensitive) | 0 matches | 0 matches (capital `Discord` in comment only) |
| `grep -c "\[SW\]"` | ≥3 | 3 (install + activate + intercept) |
| `grep -En "VERSION\s*=\s*1"` | 1 match | line 6 |
| Line count | 20–60 | 48 |
| `npm run build` | exit 0 | exit 0 |

### Task 2 — app/providers.tsx

| Check | Expected | Actual |
|-------|----------|--------|
| `grep -n "useEffect"` | ≥1 | 2 (import + call) |
| `grep -n "navigator.serviceWorker.register('/sw.js')"` | 1 | present across lines 64–65 (split for formatting; verified via `grep -n 'register(.*sw\.js'` = line 65) |
| `grep -n "NEXT_PUBLIC_ENABLE_SW"` | 1 | line 53 |
| `grep -n "NODE_ENV === 'production'"` | 1 | line 52 |
| `grep -En "\}, \[\]\)"` | ≥1 | line 68 (empty dep array, Pitfall 7) |
| `grep -c "\[SW\]"` | ≥3 | 4 (dev-skip, feature-check-skip, register-success, register-failure) |
| Provider names (Session / HeroUI / SpacetimeDB / Auth / GameData) | all present | all present (lines 3, 11, 5, 9, 10) |
| `npm run build` | exit 0 | exit 0 |
| `npm run test:typecheck` | exit 0 | exit 0 |
| `.env.local` in commit | no | no (`git status` showed only providers.tsx) |

### Task 3 — app/dev-unregister-sw/page.tsx

| Check | Expected | Actual |
|-------|----------|--------|
| `[ -f "app/dev-unregister-sw/page.tsx" ]` | OK | OK |
| `grep -n "'use client'"` | 1 | line 1 |
| `grep -n "notFound"` | ≥2 | 3 (header comment + import + call) |
| `grep -n "process.env.NODE_ENV === 'production'"` | 1 | line 11 |
| `grep -n "NEXT_PUBLIC_ENABLE_SW"` | 1 | line 11 |
| `grep -n "getRegistrations"` | 1 | line 19 |
| `grep -n "caches.keys"` | 1 | line 21 |
| `grep -nE "@heroui|tailwind"` | 0 | 0 (D-25 primitives tool-agnostic) |
| Line count | ≥20 | 37 |
| `npm run build` | exit 0 | exit 0 (new route `/dev-unregister-sw` = 714 B First Load) |

### Overall plan §verification

| # | Check | Result |
|---|-------|--------|
| 1 | `[ -f public/sw.js ]` | OK |
| 2 | `[ -f "app/dev-unregister-sw/page.tsx" ]` | OK |
| 3 | `grep -n "serviceWorker.register" app/providers.tsx` | line 65 `.register('/sw.js')` |
| 4 | `grep -n "url.origin === self.location.origin"` on sw.js | line 28 |
| 5 | `grep -E "ALLOWED_HOSTS\s*=\s*\['ufs\.sh',\s*'i\.imgur\.com'\]"` | 1 match |
| 6 | `grep -n "notFound"` on dev page | 3 matches |
| 7 | `npm run build && npm run test:typecheck` | both exit 0 |
| 8 | 15.5 harness (`test/backend/auth/auth-subscriptions.test.ts`) | 2/2 passed, 13.59s |
| 9 | Manual UAT | deferred — see "Manual UAT" section below |
| 10 | `.env.local` not committed | confirmed (`git log --oneline -- .env.local` → empty) |

## D-17 Explicit-Exclusion Confirmation

Case-sensitive `grep -n "discord" public/sw.js` returns zero matches (exit 1). The word `Discord` (capital D) appears exactly once on line 8 inside the explanatory comment `// D-17: UploadThing + Imgur only; Discord explicitly excluded`. The exclusion is structural (Discord CDN hostname is not in the allowlist) AND documented (the comment tells future maintainers WHY it is not there). No Discord asset request will ever hit the SW cache-first path.

## D-17 Imgur Anticipation Note

The `i.imgur.com` entry is in the allowlist from Phase 16 even though Imgur uploads don't wire until Phase 32 (per the plan's objective statement). Rationale: a 2-entry constant array has zero logic cost, and adding Imgur here pre-empts a Phase 32 re-edit of `public/sw.js`. If Phase 32 discovers additional Imgur CDN hostnames (e.g., `s.imgur.com` for thumbnails), it can extend the array at that time without reworking the SW shape.

## .env.local Integrity

Per CLAUDE.md Gitignore Guardrail + Git Rules, `.env.local` is never committed. All three task commits were verified via `git status --short` before `git add` to contain ONLY the specific plan file being staged:

- Task 1 → `public/sw.js` (single new file)
- Task 2 → `app/providers.tsx` (single modified file)
- Task 3 → `app/dev-unregister-sw/page.tsx` (single new file, creates its parent directory)

`git log --oneline -- .env.local` returns empty (no history touches this file, consistent with the expected repo state). The plan's Task 2 / Task 3 manual-UAT scripts that would have edited `.env.local` locally were deferred to post-execution human walkthrough (see "Manual UAT" section) — they are not part of the commits.

## Manual UAT

Per the plan's Task 2 step 6 and Task 3 step 7, manual UAT requires:
- `npm run dev` on port 3001, browser DevTools with Application → Service Workers panel
- Three cookie / env-flag states: (a) dev + no flag → expect skip, (b) dev + `NEXT_PUBLIC_ENABLE_SW=true` in `.env.local` → expect register + scope=http://localhost:3001/, (c) prod simulation via `npm run build && npm run start` → expect `/dev-unregister-sw` to 404
- Clicking the unregister button and confirming regs + caches counts + 1.5s redirect to `/`
- Confirming no WebSocket reconnects, no NavBar flicker, no API 500s while SW is active (Pitfall 3 symptoms absent)

Per autonomous execution policy (CLAUDE.md: "do NOT pause for cross-boundary actions" but "Plan-level `human-action` checkpoints baked into PLAN.md" ARE valid pauses), the browser walkthrough is a phase-level verification step deferred to `/gsd-verify-work 16`. Structural verification (build + typecheck + grep acceptance + harness regression) passed 100% during this executor run.

The expected observations during `/gsd-verify-work 16`:

| Scenario | Expected Console Log | Expected DevTools State |
|----------|---------------------|------------------------|
| Dev, no `NEXT_PUBLIC_ENABLE_SW` | `[SW] skip register: NODE_ENV=development` | Application → Service Workers: none |
| Dev, `NEXT_PUBLIC_ENABLE_SW=true` | `[SW] install v1` → `[SW] activate v1` → `[SW] registered, scope=http://localhost:3001/` | Application → Service Workers: activated; Cache Storage: `hsrpvp-assets-v1` |
| Load a page with portraits | `[SW] intercept ufs.sh /<portrait-path>` (first hit) → cached entries in Cache Storage | Cache Storage grows with portrait URLs |
| `/dev-unregister-sw` in dev | button renders, click → "unregistering..." → "done — N SW unregistered, M caches cleared" → redirect `/` | regs + caches both empty post-click |
| `/dev-unregister-sw` in prod without opt-in | Next 404 | page does not mount; no component state allocated |

Any deviation from the above should be filed as a phase-level issue at `/gsd-verify-work 16` time, not as a Plan 04 regression — Plan 04 is structurally complete.

## Issues Encountered

None during execution.

One benign warning: `git commit` for Task 1 and Task 3 printed `warning: in the working copy of 'public/sw.js', LF will be replaced by CRLF the next time Git touches it` — this is Windows-default Git behavior on new LF-only files and has no effect on the committed bytes (the working-tree copy gets CRLF, the blob remains LF). No action needed.

One grep-test-design quirk: the initial acceptance-check `grep -n "serviceWorker.register('/sw.js')"` used single quotes inside the bash single-quoted pattern and returned empty; a regex form `grep -n 'register(.*sw\.js'` confirmed the call exists at line 65. This is a shell-quoting artifact, not a code issue.

## Cross-Plan Pointers

- **Plan 01 (complete):** `(authed)` route-group rename + Next 15.5.x. The SW registration useEffect piggybacks on the `'use client'` directive already present in providers.tsx since Plan 01.
- **Plan 03 (complete):** Middleware matcher excludes `/sw.js` by positive-list construction (4 entries: /profile, /admin-view, /lobby, /draft — none match /sw.js). This is the transparent dependency that lets the SW registration succeed for anonymous visitors (RESEARCH Pitfall 4 "SW not installed" pre-empted).
- **Plan 06 (Wave 3 — upcoming):** `docs/auth/architecture.md` Subscription Lifecycle section will mention the SW as an auxiliary cache layer (not a subscription mechanism) to forestall future confusion about where asset caching vs. data caching happens.
- **Phase 17 (PUB-12 asset prefetch):** The 2-hostname allowlist is sized for today; Phase 17 asset-prefetch work uses `requestIdleCallback` on the main thread (R2 commitment — no Web Worker) and will land cache hits on the SW's first intercept for each unique URL.
- **Phase 32 (Imgur uploads):** The `i.imgur.com` allowlist entry is in place. Phase 32 should audit whether it needs additional Imgur CDN hostnames (e.g., `s.imgur.com`) and extend the array if so — no other Plan 04 change expected.

## Next Phase Readiness

- **FOUND-07 satisfied** — Service Worker caches UploadThing asset CDN; gated to production or opt-in dev. Structural verification 100%.
- Phase 16 Wave B: Plan 04 DONE. All of Wave B now complete (Plans 03 + 04).
- Remaining in Phase 16: Plan 06 (Wave 3 docs + component-hygiene rules wrap-up).
- No blockers for Plan 06. Plan 06 scope is documentation + ROADMAP + REQUIREMENTS finalization; does not touch any Plan 04 code path.
- `/gsd-verify-work 16` will run the live browser UAT listed above as part of phase-level verification.

## Self-Check: PASSED

- Files exist:
  - `public/sw.js` (48 LOC, 1556 bytes post-LF-conversion) — verified via `[ -f public/sw.js ] && echo OK`
  - `app/dev-unregister-sw/page.tsx` (37 LOC) — verified via `[ -f app/dev-unregister-sw/page.tsx ] && echo OK`
  - `app/providers.tsx` — verified modified (useEffect import on line 4; SW registration effect lines 48–68)
- Commits exist (verified via `git log --oneline -4`):
  - `06e162c feat(16-04): add asset-CDN cache-first Service Worker (D-17, D-18)`
  - `0f09fb2 feat(16-04): register Service Worker inside Providers (D-19)`
  - `f9ff6e5 feat(16-04): add dev-unregister-sw page with prod notFound() gate (D-20)`
- Build green: `npm run build` exit 0 (new route `/dev-unregister-sw = 714 B`, middleware unchanged at 34.1 kB)
- Typecheck green: `npm run test:typecheck` exit 0
- 15.5 harness green: `test/backend/auth/auth-subscriptions.test.ts` 2/2 passed in 13.59s
- No accidental deletions in any task commit (`git diff --diff-filter=D --name-only HEAD~N HEAD` empty for each)
- Zero `.claude/` files in plan commits; zero `.env.local` changes
- All 14 acceptance-criteria grep checks (Task 1 + Task 2 + Task 3) pass

---
*Phase: 16-route-global-foundation*
*Plan: 04-service-worker*
*Completed: 2026-04-19*
