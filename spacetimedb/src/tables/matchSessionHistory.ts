import { table, t } from 'spacetimedb/server';
import { DraftMode, GameMode, MatchOutcome } from '../types/enums';
import { LobbyConfigSnapshot } from '../types/structs';

export const matchSessionHistoryColumns = {
    id: t.u32().primaryKey().autoInc(),
    lobbyCode: t.string(),       // Kept for reference (e.g. "X7K9P2")
    playedAt: t.timestamp(),

    draftMode: DraftMode,
    gameMode: GameMode,

    teamBlueAlias: t.string(),
    teamRedAlias: t.string(),

    snapshotConfig: LobbyConfigSnapshot, // The exact rules used (Snapshot)

    outcome: MatchOutcome,

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
        { accessor: 'played_at', algorithm: 'btree', columns: ['playedAt'] },
        { accessor: 'game_mode', algorithm: 'btree', columns: ['gameMode'] },
    ]
}, matchSessionHistoryColumns);
