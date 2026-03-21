// ─── Leaderboard Rebuild Helper ─────────────────────────────────────────────
// Rebuilds the materialized Leaderboard table from MmrRating and PlayerStat data.
// Called inline after MMR processing (finalize_match_result for standalone Ranked,
// process_tournament_mmr for tournament batch).

import { auditInsert } from './auditColumns';

/** Minimum matches required to appear on a leaderboard (D-46). */
const MIN_MATCHES = 2;

/** Maximum entries per leaderboard category. */
const MAX_ENTRIES = 100;

/** Per-mode category definitions mapping category name to GameMode tag. */
const MODE_CATEGORIES = [
    { category: 'MemoryOfChaos', gameModeTag: 'MemoryOfChaos' },
    { category: 'ApocalypticShadow', gameModeTag: 'ApocalypticShadow' },
    { category: 'AnomalyArbitration', gameModeTag: 'AnomalyArbitration' },
];

/**
 * Deletes all existing Leaderboard rows and rebuilds top 100 per category
 * from MmrRating + PlayerStat data.
 */
export function rebuildLeaderboard(ctx: any, actingUserId: number): void {
    // 1. Delete ALL existing Leaderboard rows
    for (const row of [...ctx.db.Leaderboard.iter()]) {
        ctx.db.Leaderboard.delete(row);
    }

    // 2. Per-mode categories
    for (const { category, gameModeTag } of MODE_CATEGORIES) {
        const entries = [...ctx.db.MmrRating.iter()]
            .filter((r: any) => r.gameMode.tag === gameModeTag && r.matchesPlayed >= MIN_MATCHES);

        // Sort by rating descending
        entries.sort((a: any, b: any) => b.rating - a.rating);

        // Take top 100
        const top = entries.slice(0, MAX_ENTRIES);

        for (let i = 0; i < top.length; i++) {
            const entry = top[i];
            // Sum wins across all draftModes for this userId and gameMode
            const wins = [...ctx.db.PlayerStat.by_user.filter(entry.userId)]
                .filter((s: any) => s.gameMode.tag === gameModeTag)
                .reduce((sum: number, s: any) => sum + s.wins, 0);

            ctx.db.Leaderboard.insert({
                category,
                rank: i + 1,
                userId: entry.userId,
                rating: entry.rating,
                matchesPlayed: entry.matchesPlayed,
                wins,
                seasonId: entry.seasonId,
                ...auditInsert(ctx, actingUserId),
            } as any);
        }
    }

    // 3. Global category
    // Collect all unique userIds with >= MIN_MATCHES in any mode
    const allRatings = [...ctx.db.MmrRating.iter()]
        .filter((r: any) => r.matchesPlayed >= MIN_MATCHES);
    const userIds = new Set<number>();
    for (const r of allRatings) {
        userIds.add(r.userId);
    }

    const globalEntries: Array<{ userId: number; globalRating: number; totalMatches: number; totalWins: number }> = [];
    for (const userId of userIds) {
        const userRatings = [...ctx.db.MmrRating.user_id.filter(userId)];
        const globalRating = userRatings[0]?.globalCompositeRating ?? 0;
        if (globalRating <= 0) continue;

        const totalMatches = userRatings.reduce((sum: number, r: any) => sum + r.matchesPlayed, 0);
        const totalWins = [...ctx.db.PlayerStat.by_user.filter(userId)]
            .reduce((sum: number, s: any) => sum + s.wins, 0);

        globalEntries.push({ userId, globalRating, totalMatches, totalWins });
    }

    // Sort by globalCompositeRating descending
    globalEntries.sort((a, b) => b.globalRating - a.globalRating);

    // Take top 100
    const topGlobal = globalEntries.slice(0, MAX_ENTRIES);

    for (let i = 0; i < topGlobal.length; i++) {
        const entry = topGlobal[i];
        ctx.db.Leaderboard.insert({
            category: 'Global',
            rank: i + 1,
            userId: entry.userId,
            rating: entry.globalRating,
            matchesPlayed: entry.totalMatches,
            wins: entry.totalWins,
            seasonId: undefined,
            ...auditInsert(ctx, actingUserId),
        } as any);
    }
}
