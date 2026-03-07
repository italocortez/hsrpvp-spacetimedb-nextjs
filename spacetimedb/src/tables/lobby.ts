import { table, t } from 'spacetimedb/server';
import { LobbyStage } from '../types/enums';
import { LobbyConfig } from '../types/structs';

export const Lobby = table({
    name: 'lobby',
    public: true,
    indexes: [
        // Unique index for the 6-char join code
        { name: 'lobby_join_code', algorithm: 'btree', columns: ['joinCode'], unique: true },
        { name: 'lobby_host', algorithm: 'btree', columns: ['hostIdentity'] },
    ]
}, {
    id: t.u32().primaryKey().autoInc(),
    joinCode: t.string(),
    hostIdentity: t.identity(),
    teamBlueAlias: t.string(),
    teamRedAlias: t.string(),

    // Lifecycle & Garbage Collection
    hostDisconnectTime: t.timestamp().optional(),
    lastActivityAt: t.timestamp(),

    stage: LobbyStage,
    config: LobbyConfig,
});