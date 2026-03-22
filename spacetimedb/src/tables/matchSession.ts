import { table, t } from 'spacetimedb/server';
import { DraftStep, TimerState } from '../types/structs';

export const matchSessionColumns = {
    lobbyId: t.u32().primaryKey(),

    // The current index into the 'draftSequence' array (0-based)
    turnIndex: t.u32(),

    // The generated script for this match (e.g. [Ban Blue, Ban Red, Pick Blue...])
    draftSequence: t.array(DraftStep),

    // Tracks turn timers, reserves, and pause state
    timerState: TimerState,

    // Auction Mode Budgets (Ignored in Classic)
    teamBlueBudget: t.f32(),
    teamRedBudget: t.f32(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const MatchSession = table({
    name: 'match_session',
    public: true,
    // 1-to-1 relationship with Lobby: The Lobby ID is the Primary Key
}, matchSessionColumns);