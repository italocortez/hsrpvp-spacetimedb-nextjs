/**
 * Integration tests: Character Batch Operations
 *
 * UAT coverage: Tests 6-7
 * Requires: SpacetimeDB running with published module + seed data (HsrCharacter table populated).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createVerifiedTestHarness, hasServerToken, expectReducerError, type TestHarness } from '../../shared/connection';
import { nextUid, resetUidCounter, characterBatch, KNOWN_CHARACTERS } from '../../shared/fixtures';

describe.skipIf(!hasServerToken())('Character Batch Operations', () => {
  let h: TestHarness;
  let testAccountId: number;

  beforeAll(async () => {
    resetUidCounter();
    h = await createVerifiedTestHarness();

    // Create a test account
    const uid = nextUid();
    await h.call.createHsrAccount({ uid, displayLabel: 'Char Test Account' });
    await h.sync(1000);

    // Filter by userId to avoid cross-user pollution (parallel test files share subscribeToAllTables cache)
    const account = [...h.conn.db.HsrAccount.iter()].find(
      (a) => a.uid === uid && a.userId === h.userId
    );
    if (!account) throw new Error('Failed to create test account');
    testAccountId = account.id;
  });

  afterAll(async () => {
    await h?.disconnect();
  });

  // ── Test 6: Batch Upsert Characters ─────────────────────────────────────

  describe('batch_upsert_characters', () => {
    it('inserts multiple characters atomically', async () => {
      await h.call.batchUpsertCharacters({
        hsrAccountId: testAccountId,
        charactersJson: characterBatch([
          { characterName: KNOWN_CHARACTERS[0], eidolonLevel: 2 },
          { characterName: KNOWN_CHARACTERS[1], eidolonLevel: 0 },
        ]),
      });
      await h.sync();

      const myChars = [...h.conn.db.HsrAccountCharacter.iter()].filter(
        (c) => c.hsrAccountId === testAccountId
      );
      expect(myChars.length).toBeGreaterThanOrEqual(2);

      const char0 = myChars.find((c) => c.characterName === KNOWN_CHARACTERS[0]);
      expect(char0?.eidolonLevel).toBe(2);
    });

    it('upserts existing characters (updates eidolon level)', async () => {
      await h.call.batchUpsertCharacters({
        hsrAccountId: testAccountId,
        charactersJson: characterBatch([
          { characterName: KNOWN_CHARACTERS[0], eidolonLevel: 6 },
        ]),
      });
      await h.sync();

      const myChars = [...h.conn.db.HsrAccountCharacter.iter()].filter(
        (c) => c.hsrAccountId === testAccountId
      );
      const updated = myChars.find((c) => c.characterName === KNOWN_CHARACTERS[0]);
      expect(updated?.eidolonLevel).toBe(6);
    });

    it('rejects batch with invalid character name (all-or-nothing)', async () => {
      const msg = await expectReducerError(
        h.call.batchUpsertCharacters({
          hsrAccountId: testAccountId,
          charactersJson: characterBatch([
            { characterName: KNOWN_CHARACTERS[2], eidolonLevel: 0 },
            { characterName: 'NonExistentCharacter', eidolonLevel: 0 },
          ]),
        })
      );
      expect(msg).toContain('Invalid character');

      // KNOWN_CHARACTERS[2] should NOT have been inserted (atomic rollback)
      await h.sync(300);
      const leaked = [...h.conn.db.HsrAccountCharacter.iter()].filter(
        (c) => c.hsrAccountId === testAccountId && c.characterName === KNOWN_CHARACTERS[2]
      );
      expect(leaked).toHaveLength(0);
    });

    it('rejects invalid eidolon level (>6)', async () => {
      const msg = await expectReducerError(
        h.call.batchUpsertCharacters({
          hsrAccountId: testAccountId,
          charactersJson: characterBatch([
            { characterName: KNOWN_CHARACTERS[0], eidolonLevel: 7 },
          ]),
        })
      );
      expect(msg).toContain('eidolon level');
    });

    it('rejects empty batch', async () => {
      const msg = await expectReducerError(
        h.call.batchUpsertCharacters({
          hsrAccountId: testAccountId,
          charactersJson: '[]',
        })
      );
      expect(msg).toContain('non-empty');
    });
  });

  // ── Test 7: Batch Remove Characters ─────────────────────────────────────

  describe('batch_remove_characters', () => {
    it('removes specified characters', async () => {
      // Ensure we have the character to remove
      await h.call.batchUpsertCharacters({
        hsrAccountId: testAccountId,
        charactersJson: characterBatch([{ characterName: KNOWN_CHARACTERS[1], eidolonLevel: 0 }]),
      });
      await h.sync();

      await h.call.batchRemoveCharacters({
        hsrAccountId: testAccountId,
        characterNamesJson: JSON.stringify([KNOWN_CHARACTERS[1]]),
      });
      await h.sync();

      const remaining = [...h.conn.db.HsrAccountCharacter.iter()].filter(
        (c) => c.hsrAccountId === testAccountId && c.characterName === KNOWN_CHARACTERS[1]
      );
      expect(remaining).toHaveLength(0);
    });

    it('fails if any character does not exist (all-or-nothing)', async () => {
      const msg = await expectReducerError(
        h.call.batchRemoveCharacters({
          hsrAccountId: testAccountId,
          characterNamesJson: JSON.stringify([KNOWN_CHARACTERS[0], 'GhostCharacter']),
        })
      );
      expect(msg).toContain('not found');

      // KNOWN_CHARACTERS[0] should still exist (no partial deletion)
      await h.sync(300);
      const stillExists = [...h.conn.db.HsrAccountCharacter.iter()].filter(
        (c) => c.hsrAccountId === testAccountId && c.characterName === KNOWN_CHARACTERS[0]
      );
      expect(stillExists.length).toBeGreaterThanOrEqual(1);
    });
  });
});
