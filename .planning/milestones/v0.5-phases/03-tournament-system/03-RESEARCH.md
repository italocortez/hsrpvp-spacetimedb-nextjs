# Phase 3: Tournament System - Research

**Researched:** 2026-03-17
**Domain:** SpacetimeDB backend -- tournament lifecycle, role hierarchy, match result submission, cost set management, tournament-scoped teams
**Confidence:** HIGH

## Summary

Phase 3 is a large, multi-domain backend phase that touches role management, tournament CRUD, match result flows, cost set management, and tournament-scoped teams. The codebase already has well-established patterns from Phases 1 and 2 (audit columns, permission helpers, batch reducers, per-user views, admin proxy reducers). This phase extends those patterns into new domains without introducing fundamentally new technology.

The biggest architectural challenges are: (1) the cost set draft/publish workflow, which requires new tables for draft storage and careful handling of the existing composite-PK cost tables that currently lack `costSetId` in their PKs, (2) the expanded role hierarchy with correct permission cascading, and (3) the match result submission flow with its multi-party confirmation pattern.

**Primary recommendation:** Split implementation into logical waves: role hierarchy + enums first (foundational), then tournament CRUD + participants, then cost set management, then match result submission flow. Each wave builds on the previous without circular dependencies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Role Hierarchy**: Strictly hierarchical -- one role per user: Admin > Moderator > TournamentHost > User > Guest. Add Moderator and TournamentHost to existing Role enum.
- **No TO request flow**: Users contact admins on Discord, admins grant TournamentHost directly. No backend reducer needed for requests.
- **Moderator is admin-granted only**: No request flow.
- **Promotion rules**: Admin can promote/demote anyone except other admins. Moderator can promote/demote TournamentHost only (not other mods or admins).
- **Referee is per-match flag, not a tournament role**: Host auto-assigned as referee. Referee flag is transferable within the lobby. Any current referee can transfer flag to another participant.
- **Match result submission is universal (not tournament-only)**: Both teams confirm -> referee submits. Post-submission dispute: either player can dispute once per match.
- **Tournament lifecycle stages**: Draft -> Registration -> Seeding -> InProgress -> Completed / Cancelled. TO manually advances each stage. No stage reversals. No auto-transitions. Informational dates only.
- **Teams are tournament-scoped only**: No persistent teams. Use TournamentParticipant with teamGroupId + small TournamentTeam table. Existing Team/TeamMember/TeamInvite tables are OUT OF SCOPE.
- **Tournament format**: teamSize (1/2/3) separate from bracketFormat (SingleElim/DoubleElim/GroupPhase).
- **RosterVisibility enum (3 values)**: OpenRoster, ClosedWithRating, ClosedNoRating -- stored on Tournament table, overrides user settings.
- **Anonymous play**: Boolean on Tournament. Tournament-level enforced, no per-match override. Independent of roster visibility.
- **Cost set management**: CostSet metadata table with draft/publish workflow. Reusable across tournaments. Non-tournament matches can also use custom cost sets.
- **Draft/publish workflow**: TO creates cost set -> copies rows into draft table (private) -> edits -> publishes (upsert into live tables with new costSetId) -> draft rows cleaned up.
- **Winner advantage**: Only applies to double elimination grand finals. Boolean/u8 on Tournament.
- **Match needs tournamentId AND bracketMatchId** for auto-advancement trigger logic.

### Claude's Discretion
- Specific granular lobby permission controls (which powers need per-lobby configuration)
- CostSet table architecture details and draft table design
- Tournament team table structure (TournamentTeam vs grouping approach)
- Index strategy for new tables
- Reducer file organization for tournament domain
- Check-in system (if needed -- not explicitly requested)
- How to handle waitlist promotion when a participant drops

### Deferred Ideas (OUT OF SCOPE)
- **Persistent teams** (Team/TeamMember/TeamInvite tables) -- future phase
- **Match submission timeout handling** -- Phase 5 or Phase 10
- **Automated check-in system** -- not explicitly requested
- **Cost set CSV import/export** -- frontend feature, v1 milestone
- **Bracket modification backward-stepping logic** -- may span Phase 3 + Phase 4
- **Synergy cost management UI** -- frontend, v1 milestone
- **Season support for cost sets** -- schema supports it but logic deferred
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TRNT-01 | User can request TO role; admin approves or denies | **OVERRIDDEN by CONTEXT.md**: No request flow. Admin directly promotes via existing `admin_update_user` reducer (already has roleTag param). Only new work: add Moderator variant to Role enum + update permission helpers. |
| TRNT-02 | TO can create a tournament with name, format, game mode, settings, and max participants | Tournament table schema extension + `create_tournament` reducer. Many new columns needed (rosterVisibility, costSetId, teamSize, etc.). |
| TRNT-03 | Tournament supports formats: single elimination, double elimination, group phase | Already covered by existing TournamentFormat enum (SingleElimination, DoubleElimination, GroupOnly, GroupIntoSingleElim, GroupIntoDoubleElim). No new enum work. |
| TRNT-04 | Tournament has explicit stage lifecycle (Draft -> Registration -> Seeding -> InProgress -> Completed -> Cancelled) | Requires adding `Seeding` variant to TournamentStage enum (currently missing). Stage transition reducer with forward-only enforcement. |
| TRNT-05 | Player can self-sign up for a tournament (solo or as a team) | `register_for_tournament` reducer. Registration requirements validation (verified, roster, MMR threshold, manual approval). |
| TRNT-06 | Team can sign up for a tournament as a unit | Tournament-scoped teams via TournamentTeam table + teamGroupId on TournamentParticipant. Team creation, join request, captain accept flow. |
| TRNT-07 | TO can assign referees to the tournament | **OVERRIDDEN by CONTEXT.md**: Referee is per-match (per-lobby), not per-tournament. Host auto-assigned as referee. Transfer reducer needed. |
| TRNT-08 | TO can set tournament-level anonymous play default | `isAnonymous` boolean on Tournament table (already exists as `isAnonymousDefault`). Set via create/update tournament reducers. |
| TRNT-09 | TO can set tournament-level open/closed roster visibility | Replace `isOpenRoster: t.bool()` with `rosterVisibility: RosterVisibility` enum. New RosterVisibility enum with 3 variants. |
| TRNT-10 | TO can set tournament-level disconnect behavior policy | Already exists as `disconnectPolicy` on Tournament table. Set via create/update tournament reducers. |
| TRNT-11 | TO can override match results and DQ participants | `dq_participant` reducer + `override_match_result` reducer. Permission checks for TO/Assistant/Admin/Moderator. |
| TRNT-12 | Referee can validate match results within their assigned tournament | Match result submission flow: both teams confirm -> referee submits. `confirm_match_scores`, `submit_match_result`, `dispute_match_result` reducers. |
| TEAM-01 | User can create a persistent team with name and roster | **OVERRIDDEN by CONTEXT.md**: Tournament-scoped teams only. `create_tournament_team` reducer creates a TournamentTeam within a tournament. |
| TEAM-02 | User can invite other users to join their team | **OVERRIDDEN**: Within tournament context, `request_join_tournament_team` reducer. Captain accepts/rejects. |
| TEAM-03 | User can accept/decline team invitations | **OVERRIDDEN**: `accept_team_join_request` / `reject_team_join_request` reducers for tournament teams. |
| TEAM-04 | Ad-hoc groups can be formed for a specific tournament without a persistent team | Directly supported by the tournament-scoped team model. All teams are ad-hoc within tournaments. |
| TEAM-05 | Coach role exists on a team: can observe match but cannot pick | LobbyMember already has `isCoach: t.bool()`. Coach permissions enforced in draft reducers (future phase). |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| spacetimedb/server | (project version) | Backend module runtime | Already in use -- all tables, reducers, views |
| spacetimedb (shared) | (project version) | Timestamp, ScheduleAt types | Already in use |

### Supporting
No new libraries needed. Phase 3 is entirely SpacetimeDB tables + reducers using established project patterns.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Separate draft cost tables | In-place editing with `isDraft` flag | Separate tables keep draft data private (not broadcast). In-place editing would leak draft changes to all subscribers. Private table pattern is already proven (LobbyPassword). |
| TournamentTeam table | Inline fields on TournamentParticipant only | Separate table allows team name, captain, metadata without denormalizing across all member rows. |

## Architecture Patterns

### Recommended Project Structure
```
spacetimedb/src/
  tables/
    costSet.ts              # NEW: CostSet metadata (id, name, creatorId, isPublished, isDraft)
    costSetDraftCharacter.ts # NEW: Draft character costs (private table)
    costSetDraftLightcone.ts # NEW: Draft lightcone costs (private table)
    costSetDraftSynergy.ts   # NEW: Draft synergy costs (private table)
    tournamentTeam.ts        # NEW: Tournament-scoped team (id, tournamentId, name, captainUserId)
    tournamentTeamRequest.ts # NEW: Join request for tournament teams
  reducers/
    tournamentManagement.ts  # NEW: create, update, advance stage, cancel
    tournamentRegistration.ts # NEW: register, withdraw, waitlist
    tournamentTeams.ts       # NEW: create team, request join, accept/reject
    tournamentAdmin.ts       # NEW: admin/mod overrides, DQ, result override
    costSetManagement.ts     # NEW: create, clone, edit draft, publish, unpublish, delete
    matchResultSubmission.ts # NEW: confirm scores, submit result, dispute
    refereeManagement.ts     # NEW: transfer referee flag
  helpers/
    ensurePermissions.ts     # MODIFY: add ensureModerator(), isRoleAtLeast(), ensureTournamentAccess()
    tournamentHelpers.ts     # NEW: stage validation, registration requirement checks
  views/
    securityViews.ts         # MODIFY: add draft cost set per-user views, tournament views
    tournamentViews.ts       # NEW: if views grow too large
  types/
    enums.ts                 # MODIFY: add Moderator to Role, Seeding to TournamentStage, RosterVisibility enum
```

### Pattern 1: Role Hierarchy Helper
**What:** A numeric role comparison function that maps each Role variant to a hierarchy level, enabling `>=` comparisons instead of exhaustive tag checks.
**When to use:** Every permission check that needs "at least this role" semantics.
**Example:**
```typescript
// helpers/ensurePermissions.ts
const ROLE_LEVEL: Record<string, number> = {
    Admin: 100,
    Moderator: 75,
    TournamentHost: 50,
    User: 25,
};

export function getRoleLevel(role: any): number {
    return ROLE_LEVEL[role.tag] ?? 0; // Guest = 0
}

export function isRoleAtLeast(userRole: any, requiredRole: string): boolean {
    return getRoleLevel(userRole) >= (ROLE_LEVEL[requiredRole] ?? 0);
}

export function ensureModerator(ctx: any) {
    const user = getAuthenticatedUser(ctx);
    if (!isRoleAtLeast(user.role, 'Moderator')) {
        throw new SenderError("Forbidden: Requires Moderator or Admin privileges.");
    }
    return user;
}
```

### Pattern 2: Tournament Access Helper
**What:** A helper that checks if a user has management access to a specific tournament (is the organizer, an assistant, a moderator, or an admin).
**When to use:** Every tournament management reducer.
**Example:**
```typescript
export function ensureTournamentAccess(ctx: any, tournamentId: number): { user: any, tournament: any } {
    const user = getAuthenticatedUser(ctx);
    const tournament = ctx.db.Tournament.id.find(tournamentId);
    if (!tournament) throw new SenderError('Tournament not found');

    // Admin/Moderator always has access
    if (isRoleAtLeast(user.role, 'Moderator')) return { user, tournament };

    // TO who owns the tournament
    if (tournament.organizerId === user.id) return { user, tournament };

    // Tournament assistant
    const assistant = (ctx.db.TournamentAssistant as any).primaryKey.find({
        tournamentId, userId: user.id
    });
    if (assistant) return { user, tournament };

    throw new SenderError("Forbidden: Not authorized for this tournament.");
}
```

### Pattern 3: Cost Set Draft/Publish Workflow
**What:** Separate private tables for draft cost data. TO clones from a source set, edits in private tables, then publishes to live tables.
**When to use:** Cost set creation and editing.
**Example:**
```typescript
// Draft tables are private (not broadcast to clients)
export const CostSetDraftCharacter = table({
    name: 'cost_set_draft_character',
    // public: false is the default -- draft data stays server-side
    primaryKey: ['costSetId', 'characterName', 'gameMode'],
    indexes: [
        { accessor: 'cost_set_id', algorithm: 'btree', columns: ['costSetId'] },
    ],
}, { /* same columns as HsrCharacterCost */ });
```

### Pattern 4: Stage Transition with Forward-Only Enforcement
**What:** A reducer that validates stage transitions are forward-only and applies stage-specific side effects.
**When to use:** Tournament lifecycle advancement.
**Example:**
```typescript
const STAGE_ORDER = ['Draft', 'Registration', 'Seeding', 'InProgress', 'Completed', 'Cancelled'];

function validateStageTransition(current: string, next: string): void {
    if (next === 'Cancelled') return; // Cancellation is always allowed
    const currentIdx = STAGE_ORDER.indexOf(current);
    const nextIdx = STAGE_ORDER.indexOf(next);
    if (nextIdx <= currentIdx) {
        throw new SenderError(`Cannot transition from ${current} to ${next} (forward-only)`);
    }
    // Additional rules: can't skip stages
    if (nextIdx > currentIdx + 1 && next !== 'Cancelled') {
        throw new SenderError(`Cannot skip stages: must go from ${current} to ${STAGE_ORDER[currentIdx + 1]}`);
    }
}
```

### Pattern 5: Match Result Multi-Party Confirmation
**What:** Both teams confirm their scores, then the referee submits. Similar to a "two-party escrow" pattern.
**When to use:** Match result submission flow (universal -- not just tournament matches).
**Example:**
```typescript
// MatchResultRecord gets new columns:
// team1Confirmed: t.bool(), team2Confirmed: t.bool()
// refereeSubmittedAt: t.timestamp().optional()
// disputedByUserId: t.u32().optional()

// Flow:
// 1. confirm_match_scores(lobbyId) -- player confirms their team's score panel
// 2. submit_match_result(lobbyId) -- referee clicks submit (requires both teams confirmed)
// 3. dispute_match_result(matchResultId) -- player disputes (once per match)
```

### Anti-Patterns to Avoid
- **DO NOT modify existing Team/TeamMember/TeamInvite tables**: These are explicitly OUT OF SCOPE. Tournament teams use separate TournamentTeam + TournamentParticipant.teamGroupId.
- **DO NOT add costSetId to existing cost table PKs**: This would be a destructive schema change (column reorder in composite PK). Instead, use the costSetId btree index for lookups and keep PK as-is for the default set. Custom cost sets store rows with their own costSetId value. The PK must be expanded to include costSetId to allow multiple sets -- this IS a destructive change requiring `--clear-database`.
- **DO NOT auto-transition tournament stages**: All stage changes are manual via TO reducer call.
- **DO NOT create a request/approval flow for TO role**: Admin promotes directly.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Role hierarchy comparison | Nested if/else chains for each role check | `isRoleAtLeast()` numeric comparison helper | Adding new roles means touching every permission check vs one mapping table |
| Tournament stage validation | Per-reducer stage checks | `validateStageTransition()` centralized helper | Forward-only rule enforced once, not scattered across 10+ reducers |
| Audit column population | Manual timestamp/userId in each reducer | `auditInsert(ctx, userId)` / `auditUpdate(ctx, existing, userId)` | Already exists and is project-enforced |
| Permission resolution for tournaments | Inline role + organizer + assistant checks | `ensureTournamentAccess()` helper | Consistent logic, single change point |

## Common Pitfalls

### Pitfall 1: Destructive Schema Changes for Cost Table PKs
**What goes wrong:** The existing cost tables (HsrCharacterCost, HsrLightconeCost) have composite PKs of `[characterName, gameMode]` without `costSetId`. To support multiple cost sets, `costSetId` MUST be added to the PK. This is a destructive change requiring `--clear-database`.
**Why it happens:** The Phase 1 schema was designed for a single default cost set (costSetId=0). Multiple cost sets need the FK in the PK for uniqueness.
**How to avoid:** Plan the `--clear-database` publish as the first action in implementation. Re-seed all game data (characters, lightcones, costs) after the reset. Ensure the admin bulk_upsert pipeline is ready to re-populate.
**Warning signs:** If you try to insert two cost rows for the same character+gameMode with different costSetIds, the composite PK will reject the second row.

### Pitfall 2: Enum Ordering in Role Hierarchy
**What goes wrong:** Adding `Moderator` between `Admin` and `TournamentHost` in the Role enum. SpacetimeDB enums are sum types (tagged unions) where the tag is a string, not a numeric discriminant. The ordering is purely in the helper code, not in the enum definition.
**Why it happens:** Developers assume enum order affects comparison.
**How to avoid:** The `ROLE_LEVEL` mapping in `isRoleAtLeast()` is the single source of truth for hierarchy ordering. The enum variant order in `enums.ts` does not matter for hierarchy comparisons. However, adding a new variant IS a schema change -- add it at the end or accept `--clear-database`.
**Warning signs:** Permission checks passing/failing unexpectedly after role changes.

### Pitfall 3: TournamentStage Missing 'Seeding'
**What goes wrong:** The current TournamentStage enum has `Draft, Registration, InProgress, Paused, Completed, Cancelled` but CONTEXT.md specifies `Draft -> Registration -> Seeding -> InProgress -> Completed / Cancelled`. The `Seeding` variant is missing and `Paused` should be removed (CONTEXT.md lifecycle has no Paused state).
**Why it happens:** Phase 1 schema was designed before the full lifecycle was discussed.
**How to avoid:** Add `Seeding` to the TournamentStage enum. Removing `Paused` is a breaking change. Since we need `--clear-database` anyway (for cost table PK changes), this is the time to clean up the enum.
**Warning signs:** Stage transition validation failing when trying to advance from Registration to Seeding.

### Pitfall 4: Draft Cost Table Visibility
**What goes wrong:** Draft cost tables are `public: true` by default, broadcasting all draft edits to all connected clients.
**Why it happens:** SpacetimeDB tables default to public in this project's convention.
**How to avoid:** Explicitly set `public: false` on draft cost tables (or omit the `public` field, which defaults to false). Use per-user views for TO access to their own drafts.
**Warning signs:** Unexpected bandwidth spikes when TOs are editing draft costs.

### Pitfall 5: Match Result Flow Atomicity
**What goes wrong:** Match result confirmation and submission span multiple reducer calls. If the system crashes between "both teams confirmed" and "referee submitted," the state may be inconsistent.
**Why it happens:** SpacetimeDB reducers are individually transactional but multi-step workflows span multiple reducers.
**How to avoid:** Each state transition (confirm, submit, dispute) is independently valid. The MatchResultRecord status field acts as the state machine. Referee submit checks both confirmations in the same transaction. No external side effects until submit is complete.
**Warning signs:** MatchResultRecord with both teams confirmed but no referee submission for extended periods (this is expected behavior -- the referee hasn't acted yet).

### Pitfall 6: Cost Table PK Must Include costSetId for Multi-Set Support
**What goes wrong:** Currently `HsrCharacterCost` PK is `[characterName, gameMode]`. With multiple cost sets, you need `[characterName, gameMode, costSetId]` to allow the same character to have different costs in different sets.
**Why it happens:** Original design assumed single cost set.
**How to avoid:** Modify the PKs to include `costSetId`. This requires `--clear-database`. The existing `costSetId` btree index is not sufficient -- it must be in the PK for uniqueness enforcement.
**Warning signs:** Duplicate key errors when inserting costs for a custom set if PK is not updated.

## Code Examples

### Example 1: Creating a Tournament
```typescript
// reducers/tournamentManagement.ts
export const create_tournament = spacetimedb.reducer(
    {
        name: t.string(),
        description: t.string(),
        format: TournamentFormat,
        teamSize: t.u8(),
        defaultGameMode: GameMode,
        maxParticipants: t.u32(),
        rosterVisibility: RosterVisibility,
        isAnonymous: t.bool(),
        disconnectPolicy: DisconnectPolicy,
        costSetId: t.u32(),
        defaultBestOf: t.u8(),
        countTowardsMmr: t.bool(),
        winnerAdvantage: t.u8(),
        // dates are informational only:
        scheduledStartAt: t.timestamp().optional(),
        registrationDeadline: t.timestamp().optional(),
    },
    (ctx, args) => {
        const user = ensureTournamentHost(ctx);

        // Validate teamSize
        if (args.teamSize < 1 || args.teamSize > 3) {
            throw new SenderError('teamSize must be 1, 2, or 3');
        }

        // Validate costSetId if non-zero (must be a published set)
        if (args.costSetId !== 0) {
            const costSet = ctx.db.CostSet.id.find(args.costSetId);
            if (!costSet || !costSet.isPublished) {
                throw new SenderError('Cost set not found or not published');
            }
        }

        ctx.db.Tournament.insert({
            id: 0,
            ...args,
            organizerId: user.id,
            stage: { tag: 'Draft', value: {} } as any,
            isAnonymousSpectators: args.isAnonymous,
            checkInEnabled: false,
            checkInPerRound: false,
            autoForfeitEnabled: false,
            autoForfeitMinutes: 0,
            grandFinalsAdvantage: args.winnerAdvantage > 0,
            groupAssignmentMode: { tag: 'Auto', value: {} } as any,
            groupAdvanceCount: 2,
            seasonId: undefined,
            ...auditInsert(ctx, user.id),
        } as any);
    }
);
```

### Example 2: Referee Transfer
```typescript
// reducers/refereeManagement.ts
export const transfer_referee = spacetimedb.reducer(
    { lobbyId: t.u32(), targetUserId: t.u32() },
    (ctx, { lobbyId, targetUserId }) => {
        const user = getAuthenticatedUser(ctx);

        // Find current user's membership
        const senderMember = (ctx.db.LobbyMember as any).primaryKey.find({
            lobbyId, userId: user.id
        });
        if (!senderMember || !senderMember.isReferee) {
            throw new SenderError('Only the current referee can transfer the referee flag');
        }

        // Find target membership
        const targetMember = (ctx.db.LobbyMember as any).primaryKey.find({
            lobbyId, userId: targetUserId
        });
        if (!targetMember) {
            throw new SenderError('Target user is not a member of this lobby');
        }

        // Remove referee from sender
        ctx.db.LobbyMember.delete(senderMember);
        ctx.db.LobbyMember.insert({
            ...senderMember,
            isReferee: false,
            ...auditUpdate(ctx, senderMember, user.id),
        });

        // Add referee to target
        ctx.db.LobbyMember.delete(targetMember);
        ctx.db.LobbyMember.insert({
            ...targetMember,
            isReferee: true,
            ...auditUpdate(ctx, targetMember, user.id),
        });
    }
);
```

### Example 3: Cost Set Clone and Draft
```typescript
// reducers/costSetManagement.ts
export const create_cost_set = spacetimedb.reducer(
    { name: t.string(), sourceSetId: t.u32(), gameMode: GameMode },
    (ctx, { name, sourceSetId, gameMode }) => {
        const user = ensureTournamentHost(ctx);

        // Create metadata row
        const costSet = ctx.db.CostSet.insert({
            id: 0,
            name: name.trim(),
            creatorId: user.id,
            isPublished: false,
            isDraft: true,
            gameMode,
            ...auditInsert(ctx, user.id),
        } as any);

        // Clone character costs from source into draft table
        const sourceCharCosts = [...ctx.db.HsrCharacterCost.cost_set_id.filter(sourceSetId)];
        for (const row of sourceCharCosts) {
            if (row.gameMode.tag === gameMode.tag) {
                ctx.db.CostSetDraftCharacter.insert({
                    costSetId: costSet.id,
                    characterName: row.characterName,
                    gameMode: row.gameMode,
                    classicCosts: row.classicCosts,
                    auctionBaseBid: row.auctionBaseBid,
                    ...auditInsert(ctx, user.id),
                } as any);
            }
        }

        // Clone lightcone costs similarly
        // Clone synergy costs similarly
    }
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `isOpenRoster: t.bool()` on Tournament | `rosterVisibility: RosterVisibility` enum (3 variants) | Phase 3 | Supports OpenRoster, ClosedWithRating, ClosedNoRating |
| Role enum: Admin, TournamentHost, User | Role enum: Admin, Moderator, TournamentHost, User | Phase 3 | New Moderator role with intermediate permissions |
| TournamentStage without Seeding | TournamentStage with Seeding, without Paused | Phase 3 | Lifecycle matches CONTEXT.md design |
| Cost table PK: [name, gameMode] | Cost table PK: [name, gameMode, costSetId] | Phase 3 | Supports multiple cost sets per character |
| Single default cost set (costSetId=0) | CostSet metadata table with draft/publish | Phase 3 | TOs can create and manage custom cost sets |

**Deprecated/outdated:**
- `Paused` variant in TournamentStage: Should be removed. CONTEXT.md lifecycle has no Paused state.
- `isOpenRoster: t.bool()` on Tournament: Replace with `rosterVisibility: RosterVisibility` enum.
- `teamId: t.u32().optional()` on TournamentParticipant: Replace with `teamGroupId: t.u32().optional()` referencing TournamentTeam.id.

## Critical Schema Changes (Requires --clear-database)

This section documents schema changes that will destroy existing data and require a full database reset.

### Changes requiring --clear-database:
1. **HsrCharacterCost PK**: Add `costSetId` to composite PK `[characterName, gameMode]` -> `[characterName, gameMode, costSetId]`
2. **HsrLightconeCost PK**: Add `costSetId` to composite PK `[lightconeName, gameMode]` -> `[lightconeName, gameMode, costSetId]`
3. **TournamentStage enum**: Add `Seeding`, remove `Paused`
4. **Role enum**: Add `Moderator` variant
5. **RosterVisibility enum**: New enum type
6. **Tournament table**: Replace `isOpenRoster` with `rosterVisibility`, add new columns (teamSize, scheduledStartAt, registrationDeadline, costSetId, etc.)
7. **TournamentParticipant table**: Replace `teamId` with `teamGroupId`

### Re-seeding after reset:
After `--clear-database`, all game data (HsrCharacter, HsrLightcone, cost tables) must be re-imported via the admin bulk_upsert pipeline. The SYSTEM user and server identity are re-created automatically via `register_server`.

## Detailed Table Design Recommendations

### New: CostSet (metadata)
```typescript
export const CostSet = table({
    name: 'cost_set',
    public: true,
    indexes: [
        { accessor: 'creator_id', algorithm: 'btree', columns: ['creatorId'] },
    ],
}, {
    id: t.u32().primaryKey().autoInc(),
    name: t.string(),
    creatorId: t.u32(),      // FK to User.id
    gameMode: GameMode,       // Which game mode this set covers
    isPublished: t.bool(),
    isDraft: t.bool(),
    // audit columns
});
```

### New: CostSetDraftCharacter (private)
```typescript
export const CostSetDraftCharacter = table({
    name: 'cost_set_draft_character',
    // public: false -- not broadcast to clients
    primaryKey: ['costSetId', 'characterName', 'gameMode'],
    indexes: [
        { accessor: 'cost_set_id', algorithm: 'btree', columns: ['costSetId'] },
    ],
}, {
    costSetId: t.u32(),
    characterName: t.string(),
    gameMode: GameMode,
    classicCosts: EidolonCost,
    auctionBaseBid: EidolonCost,
    // audit columns
});
```

### New: TournamentTeam
```typescript
export const TournamentTeam = table({
    name: 'tournament_team',
    public: true,
    indexes: [
        { accessor: 'tournament_id', algorithm: 'btree', columns: ['tournamentId'] },
        { accessor: 'captain_user_id', algorithm: 'btree', columns: ['captainUserId'] },
    ],
}, {
    id: t.u32().primaryKey().autoInc(),
    tournamentId: t.u32(),
    name: t.string(),
    captainUserId: t.u32(),
    // audit columns
});
```

### New: TournamentTeamRequest (join requests)
```typescript
export const TournamentTeamRequest = table({
    name: 'tournament_team_request',
    public: true,
    primaryKey: ['teamId', 'userId'],
    indexes: [
        { accessor: 'team_id', algorithm: 'btree', columns: ['teamId'] },
        { accessor: 'user_id', algorithm: 'btree', columns: ['userId'] },
    ],
}, {
    teamId: t.u32(),
    userId: t.u32(),
    isPending: t.bool(),
    // audit columns
});
```

### Modified: Tournament (new columns)
Columns to add/replace on the existing Tournament table:
- Replace `isOpenRoster: t.bool()` with `rosterVisibility: RosterVisibility`
- Add `teamSize: t.u8()` (1/2/3)
- Add `costSetId: t.u32()` (FK to CostSet.id, 0 = default)
- Add `scheduledStartAt: t.timestamp().optional()`
- Add `registrationDeadline: t.timestamp().optional()`
- Add `winnerAdvantage: t.u8()` (replaces `grandFinalsAdvantage: t.bool()`)
- Add `requireVerified: t.bool()`
- Add `requireRoster: t.bool()`
- Add `minimumMmr: t.u32().optional()`
- Add `requireApproval: t.bool()`
- Add `waitlistEnabled: t.bool()`
- Keep `isAnonymousDefault`, `isAnonymousSpectators`, `disconnectPolicy`, etc.
- Remove or keep `grandFinalsAdvantage` depending on whether `winnerAdvantage: t.u8()` replaces it

### Modified: TournamentParticipant
- Replace `teamId: t.u32().optional()` with `teamGroupId: t.u32().optional()` (FK to TournamentTeam.id)
- Add `isWaitlisted: t.bool()` for waitlist support
- Add `approvedByToAt: t.timestamp().optional()` for manual approval tracking

### Modified: MatchResultRecord
- Add `team1Confirmed: t.bool()` (default false)
- Add `team2Confirmed: t.bool()` (default false)
- Add `refereeUserId: t.u32().optional()` (who submitted)
- Add `disputedByUserId: t.u32().optional()`
- Add `disputeReason: t.string().optional()`
- Add `tournamentId: t.u32().optional()` (for tournament context)

### Modified: LobbyMember
The `isReferee` flag already exists. No changes needed for the referee system itself.

### Modified: Lobby
- Add `costSetId: t.u32()` (FK to CostSet.id, 0 = default) -- allows non-tournament matches to use custom cost sets

## Reducer File Organization

| File | Reducers | Domain |
|------|----------|--------|
| `tournamentManagement.ts` | `create_tournament`, `update_tournament`, `advance_tournament_stage`, `cancel_tournament` | Tournament CRUD + lifecycle |
| `tournamentRegistration.ts` | `register_for_tournament`, `withdraw_from_tournament`, `approve_participant`, `waitlist_promote` | Player registration |
| `tournamentTeams.ts` | `create_tournament_team`, `request_join_team`, `accept_team_request`, `reject_team_request`, `leave_tournament_team`, `disband_tournament_team` | Tournament-scoped team management |
| `tournamentAdmin.ts` | `dq_participant`, `override_match_result`, `assign_tournament_assistant`, `remove_tournament_assistant`, `mod_promote_to_host`, `mod_demote_from_host` | Admin/Mod/TO overrides |
| `costSetManagement.ts` | `create_cost_set`, `edit_draft_character_cost`, `edit_draft_lightcone_cost`, `edit_draft_synergy_cost`, `publish_cost_set`, `unpublish_cost_set`, `delete_cost_set` | Cost set lifecycle |
| `matchResultSubmission.ts` | `confirm_match_scores`, `submit_match_result`, `dispute_match_result`, `invalidate_match_result` | Match result flow |
| `refereeManagement.ts` | `transfer_referee`, `reclaim_referee` | Referee flag transfer |

## Open Questions

1. **HsrSynergyCost PK for cost sets**
   - What we know: HsrSynergyCost uses autoInc `id` as PK with a btree index on `[sourceName, gameMode]`. It also has `costSetId`.
   - What's unclear: Unlike character/lightcone costs, the autoInc PK already allows multiple rows with different costSetIds. However, the upsert logic in admin.ts matches on `[sourceName, targetName, gameMode]` without considering costSetId.
   - Recommendation: Update the synergy cost btree index to include costSetId: `[sourceName, targetName, gameMode, costSetId]`. The PK (autoInc id) stays as-is.

2. **Lobby permission granularity for referee powers**
   - What we know: CONTEXT.md says each referee power has a permission level (anyone / referee only / match participants only) configurable in lobby options.
   - What's unclear: How many lobby columns does this add? (pause, undo, move players, submit results = 4 powers x 1 column each = 4 new columns on Lobby).
   - Recommendation: Add 4 permission columns to Lobby: `permPause`, `permUndo`, `permMovePlayer`, `permSubmitResult` -- each storing a u8 (0=anyone, 1=referee only, 2=participants only). This is Claude's discretion per CONTEXT.md.

3. **Waitlist promotion order**
   - What we know: Optional maxParticipants with waitlist support. When a participant drops, someone from the waitlist should be promoted.
   - What's unclear: Should promotion be automatic (FIFO by registration time) or manual (TO picks)?
   - Recommendation: Manual -- TO calls `waitlist_promote(tournamentId, userId)`. Aligns with the "TO manually advances everything" philosophy. Provide a view of waitlisted participants sorted by registration time for TO convenience.

4. **Cost set scope per game mode**
   - What we know: CONTEXT.md says "When creating a cost set for a specific game mode, it must cover all characters and lightcones for that mode."
   - What's unclear: Does a cost set cover a single game mode or all game modes?
   - Recommendation: Per-game-mode cost sets. The CostSet metadata table gets a `gameMode` column. When cloning, only rows matching that gameMode are copied. This simplifies the draft/publish workflow.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | SpacetimeDB module publish + manual reducer testing |
| Config file | spacetime.json |
| Quick run command | `spacetime publish hsrpvp --module-path spacetimedb` |
| Full suite command | `spacetime publish hsrpvp --clear-database -y --module-path spacetimedb && spacetime generate --lang typescript --out-dir src/module_bindings --module-path spacetimedb` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TRNT-01 | Admin promotes user to TournamentHost via admin_update_user | manual | Call `admin_update_user` with roleTag='TournamentHost' | Already exists (admin.ts) |
| TRNT-02 | TO creates tournament with all settings | manual | Call `create_tournament` reducer | Wave 0 |
| TRNT-03 | Tournament supports all format variants | manual | Verify TournamentFormat enum includes all variants | Already exists (enums.ts) |
| TRNT-04 | Tournament stage lifecycle with forward-only enforcement | manual | Call `advance_tournament_stage` in order + verify rejection of backward transitions | Wave 0 |
| TRNT-05 | Player registers for tournament | manual | Call `register_for_tournament` | Wave 0 |
| TRNT-06 | Team registration for tournament | manual | Call `create_tournament_team` + `register_for_tournament` with teamGroupId | Wave 0 |
| TRNT-07 | Referee transfer within lobby | manual | Call `transfer_referee` | Wave 0 |
| TRNT-08 | Tournament anonymous play setting | manual | Verify isAnonymousDefault on created tournament | Covered by TRNT-02 |
| TRNT-09 | Tournament roster visibility setting | manual | Verify rosterVisibility on created tournament | Covered by TRNT-02 |
| TRNT-10 | Tournament disconnect policy setting | manual | Verify disconnectPolicy on created tournament | Covered by TRNT-02 |
| TRNT-11 | TO overrides match result, DQ participant | manual | Call `dq_participant`, `override_match_result` | Wave 0 |
| TRNT-12 | Referee validates match results | manual | Call `confirm_match_scores` + `submit_match_result` | Wave 0 |
| TEAM-01 | Create tournament-scoped team | manual | Call `create_tournament_team` | Wave 0 |
| TEAM-02 | Request to join tournament team | manual | Call `request_join_team` | Wave 0 |
| TEAM-03 | Accept/decline team join request | manual | Call `accept_team_request` / `reject_team_request` | Wave 0 |
| TEAM-04 | Ad-hoc groups within tournament | manual | Same as TEAM-01 (all tournament teams are ad-hoc) | Covered by TEAM-01 |
| TEAM-05 | Coach role on team | manual | Verify isCoach flag on LobbyMember | Already exists (lobbyMember.ts) |

### Sampling Rate
- **Per task commit:** `spacetime publish hsrpvp --module-path spacetimedb` (verify module compiles and publishes)
- **Per wave merge:** Full publish + generate bindings
- **Phase gate:** Full suite green + manual reducer testing via client or spacetime CLI

### Wave 0 Gaps
- [ ] New reducer files: `tournamentManagement.ts`, `tournamentRegistration.ts`, `tournamentTeams.ts`, `tournamentAdmin.ts`, `costSetManagement.ts`, `matchResultSubmission.ts`, `refereeManagement.ts`
- [ ] New table files: `costSet.ts`, `costSetDraftCharacter.ts`, `costSetDraftLightcone.ts`, `costSetDraftSynergy.ts`, `tournamentTeam.ts`, `tournamentTeamRequest.ts`
- [ ] New helper: `tournamentHelpers.ts`
- [ ] Enum additions: Moderator, Seeding, RosterVisibility
- [ ] Schema.ts imports for all new tables

## Sources

### Primary (HIGH confidence)
- Project codebase: All table definitions, reducer patterns, helper functions, views read directly from source files
- CONTEXT.md: User decisions and locked constraints
- REQUIREMENTS.md: Phase requirement IDs and descriptions
- SpacetimeDB SKILL.md: API patterns, naming conventions, schema change rules

### Secondary (MEDIUM confidence)
- SpacetimeDB api-guide.md: Index system, CRUD operations, schema constraints

### Tertiary (LOW confidence)
- None -- all findings are based on existing project code and documented user decisions

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new libraries, entirely SpacetimeDB tables/reducers using established patterns
- Architecture: HIGH -- patterns directly extend existing codebase patterns (admin proxy, per-user views, audit columns, permission helpers)
- Pitfalls: HIGH -- identified from direct code analysis (PK constraints, enum changes, schema reset requirements)
- Cost set workflow: MEDIUM -- design is sound but the draft/publish flow is the most complex new pattern in this phase; exact table structure is Claude's discretion
- Match result flow: HIGH -- multi-party confirmation is straightforward state machine

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable -- SpacetimeDB backend patterns are well-established in this project)
