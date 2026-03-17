# Phase 2: Roster Management - Context

**Gathered:** 2026-03-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Players can create HSR account entries, add owned characters with eidolon levels, manage multiple accounts, and control roster visibility — all enforced at the server level. This phase implements reducers for existing roster tables (created in Phase 1), adds archetype and cost set schema, and establishes context-based subscription patterns for roster data. No frontend. No lightcone ownership tracking.

</domain>

<decisions>
## Implementation Decisions

### HSR Account Lifecycle
- Max 5 HSR accounts per user
- UID: 9-digit numeric, validated at reducer level
- Region: Auto-derived from UID first digit (6=America, 7=Europe, 8=Asia, 9=TW/HK/MO) — not a user input
- UID and region are immutable from creation. Typo? Delete and recreate.
- Display label: Always editable, optional with auto-default ("Account 1", "Account 2", etc.)
- First account created auto-sets as default preference (isActive)
- Deleting the active account auto-activates the oldest remaining
- HSR account deletion: Hard delete + cascade (all HsrAccountCharacter rows deleted with it)
- User deletion: Hard delete all HSR data. History tables are self-sufficient.
- No HSR account = can't join lobbies that require roster

### Active Account — Per-Lobby Selection
- isActive on HsrAccount is a **default preference only**, not globally enforced
- In casual lobbies: user selects which HSR account to play with before match starts
- In tournament matches: locked to the account registered with during signup
- Tournaments can optionally allow multi-account signup (configurable, up to 5) — implementation in Phase 3
- No cooldown on switching — per-lobby selection replaces the old global switch model
- LobbyMember (or equivalent) needs an hsrAccountId column to track the selected account

### Duplicate UID Handling
- Warn but allow: multiple users can claim the same HSR UID
- Boolean flag isDuplicateUid on HsrAccount row
- Rechecked when any account with that UID is created or deleted — clears flag for accounts that are no longer duplicates

### Roster Migration
- Dedicated migrate_roster reducer supports both **copy** and **move** modes
- Copy: Duplicate characters to target account, source keeps its roster
- Move: Transfer characters to target, source loses them
- Conflict resolution: Overwrite target with source eidolon level (upsert)
- Reducer accepts a mode flag (copy/move), user chooses per operation

### Rating System
- No backend rating caching — fully frontend-computed from subscribed data
- Rating = character costs only (lightcone ownership is not tracked)
- Two axes for classification: Vertical (eidolon investment depth) + Horizontal (archetype diversity breadth)
- 2D matrix tier naming and breakpoints are frontend responsibility
- Backend only provides the raw data (roster + cost tables + archetype tags)

### Archetype System (New Schema)
- Admin-managed Archetype table: id, name, description + audit columns
- HsrCharacterArchetype junction table: characterName + archetypeId (many-to-many)
- Characters can belong to multiple archetypes
- Admin CRUD reducers for archetype management
- Used by frontend for horizontal diversity scoring

### Rating Visibility
- Per-HsrAccount toggles: isRosterPublic (default false), isRatingPublic (default false)
- Lobby/tournament override has 3 states:
  - Open Roster → forces roster + rating visible to opponents
  - Closed Roster with Rating → roster hidden, rating shown
  - Closed Roster, no Rating → both hidden
- Admins always see everything
- Top 10 leaderboard always shows rating regardless of user setting

### Reducer Design
- Batch-only reducers (batch of 1 = single operation) — minimizes reducer calls
- batch_upsert_characters: Validates all character names against HsrCharacter table. Rejects entire batch if any invalid (atomic). Upserts existing characters (updates eidolon level).
- batch_remove_characters: Separate reducer for deleting characters from an account
- Guest blocking via ensureVerifiedUser() helper or equivalent (Claude's discretion on pattern — follows ensurePermissions.ts conventions)

### Admin Scope
- Full superadmin proxy: can create accounts, add/edit/remove characters, set visibility, delete accounts — all on behalf of any user
- Follows existing ensureAdmin() pattern
- No higher authority than admin other than the server identity itself

### Data Architecture — Subscription Strategy
- Context-based subscriptions (Option 1 from discussion):
  - Own roster: Always subscribed
  - Opponents' rosters: Subscribe when entering open-roster lobby, unsubscribe on leave
  - Admin: Subscribes to all roster tables (except history tables)
  - Visitors (no auth): Only public tables
- HsrAccountLightcone table REMOVED from scope — users do not track lightcone ownership
- Subscription query research needed during planning (SpacetimeDB filtered subscription capabilities)

### Public Tables (no auth required)
- HsrCharacter, HsrLightcone, HsrCharacterCost, HsrLightconeCost, HsrSynergyCost
- Archetype, HsrCharacterArchetype
- These are essential for the draft system and must remain public

### Cost Set Schema Prep
- Add costSetId column (u32, default 0) to HsrCharacterCost, HsrLightconeCost, and HsrSynergyCost
- costSetId = 0 represents the default cost set
- Schema-only addition in Phase 2 (column + default value)
- CostSet table, clone reducer, and TO management deferred to Phase 3
- Approach: Clone + edit (TO clones defaults, exports as CSV, edits, re-imports via existing JSON bulk upsert)

### Views Strategy
- Phase 2 keeps all roster tables `public: true` (no visibility change)
- Add btree indexes on `costSetId` for all 3 cost tables (HsrCharacterCost, HsrLightconeCost, HsrSynergyCost) — prepares for Phase 3 anonymous views that filter by cost set
- The subscription-based approach (own roster always subscribed, opponents' on lobby entry) remains correct for Phase 2
- Per-user roster views (`my_hsr_accounts`, `my_hsr_characters`) are deferred to Phase 9 when lobby subscription management exists
- Reason: roster visibility is context-dependent (lobby override, admin bypass) — a single view can't handle the multi-hop join efficiently
- The two-hop identity resolution pattern (`ctx.sender` -> UserIdentity -> userId -> HsrAccount) has been validated as workable for future views

### Claude's Discretion
- Exact guest blocking pattern (ensureVerifiedUser helper vs inline check)
- isActive handling details (keep as default preference column — Claude decides specifics)
- Reducer file organization and naming conventions
- Index strategy for new archetype tables
- Whether isDuplicateUid recalculation uses a helper or inline logic
- Whether to add costSetId btree indexes in Phase 2 Plan 01 or defer to Phase 3

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roster data model
- `spacetimedb/src/docs/roster/README.md` — Table relationships, visibility rules, rating formula (note: lightcone ownership removed, rating is character-cost-only now)
- `spacetimedb/src/tables/hsrAccount.ts` — HsrAccount table schema (isActive, isRosterPublic columns)
- `spacetimedb/src/tables/hsrAccountCharacter.ts` — HsrAccountCharacter composite PK, eidolonLevel column
- `spacetimedb/src/tables/hsrAccountLightcone.ts` — EXISTS but REMOVED from Phase 2 scope (do not write reducers for this)

### Auth and permissions
- `spacetimedb/src/helpers/ensurePermissions.ts` — getAuthenticatedUser(), ensureAdmin(), ensureTournamentHost() patterns
- `spacetimedb/src/helpers/auditColumns.ts` — auditInsert(), auditUpdate() patterns
- `spacetimedb/src/reducers/auth.ts` — ctx.sender usage, SenderError throws
- `spacetimedb/src/reducers/admin.ts` — Admin bulk upsert pattern, enum validation, iter() usage

### Existing patterns
- `spacetimedb/src/reducers/profile.ts` — User update reducer pattern (getAuthenticatedUser + audit fields)
- `spacetimedb/src/schema.ts` — Table registration pattern
- `spacetimedb/src/types/enums.ts` — Existing enums (Role, GameMode, Path, Element, CharRole)
- `spacetimedb/src/types/structs.ts` — Existing structs (EidolonCost, SuperimpositionCost)

### Cost tables (DO NOT REMOVE — essential for drafting)
- `spacetimedb/src/tables/hsrCharacterCost.ts` — Character costs per game mode (adding costSetId column)
- `spacetimedb/src/tables/hsrLightconeCost.ts` — Lightcone costs per game mode (adding costSetId column)
- `spacetimedb/src/tables/hsrCharacter.ts` — Character master data (validates character names in batch upsert)
- `spacetimedb/src/tables/hsrLightcone.ts` — Lightcone master data

### Phase 1 context
- `.planning/phases/01-schema-foundation/01-CONTEXT.md` — Prior decisions that inform this phase

</canonical_refs>

<code_context>
## Existing Code Insights

### Current Schema State (verified 2026-03-16)
- **HsrAccount**: has `id` (PK autoInc), `userId`, `uid`, `region` (string, not enum), `displayLabel`, `isActive`, `isRosterPublic` + audit. **MISSING**: `isRatingPublic`, `isDuplicateUid` — must be added.
- **HsrAccountCharacter**: composite PK `['hsrAccountId', 'characterName']`, `eidolonLevel` (u8) + audit. Matches expectations.
- **HsrAccountLightcone**: EXISTS with composite PK `['hsrAccountId', 'lightconeName']`, `superimpositionLevel` (u8) + audit. Table stays but NO reducers written for it.
- **HsrCharacterCost**: composite PK `['characterName', 'gameMode']`, `classicCosts` (EidolonCost), `auctionBaseBid` (EidolonCost) + audit. **NO `costSetId`** — must be added.
- **HsrLightconeCost**: composite PK `['lightconeName', 'gameMode']`, same struct pattern. **NO `costSetId`** — must be added.
- **HsrSynergyCost**: PK is `id` (autoInc), columns: `sourceName`, `targetName`, `gameMode`, `costModifier` (f32) + audit. **NO `costSetId`** — must be added (regular column, not PK since table uses autoInc).
- **Archetype / HsrCharacterArchetype tables**: DO NOT EXIST — must be created and registered in schema.ts.
- **LobbyMember**: does NOT have `hsrAccountId` — needed for per-lobby account selection (likely deferred to Phase 3/9 when lobby reducers are built).
- **Lobby**: has `isOpenRoster` (bool) — correct for now, 3-state enum upgrade deferred.
- **Region**: stored as plain string on HsrAccount, no Region enum exists. Claude can add enum or keep string.

### Reusable Assets
- `ensurePermissions.ts`: `getAuthenticatedUser(ctx)`, `ensureAdmin(ctx)`, `ensureTournamentHost(ctx)` — extend with guest blocking helper. **NO `ensureVerifiedUser()` exists yet.**
- `auditColumns.ts`: `SYSTEM_USER_ID` = 0, `auditInsert(ctx, userId?)`, `auditUpdate(ctx, existing, userId?)` — apply to all new table inserts/updates
- `admin.ts` reducers: `admin_bulk_upsert` accepts tableName + jsonData string. For composite PK tables, uses `iter()` to find rows then delete+insert. **If `costSetId` is added to cost table PKs, this lookup must be updated.**
- `userDeletion.ts`: `run_user_deletion` currently only deletes UserIdentity + User rows. **Does NOT cascade to HSR data** — must be extended in Phase 2.
- HsrCharacter table: PK is `name` (string) — used for validating character names in batch upsert

### Established Patterns
- Reducers never return data — all reads via table subscriptions
- ctx.sender resolved through UserIdentity → User lookup (never trust identity args)
- SenderError thrown for validation failures
- Audit columns on every table write (createdById, createdDate, lastModifiedById, lastModifiedDate)
- Composite primary keys: `primaryKey: ['col1', 'col2']`
- All tables `public: true` (but subscription queries can filter what clients receive)
- Admin bulk upsert uses delete+insert for composite PK tables (not update-in-place)
- 22+ enums already defined in enums.ts, 11+ structs in structs.ts
- Schema registers 33 tables across categories in schema.ts
- index.ts exports each reducer as named export + lifecycle hooks (clientConnected/Disconnected)

### Integration Points
- `spacetimedb/src/schema.ts`: New Archetype and HsrCharacterArchetype tables must be registered here
- `spacetimedb/src/index.ts`: All new reducers must be exported here
- Cost tables: costSetId column addition requires modifying existing table definitions
- `spacetimedb/src/docs/roster/README.md`: Must be updated with new reducer flows, archetype system, and revised visibility rules

</code_context>

<specifics>
## Specific Ideas

- HSR UIDs encode region in first digit (6=America, 7=Europe, 8=Asia, 9=TW/HK/MO) — auto-derive, don't ask user
- Enka Network API (https://enka.network/api/uid/<UID>/) can validate UIDs and potentially auto-import characters — deferred to v1 frontend milestone since SpacetimeDB reducers can't make network calls
- Roster migration with copy mode enables users with similar accounts to quickly set up alts
- Data scale baseline: 82 characters, 156 lightcones, 100 active users, 20 per lobby, 150 including visitors — design for this scale

</specifics>

<deferred>
## Deferred Ideas

- Enka Network API integration for UID validation + character auto-import — v1 frontend milestone (reducers can't make network calls)
- Cost sets full implementation (CostSet table, clone reducer, TO management) — Phase 3 (Tournament System)
- Lightcone ownership tracking (HsrAccountLightcone) — removed from scope, reconsider in future if needed
- Tournament multi-account signup enforcement — Phase 3
- 3-state roster visibility on lobbies/tournaments (enum replacing boolean) — Phase 3/9 when lobby/tournament reducers are built
- Per-user roster views (my_hsr_accounts, my_hsr_characters) — Phase 9 (requires lobby membership context)
- Anonymous views for default cost set — Phase 3 (when custom cost sets exist)
- Make HsrAccount/HsrAccountCharacter private + views — Phase 9 (after lobby subscription pattern established)

</deferred>

---

*Phase: 02-roster-management*
*Context gathered: 2026-03-16*
