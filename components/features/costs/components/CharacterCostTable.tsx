'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { useCharacterCostTable, CharacterCostRow, CostTableFilters, SortDescriptor } from '../hooks/useCharacterCostTable';
import { CharacterFilterBar } from '@/components/features/drafting/components/CharacterFilterBar';
import type { CharacterFilterState, CharacterFilterActions } from '@/components/features/hooks/useCharacterFilters';
import type { Role as RoleTag, Element as ElementTag, Path as PathTag } from '@/components/features/types/enums';
import styles from './CharacterCostTable.module.css';

interface CharacterCostTableProps {
    gameMode: string;
    draftMode: 'classic' | 'auction';
}

const COLUMNS = [
    { key: 'displayName', label: 'Character', sortable: true },
    { key: 'rarity', label: 'Rarity', sortable: true },
    { key: 'e0', label: 'E0', sortable: true },
    { key: 'e1', label: 'E1', sortable: true },
    { key: 'e2', label: 'E2', sortable: true },
    { key: 'e3', label: 'E3', sortable: true },
    { key: 'e4', label: 'E4', sortable: true },
    { key: 'e5', label: 'E5', sortable: true },
    { key: 'e6', label: 'E6', sortable: true },
];

const RARITY_COLORS: Record<number, string> = {
    5: '#e5a63b',
    4: '#b066e0',
    3: '#5599cc',
};

function toggleInArray<T>(arr: T[], value: T): T[] {
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

export default function CharacterCostTable({ gameMode, draftMode }: CharacterCostTableProps) {
    // Local filter state — arrays to match CharacterFilterState
    const [selectedRoles, setSelectedRoles] = useState<RoleTag[]>([]);
    const [selectedElements, setSelectedElements] = useState<ElementTag[]>([]);
    const [selectedPaths, setSelectedPaths] = useState<PathTag[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Sort state
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: 'displayName',
        direction: 'ascending',
    });

    // Expanded synergy rows
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const filters: CostTableFilters = useMemo(() => ({
        roles: selectedRoles,
        elements: selectedElements,
        paths: selectedPaths,
        search: searchTerm,
    }), [selectedRoles, selectedElements, selectedPaths, searchTerm]);

    const rows = useCharacterCostTable(gameMode, draftMode, filters, sortDescriptor);

    // Build CharacterFilterBar-compatible props
    const toggleRole = useCallback((role: RoleTag) => {
        setSelectedRoles(prev => toggleInArray(prev, role));
    }, []);
    const toggleElement = useCallback((element: ElementTag) => {
        setSelectedElements(prev => toggleInArray(prev, element));
    }, []);
    const togglePath = useCallback((path: PathTag) => {
        setSelectedPaths(prev => toggleInArray(prev, path));
    }, []);
    const clearAll = useCallback(() => {
        setSelectedRoles([]);
        setSelectedElements([]);
        setSelectedPaths([]);
        setSearchTerm('');
    }, []);

    const hasActiveFilters = selectedRoles.length > 0 || selectedElements.length > 0
        || selectedPaths.length > 0 || searchTerm.trim().length > 0;

    const filterState: CharacterFilterState = {
        selectedRoles, selectedPaths, selectedElements, searchTerm,
    };
    const filterActions: CharacterFilterActions = {
        toggleRole, togglePath, toggleElement, setSearchTerm, clearAll, hasActiveFilters,
    };

    const toggleExpand = useCallback((name: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    }, []);

    // Build flat list of renderable rows (main + synergy sub-rows)
    const renderRows = useMemo(() => {
        const result: Array<{
            type: 'character' | 'synergy-header' | 'synergy-data';
            key: string;
            data: CharacterCostRow;
            targetDisplayName?: string;
            costModifier?: number;
        }> = [];

        for (const row of rows) {
            result.push({ type: 'character', key: `char-${row.name}`, data: row });

            const isExpanded = expandedRows.has(row.name);
            if (isExpanded && row.synergies.length > 0 && draftMode === 'classic') {
                result.push({
                    type: 'synergy-header',
                    key: `syn-header-${row.name}`,
                    data: row,
                });
                for (const syn of row.synergies) {
                    result.push({
                        type: 'synergy-data',
                        key: `syn-${row.name}-${syn.targetName}`,
                        data: row,
                        targetDisplayName: syn.targetDisplayName,
                        costModifier: syn.costModifier,
                    });
                }
            }
        }

        return result;
    }, [rows, expandedRows, draftMode]);

    const renderRarityBadge = (rarity: number) => {
        const bg = RARITY_COLORS[rarity] || '#666';
        return (
            <span
                className={styles.rarityBadge}
                style={{ backgroundColor: bg }}
            >
                {rarity}
            </span>
        );
    };

    return (
        <div className="flex flex-col gap-3">
            <CharacterFilterBar filterState={filterState} actions={filterActions} />

            <Table
                aria-label="Character costs"
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
                <TableBody items={renderRows} emptyContent="No characters found">
                    {(item) => {
                        if (item.type === 'character') {
                            const row = item.data;
                            const hasSynergies = row.synergies.length > 0 && draftMode === 'classic';
                            const isExpanded = expandedRows.has(row.name);

                            return (
                                <TableRow key={item.key} className={styles.characterRow}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {hasSynergies && (
                                                <button
                                                    onClick={() => toggleExpand(row.name)}
                                                    className={styles.expandButton}
                                                    aria-label={isExpanded ? 'Collapse synergies' : 'Expand synergies'}
                                                >
                                                    {isExpanded ? '▾' : '▸'}
                                                </button>
                                            )}
                                            <span>{row.displayName}</span>
                                            {hasSynergies && (
                                                <span className={styles.synergyBadge}>
                                                    {row.synergies.length} {row.synergies.length === 1 ? 'synergy' : 'synergies'}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{renderRarityBadge(row.rarity)}</TableCell>
                                    <TableCell>{row.e0}</TableCell>
                                    <TableCell>{row.e1}</TableCell>
                                    <TableCell>{row.e2}</TableCell>
                                    <TableCell>{row.e3}</TableCell>
                                    <TableCell>{row.e4}</TableCell>
                                    <TableCell>{row.e5}</TableCell>
                                    <TableCell>{row.e6}</TableCell>
                                </TableRow>
                            );
                        }

                        if (item.type === 'synergy-header') {
                            return (
                                <TableRow key={item.key} className={styles.synergyHeaderRow}>
                                    <TableCell><span className={styles.synergyLabel}>Paired Unit</span></TableCell>
                                    <TableCell><span className={styles.synergyLabel}>Extra<br />Cost</span></TableCell>
                                    <TableCell>{''}</TableCell>
                                    <TableCell>{''}</TableCell>
                                    <TableCell>{''}</TableCell>
                                    <TableCell>{''}</TableCell>
                                    <TableCell>{''}</TableCell>
                                    <TableCell>{''}</TableCell>
                                    <TableCell>{''}</TableCell>
                                </TableRow>
                            );
                        }

                        // synergy-data
                        return (
                            <TableRow key={item.key} className={styles.synergyDataRow}>
                                <TableCell><span className={styles.synergyTarget}>{item.targetDisplayName}</span></TableCell>
                                <TableCell><span className={styles.synergyCost}>{item.costModifier}</span></TableCell>
                                <TableCell>{''}</TableCell>
                                <TableCell>{''}</TableCell>
                                <TableCell>{''}</TableCell>
                                <TableCell>{''}</TableCell>
                                <TableCell>{''}</TableCell>
                                <TableCell>{''}</TableCell>
                                <TableCell>{''}</TableCell>
                            </TableRow>
                        );
                    }}
                </TableBody>
            </Table>
        </div>
    );
}
