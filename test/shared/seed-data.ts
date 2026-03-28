/**
 * Post-clear-database seed script. Reads combined-format JSON from test/data/,
 * transforms to match admin_bulk_upsert expectations, and seeds all game data tables.
 *
 * Mimics what the frontend admin panel does: receive combined JSON, split into
 * table-specific payloads, call admin_bulk_upsert for each table.
 *
 * Run after bootstrap.ts: npx tsx test/shared/seed-data.ts
 */
import { DbConnection } from '../../src/module_bindings';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve(import.meta.dirname || '.', '../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const token = envContent.match(/SPACETIMEDB_SERVER_TOKEN=(.+)/)?.[1]?.trim() || '';
const uri = envContent.match(/SPACETIMEDB_URI=(.+)/)?.[1]?.trim() || 'wss://maincloud.spacetimedb.com';
const db = envContent.match(/SPACETIMEDB_DB=(.+)/)?.[1]?.trim() || 'hsrpvp-spacetimedb-nextjs-test1';

if (!token) {
  console.error('ERROR: SPACETIMEDB_SERVER_TOKEN not found in .env.local');
  process.exit(1);
}

const dataDir = path.resolve(import.meta.dirname || '.', '../data');
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const GAME_MODE_MAP: Record<string, string> = {
  memoryofchaos: 'MemoryOfChaos',
  apocalypticshadow: 'ApocalypticShadow',
  anomalyarbitration: 'AnomalyArbitration',
};

// ── Transform characters (combined → HsrCharacter + HsrCharacterCost) ──

const rawChars = JSON.parse(fs.readFileSync(path.join(dataDir, 'characters_table.json'), 'utf8'));

const chars = rawChars.map((c: any) => ({
  name: c.name,
  displayName: c.display_name,
  aliases: c.aliases || [],
  rarity: c.rarity,
  path: cap(c.path),
  element: cap(c.element),
  role: cap(c.role),
  imageUrl: c.imageUrl || '',
}));

const charCosts: any[] = [];
for (const c of rawChars) {
  if (!c.cost) continue;
  for (const [mode, eidolons] of Object.entries(c.cost) as [string, any][]) {
    const gm = GAME_MODE_MAP[mode];
    if (!gm) continue;
    const eidolonCost = {
      e0: eidolons['E0'] || 0, e1: eidolons['E1'] || 0, e2: eidolons['E2'] || 0,
      e3: eidolons['E3'] || 0, e4: eidolons['E4'] || 0, e5: eidolons['E5'] || 0,
      e6: eidolons['E6'] || 0,
    };
    charCosts.push({
      characterName: c.name, gameMode: gm,
      classicCosts: eidolonCost, auctionBaseBid: eidolonCost, costSetId: 0,
    });
  }
}

// ── Transform lightcones (combined → HsrLightcone + HsrLightconeCost) ──

const rawLCs = JSON.parse(fs.readFileSync(path.join(dataDir, 'lightcones_table.json'), 'utf8'));

const lightcones = rawLCs.map((lc: any) => ({
  name: lc.name,
  displayName: lc.display_name,
  aliases: lc.aliases || [],
  path: cap(lc.path),
  rarity: lc.rarity,
  imageUrl: lc.imageUrl || '',
  posX: lc.positioning?.x || 0,
  posY: lc.positioning?.y || 0,
  width: typeof lc.positioning?.width === 'string' ? parseInt(lc.positioning.width) || 0 : (lc.positioning?.width || 0),
}));

const lcCosts: any[] = [];
for (const lc of rawLCs) {
  if (!lc.cost) continue;
  const supCost = {
    s1: lc.cost['S1'] || 0, s2: lc.cost['S2'] || 0, s3: lc.cost['S3'] || 0,
    s4: lc.cost['S4'] || 0, s5: lc.cost['S5'] || 0,
  };
  // Lightcone costs are the same across game modes — duplicate per mode
  for (const gm of Object.values(GAME_MODE_MAP)) {
    lcCosts.push({
      lightconeName: lc.name, gameMode: gm,
      classicCosts: supCost, auctionBaseBid: supCost, costSetId: 0,
    });
  }
}

// ── Seed ──

const tables: [string, string, any[]][] = [
  ['HsrCharacter', 'characters', chars],
  ['HsrLightcone', 'lightcones', lightcones],
  ['HsrCharacterCost', 'character costs', charCosts],
  ['HsrLightconeCost', 'lightcone costs', lcCosts],
];

console.log(`Seeding ${db}:`);
for (const [, label, rows] of tables) console.log(`  ${rows.length} ${label}`);

DbConnection.builder()
  .withUri(uri)
  .withDatabaseName(db)
  .withToken(token)
  .onConnect(async (conn) => {
    const BATCH = 20;
    for (const [tableName, label, rows] of tables) {
      if (rows.length === 0) { console.log(`  Skipping ${label} (empty)`); continue; }
      for (let i = 0; i < rows.length; i += BATCH) {
        const chunk = rows.slice(i, i + BATCH);
        console.log(`  ${tableName} batch ${Math.floor(i / BATCH) + 1}: ${chunk.length} rows...`);
        conn.reducers.adminBulkUpsert({ tableName, jsonData: JSON.stringify(chunk) });
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    console.log('Seed complete.');
    conn.disconnect();
    process.exit(0);
  })
  .onConnectError((_ctx: any, err: any) => {
    console.error('Connection failed:', err);
    process.exit(1);
  })
  .onDisconnect(() => {})
  .build();
