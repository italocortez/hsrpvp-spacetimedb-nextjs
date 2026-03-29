// ─── Anonymous + History Views ────────────────────────────────────────────────
// Per-client views enforcing server-side anonymous mode (D-69/D-92/D-93).
//
// 1. view_my_lobby_chat        — anonymized ChatMessage rows (D-92)
// 2. view_my_lobby_members     — anonymized LobbyMember rows (D-92)
// 3. view_my_match_steps       — anonymized MatchSessionStep rows (D-92)
// 4. view_my_match_participants — anonymized MatchResultParticipant rows (D-92)
// 5. view_match_history        — visibility-filtered MatchSessionHistory (D-93)

import spacetimedb from '../schema';
import { t } from 'spacetimedb/server';
import { ChatSenderType, TeamLabel, ActionType, GameMode } from '../types/enums';
import { StepPayload } from '../types/structs';
import { shouldAnonymize } from '../helpers/anonymousHelpers';
import { computeAnonymousLabel } from '../helpers/anonymousLabels';
import { ChatMessage } from '../tables/chatMessage';
import { LobbyMember } from '../tables/lobbyMember';
import { MatchSessionStep } from '../tables/matchSessionStep';
import { MatchResultParticipant } from '../tables/matchResultParticipant';
import { MatchSessionHistory } from '../tables/matchSessionHistory';
import { MatchParticipantHistory } from '../tables/matchParticipantHistory';

// ---------------------------------------------------------------------------
// 1. view_my_lobby_chat (per D-92)
//    Returns ChatMessage rows for lobbies the caller is in.
//    Anonymizes senderUserId (→ 0) and resolves anonymousLabel based on
//    lobby anonymous settings and the caller's team membership.
// ---------------------------------------------------------------------------

const AnonymousChatRow = t.object('AnonymousChatRow', {
    id: t.u32(),
    lobbyId: t.u32(),
    senderUserId: t.u32(),
    senderType: ChatSenderType,
    content: t.string(),
    metadata: t.string().optional(),
    anonymousLabel: t.string().optional(),
    createdDate: t.timestamp(),
});

spacetimedb.view(
    { name: 'view_my_lobby_chat', public: true },
    t.array(AnonymousChatRow),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const callerUserId = mapping.userId;

        // Get all lobbies the caller is in via user_id index
        const memberships = [...ctx.db.LobbyMember.user_id.filter(callerUserId)];

        const results: any[] = [];

        for (const membership of memberships) {
            const lobbyId = membership.lobbyId;
            const lobby = ctx.db.Lobby.id.find(lobbyId);

            // Get all ChatMessage rows for this lobby via lobby_id index
            for (const msg of ctx.db.ChatMessage.lobby_id.filter(lobbyId)) {
                // Determine if this sender should be anonymized from the caller's perspective
                const anonymize = msg.senderType.tag !== 'System' &&
                    shouldAnonymize(ctx, lobbyId, msg.senderUserId, lobby ?? undefined);

                results.push({
                    id: msg.id,
                    lobbyId: msg.lobbyId,
                    senderUserId: anonymize ? 0 : msg.senderUserId,
                    senderType: msg.senderType,
                    content: msg.content,
                    metadata: msg.metadata,
                    // Use the pre-computed anonymousLabel stored on the message row
                    anonymousLabel: anonymize ? msg.anonymousLabel : undefined,
                    createdDate: msg.createdDate,
                });
            }
        }

        return results;
    }
);

// ---------------------------------------------------------------------------
// 2. view_my_lobby_members (per D-92)
//    Returns LobbyMember rows for the caller's lobbies with anonymized
//    userId and displayName for opponents when anonymous mode is active.
// ---------------------------------------------------------------------------

const AnonymousLobbyMemberRow = t.object('AnonymousLobbyMemberRow', {
    lobbyId: t.u32(),
    userId: t.u32(),
    isOnline: t.bool(),
    teamSlot: TeamLabel,
    isReferee: t.bool(),
    isCoach: t.bool(),
    isConfirmed: t.bool(),
    isCaptain: t.bool(),
    displayName: t.string(),
    anonymousLabel: t.string().optional(),
});

spacetimedb.view(
    { name: 'view_my_lobby_members', public: true },
    t.array(AnonymousLobbyMemberRow),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const callerUserId = mapping.userId;

        // Get all lobbies the caller is in
        const memberships = [...ctx.db.LobbyMember.user_id.filter(callerUserId)];

        const results: any[] = [];

        for (const myMembership of memberships) {
            const lobbyId = myMembership.lobbyId;
            const lobby = ctx.db.Lobby.id.find(lobbyId);

            // Get all members in this lobby via lobby_id index
            for (const member of ctx.db.LobbyMember.lobby_id.filter(lobbyId)) {
                const anonymize = shouldAnonymize(ctx, lobbyId, member.userId, lobby ?? undefined);

                // Resolve display name from User table
                const user = ctx.db.User.id.find(member.userId);
                const realDisplayName = user ? user.displayName : `User#${member.userId}`;

                // Compute anonymous label if anonymizing
                const anonLabel = anonymize
                    ? computeAnonymousLabel(ctx, lobbyId, member.userId)
                    : undefined;

                results.push({
                    lobbyId: member.lobbyId,
                    userId: anonymize ? 0 : member.userId,
                    isOnline: member.isOnline,
                    teamSlot: member.teamSlot,
                    isReferee: member.isReferee,
                    isCoach: member.isCoach,
                    isConfirmed: member.isConfirmed,
                    isCaptain: member.isCaptain,
                    displayName: anonymize ? (anonLabel ?? 'Unknown') : realDisplayName,
                    anonymousLabel: anonLabel,
                });
            }
        }

        return results;
    }
);

// ---------------------------------------------------------------------------
// 3. view_my_match_steps (per D-92)
//    Returns MatchSessionStep rows for the caller's active lobbies.
//    Anonymizes actorUserId for opponent actors when anonymous mode is on.
// ---------------------------------------------------------------------------

const AnonymousMatchStepRow = t.object('AnonymousMatchStepRow', {
    id: t.u32(),
    lobbyId: t.u32(),
    sequence: t.u32(),
    actorUserId: t.u32(),
    anonymousLabel: t.string().optional(),
    actorSlot: TeamLabel,
    action: ActionType,
    payload: StepPayload,
    timestamp: t.timestamp(),
});

spacetimedb.view(
    { name: 'view_my_match_steps', public: true },
    t.array(AnonymousMatchStepRow),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const callerUserId = mapping.userId;

        // Get all lobbies the caller is in
        const memberships = [...ctx.db.LobbyMember.user_id.filter(callerUserId)];

        const results: any[] = [];

        for (const membership of memberships) {
            const lobbyId = membership.lobbyId;
            const lobby = ctx.db.Lobby.id.find(lobbyId);

            // Get all steps for this lobby via lobby_id index
            for (const step of ctx.db.MatchSessionStep.lobby_id.filter(lobbyId)) {
                const anonymize = shouldAnonymize(ctx, lobbyId, step.actorUserId, lobby ?? undefined);

                results.push({
                    id: step.id,
                    lobbyId: step.lobbyId,
                    sequence: step.sequence,
                    actorUserId: anonymize ? 0 : step.actorUserId,
                    anonymousLabel: anonymize ? step.anonymousLabel : undefined,
                    actorSlot: step.actorSlot,
                    action: step.action,
                    payload: step.payload,
                    timestamp: step.timestamp,
                });
            }
        }

        return results;
    }
);

// ---------------------------------------------------------------------------
// 4. view_my_match_participants (per D-92)
//    Returns MatchResultParticipant rows for the caller's active lobby matches.
//    Anonymizes userId for opponent participants when anonymous mode is on.
// ---------------------------------------------------------------------------

const AnonymousMatchParticipantRow = t.object('AnonymousMatchParticipantRow', {
    matchResultId: t.u32(),
    userId: t.u32(),
    teamSide: TeamLabel,
    isCaptain: t.bool(),
    anonymousLabel: t.string().optional(),
});

spacetimedb.view(
    { name: 'view_my_match_participants', public: true },
    t.array(AnonymousMatchParticipantRow),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
        if (!mapping) return [];
        const callerUserId = mapping.userId;

        // Get all lobbies the caller is in
        const memberships = [...ctx.db.LobbyMember.user_id.filter(callerUserId)];

        const results: any[] = [];

        for (const membership of memberships) {
            const lobbyId = membership.lobbyId;
            const lobby = ctx.db.Lobby.id.find(lobbyId);

            // Find MatchResultRecord for this lobby
            const matchResult = [...ctx.db.MatchResultRecord.lobby_id.filter(lobbyId)][0];
            if (!matchResult) continue;

            // Get all participants for this match via match_result_id index
            for (const participant of ctx.db.MatchResultParticipant.match_result_id.filter(matchResult.id)) {
                const anonymize = shouldAnonymize(ctx, lobbyId, participant.userId, lobby ?? undefined);

                // Compute anonymous label for anonymized participants
                const anonLabel = anonymize
                    ? computeAnonymousLabel(ctx, lobbyId, participant.userId)
                    : undefined;

                results.push({
                    matchResultId: participant.matchResultId,
                    userId: anonymize ? 0 : participant.userId,
                    teamSide: participant.teamSide,
                    isCaptain: participant.isCaptain,
                    anonymousLabel: anonLabel,
                });
            }
        }

        return results;
    }
);

// ---------------------------------------------------------------------------
// 5. view_match_history (per D-93)
//    Returns MatchSessionHistory rows where:
//      - isPubliclyVisible === true (standalone + completed tournament matches), OR
//      - Caller is a participant (MatchParticipantHistory lookup)
//    Prevents tournament scouting during active tournaments (D-72/D-73).
//
//    Implementation note: MatchSessionHistory has no isPubliclyVisible index.
//    We scan via 3 btree filters (one per GameMode) to avoid .iter() and
//    combine with participated matchHistoryIds from MatchParticipantHistory.
// ---------------------------------------------------------------------------

spacetimedb.view(
    { name: 'view_match_history', public: true },
    t.array(MatchSessionHistory.rowType),
    (ctx) => {
        const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);

        // Build a set of matchHistoryIds the caller participated in
        const participatedIds = new Set<number>();
        if (mapping) {
            const callerUserId = mapping.userId;
            for (const participantRow of ctx.db.MatchParticipantHistory.by_user.filter(callerUserId)) {
                participatedIds.add(participantRow.matchHistoryId);
            }
        }

        const results: any[] = [];
        const seenIds = new Set<number>();

        // Scan MatchSessionHistory via all 3 GameMode btree index entries
        // This covers all rows without using .iter()
        const gameModes: any[] = [
            { tag: 'MemoryOfChaos', value: {} },
            { tag: 'ApocalypticShadow', value: {} },
            { tag: 'AnomalyArbitration', value: {} },
        ];

        for (const gm of gameModes) {
            for (const history of ctx.db.MatchSessionHistory.game_mode.filter(gm)) {
                if (seenIds.has(history.id)) continue;
                seenIds.add(history.id);

                // Include if: publicly visible OR caller participated
                if (history.isPubliclyVisible || participatedIds.has(history.id)) {
                    results.push(history);
                }
            }
        }

        return results;
    }
);
