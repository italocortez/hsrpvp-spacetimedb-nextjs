# Phase 9: Mouse Tracking, Chat, and Lobby Browser - Research

**Researched:** 2026-03-29
**Domain:** SpacetimeDB backend — full lobby lifecycle, draft systems, chat, cursor broadcast, per-client views
**Confidence:** HIGH

## Summary

Phase 9 is the most critical and largest phase of the v0.5 milestone. It builds the complete match lifecycle chain — from lobby creation through drafting (Classic + Auction), post-draft equipping, scoring, and finalization — that enables every deferred test from Phases 3, 4, 5, and 7. The scope encompasses ~30 new reducers, ~15 schema modifications (tables, enums, structs), 5 per-client views for anonymous enforcement and history visibility, a scheduled GC reducer for lobby cleanup, and extensive doc rewrites.

The codebase already has mature patterns for every building block needed: composite PK tables (LobbyMember), event tables (LobbyCursorEvent), permission helpers (ensurePermissions.ts), audit columns (auditColumns.ts), anonymous label computation (anonymousLabels.ts), ownership validation (ownershipValidation.ts), per-client views (securityViews.ts with 13 existing views), scheduled reducers (UserDeletionJob pattern), and the 18-step finalization pipeline (finalizationHelpers.ts). Phase 9 extends all of these but invents nothing new at the infrastructure level.

**Primary recommendation:** Decompose into at least 6-8 plans along natural dependency boundaries: (1) schema changes + enum/struct additions, (2) lobby lifecycle reducers, (3) chat system, (4) Classic draft system, (5) Auction draft system, (6) post-draft flow + finalization updates, (7) per-client views, (8) doc rewrites + test updates. Each plan should publish to maincloud after its changes and verify test counts.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Two visibility modes only: Public and Private. Both visible in the lobby browser. Public = joinCode only. Private = joinCode + password. No invite-only mode.
- **D-02:** Password stored as plain string in LobbyPassword (private table, never broadcast). Simple comparison on join.
- **D-03:** joinCode included in the browser view — displayed in UI, copyable, and usable as a search/filter key. join_lobby accepts either lobbyId or joinCode.
- **D-04:** Joining during Drafting: reconnects (existing LobbyMember marked offline) + new spectators allowed. New players cannot join as Blue/Red during Drafting.
- **D-05:** Projected server-side view returning only browsing-relevant columns: id, joinCode, gameMode, draftMode, currentPlayerCount, isTournamentControlled, isAnonymousPlayers, stage, isPublic, matchType.
- **D-06:** Tournament name and cost set name resolved via cross-table PK lookup in the view. No denormalization.
- **D-07:** currentPlayerCount (u8) denormalized on Lobby — increment on join, decrement on leave.
- **D-08:** Finished lobbies excluded from browser view. Only Waiting + Drafting + Equipping + Scoring shown.
- **D-09:** Client-side filtering on the subscription result at 100-user scale.
- **D-10 through D-18:** Chat system — all members can send, system messages for join/leave/stage, 500 char limit, 50 message rolling window, metadata JSON, Unicode emojis, dangling replyToMessageId, anonymous enforcement.
- **D-19 through D-26:** Lobby lifecycle — hard delete on close, close only in Waiting+Finished, kick+ban with LobbyBan table, one lobby per user, guest restrictions, host gets isReferee, scheduled GC.
- **D-27 through D-30:** Team assignment & ready-up — join as Spectator, free movement, isConfirmed + isCaptain on LobbyMember, confirm_ready/unconfirm_ready, start_draft requires all Blue+Red non-coach confirmed.
- **D-31 through D-33:** Settings — mutable in Waiting only, matchType on Lobby, BanMode.Two removed, LobbyPreset system with permission hierarchy.
- **D-34 through D-38:** Cursor broadcast — players+coaches only, client-side 30ms throttle, tab blur stops sending, subscription scoping.
- **D-39:** Coach guard — coaches blocked from ALL draft actions.
- **D-40 through D-41:** Ownership validation wired into pick_character. LC ownership NOT validated.
- **D-42 through D-45:** Character exclusivity (allowMirrorPicks), timer expiry defaults (auto-pick EMPTY CHARACTER), autoRandomPick, refereeFullControl dynamic update, duplicate tournament lobby prevention.
- **D-46 through D-55:** Draft systems — Classic fixed sequences (0ban/4ban/6ban), Auction hybrid (ban steps + dynamic auction), steal-skip logic, nomination = first bid at base cost, dual budgets (characterBudget + lightconeBudget), leftover carry-over, budget cap enforcement, minimumBidRaise.
- **D-56 through D-59:** Post-draft flow — EquipLightcone/ArrangeLineup/ConfirmLineup as backend steps, host manual transitions, stage progression.
- **D-60 through D-63:** Undo (referee, last step), pause (player 3/team + referee unlimited), resume, separate reducers per action.
- **D-64 through D-68:** Tournament lobby creation — participant validation, settings inheritance, stand-in system (TournamentStandIn table).
- **D-69 through D-75:** Anonymous mode server-enforced + match history visibility during tournaments.
- **D-76:** Host disconnect deferred to Phase 10.
- **D-77 through D-93:** All schema changes, history reworks, view definitions.
- **D-94 through D-99:** Mandatory doc updates.
- **D-32/D-33:** Referee power configuration columns.

### Claude's Discretion
- Exact StepPayload struct definitions for EquipLightcone, ArrangeLineup, ConfirmLineup
- LobbyBan table audit column inclusion
- System message content formatting
- Exact overflow fill logic when spectator slots are full
- Timer behavior during bidding (standard turn timer vs separate bid timer)

### Deferred Ideas (OUT OF SCOPE)
- Custom emoji asset format (WebP/SVG/PNG) and frontend emoji registry -- v1
- Host disconnect auto-transfer -- Phase 10
- Disconnect forfeit timer wiring -- Phase 10
- Sabotage round for LC budget -- replaced by budget-as-cost model
- Lightcone ownership validation -- players don't register owned LCs
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| MOUS-01 | Full XY cursor position broadcast within the page while browser tab is active | Existing broadcast_cursor reducer (cursor.ts), LobbyCursorEvent table. D-34/D-35/D-36 refine spectator filtering and client-side throttle. |
| MOUS-02 | Cursor visible to all match participants, spectators, and coaches | Existing event table pattern broadcasts to all subscribers. D-37 subscription scoping (WHERE lobbyId=X). |
| MOUS-03 | Coaches can see cursor tracking but cannot call pick/ban reducers | D-39 coach guard — simple isCoach check in all draft action reducers. |
| CHAT-01 | Ephemeral per-lobby chat via event table (messages not persisted after match ends) | ChatMessage table exists. D-13 rolling window (50 messages, oldest deleted). D-19 hard-delete on close_lobby. send_chat_message + delete_chat_message reducers. |
| CHAT-02 | Chat message structure supports future rich content (emoji, formatting metadata) | D-14 metadata JSON schema. D-15 Unicode emojis stored as-is, custom shortcodes deferred to v1. |
| CHAT-03 | Chat messages cleaned up in same transaction as lobby close | D-19 close_lobby cascade deletes ChatMessage rows. Already transactional per SpacetimeDB reducer semantics. |
| LBBY-01 | Browse available lobbies with filter support (game mode, status, player count) | D-05 projected view_lobby_browser replacement. D-09 client-side filtering at 100-user scale. |
| LBBY-02 | Lobby visibility controls (public, private, invite-only) | D-01 two modes only (Public/Private). D-02 password storage in LobbyPassword. Note: invite-only explicitly excluded per D-01. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **No auto-commit code changes** -- leave unstaged for user review
- **Mandatory skill loading** -- load `/spacetimedb` skill before ANY backend code work
- **Reducers are transactional** and do not return data
- **Reducers must be deterministic** -- no Math.random(), use hash-based determinism (D-43b: `(turnIndex * 31 + lobbyId) % availableCount`)
- **Energy budget matters** -- egress is the dominant cost on maincloud
- **Architecture docs updated on EVERY backend change**
- **Behavior specs NEVER modified during execution** -- update after with Phase 9 execution tags
- **Test files are diagnostic only** -- do not auto-fix test failures
- **Smallest change necessary** -- do not touch unrelated files
- **Do not invent SpacetimeDB APIs** -- use only what exists in skill references
- **`ctx.sender` is the authenticated principal** -- never trust identity args
- **Publishing to maincloud requires `--clear-database`** for this phase (enum changes)

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spacetimedb/server | 2.1.x | Server-side module SDK | Project standard, all tables/reducers/views |
| spacetimedb | 2.1.x | Shared types (Timestamp, ScheduleAt, Identity) | Import for scheduled tables and timestamp handling |

### Supporting (Existing Helpers)
| Helper | File | Purpose | When to Use |
|--------|------|---------|-------------|
| ensurePermissions.ts | helpers/ | getAuthenticatedUser, isRoleAtLeast, ensureAdmin, ensureModerator | All reducers needing auth |
| auditColumns.ts | helpers/ | auditInsert, auditUpdate, SYSTEM_USER_ID | All table inserts/updates |
| anonymousLabels.ts | helpers/ | computeAnonymousLabel(ctx, lobbyId, userId) | Chat anonymous mode, views |
| ownershipValidation.ts | helpers/ | validateCharacterOwnership(ctx, userId, charName, lobbyId) | pick_character reducer |
| finalizationHelpers.ts | helpers/ | runFinalization (18-step pipeline), processMatchMmr | Finalization updates |
| tournamentHelpers.ts | helpers/ | ensureTournamentAccess | Tournament lobby creation |

### No New Dependencies
Phase 9 adds no new npm packages. All work is pure SpacetimeDB server-side TypeScript using existing project dependencies.

## Architecture Patterns

### Recommended File Organization

New files organized by feature domain, consistent with existing structure:

```
spacetimedb/src/
├── tables/
│   ├── lobby.ts                    # MODIFY: add new columns (D-77)
│   ├── lobbyMember.ts              # MODIFY: add isConfirmed, isCaptain (D-78)
│   ├── lobbyBan.ts                 # NEW: LobbyBan table (D-82)
│   ├── lobbyPreset.ts              # NEW: LobbyPreset table (D-83b)
│   ├── chatMessage.ts              # EXISTS: no schema change needed
│   ├── matchSession.ts             # MODIFY: add auction state columns (D-71/D-78)
│   ├── matchSessionHistory.ts      # MODIFY: add budget/visibility columns (D-84/D-88)
│   ├── matchSessionStepHistory.ts  # MODIFY: rename characterName -> targetName (D-86)
│   ├── matchParticipantHistory.ts  # MODIFY: add role flags (D-87)
│   ├── tournamentStandIn.ts        # NEW: TournamentStandIn table (D-83)
│   └── lobbyGcJob.ts              # NEW: Scheduled table for lobby GC (D-25)
├── types/
│   ├── enums.ts                    # MODIFY: LobbyStage +Equipping/Scoring, BanMode -Two, ActionType +3 (D-79/D-80/D-81)
│   └── structs.ts                  # MODIFY: LobbyConfigSnapshot, new payloads, new ActionType variants (D-89, D-57)
├── reducers/
│   ├── lobbyLifecycle.ts           # NEW: create_lobby, join_lobby, leave_lobby, close_lobby, kick_member, ban_member
│   ├── lobbySettings.ts            # NEW: update_lobby_settings, set_team_slot, confirm_ready, unconfirm_ready, set_captain
│   ├── lobbyPresets.ts             # NEW: create_preset, update_preset, delete_preset, create_lobby_from_preset
│   ├── draftClassic.ts             # NEW: start_draft, pick_character, ban_character
│   ├── draftAuction.ts             # NEW: nominate_character, place_bid, pass_bid
│   ├── draftControl.ts             # NEW: undo_last_step, pause_draft, resume_draft
│   ├── postDraft.ts                # NEW: equip_lightcone, arrange_lineup, confirm_lineup, advance_stage
│   ├── chat.ts                     # NEW: send_chat_message, delete_chat_message
│   ├── tournamentLobby.ts          # NEW: create_tournament_lobby, approve_stand_in
│   ├── lobbyGc.ts                  # NEW: Scheduled GC reducer
│   └── cursor.ts                   # MODIFY: add spectator silencing (D-34)
├── views/
│   ├── securityViews.ts            # MODIFY: replace view_lobby_browser with projected version
│   └── anonymousViews.ts           # NEW: 4 anonymous enforcement views + 1 history visibility view (D-92/D-93)
├── helpers/
│   ├── finalizationHelpers.ts      # MODIFY: extend for new ActionTypes, budget columns, isPubliclyVisible
│   ├── draftSequences.ts           # NEW: generate Classic/Auction DraftStep[] sequences
│   ├── lobbyHelpers.ts             # NEW: shared lobby validation (one-lobby check, guest restrictions, slot counting)
│   └── anonymousHelpers.ts         # NEW: shouldAnonymize(ctx, lobbyId, targetUserId) shared helper
└── schema.ts                       # MODIFY: register new tables
```

### Pattern 1: Composite PK Table with Audit Columns (New Tables)

**What:** LobbyBan, TournamentStandIn, and LobbyPreset follow existing composite PK and audit patterns.
**When to use:** Any new junction or entity table.
**Example:**
```typescript
// Source: existing lobbyMember.ts pattern
export const LobbyBan = table({
    name: 'lobby_ban',
    public: true,
    primaryKey: ['lobbyId', 'bannedUserId'],
    indexes: [
        { accessor: 'lobby_id', algorithm: 'btree', columns: ['lobbyId'] },
        { accessor: 'by_lobby_and_user', algorithm: 'btree', columns: ['lobbyId', 'bannedUserId'] },
    ],
}, lobbyBanColumns);
```

### Pattern 2: Scheduled Reducer for Lobby GC (D-25)

**What:** A scheduled table + reducer pair for periodic lobby garbage collection.
**When to use:** The lobby GC job that cleans abandoned/finished lobbies.
**Example:**
```typescript
// Source: existing userDeletionJob.ts pattern
// 1. Define scheduled table with scheduledId + scheduledAt + custom columns
export const LobbyGcJob = table({
    name: 'lobby_gc_job',
    scheduled: () => _runLobbyGcReducer,
}, { scheduledId: t.u64().primaryKey().autoInc(), scheduledAt: t.scheduleAt(), ...audit });

// 2. Define reducer that receives the job row
export const run_lobby_gc = spacetimedb.reducer({ arg: LobbyGcJob.rowType }, (ctx, { arg }) => {
    // Iterate lobbies, check lastActivityAt vs 30 min threshold
    // Hard-delete eligible lobbies (Waiting/Finished + idle > 30 min)
    // Schedule next GC run (every 5-10 minutes)
});
```

### Pattern 3: Per-Client View for Anonymous Enforcement (D-69/D-92)

**What:** Views that anonymize opponent data based on lobby settings, using `spacetimedb.view()`.
**When to use:** ChatMessage, LobbyMember, MatchSessionStep, MatchResultParticipant, MatchSessionHistory.
**Example:**
```typescript
// Source: existing view_my_roster_visibility pattern (securityViews.ts lines 246-336)
const AnonymousChatRow = t.object('AnonymousChatRow', {
    id: t.u32(), lobbyId: t.u32(), senderUserId: t.u32(),
    senderType: ChatSenderType, content: t.string(),
    metadata: t.string().optional(), anonymousLabel: t.string().optional(),
    createdDate: t.timestamp(),
});

spacetimedb.view(
    { name: 'view_my_lobby_chat', public: true },
    t.array(AnonymousChatRow),
    (ctx) => {
        // Resolve sender identity, find lobby membership
        // Apply shouldAnonymize(ctx, lobbyId, targetUserId) per message
        // Return anonymized rows for opponents
    }
);
```

### Pattern 4: Rolling Window Delete (D-13)

**What:** Before inserting a new chat message, count existing messages for the lobby and delete the oldest if count >= 50.
**When to use:** send_chat_message reducer.
**Example:**
```typescript
// Count messages by lobby_id index, sort by createdDate, delete oldest
const messages = [...ctx.db.ChatMessage.lobby_id.filter(lobbyId)]
    .sort((a, b) => Number(a.createdDate.microsSinceUnixEpoch - b.createdDate.microsSinceUnixEpoch));
if (messages.length >= 50) {
    ctx.db.ChatMessage.id.delete(messages[0].id);
}
```

### Pattern 5: Deterministic Randomness for Auto-Pick (D-43b)

**What:** Hash-based character selection when timer expires with autoRandomPick=true.
**When to use:** Timer expiry handling in draft reducers.
**Example:**
```typescript
// Deterministic: no Math.random() — SpacetimeDB reducers must be deterministic
const hash = (turnIndex * 31 + lobbyId) % availablePool.length;
const autoPick = availablePool[hash];
```

### Pattern 6: Draft Sequence Generation

**What:** Build DraftStep[] arrays from BanMode enum for Classic mode. Auction uses ban-only sequence + dynamic auction phase.
**When to use:** start_draft reducer builds the sequence, stores in MatchSession.draftSequence.
**Example:**
```typescript
// Classic 4-ban sequence from notes/draft_order.md
function buildClassic4Ban(): DraftStep[] {
    return [
        { actionRequired: { tag: 'Ban' }, teamTurn: { tag: 'Blue' } },
        { actionRequired: { tag: 'Ban' }, teamTurn: { tag: 'Red' } },
        { actionRequired: { tag: 'Pick' }, teamTurn: { tag: 'Blue' } },
        // ... 17 more steps
    ];
}
```

### Anti-Patterns to Avoid
- **Math.random() in reducers:** Causes non-deterministic execution. Use hash-based randomness.
- **Returning data from reducers:** SpacetimeDB reducers are fire-and-forget. Read via subscriptions/views.
- **Using .iter() in views:** Severe performance (re-evaluates on any change). Use index lookups.
- **Optional enum columns:** SpacetimeDB enums don't support `.optional()` in TypeScript SDK. Use sentinel values or separate columns.
- **Forgetting composite PK delete-before-update:** Tables with composite PKs require `ctx.db.Table.delete(row)` then `ctx.db.Table.insert(newRow)`, not `.update()`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User authentication | Custom auth check | `getAuthenticatedUser(ctx)` | Already handles identity resolution, deletion check |
| Role permission check | Inline role comparison | `isRoleAtLeast(user.role, 'Moderator')` | Consistent role hierarchy |
| Audit columns | Manual timestamp/userId | `auditInsert(ctx, userId)` / `auditUpdate(ctx, existing, userId)` | Consistent 4-column audit trail |
| Anonymous label | Custom label logic | `computeAnonymousLabel(ctx, lobbyId, userId)` | Deterministic, team-aware, coach-aware |
| Character ownership | Manual account lookup | `validateCharacterOwnership(ctx, userId, charName, lobbyId)` | Handles tournament + non-tournament paths |
| Match finalization | Custom archival logic | `runFinalization(ctx, matchResult, userId)` | 18-step pipeline already handles all downstream effects |
| Draft sequence arrays | Inline step arrays | Centralized `draftSequences.ts` helper | One source of truth matching notes/draft_order.md |
| Scheduled jobs | Custom timer logic | Scheduled table + reducer pattern (UserDeletionJob) | SpacetimeDB native pattern, auto-deletes row after execution |

**Key insight:** Phase 9's size is daunting, but every infrastructure pattern already exists in the codebase. The work is wiring decisions into existing patterns, not creating new infrastructure.

## Common Pitfalls

### Pitfall 1: Enum Changes Require --clear-database
**What goes wrong:** Publishing with modified enums (LobbyStage +Equipping/Scoring, BanMode -Two, ActionType +3) without --clear-database causes a schema migration failure.
**Why it happens:** SpacetimeDB's migration engine cannot handle enum variant additions/removals in-place.
**How to avoid:** Use `spacetime publish --clear-database` on the FIRST plan of Phase 9. All subsequent plans can publish normally.
**Warning signs:** "schema migration error" in publish output.

### Pitfall 2: Composite PK Update Pattern
**What goes wrong:** Using `.update()` on tables with composite primary keys (LobbyMember, LobbyBan, etc.) silently fails or creates duplicates.
**Why it happens:** SpacetimeDB update works by PK lookup. Composite PKs need the correct accessor pattern.
**How to avoid:** For composite PK tables, always use delete + insert pattern: `ctx.db.Table.delete(existing); ctx.db.Table.insert({ ...existing, ...changes });`
**Warning signs:** Duplicate rows appearing in tables after updates.

### Pitfall 3: View Performance with .iter()
**What goes wrong:** Using `.iter()` in per-client views causes severe performance degradation.
**Why it happens:** Views re-evaluate on every table change. `.iter()` scans the entire table each time.
**How to avoid:** Always use index lookups in views. For the anonymous views, chain from `ctx.db.LobbyMember.user_id.filter(userId)` to get lobby memberships, then use `lobby_id.filter()` to get relevant rows.
**Warning signs:** Increasing latency on subscriptions as data grows.

### Pitfall 4: Auction State Machine Complexity
**What goes wrong:** The auction bidding flow has multiple edge cases: steal-skip logic, budget exhaustion, empty character fallback, minimum raise enforcement.
**Why it happens:** Auction mode is stateful (nomination -> bid -> pass -> sold cycle) with team turn tracking that doesn't follow a fixed sequence.
**How to avoid:** Store full auction state on MatchSession (isAuctionPhase, nextNominatorTeam, blueCharactersWon, etc.) and validate state transitions explicitly in each reducer.
**Warning signs:** Desync between nomination turns and character counts.

### Pitfall 5: Finalization Pipeline Changes
**What goes wrong:** The existing 18-step finalization pipeline extracts character names from step payloads by variant tag. New ActionType variants (EquipLightcone, ArrangeLineup, ConfirmLineup) need extraction logic too.
**Why it happens:** The switch on `step.payload.tag` in finalizationHelpers.ts (lines 270-277) only handles Pick/Ban/AuctionSold/Nominate/Bid.
**How to avoid:** Extend the extraction logic to handle EquipLightcone (targetName = LC name), ArrangeLineup (targetName = null), ConfirmLineup (targetName = null). Also rename the history column from `characterName` to `targetName`.
**Warning signs:** Missing step history rows for equip/arrange/confirm actions, or null characterName where LC name should be.

### Pitfall 6: One-Lobby-Per-User Enforcement (D-22)
**What goes wrong:** Users join multiple lobbies simultaneously, causing state conflicts.
**Why it happens:** No existing enforcement -- LobbyMember allows multiple lobbyId rows per userId.
**How to avoid:** In create_lobby and join_lobby, check `[...ctx.db.LobbyMember.user_id.filter(userId)]` and reject if any rows exist (user already in a lobby).
**Warning signs:** User appears in multiple lobby member lists.

### Pitfall 7: LobbyConfigSnapshot Struct Change
**What goes wrong:** The LobbyConfigSnapshot struct in finalizationHelpers.ts (lines 237-261) copies lobby fields including `auctionBudget`. Phase 9 replaces this with `characterBudget` + `lightconeBudget`.
**Why it happens:** The struct definition and the snapshot construction code must both change.
**How to avoid:** Update both `types/structs.ts` LobbyConfigSnapshot definition AND the snapshot construction in finalizationHelpers.ts line 237-261 in the same change.
**Warning signs:** Build errors in finalizationHelpers.ts after struct update.

### Pitfall 8: Existing Test References to Renamed Fields
**What goes wrong:** Phase 5/6 tests reference `characterName` on MatchSessionStepHistory and `auctionBudget` on LobbyConfigSnapshot.
**Why it happens:** D-86 renames characterName to targetName, D-89 replaces auctionBudget.
**How to avoid:** Update test files in the same plan as the schema changes per D-98.
**Warning signs:** Test failures on field access after schema changes.

## Code Examples

### Lobby Creation Reducer Pattern
```typescript
// Source: established reducer patterns in this codebase
export const create_lobby = spacetimedb.reducer(
    {
        joinCode: t.string(),
        teamSize: t.u8(),
        draftMode: DraftMode,
        banMode: BanMode,
        gameMode: GameMode,
        isPublic: t.bool(),
        password: t.string(), // empty string = no password
        matchType: MatchType,
        // ... other config fields
    },
    (ctx, args) => {
        const user = getAuthenticatedUser(ctx);

        // D-22: One lobby at a time per user
        const existingMemberships = [...ctx.db.LobbyMember.user_id.filter(user.id)];
        if (existingMemberships.length > 0) {
            throw new SenderError('You are already in a lobby. Leave it before creating a new one.');
        }

        // D-23: Guest restrictions
        if (user.isGuest && args.matchType.tag === 'Ranked') {
            throw new SenderError('Guests cannot create Ranked lobbies.');
        }

        // Insert Lobby with all D-77 columns
        const lobby = ctx.db.Lobby.insert({
            id: 0, // autoInc
            joinCode: args.joinCode,
            hostUserId: user.id,
            currentPlayerCount: 1, // D-07: host counts
            stage: { tag: 'Waiting' },
            lastActivityAt: ctx.timestamp,
            matchType: args.matchType,
            // ... all config columns
            ...auditInsert(ctx, user.id),
        });

        // D-24: Host gets isReferee=true
        ctx.db.LobbyMember.insert({
            lobbyId: lobby.id,
            userId: user.id,
            isOnline: true,
            participationRole: { tag: 'Player' },
            isReferee: true,
            isCoach: false,
            teamSlot: { tag: 'Spectator' }, // D-27: join as Spectator
            isConfirmed: false,
            isCaptain: false,
            ...auditInsert(ctx, user.id),
        });

        // Private lobby password storage
        if (!args.isPublic && args.password.length > 0) {
            ctx.db.LobbyPassword.insert({
                lobbyId: lobby.id,
                passwordHash: args.password, // D-02: plain string
                ...auditInsert(ctx, user.id),
            });
        }
    }
);
```

### Chat Send with Rolling Window (D-13)
```typescript
export const send_chat_message = spacetimedb.reducer(
    { lobbyId: t.u32(), content: t.string(), metadata: t.string() },
    (ctx, { lobbyId, content, metadata }) => {
        const user = getAuthenticatedUser(ctx);

        const member = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, user.id])][0];
        if (!member) throw new SenderError('You are not a member of this lobby.');

        // D-12: 500 char limit
        if (content.length > 500) throw new SenderError('Message exceeds 500 character limit.');

        // D-14: Validate metadata JSON
        if (metadata && metadata.length > 0) {
            try { JSON.parse(metadata); } catch { throw new SenderError('Invalid metadata JSON.'); }
        }

        // D-13: Rolling window — delete oldest if at 50
        const messages = [...ctx.db.ChatMessage.lobby_id.filter(lobbyId)]
            .sort((a, b) => Number(a.createdDate.microsSinceUnixEpoch - b.createdDate.microsSinceUnixEpoch));
        if (messages.length >= 50) {
            ctx.db.ChatMessage.id.delete(messages[0].id);
        }

        // D-18: Anonymous enforcement
        const lobby = ctx.db.Lobby.id.find(lobbyId);
        const isAnon = shouldAnonymize(ctx, lobbyId, user.id, lobby);

        ctx.db.ChatMessage.insert({
            id: 0,
            lobbyId,
            senderUserId: isAnon ? 0 : user.id,
            senderType: { tag: 'Player' },
            content,
            metadata: metadata || undefined,
            anonymousLabel: isAnon ? computeAnonymousLabel(ctx, lobbyId, user.id) : undefined,
            ...auditInsert(ctx, user.id),
        });
    }
);
```

### shouldAnonymize Helper (D-69/D-70/D-71)
```typescript
// Shared helper for anonymous enforcement views
export function shouldAnonymize(ctx: any, lobbyId: number, targetUserId: number, lobby?: any): boolean {
    if (!lobby) lobby = ctx.db.Lobby.id.find(lobbyId);
    if (!lobby || (!lobby.isAnonymousPlayers && !lobby.isAnonymousSpectators)) return false;

    // Resolve caller
    const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
    if (!mapping) return false;
    const callerUserId = mapping.userId;

    // Same user = never anonymize self
    if (callerUserId === targetUserId) return false;

    const callerMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, callerUserId])][0];
    const targetMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, targetUserId])][0];
    if (!callerMember || !targetMember) return false;

    // D-71: Spectator referee bypass
    if (callerMember.isReferee && callerMember.teamSlot.tag === 'Spectator') return false;

    // D-70: Same team = real identities
    if (callerMember.teamSlot.tag === targetMember.teamSlot.tag) return false;

    // D-70: Spectators see all anonymized
    if (callerMember.teamSlot.tag === 'Spectator') return true;

    // Opponent on a team = anonymize if lobby has anonymous mode
    const targetIsSpectator = targetMember.teamSlot.tag === 'Spectator';
    return targetIsSpectator ? lobby.isAnonymousSpectators : lobby.isAnonymousPlayers;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `auctionBudget` (single) | `characterBudget` + `lightconeBudget` (dual) | Phase 9 D-49 | Lobby table, LobbyConfigSnapshot, MatchSession all change |
| `BanMode.Two` variant | Removed (only None, Four, Six) | Phase 9 D-31 | Requires --clear-database |
| `LobbyStage` (3 variants) | 5 variants (+Equipping, Scoring) | Phase 9 D-79 | Enables per-stage reducer validation |
| `characterName` on step history | `targetName` (covers chars + LCs) | Phase 9 D-86 | Finalization extraction logic update |
| Anonymous mode as courtesy | Server-enforced via per-client views | Phase 9 D-69 | 5 new views replace client-trust |
| `view_lobby_browser` (full Lobby rows) | Projected view (subset of columns) | Phase 9 D-05 | Reduces egress per browser refresh |

**Deprecated/outdated:**
- `auctionBudget` field on Lobby and LobbyConfigSnapshot -- replaced by characterBudget + lightconeBudget
- `BanMode.Two` enum variant -- removed per D-31
- `characterName` on MatchSessionStepHistory -- renamed to `targetName` per D-86
- `teamBlueBudget/teamRedBudget` on MatchSession -- may be repurposed or replaced per D-78 with split char/LC budgets

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (latest) |
| Config file | `test/vitest.config.ts` (unit), `test/vitest.integration.config.ts` (integration) |
| Quick run command | `npx vitest run --config test/vitest.config.ts` |
| Full suite command | `npx vitest run --config test/vitest.config.ts && npx vitest run --config test/vitest.integration.config.ts` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| MOUS-01 | Cursor broadcast to lobby members | integration | `spacetime sql` UAT | No -- Phase 9 UAT |
| MOUS-02 | Cursor visible to all roles | integration | `spacetime sql` UAT | No -- Phase 9 UAT |
| MOUS-03 | Coach cannot call pick/ban | unit | `npx vitest run test/backend/draft/coach-guard.unit.test.ts` | No -- Wave 0 |
| CHAT-01 | Ephemeral chat with rolling window | integration | `spacetime sql` UAT | No -- Phase 9 UAT |
| CHAT-02 | Metadata JSON support | unit | `npx vitest run test/backend/chat/chat-metadata.unit.test.ts` | No -- Wave 0 |
| CHAT-03 | Chat cleanup on lobby close | integration | `spacetime sql` UAT | No -- Phase 9 UAT |
| LBBY-01 | Lobby browser with filters | integration | `spacetime sql` UAT | No -- Phase 9 UAT |
| LBBY-02 | Public/private visibility | integration | `spacetime sql` UAT | No -- Phase 9 UAT |

### Sampling Rate
- **Per task commit:** `npx vitest run --config test/vitest.config.ts`
- **Per wave merge:** Full suite + `spacetime publish --clear-database` + `spacetime generate`
- **Phase gate:** Full suite green + all deferred test backlog (Phases 3/4/5/7) executed via UAT

### Wave 0 Gaps
- [ ] `test/backend/draft/draft-sequences.unit.test.ts` -- covers Classic sequence generation (0ban/4ban/6ban)
- [ ] `test/backend/draft/coach-guard.unit.test.ts` -- covers MOUS-03 coach blocked from all draft actions
- [ ] `test/backend/chat/chat-metadata.unit.test.ts` -- covers CHAT-02 metadata JSON validation
- [ ] Update existing tests referencing `characterName` on MatchSessionStepHistory (D-98)
- [ ] Update existing tests referencing `auctionBudget` on LobbyConfigSnapshot (D-98)

## Open Questions

1. **Lobby GC Scheduling Interval**
   - What we know: GC cleans lobbies idle > 30 min in Waiting/Finished stages (D-25).
   - What's unclear: How frequently should the GC job run? Every 5 min? 10 min? And how is the first GC job scheduled (on module init via a lifecycle hook, or on first lobby creation)?
   - Recommendation: Schedule every 5 minutes. Trigger initial schedule on `register_server` or first `create_lobby`. Use `ScheduleAt.time(ctx.timestamp.microsSinceUnixEpoch + 300_000_000n)` (5 min). GC reducer reschedules itself at the end.

2. **Projected Lobby Browser View -- Custom Struct or Inline**
   - What we know: D-05 specifies a subset of columns. Current view returns full Lobby.rowType.
   - What's unclear: Whether to define a new `LobbyBrowserRow` struct (t.object) or reuse the full rowType and let clients ignore extra columns.
   - Recommendation: Define `LobbyBrowserRow` as a custom t.object with only the D-05 columns. This reduces egress (the whole point of D-05) and ensures we don't accidentally leak new sensitive columns in the future.

3. **Timer Expiry Mechanism**
   - What we know: D-43 defines default behavior on timer expiry (auto-pick EMPTY CHARACTER, auto-skip, etc.).
   - What's unclear: How timer expiry is detected server-side. Options: (a) scheduled reducer per turn, (b) client calls a `check_timer` reducer, (c) next action validates timer state.
   - Recommendation: Defer full timer enforcement to Phase 10 (DISC-03/DISC-04 already deferred). Phase 9 implements the timer state tracking on MatchSession and the auto-pick logic, but actual timer-triggered forfeit is Phase 10 scope. Reducers validate `timerState` on each action to reject late moves.

4. **Auction Bid Timer vs Standard Turn Timer**
   - What we know: D-47 says "Each bid/pass uses standardTurnSeconds timer."
   - What's unclear: Whether bidding uses the same timer reset mechanism as Classic turns (per D-63 separate reducers).
   - Recommendation: Use same standardTurnSeconds for bid timer. Reset timer on each bid/pass action. Claude's discretion area per CONTEXT.md.

## Sources

### Primary (HIGH confidence)
- **Codebase inspection:** All table definitions, reducer patterns, helper files, view definitions, enum/struct types read directly from `spacetimedb/src/`
- **SpacetimeDB skill:** `.claude/skills/spacetimedb/SKILL.md` and `references/api-guide.md` for scheduled tables, view patterns, accessor API
- **Draft sequences:** `notes/draft_order.md` -- Classic 0ban/4ban/6ban sequences verified
- **Phase 6 context:** `.planning/phases/06-anonymous-play-and-player-stats/06-CONTEXT.md` -- anonymous play decisions

### Secondary (MEDIUM confidence)
- **CONTEXT.md decisions:** 99 locked decisions (D-01 through D-99) -- validated against current codebase state

### Tertiary (LOW confidence)
- None. All findings verified against existing codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all patterns exist in codebase, no new dependencies
- Architecture: HIGH -- file organization follows established project structure
- Pitfalls: HIGH -- all identified from direct codebase inspection and schema analysis
- Draft system: HIGH -- sequences documented in notes/draft_order.md, existing DraftStep/StepPayload structs verified
- Auction system: MEDIUM -- complex state machine, but all state columns defined in CONTEXT.md D-49/D-71
- Per-client views: HIGH -- 13 existing views in securityViews.ts provide exact patterns to follow

**Research date:** 2026-03-29
**Valid until:** 2026-04-28 (stable -- all findings from locked codebase, no external dependencies)
