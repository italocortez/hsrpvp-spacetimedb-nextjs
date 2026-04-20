---
status: complete
phase: 16-route-global-foundation
source: [16-VERIFICATION.md]
started: 2026-04-18T00:00:00Z
updated: 2026-04-19T19:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cookie-less visit to an authed path redirects to landing
expected: Visiting http://localhost:3000/profile with stdb_session cookie cleared returns 307 redirect to /; console shows `[middleware] redirect: /profile (no stdb_session cookie)`; /costs does NOT redirect (not in positive-list matcher); /sw.js not redirected either
result: pass
history: "Previously failed with CSP unsafe-eval blocker; fix committed c6c3391 — re-test passed."

### 2. Cookie-present visit to authed path passes through
expected: After Guest login the stdb_session cookie is set; revisiting /profile shows the page; console shows `[middleware] pass: /profile (cookie present)`
result: pass
notes: "Verified after user directed to Firefox Storage tab (not Application) and server terminal (not browser console). stdb_session present in Storage → Cookies; `[middleware] pass: /profile (cookie present)` printed in npm run dev terminal; GET /profile 200."

### 3. Service Worker registers on production build and intercepts only allowlisted CDN assets
expected: `npm run build && npm run start` — DevTools Application → Service Workers shows active SW; Cache Storage grows with ufs.sh / i.imgur.com URLs on asset loads; no intercepts of app origin (/api, _next, /sw.js navigations clean)
result: pass
history: |
  Four bugs diagnosed and fixed over this test cycle:
  - c6ce7e1 fix(16): CSP prod unsafe-eval required for SpacetimeDB SDK
    (WR-04 wrongly dropped 'unsafe-eval' in prod; SDK uses Function() for BSATN codegen).
  - 6ad7ba0 fix(16): CSP connect-src + SW error logging for CDN fetches
    (connect-src missing ufs.sh; SW fetch had no try/catch around fetch()).
  - d661ff9 fix(16): SW fetches CDN images in CORS mode, drop imgur allowlist
    (opaque responses from no-cors <img> always had response.ok=false so cache.put
    never ran; switched to explicit CORS-mode Request. Imgur dropped — no CORS support
    and no active frontend usage yet).
  - 27babfb fix: lowercase icon asset paths in useIconMaps (pre-existing; surfaced
    during this test when SW stopped masking it).
final_verification: |
  - caches.keys() → ["hsrpvp-assets-v2"] (v1 evicted by activate handler)
  - caches.open('hsrpvp-assets-v2').keys() → count: 87 with real ufs.sh URLs
  - Path/role icons render correctly
  - No CSP violations, no NetworkError rejections, SW intercept logs clean

### 4. Service Worker registration dev opt-in flag
expected: NEXT_PUBLIC_ENABLE_SW=true in .env.local + `npm run dev` — DevTools console shows `[SW] registered, scope=http://localhost:3000/`; removing the flag reverts to `[SW] skip register: NODE_ENV=development`
result: pass
notes: |
  Both parts verified.
  - Part A (flag absent/false): console printed `[SW] skip register: NODE_ENV=development`.
  - Part B (flag=true): console printed `[SW] registered, scope=http://localhost:3000/`; Fast Refresh still worked (1539ms).
  - User also added NEXT_PUBLIC_ENABLE_SW=false to .env.example as self-documenting dev opt-in.
  - Gate logic (providers.tsx:53) is strict equality to 'true', so =false behaves identically to absence.

### 5. Safari banner renders on Safari UA and dismissal persists
expected: DevTools → Network conditions → User agent Safari → reload http://localhost:3000/ → amber banner above NavBar; click Dismiss → persists in localStorage.hsrpvp_safari_warning_dismissed='1'; reload stays dismissed; clearing the key re-shows
result: pass
notes: "Verified in Microsoft Edge (Chromium) with DevTools → Network conditions → UA override → Safari. Banner rendered, dismissal persisted to localStorage, reload kept it dismissed, deleting the key re-showed it."

### 6. ViewportWriter vp cookie mechanics
expected: Fresh load writes `[ViewportWriter] wrote vp=desktop`; cookie in DevTools with Max-Age ~31,536,000 (1 year), SameSite=Lax, Secure absent on localhost HTTP; DevTools Rendering → Emulate coarse pointer flips cookie to vp=mobile
result: pass
notes: |
  All three parts verified in Edge:
  - Part A: `[ViewportWriter] wrote vp=desktop` log + vp=desktop cookie on fresh load
  - Part B: cookie attributes correct (Max-Age ~1yr, SameSite=Lax, Secure off on localhost HTTP, HttpOnly off)
  - Part C: Device Mode (iPhone 14 Pro preset, Ctrl+Shift+M) flipped vp=mobile on reload; exiting Device Mode reverted to vp=desktop.
    CSS media feature 'pointer' isn't in current Edge's Rendering panel dropdown — Device Mode is the working substitute since it sets pointer:coarse via touch emulation.

### 7. Zero hydration-mismatch warnings on first load
expected: Chrome DevTools Console + React DevTools Profiler on first navigation to / shows no `Warning: Text content does not match`, no `Warning: Expected server HTML to contain`
result: pass
notes: |
  No hydration warnings in dev or prod. Console interceptor installed and would have escalated any hydration warning to a red error — none fired.
observations:
  - "[Violation] 'message' handler took 216ms + 'load' handler took 195ms on /costs in dev. Identified as dev-only noise: Next HMR WebSocket + SpacetimeDB first-subscription BSATN codec JIT + 83 simultaneous <img> onLoad events with React devtools instrumentation overhead. Confirmed absent in prod build. Not Phase 16 scope."
  - "Firefox preload warning: .css preloaded but not used within a few seconds. Traced to cross-feature and component→page CSS module imports causing Next 15 to over-preload shared chunks. Logged as Phase 16.1 (CSS module hygiene refactor) in ROADMAP.md commit 8e9e7c2. Cosmetic warning, not a bug."

### 8. dev-unregister-sw page gate works
expected: `npm run dev` → visit /dev-unregister-sw → renders; click unregister → clears SW + caches → redirect to /. `npm run build && npm run start` (prod without NEXT_PUBLIC_ENABLE_SW) → /dev-unregister-sw returns Next 404
result: pass
notes: |
  All three parts verified.
  - Part A (dev): page renders regardless of flag (dev-mode is always accessible per the gate's AND logic); unregister button fires, SW + caches cleared, redirect works.
  - Part B (prod, flag off/absent): Next 404 page shown — gate triggers notFound() correctly.
  - Part C (prod, flag=true): page renders — flag bypass works, confirming the escape hatch is available for prod troubleshooting if ever needed.
fixes_during_test:
  - "ab4ed6c fix(16): dev-unregister-sw page UX — visible red button + flag-reminder paragraph. Button was indistinguishable from text on dark theme; added instruction telling devs to also flip NEXT_PUBLIC_ENABLE_SW=false before reloading."
  - "7eafbbf fix(16): 10s redirect countdown + Cancel redirect button. Previous 1.5s was too tight to flip the flag; countdown state driven by single useEffect (no setTimeout/setInterval race); cancel nulls countdown and appends 'reload manually once the flag is off' to status."

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

<!-- Test 1 CSP blocker resolved by commit c6c3391 (dev CSP unsafe-eval gate for HMR). -->
<!-- Test 3 prod CSP blocker resolved by commit c6ce7e1 (permanent unsafe-eval for SpacetimeDB SDK Function() codegen). Re-testing Test 3 full SW behavior. -->

## Resolved During Session

- truth: "Production build (npm run build && npm run start) loads and initializes without CSP violations"
  status: resolved
  reason: "User reported: 'Application error: a client-side exception has occurred'. Console: EvalError — call to Function() blocked by CSP. Response header script-src is 'self' 'unsafe-inline' (missing 'unsafe-eval'). SW registers ok; crash is in SpacetimeDB SDK chunk before subscriptions start."
  severity: blocker
  test: 3
  root_cause: "WR-04 (security review fix in bc95ce1) dropped 'unsafe-eval' from prod CSP assuming only Next dev bundles used eval(). Wrong assumption: SpacetimeDB SDK uses Function() in 7 call sites for runtime BSATN codec generation (spacetimedb/dist/index.browser.mjs L1184, 1192, 1231, 1236, 1322, 1379) and new Function() at L5023 for a dynamic-import polyfill. These are hot-path and cannot be avoided without forking the SDK."
  artifacts:
    - path: "next.config.ts"
      issue: "script-src conditional gate only included 'unsafe-eval' in dev"
  fixed_by: "commit c6ce7e1 — permanent 'unsafe-eval' in script-src; isDev constant removed; comment updated with SDK line references"
  debug_session: ""

## Resolved History

- truth: "Dev server loads and serves pages at localhost:3000"
  status: resolved
  reason: "User reported: application never starts, stays loading forever on localhost:3000 (Firefox private tab). Console: 'Uncaught EvalError: call to eval() blocked by CSP' — script-src is missing 'unsafe-eval'"
  severity: blocker
  test: 1
  root_cause: "next.config.ts:26 CSP script-src omits 'unsafe-eval'. Dropped by WR-04 on the assumption only prod builds were affected, but headers() has no env gate so dev mode also loses eval(). next dev uses eval() for Fast Refresh / HMR — without it, webpack hot chunks and React refresh fail, hanging the page at the IPC spinner."
  artifacts:
    - path: "next.config.ts"
      issue: "script-src directive missing 'unsafe-eval' for development"
  fixed_by: "commit c6c3391 — conditional CSP: 'unsafe-eval' added when process.env.NODE_ENV === 'development'"
  debug_session: ""
