# Architecture

**Analysis Date:** 2026-04-09

## Pattern Overview

**Overall:** Dual-tier real-time application — SpacetimeDB WASM module (backend) + Next.js App Router (frontend), connected via persistent WebSocket subscriptions.

**Key Characteristics:**
- All persistent state lives in SpacetimeDB tables on maincloud; there is no traditional REST API for game data
- Clients subscribe to table data and receive live push updates — no polling
- Reducers (server-side functions) replace mutation endpoints; they are transactional and return no data
- A thin Next.js API layer (`app/api/`) exists solely for trusted server-to-server operations (Discord OAuth bridge)
- Views (`spacetimedb/src/views/`) gate per-user data access server-side — private tables are never broadcast, only exposed through named views

## Layers

**SpacetimeDB Module (Backend):**
- Purpose: Single source of truth for all game and user state; processes all mutations via reducers
- Location: `spacetimedb/src/`
- Contains: 67 table definitions (`tables/`), 44 reducer files (`reducers/`), 25 helper utilities (`helpers/`), security + anonymous views (`views/`), types (`types/enums.ts`, `types/structs.ts`)
- Depends on: `spacetimedb/server` SDK (^2.0.3 in the module's own package)
- Compiles to: `spacetimedb/dist/bundle.js` — published to SpacetimeDB maincloud via `spacetime publish`

**Generated Client Bindings:**
- Purpose: Type-safe TypeScript bridge between the frontend and SpacetimeDB module
- Location: `src/module_bindings/` (236 files)
- Contains: One file per table, one per reducer, 32 `view_*_table.ts` files (added Phase 12.2)
- Depends on: SpacetimeDB module (must republish + `spacetime generate` after schema changes)

**Next.js App (Frontend):**
- Purpose: UI layer — renders pages, manages client-side state, handles user interactions
- Location: `app/`, `components/`, `lib/`
- Depends on: `src/module_bindings/`, `spacetimedb/react` hooks (SDK 2.1.0), NextAuth, HeroUI

**Next.js API Routes:**
- Purpose: Trusted server-side operations requiring secrets unavailable to the browser
- Location: `app/api/`
- Contains: `auth/[...nextauth]/route.ts`, `auth/link-discord/route.ts`
- Note: Backend reducer is `server_link_provider` (renamed from `server_link_discord` in Phase 12)

**Server Connection Singleton:**
- Purpose: Persistent SpacetimeDB WebSocket connection on the Next.js server process, authenticated as privileged server identity
- Location: `lib/spacetimedb-server.ts`
- Depends on: `SPACETIMEDB_SERVER_TOKEN` env var

## Data Flow

**Real-Time Game Data (Primary Path):**

1. `app/providers.tsx` initializes `DbConnection.builder().withConfirmedReads(false).build()` (Phase 12.2) with stored auth token; connects via WebSocket to maincloud
2. `SpacetimeDBProvider` (from `spacetimedb/react`) makes the connection available to all child components
3. Feature hooks subscribe to table rows via `useTable(tables.TableName)`; updates arrive as push deltas
4. Components render from subscribed table state — no fetch calls for game data

**Mutation Flow:**
1. UI component calls `conn.reducers.reducerName(args).catch(err => console.error(...))`
   - Phase 12.2: Reducer calls return `Promise<void>` — use `.catch()` for error handling, not `_then()`
2. SpacetimeDB processes the reducer transactionally on the server
3. Affected table rows broadcast back to all subscribed clients
4. React re-renders from updated subscription state

**View Subscription Flow (Phase 12.2):**
1. Views registered as `export const view_xxx = spacetimedb.view(...)` in `views/securityViews.ts` or `anonymousViews.ts`
2. All views re-exported from `spacetimedb/src/index.ts` (required for `[registerExport]` to fire)
3. Client subscribes via `conn.db.view_xxx.onInsert` / `conn.db.view_xxx.onUpdate` callbacks
4. `view_my_profile` is the primary source for auth profile data (includes private fields from UserPrivate)

**Discord Authentication Flow:**
1. User clicks "Connect with Discord" — `sessionStorage` intent flag set, `signIn("discord")` called
2. After OAuth redirect, `useAuth` detects `nextAuthStatus === "authenticated"` + intent flag
3. If no SpacetimeDB identity mapping exists, `loginAsGuest` reducer called to create one
4. Client calls `POST /api/auth/link-discord` with its identity hex
5. API route verifies NextAuth session server-side, then calls `server_link_provider` via server identity connection
6. SpacetimeDB updates `UserPrivate` and `User` rows; `view_my_profile` delivers update to client

**Auth Profile Resolution (Phase 12.2 pattern):**
1. Primary: `conn.db.view_my_profile.iter()` — includes discordId, discordUsername from UserPrivate
2. Fallback: `conn.db.User.iter()` subscription cache
3. Dead (removed): `view_my_identity` SQL subscription (D-17)

**State Management:**
- No global client state store (no Redux/Zustand) — all authoritative state is in SpacetimeDB subscriptions
- React Context for derived auth state (`AuthContext`) and static game data (`GameDataContext`)
- `useAuth` in `components/features/auth/hooks/useAuth.ts` is the single auth orchestrator

## Key Abstractions

**SpacetimeDB Views (32 total — Phase 12.2):**
- Pattern: `export const view_xxx = spacetimedb.view(...)` — must be `export const` for registration
- `spacetimedb.view(...)` — authenticated views (ctx.sender resolved to userId)
- `spacetimedb.anonymousView(...)` — public projections accessible without auth
- `securityViews.ts` (24): `view_my_profile`, `view_lobby_browser`, `view_my_roster`, `view_admin_user_private`, `view_my_tournaments`, etc.
- `anonymousViews.ts` (8): `view_my_lobby_chat`, `view_my_lobby_members`, `view_my_match_steps`, `view_my_match_participants`, `view_match_history`, `view_match_participant_history`, `view_match_step_history`, `view_public_accounts`

**Reducer Permission Guards:**
- Location: `spacetimedb/src/helpers/ensurePermissions.ts`
- Role hierarchy: Admin=100, Moderator=75, TournamentHost=50, User=25, Guest=0
- Guards: `getAuthenticatedUser`, `ensureAdmin`, `ensureModerator`, `ensureTournamentHost`, `ensureVerifiedUser`, `ensureAuthenticated`
- Error prefixes: `"Unauthorized: ..."` (identity issues), `"Forbidden: ..."` (insufficient role)

**Audit Columns:**
- Location: `spacetimedb/src/helpers/auditColumns.ts`
- `auditInsert(ctx, userId)` — `{createdById, createdDate, lastModifiedById, lastModifiedDate}`
- `auditUpdate(ctx, existing, userId)` — preserves original created fields
- `SYSTEM_USER_ID = 0` — used for scheduled/system-initiated operations

**UserPrivate Table (Phase 12):**
- Purpose: Isolates sensitive Discord OAuth data from the public `User` table
- `public: false` — never broadcast to client subscriptions (CR-01)
- Columns: `userId` (PK, FK to User), `discordId`, `discordUsername`, `email`, audit columns
- Accessed via: `view_admin_user_private` (admin only), `view_my_profile` (current user)

**Identity GC (Phase 12.1):**
- Purpose: Clean up stale/orphaned SpacetimeDB identity rows for verified users
- Location: `spacetimedb/src/reducers/identityGc.ts`, `spacetimedb/src/tables/identityGcJob.ts`
- Schedule: Weekly (every 7 days); TTL: 90 days for verified user identities
- Rules: Skip guest users; skip online users; always preserve newest identity per user
- Pattern: `IdentityGcJob` scheduled table uses mutable binding (`setRunIdentityGcReducer`) to avoid circular import

**Route Groups (Next.js):**
- `(authenticated)` wraps pages in `AuthRequired`
- `(game)` wraps live draft page
- `(landing-page)` is public

**GameDataProvider:**
- Subscribes to static HSR game data (`HsrCharacter`, `HsrLightcone`, `HsrCharacterCost`, `HsrLightconeCost`, `HsrSynergyCost`) once at app root; exposes via `useGameData()` context

## Feature Domain Map

| Feature Domain | Key Tables | Key Reducers | Key Helpers |
|---------------|------------|--------------|-------------|
| Auth / Users | `User`, `UserIdentity`, `UserPrivate`, `ServerIdentity`, `UserDeletionJob` | `login_as_guest`, `server_link_provider`, `server_set_role` | `ensurePermissions.ts`, `auditColumns.ts` |
| Identity GC | `IdentityGcJob` | `run_identity_gc`, `admin_trigger_identity_gc` | — |
| Roster | `HsrAccount`, `HsrAccountCharacter`, `HsrAccountLightcone`, `Archetype` | `create_hsr_account`, `batch_upsert_characters` | `rosterHelpers.ts`, `accountRating.ts` |
| Game Data | `HsrCharacter`, `HsrLightcone`, `HsrCharacterCost`, `HsrLightconeCost`, `HsrSynergyCost` | `admin_bulk_upsert`, `admin_delete_row` | — |
| Cost Sets | `CostSet`, `CostSetDraftCharacter`, `CostSetDraftLightcone`, `CostSetDraftSynergy` | `create_cost_set`, `publish_cost_set` | — |
| Lobby | `Lobby`, `LobbyMember`, `LobbyMemberAccount`, `LobbyBan`, `LobbyGcJob`, `GcResult` | `create_lobby`, `join_lobby`, `close_lobby`, `run_lobby_gc` | `lobbyHelpers.ts`, `disconnectHelpers.ts` |
| Draft | `MatchSession`, `MatchSessionStep`, `MatchSessionHistory`, `MatchSessionStepHistory` | `start_draft_classic`, `pick_ban_action` | `draftSequences.ts`, `anonymousLabels.ts` |
| Match Results | `MatchResultRecord`, `MatchResultGame`, `MatchResultParticipant` | `submit_match_result`, `finalize_match_result` | `finalizationHelpers.ts`, `bracketHelpers.ts` |
| MMR / Leaderboard | `MmrRating`, `MmrHistory`, `Leaderboard`, `EloConfig`, `Season` | `process_tournament_mmr`, `create_season` | `eloCalculation.ts`, `leaderboardRebuild.ts` |
| Player Stats | `PlayerStat`, `CharacterStat`, `GlobalCharacterStat` | (computed during finalization) | `statsIncrement.ts`, `characterStatsIncrement.ts` |
| Achievements | `Achievement`, `AchievementCriteria`, `UserAchievement` | `create_achievement`, `manual_award_achievement` | `achievementChecker.ts` |
| Tournaments | `Tournament`, `TournamentEnrolled`, `TournamentTeam`, `TournamentTeamMember`, `TournamentAssistant` | `create_tournament`, `register_for_tournament`, `advance_tournament_stage` | `tournamentHelpers.ts` |
| Brackets | `BracketMatch`, `GroupPhaseRecord` | `generate_bracket`, `advance_bracket_match` | `bracketGeneration.ts`, `bracketHelpers.ts` |
| Calendar | `AvailabilitySlot`, `SavedCalendar`, `CalendarEvent`, `CalendarEventInvite` | `create_calendar_event`, `invite_to_event` | `calendarCascade.ts` |
| Anonymous Play | Views: `view_my_lobby_members`, `view_my_lobby_chat`, `view_my_match_steps` | — | `anonymousHelpers.ts`, `anonymousLabels.ts` |
| Account Rating | `AccountRatingConfig` | `admin_seed_rating_config`, `admin_recalculate_all_ratings` | `accountRating.ts` |
| Chat | `ChatMessage` | `send_chat_message`, `delete_chat_message` | — |
| Account Selection | `LobbyMemberAccount` | `select_hsr_account_for_lobby` | — |
| Bans | `BanRecord` | `admin_ban_user`, `admin_unban_user` | `banHelper.ts` |

## Entry Points

**`app/layout.tsx`:** Root Next.js layout; wraps all pages in `<Providers>`

**`app/providers.tsx`:** Builds `DbConnection.builder().withConfirmedReads(false).build()` (Phase 12.2); initializes NextAuth `SessionProvider` and HeroUI

**`spacetimedb/src/index.ts`:** Module entry; exports all reducers (named re-exports) and all 32 views (named re-exports — required by Phase 12.2); lifecycle hooks `clientConnected`/`clientDisconnected`

## Error Handling

**Backend:** `throw new SenderError("message")` — aborts transaction, surfaces to client

**Frontend (Phase 12.2):** `conn.reducers.x(args).catch(err => console.error(...))` — `.catch()` on `Promise<void>`, not `_then()`

**API routes:** `try/catch` with `NextResponse.json({ error }, { status: 5xx })`

## Cross-Cutting Concerns

**Authentication:** Two-layer: SpacetimeDB identity (WebSocket token in `localStorage`) + NextAuth Discord session (JWT cookie). Bridged by `POST /api/auth/link-discord`. Identity resolution: `ctx.sender → UserIdentity.identity → User.id`.

**Privacy:** `public: false` tables: `UserPrivate`, `BanRecord`, `UserIdentity`, `ServerIdentity`, `CharacterStat`, `PlayerStat`, `PlayerRelationship`, `GcResult`. Clients access via named views only.

**Logging:** Backend uses `[IDENTITY_GC]` and `[DISCONNECT]` prefixes for structured log identification. Frontend uses `console.error` for async failures.

---

*Architecture analysis: 2026-04-09 (updated from 2026-04-06 to reflect Phase 12 UserPrivate, Phase 12.1 Identity GC, Phase 12.2 SDK upgrade and view exports)*
