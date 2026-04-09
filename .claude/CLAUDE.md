# Git Rules

- Worktrees spawn from the last commit — uncommitted changes are invisible to them and cause merge conflicts. Revert with `git reset --soft HEAD~1` if needed.
- NEVER delete or commit `.env.local` or `.env`. These files are only edited by `post-publish.ts` after `--clear-database`.

---

# Mandatory Skills

When working on ANY task in this project, use the appropriate skill:

| Area | Skill | When |
|------|-------|------|
| **Backend** (spacetimedb/) | `/spacetimedb` | Any work touching tables, reducers, schema, indexes, views, procedures, publishing, or generating bindings |
| **Frontend** (app/, components/) | `/frontend-design` | Any work on UI components, pages, layouts, styling, or React features |

Always load the relevant skill before writing code. The skills contain project-specific patterns, API references, and guardrails that prevent common mistakes.

## All available skills

| Skill | Purpose |
|-------|---------|
| `spacetimedb` | SpacetimeDB backend development, multiplayer sync patterns, module bindings reference |
| `frontend-design` | Production-grade frontend interfaces with high design quality |
| `skill-creator` | Create, improve, and benchmark skills |
| `vercel-deploy` | Deploy to Vercel |
| `vercel-logs` | View Vercel deployment logs |
| `vercel-setup` | Set up Vercel CLI and project config |
| `pr-description` | Generate PR descriptions |
| `severity-review` | Code review at varying depth levels |
| `uat` | Behavior spec contract, acceptance testing, per-feature specs and test verification |
| `simplify` | Review changed code for reuse, quality, efficiency |

---

# SpacetimeDB Core Rules

These are always-in-context rules that apply regardless of skill loading.

## Core Concepts

1. **Reducers are transactional** — they do not return data to callers
2. **Reducers must be deterministic** — no filesystem, network, timers, or random
3. **Read data via tables/subscriptions** — not reducer return values
4. **Auto-increment IDs are not sequential** — gaps are normal, don't use for ordering
5. **`ctx.sender` is the authenticated principal** — never trust identity args
6. **Energy budget matters** — egress is the dominant cost on maincloud; consider bandwidth impact when designing features

## Backend Feature Docs

All backend feature documentation lives in `docs/{feature}/`:

**Architecture** (`docs/{feature}/architecture.md`):
- Table relationship diagrams, PKs, FKs, indexes
- Reducer reference table (permissions, descriptions)
- Data patterns (composite PK updates, audit columns)
- **Update every time backend code changes** (new tables, reducers, schema modifications)

**Behavior specs** (`docs/{feature}/contract.md`):
- Acceptance scenarios (Given/When/Then)
- Edge cases and error messages
- Integration points (cross-feature dependencies)
- Phase history (which discussion/research established each decision)
- **Update after every phase discussion** with new workflow decisions
- See `docs/tournament/contract.md` for the reference example
- Use the template from `.claude/skills/uat/references/workflow-doc-template.md`
- **Never modify behavior specs (`docs/*/contract.md`) during execution.** After execution completes, update the contract with any additions — tag every new entry with `Phase X execution` in the Phase History table so the user can distinguish their decisions from Claude's. The user reviews execution-sourced entries during `/gsd:verify-work`.
- **Test files (`test/`) are the verification layer.** Do not create, edit, or delete test files without an explicit task. Test failures are diagnostic — report them, never auto-fix.

Architecture docs cross-reference behavior specs. No duplication between them.

## Editing Behavior

- Make the smallest change necessary
- Do NOT touch unrelated files, configs, or dependencies
- Do NOT invent new SpacetimeDB APIs — use only what exists in docs or this repo
- Do NOT add restrictions the prompt didn't ask for — if "users can do X", implement X for all users

## Deployment

- Maincloud is the spacetimedb hosted cloud and the default location for module publishing
- The default server marked by *** in `spacetime server list` should be used when publishing
- If the default server is maincloud you should publish to maincloud
- Publishing to maincloud is free of charge
- When publishing to maincloud the database dashboard will be at the url: https://spacetimedb.com/@<username>/<database-name>
- The database owner can view utilization and performance metrics on the dashboard

## UAT Verify-Work Format

During `/gsd:verify-work`, present ONE test at a time using this exact format:

```
**STEP N: {who} does {what} on {whom}**

| col | col | col |        ← spacetime sql output as markdown table
|-----|-----|-----|
| val | val | **changed** | ← bold changed values

{who} ({role}) called `{reducer}` on {target} — {field} changed from `old` → `new`.
```

- `spacetime sql` after EVERY state-changing reducer call — no exceptions
- Tables GROW as rows accumulate (show full table each step, not just the new row)
- Assign colored emoji markers (🔴🔵🟢🟡🟣🟠) to participant/team/user IDs — same color across all tables so the user can track entities through steps
- Rejection tests: group in a summary table (`caller | action | error`), one final snapshot confirms no state changed
- After all steps: show checkpoint box, wait for user response
- Do NOT batch multiple tests — one test per checkpoint, one response before the next

