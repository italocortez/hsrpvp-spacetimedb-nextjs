# Architecture

**Analysis Date:** 2026-03-16

## Overview

Distributed client-server architecture. SpacetimeDB provides the real-time multiplayer database and transactional reducer engine. Next.js serves the frontend and hosts API routes for Discord OAuth. All state flows through SpacetimeDB subscriptions; the frontend is reactive.

## Layers

```
Browser
  └─ Next.js App (React 18)
       ├─ Providers: SessionProvider > HeroUIProvider > SpacetimeDBProvider > AuthProvider > GameDataProvider
       ├─ Pages: (landing-page), (authenticated), (game)
       └─ API Routes: /api/auth/* (NextAuth + Discord link)
              │
              ▼
       lib/spacetimedb-server.ts  (server-side singleton DbConnection)
              │
              ▼
SpacetimeDB Module (spacetimedb/src/)
  ├─ schema.ts          — registers all 38 tables
  ├─ index.ts           — exports reducers, clientConnected/clientDisconnected hooks
  ├─ tables/            — 38 table definitions
  ├─ reducers/          — 5 reducer files (auth, profile, server, admin, cursor, userDeletion)
  ├─ helpers/           — auditColumns, ensurePermissions
  └─ types/             — enums.ts (27 enums), structs.ts (14 struct types)
```

## Database Schema (38 tables)

**User/Auth (3):** User, UserIdentity, ServerIdentity
**Static Game Data (3):** HsrCharacter, HsrLightcone
**Economy (3):** HsrCharacterCost, HsrLightconeCost, HsrSynergyCost
**Roster Management (3):** HsrAccount, HsrAccountCharacter, HsrAccountLightcone
**Lobby System (3):** Lobby, LobbyMember, LobbyCursorEvent
**Active Game (2):** MatchSession, MatchSessionStep
**History (2):** MatchSessionHistory, MatchSessionStepHistory
**Tournament (3):** Tournament, TournamentParticipant, TournamentAssistant
**Teams (3):** Team, TeamMember, TeamInvite
**Brackets (2):** BracketMatch, GroupStanding
**Match Results (2):** MatchResultRecord, MatchResultGame
**MMR (2):** MmrRating, MmrHistory
**Player Stats (2):** PlayerStats, CharacterStats
**Achievements (2):** Achievement, UserAchievement
**Calendar (4):** AvailabilitySlot, SavedCalendar, CalendarEvent, CalendarEventInvite
**Chat (1):** ChatMessage
**Jobs (1):** UserDeletionJob

## Reducers (13 exported)

| Reducer | File | Access |
|---------|------|--------|
| `login_as_guest` | auth.ts | Any client |
| `delete_guest_account` | profile.ts | Authenticated user |
| `update_display_name` | profile.ts | Authenticated user |
| `update_username` | profile.ts | Authenticated user |
| `update_avatar` | profile.ts | Authenticated user |
| `broadcast_cursor` | cursor.ts | Authenticated user |
| `register_server` | server.ts | First caller only |
| `server_link_discord` | server.ts | Server identity only |
| `server_set_role` | server.ts | Server identity only |
| `server_delete_user` | server.ts | Server identity only |
| `admin_delete_row` | admin.ts | Admin role |
| `admin_bulk_upsert` | admin.ts | Admin role |
| `admin_update_user` | admin.ts | Admin role |
| `run_user_deletion` | userDeletion.ts | Scheduled job |

## Frontend Structure

```
app/
  (landing-page)/     — public: home, costs calculator, team builder
  (authenticated)/    — guarded: lobby, profile, admin-view
  (game)/             — draft/[matchId] (live drafting UI)
  api/auth/           — NextAuth handler, Discord link endpoint

components/
  features/
    admin-view/       — AdminTabs, BulkUpsert, UserManager, TableExplorer
    auth/             — AuthProvider, AuthRequired, LoginForm, DeletionBanner
    costs/            — CharacterCostTable, LightconeCostTable, GlobalFilterBar
    drafting/         — CharacterPool, CharacterCard, LightconeSelector, BanSlots, DraftArea (classic + auction)
    game-data/        — GameDataProvider, DataHelpers
    landing/          — FeatureCards
    profile/          — ProfileCard, DiscordLink
    team-builder/     — TeamRoster, Teamslot, LoadoutControls, CostBreakdownChart, SynergyDisplay
    hooks/            — useCharacterFilters, useLightconeFilters, useLoadouts, useIconMaps
    types/            — tableColumns, structs, enums (frontend mirrors)
  globals/
    icons/            — Game element/path icons
    layout/           — Header, Footer
    modals/           — DeleteConfirmModal
```

## Data Flow Patterns

**Client auth:** Browser connects to SpacetimeDB with stored token. Calls `login_as_guest` reducer. SpacetimeDB creates User + UserIdentity. Client subscribes to tables, gets reactive updates.

**Discord linking:** User clicks Discord login. NextAuth handles OAuth. API route `/api/auth/link-discord` calls `server_link_discord` via server-side DbConnection. Reducer upgrades guest to Discord-linked user.

**Game state:** Components call reducers (mutations). Reducer modifies tables transactionally. SpacetimeDB broadcasts changes to all subscribers. React re-renders via `useTable()` hook.

**Audit trail:** Every table has `createdById`, `createdDate`, `lastModifiedById`, `lastModifiedDate` columns. `auditInsert()` and `auditUpdate()` helpers inject these in all reducers.

## Key Abstractions

- **`getAuthenticatedUser(ctx)`** — resolves ctx.sender to User via UserIdentity lookup
- **`ensureAdmin(ctx)` / `ensureTournamentHost(ctx)`** — role-based access control
- **`auditInsert()` / `auditUpdate()`** — audit column injection
- **`requireServer(ctx)`** — verifies caller is registered server identity
- **Provider tree** — SessionProvider > HeroUIProvider > SpacetimeDBProvider > AuthProvider > GameDataProvider

---

*Architecture analysis: 2026-03-16*
