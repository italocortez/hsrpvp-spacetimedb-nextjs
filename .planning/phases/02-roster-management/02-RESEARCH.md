# Phase 02: Roster Management - Research

**Researched:** 2026-03-16
**Domain:** SpacetimeDB TypeScript module — roster CRUD reducers, archetype schema, visibility patterns
**Confidence:** HIGH

## Summary

This phase implements the reducer logic for HSR account management, character roster CRUD, archetype tagging, and visibility controls on top of tables already created in Phase 1. The existing codebase provides strong, well-established patterns: `ensurePermissions.ts` for auth, `auditColumns.ts` for audit trails, and `admin.ts` for bulk upsert/proxy operations. All new code follows these patterns directly.

Key architectural decisions from CONTEXT.md significantly simplify this phase: lightcone ownership tracking is removed, rating computation is fully frontend-side (no backend cache), and batch-only reducers with atomic validation replace per-item operations. The main new schema additions are the Archetype table, HsrCharacterArchetype junction table, costSetId column on cost tables, and isRatingPublic + isDuplicateUid columns on HsrAccount.

**Primary recommendation:** Follow the existing reducer patterns exactly (getAuthenticatedUser + validation + audit columns), implement batch-only reducers with atomic all-or-nothing validation, and add new tables/columns through the established table definition pattern.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Max 5 HSR accounts per user
- UID: 9-digit numeric, validated at reducer level
- Region: Auto-derived from UID first digit (6=America, 7=Europe, 8=Asia, 9=TW/HK/MO) — not a user input
- UID and region are immutable from creation. Typo? Delete and recreate.
- Display label: Always editable, optional with auto-default ("Account 1", "Account 2", etc.)
- First account created auto-sets as default preference (isActive)
- Deleting the active account auto-activates the oldest remaining
- HSR account deletion: Hard delete + cascade (all HsrAccountCharacter rows deleted with it)
- User deletion: Hard delete all HSR data. History tables are self-sufficient.
- No HSR account = can't join lobbies that require roster
- isActive on HsrAccount is a default preference only, not globally enforced
- No cooldown on switching — per-lobby selection replaces the old global switch model
- Warn but allow: multiple users can claim the same HSR UID (isDuplicateUid flag)
- Dedicated migrate_roster reducer supports both copy and move modes
- No backend rating caching — fully frontend-computed from subscribed data
- Archetype table + HsrCharacterArchetype junction table for diversity scoring
- Per-HsrAccount toggles: isRosterPublic (default false), isRatingPublic (default false)
- Batch-only reducers with atomic all-or-nothing validation
- Guest blocking via ensureVerifiedUser() helper
- Admin full superadmin proxy for all roster operations
- costSetId column (u32, default 0) added to HsrCharacterCost, HsrLightconeCost, HsrSynergyCost
- HsrAccountLightcone table REMOVED from Phase 2 scope — no reducers for it

### Claude's Discretion
- Exact guest blocking pattern (ensureVerifiedUser helper vs inline check)
- isActive handling details (keep as default preference column — Claude decides specifics)
- Reducer file organization and naming conventions
- Index strategy for new archetype tables
- Whether isDuplicateUid recalculation uses a helper or inline logic

### Deferred Ideas (OUT OF SCOPE)
- Enka Network API integration for UID validation + character auto-import — v1 frontend milestone
- Cost sets full implementation (CostSet table, clone reducer, TO management) — Phase 3
- Lightcone ownership tracking (HsrAccountLightcone) — removed from scope
- Tournament multi-account signup enforcement — Phase 3
- 3-state roster visibility on lobbies/tournaments (enum replacing boolean) — Phase 3/9
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ROST-01 | User can create an HSR account entry with a display label and set it as active | HsrAccount table exists; create_hsr_account reducer with UID validation, region derivation, 5-account limit, auto-active first account |
| ROST-02 | User can add owned characters with eidolon level (0-6) to an HSR account | HsrAccountCharacter table exists; batch_upsert_characters reducer validates against HsrCharacter.name, atomic batch |
| ROST-03 | User can add owned lightcones with superimposition level (1-5) to an HSR account | **DESCOPED by CONTEXT.md** — HsrAccountLightcone table exists but NO reducers in Phase 2. Requirement satisfied by schema existence from Phase 1; functional reducers deferred. |
| ROST-04 | User can manage multiple HSR accounts and select which is active for play | isActive as default preference; update_hsr_account for label/visibility; delete_hsr_account with cascade + auto-activate oldest; migrate_roster for copy/move |
| ROST-05 | Admin can add/edit roster entries on behalf of any user | admin_proxy_* reducers following ensureAdmin() pattern from existing admin.ts |
| ROST-06 | User can set roster visibility to public or private | isRosterPublic and isRatingPublic toggles on HsrAccount, updated via update_hsr_account reducer |
| ROST-07 | Roster visibility is overridden by lobby/tournament open-roster settings | Lobby.isOpenRoster column already exists; subscription-level enforcement when entering open-roster lobby (Phase 9 lobby reducers will use this; Phase 2 establishes the data model) |
| ROST-08 | Account rating is calculated from roster composition | **DESCOPED to frontend** — backend provides raw data (roster + cost tables + archetype tags); frontend computes rating from subscribed data. No backend reducer needed. |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spacetimedb/server | 2.0.x | Table definitions, reducers, schema | Project's backend framework |
| spacetimedb | 2.0.x | Shared types (Timestamp, ScheduleAt) | Core dependency |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| ensurePermissions.ts | local | Auth guards (getAuthenticatedUser, ensureAdmin) | Every reducer |
| auditColumns.ts | local | Audit field injection (auditInsert, auditUpdate) | Every table write |

### Alternatives Considered
None — this phase uses only the established project stack with no new dependencies.

## Architecture Patterns

### Recommended Project Structure
```
spacetimedb/src/
├── tables/
│   ├── hsrAccount.ts          # MODIFY: add isRatingPublic, isDuplicateUid columns
│   ├── hsrAccountCharacter.ts # EXISTS: no changes needed
│   ├── hsrAccountLightcone.ts # EXISTS: DO NOT add reducers (descoped)
│   ├── archetype.ts           # NEW: Archetype table (admin-managed)
│   ├── hsrCharacterArchetype.ts # NEW: junction table
│   ├── hsrCharacterCost.ts    # MODIFY: add costSetId column
│   ├── hsrLightconeCost.ts    # MODIFY: add costSetId column
│   └── hsrSynergyCost.ts      # MODIFY: add costSetId column
├── reducers/
│   ├── roster.ts              # NEW: user-facing roster reducers
│   ├── rosterAdmin.ts         # NEW: admin proxy reducers + archetype CRUD
│   └── admin.ts               # MODIFY: add archetype bulk upsert support
├── helpers/
│   ├── ensurePermissions.ts   # MODIFY: add ensureVerifiedUser()
│   └── rosterHelpers.ts       # NEW: deriveRegion(), validateUid(), recalcDuplicateUid()
├── types/
│   └── enums.ts               # MODIFY: add Region enum if desired (or keep as string)
├── schema.ts                  # MODIFY: register Archetype, HsrCharacterArchetype
├── index.ts                   # MODIFY: export new reducers
└── docs/roster/README.md      # MODIFY: update with new reducer flows
```

### Pattern 1: Batch Reducer with Atomic Validation
**What:** All-or-nothing batch operations where every item is validated before any writes occur
**When to use:** batch_upsert_characters, batch_remove_characters, admin proxy operations
**Example:**
```typescript
// Source: Established pattern from admin.ts admin_bulk_upsert
export const batch_upsert_characters = spacetimedb.reducer(
  { hsrAccountId: t.u32(), characters: t.string() }, // JSON array
  (ctx, { hsrAccountId, characters }) => {
    const user = ensureVerifiedUser(ctx);
    const account = ctx.db.HsrAccount.id.find(hsrAccountId);
    if (!account) throw new SenderError('HSR account not found');
    if (account.userId !== user.id) throw new SenderError('Not your account');

    const items: Array<{characterName: string, eidolonLevel: number}> = JSON.parse(characters);

    // Phase 1: Validate ALL items before writing ANY
    for (const item of items) {
      if (!ctx.db.HsrCharacter.name.find(item.characterName)) {
        throw new SenderError(`Invalid character: "${item.characterName}"`);
      }
      if (item.eidolonLevel > 6) {
        throw new SenderError(`Invalid eidolon level for "${item.characterName}": must be 0-6`);
      }
    }

    // Phase 2: All valid — perform upserts
    for (const item of items) {
      // Composite PK lookup
      const existing = (ctx.db.HsrAccountCharacter as any).primaryKey.find({
        hsrAccountId, characterName: item.characterName
      });
      if (existing) {
        ctx.db.HsrAccountCharacter.delete(existing);
      }
      ctx.db.HsrAccountCharacter.insert({
        hsrAccountId,
        characterName: item.characterName,
        eidolonLevel: item.eidolonLevel,
        ...(existing ? auditUpdate(ctx, existing, user.id) : auditInsert(ctx, user.id)),
      } as any);
    }
  }
);
```

### Pattern 2: Guest Blocking Helper
**What:** Extends ensurePermissions.ts to block guest users from roster operations
**When to use:** All roster reducers (guests can browse but not modify)
**Example:**
```typescript
// Source: Follows existing ensureAdmin() pattern in ensurePermissions.ts
export function ensureVerifiedUser(ctx: any) {
  const user = getAuthenticatedUser(ctx);
  if (user.isGuest) {
    throw new SenderError("Roster management requires a verified account. Link your Discord first.");
  }
  return user;
}
```

### Pattern 3: UID Region Derivation
**What:** Auto-derive HSR region from UID first digit
**When to use:** create_hsr_account reducer
**Example:**
```typescript
const REGION_MAP: Record<string, string> = {
  '6': 'America',
  '7': 'Europe',
  '8': 'Asia',
  '9': 'TW_HK_MO',
};

export function deriveRegion(uid: string): string {
  const region = REGION_MAP[uid[0]];
  if (!region) throw new SenderError(`Invalid UID: first digit "${uid[0]}" does not map to a known region`);
  return region;
}

export function validateUid(uid: string): void {
  if (!/^\d{9}$/.test(uid)) {
    throw new SenderError('UID must be exactly 9 digits');
  }
  if (!REGION_MAP[uid[0]]) {
    throw new SenderError(`Invalid UID: first digit must be 6, 7, 8, or 9`);
  }
}
```

### Pattern 4: Cascade Delete with Auto-Activate
**What:** Hard delete HSR account + all child rows, then auto-activate oldest remaining
**When to use:** delete_hsr_account reducer
**Example:**
```typescript
// Delete all HsrAccountCharacter rows for this account
const characters = [...ctx.db.HsrAccountCharacter.hsr_acc_char_account_id.filter(hsrAccountId)];
for (const char of characters) {
  ctx.db.HsrAccountCharacter.delete(char);
}

// Delete the account itself
ctx.db.HsrAccount.id.delete(hsrAccountId);

// If this was the active account, activate the oldest remaining
if (account.isActive) {
  const remaining = [...ctx.db.HsrAccount.hsr_account_user_id.filter(user.id)];
  if (remaining.length > 0) {
    // Sort by createdDate to find oldest
    remaining.sort((a, b) => Number(a.createdDate.microsSinceUnixEpoch - b.createdDate.microsSinceUnixEpoch));
    ctx.db.HsrAccount.id.update({
      ...remaining[0],
      isActive: true,
      ...auditUpdate(ctx, remaining[0], user.id),
    });
  }
}
```

### Pattern 5: Duplicate UID Recalculation
**What:** Update isDuplicateUid flag across all accounts sharing a UID when accounts are created/deleted
**When to use:** After create_hsr_account and delete_hsr_account
**Example:**
```typescript
export function recalcDuplicateUid(ctx: any, uid: string, actorId: number): void {
  const accounts = [...ctx.db.HsrAccount.hsr_account_uid.filter(uid)];
  const isDuplicate = accounts.length > 1;
  for (const acc of accounts) {
    if (acc.isDuplicateUid !== isDuplicate) {
      ctx.db.HsrAccount.id.update({
        ...acc,
        isDuplicateUid: isDuplicate,
        ...auditUpdate(ctx, acc, actorId),
      });
    }
  }
}
```

### Anti-Patterns to Avoid
- **Returning data from reducers:** SpacetimeDB reducers are transactional and do not return data. Read via subscriptions.
- **Using .iter() when an index exists:** Always use `.find()` for PK lookups, `.filter()` for indexed columns. The HsrAccount table has btree indexes on userId and uid.
- **Trusting identity arguments:** Always resolve via `ctx.sender` -> UserIdentity -> User. Never accept a userId parameter from clients for self-operations.
- **Non-atomic batch validation:** Validate ALL items in a batch BEFORE writing ANY. If validation of item N fails after items 0..N-1 are written, data is inconsistent (reducers are transactional so this is technically safe in SpacetimeDB, but the pattern should be validate-first for clarity).
- **Multi-column index .filter():** This is BROKEN in SpacetimeDB — causes PANIC or silent empty results. Use single-column btree indexes only.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Auth resolution | Manual identity lookup | `getAuthenticatedUser(ctx)` from ensurePermissions.ts | Already handles UserIdentity -> User chain |
| Admin check | Inline role check | `ensureAdmin(ctx)` from ensurePermissions.ts | Consistent error messages, returns user |
| Audit fields | Manual timestamp/userId | `auditInsert(ctx, userId)` / `auditUpdate(ctx, existing, userId)` | Preserves created fields on update |
| Character name validation | Custom name lists | `ctx.db.HsrCharacter.name.find(characterName)` | HsrCharacter is the source of truth, admin-managed |
| Composite PK upsert | iter() + manual match | `(ctx.db.Table as any).primaryKey.find({...})` then delete + insert | Established pattern from admin.ts |

**Key insight:** The codebase already has mature patterns for every common operation. New reducers should compose existing helpers, not reinvent them.

## Common Pitfalls

### Pitfall 1: Schema Changes Require --clear-database
**What goes wrong:** Adding columns to existing published tables (HsrCharacterCost, HsrLightconeCost, HsrSynergyCost, HsrAccount) without defaults will fail on publish.
**Why it happens:** SpacetimeDB requires default values for new columns added to tables with existing data.
**How to avoid:** New columns (costSetId, isRatingPublic, isDuplicateUid) MUST have default values. If the module is already published with data, may need `--clear-database`.
**Warning signs:** Publish fails with schema migration errors.

### Pitfall 2: Forgetting to Register New Tables in schema.ts
**What goes wrong:** New Archetype and HsrCharacterArchetype tables exist as files but aren't queryable.
**Why it happens:** Tables must be imported AND passed to the `schema({...})` call.
**How to avoid:** Checklist: 1) Create table file, 2) Import in schema.ts, 3) Add to schema() object, 4) Export new reducers in index.ts.
**Warning signs:** `ctx.db.Archetype` is undefined at runtime.

### Pitfall 3: Composite PK Lookup Syntax
**What goes wrong:** Using `ctx.db.HsrAccountCharacter.find(...)` fails because composite PK tables don't have a single-column `.find()` accessor.
**Why it happens:** SpacetimeDB generates accessors based on PK structure — composite PKs need the cast pattern.
**How to avoid:** Use `(ctx.db.HsrAccountCharacter as any).primaryKey.find({ hsrAccountId, characterName })` for composite PK lookups.
**Warning signs:** TypeScript errors or undefined results when looking up junction table rows.

### Pitfall 4: Modifying Immutable Fields
**What goes wrong:** Allowing UID or region updates after account creation.
**Why it happens:** The update reducer doesn't check which fields are being changed.
**How to avoid:** The update_hsr_account reducer should ONLY accept displayLabel, isActive, isRosterPublic, and isRatingPublic. UID and region are set at creation and never changed. Typo = delete + recreate.
**Warning signs:** User changes UID, previous duplicate UID flags become stale.

### Pitfall 5: Not Deactivating Other Accounts When Setting Active
**What goes wrong:** Multiple accounts have isActive = true for the same user.
**Why it happens:** Setting isActive on one account without clearing it on others.
**How to avoid:** When setting isActive = true on account X, iterate user's other accounts and set isActive = false.
**Warning signs:** Frontend shows multiple "active" accounts.

### Pitfall 6: Forgetting to Export Reducers in index.ts
**What goes wrong:** Reducers compile but are not callable from clients.
**Why it happens:** SpacetimeDB only includes reducers that are exported from the module entry point.
**How to avoid:** Every new reducer file must have its exports added to `spacetimedb/src/index.ts`.
**Warning signs:** Client-side `conn.reducers.xyz` is undefined.

## Code Examples

### HSR Account Creation
```typescript
// Source: Follows auth.ts login_as_guest pattern
export const create_hsr_account = spacetimedb.reducer(
  { uid: t.string(), displayLabel: t.string() },
  (ctx, { uid, displayLabel }) => {
    const user = ensureVerifiedUser(ctx);

    validateUid(uid);
    const region = deriveRegion(uid);

    // Check 5-account limit
    const existing = [...ctx.db.HsrAccount.hsr_account_user_id.filter(user.id)];
    if (existing.length >= 5) {
      throw new SenderError('Maximum 5 HSR accounts per user');
    }

    // Auto-default label
    const label = displayLabel.trim() || `Account ${existing.length + 1}`;

    // First account auto-activates; deactivate others if needed
    const isFirst = existing.length === 0;

    const newAccount = ctx.db.HsrAccount.insert({
      id: 0, // autoInc
      userId: user.id,
      uid,
      region,
      displayLabel: label,
      isActive: isFirst,
      isRosterPublic: false,
      isRatingPublic: false,
      isDuplicateUid: false,
      ...auditInsert(ctx, user.id),
    } as any);

    // Recalculate duplicate UID flags
    recalcDuplicateUid(ctx, uid, user.id);
  }
);
```

### Archetype Table Definition
```typescript
// Source: Follows hsrCharacter.ts pattern
import { table, t } from 'spacetimedb/server';

export const archetypeColumns = {
  id: t.u32().primaryKey().autoInc(),
  name: t.string().unique(),
  description: t.string(),
  createdById: t.u32(),
  createdDate: t.timestamp(),
  lastModifiedById: t.u32(),
  lastModifiedDate: t.timestamp(),
};

export const Archetype = table({
  name: 'archetype',
  public: true,
}, archetypeColumns);
```

### HsrCharacterArchetype Junction Table
```typescript
import { table, t } from 'spacetimedb/server';

export const hsrCharacterArchetypeColumns = {
  characterName: t.string(),
  archetypeId: t.u32(),
  createdById: t.u32(),
  createdDate: t.timestamp(),
  lastModifiedById: t.u32(),
  lastModifiedDate: t.timestamp(),
};

export const HsrCharacterArchetype = table({
  name: 'hsr_character_archetype',
  public: true,
  primaryKey: ['characterName', 'archetypeId'],
  indexes: [
    { name: 'hsr_char_arch_char', accessor: 'hsr_char_arch_char', algorithm: 'btree', columns: ['characterName'] },
    { name: 'hsr_char_arch_arch', accessor: 'hsr_char_arch_arch', algorithm: 'btree', columns: ['archetypeId'] },
  ],
}, hsrCharacterArchetypeColumns);
```

### Roster Migration Reducer
```typescript
export const migrate_roster = spacetimedb.reducer(
  { sourceAccountId: t.u32(), targetAccountId: t.u32(), mode: t.string() },
  (ctx, { sourceAccountId, targetAccountId, mode }) => {
    const user = ensureVerifiedUser(ctx);
    if (mode !== 'copy' && mode !== 'move') {
      throw new SenderError('Mode must be "copy" or "move"');
    }

    const source = ctx.db.HsrAccount.id.find(sourceAccountId);
    const target = ctx.db.HsrAccount.id.find(targetAccountId);
    if (!source || !target) throw new SenderError('Account not found');
    if (source.userId !== user.id || target.userId !== user.id) {
      throw new SenderError('Both accounts must belong to you');
    }

    const sourceChars = [...ctx.db.HsrAccountCharacter.hsr_acc_char_account_id.filter(sourceAccountId)];

    for (const char of sourceChars) {
      // Upsert into target (overwrite if exists)
      const existingInTarget = (ctx.db.HsrAccountCharacter as any).primaryKey.find({
        hsrAccountId: targetAccountId, characterName: char.characterName
      });
      if (existingInTarget) {
        ctx.db.HsrAccountCharacter.delete(existingInTarget);
      }
      ctx.db.HsrAccountCharacter.insert({
        hsrAccountId: targetAccountId,
        characterName: char.characterName,
        eidolonLevel: char.eidolonLevel,
        ...(existingInTarget ? auditUpdate(ctx, existingInTarget, user.id) : auditInsert(ctx, user.id)),
      } as any);
    }

    // If move mode, delete source characters
    if (mode === 'move') {
      for (const char of sourceChars) {
        ctx.db.HsrAccountCharacter.delete(char);
      }
    }
  }
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Global isActive enforcement | isActive as default preference, per-lobby selection | Phase 2 CONTEXT | Simplifies account switching, no cooldown needed |
| Backend rating cache + recalculation reducer | Frontend-computed rating from raw data | Phase 2 CONTEXT | Eliminates backend rating reducer entirely |
| Lightcone ownership tracking | Removed from scope | Phase 2 CONTEXT | No HsrAccountLightcone reducers needed |
| Per-item reducers | Batch-only reducers | Phase 2 CONTEXT | Fewer reducer calls, atomic validation |
| User-input region | Auto-derived from UID first digit | Phase 2 CONTEXT | One fewer input field, fewer validation errors |

**Deprecated/outdated:**
- Row Level Security (RLS) in SpacetimeDB: deprecated, use views instead for data visibility
- Multi-column index .filter(): BROKEN in current SpacetimeDB, use single-column indexes

## Open Questions

1. **costSetId Default Value Mechanism**
   - What we know: costSetId (u32, default 0) needs to be added to three cost tables
   - What's unclear: SpacetimeDB may or may not support column-level defaults for existing tables. Adding a new column to a published table with existing rows requires a default value — but the SDK uses `t.u32()` without a `.default()` method visible in the codebase
   - Recommendation: This will likely require `--clear-database` republish. Document this as a breaking schema change requiring data re-import via admin_bulk_upsert.

2. **Composite PK .primaryKey.find() Reliability**
   - What we know: The pattern `(ctx.db.Table as any).primaryKey.find({...})` is used in admin.ts for LobbyMember
   - What's unclear: Whether this works reliably for all composite PK tables or has edge cases
   - Recommendation: Use the established pattern from admin.ts. If it fails, fall back to index filter + manual match (the btree index on hsrAccountId covers the common case).

3. **User Deletion Cascade for HSR Data**
   - What we know: UserDeletionJob exists with a 5-second delayed hard-delete. CONTEXT says "hard delete all HSR data."
   - What's unclear: Whether the existing userDeletion.ts reducer already cascades to HSR tables or needs modification
   - Recommendation: Check and extend the user deletion reducer to also delete HsrAccount rows (which will need their own cascade to HsrAccountCharacter). This is a modification to existing Phase 1 code.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | SpacetimeDB module publish + manual reducer calls |
| Config file | spacetimedb/spacetime.json |
| Quick run command | `spacetime publish hsrpvp-test --clear-database -y --module-path spacetimedb` |
| Full suite command | Publish + call reducers via client or `spacetime sql` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ROST-01 | Create HSR account with UID validation, region derivation | smoke | Publish module + call create_hsr_account via client | No test harness |
| ROST-02 | Batch upsert characters with name validation | smoke | Call batch_upsert_characters with valid/invalid names | No test harness |
| ROST-03 | Lightcone ownership | manual-only | **DESCOPED** — schema exists from Phase 1 | N/A |
| ROST-04 | Multiple account management, active switching | smoke | Create multiple accounts, verify isActive toggle | No test harness |
| ROST-05 | Admin proxy operations | smoke | Call admin roster reducers as admin user | No test harness |
| ROST-06 | Visibility toggle | smoke | Call update_hsr_account with visibility flags | No test harness |
| ROST-07 | Lobby override of visibility | manual-only | Requires lobby system (Phase 9) — data model validated only | N/A |
| ROST-08 | Rating from roster | manual-only | **DESCOPED to frontend** — verify raw data availability only | N/A |

### Sampling Rate
- **Per task commit:** `spacetime publish hsrpvp-test --clear-database -y --module-path spacetimedb` (validates compilation)
- **Per wave merge:** Full publish + manual reducer call verification via client
- **Phase gate:** Module publishes cleanly, all reducers callable, validation errors trigger correctly

### Wave 0 Gaps
- [ ] No automated test framework for SpacetimeDB reducers (this is a platform limitation — tests are manual publish + call)
- [ ] User deletion cascade needs extension for HSR data (check existing `run_user_deletion` reducer)

## Sources

### Primary (HIGH confidence)
- Project codebase: `spacetimedb/src/helpers/ensurePermissions.ts` — auth patterns
- Project codebase: `spacetimedb/src/helpers/auditColumns.ts` — audit trail patterns
- Project codebase: `spacetimedb/src/reducers/admin.ts` — bulk upsert, validation, composite PK patterns
- Project codebase: `spacetimedb/src/reducers/profile.ts` — user update reducer pattern
- Project codebase: `spacetimedb/src/tables/*.ts` — all existing table definitions
- Project skill: `.claude/skills/spacetimedb/SKILL.md` — SpacetimeDB TypeScript patterns, naming conventions, data access best practices
- Project skill: `.claude/skills/spacetimedb/references/api-guide.md` — views, subscriptions, common mistakes

### Secondary (MEDIUM confidence)
- CONTEXT.md decisions — user-confirmed architectural choices from discuss-phase
- SpacetimeDB v2.0.3 SDK documentation — table definition, reducer patterns

### Tertiary (LOW confidence)
- costSetId default value handling — unclear if SpacetimeDB supports column defaults for migration without --clear-database

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all patterns directly observed in existing codebase
- Architecture: HIGH - follows established project patterns exactly, no new libraries
- Pitfalls: HIGH - identified from codebase patterns and SpacetimeDB skill documentation
- Schema changes: MEDIUM - costSetId addition may require --clear-database depending on current publish state

**Research date:** 2026-03-16
**Valid until:** 2026-04-16 (stable — no external dependency changes expected)
