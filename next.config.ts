import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

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
              // WR-04: prod drops 'unsafe-eval' — compiled Next bundles do not call eval().
              // Dev retains 'unsafe-eval' because React Fast Refresh + webpack HMR evaluate
              // hot chunks via eval(); without it `next dev` hangs at the spinner in
              // CSP-enforcing browsers (Firefox).
              // 'unsafe-inline' retained as a fallback; a dedicated security phase will
              // replace it with per-request nonces + 'strict-dynamic' once middleware grows
              // nonce-generation.
              `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
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
