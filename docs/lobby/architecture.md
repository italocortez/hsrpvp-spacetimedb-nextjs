# Lobby System

## Tables

```
Lobby
│  id (PK, autoInc), joinCode (unique), hostUserId → User.id
│  teamBlueAlias, teamRedAlias
│
│  Flattened config (was LobbyConfig struct):
│    teamSize, draftMode, banMode, standardTurnSeconds, reserveBankSeconds
│    auctionBudget?, rosterDiffAdvantage, rosterThreshold
│    underThresholdAdvantage, aboveThresholdPenalty, deathPenalty
│
│  Tournament linkage:
│    tournamentId? → Tournament.id
│    bracketMatchId? → BracketMatch.id
│
│  Settings:
│    isAnonymousPlayers, isAnonymousSpectators
│    rosterVisibility (RosterVisibility enum: OpenRoster/ClosedWithRating/ClosedNoRating)
│    requireOwnership (bool, default true — auto-defaults from matchType: Casual=false, Ranked=true)
│    isTournamentControlled (bool — inherits settings from tournament)
│    isPublic, disconnectPolicy, gameMode
│
│  Lifecycle:
│    hostDisconnectTime?, lastActivityAt, stage (Waiting/Drafting/Finished)
│
├── LobbyMember (who's in the lobby)
│     PK: [lobbyId, userId]
│     lobbyId    → Lobby.id
│     userId     → User.id
│     isOnline, participationRole (Player/Spectator)
│     isReferee, isCoach, teamSlot (Blue/Red/Spectator)
│
├── LobbyPassword (PRIVATE — password hash storage)
│     lobbyId (PK) → Lobby.id
│     passwordHash
│     (never sent to clients)
│
└── LobbyCursorEvent (ephemeral cursor broadcast)
      lobbyId         → Lobby.id
      senderUserId    → User.id (sentinel 0 when anonymous)
      anonymousLabel  (Phase 6 — e.g. "Blue-1", "Spectator-2")
      x, y coordinates
```

## Key Decisions

- `LobbyConfig` struct was flattened into Lobby columns — all settings are indexable/filterable
- `LobbyConfigSnapshot` (in structs.ts) is only used by MatchSessionHistory for historical snapshots
- Capacity: 6 players, 2 coaches, 12 spectators = 20 max (enforced in reducer)
- Visibility: public or private (password-protected), both have joinCode for Jackbox-style quick invite
- Password hashes stored in private `LobbyPassword` table (never broadcast to clients)
- `lastActivityAt` tracks lobby activity (cursor, chat, picks) for GC timeout — separate from `lastModifiedDate` audit column
- `rosterVisibility` enum replaces `isOpenRoster` bool — OpenRoster/ClosedWithRating/ClosedNoRating for parity with Tournament (D-10)
- `requireOwnership` auto-defaults from matchType (Casual=false, Ranked=true), locked after creation (D-17/D-18)
- `isTournamentControlled` enables tournament config inheritance for anonymous mode, roster visibility, and ownership (D-06/D-19)
- LobbyCursorEvent gains `anonymousLabel` for anonymous mode — senderUserId=0 when anonymous (D-01/D-62)
