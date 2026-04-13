---
phase: 15-backend-pre-work
reviewed: 2026-04-12T00:00:00Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - docs/admin/architecture.md
  - docs/match/architecture.md
  - docs/views/architecture.md
  - scripts/seed-data.ts
  - spacetimedb/src/index.ts
  - spacetimedb/src/reducers/admin.ts
  - spacetimedb/src/tables/hsrCharacter.ts
  - spacetimedb/src/views/costSetViews.ts
  - spacetimedb/src/views/identityViews.ts
  - spacetimedb/src/views/lobbyViews.ts
  - spacetimedb/src/views/matchHistoryViews.ts
  - spacetimedb/src/views/matchViews.ts
  - spacetimedb/src/views/socialViews.ts
  - spacetimedb/src/views/statsViews.ts
  - spacetimedb/src/views/tournamentViews.ts
  - test/backend/reducers/admin/cost-set-pk.test.ts
  - test/backend/reducers/admin/partial-update.test.ts
  - test/backend/seed/round-trip.test.ts
  - test/backend/views/matchHistoryViews/isolation.test.ts
  - test/data-templates/README.md
  - test/shared/seed-data.ts
  - test/shared/two-identity-harness.ts
findings:
  critical: 1
  warning: 7
  info: 12
  total: 20
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-04-12
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

Phase 15 backend pre-work covers three distinct efforts: (1) Spine + positioning columns on `HsrCharacter` with a reworked partial-update router in `admin_bulk_upsert`; (2) cost-table composite-PK fix to stop the default cost set from overwriting custom sets; (3) views-layer reorg into 8 domain files + 5 new self-scoped match-history views. Overall code quality is solid — the wire convention is carefully documented on the reducer, the reorg preserves view bodies verbatim, and regression tests exist for every Phase 15 decision.

Primary concerns: one Critical around the reconnect ban-check being built with an `as any`-stubbed enum (reliability risk on D-08 enforcement point 2), one Warning where the partial-update helper treats `undefined` the same as `null` despite the documented wire contract calling out only `null`, and a handful of weak test assertions and unbounded iterations worth tightening before this code becomes a dependency for downstream phases.

## Critical Issues

### CR-01: Reconnect ban-check constructs enum with `as any` stub

**File:** `spacetimedb/src/index.ts:136`
**Issue:** The reconnect ban enforcement builds its `BanType` argument as `{ tag: 'DiscordId', value: {} } as any`. The `as any` cast suggests the structural shape does not match what `checkProviderBan` expects. If the helper ever switches on the `value` discriminant (beyond `tag`), reconnect enforcement fails silently — the function returns falsy, no throw, user stays online despite being banned. This is D-08 enforcement point 2 per the admin architecture doc, which means the bypass goes undetected until an admin notices the banned account reconnecting.
**Fix:**
```ts
// Inspect how admin_ban_user / banAdmin.ts builds BanType, mirror that pattern,
// and drop the `as any` — if TS still complains the shape is wrong.
import { BanType } from '../types/enums';
const isBanned = checkProviderBan(ctx, BanType.DiscordId(), userPrivate.discordId);
```

## Warnings

### WR-01: `mergeForUpdate` treats `undefined` the same as `null` — diverges from wire contract

**File:** `spacetimedb/src/reducers/admin.ts:94`
**Issue:** The header comment at lines 75-85 is unambiguous: "Value `null` on an EXISTING row = preserve this field". `validateKeys` guarantees keys are present but does not reject `undefined` values. The helper's `if (incoming[key] !== null && incoming[key] !== undefined)` then silently treats `undefined` as a second preserve sentinel. This is harmless for JSON input (`JSON.parse` never emits `undefined`), but the `incoming` object at admin.ts:339-355 is built programmatically by the router itself, and the enum-guarded branches (`r.path !== null && r.path !== undefined ? { tag, value } : null`) lean on this behavior. If anyone later introduces an `undefined` by mistake, the update is silently skipped instead of failing.
**Fix:** Tighten the helper to match the documented contract, then have the router normalize enum-absent to `null` explicitly:
```ts
function mergeForUpdate<T>(existing: T, incoming: Record<string, any>, fields: (keyof T)[]): T {
    const merged: T = { ...existing };
    for (const f of fields) {
        const key = f as string;
        if (!(key in incoming)) throw new Error(`mergeForUpdate: missing key ${key}`);
        if (incoming[key] !== null) (merged as any)[key] = incoming[key];
    }
    return merged;
}
```

### WR-02: Cost-set-pk regression test assertion is too weak to catch the live bug it targets

**File:** `test/backend/reducers/admin/cost-set-pk.test.ts:204-215`
**Issue:** The test at "Re-seeding with costSetId=0 does NOT overwrite a pre-existing costSetId=5 row (live bug regression)" asserts only `set5.length >= 1`. If the bug regressed and the costSetId=5 row was overwritten with `eidolonCost(1)` (default-set values), the row count would still be 1 and the assertion passes — the regression would slip through. Similarly `set0.length >= 1` passes because the pre-seeded `MemoryOfChaos` default row from the earlier test already satisfies it.
**Fix:** Include the cost values in the SELECT and assert they match the custom `eidolonCost(99)` payload:
```ts
const set5 = await queryPrivateTable(
    `SELECT classic_costs FROM hsr_character_cost WHERE character_name = '${TEST_CHAR}' AND cost_set_id = 5 AND game_mode = 'ApocalypticShadow'`
);
expect(set5.length).toBe(1);
// Pre-regression, set5's e0 was overwritten to 1; fix preserved it at 99.
const e0 = Number(JSON.parse(String(set5[0].classic_costs)).e0);
expect(e0).toBe(99);
```

### WR-03: `scripts/seed-data.ts` parses `characters_table.json` twice per run

**File:** `scripts/seed-data.ts:292, 364`
**Issue:** `buildSeedPayloads()` loads the characters JSON at line 292 and uses it for character/cost normalization. The archetype-junction block at line 364 calls `loadJson<RawCharacter>` again, re-reading and re-parsing the same file. No correctness bug, but (a) wasted IO/parse work per run, (b) drift risk if the file is edited between the two reads (only relevant during development, but still a foot-gun), (c) code duplication.
**Fix:** Have `buildSeedPayloads` return `{ payloads, characters }` (or hoist `characters` to a closure-level constant shared by both sites), then reuse in the junction block.

### WR-04: `partial-update.test.ts` display_name default assertion tolerates inconsistent output shapes

**File:** `test/backend/reducers/admin/partial-update.test.ts:202`
**Issue:** `expect(row.display_name === '""' || row.display_name === '').toBe(true)` accepts two unrelated return shapes. If `queryPrivateTable` later normalizes to a single shape, one branch silently dies and the test continues to pass on the other — useless as a guardrail. The disjunction suggests the author was uncertain of the actual output at authoring time.
**Fix:** Pin a single expected shape after inspecting the real output once:
```ts
expect(String(row.display_name).replace(/^"|"$/g, '')).toBe('');
```

### WR-05: `view_match_history` iterates all MatchSessionHistory rows by game-mode × 2 calls

**File:** `spacetimedb/src/views/matchHistoryViews.ts:53-59, 144-150`
**Issue:** `buildVisibleMatchIds` (lines 123-153) iterates all `MatchSessionHistory` rows once via the 3 game-mode indexes. `view_match_history` then calls the helper AND separately iterates the same 3 indexes to emit rows — effectively walking MatchSessionHistory twice per view call. At ~156-match scale (project_data_scale baseline) this is fine; as match history grows unboundedly it becomes a subscription hot spot. Flagging as Warning rather than Performance (out of scope) because the doubled iteration is a code-structure issue, not an algorithmic complexity one.
**Fix:** Fold the row emission into the helper, returning `MatchSessionHistory[]` rows directly rather than a `Set<number>` of IDs, so each of the 3 views does one pass:
```ts
function buildVisibleMatches(ctx: any): MatchSessionHistory[] { /* ... emit rows ... */ }
```
Then `view_match_history` returns the helper output directly, and the participant/step views index the returned rows by `id`.

### WR-06: Unbounded spread on `Math.max(...allChars.map(...))`

**File:** `spacetimedb/src/reducers/admin.ts:391`
**Issue:** `Math.max(...allChars.map((c: any) => c.versionReleased))` spreads all HsrCharacter rows as function arguments. V8 tolerates ~65k args, and the baseline (~82 characters) is far below. HSR releases 2-4 characters every 6-week patch, so in ~100 years the character pool might hit the limit — so this is not an urgent concern. However, the pattern is also brittle if `allChars` is empty (`Math.max()` returns `-Infinity`); the downstream `if (maxVersion > 0)` guard catches it, but the implicit `-Infinity` round-trips through any future refactor.
**Fix:**
```ts
const maxVersion = allChars.reduce((m: number, c: any) => Math.max(m, c.versionReleased), 0);
```

### WR-07: `admin_delete_row` scans all `MatchSessionStep` rows to check user involvement

**File:** `spacetimedb/src/reducers/admin.ts:145-151`
**Issue:** The User-deletion guard iterates every row in `MatchSessionStep` looking for `actorUserId === id`. There is no btree on `actorUserId`. MatchSessionStep accumulates across the active lifetime of every lobby (picks, bans, bids, pauses — dozens to hundreds per draft). Over time this grows without bound — the table is hard-deleted with the lobby on `runFinalization`, but for in-flight lobbies the scan still touches every active step. At ~100 concurrent lobbies × ~50 steps, this is 5k rows per admin-delete. Degrades linearly with live activity.
**Fix:** Add a btree index `by_actor_user` on `MatchSessionStep.actorUserId`, then replace the scan with:
```ts
const firstStep = [...ctx.db.MatchSessionStep.by_actor_user.filter(id)][0];
if (firstStep) {
    throw new SenderError(
        `Cannot delete user #${id}: they have actions in active match (lobby #${firstStep.lobbyId}). End the match first.`
    );
}
```

## Info

### IN-01: Widespread `as any` casts on `ctx.db.X.insert(...)` call sites

**File:** `spacetimedb/src/reducers/admin.ts` (lines 357, 383, 447, 462, 504, 515, 551, 561, 607); `spacetimedb/src/index.ts:183, 194, 205, 227, 235`
**Issue:** Every row-insert path spreads `auditInsert/auditUpdate` output and casts the final object via `as any`. The type system is being suppressed at every call site instead of the generated binding types being extended once. Makes schema-refactor review harder — no compile error when a column changes.
**Fix:** Define a helper like `function insertWithAudit<T>(table, row, audit): T` that types the merge once. Project-wide pattern — low priority.

### IN-02: `scripts/seed-data.ts` raw types have overlapping per-mode fields and index signature

**File:** `scripts/seed-data.ts:69, 77, 85`
**Issue:** `RawCharacterCost` declares both `memory_of_chaos?: RawModeEidolonBlock` (plus the two siblings) AND `[mode: string]: RawModeEidolonBlock | number | undefined`. The index signature widens the known fields so the explicit enum keys are informational only — a consumer can still access `c.cost['anything']` and get the union back. The `as RawModeEidolonBlock | undefined` cast at line 176 confirms the types are not load-bearing.
**Fix:** Drop the three explicit mode fields; keep the index signature alone. Or drop the index signature and iterate the 3 known keys explicitly. The current hybrid encodes the worst of both.

### IN-03: `view_match_participant_history` and `view_my_match_participant_history` differ only by the `my_` prefix

**File:** `spacetimedb/src/views/matchHistoryViews.ts:75, 175`
**Issue:** Documented convention distinguishes "visibility-filtered" (no `my_`) from "self-scoped" (`view_my_*`). The two same-named history views sit 100 lines apart in one file and are easy to confuse from a consumer's perspective — `.db.view_match_participant_history` vs `.db.view_my_match_participant_history` is a one-character typo away from a silent scoping bug.
**Fix:** None required. Consider mutual JSDoc `@see` cross-references so IDE hover surfaces the sibling.

### IN-04: `test/shared/seed-data.ts` runs top-level side effects on import

**File:** `test/shared/seed-data.ts:94-302`
**Issue:** Unlike `scripts/seed-data.ts` (which guards execution behind the `seedAll()` export + CLI check at line 418-420), `test/shared/seed-data.ts` reads files, opens a DbConnection, calls reducers, and calls `process.exit(0)` all at module top level. Importing this file anywhere would run all of that. Only safe today because nothing imports it.
**Fix:** Wrap the side-effect block in an `if (import.meta.url === pathToFileURL(process.argv[1]).href)` guard, or move into an exported `seedAll()` called from a small CLI entry — mirror the structure of `scripts/seed-data.ts`.

### IN-05: `scripts/seed-data.ts` CLI-entry detection uses fragile string suffix match

**File:** `scripts/seed-data.ts:418-420`
**Issue:** Three-way OR: primary `new URL(import.meta.url).pathname` comparison + fallback `endsWith('seed-data.ts')` + `endsWith('seed-data.js')`. The primary check likely fails on Windows (path vs URL format mismatch — per global CLAUDE.md the project runs on Windows), so the `endsWith` is the actual load-bearing check. But `endsWith('seed-data.ts')` matches any unrelated script that ends with the same name (e.g. `my-seed-data.ts`).
**Fix:**
```ts
import { pathToFileURL } from 'node:url';
if (import.meta.url === pathToFileURL(process.argv[1]).href) { /* ... */ }
```

### IN-06: `docs/admin/architecture.md` cites a line-range that is slightly off

**File:** `docs/admin/architecture.md:166`
**Issue:** References `mergeForUpdate<T>() helper (admin.ts:86-99)` but the function actually spans `admin.ts:86-100`. Line ranges in markdown drift with every edit.
**Fix:** Use symbolic reference: `admin.ts: mergeForUpdate()`, or drop line numbers altogether.

### IN-07: `view_user_directory` iterates entire User table per call

**File:** `spacetimedb/src/views/identityViews.ts:52`
**Issue:** `[...ctx.db.User.iter()].filter(u => !u.deletedAt)` runs on every anonymous subscription refresh. At ~100 users baseline this is fine; scaling up to thousands of registered users makes this a subscription hot spot. Flagging for awareness; out of v1 scope (performance).
**Fix:** If/when it becomes a problem, add a btree on `User.deletedAt` or maintain a materialized active-users view.

### IN-08: `two-identity-harness.ts` header encodes spike verification output as a comment

**File:** `test/shared/two-identity-harness.ts:3-22`
**Issue:** The top-level JSDoc captures wave-0 spike run output ("conn.db.view_my_mmr_history defined: YES" × 5). Useful provenance right now, stale in 3 months when bindings evolve. Future readers will not know if the assertions still hold.
**Fix:** Trim to the load-bearing sentence ("all 5 view bindings present in `src/module_bindings/index.ts`") or move the full log to a PHASE-15-SPIKE.md note. Low priority.

### IN-09: `console.log` statements in `index.ts` and `admin.ts` are intentional audit lines

**File:** `spacetimedb/src/index.ts:112, 144, 239`; `spacetimedb/src/reducers/admin.ts:31, 67, 169, 420`
**Issue:** These are intentional per the admin/disconnect audit pattern documented in the architecture doc, not leftover debug logs. Quick-scan regex matches would flag them.
**Fix:** None required.

### IN-10: `auctionBaseBid` placeholder duplicates `classicCosts` across 4 seed call sites

**File:** `scripts/seed-data.ts:196, 245`; `test/shared/seed-data.ts:144, 188`
**Issue:** `auctionBaseBid: { ...costs }` at both seed-script entry points. When auction pricing diverges from classic (noted as future work in `test/data-templates/README.md:84`), all 4 call sites must be updated in lockstep. Moderate coupling risk.
**Fix:** None now; track as a Phase-later TODO.

### IN-11: `Number(primaryKeyJson)` on delete paths produces uninformative errors on bad input

**File:** `spacetimedb/src/reducers/admin.ts:121, 222, 228, 244, 257, 263, 269`
**Issue:** `Number("abc")` → `NaN`, `ctx.db.X.id.find(NaN)` → undefined, reducer throws "Row not found" with no context that the input was malformed. Not a security issue (`ensureAdmin` gates), but unpleasant to debug from the admin UI.
**Fix:**
```ts
const id = Number(primaryKeyJson);
if (!Number.isInteger(id) || id < 0) throw new SenderError(`Invalid primary key: ${primaryKeyJson}`);
```

### IN-12: `scripts/seed-data.ts` does not prepend `wss://` to bare-hostname `SPACETIMEDB_HOST`

**File:** `scripts/seed-data.ts:319-321`
**Issue:** Rewrites `https://` → `wss://` and `http://` → `ws://`, but a bare-hostname env value (e.g. `maincloud.spacetimedb.com`) goes through unchanged and fails with an unclear SDK error. Minor operational friction.
**Fix:**
```ts
if (!host.startsWith('ws://') && !host.startsWith('wss://')) host = `wss://${host}`;
```

---

_Reviewed: 2026-04-12_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
