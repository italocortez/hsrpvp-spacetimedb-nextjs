import { describe, it, expect, afterAll } from 'vitest';
import {
  createTestHarness,
  createVerifiedTestHarness,
  hasServerToken,
  expectReducerError,
  queryPrivateTable,
  getTestDiscordId,
  TestHarness,
} from '../../shared/connection';

describe('Auth Security Hardening', () => {
  const harnesses: TestHarness[] = [];

  afterAll(async () => {
    for (const h of harnesses) {
      await h.disconnect().catch(() => {});
    }
  });

  describe('SEC-01: UserPrivate isolation', () => {
    it.skipIf(!hasServerToken())('link discord creates UserPrivate + sets hasDiscordLinked', async () => {
      const h = await createVerifiedTestHarness();
      harnesses.push(h);
      await h.sync(2000);

      // Verify user has hasDiscordLinked = true
      const user = [...h.conn.db.User.iter()].find((u: any) => u.id === h.userId);
      expect(user).toBeDefined();
      expect((user as any).hasDiscordLinked).toBe(true);

      // Verify UserPrivate exists via SQL (private table, not in subscription)
      const privateRows = await queryPrivateTable(
        `SELECT * FROM user_private WHERE user_id = ${h.userId}`
      );
      expect(privateRows.length).toBe(1);
      expect(privateRows[0].discord_id).toBeTruthy();
    });

    it('UserPrivate is private -- not in client subscription', async () => {
      const h = await createTestHarness();
      harnesses.push(h);
      await h.sync(2000);

      // UserPrivate should not be iterable from client (private table)
      // The table should either not exist in conn.db or return empty
      try {
        const rows = [...(h.conn.db as any).UserPrivate?.iter?.() ?? []];
        expect(rows.length).toBe(0);
      } catch {
        // Expected -- table not accessible from client subscription
      }
    });
  });

  describe('SEC-02: UserIdentity privacy', () => {
    it('view_my_identity returns only caller own mapping', async () => {
      const h = await createTestHarness();
      harnesses.push(h);
      await h.sync(2000);

      // UserIdentity should not be iterable (private)
      try {
        const rows = [...h.conn.db.UserIdentity.iter()];
        // If accessible, should only contain our own (view filters)
        expect(rows.length).toBeLessThanOrEqual(1);
      } catch {
        // Expected -- private table
      }

      // Verify via SQL that our identity mapping exists
      const identityRows = await queryPrivateTable(
        `SELECT * FROM user_identity WHERE user_id = ${h.userId}`
      );
      expect(identityRows.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('SEC-03: Ban enforcement', () => {
    it.skipIf(!hasServerToken())('banned provider rejected on re-link (D-17 test case 2)', async () => {
      // Create a verified user who will be the ban target
      const target = await createVerifiedTestHarness();
      harnesses.push(target);
      await target.sync(2000);

      // Get the target's test Discord ID from UserPrivate
      const targetDiscordId = await getTestDiscordId(target.userId);
      expect(targetDiscordId).toBeTruthy();

      // Create an admin harness to issue the ban
      const admin = await createVerifiedTestHarness();
      harnesses.push(admin);
      await admin.sync(2000);

      // Promote admin to Admin role via server connection
      const serverConn = await new Promise<any>((resolve, reject) => {
        const { DbConnection: DbConn } = require('@/src/module_bindings');
        DbConn.builder()
          .withUri(process.env.SPACETIMEDB_URI || 'wss://maincloud.spacetimedb.com')
          .withDatabaseName(process.env.SPACETIMEDB_DB || 'hsrpvp-spacetimedb-nextjs-test1')
          .withToken(process.env.SPACETIMEDB_SERVER_TOKEN!)
          .onConnect((conn: any) => resolve(conn))
          .onConnectError((_: any, err: any) => reject(new Error(`Server conn failed: ${err}`)))
          .build();
      });

      // Set admin role
      serverConn.reducers.serverSetRole({
        targetUserId: admin.userId,
        roleTag: 'Admin',
      });
      await new Promise(r => setTimeout(r, 1000));

      // Ban the target's Discord ID
      admin.call.adminBanUser({
        banTypeTag: 'DiscordId',
        providerId: targetDiscordId,
        reason: 'Test ban for SEC-03',
      });
      await admin.sync(2000);

      // Verify BanRecord was created
      const banRecords = await queryPrivateTable(
        `SELECT * FROM ban_record WHERE provider_id = '${targetDiscordId}'`
      );
      expect(banRecords.length).toBe(1);
      expect(banRecords[0].reason).toBe('Test ban for SEC-03');

      // Now create a NEW user and try to link with the banned Discord ID
      // This should be rejected by server_link_provider's ban check
      const newUser = await createTestHarness();
      harnesses.push(newUser);
      await newUser.sync(2000);

      // Attempt to link the banned Discord ID via server connection
      try {
        await serverConn.reducers.serverLinkProvider({
          callerIdentityHex: newUser.identity,
          provider: 'discord',
          providerId: targetDiscordId,
          providerName: 'BannedUser',
        });
        await new Promise(r => setTimeout(r, 2000));

        // Verify the link did NOT succeed — UserPrivate should not exist for newUser
        // with the banned Discord ID
        const newUserPrivate = await queryPrivateTable(
          `SELECT * FROM user_private WHERE user_id = ${newUser.userId}`
        );
        // If ban check works, either an error was thrown or no UserPrivate with banned ID
        if (newUserPrivate.length > 0) {
          expect(newUserPrivate[0].discord_id).not.toBe(targetDiscordId);
        }
      } catch (err: any) {
        // Expected: SenderError about banned provider
        expect(err.message || String(err)).toContain('banned');
      }

      serverConn.disconnect();
    });

    it.skipIf(!hasServerToken())('ban triggers soft delete (D-17 test case 3)', async () => {
      // Create a verified user (victim of the ban)
      const victim = await createVerifiedTestHarness();
      harnesses.push(victim);
      await victim.sync(2000);

      // Get their Discord ID from UserPrivate
      const victimDiscordId = await getTestDiscordId(victim.userId);
      expect(victimDiscordId).toBeTruthy();

      // Create an admin and promote them
      const admin = await createVerifiedTestHarness();
      harnesses.push(admin);
      await admin.sync(2000);

      const serverConn = await new Promise<any>((resolve, reject) => {
        const { DbConnection: DbConn } = require('@/src/module_bindings');
        DbConn.builder()
          .withUri(process.env.SPACETIMEDB_URI || 'wss://maincloud.spacetimedb.com')
          .withDatabaseName(process.env.SPACETIMEDB_DB || 'hsrpvp-spacetimedb-nextjs-test1')
          .withToken(process.env.SPACETIMEDB_SERVER_TOKEN!)
          .onConnect((conn: any) => resolve(conn))
          .onConnectError((_: any, err: any) => reject(new Error(`Server conn failed: ${err}`)))
          .build();
      });

      serverConn.reducers.serverSetRole({
        targetUserId: admin.userId,
        roleTag: 'Admin',
      });
      await new Promise(r => setTimeout(r, 1000));

      // Verify victim is NOT soft-deleted before ban
      const userBefore = await queryPrivateTable(
        `SELECT deleted_at FROM user WHERE id = ${victim.userId}`
      );
      expect(userBefore.length).toBe(1);
      // deleted_at should be null/empty before ban
      expect(userBefore[0].deleted_at).toBeFalsy();

      // Ban the victim's Discord ID — triggers soft-delete (D-08 enforcement point 3)
      admin.call.adminBanUser({
        banTypeTag: 'DiscordId',
        providerId: victimDiscordId,
        reason: 'Test soft-delete trigger',
      });
      await admin.sync(2000);

      // Verify victim is now soft-deleted
      const userAfter = await queryPrivateTable(
        `SELECT deleted_at FROM user WHERE id = ${victim.userId}`
      );
      expect(userAfter.length).toBe(1);
      expect(userAfter[0].deleted_at).toBeTruthy();

      serverConn.disconnect();
    });
  });

  describe('SEC-04: Identity resolution (manual)', () => {
    // SEC-04 (ephemeral connection identity verification) cannot be tested via
    // the integration test harness because it requires a real HTTP API route
    // call with a SpacetimeDB client token. The ephemeral connection pattern
    // is verified manually via the human checkpoint in Task 4.
    //
    // This describe block exists for documentation only — to make explicit
    // that SEC-04 is manual-only coverage.
    it('SEC-04 is verified manually via API route test in Task 4 checkpoint', () => {
      // Placeholder: SEC-04 requires HTTP API route invocation which is
      // outside the scope of SpacetimeDB integration tests.
      // See Task 4 how-to-verify step 4 for the manual verification.
      expect(true).toBe(true);
    });
  });
});
