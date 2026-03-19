---
phase: 03-tournament-system
verified: 2026-03-17T17:30:00Z
status: human_needed
score: 17/17 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 15/18
  gaps_closed:
    - "TEAM-01/02/03 reclassified as Out of Scope — removed from Phase 3 scope across REQUIREMENTS.md, ROADMAP.md, and 03-02-PLAN.md frontmatter"
    - "TEAM-05 coach role is now operationally functional — set_coach and remove_coach reducers implemented, exported from index.ts, and client bindings generated"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Verify module is actually published and running on maincloud"
    expected: "spacetime logs hsrpvp-spacetimedb-nextjs-test1 shows no compilation errors and all 34 reducer names (including set_coach and remove_coach) appear in the module"
    why_human: "Cannot verify remote maincloud deployment state from local file checks"
  - test: "Call create_tournament via the client and verify tournament appears in Tournament table with stage=Draft"
    expected: "Tournament row inserted with all required fields, organizerId set to caller's user.id"
    why_human: "End-to-end reducer execution requires a live SpacetimeDB connection"
  - test: "Advance tournament through stages and confirm forward-only enforcement"
    expected: "Draft->Registration->Seeding->InProgress->Completed works; attempting Draft->InProgress throws SenderError"
    why_human: "Stage machine enforcement requires live reducer execution"
  - test: "Test cost set draft/publish workflow"
    expected: "create_cost_set clones rows to CostSetDraftCharacter (private table, not visible in subscription); publish_cost_set moves them to HsrCharacterCost with new costSetId"
    why_human: "Draft table privacy (no public:true) can only be confirmed by attempting to subscribe to the table"
  - test: "Call set_coach as lobby host on a lobby member and verify isCoach becomes true"
    expected: "LobbyMember row updated with isCoach=true; calling set_coach again is a no-op; remove_coach reverts it"
    why_human: "Reducer execution and LobbyMember mutation require a live SpacetimeDB connection"
---

# Phase 03: Tournament System Verification Report

**Phase Goal:** Tournament organizers can create and manage tournament lifecycle, players can register solo or as tournament-scoped teams, referees operate per-match (not per-tournament), cost sets have draft/publish workflow, and the expanded role hierarchy (Moderator, TournamentHost) is enforced
**Verified:** 2026-03-17T17:30:00Z
**Status:** human_needed
**Re-verification:** Yes — after gap closure plan 03-05

## Re-verification Summary

Previous verification (2026-03-17T16:30:00Z) found 2 gaps:

1. **TEAM-01/02/03 (Blocker for requirement coverage):** Persistent team reducers were missing; requirements were incorrectly marked Complete despite being out of scope.
2. **TEAM-05 (Partial):** `isCoach` column existed on LobbyMember but no reducer could set it.

Plan 03-05 closed both gaps:
- TEAM-01/02/03 reclassified as Out of Scope (v0.5) in REQUIREMENTS.md traceability table, Out of Scope section, and ROADMAP.md Phase 3 requirements line. 03-02-PLAN.md frontmatter corrected to remove TEAM-01/02/03.
- `set_coach` and `remove_coach` reducers implemented in `refereeManagement.ts` using the delete+insert pattern with host-or-referee permission checks, no-op guards, and auditUpdate. Both exported from index.ts. Client bindings `set_coach_reducer.ts` and `remove_coach_reducer.ts` generated.

Score moved from 15/18 to 17/17 (18th truth removed from scope — TEAM-01/02/03 are no longer Phase 3 truths).

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Moderator and TournamentHost in Role enum; isRoleAtLeast() enforces Admin>Moderator>TournamentHost>User>Guest | VERIFIED | enums.ts lines 3-8: Role enum has all 4 variants. ensurePermissions.ts: ROLE_LEVEL map {Admin:100, Moderator:75, TournamentHost:50, User:25}. isRoleAtLeast() confirmed. |
| 2 | admin_update_user auto-accepts Moderator via Object.keys(Role.variants) (TRNT-01) | VERIFIED | admin.ts line 22: `userRole: Object.keys(Role.variants)` — dynamic, not hardcoded. |
| 3 | TournamentStage has Seeding and does NOT have Paused | VERIFIED | enums.ts: {Draft, Registration, Seeding, InProgress, Completed, Cancelled}. Paused absent. |
| 4 | RosterVisibility enum with OpenRoster, ClosedWithRating, ClosedNoRating | VERIFIED | enums.ts lines 99-103. All 3 variants present. |
| 5 | Cost table PKs include costSetId | VERIFIED | hsrCharacterCost.ts: primaryKey: ['characterName', 'gameMode', 'costSetId']. Same pattern on lightcone. |
| 6 | Tournament table has all required columns (rosterVisibility, teamSize, costSetId, winnerAdvantage, scheduledStartAt, etc.) | VERIFIED | tournament.ts: rosterVisibility, teamSize, costSetId, winnerAdvantage, requireVerified, requireRoster, requireApproval, waitlistEnabled, scheduledStartAt, registrationDeadline all present. |
| 7 | New tables (CostSet, CostSetDraftCharacter/Lightcone/Synergy, TournamentTeam, TournamentTeamRequest) registered in schema | VERIFIED | schema.ts: all 6 new tables imported and registered. Draft tables have no public:true (private). |
| 8 | tournamentHelpers.ts provides validateStageTransition() and ensureTournamentAccess() | VERIFIED | tournamentHelpers.ts: both functions implemented with STAGE_ORDER = [Draft, Registration, Seeding, InProgress, Completed], cancellation special-cased. |
| 9 | TournamentHost can create/manage tournament lifecycle and stage transitions | VERIFIED | tournamentManagement.ts: create_tournament (ensureTournamentHost), update_tournament, advance_tournament_stage (validateStageTransition), cancel_tournament all fully implemented. |
| 10 | Players can register solo or as tournament-scoped teams; waitlist and approval supported | VERIFIED | tournamentRegistration.ts: register_for_tournament validates stage, duplicate, requireVerified, requireRoster, capacity + waitlist, requireApproval. withdraw_from_tournament, approve_participant, waitlist_promote all present. |
| 11 | Tournament-scoped teams: create, join request, accept/reject, leave, disband | VERIFIED | tournamentTeams.ts: all 6 reducers (create_tournament_team, request_join_team, accept_team_request, reject_team_request, leave_tournament_team, disband_tournament_team) implemented. |
| 12 | Cost sets have draft/publish workflow with per-user views | VERIFIED | costSetManagement.ts: 8 reducers covering clone, edit-draft, publish, lock, unpublish, delete. securityViews.ts: 4 per-user draft views. |
| 13 | Referees operate per-match (transfer/reclaim via isReferee on LobbyMember) | VERIFIED | refereeManagement.ts: transfer_referee and reclaim_referee both implemented. |
| 14 | Match result confirmation flow: both teams confirm, referee submits, dispute once per match | VERIFIED | matchResultSubmission.ts: confirm_match_scores, submit_match_result (requires team1Confirmed+team2Confirmed + referee), dispute_match_result (one dispute per match via disputedByUserId lock). |
| 15 | TO/admin can DQ participants, override match results, manage assistants, moderator role promotion | VERIFIED | tournamentAdmin.ts: dq_participant, override_match_result, assign_tournament_assistant, remove_tournament_assistant, mod_promote_to_host, mod_demote_from_host — all 6 confirmed. |
| 16 | TEAM-04: Ad-hoc tournament-scoped teams without persistent teams | VERIFIED | TournamentTeam + TournamentTeamRequest tables + 6 tournamentTeams.ts reducers. Traceability: Complete in REQUIREMENTS.md line 205. |
| 17 | TEAM-05: Coach role flag is settable and removable by host or referee | VERIFIED | refereeManagement.ts lines 122-200: set_coach sets isCoach=true (delete+insert, no-op guard), remove_coach sets isCoach=false. Both exported from index.ts line 18. Bindings set_coach_reducer.ts and remove_coach_reducer.ts exist. Pick/ban enforcement documented as Phase 9 deferral. |

**Note — TEAM-01/02/03 removed from scope:** Plan 03-05 reclassified persistent team requirements as Out of Scope (v0.5). They are no longer Phase 3 truths. The previous 18-truth table is now 17 truths; truth 17 (TEAM-05) moved from PARTIAL to VERIFIED.

**Score:** 17/17 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `spacetimedb/src/types/enums.ts` | Moderator in Role, Seeding in TournamentStage, RosterVisibility enum | VERIFIED | All confirmed present |
| `spacetimedb/src/helpers/ensurePermissions.ts` | isRoleAtLeast, ensureModerator, getRoleLevel | VERIFIED | All 7 expected exports present, ROLE_LEVEL map correct |
| `spacetimedb/src/helpers/tournamentHelpers.ts` | validateStageTransition, ensureTournamentAccess | VERIFIED | Both functions implemented; STAGE_ORDER correct |
| `spacetimedb/src/tables/costSet.ts` | CostSet metadata table, name: 'cost_set' | VERIFIED | Confirmed, public: true, creator_id index |
| `spacetimedb/src/tables/costSetDraftCharacter.ts` | Private draft table (no public:true) | VERIFIED | No public:true — correctly private |
| `spacetimedb/src/tables/costSetDraftLightcone.ts` | Private draft table | VERIFIED | No public:true |
| `spacetimedb/src/tables/costSetDraftSynergy.ts` | Private draft table | VERIFIED | No public:true |
| `spacetimedb/src/tables/tournamentTeam.ts` | TournamentTeam table | VERIFIED | name: 'tournament_team', public, tournament_id+captain_user_id indexes |
| `spacetimedb/src/tables/tournamentTeamRequest.ts` | TournamentTeamRequest table | VERIFIED | Composite PK [teamId,userId], public |
| `spacetimedb/src/schema.ts` | All 6 new tables registered | VERIFIED | Lines 26-33 import and register all 6 new tables |
| `spacetimedb/src/reducers/tournamentManagement.ts` | 4 reducers: create, update, advance_stage, cancel | VERIFIED | All 4 exported reducers confirmed |
| `spacetimedb/src/reducers/tournamentRegistration.ts` | 4 reducers: register, withdraw, approve, waitlist_promote | VERIFIED | All 4 confirmed, waitlist logic present |
| `spacetimedb/src/reducers/tournamentTeams.ts` | 6 reducers: create, request, accept, reject, leave, disband | VERIFIED | All 6 confirmed, delete+insert PK pattern used |
| `spacetimedb/src/reducers/costSetManagement.ts` | 8 reducers: create through delete | VERIFIED | All 8 confirmed: create_cost_set, edit_draft_character/lightcone/synergy_cost, publish, lock, unpublish, delete |
| `spacetimedb/src/reducers/refereeManagement.ts` | transfer_referee, reclaim_referee, set_coach, remove_coach | VERIFIED | All 4 reducers present. set_coach lines 122-160, remove_coach lines 162-200. |
| `spacetimedb/src/reducers/matchResultSubmission.ts` | confirm, submit, dispute | VERIFIED | All 3 reducers with dual-confirm requirement and one-dispute enforcement |
| `spacetimedb/src/reducers/tournamentAdmin.ts` | dq_participant, override_match_result, assign/remove assistant, mod_promote/demote | VERIFIED | All 6 reducers confirmed |
| `spacetimedb/src/views/securityViews.ts` | 4 new draft cost views | VERIFIED | Views 6-9 confirmed: view_my_cost_sets, view_my_draft_character/lightcone/synergy_costs |
| `spacetimedb/src/index.ts` | All 34 reducers exported (including set_coach, remove_coach) | VERIFIED | Line 18: `export { transfer_referee, reclaim_referee, set_coach, remove_coach } from './reducers/refereeManagement'` |
| `src/module_bindings/cost_set_table.ts` | Client bindings | VERIFIED | File exists |
| `src/module_bindings/tournament_team_table.ts` | Client bindings | VERIFIED | File exists |
| `src/module_bindings/tournament_team_request_table.ts` | Client bindings | VERIFIED | File exists |
| `src/module_bindings/set_coach_reducer.ts` | Client binding for set_coach (new) | VERIFIED | File exists, contains lobbyId + targetUserId schema |
| `src/module_bindings/remove_coach_reducer.ts` | Client binding for remove_coach (new) | VERIFIED | File exists, contains lobbyId + targetUserId schema |
| `docs/tournament/architecture.md` | Tournament architecture docs | VERIFIED | File exists |
| `docs/cost-sets/architecture.md` | Cost set architecture docs | VERIFIED | File exists |
| `docs/match-results/architecture.md` | Match result docs | VERIFIED | File exists |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| ensurePermissions.ts | types/enums.ts | ROLE_LEVEL uses Moderator | WIRED | ROLE_LEVEL: {Admin:100, Moderator:75, TournamentHost:50, User:25} |
| tournament.ts | types/enums.ts | import RosterVisibility | WIRED | Line 2: `import { ..., RosterVisibility }` |
| schema.ts | tables/costSet.ts | CostSet schema registration | WIRED | Confirmed lines 26+116 |
| reducers/admin.ts | types/enums.ts | Object.keys(Role.variants) | WIRED | Line 22: dynamic enum — Moderator auto-detected |
| tournamentManagement.ts | tournamentHelpers.ts | validateStageTransition import | WIRED | Both validateStageTransition and ensureTournamentAccess imported and used |
| tournamentRegistration.ts | tables/tournamentParticipant.ts | TournamentParticipant inserts | WIRED | Multiple ctx.db.TournamentParticipant calls confirmed |
| tournamentTeams.ts | tables/tournamentTeam.ts | TournamentTeam inserts | WIRED | ctx.db.TournamentTeam.insert called in create_tournament_team |
| index.ts | reducers/refereeManagement.ts | export set_coach, remove_coach | WIRED | Line 18: `export { transfer_referee, reclaim_referee, set_coach, remove_coach }` |
| refereeManagement.ts | tables/lobbyMember.ts | isCoach toggle via delete+insert | WIRED | Lines 151-156 (set true), lines 191-196 (set false); auditUpdate applied |
| costSetManagement.ts | tables/costSet.ts | CostSet CRUD | WIRED | ctx.db.CostSet.insert in create_cost_set |
| costSetManagement.ts | tables/costSetDraftCharacter.ts | Draft table writes | WIRED | ctx.db.CostSetDraftCharacter.insert in clone + edit |
| costSetManagement.ts | tables/hsrCharacterCost.ts | Live cost table writes during publish | WIRED | ctx.db.HsrCharacterCost.insert in publish_cost_set |
| matchResultSubmission.ts | tables/matchResult.ts | MatchResultRecord updates | WIRED | ctx.db.MatchResultRecord.id.update in confirm + submit + dispute |
| refereeManagement.ts | tables/lobbyMember.ts | isReferee flag updates | WIRED | delete+insert on LobbyMember with isReferee toggle in transfer_referee and reclaim_referee |
| tournamentAdmin.ts | tables/tournamentParticipant.ts | DQ status updates | WIRED | delete+insert with status Disqualified in dq_participant |
| tournamentAdmin.ts | tables/tournamentAssistant.ts | Assistant assignment | WIRED | ctx.db.TournamentAssistant.insert/delete in assign+remove |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| TRNT-01 | 03-01 | TO role request / Moderator auto-accepted by admin_update_user | SATISFIED | admin.ts uses `Object.keys(Role.variants)` which auto-includes Moderator; mod_promote_to_host/mod_demote_from_host in tournamentAdmin.ts |
| TRNT-02 | 03-02, 03-03 | TO can create tournament with settings + cost set | SATISFIED | create_tournament validates all settings including costSetId; cost set management in costSetManagement.ts |
| TRNT-03 | 03-01 | Tournament formats: SingleElim, DoubleElim, Group | SATISFIED | TournamentFormat enum has all format variants; format validated in create_tournament |
| TRNT-04 | 03-02 | Tournament stage lifecycle (Draft→Registration→Seeding→InProgress→Completed→Cancelled) | SATISFIED | validateStageTransition + advance_tournament_stage + cancel_tournament |
| TRNT-05 | 03-02 | Player self-signup solo or as team | SATISFIED | register_for_tournament with teamGroupId param (0=solo, non-zero=team); tournamentTeams reducers |
| TRNT-06 | 03-02 | Team can sign up as unit | SATISFIED | create_tournament_team + register_for_tournament with teamGroupId; team slot validation in accept_team_request |
| TRNT-07 | 03-04 | TO can assign referees | SATISFIED | Per-match model: transfer_referee + reclaim_referee. assign_tournament_assistant gives assistants canValidateResults permissions. |
| TRNT-08 | 03-01 | TO can set anonymous play default | SATISFIED | isAnonymousDefault column in Tournament table; set in create_tournament and update_tournament |
| TRNT-09 | 03-01 | TO can set open/closed roster visibility | SATISFIED | rosterVisibility: RosterVisibility column (OpenRoster/ClosedWithRating/ClosedNoRating) |
| TRNT-10 | 03-01 | TO can set disconnect behavior policy | SATISFIED | disconnectPolicy column in Tournament table; validated in create_tournament |
| TRNT-11 | 03-04 | TO can override match results and DQ participants | SATISFIED | override_match_result (Validated/Rejected) + dq_participant in tournamentAdmin.ts |
| TRNT-12 | 03-04 | Referee can validate match results | SATISFIED | submit_match_result: referee (isReferee on LobbyMember) can submit once both teams confirm |
| TEAM-04 | 03-02 | Ad-hoc groups for specific tournament | SATISFIED | TournamentTeam + 6 tournamentTeams.ts reducers fully implement tournament-scoped ad-hoc teams |
| TEAM-05 | 03-01, 03-05 | Coach role: observe match, cannot pick | SATISFIED (flag only) | set_coach and remove_coach reducers implemented and exported. isCoach settable by host or referee. Pick/ban enforcement is Phase 9 scope — documented deferral, not a gap. |
| TEAM-01 | OUT OF SCOPE | User can create a persistent team with name and roster | OUT OF SCOPE (v0.5) | Reclassified by plan 03-05. REQUIREMENTS.md line 44 unchecked with "Out of Scope (v0.5)" annotation. Traceability line 202: "Out of Scope". |
| TEAM-02 | OUT OF SCOPE | User can invite others to join their team | OUT OF SCOPE (v0.5) | Reclassified by plan 03-05. REQUIREMENTS.md line 45. |
| TEAM-03 | OUT OF SCOPE | User can accept/decline team invitations | OUT OF SCOPE (v0.5) | Reclassified by plan 03-05. REQUIREMENTS.md line 46. |

All 14 in-scope Phase 3 requirements (TRNT-01 through TRNT-12, TEAM-04, TEAM-05) are SATISFIED.
TEAM-01/02/03 are correctly classified as Out of Scope — not failed, not blocked.

---

## Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| tournamentRegistration.ts | 48 | `// MMR check deferred to Phase 5` | INFO | Documented deferral with explicit comment. Expected and acceptable. Does not block registration flow. |
| refereeManagement.ts | 120 | `// NOTE: Pick/ban guard enforcement (coach cannot pick) is Phase 9 scope.` | INFO | Documented deferral. set_coach/remove_coach are fully operational for flag management. Enforcement is a separate Phase 9 concern. |

No blockers. No warnings.

---

## Human Verification Required

### 1. Module Live on Maincloud

**Test:** Run `spacetime logs hsrpvp-spacetimedb-nextjs-test1` and observe that module loaded with the two new reducers
**Expected:** No compilation errors; reducer names `set_coach` and `remove_coach` appear alongside existing reducers in module logs
**Why human:** Cannot verify remote maincloud deployment state from local file inspection

### 2. Cost Set Draft Privacy

**Test:** Connect a non-owner client and attempt to subscribe to `cost_set_draft_character` table
**Expected:** Zero rows returned (private table not broadcast); contrast with `cost_set` table which should be visible
**Why human:** Table privacy enforcement (no `public: true`) requires live SpacetimeDB subscription test

### 3. Full Tournament Lifecycle Flow

**Test:** Create a tournament, advance to Registration, register a player, advance to Seeding, advance to InProgress, attempt to skip stages
**Expected:** Stage advancement succeeds in sequence; `validateStageTransition` throws when skipping; cancel works from any non-terminal state
**Why human:** Reducer execution and stage machine behavior require a live connection

### 4. Coach Flag Set/Remove

**Test:** Join a lobby as host, call `set_coach` on another lobby member, call `set_coach` again on the same member (no-op test), then call `remove_coach`
**Expected:** isCoach becomes true on first call; second call is a no-op (no error, no change); remove_coach reverts to false
**Why human:** Reducer execution and LobbyMember mutation require a live SpacetimeDB connection

---

## Gaps Summary

No gaps remain. All automated checks pass for all 17 truths.

The two gaps from the initial verification are closed:

1. **TEAM-01/02/03:** Correctly reclassified as Out of Scope (v0.5) in REQUIREMENTS.md, ROADMAP.md, and plan frontmatter. These were never Phase 3 work — the planning documents have been corrected to reflect that.

2. **TEAM-05 (coach role):** `set_coach` and `remove_coach` reducers are fully implemented in `refereeManagement.ts`, exported from `index.ts`, and client bindings are generated. The flag is operationally settable. Pick/ban enforcement ("coach cannot pick") is Phase 9 scope — this is a documented deferral following the same pattern as referee auto-assignment. The TEAM-05 requirement as stated ("coach role exists... can observe but cannot pick") is satisfied at the flag level; the pick-guard enforcement is a separate feature concern.

The core Phase 3 goals — tournament lifecycle, registration, cost set draft/publish, per-match referees, and role hierarchy — were all verified in the initial run and remain unaffected by gap closure changes (no regressions detected).

---

_Verified: 2026-03-17T17:30:00Z_
_Verifier: Claude (gsd-verifier)_
_Re-verification after: plan 03-05 gap closure_
