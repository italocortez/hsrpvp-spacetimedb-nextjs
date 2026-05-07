# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v0.5 — Backend Foundation

**Shipped:** 2026-04-12
**Phases:** 23 | **Plans:** 75 | **Timeline:** 43 days

### What Was Built
- Complete SpacetimeDB backend: 67 tables, ~156 reducers, 32 server-side views
- Full tournament system with bracket generation (single/double/group), auto-advancement, and referee validation
- Match result pipeline with game-mode-specific scoring, ELO/MMR, and leaderboards
- Real-time lobby system with Classic + Auction drafts, best-of-N series, chat, cursor broadcast
- Auth security hardening with UserPrivate isolation, ban infrastructure, identity GC
- 728 integration tests across 63 test files
- 19 normalized feature doc sets, comprehensive frontend handoff documentation

### What Worked
- **Strict phase dependency ordering** — building schema first, then reducers, then cross-cutting concerns prevented rework
- **Decimal phase insertions** (04.1, 06.1, 10.1-10.5, 12.1-12.3) — handled urgent fixes and scope discoveries without disrupting the roadmap
- **Architecture docs + behavior specs per feature** — caught integration issues early and provided clear contracts for future frontend work
- **Milestone audit before completion** — identified the HsrAccountLightcone cleanup and validated 86/86 requirements systematically
- **Test suite stabilization as a dedicated phase** (10.5) — fixing cross-file isolation issues in one pass was far more efficient than patching individual failures

### What Was Inefficient
- **Late schema reworks** — Phase 04.1 (Blue/Red naming), Phase 10.1 (best-of-N, team-centric model) required significant refactoring of already-built reducers. Earlier schema review would have reduced churn
- **Deferred tests** — several phases deferred UAT tests to later phases, creating a growing backlog that Phase 10.5 had to clean up
- **Documentation drift** — docs fell behind during rapid phase execution (Phases 9-10.4), requiring a dedicated normalization phase (13)
- **Roster mutation guards added late** (Phase 12.3) — the MMR snapshot race condition should have been caught during Phase 5 design

### Patterns Established
- Flat columns over config structs for filterable SpacetimeDB data
- Transactional tables (requests/invites) use row existence as state, no status columns
- costSetId=0, teamGroupId=0, winnerId=0 sentinel patterns for u32 reducer params
- UserPrivate isolation with view-based profile access
- .catch() reducer error pattern (post SDK 2.1.0)
- BigInt micros as strings for timestamp reducer params
- Audit columns (createdAt/By, updatedAt/By) on all tables
- Architecture doc + behavior spec per feature area

### Key Lessons
1. **Schema design deserves more upfront time.** Two retroactive normalization phases (04.1, 10.1) cost significant effort. Invest more in schema review before writing reducers.
2. **Test isolation must be built in from Phase 1.** Shared DB state pollution was the #1 test reliability issue. Every new test file should use isolated setup/teardown from day one.
3. **Decimal phases are a strength, not a smell.** 10 out of 23 phases were insertions — they kept the roadmap honest about real work rather than hiding scope changes inside existing phases.
4. **Security hardening should be continuous, not a late phase.** UserPrivate isolation (Phase 12) and MMR snapshot guards (Phase 12.3) would have been cheaper if designed into the original schema.
5. **Documentation normalization pays off as a milestone gate.** Phase 13 ensured every feature area has current, standardized docs — critical for the frontend team to build against.

### Cost Observations
- Model mix: primarily Opus for orchestration/planning, Sonnet for execution agents
- 23 phases completed in 43 calendar days
- Notable: Phase 9 (9 plans) was the largest phase — lobby/draft/chat system had high interconnection

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Timeline | Phases | Key Change |
|-----------|----------|--------|------------|
| v0.5 | 43 days | 23 | Established GSD workflow, decimal phase insertions, milestone audit gate |

### Cumulative Quality

| Milestone | Tests | Test Files | Backend LOC | Docs |
|-----------|-------|------------|-------------|------|
| v0.5 | 728 | 63 | 28,040 | 19 feature doc sets |

### Top Lessons (Verified Across Milestones)

1. Schema design upfront saves retroactive normalization phases
2. Test isolation from day one prevents expensive stabilization passes
3. Documentation normalization as a milestone gate ensures clean handoffs
