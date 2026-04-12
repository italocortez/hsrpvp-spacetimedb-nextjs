// ─── Match History Views ──────────────────────────────────────────────────────
// Visibility-filtered history views spanning the archived *_history tables.
// Plan 04 will add 5 more self-scoped `view_my_*_history` views to this file.
//
// 1. view_match_history              — visibility-filtered MatchSessionHistory (D-93)
// 2. view_match_participant_history  — visibility-filtered MatchParticipantHistory (D-93)
// 3. view_match_step_history         — visibility-filtered MatchSessionStepHistory (D-93)

import spacetimedb from '../schema';
import { t } from 'spacetimedb/server';
import { MatchSessionHistory } from '../tables/matchSessionHistory';
import { MatchParticipantHistory } from '../tables/matchParticipantHistory';
import { MatchSessionStepHistory } from '../tables/matchSessionStepHistory';

// ---------------------------------------------------------------------------
// 1. view_match_history (per D-93)
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

// Phase 15 D-01/D-02: moved from anonymousViews.ts
export const view_match_history = spacetimedb.view(
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
// 2. view_match_participant_history (per D-93)
//    NOT prefixed "my" — returns participants for public matches + caller's matches.
//    Same visibility rule as view_match_history:
//      - Match isPubliclyVisible === true, OR
//      - Caller is a participant in that match
//    Prevents tournament scouting — opponent identities hidden until reveal.
// ---------------------------------------------------------------------------

// Phase 15 D-01/D-02: moved from anonymousViews.ts
export const view_match_participant_history = spacetimedb.view(
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
// 3. view_match_step_history (per D-93)
//    NOT prefixed "my" — returns step history for public matches + caller's matches.
//    Same visibility rule as view_match_history.
//    Contains the full draft replay (picks, bans, bids, pauses, undos).
// ---------------------------------------------------------------------------

// Phase 15 D-01/D-02: moved from anonymousViews.ts
export const view_match_step_history = spacetimedb.view(
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
