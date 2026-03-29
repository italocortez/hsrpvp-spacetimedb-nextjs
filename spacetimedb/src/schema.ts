import { schema } from 'spacetimedb/server';
import { User } from './tables/user';
import { UserIdentity } from './tables/userIdentity';
import { ServerIdentity } from './tables/serverIdentity';
import { HsrCharacter } from './tables/hsrCharacter';
import { HsrLightcone } from './tables/hsrLightcone';
import { HsrCharacterCost } from './tables/hsrCharacterCost';
import { HsrLightconeCost } from './tables/hsrLightconeCost';
import { HsrSynergyCost } from './tables/hsrSynergyCost';

// Roster Management
import { HsrAccount } from './tables/hsrAccount';
import { HsrAccountCharacter } from './tables/hsrAccountCharacter';
import { HsrAccountLightcone } from './tables/hsrAccountLightcone';

// Archetypes
import { Archetype } from './tables/archetype';
import { HsrCharacterArchetype } from './tables/hsrCharacterArchetype';

// Tournament System
import { Tournament } from './tables/tournament';
import { TournamentParticipant } from './tables/tournamentParticipant';
import { TournamentAssistant } from './tables/tournamentAssistant';
import { TournamentStandIn } from './tables/tournamentStandIn';

// Cost Set Management
import { CostSet } from './tables/costSet';
import { CostSetDraftCharacter } from './tables/costSetDraftCharacter';
import { CostSetDraftLightcone } from './tables/costSetDraftLightcone';
import { CostSetDraftSynergy } from './tables/costSetDraftSynergy';

// Tournament Teams
import { TournamentTeam } from './tables/tournamentTeam';
import { TournamentTeamRequest } from './tables/tournamentTeamRequest';

// Bracket & Group
import { BracketMatch } from './tables/bracketMatch';
import { GroupStanding } from './tables/groupStanding';

// Match Results
import { MatchResultRecord } from './tables/matchResult';
import { MatchResultGame } from './tables/matchResultGame';
import { MatchResultParticipant } from './tables/matchResultParticipant';
import { PlayerRelationship } from './tables/playerRelationship';
import { MatchParticipantHistory } from './tables/matchParticipantHistory';

// MMR
import { MmrRating } from './tables/mmrRating';
import { MmrHistory } from './tables/mmrHistory';

// ELO Config
import { EloConfigTable } from './tables/eloConfig';
import { Leaderboard } from './tables/leaderboard';

// Player Stats
import { PlayerStat } from './tables/playerStats';
import { PlayerCharacterStat } from './tables/characterStats';

// Achievements
import { Achievement } from './tables/achievement';
import { UserAchievement } from './tables/userAchievement';
import { AchievementCriteria } from './tables/achievementCriteria';

// Calendar
import { AvailabilitySlot } from './tables/availabilitySlot';
import { SavedCalendar } from './tables/savedCalendar';
import { CalendarEvent } from './tables/calendarEvent';
import { CalendarEventInvite } from './tables/calendarEventInvite';

// Chat
import { ChatMessage } from './tables/chatMessage';

// Lobby System
import { Lobby } from './tables/lobby';
import { LobbyMember } from './tables/lobbyMember';
import { LobbyBan } from './tables/lobbyBan';
import { LobbyPreset } from './tables/lobbyPreset';
import { LobbyPassword } from './tables/lobbyPassword';
import { LobbyCursorEvent } from './tables/lobbyCursorEvent';

// Active Game
import { MatchSession } from './tables/matchSession';
import { MatchSessionStep } from './tables/matchSessionStep';

// History
import { MatchSessionHistory } from './tables/matchSessionHistory';
import { MatchSessionStepHistory } from './tables/matchSessionStepHistory';

// Season
import { Season } from './tables/season';

// Global Stats
import { GlobalCharacterStat } from './tables/globalCharacterStat';

// Tournament Player Accounts
import { TournamentPlayerAccount } from './tables/tournamentPlayerAccount';

// Match Result Game History
import { MatchResultGameHistory } from './tables/matchResultGameHistory';

// Scheduled Jobs
import { UserDeletionJob } from './tables/userDeletionJob';
import { LobbyGcJob } from './tables/lobbyGcJob';

const spacetimedb = schema({
    // User / Auth
    User,
    UserIdentity,
    ServerIdentity,

    // Static Assets
    HsrCharacter,
    HsrLightcone,

    // Economy
    HsrCharacterCost,
    HsrLightconeCost,
    HsrSynergyCost,

    // Roster Management
    HsrAccount,
    HsrAccountCharacter,
    HsrAccountLightcone,

    // Archetypes
    Archetype,
    HsrCharacterArchetype,

    // Tournament System
    Tournament,
    TournamentParticipant,
    TournamentAssistant,
    TournamentStandIn,

    // Cost Set Management
    CostSet,
    CostSetDraftCharacter,
    CostSetDraftLightcone,
    CostSetDraftSynergy,

    // Tournament Teams
    TournamentTeam,
    TournamentTeamRequest,

    // Bracket & Group
    BracketMatch,
    GroupStanding,

    // Match Results
    MatchResultRecord,
    MatchResultGame,
    MatchResultParticipant,
    PlayerRelationship,

    // MMR
    MmrRating,
    MmrHistory,

    // ELO Config
    EloConfigTable,
    Leaderboard,

    // Player Stats
    PlayerStat,
    PlayerCharacterStat,

    // Achievements
    Achievement,
    UserAchievement,
    AchievementCriteria,

    // Calendar
    AvailabilitySlot,
    SavedCalendar,
    CalendarEvent,
    CalendarEventInvite,

    // Chat
    ChatMessage,

    // Lobby System
    Lobby,
    LobbyMember,
    LobbyBan,
    LobbyPreset,
    LobbyPassword,
    LobbyCursorEvent,

    // Active Game
    MatchSession,
    MatchSessionStep,

    // History
    MatchSessionHistory,
    MatchSessionStepHistory,
    MatchParticipantHistory,
    MatchResultGameHistory,

    // Season
    Season,

    // Global Stats
    GlobalCharacterStat,

    // Tournament Player Accounts
    TournamentPlayerAccount,

    // Scheduled Jobs
    UserDeletionJob,
    LobbyGcJob,
});

export default spacetimedb;
