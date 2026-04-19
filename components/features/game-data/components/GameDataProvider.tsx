'use client';

import React, { createContext, useContext, useEffect, useRef } from 'react';
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

// Phase 16 D-01/D-02: archetype tables added to layer-0 subscription set.
// Archetype is the reference table (id, name, description); HsrCharacterArchetype is the
// character↔archetype join (characterName, archetypeId). Both public: true, static reference data.
export interface ArchetypeRow {
    id: number;
    name: string;
    description: string;
}

export interface HsrCharacterArchetypeRow {
    characterName: string;
    archetypeId: number;
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
    archetypes: ArchetypeRow[];
    characterArchetypes: HsrCharacterArchetypeRow[];

    isReady: boolean;
}

const GameDataContext = createContext<GameDataContextType | null>(null);

export function GameDataProvider({ children }: { children: React.ReactNode }) {
    // D-01: 7 layer-0 HSR public reference tables subscribed at the provider tree.
    // D-04: useTable is the default mechanism; explicit SQL subscriptions are not used here.
    // D-05: All 7 subscriptions fire on STDB connect regardless of auth state (anon + authed).
    const [characterRows] = useTable(tables.HsrCharacter);
    const [lightconeRows] = useTable(tables.HsrLightcone);
    const [characterCostRows] = useTable(tables.HsrCharacterCost);
    const [lightconeCostRows] = useTable(tables.HsrLightconeCost);
    const [synergyCostRows] = useTable(tables.HsrSynergyCost);
    const [archetypeRows] = useTable(tables.Archetype);
    const [characterArchetypeRows] = useTable(tables.HsrCharacterArchetype);

    // D-33: single mount-log announcing the 7-table subscription set.
    const mountedRef = useRef(false);
    useEffect(() => {
        if (mountedRef.current) return;
        mountedRef.current = true;
        console.log('[GameDataProvider] mounted — subscribing to 7 public reference tables (anon+authed per D-05)');
    }, []);

    // D-33: "all-tables ready" marker — fires once when every table has at least one row
    // (matches the existing `isReady` mental model; avoids per-table log spam).
    const readyLoggedRef = useRef(false);
    const allReady = characterRows.length > 0
        && lightconeRows.length > 0
        && characterCostRows.length > 0
        && lightconeCostRows.length > 0
        && synergyCostRows.length > 0
        && archetypeRows.length > 0
        && characterArchetypeRows.length > 0;
    useEffect(() => {
        if (!allReady || readyLoggedRef.current) return;
        readyLoggedRef.current = true;
        console.log(
            `[GameDataProvider] all 7 tables ready — characters=${characterRows.length}, lightcones=${lightconeRows.length}, characterCosts=${characterCostRows.length}, lightconeCosts=${lightconeCostRows.length}, synergyCosts=${synergyCostRows.length}, archetypes=${archetypeRows.length}, characterArchetypes=${characterArchetypeRows.length}`
        );
    }, [allReady, characterRows.length, lightconeRows.length, characterCostRows.length, lightconeCostRows.length, synergyCostRows.length, archetypeRows.length, characterArchetypeRows.length]);

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
        archetypes: archetypeRows as unknown as ArchetypeRow[],
        characterArchetypes: characterArchetypeRows as unknown as HsrCharacterArchetypeRow[],

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
