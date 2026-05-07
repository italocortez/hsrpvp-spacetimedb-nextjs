"use client";

import { useState, useMemo, useCallback } from "react";
import type { Lightcone, Path } from "../types/enums";

export interface LightconeFilterState {
	selectedPaths: Path[];
	searchTerm: string;
}

export interface LightconeFilterActions {
	togglePath: (path: Path) => void;
	setSearchTerm: (term: string) => void;
	clearAll: () => void;
	hasActiveFilters: boolean;
}

export interface UseLightconeFiltersReturn extends LightconeFilterActions {
	filteredLightcones: Lightcone[];
	filterState: LightconeFilterState;
}

const INITIAL_STATE: LightconeFilterState = {
	selectedPaths: [],
	searchTerm: "",
};

/**
 * Encapsulates all lightcone filtering logic.
 * Pure state + derived data — no SpacetimeDB or rendering concerns.
 */
export function useLightconeFilters(lightcones: Lightcone[]): UseLightconeFiltersReturn {
	const [filterState, setFilterState] = useState<LightconeFilterState>(INITIAL_STATE);
	const { selectedPaths, searchTerm } = filterState;

	// ── Toggle helpers ──────────────────────────────────────────────────
	const togglePath = useCallback((path: Path) => {
		setFilterState((prev) => ({
			...prev,
			selectedPaths: prev.selectedPaths.includes(path)
				? prev.selectedPaths.filter((p) => p !== path)
				: [...prev.selectedPaths, path],
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
		selectedPaths.length > 0 || searchTerm.trim().length > 0;

	const filteredLightcones = useMemo((): Lightcone[] => {
		let result = lightcones;

		if (searchTerm.trim()) {
			const lower = searchTerm.toLowerCase();
			result = result.filter(
				(c) =>
					c.displayName.toLowerCase().includes(lower) ||
					c.aliases.some((a) => a.toLowerCase().includes(lower)),
			);
		}

		// Lightcone.path is already lowercase tag strings
		// (normalised at the boundary), so direct === comparison works fine.
		if (selectedPaths.length > 0) {
			result = result.filter((c) => selectedPaths.includes(c.path));
		}

		return [...result].sort((a, b) => a.displayName.localeCompare(b.displayName));
	}, [lightcones, searchTerm, selectedPaths]);

	return {
		filteredLightcones,
		filterState,
		togglePath,
		setSearchTerm,
		clearAll,
		hasActiveFilters,
	};
}
