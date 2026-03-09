import { type RoleTag, type ElementTag, type PathTag, CHAR_ROLE_VARIANTS, PATH_VARIANTS, ELEMENT_VARIANTS } from "../types/enums";

export type TagOf<T extends { tag: string }> = T["tag"];

/** Runtime extractor — returns the lowercase tag string. */
export function getTag<T extends { tag: string }>(value: T): Lowercase<T["tag"]> {
  return value.tag.toLowerCase() as Lowercase<T["tag"]>;
}

export interface IconMaps {
  roles: Record<RoleTag, string>;
  paths: Record<PathTag, string>;
  elements: Record<ElementTag, string>;
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

function buildMap<T extends string>(items: readonly T[], folder: string): Record<T, string> {
  const map = {} as Record<T, string>;
  for (const item of items) {
    map[item] = `/${folder}/${item}.webp`;
  }
  return map;
}

export const iconMaps: IconMaps = {
  roles: buildMap(CHAR_ROLE_VARIANTS, "roles"),
  paths: buildMap(PATH_VARIANTS, "paths"),
  elements: buildMap(ELEMENT_VARIANTS, "elements"),
};