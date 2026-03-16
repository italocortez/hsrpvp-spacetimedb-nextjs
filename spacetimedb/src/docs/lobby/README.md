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
│    isAnonymousPlayers, isAnonymousSpectators, isOpenRoster
│    isPublic, passwordHash?, disconnectPolicy, gameMode
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
└── LobbyCursorEvent (ephemeral cursor broadcast)
      lobbyId       → Lobby.id
      senderUserId  → User.id
      x, y coordinates
```

## Key Decisions

- `LobbyConfig` struct was flattened into Lobby columns — all settings are indexable/filterable
- `LobbyConfigSnapshot` (in structs.ts) is only used by MatchSessionHistory for historical snapshots
- Capacity: 6 players, 2 coaches, 12 spectators = 20 max (enforced in reducer)
- Visibility: public or private (password-protected), both have joinCode for Jackbox-style quick invite
- `lastActivityAt` tracks lobby activity (cursor, chat, picks) for GC timeout — separate from `lastModifiedDate` audit column
