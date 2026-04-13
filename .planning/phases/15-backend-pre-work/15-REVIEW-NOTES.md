---
purpose: Engineering-first fix directives for 15-REVIEW.md. Overrides reviewer's suggested fixes where the code-path analysis disagreed.
scope: CR-01 + WR-01..WR-07 only (Info findings out of scope for this fix pass)
---

# Phase 15 REVIEW Fix Directives

Apply these fixes in order. Each fix is one atomic commit. These notes supersede the fix suggestions in `15-REVIEW.md` where they disagree — see the "Diverges from reviewer" tag on each item.

---

## CR-01 — BanType enum construction

**Severity correction:** Reviewer called Critical. Actual risk is hygiene, not bypass — `checkProviderBan` (banHelper.ts:13) only switches on `banType.tag`, and `{ tag: 'DiscordId', value: {} } as any` is the **canonical project pattern** used identically at `server.ts:102` and `banAdmin.ts:48`.

**Fix:** Extract a single constant in `spacetimedb/src/helpers/banHelper.ts`:

```ts
// Canonical BanType payload — SpacetimeDB enum tag is the only discriminant
// checkProviderBan uses; `value: {}` satisfies the struct shape. Extract to
// eliminate the `as any` repetition across the 3 call sites.
export const DISCORD_BAN_TYPE = { tag: 'DiscordId', value: {} } as any;
```

Replace `{ tag: 'DiscordId', value: {} } as any` at:
- `spacetimedb/src/index.ts:136`
- `spacetimedb/src/reducers/server.ts:102`
- `spacetimedb/src/reducers/banAdmin.ts:48` (note: uses `banTypeTag` variable, keep as-is)

Only the 2 hard-coded sites at `index.ts:136` and `server.ts:102` need replacement.

---

## WR-01 — mergeForUpdate contract drift (diverges from reviewer)

**Reviewer's fix is a regression.** Dropping `!== undefined` breaks parity with the router's own guards (`admin.ts:343-345` explicitly treats `undefined` ≡ `null` when normalizing enum fields), and would cause `merged[key] = undefined` to be written to `ctx.db.X.update()` if any caller ever forgot a field.

**Two real issues the reviewer conflated:**
1. The helper doesn't assert its upstream invariant (validateKeys key-presence rule).
2. The contract comment is stale — "null only" phrasing doesn't match the code, which treats null/undefined equivalently.

**Fix** (`spacetimedb/src/reducers/admin.ts:73-100`):

Replace the function + header comment:

```ts
/**
 * Phase 15 D-08/D-10: Partial-update merge for the admin_bulk_upsert router.
 *
 * Wire convention:
 *   - Every EXPECTED_KEYS entry must appear in the incoming object (validateKeys rule
 *     upstream; mergeForUpdate asserts this defensively).
 *   - Value `null` or `undefined` on an EXISTING row = "preserve this field".
 *     JSON inputs only produce `null`; programmatic router inputs may use either —
 *     treated equivalently to match the router's own null-guards at the enum sites.
 *   - Value `null` on an INSERT row = "apply schema default" (required columns) OR
 *     "stay null" (optional columns like skelUrl/atlasUrl).
 *   - Non-null/undefined value = "set to this value".
 *
 * This helper returns the merged row for UPDATE only. The insert branch stays on its
 * current default-injection path per D-12.
 */
function mergeForUpdate<T extends Record<string, any>>(
    existing: T,
    incoming: Record<string, any>,
    fields: (keyof T)[]
): T {
    const merged: T = { ...existing };
    for (const f of fields) {
        const key = f as string;
        // validateKeys guarantees key presence; assert defensively so a future
        // caller that bypasses validateKeys fails loudly instead of silently
        // writing `undefined` or dropping fields.
        if (!(key in incoming)) {
            throw new Error(`mergeForUpdate: missing key '${key}' — validateKeys contract broken`);
        }
        // null | undefined → preserve existing value (merged already copied from existing)
        if (incoming[key] != null) {
            (merged as any)[key] = incoming[key];
        }
    }
    return merged;
}
```

**Do not** update `validateEnumIfPresent` at L107-110 — its own `null`-or-`undefined` handling is already consistent with the new helper contract.

---

## WR-02 — cost-set-pk test weak assertion

**File:** `test/backend/reducers/admin/cost-set-pk.test.ts:204-215`

**Fix:**

```ts
// The costSetId=5 row must still exist with its custom values untouched.
const set5 = await queryPrivateTable(
    `SELECT cost_set_id, classic_costs FROM hsr_character_cost
     WHERE character_name = '${TEST_CHAR}' AND cost_set_id = 5 AND game_mode = 'ApocalypticShadow'`
);
expect(set5.length).toBe(1);  // exactly one — extra rows indicate a different regression
const set5Costs = JSON.parse(String(set5[0].classic_costs));
expect(Number(set5Costs.e0)).toBe(99);  // custom value survived, not overwritten to 1

const set0 = await queryPrivateTable(
    `SELECT cost_set_id FROM hsr_character_cost
     WHERE character_name = '${TEST_CHAR}' AND cost_set_id = 0`
);
// Pre-existing set=0 row for MemoryOfChaos + newly inserted set=0 for ApocalypticShadow
expect(set0.length).toBe(2);  // exact count — catches duplicate-insert bugs
```

Tighten `>= 1` to exact counts on both sets.

---

## WR-03 — seed-data double parse (diverges from reviewer — structural fix)

**Reviewer's fix** returns a tuple from `buildSeedPayloads`. Structurally awkward.

**Fix** — hoist data loading to `seedAll`, have `buildSeedPayloads` accept parsed data as arguments:

**`scripts/seed-data.ts`:**

Change `buildSeedPayloads` signature (line 290):
```ts
function buildSeedPayloads(
    characters: RawCharacter[],
    lightcones: RawLightcone[],
    pairings: RawPairing[]
): Array<{ tableName: string; rows: object[] }> {
    const archetypeNames = extractArchetypeNames(characters);
    return [
        { tableName: 'HsrCharacter', rows: normalizeCharacters(characters) },
        { tableName: 'HsrLightcone', rows: normalizeLightcones(lightcones) },
        { tableName: 'HsrCharacterCost', rows: normalizeCharacterCosts(characters) },
        { tableName: 'HsrLightconeCost', rows: normalizeLightconeCosts(lightcones) },
        { tableName: 'HsrSynergyCost', rows: normalizePairings(pairings) },
        { tableName: 'Archetype', rows: archetypeNames.map(name => ({ name, description: '' })) },
    ].filter(p => p.rows.length > 0);
}
```

In `seedAll` (line 312), load once at the top and reuse:
```ts
export async function seedAll(serverToken: string): Promise<void> {
    const dataDir = resolve(process.cwd(), 'test/data');
    const characters = loadJson<RawCharacter>(resolve(dataDir, 'characters_table.json'));
    const lightcones = loadJson<RawLightcone>(resolve(dataDir, 'lightcones_table.json'));
    const pairings = loadJson<RawPairing>(resolve(dataDir, 'pairing_table.json'));

    const payloads = buildSeedPayloads(characters, lightcones, pairings);
    if (payloads.length === 0) { /* ... unchanged ... */ }

    // ... rest of seedAll unchanged ...
    // At the junction block (was line 364), REMOVE the loadJson call and use `characters` directly:
    //   const assignments = extractArchetypeAssignments(characters);
}
```

Remove the `loadJson<RawCharacter>(resolve(process.cwd(), 'test/data/characters_table.json'))` call at line 364.

**`test/shared/seed-data.ts`:** Apply the same pattern if it has the equivalent double-parse. Check before editing — if the structure differs, adapt.

---

## WR-04 — partial-update brittle disjunction

**File:** `test/backend/reducers/admin/partial-update.test.ts:202`

**Fix:**

```ts
// Normalize "quoted" vs bare string output from queryPrivateTable
const displayName = String(row.display_name).replace(/^"|"$/g, '');
expect(displayName).toBe('');
```

If a grep of `test/backend/` turns up 3+ call sites using the same `=== '""'` pattern, extract `unquote(v: any): string` as a helper in `test/shared/fixtures.ts`:

```ts
export const unquote = (v: any): string => String(v ?? '').replace(/^"|"$/g, '');
```

Otherwise inline is fine.

---

## WR-05 — matchHistoryViews double iteration (diverges from reviewer)

**Reviewer suggested** folding emission into the helper. Cleaner shape: helper returns **both** the ID set AND the session rows — single MatchSessionHistory pass serves all three visibility-filtered views.

**File:** `spacetimedb/src/views/matchHistoryViews.ts`

**Fix** — rewrite `buildVisibleMatchIds` to `buildVisibleMatches`:

```ts
// ---------------------------------------------------------------------------
// Shared helper: walks MatchSessionHistory via the 3 game-mode indexes once,
// returns both the visible ID set (for fan-out views) and the row array
// (for view_match_history's direct emission).
// ---------------------------------------------------------------------------

function buildVisibleMatches(ctx: any): {
    ids: Set<number>;
    sessions: typeof MatchSessionHistory.rowType extends infer R ? R[] : any[];
} {
    const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);

    const participatedIds = new Set<number>();
    if (mapping) {
        const callerUserId = mapping.userId;
        for (const row of ctx.db.MatchParticipantHistory.by_user.filter(callerUserId)) {
            participatedIds.add(row.matchHistoryId);
        }
    }

    const ids = new Set<number>();
    const sessions: any[] = [];

    const gameModes: any[] = [
        { tag: 'MemoryOfChaos', value: {} },
        { tag: 'ApocalypticShadow', value: {} },
        { tag: 'AnomalyArbitration', value: {} },
    ];

    for (const gm of gameModes) {
        for (const history of ctx.db.MatchSessionHistory.game_mode.filter(gm)) {
            if (history.isPubliclyVisible || participatedIds.has(history.id)) {
                ids.add(history.id);
                sessions.push(history);
            }
        }
    }

    return { ids, sessions };
}
```

Rewrite `view_match_history` (was L39-63) to use `sessions` directly:

```ts
export const view_match_history = spacetimedb.view(
    { name: 'view_match_history', public: true },
    t.array(MatchSessionHistory.rowType),
    (ctx) => buildVisibleMatches(ctx).sessions
);
```

Update `view_match_participant_history` (L75) + `view_match_step_history` (L100) to destructure `ids`:

```ts
// view_match_participant_history
(ctx) => {
    const { ids } = buildVisibleMatches(ctx);
    const results: any[] = [];
    for (const matchId of ids) {
        for (const row of ctx.db.MatchParticipantHistory.by_match_history.filter(matchId)) {
            results.push(row);
        }
    }
    return results;
}
```

Same pattern for `view_match_step_history`. Do **not** touch the 5 `view_my_*` views (L159-255) — they don't use this helper.

**Delete** the old `buildVisibleMatchIds` function (L123-153) after the rename — it's replaced by `buildVisibleMatches`.

---

## WR-06 — Math.max spread

**File:** `spacetimedb/src/reducers/admin.ts:391`

**Fix:**

```ts
const maxVersion = allChars.reduce((m: number, c: any) => Math.max(m, c.versionReleased), 0);
```

The downstream `if (maxVersion > 0)` guard becomes intentional rather than incidental protection against `-Infinity`.

---

## WR-07 — MatchSessionStep scan

**Add btree index in `spacetimedb/src/tables/matchSessionStep.ts`:**

Look for the existing `indexes:` array in the table definition and append:

```ts
{ accessor: 'by_actor_user', algorithm: 'btree', columns: ['actorUserId'] },
```

**Replace scan in `spacetimedb/src/reducers/admin.ts:145-151`:**

```ts
// Block deletion if user is in an active match step (indexed lookup)
const firstStep = ctx.db.MatchSessionStep.by_actor_user.filter(id).next().value;
if (firstStep) {
    throw new SenderError(
        `Cannot delete user #${id}: they have actions in active match (lobby #${firstStep.lobbyId}). End the match first.`
    );
}
```

**Post-change:** publish to maincloud and regenerate bindings. Bindings file surface won't change (index accessor doesn't add a table type).

---

## Execution order

1. CR-01 (helpers/banHelper.ts + 2 call sites)
2. WR-01 (admin.ts mergeForUpdate)
3. WR-06 (admin.ts Math.max — same file as WR-01, batch)
4. WR-07 (matchSessionStep.ts index + admin.ts scan replace — **requires republish**)
5. WR-02 (cost-set-pk.test.ts)
6. WR-04 (partial-update.test.ts)
7. WR-03 (scripts/seed-data.ts + test/shared/seed-data.ts — structural fix)
8. WR-05 (matchHistoryViews.ts — largest refactor, do last, **requires republish**)

Consolidate the publishes: one republish after WR-07, second republish after WR-05. Or defer both to a single publish at the end.

Run the full backend test suite after each commit. Expect 30/30 green throughout (no test expectations change except WR-02 and WR-04 which become stricter).

---

**Out of scope for this fix pass:** IN-01 through IN-12. Revisit after verification gate if desired.
