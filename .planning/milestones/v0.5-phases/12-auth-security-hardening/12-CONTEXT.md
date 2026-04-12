# Phase 12: Auth Security Hardening - Context

**Gathered:** 2026-04-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Harden the authentication system by isolating sensitive user data into a private table, adding ban infrastructure, closing the identity resolution gap in the Discord link flow, and making UserIdentity private. Discord-only scope — no new OAuth providers in this phase. Schema is designed to be auth-library-agnostic (NextAuth, BetterAuth, or any future replacement).

</domain>

<decisions>
## Implementation Decisions

### UserPrivate Table Design
- **D-01:** Create a flat `UserPrivate` table (private, `public: false`) with PK `userId` (FK to User). Columns: `discordId?`, `discordUsername?`, `email?` (schema-only, not populated), plus audit columns. No `emailVerified` — verification is determined by having a linked provider. Google auth removed from scope.
- **D-02:** Remove `discordId` from the public `User` table. Add `hasDiscordLinked: bool` to `User` for public display (provider badge). Updated whenever UserPrivate changes. Google auth removed from scope — no `hasGoogleLinked`.
- **D-03:** On user deletion (soft-delete): hard-delete UserPrivate row. If the user was banned, the BanRecord itself retains the discordId (self-contained ban records outlive user rows).
- **D-04:** Merged view: `view_my_profile` returns User + UserPrivate joined data so the caller sees their own discordId/email in a single subscription.
- **D-05:** Admin/Moderator view: `view_admin_user_private` returns all UserPrivate rows when caller has role >= Moderator (level 75). Enables Admins and Moderators to look up discordUsername for moderation. Role check enforced server-side in the view function.

### Ban System Design
- **D-06:** `BanRecord` private table. Ban type: Discord ID ban only. Columns: `id` (PK, autoInc), `banType` (enum: DiscordId), `providerId` (the banned Discord ID string), `reason` (string), `bannedByUserId` (u32), plus audit columns. Google auth removed from scope.
- **D-07:** Permanent bans only — no expiry mechanism. Admins lift bans manually by deleting the record.
- **D-08:** Enforcement at three points: (1) link-time — `server_link_provider` checks BanRecord before linking, rejects banned provider IDs; (2) login/reconnect — check on next connection; (3) active session — when a ban is created, the admin reducer also soft-deletes the user (`deletedAt` set), triggering the existing client-side auto-logout path in `useAuth.ts` (4-second delay).

### Identity Resolution Fix
- **D-09:** Ephemeral connection approach: client sends its SpacetimeDB auth token (not identity hex) to the API route. API route creates a short-lived DbConnection using that token, extracts the server-verified identity from `onConnect`, then passes the verified identity hex to the server reducer. Eliminates client-supplied hex trust.
- **D-10:** The server identity connection (existing singleton) is still used for the actual reducer call. The ephemeral connection is only for identity verification.

### Provider Linking Architecture
- **D-11:** Unified `server_link_provider` reducer replaces `server_link_discord`. Signature: `(callerIdentityHex, provider, providerId, providerName)`. Provider is a string enum (`discord` only — Google removed from scope). Same 4-case logic from current `server_link_discord`, generalized by provider. Ban check added before case evaluation.
- **D-12:** Two distinct linking paths: (1) Initial verification — guest connects with a provider, becomes verified user. (2) Add second provider — already-logged-in user links additional provider from profile. Both paths go through the server identity API route pattern.
- **D-13:** No auto-merge between providers. A fresh login with a new provider creates a new guest account. Linking an additional provider requires being logged in. No email-based matching.

### UserIdentity Privacy Migration
- **D-14:** Make `UserIdentity` table `public: false`. Client-side `useAuth.ts` switches from subscribing to `UserIdentity` table to `view_my_identity` view (already exists in securityViews.ts).
- **D-15:** Research phase must verify: do SpacetimeDB views and reducers retain read access to private tables? This is expected (server-side execution) but must be confirmed before implementation.

### view_user_directory Update
- **D-16:** `view_user_directory` returns: id, username, displayName, role, avatarCharacterName, isOnline, isGuest, hasDiscordLinked, displayedAchievementId. No auth IDs visible.

### Test Strategy
- **D-17:** Integration tests via existing test harness pattern. Key test cases: (1) Link Discord creates UserPrivate + sets hasDiscordLinked, (2) Ban discordId then attempt re-link is rejected, (3) Banned user is soft-deleted triggering logout path, (4) view_my_identity returns only caller's own mapping, (5) view_user_directory excludes discordId.

### Impact Audit Requirement
- **D-18:** Planning phase must include a full impact audit as a dedicated plan step: all reducers reading `User.discordId`, all views referencing discordId, all test files asserting on discordId or UserIdentity, `useAuth.ts` subscription changes, `userDeletionHelper.ts` cascade updates, client type definitions.

### Prior Execution Constraints (from rolled-back attempt)
- **CR-01 (CRITICAL):** UserPrivate and BanRecord tables MUST use explicit `public: false` in their table options. Do NOT omit the `public` key and rely on defaults — SpacetimeDB defaults to public. The existing `UserIdentity` table at `public: false` (line 23) confirms the pattern works. This is the most critical security constraint of the entire phase.
- **WR-01:** `checkProviderBan` helper MUST accept a `banType` parameter and filter results by `banType.tag`, not just by `providerId` alone. Without this, a ban on Discord ID "12345" could incorrectly block a different provider with the same ID string.
- **WR-02:** The ephemeral connection's `onDisconnect` handler should call `reject()` to fail fast instead of being a no-op that waits for the 5-second timeout. Add reject logic in `onDisconnect` so dropped connections error immediately.

### Claude's Discretion
- Internal helper structure for ban checking (inline vs separate helper function)
- UserPrivate index strategy (beyond userId PK)
- Exact error messages for ban rejection
- Ephemeral connection timeout and cleanup logic

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Auth System
- `spacetimedb/src/tables/user.ts` — User table definition (discordId to be removed)
- `spacetimedb/src/tables/userIdentity.ts` — UserIdentity table (to be made private)
- `spacetimedb/src/reducers/server.ts` — server_link_discord reducer (to be replaced by server_link_provider), register_server
- `spacetimedb/src/reducers/auth.ts` — login_as_guest reducer
- `app/api/auth/link-discord/route.ts` — Discord link API route (identity resolution fix)
- `app/api/auth/authOptions.ts` — NextAuth configuration
- `lib/spacetimedb-server.ts` — Server connection singleton

### Views
- `spacetimedb/src/views/securityViews.ts` — Existing view patterns, view_my_identity, view_my_profile, view_admin patterns
- `spacetimedb/src/views/anonymousViews.ts` — Anonymous view patterns, view_user_directory

### Auth Client
- `components/features/auth/hooks/useAuth.ts` — Client auth hook (UserIdentity subscription migration)
- `components/features/auth/types.ts` — User type definition (discordId removal)

### Helpers
- `spacetimedb/src/helpers/auditColumns.ts` — Audit column pattern for new tables
- `spacetimedb/src/helpers/userDeletionHelper.ts` — Cascade deletion (UserPrivate + ban preservation)

### Existing Bans
- `spacetimedb/src/tables/lobbyBan.ts` — Lobby-level ban pattern (reference for BanRecord design)

### Behavior Specs
- `docs/auth/architecture.md` — Auth architecture docs (update after implementation)
- `docs/auth/contract.md` — Auth behavior spec (update after implementation)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `securityViews.ts` view_my_* pattern: `ctx.db.UserIdentity.identity.find(ctx.sender)` → userId → filtered query. Directly reusable for view_my_profile merge with UserPrivate.
- `auditColumns.ts` `auditInsert()` / `auditUpdate()` helpers: apply to UserPrivate and BanRecord tables.
- `userDeletionHelper.ts` cascade pattern: extend to include UserPrivate hard-delete.
- Existing `view_admin_*` pattern for role-gated views in securityViews.ts.

### Established Patterns
- Private tables use `public: false` — already established for CostSetDraft* tables (Phase 3)
- Views resolve caller identity via `ctx.db.UserIdentity.identity.find(ctx.sender)` — standard across all security views
- Server identity verification via `requireServer()` helper in server.ts
- Soft-delete with `deletedAt` field → client auto-logout in useAuth.ts (4s delay)
- O(n) UserIdentity scan in server_link_discord for identity resolution (to be preserved in unified reducer)

### Integration Points
- `useAuth.ts` line 34-43: identity resolution via `allIdentities.find()` → must switch to view_my_identity subscription
- `useAuth.ts` line 97: `currentUser.discordId !== discordUser.id` sync check → must adapt to read from merged view_my_profile
- `userDeletionHelper.ts`: `User.discordId = undefined` on soft-delete → must also hard-delete UserPrivate
- `app/api/auth/link-discord/route.ts` body parsing: `callerIdentityHex` → switch to `spacetimeToken`

</code_context>

<specifics>
## Specific Ideas

- Schema designed to be auth-library-agnostic: UserPrivate table structure works whether NextAuth, BetterAuth, or a custom solution is used. The reducer is the bridge — it doesn't care what called it.
- Ban enforcement triggers existing auto-logout: admin_ban_user → soft-delete → useAuth detects deletedAt → 4s logout. No new client-side ban detection needed.
- Google auth removed from scope entirely — no googleId column, no hasGoogleLinked flag, no GoogleId ban type. Email column remains as schema-only (not populated).

</specifics>

<deferred>
## Deferred Ideas

- **Google OAuth provider** — Removed from scope entirely. No schema columns for Google auth. Add as its own phase if multi-provider is ever needed.
- **BetterAuth migration** — Evaluate replacing NextAuth with BetterAuth in a future phase. SpacetimeDB schema is auth-library-agnostic, so this would only change API routes and client hooks.
- **Email population from Discord scope** — Deferred until email auth or email-based bans become a requirement.
- **Ban expiry (temporary bans)** — Can be added later by adding an `expiresAt` column to BanRecord.
- **IP-based bans** — SpacetimeDB doesn't expose client IPs to reducers; would need a proxy layer.
- **Google Calendar integration** — Future feature connecting calendar to user's Google account.

</deferred>

---

*Phase: 12-auth-security-hardening*
*Context gathered: 2026-04-07*
