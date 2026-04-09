# Phase 13: Documentation Normalization - Context

**Gathered:** 2026-04-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Normalize all project documentation to a consistent, standardized structure. Fully hydrate architecture and contract files from the current codebase, regenerate .planning/codebase/ maps, rewrite FRONTEND-HANDOFF.md, and update the ERD mermaid diagram. Docs-only phase -- no code changes.

</domain>

<decisions>
## Implementation Decisions

### Architecture Template Standard
- **D-01:** Header format: `# Feature Name -- Architecture` (em dash separator, explicit doc type)
- **D-02:** Include `Last updated: YYYY-MM-DD` timestamp line immediately after the h1
- **D-03:** Standard section order: Overview -> Table Relationships -> Reducer Flows -> Phase History
- **D-04:** Table diagrams use tree notation exclusively (parentTable -> childTable with `+--, |--` connectors), annotate `[PRIVATE]` and decision refs inline
- **D-05:** Roster architecture.md is the reference example for all 19 files

### Contract Template Standard
- **D-06:** Standard section order: Architecture link -> Feature Overview -> Reducers -> Acceptance Scenarios -> Edge Cases -> Integration Points -> Phase History
- **D-07:** Every contract starts with `**Architecture:** [architecture.md](architecture.md)` link
- **D-08:** Reducer documentation uses full format: Purpose / Permission / Parameters (table) / Flow (numbered steps) / Expected State Changes / Error Cases (table)
- **D-09:** Full hydration -- read every reducer from the actual codebase and document completely, not just structure placeholders
- **D-10:** 18 contracts to normalize (all existing). Skip cost-tables contract creation (admin/game-data, low priority)
- **D-11:** Roster contract.md is the reference example for all 18 files

### Codebase Docs
- **D-12:** Full regeneration of all 7 .planning/codebase/ files from scratch (not incremental update)
- **D-13:** Files to regenerate: ARCHITECTURE.md, CONCERNS.md, CONVENTIONS.md, INTEGRATIONS.md, STACK.md, STRUCTURE.md, TESTING.md

### FRONTEND-HANDOFF.md
- **D-14:** Rewrite from scratch (not incremental update), generated after all other docs are normalized so it references finalized content

### ERD Mermaid
- **D-15:** Update notes/erd-mermaid.md with all production tables (~55), showing PKs, FKs, and cardinality annotations (one-to-one, one-to-many, one-to-one-optional, many-to-many)
- **D-16:** Example notation: `User (one) to UserPrivate (one-optional)`

### ROADMAP Cleanup
- **D-17:** Update Phase 13 scope description in ROADMAP.md to reflect new goals (done during this discussion)
- **D-18:** Minor cleanup pass on completed phase descriptions (status markers, plan counts) -- no scope changes to future phases

### Execution Ordering
- **D-19:** Templates-first-then-bulk approach:
  - Plan 1: Create template files + ROADMAP scope update
  - Plan 2: Architecture normalization (19 files)
  - Plan 3: Contract full hydration (18 files)
  - Plan 4: Codebase docs full regeneration (7 files)
  - Plan 5: FRONTEND-HANDOFF.md rewrite + ERD mermaid update

### Claude's Discretion
- Exact template file format and location
- How to batch architecture/contract files across plans (alphabetical, by complexity, by feature area)
- Level of detail in .planning/codebase/ regeneration
- FRONTEND-HANDOFF.md internal structure and section organization

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Architecture reference
- `docs/roster/architecture.md` -- Gold standard for architecture template (171 lines, most comprehensive structure)

### Contract reference
- `docs/roster/contract.md` -- Gold standard for contract template (416 lines, full reducer-first format)
- `docs/tournament/contract.md` -- Secondary reference (321 lines, 50+ acceptance scenarios, referenced in CLAUDE.md)

### Contract behavior spec template
- `.claude/skills/uat/references/workflow-doc-template.md` -- Template for contract files referenced in CLAUDE.md

### Current codebase state
- `.planning/codebase/ARCHITECTURE.md` -- Current architecture map (dated 2026-04-06, pre-12.2)
- `.planning/codebase/CONVENTIONS.md` -- Current conventions (dated 2026-04-06)
- `.planning/codebase/STRUCTURE.md` -- Current project structure (dated 2026-04-06)

### ERD reference
- `notes/erd-mermaid.md` -- Current ERD mermaid diagram (needs cardinality annotations)

### Frontend handoff
- `docs/FRONTEND-HANDOFF.md` -- Current handoff doc (to be rewritten)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- 19 architecture.md files already exist -- all need normalization, none need creation from scratch
- 18 contract.md files already exist -- all need hydration, cost-tables contract intentionally skipped
- 7 .planning/codebase/ files exist -- all to be regenerated
- FRONTEND-HANDOFF.md exists -- to be rewritten
- notes/erd-mermaid.md exists -- to be updated with cardinality

### Established Patterns
- Roster docs (architecture + contract) represent the most complete and well-structured format
- Tree notation (parentChild with connectors) is used in the best architecture files
- Reducer-first contract format with full Purpose/Permission/Params/Flow/State Changes/Errors tables is the standard from roster

### Integration Points
- Architecture docs cross-reference contracts via links (per CLAUDE.md convention)
- Contracts link back to architecture.md
- FRONTEND-HANDOFF.md references all feature docs as entry points for v1 frontend milestone
- ERD mermaid serves as a quick-reference for the full schema

</code_context>

<specifics>
## Specific Ideas

- ERD should annotate cardinality explicitly: `User (one) to UserPrivate (one-optional)` style notation for all relationships
- Architecture diagrams must use tree notation consistently -- no mixed arrow/code-block/pipe styles
- Full hydration means reading every reducer from the actual SpacetimeDB module code, not copying from potentially stale docs

</specifics>

<deferred>
## Deferred Ideas

- cost-tables contract.md creation -- admin/game-data feature, low priority, user explicitly chose to skip
- docs/ERD.excalidraw update -- visual ERD exists but was not scoped for this phase (mermaid ERD was chosen instead)

</deferred>

---

*Phase: 13-contract-hydration*
*Context gathered: 2026-04-09*
