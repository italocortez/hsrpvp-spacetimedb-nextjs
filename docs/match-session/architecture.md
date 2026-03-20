# Match Session (Draft System)

## Tables

```
Lobby
|
+-- MatchSession (active draft state per lobby)
|     lobbyId (PK) -> Lobby.id
|     currentPhase, currentTeam, currentStep
|     isPaused, isCompleted
|
+-- MatchSessionStep (individual actions in a draft)
|     id (PK, autoInc)
|     lobbyId       -> Lobby.id
|     actorUserId   -> User.id
|     stepPayload   -> StepPayload enum (Pick, Ban, Nominate, Bid, AuctionSold, Pause, Undo)
|
+-- MatchSessionHistory (archived completed matches)
|     id (PK, u32 autoInc)
|     lobbyCode              -> lobby code at time of match (e.g. "X7K9P2")
|     playedAt               -> timestamp
|     draftMode              -> DraftMode enum
|     gameMode               -> GameMode enum
|     teamBlueAlias, teamRedAlias
|     snapshotConfig         -> LobbyConfigSnapshot (frozen settings at match time)
|     outcome                -> MatchOutcome enum (BlueWins, RedWins, Draw, Aborted)
|     rosterBlue, rosterRed  -> serialized JSON blobs (final team compositions)
|     Note: Player membership now tracked via MatchParticipantHistory junction table
|
+-- MatchSessionStepHistory (archived steps for replay)
|     matchHistoryId (PK)    -> MatchSessionHistory.id (u32, 1-to-1)
|     steps                  -> JSON string (full array of step data)
|     Note: Clients fetch this only when "Watch Replay" is clicked
|
+-- MatchParticipantHistory (who played in each match -- junction table)
      PK: [userId, matchHistoryId]
      userId                 -> User.id
      matchHistoryId         -> MatchSessionHistory.id (u32)
      teamSide               -> TeamLabel enum (Blue or Red)
      Indexes: by_user [userId], by_match_history [matchHistoryId], by_user_and_match [userId, matchHistoryId]
```

## Flow

1. Host starts draft -> `MatchSession` created for the lobby
2. Players take turns -> `MatchSessionStep` rows inserted (picks, bans, bids)
3. Draft completes -> `MatchSession.isCompleted = true`
4. Match archived -> `MatchSessionHistory` + `MatchParticipantHistory` + `MatchSessionStepHistory` rows created
5. Active session rows cleaned up

## Match Participant History

MatchParticipantHistory is a junction table that replaces the non-indexable PlayerSnapshot
arrays (blueTeamMembers/redTeamMembers) that were previously embedded in MatchSessionHistory.

### Purpose
The primary query it serves is "show me all matches user X played" -- a profile page query
that needs to be indexed by userId. With embedded arrays, this query required scanning every
MatchSessionHistory row. With the junction table, it's a direct index lookup.

### Archive Flow (Phase 5)
When a match is archived (MatchSession -> MatchSessionHistory):
1. Write MatchSessionHistory row (match outcome, config snapshot, timestamps)
2. Write MatchParticipantHistory rows -- one per participant, capturing userId, matchHistoryId, teamSide
3. Write MatchSessionStepHistory rows (draft replay data)
4. Clean up active session rows

### Query Pattern
To load a player's match history:
1. Subscribe to MatchParticipantHistory filtered by userId -> get list of matchHistoryIds
2. Filter MatchSessionHistory by those matchHistoryIds -> get match metadata
3. On demand: load MatchSessionStepHistory for a specific matchHistoryId -> replay data

This is a fan-out pattern: one subscription gives you the IDs, then you load details as needed.

## Key Decisions

- `LobbyConfigSnapshot` preserves exact rules used at match time (frozen copy)
- Step-by-step replay supported via `MatchSessionStepHistory`
- MatchSessionHistory.id is u32 autoInc (not string UUID)
- MatchSessionStepHistory uses matchHistoryId as its PK (1-to-1 with MatchSessionHistory)
- MatchParticipantHistory junction replaces embedded PlayerSnapshot arrays for indexable player lookups
- outcome uses MatchOutcome enum (BlueWins, RedWins, Draw, Aborted)
- rosterBlue/rosterRed are serialized JSON blobs for frozen team compositions
