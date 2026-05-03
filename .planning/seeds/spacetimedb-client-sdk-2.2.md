---
title: SpacetimeDB Client SDK v2.2 adoption
trigger_condition: "@clockworklabs/spacetimedb-sdk@2.2.x publishes to npm (latest as of 2026-05-02 is 2.0.0; root package.json declares ^2.1.0 but lockfile resolved 2.1.0)"
planted_date: 2026-05-02
---

## Context

SpacetimeDB engine v2.2.0 shipped 2026-05-01 with several **client-side** features that are blocked on a corresponding `@clockworklabs/spacetimedb-sdk@2.2` npm release. Server-side v2.2.0 upgrade (Phase 16.3) does not unlock these — the client SDK has to publish first.

## What this unlocks

### v3 WebSocket transport (#4761, #4784) — bandwidth win
- Batches multiple `ClientMessage`s per WS frame
- Server already supports v3 negotiation; v2 clients keep working
- **Zero code change** once the client SDK ships and negotiates v3 by default
- **Matters because:** "egress is the dominant cost on maincloud" (CLAUDE.md, energy budget = 102,500/month). Frame overhead reduction directly extends headroom.

### `useTable(t, { enabled })` hook (#4721)
- Conditional subscription without unmounting the consumer
- Drop-in for chat/lobby panels that should only sub when visible
- Defaults to `enabled: true`, fully back-compat — adopt opportunistically per panel

### `useProcedure(procedures.foo)` hook (#4752)
- Mirrors `useReducer` — returns a stable typed callback that queues until connection ready
- Replaces ad-hoc patterns where component code awaits `connection.reducers.X(args)` directly
- Useful for any reducer call from React components (currently every `app/` reducer call site)

## When this activates

Watch `npm view @clockworklabs/spacetimedb-sdk versions` for a `2.2.x` entry. When it lands:

1. Bump root `package.json` `spacetimedb: ^2.2.0` (note: same package name serves as client SDK in TS land — check for separate `@clockworklabs/spacetimedb-sdk` if/when split)
2. Verify v3 transport negotiated via DevTools Network → WS frame inspection
3. Sweep `app/` and `components/` for chat/lobby/modal subscription sites — adopt `{ enabled }` where panels are gated by UI state
4. Sweep reducer call sites for `useProcedure` adoption opportunities

## References

- Engine release: https://github.com/clockworklabs/SpacetimeDB/releases/tag/v2.2.0
- v3 transport PR: https://github.com/clockworklabs/SpacetimeDB/pull/4761
- useTable enabled PR: https://github.com/clockworklabs/SpacetimeDB/pull/4721
- useProcedure PR: https://github.com/clockworklabs/SpacetimeDB/pull/4752
- Discovery: 2026-05-02 exploration in advance of Phase 16.3 (server upgrade)
