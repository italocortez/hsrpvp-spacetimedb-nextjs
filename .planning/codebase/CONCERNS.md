# Concerns

**Analysis Date:** 2026-03-16

## Security

### Lobby passwordHash exposed to all clients (CRITICAL)
- **Table:** `spacetimedb/src/tables/lobby.ts` — `passwordHash: t.string().optional()` on a `public: true` table
- **Impact:** Every subscriber receives the password hash. Clients can extract it and attempt to reverse it.
- **Status:** IN-PROGRESS. Security views work planned to restrict sensitive columns. SpacetimeDB does not yet support column-level visibility; the fix likely requires splitting into a private table or using a view abstraction.
- **Workaround options:** Move `passwordHash` to a separate non-public table. Or validate passwords server-side in a reducer and never store the hash in a public table.

### UserIdentity and User tables fully public (HIGH)
- **Tables:** `user.ts` (`public: true`), `userIdentity.ts` (`public: true`)
- **Impact:** All clients receive every user's `discordId`, `deletedAt`, `lastLoginAt`, and the full identity-to-userId mapping table. This leaks PII and enables user tracking.
- **Status:** IN-PROGRESS. Security views planned to expose only necessary columns (id, displayName, avatarCharacterName, isOnline, role) to non-admin subscribers.

### Discord OAuth scope limited to `identify`
- **File:** `app/api/auth/authOptions.ts`
- **Impact:** No email available for account recovery. Discord username/avatar changes are not synced automatically.
- **Risk:** Low. Documented design choice.

### `any` casts bypass type safety on admin operations
- **Files:** `admin.ts` (reducer inserts/updates), `BulkUpsert.tsx`, `UserManager.tsx`, `authOptions.ts`
- **Impact:** Signature changes in SpacetimeDB bindings silently break at runtime instead of failing at compile time.

### No rate limiting on admin or server reducers
- **Impact:** A compromised admin account could bulk-delete or bulk-modify unlimited data.

## Performance

### Full-table scans in admin reducers
- **Where:** `admin.ts` lines 301-306 (HsrCharacterCost), 322-327 (HsrLightconeCost), 356-361 (HsrSynergyCost)
- **Cause:** Composite key lookups (characterName + gameMode) use `.iter()` instead of compound indexes
- **Scale:** Acceptable for current data volumes (~82 chars, ~156 LCs). Will degrade past 10,000 rows.

### UserIdentity full scan in server_link_discord
- **Where:** `server.ts` line 93 — iterates all UserIdentity rows to match hex string
- **Cause:** Identity objects cannot be reconstructed from hex; must iterate to find match
- **Scale:** O(n) in total identity count. Acceptable under 10,000 users.

### Client-side team resolution on every game data change
- **Where:** `useLoadouts.ts` — `resolvedTeam` useMemo recomputes when character/lightcone data changes globally
- **Impact:** Unnecessary CPU on game data updates. Noticeable on low-end devices.

## Technical Debt

### No loadout persistence for authenticated users
- **Where:** `useLoadouts.ts` (TODO comment), `spacetimedb/src/reducers/profile.ts`
- **Impact:** Loadouts stored in localStorage only. Lost on device switch.
- **Status:** Designed but unimplemented.

### Admin bulk upsert requires manual sync between frontend and backend
- **Where:** `admin.ts` switch statement, `BulkUpsert.tsx` UPSERT_TABLES enum
- **Impact:** Adding a new upsertable table requires changes in both places with no compile-time enforcement.

### User deletion has 5-second hard-delete with no cancel mechanism
- **Where:** `admin.ts` lines 112-127, `userDeletionJob.ts`
- **Impact:** No way to abort a scheduled deletion once initiated.

### Stale module bindings
- **Observation:** `src/module_bindings/` was generated with SpacetimeDB CLI 2.0.3. The working tree shows modified bindings files (`hsr_account_character_table.ts`, `hsr_account_lightcone_table.ts`, `hsr_account_table.ts`, `index.ts`, `types.ts`) indicating the schema has been updated but bindings are partially regenerated or hand-edited.
- **Impact:** Type mismatches between backend schema and client bindings if not regenerated cleanly.

## Dependency Risks

| Dependency | Risk | Notes |
|------------|------|-------|
| SpacetimeDB 2.0.3 | Breaking API changes in 3.x | Re-run `generate` and verify after upgrades |
| NextAuth 4.24.13 | v5 has breaking changes | Plan dedicated migration phase |
| Node.js >= 24.0.0 | Bleeding-edge requirement | May cause CI/hosting compatibility issues |

## Missing Infrastructure

- **Testing:** No test runner, no test files, no CI pipeline
- **Error monitoring:** Console logging only, no Sentry/similar
- **Error boundaries:** No React error boundaries in the component tree
- **Input validation:** Server-side enum validation exists, but no client-side format validation on user inputs

## In-Progress Security Work

The following security improvements are actively planned or in development:

1. **Lobby passwordHash extraction** — Move password hash out of the public Lobby table to prevent client-side exposure
2. **UserIdentity view** — Create a restricted view so clients only see their own identity mapping
3. **User view** — Create a public view with limited columns (id, displayName, avatar, isOnline, role) and keep sensitive fields (discordId, deletedAt, lastLoginAt) in a private or admin-only view

These changes require either SpacetimeDB view support or table-splitting patterns.

---

*Concerns audit: 2026-03-16*
