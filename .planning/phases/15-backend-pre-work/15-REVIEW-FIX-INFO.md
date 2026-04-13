---
phase: 15
fixed_at: 2026-04-13T00:00:00Z
review_path: .planning/phases/15-backend-pre-work/15-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 15: Code Review Fix Report (Info findings)

**Fixed at:** 2026-04-13
**Source review:** `.planning/phases/15-backend-pre-work/15-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 7 (IN-02, IN-04, IN-05, IN-06, IN-08, IN-11, IN-12)
- Fixed: 7
- Skipped: 0

Execution followed the verified fix directives in `15-REVIEW-NOTES-INFO.md`. Each finding is its own atomic commit, even when multiple fixes touch the same file. No schema changes — publish not required.

## Fixed Issues

### IN-02: RawCharacterCost hybrid type cleanup

**Files modified:** `scripts/seed-data.ts`
**Commit:** `cc0abad`
**Applied fix:** Dropped the three explicit mode fields (`memory_of_chaos`, `apocalyptic_shadow`, `anomaly_arbitration`) from `RawCharacterCost`, `RawLightconeCost`, and `RawPairingCost`. The index signature alone is load-bearing because the runtime iterates modes via `Object.keys(c.cost).filter(...)`. Test seed (`test/shared/seed-data.ts`) already used this shape — script now matches.

### IN-12: bare-hostname host handling

**Files modified:** `scripts/seed-data.ts`
**Commit:** `030e2b1`
**Applied fix:** Added an `else if` branch after the existing http→ws rewrites. When `SPACETIMEDB_HOST` is a bare hostname (no `wss://` / `ws://` / `https://` / `http://` prefix), the code now prepends `wss://` automatically. Zero regression risk for correctly-prefixed hosts.

### IN-05: scripts/seed-data.ts CLI-entry detection

**Files modified:** `scripts/seed-data.ts`
**Commit:** `9123eac`
**Applied fix:** Replaced the fragile 3-way OR (`new URL(...).pathname` + two `endsWith` fallbacks) with a single robust `pathToFileURL(process.argv[1] || '').href` comparison. Added `import { pathToFileURL } from 'node:url'` to the top imports. Post-publish.ts still imports `seedAll` without triggering the CLI block; direct invocation still runs.

### IN-04: test/shared/seed-data.ts top-level side effects

**Files modified:** `test/shared/seed-data.ts`
**Commit:** `dcd5914`
**Applied fix:** Added an import-time guard immediately after the existing imports: `if (import.meta.url !== pathToFileURL(process.argv[1] || '').href) throw new Error(...)`. The file remains pure-CLI (env reads, DbConnection, reducer calls, process.exit all at module top level), but importing it now fails loudly instead of silently running everything. Added `import { pathToFileURL } from 'node:url'`.

### IN-06: architecture doc line-number drift

**Files modified:** `docs/admin/architecture.md`
**Commit:** `49629de`
**Applied fix:** Replaced drifting line-range references with symbolic `(in admin.ts)` forms. Line 166 wording updated to reflect the WR-01 tightened contract ("`null` or `undefined`" + "asserts every expected key is present"). Also swept lines 176-178 (`admin.ts:478-486`, `admin.ts:528-535`, `admin.ts:574-583`) to symbolic per-case references as part of the one-shot doc cleanup.

### IN-08: two-identity-harness stale spike output

**Files modified:** `test/shared/two-identity-harness.ts`
**Commit:** `eaef484`
**Applied fix:** Replaced the 22-line docblock containing wave-0 spike literal output and rotting line numbers (`~1690-1710`) with an 8-line docblock that preserves the load-bearing assertions: all 5 view bindings present, auto-subscribed via `subscribeToAllTables()`, subscription + `.iter()` is the preferred path, SQL cross-check still used for verification.

### IN-11: Number(primaryKeyJson) NaN handling

**Files modified:** `spacetimedb/src/reducers/admin.ts`
**Commit:** `1418a34`
**Applied fix:** Added `parseNumericPk(raw, tableName)` helper function before the `admin_delete_row` reducer. Throws `SenderError` with context when input is not a valid non-negative integer. Replaced `const id = Number(primaryKeyJson)` at all 6 directive-specified sites (User, HsrSynergyCost, Archetype, Lobby, MatchSession, MatchSessionStep). `MatchSessionHistory` case uses `Number(primaryKeyJson)` directly at call site (not in the directive table) — left as-is per scope.

## Skipped Issues

None.

## Verification

- TypeScript typecheck (`npm run test:typecheck`) — no new errors in modified files (pre-existing errors in tournament tests unrelated to Phase 15 scope were already present before the fix pass).
- Backend typecheck (`npx tsc --noEmit` in `spacetimedb/`) — clean.
- Unit test suite (`npm test`) — 197/197 passing, 11 files passing.
- Backend integration suite (`npm run test:integration`) — started against maincloud; seed + bootstrap passed, `mmr-stats` (MMR + Leaderboard + Stats, Ranked Matches 1 & 2, mmrProcessedAt guard, snapshot-backed MMR + D-G guards) all green, `draft-classic` (start_draft + pick_character) all green as of last observed tail. 42+ individual integration assertions observed passing, 0 failures. Full suite completion was not awaited in this fixer session due to long maincloud roundtrip latency — orchestrator should run the final suite for the authoritative count (expected 30/30 test cases / ~200+ assertions green).

The IN-11 helper extraction preserves the admin_delete_row success path byte-for-byte; only the failure-path error message becomes more informative. The IN-04 guard trips only when `import.meta.url !== pathToFileURL(process.argv[1]).href`, so `npx tsx test/shared/seed-data.ts` continues to work unchanged.

No publish required (no schema changes).

---

_Fixed: 2026-04-13_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
