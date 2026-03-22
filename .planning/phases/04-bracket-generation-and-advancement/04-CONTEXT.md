# Phase 4: Bracket Generation and Advancement - Context

**Gathered:** 2026-03-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Pre-generate bracket structures as individual BracketMatch rows with explicit FK links (nextWinnerMatchId, nextLoserMatchId), handle seeding (manual + MMR-based), and auto-advance winners when match results are confirmed. Supports single elimination, double elimination, group phase (round-robin), and hybrid formats (group into elimination). Backend only — tables, reducers, helpers.

</domain>

<decisions>
## Implementation Decisions

### BracketSide Enum (replaces isLosersBracket bool)
- **Replace `isLosersBracket: bool` with `bracketSide` enum**: 5 variants — `Winners`, `Losers`, `GrandFinals`, `ThirdPlace`, `Group`
- This is a **destructive schema change** — requires `--clear-database` publish
- `GrandFinals` is distinct because it has `winnerAdvantage` logic
- `ThirdPlace` is for consolation matches between semifinal losers (controlled by `Tournament.has3rdPlaceMatch`)
- Group phase matches use `bracketSide = Group` + `groupId` set — same BracketMatch table, no separate table. Invariant: `bracketSide = Group` if and only if `groupId` is set. Enforcement is in the `generate_bracket` reducer.

### Grand Finals (Double Elimination)
- **Single match with advantage** — 1 BracketMatch row with `bracketSide = GrandFinals`
- Winners bracket finalist starts games up based on `winnerAdvantage` value (e.g., 1 = starts 1-0 in the best-of series)
- No reset bracket (two potential matches) — the advantage already represents the "extra life"
- `BracketMatch.winnerAdvantage` (u8) already exists on the table — `generate_bracket` copies the value from `Tournament.winnerAdvantage` into the GrandFinals match row. TO can override it per-match if needed.

### 3rd Place Match
- `Tournament.has3rdPlaceMatch: bool` controls generation
- When enabled, `generate_bracket` creates an extra BracketMatch with `bracketSide = ThirdPlace`
- Semifinal losers are auto-placed into this match via `nextLoserMatchId` on the semifinal matches

### Auto-Advancement Logic
- **Separate reducer**: `advance_bracket_match(bracketMatchId)` — tournament-specific, lives in its own reducer file
- **`submit_match_result` is NOT modified** — it stays generic (works for casual and tournament matches). Phase 3 code comment explicitly says "bracket advancement is triggered by separate downstream processes."
- **`Tournament.autoAdvanceBracket: bool`** controls behavior:
  - If true: a wrapper reducer `submit_and_advance_bracket(matchResultId)` calls `submit_match_result` logic + `advance_bracket_match` in one transaction. Frontend calls this for tournament matches instead of `submit_match_result` directly.
  - If false: TO calls `advance_bracket_match` manually after reviewing the result
- **Winner ID mapping**: `MatchResultRecord.winnerId` is a userId. `BracketMatch.participant1Id/2Id` are teamIds. The advancement reducer maps: winnerId (userId) → TournamentParticipant (by tournamentId + userId) → teamGroupId → places that teamId in the next BracketMatch participant slot.
- **BYE handling**: When `generate_bracket` creates a match with only 1 participant (other slot null), that participant is auto-advanced immediately. BYE match row still exists (winnerId pre-set) for bracket display.
- **DQ handling**: When `dq_participant` is called, it looks up the participant's current BracketMatch (via tournamentId + teamGroupId scan) and auto-advances the opponent (if `autoAdvanceBracket` is on). The `dq_participant` reducer does NOT currently take a bracketMatchId — the scan finds the active match.
- **Rollback**: One step back only — `rollback_bracket_match(bracketMatchId)` clears winnerId, reverses advancement, resets next match's participant slot. Only allowed during InProgress stage. To check `mmrProcessedAt`, the reducer looks up `MatchResultRecord` via `MatchResultRecord.bracketMatchId` (not on BracketMatch itself) — if set, throws error "Cannot rollback MMR-processed match." MMR reversal deferred to Phase 5.

### Seeding Strategy
- **Two modes**: Seed by gameMode MMR, or random seeding. Tournament setting controls which.
- Auto-seed sorts participants by their `MmrRating` for the tournament's `defaultGameMode`. Highest MMR = seed 1. No MMR = seeded last (random among themselves).
- **Odd participant counts**: Allow odd brackets (don't pad to power of 2). Top seeds get byes. BYE slots have `participant2Id = null`.
- **Manual adjustment during Seeding stage**: `swap_seeds(tournamentId, teamId1, teamId2)` — swaps their `seedNumber` values and bracket slot positions. Works as drag-and-drop on frontend. Only allowed during Seeding stage. NOTE: `seedNumber` currently lives on `TournamentParticipant` — Phase 4 moves it to `TournamentTeam` since seeding is per-team (even solo players are teams). The column on `TournamentParticipant` is removed.
- **Auto-team formation for solo players in team tournaments**: TO can enable random team formation. Solo players opt-in via `TournamentParticipant.allowRandomTeamAssignment: bool` (default false). System groups opt-in solos into teams, preferring **same HSR account region**. This runs during seeding.
- MMR magnitude function (underdog gains more, favorite gains less) is standard ELO and belongs in **Phase 5**, not Phase 4.

### Participant IDs on BracketMatch
- `participant1Id` / `participant2Id` / `winnerId` = **always `TournamentTeam.id`**
- Even solo players get an auto-created `TournamentTeam` during registration (name = player's displayName, captainUserId = player)
- No denormalized display labels on BracketMatch — `TournamentTeam.name` is the single source of truth for display
- Calendar viewers subscribe to TournamentTeam (filtered by tournamentId) to resolve names — minimal bandwidth

### Team Name Rules
- **Solo + not anonymous**: Team name forced to player's displayName. If player updates displayName, team name updates too (lazy sync in `update_display_name` reducer).
- **Solo + anonymous**: Player can freely edit team name (acts as their alias).
- **Team + not anonymous**: Captain can edit team name. Frontend shows team members on hover.
- **Team + anonymous**: Captain can edit team name. Frontend does NOT show team members on hover. (Data-layer enforcement via view deferred — see Deferred Ideas.)

### Group Phase Mechanics
- **Point system**: Win = 2, Draw = 1, Loss = 0
- **Tiebreaker**: Head-to-head result first. If they drew, fall back to game differential (total games won minus lost across all group matches).
- **Group size**: `Tournament.groupSize: u8` (min 3). System auto-calculates group count = ceil(participants / groupSize). Remainder players distributed to grow some groups (no group smaller than groupSize).
- **Auto assignment** (groupAssignmentMode = Auto): Snake seeding across groups — seed 1→N go to groups A→N, next seeds go N→A (reversed), repeat. Ensures balanced group strength.
- **Advancement**: `Tournament.groupAdvanceCount: u8` (already exists) — top 1 or top 2 per group advance.
- **Group-to-elimination seeding**: Group winners get top seeds in elimination bracket, 2nd place gets middle seeds. Snake seeding across groups (Group A winner vs Group D runner-up).

### Bracket Regeneration
- `generate_bracket` during Seeding stage **deletes all existing BracketMatch rows** for the tournament and recreates them (full regenerate). Only allowed during Seeding stage (no matches played yet).

### generate_bracket Reducer Design
- **One reducer**: `generate_bracket(tournamentId)` reads `Tournament.format` and branches internally to the appropriate generation logic. Internal helpers per format.
- Hybrid formats (GroupIntoSingleElim, GroupIntoDoubleElim) generate group matches first, then the elimination bracket structure with empty participant slots that get filled when groups complete.

### Stage Transition Guards
- **Registration → Seeding**: At least 2 active (non-waitlisted, non-withdrawn) participants required. For team tournaments: at least 2 complete teams.
- **Seeding → InProgress**: Strict validation — bracket MUST be generated (BracketMatch rows exist). All first-round matches must have participants assigned. For group phase: all groups must have GroupStanding rows. Blocks transition if missing.

### New Schema Changes (Phase 4) — all destructive, requires `--clear-database`
- `BracketMatch.bracketSide`: BracketSide enum (replaces `isLosersBracket: bool`)
- `Tournament.groupSize`: u8 (min 3, target group size for round-robin) — **new column**
- `Tournament.has3rdPlaceMatch`: bool — **new column**
- `Tournament.autoAdvanceBracket`: bool — **new column**
- `TournamentParticipant.allowRandomTeamAssignment`: bool (default false) — **new column**
- `TournamentParticipant.seedNumber`: **removed** — moves to TournamentTeam (seeding is per-team, not per-participant)
- `TournamentTeam.seedNumber`: u32 optional — **new column** (replaces the one on TournamentParticipant)
- `GroupStanding.participantTeamId`: u32 — **renamed from `participantUserId`** — all participant references in bracket context are TournamentTeam.id, not userId. PK becomes `[tournamentId, groupId, participantTeamId]`
- **NEW TABLE: `MatchResultParticipant`** — junction table linking match results to all participants. PK `[matchResultId, userId]`, columns: `teamSide` (TeamLabel enum — Blue/Red), indexes on `match_result_id` and `user_id`. Solves the 2v2/3v3 problem where `MatchResultRecord.player1Id/player2Id` only hold 2 userIds but team matches have 4-6 players. Phase 5 MMR uses this to credit all participants. `player1Id`/`player2Id` on MatchResultRecord remain for backward-compatible 1v1 lookups.

### MatchResultRecord and Team Matches
- `MatchResultRecord.player1Id` / `player2Id` represent one user per side — sufficient for 1v1
- For 2v2/3v3 (casual, ranked, or tournament): `MatchResultParticipant` junction table records ALL participants per match with their team side
- `winnerId` on MatchResultRecord represents the winning SIDE's captain/first player — but the actual winning team is determined by `teamSide` matching `winnerId`'s side
- Phase 5 MMR iterates `MatchResultParticipant` rows to credit all players on the winning/losing side
- `team1Confirmed` / `team2Confirmed` — any member on that side can confirm (not just captain)

### Bracket Display Data
- **Frontend computes** from BracketMatch rows — no backend metadata table needed. Rows have roundNumber, matchNumber, bracketSide. Frontend groups by round and renders.

### Bandwidth Strategy
- Clients subscribe to BracketMatch **filtered by tournamentId** — only for the tournament being viewed
- Non-viewers don't receive bracket data
- BracketMatch rows are small (~90 bytes each) — even a 64-player double elim (127 rows) is ~11 KB per subscriber

### Claude's Discretion
- Internal helper organization for bracket generation (separate files per format or one file with functions)
- Index strategy for new bracketSide column
- Exact logic for snake seeding distribution algorithm
- How to handle hybrid format transition (group → elimination) when groups complete at different times
- Error messages and validation details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tournament tables (existing schema)
- `spacetimedb/src/tables/bracketMatch.ts` — BracketMatch table (needs bracketSide column replacing isLosersBracket)
- `spacetimedb/src/tables/groupStanding.ts` — GroupStanding table for round-robin tracking
- `spacetimedb/src/tables/tournament.ts` — Tournament table (needs groupSize, has3rdPlaceMatch, autoAdvanceBracket columns)
- `spacetimedb/src/tables/tournamentParticipant.ts` — TournamentParticipant (needs allowRandomTeamAssignment column)
- `spacetimedb/src/tables/tournamentTeam.ts` — TournamentTeam (participant references always point here)

### Existing reducers (Phase 3) — read before modifying
- `spacetimedb/src/reducers/tournamentManagement.ts` — advance_tournament_stage (needs stage transition guards updated)
- `spacetimedb/src/reducers/tournamentRegistration.ts` — register_for_tournament (needs auto-team creation for solo tournaments)
- `spacetimedb/src/reducers/matchResultSubmission.ts` — submit_match_result (DO NOT modify — stays generic. Phase 3 comment line 123 explicitly says "bracket advancement is triggered by separate downstream processes." New wrapper reducer handles tournament-specific flow.)
- `spacetimedb/src/reducers/tournamentAdmin.ts` — dq_participant (needs auto-advance opponent logic — must scan BracketMatch by tournamentId to find participant's active match)
- `spacetimedb/src/reducers/tournamentTeams.ts` — create_tournament_team (has guard blocking solo tournaments — auto-team creation goes in register_for_tournament instead, not here)
- `spacetimedb/src/reducers/profile.ts` — update_display_name (needs lazy sync to TournamentTeam.name for solo non-anonymous tournaments)

### Match and lobby tables
- `spacetimedb/src/tables/matchResult.ts` — MatchResultRecord (bracketMatchId FK for tournament matches). NOTE: player1Id/player2Id/winnerId are USER IDs, not team IDs. Advancement reducer must map winnerId → TournamentParticipant.teamGroupId → BracketMatch participant slot. mmrProcessedAt lives here (not on BracketMatch) — rollback reducer must look up MatchResultRecord via bracketMatchId.
- `spacetimedb/src/tables/matchResultParticipant.ts` — **NEW in Phase 4**. Junction table linking match results to all participants for 2v2/3v3 support. PK: [matchResultId, userId]. Columns: teamSide (TeamLabel enum).
- `spacetimedb/src/tables/lobby.ts` — Lobby (bracketMatchId FK — lobby linkage deferred to Phase 9)

### Helpers
- `spacetimedb/src/helpers/tournamentHelpers.ts` — validateStageTransition (needs guard logic for Registration→Seeding and Seeding→InProgress)
- `spacetimedb/src/helpers/ensurePermissions.ts` — Permission checks for bracket operations
- `spacetimedb/src/helpers/auditColumns.ts` — auditInsert/auditUpdate for new rows

### MMR (for auto-seeding)
- `spacetimedb/src/tables/mmrRating.ts` — MmrRating table (read-only in Phase 4, used for seeding sort)

### Architecture docs
- `docs/brackets/architecture.md` — Bracket architecture docs (needs update for bracketSide enum, new flows)
- `docs/tournament/architecture.md` — Tournament system docs (needs bracket generation section)

### Phase 3 context (prior decisions)
- `.planning/phases/03-tournament-system/03-CONTEXT.md` — Tournament lifecycle, registration rules, team formation, cost set management

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ensureTournamentAccess(ctx, tournamentId)`: Returns `{user, tournament}` if caller is Mod+, organizer, or assistant — reuse for bracket operation permission checks
- `validateStageTransition(currentTag, nextTag)`: Forward-only stage transitions — extend with guard logic for Registration→Seeding and Seeding→InProgress
- `auditInsert()` / `auditUpdate()`: Apply to all new BracketMatch and GroupStanding rows
- Admin proxy pattern from `rosterAdmin.ts`: Template for bracket admin reducers if needed

### Established Patterns
- Composite PK delete+insert for updates (TournamentParticipant, LobbyMember) — same pattern for updating BracketMatch participant slots
- `ctx.db.Table.index_accessor.filter(value)` for indexed lookups — BracketMatch.tournament_id.filter(tournamentId) for all bracket matches in a tournament
- TournamentTeam auto-increment ID — participant IDs on BracketMatch reference this

### Integration Points
- `register_for_tournament` needs modification to auto-create TournamentTeam for solo tournaments (bypass `create_tournament_team`'s solo guard — use direct insert instead)
- `submit_match_result` is NOT modified — new `submit_and_advance_bracket` wrapper reducer handles tournament-specific flow when `autoAdvanceBracket` is true
- `dq_participant` needs to scan BracketMatch rows by tournamentId to find participant's active match, then auto-advance opponent
- `advance_tournament_stage` needs guard logic updates for Registration→Seeding and Seeding→InProgress transitions
- `update_display_name` (profile.ts) needs lazy sync to TournamentTeam.name for active solo non-anonymous tournaments
- Advancement reducer must map userId→teamId: MatchResultRecord.winnerId (userId) → TournamentParticipant (tournamentId + userId) → teamGroupId → BracketMatch participant slot

</code_context>

<specifics>
## Specific Ideas

- TO can swap seeds during Seeding stage — frontend should present this as drag-and-drop
- Solo player team name = their displayName, synced on name change — the team is invisible to the user, just an implementation detail
- Random team formation for solo players in team tournaments prefers same HSR account region for latency reasons
- BYE matches still exist as rows for bracket display — they just have winnerId pre-set and one null participant slot
- Group standings use Win=2, Draw=1, Loss=0 (not the more common Win=3)

</specifics>

<deferred>
## Deferred Ideas

- **MMR reversal on bracket rollback** — Phase 5 (Match Results and MMR). Phase 4 blocks rollback if mmrProcessedAt is set.
- **MMR magnitude function** (underdog gains more, favorite gains less) — Phase 5 (standard ELO calculation)
- **Lobby creation/linkage for bracket matches** — Phase 9 (lobby lifecycle reducers). BracketMatch.lobbyId stays null until then.
- **Anonymous team membership view** — Phase 6 (Anonymous Play). TournamentParticipant stays public for now. A view that nulls teamGroupId for non-privileged viewers in anonymous tournaments is the recommended approach when enforced. No --clear-database needed to add views later.
- **Tournament archiving** — Future optimization. Moving completed tournament data to archive tables when storage becomes a concern. History tables (89% of storage) would be the first archive target, not BracketMatch.
- **Bracket display metadata** — Frontend computes bracket structure from BracketMatch rows. If frontend complexity becomes an issue, consider a BracketMetadata table later.

</deferred>

---

*Phase: 04-bracket-generation-and-advancement*
*Context gathered: 2026-03-17, updated 2026-03-18 (contradiction resolution)*
