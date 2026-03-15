'use client';

import { CharacterPool } from "@/features/drafting/components/CharacterPool";
import styles from "./page.module.css"
import { useLoadouts } from "@/features/hooks/useLoadouts";
import { useGameData } from "@/features/game-data/components/GameDataProvider";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Character, CharacterRank, SelectedCharacter } from "@/features/types/enums";
import { TEAM_SIZE, TeamMember } from "@/features/team-builder/LoadoutManager";
import { useCallback } from "react";
import { TeamRoster } from "@/features/team-builder/TeamRoster";
import { LoadoutControls } from "@/features/team-builder/LoadoutControls";
import { CostBreakdownChart } from "@/features/team-builder/cost-breakdown-chart/CostBreakdownChart";

export default function TeamBuilder() {
    const { isAuthenticated, user } = useAuth();
    // ! ! ! UNCOMMENT WHEN DB TEAMS ARE IMPLEMENTED ! ! !
    const useDbLoadouts: boolean = false /* isAuthenticated && user?.discordId !== null */;

    const { charactersData, lightconesData, synergiesData } = useGameData();
    const loadouts = useLoadouts(charactersData, lightconesData, useDbLoadouts);
    
    const handleCharacterSelect = useCallback(
        (character: Character) => {
        if (
            loadouts.resolvedTeam.some(m => m.characterName === character.name) ||
            loadouts.resolvedTeam.length >= TEAM_SIZE
        ) {
            return;
        }

        const newMember: TeamMember = {
            characterName: character.name,
            rank: getDefaultRank(character),
        };

        loadouts.updateCurrentTeam([...loadouts.currentLoadout.team, newMember]);
        },
        [loadouts],
    );

    const getDefaultRank = (character: Character): CharacterRank => {
        if (character.rarity !== 5 || character.displayName.startsWith("MC ")) return "E6";
        return "E0";
    }

    return (
        <div className={styles.teamBuilder}>
            {/* Team roster (4 slots + synergies) */}
            <TeamRoster
            currentLoadout={loadouts.currentLoadout}
            resolvedTeam={loadouts.resolvedTeam}
            characters={charactersData}
            lightcones={lightconesData}
            synergies={synergiesData}
            ruleSet={loadouts.ruleSet}
            onUpdateMember={loadouts.updateMember}
            onRemoveMember={loadouts.removeMember}
            onReorderTeam={loadouts.updateCurrentTeam}
            />

            {/* Cost breakdown chart */}
            <CostBreakdownChart
                resolvedTeam={loadouts.resolvedTeam}
                characters={charactersData}
                lightcones={lightconesData}
                synergies={synergiesData}
                ruleSet={loadouts.ruleSet}
                onToggleRuleSet={() => loadouts.setRuleSet(loadouts.ruleSet === "MemoryOfChaos" ? "ApocalypticShadow" : "MemoryOfChaos")}
                hasRawEntries={loadouts.currentLoadout.team.length > 0}
            />

            <LoadoutControls
                loadouts={loadouts.loadouts}
                loadoutIndex={loadouts.loadoutIndex}
                currentLoadout={loadouts.currentLoadout}
                characters={charactersData}
                onSelectIndex={loadouts.setLoadoutIndex}
                onClearTeam={() => loadouts.updateCurrentTeam([])}
                onRenameCurrent={loadouts.updateCurrentName}
            />

            <CharacterPool
                characters={charactersData}
                selectedCharacters={loadouts.resolvedTeam.map((m): SelectedCharacter => ({ characterName: m.characterName, action: "Pick" }))}
                isDraftComplete={loadouts.resolvedTeam.length >= TEAM_SIZE}
                isDraftStarted={true}
                onCharacterSelect={handleCharacterSelect}
                currentPhase={{ team: "Spectator", action: "Pick" }}
            />
        </div>
    );
}