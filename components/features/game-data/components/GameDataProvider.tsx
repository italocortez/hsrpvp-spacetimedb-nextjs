'use client';

import React, { createContext, useContext } from 'react';
import { useTable } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { Character, Lightcone, Synergy } from '@/components/features/types/enums';
import { mapToCharacterData, mapToLightconeData, mapToSynergyData } from './DataHelpers';

export interface HsrCharacterRow {
    name: string; // ruanmei
    displayName: string; // Ruan Mei
    aliases: string[];
    rarity: number;
    path: { tag: string };
    element: { tag: string };
    role: { tag: string };
    imageUrl: string;
}

export interface HsrLightconeRow {
    name: string; // agroundascent
    displayName: string; // A Ground Ascent
    aliases: string[];
    path: { tag: string };
    rarity: number;
    imageUrl: string;
    posX: number;
    posY: number;
    width: number;
}

export interface HsrCharacterCostRow {
    characterName: string;
    gameMode: { tag: string };
    draftMode: { tag: string };
    costs: any;
}

export interface HsrLightconeCostRow {
    lightconeName: string;
    gameMode: { tag: string };
    draftMode: { tag: string };
    costs: any;
}

export interface HsrSynergyCostRow {
    id: number;
    sourceName: string;
    targetName: string;
    gameMode: { tag: string };
    draftMode: { tag: string };
    costModifier: number;
}

interface GameDataContextType {
    charactersData: Character[];
    lightconesData: Lightcone[];
    synergiesData: Synergy[];

    characters: HsrCharacterRow[];
    lightcones: HsrLightconeRow[];
    characterCosts: HsrCharacterCostRow[];
    lightconeCosts: HsrLightconeCostRow[];
    synergyCosts: HsrSynergyCostRow[];

    isReady: boolean;
}

const GameDataContext = createContext<GameDataContextType | null>(null);

export function GameDataProvider({ children }: { children: React.ReactNode }) {
    const [characterRows] = useTable(tables.HsrCharacter);
    const [lightconeRows] = useTable(tables.HsrLightcone);
    const [characterCostRows] = useTable(tables.HsrCharacterCost);
    const [lightconeCostRows] = useTable(tables.HsrLightconeCost);
    const [synergyCostRows] = useTable(tables.HsrSynergyCost);

    const value: GameDataContextType = {
        charactersData: (characterRows.map(r => mapToCharacterData(characterCostRows, r)) || []) as unknown as Character[],
        lightconesData: (lightconeRows.map(r => mapToLightconeData(lightconeCostRows, r)) || []) as unknown as Lightcone[],
        // Phase 15.4 D-31: Auction-mode wiring deferred — see .planning/todos/pending/2026-04-14-team-builder-synergy-auction-display.md
        // Hardcoded Classic filter preserves pre-15.4 visual behavior for SynergyDisplay/CostBreakdownChart.
        synergiesData: (synergyCostRows.filter((r: any) => r.draftMode?.tag === 'Classic').map(mapToSynergyData) || []) as unknown as Synergy[],

        characters: characterRows as unknown as HsrCharacterRow[],
        lightcones: lightconeRows as unknown as HsrLightconeRow[],
        characterCosts: characterCostRows as unknown as HsrCharacterCostRow[],
        lightconeCosts: lightconeCostRows as unknown as HsrLightconeCostRow[],
        synergyCosts: synergyCostRows as unknown as HsrSynergyCostRow[],

        isReady: !!characterRows && !!lightconeRows
    };

    return <GameDataContext.Provider value={value}>{children}</GameDataContext.Provider>;
}

export function useGameData(): GameDataContextType {
    const ctx = useContext(GameDataContext);
    if (!ctx) {
        throw new Error('useGameData must be used within a GameDataProvider');
    }
    return ctx;
}
