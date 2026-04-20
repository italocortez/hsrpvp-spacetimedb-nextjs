---
status: partial
phase: 10-disconnect-handling-and-cost-parity
source: [10-VERIFICATION.md]
started: 2026-04-03T01:40:00Z
updated: 2026-04-03T01:40:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. clientDisconnected fires and sets member state
expected: Killing a WebSocket connection against maincloud triggers clientDisconnected, which sets LobbyMember.disconnectedAt and triggers auto-pause (Deferred policy) or starts forfeit timer (Standard policy)
result: [pending]

### 2. Rejoin restores match state and decrements pool
expected: Reconnecting after disconnect via join_lobby restores full match state (draft steps, lineup, scores) without corruption or duplicate entries; disconnectPoolRemainingMs decrements by elapsed time
result: [pending]

### 3. Post-concede ensureMatchAlive guard fires
expected: After a concede_match or claim_forfeit completes, any subsequent pick/ban/equip/score reducer call for the same lobby is rejected by ensureMatchAlive with "Match ended or forfeited"
result: [pending]

## Summary

total: 3
passed: 0
issues: 0
pending: 3
skipped: 0
blocked: 0

## Gaps
