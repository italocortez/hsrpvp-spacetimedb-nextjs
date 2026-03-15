import { table, t } from 'spacetimedb/server';
import { DraftMode, GameMode, MatchResult } from '../types/enums';
import { PlayerSnapshot, LobbyConfig } from '../types/structs';

export const matchSessionHistoryColumns = {
    id: t.string().primaryKey(), // UUID generated at game end
    lobbyCode: t.string(),       // Kept for reference (e.g. "X7K9P2")
    playedAt: t.timestamp(),

    draftMode: DraftMode,
    gameMode: GameMode,

    teamBlueAlias: t.string(),
    teamRedAlias: t.string(),

    // Full snapshots of players at the time of the match
    blueTeamMembers: t.array(PlayerSnapshot),
    redTeamMembers: t.array(PlayerSnapshot),

    snapshotConfig: LobbyConfig, // The exact rules used (Snapshot)

    result: MatchResult,

    // Serialized JSON blobs containing the final team comps
    // (Character Name, Eidolon, Cost Paid, etc.)
    rosterBlue: t.string(),
    rosterRed: t.string(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const MatchSessionHistory = table({
    name: 'match_session_history',
    public: true,
    indexes: [
        { name: 'history_played_at', accessor: 'history_played_at', algorithm: 'btree', columns: ['playedAt'] },
        { name: 'history_game_mode', accessor: 'history_game_mode', algorithm: 'btree', columns: ['gameMode'] },
    ]
}, matchSessionHistoryColumns);