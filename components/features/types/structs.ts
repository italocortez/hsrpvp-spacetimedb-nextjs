// Frontend mirror of spacetimedb/src/types/structs.ts
// Keep in sync when server struct shapes change.

export const EIDOLON_KEYS = ['e0', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6'] as const;

export const SUPERIMPOSITION_KEYS = ['s1', 's2', 's3', 's4', 's5'] as const;

export const LOBBY_CONFIG_KEYS = [
    'team_size', 'draft_mode', 'ban_mode',
    'standard_turn_seconds', 'reserve_bank_seconds', 'auction_budget',
    'roster_diff_advantage', 'roster_threshold',
    'under_threshold_advantage', 'above_threshold_penalty', 'death_penalty',
] as const;
