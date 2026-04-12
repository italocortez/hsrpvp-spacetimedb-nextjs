# Phase 15: Backend pre-work - Discussion Log

> **Audit trail only.** Decisions captured in `15-CONTEXT.md`.

**Date:** 2026-04-12
**Phase:** 15-backend-pre-work
**Mode:** discuss (interactive)
**Areas analyzed:** View reorg, Spine columns, Admin router rework, View count/naming, Filter pattern

## User-initiated scope expansion

Before gray-area selection, user raised: "we may need to split anonymous views and security views, they are becoming god files." Phase 15 scope was expanded to fold the split into this phase (vs. inserting Phase 14.1 refactor).

**Decisions on expansion:**
- Split strategy: **Fold into Phase 15** (user selected — single coherent "backend pre-work" story).
- Granularity: **8 domain files matching tables/ layout** (user selected).

Files to split:
- `securityViews.ts` (915 lines) — contains 23 views, mostly `view_my_*`.
- `anonymousViews.ts` (453 lines) — actually mixes authed (`view_my_lobby_chat`, `view_my_match_participants`) and public/anonymous (`view_public_accounts`, `view_match_history`). Current naming was already misleading.

## Gray areas presented

### Spine asset column shape
| Option | Chosen | Notes |
|---|---|---|
| All optional (Recommended) | ✓ | null vs empty-string sentinel; arrays stay non-optional with empty = no Spine |
| Required with empty-string sentinel |  |  |
| Bundled optional struct |  | Rejected by flat-columns feedback |

### Admin reducer design
User selected: **"Refactor router to accept partial updates"** with free-text: *"We need to rework the router to accept partial updates, because sometimes we just wanna update the cost for certain characters for a specific cost set and we are also not taking that into account, I think this reducer is a bit outdated on how the project has evolved overall."*

Investigation confirmed two latent bugs:
- `admin.ts:267-279` — HsrCharacter case rebuilds full row with defaults before spread, zeroing unsent fields.
- `admin.ts:349-370` — HsrCharacterCost upsert keys on `(characterName, gameMode)` only, ignoring `costSetId`. Editing non-default cost sets silently overwrites the default set.

Both folded into phase scope as D-08 / D-09. Partial-update semantic applied to all 5 router cases (D-10).

### View count & naming
User selected: **All 5 history views**, with naming rule **"keep the same naming conventions as the tables to avoid misunderstandings"**.

Resolution: 5 views 1:1 with the 5 history tables (D-13):
- `view_my_match_session_history`
- `view_my_match_session_step_history`
- `view_my_match_participant_history`
- `view_my_mmr_history`
- `view_my_match_result_game_history`

ROADMAP Phase 15 success criteria and REQUIREMENTS FOUND-02 currently list 4 views under abbreviated names. Phase plan must update both artifacts (D-14).

### Filter pattern for userId-less tables
| Option | Chosen |
|---|---|
| Participant-first iteration (Recommended) | ✓ |
| Session-first filter |  |
| Server-side denormalize userId |  |

Rationale: leverages existing `MatchParticipantHistory.by_user` index; complexity O(user's matches) not O(all matches). Matches energy-budget priority (project memory).

## Corrections Made

None — all user answers confirmed Recommended options except the admin reducer path, where the user expanded scope with a concrete bug report. That concrete case drove D-08 / D-09 / D-10.

## Deferred

- Per-field Spine setters (rejected — router is the one edit path).
- Broader admin reducer audit beyond `admin_bulk_upsert`.
- Schema denormalization of userId onto session_history (revisit only if energy profiling shows join as hot spot).
- `match_result_participant` (non-history) view — out of scope.

## External Research

None required. Codebase evidence sufficient for all decisions.

---

## Round 2 — Template + seed pipeline rework (same day)

User surfaced (during plan-phase startup): "I updated `test/data-templates/characters_template.json` to use as a template for the expected upsert json. We need to do a similar approach for the lightcone data as well because I think that is also a bit stale with the current architecture."

### Staleness audit findings
- Character template (user-authored) switched to snake_case JSON + `cost_set_id` + 3-game-mode costs + Spine fields. Lightcone template was still camelCase (`imageUrl`), flat single-mode cost (`{S1-S5}`), `positioning.width: "120%"` string with `parseInt` transform.
- `GameMode` enum has 3 modes including `AnomalyArbitration`, but router/seed only ingested 2 for characters and 0 game modes for lightcones (single flat cost row).
- `HsrLightconeCost` PK is `(lightconeName, gameMode, costSetId)` — schema already supports 3-mode + cost-sets, just not exercised.
- Router `HsrCharacterCost` L349-370 has a costSetId-collision bug (same as D-09 catch).

### Decisions (this round)

User answers:
- **Field order for lightcone template:** mirror character template (locked).
- **`positioning` optionality:** optional in JSON (omit = no CSS tweak); required i32 columns on both tables with `(0, 0, 0)` defaults; add the 3 columns to `hsr_character` too (D-05a).
- **3-mode cost structure:** keep for characters. For lightcones, keep 3-mode since `HsrLightconeCost` schema supports it. (locked → D-22)
- **Positioning scope on characters:** normal `image_url` only; pedestal-specific positioning deferred to Phase 31 if needed (D-05b).
- **`cost_set_id`:** use `0` as default-set sentinel (v0.5 convention) — correction to user's original `cost_set_id: 1` in `characters_template.json`.
- **Edit approach:** author `_new`-suffixed template files alongside the originals; canonical rename happens at phase-commit time after all consumers are updated (D-28).
- **Fold into Phase 15:** cascade data-file rewrites (D-23/D-24), seed-data.ts rework (D-25), README transform-table rewrite (D-26) all into this phase.

### Authored artifacts this round
- `test/data-templates/characters_template_new.json` — corrects `cost_set_id` to 0, adds optional `positioning`, shows both "positioning present with zeros" (Acheron) and "positioning omitted" (Aglaea) examples.
- `test/data-templates/lightcones_template_new.json` — full rewrite: snake_case, 3-mode cost, cost_set_id:0, plain-int positioning, shows both "has CSS tweak" (adream) and "no tweak / omit positioning" (cornucopia) examples.

### Deferred (this round)
- Pedestal-specific positioning on characters — Phase 31 decides if separate columns are needed.
- `_new` → canonical rename — executes as a commit at phase close (D-28); intentionally deferred to keep old templates as reference until migration lands.

---

## Round 3 — Pairing template folded in

User: "pairing table template may need that rework as well"

Staleness audit on `pairing_template.json` confirmed same pattern: `source` / `pair_target` (doesn't match `HsrSynergyCost.sourceName`/`targetName`), 2-mode cost (`memoryofchaos`/`apocalypticshadow`) as flat numbers, no `cost_set_id`. Unlike characters/lightcones, `HsrSynergyCost.costModifier` is a single `f32` per (source, target, mode) — no E0-E6/S1-S5 sub-block.

### Decisions
- Pairing template folded into D-22 shape family with schema-appropriate single-number mode block. Lock: mode-block shape is type-specific (characters `{E0-E6}`, lightcones `{S1-S5}`, pairings single `f32`).
- Key renames: `source` → `source_name`, `pair_target` → `target_name`, `memoryofchaos` → `memory_of_chaos`, etc.
- `anomaly_arbitration` mode added (copies `apocalyptic_shadow` — current data has no per-mode divergence for synergies).

### Authored artifacts
- `test/data-templates/pairing_template_new.json` — 2 example entries (cerydra+anaxa, feixiao+moze).

### CONTEXT.md updates
- D-22 extended to include pairings.
- D-24a added (data-file rewrite for pairing_table.json).
- D-25 extended with synergy transform rules.

---

## Round 4 — Data file migration chore

User: "Now that we know the template, I need you to update what we have in character_table.json and lightcone_table.json at the data/ folder. First rename the existing ones appending _old and then create a new file that follows the structure of the new template. If the data is not there, just default 0 or empty string if possible."

Then (follow-up): "pairing table also needs this."

### Approach
Authored one-shot Node migration scripts in `test/data/` (deleted after use), driven by the same transform rules that will eventually live in `scripts/seed-data.ts`. Rename preserved originals under `_old` suffix for verification reference.

### Migrations executed
| File | Entries | Rules applied |
|---|---|---|
| `characters_table.json` | 83 | `imageUrl` → `image_url`; added `skel_url: ""`, `atlas_url: ""`, `atlas_img_url: []`, `positioning: {0,0,0}`; 2-mode → 3-mode cost fan-out (AA copies ApocalypticShadow) |
| `lightcones_table.json` | 156 | `imageUrl` → `image_url`; `positioning.width: "120%"` → `120` int; flat `{S1-S5}` → 3-mode fan-out; `cost_set_id: 0` added |
| `pairing_table.json` | 10 | `source` → `source_name`, `pair_target` → `target_name`; mode keys snake_case; `anomaly_arbitration` added (copies ApocalypticShadow); `cost_set_id: 0` wrapper added |

Originals preserved at `characters_table_old.json`, `lightcones_table_old.json`, `pairing_table_old.json`.

### Missing-data defaults (locked)
- Strings: `""`
- Arrays: `[]`
- Integers: `0`
- `cost_set_id`: `0` (default-set sentinel)

These defaults also bind the seed transform in D-25 (single source of truth for null-handling).

---

## Round 5 — Canonical template promotion

User: "I removed your _new at data templates and updated the old ones so we point to those for the phase context."

User manually dropped the `_new` suffix and overwrote the canonical template files (`characters_template.json`, `lightcones_template.json`, `pairing_template.json`). Templates are now the authoritative source of truth — no rename-at-close step needed.

### CONTEXT.md updates
- D-22 rewritten to point at canonical template paths.
- D-23 / D-24 / D-24a marked "already migrated" with `_old` files preserved for reference.
- D-28 struck through (superseded — templates already canonical).
- Code-to-touch list updated to show data migrations as done.

---

## Round 6 — Seed file audit

User: "We have seeding functions that bootstrap our database using the data in data/ folder, we will need to touch those in this phase as well."

### Grep audit findings
Two seed files own the normalization logic today, both will break against the D-22 shape:

| File | Lines | Role |
|---|---|---|
| `scripts/seed-data.ts` | 378 | Production seed, called by `scripts/post-publish.ts` after schema publish |
| `test/shared/seed-data.ts` | 182 | Test-harness seed (duplicated character/lightcone normalization) |
| `test/shared/fixtures.ts` | 76 | Supporting test fixtures (audit for old-shape leaks) |

Both current seeds reference old-shape keys (`imageUrl`, `memoryofchaos`, `pair_target`).

### Decisions (this round)
- D-25 expanded to name concrete paths and cover BOTH seeds in lockstep (so they don't drift).
- D-25a added — audit `scripts/post-publish.ts` for old-shape assumptions; avoid touching orchestration per `feedback_post_publish_only` memory.
- Open planner discretion: extract a shared `transforms.ts` module to eliminate today's duplicate normalization (lean toward yes; defer is acceptable).

### Code-to-touch list refreshed
Replaced the earlier placeholder `seed-data.ts (root or wherever...)` with the three real paths, tagged each with line count and role for the planner.
