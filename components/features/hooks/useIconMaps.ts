import {
Role,
Element,
Path,
CHAR_ROLE_VARIANTS,
PATH_VARIANTS,
ELEMENT_VARIANTS,
RuleSet,
GAME_MODE_VARIANTS,
} from "../types/enums";

export interface IconMaps {
	roles: Record<Role, string>;
	paths: Record<Path, string>;
	elements: Record<Element, string>;
	ruleSets: Record<RuleSet, string>;
}

/**
 * Builds icon URL maps from static assets in public/.
 *
 * Icons live at:
 *   /roles/{role}.webp
 *   /elements/{element}.webp
 *   /paths/{path}.webp
 *
 * No hook needed — these are static and never change at runtime.
 * Call once at module scope or memoize if you prefer.
 */

function buildMap<T extends string>(items: readonly T[],folder: string,): Record<T, string> {
	const map = {} as Record<T, string>;
	for (const item of items) {
		// Enum values are PascalCase (e.g. 'Harmony', 'Dps', 'Fire') to match
		// backend data; static asset files under public/{paths,roles,elements,game_modes}
		// are all lowercase. Always lowercase the item when building the URL.
		// game_modes additionally uses .png while the others use .webp.
		const ext = folder === "game_modes" ? "png" : "webp";
		map[item] = `/${folder}/${item.toLowerCase()}.${ext}`;
	}
	return map;
}

export const iconMaps: IconMaps = {
	roles: buildMap(CHAR_ROLE_VARIANTS, "roles"),
	paths: buildMap(PATH_VARIANTS, "paths"),
	elements: buildMap(ELEMENT_VARIANTS, "elements"),
	ruleSets: buildMap(GAME_MODE_VARIANTS, "game_modes"),
};