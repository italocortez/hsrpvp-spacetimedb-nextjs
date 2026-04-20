# Milestones

## v0.5 Backend Foundation (Shipped: 2026-04-12)

**Phases:** 23 | **Plans:** 75 | **Tasks:** 157
**Timeline:** 43 days (2026-02-28 → 2026-04-12)
**Commits:** 555 | **Backend LOC:** 28,040 TS | **Test LOC:** 23,450 TS | **Frontend LOC:** 6,678 TSX/TS
**Requirements:** 86/86 complete (3 out of scope: TEAM-01/02/03)
**Git range:** `043b150` (initial commit) → `46de216` (v0.5 audit)

**Delivered:** Complete SpacetimeDB backend for competitive HSR PVP — 67 tables, ~156 reducers, 32 server-side views, 728 integration tests across all features.

**Key accomplishments:**

1. Full tournament system with lifecycle management, bracket generation (single/double/group), auto-advancement, and referee validation
2. Complete match result pipeline with game-mode-specific scoring, screenshot verification, ELO/MMR calculation with tiered K-factor, and leaderboards
3. Real-time lobby system with Classic + Auction draft modes, best-of-N series support, ephemeral chat, cursor broadcast, and configurable disconnect handling
4. Roster management with multi-account support, matrix-based account rating (vertical eidolons + horizontal archetype coverage), and per-match account selection with MMR snapshot freeze
5. Auth security hardening with UserPrivate isolation, view-based profile access, ban infrastructure, identity garbage collection, and SDK 2.1.0 upgrade
6. 19 normalized feature doc sets (architecture.md + contract.md), comprehensive FRONTEND-HANDOFF.md, and full codebase maps for v0.9 frontend milestone

**Archives:** `milestones/v0.5-ROADMAP.md`, `milestones/v0.5-REQUIREMENTS.md`, `milestones/v0.5-MILESTONE-AUDIT.md`

---
