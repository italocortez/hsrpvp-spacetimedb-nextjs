import { table, t } from 'spacetimedb/server';
import { ParticipationRole, TeamLabel } from '../types/enums';

export const lobbyMemberColumns = {
    lobbyId: t.u32(),
    userId: t.u32(),

    isOnline: t.bool(),
    participationRole: ParticipationRole, // Player vs Spectator
    isReferee: t.bool(),    // Admin powers within this lobby
    teamSlot: TeamLabel,    // Blue, Red, or Spectator
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const LobbyMember = table({
    name: 'lobby_member',
    public: true,
    primaryKey: ['lobbyId', 'userId'],
    indexes: [
        { name: 'lobby_member_lobby_id', accessor: 'lobby_member_lobby_id', algorithm: 'btree', columns: ['lobbyId'] },
        { name: 'lobby_member_user_id', accessor: 'lobby_member_user_id', algorithm: 'btree', columns: ['userId'] },
    ]
}, lobbyMemberColumns);
