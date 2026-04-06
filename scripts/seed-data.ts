/**
 * Seed game data tables from test/data/ JSON files.
 *
 * Usage:
 *   npx tsx scripts/seed-data.ts
 *
 * Requires SPACETIMEDB_SERVER_TOKEN in .env.local (from register-server.ts or post-publish.ts).
 *
 * Reads test/data/{characters_table,lightcones_table,pairing_table}.json,
 * normalizes them to the admin_bulk_upsert API format, and calls the reducer
 * for each table: HsrCharacter, HsrLightcone, HsrCharacterCost, HsrLightconeCost, HsrSynergyCost.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { DbConnection } from '../src/module_bindings';

// ─── Env loading (same as register-server.ts) ─────────────────────────────────

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

// ─── Normalization helpers ─────────────────────────────────────────────────────

// Capitalize first letter only (e.g. "nihility" → "Nihility", "dps" → "Dps")
function toPascalCase(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// Game mode mapping: raw JSON keys → enum variant names
const GAME_MODE_MAP: Record<string, string> = {
    memoryofchaos: 'MemoryOfChaos',
    apocalypticshadow: 'ApocalypticShadow',
    anomalyarbitration: 'AnomalyArbitration',
};

// Parse "120%" → 120 (int). Falls back to the raw number if already numeric.
function parseWidth(w: string | number | undefined): number {
    if (w === undefined || w === null) return 0;
    if (typeof w === 'number') return w;
    return parseInt(String(w), 10) || 0;
}

// ─── Normalizers ──────────────────────────────────────────────────────────────

type RawCharacter = {
    name: string;
    display_name: string;
    aliases?: string[];
    rarity: number;
    path: string;
    element: string;
    role: string;
    imageUrl?: string;
    cost?: Record<string, Record<string, number>>;
    archetype?: string[];        // NEW: archetype names from JSON
    version_released?: number;   // NEW: game patch the character was released in
    treat_as_version?: number;   // NEW: optional admin override for age weight
};

type RawLightcone = {
    name: string;
    display_name: string;
    aliases?: string[];
    path: string;
    rarity: number;
    imageUrl?: string;
    cost?: Record<string, number>;  // { S1: 1.5, S2: 1.5, ... }
    positioning?: { width?: string | number; x?: number; y?: number };
};

type RawPairing = {
    source: string;
    pair_target: string;
    cost?: Record<string, number>;
};

/** Normalize characters_table.json → HsrCharacter rows */
function normalizeCharacters(raw: RawCharacter[]): object[] {
    return raw.map(c => ({
        name: c.name,
        displayName: c.display_name,
        aliases: c.aliases ?? [],
        rarity: c.rarity,
        path: toPascalCase(c.path),
        element: toPascalCase(c.element),
        role: toPascalCase(c.role),
        imageUrl: c.imageUrl ?? '',
        versionReleased: c.version_released ?? 0,
        treatAsVersion: c.treat_as_version ?? 0,
    }));
}

/** Extract unique archetype names from characters_table.json */
function extractArchetypeNames(raw: RawCharacter[]): string[] {
    const names = new Set<string>();
    for (const c of raw) {
        if (c.archetype) {
            for (const a of c.archetype) names.add(a);
        }
    }
    return [...names].sort();
}

/** Build character-to-archetype assignment map from JSON */
function extractArchetypeAssignments(raw: RawCharacter[]): Array<{ characterName: string; archetypeNames: string[] }> {
    return raw
        .filter(c => c.archetype && c.archetype.length > 0)
        .map(c => ({ characterName: c.name, archetypeNames: c.archetype! }));
}

/** Extract HsrCharacterCost rows from characters_table.json */
function normalizeCharacterCosts(raw: RawCharacter[]): object[] {
    const rows: object[] = [];
    for (const c of raw) {
        if (!c.cost) continue;
        for (const [rawMode, eidolons] of Object.entries(c.cost)) {
            const gameMode = GAME_MODE_MAP[rawMode.toLowerCase()];
            if (!gameMode) {
                console.warn(`[seed] Unknown game mode "${rawMode}" for character "${c.name}" — skipping`);
                continue;
            }
            const costs = {
                e0: eidolons['E0'] ?? 0,
                e1: eidolons['E1'] ?? 0,
                e2: eidolons['E2'] ?? 0,
                e3: eidolons['E3'] ?? 0,
                e4: eidolons['E4'] ?? 0,
                e5: eidolons['E5'] ?? 0,
                e6: eidolons['E6'] ?? 0,
            };
            rows.push({
                characterName: c.name,
                gameMode,
                classicCosts: costs,
                auctionBaseBid: { ...costs },  // same values as placeholder
                costSetId: 0,
            });
        }
    }
    return rows;
}

/** Normalize lightcones_table.json → HsrLightcone rows */
function normalizeLightcones(raw: RawLightcone[]): object[] {
    return raw.map(lc => ({
        name: lc.name,
        displayName: lc.display_name,
        aliases: lc.aliases ?? [],
        path: toPascalCase(lc.path),
        rarity: lc.rarity,
        imageUrl: lc.imageUrl ?? '',
        posX: lc.positioning?.x ?? 0,
        posY: lc.positioning?.y ?? 0,
        width: parseWidth(lc.positioning?.width),
    }));
}

/** Extract HsrLightconeCost rows from lightcones_table.json.
 *  Lightcone costs in raw JSON are NOT per-gameMode — emit one row per gameMode. */
function normalizeLightconeCosts(raw: RawLightcone[]): object[] {
    const rows: object[] = [];
    const LIGHTCONE_GAME_MODES = ['MemoryOfChaos', 'ApocalypticShadow'];
    for (const lc of raw) {
        if (!lc.cost) continue;
        const costs = {
            s1: lc.cost['S1'] ?? 0,
            s2: lc.cost['S2'] ?? 0,
            s3: lc.cost['S3'] ?? 0,
            s4: lc.cost['S4'] ?? 0,
            s5: lc.cost['S5'] ?? 0,
        };
        for (const gameMode of LIGHTCONE_GAME_MODES) {
            rows.push({
                lightconeName: lc.name,
                gameMode,
                classicCosts: costs,
                auctionBaseBid: { ...costs },  // same values as placeholder
                costSetId: 0,
            });
        }
    }
    return rows;
}

/** Extract HsrSynergyCost rows from pairing_table.json */
function normalizePairings(raw: RawPairing[]): object[] {
    const rows: object[] = [];
    for (const p of raw) {
        if (!p.cost) continue;
        for (const [rawMode, modifier] of Object.entries(p.cost)) {
            const gameMode = GAME_MODE_MAP[rawMode.toLowerCase()];
            if (!gameMode) {
                console.warn(`[seed] Unknown game mode "${rawMode}" for pairing "${p.source}+${p.pair_target}" — skipping`);
                continue;
            }
            rows.push({
                sourceName: p.source,
                targetName: p.pair_target,
                gameMode,
                costModifier: modifier,
                costSetId: 0,
            });
        }
    }
    return rows;
}

// ─── Load and normalize all data ──────────────────────────────────────────────

function loadJson<T>(filePath: string): T[] {
    if (!existsSync(filePath)) {
        console.warn(`[seed] Data file not found: ${filePath} — skipping`);
        return [];
    }
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T[];
}

function buildSeedPayloads(): Array<{ tableName: string; rows: object[] }> {
    const dataDir = resolve(process.cwd(), 'test/data');
    const characters = loadJson<RawCharacter>(resolve(dataDir, 'characters_table.json'));
    const lightcones = loadJson<RawLightcone>(resolve(dataDir, 'lightcones_table.json'));
    const pairings = loadJson<RawPairing>(resolve(dataDir, 'pairing_table.json'));

    const archetypeNames = extractArchetypeNames(characters);

    return [
        { tableName: 'HsrCharacter', rows: normalizeCharacters(characters) },
        { tableName: 'HsrLightcone', rows: normalizeLightcones(lightcones) },
        { tableName: 'HsrCharacterCost', rows: normalizeCharacterCosts(characters) },
        { tableName: 'HsrLightconeCost', rows: normalizeLightconeCosts(lightcones) },
        { tableName: 'HsrSynergyCost', rows: normalizePairings(pairings) },
        { tableName: 'Archetype', rows: archetypeNames.map(name => ({ name, description: '' })) },
    ].filter(p => p.rows.length > 0);
}

// ─── Seed via WebSocket SDK ────────────────────────────────────────────────────

/** Connect as server identity and upsert all game data tables.
 *  Exported for use by post-publish.ts. */
export async function seedAll(serverToken: string): Promise<void> {
    const payloads = buildSeedPayloads();
    if (payloads.length === 0) {
        console.log('[seed] No data files found. Skipping seed.');
        return;
    }

    let host = process.env.SPACETIMEDB_HOST ?? process.env.NEXT_PUBLIC_SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
    if (host.startsWith('https://')) host = host.replace('https://', 'wss://');
    else if (host.startsWith('http://')) host = host.replace('http://', 'ws://');

    let dbName: string;
    try {
        const stConfig = JSON.parse(readFileSync(resolve(process.cwd(), 'spacetime.json'), 'utf-8'));
        dbName = stConfig.database;
    } catch {
        console.error('[seed] spacetime.json not found — run from project root');
        throw new Error('spacetime.json not found');
    }

    console.log(`[seed] Connecting to ${host} / ${dbName} ...`);

    return new Promise((done, reject) => {
        const timeout = setTimeout(() => reject(new Error('[seed] Connection timeout (30s)')), 30000);

        DbConnection.builder()
            .withUri(host)
            .withDatabaseName(dbName)
            .withToken(serverToken)
            .onConnect(async (connection, identity) => {
                clearTimeout(timeout);
                console.log(`[seed] Connected as: ${identity.toHexString()}`);

                try {
                    for (const { tableName, rows } of payloads) {
                        console.log(`[seed] Upserting ${rows.length} rows -> ${tableName} ...`);
                        await connection.reducers.adminBulkUpsert({
                            tableName,
                            jsonData: JSON.stringify(rows),
                        });
                        console.log(`[seed] ${tableName}: done`);
                    }
                    console.log('\n[seed] All tables seeded successfully.');
                } catch (err) {
                    console.error('[seed] Seed failed:', err);
                    connection.disconnect();
                    reject(err);
                    return;
                }

                // Archetype junction seeding (D-07): subscribe to Archetype table to resolve name→id
                const characters = loadJson<RawCharacter>(resolve(process.cwd(), 'test/data/characters_table.json'));
                const assignments = extractArchetypeAssignments(characters);

                if (assignments.length > 0) {
                    console.log(`[seed] Waiting for Archetype table subscription to resolve IDs...`);
                    connection.subscriptionBuilder()
                        .onApplied(async () => {
                            try {
                                // Build name→id map from subscribed Archetype rows
                                const archetypeMap = new Map<string, number>();
                                for (const row of connection.db.Archetype.iter()) {
                                    archetypeMap.set(row.name, row.id);
                                }
                                console.log(`[seed] Resolved ${archetypeMap.size} archetype IDs`);

                                // Seed junction rows
                                for (const { characterName, archetypeNames } of assignments) {
                                    const ids = archetypeNames
                                        .map(n => archetypeMap.get(n))
                                        .filter((id): id is number => id !== undefined);
                                    if (ids.length > 0) {
                                        await connection.reducers.adminAssignCharacterArchetypes({
                                            characterName,
                                            archetypeIdsJson: JSON.stringify(ids),
                                        });
                                    }
                                }
                                console.log(`[seed] Archetype assignments seeded for ${assignments.length} characters.`);
                            } catch (err) {
                                console.error('[seed] Junction seeding failed:', err);
                            } finally {
                                connection.disconnect();
                                done();
                            }
                        })
                        .subscribe('SELECT * FROM archetype');
                } else {
                    setTimeout(() => {
                        connection.disconnect();
                        done();
                    }, 1000);
                }
            })
            .onConnectError((_ctx, err) => {
                clearTimeout(timeout);
                reject(new Error(`[seed] Connection failed: ${err}`));
            })
            .build();
    });
}

// ─── CLI entry point ───────────────────────────────────────────────────────────

// Only run when called directly (not when imported by post-publish.ts)
if (process.argv[1] === new URL(import.meta.url).pathname ||
    process.argv[1]?.endsWith('seed-data.ts') ||
    process.argv[1]?.endsWith('seed-data.js')) {
    const serverToken = process.env.SPACETIMEDB_SERVER_TOKEN;
    if (!serverToken) {
        console.error('[seed] SPACETIMEDB_SERVER_TOKEN not found in .env.local. Run register-server.ts first.');
        process.exit(1);
    }

    seedAll(serverToken)
        .then(() => process.exit(0))
        .catch((err) => {
            console.error(err);
            process.exit(1);
        });
}
