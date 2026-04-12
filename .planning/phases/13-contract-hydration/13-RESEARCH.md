# Phase 13: Documentation Normalization (RERUN) - Research

**Researched:** 2026-04-12
**Domain:** Documentation standardization, codebase documentation generation, ERD maintenance, test header maintenance
**Confidence:** HIGH

## Summary

This is a RERUN of Phase 13. The original Phase 13 (completed 2026-04-09) normalized 19 architecture files, 18 contract files, 7 codebase docs, FRONTEND-HANDOFF, and ERD. Since then, Phase 12.3 (MMR Rating Snapshot, completed 2026-04-11) modified 13 backend source files and added significant new functionality -- but only partially updated docs. Phase 14 (Test Harness Modernization) also completed, adding test infrastructure changes. The 3 verification gaps from the original run were already fixed by commit `665c671`, but Phase 12.3 introduced NEW staleness across the documentation surface.

The rerun scope breaks into 5 categories: (1) Architecture docs -- 3 files have Phase 12.3 content in their body but mismatched header/footer timestamps; 16 other architecture files are current. (2) Contract docs -- 3 contracts (roster, match-results, tournament) need Phase 12.3 additions (D-G guards, snapshot pattern, ordering guard). (3) Codebase docs -- all 7 files are dated 2026-04-09 and miss Phase 12.3 changes (rosterMutations.ts helper, 5 new test files, accountRatingSnapshot column, Tournament.requireOwnership). (4) FRONTEND-HANDOFF -- says 83 requirements/20 phases/~155 reducers/58 test files; actual is 86 mapped/25 phases/~156 reducers/63 test files. (5) ROADMAP -- Phase list at top missing 5 entries (12.1, 12.2, 12.3, 13, 14); Phase 10.5 progress row says 1/1 (should be 5/5). (6) ERD -- missing 2 new columns (accountRatingSnapshot, requireOwnership). (7) Test headers -- mmr-stats.test.ts has 242 new lines from Phase 12.3 not reflected in its header comment.

**Primary recommendation:** Execute a targeted update pass on the specific stale items rather than a full rewrite. The bulk of Phase 13's work is still valid. Focus on: syncing docs to Phase 12.3/14 changes, fixing ROADMAP gaps, updating FRONTEND-HANDOFF stats, and refreshing codebase docs with the 5 new test files + new helper.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Header format: `# Feature Name -- Architecture` (em dash separator, explicit doc type)
- **D-02:** Include `Last updated: YYYY-MM-DD` timestamp line immediately after the h1
- **D-03:** Standard section order: Overview -> Table Relationships -> Reducer Flows -> Phase History
- **D-04:** Table diagrams use tree notation exclusively (parentTable -> childTable with `+--`, `|--` connectors), annotate `[PRIVATE]` and decision refs inline
- **D-05:** Roster architecture.md is the reference example for all 19 files
- **D-06:** Standard section order: Architecture link -> Feature Overview -> Reducers -> Acceptance Scenarios -> Edge Cases -> Integration Points -> Phase History
- **D-07:** Every contract starts with `**Architecture:** [architecture.md](architecture.md)` link
- **D-08:** Reducer documentation uses full format: Purpose / Permission / Parameters (table) / Flow (numbered steps) / Expected State Changes / Error Cases (table)
- **D-09:** Full hydration -- read every reducer from the actual codebase and document completely, not just structure placeholders
- **D-10:** 18 contracts to normalize (all existing). Skip cost-tables contract creation (admin/game-data, low priority)
- **D-11:** Roster contract.md is the reference example for all 18 files
- **D-12:** Full regeneration of all 7 .planning/codebase/ files from scratch (not incremental update)
- **D-13:** Files to regenerate: ARCHITECTURE.md, CONCERNS.md, CONVENTIONS.md, INTEGRATIONS.md, STACK.md, STRUCTURE.md, TESTING.md
- **D-14:** Rewrite FRONTEND-HANDOFF.md from scratch (not incremental update), generated after all other docs are normalized
- **D-15:** Update notes/erd-mermaid.md with all production tables (~67), showing PKs, FKs, and cardinality annotations (one-to-one, one-to-many, one-to-one-optional, many-to-many)
- **D-16:** Example notation: `User (one) to UserPrivate (one-optional)`
- **D-17:** Update Phase 13 scope description in ROADMAP.md to reflect new goals
- **D-18:** Minor cleanup pass on completed phase descriptions (status markers, plan counts) -- no scope changes to future phases
- **D-19:** Templates-first-then-bulk approach: Plan 1 (templates+ROADMAP), Plan 2 (19 architectures), Plan 3 (18 contracts), Plan 4 (7 codebase docs), Plan 5 (handoff+ERD)

### Claude's Discretion
- Exact template file format and location
- How to batch architecture/contract files across plans (alphabetical, by complexity, by feature area)
- Level of detail in .planning/codebase/ regeneration
- FRONTEND-HANDOFF.md internal structure and section organization

### Deferred Ideas (OUT OF SCOPE)
- cost-tables contract.md creation -- admin/game-data feature, low priority, user explicitly chose to skip
- docs/ERD.excalidraw update -- visual ERD exists but was not scoped for this phase (mermaid ERD was chosen instead)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| All backend phases complete | All v0.5 backend requirements (86 mapped + 3 OOS) are complete per REQUIREMENTS.md traceability table | Verified -- REQUIREMENTS.md shows 89 total, 86 mapped, 3 Out of Scope; all Complete [VERIFIED: codebase] |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Relevant CLAUDE.md directives for this docs-only phase:

1. **Architecture docs cross-reference contracts via links. No duplication between them.** -- Architecture files document structure/flows, contracts document behavior/acceptance. Phase 13 must maintain this separation.
2. **Architecture docs: Update every time backend code changes** -- Phase 12.3 changed 13 source files; 3 architecture docs were updated but the rest of the doc surface was not.
3. **Contracts: Use the template from `.claude/skills/uat/references/workflow-doc-template.md`** -- The contract template is already established in `docs/_templates/contract-template.md`.
4. **Contracts: Update after every phase discussion with new workflow decisions** -- Phase 12.3 added ROST-GUARD-01, MMR-RACE-01/02 decisions not yet in contracts.
5. **Never modify behavior specs during execution; update after with Phase X execution provenance tags** -- Tag new entries with `Phase 13 normalization (rerun)` or `Phase 12.3 execution` as appropriate.
6. **Make the smallest change necessary; do NOT touch unrelated files** -- Rerun scope: only update what changed since original Phase 13 (2026-04-09).

## Delta Analysis: What Changed Since Original Phase 13 (2026-04-09)

### Phase 12.3: MMR Rating Snapshot (completed 2026-04-11)

**Backend source files changed (13 files):** [VERIFIED: git diff]

| File | Change Type | Impact on Docs |
|------|------------|----------------|
| `spacetimedb/src/tables/matchResultParticipant.ts` | Added `accountRatingSnapshot: f64` column | ERD, match-results architecture |
| `spacetimedb/src/tables/tournament.ts` | Added `requireOwnership: boolean` column | ERD, tournament architecture |
| `spacetimedb/src/helpers/rosterMutations.ts` | NEW file (105 lines) | roster architecture, codebase STRUCTURE/ARCHITECTURE |
| `spacetimedb/src/helpers/finalizationHelpers.ts` | Changed processMatchMmr to read snapshot | match-results architecture (already updated) |
| `spacetimedb/src/helpers/tournamentHelpers.ts` | D-H ordering guard helpers | tournament architecture (already updated) |
| `spacetimedb/src/reducers/roster.ts` | D-G lobby guards on batch_upsert/remove/set_active | roster contract (MISSING) |
| `spacetimedb/src/reducers/accountSelection.ts` | Monotonic snapshot hook | match-results contract (MISSING) |
| `spacetimedb/src/reducers/matchFinalization.ts` | D-H ordering guard | tournament/match-results contract (MISSING) |
| `spacetimedb/src/reducers/draftClassic.ts` | Auto-pick pool migration to LMA | match-session architecture (MISSING) |
| `spacetimedb/src/reducers/server.ts` | start_draft snapshot capture | match-results architecture (already updated) |
| `spacetimedb/src/reducers/tournamentLobby.ts` | Minor tournament wiring | tournament architecture (already updated) |
| `spacetimedb/src/reducers/tournamentManagement.ts` | requireOwnership column | tournament architecture (already updated) |
| `spacetimedb/src/index.ts` | rosterMutations export | codebase STRUCTURE |

**New test files (5):** [VERIFIED: git diff --diff-filter=A]

| File | Coverage |
|------|----------|
| `test/backend/match-results/mmr-snapshot.test.ts` | MMR-RACE-01 capture |
| `test/backend/match-results/mmr-snapshot-betweengames.test.ts` | MMR-RACE-01 hook |
| `test/backend/match-session/auto-pick-ownership-pool.test.ts` | D-I-04 |
| `test/backend/roster/migrate-roster-rating.test.ts` | D-D-04, D-G |
| `test/backend/tournaments/tournament-ordering-guard.test.ts` | D-H-01, MMR-RACE-02 |

**New REQUIREMENTS.md entries (3):** [VERIFIED: codebase]
- MMR-RACE-01, MMR-RACE-02, ROST-GUARD-01

### Phase 14: Test Harness Modernization (completed after Phase 13)

**Changes:** confirmed reads fix, onApplied subscription readiness, helper dedup. No backend source changes. Affects: codebase TESTING.md, test file count (new `test/global-setup.ts`).

### Verification gap fixes (commit 665c671)

**Already fixed:**
- calendar/contract.md Architecture link added
- archetypes/contract.md Edge Cases + Integration Points sections added

## Architecture Patterns

### Current Architecture Doc State

**19 architecture files exist.** [VERIFIED: filesystem]

| File | Header Timestamp | Footer Timestamp | Phase 12.3 Content | Status |
|------|-----------------|------------------|---------------------|--------|
| match-results | 2026-04-09 | 2026-04-11 | Has snapshot + ordering guard | TIMESTAMP MISMATCH |
| roster | 2026-04-09 | 2026-04-11 | Has rosterMutations + D-G guards | TIMESTAMP MISMATCH |
| tournament | 2026-04-09 | 2026-04-11 | Has D-H guard + requireOwnership | TIMESTAMP MISMATCH |
| Other 16 files | 2026-04-09 | 2026-04-09 | None needed | OK |

**Action:** Fix header timestamp on 3 files to match footer (2026-04-12 for the rerun date).

### Current Contract Doc State

**18 contract files exist.** [VERIFIED: filesystem]

All 18 have the Architecture link (D-07 verified). All 18 have required sections (D-06 verified -- including archetypes Edge Cases/Integration Points fixed by 665c671).

**Phase 12.3 content gaps in contracts:**

| Contract | Missing Content | Source |
|----------|----------------|--------|
| roster/contract.md | D-G lobby guards: set_active_hsr_account, batch_upsert_characters, batch_remove_characters, migrate_roster reject while caller has active LobbyMemberAccount | ROST-GUARD-01, `spacetimedb/src/reducers/roster.ts` |
| match-results/contract.md | accountRatingSnapshot capture at start_draft, processMatchMmr reads snapshot instead of live HsrAccount | MMR-RACE-01/02, `spacetimedb/src/helpers/finalizationHelpers.ts` |
| match-results/contract.md | select_match_account monotonic-upward snapshot hook | Phase 12.3 Plan 03, `spacetimedb/src/reducers/accountSelection.ts` |
| tournament/contract.md | D-H-01 finalize_match_result ordering guard -- rejects tournament-controlled finalization until tournament reaches terminal stage | MMR-RACE-02, `spacetimedb/src/reducers/matchFinalization.ts` |
| tournament/contract.md | Tournament.requireOwnership column | Phase 12.3, `spacetimedb/src/tables/tournament.ts` |
| match-session/contract.md | timer_expiry_classic auto-pick pool migration from HsrAccount.isActive to LobbyMemberAccount | Phase 12.3 D-I, `spacetimedb/src/reducers/draftClassic.ts` |

### ROADMAP Issues Found

**Phase list at top (lines 15-32):** [VERIFIED: line-by-line read]

Missing entries (exist in details/progress but not in summary list):
1. Phase 12.1: Identity Garbage Collection (completed 2026-04-08)
2. Phase 12.2: SDK Upgrade Audit (completed 2026-04-09)
3. Phase 12.3: MMR Rating Snapshot (completed 2026-04-11)
4. Phase 13: Documentation Normalization (completed 2026-04-09)
5. Phase 14: Test Harness Modernization (completed -- date TBD)

**Progress table issues:** [VERIFIED: grep]
- Phase 10.5 says `1/1` but had 5 plans (should be `5/5`)
- Phase 14 row entirely missing from progress table
- Phase 13 date shows 2026-04-09 (original run) -- should be updated to rerun date

**Execution order:** Currently `-> 13 -> 14 -> 12.3` -- Phase 12.3 executed after 14, which is correct.

**Plan checkmark inconsistency:** Phases 1, 2, 4, and 04.1 use `[ ]` instead of `[x]` for their plan items, while all other phases use `[x]`. All plans are complete.

### Codebase Doc State

**7 files, all dated 2026-04-09.** [VERIFIED: filesystem]

Missing from these docs since Phase 13:
- `rosterMutations.ts` helper (new file, 105 lines)
- 5 new test files from Phase 12.3
- `test/global-setup.ts` from Phase 14
- `accountRatingSnapshot` column on MatchResultParticipant
- `requireOwnership` column on Tournament
- Phase 14 test harness changes (withConfirmedReads, onApplied)
- Updated test file count: 63 (was 58)
- Updated test count estimate (was 728)

### ERD State

**67 entities, dated 2026-04-09.** [VERIFIED: filesystem]

Missing columns from Phase 12.3:
- `MatchResultParticipant.accountRatingSnapshot: f64`
- `Tournament.requireOwnership: boolean`

No new tables were added -- still 67.

### FRONTEND-HANDOFF State

**Dated 2026-04-10 (already updated once after Phase 13).** [VERIFIED: filesystem]

Stale values:
| Field | Current Value | Actual Value | Source |
|-------|--------------|--------------|--------|
| Requirements | 83 mapped | 86 mapped (89 total) | REQUIREMENTS.md |
| Phases | 20 phases | 25 phases | ROADMAP.md progress table |
| Reducer exports | ~155 | ~156 | grep of reducer files |
| Test files | 58 files | 63 files | filesystem count |
| Test count | 728 tests | TBD (needs fresh run) | -- |

### Test File Header State

**63 test files total.** [VERIFIED: filesystem]

| File | Header Issue | Description |
|------|-------------|-------------|
| `test/backend/match-results/mmr-stats.test.ts` | STALE | 242 new lines from Phase 12.3 adding `describe('Phase 12.3: snapshot-backed MMR + D-G guard rejections')` block not mentioned in header comment. Header lists coverage items from pre-12.3 only. |
| All other 62 test files | OK | Headers accurately describe test content. Phase 12.3 changes to other files were minor (import cleanup, 1-2 line fixes) that don't warrant header updates. |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Architecture content | Copy from stale docs | Read actual source files in `spacetimedb/src/` | Phase 12.3 changed 13 source files; only docs that read source will be accurate |
| Contract reducer docs | Assume existing entries are correct | Read reducer signatures from source + cross-reference architecture | D-G guards, snapshot hooks, ordering guards were added to existing reducers |
| ERD column lists | Trust existing ERD entities | Read `spacetimedb/src/tables/*.ts` for exact column definitions | 2 new columns added in Phase 12.3 |
| Test file counts | Use cached numbers from old docs | Run `ls test/backend/**/*.test.ts \| wc -l` | 5 new test files from Phase 12.3 + 1 from Phase 14 |

## Common Pitfalls

### Pitfall 1: Assuming Original Phase 13 Work Is Fully Current
**What goes wrong:** Treating the 2026-04-09 docs as needing no updates because "Phase 13 already ran"
**Why it happens:** Phase 12.3 ran AFTER Phase 13 and updated 3 architecture files but NOT contracts, codebase docs, FRONTEND-HANDOFF, or ERD
**How to avoid:** Treat Phase 12.3 source file changes as the primary delta. Only update what changed.
**Warning signs:** Timestamps saying 2026-04-09 on files that should reflect 2026-04-11 changes

### Pitfall 2: Full Regeneration When Targeted Updates Suffice
**What goes wrong:** Rewriting all 19 architecture files and 18 contracts from scratch when only 3-4 of each need Phase 12.3 additions
**Why it happens:** Original CONTEXT.md D-12 says "full regeneration from scratch"
**How to avoid:** For the RERUN, apply D-12 only to codebase docs (which DO need full regen). For architecture/contract files, apply targeted updates to the specific files impacted by Phase 12.3.
**Warning signs:** Touching files that haven't had source code changes since the original Phase 13

### Pitfall 3: Missing the ROADMAP Phase List Gap
**What goes wrong:** Updating the progress table but not the Phase list at the top of ROADMAP.md
**Why it happens:** The two sections are visually separated; easy to fix one and forget the other
**How to avoid:** Check both sections. The Phase list (lines 15-32) and the Progress table (lines 379-402) must agree.

### Pitfall 4: Header/Footer Timestamp Mismatch
**What goes wrong:** Updating doc content but only changing one of the two timestamp locations
**Why it happens:** Phase 12.3 Plan 08 appended to the footer but didn't update the header
**How to avoid:** Always update BOTH `Last updated: YYYY-MM-DD` on line 3 AND `*Last updated: YYYY-MM-DD*` in the footer

### Pitfall 5: Forgetting D-12 for Codebase Docs
**What goes wrong:** Incrementally updating codebase docs instead of regenerating from scratch
**Why it happens:** The rerun context might suggest "just update the delta"
**How to avoid:** D-12 explicitly says full regeneration. The 7 codebase docs should be rewritten from the current codebase state, not patched.

### Pitfall 6: FRONTEND-HANDOFF Data Drift
**What goes wrong:** Updating the FRONTEND-HANDOFF text but leaving stale numbers in the TL;DR or Backend Summary
**Why it happens:** Numbers are scattered across multiple sections
**How to avoid:** Update all numeric claims: requirements count, phase count, reducer count, test file count, test count

## Scope Metrics (RERUN)

**Files needing updates:** [VERIFIED: git diff + filesystem audit]

| Category | Count | Files | Change Type |
|----------|-------|-------|-------------|
| Architecture timestamp fix | 3 | match-results, roster, tournament | Header timestamp 2026-04-09 -> 2026-04-12 |
| Architecture content gap | 1 | match-session (auto-pick pool migration) | Add Phase 12.3 D-I content |
| Contract Phase 12.3 additions | 4 | roster, match-results, tournament, match-session | Add D-G guards, snapshot pattern, ordering guard, auto-pick pool |
| Codebase docs full regen | 7 | ARCHITECTURE, CONCERNS, CONVENTIONS, INTEGRATIONS, STACK, STRUCTURE, TESTING | D-12: full regeneration |
| FRONTEND-HANDOFF refresh | 1 | docs/FRONTEND-HANDOFF.md | Update stats (requirements, phases, reducers, tests) |
| ERD column additions | 1 | notes/erd-mermaid.md | Add accountRatingSnapshot, requireOwnership columns |
| ROADMAP fixes | 1 | .planning/ROADMAP.md | Phase list, progress table, plan checkmarks |
| Test header update | 1 | test/backend/match-results/mmr-stats.test.ts | Add Phase 12.3 coverage to header comment |
| **Total** | **19** | | |

**Compared to original Phase 13:** 49 files -> 19 files. Significantly smaller scope since most work from the first run is still valid.

### Reducer-to-Feature Mapping Updates

Only features with Phase 12.3 source changes need contract updates:

| Feature Doc | Changed Reducer Files | New Behavior to Document |
|-------------|----------------------|--------------------------|
| roster | roster.ts, rosterMutations.ts (NEW) | D-G guards on 4 reducers, applyBatchUpsert/Remove delegation, migrate_roster rating recompute |
| match-results | finalizationHelpers.ts, accountSelection.ts, server.ts | accountRatingSnapshot capture, processMatchMmr snapshot read, monotonic hook |
| tournament | matchFinalization.ts, tournamentManagement.ts, tournamentLobby.ts | D-H ordering guard, Tournament.requireOwnership |
| match-session | draftClassic.ts | timer_expiry_classic auto-pick pool migration from HsrAccount.isActive to LMA |

## Execution Strategy Recommendations (RERUN)

The original D-19 5-plan structure should be adapted for the rerun:

### Plan 1: ROADMAP + Test Headers
- Fix ROADMAP Phase list (add 5 missing entries)
- Fix ROADMAP progress table (Phase 10.5 plan count, add Phase 14 row)
- Fix plan checkmarks on Phases 1, 2, 4, 04.1
- Update mmr-stats.test.ts header comment
- Smallest plan, no cross-dependencies

### Plan 2: Architecture + Contract Updates (Phase 12.3 delta)
- Fix timestamp mismatch on 3 architecture files (match-results, roster, tournament)
- Add Phase 12.3 content to match-session/architecture.md (auto-pick pool)
- Update 4 contracts (roster, match-results, tournament, match-session) with Phase 12.3 additions
- Must read actual source files for accurate documentation per D-09

### Plan 3: Codebase Docs Full Regeneration
- Full regeneration of all 7 files per D-12
- Must reflect current state including Phase 12.3 + Phase 14 changes
- 67 tables, ~156 reducer exports, 26 helpers, 63 test files, 5 new Phase 12.3 test files

### Plan 4: FRONTEND-HANDOFF + ERD
- Update FRONTEND-HANDOFF stats: 86 mapped requirements, 25 phases, ~156 reducers, 63 test files
- Update ERD: add accountRatingSnapshot to MatchResultParticipant, requireOwnership to Tournament
- Must execute after Plans 2-3 so references are up to date (per D-14)

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (via integration + unit test suites) |
| Config file | `vitest.config.ts` |
| Quick run command | N/A -- docs-only phase |
| Full suite command | N/A -- docs-only phase |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| N/A | Docs-only phase -- no code changes | manual-only | N/A | N/A |

**Justification for manual-only:** Phase 13 produces zero code changes except for the test header comment update (which is a comment, not executable code). All outputs are markdown documentation files. Validation is structural.

### Sampling Rate
- **Per task commit:** Visual inspection of file structure against template
- **Per wave merge:** Cross-reference numeric claims (table count, reducer count, test count) against filesystem
- **Phase gate:** All updated files have consistent timestamps, ROADMAP Phase list matches progress table, FRONTEND-HANDOFF stats match actual counts

### Wave 0 Gaps
None -- no test infrastructure needed for docs-only phase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Phase 14 is completed (plans 2/2 marked [x] in ROADMAP) | Delta Analysis | Low -- if incomplete, ROADMAP row needs different status |
| A2 | ~156 reducer exports is accurate (grep count) | Scope Metrics | Low -- exact count verified via grep |
| A3 | Test count has increased from 728 but exact number unknown without running suite | Scope Metrics | Medium -- FRONTEND-HANDOFF test count may be wrong; recommend running suite or estimating from new test file describes |

## Open Questions

1. **Exact test count for FRONTEND-HANDOFF?**
   - What we know: Was 728 (531 integration + 197 unit). Phase 12.3 added 5 new test files. Phase 14 may have modified counts.
   - What's unclear: Exact test count without running `npm run test:all`
   - Recommendation: During execution, run a quick `grep -c "it(" test/backend/**/*.test.ts` to estimate, or use the last known count from Phase 14 execution if available.

2. **Should match-session/architecture.md get Phase 12.3 content?**
   - What we know: `draftClassic.ts` was modified (auto-pick pool migration). The architecture.md for match-session was NOT updated by Phase 12.3 Plan 08.
   - What's unclear: Whether the auto-pick pool change is significant enough for architecture doc update
   - Recommendation: Yes -- it changes behavior of timer_expiry_classic from querying HsrAccount.isActive to querying LobbyMemberAccount, which is a meaningful data flow change worth documenting.

## Sources

### Primary (HIGH confidence)
- Git diff `3a77a8c..HEAD` -- all files changed after last Phase 13 commit [VERIFIED: git]
- Git diff `ce93599..HEAD -- spacetimedb/src/` -- 13 backend source files changed [VERIFIED: git]
- Filesystem audit of `docs/*/architecture.md` (19 files) -- timestamp consistency [VERIFIED: grep]
- Filesystem audit of `docs/*/contract.md` (18 files) -- architecture link presence [VERIFIED: grep]
- `spacetimedb/src/tables/*.ts` count: 67 files [VERIFIED: ls + wc]
- `spacetimedb/src/reducers/*.ts` grep: ~156 reducer exports [VERIFIED: grep]
- `test/backend/**/*.test.ts` count: 63 files [VERIFIED: ls + wc]
- `.planning/ROADMAP.md` line-by-line analysis of Phase list, progress table, plan checkmarks [VERIFIED: read]
- `13-VERIFICATION.md` gap analysis [VERIFIED: read]
- Commit `665c671` verification gap fixes confirmed [VERIFIED: git log]

### Secondary (MEDIUM confidence)
- Phase 14 completion status inferred from ROADMAP plan checkmarks (2/2 [x])

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Architecture/Contract delta: HIGH -- git diff confirms exactly which files changed and when
- ROADMAP issues: HIGH -- line-by-line verification against progress table and Phase list
- Codebase docs staleness: HIGH -- dated 2026-04-09, Phase 12.3 completed 2026-04-11
- FRONTEND-HANDOFF staleness: HIGH -- numbers verified against current filesystem
- ERD gaps: HIGH -- grep confirmed missing columns
- Test header: HIGH -- header text compared against actual describe blocks

**Research date:** 2026-04-12
**Valid until:** 2026-05-12 (stable -- docs-only phase, updates are deterministic from codebase state)
