/**
 * Integration tests: HSR Account CRUD
 *
 * UAT coverage: Tests 2-5, 8
 * Requires: SpacetimeDB running with published module + seed data.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createVerifiedTestHarness, hasServerToken, expectReducerError, type TestHarness } from '../../shared/connection';
import { nextUid, resetUidCounter } from '../../shared/fixtures';

describe.skipIf(!hasServerToken())('HSR Account CRUD', () => {
  let h: TestHarness;

  /** Return only this test user's accounts (avoids cross-user pollution from shared DB) */
  const myAccounts = () => [...h.conn.db.HsrAccount.iter()].filter(a => a.userId === h.userId);

  beforeAll(async () => {
    resetUidCounter();
    h = await createVerifiedTestHarness();
  });

  afterAll(async () => {
    await h?.disconnect();
  });

  // ── Test 2: Create HSR Account ──────────────────────────────────────────

  describe('create_hsr_account', () => {
    it('creates account with correct region derived from UID', async () => {
      const uid = '800000099';
      await h.call.createHsrAccount({ uid, displayLabel: 'Asia Account' });
      await h.sync();

      const created = myAccounts().find((a) => a.uid === uid);
      expect(created).toBeDefined();
      expect(created!.region).toBe('Asia');
      expect(created!.displayLabel).toBe('Asia Account');
    });

    it('auto-activates the first account for a user', async () => {
      const myAccount = myAccounts().find((a) => a.uid === '800000099');
      expect(myAccount).toBeDefined();
      expect(myAccount!.isActive).toBe(true);
    });

    it('defaults isRatingPublic to false', async () => {
      const created = myAccounts().find((a) => a.uid === '800000099');
      expect(created!.isRatingPublic).toBe(false);
      // isDuplicateUid may be true if UID exists from a prior test run (shared DB)
    });

    it('rejects invalid UID (too short)', async () => {
      const msg = await expectReducerError(
        h.call.createHsrAccount({ uid: '8001234', displayLabel: 'Bad' })
      );
      expect(msg).toContain('9 digits');
    });

    it('rejects invalid UID (bad region digit)', async () => {
      const msg = await expectReducerError(
        h.call.createHsrAccount({ uid: '100000001', displayLabel: 'Bad' })
      );
      expect(msg).toContain('first digit');
    });

    it('auto-labels when displayLabel is empty', async () => {
      const uid = nextUid();
      await h.call.createHsrAccount({ uid, displayLabel: '' });
      await h.sync();

      const created = myAccounts().find((a) => a.uid === uid);
      expect(created).toBeDefined();
      expect(created!.displayLabel).toMatch(/^Account \d+$/);
    });
  });

  // ── Test 3: Account Limit Enforcement ───────────────────────────────────

  describe('5-account limit', () => {
    it('enforces maximum 5 accounts per user', async () => {
      // Fill up to 5
      const currentCount = myAccounts().length;
      for (let i = currentCount; i < 5; i++) {
        await h.call.createHsrAccount({ uid: nextUid(), displayLabel: `Fill ${i}` });
        await h.sync(300);
      }

      // 6th should fail
      const msg = await expectReducerError(
        h.call.createHsrAccount({ uid: nextUid(), displayLabel: 'Should Fail' })
      );
      expect(msg).toContain('Maximum 5');
    });
  });

  // ── Test 4: Update HSR Account ──────────────────────────────────────────

  describe('update_hsr_account', () => {
    it('updates label and visibility fields', async () => {
      const target = myAccounts()[0];

      await h.call.updateHsrAccount({
        hsrAccountId: target.id,
        displayLabel: 'Updated Label',
        isRosterPublic: true,
        isRatingPublic: true,
      });
      await h.sync();

      const updated = h.conn.db.HsrAccount.id.find(target.id);
      expect(updated?.displayLabel).toBe('Updated Label');
      expect(updated?.isRosterPublic).toBe(true);
      expect(updated?.isRatingPublic).toBe(true);
    });

    it('rejects empty display label', async () => {
      const target = myAccounts()[0];

      const msg = await expectReducerError(
        h.call.updateHsrAccount({
          hsrAccountId: target.id,
          displayLabel: '   ',
          isRosterPublic: false,
          isRatingPublic: false,
        })
      );
      expect(msg).toContain('cannot be empty');
    });
  });

  // ── Test 5: Set Active Account ──────────────────────────────────────────

  describe('set_active_hsr_account', () => {
    it('activates target and deactivates others', async () => {
      const accounts = myAccounts();
      if (accounts.length < 2) return;

      const inactive = accounts.find((a) => !a.isActive);
      if (!inactive) return;

      await h.call.setActiveHsrAccount({ hsrAccountId: inactive.id });
      await h.sync();

      const refreshed = h.conn.db.HsrAccount.id.find(inactive.id);
      expect(refreshed?.isActive).toBe(true);

      // All others should be inactive
      for (const acc of myAccounts()) {
        if (acc.id !== inactive.id) {
          expect(acc.isActive).toBe(false);
        }
      }
    });

    it('is a no-op when called on already-active account', async () => {
      const active = myAccounts().find((a) => a.isActive);
      if (!active) return;

      // Should succeed without error
      await h.call.setActiveHsrAccount({ hsrAccountId: active.id });
    });
  });

  // ── Test 8: Delete Account with Cascade ─────────────────────────────────

  describe('delete_hsr_account', () => {
    it('deletes account and cascades character rows', async () => {
      // Use an existing account (we're at the 5-account limit after the previous test)
      const accounts = myAccounts();
      const account = accounts[accounts.length - 1]; // pick the last one
      if (!account) return;

      await h.call.deleteHsrAccount({ hsrAccountId: account.id });
      await h.sync();

      // Account should be gone
      const deleted = h.conn.db.HsrAccount.id.find(account.id);
      expect(deleted).toBeNull();

      // No orphan characters
      const orphans = [...h.conn.db.HsrAccountCharacter.iter()].filter(
        (c) => c.hsrAccountId === account.id
      );
      expect(orphans).toHaveLength(0);
    });
  });
});
