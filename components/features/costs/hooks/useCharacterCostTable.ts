import { useMemo } from 'react';
import { useGameData, HsrCharacterRow, HsrCharacterCostRow, HsrSynergyCostRow } from '@/components/features/game-data/components/GameDataProvider';

export interface SynergyEntry {
    targetName: string;
    targetDisplayName: string;
    costModifier: number;
}

export interface CharacterCostRow {
    name: string;
    displayName: string;
    rarity: number;
    role: string;
    element: string;
    path: string;
    imageUrl: string;
    aliases: string[];
    e0: number;
    e1: number;
    e2: number;
    e3: number;
    e4: number;
    e5: number;
    e6: number;
    synergies: SynergyEntry[];
}

export interface CostTableFilters {
    roles: string[];
    elements: string[];
    paths: string[];
    search: string;
}

export interface SortDescriptor {
    column: string;
    direction: 'ascending' | 'descending';
}

const DEFAULT_SORT: SortDescriptor = { column: 'displayName', direction: 'ascending' };

export function useCharacterCostTable(
    gameMode: string,
    draftMode: 'classic' | 'auction',
    filters: CostTableFilters,
    sortDescriptor: SortDescriptor = DEFAULT_SORT,
): CharacterCostRow[] {
    const { characters, characterCosts, synergyCosts } = useGameData();

    // Build cost lookup: characterName -> cost row for selected gameMode
    const costMap = useMemo(() => {
        const map = new Map<string, HsrCharacterCostRow>();
        for (const cost of characterCosts) {
            if (cost.gameMode.tag === gameMode) {
                map.set(cost.characterName, cost);
            }
        }
        return map;
    }, [characterCosts, gameMode]);

    // Build synergy lookup: sourceName -> synergy entries (only for classic + selected gameMode)
    const synergyMap = useMemo(() => {
        const map = new Map<string, HsrSynergyCostRow[]>();
        if (draftMode !== 'classic') return map;
        for (const syn of synergyCosts) {
            if (syn.gameMode.tag === gameMode) {
                const existing = map.get(syn.sourceName) || [];
                existing.push(syn);
                map.set(syn.sourceName, existing);
            }
        }
        return map;
    }, [synergyCosts, gameMode, draftMode]);

    // Build displayName lookup for synergy targets
    const displayNameMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const char of characters) {
            map.set(char.name, char.displayName);
        }
        return map;
    }, [characters]);

    // Join, filter, sort
    const rows = useMemo(() => {
        let joined: CharacterCostRow[] = [];

        for (const char of characters) {
            const cost = costMap.get(char.name);
            const eidolonCosts = cost
                ? (draftMode === 'classic' ? cost.classicCosts : cost.auctionBaseBid)
                : null;

            const synergyRaw = synergyMap.get(char.name) || [];
            const synergies: SynergyEntry[] = synergyRaw.map(s => ({
                targetName: s.targetName,
                targetDisplayName: displayNameMap.get(s.targetName) || s.targetName,
                costModifier: s.costModifier,
            }));

            joined.push({
                name: char.name,
                displayName: char.displayName,
                rarity: char.rarity,
                role: char.role.tag,
                element: char.element.tag,
                path: char.path.tag,
                imageUrl: char.imageUrl,
                aliases: char.aliases || [],
                e0: eidolonCosts?.e0 ?? 0,
                e1: eidolonCosts?.e1 ?? 0,
                e2: eidolonCosts?.e2 ?? 0,
                e3: eidolonCosts?.e3 ?? 0,
                e4: eidolonCosts?.e4 ?? 0,
                e5: eidolonCosts?.e5 ?? 0,
                e6: eidolonCosts?.e6 ?? 0,
                synergies,
            });
        }

        // Apply filters
        const { roles, elements, paths, search } = filters;

        if (roles.length > 0) {
            joined = joined.filter(r => roles.includes(r.role));
        }
        if (elements.length > 0) {
            joined = joined.filter(r => elements.includes(r.element));
        }
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
    }, [characters, costMap, synergyMap, displayNameMap, filters, sortDescriptor, draftMode]);

    return rows;
}
