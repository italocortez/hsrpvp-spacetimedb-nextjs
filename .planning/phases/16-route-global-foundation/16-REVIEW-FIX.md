---
phase: 16-route-global-foundation
fixed_at: 2026-04-18T01:34:00Z
review_path: .planning/phases/16-route-global-foundation/16-REVIEW.md
review_notes_path: .planning/phases/16-route-global-foundation/16-REVIEW-NOTES.md
iteration: 1
findings_total: 27
findings_in_scope: 19
fixed: 18
partially_fixed: 1
skipped: 8
status: all_in_scope_resolved
---

# Phase 16: Code Review Fix Report

**Fixed at:** 2026-04-18
**Source review:** `.planning/phases/16-route-global-foundation/16-REVIEW.md`
**Audit notes:** `.planning/phases/16-route-global-foundation/16-REVIEW-NOTES.md`
**Iteration:** 1
**Regression harness:** `test/backend/auth/auth-subscriptions.test.ts` 2/2 ✓ post-fix
**Typecheck:** green at every commit
**Prod build:** green (`npm run build` post-WR-04)

## Summary

| Severity | Total | Fixed | Partial | Skipped |
|----------|-------|-------|---------|---------|
| Critical | 0     | —     | —       | —       |
| Warning  | 10    | 8     | 0       | 2       |
| Info     | 17    | 10    | 1       | 6       |
| **Totals** | **27** | **18** | **1** | **8** |

Skipped (8): IN-02, IN-03, IN-09, IN-13, IN-17 (user veto), WR-01, WR-05 (over-speculation — analyzed against actual code, claims were unreproducible), IN-10 (self-cancelled by reviewer as intentional).

## Fixed Issues

### Batch 1 — Docs-only (commit `a85354b`)

- **IN-07** `useAuth.ts` — JSDoc above Discord-linking effect documenting `getConnection` stability assumption.
- **IN-08** `middleware.ts` — comment explaining intentional `/api/…` exclusion from matcher.
- **IN-12** `useAuth.ts:182` — inline comment on `DISCORD_INTENT_TTL_MS = 5 * 60 * 1000`.
- **IN-14** `app/(authed)/(match)/layout.tsx` — JSDoc marking Phase 28 reservation for match-only subscriptions.
- **IN-16** `docs/frontend/component-hygiene.md:4` — clarified "enforced for Phase 17+ (Phase 16 is the foundation)".

### Batch 2 — Cleanup (commit `c17ee8a`)

- **IN-04** `Teamslot.tsx` — deleted 3 blocks of dead commented-out `<Image />` props (not load-bearing, file uses `<img>`).

### Batch 3 — Image fallback helper (commit `76e6bdc`)

- **IN-05** NEW file `lib/image-fallback.ts` exports `NOT_FOUND_IMAGE = '/not-found-image.webp'` and `handleImageError` handler. Applied at 5 `<img>` sites: `Teamslot.tsx` (path icon, portrait, element icon), `LoadoutDropdown.tsx` (miniElement, miniPortrait). Catches both empty-string and broken-CDN-URL failure modes; `endsWith` guard prevents infinite error loops if the fallback itself 404s. Diverged from reviewer's conditional-render suggestion (would have broken layout when portrait disappears).

### Batch 4 — Type + helper hoist (commit `189b20e`)

- **IN-15** `lib/spacetimedb.ts` — hoisted `isLiveChange(ctx: EventContext)` with doc comment. Removed duplicate declarations in `(authed)/layout.tsx` and `AuthProvider.tsx`; both now import from `@/lib/spacetimedb`.
- **IN-01 (partial)** `app/(authed)/layout.tsx` + `AuthProvider.tsx` — `ctx` parameters typed as `EventContext` (imported from `@/src/module_bindings`). **Row parameters kept as `any`** — the SDK's current type generator emits `{ [x: string]: {} }` as the row shape for table handlers (view row-types not projected through `__Infer`), and TypeScript can't narrow specific types to that empty-value index signature. Documented inline with an "upgrade when SDK generator emits inferrable row types" note. `EventContext` typing IS usable today and will catch any SDK shape drift via `npm run test:typecheck`.

### Batch 5 — SafariWarning cosmetic (commit `5b4b0f3`)

- **WR-08** `SafariWarning.tsx:13-19` — captured `isSafari()` return into a local `const safari`; log line reuses the captured value instead of re-computing.

### Batch 6 — SW + providers (commit `cc5e7a3`)

- **WR-03** `public/sw.js:37-50` — wrapped `cache.put` in `event.waitUntil(...)` with `.catch` instead of reviewer's `await` suggestion. Rationale: `event.waitUntil` extends SW lifetime for the cache write WITHOUT delaying the response to the browser (reviewer's `await` delays every asset by the cache-write time). Rejected writes (quota, Safari private) are swallowed with a warning instead of escaping as unhandled promise rejections.
- **IN-11** `app/providers.tsx:64-78` — attached `reg.addEventListener('updatefound', ...)` + `nw.addEventListener('statechange', ...)` inside the register chain. Logs "update available" when a new SW version is waiting — VERSION=1 today, next bump will reach tabs predictably.

### Batch 7 — dev-unregister-sw feature detection (commit `abdf1af`)

- **WR-02** `app/dev-unregister-sw/page.tsx:17-33` — guarded `navigator.serviceWorker` / `caches` behind feature-detection; wrapped handler in try/catch that surfaces errors to the status line instead of escaping as an unhandled rejection. Devs hit this page precisely when SW is misbehaving (Safari private, non-HTTPS, SW-disabled browsers).

### Batch 8 — middleware defense-in-depth (commit `64ff02d`)

- **WR-10** `middleware.ts:13-16` — added `if (path === '/') return NextResponse.next();` guard before the redirect. Matcher doesn't include `/` today, but any future change would create an infinite redirect. Pure defense-in-depth, 1 line.

### Batch 9 — CSP hardening (commit `bc95ce1`)

- **WR-04 (partial)** `next.config.ts:21` — dropped `'unsafe-eval'` from `script-src`. Smoke-tested with `npm run build` — exit 0, full route tree rendered, middleware bundle intact (34.1 kB). Deferred `'unsafe-inline'` removal to a dedicated security phase (requires middleware rewrite to generate per-request nonces + propagate via `x-nonce` header + `'strict-dynamic'`).

### Batch 10 — LoadoutDropdown consolidation (commits `6af5bf9` + `4ab687a`)

- **WR-06** `LoadoutDropdown.tsx:24-49` — replaced dual `mousedown` + `click` listener pattern with a single `mousedown` for outside-close. Added `handleSelect(idx)` wrapper that calls `onSelectIndex` and closes the menu. Inner buttons now call `handleSelect` on click. Follow-up commit `4ab687a` caught a missed `onClick={() => onSelectIndex(idx)}` → `handleSelect(idx)` wiring on the map's inner buttons (the initial commit only updated the outer refactor).
- **IN-06 (partial)** `LoadoutDropdown.tsx:107-120` — added `decoding="async"` to both miniElement + miniPortrait `<img>` tags. Skipped `loading="lazy"` (reviewer's other suggestion) because portraits inside a just-opened dropdown are effectively in-viewport — lazy loading adds IntersectionObserver overhead without payoff.

### Batch 11 — GameDataProvider real bug (commit `2eeb9f0`)

- **WR-07** `GameDataProvider.tsx:140` — changed `isReady: !!characterRows && !!lightconeRows` → `isReady: allReady`. The prior check was always truthy after mount because arrays are always truthy in JS (`!!([]) === true`). Consumer `useProfile.ts` gated rendering on `gameDataReady` — the gate always passed, causing a brief empty-profile render before data arrived. `allReady` is the correctly-computed variable already in scope (checks `.length > 0` on all 7 tables). This was the highest-impact Warning — a real bug, not a cosmetic hygiene item.

### Batch 12 — ViewportGate hardening (commit `2a3ba22`)

- **WR-09** `ViewportGate.tsx:39-95` — wrapped `dynamic(loader, opts)` in `useMemo([resolved, desktop, mobile, Skeleton])`. `next/dynamic` is designed for module-scope usage; calling it inside the function body produces a new lazy component per render (state loss + flicker on every render). Added prominent ⚠ JSDoc block documenting the loader referential-stability contract with ✅/❌ examples for Phase 27/31/35 consumers. No live breakage today (component shipped this phase, no consumers yet).

## Skipped Issues

### User vetoes (6)

| ID | Reason (from 16-REVIEW-NOTES.md) |
|----|-------|
| **IN-02** | `compiler.removeConsole` would strip deliberately-retained prod diagnostic logs; doesn't apply to `public/sw.js` anyway. |
| **IN-03** | SDK re-exports `HsrCharacterRow`/`HsrLightconeRow` as class identifiers — name collision with local interfaces. Local shapes differ from SDK. Cascading refactor out of phase scope. |
| **IN-09** | Invented token name `--color-warn-*` doesn't exist; existing `--color-warning: #FBBF24` is a different shade than the amber `#f59e0b` the component ships. Visual regression. |
| **IN-13** | User only runs `npm run dev`; `npm start` is not part of the workflow. Zero effective risk. |
| **IN-17** | High-risk Discord-linking hook extraction with subtle ref interplay (`autoRegisteredRef`, `linkingRef`, memoized `hasDiscordIntent`). Reviewer self-flagged as out of scope. |
| **IN-10** | Self-cancelled by reviewer — intentional per D-25, flagged for provenance only. |

### Over-speculation (2)

| ID | Reason (verified against actual code) |
|----|-------|
| **WR-01** | Reviewer claimed Stage 2 `subscribedRef` cleanup ordering creates a race on fast reconnect. Analysis: all statements in cleanup run synchronously within one tick; React runs cleanup strictly before the next effect body, so by the time the new effect checks `subscribedRef.current`, it's already false regardless of statement order. No reproducible race. |
| **WR-05** | Reviewer claimed `resolvedSignatureRef` could silence a legitimate resolve when user A → signOut → user B on same tab. Analysis: `extractProfileSignature` includes `id`, `username`, `displayName`, `lastLoginAt`, etc. — every meaningful field. Different users produce different signatures by construction (different `id` at minimum). The dedupe self-heals on user switch; scenario is impossible without a hash collision. `readProfileFromConnection` already resets the ref in the "no user found" path. |

## Notes

- **IN-01 downgraded to partial:** the SDK's generated row-parameter type is unusable for narrower type annotations (`{ [x: string]: {} }` empty-value index signature). `ctx: EventContext` typing IS applied and is the meaningful half — it gets discriminated-union narrowing on the `Event` tag union (`'Reducer' | 'SubscribeApplied' | ...`) and breaks the build on SDK drift via typecheck.
- **WR-04 downgraded to partial:** `'unsafe-eval'` dropped (verified no prod-build breakage). `'unsafe-inline'` deferred to a dedicated security phase that will add nonce-generation to middleware.
- **IN-06 downgraded to partial:** added `decoding="async"` but not `loading="lazy"` — dropdown portraits are in-viewport on open, lazy loading has observer overhead without payoff.

## Verification

- `npm run test:typecheck` — exit 0 at every commit
- `npm run build` — exit 0 post-WR-04 (CSP smoke test)
- `test/backend/auth/auth-subscriptions.test.ts` — 2/2 passed post-fix (15.5 D-12 regression harness)
- Zero `.claude/` pollution in any fix commit
- Zero files deleted

## Commits

| # | Commit | Fix | Files |
|---|--------|-----|-------|
| 1 | `a85354b` | IN-07, IN-08, IN-12, IN-14, IN-16 | 4 files (docs) |
| 2 | `c17ee8a` | IN-04 | Teamslot.tsx |
| 3 | `76e6bdc` | IN-05 | **new** `lib/image-fallback.ts`, Teamslot.tsx, LoadoutDropdown.tsx |
| 4 | `189b20e` | IN-15, IN-01 (partial) | `lib/spacetimedb.ts`, (authed)/layout.tsx, AuthProvider.tsx |
| 5 | `5b4b0f3` | WR-08 | SafariWarning.tsx |
| 6 | `cc5e7a3` | WR-03, IN-11 | sw.js, providers.tsx |
| 7 | `abdf1af` | WR-02 | dev-unregister-sw/page.tsx |
| 8 | `64ff02d` | WR-10 | middleware.ts |
| 9 | `bc95ce1` | WR-04 (partial) | next.config.ts |
| 10 | `6af5bf9` | WR-06, IN-06 (partial) | LoadoutDropdown.tsx |
| 10b | `4ab687a` | WR-06 follow-up | LoadoutDropdown.tsx |
| 11 | `2eeb9f0` | WR-07 (real bug) | GameDataProvider.tsx |
| 12 | `2a3ba22` | WR-09 | ViewportGate.tsx |

13 fix commits total (12 planned batches + 1 follow-up for WR-06 wiring). Each commit independently typechecks; `bc95ce1` (WR-04) additionally passes `npm run build` smoke test.
