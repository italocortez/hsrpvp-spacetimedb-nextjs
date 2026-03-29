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

Real userIds are stored, but **access is gated by visibility views** (see Read-Layer Views below). Tournament match history stays hidden until the tournament completes and `revealTournamentHistory` sets `isPubliclyVisible=true`.

### Match Result Tables Keep Real UserIds (D-03)

Ephemeral match result tables are server-internal and not player-facing:

- **MatchResultRecord** -- real userId fields
- **MatchResultParticipant** -- real userId

These records are deleted during finalization. They never contain anonymous labels because they are never displayed to other participants.

---

## Read-Layer Views (D-92, D-93)

While the write layer stores sentinel values on real-time tables, the **read layer** enforces anonymity via per-user views. The frontend subscribes to views, never raw tables.

### Real-Time Views (D-92) — `view_my_*` prefix

Scoped to the caller's current lobbies. `shouldAnonymize()` decides per-row whether to mask identity based on lobby anonymous settings and the caller's team membership.

| View | Source Table | Anonymizes |
|------|-------------|------------|
| `view_my_lobby_chat` | ChatMessage | senderUserId, adds anonymousLabel |
| `view_my_lobby_members` | LobbyMember | userId, resolves displayName or label |
| `view_my_match_steps` | MatchSessionStep | actorUserId |
| `view_my_match_participants` | MatchResultParticipant | userId |

Non-anonymous lobbies: views return real data. Anonymous lobbies: views mask opponent data. Same subscription either way — the frontend doesn't branch.

### History Views (D-93) — no `my` prefix

Returns data for public matches + caller's own matches. Visibility gated by `MatchSessionHistory.isPubliclyVisible` flag — set to `true` by `revealTournamentHistory` when a tournament completes.

| View | Source Table | Gate |
|------|-------------|------|
| `view_match_history` | MatchSessionHistory | isPubliclyVisible OR participated |
| `view_match_participant_history` | MatchParticipantHistory | same |
| `view_match_step_history` | MatchSessionStepHistory | same |

All three share `buildVisibleMatchIds()` helper for consistent visibility logic.

### Frontend Subscription Pattern

The frontend always subscribes to views. No conditional logic needed — the server decides what to expose.

```typescript
// Lobby views (scoped to caller's lobbies)
'SELECT * FROM view_my_lobby_chat'
'SELECT * FROM view_my_lobby_members'
'SELECT * FROM view_my_match_steps'
'SELECT * FROM view_my_match_participants'

// History views (public + caller's matches)
'SELECT * FROM view_match_history'
'SELECT * FROM view_match_participant_history'
'SELECT * FROM view_match_step_history'
```

### Future: `public: false` on raw tables

Currently all raw tables are `public: true` alongside the views. A future milestone will flip the 6 raw tables to `public: false`, making views the only client access path. This enforces anonymity even against savvy users who craft custom subscriptions.

---

## Label Computation (D-04, D-05)

### computeAnonymousLabel(ctx, lobbyId, userId)

Deterministic label computed from LobbyMember data -- no new table required.

**Key file:** `spacetimedb/src/helpers/anonymousLabels.ts`

### Algorithm

1. Look up the caller's LobbyMember row for the given lobbyId
2. Determine role from lobbySlot: BlueCoach/RedCoach (Coach), BluePlayer/RedPlayer (Player), Spectator; check isReferee
3. Compute label based on lobbySlot + join order among peers

### Label Formats (D-04)

| LobbySlot | Label Format | Examples |
|-----------|-------------|----------|
| BluePlayer | "Blue-{N}" | Blue-1, Blue-2, Blue-3 |
| RedPlayer | "Red-{N}" | Red-1, Red-2, Red-3 |
| BlueCoach | "Coach-Blue" | Coach-Blue |
| RedCoach | "Coach-Red" | Coach-Red |
| Spectator | "Spectator-{N}" | Spectator-1, Spectator-2 |

N is derived from join order among members with the same lobbySlot.

### Stability Guarantee (D-05)

Labels are deterministic from the same LobbyMember data. Same lobbySlot + same join order always produces the same label. Stable across reconnects -- no randomness, no stored state.

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
