---
phase: 16-route-global-foundation
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - package-lock.json
  - next.config.ts
  - app/(landing-page)
  - app/(authenticated)
  - app/(game)
  - app/(public)
  - app/(authed)
  - app/(authed)/(match)/layout.tsx
  - components/features/team-builder/LoadoutControls.tsx
  - components/features/team-builder/LoadoutDropdown.tsx
  - components/features/team-builder/SynergyDisplay.tsx
  - components/features/team-builder/TeamRoster.tsx
  - components/features/team-builder/Teamslot.tsx
autonomous: true
requirements: [FOUND-03, FOUND-04]

must_haves:
  truths:
    - "package.json resolves next to ^15.5.0 (not latest; 16.x is out-of-scope)"
    - "next.config.ts exposes typedRoutes at TOP LEVEL (not experimental.typedRoutes)"
    - "app/(landing-page) no longer exists; app/(public) contains its former contents"
    - "app/(authenticated) no longer exists; app/(authed) contains its former contents"
    - "app/(game) no longer exists; app/(authed)/(match)/draft contains the former (game)/draft tree"
    - "app/(authed)/(match)/layout.tsx exists as empty passthrough (<>{children}</>) — Server Component, NOT client"
    - "No absolute-path import in components/features/team-builder/*.tsx references @/app/(landing-page)"
    - "npm run build && npm run test:typecheck both exit 0 at the end of every commit in the sequence"
    - "/draft/:matchId continues to resolve at its new authed path; async-params contract is preserved"
  artifacts:
    - path: "next.config.ts"
      provides: "Top-level typedRoutes: true + unchanged CSP headers"
      contains: "typedRoutes: true"
    - path: "app/(authed)/(match)/layout.tsx"
      provides: "Empty passthrough layout reserving match-tier slot for Phase 28"
      contains: "MatchLayout"
      min_lines: 3
    - path: "app/(public)/"
      provides: "Former (landing-page) route-group directory"
    - path: "app/(authed)/"
      provides: "Former (authenticated) route-group directory"
    - path: "app/(authed)/(match)/draft/"
      provides: "Former (game)/draft tree, now inside authed+match nesting"
  key_links:
    - from: "components/features/team-builder/*.tsx"
      to: "app/(public)/teambuilder/page.module.css"
      via: "absolute-path import rewrite"
      pattern: "@/app/\\(public\\)/teambuilder/page.module.css"
    - from: "next.config.ts"
      to: ".next/types/**/*.ts"
      via: "typedRoutes generation during next build"
      pattern: "typedRoutes:\\s*true"
---

<objective>
Land Wave A of Phase 16: pin Next.js to ^15.5.0, enable stable top-level `typedRoutes`, rename the three route groups, and collapse `(game)/draft` under `(authed)/(match)/draft` — in the 5-commit sequence mandated by D-29. Every commit must independently pass `npm run build && npm run test:typecheck`. This plan blocks Wave B; no subscription / middleware / SW work can begin until the directory layout and typecheck gate are green.

Purpose: Deliver FOUND-03 (Next ≥15.2.3 + typedRoutes) and FOUND-04 (route-group rename + href migration) so downstream plans in Wave B can mutate files at their new paths without fighting stale directory names.
Output:
- `package.json` pinned to `next@^15.5.0`
- `next.config.ts` with top-level `typedRoutes: true`
- Renamed directories: `(landing-page) → (public)`, `(authenticated) → (authed)`, `(game)/draft → (authed)/(match)/draft`
- New `app/(authed)/(match)/layout.tsx` empty passthrough
- 5 team-builder absolute-path imports updated to `@/app/(public)/teambuilder/page.module.css`
- 5 atomic commits, each buildable
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
@.claude/CLAUDE.md
@next.config.ts
@package.json

<interfaces>
<!-- Key facts the executor MUST know before touching a single file. -->
<!-- Extracted from 16-RESEARCH.md §Standard Stack, §Pattern 1, §Pattern 2, §Runtime State Inventory, §Pitfalls 1/9/10. -->

Installed Next.js version (verified 2026-04-18): 15.5.12 (resolved from `^15.0.0`)
Correct typedRoutes key on 15.5+: TOP-LEVEL `typedRoutes: true` (NOT `experimental.typedRoutes`)
  Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/typedRoutes (last-updated 2026-04-15)
  Rationale: CONTEXT D-29 Commit 1 says `experimental: { typedRoutes: true }` — that literal is WRONG for 15.5+.
  The experimental key still works but triggers deprecation warning on every `next build` and is removed in Next 16.
  RESEARCH Pitfall 1 + D-28 override CONTEXT D-29 on this one line.

Do NOT run `npm i next@latest` — resolves to 16.2.4 which renames middleware.ts → proxy.ts.
Correct pin: `npm i next@^15.5.0` (verified compat: highest 15.5.x is 15.5.15 at 2026-04-18).

5 absolute-path imports that will fail `npm run build` the moment Commit 2 lands (grep-verified 2026-04-18):
  components/features/team-builder/LoadoutControls.tsx:4
  components/features/team-builder/LoadoutDropdown.tsx:4
  components/features/team-builder/SynergyDisplay.tsx:5
  components/features/team-builder/TeamRoster.tsx:4
  components/features/team-builder/Teamslot.tsx:4
Each imports: `import styles from "@/app/(landing-page)/teambuilder/page.module.css"`
Commit 2 MUST update these atomically with the `git mv` or the repo is broken between commits.

Current route-group layout (verified 2026-04-18 via `ls app/`):
  app/(authenticated)/  contains: admin-view, lobby, profile, layout.module.css, layout.tsx
  app/(landing-page)/   contains: costs, teambuilder, layout.module.css, layout.tsx, page.module.css, page.tsx
  app/(game)/           contains: draft  (draft is the only child — (game) becomes empty + removable in Commit 4)

typedRoutes + route groups interaction (Pitfall 9):
  Route groups are URL-invisible. Renaming (landing-page)→(public) does NOT by itself break typedRoutes.
  typedRoutes guards `<Link href>` and `router.push/replace/prefetch` — NOT arbitrary `import` statements.
  The 5 team-builder imports break at tsconfig path-resolution time, not typedRoutes.

async params contract (Pitfall 10):
  app/(game)/draft/[matchId]/page.tsx already uses async params. `git mv` preserves file content.
  Don't combine rename + content edit in a single commit.

Windows/Git Bash note (RESEARCH.md:411):
  Parentheses in paths need backslash-escape OR double-quoting on Git Bash:
    git mv "app/(landing-page)" "app/(public)"
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Commit 1 — bump Next.js + enable top-level typedRoutes + fix pre-existing broken hrefs</name>
  <files>package.json, package-lock.json, next.config.ts</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/next.config.ts (the file being modified)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/package.json (the file being modified — confirm `next` version line)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Standard Stack §Next.js version — lines 162-174; §Pitfall 1)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§next.config.ts — lines 744-769)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-16, D-29 Commit 1, D-32)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/CLAUDE.md (npm-only rule, autonomous-execution policy)
  </read_first>
  <action>
1. Run `npm view "next@^15.5" version` to confirm the then-current 15.5.x patch (research captured 15.5.15 on 2026-04-18).
2. Run `npm i next@^15.5.0` to pin Next to the 15.5 line. After install, run `npm ls next` and confirm the resolved version is `15.5.x` and NOT `16.x`. If npm resolves to 16, re-run with a stricter pin like `npm i next@^15.5.15`.
3. Edit `next.config.ts`: add `typedRoutes: true` at the TOP level of the `nextConfig` object (above `async headers()`). DO NOT use `experimental: { typedRoutes: true }` — that is the deprecated key on 15.5+ per RESEARCH Pitfall 1 (overrides the literal CONTEXT D-29 Commit 1 wording). The `headers()` function and CSP config remain unchanged.
   Final shape:
   ```ts
   const nextConfig: NextConfig = {
     typedRoutes: true, // D-29 Commit 1 + RESEARCH Pitfall 1 correction
     async headers() { /* unchanged */ },
   };
   ```
4. Run `npm run build`. Triage any TypeScript errors about invalid `<Link href>` strings or `router.push` calls. For each broken href, fix the href string OR the referenced route file per D-32 — NO `as Route` casts, NO `// @ts-expect-error` silences, NO deferral. Fix ALL broken hrefs inline in this commit regardless of count. The `npm run build` exit-0 gate is the natural circuit breaker — do not escalate, do not pause. Note the count in the SUMMARY for phase retrospective only.
5. Run `npm run test:typecheck` and confirm exit 0.
6. Stage: `git add package.json package-lock.json next.config.ts` plus any `.tsx` files fixed in step 4. Verify none of the staged paths appear in `.gitignore` (per CLAUDE.md Gitignore Guardrail — no `git add -f`, and frontmatter must not list gitignored paths).
7. Commit with message: `chore(next): bump to 15.5.x + enable top-level typedRoutes`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `npm ls next` output contains `next@15.5.` (anywhere in the 15.5.x line; NOT 15.1.x / 15.2.x / 15.3.x / 15.4.x / 16.x).
    - `grep -n "typedRoutes" next.config.ts` returns exactly one match at top-level — verify via `grep -Pzo "(?s)const nextConfig: NextConfig = \{\s*\n\s*typedRoutes: true" next.config.ts` (must match; typedRoutes is first key inside the object literal).
    - `grep -n "experimental" next.config.ts` returns zero matches OR only matches that do NOT contain `typedRoutes`.
    - `npm run build` exits 0 with no deprecation warning text "experimental.typedRoutes has been moved".
    - `npm run test:typecheck` exits 0.
    - `git log -1 --pretty=%s` matches `chore(next): bump to 15.5.x + enable top-level typedRoutes`.
  </acceptance_criteria>
  <done>
    Next 15.5.x installed, typedRoutes active at the stable top-level key, build+typecheck both green, one atomic commit made with the Next bump + config edit + any broken-href fixes from the build triage.
  </done>
</task>

<task type="auto">
  <name>Task 2: Commit 2 — rename (landing-page) → (public), update 5 team-builder imports atomically</name>
  <files>
    app/(landing-page),
    app/(public),
    components/features/team-builder/LoadoutControls.tsx,
    components/features/team-builder/LoadoutDropdown.tsx,
    components/features/team-builder/SynergyDisplay.tsx,
    components/features/team-builder/TeamRoster.tsx,
    components/features/team-builder/Teamslot.tsx
  </files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/team-builder/LoadoutControls.tsx (line 4 — verify current import path before rewrite)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/team-builder/LoadoutDropdown.tsx (line 4)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/team-builder/SynergyDisplay.tsx (line 5)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/team-builder/TeamRoster.tsx (line 4)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/components/features/team-builder/Teamslot.tsx (line 4)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 2 Commit 2; §Runtime State Inventory; §Pitfall 9)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§components/features/team-builder/*.tsx — lines 722-741)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-29 Commit 2)
  </read_first>
  <action>
1. Run the rename: `git mv "app/(landing-page)" "app/(public)"` (double-quote the path — parentheses are literal characters on Git Bash per RESEARCH.md:411).
2. Update each of the 5 team-builder files using the Edit tool. For each file, change exactly one import line:
   ```
   BEFORE: import styles from "@/app/(landing-page)/teambuilder/page.module.css";
   AFTER:  import styles from "@/app/(public)/teambuilder/page.module.css";
   ```
   Files (and target line per PATTERNS.md):
     - `components/features/team-builder/LoadoutControls.tsx` — line 4
     - `components/features/team-builder/LoadoutDropdown.tsx` — line 4
     - `components/features/team-builder/SynergyDisplay.tsx` — line 5
     - `components/features/team-builder/TeamRoster.tsx` — line 4
     - `components/features/team-builder/Teamslot.tsx` — line 4
   These are the ONLY lines to change in this task per D-29 Commit 2 scope.
3. Run `npm run build` — must exit 0. If any other stale `@/app/(landing-page)` import surfaces (grep missed or recently added), fix it here rather than deferring to Commit 5. The diff stays atomic to "rename (landing-page) → (public)".
4. Run `npm run test:typecheck` — must exit 0.
5. Stage: `git add "app/(public)" components/features/team-builder/LoadoutControls.tsx components/features/team-builder/LoadoutDropdown.tsx components/features/team-builder/SynergyDisplay.tsx components/features/team-builder/TeamRoster.tsx components/features/team-builder/Teamslot.tsx`. The `git mv` already staged the directory rename.
6. Commit with message: `refactor(app): rename (landing-page) route group to (public)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - Directory `app/(landing-page)` does NOT exist: `[ ! -d "app/(landing-page)" ] &amp;&amp; echo OK` prints `OK`.
    - Directory `app/(public)` exists with expected subdirs (costs, teambuilder) and files (layout.tsx, page.tsx).
    - `grep -rn "@/app/(landing-page)" app/ components/ lib/` returns zero matches.
    - Each of the 5 team-builder files now contains the line `import styles from "@/app/(public)/teambuilder/page.module.css";` — verify via `grep -n "app/(public)/teambuilder/page.module.css" components/features/team-builder/*.tsx` returning 5 lines.
    - `npm run build` exit 0, `npm run test:typecheck` exit 0.
    - `git log -1 --pretty=%s` matches `refactor(app): rename (landing-page) route group to (public)`.
  </acceptance_criteria>
  <done>
    (landing-page) fully renamed to (public), all 5 stale absolute-path imports updated atomically in the same commit, build + typecheck green, single refactor commit made.
  </done>
</task>

<task type="auto">
  <name>Task 3: Commit 3 — rename (authenticated) → (authed)</name>
  <files>app/(authenticated), app/(authed)</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/app/(authenticated)/layout.tsx (current file — confirm contents; git mv preserves bytes)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 2 Commit 3)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-29 Commit 3)
  </read_first>
  <action>
1. Run `git mv "app/(authenticated)" "app/(authed)"` (double-quote path).
2. Sanity-sweep any absolute-path imports that reference `(authenticated)`: run `grep -rn "@/app/(authenticated)" app/ components/ lib/`. Expected: zero hits (the pre-rename audit confirmed only team-builder imports hit (landing-page), not (authenticated)). If any hit surfaces, fix in this commit.
3. Run `npm run build` — must exit 0.
4. Run `npm run test:typecheck` — must exit 0.
5. Stage (git mv auto-stages the rename; any additional imports fixed in step 2 staged manually).
6. Commit with message: `refactor(app): rename (authenticated) route group to (authed)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - Directory `app/(authenticated)` does NOT exist.
    - Directory `app/(authed)` exists with expected subdirs (admin-view, lobby, profile) and files (layout.tsx, layout.module.css).
    - `grep -rn "@/app/(authenticated)" app/ components/ lib/` returns zero matches.
    - `npm run build` exit 0, `npm run test:typecheck` exit 0.
    - `git log -1 --pretty=%s` matches `refactor(app): rename (authenticated) route group to (authed)`.
  </acceptance_criteria>
  <done>
    (authenticated) renamed to (authed), zero stale references anywhere in app/components/lib, build+typecheck green, atomic commit made.
  </done>
</task>

<task type="auto">
  <name>Task 4: Commit 4 — collapse (game)/draft under (authed)/(match); create empty (match) passthrough layout</name>
  <files>
    app/(game),
    app/(authed)/(match)/layout.tsx,
    app/(authed)/(match)/draft
  </files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/app/(game)/draft/[matchId]/page.tsx (current draft page — confirm async-params pattern; git mv preserves content)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 2 Commit 4; §Pitfall 10)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-PATTERNS.md (§app/(authed)/(match)/layout.tsx — lines 462-473)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-29 Commit 4, D-30, D-31)
  </read_first>
  <action>
1. Create the match subgroup directory: `mkdir -p "app/(authed)/(match)"`.
2. Create `app/(authed)/(match)/layout.tsx` as a Server Component empty passthrough (D-31 verbatim) — NO `'use client'` directive, no imports beyond `React`:
   ```tsx
   import React from 'react';

   export default function MatchLayout({ children }: { children: React.ReactNode }) {
     return <>{children}</>;
   }
   ```
   This file reserves the architectural slot for Phase 28 match-tier subscriptions; Phase 28 will extend it and flip to client. Phase 16 keeps it minimal.
3. Move the draft tree with a single `git mv "app/(game)/draft" "app/(authed)/(match)/draft"`. DO NOT edit any file content inside the moved tree — `git mv` must preserve the existing async-params pattern in `[matchId]/page.tsx` (Pitfall 10).
4. Remove the now-empty `(game)` directory: `rmdir "app/(game)"`. If rmdir refuses because the directory is non-empty, investigate — something other than `draft` was in `(game)` that wasn't captured in the pre-phase audit.
5. Run `npm run build` — must exit 0.
6. Run `npm run test:typecheck` — must exit 0.
7. Manual verify (for SUMMARY note): `npm run dev` on port 3001, anonymous visit to `/draft/abc123`. Per D-30 this becomes authed; expected behavior after THIS commit is: page still loads (middleware not yet written — arrives in Plan 03). Middleware redirect is Wave B's responsibility. Log the manual check outcome.
8. Stage the new passthrough layout + the moved draft tree: `git add "app/(authed)/(match)/layout.tsx"` — `git mv` already staged the directory move and `(game)` removal.
9. Commit with message: `refactor(app): collapse (game)/draft under (authed)/(match)`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - Directory `app/(game)` does NOT exist.
    - Directory `app/(authed)/(match)` exists.
    - File `app/(authed)/(match)/layout.tsx` exists and contains `export default function MatchLayout` AND `<>{children}</>`.
    - File `app/(authed)/(match)/layout.tsx` does NOT contain `'use client'` (it is a Server Component per D-31).
    - Directory `app/(authed)/(match)/draft` exists with the [matchId] subtree intact.
    - `grep -n "await params" "app/(authed)/(match)/draft/[matchId]/page.tsx"` returns at least one match (async-params pattern preserved per Pitfall 10).
    - `npm run build` exit 0, `npm run test:typecheck` exit 0.
    - `git log -1 --pretty=%s` matches `refactor(app): collapse (game)/draft under (authed)/(match)`.
  </acceptance_criteria>
  <done>
    `(game)/draft` tree moved to `(authed)/(match)/draft` bit-for-bit; `(game)` directory deleted; empty Server Component `(match)/layout.tsx` passthrough created; build+typecheck green; async-params contract preserved; atomic commit made.
  </done>
</task>

<task type="auto">
  <name>Task 5: Commit 5 — sanity sweep for residual route-group references</name>
  <files>app/, components/, lib/</files>
  <read_first>
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-RESEARCH.md (§Pattern 2 Commit 5; §Code Examples "Audit broken hrefs"; §Runtime State Inventory)
    - D:/GitsWork/hsrpvp-spacetimedb-nextjs/.planning/phases/16-route-global-foundation/16-CONTEXT.md (D-29 Commit 5, D-32)
  </read_first>
  <action>
1. Run the canonical grep sweep from RESEARCH §Code Examples:
   ```bash
   grep -rn "@/app/(landing-page)\|@/app/(authenticated)\|@/app/(game)" app/ components/ lib/
   ```
   Expected: zero matches. If any absolute-path import still references the old names, fix it by rewriting the path to the new route-group name.
2. Also sweep for plain-string references to the old names in comments/docstrings (non-blocking but helpful for SUMMARY):
   ```bash
   grep -rn "(landing-page)\|(authenticated)\|(game)" app/ components/ lib/ docs/
   ```
   Genuine matches (e.g., a comment saying "in (landing-page) we did X") can be rewritten for freshness; this is not mandatory for compile.
3. Per D-32 clean-slate policy: NO `as Route` casts added, NO `// @ts-expect-error` silences added. If a broken `<Link href>` surfaces at this step, fix the href or the referenced route file.
4. Run `npm run build` — must exit 0.
5. Run `npm run test:typecheck` — must exit 0.
6. If step 1 found zero matches AND step 2 produced no code changes, the commit is empty — in that case, skip the commit (don't create an empty commit per CLAUDE.md). Note in the SUMMARY that Commit 5 was absorbed because Commits 2-4 already caught all references. If step 1 or 2 did find something, commit with message: `refactor(app): update file-path references after route-group migration`.
  </action>
  <verify>
    <automated>npm run build &amp;&amp; npm run test:typecheck</automated>
  </verify>
  <acceptance_criteria>
    - `grep -rn "@/app/(landing-page)" app/ components/ lib/` returns zero matches.
    - `grep -rn "@/app/(authenticated)" app/ components/ lib/` returns zero matches.
    - `grep -rn "@/app/(game)" app/ components/ lib/` returns zero matches.
    - `npm run build` exit 0, `npm run test:typecheck` exit 0.
    - If Commit 5 was made: `git log -1 --pretty=%s` matches `refactor(app): update file-path references after route-group migration`. If absorbed, the SUMMARY notes it explicitly.
  </acceptance_criteria>
  <done>
    Zero stale absolute-path route-group references remaining in app/components/lib. Build and typecheck both green at the final state of Wave A. Plan 01 atomic-commit sequence complete (4 or 5 commits depending on Commit 5 absorption). Wave B is unblocked.
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| Build toolchain → filesystem | `next build` writes `.next/types/**/*.ts`; TypeScript compiler reads these to validate `<Link href>` strings. typedRoutes generation is trusted toolchain output. |
| package.json → npm registry | `npm i next@^15.5.0` fetches from the configured registry. Supply-chain trust is npm's — we do not pin integrity hashes ourselves beyond what package-lock.json tracks. |
| Git working tree → git index | `git mv` + `git add` stage file moves and content edits. The Gitignore Guardrail (CLAUDE.md) forbids `-f` staging of gitignored paths. |
| No network trust boundary | Plan 01 introduces zero new network endpoints, zero new cookies, zero new auth surface. Middleware ships in Plan 03. |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-16-01-01 | T (Tampering) | `next.config.ts` typedRoutes config | mitigate | Top-level `typedRoutes: true` is a well-trafficked Next.js config; the deprecation-path from experimental → top-level is documented. RESEARCH Pitfall 1 guards against silently staying on the deprecated key. |
| T-16-01-02 | S (Spoofing) | `/draft/:matchId` becoming authed in Commit 4 | accept | D-30 explicit: /draft becoming authed is intended. Real gate ships in Plan 03 (middleware) and Plan 02 (AuthRequired on authed layout). Between Commit 4 and Plan 03 merge, anonymous users can still reach /draft — this is a temporary gap inside the feature branch, not a production exposure (no deploy between commits in Phase 16). |
| T-16-01-03 | T | Git supply chain (`npm i next@^15.5.0`) | accept | Standard npm trust model; CVE-2025-29927 is the motivating fix and patches are applied via the install. Higher-assurance mitigations (SRI, audit tooling) are out of Phase 16 scope. |
| T-16-01-04 | I (Information Disclosure) | CSP headers preserved across rename | mitigate | RESEARCH §Runtime State Inventory verified CSP headers in `next.config.ts` don't reference route-group paths; they restrict origins. The config edit in Task 1 adds `typedRoutes` only and does not touch the `headers()` function. |
| T-16-01-05 | D (Denial of Service) | Broken build state between commits | mitigate | Per D-29, EVERY commit in the 5-commit sequence runs `npm run build && npm run test:typecheck` before staging. A broken mid-sequence state never ships, so `git bisect` remains meaningful and no in-branch deploy is possible from a half-renamed tree. |
| T-16-01-06 | E (Elevation of Privilege) | Middleware bypass via CVE-2025-29927 | mitigate | Covered by the Next 15.5.x bump itself — the patch (15.2.3+) cryptographically verifies `x-middleware-subrequest`. Phase 16 middleware ships in Plan 03; the CVE fix is already in place before that code lands. |
</threat_model>

<verification>
Wave A final state (run after all 5 commits land, before handing off to Wave B):
1. `npm run build && npm run test:typecheck` — both exit 0.
2. `npm ls next` — shows `next@15.5.x` resolved (not 15.4.x, not 16.x).
3. `grep -n "typedRoutes" next.config.ts` — one match at top-level scope.
4. `grep -n "experimental" next.config.ts` — zero `typedRoutes` matches (deprecated key absent).
5. `ls app/` — shows `(public)`, `(authed)`, `api/`, `globals.css`, `layout.tsx`, `providers.tsx`, `tokens.css`. Must NOT show `(landing-page)`, `(authenticated)`, or `(game)`.
6. `ls "app/(authed)/(match)/"` — shows `layout.tsx` + `draft/`.
7. `cat "app/(authed)/(match)/layout.tsx"` — contains `export default function MatchLayout` + `<>{children}</>` and does NOT contain `'use client'`.
8. `grep -rn "@/app/(landing-page)\|@/app/(authenticated)\|@/app/(game)" app/ components/ lib/` — zero matches.
9. `git log --oneline -5` — shows 4 or 5 Wave A commits (5 if Commit 5 was non-empty) with the exact messages from Tasks 1-5.
10. 15.5 harness regression: `npm run test:phase -- test/backend/auth/auth-subscriptions.test.ts` still passes (this plan makes no subscription changes; any failure here is a red flag about install state).
</verification>

<success_criteria>
- Next.js 15.5.x pinned in package.json; build + typecheck pass throughout the 5-commit sequence.
- Top-level `typedRoutes: true` active; no `experimental.typedRoutes` anywhere in `next.config.ts`.
- Three route-group renames complete: `(landing-page) → (public)`, `(authenticated) → (authed)`, `(game)/draft → (authed)/(match)/draft`.
- 5 team-builder absolute-path imports rewritten atomically with Commit 2.
- `app/(authed)/(match)/layout.tsx` exists as Server Component empty passthrough (3 LOC), reserved for Phase 28.
- Zero stale `@/app/(landing-page|authenticated|game)` references anywhere in app/components/lib.
- 15.5 harness test `test/backend/auth/auth-subscriptions.test.ts` still green (no subscription code changed).
- All commits have descriptive, conventional messages matching the D-29 sequence.
</success_criteria>

<output>
After completion, create `.planning/phases/16-route-global-foundation/16-01-SUMMARY.md` documenting:
- Resolved Next.js version (15.5.x exact patch).
- Number of pre-existing broken hrefs fixed in Commit 1 (likely 0; record the count for phase retrospective — no sub-plan escalation per D-32 clean-slate).
- Whether Commit 5 was made or absorbed.
- Confirmation that the async-params pattern in `/draft/[matchId]/page.tsx` was preserved by `git mv`.
- Manual-verify log entry for anonymous `/draft/abc` access (Plan 03 will lock it).
</output>
