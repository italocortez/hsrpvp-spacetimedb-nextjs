# Tournaments

**Architecture:** [architecture.md](architecture.md)

## Acceptance Scenarios

### Tournament Creation
**Given:** User with TournamentHost role
**When:** `create_tournament` with valid settings
**Then:** Tournament inserted with stage=Draft, organizerId=caller

### Stage Advancement (happy path)
**Given:** Tournament in Registration, 4 active participants
**When:** `advance_tournament_stage(id, "Seeding")`
**Then:** Stage changes to Seeding

### Stage Advancement (blocked)
**Given:** Tournament in Registration, 1 active participant
**When:** `advance_tournament_stage(id, "Seeding")`
**Then:** Throws "At least 2 active participants are required"

### Solo Registration with Auto-Team
**Given:** Solo tournament (teamSize=1) in Registration
**When:** `register_for_tournament(id, teamGroupId=0)`
**Then:** TournamentTeam auto-created (name=displayName). Participant inserted with teamGroupId=team.id, type=Team

### Team Join Request
**Given:** Team tournament, Team A (1 member), Player B registered individually
**When:** Player B calls `request_join_team(teamId)`
**Then:** TournamentTeamRequest row created (row exists = pending)
**When:** Captain calls `accept_team_request(teamId, playerB)`
**Then:** Request row deleted. Player B's participant: teamGroupId=teamId, type=Team

### DQ Auto-Advance
**Given:** Tournament InProgress, autoAdvanceBracket=true, A vs B in bracket
**When:** `dq_participant(tournamentId, playerA)`
**Then:** A status=Disqualified. B auto-advances to next bracket match

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Register full tournament, waitlist off | Throws "Tournament is full" |
| Register full tournament, waitlist on | Inserted with isWaitlisted=true |
| Captain tries to leave team | Throws "Captain cannot leave. Use disband." |
| Disband during InProgress | Throws "Teams can only be disbanded during Registration" |
| Advance Draft → InProgress (skip) | Throws stage transition error |
| Cancel completed tournament | Throws "Cannot cancel terminal state" |
| DQ already withdrawn participant | Throws "Participant not active" |
| Update tournament during InProgress | Throws "Can only update during Draft or Registration" |

## Integration Points

| This Feature | Connects To | Direction |
|-------------|------------|-----------|
| Tournament.costSetId | CostSet.id | Reads |
| TournamentParticipant.hsrAccountId | HsrAccount.id | Reads |
| TournamentParticipant.teamGroupId | TournamentTeam.id | Reads/Writes |
| BracketMatch.tournamentId | Tournament.id | Phase 4 writes |
| MatchResultRecord.tournamentId | Tournament.id | Phase 3 writes |
| MmrRating | Auto-seeding | Phase 4 reads |

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| Stages forward-only, no Paused | Phase 3 CONTEXT.md | 2026-03-17 |
| TournamentTeamRequest transactional (no isPending) | Phase 3 review | 2026-03-17 |
| Role hierarchy: Admin>Mod>TO>User | Phase 3 CONTEXT.md | 2026-03-17 |
| winnerAdvantage u8 replaces bool | Phase 3 CONTEXT.md | 2026-03-17 |
| Cost set lock→unpublish→delete lifecycle | Phase 3 CONTEXT.md | 2026-03-17 |
| Solo players auto-create TournamentTeam | Phase 4 CONTEXT.md | 2026-03-17 |
| BracketSide enum (5 variants) | Phase 4 CONTEXT.md | 2026-03-17 |
| Grand finals: single match + advantage | Phase 4 CONTEXT.md | 2026-03-17 |
| 3rd place match via has3rdPlaceMatch | Phase 4 CONTEXT.md | 2026-03-17 |
| autoAdvanceBracket toggle | Phase 4 CONTEXT.md | 2026-03-17 |
| seedNumber on TournamentTeam (not Participant) | Phase 4 CONTEXT.md | 2026-03-18 |
| GroupStanding.participantTeamId | Phase 4 CONTEXT.md | 2026-03-18 |
| MatchResultParticipant for 2v2/3v3 | Phase 4 CONTEXT.md | 2026-03-18 |
| Team name rules by format + anonymous | Phase 4 CONTEXT.md | 2026-03-17 |
| Groups: Win=2, Draw=1, Loss=0 | Phase 4 CONTEXT.md | 2026-03-17 |
| Rollback: one step, MMR reversal Phase 5 | Phase 4 CONTEXT.md | 2026-03-17 |

---

*Last updated: 2026-03-18*
