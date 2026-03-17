import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser } from '../helpers/ensurePermissions';
import { auditInsert, auditUpdate } from '../helpers/auditColumns';

// ─── create_tournament_team ───────────────────────────────────────────────────
// Creates a tournament-scoped team for the calling user (captain).
// The creator is set as captain and their TournamentParticipant is updated to Team type.

export const create_tournament_team = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
        teamName: t.string(),
    },
    (ctx, { tournamentId, teamName }) => {
        const user = getAuthenticatedUser(ctx);

        const tournament = ctx.db.Tournament.id.find(tournamentId);
        if (!tournament) throw new SenderError('Tournament not found.');
        if (tournament.stage.tag !== 'Registration') {
            throw new SenderError('Teams can only be created during the Registration stage.');
        }

        // Validate team name
        const trimmedName = teamName.trim();
        if (trimmedName.length < 1 || trimmedName.length > 50) {
            throw new SenderError('Team name must be 1-50 characters.');
        }

        // Can't create teams in solo tournaments
        if (tournament.teamSize <= 1) {
            throw new SenderError('Cannot create teams in a solo tournament.');
        }

        // Player must be registered in the tournament
        const participant = (ctx.db.TournamentParticipant as any).primaryKey.find({
            tournamentId,
            userId: user.id,
        });
        if (!participant) {
            throw new SenderError('You must be registered in the tournament before creating a team.');
        }

        // Player must not already be on a team
        if (participant.teamGroupId !== undefined && participant.teamGroupId !== 0) {
            throw new SenderError('You are already on a team in this tournament.');
        }

        // Player must not already captain a team in this tournament
        const existingCaptained = [...ctx.db.TournamentTeam.captain_user_id.filter(user.id)]
            .find((team: any) => team.tournamentId === tournamentId);
        if (existingCaptained) {
            throw new SenderError('You already captain a team in this tournament.');
        }

        // Insert the team row
        const newTeam = ctx.db.TournamentTeam.insert({
            id: 0,
            tournamentId,
            name: trimmedName,
            captainUserId: user.id,
            ...auditInsert(ctx, user.id),
        } as any);

        const teamId = newTeam.id;

        // Update captain's participant row: set teamGroupId and participantType = Team
        ctx.db.TournamentParticipant.delete(participant);
        ctx.db.TournamentParticipant.insert({
            ...participant,
            teamGroupId: teamId,
            participantType: { tag: 'Team', value: {} } as any,
            ...auditUpdate(ctx, participant, user.id),
        } as any);
    }
);

// ─── request_join_team ────────────────────────────────────────────────────────
// Submits a request to join an existing tournament team.

export const request_join_team = spacetimedb.reducer(
    {
        teamId: t.u32(),
    },
    (ctx, { teamId }) => {
        const user = getAuthenticatedUser(ctx);

        const team = ctx.db.TournamentTeam.id.find(teamId);
        if (!team) throw new SenderError('Team not found.');

        const tournament = ctx.db.Tournament.id.find(team.tournamentId);
        if (!tournament) throw new SenderError('Tournament not found.');
        if (tournament.stage.tag !== 'Registration') {
            throw new SenderError('Teams can only be joined during the Registration stage.');
        }

        // User must be registered in the same tournament
        const participant = (ctx.db.TournamentParticipant as any).primaryKey.find({
            tournamentId: team.tournamentId,
            userId: user.id,
        });
        if (!participant) {
            throw new SenderError('You must be registered in the tournament before joining a team.');
        }

        // User must not already be on a team
        if (participant.teamGroupId !== undefined && participant.teamGroupId !== 0) {
            throw new SenderError('You are already on a team in this tournament.');
        }

        // No existing pending request from this user to this team
        const existingRequest = (ctx.db.TournamentTeamRequest as any).primaryKey.find({
            teamId,
            userId: user.id,
        });
        if (existingRequest) {
            throw new SenderError('You already have a pending request to join this team.');
        }

        ctx.db.TournamentTeamRequest.insert({
            teamId,
            userId: user.id,
            isPending: true,
            ...auditInsert(ctx, user.id),
        } as any);
    }
);

// ─── accept_team_request ──────────────────────────────────────────────────────
// Captain accepts a join request, adding the player to the team.

export const accept_team_request = spacetimedb.reducer(
    {
        teamId: t.u32(),
        userId: t.u32(),
    },
    (ctx, { teamId, userId }) => {
        const caller = getAuthenticatedUser(ctx);

        const team = ctx.db.TournamentTeam.id.find(teamId);
        if (!team) throw new SenderError('Team not found.');
        if (team.captainUserId !== caller.id) {
            throw new SenderError('Only the team captain can accept join requests.');
        }

        const request = (ctx.db.TournamentTeamRequest as any).primaryKey.find({ teamId, userId });
        if (!request) throw new SenderError('Join request not found.');
        if (!request.isPending) throw new SenderError('Join request is no longer pending.');

        // Check current team member count
        const tournament = ctx.db.Tournament.id.find(team.tournamentId);
        if (!tournament) throw new SenderError('Tournament not found.');
        const memberCount = [...ctx.db.TournamentParticipant.tournament_id.filter(team.tournamentId)]
            .filter((p: any) => p.teamGroupId === teamId && !p.isWaitlisted).length;
        if (memberCount >= tournament.teamSize) {
            throw new SenderError('Team is already full.');
        }

        // Update request: set isPending = false (delete + insert)
        ctx.db.TournamentTeamRequest.delete(request);
        ctx.db.TournamentTeamRequest.insert({
            ...request,
            isPending: false,
            ...auditUpdate(ctx, request, caller.id),
        } as any);

        // Update the accepted player's TournamentParticipant: set teamGroupId + Team type
        const participant = (ctx.db.TournamentParticipant as any).primaryKey.find({
            tournamentId: team.tournamentId,
            userId,
        });
        if (!participant) throw new SenderError('Participant record not found.');

        ctx.db.TournamentParticipant.delete(participant);
        ctx.db.TournamentParticipant.insert({
            ...participant,
            teamGroupId: teamId,
            participantType: { tag: 'Team', value: {} } as any,
            ...auditUpdate(ctx, participant, caller.id),
        } as any);
    }
);

// ─── reject_team_request ──────────────────────────────────────────────────────
// Captain rejects a join request, deleting the request row.

export const reject_team_request = spacetimedb.reducer(
    {
        teamId: t.u32(),
        userId: t.u32(),
    },
    (ctx, { teamId, userId }) => {
        const caller = getAuthenticatedUser(ctx);

        const team = ctx.db.TournamentTeam.id.find(teamId);
        if (!team) throw new SenderError('Team not found.');
        if (team.captainUserId !== caller.id) {
            throw new SenderError('Only the team captain can reject join requests.');
        }

        const request = (ctx.db.TournamentTeamRequest as any).primaryKey.find({ teamId, userId });
        if (!request) throw new SenderError('Join request not found.');
        if (!request.isPending) throw new SenderError('Join request is no longer pending.');

        // Delete the request entirely (rejected requests don't need audit trail)
        ctx.db.TournamentTeamRequest.delete(request);
    }
);

// ─── leave_tournament_team ────────────────────────────────────────────────────
// Leaves a tournament team.
// The captain cannot leave — they must disband the team instead.

export const leave_tournament_team = spacetimedb.reducer(
    {
        teamId: t.u32(),
    },
    (ctx, { teamId }) => {
        const user = getAuthenticatedUser(ctx);

        const team = ctx.db.TournamentTeam.id.find(teamId);
        if (!team) throw new SenderError('Team not found.');

        // Captain cannot leave (must disband)
        if (team.captainUserId === user.id) {
            throw new SenderError('Captain cannot leave the team. Use disband_tournament_team to disband it.');
        }

        // Verify user is a member of this team
        const participant = (ctx.db.TournamentParticipant as any).primaryKey.find({
            tournamentId: team.tournamentId,
            userId: user.id,
        });
        if (!participant) throw new SenderError('Participant record not found.');
        if (participant.teamGroupId !== teamId) {
            throw new SenderError('You are not a member of this team.');
        }

        // Reset: clear teamGroupId and set participantType to Individual
        ctx.db.TournamentParticipant.delete(participant);
        ctx.db.TournamentParticipant.insert({
            ...participant,
            teamGroupId: undefined,
            participantType: { tag: 'Individual', value: {} } as any,
            ...auditUpdate(ctx, participant, user.id),
        } as any);
    }
);

// ─── disband_tournament_team ──────────────────────────────────────────────────
// Captain disbands the team: resets all members, deletes pending requests, deletes team.
// Only allowed in Registration stage.

export const disband_tournament_team = spacetimedb.reducer(
    {
        teamId: t.u32(),
    },
    (ctx, { teamId }) => {
        const user = getAuthenticatedUser(ctx);

        const team = ctx.db.TournamentTeam.id.find(teamId);
        if (!team) throw new SenderError('Team not found.');
        if (team.captainUserId !== user.id) {
            throw new SenderError('Only the team captain can disband the team.');
        }

        const tournament = ctx.db.Tournament.id.find(team.tournamentId);
        if (!tournament) throw new SenderError('Tournament not found.');
        if (tournament.stage.tag !== 'Registration') {
            throw new SenderError('Teams can only be disbanded during the Registration stage.');
        }

        // Reset all members: clear teamGroupId and set participantType to Individual
        const members = [...ctx.db.TournamentParticipant.tournament_id.filter(team.tournamentId)]
            .filter((p: any) => p.teamGroupId === teamId);
        for (const member of members) {
            ctx.db.TournamentParticipant.delete(member);
            ctx.db.TournamentParticipant.insert({
                ...member,
                teamGroupId: undefined,
                participantType: { tag: 'Individual', value: {} } as any,
                ...auditUpdate(ctx, member, user.id),
            } as any);
        }

        // Delete all pending requests for this team
        const pendingRequests = [...ctx.db.TournamentTeamRequest.team_id.filter(teamId)]
            .filter((r: any) => r.isPending);
        for (const req of pendingRequests) {
            ctx.db.TournamentTeamRequest.delete(req);
        }

        // Delete the team row
        ctx.db.TournamentTeam.id.delete(teamId);
    }
);
