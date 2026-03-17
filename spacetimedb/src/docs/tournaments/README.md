# Tournament System

## Tables

```
Tournament
│  id (PK, autoInc), name, description
│  organizerId         → User.id (the TO)
│  format (TournamentFormat: SingleElim, DoubleElim, GroupOnly, GroupIntoSingleElim, GroupIntoDoubleElim)
│  stage (TournamentStage: Draft → Registration → Seeding → InProgress → Completed → Cancelled)
│  defaultGameMode, maxParticipants, teamSize (1/2/3)
│  isAnonymousDefault, isAnonymousSpectators
│  rosterVisibility (RosterVisibility: OpenRoster/ClosedWithRating/ClosedNoRating)
│  disconnectPolicy, checkInEnabled, checkInPerRound
│  autoForfeitEnabled, autoForfeitMinutes
│  bracketRevealAt? (scheduled timestamp)
│  winnerAdvantage (u8: 0=none, 1+=head-start games), groupAssignmentMode, groupAdvanceCount
│  costSetId → CostSet.id (0 = default cost set)
│  seasonId?, countTowardsMmr, defaultBestOf
│  requireVerified, requireRoster, requireApproval, waitlistEnabled
│  minimumMmr? (u32)
│  scheduledStartAt?, registrationDeadline? (informational only)
│
├── TournamentParticipant (registered players/teams)
│     PK: [tournamentId, userId]
│     tournamentId → Tournament.id
│     userId       → User.id
│     teamGroupId? → TournamentTeam.id (null for solo)
│     participantType (Individual/Team)
│     status (ParticipantStatus: Registered → CheckedIn → Active → Eliminated/Disqualified/Withdrawn)
│     isWaitlisted, approvedByToAt?, hsrAccountId?
│     seed?
│
├── TournamentAssistant (TO helpers with scoped permissions)
│     PK: [tournamentId, userId]
│     tournamentId → Tournament.id
│     userId       → User.id
│
├── TournamentTeam (NEW — Phase 03-01: named tournament teams for team-format events)
│     id (PK, autoInc)
│     tournamentId → Tournament.id
│     name, captainUserId → User.id
│
└── TournamentTeamRequest (NEW — Phase 03-01: join requests for tournament teams)
      PK: [teamId, userId]
      teamId → TournamentTeam.id
      userId → User.id
      isPending
```

## Stage Transitions (forward-only)

```
Draft → Registration → Seeding → InProgress → Completed
  └────────────────────────────────────────────► Cancelled (from any non-terminal state)
```

- **Seeding** (NEW): Between Registration and InProgress — used for seeding/bracket assignment.
- **Paused** stage removed — pausing tournaments handled via application logic, not stage.
- Stage transitions validated by `validateStageTransition()` in `helpers/tournamentHelpers.ts`.

## Flow

1. TO creates tournament → `stage: Draft`
2. TO configures settings, assigns assistants
3. TO opens registration → `stage: Registration`
4. Players/teams register → `TournamentParticipant` rows inserted
5. TO seeds bracket → `stage: Seeding`
6. TO starts tournament → `stage: InProgress`
7. Matches played through bracket system (see brackets/ docs)
8. Tournament ends → `stage: Completed` or `Cancelled`

## Permission Access

- **Moderator or Admin**: Full access to any tournament (via `ensureTournamentAccess()`)
- **Organizer**: Access to own tournament
- **TournamentAssistant**: Scoped access to assigned tournament
- Permission helpers in `helpers/ensurePermissions.ts` + `helpers/tournamentHelpers.ts`

## Key Decisions

- Paused stage removed (Phase 03-01): Replaced by application-level pause; stage transitions are now strictly forward-only
- Seeding stage added (Phase 03-01): Explicit stage for seeding between registration close and tournament start
- TournamentTeam vs Team: `TournamentTeam` is tournament-scoped (ephemeral); `Team` is the persistent org-level team
- winnerAdvantage replaces grandFinalsAdvantage: u8 allows configurable head-start (0, 1, 2, 3 games)
- rosterVisibility replaces isOpenRoster: 3 variants for finer roster broadcast control
- waitlist/approval: Both optional — if both false, registration is open and auto-approved
