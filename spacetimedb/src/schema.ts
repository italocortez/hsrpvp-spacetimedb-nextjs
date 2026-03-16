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

// Tournament System
import { Tournament } from './tables/tournament';
import { TournamentParticipant } from './tables/tournamentParticipant';
import { TournamentAssistant } from './tables/tournamentAssistant';

// Teams
import { Team } from './tables/team';
import { TeamMember } from './tables/teamMember';
import { TeamInvite } from './tables/teamInvite';

// Bracket & Group
import { BracketMatch } from './tables/bracketMatch';
import { GroupStanding } from './tables/groupStanding';

// Match Results
import { MatchResultRecord } from './tables/matchResult';
import { MatchResultGame } from './tables/matchResultGame';

// MMR
import { MmrRating } from './tables/mmrRating';
import { MmrHistory } from './tables/mmrHistory';

// Player Stats
import { PlayerStats } from './tables/playerStats';
import { CharacterStats } from './tables/characterStats';

// Achievements
import { Achievement } from './tables/achievement';
import { UserAchievement } from './tables/userAchievement';

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
import { LobbyCursorEvent } from './tables/lobbyCursorEvent';

// Active Game
import { MatchSession } from './tables/matchSession';
import { MatchSessionStep } from './tables/matchSessionStep';

// History
import { MatchSessionHistory } from './tables/matchSessionHistory';
import { MatchSessionStepHistory } from './tables/matchSessionStepHistory';

// Scheduled Jobs
import { UserDeletionJob } from './tables/userDeletionJob';

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

    // Tournament System
    Tournament,
    TournamentParticipant,
    TournamentAssistant,

    // Teams
    Team,
    TeamMember,
    TeamInvite,

    // Bracket & Group
    BracketMatch,
    GroupStanding,

    // Match Results
    MatchResultRecord,
    MatchResultGame,

    // MMR
    MmrRating,
    MmrHistory,

    // Player Stats
    PlayerStats,
    CharacterStats,

    // Achievements
    Achievement,
    UserAchievement,

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
    LobbyCursorEvent,

    // Active Game
    MatchSession,
    MatchSessionStep,

    // History
    MatchSessionHistory,
    MatchSessionStepHistory,

    // Scheduled Jobs
    UserDeletionJob,
});

export default spacetimedb;
