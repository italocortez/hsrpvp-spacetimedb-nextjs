# Requirements: HSRPVP Competitive Platform — Backend Milestone

**Defined:** 2026-03-15
**Core Value:** Players can organize, play, and track competitive HSR matches and tournaments in one place

## v0.5 Requirements

Requirements for this milestone (backend foundation). Each maps to roadmap phases. Scope: backend tables, reducers, views, and edge case handling only (no UI). v1 will add the frontend on top of this.

### Schema Foundation

- [x] **SCHM-01**: All new enums defined (TournamentStage, TournamentFormat, MatchResultStatus, ValidationStatus, DisconnectPolicy, RecurrenceType, RosterVisibility, ParticipantStatus, ParticipantType, GameMode extensions)
- [x] **SCHM-02**: All new struct types defined (Score per game mode, RecurrenceRule, EloConfig)
- [x] **SCHM-03**: Audit column pattern applied to all new tables (createdAt, createdBy, updatedAt, updatedBy)

### Roster Management

- [x] **ROST-01**: User can create an HSR account entry with a display label and set it as active
- [x] **ROST-02**: User can add owned characters with eidolon level (0-6) to an HSR account
- [x] **ROST-03**: User can add owned lightcones with superimposition level (1-5) to an HSR account
- [x] **ROST-04**: User can manage multiple HSR accounts and select which is active for play
- [x] **ROST-05**: Admin can add/edit roster entries on behalf of any user
- [x] **ROST-06**: User can set roster visibility to public or private
- [x] **ROST-07**: Roster visibility is overridden by lobby/tournament open-roster settings
- [x] **ROST-08**: Account rating is calculated from roster composition (characters + eidolons + lightcones owned)

### Tournament System

- [x] **TRNT-01**: User can request Tournament Organizer (TO) role; admin approves or denies
- [ ] **TRNT-02**: TO can create a tournament with name, format, game mode, settings, and max participants
- [x] **TRNT-03**: Tournament supports formats: single elimination, double elimination, group phase (soccer-style round-robin)
- [ ] **TRNT-04**: Tournament has explicit stage lifecycle (Draft → Registration → Seeding → InProgress → Completed → Cancelled)
- [ ] **TRNT-05**: Player can self-sign up for a tournament (solo or as a team)
- [ ] **TRNT-06**: Team can sign up for a tournament as a unit
- [ ] **TRNT-07**: TO can assign referees to the tournament
- [x] **TRNT-08**: TO can set tournament-level anonymous play default
- [x] **TRNT-09**: TO can set tournament-level open/closed roster visibility
- [x] **TRNT-10**: TO can set tournament-level disconnect behavior policy
- [ ] **TRNT-11**: TO can override match results and DQ participants
- [ ] **TRNT-12**: Referee can validate match results within their assigned tournament

### Teams

- [ ] **TEAM-01**: User can create a persistent team with name and roster
- [ ] **TEAM-02**: User can invite other users to join their team
- [ ] **TEAM-03**: User can accept/decline team invitations
- [ ] **TEAM-04**: Ad-hoc groups can be formed for a specific tournament without a persistent team
- [x] **TEAM-05**: Coach role exists on a team: can observe match (cursor tracking) but cannot pick

### Bracket & Advancement

- [ ] **BRKT-01**: Single elimination bracket is generated from tournament participants with proper seeding
- [ ] **BRKT-02**: Double elimination bracket is generated with winners and losers brackets
- [ ] **BRKT-03**: Group phase generates round-robin groups with standings tracking (wins/losses/draws/points)
- [ ] **BRKT-04**: Bracket auto-advances winner to next match slot on confirmed result
- [ ] **BRKT-05**: Seeding supports manual assignment and MMR-based auto-seeding
- [ ] **BRKT-06**: Each BracketMatch row has explicit FK references (nextWinnerMatchId, nextLoserMatchId) — no JSON blob storage

### Match Results & Scoring

- [ ] **MTCH-01**: Both players can submit their score for a match
- [ ] **MTCH-02**: Score format is game-mode-specific: cycles for MoC and Anomaly Arbitration, score for Apocalyptic Shadow
- [ ] **MTCH-03**: Both players can upload score screenshots (stored as Imgur URLs)
- [ ] **MTCH-04**: Support for per-boss scoring (2 bosses per game mode) and combined scoring
- [ ] **MTCH-05**: Casual matches auto-confirm when both players agree on scores
- [ ] **MTCH-06**: Tournament matches require referee or admin validation before confirmation
- [ ] **MTCH-07**: Match result has explicit verification status (Pending → Submitted → Disputed → Validated → Rejected)
- [ ] **MTCH-08**: Validated results trigger ELO update and bracket advancement in same transaction
- [ ] **MTCH-09**: mmrProcessedAt guard prevents duplicate ELO application

### Anonymous Play

- [ ] **ANON-01**: Per-lobby/match toggle for anonymous player names
- [ ] **ANON-02**: Per-tournament default for anonymous play (individual matches can override)
- [ ] **ANON-03**: Anonymous mode enforced at data write layer — cursor events and match events carry anonymousLabel instead of userId
- [ ] **ANON-04**: Open/closed roster visibility toggle independent of anonymous names

### MMR System

- [ ] **MMR-01**: Per-game-mode ELO rating stored for each player (MoC, Apocalyptic Shadow, Anomaly Arbitration)
- [ ] **MMR-02**: Global composite MMR calculated as equal-weight average of per-mode ratings
- [ ] **MMR-03**: Tiered K-factor: K=40 for first 20 matches, K=20 for 21-100, K=10 for 100+
- [ ] **MMR-04**: MMR history log records every rating change with match reference
- [ ] **MMR-05**: matchesPlayedPerMode counter tracked from day one for K-factor tiering
- [ ] **MMR-06**: Leaderboard table/view sorted by MMR per game mode and global
- [ ] **MMR-07**: Season ID column in schema (seasons not implemented yet, but schema supports it)

### Player Stats & Profile

- [ ] **STAT-01**: Matches played, wins, losses, win rate tracked per player
- [ ] **STAT-02**: Matches spectated count tracked
- [ ] **STAT-03**: Best Ally calculated (user with most shared wins)
- [ ] **STAT-04**: Nemesis calculated (user with most losses against)
- [ ] **STAT-05**: Character-level stats: win rate, loss rate per character
- [ ] **STAT-06**: Character-vs-character win ratio tracked
- [ ] **STAT-07**: Match history supports step-by-step replay from archived MatchSessionStepHistory
- [ ] **STAT-08**: Match replay shows final result with game-mode-specific scoring at the end

### Achievements & Titles

- [ ] **ACHV-01**: Admin can create achievement definitions with name, description, criteria type, and threshold
- [ ] **ACHV-02**: System auto-awards achievements when conditions are met (e.g., "Win 10 matches")
- [ ] **ACHV-03**: Admin/TO can manually award achievements to specific players
- [ ] **ACHV-04**: User can view their collected achievements and select a title for display on profile

### Calendar & Scheduling

- [ ] **CAL-01**: Player can set recurring availability slots (daily, weekly, monthly with Feb edge case handling)
- [ ] **CAL-02**: Player can view up to 5 other players' calendars with toggleable visibility
- [ ] **CAL-03**: Auto-sync feature finds common availability windows between selected players
- [ ] **CAL-04**: Player can create calendar events and invite other players
- [ ] **CAL-05**: Tournament organizers can use calendar for match scheduling and send invites

### Mouse Tracking

- [ ] **MOUS-01**: Full XY cursor position broadcast within the page while browser tab is active
- [ ] **MOUS-02**: Cursor visible to all match participants, spectators, and coaches
- [ ] **MOUS-03**: Coaches can see cursor tracking but cannot call pick/ban reducers

### Chat

- [ ] **CHAT-01**: Ephemeral per-lobby/match chat via event table (messages not persisted after match ends)
- [ ] **CHAT-02**: Chat message structure supports future rich content (emoji, formatting metadata)
- [ ] **CHAT-03**: Chat messages cleaned up in same transaction as lobby close

### Lobby Browser

- [ ] **LBBY-01**: Browse available lobbies with filter support (game mode, status, player count)
- [ ] **LBBY-02**: Lobby visibility controls (public, private, invite-only)

### Disconnect & Rejoin

- [ ] **DISC-01**: Configurable disconnect behavior per tournament/lobby (pause, timer+forfeit, no action)
- [ ] **DISC-02**: Graceful rejoin logic preserving full match state
- [ ] **DISC-03**: Every pick/ban reducer includes liveness check (is match still in valid state?) to prevent post-forfeit actions
- [ ] **DISC-04**: Disconnect forfeit uses timestamp-check pattern (write disconnectForfeitAt, check on next reducer call)

### Cost Table Improvements

- [ ] **COST-01**: HsrLightconeCost gains gameMode composite key (parity with HsrCharacterCost)

## v1 Requirements (Frontend Milestone — Future)

Deferred to frontend milestone and beyond. Tracked but not in current roadmap.

### Seasons
- **SEAS-01**: Seasonal MMR resets with configurable reset strategy
- **SEAS-02**: Season-specific leaderboards with historical browsing

### Import
- **IMPT-01**: HoYoverse API roster import (if API becomes available)
- **IMPT-02**: Computer vision screenshot roster import
- **IMPT-03**: Computer vision score extraction from match screenshots

### Advanced Brackets
- **ADVB-01**: Swiss-system tournament format
- **ADVB-02**: Custom bracket templates created by TOs

## Out of Scope

| Feature | Reason |
|---------|--------|
| Frontend/UI implementation | Separate milestone — this milestone is backend-only |
| HoYoverse API integration | Unclear if API supports roster data; defer entirely |
| Computer vision imports | High complexity, maintenance burden; human verification is more reliable |
| Season implementation logic | Schema supports it (MMR-07), but UI/logic deferred until MMR baseline is stable |
| Real-time voice/video chat | Out of platform scope; Discord handles this |
| Payment/monetization | Not needed for competitive platform |
| Mobile native app | Web-first approach |
| Persistent chat history | Ephemeral by design |
| Automated anti-smurf detection | Premature without large player base |
| Global/public chat room | Moderation burden; community chat belongs in Discord |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SCHM-01 | Phase 1 | Complete |
| SCHM-02 | Phase 1 | Complete |
| SCHM-03 | Phase 1 | Complete |
| ROST-01 | Phase 2 | Complete |
| ROST-02 | Phase 2 | Complete |
| ROST-03 | Phase 2 | Complete |
| ROST-04 | Phase 2 | Complete |
| ROST-05 | Phase 2 | Complete |
| ROST-06 | Phase 2 | Complete |
| ROST-07 | Phase 2 | Complete |
| ROST-08 | Phase 2 | Complete |
| TRNT-01 | Phase 3 | Complete |
| TRNT-02 | Phase 3 | Pending |
| TRNT-03 | Phase 3 | Complete |
| TRNT-04 | Phase 3 | Pending |
| TRNT-05 | Phase 3 | Pending |
| TRNT-06 | Phase 3 | Pending |
| TRNT-07 | Phase 3 | Pending |
| TRNT-08 | Phase 3 | Complete |
| TRNT-09 | Phase 3 | Complete |
| TRNT-10 | Phase 3 | Complete |
| TRNT-11 | Phase 3 | Pending |
| TRNT-12 | Phase 3 | Pending |
| TEAM-01 | Phase 3 | Pending |
| TEAM-02 | Phase 3 | Pending |
| TEAM-03 | Phase 3 | Pending |
| TEAM-04 | Phase 3 | Pending |
| TEAM-05 | Phase 3 | Complete |
| BRKT-01 | Phase 4 | Pending |
| BRKT-02 | Phase 4 | Pending |
| BRKT-03 | Phase 4 | Pending |
| BRKT-04 | Phase 4 | Pending |
| BRKT-05 | Phase 4 | Pending |
| BRKT-06 | Phase 4 | Pending |
| MTCH-01 | Phase 5 | Pending |
| MTCH-02 | Phase 5 | Pending |
| MTCH-03 | Phase 5 | Pending |
| MTCH-04 | Phase 5 | Pending |
| MTCH-05 | Phase 5 | Pending |
| MTCH-06 | Phase 5 | Pending |
| MTCH-07 | Phase 5 | Pending |
| MTCH-08 | Phase 5 | Pending |
| MTCH-09 | Phase 5 | Pending |
| MMR-01 | Phase 5 | Pending |
| MMR-02 | Phase 5 | Pending |
| MMR-03 | Phase 5 | Pending |
| MMR-04 | Phase 5 | Pending |
| MMR-05 | Phase 5 | Pending |
| MMR-06 | Phase 5 | Pending |
| MMR-07 | Phase 5 | Pending |
| ANON-01 | Phase 6 | Pending |
| ANON-02 | Phase 6 | Pending |
| ANON-03 | Phase 6 | Pending |
| ANON-04 | Phase 6 | Pending |
| STAT-01 | Phase 6 | Pending |
| STAT-02 | Phase 6 | Pending |
| STAT-03 | Phase 6 | Pending |
| STAT-04 | Phase 6 | Pending |
| STAT-05 | Phase 6 | Pending |
| STAT-06 | Phase 6 | Pending |
| STAT-07 | Phase 6 | Pending |
| STAT-08 | Phase 6 | Pending |
| ACHV-01 | Phase 7 | Pending |
| ACHV-02 | Phase 7 | Pending |
| ACHV-03 | Phase 7 | Pending |
| ACHV-04 | Phase 7 | Pending |
| CAL-01 | Phase 8 | Pending |
| CAL-02 | Phase 8 | Pending |
| CAL-03 | Phase 8 | Pending |
| CAL-04 | Phase 8 | Pending |
| CAL-05 | Phase 8 | Pending |
| MOUS-01 | Phase 9 | Pending |
| MOUS-02 | Phase 9 | Pending |
| MOUS-03 | Phase 9 | Pending |
| CHAT-01 | Phase 9 | Pending |
| CHAT-02 | Phase 9 | Pending |
| CHAT-03 | Phase 9 | Pending |
| LBBY-01 | Phase 9 | Pending |
| LBBY-02 | Phase 9 | Pending |
| DISC-01 | Phase 10 | Pending |
| DISC-02 | Phase 10 | Pending |
| DISC-03 | Phase 10 | Pending |
| DISC-04 | Phase 10 | Pending |
| COST-01 | Phase 10 | Pending |

**Coverage:**
- v0.5 requirements: 84 total
- Mapped to phases: 84
- Unmapped: 0

---
*Requirements defined: 2026-03-15*
*Last updated: 2026-03-15 after roadmap creation — coverage count corrected to 84 (Teams, Anonymous Play categories included in final count)*
