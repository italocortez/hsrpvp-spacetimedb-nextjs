/**
 * SpacetimeDB integration test connection helper.
 *
 * Two harness types:
 *   - createTestHarness(): Guest user — for permission guard tests
 *   - createVerifiedTestHarness(): Verified user — for roster CRUD tests
 *     (requires SPACETIMEDB_SERVER_TOKEN env var)
 *
 * Reducer calls return Promises:
 *   - Resolves on success (committed)
 *   - Rejects with SenderError on reducer error (validation, permissions)
 */

import { DbConnection } from '@/src/module_bindings';

// Default to maincloud, overridable via env
const SPACETIMEDB_URI = process.env.SPACETIMEDB_URI || 'wss://maincloud.spacetimedb.com';
const SPACETIMEDB_DB = process.env.SPACETIMEDB_DB || 'hsrpvp-spacetimedb-nextjs-test1';
const SERVER_TOKEN = process.env.SPACETIMEDB_SERVER_TOKEN || '';

export interface TestHarness {
  conn: DbConnection;
  identity: string;
  /** Numeric user ID from the User table — use to filter iter() results to this test's user */
  userId: number;
  /** Typed reducer calls — each returns Promise<void>, rejects with SenderError on failure */
  call: DbConnection['reducers'];
  /** Wait for subscription cache to sync after reducer calls */
  sync: (ms?: number) => Promise<void>;
  disconnect: () => Promise<void>;
}

/** Check if a server token is available for verified user tests */
export function hasServerToken(): boolean {
  return SERVER_TOKEN.length > 0;
}

/**
 * Creates a connected test harness with subscriptions to all tables.
 * Logs in as guest — good for permission guard tests.
 */
export async function createTestHarness(): Promise<TestHarness> {
  return createHarnessInternal({ verify: false });
}

/**
 * Creates a connected test harness with a verified (non-guest) user.
 * Requires SPACETIMEDB_SERVER_TOKEN env var.
 * Calls server_link_discord to upgrade the guest to a verified user.
 */
export async function createVerifiedTestHarness(): Promise<TestHarness> {
  if (!hasServerToken()) {
    throw new Error(
      'SPACETIMEDB_SERVER_TOKEN required for verified test harness. ' +
      'Set it in .env.local (written by scripts/post-publish.ts)'
    );
  }
  return createHarnessInternal({ verify: true });
}

function createHarnessInternal(opts: { verify: boolean }): Promise<TestHarness> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Connection timeout (15s)')), 15000);

    const builder = DbConnection.builder()
      .withUri(SPACETIMEDB_URI)
      .withDatabaseName(SPACETIMEDB_DB);

    builder
      .onConnect(async (connInner, identity, _token) => {
        connInner.subscriptionBuilder().subscribeToAllTables();

        const identityHex = identity.toHexString();

        // Login as guest first
        await connInner.reducers.loginAsGuest({});

        if (opts.verify && SERVER_TOKEN) {
          // Create a second connection with the server token to call server_link_discord
          await verifyUserViaServerConnection(identityHex);
          // Re-login to refresh the user data in subscription cache
          await connInner.reducers.loginAsGuest({});
        }

        clearTimeout(timeout);
        // Wait for subscription sync, then resolve userId from cache
        setTimeout(() => {
          // Look up this connection's userId via UserIdentity → User
          const mapping = [...connInner.db.UserIdentity.iter()].find(
            (m) => m.identity.toHexString() === identityHex
          );
          const userId = mapping ? mapping.userId : 0;

          const harness: TestHarness = {
            conn: connInner,
            identity: identityHex,
            userId,
            call: connInner.reducers,

            sync(ms = 500): Promise<void> {
              return new Promise((res) => setTimeout(res, ms));
            },

            async disconnect(): Promise<void> {
              connInner.disconnect();
            },
          };

          resolve(harness);
        }, 2000);
      })
      .onConnectError((_ctx, err) => {
        clearTimeout(timeout);
        reject(new Error(`SpacetimeDB connection failed: ${err}`));
      })
      .onDisconnect(() => {})
      .build();
  });
}

/**
 * Uses a server-token connection to call server_link_discord,
 * which upgrades a guest user to verified.
 */
function verifyUserViaServerConnection(targetIdentityHex: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server connection timeout')), 10000);

    // Generate a unique fake Discord ID for test users
    const testDiscordId = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    DbConnection.builder()
      .withUri(SPACETIMEDB_URI)
      .withDatabaseName(SPACETIMEDB_DB)
      .withToken(SERVER_TOKEN)
      .onConnect(async (serverConn) => {
        try {
          await serverConn.reducers.serverLinkDiscord({
            callerIdentityHex: targetIdentityHex,
            discordId: testDiscordId,
            discordUsername: `TestUser_${testDiscordId.slice(-6)}`,
          });
          clearTimeout(timeout);
          serverConn.disconnect();
          // Give time for the update to propagate
          setTimeout(resolve, 500);
        } catch (err) {
          clearTimeout(timeout);
          serverConn.disconnect();
          reject(err);
        }
      })
      .onConnectError((_ctx, err) => {
        clearTimeout(timeout);
        reject(new Error(`Server connection failed: ${err}`));
      })
      .onDisconnect(() => {})
      .build();
  });
}

/**
 * Helper: call a reducer expecting it to fail, return the error message.
 * If it doesn't fail, throws an assertion error.
 */
export async function expectReducerError(
  promise: Promise<void>
): Promise<string> {
  try {
    await promise;
    throw new Error('Expected reducer to fail, but it succeeded');
  } catch (err: any) {
    if (err.message === 'Expected reducer to fail, but it succeeded') throw err;
    return err.message || String(err);
  }
}

/**
 * Utility: wait for a fixed duration (use sparingly — prefer sync()).
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
