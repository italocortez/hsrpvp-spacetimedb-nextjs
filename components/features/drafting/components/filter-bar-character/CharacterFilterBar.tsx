"use client";

import { CHAR_ROLE_VARIANTS, ELEMENT_VARIANTS, PATH_VARIANTS } from "@/components/features/types/enums";
import { FilterButtonGroup } from "../filter-group/FilterButtonGroup";
import styles from "./CharacterFilterBar.module.css";
import { ClearIcon } from "@/components/globals/icons";
import { CharacterFilterActions, CharacterFilterState } from "@/components/features/hooks/useCharacterFilters";
import { iconMaps } from "@/components/features/hooks/useIconMaps";

interface CharacterFilterBarProps {
	filterState: CharacterFilterState;
	actions: CharacterFilterActions;
}

export function CharacterFilterBar({
	filterState,
	actions,
}: CharacterFilterBarProps) {
	const { selectedRoles, selectedPaths, selectedElements, searchTerm } = filterState;
	const { toggleRole, togglePath, toggleElement, setSearchTerm, clearAll, hasActiveFilters } = actions;

	return (
		<div className={styles.filters}>
			{/* Roles */}
			<FilterButtonGroup
				className={styles.roles}
				items={CHAR_ROLE_VARIANTS}
				selected={selectedRoles}
				onToggle={toggleRole}
				iconMap={iconMaps.roles}
				renderMode="icon-and-label"
				iconSize="1.25rem"
			/>

			{/* Elements */}
			<FilterButtonGroup
				className={styles.elements}
				items={ELEMENT_VARIANTS}
				selected={selectedElements}
				onToggle={toggleElement}
				iconMap={iconMaps.elements}
				renderMode="icon-only"
				iconSize="1.875rem"
			/>

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
				placeholder="Search characters..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className={styles.searchBar}
				name="search-bar"
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
