import { table, t } from 'spacetimedb/server';
import { LobbyStage } from '../types/enums';
import { LobbyConfig } from '../types/structs';

export const Lobby = table({
    name: 'lobby',
    public: true,
    indexes: [
        { name: 'lobby_host', accessor: 'lobby_host', algorithm: 'btree', columns: ['hostIdentity'] },
    ]
}, {
    id: t.u32().primaryKey().autoInc(),
    joinCode: t.string().unique(),
    hostIdentity: t.identity(),
    teamBlueAlias: t.string(),
    teamRedAlias: t.string(),

    // Lifecycle & Garbage Collection
    hostDisconnectTime: t.timestamp().optional(),
    lastActivityAt: t.timestamp(),

    stage: LobbyStage,
    config: LobbyConfig,
});