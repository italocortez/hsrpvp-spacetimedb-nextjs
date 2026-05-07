import { UPSERT_TABLE_COLUMNS, UpsertTableName, PUBLIC_TABLES, PublicTableName } from '../types/tableColumns';

export type { UpsertTableName, PublicTableName };
export { PUBLIC_TABLES };

export type AdminTab = 'tables' | 'bulk-upsert' | 'users';

export const ADMIN_TABS: { key: AdminTab; label: string }[] = [
    { key: 'tables', label: 'Table Explorer' },
    { key: 'bulk-upsert', label: 'Bulk Upsert' },
    { key: 'users', label: 'User Manager' },
];

// Tables that support bulk upsert (derived from shared tableColumns)
export const UPSERT_TABLES = Object.keys(UPSERT_TABLE_COLUMNS) as UpsertTableName[];
