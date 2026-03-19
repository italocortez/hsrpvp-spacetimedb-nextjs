/**
 * UAT Test 5: Cancel Tournament — Step-by-step with DB snapshots
 *
 * Tests: cancel from Draft, cancel from Registration, reject cancel on Completed, reject cancel on Cancelled.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  const sql = where ? `SELECT * FROM ${table} WHERE ${where}` : `SELECT * FROM ${table}`;
  try {
    return execSync(`spacetime sql ${DB} "${sql}"`, { encoding: 'utf-8', timeout: 15000 })
      .replace('WARNING: This command is UNSTABLE and subject to breaking changes.\n\n', '');
  } catch (e: any) { return `QUERY FAILED: ${e.message}`; }
}

function sleep(ms: number): Promise<void> { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const { DbConnection } = await import('@/src/module_bindings');

  console.log('═══ Connecting as verified TournamentHost...');
  const conn = await new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 15000);
    DbConnection.builder().withUri(URI).withDatabaseName(DB)
      .onConnect(async (c: any, identity: any) => {
        c.subscriptionBuilder().subscribeToAllTables();
        await c.reducers.loginAsGuest({});
        clearTimeout(timeout);
        setTimeout(() => resolve({ conn: c, identity: identity.toHexString() }), 2000);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {}).build();
  });
  const { conn: c, identity } = conn;

  // Verify
  const discordId = `uat5_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DbConnection.builder().withUri(URI).withDatabaseName(DB).withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverLinkDiscord({ callerIdentityHex: identity, discordId, discordUsername: `UAT5_${discordId.slice(-8)}` });
        clearTimeout(timeout); sc.disconnect(); setTimeout(resolve, 500);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {}).build();
  });
  await c.reducers.loginAsGuest({});
  await sleep(1500);

  const mapping = [...c.db.UserIdentity.iter()].find((m: any) => m.identity.toHexString() === identity);
  const userId = mapping ? mapping.userId : 0;
  const user = [...c.db.User.iter()].find((u: any) => u.id === userId);

  // Promote
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DbConnection.builder().withUri(URI).withDatabaseName(DB).withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverSetRole({ username: user?.username || '', roleTag: 'TournamentHost' });
        clearTimeout(timeout); sc.disconnect(); setTimeout(resolve, 500);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {}).build();
  });
  await sleep(1000);
  console.log(`Connected. userId=${userId}\n`);

  const myT = () => [...c.db.Tournament.iter()].filter((t: any) => t.organizerId === userId);

  async function createTournament(name: string): Promise<number> {
    await c.reducers.createTournament({
      name, description: 'Cancel test', format: 'SingleElimination', teamSize: 1,
      defaultGameMode: 'MemoryOfChaos', maxParticipants: 8, rosterVisibility: 'OpenRoster',
      isAnonymousDefault: false, disconnectPolicy: 'Pause', costSetId: 0, defaultBestOf: 3,
      groupSize: 4, has3RdPlaceMatch: false, autoAdvanceBracket: true, countTowardsMmr: false,
      winnerAdvantage: 0, requireVerified: false, requireRoster: false, minimumMmr: 0,
      requireApproval: false, waitlistEnabled: false, scheduledStartAt: '', registrationDeadline: '',
    });
    await sleep(1500);
    const t = myT().find((t: any) => t.name === name);
    return t!.id;
  }

  // ── STEP 1: Cancel from Draft ──────────────────────────────────────
  console.log('═══ STEP 1: Cancel from Draft');
  const tid1 = await createTournament('UAT5 Cancel Draft');
  console.log(`Created id=${tid1}`);
  console.log('\n📸 Tournament (before cancel):');
  console.log(queryDB('Tournament', `id = ${tid1}`));

  await c.reducers.cancelTournament({ tournamentId: tid1 });
  await sleep(1500);
  console.log('📸 Tournament (after cancel):');
  console.log(queryDB('Tournament', `id = ${tid1}`));

  // ── STEP 2: Cancel from Registration ───────────────────────────────
  console.log('═══ STEP 2: Cancel from Registration');
  const tid2 = await createTournament('UAT5 Cancel Reg');
  await c.reducers.advanceTournamentStage({ tournamentId: tid2, nextStage: 'Registration' });
  await sleep(1500);
  console.log(`Created id=${tid2}, advanced to Registration`);
  console.log('\n📸 Tournament (before cancel):');
  console.log(queryDB('Tournament', `id = ${tid2}`));

  await c.reducers.cancelTournament({ tournamentId: tid2 });
  await sleep(1500);
  console.log('📸 Tournament (after cancel):');
  console.log(queryDB('Tournament', `id = ${tid2}`));

  // ── STEP 3: Reject cancel on already-Cancelled ─────────────────────
  console.log('═══ STEP 3: Cancel already-Cancelled tournament');
  try {
    await c.reducers.cancelTournament({ tournamentId: tid1 });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }

  // ── STEP 4: Reject cancel on Completed ─────────────────────────────
  // Use tournament 10 from test 4 which is Completed
  console.log('\n═══ STEP 4: Cancel Completed tournament (id=10)');
  try {
    await c.reducers.cancelTournament({ tournamentId: 10 });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }

  console.log('\n═══ TEST 5 COMPLETE ═══');
  c.disconnect();
  process.exit(0);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
