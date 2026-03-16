# HSRPVP — Honkai Star Rail PVP Platform

## What This Is

A competitive Honkai Star Rail PVP platform where players draft characters, compete in matches and tournaments, track their performance, and manage their in-game rosters. Built on SpacetimeDB for real-time multiplayer sync with a Next.js frontend. The platform aims to replace external tournament tools (like Challonge) with a purpose-built, HSR-native competitive experience.

## Core Value

Players can organize, play, and track competitive HSR matches and tournaments in one place — from drafting to scoring to leaderboards — without relying on external tools.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Guest login and Discord OAuth account linking — existing
- ✓ SpacetimeDB real-time WebSocket connection with token persistence — existing
- ✓ User profiles with display name, username, and avatar — existing
- ✓ Role-based access control (admin, user, server identity) — existing
- ✓ Game data tables for HSR characters and lightcones — existing
- ✓ Character/lightcone cost tables with eidolon/superimposition costs per game mode — existing
- ✓ Synergy cost tables with source/target modifiers per game mode — existing
- ✓ Lobby creation and membership tracking — existing
- ✓ Match session with step-by-step pick/ban recording — existing
- ✓ Match history archival (MatchSessionHistory + MatchSessionStepHistory) — existing
- ✓ Real-time cursor broadcasting in lobbies (LobbyCursorEvent) — existing
- ✓ Admin bulk upsert and row deletion for cost management — existing
- ✓ Guest account cleanup via UserDeletionJob — existing
- ✓ Team composition builder — existing (needs verification)

### Active

<!-- Current scope. Building toward these. -->

**Roster Management**
- [ ] User can manually add owned characters with eidolon levels
- [ ] User can manually add owned lightcones with superimposition levels
- [ ] User can manage multiple HSR accounts (select active account for play)
- [ ] Admin can add/edit roster entries on behalf of users
- [ ] User can set roster visibility (public/private), overridden by lobby/tournament settings
- [ ] Account rating calculated from roster (characters + eidolons owned)

**Achievements & Titles**
- [ ] Admin can create achievement definitions with criteria
- [ ] System auto-awards achievements when conditions are met (e.g., "Win 10 matches")
- [ ] Admin/TO can manually award achievements to players
- [ ] User can collect and display titles on their profile

**Tournament System**
- [ ] Role-based tournament creation (users request TO role, admins approve)
- [ ] Tournament types: single elimination, double elimination, group phase (soccer-style)
- [ ] Self-signup and team signup for tournaments
- [ ] Bracket visualization and progression tracking
- [ ] Tournament-level settings: anonymous play, open/closed roster, disconnect behavior
- [ ] Referee assignment and management per tournament/match
- [ ] Coach role: can view match (mouse tracking) but cannot pick for team

**Match Results & Scoring**
- [ ] Game-mode-specific scoring: cycles (MoC, Anomaly Arbitration), score (Apocalyptic Shadow)
- [ ] Both players upload score screenshots (via Imgur) and submit scores
- [ ] Mutual confirmation for casual matches
- [ ] Ref/admin validation required for tournament matches
- [ ] Support for 2-boss scoring (per boss or combined screenshot)

**Anonymous Play**
- [ ] Per-lobby/match toggle for anonymous player names
- [ ] Per-tournament default for anonymous play (individual matches can override)
- [ ] Open/closed roster visibility toggle (independent of anonymous names)

**Calendar & Scheduling**
- [ ] Players can set recurring availability (daily, weekly, monthly with Feb handling)
- [ ] Players can view up to 5 other players' calendars (toggleable visibility)
- [ ] Auto-sync feature to find common availability between players
- [ ] Event creation with player invites
- [ ] Tournament organizers can use calendar for match scheduling

**Mouse Tracking**
- [ ] Full XY cursor position broadcast within the page while browser tab is active
- [ ] Visible to all match participants, spectators, and coaches
- [ ] Coaches can see cursor tracking but cannot pick for their team

**Chat**
- [ ] Ephemeral per-lobby/match chat (event table, not persisted after match ends)
- [ ] Flexible message structure to support future emoji/rich content

**User Profile & Stats**
- [ ] Matches played, wins, losses, win rate
- [ ] Matches spectated count
- [ ] Best Ally card (user with most shared wins)
- [ ] Nemesis card (user with most losses against)
- [ ] Match history with step-by-step replay of archived matches + final result
- [ ] Character-level stats: win rate, loss rate, character-vs-character win ratio

**MMR System**
- [ ] Per-game-mode MMR rating (chess-style ELO)
- [ ] Global composite MMR (equal weight across game modes)
- [ ] MMR leaderboard (season support in schema, but seasons not implemented yet)

**Lobby Browser**
- [ ] Browse available lobbies with filters
- [ ] Lobby visibility and join controls

**Disconnect & Rejoin**
- [ ] Configurable disconnect behavior per tournament/lobby (pause, timer+forfeit, etc.)
- [ ] Graceful rejoin logic preserving match state

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- HoYoverse API roster import — unclear if API supports it, defer to future milestone
- Computer vision screenshot roster import — high complexity, future milestone
- Season implementation for leaderboards — schema supports it, UI/logic deferred
- Real-time voice/video chat — out of platform scope
- Mobile native app — web-first
- Payment/monetization — not needed for competitive platform
- Chat message persistence — ephemeral by design, no replay of chat

## Context

- Existing codebase has SpacetimeDB backend with 15+ tables, Next.js 15 frontend with HeroUI
- SpacetimeDB handles all persistent state and real-time sync via WebSocket subscriptions
- Trusted server identity pattern established for privileged operations (Discord linking, role management)
- Audit columns (createdAt/By, updatedAt/By) are standard on all tables
- Cost tables already support per-game-mode pricing with eidolon/superimposition granularity
- Match history tables (MatchSessionHistory + MatchSessionStepHistory) already exist for replay
- Cursor broadcasting pattern already established via LobbyCursorEvent
- This milestone focuses on backend only: tables, reducers, views, edge cases (disconnect, permissions)
- Frontend/UI will be a separate milestone

## Constraints

- **Tech stack**: SpacetimeDB TypeScript backend, Next.js frontend — established, no changes
- **Reducers**: Must be deterministic — no network, filesystem, timers, or random
- **Data access**: All reads via table subscriptions, never reducer return values
- **Image hosting**: Imgur for match screenshot uploads (external dependency)
- **Auth**: SpacetimeDB identity + Discord OAuth via NextAuth — established pattern
- **Game modes**: Memory of Chaos, Apocalyptic Shadow, Anomaly Arbitration — each with different scoring

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Manual roster entry first | HoYoverse API availability uncertain; manual is reliable | — Pending |
| Imgur for screenshot hosting | Avoids storing images in SpacetimeDB; public URLs sufficient for verification | — Pending |
| Ephemeral chat via event table | Keeps match data lean; chat not needed for replay | — Pending |
| Per-game-mode MMR with equal-weight global | Reflects different skill sets per mode while giving one composite rank | — Pending |
| Tournament settings override user roster visibility | Tournament integrity > personal preference | — Pending |
| Role-based TO access | Prevents spam tournaments while allowing community organizing | — Pending |
| Configurable disconnect behavior | Different contexts (casual vs tournament) need different handling | — Pending |
| Backend-only milestone | Solid table design first, UI in separate milestone | — Pending |

---
*Last updated: 2026-03-15 after initialization*
