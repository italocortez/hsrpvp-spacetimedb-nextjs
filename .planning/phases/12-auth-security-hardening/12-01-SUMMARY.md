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
    - spacetimedb/src/index.ts (new table registrations)

tech_stack:
  added:
    - UserPrivate table (SpacetimeDB, public:false)
    - BanRecord table (SpacetimeDB, public:false)
    - BanType enum (spacetimedb/server t.enum)
    - banHelper.ts (checkProviderBan, rejectIfBanned)
  patterns:
    - private table isolation (public:false) for sensitive auth data
    - single-column index + manual filter for ban type check (multi-col index workaround)
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

decisions:
  - key: multi-column-index-workaround
    summary: "BanRecord uses single-column provider_id index + in-memory banType filter — multi-column filter causes PANIC in SpacetimeDB TS SDK"
  - key: no-commit-code-files
    summary: "CLAUDE.md prohibits committing code files without user review — changes left unstaged per project rules"

metrics:
  duration: 261s
  completed_date: "2026-04-08T08:28:10Z"
  tasks_completed: 3
  files_created: 3
  files_modified: 5
---

# Phase 12 Plan 01: Auth Schema Foundation Summary

Schema foundation for auth security hardening: BanType enum, UserPrivate private table, BanRecord private table, User column migration (discordId removed, hasDiscordLinked added), ban check helper, and UserPrivate deletion cascade.

## Impact Audit (Task 0 — D-18)

### Backend discordId references found

| File | References |
|------|-----------|
| `spacetimedb/src/tables/user.ts` | `discordId` column, `discord_id` index — **modified in this plan** |
| `spacetimedb/src/helpers/userDeletionHelper.ts` | `discordId: undefined` in soft-delete — **modified in this plan** |
| `spacetimedb/src/reducers/auth.ts` | `discordId: undefined` in guest insert — **modified in this plan** |
| `spacetimedb/src/reducers/server.ts` | `discordId`, `discord_id` index, SYSTEM sentinel — **Plan 02 scope** |
| `spacetimedb/src/views/securityViews.ts` | Comment referencing discordId — **Plan 02/03 scope** |

### Frontend discordId references found

| File | Reference | Scope |
|------|-----------|-------|
| `app/(landing-page)/teambuilder/page.tsx` | Comment `user?.discordId !== null` (commented-out code) | Plan 03 |
| `app/api/auth/link-discord/route.ts` | `discordId` from Discord OAuth response passed to `server_link_discord` | Plan 03 |

### Auto-generated bindings

| File | Reference | Action |
|------|-----------|--------|
| `src/module_bindings/index.ts` | `discord_id` index, `discordId` field | Regenerated after Plan 02 publish |
| `src/module_bindings/server_link_discord_reducer.ts` | `discordId` param | Regenerated after Plan 02 |
| `src/module_bindings/types.ts` | `discordId` on UserType | Regenerated after Plan 02 |
| `src/module_bindings/user_table.ts` | `discordId` field | Regenerated after Plan 02 |

### Test references

| File | Reference | Scope |
|------|-----------|-------|
| `test/shared/connection.ts` | `server_link_discord` call with `discordId` param | Plan 03 (test update) |

### UserIdentity references

`UserIdentity` table is used extensively across backend and frontend (20+ files). Plan 01 does NOT modify UserIdentity visibility — it remains `public: true` as designed. This is correct: UserIdentity is the public identity mapping; UserPrivate is the new private sensitive-data table.

### Comparison with RESEARCH.md audit

All RESEARCH.md audit files confirmed. Additional file found NOT in RESEARCH.md:
- `app/(landing-page)/teambuilder/page.tsx` — commented-out `discordId` reference (no functional impact, low priority)

## Tasks Completed

### Task 0: Impact Audit

Completed grep across all 5 areas (backend, frontend, UserIdentity, tests, auto-generated). Results logged above. All references cataloged for Plan 02 and Plan 03 executors.

### Task 1: Schema — BanType, UserPrivate, BanRecord, User Migration

- **BanType enum** added to `enums.ts` with single `DiscordId` variant
- **UserPrivate table** created with `public: false`, userId PK (1:1 with User), discordId/discordUsername/email optional columns, `discord_id` btree index, audit columns
- **BanRecord table** created with `public: false`, autoInc PK, BanType column, providerId string, reason, bannedByUserId, `provider_id` btree index, audit columns
- **User table** migrated: `discordId` column removed, `discord_id` index removed, `hasDiscordLinked: t.bool()` added after `role`

### Task 2: Ban Helper, Deletion Cascade, Auth Reducer, Index Exports

- **banHelper.ts** created with `checkProviderBan` (WR-01 compliant: filters by banType.tag after provider_id index lookup) and `rejectIfBanned` convenience wrapper
- **userDeletionHelper.ts** updated: UserPrivate hard-delete added before calendar cascade; soft-delete now sets `hasDiscordLinked: false` (no `discordId: undefined`)
- **auth.ts** updated: `login_as_guest` insert now uses `hasDiscordLinked: false` instead of `discordId: undefined`
- **index.ts** updated: `import './tables/userPrivate'` and `import './tables/banRecord'` added for schema registration

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Multi-column index replaced with single-column + manual filter**
- **Found during:** Task 2 (banHelper.ts creation)
- **Issue:** Plan specified `by_type_and_provider` composite index and `.filter([banType, providerId])`. CLAUDE.md documents that multi-column index `.filter()` causes PANIC in the SpacetimeDB TypeScript SDK.
- **Fix:** BanRecord table uses only a single-column `provider_id` index. `checkProviderBan` uses `provider_id.filter(providerId)` then `.some(r => r.banType.tag === banType.tag)` for in-memory type filtering. Still WR-01 compliant.
- **Files modified:** `spacetimedb/src/tables/banRecord.ts`, `spacetimedb/src/helpers/banHelper.ts`
- **Commit:** N/A (see CLAUDE.md constraint below)

### CLAUDE.md-Driven Adjustments

**Code commit suppressed per CLAUDE.md rule**
- CLAUDE.md states: "code files (spacetimedb/, src/, app/, components/) must NEVER be committed without user review"
- All code file changes are left **unstaged** for user review in VS Code
- Only the SUMMARY.md (planning/docs file) is committed per GSD workflow rules
- This applies to all 8 modified/created code files in this plan

## Known Stubs

None. All changes are structural schema definitions with no stub data or placeholder values.

## Threat Surface Scan

All new surface was already in the plan's threat model:
- `UserPrivate` (T-12-01): `public: false` confirmed
- `BanRecord` (T-12-02): `public: false` confirmed
- `checkProviderBan` (T-12-03): banType.tag filter present (WR-01 satisfied)
- `User.discordId` removal (T-12-04): column removed, only `hasDiscordLinked` bool remains
- Deletion cascade (T-12-05): UserPrivate hard-deleted, BanRecord preserved

No new security surface introduced beyond what was planned.

## Self-Check: PASSED

All created/modified files confirmed present:
- FOUND: spacetimedb/src/tables/userPrivate.ts
- FOUND: spacetimedb/src/tables/banRecord.ts
- FOUND: spacetimedb/src/helpers/banHelper.ts
- FOUND: spacetimedb/src/types/enums.ts (BanType added)
- FOUND: spacetimedb/src/tables/user.ts (hasDiscordLinked, no discordId)
- FOUND: spacetimedb/src/helpers/userDeletionHelper.ts (UserPrivate cascade)
- FOUND: spacetimedb/src/reducers/auth.ts (hasDiscordLinked in insert)
- FOUND: spacetimedb/src/index.ts (userPrivate + banRecord imports)
- FOUND: .planning/phases/12-auth-security-hardening/12-01-SUMMARY.md

Key acceptance criteria verified:
- UserPrivate: public:false = 1, exports UserPrivate + userPrivateColumns
- BanRecord: public:false = 1, exports BanRecord + banRecordColumns
- User: hasDiscordLinked = 1, discordId = 0
- enums.ts: BanType enum present
- banHelper.ts: checkProviderBan + rejectIfBanned exported, uses provider_id.filter (not broken composite)
- userDeletionHelper.ts: UserPrivate.userId.find + UserPrivate.userId.delete present; hasDiscordLinked: false in soft-delete; no discordId: undefined
- auth.ts: hasDiscordLinked: false in insert; no discordId: undefined
- index.ts: both table imports present

Note: No commits recorded for code files — CLAUDE.md prohibits committing code without user review. SUMMARY.md committed as planning/docs file per GSD workflow.
