import spacetimedb from '../schema';
import { t } from 'spacetimedb/server';
import { auditInsert } from '../helpers/auditColumns';

export const broadcast_cursor = spacetimedb.reducer({
    lobbyId: t.u32(),
    x: t.f32(),
    y: t.f32(),
}, (ctx, { lobbyId, x, y }) => {
    // Resolve identity → userId
    const mapping = ctx.db.UserIdentity.identity.find(ctx.sender);
    if (!mapping) return; // Not registered, ignore

    // Validate membership via index filter
    const membership = [...ctx.db.LobbyMember.by_lobby_and_user.filter([lobbyId, mapping.userId])][0];

    if (!membership) {
        // User is not in this lobby, ignore the request
        return;
    }

    // Broadcast (event table — ephemeral, but audit columns still applied per policy)
    ctx.db.LobbyCursorEvent.insert({
        lobbyId,
        senderUserId: mapping.userId,
        x,
        y,
        timestamp: ctx.timestamp,
        ...auditInsert(ctx, mapping.userId),
    });
});
