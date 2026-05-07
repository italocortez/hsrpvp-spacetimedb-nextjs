# Phase 16.4 — Transport evidence summary

**Captured:** 2026-05-03
**Database:** hsrpvp-spacetimedb-nextjs-test1
**Host:** wss://maincloud.spacetimedb.com
**Protocol negotiated:** `v3.bsatn.spacetimedb` (v3 BSATN binary transport — observed sec-websocket-protocol header)
**Frame log:** `.planning/phases/16.4-spacetimedb-v2-2-0-refactor-pass/transport-evidence/frames.jsonl`

## Stats

| Metric | Value |
|---|---|
| Total frames | 7 |
| Inbound frames | 4 |
| Outbound frames | 3 |
| Avg frame size (bytes) | 32677.9 |
| Max frame size (bytes) | 113994 |
| Frame size p50 (bytes) | 249 |
| Frame size p99 (bytes) | 113994 |
| Peak frames/second | 2 |
| Multi-message batch indicator (inbound frames >1KB during sync) | 1 |
| Total inbound bytes | 228458 |
| Total outbound bytes | 287 |
| Session duration (ms) | 3224 |

The two ~114 KB inbound frames (frame #3 at +171ms post-connect, frame #7 at +3224ms post-connect) are the v3 multi-message batches: 7 layer-0 reference table snapshots packed into a single WebSocket message. The ratio (228458 inbound / 287 outbound bytes ~= 796:1) confirms the egress-dominant profile documented in `memory/project_data_scale.md` — the SDK uplinks fewer than 300 bytes total to subscribe + nudge + unsubscribe; the server downlinks 7 full reference tables.

## Session

Deterministic session per CONTEXT.md D-04:

1. Subscribe to 7 layer-0 reference tables (`hsr_character`, `hsr_lightcone`, `hsr_character_cost`, `hsr_lightcone_cost`, `hsr_synergy_cost`, `archetype`, `hsr_character_archetype`).
2. Wait 2s for initial sync flood.
3. Emit `loginAsGuest({})` (no-op for an already-authed guest token; minimal request/response pair that exercises the v3 batching boundary).
4. Wait 1s.
5. Unsubscribe.
6. Wait 500ms.

`compression='none'` was forced on the connection so logged frame sizes are on-wire BSATN bytes (no gzip/brotli reduction applied; the size logged is the full on-wire frame including the 1-byte compression tag, which the factory strips before forwarding to the SDK).

## Baseline note

This capture is the **maincloud-as-shipped baseline** for future regression comparisons (per D-01). v2.2.0 + v3 WebSocket transport were already shipped to maincloud during Phase 16.3; the "pre" measurement is unrecoverable. The captured stats reflect **v2.2.0 perf improvements end-to-end** (not just transport batching) — durability hardening (#4891/#4892/#4890), V8 isolate hardening (#4684/#4777/#4778/#4884), and TS SDK perf fixes (#4640/#4744/#4767/#4801/#4805) all contribute to the observed numbers. The static energy estimator (`tools/energy-model.js`, SC#8 sanity check per D-03) does NOT model transport batching; SC#4 closure is structural-evidence, not numerical-target.

Future regressions: re-run `rtk proxy "npx tsx tools/capture-ws-frames.ts"`; diff the new `frames.jsonl` against this baseline. A meaningful regression looks like: (a) avg frame size dropping to <10 KB while frame count climbs sharply (suggests batch coalescing broke and the server is shipping per-message frames again); (b) total inbound bytes for the same 7-table snapshot growing >2x (suggests BSATN encoding regression or compression mis-negotiation); (c) outbound bytes climbing >10x (suggests subscription chatter — heartbeats, retries — was reintroduced).

## Reproduction

Reproducible by anyone with:
- A low-privilege guest token in `.env.local` as `CAPTURE_WS_FIXTURE_TOKEN` (NOT the admin `SPACETIMEDB_SERVER_TOKEN` — script enforces this guard at startup).
- Maincloud test database access (`spacetime.json` pointing to the test DB).
- `ws` + `@types/ws` devDeps (Plan 04 Task 1).

Run:

```bash
rtk proxy "npx tsx tools/capture-ws-frames.ts"
```

(Bare `npx tsx ...` is rewritten by the project RTK hook into a broken `npm` invocation; the `rtk proxy` wrapper passes the command through unchanged. See `~/.claude/RTK.md` "Known limitation: `npx <pkg>@<version>`".)
