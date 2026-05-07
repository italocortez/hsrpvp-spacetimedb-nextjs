# Phase 12.3: MMR Rating Snapshot - Research

**Researched:** 2026-04-11
**Domain:** SpacetimeDB TypeScript module — backend-only correctness fix (freeze MMR account-rating input + LMA migration cleanup)
**Confidence:** HIGH

## Summary

Phase 12.3 is a surgical backend fix with zero new surface area and no frontend impact. The scope is fully locked by CONTEXT.md (D-A through D-I). Research here verifies every load-bearing claim against the actual code and pre-wires the planner with the exact line numbers, existing helpers, index availability, and test-framework facts it needs to break the work into tasks. All claims below are `[VERIFIED]` against the repository at the current HEAD — nothing in this document is training-data guesswork about SpacetimeDB APIs or libraries.

The work splits cleanly into six independent-ish decision blocks (D-A capture, D-B monotonic hook, D-readpath read-site swap, D-G four guards, D-D helper extraction + migrate_roster fix, D-H tournament-ordering guard, D-I auto-pick pool LMA migration) over a single schema column add. Every required index (`by_result_and_user` on MRP, `by_lobby_and_user` on LMA, `by_account` on LMA, `lobby_id`/`bracket_match_id` on MatchResultRecord, `tournament_id` on BracketMatch) already exists. Every helper the phase leans on (`auditInsert`, `auditUpdate`, `updateAccountRating`, `ensureTournamentAccess`, `validateCharacterOwnership`, `ensureVerifiedUser`) is in place and unmodified. The only new files are helper (`rosterMutations.ts` — planner call) and tests.

**Primary recommendation:** Plan tasks in the exact order D-F (schema) → D-A (capture) → D-readpath (read-site swap) → D-B (monotonic hook) → D-D (helper + migrate_roster) → D-G (four guards) → D-H (tournament guard) → D-I (auto-pick pool). Schema-first because every later change depends on the column existing. Read-path swap must be paired with capture because the old `isActive` path is removed atomically. Tests should follow each block rather than batch at the end — the test infrastructure already exists (vitest, `createVerifiedTestHarness`, shared helpers).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Phase Boundary
Freeze the account-rating input to ELO at match-record time so MMR deltas remain correct regardless of post-capture mutations to `HsrAccount.accountRating` or `HsrAccount.isActive`. Persist the frozen value on a new `MatchResultParticipant.accountRatingSnapshot: f64` column. Switch `processMatchMmr` to read the snapshot instead of re-querying `HsrAccount.isActive`. Add UX lobby guards to four roster/account reducers. Add a tournament-ordering guard on `finalize_match_result` to preserve batch MMR processing and bracket rollback capability. Finish the Phase 10.4 LMA migration by also migrating the `timer_expiry_classic` auto-random-pick ownership pool — the last in-gameplay runtime read of `HsrAccount.isActive`. After Phase 12.3, `isActive` serves as the bootstrap default for LMA, but once LMA rows exist they are the per-match source of truth for both MMR input and character ownership.

**In scope:** schema column, capture at `start_draft`, monotonic-upward update between games in a best-of-N series, `processMatchMmr` read-path change, four UX guards, `migrate_roster` stale-rating fix via helper refactor, tournament-ordering guard on `finalize_match_result`, auto-random-pick ownership pool migration from `isActive` to LMA, test coverage.

**Out of scope:** historical backfill, UI changes, changes to ELO math or the account-rating computation formula, bracket rollback mechanism itself, stand-in mid-series MMR attribution, per-account match-history display (v1 concern).

#### D-A: Capture point
- **D-A-01:** Snapshot captured inline in the `MatchResultParticipant` insert loop at `spacetimedb/src/reducers/draftClassic.ts::start_draft` (line 204). This is the exact moment lobby transitions Waiting → Drafting. One reducer, one capture site. No separate update path at finalization.
- **D-A-02:** Before `start_draft` fires, users can freely select/deselect/swap LMA rows with no snapshot effect. Only the state of LMA at the instant `start_draft` fires becomes the initial snapshot.

#### D-B: Snapshot value (max, monotonic upward)
- **D-B-01:** `accountRatingSnapshot = max(HsrAccount.accountRating)` taken across all `LobbyMemberAccount` rows for `(lobbyId, userId)` at capture time. Single-LMA user → that account's rating. Tournament multi-account → highest-rated among them.
- **D-B-02:** No LMA rows at capture → snapshot defaults to `0`. Only reachable in casual matches (start_draft at draftClassic.ts:59-73 rejects ranked/MMR-counted-tournament matches with zero LMA). `0` matches the existing `?? 0` fallback at finalizationHelpers.ts:87,91 and produces zero account-modifier contribution.
- **D-B-03:** During `BetweenGames` in a best-of-N series, `select_match_account` is extended with a monotonic-upward update hook. After inserting the new LMA row, look up `MatchResultRecord` by `lobbyId`; if found, look up MRP by `(matchResultId, userId)` and update `accountRatingSnapshot = Math.max(existing, newAccount.accountRating)`. `deselect_match_account` does NOT touch the snapshot.
- **D-B-04:** Hook gated by MRP existence, not lobby stage. In `Waiting`, no MatchResultRecord exists → lookup returns empty → no-op. In `BetweenGames`, record exists → hook runs. No explicit stage check needed.
- **D-B-05:** Stand-ins joining after `start_draft` have LMA rows but no MRP row. Hook short-circuits (`if (!mrp) return;`). Stand-ins receive no MMR delta (intentional — code comment documents this).
- **D-B-06:** Stand-in handling is intentionally asymmetric between D-B (MMR — no delta) and D-I (auto-pick pool — characters contribute).

#### D-readpath: Read-site swap
- **D-readpath-01:** `finalizationHelpers.ts` lines 85-92 rewritten to read `participant.accountRatingSnapshot` directly. Both `blueAccountRatings` and `redAccountRatings` become `participants.map(p => p.accountRatingSnapshot)`.
- **D-readpath-02:** Single change fixes both standalone-ranked (`runFinalization` step 11 at finalizationHelpers.ts:408-420) and tournament-batch (`process_tournament_mmr` at matchFinalization.ts:108-127). Both call `processMatchMmr`; fix is path-independent by construction.

#### D-G: Lobby guards on four roster reducers (UX, not correctness)
- **D-G-01:** Add lobby guards to `set_active_hsr_account` (roster.ts:75-96), `batch_upsert_characters` (roster.ts:160-200), `batch_remove_characters` (roster.ts:206-239), `migrate_roster` (roster.ts:246-292).
- **D-G-02:** Each guard rejects when the caller has any active `LobbyMemberAccount` binding. `ctx.db.LobbyMemberAccount.by_account.filter(hsrAccountId)` for account-specific reducers; broader `filter by userId` for roster-level reducers that mutate any of the caller's accounts. Error message names the conflicting lobby.
- **D-G-03:** Guards exist for UX clarity, not correctness. They mirror the existing guard on `delete_hsr_account` at roster.ts:112-115.

#### D-D: migrate_roster helper refactor + stale-rating fix
- **D-D-01:** Extract two pure helpers (planner's call on file location — new `rosterMutations.ts` or additions to existing `rosterHelpers.ts`):
  - `applyBatchUpsert(ctx, accountId, items, actingUserId)` — validate all, composite-PK delete+insert all `HsrAccountCharacter` rows, then `updateAccountRating(ctx, accountId, actingUserId)`.
  - `applyBatchRemove(ctx, accountId, names, actingUserId)` — validate all names exist, delete all, then `updateAccountRating(ctx, accountId, actingUserId)`.
- **D-D-02:** Refactor `batch_upsert_characters` and `batch_remove_characters` into thin wrappers: auth + ownership check + delegate.
- **D-D-03:** Refactor `migrate_roster` to use the helpers. Copy and move modes: `applyBatchUpsert(ctx, targetAccountId, sourceChars, user.id)`. Move mode only: additionally `applyBatchRemove(ctx, sourceAccountId, sourceCharNames, user.id)`.
- **D-D-04:** Fixes a pre-existing latent bug at roster.ts:246-292 — `migrate_roster` never called `updateAccountRating`, leaving both accounts with stale rating until another mutation triggered recompute.

#### D-H: Tournament-ordering guard
- **D-H-01:** Stage guard near the top of `finalize_match_result` at matchFinalization.ts:13-58, after `matchResult` lookup and before authority check. When `matchResult.isTournamentControlled === true`, derive parent tournament via `BracketMatch.tournamentId` (same derivation as authority check at lines 39-50), look up `Tournament.stage`, reject unless `Completed` or `Cancelled`.
- **D-H-02:** Guard is unconditional. `countTowardsMmr` is NOT consulted. Protects both MMR batch processing AND bracket rollback capability.
- **D-H-03:** Error message: `"Tournament match cannot be finalized while the tournament is still active. Wait for the tournament to reach Completed or Cancelled — this preserves MMR batch processing and bracket rollback capability."`
- **D-H-04:** Behavioral matrix: non-tournament matches unchanged; MMR-tournament matches blocked until terminal stage → process_tournament_mmr runs → finalize_match_result succeeds; casual-tournament matches blocked until terminal stage → finalize_match_result succeeds.
- **D-H-05:** Actual bracket rollback mechanism NOT implemented in this phase. D-H makes it possible.

#### D-I: Auto-random-pick ownership pool migration (scope expansion)
- **D-I-01:** `timer_expiry_classic` at draftClassic.ts:651-668 builds auto-pick pool from `HsrAccount.isActive`. Same class of bug as MMR read path — Phase 10.4 migration gap.
- **D-I-02:** Refactor to match `validateCharacterOwnership` / `start_draft` autoRandomPick validation pattern: iterate `LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, member.userId])` per team member, union character rows into `ownedSet`.
- **D-I-03:** Eliminates linear `.find(a => a.isActive)` scan and over-fetching `HsrAccount.user_id.filter`. Per member: 1 indexed LMA filter + 1 indexed character filter per LMA row.
- **D-I-04:** Behavioral corrections: stand-ins contribute LMA characters; multi-account users get union; non-tournament LMA ≠ isActive users get LMA's pool; casual requireOwnership with no LMA → empty set.
- **D-I-05:** Helper extraction rejected — inline refactor (matches same-file style at draftClassic.ts:76-96).
- **D-I-06:** Scope expansion justified: same root cause (Phase 10.4 migration gap), ~10 line diff, converges three call sites onto one pattern.

#### D-F: Schema
- **D-F-01:** `MatchResultParticipant.accountRatingSnapshot: t.f64()` added as required column, default `0`. No null fallback in read path.
- **D-F-02:** Republish with `--clear-database` via existing `post-publish.ts` workflow. No historical backfill.

#### D-E: Rationale correction (documented vectors)
- **D-E-01:** Real vectors:
  1. `processMatchMmr` reads `HsrAccount.isActive`, mutable via `set_active_hsr_account` (no guard).
  2. `HsrAccount.accountRating` is recomputed in place by `updateAccountRating` during roster character mutations (unguarded).
  3. `process_tournament_mmr` re-reads `isActive` at tournament-end when `isActive` may have rotated.
  LMA swaps are NOT a vector — `select_match_account` has a stage guard at accountSelection.ts:34-37.
- **D-E-02:** Snapshot at `start_draft` makes all three vectors irrelevant.

### Claude's Discretion

- Exact file location for extracted `applyBatchUpsert` / `applyBatchRemove` helpers (new `rosterMutations.ts` vs. additions to existing `rosterHelpers.ts`).
- Exact shape of lobby-guard error messages (which identifier to cite alongside "this lobby" — `lobbyJoinCode`, lobby id, or team name).
- Whether to harden the defensive concede fallback at `finalizationHelpers.ts:262-270` with a live LMA read. Unreachable via user-facing reducers; only admin-only edge cases.
- Test file organization — single `mmr-snapshot` test file vs. splitting by concern (capture, monotonic, guards, tournament-ordering).

### Deferred Ideas (OUT OF SCOPE)

- Stand-in mid-series MMR attribution — pre-existing gap, not fixed by Phase 12.3.
- Historical backfill for existing MRP rows — DB wipe handles test-env.
- Bracket rollback reducer — future phase; D-H preserves capability only.
- `hsrAccountIdAtMatch` attribution column on MRP — v1 frontend concern.
- Optional hardening of defensive concede fallback — planner's call to include or skip.
- Other `HsrAccount.isActive` readers remain functional after Phase 12.3: auto-LMA seed on lobby join (lobbyLifecycle.ts:323-338), tournament registration presence check (tournamentRegistration.ts:41-44), invariant preservation on delete (roster.ts:137-149, rosterAdmin.ts:110-119), view exposure (securityViews.ts:565,580). Phase 12.3 touches NONE of these.
</user_constraints>

<phase_requirements>
## Phase Requirements

These IDs are locked in ROADMAP.md (Phase 12.3 section). Note: MMR-RACE-01, MMR-RACE-02, and ROST-GUARD-01 are declared in the roadmap's Phase header but are NOT yet in REQUIREMENTS.md's body or traceability table — the planner should flag this for REQUIREMENTS.md backfill as part of the phase deliverables (or surface it to the user during plan-check).

| ID | Description | Research Support |
|----|-------------|------------------|
| **MMR-RACE-01** | ELO delta uses rating value at match start, not finalize time | D-A + D-F: schema column on MRP, captured inline in `start_draft` MRP insert loop at `draftClassic.ts:204`, default 0 for casual-no-LMA. D-readpath-01 removes the post-capture `isActive` read at `finalizationHelpers.ts:85-92`. |
| **MMR-RACE-02** | `processMatchMmr` path-independent across standalone-ranked and tournament-batch | D-readpath-02: both `runFinalization` step 11 (`finalizationHelpers.ts:408-420`) and `process_tournament_mmr` (`matchFinalization.ts:108-127`) call the same `processMatchMmr` helper. Single edit to lines 85-92 makes both paths read from the persisted snapshot, bypassing LMA-deletion gap in the tournament-batch path. |
| **ROST-GUARD-01** | `set_active_hsr_account` and roster mutation reducers reject while caller has active LobbyMemberAccount | D-G-01/02: four guards using `LobbyMemberAccount.by_account.filter(hsrAccountId)` (account-specific) or filter-by-userId (roster-level) — mirrors existing `delete_hsr_account` guard at `roster.ts:112-115`. |
| **MMR-SNAPSHOT-01** *(from CONTEXT)* | `processMatchMmr` uses MRP.accountRatingSnapshot; no `HsrAccount.isActive` reads remain in `processMatchMmr` | Covered by D-readpath-01. |
| **MMR-SNAPSHOT-02** *(from CONTEXT)* | Snapshot = max across LMA rows, monotonic upward only | D-B-01 + D-B-03: max at capture, monotonic hook on `select_match_account`. |
| **MMR-SNAPSHOT-03** *(from CONTEXT)* | path-independent (dup of MMR-RACE-02) | D-readpath-02. |
| **MMR-SNAPSHOT-04** *(from CONTEXT)* | No-LMA users → snapshot 0; calculateAccountModifier no-op when both teams 0 | D-B-02 verified against `finalizationHelpers.ts:101-105` (`if (blueAvgAccount > redAvgAccount)` is false for 0/0). |
| **ROST-MIGRATE-01** *(from CONTEXT)* | `migrate_roster` recomputes accountRating for both source and target | D-D-03: helper extraction pulls `updateAccountRating` into `migrate_roster` transparently. |
| **TOURN-ORDER-01** *(from CONTEXT)* | `finalize_match_result` rejects tournament-controlled matches unless Tournament.stage ∈ {Completed, Cancelled}, regardless of `countTowardsMmr` | D-H-01/02: guard derived via BracketMatch → Tournament, unconditional. |
| **OWN-POOL-01** *(from CONTEXT)* | `timer_expiry_classic` auto-pick ownership pool reads LMA, not `HsrAccount.isActive`; per-member union across selected LMA accounts; no `.find(a => a.isActive)` scan remains | D-I-02/03: inline refactor per CONTEXT example block. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Hard directives from `./CLAUDE.md` that govern execution and tests. The planner MUST verify no task violates these.

| # | Directive | Source |
|---|-----------|--------|
| C1 | Load `/spacetimedb` skill before writing any backend code | Mandatory Skills table |
| C2 | Reducers are transactional — no return values to callers | Core Concepts #1 |
| C3 | Reducers must be deterministic — no filesystem/network/timers/random | Core Concepts #2 |
| C4 | Read data via tables/subscriptions — not reducer return values | Core Concepts #3 |
| C5 | Auto-increment IDs are not sequential — don't use for ordering | Core Concepts #4 |
| C6 | `ctx.sender` is authenticated principal — never trust identity args | Core Concepts #5 |
| C7 | Energy budget matters — egress dominates on maincloud | Core Concepts #6 |
| C8 | Update `docs/{feature}/architecture.md` every time backend code changes | Backend Feature Docs |
| C9 | **Never modify behavior specs (`docs/*/contract.md`) during execution.** Contract updates happen POST-execution with `Phase 12.3 execution` tags in the Phase History table | Backend Feature Docs (emphatic) |
| C10 | **Test files (`test/`) are the verification layer. Do not create, edit, or delete test files without an explicit task. Test failures are diagnostic — report them, never auto-fix.** | Backend Feature Docs (emphatic) |
| C11 | Make the smallest change necessary; do NOT touch unrelated files, configs, or dependencies | Editing Behavior |
| C12 | Do NOT invent new SpacetimeDB APIs — use only what exists in docs or this repo | Editing Behavior |
| C13 | Do NOT add restrictions the prompt didn't ask for | Editing Behavior |
| C14 | Publish to maincloud by default (free). DB wipe via existing `post-publish.ts` workflow | Deployment |
| C15 | NEVER delete or commit `.env.local` or `.env` — only `post-publish.ts` edits these after `--clear-database` | Git Rules |

**Critical compliance notes for the planner:**

- **C10 implication:** Every new test file in CONTEXT.md's "Files Expected to Change" → "New" section IS an explicit task and therefore allowed. But tasks MUST name each test file and its purpose up-front. No task may "also add a quick test" as an afterthought.
- **C9 implication:** Docs contract updates are deferred to post-execution verify-work review. Tasks may update `architecture.md` files during execution; `contract.md` files must only be touched AFTER execution lands, with `Phase 12.3 execution` tags. The planner should either (a) schedule contract updates as final post-execution sub-tasks with a bold warning, or (b) move contract updates out of the plan entirely and leave them to the verify-work review. Recommend (a) with an explicit "do not merge this task with code tasks" note.
- **C5 implication:** D-H derives Tournament from BracketMatch, which derives from MRP. None of these chains uses auto-inc order as a sort key — verified.
- **C7 implication:** The phase adds a single `f64` column to MRP. MRP rows live until step 18 (deleted during finalization). Egress cost is bounded by match count × team size. No hot path grows. Verified: `MatchResultParticipant` is `public: true` (subscribed by clients), so the new column DOES ship to subscribed clients while the row is alive. Acceptable — one f64 per player per live match.
- **C12 implication:** The CONTEXT.md D-B-03 hook uses `ctx.db.LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, user.id])` — verified to exist at `lobbyMemberAccount.ts:22`. The MRP lookup uses `ctx.db.MatchResultParticipant.by_result_and_user.filter([mrId, userId])` — verified to exist at `matchResultParticipant.ts:22`. No API invention required.

## Standard Stack

### Core (already in place — no additions)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| SpacetimeDB TS module API | `spacetimedb ^2.1.0` | Server-side module: tables, reducers, indexes, SenderError | The only supported way to ship a SpacetimeDB module on this project [VERIFIED: `package.json:46`] |
| Vitest | `^4.1.0` (devDep) | Test runner for unit + integration | Existing test infrastructure uses vitest with two configs: `test/vitest.config.ts` (unit) and `test/vitest.integration.config.ts` (integration) [VERIFIED: `package.json:18-23, 54`] |
| Node.js | `>=24.0.0` (engines) | Runtime for module + tests | Project-level engine constraint [VERIFIED: `package.json:6-8`] |

**No new dependencies required.** Phase 12.3 is code-only; no npm/cargo install, no Context7 library lookups, no WebSearch for alternatives.

### Installed SpacetimeDB primitives this phase uses

| Primitive | Where | Confirmed By |
|-----------|-------|--------------|
| `table({ primaryKey, indexes, public })` + `t.f64()` | `MatchResultParticipant` column add | [VERIFIED: `matchResultParticipant.ts:4-24` uses `t.u32()/t.bool()/t.timestamp()` and composite PK] |
| `spacetimedb.reducer({ params }, (ctx, args) => {...})` | All affected reducers | [VERIFIED: used throughout `reducers/*.ts`] |
| `SenderError('msg')` | All guard rejections | [VERIFIED: `reducers/roster.ts:81,82,...`] |
| Composite-PK delete+insert update pattern | D-B-03 hook (MRP update), D-D (HsrAccountCharacter update already extant) | [VERIFIED: `finalizationHelpers.ts:136-148` MmrRating; `roster.ts:185-195` HsrAccountCharacter] |
| Indexed filter: `ctx.db.X.by_foo.filter(arg)` / `filter([arg1, arg2])` | LMA lookup, MRP lookup, MatchResultRecord.lobby_id | [VERIFIED: `lobbyMemberAccount.ts:21-24`, `matchResultParticipant.ts:19-23`] |
| `auditInsert(ctx, userId)` / `auditUpdate(ctx, existing, userId)` | All row inserts/updates | [VERIFIED: `helpers/auditColumns.ts:8-28`] |

**Installation:**
```bash
# No install step. Use existing workflow:
# 1. Edit source under spacetimedb/src/
# 2. npm run spacetime:publish   (maincloud, or local if default)
# 3. npm run spacetime:generate  (regenerate client bindings)
# 4. npx tsx post-publish.ts --clear-database  (D-F-02 DB wipe; also rewrites .env per CLAUDE.md)
```

**Version verification:** `spacetimedb ^2.1.0` confirmed in `package.json:46` [VERIFIED: direct file read]. No Context7 lookup needed — the skill's SKILL.md already pins the version and patterns. Do NOT run `npm view spacetimedb version` and upgrade as part of this phase (violates C11/C13).

### Alternatives Considered (and rejected before CONTEXT.md)

| Instead of | Could Use | Why rejected (per CONTEXT.md + debug doc) |
|------------|-----------|--------------------------------------------|
| Snapshot on MRP | New `MatchParticipantSnapshot` table | More surface area for zero benefit; MRP already has composite PK `[matchResultId, userId]` — perfect granularity. |
| `accountRatingSnapshot` column | `hsrAccountId` column (archive the account id) | Rejected in CONTEXT (Deferred Ideas): no persisted stat table references `hsrAccountId` in v0.5, and the ELO math only needs the rating. Attribution column is a v1 frontend concern. |
| Monotonic `max` aggregation | Sum / average / per-LMA storage | User explicitly picked `max` for anti-gaming (D-B decision log gap 2+3). |
| `countTowardsMmr`-conditional D-H guard | Unconditional guard | User rejected — bracket rollback is needed for casual tournaments too (D-H second round). |
| Extract shared helper for D-I auto-pick pool | Inline refactor | Three call sites each want a different output shape (count, Set, early-return bool) — helper would be awkward. D-I-05. |

## Architecture Patterns

### Recommended File Layout

```
spacetimedb/src/
├── tables/
│   └── matchResultParticipant.ts        # MODIFIED: add accountRatingSnapshot column
├── reducers/
│   ├── draftClassic.ts                  # MODIFIED: start_draft MRP insert (D-A) + timer_expiry_classic auto-pick pool (D-I)
│   ├── accountSelection.ts              # MODIFIED: select_match_account adds monotonic-upward hook (D-B-03)
│   ├── matchFinalization.ts             # MODIFIED: finalize_match_result adds tournament stage guard (D-H)
│   └── roster.ts                        # MODIFIED: four guards + three reducer bodies become thin wrappers (D-D + D-G)
├── helpers/
│   ├── finalizationHelpers.ts           # MODIFIED: processMatchMmr read lines 85-92 (D-readpath)
│   └── rosterMutations.ts               # NEW (or merge into rosterHelpers.ts): applyBatchUpsert + applyBatchRemove
└── schema.ts                            # NO CHANGE (MRP already registered)

test/backend/
├── match-results/
│   ├── mmr-snapshot.unit.test.ts        # NEW — capture + default-0 + max aggregation
│   ├── mmr-snapshot-betweengames.test.ts  # NEW — monotonic upward across bestOf series
│   └── mmr-stats.test.ts                # EXTEND — D-G race-condition integration tests (add, do not rewrite)
├── roster/
│   └── migrate-roster-rating.test.ts    # NEW — D-D pre-existing stale-rating regression
├── tournaments/
│   └── tournament-ordering-guard.test.ts  # NEW — D-H guard behavior
└── match-session/
    └── auto-pick-ownership-pool.test.ts  # NEW — D-I four behavioral corrections

docs/
├── match-results/architecture.md        # MODIFIED during execution — snapshot pattern + read-path
├── match-results/contract.md            # POST-EXECUTION ONLY (C9) — MMR snapshot scenarios
├── roster/contract.md                   # POST-EXECUTION ONLY (C9) — four guards + migrate_roster rating
└── tournament/contract.md               # POST-EXECUTION ONLY (C9) — finalize_match_result ordering guard
```

### Pattern 1: Composite-PK update preserving audit columns

**What:** SpacetimeDB composite-PK tables don't support `update()` directly on the PK. The canonical pattern is delete-then-insert, spreading the existing row to preserve `createdById`/`createdDate` via `auditUpdate(ctx, existing, actingUserId)`.

**When to use:** D-B-03 MRP snapshot update (monotonic hook). D-D helper internal `HsrAccountCharacter` upsert (already used by existing `batch_upsert_characters`).

**Example:**
```typescript
// Source: finalizationHelpers.ts:136-148 (MmrRating update)
const currentRating = [...ctx.db.MmrRating.by_user_mode_season.filter([participant.userId, gameMode, seasonId])][0];
if (currentRating) {
    ctx.db.MmrRating.delete(currentRating);
}
ctx.db.MmrRating.insert({
    userId: participant.userId,
    gameMode,
    rating: newRating,
    matchesPlayed: (currentRating?.matchesPlayed ?? 0) + 1,
    globalCompositeRating: currentRating?.globalCompositeRating,
    seasonId,
    ...(currentRating ? auditUpdate(ctx, currentRating, actingUserId) : auditInsert(ctx, actingUserId)),
} as any);
```

**Applied to D-B-03 hook (planner should base the implementation on this shape):**
```typescript
// Inside select_match_account after the LMA insert at accountSelection.ts:80 or 86
const mr = [...ctx.db.MatchResultRecord.lobby_id.filter(lobbyId)][0];
if (!mr) return;  // Waiting stage — no MRP rows exist yet; pre-draft swap is harmless (D-B-04)
const existingMrp = [...ctx.db.MatchResultParticipant.by_result_and_user.filter([mr.id, user.id])][0];
if (!existingMrp) return;  // Stand-in without MRP (D-B-05)
const freshAccount = ctx.db.HsrAccount.id.find(hsrAccountId);
if (!freshAccount) return;
const newSnapshot = Math.max(existingMrp.accountRatingSnapshot, freshAccount.accountRating);
if (newSnapshot === existingMrp.accountRatingSnapshot) return;  // no-op optimization
ctx.db.MatchResultParticipant.delete(existingMrp);
ctx.db.MatchResultParticipant.insert({
    ...existingMrp,
    accountRatingSnapshot: newSnapshot,
    ...auditUpdate(ctx, existingMrp, user.id),
} as any);
```

### Pattern 2: Stage-gated reducer rejection with SenderError

**What:** Block a reducer when the lobby stage doesn't match the allowed set. Standard style across the codebase.

**When to use:** D-H tournament-stage guard, D-G lobby guards (via a different predicate: "caller has active LMA" rather than stage).

**Example (D-H shape, base on existing authority derivation):**
```typescript
// In finalize_match_result, after matchResult lookup at matchFinalization.ts:22-28
if (matchResult.isTournamentControlled && matchResult.bracketMatchId !== undefined) {
    const bracketMatch = ctx.db.BracketMatch.id.find(matchResult.bracketMatchId);
    if (bracketMatch) {
        const tournament = ctx.db.Tournament.id.find(bracketMatch.tournamentId);
        if (tournament && tournament.stage.tag !== 'Completed' && tournament.stage.tag !== 'Cancelled') {
            throw new SenderError(
                'Tournament match cannot be finalized while the tournament is still active. ' +
                'Wait for the tournament to reach Completed or Cancelled — this preserves MMR batch processing and bracket rollback capability.'
            );
        }
    }
}
```
Verified: same `BracketMatch → tournamentId` derivation is already used by the authority check at `matchFinalization.ts:39-50`.

### Pattern 3: D-G lobby guard — filter LMA, reject if non-empty

**What:** Mirror the existing `delete_hsr_account` guard at `roster.ts:112-115`.

```typescript
// Source: roster.ts:111-115 (delete_hsr_account)
const activeLma = [...ctx.db.LobbyMemberAccount.by_account.filter(hsrAccountId)];
if (activeLma.length > 0) {
    throw new SenderError('Cannot delete an account that is selected in an active lobby. Leave the lobby first.');
}
```

**Applied to the four D-G reducers:**

| Reducer | Filter | Predicate |
|---------|--------|-----------|
| `set_active_hsr_account` | `LobbyMemberAccount.by_account.filter(hsrAccountId)` | The specific target account is bound to a lobby — reject |
| `batch_upsert_characters` | `LobbyMemberAccount.by_account.filter(hsrAccountId)` | The specific account being edited is in a lobby |
| `batch_remove_characters` | `LobbyMemberAccount.by_account.filter(hsrAccountId)` | Same |
| `migrate_roster` | `LobbyMemberAccount.by_account.filter(sourceAccountId)` AND `...by_account.filter(targetAccountId)` | Either side bound → reject (broader check than account-specific because two accounts are mutated) |

**Note on guard predicate scope (Claude's discretion):** CONTEXT.md D-G-02 says "a broader `filter by userId` for roster-level reducers that mutate any of the caller's accounts". However, LMA table has NO `user_id`-only index — only `lobby_id` and `by_lobby_and_user` and `by_account`. Filtering by user would require either:
1. A new `by_user` index on LMA (adds to surface — violates C11), OR
2. Per-account `by_account.filter(accId)` loops (works with existing index).

**Recommendation:** For `batch_*` and `migrate_roster`, use the account-specific `by_account` filter on the reducer's target account(s). This is strictly narrower than CONTEXT's "broader by user" hint but (a) requires no new index, (b) matches the actual footprint of the mutation (the batch only touches the target account), and (c) still blocks the race the user cares about. Planner should confirm this interpretation during plan-check — if the user wants "block if ANY of the caller's 5 accounts is in a lobby", a new index is required and that should be a separate surface decision.

### Pattern 4: D-I inline union across LMA rows

**What:** Match the `validateCharacterOwnership` and `start_draft` autoRandomPick validation style exactly — no helper extraction.

```typescript
// Applied at draftClassic.ts:651-668, replacing the isActive block
if (lobby.requireOwnership && teamMembers.length > 0) {
    const ownedSet = new Set<string>();
    for (const member of teamMembers) {
        // D-14: Check characters from LobbyMemberAccount entries only (Phase 10.4 migration)
        const selectedAccounts = [...ctx.db.LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, member.userId])];
        for (const lma of selectedAccounts) {
            const chars = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(lma.hsrAccountId)];
            for (const c of chars) {
                ownedSet.add(c.characterName);
            }
        }
    }
    availablePool = [...ownedSet].filter(
        (name) => !bannedChars.has(name) && !pickedChars.has(name)
    );
}
```
[VERIFIED pattern match: `ownershipValidation.ts:21-36` and `draftClassic.ts:76-96` both already use this exact shape]

### Anti-Patterns to Avoid

- **DO NOT add a `by_user` index to LMA** just to satisfy D-G's "broader filter" phrasing. C11 forbids unnecessary changes; the account-specific filter is sufficient.
- **DO NOT refactor `processMatchMmr` beyond lines 85-92.** The rest of the function is correct and in scope only for the account-modifier read.
- **DO NOT write `ctx.db.LobbyMemberAccount.user_id.filter(userId)`** — that index does not exist on LMA. The existing indexes are `lobby_id`, `by_lobby_and_user`, `by_account`. [VERIFIED: `lobbyMemberAccount.ts:21-24`]
- **DO NOT rename `HsrAccount.isActive` or mark it deprecated.** CONTEXT deferred section enumerates four still-functional uses (auto-LMA seed, tournament registration presence check, invariant preservation on delete, view exposure).
- **DO NOT update `docs/*/contract.md` during code execution.** C9 mandates post-execution contract updates only, tagged with `Phase 12.3 execution`.
- **DO NOT touch `eloCalculation.ts` or `accountRating.ts`.** Out of scope — only consumers of the snapshot change.
- **DO NOT touch stand-in MMR handling.** Explicitly deferred. D-B-05 + D-B-06 code comments document the intentional no-op.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audit columns on insert/update | Manually spread `createdById`, `createdDate`, etc. | `auditInsert(ctx, userId)` / `auditUpdate(ctx, existing, userId)` | Drift risk; existing helper enforces the pattern. |
| Tournament derivation from a match result | Inline `matchResult → tournamentId` lookup | Reuse the `BracketMatch → tournamentId` chain already used at `matchFinalization.ts:39-50` | Phase 10.1 (D-42) removed `tournamentId` from MatchResultRecord; BracketMatch is the only path. |
| `updateAccountRating` call sequencing | Re-implement the rating recompute inside `migrate_roster` | Extract `applyBatchUpsert` / `applyBatchRemove` helpers and delegate | D-D-01/02/03: centralizes the "mutate chars, then recompute rating" sequence for three reducers. |
| `LobbyMemberAccount` presence check | Inline `[...filter].length > 0` pattern in each guard | That IS the standard pattern — mirror `delete_hsr_account` at `roster.ts:112-115` verbatim | Any "helper function" would just wrap a one-liner. |
| Character ownership union across multiple LMA accounts | A shared "get owned chars" helper | Inline iteration (matches three existing call sites) | D-I-05: each call site wants a different output shape; helper would be awkward. |
| Composite-PK "update in place" | Any pattern other than delete + insert with `auditUpdate` | See Pattern 1 | SpacetimeDB can't update PK columns; the codebase-wide convention is delete+insert. |
| Monotonic-max locking / races | A locking layer | Trust transactional reducer semantics (Core Concept #1) | Each reducer runs atomically; no explicit lock needed for the max computation. |

**Key insight:** Phase 12.3 adds zero new primitives. Every pattern it needs — helpers, indexes, guards, composite-PK updates, tournament derivation — already exists in the repo. The planner's job is to wire existing primitives together, not to build anything new.

## Runtime State Inventory

This phase does a **schema column add (required, default 0) + DB wipe via `post-publish.ts --clear-database`**. The runtime state inventory is about what EXISTING state carries the old shape across the wipe boundary and whether any external system caches it.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | **SpacetimeDB maincloud database `hsrpvp-spacetimedb-nextjs` (or the project's dev DB).** `MatchResultParticipant` rows written before publish will not have the new column. | **DB wipe via `post-publish.ts --clear-database` (D-F-02).** Planned. No backfill task needed. |
| **Stored data** | `MatchParticipantHistory` (archived rows in the history table) — keyed by userId, no hsrAccountId reference | None — out of scope per CONTEXT.md (not a consumer of `accountRating`). |
| **Stored data** | `MmrHistory` rows (completed matches' ELO deltas) | None — persisted, unchanged. The snapshot only affects future deltas. Historical deltas stay as-is. |
| **Stored data** | `HsrAccount.accountRating` live values | None — still the authoritative live rating, unchanged. |
| **Live service config** | Vercel deployment, Next.js app config, any dashboards | **None touched.** Phase 12.3 is 100% backend module. No Vercel/env change, no deployment side effect. |
| **Live service config** | `spacetime.json` module config | None — no new module, no name change. Same module publishes with new schema. |
| **OS-registered state** | Windows Task Scheduler / pm2 / systemd / launchd tasks | **None — verified by grep for project-local tasks.** Publishing is interactive via `npm run spacetime:publish`; no scheduler registration. |
| **OS-registered state** | Windows Terminal profiles, shortcuts, npm scripts | None — `npm run spacetime:publish` unchanged, no rename. |
| **Secrets/env vars** | `.env.local`, `.env` | **Edited by `post-publish.ts` after `--clear-database` per CLAUDE.md. NEVER delete or commit these.** Planner MUST warn any task that touches env — only the post-publish script may. |
| **Secrets/env vars** | Any `NEXT_PUBLIC_STDB_TOKEN`, auth secrets | None — auth unchanged. |
| **Build artifacts / installed packages** | `src/module_bindings/` (auto-generated from module schema) | **Regenerate after publish** via `npm run spacetime:generate` OR `npm run generate` (the cargo-based variant). The new `accountRatingSnapshot` column MUST appear in the regenerated bindings before any frontend read. |
| **Build artifacts / installed packages** | `spacetimedb/` (module directory — separate npm package) | `npm --prefix spacetimedb install` runs as part of `npm run generate`. Tests that spin up a harness need fresh bindings. |
| **Build artifacts / installed packages** | Vitest cache, TS build info | None — vitest re-runs from source. |

**The canonical question:** *After every file in the repo is updated and the module is republished with `--clear-database`, what runtime systems still have the old schema cached or registered?*

**Answer:** Only `src/module_bindings/` — and `npm run spacetime:generate` regenerates it deterministically from the published module. No other cached state exists that survives the wipe. The planner should schedule generate-bindings as a task step AFTER publish and BEFORE test-run.

## Common Pitfalls

### Pitfall 1: Inserting MRP without the new column after schema change
**What goes wrong:** Any reducer that inserts into `MatchResultParticipant` without passing `accountRatingSnapshot` will either crash (required column) or get TS-narrowed incorrectly.
**Why it happens:** MRP is only inserted at one site (`draftClassic.ts:204`). There's a single insert — but if D-F-01 declares the column required and D-A-01 doesn't add it to the insert in the same commit, the module won't publish.
**How to avoid:** Schema change (D-F) and capture site (D-A) MUST ship in the SAME task/commit. Test for this with a smoke publish before proceeding.
**Warning signs:** `spacetime publish` error "missing required column `accountRatingSnapshot`" or TS error "Property 'accountRatingSnapshot' is missing".

### Pitfall 2: Grepping for MRP insert sites finds only one — don't miss a second path
**What goes wrong:** Future phases or concurrent PRs may add a second MRP insert site that forgets the snapshot.
**Why it happens:** There's currently ONE insert at `draftClassic.ts:204` [VERIFIED via `Grep(pattern="MatchResultParticipant\\.insert")` — planner should re-grep at implementation time to confirm].
**How to avoid:** The capture task should first run a grep to assert only one insert site exists. If a second appears, fail the task and report to the user.
**Warning signs:** New commit on main between research and implementation adding another MRP insert.

### Pitfall 3: D-B-03 monotonic hook fires in tournament path but MRP already deleted
**What goes wrong:** In the tournament-batch path, `process_tournament_mmr` runs AFTER each match's lobby has been hardDeleted — LMA is gone. If a BetweenGames select runs at that point, the hook misfires.
**Why it doesn't actually happen:** `select_match_account` has a stage guard at `accountSelection.ts:34-37` rejecting anything not in `Waiting` or `BetweenGames`. By the time the tournament finishes, every lobby has passed the active stages and been deleted. The stage guard plus the `if (!mrp) return;` short-circuit make this unreachable.
**How to avoid:** Do nothing — the layered short-circuits are sufficient. The D-B-05 comment documents this.
**Warning signs:** A future refactor that removes the stage guard on `select_match_account`.

### Pitfall 4: D-H guard derivation fails for a tournament match with undefined bracketMatchId
**What goes wrong:** The guard path `bracketMatch → tournament.stage` requires `bracketMatchId !== undefined`. If a tournament match has `isTournamentControlled = true` but `bracketMatchId === undefined`, the guard silently permits finalization.
**Why it happens:** Some tournament modes (group phase?) may have `isTournamentControlled = true` without a bracket match row. Need to verify.
**How to avoid:** Planner task for D-H MUST verify: is every tournament-controlled MRP guaranteed to have a `bracketMatchId`? If yes, the guard is complete. If no, the guard needs a fallback for the `bracketMatchId === undefined` branch (reject with "tournament without bracket match — unexpected state" or similar).
**Warning signs:** Any `createLobby` / `create_tournament` path that sets `isTournamentControlled=true` without requiring a bracket match.
**Research verification needed at plan time:** grep `isTournamentControlled: true` and check each call site sets `bracketMatchId`.

### Pitfall 5: D-D helper extraction breaks existing `batch_upsert_characters` ownership validation
**What goes wrong:** Current `batch_upsert_characters` has auth (`ensureVerifiedUser`), ownership check (`account.userId !== user.id`), and content validation (`HsrCharacter.name.find`) BEFORE the mutation block. If the helper is extracted to only cover "validate content + mutate + recompute", and the wrapper skips any of the auth/ownership steps, the helper inherits a weaker contract when called from `migrate_roster`.
**Why it happens:** `migrate_roster` already does its own auth/ownership check at `roster.ts:249-261`, so the helper itself shouldn't re-auth. But the extraction must be careful about where the boundary lies.
**How to avoid:** Helper takes pre-validated inputs: `applyBatchUpsert(ctx, accountId, items, actingUserId)` — it trusts that (a) the account exists and belongs to `actingUserId`, (b) `items` is non-empty. Wrapper does auth/ownership; helper does validate-content-then-mutate-then-recompute.
**Warning signs:** Plan task names the helper params as `(ctx, user, hsrAccountId, ...)` — if `user` is passed, the boundary is blurred. Prefer `actingUserId: number`.

### Pitfall 6: `--clear-database` wipes dev data mid-series of test runs
**What goes wrong:** The user's dev database has existing match history, leaderboard, etc. A `--clear-database` wipe loses all of it.
**Why it happens:** D-F-02 explicitly accepts the wipe ("we can wipe it now because we are on test, this is not a lie"). This is intentional but the planner should surface it clearly to the user before publishing.
**How to avoid:** Plan task for publish MUST include a `before-publish` user checkpoint confirming the wipe is acceptable. No silent wipe.
**Warning signs:** Task description reads "publish module" without mention of `--clear-database`.

### Pitfall 7: Test files require explicit tasks (C10)
**What goes wrong:** An execution task "refactors roster.ts and also adjusts mmr-stats.test.ts assertions" — forbidden by C10.
**Why it happens:** Developers instinctively fix failing tests during refactors. CLAUDE.md says NO.
**How to avoid:** Every test file in CONTEXT.md's "Files Expected to Change" → "New" list MUST have its own explicit task. The mmr-stats.test.ts "extend with D-G race-condition integration tests" also needs its own task, not folded into a code task.
**Warning signs:** A task description mentioning both a source file and a test file in the same change list (other than the obvious "new test for new feature" pairing).

### Pitfall 8: Docs contract updates during execution (C9)
**What goes wrong:** A task "update roster guards + update docs/roster/contract.md" — forbidden by C9.
**Why it happens:** Developers instinctively document-as-they-go. CLAUDE.md says NO — contract.md updates happen POST-execution with `Phase 12.3 execution` tags.
**How to avoid:** Split docs/contract.md updates into a trailing task (or leave to verify-work). `docs/*/architecture.md` CAN be updated during execution (C8); `docs/*/contract.md` CANNOT.
**Warning signs:** Any task that modifies both a reducer and a `contract.md` in the same change set.

### Pitfall 9: D-I refactor order matters vs. tests using `requireOwnership`
**What goes wrong:** Existing `test/backend/match-session/draft-classic.test.ts` or `post-draft.test.ts` may use `requireOwnership=true` with the current `isActive`-based auto-pick. Changing the pool construction could make existing tests flake.
**Why it happens:** The semantic change is deliberate — D-I-04 enumerates four behavioral corrections. Some are strictly more correct (stand-ins contribute LMA chars), but they change observable outputs.
**How to avoid:** D-I task MUST run the existing draft-classic and post-draft tests before and after the refactor. Any test that was passing due to the OLD behavior needs to be flagged to the user (C10 — do not auto-fix).
**Warning signs:** `npm run test:integration` failure in `draft-classic.test.ts` post-D-I. Do NOT edit the test — report the failure, diagnose whether the test encoded the bug or the fix.

## Code Examples

### Example 1: Current buggy read path (finalizationHelpers.ts:85-92)
```typescript
// Source: spacetimedb/src/helpers/finalizationHelpers.ts:85-92
// [VERIFIED — read 2026-04-11]
const blueAccountRatings = blueParticipants.map((p: any) => {
    const activeAccount = [...ctx.db.HsrAccount.user_id.filter(p.userId)].find((a: any) => a.isActive);
    return activeAccount?.accountRating ?? 0;
});
const redAccountRatings = redParticipants.map((p: any) => {
    const activeAccount = [...ctx.db.HsrAccount.user_id.filter(p.userId)].find((a: any) => a.isActive);
    return activeAccount?.accountRating ?? 0;
});
```

### Example 2: Fixed read path (D-readpath-01)
```typescript
// After D-readpath-01: direct read of the pre-computed snapshot
const blueAccountRatings = blueParticipants.map((p: any) => p.accountRatingSnapshot);
const redAccountRatings = redParticipants.map((p: any) => p.accountRatingSnapshot);
```

### Example 3: D-A capture at start_draft (draftClassic.ts:204)
```typescript
// Source: spacetimedb/src/reducers/draftClassic.ts:197-211 (current) — D-A adds snapshot computation before insert
// [VERIFIED — read 2026-04-11]
for (const member of participantMembers) {
    // D-A-01/D-B-01: Capture max rating across selected LMA accounts at match start
    const selectedAccounts = [...ctx.db.LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, member.userId])];
    let accountRatingSnapshot = 0;
    for (const lma of selectedAccounts) {
        const acct = ctx.db.HsrAccount.id.find(lma.hsrAccountId);
        if (acct && acct.accountRating > accountRatingSnapshot) {
            accountRatingSnapshot = acct.accountRating;
        }
    }
    // D-B-02: Zero is the valid default for casual-no-LMA matches (start_draft at :59-73 rejects ranked w/o LMA)
    ctx.db.MatchResultParticipant.insert({
        matchResultId: matchResultRow.id,
        userId: member.userId,
        teamSide: slotToTeamSide(member.lobbySlot),
        isCaptain: member.isCaptain,
        accountRatingSnapshot,  // ← NEW
        ...auditInsert(ctx, user.id),
    } as any);
}
```

### Example 4: D-I auto-pick pool LMA migration (draftClassic.ts:651-668 before/after)

**Before (current, buggy):**
```typescript
// Source: spacetimedb/src/reducers/draftClassic.ts:651-668 [VERIFIED — read 2026-04-11]
if (lobby.requireOwnership && teamMembers.length > 0) {
    const ownedSet = new Set<string>();
    for (const member of teamMembers) {
        const accounts = [...ctx.db.HsrAccount.user_id.filter(member.userId)];
        const activeAccount = accounts.find((a: any) => a.isActive);
        if (activeAccount) {
            const chars = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(activeAccount.id)];
            for (const c of chars) {
                ownedSet.add(c.characterName);
            }
        }
    }
    availablePool = [...ownedSet].filter(
        (name) => !bannedChars.has(name) && !pickedChars.has(name)
    );
}
```

**After (D-I-02, matches pattern at draftClassic.ts:76-96):**
```typescript
if (lobby.requireOwnership && teamMembers.length > 0) {
    const ownedSet = new Set<string>();
    for (const member of teamMembers) {
        // D-12, D-14 (Phase 10.4 / Phase 12.3): union across selected accounts, not HsrAccount.isActive
        const selectedAccounts = [...ctx.db.LobbyMemberAccount.by_lobby_and_user.filter([lobbyId, member.userId])];
        for (const lma of selectedAccounts) {
            const chars = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(lma.hsrAccountId)];
            for (const c of chars) {
                ownedSet.add(c.characterName);
            }
        }
    }
    availablePool = [...ownedSet].filter(
        (name) => !bannedChars.has(name) && !pickedChars.has(name)
    );
}
```

### Example 5: D-G guard mirror of delete_hsr_account (roster.ts:111-115)
```typescript
// Canonical reference: spacetimedb/src/reducers/roster.ts:111-115 [VERIFIED]
// D-24: Block deletion if account is currently selected in an active lobby
const activeLma = [...ctx.db.LobbyMemberAccount.by_account.filter(hsrAccountId)];
if (activeLma.length > 0) {
    throw new SenderError('Cannot delete an account that is selected in an active lobby. Leave the lobby first.');
}
```

**Applied to set_active_hsr_account (D-G-01 site, inserted after auth/target-account validation and before the no-op check):**
```typescript
// Reject when the TARGET account (the one being activated) is bound to a live lobby
const targetBinding = [...ctx.db.LobbyMemberAccount.by_account.filter(hsrAccountId)];
if (targetBinding.length > 0) {
    // Error message: cite first conflicting lobby; discretion on exact identifier
    const lobbyId = targetBinding[0].lobbyId;
    const lobby = ctx.db.Lobby.id.find(lobbyId);
    throw new SenderError(
        `Cannot change active account while it is selected in lobby ${lobby?.joinCode ?? `#${lobbyId}`}. Leave the lobby first.`
    );
}
// ALSO check: the caller's currently-active account is bound somewhere (user trying to swap OUT of a live match)
const allAccounts = [...ctx.db.HsrAccount.user_id.filter(user.id)];
for (const acc of allAccounts) {
    if (!acc.isActive) continue;
    const activeBinding = [...ctx.db.LobbyMemberAccount.by_account.filter(acc.id)];
    if (activeBinding.length > 0) {
        const lobbyId = activeBinding[0].lobbyId;
        const lobby = ctx.db.Lobby.id.find(lobbyId);
        throw new SenderError(
            `Cannot change active account while your current active account is in lobby ${lobby?.joinCode ?? `#${lobbyId}`}. Leave the lobby first.`
        );
    }
}
```

**Note:** The exact guard predicate for `set_active_hsr_account` is a planner judgment call. Two interpretations exist:
- **Narrow:** Block only when the TARGET account (the one being activated) is currently bound to a lobby.
- **Wide:** Block whenever ANY of the caller's accounts (including the currently-active one) is bound to a lobby.
The wide interpretation matches the user's UX intent ("I thought I swapped accounts for my active match" — D-G-03 rationale). The example above implements both checks. Planner should ask at plan-check if wide is confirmed.

### Example 6: D-H guard insertion point (matchFinalization.ts:28-30)
```typescript
// Source: spacetimedb/src/reducers/matchFinalization.ts:22-30 [VERIFIED]
// Insert the guard between "2. Find and validate MatchResultRecord" and "3. Authority check"
if (matchResult.status.tag !== 'Validated') {
    throw new SenderError('Match result must be Validated before finalization.');
}

// ── D-H-01 INSERT HERE ────────────────────────────────────────────────
if (matchResult.isTournamentControlled && matchResult.bracketMatchId !== undefined) {
    const bracketMatch = ctx.db.BracketMatch.id.find(matchResult.bracketMatchId);
    const derivedTournamentId = bracketMatch?.tournamentId;
    if (derivedTournamentId !== undefined) {
        const tournament = ctx.db.Tournament.id.find(derivedTournamentId);
        if (tournament && tournament.stage.tag !== 'Completed' && tournament.stage.tag !== 'Cancelled') {
            throw new SenderError(
                'Tournament match cannot be finalized while the tournament is still active. ' +
                'Wait for the tournament to reach Completed or Cancelled — this preserves MMR batch processing and bracket rollback capability.'
            );
        }
    }
}
// ── END D-H-01 ────────────────────────────────────────────────────────

// 3. Authority check (Mod+, referee, tournament access)
let hasAuthority = false;
// ...existing code
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Read `HsrAccount.isActive` live at MMR time (Phase 6, commit `1c91abb`) | Freeze `accountRating` on MRP at `start_draft` | Phase 12.3 (this phase) | Eliminates race vectors D-E-01 (1), (2), (3). |
| `migrate_roster` silently leaves stale `accountRating` | `migrate_roster` delegates to `applyBatchUpsert` / `applyBatchRemove` which call `updateAccountRating` | Phase 12.3 D-D | Closes latent bug. |
| `timer_expiry_classic` auto-pick reads `isActive` (Phase 10.4 migration gap) | Reads LMA via `by_lobby_and_user` | Phase 12.3 D-I | Four behavioral corrections; eliminates JS linear scan. |
| `finalize_match_result` permits tournament matches before tournament ends | Stage-gated rejection | Phase 12.3 D-H | Protects MMR batch + bracket rollback capability. |
| `HsrAccount.isActive` is a global flag referenced everywhere | Still global, still functional for auto-LMA seed / tournament registration presence / delete invariant / view exposure | No change | 12.3 removes only the MMR and auto-pick consumer; four consumers remain. |

**Deprecated/outdated:**
- **Nothing in Phase 12.3 deprecates existing APIs.** The `HsrAccount.isActive` reads that remain (four sites, enumerated in CONTEXT Deferred section) are intentional.
- **NOT a breaking change for clients:** `MatchResultParticipant` is public, so the new column ships to subscribers. Clients that don't read it are unaffected; clients that read it get the new column with default `0` for pre-phase rows (but DB wipe means there are no pre-phase rows).
- **Prior debug recommendation (`it.skip FUTURE Phase 11`) never landed** [VERIFIED: grep across `test/` for "FUTURE Phase 11" returns zero matches]. The debug doc said "optional, prevents silent re-intro" — the skip stub was never added. Phase 12.3 adds real tests instead.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | D-G guard on `set_active_hsr_account` should be "wide" (block if ANY of caller's accounts is in a lobby) rather than "narrow" (block only if target is in a lobby) | Pattern 3, Example 5 | If narrow, users can swap active into a fresh account mid-match. UX only, not correctness (snapshot already captured). Planner should confirm at plan-check. |
| A2 | D-G guard on `batch_upsert_characters` / `batch_remove_characters` uses `by_account.filter(hsrAccountId)` (narrow) rather than "any of caller's accounts" (wide) | Pattern 3 | Wide version requires a new `by_user` index on LMA — scope expansion. Narrow matches the actual mutation target. Planner should confirm. |
| A3 | `batch_upsert_characters` helper boundary takes pre-validated `(ctx, accountId, items, actingUserId)` — auth lives in the wrapper | Pitfall 5 | Other boundary splits would change the helper contract. Documented as a risk, not a requirement. |
| A4 | Every tournament-controlled MRP has a defined `bracketMatchId` (used by D-H guard) | Pitfall 4 | Unverified here — requires grep of `isTournamentControlled: true` call sites at plan time. If assumption holds, guard is complete; if not, guard needs a fallback branch. |
| A5 | `NEXT_PUBLIC_*` env vars and Vercel config are unaffected | Runtime State Inventory | Zero code touches app/ or components/. Assumption is safe but worth explicit confirmation. |
| A6 | Published `MatchResultParticipant` column add works cleanly on maincloud with `--clear-database` | D-F-02 | Existing `post-publish.ts` workflow handles this; same path used by Phase 10.1 and Phase 12. No new wrinkle. |
| A7 | vitest integration test harness correctly mounts the new column after `npm run spacetime:generate` regenerates bindings | Runtime State Inventory | Test harness consumes generated bindings; regeneration is deterministic. |
| A8 | Phase requirement IDs `MMR-RACE-01`, `MMR-RACE-02`, `ROST-GUARD-01` are authoritative despite not being in `REQUIREMENTS.md` body | Phase Requirements section | ROADMAP.md Phase 12.3 header declares them. REQUIREMENTS.md backfill is either a Phase 12.3 task OR deferred to verify-work. Planner should decide. |

**Confirmation needed from user during plan-check:** A1 (narrow vs. wide `set_active_hsr_account` guard), A2 (narrow vs. wide batch-reducer guards), A4 (tournament-without-bracketMatch edge case), A8 (REQUIREMENTS.md backfill scheduling).

## Open Questions (RESOLVED)

> All five questions are resolved during plan-check (2026-04-11). Resolutions below are implemented
> in the Phase 12.3 plan set. Each `RESOLVED:` line records the chosen answer and the plan task
> that carries it.

1. **Is the D-G guard on `set_active_hsr_account` narrow (target account only) or wide (any of caller's accounts)?**
   - What we know: CONTEXT D-G-02 says "each guard rejects when the caller has any active `LobbyMemberAccount` binding". For `set_active_hsr_account` specifically, this implies wide.
   - What's unclear: The narrow interpretation is strictly easier to implement and matches the predicate form of `delete_hsr_account`. CONTEXT's wording leans wide but doesn't lock it.
   - **RESOLVED:** Implement WIDE — reject if caller has ANY active LMA binding. Carried by Plan 05 Task 3 Step 2 (marked "D-G-01 (Phase 12.3, WIDE per research A1)"). Matches the user-visible UX intent of D-G-03 ("clear error: can't do this while in a match").

2. **Can a tournament match legitimately have `isTournamentControlled = true` and `bracketMatchId === undefined`?**
   - What we know: Existing code at `matchFinalization.ts:39-50` already checks `bracketMatchId !== undefined` before deriving tournamentId, implying the inverse is possible at least in theory.
   - What's unclear: Whether it happens in practice. Need a grep at plan time.
   - **RESOLVED:** Treat the coincidence as a defensive rejection case. Carried by Plan 04 Task 1 which includes a pre-implementation grep (Step 1) AND a defensive rejection branch (Step 2) so `isTournamentControlled = true && bracketMatchId === undefined` raises the same error as an ordering violation. Pitfall 4 protected unconditionally.

3. **Should the defensive concede fallback at `finalizationHelpers.ts:262-270` be hardened with a live LMA read?**
   - What we know: CONTEXT marks this as Claude's discretion. The fallback is unreachable via user-facing reducers (concede-before-draft-start is stage-gated).
   - What's unclear: Whether an admin-only path (bulk match DQ? tournament cancel?) can hit it.
   - **RESOLVED:** SKIP the hardening. Carried by Plan 02 Task 1 explicit action note ("Do NOT harden concede-fallback — SKIP this per research Q3"). D-B-02 default-0 gives the same well-defined zero-bonus behavior as the current `?? 0`.

4. **Where do the `applyBatchUpsert` / `applyBatchRemove` helpers live?**
   - What we know: CONTEXT marks this as Claude's discretion. Two options: new `spacetimedb/src/helpers/rosterMutations.ts` OR additions to existing `spacetimedb/src/helpers/rosterHelpers.ts`.
   - What's unclear: Existing `rosterHelpers.ts` is small (54 lines — just UID validation + region derivation + duplicate recalc) [VERIFIED]. Adding batch mutation helpers to it would dilute its purpose.
   - **RESOLVED:** New file `spacetimedb/src/helpers/rosterMutations.ts`. Carried by Plan 05 Task 1 which creates the new file. Keeps `rosterHelpers.ts` focused on UID/region/duplicate logic.

5. **How should REQUIREMENTS.md be updated with the Phase 12.3 requirement IDs?**
   - What we know: `MMR-RACE-01`, `MMR-RACE-02`, `ROST-GUARD-01` appear in ROADMAP.md Phase 12.3 header but NOT in REQUIREMENTS.md v0.5 list or traceability table.
   - What's unclear: Whether v0.5 REQUIREMENTS.md is frozen or allows phase-12.3-era additions.
   - **RESOLVED:** Backfill as a dedicated task in Wave 4. Carried by Plan 08 Task 3 Part B — appends the "MMR Race-Condition Fixes" subsection with all three IDs and updates the traceability table + footer coverage counts.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Module build, test runner | Assumed ✓ (per `package.json engines: >=24.0.0`) | Not verified in this session | None — required |
| `spacetimedb` npm package | Server module API + client bindings | ✓ | `^2.1.0` (package.json:46) | None — required |
| `spacetime` CLI | Publish + generate bindings | Assumed ✓ (prior phases published successfully — latest commit `1bd976f` is post-publish) | Not verified in this session | `npm run generate` (cargo-based variant) is the documented fallback |
| vitest | Test runner | ✓ | `^4.1.0` (package.json:54) | None — required |
| cargo (for `gen-bindings`) | `npm run generate` fallback | Unknown | — | `spacetime generate` (primary) |
| maincloud SpacetimeDB server | Target for publish | ✓ (per CLAUDE.md Deployment section) | — | None |

**Missing dependencies with no fallback:** None detected.

**Missing dependencies with fallback:** `cargo` toolchain — only needed if `spacetime generate` fails. Primary path is `spacetime generate`.

**Blocking:** None. All dependencies are either confirmed or are the normal project toolchain that has been working for prior phases.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest `^4.1.0` [VERIFIED: package.json:54] |
| Config files | `test/vitest.config.ts` (unit), `test/vitest.integration.config.ts` (integration) [VERIFIED: package.json:18-23 scripts] |
| Quick run command (unit only) | `npm run test` |
| Full suite command | `npm run test:all` (unit + integration) |
| Phase-scoped run | `npm run test:phase <directory>` (wraps `vitest run --config integration --dir`) |
| Typecheck gate | `npm run test:typecheck` (`tsc --noEmit`) |
| Shared harness | `test/shared/connection.ts` (createVerifiedTestHarness, hasServerToken, expectReducerError, queryPrivateTable, TestHarness type) [VERIFIED: used by `test/backend/match-results/mmr-stats.test.ts:21-28`] |
| Shared helpers | `test/shared/helpers/` (drafts.ts, hsrAccounts.ts, lobbies.ts, promoteUser.ts, queries.ts, scores.ts, seed.ts, tournaments.ts, users.ts) [VERIFIED: directory listed] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| **MMR-RACE-01** | Snapshot captured at start_draft; non-zero for user with LMA; zero for casual-no-LMA | unit/integration | `npm run test:phase test/backend/match-results` (scoped) | ❌ Wave 0: new `test/backend/match-results/mmr-snapshot.unit.test.ts` |
| **MMR-RACE-01** | Post-capture `set_active_hsr_account` does NOT affect the MRP snapshot | integration | `npm run test:phase test/backend/match-results` | ❌ Wave 0: new — covers race vector D-E-01(1) |
| **MMR-RACE-01** | Post-capture `batch_upsert_characters` (rating recompute) does NOT affect MRP snapshot | integration | `npm run test:phase test/backend/match-results` | ❌ Wave 0: new — covers race vector D-E-01(2) |
| **MMR-RACE-01** | best-of-N: swap HIGH→LOW between games; snapshot stays at HIGH (max rule, monotonic) | integration | `npm run test:phase test/backend/match-results` | ❌ Wave 0: new `test/backend/match-results/mmr-snapshot-betweengames.test.ts` |
| **MMR-RACE-01** | best-of-N: swap LOW→HIGH between games; snapshot updates to HIGH | integration | `npm run test:phase test/backend/match-results` | ❌ Wave 0: same new file as above |
| **MMR-RACE-02** | processMatchMmr path-independent: same MRP row → same ELO delta in both standalone-ranked and tournament-batch paths | integration | `npm run test:phase test/backend/match-results` or `tournaments` | ❌ Wave 0: extension of existing `test/backend/tournaments/tournament-mmr.test.ts` OR new file |
| **MMR-RACE-02** | `process_tournament_mmr` at `isActive`-post-rotation: ELO delta uses the frozen snapshot, NOT the current isActive rating | integration | `npm run test:phase test/backend/tournaments` | ❌ Wave 0: extension of `tournament-mmr.test.ts` |
| **ROST-GUARD-01** | `set_active_hsr_account` rejects with clear error naming the lobby while caller has active LMA | integration | `npm run test:phase test/backend/roster` or `match-results` | ❌ Wave 0: extension of `test/backend/match-results/mmr-stats.test.ts` (per CONTEXT "Files Expected to Change" → Modified) |
| **ROST-GUARD-01** | `batch_upsert_characters` rejects while target account in lobby | integration | same | ❌ Wave 0: same as above |
| **ROST-GUARD-01** | `batch_remove_characters` rejects while target account in lobby | integration | same | ❌ Wave 0: same as above |
| **ROST-GUARD-01** | `migrate_roster` rejects while EITHER side of migration is in lobby | integration | same | ❌ Wave 0: same as above |
| **ROST-MIGRATE-01** | `migrate_roster` (copy mode) recomputes target account rating | integration | `npm run test:phase test/backend/roster` | ❌ Wave 0: new `test/backend/roster/migrate-roster-rating.test.ts` |
| **ROST-MIGRATE-01** | `migrate_roster` (move mode) recomputes both source and target | integration | same | ❌ Wave 0: same file |
| **TOURN-ORDER-01** | `finalize_match_result` on MMR-tournament match rejects mid-tournament; accepts after Completed | integration | `npm run test:phase test/backend/tournaments` | ❌ Wave 0: new `test/backend/tournaments/tournament-ordering-guard.test.ts` |
| **TOURN-ORDER-01** | Same for casual-tournament (countTowardsMmr=false) — rejects unconditionally | integration | same | ❌ Wave 0: same file |
| **TOURN-ORDER-01** | Non-tournament match finalization unaffected | integration | same | ❌ Wave 0: same file — sanity regression |
| **OWN-POOL-01** | Auto-pick pool reflects LMA, not isActive (non-tournament: isActive=A, LMA=B → pool has B's chars) | integration | `npm run test:phase test/backend/match-session` | ❌ Wave 0: new `test/backend/match-session/auto-pick-ownership-pool.test.ts` |
| **OWN-POOL-01** | Auto-pick pool is union across multi-account tournament users | integration | same | ❌ Wave 0: same file |
| **OWN-POOL-01** | Stand-ins contribute their LMA chars (not global isActive) | integration | same | ❌ Wave 0: same file |
| **OWN-POOL-01** | Casual `requireOwnership=true` with one member missing LMA → that member contributes empty set; auto-pick still succeeds with remaining members' pool | integration | same | ❌ Wave 0: same file |
| **MMR-SNAPSHOT-04** | `calculateAccountModifier` no-op when both teams' snapshot is 0 | unit | `npm run test` (unit-only) | ⚠️ Partial: existing `test/backend/match-results/elo-calculation.unit.test.ts` may cover the pure-math case but NOT the default-0 integration. Planner should verify whether to extend or add new. |

### Sampling Rate
- **Per task commit:** `npm run test:typecheck && npm run test:phase <relevant-dir>` — typecheck gates publish; per-directory run is <30s.
- **Per wave merge:** `npm run test:all` (unit + integration).
- **Phase gate:** `npm run test:all` green + manual `/gsd-verify-work` walkthrough with `spacetime sql` snapshots per CLAUDE.md UAT format.

### Wave 0 Gaps

Gaps are new test files or extensions to existing files. Per CLAUDE.md C10, each is its OWN task. None of these auto-fix test failures — they add new coverage for new requirements.

- [ ] `test/backend/match-results/mmr-snapshot.unit.test.ts` — covers MMR-RACE-01 capture, default-0, max aggregation (new file)
- [ ] `test/backend/match-results/mmr-snapshot-betweengames.test.ts` — covers MMR-RACE-01 monotonic upward across best-of-N (new file)
- [ ] `test/backend/roster/migrate-roster-rating.test.ts` — covers ROST-MIGRATE-01 regression for pre-existing stale-rating bug (new file)
- [ ] `test/backend/tournaments/tournament-ordering-guard.test.ts` — covers TOURN-ORDER-01 guard behavior (new file)
- [ ] `test/backend/match-session/auto-pick-ownership-pool.test.ts` — covers OWN-POOL-01 D-I four behavioral corrections (new file; per CONTEXT "Files Expected to Change" list names `test/backend/draft/auto-pick-ownership-pool.test.ts` but the actual test dir is `match-session/` — planner should confirm preferred location at plan-check. The `draft/` directory does not exist under `test/backend/`.)
- [ ] Extension of `test/backend/match-results/mmr-stats.test.ts` — four D-G race-condition integration tests (explicit task per C10, separate from the code changes)
- [ ] Extension of `test/backend/tournaments/tournament-mmr.test.ts` — MMR-RACE-02 tournament-batch read-path verification

**Framework installation:** None needed — vitest already installed and configured.

**Harness pattern reference:** `test/backend/match-results/mmr-stats.test.ts` lines 21-80 [VERIFIED] shows the idiomatic pattern: `createVerifiedTestHarness` for three users (host/blue/red), `ensureHsrAccount`, `defaultLobbyArgs`, standard join-confirm-start-draft flow. All new tests should follow this pattern.

## Security Domain

*(Security domain is REQUIRED if `security_enforcement` is enabled. `.planning/config.json` does not explicitly set `security_enforcement` — treating as enabled per the research agent's default rule.)*

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Existing `getAuthenticatedUser(ctx)` / `ensureVerifiedUser(ctx)` on every reducer — no changes |
| V3 Session Management | no (reducer-layer only; sessions handled at higher auth layer) | — |
| V4 Access Control | yes | `ensureTournamentAccess` + authority check in `finalize_match_result` [VERIFIED at `matchFinalization.ts:30-53`] — unchanged. D-H adds a stage gate BEFORE authority check; this is defense-in-depth layering and does not weaken V4. |
| V5 Input Validation | yes | `batch_upsert_characters` / `batch_remove_characters` validate against `HsrCharacter.name` [VERIFIED at `roster.ts:175-182`]. Helper extraction (D-D) preserves this. |
| V6 Cryptography | no | No crypto in this phase |
| V7 Error Handling & Logging | yes | All guards throw `SenderError` — user-visible, no stack trace leakage |
| V9 Communication | no | SpacetimeDB SDK handles transport |
| V10 Malicious Code | no | — |
| V12 Files & Resources | no | — |
| V13 API & Web Service | yes | All affected reducers are SpacetimeDB API — reducer permissions unchanged |

### Known Threat Patterns for spacetimedb-ts-module + ELO stack

| Pattern | STRIDE | Standard Mitigation | Applies to 12.3? |
|---------|--------|---------------------|------------------|
| Race-condition rating manipulation (swap isActive between select and finalize) | Tampering | Snapshot at `start_draft` — D-A | **YES — this is the core threat the phase closes** |
| Stale rating via mid-match roster mutation | Tampering | Snapshot + D-G guard | YES — closed by D-B + D-G |
| Unauthorized tournament match finalization | Elevation of Privilege | Existing authority check (unchanged) + D-H tournament stage gate | YES — D-H defense in depth |
| Silent MMR loss via admin mid-tournament finalize | Tampering (data integrity) | D-H guard rejection | YES — D-H direct fix |
| `SenderError` stack trace info disclosure | Info Disclosure | SpacetimeDB wraps to client-safe error message (verified across codebase) | No new risk |
| Ownership check bypass via auto-pick pool using wrong account | Tampering | D-I LMA migration matches manual-pick path | YES — D-I closes drift |
| Monotonic-max side-channel (leak of opponent's second account rating via snapshot) | Info Disclosure | Snapshot column is public but only exposes the max of caller's own accounts | No — per-row scoped to caller's participation |

**Threat model note:** All threats this phase addresses are **data integrity** (Tampering in STRIDE). No new authentication or authorization surface. No new crypto. No new network endpoints. No new file handling. The attack surface is strictly "authenticated user invokes a reducer in an unintended sequence" — the fix is stateful invariants (snapshot + guards), not new auth layers.

## Sources

### Primary (HIGH confidence)
- **CONTEXT.md** (297 lines) — locked decisions D-A through D-I, requirement IDs, files expected to change [VERIFIED: direct file read]
- **DISCUSSION-LOG.md** (371 lines) — audit trail with verification evidence for each decision [VERIFIED: direct file read]
- **Debug investigation** `.planning/debug/phase-5-mmr-account-rating-source.md` — original diagnosis with evidence E1-E13 [VERIFIED: direct file read]
- **ROADMAP.md Phase 12.3 section** (lines 426-444) — scope matrix, requirement IDs, context link [VERIFIED]
- **`package.json`** — vitest 4.1.0, spacetimedb 2.1.0, Node 24+, test scripts [VERIFIED]
- **`.planning/config.json`** — workflow.nyquist_validation=true [VERIFIED]
- **`.claude/skills/spacetimedb/SKILL.md`** — module/reducer/table patterns, version pin [VERIFIED first 80 lines]

### Verified source files (direct reads during research)
- `spacetimedb/src/helpers/finalizationHelpers.ts` lines 1-310, 480-600 — buggy read lines 85-92, processMatchMmr full body, runFinalization steps 11/18/19, concede fallback 262-270
- `spacetimedb/src/reducers/draftClassic.ts` lines 1-240, 580-745 — start_draft full body, timer_expiry_classic auto-pick pool at 651-688
- `spacetimedb/src/reducers/roster.ts` lines 1-293 — all four D-G targets, existing delete_hsr_account guard pattern at 111-115
- `spacetimedb/src/reducers/accountSelection.ts` full body (1-128) — select_match_account hook target, stage guard at 34-37, replace vs. additive patterns at 80/86
- `spacetimedb/src/reducers/matchFinalization.ts` full body (1-136) — finalize_match_result guard insertion point, process_tournament_mmr full body
- `spacetimedb/src/tables/matchResultParticipant.ts` full body (1-25) — MRP columns, indexes, composite PK
- `spacetimedb/src/tables/lobbyMemberAccount.ts` full body (1-26) — LMA columns, three indexes (lobby_id, by_lobby_and_user, by_account)
- `spacetimedb/src/helpers/accountRating.ts` lines 140-160 — updateAccountRating function
- `spacetimedb/src/helpers/ownershipValidation.ts` full body (1-37) — canonical LMA-based ownership pattern
- `spacetimedb/src/helpers/auditColumns.ts` full body (1-28) — auditInsert / auditUpdate helpers
- `spacetimedb/src/helpers/rosterHelpers.ts` full body (1-55) — 54 lines, UID/region/duplicate logic (candidate for D-D helper extraction placement)
- `spacetimedb/src/helpers/eloCalculation.ts` full body (1-64) — calculateAccountModifier formula
- `spacetimedb/src/reducers/lobbyLifecycle.ts` lines 315-365 — existing `isActive` read for auto-LMA seed (remains after 12.3)
- `spacetimedb/src/reducers/concede.ts` lines 80-140 — concede stage guards (D-C dropped rationale)
- `test/backend/match-results/mmr-stats.test.ts` lines 1-80 — harness pattern for new tests

### Secondary (MEDIUM confidence)
- Existing test directories verified via `Glob`: `test/backend/match-results/`, `roster/`, `tournaments/`, `match-session/` (no `draft/` subdir exists — planner should confirm the CONTEXT file-path typo)

### Tertiary (LOW confidence)
- **None.** All claims in this research are backed by direct file reads. No WebSearch, no Context7 lookup, no training-data assertion for any load-bearing claim.

## Metadata

**Confidence breakdown:**
- **Standard stack: HIGH** — all versions pinned from `package.json`; no new dependencies
- **Architecture patterns: HIGH** — every pattern is an existing codebase pattern with line-number citations
- **Runtime state inventory: HIGH** — direct file verification of LMA indexes, test harness, env workflow
- **Common pitfalls: HIGH** — derived from CONTEXT.md decisions and verified against source files
- **Validation architecture: HIGH** — vitest + shared test harness verified in `package.json` and an actual test file read
- **Security domain: MEDIUM** — STRIDE mapping derives from decision semantics; not a formal threat model review
- **Open questions: HIGH** — each is a specific decision point with a recommended answer and fallback

**Research date:** 2026-04-11
**Valid until:** 2026-04-18 (7 days — schema-change phases degrade fast if concurrent PRs land on the same files; planner should re-verify line numbers at plan time)

**Cross-references for the planner:**
- `.planning/phases/12.3-mmr-rating-snapshot/CONTEXT.md` — locked decisions
- `.planning/phases/12.3-mmr-rating-snapshot/DISCUSSION-LOG.md` — decision rationale
- `.planning/debug/phase-5-mmr-account-rating-source.md` — original bug diagnosis
- `.claude/skills/spacetimedb/SKILL.md` — project-specific SpacetimeDB patterns (load before writing any reducer)
- `.claude/skills/uat/` — behavior spec + test integrity rules (C10 enforcement)
- `./CLAUDE.md` — Git Rules, Mandatory Skills, SpacetimeDB Core Rules, UAT format
