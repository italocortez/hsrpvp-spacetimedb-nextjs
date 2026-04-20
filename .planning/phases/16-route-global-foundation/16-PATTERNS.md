# Phase 16: Route + Global Foundation — Pattern Map

**Mapped:** 2026-04-18
**Files analyzed:** 27 (13 new, 14 modified/renamed)
**Analogs found:** 24 / 27 (3 have no direct analog — see §No Analog Found)

## File Classification

### New files (created in Phase 16)

| New file | Role | Data Flow | Closest Analog | Match Quality |
|----------|------|-----------|----------------|---------------|
| `middleware.ts` | middleware (edge) | request-response | — (no middleware in repo yet) | no analog — use RESEARCH Pattern 8 + native `next/server` |
| `public/sw.js` | service-worker | event-driven (fetch/install/activate) | — (no SW in repo yet) | no analog — use RESEARCH Pattern 5 |
| `app/(authed)/(match)/layout.tsx` | layout (passthrough) | request-response | `app/(landing-page)/layout.tsx` | role-match (simpler body) |
| `app/dev-unregister-sw/page.tsx` | page (client utility) | request-response | `app/(landing-page)/page.tsx` + `next/navigation` notFound | role-match |
| `components/globals/viewport/ViewportGate.tsx` | component (client boundary) | event-driven (matchMedia) | `components/features/auth/components/AuthRequired.tsx` | role-match (overlay/swap render pattern) |
| `components/globals/viewport/ViewportWriter.tsx` | component (client effect-only) | event-driven (matchMedia → cookie) | `components/features/auth/components/DeletionBanner.tsx` + `lib/session-cookie.ts` | role-match (null-render + side effect) |
| `components/globals/viewport/SafariWarning.tsx` | component (client banner) | request-response | `components/features/auth/components/DeletionBanner.tsx` | exact (banner conditional render) |
| `lib/render-tier.ts` | utility (pure) | transform | `lib/session-cookie.ts` | exact (pure util, localStorage, cookie-shaped API) |
| `docs/frontend/component-hygiene.md` | documentation | — | `docs/auth/architecture.md` + `docs/_templates/architecture-template.md` | role-match |

### Modified files (existing, touched by Phase 16)

| Modified file | Role | Data Flow | Closest Analog | Match Quality |
|---------------|------|-----------|----------------|---------------|
| `next.config.ts` | config | — | `next.config.ts` (itself) | in-place edit |
| `app/providers.tsx` | provider composition | event-driven (SW register effect) | `app/providers.tsx` (itself) + `useAuth.ts:72-111` (useEffect pattern) | in-place edit |
| `app/layout.tsx` | root layout | request-response | `app/layout.tsx` (itself) | in-place edit |
| `app/(authed)/layout.tsx` (renamed from `(authenticated)`) | layout + subscription owner | event-driven | `useAuth.ts:115-181` (Stage 2 subscribe) | exact |
| `components/features/auth/components/AuthProvider.tsx` | context provider + subscription owner | event-driven | `useAuth.ts:72-111` (Stage 1 subscribe) | exact |
| `components/features/auth/hooks/useAuth.ts` | hook (state machine) | event-driven | `useAuth.ts` (itself — removes 2 effects, keeps 7+) | in-place edit |
| `components/features/game-data/components/GameDataProvider.tsx` | context provider + 5× `useTable` | CRUD (reactive read) | `GameDataProvider.tsx:72-76` (itself) | in-place edit |
| `components/features/team-builder/LoadoutControls.tsx` | component | — | import path update only | in-place edit |
| `components/features/team-builder/LoadoutDropdown.tsx` | component | — | import path update only | in-place edit |
| `components/features/team-builder/SynergyDisplay.tsx` | component | — | import path update only | in-place edit |
| `components/features/team-builder/TeamRoster.tsx` | component | — | import path update only | in-place edit |
| `components/features/team-builder/Teamslot.tsx` | component | — | import path update only | in-place edit |
| `docs/auth/architecture.md` | documentation | — | in-place edit | in-place edit |
| `package.json` | dependency manifest | — | in-place edit (Next.js bump) | in-place edit |

### Route-group rename targets (git-mv only, no content change per D-29)

| From | To | Notes |
|------|----|----|
| `app/(landing-page)/` | `app/(public)/` | Commit 2 — URL-invisible rename |
| `app/(authenticated)/` | `app/(authed)/` | Commit 3 — URL-invisible rename |
| `app/(game)/draft/` | `app/(authed)/(match)/draft/` | Commit 4 — becomes authed (D-30) |

---

## Pattern Assignments

### `app/providers.tsx` (provider composition + SW register useEffect)

**Analog:** `app/providers.tsx` (itself, in-place edit) + `components/features/auth/hooks/useAuth.ts:72-111` (useEffect-with-guard pattern)

**Current imports block** (`app/providers.tsx:1-11`):
```typescript
'use client';

import { SessionProvider } from "next-auth/react";
import { useMemo } from 'react';
import { SpacetimeDBProvider } from 'spacetimedb/react';
import { DbConnection, ErrorContext } from '../src/module_bindings';
import { Identity } from 'spacetimedb';
import { SPACETIMEDB_HOST as HOST, SPACETIMEDB_DB_NAME as DB_NAME, SPACETIMEDB_TOKEN_KEY as TOKEN_KEY } from '@/lib/spacetimedb';
import { AuthProvider } from '@/components/features/auth/components/AuthProvider';
import { GameDataProvider } from '@/components/features/game-data/components/GameDataProvider';
import { HeroUIProvider } from '@heroui/system';
```

**Pattern: adding a `useEffect` inside `Providers`** — must add `useEffect` to React imports, mount effect after `connectionBuilder` memo, before `return`. Match the lightweight log style from `useAuth.ts:78` (bracketed `[SW]` tag per D-33).

**Provider tree nesting to preserve** (`app/providers.tsx:48-59`):
```typescript
return (
  <SessionProvider>
    <HeroUIProvider>
      <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
        <AuthProvider>
          <GameDataProvider>
            {children}
          </GameDataProvider>
        </AuthProvider>
      </SpacetimeDBProvider>
    </HeroUIProvider>
  </SessionProvider>
);
```

Phase 16 adds the SW register `useEffect` inside `Providers` (no new JSX children — the effect has no UI output, just `navigator.serviceWorker.register('/sw.js')` per RESEARCH Code Example §"Service Worker registration inside Providers").

---

### `components/features/auth/components/AuthProvider.tsx` (Stage 1 subscribe owner)

**Analog:** `components/features/auth/hooks/useAuth.ts:72-111` (Stage 1 effect — exact-pattern source)

**Current shape to extend** (`AuthProvider.tsx:1-21`):
```typescript
'use client';

import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

type AuthContextType = ReturnType<typeof useAuth>;
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const auth = useAuth();
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return ctx;
}
```

**Stage 1 subscribe pattern to port verbatim** (`useAuth.ts:72-111`):
```typescript
useEffect(() => {
    if (!isActive || stage1Ref.current) return;
    const conn = getConnection();
    if (!conn) return;
    stage1Ref.current = true;

    console.log('[useAuth] Stage 1 subscribing: view_my_profile (always-on, anon-safe)');
    conn.subscriptionBuilder()
        .onApplied(() => {
            console.log('[useAuth] Stage 1 onApplied: view_my_profile subscription active');
            setProfileReady(true);
            readProfileRef.current(conn);
        })
        .subscribe('SELECT * FROM view_my_profile');

    const isLiveChange = (ctx: any) => {
        const tag = ctx?.event?.tag;
        return tag === 'Reducer' || tag === 'Transaction';
    };

    const onViewProfileInsert = (ctx: any, row: any) => {
        if (!isLiveChange(ctx)) return;
        console.log(`[useAuth] view_my_profile.onInsert: id=${row?.id}`);
        readProfileRef.current(conn);
    };
    const onViewProfileUpdate = (ctx: any, oldRow: any, row: any) => {
        if (!isLiveChange(ctx)) return;
        console.log(`[useAuth] view_my_profile.onUpdate: id=${row?.id}`);
        readProfileRef.current(conn);
    };
    conn.db.view_my_profile.onInsert(onViewProfileInsert);
    conn.db.view_my_profile.onUpdate(onViewProfileUpdate);

    return () => {
        conn.db.view_my_profile.removeOnInsert(onViewProfileInsert);
        conn.db.view_my_profile.removeOnUpdate(onViewProfileUpdate);
        stage1Ref.current = false;
        setProfileReady(false);
    };
}, [isActive, getConnection]);
```

**Adaptation for AuthProvider:**
- Replace `[useAuth]` tag with `[AuthProvider]` per D-33.
- `subscribedRef` is the new name for `stage1Ref` per D-11 (consistent with D-11's "`subscribedRef` guard pattern").
- `setProfileReady` + `readProfileRef` live in `useAuth`; AuthProvider must coordinate via context (see RESEARCH Open Question 2 — planner picks: either expose `profileReady` setter through context, or the `useAuth` hook's existing `useEffect([isActive, profileReady, …])` at lines 284-292 observes the flip reactively).
- Strict Mode guard unchanged: `if (!isActive || subscribedRef.current) return;`

**Imports the new AuthProvider needs** (derived from `useAuth.ts` + new hooks):
```typescript
'use client';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useSpacetimeDB } from 'spacetimedb/react';
import { useAuth } from '../hooks/useAuth';
```

---

### `app/(authed)/layout.tsx` (Stage 2 User subscribe owner — renamed from `(authenticated)/layout.tsx`)

**Analog:** `components/features/auth/hooks/useAuth.ts:115-181` (Stage 2 effect — exact-pattern source) + `app/(authenticated)/layout.tsx` (current 10-LOC layout body)

**Current layout to extend** (`app/(authenticated)/layout.tsx:1-18`):
```typescript
'use client';

import React from 'react';
import AuthRequired from '@/components/features/auth/components/AuthRequired';
import DeletionBanner from '@/components/features/auth/components/DeletionBanner';
import styles from './layout.module.css';

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layout_wrapper}>
            <AuthRequired>
                <DeletionBanner />

                {children}
            </AuthRequired>
        </div>
    );
}
```

**Stage 2 subscribe pattern to port** (`useAuth.ts:115-181`):
```typescript
useEffect(() => {
    if (!isActive) {
        console.log('[useAuth] Stage 2 skip: connection not active');
        return;
    }
    // NOTE: Phase 16 REMOVES the stage2Gate ref check — route-group mount IS the gate now (D-07).
    if (stage2Ref.current) return;
    const conn = getConnection();
    if (!conn) return;
    stage2Ref.current = true;

    let cancelled = false;

    console.log('[useAuth] Stage 2 subscribing: SELECT * FROM user (gate opened via ${…})');
    conn.subscriptionBuilder()
        .onApplied(() => {
            if (cancelled) return;
            console.log('[useAuth] Stage 2 onApplied: User subscription active');
            if (currentUser) return; // dedupe — Stage 1 already resolved
            readProfileRef.current(conn);
        })
        .subscribe('SELECT * FROM user');

    const isLiveChange = (ctx: any) => {
        const tag = ctx?.event?.tag;
        return tag === 'Reducer' || tag === 'Transaction';
    };

    const onUserInsert = (ctx: any, row: any) => {
        if (!isLiveChange(ctx)) return;
        console.log(`[useAuth] User.onInsert: id=${row?.id} username=${row?.username}`);
        readProfileRef.current(conn);
    };
    const onUserUpdate = (ctx: any, oldRow: any, row: any) => {
        if (!isLiveChange(ctx)) return;
        console.log(`[useAuth] User.onUpdate: id=${row?.id} username=${row?.username} (was: ${oldRow?.username})`);
        readProfileRef.current(conn);
    };
    conn.db.User.onInsert(onUserInsert);
    conn.db.User.onUpdate(onUserUpdate);

    return () => {
        cancelled = true;
        conn.db.User.removeOnInsert(onUserInsert);
        conn.db.User.removeOnUpdate(onUserUpdate);
        stage2Ref.current = false;
    };
}, [isActive, /* NO stage2Gate dep */ getConnection]);
```

**Adaptation for `(authed)/layout.tsx`:**
- Replace `[useAuth]` tag with `[authedLayout]` per D-33.
- Drop the `stage2Gate` condition entirely — route-group mount replaces it (D-07 rationale: "route-group mount IS the gate"). Keep `!isActive` check.
- `readProfileRef` lives in `useAuth.ts`; layout cannot access it directly. Planner picks wiring per RESEARCH Open Question 2 — recommended path: layout calls `useAuthContext()` to pull a `triggerReadProfile()` callback OR use `useTable(tables.User)` per D-04 default (see RESEARCH Open Question 1 — `useTable` handles `onInsert`/`onUpdate` automatically).
- Preserve `AuthRequired` + `DeletionBanner` wrapper tree unchanged.
- Use `subscribedRef` (D-11 name convention).
- Existing CSS module import path stays `./layout.module.css` — file moves with the directory via `git mv` in Commit 3.

**Final composition:**
```typescript
'use client';
import React, { useEffect, useRef } from 'react';
import { useSpacetimeDB } from 'spacetimedb/react';
import AuthRequired from '@/components/features/auth/components/AuthRequired';
import DeletionBanner from '@/components/features/auth/components/DeletionBanner';
import styles from './layout.module.css';

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
    const { isActive, getConnection } = useSpacetimeDB();
    const subscribedRef = useRef(false); // D-11

    useEffect(() => { /* Stage 2 subscribe pattern above */ }, [isActive, getConnection]);

    return (
        <div className={styles.layout_wrapper}>
            <AuthRequired>
                <DeletionBanner />
                {children}
            </AuthRequired>
        </div>
    );
}
```

---

### `components/features/game-data/components/GameDataProvider.tsx` (2 new `useTable` calls)

**Analog:** `GameDataProvider.tsx:72-76` (itself — exact pattern for the 2 additions)

**Existing `useTable` block** (`GameDataProvider.tsx:71-76`):
```typescript
export function GameDataProvider({ children }: { children: React.ReactNode }) {
    const [characterRows] = useTable(tables.HsrCharacter);
    const [lightconeRows] = useTable(tables.HsrLightcone);
    const [characterCostRows] = useTable(tables.HsrCharacterCost);
    const [lightconeCostRows] = useTable(tables.HsrLightconeCost);
    const [synergyCostRows] = useTable(tables.HsrSynergyCost);
```

**Pattern to extend with** (D-02):
```typescript
    const [archetypeRows] = useTable(tables.Archetype);
    const [characterArchetypeRows] = useTable(tables.HsrCharacterArchetype);
```

**Context type addition pattern** (`GameDataProvider.tsx:55-67`):
```typescript
interface GameDataContextType {
    charactersData: Character[];
    lightconesData: Lightcone[];
    synergiesData: Synergy[];

    characters: HsrCharacterRow[];
    lightcones: HsrLightconeRow[];
    characterCosts: HsrCharacterCostRow[];
    lightconeCosts: HsrLightconeCostRow[];
    synergyCosts: HsrSynergyCostRow[];

    isReady: boolean;
}
```

Add two new fields (`archetypes: ArchetypeRow[]`, `characterArchetypes: HsrCharacterArchetypeRow[]`) plus their `Row` interfaces alongside the existing `HsrCharacterRow` / `HsrLightconeRow` declarations (lines 9-53) following the same plain-interface shape.

**Value object spread pattern** (`GameDataProvider.tsx:78-92`): follow `rows as unknown as XxxRow[]` casting — the project convention for bridging SpacetimeDB-generated types to local interfaces.

---

### `components/features/auth/hooks/useAuth.ts` (lose Stage 1 + Stage 2 effects only)

**Analog:** `useAuth.ts` itself (surgical removal — D-10)

**What to KEEP** (full list — none of these touch the two subscribe effects):
- Lines 1-37 — imports, `USER_ID_KEY`, `extractProfileSignature`
- Lines 38-67 — `useAuth()` opens, `currentUser` / `profileReady` / `guestLoginPending` state, refs including `hadSessionCookie` (D-09) and `hadUserIdOnMount` (D-09), `stage2Gate` can go away since nothing reads it post-refactor
- Lines 183-278 — `setResolvedUser`, `readProfileRef`, `readProfileFromConnection` (D-10)
- Lines 280-282 — `readProfileRef.current = readProfileFromConnection` sync line
- Lines 284-292 — `useEffect([isActive, profileReady, identity, …])` that re-reads profile on state change (critical — this is how Stage 1's `setProfileReady(true)` triggers the reader post-relocation)
- Lines 294-379 — Discord linking flow
- Lines 381-395 — Soft-delete detection
- Lines 397-407 — `guestLoginPending` clear-on-resolution effect
- Lines 409-424 — `isLinkingDiscord`, `isWaitingForData` composition, `authState`
- Lines 426-475 — `loginGuest`, `loginDiscord`, `logout`, `deleteGuestAccount`, return

**What to REMOVE:**
- Lines 69-111 (Stage 1 effect → moved to `AuthProvider`)
- Lines 113-181 (Stage 2 effect → moved to `(authed)/layout.tsx`)
- `stage1Ref` and `stage2Ref` declarations at lines 47-48 (dead refs post-removal)
- `stage2Gate` computation at line 67 if no remaining consumer (verify via grep — likely dead)
- Add one `console.log('[useAuth] subscription ownership delegated to AuthProvider + (authed)/layout.tsx')` at the top of `useAuth()` per D-33

---

### `middleware.ts` (new — no analog in repo)

**No direct analog.** Closest structural reference is an external pattern — use RESEARCH §"Code Examples §middleware.ts" verbatim (lines 740-765 of RESEARCH.md):

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

**Cookie-name source of truth:** `lib/session-cookie.ts:10` (`const COOKIE_NAME = 'stdb_session'`). Middleware string-literals the name; don't import from `lib/` (Edge Runtime compat — safer to keep middleware zero-dependency).

**D-33 logging:** bracketed `[middleware]` tag. Matches `useAuth.ts` style.

**Anti-patterns to avoid** (RESEARCH Pitfall 4, Code Examples "Anti-Patterns"):
- No negative-regex matcher (error-prone)
- No dynamic matcher strings (Next requires static constants)

---

### `public/sw.js` (new — no analog in repo)

**No direct analog.** Use RESEARCH §"Pattern 5 Service Worker scaffold" code verbatim (RESEARCH.md:469-514):

```javascript
// public/sw.js
const VERSION = 1;
const ASSET_CACHE = `hsrpvp-assets-v${VERSION}`;
const ALLOWED_HOSTS = ['ufs.sh', 'i.imgur.com']; // D-17

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

  // D-18: Never intercept app origin — ORDER MATTERS, this is the FIRST check
  if (url.origin === self.location.origin) return;

  // D-17: Only intercept allowlisted asset CDNs
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

**File placement:** `/public/sw.js` served at `/sw.js` → default root scope — RESEARCH Pattern 5 explicitly warns against "SW scope trick with `Service-Worker-Allowed` header" anti-pattern.

---

### `app/(authed)/(match)/layout.tsx` (new — empty passthrough per D-31)

**Analog:** `app/(landing-page)/layout.tsx` (role-match — simpler pattern; landing-layout is a full wrapper but the passthrough idea is the same).

**Per D-31 verbatim:**
```typescript
export default function MatchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

**No `'use client'` directive** — this is a Server Component passthrough, no client hooks needed. Phase 28 will extend this file with match-tier subscriptions (which will flip it to client via `'use client'` at that time).

---

### `components/globals/viewport/ViewportWriter.tsx` (new)

**Analog:** `components/features/auth/components/DeletionBanner.tsx` (role-match — single-purpose client component) + `lib/session-cookie.ts:13-19` (cookie-write pattern to mirror).

**Cookie write pattern from `lib/session-cookie.ts:13-19`:**
```typescript
const COOKIE_NAME = 'stdb_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setSessionCookie(displayName: string): void {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(displayName)}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}
```

**ViewportWriter parallel** (RESEARCH Code Example §"matchMedia-based viewport detection", RESEARCH.md:771-794):
```typescript
'use client';
import { useEffect } from 'react';

const COOKIE_NAME = 'vp';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year, FOUND-10

function writeCookie(vp: 'mobile' | 'desktop') {
  document.cookie = `${COOKIE_NAME}=${vp}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
  console.log(`[ViewportWriter] wrote vp=${vp}`);
}

export function ViewportWriter() {
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse) and (hover: none)');
    const evaluate = () => writeCookie(mq.matches ? 'mobile' : 'desktop');
    evaluate();
    mq.addEventListener('change', evaluate);
    return () => mq.removeEventListener('change', evaluate);
  }, []);

  return null; // no DOM output
}
```

**DeletionBanner null-render precedent** (`DeletionBanner.tsx:8`):
```typescript
if (!isDeleted) return null;
```
→ ViewportWriter similarly returns `null` unconditionally; cookie side effect is the entire job.

**D-33 logging:** `[ViewportWriter]` bracketed tag.

---

### `components/globals/viewport/ViewportGate.tsx` (new)

**Analog:** `components/features/auth/components/AuthRequired.tsx` (role-match — conditional render pattern with overlay vs children)

**AuthRequired's overlay-vs-children pattern** (`AuthRequired.tsx:22-57`):
```typescript
export default function AuthRequired({ children }: AuthRequiredProps) {
    const { isAuthenticated, isConnecting, isLoadingData, connectionError } = useAuthContext();

    return (
        <>
            {!isAuthenticated && (
                <div className={styles.overlay}>
                    {connectionError ? (…) : (isConnecting || isLoadingData) ? (
                        <div className={styles.overlay_content}>
                            <div className={styles.spinner}></div>
                            <p>Connecting to IPC Program...</p>
                        </div>
                    ) : (…)}
                </div>
            )}
            <div className={!isAuthenticated ? styles.hidden_content : undefined}>
                {children}
            </div>
        </>
    );
}
```

**ViewportGate adaptation** (RESEARCH.md:800-834 — dynamic sibling selection):
```typescript
'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, type ComponentType } from 'react';

interface Props<P> {
  desktop: () => Promise<{ default: ComponentType<P> }>;
  mobile?: () => Promise<{ default: ComponentType<P> }>;
  initialViewport?: 'desktop' | 'mobile'; // server-resolved from vp cookie
  componentProps: P;
  Skeleton: ComponentType;
}

export function ViewportGate<P>({
  desktop, mobile, initialViewport, componentProps, Skeleton,
}: Props<P>) {
  const [resolved, setResolved] = useState<'desktop' | 'mobile' | null>(initialViewport ?? null);

  useEffect(() => {
    if (!mobile) { setResolved('desktop'); return; }
    const mq = window.matchMedia('(pointer: coarse) and (hover: none)');
    const next = mq.matches ? 'mobile' : 'desktop';
    console.log(`[ViewportGate] matchMedia → ${next}`);
    setResolved(next);
  }, [mobile]);

  if (resolved === null) return <Skeleton />; // D-27 cookie-absent branch

  const loader = resolved === 'mobile' && mobile ? mobile : desktop;
  const Component = dynamic(loader, { ssr: false, loading: () => <Skeleton /> });
  return <Component {...componentProps} />;
}
```

**Pattern parallels with AuthRequired:**
- Both use conditional render: AuthRequired picks `overlay` vs `children`; ViewportGate picks `Skeleton` vs `<Component>`.
- Both keep children in React tree for subscription stability — ViewportGate's `next/dynamic` component IS the child, stable post-resolve.
- D-33 logging tag: `[ViewportGate]` (matches existing bracketed convention).

---

### `components/globals/viewport/SafariWarning.tsx` (new)

**Analog:** `components/features/auth/components/DeletionBanner.tsx` (exact match — conditional banner with inline-style render)

**DeletionBanner pattern to copy verbatim** (`DeletionBanner.tsx`):
```typescript
'use client';

import React from 'react';
import { useAuthContext } from './AuthProvider';

export default function DeletionBanner() {
    const { isDeleted } = useAuthContext();
    if (!isDeleted) return null;
    return (
        <div style={{
            background: '#dc2626',
            color: 'white',
            textAlign: 'center',
            padding: '12px 16px',
            fontWeight: 600,
            fontSize: '14px',
            zIndex: 1000,
        }}>
            Your account has been deleted by an administrator. You will be logged out shortly.
        </div>
    );
}
```

**SafariWarning adaptation:**
- Replace `useAuthContext().isDeleted` gate with `isSafari()` UA-sniff (RESEARCH.md:977-982).
- Add a dismissible state (per FOUND-08) — planner's discretion for persistence strategy (sessionStorage / localStorage / time-boxed).
- Inline-style approach matches D-25 (styling-tool-agnostic — no HeroUI, no Tailwind).
- Use amber/warning color (NOT red `#dc2626` — that's reserved for the critical DeletionBanner).
- D-33 logging: `[SafariWarning] mount / dismissal` bracketed tags.

**Safari UA detection from RESEARCH.md:977-982:**
```typescript
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|Chromium|Edg|Android/.test(ua);
}
```

---

### `lib/render-tier.ts` (new)

**Analog:** `lib/session-cookie.ts` (exact — pure util, browser-storage API, same file layout)

**`lib/session-cookie.ts` structural template:**
```typescript
/** Docstring explaining the purpose, including SSR safety + client/server split. */

const COOKIE_NAME = 'stdb_session';
const MAX_AGE = 60 * 60 * 24 * 30;

export function setSessionCookie(displayName: string): void { … }
export function clearSessionCookie(): void { … }
export function getSessionCookieClient(): string | null {
    if (typeof document === 'undefined') return null;
    …
}
export function getSessionCookieFromHeader(cookieHeader: string | null): string | null { … }
```

**Pattern to preserve:**
- File-level docstring at top explaining purpose + SSR safety
- Constants at module top (`COOKIE_NAME`, `MAX_AGE`)
- Always guard `typeof document/window/localStorage === 'undefined'` for SSR compat
- No React imports (D-21: "No React imports. Testable in isolation.")
- Named exports (not default) — matches `lib/session-cookie.ts` convention

**render-tier.ts structure** (from RESEARCH Pattern 6 + D-21):
```typescript
/** Pure render-tier detection utility. No React imports; SSR-safe. */

export const VERSION = 1; // bump to invalidate all caches
const CACHE_KEY = 'hsrpvp_render_tier_cache';
const OVERRIDE_KEY = 'hsrpvp_render_tier_override';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type RenderTier = 'full' | 'image-only';

interface CachedTier { tier: RenderTier; version: number; ts: number; }

function getCached(): CachedTier | null {
    if (typeof window === 'undefined') return null;
    try { /* …json parse, version check, ts check… */ } catch { return null; }
}

export function getRenderTier(): RenderTier { /* decision chain per RESEARCH.md:529-545 */ }
export function isSafari(): boolean { /* from RESEARCH.md:977-982 */ }
```

**D-33 logging:** `[renderTier]` bracketed tag. Log on cache hit/miss, Safari override, user override.

---

### `app/dev-unregister-sw/page.tsx` (new)

**Analog:** No direct analog. Closest: any existing `page.tsx` + `next/navigation` `notFound()` import.

**D-20 prod-gate pattern:**
```typescript
'use client';
import { notFound } from 'next/navigation';

export default function DevUnregisterSW() {
    if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_SW !== 'true') {
        notFound(); // returns 404
    }
    // Single button that iterates navigator.serviceWorker.getRegistrations() + caches.keys()
    // unregisters everything, then window.location.replace('/')
    …
}
```

**No UI framework dependency per D-25** — inline styles or a simple `<button>` suffice. Do NOT pull in HeroUI Button here.

---

### `components/features/team-builder/*.tsx` (5 files — import path update)

**Affected files (all 5 identical change):**
- `components/features/team-builder/LoadoutControls.tsx:4`
- `components/features/team-builder/LoadoutDropdown.tsx:4`
- `components/features/team-builder/SynergyDisplay.tsx:5`
- `components/features/team-builder/TeamRoster.tsx:4`
- `components/features/team-builder/Teamslot.tsx:4`

**Change pattern (each file has exactly one import line to update):**
```typescript
// BEFORE
import styles from "@/app/(landing-page)/teambuilder/page.module.css";

// AFTER (Commit 2 of D-29)
import styles from "@/app/(public)/teambuilder/page.module.css";
```

**When to change:** In Commit 2 of the D-29 sequence, right after `git mv app/(landing-page) app/(public)` — these imports will fail typecheck gate if left stale.

---

### `next.config.ts` (add typedRoutes)

**Analog:** `next.config.ts` (itself)

**Current shape to extend** (`next.config.ts:1-42`):
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [{ /* existing CSP block lines 9-35 */ }];
  },
};

export default nextConfig;
```

**Single-line addition per D-32 + RESEARCH Pitfall 1** (use top-level `typedRoutes`, NOT `experimental.typedRoutes` — project is on Next.js 15.5.12):
```typescript
const nextConfig: NextConfig = {
  typedRoutes: true, // ✓ top-level key; stable in 15.5+ per RESEARCH Pitfall 1
  async headers() { /* unchanged */ },
};
```

**CSP headers unchanged** — they restrict origins, not paths, so route-group rename has zero CSP impact.

---

### `docs/frontend/component-hygiene.md` (new)

**Analog:** `docs/auth/architecture.md` (role-match — feature-scoped markdown, sections + tables) + `docs/_templates/architecture-template.md` (template structure)

**`docs/auth/architecture.md` structural template to mirror:**
- Top H1 + `Last updated:` date
- H2 `## Overview` — 1-2 paragraph intro
- H2 sections with H3 sub-sections
- Code blocks for pattern examples
- Decision references inline (e.g., `D-08`, `Phase X execution`)

**Content per D-23:** 5 R8 rules with Good/Bad examples per rule:
1. Thin page files
2. Viewport-agnostic children
3. Responsive styling (reframed tool-agnostic per D-23)
4. State lives in hooks, not pages
5. Layout-agnostic component props

**Phase provenance:** Since this is a new file in a new directory, no "Phase History" table exists yet — create one at the bottom per CLAUDE.md convention:
```markdown
## Phase History
| Phase | Change | Date |
|-------|--------|------|
| 16 execution | Initial 5 R8 rules + Good/Bad examples | 2026-04-18 |
```

---

### `docs/auth/architecture.md` (update Subscription Lifecycle section)

**In-place edit — existing file.** No new structural pattern.

**Relevant existing section:** "Subscription Lifecycle" added in 15.5 per CONTEXT.md canonical_refs.

**Update per D-03 / D-07 / D-10:**
- Stage 1 owner changed: `useAuth.ts:72-111` → `AuthProvider.tsx`
- Stage 2 owner changed: `useAuth.ts:115-181` → `app/(authed)/layout.tsx`
- Privacy gate shifted: ref-based `stage2Gate` → route-group mount
- Append a `Phase 16 execution` row to the Phase History table (CLAUDE.md convention — tag so user can distinguish execution-sourced entries during `/gsd-verify-work`).

---

## Shared Patterns

### Strict Mode double-subscribe guard (D-11)

**Source:** `components/features/auth/hooks/useAuth.ts:47-48, 73, 76, 108-109, 124, 127, 178`

**Apply to:** `AuthProvider.tsx` and `app/(authed)/layout.tsx`

```typescript
// Ref declaration inside the component body
const subscribedRef = useRef(false); // D-11 Strict Mode double-mount defense

// Guard at effect top
useEffect(() => {
    if (!isActive || subscribedRef.current) return;
    const conn = getConnection();
    if (!conn) return;
    subscribedRef.current = true;
    // …subscribe work…

    return () => {
        // …cleanup…
        subscribedRef.current = false; // reset on unmount
    };
}, [isActive, getConnection]);
```

**Why:** React 18 Strict Mode intentionally mounts → unmounts → remounts every effect in dev. Without `subscribedRef`, duplicate `.subscribe()` calls burn energy and risk double-fire of `onApplied`. D-11 makes replication mandatory.

---

### Live-change filter helper (Pitfall 5)

**Source:** `components/features/auth/hooks/useAuth.ts:87-90, 156-159`

**Apply to:** `AuthProvider.tsx` (view_my_profile callbacks), `app/(authed)/layout.tsx` (User callbacks) — every insert/update callback that triggers `readProfileFromConnection`.

```typescript
const isLiveChange = (ctx: any) => {
    const tag = ctx?.event?.tag;
    return tag === 'Reducer' || tag === 'Transaction';
};

const onInsert = (ctx: any, row: any) => {
    if (!isLiveChange(ctx)) return; // skip SubscribeApplied events
    // …live handling…
};
```

**Why:** The SDK fires onInsert/onUpdate for EVERY row matching the initial subscription state, tagged `SubscribeApplied` — not a live change. Without this filter, `readProfileFromConnection` double-fires on mount.

---

### Bracketed-tag console logging (D-33)

**Source:** `components/features/auth/hooks/useAuth.ts` (pervasive — `[useAuth]` tags throughout)

**Apply to:** Every new file in Phase 16 at lifecycle-meaningful moments. No environment gating (per D-33).

**Tag map from D-33:**
| Source file | Tag |
|-------------|-----|
| `AuthProvider.tsx` | `[AuthProvider]` |
| `(authed)/layout.tsx` | `[authedLayout]` |
| `GameDataProvider.tsx` | `[GameDataProvider]` |
| `useAuth.ts` (updated) | `[useAuth]` |
| `ViewportGate.tsx` | `[ViewportGate]` |
| `ViewportWriter.tsx` | `[ViewportWriter]` |
| `render-tier.ts` | `[renderTier]` |
| `SafariWarning.tsx` | `[SafariWarning]` |
| `sw.js` | `[SW]` |
| `middleware.ts` | `[middleware]` |

**Pattern:**
```typescript
console.log('[TagName] human-readable message');
console.log(`[TagName] templated message: id=${value} other=${value2}`);
```

---

### SSR-safe guard for browser APIs

**Source:** `lib/session-cookie.ts:22-23` (`getSessionCookieClient`):
```typescript
export function getSessionCookieClient(): string | null {
    if (typeof document === 'undefined') return null;
    // …
}
```

**Apply to:** Every new file that reads `document`, `window`, `navigator`, `localStorage` at module/function scope:
- `lib/render-tier.ts` — `getCached()` guard
- `components/globals/viewport/ViewportWriter.tsx` — but here the guard is implicit via `useEffect` (runs only client-side, so no explicit `typeof window` check needed inside the effect body)
- `components/globals/viewport/ViewportGate.tsx` — same `useEffect` pattern
- `components/globals/viewport/SafariWarning.tsx` — when `isSafari()` is called outside an effect, guard required

**Pattern:**
```typescript
if (typeof window === 'undefined') return null;   // in utility functions
if (typeof document === 'undefined') return false; // in cookie readers
if (typeof navigator === 'undefined') return false; // in UA sniffers
```

---

### Path alias `@/` convention

**Source:** `tsconfig.json:25-28` + pervasive usage in `app/` and `components/`
```json
"paths": {
    "@/*": ["./*"]
}
```

**Apply to:** All new `components/globals/viewport/*.tsx` and `lib/render-tier.ts` consumers:
```typescript
import { ViewportGate } from '@/components/globals/viewport/ViewportGate';
import { getRenderTier } from '@/lib/render-tier';
```

The 5 team-builder fixes in Commit 2 are the direct evidence of this pattern — they update `@/app/(landing-page)/…` → `@/app/(public)/…`.

---

### `'use client'` boundary convention

**Source:** All existing `app/*/layout.tsx`, `components/features/*.tsx`, `components/globals/*.tsx` — every file with `useState`, `useEffect`, or event handlers has `'use client'` at the top.

**Apply to new files:**
| File | 'use client'? | Reason |
|------|---------------|--------|
| `middleware.ts` | no | Edge Runtime — not a Server/Client Component |
| `public/sw.js` | no | Raw JS, not React |
| `app/(authed)/(match)/layout.tsx` | no | Server Component passthrough (per D-31 shape) |
| `app/dev-unregister-sw/page.tsx` | yes | uses `navigator.serviceWorker`, `caches` |
| `components/globals/viewport/ViewportGate.tsx` | yes | `useState`, `useEffect`, `matchMedia` |
| `components/globals/viewport/ViewportWriter.tsx` | yes | `useEffect`, `document.cookie` |
| `components/globals/viewport/SafariWarning.tsx` | yes | `useState` for dismiss, `navigator.userAgent` |
| `lib/render-tier.ts` | no | Pure util, no React imports (D-21) |

---

## No Analog Found

Three files have no close analog in the existing codebase; the planner should use the corresponding RESEARCH.md pattern verbatim rather than searching further:

| File | Role | Data Flow | Reason | Fallback Source |
|------|------|-----------|--------|-----------------|
| `middleware.ts` | middleware (edge) | request-response | No middleware in repo yet — Phase 16 ships the first one | RESEARCH §Pattern 8 + Code Examples §middleware.ts (RESEARCH.md:740-765) |
| `public/sw.js` | service-worker | event-driven | No SW in repo yet — Phase 16 ships the first one | RESEARCH §Pattern 5 (RESEARCH.md:469-514) |
| `app/dev-unregister-sw/page.tsx` | page (dev utility) | request-response | No prod-gated dev page exists; no `notFound()` consumer in existing code | RESEARCH D-20 body (CONTEXT.md line 97) + Next.js `next/navigation` `notFound()` docs |

---

## Metadata

**Analog search scope:**
- `app/` (all route files, layouts, `providers.tsx`, `layout.tsx`)
- `components/features/auth/` (AuthProvider, AuthRequired, DeletionBanner, useAuth)
- `components/features/game-data/` (GameDataProvider)
- `components/features/admin-view/` (UserManager — existing `useTable(tables.User)` precedent)
- `components/features/team-builder/` (5 files with absolute-path imports)
- `components/globals/` (layout, modals, icons)
- `lib/` (session-cookie, spacetimedb)
- `docs/` (auth, _templates)
- `next.config.ts`, `package.json`, `tsconfig.json`

**Files scanned:** ~40 direct reads + ~10 greps

**Key patterns identified:**
- All SpacetimeDB table consumption goes through `useTable(tables.Foo)` (D-04 default, matched in `GameDataProvider` + `UserManager`)
- All subscriptions use `subscribedRef` Strict-Mode guard (D-11 — pattern from `useAuth.ts:47-48, 73, 108`)
- All browser-API readers guard `typeof window/document/navigator === 'undefined'` (`lib/session-cookie.ts:22`)
- All lifecycle logs use bracketed tags (`[useAuth]`, `[AuthProvider]`, …) per D-33
- All `lib/*.ts` utils are pure + named exports only (`session-cookie.ts` is the template)
- Conditional-banner components follow `DeletionBanner` inline-style + `if (!…) return null` pattern
- Overlay-with-alive-children pattern from `AuthRequired` is the precedent for `ViewportGate`'s Skeleton vs sibling render

**Pattern extraction date:** 2026-04-18
