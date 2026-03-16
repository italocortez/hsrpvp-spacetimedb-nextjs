# Match Session (Draft System)

## Tables

```
Lobby
│
├── MatchSession (active draft state per lobby)
│     lobbyId (PK) → Lobby.id
│     currentPhase, currentTeam, currentStep
│     isPaused, isCompleted
│
├── MatchSessionStep (individual actions in a draft)
│     id (PK, autoInc)
│     lobbyId       → Lobby.id
│     actorUserId   → User.id
│     stepPayload   → StepPayload enum (Pick, Ban, Nominate, Bid, AuctionSold, Pause, Undo)
│
├── MatchSessionHistory (archived completed matches)
│     id (PK, string UUID)
│     lobbyId, hostUserId, teamBlueAlias, teamRedAlias
│     blueTeamMembers, redTeamMembers → PlayerSnapshot arrays
│     snapshotConfig → LobbyConfigSnapshot (frozen settings at match time)
│     result (MatchResult: BlueWins/RedWins/Draw/Aborted)
│     gameMode, draftMode, matchDurationMs
│
└── MatchSessionStepHistory (archived steps for replay)
      matchId → MatchSessionHistory.id
      stepNumber, actorUserId, stepPayload, timestamp
```

## Flow

1. Host starts draft → `MatchSession` created for the lobby
2. Players take turns → `MatchSessionStep` rows inserted (picks, bans, bids)
3. Draft completes → `MatchSession.isCompleted = true`
4. Match archived → `MatchSessionHistory` + `MatchSessionStepHistory` rows created
5. Active session rows cleaned up

## Key Decisions

- `LobbyConfigSnapshot` preserves exact rules used at match time (frozen copy)
- Step-by-step replay supported via `MatchSessionStepHistory`
- `PlayerSnapshot` captures player state at match time (name, avatar, team, etc.)
