---
phase: 16-route-global-foundation
plan: 03
type: execute
wave: 2
depends_on: [01]
files_modified:
  - middleware.ts
autonomous: true
requirements: [FOUND-13]

must_haves:
  truths:
    - "middleware.ts exists at repo root"
    - "Middleware reads the stdb_session cookie via request.cookies.get('stdb_session')"
    - "Middleware redirects cookie-less requests to '/' using NextResponse.redirect"
    - "Middleware matcher is a POSITIVE-LIST static array including /profile/:path*, /admin-view/:path*, /lobby/:path*, /draft/:path*"
    - "Middleware matcher does NOT include /sw.js, /_next/*, /api/*, /, /costs, /teambuilder (excluded by positive-list construction)"
    - "Middleware logs every decision with [middleware] bracketed tag (D-33)"
    - "CVE-2025-29927 is mitigated by the Next 15.5.x bump (Plan 01) — no additional in-middleware mitigation required"
    - "Middleware is UX-only — not a trust boundary (real authz is SpacetimeDB RLS)"
  artifacts:
    - path: "middleware.ts"
      provides: "Root-level positive-list middleware that redirects cookie-less visits to authed routes"
      contains: "stdb_session"
      min_lines: 20
  key_links:
    - from: "middleware.ts"
      to: "lib/session-cookie.ts"
      via: "string-literal cookie name (not import — Edge Runtime zero-dep safety)"
      pattern: "stdb_session"
    - from: "middleware.ts config.matcher"
      to: "app/(authed)/* routes"
      via: "4 static /path/:path* entries, each covering one authed subtree"
      pattern: "/profile/:path\\*|/admin-view/:path\\*|/lobby/:path\\*|/draft/:path\\*"
---

<objective>
Ship the first middleware in the repo: a root-level `middleware.ts` that redirects anonymous (cookie-less) users away from authed paths to the landing page. This is UX redirection, not auth enforcement — real access control lives in SpacetimeDB reducer-level RLS.

The positive-list matcher (D-15) explicitly lists `/profile/:path*`, `/admin-view/:path*`, `/lobby/:path*`, `/draft/:path*`. Everything else — `/`, `/costs`, `/teambuilder`, `/sw.js`, `/_next/*`, `/api/*` — is excluded by NOT being in the positive list, not by negative-regex exclusion. This is more robust than negative-list regex per RESEARCH Pitfall 4.

CVE-2025-29927 (middleware bypass via `x-middleware-subrequest`) is transparently patched by the Next 15.5.x bump in Plan 01 — no middleware-level code is required; the Next.js internals verify the header cryptographically.

Purpose: Deliver FOUND-13 (middleware positive-list matcher; cookie-less redirect; excludes /sw.js, /_next/*, /api/*).
Output:
- `middleware.ts` at repo root, ~25 LOC
- Zero new npm dependencies
- `[middleware]` D-33 logging per decision
- Manual-UAT verification that `/profile` redirects without cookie; `/costs` does NOT redirect; `/sw.js` is reachable
</objective>

<execution_context>
@D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/get-shit-done/workflows/execute-plan.md
@D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/16-route-global-foundation/16-CONTEXT.md
@.planning/phases/16-route-global-foundation/16-RESEARCH.md
@.planning/phases/16-route-global-foundation/16-PATTERNS.md
@.planning/phases/16-route-global-foundation/16-VALIDATION.md
@lib/session-cookie.ts

<interfaces>
<!-- Key contract for the middleware — extracted verbatim from RESEARCH and PATTERNS. -->

Cookie name (source of truth: lib/session-cookie.ts:10):
  const COOKIE_NAME = 'stdb_session';
Middleware STRING-LITERALS the cookie name rather than importing from lib/ — Edge Runtime compat + zero-dep safety.

The canonical middleware body (RESEARCH §Code Examples lines 740-765, PATTERNS §middleware.ts lines 367-395):

```typescript
// middleware.ts (repo root)
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('stdb_session');
  const path = request.nextUrl.pathname;

  if (!cookie) {
    console.log(`[middleware] redirect: ${path} (no stdb_session cookie)`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log(`[middleware] pass: ${path} (cookie present)`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/profile/:path*',
    '/admin-view/:path*',
    '/lobby/:path*',
    '/draft/:path*',
  ],
};
```

D-15 positive-list matcher (VERBATIM — executor must ship these 4 strings, in this exact form):
  '/profile/:path*'     — covers /profile and any /profile/foo, /profile/[userId] Phase 24+
  '/admin-view/:path*'  — covers /admin-view and Phase 22 admin sub-pages
  '/lobby/:path*'       — covers /lobby and Phase 28 /lobby/[id]
  '/draft/:path*'       — covers /draft (moved to (authed)/(match)/draft in Plan 01) and Phase 30/31 /draft/[matchId]

Why NOT negative-regex (RESEARCH Pitfall 4):
  A negative like `/((?!api|_next/static|sw.js|…).*)` is fragile — forgetting one exclusion broadens the matcher to run middleware on assets, killing perf. Positive-list is explicit: middleware only runs on enumerated paths.

Why NOT `has`/`missing` cookie conditions in the matcher:
  Tempting idea: `{ source: '/profile/:path*', missing: [{ type: 'cookie', key: 'stdb_session' }] }` — middleware auto-skips matched-but-cookie-present requests. Downside: cookie PRESENCE doesn't mean authenticated (cookie is client-written and non-secret). Reading in the body lets us ALSO trace via console.log per D-33.

Next.js Matcher rules (RESEARCH Anti-Patterns):
  "The matcher values need to be constants so they can be statically analyzed at build-time." — no dynamic strings, no `.map(p => ...)`.

Authz trust boundary clarification (critical framing — do NOT add session-validation logic):
  - Middleware is UX optimization only per REQUIREMENTS.md Out of Scope table: "Middleware as auth trust boundary: Middleware is UX optimization only; real auth is SpacetimeDB RLS at reducer level".
  - Inside the middleware body, ONLY check cookie presence. Do NOT attempt to validate the cookie value against a backend, decode session tokens, or make any trust decision based on cookie contents.
  - The `stdb_session` cookie is client-written display-name storage (see lib/session-cookie.ts docstring). Its presence is a weak signal that "a user probably just logged in recently"; not a crypto proof.

What the middleware MUST NOT do (anti-scope guardrails):
  - No SpacetimeDB calls (middleware runs on Edge Runtime; SDK is not Edge-compatible).
  - No async/await beyond what NextResponse demands (redirect is sync).
  - No JWT/token parsing.
  - No rate-limiting.
  - No logging to a server endpoint.
  - No reading of request body.

CVE-2025-29927 mitigation context (RESEARCH Pattern 8):
  - The patch is inside Next.js 15.2.3+. Our 15.5.x bump (Plan 01) carries it.
  - No code change on our side — the Next internals verify `x-middleware-subrequest` cryptographically.
  - Do NOT add `x-middleware-subrequest` handling to middleware.ts; that belongs to Next internals.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write middleware.ts with positive-list matcher and cookie-gated redirect</name>
  <files>middleware.ts</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/lib/session-cookie.ts (source of truth for the cookie name `stdb_session`; confirm the name hasn't drifted)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 8 Middleware; §Code Examples "middleware.ts — positive-list matcher + cookie redirect" lines 740-765; §Pitfall 4; §Anti-Patterns for middleware)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§middleware.ts — lines 366-404)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-15, D-16, D-30, D-33)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/REQUIREMENTS.md (Out of Scope table — "Middleware as auth trust boundary: Middleware is UX optimization only")
  </read_first>
  <action>
1. Create `middleware.ts` at the repo root (NOT `app/middleware.ts`, NOT `src/middleware.ts` — the Next.js convention is root-level for ≤15.x; 16.x renames to proxy.ts but we stay on 15.5.x per Plan 01).
2. File body (verbatim from RESEARCH §Code Examples, with comments added to reflect our trust-boundary framing):
   ```typescript
   // middleware.ts — Phase 16 Plan 03 (FOUND-13)
   // UX-only redirect. NOT an auth trust boundary. Real authz lives in SpacetimeDB RLS.
   // CVE-2025-29927 mitigated transparently by the Next 15.5.x bump in Plan 01
   //   (x-middleware-subrequest header verified cryptographically by Next internals).
   // See docs/auth/architecture.md for subscription-lifecycle + trust-boundary discussion.

   import { NextResponse, type NextRequest } from 'next/server';

   export function middleware(request: NextRequest) {
     const cookie = request.cookies.get('stdb_session'); // string-literal per interfaces note (zero-dep safety)
     const path = request.nextUrl.pathname;

     if (!cookie) {
       console.log(`[middleware] redirect: ${path} (no stdb_session cookie)`);
       return NextResponse.redirect(new URL('/', request.url));
     }

     console.log(`[middleware] pass: ${path} (cookie present)`);
     return NextResponse.next();
   }

   export const config = {
     // D-15 positive-list matcher. :path* covers the base path AND any sub-paths.
     // Future authed sub-pages (Phase 22 admin, Phase 24 /profile/[userId], Phase 28 /lobby/[id],
     // Phase 30/31 /draft/[matchId]) fit the wildcard without re-editing this file.
     matcher: [
       '/profile/:path*',
       '/admin-view/:path*',
       '/lobby/:path*',
       '/draft/:path*',
     ],
   };
   ```
3. Do NOT import from `lib/session-cookie.ts` — the middleware runs on Edge Runtime where keeping zero dependencies is safest. String-literal the cookie name. If the name ever changes in `lib/session-cookie.ts`, both files must be updated in lockstep; flag this in the SUMMARY.
4. Do NOT add any of these (anti-scope per interfaces):
   - Any SpacetimeDB SDK calls
   - JWT parsing / token validation
   - Rate limiting / deny-list logic
   - async/await beyond what `NextResponse.redirect` needs (it's sync)
   - Negative-regex matchers
   - Dynamic matcher strings (must be static constants — Next.js requirement)
5. Run `npm run build` — must exit 0. Next.js must recognize the middleware file and compile it for Edge Runtime. Check build output for middleware size report (typically shows `ƒ Middleware <size>` in build output).
6. Run `npm run test:typecheck` — must exit 0.
7. Manual UAT (log results in SUMMARY):
   - `npm run dev` on port 3001.
   - Open DevTools → Application → Cookies → clear `stdb_session` cookie for localhost.
   - Visit `http://localhost:3001/profile` → expect 307 redirect to `http://localhost:3001/`; DevTools console shows `[middleware] redirect: /profile (no stdb_session cookie)`.
   - Visit `http://localhost:3001/costs` → expect NO redirect; middleware does not run (path not in positive list). Console should NOT show `[middleware] pass` for this path.
   - Visit `http://localhost:3001/sw.js` → expect the file (404 acceptable in Wave B since Plan 04 hasn't shipped sw.js yet; the key test is NO middleware redirect; console should not show `[middleware]` logs for /sw.js).
   - Login via the Guest flow → `stdb_session` cookie appears → revisit `/profile` → expect pass-through; console shows `[middleware] pass: /profile (cookie present)`.
   - `/admin-view`, `/lobby`, `/draft` all exhibit same redirect-without-cookie behavior.
8. Commit: `feat(16-03): add positive-list middleware with stdb_session cookie redirect (FOUND-13)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - File `middleware.ts` exists at repo root: `[ -f middleware.ts ] && echo OK` prints `OK`.
    - `grep -n "request.cookies.get('stdb_session')" middleware.ts` returns one match.
    - `grep -n "NextResponse.redirect" middleware.ts` returns one match.
    - `grep -n "NextResponse.next" middleware.ts` returns one match.
    - `grep -c "\\[middleware\\]" middleware.ts` returns at least 2 (one per decision log: redirect + pass).
    - `grep -nE "^\\s*'/profile/:path\\*'," middleware.ts` returns exactly one match.
    - `grep -nE "^\\s*'/admin-view/:path\\*'," middleware.ts` returns exactly one match.
    - `grep -nE "^\\s*'/lobby/:path\\*'," middleware.ts` returns exactly one match.
    - `grep -nE "^\\s*'/draft/:path\\*'," middleware.ts` returns exactly one match.
    - `grep -nE "'/api" middleware.ts` returns zero matches (api NOT in matcher).
    - `grep -nE "'/_next" middleware.ts` returns zero matches (_next NOT in matcher).
    - `grep -nE "'/sw\\.js" middleware.ts` returns zero matches (sw.js NOT in matcher).
    - `grep -n "spacetimedb" middleware.ts` returns zero matches (no SDK in Edge-runtime code).
    - `grep -n "await" middleware.ts` returns zero matches (middleware body is synchronous).
    - `npm run build` exit 0; build output includes a middleware size report line.
    - `npm run test:typecheck` exit 0.
    - Manual UAT log in SUMMARY shows /profile redirects without cookie, /costs does not, /profile passes with cookie.
  </acceptance_criteria>
  <done>
    `middleware.ts` lands at repo root with positive-list matcher exactly matching D-15 (4 entries), stdb_session cookie read, NextResponse redirect/next branching, D-33 bracketed-tag logging, no SDK imports, no JWT parsing, no async. Build+typecheck green. Manual UAT confirms redirect behavior on cookie-less authed paths and pass-through on public paths. Atomic commit made.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser → Edge Runtime (middleware) | Incoming HTTP request enters Next.js Edge Middleware. Middleware reads cookies (untrusted client-settable) and makes a redirect decision. |
| Middleware → origin server (page SSR) | If cookie present, `NextResponse.next()` lets the request proceed to page SSR. Real authz (SpacetimeDB RLS) happens downstream at the reducer/view layer. |
| Middleware → filesystem (Next.js build-time) | Matcher config is statically analyzed by Next.js at build time per the Anti-Patterns note. Dynamic matcher strings would fail the build. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16-03-01 | E (Elevation of Privilege) | CVE-2025-29927 `x-middleware-subrequest` header bypass | mitigate | Next 15.5.x (from Plan 01) includes the cryptographic header verification. No additional in-middleware code needed. Citation: https://projectdiscovery.io/blog/nextjs-middleware-authorization-bypass. |
| T-16-03-02 | S (Spoofing) | User sets `stdb_session` cookie manually to bypass redirect | accept | Middleware is UX-only — setting the cookie only avoids the landing-page redirect; it does NOT grant SpacetimeDB access. Real authz at reducer level is unaffected. REQUIREMENTS.md Out of Scope is explicit on this framing. |
| T-16-03-03 | T (Tampering) | Cookie value tampering | accept | Middleware only checks cookie PRESENCE (`!cookie`), not contents. Tampered cookie values produce the same pass-through decision as legit ones. Real authz reads the tampered cookie's display name only and has no trust dependency on it. |
| T-16-03-04 | D (Denial of Service) | Middleware runs on non-enumerated paths, degrading perf | mitigate | Positive-list matcher is statically compiled; middleware only runs on the 4 listed path families. `/costs`, `/teambuilder`, `/`, `/_next/*`, `/api/*`, `/sw.js` are never invoked. RESEARCH Pitfall 4 is the defense against accidentally broadening via negative regex. |
| T-16-03-05 | I (Information Disclosure) | Console.log leaks path info | accept | D-33 requires bracketed logs for observability. Logs land in browser console (client-side DevTools) OR server logs (in prod Vercel logs). Path is not sensitive — same info is in the request URL. Acceptable. |
| T-16-03-06 | T | SW registration fetch redirected by middleware | mitigate | `/sw.js` is not in the positive-list matcher, so middleware never runs for that path — SW registration proceeds even for anonymous users. RESEARCH Pitfall 4 "warning signs: SW not installed" is pre-empted by the matcher construction. |
</threat_model>

<verification>
After Task 1 lands:
1. `ls middleware.ts` — file exists at repo root.
2. `npm run build && npm run test:typecheck` — both exit 0; build output mentions middleware.
3. All positive-list matcher entries present; all negative-list paths absent (grep sweeps in acceptance_criteria).
4. Manual UAT walkthrough per Task 1 step 7 — log in SUMMARY.
5. 15.5 harness test unchanged: `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` green (middleware is frontend-only; shouldn't affect backend tests, but confirms no broader regression).
</verification>

<success_criteria>
- `middleware.ts` at repo root implements the RESEARCH/PATTERNS canonical body verbatim.
- Matcher is a static array of exactly 4 entries: `/profile/:path*`, `/admin-view/:path*`, `/lobby/:path*`, `/draft/:path*`.
- Cookie check reads `stdb_session` (string literal, matching `lib/session-cookie.ts` source of truth).
- Redirect target is `/` (landing page).
- D-33 `[middleware]` bracketed logging on every decision.
- Zero SDK imports, zero JWT parsing, zero rate limiting, zero async beyond NextResponse.
- Manual UAT confirms: cookie-less /profile → redirect; /costs → pass-through (not matched); /sw.js → not matched; cookie-present /profile → pass-through.
- Build + typecheck green.
- CVE-2025-29927 coverage: verified via Plan 01's Next 15.5.x bump, no middleware-level action needed.
</success_criteria>

<output>
After completion, create `.planning/phases/16-route-global-foundation/16-03-SUMMARY.md` documenting:
- The resolved middleware file size from `next build` output (informational).
- Manual UAT results for all 5 test paths: /profile, /costs, /sw.js, /admin-view, /lobby, /draft — with cookie and without.
- Explicit restatement of the UX-only framing (no trust-boundary logic was added).
- Pointer to `docs/auth/architecture.md` where the subscription-lifecycle + trust-boundary narrative is updated by Plan 06.
</output>
