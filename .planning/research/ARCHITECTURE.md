# Architecture Research — v0.9 Frontend Integration

**Domain:** Next.js 15 App Router frontend on top of shipped SpacetimeDB 2.1.0 backend (67 tables, 32 views, ~156 reducers)
**Researched:** 2026-04-12
**Confidence:** HIGH for App Router subscription placement and middleware patterns (verified against Next.js docs + v0.9 strategy doc); MEDIUM for dual-DOM recommendation (ecosystem has no dominant convention — decision is project-specific synthesis); MEDIUM for Service Worker gating (dev-mode handling well-understood, interaction with Next.js asset pipeline documented).

This research focuses exclusively on **architectural integration** for the v0.9 frontend milestone. It presumes the eight binding decisions in `notes/v09-frontend-subscription-strategy.md` are already committed (subscription placement per layer, three-tier asset delivery, layered canvas pedestal, `getRenderTier()`, self-scoped historical views, etc.). This document answers the integration questions that the strategy doc deliberately deferred to phase planning.

## System Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           Client (browser)                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐   │
│  │ Middleware (edge)                                                      │   │
│  │  cookie-presence short-circuit for (authed) matcher → /login?returnTo= │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│  ┌─────────────────────────────────┴─────────────────────────────────────┐   │
│  │ app/layout.tsx  (RootLayout)                                           │   │
│  │  ├─ <SafariWarning>   (client island, useEffect-gated)                 │   │
│  │  ├─ <ViewportGate>    (client island, emits 'desktop'|'mobile')        │   │
│  │  └─ <Providers>                                                        │   │
│  │        ├─ SessionProvider (NextAuth)                                   │   │
│  │        ├─ SpacetimeDBProvider                                          │   │
│  │        │    subs: view_my_profile + 6 public reference tables          │   │
│  │        ├─ AuthProvider / GameDataProvider (existing)                   │   │
│  │        └─ children                                                     │   │
│  └─────────────────────────┬─────────────────────────────────────────────┘   │
│                            │                                                 │
│     ┌──────────────────────┼──────────────────────┐                          │
│     │                      │                      │                          │
│  ┌──▼────────┐        ┌────▼─────┐         ┌──────▼──────┐                   │
│  │ (public)/ │        │ (authed)/│         │  middleware │                   │
│  │ layout    │        │ layout   │         │  (edge)     │                   │
│  │  portrait │        │ AuthReqd │         │  cookie gate│                   │
│  │  prefetch │        │ subs: full user,   └─────────────┘                   │
│  └───────────┘        │   calendar, social,                                  │
│                       │   achievements, stats                                │
│                       └────┬─────┘                                           │
│                            │                                                 │
│                       ┌────▼────────────┐                                    │
│                       │ (authed)/(match)│                                    │
│                       │ layout          │                                    │
│                       │  Spine prefetch │                                    │
│                       │  subs: lobby,   │                                    │
│                       │   tournament    │                                    │
│                       └────┬────────────┘                                    │
│                            │                                                 │
│                      ┌─────┴─────┐                                           │
│                      │ [id] page │  entity-scoped subs                       │
│                      └───────────┘                                           │
│                                                                              │
│  ┌──────────────────────────────┐    ┌──────────────────────────────┐        │
│  │ Service Worker (/public/sw.js)│   │ Web Worker                   │        │
│  │  Cache API, asset CDN only    │   │ (/workers/assetPreloader.ts) │        │
│  │  Prod-gated + env-var opt-in  │   │ fetch() warming on RIC pacing│        │
│  └──────────────────────────────┘    └──────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ WebSocket (wss://maincloud)
                                      ▼
                       SpacetimeDB (single source of truth)
                       67 tables · 32 views · ~156 reducers
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| Middleware (`middleware.ts`) | Cookie-presence short-circuit for `(authed)` paths; no trust boundary | Next.js edge runtime, `matcher` config, reads `stdb_session` cookie |
| `app/layout.tsx` | Root shell: NavBar, Safari banner, ViewportGate, Providers | Server component wrapping `Providers` client component |
| `Providers` (`app/providers.tsx`) | SpacetimeDB connection + global subscriptions (view_my_profile + 6 public ref tables) | Existing file, extended to own layer-0 subs |
| `(public)/layout.tsx` | Portrait SW prefetch trigger on mount | New thin layout, no subscriptions |
| `(authed)/layout.tsx` | `<AuthRequired>` gate + authed-tier subscriptions (moved from `useAuth.ts`) | New — owns `user`, `hsr_account`, calendar, social, achievements, stats, current mmr |
| `(authed)/(match)/layout.tsx` | Match-tier subs + `ensureSpinePrefetchStarted()` | New — owns lobby/tournament tables |
| Entity pages (`[id]/page.tsx`) | Parameterized WHERE subs scoped to single entity | New — page-level mount only |
| `ViewportGate` | Once-per-session viewport decision, emits to context | New — see Pattern 1 below |
| `lib/render-tier.ts` | `getRenderTier()` — Spine capability gate | New per Decision 7 |
| `public/sw.js` | Asset CDN cache interception | New per Decision 2 |
| `workers/assetPreloader.ts` | Background `fetch()` warming | New per Decision 2 |

## Recommended Project Structure

```
app/
├── layout.tsx                          # Root: NavBar + SafariWarning + ViewportGate + Providers
├── providers.tsx                       # Layer 0: STDB conn, view_my_profile, 6 public ref tables
│                                       # (EXISTING FILE — extend with ref table subs)
│
├── (public)/                           # RENAMED from (landing-page)
│   ├── layout.tsx                      # Portrait SW prefetch on mount
│   ├── page.tsx                        # Landing
│   ├── costs/page.tsx
│   └── teambuilder/page.tsx
│
└── (authed)/                           # RENAMED from (authenticated)
    ├── layout.tsx                      # <AuthRequired> + authed-tier subs
    ├── profile/
    │   ├── page.tsx                    # Own profile + view_my_* historical subs
    │   └── [userId]/page.tsx           # Cross-user (public-data-only, optional v0.9)
    ├── schedule/page.tsx
    ├── admin-view/...                  # Moved under (authed)
    │
    └── (match)/                        # NESTED inside (authed), name mirrors match_session
        ├── layout.tsx                  # Spine prefetch + match-tier subs
        ├── lobbies/page.tsx            # MOVED+RENAMED from (authenticated)/lobby/page.tsx
        ├── lobby/[id]/page.tsx         # NEW: entity page
        └── draft/[matchId]/page.tsx    # MOVED from (game)/draft/

components/
├── features/
│   ├── auth/
│   │   ├── AuthProvider.tsx            # EXISTING
│   │   └── AuthRequired.tsx            # EXISTING — kept as fallback to middleware
│   ├── browser-warning/
│   │   └── SafariWarning.tsx           # NEW per Decision 7
│   ├── viewport/
│   │   ├── ViewportProvider.tsx        # NEW — context for 'desktop' | 'mobile'
│   │   └── useViewport.ts              # NEW — consumer hook
│   ├── pedestal/                       # NEW — layered canvas Spine component
│   └── game-data/                      # EXISTING
└── globals/                            # EXISTING

lib/
├── spacetimedb.ts                      # EXISTING
├── session-cookie.ts                   # EXISTING — display-only, orthogonal to auth
├── useAuth.ts                          # EXISTING — TRIM to view_my_profile only; user moves out
├── render-tier.ts                      # NEW — getRenderTier() per Decision 7
└── viewport.ts                         # NEW — detectViewport() primitive

public/
└── sw.js                               # NEW — Service Worker, asset CDN only

workers/
└── assetPreloader.ts                   # NEW — Web Worker prefetch

middleware.ts                           # NEW — cookie-presence gate at project root
```

### Structure Rationale

- **Route groups mirror subscription lifetime:** Layout unmount semantics are the free-lunch primitive for subscription teardown. Nesting `(match)` under `(authed)` means navigating `/profile` → `/lobbies` unmounts nothing shared; navigating `/draft/20` → `/profile` drops match subs automatically.
- **`workers/` at project root (not `public/`):** Web Workers are bundled through Next.js so they pick up transpilation. `public/` is reserved for the Service Worker which must live at a stable origin-scoped path for registration.
- **`useAuth.ts` trimmed, not deleted:** `view_my_profile` must remain here because it is the bootstrap subscription — the client needs it to determine whether it's authenticated before any other layer can decide what to subscribe.
- **`middleware.ts` at project root:** Mandatory Next.js convention. Matcher config scopes it to `(authed)` paths.

## Architectural Patterns

### Pattern 1: Dual-DOM via Once-Per-Session ViewportGate + Dynamic Import

**What:** A single top-level `<ViewportGate>` performs one viewport detection at first client render, writes the result to context + cookie, and synchronously selects which of two lazily-loaded view components to render. Only one DOM tree is ever produced per session.

**When to use:** When desktop and mobile UIs diverge significantly enough that CSS-only responsive design produces unacceptable bloat (which is the case here — "only ONE rendered at a time").

**Why not the alternatives:**

| Alternative | Verdict | Reasoning |
|-------------|---------|-----------|
| **Parallel route groups** `(desktop)/` and `(mobile)/` | Rejected | Route groups don't affect URLs and don't branch per-viewport. Next.js parallel routes (`@slot`) are orthogonal — they render slots side-by-side into the same layout, not either-or. [No viewport-based routing exists in App Router.](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes) |
| **Middleware UA-sniff + rewrite** to `/mobile/...` vs `/desktop/...` | Rejected | UA parsing is unreliable (iPad desktop mode, spoofing), rewrites double the route surface, and shared state across viewports gets awkward. Middleware cookie-check (Pattern 3) is already load-bearing; adding viewport rewrite couples two concerns. |
| **Single `page.tsx` imports both `<DesktopView>` + `<MobileView>`, CSS-toggles** | Rejected | Ships both DOM trees, both JS bundles, both hydration passes. The v0.9 strategy explicitly states "only ONE rendered at a time (conditional, not CSS-toggle)". |
| **Parallel routes with `default.tsx` fallback trick** | Rejected | Works for modals (parallel slots interacting with intercepting routes) but not for whole-page alternatives — both slots still mount. |
| **Colocated `desktop.tsx` + `mobile.tsx` files imported by `page.tsx`** | Alternative to primary | Same structural idea as Pattern 1 but without code-splitting by default. Use this shape when desktop/mobile implementations are <5 KB apart and dynamic import is overkill. |

**Trade-offs of Pattern 1:**
- Pro: Single DOM tree, single hydration, bundle-split between viewports (desktop users never download mobile code, and vice versa).
- Pro: Interaction-media detection (`(pointer: coarse) and (hover: none)`) is more reliable than UA sniffing or width-based breakpoints. ([source](https://webup.org/blog/react-device-based-code-split/))
- Con: No server-rendered mobile markup on first paint for first-time visitors — SSR emits a placeholder that resolves post-hydration. Acceptable because the landing page is the only route where SEO matters and its mobile/desktop divergence is smaller.
- Con: A resize from desktop to mobile mid-session does not swap DOM. v0.9 target users are on one device per session; this is acceptable.

**Viewport cookie for SSR hint:** Write viewport decision to a `vp` cookie on first resolution. On subsequent SSR, middleware (or layout.tsx via `cookies()`) reads the cookie and passes viewport to the server-rendered `<ViewportGate>`, which emits the correct DOM on first paint. First-ever visit gets the post-hydration swap; returning visitors get correct SSR.

**Example sketch** (implementation detail for Phase 16):

```tsx
// components/features/viewport/ViewportProvider.tsx
'use client';
const ViewportContext = createContext<'desktop' | 'mobile' | null>(null);

export function ViewportProvider({
  initial,   // from cookie on server (or null on first visit)
  children,
}: { initial: 'desktop' | 'mobile' | null; children: ReactNode }) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile' | null>(initial);

  useEffect(() => {
    if (viewport) return;   // SSR cookie hit — already correct
    const mq = window.matchMedia('(pointer: coarse) and (hover: none)');
    const resolved = mq.matches ? 'mobile' : 'desktop';
    document.cookie = `vp=${resolved}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setViewport(resolved);
  }, [viewport]);

  return <ViewportContext.Provider value={viewport}>{children}</ViewportContext.Provider>;
}
```

```tsx
// Any page using dual DOM:
const DesktopCostTable = dynamic(() => import('./cost-table.desktop'), { ssr: false });
const MobileCostTable  = dynamic(() => import('./cost-table.mobile'),  { ssr: false });

export default function CostsPage() {
  const vp = useViewport();
  if (!vp) return <CostTableSkeleton />;
  return vp === 'desktop' ? <DesktopCostTable /> : <MobileCostTable />;
}
```

### Pattern 2: Subscription Lifetime Equals Layout Mount Lifetime

**What:** Each SpacetimeDB subscription is declared in a `useEffect` in the highest layout shared by all its consumers. The effect's cleanup function drops the subscription. Next.js App Router only unmounts layouts when navigating *outside* their scope, so subscriptions survive sibling navigation automatically.

**When to use:** Any subscription owned by more than one page. Page-level `useEffect` subscriptions remain correct for entity-scoped queries (`lobby/[id]`, `draft/[matchId]`).

**React Strict Mode interaction (verified):**

Since Next.js 13.5.1, Strict Mode is on by default in App Router dev builds. In Strict Mode, React mounts the component, simulates effects being destroyed, then re-creates them — meaning every subscription effect runs mount→cleanup→mount in dev. ([source](https://react.dev/reference/react/StrictMode))

The pattern survives this stress-test *if and only if* the cleanup function is strictly symmetric with the setup. For SpacetimeDB subscriptions, that means:

```typescript
// (authed)/layout.tsx — correct pattern
useEffect(() => {
  const handle = conn.subscriptionBuilder()
    .subscribe(['SELECT * FROM user', 'SELECT * FROM hsr_account', ...]);
  return () => handle.unsubscribe();
}, [conn]);
```

The double-mount in dev produces subscribe → unsubscribe → subscribe. Because the second subscribe happens after the first unsubscribe completed, there is no duplicate subscription on the wire. Production builds do not double-invoke, so this is purely a dev-time correctness check.

**Anti-pattern — subscription in a page component when it should be in a layout:**

```typescript
// BAD: lobby page owning a subscription that the match layout should own
// app/(authed)/(match)/lobbies/page.tsx
useEffect(() => {
  const handle = conn.subscriptionBuilder().subscribe(['SELECT * FROM lobby']);
  return () => handle.unsubscribe();
}, []);
```

This unsubscribes and resubscribes every time the user navigates `/lobbies` → `/lobby/5` → `/lobbies`, causing unnecessary bandwidth (`lobby` is a match-tier subscription and should live at `(match)/layout.tsx` per Decision 6).

**Trade-off:** The "highest shared layout" rule requires discipline at review time — it is easy to drop a subscription into a page when adding a new consumer forces promotion. Mitigation: phase reviews should grep for `subscriptionBuilder()` and enforce placement against the Decision 6 map.

### Pattern 3: Middleware Cookie-Presence Gate (UX, Not Trust)

**What:** Next.js middleware with a `matcher` scoped to `(authed)` paths checks for presence of `stdb_session` (or NextAuth session cookie). Missing cookie → redirect to `/login?returnTo=<pathname>`. Present cookie → let through; `<AuthRequired>` does full verification.

**Why hybrid, not middleware-only:** The `stdb_session` cookie is not signed and does not encode identity — it holds display name for SSR-safe NavBar hydration. It is a presence indicator, nothing more. Real auth is the SpacetimeDB token in `localStorage` + the `view_my_profile` subscription returning a row. Middleware cannot read `localStorage` and cannot execute the WebSocket handshake. Therefore:

- **Middleware** is a UX optimization that prevents a shared-link arrival from an unauthed visitor from downloading the entire authed bundle before `<AuthRequired>` bounces them.
- **`<AuthRequired>`** is the actual auth gate. It waits for the SpacetimeDB connection + `view_my_profile` row. It handles the cases middleware cannot: stale cookie without token, cleared localStorage, revoked identity, ban.
- **SpacetimeDB server-side RLS views** are the security boundary. Middleware and `<AuthRequired>` are purely UX.

**Matcher configuration example:**

```typescript
// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const hasSession = req.cookies.has('stdb_session');
  if (!hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/';  // landing doubles as login
    url.searchParams.set('returnTo', req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all authed routes but skip Next.js internals and static files
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|workers).*)',
    // In practice scope tighter to just (authed) shape:
    // '/profile/:path*', '/schedule/:path*', '/admin-view/:path*',
    // '/lobbies/:path*', '/lobby/:path*', '/draft/:path*',
  ],
};
```

Recommendation: **use explicit positive matchers for each authed path**, not a negative lookahead, because authed paths are a closed set and positive matchers avoid accidentally gating the landing page.

**Security note:** [CVE-2025-29927](https://nextjs.org/docs/messages/middleware-upgrade-guide) (disclosed March 2025, patched in 15.2.3+) allowed middleware to be bypassed on self-hosted deployments. Project uses `next: ^15.0.0` which must be bumped to ≥15.2.3 before shipping middleware auth. Also: middleware is a UX shortcut, not a trust boundary — SpacetimeDB RLS remains the authority.

### Pattern 4: Service Worker — Production-Gated, Origin-Scoped to CDN Hostnames

**What:** `public/sw.js` is registered client-side only when `NODE_ENV === 'production'` or `NEXT_PUBLIC_ENABLE_SW === 'true'`. The SW's `fetch` listener short-circuits everything except requests to the asset CDN hostnames (UploadThing `ufs.sh`). App origin requests pass through untouched.

**Why dev-gated:** `next dev` with HMR relies on repeated fetches to `/_next/*` chunks. A misconfigured SW that caches app-origin responses breaks HMR and produces "stale bundle" bugs that are hard to debug. The v0.9 strategy's gate (`NODE_ENV === 'production' || NEXT_PUBLIC_ENABLE_SW === 'true'`) eliminates this risk by default. ([Next.js PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps))

**Why origin-scoped matters (defense in depth):** Even if someone forgets the production gate, the SW's fetch listener's hostname filter means only `ufs.sh` requests are intercepted. App origin HMR stays untouched. This is the belt-and-suspenders design from Decision 2.

**Registration site:** `app/layout.tsx` (client component wrapper) or a dedicated `<ServiceWorkerRegistrar />` client island:

```typescript
'use client';
useEffect(() => {
  const enabled =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_ENABLE_SW === 'true';
  if (!enabled) return;
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
}, []);
```

**Middleware matcher must exclude `/sw.js`** — otherwise middleware intercepts the SW script request and either authenticates it (wrong) or applies non-SW headers that break installation. See Pattern 3's matcher for the `sw.js` exclusion.

**CSP interaction:** Current `next.config.ts` CSP allows `connect-src 'self' wss://maincloud.spacetimedb.com ...`. Adding UploadThing requires extending `img-src` (already permissive `https:`) and `connect-src` with the UploadThing host. The SW itself runs under `'self'` so no CSP addition is needed for the SW script.

### Pattern 5: WebGL Pedestal Lifecycle — `useLayoutEffect` for RAF, Explicit Context-Loss Handlers

**What:** The Spine pedestal component owns the WebGL context, Spine runtime, and render loop. Cleanup must be synchronous with unmount to avoid double-context allocation across rapid navigation or Strict Mode.

**React 18/19 pattern:**

- Use `useLayoutEffect` (not `useEffect`) to schedule the RAF, because a new animation frame can be requested before `useEffect`'s cleanup runs — the cleanup is not synchronous. ([source](https://blog.jakuba.net/request-animation-frame-and-use-effect-vs-use-layout-effect/))
- Store the RAF id and Spine renderer in `useRef`, not state — state updates would re-render and cause re-initialization.
- Cleanup order: `cancelAnimationFrame(rafId)` → `spine.dispose()` → `assetManager.removeAll()` → `gl.getExtension('WEBGL_lose_context')?.loseContext()`.

**WebGL context loss handlers:** Per [MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event) and [Khronos wiki](https://www.khronos.org/webgl/wiki/HandlingContextLost):

- `webglcontextlost` handler must call `event.preventDefault()` — otherwise the context will not be restored.
- After `webglcontextrestored`, all textures/buffers/shaders must be re-created; none of the pre-loss resources are valid. This is aligned with the Decision 3 lifecycle table (re-init Spine on the canvas, fade back in).

**Strict Mode interaction:** The pedestal will mount→cleanup→mount in dev. The cleanup path must be idempotent (`spine?.dispose()` not `spine.dispose()`) and the mount path must tolerate a freshly-disposed canvas. Testing this in dev catches production context-leak bugs that would otherwise only show after hundreds of draft transitions.

### Pattern 6: `stdb_session` / NextAuth / STDB token separation of concerns

| Artifact | Purpose | Storage | Touched by |
|----------|---------|---------|------------|
| `stdb_session` cookie | SSR-safe NavBar display name | Cookie (non-httpOnly, non-sensitive) | `lib/session-cookie.ts`, middleware read-only |
| NextAuth session cookie | Discord OAuth session | Cookie (httpOnly, NextAuth-managed) | `SessionProvider`, NextAuth API routes |
| SpacetimeDB token | Actual subscription authorization | `localStorage` under `SPACETIMEDB_TOKEN_KEY` | `providers.tsx` on connect |

These three are orthogonal. No integration work required. The one touchpoint:
- **Sign-out flow** must clear all three: `clearSessionCookie()` + NextAuth `signOut()` + `localStorage.removeItem(TOKEN_KEY)` + disconnect STDB connection.
- **Middleware only reads `stdb_session`**, not NextAuth, not localStorage. This keeps middleware cheap and edge-compatible (NextAuth's cookie requires session verification which is slower; localStorage is not accessible in edge runtime).

## Data Flow

### Subscription Bootstrap (first paint after load)

```
Browser loads app
    ↓
layout.tsx mounts → Providers mounts
    ↓
SpacetimeDB connects (withToken from localStorage)
    ↓
onConnect fires → Providers subscribes to:
    - view_my_profile (returns 0 rows if anon, 1 row if authed)
    - 6 public reference tables
    ↓
useAuth reads view_my_profile → decides AuthRequired outcome
    ↓
(if authed) (authed)/layout.tsx mounts → subs: user, hsr_account, etc.
    ↓
(if /lobbies/*) (match)/layout.tsx mounts → subs: lobby, tournament, etc.
    ↓
Page mounts → entity-scoped subs
```

### Navigation teardown (authed user `/draft/20` → `/profile`)

```
router.push('/profile')
    ↓
/draft/20 page unmounts → entity subs drop
    ↓
(match) layout unmounts (sibling leaves (match) scope)
    ↓
match-tier subs drop (lobby, tournament, ...)
    ↓
(authed) layout stays mounted — no re-subscription cost
    ↓
/profile page mounts → view_my_* historical subs (Decision 8)
```

### Logout flow (full teardown)

```
User clicks "Sign out"
    ↓
clearSessionCookie() + NextAuth signOut() + localStorage.removeItem(token)
    ↓
router.push('/')
    ↓
(authed) layout unmounts (user navigated outside (authed) scope)
    ↓
All authed-tier subs drop
    ↓
middleware blocks future /profile etc. requests (no cookie)
    ↓
STDB connection drops/reconnects anonymously
```

## Order of Build — Safe Migration Sequence

The v0.5 frontend has a live `(landing-page)` group. Migration must not break it. Phase 16's scope recommendation:

| Order | Step | Why this order |
|-------|------|----------------|
| 1 | Rename `(landing-page)` → `(public)`, `(authenticated)` → `(authed)` in parallel; update every `<Link>` and `router.push()` | Pure structural rename. Enable Next.js typed routes in `next.config.ts` first if not already — typed routes catch stale `<Link>` paths at build time. |
| 2 | Collapse `(game)/draft/[matchId]` into `(authed)/(match)/draft/[matchId]`; move `(authenticated)/lobby/page.tsx` into `(authed)/(match)/lobbies/page.tsx` | Nesting requires step 1 first so the parent groups exist with correct names. |
| 3 | Move `user` subscription from `useAuth.ts` to `(authed)/layout.tsx` | Requires step 1: `(authed)/layout.tsx` must exist with correct path. Regression-test every auth flow: guest login, Discord link, logout, reconnection, deletion. |
| 4 | Add middleware cookie-presence gate | Requires step 1 so matchers target `(authed)` paths. Bump Next.js to ≥15.2.3 first for CVE-2025-29927. |
| 5 | Add `ViewportGate` + `render-tier.ts` + `SafariWarning` as foundational primitives | Independent of routing. Can run parallel with step 4. |
| 6 | Add Service Worker + Web Worker scaffolding (no prefetch logic yet) | Independent of routing; env-var gated so it's safe to land without active use. |
| 7 | Wire `(public)/layout.tsx` portrait prefetch trigger | Consumes step 6 primitives. |
| 8 | Wire `(match)/layout.tsx` Spine prefetch trigger | Consumes step 6 + step 5's `getRenderTier()`. |

**What breaks and how to catch it:**

- **Stale `<Link href="/authenticated/..."`** → build-time error if typed routes are enabled; otherwise runtime 404. Mitigation: enable `experimental.typedRoutes` in `next.config.ts` before migration; run a full E2E smoke pass of every navigation touchpoint.
- **Subscription in `useAuth.ts` moved to layout, but consumers still import from `useAuth`** → runtime "undefined data" errors. Mitigation: audit all consumers of `useAuth` during step 3; migrate imports atomically.
- **Middleware matches too broadly and blocks the landing page** → infinite redirect loop. Mitigation: positive-matcher pattern (Pattern 3) with explicit authed paths only. Test with Vercel preview deploy (authenticated + anon user) before production.
- **Service Worker accidentally caches app origin** → stale HMR in dev, stale bundle in prod. Mitigation: origin-filter in SW fetch listener (Decision 2), production-gate in registration, exclude `/sw.js` from middleware matcher, smoke-test on preview deploy before shipping per Open Question #4.
- **React Strict Mode double-mount causes phantom subscriptions** → visible as log spam "subscribed x2" / "unsubscribed x2". Mitigation: every subscription effect MUST have symmetric cleanup. Test locally with Strict Mode (on by default) and verify handle counts match.

## Scaling Considerations

Target scale per PROJECT.md: ~5,000 users, ~100 concurrent. The architecture is sized for this; scaling beyond requires:

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–5k users (launch target) | As designed — full `user` table at `(authed)/layout.tsx`, historical tables profile-scoped via self-views |
| 5k–50k users | Full `user` replication becomes ~7.5 MB per client — promote to on-demand or paginated view. Calendar/availability need pagination. STDB energy budget needs paid plan. |
| 50k+ users | Subscription architecture itself stops being viable for cross-user data. Move to request/response for profile lookups; keep subscriptions only for live match/lobby data. Major rework. |

### First bottleneck at target scale

Per `tools/energy-model.js` (to be re-run with updated Decision 6 assumptions before launch): egress via STDB subscription is the likely ceiling. Specifically, the full `user` table mounted at every authed client. At 5k users × ~150 bytes/row = ~750 KB per client per session; at 100 concurrent with modest profile edit churn this stays under the 102,500 energy/month ceiling.

## Anti-Patterns

### Anti-Pattern 1: Subscribing in Page Components for Layout-Owned Data

**What people do:** Subscribe to `lobby` in `lobby/[id]/page.tsx` instead of `(match)/layout.tsx`.

**Why it's wrong:** Unsubscribes and resubscribes on every sibling navigation (`/lobbies` → `/lobby/5` → `/lobby/6`). Wastes bandwidth, creates loading flashes, defeats the entire Decision 6 placement strategy.

**Do this instead:** Declare subscriptions at the highest layout shared by all consumers. Entity pages subscribe ONLY to queries scoped to the specific entity (e.g. `match_session_step WHERE matchId = $1`).

### Anti-Pattern 2: CSS-Only Responsive for Major UI Divergence

**What people do:** Ship both desktop and mobile markup, toggle with `hidden md:grid` Tailwind utilities.

**Why it's wrong:** Both DOM trees serialize, both component trees hydrate, both client bundles load. For the v0.9 target of "significantly different desktop vs mobile UIs" this is the dominant page-weight tax.

**Do this instead:** ViewportGate pattern. Dynamic import the chosen view. One DOM tree, one hydration path.

### Anti-Pattern 3: Middleware as Trust Boundary

**What people do:** Treat middleware auth check as the actual access control; skip server-side verification.

**Why it's wrong:** Middleware runs on the edge and can be bypassed (see CVE-2025-29927). Cookies are client-controlled. The SpacetimeDB token is in localStorage which middleware cannot read.

**Do this instead:** Middleware = UX convenience that short-circuits definitely-unauthed visitors. `<AuthRequired>` = real client-side check tied to `view_my_profile`. SpacetimeDB RLS views + `ctx.sender` checks in reducers = actual security boundary.

### Anti-Pattern 4: `useEffect` RAF without `useLayoutEffect`

**What people do:** Schedule the Spine render loop in `useEffect`.

**Why it's wrong:** A new animation frame can be requested before `useEffect`'s cleanup runs; the cleanup is not synchronous. This leaks an RAF callback per unmount, compounding across rapid navigation.

**Do this instead:** `useLayoutEffect` for RAF setup, ref-stored RAF id, symmetric `cancelAnimationFrame` in cleanup. ([source](https://blog.jakuba.net/request-animation-frame-and-use-effect-vs-use-layout-effect/))

### Anti-Pattern 5: Service Worker Registered in Dev by Default

**What people do:** Register the SW unconditionally in `app/layout.tsx`.

**Why it's wrong:** Breaks HMR, produces stale-bundle bugs, confuses team members debugging in dev.

**Do this instead:** Gate registration behind `NODE_ENV === 'production' || NEXT_PUBLIC_ENABLE_SW === 'true'`. Belt-and-suspenders: SW fetch listener filters by hostname so even an accidental registration only intercepts CDN URLs.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| SpacetimeDB (maincloud) | WebSocket via `SpacetimeDBProvider` in `app/providers.tsx` | Single data plane; token persisted in localStorage |
| NextAuth (Discord) | `SessionProvider` wrapping tree; OAuth handled via `/api/auth/*` routes | Provides display/avatar. Identity binding to STDB user is a reducer call post-OAuth. |
| UploadThing CDN (`ufs.sh`) | Direct `<img src>` + `fetch()` from Web Worker, intercepted by SW | Add to CSP `connect-src` + `img-src`. Cache-Control immutable headers expected. |
| Imgur | Direct link to user-uploaded match screenshots | Unchanged from v0.5 backend contract. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Middleware ↔ App | `stdb_session` cookie presence check, `returnTo` search param on redirect | Middleware never reads NextAuth cookie or localStorage |
| `useAuth.ts` ↔ `(authed)/layout.tsx` | `view_my_profile` stays in `useAuth`; `user` + all authed-tier subs move to layout | Phase 16 migration — careful regression test |
| `ViewportGate` ↔ Pages | React context `useViewport()` hook; SSR hint via `vp` cookie | Initial cookie-less visit renders skeleton then swaps; returning visitors get correct SSR |
| `getRenderTier()` ↔ Match layout / Pedestal | Direct function call; result cached in localStorage | Never called on every render — see Decision 7 |
| Service Worker ↔ Web Worker | Indirect via Cache API — Web Worker `fetch()` goes through SW interception | Web Worker cannot intercept `<img>`, only SW can |
| `<AuthRequired>` ↔ Middleware | Middleware short-circuits clearly-unauthed; `<AuthRequired>` handles edge cases middleware can't see | Belt-and-suspenders, not redundancy |

## Open Integration Items for Phase 16

1. **Viewport SSR hint cookie name and lifetime** — recommend `vp` name, 1-year max-age, `SameSite=Lax`. Phase decides.
2. **Typed routes enablement** — recommend turning on `experimental.typedRoutes` BEFORE step 1 of the migration order to catch stale link paths. Phase confirms.
3. **Next.js version bump to ≥15.2.3** (CVE-2025-29927) — required before middleware ships. Currently on `^15.0.0` which could resolve to vulnerable 15.0.x.
4. **ViewportGate SSR-first-visit UX** — skeleton vs. desktop-default vs. mobile-default? Recommend desktop-default on server render (matches majority of first visits), post-hydration swap for mobile users. Phase decides.
5. **Middleware matcher shape** — positive list of authed paths vs negative lookahead on public paths. Recommend positive list for explicitness. Phase decides.

## Sources

- [Next.js App Router documentation](https://nextjs.org/docs/app) — route groups, layouts, parallel routes semantics
- [Next.js Parallel Routes reference](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes) — confirms slots are orthogonal to viewport selection
- [Next.js Middleware reference](https://nextjs.org/docs/15/pages/api-reference/file-conventions/middleware) — matcher syntax, cookie access
- [Next.js Middleware Upgrade Guide — CVE-2025-29927](https://nextjs.org/docs/messages/middleware-upgrade-guide) — patched in 15.2.3+
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) — SW registration patterns
- [Next.js Lazy Loading](https://nextjs.org/docs/app/guides/lazy-loading) — dynamic imports with `ssr: false`
- [React StrictMode docs](https://react.dev/reference/react/StrictMode) — double-mount semantics
- [MDN: HTMLCanvasElement webglcontextlost event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/webglcontextlost_event)
- [Khronos HandlingContextLost wiki](https://www.khronos.org/webgl/wiki/HandlingContextLost)
- [RequestAnimationFrame and useLayoutEffect — Jakub Arnold](https://blog.jakuba.net/request-animation-frame-and-use-effect-vs-use-layout-effect/)
- [React device-based code split — webup.org](https://webup.org/blog/react-device-based-code-split/) — `(pointer: coarse) and (hover: none)` detection
- [GitHub discussion: separate mobile/desktop bundles in Next.js](https://github.com/vercel/next.js/discussions/29391) — no official Vercel recommendation exists; community has not converged
- `notes/v09-frontend-subscription-strategy.md` — the eight binding decisions this integration layer sits on top of
- `.planning/PROJECT.md` — v0.9 milestone scope

---
*Architecture research for: v0.9 Frontend milestone integration*
*Researched: 2026-04-12*
