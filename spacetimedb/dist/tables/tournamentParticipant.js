import { table, t } from 'spacetimedb/server';
import { ParticipantType, ParticipantStatus } from '../types/enums';
export const tournamentParticipantColumns = {
    tournamentId: t.u32(),
    userId: t.u32(),
    teamId: t.u32().optional(),
    participantType: ParticipantType,
    status: ParticipantStatus,
    seedNumber: t.u32().optional(),
    anonymousAlias: t.string().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};
export const TournamentParticipant = table({
    name: 'tournament_participant',
    public: true,
    primaryKey: ['tournamentId', 'userId'],
    indexes: [
        { name: 'tp_tournament_id', accessor: 'tp_tournament_id', algorithm: 'btree', columns: ['tournamentId'] },
        { name: 'tp_user_id', accessor: 'tp_user_id', algorithm: 'btree', columns: ['userId'] },
    ],
}, tournamentParticipantColumns);
