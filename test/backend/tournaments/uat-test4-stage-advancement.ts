/**
 * UAT Test 4: Tournament Stage Advancement — Step-by-step with DB snapshots
 *
 * Tests the stage machine: forward-only transitions, skip/backward rejection,
 * and validation gates (Reg→Seeding needs participants, Seeding→InProgress needs bracket).
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local manually
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
    const result = execSync(`spacetime sql ${DB} "${sql}"`, { encoding: 'utf-8', timeout: 15000 });
    return result.replace('WARNING: This command is UNSTABLE and subject to breaking changes.\n\n', '');
  } catch (e: any) {
    return `QUERY FAILED: ${e.message}`;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

async function connectVerified() {
  const { DbConnection } = await import('@/src/module_bindings');

  const conn = await new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 15000);
    DbConnection.builder()
      .withUri(URI)
      .withDatabaseName(DB)
      .onConnect(async (c: any, identity: any) => {
        c.subscriptionBuilder().subscribeToAllTables();
        await c.reducers.loginAsGuest({});
        clearTimeout(timeout);
        setTimeout(() => resolve({ conn: c, identity: identity.toHexString(), DbConnection }), 2000);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {})
      .build();
  });

  const { conn: c, identity, DbConnection: DBC } = conn;

  // Verify user
  const testDiscordId = `uat4_${Date.now()}`;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DBC.builder()
      .withUri(URI).withDatabaseName(DB).withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverLinkDiscord({ callerIdentityHex: identity, discordId: testDiscordId, discordUsername: `UAT4_${testDiscordId.slice(-6)}` });
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
  const username = user?.username || '';

  // Promote to TournamentHost
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DBC.builder()
      .withUri(URI).withDatabaseName(DB).withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverSetRole({ username, roleTag: 'TournamentHost' });
        clearTimeout(timeout); sc.disconnect(); setTimeout(resolve, 500);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {}).build();
  });
  await sleep(1000);

  return { c, identity, userId, username, DBC };
}

async function main() {
  console.log('═══ Connecting as verified TournamentHost...');
  const { c, userId, DBC } = await connectVerified();
  console.log(`Connected. userId=${userId}\n`);

  const myTournaments = () => [...c.db.Tournament.iter()].filter((t: any) => t.organizerId === userId);

  // ── STEP 1: Create tournament in Draft ─────────────────────────────
  console.log('═══ STEP 1: create_tournament (Draft)');
  await c.reducers.createTournament({
    name: 'UAT4 Stage Test', description: 'Testing stage advancement',
    format: 'SingleElimination', teamSize: 1, defaultGameMode: 'MemoryOfChaos',
    maxParticipants: 8, rosterVisibility: 'OpenRoster', isAnonymousDefault: false,
    disconnectPolicy: 'Pause', costSetId: 0, defaultBestOf: 3, groupSize: 4,
    has3RdPlaceMatch: false, autoAdvanceBracket: true, countTowardsMmr: false,
    winnerAdvantage: 0, requireVerified: false, requireRoster: false, minimumMmr: 0,
    requireApproval: false, waitlistEnabled: false, scheduledStartAt: '', registrationDeadline: '',
  });
  await sleep(1500);
  const created = myTournaments().find((t: any) => t.name === 'UAT4 Stage Test');
  if (!created) { console.error('FAIL: Tournament not found'); process.exit(1); }
  const tid = created.id;
  console.log(`Created tournament id=${tid}`);
  console.log('\n📸 Tournament:');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 2: Try skip Draft → InProgress (should fail) ─────────────
  console.log('═══ STEP 2: Try skip Draft → InProgress');
  try {
    await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'InProgress' });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }
  await sleep(500);
  console.log('\n📸 Tournament (unchanged):');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 3: Draft → Registration (should succeed) ──────────────────
  console.log('═══ STEP 3: Draft → Registration');
  await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
  await sleep(1500);
  console.log('\n📸 Tournament:');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 4: Try backward Registration → Draft (should fail) ───────
  console.log('═══ STEP 4: Try backward Registration → Draft');
  try {
    await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'Draft' });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }

  // ── STEP 5: Registration → Seeding WITHOUT participants (should fail) ──
  console.log('\n═══ STEP 5: Registration → Seeding (no participants — should fail)');
  try {
    await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'Seeding' });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }

  // ── STEP 6: Register 2 participants, then Registration → Seeding ───
  console.log('\n═══ STEP 6: Register 2 participants, then Registration → Seeding');

  // Create 2 additional verified users who will register
  async function createParticipant(label: string) {
    const { DbConnection } = await import('@/src/module_bindings');
    const pConn = await new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 15000);
      DbConnection.builder().withUri(URI).withDatabaseName(DB)
        .onConnect(async (pc: any, pIdentity: any) => {
          pc.subscriptionBuilder().subscribeToAllTables();
          await pc.reducers.loginAsGuest({});
          clearTimeout(timeout);
          setTimeout(() => resolve({ conn: pc, identity: pIdentity.toHexString() }), 2000);
        })
        .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
        .onDisconnect(() => {}).build();
    });

    // Verify participant
    const discordId = `uat4p_${label}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const discordUsername = `P_${label}_${discordId.slice(-8)}`;
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
      DbConnection.builder().withUri(URI).withDatabaseName(DB).withToken(SERVER_TOKEN)
        .onConnect(async (sc: any) => {
          await sc.reducers.serverLinkDiscord({ callerIdentityHex: pConn.identity, discordId, discordUsername });
          clearTimeout(timeout); sc.disconnect(); setTimeout(resolve, 500);
        })
        .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
        .onDisconnect(() => {}).build();
    });
    await pConn.conn.reducers.loginAsGuest({});
    await sleep(1500);

    // Register for tournament
    await pConn.conn.reducers.registerForTournament({ tournamentId: tid });
    await sleep(500);

    const pMapping = [...pConn.conn.db.UserIdentity.iter()].find((m: any) => m.identity.toHexString() === pConn.identity);
    const pUserId = pMapping ? pMapping.userId : 0;
    console.log(`  ${label}: userId=${pUserId}, registered for tournament ${tid}`);
    return pConn;
  }

  const p1 = await createParticipant('P1');
  const p2 = await createParticipant('P2');
  await sleep(1000);

  console.log('\n📸 TournamentParticipant:');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  // Now advance to Seeding
  await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'Seeding' });
  await sleep(1500);
  console.log('\n📸 Tournament (after advance to Seeding):');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 7: Seeding → InProgress WITHOUT bracket (should fail) ─────
  console.log('═══ STEP 7: Seeding → InProgress (no bracket — should fail)');
  try {
    await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'InProgress' });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }

  // ── STEP 8: Generate bracket, seed, then Seeding → InProgress ──────
  console.log('\n═══ STEP 8: Generate bracket, seed, then Seeding → InProgress');
  await c.reducers.generateBracket({ tournamentId: tid });
  await sleep(1500);
  console.log('\n📸 BracketMatch (after generate):');
  console.log(queryDB('BracketMatch', `tournament_id = ${tid}`));

  await c.reducers.seedBracket({ tournamentId: tid, mode: 'random' });
  await sleep(1500);
  console.log('\n📸 BracketMatch (after seed):');
  console.log(queryDB('BracketMatch', `tournament_id = ${tid}`));

  await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'InProgress' });
  await sleep(1500);
  console.log('\n📸 Tournament (after advance to InProgress):');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 9: InProgress → Completed ────────────────────────────────
  console.log('═══ STEP 9: InProgress → Completed');
  await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'Completed' });
  await sleep(1500);
  console.log('\n📸 Tournament (after advance to Completed):');
  console.log(queryDB('Tournament', `id = ${tid}`));

  // ── STEP 10: Try advance past Completed (should fail) ──────────────
  console.log('═══ STEP 10: Try advance past Completed');
  try {
    await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }

  console.log('\n═══ TEST 4 COMPLETE ═══');
  p1.conn.disconnect();
  p2.conn.disconnect();
  c.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
