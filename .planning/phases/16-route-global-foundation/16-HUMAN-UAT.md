---
status: testing
phase: 16-route-global-foundation
source: [16-VERIFICATION.md]
started: 2026-04-18T00:00:00Z
updated: 2026-04-19T00:00:00Z
---

## Current Test

number: 1
name: Cookie-less visit to an authed path redirects to landing
expected: |
  Visiting http://localhost:3000/profile with stdb_session cookie cleared returns 307 redirect to /; console shows `[middleware] redirect: /profile (no stdb_session cookie)`; /costs does NOT redirect (not in positive-list matcher); /sw.js not redirected either
awaiting: user response

## Tests

### 1. Cookie-less visit to an authed path redirects to landing
expected: Visiting http://localhost:3000/profile with stdb_session cookie cleared returns 307 redirect to /; console shows `[middleware] redirect: /profile (no stdb_session cookie)`; /costs does NOT redirect (not in positive-list matcher); /sw.js not redirected either
result: issue
reported: "application never starts, stays loading forever on localhost:3000 in Firefox private tab. Console: 'Uncaught EvalError: call to eval() blocked by CSP' — script-src 'self' 'unsafe-inline' missing 'unsafe-eval'. Firefox also shows GET /favicon.ico 404."
severity: blocker
root_cause: "next.config.ts CSP header (WR-04 change) dropped 'unsafe-eval' unconditionally, but `next dev` requires eval() for React Fast Refresh / HMR. CSP header applies to dev + prod alike because headers() has no env check. Fix: gate 'unsafe-eval' on NODE_ENV === 'development'."

### 2. Cookie-present visit to authed path passes through
expected: After Guest login the stdb_session cookie is set; revisiting /profile shows the page; console shows `[middleware] pass: /profile (cookie present)`
result: [pending]

### 3. Service Worker registers on production build and intercepts only allowlisted CDN assets
expected: `npm run build && npm run start` — DevTools Application → Service Workers shows active SW; Cache Storage grows with ufs.sh / i.imgur.com URLs on asset loads; no intercepts of app origin (/api, _next, /sw.js navigations clean)
result: [pending]

### 4. Service Worker registration dev opt-in flag
expected: NEXT_PUBLIC_ENABLE_SW=true in .env.local + `npm run dev` — DevTools console shows `[SW] registered, scope=http://localhost:3000/`; removing the flag reverts to `[SW] skip register: NODE_ENV=development`
result: [pending]

### 5. Safari banner renders on Safari UA and dismissal persists
expected: DevTools → Network conditions → User agent Safari → reload http://localhost:3000/ → amber banner above NavBar; click Dismiss → persists in localStorage.hsrpvp_safari_warning_dismissed='1'; reload stays dismissed; clearing the key re-shows
result: [pending]

### 6. ViewportWriter vp cookie mechanics
expected: Fresh load writes `[ViewportWriter] wrote vp=desktop`; cookie in DevTools with Max-Age ~31,536,000 (1 year), SameSite=Lax, Secure absent on localhost HTTP; DevTools Rendering → Emulate coarse pointer flips cookie to vp=mobile
result: [pending]

### 7. Zero hydration-mismatch warnings on first load
expected: Chrome DevTools Console + React DevTools Profiler on first navigation to / shows no `Warning: Text content does not match`, no `Warning: Expected server HTML to contain`
result: [pending]

### 8. dev-unregister-sw page gate works
expected: `npm run dev` → visit /dev-unregister-sw → renders; click unregister → clears SW + caches → redirect to /. `npm run build && npm run start` (prod without NEXT_PUBLIC_ENABLE_SW) → /dev-unregister-sw returns Next 404
result: [pending]

## Summary

total: 8
passed: 0
issues: 1
pending: 7
skipped: 0
blocked: 0

## Gaps

- truth: "Dev server loads and serves pages at localhost:3000"
  status: failed
  reason: "User reported: application never starts, stays loading forever on localhost:3000 (Firefox private tab). Console: 'Uncaught EvalError: call to eval() blocked by CSP' — script-src is missing 'unsafe-eval'"
  severity: blocker
  test: 1
  root_cause: "next.config.ts:26 CSP script-src omits 'unsafe-eval'. Dropped by WR-04 on the assumption only prod builds were affected, but headers() has no env gate so dev mode also loses eval(). next dev uses eval() for Fast Refresh / HMR — without it, webpack hot chunks and React refresh fail, hanging the page at the IPC spinner."
  artifacts:
    - path: "next.config.ts"
      issue: "script-src directive missing 'unsafe-eval' for development"
  missing:
    - "Conditional CSP: add 'unsafe-eval' when process.env.NODE_ENV === 'development' (or when phase flag NEXT_PUBLIC_DEV_CSP is set)"
  debug_session: ""
