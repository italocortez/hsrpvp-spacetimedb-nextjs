/**
 * Quick verify: solo registration now sets participantType=Team
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

async function main() {
  const { DbConnection } = await import('@/src/module_bindings');

  // Connect + verify + promote
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

  const discordId = `fix7_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DbConnection.builder().withUri(URI).withDatabaseName(DB).withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverLinkDiscord({ callerIdentityHex: identity, discordId, discordUsername: `Fix7_${discordId.slice(-8)}` });
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

  // Create tournament in Registration
  await c.reducers.createTournament({
    name: 'Fix7 Type Test', description: 'Verify participantType=Team',
    format: 'SingleElimination', teamSize: 1, defaultGameMode: 'MemoryOfChaos',
    maxParticipants: 8, rosterVisibility: 'OpenRoster', isAnonymousDefault: false,
    disconnectPolicy: 'Pause', costSetId: 0, defaultBestOf: 3, groupSize: 4,
    has3RdPlaceMatch: false, autoAdvanceBracket: true, countTowardsMmr: false,
    winnerAdvantage: 0, requireVerified: false, requireRoster: false, minimumMmr: 0,
    requireApproval: false, waitlistEnabled: false, scheduledStartAt: '', registrationDeadline: '',
  });
  await sleep(1500);
  const tid = [...c.db.Tournament.iter()].find((t: any) => t.name === 'Fix7 Type Test')!.id;
  await c.reducers.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
  await sleep(1500);

  // Register a second user as participant
  const p = await new Promise<any>((resolve, reject) => {
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
  const pDiscordId = `fix7p_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), 10000);
    DbConnection.builder().withUri(URI).withDatabaseName(DB).withToken(SERVER_TOKEN)
      .onConnect(async (sc: any) => {
        await sc.reducers.serverLinkDiscord({ callerIdentityHex: p.identity, discordId: pDiscordId, discordUsername: `Fix7P_${pDiscordId.slice(-8)}` });
        clearTimeout(timeout); sc.disconnect(); setTimeout(resolve, 500);
      })
      .onConnectError((_: any, err: any) => { clearTimeout(timeout); reject(err); })
      .onDisconnect(() => {}).build();
  });
  await p.conn.reducers.loginAsGuest({});
  await sleep(1500);

  await p.conn.reducers.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
  await sleep(1500);

  console.log('📸 TournamentParticipant (after solo registration with fix):');
  console.log(queryDB('TournamentParticipant', `tournament_id = ${tid}`));

  console.log('📸 TournamentTeam (auto-created):');
  console.log(queryDB('TournamentTeam', `tournament_id = ${tid}`));

  c.disconnect();
  p.conn.disconnect();
  process.exit(0);
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
