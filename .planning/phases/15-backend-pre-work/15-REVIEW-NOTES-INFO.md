---
purpose: Engineering-first fix directives for the Info findings from 15-REVIEW.md that are in scope for this fix pass.
scope: IN-02, IN-04, IN-05, IN-06, IN-08, IN-11, IN-12 (7 findings)
out_of_scope:
  - IN-01 (audit-spread refactor) → Phase 15.3
  - IN-03 (no fix needed — both views logically required)
  - IN-07 (deferred performance) → Phase 15.2
  - IN-09 (intentional server-side audit logs)
  - IN-10 (folded into Phase 15.1 auction template)
---

# Phase 15 Info Findings — Fix Directives

Each fix is one atomic commit. All directives verified against the actual code at this commit. Commit message format: `fix(15): {finding-id} — {one-line summary}`.

No publish required for any of these fixes (no schema changes).

---

## IN-02 — RawCharacterCost hybrid type cleanup

**File:** `scripts/seed-data.ts:64-86` (3 type defs)

**Verified:** `test/shared/seed-data.ts:63-89` already uses the index-signature-only pattern. This fix brings `scripts/seed-data.ts` into alignment with the test seed.

**Why drop explicit fields, not the index signature:** the runtime iterates modes via `Object.keys(c.cost).filter(k => k !== 'cost_set_id')` (e.g. `scripts/seed-data.ts:175`). Without the index signature, `c.cost[rawMode]` is a type error. The explicit fields are decorative — the index signature is load-bearing.

**Fix** — replace lines 64-86:

```ts
type RawCharacterCost = {
    cost_set_id: number;
    [mode: string]: RawModeEidolonBlock | number | undefined;
};

type RawLightconeCost = {
    cost_set_id: number;
    [mode: string]: RawModeSuperpositionBlock | number | undefined;
};

type RawPairingCost = {
    cost_set_id: number;
    [mode: string]: number | undefined;
};
```

Run `npm run typecheck` (or whatever the project uses) to confirm no breakage — the cast at L176 (`as RawModeEidolonBlock | undefined`) and the iteration in `normalizeCharacterCosts` should still work unchanged.

---

## IN-04 — test/shared/seed-data.ts top-level side effects

**File:** `test/shared/seed-data.ts` (entire file is top-level imperative)

**Verified:** lines 18-27 read .env.local + early `process.exit(1)` at module top level. Lines 94+ read JSON, transform, open DbConnection, call reducers, all top-level. Nothing imports this file today (verified via grep — only the scripts/seed-data.ts in the parent dir is imported elsewhere).

**Engineering call:** full refactor to `async function main() { ... }` is invasive for a pure-CLI script. Single guard at the top is sufficient — throws on import, prevents side effects from running.

**Fix** — add at top of file, immediately after the imports (after line 16):

```ts
import { pathToFileURL } from 'node:url';

// Guard: this is a CLI script, never import it.
// Side-effects (file reads, DbConnection, reducer calls, process.exit) run at module
// top level; importing this file would execute all of them.
if (import.meta.url !== pathToFileURL(process.argv[1] || '').href) {
    throw new Error('test/shared/seed-data.ts is a CLI entry point — do not import');
}
```

Body of the file unchanged. Verify: `npx tsx test/shared/seed-data.ts` still runs end-to-end (golden path) and confirms the guard doesn't block direct invocation on Windows.

---

## IN-05 — scripts/seed-data.ts CLI-entry detection

**File:** `scripts/seed-data.ts:421-424`

**Verified:** current 3-way OR with `endsWith('seed-data.ts')` would match unrelated `my-seed-data.ts` if anyone ever creates one. Primary URL-based check is fragile on Windows path-vs-URL mismatch.

**Fix** — replace lines 421-424:

```ts
import { pathToFileURL } from 'node:url';

// CLI entry point — only run when invoked directly (not when imported by post-publish.ts)
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
    const serverToken = process.env.SPACETIMEDB_SERVER_TOKEN;
    // ... rest of block unchanged ...
}
```

The `pathToFileURL` import already exists at the top of the file? Check first — if not, add it to the existing `node:url` import line at the top.

**Verify:**
- `npm run seed` (or the equivalent direct invocation) still runs the seed
- `post-publish.ts` import of `seedAll` still does NOT trigger the CLI block

---

## IN-06 — architecture doc line-number drift

**File:** `docs/admin/architecture.md:166`

**Verified:** Current text:
> `mergeForUpdate<T>()` helper (admin.ts:86-99) returns a new row with existing values preserved where incoming is `null`. `validateEnumIfPresent()` wrapper (admin.ts:~103) skips enum validation for null-valued fields...

Post-WR-01 the function moved by ~5 lines. Line numbers will drift on every edit.

**Fix** — replace the line with symbolic references:

```markdown
Implementation: `mergeForUpdate<T>()` (in `admin.ts`) returns a new row with existing values preserved where incoming is `null` or `undefined`, and asserts every expected key is present (validateKeys defensive guard). `validateEnumIfPresent()` (in `admin.ts`) skips enum validation for null-valued fields on update (preserve-existing path). The insert branch retains its default-injection logic (per D-12) so schema-required fields still get sensible defaults on new rows.
```

Note the wording update reflects WR-01: "null OR undefined" + "asserts every expected key is present" — keeps doc in sync with the tightened helper contract.

Grep `docs/admin/architecture.md` for any other `admin.ts:NNN` line refs and apply the same symbolic-ref treatment if found (one-shot doc cleanup).

---

## IN-08 — two-identity-harness stale spike output

**File:** `test/shared/two-identity-harness.ts:1-22`

**Verified:** the docblock captures wave-0 spike literal output (`view_my_X defined: YES` × 5) plus rotting line numbers (`~1690-1710`).

**Fix** — replace the entire docblock at lines 1-22:

```ts
/**
 * Phase 15 D-20: Two-identity test helper for cross-user isolation tests.
 *
 * All 5 history-view bindings (view_my_mmr_history, view_my_match_participant_history,
 * view_my_match_session_history, view_my_match_session_step_history,
 * view_my_match_result_game_history) are present in src/module_bindings/index.ts and
 * re-exported through DbConnection.db. Views are auto-subscribed via
 * subscribeToAllTables() in createVerifiedTestHarness (test/shared/connection.ts),
 * so isolation tests use the subscription + .iter() path (preferred) rather than SQL fallback.
 *
 * SQL-on-backing-table cross-check is still used in some assertions to verify that
 * VIEW rows are a subset of what the backing table contains for the caller's userId.
 */
```

8 lines of docblock instead of 22. Drops the timestamped log output and rotting line numbers; preserves the load-bearing assertions about subscription pathway and SQL cross-check.

---

## IN-11 — Number(primaryKeyJson) NaN handling

**File:** `spacetimedb/src/reducers/admin.ts` — 6 sites in `admin_delete_row` switch:

| Line | Case | Current pattern |
|------|------|-----------------|
| 130 | User | `const id = Number(primaryKeyJson);` |
| 230 | HsrSynergyCost | same |
| 236 | Archetype | same |
| 252 | Lobby | same |
| 265 | MatchSession | same |
| 271 | MatchSessionStep | same |

(`LobbyMember` at L257-258 uses `JSON.parse` — not in scope for IN-11.)

**Fix** — add a helper near `validateEnumIfPresent` (around L116, after the existing helper functions, before `// ─── Generic row delete`):

```ts
/**
 * Parse a numeric primary key from the wire string. Throws SenderError with context
 * if the input is not a valid non-negative integer (e.g. malformed admin UI input).
 */
function parseNumericPk(raw: string, tableName: string): number {
    const id = Number(raw);
    if (!Number.isInteger(id) || id < 0) {
        throw new SenderError(`Invalid primary key for ${tableName}: '${raw}' — expected non-negative integer`);
    }
    return id;
}
```

Then replace `const id = Number(primaryKeyJson);` at each of the 6 sites with `const id = parseNumericPk(primaryKeyJson, '<TableName>');`. Use the actual table name as the second arg at each site.

**Verify:** existing tests pass (the helper preserves the success path; only the failure path becomes more informative).

---

## IN-12 — bare-hostname host handling

**File:** `scripts/seed-data.ts:323-325`

**Verified:** Current code:

```ts
let host = process.env.SPACETIMEDB_HOST ?? process.env.NEXT_PUBLIC_SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
if (host.startsWith('https://')) host = host.replace('https://', 'wss://');
else if (host.startsWith('http://')) host = host.replace('http://', 'ws://');
```

**Fix** — append one branch after the existing `else if`:

```ts
else if (!host.startsWith('wss://') && !host.startsWith('ws://')) {
    // Bare hostname — assume secure WebSocket
    host = `wss://${host}`;
}
```

One-line behavior addition. No regression risk for users who already prefix their host correctly.

---

## Execution order

1. **IN-02** (`scripts/seed-data.ts` types only — single edit)
2. **IN-12** (`scripts/seed-data.ts` host guard — same file as IN-02, can batch IF kept atomic)
3. **IN-05** (`scripts/seed-data.ts` CLI guard — same file again)
4. **IN-04** (`test/shared/seed-data.ts` import guard — different file)
5. **IN-06** (`docs/admin/architecture.md` symbolic refs — docs only)
6. **IN-08** (`test/shared/two-identity-harness.ts` trim docblock — docs only)
7. **IN-11** (`admin.ts` parseNumericPk helper + 6 call site replacements)

Keep each finding as its own commit even when sharing a file — atomic per finding makes blame and rollback clean.

---

## Verification checklist

After all 7 commits land:

- [ ] `npm run build` (or backend build) — no TypeScript errors
- [ ] `npm run test:integration` (or full backend test suite) — 30/30 green (no regression from Phase 15 main fix pass)
- [ ] `npx tsx test/shared/seed-data.ts` — direct invocation still works (IN-04 guard doesn't block CLI)
- [ ] Manual: trigger an admin_delete_row with malformed PK (e.g. via dev UI) → confirm new helpful error message (IN-11)
- [ ] No publish to maincloud needed — none of these touch schema

---

**Out of scope reminders:**

- IN-01 (audit-spread `as any` cleanup) — Phase 15.3
- IN-03 (view_my_X naming) — both views logically required, no fix
- IN-07 (view_user_directory perf) — Phase 15.2 (deferred)
- IN-09 (console.log audit lines) — intentional server-side telemetry, no-op
- IN-10 (auctionBaseBid placeholder duplication) — Phase 15.1 (auction template extension)
