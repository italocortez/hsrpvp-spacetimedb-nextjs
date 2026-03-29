import spacetimedb from '../schema';
import { LobbyGcJob, setRunLobbyGcReducer } from '../tables/lobbyGcJob';
import { SYSTEM_USER_ID } from '../helpers/auditColumns';
import { ScheduleAt } from 'spacetimedb';

// ─── hardDeleteLobby ─────────────────────────────────────────────────────────
// Shared cascade-delete helper: removes a lobby and all associated data.
// Used by the GC reducer (abandoned lobbies) and exported for use in close_lobby.
// Cascade order per D-19:
//   1. ChatMessage (event: lobby_id index)
//   2. LobbyMember (composite PK: lobbyId + userId)
//   3. LobbyBan (composite PK: lobbyId + bannedUserId)
//   4. LobbyPassword (unique PK: lobbyId)
//   5. LobbyCursorEvent — event table, auto-deleted after broadcast (no manual cleanup)
//   6. MatchSessionStep (lobby_id index)
//   7. MatchSession (unique PK: lobbyId)
//   8. Lobby row

export function hardDeleteLobby(ctx: any, lobbyId: number): void {
    // 1. Delete all ChatMessage rows
    for (const msg of [...ctx.db.ChatMessage.lobby_id.filter(lobbyId)]) {
        ctx.db.ChatMessage.id.delete(msg.id);
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
// Scheduled GC reducer: cleans abandoned Waiting + Finished lobbies idle > 30 min.
// Per D-25: Active lobbies (Drafting/Equipping/Scoring) are NEVER auto-cleaned.
// Reschedules itself every 5 minutes after each run.

export const run_lobby_gc = spacetimedb.reducer(
    { arg: LobbyGcJob.rowType },
    (ctx, { arg }) => {
        const now = ctx.timestamp;
        const THIRTY_MINUTES_MICROS = BigInt(30 * 60 * 1_000_000);

        // Iterate all lobbies — GC only runs on Waiting and Finished
        for (const lobby of ctx.db.Lobby.iter()) {
            // D-25: Only clean Waiting and Finished stages
            if (lobby.stage.tag !== 'Waiting' && lobby.stage.tag !== 'Finished') {
                continue;
            }

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
