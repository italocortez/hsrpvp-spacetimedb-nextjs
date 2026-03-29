import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser } from '../helpers/ensurePermissions';
import { auditUpdate } from '../helpers/auditColumns';

// ─── transfer_referee ─────────────────────────────────────────────────────────
// Transfers the referee flag from the caller to another lobby member.
// Permission: current referee of the lobby.

export const transfer_referee = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
        targetUserId: t.u32(),
    },
    (ctx, { lobbyId, targetUserId }) => {
        const user = getAuthenticatedUser(ctx);

        // Find caller's LobbyMember row
        const senderMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, user.id])][0];
        if (!senderMember) {
            throw new SenderError('You are not a member of this lobby.');
        }

        // Validate caller has the referee flag
        if (!senderMember.isReferee) {
            throw new SenderError('You are not the referee of this lobby.');
        }

        // Validate target is different from caller
        if (targetUserId === user.id) {
            throw new SenderError('Cannot transfer referee to yourself.');
        }

        // Find target's LobbyMember row
        const targetMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, targetUserId])][0];
        if (!targetMember) {
            throw new SenderError('Target user is not a member of this lobby.');
        }

        // Remove referee flag from caller
        ctx.db.LobbyMember.delete(senderMember);
        ctx.db.LobbyMember.insert({
            ...senderMember,
            isReferee: false,
            ...auditUpdate(ctx, senderMember, user.id),
        } as any);

        // Add referee flag to target
        ctx.db.LobbyMember.delete(targetMember);
        ctx.db.LobbyMember.insert({
            ...targetMember,
            isReferee: true,
            ...auditUpdate(ctx, targetMember, user.id),
        } as any);

        console.log(`[LOBBY] Referee transferred from user #${user.id} to user #${targetUserId} in lobby #${lobbyId}`);
    }
);

// ─── reclaim_referee ──────────────────────────────────────────────────────────
// Reclaims the referee flag from the current holder back to the lobby host.
// Permission: lobby host only.
// NOTE: Auto-assignment of the referee flag at lobby creation is deferred to Phase 9.

export const reclaim_referee = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
    },
    (ctx, { lobbyId }) => {
        const user = getAuthenticatedUser(ctx);

        // Find the lobby and validate caller is the host
        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) {
            throw new SenderError('Lobby not found.');
        }
        if (lobby.hostUserId !== user.id) {
            throw new SenderError('Only the lobby host can reclaim the referee flag.');
        }

        // Find the current referee (iterate lobby members to find the one with isReferee = true)
        // Using lobby_id index for efficiency
        const members = [...ctx.db.LobbyMember.lobby_id.filter(lobbyId)];
        const currentReferee = members.find((m: any) => m.isReferee === true);

        // No-op: if there is no current referee or the host is already the referee
        if (!currentReferee || currentReferee.userId === user.id) {
            return;
        }

        // Find host's LobbyMember row
        const hostMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, user.id])][0];
        if (!hostMember) {
            throw new SenderError('Host is not a member of this lobby.');
        }

        // Remove referee flag from current holder
        ctx.db.LobbyMember.delete(currentReferee);
        ctx.db.LobbyMember.insert({
            ...currentReferee,
            isReferee: false,
            ...auditUpdate(ctx, currentReferee, user.id),
        } as any);

        // Add referee flag to host
        ctx.db.LobbyMember.delete(hostMember);
        ctx.db.LobbyMember.insert({
            ...hostMember,
            isReferee: true,
            ...auditUpdate(ctx, hostMember, user.id),
        } as any);

        console.log(`[LOBBY] Referee reclaimed by host #${user.id} from user #${currentReferee.userId} in lobby #${lobbyId}`);
    }
);

// --- Coach Role Management --------------------------------------------------------
// Assigns or removes the Coach participationRole on a LobbyMember.
// Permission: lobby host or current referee.

export const set_coach = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
        targetUserId: t.u32(),
    },
    (ctx, { lobbyId, targetUserId }) => {
        const user = getAuthenticatedUser(ctx);

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) throw new SenderError('Lobby not found.');

        const callerMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, user.id])][0];
        if (!callerMember) throw new SenderError('You are not a member of this lobby.');

        const isHost = lobby.hostUserId === user.id;
        const isRef = callerMember.isReferee === true;
        if (!isHost && !isRef) {
            throw new SenderError('Only the lobby host or referee can assign the coach role.');
        }

        const targetMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, targetUserId])][0];
        if (!targetMember) throw new SenderError('Target user is not a member of this lobby.');

        // Already a coach — no-op
        if (targetMember.participationRole.tag === 'Coach') return;

        // Check coach cap: max 1 coach per team
        const teamMembers = [...ctx.db.LobbyMember.lobby_id.filter(lobbyId)]
            .filter((m: any) => m.teamSlot.tag === targetMember.teamSlot.tag);
        const coachCount = teamMembers.filter((m: any) => m.participationRole.tag === 'Coach').length;
        if (coachCount >= 1) {
            throw new SenderError('This team already has a coach.');
        }

        ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, targetUserId]);
        ctx.db.LobbyMember.insert({
            ...targetMember,
            participationRole: { tag: 'Coach', value: {} },
            isCaptain: false, // Coaches cannot be captains
            ...auditUpdate(ctx, targetMember, user.id),
        } as any);

        console.log(`[LOBBY] Coach role assigned to user #${targetUserId} in lobby #${lobbyId} by user #${user.id}`);
    }
);

export const remove_coach = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
        targetUserId: t.u32(),
    },
    (ctx, { lobbyId, targetUserId }) => {
        const user = getAuthenticatedUser(ctx);

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) throw new SenderError('Lobby not found.');

        const callerMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, user.id])][0];
        if (!callerMember) throw new SenderError('You are not a member of this lobby.');

        const isHost = lobby.hostUserId === user.id;
        const isRef = callerMember.isReferee === true;
        if (!isHost && !isRef) {
            throw new SenderError('Only the lobby host or referee can remove the coach role.');
        }

        const targetMember = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, targetUserId])][0];
        if (!targetMember) throw new SenderError('Target user is not a member of this lobby.');

        // Not a coach — no-op
        if (targetMember.participationRole.tag !== 'Coach') return;

        ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, targetUserId]);
        ctx.db.LobbyMember.insert({
            ...targetMember,
            participationRole: { tag: 'Player', value: {} },
            ...auditUpdate(ctx, targetMember, user.id),
        } as any);

        console.log(`[LOBBY] Coach role removed from user #${targetUserId} in lobby #${lobbyId} by user #${user.id}`);
    }
);
