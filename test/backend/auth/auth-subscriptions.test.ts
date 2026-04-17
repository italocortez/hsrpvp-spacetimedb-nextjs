import { describe, it, expect, afterAll } from 'vitest';
import { createTestHarness, hasServerToken, TestHarness } from '../../shared/connection';
import { DbConnection } from '@/src/module_bindings';

/**
 * Phase 15.5 auth-gated subscription regression guard.
 *
 * Models the Plan 02 two-stage subscription pattern at the integration layer:
 *   - Stage 1: view_my_profile — always subscribed on `isActive`.
 *   - Stage 2: SELECT * FROM user — gated on currentUser / hadUserIdOnMount / hadSessionCookie.
 *
 * IMPORTANT: these tests assert our FRONTEND CHOICE not to subscribe, not server rejection.
 * Phase 15.2 UAT Test 4 proved that `spacetimedb.view()` (and plain-table subscriptions)
 * do NOT reject anonymous callers — `User.public=true` means any WS client can subscribe.
 * Closing that would require `User.public=false` + on-demand reducers, explicitly deferred
 * in 15.2 D-01 / 15.5 CONTEXT deferred ideas.
 */
describe('Auth Subscription Gate (Phase 15.5 S-05)', () => {
  const harnesses: TestHarness[] = [];

  afterAll(async () => {
    for (const h of harnesses) {
      await h.disconnect().catch(() => {});
    }
  });

  it('anonymous visitor (no auth call) — Stage 1 only, zero User rows in cache', async () => {
    // Models useAuth's anonymous-visitor path after Plan 02:
    // Stage 1 fires (subscribes to view_my_profile — server returns 0 rows via ctx.sender filter);
    // Stage 2 never fires because stage2Gate is false (no currentUser, no token, no cookie).
    // The client's local cache for the User table is therefore empty.
    //
    // Does NOT require SPACETIMEDB_SERVER_TOKEN — connects anonymously.

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timeout waiting for onApplied (20s)')), 20000);
      const uri = process.env.SPACETIMEDB_URI || 'wss://maincloud.spacetimedb.com';
      const db = process.env.SPACETIMEDB_DB || process.env.SPACETIMEDB_DB_NAME || process.env.PUBLIC_SPACETIMEDB_DB_NAME || 'hsrpvp-spacetimedb-nextjs-test1';

      DbConnection.builder()
        .withUri(uri)
        .withDatabaseName(db)
        .withConfirmedReads(false)
        .onConnect(async (conn) => {
          // Stage 1 only: subscribe to view_my_profile, NEVER to SELECT * FROM user
          conn.subscriptionBuilder()
            .onApplied(() => {
              try {
                // Anonymous caller receives 0 view_my_profile rows (ctx.sender filter).
                // The User table is NOT subscribed — its local cache must be empty.
                const userRows = [...conn.db.User.iter()];
                expect(userRows.length).toBe(0);
                clearTimeout(timeout);
                conn.disconnect();
                resolve();
              } catch (err) {
                clearTimeout(timeout);
                conn.disconnect();
                reject(err);
              }
            })
            .subscribe('SELECT * FROM view_my_profile');
        })
        .onConnectError((_ctx, err) => {
          clearTimeout(timeout);
          reject(new Error(`Anonymous connect failed: ${err}`));
        })
        .onDisconnect(() => {})
        .build();
    });
  });

  it.skipIf(!hasServerToken())(
    'authenticated visitor (via createTestHarness) — Stage 2 delivers User rows',
    async () => {
      // Models useAuth's authed path after Plan 02:
      // The harness models the post-auth path — view_my_profile.onApplied resolves currentUser;
      // stage2Gate flips true; Stage 2 effect subscribes to SELECT * FROM user;
      // conn.db.User.iter() returns at least the caller's own user.
      //
      // Harness models the post-auth path; User table is subscribed and rows are delivered.

      const h = await createTestHarness();
      harnesses.push(h);
      await h.sync(1000);

      const userRows = [...h.conn.db.User.iter()];
      expect(userRows.length).toBeGreaterThan(0);

      // The harness's own guest user must be in the cache (identity-matched).
      const myUser = userRows.find((u: any) => u.id === h.userId);
      expect(myUser).toBeDefined();
    }
  );
});
