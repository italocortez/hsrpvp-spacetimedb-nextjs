---
phase: 12-auth-security-hardening
plan: 02
subsystem: backend-auth
tags: [reducers, ban-system, views, security, provider-linking]
requirements: [SEC-01, SEC-03]

dependency_graph:
  requires:
    - UserPrivate private table (from Plan 01)
    - BanRecord private table (from Plan 01)
    - BanType enum (from Plan 01)
    - checkProviderBan / rejectIfBanned helpers (from Plan 01)
    - hasDiscordLinked bool on User (from Plan 01)
  provides:
    - server_link_provider reducer (replaces server_link_discord)
    - admin_ban_user / admin_unban_user reducers
    - clientConnected ban check (D-08 enforcement point 2)
    - view_my_profile merged User + UserPrivate
    - view_admin_user_private (Moderator+ gate)
    - view_user_directory projected to UserDirectoryRow (D-16 safe subset)
  affects:
    - spacetimedb/src/reducers/server.ts (full rewrite: server_link_provider, register_server fix, getSystemUserId removal)
    - spacetimedb/src/reducers/banAdmin.ts (new file)
    - spacetimedb/src/views/securityViews.ts (views 4 and 5 replaced)
    - spacetimedb/src/index.ts (exports + clientConnected + import)
    - spacetimedb/src/tables/serverIdentity.ts (comment update only)

tech_stack:
  added:
    - banAdmin.ts (admin_ban_user, admin_unban_user reducers)
  patterns:
    - unified provider linking (server_link_provider replaces server_link_discord)
    - D-08 three-point ban enforcement: link-time (rejectIfBanned), reconnect (clientConnected), ban-time (soft-delete)
    - view projection to safe subset (UserDirectoryRow excludes audit cols, auth IDs, sensitive timestamps)
    - merged view pattern (view_my_profile merges User + UserPrivate in single return)
    - role-gated view (view_admin_user_private returns empty array for non-Moderators)
    - single-col index + in-memory banType filter (Plan 01 multi-col PANIC workaround, reused in banAdmin.ts)

key_files:
  created:
    - spacetimedb/src/reducers/banAdmin.ts
  modified:
    - spacetimedb/src/reducers/server.ts
    - spacetimedb/src/views/securityViews.ts
    - spacetimedb/src/index.ts
    - spacetimedb/src/tables/serverIdentity.ts

decisions:
  - key: user_private_discord_id-accessor
    summary: "UserPrivate discord index accessor is user_private_discord_id (not discord_id); plan pseudocode used wrong name — corrected to match Plan 01 actual table definition"
  - key: ban-duplicate-check-workaround
    summary: "admin_ban_user duplicate check uses single-col ban_record_provider_id + in-memory banType.tag filter instead of multi-col filter (reuses Plan 01 PANIC workaround)"
  - key: server-link-discord-comment
    summary: "server_link_discord retained only in JSDoc migration comment in server.ts (explains what was replaced); serverIdentity.ts stale comment updated to server_link_provider"

metrics:
  duration: 720s
  completed_date: "2026-04-08"
  tasks_completed: 2
  files_created: 1
  files_modified: 4
---

# Phase 12 Plan 02: Auth Reducer and View Layer Summary

Reducer and view layer for auth security hardening: unified server_link_provider (replacing server_link_discord), ban admin reducers with three-point D-08 enforcement, register_server fix, clientConnected ban check, merged view_my_profile, admin user private view, and view_user_directory projection to D-16 safe subset via UserDirectoryRow.

## Tasks Completed

### Task 1: Rewrite server.ts

Commit: e734d35

- Removed `getSystemUserId()` function entirely; replaced all calls with `SYSTEM_USER_ID` constant
- Fixed `register_server`: `discordId: '1'` removed, `hasDiscordLinked: false` added
- Replaced `server_link_discord` with `server_link_provider` (unified provider linking, extensible to future providers)
- `server_link_provider` handles 3 cases: upgrade guest (1a/1c), cross-device login redirect (1b), identity-not-registered error
- D-08 enforcement point 1: `rejectIfBanned` called at link-time before any user mutation
- UserPrivate upsert on successful link: `discordId`, `discordUsername` stored in private table
- `hasDiscordLinked: true` set on User table when provider is linked

### Task 2: Ban admin reducers, clientConnected ban check, updated views

Commit: 41f1881

- Created `banAdmin.ts`: `admin_ban_user` + `admin_unban_user` (both guarded by `ensureAdmin`)
- `admin_ban_user` creates BanRecord and soft-deletes affected user (D-08 enforcement point 3)
- `admin_unban_user` hard-deletes BanRecord by id (permanent ban model, D-07)
- Added `checkProviderBan` import and ban check in `clientConnected` (D-08 enforcement point 2)
- `view_my_profile`: replaced `User.rowType` return with `MyProfileRow` that merges User + UserPrivate fields
- `view_admin_user_private`: new view returning all UserPrivate rows only for `isRoleAtLeast('Moderator')` callers
- `view_user_directory`: replaced `ctx.from.User` with projected `UserDirectoryRow` — excludes audit columns, deletedAt, lastLoginAt, isPrivate, auth IDs; also filters soft-deleted users
- index.ts exports updated: `server_link_provider` (not `server_link_discord`), added `admin_ban_user` + `admin_unban_user`

### Deviation fix (auto-fixed, Rule 1)

Commit: 64036d0

- Fixed stale comment in `serverIdentity.ts` referencing `server_link_discord` → `server_link_provider`

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] UserPrivate discord index accessor name corrected**
- Found during: Task 1 (server_link_provider upsert logic)
- Issue: Plan pseudocode used `ctx.db.UserPrivate.discord_id.filter(providerId)`. Actual accessor from Plan 01 table definition is `user_private_discord_id` (table-prefixed, per project index naming convention)
- Fix: Used correct accessor `user_private_discord_id` in server.ts and banAdmin.ts
- Files: spacetimedb/src/reducers/server.ts, spacetimedb/src/reducers/banAdmin.ts
- Commit: e734d35, 41f1881

**2. [Rule 1 - Bug] admin_ban_user duplicate check uses PANIC-safe pattern**
- Found during: Task 2 (banAdmin.ts creation)
- Issue: Plan pseudocode used `ctx.db.BanRecord.by_type_and_provider.filter([banType, providerId])`. Multi-column index .filter() causes PANIC (Plan 01 documented this). BanRecord only has single-column `ban_record_provider_id` index.
- Fix: Single-col index lookup + in-memory `.filter((r) => r.banType.tag === banTypeTag)` — same pattern as checkProviderBan helper in Plan 01
- Files: spacetimedb/src/reducers/banAdmin.ts
- Commit: 41f1881

**3. [Rule 1 - Bug] serverIdentity.ts stale comment updated**
- Found during: post-task verification (grep for server_link_discord references)
- Issue: serverIdentity.ts JSDoc still referenced `server_link_discord`
- Fix: Updated comment to `server_link_provider`
- Files: spacetimedb/src/tables/serverIdentity.ts
- Commit: 64036d0

## Known Stubs

None. All views return real data from the database. No hardcoded empty values or placeholder text.

## Threat Surface Scan

All security-relevant surface was covered by the plan threat model:
- T-12-06: `requireServer(ctx)` present in server_link_provider (Spoofing, mitigated)
- T-12-07: `ensureAdmin(ctx)` present in admin_ban_user (EoP, mitigated)
- T-12-08: `isRoleAtLeast(user.role, 'Moderator')` present in view_admin_user_private (Info Disclosure, mitigated)
- T-12-09: soft-delete on banned user reconnect in clientConnected (Tampering, mitigated)
- T-12-10: `bannedByUserId: admin.id` + audit columns in BanRecord insert (Repudiation, mitigated)
- T-12-11: view_my_profile scoped to ctx.sender only (Info Disclosure, accepted)
- T-12-17: UserDirectoryRow projection excludes audit cols, deletedAt, lastLoginAt, isPrivate (Info Disclosure, mitigated)

## Self-Check: PASSED

Files confirmed present:
- FOUND: spacetimedb/src/reducers/server.ts
- FOUND: spacetimedb/src/reducers/banAdmin.ts
- FOUND: spacetimedb/src/views/securityViews.ts
- FOUND: spacetimedb/src/index.ts
- FOUND: spacetimedb/src/tables/serverIdentity.ts

Commits confirmed:
- FOUND: e734d35 feat(12-02): rewrite server.ts
- FOUND: 41f1881 feat(12-02): ban admin reducers, clientConnected ban check, updated views
- FOUND: 64036d0 fix(12-02): update serverIdentity comment
