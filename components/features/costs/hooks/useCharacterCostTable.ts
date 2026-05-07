import { useMemo } from 'react';
import { type Character, type Synergy, DraftMode, Element, Path, Role, RuleSet } from '../../types/enums';
import { UseCharacterFiltersReturn } from '../../hooks/useCharacterFilters';

export interface SynergyEntry {
    targetName: string;
    targetDisplayName: string;
    costModifier: number;
}

export interface CharacterCostRow {
    name: string;
    displayName: string;
    aliases: string[];
    element: Element;
    path: Path;
    rarity: number;
    role: Role;
    imageUrl?: string;

    e0: number;
    e1: number;
    e2: number;
    e3: number;
    e4: number;
    e5: number;
    e6: number;
    
    synergies: SynergyEntry[];
}

export interface SortDescriptor {
    column: keyof CharacterCostRow;
    direction: 'ascending' | 'descending';
}

const DEFAULT_SORT: SortDescriptor = { column: 'displayName', direction: 'ascending' };

export function useCharacterCostTable(
    gameMode: RuleSet,
    draftMode: DraftMode,
    filters: UseCharacterFiltersReturn,
    sortDescriptor: SortDescriptor = DEFAULT_SORT,
    charactersData: Character[] = [],
    synergies: Synergy[] = [],
): CharacterCostRow[] {
    const { filteredCharacters } = filters;

    // Build synergy lookup: sourceName -> synergy entries (only for classic + selected gameMode)
    // Phase 15.4 D-31: only Classic-draftMode synergy rows render; Auction-mode display deferred.
    // synergies is pre-filtered to Classic by GameDataProvider (synergiesData).
    const synergyMap = useMemo(() => {
        const map = new Map<string, Synergy[]>();
        if (draftMode !== 'Classic') return map;

        for (const syn of synergies) {
            if (syn.ruleSet === gameMode) {
                const existing = map.get(syn.sourceName) || [];
                existing.push(syn);
                map.set(syn.sourceName, existing);
            }
        }
        return map;
    }, [synergies, gameMode, draftMode]);

    // Build displayName lookup for synergy targets (needs all characters, not just filtered)
    const displayNameMap = useMemo(() => {
        const map = new Map<string, string>();
        for (const char of charactersData) {
            map.set(char.name, char.displayName);
        }
        return map;
    }, [charactersData]);

    // Join and sort — filtering is already done by useCharacterFilters
    const rows = useMemo(() => {
        const joined: CharacterCostRow[] = [];

        for (const char of filteredCharacters) {
            const eidolonCosts = char.cost[draftMode]?.[gameMode];

            const synergyEntries: SynergyEntry[] = (synergyMap.get(char.name) || []).map(s => ({
                targetName: s.targetName,
                targetDisplayName: displayNameMap.get(s.targetName) || s.targetName,
                costModifier: s.costModifier,
            }));

            joined.push({
                name: char.name,
                displayName: char.displayName,
                rarity: char.rarity,
                role: char.role,
                element: char.element,
                path: char.path,
                imageUrl: char.imageUrl,
                aliases: char.aliases,
                e0: eidolonCosts?.E0 ?? 0,
                e1: eidolonCosts?.E1 ?? 0,
                e2: eidolonCosts?.E2 ?? 0,
                e3: eidolonCosts?.E3 ?? 0,
                e4: eidolonCosts?.E4 ?? 0,
                e5: eidolonCosts?.E5 ?? 0,
                e6: eidolonCosts?.E6 ?? 0,
                synergies: synergyEntries,
            });
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
    }, [filteredCharacters, synergyMap, displayNameMap, sortDescriptor, draftMode, gameMode]);

    return rows;
}
