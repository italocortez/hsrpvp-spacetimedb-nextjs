import { table, t } from 'spacetimedb/server';
import { ActionType, TeamLabel } from '../types/enums';
import { StepPayload } from '../types/structs';

export const matchSessionStepColumns = {
    id: t.u32().primaryKey().autoInc(),

    lobbyId: t.u32(),      // FK to Lobby/MatchSession
    sequence: t.u32(),     // 1, 2, 3... (Strict ordering)

    actorUserId: t.u32(), // Who performed the action (persistent User ID)
    actorSlot: TeamLabel,  // Blue/Red/Spectator

    action: ActionType,    // Pick, Ban, Bid...

    payload: StepPayload,
    timestamp: t.timestamp(),
};

export const MatchSessionStep = table({
    name: 'match_session_step',
    public: true,
    indexes: [
        // Fast lookup: "Get full history for Lobby 123"
        { name: 'match_history_lobby', accessor: 'match_history_lobby', algorithm: 'btree', columns: ['lobbyId'] },
    ]
}, matchSessionStepColumns);
