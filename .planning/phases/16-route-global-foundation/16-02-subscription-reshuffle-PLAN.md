---
phase: 16-route-global-foundation
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified:
  - components/features/game-data/components/GameDataProvider.tsx
  - components/features/auth/components/AuthProvider.tsx
  - components/features/auth/hooks/useAuth.ts
  - app/(authed)/layout.tsx
autonomous: true
requirements: [FOUND-05, FOUND-06]

must_haves:
  truths:
    - "GameDataProvider mounts exactly 7 useTable calls: HsrCharacter, HsrCharacterArchetype, Archetype, HsrCharacterCost, HsrLightcone, HsrLightconeCost, HsrSynergyCost (per D-01)"
    - "AuthProvider owns the view_my_profile subscribe effect; useAuth.ts no longer contains the Stage 1 effect"
    - "(authed)/layout.tsx owns the User subscribe + onUserInsert/onUserUpdate callbacks; useAuth.ts no longer contains the Stage 2 effect"
    - "Anonymous visitors receive ZERO User rows (verified by 15.5 harness test — route-group mount is the structural gate)"
    - "Returning authed users have view_my_profile hydrated at the provider layer on connect — no regression vs 15.5's smooth-auth experience"
    - "readProfileFromConnection remains in useAuth.ts and resolves via view_my_profile primary + User fallback"
    - "guestLoginPending state + Login button spinner behavior preserved (D-14 checklist item 3 — spinner does not bleed into isLoadingData / isWaitingForData / isConnecting / isLinkingDiscord)"
    - "onUserInsert and onUserUpdate callbacks still fire on the authed subscription lifecycle — relocated to (authed)/layout.tsx"
    - "Both AuthProvider and (authed)/layout.tsx use the subscribedRef guard pattern for Strict Mode double-mount defense (D-11)"
    - "All 7 public-table + view_my_profile subscriptions fire on STDB connect regardless of auth state (D-05 anon+authed)"
    - "test/backend/auth/auth-subscriptions.test.ts passes unmodified (D-12)"
  artifacts:
    - path: "components/features/game-data/components/GameDataProvider.tsx"
      provides: "7-table layer-0 subscription set + context exposing all 7 row arrays"
      contains: "useTable(tables.Archetype)"
    - path: "components/features/auth/components/AuthProvider.tsx"
      provides: "view_my_profile Stage 1 subscribe lifecycle with Strict-Mode guard + live-change callbacks"
      contains: "view_my_profile"
    - path: "app/(authed)/layout.tsx"
      provides: "User Stage 2 subscribe lifecycle + onUserInsert/onUserUpdate callbacks, route-group-gated"
      contains: "SELECT * FROM user"
    - path: "components/features/auth/hooks/useAuth.ts"
      provides: "login/logout/Discord-link state machine, readProfileFromConnection 3-fallback reader, guestLoginPending narrow state — minus the two relocated subscribe effects"
      contains: "readProfileFromConnection"
  key_links:
    - from: "components/features/auth/components/AuthProvider.tsx"
      to: "SpacetimeDB conn.db.view_my_profile"
      via: "conn.subscriptionBuilder().subscribe('SELECT * FROM view_my_profile')"
      pattern: "SELECT \\* FROM view_my_profile"
    - from: "app/(authed)/layout.tsx"
      to: "SpacetimeDB conn.db.User"
      via: "conn.subscriptionBuilder().subscribe('SELECT * FROM user') OR useTable(tables.User)"
      pattern: "SELECT \\* FROM user|useTable\\(tables\\.User\\)"
    - from: "components/features/game-data/components/GameDataProvider.tsx"
      to: "SpacetimeDB 7 public reference tables"
      via: "7 × useTable(tables.X) calls"
      pattern: "useTable\\(tables\\.(HsrCharacter|HsrCharacterArchetype|Archetype|HsrCharacterCost|HsrLightcone|HsrLightconeCost|HsrSynergyCost)\\)"
---

<objective>
Relocate the two SpacetimeDB subscribe effects out of `useAuth.ts` into their proper architectural owners, and expand `GameDataProvider` from 5 to 7 public-table subscriptions. After this plan, `useAuth.ts` keeps only state-machine and reader logic; subscription lifecycles live where they structurally belong.

This plan preserves the 15.5 smooth-auth experience end-to-end (D-14 five-point checklist) — any regression against the 15.5 harness test (`test/backend/auth/auth-subscriptions.test.ts`) is a blocking failure per D-12.

Purpose: Deliver FOUND-05 (user subscription → (authed)/layout.tsx; useAuth retains only view_my_profile bootstrap responsibility) and FOUND-06 (providers.tsx render tree subscribes to 7 public reference tables + view_my_profile for anon+authed).
Output:
- `GameDataProvider.tsx` mounts 7 useTable calls (D-01, D-02)
- `AuthProvider.tsx` owns the Stage 1 view_my_profile subscribe effect (D-03)
- `app/(authed)/layout.tsx` owns the Stage 2 User subscribe + callbacks (D-07, D-08)
- `useAuth.ts` loses exactly two effects and keeps everything else (D-10)
- D-11 subscribedRef guard replicated in both new subscription owners
- D-33 bracketed-tag logging throughout
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
@.planning/phases/16-route-global-foundation/16-VALIDATION.md
@.planning/phases/15.5-auth-gated-user-subscription/15.5-02-SUMMARY.md
@components/features/auth/hooks/useAuth.ts
@components/features/auth/components/AuthProvider.tsx
@components/features/game-data/components/GameDataProvider.tsx

<interfaces>
<!-- Contracts the executor needs. Extracted from 16-PATTERNS.md + existing codebase. -->

GameDataProvider existing 5 useTable calls (lines 71-76 of current file):
```typescript
const [characterRows] = useTable(tables.HsrCharacter);
const [lightconeRows] = useTable(tables.HsrLightcone);
const [characterCostRows] = useTable(tables.HsrCharacterCost);
const [lightconeCostRows] = useTable(tables.HsrLightconeCost);
const [synergyCostRows] = useTable(tables.HsrSynergyCost);
```
Add exactly 2 more per D-01 / D-02:
```typescript
const [archetypeRows] = useTable(tables.Archetype);
const [characterArchetypeRows] = useTable(tables.HsrCharacterArchetype);
```

Stage 1 effect to port verbatim from useAuth.ts (lines 72-111) into AuthProvider:
- Guards on `!isActive || subscribedRef.current`
- SQL: `SELECT * FROM view_my_profile`
- onApplied sets profileReady=true and calls readProfileRef.current(conn)
- onInsert / onUpdate filter via isLiveChange(ctx) (Pitfall 5 — skip SubscribeApplied events)
- Cleanup removes onInsert/onUpdate handlers and resets subscribedRef

Stage 2 effect to port from useAuth.ts (lines 115-181) into app/(authed)/layout.tsx:
- Same guard + subscribedRef pattern
- SQL: `SELECT * FROM user`
- onApplied calls readProfileRef.current (if currentUser not already resolved)
- onUserInsert / onUserUpdate filter via isLiveChange(ctx)
- DROP the 15.5 stage2Gate ref check — route-group mount is the new gate (D-07)
- Cleanup removes User insert/update handlers

Cross-effect coordination (the load-bearing wiring question per RESEARCH Open Question 2):
- useAuth.ts's existing `useEffect([isActive, profileReady, identity, ...])` at lines 284-292 re-reads profile when state flips
- readProfileRef.current lives in useAuth.ts and reads `conn.db.view_my_profile.iter()` / `conn.db.User.id.find(...)` — pure cache accesses, not subscription-bound
- The AuthProvider effect needs to flip profileReady on onApplied. Two viable wirings:
  (a) Expose profileReady + setProfileReady through AuthContext — useAuth provides the setter, AuthProvider calls it
  (b) Move profileReady state management INTO AuthProvider and pass it down
- RECOMMENDED pattern (a): useAuth already owns profileReady as state (line ~41); keep it there, export a setProfileReady through the returned auth object, have AuthProvider call `auth.setProfileReady(true)` from inside the onApplied callback.
- This matches PATTERNS.md Adaptation note: "setProfileReady + readProfileRef live in useAuth; AuthProvider must coordinate via context".
- If (a) is clumsy (auth return shape grows), the planner can choose (b) but must document the tradeoff in the SUMMARY.

The 15.5 harness canonical subscription-ownership test (MUST NOT MODIFY per CLAUDE.md + D-12):
  test/backend/auth/auth-subscriptions.test.ts
This is the regression guard. If it fails after the reshuffle, the reshuffle is wrong — fix the code, not the test.

Existing (authed)/layout.tsx (now at app/(authed)/layout.tsx post Plan 01 Commit 3):
```typescript
'use client';
import React from 'react';
import AuthRequired from '@/components/features/auth/components/AuthRequired';
import DeletionBanner from '@/components/features/auth/components/DeletionBanner';
import styles from './layout.module.css';

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layout_wrapper}>
            <AuthRequired>
                <DeletionBanner />
                {children}
            </AuthRequired>
        </div>
    );
}
```
Rename the default export to `AuthedLayout` and extend with the Stage 2 subscribe effect per PATTERNS.md §app/(authed)/layout.tsx.

useAuth Open Question 1 (RESEARCH): use `conn.subscriptionBuilder().subscribe(...)` or `useTable(tables.User)` in (authed)/layout.tsx?
- D-04 says useTable is the default mechanism.
- The 15.5 Stage 2 uses subscriptionBuilder because the manual ref-gate semantics required explicit lifecycle.
- With the route-group gate now structural, useTable is a clean fit for Stage 2.
- Recommended: use `useTable(tables.User)` for the subscription itself; attach onUserInsert/onUserUpdate via a separate `useEffect` that grabs the connection from useSpacetimeDB and calls `conn.db.User.onInsert/onUpdate` with the subscribedRef guard. OR keep subscriptionBuilder for parity with 15.5 — either is acceptable per Claude's Discretion. Executor picks whichever lands cleanly against the D-12 test and documents in SUMMARY.

Import conventions (all 'use client' files):
```typescript
import { useSpacetimeDB } from 'spacetimedb/react';
import * as tables from '../../../src/module_bindings';
// OR the project's existing pattern — check GameDataProvider.tsx for the exact path
```

D-33 tag map (verbatim):
- `[AuthProvider]` for view_my_profile subscribe/onApplied/onInsert/onUpdate/unsubscribe
- `[authedLayout]` for User subscribe/onApplied/onUserInsert/onUserUpdate + mount+unmount
- `[GameDataProvider]` for each of 7 useTable calls firing + first-rows-available per table
- `[useAuth]` — existing logs retained + one new log: `console.log('[useAuth] subscription ownership delegated to AuthProvider + (authed)/layout.tsx')` at top of useAuth()

D-14 five-point checklist (MUST hold after reshuffle — used for SUMMARY):
1. Anonymous visitors receive zero User directory rows at any layer.
2. Returning authed users have view_my_profile hydrated at layer-0 on connect.
3. guestLoginPending drives the login-button inline spinner ONLY.
4. readProfileFromConnection 3-fallback still resolves.
5. onUserInsert / onUserUpdate still fire on the authed subscription lifecycle (relocated but same role).
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Expand GameDataProvider to 7 useTable calls + extend context type</name>
  <files>components/features/game-data/components/GameDataProvider.tsx</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/game-data/components/GameDataProvider.tsx (the file being modified)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§GameDataProvider — lines 298-338)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-01, D-02, D-04, D-05)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 3; §Architectural Responsibility Map — GameDataProvider row)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/src/module_bindings (confirm tables.Archetype and tables.HsrCharacterArchetype exports exist with expected row shapes)
  </read_first>
  <action>
1. Open `components/features/game-data/components/GameDataProvider.tsx`. Existing body has 5 `useTable` calls (lines 71-76) and a `GameDataContextType` interface (lines 55-67).
2. Add row interface declarations for the two new tables alongside the existing `HsrCharacterRow` / `HsrLightconeRow` / etc. declarations (around lines 9-53). Use the plain-interface shape convention already present in the file — fields derived from the generated SpacetimeDB types in `src/module_bindings`. Suggested names: `ArchetypeRow`, `HsrCharacterArchetypeRow`.
3. Extend `GameDataContextType` (lines 55-67) with two new fields:
   - `archetypes: ArchetypeRow[]`
   - `characterArchetypes: HsrCharacterArchetypeRow[]`
4. Add two new `useTable` calls after the existing five (line 77 area):
   ```typescript
   const [archetypeRows] = useTable(tables.Archetype);
   const [characterArchetypeRows] = useTable(tables.HsrCharacterArchetype);
   ```
5. Extend the context-value object spread at lines 78-92 with the two new fields using the same `rows as unknown as XxxRow[]` casting convention present in the file.
6. Add D-33 bracketed-tag console logs:
   - One log at component mount indicating `[GameDataProvider] mounted — subscribing to 7 public reference tables (anon+authed per D-05)`.
   - Inside a small `useEffect([archetypeRows.length, ...])` OR inline after each useTable, a first-rows-available marker per table, e.g., when `archetypeRows.length > 0 && !loggedArchetype.current`, log `[GameDataProvider] first rows available: Archetype (count=${n})` and flip a ref. Pattern must match the existing log style; if the existing file logs only on mount (no per-table readiness log), stick with a single mount log plus one "all 7 ready" log gated by `isReady` flipping to true. Executor picks the simpler form that matches the file's existing convention.
7. Confirm `useTable` default mechanism usage — do NOT introduce `subscriptionBuilder` in this file (D-04: useTable is the default; explicit SQL only with documented reason).
8. Run `npm run build && npm run test:typecheck` — both must exit 0.
9. Commit: `feat(16-02): expand GameDataProvider to 7 public tables (D-01)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "useTable(tables\\." components/features/game-data/components/GameDataProvider.tsx` returns exactly `7`.
    - `grep -n "useTable(tables.Archetype)" components/features/game-data/components/GameDataProvider.tsx` returns one hit.
    - `grep -n "useTable(tables.HsrCharacterArchetype)" components/features/game-data/components/GameDataProvider.tsx` returns one hit.
    - `grep -c "\\[GameDataProvider\\]" components/features/game-data/components/GameDataProvider.tsx` returns at least 1 (D-33 compliance).
    - Context type contains `archetypes` and `characterArchetypes` fields: `grep -n "archetypes:" components/features/game-data/components/GameDataProvider.tsx` returns at least 2 matches (both fields in the interface + value object).
    - `grep -n "subscriptionBuilder" components/features/game-data/components/GameDataProvider.tsx` returns zero matches (D-04 default).
    - `npm run build` exit 0, `npm run test:typecheck` exit 0.
  </acceptance_criteria>
  <done>
    GameDataProvider mounts 7 useTable calls (5 existing + Archetype + HsrCharacterArchetype), context type extended with two new fields, D-33 bracketed logging in place, build+typecheck green, one atomic commit made.
  </done>
</task>

<task type="auto">
  <name>Task 2: Relocate Stage 1 view_my_profile subscribe effect into AuthProvider (D-03)</name>
  <files>
    components/features/auth/components/AuthProvider.tsx,
    components/features/auth/hooks/useAuth.ts
  </files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/auth/components/AuthProvider.tsx (current 21-line shape)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/auth/hooks/useAuth.ts (Stage 1 effect at lines 72-111; surrounding refs at lines 47-48; readProfileFromConnection at lines 113-170; profileReady state around line 41)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§AuthProvider — lines 96-180; §Strict Mode double-subscribe guard — lines 818-842; §Live-change filter helper — lines 846-864)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-03, D-09, D-10, D-11, D-14 checklist)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 3 "reader survives" paragraph; §Code Examples "AuthProvider Stage 1 subscribe"; §Open Question 2)
  </read_first>
  <action>
1. Open `components/features/auth/components/AuthProvider.tsx`. Current shape is a thin context-wrapper around `useAuth()`.
2. Add the Stage 1 view_my_profile subscribe `useEffect` using the pattern verbatim from PATTERNS.md §AuthProvider and RESEARCH §Code Examples, with these adaptations:
   - Tag: replace `[useAuth]` with `[AuthProvider]` per D-33.
   - Ref name: `subscribedRef` (D-11 naming — NOT the legacy `stage1Ref`).
   - SQL: `SELECT * FROM view_my_profile` (unchanged from 15.5).
   - Use `conn.subscriptionBuilder()` directly — this subscription needs explicit `.onApplied()` which useTable does not expose (D-04 allows subscriptionBuilder when structurally required; document inline at the call site).
   - Live-change filter: use the `isLiveChange(ctx)` helper to skip `SubscribeApplied` events inside onInsert/onUpdate callbacks (Pitfall 5).
3. Wire profile-ready coordination per RESEARCH Open Question 2 (recommended path (a)):
   - `useAuth.ts` already owns `profileReady` state (inspect current file to confirm line location).
   - Add a setter export from the `useAuth()` return object (e.g., add `setProfileReady` to the returned record).
   - In `AuthProvider`, call `auth.setProfileReady(true)` inside the `.onApplied` callback.
   - If the existing `useAuth.ts` effect at `[isActive, profileReady, identity, ...]` already re-reads profile on state flip (per RESEARCH line 1039), the reader-trigger is implicit — no direct `readProfileRef.current(conn)` call needed from AuthProvider. If the reader needs a push, expose `triggerReadProfile()` from useAuth alongside setProfileReady and call it from AuthProvider's onApplied / onInsert / onUpdate.
   - Document the exact wiring chosen (setter-only vs setter+trigger) in the SUMMARY under "AuthProvider ↔ useAuth coordination".
4. Register onInsert/onUpdate handlers inside the effect and unregister in cleanup. Both handlers filter via isLiveChange(ctx) before acting.
5. Add the `subscribedRef.current = true` set inside the effect (after the guard) and `subscribedRef.current = false` in the cleanup return.
6. In `useAuth.ts`, DELETE the Stage 1 effect at lines 72-111. Also delete the `stage1Ref` declaration at lines 47-48 (dead ref after removal) — confirm via grep that no other reader references `stage1Ref`.
7. In `useAuth.ts`, add the D-33 delegation log at the top of `useAuth()`:
   ```typescript
   console.log('[useAuth] subscription ownership delegated to AuthProvider + (authed)/layout.tsx');
   ```
8. Preserve all other `useAuth.ts` internals per D-10: `readProfileFromConnection` (stays), `hadSessionCookie` / `hadUserIdOnMount` refs (stay — drive isWaitingForData per D-09), login / logout / Discord / guest / soft-delete state and effects (stay), `guestLoginPending` narrow spinner (stays — D-14 #3).
9. Run `npm run build && npm run test:typecheck` — both exit 0.
10. Run `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` — all 8 tests must pass (D-12 gate). If they fail, this plan is not done — debug the relocation until green.
11. Commit: `refactor(16-02): relocate view_my_profile Stage 1 subscribe to AuthProvider (D-03)`.
  </action>
  <verify>
    <automated>npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts</automated>
  </verify>
  <acceptance_criteria>
    - `grep -c "view_my_profile" components/features/auth/components/AuthProvider.tsx` returns at least 2 (SQL string + onInsert/onUpdate references).
    - `grep -c "view_my_profile" components/features/auth/hooks/useAuth.ts` returns zero OR only in comments/docstring references — the Stage 1 subscribe block is gone.
    - `grep -n "subscribedRef" components/features/auth/components/AuthProvider.tsx` returns at least 3 hits (declaration + guard + reset-in-cleanup).
    - `grep -n "stage1Ref" components/features/auth/hooks/useAuth.ts` returns zero matches (dead ref removed).
    - `grep -c "\\[AuthProvider\\]" components/features/auth/components/AuthProvider.tsx` returns at least 4 (subscribing, onApplied, onInsert, onUpdate, cleanup).
    - `grep -n "delegation" components/features/auth/hooks/useAuth.ts` OR `grep -n "delegated" components/features/auth/hooks/useAuth.ts` returns one match (the D-33 top-of-file delegation log).
    - `grep -n "isLiveChange" components/features/auth/components/AuthProvider.tsx` returns at least one match.
    - `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` exits 0 with all tests passing.
    - `npm run build && npm run test:typecheck` both exit 0.
  </acceptance_criteria>
  <done>
    Stage 1 effect lives in AuthProvider with subscribedRef guard and isLiveChange filter; useAuth.ts has the stage1 effect + stage1Ref removed; readProfileFromConnection + all other useAuth internals untouched; D-12 harness test passes unmodified; D-33 tagging in place; atomic commit made.
  </done>
</task>

<task type="auto">
  <name>Task 3: Relocate Stage 2 User subscribe + callbacks into (authed)/layout.tsx (D-07, D-08); final useAuth.ts trim</name>
  <files>
    app/(authed)/layout.tsx,
    components/features/auth/hooks/useAuth.ts
  </files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/app/(authed)/layout.tsx (post Plan 01 Commit 3 — current 10-line layout at the new route-group path)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/auth/hooks/useAuth.ts (Stage 2 effect at lines 115-181; stage2Ref + stage2Gate at lines 48, 67; onUserInsert/onUserUpdate callbacks at lines 63-80/156-159)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§(authed)/layout.tsx — lines 184-294)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-07, D-08, D-09, D-10, D-11, D-13, D-14)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 3; §Code Examples "(authed)/layout.tsx Stage 2 subscribe"; §Open Question 1 on useTable vs subscriptionBuilder)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/auth/components/AuthRequired.tsx (existing gate — unchanged per D-13 and Phase 16 scope)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/auth/components/DeletionBanner.tsx (existing child — unchanged)
  </read_first>
  <action>
1. Open `app/(authed)/layout.tsx` (renamed from `(authenticated)/layout.tsx` by Plan 01 Commit 3). Current body is a 10-line wrapper around `AuthRequired` + `DeletionBanner`.
2. Add the Stage 2 User subscribe effect per PATTERNS.md §(authed)/layout.tsx and RESEARCH §Code Examples, with these adaptations:
   - Rename default export from `LobbyLayout` to `AuthedLayout` for clarity.
   - Add `'use client'` directive (already present in the current file) — keep it.
   - Import `useEffect`, `useRef` from React; `useSpacetimeDB` from `spacetimedb/react`.
   - Add `const subscribedRef = useRef(false);` inside the component body (D-11).
   - Per RESEARCH Open Question 1 — executor picks EITHER:
     (A) `useTable(tables.User)` for the sub + a separate useEffect to attach onUserInsert/onUserUpdate via `conn.db.User.onInsert/onUpdate` guarded by subscribedRef. Matches D-04 default mechanism.
     (B) `conn.subscriptionBuilder().subscribe('SELECT * FROM user')` with explicit onApplied + callbacks (15.5 pattern port). Useful for parity.
     Executor picks the one that yields the cleanest diff against the existing useAuth Stage 2 effect. Document the choice in the SUMMARY and add an inline code comment at the call site naming the decision + rationale.
   - Guard on `!isActive || subscribedRef.current` at the top of any explicit-subscription effect.
   - DROP the 15.5 `stage2Gate` ref check entirely — route-group mount IS the gate (D-07 rationale).
   - For explicit subscribe path (B): register onApplied, onUserInsert, onUserUpdate; filter via `isLiveChange(ctx)` (Pitfall 5).
   - For useTable path (A): useTable handles onApplied automatically; attach onUserInsert/onUserUpdate inside a secondary useEffect reading from `useSpacetimeDB().getConnection()` with the subscribedRef guard.
   - Tag all logs with `[authedLayout]` per D-33.
3. Wire readProfile push if Option (B) is chosen: expose a `triggerReadProfile()` callback from `useAuthContext()` (added in Task 2 if needed) and call it from onApplied + live-change callbacks. Under Option (A), useAuth's existing `useEffect([isActive, profileReady, identity, ...])` observes `currentUser` via reactive path and re-reads naturally — no push needed.
4. Preserve the existing layout JSX exactly (`AuthRequired` wrapper + `DeletionBanner` child). D-13 confirms `AuthRequired` reads `currentUser` from useAuthContext — independent of this layout's subscription.
5. In `useAuth.ts`, DELETE the Stage 2 effect at lines 115-181. Also delete `stage2Ref` (line 48) and `stage2Gate` (line 67) — both dead refs post-removal (grep-verify no other reader).
6. Preserve all other useAuth internals per D-10 final trim:
   - `hadSessionCookie` + `hadUserIdOnMount` refs stay (D-09 — drive isWaitingForData only, no longer gate subscription).
   - `isWaitingForData` composition at ~line 295 stays.
   - `readProfileFromConnection` + `readProfileRef` stay.
   - Login / logout / Discord / guest / soft-delete / guestLoginPending all stay.
7. Run `npm run build && npm run test:typecheck` — both exit 0.
8. Run `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` — all tests pass (D-12 gate).
9. Manual D-14 checklist verify (log results in SUMMARY):
   - Anonymous visitor: check via `npm run dev`, open DevTools Network → Messages filtered to WebSocket frames. Confirm no `QueryUpdate` for `user` table (anon User rows never arrive).
   - Returning authed user (with existing `spacetimedb_user_id` in localStorage): confirm `view_my_profile` hydrates before any render flash.
   - guestLoginPending: click guest login → confirm spinner is scoped to the Login button only, not on isConnecting / isLoadingData surfaces.
   - readProfileFromConnection: confirm console log `[useAuth] readProfileFromConnection resolved via view_my_profile` fires on reconnect.
   - onUserInsert / onUserUpdate: log output shows `[authedLayout] User.onInsert` on reducer-initiated user mutation.
10. Commit: `refactor(16-02): relocate User Stage 2 subscribe to (authed)/layout.tsx; final useAuth trim (D-07, D-08, D-10)`.
  </action>
  <verify>
    <automated>npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts &amp;&amp; npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `grep -E "SELECT \\* FROM user|useTable\\(tables\\.User\\)" "app/(authed)/layout.tsx"` returns at least one match (one of the two acceptable mechanisms).
    - `grep -n "subscribedRef" "app/(authed)/layout.tsx"` returns at least 2 hits (declaration + guard-site).
    - `grep -c "\\[authedLayout\\]" "app/(authed)/layout.tsx"` returns at least 3 (mount/subscribe, onApplied or first-rows, onInsert, onUpdate).
    - `grep -n "SELECT \\* FROM user" components/features/auth/hooks/useAuth.ts` returns zero matches (Stage 2 effect is gone).
    - `grep -En "stage2Ref|stage2Gate" components/features/auth/hooks/useAuth.ts` returns zero matches (dead refs removed).
    - `grep -n "readProfileFromConnection" components/features/auth/hooks/useAuth.ts` returns at least one match (reader preserved per D-10).
    - `grep -n "hadSessionCookie" components/features/auth/hooks/useAuth.ts` returns at least one match (D-09 ref preserved).
    - `grep -n "guestLoginPending" components/features/auth/hooks/useAuth.ts` returns at least one match (D-14 #3 preserved).
    - `grep -n "AuthRequired" "app/(authed)/layout.tsx"` returns at least one match (existing gate wrapper preserved).
    - `grep -n "DeletionBanner" "app/(authed)/layout.tsx"` returns at least one match (existing child preserved).
    - `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` exits 0 with all tests green.
    - `npm run build && npm run test:typecheck` both exit 0.
  </acceptance_criteria>
  <done>
    Stage 2 User subscribe + onUserInsert/onUserUpdate callbacks relocated to `app/(authed)/layout.tsx` with subscribedRef + isLiveChange filtering; useAuth.ts Stage 2 effect + stage2Ref + stage2Gate removed; all other useAuth.ts internals preserved per D-10; route-group mount is the structural gate (no runtime ref gating); D-12 harness test green; D-14 five-point checklist manually verified and logged in SUMMARY; atomic commit made.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Provider tree → SpacetimeDB WebSocket | AuthProvider + GameDataProvider + (authed)/layout.tsx fire `.subscribe(...)` calls over the live WS. Subscription privacy is enforced server-side by SpacetimeDB RLS; client cannot unilaterally see other users' User rows. |
| Route-group filesystem layout → React mount | `app/(authed)/layout.tsx` only mounts when the URL matches an authed route. This IS the structural gate replacing the 15.5 ref-based condition. Next.js App Router guarantees the layout does not mount for `/`, `/costs`, `/teambuilder`. |
| useAuth return shape → AuthProvider/consumer boundary | If Task 2 adds `setProfileReady` to the useAuth return shape, every consumer of `useAuthContext()` sees that setter. Consumers must NOT abuse it — setter is internal to AuthProvider's subscribe lifecycle. Document in SUMMARY + inline JSDoc. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16-02-01 | I (Information Disclosure) | Anonymous visitor receives User rows post-reshuffle | mitigate | Route-group mount is the gate per D-07. Verified by D-12 harness test (`test/backend/auth/auth-subscriptions.test.ts`). Plan BLOCKS if that test fails — a failure here means anon can see User rows, which is the exact leak 15.5 closed. |
| T-16-02-02 | T (Tampering) | Strict Mode double-mount causing double-subscribe | mitigate | subscribedRef guard pattern (D-11) replicated in both AuthProvider and (authed)/layout.tsx. Without it, React 18 dev intentionally mounts → unmounts → remounts and duplicates `.subscribe()` — burns energy + risks double-fire of onApplied. |
| T-16-02-03 | T | SubscribeApplied event masquerading as live insert | mitigate | `isLiveChange(ctx)` filter on every onInsert/onUpdate callback (Pitfall 5). Without it, readProfileFromConnection double-fires on mount, violating D-14 #2 "no visible delay on first paint". |
| T-16-02-04 | I | Returning user profile not yet hydrated when first paint happens | mitigate | AuthProvider subscribes at the provider-layer (inside providers.tsx tree), which mounts before any page content. 15.5 harness regression guard catches delayed-hydration cases. D-14 #2 preserved. |
| T-16-02-05 | S (Spoofing) | Middleware cookie check as auth enforcer | accept | Phase 16 explicitly documents middleware as UX-only, NOT an auth trust boundary (REQUIREMENTS.md Out of Scope). Real gate is SpacetimeDB RLS at reducer/view level. This plan's route-group mount adds UX-level gating — it does not grant or withhold access to data, only access to the code path that triggers the subscription. |
| T-16-02-06 | E (Elevation of Privilege) | Setter exposed on auth context misused to fake profileReady | accept | `setProfileReady` (if chosen) is exposed on the auth return; consumers could theoretically call it. Mitigation is convention — JSDoc marks it internal and no downstream code is expected to call it. If a consumer abuses it, only local UI state flips; no privilege is granted. Low severity. |
</threat_model>

<verification>
After all 3 tasks land:
1. `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` — 8/8 green (D-12).
2. `npm run build && npm run test:typecheck` — both exit 0.
3. `grep -c "useTable(tables\\." components/features/game-data/components/GameDataProvider.tsx` — exactly 7.
4. `grep -n "view_my_profile" components/features/auth/components/AuthProvider.tsx` — at least 1 (the SQL string).
5. `grep -n "SELECT \\* FROM user\\|useTable\\(tables\\.User\\)" "app/(authed)/layout.tsx"` — at least 1.
6. `grep -En "stage1Ref|stage2Ref|stage2Gate" components/features/auth/hooks/useAuth.ts` — zero matches.
7. `grep -n "readProfileFromConnection" components/features/auth/hooks/useAuth.ts` — at least 1 (reader preserved).
8. D-14 five-point manual checklist logged in SUMMARY (anon zero User rows, returning-user hydration, guestLoginPending scoped spinner, reader 3-fallback, onUserInsert fires).
9. Bracketed logs per D-33 all appear on mount of a freshly-loaded page (verify via DevTools Console).
</verification>

<success_criteria>
- GameDataProvider mounts 7 `useTable` calls (the 5 existing + Archetype + HsrCharacterArchetype) — D-01, D-02.
- AuthProvider owns the Stage 1 view_my_profile subscribe with subscribedRef + isLiveChange filtering — D-03, D-11.
- `(authed)/layout.tsx` owns the Stage 2 User subscribe + onUserInsert/onUserUpdate callbacks with subscribedRef + isLiveChange — D-07, D-08, D-11.
- `useAuth.ts` retains readProfileFromConnection, login/logout/Discord/guest/soft-delete state, guestLoginPending narrow state, hadSessionCookie + hadUserIdOnMount refs — loses only the two subscribe effects — D-09, D-10, D-14.
- D-12 regression harness (`test/backend/auth/auth-subscriptions.test.ts`) passes unmodified.
- D-14 five-point behavior-preservation checklist verified post-refactor.
- D-33 bracketed-tag console logs present on every lifecycle moment across AuthProvider, authedLayout, GameDataProvider, useAuth.
- Build + typecheck green throughout.
</success_criteria>

<output>
After completion, create `.planning/phases/16-route-global-foundation/16-02-SUMMARY.md` documenting:
- Which wiring pattern was picked for Task 2 (setter-only vs setter+triggerReadProfile).
- Which mechanism was picked for Task 3 (useTable vs subscriptionBuilder).
- D-14 five-point checklist results with specific log-trace snippets.
- Confirmation that 15.5 harness test ran green unmodified.
- `as any` / non-standard type coercions introduced (ideally zero).
</output>
