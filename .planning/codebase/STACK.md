# Technology Stack

**Analysis Date:** 2026-03-15

## Languages

**Primary:**
- TypeScript 5.6.x - Frontend (app/, components/, lib/), Backend SpacetimeDB module (spacetimedb/src/)

**Secondary:**
- CSS (via Tailwind utility classes) - Styling throughout components

## Runtime

**Environment:**
- Node.js >=24.0.0 (enforced in `package.json` engines field)

**Package Manager:**
- npm (root project) — `package-lock.json` present
- pnpm (spacetimedb subdirectory) — referenced in generate script
- Lockfile: `package-lock.json` present at root

## Frameworks

**Core:**
- Next.js ^15.0.0 — App Router, SSR, API Routes. Entry: `app/layout.tsx`
- React ^18.3.1 — UI rendering, client components

**UI Component Library:**
- HeroUI (v2) — `@heroui/button`, `@heroui/chip`, `@heroui/input`, `@heroui/modal`, `@heroui/select`, `@heroui/system`, `@heroui/table`, `@heroui/tabs`, `@heroui/theme`
- Configured dark theme with custom cyan (`#00f2ff`) primary in `tailwind.config.ts`
- Provider: `HeroUIProvider` wraps the app in `app/providers.tsx`

**Animation:**
- Framer Motion ^12.35.2 — motion animations in UI components

**Charts:**
- Chart.js ^4.5.1 + react-chartjs-2 ^5.3.1 — data visualization
- chartjs-plugin-datalabels ^2.2.0 — chart label rendering

**Auth:**
- next-auth ^4.24.13 — Discord OAuth authentication. Config: `app/api/auth/authOptions.ts`

**Testing:**
- Not detected

**Build/Dev:**
- TypeScript compiler (`tsc`) — both frontend and backend
- PostCSS ^8.5.8 with `@tailwindcss/postcss` ^4.2.1 — CSS processing. Config: `postcss.config.mjs`
- Tailwind CSS ^4.2.1 — utility-first CSS. Config: `tailwind.config.ts`

## Key Dependencies

**Critical:**
- `spacetimedb` ^2.0.3 — Real-time multiplayer database SDK. Used in `app/providers.tsx` (client WebSocket), `lib/spacetimedb-server.ts` (server singleton), and `spacetimedb/src/` (module definition)
- `next-auth` ^4.24.13 — Session management and Discord OAuth gate

**Infrastructure:**
- `@heroui/theme` ^2.4.26 — Design system tokens, dark mode theme
- `framer-motion` ^12.35.2 — UI animations

## SpacetimeDB Backend Module

**Location:** `spacetimedb/` (separate Node.js package)

**Runtime:** SpacetimeDB JS/TS SDK (`spacetimedb/server`)

**Module entry:** `spacetimedb/src/index.ts`

**Schema file:** `spacetimedb/src/schema.ts`

**Build:** `spacetime build` command via `spacetimedb/package.json`

**Generated bindings:** `src/module_bindings/` — auto-generated TypeScript types from the module. Generated via `pnpm run generate` or `pnpm run spacetime:generate`

**Tables defined:**
- User, UserIdentity, ServerIdentity
- HsrCharacter, HsrLightcone
- HsrCharacterCost, HsrLightconeCost, HsrSynergyCost
- Lobby, LobbyMember, LobbyCursorEvent
- MatchSession, MatchSessionStep
- MatchSessionHistory, MatchSessionStepHistory
- UserDeletionJob

**Reducers defined:**
- `login_as_guest`, `delete_guest_account`
- `update_display_name`, `update_username`, `update_avatar`
- `broadcast_cursor`
- `register_server`, `server_link_discord`, `server_set_role`, `server_delete_user`
- `admin_delete_row`, `admin_bulk_upsert`, `admin_update_user`
- `run_user_deletion`

## Configuration

**Environment:**
- Variables defined in `.env.local` (not committed). Template: `.env.example`
- Required vars:
  - `NEXT_PUBLIC_SPACETIMEDB_HOST` — WebSocket URL (client-side)
  - `NEXT_PUBLIC_SPACETIMEDB_DB_NAME` — Database name (client-side)
  - `SPACETIMEDB_HOST` — WebSocket URL (server-side)
  - `SPACETIMEDB_DB_NAME` — Database name (server-side)
  - `SPACETIMEDB_SERVER_TOKEN` — Trusted server identity token (never expose to client)
  - `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET` — Discord OAuth app credentials
  - `NEXTAUTH_SECRET`, `NEXTAUTH_URL` — NextAuth session config

**Build:**
- `next.config.ts` — Minimal Next.js config (note: SpacetimeDB runs on port 3000, Next.js should use port 3001)
- `tsconfig.json` — Path alias `@/*` maps to repo root
- `tailwind.config.ts` — HeroUI dark theme with custom color palette
- `spacetime.json` — SpacetimeDB project config: database `hsrpvp-spacetimedb-nextjs-test1`, server `maincloud`

## Platform Requirements

**Development:**
- Node.js >=24.0.0
- SpacetimeDB CLI (`spacetime` command) for module building and publishing
- `pnpm` for spacetimedb subdirectory installs

**Production:**
- SpacetimeDB Maincloud (`maincloud.spacetimedb.com`) for backend module
- Next.js deployment target (Vercel or Node.js server)

---

*Stack analysis: 2026-03-15*
