import spacetimedb from '../schema';
import { LobbyGcJob, setRunLobbyGcReducer } from '../tables/lobbyGcJob';
import { SYSTEM_USER_ID } from '../helpers/auditColumns';
import { ScheduleAt } from 'spacetimedb';

// ─── hardDeleteLobby ─────────────────────────────────────────────────────────
// Shared cascade-delete helper: removes a lobby and all associated data.
// Used by the GC reducer (abandoned lobbies) and exported for use in close_lobby.
// Cascade order per D-19, D-28:
//   1.  ChatMessage (event: lobby_id index)
//   1.5 LobbyMemberAccount (lobby_id btree index) — D-28
//   2.  LobbyMember (composite PK: lobbyId + userId)
//   3.  LobbyBan (composite PK: lobbyId + bannedUserId)
//   4.  LobbyPassword (unique PK: lobbyId)
//   5.  LobbyCursorEvent — event table, auto-deleted after broadcast (no manual cleanup)
//   6.  MatchSessionStep (lobby_id index)
//   7.  MatchSession (unique PK: lobbyId)
//   8.  Lobby row

export function hardDeleteLobby(ctx: any, lobbyId: number): void {
    // 0a. Delete MatchResult* rows (MatchResultParticipant, MatchResultGame, MatchResultRecord)
    const matchResults = [...ctx.db.MatchResultRecord.lobby_id.filter(lobbyId)];
    for (const mr of matchResults) {
        for (const p of [...ctx.db.MatchResultParticipant.match_result_id.filter(mr.id)]) {
            ctx.db.MatchResultParticipant.delete(p);
        }
        for (const g of [...ctx.db.MatchResultGame.match_result_id.filter(mr.id)]) {
            ctx.db.MatchResultGame.delete(g);
        }
        ctx.db.MatchResultRecord.delete(mr);
    }

    // 1. Delete all ChatMessage rows
    for (const msg of [...ctx.db.ChatMessage.lobby_id.filter(lobbyId)]) {
        ctx.db.ChatMessage.id.delete(msg.id);
    }

    // 1.5. Delete all LobbyMemberAccount rows (D-28)
    for (const lma of [...ctx.db.LobbyMemberAccount.lobby_id.filter(lobbyId)]) {
        ctx.db.LobbyMemberAccount.delete(lma);
    }

    // 2. Delete all LobbyMember rows
    for (const member of [...ctx.db.LobbyMember.lobby_id.filter(lobbyId)]) {
        ctx.db.LobbyMember.by_lobby_and_user.delete([lobbyId, member.userId]);
    }

    // 3. Delete all LobbyBan rows
    for (const ban of [...ctx.db.LobbyBan.lobby_id.filter(lobbyId)]) {
        ctx.db.LobbyBan.by_lobby_and_user.delete([lobbyId, ban.bannedUserId]);
    }

    // 4. Delete LobbyPassword if exists
    const pw = ctx.db.LobbyPassword.lobbyId.find(lobbyId);
    if (pw) {
        ctx.db.LobbyPassword.lobbyId.delete(lobbyId);
    }

    // 5. LobbyCursorEvent is an event table — rows auto-delete after broadcast.
    //    No manual cleanup needed.

    // 6. Delete all MatchSessionStep rows for this lobby
    for (const step of [...ctx.db.MatchSessionStep.lobby_id.filter(lobbyId)]) {
        ctx.db.MatchSessionStep.id.delete(step.id);
    }

    // 7. Delete MatchSession if exists (1-to-1 with lobbyId as PK)
    const ms = ctx.db.MatchSession.lobbyId.find(lobbyId);
    if (ms) {
        ctx.db.MatchSession.lobbyId.delete(lobbyId);
    }

    // 8. Delete Lobby row
    ctx.db.Lobby.id.delete(lobbyId);
}

// ─── run_lobby_gc ─────────────────────────────────────────────────────────────
// Scheduled GC reducer: safety net for abandoned lobbies idle > 30 min.
// Cleans: Waiting (AFK lobbies) + Finished (closed/abandoned lobbies).
// D-47: Also cleans Drafting/Equipping/Scoring where ALL members are offline + idle > 30 min.
// D-48: NEVER touches AwaitingResult (admin-only resolution).
// Normal match lifecycle: finalization cascade-deletes the lobby directly.
// GC is backup for lobbies that never reach finalization.
// Reschedules itself every 5 minutes after each run.

export const run_lobby_gc = spacetimedb.reducer(
    { arg: LobbyGcJob.rowType },
    (ctx, { arg }) => {
        const now = ctx.timestamp;
        const THIRTY_MINUTES_MICROS = BigInt(30 * 60 * 1_000_000);
        const SEVENTY_TWO_HOURS_MICROS = BigInt(72 * 60 * 60 * 1_000_000);

        // Iterate all lobbies — GC handles Waiting, Finished, and abandoned active stages
        for (const lobby of ctx.db.Lobby.iter()) {
            // D-48: AwaitingResult NEVER GC'd (admin-only resolution)
            if (lobby.stage.tag === 'AwaitingResult') continue;

            // D-16: Shelved lobby handling
            if (lobby.stage.tag === 'Shelved') {
                // Tournament Shelved lobbies persist until cancel_tournament cascade — skip them
                if (lobby.isTournamentControlled) continue;

                // Casual Shelved lobbies: 72h TTL based on lastActivityAt (used as shelvedAt proxy)
                const shelvedIdle = now.microsSinceUnixEpoch - lobby.lastActivityAt.microsSinceUnixEpoch;
                if (shelvedIdle >= SEVENTY_TWO_HOURS_MICROS) {
                    console.log(`[LOBBY_GC] Auto-cleaning shelved casual lobby #${lobby.id} (idle: ${shelvedIdle} µs >= 72h)`);
                    hardDeleteLobby(ctx, lobby.id);
                }
                continue; // Skip normal 30-min logic for Shelved lobbies
            }

            // D-17: BetweenGames treated like active stages — apply same "all offline + 30 min" rule
            if (lobby.stage.tag === 'BetweenGames') {
                const members = [...ctx.db.LobbyMember.lobby_id.filter(lobby.id)];
                const anyOnline = members.some((m: any) => m.isOnline && !m.voluntarilyLeft);
                if (anyOnline) continue; // At least one active member — skip
                // Fall through to idle time check below
            }

            // D-47: Drafting/Equipping/Scoring: ALL members offline + 30 min idle -> hard delete (void, no winner)
            if (lobby.stage.tag === 'Drafting' || lobby.stage.tag === 'Equipping' || lobby.stage.tag === 'Scoring') {
                // Check ALL members are offline
                const members = [...ctx.db.LobbyMember.lobby_id.filter(lobby.id)];
                const anyOnline = members.some((m: any) => m.isOnline && !m.voluntarilyLeft);
                if (anyOnline) continue; // At least one active member — skip
                // Fall through to idle time check below
            }

            // D-49: Waiting + Finished: same 30-min idle rule
            // Check idle time based on lastActivityAt
            const idleTime = now.microsSinceUnixEpoch - lobby.lastActivityAt.microsSinceUnixEpoch;
            if (idleTime < THIRTY_MINUTES_MICROS) {
                continue;
            }

            // Hard delete cascade
            console.log(`[LOBBY_GC] Auto-cleaning lobby #${lobby.id} (stage: ${lobby.stage.tag}, idle: ${idleTime} µs)`);
            hardDeleteLobby(ctx, lobby.id);
        }

        // Reschedule next GC run in 5 minutes
        const FIVE_MINUTES_MICROS = now.microsSinceUnixEpoch + BigInt(5 * 60 * 1_000_000);
        ctx.db.LobbyGcJob.insert({
            scheduledId: 0n,
            scheduledAt: ScheduleAt.time(FIVE_MINUTES_MICROS),
        } as any);
    }
);

// Wire the reducer into the scheduled table's lazy reference
setRunLobbyGcReducer(run_lobby_gc);
