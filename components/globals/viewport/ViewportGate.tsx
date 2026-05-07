'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState, type ComponentType } from 'react';

interface Props<P extends object> {
    desktop: () => Promise<{ default: ComponentType<P> }>;
    mobile?: () => Promise<{ default: ComponentType<P> }>;
    /** Server-resolved initial viewport from vp cookie (undefined = Skeleton-first per D-27). */
    initialViewport?: 'desktop' | 'mobile';
    componentProps: P;
    Skeleton: ComponentType;
}

/**
 * ViewportGate — Phase 16 Plan 05 (FOUND-11, FOUND-12)
 *
 * Sibling-selection primitive for dual-DOM feature pages (Phases 27 Calendar,
 * 31 Match Drafting, 35 Tournament brackets). Skeleton-first SSR (D-27)
 * supersedes FOUND-11 literal wording (D-28).
 *
 * ⚠ IMPORTANT — loader referential stability (WR-09):
 * `desktop` and `mobile` MUST be referentially stable across renders. Use
 * module-scoped arrow functions at the call site:
 *
 *     // ✅ correct — stable identity across renders
 *     const desktopLoader = () => import('./MyPage.desktop');
 *     const mobileLoader  = () => import('./MyPage.mobile');
 *     <ViewportGate desktop={desktopLoader} mobile={mobileLoader} ... />
 *
 *     // ❌ wrong — new function per render, defeats the useMemo below,
 *     //   causes the dynamic component to remount (state loss + flicker)
 *     <ViewportGate desktop={() => import('./MyPage.desktop')} ... />
 *
 * Consumption pattern (future consumers in Phases 27/31/35):
 * - Server Component parents can read the `vp` cookie via `cookies()` from
 *   `next/headers` and pass it as `initialViewport`. The server then renders
 *   the cookied sibling directly (e.g., `initialViewport='desktop'` → dynamic
 *   desktop loader on first paint, no Skeleton flash).
 * - When `initialViewport` is undefined AND the `mobile` loader exists
 *   (dual-DOM), server renders the Skeleton placeholder. First client render
 *   also starts with Skeleton (matches SSR → zero hydration mismatch), then
 *   `useEffect` runs matchMedia and swaps to the resolved sibling.
 * - When `mobile` is undefined (single-DOM), server renders the desktop loader
 *   directly on first client render (FOUND-12 single-DOM fallback; no Skeleton
 *   flash since matchMedia isn't consulted).
 *
 * `next/dynamic({ ssr: false })` is the critical hydration-safety knob: the
 * sibling choice is client-resolved, so we never server-render a sibling that
 * might mismatch the client's matchMedia result.
 */
export function ViewportGate<P extends object>({
    desktop,
    mobile,
    initialViewport,
    componentProps,
    Skeleton,
}: Props<P>) {
    const [resolved, setResolved] = useState<'desktop' | 'mobile' | null>(
        initialViewport ?? null
    );

    useEffect(() => {
        if (!mobile) {
            // FOUND-12 single-DOM fallback — no mobile sibling provided, desktop wins.
            setResolved('desktop');
            console.log('[ViewportGate] single-DOM: no mobile sibling, resolving desktop');
            return;
        }
        const mq = window.matchMedia('(pointer: coarse) and (hover: none)');
        const next = mq.matches ? 'mobile' : 'desktop';
        console.log(`[ViewportGate] matchMedia → ${next}`);
        setResolved(next);
    }, [mobile]);

    // WR-09: memoize the dynamic() component so it isn't recreated every render.
    // next/dynamic is designed for module scope; calling it inside the function body
    // produces a new lazy component per render unless wrapped in useMemo. Inputs MUST
    // be referentially stable (see JSDoc above) or the memo won't hold.
    const Component = useMemo(() => {
        if (resolved === null) return null;
        const loader = resolved === 'mobile' && mobile ? mobile : desktop;
        return dynamic(loader, { ssr: false, loading: () => <Skeleton /> });
    }, [resolved, desktop, mobile, Skeleton]);

    if (Component === null) {
        console.log('[ViewportGate] rendering Skeleton (cookie absent, dual-DOM)');
        return <Skeleton />;
    }

    console.log(`[ViewportGate] mounted sibling: ${resolved}`);
    return <Component {...componentProps} />;
}
