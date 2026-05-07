---
phase: 16-route-global-foundation
plan: 06
subsystem: docs
tags: [docs, R8, component-hygiene, auth-architecture, subscription-lifecycle, phase-history, tool-agnostic]

# Dependency graph
requires:
  - phase: 16-02-subscription-reshuffle
    provides: AuthProvider.tsx owns Stage 1; (authed)/layout.tsx owns Stage 2; route-group mount as structural subscription gate (documented in docs/auth/architecture.md update)
  - phase: 15.5-auth-gated-user-subscription
    provides: Pre-Phase-16 Subscription Lifecycle narrative + D-12 regression harness (preserved and re-referenced post-reshuffle)
provides:
  - "5 R8 rules codified with Good/Bad examples for Phase 17+ component/page reviewer enforcement (D-23 + D-24)"
  - "Tool-agnostic Rule 3 reframe: CSS Modules + Tailwind both demonstrated (D-25)"
  - "Subscription Lifecycle ownership narrative: AuthProvider + (authed)/layout.tsx documented as Phase-16 owners"
  - "Middleware explicitly classified as UX-only (NOT auth trust boundary)"
  - "Three-gate privacy table (projection + subscription + route-group-mount)"
  - "Phase 16 execution provenance tagged in both docs' Phase History tables"
affects: [Phase 17+, Phase 21, Phase 27, Phase 28, Phase 31, Phase 35]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Tool-agnostic R8 rule framing (D-23 reframe for Rule 3 styling-mechanism neutrality)"
    - "Three-gate privacy model: projection-based + subscription-based + route-group-mount"
    - "Architecture.md Subscription Lifecycle as authoritative ownership narrative"
    - "Phase History append-only tagging convention (CLAUDE.md)"

key-files:
  created:
    - docs/frontend/component-hygiene.md
  modified:
    - docs/auth/architecture.md

key-decisions:
  - "Rule 3 shown with BOTH CSS Modules and Tailwind examples — demonstrates the D-25 tool-neutrality discipline at the example level, not just in prose"
  - "Three-gate privacy table (vs the Phase 15.5 two-row version) in docs/auth/architecture.md Subscription Lifecycle — route-group mount is elevated to a first-class gate alongside projection + subscription gating"
  - "Rule for Future Subscriptions updated to require (authed)/layout.tsx or deeper authed-route layouts as default owners; useAuth/AuthProvider are not the target for new raw-table / per-user-view subscriptions"
  - "Middleware explicitly classified as UX-only in docs/auth/architecture.md — prevents the Phase 17+ reviewer misreading middleware.ts as an access-control layer"
  - "Zero PR-template checkbox infrastructure per D-24 — the doc IS the enforcement surface, reviewer attention per PR"
  - "No contract.md files edited — per CLAUDE.md, behavior specs are frozen during execution and updated through /gsd-verify-work; architecture.md updates during execution are sanctioned (feedback_docs_maintenance.md)"

patterns-established:
  - "Tool-agnostic R8 Rule 3 framing: 'responsive styling adjusts sizing/spacing only' treated as discipline-over-mechanism; examples span CSS Modules + Tailwind to immunize against future styling-tool swaps"
  - "Phase History row format: `| <Phase label> execution | <summary of change> | YYYY-MM-DD |` with tags that let /gsd-verify-work distinguish user-decided rows from execution-sourced rows"

requirements-completed: [FOUND-05, FOUND-06]

# Metrics
duration: 6min
completed: 2026-04-19
---

# Phase 16 Plan 06: Docs — Component Hygiene Summary

**Two docs codify the Phase 16 hygiene commitments: a new `docs/frontend/component-hygiene.md` lands the 5 R8 rules (tool-agnostic Rule 3) with Good/Bad examples for Phase 17+ reviewer enforcement, and `docs/auth/architecture.md` gets a Subscription Lifecycle rewrite reflecting Plan 02's ownership reshuffle (Stage 1 → AuthProvider, Stage 2 → (authed)/layout.tsx, route-group mount as the structural gate, middleware explicitly UX-only).**

## Performance

- **Tasks:** 2 atomic commits (f4f999e, 93da7ca).
- **Duration:** ~6 minutes (05:24:45Z → 05:30:31Z UTC).
- **Files changed:** 1 created (`docs/frontend/component-hygiene.md` — 315 lines), 1 modified (`docs/auth/architecture.md` — +25 / -10).
- **Build + typecheck:** `npm run test:typecheck` exit 0; `npm run build` exit 0 with 11 routes + middleware bundle preserved.
- **15.5 D-12 regression harness:** `test/backend/auth/auth-subscriptions.test.ts` 2/2 passed in 13.99s on fresh-DB run — unmodified from Phase 15.5, preserved across the full Phase 16 plan series (01–06).
- **Deletions:** Zero tracked files deleted in either commit (`git diff --diff-filter=D HEAD~2 HEAD` empty).

## Tasks Completed

### Task 1 — docs/frontend/component-hygiene.md (new file, commit f4f999e)

Created `docs/frontend/component-hygiene.md` as the canonical R8 enforcement surface for Phase 17+. Structure mirrors `docs/auth/architecture.md` (top H1 + `Last updated:` + H2 sections + code blocks + Phase History at the bottom per CLAUDE.md convention).

Five rules verbatim per CONTEXT D-23:

1. **Thin page files** — pages compose, don't implement business logic. Bad shows a `roster/page.tsx` fat with useState/useMemo/handlers; Good delegates to `<RosterView />`.
2. **Viewport-agnostic children** — no `useIsMobile()` inside component files. Bad shows `<TeamSlot>` calling `useIsMobile` internally; Good accepts a `size: 'sm' | 'md' | 'lg'` prop and lets the parent decide.
3. **Responsive styling adjusts sizing/spacing only (tool-agnostic)** — D-23 reframe. Bad shows `className="hidden md:block"` structurally hiding a sidebar; **two** Good examples shown side-by-side to demonstrate D-25 tool-neutrality:
   - Good CSS Modules: `@media (min-width: 768px)` adjusts padding/gap only.
   - Good Tailwind: `className="gap-2 p-4 md:gap-4 md:p-6"` — identical discipline.
   Escape hatch documented: structural reorganization requires dual-DOM via `<ViewportGate>` + `.desktop.tsx`/`.mobile.tsx` sibling files, sanctioned ONLY at Phases 27 / 31 / 35 per R4.
4. **State lives in hooks, not pages** — Bad shows a cost-tables page with inline `useState` + `useMemo` + `useEffect`; Good shows `useCostTableState()` hook + `CostTableView` component, page is ~5 lines.
5. **Layout-agnostic component props** — Bad shows `<MatchCard isInSidebarMode stackVertically leftOffset />`; Good shows `<MatchCard />` with intrinsic layout plus a separate `<MatchCardCompact />` for the sidebar variant.

Phase History signed: `| 16 execution | Initial 5 R8 rules with tool-agnostic Rule 3 + Good/Bad examples | 2026-04-18 |`.

**No PR-template checkbox infrastructure** per D-24 — `grep "^- \[ \]"` returns zero matches. The doc is the enforcement surface, reviewer attention per PR.

### Task 2 — docs/auth/architecture.md Subscription Lifecycle rewrite (commit 93da7ca)

Subscription Lifecycle section (lines 196–243) rewritten to reflect Plan 02's ownership reshuffle:

- **Section header updated** — `## Subscription Lifecycle (Phase 15.5 D-05, Phase 16 reshuffle)` (was `(Phase 15.5 D-05)` only).
- **Privacy gate table expanded from 2 rows to 3 rows** — added "Route-group mount (structural gating)" as a first-class gate alongside projection-based and subscription-based. The three gates layer.
- **Two-Stage Rule renamed** — `### The Two-Stage Rule (post-Phase-16)` (was `### The Two-Stage Rule (useAuth.ts)`). Stage 1 now owned by `components/features/auth/components/AuthProvider.tsx`; Stage 2 now owned by `app/(authed)/layout.tsx`. Per-stage prose names the exact file paths, the 15.5 source-line ranges that were relocated (`useAuth.ts:72-111` → AuthProvider; `useAuth.ts:115-181` → authed layout), and the Plan 02 decisions (D-03, D-07) that drove the moves. `onInsert`/`onUpdate` callbacks wire through `triggerReadProfile` (`@internal`) so useAuth remains the single authoritative reader via `readProfileFromConnection`.
- **useAuth.ts retained scope documented** — `readProfileFromConnection` (3-fallback reader), login/logout/Discord-link/guest-login/soft-delete state, `guestLoginPending` UX state, `hadSessionCookie` + `hadUserIdOnMount` refs (now driving only `isWaitingForData` per D-09). Lost ONLY the two subscribe effects (D-10). `setProfileReady` + `triggerReadProfile` exposed as `@internal` — consumers outside AuthProvider and (authed)/layout.tsx MUST NOT call them.
- **New `### Regression Guard` subsection** — names `test/backend/auth/auth-subscriptions.test.ts` (15.5 D-12 harness) as canonical; confirmed green unmodified across all Phase 16 plan commits (Plans 02 + 03 + 04 + 05 + 06).
- **New `### Middleware is UX-only, not an auth trust boundary` subsection** — documents the Plan 03 positive-list matcher (`/profile`, `/admin-view`, `/lobby`, `/draft/:path*`) + cookie-less redirect. Explicitly NOT an authorization gate. Real access control remains at SpacetimeDB reducer checks (`ensureVerifiedUser`, `ensureAdmin`) + view-level projection/anonymousView boundaries. Cross-references `REQUIREMENTS.md` §Out of Scope.
- **Rule for Future Subscriptions updated** — new raw-table or per-user-view subscriptions MUST be owned by `(authed)/layout.tsx` or a deeper authed-route layout (e.g., `(authed)/(match)/layout.tsx` at Phase 28), NOT by useAuth or AuthProvider. Route-group-mount is the default; runtime ref-based gates are only justifiable for a subscription that must fire before an authed layout mounts (no current case).
- **Intentional Anonymous Exceptions + Accepted Tradeoff preserved verbatim** — `view_lobby_browser` and `view_public_hsr_accounts` anonymous-by-design rationale unchanged.
- **Phase History row appended** — new `Phase 16 execution` row, zero pre-existing rows removed. `Last updated` date bumped to 2026-04-18. Feature owner line extended to `Phase 01 / Phase 12 / Phase 16`.

All other sections of `docs/auth/architecture.md` preserved byte-for-byte: Overview, Table Relationships, Reducer Flows, View Definitions, performUserDeletion Flow, resolveUserLabel Helper, API Route, Ban Enforcement (D-08), Frontend Auth Flow.

## Rule 3 Tool-Neutrality Verification

Per plan must_haves and verification criteria, Rule 3 MUST reference both CSS Modules AND Tailwind:

- `grep -n "CSS Module" docs/frontend/component-hygiene.md` → 5 matches (rule preface + Bad header + Good subsection header + closing prose + 2 others)
- `grep -n "Tailwind" docs/frontend/component-hygiene.md` → 5 matches

Both styling mechanisms get dedicated ✅ Good code blocks:
- CSS Modules: `@media (min-width: 768px) { .container { padding: 24px; gap: 16px; } }`
- Tailwind: `className="flex gap-2 p-4 md:gap-4 md:p-6"`

Prose explicitly frames the discipline as mechanism-independent: *"Both examples are valid — the mechanism (CSS Modules vs Tailwind) is a project preference (D-25). The rule is the same either way."*

## Phase History Provenance Verification

Both docs have exactly one new `Phase 16 execution` row:

- `docs/frontend/component-hygiene.md`: `| 16 execution | Initial 5 R8 rules with tool-agnostic Rule 3 + Good/Bad examples | 2026-04-18 |`
- `docs/auth/architecture.md`: `| Phase 16 reshuffle: ... | Phase 16 execution | 2026-04-18 |` (one new row appended; pre-existing 15 rows preserved)

Column orders differ by file (component-hygiene uses `Phase | Change | Date`; architecture uses `Decision | Source | Date` per its established template). Plan Task 2 action step 4 explicitly allowed matching the existing file's column order — honored.

## Contract.md Non-Modification

Per CLAUDE.md "Never modify behavior specs (`docs/*/contract.md`) during execution" + feedback_doc_updates_human_gated.md:

- Zero `docs/*/contract.md` files edited.
- Auth contract (`docs/auth/contract.md`) untouched — if the Phase 16 reshuffle warrants a contract addition, it's a `/gsd-verify-work` checkpoint decision, not an execution-time edit.
- `docs/auth/architecture.md` IS sanctioned for execution-time edits per feedback_docs_maintenance.md — confirmed and honored in Task 2.

## Verification Gates (from plan)

| Gate | Result |
|------|--------|
| `[ -f docs/frontend/component-hygiene.md ]` | PASS |
| `grep -cE "^## Rule [1-5]"` = 5 | PASS (5 rules) |
| Rule 3 references both CSS Modules AND Tailwind | PASS (5 + 5 matches) |
| Both docs have `Phase 16 execution` Phase History row | PASS |
| Subscription Lifecycle mentions AuthProvider + (authed)/layout.tsx + route-group mount | PASS (4 + 5 + 3 matches) |
| `npm run build` exit 0 | PASS |
| `npm run test:typecheck` exit 0 | PASS |
| 15.5 harness `auth-subscriptions.test.ts` 2/2 green | PASS (13.99s run) |

## Deviations from Plan

**None.** Plan executed exactly as written. No Rule 1/2/3 auto-fixes triggered (docs-only work; no code paths touched; no build/typecheck gate fired a surprise).

## Requirements Completed

- **FOUND-05** — Subscription Lifecycle documentation updated to reflect Plan 02 ownership reshuffle.
- **FOUND-06** — docs/frontend/component-hygiene.md ships the R8 enforcement surface.

## Commits

- `f4f999e` — `docs(frontend): add 5 R8 component-hygiene rules with Good/Bad examples (D-23)` (1 file, +315)
- `93da7ca` — `docs(auth): update Subscription Lifecycle for Phase 16 ownership reshuffle` (1 file, +25 / -10)

## Self-Check: PASSED

**Created files exist:**
- `docs/frontend/component-hygiene.md` — FOUND (315 LOC)

**Modified files changed:**
- `docs/auth/architecture.md` — MODIFIED (+25 / -10)

**Commits exist in git log:**
- `f4f999e` — FOUND on feature_nath_claude
- `93da7ca` — FOUND on feature_nath_claude

Phase 16 now complete at 46/46 plans.
