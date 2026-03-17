import { table, t } from 'spacetimedb/server';

export const teamInviteColumns = {
    id: t.u32().primaryKey().autoInc(),
    teamId: t.u32(),
    inviteeUserId: t.u32(),
    inviterUserId: t.u32(),
    isPending: t.bool(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const TeamInvite = table({
    name: 'team_invite',
    public: true,
    indexes: [
        { accessor: 'team_id', algorithm: 'btree', columns: ['teamId'] },
        { accessor: 'invitee_user_id', algorithm: 'btree', columns: ['inviteeUserId'] },
    ],
}, teamInviteColumns);
