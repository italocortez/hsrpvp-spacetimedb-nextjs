# Phase 15: Backend pre-work — Research

**Researched:** 2026-04-12
**Domain:** SpacetimeDB backend (schema + views + router + seed pipeline)
**Confidence:** HIGH

## Summary

All 28 decisions in CONTEXT.md (D-01..D-28) are technically feasible against the current codebase. Every reference point cited in CONTEXT.md was verified by reading the actual source: view filter patterns match `securityViews.ts:378` (direct-index) and `:710` (tournament-style cross-table iteration); `admin_bulk_upsert` at `admin.ts:251` is structured exactly as described with the `validateKeys` strict-keys contract that makes partial-update semantics a deliberate design decision rather than a syntactic tweak; the 5 history tables all carry the indexes needed for `ctx.sender` filtering without schema changes; and the seed duplication between `scripts/seed-data.ts` and `test/shared/seed-data.ts` is real and must be reworked in lock-step with the new template shape.

Two findings the planner should foreground: (1) **the `HsrCharacterCost` PK is already `[characterName, gameMode, costSetId]`** (D-09's "bug" is that the reducer's existence check ignores `costSetId` — the PK itself is correct, and an appropriate index `by_character_mode_and_set` already exists, so the fix is purely in the reducer's match predicate, not schema); (2) **views are not subscribable through the typed client bindings** per `test/backend/auth/auth-views.test.ts` — this has downstream impact on FOUND-02 success criterion #4 ("covered by integration tests") and is a known platform limitation that predates this phase. The planner must pick a testing path (raw SQL on the *backing tables* filtered by userId, or WebSocket subscription by view name, or defer to manual UAT).

**Primary recommendation:** Treat CONTEXT.md decisions as locked. The planner's main task is ordering (reorg → schema → router → views → seed → tests → docs), a concrete test harness choice, and a partial-update JSON convention.

## User Constraints (from CONTEXT.md)

### Locked Decisions

**View file reorganization (lands first, D-01..D-04):**
- Split `securityViews.ts` (915 lines) + `anonymousViews.ts` (453 lines) into 8 domain files: `lobbyViews.ts` (4), `identityViews.ts` (5), `costSetViews.ts` (4), `statsViews.ts` (2), `socialViews.ts` (3), `matchViews.ts` (2), `matchHistoryViews.ts` (3 existing + 5 new = 8), `tournamentViews.ts` (7).
- Move-only refactor — no semantic changes, no view rename. `spacetimedb.view(...)` calls preserved verbatim. Only import paths change. `index.ts` re-exports stay identical.
- Refactor commits BEFORE the new history views so the 5 new views land in their permanent home.

**Spine + positioning columns on hsr_character (D-05..D-07, D-05a..D-05c):**
- Add 3 Spine columns: `skelUrl: t.string().optional()`, `atlasUrl: t.string().optional()`, `atlasImgUrls: t.array(t.string())`.
- Add 3 positioning columns: `posX: t.i32()`, `posY: t.i32()`, `width: t.i32()` (defaults to `0` when absent).
- Optional semantics over empty-string sentinels for Spine; required i32 with 0 defaults for positioning (mirrors `HsrLightcone`).
- Character positioning scoped to `image_url` card rendering only — Pedestal offsets are deferred to Phase 31.
- `HsrLightcone.posX/posY/width` already exist — no schema change, but the router partial-update fix still applies.

**Admin router rework (D-08..D-12):**
- `admin_bulk_upsert` at `reducers/admin.ts:251` reworked for true partial-update semantics across all 5 table cases (`HsrCharacter`, `HsrLightcone`, `HsrCharacterCost`, `HsrSynergyCost`, `HsrLightconeCost`). Only merge keys actually present in incoming JSON on an existing row; never inject defaults that zero unsent fields.
- `HsrCharacterCost` existing-row match uses full `(characterName, gameMode, costSetId)` tuple (D-09). `costSetId=0` remains the default-set sentinel.
- No dedicated `set_character_spine_assets` reducer — Spine columns ride the existing router (D-11).
- Insert-case still applies required defaults; partial-update semantics only kick in when `existing` is found (D-12).

**Self-scoped history views — 5 not 4 (D-13..D-16):**
- `view_my_match_session_history` (backed by `match_session_history`)
- `view_my_match_session_step_history` (backed by `match_session_step_history`)
- `view_my_match_participant_history` (backed by `match_participant_history`)
- `view_my_mmr_history` (backed by `mmr_history`)
- `view_my_match_result_game_history` (backed by `match_result_game_history`)
- All `public: true` — visibility gated server-side by `ctx.sender` (matches 23 existing `view_my_*`).
- Planner MUST update `ROADMAP.md:70,133,134` and `REQUIREMENTS.md:19` from 4 abbreviated names to 5 canonical ones (D-14).

**View filter pattern (D-17..D-19):**
- Direct `userId` filter on `MatchParticipantHistory.by_user` + `MmrHistory.user_id` (D-17).
- Participant-first iteration for tables WITHOUT `userId` — collect `matchHistoryId`s via `MatchParticipantHistory.by_user.filter(userId)`, then lookup each target row by PK/index (D-18).
- Complexity O(user's matches), not O(all matches) (D-19).

**Seed / template / data rework (D-22..D-28):**
- Canonical templates at `test/data-templates/{characters,lightcones,pairing}_template.json` are the contract. snake_case keys, `cost` wrapper with `cost_set_id` + 3 per-mode blocks (`memory_of_chaos`, `apocalyptic_shadow`, `anomaly_arbitration`), `positioning` optional, Spine fields on characters only.
- Data files at `test/data/*_table.json` already migrated (D-23/D-24/D-24a); `*_table_old.json` preserved.
- Rework both `scripts/seed-data.ts` (378L, production) and `test/shared/seed-data.ts` (182L, test) in one commit to consume the new shape; `cost.cost_set_id` lifts to each row's `costSetId`; `AnomalyArbitration` ingested for all three (character/lightcone/pairing); pairing `source_name`/`target_name` replaces `source`/`pair_target`.
- Router (`admin_bulk_upsert`) does NOT change shape — still accepts camelCase rows. snake_case handling stays in seed scripts (D-27).
- `test/data-templates/README.md` transform tables rewritten (D-26).
- `_new` template rename step is superseded (D-28).

**Integration tests (D-20, D-21, D-21a):**
- Cross-user isolation tests for all 5 new views (test-file creation authorized by FOUND-02 success criteria #4).
- `HsrCharacterCost` with distinct `costSetId`s doesn't collide; `HsrCharacter` partial updates preserve unsent fields.
- Seed round-trip: `post-publish.ts` on clean DB lands Spine + positioning + 3-mode costs.

### Claude's Discretion

- Test runner/harness for the new integration tests (follow existing `test/backend/**/*.test.ts` pattern).
- Wire format for partial-update semantic (does `null` mean "clear field" vs "leave unchanged"?) — planner picks and documents.
- Audit-log / `console.log` wording.
- Ordering within a single commit when the reorg + new views share a file.
- Whether to extract shared transform to `test/shared/transforms.ts` (or `scripts/shared/`) during this phase or defer as follow-up.
- Deletion of `*_table_old.json` reference files after verify-work green.

### Deferred Ideas (OUT OF SCOPE)

- `view_my_match_result_participant` (non-history).
- Per-field Spine setter reducers.
- Broader admin reducer audit beyond the 5 router cases (e.g., `admin_update_user`, `admin_delete_row` untouched).
- Schema denormalization of `userId` onto `match_session_history`.
- Phase 40 per-game rendering (replay UI).

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | Spine columns (`skelUrl`, `atlasUrl`, `atlasImgUrls`) + admin editing reducer | D-05 schema additions to `hsrCharacterColumns`; D-10 admin router partial-update fold-in; D-11 no dedicated setter. Verified current `hsrCharacter.ts` has no Spine columns; current `admin_bulk_upsert` `HsrCharacter` case at `admin.ts:262-285` is the rework target. |
| FOUND-02 | Self-scoped history views filtered by `ctx.sender` | D-13 defines 5 canonical view names. D-17 direct-userId pattern + D-18 participant-first iteration pattern both have working precedents in the codebase (`view_my_character_stats` at `securityViews.ts:378`; `view_my_tournament_matches` at `:710`). D-14 identifies the REQUIREMENTS.md line that must be updated from 4→5 views. |

## Project Constraints (from CLAUDE.md)

**SpacetimeDB core rules (always in context):**
1. Reducers are transactional — no return data to callers.
2. Reducers must be deterministic — no filesystem/network/timers/random.
3. Read data via tables/subscriptions — not reducer return values.
4. Auto-increment IDs are not sequential — don't use for ordering.
5. `ctx.sender` is the authenticated principal — never trust identity args.
6. Energy budget matters — egress dominates maincloud cost.

**Docs maintenance:**
- Architecture docs (`docs/{feature}/architecture.md`) MUST be updated every time backend code changes. Phase 15 touches: new columns on `hsr_character` (needs `docs/game-data/architecture.md`), new views on history tables (needs `docs/match-results/architecture.md` or `docs/views/architecture.md`).
- Behavior specs (`docs/{feature}/contract.md`) — **never modified during execution**. After execution, add entries tagged `Phase 15 execution` so the user can distinguish Claude's additions from user decisions during `/gsd-verify-work`.
- Test files (`test/`) — no edits without explicit task. **FOUND-02 success criterion #4 explicitly authorizes creation of 5 new isolation tests**; that is the only authorized test-creation surface. Existing test files stay untouched unless they fail and are reported diagnostically.

**Editing behavior:**
- Smallest change necessary; do not touch unrelated files.
- Do not invent SpacetimeDB APIs — only use what exists in docs or repo.
- Do not add restrictions the prompt didn't ask for.

**Git safety (project-local `.claude/CLAUDE.md`):**
- NEVER delete or commit `.env.local` or `.env`.
- Worktrees spawn from last commit — commit before spawning worktrees.

**Naming conventions applicable to Phase 15:**
- Backend views: `snake_case` exported constants with `view_` prefix (`export const view_my_x`). Verified in `CONVENTIONS.md` + current codebase.
- Backend tables: `camelCase.ts` files. New view files must follow: `matchHistoryViews.ts`, `lobbyViews.ts`, etc.
- Backend view JSDoc pattern: section dividers + `// D-XX` inline references.

## Standard Stack

### Core (already installed, no new deps)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spacetimedb | ^2.0.3 (server) / 2.1.0 (client) | Backend runtime + generated bindings | Core platform. Verified in `spacetimedb/package.json` + `src/module_bindings/`. [VERIFIED: codebase] |
| vitest | existing | Test runner | Used across `test/backend/**/*.test.ts`. [VERIFIED: `test/backend/auth/auth-views.test.ts:1`] |
| tsx | existing | Run TypeScript scripts directly | `post-publish.ts` and `seed-data.ts` executed via `npx tsx`. [VERIFIED: `scripts/post-publish.ts` header] |

**No new libraries required.** Every pattern in CONTEXT.md is implementable with the current toolchain.

### Version verification

`spacetime publish` + `spacetime generate` after schema changes is the established deploy workflow (verified in `CLAUDE.md` + `ARCHITECTURE.md`). No upgrade needed for Phase 15.

## Architecture Patterns

### View Filter Patterns

**Pattern A: Direct index filter (for tables with `userId` column).** Used for `view_my_mmr_history` (via `mmr_history.user_id` btree) and `view_my_match_participant_history` (via `match_participant_history.by_user` btree).

Reference: `spacetimedb/src/views/securityViews.ts:378` — `view_my_character_stats`:

```typescript
export const view_my_character_stats = spacetimedb.view(
    { name: 'view_my_character_stats', public: true },
    t.array(PlayerCharacterStat.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        return [...ctx.db.PlayerCharacterStat.by_user.filter(mapping.userId)];
    }
);
```

**Applied to Phase 15:**
- `view_my_mmr_history` → `ctx.db.MmrHistory.user_id.filter(mapping.userId)`
- `view_my_match_participant_history` → `ctx.db.MatchParticipantHistory.by_user.filter(mapping.userId)`

**Pattern B: Cross-table iteration (for tables without `userId`).** Used for `view_my_match_session_history`, `view_my_match_session_step_history`, `view_my_match_result_game_history`. Seed the participant set first, then pull the per-match rows.

Reference: `spacetimedb/src/views/securityViews.ts:710` — `view_my_tournament_matches`:

```typescript
export const view_my_tournament_matches = spacetimedb.view(
    { name: 'view_my_tournament_matches', public: true },
    t.array(BracketMatch.rowType),
    (ctx) => {
        const resolved = getMyTournamentIds(ctx);
        if (!resolved || resolved.tournamentIds.size === 0) return [];
        const results: any[] = [];
        for (const tid of resolved.tournamentIds) {
            for (const row of ctx.db.BracketMatch.tournament_id.filter(tid)) {
                results.push(row);
            }
        }
        return results;
    }
);
```

**Applied to Phase 15 (skeleton):**

```typescript
// view_my_match_session_history — participant-first iteration
export const view_my_match_session_history = spacetimedb.view(
    { name: 'view_my_match_session_history', public: true },
    t.array(MatchSessionHistory.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const myMatchIds = new Set<number>();
        for (const p of ctx.db.MatchParticipantHistory.by_user.filter(mapping.userId)) {
            myMatchIds.add(p.matchHistoryId);
        }
        const results: any[] = [];
        for (const matchId of myMatchIds) {
            const row = ctx.db.MatchSessionHistory.id.find(matchId);
            if (row) results.push(row);
        }
        return results;
    }
);

// view_my_match_session_step_history — same seed, index filter on child
export const view_my_match_session_step_history = spacetimedb.view(
    { name: 'view_my_match_session_step_history', public: true },
    t.array(MatchSessionStepHistory.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const myMatchIds = new Set<number>();
        for (const p of ctx.db.MatchParticipantHistory.by_user.filter(mapping.userId)) {
            myMatchIds.add(p.matchHistoryId);
        }
        const results: any[] = [];
        for (const matchId of myMatchIds) {
            for (const step of ctx.db.MatchSessionStepHistory.by_match_history.filter(matchId)) {
                results.push(step);
            }
        }
        return results;
    }
);

// view_my_match_result_game_history — same pattern, by_match_history index exists
// view_my_match_participant_history — Pattern A (direct .by_user)
// view_my_mmr_history — Pattern A (direct .user_id)
```

**Index availability confirmed for all 5 views** (verified in table files):
- `MatchParticipantHistory.by_user` — ✓ (line 22 of `matchParticipantHistory.ts`)
- `MmrHistory.user_id` — ✓ (line 22 of `mmrHistory.ts`)
- `MatchSessionHistory.id` — PK ✓
- `MatchSessionStepHistory.by_match_history` — ✓ (line 25 of `matchSessionStepHistory.ts`)
- `MatchResultGameHistory.by_match_history` — ✓ (line 29 of `matchResultGameHistory.ts`)

**No new indexes required.**

### View File Reorganization Mechanics

Current state (verified): only `securityViews.ts` + `anonymousViews.ts` exist in `spacetimedb/src/views/`. **There is no `views/index.ts`**. Re-exports are centralised in `spacetimedb/src/index.ts` (lines 10-46).

Because registration relies on `export const view_xxx = spacetimedb.view(...)` being re-exported from `spacetimedb/src/index.ts` (Phase 12.2 breaking change — verified in `CONVENTIONS.md` lines 233-252 and in the barrel at `spacetimedb/src/index.ts:10-46`), moving a view between files requires:

1. Move the `export const view_xxx = ...` block to the new file.
2. Change the `export { ... } from './views/OLD_FILE'` line in `spacetimedb/src/index.ts` to point at the new file — **or** add a new grouped `export { ... } from './views/newFile'` block and remove from the old.
3. Preserve the `spacetimedb.view(...)` call verbatim. **Rename of view name string breaks generated bindings** (`src/module_bindings/view_xxx_table.ts` files are regenerated from the view name). D-03 locks this down: no view renames during reorg.

**Binding-surface invariant to verify post-reorg:** running `spacetime generate` produces the same set of `view_*_table.ts` files under `src/module_bindings/` as before. Grep check:

```bash
ls src/module_bindings/view_*_table.ts | wc -l
# Must equal: 29 existing files (pre-reorg) on the current mainline.
# Post-Phase-15 (after new views): 29 + 5 = 34.
```

### Admin router partial-update mechanics

**The `validateKeys` contract (admin.ts:51-71) is the controlling constraint.** Every row in `jsonData` must contain exactly the expected key set — no more, no less. This means "partial update" in this codebase cannot mean "omit keys from JSON" because that would trip `validateKeys`. Partial-update semantics must be expressed in the *values*, not in key presence.

**Recommended convention (planner's call per D-discretion):**
- JSON key present with `null` value → "do not modify this field on existing row" (preserve).
- JSON key present with non-null value → "set this field to the given value."
- On insert, `null` values fall back to schema defaults (`''`, `0`, `[]`, etc.) for required columns; for optional columns they remain `null`.

**Alternative convention:** relax `validateKeys` to accept a subset of keys. This is a larger scope change (touches `EXPECTED_KEYS` contract + all 5 table cases) and the CONTEXT.md prefers the minimal rework. Recommend the `null`-sentinel convention.

**Current bug at admin.ts:267-285 (HsrCharacter case):** the `row` object is built with aggressive default-injection:

```typescript
imageUrl: r.imageUrl || '',           // zeros the URL if unsent
versionReleased: r.versionReleased ?? 0,
treatAsVersion: r.treatAsVersion ?? 0,
```

Then spread `{ ...existing, ...row, ... }` means the defaulted values **overwrite** existing values on update. **Fix pattern (for update branch only):**

```typescript
if (existing) {
    const merged = { ...existing };
    if (r.name !== null) merged.displayName = r.displayName;
    if (r.aliases !== null) merged.aliases = r.aliases;
    if (r.imageUrl !== null) merged.imageUrl = r.imageUrl;
    // ... etc for every field
    if (r.skelUrl !== null) merged.skelUrl = r.skelUrl;  // optional — null OK
    if (r.atlasUrl !== null) merged.atlasUrl = r.atlasUrl;
    if (r.atlasImgUrls !== null) merged.atlasImgUrls = r.atlasImgUrls;
    if (r.posX !== null) merged.posX = r.posX;
    if (r.posY !== null) merged.posY = r.posY;
    if (r.width !== null) merged.width = r.width;
    ctx.db.HsrCharacter.name.update({ ...merged, ...auditUpdate(ctx, existing, admin.id) } as any);
} else {
    // Insert — apply defaults for required columns, null OK for optional
    const row = { /* full row with defaults where null */ };
    ctx.db.HsrCharacter.insert({ ...row, ...auditInsert(ctx, admin.id) } as any);
}
```

### HsrCharacterCost PK fix (D-09)

**Important finding:** the PK is already correct. Verified in `hsrCharacterCost.ts:20`:

```typescript
primaryKey: ['characterName', 'gameMode', 'costSetId'],
indexes: [
    { accessor: 'cost_set_id', algorithm: 'btree', columns: ['costSetId'] },
    { accessor: 'by_character_mode_and_set', algorithm: 'btree', columns: ['characterName', 'gameMode', 'costSetId'] },
],
```

The **bug is purely in the reducer's existence check** (`admin.ts:360-366`):

```typescript
let existing = null;
for (const e of ctx.db.HsrCharacterCost.iter()) {
    if (e.characterName === r.characterName && e.gameMode.tag === r.gameMode) {
        existing = e;  // Ignores costSetId — first match wins, costSetId=X is silently overwritten by costSetId=0 default
        break;
    }
}
```

**Fix:** use the existing composite index and add the `costSetId` equality:

```typescript
let existing: any = null;
for (const e of ctx.db.HsrCharacterCost.by_character_mode_and_set.filter(
    [r.characterName, { tag: r.gameMode, value: {} }, r.costSetId ?? 0]
)) {
    existing = e;
    break;
}
```

If the composite-filter API doesn't accept enum structs in the tuple (needs verification during execution), fallback to iter + full triple check:

```typescript
for (const e of ctx.db.HsrCharacterCost.iter()) {
    if (e.characterName === r.characterName &&
        e.gameMode.tag === r.gameMode &&
        e.costSetId === (r.costSetId ?? 0)) {
        existing = e;
        break;
    }
}
```

**Same fix shape applies to `HsrLightconeCost` (admin.ts:380-387) and `HsrSynergyCost` (admin.ts:416-423).** `HsrLightconeCost` PK is `[lightconeName, gameMode, costSetId]` (verified `hsrLightconeCost.ts:20`) — same three-field composite. `HsrSynergyCost` PK is auto-inc `id`; the "existing" check uses `(sourceName, targetName, gameMode)` and must also add `costSetId` (verified `hsrSynergyCost.ts:4-16`).

### Seed pipeline round-trip

**Flow:**

1. `spacetime publish --clear-database` (operator command)
2. `npx tsx scripts/post-publish.ts` (entry point, verified `scripts/post-publish.ts:180-256`)
   - Step 1-2: fresh connection → `register_server` → write `SPACETIMEDB_SERVER_TOKEN` to `.env.local` (lines 188-201).
   - Step 3: `await seedAll(token)` — imports from `./seed-data` (`scripts/seed-data.ts:257-358`).
   - Step 4-7: achievements, EloConfig, AccountRatingConfig, IdentityGcJob, LobbyGcJob.
3. `scripts/seed-data.ts` reads `test/data/{characters,lightcones,pairing}_table.json`, normalizes via `normalizeCharacters` / `normalizeLightcones` / `normalizePairings` (lines 95-223), calls `connection.reducers.adminBulkUpsert` for each table (line 294).

**Duplicated transform logic confirmed:** `test/shared/seed-data.ts:34-103` has a near-identical but **incomplete** implementation (no archetype junction seeding until lines 135-169, no 3-mode lightcone fan-out — only 2 modes hardcoded at line 29-32 shared mapping). Reworking both in lockstep is the decision.

**Gotcha detected in current `test/shared/seed-data.ts:29-32`:** the mapping is defined but only 2 modes are used in the lightcone loop (`Object.values(GAME_MODE_MAP)` — which is 3, so this is fine). But in `scripts/seed-data.ts:179` the constant `LIGHTCONE_GAME_MODES = ['MemoryOfChaos', 'ApocalypticShadow']` hardcodes 2. **This is exactly the staleness D-25 calls out.** The rework must drop this constant and iterate the full `GAME_MODE_MAP` values for lightcones + pairings (and drive character modes from the keys in `c.cost` as today).

**`post-publish.ts` audit (D-25a):** lines 79-167 seed achievements/configs but do NOT reference character/lightcone JSON fields directly — only `seedAll(token)` imported at line 21. **Minimal changes needed** to `post-publish.ts`; rework concentrates on `seed-data.ts`.

**Template shape verification (D-22):** `test/data-templates/characters_template.json:29-58` shows `cost` as a wrapping object with `cost_set_id: 0` plus 3 per-mode blocks — confirmed live. `pairing_template.json` confirms `source_name` / `target_name` rename. `lightcones_template.json:11-15` uses plain int for `positioning.width` — no `"120%"` string. All three templates consistent with D-22.

### Integration Test Pattern

**Harness:** `createVerifiedTestHarness()` in `test/shared/connection.ts:53-61` — used in roster/lobby tests. Requires `SPACETIMEDB_SERVER_TOKEN` from `.env.local`.

**Multi-user pattern — verified in `test/backend/lobby/lobby-presets.test.ts:83-86`:**

```typescript
toUser = await createVerifiedTestHarness();
modUser = await createVerifiedTestHarness();
adminUser = await createVerifiedTestHarness();
regularUser = await createVerifiedTestHarness();
```

Each call opens a fresh WebSocket with a new guest identity, then upgrades to verified via `server_link_provider` with a test Discord ID like `test_<timestamp>_<random>`. Each harness exposes `{ conn, identity, userId, call, sync, disconnect }`.

**Critical limitation — views are not subscribable through typed bindings.** Verified in `test/backend/auth/auth-views.test.ts:5-18`:

> SpacetimeDB views are virtual projections — they are NOT queryable via `spacetime sql` CLI ("no such table"). Views are only accessible via WebSocket subscriptions, but views don't generate typed client bindings (conn.db.ViewName is undefined). This means automated testing of view projections is currently not possible via the integration test harness.

However — `src/module_bindings/view_*_table.ts` files **do** exist (29 currently, regenerated after Phase 12.2). So `conn.db.ViewName` may in fact be defined now. **Planner must verify at Wave 0** by running `spacetime generate` after publishing and checking `conn.db.viewMyMmrHistory` is accessible from the test harness. If yes, the test can subscribe + assert rows. If no (still broken), fallback: assert behaviour via the **underlying tables** queried by SQL with a `user_id = X` filter — that validates the view's filter *logic* is correct without subscribing to the view itself.

**Recommended test shape (two-user isolation):**

```typescript
// test/backend/match-history/history-views-isolation.test.ts
describe('Self-scoped history views — cross-user isolation', () => {
  let userA: TestHarness;
  let userB: TestHarness;

  beforeAll(async () => {
    userA = await createVerifiedTestHarness();
    userB = await createVerifiedTestHarness();
    // Seed: one match with userA as participant, one with userB as participant
    // (either via direct SQL insert, or via running a full match flow)
  });

  it('view_my_mmr_history: userA sees only own rows', async () => {
    // Option 1 (if view bindings work): userA.conn.db.viewMyMmrHistory.iter() → only userA rows
    // Option 2 (fallback): SQL-query backing table with user_id filter and assert row set matches
  });
  // ... one test per view × participation + non-participation
});
```

### State-of-the-art: View registration

Phase 12.2 made `export const view_xxx = spacetimedb.view(...)` + named re-export from `spacetimedb/src/index.ts` **mandatory** — the old side-effect import pattern (`import './views/securityViews'`) no longer registers views. Verified in `CONVENTIONS.md:234-252`. This affects the reorg: every moved view MUST update its entry in the barrel at `spacetimedb/src/index.ts:10-46`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-user data isolation | Client-side `userId` filter in hooks | Server-side `view_my_*` with `ctx.sender` resolution | Single trust boundary; matches 23 existing views; isolation bug in one view affects only that view, not the entire app surface. |
| Partial-update field merge | Custom JSON Patch parser | Existing `validateKeys` + per-field `null` sentinel merge | The reducer already has strict key validation; adding a value-based sentinel is 10 LOC per table. A full Patch protocol is out of scope. |
| Composite-PK upsert | Rebuild row + delete/insert | `ctx.db.Table.index.update()` or composite-index `.filter()` | Already used elsewhere (`rosterMutations.ts:applyBatchUpsert` does exactly this). Don't reinvent; match the existing pattern. |
| Two-identity test harness | Raw WebSocket + token juggling | `createVerifiedTestHarness()` × 2 | `test/backend/lobby/lobby-presets.test.ts` proves the 4-user pattern works. Same for 2. |
| Snake→camel + 3-mode fan-out | Per-script normalizer | Shared `test/shared/transforms.ts` | Deduplicates between `scripts/seed-data.ts` and `test/shared/seed-data.ts`. Claude's discretion whether to extract in this phase or defer. |
| Subscription to raw history tables from feature pages | `useTable(tables.MatchSessionHistory)` in profile page | Subscribe to `view_my_match_session_history` | `PITFALLS.md:112-117` specifically warns against this shortcut — it leaks other users' rows. |

**Key insight:** every major problem in Phase 15 has an existing in-repo pattern. The work is primarily application, not invention.

## Runtime State Inventory

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `HsrCharacter` existing rows (82 records per `project_data_scale` memory) will receive 3 new Spine optional cols + 3 required i32 positioning cols. On schema publish, SpacetimeDB applies the new schema; existing rows get `null` (Spine) and `0` (positioning) defaults. `HsrCharacterCost` rows with `costSetId != 0` are currently at risk of silent overwrite — after the D-09 fix, previously lost rows cannot be recovered from code; they must be re-seeded. `test/data/characters_table.json` already migrated (D-23 confirmed by reading the template shape; assuming the same applies to the data file). | On `spacetime publish --clear-database` + `post-publish.ts`, new shape re-seeds cleanly. Without `--clear-database`, `admin_bulk_upsert` must be invoked for HsrCharacter to backfill Spine columns where desired. |
| Live service config | None — no Datadog, Cloudflare, Tailscale, or n8n integrations for this phase. | None. |
| OS-registered state | None — no Task Scheduler, pm2, launchd, or systemd artefacts involved. | None. |
| Secrets/env vars | `SPACETIMEDB_SERVER_TOKEN` in `.env.local` is the only secret touched — code reads it by exact name, never modified by this phase's code. Project-local `CLAUDE.md` explicitly forbids deleting or committing `.env.local` / `.env`. | None — name unchanged. |
| Build artifacts | `src/module_bindings/` (236 files) — **must be regenerated** after schema changes via `spacetime generate`. New files expected: `view_my_match_session_history_table.ts`, `view_my_match_session_step_history_table.ts`, `view_my_match_participant_history_table.ts`, `view_my_mmr_history_table.ts`, `view_my_match_result_game_history_table.ts` (5 new). `hsr_character_table.ts` updated with 6 new columns. | After schema + view changes: `spacetime publish` + `spacetime generate` (followed by `prettier --write` per `CONVENTIONS.md:45`). |

## Common Pitfalls

### Pitfall 1: View rename breaks client bindings
**What goes wrong:** Renaming `view_my_x` → `view_my_y` during the reorg creates a new `view_my_y_table.ts` and orphans every subscriber of `view_my_x`. Downstream phases still reference the old name.
**Why it happens:** The reorg feels cosmetic, so renaming "to match file" looks like a small improvement.
**How to avoid:** D-03 locks: move-only, no renames. Grep-check before commit: `git diff` must show zero lines matching `name: 'view_` unless introducing a new view.
**Warning signs:** `spacetime generate` produces a `view_XYZ_table.ts` file that didn't exist before AND an old one is gone.

### Pitfall 2: View not re-exported from `spacetimedb/src/index.ts`
**What goes wrong:** Phase 12.2 requires named re-export from the barrel. A view moved to `matchHistoryViews.ts` but left in the old barrel entry (e.g., `export { ... view_match_history } from './views/anonymousViews'`) will fail at registration.
**Why it happens:** It's easy to forget the barrel when focus is on the new file.
**How to avoid:** After every moved-or-added view, audit `spacetimedb/src/index.ts` lines 10-46 against the view's new file path. Verify by running `spacetime publish` — registration errors surface immediately.
**Warning signs:** `[registerExport]` warning in publish output; view returns 0 rows despite correct code.

### Pitfall 3: `validateKeys` rejects partial-update JSON
**What goes wrong:** Planner assumes "partial update = omit keys." First call sends `{ name, imageUrl }` and gets rejected with `Row 0 key mismatch: missing: [...]`.
**Why it happens:** `EXPECTED_KEYS` at `admin.ts:42-49` demands *every* non-audit column be present.
**How to avoid:** Convention: full key set required in JSON, `null` value means "preserve." Document this in the router comment and in `docs/game-data/architecture.md`.
**Warning signs:** First router test throws `Row X key mismatch`.

### Pitfall 4: `costSetId` sentinel collision
**What goes wrong:** Admin creates a non-default cost set (`costSetId = 5`), edits costs, then later re-runs the seed (`costSetId = 0` by default). Old reducer overwrites `costSetId=5` row with `costSetId=0` because existence check ignored the set.
**Why it happens:** The bug D-09 is fixing — verified live at `admin.ts:360-366`.
**How to avoid:** D-09 fix. Test D-21 specifically asserts distinct-`costSetId` rows don't collide.
**Warning signs:** After seeding, non-default cost sets vanish from `hsr_character_cost` table.

### Pitfall 5: Participant-first iteration blows subscription row budget
**What goes wrong:** At 100 users × 156 matches, each user's history view evaluates ~156 participant rows + fan-out to session/step/game rows. If evaluated on every delta, energy cost compounds.
**Why it happens:** SpacetimeDB re-evaluates views on relevant table changes; no memoization.
**How to avoid:** Verify no write amplification — history tables are written only on match finalization (low frequency). The read cost is per-subscriber on subscribe + delta, which is acceptable at 100 users. Flag for `tools/energy-model.js` check pre-merge.
**Warning signs:** Maincloud egress metric spike on dashboard after Phase 15 deploy.

### Pitfall 6: Seed script 2-mode lightcone constant leaks past the rework
**What goes wrong:** `scripts/seed-data.ts:179` has `LIGHTCONE_GAME_MODES = ['MemoryOfChaos', 'ApocalypticShadow']`. If the rework forgets to drop this, `anomaly_arbitration` costs silently skipped for lightcones only.
**How to avoid:** D-25 rework checklist. Test D-21a asserts 3-mode rows exist in `hsr_lightcone_cost` post-seed.
**Warning signs:** `SELECT count(*) FROM hsr_lightcone_cost` is 2x (not 3x) the lightcone count after seed.

### Pitfall 7: Schema publish without data migration strands existing rows
**What goes wrong:** Adding required `posX: t.i32()` to `hsr_character` without a default mechanism would fail schema migration on non-empty tables.
**Why it happens:** SpacetimeDB schema migrations for adding non-optional columns need a default; `t.i32()` without `.optional()` may require a migration spec.
**How to avoid:** Planner must decide: (a) always publish with `--clear-database` (matches existing `post-publish.ts` flow — simplest), OR (b) provide a schema migration that defaults `posX`/`posY`/`width` to 0. **Recommendation: (a)** because `.planning/STATE.md` says v0.5 shipped cleanly and Phase 15 is the first v0.9 commit — clear-database is acceptable.
**Warning signs:** `spacetime publish` fails with migration error mentioning `hsr_character`.

## Code Examples

### Example: New view in `matchHistoryViews.ts`

```typescript
// spacetimedb/src/views/matchHistoryViews.ts
import spacetimedb from '../schema';
import { t } from 'spacetimedb/server';
import { MatchSessionHistory } from '../tables/matchSessionHistory';
import { MatchParticipantHistory } from '../tables/matchParticipantHistory';
import { MatchSessionStepHistory } from '../tables/matchSessionStepHistory';
import { MatchResultGameHistory } from '../tables/matchResultGameHistory';
import { MmrHistory } from '../tables/mmrHistory';

// ---------------------------------------------------------------------------
// view_my_match_session_history — caller's own session history rows.
// Participant-first iteration via MatchParticipantHistory.by_user index.
// (Phase 15, D-13, D-18)
// ---------------------------------------------------------------------------
export const view_my_match_session_history = spacetimedb.view(
    { name: 'view_my_match_session_history', public: true },
    t.array(MatchSessionHistory.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const myMatchIds = new Set<number>();
        for (const p of ctx.db.MatchParticipantHistory.by_user.filter(mapping.userId)) {
            myMatchIds.add(p.matchHistoryId);
        }
        const results: any[] = [];
        for (const matchId of myMatchIds) {
            const row = ctx.db.MatchSessionHistory.id.find(matchId);
            if (row) results.push(row);
        }
        return results;
    }
);

// Remaining 4 views follow the same structure — see RESEARCH.md §Architecture Patterns.
```

### Example: Updated `spacetimedb/src/index.ts` barrel (excerpt)

```typescript
// New grouped export for the 8 domain view files:
export {
    view_my_lobbies,
    view_my_lobby_chat,
    view_my_lobby_members,
    view_lobby_browser,
} from './views/lobbyViews';

export {
    view_my_profile,
    view_my_identity,
    view_user_directory,
    view_public_accounts,
    view_admin_user_private,
} from './views/identityViews';

// ... 6 more blocks ...

export {
    view_match_history,
    view_match_participant_history,
    view_match_step_history,
    view_my_match_session_history,         // NEW (D-13)
    view_my_match_session_step_history,    // NEW (D-13)
    view_my_match_participant_history,     // NEW (D-13)
    view_my_mmr_history,                   // NEW (D-13)
    view_my_match_result_game_history,     // NEW (D-13)
} from './views/matchHistoryViews';
```

### Example: `HsrCharacter` table with Spine + positioning

```typescript
// spacetimedb/src/tables/hsrCharacter.ts
export const hsrCharacterColumns = {
    name: t.string().primaryKey(),
    displayName: t.string(),
    aliases: t.array(t.string()),
    rarity: t.u8(),
    path: Path,
    element: Element,
    role: CharRole,
    imageUrl: t.string(),
    versionReleased: t.f64(),
    treatAsVersion: t.f64(),

    // NEW (Phase 15, D-05): Spine asset URLs — optional, most characters lack Spine.
    skelUrl: t.string().optional(),
    atlasUrl: t.string().optional(),
    atlasImgUrls: t.array(t.string()),  // empty array = no Spine

    // NEW (Phase 15, D-05a): Card positioning — required i32 with 0 defaults.
    posX: t.i32(),
    posY: t.i32(),
    width: t.i32(),

    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
```

### Example: Two-user isolation test skeleton

```typescript
// test/backend/match-history/history-views-isolation.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createVerifiedTestHarness, hasServerToken, queryPrivateTable, type TestHarness } from '../../shared/connection';

describe.skipIf(!hasServerToken())('Self-scoped history views — cross-user isolation (Phase 15, D-20)', () => {
  let userA: TestHarness;
  let userB: TestHarness;

  beforeAll(async () => {
    userA = await createVerifiedTestHarness();
    userB = await createVerifiedTestHarness();
    // Seed distinct match history rows for each user.
    // Strategy: direct SQL inserts via an admin-authorized helper, OR replay a lightweight
    // lobby→finalize flow for each user. Planner picks.
  });

  afterAll(async () => {
    await userA?.disconnect();
    await userB?.disconnect();
  });

  it('view_my_mmr_history isolates userA rows from userB', async () => {
    // IF view bindings are wired (post-publish, regenerated):
    //   const aRows = [...userA.conn.db.viewMyMmrHistory.iter()];
    //   expect(aRows.every(r => r.userId === userA.userId)).toBe(true);
    //   expect(aRows.some(r => r.userId === userB.userId)).toBe(false);
    // FALLBACK (view bindings unusable):
    //   const rows = await queryPrivateTable(`SELECT * FROM mmr_history WHERE user_id = ${userA.userId}`);
    //   expect(rows.length).toBeGreaterThan(0);
    //   expect(rows.every(r => Number(r.user_id) === userA.userId)).toBe(true);
    //   // Then cross-check: userB's mmr_history rows exist but NOT in userA's view.
  });

  // Repeat for: view_my_match_session_history, view_my_match_session_step_history,
  // view_my_match_participant_history, view_my_match_result_game_history.
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Side-effect view import (`import './views/securityViews'`) | Named re-export from `spacetimedb/src/index.ts` | Phase 12.2 | Every new view MUST be added to the barrel. |
| `_then()` reducer callback | `.catch()` on `Promise<void>` | Phase 12.2 (SDK 2.1.0) | Seed scripts use `await` + `.catch` — already current. |
| Fixed 500ms `sync()` | `onApplied` callback | Phase 14 | New tests use the current `createVerifiedTestHarness` which bakes this in. |
| 2-mode lightcone cost constant | 3-mode fan-out from `GAME_MODE_MAP` | Phase 15 (this phase) | Must drop `LIGHTCONE_GAME_MODES = [...]` in seed-data.ts. |

**Deprecated/outdated:**
- `test/data-templates/README.md` transform tables (outdated to v0.5 pre-`cost_set_id` shape) — D-26 rewrites.
- `REQUIREMENTS.md:19` 4-view list — D-14 updates to 5.
- `ROADMAP.md:70, 133-134` 4-view list — D-14 updates to 5.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js + npm | All scripts | Assumed ✓ | — | — |
| tsx | `post-publish.ts`, `seed-data.ts` | Assumed ✓ (existing scripts use it) | — | — |
| `spacetime` CLI | Publish + generate + SQL | Assumed ✓ | — | — |
| SpacetimeDB maincloud account | Publishing + seed | Assumed ✓ (v0.5 published here) | — | Local stand-alone instance |
| `SPACETIMEDB_SERVER_TOKEN` | Verified test harness + seed | Generated by `post-publish.ts` on first run | — | Required — no fallback |
| vitest | Integration tests | Assumed ✓ (used in `test/backend/**`) | — | — |

**Missing dependencies with no fallback:** None identified.

**Missing dependencies with fallback:** None identified.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest (existing, version not verified — check `package.json`) |
| Config file | `vitest.config.ts` or similar at project root (assumed — existing tests run) |
| Quick run command | `npx vitest run test/backend/match-history/` (new test dir) |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| FOUND-01 | Spine columns present in schema + generated bindings | smoke | grep `skelUrl` in `src/module_bindings/hsr_character_type.ts` post-`spacetime generate` | ❌ Wave 0 — add smoke check to existing admin test or new file |
| FOUND-01 | `admin_bulk_upsert` accepts Spine fields and preserves on partial update | integration | `npx vitest run test/backend/game-data/admin-bulk-upsert-partial.test.ts` | ❌ Wave 0 |
| FOUND-01 | `HsrCharacterCost` distinct-costSetId rows do not collide (D-09) | integration | `npx vitest run test/backend/game-data/cost-set-id-isolation.test.ts` | ❌ Wave 0 |
| FOUND-02 | Each of 5 views returns caller's own rows only | integration | `npx vitest run test/backend/match-history/history-views-isolation.test.ts` | ❌ Wave 0 |
| FOUND-02 | 5 new `view_*_table.ts` bindings generated | smoke | `ls src/module_bindings/view_my_match_* \| wc -l` = 5 | ❌ Wave 0 (grep check) |
| D-21a | Seed round-trip: Spine + positioning + 3-mode cost rows land | integration | `npx vitest run test/backend/game-data/seed-round-trip.test.ts` OR manual `post-publish.ts` smoke | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run test/backend/<touched-area>/` (scoped suite, < 30s).
- **Per wave merge:** `npx vitest run` full backend suite (multi-minute; many existing tests).
- **Phase gate:** Full suite green + `spacetime generate` idempotent (no binding diff after a second run).

### Wave 0 Gaps
- [ ] `test/backend/match-history/history-views-isolation.test.ts` — covers FOUND-02 (5 views × isolation).
- [ ] `test/backend/game-data/admin-bulk-upsert-partial.test.ts` — covers D-08/D-10/D-21 (partial-update preserve).
- [ ] `test/backend/game-data/cost-set-id-isolation.test.ts` — covers D-09/D-21.
- [ ] `test/backend/game-data/seed-round-trip.test.ts` — covers D-21a (optional — may be manual UAT instead).
- [ ] Shared test fixture for seeding match-history rows for two users — if direct SQL insert, document in `test/shared/`.
- [ ] **Pre-Wave-0 spike:** verify whether `conn.db.viewMyMmrHistory.iter()` works from test harness post-regeneration. If yes, tests use view subscription; if no, tests use SQL fallback on backing tables. This spike is the deciding input for the isolation test shape.

### Cross-User Isolation Dimension (Dim 8) — explicit

**Setup:** Two verified harnesses (`userA`, `userB`) + distinct history rows for each.

**Assertions per view:**
1. `userA`'s view contains only rows where `userA` is a participant (or owner).
2. `userB`'s rows are absent from `userA`'s view.
3. `userA`'s rows are present in `userA`'s view with correct field values.

**Edge cases:**
- User with zero history rows → view returns `[]` (not error).
- Unauthenticated sender (`mapping === undefined`) → view returns `[]` (verified pattern in every existing `view_my_*`).
- Shared match (both users participants) → row appears in BOTH users' views (this is correct).

### Partial-Update Preservation Dimension — explicit

**Setup:** Single verified admin harness + pre-seeded `HsrCharacter` row (e.g., `acheron` with all fields set).

**Assertions:**
1. Upsert with `{ name: 'acheron', skelUrl: 'https://new.url', <all other keys: null> }` → `skelUrl` becomes new URL; `displayName`, `aliases`, `rarity`, `imageUrl`, etc. preserved.
2. Upsert with full non-null payload → all fields updated (insert-style on update).
3. Upsert on NEW row (not existing) with some `null` values → required columns get schema defaults, optional columns stay `null`/`[]`.

## Security Domain

Per project `security_enforcement` convention — assumed enabled (absent key).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `ctx.sender` resolved via `UserIdentity.identity.find(ctx.sender)` — enforced in every view. [VERIFIED: 23 view call sites] |
| V3 Session Management | no | Session lives on SpacetimeDB WebSocket layer, not in this phase's code. |
| V4 Access Control | yes | `ensureAdmin(ctx)` guards `admin_bulk_upsert` (line 254). Views rely on `ctx.sender` trust — no admin elevation in views. |
| V5 Input Validation | yes | `validateEnum` (admin.ts:26) + `validateKeys` (admin.ts:51) — strict enum matching, exact key-set requirement. Extend to cover `skelUrl`/`atlasUrl`/`atlasImgUrls`/`posX`/`posY`/`width` in `EXPECTED_KEYS['HsrCharacter']`. |
| V6 Cryptography | no | No new crypto surface. |

### Known Threat Patterns for SpacetimeDB

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Client-forged `userId` arg | Spoofing | Never trust args; always resolve `ctx.sender` → `UserIdentity` → `User`. [VERIFIED: `CLAUDE.md` core rule #5] |
| View leaking other users' rows | Information disclosure | Server-side `ctx.sender` filter in view body — the D-17/D-18 patterns enforce this structurally. |
| Admin upsert with unexpected fields (injection via JSON) | Tampering | `validateKeys` rejects any extra key; `validateEnum` rejects unknown enum tags. |
| Partial update zeroing PII-adjacent fields | Tampering | The whole point of D-08: fixing this bug. Test D-21 is the regression guard. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Schema migration for adding required i32 columns (`posX`/`posY`/`width`) to non-empty `hsr_character` is acceptable via `--clear-database` (matching existing Phase 15 plan to republish). | Pitfall 7 | If the maincloud deploy is expected to be additive (no clear), the planner needs a migration spec or must make the columns optional. |
| A2 | `ctx.db.HsrCharacterCost.by_character_mode_and_set.filter([...])` with a tuple including an enum struct works as expected. | HsrCharacterCost PK fix | If the SpacetimeDB server API doesn't accept enum structs in composite filter tuples, the fallback (full-iter + triple check) is O(n) and fine at 82 × 3 = 246 rows. |
| A3 | Test harness `conn.db.viewXxx` may or may not work — `test/backend/auth/auth-views.test.ts` comment says "undefined" but the existence of `src/module_bindings/view_*_table.ts` files post-Phase-12.2 suggests it might. | Integration Test Pattern | If view bindings still don't work, falls back to SQL-on-backing-table (slightly weaker test of the view itself but validates the filter logic). |
| A4 | `spacetime generate` + `prettier --write` is idempotent after the reorg (no view renames → no binding diff beyond 5 new files). | View File Reorganization Mechanics | If the generator emits files in a name-sorted order that differs between runs, small formatting diffs could appear. Low risk; fix is to commit the regeneration once. |
| A5 | Project uses vitest as test runner (verified from `auth-views.test.ts:1` import) at the version currently in `package.json`. | Validation Architecture | If vitest version lacks `describe.skipIf`, tests need restructuring. Existing tests use `describe.skipIf(!hasServerToken())` so the API is available. |
| A6 | Energy budget for participant-first iteration at 100 users × 156 matches is acceptable — no subscription-row-limit risk at this scale. | Pitfall 5 | If the budget is tighter than expected, planner may need to cap view output (e.g., return last 100 rows) or denormalize `userId` onto session history (explicitly rejected in CONTEXT.md deferred). |
| A7 | The planner will pick "full JSON key set, `null` values mean preserve" as the partial-update convention. | validateKeys/partial-update | If planner picks "relax validateKeys to allow subset," that's a larger router rework. Either works; the convention must be consistent across all 5 table cases. |

## Open Questions (RESOLVED)

All questions resolved during planning (Phase 15 plans 01–06). Resolutions recorded inline so executors do not re-open.

1. **Partial-update convention — `null` sentinel vs relaxed key set?**
   - Recommendation: `null` sentinel (smaller change, keeps `validateKeys` contract).
   - **RESOLVED:** `null`-sentinel convention. Full JSON key set required (keeps `validateKeys` intact); a field set to `null` means "preserve existing value" on UPDATE. See Plan 03 Task 1 wire-convention block + D-10.

2. **View binding availability in test harness — spike needed at Wave 0.**
   - Test whether `conn.db.viewMyMmrHistory.iter()` returns rows post-regeneration. If yes, direct test. If no, fallback to SQL on backing tables.
   - **RESOLVED:** Spike embedded in Plan 06 Task 1. Isolation tests prefer `conn.db.viewMy*.iter()` assertion; fall back to `queryPrivateTable` / SQL-on-backing-table if the binding is unavailable. Spike result gets documented at top of `test/shared/two-identity-harness.ts`.

3. **Schema migration strategy — clear-database vs additive?**
   - Recommendation: clear-database + re-seed, consistent with `post-publish.ts` flow. Requires operator acknowledgement.
   - **RESOLVED:** `spacetime publish --clear-database` + `post-publish.ts` reseed (Plan 02 action note; Plan 05 round-trip assertion D-21a). Operator-triggered per `feedback_post_publish_only` memory.

4. **Shared transform extraction — now or deferred?**
   - Recommendation: defer. Extracting `test/shared/transforms.ts` during Phase 15 adds a small refactor task; the duplication is stable enough to live one more phase if the planner prefers minimal scope. Claude's discretion per CONTEXT.md.
   - **RESOLVED:** Deferred. Plan 05 reworks both seed entry points in parallel without extracting a shared module; duplication is flagged for a follow-up phase if it causes drift.

5. **Who writes test seed data for match history rows?**
   - Option A: Direct SQL inserts bypassing reducers (simplest, requires server token).
   - Option B: Replay a lightweight match flow via existing reducers (slow, exercises more code paths).
   - Recommendation: Option A for isolation test; integrated with real flow is covered later in Phase 40/41.
   - **RESOLVED:** Option A — direct inserts for the isolation tests (Plan 06 Task 1 action). Full end-to-end match-flow coverage stays in Phase 40/41.

## Sources

### Primary (HIGH confidence)
- `CLAUDE.md` (project root) — SpacetimeDB core rules, git rules, mandatory skills.
- `.claude/CLAUDE.md` — project-local CLAUDE rules (git safety, mandatory skills table, UAT format).
- `.planning/phases/15-backend-pre-work/15-CONTEXT.md` — 28 locked decisions.
- `.planning/REQUIREMENTS.md:18-19` — FOUND-01, FOUND-02.
- `.planning/ROADMAP.md:127-136, 70, 342, 434-436` — Phase 15 goal + v0.9 view references (to be updated per D-14).
- `.planning/STATE.md` — project position, v0.5 archive, open items.
- `.planning/codebase/CONVENTIONS.md` — naming, reducer patterns, view export pattern (Phase 12.2 critical).
- `.planning/codebase/ARCHITECTURE.md` — view registration, UserPrivate isolation, layer structure.
- `spacetimedb/src/index.ts:1-46` — view re-export barrel (ground truth for registration).
- `spacetimedb/src/reducers/admin.ts:1-484` — the reducer being reworked; lines 251-454 = `admin_bulk_upsert`.
- `spacetimedb/src/tables/hsrCharacter.ts, hsrCharacterCost.ts, hsrLightcone.ts, hsrLightconeCost.ts, hsrSynergyCost.ts` — schema ground truth.
- `spacetimedb/src/tables/matchParticipantHistory.ts, mmrHistory.ts, matchSessionHistory.ts, matchSessionStepHistory.ts, matchResultGameHistory.ts` — 5 history tables + their indexes.
- `spacetimedb/src/views/securityViews.ts:378, 710` — the two filter-pattern exemplars named in CONTEXT.md; confirmed.
- `spacetimedb/src/views/anonymousViews.ts:279-353` — existing `view_match_history` et al. showing the cross-table-iteration pattern in production.
- `scripts/seed-data.ts, scripts/post-publish.ts` — production seed entry points.
- `test/shared/seed-data.ts, test/shared/connection.ts, test/shared/fixtures.ts` — test seed/harness.
- `test/data-templates/characters_template.json, lightcones_template.json, pairing_template.json` — canonical shapes per D-22.
- `test/data-templates/README.md` — outdated per D-26.
- `test/backend/auth/auth-views.test.ts:1-18` — documented limitation on view subscription in tests.
- `test/backend/lobby/lobby-presets.test.ts:83-86` — multi-harness exemplar.
- `test/backend/roster/roster-characters.test.ts` — typical integration test structure.

### Secondary (MEDIUM confidence)
- `.planning/research/PITFALLS.md:112-117` — Phase 15 view-shortcut pitfall warning.
- `.planning/research/DECISIONS.md` — R1-R10 architectural commitments, including history-views requirement.

### Tertiary (LOW confidence)
- `notes/v09-frontend-subscription-strategy.md` — file not opened due to size; referenced only by cross-links. Planner should skim if subscription pattern details surface.

## Metadata

**Confidence breakdown:**
- View filter patterns: HIGH — both exemplars read verbatim; index availability confirmed in every backing table.
- Admin router rework mechanics: HIGH — `validateKeys` contract + existing bug at lines 360-366 read directly.
- HsrCharacterCost PK fix: HIGH — PK already `[characterName, gameMode, costSetId]` (verified). Bug is reducer-side only.
- Seed round-trip: HIGH — both seed scripts read in full; templates verified; post-publish.ts orchestration read.
- View reorg safety: HIGH — no `views/index.ts` exists; barrel at `spacetimedb/src/index.ts` is the sole registration surface.
- Integration test harness: MEDIUM — view-subscription availability is the one open spike (A3).
- Energy/bandwidth estimate: LOW — qualitative only; planner should run `tools/energy-model.js` pre-merge.

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (30 days; stable backend, no major SDK releases expected).
