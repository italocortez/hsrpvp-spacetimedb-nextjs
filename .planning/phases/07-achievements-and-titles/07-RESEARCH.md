# Phase 07: Achievements and Titles - Research

**Researched:** 2026-03-27
**Domain:** SpacetimeDB backend — schema rework, criteria evaluation, finalization pipeline hook, permission-scoped awards
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Achievement Table Rework**
- D-01: Achievement table slimmed to: id (autoInc PK), name (unique), description, rarity (AchievementRarity), isManualOnly (bool), maxAwards (optional u32), audit cols
- D-02: Drop `triggerType`, `thresholdValue`, `characterName`, `isOneTime` from Achievement — criteria logic moved entirely to AchievementCriteria table
- D-03: Drop `AchievementTriggerType` enum — replaced by isManualOnly bool + criteria rows
- D-04: `maxAwards` replaces `isOneTime`: null=unlimited, 1=one-time, N=capped. Also enforces global uniqueness (e.g., "Solar First" with maxAwards=1 means only 1 player total)
- D-05: Keep `AchievementRarity` enum as-is: Rare, Epic, Legendary (3 tiers, no Common)

**AchievementCriteria Table (NEW)**
- D-06: New `AchievementCriteria` table: id (autoInc PK), achievementId (FK), statTable (string), statField (string), operator (ComparisonOperator enum), thresholdValue (u32), filterGameMode (optional), filterCharacterName (optional), filterMatchType (optional), audit cols
- D-07: New `ComparisonOperator` enum: GreaterOrEqual, GreaterThan, Equal, LessThan, LessOrEqual
- D-08: Multiple AchievementCriteria rows for same achievementId use AND logic
- D-09: statTable/statField are strings resolved by a hardcoded resolver map — one case per supported stat table (PlayerStat, PlayerCharacterStat, MmrRating). Type-safe, no silent failures
- D-10: Criteria rows locked once any player has earned the achievement

**UserAchievement Rework**
- D-11: Drop `isDisplayed` from UserAchievement — `User.displayedAchievementId` is the single source of truth
- D-12: UserAchievement final columns: id (autoInc PK), userId, achievementId, awardedById, audit cols
- D-13: Duplicate prevention via maxAwards: count existing UserAchievement rows for user+achievement before awarding

**Auto-Award Hook**
- D-14: Auto-award fires ONLY during `runFinalization` in finalizationHelpers.ts — single hook point after stats are updated
- D-15: Checker filters AchievementCriteria by statTable matching the stat tables that just changed (PlayerStat, PlayerCharacterStat, MmrRating) — only evaluates relevant achievements
- D-16: Once earned, always kept — no revocation logic

**Title System**
- D-17: Title = Achievement.name displayed on profile; Achievement.description shown as hover tooltip on frontend
- D-18: `User.displayedAchievementId` (already exists) is the FK
- D-19: Progress visible to users — client reads PlayerStat + AchievementCriteria to compute progress. No extra server work

**Permissions**
- D-20: Achievement CRUD (create/update/delete): Admin only
- D-21: manual_award: Admin/Moderator can award to anyone. TournamentHost can award to participants of their own tournaments only
- D-22: set_displayed_achievement: User sets own title (must have earned it). Admin can set for any user. Nullable (clear title)
- D-23: Achievement deletion cascades: delete Achievement -> delete all UserAchievement rows -> clear User.displayedAchievementId where it matches

**Achievement Update Rules**
- D-24: Name/description/rarity editable anytime by admin
- D-25: AchievementCriteria rows locked once any UserAchievement exists for that achievement

**Notification**
- D-26: No separate notification table. UserAchievement is public — subscription pushes new rows to clients automatically

**Test Data**
- D-27: No seed reducer. 3 starter achievements as test fixture data in data folder for test bootstrap:
  1. "MMR Elite" — MmrRating.globalCompositeRating >= 1500, maxAwards=null
  2. "Veteran" — PlayerStat.matchesWon >= 10 (total, all modes), maxAwards=null
  3. "Solar First Tournament Winner" — isManualOnly=true, maxAwards=1 (globally unique)
- D-28: Production starts with zero achievements. Admins create all definitions via CRUD reducers post-deploy

**Schema Migration**
- D-29: Changes require `--clear-database`: dropping enum, dropping/adding columns, new table

### Claude's Discretion
- Achievement checker helper function structure and naming
- AchievementCriteria index design (likely btree on achievementId)
- Exact error messages for permission/validation failures
- Reducer file organization (new file vs extending existing)

### Deferred Ideas (OUT OF SCOPE)
- Frontend achievement UI (browsing, awarding, progress display) — v1 scope
- Achievement-to-tournament linking (FK)
- Notification table for unread achievement alerts
- Common rarity tier
- OR logic for multi-criteria
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ACHV-01 | Admin can create achievement definitions with name, description, criteria type, and threshold | D-01 through D-10 cover full CRUD API design; `create_achievement` + `add_achievement_criteria` reducers; ensureAdmin pattern from ensurePermissions.ts |
| ACHV-02 | System auto-awards achievements when conditions are met | D-14 through D-16 specify the runFinalization hook point; criteria resolver map over PlayerStat, PlayerCharacterStat, MmrRating tables; checkAndAwardAchievements helper function |
| ACHV-03 | Admin/TO can manually award achievements to specific players | D-21 permission model; `manual_award_achievement` reducer; TournamentParticipant lookup for TO scope validation |
| ACHV-04 | User can view their collected achievements and select a title for display on profile | D-22 permission model; `set_displayed_achievement` reducer; UserAchievement public table subscription drives the view |
</phase_requirements>

---

## Summary

Phase 7 is a pure SpacetimeDB backend phase with no frontend work. It replaces the existing stub Achievement/UserAchievement schema with a richer, criteria-driven design and wires auto-award logic into the already-established 18-step `runFinalization` pipeline.

The schema work has two distinct parts: (1) reworking two existing tables and dropping one enum (requires `--clear-database`), and (2) adding the new `AchievementCriteria` table plus a new `ComparisonOperator` enum. The finalization hook is the most algorithmically complex piece — the checker must aggregate PlayerStat rows across all game modes (since criteria often target totals, not per-mode splits), then evaluate each criteria row against the resolved field values using the operator enum.

The permission model for manual awards has a non-trivial TournamentHost path: TOs can only award to participants of their own tournaments, which requires a cross-table join (User → TournamentParticipant → Tournament.hostUserId). All other permission checks reuse existing `ensureAdmin` and `ensureModerator` helpers.

**Primary recommendation:** Implement in two plans — 07-01 covers schema foundation (table reworks, new tables, new enums, publish with --clear-database), 07-02 covers reducers and the finalization hook (CRUD reducers, checker helper, award reducers, title reducer, test data bootstrap update).

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `spacetimedb/server` | v2.1.0 (project-pinned) | table, t, SenderError, reducer primitives | Only SpacetimeDB server API available |
| TypeScript | 5.x (project-pinned) | Type-safe reducer/helper code | Project convention |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `helpers/ensurePermissions.ts` | internal | Admin/Moderator/TournamentHost guards | Every privileged reducer |
| `helpers/auditColumns.ts` | internal | auditInsert/auditUpdate for all row writes | Every table insert/update |

### No New Dependencies
This phase requires zero new npm packages. All logic is server-side TypeScript using existing project helpers.

---

## Architecture Patterns

### Recommended Project Structure for New Files

```
spacetimedb/src/
├── tables/
│   ├── achievement.ts          (REWORK — replace all columns per D-01/D-02)
│   ├── userAchievement.ts      (REWORK — drop isDisplayed per D-11/D-12)
│   └── achievementCriteria.ts  (NEW — D-06)
├── types/
│   └── enums.ts                (MODIFY — drop AchievementTriggerType, add ComparisonOperator)
├── helpers/
│   └── achievementChecker.ts   (NEW — checkAndAwardAchievements helper)
└── reducers/
    └── achievementManagement.ts (NEW — all 6+ reducers for this phase)
```

### Pattern 1: Table Rework with --clear-database

**What:** Modify `achievement.ts` and `userAchievement.ts` in place, replacing column definitions entirely. The table `name` string stays the same (`'achievement'`, `'user_achievement'`) so schema.ts import references don't change.

**When to use:** D-29 confirms this phase requires `--clear-database`. All prior data is wiped. Column order and types can be freely changed.

```typescript
// Source: spacetimedb/src/tables/achievement.ts — reworked version
import { table, t } from 'spacetimedb/server';
import { AchievementRarity } from '../types/enums';

export const Achievement = table({
    name: 'achievement',
    public: true,
    indexes: [
        { accessor: 'by_rarity', algorithm: 'btree', columns: ['rarity'] },
    ],
}, {
    id: t.u32().primaryKey().autoInc(),
    name: t.string().unique(),
    description: t.string(),
    rarity: AchievementRarity,
    isManualOnly: t.bool(),
    maxAwards: t.u32().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
});
```

### Pattern 2: New AchievementCriteria Table

**What:** New table with autoInc PK, achievementId FK, string-typed statTable/statField, ComparisonOperator enum, threshold, optional filters.

**Index recommendation (Claude's Discretion):** btree on `achievementId` is the primary access pattern (load all criteria for one achievement). A btree on `statTable` enables the checker's optimization (D-15: filter by which stat tables changed). Both are needed.

```typescript
// Source: spacetimedb/src/tables/achievementCriteria.ts — new file
import { table, t } from 'spacetimedb/server';
import { ComparisonOperator } from '../types/enums';

export const AchievementCriteria = table({
    name: 'achievement_criteria',
    public: true,
    indexes: [
        { accessor: 'by_achievement', algorithm: 'btree', columns: ['achievementId'] },
        { accessor: 'by_stat_table', algorithm: 'btree', columns: ['statTable'] },
    ],
}, {
    id: t.u32().primaryKey().autoInc(),
    achievementId: t.u32(),
    statTable: t.string(),
    statField: t.string(),
    operator: ComparisonOperator,
    thresholdValue: t.u32(),
    filterGameMode: t.string().optional(),      // GameMode enum tag string, e.g. 'MemoryOfChaos'
    filterCharacterName: t.string().optional(),
    filterMatchType: t.string().optional(),     // MatchType enum tag string, e.g. 'Ranked'
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
});
```

**Note on optional enum filter columns:** SpacetimeDB enum types produced by `t.enum(...)` do not have an `.optional()` chain method. To avoid blocking on SDK limitations, store `filterGameMode` and `filterMatchType` as `t.string().optional()` containing the enum variant tag name (e.g., `'MemoryOfChaos'`, `'Ranked'`). The resolver map compares against `r.gameMode.tag` and `r.matchType.tag` which are already strings — no conversion needed.

### Pattern 3: ComparisonOperator Enum

**What:** New enum added to `enums.ts`, replacing the dropped `AchievementTriggerType`.

```typescript
// Source: spacetimedb/src/types/enums.ts — addition
export const ComparisonOperator = t.enum('ComparisonOperator', {
    GreaterOrEqual: t.unit(),
    GreaterThan: t.unit(),
    Equal: t.unit(),
    LessThan: t.unit(),
    LessOrEqual: t.unit(),
});
```

### Pattern 4: Achievement Checker Helper

**What:** `checkAndAwardAchievements(ctx, userId, actingUserId)` — called from `runFinalization` after stat increments. Loads all non-manual achievements, evaluates all criteria for each achievement, awards if all pass and player hasn't already hit the cap.

**When to use:** Called once per participant in `runFinalization` after steps 13-16 (stat increments), before step 17 (bracket advancement).

```typescript
// Source: spacetimedb/src/helpers/achievementChecker.ts — new file
import { auditInsert } from './auditColumns';

export function checkAndAwardAchievements(
    ctx: any,
    userId: number,
    actingUserId: number
): void {
    // Achievement is admin-managed content (<100 rows) — iter() acceptable here
    const achievements = [...ctx.db.Achievement.iter()]
        .filter((a: any) => !a.isManualOnly);

    for (const achievement of achievements) {
        // Per-user duplicate check
        const existingUserAwards = [...ctx.db.UserAchievement.by_user_achievement
            .filter([userId, achievement.id])];
        if (existingUserAwards.length > 0) {
            continue; // This user already has it
        }

        // Global cap check (maxAwards=1 means only 1 player globally)
        if (achievement.maxAwards !== undefined) {
            const globalCount = [...ctx.db.UserAchievement.by_achievement
                .filter(achievement.id)].length;
            if (globalCount >= achievement.maxAwards) {
                continue; // Global cap reached
            }
        }

        // Load criteria for this achievement
        const criteriaRows = [...ctx.db.AchievementCriteria.by_achievement
            .filter(achievement.id)];
        if (criteriaRows.length === 0) continue; // No criteria = never auto-awards

        // Evaluate all criteria (AND logic)
        const allPass = criteriaRows.every((c: any) =>
            evaluateCriterion(ctx, userId, c)
        );

        if (allPass) {
            ctx.db.UserAchievement.insert({
                id: 0, // autoInc
                userId,
                achievementId: achievement.id,
                awardedById: actingUserId,
                ...auditInsert(ctx, actingUserId),
            } as any);
            console.log(`[ACHIEVEMENT] Auto-awarded "${achievement.name}" to user #${userId}`);
        }
    }
}
```

**Resolver map pattern (D-09):**
```typescript
function evaluateCriterion(ctx: any, userId: number, criterion: any): boolean {
    let resolvedValue: number | undefined;

    switch (criterion.statTable) {
        case 'PlayerStat': {
            // Aggregate across all matching PlayerStat rows for this user
            // (criteria often target totals across game modes/seasons)
            const rows = [...ctx.db.PlayerStat.by_user.filter(userId)];
            const filtered = rows.filter((r: any) => {
                if (criterion.filterGameMode && r.gameMode.tag !== criterion.filterGameMode) return false;
                if (criterion.filterMatchType && r.matchType.tag !== criterion.filterMatchType) return false;
                return true;
            });
            // Sum the target field across matching rows
            // Use explicit field mapping (not string indexing) for type safety per D-09
            resolvedValue = sumField(filtered, criterion.statField);
            break;
        }
        case 'PlayerCharacterStat': {
            // by_user single-col index confirmed present in characterStats.ts
            const rows = [...ctx.db.PlayerCharacterStat.by_user.filter(userId)];
            const filtered = rows.filter((r: any) => {
                if (criterion.filterCharacterName && r.characterName !== criterion.filterCharacterName) return false;
                if (criterion.filterGameMode && r.gameMode.tag !== criterion.filterGameMode) return false;
                if (criterion.filterMatchType && r.matchType.tag !== criterion.filterMatchType) return false;
                return true;
            });
            resolvedValue = sumField(filtered, criterion.statField);
            break;
        }
        case 'MmrRating': {
            // For MMR criteria, take max across all seasons/modes
            // user_id single-col index confirmed present in mmrRating.ts
            const rows = [...ctx.db.MmrRating.user_id.filter(userId)];
            resolvedValue = rows.length > 0
                ? Math.max(...rows.map((r: any) => getField(r, criterion.statField) ?? 0))
                : 0;
            break;
        }
        default:
            // Unknown statTable — log and skip, no silent failure (D-09)
            console.warn(`[ACHIEVEMENT] Unknown statTable in criteria: ${criterion.statTable}`);
            return false;
    }

    if (resolvedValue === undefined) return false;
    return applyOperator(resolvedValue, criterion.operator, criterion.thresholdValue);
}

// Explicit field mapping — avoids string-indexing runtime uncertainty
function getField(row: any, fieldName: string): number | undefined {
    switch (fieldName) {
        // PlayerStat fields
        case 'matchesPlayed': return row.matchesPlayed;
        case 'wins':          return row.wins;
        case 'losses':        return row.losses;
        case 'draws':         return row.draws;
        // PlayerCharacterStat fields
        case 'timesBannedInMatch': return row.timesBannedInMatch;
        case 'timesFaced':         return row.timesFaced;
        case 'winsAgainst':        return row.winsAgainst;
        case 'lossesAgainst':      return row.lossesAgainst;
        // MmrRating fields
        case 'rating':                return row.rating;
        case 'globalCompositeRating': return row.globalCompositeRating;
        case 'matchesPlayed':         return row.matchesPlayed;
        default:
            console.warn(`[ACHIEVEMENT] Unknown statField: ${fieldName}`);
            return undefined;
    }
}

function sumField(rows: any[], fieldName: string): number {
    return rows.reduce((sum: number, r: any) => sum + (getField(r, fieldName) ?? 0), 0);
}

function applyOperator(value: number, operator: any, threshold: number): boolean {
    switch (operator.tag) {
        case 'GreaterOrEqual': return value >= threshold;
        case 'GreaterThan':    return value > threshold;
        case 'Equal':          return value === threshold;
        case 'LessThan':       return value < threshold;
        case 'LessOrEqual':    return value <= threshold;
        default:               return false;
    }
}
```

### Pattern 5: runFinalization Hook Integration

**What:** Add `checkAndAwardAchievements` call inside `runFinalization` after stat increments (steps 13-16), before bracket advancement (step 17).

**Insertion point:** Between step 16 (character stats) and step 17 (bracket advancement).

```typescript
// Source: spacetimedb/src/helpers/finalizationHelpers.ts — addition after step 16
// Step 16.5 (NEW): Check and award achievements per participant
for (const p of participants) {
    checkAndAwardAchievements(ctx, p.userId, actingUserId);
}
```

### Pattern 6: Reducers for Achievement Management

**File:** `spacetimedb/src/reducers/achievementManagement.ts` (new file, Claude's Discretion on organization)

Reducer set:
1. `create_achievement(name, description, rarity, isManualOnly, maxAwards?)` — Admin only
2. `update_achievement(achievementId, name?, description?, rarity?)` — Admin only; name/description/rarity editable anytime (D-24)
3. `delete_achievement(achievementId)` — Admin only; cascade: delete AchievementCriteria rows, UserAchievement rows, clear User.displayedAchievementId (D-23)
4. `add_achievement_criteria(achievementId, statTable, statField, operator, thresholdValue, filterGameMode?, filterCharacterName?, filterMatchType?)` — Admin only; blocked if any UserAchievement exists for this achievement (D-10/D-25)
5. `remove_achievement_criteria(criteriaId)` — Admin only; blocked if any UserAchievement exists for the parent achievement (D-25)
6. `manual_award_achievement(achievementId, targetUserId)` — Admin/Mod unrestricted; TournamentHost restricted to their tournament participants (D-21)
7. `set_displayed_achievement(targetUserId?, achievementId?)` — Verified user sets own title; Admin sets for any user; null achievementId clears title (D-22)

### Pattern 7: TournamentHost Scope Validation (D-21)

**What:** TOs can award to participants of their own tournaments. The check: does a TournamentParticipant row exist for `targetUserId` in any tournament where `tournament.hostUserId === caller.id`?

```typescript
// Inside manual_award_achievement — permission check
const caller = getAuthenticatedUser(ctx);

if (isRoleAtLeast(caller.role, 'Moderator')) {
    // Moderator/Admin — unrestricted, fall through
} else if (isRoleAtLeast(caller.role, 'TournamentHost')) {
    // TournamentHost — can only award to own tournament participants
    // Tournament table host index: check Tournament table definition for 'host_user_id' accessor
    // If no index exists, iter() is acceptable (tournament count is small)
    const callerTournaments = [...ctx.db.Tournament.iter()]
        .filter((t: any) => t.hostUserId === caller.id);
    const isParticipant = callerTournaments.some((t: any) => {
        return [...ctx.db.TournamentParticipant.by_tournament_and_user
            .filter([t.id, targetUserId])].length > 0;
    });
    if (!isParticipant) {
        throw new SenderError('Forbidden: Target user is not a participant in your tournaments.');
    }
} else {
    throw new SenderError('Forbidden: Requires Moderator, Admin, or Tournament Host privileges.');
}
```

### Pattern 8: maxAwards Dual Enforcement

**What:** `maxAwards` enforces two independent constraints: (1) per-user — don't award the same achievement twice to one user, and (2) global — cap total awards across all users. Both must be checked.

```typescript
// Per-user check (prevents double-award to same user)
const existingUserAwards = [...ctx.db.UserAchievement.by_user_achievement.filter([targetUserId, achievementId])];
if (existingUserAwards.length > 0) {
    throw new SenderError('User has already earned this achievement.');
}

// Global cap check (maxAwards=1 on "Solar First" means only 1 player globally)
if (achievement.maxAwards !== undefined) {
    const globalCount = [...ctx.db.UserAchievement.by_achievement.filter(achievementId)].length;
    if (globalCount >= achievement.maxAwards) {
        throw new SenderError(`Achievement "${achievement.name}" has reached its global award limit (${achievement.maxAwards}).`);
    }
}
```

### Anti-Patterns to Avoid

- **Calling `ctx.db.Achievement.id.filter()`** — `id` is a PK column, only has `.find()`. To get all rows, use `.iter()`.
- **String indexing SpacetimeDB row objects** — `r[fieldName]` may behave unexpectedly. Use an explicit switch/case field map (see `getField()` above).
- **Checking only per-user count for maxAwards** — must also check global count for achievements where maxAwards caps total awards across all users.
- **Forgetting `as any` cast on insert** — all `ctx.db.*.insert({...} as any)` calls need the cast in this codebase.
- **Passing object arg to multi-column btree filter** — `.filter({userId, achievementId})` silently returns 0 rows. Use `.filter([userId, achievementId])` (positional array).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Permission checks | Custom role comparisons | `ensureAdmin`, `ensureModerator`, `isRoleAtLeast` from `ensurePermissions.ts` | Already handles role hierarchy, SenderError messaging |
| Audit fields | Inline `createdDate: ctx.timestamp` etc. | `auditInsert(ctx, userId)` / `auditUpdate(ctx, existing, userId)` | Consistent pattern, preserves original createdById |
| Upsert on composite PK tables | Manual find-then-update | Delete + insert (project-wide established pattern) | SpacetimeDB has no UPDATE for composite PK tables via accessor |
| Iteration of large tables | Unindexed `.iter()` | btree index + `.filter()` | `.iter()` is O(n), index lookups are O(log n) |

---

## Common Pitfalls

### Pitfall 1: iter() on Achievement without explanation
**What goes wrong:** Using iter() triggers review flags — it looks like a performance issue.
**Why it happens:** Achievement is the one table in this phase where iter() IS correct: it has autoInc PK (no filter-all capability) and is admin-managed content with typically <100 rows.
**How to avoid:** Add a comment: `// Achievement is admin-managed (<100 rows) — iter() acceptable here`.
**Warning signs:** Code review flags unexplained iter() calls.

### Pitfall 2: Per-user vs. global maxAwards enforcement
**What goes wrong:** Only checking per-user count — a maxAwards=1 achievement could be awarded to 50 different users, each getting it once.
**Why it happens:** D-13 describes per-user duplicate check, but D-04 describes global uniqueness as the purpose of maxAwards for certain achievements (e.g., "Solar First" — only 1 player globally).
**How to avoid:** Always run two checks: (1) per-user count via `by_user_achievement` multi-column filter, and (2) global count via `by_achievement` single-column filter. Both must pass for the award to proceed.
**Warning signs:** "Solar First" achievement awarded to multiple players.

### Pitfall 3: Criteria lock check missing in criteria mutation reducers
**What goes wrong:** Admin edits criteria rows for an achievement after players have already earned it — retroactively changing what they earned.
**Why it happens:** D-25 specifies the lock but it must be explicitly checked in both `add_achievement_criteria` and `remove_achievement_criteria` reducers.
**How to avoid:** Before any criteria mutation, check `[...ctx.db.UserAchievement.by_achievement.filter(achievementId)].length > 0` and throw if true.
**Warning signs:** Criteria changes succeed even after a UserAchievement row exists.

### Pitfall 4: statField string indexing on row objects
**What goes wrong:** `r[criterion.statField]` may not reliably work on SpacetimeDB row objects if the runtime representation doesn't support arbitrary string property access.
**Why it happens:** TypeScript row objects from SpacetimeDB are typed structs, not guaranteed to behave as plain JS objects for arbitrary string indexing.
**How to avoid:** Use an explicit `getField(row, fieldName)` switch/case mapping as shown in Pattern 4. Covers all known stat fields. Unknown fields log a warning and return undefined.
**Warning signs:** Criteria always evaluate to 0 despite stat rows having non-zero values.

### Pitfall 5: Missing combined UserAchievement index
**What goes wrong:** The reworked `userAchievement.ts` needs a multi-column `by_user_achievement` btree index to efficiently check "does this user already have this achievement?". Without it, duplicate-award checks are O(n) per participant per achievement.
**Why it happens:** The old schema only has single-column indexes (`userId`, `achievementId` separately). The combined index must be added in the rework.
**How to avoid:** Add `{ accessor: 'by_user_achievement', algorithm: 'btree', columns: ['userId', 'achievementId'] }` to the reworked UserAchievement table definition. This enables `.filter([userId, achievementId])` for O(log n) lookup.
**Warning signs:** Slow checker performance during finalization; duplicate awards possible if check uses wrong accessor.

### Pitfall 6: Cascade delete forgetting displayedAchievementId reset
**What goes wrong:** `delete_achievement` removes the Achievement row and UserAchievement rows but forgets to clear `User.displayedAchievementId` for users who had that achievement as their title.
**Why it happens:** D-23 specifies this but it's a third cascade step after the first two deletes, easy to overlook.
**How to avoid:** In `delete_achievement`, after deleting Achievement + its criteria + UserAchievement rows, also iterate User rows where `displayedAchievementId === achievementId` and clear it. User table has no index on displayedAchievementId — iter() is acceptable since User is small.
**Warning signs:** Users show a ghost title (achievement name from deleted definition) post-deletion.

### Pitfall 7: Tournament table host index unknown
**What goes wrong:** `manual_award_achievement` with TournamentHost path may attempt `ctx.db.Tournament.host_user_id.filter(callerId)` but the Tournament table may not have that btree index.
**Why it happens:** Existing reducers use `ensureTournamentAccess` helper, not direct host lookup — so the index was never needed before.
**How to avoid:** Use `[...ctx.db.Tournament.iter()].filter(t => t.hostUserId === callerId)` with a comment explaining why iter() is used. Tournament count is small and this is a low-frequency operation.
**Warning signs:** TypeError on `ctx.db.Tournament.host_user_id` accessor at runtime.

---

## Code Examples

### Confirmed stat table accessor patterns (from source)

```typescript
// PlayerStat — single-col btree 'by_user' (confirmed: playerStats.ts)
const statRows = [...ctx.db.PlayerStat.by_user.filter(userId)];

// PlayerCharacterStat — single-col btree 'by_user' (confirmed: characterStats.ts)
const charStatRows = [...ctx.db.PlayerCharacterStat.by_user.filter(userId)];
// Also has 7-col combined btree for exact lookup:
// [...ctx.db.PlayerCharacterStat.by_user_char_mode_draft_season_type_size
//     .filter([userId, charName, gameMode, draftMode, seasonId, matchType, teamSize])][0]

// MmrRating — single-col btree 'user_id' (confirmed: mmrRating.ts)
const mmrRows = [...ctx.db.MmrRating.user_id.filter(userId)];
```

### Existing autoInc insert pattern (confirmed from source)
```typescript
// Source: spacetimedb/src/reducers/seasonAdmin.ts
ctx.db.Season.insert({
    id: 0, // autoInc — SpacetimeDB replaces with actual ID
    name,
    // ...other fields
    ...auditInsert(ctx, admin.id),
} as any);
```

### Existing cascade delete pattern
```typescript
// Source: confirmed from userDeletion.ts pattern (cascade via scheduled job)
// For achievement delete cascade (D-23):

// 1. Delete criteria rows
const criteriaRows = [...ctx.db.AchievementCriteria.by_achievement.filter(achievementId)];
for (const c of criteriaRows) { ctx.db.AchievementCriteria.delete(c); }

// 2. Delete UserAchievement rows
const userAchievements = [...ctx.db.UserAchievement.by_achievement.filter(achievementId)];
for (const ua of userAchievements) { ctx.db.UserAchievement.delete(ua); }

// 3. Clear displayedAchievementId on affected users
// No index on displayedAchievementId — iter() with justification (User table is small)
for (const user of [...ctx.db.User.iter()]) {
    if (user.displayedAchievementId === achievementId) {
        ctx.db.User.id.update({
            ...user,
            displayedAchievementId: undefined,
            ...auditUpdate(ctx, user, actingUserId),
        });
    }
}

// 4. Delete Achievement row itself
ctx.db.Achievement.id.delete(achievementId);
```

### Test data bootstrap addition pattern
```typescript
// Source: scripts/post-publish.ts pattern — sequential reducer calls after register_server
// Per D-27: 3 starter achievements seeded during post-publish bootstrap
// Reducers don't return data — subscribe to Achievement onInsert to get auto-generated ids

let mmrEliteId: number | undefined;
connection.db.achievement.onInsert((_ctx, row) => {
    if (row.name === 'MMR Elite') mmrEliteId = row.id;
});

await connection.reducers.createAchievement({
    name: 'MMR Elite',
    description: 'Reach a global composite MMR rating of 1500 or higher.',
    rarity: { tag: 'Epic', value: {} },
    isManualOnly: false,
    maxAwards: undefined,
});
// Wait for subscription sync, then use mmrEliteId to add criteria
await sleep(500);
if (mmrEliteId !== undefined) {
    await connection.reducers.addAchievementCriteria({
        achievementId: mmrEliteId,
        statTable: 'MmrRating',
        statField: 'globalCompositeRating',
        operator: { tag: 'GreaterOrEqual', value: {} },
        thresholdValue: 1500,
        filterGameMode: undefined,
        filterCharacterName: undefined,
        filterMatchType: undefined,
    });
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `isOneTime: bool` on Achievement | `maxAwards: u32?` — null=unlimited, 1=one-time, N=cap | Phase 7 (D-04) | Enables globally-unique achievements and N-cap awards |
| `triggerType` enum + `thresholdValue` column | `AchievementCriteria` table with operator enum | Phase 7 (D-02/D-06) | Criteria are data rows, not schema columns — no schema changes to add new achievement types |
| `isDisplayed` on UserAchievement | `User.displayedAchievementId` (single source of truth) | Phase 7 (D-11/D-18) | Simpler: one field per user, not one row per user per achievement |

**Deprecated/outdated (to remove):**
- `AchievementTriggerType` enum: drop from enums.ts (D-03)
- `isOneTime`, `triggerType`, `thresholdValue`, `characterName` on Achievement table: drop (D-02)
- `isDisplayed` on UserAchievement: drop (D-11)
- Existing `docs/achievements/architecture.md`: rewrite entirely — current content reflects old schema

---

## Open Questions

1. **Optional enum column syntax (`filterGameMode` on AchievementCriteria)**
   - What we know: `t.enum(...)` values do not have an `.optional()` chain method. Storing as `t.string().optional()` is the confirmed workaround.
   - What's unclear: Whether a future SpacetimeDB SDK version adds `.optional()` to enum builders.
   - Recommendation: Use `t.string().optional()` for `filterGameMode` and `filterMatchType` as documented in Pattern 2. The resolver map compares against `.tag` strings which are already string-typed — no special conversion needed.

2. **Tournament table `hostUserId` index existence**
   - What we know: `dq_participant` uses `ensureTournamentAccess` helper, not direct host lookup. Whether `Tournament` has a `host_user_id` btree index is not confirmed from the files read during research.
   - What's unclear: Whether the Tournament table definition includes a `host_user_id` btree index.
   - Recommendation: The planner should add a task to read `spacetimedb/src/tables/tournament.ts` before writing the TO permission path. If no index exists, use `[...ctx.db.Tournament.iter()].filter(t => t.hostUserId === callerId)` with a comment — acceptable since tournament count is small at current scale.

---

## Validation Architecture

`nyquist_validation` is enabled in `.planning/config.json`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest / integration tests via `test/shared/connection.ts` (createTestHarness / createVerifiedTestHarness) |
| Config file | Check `vitest.config.*` at project root |
| Quick run command | `npx vitest run test/backend/achievements/` |
| Full suite command | `npx vitest run test/backend/` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ACHV-01 | Admin creates achievement + criteria; non-admin fails | integration | `npx vitest run test/backend/achievements/achievement-crud.test.ts` | Wave 0 |
| ACHV-01 | Criteria locked after first award | integration | `npx vitest run test/backend/achievements/achievement-crud.test.ts` | Wave 0 |
| ACHV-02 | Auto-award fires after finalization when stat threshold met | integration | `npx vitest run test/backend/achievements/auto-award.test.ts` | Wave 0 |
| ACHV-02 | maxAwards global cap enforced during auto-award | integration | `npx vitest run test/backend/achievements/auto-award.test.ts` | Wave 0 |
| ACHV-03 | Admin/Mod awards manually; TO awards own participant | integration | `npx vitest run test/backend/achievements/manual-award.test.ts` | Wave 0 |
| ACHV-03 | TO cannot award to non-participant | integration | `npx vitest run test/backend/achievements/manual-award.test.ts` | Wave 0 |
| ACHV-04 | User sets own title; Admin sets for any user; clears with null | integration | `npx vitest run test/backend/achievements/title-display.test.ts` | Wave 0 |
| ACHV-04 | User cannot set title for achievement they haven't earned | integration | `npx vitest run test/backend/achievements/title-display.test.ts` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run test/backend/achievements/`
- **Per wave merge:** `npx vitest run test/backend/`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `test/backend/achievements/achievement-crud.test.ts` — covers ACHV-01 create/update/delete/criteria-lock
- [ ] `test/backend/achievements/auto-award.test.ts` — covers ACHV-02 auto-award via finalization, maxAwards cap
- [ ] `test/backend/achievements/manual-award.test.ts` — covers ACHV-03 all permission paths
- [ ] `test/backend/achievements/title-display.test.ts` — covers ACHV-04 set/clear title

---

## Sources

### Primary (HIGH confidence)
- `spacetimedb/src/helpers/finalizationHelpers.ts` — 18-step pipeline, step numbering, stat table access patterns, confirmed accessor names
- `spacetimedb/src/tables/achievement.ts` — existing columns being dropped
- `spacetimedb/src/tables/userAchievement.ts` — existing columns, confirmed index structure
- `spacetimedb/src/tables/user.ts` — `displayedAchievementId: t.u32().optional()` confirmed
- `spacetimedb/src/types/enums.ts` — `AchievementRarity` (keep), `AchievementTriggerType` (drop), all role levels
- `spacetimedb/src/helpers/ensurePermissions.ts` — `isRoleAtLeast`, role levels, `ensureAdmin`/`ensureModerator`/`ensureTournamentHost`
- `spacetimedb/src/helpers/auditColumns.ts` — `auditInsert`, `auditUpdate`, `SYSTEM_USER_ID`
- `spacetimedb/src/tables/playerStats.ts` — `by_user` btree index confirmed
- `spacetimedb/src/tables/characterStats.ts` — `by_user` btree index confirmed (both PlayerStat and PlayerCharacterStat have this)
- `spacetimedb/src/tables/mmrRating.ts` — `user_id` btree index confirmed, `globalCompositeRating` field confirmed
- `spacetimedb/src/helpers/statsIncrement.ts` — upsert pattern (delete + insert), confirmed all PlayerStat fields
- `spacetimedb/src/reducers/seasonAdmin.ts` — autoInc insert pattern (`id: 0`), admin reducer structure
- `.planning/phases/07-achievements-and-titles/07-CONTEXT.md` — all locked decisions D-01 through D-29

### Secondary (MEDIUM confidence)
- `docs/achievements/architecture.md` — confirms old schema structure (to be replaced)
- `.claude/skills/spacetimedb/SKILL.md` — SpacetimeDB accessor rules, naming conventions, audit column policy
- `scripts/post-publish.ts` — bootstrap pattern for test data injection via reducer calls + onInsert

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries, all in-project patterns
- Architecture: HIGH — all patterns confirmed from existing source files; one LOW item (optional enum syntax, resolved with string workaround)
- Pitfalls: HIGH — derived from actual source code analysis + established SpacetimeDB accessor rules

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (stable domain, SpacetimeDB v2.1.0 pinned)
