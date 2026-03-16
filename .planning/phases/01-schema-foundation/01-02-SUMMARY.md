---
phase: 01-schema-foundation
plan: 02
subsystem: database
tags: [spacetimedb, typescript, schema, tables, mmr, tournament, calendar, achievements, chat]

# Dependency graph
requires:
  - phase: 01-schema-foundation plan 01
    provides: 14 new enums (TournamentStage, TournamentFormat, MatchResultStatus, ValidationStatus, DisconnectPolicy, RecurrenceType, RosterVisibility, ParticipantStatus, ParticipantType, AchievementRarity, AchievementTriggerType, ChatSenderType, TeamMemberRole, GroupAssignmentMode) and 3 new structs (GameScore, RecurrenceRule, EloConfig)
provides:
  - 23 new skeleton table files covering all v0.5 milestone domains
  - schema.ts updated to register all 38+ tables (23 new + 15 existing)
  - Module published to maincloud (hsrpvp-spacetimedb-nextjs-test1)
  - Client bindings generated: 24 new binding files in src/module_bindings/
affects:
  - 02-roster-management
  - 03-tournament-core
  - 04-bracket-engine
  - 05-match-results
  - 06-elo-ranking
  - 07-achievements
  - 08-calendar-events
  - 09-chat-notifications
  - 10-frontend-milestone

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Table name must not collide with existing enum names — SpacetimeDB derives the row type name via toPascalCase(tableName); use a distinct table name or the server rejects with duplicate type error
    - Index name must not match the table name — both live in the same SpacetimeDB namespace; use a descriptive suffix (e.g., mmr_rating_value not mmr_rating for the rating column index on the mmr_rating table)
    - Composite PK tables use primaryKey array option in table() options (1st arg), not on individual columns
    - All tables define audit columns inline (4 columns at end); no shared import

key-files:
  created:
    - spacetimedb/src/tables/hsrAccount.ts
    - spacetimedb/src/tables/hsrAccountCharacter.ts
    - spacetimedb/src/tables/hsrAccountLightcone.ts
    - spacetimedb/src/tables/tournament.ts
    - spacetimedb/src/tables/tournamentParticipant.ts
    - spacetimedb/src/tables/tournamentAssistant.ts
    - spacetimedb/src/tables/team.ts
    - spacetimedb/src/tables/teamMember.ts
    - spacetimedb/src/tables/teamInvite.ts
    - spacetimedb/src/tables/bracketMatch.ts
    - spacetimedb/src/tables/groupStanding.ts
    - spacetimedb/src/tables/matchResult.ts
    - spacetimedb/src/tables/matchResultGame.ts
    - spacetimedb/src/tables/mmrRating.ts
    - spacetimedb/src/tables/mmrHistory.ts
    - spacetimedb/src/tables/playerStats.ts
    - spacetimedb/src/tables/characterStats.ts
    - spacetimedb/src/tables/achievement.ts
    - spacetimedb/src/tables/userAchievement.ts
    - spacetimedb/src/tables/availabilitySlot.ts
    - spacetimedb/src/tables/savedCalendar.ts
    - spacetimedb/src/tables/calendarEvent.ts
    - spacetimedb/src/tables/calendarEventInvite.ts
    - spacetimedb/src/tables/chatMessage.ts
  modified:
    - spacetimedb/src/schema.ts
    - src/module_bindings/index.ts
    - src/module_bindings/types.ts

key-decisions:
  - "match_result table renamed to match_result_record — SpacetimeDB derives row type name via toPascalCase(tableName), causing collision with the existing MatchResult enum; the table must use a distinct snake_case name"
  - "mmr_rating_value index name used instead of mmr_rating — SpacetimeDB treats both the table name (mmr_rating) and any index named mmr_rating as the same entity; suffix the index name to disambiguate"

patterns-established:
  - "SpacetimeDB naming rule: when defining a table named foo_bar, never create an index also named foo_bar; the table name is already a namespace entry"
  - "SpacetimeDB type collision rule: toPascalCase(tableName) must not equal any existing enum or struct name in the module"

requirements-completed: [SCHM-03]

# Metrics
duration: 15min
completed: 2026-03-16
---

# Phase 1 Plan 02: Schema Foundation — Skeleton Tables Summary

**23 new skeleton tables covering all v0.5 domains (roster, tournament, bracket, MMR, stats, achievements, calendar, chat) registered in schema.ts, published to maincloud, and client bindings generated**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-03-16T03:52:00Z
- **Completed:** 2026-03-16T04:07:00Z
- **Tasks:** 2 of 2
- **Files modified:** 57 (24 new table files + schema.ts + 32 binding files)

## Accomplishments

- Created all 23 skeleton table files with correct columns, composite keys, indexes, and audit columns for every v0.5 domain
- Updated schema.ts to import and register all 38+ tables (23 new + 15 existing) organized by category
- Fixed two naming conflicts discovered during publish (MatchResult enum vs match_result table, mmr_rating table vs mmr_rating index) and published successfully to maincloud
- Generated 24 new TypeScript client binding files in src/module_bindings/

## Task Commits

Each task was committed atomically:

1. **Task 1: Create all new skeleton table files** - `d2e9c23` (feat)
2. **Task 2: Register all tables in schema.ts, publish, and generate bindings** - `e624560` (feat)

**Plan metadata:** (final docs commit — see below)

## Files Created/Modified

- `spacetimedb/src/tables/hsrAccount.ts` - HSR account with userId, uid, displayLabel, isActive, rosterVisibility; indexes on userId+uid
- `spacetimedb/src/tables/hsrAccountCharacter.ts` - Composite PK [accountId, characterName], eidolonLevel
- `spacetimedb/src/tables/hsrAccountLightcone.ts` - Composite PK [accountId, lightconeName], superimpositionLevel
- `spacetimedb/src/tables/tournament.ts` - Full tournament config: 24 columns including format, stage, anonymous, openRoster, disconnectPolicy, grandFinalsAdvantage, groupAssignmentMode
- `spacetimedb/src/tables/tournamentParticipant.ts` - Composite PK [tournamentId, userId], participantType, status, seedNumber, anonymousAlias
- `spacetimedb/src/tables/tournamentAssistant.ts` - Composite PK [tournamentId, userId], 5 permission booleans
- `spacetimedb/src/tables/team.ts` - id (autoInc), unique name, ownerId, isAdHoc, optional tournamentId
- `spacetimedb/src/tables/teamMember.ts` - Composite PK [teamId, userId], memberRole
- `spacetimedb/src/tables/teamInvite.ts` - id (autoInc), teamId, inviteeUserId, inviterUserId, isPending
- `spacetimedb/src/tables/bracketMatch.ts` - id (autoInc), 18 columns including nextWinnerMatchId, nextLoserMatchId, resultStatus
- `spacetimedb/src/tables/groupStanding.ts` - Composite PK [tournamentId, groupId, participantUserId], wins/losses/draws/points
- `spacetimedb/src/tables/matchResult.ts` - Stored as match_result_record table; id (autoInc), bracketMatchId, lobbyId, player1Id, player2Id, isTournamentMatch, status, winnerId
- `spacetimedb/src/tables/matchResultGame.ts` - Composite PK [matchResultId, gameNumber], per-game scores and validation
- `spacetimedb/src/tables/mmrRating.ts` - Composite PK [userId, gameMode], rating, matchesPlayed; mmr_rating_value index on rating column
- `spacetimedb/src/tables/mmrHistory.ts` - id (autoInc), userId, gameMode, matchResultId, previousRating, newRating, delta
- `spacetimedb/src/tables/playerStats.ts` - PK userId, matchesPlayed/wins/losses/draws/matchesSpectated
- `spacetimedb/src/tables/characterStats.ts` - Composite PK [userId, characterName], wins/losses/matchesPlayed
- `spacetimedb/src/tables/achievement.ts` - id (autoInc), unique name, triggerType, rarity, isOneTime, optional thresholdValue/characterName
- `spacetimedb/src/tables/userAchievement.ts` - id (autoInc), userId, achievementId, awardedById, isDisplayed
- `spacetimedb/src/tables/availabilitySlot.ts` - id (autoInc), userId, startAt, endAt, isRecurring, recurrenceRule (struct), expiresAt
- `spacetimedb/src/tables/savedCalendar.ts` - Composite PK [userId, targetUserId], isVisible
- `spacetimedb/src/tables/calendarEvent.ts` - id (autoInc), organizerId, title, startAt, endAt, optional bracketMatchId
- `spacetimedb/src/tables/calendarEventInvite.ts` - Composite PK [eventId, inviteeUserId], optional isAccepted
- `spacetimedb/src/tables/chatMessage.ts` - id (autoInc), lobbyId, senderUserId, senderType, content, optional metadata/anonymousLabel
- `spacetimedb/src/schema.ts` - Imports and registers all 38+ tables in 12 categories
- `src/module_bindings/` - 24 new binding files generated by spacetime generate

## Decisions Made

- The table named `match_result` was renamed to `match_result_record` because SpacetimeDB derives the row type name as `toPascalCase(tableName)`, which equals `MatchResult` — the same as the existing enum. The server rejects duplicate type names. Using `match_result_record` produces `MatchResultRecord` which is unique. Future phases referencing this table should use the `match_result_record` DB name and `MatchResultRecord` TypeScript type.
- The MMR rating index was renamed from `mmr_rating` to `mmr_rating_value` because the table itself is also named `mmr_rating`, and SpacetimeDB treats both table names and index names in the same module namespace. Using a descriptive suffix avoids the collision.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Renamed match_result table to match_result_record to avoid MatchResult enum collision**
- **Found during:** Task 2 (Register all tables in schema.ts, publish, and generate bindings)
- **Issue:** SpacetimeDB derives the row type name from the table name via toPascalCase. `match_result` → `MatchResult`, which collides with the existing `MatchResult` enum defined in enums.ts.
- **Fix:** Changed `name: 'match_result'` to `name: 'match_result_record'` in matchResult.ts and renamed the table export from `MatchResult` to `MatchResultRecord`. Updated schema.ts accordingly.
- **Files modified:** spacetimedb/src/tables/matchResult.ts, spacetimedb/src/schema.ts
- **Verification:** Publish succeeded with exit code 0; bindings file is `match_result_record_table.ts`
- **Committed in:** e624560 (Task 2 commit)

**2. [Rule 1 - Bug] Renamed mmr_rating index to mmr_rating_value to avoid table name collision**
- **Found during:** Task 2 (Register all tables in schema.ts, publish, and generate bindings)
- **Issue:** The table is named `mmr_rating` and an index was also named `mmr_rating`. SpacetimeDB reported "name mmr_rating is used for multiple entities".
- **Fix:** Renamed the index and accessor from `mmr_rating` to `mmr_rating_value` in mmrRating.ts.
- **Files modified:** spacetimedb/src/tables/mmrRating.ts
- **Verification:** Publish succeeded with exit code 0
- **Committed in:** e624560 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (Rule 1 — bugs from SpacetimeDB naming constraints)
**Impact on plan:** Both fixes required for successful publish. Table data model is preserved; only internal DB name and index name changed. No scope creep.

## Issues Encountered

- spacetime.json database name is `hsrpvp-spacetimedb-nextjs-test1`, not `hsrpvp` (which was the plan's assumed name). Publish command used correct name from spacetime.json.

## User Setup Required

None — module published to maincloud automatically. No environment variables or external service configuration required.

## Next Phase Readiness

- All 23 skeleton tables are available for Phase 2+ reducers to use
- Client bindings are generated and ready for frontend integration
- The `match_result_record` table name change is a known deviation; all Phase 5 reducers must use `match_result_record` as the DB table name and `MatchResultRecord` as the TypeScript type
- The `mmr_rating_value` index name must be used instead of `mmr_rating` when filtering by rating in Phase 6 MMR reducers

---
*Phase: 01-schema-foundation*
*Completed: 2026-03-16*
