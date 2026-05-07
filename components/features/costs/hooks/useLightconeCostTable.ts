import { useMemo } from 'react';
import { type Lightcone, DraftMode } from '../../types/enums';

export interface LightconeCostRow {
    name: string;
    displayName: string;
    aliases: string[];
    path: string;
    rarity: number;
    
    s1: number;
    s2: number;
    s3: number;
    s4: number;
    s5: number;
}

export interface SortDescriptor {
    column: keyof LightconeCostRow;
    direction: 'ascending' | 'descending';
}

const DEFAULT_SORT: SortDescriptor = { column: 'displayName', direction: 'ascending' };

export function useLightconeCostTable(
    draftMode: DraftMode,
    sortDescriptor: SortDescriptor = DEFAULT_SORT,
    filteredLightcones: Lightcone[] = [],
): LightconeCostRow[] {
    const rows = useMemo(() => {
        const joined: LightconeCostRow[] = [];

        for (const lc of filteredLightcones) {
            const supCosts = lc.cost[draftMode];

            joined.push({
                name: lc.name,
                displayName: lc.displayName,
                rarity: lc.rarity,
                path: lc.path,
                aliases: lc.aliases,
                s1: supCosts?.S1 ?? 0,
                s2: supCosts?.S2 ?? 0,
                s3: supCosts?.S3 ?? 0,
                s4: supCosts?.S4 ?? 0,
                s5: supCosts?.S5 ?? 0,
            });
        }

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
    }, [filteredLightcones, sortDescriptor, draftMode]);

    return rows;
}
