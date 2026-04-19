---
phase: 16-route-global-foundation
reviewed: 2026-04-18
depth: standard
status: issues_found
files_reviewed: 22
findings:
  critical: 0
  warning: 10
  info: 17
  total: 27
---

# Phase 16: Code Review Report

**Reviewed:** 2026-04-18
**Depth:** standard
**Files Reviewed:** 22
**Status:** issues_found

## Summary

Reviewed 22 files spanning the Phase 16 route-global-foundation work: first `middleware.ts`, first Service Worker, viewport primitives, subscription reshuffle (Stage 1 → `AuthProvider`, Stage 2 → `(authed)/layout.tsx`), and the `docs/frontend/component-hygiene.md` rule doc.

Overall assessment: the architecture is careful and the comments + JSDoc carry most of the hard reasoning correctly. Subscription lifecycle, SW origin-guard, hydration safety, and middleware scoping are all handled correctly per the documented contracts. The findings below concentrate on:

1. A Stage 2 effect-dependency ordering in `(authed)/layout.tsx` that can race on fast reconnect (Warning).
2. Unchecked `navigator.serviceWorker` / `caches` accesses in the dev-unregister page (Warning).
3. Code-quality items: `any` types on subscription callbacks, extensive `console.log` left in production bundles, CSP `unsafe-eval`, and type-assertion laundering in `GameDataProvider`.

No Critical findings. Security posture intact: RLS at SpacetimeDB, middleware documented as UX-only, SW origin-guard correct (app origin early-returned before hostname check), no hardcoded secrets, no injection sinks.

## Warnings

### WR-01: Stage 2 `subscribedRef` reset ordering in cleanup

**File:** `app/(authed)/layout.tsx:38-100`
**Issue:** The Stage 2 effect cleanup sets `cancelled = true` before resetting `subscribedRef.current = false`. On deliberate same-frame re-subscribe (fast reconnect), a pending promise callback can see `cancelled=true` and exit, but the next effect run already saw the old ref value. Semantics are hard to audit.
**Fix:** Reset `subscribedRef.current = false` synchronously right after `cancelled = true` so atomicity reads clearly.

### WR-02: `dev-unregister-sw` crashes when `navigator.serviceWorker` or `caches` is undefined

**File:** `app/dev-unregister-sw/page.tsx:19-22`
**Issue:** Handler does `navigator.serviceWorker.getRegistrations()` and `caches.keys()` with no feature detection. In Safari private mode, disabled-SW browsers, or non-HTTPS/localhost contexts, one or both are undefined → unhandled promise rejection. Devs use this page precisely when SW is misbehaving — the likely-broken-API case.
**Fix:**
```tsx
const regs = 'serviceWorker' in navigator
    ? await navigator.serviceWorker.getRegistrations()
    : [];
const cacheNames = typeof caches !== 'undefined' ? await caches.keys() : [];
```

### WR-03: Service Worker `cache.put` is fire-and-forget

**File:** `public/sw.js:42-44`
**Issue:** `cache.put(event.request, response.clone())` is not awaited. If the SW is terminated between network response and cache write (common on mobile), the put is silently dropped. A rejected `cache.put` (quota, Safari private) escapes the outer `event.respondWith` chain.
**Fix:** `try { await cache.put(...) } catch (err) { console.warn('[SW] cache.put failed', err); }` inside the async block.

### WR-04: CSP allows `'unsafe-eval'` and `'unsafe-inline'`

**File:** `next.config.ts:22`
**Issue:** `script-src 'self' 'unsafe-inline' 'unsafe-eval'` defeats CSP's XSS protection. `'unsafe-eval'` enables `eval()`, `new Function()`, `setTimeout(string)`. Project memory lists security as a top priority; with middleware now in the repo, per-request nonces are cheap.
**Fix:** Generate a per-request nonce in middleware, reference `nonce-${nonce}` in `script-src`. Drop `'unsafe-eval'` (modern Next builds don't need it). Keep `'unsafe-inline'` only as fallback via `'strict-dynamic'`.

### WR-05: `resolvedSignatureRef` not cleared on identity/session change

**File:** `components/features/auth/hooks/useAuth.ts:93-163`
**Issue:** `resolvedSignatureRef.current` only resets inside the "no user found" branch. If user A logs in → signs out → user B logs in on the same tab, stale signature from A can silence a legitimate resolve for B when non-captured fields haven't changed.
**Fix:**
```ts
useEffect(() => { resolvedSignatureRef.current = null; }, [identity, session?.user?.name]);
```

### WR-06: `LoadoutDropdown` dual click listeners

**File:** `components/features/team-builder/LoadoutDropdown.tsx:27-51`
**Issue:** Both `mousedown` and `click` listeners attached to `document` for close behavior. `disabled` buttons don't fire onClick but still bubble `click` in some browsers (Firefox quirk history), creating edge-case double-fire risk.
**Fix:** Consolidate to a single `mousedown` handler; close the menu inside `onSelectIndex(idx)` directly.

### WR-07: `GameDataProvider` `isReady` always truthy

**File:** `components/features/game-data/components/GameDataProvider.tsx:140`
**Issue:** `isReady: !!characterRows && !!lightconeRows` — arrays are always truthy, even when empty. Consumers reading `isReady` get a truthy-since-mount boolean, not "data landed." Contradicts the correctly-computed `allReady` at line 107–108.
**Fix:** `isReady: allReady` — or rename to `isMounted` if consumers actually want the mount signal.

### WR-08: `SafariWarning` calls `isSafari()` three times on mount

**File:** `components/globals/viewport/SafariWarning.tsx:15-18`
**Issue:** `isSafari()` runs regex on `navigator.userAgent` in the `show` computation AND inside the `console.log`. Non-hot-path, but drift-prone if an override is added.
**Fix:** Capture into a local once: `const safari = isSafari();` then reuse.

### WR-09: `ViewportGate` creates `dynamic(...)` inside render body

**File:** `components/globals/viewport/ViewportGate.tsx:69`
**Issue:** `dynamic(loader, ...)` is called on every render. Works because `next/dynamic` memoizes by loader reference and module-scoped loaders are stable — but any consumer passing inline `() => import(...)` will remount on every render. `dynamic` is designed for module scope, not function-component bodies.
**Fix:**
```tsx
const Component = useMemo(() => {
    const loader = resolved === 'mobile' && mobile ? mobile : desktop;
    return dynamic(loader, { ssr: false, loading: () => <Skeleton /> });
}, [resolved, desktop, mobile, Skeleton]);
```
Document in JSDoc that `desktop`/`mobile` must be referentially stable.

### WR-10: Middleware redirect loop hazard if matcher extended to `/`

**File:** `middleware.ts:13-16`
**Issue:** Redirects cookie-less visitors to `/`. Current matcher doesn't cover `/`, so no loop. But load-bearing-by-omission — any future matcher change to include `/` or site root creates infinite redirect.
**Fix:**
```ts
if (!cookie) {
    if (path === '/') return NextResponse.next();
    return NextResponse.redirect(new URL('/', request.url));
}
```

## Info

### IN-01: `any` types on SpacetimeDB subscription callbacks

**Files:** `app/(authed)/layout.tsx:72-88`, `components/features/auth/components/AuthProvider.tsx:52-66`
**Issue:** `ctx: any`, `row: any`, `oldRow: any` in subscription callbacks. Elsewhere the codebase uses typed SDK bindings.
**Fix:** Import EventContext + row types from `@/src/module_bindings`, or tag with `// TODO: type with SDK EventContext once exposed`.

### IN-02: Extensive `console.log` in production bundles

**Files:** `app/providers.tsx:56,67`; `app/(authed)/layout.tsx` (7x); `components/features/auth/**` (18x); `components/features/game-data/**` (2x); `components/globals/viewport/**` (6x); `lib/render-tier.ts` (7x); `middleware.ts:14,18`; `public/sw.js:11,15,36`
**Issue:** 40+ `console.log` calls ship to production. Some leak identity linkages (`[useAuth] Strategy 3 hit: session name "${sessionName}" → id=...`).
**Fix:** Add to `next.config.ts`:
```ts
compiler: { removeConsole: { exclude: ['error', 'warn'] } }
```
Or introduce a debug-gated `lib/logger.ts`.

### IN-03: `GameDataProvider` uses `as unknown as` type laundering

**File:** `components/features/game-data/components/GameDataProvider.tsx:126-138`
**Issue:** 8 occurrences of `as unknown as <LocalType>` to coerce SDK rows to local mirror interfaces. Local types drift silently as schema evolves.
**Fix:** Re-export SDK-generated types from `@/src/module_bindings` and drop the mirrors, OR add a compile-time assertion (`AssertEqual<ArchetypeRow, SDK.Archetype>`) to break the build on drift.

### IN-04: `TeamSlot` has dead commented-out `<Image />` props

**File:** `components/features/team-builder/Teamslot.tsx:106-110,118-121,141-144`
**Issue:** Three blocks of commented `width={0} height={0} sizes="100vw"` with migration comments. File uses `<img>`, not `next/image`.
**Fix:** Delete the commented blocks. If migration is planned, open a single file-header TODO.

### IN-05: `TeamSlot` raw `<img>` with empty-string src fallback

**File:** `components/features/team-builder/Teamslot.tsx:123`
**Issue:** `src={character.imageUrl || ""}` — empty-string `src` still fires an HTTP request to the current page URL on most browsers.
**Fix:** `{character.imageUrl && (<img src={character.imageUrl} … />)}`.

### IN-06: `LoadoutDropdown` portraits missing lazy loading

**File:** `components/features/team-builder/LoadoutDropdown.tsx:109-119`
**Issue:** Many-loadout × TEAM_SIZE portraits fetched eagerly on open.
**Fix:** Add `loading="lazy"` and `decoding="async"` on both `<img>`s.

### IN-07: `useAuth` effect dep on `getConnection` without stability docs

**File:** `components/features/auth/hooks/useAuth.ts:264`
**Issue:** Big Discord-linking effect depends on `getConnection`. Guards (`autoRegisteredRef`, `linkingRef`) defend against retrigger, but stability assumption is undocumented here.
**Fix:** One-line JSDoc: `// Assumes getConnection is referentially stable (SDK contract, see spacetimedb/react).`

### IN-08: `middleware.ts` matcher omits `/api/` — document intent

**File:** `middleware.ts:26-31`
**Issue:** `/api/auth/link-discord` deliberately not covered (auth itself). Correct, but future reader may try to add it.
**Fix:** Append comment:
```ts
// Intentionally excludes '/api/…' — API routes self-validate; middleware redirect would break callers expecting 401/403.
```

### IN-09: `SafariWarning` inline styles bypass design tokens

**File:** `components/globals/viewport/SafariWarning.tsx:34-66`
**Issue:** Hardcoded hex colors (`#f59e0b`, `#111827`) in inline styles. `docs/frontend/component-hygiene.md` Rule 3 tolerates CSS Modules or Tailwind — inline hardcoded colors are neither.
**Fix:** Move to `SafariWarning.module.css` using `var(--color-warn-*)`. Not blocking.

### IN-10: `dev-unregister-sw` inline styles

**File:** `app/dev-unregister-sw/page.tsx:29-35,54-61`
**Issue:** Same design-tokens bypass. **Intentional per D-25** and documented in `16-04-service-worker-SUMMARY.md` (no HeroUI/Tailwind). Flagging for provenance only.
**Fix:** None needed — intentional.

### IN-11: SW registration missing "update available" lifecycle

**File:** `app/providers.tsx:64-67`
**Issue:** `navigator.serviceWorker.register('/sw.js')` does not attach `reg.onupdatefound` / watch `reg.installing.onstatechange`. When `sw.js` VERSION bumps, existing tabs keep the old SW active until all tabs close — users see stale asset-cache for days.
**Fix:** Attach `updatefound` listener that logs when a new version is waiting; next bump then behaves predictably.

### IN-12: `useAuth` magic number for Discord intent TTL

**File:** `components/features/auth/hooks/useAuth.ts:182`
**Issue:** `const DISCORD_INTENT_TTL_MS = 5 * 60 * 1000;` — unlike the documented year constant in `ViewportWriter.tsx:7`, no comment explaining choice.
**Fix:** Add: `// 5 min — covers the Discord OAuth round-trip including slow networks.`

### IN-13: `next.config.ts` CSP includes `ws://localhost:*` in production

**File:** `next.config.ts:25`
**Issue:** `connect-src … ws://localhost:* …` is correct for dev but signals dev posture in prod.
**Fix:** Gate on `process.env.NODE_ENV`:
```ts
const devOnly = process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : '';
```

### IN-14: `(authed)/(match)/layout.tsx` is a passthrough placeholder

**File:** `app/(authed)/(match)/layout.tsx:3-5`
**Issue:** `<>{children}</>` placeholder. Phase 28 reservation per plan.
**Fix:** None needed. Add JSDoc: `/** Phase 28 reserved — will host match-only subscriptions (LobbyMember, Draft, …). */`.

### IN-15: `isLiveChange` helper duplicated across subscription owners

**Files:** `app/(authed)/layout.tsx:72-75`, `components/features/auth/components/AuthProvider.tsx:52-55`
**Issue:** Identical helper in both subscription owners. Drift risk if SDK adds new event tags.
**Fix:** Hoist to `lib/spacetimedb.ts`:
```ts
export function isLiveChange(ctx: { event?: { tag?: string } }): boolean {
    const tag = ctx?.event?.tag;
    return tag === 'Reducer' || tag === 'Transaction';
}
```

### IN-16: Component-hygiene doc's "enforced starting Phase 16" is ambiguous

**File:** `docs/frontend/component-hygiene.md:4`
**Issue:** Rule 3 says "enforced starting Phase 16 onwards" — but Phase 16 itself ships the rules, so Phase 16 code is not audited against R8.
**Fix:** Clarify: `Status: Active — enforced for Phase 17+ (Phase 16 is the foundation that R8 commits to).`

### IN-17: `useAuth` Discord-flow effect has 7 early-return branches

**File:** `components/features/auth/hooks/useAuth.ts:201-264`
**Issue:** 60-line effect with many early returns. Refactor-safe but hard to follow.
**Fix:** Extract into `useDiscordLink` hook. Below Phase 16's scope — flag for future.

---

## Summary Counts

Critical: 0 | Warning: 10 | Info: 17 | Total: 27

---

_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
_Files reviewed: 22_
