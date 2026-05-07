# SECURITY.md -- Phase 12: Auth Security Hardening

**Audit Date:** 2026-04-08
**Auditor:** GSD Security Auditor (automated)
**ASVS Level:** 1
**Block Policy:** critical

---

## Threat Register Verification

### Plan 01 Threats (Schema Foundation)

| Threat ID | Category | Component | Disposition | Status | Evidence |
|-----------|----------|-----------|-------------|--------|----------|
| T-12-01 | Information Disclosure | UserPrivate table | mitigate | CLOSED | `spacetimedb/src/tables/userPrivate.ts:22` -- `public: false` explicit on table definition |
| T-12-02 | Information Disclosure | BanRecord table | mitigate | CLOSED | `spacetimedb/src/tables/banRecord.ts:28` -- `public: false` explicit on table definition |
| T-12-03 | Elevation of Privilege | checkProviderBan | mitigate | CLOSED | `spacetimedb/src/helpers/banHelper.ts:15` -- filters by `banType.tag` in-memory after provider_id index lookup (WR-01 compliant) |
| T-12-04 | Information Disclosure | User.discordId removal | mitigate | CLOSED | `spacetimedb/src/tables/user.ts` -- 0 occurrences of `discordId`; line 13 has `hasDiscordLinked: t.bool()` |
| T-12-05 | Information Disclosure | Deletion cascade | mitigate | CLOSED | `spacetimedb/src/helpers/userDeletionHelper.ts:47-49` -- `ctx.db.UserPrivate.userId.find(userId)` + `.delete(userId)` hard-deletes UserPrivate; line 85 sets `hasDiscordLinked: false`; BanRecord not touched (preserved per D-03) |

### Plan 02 Threats (Reducer and View Layer)

| Threat ID | Category | Component | Disposition | Status | Evidence |
|-----------|----------|-----------|-------------|--------|----------|
| T-12-06 | Elevation of Privilege | admin_ban_user | mitigate | CLOSED | `spacetimedb/src/reducers/banAdmin.ts:16` -- `ensureAdmin(ctx)` gate as first statement |
| T-12-07 | Spoofing | admin_ban_user duplicate ban | mitigate | CLOSED | `spacetimedb/src/reducers/banAdmin.ts:39-43` -- single-col `ban_record_provider_id` index + in-memory `banType.tag` filter prevents duplicate bans |
| T-12-08 | Tampering | server_link_provider callerIdentityHex | mitigate | CLOSED | `spacetimedb/src/reducers/server.ts:83` -- `requireServer(ctx)` verifies caller is registered server identity; client never calls directly |
| T-12-09 | Denial of Service | server_link_provider provider validation | mitigate | CLOSED | `spacetimedb/src/reducers/server.ts:98-100` -- whitelist `['discord']` with `SenderError` on invalid provider |
| T-12-10 | Elevation of Privilege | view_admin_user_private | mitigate | CLOSED | `spacetimedb/src/views/securityViews.ts:266` -- `isRoleAtLeast(user.role, 'Moderator')` gate; returns empty array for non-moderators |
| T-12-11 | Information Disclosure | view_my_profile | accept | CLOSED | Accepted risk: view_my_profile scoped to `ctx.sender` at `securityViews.ts:221`; returns only caller's own data. Low risk -- documented below in Accepted Risks. |
| T-12-17 | Information Disclosure | view_user_directory | mitigate | CLOSED | `spacetimedb/src/views/securityViews.ts:154-164` -- `UserDirectoryRow` contains only: id, username, displayName, role, avatarCharacterName, isOnline, isGuest, hasDiscordLinked, displayedAchievementId. No audit columns (createdById, lastModifiedById, createdDate, lastModifiedDate), no deletedAt, no lastLoginAt, no isPrivate. Line 171 filters soft-deleted users. |

### Plan 03 Threats (Integration and Frontend)

| Threat ID | Category | Component | Disposition | Status | Evidence |
|-----------|----------|-----------|-------------|--------|----------|
| T-12-12 | Spoofing | API route session | mitigate | CLOSED | `app/api/auth/link-discord/route.ts:57-66` -- NextAuth JWT decoded from session cookie with `NEXTAUTH_SECRET`; Discord ID from `token.sub` (not client-supplied). Lines 87-95: `spacetimeToken` from body verified via `verifyIdentityFromToken`. |
| T-12-13 | Spoofing | Ephemeral connection | mitigate | CLOSED | `lib/spacetimedb-server.ts:86-123` -- `verifyIdentityFromToken` creates ephemeral `DbConnection` with client token; identity extracted from `onConnect` callback (server-verified); immediate disconnect after. `spacetimedb/src/tables/userIdentity.ts:20` -- `public: false`. |
| T-12-14 | Tampering | API route body | mitigate | CLOSED | `app/api/auth/link-discord/route.ts:87-89` -- `spacetimeToken` required and type-checked (`typeof spacetimeToken !== 'string'` returns 400); no identity hex accepted from client body. Identity resolved server-side via ephemeral connection at line 95. |
| T-12-15 | Denial of Service | Ephemeral connection | accept | CLOSED | Accepted risk: `lib/spacetimedb-server.ts:88` -- 5-second timeout; line 103 disconnects immediately after identity extraction; line 116 `onDisconnect` fail-fast rejects if connection drops before resolution (WR-02). Documented below in Accepted Risks. |
| T-12-16 | Information Disclosure | useAuth.ts view subscription | mitigate | CLOSED | `components/features/auth/hooks/useAuth.ts:32` -- subscribes to `SELECT * FROM view_my_profile`. Server-side enforcement at `securityViews.ts:221` scopes to `ctx.sender` only. |

---

## Accepted Risks Log

| Threat ID | Category | Component | Risk Description | Justification |
|-----------|----------|-----------|------------------|---------------|
| T-12-11 | Information Disclosure | view_my_profile | Returns caller's own private data (discordId, discordUsername, email) merged from UserPrivate | Scoped to ctx.sender on server side (securityViews.ts:221). User can only see their own private data. Low risk -- no cross-user data exposure possible. |
| T-12-15 | Denial of Service | Ephemeral connection | Attacker could spam ephemeral connections to exhaust server resources | 5-second timeout (spacetimedb-server.ts:88) limits connection lifetime. Immediate disconnect after identity extraction (line 103). onDisconnect fail-fast (WR-02, line 116) prevents zombie connections. Rate limiting at the API route level is an additional future mitigation if needed. |

---

## Unregistered Flags

None. All three SUMMARY.md files (12-01, 12-02, 12-03) report "All new surface was already in the plan threat model" in their Threat Surface Scan sections. No unregistered threat flags raised.

---

## Summary

- **Threats Total:** 17
- **Threats Closed:** 17/17
- **Threats Open:** 0/17
- **Disposition Breakdown:** 14 mitigate (all verified), 2 accept (documented), 0 transfer
- **Unregistered Flags:** 0
