/**
 * Integration tests: Roster Migration
 *
 * UAT coverage: Test 9
 * Requires: SpacetimeDB running with published module + seed data.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createVerifiedTestHarness, hasServerToken, expectReducerError, type TestHarness } from '../../shared/connection';
import { nextUid, resetUidCounter, characterBatch, KNOWN_CHARACTERS } from '../../shared/fixtures';

describe.skipIf(!hasServerToken())('Roster Migration', () => {
  let h: TestHarness;
  let sourceAccountId: number;
  let targetAccountId: number;

  beforeAll(async () => {
    resetUidCounter();
    h = await createVerifiedTestHarness();

    // Create source account with characters
    const sourceUid = nextUid();
    await h.call.createHsrAccount({ uid: sourceUid, displayLabel: 'Source' });
    await h.sync(1000);

    const source = [...h.conn.db.HsrAccount.iter()].find(
      (a) => a.uid === sourceUid && a.userId === h.userId
    );
    if (!source) throw new Error('Source account not created');
    sourceAccountId = source.id;

    await h.call.batchUpsertCharacters({
      hsrAccountId: sourceAccountId,
      charactersJson: characterBatch([
        { characterName: KNOWN_CHARACTERS[0], eidolonLevel: 3 },
        { characterName: KNOWN_CHARACTERS[1], eidolonLevel: 1 },
      ]),
    });
    await h.sync();

    // Create target account
    const targetUid = nextUid();
    await h.call.createHsrAccount({ uid: targetUid, displayLabel: 'Target' });
    await h.sync();

    const target = [...h.conn.db.HsrAccount.iter()].find(
      (a) => a.uid === targetUid && a.userId === h.userId
    );
    if (!target) throw new Error('Target account not created');
    targetAccountId = target.id;
  });

  afterAll(async () => {
    await h?.disconnect();
  });

  it('copy mode: duplicates characters to target, preserves source', async () => {
    await h.call.migrateRoster({
      sourceAccountId,
      targetAccountId,
      mode: 'copy',
    });
    await h.sync();

    const sourceChars = [...h.conn.db.HsrAccountCharacter.iter()].filter(
      (c) => c.hsrAccountId === sourceAccountId
    );
    expect(sourceChars.length).toBeGreaterThanOrEqual(2);

    const targetChars = [...h.conn.db.HsrAccountCharacter.iter()].filter(
      (c) => c.hsrAccountId === targetAccountId
    );
    expect(targetChars.length).toBeGreaterThanOrEqual(2);

    const targetChar0 = targetChars.find((c) => c.characterName === KNOWN_CHARACTERS[0]);
    expect(targetChar0?.eidolonLevel).toBe(3);
  });

  it('move mode: transfers characters, source is emptied', async () => {
    // Add a fresh character to source for the move test
    await h.call.batchUpsertCharacters({
      hsrAccountId: sourceAccountId,
      charactersJson: characterBatch([
        { characterName: KNOWN_CHARACTERS[2], eidolonLevel: 4 },
      ]),
    });
    await h.sync();

    await h.call.migrateRoster({
      sourceAccountId,
      targetAccountId,
      mode: 'move',
    });
    await h.sync();

    const sourceChars = [...h.conn.db.HsrAccountCharacter.iter()].filter(
      (c) => c.hsrAccountId === sourceAccountId
    );
    expect(sourceChars).toHaveLength(0);

    const moved = [...h.conn.db.HsrAccountCharacter.iter()].find(
      (c) => c.hsrAccountId === targetAccountId && c.characterName === KNOWN_CHARACTERS[2]
    );
    expect(moved).toBeDefined();
    expect(moved?.eidolonLevel).toBe(4);
  });

  it('rejects invalid mode', async () => {
    const msg = await expectReducerError(
      h.call.migrateRoster({ sourceAccountId, targetAccountId, mode: 'invalid' })
    );
    expect(msg).toContain('copy');
  });

  it('rejects same source and target', async () => {
    const msg = await expectReducerError(
      h.call.migrateRoster({ sourceAccountId, targetAccountId: sourceAccountId, mode: 'copy' })
    );
    expect(msg).toContain('same account');
  });
});
