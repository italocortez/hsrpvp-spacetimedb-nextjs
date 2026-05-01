"use client";

import { memo } from "react";
import { Character, SelectedCharacter } from "@/components/features/types/enums";
import styles from "./CharacterPool.module.css";

interface CharacterCardProps {
	character: Character;
	selection?: SelectedCharacter;
	isSelectable: boolean;
	onSelect: (character: Character) => void;
}

export const CharacterCard = memo(function CharacterCard({
	character,
	selection,
	isSelectable,
	onSelect,
}: CharacterCardProps) {
	const isPicked = selection?.action === "Pick";
	const isBanned = selection?.action === "Ban";

	const statusClass = isPicked
		? styles.picked
		: isBanned
			? styles.banned
			: !isSelectable
				? styles.disabled
				: undefined;

	return (
		<button
			className={`${styles.character} ${statusClass ?? ""}`.trim()}
			onClick={() => isSelectable && onSelect(character)}
			disabled={!isSelectable}
			data-rarity={character.rarity}
		>
			{selection && (
				<div className={styles.statusOverlay}>
					<h3>{isPicked ? "Picked" : isBanned ? "Banned" : "Unavailable"}</h3>
				</div>
			)}

			<img
				src={character.imageUrl || ""}
				className={`${styles.portrait} portrait`} // twice because of global styles. styles.portrait gives a randomly generated string, which doesn't work
				alt={character.displayName}
			/>

			<h3 className={styles.name}>{character.displayName}</h3>
		</button>
	);
});
