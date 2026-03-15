import { table, t } from 'spacetimedb/server';

export const matchSessionStepHistoryColumns = {
    matchId: t.string().primaryKey(), // FK to MatchSessionHistory.id

    // A single massive JSON string containing the full array of steps.
    // Clients fetch this only when "Watch Replay" is clicked.
    steps: t.string(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const MatchSessionStepHistory = table({
    name: 'match_session_step_history',
    public: true,
    // The PK is the Match ID itself (1-to-1 relation with History table)
}, matchSessionStepHistoryColumns);