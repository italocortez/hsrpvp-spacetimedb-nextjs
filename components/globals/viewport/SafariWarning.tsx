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
        const safari = isSafari();
        const isDismissed = typeof window !== 'undefined' && localStorage.getItem(DISMISSED_KEY) === '1';
        const show = safari && !isDismissed;
        setShouldShow(show);
        console.log(`[SafariWarning] mount: isSafari=${safari} dismissed=${isDismissed} show=${show}`);
    }, []);

    const dismiss = () => {
        try {
            localStorage.setItem(DISMISSED_KEY, '1');
        } catch {
            /* ignore */
        }
        setShouldShow(false);
        console.log('[SafariWarning] dismissed (persisted to localStorage)');
    };

    if (!mounted || !shouldShow) return null;

    return (
        <div
            style={{
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
            }}
        >
            <span>
                Safari has limited support for this app; images render only (no animations). Use Chrome, Edge, or Firefox for the full experience.
            </span>
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
