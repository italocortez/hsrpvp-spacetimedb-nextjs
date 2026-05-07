# Codebase Concerns

**Analysis Date:** 2026-04-12

---

## Tech Debt

**Pervasive `as any` in backend TypeScript:**
- Issue: The SpacetimeDB TypeScript SDK does not expose typed `ctx`, row types, or enum discriminants, so nearly every DB operation requires `as any`. This is a known SDK limitation — type errors in reducer logic are invisible to `tsc`.
- Files: All reducer files, `finalizationHelpers.ts`, `bracketHelpers.ts`, `leaderboardRebuild.ts`
- Impact: Mistyped field names, wrong enum tag strings, and missing required fields compile cleanly. Bugs surface only at runtime on maincloud.
- Fix approach: When SDK ships typed ctx (tracked upstream), replace `as any` with real types.

**`ctx: any` in all reducer/helper signatures:**
- Issue: All helper functions accepting a SpacetimeDB context declare `ctx: any`. Required by the current SDK API but blocks static analysis of db method calls.
- Files: `finalizationHelpers.ts`, `leaderboardRebuild.ts`, `achievementChecker.ts`, `rosterMutations.ts`, most other helper files
- Impact: Calling a non-existent index compiles fine.
- Fix approach: SDK-level fix required. In the interim, unit-test index lookups in the test harness.

**Untyped cost fields on `HsrCharacterCostRow` and `HsrLightconeCostRow`:**
- Issue: `classicCosts` and `auctionBaseBid` are typed `any` in the frontend interface in `GameDataProvider.tsx`.
- Files: `components/features/game-data/components/GameDataProvider.tsx`
- Fix approach: Define explicit TypeScript interfaces once generated bindings expose nested types.

**Frontend data type double-cast (`as unknown as X`):**
- Issue: All SpacetimeDB table rows are cast `as unknown as <FrontendType>` in `GameDataProvider.tsx` because generated binding types diverge from hand-written frontend interfaces.
- Files: `GameDataProvider.tsx`, `useAuth.ts`
- Fix approach: Use generated binding types directly (importing from `src/module_bindings`) or add runtime validation (zod) at context boundary.

**`session.user as any` for Discord identity in NextAuth routes:**
- Issue: NextAuth v4 session type does not include `id` on user, so `authOptions.ts` and `link-discord/route.ts` cast `session.user as any`.
- Files: `app/api/auth/authOptions.ts`, `app/api/auth/link-discord/route.ts`
- Fix approach: Add `declare module 'next-auth'` augmentation in a `.d.ts` file.

**`(conn.reducers as any)` for admin reducer calls:**
- Issue: Admin view components cast `conn.reducers as any` before calling `adminBulkUpsert`, `adminDeleteRow`, `adminUpdateUser` because typed interface does not include these.
- Files: `components/features/admin-view/components/BulkUpsert.tsx`, `TableExplorer.tsx`, `UserManager.tsx`
- Fix approach: Regenerate bindings after every `spacetime publish`; verify reducer names match.

**Loadouts are localStorage-only for authenticated users:**
- Issue: `useLoadouts.ts` has a TODO: when `isAuthenticated`, mutations should call SpacetimeDB reducers instead of localStorage.
- Files: `components/features/hooks/useLoadouts.ts`
- Impact: Authenticated users lose loadout data on a different browser/device.
- Fix approach: Implement backend loadout tables and reducers.

---

## Known Bugs / Missing Recovery Paths

**AwaitingResult lobbies cannot be force-closed without a winner:**
- Symptoms: A lobby stuck in `AwaitingResult` can only be resolved by `admin_force_finalize` (requires picking a winner) or `admin_void_match`. No `close_lobby` path from `AwaitingResult`.
- Files: `spacetimedb/src/reducers/adminMatchTools.ts`, `spacetimedb/src/reducers/lobbyGc.ts` (explicitly skips `AwaitingResult`)
- Workaround: Admin must use `admin_void_match` or `admin_force_finalize`.
- Deferred to: Phase 14+

**Bracket rollback after finalized lobby cascade-delete:**
- Symptoms: `admin_set_bracket_winner` fails after finalization cascade-deletes the lobby because required `MatchResultRecord` no longer exists.
- Files: `spacetimedb/src/reducers/adminMatchTools.ts`, `spacetimedb/src/helpers/bracketHelpers.ts`
- Workaround: None — bracket position becomes stuck.
- Deferred to: Phase 14+

**`ParticipantStatus` enum: 3 of 6 variants never set:**
- Symptoms: `CheckedIn`, `Active` variants exist in schema but no reducer sets them.
- Files: `spacetimedb/src/types/enums.ts`
- Workaround: `Registered`, `Eliminated`, `Withdrawn`, `Disqualified` are meaningful; `CheckedIn` and `Active` are dead letters.

**`throw new Error()` with empty message in chat reducer:**
- Symptoms: If metadata JSON has an unknown `type`, a bare `throw new Error()` is thrown before a `SenderError` in the catch block.
- Files: `spacetimedb/src/reducers/chat.ts`
- Workaround: The `SenderError` in the catch block fires with a useful message. Behavior is correct but code is misleading.

---

## Security Considerations

**`callerIdentityHex` passed from client in link-discord flow:**
- Risk: `link-discord` API route accepts `callerIdentityHex` from request body (client-controlled). The server calls `server_link_provider` with this hex.
- Current mitigation: Route requires valid NextAuth session (server-verified Discord OAuth). Backend `server_link_provider` only executes if `ctx.sender` is the registered server identity.
- Remaining gap: No server-side validation that `callerIdentityHex` matches the SpacetimeDB connection that triggered the OAuth flow.
- Recommendation: Store identity hex in the NextAuth session callback rather than accepting it from POST body.

**Debug `console.log` statements in production backend:**
- Risk: Lobby IDs, user IDs, Discord usernames logged to SpacetimeDB server logs. Accessible to anyone with database admin token on maincloud.
- Files: `spacetimedb/src/index.ts`, `finalizationHelpers.ts`, `userDeletionHelper.ts`, throughout
- Current mitigation: Logs gated by maincloud dashboard access (admin-only). Acceptable at current scale.
- Structured log prefixes used: `[IDENTITY_GC]`, `[DISCONNECT]`

**`NEXT_PUBLIC_SPACETIMEDB_DB_NAME` fallback exposes real database name:**
- Risk: `lib/spacetimedb.ts` falls back to `'hsrpvp-spacetimedb-nextjs-test1'` if env var is unset. Developer running without `.env.local` silently connects to real test database.
- Recommendation: Change fallback to `'__unset__'` so misconfigured environments fail loudly.

**`console.log` in `app/providers.tsx` logs identity hex on connect:**
- Risk: Identity hex logged to browser console on each connection, visible via DevTools.
- Files: `app/providers.tsx`
- Recommendation: Gate behind `process.env.NODE_ENV === 'development'` before production release.

---

## Performance Bottlenecks

**Full-table leaderboard rebuild on every ranked match finalization:**
- Problem: `rebuildLeaderboard()` deletes all `Leaderboard` rows for the current season and re-inserts top 100 per category (4 categories x 100 = up to 400 deletes + 400 inserts) inside a single reducer transaction. Calls `.iter()` on all `MmrRating` rows.
- Files: `spacetimedb/src/helpers/leaderboardRebuild.ts`, called from `finalizationHelpers.ts`
- Improvement: At scale (1000+ players), add incremental update — only re-rank the affected game mode category.

**`rebuildLeaderboard` iterates `MmrRating` twice per finalization:**
- Problem: `[...ctx.db.MmrRating.iter()]` called twice — once per-mode, once for global category.
- Files: `spacetimedb/src/helpers/leaderboardRebuild.ts`
- Improvement: Load all `MmrRating` rows once, then filter per category.

**`achievementChecker` scans all achievements on every finalization:**
- Problem: `checkAndAwardAchievements()` calls `ctx.db.Achievement.iter()` on every ranked match finalization. No index on `isManualOnly`.
- Files: `spacetimedb/src/helpers/achievementChecker.ts`
- Improvement: Add btree index on `Achievement.isManualOnly`, or cache achievement criteria.

**`lobbyGc` iterates all lobbies on every 5-minute tick:**
- Problem: `run_lobby_gc` calls `ctx.db.Lobby.iter()` and checks every lobby for staleness on every GC run.
- Files: `spacetimedb/src/reducers/lobbyGc.ts`
- Improvement: Add btree index on `Lobby.stage` to skip non-candidates.

**`iter()` usage on potentially large tables:**
- Files using iter() on large tables: `achievementChecker.ts`, `leaderboardRebuild.ts`, `finalizationHelpers.ts`, `anonymousViews.ts` (HsrAccount, ~300 rows, documented as acceptable)
- Pattern: `iter()` is acceptable for admin-content tables (<100 rows) and documented exceptions. Prefer btree index access for user-generated data tables.

**`GameDataProvider.isReady` does not wait for cost or synergy data:**
- Problem: `isReady` is `!!characterRows && !!lightconeRows`. Cost rows not included. Consumers accessing cost data may read empty arrays during initial subscription.
- Files: `components/features/game-data/components/GameDataProvider.tsx`
- Improvement: Add cost tables to the `isReady` expression.

---

## Fragile Areas

**`finalizationHelpers.ts` — ~650-line monolithic pipeline:**
- Files: `spacetimedb/src/helpers/finalizationHelpers.ts`
- Why fragile: 19-step pipeline handles ranked MMR, bracket advancement, achievement checking, leaderboard rebuild, history archival, and cascade-delete in a single transaction. A bug in any step prevents all finalization.
- Safe modification: Change one step at a time. Always run `test/backend/match-results/` after any change.
- Test coverage: Partially covered; Phase 9 UAT covered only steps 1-10 of 19.

**`draftClassic.ts` / `draftAuction.ts` — 830+ line reducers:**
- Files: `spacetimedb/src/reducers/draftClassic.ts`, `spacetimedb/src/reducers/draftAuction.ts`
- Why fragile: Full draft state machine logic inline. Significant logic duplicated between the two files.
- Safe modification: Cross-check both files for any pick/ban/timer change. Run `test/backend/match-session/` after changes.

**Server connection singleton in `lib/spacetimedb-server.ts`:**
- Files: `lib/spacetimedb-server.ts`
- Why fragile: `connectionPromise` module-level singleton reset to `null` on disconnect but not guarded against concurrent calls during reconnect. Two simultaneous API route invocations during reconnection create two parallel connections.
- Safe modification: Add mutex before `.build()`. Currently only `link-discord` uses this singleton.

**`useAuth.ts` — multi-step async Discord linking flow with ref guards:**
- Files: `components/features/auth/hooks/useAuth.ts`
- Why fragile: Linking flow uses `linkingRef` and `autoRegisteredRef` guards to prevent double-execution across re-renders. Ref guards not reset on error.
- Phase 12.2 change: Reads profile from `view_my_profile` (primary) with `onInsert`/`onUpdate` reactive callbacks; `User` table as fallback.
- Safe modification: Any change to `isActive`, `identity`, or `hasMapping` dependency ordering must re-validate ref guards.

**`view_my_profile` depends on UserPrivate row existence:**
- Files: `spacetimedb/src/views/securityViews.ts`
- Why fragile: `view_my_profile` uses `ctx.db.UserPrivate.userId.find(userId)` with optional chaining. If `UserPrivate` row is missing (pre-Phase 12 users), `discordId` and `discordUsername` are `undefined` — graceful but dependent on optional chaining throughout.
- Safe modification: Any addition of required fields to `view_my_profile` must handle missing UserPrivate row.

**`rosterMutations.ts` — shared helper called by 3 reducers:**
- Files: `spacetimedb/src/helpers/rosterMutations.ts` (Phase 12.3)
- Why fragile: `applyBatchUpsert` and `applyBatchRemove` are called by `batch_upsert_characters`, `batch_remove_characters`, and `migrate_roster`. A bug in the helper affects all three callers. The helper does NOT re-validate auth or ownership — callers must do that before delegating.
- Safe modification: Changes to `applyBatchUpsert`/`applyBatchRemove` must be validated against all three calling reducers. Run `test/backend/roster/` and `test/backend/match-results/` after any change.

---

## Scaling Limits

**Leaderboard rebuild throughput:**
- Current capacity: Tested at ~100-user baseline. Rebuild inserts up to 400 rows per finalization.
- Limit: At ~5,000 active-season `MmrRating` rows, full iter-and-sort will inflate finalization transaction time.
- Scaling path: Incremental update or promote tournament MMR to batch-only.

**`maxParticipants` has no upper bound validation:**
- Files: `spacetimedb/src/reducers/tournamentManagement.ts`, `spacetimedb/src/tables/tournament.ts`
- Note from `deferred_notes.md`: "Put a limit of 128 or something."
- Fix: Add `if (maxParticipants < 2 || maxParticipants > 256) throw new SenderError(...)`.

---

## Dependencies at Risk

**`next-auth` v4 (4.24.x) — major version behind:**
- Risk: `next-auth` v5 (Auth.js) is the current major release with breaking API changes. v4 is in maintenance mode.
- Impact: The `(session.user as any).id` workaround is partly caused by v4's session type not being augmented.
- Migration: Auth.js v5 migration guide available; session augmentation becomes a typed `declare module` extension.

**`spacetimedb` SDK `^2.1.0` — upgraded Phase 12.2, pre-stable:**
- Risk: Pre-1.0 API stability. Breaking changes occurred in 2.0.x to 2.1.0 upgrade (reducer call signature, view registration, confirmed reads).
- Impact: Any future bump could require regenerating bindings, re-validating `as unknown as` chains, and re-testing subscriptions.
- Mitigation: Pin to exact version (not `^`) for production stability. Test SDK upgrades in a branch with full integration suite.

---

## Test Coverage Gaps

**Frontend: zero component tests:**
- No automated tests for React components, hooks (`useAuth`, `useLoadouts`, `useGameData`), or UI flows.
- Risk: Auth flow regressions caught only by manual testing. `useAuth.ts` handles auth state for the entire app.
- Priority: High.

**API routes: zero tests:**
- No tests for `link-discord/route.ts`, `authOptions.ts`, `[...nextauth]/route.ts`.
- Risk: Security-critical Discord linking path has no automated verification.
- Priority: High.

**Backend Phase 9 UAT incomplete (6/24 tests run):**
- Untested: Draft system (Classic + Auction), post-draft flow, tournament lobby, anonymous mode, lobby presets.
- Risk: Draft-system bugs could exist since Phase 9 `lobbyLifecycle.ts` refactors.
- Priority: High — draft is the core gameplay loop.

**`finalizationHelpers.ts` pipeline — partial UAT only:**
- Phase 9 UAT covered only steps 1-10 of the 19-step finalization pipeline.
- Risk: MMR calculation, leaderboard rebuild, history archival, achievement check steps may have subtle bugs.
- Priority: High.

---

*Concerns audit: 2026-04-12 (regenerated from 2026-04-09; Phase 12.3 resolved the mmr-account-rating-source bug (D-D-04: migrate_roster now calls updateAccountRating via rosterMutations.ts); added rosterMutations.ts fragile-area note; Phase 14 test flakiness addressed by global-setup.ts)*
