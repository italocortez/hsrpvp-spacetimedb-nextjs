/**
 * UAT Test 7: Waitlist & Approval Flow — Step-by-step with DB snapshots
 *
 * Tests: requireApproval flow, waitlist when full, approve_participant, waitlist_promote.
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
    if (!process.env[trimmed.slice(0, eqIdx).trim()]) process.env[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
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

let DbConn: any;

async function connectVerified(label: string) {
  if (!DbConn) DbConn = (await import('@/src/module_bindings')).DbConnection;
  const conn = await new Promise<any>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 15000);
    DbConn.builder().withUri(URI).withDatabaseName(DB)
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
  const discordId = `uat7_${label}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DbConn.builder().withUri(URI).withDatabaseName(DB).withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverLinkDiscord({ callerIdentityHex: identity, discordId, discordUsername: `${label}_${discordId.slice(-8)}` });
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
  return { c, identity, userId, username: user?.username || '' };
}

async function promoteToHost(username: string) {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DbConn.builder().withUri(URI).withDatabaseName(DB).withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverSetRole({ username, roleTag: 'TournamentHost' });
        clearTimeout(timeout); sc.disconnect(); setTimeout(resolve, 500);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {}).build();
  });
  await sleep(500);
}

async function main() {
  // ── Setup: Host + tournament with requireApproval=true, maxParticipants=2, waitlistEnabled=true
  console.log('═══ Setup: Create tournament (requireApproval=true, max=2, waitlist=true)');
  const host = await connectVerified('Host');
  await promoteToHost(host.username);
  console.log(`Host: userId=${host.userId}`);

  await host.c.reducers.createTournament({
    name: 'UAT7 Waitlist', description: 'Waitlist & approval test',
    format: 'SingleElimination', teamSize: 1, defaultGameMode: 'MemoryOfChaos',
    maxParticipants: 2, rosterVisibility: 'OpenRoster', isAnonymousDefault: false,
    disconnectPolicy: 'Pause', costSetId: 0, defaultBestOf: 3, groupSize: 4,
    has3RdPlaceMatch: false, autoAdvanceBracket: true, countTowardsMmr: false,
    winnerAdvantage: 0, requireVerified: false, requireRoster: false, minimumMmr: 0,
    requireApproval: true, waitlistEnabled: true, scheduledStartAt: '', registrationDeadline: '',
  });
  await sleep(1500);
  const tid = [...host.c.db.Tournament.iter()].find((t: any) => t.name === 'UAT7 Waitlist')!.id;
  await host.c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
  await sleep(1500);
  console.log(`Tournament id=${tid}, stage=Registration, maxParticipants=2, requireApproval=true, waitlist=true\n`);

  // ── STEP 1: Register P1 — should be pending approval (no approvedByToAt) ──
  console.log('═══ STEP 1: Register P1 (requireApproval=true → pending approval)');
  const p1 = await connectVerified('P1');
  console.log(`P1: userId=${p1.userId}`);
  await p1.c.reducers.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
  await sleep(1500);
  console.log('\n📸 TournamentParticipant:');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  // ── STEP 2: Register P2 ───────────────────────────────────────────
  console.log('═══ STEP 2: Register P2');
  const p2 = await connectVerified('P2');
  console.log(`P2: userId=${p2.userId}`);
  await p2.c.reducers.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
  await sleep(1500);
  console.log('\n📸 TournamentParticipant:');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  // ── STEP 3: Register P3 — at capacity, should be waitlisted ───────
  console.log('═══ STEP 3: Register P3 (at capacity → waitlisted)');
  const p3 = await connectVerified('P3');
  console.log(`P3: userId=${p3.userId}`);
  await p3.c.reducers.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
  await sleep(1500);
  console.log('\n📸 TournamentParticipant:');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  // ── STEP 4: Host approves P1 ──────────────────────────────────────
  console.log('═══ STEP 4: Host approves P1');
  await host.c.reducers.approveParticipant({ tournamentId: tid, userId: p1.userId });
  await sleep(1500);
  console.log('\n📸 TournamentParticipant:');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  // ── STEP 5: Host promotes P3 from waitlist ─────────────────────────
  console.log('═══ STEP 5: Host promotes P3 from waitlist');
  await host.c.reducers.waitlistPromote({ tournamentId: tid, userId: p3.userId });
  await sleep(1500);
  console.log('\n📸 TournamentParticipant:');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  // ── STEP 6: Try approve already-approved P1 (should fail) ─────────
  console.log('═══ STEP 6: Try approve already-approved P1');
  try {
    await host.c.reducers.approveParticipant({ tournamentId: tid, userId: p1.userId });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }

  // ── STEP 7: Try promote non-waitlisted P1 (should fail) ───────────
  console.log('\n═══ STEP 7: Try promote non-waitlisted P1');
  try {
    await host.c.reducers.waitlistPromote({ tournamentId: tid, userId: p1.userId });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }

  console.log('\n═══ TEST 7 COMPLETE ═══');
  host.c.disconnect(); p1.c.disconnect(); p2.c.disconnect(); p3.c.disconnect();
  process.exit(0);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
