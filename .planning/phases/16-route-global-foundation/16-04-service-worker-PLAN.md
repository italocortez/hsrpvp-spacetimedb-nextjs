---
phase: 16-route-global-foundation
plan: 04
type: execute
wave: 2
depends_on: [01]
files_modified:
  - public/sw.js
  - app/providers.tsx
  - app/dev-unregister-sw/page.tsx
autonomous: true
requirements: [FOUND-07]

must_haves:
  truths:
    - "public/sw.js exists with install/activate/fetch handlers per RESEARCH Pattern 5"
    - "SW first check inside fetch handler is url.origin === self.location.origin (D-18 — app origin never intercepted)"
    - "SW intercepts ONLY hostnames in ALLOWED_HOSTS = ['ufs.sh', 'i.imgur.com'] (D-17)"
    - "SW never intercepts Discord CDN (explicitly excluded per D-17)"
    - "app/providers.tsx registers the SW inside a useEffect gated on NODE_ENV === 'production' || NEXT_PUBLIC_ENABLE_SW === 'true' (D-19)"
    - "app/dev-unregister-sw/page.tsx exists with prod-gate calling notFound() when NODE_ENV === 'production' && NEXT_PUBLIC_ENABLE_SW !== 'true' (D-20)"
    - "Dev-unregister page is trivially removable later — ~1KB unreachable in prod"
    - "SW file served at /sw.js with default root scope (no Service-Worker-Allowed header gymnastics)"
    - "All console logs use the [SW] bracketed tag (D-33)"
  artifacts:
    - path: "public/sw.js"
      provides: "Asset-CDN cache-first Service Worker, ~40 LOC, zero npm deps"
      contains: "ALLOWED_HOSTS"
      min_lines: 30
    - path: "app/providers.tsx"
      provides: "Existing provider composition + new useEffect for SW registration"
      contains: "serviceWorker.register"
    - path: "app/dev-unregister-sw/page.tsx"
      provides: "Dev-only page that unregisters all SW registrations + clears all caches; prod-gated via notFound()"
      contains: "getRegistrations"
      min_lines: 20
  key_links:
    - from: "public/sw.js fetch handler"
      to: "Cache Storage API (caches.open(ASSET_CACHE))"
      via: "cache-first strategy: cache.match OR fetch+cache"
      pattern: "caches\\.open|cache\\.match|cache\\.put"
    - from: "app/providers.tsx useEffect"
      to: "public/sw.js"
      via: "navigator.serviceWorker.register('/sw.js')"
      pattern: "serviceWorker\\.register\\('/sw\\.js'\\)"
    - from: "app/dev-unregister-sw/page.tsx"
      to: "Service Worker API + Cache Storage API"
      via: "getRegistrations() + caches.keys() + caches.delete()"
      pattern: "getRegistrations|caches\\.keys"
---

<objective>
Ship the first Service Worker in the repo — a hand-written ~40-LOC cache-first SW that intercepts ONLY UploadThing (`ufs.sh`) and Imgur (`i.imgur.com`) asset-CDN requests. Register it from `app/providers.tsx` gated on `NODE_ENV === 'production' || NEXT_PUBLIC_ENABLE_SW === 'true'`. Ship an accompanying dev-unregister page that nukes all SW registrations + caches when manual recovery is needed.

Purpose: Deliver FOUND-07 (Service Worker caches UploadThing asset CDN; gated to production or opt-in dev).
Output:
- `public/sw.js` — 40 LOC, zero deps, asset-CDN allowlist only, app origin never intercepted
- `app/providers.tsx` — adds SW registration useEffect inside existing Providers composition
- `app/dev-unregister-sw/page.tsx` — dev utility page with prod 404 gate
- Imgur hostname lands in the allowlist from Phase 16 even though Imgur uploads don't wire until Phase 32 (D-17 — 2-entry constant array, zero logic cost)
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
@app/providers.tsx

<interfaces>
<!-- The canonical SW body (RESEARCH Pattern 5, PATTERNS §public/sw.js). Ship verbatim. -->

public/sw.js (40 LOC target, zero deps):
```javascript
// public/sw.js — Phase 16 Plan 04 (FOUND-07)
// Asset-CDN cache-first SW. ONLY intercepts the hostnames in ALLOWED_HOSTS.
// NEVER intercepts app-origin requests — that would break RSC streams, API routes, and WS upgrades.
// See 16-RESEARCH.md §Pattern 5 for full rationale; D-17, D-18, D-19 for policy.

const VERSION = 1; // bump to invalidate all caches
const ASSET_CACHE = `hsrpvp-assets-v${VERSION}`;
const ALLOWED_HOSTS = ['ufs.sh', 'i.imgur.com']; // D-17: UploadThing + Imgur only; Discord explicitly excluded

self.addEventListener('install', (event) => {
  console.log('[SW] install v' + VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] activate v' + VERSION);
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== ASSET_CACHE).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // D-18: Never intercept app origin — ORDER MATTERS, this is the FIRST check.
  if (url.origin === self.location.origin) return;

  // D-17: Only intercept allowlisted asset CDNs.
  const hostAllowed = ALLOWED_HOSTS.some(
    (h) => url.hostname === h || url.hostname.endsWith('.' + h)
  );
  if (!hostAllowed) return;

  console.log('[SW] intercept', url.hostname, url.pathname);
  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok && event.request.method === 'GET') {
        cache.put(event.request, response.clone());
      }
      return response;
    })
  );
});
```

File placement: `/public/sw.js` → served at `/sw.js` → root scope by default (RESEARCH Pattern 5 + Anti-Patterns: do NOT add Service-Worker-Allowed header tricks).

Hostname matching semantics (line `(h) => url.hostname === h || url.hostname.endsWith('.' + h)`):
- `'ufs.sh'` matches exact `ufs.sh` AND any subdomain like `abc.ufs.sh` (UploadThing uses regional subdomains).
- `'i.imgur.com'` matches exact `i.imgur.com` AND any hypothetical sub (shouldn't happen; Imgur direct image URLs are fixed on i.imgur.com).

SW registration in app/providers.tsx (RESEARCH §Code Examples "Service Worker registration inside Providers"):

```tsx
useEffect(() => {
  const shouldRegister =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

  if (!shouldRegister) {
    console.log('[SW] skip register: NODE_ENV=' + process.env.NODE_ENV);
    return;
  }
  if (!('serviceWorker' in navigator)) {
    console.log('[SW] skip register: serviceWorker API unavailable');
    return;
  }

  navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => console.log('[SW] registered, scope=' + reg.scope))
    .catch((err) => console.error('[SW] register failed:', err));
}, []);
```

CRITICAL Pitfall 7 — hard-code empty dep array: `useEffect(() => { ... }, [])` runs once per mount. Adding deps (refs, fns) risks multi-register per session.

app/dev-unregister-sw/page.tsx (D-20):
```tsx
'use client';
import { notFound } from 'next/navigation';
import { useState } from 'react';

export default function DevUnregisterSW() {
  // Prod-gate: in prod WITHOUT the opt-in flag, page returns 404.
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_SW !== 'true') {
    notFound();
  }

  const [status, setStatus] = useState<string>('idle');

  const unregister = async () => {
    setStatus('unregistering...');
    const regs = await navigator.serviceWorker.getRegistrations();
    for (const reg of regs) await reg.unregister();
    const cacheNames = await caches.keys();
    for (const n of cacheNames) await caches.delete(n);
    setStatus(`done — ${regs.length} SW unregistered, ${cacheNames.length} caches cleared`);
    // redirect to home after a beat so the user sees the status
    setTimeout(() => window.location.replace('/'), 1500);
  };

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif' }}>
      <h1>Dev: Unregister Service Worker</h1>
      <p>{status}</p>
      <button onClick={unregister} style={{ padding: '12px 24px' }}>
        Unregister all SW + clear all caches
      </button>
    </div>
  );
}
```
No HeroUI / Tailwind per D-25.

Pitfall 3 context (SW fetch handler catching app-origin requests):
- Without `url.origin === self.location.origin` short-circuit, the SW intercepts RSC streams, API calls, SpacetimeDB WebSocket upgrades → breaks the app.
- The origin check MUST be the FIRST line of the fetch handler body.

Opaque cross-origin responses caveat:
- UploadThing `ufs.sh` serves CORS headers for anon reads (verified by existing behavior — portraits load today).
- Imgur `i.imgur.com` also serves CORS-friendly responses.
- If a future CDN is opaque, cached responses have `type: 'opaque'` — still cacheable and serveable, but body/status are not readable. The SW in this form still works for opaque responses.

Windows dev note:
- SW-on-localhost works in all modern browsers (SW is explicitly allowed on `localhost` regardless of HTTPS).
- SW file must be served from same origin — `public/sw.js` → `/sw.js` satisfies this.
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Ship public/sw.js with asset-CDN allowlist + origin guard + cache-first handler</name>
  <files>public/sw.js</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 5 Service Worker scaffold — lines 456-519; §Pitfall 3 SW fetch handler catching app-origin requests)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§public/sw.js — lines 407-458)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-17, D-18, D-19)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/REQUIREMENTS.md (Out of Scope: "next-pwa / @serwist/next: Hand-written 40-LOC SW fits our asset-CDN-only caching need")
  </read_first>
  <action>
1. Create `public/sw.js` with the body in `<interfaces>` above, verbatim. File starts with a docstring-style comment block identifying the phase + decision references.
2. Critical ordering: inside the fetch handler body, the FIRST non-URL-parsing statement MUST be the `if (url.origin === self.location.origin) return;` check. Do NOT reorder with the allowlist check. Pitfall 3 is defended by this ordering.
3. Allowed hosts array (D-17): exactly `['ufs.sh', 'i.imgur.com']`. No Discord CDN. Do NOT add any hostname beyond these two — Phase 32 will decide whether Imgur gets additional CDN hostnames; Phase 16 scope is exactly these two.
4. Cache strategy: cache-first (try `cache.match` first; on miss, network fetch + `cache.put` the clone for future hits). Only cache GET requests with status 200 (`response.ok && event.request.method === 'GET'`). Do NOT cache POST / PUT / DELETE — they have no caching semantics.
5. VERSION const — hardcode `1`. This is the invalidation lever: future phases can bump VERSION to force a full cache rebuild.
6. D-33 `[SW]` bracketed-tag logging: install, activate, intercept (with hostname + pathname).
7. No service-worker-allowed header magic (per RESEARCH Anti-Patterns).
8. Commit: `feat(16-04): add asset-CDN cache-first Service Worker (D-17, D-18)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - File `public/sw.js` exists: `[ -f public/sw.js ] && echo OK` prints `OK`.
    - `grep -n "ALLOWED_HOSTS" public/sw.js` returns at least one match.
    - `grep -E "ALLOWED_HOSTS\\s*=\\s*\\['ufs\\.sh',\\s*'i\\.imgur\\.com'\\]" public/sw.js` returns one match (exact array literal per D-17).
    - `grep -n "url.origin === self.location.origin" public/sw.js` returns one match (D-18 guard).
    - `grep -n "skipWaiting" public/sw.js` returns one match (install handler).
    - `grep -n "clients.claim" public/sw.js` returns one match (activate handler).
    - `grep -n "caches.open" public/sw.js` returns at least one match (fetch handler cache).
    - `grep -n "discord" public/sw.js` returns zero matches (D-17 explicit exclusion).
    - `grep -c "\\[SW\\]" public/sw.js` returns at least 3 (install, activate, intercept).
    - `grep -En "VERSION\\s*=\\s*1" public/sw.js` returns one match.
    - Line count inside `public/sw.js`: 20-60 lines (RESEARCH says "~40 LOC"; any deviation should be justified in SUMMARY).
    - `npm run build` exit 0 (build copies public/sw.js to the build output).
  </acceptance_criteria>
  <done>
    `public/sw.js` lands with origin-guard-first fetch handler, 2-host allowlist, cache-first strategy, VERSION invalidation lever, and D-33 logging. Zero npm deps. No Discord. Atomic commit made.
  </done>
</task>

<task type="auto">
  <name>Task 2: Register SW inside app/providers.tsx via gated useEffect (D-19)</name>
  <files>app/providers.tsx</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/app/providers.tsx (the file being modified — current body is a SessionProvider → HeroUIProvider → SpacetimeDBProvider → AuthProvider → GameDataProvider composition; NO useEffect currently present)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Code Examples "Service Worker registration inside Providers"; §Pitfall 7)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§app/providers.tsx — lines 54-93)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-19, D-33)
  </read_first>
  <action>
1. Open `app/providers.tsx`. Preserve the existing composition (`SessionProvider > HeroUIProvider > SpacetimeDBProvider > AuthProvider > GameDataProvider > {children}`) and the existing `connectionBuilder` memo unchanged.
2. Add `useEffect` to the React imports at the top of the file (currently imports `{ useMemo }`).
3. Inside the `Providers` function component body, BEFORE the `return`, add the SW registration `useEffect` with HARDCODED empty dep array `[]` (Pitfall 7 — dep-drift causes multi-register):
   ```tsx
   useEffect(() => {
     const shouldRegister =
       process.env.NODE_ENV === 'production' ||
       process.env.NEXT_PUBLIC_ENABLE_SW === 'true';

     if (!shouldRegister) {
       console.log('[SW] skip register: NODE_ENV=' + process.env.NODE_ENV);
       return;
     }
     if (!('serviceWorker' in navigator)) {
       console.log('[SW] skip register: serviceWorker API unavailable');
       return;
     }

     navigator.serviceWorker
       .register('/sw.js')
       .then((reg) => console.log('[SW] registered, scope=' + reg.scope))
       .catch((err) => console.error('[SW] register failed:', err));
   }, []);
   ```
4. The `'use client'` directive at the top of the file (already present) remains — `useEffect` requires client boundary.
5. Do NOT modify anything else in `app/providers.tsx`. The provider tree composition is owned by other plans (GameDataProvider gained 2 subs in Plan 02; middleware is Plan 03; nothing else touches this file in Phase 16).
6. Manual UAT (log in SUMMARY):
   - `npm run dev` (NODE_ENV=development, NEXT_PUBLIC_ENABLE_SW unset): load any page, open DevTools Console → expect `[SW] skip register: NODE_ENV=development`. Application → Service Workers panel shows none.
   - Add `NEXT_PUBLIC_ENABLE_SW=true` to `.env.local` (one line; do NOT commit this change — `.env.local` is gitignored per CLAUDE.md), restart dev server, reload page → expect `[SW] registered, scope=http://localhost:3001/`. Application → Service Workers shows the SW as activated.
   - Navigate around the app; confirm no WebSocket reconnects, no API 500s, no NavBar flicker (Pitfall 3 symptoms absent).
   - Remove `NEXT_PUBLIC_ENABLE_SW` from `.env.local` (restore the file to its pre-plan state — the gitignore protects us from accidental commit, but tidying is polite). Test that dev mode returns to skip-register.
7. Commit: `feat(16-04): register Service Worker inside Providers (D-19)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `grep -n "useEffect" app/providers.tsx` returns at least one match.
    - `grep -n "serviceWorker.register('/sw.js')" app/providers.tsx` returns one match.
    - `grep -n "NEXT_PUBLIC_ENABLE_SW" app/providers.tsx` returns one match (the gate check).
    - `grep -n "NODE_ENV === 'production'" app/providers.tsx` returns one match.
    - `grep -En "\\}, \\[\\]\\)" app/providers.tsx` returns at least one match (empty dep array — Pitfall 7 compliance).
    - `grep -c "\\[SW\\]" app/providers.tsx` returns at least 3 (skip, register success, register failure paths).
    - Provider tree composition unchanged: `grep -n "SessionProvider" app/providers.tsx` AND `grep -n "HeroUIProvider" app/providers.tsx` AND `grep -n "SpacetimeDBProvider" app/providers.tsx` AND `grep -n "AuthProvider" app/providers.tsx` AND `grep -n "GameDataProvider" app/providers.tsx` all return at least one match each.
    - `npm run build` exit 0; `npm run test:typecheck` exit 0.
    - Manual UAT logged in SUMMARY: dev-skip + opt-in-register + dev-skip-restored all verified.
    - `.env.local` not staged in the commit (confirm `git status` shows no .env.local changes).
  </acceptance_criteria>
  <done>
    `app/providers.tsx` has a single empty-dep useEffect that registers `/sw.js` gated on `NODE_ENV === 'production' || NEXT_PUBLIC_ENABLE_SW === 'true'`. Provider composition unchanged. Manual UAT confirms dev-skip and opt-in-register. `.env.local` untouched in commit. Atomic commit made.
  </done>
</task>

<task type="auto">
  <name>Task 3: Ship app/dev-unregister-sw/page.tsx dev utility with prod notFound() gate (D-20)</name>
  <files>app/dev-unregister-sw/page.tsx</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Component Responsibilities table `app/dev-unregister-sw/page.tsx` row)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§app/dev-unregister-sw/page.tsx — lines 699-719)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-20)
  </read_first>
  <action>
1. Create `app/dev-unregister-sw/page.tsx` with the body from `<interfaces>`.
2. Prod-gate is load-bearing: the VERY FIRST code in the component body is the `notFound()` check. Any rendering below it runs only in dev or prod-with-opt-in:
   ```tsx
   if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_SW !== 'true') {
     notFound();
   }
   ```
3. UI is intentionally minimal — inline `style={{}}` attributes, plain `<button>`, no HeroUI / Tailwind (D-25 primitives-are-tool-agnostic).
4. Unregister logic:
   - `const regs = await navigator.serviceWorker.getRegistrations(); for (const reg of regs) await reg.unregister();`
   - `const cacheNames = await caches.keys(); for (const n of cacheNames) await caches.delete(n);`
   - Update status state with count of unregistered + cleared, then `setTimeout(() => window.location.replace('/'), 1500);` to redirect home.
5. No-op if user is in prod without opt-in — they see a Next.js 404 page.
6. Adoption note in the SUMMARY: this page ships ~1KB in the prod bundle but is unreachable (404 at runtime). Trivially removable later by deleting the file — no other code depends on it.
7. Manual UAT (log in SUMMARY):
   - `npm run dev` (NODE_ENV=development): visit `http://localhost:3001/dev-unregister-sw` → expect page to render with "Unregister all SW + clear all caches" button.
   - Click the button → status updates to "unregistering..." → "done — X SW unregistered, Y caches cleared" → 1.5s later, redirects to `/`.
   - Re-enable SW via `NEXT_PUBLIC_ENABLE_SW=true` in `.env.local`, register SW on any page, visit `/dev-unregister-sw` again → click → confirm both regs and caches cleared.
   - Simulate prod: `npm run build && npm run start` (NODE_ENV=production, NEXT_PUBLIC_ENABLE_SW unset): visit `/dev-unregister-sw` → expect Next.js 404 (D-20 prod-gate working).
   - Restore `.env.local` to its pre-plan state.
8. Commit: `feat(16-04): add dev-unregister-sw page with prod notFound() gate (D-20)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - File `app/dev-unregister-sw/page.tsx` exists: `[ -f "app/dev-unregister-sw/page.tsx" ] && echo OK` prints `OK`.
    - `grep -n "'use client'" "app/dev-unregister-sw/page.tsx"` returns one match at file top.
    - `grep -n "notFound" "app/dev-unregister-sw/page.tsx"` returns at least 2 matches (import + call).
    - `grep -n "process.env.NODE_ENV === 'production'" "app/dev-unregister-sw/page.tsx"` returns one match.
    - `grep -n "NEXT_PUBLIC_ENABLE_SW" "app/dev-unregister-sw/page.tsx"` returns one match.
    - `grep -n "getRegistrations" "app/dev-unregister-sw/page.tsx"` returns one match.
    - `grep -n "caches.keys" "app/dev-unregister-sw/page.tsx"` returns one match.
    - `grep -nE "@heroui|tailwind" "app/dev-unregister-sw/page.tsx"` returns zero matches (D-25 primitives are tool-agnostic).
    - `npm run build` exit 0; `npm run test:typecheck` exit 0.
    - Manual UAT logged: dev renders, click clears + redirects, prod 404s without opt-in.
  </acceptance_criteria>
  <done>
    `app/dev-unregister-sw/page.tsx` ships with prod-first `notFound()` gate, inline-style UI, zero UI-framework imports, getRegistrations + caches.keys cleanup, redirect-home on success. Manual UAT confirms dev-renders + prod-404. Atomic commit made.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser tab → Service Worker thread | SW runs in its own worker thread. SW receives every `fetch` event from the page but the fetch-event handler decides (per our allowlist) which to intercept. App-origin origin-guard is the first line of defense against broken SW catching app traffic. |
| Service Worker → Cache Storage API | SW writes cross-origin responses (UploadThing portraits, future Imgur screenshots) into `hsrpvp-assets-v${VERSION}`. Cache is origin-scoped — same-origin JS on same page can enumerate it via `caches.keys()`. |
| Service Worker → External CDNs | SW makes network fetches to `ufs.sh` + `i.imgur.com` when cache miss. CDN response may be opaque cross-origin; still cacheable. |
| Dev utility page → Service Worker API | `/dev-unregister-sw` uses `navigator.serviceWorker.getRegistrations()` + `caches.keys()` — read/write access bounded to the current origin. |
| Dev utility page → production bundle | Page ships to prod (~1KB) but `notFound()` gate closes it. Trust boundary is "gate executes before any UI render". |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16-04-01 | T (Tampering) | SW catches app-origin requests, breaks RSC / API / WS | mitigate | `if (url.origin === self.location.origin) return;` is the FIRST line of the fetch handler (D-18). RESEARCH Pitfall 3 explicitly calls out this failure mode. |
| T-16-04-02 | T | SW cache poisoning via opaque cross-origin responses | mitigate | Narrow allowlist of 2 hostnames (D-17) + `response.ok` check before `cache.put`. Opaque responses (type='opaque') are still cacheable per MDN; still can be served; no functional regression. |
| T-16-04-03 | S (Spoofing) | SW scope hijack from different origin | mitigate | `/public/sw.js` served at `/sw.js` is same-origin by construction. Browsers reject SW registration from a different origin (W3C ServiceWorker spec). |
| T-16-04-04 | E (Elevation of Privilege) | Dev-unregister page reachable in prod | mitigate | `notFound()` gate is the VERY FIRST statement in the component body. Even if opt-in flag leaks, result is only an unregister UI — no privilege escalation. |
| T-16-04-05 | D (Denial of Service) | SW install/activate failure breaks the app | mitigate | `.catch((err) => console.error('[SW] register failed:', err))` in the providers useEffect — failure is logged but does not throw. App continues without SW (graceful degradation). |
| T-16-04-06 | I (Information Disclosure) | Cache Storage enumerates all cached URLs for same-origin JS | accept | Only asset-CDN URLs are cached (character portraits, future match screenshots). No auth tokens, no PII. Access controlled by origin (only our own JS can enumerate). |
| T-16-04-07 | T | `NEXT_PUBLIC_ENABLE_SW` flag committed to `.env.local` or pushed | mitigate | `.env.local` is gitignored per CLAUDE.md; the Gitignore Guardrail forbids `git add -f` for this file. Task 2 + Task 3 manual UAT explicitly require restoring `.env.local` before commit. |
</threat_model>

<verification>
After all 3 tasks land:
1. `[ -f public/sw.js ]` — SW file exists.
2. `[ -f "app/dev-unregister-sw/page.tsx" ]` — dev page exists.
3. `grep -n "serviceWorker.register" app/providers.tsx` — registration wired.
4. `grep -n "url.origin === self.location.origin" public/sw.js` — Pitfall 3 guard present.
5. `grep -E "ALLOWED_HOSTS\\s*=\\s*\\['ufs\\.sh',\\s*'i\\.imgur\\.com'\\]" public/sw.js` — D-17 allowlist literal.
6. `grep -n "notFound" "app/dev-unregister-sw/page.tsx"` — D-20 prod gate.
7. `npm run build && npm run test:typecheck` — both green.
8. 15.5 harness: `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` still green (SW is purely frontend; shouldn't affect backend).
9. Manual UAT: dev-skip / opt-in-register / unregister-page flow all logged in SUMMARY.
10. `.env.local` not committed.
</verification>

<success_criteria>
- `public/sw.js`: 2-host allowlist, origin guard first, cache-first, VERSION=1, D-33 `[SW]` logs, zero deps.
- `app/providers.tsx`: SW register useEffect with gate + empty dep array + provider composition preserved.
- `app/dev-unregister-sw/page.tsx`: `notFound()` prod gate as FIRST statement, inline styles, no HeroUI/Tailwind.
- Manual UAT: dev skips registration; opt-in registers; unregister page clears regs + caches and redirects; prod visit to /dev-unregister-sw returns 404.
- Build + typecheck green.
- 15.5 harness still green (sanity).
- `.env.local` untouched in commits.
</success_criteria>

<output>
After completion, create `.planning/phases/16-route-global-foundation/16-04-SUMMARY.md` documenting:
- Final line count of public/sw.js.
- Manual UAT transcript (dev-skip → opt-in-register → register success → unregister-page flow → prod 404).
- Confirmation that Discord CDN hostname is NOT in ALLOWED_HOSTS (D-17 explicit exclusion).
- Note that Imgur allowlist is in place from Phase 16 even though Phase 32 wires uploads (D-17 anticipation).
- Confirmation that `.env.local` is unchanged in commits (Gitignore Guardrail).
</output>
