import { t } from 'spacetimedb/server';

export const Role = t.enum('Role', {
    Admin: t.unit(),
    TournamentHost: t.unit(),
    User: t.unit(),
});

export const Path = t.enum('Path', {
    Abundance: t.unit(),
    Destruction: t.unit(),
    Erudition: t.unit(),
    Harmony: t.unit(),
    Hunt: t.unit(),
    Nihility: t.unit(),
    Preservation: t.unit(),
    Remembrance: t.unit(),
    Elation: t.unit(),
});

export const Element = t.enum('Element', {
    Fire: t.unit(),
    Ice: t.unit(),
    Imaginary: t.unit(),
    Lightning: t.unit(),
    Physical: t.unit(),
    Quantum: t.unit(),
    Wind: t.unit(),
});

export const CharRole = t.enum('CharRole', {
    Dps: t.unit(),
    Sustain: t.unit(),
    Support: t.unit(),
});

export const GameMode = t.enum('GameMode', {
    MemoryOfChaos: t.unit(),
    ApocalypticShadow: t.unit(),
    AnomalyArbitration: t.unit(),
});

export const DraftMode = t.enum('DraftMode', {
    Classic: t.unit(),
    Auction: t.unit(),
});

export const BanMode = t.enum('BanMode', {
    None: t.unit(),
    Two: t.unit(),
    Four: t.unit(),
    Six: t.unit(),
});

export const LobbyStage = t.enum('LobbyStage', {
    Waiting: t.unit(),
    Drafting: t.unit(),
    Finished: t.unit(),
});

export const ParticipationRole = t.enum('ParticipationRole', {
    Player: t.unit(),
    Spectator: t.unit(),
});

export const TeamLabel = t.enum('TeamLabel', {
    Spectator: t.unit(),
    Blue: t.unit(),
    Red: t.unit(),
});

export const MatchResult = t.enum('MatchResult', {
    BlueWins: t.unit(),
    RedWins: t.unit(),
    Draw: t.unit(),
    Aborted: t.unit(),
});

export const ActionType = t.enum('ActionType', {
    Pick: t.unit(),
    Ban: t.unit(),
    Nominate: t.unit(),
    Bid: t.unit(),
    AuctionSold: t.unit(),
    Pause: t.unit(),
    Undo: t.unit(),
});