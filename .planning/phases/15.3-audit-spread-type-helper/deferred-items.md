# Phase 15.3 — Deferred items (out-of-scope discoveries)

## Pre-existing typecheck errors in test files (discovered Plan 15.3-01)

Running `npm run test:typecheck` on the main branch (before any 15.3-01 edits) surfaces **35 errors across test/backend/** files:

- `test/backend/match-session/draft-control.test.ts` — 6 errors, `'lobby' is possibly 'undefined'` (TS18048)
- `test/backend/roster/account-deletion-guard.test.ts` — 1 error, `Property 'requireOwnership' is missing`
- `test/backend/season/tournament-player-account.test.ts` — 2 errors, same
- `test/backend/tournaments/tournament-admin.test.ts` — 1 error, same
- `test/backend/tournaments/tournament-management.test.ts` — 5 errors, same
- `test/backend/tournaments/tournament-registration.test.ts` — 5 errors, same
- `test/backend/tournaments/tournament-stages.test.ts` — 2 errors, same
- `test/backend/tournaments/tournament-teams.test.ts` — 1 error, same
- (and others in the same pattern)

**Root cause:** Test fixtures use row-literal objects that are missing the `requireOwnership` field. The field was added to `Tournament` / `TournamentStage` schemas in a prior phase, and the test helpers were not updated.

**Why not fix:** These errors are unrelated to Phase 15.3's audit-spread-to-helper refactor and exist independently of every Plan 15.3-XX edit. Per `.claude/get-shit-done/workflows/execute-plan.md` SCOPE BOUNDARY rule, pre-existing warnings/errors in files not touched by the current task are out-of-scope.

**Recommended follow-up:** Separate todo — `test-fixtures-sync-require-ownership-field`.

**Verified pre-existing:** Yes — `git stash` of 15.3-01's 4 calendar-reducer edits produced the same 35-error count, confirming no introduction by this plan.
