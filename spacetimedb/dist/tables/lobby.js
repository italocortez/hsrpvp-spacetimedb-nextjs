import { table, t } from 'spacetimedb/server';
import { DraftMode, BanMode, LobbyStage, DisconnectPolicy, GameMode } from '../types/enums';
export const lobbyColumns = {
    id: t.u32().primaryKey().autoInc(),
    joinCode: t.string().unique(),
    hostUserId: t.u32(),
    teamBlueAlias: t.string(),
    teamRedAlias: t.string(),
    // Flattened from LobbyConfig:
    teamSize: t.u8(),
    draftMode: DraftMode,
    banMode: BanMode,
    standardTurnSeconds: t.u32(),
    reserveBankSeconds: t.u32(),
    auctionBudget: t.f32().optional(),
    rosterDiffAdvantage: t.f32(),
    rosterThreshold: t.f32(),
    underThresholdAdvantage: t.f32(),
    aboveThresholdPenalty: t.f32(),
    deathPenalty: t.f32(),
    // Tournament linkage:
    tournamentId: t.u32().optional(),
    bracketMatchId: t.u32().optional(),
    // Anonymous play:
    isAnonymousPlayers: t.bool(),
    isAnonymousSpectators: t.bool(),
    // Roster:
    isOpenRoster: t.bool(),
    // Visibility:
    isPublic: t.bool(),
    passwordHash: t.string().optional(),
    // Disconnect behavior:
    disconnectPolicy: DisconnectPolicy,
    // Game mode:
    gameMode: GameMode,
    // Lifecycle:
    hostDisconnectTime: t.timestamp().optional(),
    lastActivityAt: t.timestamp(),
    stage: LobbyStage,
    // Audit:
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
export const Lobby = table({
    name: 'lobby',
    public: true,
    indexes: [
        { name: 'lobby_host', accessor: 'lobby_host', algorithm: 'btree', columns: ['hostUserId'] },
        { name: 'lobby_stage', accessor: 'lobby_stage', algorithm: 'btree', columns: ['stage'] },
        { name: 'lobby_tournament', accessor: 'lobby_tournament', algorithm: 'btree', columns: ['tournamentId'] },
    ]
}, lobbyColumns);
