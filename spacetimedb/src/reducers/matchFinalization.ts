import spacetimedb from '../schema';
import { t, SenderError } from 'spacetimedb/server';
import { getAuthenticatedUser, isRoleAtLeast } from '../helpers/ensurePermissions';
import { ensureTournamentAccess } from '../helpers/tournamentHelpers';
import { auditUpdate } from '../helpers/auditColumns';
import { runFinalization, processMatchMmr } from '../helpers/finalizationHelpers';
import { rebuildLeaderboard } from '../helpers/leaderboardRebuild';

// ─── finalize_match_result ──────────────────────────────────────────────────
// Simplified: auth check, validate, authority check, delegate to runFinalization.
// Permission: Admin/Mod, match referee, or tournament TO/assistant.

export const finalize_match_result = spacetimedb.reducer(
    {
        matchResultId: t.u32(),
    },
    (ctx, { matchResultId }) => {
        // 1. Auth
        const user = getAuthenticatedUser(ctx);

        // 2. Find and validate MatchResultRecord
        const matchResult = ctx.db.MatchResultRecord.id.find(matchResultId);
        if (!matchResult) {
            throw new SenderError('Match result not found.');
        }
        if (matchResult.status.tag !== 'Validated') {
            throw new SenderError('Match result must be Validated before finalization.');
        }

        // ── D-H-01 (Phase 12.3): tournament-stage ordering guard ─────────────
        // Reject finalization of tournament-controlled matches until the parent
        // tournament reaches a terminal stage (Completed or Cancelled). Two
        // properties depend on this ordering:
        //   1. MMR batch processing. `process_tournament_mmr` (matchFinalization.ts:65)
        //      reads MatchResultRecord + MatchResultParticipant rows that
        //      `runFinalization` step 18 (finalizationHelpers.ts:549-558) deletes
        //      unconditionally. Without the guard, an admin finalizing an individual
        //      MMR-tournament match mid-tournament silently loses its MMR input.
        //   2. Bracket rollback capability. The TO may need to invalidate a bracket
        //      match after the fact (disputed result, cheating discovered, wrong
        //      score submitted). Keeping the ephemeral data alive until the
        //      tournament reaches a terminal stage makes rollback a local row
        //      operation instead of historical reconstruction.
        // Guard is unconditional: `countTowardsMmr` is NOT consulted (D-H-02) because
        // the rollback property applies to casual tournaments too.
        if (matchResult.isTournamentControlled) {
            const bracketMatch = matchResult.bracketMatchId !== undefined
                ? ctx.db.BracketMatch.id.find(matchResult.bracketMatchId)
                : undefined;
            const derivedTournamentId = bracketMatch?.tournamentId;
            const tournament = derivedTournamentId !== undefined
                ? ctx.db.Tournament.id.find(derivedTournamentId)
                : undefined;
            if (!tournament || (tournament.stage.tag !== 'Completed' && tournament.stage.tag !== 'Cancelled')) {
                throw new SenderError(
                    'Tournament match cannot be finalized while the tournament is still active. ' +
                    'Wait for the tournament to reach Completed or Cancelled — this preserves MMR batch processing and bracket rollback capability.'
                );
            }
        }
        // ── END D-H-01 ───────────────────────────────────────────────────────

        // 3. Authority check (Mod+, referee, tournament access)
        let hasAuthority = false;
        if (isRoleAtLeast(user.role, 'Moderator')) {
            hasAuthority = true;
        }
        if (!hasAuthority && matchResult.refereeUserId === user.id) {
            hasAuthority = true;
        }
        // Derive tournamentId from bracketMatch since tournamentId was removed from MatchResultRecord (D-42)
        if (!hasAuthority && matchResult.isTournamentControlled && matchResult.bracketMatchId !== undefined) {
            const bracketMatch = ctx.db.BracketMatch.id.find(matchResult.bracketMatchId);
            const derivedTournamentId = bracketMatch?.tournamentId;
            if (derivedTournamentId) {
                try {
                    ensureTournamentAccess(ctx, derivedTournamentId);
                    hasAuthority = true;
                } catch (_e) {
                    // Not authorized via tournament access
                }
            }
        }
        if (!hasAuthority) {
            throw new SenderError('You do not have authority to finalize this match result.');
        }

        // 4. Run the 19-step finalization pipeline
        runFinalization(ctx, matchResult, user.id);
    }
);

// ─── process_tournament_mmr ─────────────────────────────────────────────────
// Batch-processes MMR for all Validated, unprocessed matches in a completed
// tournament. Uses matchHistoryId=0 as sentinel (back-filled by runFinalization).
// Permission: TO/assistant/Moderator/Admin.

export const process_tournament_mmr = spacetimedb.reducer(
    {
        tournamentId: t.u32(),
    },
    (ctx, { tournamentId }) => {
        // 1. Verify tournament access
        const { user, tournament } = ensureTournamentAccess(ctx, tournamentId);

        // 2. Verify tournament is Completed or Cancelled
        if (tournament.stage.tag !== 'Completed' && tournament.stage.tag !== 'Cancelled') {
            throw new SenderError('Tournament must be Completed or Cancelled to process MMR.');
        }

        // 3. Verify tournament counts toward MMR
        if (!tournament.countTowardsMmr) {
            throw new SenderError('This tournament does not count toward MMR (countTowardsMmr=false).');
        }

        // 4. Find all Validated, unprocessed MatchResultRecords for this tournament
        // New query path (D-42): tournament_id removed from MatchResultRecord;
        // derive via BracketMatch.tournament_id -> MatchResultRecord.bracket_match_id
        const bracketMatches = [...ctx.db.BracketMatch.tournament_id.filter(tournamentId)];
        const matchResults = bracketMatches
            .map((bm: any) => [...ctx.db.MatchResultRecord.bracket_match_id.filter(bm.id)][0])
            .filter(Boolean)
            .filter((mr: any) => mr.status.tag === 'Validated' && mr.mmrProcessedAt === undefined);

        // 5. If no matches found, log and return
        if (matchResults.length === 0) {
            console.log('[MMR] No unprocessed matches for tournament #' + tournamentId);
            return;
        }

        // 6. Read EloConfig once
        const config = ctx.db.EloConfigTable.id.find(1);
        if (!config) {
            throw new SenderError('ELO config not initialized. Call admin_seed_elo_config first.');
        }

        // Read active season
        const activeSeason = [...ctx.db.Season.is_active.filter(true)][0];
        const tournamentSeasonId = activeSeason ? activeSeason.id : 0;

        // 7. For each match result, process MMR
        for (const mr of matchResults) {
            const participants = [...ctx.db.MatchResultParticipant.match_result_id.filter(mr.id)];
            const games = [...ctx.db.MatchResultGame.match_result_id.filter(mr.id)];
            const lobby = ctx.db.Lobby.id.find(mr.lobbyId);
            const gameMode = lobby?.gameMode ?? games[0]?.gameMode ?? { tag: 'MemoryOfChaos', value: {} };

            // MmrHistory rows inserted with matchHistoryId=0 as sentinel
            processMatchMmr(ctx, mr, participants, gameMode, tournamentSeasonId, 0, user.id);

            // Stamp mmrProcessedAt
            const freshMr = ctx.db.MatchResultRecord.id.find(mr.id);
            if (freshMr) {
                ctx.db.MatchResultRecord.id.update({
                    ...freshMr,
                    mmrProcessedAt: ctx.timestamp,
                    ...auditUpdate(ctx, freshMr, user.id),
                } as any);
            }
        }

        // 8. Rebuild leaderboard once after all matches processed (with seasonId)
        rebuildLeaderboard(ctx, user.id, tournamentSeasonId);

        // 9. Log
        console.log(`[MMR] Processed ${matchResults.length} tournament matches for tournament #${tournamentId}`);
    }
);
