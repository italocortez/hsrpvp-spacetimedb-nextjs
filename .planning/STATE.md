---
gsd_state_version: 1.0
milestone: v0.5
milestone_name: milestone
current_phase: 09
current_plan: 1
status: executing
last_updated: "2026-03-29T12:13:12.864Z"
progress:
  total_phases: 13
  completed_phases: 10
  total_plans: 35
  completed_plans: 33
---

# Session State

## Project Reference

See: .planning/PROJECT.md

## Position

**Milestone:** v0.5 milestone
**Current phase:** 09
**Current plan:** 1
**Status:** Executing Phase 09

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
- [Phase 05-match-results-and-mmr]: EloConfig table flattens struct fields directly into columns (not using EloConfig struct as column type) for single-row config table
- [Phase 05-match-results-and-mmr]: Leaderboard category is string ('MemoryOfChaos', 'ApocalypticShadow', 'AnomalyArbitration', 'Global') -- not adding Global to GameMode enum
- [Phase 05-match-results-and-mmr]: accountRating TEMPORARY formula: each character = 5 × (1 + eidolonLevel), capped at 1000. Wired into batch_upsert/remove_characters and admin variants during UAT. Will be replaced with cost-table-based formula later.
- [Phase 05-match-results-and-mmr]: Captain side enforcement in record_game_scores rejects ALL opposite-side fields (scores, cycles, boss scores, screenshots)
- [Phase 05-match-results-and-mmr]: EloConfigValues uses type-only import to avoid SpacetimeDB build warning (interface erased at runtime)
- [Phase 05-match-results-and-mmr]: bracketAdvancement.ts keeps rollback-specific helpers (removeParticipantFromMatch, reverseGroupStandings) file-local; shared helpers extracted to bracketHelpers.ts
- [Phase 05-match-results-and-mmr]: Fair MMR always applied in Phase 5 -- per-match choice (D-23) deferred to Phase 9/10 when Handicap Play gameplay effects are implemented
- [Phase 05-match-results-and-mmr]: Leaderboard rebuild runs inline within reducer transaction -- acceptable at 100-user scale
- [Phase 06]: Active season lookup via btree index on isActive; seasonId defaults to 0 for pre-season (D-45)
- [Phase 06]: set_active_season deactivates all active seasons before activating target (single-active guarantee)
- [Phase 06]: Used t.object() for RosterVisibilityRow struct type instead of t.product() (which does not exist in SpacetimeDB SDK)
- [Phase 06]: All HSR accounts (not just active) locked at registration per D-21 -- tournament validation checks any locked account
- [Phase 06]: runFinalization extracts processMatchMmr into finalizationHelpers.ts for shared use by finalize and auto-finalize
- [Phase 06]: Character name from StepPayload via variant-specific access (Pick/Ban/AuctionSold/Nominate -> characterName, Bid -> targetCharacter)
- [Phase 06]: GlobalCharacterStat uses by_char_mode 2-col index + post-filter (no full 6-col btree index)
- [Phase 06.1]: NavBar uses usePathname() for selection state — routing is source of truth, no useState needed for nav selection
- [Phase 06.1]: loginGuest() called directly from NavBar LOG IN button — no modal, matches existing Header pattern
- [Phase 06.1]: icon-lucide CDN font replaced with inline SVGs in ContactSection — CSP-safe, no external dependency required
- [Phase 06.1]: page.tsx uses <div> not <main> for landing page container — avoids any global max-width rules on main element
- [Phase 06.1]: icon-lucide CDN font replaced with inline SVGs in ContactSection — CSP-safe, no external dependency required
- [Phase 06.1]: server carousel icons stored as React.ReactNode (JSX) in SERVERS array instead of HTML entity strings
- [Phase 07-achievements-and-titles]: AchievementTriggerType enum dropped; replaced by isManualOnly bool + ComparisonOperator enum for criteria-driven achievement system (D-03, D-07)
- [Phase 07-achievements-and-titles]: AchievementCriteria filter columns (filterGameMode, filterMatchType) use t.string().optional() not enum types — SpacetimeDB enum types do not support .optional()
- [Phase 07-achievements-and-titles]: update_achievement rarity param required (not optional) — AchievementRarity enum type does not support .optional() in SpacetimeDB SDK
- [Phase 07-achievements-and-titles]: Achievement checker uses iter() on Achievement table (admin content <100 rows) and Math.max for MmrRating (best-mode semantics vs sum for PlayerStat)
- [Phase 07-achievements-and-titles]: Moderators have same achievement permissions as Admins EXCEPT delete_achievement (Admin only) and set_displayed_achievement for other users (Admin only)
- [Phase 08-calendar-and-scheduling]: --clear-database required for CalendarEvent/CalendarEventInvite schema additions — SpacetimeDB migration engine requires @default annotations even for optional columns; test database cleared and bootstrap/seed restored
- [Phase 08-calendar-and-scheduling]: BigInt micros as strings for timestamp params in calendar reducers (startAt: t.string()) — avoids u64 encoding issues on client calls
- [Phase 08-calendar-and-scheduling]: Sentinel values for optional recurrence fields — dayOfWeek=255 (not set), dayOfMonth=0 (not set), bracketMatchId=0 (personal event) — u8/u32 reducer params cannot be optional in SpacetimeDB SDK
- [Phase 08-calendar-and-scheduling]: SavedCalendar targetUserId lookup uses iter() in deleteAllCalendarDataForUser — no targetUserId-only index exists on the table
- [Phase 08]: cascade-order: calendar events deleted before bracket matches in cascadeCleanupTournament (D-21) — reads BracketMatch rows to find linked events
- [Phase 09-01]: LobbyGcJob scheduled property omitted — SpacetimeDB rejects module when scheduled reducer is undefined; wired in Plan 05
- [Phase 09-02]: LobbyCursorEvent is an event table — no manual cleanup needed in close_lobby cascade; rows auto-delete after broadcast
- [Phase 09-02]: Empty Waiting lobby auto-closes on last member leave via _hardDeleteLobby — prevents orphaned lobbies
- [Phase 09-02]: canKickOrBan takes caller's LobbyMember row to check isReferee + refereeCanKick against caller, not target
- [Phase 09-04]: presetId client-responsibility: backend validates preset exists, client pre-fills form from preset — avoids server-side merge logic
- [Phase 09-04]: isSystemPreset admin-only in ensureCanMutatePreset — Moderators can edit other mod/TO presets but not system presets
- [Phase 09-03]: Stage btree index used in view_lobby_browser procedural view — filter 4 active stages individually to avoid iter() performance issue and ctx.from.Lobby non-iterability in procedural views
- [Phase 09-03]: cursor.ts isSpectator variable removed after D-34 guard — TypeScript narrows teamSlot union to never after Spectator guard; isAnon simplified to isAnonymousPlayers only
- [Phase 09]: hardDeleteLobby exported from lobbyGc.ts to avoid parallel-agent conflict with lobbyLifecycle.ts modifications
- [Phase 09-05]: LobbyGcJob scheduled wiring requires --clear-database on maincloud
- [Phase 09]: pass_bid steal-skip: compare nominatingTeam (Nominate step actorSlot) vs winningTeam (currentBidTeam) to determine next nominator — steal means opponent keeps their turn
- [Phase 09]: draftAuction.ts: (nominateStep.payload.value as any).eidolon cast required — TypeScript cannot narrow StepPayload union through .sort()[0] chain

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
- Phase 06.1 inserted after Phase 06: Landing Page Migration (INSERTED)

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
- 2026-03-21: Completed 05-01-PLAN.md — schema foundation: EloConfig/Leaderboard tables, record_game_scores reducer, admin ELO reducers, Casual auto-validation (D-04), Ranked screenshot gate (D-07), accountRating on HsrAccount
- 2026-03-21: Completed 05-02-PLAN.md — MMR finalization: finalize_match_result (history+stats+bracket+ephemeral deletion), process_tournament_mmr (batch), 4 helper files (eloCalculation, statsIncrement, leaderboardRebuild, bracketHelpers), published to maincloud, 38/38 tests pass, Phase 05 complete
- 2026-03-22: Completed 06-01-PLAN.md — schema foundation: 5 PK expansions (+seasonId/matchType/teamSize), 4 new tables (Season, GlobalCharacterStat, TournamentPlayerAccount, MatchResultGameHistory), Lobby rosterVisibility/requireOwnership/isTournamentControlled, MatchSessionStepHistory reworked to flat rows, Season admin reducers, published to maincloud with --clear-database, 61/61 tests pass
- 2026-03-22: Completed 06-02-PLAN.md — anonymous play enforcement: computeAnonymousLabel + validateCharacterOwnership helpers, broadcast_cursor anonymous mode (userId=0 + label), 4 per-user views (stats + roster visibility), TournamentPlayerAccount wired into registration/withdrawal
- 2026-03-22: Completed 06-03-PLAN.md — 18-step finalization pipeline rewrite: runFinalization shared helper, character stat increments (pick/ban/faced), global character stats, match replay archival (step rows, game history, participant history), spectated count, auto-finalize casual, season-aware leaderboard, published to maincloud, 61/61 tests pass, Phase 06 complete
- 2026-03-22: Completed 06.1-01-PLAN.md — design tokens (~89 CSS variables), JetBrains Mono + Inter font variables, NavBar replacing Header globally (route-aware nav items + auth wiring), Logo + GearIcon components, video asset copied
- 2026-03-22: Completed 06.1-02-PLAN.md — HeroSection (video hero + loader + HUD), FeaturesSection (rotating carousel + auto-rotate), ContactSection (3-card community grid + inline SVGs + click-to-copy), landing page composed, FeatureCards deleted, visual checkpoint approved, Phase 06.1 complete
- 2026-03-28: Completed 07-01-PLAN.md — achievement schema foundation: AchievementTriggerType dropped, ComparisonOperator enum added, Achievement/UserAchievement tables reworked (isManualOnly, maxAwards, by_user_achievement index), new AchievementCriteria table created, published to maincloud with --clear-database, bindings regenerated
- 2026-03-28: Completed 07-02-PLAN.md — 7 achievement reducers (create/update/delete, add/remove criteria, manual_award, set_displayed_achievement), checkAndAwardAchievements helper hooked into finalization step 16.5, published to maincloud, 61/61 tests pass, 3 starter achievements seeded in bootstrap, Phase 07 complete
- 2026-03-28: Completed 08-01-PLAN.md — InviteStatus enum, CalendarEvent/CalendarEventInvite schema mods, calendarCleanup + calendarCascade helpers, 12 calendar reducers (availability/saved/events/invite response), published to maincloud with --clear-database, bindings regenerated, bootstrap+seed restored
- 2026-03-28: Completed 08-02-PLAN.md — 5 cross-feature cascade integrations (cancel_tournament D-21, rollback_bracket_match D-22, dq_participant D-22, withdraw_from_tournament D-24, performUserDeletion D-23), architecture doc full rewrite, published to maincloud, 85/85 tests pass, Phase 08 complete
- 2026-03-29: Completed 09-01-PLAN.md — Phase 9 schema foundation: LobbyStage+BanMode+ActionType enum changes, LobbyConfigSnapshot dual budgets, StepPayload 3 new types, 8 modified tables (Lobby, LobbyMember, MatchSession, MatchSessionHistory, MatchSessionStepHistory, MatchParticipantHistory), 4 new tables (LobbyBan, LobbyPreset, TournamentStandIn, LobbyGcJob), published to maincloud with --clear-database, bindings regenerated
- 2026-03-29: Completed 09-02-PLAN.md — 6 lobby lifecycle reducers (create/join/leave/close/kick/ban), lobbyHelpers.ts + anonymousHelpers.ts, published to maincloud, bindings regenerated
- 2026-03-29: Completed 09-03-PLAN.md — send_chat_message (D-12/D-13/D-14/D-18) + delete_chat_message (D-26), spectator cursor silencing (D-34), projected view_lobby_browser with LobbyBrowserRow (D-05/D-06/D-08), published to maincloud, bindings regenerated
- 2026-03-29: Completed 09-06-PLAN.md — 7 draft reducers (start_draft, pick_character, ban_character, timer_expiry_classic, undo_last_step, pause_draft, resume_draft), draftSequences.ts helper with exact 0/4/6-ban Classic sequences, MOUS-03 coach guard enforced throughout, D-29/D-30/D-40/D-42/D-43/D-43b/D-60/D-61/D-62 all implemented, published to maincloud, bindings regenerated
