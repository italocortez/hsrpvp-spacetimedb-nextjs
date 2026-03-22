# Security Views

## Purpose

Views control what data clients receive from the server. They fix three security issues in the Phase 1 schema:

1. **Lobby `passwordHash` leak** — extracted to a private `LobbyPassword` table
2. **UserIdentity broadcast** — per-user view limits to caller's own mapping
3. **User sensitive fields** — per-user view for full profile, anonymous view for directory

## Architecture

```
LobbyPassword (PRIVATE — never sent to clients)
├── lobbyId (PK, FK → Lobby.id)
├── passwordHash
└── audit columns

view_lobby_browser (anonymous)
└── Returns: all Lobby rows (passwordHash no longer in Lobby table)

view_my_lobbies (per-user)
└── ctx.sender → UserIdentity → LobbyMember → Lobby rows

view_my_identity (per-user)
└── ctx.sender → UserIdentity row (PK lookup)

view_user_directory (anonymous)
└── Returns: all User rows (stepping stone — table stays public for now)

view_my_profile (per-user)
└── ctx.sender → UserIdentity → User row
```

## View Details

| View | Type | Returns | Index Lookups |
|------|------|---------|---------------|
| `view_lobby_browser` | anonymous | `t.array(Lobby.rowType)` | Query builder scan |
| `view_my_lobbies` | per-user | `t.array(Lobby.rowType)` | `UserIdentity.identity` (PK), `LobbyMember.user_id` (btree), `Lobby.id` (PK) |
| `view_my_identity` | per-user | `t.option(UserIdentity.rowType)` | `UserIdentity.identity` (PK) |
| `view_user_directory` | anonymous | `t.array(User.rowType)` | Query builder scan |
| `view_my_profile` | per-user | `t.option(User.rowType)` | `UserIdentity.identity` (PK), `User.id` (PK) |

## Client Subscription

Views require explicit SQL subscription:

```typescript
conn.subscriptionBuilder().subscribe([
    'SELECT * FROM view_lobby_browser',
    'SELECT * FROM view_my_lobbies',
    'SELECT * FROM view_my_identity',
    'SELECT * FROM view_my_profile',
]);
```

## Phase 6 Views (Per-User Stat and Roster Visibility)

These views provide access to private stat tables and enforce roster visibility rules.

| View | Type | Returns | Source Table | Access Pattern |
|------|------|---------|-------------|----------------|
| view_my_player_stats | per-user | t.array(PlayerStat.rowType) | PlayerStat (private) | by_user index |
| view_my_character_stats | per-user | t.array(PlayerCharacterStat.rowType) | PlayerCharacterStat (private) | by_user index |
| view_my_relationships | per-user | t.array(PlayerRelationship.rowType) | PlayerRelationship (private) | by_user index |
| view_my_roster_visibility | per-user | t.array(RosterVisibilityRow) | HsrAccountCharacter via LobbyMember | Complex (see below) |

### Roster Visibility Rules (view_my_roster_visibility)

Custom struct: `RosterVisibilityRow { lobbyId, memberUserId, hsrAccountId, characterName, eidolonLevel, accountRating? }`

Rules per D-10 through D-16:
- **Referee:** sees all rosters regardless of lobby setting (D-14)
- **Self + own team:** always see full roster + rating
- **OpenRoster:** all rosters visible to all participants (D-11)
- **ClosedWithRating:** opponent roster hidden, opponent accountRating visible via sentinel row (D-12)
- **ClosedNoRating:** opponent roster AND accountRating hidden (D-13)
- **Spectators:** follow opponent rules -- see own team (if applicable), opponents per visibility mode (D-16)

View resolves ctx.sender -> UserIdentity -> userId -> LobbyMember -> team side -> lobby rosterVisibility setting. Returns own+allies rosters always, opponent data per mode. Referee flag overrides to full visibility.

## Client Subscription (Updated)

Views require explicit SQL subscription:

```typescript
conn.subscriptionBuilder().subscribe([
    'SELECT * FROM view_lobby_browser',
    'SELECT * FROM view_my_lobbies',
    'SELECT * FROM view_my_identity',
    'SELECT * FROM view_my_profile',
    // Phase 6 views
    'SELECT * FROM view_my_player_stats',
    'SELECT * FROM view_my_character_stats',
    'SELECT * FROM view_my_relationships',
    'SELECT * FROM view_my_roster_visibility',
]);
```

## Migration Notes

- `passwordHash` column removed from `lobby` table and moved to `lobby_password` (private)
- This is a **dangerous schema change** (column removal) — requires `--clear-database` to republish
- All existing tables remain `public: true` — views are additive, no frontend breakage
- Future: once frontend subscribes to views instead of raw tables, tables can be made private
