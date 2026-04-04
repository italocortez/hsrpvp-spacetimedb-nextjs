import { SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser, isRoleAtLeast } from './ensurePermissions';
import { auditUpdate } from './auditColumns';
import { deleteCalendarEventsForTournament } from './calendarCascade';

// Forward-only stage order (Cancelled is handled separately as a terminal transition)
const STAGE_ORDER = ['Draft', 'Registration', 'Seeding', 'InProgress', 'Completed'];

/**
 * Validates a tournament stage transition.
 * Transitions must be forward-only and cannot skip stages.
 * Cancellation is always allowed from any non-terminal state.
 */
export function validateStageTransition(currentTag: string, nextTag: string): void {
    // Cancellation is always allowed from any non-terminal state
    if (nextTag === 'Cancelled') {
        if (currentTag === 'Completed' || currentTag === 'Cancelled') {
            throw new SenderError(`Cannot cancel a tournament that is already ${currentTag}.`);
        }
        return;
    }
    const currentIdx = STAGE_ORDER.indexOf(currentTag);
    const nextIdx = STAGE_ORDER.indexOf(nextTag);
    if (currentIdx === -1 || nextIdx === -1) {
        throw new SenderError(`Invalid stage: ${currentTag} or ${nextTag}`);
    }
    if (nextIdx <= currentIdx) {
        throw new SenderError(`Cannot transition from ${currentTag} to ${nextTag} (forward-only).`);
    }
    if (nextIdx > currentIdx + 1) {
        throw new SenderError(`Cannot skip stages: must go from ${currentTag} to ${STAGE_ORDER[currentIdx + 1]}.`);
    }
}

/**
 * Verifies the caller has access to manage the given tournament.
 * Access is granted to: Admin/Moderator (always), tournament organizer, tournament assistants.
 */
export function ensureTournamentAccess(ctx: any, tournamentId: number): { user: any; tournament: any } {
    const user = getAuthenticatedUser(ctx);
    const tournament = ctx.db.Tournament.id.find(tournamentId);
    if (!tournament) throw new SenderError('Tournament not found.');

    // Admin/Moderator always has access
    if (isRoleAtLeast(user.role, 'Moderator')) return { user, tournament };

    // TO who owns the tournament
    if (tournament.organizerId === user.id) return { user, tournament };

    // Tournament assistant
    const assistant = [...ctx.db.TournamentAssistant.by_tournament_and_user.filter([tournamentId, user.id])][0];
    if (assistant) return { user, tournament };

    throw new SenderError('Forbidden: Not authorized for this tournament.');
}

/**
 * Deletes all pending TournamentTeamRequest rows for a tournament.
 * Iterates teams → deletes each team's requests. Called during stage transitions
 * (Registration → Seeding) and cancellation to prevent orphaned request rows.
 */
export function cleanupTeamRequests(ctx: any, tournamentId: number): void {
    const teams = [...ctx.db.TournamentTeam.tournament_id.filter(tournamentId)];
    for (const team of teams) {
        for (const req of [...ctx.db.TournamentTeamRequest.team_id.filter(team.id)]) {
            ctx.db.TournamentTeamRequest.delete(req);
        }
    }
}

/**
 * Transfers captain role within a TournamentTeam to the next lowest userId member
 * (excluding the leaving/DQ'd user). Deterministic: lowest userId wins.
 *
 * Returns true if captain was transferred, false if no other members exist.
 * When false, the caller is responsible for destroying the team if appropriate.
 */
export function transferTournamentCaptain(ctx: any, teamId: number, leavingUserId: number, actingUserId: number): boolean {
    const team = ctx.db.TournamentTeam.id.find(teamId);
    if (!team || team.captainUserId !== leavingUserId) return false; // not captain

    const otherMembers = [...ctx.db.TournamentTeamMember.team_id.filter(teamId)]
        .filter((m: any) => m.userId !== leavingUserId)
        .sort((a: any, b: any) => a.userId - b.userId); // deterministic: lowest userId

    if (otherMembers.length > 0) {
        ctx.db.TournamentTeam.id.update({
            ...team,
            captainUserId: otherMembers[0].userId,
            ...auditUpdate(ctx, team, actingUserId),
        } as any);
        return true; // captain transferred
    }
    return false; // no one to transfer to
}

/**
 * Cascade-deletes all tournament-scoped infrastructure rows on cancellation.
 * Preserves: TournamentEnrolled (audit trail), MatchResultRecord (player history).
 * Deletes: TournamentTeamRequest, TournamentTeamMember, TournamentTeam, TournamentAssistant,
 *          BracketMatch, GroupStanding, TournamentPlayerAccount.
 *
 * Order: requests → standings → calendar → bracket → player accounts → team members → teams → assistants
 * (child rows before parents to avoid referencing deleted data mid-transaction)
 */
export function cascadeCleanupTournament(ctx: any, tournamentId: number): void {
    // 1. Team requests (via teams — no tournamentId on request table)
    cleanupTeamRequests(ctx, tournamentId);

    // 2. Group standings
    for (const standing of [...ctx.db.GroupStanding.tournament_id.filter(tournamentId)]) {
        ctx.db.GroupStanding.delete(standing);
    }

    // 3. Calendar events linked to tournament bracket matches (D-21)
    //    Must run before bracket match rows are deleted, since it reads BracketMatch to find linked events
    deleteCalendarEventsForTournament(ctx, tournamentId);

    // 4. Bracket matches
    for (const match of [...ctx.db.BracketMatch.tournament_id.filter(tournamentId)]) {
        ctx.db.BracketMatch.delete(match);
    }

    // 5. Tournament player accounts (locked roster snapshots)
    const enrolledRows = [...ctx.db.TournamentEnrolled.tournament_id.filter(tournamentId)];
    for (const e of enrolledRows) {
        for (const tpa of [...ctx.db.TournamentPlayerAccount.by_tournament_and_user.filter([tournamentId, e.userId])]) {
            ctx.db.TournamentPlayerAccount.delete(tpa);
        }
    }

    // 6. TournamentTeamMember rows — delete before TournamentTeam (child before parent)
    for (const team of [...ctx.db.TournamentTeam.tournament_id.filter(tournamentId)]) {
        for (const member of [...ctx.db.TournamentTeamMember.team_id.filter(team.id)]) {
            ctx.db.TournamentTeamMember.delete(member);
        }
    }

    // 7. Tournament teams
    for (const team of [...ctx.db.TournamentTeam.tournament_id.filter(tournamentId)]) {
        ctx.db.TournamentTeam.id.delete(team.id);
    }

    // 8. Tournament assistants
    for (const assistant of [...ctx.db.TournamentAssistant.tournament_id.filter(tournamentId)]) {
        ctx.db.TournamentAssistant.delete(assistant);
    }
}

/**
 * Validates that the transition from Registration -> Seeding is allowed.
 * Requires at least 2 active participants (not Withdrawn, not Disqualified, not waitlisted).
 * For team tournaments (teamSize > 1), requires at least 2 complete teams.
 */
export function validateRegistrationToSeeding(ctx: any, tournamentId: number): void {
    const tournament = ctx.db.Tournament.id.find(tournamentId);
    if (!tournament) throw new SenderError('Tournament not found.');

    const allEnrolled = [...ctx.db.TournamentEnrolled.tournament_id.filter(tournamentId)];
    const activeEnrolled = allEnrolled.filter((p: any) =>
        p.status.tag !== 'Withdrawn' &&
        p.status.tag !== 'Disqualified' &&
        !p.isWaitlisted
    );

    if (activeEnrolled.length < 2) {
        throw new SenderError('At least 2 active participants are required to advance to Seeding.');
    }

    // For team tournaments, check for at least 2 complete teams
    if (tournament.teamSize > 1) {
        // Count members per team via TournamentTeamMember
        const teams = [...ctx.db.TournamentTeam.tournament_id.filter(tournamentId)];
        let completeTeams = 0;
        for (const team of teams) {
            const memberCount = [...ctx.db.TournamentTeamMember.team_id.filter(team.id)].length;
            if (memberCount >= tournament.teamSize) completeTeams++;
        }
        if (completeTeams < 2) {
            throw new SenderError('At least 2 complete teams are required to advance to Seeding.');
        }
    }
}

/**
 * Validates that the transition from Seeding -> InProgress is allowed.
 * Requires bracket rows to exist. All first-round matches (non-Losers) must have at least one participant.
 * Group-format tournaments must have GroupStanding rows.
 */
export function validateSeedingToInProgress(ctx: any, tournamentId: number): void {
    const tournament = ctx.db.Tournament.id.find(tournamentId);
    if (!tournament) throw new SenderError('Tournament not found.');

    const bracketMatches = [...ctx.db.BracketMatch.tournament_id.filter(tournamentId)];
    if (bracketMatches.length === 0) {
        throw new SenderError('Bracket must be generated before advancing to InProgress. Call generate_bracket first.');
    }

    // Check first-round matches (roundNumber === 1, non-Losers bracket) have at least one participant.
    // For hybrid formats (GroupIntoSingleElim, GroupIntoDoubleElim), exclude elimination R1 matches —
    // those slots are intentionally empty at InProgress start and get filled by advance_group_to_elimination.
    const formatTag2 = tournament.format.tag as string;
    const isHybrid = formatTag2 === 'GroupIntoSingleElim' || formatTag2 === 'GroupIntoDoubleElim';

    const firstRoundMatches = bracketMatches.filter((m: any) =>
        m.roundNumber === 1 && m.bracketSide.tag !== 'Losers'
    );
    for (const match of firstRoundMatches) {
        // For hybrid formats, only check group matches — elimination slots are empty by design
        if (isHybrid && match.bracketSide.tag !== 'Group') continue;

        if (match.team1Id === undefined && match.team2Id === undefined) {
            throw new SenderError(`Match ${match.id} has no participants. Seed all bracket slots before advancing.`);
        }
    }

    // For group-format tournaments, verify GroupStanding rows exist
    const formatTag = tournament.format.tag as string;
    if (formatTag === 'GroupOnly' || formatTag === 'GroupIntoSingleElim' || formatTag === 'GroupIntoDoubleElim') {
        const standings = [...ctx.db.GroupStanding.tournament_id.filter(tournamentId)];
        if (standings.length === 0) {
            throw new SenderError('Group standings must be generated before advancing to InProgress.');
        }
    }
}
