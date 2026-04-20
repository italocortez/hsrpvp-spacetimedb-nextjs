# Phase 15: Backend pre-work - Context

**Gathered:** 2026-04-12
**Status:** Ready for planning

<domain>
## Phase Boundary

SpacetimeDB exposes the backend capabilities every v0.9 frontend phase depends on:
1. Spine asset columns + positioning columns on `hsr_character` so pedestal (Phase 31) and card renderers read skeleton/atlas URLs and CSS offsets from subscriptions.
2. Five self-scoped history views (1:1 with the five `*_history` tables) filtered server-side by `ctx.sender` so profile/history pages (Phase 24+, Phase 40/41) can subscribe without client-side filtering.
3. A view-file reorganization that lands BEFORE the new history views are written, so they arrive in their permanent home (`matchHistoryViews.ts`) instead of deepening the existing god files.
4. A rework of the admin upsert router so the new columns (and pre-existing gaps) are served through a single well-behaved partial-update path.
5. A full seed/template/data rework aligning character + lightcone JSON to a single snake_case shape with `cost_set_id` + 3-game-mode cost blocks + optional `positioning`, so the admin path stays coherent once Spine and positioning columns land.

All five strands are "backend pre-work" — each removes a blocker for downstream v0.9 frontend phases, none introduces user-facing UX.

</domain>

<decisions>
## Implementation Decisions

### View file reorganization (lands first)

- **D-01:** Split `spacetimedb/src/views/securityViews.ts` (915 lines) and `spacetimedb/src/views/anonymousViews.ts` (453 lines) into 8 domain files matching the `tables/` directory layout. Current files are organized inconsistently (`anonymousViews.ts` actually holds authed `view_my_lobby_chat`, `view_my_match_participants`, etc.) — rename by domain, not by auth scope.
- **D-02:** Target file layout:
  - `views/lobbyViews.ts` — `view_lobby_browser`, `view_my_lobbies`, `view_my_lobby_chat`, `view_my_lobby_members` (4)
  - `views/identityViews.ts` — `view_my_identity`, `view_my_profile`, `view_user_directory`, `view_public_accounts`, `view_admin_user_private` (5)
  - `views/costSetViews.ts` — `view_my_cost_sets`, `view_my_draft_character_costs`, `view_my_draft_lightcone_costs`, `view_my_draft_synergy_costs` (4)
  - `views/statsViews.ts` — `view_my_player_stats`, `view_my_character_stats` (2)
  - `views/socialViews.ts` — `view_my_relationships`, `view_my_roster_visibility`, `view_my_roster` (3)
  - `views/matchViews.ts` — `view_my_match_steps`, `view_my_match_participants` (2)
  - `views/matchHistoryViews.ts` — `view_match_history`, `view_match_participant_history`, `view_match_step_history` **+ 5 new history views** (8)
  - `views/tournamentViews.ts` — 7 existing tournament views
- **D-03:** Refactor is move-only — no semantic changes, no rename of any existing view. Preserve every `spacetimedb.view(...)` call verbatim; only import paths change. `index.ts` re-exports stay intact so downstream clients see identical surface.
- **D-04:** Refactor commit lands BEFORE the new history views in the phase plan so the 5 new views are authored in their permanent home from day one.

### Spine asset columns on hsr_character

- **D-05:** Add 3 new columns to `hsrCharacterColumns` in `spacetimedb/src/tables/hsrCharacter.ts`:
  - `skelUrl: t.string().optional()`
  - `atlasUrl: t.string().optional()`
  - `atlasImgUrls: t.array(t.string())` (empty array = no Spine; arrays cannot cheaply be optional)
- **D-06:** Optional semantics over empty-string sentinels — most characters lack Spine assets initially; `null` beats `''` for "not set". Flat columns (not a nested struct) per the project's flat-columns convention.
- **D-07:** `test/data/characters_table.json` is rewritten to the new snake_case shape (see D-23); Spine fields included per entry (stringly-optional, array `[]` where absent).

### Positioning columns on hsr_character and hsr_lightcone

- **D-05a:** Add 3 new columns to `hsrCharacterColumns`:
  - `posX: t.i32()`, `posY: t.i32()`, `width: t.i32()`
  - Required columns with `0` defaults when JSON upsert omits the `positioning` block. Mirrors the existing 3 columns on `HsrLightcone`.
- **D-05b:** Scope the positioning columns on characters to the `image_url` card rendering — Pedestal-specific positioning (Phase 31) is separate and NOT added here. If Pedestal later needs its own offsets, those are new columns at that time.
- **D-05c:** `HsrLightcone` already has `posX`/`posY`/`width` — no schema change; router partial-update fix (D-08/D-10) still applies.

### Admin upsert router rework (bug fixes + partial updates)

- **D-08:** Rework `admin_bulk_upsert` in `spacetimedb/src/reducers/admin.ts:251` to accept **true partial updates**. Current `HsrCharacter` case at L267-279 rebuilds a full row with defaults (`imageUrl: r.imageUrl || ''`) before spread, so unsent fields get zeroed instead of preserved. Fix: only merge keys actually present in incoming JSON; never inject defaults for missing keys on an existing row.
- **D-09:** Fix `HsrCharacterCost` upsert at L349-370 to match on `(characterName, gameMode, costSetId)` tuple, not just `(characterName, gameMode)`. Current behavior silently overwrites the default cost set when admin edits a non-default one. Honor `costSetId=0` sentinel for the default set (carries forward from v0.5).
- **D-10:** Apply the partial-update principle to all 5 existing table cases in the router (`HsrCharacter`, `HsrLightcone`, `HsrCharacterCost`, `HsrSynergyCost`, `HsrLightconeCost`). Touching them here is the point — the router is the single edit surface the user wants reworked.
- **D-11:** No dedicated `set_character_spine_assets` reducer. Spine columns ride the reworked router. One edit path, one test harness.
- **D-12:** Insert-case (new row) still applies required defaults; partial-update semantics only apply when `existing` is found. Schema-required fields must still be present on insert.

### Self-scoped history views (5, not 4)

- **D-13:** Create 5 views — one per existing history table — named 1:1 with the table name to eliminate naming ambiguity:
  - `view_my_match_session_history` (backed by `match_session_history`)
  - `view_my_match_session_step_history` (backed by `match_session_step_history`)
  - `view_my_match_participant_history` (backed by `match_participant_history`)
  - `view_my_mmr_history` (backed by `mmr_history`)
  - `view_my_match_result_game_history` (backed by `match_result_game_history`)
- **D-14:** ROADMAP.md Phase 15 success criteria and REQUIREMENTS.md FOUND-02 both list 4 views with abbreviated names (`view_my_match_history`, `view_my_session_history`, `view_my_participant_history`, `view_my_mmr_history`). **Planner must update those two artifacts** to match the 5 new names before phase execution so downstream phases reference the right subscription targets.
- **D-15:** All 5 views are `public: true` (SpacetimeDB public view semantics — visibility gated server-side by `ctx.sender`, matching every existing `view_my_*` in the codebase).
- **D-16:** Views live in `views/matchHistoryViews.ts` (created by the D-01/D-02 reorg).

### View filter pattern

- **D-17:** For tables with a direct `userId` column (`match_participant_history`, `mmr_history`), filter on the existing `by_user` btree index inside the view body.
- **D-18:** For tables WITHOUT `userId` (`match_session_history`, `match_session_step_history`, `match_result_game_history`), use **participant-first iteration**:
  1. Iterate `ctx.db.MatchParticipantHistory.by_user.filter(sender)` to collect `matchHistoryId`s.
  2. Lookup each session/step/game history row by PK or index.
  3. Dedupe only if iteration can yield the same target row twice (participant_history PK is `(userId, matchHistoryId)` so dedupe unneeded for per-match lookups).
- **D-19:** Complexity is O(user's matches), not O(all matches) — matters for the 100-user/156-lobby energy budget (see `project_data_scale` memory).

### Seed pipeline, templates, and data files

- **D-22:** Canonical template shape — **already in place** as the authoritative templates in `test/data-templates/`:
  - `test/data-templates/characters_template.json`
  - `test/data-templates/lightcones_template.json`
  - `test/data-templates/pairing_template.json`
  Principles: snake_case keys throughout; `cost` is a wrapping object with `cost_set_id` (integer, `0` = default sentinel) + one block per game mode (`memory_of_chaos`, `apocalyptic_shadow`, `anomaly_arbitration`); mode-block shape is type-specific — `{E0-E6}` for characters, `{S1-S5}` for lightcones, single `f32` cost modifier for pairings (matches `HsrSynergyCost.costModifier`); `positioning` is optional in JSON (convention: include with `{0,0,0}` when no tweak) but DB columns are required i32 with `0` defaults; Spine fields (`skel_url`, `atlas_url`, `atlas_img_url`) live only on characters and are optional; pairings use `source_name`/`target_name` (was `source`/`pair_target`) to align with `HsrSynergyCost.sourceName`/`targetName`. **These template files are the contract — downstream agents treat them as the source of truth for the upsert JSON shape.**
- **D-23:** `test/data/characters_table.json` — **already migrated** to the D-22 shape (83 entries). Original preserved at `test/data/characters_table_old.json` for reference. Migration rules applied: `imageUrl` → `image_url`; added `skel_url: ""`, `atlas_url: ""`, `atlas_img_url: []`, `positioning: {0,0,0}`; cost fanned out from 2 modes to 3 (AnomalyArbitration copies ApocalypticShadow values).
- **D-24:** `test/data/lightcones_table.json` — **already migrated** to the D-22 shape (156 entries). Original preserved at `test/data/lightcones_table_old.json`. Migration rules: `imageUrl` → `image_url`; `positioning.width` parsed from `"120%"` string to plain int; flat `{S1-S5}` fanned out to 3-mode cost; `cost_set_id: 0` added.
- **D-24a:** `test/data/pairing_table.json` — **already migrated** to the D-22 shape (10 entries). Original preserved at `test/data/pairing_table_old.json`. Migration: `source` → `source_name`, `pair_target` → `target_name`; mode keys snake_case; `anomaly_arbitration` added (copies ApocalypticShadow); wrapped with `cost_set_id: 0`.
- **D-25:** Rewrite BOTH seeding entry points to consume the D-22 shape. Currently two files hold duplicated normalization logic that reads old-shape JSON (`imageUrl`, `memoryofchaos`, `pair_target`):
  - `scripts/seed-data.ts` (378L) — production seed invoked by `scripts/post-publish.ts` to bootstrap maincloud after schema publish. Has typed `RawCharacter` / `RawLightcone` / `RawPairing` + normalization fns `toCharacterRow`, `toLightconeRow`, cost extractors (L94-236+).
  - `test/shared/seed-data.ts` (182L) — test-harness seed. Duplicates the character/lightcone transform (different call surface but same shape translation).
  - `test/shared/fixtures.ts` (76L) — audit for any leaked old-shape assumptions; likely imports from the test seed.
  Rework both seeds together (single phase commit) so they stay in sync:
  - Update `Raw*` type declarations to match D-22 (snake_case, 3-mode cost, `cost_set_id` at cost-object top-level, `positioning` optional, Spine fields on character).
  - Enum PascalCase conversion preserved.
  - `cost.cost_set_id` lifts to every fanned-out row's `costSetId` (previously hardcoded to `0`).
  - 3-mode cost fan-out for characters, lightcones, AND pairings; AnomalyArbitration ingested for all three — not just the 2 current modes. Unknown-gameMode warnings stay.
  - `positioning` block → `posX`/`posY`/`width` ints; missing block → `(0, 0, 0)`.
  - Spine passthrough on characters: `skel_url` → `skelUrl`, `atlas_url` → `atlasUrl`, `atlas_img_url` → `atlasImgUrls`. Absent → `''`/`[]` (to match D-06 schema semantics; empty-string OK because downstream clients can check falsy).
  - Pairing transform: `source_name` → `sourceName`, `target_name` → `targetName`, `cost.<mode>` (number) → `costModifier` on a per-mode row.
  - Consider extracting the shared transform into a single `test/shared/transforms.ts` (or `scripts/shared/`) to eliminate the current duplication — Claude's discretion whether to refactor during this phase or leave as follow-up.
- **D-25a:** `scripts/post-publish.ts` itself: audit for any old-shape assumptions (e.g., it may reference `characters_table.json` fields directly). Update if needed. Do not otherwise modify its orchestration (per feedback memory `feedback_post_publish_only`).
- **D-26:** Rewrite `test/data-templates/README.md` transform tables to reflect the D-22 shape. Old tables showing `cost.memoryofchaos` → row mappings are replaced with the new 3-mode fan-out and the Spine/positioning conventions. Notes section retains `costSetId: 0` sentinel explanation.
- **D-27:** Router (`admin_bulk_upsert`) does NOT change shape for this work — it still accepts camelCase rows. All snake_case handling stays in `seed-data.ts`. The router's concern is only partial updates + `costSetId` in the PK match (D-08 through D-12). This keeps the seed/JSON reshape and the router rework independently testable.
- **D-28:** ~~`_new` template rename step~~ — **superseded**. User dropped the `_new` suffix and overwrote the canonical template files directly; templates are now the source of truth. No rename step needed. `_old` data files remain as migration-reference until the phase is verified green, then may be deleted in a cleanup commit (Claude's discretion).

### Integration tests

- **D-20:** Add integration tests asserting cross-user isolation for all 5 new views — one user's rows must never surface for another user. Test-file creation is authorized by FOUND-02 success criteria #4 (explicit task override of the general "no test-file edits" rule).
- **D-21:** Tests also cover the admin_bulk_upsert rework — specifically that `HsrCharacterCost` with distinct `costSetId`s does not collide, and that unsent fields on `HsrCharacter` partial updates are preserved.
- **D-21a:** Seed round-trip test — run `post-publish.ts` against a clean database with the new template shape and assert that characters land with Spine + positioning fields, lightcones land with 3-mode cost rows, and all three game modes have rows in `HsrCharacterCost` and `HsrLightconeCost`.

### Claude's Discretion

- Which runner/harness to use for integration tests (follow whatever pattern existing `spacetime-module` test coverage uses).
- Exact wire format for the partial-update semantic (e.g., whether `null` in JSON means "clear field" vs "leave unchanged") — planner picks a convention and documents it.
- Audit-log messages and console.log wording.
- Order of operations within a single commit when the reorg + new views share a file.

### Folded Todos

None — no pending todos matched Phase 15 scope.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase requirements
- `.planning/ROADMAP.md` §Phase 15 (L127-136) — Phase goal, success criteria, FOUND-01/FOUND-02 mapping.
- `.planning/REQUIREMENTS.md` L18-19, L243-244 — FOUND-01 (Spine columns + admin reducer) and FOUND-02 (4 history views — **will be updated to 5 during this phase**, D-14).
- `.planning/research/DECISIONS.md` R1 — 27-phase structure rationale (Phase 15 as foundation entry).

### Architecture and conventions
- `.planning/codebase/CONVENTIONS.md` — project patterns and naming.
- `.planning/codebase/ARCHITECTURE.md` — module structure.
- `CLAUDE.md` — SpacetimeDB core rules (reducer transactional/deterministic, ctx.sender trust, energy budget).
- `notes/v09-frontend-subscription-strategy.md` — v0.9 subscription strategy (history views consumed by profile/history pages).

### Code to touch
- `spacetimedb/src/tables/hsrCharacter.ts` — add Spine columns + `posX`/`posY`/`width` i32 columns (D-05, D-05a).
- `spacetimedb/src/reducers/admin.ts` L251-400+ — `admin_bulk_upsert` router rework (HsrCharacter + HsrCharacterCost fixes, partial-update semantics across all 5 table cases).
- `spacetimedb/src/views/securityViews.ts` — split into 8 domain files per D-02.
- `spacetimedb/src/views/anonymousViews.ts` — split into 8 domain files per D-02.
- `spacetimedb/src/views/index.ts` (if exists) — re-export surface unchanged.
- `scripts/seed-data.ts` (378L) — production seed: rewrite `Raw*` types + normalization fns to consume D-22 shape (D-25).
- `test/shared/seed-data.ts` (182L) — test-harness seed: same rework as production seed (D-25).
- `test/shared/fixtures.ts` (76L) — audit for old-shape leaks (D-25).
- `scripts/post-publish.ts` — audit only; minimal changes unless it touches data shape directly (D-25a).
- `test/data/characters_table.json` — already migrated (D-23); `characters_table_old.json` preserved for reference.
- `test/data/lightcones_table.json` — already migrated (D-24); `lightcones_table_old.json` preserved.
- `test/data/pairing_table.json` — already migrated (D-24a); `pairing_table_old.json` preserved.
- `test/data-templates/characters_template.json` — **canonical template** (source of truth for upsert JSON shape, D-22).
- `test/data-templates/lightcones_template.json` — canonical template (D-22).
- `test/data-templates/pairing_template.json` — canonical template (D-22).
- `test/data-templates/README.md` — transform-table rewrite still pending (D-26).

### Backing tables for history views
- `spacetimedb/src/tables/matchParticipantHistory.ts` — PK `(userId, matchHistoryId)`, index `by_user`.
- `spacetimedb/src/tables/mmrHistory.ts` — index `user_id`.
- `spacetimedb/src/tables/matchSessionHistory.ts` — no userId, filter via participant join.
- `spacetimedb/src/tables/matchSessionStepHistory.ts` — no userId, filter via participant join.
- `spacetimedb/src/tables/matchResultGameHistory.ts` — no userId, filter via participant join.

### Reference patterns
- `spacetimedb/src/views/securityViews.ts:710` — `view_my_tournament_matches` (cross-table filter pattern to mimic for participant-first iteration).
- `spacetimedb/src/views/securityViews.ts:378` — `view_my_character_stats` (simple direct-userId filter pattern).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `spacetimedb.view(...)` helper — 30+ call sites already established; new history views follow identical shape.
- `MatchParticipantHistory.by_user` btree index — already exists on the table, enables efficient participant-first iteration (D-18) without a new index.
- `mmrHistory.user_id` btree index — enables direct filter for `view_my_mmr_history` (D-17).
- `auditUpdate`/`auditInsert` helpers in admin.ts — continue to be used during partial-update rework.
- `validateEnum` + `validateKeys` in admin.ts — keep applying to the subset of keys actually present in each partial update.

### Established Patterns
- `view_my_*` + `public: true` — every authed view in the codebase uses this shape; `ctx.sender` gates visibility server-side (23 existing examples).
- Flat columns over nested structs for filterable data (project feedback memory).
- `lastModifiedById`/`lastModifiedDate` audit cascade via `auditUpdate(ctx, existing, adminId)`.
- `costSetId=0` sentinel for the default cost set (v0.5 convention; D-09 honors it).
- Generic router reducer with switch-per-table (`admin_bulk_upsert`, `admin_delete_row` in admin.ts) — D-08/D-10 extend this pattern rather than replacing it.

### Integration Points
- Generated TypeScript bindings — consumed by the frontend in every v0.9 feature phase. After Phase 15, Spine columns and 5 new subscribable views must appear in the generated SDK.
- `providers.tsx` (Phase 16) — will NOT subscribe to the new history views (per R3 minimal authed base); feature pages own their own subscriptions.
- Profile/history feature phases (24+, 40/41) — consume the 5 new views as their sole data source.
- Pedestal (Phase 31) — reads `skelUrl`/`atlasUrl`/`atlasImgUrls` from the published `hsr_character` subscription.
- `post-publish.ts --clear-database` — the seed flow re-ingests `characters_table.json` through `admin_bulk_upsert`; D-07 data additions must survive a full reseed.

</code_context>

<specifics>
## Specific Ideas

- "I think this reducer is a bit outdated on how the project has evolved overall" — user surfaced the `HsrCharacterCost` costSetId bug and the missing-partial-update behavior as the real motivation for the router rework. Rework is not cosmetic; it fixes latent bugs.
- "Keep the same naming conventions as the tables to avoid misunderstandings" — drives D-13's 1:1 table-to-view naming and the D-14 ROADMAP/REQUIREMENTS correction.
- `test/data/characters_table.json` was cited as the shape that flows through the admin path — the rework should make that data shape (plus Spine + positioning columns) round-trip cleanly.
- Reorg intent: "splitting these god files before adding the 4 new history views so future-me knows what each file does." D-04 enforces refactor-then-add ordering.
- User explicitly wrote `characters_template.json` as the new reference shape, then asked for the lightcone template to be brought inline ("I think that is also a bit stale with the current architecture"). Lock-in: define template shape first (D-22), then cascade data (D-23/D-24) → seed (D-25) → README (D-26).
- User request: "append the _new to the name so we dont overwrite the old one" — authored `_new` templates on disk; canonical rename is a final step in the phase (D-28) after all consumers are reworked.
- Lightcone `positioning.width: "120%"` string with `parseInt` strip was the explicit staleness signal. New shape uses plain int (D-22) to remove the transform.

</specifics>

<deferred>
## Deferred Ideas

- `view_my_match_result_participant` (non-history) — NOT added; history tables are the focus of Phase 15. The live non-history match views already exist (`view_my_match_participants`).
- Per-field Spine setter reducers — explicitly rejected (D-11). If a future UI needs atomic single-field edits without admin-level bulk upsert, that's a separate phase.
- Broader admin reducer audit beyond the 5 table cases in `admin_bulk_upsert` — the rework is scoped to those cases. Other admin reducers (`admin_update_user`, `admin_delete_row`) stay untouched.
- Schema denormalization of `userId` onto `match_session_history` — explicitly rejected (D-18 rationale). Would avoid joins but requires backfill and reducer updates everywhere sessions are written. Revisit only if energy budget shows participant-first iteration as a hot spot.
- Phase 40 (Historical + replay) per-game rendering — consumes `view_my_match_result_game_history` from this phase; actual rendering is out of scope here.

### Reviewed Todos (not folded)

None — no pending todos matched phase scope.

</deferred>

---

*Phase: 15-backend-pre-work*
*Context gathered: 2026-04-12*
