# Feature Research

**Domain:** Competitive gaming / esports tournament platform (HSR-specific PVP)
**Researched:** 2026-03-15
**Confidence:** MEDIUM — Web access unavailable. Analysis based on training-data knowledge of Challonge, start.gg, FACEIT, Battlefy, chess.com, and Liquipedia through August 2025. Claims about specific platform behaviors are MEDIUM confidence. Claims about general UX expectations are HIGH confidence (common across multiple platforms).

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist on any competitive platform. Missing these = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Bracket visualization (single/double elim) | Every tournament tool from Challonge to start.gg shows brackets visually. Players navigate by seeing the tree. | MEDIUM | Single-elim is simpler; double-elim requires losers bracket tracking and grand finals reset logic. Group stages (round-robin) are a third distinct type. |
| Tournament registration (self-signup) | Players expect to click "Join" and be in. Manual add-by-organizer-only is a dealbreaker for public events. | LOW | Needs open vs. invite-only modes. Waitlist if cap reached. |
| Match result reporting | Both players need to report outcome. Discrepancies surface for admin resolution. | MEDIUM | Mutual confirmation pattern (both submit → auto-confirm on agree, flag on disagree) is the standard (chess.com, lichess, FACEIT). |
| Player profile with basic stats | Win/loss record, win rate. Users expect to link others to a profile page. | LOW | Table stakes on every platform. Absence reads as "this isn't a real platform." |
| Match history | Ability to look back at past matches. Expected on any account-based system. | LOW | Pure list is minimum; step-by-step replay is a differentiator. |
| Bracket advancement (auto-progress on win) | When a result is confirmed, bracket advances automatically. Manual advancement is painful. | MEDIUM | Requires clear state machine: result submitted → validated → winner advances → next match created. |
| Seeding / placement order | Players expect top seeds to avoid each other early. Random or manual seeding both expected as options. | LOW | Auto-seeding by MMR is a differentiator; manual seeding is table stakes. |
| Tournament status visibility | Players need to know: "is registration open?", "are we in bracket?", "is it over?". | LOW | Simple state enum: draft → registration → in_progress → completed. Visible on tournament page. |
| Basic MMR/rating per game mode | Competitive players expect a number that represents skill. Single global number minimum; per-mode is expected in multi-mode contexts. | MEDIUM | ELO/Glicko-2 calculation must be deterministic and reproducible. K-factor tuning matters at early player counts. |
| Leaderboard (ranked list of players) | Any competitive platform has a "who is the best?" page. | LOW | Simple table sorted by MMR. Filters by game mode are table stakes once MMR is per-mode. |
| Admin / TO controls to manage match state | Tournament organizers need to override results, DQ players, and reset matches when tech issues occur. | MEDIUM | FACEIT and start.gg both give admins ability to override scores. Without this, a single tech issue breaks an entire bracket. |
| Disconnect / timeout handling | Players expect the platform to not end their match because of a brief network drop. | MEDIUM | Configurable behavior per context (casual vs. tournament) is the right design; hardcoded behavior is a pitfall. |

---

### Differentiators (Competitive Advantage)

Features that set this platform apart from generic tools like Challonge. Focus differentiation here because this is where generic tools fail HSR specifically.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| HSR-native draft integration | No other platform connects bracket play directly to character pick/ban. Challonge knows nothing about characters or eidolons. | HIGH | This is the core differentiator. Every match in a tournament flows into the existing draft system. |
| Per-game-mode MMR (MoC / AS / AA) | HSR has fundamentally different skill axes per mode. Generic ELO collapses them. Per-mode rating reflects actual skill. | MEDIUM | Composite global rating useful for matchmaking; per-mode useful for players to see strengths. |
| Screenshot verification via Imgur | HSR scores are not API-accessible (HoYoverse API gap). Player-submitted screenshots with mutual confirmation is the correct workaround. Ref/admin override for disputed results. | MEDIUM | Imgur integration already decided. Key design choice: require both players to submit before auto-confirming, don't rely on single-player honesty. |
| Roster-aware drafting | Players' owned characters (with eidolon levels) constrain what they can pick. No other competitive tool integrates game inventory into the draft. | HIGH | Depends on Roster Management being complete. Open/closed roster visibility toggle per tournament is already planned and is a meaningful design feature. |
| Anonymous play mode | Removes metagame of knowing your opponent before the draft. Unique to this platform. Challonge, start.gg have no such concept. | LOW | Toggle per lobby or tournament default. Already planned. Low complexity once identity data is withheld at render. |
| Step-by-step match replay | Full pick/ban sequence is recorded and replayable. Useful for coaching, analysis, community content. start.gg has no replay for non-video games; chess.com does for chess. | MEDIUM | Tables already exist (MatchSessionHistory, MatchSessionStepHistory). Replay viewer is frontend work. |
| Character-level win rate stats | "Which characters win most?", "What's my pick/ban win rate?" — no generic platform can answer HSR-specific questions. | MEDIUM | Requires aggregation across match history. Can be computed from existing step history if character IDs are recorded per step. |
| Best Ally / Nemesis cards on profile | Personalized social stats ("you win most with X", "you lose most to Y"). Engagement feature that creates community connection. | LOW | Pure aggregation query. Emotionally engaging, low complexity. |
| Real-time cursor tracking for spectators/coaches | Unique spectator experience. Coaches can watch player decision-making in real-time without interfering. | LOW | Already implemented as LobbyCursorEvent. Cost to expose to spectators is low. |
| Coach role (observer without action) | Formalized coaching structure is rare in non-major esports tools. Meaningful for community growth. | LOW | Permission mask: coach sees everything (including cursor), cannot call reducers that affect pick/ban. |
| Referee assignment per match | Trusted third-party verification per match. FACEIT uses automated anti-cheat; start.gg uses community TOs. For HSR, human referees per match is the correct model given screenshot-based verification. | LOW | Role assignment in tournament context. Ref sees both players' submitted screenshots, can override result. |
| Availability calendar with auto-sync | Scheduling across time zones is the #1 friction for grassroots tournaments. Auto-finding common slots eliminates back-and-forth Discord DMs. | HIGH | Complex feature. Recurring availability + multi-user overlap detection + calendar UI. Few platforms do this natively; most rely on WhenIsGood/LettuceMeet externally. |
| Achievement / title system | Personalized progression. "10 wins", "Tournament winner" titles give players long-term engagement goals beyond rating. | MEDIUM | Admin-defined criteria, auto-award on condition. Manual award for special titles. |
| Ephemeral in-match chat | Context-scoped communication without persistent chat history. Appropriate for a competitive draft context where you want communication but not permanent record. | LOW | Event table pattern already established. |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time voice/video chat | Players want to communicate during matches | High complexity, requires WebRTC or third-party service, significant infrastructure cost, moderation burden. Outside project scope. | Recommend Discord for voice; this platform focuses on structured game features, not communication infrastructure. |
| HoYoverse API roster import | Players want auto-sync of their actual in-game roster | HoYoverse API does not expose roster data in a documented, stable, or permitted way. Building against undocumented APIs creates fragile dependency that can break with any game update. | Manual roster entry first. Design data model to support import when/if API becomes available. |
| Computer vision screenshot scoring | Auto-extract score from uploaded screenshot | Requires ML model, training data, maintenance burden. Score extraction accuracy in HSR UI is not guaranteed; font rendering changes with game patches could break it. | Human verification (mutual confirmation + referee for disputes) is more reliable and auditable. |
| Persistent chat history / chat replay | Players want to review match conversation | Chat content can contain harassment, disputes, or toxic behavior. Persistence creates moderation and storage burden. Ephemeral chat is a deliberate design choice here. | If chat audit is needed for dispute resolution, referee/admin can be present in match at time of dispute. |
| Season implementation now | Players want seasonal resets and historical records | Schema supports seasons but building full season logic (resets, archives, season-specific leaderboards, season rewards) before MMR baseline is validated adds premature complexity. | Implement season_id column in schema (already done per PROJECT.md) but defer season logic until MMR baseline is stable and player base is established. |
| Payment / monetization | Premium brackets, paid tournament entry | Requires payment processor integration (Stripe, etc.), significant regulatory overhead. Not needed for competitive platform at this stage. | Keep platform free; monetization is out of scope per PROJECT.md. |
| Mobile native app | Players want a mobile experience | Web-first is correct for a complex draft UI. Mobile native requires separate codebase, app store approval, platform-specific behavior. Draft interaction is inherently desktop-oriented. | Progressive web app improvements can improve mobile usability without native app cost. |
| Global chat / lobby browser chat | Community wants a "town square" | Persistent public chat requires moderation infrastructure, spam control, and creates liability. Diverts from core competitive features. | Per-match ephemeral chat is sufficient. Community communication belongs in Discord. |
| Automated MMR manipulation detection | Prevent smurfing and rating farming | Without large player base, dedicated detection logic is premature. Rules-based detection produces false positives. | Admin manual review for flagged accounts. Add automated detection as a future feature once population is sufficient for statistical analysis. |

---

## Feature Dependencies

```
Roster Management
    └──required_by──> Roster-Aware Drafting
    └──required_by──> Account Rating
    └──enhances──> Tournament Settings (open/closed roster visibility)

MMR System
    └──requires──> Match Results & Scoring (confirmed results feed ELO calc)
    └──enhances──> Leaderboard
    └──enhances──> Tournament Seeding (auto-seed by MMR)

Match Results & Scoring
    └──requires──> Tournament Bracket (to know which match to score)
    └──requires──> Screenshot Upload (Imgur) for tournament matches
    └──enhances──> MMR System (inputs to rating update)
    └──enhances──> Player Stats (win/loss record)

Tournament Bracket
    └──requires──> Tournament Registration (to have entrants)
    └──requires──> Match Results & Scoring (to advance bracket)
    └──requires──> User Profiles (to display entrants)

Player Stats & Profile
    └──requires──> Match History (source of all stats)
    └──enhances──> Achievements (awards trigger off stat thresholds)

Achievement System
    └──requires──> Player Stats (conditions checked against stats)
    └──enhances──> User Profiles (titles displayed there)

Calendar & Scheduling
    └──enhances──> Tournament System (TO uses calendar for match scheduling)
    └──standalone──> [works independently for casual match scheduling]

Anonymous Play
    └──requires──> User Profiles (must have identity to hide it)
    └──conflicts──> Best Ally / Nemesis Stats (can't attribute wins if anonymous)

Referee Assignment
    └──requires──> Tournament System (referees are per tournament/match)
    └──required_by──> Tournament Match Result Validation

Coach Role
    └──requires──> Lobby/Match Membership system (already exists)
    └──enhances──> Cursor Tracking (coaches can view but not act)

MMR Leaderboard
    └──requires──> MMR System
    └──enhances──> Season support (future: leaderboard scoped to season)
```

### Dependency Notes

- **Match Results requires Screenshot Upload:** For tournament matches, Imgur-hosted screenshots are the evidence source. Casual matches use mutual confirmation without required screenshots.
- **Anonymous Play conflicts with Best Ally/Nemesis:** If players are anonymous, match attribution for social stats cannot work for those matches. Design decision: social stats only include non-anonymous matches, or anonymous matches attribute after tournament ends.
- **Tournament Seeding enhances Brackets:** Auto-seeding by MMR requires MMR to exist before a tournament starts. Tournaments without MMR (first ever event) must use manual seeding.
- **Achievement System requires Player Stats:** Achievements are triggered by conditions checked against accumulated stats (wins, matches played, characters used). Stats infrastructure must exist first.
- **Roster-Aware Drafting requires Roster Management:** Players must have entered their owned characters before a roster-constrained draft can validate legal picks.

---

## MVP Definition

This is a subsequent milestone (features are additive on top of existing draft/lobby system). MVP for this milestone = minimum to run a structured tournament end-to-end.

### Launch With (v1 — Backend Tables & Reducers)

This milestone is explicitly backend-only. The following are the minimum tables and reducers needed to support a tournament.

- [ ] **Tournament tables** (creation, settings, status enum) — without this, nothing else works
- [ ] **Tournament registration** (entrant signup, TO approval) — players need to be in the tournament
- [ ] **Bracket generation** (single elimination minimum) — core of the tournament experience
- [ ] **Match Results & Scoring** (both players submit, mutual confirmation, ref override) — without this, brackets cannot advance
- [ ] **MMR tables** (per-game-mode, global composite) — can be calculated from results, even if leaderboard UI is later
- [ ] **Roster Management tables** (owned characters + lightcones with eidolon/superimposition) — needed for roster-constrained drafts
- [ ] **Basic Player Stats** (wins, losses, win rate — derived from match history) — profile stats depend on this

### Add After Validation (v1.x)

- [ ] **Achievement system** — after player stats exist and are correct
- [ ] **Calendar & Scheduling** — after bracket system is live and TOs request it
- [ ] **Double elimination bracket** — after single elim is stable and tested
- [ ] **Group stage (round-robin)** — highest complexity bracket type, add last
- [ ] **Lobby Browser** — after lobby/tournament system is stable
- [ ] **Chat** — low complexity, add once core match flow is stable

### Future Consideration (v2+)

- [ ] **Season leaderboards** — after MMR baseline is stable, player base established
- [ ] **Automated achievement triggers** — start with manual admin award, automate later
- [ ] **Roster import** (if HoYoverse API becomes available) — defer entirely
- [ ] **Computer vision score extraction** — defer entirely

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Tournament bracket (single elim) | HIGH | MEDIUM | P1 |
| Match Results & Scoring (confirm + screenshot) | HIGH | MEDIUM | P1 |
| Roster Management | HIGH | LOW | P1 |
| MMR per game mode | HIGH | MEDIUM | P1 |
| Player Stats (wins/losses/win rate) | HIGH | LOW | P1 |
| Tournament registration (self-signup) | HIGH | LOW | P1 |
| Referee assignment | MEDIUM | LOW | P1 |
| Anonymous play | MEDIUM | LOW | P1 |
| Leaderboard | HIGH | LOW | P2 |
| Achievement system | MEDIUM | MEDIUM | P2 |
| Calendar & scheduling | MEDIUM | HIGH | P2 |
| Double elimination bracket | MEDIUM | HIGH | P2 |
| Coach role | LOW | LOW | P2 |
| Lobby browser | LOW | LOW | P2 |
| Ephemeral in-match chat | LOW | LOW | P2 |
| Character-level win rate stats | HIGH | MEDIUM | P2 |
| Best Ally / Nemesis cards | MEDIUM | LOW | P2 |
| Step-by-step match replay (UI) | MEDIUM | MEDIUM | P3 |
| Group stage / round-robin | LOW | HIGH | P3 |
| Season leaderboards | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for milestone launch
- P2: Should have, add when core is stable
- P3: Nice to have, future milestone

---

## Competitor Feature Analysis

Note: All competitor analysis is from training data (MEDIUM confidence). Web access was unavailable to verify current feature sets.

| Feature | Challonge | start.gg | FACEIT | Our Approach |
|---------|-----------|----------|--------|--------------|
| Bracket types | Single, double elim, round-robin, Swiss | Single, double elim, pools, Swiss | Single elim, round-robin | Single + double elim + group stage (soccer-style per PROJECT.md) |
| Player profiles | Basic (name, avatar, tournament history) | Full (bio, social links, game accounts, event history) | Full (rank, stats, team history) | HSR-specific stats (per-mode MMR, character win rates, Best Ally/Nemesis) |
| Match result reporting | Manual score entry by organizer or both players | Both players report; auto-confirm on agree | Automated (client-side anti-cheat) | Both players submit screenshot + score; mutual confirm; ref override for disputes |
| MMR/Rating | No native rating system | No native rating (links to game accounts) | Full ELO system per game | Per-game-mode ELO + global composite |
| Seeding | Manual only | Manual + some auto options | Automated by rating | Manual + MMR-based auto-seed |
| Scheduling | Manual organizer sets dates | Players report availability (limited) | Auto-schedule for leagues | Dedicated calendar with availability auto-sync |
| Spectator features | None | Stream integration | Tournament spectator view | Real-time cursor tracking, coach role, step replay |
| Game-specific features | Game-agnostic | Game-agnostic | Game-agnostic (PC titles) | HSR-native: draft integration, roster constraints, per-mode scoring |
| Chat | None built-in | Limited | In-client chat | Ephemeral per-match chat |
| Achievements | None | None | Achievement badges | Admin-defined, auto-award on condition |
| Anonymous play | None | None | None | Per-match/tournament toggle |

**Key gap:** Every competitor is game-agnostic and general purpose. None can know what characters a player owns, what eidolon level they have, or connect pick/ban to tournament brackets. This is the whitespace this platform owns.

---

## Sources

- Training data knowledge of Challonge (challonge.com), start.gg (formerly smash.gg), FACEIT, Battlefy, chess.com, lichess.org — MEDIUM confidence, through August 2025 knowledge cutoff
- PROJECT.md — HIGH confidence (primary source for this project's requirements and constraints)
- ARCHITECTURE.md, CONCERNS.md — HIGH confidence (existing codebase capabilities and limitations)
- Web access unavailable during research session — no live verification of current platform features

---

*Feature research for: Competitive gaming / esports tournament platform (HSR PVP)*
*Researched: 2026-03-15*
