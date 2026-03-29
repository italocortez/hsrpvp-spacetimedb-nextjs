# Anonymous Play

**Architecture:** [architecture.md](architecture.md)

## Acceptance Scenarios

### Anonymous Cursor Broadcast
**Given:** Lobby with isAnonymousPlayers=true, caller is a player in Blue team
**When:** `broadcast_cursor(lobbyId, x, y)`
**Then:** LobbyCursorEvent written with senderUserId=0 and anonymousLabel="Blue-1" (or appropriate label from team slot + join order). Real identity resolved from ctx.sender for auth only, never stored on the row.

### Non-Anonymous Cursor Broadcast
**Given:** Lobby with isAnonymousPlayers=false
**When:** `broadcast_cursor(lobbyId, x, y)`
**Then:** LobbyCursorEvent written with real senderUserId. anonymousLabel is undefined/empty.

### Separate Player/Spectator Toggles
**Given:** Lobby with isAnonymousPlayers=true, isAnonymousSpectators=false
**When:** A player broadcasts cursor
**Then:** Player's cursor has userId=0 + label
**When:** A spectator sends chat
**Then:** Spectator's chat has real userId, no anonymous label

### Tournament Anonymous Inheritance
**Given:** Tournament with isAnonymousDefault=true, lobby created with isTournamentControlled=true
**When:** Lobby inherits settings from tournament
**Then:** Lobby.isAnonymousPlayers=true (inherited from tournament.isAnonymousDefault). Anonymous enforcement applies to all real-time writes in that lobby.

### Label Stability Across Reconnects
**Given:** Player in anonymous lobby with lobbySlot=BluePlayer, join order=2 (label="Blue-2")
**When:** Player disconnects and reconnects
**Then:** Same LobbyMember data produces same label "Blue-2". No randomness or stored label state.

### History Identity Revelation
**Given:** Anonymous lobby, match completed and finalized
**When:** MatchParticipantHistory rows written during finalization
**Then:** Real userIds stored in MatchParticipantHistory (with displayName). Access gated by `view_match_participant_history` and `view_match_step_history` — only visible when `MatchSessionHistory.isPubliclyVisible=true` or caller participated. Tournament matches stay hidden until `revealTournamentHistory` runs on tournament completion.

### Bracket Anonymization (Client-Side)
**Given:** Tournament with isAnonymousDefault=true, bracket generated
**When:** Client renders tournament bracket
**Then:** Client shows "Seed-N" labels instead of player/team names. Bracket tables remain public with real data -- anonymization is a display-layer courtesy.

## Edge Cases

| Case | Expected Behavior |
|------|-------------------|
| Anonymous mode on non-anonymous lobby | Normal behavior -- real userId, no label |
| Coach in anonymous lobby | Label = "Coach-Blue" or "Coach-Red" based on lobbySlot (BlueCoach/RedCoach) |
| Spectator in anonymous lobby (isAnonymousSpectators=true) | Label = "Spectator-1", "Spectator-2" etc. |
| Spectator in anonymous lobby (isAnonymousSpectators=false) | Real userId, no label (independent toggle) |
| Anonymous mode locked after lobby creation | Cannot change isAnonymousPlayers/isAnonymousSpectators after lobby created |
| Host controls anonymous setting, not referee | Referee operates within existing lobby config, cannot toggle anonymity |
| Referee in anonymous lobby | Referee sees real-time data with sentinel userId like everyone else; identity revealed in history |
| Label collision (two players same slot) | Join order differentiates -- Blue-1, Blue-2, Blue-3 |
| Tournament lobby with isTournamentControlled=false | Anonymous settings are lobby-local, not inherited from tournament |

## Integration Points

| This Feature | Connects To | Direction |
|-------------|------------|-----------|
| Lobby.isAnonymousPlayers | LobbyCursorEvent, MatchSessionStep, ChatMessage | Checked on write |
| Lobby.isAnonymousSpectators | LobbyCursorEvent, ChatMessage | Checked on write |
| Lobby.isTournamentControlled | Tournament.isAnonymousDefault | Inherits |
| LobbyMember.lobbySlot + join order | anonymousLabel computation | Reads |
| MatchParticipantHistory | Real userId + displayName | Writes (finalization) |
| MatchSessionStepHistory | Real actorUserId + actorDisplayName | Writes (finalization) |
| BracketMatch (public) | Client-side "Seed-N" display | Client reads |

## Phase History

| Decision | Source | Date |
|----------|--------|------|
| Sentinel userId=0 + anonymousLabel on real-time tables (D-01) | Phase 6 CONTEXT.md | 2026-03-21 |
| History tables keep real userIds for replay (D-02) | Phase 6 CONTEXT.md | 2026-03-21 |
| Match result tables keep real userIds, server-internal (D-03) | Phase 6 CONTEXT.md | 2026-03-21 |
| Team-based labels: Blue-1, Red-2, Coach-Blue, Spectator-1 (D-04) | Phase 6 CONTEXT.md | 2026-03-21 |
| Labels deterministic from LobbyMember data, stable across reconnects (D-05) | Phase 6 CONTEXT.md | 2026-03-21 |
| Tournament anonymous inheritance via isTournamentControlled (D-06) | Phase 6 CONTEXT.md | 2026-03-21 |
| isAnonymousPlayers and isAnonymousSpectators are independent toggles (D-07) | Phase 6 CONTEXT.md | 2026-03-21 |
| Anonymous mode locked after creation, host-controlled (D-08) | Phase 6 CONTEXT.md | 2026-03-21 |
| Bracket anonymization is client-side courtesy, not security boundary (D-09) | Phase 6 CONTEXT.md | 2026-03-21 |
| LobbySlot refactor: teamSlot+participationRole → single lobbySlot enum | Phase 9 execution | 2026-03-29 |
| Read-layer views (view_my_* for lobbies, view_match_* for history) enforce anonymity server-side | Phase 9 execution | 2026-03-29 |
| History views gated by isPubliclyVisible + participation check (D-93) | Phase 9 execution | 2026-03-29 |
| Frontend subscribes to views always — no conditional anonymous/non-anonymous branching | Phase 9 execution | 2026-03-29 |

---

*Last updated: 2026-03-29*
