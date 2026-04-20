<pattern>

Pattern for embedding Playwright CLI screenshot verification into GSD plan
acceptance criteria. Applies to frontend phases where per-component visual
correctness matters. Referenced by planners producing PLAN.md for UI plans.

## When to use

Embed a screenshot check in `<acceptance_criteria>` when a task:

- Creates or significantly modifies a rendered component visible at a known route
- Adjusts spacing, color, typography in a way a grep cannot prove
- Lands a layout change whose regression would be visual-only (no test failure)

Do NOT embed for pure refactors with no visual delta, or for work below the
component level (utilities, hooks, types).

## Pattern

Every screenshot check is a Bash one-liner sequence in `<acceptance_criteria>`.
The executor runs these like any other criterion — PASS if the file exists and
the content matches expected shape, FAIL if the command errors or the file is
empty/missing.

```markdown
<acceptance_criteria>
- [ ] Hero component renders at `/` without console errors
      `rtk proxy playwright-cli goto / && rtk proxy playwright-cli screenshot --filename tmp/pw/16.2-hero.png && test -s tmp/pw/16.2-hero.png`
- [ ] Hero meets UI-SPEC dimensions (visual diff check — executor must Read PNG and compare against spec Section "Hero")
      `Read tmp/pw/16.2-hero.png`
</acceptance_criteria>
```

## Session management

One `open` per plan, not per task. The browser session persists across
`playwright-cli` invocations via its default named session. In PLAN.md use a
plan-level pre/post:

- **Plan pre-step** (before Task 1): `rtk proxy playwright-cli open http://localhost:3000/`
- **Plan post-step** (after last task): `rtk proxy playwright-cli close`

Dev server assumption: `npm run dev` already running in background. Document
this as a plan prerequisite, not a task.

## Path conventions

- **During execution (per-task checks):** drop to `tmp/pw/{phase}-{component}.png`.
  `tmp/` is gitignored — these are ephemeral, thrown away on plan completion.
- **During /gsd-ui-review (audit artifacts):** drop to `{phase_dir}/screenshots/{component}.png`.
  These ARE committed alongside UI-REVIEW.md as durable audit evidence.

Never mix the two. Executor uses `tmp/`, auditor uses `phase_dir/screenshots/`.

## Browser default

The `.playwright/cli.config.json` in this repo sets `browserName: chromium` +
`launchOptions.channel: msedge` as the default (Windows-friendly, no admin
install required). Config is gitignored — each dev configures locally. No need
to pass `--browser` on individual commands.

## What a screenshot check does NOT replace

- `npm run build` typecheck — still required for every plan
- Unit/integration tests — still required where they apply
- `/gsd-ui-review` retroactive audit — still runs post-execution with the full
  6-pillar scoring

The screenshot check is the fast in-execution proof that the UI didn't visibly
regress from what the task intended. It catches "oops, I broke layout" before
the plan commits, not instead of the formal audit.

## Anti-patterns

- Embedding a screenshot check in every task (overkill — one per component
  suffices, not per refactor task)
- Asserting pixel-perfect match — the check proves "renders without error" and
  "roughly matches shape"; subjective correctness is human judgment
- Committing `tmp/pw/*.png` — gitignored, and they should be. The committed
  artifacts live under `{phase_dir}/screenshots/` via ui-review
- Leaving the browser session open after plan completion — always `close` in
  the plan post-step

</pattern>
