import { table, t } from 'spacetimedb/server';

export const lobbyGcJobColumns = {
    scheduledId: t.u64().primaryKey().autoInc(),
    scheduledAt: t.scheduleAt(),
};

// Note: The 'scheduled' property will be wired in Plan 05 when the GC reducer is implemented.
// We use a mutable binding so the reducer file can assign it after import,
// avoiding circular dependency (schema -> this file, reducer file -> schema).
// Do NOT add `scheduled:` here until the reducer exists — SpacetimeDB will reject the module.
export let _runLobbyGcReducer: any;
export function setRunLobbyGcReducer(reducer: any) {
    _runLobbyGcReducer = reducer;
}

export const LobbyGcJob = table({
    name: 'lobby_gc_job',
}, lobbyGcJobColumns);
