import spacetimedb from '../schema';
import { t } from 'spacetimedb/server';

export const broadcast_cursor = spacetimedb.reducer({
    lobbyId: t.u32(),
    x: t.f32(),
    y: t.f32(),
}, (ctx, { lobbyId, x, y }) => {
    // 1. Validation: Use the Composite Primary Key for an O(1) instant lookup
    // We pass an object matching the PK structure { lobbyId, userIdentity }
    const memberTable = ctx.db.LobbyMember as any; // this is almost necessary for any filter on any table due to typescript sdf conflicts
    const membership = memberTable.primaryKey.find({
        lobbyId,
        userIdentity: ctx.sender
    });

    if (!membership) {
        // User is not in this lobby, ignore the request
        return;
    }

    // 2. Broadcast
    ctx.db.LobbyCursorEvent.insert({
        lobbyId,
        sender: ctx.sender,
        x,
        y,
        timestamp: ctx.timestamp,
    });
});