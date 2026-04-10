/**
 * Vitest globalSetup for integration suite.
 *
 * Runs ONCE before the entire suite (not per-file) and clears the maincloud
 * test database + runs post-publish bootstrap so every `npm run test:all`
 * invocation starts from a clean slate.
 *
 * Why: tests leak state that has no auto-cleanup path —
 *   - AwaitingResult lobbies are intentionally never GC'd (D-48, admin-only
 *     resolution) so tests that verify rejection/error paths permanently
 *     leak Lobby + MatchResultRecord rows.
 *   - User/UserPrivate/UserIdentity have no deletion path on disconnect, so
 *     createVerifiedTestHarness() monotonically grows the identity tables.
 *   - Cancelled Tournament rows persist by design (historical record).
 * Without this setup the DB accumulates state across runs; later tests scan
 * larger tables and hit timeout ceilings non-deterministically (Phase 14
 * flakiness investigation, Rounds 1-8).
 *
 * Safety:
 *   - Refuses to run unless DB name contains "-test" (prevents accidental
 *     production wipes if env is misconfigured).
 *   - Opt out per invocation with `SKIP_DB_CLEAR=1` (useful when iterating
 *     on a single failing file and you want to preserve DB state).
 *
 * Cost: ~60-90s per suite invocation (publish + seed). Amortized over a
 * ~57min full run this is <3% overhead for dramatically more deterministic
 * behavior.
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnvValue(key: string): string | undefined {
    const envPath = resolve(process.cwd(), '.env.local');
    if (!existsSync(envPath)) return undefined;
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const k = trimmed.slice(0, eqIdx).trim();
        if (k === key) return trimmed.slice(eqIdx + 1).trim();
    }
    return undefined;
}

export default async function setup() {
    if (process.env.SKIP_DB_CLEAR === '1') {
        console.log('[global-setup] SKIP_DB_CLEAR=1 — skipping database reset');
        return;
    }

    const dbName = loadEnvValue('PUBLIC_SPACETIMEDB_DB_NAME');
    if (!dbName) {
        throw new Error(
            '[global-setup] PUBLIC_SPACETIMEDB_DB_NAME not found in .env.local — ' +
            'cannot safely clear database. Set SKIP_DB_CLEAR=1 to bypass.'
        );
    }

    // Safety: refuse to wipe anything that doesn't look like a test database.
    if (!dbName.includes('-test')) {
        throw new Error(
            `[global-setup] Refusing to clear database "${dbName}" — name does not ` +
            'contain "-test". Safety guard to prevent accidental production wipes. ' +
            'Set SKIP_DB_CLEAR=1 to bypass this check entirely.'
        );
    }

    console.log(`[global-setup] Clearing database "${dbName}" before suite...`);
    const t0 = Date.now();

    try {
        execSync(
            `spacetime publish ${dbName} --clear-database -y --module-path spacetimedb`,
            { stdio: 'inherit', cwd: process.cwd() }
        );
    } catch (err) {
        throw new Error(
            `[global-setup] spacetime publish --clear-database failed. ` +
            `Check spacetime CLI, network, and maincloud login. Original: ${(err as Error).message}`
        );
    }

    console.log('[global-setup] Running post-publish bootstrap (register server + seed data)...');
    try {
        execSync('npx tsx scripts/post-publish.ts', {
            stdio: 'inherit',
            cwd: process.cwd(),
        });
    } catch (err) {
        throw new Error(
            `[global-setup] post-publish.ts failed after successful --clear-database. ` +
            `Database is now empty and unseeded — rerun manually before next test invocation. ` +
            `Original: ${(err as Error).message}`
        );
    }

    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`[global-setup] Database reset complete in ${elapsed}s. Suite starting on clean state.`);
}
