import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser } from '../helpers/ensurePermissions';
import { ensureLobbyMember, slotTeam, slotIsCoach, slotIsSpectator } from '../helpers/lobbyHelpers';
import { buildConcedeSummary, isForfeitEligible, isThirdPartyReferee } from '../helpers/disconnectHelpers';
import { auditInsert, auditUpdate } from '../helpers/auditColumns';

// ─── Shared concede helper ──────────────────────────────────────────────────
// Used by concede_match, claim_forfeit, and leave_lobby auto-concede.

export function performConcede(
    ctx: any,
    lobby: any,
    losingTeam: string,       // 'Blue' or 'Red'
    triggerUserId: number,
    concedeTrigger: any,       // ConcedeTrigger enum value
    disconnectedMembers?: any[] // For concedeSummary if available
): void {
    // 1. Determine winner (opposite team)
    const winnerTeamSide = losingTeam === 'Blue' ? 'Red' : 'Blue';

    // 2. Find winnerUserId from captain of winning team (or first non-coach player)
    const members = [...ctx.db.LobbyMember.lobby_id.filter(lobby.id)];
    const winnerMembers = members.filter((m: any) =>
        slotTeam(m.lobbySlot) === winnerTeamSide && !slotIsCoach(m.lobbySlot) && !slotIsSpectator(m.lobbySlot)
    );
    const winnerCaptain = winnerMembers.find((m: any) => m.isCaptain) || winnerMembers[0];
    const winnerUserId = winnerCaptain?.userId;

    // 3. Build concedeSummary
    const summary = disconnectedMembers && disconnectedMembers.length > 0
        ? buildConcedeSummary(ctx, lobby, disconnectedMembers, triggerUserId, concedeTrigger.tag)
        : `${losingTeam} team conceded. Trigger: ${concedeTrigger.tag} by userId:${triggerUserId}, stage: ${lobby.stage.tag}`;

    // 4. Create MatchResultRecord
    ctx.db.MatchResultRecord.insert({
        id: 0, // autoInc
        bracketMatchId: lobby.bracketMatchId ?? undefined,
        lobbyId: lobby.id,
        isTournamentControlled: lobby.isTournamentControlled,
        status: { tag: 'Validated', value: {} },
        winnerUserId: winnerUserId,
        mmrProcessedAt: undefined,
        refereeUserId: undefined,
        disputedByUserId: undefined,
        disputeReason: undefined,
        tournamentId: lobby.tournamentId ?? undefined,
        blueConfirmed: true,
        redConfirmed: true,
        refereeFullControl: false,
        matchType: lobby.matchType,
        matchOutcome: { tag: 'Concede', value: {} },
        concedeTrigger: concedeTrigger,
        concedeSummary: summary,
        concedeAtStage: lobby.stage.tag,
        ...auditInsert(ctx, triggerUserId),
    } as any);

    // 5. Set BracketMatch.winnerTeamId if tournament (D-27, D-80 — set but do NOT auto-advance)
    if (lobby.isTournamentControlled && lobby.bracketMatchId) {
        const bracketMatch = ctx.db.BracketMatch.id.find(lobby.bracketMatchId);
        if (bracketMatch) {
            // Find the team ID on the winning side
            const winnerTeamId = winnerTeamSide === 'Blue' ? bracketMatch.team1Id : bracketMatch.team2Id;
            if (winnerTeamId) {
                ctx.db.BracketMatch.id.update({
                    ...bracketMatch,
                    winnerTeamId: winnerTeamId,
                    resultStatus: { tag: 'Validated', value: {} },
                    ...auditUpdate(ctx, bracketMatch, triggerUserId),
                } as any);
            }
        }
    }

    // 6. Transition lobby to AwaitingResult (D-28)
    ctx.db.Lobby.id.update({
        ...lobby,
        stage: { tag: 'AwaitingResult', value: {} },
        lastActivityAt: ctx.timestamp,
        ...auditUpdate(ctx, lobby, triggerUserId),
    } as any);

    // 7. System chat message
    ctx.db.ChatMessage.insert({
        id: 0,
        lobbyId: lobby.id,
        senderUserId: 0,
        senderType: { tag: 'System', value: {} },
        content: `Match conceded. ${winnerTeamSide} team wins. Reason: ${concedeTrigger.tag}.`,
        metadata: undefined,
        anonymousLabel: undefined,
        ...auditInsert(ctx, triggerUserId),
    } as any);

    console.log(`[CONCEDE] Lobby #${lobby.id} conceded. Winner: ${winnerTeamSide}. Trigger: ${concedeTrigger.tag} by userId:${triggerUserId}`);
}

// ─── concede_match ───────────────────────────────────────────────────────────
// Surrender own side. Any policy, Drafting/Equipping/Scoring.
// Per D-26, D-27, D-62.

export const concede_match = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
    },
    (ctx, { lobbyId }) => {
        const user = getAuthenticatedUser(ctx);
        const member = ensureLobbyMember(ctx, lobbyId, user.id);

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) {
            throw new SenderError('Lobby not found.');
        }

        // D-26, D-93: Only active stages
        const activeStages = ['Drafting', 'Equipping', 'Scoring'];
        if (!activeStages.includes(lobby.stage.tag)) {
            throw new SenderError('Concede is only available during Drafting, Equipping, or Scoring.');
        }

        // Not spectator, not coach (D-26)
        if (slotIsSpectator(member.lobbySlot)) {
            throw new SenderError('Spectators cannot concede.');
        }
        if (slotIsCoach(member.lobbySlot)) {
            throw new SenderError('Coaches cannot concede.');
        }

        // D-81: 3rd party referee exclusive concede
        if (lobby.refereeExclusiveConcede) {
            const thirdPartyRef = isThirdPartyReferee(ctx, lobbyId);
            if (thirdPartyRef) {
                // Only the referee can call when exclusive concede is active
                if (thirdPartyRef.userId !== user.id) {
                    throw new SenderError('Only the referee can concede when referee exclusive concede is active.');
                }
            }
        }

        // Determine losing team from caller's slot
        const losingTeam = slotTeam(member.lobbySlot);
        if (!losingTeam) {
            throw new SenderError('Cannot determine team for concede.');
        }

        // Determine concedeTrigger (D-70)
        const concedeTrigger = member.isReferee
            ? { tag: 'RefereeDecision', value: {} }
            : { tag: 'VoluntaryLeave', value: {} };

        performConcede(ctx, lobby, losingTeam, user.id, concedeTrigger);
    }
);

// ─── claim_forfeit ───────────────────────────────────────────────────────────
// Claim forfeit when all opposing team players are offline > grace period.
// Standard policy only. Per D-15, D-16, D-61.

export const claim_forfeit = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
    },
    (ctx, { lobbyId }) => {
        const user = getAuthenticatedUser(ctx);
        const member = ensureLobbyMember(ctx, lobbyId, user.id);

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) {
            throw new SenderError('Lobby not found.');
        }

        // Only active stages
        const activeStages = ['Drafting', 'Equipping', 'Scoring'];
        if (!activeStages.includes(lobby.stage.tag)) {
            throw new SenderError('Forfeit claim is only available during Drafting, Equipping, or Scoring.');
        }

        // Not spectator, not coach
        if (slotIsSpectator(member.lobbySlot)) {
            throw new SenderError('Spectators cannot claim forfeit.');
        }
        if (slotIsCoach(member.lobbySlot)) {
            throw new SenderError('Coaches cannot claim forfeit.');
        }

        // D-15: Standard policy only
        if (lobby.disconnectPolicy.tag !== 'Standard') {
            throw new SenderError('Forfeit claim is only available under Standard disconnect policy.');
        }

        // D-81: 3rd party referee exclusive concede
        if (lobby.refereeExclusiveConcede) {
            const thirdPartyRef = isThirdPartyReferee(ctx, lobbyId);
            if (thirdPartyRef) {
                if (thirdPartyRef.userId !== user.id) {
                    throw new SenderError('Only the referee can claim forfeit when referee exclusive concede is active.');
                }
            }
        }

        // Determine caller's team and target (opposing) team
        const callerTeam = slotTeam(member.lobbySlot);
        if (!callerTeam) {
            throw new SenderError('Cannot determine team for forfeit claim.');
        }
        const targetTeam = callerTeam === 'Blue' ? 'Red' : 'Blue';

        // D-16: Check forfeit eligibility — all opposing team players offline > grace
        if (!isForfeitEligible(ctx, lobby, targetTeam, ctx.timestamp)) {
            throw new SenderError('Opposing team is not eligible for forfeit. At least one player is still connected or grace period has not expired.');
        }

        // Determine concedeTrigger
        const concedeTrigger = member.isReferee
            ? { tag: 'RefereeDecision', value: {} }
            : { tag: 'Disconnect', value: {} };

        // Get disconnected members for summary
        const disconnectedMembers = [...ctx.db.LobbyMember.lobby_id.filter(lobbyId)]
            .filter((m: any) => slotTeam(m.lobbySlot) === targetTeam && !slotIsCoach(m.lobbySlot) && !slotIsSpectator(m.lobbySlot) && !m.isOnline);

        performConcede(ctx, lobby, targetTeam, user.id, concedeTrigger, disconnectedMembers);
    }
);

// ─── defer_match ─────────────────────────────────────────────────────────────
// Shelve match to AwaitingResult for TO/admin resolution.
// Deferred policy only. Per D-18, D-19, D-20, D-63.

export const defer_match = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
    },
    (ctx, { lobbyId }) => {
        const user = getAuthenticatedUser(ctx);
        const member = ensureLobbyMember(ctx, lobbyId, user.id);

        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) {
            throw new SenderError('Lobby not found.');
        }

        // Only active stages
        const activeStages = ['Drafting', 'Equipping', 'Scoring'];
        if (!activeStages.includes(lobby.stage.tag)) {
            throw new SenderError('Defer is only available during Drafting, Equipping, or Scoring.');
        }

        // Not spectator, not coach
        if (slotIsSpectator(member.lobbySlot)) {
            throw new SenderError('Spectators cannot defer a match.');
        }
        if (slotIsCoach(member.lobbySlot)) {
            throw new SenderError('Coaches cannot defer a match.');
        }

        // D-18: Deferred policy only
        if (lobby.disconnectPolicy.tag !== 'Deferred') {
            throw new SenderError('Defer is only available under Deferred disconnect policy.');
        }

        // D-81: 3rd party referee exclusive concede
        if (lobby.refereeExclusiveConcede) {
            const thirdPartyRef = isThirdPartyReferee(ctx, lobbyId);
            if (thirdPartyRef) {
                if (thirdPartyRef.userId !== user.id) {
                    throw new SenderError('Only the referee can defer when referee exclusive concede is active.');
                }
            }
        }

        // Get all disconnected members (any team) for summary
        const disconnectedMembers = [...ctx.db.LobbyMember.lobby_id.filter(lobbyId)]
            .filter((m: any) => !m.isOnline && !slotIsCoach(m.lobbySlot) && !slotIsSpectator(m.lobbySlot) && !m.voluntarilyLeft);

        // Build concedeSummary (D-21)
        const summary = buildConcedeSummary(ctx, lobby, disconnectedMembers, user.id, 'DeferMatch');

        // Create MatchResultRecord with NO winner (deferred, D-22)
        ctx.db.MatchResultRecord.insert({
            id: 0,
            bracketMatchId: lobby.bracketMatchId ?? undefined,
            lobbyId: lobby.id,
            isTournamentControlled: lobby.isTournamentControlled,
            status: { tag: 'Pending', value: {} },
            winnerUserId: undefined,
            mmrProcessedAt: undefined,
            refereeUserId: undefined,
            disputedByUserId: undefined,
            disputeReason: undefined,
            tournamentId: lobby.tournamentId ?? undefined,
            blueConfirmed: false,
            redConfirmed: false,
            refereeFullControl: false,
            matchType: lobby.matchType,
            matchOutcome: undefined,  // Not yet determined
            concedeTrigger: undefined,
            concedeSummary: summary,
            concedeAtStage: lobby.stage.tag,
            ...auditInsert(ctx, user.id),
        } as any);

        // Transition lobby to AwaitingResult (D-22)
        ctx.db.Lobby.id.update({
            ...lobby,
            stage: { tag: 'AwaitingResult', value: {} },
            lastActivityAt: ctx.timestamp,
            ...auditUpdate(ctx, lobby, user.id),
        } as any);

        // System chat message
        ctx.db.ChatMessage.insert({
            id: 0,
            lobbyId: lobby.id,
            senderUserId: 0,
            senderType: { tag: 'System', value: {} },
            content: 'Match deferred to admin/TO resolution.',
            metadata: undefined,
            anonymousLabel: undefined,
            ...auditInsert(ctx, user.id),
        } as any);

        console.log(`[DEFER] Lobby #${lobby.id} deferred to AwaitingResult by userId:${user.id}`);
    }
);
