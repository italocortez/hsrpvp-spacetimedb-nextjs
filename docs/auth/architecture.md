# Auth & Users -- Architecture

Last updated: 2026-04-09

## Overview

Authentication is built on SpacetimeDB identities with optional Discord OAuth linking. Every client gets a SpacetimeDB identity on first connection. `login_as_guest` creates a User row and UserIdentity mapping. The Next.js server calls `server_link_provider` to upgrade guests to verified accounts after Discord OAuth completes. Private auth data (discordId, email) lives in `UserPrivate` which is never exposed to client subscriptions directly -- clients use the `view_my_profile` view instead.

Ban enforcement runs at three points: at link-time, at reconnect, and when a ban is created.

## Table Relationships

```
User (id: u32 autoInc PK)  [public: true]
  +-- username: string (unique)
  +-- displayName: string
  +-- isGuest: bool
  +-- isOnline: bool
  +-- lastLoginAt: Timestamp
  +-- role: Role (User | TournamentHost | Moderator | Admin)
  +-- hasDiscordLinked: bool
  +-- avatarCharacterName: string -> HsrCharacter.name
  +-- displayedAchievementId: u32? -> Achievement.id
  +-- deletedAt: Timestamp? (transient pending-deletion flag — at most ~1 row set during 5s cascade window)
  +-- audit columns

DeletedUser (id: u32 PK)  [PRIVATE -- public: false]
  +-- id: u32 (same as was User.id — preserves FK semantics for history tables)
  +-- displayName: string (preserved from User.displayName at eviction time)
  +-- isGuest: bool
  +-- deletedAt: Timestamp
  No audit columns (write-once archive; no update path).
  No btree indexes (resolveUserLabel uses PK lookup only).
  Writer: performUserDeletion non-guest-with-history branch only.
  Reader: resolveUserLabel helper (see §resolveUserLabel below).

UserIdentity (identity: Identity PK)  [PRIVATE -- public: false]
  +-- identity -> SpacetimeDB sender identity (hex)
  +-- userId -> User.id
  +-- lastSeenAt: Timestamp
  Indexes: identity (PK), user_id (btree, userId)

UserPrivate (userId: u32 PK)  [PRIVATE -- public: false]
  +-- userId -> User.id (1:1)
  +-- discordId: string?
  +-- discordUsername: string?
  +-- email: string?
  +-- audit columns
  Indexes: user_private_discord_id (btree, discordId)

BanRecord (id: u32 autoInc PK)  [PRIVATE -- public: false]
  +-- banType: BanType (DiscordId)
  +-- providerId: string (Discord snowflake)
  +-- reason: string
  +-- bannedByUserId -> User.id
  +-- audit columns
  Indexes: ban_record_provider_id (btree, providerId)
```

## Reducer Flows

### login_as_guest()
1. Check `UserIdentity.identity.find(ctx.sender)` for existing mapping
2. If found: update `User.lastLoginAt`, `User.isOnline=true`, `UserIdentity.lastSeenAt` -- return
3. If not found: generate `guestUsername = "Guest_{identity_hex8}"`
4. Insert `User` row (isGuest=true, isOnline=true, role=User, avatarCharacterName='march7th')
5. Insert `UserIdentity` row linking `ctx.sender -> newUser.id`

### server_link_provider(identity, discordId, discordUsername, email?) -- server-only
1. `requireServer(ctx)` -- caller must be in ServerIdentity table
2. `rejectIfBanned(ctx, discordId)` -- check BanRecord via `ban_record_provider_id` index (D-08 point 1)
3. Look up `UserIdentity` by provided identity
4. Three merge cases:
   - **Case 1a**: Identity -> guest, no existing provider owner -- upgrade guest: `isGuest=false`, `hasDiscordLinked=true`, username=providerName
   - **Case 1b**: Identity -> guest, provider already linked to different user -- re-point identity to existing user, delete orphaned guest
   - **Case 1c**: Identity -> verified user, refresh -- update timestamps, upsert `UserPrivate`
5. Write/upsert `UserPrivate` (discordId, discordUsername, email), set `User.hasDiscordLinked=true`

### clientConnected() -- lifecycle hook
1. Find `UserIdentity.identity.find(ctx.sender)`
2. If found: set `User.isOnline=true`, update `UserIdentity.lastSeenAt`
3. D-08 point 2: if `UserPrivate.discordId` is in BanRecord -> soft-delete user immediately
4. Phase 15.2 D-10: insert `UserDeletionJob` (scheduled 5s out) after ban-reconnect soft-delete (R1 fix)

### clientDisconnected() -- lifecycle hook
1. Find `UserIdentity.identity.find(ctx.sender)`
2. If found: set `User.isOnline=false`

### admin_ban_user(banTypeTag, providerId, reason)
1. `ensureAdmin(ctx)` -- requires Admin role
2. Validate inputs; check for existing ban (single-column index + in-memory filter)
3. Insert `BanRecord`
4. Find user via `UserPrivate.user_private_discord_id.filter(providerId)`, soft-delete if found (D-08 point 3)
5. Phase 15.2 D-10: insert `UserDeletionJob` (scheduled 5s out) to complete the two-phase delete (R1 fix)

### admin_unban_user(banRecordId)
1. `ensureAdmin(ctx)` -- requires Admin role
2. Find `BanRecord` by id -- reject if not found
3. Hard-delete the `BanRecord` row

## View Definitions

| View | Scope | Returns |
|------|-------|---------|
| `view_my_profile` | ctx.sender only | Merged User + UserPrivate fields (MyProfileRow) |
| `view_my_identity` | ctx.sender only | Caller's UserIdentity row |
| `view_admin_user_private` | Moderator+ only | All UserPrivate rows |
| `view_public_hsr_accounts` | Anonymous (projection-based privacy) | HsrAccount rows where `isRosterPublic=true`; rating included when `isRatingPublic=true`. Flat rows (one per character). Renamed from `view_public_accounts` in Phase 15.5 (D-04) — `hsr_` names the source table explicitly. Stays `anonymousView` per Phase 15.5 D-05 (projection body is the privacy gate, not subscription timing). |

### MyProfileRow fields (view_my_profile)
```
id, username, displayName, isGuest, isOnline, lastLoginAt, role,
hasDiscordLinked, avatarCharacterName, displayedAchievementId?, deletedAt?,
discordId?, discordUsername?, email?,
createdById, createdDate, lastModifiedById, lastModifiedDate
```
Note: `isPrivate` removed from schema (Phase 15.2 D-02 -- dead code, never gated).

## performUserDeletion Flow (Phase 15.2 D-09)

`performUserDeletion(ctx, userId, actorId)` is the single entry point for cascade deletion, called by the `UserDeletionJob` scheduled reducer.

```
performUserDeletion
  ├─ Cascade: hard-delete UserPrivate, calendar data, UserIdentity rows, HsrAccount + characters
  │
  ├─ [isGuest && !hasHistoryReferences(ctx, userId)]
  │     → hard-delete User row (fast path, no archive)
  │
  └─ [non-guest OR has history references]
        → insert DeletedUser { id, displayName, isGuest, deletedAt }
        → hard-delete User row
        (Ghost accumulation eliminated — User table contains only live users)
```

**Two-phase soft-delete pattern (uniform across all three writers, Phase 15.2 D-10):**

| Writer | File | Step 1 | Step 2 |
|--------|------|--------|--------|
| `admin_delete_row` | `admin.ts` | Set `User.deletedAt` | Insert `UserDeletionJob` (5s) |
| `admin_ban_user` | `banAdmin.ts` | Set `User.deletedAt` | Insert `UserDeletionJob` (5s) ← D-10 R1 fix |
| `clientConnected` ban-on-reconnect | `index.ts` | Set `User.deletedAt` | Insert `UserDeletionJob` (5s) ← D-10 R1 fix |

Prior to Phase 15.2, `admin_ban_user` and `clientConnected` set `deletedAt` but never scheduled the cascade job — the `UserDeletionJob.insert` was missing at both sites (R1 latent bug).

## resolveUserLabel Helper (Phase 15.2 D-12)

`resolveUserLabel(ctx, userId) → { displayName: string; isDeleted: boolean }`

Three-path lookup for display names at history render sites where the referenced user may have been evicted:

1. `ctx.db.User.id.find(userId)` → live user → `{ displayName: user.displayName, isDeleted: false }`
2. `ctx.db.DeletedUser.id.find(userId)` → archived user → `{ displayName: archive.displayName, isDeleted: true }`
3. Fallback → `{ displayName: \`User #${userId}\`, isDeleted: true }`

**Location:** `spacetimedb/src/helpers/userLabel.ts`

**Call sites (5):** `lobbyViews.ts:view_my_lobby_members`, `finalizationHelpers.ts:actorDisplayName`, `finalizationHelpers.ts:participantDisplayName`, `lobbyLifecycle.ts:kick_member`, `lobbyLifecycle.ts:ban_member`.

Do NOT use at sites where the user is the caller (`ctx.sender` is always live by construction).

## API Route: /api/auth/link-discord (D-09, D-10)

The Next.js API route performs ephemeral identity verification before calling `server_link_provider`:

1. Read NextAuth session JWT directly from cookies (bypasses `getServerSession` -- known next-auth 4.x bug in App Router POST handlers)
2. Decode JWT via `next-auth/jwt decode()` with `NEXTAUTH_SECRET` -- extract `discordId` (token.sub), `discordUsername` (token.name)
3. Parse `spacetimeToken` from request body
4. Create ephemeral SpacetimeDB connection using client's token -- extract server-verified identity hex (WR-02: fail-fast on disconnect)
5. Call `server_link_provider` via trusted server connection with verified identity

Key details: supports chunked cookies; cookie name derived from `NEXTAUTH_URL` protocol (`__Secure-next-auth.session-token` for https, `next-auth.session-token` for http).

## Ban Enforcement (D-08: Three-Point Enforcement)

| Point | Where | Trigger |
|-------|-------|---------|
| Point 1 (link-time) | `server_link_provider` | `rejectIfBanned` before any user mutation |
| Point 2 (reconnect) | `clientConnected` | Ban check on every reconnect; soft-delete if banned |
| Point 3 (ban-time) | `admin_ban_user` | Soft-deletes the currently linked user on ban creation |

## Frontend Auth Flow (useAuth.ts)

`readProfileFromConnection` resolves the current user via three strategies in order:

| Strategy | Lookup | When it wins |
|----------|--------|-------------|
| 1. Cached userId | `localStorage` -> `User.id.find()` | Returning user, same browser |
| 2. Guest username | `Guest_{identity_hex8}` -> `User.username.find()` | Just created guest |
| 3. Session name | `session.user.name` -> `User.username.find()` | Post-merge recovery |

Reactive callbacks: `conn.db.User.onInsert` and `conn.db.User.onUpdate` trigger re-reads, filtered by `event.tag` (`'Reducer'`, `'Transaction'`, skip `'SubscribeApplied'`).

`hasDiscordIntent` (sessionStorage flag, 5-minute TTL) gates Discord linking to prevent stale NextAuth sessions from auto-linking.

## Subscription Lifecycle (Phase 15.5 D-05)

SpacetimeDB offers two complementary privacy tools for client-facing data:

| Privacy Gate | Where It Runs | What It Closes |
|--------------|---------------|----------------|
| **Projection-based** (anonymous views) | Server — inside the view body | What a caller *sees* (field masking, row filtering by opt-in flags) |
| **Subscription-based** (client gating) | Client — inside `useAuth.ts` | When a subscription *fires* (anonymous visitors cause zero pre-auth egress on sensitive tables) |

These are not substitutes. Projection-based privacy is authoritative for any data the user has opted to share anonymously; subscription-based gating is how the client decides when to incur the bandwidth cost of a raw table subscription.

### The Two-Stage Rule (`useAuth.ts`)

- **Stage 1 — always on:** `SELECT * FROM view_my_profile` subscribes as soon as the SpacetimeDB connection is active. The server applies the `ctx.sender` filter — anonymous callers receive 0 rows, authenticated callers receive their single merged User + UserPrivate row.
- **Stage 2 — gated:** `SELECT * FROM user` subscribes ONLY when `currentUser != null || hadTokenOnMount.current || hadSessionCookie.current`. This gate composition matches `isWaitingForData`'s signal set (reuses existing refs; zero new infrastructure). Token / cookie presence is a UX hint — if either is stale/revoked, the WS handshake itself fails (`isActive` stays false) and Stage 2 never fires regardless.

A truly anonymous visitor (no cached token, no session cookie, no resolved User) causes zero egress on the User table. The bandwidth leak that Phase 15.2 UAT Test 4 exposed — unconditional `SELECT * FROM user` pre-auth — is closed by this split.

### Intentional Anonymous Exceptions

Two views stay `anonymousView` by design. Their privacy gate is the projection body, not subscription timing:

- **`view_lobby_browser`** — filters out config details (timers, budgets, penalties, audit columns, hostId) and filters to active stages only. Anonymous BY DESIGN so visitors can browse lobbies pre-auth.
- **`view_public_hsr_accounts`** — filters to `isRosterPublic=true` rows; rating field only emitted when `isRatingPublic=true`. Anonymous BY DESIGN so pre-auth profile browsing works.

These do NOT need Stage 2 gating — applying it would regress intentional pre-auth UX.

### Rule for Future Subscriptions

Any new frontend subscription to a raw table (no projection view body) OR a per-user view MUST go through the Stage 2 gate. If a new anonymous projection view is added whose body performs the privacy filtering, it may remain `anonymousView` — document that decision in this section alongside the two existing exceptions.

### Accepted Tradeoff (from 15.2 D-01 / 15.5 CONTEXT)

`User.public = true` means a malicious actor subscribing directly to `SELECT * FROM user` (not via our frontend) still receives rows. Closing that requires `User.public = false` + on-demand read reducers — explicitly deferred in Phase 15.5 CONTEXT deferred ideas. This phase's scope is "our frontend does not auto-subscribe anonymous," not "adversarial clients cannot query User."

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| login_as_guest creates User + UserIdentity; identity is SpacetimeDB sender | Phase 01 execution | 2026-02-01 |
| server_link_provider three merge cases (1a guest upgrade, 1b re-point, 1c refresh) | Phase 02 execution | 2026-02-10 |
| ctx.sender is always the authenticated principal -- never trust identity args | Phase 01 CONTEXT.md | 2026-02-01 |
| discordId removed from public User table; hasDiscordLinked bool replaces it | Phase 12 execution | 2026-04-05 |
| UserIdentity made private (public: false); clients use view_my_identity | Phase 12 execution | 2026-04-05 |
| UserPrivate table added for sensitive provider data (discordId, email) | Phase 12 execution | 2026-04-05 |
| BanRecord table added; three-point ban enforcement (D-08) | Phase 12 execution | 2026-04-05 |
| view_user_directory added as safe D-16 subset for client consumption | Phase 12 execution | 2026-04-05 |
| Link-discord API route uses ephemeral connection identity verification (replaces trusting client-supplied hex) (SEC-04) | Phase 12 execution | 2026-04-05 |
| Multi-column index on BanRecord causes PANIC; use single-column index + in-memory filter (WR-01) | Phase 12 execution | 2026-04-05 |
| Normalized to standard template | Phase 13 normalization | 2026-04-09 |
| User.isPrivate removed (D-02 dead code); DeletedUser private archive table added (D-05); view_user_directory flipped to authenticated-only spacetimedb.view() (D-06); performUserDeletion eviction rewrite (D-09); R1 fix — all three soft-delete writers now insert UserDeletionJob (D-10); resolveUserLabel helper added (D-12) | Phase 15.2 execution | 2026-04-15 |
| UAT verify-work confirmed all 9 cascade + archive behaviors on live maincloud. Two issues surfaced for follow-up (scoped to Phase 15.5 via seed `.planning/seeds/phase-15.5-auth-gated-user-subscription.md`): (1) D-06's `spacetimedb.view()` does NOT reject anonymous subscribers at the framework level — per SpacetimeDB docs, `view` vs `anonymousView` only differs in whether `ctx.sender()` is exposed, not in who can call; the runtime flip is a no-op without an explicit body-level auth check. (2) The actual bandwidth-leak surface is `useAuth.ts:38`'s unconditional `SELECT * FROM user` subscription pre-auth — no client ever subscribes to `view_user_directory`. Phase 15.5 will delete the dead view and gate the raw `user` subscription behind auth state | Phase 15.2 execution | 2026-04-16 |
| Phase 15.5: `view_user_directory` deleted (dead code — zero client subscribers, cosmetic 15.2 D-06 flip retired); `view_public_accounts` renamed to `view_public_hsr_accounts` (D-04) — underlying table is HsrAccount, name now explicit; `useAuth.ts` subscription split into Stage 1 (`view_my_profile`, always) and Stage 2 (`SELECT * FROM user`, gated on `currentUser != null \|\| hadTokenOnMount.current \|\| hadSessionCookie.current`) — closes the UAT Test 4 bandwidth leak; new `guestLoginPending` state drives a narrow Login-button spinner scoped strictly to the `loginAsGuest` pending window (D-03); `docs/auth/architecture.md` Subscription Lifecycle section codifies the projection-vs-subscription privacy distinction (D-05) with `view_lobby_browser` and `view_public_hsr_accounts` named as intentional anonymous exceptions | Phase 15.5 execution | 2026-04-16 |

---

*Last updated: 2026-04-16*
*Feature owner: Phase 01 / Phase 12*

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
