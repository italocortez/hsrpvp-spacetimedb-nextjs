// Frontend mirror of spacetimedb/src/types/enums.ts
// Keep in sync when server enum variants change.

export const PATH_VARIANTS = [ 'Abundance', 'Destruction', 'Erudition', 'Harmony', 'Hunt', 'Nihility', 'Preservation', 'Remembrance', 'Elation' ] as const;
export type PathTag = typeof PATH_VARIANTS[number];

export const ELEMENT_VARIANTS = [ 'Fire', 'Ice', 'Imaginary', 'Lightning', 'Physical', 'Quantum', 'Wind' ] as const;
export type ElementTag = typeof ELEMENT_VARIANTS[number];

export const CHAR_ROLE_VARIANTS = [ 'Dps', 'Support', 'Sustain' ] as const;
export type RoleTag = typeof CHAR_ROLE_VARIANTS[number];

export type Rarity = 3 | 4 | 5;

export interface Character {
  name: string;
  displayName: string;
  aliases: string[];
  element: ElementTag;
  path: PathTag;
  rarity: Rarity;
  role: RoleTag;
  imageUrl?: string;
}

export const GAME_MODE_VARIANTS = [
    'MemoryOfChaos', 'ApocalypticShadow', 'AnomalyArbitration',
] as const;

export const USER_ROLE_VARIANTS = ['Admin', 'TournamentHost', 'User'] as const;

export const DRAFT_MODE_VARIANTS = ['Classic', 'Auction'] as const;

export const BAN_MODE_VARIANTS = ['None', 'Two', 'Four', 'Six'] as const;

export const LOBBY_STAGE_VARIANTS = ['Waiting', 'Drafting', 'Finished'] as const;

export const PARTICIPATION_ROLE_VARIANTS = ['Player', 'Spectator'] as const;

export const TEAM_LABEL_VARIANTS = ['Spectator', 'Blue', 'Red'] as const;

export const MATCH_RESULT_VARIANTS = ['BlueWins', 'RedWins', 'Draw', 'Aborted'] as const;

export const ACTION_TYPE_VARIANTS = [
    'Pick', 'Ban', 'Nominate', 'Bid', 'AuctionSold', 'Pause', 'Undo',
] as const;

// Lookup map for validation (keyed by column name convention)
export const ENUM_VALUES: Record<string, readonly string[]> = {
    path: PATH_VARIANTS,
    element: ELEMENT_VARIANTS,
    role: CHAR_ROLE_VARIANTS,
    gameMode: GAME_MODE_VARIANTS,
    userRole: USER_ROLE_VARIANTS,
    draftMode: DRAFT_MODE_VARIANTS,
    banMode: BAN_MODE_VARIANTS,
    lobbyStage: LOBBY_STAGE_VARIANTS,
    participationRole: PARTICIPATION_ROLE_VARIANTS,
    teamLabel: TEAM_LABEL_VARIANTS,
    matchResult: MATCH_RESULT_VARIANTS,
    actionType: ACTION_TYPE_VARIANTS,
};
