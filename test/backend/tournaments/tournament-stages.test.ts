/**
 * Integration tests: Tournament stage advancement and cancellation.
 *
 * Covers:
 * - Advance Draft -> Registration (happy path)
 * - Advance Registration -> Seeding with 2+ participants
 * - Reject stage skip (Draft -> InProgress)
 * - Reject backward transition (Registration -> Draft)
 * - Cancel from Draft
 * - Cancel from Registration
 * - Cancel already-cancelled tournament
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createVerifiedTestHarness, hasServerToken, expectReducerError, type TestHarness } from '../../shared/connection';

describe.skipIf(!hasServerToken())('Tournament Stages', () => {
  let host: TestHarness;
  let player1: TestHarness;
  let player2: TestHarness;

  const hostTournaments = () => [...host.conn.db.Tournament.iter()].filter(t => t.organizerId === host.userId);

  /** Helper to promote a harness user to a role via server connection */
  async function promoteToRole(h: TestHarness, roleTag: string) {
    const user = [...h.conn.db.User.iter()].find(u => u.id === h.userId);
    if (!user) throw new Error(`User ${h.userId} not found in cache`);
    const username = user.username;

    const { DbConnection } = await import('@/src/module_bindings');
    const serverToken = process.env.SPACETIMEDB_SERVER_TOKEN || '';
    const uri = process.env.SPACETIMEDB_URI || 'wss://maincloud.spacetimedb.com';
    const db = process.env.SPACETIMEDB_DB || 'hsrpvp-spacetimedb-nextjs-test1';

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Server promote timeout')), 10000);
      DbConnection.builder()
        .withUri(uri)
        .withDatabaseName(db)
        .withToken(serverToken)
        .onConnect(async (serverConn) => {
          try {
            await serverConn.reducers.serverSetRole({ username, roleTag });
            clearTimeout(timeout);
            serverConn.disconnect();
            setTimeout(resolve, 500);
          } catch (err) {
            clearTimeout(timeout);
            serverConn.disconnect();
            reject(err);
          }
        })
        .onConnectError((_ctx: any, err: any) => {
          clearTimeout(timeout);
          reject(new Error(`Server connection failed: ${err}`));
        })
        .onDisconnect(() => {})
        .build();
    });

    await h.sync(1000);
  }

  /** Helper to create a standard tournament and return its id */
  async function createStandardTournament(name: string): Promise<number> {
    const countBefore = hostTournaments().length;
    await host.call.createTournament({
      name,
      description: 'Stage advancement test',
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
    await host.sync();

    const mine = hostTournaments();
    expect(mine.length).toBe(countBefore + 1);
    return mine[mine.length - 1].id;
  }

  beforeAll(async () => {
    host = await createVerifiedTestHarness();
    player1 = await createVerifiedTestHarness();
    player2 = await createVerifiedTestHarness();

    await promoteToRole(host, 'TournamentHost');
  }, 30000);

  afterAll(async () => {
    await host?.disconnect();
    await player1?.disconnect();
    await player2?.disconnect();
  });

  // ── Happy path: Draft -> Registration ──
  it('advances Draft -> Registration', async () => {
    const tid = await createStandardTournament('Stage Test: Draft->Reg');

    await host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
    await host.sync();

    const t = hostTournaments().find(t => t.id === tid);
    expect(t).toBeDefined();
    expect(t!.stage.tag).toBe('Registration');
  });

  // ── Happy path: Registration -> Seeding with 2 participants ──
  it('advances Registration -> Seeding with 2+ participants', async () => {
    const tid = await createStandardTournament('Stage Test: Reg->Seed');

    // Advance to Registration first
    await host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
    await host.sync();

    // Register 2 players
    await player1.call.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
    await player1.sync();
    await player2.call.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
    await player2.sync();

    // Verify participants exist
    await host.sync();
    const participants = [...host.conn.db.TournamentParticipant.iter()].filter(
      p => p.tournamentId === tid && !p.isWaitlisted && p.status.tag !== 'Withdrawn'
    );
    expect(participants.length).toBeGreaterThanOrEqual(2);

    // Advance to Seeding
    await host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'Seeding' });
    await host.sync();

    const t = hostTournaments().find(t => t.id === tid);
    expect(t).toBeDefined();
    expect(t!.stage.tag).toBe('Seeding');
  });

  // ── Reject stage skip: Draft -> InProgress ──
  it('rejects stage skip (Draft -> InProgress)', async () => {
    const tid = await createStandardTournament('Stage Test: Skip');

    const msg = await expectReducerError(
      host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'InProgress' })
    );
    expect(msg.toLowerCase()).toMatch(/invalid|transition|stage/);
  });

  // ── Reject backward transition: Registration -> Draft ──
  it('rejects backward transition (Registration -> Draft)', async () => {
    const tid = await createStandardTournament('Stage Test: Backward');

    await host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
    await host.sync();

    const msg = await expectReducerError(
      host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'Draft' })
    );
    expect(msg.toLowerCase()).toMatch(/invalid|transition|stage/);
  });

  // ── Cancel from Draft ──
  it('cancels tournament from Draft', async () => {
    const tid = await createStandardTournament('Stage Test: Cancel Draft');

    await host.call.cancelTournament({ tournamentId: tid });
    await host.sync();

    const t = hostTournaments().find(t => t.id === tid);
    expect(t).toBeDefined();
    expect(t!.stage.tag).toBe('Cancelled');
  });

  // ── Cancel from Registration ──
  it('cancels tournament from Registration', async () => {
    const tid = await createStandardTournament('Stage Test: Cancel Reg');

    await host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
    await host.sync();

    await host.call.cancelTournament({ tournamentId: tid });
    await host.sync();

    const t = hostTournaments().find(t => t.id === tid);
    expect(t).toBeDefined();
    expect(t!.stage.tag).toBe('Cancelled');
  });

  // ── Cancel already-cancelled ──
  it('rejects cancelling an already-cancelled tournament', async () => {
    const tid = await createStandardTournament('Stage Test: Double Cancel');

    await host.call.cancelTournament({ tournamentId: tid });
    await host.sync();

    const msg = await expectReducerError(
      host.call.cancelTournament({ tournamentId: tid })
    );
    expect(msg.toLowerCase()).toMatch(/cancel|already/);
  });
});
