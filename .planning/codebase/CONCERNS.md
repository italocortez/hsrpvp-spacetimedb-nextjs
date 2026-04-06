# Codebase Concerns

**Analysis Date:** 2026-04-06

---

## Tech Debt

**Pervasive `as any` in backend TypeScript (401 occurrences):**
- Issue: The SpacetimeDB TypeScript SDK does not expose typed ctx, row types, or enum discriminants, so nearly every db operation requires `as any` to satisfy the compiler. This is a known SDK limitation, not a code smell per se, but it means type errors in reducer logic are invisible to tsc.
- Files: `spacetimedb/src/helpers/finalizationHelpers.ts`, `spacetimedb/src/helpers/bracketHelpers.ts`, `spacetimedb/src/helpers/leaderboardRebuild.ts`, all reducer files
- Impact: Mistyped field names, wrong enum tag strings, and missing required fields in inserts/updates all compile cleanly. Bugs surface only at runtime on maincloud.
- Fix approach: When the SDK ships typed ctx (tracked upstream), replace `as any` with real types. Until then, maintain a strict naming convention for enum tag strings and document all struct shapes in `spacetimedb/src/types/structs.ts`.

**`ctx: any` in all reducer signatures:**
- Issue: 11 reducer/helper functions declare `ctx: any` as the parameter type. This is required by the current SDK API but blocks static analysis of db method calls.
- Files: `spacetimedb/src/helpers/finalizationHelpers.ts`, `spacetimedb/src/helpers/leaderboardRebuild.ts`, `spacetimedb/src/helpers/achievementChecker.ts`, and most other helper files
- Impact: Calling a non-existent index (e.g. `ctx.db.Foo.bad_index.filter(...)`) compiles fine.
- Fix approach: Same as above — SDK-level fix required. In the interim, unit-test index lookups in the test harness.

**Untyped cost fields on `HsrCharacterCostRow` and `HsrLightconeCostRow`:**
- Issue: `classicCosts` and `auctionBaseBid` are typed `any` in the frontend interface definition in `GameDataProvider.tsx`.
- Files: `components/features/game-data/components/GameDataProvider.tsx` (lines 35–36, 41–42)
- Impact: Any consumer accessing cost breakdown fields has no type guidance; shape changes in the backend are invisible.
- Fix approach: Define explicit TypeScript interfaces for `classicCosts` and `auctionBaseBid` once the SpacetimeDB-generated bindings expose their nested types, or define them manually from the schema definition in `spacetimedb/src/tables/hsrCharacterCost.ts`.

**Frontend data type double-cast (`as unknown as X`):**
- Issue: All SpacetimeDB table rows are cast `as unknown as <FrontendType>` in `GameDataProvider.tsx` because generated binding types diverge from the hand-written frontend interfaces.
- Files: `components/features/game-data/components/GameDataProvider.tsx` (lines 77–85), `components/features/auth/hooks/useAuth.ts` (lines 18, 21)
- Impact: Interface drift between backend schema and frontend type definitions will not cause a compile error — only runtime breakage.
- Fix approach: Either use the generated binding types directly (importing from `src/module_bindings`) or write a runtime validation layer (e.g. zod) at the context boundary. The generated types are the source of truth.

**`session.user as any` for Discord identity in two places:**
- Issue: NextAuth's session type does not include `id` on the user, so both `authOptions.ts` and `link-discord/route.ts` cast `session.user as any` to access the Discord ID.
- Files: `app/api/auth/authOptions.ts` (line 17), `app/api/auth/link-discord/route.ts` (line 22)
- Impact: If NextAuth changes the token shape, the missing `id` is silent.
- Fix approach: Add a `declare module 'next-auth'` augmentation in a `.d.ts` file to extend the `Session` and `JWT` types with the Discord `id` field. This is the NextAuth-documented approach.

**`(conn.reducers as any)` for admin reducer calls:**
- Issue: Admin view components cast `conn.reducers as any` before calling `adminBulkUpsert`, `adminDeleteRow`, and `adminUpdateUser` because the generated reducer types apparently do not include these reducers in the typed interface.
- Files: `components/features/admin-view/components/BulkUpsert.tsx` (line 210), `components/features/admin-view/components/TableExplorer.tsx` (line 137), `components/features/admin-view/components/UserManager.tsx` (line 90)
- Impact: Typos in reducer argument names are undetected. A binding regeneration that renames the reducer will not produce a compile error.
- Fix approach: Regenerate bindings after every `spacetime publish` and verify the reducer names match. Track this in the deployment checklist.

**Loadouts are localStorage-only for authenticated users (deferred backend integration):**
- Issue: `useLoadouts.ts` has a `TODO` comment: when `isAuthenticated`, mutations should call SpacetimeDB reducers instead of writing to localStorage. Currently, authenticated users' loadouts are still local-only.
- Files: `components/features/hooks/useLoadouts.ts` (line 95), `components/features/team-builder/LoadoutManager.ts`
- Impact: Authenticated users lose loadout data on a different browser/device. No server persistence.
- Fix approach: Implement backend loadout tables and reducers, then wire the `isAuthenticated` branch in `useLoadouts.ts`.

---

## Known Bugs / Missing Recovery Paths

**AwaitingResult lobbies cannot be force-closed without a winner:**
- Symptoms: A lobby stuck in `AwaitingResult` (disputed match never resolved) can only be resolved by `admin_force_finalize` (requires picking a winner) or `admin_void_match`. There is no `close_lobby` path from `AwaitingResult`.
- Files: `spacetimedb/src/reducers/adminMatchTools.ts`, `spacetimedb/src/reducers/lobbyGc.ts` (line 96 — explicitly skips AwaitingResult)
- Trigger: Ranked match disputed via `dispute_match_result`, both players disconnect, no admin resolution.
- Workaround: Admin must use `admin_void_match` to erase the match, losing the result entirely, or `admin_force_finalize` to assign a winner.
- Deferred to: Phase 10

**Bracket rollback after finalized lobby cascade-delete:**
- Symptoms: `admin_set_bracket_winner` (rollback path) fails after finalization cascade-deletes the lobby, because `submit_and_advance_bracket` requires a `MatchResultRecord` that no longer exists. No manual bracket override tool exists.
- Files: `spacetimedb/src/reducers/adminMatchTools.ts`, `spacetimedb/src/helpers/bracketHelpers.ts`
- Trigger: Admin runs `admin_set_bracket_winner` on a bracket match whose lobby was already finalized and cascade-deleted.
- Workaround: None currently — bracket position becomes stuck.
- Deferred to: Phase 10

**`ParticipantStatus` enum: 3 of 6 variants never set:**
- Symptoms: `CheckedIn`, `Active`, and `Eliminated` variants of the `ParticipantStatus` enum exist in the schema but no reducer ever sets them. Clients reading `TournamentEnrolled.status` will never see these values.
- Files: `spacetimedb/src/types/enums.ts`, `spacetimedb/src/reducers/bracketAdvancement.ts` (sets `Eliminated` correctly per D-40 — verify this is actually wired), `spacetimedb/src/reducers/tournamentCheckIn.ts`
- Trigger: Checking `TournamentEnrolled.status` to identify active/eliminated players.
- Workaround: `Registered` = not yet started; `Eliminated`/`Withdrawn`/`Disqualified` are meaningful. `CheckedIn` and `Active` are dead letters.
- Deferred to: Phase 10

**`throw new Error()` with empty message in chat reducer:**
- Symptoms: If metadata JSON parses but has an invalid `type`, a bare `throw new Error()` is thrown before a `throw new SenderError(...)` in the catch block. This creates a confusing error trace.
- Files: `spacetimedb/src/reducers/chat.ts` (line 37)
- Trigger: Sending a chat message with `metadata` JSON that is valid JSON but contains an unknown `type` value.
- Workaround: The `SenderError` in the catch block does fire with a useful message. The bare `Error` is caught by the outer try/catch and re-thrown as the `SenderError`. Behavior is correct but the code is misleading.

---

## Security Considerations

**`callerIdentityHex` passed from client is trusted by server identity check, not session:**
- Risk: The `link-discord` API route accepts `callerIdentityHex` from the request body (client-controlled). The server calls `server_link_discord` with this hex, which then looks up the `UserIdentity` row for that hex and links the Discord ID to it.
- Files: `app/api/auth/link-discord/route.ts` (lines 38–49), `spacetimedb/src/reducers/server.ts` (lines 81–140)
- Current mitigation: The route requires a valid NextAuth `session` (server-verified Discord OAuth). The backend `server_link_discord` only executes if `ctx.sender` is the registered server identity. This means only the trusted Next.js server can call this reducer.
- Remaining gap: The link maps a client-supplied hex to the authenticated Discord user. A malicious client that controls its own `callerIdentityHex` could link its identity to any Discord account that happens to OAuth in the same tab, but only if it can also control the browser tab performing OAuth — not a practical attack vector given the same-origin session. However, there is no server-side validation that the `callerIdentityHex` actually matches the SpacetimeDB connection that triggered the OAuth flow.
- Recommendations: Consider storing the identity hex in the NextAuth session (set it on the callback after the OAuth round-trip) rather than accepting it from the POST body. This would fully close the gap.

**Debug `console.log` statements in production backend (96 occurrences):**
- Risk: Lobby IDs, user IDs, Discord usernames, and match results are logged to SpacetimeDB server logs. These logs are accessible to anyone with the database admin token on maincloud.
- Files: `spacetimedb/src/index.ts` (connect/disconnect events), `spacetimedb/src/helpers/finalizationHelpers.ts`, `spacetimedb/src/helpers/userDeletionHelper.ts`, `spacetimedb/src/reducers/achievementManagement.ts`, and throughout
- Current mitigation: Logs are gated by maincloud dashboard access (admin-only).
- Recommendations: These logs are useful for operational debugging. Acceptable at current scale. Consider a structured log level system if the user base grows significantly.

**`NEXT_PUBLIC_SPACETIMEDB_DB_NAME` fallback exposes a real database name:**
- Risk: `lib/spacetimedb.ts` falls back to `'hsrpvp-spacetimedb-nextjs-test1'` if the env var is unset. A developer running without `.env.local` will silently connect to this presumably real test database.
- Files: `lib/spacetimedb.ts` (line 4)
- Current mitigation: The database requires authentication; unauthenticated reads are limited to public tables.
- Recommendations: Change the default fallback to an invalid/placeholder value (e.g. `'__unset__'`) so a misconfigured environment fails loudly.

**`console.log` in `app/providers.tsx` logs SpacetimeDB identity hex on every connect:**
- Risk: The identity hex is logged to the browser console on each connection, visible to anyone with DevTools open.
- Files: `app/providers.tsx` (lines 16–19)
- Recommendations: Remove or gate behind a `process.env.NODE_ENV === 'development'` check before production release.

---

## Performance Bottlenecks

**Full-table leaderboard rebuild on every ranked match finalization:**
- Problem: `rebuildLeaderboard()` deletes all `Leaderboard` rows for the current season and then re-inserts the top 100 per category (4 categories × 100 entries = up to 400 deletes + 400 inserts) inside a single reducer transaction. It also calls `.iter()` on all `MmrRating` rows.
- Files: `spacetimedb/src/helpers/leaderboardRebuild.ts`, called from `spacetimedb/src/helpers/finalizationHelpers.ts` (step 13b)
- Cause: Materialized table approach chosen over view (D-50). Full rebuild is O(N) on `MmrRating` table size with each match.
- Improvement path: At scale (1000+ players per season), add an incremental update path — only re-rank the affected game mode category rather than all 4. Or promote `process_tournament_mmr` for all ranked play (defers rebuild to a batch call, not inline).

**`rebuildLeaderboard` iterates `MmrRating` twice (once per category, once global):**
- Problem: The function calls `[...ctx.db.MmrRating.iter()]` twice — once inside the per-mode category loop and once for the global category — resulting in 2 full table scans per finalization.
- Files: `spacetimedb/src/helpers/leaderboardRebuild.ts` (lines 46, 81)
- Improvement path: Load all `MmrRating` rows once into a local array, then filter for each category.

**`achievementChecker` scans all achievements on every match finalization:**
- Problem: `checkAndAwardAchievements()` calls `ctx.db.Achievement.iter()` to load all non-manual achievements, then evaluates every criteria for the user. Called at the end of every ranked match finalization.
- Files: `spacetimedb/src/helpers/achievementChecker.ts` (line 122)
- Cause: No index on `isManualOnly`. Full scan at every finalization.
- Improvement path: Add a btree index on `Achievement.isManualOnly` (boolean), or cache achievement criteria in a static list loaded once. At small achievement counts (<50) this is acceptable; at scale it compounds with leaderboard rebuild cost.

**`lobbyGc` iterates all lobbies on every 5-minute tick:**
- Problem: `run_lobby_gc` calls `ctx.db.Lobby.iter()` and checks every lobby for staleness on every GC run.
- Files: `spacetimedb/src/reducers/lobbyGc.ts` (line 94)
- Cause: No index on `stage` or `lastActivityAt` to filter candidates.
- Improvement path: Add a btree index on `Lobby.stage` to skip `AwaitingResult`, `Shelved`-tournament, and `Active` lobbies without full scan.

**`GameDataProvider.isReady` does not wait for cost or synergy data:**
- Problem: `isReady` is `!!characterRows && !!lightconeRows`. `characterCostRows`, `lightconeCostRows`, and `synergyCostRows` are not in the guard. Consumers that access cost data may read empty arrays during initial subscription.
- Files: `components/features/game-data/components/GameDataProvider.tsx` (line 87)
- Improvement path: Add the three cost tables to the `isReady` expression, or expose per-data-type ready flags.

---

## Fragile Areas

**`finalizationHelpers.ts` — 651-line monolithic pipeline:**
- Files: `spacetimedb/src/helpers/finalizationHelpers.ts`
- Why fragile: The 19-step finalization pipeline handles ranked match MMR, tournament bracket advancement, achievement checking, leaderboard rebuild, history archival, and lobby cascade-delete in a single function. A failure in any step rolls back the entire transaction, which means a bug in achievement step 12 prevents the match from ever being finalized.
- Safe modification: Add or modify only one step at a time. Always run the full match-lifecycle integration test suite (`test/backend/match-results/match-lifecycle.test.ts`) after any change.
- Test coverage: Covered by `test/backend/match-results/` but UAT of Phase 9 was cut short at 6/24 tests (noted in `notes/reportcards/`).

**`draftClassic.ts` / `draftAuction.ts` — 830+ line reducers:**
- Files: `spacetimedb/src/reducers/draftClassic.ts` (832 lines), `spacetimedb/src/reducers/draftAuction.ts` (803 lines)
- Why fragile: Both files encode the full draft state machine logic inline. Shared draft sequences are imported from `helpers/draftSequences.ts` but a significant amount of logic is duplicated between the two files.
- Safe modification: Any change to pick/ban order, timer logic, or budget enforcement must be cross-checked in both files. Run `test/backend/match-session/` after changes.
- Test coverage: Draft integration tests exist but Phase 9 UAT did not complete draft-system coverage.

**Server connection singleton in `lib/spacetimedb-server.ts`:**
- Files: `lib/spacetimedb-server.ts`
- Why fragile: The `connectionPromise` module-level singleton is reset to `null` on disconnect but is not guarded against concurrent calls during reconnect. Two simultaneous API route invocations during reconnection will both call `DbConnection.builder().build()`, creating two parallel connections.
- Safe modification: Add a mutex or pending-connect deduplication before calling `.build()`. Currently only `link-discord` uses this singleton, so race conditions are low probability in practice.
- Test coverage: Not tested (no test coverage for API routes).

**`useAuth.ts` — multi-step async Discord linking flow with ref guards:**
- Files: `components/features/auth/hooks/useAuth.ts`
- Why fragile: The linking flow uses two `useRef` guards (`linkingRef`, `autoRegisteredRef`) to prevent double-execution across re-renders. The flow is: OAuth → sessionStorage intent flag → `loginAsGuest` reducer → subscription delivers mapping → `fetch('/api/auth/link-discord')`. Any re-render between steps can trigger partial re-execution; the refs guard against this but are not reset if an error occurs mid-flow (`autoRegisteredRef` stays `true` after a failed `loginAsGuest`).
- Safe modification: Any change to the linking effect dependencies must re-validate that the ref guards still prevent double-fire. Particularly sensitive to changes in `isActive`, `identity`, or `hasMapping` dependency ordering.
- Test coverage: No frontend tests for this hook (frontend test directory is empty except README).

---

## Scaling Limits

**Leaderboard rebuild throughput:**
- Current capacity: Tested at the baseline scale (~100 users, per `project_data_scale.md`). Rebuild inserts up to 400 rows per finalization.
- Limit: At ~5,000 active-season MmrRating rows (50 modes × 100 players) the full iter-and-sort step will begin to noticeably inflate finalization transaction time.
- Scaling path: Incremental update (only re-rank the affected mode) or promote tournament MMR to batch-only.

**`maxParticipants` has no upper bound validation:**
- Current capacity: `maxParticipants` is a `u32` with no validated maximum. A tournament could be created with `maxParticipants = 4294967295`.
- Limit: No enforced cap. Notes from `defered_notes.md`: "it means unlimited. Put a limit of 128 or something."
- Files: `spacetimedb/src/reducers/tournamentManagement.ts` (line 157), `spacetimedb/src/tables/tournament.ts` (line 12)
- Scaling path: Add validation in `create_tournament` and `update_tournament` reducers: `if (maxParticipants < 2 || maxParticipants > 256) throw new SenderError(...)`.

---

## Dependencies at Risk

**`next-auth` v4 (4.24.x) — major version behind:**
- Risk: `next-auth` v5 (Auth.js) is the current major release with breaking API changes. v4 is in maintenance mode. The Discord provider callback and session augmentation patterns used in `authOptions.ts` and `link-discord/route.ts` will need migration.
- Impact: Staying on v4 limits compatibility with future Next.js features that assume Auth.js. The `(session.user as any).id` workaround is partly caused by v4's session type not being augmented.
- Files: `app/api/auth/authOptions.ts`, `app/api/auth/link-discord/route.ts`, `app/api/auth/[...nextauth]/route.ts`
- Migration plan: Auth.js v5 migration guide is available. Session augmentation becomes a typed `declare module` extension. The Discord provider pattern is similar but callback structure differs.

**`spacetimedb` SDK `^2.0.3` — pre-stable, breaking changes likely:**
- Risk: The SpacetimeDB TypeScript SDK is pre-1.0 in terms of API stability. The `useTable` return signature, `DbConnection.builder()` API, and view subscription pattern could break on minor version bumps.
- Impact: The SDK is a core dependency. Any bump requires regenerating bindings, re-validating the `as unknown as` cast chain in `GameDataProvider.tsx`, and re-testing subscriptions.
- Files: Everywhere `spacetimedb/react` and `spacetimedb/server` are imported.
- Migration plan: Pin to exact version (not `^`) for production stability. Test SDK upgrades in a branch with full integration suite before merging.

---

## Test Coverage Gaps

**Frontend: zero component tests:**
- What's not tested: All React components, hooks (including `useAuth`, `useLoadouts`, `useGameData`), and UI flows have no automated tests.
- Files: `components/features/auth/hooks/useAuth.ts`, `components/features/hooks/useLoadouts.ts`, `components/features/game-data/components/GameDataProvider.tsx`, all components in `components/features/`
- Risk: Auth flow regressions (e.g. double-linking, stale intent flag) are caught only by manual testing. The `useAuth` hook is particularly complex.
- Priority: High — `useAuth.ts` handles authentication state for the entire app.

**API routes: zero tests:**
- What's not tested: `app/api/auth/link-discord/route.ts`, `app/api/auth/authOptions.ts`, `app/api/auth/[...nextauth]/route.ts`
- Files: `app/api/auth/`
- Risk: The server-side Discord linking logic (the security-critical path) has no automated verification.
- Priority: High.

**Backend Phase 9 UAT incomplete (6/24 tests run):**
- What's not tested: Draft system (Classic + Auction), post-draft flow, tournament lobby, anonymous mode, lobby presets. The 18 remaining tests from the Phase 9 UAT script were not completed.
- Files: `test/backend/` — draft, match-session, tournament areas
- Risk: Draft-system bugs could exist in Classic and Auction modes that are untested since Phase 9 changes (`lobbyLifecycle.ts` refactors, AwaitingResult stage introduction).
- Priority: High — draft is the core gameplay loop.

**`finalizationHelpers.ts` pipeline — partial UAT only:**
- What's not tested: Steps 11–19 of the 19-step finalization pipeline were not UAT'd in Phase 9 UAT (only steps 1–10 per session log).
- Files: `spacetimedb/src/helpers/finalizationHelpers.ts`, `test/backend/match-results/`
- Risk: MMR calculation, leaderboard rebuild, history archival, and achievement check steps may have subtle bugs in edge cases (draw, concede, tournament match).
- Priority: High.

---

*Concerns audit: 2026-04-06*
