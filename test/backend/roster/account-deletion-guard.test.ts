/**
 * Integration tests: HSR Account Deletion Guards (Phase 10.4)
 *
 * Covers:
 * 1. delete_hsr_account blocked when account in active LobbyMemberAccount
 * 2. delete_hsr_account succeeds after leaving lobby (no LMA)
 * 3. admin_delete_hsr_account blocked when account in active LMA
 * 4. admin_delete_hsr_account succeeds after leaving lobby
 * 5. delete_hsr_account blocked when account locked in active tournament (TPA guard)
 *
 * LobbyMemberAccount is PRIVATE — verified via `spacetime sql`, not subscription cache.
 * HsrAccount is PRIVATE — verified via `spacetime sql`.
 *
 * Requires: SPACETIMEDB_SERVER_TOKEN in .env.local (post-publish bootstrap)
 *
 * Contract: docs/roster/contract.md — Account Deletion Guard scenarios
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    createVerifiedTestHarness,
    hasServerToken,
    expectReducerError,
    queryPrivateTable,
    type TestHarness,
} from '../../shared/connection';
import { nextUid, resetUidCounter } from '../../shared/fixtures';
import { DbConnection } from '../../../src/module_bindings';

const DB = process.env.SPACETIMEDB_DB ?? 'hsrpvp-spacetimedb-nextjs-test1';

// ─── Helpers ────────────────────────────────────────────────────────────────

function defaultLobbyArgs(overrides: Record<string, unknown> = {}) {
    return {
        joinCode: '',
        presetId: 0,
        teamSize: 1,
        draftMode: { tag: 'Classic' as const, value: {} },
        banMode: { tag: 'None' as const, value: {} },
        gameMode: { tag: 'MemoryOfChaos' as const, value: {} },
        matchType: { tag: 'Casual' as const, value: {} },
        isPublic: true,
        password: '',
        standardTurnSeconds: 60,
        reserveBankSeconds: 120,
        characterBudget: 100,
        lightconeBudget: 50,
        minimumBidRaise: 0.5,
        rosterDiffAdvantage: 0,
        rosterThreshold: 0,
        underThresholdAdvantage: 0,
        aboveThresholdPenalty: 0,
        deathPenalty: 0,
        isAnonymousPlayers: false,
        isAnonymousSpectators: false,
        rosterVisibility: { tag: 'OpenRoster' as const, value: {} },
        requireOwnership: false,
        costSetId: 0,
        disconnectPolicy: { tag: 'Deferred' as const, value: {} },
        disconnectForfeitSeconds: 0,
        allowMirrorPicks: true,
        autoRandomPick: false,
        refereeCanUndo: true,
        refereeCanPause: true,
        refereeCanSetCaptain: true,
        refereeCanKick: true,
        allowPlayerPause: true,
        teamBlueAlias: 'Blue',
        teamRedAlias: 'Red',
        bestOf: 1,
        refereeControlsShelving: true,
        ...overrides,
    };
}

/** Get lobbies created by this user */
function myLobbies(h: TestHarness) {
    return [...h.conn.db.Lobby.iter()].filter(l => l.hostUserId === h.userId);
}

/** Promote user via server connection */
async function promoteUser(username: string, role: string): Promise<void> {
    const host = process.env.SPACETIMEDB_URI ?? 'wss://maincloud.spacetimedb.com';
    const token = process.env.SPACETIMEDB_SERVER_TOKEN!;
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Promote timeout')), 10000);
        DbConnection.builder()
            .withUri(host)
            .withDatabaseName(DB)
            .withToken(token)
            .onConnect((conn) => {
                conn.reducers.serverSetRole({ username, roleTag: role });
                setTimeout(() => { clearTimeout(timeout); resolve(); }, 1000);
            })
            .onConnectError((_ctx, err) => { clearTimeout(timeout); reject(err); })
            .build();
    });
}

/** Query LobbyMemberAccount rows for a user via spacetime sql (private table) */
async function queryLma(userId: number): Promise<Record<string, string>[]> {
    return queryPrivateTable(
        `SELECT * FROM lobby_member_account WHERE user_id = ${userId}`
    );
}

/** Query HsrAccount rows for a user via spacetime sql (private table) */
async function queryHsrAccounts(userId: number): Promise<Record<string, string>[]> {
    return queryPrivateTable(
        `SELECT * FROM hsr_account WHERE user_id = ${userId}`
    );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe.skipIf(!hasServerToken())('HSR Account Deletion Guards', () => {
    let host: TestHarness;
    let player: TestHarness;
    let admin: TestHarness;

    beforeAll(async () => {
        resetUidCounter();

        // Create three verified harnesses: host, player, admin
        host = await createVerifiedTestHarness();
        player = await createVerifiedTestHarness();
        admin = await createVerifiedTestHarness();

        await host.sync();
        await player.sync();
        await admin.sync();

        // Promote admin harness to Admin role
        const adminUser = [...admin.conn.db.User.iter()].find(u => u.id === admin.userId);
        expect(adminUser).toBeDefined();
        try {
            await promoteUser(adminUser!.username, 'Admin');
        } catch {
            // May fail if already promoted from prior run — non-fatal
        }
        await admin.sync(1500);
    }, 60000);

    afterAll(async () => {
        // Demote admin back to User (best-effort)
        try {
            const adminUser = [...admin.conn.db.User.iter()].find(u => u.id === admin.userId);
            if (adminUser) {
                await promoteUser(adminUser.username, 'User');
            }
        } catch {
            // Non-fatal on cleanup
        }
        await host?.disconnect();
        await player?.disconnect();
        await admin?.disconnect();
    });

    // ── Test 1: delete_hsr_account blocked when account in active LMA ────

    it('delete_hsr_account blocked when account is in active LobbyMemberAccount', async () => {
        // Player creates an HSR account
        const uid = nextUid();
        await player.call.createHsrAccount({ uid, displayLabel: 'Guard Test 1' });
        await player.sync();

        // Host creates a lobby
        await host.call.createLobby(defaultLobbyArgs());
        await host.sync(1500);

        const lobbies = myLobbies(host);
        const lobby = lobbies[lobbies.length - 1];

        // Player joins lobby — auto-creates LMA for active account
        await player.call.joinLobby({ lobbyId: lobby.id, joinCode: '', password: '' });
        await player.sync();

        // Verify LMA exists via spacetime sql
        const lmaRows = await queryLma(player.userId);
        expect(lmaRows.length).toBeGreaterThan(0);

        // Find the player's account ID
        const accountRows = await queryHsrAccounts(player.userId);
        const account = accountRows.find(a => a.uid.replace(/"/g, '') === uid);
        expect(account).toBeDefined();
        const hsrAccountId = parseInt(account!.id, 10);

        // Attempt to delete — should be blocked by LMA guard
        const err = await expectReducerError(
            player.call.deleteHsrAccount({ hsrAccountId })
        );
        expect(err).toContain('Cannot delete an account that is selected in an active lobby');

        // Cleanup
        await player.call.leaveLobby({ lobbyId: lobby.id });
        await player.sync();
        await host.call.closeLobby({ lobbyId: lobby.id });
        await host.sync();

        // Now delete the account (should succeed after leaving)
        await player.call.deleteHsrAccount({ hsrAccountId });
        await player.sync();
    }, 30000);

    // ── Test 2: delete_hsr_account succeeds after leaving lobby ──────────

    it('delete_hsr_account succeeds after leaving lobby (no LMA)', async () => {
        // Player creates an HSR account
        const uid = nextUid();
        await player.call.createHsrAccount({ uid, displayLabel: 'Guard Test 2' });
        await player.sync();

        // Host creates a lobby
        await host.call.createLobby(defaultLobbyArgs());
        await host.sync(1500);

        const lobbies = myLobbies(host);
        const lobby = lobbies[lobbies.length - 1];

        // Player joins lobby — LMA created
        await player.call.joinLobby({ lobbyId: lobby.id, joinCode: '', password: '' });
        await player.sync();

        // Player leaves lobby — LMA deleted
        await player.call.leaveLobby({ lobbyId: lobby.id });
        await player.sync();

        // Verify LMA gone
        const lmaRows = await queryLma(player.userId);
        const lobbyLma = lmaRows.filter(r => r.lobby_id === String(lobby.id));
        expect(lobbyLma.length).toBe(0);

        // Find account ID
        const accountRows = await queryHsrAccounts(player.userId);
        const account = accountRows.find(a => a.uid.replace(/"/g, '') === uid);
        expect(account).toBeDefined();
        const hsrAccountId = parseInt(account!.id, 10);

        // Delete should succeed
        await player.call.deleteHsrAccount({ hsrAccountId });
        await player.sync();

        // Verify account gone via spacetime sql
        const accountRowsAfter = await queryHsrAccounts(player.userId);
        const deleted = accountRowsAfter.find(a => a.uid.replace(/"/g, '') === uid);
        expect(deleted).toBeUndefined();

        // Cleanup lobby
        await host.call.closeLobby({ lobbyId: lobby.id });
        await host.sync();
    }, 30000);

    // ── Test 3: admin_delete_hsr_account blocked when account in active LMA ─

    it('admin_delete_hsr_account blocked when account is in active LobbyMemberAccount', async () => {
        // Player creates an HSR account
        const uid = nextUid();
        await player.call.createHsrAccount({ uid, displayLabel: 'Guard Test 3' });
        await player.sync();

        // Host creates a lobby
        await host.call.createLobby(defaultLobbyArgs());
        await host.sync(1500);

        const lobbies = myLobbies(host);
        const lobby = lobbies[lobbies.length - 1];

        // Player joins lobby — auto-creates LMA
        await player.call.joinLobby({ lobbyId: lobby.id, joinCode: '', password: '' });
        await player.sync();

        // Find account ID
        const accountRows = await queryHsrAccounts(player.userId);
        const account = accountRows.find(a => a.uid.replace(/"/g, '') === uid);
        expect(account).toBeDefined();
        const hsrAccountId = parseInt(account!.id, 10);

        // Admin attempts to delete — should be blocked by LMA guard
        const err = await expectReducerError(
            admin.call.adminDeleteHsrAccount({ hsrAccountId })
        );
        expect(err).toContain('Cannot delete an account that is selected in an active lobby');

        // Cleanup
        await player.call.leaveLobby({ lobbyId: lobby.id });
        await player.sync();
        await host.call.closeLobby({ lobbyId: lobby.id });
        await host.sync();
        await player.call.deleteHsrAccount({ hsrAccountId });
        await player.sync();
    }, 30000);

    // ── Test 4: admin_delete_hsr_account succeeds after leaving lobby ────

    it('admin_delete_hsr_account succeeds after leaving lobby', async () => {
        // Player creates an HSR account
        const uid = nextUid();
        await player.call.createHsrAccount({ uid, displayLabel: 'Guard Test 4' });
        await player.sync();

        // Host creates a lobby
        await host.call.createLobby(defaultLobbyArgs());
        await host.sync(1500);

        const lobbies = myLobbies(host);
        const lobby = lobbies[lobbies.length - 1];

        // Player joins lobby — LMA created
        await player.call.joinLobby({ lobbyId: lobby.id, joinCode: '', password: '' });
        await player.sync();

        // Player leaves lobby — LMA deleted
        await player.call.leaveLobby({ lobbyId: lobby.id });
        await player.sync();

        // Find account ID
        const accountRows = await queryHsrAccounts(player.userId);
        const account = accountRows.find(a => a.uid.replace(/"/g, '') === uid);
        expect(account).toBeDefined();
        const hsrAccountId = parseInt(account!.id, 10);

        // Admin deletes — should succeed
        await admin.call.adminDeleteHsrAccount({ hsrAccountId });
        await admin.sync();

        // Verify account gone via spacetime sql
        const accountRowsAfter = await queryHsrAccounts(player.userId);
        const deleted = accountRowsAfter.find(a => a.uid.replace(/"/g, '') === uid);
        expect(deleted).toBeUndefined();

        // Cleanup lobby
        await host.call.closeLobby({ lobbyId: lobby.id });
        await host.sync();
    }, 30000);

    // ── Test 5: delete_hsr_account blocked when account locked in active tournament ─

    it('delete_hsr_account blocked when account locked in active tournament (TPA guard)', async () => {
        // Player creates an HSR account
        const uid = nextUid();
        await player.call.createHsrAccount({ uid, displayLabel: 'Guard Test 5 TPA' });
        await player.sync();

        // Promote host to TournamentHost so they can create tournaments
        const hostUser = [...host.conn.db.User.iter()].find(u => u.id === host.userId);
        expect(hostUser).toBeDefined();
        try {
            await promoteUser(hostUser!.username, 'TournamentHost');
        } catch {
            // May already be promoted
        }
        await host.sync(1500);

        // Host creates a tournament
        await host.call.createTournament({
            name: `DeletionGuardTest_${Date.now()}`,
            description: 'Test tournament for deletion guard',
            format: 'SingleElimination',
            teamSize: 1,
            defaultGameMode: 'MemoryOfChaos',
            maxParticipants: 16,
            rosterVisibility: 'OpenRoster',
            isAnonymousDefault: false,
            disconnectPolicy: 'NoAction',
            costSetId: 0,
            defaultBestOf: 1,
            groupSize: 4,
            has3RdPlaceMatch: false,
            autoAdvanceBracket: false,
            countTowardsMmr: false,
            winnerAdvantage: 0,
            requireVerified: false,
            requireRoster: false,
            minimumMmr: 0,
            requireApproval: false,
            waitlistEnabled: false,
            scheduledStartAt: '',
            registrationDeadline: '',
            maxAccountsPerPlayer: 1,
        });
        await host.sync(1500);

        // Find the tournament
        const tournaments = [...host.conn.db.Tournament.iter()].filter(
            t => t.organizerId === host.userId
        );
        const tournament = tournaments[tournaments.length - 1];
        expect(tournament).toBeDefined();

        // Advance to Registration stage
        await host.call.advanceTournamentStage({
            tournamentId: tournament.id,
            nextStage: 'Registration',
        });
        await host.sync();

        // Player registers — this locks their accounts in TournamentPlayerAccount
        await player.call.registerForTournament({ tournamentId: tournament.id });
        await player.sync();

        // Find account ID
        const accountRows = await queryHsrAccounts(player.userId);
        const account = accountRows.find(a => a.uid.replace(/"/g, '') === uid);
        expect(account).toBeDefined();
        const hsrAccountId = parseInt(account!.id, 10);

        // Attempt to delete — should be blocked by TPA guard
        const err = await expectReducerError(
            player.call.deleteHsrAccount({ hsrAccountId })
        );
        expect(err).toContain('Cannot delete an account locked in an active tournament');

        // Cleanup: cancel tournament to release the lock
        await host.call.cancelTournament({ tournamentId: tournament.id });
        await host.sync();

        // Demote host back to User (best-effort)
        try {
            await promoteUser(hostUser!.username, 'User');
        } catch {
            // Non-fatal
        }

        // Now delete should succeed (tournament cancelled)
        await player.call.deleteHsrAccount({ hsrAccountId });
        await player.sync();

        // Verify account gone
        const accountRowsAfter = await queryHsrAccounts(player.userId);
        const deleted = accountRowsAfter.find(a => a.uid.replace(/"/g, '') === uid);
        expect(deleted).toBeUndefined();
    }, 60000);
});
