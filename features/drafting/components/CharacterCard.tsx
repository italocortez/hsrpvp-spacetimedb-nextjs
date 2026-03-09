"use client";

import { Character } from "../../types/enums";
import styles from "./character-pool/CharacterPool.module.css";

interface CharacterCardProps {
  character: Character;
//   selection?: SelectedCharacter;
  isSelectable: boolean;
  onSelect: (character: Character) => void;
}

function placeholderSvg(name: string): string {
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' fill='%23374151'/><text x='50%' y='50%' font-family='Arial' font-size='42' font-weight='bold' text-anchor='middle' fill='white'>${name.slice(0, 2)}</text></svg>`;
}

export function CharacterCard({
  character,
//   selection,
  isSelectable,
  onSelect,
}: CharacterCardProps) {
//   const isPicked = selection?.action === "pick";
//   const isBanned = selection?.action === "ban";

//   const statusClass = isPicked
//     ? styles.picked
//     : isBanned
//       ? styles.banned
//       : !isSelectable
//         ? styles.disabled
//         : undefined;

  return (
    <button
    //   className={`${styles.character} ${statusClass ?? ""}`.trim()}
      className={`${styles.character}`.trim()}
      onClick={() => isSelectable && onSelect(character)}
      disabled={!isSelectable}
      data-rarity={character.rarity}
    >
      {/* {selection && (
        <div className={styles.statusOverlay}>
          <h3>{isPicked ? "Picked" : isBanned ? "Banned" : "Unavailable"}</h3>
        </div>
      )} */}

      <img
        src={character.imageUrl || placeholderSvg(character.displayName)}
        className={styles.portrait}
        alt={character.displayName}
      />

      <h3 className={styles.name}>{character.displayName}</h3>
    </button>
  );
}