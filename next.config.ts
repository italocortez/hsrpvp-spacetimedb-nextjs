import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // D-29 Commit 1 + RESEARCH Pitfall 1 correction: top-level `typedRoutes` is
  // the stable key on Next 15.5+. The nested deprecated form triggers a warning
  // on every `next build` and is removed in Next 16.
  typedRoutes: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // 'unsafe-eval' is required in ALL envs because the SpacetimeDB SDK
              // generates BSATN codecs at runtime via the Function() constructor
              // (spacetimedb/dist/index.browser.mjs ~L1184, 1192, 1231, 1236, 1322, 1379)
              // and uses a dynamic-import polyfill via new Function() (~L5023).
              // These are hot-path and cannot be avoided without forking the SDK.
              // WR-04 originally dropped 'unsafe-eval' in prod on the assumption that
              // only Next dev bundles used eval(); Phase 16 UAT Test 3 proved that
              // wrong — prod builds crash at SDK init without it.
              // Dev additionally needs it for React Fast Refresh + webpack HMR.
              // 'unsafe-inline' retained as fallback; a future security phase may
              // replace it with per-request nonces + 'strict-dynamic', but
              // 'unsafe-eval' stays until the SDK ships AOT-compiled codecs.
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' wss://maincloud.spacetimedb.com https://maincloud.spacetimedb.com ws://localhost:* https://discord.com https://cdn.discordapp.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
