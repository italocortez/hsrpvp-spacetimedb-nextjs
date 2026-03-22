import { table, t } from 'spacetimedb/server';
import { ParticipantStatus } from '../types/enums';

export const tournamentParticipantColumns = {
    tournamentId: t.u32(),
    userId: t.u32(),
    teamGroupId: t.u32().optional(),
    status: ParticipantStatus,
    anonymousAlias: t.string().optional(),
    isWaitlisted: t.bool(),
    allowRandomTeamAssignment: t.bool(),
    approvedByToAt: t.timestamp().optional(),
    hsrAccountId: t.u32().optional(),
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
        { accessor: 'tournament_id', algorithm: 'btree', columns: ['tournamentId'] },
        { accessor: 'user_id', algorithm: 'btree', columns: ['userId'] },
        { accessor: 'by_tournament_and_user', algorithm: 'btree', columns: ['tournamentId', 'userId'] },
    ],
}, tournamentParticipantColumns);
