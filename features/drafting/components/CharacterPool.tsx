import { useGameData } from "@/features/game-data/components/GameDataProvider";
import styles from "./CharacterPool.module.css";
import { useCharacterFilters } from "@/features/hooks/useCharacterFilters";
import { CharacterFilterBar } from "./CharacterFilterBar";
import { Character } from "@/features/types/enums";
import { CharacterCard } from "./CharacterCard";

export default function CharacterPool() {
	const { characters } = useGameData();
	const filters = useCharacterFilters(
		characters.map((c) => {
			return {
				name: c.name,
				displayName: c.displayName,
				aliases: c.aliases,
				element: c.element.tag,
				path: c.path.tag,
				rarity: c.rarity,
				role: c.role.tag,
				imageUrl: c.imageUrl,
			} as Character;
		}),
	);

    // ── Team-based border colour ──────────────────────────────────────
    const teamColorClass = (() => {
        // if (!currentPhase || !isDraftStarted || isDraftComplete) return "";
        // if (currentPhase.team === "blue") return styles.blue;
        // if (currentPhase.team === "red") return styles.red;
        return "";
    })();

	return (
		<div className={`${styles.pool} ${teamColorClass} Box`.trim()}>
			{/* Filters */}
			<CharacterFilterBar filterState={filters.filterState} actions={filters} />

			{/* Draft status banner */}
			{/* <DraftStatusBanner
				currentPhase={currentPhase}
				isDraftStarted={isDraftStarted}
				isDraftComplete={isDraftComplete}
			/> */}

            <div className="status-container"
                style={{
                    position: `relative`,
                    width: `100%`,
                    height: `1px`,
                    backgroundColor: `#4b5563`
                }}
            ></div>

			{/* Character grid */}
			<div className={styles.charactersContainer}>
				{filters.filteredCharacters.map((character) => {
					// const selection = selectedCharacters.find(
					const selection = characters.find(
						(s) => s.name === character.name,
					);

					return (
						<CharacterCard
							key={character.name}
							character={character}
							// selection={selection}
							// isSelectable={isCharacterSelectable(character.id)}
							isSelectable={true}
							// onSelect={handleSelect}
							onSelect={() => {}}
						/>
					);
				})}
			</div>

			{/* Empty state */}
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
