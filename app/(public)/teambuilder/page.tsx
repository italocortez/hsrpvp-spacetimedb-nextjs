'use client';

import { CharacterPool } from "@/components/features/drafting/components/CharacterPool";
import styles from "./page.module.css"
import { useLoadouts } from "@/components/features/hooks/useLoadouts";
import { useGameData } from "@/components/features/game-data/components/GameDataProvider";
import { useAuth } from "@/components/features/auth/hooks/useAuth";
import { Character, CharacterRank, SelectedCharacter } from "@/components/features/types/enums";
import { useCallback, useMemo, memo } from "react";
import { LoadingSpinner } from "@/components/globals/icons";
import { CostBreakdownChart } from "@/components/features/team-builder/cost-breakdown-chart/CostBreakdownChart";
import { TEAM_SIZE, TeamMember } from "@/components/features/team-builder/LoadoutManager";
import { TeamRoster } from "@/components/features/team-builder/team-roster/TeamRoster";
import { LoadoutControls } from "@/components/features/team-builder/loadout-controls/LoadoutControls";

// Hardcoded phase for TeamBuilder logic since it's not a real draft.
const DUMMY_PHASE = { team: "Spectator", action: "Pick" } as const;

const getDefaultRank = (character: Character): CharacterRank => {
    if (character.rarity !== 5 || character.displayName.startsWith("MC ")) return "E6";
    return "E0";
};

const TeamBuilder = memo(function TeamBuilder() {
    const { isAuthenticated, user } = useAuth();
    // ! ! ! UNCOMMENT WHEN DB TEAMS ARE IMPLEMENTED ! ! !
    const useDbLoadouts: boolean = false /* isAuthenticated && user?.discordId !== null */;

    const { charactersData, lightconesData, synergiesData } = useGameData();
    const loadouts = useLoadouts(charactersData, lightconesData, useDbLoadouts);
    const isReadyToRender = loadouts.isHydrated; // Only render once loadouts are ready

    const handleCharacterSelect = useCallback(
        (character: Character) => {
            if (
                loadouts.currentLoadout.team.some(m => m.characterName === character.name) ||
                loadouts.currentLoadout.team.length >= TEAM_SIZE
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

    // Memoize computed values that are passed as props
    const selectedCharacters = useMemo(
        () => loadouts.currentLoadout.team.map((m): SelectedCharacter => ({ characterName: m.characterName, action: "Pick" })),
        [loadouts.currentLoadout.team],
    );

    const isDraftComplete = useMemo(
        () => loadouts.currentLoadout.team.length >= TEAM_SIZE,
        [loadouts.currentLoadout.team.length],
    );

    const hasRawEntries = useMemo(
        () => loadouts.currentLoadout.team.length > 0,
        [loadouts.currentLoadout.team.length],
    );

    const handleToggleRuleSet = useCallback(
        () => loadouts.setRuleSet(loadouts.ruleSet === "MemoryOfChaos" ? "ApocalypticShadow" : "MemoryOfChaos"),
        [loadouts],
    );

    const handleClearTeam = useCallback(
        () => loadouts.updateCurrentTeam([]),
        [loadouts],
    );


    if (!isReadyToRender) {
        return (
            <div className={styles.teamBuilderLoading}>
                <LoadingSpinner />
            </div>
        );
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
                onToggleRuleSet={handleToggleRuleSet}
                hasRawEntries={hasRawEntries}
            />

            <LoadoutControls
                loadouts={loadouts.loadouts}
                loadoutIndex={loadouts.loadoutIndex}
                currentLoadout={loadouts.currentLoadout}
                characters={charactersData}
                onSelectIndex={loadouts.setLoadoutIndex}
                onClearTeam={handleClearTeam}
                onRenameCurrent={loadouts.updateCurrentName}
            />

            <CharacterPool
                characters={charactersData}
                selectedCharacters={selectedCharacters}
                isDraftComplete={isDraftComplete}
                isDraftStarted={true}
                onCharacterSelect={handleCharacterSelect}
                currentPhase={DUMMY_PHASE}
            />
        </div>
    );
});

export default TeamBuilder;