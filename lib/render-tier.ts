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
    } catch {
        return null;
    }
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
    } catch {
        return null;
    }
}

function writeCache(tier: RenderTier): void {
    if (typeof window === 'undefined') return;
    try {
        const payload: CachedTier = { tier, version: VERSION, ts: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    } catch {
        /* storage full or disabled; ignore */
    }
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
    } catch {
        /* ignore */
    }

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
