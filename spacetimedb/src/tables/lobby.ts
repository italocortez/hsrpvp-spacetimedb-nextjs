import { table, t } from 'spacetimedb/server';
import { DraftMode, BanMode, LobbyStage, DisconnectPolicy, GameMode, RosterVisibility } from '../types/enums';

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
    isTournamentControlled: t.bool(),

    // Anonymous play:
    isAnonymousPlayers: t.bool(),
    isAnonymousSpectators: t.bool(),

    // Roster:
    rosterVisibility: RosterVisibility,
    requireOwnership: t.bool(),
    costSetId: t.u32(),

    // Visibility:
    isPublic: t.bool(),
    // passwordHash moved to LobbyPassword (private table) — never broadcast to clients

    // Disconnect behavior:
    disconnectPolicy: DisconnectPolicy,
    disconnectForfeitSeconds: t.u32().optional(), // If disconnected for this many seconds, auto-forfeit (used with TimerThenForfeit policy)
    disconnectForfeitAt: t.timestamp().optional(), // Set when disconnect timer starts; checked by scheduled reducer

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
        { accessor: 'host_user_id', algorithm: 'btree', columns: ['hostUserId'] },
        { accessor: 'stage', algorithm: 'btree', columns: ['stage'] },
        { accessor: 'tournament_id', algorithm: 'btree', columns: ['tournamentId'] },
    ]
}, lobbyColumns);
