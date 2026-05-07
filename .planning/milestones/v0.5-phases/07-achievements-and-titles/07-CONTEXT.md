# Phase 7: Achievements and Titles - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Admin-defined achievement system with flexible criteria configuration, auto-award logic hooked into the finalization pipeline, manual awards with permission scoping, and profile title display. Schema rework of existing Achievement/UserAchievement tables plus new AchievementCriteria table.

Requirements: ACHV-01, ACHV-02, ACHV-03, ACHV-04

</domain>

<decisions>
## Implementation Decisions

### Achievement Table Rework
- **D-01:** Achievement table slimmed to: id (autoInc PK), name (unique), description, rarity (AchievementRarity), isManualOnly (bool), maxAwards (optional u32), audit cols
- **D-02:** Drop `triggerType`, `thresholdValue`, `characterName`, `isOneTime` from Achievement — criteria logic moved entirely to AchievementCriteria table
- **D-03:** Drop `AchievementTriggerType` enum — replaced by isManualOnly bool + criteria rows
- **D-04:** `maxAwards` replaces `isOneTime`: null=unlimited, 1=one-time, N=capped. Also enforces global uniqueness (e.g., "Solar First" with maxAwards=1 means only 1 player total)
- **D-05:** Keep `AchievementRarity` enum as-is: Rare, Epic, Legendary (3 tiers, no Common)

### AchievementCriteria Table (NEW)
- **D-06:** New `AchievementCriteria` table: id (autoInc PK), achievementId (FK), statTable (string), statField (string), operator (ComparisonOperator enum), thresholdValue (u32), filterGameMode (optional), filterCharacterName (optional), filterMatchType (optional), audit cols
- **D-07:** New `ComparisonOperator` enum: GreaterOrEqual, GreaterThan, Equal, LessThan, LessOrEqual — full operator set for maximum flexibility
- **D-08:** Multiple AchievementCriteria rows for the same achievementId use AND logic — all must pass. OR logic handled by creating separate achievements
- **D-09:** statTable/statField are strings resolved by a hardcoded resolver map in the checker — one case per supported stat table (PlayerStat, PlayerCharacterStat, MmrRating). Type-safe, no silent failures from typos
- **D-10:** Criteria rows are locked once any player has earned the achievement (prevents goalpost-moving). Achievement name/description/rarity remain editable anytime

### UserAchievement Rework
- **D-11:** Drop `isDisplayed` from UserAchievement — `User.displayedAchievementId` is the single source of truth for displayed title
- **D-12:** UserAchievement final columns: id (autoInc PK), userId, achievementId, awardedById, audit cols
- **D-13:** Duplicate prevention via maxAwards: checker counts existing UserAchievement rows for user+achievement before awarding. If maxAwards set and count >= maxAwards, skip

### Auto-Award Hook
- **D-14:** Auto-award fires ONLY during `runFinalization` in finalizationHelpers.ts — single hook point after stats are updated
- **D-15:** Checker filters AchievementCriteria by statTable matching the stat tables that just changed during finalization (PlayerStat, PlayerCharacterStat, MmrRating) — only evaluates relevant achievements, not all
- **D-16:** Once earned, always kept — no revocation logic. Achievements are historical records

### Title System
- **D-17:** Title = Achievement.name displayed on profile. Achievement.description shown as hover tooltip on frontend
- **D-18:** `User.displayedAchievementId` (already exists) is the FK. No separate title table or titleText column needed
- **D-19:** Progress visible to users — client reads PlayerStat + AchievementCriteria to compute progress toward unearned achievements. All data already public, no extra server work

### Permissions
- **D-20:** Achievement CRUD (create/update/delete): Admin only
- **D-21:** manual_award: Admin/Moderator can award to anyone. TournamentHost can award to participants of their own tournaments only
- **D-22:** set_displayed_achievement: User sets own title (must have earned it, validated via UserAchievement). Admin can set for any user. Nullable (clear title)
- **D-23:** Achievement deletion cascades: delete Achievement -> delete all UserAchievement rows -> clear User.displayedAchievementId where it matches

### Achievement Update Rules
- **D-24:** Name/description/rarity editable anytime by admin
- **D-25:** AchievementCriteria rows locked once any UserAchievement exists for that achievement — prevents changing criteria after players have earned it

### Notification
- **D-26:** No separate notification table. UserAchievement is public — SpacetimeDB subscription pushes new rows to clients automatically. Frontend reacts to subscription update

### Test Data
- **D-27:** No seed reducer. 3 starter achievements as test fixture data in the data folder for test bootstrap:
  1. "MMR Elite" — MmrRating.globalCompositeRating >= 1500, maxAwards=null
  2. "Veteran" — PlayerStat.matchesWon >= 10 (total, all modes), maxAwards=null
  3. "Solar First Tournament Winner" — isManualOnly=true, maxAwards=1 (globally unique)
- **D-28:** Production starts with zero achievements. Admins create all definitions via CRUD reducers post-deploy

### Schema Migration
- **D-29:** Changes require `--clear-database`: dropping enum, dropping/adding columns, new table. Same pattern as Phases 04.1 and 06

### Claude's Discretion
- Achievement checker helper function structure and naming
- AchievementCriteria index design (likely btree on achievementId)
- Exact error messages for permission/validation failures
- Reducer file organization (new file vs extending existing)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Achievement Schema (existing, to be reworked)
- `spacetimedb/src/tables/achievement.ts` — Current Achievement table definition (to be modified per D-01/D-02)
- `spacetimedb/src/tables/userAchievement.ts` — Current UserAchievement table definition (to be modified per D-11/D-12)
- `spacetimedb/src/types/enums.ts` — AchievementRarity enum (keep), AchievementTriggerType enum (drop per D-03)

### User Table (title display)
- `spacetimedb/src/tables/user.ts` — User.displayedAchievementId (already exists, used by D-18)

### Finalization Pipeline (auto-award hook point)
- `spacetimedb/src/helpers/finalizationHelpers.ts` — runFinalization function where achievement checker hooks in (D-14)

### Stat Tables (criteria resolution targets)
- `spacetimedb/src/helpers/statsIncrement.ts` — incrementPlayerStat pattern for PlayerStat
- `spacetimedb/src/helpers/characterStatsIncrement.ts` — PlayerCharacterStat increment pattern
- `spacetimedb/src/helpers/eloCalculation.ts` — MmrRating structure

### Behavior Specs
- `docs/tournament/contract.md` — Reference behavior spec format
- `.planning/REQUIREMENTS.md` — ACHV-01 through ACHV-04

### Prior Phase Decisions
- `.planning/phases/05-match-results-and-mmr/05-CONTEXT.md` — ELO system, finalization paths (D-09 through D-11)
- `.planning/phases/06-anonymous-play-and-player-stats/06-CONTEXT.md` — Stat table structure, PK patterns, finalization pipeline rewrite

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `finalizationHelpers.ts:runFinalization()` — 18-step pipeline, achievement checker hooks in after stat increments (step ~15-16 range)
- `ensurePermissions.ts` — Permission helpers (ensureAdmin, ensureTournamentHost) for CRUD/award reducers
- `auditColumns.ts` — auditInsert/auditUpdate helpers for all new rows
- `statsIncrement.ts` — Pattern for reading/upserting stat table rows with composite PK delete+insert

### Established Patterns
- Composite PK delete+insert for upserts (PlayerStat, MmrRating)
- AutoInc PK for ledger tables (MmrHistory, MatchResultGame)
- Cascade deletion pattern from user deletion (UserDeletionJob)
- Public table + subscription for client notification (no separate event table)
- Idempotent seed reducers (admin_seed_elo_config)

### Integration Points
- `runFinalization()` — add achievement checker call after stat increments, before ephemeral deletion
- `User.displayedAchievementId` — already wired, needs set_displayed_achievement reducer
- `schema.ts` — register new AchievementCriteria table
- `index.ts` — export new reducers
- Post-publish bootstrap script — add achievement test data insertion

</code_context>

<specifics>
## Specific Ideas

- Achievement criteria table approach chosen specifically for non-destructive flexibility — adding/changing achievements is row operations, not schema changes
- "Solar First Tournament Winner" is the flagship manual achievement — globally unique (maxAwards=1), admin-awarded only
- Progress visibility is client-computed from existing public stat data + criteria rows — no server-side progress tracking needed
- Test data in data folder, not a seed reducer — achievements are admin content, not system defaults

</specifics>

<deferred>
## Deferred Ideas

- Frontend achievement UI (browsing, awarding, progress display) — v1 scope
- Achievement-to-tournament linking (FK) — not needed; TO permission scoping handles this
- Notification table for unread achievement alerts — subscription-driven is sufficient
- Common rarity tier — 3 tiers sufficient for now
- OR logic for multi-criteria — AND only; OR achievable via separate achievements

</deferred>

---

*Phase: 07-achievements-and-titles*
*Context gathered: 2026-03-27*
