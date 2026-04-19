# Component Hygiene — v0.9 Frontend Guidelines

**Last updated:** 2026-04-18
**Status:** Active — enforced starting Phase 16 onwards.
**Source of truth:** `.planning/research/DECISIONS.md` R8 (cross-phase commitment) + `.planning/phases/16-route-global-foundation/16-CONTEXT.md` D-23.

## Overview

Five rules that every Phase 17+ component / page PR must satisfy. Reviewer attention is the enforcement surface per D-24 — no PR-template checkbox infrastructure, no AST-based linter. The rules are narrow and grep-friendly on purpose so "does this PR follow R8?" can be answered by reading the diff.

These rules keep component code simple, testable, and refactor-safe as we ship ~25 UX phases on top of the Phase 16 foundation (route groups, viewport primitives, subscription reshuffle, middleware, service worker). Phase 17 is the first consumer; every subsequent UX phase inherits them.

Cross-reference: R8 is one of 11 v0.9 cross-phase commitments — see `.planning/ROADMAP.md` §Cross-Phase Commitments for the full list (R1 through R11).

## Rule 1 — Thin page files

Pages compose, don't implement business logic.

A `page.tsx` is a route entry point: its job is to name the route's shape and delegate. Deep state management, data fetching coordination, or branching business rules inside a page file make it hard to test in isolation (you need a router context, a provider tree, and a real route path), hard to reuse across two routes that need the same feature, and tightly coupled to the route's URL shape. When the same feature needs to appear inside a modal, a second page, or an admin view, a thin page file refactors trivially; a fat one has to be surgically disassembled.

The feature logic belongs in feature component files (`components/features/{feature}/components/*.tsx`) and hooks (`components/features/{feature}/hooks/use*.ts`). The page file imports and composes them.

### ❌ Bad

```tsx
// app/(authed)/roster/page.tsx
'use client';

export default function RosterPage() {
  const [filter, setFilter] = useState<'all' | 'owned' | 'unowned'>('all');
  const [sortKey, setSortKey] = useState<'name' | 'rarity'>('name');
  const { data: characters } = useTable('HsrCharacter');
  const { data: owned } = useTable('HsrAccountCharacter');

  const filtered = useMemo(() => {
    if (filter === 'owned') return characters.filter(c => owned.some(o => o.characterId === c.id));
    if (filter === 'unowned') return characters.filter(c => !owned.some(o => o.characterId === c.id));
    return characters;
  }, [characters, owned, filter]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    if (sortKey === 'name') return a.name.localeCompare(b.name);
    return b.rarity - a.rarity;
  }), [filtered, sortKey]);

  // ... 150 more lines of handlers, sub-components, effects
  return <div>{/* inline JSX */}</div>;
}
```

### ✅ Good

```tsx
// app/(authed)/roster/page.tsx
'use client';

import { RosterView } from '@/components/features/roster/components/RosterView';

// Why: page is a route entry — it composes RosterView. All state, filtering, and
// rendering concerns live in the feature module. Swapping RosterView for a future
// RosterViewV2 is a one-line change; re-using RosterView in a modal is trivial.
export default function RosterPage() {
  return <RosterView />;
}
```

`RosterView` owns the state (via `useRosterFilters()` hook), the data join (via `useTable('HsrCharacter')` + `useTable('HsrAccountCharacter')`), and the rendering. The page file stays at ~3 lines forever.

## Rule 2 — Viewport-agnostic children

No `useIsMobile` or similar viewport hook calls inside component files.

A component that knows its viewport class couples itself to the device and resists reuse. If `<TeamSlot>` internally calls `const isMobile = useIsMobile()` and branches rendering, you cannot reuse it in a context where you want the "desktop" layout on mobile (a tablet, a landscape phone, a preview pane). The component stops being a component and starts being two components in a trench coat.

The right layering is: page / layout owns the viewport decision (via `getRenderTier()`, the `vp` cookie, or the `<ViewportGate>` primitive for dual-DOM phases 27/31/35). Components accept size / variant props. The parent picks the variant based on its own layout context.

### ❌ Bad

```tsx
// components/features/team-builder/components/TeamSlot.tsx
'use client';

import { useIsMobile } from '@/lib/use-is-mobile';

export function TeamSlot({ character }: { character: HsrCharacter }) {
  const isMobile = useIsMobile();
  return isMobile
    ? <div className="w-16 h-16">{/* compact mobile tile */}</div>
    : <div className="w-32 h-48">{/* full desktop card */}</div>;
}
```

### ✅ Good

```tsx
// components/features/team-builder/components/TeamSlot.tsx
'use client';

type TeamSlotSize = 'sm' | 'md' | 'lg';

// Why: parent decides which size based on layout; TeamSlot is now reusable in
// a sidebar ('sm'), a main view ('lg'), or a preview modal ('md') without knowing
// anything about the current viewport. Phase 31 dual-DOM draft pedestal can
// still use <ViewportGate> to mount <TeamBuilder.desktop> vs <TeamBuilder.mobile>;
// both children render <TeamSlot> with the correct intrinsic size prop.
export function TeamSlot({ character, size }: { character: HsrCharacter; size: TeamSlotSize }) {
  const dims = size === 'sm' ? 'w-16 h-16' : size === 'md' ? 'w-24 h-32' : 'w-32 h-48';
  return <div className={dims}>{/* render at chosen size */}</div>;
}
```

## Rule 3 — Responsive styling adjusts sizing/spacing only (tool-agnostic)

This rule is intentionally reframed tool-agnostic per D-23. We may not keep Tailwind or HeroUI forever (D-25 — styling-tool flexibility). The responsive *mechanism* is irrelevant; the *discipline* is what matters.

**Responsive styles — via CSS Modules media queries, Tailwind responsive utilities, CSS-in-JS breakpoints, or any other mechanism — adjust sizing and spacing only.** Never use responsive styles to reorder sections, swap grid-vs-stack structural layouts, or hide major content blocks on one viewport.

Structural reorganization requires one of two approaches:
1. A single responsive layout that works at all widths (preferred — lower bundle cost, single code path).
2. A dual-DOM split via `<ViewportGate>` + sibling `.desktop.tsx` / `.mobile.tsx` files (R4). Only three phases are sanctioned for dual-DOM: **Phase 27 Calendar, Phase 31 Match Drafting, Phase 35 Tournament Brackets**. Every other page ships single-DOM.

Why "sizing/spacing only"? Hiding a sidebar on mobile via `hidden md:block` is a silent content loss — the mobile user never sees that content, but the diff looks like a styling tweak. Reordering sections with `flex-col md:flex-row` ships both layouts in the same DOM tree, which is fine when the only difference is axis, but starts leaking when the "sections" also need different content, different data, or different components. If you're tempted to reach for responsive structural classes, you have either (a) a single-layout problem worth re-solving, or (b) a dual-DOM case that wants R4.

### ❌ Bad (applies to both CSS Modules and Tailwind)

```tsx
// Bad — responsive utility hides a whole sidebar on mobile.
// The sidebar content (filters, navigation, search) is silently dropped on small screens.
// This is structural reorganization, not sizing.
export function RosterLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex">
      <aside className="hidden md:block w-64">{/* filter sidebar — lost on mobile */}</aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

The fix is either a drawer pattern (single DOM, filters reachable on mobile via a button → sheet) or — if the desktop and mobile experiences are genuinely different in structure — a dual-DOM `<ViewportGate>` split per R4 (but only at the three sanctioned phases).

### ✅ Good — CSS Modules

```tsx
// components/features/roster/components/RosterCard.module.css
/* Why: sizing / spacing only — padding grows on larger viewports, but structure
   is identical at every width. No content is hidden; no sections are reordered. */
.container {
  padding: 8px;
  gap: 8px;
}
@media (min-width: 768px) {
  .container {
    padding: 24px;
    gap: 16px;
  }
}
```

```tsx
// components/features/roster/components/RosterCard.tsx
import styles from './RosterCard.module.css';

export function RosterCard({ character }: { character: HsrCharacter }) {
  return <div className={styles.container}>{/* content */}</div>;
}
```

### ✅ Good — Tailwind

```tsx
// components/features/roster/components/RosterCard.tsx
// Why: sizing / spacing only via responsive utilities. Gap and padding scale with
// breakpoint; structure, content, and component tree are identical at every width.
export function RosterCard({ character }: { character: HsrCharacter }) {
  return (
    <div className="flex gap-2 p-4 md:gap-4 md:p-6">
      {/* content identical across viewports */}
    </div>
  );
}
```

Both examples are valid — the mechanism (CSS Modules vs Tailwind) is a project preference (D-25). The rule is the same either way.

## Rule 4 — State lives in hooks, not pages

Pages are route entry points. Testing a page requires a router context, a provider tree, and a real route. Hooks are testable in isolation with `renderHook()` — no provider stack, no router, no URL, no DOM.

When state lives on a page, you have two options for testing it: (a) set up the full Next.js App Router test harness for every feature, or (b) never unit-test state logic. The second is what usually happens. The first is a disproportionate cost for coverage that a plain hook gives for free.

Extract state into a hook the page calls once. Derivations (`useMemo`), effects (`useEffect`), event handlers (`useCallback`), and storage sync (`localStorage`, URL params) all live in the hook. The page reads the hook's return value and renders.

### ❌ Bad

```tsx
// app/(authed)/cost-tables/page.tsx
'use client';

export default function CostTablesPage() {
  const [draftMode, setDraftMode] = useState<DraftMode>('classic');
  const [costSetId, setCostSetId] = useState<number>(0);
  const [showSynergy, setShowSynergy] = useState(false);
  const { data: charCosts } = useTable('HsrCharacterCost');
  const { data: lcCosts } = useTable('HsrLightconeCost');
  const { data: synergyCosts } = useTable('HsrSynergyCost');

  const filteredChar = useMemo(
    () => charCosts.filter(c => c.costSetId === costSetId && c.draftMode.tag === draftMode),
    [charCosts, costSetId, draftMode]
  );
  // ... 4 more useMemo derivations
  // ... 3 useEffects syncing to URL query params
  return <div>{/* render */}</div>;
}
```

### ✅ Good

```tsx
// app/(authed)/cost-tables/page.tsx
'use client';

import { useCostTableState } from '@/components/features/cost-tables/hooks/useCostTableState';
import { CostTableView } from '@/components/features/cost-tables/components/CostTableView';

// Why: all state + derivations + URL sync live in useCostTableState, which is
// unit-testable via renderHook() with a mock SpacetimeDB provider. The page
// composes the hook + the view. Swapping the rendering later doesn't touch
// state logic; adding a new filter doesn't grow the page file.
export default function CostTablesPage() {
  const state = useCostTableState();
  return <CostTableView {...state} />;
}
```

## Rule 5 — Layout-agnostic component props

Component props should not encode positional assumptions about the parent layout. A component that accepts `leftSidebarWidth`, `isInHeaderRow`, `stackVertically`, or `isInSidebarMode` couples itself to a specific parent shape and can't be reused elsewhere without extending the prop matrix or duplicating the component.

The right shape is: component has an intrinsic layout (its internal DOM is consistent); parent wraps it in whatever container is appropriate (flex, grid, stack, sidebar). If two contexts genuinely need different *presentations* — not just different *positions* — create a distinct component (e.g., `MatchCard` and `MatchCardCompact`) rather than a single component with a flag.

A good heuristic: if a prop would be answered by asking "where is this component rendered?" instead of "what does this component show?", it's a layout-leak prop.

### ❌ Bad

```tsx
// components/features/match/components/MatchCard.tsx
'use client';

type Props = {
  match: Match;
  isInSidebarMode?: boolean;
  stackVertically?: boolean;
  leftOffset?: number;
};

export function MatchCard({ match, isInSidebarMode, stackVertically, leftOffset }: Props) {
  return (
    <div style={{ marginLeft: leftOffset }} className={stackVertically ? 'flex-col' : 'flex-row'}>
      {isInSidebarMode ? <CompactLayout match={match} /> : <FullLayout match={match} />}
    </div>
  );
}
```

### ✅ Good

```tsx
// components/features/match/components/MatchCard.tsx
'use client';

// Why: MatchCard has its own intrinsic layout. The parent decides positioning
// by wrapping it in whatever container is needed. When a compact variant is
// required in a sidebar, MatchCardCompact is a distinct component — same data
// contract, different presentation, zero positional leakage.
export function MatchCard({ match }: { match: Match }) {
  return (
    <article className="match-card">
      {/* intrinsic layout; no knowledge of parent */}
    </article>
  );
}
```

```tsx
// components/features/match/components/MatchCardCompact.tsx
'use client';

// Separate component for the sidebar variant. Same Match data contract.
export function MatchCardCompact({ match }: { match: Match }) {
  return (
    <article className="match-card-compact">
      {/* compact presentation */}
    </article>
  );
}
```

```tsx
// Consumer decides layout context:
<aside className="sidebar">
  <MatchCardCompact match={match} />
</aside>

<main className="feed">
  <MatchCard match={match} />
</main>
```

## Phase History

| Phase | Change | Date |
|-------|--------|------|
| 16 execution | Initial 5 R8 rules with tool-agnostic Rule 3 + Good/Bad examples | 2026-04-18 |
