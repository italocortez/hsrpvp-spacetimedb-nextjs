/**
 * Integration tests: Tournament registration, waitlist, approval, and withdrawal.
 *
 * Covers:
 * - Register verified user -> TournamentParticipant row appears with isWaitlisted=false
 * - Reject duplicate registration
 * - Reject registration on Draft stage tournament
 * - Waitlist flow: maxParticipants=2, waitlistEnabled=true, requireApproval=true
 * - Approve participant -> approvedByToAt gets set
 * - Waitlist promote -> isWaitlisted=false, approvedByToAt set
 * - Withdraw -> participant status.tag changes to 'Withdrawn'
 * - Double-withdraw -> rejected
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createVerifiedTestHarness, hasServerToken, expectReducerError, type TestHarness } from '../../shared/connection';

describe.skipIf(!hasServerToken())('Tournament Registration', () => {
  let host: TestHarness;
  let player1: TestHarness;
  let player2: TestHarness;
  let player3: TestHarness;

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

  beforeAll(async () => {
    host = await createVerifiedTestHarness();
    player1 = await createVerifiedTestHarness();
    player2 = await createVerifiedTestHarness();
    player3 = await createVerifiedTestHarness();

    await promoteToRole(host, 'TournamentHost');
  }, 30000);

  afterAll(async () => {
    await host?.disconnect();
    await player1?.disconnect();
    await player2?.disconnect();
    await player3?.disconnect();
  });

  // ── Basic registration ──
  describe('basic registration', () => {
    let tid: number;

    it('creates a tournament and advances to Registration', async () => {
      await host.call.createTournament({
        name: 'Reg Test: Basic',
        description: 'Registration test',
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
      tid = mine[mine.length - 1].id;

      await host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
      await host.sync();

      const t = hostTournaments().find(t => t.id === tid);
      expect(t!.stage.tag).toBe('Registration');
    });

    it('registers verified user -> participant row with isWaitlisted=false', async () => {
      await player1.call.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
      await player1.sync();

      const participants = [...player1.conn.db.TournamentParticipant.iter()].filter(
        p => p.tournamentId === tid && p.userId === player1.userId
      );
      expect(participants.length).toBe(1);
      expect(participants[0].isWaitlisted).toBe(false);
      expect(participants[0].status.tag).toBe('Registered');
    });

    it('rejects duplicate registration', async () => {
      const msg = await expectReducerError(
        player1.call.registerForTournament({ tournamentId: tid, teamGroupId: 0 })
      );
      expect(msg.toLowerCase()).toMatch(/already|registered|duplicate/);
    });
  });

  // ── Reject registration on Draft stage ──
  it('rejects registration on Draft stage tournament', async () => {
    await host.call.createTournament({
      name: 'Reg Test: Draft Block',
      description: 'Should not allow registration in Draft',
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
    const draftTid = mine[mine.length - 1].id;
    expect(mine[mine.length - 1].stage.tag).toBe('Draft');

    const msg = await expectReducerError(
      player1.call.registerForTournament({ tournamentId: draftTid, teamGroupId: 0 })
    );
    expect(msg.toLowerCase()).toMatch(/registration|draft|stage/);
  });

  // ── Waitlist + Approval flow ──
  describe('waitlist and approval', () => {
    let tid: number;

    it('creates tournament with maxParticipants=2, waitlist+approval enabled', async () => {
      await host.call.createTournament({
        name: 'Reg Test: Waitlist',
        description: 'Waitlist and approval test',
        format: 'SingleElimination',
        teamSize: 1,
        defaultGameMode: 'MemoryOfChaos',
        maxParticipants: 2,
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
        requireApproval: true,
        waitlistEnabled: true,
        scheduledStartAt: '',
        registrationDeadline: '',
      });
      await host.sync();

      const mine = hostTournaments();
      tid = mine[mine.length - 1].id;

      await host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
      await host.sync();
    });

    it('first 2 registrants get isWaitlisted=false, 3rd gets isWaitlisted=true', async () => {
      // Register player1
      await player1.call.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
      await player1.sync();

      // Register player2
      await player2.call.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
      await player2.sync();

      // Register player3 — should be waitlisted
      await player3.call.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
      await player3.sync();

      await host.sync();
      const allParticipants = [...host.conn.db.TournamentParticipant.iter()].filter(
        p => p.tournamentId === tid
      );

      const p1 = allParticipants.find(p => p.userId === player1.userId);
      const p2 = allParticipants.find(p => p.userId === player2.userId);
      const p3 = allParticipants.find(p => p.userId === player3.userId);

      expect(p1).toBeDefined();
      expect(p2).toBeDefined();
      expect(p3).toBeDefined();
      expect(p1!.isWaitlisted).toBe(false);
      expect(p2!.isWaitlisted).toBe(false);
      expect(p3!.isWaitlisted).toBe(true);
    });

    it('approve participant -> approvedByToAt gets set', async () => {
      await host.call.approveParticipant({ tournamentId: tid, userId: player1.userId });
      await host.sync();

      const p = [...host.conn.db.TournamentParticipant.iter()].find(
        p => p.tournamentId === tid && p.userId === player1.userId
      );
      expect(p).toBeDefined();
      expect(p!.approvedByToAt).toBeDefined();
      expect(p!.approvedByToAt).not.toBeNull();
    });

    it('waitlist promote -> isWaitlisted=false, approvedByToAt set', async () => {
      // First withdraw player2 to open a slot
      await player2.call.withdrawFromTournament({ tournamentId: tid });
      await player2.sync();
      await host.sync();

      // Now promote player3 from waitlist
      await host.call.waitlistPromote({ tournamentId: tid, userId: player3.userId });
      await host.sync();

      const p3 = [...host.conn.db.TournamentParticipant.iter()].find(
        p => p.tournamentId === tid && p.userId === player3.userId
      );
      expect(p3).toBeDefined();
      expect(p3!.isWaitlisted).toBe(false);
      expect(p3!.approvedByToAt).toBeDefined();
      expect(p3!.approvedByToAt).not.toBeNull();
    });
  });

  // ── Withdraw flow ──
  describe('withdrawal', () => {
    let tid: number;

    it('creates tournament and registers a player', async () => {
      await host.call.createTournament({
        name: 'Reg Test: Withdraw',
        description: 'Withdrawal test',
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
      tid = mine[mine.length - 1].id;

      await host.call.advanceTournamentStage({ tournamentId: tid, nextStage: 'Registration' });
      await host.sync();

      await player1.call.registerForTournament({ tournamentId: tid, teamGroupId: 0 });
      await player1.sync();
    });

    it('withdraw -> status.tag changes to Withdrawn', async () => {
      await player1.call.withdrawFromTournament({ tournamentId: tid });
      await player1.sync();

      const p = [...player1.conn.db.TournamentParticipant.iter()].find(
        p => p.tournamentId === tid && p.userId === player1.userId
      );
      expect(p).toBeDefined();
      expect(p!.status.tag).toBe('Withdrawn');
    });

    it('double-withdraw -> rejected', async () => {
      const msg = await expectReducerError(
        player1.call.withdrawFromTournament({ tournamentId: tid })
      );
      expect(msg.toLowerCase()).toMatch(/already|withdrawn/);
    });
  });
});
