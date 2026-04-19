---
phase: 16-route-global-foundation
plan: 06
type: execute
wave: 2
depends_on: [02]
files_modified:
  - docs/frontend/component-hygiene.md
  - docs/auth/architecture.md
autonomous: true
requirements: [FOUND-05, FOUND-06]

must_haves:
  truths:
    - "docs/frontend/component-hygiene.md exists with 5 R8 rules each illustrated with Good/Bad examples"
    - "Rule 3 in component-hygiene.md is reframed tool-agnostic (no Tailwind-specific language; covers CSS Modules media queries, Tailwind utilities, or any other mechanism) per D-23"
    - "docs/frontend/component-hygiene.md Phase History table has one entry tagged 'Phase 16 execution'"
    - "docs/auth/architecture.md Subscription Lifecycle section updated to reflect Phase 16 ownership: AuthProvider owns Stage 1; (authed)/layout.tsx owns Stage 2"
    - "docs/auth/architecture.md Phase History table has a new row tagged 'Phase 16 execution'"
  artifacts:
    - path: "docs/frontend/component-hygiene.md"
      provides: "5 R8 rules for Phase 17+ component-design enforcement, with Good/Bad examples and a tool-agnostic Rule 3 reframe"
      contains: "Thin page files"
      min_lines: 100
    - path: "docs/auth/architecture.md"
      provides: "Updated Subscription Lifecycle section documenting the Phase 16 ownership reshuffle"
      contains: "AuthProvider"
  key_links:
    - from: "docs/frontend/component-hygiene.md"
      to: ".planning/research/DECISIONS.md R8"
      via: "inline D-23 + R8 references"
      pattern: "R8|D-23"
    - from: "docs/auth/architecture.md Subscription Lifecycle"
      to: "components/features/auth/components/AuthProvider.tsx (Plan 02 output)"
      via: "prose reference + file-path mention"
      pattern: "AuthProvider|authedLayout"
---

<objective>
Ship the documentation that the engineering phases (17-41) depend on:
1. NEW `docs/frontend/component-hygiene.md` — the 5 R8 rules per D-23, tool-agnostic Rule 3 per the user's styling-flexibility concern (D-25), with Good/Bad example pairs each and a Phase History table per CLAUDE.md convention.
2. UPDATE `docs/auth/architecture.md` — Subscription Lifecycle section reflects the Phase 16 ownership reshuffle (Stage 1 AuthProvider / Stage 2 (authed)/layout.tsx replacing 15.5's useAuth-owned stages).

No PR-template infrastructure (D-24). Doc is the enforcement surface; reviewer attention per-PR.

This plan depends on Plan 02 because it documents the subscription reshuffle Plan 02 performs. Plan 06 MUST NOT ship before Plan 02 lands — the docs would describe non-existent code.

Purpose: Deliver the R8 enforcement surface for Phase 17+ (via component-hygiene.md) and the subscription-lifecycle authoritative narrative update. No FOUND-ID directly owns documentation, but these docs describe the Plan 02 work (FOUND-05, FOUND-06) and the broader R8 commitment surfaced through Phase 16.
Output:
- `docs/frontend/component-hygiene.md` (new file, ~120 LOC)
- `docs/auth/architecture.md` (update to Subscription Lifecycle section)
- Both files signed with `Phase 16 execution` Phase History entries per CLAUDE.md convention
</objective>

<execution_context>
@D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/get-shit-done/workflows/execute-plan.md
@D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/16-route-global-foundation/16-CONTEXT.md
@.planning/phases/16-route-global-foundation/16-RESEARCH.md
@.planning/phases/16-route-global-foundation/16-PATTERNS.md
@.planning/phases/15.5-auth-gated-user-subscription/15.5-04-SUMMARY.md
@.claude/CLAUDE.md
@docs/auth/architecture.md

<interfaces>
<!-- R8 rules per CONTEXT D-23 and ROADMAP Cross-Phase Commitments R8. -->

The 5 R8 rules (verbatim from CONTEXT D-23):
1. **Thin page files** — pages compose, don't implement business logic.
2. **Viewport-agnostic children** — no `useIsMobile` or similar hook calls inside component files.
3. **[Reframed, tool-agnostic]** Responsive styling — via CSS Modules media queries, Tailwind utilities, or any other mechanism — adjusts sizing/spacing only. Never use responsive styles to reorder sections, swap grid-vs-stack, or hide major content blocks. Structural reorganization requires either a single responsive layout that works at all widths OR a dual-DOM split (R4).
4. **State lives in hooks, not pages.**
5. **Layout-agnostic component props.**

Good/Bad framing guidance per PATTERNS.md §docs/frontend/component-hygiene.md:
- Each rule gets one ❌ Bad example + one ✅ Good example.
- Examples MUST use project idioms (TypeScript + React + existing component conventions) — not pseudo-code.
- Bad examples are short; the point is to show the failure mode, not write a novel.
- Good examples include the "why" inline as a 1-line comment.

Tool-agnostic Rule 3 examples — these MUST show at least two styling mechanisms (CSS Modules AND Tailwind) to demonstrate neutrality:
- Good CSS Modules example: media query adjusts font-size / padding only
- Good Tailwind example: responsive utility adjusts gap / sizing only
- Bad example (applies to both): responsive utility hides a whole section on mobile (structural reorganization → dual-DOM required)

Phase History table format (CLAUDE.md convention):
```markdown
## Phase History
| Phase | Change | Date |
|-------|--------|------|
| 16 execution | Initial 5 R8 rules with tool-agnostic Rule 3 + Good/Bad examples | 2026-04-18 |
```
CLAUDE.md line: "After execution completes, update the contract with any additions — tag every new entry with `Phase X execution` in the Phase History table so the user can distinguish their decisions from Claude's."

docs/auth/architecture.md update scope (per PATTERNS.md §docs/auth/architecture.md):
- Existing file has a "Subscription Lifecycle" section added during 15.5.
- The section needs Phase 16 updates:
  - Stage 1 owner: `useAuth.ts:72-111` → `AuthProvider.tsx` (view_my_profile subscribe + callbacks)
  - Stage 2 owner: `useAuth.ts:115-181` → `app/(authed)/layout.tsx` (User subscribe + onUserInsert/onUserUpdate callbacks)
  - Privacy gate: ref-based `stage2Gate` → route-group mount (structural gate)
  - Call out that `test/backend/auth/auth-subscriptions.test.ts` remains the regression guard (D-12 harness unmodified).
  - Note that middleware is UX-only and NOT part of the authz trust boundary (cross-reference REQUIREMENTS.md Out of Scope).
- Append a new `Phase 16 execution` row to the Phase History table at the bottom of the file.

Existing file to preserve bytes of (non-Subscription-Lifecycle sections):
- Auth flow diagrams
- OAuth / Discord linking narrative
- Soft-delete handling section
- Guest identity section
These are preserved verbatim unless a Phase 16 decision directly contradicts a claim (unlikely — Phase 16 is a relocation, not a protocol change).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create docs/frontend/component-hygiene.md with 5 R8 rules + Good/Bad examples</name>
  <files>docs/frontend/component-hygiene.md</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/docs/auth/architecture.md (structural template — top H1 + Last-updated + H2/H3 sections)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/docs/_templates/architecture-template.md (if exists — structural template for feature docs)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/ROADMAP.md (Cross-Phase Commitments §R8 wording)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-23 full 5-rule list with Rule 3 reframe; D-24 no-PR-template decision; D-25 styling-tool-agnostic mandate)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§docs/frontend/component-hygiene.md — lines 773-797)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/CLAUDE.md (Phase History table convention)
  </read_first>
  <action>
1. Create the directory if it doesn't exist: `mkdir -p docs/frontend`.
2. Create `docs/frontend/component-hygiene.md`. Top matter:
   ```markdown
   # Component Hygiene — v0.9 Frontend Guidelines

   **Last updated:** 2026-04-18
   **Status:** Active — enforced starting Phase 16 onwards.
   **Source of truth:** `.planning/research/DECISIONS.md` R8 (cross-phase commitment) + `.planning/phases/16-route-global-foundation/16-CONTEXT.md` D-23.

   ## Overview

   Five rules that every Phase 17+ component / page PR must satisfy. Reviewer attention is the enforcement surface per D-24 (no PR-template checkbox infrastructure).

   These rules keep component code simple, testable, and refactor-safe as we ship ~25 UX phases on top of the Phase 16 foundation.
   ```
3. For each of the 5 R8 rules, write an H2 section with:
   - The rule statement
   - A 1-2 paragraph "why this matters"
   - ❌ Bad example (TypeScript/JSX, realistic)
   - ✅ Good example (TypeScript/JSX, realistic) with inline "why" comment
4. Rule-by-rule content (executor fills in example bodies; rule statements are verbatim from D-23):

   ### Rule 1 — Thin page files
   - Why: Page files are route entry points. Deep business logic inside a `page.tsx` is hard to test in isolation, hard to reuse, and couples the page to the logic.
   - ❌ Bad: `page.tsx` with 200 lines of useState/useEffect/business-logic branching.
   - ✅ Good: `page.tsx` imports `<FeatureA />` / `<FeatureB />` and composes them; logic lives in `useFeatureA()` hooks and `FeatureA.tsx` component files.

   ### Rule 2 — Viewport-agnostic children
   - Why: Components that know their viewport class couple themselves to the device and resist reuse. `useIsMobile()` inside a component file is a smell.
   - ❌ Bad: `<TeamSlot>` component internally calls `const isMobile = useIsMobile();` and branches rendering.
   - ✅ Good: `<TeamSlot>` accepts a `size: 'sm' | 'md' | 'lg'` prop; the parent page decides which size based on layout. For dual-DOM (Phases 27/31/35), ViewportGate at the page level picks the sibling; the children stay layout-agnostic.

   ### Rule 3 — Responsive styling adjusts sizing/spacing only (tool-agnostic)
   - Why per D-23 reframe: we may not keep Tailwind or HeroUI forever (D-25). Responsive mechanism is irrelevant; the discipline is what matters. Never use responsive styles to REORDER, SWAP structural layout, or HIDE major content — that's a dual-DOM split if it's important, or a single-layout-that-works-at-all-widths if it isn't.
   - Acceptable mechanisms: CSS Modules media queries, Tailwind responsive utilities, CSS-in-JS breakpoints, or any future mechanism.
   - ❌ Bad: `className="hidden md:block"` hides a whole sidebar on mobile (structural reorganization). Use dual-DOM split instead (Phase 27/31/35) or a layout that accommodates both widths.
   - ✅ Good CSS Modules: `.container { padding: 8px; } @media (min-width: 768px) { .container { padding: 24px; } }` — sizing/spacing only.
   - ✅ Good Tailwind: `className="gap-2 md:gap-4 p-4 md:p-6"` — sizing/spacing only.
   - Dual-DOM escape hatch: when structural reorganization IS needed (day-view vs week-view calendar, stacked-vs-side-by-side draft pedestal, round-by-round-vertical-swipe-vs-horizontal-bracket), use the `<ViewportGate>` primitive + `.desktop.tsx` / `.mobile.tsx` sibling files per R4. Those are the 3 sanctioned dual-DOM phases; every other page ships single-DOM.

   ### Rule 4 — State lives in hooks, not pages
   - Why: Pages are route entries; testing a page requires a router context, a provider tree, and a real route. Hooks are testable in isolation with renderHook().
   - ❌ Bad: `page.tsx` with `const [filter, setFilter] = useState(...)` + `const filtered = useMemo(...)` + 5 other state pieces + derived state computations.
   - ✅ Good: `page.tsx` calls `const { filter, setFilter, rows } = useCostTableState();` — the hook owns state + derivations.

   ### Rule 5 — Layout-agnostic component props
   - Why: Component props shouldn't encode positional assumptions. A component that accepts `leftSidebarWidth` or `isInHeaderRow` couples itself to a specific parent layout and can't be reused.
   - ❌ Bad: `<MatchCard isInSidebarMode={true} stackVertically />` — positional flags bleed into the component.
   - ✅ Good: `<MatchCard />` has its own intrinsic layout; parent wraps it in whatever container needs (flex/grid/stack). If two contexts need different presentations, create `<MatchCardCompact>` as a distinct component.

5. Close with a Phase History table:
   ```markdown
   ## Phase History
   | Phase | Change | Date |
   |-------|--------|------|
   | 16 execution | Initial 5 R8 rules with tool-agnostic Rule 3 + Good/Bad examples | 2026-04-18 |
   ```
6. No PR-template checkbox list (D-24). Doc enforcement is reviewer discretion.
7. Commit: `docs(frontend): add 5 R8 component-hygiene rules with Good/Bad examples (D-23)`.
  </action>
  <verify>
    <automated>ls docs/frontend/component-hygiene.md</automated>
  </verify>
  <acceptance_criteria>
    - File `docs/frontend/component-hygiene.md` exists.
    - `grep -cE "^## Rule [1-5]" docs/frontend/component-hygiene.md` returns exactly 5.
    - `grep -nE "Thin page files" docs/frontend/component-hygiene.md` returns at least one match (Rule 1 statement).
    - `grep -nE "Viewport-agnostic" docs/frontend/component-hygiene.md` returns at least one match (Rule 2).
    - `grep -nE "Responsive styling" docs/frontend/component-hygiene.md` returns at least one match (Rule 3 — tool-agnostic reframe).
    - `grep -nE "State lives in hooks" docs/frontend/component-hygiene.md` returns at least one match (Rule 4).
    - `grep -nE "Layout-agnostic" docs/frontend/component-hygiene.md` returns at least one match (Rule 5).
    - `grep -cE "^❌|❌ Bad|### ❌" docs/frontend/component-hygiene.md` returns at least 5 (one bad example per rule).
    - `grep -cE "^✅|✅ Good|### ✅" docs/frontend/component-hygiene.md` returns at least 5 (one good example per rule).
    - Rule 3 references BOTH CSS Modules AND Tailwind to demonstrate tool neutrality: `grep -n "CSS Module" docs/frontend/component-hygiene.md` AND `grep -n "Tailwind" docs/frontend/component-hygiene.md` each return at least one match.
    - Phase History table exists and mentions `Phase 16 execution`: `grep -nE "Phase History|16 execution" docs/frontend/component-hygiene.md` returns at least 2 matches (header + entry).
    - No PR-template / checkbox infrastructure: `grep -nE "^- \\[ \\]" docs/frontend/component-hygiene.md` returns zero matches.
  </acceptance_criteria>
  <done>
    `docs/frontend/component-hygiene.md` ships with 5 R8 rules, each with ❌ Bad + ✅ Good example, Rule 3 demonstrates tool neutrality (CSS Modules + Tailwind both referenced), Phase History table signed with `Phase 16 execution`, no PR-template content. Atomic commit made.
  </done>
</task>

<task type="auto">
  <name>Task 2: Update docs/auth/architecture.md Subscription Lifecycle section to reflect Phase 16 ownership reshuffle</name>
  <files>docs/auth/architecture.md</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/docs/auth/architecture.md (the file being modified — locate "Subscription Lifecycle" section; confirm existing Phase History table structure)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§docs/auth/architecture.md — lines 800-812)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-03, D-07, D-10, D-11, D-12, D-13, D-14 — the reshuffle specifics)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-02-SUMMARY.md (Plan 02 SUMMARY — confirms what was actually shipped; cross-reference actual code paths)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/CLAUDE.md (Phase History convention; "Never modify behavior specs (`docs/*/contract.md`) during execution" — this is architecture.md, NOT contract.md, so updates during execution are fine per feedback_docs_maintenance.md)
  </read_first>
  <action>
1. Open `docs/auth/architecture.md`. Locate the "Subscription Lifecycle" section (added during Phase 15.5).
2. Update the section content to reflect the Phase 16 ownership reshuffle. Key points to cover in prose:
   - **Stage 1 ownership relocated:** view_my_profile subscribe effect moved from `components/features/auth/hooks/useAuth.ts:72-111` into `components/features/auth/components/AuthProvider.tsx`. Rationale: AuthProvider is already a child of SpacetimeDBProvider in providers.tsx — the intent "providers.tsx owns view_my_profile" is now satisfied structurally without changing providers.tsx itself.
   - **Stage 2 ownership relocated:** User subscribe effect + onUserInsert/onUserUpdate callbacks moved from `useAuth.ts:115-181` into `app/(authed)/layout.tsx`. Rationale: the route-group mount IS the new privacy gate — anonymous visitors never reach the authed layout, so the old ref-based `stage2Gate` check is no longer needed. Structurally simpler.
   - **useAuth.ts retained:** `readProfileFromConnection` (3-fallback reader), login/logout/Discord/guest/soft-delete state, `guestLoginPending` narrow state, `hadSessionCookie` + `hadUserIdOnMount` refs (now driving only `isWaitingForData` per D-09). useAuth.ts lost ONLY the two subscribe effects per D-10.
   - **Gate model:** projection-vs-subscription privacy distinction from 15.5 still holds. Phase 16 adds "route-group mount timing" as a third gate mechanism (distinct from server-side projection and subscription-timing refs). The `(authed)/layout.tsx` subscription-timing pattern IS the new gate — structural rather than runtime ref bookkeeping.
   - **Regression guard:** `test/backend/auth/auth-subscriptions.test.ts` (15.5 harness) remains the canonical regression guard. D-12 requires it passes unmodified after the reshuffle — Plan 02 confirmed this.
   - **Middleware clarification:** `middleware.ts` (new in Plan 03) is UX-only redirect logic, NOT an auth trust boundary. Real access control lives in SpacetimeDB RLS at the reducer/view level. Cross-reference REQUIREMENTS.md Out of Scope "Middleware as auth trust boundary".
3. Preserve all other sections of `docs/auth/architecture.md` byte-for-byte — only Subscription Lifecycle prose changes in this task. Auth flow diagrams, OAuth narrative, soft-delete handling, guest identity sections are untouched.
4. Append to the Phase History table at the bottom of the file:
   ```markdown
   | 16 execution | Subscription Lifecycle section updated: Stage 1 → AuthProvider, Stage 2 → (authed)/layout.tsx; route-group-mount gate replaces ref-based stage2Gate. Middleware clarified as UX-only. | 2026-04-18 |
   ```
   If the Phase History table's column order differs from "Phase | Change | Date", match the existing file's order.
5. Commit: `docs(auth): update Subscription Lifecycle for Phase 16 ownership reshuffle`.
  </action>
  <verify>
    <automated>grep -n "Phase 16 execution" docs/auth/architecture.md</automated>
  </verify>
  <acceptance_criteria>
    - `grep -n "Phase 16 execution\\|16 execution" docs/auth/architecture.md` returns at least one match (new Phase History entry).
    - `grep -n "AuthProvider" docs/auth/architecture.md` returns at least one match (Stage 1 owner name).
    - `grep -nE "\\(authed\\)/layout\\.tsx|authedLayout" docs/auth/architecture.md` returns at least one match (Stage 2 owner name).
    - `grep -nE "route-group mount|route-group-mount|route group mount" docs/auth/architecture.md` returns at least one match (the new gate mechanism narrative).
    - `grep -nE "UX-only|UX optimization" docs/auth/architecture.md` returns at least one match (middleware-not-trust-boundary clarification).
    - `grep -n "auth-subscriptions.test.ts" docs/auth/architecture.md` returns at least one match (D-12 regression guard reference).
    - No removal of pre-existing Phase History rows: `grep -c "^| [0-9]" docs/auth/architecture.md` (or similar row pattern) returns strictly more rows than the pre-edit file (one new entry appended, zero removed). Manual check: compare `git diff docs/auth/architecture.md` row changes vs the Phase History table — should show pure-addition diff for that table.
  </acceptance_criteria>
  <done>
    `docs/auth/architecture.md` Subscription Lifecycle section reflects Plan 02's actual shipped ownership: AuthProvider owns Stage 1, (authed)/layout.tsx owns Stage 2, route-group mount is the structural gate, middleware is UX-only. Phase History table has a new `Phase 16 execution` row. Other sections untouched. Atomic commit made.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Documentation → human developer / reviewer | `docs/frontend/component-hygiene.md` is the R8 enforcement surface per D-24. Trust relationship is "reviewer reads before merging". |
| Documentation → code | `docs/auth/architecture.md` describes code ownership; drift between doc and code is the failure mode. Phase History column tags the drift-sensitive entries with their source phase. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16-06-01 | T (Tampering) | Doc drifts from code as Phase 17+ lands | mitigate | CLAUDE.md: "docs/{feature}/architecture.md on every backend change" convention + `/gsd-verify-work` doc-update checkpoint detects touched feature dirs. Component-hygiene.md is author-reviewed per PR; drift detection is human-in-the-loop by design (feedback_doc_updates_human_gated.md rejects AST/timestamp automation). |
| T-16-06-02 | I (Information Disclosure) | Doc reveals internal security framing ("middleware is UX only; SpacetimeDB RLS is the real gate") | accept | This framing is already in REQUIREMENTS.md Out of Scope publicly; doc restates it for developer context. Not a new disclosure. |
| T-16-06-03 | D (Denial of Service) | Non-coding doc plan blocks merge of phase | accept | Plan 06 is the lightest plan in the phase (no build / typecheck gate that can fail); primary risk is writer productivity. Wave C parallelism with Plans 05 means schedule-parallel anyway. |
</threat_model>

<verification>
After both tasks land:
1. `[ -f docs/frontend/component-hygiene.md ]` — new doc exists.
2. `grep -cE "^## Rule [1-5]" docs/frontend/component-hygiene.md` — exactly 5 rules.
3. Rule 3 references both CSS Modules AND Tailwind (tool neutrality).
4. Both docs have Phase History rows tagged `Phase 16 execution`.
5. `docs/auth/architecture.md` Subscription Lifecycle section mentions AuthProvider + (authed)/layout.tsx + route-group mount gate.
6. `npm run build && npm run test:typecheck` — still green (docs changes don't affect compile, but run as sanity).
7. 15.5 harness: `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` — still green.
</verification>

<success_criteria>
- `docs/frontend/component-hygiene.md` ships with 5 R8 rules, each with ❌ Bad + ✅ Good examples, tool-neutral Rule 3 covering CSS Modules + Tailwind.
- No PR-template checkbox infrastructure (D-24).
- `docs/auth/architecture.md` Subscription Lifecycle section updated to reflect Plan 02 ownership reshuffle (Stage 1 → AuthProvider; Stage 2 → (authed)/layout.tsx; route-group-mount gate).
- Both docs signed with `Phase 16 execution` Phase History entries per CLAUDE.md convention.
- No modifications to behavior-spec (`contract.md`) files during execution per CLAUDE.md (this plan only touches architecture.md + new component-hygiene.md).
- Build + typecheck + 15.5 harness all still green (sanity).
</success_criteria>

<output>
After completion, create `.planning/phases/16-route-global-foundation/16-06-SUMMARY.md` documenting:
- Confirmation that Rule 3 references both CSS Modules and Tailwind.
- Confirmation that both files have a `Phase 16 execution` row in Phase History.
- Line count of docs/frontend/component-hygiene.md (target ~120).
- Note: no contract.md files edited (CLAUDE.md Backend Feature Docs rule — execution-phase doc edits go through /gsd-verify-work checkpoint for contract.md; architecture.md can be updated during execution per feedback_docs_maintenance.md).
</output>
