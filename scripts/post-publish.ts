/**
 * Post-publish bootstrap: register server identity and seed all game data tables.
 *
 * Usage (run immediately after "spacetime publish --clear-database"):
 *   npx tsx scripts/post-publish.ts
 *
 * What it does:
 *   1. Connects fresh (no token) to get a new identity
 *   2. Calls register_server to mark this identity as trusted
 *   3. Appends SPACETIMEDB_SERVER_TOKEN to .env.local
 *   4. Calls seedAll() to upsert HsrCharacter, HsrLightcone, costs, and synergies
 *
 * After completion, restart your Next.js dev server to pick up the new token.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { DbConnection } from '../src/module_bindings';
import { seedAll } from './seed-data';

// ─── Env loading ───────────────────────────────────────────────────────────────

function loadEnvFile(filename: string) {
    try {
        const content = readFileSync(resolve(process.cwd(), filename), 'utf-8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1) continue;
            const key = trimmed.slice(0, eqIdx).trim();
            const value = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) process.env[key] = value;
        }
    } catch { /* file doesn't exist, skip */ }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

// ─── .env.local token writer ───────────────────────────────────────────────────

function writeTokenToEnvLocal(token: string): void {
    const envPath = resolve(process.cwd(), '.env.local');
    let content = '';

    if (existsSync(envPath)) {
        content = readFileSync(envPath, 'utf-8');
        // Remove existing SPACETIMEDB_SERVER_TOKEN line(s)
        content = content
            .split('\n')
            .filter(line => !line.startsWith('SPACETIMEDB_SERVER_TOKEN='))
            .join('\n');
        // Ensure trailing newline
        if (content && !content.endsWith('\n')) content += '\n';
    }

    content += `SPACETIMEDB_SERVER_TOKEN=${token}\n`;
    writeFileSync(envPath, content, 'utf-8');
    console.log(`\n[bootstrap] Token written to .env.local`);
}

// ─── Read spacetime.json (single source of truth) ───────────────────────────

function readSpacetimeJson(): { database: string; server?: string } {
    const path = resolve(process.cwd(), 'spacetime.json');
    try {
        return JSON.parse(readFileSync(path, 'utf-8'));
    } catch {
        console.error('[bootstrap] spacetime.json not found — run from project root');
        process.exit(1);
    }
}

const spacetimeConfig = readSpacetimeJson();

// ─── Main bootstrap ────────────────────────────────────────────────────────────

let host = process.env.SPACETIMEDB_HOST ?? process.env.NEXT_PUBLIC_SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
if (host.startsWith('https://')) host = host.replace('https://', 'wss://');
else if (host.startsWith('http://')) host = host.replace('http://', 'ws://');

const dbName = spacetimeConfig.database;

console.log(`[bootstrap] Connecting to ${host} / ${dbName} ...`);
console.log('[bootstrap] Step 1/3: registering server identity');

const _conn = DbConnection.builder()
    .withUri(host)
    .withDatabaseName(dbName)
    // No token — get a fresh identity on a clean database
    .onConnect(async (connection, identity, token) => {
        console.log(`[bootstrap] Connected with identity: ${identity.toHexString()}`);

        // Step 1: Register server identity
        try {
            await connection.reducers.registerServer({});
            console.log('[bootstrap] register_server: success');
        } catch (err) {
            console.error('[bootstrap] register_server failed:', err);
            process.exit(1);
        }

        // Step 2: Write token to .env.local
        console.log('[bootstrap] Step 2/3: writing token to .env.local');
        writeTokenToEnvLocal(token);
        // Also set in current process env so seedAll() can use the right host/db
        process.env.SPACETIMEDB_SERVER_TOKEN = token;

        // Small delay to let register_server commit propagate
        await new Promise(res => setTimeout(res, 1000));

        // Step 3: Seed all game data tables
        console.log('\n[bootstrap] Step 3/3: seeding game data tables');
        try {
            await seedAll(token);
        } catch (err) {
            console.error('[bootstrap] Seed failed:', err);
            console.log('\n[bootstrap] Token was written to .env.local. Run seed-data.ts manually to retry seeding.');
            process.exit(1);
        }

        console.log('\n[bootstrap] Bootstrap complete!');
        console.log('Restart your Next.js dev server to pick up the new SPACETIMEDB_SERVER_TOKEN.');
        process.exit(0);
    })
    .onConnectError((_ctx, err) => {
        console.error('[bootstrap] Connection failed:', err);
        process.exit(1);
    })
    .build();
