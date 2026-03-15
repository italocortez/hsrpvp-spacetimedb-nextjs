"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import LoadoutManager, { Loadout, ResolvedTeamMember, TeamMember } from "../team-builder/LoadoutManager";
import { Character, Lightcone, RuleSet } from "../types/enums";

// ─── Public interface ────────────────────────────────────────────────

export interface UseLoadoutsReturn {
	loadouts: Loadout[];
	loadoutIndex: number;
	currentLoadout: Loadout;
	resolvedTeam: ResolvedTeamMember[];
	ruleSet: RuleSet;

	setLoadoutIndex: (index: number) => void;
	setRuleSet: (ruleSet: RuleSet) => void;
	updateCurrentTeam: (team: TeamMember[]) => void;
	updateCurrentName: (name: string) => void;
	updateCurrentNotes: (notes: string) => void;
	updateMember: (index: number, updates: Partial<ResolvedTeamMember>) => void;
	removeMember: (index: number) => void;
	resetAllLoadouts: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────

/**
 * Storage-agnostic loadout management.
 *
 * ARCHITECTURE NOTE — why saves happen in mutations, not effects:
 *
 * The previous approach used useEffect to sync state → localStorage on
 * every change.  This is inherently fragile in Next.js App Router because:
 *   1. SSR renders the component with defaults (no localStorage on server)
 *   2. Client hydration reuses the SSR state (still defaults)
 *   3. React fires ALL mount effects — including the save effect, which
 *      writes defaults to localStorage and nukes real saved data
 *   4. Guards (useRef flags) are unreliable across StrictMode double-invoke
 *      and concurrent rendering batching
 *
 * The fix: save explicitly inside each mutation function.  Saves ONLY happen
 * when the user performs an action.  Hydration reads localStorage once on
 * mount and never triggers a save.  No race conditions possible.
 *
 * @param isAuthenticated — When `true`, mutations skip localStorage writes.
 *   Wire up SpacetimeDB reducers in the mutation functions when ready.
 */
export function useLoadouts(
	characters: Character[],
	lightcones: Lightcone[],
	isAuthenticated = false,
): UseLoadoutsReturn {
	// ── State ───────────────────────────────────────────────────────────
	//
	// Initialise with safe SSR defaults.  The client-mount effect below
	// immediately replaces these with the real localStorage data.

    const [loadouts, setLoadouts] = useState<Loadout[]>(LoadoutManager.getDefaultLoadouts);
	const [loadoutIndex, setLoadoutIndex] = useState<number>(0);
	const [ruleSet, setRuleSet] = useState<RuleSet>("ApocalypticShadow" as RuleSet);

	const currentLoadout: Loadout = loadouts[loadoutIndex] ?? {
		name: `Team ${loadoutIndex + 1}`,
		team: [],
		notes: "",
	};

	const resolvedTeam: ResolvedTeamMember[] = useMemo(
		() =>
			characters.length && lightcones.length
				? LoadoutManager.resolveTeam(
						currentLoadout.team,
						characters,
						lightcones,
					)
				: [],
		[currentLoadout.team, characters, lightcones],
	);

	// ── Hydrate from localStorage on client mount ─────────────────────
	//
	// This is the ONLY effect.  It reads; it never writes.
	// No save effects exist — saves happen inside mutations below.

	useEffect(() => {
		setLoadouts(LoadoutManager.loadLoadouts());
		setLoadoutIndex(LoadoutManager.loadCurrentLoadoutIndex());
		setRuleSet(LoadoutManager.loadRulesetView());
	}, []);

	// ── Save helpers ──────────────────────────────────────────────────
	//
	// Wraps localStorage writes behind the auth check.
	// TODO: When `isAuthenticated`, call SpacetimeDB reducers here instead.

	const saveLoadouts = useCallback(
		(next: Loadout[]) => {
			if (!isAuthenticated) LoadoutManager.saveLoadouts(next);
		},
		[isAuthenticated],
	);

	const saveIndex = useCallback(
		(index: number) => {
			if (!isAuthenticated) LoadoutManager.saveCurrentLoadoutIndex(index);
		},
		[isAuthenticated],
	);

	const saveRuleSet = useCallback(
		(rs: RuleSet) => {
			if (!isAuthenticated) LoadoutManager.saveRulesetView(rs);
		},
		[isAuthenticated],
	);

	// ── Public setters (save immediately on user action) ──────────────

	const handleSetLoadoutIndex = useCallback(
		(index: number) => {
			setLoadoutIndex(index);
			saveIndex(index);
		},
		[saveIndex],
	);

	const handleSetRuleSet = useCallback(
		(rs: RuleSet) => {
			setRuleSet(rs);
			saveRuleSet(rs);
		},
		[saveRuleSet],
	);

	// ── Mutations (each one saves synchronously after updating state) ──

	const updateCurrentTeam = useCallback(
		(team: TeamMember[]) => {
			setLoadouts((prev) => {
				const next = [...prev];
				next[loadoutIndex] = { ...next[loadoutIndex], team };
				saveLoadouts(next);
				return next;
			});
		},
		[loadoutIndex, saveLoadouts],
	);

	const updateCurrentName = useCallback(
		(name: string) => {
			setLoadouts((prev) => {
				const next = [...prev];
				next[loadoutIndex] = { ...next[loadoutIndex], name };
				saveLoadouts(next);
				return next;
			});
		},
		[loadoutIndex, saveLoadouts],
	);

	const updateCurrentNotes = useCallback(
		(notes: string) => {
			setLoadouts((prev) => {
				const next = [...prev];
				next[loadoutIndex] = { ...next[loadoutIndex], notes };
				saveLoadouts(next);
				return next;
			});
		},
		[loadoutIndex, saveLoadouts],
	);

	const updateMember = useCallback(
		(index: number, updates: Partial<ResolvedTeamMember>) => {
			const updated = { ...resolvedTeam[index], ...updates };
			const unresolved = LoadoutManager.unresolveTeamMember(
				updated,
				characters,
				lightcones,
			);
			const newTeam = [...currentLoadout.team];
			newTeam[index] = unresolved;
			updateCurrentTeam(newTeam);
		},
		[
			resolvedTeam,
			currentLoadout.team,
			characters,
			lightcones,
			updateCurrentTeam,
		],
	);

	const removeMember = useCallback(
		(index: number) => {
			updateCurrentTeam(currentLoadout.team.filter((_, i) => i !== index));
		},
		[currentLoadout.team, updateCurrentTeam],
	);

	const resetAllLoadouts = useCallback(() => {
		const defaults = LoadoutManager.getDefaultLoadouts();
		setLoadouts(defaults);
		setLoadoutIndex(0);
		saveLoadouts(defaults);
		saveIndex(0);
	}, [saveLoadouts, saveIndex]);

	return {
		loadouts,
		loadoutIndex,
		currentLoadout,
		resolvedTeam,
		ruleSet,
		setLoadoutIndex: handleSetLoadoutIndex,
		setRuleSet: handleSetRuleSet,
		updateCurrentTeam,
		updateCurrentName,
		updateCurrentNotes,
		updateMember,
		removeMember,
		resetAllLoadouts,
	};
}
