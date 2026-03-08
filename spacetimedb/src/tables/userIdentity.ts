import { table, t } from 'spacetimedb/server';

/**
 * Maps SpacetimeDB identities (per-device) to persistent User IDs (many-to-one).
 * Each device/browser generates a unique identity; this table links them all
 * back to a single User record.
 */
export const UserIdentity = table({
    name: 'user_identity',
    public: true,
    indexes: [
        { name: 'user_identity_user_id', accessor: 'user_identity_user_id', algorithm: 'btree', columns: ['userId'] },
    ]
}, {
    identity: t.identity().primaryKey(),
    userId: t.u32(),
    lastSeenAt: t.timestamp(), // For future cleanup of stale identity mappings
});
