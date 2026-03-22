# Player Stats

Architecture documentation for player statistics tracking, character stats, and global aggregates.

*Updated Phase 6 execution — PK expansions, character ban/faced stats, GlobalCharacterStat, private tables, season support.*

---

## Tables

```
User
|
+-- PlayerStat (aggregate stats per player per mode per season)
|     PK: [userId, gameMode, draftMode, seasonId, matchType, teamSize]
|     public: false (private table with per-user view)
|     userId              -> User.id
|     gameMode            -> GameMode enum (MoC, AS, AA)
|     draftMode           -> DraftMode enum (Classic, Auction)
|     matchesPlayed, wins, losses, draws
|     matchesSpectated    (D-30: incremented for spectators at finalization)
|     seasonId            -> Season.id (0 = pre-season)
|     matchType           -> MatchType enum (Casual, Ranked)
|     teamSize            -> u8 (1, 2, 3)
|     Indexes: by_user [userId], by_user_mode_draft_season_type_size [full PK]
|
+-- PlayerCharacterStat (per-character performance per mode per season)
|     PK: [userId, characterName, gameMode, draftMode, seasonId, matchType, teamSize]
|     public: false (private table with per-user view)
|     userId              -> User.id
|     characterName       -> HsrCharacter.name
|     gameMode, draftMode, seasonId, matchType, teamSize
|     matchesPlayed, wins, losses       (pick stats)
|     timesBannedInMatch               (D-23: incremented for ALL participants per ban)
|     timesFaced, winsAgainst, lossesAgainst  (D-24: opponent character tracking)
|     Indexes: by_user [userId], by_user_char_mode_draft_season_type_size [full PK]
|
+-- PlayerRelationship (ally/opponent tracking per mode per season)
|     PK: [userId, otherUserId, gameMode, draftMode, seasonId, matchType, teamSize]
|     public: false (private table with per-user view)
|     userId, otherUserId -> User.id
|     gameMode, draftMode, seasonId, matchType, teamSize
|     matchesAsAlly, winsAsAlly
|     matchesAsOpponent, winsAsOpponent
|     Indexes: by_user [userId], by_user_other_mode_draft_season_type_size [full PK]
|
+-- GlobalCharacterStat (community-wide character aggregates)
      PK: [characterName, gameMode, draftMode, seasonId, matchType, teamSize]
      public: true
      characterName, gameMode, draftMode, seasonId, matchType, teamSize
      timesPicked, timesBanned, wins, losses, matchesPlayed
      Indexes: by_char_mode [characterName, gameMode], by_season [seasonId]
```

---

## Expanded PK Design (Phase 6 — D-38 through D-42)

All stat tables use composite primary keys expanded in Phase 6 to include seasonId, matchType, and teamSize:

| Table | PK Columns | New in Phase 6 |
|-------|-----------|----------------|
| PlayerStat | userId, gameMode, draftMode, seasonId, matchType, teamSize | seasonId, matchType, teamSize |
| PlayerCharacterStat | userId, characterName, gameMode, draftMode, seasonId, matchType, teamSize | seasonId, matchType, teamSize |
| PlayerRelationship | userId, otherUserId, gameMode, draftMode, seasonId, matchType, teamSize | seasonId, matchType, teamSize |
| GlobalCharacterStat | characterName, gameMode, draftMode, seasonId, matchType, teamSize | (new table) |

### seasonId Convention (D-45)

- seasonId=0 means "pre-season" — match played before any Season was created
- The active season is read from the Season table at finalization time
- Client sums across all seasons for career/all-time stats (D-35 — no all-time bucket)

---

## Private Tables with Per-User Views (D-33)

PlayerStat, PlayerCharacterStat, and PlayerRelationship are declared `public: false`:
- Stats are NOT broadcast to all subscribers
- Each user sees only their own stats via per-user views
- Stats visibility follows the user's roster visibility setting
- In-match: lobby/tournament rosterVisibility overrides user preference
- Referee always sees all participant stats regardless of visibility settings

---

## Character Stats (Phase 6 — D-22 through D-29)

### PlayerCharacterStat Columns

| Column | Type | Description | Trigger |
|--------|------|-------------|---------|
| matchesPlayed | u32 | Times this character was picked by this user | Pick action |
| wins | u32 | Wins when picking this character | Pick + win |
| losses | u32 | Losses when picking this character | Pick + loss |
| timesBannedInMatch | u32 | Times this character was banned in user's matches | Ban action (ALL participants) |
| timesFaced | u32 | Times user faced this character (opponent picked it) | Opponent pick |
| winsAgainst | u32 | Wins against this character | Opponent pick + user won |
| lossesAgainst | u32 | Losses against this character | Opponent pick + user lost |

### Ban Stats Semantics (D-23/D-29)

- **PlayerCharacterStat.timesBannedInMatch**: Incremented for ALL participants when a character is banned. Answers "how available is this character in my matches?" (personal experience metric).
- **GlobalCharacterStat.timesBanned**: Incremented once per ban event. Answers "how often is this character banned?" (community meta metric).

### Faced-Against Stats (D-24)

timesFaced/winsAgainst/lossesAgainst track performance against opponents who picked a character. Answers "which characters do I struggle against most?" — a different question than "what are my worst characters?"

### Mirror-Pick Safety (D-26)

If both sides pick the same character, both "picked" and "faced" counters fire on the same PlayerCharacterStat row. Independent columns prevent conflicts.

### Auction Mode (D-28)

Classic Pick and Auction WinBid both map to the same pick stat increment. draftMode in PK keeps them separate.

---

## GlobalCharacterStat (Phase 6 — D-34)

Community-wide aggregates for character meta analysis. Public table.

| Column | Type | Description |
|--------|------|-------------|
| timesPicked | u32 | Total times picked across all matches |
| timesBanned | u32 | Total times banned across all matches |
| wins | u32 | Wins when picked |
| losses | u32 | Losses when picked |
| matchesPlayed | u32 | Total matches where picked |

Incremented during finalization alongside individual stats. Enables pick rate, ban rate, and win rate calculations on the client.

---

## Spectated Count (Phase 6 — D-30/D-31/D-32)

matchesSpectated on PlayerStat is incremented at finalization for spectators present in the lobby:
- Identifies spectators via `LobbyMember.teamSlot.tag === 'Spectator'` where `!isCoach && !isReferee`
- Follows the full PK pattern — breaks down per gameMode/draftMode/seasonId/matchType/teamSize
- Spectator identities are NOT preserved in MatchParticipantHistory (D-31)

---

## Season Table (Phase 6 — D-47/D-48)

| Column | Type | Description |
|--------|------|-------------|
| id | u32 autoInc | Primary key |
| name | string | e.g. "Patch 3.0" |
| startDate | timestamp | Season start |
| endDate | timestamp? | null = current/ongoing |
| isActive | bool | Only one active at a time |

Admin creates seasons via `create_season`, marks one active via `set_active_season` (deactivates all others first).

---

## Client Summation for All-Time Stats (D-35)

No "season 0 all-time bucket" exists. The client sums across all seasons for career/all-time stats. This avoids doubling writes and row count on PlayerCharacterStat (the largest stat table).

---

## Incremental Aggregation Pattern

Stats are updated incrementally during finalization, not recomputed from scratch.

### On finalize / auto-finalize:
- PlayerStat: increment matchesPlayed, wins/losses/draws per participant; matchesSpectated per spectator
- PlayerCharacterStat: increment pick stats per picked character, ban stats for ALL participants per ban, faced stats per opponent character
- PlayerRelationship: bidirectional pair increments (ally or opponent)
- GlobalCharacterStat: community pick/ban/win aggregates

### Stat Increment Helpers

| Helper | File | Purpose |
|--------|------|---------|
| incrementPlayerStat | statsIncrement.ts | Per-participant win/loss/draw |
| incrementPlayerRelationship | statsIncrement.ts | Bidirectional ally/opponent tracking |
| incrementPlayerCharacterStat | characterStatsIncrement.ts | Pick stats (matchesPlayed, wins, losses) |
| incrementBanStat | characterStatsIncrement.ts | Ban stats for ALL participants per ban |
| incrementFacedStat | characterStatsIncrement.ts | Faced-against opponent character stats |
| incrementGlobalCharacterStat | globalCharacterStatsIncrement.ts | Community aggregate pick/ban/win |

### Derived Values (client-side)
- **Best Ally:** Sort PlayerRelationship by winsAsAlly ratio (where matchesAsAlly >= threshold) (STAT-03)
- **Nemesis:** Sort by winsAsOpponent from other player's perspective (STAT-04)
- **Win Rate:** wins / matchesPlayed
- **Character Win Rate:** PlayerCharacterStat.wins / matchesPlayed
- **Pick Rate:** GlobalCharacterStat.timesPicked / sum(matchesPlayed)
- **Ban Rate:** GlobalCharacterStat.timesBanned / total matches

---

## What Triggers Updates

Only finalization updates stat tables. Stats are NEVER updated by:
- submit_match_result (only changes status; casual auto-finalize calls runFinalization)
- confirm_match_scores (only sets confirmation flag)
- override_match_result (only changes status/winner)

---

## Key Decisions

- Stats updated incrementally on finalization -- not computed on-the-fly
- Best Ally / Nemesis derived client-side from PlayerRelationship counters (not stored)
- Character stats split into pick/ban/faced columns on the same table (D-22 through D-29)
- GlobalCharacterStat is a separate public table for community meta (D-34)
- No stat rollback on disputes — disputes resolved BEFORE finalization (D-36)
- Casual auto-finalize eliminates gap between submit and finalize (D-37)
- All stat tables private with per-user views (D-33)
- No all-time bucket — client sums across seasons (D-35)

---

**Behavior specification** (acceptance scenarios, edge cases, phase history): See [contract.md](contract.md)
