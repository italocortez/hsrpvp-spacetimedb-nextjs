// ─── Anonymous + History Views ────────────────────────────────────────────────
// Per-client views enforcing server-side anonymous mode (D-69/D-92/D-93).
//
// 1. view_my_lobby_chat        — anonymized ChatMessage rows (D-92)
// 2. view_my_lobby_members     — anonymized LobbyMember rows (D-92)
// 3. view_my_match_steps       — anonymized MatchSessionStep rows (D-92)
// 4. view_my_match_participants — anonymized MatchResultParticipant rows (D-92)
// 5. view_match_history              — visibility-filtered MatchSessionHistory (D-93)
// 6. view_match_participant_history    — visibility-filtered MatchParticipantHistory (D-93)
// 7. view_match_step_history           — visibility-filtered MatchSessionStepHistory (D-93)
// 8. view_public_accounts        — public HsrAccount rows with characters (D-22, Phase 10.4)

import spacetimedb from '../schema';
import { t } from 'spacetimedb/server';
import { ChatSenderType, LobbySlot, TeamSide, ActionType, GameMode } from '../types/enums';
import { StepPayload } from '../types/structs';
import { shouldAnonymize } from '../helpers/anonymousHelpers';
import { computeAnonymousLabel } from '../helpers/anonymousLabels';
import { MatchSessionHistory } from '../tables/matchSessionHistory';
import { MatchParticipantHistory } from '../tables/matchParticipantHistory';
import { MatchSessionStepHistory } from '../tables/matchSessionStepHistory';
import { HsrAccount } from '../tables/hsrAccount';
import { HsrAccountCharacter } from '../tables/hsrAccountCharacter';

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
    lobbySlot: LobbySlot,
    isReferee: t.bool(),
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
                    lobbySlot: member.lobbySlot,
                    isReferee: member.isReferee,
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
    actorSlot: TeamSide,
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
    teamSide: TeamSide,
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
//    NOT prefixed "my" because it returns both personal AND public data:
//      - isPubliclyVisible === true (standalone + completed tournament matches), OR
//      - Caller is a participant (MatchParticipantHistory lookup)
//    The "view_my_*" views are strictly scoped to the caller's lobbies.
//    This view includes any user's publicly visible matches — hence no "my" prefix.
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
        const visibleIds = buildVisibleMatchIds(ctx);

        // Return full MatchSessionHistory rows for visible matches
        const results: any[] = [];
        const gameModes: any[] = [
            { tag: 'MemoryOfChaos', value: {} },
            { tag: 'ApocalypticShadow', value: {} },
            { tag: 'AnomalyArbitration', value: {} },
        ];

        for (const gm of gameModes) {
            for (const history of ctx.db.MatchSessionHistory.game_mode.filter(gm)) {
                if (visibleIds.has(history.id)) {
                    results.push(history);
                }
            }
        }

        return results;
    }
);

// ---------------------------------------------------------------------------
// 6. view_match_participant_history (per D-93)
//    NOT prefixed "my" — returns participants for public matches + caller's matches.
//    Same visibility rule as view_match_history:
//      - Match isPubliclyVisible === true, OR
//      - Caller is a participant in that match
//    Prevents tournament scouting — opponent identities hidden until reveal.
// ---------------------------------------------------------------------------

spacetimedb.view(
    { name: 'view_match_participant_history', public: true },
    t.array(MatchParticipantHistory.rowType),
    (ctx) => {
        const visibleIds = buildVisibleMatchIds(ctx);

        const results: any[] = [];
        for (const matchId of visibleIds) {
            for (const row of ctx.db.MatchParticipantHistory.by_match_history.filter(matchId)) {
                results.push(row);
            }
        }

        return results;
    }
);

// ---------------------------------------------------------------------------
// 7. view_match_step_history (per D-93)
//    NOT prefixed "my" — returns step history for public matches + caller's matches.
//    Same visibility rule as view_match_history.
//    Contains the full draft replay (picks, bans, bids, pauses, undos).
// ---------------------------------------------------------------------------

spacetimedb.view(
    { name: 'view_match_step_history', public: true },
    t.array(MatchSessionStepHistory.rowType),
    (ctx) => {
        const visibleIds = buildVisibleMatchIds(ctx);

        const results: any[] = [];
        for (const matchId of visibleIds) {
            for (const row of ctx.db.MatchSessionStepHistory.by_match_history.filter(matchId)) {
                results.push(row);
            }
        }

        return results;
    }
);

// ---------------------------------------------------------------------------
// 8. view_public_accounts — Anonymous view returning all HsrAccount rows where
//    isRosterPublic=true. For profile browsing. Characters included, rating
//    included if isRatingPublic=true. Replaces raw HsrAccount subscription (D-20,
//    D-22). Flat rows (one per character); accounts with no characters emit a
//    single row with characterName/eidolonLevel = undefined.
// ---------------------------------------------------------------------------
const PublicAccountRow = t.object('PublicAccountRow', {
    accountId: t.u32(),
    userId: t.u32(),
    uid: t.string(),
    region: t.string(),
    displayLabel: t.string(),
    accountRating: t.u32().optional(),
    characterName: t.string().optional(),
    eidolonLevel: t.u8().optional(),
});

spacetimedb.anonymousView(
    { name: 'view_public_accounts', public: true },
    t.array(PublicAccountRow),
    (ctx) => {
        const results: any[] = [];

        // HsrAccount has no isRosterPublic index — iter() acceptable at ~300 rows
        for (const account of ctx.db.HsrAccount.iter()) {
            if (!account.isRosterPublic) continue;

            const showRating = account.isRatingPublic;

            const characters = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(account.id)];
            if (characters.length === 0) {
                results.push({
                    accountId: account.id,
                    userId: account.userId,
                    uid: account.uid,
                    region: account.region,
                    displayLabel: account.displayLabel,
                    accountRating: showRating ? account.accountRating : undefined,
                    characterName: undefined,
                    eidolonLevel: undefined,
                });
            } else {
                for (const char of characters) {
                    results.push({
                        accountId: account.id,
                        userId: account.userId,
                        uid: account.uid,
                        region: account.region,
                        displayLabel: account.displayLabel,
                        accountRating: showRating ? account.accountRating : undefined,
                        characterName: char.characterName,
                        eidolonLevel: char.eidolonLevel,
                    });
                }
            }
        }

        return results;
    }
);

// ---------------------------------------------------------------------------
// Shared helper: builds the set of matchHistoryIds visible to the caller.
// Used by view_match_history, view_match_participant_history, and
// view_match_step_history to enforce the same visibility gate.
// ---------------------------------------------------------------------------

function buildVisibleMatchIds(ctx: any): Set<number> {
    const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);

    // Build a set of matchHistoryIds the caller participated in
    const participatedIds = new Set<number>();
    if (mapping) {
        const callerUserId = mapping.userId;
        for (const row of ctx.db.MatchParticipantHistory.by_user.filter(callerUserId)) {
            participatedIds.add(row.matchHistoryId);
        }
    }

    // Build set of visible matchHistoryIds (publicly visible OR participated)
    const visibleIds = new Set<number>();

    const gameModes: any[] = [
        { tag: 'MemoryOfChaos', value: {} },
        { tag: 'ApocalypticShadow', value: {} },
        { tag: 'AnomalyArbitration', value: {} },
    ];

    for (const gm of gameModes) {
        for (const history of ctx.db.MatchSessionHistory.game_mode.filter(gm)) {
            if (history.isPubliclyVisible || participatedIds.has(history.id)) {
                visibleIds.add(history.id);
            }
        }
    }

    return visibleIds;
}
