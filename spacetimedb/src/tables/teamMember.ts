import { table, t } from 'spacetimedb/server';
import { TeamMemberRole } from '../types/enums';

export const teamMemberColumns = {
    teamId: t.u32(),
    userId: t.u32(),
    memberRole: TeamMemberRole,
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const TeamMember = table({
    name: 'team_member',
    public: true,
    primaryKey: ['teamId', 'userId'],
    indexes: [
        { accessor: 'team_id', algorithm: 'btree', columns: ['teamId'] },
        { accessor: 'user_id', algorithm: 'btree', columns: ['userId'] },
        { accessor: 'by_team_and_user', algorithm: 'btree', columns: ['teamId', 'userId'] },
    ],
}, teamMemberColumns);
