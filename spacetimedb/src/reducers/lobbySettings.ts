import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { DraftMode, BanMode, GameMode, MatchType, RosterVisibility, DisconnectPolicy, TeamLabel } from '../types/enums';
import { getAuthenticatedUser, isRoleAtLeast } from '../helpers/ensurePermissions';
import { auditUpdate } from '../helpers/auditColumns';
import { ensureLobbyMember, ensureHostOrAbove, ensureStageIs } from '../helpers/lobbyHelpers';

// ─── update_lobby_settings ────────────────────────────────────────────────────
// Updates all mutable lobby configuration fields.
// Per D-28: settings mutable only during Waiting stage.
// Per D-65: tournament-controlled lobbies cannot change settings.
// Per D-42: Ranked forces allowMirrorPicks=false.
// Per D-23: guests forced to ClosedNoRating and Casual.
// Resets all members' isConfirmed to false on settings change.

export const update_lobby_settings = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
        teamSize: t.u8(),
        draftMode: DraftMode,
        banMode: BanMode,
        gameMode: GameMode,
        matchType: MatchType,
        standardTurnSeconds: t.u32(),
        reserveBankSeconds: t.u32(),
        characterBudget: t.f32(),
        lightconeBudget: t.f32(),
        minimumBidRaise: t.f32(),
        rosterDiffAdvantage: t.f32(),
        rosterThreshold: t.f32(),
        underThresholdAdvantage: t.f32(),
        aboveThresholdPenalty: t.f32(),
        deathPenalty: t.f32(),
        isAnonymousPlayers: t.bool(),
        isAnonymousSpectators: t.bool(),
        rosterVisibility: RosterVisibility,
        requireOwnership: t.bool(),
        costSetId: t.u32(),
        disconnectPolicy: DisconnectPolicy,
        disconnectForfeitSeconds: t.u32(),
        allowMirrorPicks: t.bool(),
        autoRandomPick: t.bool(),
        refereeCanUndo: t.bool(),
        refereeCanPause: t.bool(),
        refereeCanSetCaptain: t.bool(),
        refereeCanKick: t.bool(),
        allowPlayerPause: t.bool(),
        teamBlueAlias: t.string(),
        teamRedAlias: t.string(),
        isPublic: t.bool(),
        password: t.string(),
    },
    (ctx, args) => {
        const user = getAuthenticatedUser(ctx);
        const lobbyId = args.lobbyId;

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) {
            throw new SenderError('Lobby not found.');
        }

        // D-21: only host, moderator, or admin can update settings
        ensureHostOrAbove(ctx, lobby, user);

        // D-28: settings locked once Drafting begins
        ensureStageIs(lobby, 'Waiting');

        // D-65: tournament-controlled lobbies cannot change settings
        if (lobby.isTournamentControlled) {
            throw new SenderError('Cannot change settings on a tournament-controlled lobby.');
        }

        // D-23: guests forced to Casual + ClosedNoRating
        let matchType = args.matchType;
        let rosterVisibility = args.rosterVisibility;
        if (user.isGuest) {
            matchType = { tag: 'Casual', value: {} } as any;
            rosterVisibility = { tag: 'ClosedNoRating', value: {} } as any;
        }

        // D-42: Ranked forces no mirror picks
        const allowMirrorPicks = matchType.tag === 'Ranked' ? false : args.allowMirrorPicks;

        // Resolve disconnectForfeitSeconds — 0 sentinel means "not set"
        const disconnectForfeitSeconds = args.disconnectForfeitSeconds > 0
            ? args.disconnectForfeitSeconds
            : undefined;

        // Update Lobby row
        ctx.db.Lobby.id.update({
            ...lobby,
            teamSize: args.teamSize,
            draftMode: args.draftMode,
            banMode: args.banMode,
            gameMode: args.gameMode,
            matchType,
            standardTurnSeconds: args.standardTurnSeconds,
            reserveBankSeconds: args.reserveBankSeconds,
            characterBudget: args.characterBudget,
            lightconeBudget: args.lightconeBudget,
            minimumBidRaise: args.minimumBidRaise,
            rosterDiffAdvantage: args.rosterDiffAdvantage,
            rosterThreshold: args.rosterThreshold,
            underThresholdAdvantage: args.underThresholdAdvantage,
            aboveThresholdPenalty: args.aboveThresholdPenalty,
            deathPenalty: args.deathPenalty,
            isAnonymousPlayers: args.isAnonymousPlayers,
            isAnonymousSpectators: args.isAnonymousSpectators,
            rosterVisibility,
            requireOwnership: args.requireOwnership,
            costSetId: args.costSetId,
            disconnectPolicy: args.disconnectPolicy,
            disconnectForfeitSeconds,
            allowMirrorPicks,
            autoRandomPick: args.autoRandomPick,
            refereeCanUndo: args.refereeCanUndo,
            refereeCanPause: args.refereeCanPause,
            refereeCanSetCaptain: args.refereeCanSetCaptain,
            refereeCanKick: args.refereeCanKick,
            allowPlayerPause: args.allowPlayerPause,
            teamBlueAlias: args.teamBlueAlias,
            teamRedAlias: args.teamRedAlias,
            isPublic: args.isPublic,
            lastActivityAt: ctx.timestamp,
            ...auditUpdate(ctx, lobby, user.id),
        } as any);

        // Handle password change
        if (!args.isPublic && args.password.length > 0) {
            // Upsert LobbyPassword row
            const existing = ctx.db.LobbyPassword.lobbyId.find(lobbyId);
            if (existing) {
                ctx.db.LobbyPassword.lobbyId.delete(lobbyId);
            }
            ctx.db.LobbyPassword.insert({
                lobbyId,
                passwordHash: args.password,
                createdById: existing ? existing.createdById : user.id,
                createdDate: existing ? existing.createdDate : ctx.timestamp,
                lastModifiedById: user.id,
                lastModifiedDate: ctx.timestamp,
            } as any);
        } else if (args.isPublic) {
            // Changed to public — remove password if exists
            const existing = ctx.db.LobbyPassword.lobbyId.find(lobbyId);
            if (existing) {
                ctx.db.LobbyPassword.lobbyId.delete(lobbyId);
            }
        }

        // Settings changed — reset all members' isConfirmed to false
        const members = [...ctx.db.LobbyMember.lobby_id.filter(lobbyId)];
        for (const member of members) {
            if (member.isConfirmed) {
                ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, member.userId]);
                ctx.db.LobbyMember.insert({
                    ...member,
                    isConfirmed: false,
                    ...auditUpdate(ctx, member, user.id),
                } as any);
            }
        }

        console.log(`[LOBBY] Lobby #${lobbyId} settings updated by user #${user.id}`);
    }
);

// ─── set_team_slot ────────────────────────────────────────────────────────────
// Moves a member to a different team slot (Blue/Red/Spectator).
// Per D-27/D-28: free movement during Waiting. Moving resets isConfirmed for the mover.
// Self-move: any member can move themselves.
// Moving others: requires host/moderator/admin.

export const set_team_slot = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
        targetUserId: t.u32(),
        teamSlot: TeamLabel,
    },
    (ctx, args) => {
        const user = getAuthenticatedUser(ctx);
        const lobbyId = args.lobbyId;
        const targetUserId = args.targetUserId;

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) {
            throw new SenderError('Lobby not found.');
        }

        // D-28: free movement only during Waiting
        ensureStageIs(lobby, 'Waiting');

        // If moving someone else, require host or above
        if (targetUserId !== user.id) {
            ensureHostOrAbove(ctx, lobby, user);
        } else {
            // Self-move: user must be a member
            ensureLobbyMember(ctx, lobbyId, user.id);
        }

        // Find target member
        const targetMember = ensureLobbyMember(ctx, lobbyId, targetUserId);

        // Delete + reinsert with new teamSlot and isConfirmed reset
        ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, targetUserId]);
        ctx.db.LobbyMember.insert({
            ...targetMember,
            teamSlot: args.teamSlot,
            isConfirmed: false,
            ...auditUpdate(ctx, targetMember, user.id),
        } as any);

        // Update lobby activity timestamp
        ctx.db.Lobby.id.update({
            ...lobby,
            lastActivityAt: ctx.timestamp,
            ...auditUpdate(ctx, lobby, user.id),
        } as any);

        console.log(`[LOBBY] User #${targetUserId} moved to ${args.teamSlot.tag} in lobby #${lobbyId} by user #${user.id}`);
    }
);

// ─── confirm_ready ────────────────────────────────────────────────────────────
// Marks the calling player as confirmed/ready.
// Per D-29: can only confirm during Waiting stage.

export const confirm_ready = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
    },
    (ctx, args) => {
        const user = getAuthenticatedUser(ctx);
        const lobbyId = args.lobbyId;

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) {
            throw new SenderError('Lobby not found.');
        }

        // Can only confirm during Waiting
        ensureStageIs(lobby, 'Waiting');

        const member = ensureLobbyMember(ctx, lobbyId, user.id);

        ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, user.id]);
        ctx.db.LobbyMember.insert({
            ...member,
            isConfirmed: true,
            ...auditUpdate(ctx, member, user.id),
        } as any);

        ctx.db.Lobby.id.update({
            ...lobby,
            lastActivityAt: ctx.timestamp,
            ...auditUpdate(ctx, lobby, user.id),
        } as any);

        console.log(`[LOBBY] User #${user.id} confirmed ready in lobby #${lobbyId}`);
    }
);

// ─── unconfirm_ready ──────────────────────────────────────────────────────────
// Removes the calling player's ready confirmation.
// Per D-28: unconfirm allowed during Waiting only.

export const unconfirm_ready = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
    },
    (ctx, args) => {
        const user = getAuthenticatedUser(ctx);
        const lobbyId = args.lobbyId;

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) {
            throw new SenderError('Lobby not found.');
        }

        // D-28: unconfirm blocked during the 3-second countdown after start_draft is called
        // If the stage is still Waiting, start_draft hasn't fired yet — stage check suffices.
        ensureStageIs(lobby, 'Waiting');

        const member = ensureLobbyMember(ctx, lobbyId, user.id);

        ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, user.id]);
        ctx.db.LobbyMember.insert({
            ...member,
            isConfirmed: false,
            ...auditUpdate(ctx, member, user.id),
        } as any);

        console.log(`[LOBBY] User #${user.id} unconfirmed ready in lobby #${lobbyId}`);
    }
);

// ─── set_captain ──────────────────────────────────────────────────────────────
// Assigns the captain designation on a team member.
// Per D-30: host, referee (when refereeCanSetCaptain=true), or admin can assign captains.
// Target must be on a team (Blue or Red) and not a coach.
// Existing captain on same team is demoted.

export const set_captain = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
        targetUserId: t.u32(),
    },
    (ctx, args) => {
        const user = getAuthenticatedUser(ctx);
        const lobbyId = args.lobbyId;
        const targetUserId = args.targetUserId;

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) {
            throw new SenderError('Lobby not found.');
        }

        // Permission: host OR (referee with refereeCanSetCaptain) OR admin
        const callerMember = ensureLobbyMember(ctx, lobbyId, user.id);
        const isHost = lobby.hostUserId === user.id;
        const isRefereeWithPower = callerMember.isReferee && lobby.refereeCanSetCaptain;
        const isAdmin = isRoleAtLeast(user.role, 'Admin');
        if (!isHost && !isRefereeWithPower && !isAdmin) {
            throw new SenderError('Only the host, an authorized referee, or an admin can assign captains.');
        }

        // Find target member
        const targetMember = ensureLobbyMember(ctx, lobbyId, targetUserId);

        // Target must be on a team (Blue or Red), not Spectator, and not a coach
        if (targetMember.teamSlot.tag === 'Spectator') {
            throw new SenderError('Captain must be a team member (Blue or Red), not a spectator.');
        }
        if (targetMember.isCoach) {
            throw new SenderError('A coach cannot be assigned as captain.');
        }

        const targetTeam = targetMember.teamSlot.tag;

        // Demote existing captain on the same team
        const allMembers = [...ctx.db.LobbyMember.lobby_id.filter(lobbyId)];
        for (const m of allMembers) {
            if (m.isCaptain && m.teamSlot.tag === targetTeam && m.userId !== targetUserId) {
                ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, m.userId]);
                ctx.db.LobbyMember.insert({
                    ...m,
                    isCaptain: false,
                    ...auditUpdate(ctx, m, user.id),
                } as any);
            }
        }

        // Promote target to captain
        ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, targetUserId]);
        ctx.db.LobbyMember.insert({
            ...targetMember,
            isCaptain: true,
            ...auditUpdate(ctx, targetMember, user.id),
        } as any);

        console.log(`[LOBBY] User #${targetUserId} set as ${targetTeam} captain in lobby #${lobbyId} by user #${user.id}`);
    }
);
