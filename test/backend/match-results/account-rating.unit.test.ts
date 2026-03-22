/**
 * Unit tests for spacetimedb/src/helpers/accountRating.ts
 *
 * Tests the TEMPORARY account rating formula (Phase 5):
 * Each character = 5 × (1 + eidolonLevel), capped at 1000.
 *
 * Uses a mock ctx to simulate the database filter call.
 */

import { describe, it, expect } from 'vitest';
import { computeAccountRating } from '../../../spacetimedb/src/helpers/accountRating';

/** Creates a mock ctx.db that returns the given characters for any hsrAccountId filter. */
function mockCtx(characters: Array<{ eidolonLevel: number }>) {
  return {
    db: {
      HsrAccountCharacter: {
        hsr_account_id: {
          filter: () => characters[Symbol.iterator](),
        },
      },
    },
  };
}

describe('computeAccountRating', () => {
  it('returns 0 for empty roster', () => {
    const ctx = mockCtx([]);
    expect(computeAccountRating(ctx, 1)).toBe(0);
  });

  it('3 chars (E0, E1, E2) → 5+10+15 = 30', () => {
    const ctx = mockCtx([
      { eidolonLevel: 0 },
      { eidolonLevel: 1 },
      { eidolonLevel: 2 },
    ]);
    expect(computeAccountRating(ctx, 1)).toBe(30);
  });

  it('single char at E6 → 5×7 = 35', () => {
    const ctx = mockCtx([{ eidolonLevel: 6 }]);
    expect(computeAccountRating(ctx, 1)).toBe(35);
  });

  it('caps at 1000 when total exceeds it', () => {
    // 200 chars at E6 = 200 × 5 × 7 = 7000 → capped at 1000
    const chars = Array.from({ length: 200 }, () => ({ eidolonLevel: 6 }));
    const ctx = mockCtx(chars);
    expect(computeAccountRating(ctx, 1)).toBe(1000);
  });

  it('all E0 chars → count × 5', () => {
    const chars = Array.from({ length: 10 }, () => ({ eidolonLevel: 0 }));
    const ctx = mockCtx(chars);
    // 10 × 5 × 1 = 50
    expect(computeAccountRating(ctx, 1)).toBe(50);
  });
});
