/**
 * Promote a user to Admin role via the server identity.
 *
 * Usage:
 *   npx tsx scripts/promote-admin.ts <username>
 *
 * Requires SPACETIMEDB_SERVER_TOKEN in .env.local (from register-server.ts).
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DbConnection } from '../src/module_bindings';

// Manually load .env.local (tsx doesn't auto-load it)
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
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    } catch {
        // File doesn't exist, skip
    }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const username = process.argv[2];
if (!username) {
    console.error('Usage: npx tsx scripts/promote-admin.ts <username>');
    process.exit(1);
}

const serverToken = process.env.SPACETIMEDB_SERVER_TOKEN;
if (!serverToken) {
    console.error('SPACETIMEDB_SERVER_TOKEN not found in .env.local. Run register-server.ts first.');
    process.exit(1);
}

// Resolve host — ensure wss:// protocol for WebSocket
let host = process.env.SPACETIMEDB_HOST ?? process.env.NEXT_PUBLIC_SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
if (host.startsWith('https://')) {
    host = host.replace('https://', 'wss://');
} else if (host.startsWith('http://')) {
    host = host.replace('http://', 'ws://');
}

const dbName = process.env.SPACETIMEDB_DB_NAME ?? process.env.NEXT_PUBLIC_SPACETIMEDB_DB_NAME ?? 'nextjs-ts';

console.log(`Connecting to ${host} / ${dbName} ...`);
console.log(`Promoting "${username}" to Admin...`);

const _conn = DbConnection.builder()
    .withUri(host)
    .withDatabaseName(dbName)
    .withToken(serverToken)
    .onConnect((connection, identity) => {
        console.log(`\nConnected as server identity: ${identity.toHexString()}`);

        try {
            connection.reducers.serverPromoteAdmin({ username });
            console.log(`\nUser "${username}" has been promoted to Admin.`);
        } catch (err) {
            console.error(`\nFailed to promote:`, err);
        }

        setTimeout(() => process.exit(0), 2000);
    })
    .onConnectError((_ctx, err) => {
        console.error('Connection failed:', err);
        process.exit(1);
    })
    .build();
