# Phase 13: Documentation Normalization - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md -- this log preserves the alternatives considered.

**Date:** 2026-04-09
**Phase:** 13-contract-hydration
**Areas discussed:** Architecture template, Contract template, Codebase docs refresh, FRONTEND-HANDOFF.md, ROADMAP cleanup, Execution ordering, ERD mermaid

---

## Architecture Template

### Heading Format
| Option | Description | Selected |
|--------|-------------|----------|
| Feature -- Architecture | Explicit doc type in header, matches roster/achievements/calendar | yes |
| Feature Name only | Simpler, doc type implied by filename | |
| You decide | Claude picks | |

**User's choice:** Feature -- Architecture
**Notes:** Preview of roster-style structure confirmed the decision.

### Section Order
| Option | Description | Selected |
|--------|-------------|----------|
| Roster-style (full) | Overview -> Table Relationships -> Reducer Flows -> Phase History | yes |
| Compact (no reducer flows) | Reducer detail only in contract.md | |
| You decide | Claude picks | |

**User's choice:** Roster-style (full)

### Metadata Timestamp
| Option | Description | Selected |
|--------|-------------|----------|
| Yes, date line after title | Last updated line below h1 | yes |
| No, git blame is enough | Timestamps go stale | |
| You decide | Claude picks | |

**User's choice:** Yes, date line after title

### Diagram Style
| Option | Description | Selected |
|--------|-------------|----------|
| Tree notation | Consistent with roster reference | yes |
| You decide | Claude picks | |

**User's choice:** Tree notation

---

## Contract Template

### Section Order
| Option | Description | Selected |
|--------|-------------|----------|
| Roster-style (reducer-first) | Architecture link -> Feature Overview -> Reducers -> Acceptance Scenarios -> Edge Cases -> Integration Points -> Phase History | yes |
| Scenario-first | Acceptance Scenarios before Reducers | |
| You decide | Claude picks | |

**User's choice:** Roster-style (reducer-first)

### Completeness Level
| Option | Description | Selected |
|--------|-------------|----------|
| Full hydration | Read every reducer from codebase, document fully | yes |
| Structure only | Normalize headings, placeholder reducer names | |
| You decide | Claude picks | |

**User's choice:** Full hydration

### Cost-tables Contract
| Option | Description | Selected |
|--------|-------------|----------|
| Yes, create it | Only missing contract | |
| Skip it | Admin/game-data, low priority | yes |

**User's choice:** Skip it

---

## Codebase Docs Refresh

### Regeneration Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Full regeneration | Regenerate all 7 files from scratch | yes |
| Incremental update | Update only stale sections | |
| You decide | Claude picks | |

**User's choice:** Full regeneration

---

## FRONTEND-HANDOFF.md

### Update Strategy
| Option | Description | Selected |
|--------|-------------|----------|
| Rewrite from scratch | After all other docs normalized | yes |
| Incremental update | Update changed sections only | |
| You decide | Claude picks | |

**User's choice:** Rewrite from scratch

---

## ROADMAP Cleanup

### Scope
| Option | Description | Selected |
|--------|-------------|----------|
| Phase 13 description only | Update just Phase 13 scope | |
| Phase 13 + cleanup pass | Update Phase 13 scope + minor cleanup on completed phases | yes |
| You decide | Claude picks | |

**User's choice:** Phase 13 + cleanup pass

---

## Execution Ordering

### Plan Structure
| Option | Description | Selected |
|--------|-------------|----------|
| Templates first, then bulk | 5 plans: Templates -> Architecture -> Contracts -> Codebase -> Handoff+ERD | yes |
| Feature-by-feature | Each plan handles one feature's arch + contract together | |
| You decide | Claude picks | |

**User's choice:** Templates first, then bulk

---

## ERD Mermaid

### Scope
| Option | Description | Selected |
|--------|-------------|----------|
| All tables with cardinality | All ~55 tables, PKs, FKs, one-to-one/one-to-many annotations | yes |
| Core relationships only | Main entity graph, skip auxiliary | |
| You decide | Claude picks | |

**User's choice:** All tables with cardinality annotations (e.g., User (one) to UserPrivate (one-optional))

---

## Claude's Discretion

- Template file format and location
- Batching strategy within architecture/contract plans
- .planning/codebase/ regeneration depth
- FRONTEND-HANDOFF.md internal structure

## Deferred Ideas

- cost-tables contract.md creation (explicitly skipped by user)
- docs/ERD.excalidraw visual diagram update (not scoped, mermaid chosen instead)
