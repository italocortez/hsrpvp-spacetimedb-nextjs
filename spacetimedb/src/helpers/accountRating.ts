import { auditUpdate } from './auditColumns';

/**
 * TEMPORARY account rating formula (Phase 5).
 *
 * Each character is worth 5 points, multiplied by (1 + eidolonLevel).
 * Normalized to 0-1000. Will be replaced with a cost-table-based formula
 * once the drafting/cost system is fully integrated.
 *
 * Examples:
 *   3 characters at E0 = 3 * 5 * 1 = 15
 *   3 characters at E6 = 3 * 5 * 7 = 105
 *   80 characters at E0 = 80 * 5 * 1 = 400
 *   80 characters at E6 = 80 * 5 * 7 = 2800 → capped at 1000
 */
export function computeAccountRating(ctx: any, hsrAccountId: number): number {
    const characters = [...ctx.db.HsrAccountCharacter.hsr_account_id.filter(hsrAccountId)];

    if (characters.length === 0) {
        return 0;
    }

    let total = 0;
    for (const char of characters) {
        total += 5 * (1 + char.eidolonLevel);
    }

    return Math.min(1000, total);
}

/**
 * Computes and persists account rating on the HsrAccount row if it changed.
 */
export function updateAccountRating(ctx: any, hsrAccountId: number, actingUserId: number): void {
    const newRating = computeAccountRating(ctx, hsrAccountId);
    const account = ctx.db.HsrAccount.id.find(hsrAccountId);
    if (!account) return;

    if (account.accountRating !== newRating) {
        ctx.db.HsrAccount.id.update({
            ...account,
            accountRating: newRating,
            ...auditUpdate(ctx, account, actingUserId),
        });
    }
}
