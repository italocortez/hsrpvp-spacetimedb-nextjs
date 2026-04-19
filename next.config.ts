import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js configuration
  // Note: Use port 3001 (via npm scripts) to avoid conflict with SpacetimeDB on port 3000

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
