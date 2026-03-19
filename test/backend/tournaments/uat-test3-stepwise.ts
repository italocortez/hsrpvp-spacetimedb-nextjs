/**
 * UAT Test 3: Update Tournament — Step-by-step with DB snapshots
 *
 * Runs each action individually, queries the DB after each step.
 * NOT a vitest test — run directly with: npx tsx test/backend/tournaments/uat-test3-stepwise.ts
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local manually (no dotenv dependency)
const envPath = resolve(__dirname, '../../../.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const value = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
} catch {};

const DB = process.env.PUBLIC_SPACETIMEDB_DB_NAME || 'hsrpvp-spacetimedb-nextjs-test1';
const URI = 'wss://maincloud.spacetimedb.com';
const SERVER_TOKEN = process.env.SPACETIMEDB_SERVER_TOKEN || '';

function queryDB(table: string, where?: string): string {
  const sql = where
    ? `SELECT * FROM ${table} WHERE ${where}`
    : `SELECT * FROM ${table}`;
  try {
    const result = execSync(`spacetime sql ${DB} "${sql}"`, {
      encoding: 'utf-8',
      timeout: 15000,
    });
    return result.replace('WARNING: This command is UNSTABLE and subject to breaking changes.\n\n', '');
  } catch (e: any) {
    return `QUERY FAILED: ${e.message}`;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const { DbConnection } = await import('@/src/module_bindings');

  // ── Connect as verified user ───────────────────────────────────────
  console.log('═══ Connecting as verified user...');

  const conn = await new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 15000);
    DbConnection.builder()
      .withUri(URI)
      .withDatabaseName(DB)
      .onConnect(async (c: any, identity: any) => {
        c.subscriptionBuilder().subscribeToAllTables();
        await c.reducers.loginAsGuest({});
        clearTimeout(timeout);
        setTimeout(() => resolve({ conn: c, identity: identity.toHexString() }), 2000);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {})
      .build();
  });

  const { conn: c, identity } = conn;
  console.log(`Connected. Identity: ${identity.slice(0, 16)}...`);

  // Verify user via server connection
  console.log('Verifying user via server_link_discord...');
  const testDiscordId = `uat3_${Date.now()}`;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DbConnection.builder()
      .withUri(URI)
      .withDatabaseName(DB)
      .withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverLinkDiscord({
          callerIdentityHex: identity,
          discordId: testDiscordId,
          discordUsername: `UAT3_${testDiscordId.slice(-6)}`,
        });
        clearTimeout(timeout);
        sc.disconnect();
        setTimeout(resolve, 500);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {})
      .build();
  });

  // Re-login to refresh cache
  await c.reducers.loginAsGuest({});
  await sleep(1500);

  // Get userId and username
  const mapping = [...c.db.UserIdentity.iter()].find((m: any) => m.identity.toHexString() === identity);
  const userId = mapping ? mapping.userId : 0;
  const user = [...c.db.User.iter()].find((u: any) => u.id === userId);
  const username = user?.username || '';
  console.log(`User: id=${userId}, username="${username}"`);

  // Promote to TournamentHost
  console.log('Promoting to TournamentHost...');
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DbConnection.builder()
      .withUri(URI)
      .withDatabaseName(DB)
      .withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverSetRole({ username, roleTag: 'TournamentHost' });
        clearTimeout(timeout);
        sc.disconnect();
        setTimeout(resolve, 500);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {})
      .build();
  });
  await sleep(1000);
  console.log('Promoted.\n');

  // ── STEP 1: Create tournament ──────────────────────────────────────
  console.log('═══ STEP 1: create_tournament (Draft)');
  await c.reducers.createTournament({
    name: 'UAT3 Stepwise Test',
    description: 'Step-by-step UAT with DB snapshots',
    format: 'SingleElimination',
    teamSize: 1,
    defaultGameMode: 'MemoryOfChaos',
    maxParticipants: 8,
    rosterVisibility: 'OpenRoster',
    isAnonymousDefault: false,
    disconnectPolicy: 'Pause',
    costSetId: 0,
    defaultBestOf: 3,
    groupSize: 4,
    has3RdPlaceMatch: false,
    autoAdvanceBracket: true,
    countTowardsMmr: false,
    winnerAdvantage: 0,
    requireVerified: false,
    requireRoster: false,
    minimumMmr: 0,
    requireApproval: false,
    waitlistEnabled: false,
    scheduledStartAt: '',
    registrationDeadline: '',
  });
  await sleep(1500);

  // Find the tournament we just created
  const myTournaments = () => [...c.db.Tournament.iter()].filter((t: any) => t.organizerId === userId);
  const created = myTournaments().find((t: any) => t.name === 'UAT3 Stepwise Test');
  if (!created) { console.error('FAIL: Tournament not found in cache'); process.exit(1); }
  const tid = created.id;
  console.log(`Created tournament id=${tid}`);
  console.log('\n📸 DB Snapshot — Tournament table (new row):');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 2: Update in Draft ────────────────────────────────────────
  console.log('═══ STEP 2: update_tournament (Draft stage)');
  await c.reducers.updateTournament({
    tournamentId: tid,
    name: 'UAT3 Draft Updated',
    description: 'Updated while in Draft',
    rosterVisibility: 'OpenRoster',
    isAnonymousDefault: false,
    disconnectPolicy: 'Pause',
    costSetId: 0,
    defaultBestOf: 5,
    groupSize: 4,
    has3RdPlaceMatch: true,
    autoAdvanceBracket: true,
    winnerAdvantage: 1,
    requireVerified: false,
    requireRoster: false,
    minimumMmr: 0,
    requireApproval: false,
    waitlistEnabled: false,
    scheduledStartAt: '',
    registrationDeadline: '',
  });
  await sleep(1500);
  console.log('\n📸 DB Snapshot — Tournament table (after Draft update):');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 3: Advance to Registration ────────────────────────────────
  console.log('═══ STEP 3: advance_tournament_stage → Registration');
  await c.reducers.advanceTournamentStage({
    tournamentId: tid,
    nextStage: 'Registration',
  });
  await sleep(1500);
  console.log('\n📸 DB Snapshot — Tournament table (after advance to Registration):');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 4: Update in Registration ─────────────────────────────────
  console.log('═══ STEP 4: update_tournament (Registration stage)');
  await c.reducers.updateTournament({
    tournamentId: tid,
    name: 'UAT3 Reg Updated',
    description: 'Updated while in Registration',
    rosterVisibility: 'ClosedWithRating',
    isAnonymousDefault: true,
    disconnectPolicy: 'TimerThenForfeit',
    costSetId: 0,
    defaultBestOf: 3,
    groupSize: 4,
    has3RdPlaceMatch: false,
    autoAdvanceBracket: true,
    winnerAdvantage: 0,
    requireVerified: true,
    requireRoster: true,
    minimumMmr: 0,
    requireApproval: false,
    waitlistEnabled: false,
    scheduledStartAt: '',
    registrationDeadline: '',
  });
  await sleep(1500);
  console.log('\n📸 DB Snapshot — Tournament table (after Registration update):');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 5: Cancel tournament, then try to update ──────────────────
  console.log('═══ STEP 5: cancel_tournament → try update_tournament (should fail)');
  await c.reducers.cancelTournament({ tournamentId: tid });
  await sleep(1500);
  console.log('\n📸 DB Snapshot — Tournament table (after cancel):');
  console.log(queryDB('Tournament', `id = ${tid}`));

  console.log('Attempting update on cancelled tournament...');
  try {
    await c.reducers.updateTournament({
      tournamentId: tid,
      name: 'Should Fail',
      description: 'Should not work',
      rosterVisibility: 'OpenRoster',
      isAnonymousDefault: false,
      disconnectPolicy: 'Pause',
      costSetId: 0,
      defaultBestOf: 3,
      groupSize: 4,
      has3RdPlaceMatch: false,
      autoAdvanceBracket: true,
      winnerAdvantage: 0,
      requireVerified: false,
      requireRoster: false,
      minimumMmr: 0,
      requireApproval: false,
      waitlistEnabled: false,
      scheduledStartAt: '',
      registrationDeadline: '',
    });
    console.log('❌ FAIL: update_tournament succeeded on cancelled tournament (should have been rejected)');
  } catch (err: any) {
    console.log(`✅ Correctly rejected: "${err.message}"`);
  }

  console.log('\n═══ TEST 3 COMPLETE ═══');
  c.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
