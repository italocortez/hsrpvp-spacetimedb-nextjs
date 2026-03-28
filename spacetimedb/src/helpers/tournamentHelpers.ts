import { SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser, isRoleAtLeast } from './ensurePermissions';

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
 * Cascade-deletes all tournament-scoped infrastructure rows on cancellation.
 * Preserves: TournamentParticipant (audit trail), MatchResultRecord (player history).
 * Deletes: TournamentTeamRequest, TournamentTeam, TournamentAssistant,
 *          BracketMatch, GroupStanding, TournamentPlayerAccount.
 *
 * Order: requests → standings → bracket → player accounts → teams → assistants
 * (child rows before parents to avoid referencing deleted data mid-transaction)
 */
export function cascadeCleanupTournament(ctx: any, tournamentId: number): void {
    // 1. Team requests (via teams — no tournamentId on request table)
    cleanupTeamRequests(ctx, tournamentId);

    // 2. Group standings
    for (const standing of [...ctx.db.GroupStanding.tournament_id.filter(tournamentId)]) {
        ctx.db.GroupStanding.delete(standing);
    }

    // 3. Bracket matches
    for (const match of [...ctx.db.BracketMatch.tournament_id.filter(tournamentId)]) {
        ctx.db.BracketMatch.delete(match);
    }

    // 4. Tournament player accounts (locked roster snapshots)
    const participants = [...ctx.db.TournamentParticipant.tournament_id.filter(tournamentId)];
    for (const p of participants) {
        for (const tpa of [...ctx.db.TournamentPlayerAccount.by_tournament_and_user.filter([tournamentId, p.userId])]) {
            ctx.db.TournamentPlayerAccount.delete(tpa);
        }
    }

    // 5. Tournament teams
    for (const team of [...ctx.db.TournamentTeam.tournament_id.filter(tournamentId)]) {
        ctx.db.TournamentTeam.id.delete(team.id);
    }

    // 6. Tournament assistants
    for (const assistant of [...ctx.db.TournamentAssistant.tournament_id.filter(tournamentId)]) {
        ctx.db.TournamentAssistant.delete(assistant);
    }
}

/**
 * Disbands a captain's team during withdrawal.
 * Resets all members' teamGroupId, deletes pending requests, deletes team row.
 */
export function disbandTeamForWithdrawal(ctx: any, tournamentId: number, captainUserId: number, modifiedById: number): void {
    const team = [...ctx.db.TournamentTeam.captain_user_id.filter(captainUserId)]
        .find((t: any) => t.tournamentId === tournamentId);
    if (!team) return;

    // Reset all members' teamGroupId
    const members = [...ctx.db.TournamentParticipant.tournament_id.filter(tournamentId)]
        .filter((p: any) => p.teamGroupId === team.id);
    for (const member of members) {
        ctx.db.TournamentParticipant.delete(member);
        ctx.db.TournamentParticipant.insert({
            ...member,
            teamGroupId: undefined,
            lastModifiedById: modifiedById,
            lastModifiedDate: ctx.timestamp,
        } as any);
    }

    // Delete pending requests for this team
    for (const req of [...ctx.db.TournamentTeamRequest.team_id.filter(team.id)]) {
        ctx.db.TournamentTeamRequest.delete(req);
    }

    // Delete team row
    ctx.db.TournamentTeam.id.delete(team.id);
}

/**
 * Validates that the transition from Registration -> Seeding is allowed.
 * Requires at least 2 active participants (not Withdrawn, not Disqualified, not waitlisted).
 * For team tournaments (teamSize > 1), requires at least 2 complete teams.
 */
export function validateRegistrationToSeeding(ctx: any, tournamentId: number): void {
    const tournament = ctx.db.Tournament.id.find(tournamentId);
    if (!tournament) throw new SenderError('Tournament not found.');

    const allParticipants = [...ctx.db.TournamentParticipant.tournament_id.filter(tournamentId)];
    const activeParticipants = allParticipants.filter((p: any) =>
        p.status.tag !== 'Withdrawn' &&
        p.status.tag !== 'Disqualified' &&
        !p.isWaitlisted
    );

    if (activeParticipants.length < 2) {
        throw new SenderError('At least 2 active participants are required to advance to Seeding.');
    }

    // For team tournaments, check for at least 2 complete teams
    if (tournament.teamSize > 1) {
        // Count members per teamGroupId
        const teamMemberCounts = new Map<number, number>();
        for (const p of activeParticipants) {
            if (p.teamGroupId !== undefined && p.teamGroupId !== null) {
                const count = teamMemberCounts.get(p.teamGroupId) ?? 0;
                teamMemberCounts.set(p.teamGroupId, count + 1);
            }
        }
        // Count complete teams (member count >= teamSize)
        let completeTeams = 0;
        for (const [, count] of teamMemberCounts) {
            if (count >= tournament.teamSize) completeTeams++;
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

    // Check first-round matches (roundNumber === 1, non-Losers bracket) have at least one participant
    const firstRoundMatches = bracketMatches.filter((m: any) =>
        m.roundNumber === 1 && m.bracketSide.tag !== 'Losers'
    );
    for (const match of firstRoundMatches) {
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
