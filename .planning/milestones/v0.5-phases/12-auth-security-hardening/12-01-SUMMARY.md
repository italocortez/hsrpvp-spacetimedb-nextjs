---
phase: 12-auth-security-hardening
plan: 01
subsystem: backend-auth
tags: [schema, security, private-tables, ban-system]
requirements: [SEC-01, SEC-03]

dependency_graph:
  requires: []
  provides:
    - UserPrivate private table (user_private, public:false)
    - BanRecord private table (ban_record, public:false)
    - BanType enum (DiscordId variant)
    - hasDiscordLinked bool on User (replaces discordId column)
    - checkProviderBan / rejectIfBanned helpers
    - UserPrivate cascade in performUserDeletion
  affects:
    - spacetimedb/src/tables/user.ts (schema change: discordId removed, hasDiscordLinked added)
    - spacetimedb/src/helpers/userDeletionHelper.ts (UserPrivate cascade added)
    - spacetimedb/src/reducers/auth.ts (hasDiscordLinked in guest insert)
    - spacetimedb/src/index.ts (new table imports)
    - spacetimedb/src/schema.ts (UserPrivate + BanRecord registered in module schema)

tech_stack:
  added:
    - UserPrivate table (SpacetimeDB, public:false)
    - BanRecord table (SpacetimeDB, public:false)
    - BanType enum (spacetimedb/server t.enum)
    - banHelper.ts (checkProviderBan, rejectIfBanned)
  patterns:
    - private table isolation (public:false) for sensitive auth data
    - single-column index + in-memory filter for ban type check (multi-col index PANIC workaround)
    - UserPrivate hard-delete in cascade, BanRecord preserved

key_files:
  created:
    - spacetimedb/src/tables/userPrivate.ts
    - spacetimedb/src/tables/banRecord.ts
    - spacetimedb/src/helpers/banHelper.ts
  modified:
    - spacetimedb/src/types/enums.ts (BanType enum added)
    - spacetimedb/src/tables/user.ts (discordId removed, hasDiscordLinked added, discord_id index removed)
    - spacetimedb/src/helpers/userDeletionHelper.ts (UserPrivate cascade, hasDiscordLinked in soft-delete)
    - spacetimedb/src/reducers/auth.ts (hasDiscordLinked in guest User insert)
    - spacetimedb/src/index.ts (userPrivate + banRecord table imports)
    - spacetimedb/src/schema.ts (UserPrivate + BanRecord registered in schema call)

decisions:
  - key: multi-column-index-workaround
    summary: "BanRecord uses single-column ban_record_provider_id index + in-memory banType.tag filter; multi-column index .filter() causes PANIC in SpacetimeDB TS SDK"
  - key: schema-registration-required
    summary: "UserPrivate and BanRecord added to schema.ts schema() call; index.ts imports alone insufficient for SpacetimeDB module registration"

metrics:
  duration: 420s
  completed_date: "2026-04-08T08:37:56Z"
  tasks_completed: 3
  files_created: 3
  files_modified: 6
---

# Phase 12 Plan 01: Auth Schema Foundation Summary

Schema foundation for auth security hardening: BanType enum, UserPrivate private table, BanRecord private table, User column migration (discordId removed, hasDiscordLinked added), ban check helper, and UserPrivate deletion cascade.

## Impact Audit (Task 0)

### Backend discordId references found

| File | Scope |
|------|-------|
| spacetimedb/src/tables/user.ts | Modified in this plan |
| spacetimedb/src/helpers/userDeletionHelper.ts | Modified in this plan |
| spacetimedb/src/reducers/auth.ts | Modified in this plan |
| spacetimedb/src/reducers/server.ts | Plan 02 scope |
| spacetimedb/src/views/securityViews.ts | Plan 02/03 scope |

### Frontend discordId references found

| File | Scope |
|------|-------|
| app/(landing-page)/teambuilder/page.tsx | Plan 03 (comment only) |
| app/api/auth/link-discord/route.ts | Plan 03 |
| components/features/admin-view/components/UserManager.tsx | Plan 03 |
| components/features/auth/hooks/useAuth.ts | Plan 03 |
| components/features/auth/types.ts | Plan 03 |
| components/features/profile/components/DiscordLink.tsx | Plan 03 |

### Auto-generated bindings

Regenerated after Plan 02 publish: src/module_bindings/index.ts, server_link_discord_reducer.ts, types.ts, user_table.ts.

### Test references

test/shared/connection.ts: serverLinkDiscord call with discordId param — Plan 03 scope.

### UserIdentity references

UserIdentity remains public:true as designed. Plan 01 does not modify UserIdentity visibility.

## Tasks Completed

### Task 0: Impact Audit (read-only, no commit)

Grep across all 5 areas completed. All files cataloged for Plan 02 and Plan 03 executors. One additional file not in RESEARCH.md: components/features/admin-view/components/UserManager.tsx (active discordId display, Plan 03 scope).

### Task 1: Schema Changes

Commit: f9d7734

- BanType enum added to enums.ts (DiscordId variant)
- UserPrivate table created: public:false, userId PK, discordId/discordUsername/email optional, user_private_discord_id btree index, audit columns
- BanRecord table created: public:false, autoInc PK, BanType+providerId, ban_record_provider_id btree index, audit columns
- User table: discordId column removed, discord_id index removed, hasDiscordLinked: t.bool() added after role

### Task 2: Ban Helper, Deletion Cascade, Auth Reducer, Schema Registration

Commit: f3cd1ae

- banHelper.ts: checkProviderBan (WR-01: banType.tag in-memory filter after provider_id index lookup) + rejectIfBanned
- userDeletionHelper.ts: UserPrivate hard-delete before calendar cascade; soft-delete sets hasDiscordLinked: false
- auth.ts: login_as_guest insert uses hasDiscordLinked: false
- index.ts: import './tables/userPrivate' and import './tables/banRecord' added
- schema.ts: UserPrivate and BanRecord imported and registered in schema({...}) call

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Multi-column index replaced with single-column + manual filter**
- Found during: Task 2 (banHelper.ts creation)
- Issue: Plan specified by_type_and_provider composite index and .filter([banType, providerId]). Multi-column index .filter() causes PANIC in the SpacetimeDB TS SDK.
- Fix: BanRecord uses single-column ban_record_provider_id index. checkProviderBan filters by provderId via index, then checks banType.tag in-memory. WR-01 still satisfied.
- Files: spacetimedb/src/tables/banRecord.ts, spacetimedb/src/helpers/banHelper.ts
- Commit: f9d7734, f3cd1ae

**2. [Rule 2 - Missing critical functionality] UserPrivate and BanRecord added to schema.ts**
- Found during: Task 2 (schema registration)
- Issue: Plan specified index.ts imports only. In this project, tables must be in schema.ts schema({...}) call to be registered in the SpacetimeDB module. Side-effect imports alone do not register tables.
- Fix: UserPrivate and BanRecord added to schema.ts imports and schema() call.
- Files: spacetimedb/src/schema.ts
- Commit: f3cd1ae

## Known Stubs

None. All changes are structural schema definitions with no stub data or placeholder values.

## Threat Surface Scan

All new surface was already in the plan threat model:
- UserPrivate (T-12-01): public:false confirmed
- BanRecord (T-12-02): public:false confirmed
- checkProviderBan (T-12-03): banType.tag filter present (WR-01 satisfied)
- User.discordId removal (T-12-04): column removed, only hasDiscordLinked bool remains
- Deletion cascade (T-12-05): UserPrivate hard-deleted, BanRecord preserved

## Self-Check: PASSED

All files confirmed present and commits verified:
- FOUND: spacetimedb/src/tables/userPrivate.ts
- FOUND: spacetimedb/src/tables/banRecord.ts
- FOUND: spacetimedb/src/helpers/banHelper.ts
- FOUND: spacetimedb/src/types/enums.ts
- FOUND: spacetimedb/src/tables/user.ts
- FOUND: spacetimedb/src/helpers/userDeletionHelper.ts
- FOUND: spacetimedb/src/reducers/auth.ts
- FOUND: spacetimedb/src/index.ts
- FOUND: spacetimedb/src/schema.ts
- FOUND: f9d7734 feat(12-01): add BanType enum, UserPrivate+BanRecord tables, migrate User schema
- FOUND: f3cd1ae feat(12-01): ban helper, deletion cascade, auth reducer, schema registration
