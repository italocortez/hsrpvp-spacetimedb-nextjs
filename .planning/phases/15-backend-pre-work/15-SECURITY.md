---
phase: 15
slug: backend-pre-work
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-13
---

# Phase 15 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

Consolidates threat models from all 6 Phase 15 plans (01-06). Mitigations verified against implementation + regression tests (30/30 green). Live UAT demonstrations for the two partial-update / PK-fix mitigations confirmed the wire-contract fix on maincloud.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Admin → admin_bulk_upsert | Admin-authenticated writer (ensureAdmin gate) mutates shared game-data tables | Game data rows (characters, lightcones, costs, pairings) — public-read |
| Client → history views | Any authenticated client subscribes to `view_my_*_history` — server-side `ctx.sender` filter is the boundary | Per-user match history (mmr, participant, session, step, result-game) — private |
| Operator → post-publish.ts | Operator runs bootstrap after `spacetime publish --delete-data` | SPACETIMEDB_SERVER_TOKEN written to .env.local; seed payloads |
| Seed JSON → admin_bulk_upsert | Disk-based templates (D-22 snake_case shape) transformed into router wire rows | Game data (same as admin lane) |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-15-01 | Tampering | admin_bulk_upsert HsrCharacter/HsrLightcone update branch | mitigate | `mergeForUpdate()` restricts overwrites to explicitly non-null fields (admin.ts:74). Regression: `test/backend/reducers/admin/partial-update.test.ts` (3 tests). Live UAT demo confirmed on maincloud (UAT Test 6). | closed |
| T-15-02 | Information Disclosure | 5 self-scoped history views | mitigate | Every view resolves `ctx.sender → UserIdentity.identity.find` before any row read; unmapped → `[]`. Regression: `test/backend/views/matchHistoryViews/isolation.test.ts` (18 assertions, I1-I4 invariants with two-identity harness). | closed |
| T-15-03 | Tampering (PK collision) | HsrCharacterCost / HsrLightconeCost / HsrSynergyCost existence check | mitigate | Existence loop includes `costSetId` in equality tuple (admin.ts D-09 fix). Regression: `test/backend/reducers/admin/cost-set-pk.test.ts` (4 tests). Live UAT demo confirmed on maincloud (UAT Test 5) — coexistence holds. | closed |
| T-15-04 | Tampering (data corruption) | Seed transform layer + round-trip | mitigate | `scripts/seed-data.ts` and `test/shared/seed-data.ts` iterate `Object.keys(cost).filter(k => k !== 'cost_set_id')` for 3-mode fan-out across all three cost types. Regression: `test/backend/seed/round-trip.test.ts` (5 tests). Live UAT: counts 83/83/83, 156/156/156, 10/10/10 across three modes (UAT Test 3). | closed |
| T-15-05 | Spoofing | ctx.sender / admin gate / view args | accept | `ensureAdmin(ctx)` unchanged; history views take no userId args; SpacetimeDB Core Rule #5 — `ctx.sender` is the authenticated principal and cannot be forged. No new auth surface added in Phase 15. | closed |
| T-15-docs-A | Repudiation | Phase 15 code delta | mitigate | `docs/admin/architecture.md`, `docs/views/architecture.md`, `docs/match/architecture.md` all updated with Phase 15 sections. Phase History tables list every decision with provenance tags. | closed |
| T-15-reorg-A | Tampering (barrel drift) | spacetimedb/src/index.ts | mitigate | Phase 12.2 rule enforced — every view named-re-exported. 8 grouped `export { ... } from './views/<domain>Views'` blocks. Build verified. | closed |
| T-15-reorg-B | Spoofing (binding rename drift) | src/module_bindings/view_*_table.ts | mitigate | Count invariant preserved. Pre-Phase-15: 32 view bindings. Post-Plan-04: 37 (+5 history views, no renames). Live UAT Test 8 confirmed `ls view_*_table.ts \| wc -l` = 37. | closed |
| T-15-schema-A | Denial of Service (migration) | hsr_character table | mitigate | Ops decision per plan: publish with `--clear-database` (v0.9 first commit, allowed pattern). No non-empty-table migration attempted. UAT Test 1 cold-start confirmed clean republish + reseed. | closed |
| T-15-schema-B | Spoofing (forged Spine URL) | hsr_character.skelUrl / atlasUrl / atlasImgUrls | accept | These columns carry public CDN URLs, not secrets. Tampering risk covered by admin-only write path (`ensureAdmin(ctx)`). Accepted — no additional control needed. | closed |
| T-15-router-A | Input Injection | admin_bulk_upsert validateKeys / validateEnum | mitigate | Strict key-set contract preserved (D-27). New Plan 02 keys in EXPECTED_KEYS; `validateEnumIfPresent()` wraps null-preserve path; `validateEnum` (strict) still runs on insert branch. | closed |
| T-15-view-A | Denial of Service (Pattern B scale) | Pattern B participant-first views | accept | RESEARCH.md Pitfall 5 — iteration is O(user's matches), not O(all matches). At 100 users × 156 matches, energy budget acceptable. Flagged for `tools/energy-model.js` pre-merge review in future phases. | closed |
| T-15-view-B | Tampering (view rename) | matchHistoryViews.ts view-name strings | mitigate | D-13 canonical names locked. ROADMAP.md + REQUIREMENTS.md + docs/match/architecture.md mirror the exact 5 names. Plan 04 acceptance grep verified; UAT Test 4 confirmed bindings present. | closed |
| T-15-seed-A | Tampering (costSet leakage) | costSetId lift from cost.cost_set_id | mitigate | Every fanned row carries `costSetId: cost.cost_set_id` (not hardcoded 0). Combined with T-15-03 PK tuple fix, non-default cost sets cannot collide with default set even if mis-lifted. | closed |
| T-15-seed-B | Information Disclosure | scripts/post-publish.ts | accept | Audit-only review in Plan 05 confirmed no new data surfaces. SPACETIMEDB_SERVER_TOKEN handling unchanged. .env.local write unchanged. No action required. | closed |
| T-15-seed-C | Tampering (enum injection) | snakeToPascalMode unknown-mode branch | mitigate | Unknown modes warn + skip at seed layer (don't throw); `validateEnum` in router rejects defence-in-depth. Tested path: any future data file with a bogus `foo_mode` key is logged and skipped without corrupting state. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation + regression guard) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-15-01 | T-15-05 | `ctx.sender` is the authenticated principal per SpacetimeDB Core Rule #5. No client-supplied userId args exist on any Phase 15 reducer or view. | Plan 03 / Plan 04 | 2026-04-13 |
| AR-15-02 | T-15-schema-B | Spine asset URLs are public CDN references, not secrets. Admin-only write path (`ensureAdmin`) is the sole mutation surface. | Plan 02 | 2026-04-13 |
| AR-15-03 | T-15-view-A | Pattern B participant-first iteration is O(user's matches), acceptable at 100 users × 156 matches scale. Flagged for future energy-model review if scale changes. | Plan 04 | 2026-04-13 |
| AR-15-04 | T-15-seed-B | Audit confirmed no new data surfaces in post-publish.ts. Token handling unchanged. | Plan 05 | 2026-04-13 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-13 | 16 | 16 | 0 | gsd-secure-phase (deterministic classification; mitigations cross-referenced with vitest regression suite + live UAT demos) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-13
