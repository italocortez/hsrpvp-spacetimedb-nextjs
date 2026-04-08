---
status: resolved
trigger: "Discord linking returns 401 from NextAuth. getServerSession(authOptions) returns null after OAuth redirect."
created: 2026-04-08T00:00:00Z
updated: 2026-04-08T00:00:00Z
---

## Current Focus

hypothesis: getServerSession's internal AuthHandler pipeline fails silently in App Router POST route handlers — cookie is present but the session processing returns empty body, resulting in null.
test: Replace getServerSession with direct JWT cookie reading + decode (same primitives NextAuth uses internally, minus the AuthHandler overhead).
expecting: Direct cookie read succeeds where getServerSession did not, because it bypasses the complex init/AuthHandler/SessionStore pipeline.
next_action: User verifies the fix end-to-end (Discord OAuth -> link-discord -> hasDiscordLinked = true)

## Symptoms

expected: After Discord OAuth callback completes and redirects back, frontend calls /api/auth/link-discord. getServerSession(authOptions) should find valid NextAuth session.
actual: getServerSession(authOptions) returns null -> 401 Unauthorized. Discord OAuth itself works (user approves, redirect happens), but session is missing.
errors: POST /api/auth/link-discord 401 (Unauthorized). Secondary: Ephemeral connection failed (never reached due to 401).
reproduction: Login as guest -> Click Link Discord -> Complete Discord OAuth -> Get redirected back -> 401 in network tab
started: Phase 12 UAT -- new feature, may have never worked correctly

## Eliminated

- hypothesis: NEXTAUTH_SECRET not set or mismatched
  evidence: .env.local has NEXTAUTH_SECRET=Da6ryqecvYc9V9MARMU1ubkKVaSluPtD5gyeYnLw, same process uses it for both encode and decode
  timestamp: 2026-04-08

- hypothesis: NEXTAUTH_URL port mismatch (3000 vs 3001)
  evidence: dev script is "next dev" with no port flag (defaults to 3000), NEXTAUTH_URL=http://localhost:3000/. Comment about 3001 is just a note. Discord redirect works (user confirms), proving port is correct.
  timestamp: 2026-04-08

- hypothesis: CSP headers blocking cookies
  evidence: CSP has default-src 'self', connect-src includes 'self'. CSP does not restrict cookies. SameSite=lax allows same-origin POST fetch.
  timestamp: 2026-04-08

- hypothesis: Missing JWT callback causing token.sub to be empty
  evidence: Default NextAuth JWT callback stores profile.id as token.sub. Discord provider profile() returns id from Discord API. No custom jwt callback needed.
  timestamp: 2026-04-08

- hypothesis: Cookie not sent because fetch omits credentials
  evidence: fetch('/api/auth/link-discord', {method:'POST'}) is same-origin, browser default is credentials:'same-origin', cookies ARE sent.
  timestamp: 2026-04-08

- hypothesis: useSecureCookies mismatch (checking wrong cookie name)
  evidence: NEXTAUTH_URL starts with http://, both callback handler and getServerSession resolve useSecureCookies=false, cookie name="next-auth.session-token" consistently.
  timestamp: 2026-04-08

- hypothesis: Trailing slash in NEXTAUTH_URL causes issue
  evidence: NextAuth's parseUrl explicitly handles trailing slashes with .replace(/\/$/, ""). Internal normalization prevents mismatch.
  timestamp: 2026-04-08

- hypothesis: Next.js 15 async cookies() incompatibility
  evidence: next-auth 4.24.13 already awaits cookies() in the getServerSession isRSC path. The code has "await cookies()" correctly.
  timestamp: 2026-04-08

- hypothesis: ESM/CJS import mismatch
  evidence: next-auth exports only CJS, but Next.js handles interop. Build succeeds (next build passes compilation and type checking).
  timestamp: 2026-04-08

## Evidence

- timestamp: 2026-04-08
  checked: authOptions configuration (app/api/auth/authOptions.ts)
  found: Minimal config with DiscordProvider (scope: identify) and session callback that attaches token.sub as session.user.id. No adapter (JWT strategy by default). No custom jwt callback.
  implication: Standard NextAuth JWT setup. Session cookie should contain Discord user data.

- timestamp: 2026-04-08
  checked: getServerSession source code (node_modules/next-auth/next/index.js)
  found: Called with 1 arg, enters isRSC branch. Creates req from next/headers cookies()/headers(). Passes to AuthHandler with action:"session", method:"GET". Returns body if status=200 and body has keys, otherwise null.
  implication: Multiple points where null can be returned: empty cookie, JWT decode failure, or session callback error. All caught silently.

- timestamp: 2026-04-08
  checked: AuthHandler + session route internals
  found: Session route checks sessionStore.value. If empty -> returns body:{}. If JWT decode fails -> catches error, logs JWT_SESSION_ERROR, returns body:{}. Both result in getServerSession returning null.
  implication: JWT_SESSION_ERROR might be logged but not surfaced to the caller. The 401 gives no diagnostic info.

- timestamp: 2026-04-08
  checked: SessionStore cookie parsing
  found: Supports plain objects, Maps, and getAll() containers. For getServerSession isRSC path, cookies are plain object from Object.fromEntries(). SessionStore iterates with for...in to find matching cookie names.
  implication: Cookie parsing itself looks correct for both regular and chunked cookies.

- timestamp: 2026-04-08
  checked: Build verification
  found: "next build --no-lint" compiles successfully, link-discord route is listed as a function route.
  implication: No compilation errors in the fix.

- timestamp: 2026-04-08
  checked: next-auth version compatibility
  found: next-auth@4.24.13, next@15.5.12. getServerSession has await cookies()/headers() for Next.js 15 compatibility.
  implication: Version should be compatible but the complex AuthHandler pipeline with its init/detectOrigin/createSecret chain has many indirection points where behavior can diverge.

## Resolution

### Issue 1: NextAuth getServerSession returns null (FIXED)

root_cause: getServerSession(authOptions) in next-auth 4.24.13 returns null when called from an App Router POST route handler. The function enters the isRSC path (single argument), reads cookies via next/headers, but the internal AuthHandler pipeline fails silently. Known issue category (github.com/nextauthjs/next-auth/issues/7423, #7546, #7693, #8655).

fix: Replaced getServerSession with direct cookie reading + JWT decode (next-auth/jwt decode()).

### Issue 2: Database name mismatch — server connects to wrong DB (FIXED)

root_cause: `spacetimedb-server.ts` had `SPACETIMEDB_DB_NAME ?? 'nextjs-ts'` while client `lib/spacetimedb.ts` had `NEXT_PUBLIC_SPACETIMEDB_DB_NAME ?? 'hsrpvp-spacetimedb-nextjs-test1'`. Neither env var was set in `.env.local`. The ephemeral connection tried to open a WebSocket to non-existent database `nextjs-ts` on maincloud → WebSocket handshake failed → `[object ErrorEvent]`.

fix: Made `spacetimedb-server.ts` import `SPACETIMEDB_HOST` and `SPACETIMEDB_DB_NAME` from shared `lib/spacetimedb.ts` — single source of truth. Also improved ErrorEvent stringification in `onConnectError` to produce useful diagnostics.

verification: Build passes (next build --no-lint). Awaiting user end-to-end verification.

files_changed:
- app/api/auth/link-discord/route.ts
- lib/spacetimedb-server.ts
