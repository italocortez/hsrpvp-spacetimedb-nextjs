'use client';

import { Fragment, useState, useCallback } from 'react';
import { useCharacterCostTable, CharacterCostRow, SortDescriptor } from '../../hooks/useCharacterCostTable';
import { CharacterFilterBar } from '@/components/features/drafting/components/filter-bar-character/CharacterFilterBar';
import { useCharacterFilters } from '@/components/features/hooks/useCharacterFilters';
import type { RuleSet, DraftMode } from '@/components/features/types/enums';
import styles from './CharacterCostTable.module.css';
import { useGameData } from '../../../game-data/components/GameDataProvider';
import { SortIcon, ExpanderIcon } from '@/components/globals/icons';

interface CharacterCostTableProps {
    gameMode: RuleSet;
    draftMode: DraftMode;
}

type Column = { key: keyof CharacterCostRow; label: string };
const COLUMNS: Column[] = [
    { key: 'displayName', label: 'Character' },
    { key: 'rarity',      label: 'Rarity'    },
    { key: 'e0',          label: 'E0'        },
    { key: 'e1',          label: 'E1'        },
    { key: 'e2',          label: 'E2'        },
    { key: 'e3',          label: 'E3'        },
    { key: 'e4',          label: 'E4'        },
    { key: 'e5',          label: 'E5'        },
    { key: 'e6',          label: 'E6'        },
];

export default function CharacterCostTable({ gameMode, draftMode }: CharacterCostTableProps) {
    const { charactersData, synergiesData } = useGameData();
    const filters = useCharacterFilters(charactersData);

    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: 'displayName',
        direction: 'ascending',
    });
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

    const rows = useCharacterCostTable(gameMode, draftMode, filters, sortDescriptor, charactersData, synergiesData);

    const toggleExpand = useCallback((name: string) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name); else next.add(name);
            return next;
        });
    }, []);

    const handleColumnSort = useCallback((column: keyof CharacterCostRow) => {
        setSortDescriptor(prev => {
            if (prev.column === column) {
                return { column, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
            }

            // Default to descending, except for names' column
            return { column, direction: column === 'displayName' ? 'ascending' : 'descending' };
        });
    }, []);

    return (
        <div className="flex flex-col gap-3 Box" style={{ padding: `1rem`, gap: `2rem` }}>
            <div className={styles.filterSection}>
                <CharacterFilterBar filterState={filters.filterState} actions={filters} />
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
                                        No characters found matching your filters.
                                    </> : <>
                                        Loading characters...
                                    </>}
                                </td>
                            </tr>
                        )}

                        {rows.map(row => {
                            const hasSynergies = row.synergies.length > 0 && draftMode === 'Classic';
                            const isExpanded = expandedRows.has(row.name);

                            return (
                                <Fragment key={row.name}>
                                    <tr className={styles.tr}>
                                        
                                        {/* Name + synergies */}
                                        <td className={`${styles.td} ${styles.tdFirst}`}>
                                            <div className="flex items-center gap-2">
                                                {hasSynergies && (
                                                    <button
                                                        onClick={() => toggleExpand(row.name)}
                                                        className={styles.expandButton}
                                                        aria-label={isExpanded ? 'Collapse synergies' : 'Expand synergies'}
                                                    >
                                                        <ExpanderIcon isExpanded={isExpanded} />
                                                    </button>
                                                )}
                                                
                                                <span>{row.displayName}</span>
                                                
                                                {hasSynergies && (
                                                    <span className={styles.synergyBadge}>
                                                        {row.synergies.length} {row.synergies.length === 1 ? 'synergy' : 'synergies'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        
                                        {/* Rarity */}
                                        <td className={styles.td}>
                                            <div className={styles.rarityBadge} style={{ backgroundColor: `var(--lc-${row.rarity}star)` }}>
                                                <span style={{ fontSize: `0.875rem`, filter: `drop-shadow(black 0px 1px 2px)` }}>{row.rarity}</span>
                                            </div>
                                        </td>
                                        
                                        {/* Costs */}
                                        <td className={styles.td}>{row.e0}</td>
                                        <td className={styles.td}>{row.e1}</td>
                                        <td className={styles.td}>{row.e2}</td>
                                        <td className={styles.td}>{row.e3}</td>
                                        <td className={styles.td}>{row.e4}</td>
                                        <td className={styles.td}>{row.e5}</td>
                                        <td className={styles.td}>{row.e6}</td>
                                    </tr>
                                    
                                    {/* Synergies */}
                                    {isExpanded && hasSynergies && (
                                        <>
                                            <tr className={styles.synergyHeaderRow}>
                                                <td className={`${styles.td} ${styles.tdFirst}`}>
                                                    <span className={styles.synergyLabel}>Paired Unit</span>
                                                </td>
                                                <td className={styles.td}>
                                                    <span className={styles.synergyLabel}>Extra Cost</span>
                                                </td>
                                                <td colSpan={7} />
                                            </tr>
                                            {row.synergies.map(syn => (
                                                <tr key={syn.targetName} className={styles.synergyDataRow}>
                                                    <td className={`${styles.td} ${styles.tdFirst}`}>
                                                        <span className={styles.synergyTarget}>{syn.targetDisplayName}</span>
                                                    </td>
                                                    <td className={styles.td}>
                                                        <span className={styles.synergyCost}>{syn.costModifier}</span>
                                                    </td>
                                                    <td colSpan={7} />
                                                </tr>
                                            ))}
                                        </>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
