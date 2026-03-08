import { table, t } from 'spacetimedb/server';
import { ParticipationRole, TeamLabel } from '../types/enums';

export const LobbyMember = table({
    name: 'lobby_member',
    public: true,
    primaryKey: ['lobbyId', 'userIdentity'],
    indexes: [
        { name: 'lobby_member_lobby_id', algorithm: 'btree', columns: ['lobbyId'] },
    ]
}, {
    lobbyId: t.u32(),
    userIdentity: t.identity(),

    isOnline: t.bool(),
    participationRole: ParticipationRole, // Player vs Spectator
    isReferee: t.bool(),    // Admin powers within this lobby
    teamSlot: TeamLabel,    // Blue, Red, or Spectator
});