import { table, t } from 'spacetimedb/server';

export const calendarEventInviteColumns = {
    eventId: t.u32(),
    inviteeUserId: t.u32(),
    isAccepted: t.bool().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const CalendarEventInvite = table({
    name: 'calendar_event_invite',
    public: true,
    primaryKey: ['eventId', 'inviteeUserId'],
    indexes: [
        { accessor: 'event_id', algorithm: 'btree', columns: ['eventId'] },
        { accessor: 'invitee_user_id', algorithm: 'btree', columns: ['inviteeUserId'] },
    ],
}, calendarEventInviteColumns);
