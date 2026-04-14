---
gsd_state_version: 1.0
milestone: v0.9
milestone_name: Frontend — Phase Summary
current_phase: 15
current_plan: 6 (complete — ready for /gsd-verify-work)
status: executing
stopped_at: Completed 15-06-PLAN.md (tests + architecture docs). Phase 15 ready for /gsd-verify-work.
last_updated: "2026-04-14T17:27:37.899Z"
last_activity: 2026-04-14
progress:
  total_phases: 30
  completed_phases: 1
  total_plans: 10
  completed_plans: 6
  percent: 60
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-12)

**Core value:** Players can organize, play, and track competitive HSR matches and tournaments in one place — from drafting to scoring to leaderboards — without relying on external tools.
**Current focus:** Phase 15 — backend-pre-work

## Position

**Milestone:** v0.9 Frontend (phases 15–41, plus 12 deferred MOBILE XX.1 phases)
**Current phase:** 15
**Current plan:** 6 (complete — ready for /gsd-verify-work)
**Status:** Ready to execute
**Last activity:** 2026-04-14

Progress: [██████████] 100% (Phase 15: 6/6 plans complete)

## Previous Milestone

v0.5 Backend Foundation shipped 2026-04-12. See `.planning/MILESTONES.md` and `milestones/v0.5-ROADMAP.md` for details.

## v0.9 Architectural Commitments (cross-phase, apply every phase)

Authoritative: `.planning/research/DECISIONS.md` (R1–R11) + `notes/v09-frontend-subscription-strategy.md` (Decisions 1–8).

- **R2** — No Web Worker; main-thread prefetch only via `requestIdleCallback`.
- **R4** — Single-responsive-DOM default. Dual-DOM ONLY at phases 27 (Calendar), 31 (Match Drafting), 35 (Tournament brackets).
- **R7** — Fork `@g-loot/react-tournament-brackets` day one in Phase 34 (strip `styled-components`, drop `SVGViewer`).
- **R8** — Component hygiene rules enforced from Phase 16 onward: thin page files, viewport-agnostic children, Tailwind responsive for sizing/spacing only, state in hooks, layout-agnostic component props.
- **R9** — Phase 16 resolves 5 pre-decisions: `experimental.typedRoutes: true`, Next ≥15.2.3 (CVE-2025-29927), Pattern E sibling dual-DOM, positive-list middleware matcher (excl. `/sw.js`, `_next/*`, API), desktop SSR default.
- **Energy ceiling** 102,500/month maincloud; `tools/energy-model.js` pre-merge check.
- **Single data plane** — SpacetimeDB subscriptions only. No SSR data plane, no REST bridge.
- **Browser support** — Chrome/Edge/Firefox; Safari defensively gated to image-only tier with dismissible banner.

## v0.5 Conventions (carry forward)

- costSetId=0 sentinel for default cost set
- teamGroupId=0 sentinel in reducer args (u32 not optional)
- winnerId=0 sentinel for draw
- Flat columns over config structs for filterable data
- UserPrivate isolation — profile data only via `view_my_profile`
- `.catch()` reducer error pattern (no `_then()` callbacks)
- BigInt micros as strings for timestamp params in reducers
- Sentinel values for optional u8/u32 reducer params (255/0)

## Decisions

Recent v0.9-scope decisions:

- Phase structure 15–41 locked (27 core phases, data/UX pair pattern).
- `team_builder_draft` table promoted INTO v0.9 scope (Phase 19); previously "out of scope".
- Authed base layer minimized to `user` + `hsr_account` only (R3); feature pages own own subs.

Full v0.5 decision archive in `milestones/v0.5-ROADMAP.md`.

### Roadmap Evolution

- Phase 15.1 inserted after Phase 15: Auction Cost Template Extension (URGENT) — template JSON shape and seed normalization gap; schema + admin router already auction-aware.
- Phase 15.2 inserted after Phase 15: User Directory View Performance (DEFERRED) — `view_user_directory` iter()+JS filter is acceptable at v0.9-v1.0 scale (~100 users baseline). Revisit at 1k+ users; consider `User.isActive: bool` btree (Option B) or materialized `ActiveUserDirectory` table (Option C). Reviewer's suggested `User.deletedAt` btree won't work — SpacetimeDB btrees can't filter on `IS NULL`.
- Phase 15.3 inserted after Phase 15: Audit Spread Type Helper (REFACTOR) — extract `insertWithAudit<T>()` and `updateWithAudit<T>()` helpers in `spacetimedb/src/helpers/auditHelpers.ts`. Migrate 323 `auditInsert`/`auditUpdate` spread sites across 56 files. Eliminates ~50-100 `as any` suppressions. Pure refactor, zero behavior change. Single big-bang publish at end.

- [Phase 15]: Move-only view reorg: all 32 existing views split into 8 domain files matching tables/ layout; binding surface unchanged.
- [Phase 15]: Plan 02: Spine (skelUrl/atlasUrl/atlasImgUrls) + positioning (posX/posY/width) columns added to hsr_character; schema live on maincloud; bindings regenerated. Admin router + seed pipeline reworks handled by Plans 03 and 05.
- [Phase 15-backend-pre-work]: Plan 03: admin_bulk_upsert reworked — null=preserve partial-update semantics across 5 cases; costSetId now part of composite match tuple for all 3 cost tables; Spine + positioning columns editable via existing router (no new reducer per D-11). FOUND-01 editing half complete.
- [Phase 15-backend-pre-work]: Plan 04: 5 self-scoped history views (view_my_match_session_history, view_my_match_session_step_history, view_my_match_participant_history, view_my_mmr_history, view_my_match_result_game_history) added to matchHistoryViews.ts; bindings regenerated (32 -> 37); ROADMAP + REQUIREMENTS canonicalised per D-14. FOUND-02 schema half complete.
- [Phase 15-backend-pre-work]: Plan 05: seed pipeline rewritten to D-22 snake_case shape — scripts/seed-data.ts + test/shared/seed-data.ts both consume cost_set_id + 3-mode blocks + positioning + Spine fields. 3-mode fan-out for characters (21 rows), lightcones (15), pairings (3). cost.cost_set_id lifts to each row's costSetId honoring Plan 03's composite-PK tuple match. Audit clean on test/shared/fixtures.ts and scripts/post-publish.ts (no old-shape references).
- [Phase 15-backend-pre-work]: Plan 06: 5 integration test files + 1 shared two-identity harness + 3 architecture docs (docs/admin, docs/views, NEW docs/match) land the regression guards and architectural memory for FOUND-01 + FOUND-02. Wave-0 spike confirmed conn.db.view_my_X.iter() works for all 5 new views. Isolation tests use invariants I1-I4 (userId match, subset-of-backing-SQL, fresh-user-sees-empty, no-cross-user-leakage) — strictly stronger than full-flow match seeding for the filter-logic property. Full suite 30/30 green in 42.6s (including 29/30 on first full-DB-reseed run, with 3 SpacetimeDB SQL dialect quirks auto-fixed). nyquist_compliant: true. Phase 15 ready for /gsd-verify-work.

## Blockers

None at kickoff. Open items for phase-time research tracked in `.planning/research/DECISIONS.md` "Open items for phase-time research":

1. Spine `skeleton.scaleY = -1` workaround (Phase 31)
2. Cursor broadcast throttle rate lock (Phase 30)
3. Imgur rate-limit fallback / Discord-bot storage plan (Phase 32)
4. Vercel preview Discord OAuth callback URL strategy (Phase 21)
5. FullStory sampling strategy (Phase 31 telemetry)
6. React 19 peer confirmation for forked bracket lib (Phase 34)
7. Recurring availability slot algorithm + DST + overlap (Phase 26)

## Session Continuity

Last session: 2026-04-13T00:36:33.028Z
Stopped at: Completed 15-06-PLAN.md (tests + architecture docs). Phase 15 ready for /gsd-verify-work.
Resume file: None
Next action: `/gsd-plan-phase 15`
