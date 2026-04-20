# Phase 12: Auth Security Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-07
**Phase:** 12-auth-security-hardening
**Areas discussed:** UserAuth table design, Ban system design, Identity resolution fix, Google OAuth integration, UserIdentity privacy migration, view_user_directory update, Test strategy, Existing server_link_discord migration

---

## UserAuth Table Design

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal: auth IDs only | discordId, googleId, discordUsername — just OAuth identifiers | |
| Auth + email now | Include email + emailVerified immediately | |
| Full provider model (normalized) | One row per provider (userId + provider composite PK) | Initial pick |
| Flat UserPrivate table | Single table with userId PK, optional columns per provider | ✓ (revised) |

**User's choice:** Started with full provider model, then revised to flat table after discussing future scope. User expects only Discord + Google + possibly Google Calendar token. Normalized model is overengineered for 2-3 providers.

**Follow-up decisions:**
- **Email field:** Schema only, populate later. No emailVerified needed — verification = having a linked provider.
- **Deletion:** Hard-delete UserPrivate. Ban records retain provider IDs independently.
- **Views:** Merged view_my_profile (User + UserPrivate). Admin view for lookups (role-gated server-side).
- **Public flags:** hasDiscordLinked + hasGoogleLinked booleans on User table.

---

## Ban System Design

| Option | Description | Selected |
|--------|-------------|----------|
| Discord ID ban | Block specific Discord accounts at link time | ✓ |
| Google ID ban | Block specific Google accounts at link time | ✓ |
| User-level ban | Ban userId directly, block all reducer calls | |
| IP-based ban | Track IPs server-side (not feasible in SpacetimeDB) | |

**Ban types selected:** Discord ID and Google ID bans.

| Option | Description | Selected |
|--------|-------------|----------|
| Expiry support | expiresAt timestamp, null = permanent | |
| Permanent only | All bans permanent, manual lift by deletion | ✓ |

| Option | Description | Selected |
|--------|-------------|----------|
| Link-time only | Check bans at provider linking | |
| Link-time + login check | Also check on reconnect | |
| Link-time + login + active enforcement | Custom: link + login + soft-delete for active logout | ✓ |

**User's choice:** Link-time + login check + active enforcement via soft-delete → auto-logout. Full metadata (reason, bannedByUserId, audit columns).

---

## Identity Resolution Fix

| Option | Description | Selected |
|--------|-------------|----------|
| Token-based lookup | Client sends SpacetimeDB token, API verifies identity | ✓ |
| Server resolves from session | No client data, server resolves by timing/context | |
| Eliminate hex entirely | Pass userId directly (verification problem) | |

| Option | Description | Selected |
|--------|-------------|----------|
| Ephemeral connection | Short-lived DbConnection with client token, extract identity from onConnect | ✓ |
| SDK token decode | Parse token format server-side (fragile) | |
| New server reducer | Verify via reducer (can't return data) | |

**User's choice:** Ephemeral connection for server-verified identity extraction. Best practice — lets SpacetimeDB verify the token cryptographically.

---

## Google OAuth Integration

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-provider | Both Discord + Google linked to same account | Initial pick |
| Unified NextAuth flow | Same pattern for both providers | Initial pick |
| No auto-merge, manual link | Separate accounts unless explicitly linked | Initial pick |
| Unified server_link_provider | Single reducer for all providers | Initial pick |
| Server identity via API route | Same trusted pattern for adding providers | Initial pick |

**User's revision:** Entire Google OAuth scope removed from Phase 12. User concerned about auth library lock-in with NextAuth and prefers to evaluate BetterAuth before adding more providers. Schema retains googleId/email columns (schema-only, not populated) for future-proofing.

**Key insight from discussion:** SpacetimeDB schema is auth-library-agnostic. Switching from NextAuth to BetterAuth later would only change API routes and client hooks — no SpacetimeDB table/reducer changes needed.

---

## UserIdentity Privacy Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Switch to view_my_identity | useAuth subscribes to view instead of table | ✓ |
| Keep UserIdentity public | Don't make it private, focus on UserPrivate | |

| Option | Description | Selected |
|--------|-------------|----------|
| Views always can read private tables | Server-side execution grants access | |
| Need to verify this | Flag for research phase confirmation | ✓ |

**User's choice:** Switch to view_my_identity. Flag private table access from views for research verification.

---

## view_user_directory Update

| Option | Description | Selected |
|--------|-------------|----------|
| Public profile + provider badges | User fields + hasDiscordLinked/hasGoogleLinked | ✓ |
| Strip to minimal | Only id, username, displayName, isOnline | |
| Keep as-is minus discordId | Same fields without discordId | |

---

## Test Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Integration tests via test harness | Live module testing, matches project pattern | ✓ |
| Defer tests to /gsd-add-tests | Skip test planning during discuss | |
| Unit tests for reducers | Mocked ctx, faster but limited | |

---

## Existing server_link_discord Migration

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve all cases, generalize | Same 4-case logic parameterized by provider + ban check | ✓ |
| Simplify to 2 cases | Collapse logic, risk missing edge cases | |
| You decide | Claude discretion on structure | |

---

## Claude's Discretion

- Internal helper structure for ban checking
- UserPrivate index strategy
- Exact error messages for ban rejection
- Ephemeral connection timeout and cleanup logic

## Deferred Ideas

- Google OAuth provider — removed from Phase 12 scope, future phase
- BetterAuth migration evaluation — future phase
- Email population from OAuth scopes — deferred
- Ban expiry (temporary bans) — deferred
- IP-based bans — not feasible in current architecture
- Google Calendar integration — future feature
