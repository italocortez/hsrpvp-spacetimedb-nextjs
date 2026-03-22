# Technology Stack

**Analysis Date:** 2026-03-16

## Languages

- **TypeScript 5.6.2** — all application code, frontend and backend
- SpacetimeDB compiles TypeScript modules to WASM via `spacetime build`

## Runtime

- **Node.js >= 24.0.0** (declared in `package.json` engines)
- **Package manager:** npm/pnpm (pnpm used for spacetimedb subproject via `pnpm --dir`)

## Core Frameworks

| Framework | Version | Role |
|-----------|---------|------|
| Next.js | 15.0.0 | Full-stack React framework (app router) |
| React | 18.3.1 | UI rendering |
| SpacetimeDB | 2.0.3 | Multiplayer database, real-time sync, transactional reducers |
| NextAuth | 4.24.13 | Discord OAuth session management |

## UI Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| Tailwind CSS | 4.2.1 | Utility-first CSS |
| HeroUI | 2.x | Pre-built components (button, chip, input, modal, select, table, tabs) |
| Framer Motion | 12.35.2 | Animation |
| Chart.js | 4.5.1 | Data visualization (with react-chartjs-2 5.3.1, chartjs-plugin-datalabels 2.2.0) |

## Build & Dev

| Tool | Purpose |
|------|---------|
| PostCSS 8.5.8 | CSS pipeline (Tailwind integration) |
| TypeScript strict mode | Type checking at build |
| `spacetime` CLI | Module build, publish, binding generation |

## Key Environment Variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SPACETIMEDB_HOST` | Client WebSocket URL (default: `wss://maincloud.spacetimedb.com`) |
| `NEXT_PUBLIC_SPACETIMEDB_DB_NAME` | Database name (default: `nextjs-ts`) |
| `SPACETIMEDB_SERVER_TOKEN` | Server identity auth token |
| `DISCORD_CLIENT_ID` / `DISCORD_CLIENT_SECRET` | OAuth credentials |
| `NEXTAUTH_SECRET` / `NEXTAUTH_URL` | Session encryption |

## Testing

- **None configured.** No test runner, no test files in the codebase.

## Deployment

- **Frontend:** Vercel (implied by Next.js setup and skill config)
- **Backend:** SpacetimeDB maincloud (free hosted; published via `spacetime publish`)

## Scripts

| Script | Purpose |
|--------|---------|
| `dev` | Next.js dev server |
| `build` | Production build |
| `generate` | Regenerate TypeScript bindings from SpacetimeDB module |
| `spacetime:publish` | Publish module to maincloud |
| `spacetime:publish:local` | Publish to local SpacetimeDB server |

---

*Stack analysis: 2026-03-16*
