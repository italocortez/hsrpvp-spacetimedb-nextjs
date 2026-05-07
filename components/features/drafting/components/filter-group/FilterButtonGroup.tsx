"use client";

import styles from "./FilterButtonGroup.module.css";

interface FilterButtonGroupProps<T extends string> {
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
		<div className={`${styles.group}${className ? ` ${className}` : ''}`}>
			{items.map((item) => {
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
							<span style={{ textTransform: 'capitalize' }}>{item}</span>
						)}
					</button>
				);
			})}
		</div>
	);
}