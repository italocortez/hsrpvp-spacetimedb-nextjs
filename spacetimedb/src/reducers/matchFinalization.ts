import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';

// ─── finalize_match_result ──────────────────────────────────────────────────
// Stub: Will delete ephemeral MatchResultRecord after MMR processing.
// Implementation: Phase 5.
// Permission: SYSTEM only (called after MMR is processed).

export const finalize_match_result = spacetimedb.reducer(
    {
        matchResultId: t.u32(),
    },
    (ctx, { matchResultId }) => {
        throw new SenderError('Not yet implemented — Phase 5: finalize_match_result');
    }
);

// ─── process_tournament_mmr ─────────────────────────────────────────────────
// Stub: Will batch-process MMR for all matches in a completed tournament.
// Implementation: Phase 5.
// Permission: SYSTEM or Tournament Organizer.

export const process_tournament_mmr = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
    },
    (ctx, { tournamentId }) => {
        throw new SenderError('Not yet implemented — Phase 5: process_tournament_mmr');
    }
);
