# Codebase Concerns

**Analysis Date:** 2026-03-15

## Tech Debt

**Draft System Is Incomplete Stubs:**
- Issue: The entire active draft/game layer consists of empty or single-line stub files. All draft hooks and auction components contain no implementation.
- Files:
  - `components/features/drafting/hooks/useDraftState.ts` (1 line: comment only)
  - `components/features/drafting/hooks/useDraftActions.ts` (1 line: comment only)
  - `components/features/drafting/hooks/useDraftTimer.ts` (1 line: comment only)
  - `components/features/drafting/hooks/useLobbyPlayerRole.ts` (2 lines: comment only, notes a potential conflict with GameDataProvider)
  - `components/features/drafting/components/auction/DraftArea.tsx` (0 lines)
  - `components/features/drafting/components/auction/BanSlots.tsx` (0 lines)
  - `components/features/drafting/components/auction/BidPannel.tsx` (0 lines)
  - `components/features/drafting/components/auction/BudgetDisplayer.tsx` (0 lines)
  - `components/features/drafting/components/classic/DraftArea.tsx` (0 lines)
  - `components/features/drafting/components/classic/BanSlots.tsx` (0 lines)
  - `app/(game)/draft/[matchId]/page.tsx` (4 lines: renders `<div>Draft - Match {matchId}</div>`)
- Impact: The core product feature — live draft — does not function. The `MatchSession`, `MatchSessionStep`, and associated schema tables exist on the backend but have no frontend implementation.
- Fix approach: Implement `useDraftState` subscribing to `MatchSession` and `MatchSessionStep` tables. Implement `useDraftActions` calling pick/ban/bid reducers. Wire into the draft page route.

**Loadout Persistence Is localStorage-Only for Authenticated Users:**
- Issue: `useLoadouts` explicitly skips saving when `isAuthenticated === true` (mutations become no-ops for authenticated users), but there is no SpacetimeDB reducer implementation to replace it. A TODO comment marks the gap.
- Files: `components/features/hooks/useLoadouts.ts` (line 95: `// TODO: When isAuthenticated, call SpacetimeDB reducers here instead.`)
- Impact: Authenticated users cannot persist their team builder loadouts. Data is lost on logout.
- Fix approach: Add a SpacetimeDB table for user loadouts, create save/load reducers, wire them into the `saveLoadouts`, `saveIndex`, and `saveRuleSet` helpers when `isAuthenticated` is true.

**Lobby Reducers Missing:**
- Issue: No lobby creation, join, leave, or management reducers exist in `spacetimedb/src/reducers/`. The lobby and lobby member tables are defined but no client-callable reducer files exist for them.
- Files: `spacetimedb/src/tables/lobby.ts`, `spacetimedb/src/tables/lobbyMember.ts`
- Impact: The lobby page (`app/(authenticated)/lobby/page.tsx`) cannot create or join lobbies.
- Fix approach: Create `spacetimedb/src/reducers/lobby.ts` with create_lobby, join_lobby, leave_lobby reducers using `ensureTournamentHost` or `getAuthenticatedUser` guards.

**`inter` Font Commented Out in Root Layout:**
- Issue: The Inter font is configured but its `className` is not applied to the body element — the class application is commented out.
- Files: `app/layout.tsx` (lines 26-27: `// className={inter.className}`)
- Impact: No font is applied globally. The UI relies on browser defaults instead of the intended design font.
- Fix approach: Uncomment `className={inter.className}` on the body element.

## Known Bugs

**`update_username` Does Not Enforce Uniqueness:**
- Symptoms: Two verified Discord users could set their username to the same value. The `username` column has a `.unique()` constraint at the schema level, but the `update_username` reducer in `spacetimedb/src/reducers/profile.ts` does not call `ctx.db.User.username.find(trimmed)` before calling `.update()`. This differs from `admin_update_user` which does check uniqueness.
- Files: `spacetimedb/src/reducers/profile.ts` (lines 72-95)
- Trigger: Two users simultaneously attempt to set the same username.
- Workaround: The database `.unique()` constraint should cause a SpacetimeDB error, but the reducer won't surface a clean user-facing `SenderError` — it will result in an opaque failure.

**`update_avatar` Does Not Validate Character Exists:**
- Symptoms: A user can set `avatarCharacterName` to any arbitrary string, including names of characters that don't exist in `HsrCharacter`. The reducer comment says "should reference an existing HsrCharacter name" but performs no lookup.
- Files: `spacetimedb/src/reducers/profile.ts` (lines 101-113)
- Trigger: Calling `updateAvatar` reducer with an invalid `characterName`.
- Workaround: The profile page UI constrains choices, but the reducer is open to any string via direct reducer call.

**`TableExplorer` Uses Index-Based Row Keys:**
- Symptoms: Row deletions can cause React key instability. The table body uses `filteredRows.indexOf(row)` as the React key.
- Files: `components/features/admin-view/components/TableExplorer.tsx` (line 254: `key={filteredRows.indexOf(row)}`)
- Trigger: Deleting a row reindexes all subsequent rows, causing React to re-render more rows than necessary or misidentify rows.
- Workaround: None currently. Use a stable identifier derived from the row's primary key field instead.

## Security Considerations

**Admin Access Enforced Client-Side in Layout Only:**
- Risk: The admin page at `/admin-view` is protected only by a client-side role check in `app/(authenticated)/admin-view/layout.tsx`. The page's content (`AdminTabs`, `BulkUpsert`, `TableExplorer`, `UserManager`) would render if the JavaScript check is bypassed.
- Files: `app/(authenticated)/admin-view/layout.tsx` (lines 10-17), `components/features/admin-view/components/BulkUpsert.tsx`, `components/features/admin-view/components/UserManager.tsx`
- Current mitigation: All actual mutation reducers (`adminBulkUpsert`, `adminDeleteRow`, `adminUpdateUser`) call `ensureAdmin(ctx)` on the backend, so data cannot be modified without Admin role. Visual-only exposure is the remaining risk.
- Recommendations: Add a server-side redirect in the admin layout (or a Next.js middleware route guard) so the admin UI does not render even client-side for non-admins.

**`session.user` Cast to `any` in Multiple Places:**
- Risk: The NextAuth session's `user` object is cast to `any` in auth routes and hooks to access `id` (Discord user ID). If the NextAuth session shape changes or the callback configuration changes, this cast silently hides type errors.
- Files:
  - `app/api/auth/authOptions.ts` (line 17: `(session.user as any).id = token.sub`)
  - `app/api/auth/link-discord/route.ts` (line 22: `const discordUser = session.user as any`)
  - `components/features/auth/hooks/useAuth.ts` (line 80: `const discordUser = session.user as any`)
- Current mitigation: None — the `id` field is attached in the callback and relied on by the API route.
- Recommendations: Extend the NextAuth `Session` and `JWT` types via module augmentation (`next-auth.d.ts`) so the `id` field is typed without unsafe casts.

**Server-Side SpacetimeDB Connection Has No Reconnection Retry Logic:**
- Risk: `getServerConnection` in `lib/spacetimedb-server.ts` resets `connectionPromise = null` on disconnect, allowing retry on next call. However, an in-flight API request that acquires the connection, then experiences a disconnect mid-reducer call, will receive a rejected promise with no retry. Under sustained load or network instability, this can silently fail.
- Files: `lib/spacetimedb-server.ts` (lines 44-52)
- Current mitigation: `onConnectError` resets `connectionPromise` to allow retries. No exponential backoff or circuit-breaker pattern.
- Recommendations: Add retry with backoff inside `getServerConnection`, or surface failures to a structured error-tracking service.

**`callerIdentityHex` Is Trusted Without Additional Verification:**
- Risk: The `link-discord` API route accepts `callerIdentityHex` from the request body and passes it to `server_link_discord`. While the NextAuth session is verified server-side, a malicious authenticated Discord user could supply another user's identity hex in the body to re-link another user's SpacetimeDB identity to their Discord account.
- Files: `app/api/auth/link-discord/route.ts` (lines 38-50), `spacetimedb/src/reducers/server.ts` (lines 42-143)
- Current mitigation: The reducer enforces that the identity must have an existing `UserIdentity` mapping (guest must call `login_as_guest` first). The worst case is re-linking a guest identity to a Discord-owned user — guest merging, not account takeover.
- Recommendations: Document the threat model explicitly. Consider including the SpacetimeDB identity in the NextAuth JWT or requiring the client to sign a nonce to prove ownership of the identity.

## Performance Bottlenecks

**Full Table Iteration in Several Reducers:**
- Problem: Multiple reducers in `spacetimedb/src/reducers/server.ts` and `spacetimedb/src/reducers/admin.ts` use `ctx.db.<Table>.iter()` to find rows by non-indexed fields.
- Files:
  - `spacetimedb/src/reducers/server.ts` (line 65: iterates `UserIdentity` to match hex string; line 78: `User.user_discord_id.filter` is indexed but initial search is a loop)
  - `spacetimedb/src/reducers/admin.ts` (lines 84, 92, 101: iterates Lobby, LobbyMember, and MatchSessionStep on every user soft-delete)
  - `spacetimedb/src/reducers/server.ts` (lines 165, 196: full User table iteration to find by username)
  - `spacetimedb/src/reducers/cursor.ts` (line 14: uses `LobbyMember as any` with `.primaryKey.find()` workaround)
- Cause: Missing indexes or limitations in the SpacetimeDB TypeScript SDK for composite key lookups. At low user counts this is acceptable. With large datasets it becomes O(n).
- Improvement path: Add a btree index on `UserIdentity.userId` (for `filter` by userId). Add a btree index on `User.username` for identity lookup by username. Use the `user_identity_user_id` filter index already added to `UserIdentity` rather than full iteration where possible.

**`GameDataProvider` Recomputes All Mapped Data on Every Subscription Update:**
- Problem: All five `useTable` calls in `GameDataProvider` are mapped inline into the context value object on every render. Any table update (even a single character cost row change) triggers remapping of all characters and lightcones.
- Files: `components/features/game-data/components/GameDataProvider.tsx` (lines 76-87)
- Cause: No `useMemo` wrapping the expensive `.map(r => mapToCharacterData(...))` calls.
- Improvement path: Wrap `charactersData`, `lightconesData`, and `synergiesData` in `useMemo` with appropriate dependency arrays to avoid recomputing on unrelated table changes.

**`isReady` in `GameDataProvider` Checks Only Two of Five Tables:**
- Problem: `isReady` is computed as `!!characterRows && !!lightconeRows`, ignoring `characterCostRows`, `lightconeCostRows`, and `synergyCostRows`. Components consuming `isReady` may render with incomplete cost data.
- Files: `components/features/game-data/components/GameDataProvider.tsx` (line 87)
- Impact: `useProfile`, team builder, and cost display components may show cost values as zero before costs are loaded, with no loading indicator.
- Improvement path: Update `isReady` to check all five table subscriptions: `!!characterRows && !!lightconeRows && !!characterCostRows && !!lightconeCostRows && !!synergyCostRows`.

## Fragile Areas

**`UserIdentity` Table Access Bypasses Type System:**
- Files: `components/features/auth/hooks/useAuth.ts` (line 17), `components/features/admin-view/components/TableExplorer.tsx` (line 18)
- Why fragile: `(tables as any).UserIdentity` is used because the generated bindings don't expose `UserIdentity` as a typed export. Regenerating bindings after schema changes will not produce a TypeScript error at the call site — breakage is silent until runtime.
- Safe modification: After regenerating bindings with `spacetime:generate`, verify that `UserIdentity` is accessible as a typed property on `tables`. If it is, remove the `as any` casts and use the typed accessor.
- Test coverage: None — no tests exist in this codebase.

**Admin Reducer Calls Cast Through `as any`:**
- Files:
  - `components/features/admin-view/components/BulkUpsert.tsx` (line 210: `(conn.reducers as any).adminBulkUpsert`)
  - `components/features/admin-view/components/TableExplorer.tsx` (line 137: `(conn.reducers as any).adminDeleteRow`)
  - `components/features/admin-view/components/UserManager.tsx` (line 90: `(conn.reducers as any).adminUpdateUser`)
- Why fragile: If the admin reducer names change in the backend schema (e.g., rename during refactor), the `as any` cast silently suppresses the type error. The only feedback is a runtime failure when an admin submits data.
- Safe modification: After regenerating bindings, check if admin reducers are present in the typed `conn.reducers` interface. Use typed calls instead of casting.

**`server_link_discord` Reducer Has a Known Unhandled Case:**
- Files: `spacetimedb/src/reducers/server.ts` (lines 126-142)
- Why fragile: Comments in the reducer describe a "Case 2: Cross-device login" scenario where a Discord account owner connects from a new device before calling `login_as_guest`. The reducer handles this by throwing a `SenderError` with a message that expects the client to have already called `login_as_guest`. If the auth flow order changes or is parallelized, this becomes a silent failure from the user's perspective (they get no session).
- Safe modification: The `useAuth` hook in `components/features/auth/hooks/useAuth.ts` ensures `login_as_guest` is called before `link-discord`, so the ordering is currently enforced client-side. Document this ordering constraint explicitly and do not parallelize the two calls.

**Soft-Delete Window Is 5 Seconds:**
- Files: `spacetimedb/src/reducers/admin.ts` (line 113), `spacetimedb/src/reducers/userDeletion.ts`
- Why fragile: After an admin initiates user deletion, the client is given `deletedAt` via subscription and has 4 seconds (client-side timer in `useAuth.ts` line 119) to show the notification before the user is hard-deleted in 5 seconds. If the client-side timer fires after the hard-delete, the `signOut` call operates on a user that no longer exists. If SpacetimeDB scheduled job fires late (e.g., under load), the 5 second window may be shorter or longer than intended.
- Safe modification: Increase the hard-delete delay to at least 30 seconds and adjust the client warning timer accordingly to create a safer buffer.

## Scaling Limits

**No Lobby Garbage Collection for Stale Sessions:**
- Current capacity: No enforced limit on concurrent Lobby or MatchSession rows.
- Limit: `hostDisconnectTime` and `lastActivityAt` fields exist on the Lobby table but there is no scheduled reducer or cleanup logic that sweeps stale lobbies.
- Scaling path: Implement a scheduled reducer (similar to `run_user_deletion`) that iterates Lobby rows with `hostDisconnectTime` older than a threshold and deletes them along with their LobbyMember and MatchSession rows.

**`LobbyCursorEvent` Table Has No Pruning:**
- Current capacity: Cursor broadcast events are inserted into `LobbyCursorEvent` but never deleted.
- Limit: Over time with active lobbies, this table grows unboundedly and is subscribed to by all lobby members.
- Scaling path: Switch from insert-per-event to an upsert pattern (one row per sender per lobby, overwriting position in place), or implement periodic cleanup of old events.

## Dependencies at Risk

**`next-auth` v4 Is in Maintenance Mode:**
- Risk: `next-auth@^4.24.13` (package.json line 35) is the legacy v4 release. The project successor `auth.js` (formerly NextAuth v5) is the actively maintained version for Next.js App Router. v4 has limited support for App Router patterns.
- Impact: Session management uses `getServerSession` from v4, which works but will not receive new features. Migrating later becomes harder as v5 API differs substantially.
- Migration plan: Migrate to `next-auth@5` / `auth.js` when the project stabilizes. The breaking changes primarily affect how `authOptions` is structured and how `getServerSession` is called.

**`spacetimedb` SDK Is on a Pre-Stable Major (`^2.0.3`):**
- Risk: The SpacetimeDB TypeScript SDK at v2 may have breaking API changes in minor or patch releases given the project is early-stage.
- Impact: Bindings are auto-generated and depend on SDK types. A patch update could break `useTable`, `useSpacetimeDB`, or `DbConnection.builder()` contracts.
- Migration plan: Pin the SDK to an exact version (`"spacetimedb": "2.0.3"`) until the SpacetimeDB TypeScript SDK declares stability. Upgrade intentionally and regenerate bindings after each upgrade.

## Missing Critical Features

**No Lobby Creation/Management UI or Reducers:**
- Problem: The lobby page (`app/(authenticated)/lobby/page.tsx`) exists as a route but no reducer implementations for creating or joining lobbies exist.
- Blocks: Users cannot start a draft. The entire match flow depends on lobby creation first.

**No Draft Reducer Implementations:**
- Problem: No `pick`, `ban`, `bid`, or `undo` reducers exist in `spacetimedb/src/reducers/`. The `MatchSession` and `MatchSessionStep` tables are schema-defined but have no write path.
- Blocks: The entire live draft experience is blocked.

**No Error Boundary or Global Error Handling:**
- Problem: No React Error Boundary wraps any part of the component tree. SpacetimeDB connection errors are surfaced to `AuthRequired` via `connectionError`, but component-level runtime errors will crash the page with no fallback UI.
- Blocks: Production reliability — a single component throw leaves the page blank.

## Test Coverage Gaps

**Zero Test Coverage Across the Entire Codebase:**
- What's not tested: All business logic hooks, auth flows, loadout management, cost calculations, data mapping helpers, and backend reducers have no automated tests.
- Files: Every file in `components/`, `app/`, `lib/`, and `spacetimedb/src/reducers/`.
- Risk: Any refactor of `useAuth`, `useLoadouts`, `DataHelpers.ts`, or any backend reducer can introduce regressions with no safety net.
- Priority: High — start with unit tests for `components/features/game-data/components/DataHelpers.ts` (pure functions, easy to test), `components/features/team-builder/LoadoutManager.ts` (localStorage logic), and backend reducer helpers in `spacetimedb/src/helpers/ensurePermissions.ts`.

---

*Concerns audit: 2026-03-15*
