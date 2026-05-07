'use client';

import { useEffect } from 'react';

const COOKIE_NAME = 'vp';
// 1 year per FOUND-10. Explicit arithmetic (NOT a magic 31536000 literal) per Pitfall 8.
const MAX_AGE = 60 * 60 * 24 * 365; // 31,536,000 seconds

function writeCookie(vp: 'mobile' | 'desktop') {
    // Add ; Secure when running over HTTPS; harmless on localhost HTTP dev.
    const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${COOKIE_NAME}=${vp}; path=/; max-age=${MAX_AGE}; SameSite=Lax${secure}`;
    console.log(`[ViewportWriter] wrote vp=${vp}`);
}

/**
 * ViewportWriter — Phase 16 Plan 05 (FOUND-10)
 *
 * Client-only side-effect component. Writes the `vp=desktop|mobile` cookie
 * on mount + whenever the `(pointer: coarse) and (hover: none)` media query
 * flips (e.g., user rotates a 2-in-1 device into tablet mode). Returns null
 * (no DOM output) — precedent: DeletionBanner null-return pattern.
 */
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
