# Codebase Concerns

**Analysis Date:** 2026-03-15

## Tech Debt

**Incomplete SpacetimeDB Integration:**
- Issue: Loadout management uses localStorage for unauthenticated users but SpacetimeDB for authenticated users is not yet implemented. The TODO comment at line 95 in `components/features/hooks/useLoadouts.ts` indicates this is planned but unfinished.
- Files: `components/features/hooks/useLoadouts.ts` (line 95), `spacetimedb/src/reducers/profile.ts`
- Impact: Authenticated users cannot persist their loadouts to SpacetimeDB; they lose data when switching devices. All mutations currently skip database writes when `isAuthenticated` is true, resulting in data loss.
- Fix approach: Implement SpacetimeDB reducers for `saveLoadouts`, `saveCurrentLoadoutIndex`, and `saveRulesetView` in the profile module. Call these reducers in the mutation save callbacks when `isAuthenticated` is true.

**Type Safety Issues in Admin Panel:**
- Issue: Cast to `any` throughout admin components to bypass type checking. `(session.user as any).id` in `app/api/auth/authOptions.ts` and `(conn.reducers as any)` in `components/features/admin-view/components/BulkUpsert.tsx` hide type mismatches.
- Files: `app/api/auth/authOptions.ts` (line 17), `components/features/admin-view/components/BulkUpsert.tsx` (line 210), `components/features/admin-view/components/UserManager.tsx` (line 90)
- Impact: IDE cannot catch breaking changes in reducer signatures, authentication types, or reducer names. Changes to SpacetimeDB bindings may silently break functionality.
- Fix approach: Define proper TypeScript types for session extensions and reducer return types. Use TypeScript's type system instead of `any` casts. Update `src/module_bindings` after publishing new module versions.

**Missing Error Recovery in Offline Scenarios:**
- Issue: Admin bulk upsert and user management operations do not retry on network failure. Single network hiccup during a large upsert cancels the entire operation with no recovery path.
- Files: `components/features/admin-view/components/BulkUpsert.tsx` (line 194-221), `components/features/admin-view/components/UserManager.tsx` (line 76-101)
- Impact: Admins cannot reliably update game data during network instability. Large data imports must be retried manually from scratch.
- Fix approach: Implement exponential backoff retry logic in admin operations. Store pending operations in localStorage and retry on reconnect.

## Performance Bottlenecks

**Full Table Scans in Admin Reducers:**
- Problem: Several admin operations iterate through entire tables with `.iter()` to find compound key matches instead of using optimized indexes.
- Files: `spacetimedb/src/reducers/admin.ts` (lines 293-297 for HsrCharacterCost, lines 344-348 for HsrSynergyCost)
- Cause: Compound keys (character name + game mode) and composite lookups lack dedicated indexes, forcing linear scans.
- Current capacity: Acceptable for small datasets (hundreds of rows) but will degrade as game data grows.
- Improvement path: Add compound indexes to `HsrCharacterCost` and `HsrSynergyCost` tables for (characterName, gameMode) and (sourceName, targetName, gameMode) respectively. Use indexed lookups instead of `.iter()`.

**UserIdentity Full Scan in Server Reducers:**
- Problem: `spacetimedb/src/reducers/server.ts` line 93 iterates all UserIdentity rows to find identity-to-user mappings during server initialization.
- Files: `spacetimedb/src/reducers/server.ts` (line 93)
- Cause: Lookups in this context are not performance-critical (one-time server init) but show a pattern that could be problematic elsewhere.
- Scaling impact: No immediate issue with current user counts, but demonstrates inconsistent index usage.
- Improvement path: Document why this full scan is necessary and acceptable; consider caching if this reducer is called frequently.

**Client-Side Re-resolution of Team Members:**
- Problem: `components/features/hooks/useLoadouts.ts` calls `LoadoutManager.resolveTeam()` on every render due to `resolvedTeam` useMemo re-computing on any change to characters or lightcones.
- Files: `components/features/hooks/useLoadouts.ts` (lines 69-79)
- Cause: Character and lightcone data changes (client-wide game data updates) trigger expensive resolution for all loadout teams.
- Impact: Unnecessary CPU cycles during global data updates; perceptible lag on lower-end devices.
- Improvement path: Memoize character and lightcone lookups separately; only re-resolve teams if their actual team array or lookup data changes, not all game data.

## Security Considerations

**Inadequate Type Checking on Reducer Calls:**
- Risk: Admin panel and profile operations cast reducer connections to `any`, allowing typos and signature changes to pass TypeScript checks and only fail at runtime.
- Files: `components/features/admin-view/components/BulkUpsert.tsx` (line 210), `components/features/admin-view/components/UserManager.tsx` (line 90), `app/api/auth/authOptions.ts` (line 17)
- Current mitigation: SpacetimeDB backend validates all inputs with strict enum checking and key validation before updating tables. Admin permissions are enforced server-side.
- Recommendations: Generate TypeScript reducer types from SpacetimeDB schema and import them directly instead of casting to `any`. This catches signature mismatches at compile time.

**No Input Validation on Edit Fields in Admin Panel:**
- Risk: Username and display name inputs accept any string up to 32 characters but no format validation (empty strings allowed after trim, special characters not checked).
- Files: `components/features/admin-view/components/UserManager.tsx` (lines 172-176, 187-191)
- Current mitigation: Server-side reducer validates uniqueness for username and enforces field presence.
- Recommendations: Add client-side length and format validation before enabling save button. Prevent empty usernames (username.trim().length > 0). Warn about special characters that might not display correctly in game.

**Admin Panel Accessible to All Admins Without Audit Trail:**
- Risk: Any user with Admin role can modify users, delete game data, and perform bulk upserts without detailed audit logging of what was changed or why.
- Files: `spacetimedb/src/reducers/admin.ts` (all public functions), `components/features/admin-view/`
- Current mitigation: Soft-delete for users includes a 5-second window for recovery. Admin actions are logged to server console with `console.log`.
- Recommendations: Enhance audit logging to track who made changes, when, what was changed, and with what values. Store audit records in a dedicated table. Add approval workflow for sensitive operations (demoting admins, deleting characters).

**Discord OAuth Scope Limited to `identify`:**
- Risk: Current implementation requests only `identify` scope (username, avatar, ID). No email or guild information available; user identification relies solely on Discord ID.
- Files: `app/api/auth/authOptions.ts` (line 10)
- Current mitigation: Discord ID is treated as unique user identifier and stored in `User.discordId`.
- Recommendations: Document that Discord account changes (username/avatar) are not automatically synced. Consider requesting `email` scope if you need email-based account recovery in the future.

## Fragile Areas

**LoadoutManager Dependency Chain:**
- Files: `components/features/hooks/useLoadouts.ts`, `components/features/team-builder/LoadoutManager.ts`
- Why fragile: useLoadouts hook is deeply coupled to LoadoutManager's implementation. If LoadoutManager changes the shape of Loadout interface or adds new fields, the hook must be updated in multiple places. The unresolveTeamMember function is called in a useCallback (line 177-181) that depends on an external module.
- Safe modification: Always run tests after modifying LoadoutManager interface. Use TypeScript strict mode to catch shape mismatches. Add JSDoc to LoadoutManager exports documenting the contract.
- Test coverage: No tests found for useLoadouts hook. Loadout persistence and state management are untested.

**Admin Bulk Upsert with Dynamic Table Routing:**
- Files: `spacetimedb/src/reducers/admin.ts` (line 224-369), `components/features/admin-view/components/BulkUpsert.tsx`
- Why fragile: Long switch statement in admin_bulk_upsert reducer that must be updated when adding new upsertable tables. Frontend validation and backend validation must stay in sync (separate lists of expected columns). If a new table is added, both frontend enum UPSERT_TABLES and backend switch must be updated.
- Safe modification: Create a shared constants file that both frontend and backend import from (or codegen). Define table schemas once. Add a test that verifies every table in UPSERT_TABLES has a handler in the reducer switch statement.
- Test coverage: No integration tests for bulk upsert. Admin operations are untested against actual SpacetimeDB.

**User Identity Mapping Design:**
- Files: `spacetimedb/src/tables/userIdentity.ts`, `spacetimedb/src/helpers/ensurePermissions.ts`, `spacetimedb/src/reducers/auth.ts`
- Why fragile: Every reducer that needs user context must call `getAuthenticatedUser()`, which does a lookup on UserIdentity then User. If the UserIdentity record is deleted but User still exists, the reducer will throw. If the mapping is not established during OAuth callback, subsequent calls fail. No cascade delete constraints exist.
- Safe modification: Test OAuth flow end-to-end (register → identity linked → can call authenticated reducers). Document the UserIdentity ↔ User relationship as required and immutable during session. Add a consistency check reducer that verifies every UserIdentity has a corresponding User.
- Test coverage: No tests for auth flow. User registration and identity linking are untested.

## Test Coverage Gaps

**No Tests for Authentication Flow:**
- What's not tested: Discord OAuth callback, UserIdentity creation, session persistence, auth guard behavior, logout cleanup
- Files: `app/api/auth/[...nextauth]/route.ts`, `app/api/auth/link-discord/route.ts`, `spacetimedb/src/reducers/auth.ts`
- Risk: Auth middleware could silently fail or grant access to unauthenticated users. OAuth state validation might be compromised.
- Priority: High

**No Tests for Loadout Persistence:**
- What's not tested: localStorage save/load, SSR hydration without data loss, loadout update race conditions, fallback to defaults
- Files: `components/features/hooks/useLoadouts.ts`, `components/features/team-builder/LoadoutManager.ts`
- Risk: Loadout data could be silently lost due to hydration races. Users could lose their team configurations.
- Priority: High

**No Tests for Admin Operations:**
- What's not tested: Bulk upsert validation, enum checking, key mismatch detection, table constraints, user deletion safeguards
- Files: `spacetimedb/src/reducers/admin.ts`, `components/features/admin-view/components/BulkUpsert.tsx`
- Risk: Invalid data could corrupt game data tables. Admin safeguards (preventing admin demotion, preventing user deletion if in active match) might be bypassed.
- Priority: High

**No Tests for SpacetimeDB Reducers:**
- What's not tested: Any reducer in `spacetimedb/src/reducers/`, permission checks, transactional consistency
- Files: All `.ts` files in `spacetimedb/src/reducers/`
- Risk: Business logic bugs in multiplayer state management are not caught until production. Reducers are the only transaction boundary in SpacetimeDB.
- Priority: Critical

**No Integration Tests Between Frontend and Backend:**
- What's not tested: End-to-end flows like create lobby → add members → start draft
- Files: All of `app/` and `spacetimedb/`
- Risk: Frontend/backend contracts could drift. Changes in one could break the other undetected.
- Priority: Medium

## Missing Critical Features

**No Loadout Persistence for Authenticated Users:**
- Problem: Authenticated users' loadouts only exist in browser memory. No way to load a saved team on another device or after session expiry.
- Blocks: Multi-device support, cloud save feature, team sharing
- Implementation status: Partially designed (TODO in code) but not implemented

**No Rate Limiting on Admin Operations:**
- Problem: Admin can bulk upsert unlimited rows, delete unlimited users, or perform unlimited updates without throttling.
- Blocks: Prevents abuse by compromised admin account; makes audit trail meaningful
- Implementation status: Not implemented

**No User Account Recovery After Deletion:**
- Problem: Soft-deleted users are permanently deleted after 5 seconds with no way to cancel or restore.
- Blocks: Accident recovery, user support workflows
- Implementation status: 5-second grace period exists but no cancel mechanism

## Dependencies at Risk

**SpacetimeDB Version Lock:**
- Risk: Project depends on `spacetimedb ^2.0.3`. Major version updates (e.g., 3.0.0) could introduce breaking changes to reducer API, table schema, or client bindings.
- Impact: Binding generation would fail; client calls to reducers would break
- Migration plan: Test major version upgrades in a branch before merging. Review SpacetimeDB changelog for breaking API changes. Re-run `pnpm generate` after upgrading and check for TypeScript errors.

**NextAuth.js at 4.24.13 (Older Minor Version):**
- Risk: Current version is several minor versions behind 5.x. v5 has breaking changes; staying on v4 means missing security updates for edge cases.
- Impact: Potential OAuth CSRF vulnerabilities, session hijacking vectors
- Migration plan: Plan a dedicated phase to upgrade to NextAuth.js v5. Review the migration guide for breaking changes to authOptions, callbacks, and session shape. Update Discord provider configuration.

## Scaling Limits

**Table Growth Bottleneck in Admin Upserts:**
- Current capacity: HsrSynergyCost uses full-table scans for composite key lookups. Works fine with hundreds of rows.
- Limit: Performance degrades linearly with table size when synergy cost combinations exceed 10,000 rows.
- Scaling path: Add compound index on (sourceName, targetName, gameMode) to HsrSynergyCost. Replace `.iter()` loop (admin.ts line 344) with indexed lookup.

**User Identity Lookup Under High CCU:**
- Current capacity: Lookup via indexed UserIdentity.identity fast for single users; works well up to 10,000 concurrent connections.
- Limit: If server-side logic iterates all UserIdentity rows during initialization or broadcasts, performance becomes O(n) in active user count.
- Scaling path: Cache identity→userId mappings in memory during module initialization. Maintain cache during reducer calls.

**Frontend Bundle Size with Game Data:**
- Current: Characters and lightcones are fetched at runtime via SpacetimeDB subscriptions.
- Limit: If game data grows to 50+ characters and 100+ lightcones, initial subscription payload could slow down client hydration.
- Scaling path: Implement server-side caching of game data. Pre-load core game data (top 10 characters, most popular lightcones) on page load, lazy-load the rest on demand.

## Known Issues in Notes

**Index Definition Comment (Outdated):**
- Location: `spacetimedb/src/tables/hsrCharacter.ts` line 19
- Issue: Comment states "People from the forums say we dont need 'name': XXXXXXXXX on indexes anymore" — this suggests uncertainty about SpacetimeDB's index requirements. The comment is informal and suggests the index structure was not fully understood at the time.
- Impact: Could indicate misunderstanding of how to define efficient indexes
- Fix: Replace with a clear explanation of why this index structure was chosen or remove if no longer necessary

---

*Concerns audit: 2026-03-15*
