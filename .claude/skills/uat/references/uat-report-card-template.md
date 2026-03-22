# UAT Report Card Template

Write to `notes/reportcards/uat/backend-testing/` whenever a UAT session is paused, abandoned, or interrupted to work on something else.

## File naming

`Phase-{X}_{YYYY-MM-DD}_{n}.md`

- `{X}` — phase number (e.g., `4`, `02`)
- `{YYYY-MM-DD}` — date of the session
- `{n}` — increments if multiple reports happen the same day (starts at 1)

Examples: `Phase-4_2026-03-18_1.md`, `Phase-2_2026-03-18_2.md`

## Template

```markdown
# Phase {X} UAT Report Card — {YYYY-MM-DD} (#{n})

## Session Summary

**Phase:** {XX} — {Phase Name}
**Started:** {time UTC}
**Paused:** {time UTC}
**Status:** {Paused at Test N of M / Completed / Abandoned}
**UAT file:** {path to UAT.md} (status: {paused/testing/complete})

## What We Did

{Numbered list of actions taken during the session. Be specific — include commands run, files checked, what was verified and how.}

## Errors Encountered

### Found and fixed during session:
{Numbered list. Include: what the error was, where it was, what caused it, how it was fixed.}

### Found but not fixed:
{Numbered list. Include: what the error was, severity, why it wasn't fixed (out of scope, needs different phase, etc.)}

## What We Covered

| Test | Status |
|------|--------|
| {N}. {Test Name} | {Pass / Issue (detail) / Skipped / Not started} |

**Additional coverage:**
{Anything verified outside the formal test list — bootstrap checks, schema verification, etc.}

## Where We Stopped

**Stopped at:** {Test N of M}

**Why:** {Clear explanation of why the session was interrupted — what was discovered that forced the context switch.}

## Next Steps

{Numbered list of what needs to happen before this UAT can resume.}
```

## When to write

- UAT session paused to fix a different phase's failures
- UAT session abandoned because blockers were found
- User explicitly asks to stop and switch context
- Session interrupted by `/clear` with unfinished tests

## When NOT to write

- UAT completes normally (all tests run) — the UAT.md file is sufficient
- Quick re-run of a single test — no context switch happening
