'use client';
// Phase 16 Plan 04 — Dev utility: unregister all Service Workers + clear all caches (D-20).
// Prod-gate via notFound() — in prod WITHOUT the opt-in flag, this page 404s.
// Trivially removable: ~1KB unreachable in prod; no other code depends on it.

import { notFound } from 'next/navigation';
import { useState } from 'react';

export default function DevUnregisterSW() {
  // Prod-gate is load-bearing — FIRST statement in the component body (D-20, T-16-04-04).
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_SW !== 'true') {
    notFound();
  }

  const [status, setStatus] = useState<string>('idle');

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
      // redirect to home after a beat so the user sees the status
      setTimeout(() => window.location.replace('/'), 1500);
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
        style={{
          padding: '12px 24px',
          fontSize: 15,
          fontWeight: 600,
          color: '#fff',
          background: '#b91c1c',
          border: '1px solid #991b1b',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Unregister all SW + clear all caches
      </button>
      <p style={{ marginTop: 16, minHeight: '1.5em', fontFamily: 'monospace', opacity: 0.8 }}>
        {status === 'idle' ? ' ' : status}
      </p>
    </div>
  );
}
