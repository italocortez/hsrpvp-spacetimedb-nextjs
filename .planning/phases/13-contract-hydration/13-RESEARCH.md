# Phase 13: Documentation Normalization - Research

**Researched:** 2026-04-09
**Domain:** Documentation standardization, codebase documentation generation, ERD maintenance
**Confidence:** HIGH

## Summary

Phase 13 is a docs-only phase that normalizes 19 architecture files, 18 contract files, 7 codebase map files, 1 frontend handoff doc, and 1 ERD diagram to consistent standards. The reference examples (roster architecture.md at 170 lines, roster contract.md at 416 lines) establish the gold standard format. The current docs vary widely in structure -- only 3/19 architecture files have an "Overview" section, only 1/19 has "Reducer Flows", and 6/18 contracts lack the "Reducers" section entirely. The codebase was last documented at 2026-04-06 (pre-Phase 12.2) and the FRONTEND-HANDOFF.md references a non-existent `docs/teams/` directory and claims Phases 7-11 are incomplete when they are all done.

The total scope is approximately 44 files to write/rewrite, with the contract hydration (18 files) being the most labor-intensive since it requires reading all 155 reducer exports from 44 reducer source files to document Purpose/Permission/Parameters/Flow/State Changes/Error Cases for each. The 5-plan execution order (D-19) is sound: templates first, then architecture, then contracts, then codebase docs, then handoff+ERD.

**Primary recommendation:** Execute exactly as specified in CONTEXT.md decisions D-01 through D-19. The reference examples are well-structured and the gap analysis is clear. No technical uncertainty -- this is a disciplined documentation pass.

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
- **D-15:** Update notes/erd-mermaid.md with all production tables (~55+), showing PKs, FKs, and cardinality annotations (one-to-one, one-to-many, one-to-one-optional, many-to-many)
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
| All backend phases complete | All v0.5 backend requirements (83 mapped) are complete per REQUIREMENTS.md traceability table | Verified -- all SCHM, ROST, TRNT, TEAM-04/05, BRKT, MTCH, MMR, ANON, STAT, ACHV, CAL, MOUS, CHAT, LBBY, DISC, COST, ARCH requirements marked complete |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

Relevant CLAUDE.md directives for this docs-only phase:

1. **Architecture docs cross-reference contracts via links. No duplication between them.** -- Architecture files document structure/flows, contracts document behavior/acceptance. Phase 13 must maintain this separation.
2. **Architecture docs: Update every time backend code changes** -- Phase 13 is the catch-up pass for all accumulated drift.
3. **Contracts: Use the template from `.claude/skills/uat/references/workflow-doc-template.md`** -- The contract template is already read and analyzed in this research.
4. **Contracts: Update after every phase discussion with new workflow decisions** -- Phase 13 hydrates all contracts with full reducer documentation from codebase.
5. **Never modify behavior specs during execution; update after with Phase X execution provenance tags** -- Since Phase 13 IS the documentation phase, all changes are the primary purpose. Tag new entries with `Phase 13 normalization` in Phase History.
6. **Make the smallest change necessary; do NOT touch unrelated files** -- Phase 13 scope is explicitly all docs; each plan should touch only its designated file set.
7. **Project uses npm** -- Not relevant for docs-only phase but noted.

## Architecture Patterns

### Architecture File Normalization Gap Analysis

**Current state audit (19 files):** [VERIFIED: codebase grep]

| Section | Files With It | Files Missing It | Reference Has It |
|---------|---------------|------------------|------------------|
| `# Feature -- Architecture` header | 2 (achievements, calendar) | 17 | Yes (roster) |
| `## Overview` | 3 (cost-sets, roster, views) | 16 | Yes |
| `## Table Relationships` | 7 (achievements, cost-sets, lobby, match-results, match-session, roster, tournament) | 12 | Yes |
| `## Reducer Flows` | 1 (roster) | 18 | Yes |
| `## Phase History` | 0 | 19 | Not in roster, but D-03 requires it |
| `Last updated: YYYY-MM-DD` | 1 (achievements) | 18 | Not in roster, but D-02 requires it |

**Header format inconsistencies:** [VERIFIED: codebase grep]
- Correct (`Feature -- Architecture`): achievements, calendar (2 files)
- Missing doc type: admin, anonymous-play, archetypes, auth, brackets, chat, cost-sets, cost-tables, lobby, match-results, match-session, mmr, player-stats, tournament, views (15 files)
- Has `<!-- generated-by -->` comment: smoke, mmr (2 files)

**Section naming inconsistencies:**
- `## Tables` instead of `## Table Relationships`: admin, anonymous-play, archetypes, auth, brackets, chat, cost-tables, mmr, player-stats, smoke (use `## Tables`)
- Some use `## Key Decisions` instead of dedicated Phase History section
- Some use `## Reducer Reference` (table format) instead of `## Reducer Flows` (narrative format)

### Contract File Normalization Gap Analysis

**Current state audit (18 files):** [VERIFIED: codebase grep]

| Section | Files With It | Files Missing It |
|---------|---------------|------------------|
| Architecture link | 15 | 3 (achievements, calendar, mmr-has-it-but-after-comment) |
| `## Feature Overview` | 13 | 5 (anonymous-play, brackets, cost-sets, match-results, player-stats) |
| `## Reducers` | 12 | 6 (anonymous-play, brackets, cost-sets, match-results, player-stats, views) |
| `## Acceptance Scenarios` | 18 | 0 |
| `## Edge Cases` | 16 | 2 (archetypes, smoke -- though smoke has similar content) |
| `## Integration Points` | 17 | 1 (archetypes) |
| `## Phase History` | 18 | 0 |

**Contracts needing heaviest hydration** (missing Reducers section = needs full reducer documentation from codebase):
- `anonymous-play` -- reducers live in views (anonymousViews.ts) and helpers
- `brackets` -- 7 reducers (generate_bracket, seed_bracket, swap_seeds, advance_bracket_match, submit_and_advance_bracket, rollback_bracket_match, advance_group_to_elimination)
- `cost-sets` -- 8 reducers documented in architecture but not in contract
- `match-results` -- 4+ reducers (submit_match_result, override_match_result, finalize/auto-finalize, score entry)
- `player-stats` -- primarily computed, but has views and stat increment logic
- `views` -- 32+ views documented in architecture.md, need contract format for acceptance scenarios

### Recommended Template File Location

Place templates at `docs/_templates/` (underscore prefix sorts before feature dirs, signals non-feature content):
- `docs/_templates/architecture-template.md`
- `docs/_templates/contract-template.md`

### Recommended Project Structure for Docs

```
docs/
  _templates/
    architecture-template.md
    contract-template.md
  {feature}/
    architecture.md          # Structure, tables, reducer flows
    contract.md              # Behavior, acceptance scenarios
  FRONTEND-HANDOFF.md        # Rewritten from normalized docs
  ERD.excalidraw             # (untouched, deferred)
notes/
  erd-mermaid.md             # Updated with cardinality
.planning/
  codebase/
    ARCHITECTURE.md           # Regenerated
    CONCERNS.md               # Regenerated
    CONVENTIONS.md            # Regenerated
    INTEGRATIONS.md           # Regenerated
    STACK.md                  # Regenerated
    STRUCTURE.md              # Regenerated
    TESTING.md                # Regenerated
```

### Architecture Template Standard (from D-01 through D-05)

```markdown
# Feature Name -- Architecture

Last updated: YYYY-MM-DD

## Overview

{1-2 paragraphs: what this feature does, who uses it}

## Table Relationships

```
ParentTable (PK)
  +-- ChildTable (FK -> ParentTable.PK)  [PRIVATE -- D-XX, Phase Y]
  |     columnName -> Description
  +-- AnotherChild (FK -> ParentTable.PK)
```

## Reducer Flows

### reducer_name(param1, param2)
1. Step 1
2. Step 2
...

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| {what} | {where} | {when} |

---

*Last updated: YYYY-MM-DD*
*Feature owner: Phase N*
```

### Contract Template Standard (from D-06 through D-11)

```markdown
# Feature Name

**Architecture:** [architecture.md](architecture.md)

## Feature Overview

{1 paragraph}

## Reducers

### reducer_name

**Purpose:** {one line}
**Permission:** {who}
**Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
**Flow:**
1. ...
**Expected State Changes:**
- ...
**Error Cases:**
| Condition | Error Message |
|-----------|--------------|

## Acceptance Scenarios

### Scenario Name
**Given:** ...
**When:** ...
**Then:** ...

## Edge Cases

| Case | Expected Behavior | Notes |
|------|-------------------|-------|

## Integration Points

| This Feature | Connects To | How | Direction |
|-------------|------------|-----|-----------|

## Phase History

| Decision | Source | Date |
|----------|--------|------|

---

*Last updated: YYYY-MM-DD*
*Feature owner: Phase N*
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reducer parameter documentation | Manually infer types from code | Read actual reducer source files in `spacetimedb/src/reducers/` for exact parameter types and names | Stale docs are worse than no docs; source is always truth |
| Table relationship diagrams | Guess table structures | Read actual table definitions in `spacetimedb/src/tables/` for exact column types and PKs/FKs | 67 table files, schema has evolved through 12+ phases |
| ERD cardinality | Assume relationships | Read FK columns and check for btree indexes, optional markers | Some relationships changed (TournamentEnrolled.hsrAccountId removed in Phase 10.4) |
| View documentation | Copy from old docs | Read `spacetimedb/src/views/anonymousViews.ts` and `securityViews.ts` for current view implementations | Views were added/modified in Phases 10.3, 10.4, 12.2 |

**Key insight:** Every doc file must be written by reading the actual source code, not by copying/editing existing docs. Existing docs have accumulated drift over 12+ phases. The source files in `spacetimedb/src/` are the single source of truth.

## Common Pitfalls

### Pitfall 1: Copying Stale Content from Existing Docs
**What goes wrong:** Old docs reference removed columns, deleted tables, or deprecated patterns
**Why it happens:** 12+ phases of evolution; docs were not always updated atomically with code changes
**How to avoid:** For every architecture and contract file, read the corresponding source files fresh. Do not trust existing doc content as baseline.
**Warning signs:** References to `TournamentParticipant` (replaced by `TournamentEnrolled` + `TournamentTeamMember`), `GroupStanding` (renamed to `GroupPhaseRecord`), `player1Id/player2Id` (replaced by `MatchResultParticipant`)

### Pitfall 2: Architecture-Contract Duplication
**What goes wrong:** Same reducer flow documented in both architecture.md and contract.md with slightly different details
**Why it happens:** CLAUDE.md explicitly prohibits duplication, but both files cover reducers
**How to avoid:** Architecture documents reducer flows as brief operational sequences (numbered steps). Contract documents reducer behavior as acceptance specifications (Purpose/Permission/Params/Flow/State Changes/Errors). Architecture is "how it works", contract is "what it should do".
**Warning signs:** Identical numbered step lists in both files

### Pitfall 3: Inconsistent Feature-to-Reducer Mapping
**What goes wrong:** A reducer documented in the wrong feature's contract, or missed entirely
**Why it happens:** Some reducers span features (e.g., `finalize_match_result` touches MMR, stats, brackets, match history)
**How to avoid:** Map each of the 44 reducer files to exactly one feature doc. Cross-feature behavior goes in Integration Points.
**Warning signs:** A reducer appearing in multiple contracts' Reducers section

### Pitfall 4: ERD Table Count Mismatch
**What goes wrong:** ERD lists different tables than actual schema
**Why it happens:** Tables added in later phases (Phase 10.4: LobbyMemberAccount, Phase 11: AccountRatingConfig, Phase 12.1: IdentityGcJob, GcResult) may be missing
**How to avoid:** Cross-reference the 67 table definition files in `spacetimedb/src/tables/` against ERD entities. Current ERD has 65 entities; 2 are missing (likely IdentityGcJob and GcResult from Phase 12.1, or AccountRatingConfig from Phase 11).
**Warning signs:** Table count in ERD header not matching actual

### Pitfall 5: FRONTEND-HANDOFF.md Stale References
**What goes wrong:** Handoff doc references non-existent paths or incorrect completion status
**Why it happens:** Current handoff was written at Phase 6.1; references `docs/teams/` (doesn't exist), says Phases 7-11 are incomplete (all complete), claims "80+ reducers" (actual: 155)
**How to avoid:** Write from scratch after all other docs are normalized; reference only verified paths

### Pitfall 6: Phase History Provenance Confusion
**What goes wrong:** Phase History entries lack clear provenance, mixing original design decisions with execution-time additions
**Why it happens:** Different phases used different tagging conventions
**How to avoid:** For Phase 13 normalization, tag all new entries as `Phase 13 normalization`. Preserve existing entries with their original provenance. Do not rewrite existing Phase History entries.
**Warning signs:** Entries with no source attribution

## Scope Metrics

**Exact file counts:** [VERIFIED: filesystem audit]

| Category | Count | Files |
|----------|-------|-------|
| Architecture normalization | 19 | achievements, admin, anonymous-play, archetypes, auth, brackets, calendar, chat, cost-sets, cost-tables, lobby, match-results, match-session, mmr, player-stats, roster, smoke, tournament, views |
| Contract hydration | 18 | achievements, admin, anonymous-play, archetypes, auth, brackets, calendar, chat, cost-sets, lobby, match-results, match-session, mmr, player-stats, roster, smoke, tournament, views |
| Codebase docs regeneration | 7 | ARCHITECTURE, CONCERNS, CONVENTIONS, INTEGRATIONS, STACK, STRUCTURE, TESTING |
| FRONTEND-HANDOFF rewrite | 1 | docs/FRONTEND-HANDOFF.md |
| ERD update | 1 | notes/erd-mermaid.md |
| Templates (new) | 2 | docs/_templates/architecture-template.md, docs/_templates/contract-template.md |
| ROADMAP cleanup | 1 | .planning/ROADMAP.md |
| **Total** | **49** | |

**Reducer-to-feature mapping for contract hydration:** [VERIFIED: codebase grep]

| Feature Doc | Reducer Source Files | Reducer Count |
|-------------|---------------------|---------------|
| achievements | achievementManagement.ts | 7 |
| admin | admin.ts, adminMatchTools.ts, banAdmin.ts | 8 |
| anonymous-play | (views only -- anonymousViews.ts) | 0 reducers, 4+ views |
| archetypes | (in rosterAdmin.ts -- archetype reducers) | 4 |
| auth | auth.ts | 1 (login_as_guest) + server reducers |
| brackets | bracketGeneration.ts, bracketAdvancement.ts | 7 |
| calendar | calendarAvailability.ts, calendarEvents.ts, calendarInviteResponse.ts, calendarSaved.ts | 12+ |
| chat | chat.ts | 2 |
| cost-sets | costSetManagement.ts | 8 |
| lobby | lobbyLifecycle.ts, lobbySettings.ts, lobbyPresets.ts, lobbyGc.ts | 15+ |
| match-results | matchResultSubmission.ts, matchFinalization.ts, scoreEntry.ts | 8+ |
| match-session | draftClassic.ts, draftAuction.ts, draftControl.ts, postDraft.ts, seriesManagement.ts | 15+ |
| mmr | eloAdmin.ts, seasonAdmin.ts, ratingAdmin.ts | 6+ |
| player-stats | (computed via helpers, views) | 0 direct reducers, stats in views |
| roster | roster.ts, rosterAdmin.ts, profile.ts, accountSelection.ts | 12+ |
| smoke | server.ts, identityGc.ts, userDeletion.ts | 5+ |
| tournament | tournamentManagement.ts, tournamentRegistration.ts, tournamentTeams.ts, tournamentAdmin.ts, tournamentCheckIn.ts, tournamentLobby.ts, refereeManagement.ts, concede.ts | 25+ |
| views | (views/anonymousViews.ts, views/securityViews.ts) | 32+ views |

**ERD status:** [VERIFIED: filesystem audit]
- Current entities: 65 (ERD header says 66)
- Actual table files: 67
- Missing from ERD: likely IdentityGcJob, GcResult, AccountRatingConfig (Phase 11-12.1 additions)
- Cardinality annotations: Already present using mermaid ERD notation (`}o--||`, `}o--o|`, `||--||`), with text labels like `"userId (many-to-one)"`. D-15/D-16 want explicit cardinality annotation text on all relationships.

## Execution Strategy Recommendations

### Plan 1: Templates + ROADMAP (smallest plan)
- Create `docs/_templates/architecture-template.md` and `docs/_templates/contract-template.md`
- Update ROADMAP.md Phase 13 scope and cleanup completed phase entries (D-17, D-18)
- Estimated: 3 files touched

### Plan 2: Architecture Normalization (19 files)
- **Recommended batching:** Process all 19 sequentially by feature directory (alphabetical). Each file follows the same template, just different content. No inter-file dependencies.
- **Per-file process:** Read existing architecture.md + read corresponding table definition files + read corresponding reducer files -> write normalized architecture.md
- **Estimated effort per file:** Small files (admin, archetypes, cost-tables at 59-68 lines) need moderate expansion. Large files (match-results at 524 lines, views at 476 lines, lobby at 436 lines) need structural reorganization more than content addition.

### Plan 3: Contract Hydration (18 files -- heaviest)
- **Recommended batching:** Process all 18 sequentially by feature directory (alphabetical).
- **Per-file process:** Read existing contract.md + read ALL reducer source files for that feature + cross-reference architecture.md -> write fully hydrated contract.md
- **This is the highest-effort plan.** The 6 contracts currently missing Reducers sections need full hydration from scratch. The 12 that have Reducers sections need verification against current source and possible expansion.
- **Critical:** For each reducer, must read the actual source code to document correct parameters, types, flow, and error messages. Do not rely on existing doc content.

### Plan 4: Codebase Docs Regeneration (7 files)
- Full regeneration from scratch (D-12). Read the entire codebase structure, not existing docs.
- Current docs dated 2026-04-06 (pre-Phase 12.2). Need to reflect: SDK upgrade (Phase 12.2), identity GC (Phase 12.1), account selection (Phase 10.4), test stabilization (Phase 10.5), all view exports.

### Plan 5: FRONTEND-HANDOFF + ERD (2 files)
- **Must execute last** (D-14) -- references finalized docs from Plans 2-4.
- FRONTEND-HANDOFF.md: Current version references `docs/teams/` (doesn't exist), claims 55 tables (actual: 67), claims 80+ reducers (actual: 155), says Phases 7-11 incomplete (all complete). Full rewrite.
- ERD: Add missing tables (IdentityGcJob, GcResult, AccountRatingConfig at minimum), verify all 67 tables present, ensure all relationships have explicit cardinality annotations.

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

**Justification for manual-only:** Phase 13 produces zero code changes. All outputs are markdown documentation files. Validation is structural (does each file have the required sections?) and content-based (do reducers match source code?). This cannot be automated with the existing test framework.

### Sampling Rate
- **Per task commit:** Visual inspection of file structure against template
- **Per wave merge:** Cross-reference reducer counts in contracts against source file grep
- **Phase gate:** All 49 files exist, all architecture files have required 4 sections, all contracts have required 7 sections

### Wave 0 Gaps
None -- no test infrastructure needed for docs-only phase.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Template files should go in `docs/_templates/` | Architecture Patterns | Low -- location is Claude's discretion per CONTEXT.md; planner can override |
| A2 | The 2 missing ERD tables are IdentityGcJob and GcResult (Phase 12.1) | Scope Metrics | Low -- exact missing tables will be determined by diff during Plan 5 execution |
| A3 | 155 reducer count from grep is accurate | Scope Metrics | Low -- includes scheduled reducers and view functions; exact count per feature may vary slightly |

## Open Questions (RESOLVED)

1. **Special handling for smoke/views contracts?**
   - What we know: `smoke` documents test infrastructure, not a user-facing feature. `views` documents server-side views, not reducers. Both have contract.md files but don't follow the standard reducer-first pattern.
   - What's unclear: Should these follow the exact same template or have an adapted format?
   - Recommendation: Adapt the template slightly -- smoke uses "Bootstrap Procedures" instead of "Reducers", views uses "View Definitions" instead of "Reducers". Same sections otherwise.

2. **AccountRatingConfig table (Phase 11) presence in ERD?**
   - What we know: Phase 11 added AccountRatingConfig as a single-row config table. ERD mentions it in the color legend (pink) but may or may not have its entity definition.
   - What's unclear: Whether it's among the 65 counted entities or missing.
   - Recommendation: Verify during Plan 5 execution by diffing table files against ERD entities.

## Sources

### Primary (HIGH confidence)
- Filesystem audit of `docs/*/architecture.md` (19 files) and `docs/*/contract.md` (18 files) -- section presence verified via grep
- `docs/roster/architecture.md` (170 lines) -- reference architecture read in full
- `docs/roster/contract.md` (416 lines) -- reference contract read in full
- `.claude/skills/uat/references/workflow-doc-template.md` -- contract template read in full
- `spacetimedb/src/reducers/` directory listing (44 files, 155 reducer exports)
- `spacetimedb/src/tables/` directory listing (67 table definition files)
- `notes/erd-mermaid.md` (492 lines, 65 entity definitions, existing cardinality annotations)
- `docs/FRONTEND-HANDOFF.md` (stale references confirmed: teams dir missing, phase status incorrect)
- `.planning/codebase/` files (7 files, dated 2026-04-06)
- `13-CONTEXT.md` -- all 19 locked decisions

### Secondary (MEDIUM confidence)
- Reducer-to-feature mapping inferred from file naming conventions and directory structure

### Tertiary (LOW confidence)
- None -- all findings verified against filesystem

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- docs-only phase, no library decisions needed
- Architecture: HIGH -- reference examples read in full, gap analysis complete via grep audit
- Pitfalls: HIGH -- stale content identified by direct file comparison, missing tables confirmed by filesystem audit

**Research date:** 2026-04-09
**Valid until:** 2026-05-09 (stable -- docs-only phase, no external dependencies that could change)
