# Phase 7: Achievements and Titles - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 07-achievements-and-titles
**Areas discussed:** Achievement criteria model, Auto-award timing & hook, Title system design, Seed achievements, Uniqueness constraint, CRUD permissions, UserAchievement rework, Duplicate award prevention, Achievement earned notification, Seed reducer pattern, Schema migration, Operator enum, Multi-criteria logic, Achievement revocation, Rarity enum, Achievement deletion cascade, set_displayed_achievement reducer, Criteria stat resolution, Achievement update rules

---

## Achievement Criteria Model

| Option | Description | Selected |
|--------|-------------|----------|
| Add criteriaField column | New column on Achievement specifying which stat to check | |
| Expand triggerType enum | Specific variants per stat type | |
| AchievementCriteria table | Separate table mapping achievements to stat lookups | ✓ |

**User's choice:** User proposed the criteria table approach — separate table with statTable/statField/operator/threshold + optional filters. Chosen for non-destructive flexibility.
**Notes:** User's key concern was avoiding destructive table actions when changing the achievement system later. The criteria table means adding/changing achievements is row operations, not schema changes.

---

## Compound Criteria

| Option | Description | Selected |
|--------|-------------|----------|
| No compound — single criteria only | Each achievement checks one thing | |
| AND logic between criteria | Multiple AchievementCriteria rows, all must pass | ✓ |

**User's choice:** AND logic via multiple criteria rows. OR logic handled by creating separate achievements.

---

## Auto-Award Timing

| Option | Description | Selected |
|--------|-------------|----------|
| Finalization only | Check after stats updated in runFinalization | ✓ |
| Finalization + roster changes | Also check on character/lightcone additions | |

**User's choice:** Finalization only. Single hook point.
**Notes:** User noted "Auto achievements will only" — auto awards fire only during finalization.

---

## Achievement Check Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Only relevant achievements | Filter by statTable matching what changed | ✓ |
| Check all unearned | Evaluate every non-Manual achievement | |

**User's choice:** Only relevant. Filter AchievementCriteria by stat tables that changed.

---

## Title System

**User's choice:** Achievement.name = title, Achievement.description = hover tooltip. No separate titleText column.
**Notes:** User specifically requested: "We need the title name and a description column that the front end can display when the title is hovered"

---

## Progress Visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Hidden until earned | Achievements appear only when awarded | |
| Show progress | Client reads stat data + criteria to compute progress | ✓ |

**User's choice:** Show progress. Client-computed from existing public data.

---

## Seed Achievements

**User's choice:** 3 specific starter achievements:
1. "MMR Elite" — globalCompositeRating >= 1500
2. "Veteran" — matchesWon >= 10 total
3. "Solar First Tournament Winner" — manual only, globally unique (maxAwards=1)

---

## Uniqueness Constraint (Global Cap)

| Option | Description | Selected |
|--------|-------------|----------|
| maxAwards column on Achievement | Optional u32, null=unlimited, 1=unique | ✓ |
| Enforce in reducer logic | Hardcoded check for known limited achievements | |
| Soft delete | isActive flag | |

**User's choice:** maxAwards column. Also replaces isOneTime entirely (user insight).

---

## isOneTime Removal

**User's insight:** maxAwards makes isOneTime redundant. maxAwards=1 is isOneTime=true, maxAwards=null is isOneTime=false, maxAwards=N is a capability isOneTime couldn't express.
**Decision:** Drop isOneTime, use maxAwards for everything.

---

## CRUD Permissions

| Option | Description | Selected |
|--------|-------------|----------|
| Admin only | Only Admin can create/edit/delete achievements | ✓ |
| Admin + TournamentHost | TO can also create tournament-specific achievements | |

**User's choice:** Admin only for CRUD.

---

## Manual Award Permissions

| Option | Description | Selected |
|--------|-------------|----------|
| Admin/Mod anyone, TO their participants | TO scoped to own tournament participants | ✓ |
| Admin only | Only admin can award | |
| Anyone TO+ can award anyone | No participant scoping | |

**User's choice:** Admin/Mod unrestricted, TO scoped to their tournament participants.
**Notes:** User asked about the TO workflow for awarding tournament titles. Answer: TO calls manual_award(achievementId, targetUserId), reducer validates targetUserId is in one of TO's tournaments. Frontend selection UI is v1 scope.

---

## UserAchievement Rework

| Option | Description | Selected |
|--------|-------------|----------|
| Drop isDisplayed, keep displayedAchievementId on User | Single source of truth | ✓ |
| Keep both | Denormalized flag | |

**User's choice:** Drop isDisplayed. User.displayedAchievementId is the sole mechanism.
**Additional:** Current columns (minus isDisplayed) confirmed as final. No earnedAt timestamp — createdDate serves that purpose since awards are immediate.

---

## Achievement Deletion Cascade

| Option | Description | Selected |
|--------|-------------|----------|
| Cascade delete | Delete achievement -> delete UserAchievement -> clear displayedAchievementId | ✓ |
| Block deletion if earned | Reject if any awards exist | |
| Soft delete | Mark inactive | |

**User's choice:** Cascade delete.

---

## set_displayed_achievement Reducer

| Option | Description | Selected |
|--------|-------------|----------|
| Self only, must have earned, nullable | Only ctx.sender sets own title | |
| Admin can set for others too | Admin override + self-set | ✓ |

**User's choice:** Self + admin override.

---

## Criteria Stat Resolution

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded resolver map | Switch/map per stat table, type-safe | ✓ |
| Dynamic property access | ctx.db[statTable], no validation | |

**User's choice:** Hardcoded resolver map.

---

## Achievement Update Rules

| Option | Description | Selected |
|--------|-------------|----------|
| Name/description editable, criteria locked after first award | Prevents goalpost-moving | ✓ |
| Everything editable always | No locks | |

**User's choice:** Criteria locked after first award.

---

## Operator Enum

| Option | Description | Selected |
|--------|-------------|----------|
| Just GreaterOrEqual | Single operator | |
| GreaterOrEqual + Equal | Two operators | |
| Full set: >=, >, ==, <, <= | Maximum flexibility | ✓ |

**User's choice:** Full set of 5 operators.

---

## Achievement Revocation

| Option | Description | Selected |
|--------|-------------|----------|
| Once earned, always kept | Historical record, no revocation | ✓ |
| Revocable for non-oneTime | Re-check criteria | |
| Admin manual revoke only | Disciplinary option | |

**User's choice:** Once earned, always kept.

---

## Rarity Tiers

| Option | Description | Selected |
|--------|-------------|----------|
| Add Common tier | 4 tiers | |
| Keep 3 tiers | Rare/Epic/Legendary | ✓ |

**User's choice:** Keep 3 tiers.

---

## Achievement Notification

| Option | Description | Selected |
|--------|-------------|----------|
| Row insert is enough | Subscription-driven | ✓ |
| Separate notification table | AchievementNotification with seen flag | |

**User's choice:** Subscription-driven. No extra table.

---

## Seed Reducer

| Option | Description | Selected |
|--------|-------------|----------|
| admin_seed_achievements reducer | Idempotent bootstrap reducer | |
| No seed reducer — test data in data folder | Achievements via CRUD, test fixtures for bootstrap | ✓ |

**User's choice:** No seed reducer. 3 achievements as test fixture data. Production starts empty, admins create via CRUD.
**Notes:** User clarified that the starter achievements are for testing, not production defaults. Pattern: data folder test fixtures, not seed reducer.

---

## Schema Migration

**User's choice:** No concerns with --clear-database. Expected pattern.

---

## Claude's Discretion

- Achievement checker helper function structure and naming
- AchievementCriteria index design
- Exact error messages for validation failures
- Reducer file organization
