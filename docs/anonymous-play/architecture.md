# Anonymous Play

Architecture documentation for server-enforced anonymous mode at the data write layer.

*Created Phase 6 execution -- write-layer enforcement, label computation, tournament inheritance, roster visibility.*

---

## Write-Layer Enforcement Pattern

Anonymous mode is enforced at the server write layer, not at the client display layer. When a lobby has `isAnonymousPlayers=true` or `isAnonymousSpectators=true`, reducers that write to real-time tables replace the real userId with a sentinel value and attach a deterministic label.

### Sentinel Pattern (D-01)

Real-time tables use `userId=0` as a sentinel to hide identity:

| Table | Enforcement | userId Column | anonymousLabel Column |
|-------|------------|---------------|----------------------|
| LobbyCursorEvent | broadcast_cursor | senderUserId=0 | anonymousLabel (D-62) |
| MatchSessionStep | step reducers | actorUserId=0 | anonymousLabel (D-62) |
| ChatMessage | send_chat | userId=0 | anonymousLabel (already existed) |

The server resolves the caller's identity from `ctx.sender` for authorization, then writes the sentinel userId and computed label to the row. Clients subscribed to these tables cannot see the real identity.

### History Tables Keep Real UserIds (D-02)

History tables written during finalization preserve real userIds for post-match replay:

- **MatchParticipantHistory** -- real userId + displayName
- **MatchSessionStepHistory** -- real actorUserId + actorDisplayName

Identity is revealed only after the match ends, when history data becomes available.

### Match Result Tables Keep Real UserIds (D-03)

Ephemeral match result tables are server-internal and not player-facing:

- **MatchResultRecord** -- real userId fields
- **MatchResultParticipant** -- real userId

These records are deleted during finalization. They never contain anonymous labels because they are never displayed to other participants.

---

## Label Computation (D-04, D-05)

### computeAnonymousLabel(ctx, lobbyId, userId)

Deterministic label computed from LobbyMember data -- no new table required.

**Key file:** `spacetimedb/src/helpers/anonymousLabels.ts`

### Algorithm

1. Look up the caller's LobbyMember row for the given lobbyId
2. Determine role: participationRole (Coach), isReferee, or player/spectator from teamSlot
3. Compute label based on role + team side + join order among peers

### Label Formats (D-04)

| Role | teamSlot | Label Format | Examples |
|------|----------|-------------|----------|
| Player | Blue | "Blue-{N}" | Blue-1, Blue-2, Blue-3 |
| Player | Red | "Red-{N}" | Red-1, Red-2, Red-3 |
| Coach | Blue | "Coach-Blue" | Coach-Blue |
| Coach | Red | "Coach-Red" | Coach-Red |
| Spectator | Spectator | "Spectator-{N}" | Spectator-1, Spectator-2 |

N is derived from join order among members with the same teamSlot and role.

### Stability Guarantee (D-05)

Labels are deterministic from the same LobbyMember data. Same teamSlot + same join order always produces the same label. Stable across reconnects -- no randomness, no stored state.

---

## Anonymous Toggles (D-07, D-08)

Two independent toggles on the Lobby table control anonymity:

| Column | Scope | Default |
|--------|-------|---------|
| isAnonymousPlayers | Players + coaches | false |
| isAnonymousSpectators | Spectators | false |

### Configuration Rules

- Set at lobby creation, locked after (D-08)
- Host controls anonymous setting, not referee (D-08)
- Referee operates within the lobby config
- Non-anonymous lobby: no sentinel, no label -- real userId written to all tables

---

## Tournament Inheritance (D-06)

```
Tournament
  isAnonymousDefault ──> Lobby.isAnonymousPlayers (when isTournamentControlled=true)
  isAnonymousSpectators ──> Lobby.isAnonymousSpectators (when isTournamentControlled=true)
```

When `Lobby.isTournamentControlled=true`:
- Anonymous settings propagate from the tournament's `isAnonymousDefault` and `isAnonymousSpectators`
- No separate override column on Lobby -- tournament config is the source of truth
- `isTournamentControlled` also gates other inherited settings (requireOwnership, rosterVisibility)

---

## Bracket Anonymization (D-09)

Tournament bracket anonymization is **client-side only** -- a courtesy, not a security boundary.

- Client shows "Seed-N" labels when `tournament.isAnonymousDefault=true`
- Bracket tables (BracketMatch, BracketRound) remain public
- A savvy user could cross-reference 4 tables to deanonymize (acceptable trade-off)
- No server enforcement -- bracket data is not sensitive enough to warrant per-user views

---

## Key Files

| File | Purpose |
|------|---------|
| `spacetimedb/src/helpers/anonymousLabels.ts` | computeAnonymousLabel helper |
| `spacetimedb/src/reducers/cursor.ts` | broadcast_cursor with anonymous enforcement |
| `spacetimedb/src/tables/lobbyCursorEvent.ts` | LobbyCursorEvent (anonymousLabel column) |
| `spacetimedb/src/tables/matchSessionStep.ts` | MatchSessionStep (anonymousLabel column) |
| `spacetimedb/src/tables/chatMessage.ts` | ChatMessage (anonymousLabel column -- pre-existing) |
| `spacetimedb/src/tables/lobbyMember.ts` | LobbyMember (team side + join order for label computation) |

---

## Key Decisions

- Write-layer sentinel pattern -- server replaces userId with 0 on real-time tables (D-01)
- History tables reveal identity in replay after match ends (D-02)
- Match result tables are server-internal ephemeral records (D-03)
- Team-based deterministic labels from LobbyMember data (D-04, D-05)
- Tournament anonymous inheritance via isTournamentControlled (D-06)
- Independent toggles for players vs spectators (D-07)
- Anonymous mode locked after lobby creation, host-controlled (D-08)
- Bracket anonymization is client-side courtesy only (D-09)

---

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
