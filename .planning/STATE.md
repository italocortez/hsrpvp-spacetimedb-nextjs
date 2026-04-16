---
gsd_state_version: 1.0
milestone: v0.9
milestone_name: Frontend — Phase Summary
current_phase: 15.5
current_plan: 1
status: executing
stopped_at: Phase 15.5 context gathered (5 decisions locked)
last_updated: "2026-04-16T21:53:42.741Z"
last_activity: 2026-04-16
progress:
  total_phases: 32
  completed_phases: 4
  total_plans: 23
  completed_plans: 19
  percent: 83
---

# Session State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-12)

**Core value:** Players can organize, play, and track competitive HSR matches and tournaments in one place — from drafting to scoring to leaderboards — without relying on external tools.
**Current focus:** Phase 15.5 — auth-gated-user-subscription

## Position

**Milestone:** v0.9 Frontend (phases 15–41, plus 12 deferred MOBILE XX.1 phases)
**Current phase:** 15.5
**Current plan:** 1
**Status:** Executing Phase 15.5
**Last activity:** 2026-04-16

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

- [Phase 15.1]: D-01 honored: sibling-block cost shape (classic+auction optional sub-blocks) in both char and lc templates
- [Phase 15.1]: D-09 permutations distributed: entry-1=P1(classic-only), entry-2=P2+P3+P4 in each template file
- [Phase 15.1]: D-17 honored: README transform tables rewritten to sibling-block shape; L84 placeholder deleted
- [Phase 15.1]: D-02/D-13 honored: pairing section untouched in Plan 02 README rewrite
- [Phase 15.1]: D-06/D-07/D-08/D-09/D-10 honored: sibling-block extractor with zero-pad on insert and no classic→auction copy in both seed pipelines
- [Phase 15.1]: D-11/D-12 honored: local test/data/*.json re-migrated to sibling-block shape on disk only; gitignored path never committed
- [Phase 15.1]: D-15/D-16 guard confirmed: no reducer, validation, or reader source file in Plan 03 diff
- [Phase 15.1]: D-18 test split: scenarios 1/2/3/5 in seed-cost-extraction.test.ts; D-18-4 in partial-update.test.ts; D-06 null-semantics: validateKeys requires all keys present, null is the preserve signal
- [Phase 15.1]: D-19 guardrail confirmed: cost-set-lifecycle.test.ts and cost-set-pk.test.ts pass unchanged (15/15 tests, zero Phase 15.1 commits on either file)
- [Phase 15.4-cost-table-draftmode-restructure]: Plan 04: rewrote 6 cost-table integration tests + added synergy auction round-trip (first-ever D-25a); full suite 58/58 files, 615/615 tests green; Pitfall 1/6/7 regression guards in place; validateKeys rejects missing draftMode key on all 3 cost tables
- [Phase 15.2]: D-02: isPrivate removed from User schema everywhere — dead code, never read for gating
- [Phase 15.2]: D-05: DeletedUser private archive table created with public: false, 4 columns, no audit columns
- [Phase 15.2]: D-13/D-14: deletedAt: undefined retained in insert payloads — SpacetimeDB insert type requires option() keys present even as undefined
- [Phase 15.2]: Binding files manually trimmed of isPrivate for TSC compliance; full spacetime generate deferred to Plan 04
- [Phase 15.2]: D-06: view_user_directory uses spacetimedb.view() — anonymous rejection is framework-level, no explicit auth check in view body needed
- [Phase 15.2]: D-10: admin_ban_user actor is admin.id; clientConnected actor is user.id — both R1 bug sites now insert UserDeletionJob scheduled 5s out
- [Phase 15.2]: D-09: non-guest deletion is evict-and-hard-delete; ghost accumulation in User table eliminated
- [Phase 15.2]: D-12: resolveUserLabel returns struct for future badge use; 5 call sites migrated
- [Phase 15.2]: schema.ts registration required for all tables — DeletedUser missed in Plan 01, fixed in Plan 03
- [Phase 15.2]: D-17 eviction: verified user isGuest=false always hits eviction branch; mmr_history SQL INSERT not needed to exercise the path
- [Phase 15.2]: D-16/D-19 clientConnected: Pitfall-8 structural pattern applied; reconnect-race test deferred to Phase 16+ harness infrastructure
- [Phase 15.2]: contract.md deferred to gsd-verify-work per CLAUDE.md; all Phase 15.2 contract entries must be tagged 'Phase 15.2 execution'

### Roadmap Evolution

- Phase 15.1 inserted after Phase 15: Auction Cost Template Extension (URGENT) — template JSON shape and seed normalization gap; schema + admin router already auction-aware.
- Phase 15.2 inserted after Phase 15: User Directory View Performance (DEFERRED) — `view_user_directory` iter()+JS filter is acceptable at v0.9-v1.0 scale (~100 users baseline). Revisit at 1k+ users; consider `User.isActive: bool` btree (Option B) or materialized `ActiveUserDirectory` table (Option C). Reviewer's suggested `User.deletedAt` btree won't work — SpacetimeDB btrees can't filter on `IS NULL`.
- Phase 15.3 inserted after Phase 15: Audit Spread Type Helper (REFACTOR) — extract `insertWithAudit<T>()` and `updateWithAudit<T>()` helpers in `spacetimedb/src/helpers/auditHelpers.ts`. Migrate 323 `auditInsert`/`auditUpdate` spread sites across 56 files. Eliminates ~50-100 `as any` suppressions. Pure refactor, zero behavior change. Single big-bang publish at end.
- Phase 15.4 inserted after Phase 15 (2026-04-14): Cost-table draftMode restructure (FOUNDATION) — replace `classicCosts` + `auctionBaseBid` columns on `HsrCharacterCost`/`HsrLightconeCost` with single `costs` struct + `draftMode: DraftMode` column; add `draftMode` to `HsrSynergyCost` (introduces synergy auction support); extend PK tuples; rewrite `admin_bulk_upsert` 3 cases, 3 `edit_draft_*` reducers, 3 readers (`draftClassic.ts`, `draftAuction.ts`, `postDraft.ts`), 3 frontend hooks; regenerate module bindings; rewrite all cost-related tests (cost-set-lifecycle, cost-set-pk, seed-cost-extraction, partial-update). Blocks Phase 16 + Phase 17. **Elevated priority:** run BEFORE 15.2 and 15.3 — the bindings regen would invalidate any pre-restructure work in those phases.
- Phase 15.5 inserted after Phase 15 (2026-04-16): Auth-Gated User Subscription (URGENT) — close the real bandwidth leak uncovered during Phase 15.2 UAT Test 4: frontend `useAuth.ts:38` fires `SELECT * FROM user` unconditionally on connection, pre-auth. Split into two-stage subscription (Stage 1 `view_my_profile` always; Stage 2 gated on `currentUser != null || hadTokenOnMount`). Retire the now-cosmetic `view_user_directory` (zero client subscribers, no server-side rejection possible — SpacetimeDB `view` vs `anonymousView` only toggles data access, not caller rejection). Promotes seed `.planning/seeds/phase-15.5-auth-gated-user-subscription.md`; CONTEXT.md bootstrapped on insertion. Phase 16 FOUND-03 handoff must be re-scoped in Phase 16 discussion.

- [Phase 15]: Move-only view reorg: all 32 existing views split into 8 domain files matching tables/ layout; binding surface unchanged.
- [Phase 15]: Plan 02: Spine (skelUrl/atlasUrl/atlasImgUrls) + positioning (posX/posY/width) columns added to hsr_character; schema live on maincloud; bindings regenerated. Admin router + seed pipeline reworks handled by Plans 03 and 05.
- [Phase 15-backend-pre-work]: Plan 03: admin_bulk_upsert reworked — null=preserve partial-update semantics across 5 cases; costSetId now part of composite match tuple for all 3 cost tables; Spine + positioning columns editable via existing router (no new reducer per D-11). FOUND-01 editing half complete.
- [Phase 15-backend-pre-work]: Plan 04: 5 self-scoped history views (view_my_match_session_history, view_my_match_session_step_history, view_my_match_participant_history, view_my_mmr_history, view_my_match_result_game_history) added to matchHistoryViews.ts; bindings regenerated (32 -> 37); ROADMAP + REQUIREMENTS canonicalised per D-14. FOUND-02 schema half complete.
- [Phase 15-backend-pre-work]: Plan 05: seed pipeline rewritten to D-22 snake_case shape — scripts/seed-data.ts + test/shared/seed-data.ts both consume cost_set_id + 3-mode blocks + positioning + Spine fields. 3-mode fan-out for characters (21 rows), lightcones (15), pairings (3). cost.cost_set_id lifts to each row's costSetId honoring Plan 03's composite-PK tuple match. Audit clean on test/shared/fixtures.ts and scripts/post-publish.ts (no old-shape references).
- [Phase 15-backend-pre-work]: Plan 06: 5 integration test files + 1 shared two-identity harness + 3 architecture docs (docs/admin, docs/views, NEW docs/match) land the regression guards and architectural memory for FOUND-01 + FOUND-02. Wave-0 spike confirmed conn.db.view_my_X.iter() works for all 5 new views. Isolation tests use invariants I1-I4 (userId match, subset-of-backing-SQL, fresh-user-sees-empty, no-cross-user-leakage) — strictly stronger than full-flow match seeding for the filter-logic property. Full suite 30/30 green in 42.6s (including 29/30 on first full-DB-reseed run, with 3 SpacetimeDB SQL dialect quirks auto-fixed). nyquist_compliant: true. Phase 15 ready for /gsd-verify-work.

## Quick Tasks Completed

| ID | Date | Description | Commits |
|----|------|-------------|---------|
| 260414-sg8 | 2026-04-15 | Doc-update checkpoint in `/gsd-verify-work` — detect touched features from phase commits, prompt per-feature for architecture.md/contract.md updates, block completion until answered. Structural enforcement of the CLAUDE.md Backend Feature Docs rules. | d169f3e, 741934b |

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

Last session: 2026-04-16T20:47:25.186Z
Stopped at: Phase 15.5 context gathered (5 decisions locked)
Resume file: .planning/phases/15.5-auth-gated-user-subscription/15.5-CONTEXT.md
Next action: `/gsd-discuss-phase 15.5` (in progress)
