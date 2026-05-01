'use client';

import { useState, useCallback } from 'react';
import { useLightconeCostTable, LightconeCostRow, SortDescriptor } from '../../hooks/useLightconeCostTable';
import { LightconeFilterBar } from '@/components/features/drafting/components/LightconeFilterBar';
import { useLightconeFilters } from '@/components/features/hooks/useLightconeFilters';
import { DraftMode } from '@/components/features/types/enums';
import { useGameData } from '@/components/features/game-data/components/GameDataProvider';
import styles from './LightconeCostTable.module.css';
import { SortIcon } from '@/components/globals/icons';

interface LightconeCostTableProps {
    draftMode: DraftMode;
}

type Column = { key: keyof LightconeCostRow; label: string };
const COLUMNS: Column[] = [
    { key: 'displayName', label: 'Lightcone' },
    { key: 'rarity',      label: 'Rarity'    },
    { key: 's1',          label: 'S1'        },
    { key: 's2',          label: 'S2'        },
    { key: 's3',          label: 'S3'        },
    { key: 's4',          label: 'S4'        },
    { key: 's5',          label: 'S5'        },
];

export default function LightconeCostTable({ draftMode }: LightconeCostTableProps) {
    const { lightconesData } = useGameData();
    const filters = useLightconeFilters(lightconesData);

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: 'displayName',
        direction: 'ascending',
    });

    const rows = useLightconeCostTable(draftMode, sortDescriptor, filters.filteredLightcones);

    const handleColumnSort = useCallback((column: keyof LightconeCostRow) => {
        setSortDescriptor(prev => {
            if (prev.column === column) {
                return { column, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
            }
            
            // Default to descending, except for names' column
            return { column, direction: column === 'displayName' ? 'ascending' : 'descending' };
        });
    }, []);

    return (
        <div className="flex flex-col gap-3 Box" style={{ padding: '1rem', gap: '2rem' }}>
            <div className={styles.filterSection}>
                <LightconeFilterBar filterState={filters.filterState} actions={filters} />
            </div>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles.theadRow}>
                            {COLUMNS.map((col, i) => {
                                const isActive = sortDescriptor.column === col.key;
                                return (
                                    <th
                                        key={col.key}
                                        className={`${styles.th} ${i === 0 ? styles.thFirst : ''} ${isActive ? styles.thActive : ''}`}
                                        onClick={() => handleColumnSort(col.key)}
                                        title={`Sort by ${col.label}`}
                                    >
                                        <div className={`flex items-center gap-1 ${i === 0 ? 'justify-start' : 'justify-center'}`}>
                                            <span className={isActive ? styles.thLabelActive : ''}>{col.label}</span>
                                            <SortIcon direction={sortDescriptor.direction} isActive={isActive} />
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={COLUMNS.length} className={styles.emptyCell}>
                                    {filters.hasActiveFilters ? <>
                                        No lightcones found matching your filters.
                                    </> : <>
                                        Loading lightcones...
                                    </>}
                                </td>
                            </tr>
                        )}
                        {rows.map(row => (
                            <tr key={row.name} className={styles.tr}>
                                <td className={`${styles.td} ${styles.tdFirst}`}>{row.displayName}</td>
                                
                                <td className={styles.td}>
                                    <div className={styles.rarityBadge} style={{ backgroundColor: `var(--lc-${row.rarity}star)` }}>
                                        <span style={{ fontSize: `0.875rem`, filter: `drop-shadow(black 0px 1px 2px)` }}>{row.rarity}</span>
                                    </div>
                                </td>
                                
                                <td className={styles.td}>{row.s1}</td>
                                <td className={styles.td}>{row.s2}</td>
                                <td className={styles.td}>{row.s3}</td>
                                <td className={styles.td}>{row.s4}</td>
                                <td className={styles.td}>{row.s5}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
