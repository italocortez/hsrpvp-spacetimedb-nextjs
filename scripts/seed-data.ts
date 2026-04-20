/**
 * Seed game data tables from test/data/ JSON files.
 *
 * Usage:
 *   npx tsx scripts/seed-data.ts
 *
 * Requires SPACETIMEDB_SERVER_TOKEN in .env.local (from register-server.ts or post-publish.ts).
 *
 * Reads test/data/{characters_table,lightcones_table,pairing_table}.json,
 * normalizes them to the admin_bulk_upsert API format (Phase 15 D-22 canonical shape:
 * snake_case keys, `cost` wrapper with `cost_set_id` + 3-mode blocks, Spine +
 * positioning passthrough), and calls the reducer for each table:
 *   HsrCharacter, HsrLightcone, HsrCharacterCost, HsrLightconeCost, HsrSynergyCost.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { pathToFileURL } from 'node:url';
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

// Game mode mapping: snake_case JSON keys → enum variant names (D-22)
const GAME_MODE_MAP: Record<string, 'MemoryOfChaos' | 'ApocalypticShadow' | 'AnomalyArbitration'> = {
    memory_of_chaos: 'MemoryOfChaos',
    apocalyptic_shadow: 'ApocalypticShadow',
    anomaly_arbitration: 'AnomalyArbitration',
};

function snakeToPascalMode(k: string): 'MemoryOfChaos' | 'ApocalypticShadow' | 'AnomalyArbitration' | undefined {
    return GAME_MODE_MAP[k];
}

// ─── Raw types (D-22 canonical shape, D-01 sibling-block shape) ───────────────

type EidolonSubBlock = { E0?: number; E1?: number; E2?: number; E3?: number; E4?: number; E5?: number; E6?: number };
type RawModeEidolonBlock = { classic?: EidolonSubBlock; auction?: EidolonSubBlock };

type SuperpositionSubBlock = { S1?: number; S2?: number; S3?: number; S4?: number; S5?: number };
type RawModeSuperpositionBlock = { classic?: SuperpositionSubBlock; auction?: SuperpositionSubBlock };

type RawCharacterCost = {
    cost_set_id: number;
    [mode: string]: RawModeEidolonBlock | number | undefined;
};

type RawLightconeCost = {
    cost_set_id: number;
    [mode: string]: RawModeSuperpositionBlock | number | undefined;
};

type RawPairingModeBlock = { classic?: { modifier: number }; auction?: { modifier: number } };

type RawPairingCost = {
    cost_set_id: number;
    [mode: string]: RawPairingModeBlock | number | undefined;
};

type RawPositioning = { x?: number; y?: number; width?: number };

type RawCharacter = {
    name: string;
    display_name: string;
    aliases?: string[];
    rarity: number;
    path: string;
    element: string;
    role: string;
    archetype?: string[];
    version_released?: number;
    treat_as_version?: number;
    image_url?: string;
    skel_url?: string;
    atlas_url?: string;
    atlas_img_url?: string[];
    positioning?: RawPositioning;
    cost?: RawCharacterCost;
};

type RawLightcone = {
    name: string;
    display_name: string;
    aliases?: string[];
    path: string;
    rarity: number;
    image_url?: string;
    positioning?: RawPositioning;
    cost?: RawLightconeCost;
};

type RawPairing = {
    source_name: string;
    target_name: string;
    cost?: RawPairingCost;
};

// ─── Normalizers (D-22 snake_case → camelCase row for admin_bulk_upsert) ─────

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
        imageUrl: c.image_url ?? '',
        versionReleased: c.version_released ?? 0,
        treatAsVersion: c.treat_as_version ?? 0,
        skelUrl: c.skel_url && c.skel_url.length > 0 ? c.skel_url : null,
        atlasUrl: c.atlas_url && c.atlas_url.length > 0 ? c.atlas_url : null,
        atlasImgUrls: c.atlas_img_url ?? [],
        posX: c.positioning?.x ?? 0,
        posY: c.positioning?.y ?? 0,
        width: c.positioning?.width ?? 0,
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

// ─── Sub-block extractors (Phase 15.4 D-14: no zero-pad; absent = no row) ────

function extractEidolonCost(block: EidolonSubBlock | undefined) {
    if (!block || typeof block !== 'object') return undefined;
    return {
        e0: block.E0 ?? 0,
        e1: block.E1 ?? 0,
        e2: block.E2 ?? 0,
        e3: block.E3 ?? 0,
        e4: block.E4 ?? 0,
        e5: block.E5 ?? 0,
        e6: block.E6 ?? 0,
    };
}

function extractSuperpositionCost(block: SuperpositionSubBlock | undefined) {
    if (!block || typeof block !== 'object') return undefined;
    return {
        s1: block.S1 ?? 0,
        s2: block.S2 ?? 0,
        s3: block.S3 ?? 0,
        s4: block.S4 ?? 0,
        s5: block.S5 ?? 0,
    };
}

/** Extract HsrCharacterCost rows (Phase 15.4 D-14: one row per present sub-block,
 *  no zero-pad fallback; `draftMode` discriminates Classic vs Auction). */
function normalizeCharacterCosts(raw: RawCharacter[]): object[] {
    const rows: object[] = [];
    for (const c of raw) {
        if (!c.cost) continue;
        const csId = c.cost.cost_set_id ?? 0;
        const modes = Object.keys(c.cost).filter(k => k !== 'cost_set_id');
        for (const rawMode of modes) {
            const modeBlock = c.cost[rawMode] as RawModeEidolonBlock | undefined;
            if (!modeBlock || typeof modeBlock !== 'object') continue;

            const classicCosts = extractEidolonCost(modeBlock.classic);
            const auctionCosts = extractEidolonCost(modeBlock.auction);

            // D-14: both sub-blocks absent → skip the mode entirely.
            if (!classicCosts && !auctionCosts) continue;

            const gameMode = snakeToPascalMode(rawMode);
            if (!gameMode) {
                console.warn(`[seed] Unknown game mode "${rawMode}" for character "${c.name}" — skipping`);
                continue;
            }

            // D-14: one row per present sub-block. Absent sub-block → no row for that draftMode.
            if (classicCosts) {
                rows.push({
                    characterName: c.name,
                    gameMode,
                    draftMode: 'Classic',
                    costs: classicCosts,
                    costSetId: csId,
                });
            }
            if (auctionCosts) {
                rows.push({
                    characterName: c.name,
                    gameMode,
                    draftMode: 'Auction',
                    costs: auctionCosts,
                    costSetId: csId,
                });
            }
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
        imageUrl: lc.image_url ?? '',
        posX: lc.positioning?.x ?? 0,
        posY: lc.positioning?.y ?? 0,
        width: lc.positioning?.width ?? 0,
    }));
}

/** Extract HsrLightconeCost rows (Phase 15.4 D-14: one row per present sub-block,
 *  no zero-pad fallback; `draftMode` discriminates Classic vs Auction). */
function normalizeLightconeCosts(raw: RawLightcone[]): object[] {
    const rows: object[] = [];
    for (const lc of raw) {
        if (!lc.cost) continue;
        const csId = lc.cost.cost_set_id ?? 0;
        const modes = Object.keys(lc.cost).filter(k => k !== 'cost_set_id');
        for (const rawMode of modes) {
            const modeBlock = lc.cost[rawMode] as RawModeSuperpositionBlock | undefined;
            if (!modeBlock || typeof modeBlock !== 'object') continue;

            const classicCosts = extractSuperpositionCost(modeBlock.classic);
            const auctionCosts = extractSuperpositionCost(modeBlock.auction);

            // D-14: both sub-blocks absent → skip the mode entirely.
            if (!classicCosts && !auctionCosts) continue;

            const gameMode = snakeToPascalMode(rawMode);
            if (!gameMode) {
                console.warn(`[seed] Unknown game mode "${rawMode}" for lightcone "${lc.name}" — skipping`);
                continue;
            }

            // D-14: one row per present sub-block. Absent sub-block → no row for that draftMode.
            if (classicCosts) {
                rows.push({
                    lightconeName: lc.name,
                    gameMode,
                    draftMode: 'Classic',
                    costs: classicCosts,
                    costSetId: csId,
                });
            }
            if (auctionCosts) {
                rows.push({
                    lightconeName: lc.name,
                    gameMode,
                    draftMode: 'Auction',
                    costs: auctionCosts,
                    costSetId: csId,
                });
            }
        }
    }
    return rows;
}

/** Extract HsrSynergyCost rows from pairing_table.json (Phase 15.4 D-12 / D-14:
 *  sibling-block shape with classic + auction sub-blocks; one row per present sub-block). */
function normalizePairings(raw: RawPairing[]): object[] {
    const rows: object[] = [];
    for (const p of raw) {
        if (!p.cost) continue;
        const csId = p.cost.cost_set_id ?? 0;
        const modes = Object.keys(p.cost).filter(k => k !== 'cost_set_id');
        for (const rawMode of modes) {
            const modeBlock = p.cost[rawMode] as RawPairingModeBlock | undefined;
            if (!modeBlock || typeof modeBlock !== 'object') continue;
            const gameMode = snakeToPascalMode(rawMode);
            if (!gameMode) {
                console.warn(`[seed] Unknown game mode "${rawMode}" for pairing "${p.source_name}+${p.target_name}" — skipping`);
                continue;
            }

            if (modeBlock.classic !== undefined) {
                rows.push({
                    sourceName: p.source_name,
                    targetName: p.target_name,
                    gameMode,
                    draftMode: 'Classic',
                    costModifier: Number(modeBlock.classic.modifier),
                    costSetId: csId,
                });
            }
            if (modeBlock.auction !== undefined) {
                rows.push({
                    sourceName: p.source_name,
                    targetName: p.target_name,
                    gameMode,
                    draftMode: 'Auction',
                    costModifier: Number(modeBlock.auction.modifier),
                    costSetId: csId,
                });
            }
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

function buildSeedPayloads(
    characters: RawCharacter[],
    lightcones: RawLightcone[],
    pairings: RawPairing[]
): Array<{ tableName: string; rows: object[] }> {
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
    const dataDir = resolve(process.cwd(), 'test/data');
    const characters = loadJson<RawCharacter>(resolve(dataDir, 'characters_table.json'));
    const lightcones = loadJson<RawLightcone>(resolve(dataDir, 'lightcones_table.json'));
    const pairings = loadJson<RawPairing>(resolve(dataDir, 'pairing_table.json'));

    const payloads = buildSeedPayloads(characters, lightcones, pairings);
    if (payloads.length === 0) {
        console.log('[seed] No data files found. Skipping seed.');
        return;
    }

    let host = process.env.SPACETIMEDB_HOST ?? process.env.NEXT_PUBLIC_SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
    if (host.startsWith('https://')) host = host.replace('https://', 'wss://');
    else if (host.startsWith('http://')) host = host.replace('http://', 'ws://');
    else if (!host.startsWith('wss://') && !host.startsWith('ws://')) {
        // Bare hostname — assume secure WebSocket
        host = `wss://${host}`;
    }

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
            .withConfirmedReads(false)
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
                // Reuse `characters` loaded at the top of seedAll (WR-03 — avoid double-parse)
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
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
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
