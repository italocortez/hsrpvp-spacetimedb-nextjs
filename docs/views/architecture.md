# Views Architecture

## Overview

Views are server-side computed projections. Clients subscribe to views instead of raw tables for:
1. **Security** — private tables are never broadcast; views expose only what clients need
2. **Anonymous enforcement** — real user IDs hidden from opponents in anonymous lobbies (D-92)
3. **History visibility** — match history filtered to prevent tournament scouting (D-93)
4. **Convenience** — cross-table joins resolved server-side (e.g., lobby browser with tournament names)

All views are declared via `spacetimedb.view()` or `spacetimedb.anonymousView()`.

---

## View Catalog

### 1. `view_lobby_browser` (anonymous view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `anonymousView` — accessible without authentication
**Row type:** `LobbyBrowserRow` (custom projected struct)

Projected columns from Lobby + cross-table lookups:
- `id`, `joinCode`, `gameMode`, `draftMode`, `matchType`
- `currentPlayerCount`, `isTournamentControlled`, `isAnonymousPlayers`
- `stage`, `isPublic`, `teamSize`
- `tournamentName` (resolved via `ctx.db.Tournament.id.find(tournamentId)`)
- `costSetName` (resolved via `ctx.db.CostSet.id.find(costSetId)` when costSetId > 0)

**Filtering (D-08):** Excludes Finished lobbies. Only Waiting, Drafting, Equipping, Scoring shown. Uses the `stage` btree index with 4 individual filter calls to avoid full table scan.

**Purpose:** Lobby browser UI without exposing config details (timers, budgets, penalties), disconnect settings, or audit columns.

---

### 2. `view_my_lobbies` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `Lobby.rowType` (full lobby row)

Resolves `ctx.sender` → `UserIdentity` → `userId` → `LobbyMember.user_id` btree index → each `Lobby.id` PK lookup.

Returns all lobbies the caller is currently a member of. Users are in at most 1-2 lobbies (1-per-user enforcement).

---

### 3. `view_my_identity` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.option(UserIdentity.rowType)`

Returns the caller's own `UserIdentity` row via PK lookup on `ctx.sender`. Limits identity broadcast to one-per-client.

---

### 4. `view_user_directory` (anonymous view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `anonymousView`
**Row type:** `t.array(User.rowType)`

Returns all `User` rows. Stepping stone — table stays public for now. When frontend migrates to this view, the User table can be made private.

---

### 5. `view_my_profile` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.option(User.rowType)`

Returns the caller's own full `User` row. Resolves `ctx.sender` → `UserIdentity.identity` (PK) → `User.id` (PK).

---

### 6. `view_my_cost_sets` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(CostSet.rowType)`

Returns `CostSet` rows owned by the calling user via `creator_id` btree index. Used by TOs to manage their draft/publish workflow.

---

### 7. `view_my_draft_character_costs` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(CostSetDraftCharacter.rowType)`

Returns `CostSetDraftCharacter` rows for all cost sets owned by the calling user. Draft tables are private (not broadcast), so this view is the only read path.

---

### 8. `view_my_draft_lightcone_costs` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(CostSetDraftLightcone.rowType)`

Returns `CostSetDraftLightcone` rows for all cost sets owned by the calling user.

---

### 9. `view_my_draft_synergy_costs` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(CostSetDraftSynergy.rowType)`

Returns `CostSetDraftSynergy` rows for all cost sets owned by the calling user.

---

### 10. `view_my_player_stats` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(PlayerStat.rowType)`

Returns the caller's own `PlayerStat` rows. `PlayerStat` table is private (`public: false`) — this view is the only client read path. Uses `by_user` btree index. (D-33)

---

### 11. `view_my_character_stats` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(PlayerCharacterStat.rowType)`

Returns the caller's own `PlayerCharacterStat` rows. Private table, view-only access. (D-33)

---

### 12. `view_my_relationships` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(PlayerRelationship.rowType)`

Returns the caller's own `PlayerRelationship` rows. Private table, view-only access. (D-33)

---

### 13. `view_my_roster_visibility` (per-user view)

**File:** `spacetimedb/src/views/securityViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(RosterVisibilityRow)`

Custom struct: `{ lobbyId, memberUserId, hsrAccountId, characterName, eidolonLevel, accountRating? }`

Enforces roster visibility rules per D-10 through D-16:
- **Referee:** sees all rosters regardless of lobby setting (D-14)
- **Self + own team:** always see full roster + rating
- **OpenRoster:** all rosters visible to all participants (D-11)
- **ClosedWithRating:** opponent roster hidden, opponent `accountRating` visible via sentinel row with empty `characterName` (D-12)
- **ClosedNoRating:** opponent roster AND rating hidden (D-13)
- **Spectators:** follow opponent rules (D-16)

---

### 14. `view_my_lobby_chat` (per-user anonymous enforcement view)

**File:** `spacetimedb/src/views/anonymousViews.ts`
**Type:** `view` — requires authentication
**Row type:** `AnonymousChatRow`

Custom struct: `{ id, lobbyId, senderUserId, senderType, content, metadata?, anonymousLabel?, createdDate }`

Returns `ChatMessage` rows for lobbies the caller is a member of. Applies anonymous enforcement per D-92:
- If sender should be anonymized from caller's perspective: `senderUserId → 0`, resolves `anonymousLabel` from stored value on message row
- System messages (`senderType=System`) are never anonymized

**Filtering:** Per-lobby membership check via `LobbyMember.user_id` btree, then `ChatMessage.lobby_id` btree.

---

### 15. `view_my_lobby_members` (per-user anonymous enforcement view)

**File:** `spacetimedb/src/views/anonymousViews.ts`
**Type:** `view` — requires authentication
**Row type:** `AnonymousLobbyMemberRow`

Custom struct: `{ lobbyId, userId, isOnline, lobbySlot, isReferee, isConfirmed, isCaptain, displayName, anonymousLabel? }`

Returns `LobbyMember` rows for the caller's lobbies. Applies anonymous enforcement per D-92:
- Opponent members: `userId → 0`, `displayName → anonymousLabel`, `anonymousLabel` set
- Own team + self: real `userId` and `displayName` returned

Display name resolved from `User.id.find()` (denormalized at view time).

---

### 16. `view_my_match_steps` (per-user anonymous enforcement view)

**File:** `spacetimedb/src/views/anonymousViews.ts`
**Type:** `view` — requires authentication
**Row type:** `AnonymousMatchStepRow`

Custom struct: `{ id, lobbyId, sequence, actorUserId, anonymousLabel?, actorSlot, action, payload, timestamp }`

Returns `MatchSessionStep` rows for the caller's active lobby matches. Applies anonymous enforcement per D-92:
- Opponent actors: `actorUserId → 0`, `anonymousLabel` set from stored value on step row

---

### 17. `view_my_match_participants` (per-user anonymous enforcement view)

**File:** `spacetimedb/src/views/anonymousViews.ts`
**Type:** `view` — requires authentication
**Row type:** `AnonymousMatchParticipantRow`

Custom struct: `{ matchResultId, userId, teamSide, isCaptain, anonymousLabel? }`

Returns `MatchResultParticipant` rows for the caller's active lobby matches. Applies anonymous enforcement per D-92:
- Opponent participants: `userId → 0`, `anonymousLabel` computed via `computeAnonymousLabel()`

---

### 18. `view_match_history` (per-user + public history view)

**File:** `spacetimedb/src/views/anonymousViews.ts`
**Type:** `view` — requires authentication (anon users see only publicly visible rows)
**Row type:** `t.array(MatchSessionHistory.rowType)` (full history row)

Implements history visibility gate per D-93:
- Returns `MatchSessionHistory` rows where **either**:
  - `isPubliclyVisible === true` (standalone completed matches + completed tournament matches), **OR**
  - Caller participated in the match (checked via `MatchParticipantHistory.by_user` index)

**Purpose:** Prevents tournament scouting. Tournament matches stay hidden (`isPubliclyVisible=false`) while the tournament is active. Set to `true` by `revealTournamentHistory` when the tournament completes (D-84).

**Implementation:** Scans via 3 GameMode btree filter calls (`game_mode` index) to avoid `.iter()` anti-pattern. Deduplicates via `seenIds` Set. Participant lookup via `MatchParticipantHistory.by_user` btree index.

---

### 19. `view_match_participant_history` (visibility-gated history participants)

**File:** `spacetimedb/src/views/anonymousViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(MatchParticipantHistory.rowType)` (full participant history row)

Returns `MatchParticipantHistory` rows only for matches the caller can see. Same visibility rule as `view_match_history`:
- Match `isPubliclyVisible === true`, **OR**
- Caller participated in that match

**Purpose:** Prevents tournament scouting of opponent identities. During active anonymous tournaments, participant history for hidden matches is not returned. Revealed when tournament completes (via `revealTournamentHistory` setting `isPubliclyVisible=true`).

**Implementation:** Uses shared `buildVisibleMatchIds()` helper, then returns all participant rows for visible matches via `MatchParticipantHistory.by_match_history` index.

---

### 20. `view_match_step_history` (visibility-gated draft replay)

**File:** `spacetimedb/src/views/anonymousViews.ts`
**Type:** `view` — requires authentication
**Row type:** `t.array(MatchSessionStepHistory.rowType)` (full step history row)

Returns `MatchSessionStepHistory` rows (pick/ban/bid replay data) only for matches the caller can see. Same visibility rule as `view_match_history`.

**Purpose:** Prevents tournament scouting of opponent draft strategies. Contains actorUserId, actorDisplayName, and full step payloads — all hidden for non-visible matches.

**Implementation:** Uses shared `buildVisibleMatchIds()` helper, then returns all step rows for visible matches via `MatchSessionStepHistory.by_match_history` index.

**Naming convention:** History views (`view_match_*`) omit the "my" prefix because they return both the caller's matches AND publicly visible matches. The `view_my_*` prefix is reserved for views strictly scoped to the caller's current lobbies.

---

## Anonymous Enforcement Pattern (D-92)

All anonymous views follow the same pattern:

1. Resolve `ctx.sender` → `UserIdentity` → `callerUserId`
2. Get caller's lobby memberships via `LobbyMember.user_id` index
3. For each lobby, call `shouldAnonymize(ctx, lobbyId, targetUserId, lobby)`:
   - Returns `true` if target is an opponent AND lobby has anonymous mode enabled
   - Callers never see their own identity anonymized
4. If anonymizing: return `userId=0`, use pre-stored `anonymousLabel`
5. If not anonymizing: return real `userId` and resolved display name

Pre-stored `anonymousLabel` values are computed at write time (by `send_chat_message`, `broadcast_cursor`, etc.) via `computeAnonymousLabel()`. View retrieval uses the stored value — no recomputation at read time.

---

## Client Subscription

```typescript
conn.subscriptionBuilder().subscribe([
    // Lobby & identity
    'SELECT * FROM view_lobby_browser',
    'SELECT * FROM view_my_lobbies',
    'SELECT * FROM view_my_identity',
    'SELECT * FROM view_my_profile',
    // Cost sets (TOs)
    'SELECT * FROM view_my_cost_sets',
    'SELECT * FROM view_my_draft_character_costs',
    'SELECT * FROM view_my_draft_lightcone_costs',
    'SELECT * FROM view_my_draft_synergy_costs',
    // Stats & roster visibility
    'SELECT * FROM view_my_player_stats',
    'SELECT * FROM view_my_character_stats',
    'SELECT * FROM view_my_relationships',
    'SELECT * FROM view_my_roster_visibility',
    // Phase 9 anonymous enforcement views
    'SELECT * FROM view_my_lobby_chat',
    'SELECT * FROM view_my_lobby_members',
    'SELECT * FROM view_my_match_steps',
    'SELECT * FROM view_my_match_participants',
    'SELECT * FROM view_match_history',
    'SELECT * FROM view_match_participant_history',
    'SELECT * FROM view_match_step_history',
]);
```

---

## Key Decisions

- `LobbyPassword` extracted to private table — never broadcast; `view_lobby_browser` exposes only public lobby data
- `UserIdentity` limited to caller's own row via `view_my_identity` — prevents identity enumeration
- Real user IDs always stored on source rows; views anonymize at read time (D-92)
- `view_match_history` uses `isPubliclyVisible` flag rather than complex tournament state — flag set at tournament completion, preventing scouting without per-query tournament lookups
- `view_my_lobby_chat` uses pre-stored `anonymousLabel` on ChatMessage rows rather than recomputing at view time — consistent labels within a session
- `anonymousView` type used for views accessible without authentication (lobby browser, user directory)
- `view` type used for views requiring caller identity resolution via `ctx.sender`
