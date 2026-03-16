import { table, t } from 'spacetimedb/server';

export const calendarEventColumns = {
    id: t.u32().primaryKey().autoInc(),
    organizerId: t.u32(),
    title: t.string(),
    startAt: t.timestamp(),
    endAt: t.timestamp(),
    bracketMatchId: t.u32().optional(),
    createdById: t.u32(),
    createdDate: t.timestamp(),
    lastModifiedById: t.u32(),
    lastModifiedDate: t.timestamp(),
};

export const CalendarEvent = table({
    name: 'calendar_event',
    public: true,
    indexes: [
        { name: 'ce_organizer', accessor: 'ce_organizer', algorithm: 'btree', columns: ['organizerId'] },
        { name: 'ce_start_at', accessor: 'ce_start_at', algorithm: 'btree', columns: ['startAt'] },
    ],
}, calendarEventColumns);
