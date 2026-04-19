# Phase 16: Route + Global Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the alternatives considered and the reasoning path.

**Date:** 2026-04-18
**Phase:** 16-route-global-foundation
**Mode:** discuss (interactive)
**Areas discussed:** Public-table sub placement, useAuth ↔ authed/layout subs, Middleware + SW allowlists, Primitive layout + R8 docs, ViewportGate SSR swap (added mid-discussion), Rename migration order (added mid-discussion)

---

## Gray Area Selection

Presented 4 gray areas at opening; user selected ALL 4 (multi-select):

| Area | Description | Selected |
|---|---|---|
| Public-table sub placement | Which 6 public reference tables (GameDataProvider has 5 today — HsrCharacterArchetype as 6th?) and does GameDataProvider stay as a context shell, move its useTable calls up into providers.tsx, or get absorbed entirely? | ✓ |
| useAuth ↔ authed/layout subs | FOUND-05 moves User subscription to (authed)/layout.tsx. 15.5 just added Stage 2 gate inside useAuth. Full relocation vs hybrid; what does useAuth keep? | ✓ |
| Middleware + SW allowlists | (1) Middleware positive-list matcher paths. (2) Service Worker asset-CDN hostnames. | ✓ |
| Primitive layout + R8 docs | Where do ViewportGate/ViewportWriter/SafariWarning/renderTier live? R8 component hygiene rules — where documented, how enforced? | ✓ |

---

## Area 1 — Public-table subscription placement

### Question 1 — "Is this the 6-table set?"

| Option | Description | Selected |
|---|---|---|
| Yes, exact set (HsrCharacter, HsrCharacterArchetype, HsrCharacterCost, HsrLightcone, HsrLightconeCost, HsrSynergyCost) | Add HsrCharacterArchetype to match FOUND-06's "6 public reference tables" | |
| Different set | Specify which tables belong in the global-layer subscription | ✓ (freeform) |

**User's input:** *"We could use HsrCharacterArchetype or a view that combines it with the Archetype table so we get plainly the of the character and the archetype name. Think what's best from an engineering perspective"*

**Resolution:** Claude investigated — `Archetype` is a separate `public: true` reference table (id, name, description) that `HsrCharacterArchetype` joins against. Engineering tradeoffs: ship both tables (7 total) vs create a join view. Chose 7 tables because (a) tiny static data, (b) view gives no bandwidth/privacy win, (c) avoids unneeded backend surface. Final set: 7 HSR reference tables + view_my_profile at layer-0.

### Question 2 — "Where do the 6-table subscriptions actually fire?"

| Option | Description | Selected |
|---|---|---|
| providers.tsx owns subs; GameDataProvider stays as context shell | Move useTable calls into providers.tsx (or adjacent provider); zero call-site churn | |
| Absorb GameDataProvider into providers.tsx | Retire GameDataProvider; consumers switch to useTable directly | |
| Keep status quo location (GameDataProvider) | Leave useTable calls where they are | ✓ (freeform) |

**User's input:** *"What is the correct engineering way to do this based on the layered subscription layout we want to do?"*

**Resolution:** Claude answered that GameDataProvider already mounts inside providers.tsx render tree, so the architectural intent is already satisfied. User moved to naming follow-up.

### Naming follow-up — "Should we still call it GameDataProvider?"

User asked whether the name still fits. Claude offered three options:

| Option | Description | Selected |
|---|---|---|
| Split by concern (rename → ReferenceDataProvider, move view_my_profile to AuthProvider) | Two providers at layer-0, each one job | |
| Rename only, bundle view_my_profile inside | ReferenceDataProvider with view_my_profile bundled | |
| Keep GameDataProvider name | Accept semantic stretch, minimum churn | ✓ (after follow-up) |

**User's intermediate input:** *"is it easier to move view_my_profile to AuthProvider? also, what would be the terms for different providers you are thinking about?"*

**Claude's answer:**
- Yes, AuthProvider is the natural owner of view_my_profile (already mounts inside providers.tsx, and it's auth-relevant).
- Future providers are per-need only. Layer-1 (`(authed)/layout.tsx` user/hsr_account subs), Layer-2 (`(match)/layout.tsx` lobby/tournament subs), page-level entity subs all use layout/page-level useTable calls — no new provider wrappers unless derived state justifies one.

**Final selection:** Keep GameDataProvider name; split logic only (AuthProvider gets view_my_profile).

### Question 3 — "useTable() vs subscriptionBuilder?"

**User's input:** *"we pick useTable and subscriptionbuilder is only use if we absolutly know we cannot get the data otherwise but it has to come with a clear reason why"* — accepted as D-04.

### Question 4 — "Fire immediately on connect for anon users too?"

Selected: "Yes — on connect regardless of auth (Recommended)" — matches FOUND-06.

---

## Area 2 — useAuth ↔ (authed)/layout.tsx handoff

### Initial checklist presentation

Claude presented a table of 15.5 behaviors and how each survives the Phase 16 refactor. Then offered a defensive checklist for CONTEXT.md.

**User's input:** *"we are in sync, proceed"* — accepted the entire behavior-preservation table as D-14.

**User's earlier pause:** *"we just have to make sure that this refactor will keep the same behavior that we designed for during 15.5 phase, I wanted that smooth experience for a reason"* — captured as the driving constraint for Area 2. Led to D-07 through D-14.

### Cross-cutting decision surfaced during Area 2

**User's input:** *"through all the development phase, make sure to do console log so we can see during testing that we are behaving as expected"* — captured as D-33 cross-cutting observability surface.

---

## Area 3 — Middleware + Service Worker allowlists

### Question 1 — SW allowlist

| Option | Description | Selected |
|---|---|---|
| UploadThing only | `ufs.sh` only day-one | |
| UploadThing + Imgur now | Both hostnames ship day-one | ✓ (freeform correction) |
| UploadThing + Imgur + Discord CDN | All three | |

**User's input:** *"Just for correction here, the only CDNs we work with are UploadThing and Imgur, discord doesn't give us anything other than the fact that a user is "verified" through the auth system"*

**Resolution:** SW allowlist = `ufs.sh` + `i.imgur.com`. Both ship day-one even though Imgur uploads don't wire until Phase 32 — avoids a later SW-allowlist edit. Discord CDN excluded (identity-only role).

### Question 2 — Middleware paths

Selected: `/profile/:path*`, `/admin-view/:path*`, `/lobby/:path*`, `/draft/:path*` (Recommended). Implicit excludes: `/`, `/costs`, `/teambuilder`, `/sw.js`, `/_next/*`, `/api/*`.

### Question 3 — Dev-unregister page

| Option | Description | Selected |
|---|---|---|
| Gated page + NEXT_PUBLIC_ENABLE_SW opt-in | `/dev-unregister-sw` with prod 404 guard | ✓ (after follow-up) |
| Console snippet only | README one-liner, no page | |

**User's intermediate input:** *"I wanna know exactly what are you planning here, I'm expecting this wouldn't ship at the end with the whole page to end users in production, right?"*

**Claude's answer:** Explained the exact mechanics — `app/dev-unregister-sw/page.tsx` first thing returns `notFound()` if `NODE_ENV==='production' && !NEXT_PUBLIC_ENABLE_SW`. Ships in prod bundle (~1KB) but unreachable. Alternative: console snippet with zero prod surface.

**User's follow-up:** *"how hard would it be to get rid of it later if needed?"*

**Claude's answer:** Trivially easy — delete one file + two README lines. No inbound dependencies.

**Final selection:** Ship the gated page.

---

## Area 4 — Primitive layout + R8 docs

### Question 1 — Primitive file locations

Selected: Split by kind (Recommended) — `lib/render-tier.ts` for pure util, `components/globals/viewport/` for React components.

### Question 2 — R8 docs location

Selected: `docs/frontend/component-hygiene.md` (Recommended) — follows existing `docs/{feature}/` convention.

### Question 3 — R8 enforcement mechanism

| Option | Description | Selected |
|---|---|---|
| PR-review checklist + docs | Doc + PR template checkbox | ✓ (freeform, modified) |
| ESLint custom rules | Mechanical AST checks for Rule 2 | |
| Both: lint + checklist | Lint for Rule 2, checklist for rest | |

**User's intermediate input:** *"I'm not sure what is this"* — Claude realized user wasn't familiar with R8. Backed up and explained R8 is the 5 component-hygiene rules from ROADMAP.md cross-phase commitments.

**User's follow-up input:** *"well, we use .module.css for tailwind stuff, I'm not really sure if I'm gonna keep tailwind for the project, i think we only use it for hero UI stuff and I may even remove that, it is not locked in to use those components. I don't need this PR descriptions with checkboxes. My PRs are written manually, if you are only doing the doc for this project, that is fine"*

**Resolution:**
- Ship `docs/frontend/component-hygiene.md` with 5 R8 rules + Good/Bad examples.
- No PR template infrastructure (user writes PRs manually).
- Rule 3 reframed tool-agnostic (since Tailwind/HeroUI are under review, not locked).
- Phase 16 output made styling-tool-agnostic (D-25).
- ESLint for Rule 2 is fast-follow, not Phase 16 scope.

---

## Added Gray Area — ViewportGate SSR swap

Offered at the "any other gray areas?" prompt. User selected "Discuss: ViewportGate SSR swap".

### Initial proposal — swap-with-Skeleton for cookie-less dual-DOM

Claude walked the pipeline: SSR reads vp cookie + userAgent() → client hydrates with server-passed prop → matchmedia runs post-mount → setState swaps if wrong. Presented 3 options for swap policy.

**User's intermediate input:** *"What is our best approach in your opinion? Maybe we could just have a loading spinner the first time to check for the device they are loggin from and then after that is resolved, we show them the correct page?"*

**Claude's answer:** User's spinner-first approach is cleaner. Proposed revised pipeline — server renders Skeleton when cookie absent on a dual-DOM page; client resolves viewport and dynamic-imports correct sibling. Drops userAgent() entirely (unreliable, adds branches).

**User's second input:** *"I thought we were not doing dual DOMs??? why are you using that design word?"*

**Claude's response:** Surfaced the source material — R4 in ROADMAP.md line 80 and DECISIONS.md — single-DOM is the default for ~24 of 27 UX phases, dual-DOM only for Calendar/Draft/Brackets (Phases 27/31/35).

**User's clarifying input:** *"Okay by dual DOM you mean that we have the desktop and mobile ts but they are not loading at the same time right?"*

**Claude's response:** Yes — clarified via comparison table. "Dual-DOM" = two separate files, only one downloaded/mounted at runtime via next/dynamic code-splitting. NOT both rendered with CSS hiding one (that's the anti-pattern R8 Rule 3 forbids).

**Final lock-in question:**

| Option | Description | Selected |
|---|---|---|
| Keep R4 (dual-DOM for Calendar/Draft/Brackets) | Skeleton-first mechanism locks | ✓ |
| Kill dual-DOM entirely | All pages single-DOM responsive | |
| Revisit later | Defer R4 commitment | |

**Final SSR mechanism lock:**

| Option | Description | Selected |
|---|---|---|
| Skeleton-first for cookie-less dual-DOM, userAgent() dropped | Described pipeline + FOUND-11 literal deviation note | ✓ (implicitly, via R4 confirmation) |
| Keep userAgent() as optional hint | Adds complexity for marginal benefit | |

---

## Added Gray Area — Rename migration order

Offered at the "write CONTEXT.md?" prompt — user said *"I think we had one more gray area left, no?"* Claude listed the remaining unadressed options; user picked rename migration.

### Claude's proposed 5-commit sequence

```
COMMIT 1 — Prerequisites (Next bump + typedRoutes + fix pre-existing hrefs)
COMMIT 2 — Rename (landing-page) → (public)
COMMIT 3 — Rename (authenticated) → (authed)
COMMIT 4 — Move (game)/draft → (authed)/(match)/draft + empty (match)/layout.tsx
COMMIT 5 — Sanity sweep for absolute-path imports
```

Each commit is independently buildable; `npm run build && npm run test:typecheck` between steps.

### Three embedded decisions

**Q1 — "Does /draft become authed?"** — Selected: Yes, /draft becomes authed (Recommended). Matches roadmap; deliberate behavior change.

**Q2 — "Ship (match)/layout.tsx as empty passthrough or defer to Phase 28?"** — Selected: Empty passthrough now (Recommended). Reserves architectural slot per ARCHITECTURE.md line 76.

**Q3 — "TypedRoutes pre-existing broken hrefs — fix in Commit 1 or defer?"** — Selected: Fix in Commit 1 scope (Recommended). Clean-slate policy.

---

## Claude's Discretion (summary)

- Safari banner dismissal persistence (per-session vs localStorage-forever vs time-boxed).
- Render-tier user-facing override UI (devtools-only in v0.9 per D-Deferred list).
- Exact Skeleton component design + location.
- Exact matchmedia listener + teardown in ViewportGate.
- Exact structure of AuthProvider + `(authed)/layout.tsx` subscribe effects.
- Precise Next.js version pin (≥15.2.3 locked; planner picks minor at execution).
- Async-params audit during rename commits (likely unnecessary — only known dynamic route is /draft/[matchId] which already uses async params).
- Exact wording of `docs/frontend/component-hygiene.md` examples.

---

## Deferred Ideas

- `useGatedSubscription(sql)` helper hook (inherited from 15.5).
- ESLint rule for R8 Rule 2.
- Render-tier user-facing toggle UI.
- Web Worker for asset prefetching.
- `hsr_account` subscription move (Phase 21).
- Tri-state `<AuthRequired>` (Phase 21).
- Cross-tab BroadcastChannel auth sync (Phase 21).
- Match-tier subscriptions at `(authed)/(match)/layout.tsx` (Phase 28).
- `view_active_users` / on-demand-read replacement for User subscription (bandwidth-at-scale option).
- Imgur upload client wiring (Phase 32).

---

*Discussion completed: 2026-04-18.*
