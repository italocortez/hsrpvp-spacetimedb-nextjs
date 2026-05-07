# Technology Stack

**Analysis Date:** 2026-04-12

## Languages

**Primary:**
- TypeScript ~5.6.2 — All frontend (Next.js app, components, lib) and backend (SpacetimeDB module in `spacetimedb/src/`); `strict: true` enforced via `tsconfig.json`
- CSS — Global styles in `app/globals.css`, `app/tokens.css`, and module CSS files (e.g., `app/layout.module.css`)

**Secondary:**
- None — the SpacetimeDB module compiles to WASM via the `spacetimedb` npm SDK's build toolchain (`spacetime build`); no Rust source in this repo

## Runtime

**Environment:**
- Node.js >=24.0.0 (enforced via `engines.node` in `package.json`; active: v24.14.0)

**Package Manager:**
- npm (explicit per project convention; `package-lock.json` present)
- Lockfile: present (`package-lock.json` in root; `spacetimedb/package-lock.json` in backend package)

## Frameworks

**Core:**
- Next.js ^15.0.0 — App Router, API routes, SSR/CSR hybrid; configured in `next.config.ts`
- React ^18.3.1 — UI rendering; `react-dom` ^18.3.1

**UI Component Library:**
- HeroUI (multiple packages ^2.x) — Buttons, chips, inputs, modals, selects, tables, tabs, system, theme; configured in `tailwind.config.ts` via `heroui()` plugin
  - `@heroui/button`, `@heroui/chip`, `@heroui/input`, `@heroui/modal`, `@heroui/select`, `@heroui/system`, `@heroui/table`, `@heroui/tabs`, `@heroui/theme`

**Styling:**
- Tailwind CSS ^4.2.1 — Utility-first CSS; PostCSS integration via `@tailwindcss/postcss` in `postcss.config.mjs`
- Dark mode: class-based, defaultTheme dark with custom cyan (`#00f2ff`) accent palette defined in `tailwind.config.ts`

**Animation:**
- Framer Motion ^12.35.2 — Available; used minimally (e.g., `CostBreakdownChart.tsx` area)

**Charting:**
- Chart.js ^4.5.1 + `react-chartjs-2` ^5.3.1 + `chartjs-plugin-datalabels` ^2.2.0 — Used in `components/features/team-builder/cost-breakdown-chart/CostBreakdownChart.tsx`

**Authentication:**
- next-auth ^4.24.13 — Session management; Discord OAuth provider only; `SessionProvider` wraps app in `app/providers.tsx`

**Testing:**
- Vitest ^4.1.0 — Both unit and integration test runner; configs at `test/vitest.config.ts` and `test/vitest.integration.config.ts`
- 63 total test files (including 10 unit test files): 58 pre-Phase 12.3 + 5 new Phase 12.3 test files

**Build/Dev:**
- `next dev` / `next build` / `next start` — Standard Next.js dev/build/serve scripts
- `prettier` — Auto-formats generated SpacetimeDB bindings after `npm run spacetime:generate`

## Key Dependencies

**Critical:**
- `spacetimedb` ^2.1.0 (root package) — SpacetimeDB TypeScript SDK 2.1.0 (upgraded in Phase 12.2); used as the client SDK (frontend via `spacetimedb/react`) and to connect to the SpacetimeDB WebSocket API
  - **Breaking change in 2.1.0:** Reducer calls now return `Promise<void>` — use `.catch()` for error handling (not `_then()`)
  - **Breaking change in 2.1.0:** Views must be `export const` (not side-effect imports) for `[registerExport]` to fire
  - **Breaking change in 2.1.0:** `.withConfirmedReads(false)` required to revert to pre-2.1.0 subscription latency
- `spacetimedb` ^2.0.3 (spacetimedb/package.json) — Server module runtime SDK; the backend module compiles against this version via `spacetime build`
- `next-auth` ^4.24.13 — Discord OAuth session; required for the Discord-to-SpacetimeDB identity linking flow

**Infrastructure:**
- `@tailwindcss/postcss` ^4.2.1 — PostCSS integration for Tailwind v4
- `postcss` ^8.5.8 — CSS processing pipeline

## Configuration

**Environment:**
- `.env.local` (not committed) — runtime secrets; `.env.example` documents all required vars
- `NEXT_PUBLIC_SPACETIMEDB_HOST` and `NEXT_PUBLIC_SPACETIMEDB_DB_NAME` — client-side connection (exposed to browser)
- `SPACETIMEDB_HOST`, `SPACETIMEDB_DB_NAME`, `SPACETIMEDB_SERVER_TOKEN` — server-side only (API routes)
- `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — Discord OAuth

**SpacetimeDB project config:**
- `spacetime.json` — database name (`hsrpvp-spacetimedb-nextjs-test1`), server (`maincloud`), module path (`./spacetimedb`)
- `spacetime.local.json` — local dev database name override

**Build:**
- `tsconfig.json` — ES2020 target, bundler module resolution, strict mode, path alias `@/*` → project root
- `next.config.ts` — CSP headers (allows `wss://maincloud.spacetimedb.com`, Discord CDN, `ws://localhost:*` for dev); security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`)
- `postcss.config.mjs` — only `@tailwindcss/postcss` plugin
- `tailwind.config.ts` — HeroUI plugin, dark theme, custom color palette

**Backend module config:**
- `spacetimedb/tsconfig.json` — separate TS config for the SpacetimeDB module (`outDir: ./dist`)
- `spacetimedb/package.json` — standalone package with `spacetimedb` ^2.0.3 and TypeScript ~5.6.2

## Platform Requirements

**Development:**
- Node.js >=24.0.0
- SpacetimeDB CLI (`spacetime`) — required for `spacetime generate`, `spacetime publish`, `spacetime build`
- Network access to `wss://maincloud.spacetimedb.com` for integration tests and module publishing

**Production:**
- Deployment target: Vercel (Next.js hosting)
- SpacetimeDB backend hosted on SpacetimeDB maincloud (`https://spacetimedb.com/@<username>/hsrpvp-spacetimedb-nextjs-test1`)
- Port note: `next dev` should run on port 3001 to avoid conflict with SpacetimeDB local server on port 3000

## Version History Notes

| Version | Change |
|---------|--------|
| Phase 12.3 | `rosterMutations.ts` helper added (applyBatchUpsert, applyBatchRemove); `accountRatingSnapshot` column added to `MatchResultParticipant`; `requireOwnership` column added to `Tournament`; 5 new test files; D-G lobby guards in roster reducers; D-H ordering guard in tournament finalization |
| Phase 14 | `test/global-setup.ts` added — pre-suite DB clear + reseed; `.withConfirmedReads(false)` on test connection builder; `onApplied` subscription readiness callback replaces fixed-timeout `sync()` for initial data load; `testTimeout` raised to 60s; `hookTimeout` raised to 120s |
| Phase 12.2 | SDK upgraded from `^2.0.3` to `^2.1.0` in root `package.json`; view export pattern changed to `export const`; reducer error handling changed to `.catch()`; `.withConfirmedReads(false)` added |
| Phase 12 | UserPrivate table added (`public: false`); server_link_discord replaced by server_link_provider (generic OAuth bridge) |
| Phase 12.1 | IdentityGcJob scheduled reducer added; identity TTL = 90 days |
| Phase 10.5 | Test suite stabilized: shared helpers in `test/shared/helpers/`, `cleanupLobby`/`cleanupTournament` cleanup pattern, `afterAll` cleanup |

---

*Stack analysis: 2026-04-12 (regenerated from 2026-04-09 to reflect Phase 12.3 schema additions and Phase 14 test infrastructure changes)*
