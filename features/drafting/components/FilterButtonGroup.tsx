"use client";

import styles from "./character-pool/CharacterPool.module.css";

interface FilterButtonGroupProps<T extends string> {
  /** CSS class for the group container (e.g. styles.roles, styles.elements) */
  className?: string;
  items: readonly T[];
  selected: T[];
  onToggle: (item: T) => void;
  /** Map of item → icon URL. */
  iconMap: Record<T, string>;
  /** Render mode controls how the button content is displayed. */
  renderMode: "icon-and-label" | "icon-only";
  /** Icon dimensions (CSS values). */
  iconSize?: string;
}

/**
 * Generic grouped toggle-button strip used for role, element, and path filters.
 */
export function FilterButtonGroup<T extends string>({
  className,
  items,
  selected,
  onToggle,
  iconMap,
  renderMode,
  iconSize = "1.25rem",
}: FilterButtonGroupProps<T>) {
  return (
    <div className={className}>
      {items.map(item => {
        const isSelected = selected.includes(item);
        const iconUrl = iconMap[item];

        return (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={isSelected ? styles.selected : undefined}
            title={item}
          >
            {iconUrl && (
              <img
                src={iconUrl}
                alt={item}
                style={{ height: iconSize, width: iconSize }}
              />
            )}
            {renderMode === "icon-and-label" && (
              <span className={styles.capitalize}>{item}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}