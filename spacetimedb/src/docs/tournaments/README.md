# Tournament System

## Tables

```
Tournament
│  id (PK, autoInc), name, description
│  organizerId         → User.id (the TO)
│  format (TournamentFormat: SingleElim, DoubleElim, GroupOnly, GroupIntoSingleElim, GroupIntoDoubleElim)
│  stage (TournamentStage: Draft → Registration → InProgress → Paused → Completed → Cancelled)
│  defaultGameMode, maxParticipants
│  isAnonymousDefault, isAnonymousSpectators, isOpenRoster
│  disconnectPolicy, checkInEnabled, checkInPerRound
│  autoForfeitEnabled, autoForfeitMinutes
│  bracketRevealAt? (scheduled timestamp)
│  grandFinalsAdvantage, groupAssignmentMode, groupAdvanceCount
│  seasonId?, countTowardsMmr, defaultBestOf
│
├── TournamentParticipant (registered players/teams)
│     PK: [tournamentId, userId]
│     tournamentId → Tournament.id
│     userId       → User.id
│     teamId?      → Team.id (null for solo registration)
│     participantType (Individual/Team)
│     status (ParticipantStatus: Registered → CheckedIn → Active → Eliminated/Disqualified/Withdrawn)
│     seed?
│
└── TournamentAssistant (TO helpers with scoped permissions)
      PK: [tournamentId, userId]
      tournamentId    → Tournament.id
      userId          → User.id
      canManageBracket, canValidateResults, canDqParticipants
      canManageCheckIn, canEditSettings
```

## Flow

1. TO creates tournament → `stage: Draft`
2. TO configures settings, assigns assistants
3. TO opens registration → `stage: Registration`
4. Players/teams register → `TournamentParticipant` rows inserted
5. TO closes registration, bracket generated → `stage: InProgress`
6. Matches played through bracket system (see brackets/ docs)
7. TO can pause → `stage: Paused` (blocks new match creation, in-progress lobbies continue)
8. Tournament ends → `stage: Completed` or `Cancelled`

## Key Decisions

- Pause vs Cancel: Pause blocks new matches; Cancel voids results but NEVER wipes match history
- Manual lobby creation: Players/TO manually create lobbies and link to bracket matches
- No-show handling: Default is TO override; auto-forfeit only when pre-arranged via calendar
- Per-round game mode override: Default mode set per tournament, TO can override per round
