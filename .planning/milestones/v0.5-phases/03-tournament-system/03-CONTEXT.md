# Phase 3: Tournament System - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Tournament organizers can create and manage tournament lifecycle, players can register solo or as teams, and referees are scoped per match. This phase also implements the expanded role hierarchy (Moderator, TournamentHost), match result submission flow (universal — not tournament-only), cost set management with draft/publish workflow, and tournament-scoped team formation. Backend only — tables, reducers, views.

</domain>

<decisions>
## Implementation Decisions

### Role Hierarchy (Expanded)
- **Strictly hierarchical** — one role per user: Admin > Moderator > TournamentHost > User > Guest
- Add `Moderator` and `TournamentHost` variants to the existing Role enum
- **No TO request flow** — users contact admins on Discord, admins grant TournamentHost directly
- **Moderator is admin-granted only** — no request flow
- **Promotion rules:**
  - Admin can promote/demote anyone except other admins
  - Moderator can promote/demote TournamentHost only (not other mods or admins)
- **Role capabilities** (hierarchical — higher inherits lower):
  - **Admin**: Full system access, all panels
  - **Moderator**: User management (titles, MMR compensation/penalties), lobby management (kill/kick), cost tools for ANY ruleset, tournament oversight (see all history, edit any tournament, confirm any match)
  - **TournamentHost**: Create/manage own tournaments, assign tournament assistants, confirm match submissions in own tournaments, manage own cost sets
  - **User (Verified)**: Full gameplay, roster management, MMR earning, join/create matches, join tournaments, calendar, stats, achievements, team joining (no TO request flow — users contact admins on Discord)
  - **Guest (Unverified)**: Limited gameplay (no roster-requiring lobbies/tournaments), limited stats (no per-character, no replays), can join teams only within tournaments that don't enforce roster, can view calendars but not set own availability

### Referee System (Per-Match, Universal)
- Referee is a **per-match flag**, not a tournament role
- Host of a lobby is auto-assigned as referee
- Referee flag is **transferable** within the lobby:
  - Host can give referee flag to another participant (host loses it)
  - Host can reassign themselves referee flag at any point
  - Any current referee can transfer the flag to another participant
- **Referee powers** (granular per-lobby-option — Claude's discretion on which controls):
  - Pause match
  - Undo actions
  - Move players between teams/spectator/coach
  - Submit match results (only referee can click submit)
- **Per-lobby granularity**: Each referee power has a permission level (anyone / referee only / match participants only) configurable in lobby options

### Match Result Submission Flow (Universal — not tournament-specific)
- After draft ends → results view. Both teams fill score panels (visible to both in real-time)
- Each team clicks "confirm" on their panel
- Only the referee can click "submit" once both teams have confirmed
- Submit triggers: match history archival, MMR calculation (if ranked), bracket advancement (if tournament match with bracketMatchId)
- **Post-submission dispute**: Either player can dispute once per match
  - For tournament matches: TO can invalidate the match result (bracket reverts as if match never happened, MMR compensation given if ranked)
  - For non-tournament ranked matches: Admin/Moderator can review screenshots and issue MMR compensation
- **Match types**: Casual (scores submitted, no screenshots required, no MMR), Ranked (scores + screenshots required, MMR calculated), Tournament (scores + screenshots, MMR if tournament is ranked)

### Tournament Lifecycle
- Stages: **Draft -> Registration -> Seeding -> InProgress -> Completed / Cancelled**
- **TO manually advances each stage** — no auto-transitions
- **Draft stage**: Tournament visible only to TO + admins. TO configures settings.
- **Registration**: Tournament visible to all. Players can register. TO can still edit description/rules.
- **Seeding**: TO can still manually add players. Seeding happens here.
- **InProgress**: Matches are played. TO can modify bracket history step-by-step backward (invalidates affected matches, triggers MMR compensation for ranked tournaments).
- **Completed**: TO manually marks complete after dispute resolution.
- **Cancelled**: Soft cancel — tournament stays in DB with Cancelled stage. History preserved.
- **No stage reversals** — stages only move forward
- **Informational dates only** — scheduledStartAt, registrationDeadline stored but not auto-enforced. Frontend shows countdown.
- **Match needs `tournamentId` AND `bracketMatchId`** for auto-advancement trigger logic

### Registration & Teams (Tournament-Scoped)
- **Individual signup** — players register to a tournament individually
- **Teams are tournament-scoped only** — no persistent teams
  - Existing Team/TeamMember/TeamInvite tables are **out of scope** for Phase 3 (may be repurposed later for persistent teams)
  - Use `TournamentParticipant` with `teamGroupId` column for team grouping
  - Small `TournamentTeam` table for team name + captain info (personalized names for fun factor)
  - For 2v2/3v3 formats: player creates a team inside the tournament, others request to join, captain accepts
  - **TournamentTeamRequest is purely transactional** — row exists = pending request, row deleted = resolved (accepted or rejected). No status columns. The table's only purpose is to mediate the join request flow.
  - Solo in team formats is allowed (team of 1)
- **Tournament format**: `teamSize` (1/2/3) separate from `bracketFormat` (SingleElim/DoubleElim/GroupPhase)
- **Participant limits**: Optional maxParticipants with waitlist support
- **Registration requirements** (all optional, TO-configurable):
  - Verified account required
  - Roster required (has HSR account)
  - Minimum MMR threshold
  - Manual TO approval per registrant
  - **Implicit**: Open Roster or Closed+Rating automatically requires HSR account (and therefore verified)

### Tournament Settings
- **RosterVisibility** enum (3 values): OpenRoster, ClosedWithRating, ClosedNoRating — stored on Tournament table, overrides user settings
- **Anonymous play**: Boolean on Tournament. Tournament-level enforced, no per-match override. Anonymous hides player names only (shows "Player 1"/"Player 2"). Independent of roster visibility.
- **Disconnect policy**: DisconnectPolicy enum already exists. Stored on Tournament, flows to matches.
- **Game mode**: GameMode enum on Tournament
- **Cost set**: costSetId FK on Tournament
- **Best-of**: Tournament has `defaultBestOf`. Overridable per round/match. BracketMatch.bestOf inherits from tournament default unless overridden.
- **Winner advantage**: Boolean/u8 on Tournament. Only applies to double elimination grand finals (winner's bracket finalist starts 1-0 up).

### Cost Set Management
- **CostSet metadata table**: id (PK autoInc), name, creatorId, isPublished, isDraft, isLocked + audit columns
- CostSet rows reference `costSetId` (u32 FK) in HsrCharacterCost, HsrLightconeCost, HsrSynergyCost (columns already exist from Phase 2)
- **Reusable across tournaments** — CostSet belongs to a creator, can be assigned to any match or tournament
- **Non-tournament matches can also use custom cost sets** and earn MMR
- **Draft/publish workflow**:
  1. TO creates a new cost set → copies all rows from source set into a **draft cost table** (private, not broadcast)
  2. TO edits costs in draft table (unlimited edits, no broadcast to other players)
  3. TO publishes → draft rows are upserted into live cost tables with new costSetId
  4. Draft rows cleaned up after publish
- **Draft table needs a per-user view** so TOs only see their own drafts (similar to `view_my_lobbies` pattern)
- **Publish/unpublish toggle** on CostSet for bandwidth savings — unpublished sets not broadcast to clients
- **Lock before unpublish/delete**: If a cost set is in active use (lobbies using it), the TO must first **lock** it (`isLocked = true`). A locked cost set prevents new lobbies from selecting it but existing lobbies continue using it. Once the last lobby using a locked cost set ends, the set becomes eligible for unpublish/delete. Phase 3 implements the lock reducer and the `isLocked` column. The automatic "unpublish when last lobby closes" trigger is deferred to Phase 9 (lobby lifecycle reducers).
- **Synergy costs**: Optionally included in cost sets. Copied during clone but not mandatory to customize.
- **Creation scope**: When creating a cost set for a specific game mode, it must cover all characters and lightcones for that mode with both classicCost and auctionCost filled
- **Cloning**: Can clone from default (costSetId=0) or any other existing published cost set

### Claude's Discretion
- Specific granular lobby permission controls (which powers need per-lobby configuration)
- CostSet table architecture details and draft table design
- Tournament team table structure (TournamentTeam vs grouping approach)
- Index strategy for new tables
- Reducer file organization for tournament domain
- Check-in system (if needed — not explicitly requested)
- How to handle waitlist promotion when a participant drops

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tournament tables (existing schema from Phase 1)
- `spacetimedb/src/tables/tournament.ts` — Tournament table with existing columns
- `spacetimedb/src/tables/tournamentParticipant.ts` — TournamentParticipant table (needs teamGroupId addition)
- `spacetimedb/src/tables/tournamentAssistant.ts` — TournamentAssistant table for per-tournament assistant assignment
- `spacetimedb/src/tables/bracketMatch.ts` — BracketMatch table with bestOf, nextWinnerMatchId, nextLoserMatchId
- `spacetimedb/src/tables/groupStanding.ts` — GroupStanding for round-robin tournaments
- `spacetimedb/src/tables/team.ts` — Existing Team table (OUT OF SCOPE for Phase 3 — tournament teams use TournamentParticipant grouping)
- `spacetimedb/src/tables/teamMember.ts` — Existing TeamMember (OUT OF SCOPE)
- `spacetimedb/src/tables/teamInvite.ts` — Existing TeamInvite (OUT OF SCOPE)

### Match and lobby tables
- `spacetimedb/src/tables/lobby.ts` — Lobby table (referee flag, lobby options need additions)
- `spacetimedb/src/tables/lobbyMember.ts` — LobbyMember (needs referee flag, hsrAccountId)
- `spacetimedb/src/tables/matchResult.ts` — MatchResultRecord table for submission tracking
- `spacetimedb/src/tables/matchSession.ts` — MatchSession (links to lobby)

### Cost tables
- `spacetimedb/src/tables/hsrCharacterCost.ts` — Has costSetId column (from Phase 2, default 0)
- `spacetimedb/src/tables/hsrLightconeCost.ts` — Has costSetId column
- `spacetimedb/src/tables/hsrSynergyCost.ts` — Has costSetId column

### Auth and permissions
- `spacetimedb/src/helpers/ensurePermissions.ts` — getAuthenticatedUser(), ensureAdmin(), ensureTournamentHost() (needs ensureModerator(), role hierarchy checks)
- `spacetimedb/src/types/enums.ts` — Role enum (needs Moderator, TournamentHost variants added)

### Phase 2 context
- `.planning/phases/02-roster-management/02-CONTEXT.md` — Prior decisions (roster visibility, active account per-lobby, cost set prep, views strategy)

### Architecture docs
- `docs/` — Feature domain docs (tournament/, teams/, brackets/ need updating)
- `spacetimedb/src/views/securityViews.ts` — Existing per-user view pattern for draft cost table view

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ensurePermissions.ts`: Already has `ensureTournamentHost()` — extend with `ensureModerator()` and role hierarchy comparison helper
- `auditColumns.ts`: `auditInsert()`, `auditUpdate()` — apply to all new tables
- `securityViews.ts`: Per-user view pattern (`ctx.sender` -> UserIdentity -> userId) — reuse for draft cost table view
- Admin proxy reducer pattern from Phase 2 (`rosterAdmin.ts`) — template for tournament admin reducers

### Established Patterns
- Role enum on User table with single-value hierarchy
- Reducer-level permission checks via helper functions
- Batch-only reducer design (batch of 1 = single operation)
- Private tables for sensitive data (LobbyPassword pattern)
- Per-user views for scoped data access

### Integration Points
- `schema.ts`: New tables (CostSet, CostSetDraft, TournamentTeam) must be registered
- `index.ts`: All new reducers must be exported, new views imported
- `enums.ts`: Add Moderator and TournamentHost to Role enum (ordering matters for hierarchy)
- Tournament table: Needs many new columns (rosterVisibility, isAnonymous, costSetId, defaultBestOf, winnerAdvantage, teamSize, maxParticipants, etc.)
- LobbyMember: Needs isReferee flag, hsrAccountId
- Lobby: Needs granular permission option columns

</code_context>

<specifics>
## Specific Ideas

- Match result submission is like a "trading system" — both sides confirm before the transaction commits. Only the referee can finalize.
- Cost set draft workflow is like a staging environment — edits are invisible to other players until published
- TOs should be encouraged to manage only one cost set (but not enforced)
- Winner advantage is specifically for double elimination grand finals — winner's bracket finalist starts 1 game up
- Tournament teams have personalized names chosen by the captain for fun factor
- No scheduling enforcement — people organize on Discord with calendar feature help

</specifics>

<deferred>
## Deferred Ideas

- **Persistent teams** (Team/TeamMember/TeamInvite tables) — OUT OF PROJECT SCOPE (v0.5). Tables exist as skeletons but no reducers will be implemented this milestone
- **Match submission timeout handling** — what happens if scores aren't submitted? Belongs in Phase 5 (Match Results) or Phase 10 (Disconnect Handling)
- **Automated check-in system** — not explicitly requested, defer unless needed
- **Cost set CSV import/export** — frontend feature, v1 milestone
- **Bracket modification backward-stepping logic** — complex, may span Phase 3 + Phase 4
- **Synergy cost management UI** — frontend, v1 milestone
- **Season support for cost sets** — schema supports it but logic deferred
- **Auto-unpublish cost set when last lobby closes** — Phase 9 (lobby lifecycle reducers). Phase 3 adds the `isLocked` flag and `lock_cost_set` reducer; Phase 9 wires the lobby close reducer to check if a locked cost set has zero active lobbies and auto-unpublishes it.

</deferred>

---

*Phase: 03-tournament-system*
*Context gathered: 2026-03-17*
