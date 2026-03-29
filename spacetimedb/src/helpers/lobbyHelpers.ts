import { SenderError } from 'spacetimedb/server';
import { isRoleAtLeast } from './ensurePermissions';

/**
 * Ensures the user is not currently in any lobby.
 * Per D-22: one lobby at a time per user.
 * Throws if the user is already a member of any lobby.
 */
export function ensureNotInLobby(ctx: any, userId: number): void {
    const memberships = [...ctx.db.LobbyMember.user_id.filter(userId)];
    if (memberships.length > 0) {
        throw new SenderError('You are already in a lobby. Leave it before creating or joining another.');
    }
}

/**
 * Enforces guest restrictions for lobby creation/join.
 * Per D-23: guests cannot create or join Ranked lobbies.
 */
export function ensureGuestRestrictions(user: any, matchType: any): void {
    if (user.isGuest === true && matchType.tag === 'Ranked') {
        throw new SenderError('Guests cannot create or join Ranked lobbies.');
    }
}

/**
 * Returns the LobbyMember row for the given user in the given lobby.
 * Throws if the user is not a member of the lobby.
 */
export function ensureLobbyMember(ctx: any, lobbyId: number, userId: number): any {
    const member = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, userId])][0];
    if (!member) {
        throw new SenderError('You are not a member of this lobby.');
    }
    return member;
}

/**
 * Checks that the user is the lobby host or has Moderator+ role.
 * Per D-21: host, admin, moderator can perform administrative lobby actions.
 * Throws if neither condition is met.
 */
export function ensureHostOrAbove(ctx: any, lobby: any, user: any): void {
    const isHost = lobby.hostUserId === user.id;
    const isModOrAbove = isRoleAtLeast(user.role, 'Moderator');
    if (!isHost && !isModOrAbove) {
        throw new SenderError('Only the host, moderators, or admins can perform this action.');
    }
}

/**
 * Ensures the user is not banned from the given lobby.
 * Per D-21: banned users cannot rejoin.
 * Throws if a ban record exists for this user in this lobby.
 */
export function ensureNotBanned(ctx: any, lobbyId: number, userId: number): void {
    const ban = [...ctx.db.LobbyBan.by_lobby_and_user.filter([lobbyId, userId])][0];
    if (ban) {
        throw new SenderError('You are banned from this lobby.');
    }
}

/**
 * Ensures the lobby is in one of the given stages.
 * Throws with the current stage name if not.
 */
export function ensureStageIs(lobby: any, ...stages: string[]): void {
    if (!stages.includes(lobby.stage.tag)) {
        throw new SenderError(
            'This action is not allowed in the current lobby stage (' + lobby.stage.tag + ').'
        );
    }
}

/**
 * Returns true if the caller user can kick or ban a member.
 * Per D-21: host, admin, moderator can kick/ban.
 * Per D-32: refereeCanKick flag on lobby controls whether referees can kick.
 * The `member` param is the CALLER's LobbyMember row (not the target).
 */
export function canKickOrBan(ctx: any, lobby: any, user: any, member: any): boolean {
    if (lobby.hostUserId === user.id) return true;
    if (isRoleAtLeast(user.role, 'Admin')) return true;
    if (isRoleAtLeast(user.role, 'Moderator')) return true;
    if (member.isReferee && lobby.refereeCanKick) return true;
    return false;
}
