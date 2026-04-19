---
phase: 16-route-global-foundation
plan: 05
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/render-tier.ts
  - components/globals/viewport/ViewportWriter.tsx
  - components/globals/viewport/ViewportGate.tsx
  - components/globals/viewport/SafariWarning.tsx
  - app/layout.tsx
autonomous: true
requirements: [FOUND-08, FOUND-09, FOUND-10, FOUND-11, FOUND-12]

must_haves:
  truths:
    - "lib/render-tier.ts exists as a pure util with NO React imports (D-21)"
    - "getRenderTier() returns 'full' | 'image-only' based on Safari sniff + WebGL/core-count probe + localStorage override + 7-day TTL cache"
    - "VERSION constant exists at module top and is the sole cache-invalidation lever"
    - "components/globals/viewport/ViewportWriter.tsx writes vp=desktop|mobile cookie with 1-year max-age + SameSite=Lax (FOUND-10)"
    - "ViewportWriter uses matchMedia('(pointer: coarse) and (hover: none)') and re-evaluates on change event (FOUND-10)"
    - "ViewportWriter returns null (no DOM output); side-effect only (matches DeletionBanner precedent)"
    - "components/globals/viewport/ViewportGate.tsx renders Skeleton on server when cookie absent AND dual-DOM, then swaps to resolved sibling client-side (D-27 Skeleton-first; FOUND-11/FOUND-12)"
    - "ViewportGate falls back to desktop sibling when mobile sibling is undefined (FOUND-12)"
    - "components/globals/viewport/SafariWarning.tsx renders dismissible banner on Safari UA only (FOUND-08)"
    - "SafariWarning uses inline styles — no HeroUI, no Tailwind (D-25)"
    - "app/layout.tsx mounts <SafariWarning /> + <ViewportWriter /> at the root shell (per architecture diagram)"
    - "All components use D-33 bracketed-tag logging ([ViewportGate], [ViewportWriter], [renderTier], [SafariWarning])"
    - "Zero hydration mismatch warnings in DevTools Console on fresh page load"
  artifacts:
    - path: "lib/render-tier.ts"
      provides: "Pure render-tier detection util + isSafari helper + VERSION constant"
      contains: "getRenderTier"
      min_lines: 60
    - path: "components/globals/viewport/ViewportWriter.tsx"
      provides: "Client-only component writing vp cookie on mount + matchmedia change"
      contains: "document.cookie"
      min_lines: 20
    - path: "components/globals/viewport/ViewportGate.tsx"
      provides: "Sibling selection primitive with Skeleton-first SSR (D-27)"
      contains: "Skeleton"
      min_lines: 35
    - path: "components/globals/viewport/SafariWarning.tsx"
      provides: "Dismissible amber banner conditional on Safari UA"
      contains: "isSafari"
      min_lines: 25
    - path: "app/layout.tsx"
      provides: "Root layout extended with SafariWarning + ViewportWriter mount points"
      contains: "ViewportWriter"
  key_links:
    - from: "components/globals/viewport/ViewportWriter.tsx"
      to: "document.cookie (client)"
      via: "document.cookie = `vp=...; path=/; max-age=31536000; SameSite=Lax`"
      pattern: "vp=.*max-age"
    - from: "components/globals/viewport/ViewportGate.tsx"
      to: "next/dynamic"
      via: "dynamic(loader, { ssr: false, loading: () => <Skeleton /> })"
      pattern: "dynamic\\("
    - from: "components/globals/viewport/SafariWarning.tsx"
      to: "lib/render-tier.ts isSafari()"
      via: "import { isSafari } from '@/lib/render-tier'"
      pattern: "isSafari"
    - from: "app/layout.tsx"
      to: "components/globals/viewport/*"
      via: "import + JSX mount"
      pattern: "SafariWarning|ViewportWriter"
---

<objective>
Ship the four viewport primitives + render-tier util that every downstream phase consumes. These are styling-tool-agnostic (D-25) — stdlib React + Next only. Skeleton-first SSR (D-27) means ViewportGate is hydration-safe by construction; no `userAgent()` SSR guess (D-28 supersedes FOUND-11 literal wording).

This plan runs in parallel with Waves A and B (no file overlap with Plans 01/02/03/04).

Purpose: Deliver FOUND-08 (Safari banner + image-only), FOUND-09 (getRenderTier caching + VERSION invalidation + user override), FOUND-10 (ViewportWriter vp cookie), FOUND-11 (SSR resolves via cookie → Skeleton fallback per D-27/D-28), FOUND-12 (ViewportGate sibling selection + desktop fallback).
Output:
- `lib/render-tier.ts` — pure util, no React, SSR-safe, 7-day cache with VERSION invalidation
- `components/globals/viewport/ViewportWriter.tsx` — null-render + cookie side effect
- `components/globals/viewport/ViewportGate.tsx` — Skeleton-first sibling selection
- `components/globals/viewport/SafariWarning.tsx` — dismissible amber banner
- `app/layout.tsx` — mounts SafariWarning + ViewportWriter at root shell
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
@components/features/auth/components/DeletionBanner.tsx
@components/features/auth/components/AuthRequired.tsx
@app/layout.tsx

<interfaces>
<!-- All canonical bodies extracted from RESEARCH and PATTERNS. Ship verbatim unless executor has a specific justified reason to deviate. -->

### lib/render-tier.ts (D-21 — pure util, no React imports)

Structural template from `lib/session-cookie.ts`:
- File-level docstring at top
- Constants at module top (VERSION, CACHE_KEY, OVERRIDE_KEY, CACHE_TTL_MS)
- `typeof window === 'undefined'` guards in every reader
- Named exports only
- No React imports

Canonical body (RESEARCH §Pattern 6 + §Code Examples §Safari detection):

```typescript
/**
 * lib/render-tier.ts — Phase 16 Plan 05 (FOUND-08, FOUND-09)
 * Pure render-tier detection utility. SSR-safe. No React imports (D-21).
 * Decides 'full' vs 'image-only' for Spine/WebGL-gated features.
 *
 * Decision chain (order matters):
 *   1. localStorage override (OVERRIDE_KEY) — honor verbatim
 *   2. Safari UA sniff → 'image-only' (FOUND-08 hard product decision)
 *   3. Cache hit with matching VERSION and <7d age → return cached
 *   4. Feature probe: WebGL + hardwareConcurrency + software-renderer sniff
 *   5. Cache result with VERSION + timestamp, return
 */

export const VERSION = 1; // bump to invalidate all caches

const CACHE_KEY = 'hsrpvp_render_tier_cache';
const OVERRIDE_KEY = 'hsrpvp_render_tier_override';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type RenderTier = 'full' | 'image-only';

interface CachedTier {
  tier: RenderTier;
  version: number;
  ts: number;
}

export function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome|Chromium|Edg|Android/.test(ua);
}

function getOverride(): RenderTier | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = localStorage.getItem(OVERRIDE_KEY);
    if (v === 'full' || v === 'image-only') return v;
    return null;
  } catch { return null; }
}

function getCached(): CachedTier | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedTier;
    if (parsed.version !== VERSION) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(tier: RenderTier): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: CachedTier = { tier, version: VERSION, ts: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  } catch { /* storage full or disabled; ignore */ }
}

function probe(): RenderTier {
  if (typeof document === 'undefined' || typeof navigator === 'undefined') return 'full';

  // WebGL probe
  const canvas = document.createElement('canvas');
  const gl =
    (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
    (canvas.getContext('webgl') as WebGLRenderingContext | null);
  if (!gl) {
    console.log('[renderTier] probe: no WebGL context → image-only');
    return 'image-only';
  }

  // Software renderer sniff (Chrome SwiftShader, Basic Render Driver)
  try {
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const rendererName = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
      if (typeof rendererName === 'string' && /SwiftShader|Basic Render Driver/i.test(rendererName)) {
        console.log('[renderTier] probe: software renderer detected →', rendererName, '→ image-only');
        return 'image-only';
      }
    }
  } catch { /* ignore */ }

  // hardwareConcurrency threshold
  const cores = navigator.hardwareConcurrency ?? 0;
  if (cores < 4) {
    console.log('[renderTier] probe: hardwareConcurrency=' + cores + ' → image-only');
    return 'image-only';
  }

  console.log('[renderTier] probe: cores=' + cores + ' → full');
  return 'full';
}

export function getRenderTier(): RenderTier {
  // 1. User override always wins
  const override = getOverride();
  if (override) {
    console.log('[renderTier] user override →', override);
    return override;
  }

  // 2. Safari hard image-only (FOUND-08)
  if (isSafari()) {
    console.log('[renderTier] Safari UA → image-only');
    return 'image-only';
  }

  // 3. Cache hit
  const cached = getCached();
  if (cached) {
    console.log('[renderTier] cache hit →', cached.tier);
    return cached.tier;
  }

  // 4-5. Probe + cache
  const tier = probe();
  writeCache(tier);
  return tier;
}
```

### components/globals/viewport/ViewportWriter.tsx

Canonical body (RESEARCH §Code Examples §matchMedia, PATTERNS §ViewportWriter):

```tsx
'use client';
import { useEffect } from 'react';

const COOKIE_NAME = 'vp';
const MAX_AGE = 60 * 60 * 24 * 365; // 1 year per FOUND-10 (verify: 31,536,000 seconds)

function writeCookie(vp: 'mobile' | 'desktop') {
  // Add ; Secure when running over HTTPS; harmless on localhost HTTP dev
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${vp}; path=/; max-age=${MAX_AGE}; SameSite=Lax${secure}`;
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

  return null; // no DOM output — precedent: DeletionBanner null-return pattern
}
```

Pitfall 8: MAX_AGE must be `60 * 60 * 24 * 365` = 31,536,000 (1 year). A typo of `3153600` gives 36.5 days.

### components/globals/viewport/ViewportGate.tsx (D-27 Skeleton-first)

Canonical body (RESEARCH §Pattern 4 + §Code Examples §next/dynamic sibling, PATTERNS §ViewportGate):

```tsx
'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, type ComponentType } from 'react';

interface Props<P> {
  desktop: () => Promise<{ default: ComponentType<P> }>;
  mobile?: () => Promise<{ default: ComponentType<P> }>;
  /** Server-resolved initial viewport from vp cookie (undefined = Skeleton-first per D-27). */
  initialViewport?: 'desktop' | 'mobile';
  componentProps: P;
  Skeleton: ComponentType;
}

export function ViewportGate<P>({
  desktop, mobile, initialViewport, componentProps, Skeleton,
}: Props<P>) {
  const [resolved, setResolved] = useState<'desktop' | 'mobile' | null>(
    initialViewport ?? null
  );

  useEffect(() => {
    if (!mobile) {
      // FOUND-12 single-DOM fallback
      setResolved('desktop');
      console.log('[ViewportGate] single-DOM: no mobile sibling, resolving desktop');
      return;
    }
    const mq = window.matchMedia('(pointer: coarse) and (hover: none)');
    const next = mq.matches ? 'mobile' : 'desktop';
    console.log(`[ViewportGate] matchMedia → ${next}`);
    setResolved(next);
  }, [mobile]);

  if (resolved === null) {
    console.log('[ViewportGate] rendering Skeleton (cookie absent, dual-DOM)');
    return <Skeleton />;
  }

  const loader = resolved === 'mobile' && mobile ? mobile : desktop;
  const Component = dynamic(loader, { ssr: false, loading: () => <Skeleton /> });
  console.log(`[ViewportGate] mounted sibling: ${resolved}`);
  return <Component {...componentProps} />;
}
```

Critical D-27 contract: the server MUST be able to pass `initialViewport` derived from reading the `vp` cookie in a Server Component parent. Phase 16 doesn't have a consumer yet (dual-DOM consumers ship in Phases 27/31/35), so this plan ships ONLY the primitive. No consumer call site in Phase 16.

Supersedes FOUND-11 literal wording (D-28): roadmap says "SSRs as desktop (or userAgent() guess when available) and swaps to mobile client-side". D-27/D-28 is the implemented mechanism — Skeleton-first for cookie-less dual-DOM, cookie-read for cookied SSR. Server Component consumers read the `vp` cookie via `cookies()` from `next/headers` and pass it as `initialViewport`.

### components/globals/viewport/SafariWarning.tsx (FOUND-08)

Analog: `components/features/auth/components/DeletionBanner.tsx` — exact pattern (conditional banner + inline style + `if (!...) return null`).

Canonical body:

```tsx
'use client';
import { useEffect, useState } from 'react';
import { isSafari } from '@/lib/render-tier';

const DISMISSED_KEY = 'hsrpvp_safari_warning_dismissed';

export function SafariWarning() {
  // 2-pass render: initial state must match SSR (always false server-side)
  const [shouldShow, setShouldShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDismissed = typeof window !== 'undefined' && localStorage.getItem(DISMISSED_KEY) === '1';
    const show = isSafari() && !isDismissed;
    setShouldShow(show);
    console.log(`[SafariWarning] mount: isSafari=${isSafari()} dismissed=${isDismissed} show=${show}`);
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* ignore */ }
    setShouldShow(false);
    console.log('[SafariWarning] dismissed (persisted to localStorage)');
  };

  if (!mounted || !shouldShow) return null;

  return (
    <div style={{
      background: '#f59e0b', // amber (NOT red — DeletionBanner owns red)
      color: '#111827',
      textAlign: 'center',
      padding: '10px 16px',
      fontWeight: 600,
      fontSize: '14px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
    }}>
      <span>Safari has limited support for this app; images render only (no animations). Use Chrome, Edge, or Firefox for the full experience.</span>
      <button
        onClick={dismiss}
        style={{
          background: 'rgba(0,0,0,0.1)',
          border: 'none',
          padding: '4px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
```

Dismissal persistence strategy (Claude's Discretion per CONTEXT.md):
- Selected: **localStorage-forever** (persistent across tabs + browser restarts).
- Rationale: Safari warning is a platform-compat notice; user accepts once and shouldn't be re-prompted every session. If the user clears localStorage or switches browsers, the banner re-appears — acceptable UX.
- Alternative considered: sessionStorage (re-shows per tab) or time-boxed (7-day re-prompt). localStorage-forever is the least annoying and simplest. If UAT surfaces complaints, revisit in a minor phase.

2-pass render safety (Pitfall 2): initial `shouldShow=false` + `mounted=false` → SSR renders `null`. Client post-mount sets `mounted=true` and evaluates `isSafari()`. First client render matches SSR (both null). Second client render shows the banner if Safari.

### app/layout.tsx integration

Current file is a simple root layout. Phase 16 adds:
- `<SafariWarning />` — mounted inside Providers OR above Providers (per architecture diagram, "Root shell: NavBar, Safari banner, ViewportGate, Providers"). Safari banner is visually above NavBar per FOUND-08 "dismissible warning banner above the NavBar".
- `<ViewportWriter />` — mounted once (client-only null-render). Architecture diagram places it inside Providers under GameDataProvider. Either position works because ViewportWriter has no DOM output.

Recommended placement (tracks the architecture diagram at RESEARCH lines 238-246):
```tsx
// app/layout.tsx
import { SafariWarning } from '@/components/globals/viewport/SafariWarning';
import { ViewportWriter } from '@/components/globals/viewport/ViewportWriter';
// ... existing imports ...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SafariWarning />
        <Providers>
          <ViewportWriter />
          {/* existing NavBar + children + Footer */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
```
Exact position depends on current app/layout.tsx structure — executor preserves existing NavBar/Footer tree and inserts SafariWarning above Providers + ViewportWriter inside Providers (or wherever the architecture-diagram position maps cleanly to the existing JSX).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Ship lib/render-tier.ts (pure util, no React imports) + components/globals/viewport/SafariWarning.tsx</name>
  <files>
    lib/render-tier.ts,
    components/globals/viewport/SafariWarning.tsx
  </files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/lib/session-cookie.ts (structural template — constants at top, named exports, SSR guards)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/auth/components/DeletionBanner.tsx (conditional-banner pattern precedent — inline style + `if (!...) return null`)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 6 getRenderTier; §Code Examples §Safari detection; §Pitfall 2 hydration mismatch)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§lib/render-tier.ts — lines 646-696; §SafariWarning — lines 598-643)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-21 pure util; D-22 directory; D-25 no HeroUI/Tailwind; D-33 logging)
  </read_first>
  <action>
1. Create `lib/render-tier.ts` verbatim from `<interfaces>` above. Ensure:
   - NO React imports anywhere in the file (D-21 — testable in isolation without React runtime).
   - Every browser-API reader guards `typeof window === 'undefined'` or `typeof document === 'undefined'` or `typeof navigator === 'undefined'`.
   - Named exports only (`isSafari`, `getRenderTier`, `VERSION`, `RenderTier` type). No default export.
   - Constants at module top.
   - D-33 `[renderTier]` tagged logs on each decision branch (override / Safari / cache hit / probe result).
   - VERSION = 1. This is the invalidation lever.
2. Create `components/globals/viewport/SafariWarning.tsx` verbatim from `<interfaces>`. Ensure:
   - `'use client'` at the top.
   - Imports `isSafari` from `@/lib/render-tier` (same-plan dependency — Task 1 co-locates).
   - 2-pass render: `mounted` ref-ish state starts false; component returns `null` until the useEffect runs (Pitfall 2 hydration safety).
   - `DISMISSED_KEY = 'hsrpvp_safari_warning_dismissed'`.
   - Dismissal persistence = localStorage (Claude's Discretion — forever).
   - Inline styles only — zero HeroUI, zero Tailwind (D-25).
   - Amber color `#f59e0b` (NOT red; DeletionBanner owns red).
   - D-33 `[SafariWarning]` logs on mount + dismissal.
3. Run `npm run build` — must exit 0.
4. Run `npm run test:typecheck` — must exit 0.
5. Manual UAT (log results in SUMMARY):
   - In Chrome: load any page; expect `[SafariWarning] mount: isSafari=false dismissed=false show=false` log and no banner visible.
   - DevTools → toggle UA to Safari desktop (Network conditions → Custom user agent) → reload → expect `[SafariWarning] mount: isSafari=true dismissed=false show=true` and amber banner visible above the usual content.
   - Click Dismiss → banner disappears → `[SafariWarning] dismissed (persisted to localStorage)` log. Reload → banner stays dismissed. Clear localStorage key `hsrpvp_safari_warning_dismissed` → reload → banner re-appears.
   - In DevTools Console: `localStorage.setItem('hsrpvp_render_tier_override', 'image-only')` → next page load, `[renderTier] user override → image-only` log. Clear override → next load, `[renderTier] probe` path or `[renderTier] cache hit` depending on state.
6. Commit: `feat(16-05): add render-tier util + SafariWarning primitive (FOUND-08, FOUND-09)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - File `lib/render-tier.ts` exists: `[ -f lib/render-tier.ts ] && echo OK` prints `OK`.
    - `grep -n "^import .* from 'react'" lib/render-tier.ts` returns zero matches (D-21 no React imports).
    - `grep -n "^import " lib/render-tier.ts` returns zero matches (pure util; no imports at all — only standard globals).
    - `grep -nE "^export const VERSION\\s*=\\s*1" lib/render-tier.ts` returns one match.
    - `grep -n "export function getRenderTier" lib/render-tier.ts` returns one match.
    - `grep -n "export function isSafari" lib/render-tier.ts` returns one match.
    - `grep -n "export type RenderTier" lib/render-tier.ts` returns one match.
    - `grep -nE "hardwareConcurrency" lib/render-tier.ts` returns at least one match.
    - `grep -nE "SwiftShader|Basic Render Driver" lib/render-tier.ts` returns at least one match.
    - `grep -nE "typeof window === 'undefined'|typeof document === 'undefined'|typeof navigator === 'undefined'" lib/render-tier.ts` returns at least 3 matches (SSR guards in readers).
    - `grep -c "\\[renderTier\\]" lib/render-tier.ts` returns at least 4 (override, Safari, cache-hit, probe paths).
    - File `components/globals/viewport/SafariWarning.tsx` exists.
    - `grep -n "'use client'" components/globals/viewport/SafariWarning.tsx` returns one match at file top.
    - `grep -n "import.*isSafari.*from '@/lib/render-tier'" components/globals/viewport/SafariWarning.tsx` returns one match.
    - `grep -nE "@heroui|tailwind|@nextui" components/globals/viewport/SafariWarning.tsx` returns zero matches (D-25).
    - `grep -c "\\[SafariWarning\\]" components/globals/viewport/SafariWarning.tsx` returns at least 2 (mount + dismiss paths).
    - `grep -nE "localStorage.setItem.*DISMISSED_KEY|localStorage.setItem\\('hsrpvp_safari_warning_dismissed'" components/globals/viewport/SafariWarning.tsx` returns at least one match.
    - `npm run build && npm run test:typecheck` both exit 0.
    - Manual UAT logged in SUMMARY (Safari UA → banner; dismiss → persists; render-tier override honored).
  </acceptance_criteria>
  <done>
    `lib/render-tier.ts` (pure util, no React imports, decision chain per D-21) and `components/globals/viewport/SafariWarning.tsx` (dismissible amber banner, 2-pass render, localStorage-forever persistence) both ship. Manual UAT confirms Safari-UA-only render + localStorage-persistent dismissal + render-tier override. Build+typecheck green. Atomic commit made.
  </done>
</task>

<task type="auto">
  <name>Task 2: Ship ViewportWriter + ViewportGate primitives (FOUND-10, FOUND-11, FOUND-12)</name>
  <files>
    components/globals/viewport/ViewportWriter.tsx,
    components/globals/viewport/ViewportGate.tsx
  </files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/lib/session-cookie.ts (cookie-write pattern to mirror for vp cookie)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/auth/components/AuthRequired.tsx (conditional-render pattern precedent — overlay-vs-children is analogous to Skeleton-vs-sibling)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/auth/components/DeletionBanner.tsx (null-render client-only pattern)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 4 ViewportGate Skeleton-first; §Pattern 7 ViewportWriter matchMedia; §Pitfall 2 hydration safety; §Pitfall 8 cookie max-age; §Code Examples §matchMedia-based; §Code Examples §next/dynamic sibling)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§ViewportWriter — lines 477-524; §ViewportGate — lines 527-594; §SSR-safe guard for browser APIs — lines 896-917)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-22 directory; D-25 no framework; D-26 dual-DOM only in 27/31/35; D-27 Skeleton-first; D-28 D-27 supersedes FOUND-11 literal)
  </read_first>
  <action>
1. Create `components/globals/viewport/ViewportWriter.tsx` verbatim from `<interfaces>`. Ensure:
   - `'use client'` at file top.
   - `COOKIE_NAME = 'vp'`; `MAX_AGE = 60 * 60 * 24 * 365` (31,536,000 seconds per Pitfall 8 — use explicit arithmetic, not a hardcoded `31536000` magic number).
   - Component returns `null` (no DOM output — DeletionBanner precedent).
   - `matchMedia('(pointer: coarse) and (hover: none)')` with addEventListener/removeEventListener for change events.
   - `; Secure` attribute added when `location.protocol === 'https:'` (per RESEARCH Open Question 3 — harmless on localhost dev).
   - D-33 `[ViewportWriter]` logs on each cookie write.
2. Create `components/globals/viewport/ViewportGate.tsx` verbatim from `<interfaces>`. Ensure:
   - `'use client'` at file top.
   - Generic `<P>` for componentProps.
   - Props: `desktop` (required loader), `mobile` (optional loader), `initialViewport` (optional 'desktop' | 'mobile'), `componentProps: P`, `Skeleton: ComponentType`.
   - useState initialized from `initialViewport ?? null`.
   - useEffect:
     - If no `mobile` loader, set resolved='desktop' (FOUND-12 single-DOM fallback).
     - Else matchMedia → set resolved='mobile'|'desktop'.
   - While `resolved === null`, render `<Skeleton />` (D-27 Skeleton-first for cookie-less dual-DOM).
   - Once resolved, use `dynamic(loader, { ssr: false, loading: () => <Skeleton /> })` — `ssr: false` is critical because the sibling choice is client-resolved.
   - D-33 `[ViewportGate]` logs on Skeleton render, matchMedia result, sibling mount.
3. Phase 16 ships ONLY the primitive; no consumer call site in this plan. Phases 27 / 31 / 35 will import ViewportGate and wire `.desktop.tsx` / `.mobile.tsx` sibling loaders.
4. D-27/D-28 documentation: add an inline JSDoc block above the ViewportGate export explaining:
   - Server Component parents can read the `vp` cookie via `cookies()` from `next/headers` and pass it as `initialViewport`.
   - When `initialViewport` is undefined AND `mobile` loader exists (dual-DOM), server renders the Skeleton placeholder (matches first client render — zero hydration mismatch).
   - When `mobile` is undefined (single-DOM), server renders desktop directly.
5. Run `npm run build && npm run test:typecheck` — both exit 0.
6. Manual UAT (log in SUMMARY) — ViewportGate has no consumer yet, so verify ViewportWriter only:
   - Clear the `vp` cookie in DevTools.
   - Reload any page → expect `[ViewportWriter] wrote vp=desktop` (or `vp=mobile` if on a touch device). DevTools → Application → Cookies → `vp` shows value + Max-Age ~31,536,000 (1 year) + SameSite=Lax.
   - DevTools → Network → toggle "Emulate coarse pointer" (Rendering tab) → reload → expect `[ViewportWriter] wrote vp=mobile`. Cookie updates.
   - On localhost (HTTP), cookie should NOT have Secure attribute. On HTTPS preview (Vercel), Secure should be present (log this expectation for Phase 17+ verification in prod).
7. Commit: `feat(16-05): add ViewportWriter + ViewportGate primitives (FOUND-10, FOUND-11, FOUND-12)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - File `components/globals/viewport/ViewportWriter.tsx` exists.
    - File `components/globals/viewport/ViewportGate.tsx` exists.
    - `grep -n "'use client'" components/globals/viewport/ViewportWriter.tsx` returns one match.
    - `grep -n "'use client'" components/globals/viewport/ViewportGate.tsx` returns one match.
    - `grep -nE "COOKIE_NAME\\s*=\\s*'vp'" components/globals/viewport/ViewportWriter.tsx` returns one match.
    - `grep -nE "MAX_AGE\\s*=\\s*60\\s*\\*\\s*60\\s*\\*\\s*24\\s*\\*\\s*365" components/globals/viewport/ViewportWriter.tsx` returns one match (Pitfall 8 — explicit arithmetic, not magic number).
    - `grep -n "SameSite=Lax" components/globals/viewport/ViewportWriter.tsx` returns one match.
    - `grep -n "location.protocol === 'https:'" components/globals/viewport/ViewportWriter.tsx` returns one match (Secure flag gating).
    - `grep -n "matchMedia('(pointer: coarse) and (hover: none)')" components/globals/viewport/ViewportWriter.tsx` returns one match.
    - `grep -n "mq.addEventListener('change'" components/globals/viewport/ViewportWriter.tsx` returns one match.
    - `grep -n "return null" components/globals/viewport/ViewportWriter.tsx` returns at least one match.
    - `grep -n "import dynamic from 'next/dynamic'" components/globals/viewport/ViewportGate.tsx` returns one match.
    - `grep -n "ssr: false" components/globals/viewport/ViewportGate.tsx` returns one match.
    - `grep -nE "Skeleton" components/globals/viewport/ViewportGate.tsx` returns at least 3 matches (Props field, Skeleton render branch, dynamic loading prop).
    - `grep -n "initialViewport" components/globals/viewport/ViewportGate.tsx` returns at least 2 matches (prop + useState init).
    - `grep -c "\\[ViewportWriter\\]" components/globals/viewport/ViewportWriter.tsx` returns at least 1.
    - `grep -c "\\[ViewportGate\\]" components/globals/viewport/ViewportGate.tsx` returns at least 3 (Skeleton, matchMedia, sibling-mount paths).
    - `npm run build && npm run test:typecheck` both exit 0.
    - Manual UAT logged: vp cookie written on initial load; matchMedia change event flips vp; cookie has 1-year max-age; Secure absent on localhost, expected on HTTPS.
  </acceptance_criteria>
  <done>
    ViewportWriter writes `vp=desktop|mobile` cookie with 1-year max-age + SameSite=Lax + conditional Secure; returns null (side-effect only). ViewportGate is a Skeleton-first primitive supporting single-DOM fallback (FOUND-12) and dual-DOM Skeleton-first SSR (D-27). Both primitives use D-33 tagged logging. Manual UAT confirms cookie write mechanics. Build+typecheck green. Atomic commit made.
  </done>
</task>

<task type="auto">
  <name>Task 3: Mount SafariWarning + ViewportWriter in app/layout.tsx root shell</name>
  <files>app/layout.tsx</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/app/layout.tsx (current root layout — confirm structure before editing)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Architecture diagram — "Root shell: NavBar, Safari banner, ViewportGate, Providers"; §Component Responsibilities "app/layout.tsx" row)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-22 directory; D-25 no HeroUI/Tailwind in primitives — layout integration can use existing project style)
  </read_first>
  <action>
1. Open `app/layout.tsx`. Preserve all existing structure (html/body, NavBar, Footer, metadata, Providers wrapping children). DO NOT refactor existing layout logic — only ADD the two new mount points.
2. Add imports at top:
   ```tsx
   import { SafariWarning } from '@/components/globals/viewport/SafariWarning';
   import { ViewportWriter } from '@/components/globals/viewport/ViewportWriter';
   ```
3. Mount positions per architecture diagram (RESEARCH.md:223-234):
   - `<SafariWarning />`: immediately INSIDE `<body>`, ABOVE the Providers + NavBar tree. Rationale: banner appears above NavBar per FOUND-08 "dismissible warning banner above the NavBar".
   - `<ViewportWriter />`: inside Providers, alongside children (null-render; placement is logically anywhere inside the client boundary). Recommended: as a sibling of `{children}` inside the Providers tree to guarantee one mount per top-level render.
4. If the current `app/layout.tsx` is a Server Component (no `'use client'`), the tree becomes:
   ```tsx
   <html lang="en">
     <body>
       <SafariWarning />   {/* 'use client' component; fine inside Server layout */}
       <Providers>
         <ViewportWriter />  {/* 'use client' */}
         {/* ...existing NavBar, children, Footer... */}
       </Providers>
     </body>
   </html>
   ```
   The two new client components render fine inside a Server Component parent (standard Next.js pattern).
5. Do NOT wrap the existing layout with additional providers, add new contexts, or change CSS imports. Scope is strictly the two mount points.
6. Run `npm run build && npm run test:typecheck` — both exit 0.
7. Full-stack manual UAT (log in SUMMARY):
   - `npm run dev`, clear cookies and localStorage, reload `/`.
   - Expect: `[ViewportWriter] wrote vp=desktop` in console; vp cookie in DevTools.
   - Expect: `[SafariWarning] mount: isSafari=false dismissed=false show=false` in console; no amber banner.
   - Switch DevTools UA to Safari desktop, reload → expect amber banner above NavBar + `[SafariWarning] mount: isSafari=true ...`. Dismiss works + persists.
   - DevTools React Profiler (or regular inspection) confirms no hydration-mismatch warnings for either component.
8. Commit: `feat(16-05): mount SafariWarning + ViewportWriter in root layout`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `grep -n "import.*SafariWarning.*from '@/components/globals/viewport/SafariWarning'" app/layout.tsx` returns one match.
    - `grep -n "import.*ViewportWriter.*from '@/components/globals/viewport/ViewportWriter'" app/layout.tsx` returns one match.
    - `grep -n "<SafariWarning" app/layout.tsx` returns at least one match.
    - `grep -n "<ViewportWriter" app/layout.tsx` returns at least one match.
    - Existing root-layout structure preserved: `grep -n "<html" app/layout.tsx` returns one match; `grep -n "<body" app/layout.tsx` returns one match; `grep -n "Providers" app/layout.tsx` returns at least one match (import + JSX).
    - `npm run build && npm run test:typecheck` both exit 0.
    - 15.5 harness: `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` — still green (no backend changes).
    - Manual UAT logged: vp cookie writes on first load; Safari UA triggers banner; DevTools shows zero hydration-mismatch errors.
  </acceptance_criteria>
  <done>
    `app/layout.tsx` mounts `<SafariWarning />` (above Providers tree, visible above NavBar) and `<ViewportWriter />` (inside Providers, sibling of children). Existing root-layout structure preserved. Manual UAT confirms both primitives render + behave correctly with zero hydration warnings. Build+typecheck green. Atomic commit made.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Browser page → `document.cookie` | ViewportWriter writes the `vp` cookie client-side. Cookie is non-httpOnly (JS write requires it); value is untrusted for any security purpose. |
| Browser page → `localStorage` | SafariWarning dismissal + render-tier cache/override all live in localStorage. Same-origin access only. |
| SSR → client hydration | ViewportGate's Skeleton-first pattern (D-27) is the hydration-safety boundary. Server renders Skeleton if cookie absent; client also starts with Skeleton; post-hydration matchMedia swaps to the real sibling. |
| lib/render-tier.ts → WebGL probe | Canvas + WebGL context creation is same-origin; GPU identification via WEBGL_debug_renderer_info is privacy-visible but the data is already available to the browser's fingerprint surface. No new data collection. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16-05-01 | T (Tampering) | Hydration mismatch from matchMedia during render | mitigate | All viewport detection inside `useEffect`; initial state matches SSR-safe default (`resolved=initialViewport??null`, `mounted=false`). RESEARCH Pitfall 2 + 2-pass render pattern. |
| T-16-05-02 | I (Information Disclosure) | vp cookie reveals viewport class to server | accept | The cookie's only purpose is SSR-informed rendering. Viewport class is not sensitive. Cookie is `SameSite=Lax` so cross-site contexts don't see it. |
| T-16-05-03 | T | vp cookie max-age typo gives months not year | mitigate | Arithmetic form `60 * 60 * 24 * 365` prevents missing-digit typo (RESEARCH Pitfall 8). Manual UAT verifies the cookie Max-Age column in DevTools. |
| T-16-05-04 | T | Stale render-tier cache survives VERSION bump | mitigate | Cache reader explicitly checks `parsed.version !== VERSION` and returns null → forces re-probe (Pattern 6). VERSION bump is the invalidation lever. |
| T-16-05-05 | D (Denial of Service) | WebGL probe triggers GPU-expensive shader compilation | accept | Probe is single canvas + context creation + optional extension query; no shader compilation. Standard feature-detection pattern per MDN. |
| T-16-05-06 | S (Spoofing) | User sets localStorage override to bypass Safari image-only | accept | FOUND-09 explicitly requires the override to be honored (user choice wins). Safari users can self-attest "I want full tier" and accept the UX risk. |
| T-16-05-07 | I | WEBGL_debug_renderer_info returns GPU string (fingerprint surface) | accept | Chrome/Firefox already expose this extension by default; our probe does not enable new fingerprinting. Result is used locally only (not sent to server). |
| T-16-05-08 | T | vp cookie missing Secure on HTTPS deploy | mitigate | `location.protocol === 'https:'` check adds `; Secure`. Local dev (HTTP) does not add it; prod (HTTPS) does. Manual UAT log in Task 2 SUMMARY calls out the HTTP vs HTTPS expectation. |
</threat_model>

<verification>
After all 3 tasks land:
1. `[ -f lib/render-tier.ts ]` + `[ -f components/globals/viewport/SafariWarning.tsx ]` + `[ -f components/globals/viewport/ViewportWriter.tsx ]` + `[ -f components/globals/viewport/ViewportGate.tsx ]` — all four files exist.
2. `grep -n "SafariWarning\\|ViewportWriter" app/layout.tsx` — both mounted in root layout.
3. `npm run build && npm run test:typecheck` — both exit 0.
4. Manual UAT from Task 3 confirms: vp cookie writes on first visit; Safari UA shows amber banner; no hydration-mismatch warnings.
5. Integration guard: `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` — still green (this plan is UI-only; should not affect backend subscriptions).
6. D-33 bracketed logs present for all four primitives: `[renderTier]`, `[SafariWarning]`, `[ViewportWriter]`, `[ViewportGate]`.
</verification>

<success_criteria>
- `lib/render-tier.ts` — pure util, zero React imports, decision chain (override → Safari → cache → probe), VERSION = 1.
- `components/globals/viewport/SafariWarning.tsx` — dismissible amber banner, Safari-UA-only, localStorage-forever persistence, 2-pass render.
- `components/globals/viewport/ViewportWriter.tsx` — writes `vp` cookie with 1-year max-age + SameSite=Lax + conditional Secure; null render.
- `components/globals/viewport/ViewportGate.tsx` — Skeleton-first SSR (D-27), single-DOM fallback to desktop (FOUND-12), generic <P> for componentProps, `next/dynamic` with `ssr: false`.
- `app/layout.tsx` — mounts SafariWarning + ViewportWriter; preserves existing NavBar/Footer/Providers/children structure.
- Zero HeroUI / Tailwind imports in any new primitive (D-25).
- Zero hydration-mismatch warnings in DevTools Console on fresh page load.
- Manual UAT end-to-end logged in SUMMARY.
</success_criteria>

<output>
After completion, create `.planning/phases/16-route-global-foundation/16-05-SUMMARY.md` documenting:
- Confirmation that `lib/render-tier.ts` has zero React imports (D-21).
- Dismissal-persistence strategy chosen for SafariWarning (localStorage-forever).
- Confirmation that vp cookie Max-Age is exactly 31,536,000 seconds (manual DevTools check).
- Manual UAT transcript (Chrome → no banner; Safari UA → banner + dismiss persists; matchMedia change → vp cookie flips).
- Zero hydration-mismatch warnings observed on first load (or call out any that surface and how they were resolved).
- D-27 call-out: Skeleton-first SSR implemented per D-28 (FOUND-11 literal superseded).
- Note that ViewportGate has no in-phase consumer — Phases 27/31/35 will wire dual-DOM siblings.
</output>
