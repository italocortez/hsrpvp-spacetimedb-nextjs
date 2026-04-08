import { SenderError } from 'spacetimedb/server';

/**
 * Check if a provider ID is banned for the given ban type.
 *
 * WR-01: MUST filter by banType, not just providerId alone (prevents
 * cross-provider false positives).
 *
 * Note: Multi-column index .filter() causes PANIC in the SpacetimeDB TS SDK.
 * Uses single-column ban_record_provider_id index lookup, then filters banType
 * in-memory. Still WR-01 compliant — banType.tag is checked on every match.
 */
export function checkProviderBan(ctx: any, banType: any, providerId: string): boolean {
    const matches = [...ctx.db.BanRecord.ban_record_provider_id.filter(providerId)];
    return matches.some((r: any) => r.banType.tag === banType.tag);
}

/**
 * Throws SenderError if the provider ID is banned for the given ban type.
 * Convenience wrapper for use in reducers.
 */
export function rejectIfBanned(ctx: any, banType: any, providerId: string): void {
    if (checkProviderBan(ctx, banType, providerId)) {
        throw new SenderError(`This ${banType.tag} provider is banned and cannot be linked.`);
    }
}
