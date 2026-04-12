# Phase 9: Mouse Tracking, Chat, and Lobby Browser - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-29
**Phase:** 09-mouse-tracking-chat-and-lobby-browser
**Areas discussed:** Lobby visibility & join flow, Chat scope & permissions, Lobby lifecycle & cleanup, Coach pick/ban guard, Team slot assignment, Settings mutability, Cursor broadcast, Draft start flow, Draft sequences, Auction mechanics, Budget model, Post-draft flow, Undo & pause, Tournament lobbies, History tables, Contradictions audit

---

## Lobby Visibility & Join Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Enum replaces bool | Replace isPublic with LobbyVisibility enum (Public/Private/InviteOnly) | |
| Keep bool + joinCode convention | Public = isPublic true. Private = isPublic false + password | **Clarified** |

**User's choice:** Only Public and Private needed. Both visible in browser. Public = joinCode. Private = joinCode + password. No InviteOnly.
**Notes:** User corrected initial misunderstanding — Private lobbies ARE visible in browser (with lock icon), not hidden.

## Lobby Browser

| Option | Description | Selected |
|--------|-------------|----------|
| Client-side filtering | View returns all lobbies, client filters locally | |
| Projected server view | View returns only browsing columns, excludes config | **Evolved** |

**User's choice:** Projected view for bandwidth + privacy. But joinCode IS included (not a privacy concern). Tournament name + cost set name via cross-table PK lookup (no egress cost). Player count denormalized.
**Notes:** User raised bandwidth/privacy concern about full Lobby row egress. Led to projected view design. Cross-table lookup chosen over denormalization because lookups are server-side (no egress) and Lobby rows are ephemeral.

## Password Verification

| Option | Description | Selected |
|--------|-------------|----------|
| Plain string match | Store as plain text in private table | ✓ |
| Hashed password | Hash before storing | |

**User's choice:** Plain string match — acceptable for ephemeral lobby session codes.

## Chat Permissions

| Option | Description | Selected |
|--------|-------------|----------|
| All members | Players, spectators, coaches, referees can chat | ✓ |
| Players + referee only | Spectators/coaches see but can't send | |

## System Messages

| Option | Description | Selected |
|--------|-------------|----------|
| Join/leave + stage changes only | System messages for player join/leave and stage transitions | ✓ |
| All events including picks/bans | Full activity log in chat | |
| No system messages | Chat is player-only | |

## Chat Message Length

| Option | Description | Selected |
|--------|-------------|----------|
| 500 characters | Standard limit, server-enforced | ✓ |
| 1000 characters | More generous | |

## Chat Metadata

| Option | Description | Selected |
|--------|-------------|----------|
| Pass-through string | Store as-is, no validation | |
| Define JSON schema now | { type, replyToMessageId } | ✓ |

**Notes:** User wanted schema defined. Covers: text, reply, emoji_only types. Custom emoji shortcodes in content string — frontend resolves later.

## Chat Rolling Window

| Option | Description | Selected |
|--------|-------------|----------|
| Keep all until close | All messages persist during session | |
| Rolling window (50) | Keep last 50, delete oldest | ✓ |
| Rolling window (100) | Keep last 100 | |

## Lobby Close Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Hard delete all | Delete Lobby + members + chat + password + bans | ✓ |
| Soft delete (stage=Finished) | Keep rows, GC later | |

## Close Permissions

**User's choice:** Host, admin, moderator (not referee).

## Lobby Creation Restrictions

**User's choice:** Users = full config. Guests = ClosedNoRating enforced, no Ranked. (Previously discussed in another context.)

## Multi-Lobby

| Option | Description | Selected |
|--------|-------------|----------|
| One lobby at a time | Creating/joining fails if already in one | ✓ |
| Multiple allowed | Can spectate multiple | |

## Leave During Draft

| Option | Description | Selected |
|--------|-------------|----------|
| Slot stays, marked offline | LobbyMember.isOnline=false, slot preserved for reconnect | ✓ |
| Remove entirely | Delete LobbyMember row | |

## Kick & Ban

**User's choice:** Host, admin, moderator can kick AND ban. Ban = permanent for that lobby's lifetime. LobbyBan table.

## Team Assignment

**User's choice:** All join as Spectator, free to move themselves. Host can move. Overflow: Blue → Red → Coach Blue → Coach Red.

## Settings Mutability

| Option | Description | Selected |
|--------|-------------|----------|
| Mutable in Waiting, locked in Drafting | Host changes settings freely before draft | ✓ |
| Locked at creation | Must recreate to change | |

## Cursor Throttle

**User's choice:** Client-side only (20ms). No server-side throttle (event table auto-delete prevents timestamp tracking). Only players + coaches broadcast. Tab blur stops sending.
**Notes:** User asked about scoping cursor events to lobby members — resolved via subscription filtering (client subscribes to WHERE lobbyId=X).

## Draft Start

| Option | Description | Selected |
|--------|-------------|----------|
| On button click, before countdown | Host clicks → MatchSession + MatchResultRecord created → 3s countdown is frontend UX | ✓ |
| Two-phase prepare/confirm | Separate prepare and confirm reducers | |

## Minimum Players

| Option | Description | Selected |
|--------|-------------|----------|
| Both teams ≥1 player | Flexible for casual 1v1 | ✓ |
| Teams must match teamSize | Strict enforcement | |

## Draft Step Validation

| Option | Description | Selected |
|--------|-------------|----------|
| Full validation | Stage, turn order, character availability, ownership, coach guard | ✓ |
| Minimal validation | Stage + membership only | |

## Draft Sequences

**User provided Classic sequences** (notes/draft_order.md): 0ban, 4ban, 6ban.
**BanMode.Two removed** — not needed.
**Auction sequences are dynamic** — bans in fixed sequence, nominations tracked dynamically.

## Auction Mechanics

**Key decisions:**
- Steal-skip: nominating team goes again if opponent wins the bid
- Nomination = auto-bid at base cost
- Budget split: characterBudget + lightconeBudget (both configurable)
- Leftover character budget → LC budget
- Budget spent = cost, leftover difference = handicap (replaces Classic cost table system)
- EMPTY CHARACTER at 0 cost, reusable, valid strategy

## Lightcone Mechanics (Auction)

**Explored and rejected:**
- Sabotage round (blind LC cost inflation) — replaced by budget-as-cost model
- LC auction — rejected (LCs not exclusive)
- Alternating picks + burn — too slow

**Final:** Both teams pick LCs simultaneously from shared pool (not exclusive). Strict LC budget enforcement. 0-cost LCs available as fallback.

## Post-Draft Flow

| Option | Description | Selected |
|--------|-------------|----------|
| Backend steps | EquipLightcone, ArrangeLineup, ConfirmLineup as MatchSessionStep rows | ✓ |
| Frontend-only | LC equip and lineup as client state | |

**Host manually transitions between sub-phases.**

## Undo

**User's choice:** Referee only (with refereeCanUndo config), last step only.

## Pause

**User's choice:** Any player (3/team limit) + referee (unlimited) + auto on disconnect. Resume by referee OR original pauser.

## Referee Config

**User's choice:** All powers individually configurable: refereeCanUndo, refereeCanPause, refereeCanSetCaptain, refereeCanKick. Plus allowPlayerPause for player pause toggle.

## Captain

**User's choice:** Host + referee (when refereeCanSetCaptain=true) can assign. Default = first slot per team. isCaptain on LobbyMember.

## Tournament Lobby

**User's choice:** Anyone linked to bracket match can create. Full settings inheritance, locked. No bracket participant validation (open join for stand-ins). matchType from countTowardsMmr.

## Host Disconnect

**User's choice:** Deferred to Phase 10. Phase 9 marks offline only.

## Ready-Up

**User's choice:** isConfirmed on LobbyMember. All Blue+Red non-coach players must confirm before start_draft.

## Close Stage Restriction (Contradiction Fix)

**Original:** Close only in Waiting.
**Problem:** After finalization, lobby is Finished and needs cleanup.
**Resolution:** Close allowed in Waiting + Finished. Blocked during Drafting/Equipping/Scoring.

## LobbyStage Expansion (Contradiction Fix)

**Original:** Waiting | Drafting | Finished.
**Resolution:** Waiting | Drafting | Equipping | Scoring | Finished. Enables per-stage reducer validation. Free with existing --clear-database.

## Budget Fields (Contradiction Fix)

**Original:** Single auctionBudget on Lobby, teamBlueBudget/teamRedBudget on MatchSession.
**Resolution:** Split into characterBudget + lightconeBudget on Lobby. Add per-team tracking on MatchSession.

## History Table Rework

- MatchSessionStepHistory.characterName → targetName
- MatchParticipantHistory + isReferee, isCoach, isCaptain
- MatchSessionHistory + teamBlueSpent, teamRedSpent, handicapApplied
- LobbyConfigSnapshot: auctionBudget → characterBudget + lightconeBudget
- No contradictions with existing contracts found

## Claude's Discretion

- Exact StepPayload struct definitions for new ActionTypes
- System message content formatting
- Overflow fill logic details
- Minimum bid raise amount
- Timer behavior during auction bidding

## Deferred Ideas

- Custom emoji implementation (format, registry, caching) — v1 frontend
- Host disconnect auto-transfer — Phase 10
- Tournament lobby join restrictions — future reducer change, no wipe
- LC sabotage round — replaced by budget-as-cost model
