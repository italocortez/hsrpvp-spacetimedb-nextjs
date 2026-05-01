"use client";

import { PATH_VARIANTS } from "@/components/features/types/enums";
import { FilterButtonGroup } from "./FilterButtonGroup";
import styles from "./CharacterPool.module.css";
import { ClearIcon } from "@/components/globals/icons";
import { LightconeFilterActions, LightconeFilterState } from "@/components/features/hooks/useLightconeFilters";
import { iconMaps } from "@/components/features/hooks/useIconMaps";

interface LightconeFilterBarProps {
	filterState: LightconeFilterState;
	actions: LightconeFilterActions;
}

export function LightconeFilterBar({ filterState, actions }: LightconeFilterBarProps) {
	const { selectedPaths, searchTerm } = filterState;
	const { togglePath, setSearchTerm, clearAll, hasActiveFilters } = actions;

	return (
		<div className={styles.filters}>
			{/* Paths */}
			<FilterButtonGroup
				className={styles.paths}
				items={PATH_VARIANTS}
				selected={selectedPaths}
				onToggle={togglePath}
				iconMap={iconMaps.paths}
				renderMode="icon-only"
				iconSize="1.5rem"
			/>

			{/* Search */}
			<input
				type="text"
				placeholder="Search lightcones..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className={styles.searchBar}
				name="lc-search-bar"
			/>

			{/* Clear all */}
			<button
				className={styles.clearButton}
				onClick={clearAll}
				disabled={!hasActiveFilters}
				title="Clear all filters"
			>
				<ClearIcon />
				<span>Clear</span>
			</button>
		</div>
	);
}
