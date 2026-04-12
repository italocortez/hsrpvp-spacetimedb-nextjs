---
phase: 09-mouse-tracking-chat-and-lobby-browser
plan: 06
subsystem: database
tags: [spacetimedb, draft, pick-ban, classic-draft, auction, timer, undo, pause, resume]

# Dependency graph
requires:
  - phase: 09-01
    provides: LobbyStage/BanMode/ActionType enums, MatchSession/MatchResultRecord/MatchResultParticipant tables, LobbyMember with isConfirmed/isCaptain/isCoach
  - phase: 09-02
    provides: lobbyHelpers (ensureLobbyMember, ensureHostOrAbove, ensureStageIs), getAuthenticatedUser
  - phase: 09-04
    provides: Lobby with allowMirrorPicks/autoRandomPick/refereeCanUndo/refereeCanPause/allowPlayerPause
provides:
  - "buildClassicSequence: exact 0/4/6-ban DraftStep[] from notes/draft_order.md"
  - "buildAuctionBanSequence: ban-only DraftStep[] for Auction mode"
  - "start_draft reducer: validates all-confirmed, creates MatchSession/MatchResultRecord/MatchResultParticipant"
  - "pick_character reducer: coach guard, captain check, mirror pick, ownership validation"
  - "ban_character reducer: coach guard, captain check, availability"
  - "timer_expiry_classic reducer: auto-EMPTY or deterministic hash pick/ban on expiry"
  - "undo_last_step reducer: referee-only last-step undo with audit record"
  - "pause_draft reducer: 3/team player limit + unlimited referee pause"
  - "resume_draft reducer: pauser or referee resume with clock restoration"
affects: [09-07-PLAN, 09-08-PLAN, draft-UAT]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Draft sequence as static array: sequences are pre-computed at start_draft time and stored in MatchSession.draftSequence for replay fidelity"
    - "Deterministic hash for auto-pick: (turnIndex * 31 + lobbyId) % availablePool.length — reproducible without randomness (D-43b)"
    - "Timer state accumulatedPauseMs pattern: resume sets accumulatedPauseMs to the timeRemainingMs snapshot from Pause step, so the clock continues from pause point"
    - "System actor userId=0 for auto-actions (timer expiry) in MatchSessionStep records"

key-files:
  created:
    - spacetimedb/src/helpers/draftSequences.ts
    - spacetimedb/src/reducers/draftClassic.ts
    - spacetimedb/src/reducers/draftControl.ts
  modified:
    - spacetimedb/src/index.ts
    - src/module_bindings/ (regenerated — 7 new reducer files)

key-decisions:
  - "autoRandomPick prereq validation is in start_draft (not lazy): fails-fast before draft begins if any player lacks characters"
  - "Captain check is non-blocking when no captain exists: sole player can pick/ban without being isCaptain"
  - "System actor (userId=0) used for timer_expiry_classic steps — client still identifies the acting team from actorSlot"
  - "Resume sets accumulatedPauseMs to snapshot value from Pause step — clock runs backward from that snapshot"
  - "undo_last_step inserts an Undo audit record before decrementing turnIndex — full audit trail of all actions including undos"

patterns-established:
  - "DraftStep fields are camelCase: actionRequired and teamTurn (not action_required/team_turn)"
  - "All draft actions check member.isCoach early (MOUS-03 guard)"
  - "MatchSession uses lobbyId as PK — update via ctx.db.MatchSession.lobbyId.update()"

requirements-completed: [MOUS-03]

# Metrics
duration: 25min
completed: 2026-03-29
---

# Phase 09 Plan 06: Classic Draft System Summary

**Classic draft pick/ban system with 7 reducers: start_draft initializes match state with validated sequences, pick/ban enforce MOUS-03 coach guard + ownership + mirror-pick rules, timer_expiry handles auto-EMPTY and deterministic hash picks (D-43b), undo/pause/resume implement the full draft control permission model.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-03-29T11:40:00Z
- **Completed:** 2026-03-29T12:04:35Z
- **Tasks:** 2
- **Files modified:** 4 new + regenerated bindings

## Accomplishments
- Draft sequence helper generates exact 16/20/22-step Classic sequences and ban-only Auction sequences from notes/draft_order.md
- start_draft creates full match state (MatchSession, MatchResultRecord, MatchResultParticipant), validates ready-up (D-29), assigns captains (D-30), checks autoRandomPick prerequisites (D-43b)
- pick_character and ban_character enforce coach guard (MOUS-03), captain-only picks, allowMirrorPicks (D-42), validateCharacterOwnership (D-40)
- timer_expiry_classic uses deterministic hash `(turnIndex * 31 + lobbyId) % availablePool.length` for auto-random picks (D-43b) or falls back to EMPTY CHARACTER (D-43)
- Draft control: undo (referee-only, D-60), pause with 3/team limit (D-61), resume with clock restoration from Pause step snapshot (D-62)
- Module published to maincloud, 7 new reducer bindings generated

## Task Commits

1. **Task 1: draftSequences.ts + draftClassic.ts** - `8ef2543` (feat)
2. **Task 2: draftControl.ts + publish + bindings** - `8dab0de` (feat)

## Files Created/Modified
- `spacetimedb/src/helpers/draftSequences.ts` - buildClassicSequence + buildAuctionBanSequence
- `spacetimedb/src/reducers/draftClassic.ts` - start_draft, pick_character, ban_character, timer_expiry_classic
- `spacetimedb/src/reducers/draftControl.ts` - undo_last_step, pause_draft, resume_draft
- `spacetimedb/src/index.ts` - exports for 7 new reducers
- `src/module_bindings/` - regenerated with new reducer bindings

## Decisions Made
- autoRandomPick prerequisite validation moved entirely into start_draft — fails fast before draft begins if any player lacks characters (cleaner than lazy-check at timer expiry)
- Captain check is bypass-able: if no captain exists on a team, any non-coach player can pick/ban — avoids blocking drafts where set_captain was never called
- System actor (userId=0) records timer_expiry steps so audit log clearly identifies automatic vs manual actions
- Resume sets `accumulatedPauseMs` to the snapshot value from the Pause step — the timer effectively continues from where it was paused
- Undo inserts an explicit Undo audit record at the current turnIndex before decrementing — full audit trail even for undo operations

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Worktree was branched off `main` (old branch), missing all phase 9 work. Merged `feature_nath_claude` into the worktree branch before proceeding. Confirmed merge was clean and all phase 9 helpers/tables were available.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Plan 07 (Auction draft: nominate_character, place_bid, pass_bid, resolve_nomination) depends on start_draft's MatchSession initialization — ready
- Plan 08 (post-draft equip/lineup/scoring) depends on Equipping stage transition from pick_character — ready
- All draft reducers enforce MOUS-03 (coach guard) — requirement satisfied

---
*Phase: 09-mouse-tracking-chat-and-lobby-browser*
*Completed: 2026-03-29*
