
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

## Debugging Checklist

1. Is SpacetimeDB server running? (`spacetime start`)
2. Is the module published? (`spacetime publish`)
3. Are client bindings generated? (`spacetime generate`)
4. Check server logs for errors (`spacetime logs <db-name>`)
5. **Is the reducer actually being called from the client?**
