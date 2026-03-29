import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser } from '../helpers/ensurePermissions';
import { ensureTournamentAccess, disbandTeamForWithdrawal } from '../helpers/tournamentHelpers';
import { auditInsert, auditUpdate } from '../helpers/auditColumns';
import { deleteUserInvitesForTournament } from '../helpers/calendarCascade';

// ─── register_for_tournament ──────────────────────────────────────────────────
// Registers the authenticated user in a tournament.
// Handles waitlist logic, approval requirements, and all registration validations.

export const register_for_tournament = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
        teamGroupId: t.u32(),
    },
    (ctx, { tournamentId, teamGroupId }) => {
        const user = getAuthenticatedUser(ctx);

        // Tournament must exist and be in Registration or Seeding stage
        const tournament = ctx.db.Tournament.id.find(tournamentId);
        if (!tournament) throw new SenderError('Tournament not found.');
        if (tournament.stage.tag !== 'Registration' && tournament.stage.tag !== 'Seeding') {
            throw new SenderError('Tournament is not accepting registrations.');
        }

        // Player must not already be registered
        const existing = [...ctx.db.TournamentParticipant.by_tournament_and_user.filter([tournamentId, user.id])][0];
        if (existing) {
            throw new SenderError('You are already registered for this tournament.');
        }

        // Check requireVerified
        if (tournament.requireVerified && user.isGuest) {
            throw new SenderError('This tournament requires a verified account. Link your Discord first.');
        }

        // Check requireRoster
        if (tournament.requireRoster) {
            const hasActiveAccount = [...ctx.db.HsrAccount.user_id.filter(user.id)].some((a: any) => a.isActive);
            if (!hasActiveAccount) {
                throw new SenderError('This tournament requires an active HSR account in your roster.');
            }
        }

        // MMR check deferred to Phase 5 — allow all participants for now
        // if (tournament.minimumMmr && tournament.minimumMmr > 0) { ... }

        // If teamGroupId specified, validate the team exists and belongs to this tournament
        if (teamGroupId !== 0) {
            const team = ctx.db.TournamentTeam.id.find(teamGroupId);
            if (!team) throw new SenderError('Tournament team not found.');
            if (team.tournamentId !== tournamentId) {
                throw new SenderError('Team does not belong to this tournament.');
            }

            // Validate team has room
            const teamMemberCount = [...ctx.db.TournamentParticipant.tournament_id.filter(tournamentId)]
                .filter((p: any) => p.teamGroupId === teamGroupId && !p.isWaitlisted).length;
            if (teamMemberCount >= tournament.teamSize) {
                throw new SenderError('Team is full.');
            }
        }

        // Count active (non-waitlisted) participants
        const activeCount = [...ctx.db.TournamentParticipant.tournament_id.filter(tournamentId)]
            .filter((p: any) => !p.isWaitlisted).length;

        let isWaitlisted = false;
        if (activeCount >= tournament.maxParticipants) {
            if (tournament.waitlistEnabled) {
                isWaitlisted = true;
            } else {
                throw new SenderError('Tournament is full.');
            }
        }

        // Determine approval timestamp
        const approvedByToAt = tournament.requireApproval ? undefined : ctx.timestamp;

        // Get active HSR account id if any
        const activeAccount = [...ctx.db.HsrAccount.user_id.filter(user.id)].find((a: any) => a.isActive);
        const hsrAccountId = activeAccount ? activeAccount.id : undefined;

        ctx.db.TournamentParticipant.insert({
            tournamentId,
            userId: user.id,
            teamGroupId: teamGroupId !== 0 ? teamGroupId : undefined,
            status: { tag: 'Registered', value: {} } as any,
            anonymousAlias: undefined,
            isWaitlisted,
            allowRandomTeamAssignment: false,
            approvedByToAt,
            hsrAccountId,
            ...auditInsert(ctx, user.id),
        } as any);

        // Auto-create TournamentTeam for solo tournaments (teamSize === 1)
        // Solo players are also "teams" for bracket purposes — the team is invisible to the user
        if (tournament.teamSize === 1 && teamGroupId === 0) {
            const newTeam = ctx.db.TournamentTeam.insert({
                id: 0,
                tournamentId,
                name: user.displayName,
                captainUserId: user.id,
                seedNumber: undefined,
                ...auditInsert(ctx, user.id),
            } as any);

            // Update the participant to link to the auto-created team
            const insertedParticipant = [...ctx.db.TournamentParticipant.by_tournament_and_user.filter([tournamentId, user.id])][0];
            if (insertedParticipant) {
                ctx.db.TournamentParticipant.delete(insertedParticipant);
                ctx.db.TournamentParticipant.insert({
                    ...insertedParticipant,
                    teamGroupId: newTeam.id,
                    ...auditUpdate(ctx, insertedParticipant, user.id),
                } as any);
            }
        }

        // Lock in player's HSR accounts for this tournament (per D-21)
        // All accounts are locked — during tournament matches, pick validation
        // checks against these locked accounts, not whatever account is active at match time.
        const allAccounts = [...ctx.db.HsrAccount.user_id.filter(user.id)];
        for (const account of allAccounts) {
            ctx.db.TournamentPlayerAccount.insert({
                tournamentId,
                userId: user.id,
                hsrAccountId: account.id,
                ...auditInsert(ctx, user.id),
            } as any);
        }
    }
);

// ─── withdraw_from_tournament ─────────────────────────────────────────────────
// Sets the participant's status to Withdrawn.
// Does NOT delete the row (kept for audit/history).
// Only allowed in Registration or Seeding stage.

export const withdraw_from_tournament = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
    },
    (ctx, { tournamentId }) => {
        const user = getAuthenticatedUser(ctx);

        const tournament = ctx.db.Tournament.id.find(tournamentId);
        if (!tournament) throw new SenderError('Tournament not found.');
        if (tournament.stage.tag !== 'Registration' && tournament.stage.tag !== 'Seeding') {
            throw new SenderError('Cannot withdraw during this stage. Contact the organizer to be disqualified.');
        }

        const participant = [...ctx.db.TournamentParticipant.by_tournament_and_user.filter([tournamentId, user.id])][0];
        if (!participant) throw new SenderError('You are not registered for this tournament.');
        if (participant.status.tag === 'Withdrawn') throw new SenderError('Already withdrawn.');

        // If captain, auto-disband team before withdrawal (may modify participant row)
        disbandTeamForWithdrawal(ctx, tournamentId, user.id, user.id);

        // Clean up user's pending team requests in this tournament
        const teams = [...ctx.db.TournamentTeam.tournament_id.filter(tournamentId)];
        for (const team of teams) {
            const req = [...ctx.db.TournamentTeamRequest.by_team_and_user.filter([team.id, user.id])][0];
            if (req) ctx.db.TournamentTeamRequest.delete(req);
        }

        // Delete the withdrawing player's calendar invites for this tournament's scheduled matches (D-24)
        deleteUserInvitesForTournament(ctx, user.id, tournamentId);

        // Re-read participant — disbandTeamForWithdrawal may have delete+re-inserted the row
        const current = [...ctx.db.TournamentParticipant.by_tournament_and_user.filter([tournamentId, user.id])][0];
        if (!current) throw new SenderError('Participant record not found.');

        // Delete + re-insert pattern for composite PK table
        ctx.db.TournamentParticipant.delete(current);
        ctx.db.TournamentParticipant.insert({
            ...current,
            teamGroupId: undefined,
            status: { tag: 'Withdrawn', value: {} } as any,
            ...auditUpdate(ctx, current, user.id),
        } as any);

        // Clean up locked accounts on withdrawal (per D-21)
        const lockedAccounts = [...ctx.db.TournamentPlayerAccount.by_tournament_and_user.filter([tournamentId, user.id])];
        for (const la of lockedAccounts) {
            ctx.db.TournamentPlayerAccount.delete(la);
        }
    }
);

// ─── approve_participant ──────────────────────────────────────────────────────
// Approves a pending tournament participant (sets approvedByToAt).
// Permission: TO/Assistant/Mod+

export const approve_participant = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
        userId: t.u32(),
    },
    (ctx, { tournamentId, userId }) => {
        const { user } = ensureTournamentAccess(ctx, tournamentId);

        const participant = [...ctx.db.TournamentParticipant.by_tournament_and_user.filter([tournamentId, userId])][0];
        if (!participant) throw new SenderError('Participant not found.');
        if (participant.approvedByToAt !== undefined) {
            throw new SenderError('Participant is already approved.');
        }

        // Delete + re-insert pattern for composite PK table
        ctx.db.TournamentParticipant.delete(participant);
        ctx.db.TournamentParticipant.insert({
            ...participant,
            approvedByToAt: ctx.timestamp,
            ...auditUpdate(ctx, participant, user.id),
        } as any);
    }
);

// ─── waitlist_promote ─────────────────────────────────────────────────────────
// Moves a waitlisted participant into the active participant list.
// Permission: TO/Assistant/Mod+

export const waitlist_promote = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
        userId: t.u32(),
    },
    (ctx, { tournamentId, userId }) => {
        const { user } = ensureTournamentAccess(ctx, tournamentId);

        const participant = [...ctx.db.TournamentParticipant.by_tournament_and_user.filter([tournamentId, userId])][0];
        if (!participant) throw new SenderError('Participant not found.');
        if (!participant.isWaitlisted) {
            throw new SenderError('Participant is not on the waitlist.');
        }

        // Delete + re-insert pattern for composite PK table
        // Promoting from waitlist implies approval — TO explicitly chose this person
        ctx.db.TournamentParticipant.delete(participant);
        ctx.db.TournamentParticipant.insert({
            ...participant,
            isWaitlisted: false,
            approvedByToAt: participant.approvedByToAt ?? ctx.timestamp,
            ...auditUpdate(ctx, participant, user.id),
        } as any);
    }
);
