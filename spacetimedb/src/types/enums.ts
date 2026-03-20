import { t } from 'spacetimedb/server';

export const Role = t.enum('Role', {
    Admin: t.unit(),
    Moderator: t.unit(),
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

export const MatchOutcome = t.enum('MatchOutcome', {
    BlueWins: t.unit(),
    RedWins: t.unit(),
    Draw: t.unit(),
    Aborted: t.unit(),
});

export const MatchType = t.enum('MatchType', {
    Casual: t.unit(),
    Ranked: t.unit(),
    Tournament: t.unit(),
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

export const TournamentStage = t.enum('TournamentStage', {
    Draft: t.unit(),
    Registration: t.unit(),
    Seeding: t.unit(),
    InProgress: t.unit(),
    Completed: t.unit(),
    Cancelled: t.unit(),
});

export const RosterVisibility = t.enum('RosterVisibility', {
    OpenRoster: t.unit(),
    ClosedWithRating: t.unit(),
    ClosedNoRating: t.unit(),
});

export const TournamentFormat = t.enum('TournamentFormat', {
    SingleElimination: t.unit(),
    DoubleElimination: t.unit(),
    GroupOnly: t.unit(),
    GroupIntoSingleElim: t.unit(),
    GroupIntoDoubleElim: t.unit(),
});

export const MatchResultStatus = t.enum('MatchResultStatus', {
    Pending: t.unit(),
    Submitted: t.unit(),
    Disputed: t.unit(),
    Validated: t.unit(),
    Rejected: t.unit(),
});

export const ValidationStatus = t.enum('ValidationStatus', {
    Pending: t.unit(),
    Confirmed: t.unit(),
    Disputed: t.unit(),
});

export const DisconnectPolicy = t.enum('DisconnectPolicy', {
    Pause: t.unit(),
    TimerThenForfeit: t.unit(),
    NoAction: t.unit(),
});

export const RecurrenceType = t.enum('RecurrenceType', {
    Daily: t.unit(),
    Weekly: t.unit(),
    Monthly: t.unit(),
});


export const ParticipantStatus = t.enum('ParticipantStatus', {
    Registered: t.unit(),
    CheckedIn: t.unit(),
    Active: t.unit(),
    Eliminated: t.unit(),
    Disqualified: t.unit(),
    Withdrawn: t.unit(),
});

// ParticipantType removed — redundant with teamGroupId (Phase 3 UAT decision)

export const AchievementRarity = t.enum('AchievementRarity', {
    Rare: t.unit(),
    Epic: t.unit(),
    Legendary: t.unit(),
});

export const AchievementTriggerType = t.enum('AchievementTriggerType', {
    StatThreshold: t.unit(),
    CharacterSpecific: t.unit(),
    Manual: t.unit(),
});

export const ChatSenderType = t.enum('ChatSenderType', {
    Player: t.unit(),
    System: t.unit(),
});

export const TeamMemberRole = t.enum('TeamMemberRole', {
    Owner: t.unit(),
    Player: t.unit(),
    Coach: t.unit(),
});

export const GroupAssignmentMode = t.enum('GroupAssignmentMode', {
    Auto: t.unit(),
    Manual: t.unit(),
});

export const BracketSide = t.enum('BracketSide', {
    Winners: t.unit(),
    Losers: t.unit(),
    GrandFinals: t.unit(),
    ThirdPlace: t.unit(),
    Group: t.unit(),
});
