---
phase: quick-260401-7zs
plan: 01
subsystem: database
tags: [erd, mermaid, excalidraw, schema-audit]

requires:
  - phase: 09-lobby-draft-and-match-session
    provides: "All table definitions through Phase 9"
provides:
  - "Corrected mermaid ERD with accurate cardinalities and types for core entity cross-references"
  - "Corrected Excalidraw ERD with missing relationship arrows"
affects: [erd-maintenance, future-schema-audits]

tech-stack:
  added: []
  patterns: ["ERD audit against source table definitions"]

key-files:
  created: []
  modified:
    - notes/erd-mermaid.md
    - notes/erd.excalidraw

key-decisions:
  - "match_result_game_history.gameNumber also fixed u32->u8 (same type mismatch as match_result_game, found during audit)"
  - "Excalidraw arrows added with FK label text (sourceName, targetName) for discoverability"

patterns-established:
  - "ERD audit pattern: read each table source file, verify cardinality (optional vs required), verify column types, verify all FK relationships have corresponding lines"

requirements-completed: [AUDIT-CORE-ENTITIES]

duration: 4min
completed: 2026-04-01
---

# Quick Task 260401-7zs: Core Entities ERD Audit Summary

**Fixed 10 ERD inaccuracies: 6 cardinality corrections, 3 type fixes (including 1 bonus), and 2 missing relationship lines for cost_set_draft_synergy -> hsr_character**

## Performance

- **Duration:** 4 min
- **Started:** 2026-04-01T10:49:51Z
- **Completed:** 2026-04-01T10:54:01Z
- **Tasks:** 2 auto + 1 checkpoint
- **Files modified:** 2

## Accomplishments
- Fixed 6 cardinality mismatches between ERD and actual SpacetimeDB table definitions (required vs optional)
- Fixed 3 column type mismatches (match_result_game.gameNumber u32->u8, match_result_game_history.gameNumber u32->u8, leaderboard.rank u32->u16)
- Added 2 missing relationship lines for cost_set_draft_synergy -> hsr_character (sourceName, targetName)
- Added 2 corresponding arrows in Excalidraw diagram with FK labels

## Task Details

1. **Task 1: Fix mermaid ERD cardinalities, types, and missing relationships** - unstaged (notes/ is gitignored)
2. **Task 2: Update Excalidraw ERD to match mermaid corrections** - unstaged (notes/ is gitignored)
3. **Task 3: Human verification checkpoint** - awaiting user review

## Files Modified
- `notes/erd-mermaid.md` - 10 corrections applied: 6 cardinality fixes, 3 type fixes, 2 missing relationship lines
- `notes/erd.excalidraw` - 2 new arrow elements added (cost_set_draft_synergy -> hsr_character for sourceName and targetName)

## Corrections Applied

| # | Table | Field | Was | Now | Type |
|---|-------|-------|-----|-----|------|
| 1 | tournament | seasonId | required (`\|\|`) | optional (`o\|`) | Cardinality |
| 2 | tournament_stand_in | approvedByUserId | optional (`o\|`) | required (`\|\|`) | Cardinality |
| 3 | match_result_record | winnerUserId | required (`\|\|`) | optional (`o\|`) | Cardinality |
| 4 | mmr_history | seasonId | required (`\|\|`) | optional (`o\|`) | Cardinality |
| 5 | user_achievement | awardedById | optional (`o\|`) | required (`\|\|`) | Cardinality |
| 6 | tournament_participant | hsrAccountId | required (`\|\|`) | optional (`o\|`) | Cardinality |
| 7 | match_result_game | gameNumber | u32 | u8 | Type |
| 8 | match_result_game_history | gameNumber | u32 | u8 | Type (bonus) |
| 9 | leaderboard | rank | u32 | u16 | Type |
| 10 | cost_set_draft_synergy | sourceName/targetName -> hsr_character | missing | added | Relationship |

## Decisions Made
- match_result_game_history.gameNumber also corrected from u32 to u8 (same source type as match_result_game, caught during audit)
- Excalidraw diagram uses simplified labels without explicit cardinality markers; arrows added with FK name labels for the missing relationships

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Fixed match_result_game_history.gameNumber type**
- **Found during:** Task 1 (gameNumber type fix)
- **Issue:** match_result_game_history.gameNumber was also u32 in ERD but actual type is t.u8()
- **Fix:** Changed to u8 alongside the match_result_game fix (used replace_all)
- **Files modified:** notes/erd-mermaid.md
- **Verification:** grep confirms both instances now show u8

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Bonus correction for same type mismatch in history table. No scope creep.

## Issues Encountered
- Both ERD files are in notes/ which is gitignored -- changes saved to disk but not trackable via git diff. This is expected since these are working documentation files.

## Known Stubs
None.

## User Setup Required
None - no external service configuration required.

## Next Steps
- User should verify mermaid renders correctly at https://mermaid.live
- User should open erd.excalidraw to verify the new arrows render correctly
- Remaining ERD chunks (2-5) could be audited in future quick tasks

---
*Quick Task: 260401-7zs*
*Completed: 2026-04-01*
