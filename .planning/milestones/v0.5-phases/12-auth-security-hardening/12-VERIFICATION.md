---
phase: 12-auth-security-hardening
verified: 2026-04-08T10:00:00Z
status: human_needed
score: 4/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Trigger the Discord OAuth flow in a browser (dev or staging). After authenticating with Discord, confirm the API route at /api/auth/link-discord correctly verifies identity server-side via ephemeral connection and calls serverLinkProvider — not relying on a client-supplied identity hex."
    expected: "The Discord link completes successfully. The browser network tab shows POST /api/auth/link-discord with body { spacetimeToken: '<token>' } (no identityHex field). The server logs show an ephemeral connection established and disconnected. The user's profile shows 'hasDiscordLinked: true' in their view_my_profile subscription."
    why_human: "SEC-04 requires a live HTTP API route invocation through the Next.js server, which is outside the scope of the integration test harness. The ephemeral DbConnection.builder() call cannot be exercised via the CLI test harness — it requires an actual client token from a live browser session. The test file explicitly marks this as manual-only."
---

# Phase 12: Auth Security Hardening Verification Report

**Phase Goal:** Harden the authentication system by isolating sensitive user data into a private UserPrivate table, adding permanent ban infrastructure (Discord ID only — Google descoped), closing the identity resolution gap in the Discord link flow, and making UserIdentity private — without changing the auth library
**Verified:** 2026-04-08T10:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | UserPrivate private table holds discordId, discordUsername, email; discordId removed from User table; replaced by hasDiscordLinked bool | ✓ VERIFIED | `userPrivate.ts`: `public: false`, columns confirmed. `user.ts`: `hasDiscordLinked: t.bool()` present, no `discordId` column or `discord_id` index. |
| SC-2 | UserIdentity table is `public: false`; useAuth.ts reads from view_my_profile merged view via onApplied callback | ✓ VERIFIED | `userIdentity.ts` line 20: `public: false`. `useAuth.ts`: `SELECT * FROM view_my_profile` subscription with `.onApplied()` callback confirmed. |
| SC-3 | BanRecord private table supports Discord ID bans; server_link_provider rejects banned provider IDs at link-time; banned users soft-deleted on reconnect | ✓ VERIFIED | `banRecord.ts`: `public: false`. `server.ts`: `rejectIfBanned` called in `server_link_provider`. `index.ts`: `checkProviderBan` in `clientConnected`. `banAdmin.ts`: `admin_ban_user` soft-deletes user. WR-01 satisfied: `banType.tag` in-memory filter in `checkProviderBan`. |
| SC-4 | /api/auth/link-discord resolves identity server-side from SpacetimeDB token via ephemeral connection | ? HUMAN NEEDED | `route.ts` imports and calls `verifyIdentityFromToken(spacetimeToken)` before `serverLinkProvider`. `lib/spacetimedb-server.ts` exports `verifyIdentityFromToken` with 5s timeout + WR-02 onDisconnect fail-fast. Code is correct — requires human test to verify end-to-end behavior with live browser session. |
| SC-5 | SEC-05 (Google OAuth) descoped — no schema columns, implementation deferred | ✓ VERIFIED | `enums.ts` BanType has only `DiscordId` variant. `userPrivate.ts` has no Google fields. No `hasGoogleLinked` on User. `banRecord.ts` has no Google enum variant. |

**Score:** 4/5 truths verified (SC-4 requires human verification)

### Deferred Items

None.

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `spacetimedb/src/tables/userPrivate.ts` | UserPrivate private table definition | ✓ VERIFIED | `public: false`, userId PK, discordId/discordUsername/email optional, audit columns, btree index `user_private_discord_id` |
| `spacetimedb/src/tables/banRecord.ts` | BanRecord private table definition | ✓ VERIFIED | `public: false`, autoInc PK, banType enum, providerId, single-col `ban_record_provider_id` btree index |
| `spacetimedb/src/helpers/banHelper.ts` | Ban checking helper | ✓ VERIFIED | `checkProviderBan` uses `ban_record_provider_id` index + in-memory `banType.tag` filter (WR-01 compliant). `rejectIfBanned` wrapper present. |
| `spacetimedb/src/tables/user.ts` | User table with hasDiscordLinked, without discordId | ✓ VERIFIED | `hasDiscordLinked: t.bool()` present. No `discordId` column. No `discord_id` index. |
| `spacetimedb/src/tables/userIdentity.ts` | UserIdentity with public: false | ✓ VERIFIED | Line 20: `public: false` |
| `spacetimedb/src/reducers/server.ts` | server_link_provider reducer, no server_link_discord | ✓ VERIFIED | `server_link_provider` exported. `server_link_discord` absent (only in a JSDoc comment). `rejectIfBanned` called. `hasDiscordLinked: true` set on link. `getSystemUserId` removed. |
| `spacetimedb/src/reducers/banAdmin.ts` | Ban admin reducers | ✓ VERIFIED | `admin_ban_user` + `admin_unban_user` both present, both gated by `ensureAdmin(ctx)`. `BanRecord.insert` and `BanRecord.id.delete` present. |
| `spacetimedb/src/views/securityViews.ts` | Updated views with UserPrivate merge, admin view, projected user directory | ✓ VERIFIED | `MyProfileRow` merges User + UserPrivate. `view_my_profile` returns merged row. `view_admin_user_private` behind `isRoleAtLeast('Moderator')`. `UserDirectoryRow` with D-16 fields; deletes filtered via `!u.deletedAt`. |
| `app/api/auth/link-discord/route.ts` | API route with ephemeral identity verification | ✓ VERIFIED (code) / ? HUMAN (runtime) | Body expects `spacetimeToken`. Calls `verifyIdentityFromToken` before `serverLinkProvider`. No client-supplied hex trusted. |
| `lib/spacetimedb-server.ts` | verifyIdentityFromToken helper | ✓ VERIFIED | `verifyIdentityFromToken` exported. 5s timeout present. `onDisconnect` reject (WR-02) confirmed at line 90–91. |
| `components/features/auth/hooks/useAuth.ts` | useAuth using view_my_profile via onApplied | ✓ VERIFIED | `SELECT * FROM view_my_profile` subscription. `.onApplied()` callback. `hasDiscordLinked` read from profile. |
| `test/backend/auth/auth-security.test.ts` | Integration tests SEC-01, SEC-02, SEC-03; SEC-04 manual | ✓ VERIFIED | File exists. SEC-01, SEC-02, SEC-03 describe blocks present with assertions. SEC-04 explicitly documented as manual-only with a placeholder test. |
| `src/module_bindings/server_link_provider_reducer.ts` | Regenerated binding | ✓ VERIFIED | File present. |
| `src/module_bindings/admin_ban_user_reducer.ts` | Regenerated binding | ✓ VERIFIED | File present. Imported in `index.ts`. |
| `src/module_bindings/admin_unban_user_reducer.ts` | Regenerated binding | ✓ VERIFIED | File present. Imported in `index.ts`. |
| `src/module_bindings/user_table.ts` | Regenerated binding with hasDiscordLinked | ✓ VERIFIED | Line 28: `hasDiscordLinked: __t.bool()`. No `discordId` field. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `spacetimedb/src/helpers/banHelper.ts` | `spacetimedb/src/tables/banRecord.ts` | `ctx.db.BanRecord.ban_record_provider_id.filter()` | ✓ WIRED | Single-col index used (multi-col PANIC workaround documented) |
| `spacetimedb/src/helpers/userDeletionHelper.ts` | `spacetimedb/src/tables/userPrivate.ts` | `ctx.db.UserPrivate.userId.find/delete` | ✓ WIRED | Lines 47–49 in userDeletionHelper.ts |
| `spacetimedb/src/reducers/server.ts` | `spacetimedb/src/helpers/banHelper.ts` | `import rejectIfBanned` | ✓ WIRED | `rejectIfBanned` called at line 104 in `server_link_provider` |
| `spacetimedb/src/reducers/banAdmin.ts` | `spacetimedb/src/helpers/userDeletionHelper.ts` | soft-delete on ban (via `ctx.db.User.id.update` + `deletedAt`) | ✓ WIRED | `admin_ban_user` sets `deletedAt: ctx.timestamp` directly |
| `spacetimedb/src/views/securityViews.ts` | `spacetimedb/src/tables/userPrivate.ts` | `ctx.db.UserPrivate.userId.find()` | ✓ WIRED | Used in `view_my_profile` and `view_admin_user_private` |
| `app/api/auth/link-discord/route.ts` | `lib/spacetimedb-server.ts` | `getServerConnection, verifyIdentityFromToken` import | ✓ WIRED | Line 3 import confirmed. Both functions called. |
| `app/api/auth/link-discord/route.ts` | ephemeral DbConnection | `verifyIdentityFromToken(spacetimeToken)` | ✓ CODE WIRED / ? RUNTIME | Code wiring confirmed. End-to-end runtime requires human test. |
| `components/features/auth/hooks/useAuth.ts` | `view_my_profile` | SQL subscription with onApplied callback | ✓ WIRED | `SELECT * FROM view_my_profile` with `.onApplied()` confirmed. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `useAuth.ts` profile state | `profile` (from view_my_profile) | `spacetimedb.view()` merges `ctx.db.User` + `ctx.db.UserPrivate` | Yes — server-side view queries real tables | ✓ FLOWING |
| `securityViews.ts` view_user_directory | `UserDirectoryRow[]` | `ctx.db.User.iter()` filtered by `!u.deletedAt`, mapped to safe subset | Yes — live DB query | ✓ FLOWING |
| `securityViews.ts` view_admin_user_private | `UserPrivate.rowType[]` | `ctx.db.UserPrivate.iter()` behind role gate | Yes — live DB query | ✓ FLOWING |
| `banHelper.ts` checkProviderBan | `matches` array | `ctx.db.BanRecord.ban_record_provider_id.filter(providerId)` | Yes — live DB query + in-memory filter | ✓ FLOWING |

### Behavioral Spot-Checks

Step 7b: SKIPPED — Requires live SpacetimeDB maincloud connection. Cannot run module reducers locally. Integration tests (auth-security.test.ts) verify runtime behavior against maincloud; those are gated on `hasServerToken()`.

### Requirements Coverage

Note: SEC-01 through SEC-05 are phase-local security requirements defined in `12-RESEARCH.md`. They are NOT tracked in `REQUIREMENTS.md` (which covers only v0.5 backend milestone requirements SCHM through ARCH). This is expected — SEC requirements are phase-specific security hardening items that postdate the v0.5 requirements list.

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| SEC-01 | 12-01, 12-02, 12-03 | UserPrivate private table isolates sensitive auth data | ✓ SATISFIED | `userPrivate.ts` with `public: false`; discordId moved from User to UserPrivate; `hasDiscordLinked` bool on public User |
| SEC-02 | 12-03 | UserIdentity table made private; client migrates to view_my_identity | ✓ SATISFIED | `userIdentity.ts` line 20 `public: false`; `useAuth.ts` uses `view_my_profile` + `view_my_identity`; `user_identity_table.ts` binding deleted |
| SEC-03 | 12-01, 12-02, 12-03 | BanRecord private table; permanent Discord ID bans with 3-point enforcement | ✓ SATISFIED | `banRecord.ts` with `public: false`; `rejectIfBanned` in `server_link_provider`; `checkProviderBan` in `clientConnected`; `admin_ban_user` soft-deletes; integration tests assert ban rejection + soft-delete |
| SEC-04 | 12-03 | Identity resolution fix via ephemeral connection | ? HUMAN NEEDED | Code path verified (route.ts + lib/spacetimedb-server.ts). Runtime end-to-end requires live browser test (manual). |
| SEC-05 | 12-03 (descoped) | Google OAuth — descoped per CONTEXT.md | ✓ SATISFIED (descoped) | No Google columns in schema, no GoogleId BanType variant, no hasGoogleLinked. Correctly absent. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `test/backend/auth/auth-security.test.ts` | 229–231 | `it('SEC-04 is verified manually...')` contains a placeholder body with no assertions | ℹ️ Info | Not a blocker — intentional per plan. SEC-04 cannot be integration tested (requires live HTTP route). Documented explicitly in SUMMARY and PLAN. |

No blockers or warnings found. The SEC-04 placeholder test is an expected, documented design choice.

### Human Verification Required

### 1. SEC-04: Ephemeral Connection Identity Verification (End-to-End)

**Test:** In a running dev environment, initiate the Discord OAuth flow from the browser. After authenticating, the frontend calls `POST /api/auth/link-discord` with `{ spacetimeToken: '<client-token>' }` in the body. Verify:
1. The request body contains `spacetimeToken`, not `callerIdentityHex`
2. The server log shows an ephemeral DbConnection established and immediately disconnected
3. The link completes successfully (no 401/500 error)
4. After linking, `useAuth.ts` shows `hasDiscordLinked: true` in the user's profile

**Expected:** Discord link flow completes. Network tab shows `spacetimeToken` in the POST body. Server creates an ephemeral connection to verify the token, extracts the identity hex server-side, and calls `serverLinkProvider`. No client-supplied identity hex is trusted.

**Why human:** The ephemeral `DbConnection.builder().withToken(clientToken).onConnect(...)` pattern requires a real client browser token and a live SpacetimeDB maincloud connection. It cannot be driven by the integration test harness (which uses pre-authenticated server connections, not arbitrary client tokens). The code is correctly wired — this is purely a live-environment verification.

### Gaps Summary

No gaps found. All code artifacts are present, substantive, and correctly wired. The single pending item (SC-4) is a human verification requirement for live end-to-end behavior, not a code gap.

**Requirements note:** SEC-01 through SEC-05 are phase-local requirements not tracked in `REQUIREMENTS.md`. The REQUIREMENTS.md traceability table covers only v0.5 milestone requirements (SCHM through ARCH). SEC requirements should be added to REQUIREMENTS.md if the team wants long-term traceability — but this is informational only, not a blocker.

---

_Verified: 2026-04-08T10:00:00Z_
_Verifier: Claude (gsd-verifier)_
