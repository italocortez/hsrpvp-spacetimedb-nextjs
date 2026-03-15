'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { useLightconeCostTable, LightconeCostFilters, SortDescriptor } from '../hooks/useLightconeCostTable';
import { FilterButtonGroup } from '@/features/drafting/components/FilterButtonGroup';
import { iconMaps } from '@/features/hooks/useIconMaps';
import { PATH_VARIANTS, type PathTag } from '@/features/types/enums';
import { ClearIcon } from '@/components/icons';
import poolStyles from '@/features/drafting/components/CharacterPool.module.css';
import styles from './CharacterCostTable.module.css';

interface LightconeCostTableProps {
    draftMode: 'classic' | 'auction';
}

const COLUMNS = [
    { key: 'displayName', label: 'Lightcone', sortable: true },
    { key: 'rarity', label: 'Rarity', sortable: true },
    { key: 's1', label: 'S1', sortable: true },
    { key: 's2', label: 'S2', sortable: true },
    { key: 's3', label: 'S3', sortable: true },
    { key: 's4', label: 'S4', sortable: true },
    { key: 's5', label: 'S5', sortable: true },
];

const RARITY_COLORS: Record<number, string> = {
    5: '#e5a63b',
    4: '#b066e0',
    3: '#5599cc',
};

function toggleInArray<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

export default function LightconeCostTable({ draftMode }: LightconeCostTableProps) {
    const [selectedPaths, setSelectedPaths] = useState<PathTag[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: 'displayName',
        direction: 'ascending',
    });

    const filters: LightconeCostFilters = useMemo(() => ({
        paths: selectedPaths,
        search: searchTerm,
    }), [selectedPaths, searchTerm]);

    const rows = useLightconeCostTable(draftMode, filters, sortDescriptor);

    const togglePath = useCallback((path: PathTag) => {
        setSelectedPaths(prev => toggleInArray(prev, path));
    }, []);

    const clearAll = useCallback(() => {
        setSelectedPaths([]);
        setSearchTerm('');
    }, []);

    const hasActiveFilters = selectedPaths.length > 0 || searchTerm.trim().length > 0;

    const renderRarityBadge = (rarity: number) => {
        const bg = RARITY_COLORS[rarity] || '#666';
        return (
            <span className={styles.rarityBadge} style={{ backgroundColor: bg }}>
                {rarity}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Filter bar — paths + search + clear */}
            <div className={poolStyles.filters}>
                <FilterButtonGroup
                    className={poolStyles.paths}
                    items={PATH_VARIANTS}
                    selected={selectedPaths}
                    onToggle={togglePath}
                    iconMap={iconMaps.paths}
                    renderMode="icon-only"
                    iconSize="1.5rem"
                />

                <input
                    type="text"
                    placeholder="Search lightcones..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={poolStyles.searchBar}
                    name="lc-search-bar"
                />

                <button
                    className={poolStyles.clearButton}
                    onClick={clearAll}
                    disabled={!hasActiveFilters}
                    title="Clear all filters"
                >
                    <ClearIcon />
                    <span>Clear</span>
                </button>
            </div>

            <Table
                aria-label="Lightcone costs"
                isHeaderSticky
                removeWrapper
                sortDescriptor={sortDescriptor}
                onSortChange={(desc) => setSortDescriptor({
                    column: String(desc.column),
                    direction: desc.direction as 'ascending' | 'descending',
                })}
                classNames={{
                    base: `max-h-[75vh] overflow-auto rounded-xl border border-content3 bg-content1 ${styles.tableWrapper}`,
                    table: 'min-w-full',
                    thead: '[&>tr]:border-b [&>tr]:border-content3',
                    th: 'bg-content1 text-primary text-xs uppercase tracking-wider font-semibold py-3 px-4 first:rounded-tl-xl last:rounded-tr-xl text-center first:text-start relative',
                    sortIcon: 'absolute right-0.5 top-1/2 -translate-y-1/2',
                    td: 'py-3 px-4 text-default-100 text-sm text-center first:text-start',
                    tr: 'border-b border-content3 last:border-b-0 hover:bg-content2 transition-colors',
                }}
            >
                <TableHeader columns={COLUMNS}>
                    {(col) => (
                        <TableColumn
                            key={col.key}
                            allowsSorting={col.sortable}
                        >
                            {col.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={rows.map(r => ({ ...r, key: r.name }))} emptyContent="No lightcones found">
                    {(row) => (
                        <TableRow key={row.key}>
                            <TableCell><span>{row.displayName}</span></TableCell>
                            <TableCell>{renderRarityBadge(row.rarity)}</TableCell>
                            <TableCell>{row.s1}</TableCell>
                            <TableCell>{row.s2}</TableCell>
                            <TableCell>{row.s3}</TableCell>
                            <TableCell>{row.s4}</TableCell>
                            <TableCell>{row.s5}</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
