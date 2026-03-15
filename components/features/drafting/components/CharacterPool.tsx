"use client";

import { useCallback } from "react";
import { CharacterFilterBar } from "./CharacterFilterBar";
import { CharacterCard } from "./CharacterCard";
import styles from "./CharacterPool.module.css";
import { Character, SelectedCharacter, Team, Turn } from "@/components/features/types/enums";
import { useCharacterFilters } from "@/components/features/hooks/useCharacterFilters";

interface CharacterPoolProps {
	characters: Character[];
	selectedCharacters: SelectedCharacter[];
	onCharacterSelect: (character: Character) => void;
	currentPhase?: Turn;
	isDraftComplete: boolean;
	isDraftStarted: boolean;
	canBanCharacter?: (characterName: string, team: Team) => boolean;
}

export function CharacterPool({
	characters,
	selectedCharacters,
	onCharacterSelect,
	currentPhase,
	isDraftComplete,
	isDraftStarted,
	canBanCharacter,
}: CharacterPoolProps) {
	const filters = useCharacterFilters(characters);

	const isCharacterSelectable = useCallback(
		(characterName: string): boolean => {
			if (
				selectedCharacters.some((s) => s.characterName === characterName) ||
				isDraftComplete ||
				!currentPhase ||
				!isDraftStarted
			) {
				return false;
			}

			if (currentPhase.action === "Ban" && canBanCharacter) {
				return canBanCharacter(characterName, currentPhase.team);
			}

			return true;
		},
		[
			selectedCharacters,
			isDraftComplete,
			isDraftStarted,
			currentPhase,
			canBanCharacter,
		],
	);

	const handleSelect = useCallback(
		(character: Character) => {
			if (!isCharacterSelectable(character.name)) return;
			filters.clearAll();
			onCharacterSelect(character);
		},
		[isCharacterSelectable, filters.clearAll, onCharacterSelect],
	);

	const teamColorClass = (() => {
		if (!currentPhase || !isDraftStarted || isDraftComplete) return "";
		if (currentPhase.team === "Blue") return styles.blue;
		if (currentPhase.team === "Red") return styles.red;
		return "";
	})();

	return (
		<div className={`${styles.pool} ${teamColorClass} Box`.trim()}>
			<CharacterFilterBar filterState={filters.filterState} actions={filters} />

            <div className={styles.statusContainer}>
                {/* Text wrapper */}
                <div style={{ display: (currentPhase?.team === "Spectator") ? `none` : `` }}>
                    {!isDraftStarted && (
                        <h3 className={styles.beginDraft}>Press &quot;Start Draft&quot; to begin</h3>
                    )}
                    {isDraftComplete && (
                        <h3 className={styles.draftComplete}>Complete!</h3>
                    )}
                </div>
            </div>

			<div className={styles.charactersContainer}>
				{filters.filteredCharacters.map((character) => {
					const selection = selectedCharacters.find(s => s.characterName === character.name);

					return (
						<CharacterCard
							key={character.name}
							character={character}
							selection={selection}
							isSelectable={isCharacterSelectable(character.name)}
							onSelect={handleSelect}
						/>
					);
				})}
			</div>

			{filters.filteredCharacters.length === 0 && (
				<h3 className={styles.info}>
					{filters.hasActiveFilters
						? "No characters found matching your filters."
						: "Loading characters..."}
				</h3>
			)}
		</div>
	);
}
