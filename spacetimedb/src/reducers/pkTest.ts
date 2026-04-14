import { t } from 'spacetimedb/server';
import spacetimedb from '../schema';

// Phase 15.4 discussion probe (2026-04-14). See tables/pkTest.ts header.
// TODO: remove during the next routine `--clear-database` republish.
export const pk_test_insert = spacetimedb.reducer({
    a: t.string(),
    b: t.string(),
    v: t.u32(),
}, (ctx, { a, b, v }) => {
    ctx.db.PkTest.insert({ a, b, v });
});
