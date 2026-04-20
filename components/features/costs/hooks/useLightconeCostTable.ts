import { useMemo } from 'react';
import { useGameData, HsrLightconeRow, HsrLightconeCostRow } from '@/components/features/game-data/components/GameDataProvider';

export interface LightconeCostRow {
    name: string;
    displayName: string;
    rarity: number;
    path: string;
    aliases: string[];
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
}

export interface LightconeCostFilters {
    paths: string[];
    search: string;
}

export interface SortDescriptor {
    column: string;
    direction: 'ascending' | 'descending';
}

const DEFAULT_SORT: SortDescriptor = { column: 'displayName', direction: 'ascending' };

export function useLightconeCostTable(
    draftMode: 'classic' | 'auction',
    filters: LightconeCostFilters,
    sortDescriptor: SortDescriptor = DEFAULT_SORT,
): LightconeCostRow[] {
    const { lightcones, lightconeCosts } = useGameData();

    // Build cost lookup: lightconeName -> cost row for selected draftMode.
    // NOTE (15.4 D-26 fix-to-compile): post-restructure rows are also split by gameMode.
    // This hook has no gameMode parameter today (Phase 17 concern); deterministically
    // collapse to a canonical gameMode (MemoryOfChaos) to avoid nondeterministic
    // last-row-wins behavior across gameModes (WR-01 Phase 15.4).
    const costMap = useMemo(() => {
        const CANONICAL_MODE = 'MemoryOfChaos';
        const map = new Map<string, HsrLightconeCostRow>();
        const wantDraft = draftMode === 'classic' ? 'Classic' : 'Auction';
        for (const cost of lightconeCosts) {
            if (cost.gameMode.tag !== CANONICAL_MODE) continue;
            if (cost.draftMode?.tag === wantDraft) {
                map.set(cost.lightconeName, cost);
            }
        }
        return map;
    }, [lightconeCosts, draftMode]);

    // Join, filter, sort
    const rows = useMemo(() => {
        let joined: LightconeCostRow[] = [];

        for (const lc of lightcones) {
            const cost = costMap.get(lc.name);
            const supCosts = cost ? cost.costs : null;

            joined.push({
                name: lc.name,
                displayName: lc.displayName,
                rarity: lc.rarity,
                path: lc.path.tag,
                aliases: lc.aliases || [],
                s1: supCosts?.s1 ?? 0,
                s2: supCosts?.s2 ?? 0,
                s3: supCosts?.s3 ?? 0,
                s4: supCosts?.s4 ?? 0,
                s5: supCosts?.s5 ?? 0,
            });
        }

        // Apply filters
        const { paths, search } = filters;

        if (paths.length > 0) {
            joined = joined.filter(r => paths.includes(r.path));
        }
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            joined = joined.filter(r =>
                r.displayName.toLowerCase().includes(q) ||
                r.aliases.some(a => a.toLowerCase().includes(q))
            );
        }

        // Sort
        const { column, direction } = sortDescriptor;
        const multiplier = direction === 'ascending' ? 1 : -1;

        joined.sort((a, b) => {
            const aVal = (a as any)[column];
            const bVal = (b as any)[column];

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return multiplier * aVal.localeCompare(bVal);
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return multiplier * (aVal - bVal);
            }
            return 0;
        });

        return joined;
    }, [lightcones, costMap, filters, sortDescriptor, draftMode]);

    return rows;
}
