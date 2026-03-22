/**
 * Integration tests: Cost set full lifecycle.
 *
 * Covers:
 * - Create cost set -> CostSet row created, isDraft=true, isPublished=false
 * - Edit draft character cost -> reducer succeeds (draft tables are private)
 * - Edit draft lightcone cost -> reducer succeeds
 * - Edit draft synergy cost -> reducer succeeds
 * - Publish -> isPublished=true, isDraft=false, live HsrCharacterCost rows exist
 * - Lock -> isLocked=true
 * - Unpublish -> isPublished=false, isLocked=false
 * - Delete -> CostSet row gone, live cost rows cascade-deleted
 * - Default protection: lock(0), unpublish(0), delete(0) rejected
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createVerifiedTestHarness, hasServerToken, expectReducerError, type TestHarness } from '../../shared/connection';

describe.skipIf(!hasServerToken())('Cost Set Lifecycle', () => {
  let h: TestHarness;
  let costSetId: number;

  /** Helper to promote a harness user to a role via server connection */
  async function promoteToRole(harness: TestHarness, roleTag: string) {
    const user = [...harness.conn.db.User.iter()].find(u => u.id === harness.userId);
    if (!user) throw new Error(`User ${harness.userId} not found in cache`);
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

    await harness.sync(1000);
  }

  const myCostSets = () => [...h.conn.db.CostSet.iter()].filter(c => c.creatorId === h.userId);

  beforeAll(async () => {
    h = await createVerifiedTestHarness();
    await promoteToRole(h, 'TournamentHost');
  }, 30000);

  afterAll(async () => {
    await h?.disconnect();
  });

  // ── Create cost set ──
  it('creates cost set -> isDraft=true, isPublished=false', async () => {
    const countBefore = myCostSets().length;

    await h.call.createCostSet({
      name: 'Test Set',
      sourceSetId: 0,
      gameModeTag: 'MemoryOfChaos',
    });
    await h.sync();

    const mine = myCostSets();
    expect(mine.length).toBe(countBefore + 1);

    const created = mine[mine.length - 1];
    costSetId = created.id;

    expect(created.isDraft).toBe(true);
    expect(created.isPublished).toBe(false);
    expect(created.isLocked).toBe(false);
    expect(created.name).toBe('Test Set');
  });

  // ── Edit draft character cost (private table — just verify no error) ──
  it('edits draft character cost -> reducer succeeds', async () => {
    await h.call.editDraftCharacterCost({
      costSetId,
      characterName: 'acheron',
      gameModeTag: 'MemoryOfChaos',
      classicCostsJson: '{"e0":10,"e1":12,"e2":14,"e3":16,"e4":18,"e5":20,"e6":22}',
      auctionBaseBidJson: '{"e0":100,"e1":120,"e2":140,"e3":160,"e4":180,"e5":200,"e6":220}',
    });
    await h.sync();
    // Draft tables are private (public: false) so we can't verify via iter().
    // The fact that the reducer didn't throw is the success signal.
  });

  // ── Edit draft lightcone cost ──
  it('edits draft lightcone cost -> reducer succeeds', async () => {
    await h.call.editDraftLightconeCost({
      costSetId,
      lightconeName: 'adreamscentedinwheat',
      gameModeTag: 'MemoryOfChaos',
      classicCostsJson: '{"s1":5,"s2":6,"s3":7,"s4":8,"s5":9}',
      auctionBaseBidJson: '{"s1":50,"s2":60,"s3":70,"s4":80,"s5":90}',
    });
    await h.sync();
  });

  // ── Edit draft synergy cost ──
  it('edits draft synergy cost -> reducer succeeds', async () => {
    await h.call.editDraftSynergyCost({
      costSetId,
      sourceName: 'acheron',
      targetName: 'kafka',
      gameModeTag: 'MemoryOfChaos',
      costModifier: 1.5,
    });
    await h.sync();
  });

  // ── Publish ──
  it('publishes cost set -> isPublished=true, isDraft=false, live costs exist', async () => {
    await h.call.publishCostSet({ costSetId });
    await h.sync();

    const cs = h.conn.db.CostSet.id.find(costSetId);
    expect(cs).toBeDefined();
    expect(cs!.isPublished).toBe(true);
    expect(cs!.isDraft).toBe(false);

    // Check live character cost rows
    const charCosts = [...h.conn.db.HsrCharacterCost.iter()].filter(c => c.costSetId === costSetId);
    expect(charCosts.length).toBeGreaterThan(0);
  });

  // ── Lock ──
  it('locks cost set -> isLocked=true', async () => {
    await h.call.lockCostSet({ costSetId });
    await h.sync();

    const cs = h.conn.db.CostSet.id.find(costSetId);
    expect(cs).toBeDefined();
    expect(cs!.isLocked).toBe(true);
  });

  // ── Unpublish ──
  it('unpublishes cost set -> isPublished=false, isLocked=false', async () => {
    await h.call.unpublishCostSet({ costSetId });
    await h.sync();

    const cs = h.conn.db.CostSet.id.find(costSetId);
    expect(cs).toBeDefined();
    expect(cs!.isPublished).toBe(false);
    expect(cs!.isLocked).toBe(false);
  });

  // ── Delete ──
  it('deletes cost set -> row gone, live costs cascade-deleted', async () => {
    await h.call.deleteCostSet({ costSetId });
    await h.sync();

    const cs = h.conn.db.CostSet.id.find(costSetId);
    expect(cs).toBeNull();

    // Live cost rows should also be gone
    const charCosts = [...h.conn.db.HsrCharacterCost.iter()].filter(c => c.costSetId === costSetId);
    expect(charCosts.length).toBe(0);

    const lcCosts = [...h.conn.db.HsrLightconeCost.iter()].filter(c => c.costSetId === costSetId);
    expect(lcCosts.length).toBe(0);

    const synCosts = [...h.conn.db.HsrSynergyCost.iter()].filter(c => c.costSetId === costSetId);
    expect(synCosts.length).toBe(0);
  });

  // ── Default cost set protection ──
  describe('default cost set (id=0) protection', () => {
    it('rejects lock on default cost set', async () => {
      const msg = await expectReducerError(
        h.call.lockCostSet({ costSetId: 0 })
      );
      expect(msg.toLowerCase()).toMatch(/default/i);
    });

    it('rejects unpublish on default cost set', async () => {
      const msg = await expectReducerError(
        h.call.unpublishCostSet({ costSetId: 0 })
      );
      expect(msg.toLowerCase()).toMatch(/default/i);
    });

    it('rejects delete on default cost set', async () => {
      const msg = await expectReducerError(
        h.call.deleteCostSet({ costSetId: 0 })
      );
      expect(msg.toLowerCase()).toMatch(/default/i);
    });
  });
});
