import { schema } from 'spacetimedb/server';
import { User } from './tables/user';
import { UserIdentity } from './tables/userIdentity';
import { ServerIdentity } from './tables/serverIdentity';
import { HsrCharacter } from './tables/hsrCharacter';
import { HsrLightcone } from './tables/hsrLightcone';
import { HsrCharacterCost } from './tables/hsrCharacterCost';
import { HsrLightconeCost } from './tables/hsrLightconeCost';
import { HsrSynergyCost } from './tables/hsrSynergyCost';
import { Lobby } from './tables/lobby';
import { LobbyMember } from './tables/lobbyMember';
import { LobbyCursorEvent } from './tables/lobbyCursorEvent';
import { MatchSession } from './tables/matchSession';
import { MatchSessionStep } from './tables/matchSessionStep';
import { MatchSessionHistory } from './tables/matchSessionHistory';
import { MatchSessionStepHistory } from './tables/matchSessionStepHistory';
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