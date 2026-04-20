# Phase 6: Anonymous Play and Player Stats - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Server-enforced anonymous mode at the data write layer, complete player statistics tracking (per-character, per-opponent, bans, spectated), match history archival with self-contained denormalized tables, ownership enforcement helper, season foundation, and schema future-proofing (PK changes requiring --clear-database).

Requirements: ANON-01 through ANON-04, STAT-01 through STAT-08

</domain>

<decisions>
## Implementation Decisions

### Anonymous Write-Layer Enforcement
- **D-01:** Sentinel userId (0) + anonymousLabel on real-time tables only: LobbyCursorEvent, MatchSessionStep, ChatMessage. Server resolves identity from ctx.sender for auth, then writes userId=0 and anonymousLabel to the row. Clients cannot see real identity.
- **D-02:** History tables (MatchParticipantHistory, MatchSessionStepHistory) keep real userIds — identity revealed in replay after match ends
- **D-03:** Match result tables (MatchResultParticipant, MatchResultRecord) keep real userIds — server-internal ephemeral records, not player-facing
- **D-04:** Team-based labels: "Blue-1", "Blue-2", "Red-1", "Red-2", "Spectator-1", "Coach-Blue"
- **D-05:** Labels deterministically computed from team side + member join order. No new table — same LobbyMember data always produces same label. Stable across reconnects.
- **D-06:** Anonymous override flows from tournament through isTournamentControlled. Tournament's isAnonymousDefault propagates to lobby via tournament-controlled inheritance. No separate override column needed.
- **D-07:** isAnonymousPlayers and isAnonymousSpectators are independent toggles (existing Lobby columns). Separate control for players vs spectators.
- **D-08:** Anonymous mode is a lobby configuration set at creation, locked after. Host controls it, not referee. Referee operates within the lobby config.
- **D-09:** Tournament bracket anonymization is client-side (courtesy, not security boundary). Client shows "Seed-N" labels when tournament.isAnonymousDefault is true. Tables stay public — 4-table cross-reference needed to deanonymize (acceptable for savvy users).

### Roster Visibility Enforcement (ANON-04)
- **D-10:** Lobby.isOpenRoster (bool) upgraded to rosterVisibility (RosterVisibility enum: OpenRoster, ClosedWithRating, ClosedNoRating) for parity with Tournament
- **D-11:** OpenRoster: all participants + referee can see everyone's owned characters via UI toggle
- **D-12:** ClosedWithRating: each player sees own + allies' rosters. Opponents' rosters hidden. Opponents' accountRating visible.
- **D-13:** ClosedNoRating: each player sees own + allies' rosters. Opponents' rosters AND accountRating hidden.
- **D-14:** Referee always sees all rosters regardless of lobby setting — needed to officiate fairly
- **D-15:** Server-side per-user view for roster visibility enforcement. View resolves ctx.sender -> team side -> lobby visibility setting. Returns own+allies rosters always, opponent data per mode. Referee flag overrides to full visibility. Reversible to client-side later with no wipe.
- **D-16:** All visibility rules apply to spectators as well

### Ownership Enforcement
- **D-17:** requireOwnership bool on Lobby (default true). When true, pick reducer validates picks against HsrAccountCharacter. When false (practice/casual), any character allowed.
- **D-18:** Auto-defaults from matchType: Casual=false, Ranked=true. Host can override at lobby creation. Locked once created.
- **D-19:** Tournament lobbies inherit requireOwnership from tournament.requireRoster (separate concepts: requireRoster gates signup eligibility, requireOwnership gates draft enforcement)
- **D-20:** Phase 6 builds ownership validation HELPER function (checks HsrAccountCharacter). Phase 9 wires it into pick/ban reducers when they're built (pick reducers don't exist yet).
- **D-21:** TournamentPlayerAccount junction table: at registration, player locks in which HSR accounts they'll use. During tournament matches, pick validation checks against registered accounts, not whatever account is active at match time.

### Character Stats (STAT-05, STAT-06)
- **D-22:** PlayerCharacterStat gets 4 new columns: timesBannedInMatch (u32), timesFaced (u32), winsAgainst (u32), lossesAgainst (u32)
- **D-23:** timesBannedInMatch incremented for ALL participants when any character is banned — answers "how available is this character in my matches?" not "how often do I personally ban this character"
- **D-24:** timesFaced/winsAgainst/lossesAgainst track performance AGAINST opponents who pick that character — answers "which characters do I struggle against most?"
- **D-25:** Full character-vs-character matchup matrix (my X vs their Y) deferred — faced-against columns sufficient for drafting decisions
- **D-26:** Architecture is mirror-pick safe — if both sides pick the same character, both "picked" and "faced" counters fire on the same row. Independent columns, no conflict.
- **D-27:** Bans excluded from pick stats — only picked characters count for matchesPlayed/wins/losses
- **D-28:** Classic Pick and Auction WinBid both map to the same "pick" stat increment. draftMode in PK keeps them separate.
- **D-29:** Ban stat semantics split: PlayerCharacterStat.timesBannedInMatch = personal experience ("character was banned in my matches"). GlobalCharacterStat.timesBanned = community meta ("Acheron is most banned character").

### Spectated Count (STAT-02)
- **D-30:** matchesSpectated incremented at finalization for spectators present in the lobby when match concludes
- **D-31:** Spectator identities NOT preserved in MatchParticipantHistory — only the count increments on PlayerStat
- **D-32:** Follows PK pattern — breaks down per gameMode/draftMode/seasonId/matchType/teamSize

### Stats Architecture
- **D-33:** Stat tables (PlayerStat, PlayerCharacterStat, PlayerRelationship) are PRIVATE with per-user view. Stats visibility follows user's roster visibility setting (same toggle). Profile page: user's own setting controls visibility. In-match: lobby/tournament rosterVisibility overrides.
- **D-34:** GlobalCharacterStat table (public) for community aggregates — pick rate, ban rate, win rate per character. Lives on Leaderboard page (~30KB). Incremented during finalization alongside individual stats.
- **D-35:** No season 0 all-time bucket — client sums across all seasons for career/all-time stats. Avoids doubling writes and row count on PlayerCharacterStat (largest stat table).
- **D-36:** No stat rollback on disputes. Disputes resolved BEFORE finalization (stats not yet written). Post-finalization corrections are rare admin cases — manual compensation if ever needed.
- **D-37:** Casual matches auto-finalize: submit_match_result runs finalize logic inline for casual matches (same transaction). No gap between submit and finalize. Extract finalize logic into shared helper callable by both submit (casual) and finalize_match_result (ranked/tournament).

### PK Future-Proofing
- **D-38:** PlayerStat PK: [userId, gameMode, draftMode, seasonId, matchType, teamSize]
- **D-39:** PlayerCharacterStat PK: [userId, characterName, gameMode, draftMode, seasonId, matchType, teamSize]
- **D-40:** PlayerRelationship PK: [userId, otherUserId, gameMode, draftMode, seasonId, matchType, teamSize]
- **D-41:** MmrRating PK: [userId, gameMode, seasonId] — no matchType/teamSize (MMR is one rating per mode per season, ranked-only)
- **D-42:** Leaderboard PK: [category, rank, seasonId]
- **D-43:** MmrHistory: no PK change (append-only, autoInc)
- **D-44:** Requires --clear-database. Acceptable — no real user data yet.
- **D-45:** seasonId defaults to 0 for pre-season matches. Not an all-time aggregate — just means match played before seasons launched.
- **D-46:** MMR is ranked-only. No "MMR for casual players" concept exists.

### Season Foundation
- **D-47:** Full Season table (not single-row config): id (autoInc PK), name (string, e.g. "Patch 3.0"), startDate (timestamp), endDate (timestamp, optional — null = current), isActive (bool), audit columns
- **D-48:** Admin creates seasons, marks one active. Finalization reads active season from Season table.
- **D-49:** No costSetId link on Season table. Seasons and cost sets are independent — cost updates happen in place on the default cost set each patch.

### Match Replay Archival (STAT-07, STAT-08)
- **D-50:** MatchSessionStepHistory repurposed from single JSON blob to individual step rows: [matchHistoryId, sequence, actorUserId, actorDisplayName, teamSide, action, characterName, payload]. One row per draft step.
- **D-51:** MatchResultGameHistory new table — mirrors MatchResultGame columns, swaps matchResultId for matchHistoryId. PK: [matchHistoryId, gameNumber]. Preserves per-game/per-boss scores after ephemeral deletion. Handles variable boss counts (2-3+) by row count.
- **D-52:** rosterBlue/rosterRed dropped from MatchSessionHistory — step rows with action=Pick serve this purpose. No JSON blobs.
- **D-53:** History tables denormalize display names for self-containment: MatchParticipantHistory gets displayName column, MatchSessionStepHistory gets actorDisplayName. userId/actorUserId kept alongside for future joins. Zero lookups for replay rendering.
- **D-54:** Finalization reads MatchSessionStep rows once — used for both stat increments (picks/bans/faced) and step history archival.
- **D-55:** Four history tables, all flat structured rows, zero JSON: MatchSessionHistory (match summary), MatchParticipantHistory (who played), MatchSessionStepHistory (draft steps), MatchResultGameHistory (scores)

### Finalization Pipeline
- **D-56:** 18-step pipeline. Reads 1-6 (authority, match data, participants, games, lobby, steps, active season), writes 7-18 (history rows, step archival, score history, participant history, MMR, player stats, character stats, relationships, global stats, leaderboard, bracket advance, ephemeral cleanup). Single transaction — full rollback on failure.

### Schema Cleanup (bundled with --clear-database)
- **D-57:** Remove rosterBlue/rosterRed from MatchSessionHistory
- **D-58:** Repurpose MatchSessionStepHistory columns (JSON blob -> individual row columns)
- **D-59:** Upgrade Lobby.isOpenRoster (bool) -> rosterVisibility (RosterVisibility enum)
- **D-60:** Add seasonId to MmrRating PK
- **D-61:** Add requireOwnership to Lobby table
- **D-62:** Add anonymousLabel to LobbyCursorEvent and MatchSessionStep
- **D-63:** Add 4 new columns to PlayerCharacterStat (timesBannedInMatch, timesFaced, winsAgainst, lossesAgainst)
- **D-64:** Add displayName to MatchParticipantHistory, actorDisplayName to MatchSessionStepHistory
- **D-65:** Update 38 existing tests to match new PK shapes within Phase 6 execution

### Claude's Discretion
- Exact reducer signatures for Season admin (create_season, set_active_season)
- GlobalCharacterStat table schema details and index strategy
- TournamentPlayerAccount junction table columns and indexes
- Per-user roster visibility view implementation details
- Ownership validation helper function structure
- Finalization helper extraction (shared between submit and finalize_match_result)
- How spectator LobbyMember rows are identified during finalization (teamSide=null or separate flag)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Anonymous play
- `spacetimedb/src/tables/lobby.ts` — Lobby table with isAnonymousPlayers, isAnonymousSpectators, isOpenRoster (to be upgraded to rosterVisibility)
- `spacetimedb/src/tables/tournament.ts` — Tournament table with isAnonymousDefault, isAnonymousSpectators, rosterVisibility, requireRoster
- `spacetimedb/src/tables/lobbyCursorEvent.ts` — LobbyCursorEvent (needs anonymousLabel column)
- `spacetimedb/src/tables/matchSessionStep.ts` — MatchSessionStep (needs anonymousLabel column)
- `spacetimedb/src/tables/chatMessage.ts` — ChatMessage (already has anonymousLabel)
- `spacetimedb/src/tables/lobbyMember.ts` — LobbyMember (team side + join order for label computation)
- `spacetimedb/src/reducers/cursor.ts` — broadcast_cursor (needs anonymous enforcement)

### Player stats
- `spacetimedb/src/tables/playerStats.ts` — PlayerStat table (PK change needed)
- `spacetimedb/src/tables/characterStats.ts` — PlayerCharacterStat table (PK change + 4 new columns)
- `spacetimedb/src/tables/playerRelationship.ts` — PlayerRelationship table (PK change needed)
- `spacetimedb/src/helpers/statsIncrement.ts` — incrementPlayerStat, incrementPlayerRelationship (need updates for new PK columns + new character stat logic)
- `docs/player-stats/architecture.md` — Current stat table design, incremental aggregation pattern (needs retroactive update)

### MMR / Leaderboard
- `spacetimedb/src/tables/mmrRating.ts` — MmrRating (PK change: +seasonId)
- `spacetimedb/src/tables/leaderboard.ts` — Leaderboard (PK change: +seasonId)
- `spacetimedb/src/helpers/leaderboardRebuild.ts` — Leaderboard rebuild logic (needs seasonId awareness)
- `docs/mmr/architecture.md` — ELO model (needs retroactive update for season PK)

### Match results / Finalization
- `spacetimedb/src/reducers/matchFinalization.ts` — finalize_match_result, process_tournament_mmr (major updates needed)
- `spacetimedb/src/reducers/matchResultSubmission.ts` — submit_match_result (auto-finalize casual inline)
- `spacetimedb/src/tables/matchResult.ts` — MatchResultRecord (ephemeral, keeps real userIds)
- `spacetimedb/src/tables/matchResultGame.ts` — MatchResultGame (mirror to MatchResultGameHistory)
- `docs/match-results/architecture.md` — Submission flow (needs retroactive update)
- `docs/match-results/contract.md` — Acceptance scenarios (needs retroactive update)

### History tables
- `spacetimedb/src/tables/matchSessionHistory.ts` — MatchSessionHistory (remove rosterBlue/rosterRed, add nothing)
- `spacetimedb/src/tables/matchSessionStepHistory.ts` — MatchSessionStepHistory (repurpose: JSON blob -> individual rows + displayName)
- `spacetimedb/src/tables/matchParticipantHistory.ts` — MatchParticipantHistory (add displayName)

### Roster / Ownership
- `spacetimedb/src/tables/hsrAccountCharacter.ts` — HsrAccountCharacter (validation source for ownership check)
- `spacetimedb/src/tables/hsrAccount.ts` — HsrAccount (accountRating for ClosedWithRating visibility)
- `spacetimedb/src/types/enums.ts` — RosterVisibility enum, MatchType enum, GameMode enum
- `spacetimedb/src/views/securityViews.ts` — Per-user view pattern (reuse for roster visibility view)

### Tournament (integration)
- `spacetimedb/src/reducers/tournamentManagement.ts` — Registration reducer (needs TournamentPlayerAccount wiring)
- `docs/tournament/architecture.md` — Tournament tables (needs retroactive update)
- `docs/tournament/contract.md` — Tournament lifecycle (needs retroactive update)
- `docs/brackets/architecture.md` — Bracket display (needs client-side anonymization note)

### Archetype (reference)
- `spacetimedb/src/tables/archetype.ts` — Archetype table (Phase 11 dependency)
- `spacetimedb/src/tables/hsrCharacterArchetype.ts` — Character-archetype junction (Phase 11 dependency)

</canonical_refs>

<specifics>
## Specific Ideas

- Anonymous labels follow the Blue/Red team paradigm already established in schema — "Blue-1", "Red-2" etc.
- Ban stats answer "how available is this character in my matches?" not "how often do I ban it" — more actionable for drafting
- Faced-against stats answer "which characters do I struggle against?" which is distinct from "what are my worst characters?"
- History tables are fully self-contained — zero joins for replay rendering. Each table has denormalized display names alongside userId for future extensibility.
- Casual auto-finalize eliminates the gap between submit and finalize — no dispute window needed because both sides already agreed
- Client summation for all-time stats avoids doubling PlayerCharacterStat rows (largest stat table)
- TournamentPlayerAccount prevents mid-tournament account switching (competitive integrity)

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `auditUpdate` / `auditInsert`: Standard audit column pattern — apply to all new tables
- `getAuthenticatedUser` / `isRoleAtLeast`: Permission helpers for admin reducers
- `securityViews.ts`: Per-user view pattern (ctx.sender -> UserIdentity -> userId) — reuse for roster visibility and stat visibility views
- `incrementPlayerStat` / `incrementPlayerRelationship` in `statsIncrement.ts`: Already called from finalization — extend with new PK columns and add character stat increment
- `leaderboardRebuild.ts`: Existing rebuild pattern — extend with seasonId
- Single-row config table pattern (EloConfig): Reuse for Season table admin reducers

### Established Patterns
- Ephemeral tables deleted by finalize_match_result — same pattern for step archival (read, archive, delete)
- Tournament-controlled inheritance via isTournamentControlled + tournamentId FK — reuse for anonymous mode and ownership inheritance
- Composite PK delete+insert pattern — use for stat table upserts with expanded PKs
- Private tables with per-user views — established in securityViews.ts

### Integration Points
- `finalize_match_result`: Major expansion — 18-step pipeline with step archival, character stats, global stats, spectated count
- `submit_match_result`: Modification — auto-finalize casual inline (extract finalize logic to shared helper)
- `register_for_tournament`: Modification — record TournamentPlayerAccount entries at registration
- `broadcast_cursor`: Modification — anonymous label enforcement when lobby is anonymous
- `schema.ts`: New tables (Season, GlobalCharacterStat, TournamentPlayerAccount, MatchResultGameHistory) must be registered
- `index.ts`: New reducers/views must be exported

</code_context>

<deferred>
## Deferred Ideas

- **PlayerArchetypeStat** — Phase 11 (v0.5 scope). Track playstyle stats when 3+ picks share an archetype tag. Follow same PK pattern (seasonId, matchType, teamSize).
- **Full character-vs-character matchup matrix** — [myChar, opponentChar] table. Deferred until frontend UX defines need. Faced-against columns on PlayerCharacterStat cover the primary use case.
- **Cost set historical snapshots per season** — Season table has no costSetId link. If "what were costs in Season 3?" is needed, build a snapshot mechanism in a future phase.
- **Ephemeral data cleanup for abandoned matches** — Phase 9 (lobby lifecycle). Phase 6 only handles stats for finalized matches.
- **Global chat / lobby browser with anonymous mode** — Phase 9 scope.
- **Disconnect + anonymous mode interaction** — Phase 10 scope.
- **Pick/ban reducer wiring for ownership validation** — Phase 9. Phase 6 builds the helper; Phase 9 wires it into pick reducers when they exist.
- **Auto-unpublish cost set when last lobby closes** — Phase 9.
- **Coach pick/ban guard (coach cannot pick)** — Phase 9.
- **Referee auto-assignment at lobby creation** — Phase 9.

## Doc Updates Required

### Retroactive (after Phase 6 execution)
- `docs/match-results/architecture.md` — auto-finalize casual, MatchResultGameHistory, finalization pipeline, requireOwnership
- `docs/match-results/contract.md` — auto-finalize casual scenario, ownership validation
- `docs/player-stats/architecture.md` — major rework: new columns, PK changes, GlobalCharacterStat, private+view, client summation, spectated trigger
- `docs/mmr/architecture.md` — MmrRating/Leaderboard PK changes, Season table
- `docs/tournament/architecture.md` — TournamentPlayerAccount, requireOwnership inheritance, Season table
- `docs/tournament/contract.md` — account locking at registration, anonymous bracket display
- `docs/brackets/architecture.md` — client-side bracket anonymization note

### Forward (future phase awareness)
- Phase 7 context: Season table exists, new stat columns available as achievement criteria
- Phase 9 context: anonymous labels approach, Lobby has RosterVisibility enum, requireOwnership flag, per-user roster view, deferred UAT tests
- Phase 10 context: auto-finalize casual (no disconnect concern), requireOwnership flag
- Phase 11: add to ROADMAP.md and REQUIREMENTS.md (PlayerArchetypeStat, v0.5 scope)

</deferred>

---

*Phase: 06-anonymous-play-and-player-stats*
*Context gathered: 2026-03-21*
