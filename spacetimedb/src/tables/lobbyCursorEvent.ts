import { table, t } from 'spacetimedb/server';

export const LobbyCursorEvent = table({
    name: 'lobby_cursor_event',
    public: true,
    event: true, // ⚡ Ephemeral: Broadcasts onInsert, then deletes immediately.
}, {
    lobbyId: t.u32(),
    sender: t.identity(), // Who moved the mouse
    x: t.f32(),
    y: t.f32(),
    timestamp: t.timestamp(), // Helpful for client-side interpolation/smoothing
});