---
phase: 16
slug: route-global-foundation
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-19
---

# Phase 16 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

**Block policy:** `block_on: open`
**Auditor:** gsd-security-auditor
**Threats:** 36 total (21 mitigate verified / 15 accept logged / 0 unregistered / 0 open)

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Anonymous browser → public routes | `/`, `/costs`, `/teambuilder`, `/_next/*`, `/api/*`, `/sw.js` — never enter middleware. | Static assets + public views. |
| Anonymous browser → `(authed)` route-group | Mount is the structural timing gate. Middleware is UX-only; REAL auth is SpacetimeDB RLS at reducer/view. | `stdb_session` cookie presence (weak display-name signal, not a crypto proof). |
| Client JS → `/sw.js` fetch handler | Same-origin requests short-circuit. Only `ufs.sh` hits cache path. `response.ok && GET` gate before `cache.put`. | Asset-CDN images only. No PII, no auth tokens. |
| Dev-unregister page → production bundle | `notFound()` is the FIRST statement in the component body; gated by `NODE_ENV === 'production' && NEXT_PUBLIC_ENABLE_SW !== 'true'`. | None — UI is a no-op in prod. |
| `lib/render-tier.ts` WebGL probe → canvas | Same-origin GPU identification. `WEBGL_debug_renderer_info` is browser-default; result used locally only (localStorage cache). | None sent to server. |
| `vp` cookie → server | SSR-informed rendering. `SameSite=Lax`, `Secure` on HTTPS. | Viewport class (non-sensitive). |
| Documentation → code | `docs/auth/architecture.md` + `docs/frontend/component-hygiene.md` describe code ownership. Drift detection is human-in-the-loop via `/gsd-verify-work` doc-update checkpoint (AST/timestamp automation rejected per `feedback_doc_updates_human_gated.md`). | Narrative; no runtime data. |

---

## Scope

This audit verifies that every threat declared in the 6 plan `<threat_model>` blocks for Phase 16 is either (a) implemented as declared in the cited implementation files, or (b) correctly logged as an accepted risk with rationale still valid against delivered code. It does NOT scan for new vulnerabilities outside the 36-threat register.

Middleware is UX-only per `REQUIREMENTS.md` Out of Scope; real authorization is SpacetimeDB RLS (reducer + view layer). "Bypass middleware" threats are ACCEPTED by design.

---

## Threat Verification Matrix

### Plan 01 — config-route-group-rename

| ID | Cat | Disposition | Evidence |
|----|-----|-------------|----------|
| T-16-01-01 | T | mitigate — CLOSED | `next.config.ts:7` top-level `typedRoutes: true` (NOT `experimental.typedRoutes`). Grep `experimental` in file: zero matches. |
| T-16-01-02 | S | accept — CLOSED | Logged in Accepted Risks. Rationale holds: `/draft/[matchId]` now under `app/(authed)/(match)/draft/` per Plan 01 Task 4 `git mv`; real gating via Plan 03 middleware + SpacetimeDB RLS. |
| T-16-01-03 | T | accept — CLOSED | Logged in Accepted Risks. npm trust model; CVE-2025-29927 patch carried by 15.5.x install — verified below in T-16-01-06. |
| T-16-01-04 | I | mitigate — CLOSED | `next.config.ts:9-59` `headers()` function with full CSP header (`script-src`, `style-src`, `img-src`, `connect-src`, `frame-ancestors 'none'`, `X-Content-Type-Options`, `X-Frame-Options DENY`, `Referrer-Policy`). CSP strings reference origins, not route-group paths — unaffected by rename. |
| T-16-01-05 | D | mitigate — CLOSED | 16-01 SUMMARY confirms `npm run build && npm run test:typecheck` exit 0 at every one of the 4 atomic Wave A commits (`1558a54`, `e02c81f`, `e6c56c9`, `f9d9da6`). No broken intermediate state possible. |
| T-16-01-06 | E | mitigate — CLOSED | `package.json:40` pins `"next": "^15.5.0"`; `package-lock.json:3698` resolves to `15.5.15`. Satisfies ≥15.2.3 — CVE-2025-29927 `x-middleware-subrequest` cryptographic header verification present in Next internals. |

### Plan 02 — subscription-reshuffle

| ID | Cat | Disposition | Evidence |
|----|-----|-------------|----------|
| T-16-02-01 | I | mitigate — CLOSED | `app/(authed)/layout.tsx:57-71` is the sole subscriber to `SELECT * FROM user` (grep-verified — useAuth.ts no longer contains this SQL). Next.js App Router guarantees the layout only mounts for authed route paths. `test/backend/auth/auth-subscriptions.test.ts` 2/2 green per 16-02 SUMMARY + 16-06 SUMMARY. |
| T-16-02-02 | T | mitigate — CLOSED | `components/features/auth/components/AuthProvider.tsx:35,38,41,78` subscribedRef + guard + reset-in-cleanup. `app/(authed)/layout.tsx:40,47,50,97` same pattern. Both files replicate the D-11 guard. |
| T-16-02-03 | T | mitigate — CLOSED | `AuthProvider.tsx:6,62,67` `isLiveChange(ctx)` filter on `onInsert`/`onUpdate`. `app/(authed)/layout.tsx:8,80,85` same filter on `onUserInsert`/`onUserUpdate`. |
| T-16-02-04 | I | mitigate — CLOSED | `AuthProvider.tsx:86-90` AuthProvider mounts inside Providers tree (verified in `app/providers.tsx:87` → AuthProvider wraps GameDataProvider + children). Stage 1 subscribe fires before any page content renders. Harness test green. |
| T-16-02-05 | S | accept — CLOSED | Logged in Accepted Risks. Middleware is UX-only per REQUIREMENTS.md Out of Scope; route-group mount is structural timing gate, not authorization. |
| T-16-02-06 | E | accept — CLOSED | Logged in Accepted Risks. `useAuth.ts:397-405` `setProfileReady` + `triggerReadProfile` exposed on auth return with `@internal` JSDoc; grep confirms comment/tag present. Abuse only flips local UI state. |

### Plan 03 — middleware

| ID | Cat | Disposition | Evidence |
|----|-----|-------------|----------|
| T-16-03-01 | E | mitigate — CLOSED | `middleware.ts:3-4` documents CVE-2025-29927 mitigation via Next 15.5.x bump. Package-lock confirms `next@15.5.15` ≥15.2.3 patch threshold. Header verified cryptographically by Next internals — no middleware code required. |
| T-16-03-02 | S | accept — CLOSED | Logged in Accepted Risks. `middleware.ts:10` reads cookie presence only (`request.cookies.get('stdb_session')`); no value validation. Bypass only skips redirect, grants zero data access. |
| T-16-03-03 | T | accept — CLOSED | Logged in Accepted Risks. `middleware.ts:13` only checks `!cookie` (presence). Tampered values pass through same as legit values. RLS is the real gate. |
| T-16-03-04 | D | mitigate — CLOSED | `middleware.ts:31-36` positive-list matcher with exactly 4 entries: `/profile/:path*`, `/admin-view/:path*`, `/lobby/:path*`, `/draft/:path*`. Grep confirms no `/api`, `/_next`, `/sw.js` entries. |
| T-16-03-05 | I | accept — CLOSED | Logged in Accepted Risks. `middleware.ts:16,20` `[middleware]` bracketed logs include path — non-sensitive (same info in request URL). Required per D-33. |
| T-16-03-06 | T | mitigate — CLOSED | `middleware.ts:31-36` matcher excludes `/sw.js` by positive-list construction. SW registration fetch is never redirected — verified by absence of `/sw.js` in matcher array. |

### Plan 04 — service-worker

| ID | Cat | Disposition | Evidence |
|----|-----|-------------|----------|
| T-16-04-01 | T | mitigate — CLOSED | `public/sw.js:31` `if (url.origin === self.location.origin) return;` is the FIRST non-URL-parsing statement in the fetch handler. RSC/API/WS traffic never enters SW path. |
| T-16-04-02 | T | mitigate — CLOSED | `public/sw.js:11` narrow allowlist (`['ufs.sh']`) + `:74` `response.ok && event.request.method === 'GET'` gate before `cache.put`. **Deviation note:** plan declared `['ufs.sh', 'i.imgur.com']` but executor removed imgur per UAT Test 3 (opaque-response ~7MB padding issue) with comment at `sw.js:8-10`. The mitigation (narrow allowlist + response.ok gate) remains — allowlist is narrower, not broader. Cache poisoning surface reduced. |
| T-16-04-03 | S | mitigate — CLOSED | `public/sw.js` served from `/public/sw.js` → same origin via Next static file serving; browser rejects cross-origin SW registration per W3C spec. No Service-Worker-Allowed header tricks (confirmed absent by grep). |
| T-16-04-04 | E | mitigate — CLOSED | `app/dev-unregister-sw/page.tsx:11-13` `if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_ENABLE_SW !== 'true') { notFound(); }` is the FIRST statement in the component body — precedes `useState` allocation and any UI render. |
| T-16-04-05 | D | mitigate — CLOSED | `app/providers.tsx:79` `.catch((err) => console.error('[SW] register failed:', err))` — failure logged, not thrown. Graceful degradation. |
| T-16-04-06 | I | accept — CLOSED | Logged in Accepted Risks. Cache contains only asset-CDN URLs (portrait images); no auth tokens/PII. Same-origin JS access boundary is the web platform default. |
| T-16-04-07 | T | mitigate — CLOSED | `.gitignore:35` `.env*.local` pattern catches `.env.local`. 16-04 SUMMARY confirms `.env.local` untouched in all 3 task commits (`git log --oneline -- .env.local` returns empty). |

### Plan 05 — viewport-primitives

| ID | Cat | Disposition | Evidence |
|----|-----|-------------|----------|
| T-16-05-01 | T | mitigate — CLOSED | `components/globals/viewport/SafariWarning.tsx:10-11,32` 2-pass render (`mounted=false` initial, effect flips it); `ViewportGate.tsx:59-61,83` `ssr: false` on dynamic + Skeleton-first for null resolution; `ViewportWriter.tsx:25` all detection inside `useEffect`. |
| T-16-05-02 | I | accept — CLOSED | Logged in Accepted Risks. `ViewportWriter.tsx:12` `SameSite=Lax`; viewport class non-sensitive. |
| T-16-05-03 | T | mitigate — CLOSED | `ViewportWriter.tsx:7` `const MAX_AGE = 60 * 60 * 24 * 365;` — explicit arithmetic form prevents missing-digit typo. Comment on `:6` verifies "NOT a magic 31536000 literal". |
| T-16-05-04 | T | mitigate — CLOSED | `lib/render-tier.ts:14` `export const VERSION = 1;` + `:51` `if (parsed.version !== VERSION) return null;` in `getCached`. Version mismatch forces re-probe. |
| T-16-05-05 | D | accept — CLOSED | Logged in Accepted Risks. `lib/render-tier.ts:73-76` single canvas + getContext — no shader compilation. |
| T-16-05-06 | S | accept — CLOSED | Logged in Accepted Risks. `lib/render-tier.ts:109-113` override branch runs first in `getRenderTier()` — FOUND-09 user-choice-wins requirement honored by design. |
| T-16-05-07 | I | accept — CLOSED | Logged in Accepted Risks. `lib/render-tier.ts:84-86` `WEBGL_debug_renderer_info` used locally only (result logged, cached locally, never sent to server). Chrome/Firefox expose extension by default. |
| T-16-05-08 | T | mitigate — CLOSED | `ViewportWriter.tsx:11` `location.protocol === 'https:' ? '; Secure' : ''` conditional appendix. HTTPS deploys get `Secure`, localhost HTTP dev does not (standard browser behavior — `Secure` on HTTP is rejected). |

### Plan 06 — docs-component-hygiene

| ID | Cat | Disposition | Evidence |
|----|-----|-------------|----------|
| T-16-06-01 | T | mitigate — CLOSED | `docs/frontend/component-hygiene.md` exists (15,657 bytes; Phase History row at :315 tagged `16 execution`). `docs/auth/architecture.md` Subscription Lifecycle section updated (`:214` AuthProvider reference; `:222` auth-subscriptions.test.ts regression guard; `:224` Middleware UX-only header; `:264-265` new `Phase 16 execution` Phase History row). CLAUDE.md `/gsd-verify-work` doc-update checkpoint remains the human-in-the-loop drift defense. |
| T-16-06-02 | I | accept — CLOSED | Logged in Accepted Risks. UX-only framing already present in REQUIREMENTS.md Out of Scope; doc restates for developer context. |
| T-16-06-03 | D | accept — CLOSED | Logged in Accepted Risks. Docs-only plan; 16-06 SUMMARY confirms both commits (`f4f999e`, `93da7ca`) landed without blocking. |

---

## Accepted Risks Log

Each row documents an accepted threat with the rationale verified against delivered code during this audit.

| Threat ID | Category | Component | Rationale (still accurate post-delivery) |
|-----------|----------|-----------|------------------------------------------|
| T-16-01-02 | Spoofing | `/draft/:matchId` becoming authed | Temporary gap between Plan 01 Commit 4 and Plan 03 middleware merge; no production deploy between commits. Plan 03 now shipped — gap closed. |
| T-16-01-03 | Tampering | npm supply chain | Standard npm trust model. CVE-2025-29927 patch is the motivating fix and is applied (Next 15.5.15 verified in package-lock). Higher-assurance mitigations (SRI, audit tooling) out of Phase 16 scope. |
| T-16-02-05 | Spoofing | Middleware cookie check as auth enforcer | Middleware is UX-only per REQUIREMENTS.md Out of Scope. Real gate is SpacetimeDB RLS. Route-group mount adds UX-level timing gate, not authorization. |
| T-16-02-06 | Elevation | `setProfileReady` setter exposed on auth context | `useAuth.ts:397-405` exposes setter with `@internal` JSDoc. Abuse only flips local UI state; no privilege granted. Convention-based mitigation. |
| T-16-03-02 | Spoofing | Manual cookie set bypasses redirect | Cookie-presence check is UX heuristic. Setting cookie grants zero data access; RLS remains the gate. |
| T-16-03-03 | Tampering | Cookie value tampering | Middleware checks presence only (`!cookie`), never contents. Tampered values pass through identically. |
| T-16-03-05 | Information | `console.log` path leak | D-33 requires bracketed logs. Path is in request URL — no new disclosure. |
| T-16-04-06 | Information | Cache Storage enumeration for same-origin JS | Only asset-CDN URLs cached. No auth tokens, no PII. Same-origin access is web platform boundary. |
| T-16-05-02 | Information | `vp` cookie reveals viewport class | Purpose is SSR-informed rendering. Viewport class is not sensitive. `SameSite=Lax` keeps cross-site contexts from seeing it. |
| T-16-05-05 | DoS | WebGL probe GPU-expensive | Single canvas + `getContext` + optional extension query; no shader compilation. Standard MDN feature-detection pattern. |
| T-16-05-06 | Spoofing | `localStorage` override bypasses Safari image-only | FOUND-09 explicitly requires the override to be honored. User choice wins by requirement. |
| T-16-05-07 | Information | `WEBGL_debug_renderer_info` fingerprint surface | Extension is browser-default for Chrome/Firefox. Result used locally only; not sent to server. No new fingerprinting surface created. |
| T-16-06-02 | Information | Doc reveals middleware-is-UX framing | Framing already in REQUIREMENTS.md Out of Scope. Restating it for developers. |
| T-16-06-03 | DoS | Non-coding plan blocks merge | Docs-only plan; no build/typecheck gate to fail. Wave 3 parallel with Wave 2, so schedule risk was contained. |

---

## Unregistered Flags

None. SUMMARY.md `## Threat Flags` sections were absent in 16-01, 16-02, 16-03, 16-04, 16-06 (no new attack surface flagged by executors) and present-but-empty ("None") in 16-05. No unregistered flags to log.

---

## Deviation Notes

### Plan 04 — service-worker ALLOWED_HOSTS

Plan 04 declared `ALLOWED_HOSTS = ['ufs.sh', 'i.imgur.com']` and T-16-04-02 cited the 2-host allowlist as mitigation. Executor shipped `public/sw.js:11` `ALLOWED_HOSTS = ['ufs.sh']` (imgur removed) per UAT Test 3 diagnosis: imgur lacks CORS support, forcing opaque responses with ~7MB quota padding per entry. VERSION bumped to 2 to invalidate stale caches.

**Security impact:** Allowlist NARROWER than declared, not broader. The mitigation (tight allowlist + `response.ok` gate before `cache.put`) is strengthened. Also note: CORS-mode re-issue at `sw.js:53-58` produces real (non-opaque) responses with accurate `content-length`, tightening the cache-poisoning surface further. Declared mitigation T-16-04-02 remains CLOSED.

### Plan 04 — cache.put error handling

`public/sw.js:78-81` wraps `cache.put` in `event.waitUntil` with `.catch(...)` — additional defense beyond plan declaration (quota-exceeded / Safari-private-mode swallowing). Pure additive hardening.

### Plan 03 — middleware self-redirect guard

`middleware.ts:14-15` adds `if (path === '/') return NextResponse.next();` as defense-in-depth against self-redirect loops if the matcher ever accidentally includes `/`. Additive hardening — does not weaken any declared mitigation.

---

## Next Actions

- Phase 16 is security-CLEAN per the declared threat register.
- No OPEN threats; no ESCALATE conditions.
- Downstream phases must honor the load-bearing invariants flagged in this audit:
  - Next.js must stay ≥15.2.3 (CVE-2025-29927 floor) — reinforce via `npm run build` CI gate.
  - SW `url.origin === self.location.origin` short-circuit MUST remain the FIRST fetch-handler statement.
  - `notFound()` MUST remain the FIRST statement in `app/dev-unregister-sw/page.tsx`.
  - Any addition of a new route-group to `middleware.ts` matcher MUST preserve positive-list discipline (no negative regex, no `/api`, no `/_next`, no `/sw.js`).
  - `lib/render-tier.ts` MUST retain zero React imports (D-21 — testable-in-isolation discipline).
  - Any new authed-route subscription MUST mount inside `app/(authed)/layout.tsx` or a deeper authed layout — route-group mount IS the structural privacy gate.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-19 | 36 | 36 | 0 | gsd-security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (21 mitigate / 15 accept / 0 transfer)
- [x] Accepted risks documented in Accepted Risks Log (14 entries)
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-19

---

*Phase: 16-route-global-foundation*
*Auditor: gsd-security-auditor*
*Completed: 2026-04-19*
