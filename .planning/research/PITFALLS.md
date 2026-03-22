# Pitfalls Research

**Domain:** Competitive gaming platform — tournament brackets, MMR/ELO, real-time match management on SpacetimeDB
**Researched:** 2026-03-15
**Confidence:** MEDIUM-HIGH (codebase evidence: HIGH; tournament/ELO patterns: MEDIUM from training knowledge; SpacetimeDB-specific: HIGH from existing code)

---

## Critical Pitfalls

### Pitfall 1: Tournament State Machine Without Explicit State Enum

**What goes wrong:**
The tournament progresses through states (Registration → Seeding → Round 1 → ... → Final → Closed) but the states are inferred from boolean flags, null checks, or a count of completed matches rather than an explicit `TournamentStage` enum. This causes reducers to disagree on whether the tournament is "in progress," allowing matches to be submitted after the bracket closes, sign-ups after seeding runs, or bracket generation to be triggered twice.

**Why it happens:**
Developers start with "is the bracket generated yet?" as a boolean, then add "are sign-ups open?" as another boolean, and the combination of flags grows into an implicit state machine that no single reducer understands fully. The existing codebase has `LobbyStage` as a proper enum — but the lobby lifecycle is simpler (3 states). A tournament has 6–8 states and the temptation is to reuse the lobby pattern without extending it.

**How to avoid:**
Define a `TournamentStage` enum on the `Tournament` table before writing any reducer that reads or writes tournament state. Every reducer that mutates a tournament must validate the current stage and throw if the transition is invalid. Use a single `advance_tournament_stage` reducer as the only legal way to move between states; all other reducers check stage but never change it except by calling this one.

Example stages: `Draft | Registration | Seeding | InProgress | Completed | Cancelled`

**Warning signs:**
- Reducer code contains `if (tournament.bracketGenerated && !tournament.completed)` style guards
- Multiple reducers each set different fields to signal "done"
- A match result can be submitted when the tournament is in Registration stage (no guard)
- `spacetime logs` shows the same bracket-generation reducer being called twice

**Phase to address:**
Tournament system foundation phase — design the state machine before any match or bracket reducer is written.

---

### Pitfall 2: ELO Applied to Tournament Matches That Are Not Yet Verified

**What goes wrong:**
MMR updates fire when a match result is recorded, but for tournament matches the result requires referee or admin validation. If ELO is applied at record time, then a player can submit a false result, receive MMR, and the correction (when a referee overrides) causes negative MMR delta that looks like punishment to the innocent party.

**Why it happens:**
The `MatchSessionHistory` already stores a `result: MatchResult` field. It is natural to trigger ELO recalculation as an on-insert side effect on that table. The distinction between "result recorded" and "result verified" is not represented in the schema.

**How to avoid:**
Add a `verificationStatus` field to the match result record (enum: `Pending | VerifiedByRef | VerifiedByAdmin | Disputed`). ELO update reducers must check `verificationStatus` and only process `Verified*` rows. A separate `verify_match_result` reducer owned by referees/admins triggers ELO recalculation. For casual matches with mutual confirmation, mutual confirmation counts as verification.

**Warning signs:**
- The match result table has no `verifiedBy` or `verifiedAt` column
- ELO is updated inside the same reducer that accepts a screenshot URL
- No reducer exists that a referee calls to confirm a result
- Screenshot URL stored but no "accepted" toggle

**Phase to address:**
Match result verification phase — verification status must be schema-level, not UI-level.

---

### Pitfall 3: ELO K-Factor Frozen at One Value Across All Players

**What goes wrong:**
New players with 5 matches have the same K-factor as veterans with 500 matches. A new player who beats a high-MMR veteran gains only 16 points while losing 16 points for each loss — the system converges too slowly and feels punishing for new competitive players. Simultaneously, a smurf (high-skill, low-MMR) rockets through the ladder in a few games distorting others' ratings.

**Why it happens:**
Standard ELO tutorials show K=32. Developers copy it directly. K-factor tuning is treated as a post-launch concern, but once thousands of games have been recorded with a bad K value, recalculating all historical ELO from scratch is expensive and invalidates the leaderboard.

**How to avoid:**
Use a provisional-games system: K=40 for the first 20 verified matches, K=20 for matches 21–100, K=10 for 100+. Store `matchesPlayedPerMode` on the MMR record (not just the rating). This also enables MMR decay for inactive players later without a schema change. The K-factor tiers should be constants in a single location (not magic numbers inside reducer logic).

**Warning signs:**
- MMR schema has only `rating` with no `provisionalGamesRemaining` or `matchesPlayed` counter
- K-factor is a literal number inside an arithmetic expression in the reducer
- No distinction between provisional and established ratings in the leaderboard query

**Phase to address:**
MMR system phase — schema and K-factor rules must be locked before the first real match is rated.

---

### Pitfall 4: Disconnect Handler Allowing Match State Mutation After Forfeit

**What goes wrong:**
A player disconnects during a draft pick. The disconnect timer counts down and the match is forfeited. Meanwhile, the disconnected client reconnects 2 seconds after the forfeit is written and their client fires the queued `submit_pick` reducer call that was buffered during the reconnect. The reducer succeeds because it checks `is player a member` and `is it their turn` — but does not check `is the match still in a live state`. The pick lands on a forfeited match, corrupting the history record.

**Why it happens:**
The `MatchSession` does not store a `liveStatus` flag — liveness is inferred by the lobby's `stage: Drafting` field. The disconnect forfeit reducer transitions the lobby to `Finished` but the client's queued reducer call arrived between the lobby stage write and when the subscription update reached the reconnecting client.

**How to avoid:**
Every pick/ban/bid reducer must begin with an atomic check: `if (lobby.stage !== LobbyStage.Drafting) throw`. This check already needs to exist for correctness in the non-disconnect flow, but the disconnect case makes it critical. The existing `LobbyStage` enum makes this straightforward. Additionally, add a `disconnectForfeited: boolean` field to `MatchSession` that is set atomically in the forfeit reducer, and check it in all mutation reducers before the stage check (it is the tighter condition).

**Warning signs:**
- Pick/ban reducers validate team membership and turn order but not match liveness
- The disconnect forfeit reducer does not set any flag on `MatchSession` itself, only on `Lobby`
- No reducer test covers "submit pick after forfeit" scenario

**Phase to address:**
Disconnect/rejoin handling phase — the liveness guard belongs in every action reducer, not just the disconnect reducer.

---

### Pitfall 5: Bracket Seeding Race Condition in Double Elimination

**What goes wrong:**
Double elimination requires a losers bracket that is populated as players lose in the winners bracket. If the bracket tree is generated as a flat list of match slots at tournament start, the seeding of future losers bracket matches depends on which round the player lost in. If two losers bracket matches complete at the same moment (two concurrent `submit_result` calls), both reducers read the bracket state before either write completes, and both advance the same match slot — producing a match with one player slot populated by two different losers.

**Why it happens:**
SpacetimeDB reducers are individually transactional, but developers expect that "last write wins" resolves concurrent updates cleanly. For tree-structured bracket advancement, the write order matters: round 3 loser must go to a specific losers bracket slot that depends on round 2 results, not just "next available slot."

**How to avoid:**
Pre-generate the entire bracket tree at seeding time with explicit match IDs and slot assignments. Each bracket match record stores `slot_index`, `source_winners_match_id`, and `source_losers_match_id`. The advancement reducer looks up the specific target slot by match ID — never by "find next empty slot." SpacetimeDB's per-reducer transaction isolation prevents the exact same slot being written simultaneously, but the slot lookup must be deterministic and ID-based.

**Warning signs:**
- Bracket advancement reducer does `find first match where winner is null`
- Losers bracket slots are created reactively as players lose (not pre-generated)
- No explicit relationship between a winners bracket match and its corresponding losers bracket destination

**Phase to address:**
Tournament bracket generation phase — the data model for pre-generated bracket trees must be designed before any advancement reducer is written.

---

### Pitfall 6: MMR Recalculation Not Idempotent

**What goes wrong:**
A referee corrects a match result. The system needs to subtract the MMR from the old result and apply the new result. If the MMR update reducer is not idempotent (i.e., calling it twice produces a different outcome than calling it once), a network retry, a client reconnect, or a TO clicking "confirm" twice can double-apply the MMR delta.

**Why it happens:**
ELO update reducers are written as `new_rating = current_rating + delta`. If the reducer runs twice, the delta applies twice. There is no guard checking whether this specific match has already been rated.

**How to avoid:**
Store a `mmrProcessedAt: timestamp | null` on the match result record. The ELO reducer checks: if `mmrProcessedAt` is already set, throw or no-op. Only one reducer call can set it (first-writer wins by transaction isolation). When overriding a result, a separate `undo_mmr_for_match` reducer clears `mmrProcessedAt` and reverses the stored delta before re-applying.

**Warning signs:**
- Match result table has no "was MMR already applied?" field
- ELO update is triggered client-side (e.g., called from a React event handler, not from the verify reducer)
- No audit trail of MMR changes with match reference

**Phase to address:**
MMR system phase — idempotency guard must be part of the initial MMR schema, not retrofitted.

---

### Pitfall 7: Imgur URL Accepted as Match Proof Without Validation

**What goes wrong:**
Both players upload Imgur screenshots and submit scores. A player submits a URL pointing to a valid Imgur image that is not their actual score — it could be a different score, a previous match, or a fabricated image. The referee sees two image URLs and a score number. If the referee workflow does not enforce comparing the image to the submitted score, and there is no checksum or timestamp metadata on the image, the result can be disputed without resolution.

**Why it happens:**
"Upload to Imgur and paste URL" is the simplest path. The implicit assumption is that referees visually verify screenshots. Under tournament stress (multiple concurrent matches), referees may confirm without careful review. There is also no protection against reusing a screenshot from a different match.

**How to avoid:**
Store both the Imgur URL and the player-stated score separately in the match result record. Add a `submittedAt` timestamp. Require the referee to explicitly check both players' screenshots against the stated score in the UI before the confirm button is enabled. Add a `disputeReason` field to match results so referees can flag inconsistencies without aborting the tournament flow. This is a UX responsibility — the schema needs `screenshotUrlBlue`, `screenshotUrlRed`, `scoreBlue`, `scoreRed`, `refVerifiedAt`, `refVerifiedById` as separate fields, not a single JSON blob.

**Warning signs:**
- Screenshot URL and score are stored in the same string field
- No `refVerifiedAt` or `refVerifiedById` column in the match result schema
- Referee confirmation UI does not display both screenshots side-by-side

**Phase to address:**
Match result verification phase — schema must separate image evidence from stated score from referee decision.

---

### Pitfall 8: Anonymous Play Leaking Real Identity Through Cursor Tracking

**What goes wrong:**
Anonymous play mode hides player names. But the existing cursor broadcasting system (`LobbyCursorEvent`) broadcasts the cursor by identity. If the cursor event includes a `userId` or `displayName` in the payload, and that payload is visible to spectators, the anonymization is defeated. Even if the user ID is not in the event, a spectator who watched the same player's cursor in a previous non-anonymous match can correlate cursor behavior patterns.

**Why it happens:**
The cursor system was designed before anonymous mode existed. The `userId` on the event is there for rendering (which cursor label to show). Anonymization is applied at the display layer (show "Player A" instead of real name) but the raw event data in the SpacetimeDB table still contains the real identity.

**How to avoid:**
Anonymous mode must be enforced at the data layer, not the display layer. When a lobby is in anonymous mode, cursor events must carry an `anonymousLabel` (e.g., `"Blue-1"`) instead of any user identifier. The reducer generating cursor events should substitute the label at write time based on the lobby's `anonymousPlay` setting. The SpacetimeDB `LobbyCursorEvent` table should be redesigned so that the `userId` field is nullable — null when anonymous, real ID when not.

**Warning signs:**
- `LobbyCursorEvent` table always stores `userId` regardless of lobby anonymous setting
- Anonymous mode is implemented as a CSS class or display-layer transform on the frontend only
- Spectators can query raw cursor events and see user IDs for anonymous lobbies

**Phase to address:**
Anonymous play implementation phase — must be enforced in the cursor-writing reducer, not the cursor-reading UI.

---

### Pitfall 9: Calendar Availability Stored as Absolute Timestamps Instead of Recurrence Rules

**What goes wrong:**
A player sets "available every Saturday 8–10 PM." If this is stored as a list of individual timestamp pairs (one per week for the next 52 weeks), the table grows unboundedly, requires batch cleanup, and breaks when the player's availability changes — because all 52 rows must be updated atomically. If stored as a recurrence rule (day-of-week + time-of-day + timezone), a single row update changes the entire future schedule.

**Why it happens:**
The simplest data model for "available at time X" is a timestamp range. Recurrence feels like over-engineering at the start. But the PROJECT.md explicitly calls out "recurring availability (daily, weekly, monthly with Feb handling)" which signals the complexity is required from day one.

**How to avoid:**
Store availability as a recurrence rule struct: `{ dayOfWeek: u8, startTimeUtcMinutes: u32, durationMinutes: u32, recurrenceType: Weekly|Monthly|Daily, effectiveFrom: timestamp, effectiveUntil: timestamp | null }`. The calendar query logic materializes concrete time slots from these rules client-side (or via a scheduled reducer that pre-generates slots weekly). Do not store individual timestamps. Handle February and month-boundary edge cases in the materialization logic, not the schema.

**Warning signs:**
- Calendar availability table has `startAt: timestamp` and `endAt: timestamp` as its primary columns (no recurrence rule)
- Rows for the same recurring slot have sequential IDs, one per occurrence
- No `recurrenceType` or `dayOfWeek` field in the schema

**Phase to address:**
Calendar and scheduling phase — recurrence schema must be settled before any availability UI is built, as migrating from flat timestamps to recurrence rules requires a full table migration.

---

### Pitfall 10: Roster Visibility Settings Overridable by Client Without Server Enforcement

**What goes wrong:**
A tournament is configured as "closed roster" (only the player sees their own roster during the draft). The frontend hides the opponent's roster. But the SpacetimeDB subscription for the roster table is `public: true`, meaning any client that knows the user ID can query the full roster directly via SpacetimeDB. The "closed roster" is cosmetic.

**Why it happens:**
The existing tables are declared `public: true` for simplicity. Most data in the app is non-sensitive game data. Roster privacy was added as a product requirement after the data model was set. The assumption is "the frontend won't show it" — but SpacetimeDB subscriptions are accessible to any client that connects.

**How to avoid:**
Roster rows must be tagged with a `visibility` field and filtered server-side. SpacetimeDB supports row-level filtering via subscription queries — use `WHERE userId = :sender OR visibility = 'Public'` style constraints. This requires the Roster table to not be globally public. Alternatively, use a separate `RosterPublicView` table that only contains rows the requesting user is allowed to see (requires a more complex update pattern). Document the explicit decision: "Roster is not public by default; the server controls what each client can subscribe to."

**Warning signs:**
- Roster table is declared `public: true` with no row filter
- Roster visibility check is only in the React component render logic
- An admin or developer can query all rosters by opening SpacetimeDB console

**Phase to address:**
Roster management phase — table visibility must be architecture-level, not a display layer concern.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store ELO delta at match end with no match reference | Simple, one reducer | Cannot reverse/replay ratings after result correction | Never — always link MMR delta to match ID |
| `public: true` on all tables | No subscription complexity | Any client can read any user's sensitive data (roster, MMR, etc.) | Only for genuinely public game data (characters, lightcones) |
| Single global MMR value instead of per-mode | One number to show | Cannot surface "best MoC player" leaderboard; per-mode skill invisible | Acceptable for MVP only if schema already has per-mode field |
| Tournament bracket as a flat match list without explicit slot IDs | Easy to generate | Cannot deterministically advance double-elim without race conditions | Never for double elimination; acceptable for single elimination only |
| `rosterBlue`/`rosterRed` as JSON string blobs | No schema migration | Cannot query "which characters won most often" without parsing strings | Acceptable for match history archival; never for live match data |
| Re-using `LobbyStage` enum for tournament state | Reuses existing type | Tournament has 2x more states; enum becomes ambiguous | Never — define `TournamentStage` as a separate enum |
| Applying ELO in the same reducer that records the result | One round-trip | Makes verification/override impossible without re-architecting the system | Never for tournament matches; acceptable only for casual unranked matches |
| Hard-coding K=32 without provisioning games counter | Zero config | Smurf and new-player ratings are inaccurate; correcting requires historical replay | Never — add provisioning counter from day one even if K factor is not tuned yet |

---

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Imgur screenshot upload | Storing the Imgur URL as the verification itself | Store URL + player-stated score + referee acceptance as three separate fields; URL is evidence, not proof |
| Imgur screenshot upload | Accepting any `i.imgur.com` URL without format check | Validate URL format in the reducer (regex check for `^https://i\.imgur\.com/[A-Za-z0-9]+\.(png|jpg|jpeg|gif)$`) before storing |
| Discord OAuth for roster import | Assuming Discord identity = HSR account | Discord ID ties to platform identity, not HSR account; players with multiple HSR accounts need a separate account selector |
| SpacetimeDB client reconnect | Assuming queued reducer calls are dropped on disconnect | SpacetimeDB client retries buffered calls on reconnect; reducers must be idempotent or check liveness before acting |
| SpacetimeDB scheduled reducers | Using `ScheduleAt` for countdown timers in competitive matches | Scheduled reducers are not guaranteed exact-second precision; use stored `timerStartAt` timestamps and calculate elapsed time in the action reducer, not scheduled callbacks |
| SpacetimeDB bindings after schema change | Calling old reducer signatures after publishing new schema | Always regenerate bindings (`spacetime generate`) after publishing; old frontend calling new reducer will throw at runtime with no TypeScript error |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Full-scan `iter()` to find all tournament matches for a player | Bracket page load slows down as match history grows | Add compound index on `(tournamentId, participantId)` to tournament match table | ~5,000 total tournament matches |
| Subscribing to entire `MatchSessionHistory` table client-side | Initial load slow; memory grows with every archived match | Use filtered subscriptions: `WHERE playedAt > [cutoff]` or paginate; never subscribe to all history | ~1,000 archived matches |
| Per-player cursor events stored in a persistent table | `LobbyCursorEvent` table grows unboundedly during a long draft | Keep cursor events as ephemeral event table (not retained); existing `LobbyCursorEvent` pattern is correct — do not accidentally make it persistent when adding chat | N/A — design issue, not scale issue |
| Recalculating leaderboard ranking on every MMR update | Leaderboard query slows as player count grows | Maintain a `rank` field on the MMR table, updated only by a scheduled reducer that runs periodically | ~500 players with frequent matches |
| Full roster scan to compute "account rating" on every profile view | Profile page load is slow | Cache computed `accountRating` on the Roster or User record; recompute only when roster changes | ~200 characters in a roster |
| O(n) bracket advancement (iterate all matches to find next round) | Tournament progression slows as bracket grows | Pre-compute `nextMatchId` foreign keys at bracket generation time | 64+ participant brackets |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting `teamLabel` argument in pick/ban reducers | Player submits a pick for the opponent's team | Always derive team membership from the database (`LobbyMember` lookup by `ctx.sender`), never from caller-supplied `teamLabel` parameter |
| Referee role scoped globally instead of per-tournament | A referee assigned to Tournament A can validate results in Tournament B | Store referee assignment as `(tournamentId, userId)` tuple — not a global role flag on the User row |
| TO role auto-grants ability to modify any tournament | Malicious TO modifies another TO's bracket | Every tournament-mutation reducer must check `tournament.createdById === caller.id OR caller.role === Admin` |
| Anonymous play enforced only at display layer | Spectator inspects SpacetimeDB subscription and gets real user IDs | Enforce anonymization at the reducer/event-write layer; cursor events and match events must carry the label, not the ID |
| MMR manipulation via result submission timing | Player submits result before opponent, gets favorable processing | Use the dual-submission model: both players submit independently; result only becomes official when both match (or referee overrides) |
| Guest account playing rated matches | Guests accumulate MMR that cannot be linked to a real account | Rated matches must require authenticated (Discord-linked) accounts; guest play is unrated only |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing MMR change immediately on submit (before referee verification) | Players feel cheated when MMR is later reversed after a result override | Show MMR as "Pending" with a lock icon until `verificationStatus` is confirmed; animate the final change only after verification |
| Disconnect timer showing server-side countdown reconstructed from `timerStartAt` | Timer display stutters or shows wrong value if client clock drifts | Calculate remaining time from `timerStartAt` + elapsed using server-authoritative timestamp, but display locally with `requestAnimationFrame` interpolation |
| Bracket visualization built from live table subscriptions only | If a player reloads mid-tournament, bracket does not appear until all subscriptions hydrate | Cache bracket structure client-side and optimistically render from cache while subscriptions load |
| Single screenshot required for 2-boss game modes | Player has to combine two screenshots manually | Support separate screenshot upload per boss when game mode is `ApocalypticShadow`; the schema decision from PROJECT.md to support "per boss or combined" must be reflected in the result schema |
| Calendar showing all times in UTC | International players schedule incorrectly | Store availability in UTC internally; display in the user's detected timezone with explicit UTC conversion shown |
| "Roster closed" mode with no indication during draft | Players do not know roster is hidden; assume it is a bug | Show a permanent "Roster Hidden" banner in the draft UI when `closedRoster` is active; never silently hide data without signaling why |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Tournament bracket generation:** Looks complete when matches are created — verify that losers bracket slots have explicit source-match references, not just "round N" placeholders.
- [ ] **ELO/MMR system:** Looks complete when rating updates after a match — verify that `mmrProcessedAt` is set on the match record and that calling the reducer twice produces no second delta.
- [ ] **Match result verification:** Looks complete when screenshot URL is stored — verify that `refVerifiedAt`, `refVerifiedById`, and `verificationStatus` are separate schema fields and that ELO does not update until all three are populated.
- [ ] **Disconnect handling:** Looks complete when forfeit is applied after countdown — verify that pick/ban reducers check match liveness independently and throw if the match is in a non-live state, regardless of how the forfeit was applied.
- [ ] **Anonymous play:** Looks complete when player names are hidden in the UI — verify by querying the SpacetimeDB table directly that cursor events and match events contain labels, not real user IDs.
- [ ] **Roster visibility:** Looks complete when the opponent's roster is hidden in the draft UI — verify that the SpacetimeDB subscription for the roster table is filtered server-side and a raw subscription reveals no hidden data.
- [ ] **Calendar recurrence:** Looks complete when a recurring slot appears on the calendar — verify that changing the recurrence rule affects all future occurrences and that no orphaned individual-timestamp rows exist.
- [ ] **Per-game-mode MMR:** Looks complete when three MMR values exist on the player record — verify that each game mode's MMR is updated only by matches of that game mode and that the global composite recalculates correctly when any one mode updates.
- [ ] **Referee assignment:** Looks complete when a referee is assigned to a tournament — verify that the referee's permissions are scoped to that tournament only, and that they cannot validate results in tournaments they are not assigned to.
- [ ] **Chat ephemerality:** Looks complete when chat messages appear during the match — verify that after the match is archived, the chat event table rows are deleted or have no foreign key into the persistent history tables.

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| ELO applied before result verified (result later overridden) | HIGH | Write an admin reducer that: (1) reads the stored delta from the match record, (2) reverses it from both players' MMR, (3) reprocesses with correct result, (4) clears and re-sets `mmrProcessedAt`. Requires stored delta field from day one. |
| Tournament state stuck in wrong stage (corrupted state machine) | MEDIUM | Admin reducer `force_set_tournament_stage` that overrides stage with explicit audit log entry; dangerous but necessary recovery valve. |
| Bracket slot populated by wrong player (race condition) | HIGH | Admin reducer to manually reassign bracket slot + invalidate the match played in the wrong slot. Tournament may need to be restarted if multiple rounds advanced. |
| Anonymous play identity leaked in event table | HIGH | Cannot un-leak already-emitted events. Mitigation: delete the affected event rows, issue a community notice. Prevention is the only real solution. |
| Calendar availability stored as flat timestamps (schema migration needed) | MEDIUM | Write a migration reducer that reads all flat timestamp availability rows, converts to recurrence rules, inserts into new table, deletes old rows. Run once via admin trigger. |
| Imgur URL submitted for wrong match (screenshot reuse fraud) | LOW | Referee disputes the result via `disputeReason` field; TO or admin overrides with correct result. No schema migration needed if dispute fields exist. |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Tournament state machine without enum | Tournament foundation (tables/schema) | Every tournament reducer begins with a stage assertion; no reducer sets stage fields except `advance_tournament_stage` |
| ELO applied before result verified | MMR system + match result verification | `mmrProcessedAt` column exists; ELO reducer throws if called twice on same match |
| ELO K-factor frozen at one value | MMR system foundation | `provisionalGamesPlayed` counter exists on MMR record; K-factor is computed, not hardcoded |
| Disconnect handler allowing post-forfeit mutation | Disconnect/rejoin phase | Pick/ban/bid reducers all contain a liveness check that throws for non-Drafting or forfeited sessions |
| Bracket seeding race condition | Tournament bracket generation | Losers bracket slots have pre-computed `sourceMatchId` foreign keys; advancement reducer uses ID lookup, not search |
| MMR recalculation not idempotent | MMR system phase | Admin applies ELO twice on a test match; second call is a no-op |
| Imgur accepted without structured evidence | Match result schema phase | `screenshotUrlBlue`, `screenshotUrlRed`, `scoreBlue`, `scoreRed`, `refVerifiedAt`, `refVerifiedById` are separate columns |
| Anonymous play leaking identity | Anonymous play phase | Raw SpacetimeDB query of cursor/event tables shows only labels for anonymous lobbies |
| Calendar as flat timestamps | Calendar/scheduling phase | Recurrence rule struct exists in schema; no `startAt: timestamp` column on availability table |
| Roster visibility client-side only | Roster management phase | SpacetimeDB subscription for roster uses row-level filter; raw subscription from non-owner returns no hidden rows |
| Referee role scoped globally | Tournament referee phase | Referee permission check queries `(tournamentId, userId)` table, not `user.role` |
| Guest play in rated matches | MMR system phase | `create_rated_match` reducer checks `user.discordId !== null` before allowing match creation |

---

## Sources

- Codebase evidence: `spacetimedb/src/tables/matchSession.ts`, `types/enums.ts`, `types/structs.ts`, `tables/lobby.ts`, `tables/matchSessionHistory.ts`, `helpers/ensurePermissions.ts` — HIGH confidence
- Project context: `.planning/PROJECT.md` — HIGH confidence (authoritative project scope)
- Known issues: `.planning/codebase/CONCERNS.md` — HIGH confidence (identifies existing fragile areas)
- SpacetimeDB reducer transaction model: training knowledge (SpacetimeDB 2.x) — MEDIUM confidence; verify against current SpacetimeDB docs before implementing scheduled reducers and subscription filters
- ELO K-factor tiering: industry-standard competitive gaming pattern (Chess.com, FIDE) — MEDIUM confidence
- Tournament bracket race conditions: general distributed system patterns applied to SpacetimeDB's transaction model — MEDIUM confidence

---

*Pitfalls research for: HSRPVP competitive gaming platform — tournament, MMR, real-time features*
*Researched: 2026-03-15*
