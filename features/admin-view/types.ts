import { UPSERT_TABLE_COLUMNS, UpsertTableName } from '../types/tableColumns';

export type { UpsertTableName };

export type AdminTab = 'tables' | 'bulk-upsert' | 'users';

export const ADMIN_TABS: { key: AdminTab; label: string }[] = [
    { key: 'tables', label: 'Table Explorer' },
    { key: 'bulk-upsert', label: 'Bulk Upsert' },
    { key: 'users', label: 'User Manager' },
];

// Tables the explorer can browse (public tables only)
export const PUBLIC_TABLES = [
    'User',
    'UserIdentity',
    'HsrCharacter',
    'HsrLightcone',
    'HsrCharacterCost',
    'HsrLightconeCost',
    'HsrSynergyCost',
    'Lobby',
    'LobbyMember',
    'MatchSession',
    'MatchSessionStep',
    'MatchSessionHistory',
    'MatchSessionStepHistory',
] as const;

export type PublicTableName = typeof PUBLIC_TABLES[number];

// Tables that support bulk upsert (derived from shared tableColumns)
export const UPSERT_TABLES = Object.keys(UPSERT_TABLE_COLUMNS) as UpsertTableName[];
