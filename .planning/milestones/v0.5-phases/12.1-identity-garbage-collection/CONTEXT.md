# Phase 12.1 Context: Identity Garbage Collection

## Phase Goal

Add scheduled and admin-triggered garbage collection for stale UserIdentity rows (device-to-user mappings), with shared GcResult audit infrastructure usable by all GC types.

## Key Decisions

### TTL Policy — 90 days (not 30)
NOTES.md initially proposed matching NextAuth's 30-day session expiry. Final decision: **90-day TTL** for identity rows. Rationale: SpacetimeDB tokens in localStorage never expire, so a user could return after weeks without re-authenticating. 90 days provides a generous buffer while still cleaning up truly abandoned device mappings.

### GC Guards (priority order)
1. **D-06: Skip guests** — Guest identities are transient by design; GC should not touch them (guest cleanup is handled by user deletion on logout)
2. **D-08: Skip online users** — Never delete an identity for a currently connected user
3. **D-07: Preserve newest** — Even if ALL identities for a user are past TTL, keep the most recent one (sorted by lastSeenAt desc). This prevents locking a user out if they haven't connected in 90+ days but their account still exists
4. **D-11: TTL on rest** — Delete remaining identities past 90-day threshold
5. **D-12: Orphan immediate delete** — Identity rows with no matching User row are deleted immediately regardless of age

### Admin vs Scheduled GC behavior
- **Scheduled (`run_identity_gc`):** Only writes GcResult when `itemsDeleted > 0` — avoids cluttering audit table with weekly no-op rows
- **Admin (`admin_gc_identities`, `admin_gc_lobbies`):** Always writes GcResult — admins need confirmation their trigger ran even when nothing was cleaned

### GcResult as shared audit table
Single `gc_result` table with `gcType` discriminator string ('identity', 'lobby') instead of separate audit tables per GC type. Extensible for future GC types without schema changes.

### lastSeenAt bump location
Added to `clientConnected` lifecycle hook (not login reducer). Rationale: `clientConnected` fires on every WebSocket connection, including reconnects. Login only fires on explicit user action. This makes the 90-day TTL accurate from the first publish.

## Phase History

| Decision | Source |
|---|---|
| 90-day TTL for identity GC | Phase 12.1 discussion (overrode 30-day in NOTES.md) |
| GC guard priority order (D-06 → D-12) | Phase 12.1 PLAN.md |
| Shared GcResult with gcType discriminator | Phase 12.1 PLAN.md |
| Admin GC always writes audit, scheduled only on delete | Phase 12.1 execution |
| Mutable binding pattern for IdentityGcJob | Inherited from LobbyGcJob (Phase 09) |
| server_set_datetime + server_set_online test utilities | Phase 12.1 UAT/testing (post-execution) |

## Integration Points

- **Phase 12 (auth hardening):** Depends on UserIdentity table, ensureModerator, auditInsert
- **Phase 09 (lobby lifecycle):** LobbyGcJob mutable binding pattern reused for IdentityGcJob
- **post-publish.ts:** Step 6/6 seeds the identity GC scheduled chain on fresh publishes

---
*Reconstructed from NOTES.md, SUMMARYs, and UAT session (2026-04-08)*
