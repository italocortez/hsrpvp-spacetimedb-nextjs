---
phase: 16-route-global-foundation
author: italocortezv
created: 2026-04-18
review_path: .planning/phases/16-route-global-foundation/16-REVIEW.md
purpose: Pre-fix audit of 16-REVIEW.md findings. Captures skip/fix decisions and concrete patch plans before the fixer runs. Protects against regression-risky auto-fixes.
audit_status: complete_info_and_warning
findings_audited: 27
planned_fixes: 12
skipped: 15
---

# Phase 16 — Code Review Fix Audit & Plan

Pre-fix audit of `16-REVIEW.md`. For each finding: verified against the actual code, classified as FIX / SKIP / MODIFIED-FIX, with concrete patch plan when applicable.

## Decision Legend

| Marker | Meaning |
|--------|---------|
| 🟢 **FIX** | Apply as specified by the reviewer |
| 🟡 **FIX-MODIFIED** | Apply, but diverge from reviewer's exact suggestion (reason given) |
| 🔴 **SKIP** | Not applying — would regress behavior, invent non-existent APIs, or outside scope |

---

## Info Findings (17)

### IN-01: Type subscription callbacks with SDK `EventContext`

**Decision:** 🟢 **FIX**

**Rationale:**
- SDK exports fully-parameterized types at `src/module_bindings/index.ts:1479-1483`: `EventContext`, `ReducerEventContext`, `SubscriptionEventContext`.
- SDK's generated callback signatures in `spacetimedb/node_modules/spacetimedb/dist/sdk/client_table.d.ts:15-42` are fully typed — `any` is our annotation drift, not the SDK's.
- The `Event` union in `event.d.ts` has exactly `'Reducer' | 'SubscribeApplied' | 'UnsubscribeApplied' | 'Error' | 'Transaction'` — our `isLiveChange` filter becomes a discriminated-union narrowing.
- **Future pattern:** any phase extracting named handlers for `removeOn*` cleanup will hit the same annotation. Establishing the typed pattern now pays forward to Phases 17+.
- **Safety:** `npm run test:typecheck` runs on every commit — drift in SDK shape breaks the build immediately. Safer than `any`.

**Patch plan:**

`components/features/auth/components/AuthProvider.tsx`:
```ts
import type { EventContext } from '@/src/module_bindings';
import type ViewMyProfileRow from '@/src/module_bindings/view_my_profile_table';

const isLiveChange = (ctx: EventContext): boolean => {
    const tag = ctx?.event?.tag;
    return tag === 'Reducer' || tag === 'Transaction';
};

const onViewProfileInsert = (ctx: EventContext, row: ViewMyProfileRow) => { ... };
const onViewProfileUpdate = (ctx: EventContext, _oldRow: ViewMyProfileRow, row: ViewMyProfileRow) => { ... };
```

`app/(authed)/layout.tsx`:
```ts
import type { EventContext, User } from '@/src/module_bindings';

const isLiveChange = (ctx: EventContext): boolean => {
    const tag = ctx?.event?.tag;
    return tag === 'Reducer' || tag === 'Transaction';
};

const onUserInsert = (ctx: EventContext, row: User) => { ... };
const onUserUpdate = (ctx: EventContext, oldRow: User, row: User) => { ... };
```

Zero runtime change. Pure type tightening.

**Pairs with IN-15.** When the helper is hoisted to `lib/spacetimedb.ts`, it lands already typed.

---

### IN-02: Strip console.log from production bundles via `compiler.removeConsole`

**Decision:** 🔴 **SKIP** — user veto.

**Rationale:**
- Console logs were deliberately retained for prod incident diagnosis (`[useAuth]`, `[AuthProvider]`, `[middleware]`, `[ViewportGate]`, `[renderTier]`). Stripping undoes that choice.
- `compiler.removeConsole` doesn't apply to `public/sw.js` (static file, not compiled).
- Identity-leak concerns addressable by rewriting the 2–3 offending lines, not compiler-stripping everything.

---

### IN-03: Replace `as unknown as LocalType` with SDK-generated types

**Decision:** 🔴 **SKIP** — user veto.

**Rationale:**
- `src/module_bindings/index.ts:207,210` already exports `HsrCharacterRow` / `HsrLightconeRow` as class identifiers — name collision with local interfaces in `GameDataProvider.tsx:9,20`.
- Local shapes diverge from SDK (`aliases: string[]`, `path: { tag: string }`). Swapping cascades into every consumer (`DataHelpers.ts`, `teambuilder/page.tsx`).
- Not a Phase 16 scope item. Defer to a future typed-binding alignment phase.

---

### IN-04: Delete commented-out `<Image />` props in `Teamslot.tsx`

**Decision:** 🟢 **FIX**

**Patch plan:** Delete the three comment blocks at `components/features/team-builder/Teamslot.tsx:106-110,118-121,141-144`. Pure deletion, no runtime change.

---

### IN-05: Fallback for empty / broken `imageUrl`

**Decision:** 🟡 **FIX-MODIFIED**

**Rationale:**
- `HsrCharacterRow.imageUrl: string` is typed required, so empty-string is mostly unreachable. Real failure mode is **broken CDN URLs** (UploadThing/Imgur 404s).
- Reviewer's conditional-render suggestion changes layout when the `<img>` disappears — the `styles.portrait` CSS dimensions are load-bearing.
- Better: explicit fallback asset + `onError` handler that catches both empty-url and broken-url cases.

**Patch plan:**

1. Confirmed: `public/not-found-image.webp` exists.
2. Create `lib/image-fallback.ts`:
   ```ts
   export const NOT_FOUND_IMAGE = '/not-found-image.webp';

   export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>) {
       const img = e.currentTarget;
       if (!img.src.endsWith(NOT_FOUND_IMAGE)) {
           img.src = NOT_FOUND_IMAGE;
       }
   }
   ```
   The `endsWith` guard prevents infinite error loops if the fallback itself 404s.
3. Apply at all 5 `<img>` sites:
   - `Teamslot.tsx:105-114` (path icon) — `src={pathIconUrl || NOT_FOUND_IMAGE}` + `onError={handleImageError}`
   - `Teamslot.tsx:117-126` (portrait) — `src={character.imageUrl || NOT_FOUND_IMAGE}` + `onError`
   - `Teamslot.tsx:140-149` (element icon) — `src={elementIconUrl || NOT_FOUND_IMAGE}` + `onError`
   - `LoadoutDropdown.tsx:109-113` (miniElement) — same treatment
   - `LoadoutDropdown.tsx:114-118` (miniPortrait) — same treatment

Reusable for Phase 17+ cost-tables imagery.

---

### IN-06: `loading="lazy" decoding="async"` on dropdown portraits

**Decision:** 🟡 **FIX-MODIFIED**

**Rationale:**
- `loading="lazy"` inside a just-opened dropdown is marginal — all portraits are typically in viewport on open, so IntersectionObserver overhead without payoff.
- `decoding="async"` is a pure win — hints the decoder to run off the main thread.

**Patch plan:** Add only `decoding="async"` to the 2 `<img>` sites in `LoadoutDropdown.tsx:109-118`. Skip `loading="lazy"`.

---

### IN-07: JSDoc on `getConnection` stability assumption

**Decision:** 🟢 **FIX**

**Patch plan:** One-line comment above the Discord-linking effect at `useAuth.ts:264`:
```ts
// Effect retriggers on any dep change; getConnection is assumed referentially stable
// (SDK contract, see spacetimedb/react). autoRegisteredRef + linkingRef guard against
// reentrancy if that assumption breaks.
```

Docs-only. No runtime change.

---

### IN-08: Comment explaining `/api/` exclusion from middleware matcher

**Decision:** 🟢 **FIX**

**Patch plan:** Append a line above `middleware.ts:26` (before the matcher):
```ts
// Intentionally excludes '/api/…', '/_next/*', '/sw.js' — API routes self-validate via
// NextAuth JWT; a middleware redirect would break API callers expecting 401/403, not 307.
```

Docs-only. No runtime change.

---

### IN-09: Move SafariWarning inline styles to CSS Module with `var(--color-warn-*)`

**Decision:** 🔴 **SKIP** — user veto.

**Rationale:**
- `app/tokens.css` has `--color-warning: #FBBF24` (yellow); component ships `#f59e0b` (amber). **Different shades.**
- Reviewer's token `--color-warn-*` (plural) doesn't exist in the codebase — invented API.
- The explicit color choice is documented: "amber (NOT red — DeletionBanner owns red)". Load-bearing design decision.

---

### IN-10: dev-unregister-sw inline styles

**Decision:** 🔴 **NO-OP** (self-cancelled by reviewer)

Intentional per D-25; flagged for provenance only. No fix needed per the review itself.

---

### IN-11: SW `updatefound` lifecycle listener

**Decision:** 🟢 **FIX**

**Rationale:**
- `VERSION=1` today, but next bump will leave tabs on stale SW until all close. Adding the listener is additive and costs ~8 LOC.
- Pairs naturally with the `public/sw.js` SW file changes for WR-03.

**Patch plan:** `app/providers.tsx:64-68` — expand the registration chain:
```ts
navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => {
        console.log('[SW] registered, scope=' + reg.scope);
        reg.addEventListener('updatefound', () => {
            const nw = reg.installing;
            nw?.addEventListener('statechange', () => {
                if (nw.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[SW] update available — next reload will activate new version');
                }
            });
        });
    })
    .catch((err) => console.error('[SW] register failed:', err));
```

---

### IN-12: Comment for `DISCORD_INTENT_TTL_MS = 5 * 60 * 1000`

**Decision:** 🟢 **FIX**

**Patch plan:** `useAuth.ts:182` — add inline comment:
```ts
const DISCORD_INTENT_TTL_MS = 5 * 60 * 1000; // 5 min — Discord OAuth round-trip including slow networks
```

Docs-only.

---

### IN-13: Gate `ws://localhost:*` on NODE_ENV in CSP

**Decision:** 🔴 **SKIP** — user veto.

**Rationale:** User only runs `npm run dev`, never `npm start`. Zero effective risk in current workflow. Low value, defer.

---

### IN-14: JSDoc on passthrough `(match)/layout.tsx`

**Decision:** 🟢 **FIX**

**Patch plan:** Add JSDoc to `app/(authed)/(match)/layout.tsx`:
```ts
/**
 * Phase 28 reservation — will host match-only subscriptions (LobbyMember, Draft,
 * ActionItem). Passthrough today; downstream match pages mount under (match)/draft/[matchId].
 */
```

Docs-only.

---

### IN-15: Hoist `isLiveChange` helper to `lib/spacetimedb.ts`

**Decision:** 🟢 **FIX**

**Rationale:**
- Identical at `(authed)/layout.tsx:72-75` and `AuthProvider.tsx:52-55`. Drift risk if SDK adds new event tags (e.g., `'Procedure'`).
- Lands already typed thanks to IN-01.
- Pre-empts a third duplicate in Phase 28 when `(match)/layout.tsx` adds match-table subscriptions.

**Patch plan:** Append to `lib/spacetimedb.ts`:
```ts
import type { EventContext } from '@/src/module_bindings';

/** Filters out SubscribeApplied / UnsubscribeApplied / Error events from live-change callbacks. */
export function isLiveChange(ctx: EventContext): boolean {
    const tag = ctx?.event?.tag;
    return tag === 'Reducer' || tag === 'Transaction';
}
```

Remove the duplicated declarations at the two subscription owners; import from `@/lib/spacetimedb`.

---

### IN-16: Clarify "enforced starting Phase 16" wording in component-hygiene doc

**Decision:** 🟢 **FIX**

**Patch plan:** `docs/frontend/component-hygiene.md:4`:
```
Status: Active — enforced for Phase 17+ (Phase 16 is the foundation that R8 commits to).
```

Docs-only.

---

### IN-17: Extract Discord-linking effect into `useDiscordLink` hook

**Decision:** 🔴 **SKIP** — user veto. Future work.

---

## Warning Findings (10)

### WR-01: Stage 2 `subscribedRef` reset ordering in cleanup

**Decision:** 🔴 **SKIP**

**Rationale:**
- Reviewer claims cleanup ordering (`cancelled = true` before `subscribedRef.current = false`) creates a race on fast reconnect.
- **Analysis of actual code (`app/(authed)/layout.tsx:90-97`):** all statements run synchronously in a single tick. React effect cleanup runs strictly BEFORE the next effect body. By the time the new effect checks `subscribedRef.current`, it's already false regardless of statement order inside the cleanup.
- The "race" is theoretical with no reproducible scenario. Reordering is cosmetic — doesn't change behavior.
- The `cancelled = true` + handler removal order is already correct for preventing stale callbacks; moving the ref reset is unnecessary.

No fix. The current ordering is functionally equivalent to the reviewer's suggestion.

---

### WR-02: `dev-unregister-sw` feature-detection

**Decision:** 🟢 **FIX**

**Rationale:**
- Page is dev-only (prod-gated with `notFound()`), but devs in Safari-private / SW-disabled browsers crash the page — exactly when they need it.
- Fix is additive defensive coding, zero regression risk.

**Patch plan:** `app/dev-unregister-sw/page.tsx:17-26`:
```tsx
const unregister = async () => {
    setStatus('unregistering...');
    try {
        const regs = 'serviceWorker' in navigator
            ? await navigator.serviceWorker.getRegistrations()
            : [];
        for (const reg of regs) await reg.unregister();
        const cacheNames = typeof caches !== 'undefined' ? await caches.keys() : [];
        for (const n of cacheNames) await caches.delete(n);
        setStatus(`done — ${regs.length} SW unregistered, ${cacheNames.length} caches cleared`);
        setTimeout(() => window.location.replace('/'), 1500);
    } catch (err) {
        setStatus(`error: ${err instanceof Error ? err.message : String(err)}`);
    }
};
```

---

### WR-03: SW `cache.put` fire-and-forget

**Decision:** 🟡 **FIX-MODIFIED**

**Rationale:**
- Reviewer suggests `await cache.put(...)` inside a try/catch. That **delays the response** to the browser until the cache write finishes (~5ms per asset).
- Better pattern: `event.waitUntil(cache.put(...).catch(...))`. Extends SW lifetime for the cache write WITHOUT blocking the response.
- Catches rejected cache.put (quota, Safari private) and logs a warning rather than escaping as an unhandled rejection.

**Patch plan:** `public/sw.js:38-47`:
```js
event.respondWith(
  caches.open(ASSET_CACHE).then(async (cache) => {
    const cached = await cache.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok && event.request.method === 'GET') {
      // Extend SW lifetime for the cache write without delaying the response.
      event.waitUntil(
        cache.put(event.request, response.clone())
          .catch((err) => console.warn('[SW] cache.put failed', err))
      );
    }
    return response;
  })
);
```

**Note:** `event.waitUntil` must be called synchronously inside the fetch handler. Since we're inside an async `.then` callback, this is still within the handler's lifetime — verify on a prod build that the write completes (DevTools → Application → Cache Storage).

---

### WR-04: CSP `'unsafe-eval'` + `'unsafe-inline'`

**Decision:** 🟡 **FIX-MODIFIED** — drop `'unsafe-eval'` only; defer nonce-based `'unsafe-inline'` removal.

**Rationale:**
- Removing `'unsafe-eval'` is low risk: modern Next prod builds don't use `eval()` / `new Function()`. Test with `npm run build && npm start` locally.
- Removing `'unsafe-inline'` requires a middleware rewrite to generate per-request nonces + propagate via `x-nonce` header + reference `nonce-${nonce}` in CSP. That's a meaningful change to `middleware.ts` (currently 32 LOC) and a dedicated security phase.

**Patch plan:** `next.config.ts:21`:
```ts
"script-src 'self' 'unsafe-inline'",  // Dropped 'unsafe-eval' — unneeded in Next 15 prod builds
```

Validate by running `npm run build && npm start` and confirming no console errors about blocked `eval()`. If any dependency breaks, revert and add a note for the security phase.

Dedicated security phase (deferred) will:
1. Add nonce generation in middleware.
2. Replace `'unsafe-inline'` with `'nonce-${nonce}' 'strict-dynamic'`.
3. Audit all third-party scripts (HeroUI, NextAuth) for nonce compatibility.

---

### WR-05: `resolvedSignatureRef` not reset on identity/session change

**Decision:** 🔴 **SKIP**

**Rationale:**
- **Analysis of actual code (`useAuth.ts:93-163`):** `readProfileFromConnection` is wrapped in `useCallback([identity, session, setResolvedUser])`, so the callback re-creates on identity/session change.
- `extractProfileSignature` includes `id`, `username`, `displayName`, `isGuest`, `lastLoginAt`, `role.tag`, `hasDiscordLinked`, `avatarCharacterName`, `deletedAt`, `discordId`, `discordUsername` — every meaningful field. Any real user-switch produces a different signature; the dedupe self-heals.
- The "no user found" path at line 160 DOES reset `resolvedSignatureRef.current = null`.
- The reviewer's scenario requires two distinct users producing IDENTICAL signatures — impossible by construction (different user ids at minimum).

No fix. The existing signature-based dedupe is correct by design. Would only add defensive code without a reproducible bug.

---

### WR-06: `LoadoutDropdown` dual click listeners → consolidate

**Decision:** 🟢 **FIX**

**Rationale:**
- Dual listeners (`mousedown` outside-close + `click` inside-button-close) work today but are fragile — disabled-button bubbling differs across browsers (Firefox quirk history).
- Consolidation to a single `mousedown` handler + close-on-select is cleaner and matches standard React dropdown patterns.

**Patch plan:** `components/features/team-builder/LoadoutDropdown.tsx`:
```tsx
const handleSelect = (idx: number) => {
    onSelectIndex(idx);
    setIsOpen(false);
};

useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
            triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
}, []); // no isOpen dep — listener always attached is fine, guards via ref check

// In the button at line 75:
<button ... onClick={() => handleSelect(idx)} ... />
```

Also: dep array can drop `isOpen` since the listener's inner logic doesn't read it.

**Smoke test required:** manual dropdown click-through after fix to confirm close behavior works for selected / trigger-reclick / outside-click.

---

### WR-07: `GameDataProvider.isReady` always truthy

**Decision:** 🟢 **FIX** — this is the highest-impact Warning. Real bug.

**Rationale:**
- `isReady: !!characterRows && !!lightconeRows` — arrays are always truthy post-mount. Effectively `isReady` is `true` since mount.
- Consumer `useProfile.ts:9,12,15,20` gates rendering on `gameDataReady`. Currently the gate always passes → brief empty-profile render before data lands.
- The file already computes the correct value as `allReady` (line 110-116, uses `.length > 0` on all 7 tables) for the "all ready" log.

**Patch plan:** `components/features/game-data/components/GameDataProvider.tsx:140`:
```ts
isReady: allReady
```

One-word change. `allReady` is already in scope.

**Regression risk:** `useProfile` consumers now render `null` longer (until all 7 tables populate) — this is CORRECT behavior (the current behavior is broken). Smoke-test the profile page after fix to confirm it still renders once data arrives.

---

### WR-08: `SafariWarning` captures `isSafari()` into local

**Decision:** 🟢 **FIX**

**Patch plan:** `components/globals/viewport/SafariWarning.tsx:13-19`:
```tsx
useEffect(() => {
    setMounted(true);
    const safari = isSafari();
    const isDismissed = typeof window !== 'undefined' && localStorage.getItem(DISMISSED_KEY) === '1';
    const show = safari && !isDismissed;
    setShouldShow(show);
    console.log(`[SafariWarning] mount: isSafari=${safari} dismissed=${isDismissed} show=${show}`);
}, []);
```

Cosmetic. Single `isSafari()` call; log line reuses the captured value.

---

### WR-09: `ViewportGate` — `dynamic()` inside render body

**Decision:** 🟢 **FIX**

**Rationale:**
- Real issue: `dynamic(loader, opts)` is designed for module scope. Calling it in render body creates a new lazy component each render when `resolved !== null`.
- No consumers today (component shipped this phase), so no live breakage — but the component IS the contract for Phases 27/31/35. Ship it correct.
- Reviewer's `useMemo` fix is correct. JSDoc must document loader-reference stability requirement.

**Patch plan:** `components/globals/viewport/ViewportGate.tsx:39-72`:
```tsx
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, type ComponentType } from 'react';

interface Props<P extends object> {
    desktop: () => Promise<{ default: ComponentType<P> }>;
    mobile?: () => Promise<{ default: ComponentType<P> }>;
    initialViewport?: 'desktop' | 'mobile';
    componentProps: P;
    Skeleton: ComponentType;
}

/**
 * ViewportGate — Phase 16 Plan 05 (FOUND-11, FOUND-12)
 *
 * IMPORTANT: `desktop` and `mobile` loaders MUST be referentially stable across
 * renders. Use module-scoped arrow functions at the call site:
 *
 *     const desktopLoader = () => import('./MyPage.desktop');
 *     const mobileLoader = () => import('./MyPage.mobile');
 *     <ViewportGate desktop={desktopLoader} mobile={mobileLoader} ... />
 *
 * Inline `desktop={() => import('./X')}` will recreate the loader every render
 * and defeat the useMemo below, causing remount + state loss on every render.
 */
export function ViewportGate<P extends object>({ desktop, mobile, initialViewport, componentProps, Skeleton }: Props<P>) {
    const [resolved, setResolved] = useState<'desktop' | 'mobile' | null>(initialViewport ?? null);

    useEffect(() => {
        if (!mobile) { setResolved('desktop'); return; }
        const mq = window.matchMedia('(pointer: coarse) and (hover: none)');
        setResolved(mq.matches ? 'mobile' : 'desktop');
    }, [mobile]);

    const Component = useMemo(() => {
        if (resolved === null) return null;
        const loader = resolved === 'mobile' && mobile ? mobile : desktop;
        return dynamic(loader, { ssr: false, loading: () => <Skeleton /> });
    }, [resolved, desktop, mobile, Skeleton]);

    if (Component === null) return <Skeleton />;
    return <Component {...componentProps} />;
}
```

---

### WR-10: Middleware redirect loop hazard

**Decision:** 🟢 **FIX**

**Rationale:** Pure defense-in-depth. 1 line. No consumer-visible change today since `/` is not in the matcher.

**Patch plan:** `middleware.ts:13-16`:
```ts
if (!cookie) {
    if (path === '/') return NextResponse.next(); // defense: prevent redirect loop if matcher ever includes '/'
    console.log(`[middleware] redirect: ${path} (no stdb_session cookie)`);
    return NextResponse.redirect(new URL('/', request.url));
}
```

---

## Summary

### Planned Fixes (12)

| ID | File | Type |
|----|------|------|
| IN-01 | AuthProvider.tsx, (authed)/layout.tsx | type tightening |
| IN-04 | Teamslot.tsx | cleanup (delete comments) |
| IN-05 | Teamslot.tsx, LoadoutDropdown.tsx, **new** `lib/image-fallback.ts` | defensive image fallback |
| IN-06 | LoadoutDropdown.tsx | perf hint (decoding="async" only) |
| IN-07 | useAuth.ts | docs |
| IN-08 | middleware.ts | docs |
| IN-11 | app/providers.tsx | SW updatefound listener |
| IN-12 | useAuth.ts | docs |
| IN-14 | (authed)/(match)/layout.tsx | docs |
| IN-15 | **new** `lib/spacetimedb.ts` export, AuthProvider.tsx, (authed)/layout.tsx | hoist helper |
| IN-16 | docs/frontend/component-hygiene.md | docs clarification |
| WR-02 | dev-unregister-sw/page.tsx | feature-detection |
| WR-03 | public/sw.js | `event.waitUntil` for cache.put |
| WR-04 | next.config.ts | drop `'unsafe-eval'` |
| WR-06 | LoadoutDropdown.tsx | consolidate listeners |
| WR-07 | GameDataProvider.tsx | fix `isReady` truthiness |
| WR-08 | SafariWarning.tsx | cosmetic (capture local) |
| WR-09 | ViewportGate.tsx | useMemo + JSDoc contract |
| WR-10 | middleware.ts | defense-in-depth guard |

### Skipped (15)

| ID | Reason |
|----|--------|
| IN-02 | User veto — deliberate prod logging |
| IN-03 | User veto — SDK name collision, cascading refactor |
| IN-09 | User veto — invented token name + wrong color shade |
| IN-10 | Self-cancelled (intentional per D-25) |
| IN-13 | User veto — zero impact in `npm run dev`-only workflow |
| IN-17 | User veto — high-risk refactor, out of phase scope |
| WR-01 | Over-speculation — statements run synchronously in effect cleanup, no real race |
| WR-05 | Over-speculation — signature-based dedupe self-heals, scenario impossible by construction |

### Sequencing

Recommended commit grouping (atomic, each commit typechecks + builds green):

1. **Docs-only batch** (IN-07, IN-08, IN-12, IN-14, IN-16) — one commit
2. **Cleanup** (IN-04) — one commit
3. **Image fallback** (IN-05) — creates `lib/image-fallback.ts` + 5 sites — one commit
4. **Type tightening + helper hoist** (IN-01 + IN-15 together — they touch the same files) — one commit
5. **SafariWarning cleanup** (WR-08) — one commit
6. **SW + providers** (WR-03 + IN-11 — related concerns) — one commit
7. **dev-unregister feature-detection** (WR-02) — one commit
8. **Middleware guard** (WR-10) — one commit
9. **CSP hardening** (WR-04) — one commit, requires `npm run build && npm start` smoke test
10. **LoadoutDropdown consolidation** (WR-06 + IN-06) — one commit, requires dropdown manual smoke test
11. **GameDataProvider isReady fix** (WR-07) — one commit, requires profile page smoke test
12. **ViewportGate hardening** (WR-09) — one commit, no live consumers so no smoke test needed

Low-risk items (1–8) first; smoke-test-required items (9–11) last; architectural cleanup (12) at the end.
