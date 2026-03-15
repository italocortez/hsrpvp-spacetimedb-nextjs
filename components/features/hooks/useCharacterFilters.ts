"use client";

import { useState, useMemo, useCallback } from "react";
import type { Character, Element, Path, Role } from "../types/enums";

export interface CharacterFilterState {
	selectedRoles: Role[];
	selectedPaths: Path[];
	selectedElements: Element[];
	searchTerm: string;
}

export interface CharacterFilterActions {
	toggleRole: (role: Role) => void;
	togglePath: (path: Path) => void;
	toggleElement: (element: Element) => void;
	setSearchTerm: (term: string) => void;
	clearAll: () => void;
	hasActiveFilters: boolean;
}

export interface UseCharacterFiltersReturn extends CharacterFilterActions {
	filteredCharacters: Character[];
	filterState: CharacterFilterState;
}

const INITIAL_STATE: CharacterFilterState = {
	selectedRoles: [],
	selectedPaths: [],
	selectedElements: [],
	searchTerm: "",
};

/**
 * Encapsulates all character filtering logic.
 * Pure state + derived data — no SpacetimeDB or rendering concerns.
 */
export function useCharacterFilters(
	characters: Character[],
): UseCharacterFiltersReturn {
    const [filterState, setFilterState] = useState<CharacterFilterState>(INITIAL_STATE);
	const { selectedRoles, selectedPaths, selectedElements, searchTerm } = filterState;

	// ── Toggle helpers ──────────────────────────────────────────────────
	const toggleRole = useCallback((role: Role) => {
		setFilterState((prev) => ({
			...prev,
			selectedRoles: prev.selectedRoles.includes(role)
				? prev.selectedRoles.filter((r) => r !== role)
				: [...prev.selectedRoles, role],
		}));
	}, []);

	const togglePath = useCallback((path: Path) => {
		setFilterState((prev) => ({
			...prev,
			selectedPaths: prev.selectedPaths.includes(path)
				? prev.selectedPaths.filter((p) => p !== path)
				: [...prev.selectedPaths, path],
		}));
	}, []);

	const toggleElement = useCallback((element: Element) => {
		setFilterState((prev) => ({
			...prev,
			selectedElements: prev.selectedElements.includes(element)
				? prev.selectedElements.filter((e) => e !== element)
				: [...prev.selectedElements, element],
		}));
	}, []);

	const setSearchTerm = useCallback((term: string) => {
		setFilterState((prev) => ({ ...prev, searchTerm: term }));
	}, []);

	const clearAll = useCallback(() => {
		setFilterState(INITIAL_STATE);
	}, []);

	// ── Derived ─────────────────────────────────────────────────────────
	const hasActiveFilters =
		selectedRoles.length > 0 ||
		selectedPaths.length > 0 ||
		selectedElements.length > 0 ||
		searchTerm.trim().length > 0;

	const filteredCharacters = useMemo((): Character[] => {
		let result = characters;

		if (searchTerm.trim()) {
			const lower = searchTerm.toLowerCase();
			result = result.filter(
				(c) =>
					c.displayName.toLowerCase().includes(lower) ||
					c.aliases.some((a) => a.toLowerCase().includes(lower)),
			);
		}

		// Character.role / .element / .path are already lowercase tag strings
		// (normalised at the boundary), so direct === comparison works fine.
		if (selectedRoles.length > 0) {
			result = result.filter((c) => selectedRoles.includes(c.role));
		}
		if (selectedElements.length > 0) {
			result = result.filter((c) => selectedElements.includes(c.element));
		}
		if (selectedPaths.length > 0) {
			result = result.filter((c) => selectedPaths.includes(c.path));
		}

		return [...result].sort((a, b) => a.displayName.localeCompare(b.displayName));
	}, [characters, searchTerm, selectedRoles, selectedElements, selectedPaths]);

	return {
		filteredCharacters,
		filterState,
		toggleRole,
		togglePath,
		toggleElement,
		setSearchTerm,
		clearAll,
		hasActiveFilters,
	};
}