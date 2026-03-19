---
status: investigating
trigger: "Investigate why Phase 2 roster character batch integration tests crash with 'The instance encountered a fatal error'"
created: 2026-03-18T15:45:00Z
updated: 2026-03-18T15:55:00Z
---

## Current Focus

hypothesis: The reducer uses `(ctx.db.HsrAccountCharacter as any).primaryKey.find(...)` to look up rows by composite PK, but the SpacetimeDB SDK does NOT expose a `.primaryKey` property on the table object — so `(ctx.db.HsrAccountCharacter as any).primaryKey` is `undefined`, and calling `.find(...)` on `undefined` throws a TypeError that crashes the WASM module.
test: Confirmed by reading SpacetimeDB logs and cross-referencing reducer code with SDK source.
expecting: root_cause CONFIRMED
next_action: NONE — diagnosis complete, research-only mode

## Symptoms

expected: `batch_upsert_characters` inserts rows, `batch_remove_characters` deletes rows; error-path tests return SenderError messages like "not found".
actual: Three "happy path" tests and the "fails if any character does not exist" test all produce "fatal error" / InternalError on the server instead of expected success or a SenderError.
errors: |
  PANIC: batch_upsert_characters D:/GitsWork/.../reducers/roster.ts:169:
    Uncaught TypeError: Cannot read properties of undefined (reading 'find')
    in D:/GitsWork/.../reducers/roster.ts:169:77 :: batch_upsert_characters

  PANIC: batch_remove_characters D:/GitsWork/.../reducers/roster.ts:206:
    Uncaught TypeError: Cannot read properties of undefined (reading 'find')
    in D:/GitsWork/.../reducers/roster.ts:206:77 :: batch_remove_characters
reproduction: |
  1. Run `npx vitest test/backend/roster/roster-characters.test.ts` with SPACETIMEDB_SERVER_TOKEN set.
  2. Tests "inserts multiple characters atomically", "upserts existing characters", "removes specified characters",
     and "fails if any character does not exist" all panic the WASM module.
started: First run — tests were never passing.

## Eliminated

- hypothesis: Schema not registered (HsrAccountCharacter missing from schema.ts)
  evidence: schema.ts line 105 includes HsrAccountCharacter; logs show `hsr_account_character` table created successfully at 2026-03-18T15:15:42.
  timestamp: 2026-03-18T15:50:00Z

- hypothesis: Table type or column mismatch (e.g. eidolonLevel is wrong type, audit columns missing)
  evidence: hsrAccountCharacter.ts defines all columns correctly (u32, string, u8, timestamps). The panic is not a type error — it occurs before any insert/delete, during the `.primaryKey.find()` call.
  timestamp: 2026-03-18T15:50:00Z

- hypothesis: HsrCharacter.name index is wrong and causes the validation lookup to panic
  evidence: hsrCharacter.ts uses `t.string().primaryKey()` for the `name` column — this is a single-column PK, which generates a named index accessor `name` on the table object (matches `ctx.db.HsrCharacter.name.find(item.characterName)` at line 159). No panic here; log shows that validation errors DO work correctly (e.g. "Invalid character: NonExistentCharacter" is returned as a SenderError, not a panic).
  timestamp: 2026-03-18T15:52:00Z

## Evidence

- timestamp: 2026-03-18T15:48:00Z
  checked: spacetime logs hsrpvp-spacetimedb-nextjs-test1
  found: |
    PANIC: batch_upsert_characters ... roster.ts:169: Uncaught TypeError: Cannot read properties of undefined (reading 'find')
    PANIC: batch_upsert_characters ... roster.ts:169: (again, for upsert test)
    PANIC: batch_upsert_characters ... roster.ts:169: (again, for remove-setup upsert in test 7)
    PANIC: batch_remove_characters ... roster.ts:206: Uncaught TypeError: Cannot read properties of undefined (reading 'find')
    (All four panics pinpoint the exact line)
  implication: The panic is a JavaScript TypeError — `undefined.find()` — not a SpacetimeDB runtime error. The WASM host promotes unhandled JS exceptions to fatal panics. This is 100% a reducer bug, not infrastructure.

- timestamp: 2026-03-18T15:49:00Z
  checked: spacetimedb/src/reducers/roster.ts lines 169 and 206
  found: |
    Line 169: const existing = (ctx.db.HsrAccountCharacter as any).primaryKey.find({...})
    Line 206: const existing = (ctx.db.HsrAccountCharacter as any).primaryKey.find({...})
  implication: Both reducers access `.primaryKey` as a runtime property on the table handle.

- timestamp: 2026-03-18T15:50:00Z
  checked: spacetimedb/node_modules/spacetimedb/src/lib/table.ts (Table type and table() function)
  found: |
    The `Table<TableDef>` type is defined as:
      type Table<TableDef> = TableMethods<TableDef> & Indexes<TableDef, TableIndexes<TableDef>>
    Methods: insert(), delete(), iter(), count() — no `primaryKey` property.
    Indexes: auto-generated from (a) per-column `.primaryKey()` declarations and (b) explicit `indexes: [...]` array in table().
    There is no `.primaryKey` property on the runtime Table object.
  implication: `(ctx.db.HsrAccountCharacter as any).primaryKey` evaluates to `undefined` at runtime, so calling `.find({...})` on it throws TypeError.

- timestamp: 2026-03-18T15:51:00Z
  checked: spacetimedb/src/tables/hsrAccountCharacter.ts
  found: |
    Composite PK declared via:
      primaryKey: ['hsrAccountId', 'characterName']  (in table() opts, not per-column)
    Indexes declared:
      { accessor: 'hsr_account_id', algorithm: 'btree', columns: ['hsrAccountId'] }
    Neither `hsrAccountId` nor `characterName` columns have `.primaryKey()` method calls on them.
  implication: |
    Because the PK is declared via the `primaryKey: [...]` option (not per-column `.primaryKey()`),
    the SDK does NOT generate a single-column named accessor for these columns.
    The only named accessor on the table's runtime object is `hsr_account_id` (for the explicit btree index).
    There is NO `primaryKey` accessor, and NO composite-key lookup method.

- timestamp: 2026-03-18T15:52:00Z
  checked: spacetimedb/node_modules/spacetimedb/src/lib/indexes.ts — IndexVal type
  found: |
    For a multi-column unique/PK index, the accessor name is set in indexes.push({ accessorName: indexOpts.accessor })
    where `accessor` comes from the user's index definition.
    The `primaryKey: ['hsrAccountId', 'characterName']` option sets the constraint (uniqueness), but
    there is NO corresponding index definition with an `accessor` — so no named property is generated.
  implication: Composite PK lookup via an accessor is only possible if the user explicitly declares an index with `accessor` AND `algorithm` covering both PK columns. The table definition does not do this.

- timestamp: 2026-03-18T15:53:00Z
  checked: How other composite-PK tables in the codebase are accessed correctly
  found: |
    Confirmed that `ctx.db.HsrAccountCharacter.hsr_account_id.filter(hsrAccountId)` is the correct pattern
    for the existing btree index (returns all characters for an account).
    To look up a single row by composite PK (hsrAccountId + characterName), the correct approach is to
    call `.hsr_account_id.filter(hsrAccountId)` and then iterate to find the matching `characterName` in JS,
    OR to add an explicit two-column btree index with an accessor name that covers both PK columns.
  implication: The reducer's composite-key lookup pattern is entirely wrong for this SDK version.

## Resolution

root_cause: |
  Both `batch_upsert_characters` and `batch_remove_characters` attempt to look up rows by composite
  primary key using `(ctx.db.HsrAccountCharacter as any).primaryKey.find({ hsrAccountId, characterName })`.

  The SpacetimeDB TypeScript SDK does NOT expose a `.primaryKey` property on the table handle at runtime.
  `Table<TableDef>` exposes only: `insert()`, `delete()`, `iter()`, `count()`, and named index accessors.
  Index accessors are generated only from:
    (a) per-column `.primaryKey()` / `.unique()` / `.index(algo)` calls, OR
    (b) explicit `indexes: [{ accessor: '...', algorithm: '...', columns: [...] }]` entries.

  `HsrAccountCharacter` declares its PK via `primaryKey: ['hsrAccountId', 'characterName']` in the
  table() options object — this registers the constraint for uniqueness enforcement but creates NO
  named accessor property on the runtime table object.

  At runtime, `(ctx.db.HsrAccountCharacter as any).primaryKey` is `undefined`.
  Calling `.find(...)` on `undefined` throws:
    TypeError: Cannot read properties of undefined (reading 'find')

  This unhandled exception in the WASM host is promoted to a fatal panic, causing SpacetimeDB to
  report "The instance encountered a fatal error" to the client.

fix: |
  NOT applied (research-only mode).

  Fix direction: Replace the non-existent `.primaryKey.find()` pattern with a working lookup strategy.
  Two options:

  Option A — Iterate + filter (no schema change):
    Replace:
      const existing = (ctx.db.HsrAccountCharacter as any).primaryKey.find({ hsrAccountId, characterName });
    With:
      const existing = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(hsrAccountId)]
        .find(row => row.characterName === characterName) ?? null;

  Option B — Add an explicit two-column btree index (schema change, requires republish):
    In hsrAccountCharacter.ts, add to indexes:
      { accessor: 'pk', algorithm: 'btree', columns: ['hsrAccountId', 'characterName'] }
    Then use:
      const existing = ctx.db.HsrAccountCharacter.pk.find([hsrAccountId, characterName]);
    (Note: unique two-column indexes generate a UniqueIndex with .find() that returns a single row.)

  Option A requires no schema change and no republish.
  Option B is more efficient at scale (index lookup vs. filter scan) but requires a publish cycle.
  Both affect both batch_upsert_characters and batch_remove_characters.

  Affected lines:
    roster.ts:169 — batch_upsert_characters Phase 2 upsert lookup
    roster.ts:206 — batch_remove_characters validation lookup
    roster.ts:217 — batch_remove_characters deletion lookup
    migrate_roster reducer also uses the same pattern at lines 256-257 (same bug, different reducer).

verification: N/A — research-only mode. No fix was applied.
files_changed: []
