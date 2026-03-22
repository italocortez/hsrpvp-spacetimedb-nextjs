# Frontend Developer Handoff

> **TL;DR:** The backend (v0.5) is complete through Phase 6.1. You have 55 tables, 80+ reducers, generated TypeScript bindings, and a working auth system. The frontend (v1) needs to be built on top of this. This doc routes you to everything you need.

## What's Ready

- **55 production tables** with audit trails, composite PKs, and proper relationships
- **80+ reducers** covering auth, tournaments, rosters, brackets, match results, MMR, stats, seasons
- **130 generated TypeScript binding files** in `src/module_bindings/` — type-safe reducer calls and table subscriptions
- **19 feature doc sets** in `docs/{feature}/` with architecture diagrams and behavior specs
- **Working auth** — guest login via SpacetimeDB identity, Discord OAuth linking via NextAuth
- **Landing page** — just redesigned (Phase 06.1) with video hero, features carousel, contact section

## What's NOT Ready (Phases 7-10)

| Phase | What | Status |
|-------|------|--------|
| 7 | Achievements & Titles | Schema exists, no reducers |
| 8 | Calendar & Scheduling | Schema exists, no reducers |
| 9 | Lobby Browser, Chat, Cursor Tracking | Schema exists, basic cursor reducer only |
| 10 | Disconnect Handling, Cost Parity | Nothing implemented |
| 11 | Archetype Playstyle Stats | Not started — PlayerArchetypeStat table, auto-increment when 3+ picks share an archetype tag |

Phases 7-11 are remaining backend tasks (all v0.5 scope). The frontend dev doesn't need to wait for them unless building UI for those specific features.

---

## Index — Where to Find Things

### Architecture & Behavior Specs

Each feature has two docs. Architecture = tables, reducers, data flow. Contract = acceptance scenarios (Given/When/Then), edge cases, error messages.

| Feature | Architecture | Contract | Phase |
|---------|-------------|----------|-------|
| Auth | [docs/auth/architecture.md](auth/architecture.md) | [docs/auth/contract.md](auth/contract.md) | 1 |
| Roster | [docs/roster/architecture.md](roster/architecture.md) | [docs/roster/contract.md](roster/contract.md) | 2 |
| Archetypes | [docs/archetypes/architecture.md](archetypes/architecture.md) | [docs/archetypes/contract.md](archetypes/contract.md) | 2 |
| Tournament | [docs/tournament/architecture.md](tournament/architecture.md) | [docs/tournament/contract.md](tournament/contract.md) | 3 |
| Teams | [docs/teams/architecture.md](teams/architecture.md) | [docs/teams/contract.md](teams/contract.md) | 3 |
| Cost Sets | [docs/cost-sets/architecture.md](cost-sets/architecture.md) | [docs/cost-sets/contract.md](cost-sets/contract.md) | 3 |
| Brackets | [docs/brackets/architecture.md](brackets/architecture.md) | [docs/brackets/contract.md](brackets/contract.md) | 4 |
| Match Results | [docs/match-results/architecture.md](match-results/architecture.md) | [docs/match-results/contract.md](match-results/contract.md) | 5 |
| MMR | [docs/mmr/architecture.md](mmr/architecture.md) | [docs/mmr/contract.md](mmr/contract.md) | 5 |
| Anonymous Play | [docs/anonymous-play/architecture.md](anonymous-play/architecture.md) | [docs/anonymous-play/contract.md](anonymous-play/contract.md) | 6 |
| Player Stats | [docs/player-stats/architecture.md](player-stats/architecture.md) | [docs/player-stats/contract.md](player-stats/contract.md) | 6 |
| Lobby | [docs/lobby/architecture.md](lobby/architecture.md) | [docs/lobby/contract.md](lobby/contract.md) | 3 |
| Match Session | [docs/match-session/architecture.md](match-session/architecture.md) | [docs/match-session/contract.md](match-session/contract.md) | 1 |
| Cost Tables | [docs/cost-tables/architecture.md](cost-tables/architecture.md) | [docs/cost-tables/contract.md](cost-tables/contract.md) | — |
| Views | [docs/views/architecture.md](views/architecture.md) | — | 6 |

### Project Planning

| What | File |
|------|------|
| Full requirements | [.planning/REQUIREMENTS.md](../.planning/REQUIREMENTS.md) |
| Roadmap & phase status | [.planning/ROADMAP.md](../.planning/ROADMAP.md) |
| Current state | [.planning/STATE.md](../.planning/STATE.md) |
| Project overview | [.planning/PROJECT.md](../.planning/PROJECT.md) |

### Code Locations

| What | Path | Notes |
|------|------|-------|
| Backend tables | `spacetimedb/src/tables/` | 55 table definitions |
| Backend reducers | `spacetimedb/src/reducers/` | 80+ reducers |
| Backend helpers | `spacetimedb/src/helpers/` | ELO calc, bracket gen, stats, audit |
| Backend enums | `spacetimedb/src/types/enums.ts` | Role, GameMode, TournamentStage, etc. |
| Generated bindings | `src/module_bindings/` | 130 files, regenerate with `spacetime generate` |
| Frontend components | `components/features/` | 34 components across 8 feature groups |
| Pages | `app/` | Landing, costs, teambuilder, lobby, profile, admin, draft |
| Auth system | `components/features/auth/` | AuthProvider, useAuth, LoginForm |
| Connection config | `lib/spacetimedb.ts` | Host + DB name |
| Providers stack | `app/providers.tsx` | SpacetimeDB → Auth → GameData |

---

## How the Frontend Talks to the Backend

### Connection

SpacetimeDB uses a persistent WebSocket. The connection is established once at app root (`app/providers.tsx`) and shared via React context.

```
lib/spacetimedb.ts          → host + db name config
app/providers.tsx            → DbConnection.builder() → SpacetimeDBProvider
components/.../AuthProvider  → subscribes to UserIdentity + User tables
components/.../GameDataProvider → subscribes to HsrCharacter, HsrLightcone, costs
```

### Reading Data (Subscriptions)

Tables auto-sync via WebSocket subscription. Use the `useTable` hook:

```typescript
import { tables } from '@/src/module_bindings';

// Returns [rows[], isReady]
const [characters] = useTable(tables.HsrCharacter);
const [tournaments] = useTable(tables.Tournament);
```

Data updates automatically when the backend changes — no polling, no refetching.

### Writing Data (Reducer Calls)

Reducers are transactional server-side functions. They **do not return data** — you read results via table subscriptions.

```typescript
import { DbConnection } from '@/src/module_bindings';

const conn = getConnection(); // from useSpacetimeDB()
conn.reducers.create_tournament({
  name: "Weekly Cup",
  format: "SingleElimination",
  // ...
});
// Table subscription auto-updates with new tournament row
```

### Key Gotchas

| Gotcha | Detail |
|--------|--------|
| **Reducers don't return data** | Read via table subscriptions, not return values |
| **Enums are tag objects** | `tournament.stage.tag === 'Registration'` not `=== 'Registration'` |
| **JSON string params** | Complex args passed as `JSON.stringify(...)` |
| **Timestamps** | SpacetimeDB `Timestamp` → `new Date(Number(ts) * 1000)` for display |
| **Optional = sentinel** | `0` for missing u32, empty string for missing text |
| **Identity vs userId** | `Identity` = opaque hex, `userId` = numeric. `UserIdentity` maps between them |
| **Auto-increment gaps** | IDs have gaps — don't use for ordering |
| **ctx.sender** | Backend uses sender identity for auth — never trust client-supplied identity |

---

## Existing Frontend Pages

| Route | Layout | Auth Required | What's There |
|-------|--------|---------------|-------------|
| `/` | landing-page | No | Hero video, features carousel, contact section |
| `/costs` | landing-page | No | Cost table browser |
| `/teambuilder` | landing-page | No | Team composition builder |
| `/lobby` | authenticated | Yes | Lobby placeholder (stub) |
| `/profile` | authenticated | Yes | User profile, Discord link, logout |
| `/admin-view` | authenticated | Yes (Admin) | Table explorer, bulk upsert, user manager |
| `/draft/[matchId]` | game | Yes | Draft picking placeholder (stub) |

### Auth Flow

1. App loads → SpacetimeDB WebSocket connects (auto, with stored token)
2. If no token → new identity created, stored in localStorage
3. User clicks LOG IN → `loginAsGuest()` reducer creates User + UserIdentity
4. Optional: Discord OAuth via NextAuth → `server_link_discord` upgrades guest to Discord user
5. `AuthRequired` wrapper on protected pages shows LoginForm if not authenticated

---

## Design System

The landing page uses a custom token system (`app/tokens.css`) with 89 CSS custom properties:

- **Colors:** `--color-void` (#0A0A0B), `--color-iris` (#7C6AFF), `--color-haze` (#2A2640), etc.
- **Fonts:** `--font-inter` (body), `--font-jetbrains-mono` (headings, labels, code)
- **Gradients, shadows, border radii** all tokenized

The authenticated pages currently use HeroUI components. The landing page uses CSS modules with the token system.

---

## For AI Agents

If you're an AI agent reading this file, here's your routing guide:

- **To understand a feature's data model:** Read `docs/{feature}/architecture.md`
- **To understand expected behavior:** Read `docs/{feature}/contract.md`
- **To see what reducer params look like:** Read `src/module_bindings/{reducer_name}_reducer.ts`
- **To see table schemas:** Read `src/module_bindings/{table_name}_table.ts`
- **To understand auth flow:** Read `components/features/auth/hooks/useAuth.ts`
- **To understand data subscriptions:** Read `components/features/game-data/components/GameDataProvider.tsx`
- **To understand the connection:** Read `app/providers.tsx` and `lib/spacetimedb.ts`
- **To see project requirements:** Read `.planning/REQUIREMENTS.md`
- **To see what's done vs pending:** Read `.planning/ROADMAP.md`
- **To see the design token system:** Read `app/tokens.css`
- **To understand SpacetimeDB patterns:** Read `.claude/skills/spacetimedb/SKILL.md`
