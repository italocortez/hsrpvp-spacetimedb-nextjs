'use client';
// Phase 16 Plan 04 — Dev utility: unregister all Service Workers + clear all caches (D-20).
// Prod-gate via notFound() — in prod WITHOUT the opt-in flag, this page 404s.
// Trivially removable: ~1KB unreachable in prod; no other code depends on it.

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DevUnregisterSW() {
  // Prod-gate is load-bearing — FIRST statement in the component body (D-20, T-16-04-04).
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_SW !== 'true') {
    notFound();
  }

  const [status, setStatus] = useState<string>('idle');
  const [countdown, setCountdown] = useState<number | null>(null);

  // Single-source-of-truth countdown: when countdown > 0, decrement each second;
  // when it hits 0, redirect. Cancelling sets countdown to null, stopping the effect.
  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      window.location.replace('/');
      return;
    }
    const t = window.setTimeout(() => {
      setCountdown(c => (c === null ? null : c - 1));
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const cancelRedirect = () => {
    setCountdown(null);
    setStatus(s => s + ' — redirect cancelled; reload manually once the flag is off');
  };

  const unregister = async () => {
    setStatus('unregistering...');
    try {
      // WR-02: guard against missing SW / caches APIs (Safari private mode,
      // non-HTTPS contexts, SW-disabled browsers). Devs hit this page precisely
      // when something is broken — crash-proof the handler.
      const regs = 'serviceWorker' in navigator
        ? await navigator.serviceWorker.getRegistrations()
        : [];
      for (const reg of regs) await reg.unregister();
      const cacheNames = typeof caches !== 'undefined' ? await caches.keys() : [];
      for (const n of cacheNames) await caches.delete(n);
      setStatus(`done — ${regs.length} SW unregistered, ${cacheNames.length} caches cleared`);
      // 10s countdown gives the dev time to flip NEXT_PUBLIC_ENABLE_SW in
      // .env.local before the redirect lands on / and re-registers the SW.
      setCountdown(10);
    } catch (err) {
      setStatus(`error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif', maxWidth: 720 }}>
      <h1>Dev: Unregister Service Worker</h1>
      <p style={{ marginTop: 16, marginBottom: 24, lineHeight: 1.5, opacity: 0.85 }}>
        Clears all registered Service Workers and Cache Storage for this origin,
        then redirects to <code>/</code>.
        {' '}
        <strong>Before reloading, also remove <code>NEXT_PUBLIC_ENABLE_SW=true</code> from <code>.env.local</code></strong>
        {' '}
        (or set it to <code>false</code>) — otherwise <code>providers.tsx</code> will re-register the SW on the next page load and you&apos;ll be right back where you started.
      </p>
      <button
        onClick={unregister}
        disabled={countdown !== null}
        style={{
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 600,
          color: '#fff',
          background: countdown !== null ? '#6b7280' : '#b91c1c',
          border: `1px solid ${countdown !== null ? '#4b5563' : '#991b1b'}`,
          borderRadius: 6,
          cursor: countdown !== null ? 'not-allowed' : 'pointer',
        }}
      >
        Unregister all SW + clear all caches
      </button>
      {countdown !== null && countdown > 0 && (
        <button
          onClick={cancelRedirect}
          style={{
            marginLeft: 12,
            padding: '12px 24px',
            fontSize: 15,
            fontWeight: 500,
            color: '#e5e7eb',
            background: 'transparent',
            border: '1px solid #4b5563',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Cancel redirect
        </button>
      )}
      <p style={{ marginTop: 16, minHeight: '1.5em', fontFamily: 'monospace', opacity: 0.8 }}>
        {status === 'idle' ? ' ' : status}
        {countdown !== null && countdown > 0 && ` — redirecting in ${countdown}s...`}
        {countdown === 0 && ' — redirecting...'}
      </p>
    </div>
  );
}
