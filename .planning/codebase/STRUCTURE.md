# Codebase Structure

**Analysis Date:** 2026-04-12

## Directory Layout

```
hsrpvp-spacetimedb-nextjs/
├── app/                        # Next.js App Router — pages and API routes
│   ├── (authenticated)/        # Route group: auth-gated pages (lobby, profile, admin-view)
│   │   ├── admin-view/         # Admin panel page
│   │   ├── lobby/              # Lobby browser page
│   │   ├── profile/            # User profile page
│   │   ├── layout.tsx          # Auth guard wrapper (AuthRequired)
│   │   └── layout.module.css
│   ├── (game)/                 # Route group: live draft page
│   │   └── draft/              # Dynamic route: /draft/[matchId]
│   ├── (landing-page)/         # Route group: public pages
│   │   ├── costs/              # Cost reference page
│   │   ├── teambuilder/        # Team builder tool page
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Home/landing page
│   │   └── page.module.css
│   ├── api/                    # Server-side API routes
│   │   └── auth/               # NextAuth handler + Discord link endpoint
│   │       ├── [...nextauth]/  # NextAuth catch-all handler
│   │       ├── authOptions.ts  # DiscordProvider config
│   │       └── link-discord/   # Discord->SpacetimeDB identity bridge
│   ├── layout.tsx              # Root layout (fonts, Providers, NavBar, Footer)
│   ├── providers.tsx           # Client providers tree (SpacetimeDB, NextAuth, HeroUI)
│   ├── globals.css             # Global styles
│   └── tokens.css              # Design token CSS variables
├── components/                 # Reusable React components
│   ├── features/               # Feature-scoped components
│   │   ├── admin-view/         # Admin panel components
│   │   ├── auth/               # Auth components, hooks, types
│   │   ├── costs/              # Cost table display components
│   │   ├── drafting/           # Draft UI: classic + auction modes
│   │   ├── game-data/          # GameDataProvider + mapping helpers
│   │   ├── hooks/              # Shared feature hooks (filters, loadouts, icons)
│   │   ├── landing/            # Landing page section components
│   │   ├── profile/            # Profile card + Discord link components
│   │   ├── team-builder/       # Team roster builder components
│   │   └── types/              # Shared frontend types (enums, structs, tableColumns)
│   └── globals/                # App-wide shared components
│       ├── icons/              # Icon components
│       ├── layout/             # NavBar, Footer, Logo, GearIcon
│       └── modals/             # Global modal components
├── src/
│   └── module_bindings/        # Generated SpacetimeDB TypeScript bindings (DO NOT EDIT)
│       ├── index.ts            # Barrel export for all bindings
│       ├── types.ts            # Shared binding types
│       ├── types/              # procedures.ts, reducers.ts
│       ├── *_table.ts          # One file per SpacetimeDB table (includes view_* tables)
│       └── *_reducer.ts        # One file per SpacetimeDB reducer
│       # 236 total files: 32 are view_*_table.ts (generated in Phase 12.2)
├── spacetimedb/                # SpacetimeDB module source (TypeScript -> WASM)
│   ├── src/
│   │   ├── index.ts            # Module entry: reducer exports, view exports, lifecycle hooks
│   │   ├── schema.ts           # Table registration with SpacetimeDB schema()
│   │   ├── tables/             # 67 table definitions (one file per table)
│   │   ├── reducers/           # 44 reducer files (grouped by domain)
│   │   ├── helpers/            # 26 shared server-side utility files (Phase 12.3: +rosterMutations.ts)
│   │   │   ├── accountRating.ts
│   │   │   ├── achievementChecker.ts
│   │   │   ├── anonymousHelpers.ts
│   │   │   ├── anonymousLabels.ts
│   │   │   ├── auditColumns.ts
│   │   │   ├── banHelper.ts
│   │   │   ├── bracketGeneration.ts
│   │   │   ├── bracketHelpers.ts
│   │   │   ├── calendarCascade.ts
│   │   │   ├── calendarCleanup.ts
│   │   │   ├── characterStatsIncrement.ts
│   │   │   ├── disconnectHelpers.ts
│   │   │   ├── draftSequences.ts
│   │   │   ├── eloCalculation.ts
│   │   │   ├── ensurePermissions.ts
│   │   │   ├── finalizationHelpers.ts
│   │   │   ├── flagTransferHelpers.ts
│   │   │   ├── globalCharacterStatsIncrement.ts
│   │   │   ├── leaderboardRebuild.ts
│   │   │   ├── lobbyHelpers.ts
│   │   │   ├── ownershipValidation.ts
│   │   │   ├── rosterHelpers.ts
│   │   │   ├── rosterMutations.ts          # NEW Phase 12.3 — applyBatchUpsert, applyBatchRemove
│   │   │   ├── statsIncrement.ts
│   │   │   ├── tournamentHelpers.ts
│   │   │   └── userDeletionHelper.ts
│   │   ├── views/              # 2 files: securityViews.ts + anonymousViews.ts
│   │   └── types/              # enums.ts, structs.ts
│   ├── dist/                   # Compiled JS output (generated, committed)
│   │   └── bundle.js           # Single compiled bundle for spacetime publish
│   └── package.json            # Separate package for the SpacetimeDB module
├── lib/
│   ├── spacetimedb.ts          # Client-side connection constants (host, db name, token key)
│   └── spacetimedb-server.ts   # Server-side SpacetimeDB connection singleton
├── test/
│   ├── vitest.config.ts        # Unit runner -- includes *.unit.test.ts only
│   ├── vitest.integration.config.ts  # Integration runner -- includes *.test.ts, excludes *.unit.test.ts
│   ├── global-setup.ts         # Phase 14: pre-suite DB clear + reseed via spacetime publish --clear-database
│   ├── tsconfig.json           # Test-specific TS config
│   ├── shared/
│   │   ├── connection.ts       # WebSocket test harness (createTestHarness, createVerifiedTestHarness)
│   │   │                       # Phase 14: .withConfirmedReads(false) + onApplied subscription readiness
│   │   ├── fixtures.ts         # Test data constants + factories (UIDs, createAccountArgs)
│   │   ├── seed-data.ts        # CLI script -- seeds game data tables after publish
│   │   ├── bootstrap.ts        # CLI script -- registers server identity on fresh database
│   │   ├── load-env.ts         # Loads .env.local vars for test process
│   │   ├── mocks/
│   │   │   └── spacetimedb-server.ts  # Mock for spacetimedb/server (unit tests)
│   │   └── helpers/            # Reusable async test setup/teardown flows (Phase 10.5)
│   │       ├── lobbies.ts      # defaultLobbyArgs, defaultSettingsArgs, cleanupLobby
│   │       ├── tournaments.ts  # createTournamentArgs, setupRegistrationTournament
│   │       ├── users.ts        # getUsername
│   │       ├── queries.ts      # myLobbies, latestLobby, lobbyMembers, lobbyBans
│   │       ├── hsrAccounts.ts  # HSR account query helpers
│   │       ├── scores.ts       # Score entry helpers
│   │       ├── drafts.ts       # Draft flow helpers
│   │       ├── promoteUser.ts  # promoteUser (grants role via server token)
│   │       └── seed.ts         # ensureEloConfig (idempotent seeding helpers)
│   └── backend/                # Integration and unit tests for the SpacetimeDB module
│       ├── achievements/
│       ├── anonymous-play/
│       ├── auth/
│       ├── brackets/
│       ├── calendar/
│       ├── chat/
│       ├── cost-sets/
│       ├── garbage-collector/
│       ├── lobby/
│       ├── match-results/
│       │   ├── mmr-snapshot.test.ts            # NEW Phase 12.3 — accountRatingSnapshot capture at start_draft
│       │   └── mmr-snapshot-betweengames.test.ts  # NEW Phase 12.3 — monotonic snapshot hook during BetweenGames
│       ├── match-session/
│       │   └── auto-pick-ownership-pool.test.ts  # NEW Phase 12.3 — timer_expiry_classic uses LMA pool
│       ├── roster/
│       │   └── migrate-roster-rating.test.ts     # NEW Phase 12.3 — D-D-04 migrate_roster rating recompute + D-G guards
│       ├── season/
│       └── tournaments/
│           └── tournament-ordering-guard.test.ts # NEW Phase 12.3 — D-H-01 ordering guard + process_tournament_mmr
├── docs/                       # Feature documentation
│   ├── ERD.excalidraw          # Entity-Relationship Diagram (Excalidraw format)
│   ├── FRONTEND-HANDOFF.md     # Frontend implementation guide
│   ├── _templates/             # docs/_templates: blank contract and architecture templates
│   ├── achievements/           # architecture.md + contract.md
│   ├── admin/
│   ├── anonymous-play/
│   ├── archetypes/
│   ├── auth/
│   ├── brackets/
│   ├── calendar/
│   ├── chat/
│   ├── cost-sets/
│   ├── cost-tables/
│   ├── lobby/
│   ├── match-results/
│   ├── match-session/
│   ├── mmr/
│   ├── player-stats/
│   ├── roster/
│   ├── smoke/
│   ├── tournament/
│   └── views/                  # 19 feature directories + docs/_templates
├── public/                     # Static assets served by Next.js
├── scripts/                    # One-off setup scripts (e.g., register-server.ts)
├── tools/                      # Development tooling
├── notes/                      # Developer notes and UAT report cards
├── .planning/                  # GSD project planning artifacts
│   ├── phases/                 # Per-phase directories (13 phases + sub-phases)
│   ├── codebase/               # This doc + 6 peers (regenerated per D-12)
│   ├── PROJECT.md              # Project vision and requirements
│   ├── ROADMAP.md              # Phase/plan execution roadmap
│   ├── REQUIREMENTS.md         # Traced requirements
│   └── STATE.md                # Live execution state
├── .claude/                    # Claude Code project config and skills
│   ├── CLAUDE.md               # Project-level instructions for Claude
│   └── skills/                 # Skill directories (spacetimedb, frontend-design, etc.)
├── next.config.ts              # Next.js configuration (CSP headers, security headers)
├── tsconfig.json               # TypeScript config (@/* alias maps to repo root)
├── tailwind.config.ts          # Tailwind CSS configuration
├── spacetime.json              # SpacetimeDB CLI project config (maincloud)
└── package.json                # Root npm package (Next.js app + test runner)
```

## Directory Purposes

**`app/(authenticated)/`:**
- Purpose: Auth-gated pages requiring a logged-in SpacetimeDB user
- Contains: `lobby/page.tsx`, `profile/page.tsx`, `admin-view/page.tsx`, shared `layout.tsx` (wraps in `AuthRequired`)

**`app/(game)/`:**
- Purpose: Live in-match draft interface, accessible by match participants
- Contains: `draft/[matchId]/page.tsx` — dynamic route for active draft sessions

**`app/(landing-page)/`:**
- Purpose: Public-facing pages (no auth required)
- Contains: Home page, costs reference page, team builder tool

**`app/api/auth/`:**
- Purpose: Server-side auth endpoints
- Contains: NextAuth catch-all handler, Discord-to-SpacetimeDB identity linker (`link-discord/`)
- Note: `server_link_discord` reducer was renamed to `server_link_provider` in Phase 12 (generic OAuth bridge)

**`spacetimedb/src/tables/` (67 files):**
- Purpose: SpacetimeDB table schema definitions — one file per table
- Notable additions since Phase 10: `userPrivate.ts` (Phase 12, `public: false`), `identityGcJob.ts` (Phase 12.1), `lobbyMemberAccount.ts` (Phase 10.4), `tournamentPlayerAccount.ts` (Phase 10.4)
- Phase 12.3 schema additions: `accountRatingSnapshot: f64` on `MatchResultParticipant`; `requireOwnership: bool` on `Tournament`

**`spacetimedb/src/reducers/` (44 files):**
- Purpose: Server-side mutation handlers grouped by domain
- Notable: `identityGc.ts` (Phase 12.1 scheduled GC), `accountSelection.ts` (Phase 10.4), `seriesManagement.ts`, `concede.ts`
- Key: `auth.ts`, `lobbyLifecycle.ts`, `matchFinalization.ts`, `draftClassic.ts`, `draftAuction.ts`
- Phase 12.3: `roster.ts` now imports `rosterMutations.ts` for `batch_upsert_characters`, `batch_remove_characters`, `migrate_roster`

**`spacetimedb/src/helpers/` (26 files as of Phase 12.3):**
- Purpose: Shared server-side utilities called by reducers
- Phase 12.3 addition: `rosterMutations.ts` — `applyBatchUpsert` and `applyBatchRemove` (105 lines); single source of truth for "mutate characters + recompute accountRating"
- Key: `ensurePermissions.ts`, `auditColumns.ts`, `finalizationHelpers.ts`, `eloCalculation.ts`, `anonymousLabels.ts`, `rosterMutations.ts`

**`spacetimedb/src/views/` (2 files):**
- Purpose: Server-computed data projections
- Phase 12.2 requirement: All 32 views must be `export const` and re-exported from `index.ts` for `[registerExport]` to fire
- `securityViews.ts`: 24 named views (lobby browser, user directory, roster, cost sets, tournament data, profile with UserPrivate merge, etc.)
- `anonymousViews.ts`: 8 views (lobby chat, lobby members, match steps/participants, match history, public accounts)

**`src/module_bindings/` (236 files):**
- Purpose: Auto-generated TypeScript client bindings — regenerated with `spacetime generate` after every publish
- Contains 32 `view_*_table.ts` files (added in Phase 12.2) alongside standard table and reducer bindings
- Never edit manually

**`test/backend/` (14 subdirectories, 63 total test files):**
- Purpose: Integration tests for the SpacetimeDB module, grouped by feature domain
- `test/shared/helpers/` added in Phase 10.5 for shared cleanup and fixture helpers (9 files)
- Phase 12.3 additions: 5 new test files across match-results, match-session, roster, and tournaments
- Phase 14 addition: `test/global-setup.ts` — pre-suite DB clear and reseed for deterministic test runs

**`docs/` (19 feature directories + `docs/_templates`):**
- Each feature directory contains `architecture.md` and `contract.md`
- `docs/_templates/` contains blank templates for new features (added in Phase 13)
- `ERD.excalidraw` — Excalidraw entity-relationship diagram (view at localhost:4000)

## Key File Locations

**Entry Points:**
- `app/layout.tsx` — Root Next.js layout
- `app/providers.tsx` — SpacetimeDB connection init (`.withConfirmedReads(false)` since Phase 12.2), NextAuth, HeroUI
- `spacetimedb/src/index.ts` — SpacetimeDB module entry; all reducer and view exports, lifecycle hooks

**Configuration:**
- `next.config.ts` — CSP + security headers; port 3001 via npm scripts
- `spacetime.json` — SpacetimeDB CLI config (maincloud server, database name)
- `lib/spacetimedb.ts` — Client-side connection constants

**Core Logic:**
- `spacetimedb/src/schema.ts` — Complete table registry
- `spacetimedb/src/helpers/ensurePermissions.ts` — Role-based permission guards
- `spacetimedb/src/helpers/auditColumns.ts` — Audit field helpers
- `spacetimedb/src/helpers/rosterMutations.ts` — Batch character upsert/remove + rating recompute (Phase 12.3)
- `components/features/auth/hooks/useAuth.ts` — Auth state (view_my_profile primary since Phase 12.2)

## File Counts (as of Phase 12.3)

| Directory | Count |
|-----------|-------|
| `spacetimedb/src/tables/` | 67 files |
| `spacetimedb/src/reducers/` | 44 files |
| `spacetimedb/src/helpers/` | 26 files (+1 from Phase 12.3: rosterMutations.ts) |
| `spacetimedb/src/views/` | 2 files (32 named views total) |
| `src/module_bindings/` | 236 files (32 view bindings) |
| `test/shared/helpers/` | 9 files |
| `test/backend/` | 14 subdirectories, 63 test files total |
| `docs/` | 19 feature directories + `docs/_templates` |

## Naming Conventions

**Files:**
- Next.js pages: `page.tsx`, `layout.tsx`
- React components: PascalCase (`AuthProvider.tsx`, `NavBar.tsx`)
- Hooks: camelCase with `use` prefix (`useAuth.ts`, `useDraftState.ts`)
- SpacetimeDB tables: camelCase (`lobbyMember.ts`, `matchSession.ts`)
- SpacetimeDB reducers: camelCase grouped by domain (`lobbyLifecycle.ts`, `draftClassic.ts`)
- SpacetimeDB helpers: camelCase (`rosterMutations.ts`, `eloCalculation.ts`)
- Generated bindings: snake_case (`lobby_member_table.ts`, `view_my_lobbies_table.ts`)
- Test files: kebab-case with `.test.ts` suffix

## Where to Add New Code

**New SpacetimeDB View:**
1. Add to `spacetimedb/src/views/securityViews.ts` or `anonymousViews.ts`
2. Use `export const view_xxx = spacetimedb.view(...)` — must be `export const`
3. Re-export from `spacetimedb/src/index.ts` (required since Phase 12.2)

**New SpacetimeDB Table:**
1. Create `spacetimedb/src/tables/{tableName}.ts`
2. Register in `spacetimedb/src/schema.ts`
3. Publish and regenerate: `spacetime publish && spacetime generate`

**New SpacetimeDB Reducer:**
1. Add to domain file in `spacetimedb/src/reducers/` or create new file
2. Export from `spacetimedb/src/index.ts`
3. Auth guard first; spread `auditInsert`/`auditUpdate` on all mutations

**New Shared Helper (batch logic):**
1. Create `spacetimedb/src/helpers/{domain}Mutations.ts` following the `rosterMutations.ts` pattern
2. Export named functions; import into domain reducer files
3. Caller is responsible for auth/ownership validation before calling helper

## Special Directories

**`src/module_bindings/`:** Auto-generated, committed to git, never edit manually

**`spacetimedb/dist/`:** Compiled output (`dist/bundle.js`), committed, published by SpacetimeDB CLI

**`.planning/codebase/`:** 7 docs regenerated periodically (D-12); last regenerated 2026-04-12 (Phase 13, Plan 03)

---

*Structure analysis: 2026-04-12 (regenerated from 2026-04-09 to reflect Phase 12.3 additions: rosterMutations.ts helper, 5 new test files, schema columns; Phase 14 global-setup.ts and test infrastructure)*
