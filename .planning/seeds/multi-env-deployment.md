---
title: Multi-Environment Deployment (Test/Prod)
trigger_condition: After v1 frontend milestone completes
planted_date: 2026-04-07
---

## Strategy: Two-Environment Model

**Test DB** — all Vercel preview deployments (PRs) + local dev
**Prod DB** — Vercel production deployment (main branch)

### Vercel Side
- Scope `PUBLIC_SPACETIMEDB_DB_NAME` per Vercel environment context:
  - **Production**: prod DB name
  - **Preview**: test DB name
  - **Development**: test DB name (or local)
- Every PR gets its own preview URL automatically pointed at the test DB

### SpacetimeDB Side
- Module publish stays manual (`spacetime publish`)
- Workflow: publish to test DB → verify on preview → publish to prod DB → merge PR to trigger production deploy
- Spinning up new databases is trivial — no infrastructure changes needed
