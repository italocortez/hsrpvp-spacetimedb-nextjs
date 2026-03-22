/**
 * Integration tests: Season admin CRUD and single-active guarantee.
 *
 * Covers:
 * - Admin can create a season (isActive=false by default)
 * - Non-admin is rejected with permission error
 * - set_active_season activates target and deactivates all others
 * - set_active_season rejects non-existent seasonId
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  createVerifiedTestHarness,
  createTestHarness,
  hasServerToken,
  expectReducerError,
  type TestHarness,
} from '../../shared/connection';
import { Timestamp } from 'spacetimedb';

describe.skipIf(!hasServerToken())('Season Admin', () => {
  let admin: TestHarness;
  let regularUser: TestHarness;

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

  const allSeasons = (h: TestHarness) => [...h.conn.db.Season.iter()];
  const activeSeasons = (h: TestHarness) => allSeasons(h).filter(s => s.isActive);

  beforeAll(async () => {
    admin = await createVerifiedTestHarness();
    regularUser = await createVerifiedTestHarness();

    await promoteToRole(admin, 'Admin');
  }, 30000);

  afterAll(async () => {
    await admin?.disconnect();
    await regularUser?.disconnect();
  });

  // ─── Test 1: Admin can create a season ────────────────────────────────────

  // Use unique names to avoid collisions with prior test runs on shared DB
  const uniqueSuffix = Date.now().toString(36);
  const SEASON_1 = `IntTest Season A ${uniqueSuffix}`;
  const SEASON_2 = `IntTest Season B ${uniqueSuffix}`;

  it('admin can create a season with isActive=false by default', async () => {
    const beforeCount = allSeasons(admin).length;

    await admin.call.createSeason({
      name: SEASON_1,
      startDate: Timestamp.now(),
      endDate: null,
    });
    await admin.sync(1500);

    const seasons = allSeasons(admin);
    expect(seasons.length).toBe(beforeCount + 1);

    const created = seasons.find(s => s.name === SEASON_1);
    expect(created).toBeDefined();
    expect(created!.isActive).toBe(false);
    expect(created!.createdById).toBe(admin.userId);
  });

  // ─── Test 2: Non-admin is rejected ────────────────────────────────────────

  it('non-admin is rejected with permission error', async () => {
    const err = await expectReducerError(
      regularUser.call.createSeason({
        name: 'Unauthorized Season',
        startDate: Timestamp.now(),
        endDate: null,
      })
    );
    expect(err).toBeDefined();
    // Permission error — specific message may vary
    expect(err!.toLowerCase()).toContain('admin');
  });

  // ─── Test 3: Single-active guarantee ──────────────────────────────────────

  it('set_active_season activates target and deactivates all others', async () => {
    // Create a second season
    await admin.call.createSeason({
      name: SEASON_2,
      startDate: Timestamp.now(),
      endDate: null,
    });
    await admin.sync(1500);

    const seasons = allSeasons(admin);
    const s1 = seasons.find(s => s.name === SEASON_1);
    const s2 = seasons.find(s => s.name === SEASON_2);
    expect(s1).toBeDefined();
    expect(s2).toBeDefined();

    // Activate season 1
    await admin.call.setActiveSeason({ seasonId: s1!.id });
    await admin.sync(1500);

    expect(activeSeasons(admin).length).toBe(1);
    expect(activeSeasons(admin)[0].id).toBe(s1!.id);

    // Activate season 2 — should deactivate season 1
    await admin.call.setActiveSeason({ seasonId: s2!.id });
    await admin.sync(1500);

    expect(activeSeasons(admin).length).toBe(1);
    expect(activeSeasons(admin)[0].id).toBe(s2!.id);

    // Verify season 1 is now inactive
    const refreshedS1 = allSeasons(admin).find(s => s.id === s1!.id);
    expect(refreshedS1!.isActive).toBe(false);
  });

  // ─── Test 4: Non-existent season rejected ─────────────────────────────────

  it('set_active_season rejects non-existent seasonId', async () => {
    const err = await expectReducerError(
      admin.call.setActiveSeason({ seasonId: 99999 })
    );
    expect(err).toBeDefined();
    expect(err!).toContain('not found');
  });
});
