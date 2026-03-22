import { table, t } from 'spacetimedb/server';
import { TeamLabel, ActionType } from '../types/enums';

export const matchSessionStepHistoryColumns = {
    matchHistoryId: t.u32(),     // FK to MatchSessionHistory.id
    sequence: t.u32(),           // Step number (1, 2, 3...)
    actorUserId: t.u32(),        // Who performed the action
    actorDisplayName: t.string(), // Denormalized for replay (per D-53/D-64)
    teamSide: TeamLabel,         // Blue/Red/Spectator
    action: ActionType,          // Pick, Ban, Bid, etc.
    characterName: t.string().optional(), // Character involved (null for Pause/Undo)
    payload: t.string().optional(),       // JSON for action-specific data (bid amount, etc.)
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const MatchSessionStepHistory = table({
    name: 'match_session_step_history',
    public: true,
    primaryKey: ['matchHistoryId', 'sequence'],
    indexes: [
        { accessor: 'by_match_history', algorithm: 'btree', columns: ['matchHistoryId'] },
    ],
}, matchSessionStepHistoryColumns);
