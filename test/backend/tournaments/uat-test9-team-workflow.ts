/**
 * UAT Test 9: Tournament Team Workflow — Step-by-step with DB snapshots
 *
 * Tests all 6 team reducers: create_tournament_team, request_join_team,
 * accept_team_request, reject_team_request, leave_tournament_team, disband_tournament_team.
 * Uses teamSize=2 tournament.
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
  const discordId = `uat9_${label}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
  const runId = Date.now().toString().slice(-6);

  // ── Setup: Host + teamSize=2 tournament in Registration ────────────
  console.log('═══ Setup: Create teamSize=2 tournament');
  const host = await connectVerified('Host');
  await promoteToHost(host.username);

  await host.c.reducers.createTournament({
    name: `UAT9 Teams ${runId}`, description: 'Team workflow test',
    format: 'SingleElimination', teamSize: 2, defaultGameMode: 'MemoryOfChaos',
    maxParticipants: 8, rosterVisibility: 'OpenRoster', isAnonymousDefault: false,
    disconnectPolicy: 'Pause', costSetId: 0, defaultBestOf: 3, groupSize: 4,
    has3RdPlaceMatch: false, autoAdvanceBracket: true, countTowardsMmr: false,
    winnerAdvantage: 0, requireVerified: false, requireRoster: false, minimumMmr: 0,
    requireApproval: false, waitlistEnabled: false, scheduledStartAt: '', registrationDeadline: '',
  });
  await sleep(1500);
  const tid = [...host.c.db.Tournament.iter()].find((t: any) => t.name === `UAT9 Teams ${runId}`)!.id;
  await host.c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
  await sleep(1500);

  // Register 4 players
  const captain = await connectVerified('Captain');
  const playerB = await connectVerified('PlayerB');
  const playerC = await connectVerified('PlayerC');
  const playerD = await connectVerified('PlayerD');

  await captain.c.reducers.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
  await sleep(500);
  await playerB.c.reducers.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
  await sleep(500);
  await playerC.c.reducers.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
  await sleep(500);
  await playerD.c.reducers.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
  await sleep(1500);

  console.log(`Tournament id=${tid}, teamSize=2`);
  console.log(`Captain=${captain.userId}, B=${playerB.userId}, C=${playerC.userId}, D=${playerD.userId}\n`);

  console.log('📸 TournamentParticipant (after all 4 register, before any team ops):');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));
  console.log('📸 TournamentTeam (should be empty — no auto-teams for teamSize=2):');
  console.log(queryDB('TournamentTeam', `tournament_id = ${tid}`));

  // ── STEP 1: Captain creates team ───────────────────────────────────
  console.log('═══ STEP 1: Captain creates team');
  await captain.c.reducers.createTournamentTeam({ tournamentId: tid, teamName: 'Alpha Squad' });
  await sleep(1500);

  console.log('\n📸 TournamentTeam:');
  console.log(queryDB('TournamentTeam', `tournament_id = ${tid}`));
  console.log('📸 TournamentParticipant (captain should have teamGroupId set):');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  // Get the team ID
  const teamId = [...captain.c.db.TournamentTeam.iter()].find((t: any) => t.name === 'Alpha Squad')!.id;
  console.log(`Team id=${teamId}\n`);

  // ── STEP 2: PlayerB requests to join ───────────────────────────────
  console.log('═══ STEP 2: PlayerB requests to join team');
  await playerB.c.reducers.requestJoinTeam({ teamId });
  await sleep(1500);

  console.log('\n📸 TournamentTeamRequest:');
  console.log(queryDB('TournamentTeamRequest', `team_id = ${teamId}`));

  // ── STEP 3: Captain accepts PlayerB ────────────────────────────────
  console.log('═══ STEP 3: Captain accepts PlayerB');
  await captain.c.reducers.acceptTeamRequest({ teamId, userId: playerB.userId });
  await sleep(1500);

  console.log('\n📸 TournamentTeamRequest (should be empty — transactional delete):');
  console.log(queryDB('TournamentTeamRequest', `team_id = ${teamId}`));
  console.log('📸 TournamentParticipant (PlayerB should have teamGroupId set):');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  // ── STEP 4: PlayerC requests, Captain rejects ──────────────────────
  console.log('═══ STEP 4: PlayerC requests, Captain rejects');
  await playerC.c.reducers.requestJoinTeam({ teamId });
  await sleep(1500);
  console.log('\n📸 TournamentTeamRequest (PlayerC pending):');
  console.log(queryDB('TournamentTeamRequest', `team_id = ${teamId}`));

  await captain.c.reducers.rejectTeamRequest({ teamId, userId: playerC.userId });
  await sleep(1500);
  console.log('📸 TournamentTeamRequest (empty after reject):');
  console.log(queryDB('TournamentTeamRequest', `team_id = ${teamId}`));

  // ── STEP 5: PlayerB leaves team ────────────────────────────────────
  console.log('═══ STEP 5: PlayerB leaves team');
  await playerB.c.reducers.leaveTournamentTeam({ teamId });
  await sleep(1500);

  console.log('\n📸 TournamentParticipant (PlayerB teamGroupId should be cleared):');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  // ── STEP 6: Captain tries to leave (should fail — must disband) ────
  console.log('═══ STEP 6: Captain tries to leave');
  try {
    await captain.c.reducers.leaveTournamentTeam({ teamId });
    console.log('❌ FAIL: Should have been rejected');
  } catch (err: any) {
    console.log(`✅ Rejected: "${err.message}"`);
  }

  // ── STEP 7: Captain disbands team ──────────────────────────────────
  // First re-add PlayerB so we can test disband resets all members
  await playerB.c.reducers.requestJoinTeam({ teamId });
  await sleep(500);
  await captain.c.reducers.acceptTeamRequest({ teamId, userId: playerB.userId });
  await sleep(1500);

  console.log('\n═══ STEP 7: Captain disbands team (with PlayerB on it)');
  console.log('📸 Before disband — TournamentTeam:');
  console.log(queryDB('TournamentTeam', `tournament_id = ${tid}`));

  await captain.c.reducers.disbandTournamentTeam({ teamId });
  await sleep(1500);

  console.log('📸 After disband — TournamentTeam (should be empty):');
  console.log(queryDB('TournamentTeam', `tournament_id = ${tid}`));
  console.log('📸 After disband — TournamentParticipant (all teamGroupId cleared):');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  console.log('\n═══ TEST 9 COMPLETE ═══');
  host.c.disconnect(); captain.c.disconnect(); playerB.c.disconnect();
  playerC.c.disconnect(); playerD.c.disconnect();
  process.exit(0);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
