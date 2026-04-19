// middleware.ts — Phase 16 Plan 03 (FOUND-13)
// UX-only redirect. NOT an auth trust boundary. Real authz lives in SpacetimeDB RLS.
// CVE-2025-29927 mitigated transparently by the Next 15.5.x bump in Plan 01
//   (x-middleware-subrequest header verified cryptographically by Next internals).
// See docs/auth/architecture.md for subscription-lifecycle + trust-boundary discussion.

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const cookie = request.cookies.get('stdb_session'); // string-literal per interfaces note (zero-dep safety)
  const path = request.nextUrl.pathname;

  if (!cookie) {
    // WR-10: defense-in-depth against self-redirect loop if matcher ever includes '/'.
    if (path === '/') return NextResponse.next();
    console.log(`[middleware] redirect: ${path} (no stdb_session cookie)`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  console.log(`[middleware] pass: ${path} (cookie present)`);
  return NextResponse.next();
}

export const config = {
  // D-15 positive-list matcher. :path* covers the base path AND any sub-paths.
  // Future authed sub-pages (Phase 22 admin, Phase 24 /profile/[userId], Phase 28 /lobby/[id],
  // Phase 30/31 /draft/[matchId]) fit the wildcard without re-editing this file.
  //
  // Intentionally excludes '/api/…', '/_next/*', '/sw.js' — API routes self-validate via
  // NextAuth JWT; a middleware redirect would break API callers expecting 401/403, not 307.
  matcher: [
    '/profile/:path*',
    '/admin-view/:path*',
    '/lobby/:path*',
    '/draft/:path*',
  ],
};
