import { table, t } from 'spacetimedb/server';

// Phase 15.4 discussion probe (2026-04-14): exists on maincloud to preserve schema
// consistency. The table verified that `primaryKey: [multi-col]` in table() options
// is NOT engine-enforced in SpacetimeDB v2.1.0 (duplicate (a,b) rows accepted).
// TODO: remove during the next routine `--clear-database` republish.
export const pkTestColumns = {
    a: t.string(),
    b: t.string(),
    v: t.u32(),
};

export const PkTest = table({
    name: 'pk_test',
    public: true,
    primaryKey: ['a', 'b'],
}, pkTestColumns);
