---
gsd_state_version: 1.0
milestone: v0.5
milestone_name: milestone
current_phase: 04.1
current_plan: 3 of 3 (complete)
status: planning
last_updated: "2026-03-20T16:39:51.261Z"
progress:
  total_phases: 11
  completed_phases: 5
  total_plans: 15
  completed_plans: 15
---

# Session State

## Project Reference

See: .planning/PROJECT.md

## Position

**Milestone:** v0.5 milestone
**Current phase:** 04.1
**Current plan:** 3 of 3 (complete)
**Status:** Ready to plan

## Decisions

- [02-roster-management] Used id.update() for Archetype upsert — unique index accessor lacks update() method in SpacetimeDB SDK
- [02-roster-management] HsrAccountLightcone not cascaded in user deletion — lightcone reducers descoped from Phase 2
- [02-roster-management] costSetId=0 is the sentinel for the default cost set; existing rows implicitly belong to set 0
- [02-roster-management] Atomic validate-then-write pattern applied to all batch operations — Phase 1 validates ALL before Phase 2 writes ANY
- [02-roster-management] Number() cast on BigInt subtraction in sort comparator for auto-activate oldest account
- [03-tournament-system] Moderator role level 75 — between Admin (100) and TournamentHost (50); accepted by admin_update_user automatically via Object.keys(Role.variants) (TRNT-01)
- [03-tournament-system] Paused stage removed from TournamentStage — stage machine is forward-only; pausing handled at application level
- [03-tournament-system] CostSetDraft* tables private (no public:true) — draft cost edits not broadcast to clients until published
- [03-tournament-system] winnerAdvantage (u8) replaces grandFinalsAdvantage (bool) — allows 0/1/2/3+ game head-starts
- [03-tournament-system] TournamentTeam is tournament-scoped/ephemeral; differs from Team which is persistent org-level
- [Phase 03-tournament-system]: Moderator role level 75 — between Admin (100) and TournamentHost (50); accepted by admin_update_user automatically via Object.keys(Role.variants) (TRNT-01)
- [03-cost-sets] iter() used in per-user draft views — no cross-table (creatorId, costSetId) index; Set<id> membership check used after filtering CostSet by creatorId
- [03-cost-sets] publish_cost_set preserves audit history via auditUpdate when live row already exists (supports republishing after edit)
- [03-cost-sets] HsrSynergyCost uses id.update() on publish (autoInc PK); character/lightcone use delete+insert (composite PK)
- [03-cost-sets] unpublish_cost_set does NOT delete live cost rows — only toggles isPublished/isLocked metadata; rows persist until delete_cost_set
- [Phase 03-tournament-system]: teamGroupId=0 sentinel in reducer args (u32 not optional) — mirrors costSetId=0 pattern; simplifies client calls
- [Phase 03-tournament-system]: minimumMmr enforcement deferred to Phase 5 — MMR tables exist but rating calculation not yet implemented
- [03-match-results] winnerId=0 sentinel for draw — submit_match_result and override_match_result map 0 to undefined stored value
- [03-match-results] disputeReason reused to store override reason in override_match_result — keeps schema minimal
- [03-match-results] submit_match_result is record-only in Phase 3 — MMR (Phase 5) and bracket advancement (Phase 4) triggered by downstream processes
- [03-match-results] Referee auto-assignment at lobby creation deferred to Phase 9 — Phase 3 only implements transfer and reclaim
- [Phase 03-tournament-system]: TEAM-01/02/03 reclassified Out of Scope for v0.5 — tournament-scoped teams (TEAM-04) cover Phase 3 needs; persistent teams deferred to v1+
- [Phase 03-tournament-system]: set_coach and remove_coach placed in refereeManagement.ts — same permission model as referee flag (host or referee); pick/ban guard deferred to Phase 9
- [04-bracket-schema]: bracketSide (BracketSide enum, 5 variants) replaces isLosersBracket (bool) on BracketMatch — supports GrandFinals, ThirdPlace, Group not expressible as bool
- [04-bracket-schema]: seedNumber moved from TournamentParticipant to TournamentTeam — seeding is a team-level concept
- [04-bracket-schema]: GroupStanding uses participantTeamId instead of participantUserId — standings track teams, not individual players
- [04-bracket-schema]: Solo tournaments auto-create invisible TournamentTeam on register_for_tournament — bracket generation treats all participants as teams uniformly
- [04-bracket-schema]: MatchResultParticipant junction table added for 2v2/3v3 participant tracking beyond the 2-user limit of MatchResultRecord.player1Id/player2Id
- [Phase 04-bracket-generation-and-advancement]: Deterministic seeding hash (tournamentId * 31 + teamId) % 2147483647 for random mode — SpacetimeDB reducers must be deterministic; no Math.random()
- [Phase 04-bracket-generation-and-advancement]: submit_and_advance_bracket re-reads bracketMatch after update for fresh state in auto-advance logic
- [Phase 04-bracket-generation-and-advancement]: dq_participant auto-advance is inline code, not a reducer call -- keeps it atomic in one transaction
- [Phase 04.1]: PlayerSnapshot struct KEPT in structs.ts per user decision -- will be used when history archival is implemented
- [Phase 04.1]: winnerTeamSide on MatchResultGame is TeamLabel (required, not optional) -- per-game winner is determined at recording time
- [Phase 04.1]: submit_match_result reducer arg renamed winnerId->winnerUserId to avoid confusion with BracketMatch.winnerTeamId
- [Phase 04.1]: override_match_result validates winnerId against MatchResultParticipant instead of removed player1Id/player2Id
- [Phase 04.1]: PlayerSnapshot references retained as historical context in match-session docs (not current table)

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260318-2ci | Restructure test suite and build post-publish bootstrap | 2026-03-18 | unstaged | [260318-2ci](./quick/260318-2ci-restructure-test-suite-and-build-post-pu/) |
| 260318-6kx | Update test-suite references to uat in planning files | 2026-03-18 | unstaged | [260318-6kx](./quick/260318-6kx-update-test-suite-references-to-uat-in-p/) |
| 260318-94t | Migrate feature docs to centralized docs/ directory | 2026-03-18 | unstaged | [260318-94t](./quick/260318-94t-migrate-feature-docs-to-centralized-docs/) |
| 260318-r63 | Add multi-column btree indexes to 19 composite PK tables, migrate filter+find patterns | 2026-03-19 | 310f9b5 | [260318-r63](./quick/260318-r63-add-multi-column-btree-indexes-to-compos/) |
| 260319-39z | Organize unstaged files into logical commits | 2026-03-19 | dc7eb25 | [260319-39z](./quick/260319-39z-organize-unstaged-files-into-logical-com/) |

## Accumulated Context

### Roadmap Evolution

- Phase 04.1 inserted after Phase 04: Schema Normalization & Match Result Rework (URGENT)

## Session Log

- 2026-03-16: STATE.md regenerated by /gsd:health --repair
- 2026-03-16: Completed 02-01-PLAN.md — schema foundation for roster reducers
- 2026-03-16: Completed 02-02-PLAN.md — 16 roster reducers, module published, bindings generated
- 2026-03-17: Completed 03-01-PLAN.md — schema foundation for tournament system (enums, 6 new tables, permission helpers, module published with --clear-database)
- 2026-03-17: Completed 03-03-PLAN.md — 8 cost set reducers (draft/publish/lock/unpublish/delete), 4 per-user draft cost views, cost-sets architecture docs
- 2026-03-17: Completed 03-02-PLAN.md — 14 tournament reducers (4 management, 4 registration, 6 teams), tournament architecture docs, published to maincloud
- 2026-03-17: Completed 03-04-PLAN.md — 11 reducers (2 referee, 3 match result, 6 tournament admin), all Phase 3 reducers live on maincloud, 34 bindings generated
- 2026-03-17: Completed 03-05-PLAN.md — gap closure: TEAM-01/02/03 reclassified Out of Scope, set_coach+remove_coach reducers implemented, Phase 3 fully complete
- 2026-03-18: Completed 04-01-PLAN.md — schema foundation for bracket generation: BracketSide enum, 7 table schema changes, MatchResultParticipant junction table, stage transition guards, solo auto-team creation, display name lazy sync
- 2026-03-18: Completed 04-02-PLAN.md — bracket generation algorithms: foldSeeding, circleSchedule, snakeSeedIntoGroups, single/double/group/hybrid bracket helpers, generate_bracket/seed_bracket/swap_seeds reducers
- 2026-03-18: Completed 04-03-PLAN.md — bracket advancement: advance_bracket_match/submit_and_advance_bracket/rollback_bracket_match reducers, dq_participant auto-advance, group standings Win=2/Draw=1/Loss=0, published to maincloud
- 2026-03-19: Completed quick task 260318-r63 — 19 multi-column btree indexes added to composite PK tables, 11 reducer/helper files migrated from filter+find to filter([v1,v2])[0], published to maincloud, 32/32 tests pass
- 2026-03-20: Completed 04.1-01-PLAN.md — schema definitions: MatchOutcome/MatchType enums, 10 table reworks, 2 new tables (PlayerRelationship, MatchParticipantHistory), BracketMatchDescriptor renamed
- 2026-03-20: Completed 04.1-02-PLAN.md — reducer migration: 6 reducer/helper files updated with new column names, MatchResultParticipant-based confirmation, stub reducers, published to maincloud, 25/25 tests pass
- 2026-03-20: Completed 04.1-03-PLAN.md — doc updates: 11 files updated with new column names + behavioral narratives (lifecycle, captain confirmation, tournament MMR timing, composite PKs, junction patterns), Phase 04.1 complete
