---
phase: 13-contract-hydration
plan: 04
subsystem: planning
tags: [documentation, codebase-docs, regeneration]

requires:
  - phase: 13-01
    provides: Phase 13 plan structure established

provides:
  - All 7 .planning/codebase/ docs regenerated from actual codebase state as of Phase 12.2
  - STACK.md reflects SDK 2.1.0 upgrade and Phase 12.2 breaking changes
  - ARCHITECTURE.md reflects UserPrivate (Phase 12), Identity GC (Phase 12.1), view export pattern (Phase 12.2)
  - STRUCTURE.md reflects actual file counts (67 tables, 44 reducers, 32 view bindings, 14 test dirs)
  - CONVENTIONS.md reflects .catch() reducer error handling and export const view pattern
  - TESTING.md reflects Phase 10.5 shared helpers and afterAll cleanup pattern

affects: [planning-agents, future-phases]

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified:
    - .planning/codebase/STACK.md
    - .planning/codebase/STRUCTURE.md
    - .planning/codebase/ARCHITECTURE.md
    - .planning/codebase/CONVENTIONS.md
    - .planning/codebase/CONCERNS.md
    - .planning/codebase/INTEGRATIONS.md
    - .planning/codebase/TESTING.md

key-decisions:
  - "All 7 docs regenerated from scratch (full rewrite, not incremental update) per D-12"
  - "Files written to main repo working tree; committed with --no-verify to bypass pre-commit hooks"

requirements-completed: []

duration: 45min
completed: 2026-04-09
---

# Phase 13 Plan 04: Codebase Docs Regeneration Summary

**All 7 .planning/codebase/ docs rewritten from actual codebase, reflecting Phase 12.2 SDK upgrade, UserPrivate isolation, Identity GC, and view export pattern changes**

## Performance

- **Duration:** ~45 min
- **Tasks:** 2 (both auto)
- **Files modified:** 7

## Accomplishments

### Task 1: STACK.md, STRUCTURE.md, ARCHITECTURE.md

**STACK.md** — Updated from 2026-04-06 baseline:
- SDK version corrected: `spacetimedb` ^2.1.0 in root (was ^2.0.3)
- Three Phase 12.2 breaking changes documented: `.catch()` for reducer errors, `export const` view requirement, `.withConfirmedReads(false)`
- Version history table added covering Phases 10.5 through 12.2
- Security headers in `next.config.ts` documented

**STRUCTURE.md** — Updated with accurate file counts and new directories:
- 67 tables, 44 reducers, 25 helpers, 32 named views, 236 binding files (32 view bindings)
- `test/shared/helpers/` (9 files, Phase 10.5) and `test/backend/garbage-collector/` added
- `docs/_templates/` noted as `docs/_templates` path string (Phase 13)
- `spacetimedb/dist/bundle.js` noted as committed build artifact
- Where-to-add-new-code section updated with Phase 12.2 view registration requirement

**ARCHITECTURE.md** — Three major additions:
- UserPrivate table (Phase 12): `public: false`, accessed only via `view_my_profile` and `view_admin_user_private`
- Identity GC (Phase 12.1): weekly schedule, 90-day TTL, mutable binding pattern for circular import avoidance
- View export pattern (Phase 12.2): `export const` requirement, all 32 views enumerated, re-export from `index.ts` required
- Auth profile resolution updated: `view_my_profile` as primary, User table as fallback, `view_my_identity` removed
- Feature domain map added covering all 18 feature areas

### Task 2: CONVENTIONS.md, CONCERNS.md, INTEGRATIONS.md, TESTING.md

**CONVENTIONS.md** — Three major additions:
- View export pattern section: `export const view_xxx = spacetimedb.view(...)` requirement; old side-effect import pattern marked DEAD
- Reducer error handling section: `.catch()` on `Promise<void>`; `_then()` pattern marked WRONG
- Privacy markers section: `public: false` table list, named view access pattern
- View naming convention added: snake_case with `view_` prefix

**CONCERNS.md** — Two new entries:
- Fragile area: `view_my_profile` dependency on UserPrivate row existence with optional chaining
- Fragile area: `useAuth.ts` Phase 12.2 reactive callback changes
- SDK dependency risk updated to reflect 2.1.0 upgrade and actual breaking changes experienced
- `iter()` usage section updated with files list and scale assumptions

**INTEGRATIONS.md** — Phase 12 auth changes reflected:
- `server_link_discord` renamed to `server_link_provider` (generic OAuth bridge)
- Discord data storage moved to `UserPrivate` (not `User` public table)
- `withConfirmedReads(false)` in client connection builder
- Auth profile resolution updated: `view_my_profile` primary, `view_my_identity` removed

**TESTING.md** — Phase 10.5 infrastructure documented:
- `test/shared/helpers/` directory (9 files) enumerated with purposes
- `defaultLobbyArgs` Phase 10.4 additions noted (`bestOf`, `refereeControlsShelving`)
- `afterAll` cleanup pattern with `cleanupLobby` documented as canonical pattern
- `garbage-collector/` test directory (Phase 12.1) added to structure
- Vitest config details: `loadEnvLocal()` inline function documented

## Deviations from Plan

### Execution Context

**[Rule 3 - Blocking] Git reset discarded first commit attempt**
- Found during: Initial worktree branch verification
- Issue: The `git reset --soft 67d00d8` required by the worktree check reset HEAD correctly, but a prior attempt to commit under a stale orphaned commit (`cceadb0`) was lost. Files written with the Write tool were reverted by pre-commit hooks when git add was attempted.
- Fix: Rewrote all files after verifying git status showed only working tree modifications; committed with `--no-verify` as required by parallel executor instructions.
- Impact: No content loss — all files regenerated from the same source read.
- Commits: 89740f0 (Task 1), fccfb90 (Task 2)

## Known Stubs

None — docs-only plan, no code stubs.

## Threat Flags

None — `.planning/codebase/` files are internal planning context in a private repo. No secrets documented per T-13-04 accept disposition.

## Self-Check: PASSED

Files exist:
- STACK.md: 112 lines (>50) ✓
- STRUCTURE.md: 273 lines (>50) ✓
- ARCHITECTURE.md: 179 lines (>50) ✓
- CONVENTIONS.md: 325 lines (>30) ✓
- CONCERNS.md: 216 lines (>30) ✓
- INTEGRATIONS.md: 141 lines (>30) ✓
- TESTING.md: 377 lines (>30) ✓

Acceptance criteria:
- STACK.md contains `SpacetimeDB` and `2.1.0` ✓
- STACK.md lists Vitest ✓
- STRUCTURE.md contains `spacetimedb/src/tables` ✓
- STRUCTURE.md contains `docs/_templates` ✓
- ARCHITECTURE.md references UserPrivate ✓
- ARCHITECTURE.md references Identity GC / IdentityGcJob ✓
- CONVENTIONS.md contains `ensureVerifiedUser` / `ensureAdmin` ✓
- CONVENTIONS.md mentions view export pattern ✓
- CONCERNS.md mentions `iter()` ✓
- INTEGRATIONS.md mentions Discord OAuth ✓
- INTEGRATIONS.md mentions SpacetimeDB maincloud ✓
- TESTING.md mentions Vitest ✓
- TESTING.md mentions afterAll cleanup pattern ✓
- Total files: 7 ✓

Commits verified:
- 89740f0: feat(13-04): regenerate STACK.md, STRUCTURE.md, ARCHITECTURE.md ✓
- fccfb90: feat(13-04): regenerate CONVENTIONS.md, CONCERNS.md, INTEGRATIONS.md, TESTING.md ✓
