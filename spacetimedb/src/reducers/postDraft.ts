// ─── Post-Draft Reducers ──────────────────────────────────────────────────────
// Four reducers for the Equipping stage and stage advancement.
// Per D-56/D-57/D-58/D-59.

import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser } from '../helpers/ensurePermissions';
import { ensureLobbyMember, ensureStageIs, ensureHostOrAbove } from '../helpers/lobbyHelpers';
import { auditInsert, auditUpdate } from '../helpers/auditColumns';

// ─── equip_lightcone ─────────────────────────────────────────────────────────
// Records LC equip as a backend step. Deducts LC cost from team's LC budget.
// Per D-55: LCs not exclusive, duplicates allowed. Strict budget enforcement.
// Per D-56: Recorded as backend step for match replay.

export const equip_lightcone = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
        characterName: t.string(),
        lightconeName: t.string(),
        superimposition: t.u8(),
    },
    (ctx, { lobbyId, characterName, lightconeName, superimposition }) => {
        const user = getAuthenticatedUser(ctx);
        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) throw new SenderError('Lobby not found.');

        const member = ensureLobbyMember(ctx, lobbyId, user.id);
        ensureStageIs(lobby, 'Equipping');

        // Coach guard (D-39): coaches blocked from all draft/post-draft actions
        if (member.participationRole.tag === 'Coach') {
            throw new SenderError('Coaches cannot equip lightcones.');
        }

        // Member must be on Blue or Red team (not spectator)
        if (member.teamSlot.tag === 'Spectator') {
            throw new SenderError('Spectators cannot equip lightcones.');
        }

        // Read the current match session
        const session = ctx.db.MatchSession.lobbyId.find(lobbyId);
        if (!session) throw new SenderError('Match session not found.');

        // Look up LC cost from HsrLightconeCost table
        // (lightconeName, gameMode, costSetId) → SuperimpositionCost object → s1..s5 field
        const costSetId = lobby.costSetId;
        let lcCost: number = 0;
        // Try lobby's cost set first, then fall back to default (0)
        const costSetIdToTry = costSetId !== 0 ? costSetId : 0;
        const costRow = [...ctx.db.HsrLightconeCost.by_lightcone_mode_and_set.filter([lightconeName, lobby.gameMode, costSetIdToTry])][0]
            ?? (costSetId !== 0 ? [...ctx.db.HsrLightconeCost.by_lightcone_mode_and_set.filter([lightconeName, lobby.gameMode, 0])][0] : undefined);
        if (costRow && costRow.classicCosts) {
            const sField = `s${superimposition}` as keyof typeof costRow.classicCosts;
            const rawCost = (costRow.classicCosts as any)[sField];
            if (typeof rawCost === 'number') {
                lcCost = rawCost;
            }
        }

        // Per D-55: Strict LC budget enforcement
        const isBlue = member.teamSlot.tag === 'Blue';
        const currentLcBudget = isBlue ? session.teamBlueLcBudget : session.teamRedLcBudget;
        if (lcCost > currentLcBudget) {
            throw new SenderError('Not enough LC budget.');
        }

        // Determine next sequence number
        const existingSteps = [...ctx.db.MatchSessionStep.lobby_id.filter(lobbyId)];
        const nextSequence = existingSteps.length > 0
            ? Math.max(...existingSteps.map((s: any) => s.sequence)) + 1
            : 1;

        // Insert MatchSessionStep
        ctx.db.MatchSessionStep.insert({
            id: 0, // autoInc
            lobbyId,
            sequence: nextSequence,
            actorUserId: user.id,
            anonymousLabel: undefined,
            actorSlot: member.teamSlot,
            action: { tag: 'EquipLightcone', value: {} } as any,
            payload: {
                tag: 'EquipLightcone',
                value: { characterName, lightconeName, superimposition, costPaid: lcCost },
            } as any,
            timestamp: ctx.timestamp,
            ...auditInsert(ctx, user.id),
        } as any);

        // Deduct LC cost from budget
        if (isBlue) {
            ctx.db.MatchSession.lobbyId.update({
                ...session,
                teamBlueLcBudget: session.teamBlueLcBudget - lcCost,
                ...auditUpdate(ctx, session, user.id),
            } as any);
        } else {
            ctx.db.MatchSession.lobbyId.update({
                ...session,
                teamRedLcBudget: session.teamRedLcBudget - lcCost,
                ...auditUpdate(ctx, session, user.id),
            } as any);
        }

        // Update lobby lastActivityAt
        ctx.db.Lobby.id.update({
            ...lobby,
            lastActivityAt: ctx.timestamp,
            ...auditUpdate(ctx, lobby, user.id),
        } as any);
    }
);

// ─── arrange_lineup ───────────────────────────────────────────────────────────
// Records lineup position order as a backend step for match replay.
// Per D-56.

export const arrange_lineup = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
        positions: t.string(),
    },
    (ctx, { lobbyId, positions }) => {
        const user = getAuthenticatedUser(ctx);
        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) throw new SenderError('Lobby not found.');

        const member = ensureLobbyMember(ctx, lobbyId, user.id);
        ensureStageIs(lobby, 'Equipping');

        // Coach guard (D-39)
        if (member.participationRole.tag === 'Coach') {
            throw new SenderError('Coaches cannot arrange lineups.');
        }

        // Member must be on Blue or Red team
        if (member.teamSlot.tag === 'Spectator') {
            throw new SenderError('Spectators cannot arrange lineups.');
        }

        // Validate positions is valid JSON array of strings
        let parsedPositions: string[];
        try {
            parsedPositions = JSON.parse(positions);
            if (!Array.isArray(parsedPositions) || !parsedPositions.every((p: any) => typeof p === 'string')) {
                throw new Error('Not an array of strings');
            }
        } catch {
            throw new SenderError('positions must be a valid JSON array of strings.');
        }

        // Determine next sequence number
        const existingSteps = [...ctx.db.MatchSessionStep.lobby_id.filter(lobbyId)];
        const nextSequence = existingSteps.length > 0
            ? Math.max(...existingSteps.map((s: any) => s.sequence)) + 1
            : 1;

        // Insert MatchSessionStep
        ctx.db.MatchSessionStep.insert({
            id: 0, // autoInc
            lobbyId,
            sequence: nextSequence,
            actorUserId: user.id,
            anonymousLabel: undefined,
            actorSlot: member.teamSlot,
            action: { tag: 'ArrangeLineup', value: {} } as any,
            payload: {
                tag: 'ArrangeLineup',
                value: { positions },
            } as any,
            timestamp: ctx.timestamp,
            ...auditInsert(ctx, user.id),
        } as any);

        // Update lobby lastActivityAt
        ctx.db.Lobby.id.update({
            ...lobby,
            lastActivityAt: ctx.timestamp,
            ...auditUpdate(ctx, lobby, user.id),
        } as any);
    }
);

// ─── confirm_lineup ───────────────────────────────────────────────────────────
// Records lineup confirmation as a backend step.
// Per D-56.

export const confirm_lineup = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
    },
    (ctx, { lobbyId }) => {
        const user = getAuthenticatedUser(ctx);
        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) throw new SenderError('Lobby not found.');

        const member = ensureLobbyMember(ctx, lobbyId, user.id);
        ensureStageIs(lobby, 'Equipping');

        // Coach guard (D-39)
        if (member.participationRole.tag === 'Coach') {
            throw new SenderError('Coaches cannot confirm lineups.');
        }

        // Member must be on Blue or Red team
        if (member.teamSlot.tag === 'Spectator') {
            throw new SenderError('Spectators cannot confirm lineups.');
        }

        // Determine next sequence number
        const existingSteps = [...ctx.db.MatchSessionStep.lobby_id.filter(lobbyId)];
        const nextSequence = existingSteps.length > 0
            ? Math.max(...existingSteps.map((s: any) => s.sequence)) + 1
            : 1;

        // Insert MatchSessionStep
        ctx.db.MatchSessionStep.insert({
            id: 0, // autoInc
            lobbyId,
            sequence: nextSequence,
            actorUserId: user.id,
            anonymousLabel: undefined,
            actorSlot: member.teamSlot,
            action: { tag: 'ConfirmLineup', value: {} } as any,
            payload: {
                tag: 'ConfirmLineup',
                value: { confirmed: true },
            } as any,
            timestamp: ctx.timestamp,
            ...auditInsert(ctx, user.id),
        } as any);

        // Update lobby lastActivityAt
        ctx.db.Lobby.id.update({
            ...lobby,
            lastActivityAt: ctx.timestamp,
            ...auditUpdate(ctx, lobby, user.id),
        } as any);
    }
);

// ─── advance_stage ────────────────────────────────────────────────────────────
// Host manually transitions between lobby sub-phases. Per D-58/D-59.
// Transitions: Drafting → Equipping → Scoring
// Scoring → Finished is handled by finalize_match_result (not this reducer).

export const advance_stage = spacetimedb.reducer(
    {
        lobbyId: t.u32(),
    },
    (ctx, { lobbyId }) => {
        const user = getAuthenticatedUser(ctx);
        const lobby = ctx.db.Lobby.id.find(lobbyId);
        if (!lobby) throw new SenderError('Lobby not found.');

        ensureHostOrAbove(ctx, lobby, user);

        const currentStage = lobby.stage.tag;

        if (currentStage === 'Drafting') {
            // Transition: Drafting → Equipping
            // Per D-50: Carry over leftover character budget to LC budget
            const session = ctx.db.MatchSession.lobbyId.find(lobbyId);
            if (!session) throw new SenderError('Match session not found.');

            const newBlueLcBudget = session.teamBlueLcBudget + session.teamBlueCharBudget;
            const newRedLcBudget = session.teamRedLcBudget + session.teamRedCharBudget;

            ctx.db.MatchSession.lobbyId.update({
                ...session,
                teamBlueLcBudget: newBlueLcBudget,
                teamRedLcBudget: newRedLcBudget,
                teamBlueCharBudget: 0,
                teamRedCharBudget: 0,
                ...auditUpdate(ctx, session, user.id),
            } as any);

            ctx.db.Lobby.id.update({
                ...lobby,
                stage: { tag: 'Equipping', value: {} } as any,
                lastActivityAt: ctx.timestamp,
                ...auditUpdate(ctx, lobby, user.id),
            } as any);

            // System chat message for stage change (D-11)
            const existingMessages = [...ctx.db.ChatMessage.lobby_id.filter(lobbyId)];
            const nextMsgId = existingMessages.length > 0
                ? Math.max(...existingMessages.map((m: any) => m.id)) + 1
                : 1;

            // Rolling window: delete oldest if > 50
            if (existingMessages.length >= 50) {
                const sorted = [...existingMessages].sort((a: any, b: any) => a.id - b.id);
                ctx.db.ChatMessage.delete(sorted[0]);
            }

            ctx.db.ChatMessage.insert({
                id: 0, // autoInc
                lobbyId,
                senderUserId: 0,
                senderType: { tag: 'System', value: {} } as any,
                content: 'Draft complete. Stage: Equipping',
                metadata: undefined,
                anonymousLabel: undefined,
                ...auditInsert(ctx, user.id),
            } as any);

        } else if (currentStage === 'Equipping') {
            // Transition: Equipping → Scoring
            // Host can force transition (D-58). Check if both teams have confirmed lineup (optional validation).

            ctx.db.Lobby.id.update({
                ...lobby,
                stage: { tag: 'Scoring', value: {} } as any,
                lastActivityAt: ctx.timestamp,
                ...auditUpdate(ctx, lobby, user.id),
            } as any);

            // System chat message for stage change (D-11)
            const existingMessages = [...ctx.db.ChatMessage.lobby_id.filter(lobbyId)];
            if (existingMessages.length >= 50) {
                const sorted = [...existingMessages].sort((a: any, b: any) => a.id - b.id);
                ctx.db.ChatMessage.delete(sorted[0]);
            }

            ctx.db.ChatMessage.insert({
                id: 0, // autoInc
                lobbyId,
                senderUserId: 0,
                senderType: { tag: 'System', value: {} } as any,
                content: 'Lineups set. Stage: Scoring',
                metadata: undefined,
                anonymousLabel: undefined,
                ...auditInsert(ctx, user.id),
            } as any);

        } else if (currentStage === 'Scoring') {
            // Scoring → Finished handled by finalize_match_result
            throw new SenderError('Use finalize_match_result to transition from Scoring to Finished.');
        } else {
            throw new SenderError(`Cannot advance stage from ${currentStage}.`);
        }
    }
);
