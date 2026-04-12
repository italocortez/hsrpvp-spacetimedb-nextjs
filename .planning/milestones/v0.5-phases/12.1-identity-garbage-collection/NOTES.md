# Phase 12.1 Notes

## Cookie/Session Expiry Context

- **NextAuth session cookie** (`next-auth.session-token`): 30-day default maxAge, 24-hour rolling updateAge. Cookie refreshes on each visit — only expires after 30 days of inactivity.
- **`stdb_session` cookie** (display name): 30-day max-age, reset on every login/profile resolution.
- **SpacetimeDB token**: localStorage, never expires unless explicitly cleared (logout or delete account).

## Cleanup Policy

Match UserIdentity garbage collection to the NextAuth 30-day inactivity window:
- Any `UserIdentity.lastSeenAt` older than 30 days = that browser session is dead
- Token was either cleared on logout, or NextAuth session expired naturally
- Safe to delete the UserIdentity row

## Implementation Notes

- Reducer should be server-only (scheduled or manual trigger)
- Don't delete identities for the SYSTEM user
- Consider: should cleanup also handle identities where logout was called? (`logout` clears client-side state but doesn't notify server)
