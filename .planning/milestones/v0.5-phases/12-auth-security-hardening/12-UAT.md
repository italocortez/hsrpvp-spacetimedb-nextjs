---
status: complete
phase: 12-auth-security-hardening
source: [12-01-SUMMARY.md, 12-02-SUMMARY.md, 12-03-SUMMARY.md]
started: 2026-04-08T11:10:00Z
updated: 2026-04-08T16:45:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Module published, register_server bootstraps SYSTEM user. No errors in logs.
result: pass

### 2. UserPrivate table exists and is private
expected: Table with correct columns, public:false, not in client subscriptions.
result: pass

### 3. BanRecord table exists and is private
expected: Table with correct columns including ban_type, provider_id, reason. Private.
result: pass

### 4. User table has hasDiscordLinked, no discordId
expected: has_discord_linked column present, discord_id absent.
result: pass

### 5. server_link_provider reducer exists
expected: server_link_provider in bindings, server_link_discord removed.
result: pass

### 6. Ban admin reducers exist
expected: admin_ban_user and admin_unban_user in bindings.
result: pass

### 7. Identity PK lookup works (WR-02 fix)
expected: Identity.fromString + PK find resolves user. Invalid hex returns SenderError not panic.
result: pass

### 8. Ban length validation (WR-03 fix)
expected: providerId > 32 and reason > 500 rejected. Boundary values accepted.
result: pass

### 9. Guest login flow works
expected: Login modal appears, guest login creates user, F5 persists session, no flash.
result: pass

### 10. Ephemeral connection identity verification (SEC-04)
expected: Discord OAuth → API route verifies identity via ephemeral connection → hasDiscordLinked = true. All auth paths work: guest→link, direct Discord, logout→re-login (merge), cross-browser (merge).
result: pass

## Summary

total: 10
passed: 10
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none]
