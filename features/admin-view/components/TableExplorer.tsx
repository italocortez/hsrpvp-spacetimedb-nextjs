'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { PUBLIC_TABLES, PublicTableName } from '../types';
import styles from './TableExplorer.module.css';

// Map display name → tables accessor
const TABLE_MAP: Record<PublicTableName, any> = {
    User: tables.User,
    UserIdentity: (tables as any).UserIdentity,
    HsrCharacter: tables.HsrCharacter,
    HsrLightcone: tables.HsrLightcone,
    HsrCharacterCost: tables.HsrCharacterCost,
    HsrLightconeCost: tables.HsrLightconeCost,
    HsrSynergyCost: tables.HsrSynergyCost,
    Lobby: tables.Lobby,
    LobbyMember: tables.LobbyMember,
    MatchSession: tables.MatchSession,
    MatchSessionStep: tables.MatchSessionStep,
    MatchSessionHistory: tables.MatchSessionHistory,
    MatchSessionStepHistory: tables.MatchSessionStepHistory,
};

// Primary key info for building delete payloads
function getPrimaryKeyJson(tableName: PublicTableName, row: any): string {
    switch (tableName) {
        case 'User': return String(row.id);
        case 'UserIdentity': return row.identity.toHexString();
        case 'HsrCharacter': return row.name;
        case 'HsrLightcone': return row.name;
        case 'HsrCharacterCost':
            return JSON.stringify({ characterName: row.characterName, gameModeTag: row.gameMode.tag });
        case 'HsrLightconeCost': return row.lightconeName;
        case 'HsrSynergyCost': return String(row.id);
        case 'Lobby': return String(row.id);
        case 'LobbyMember':
            return JSON.stringify({ lobbyId: row.lobbyId, userId: row.userId });
        case 'MatchSession': return String(row.lobbyId);
        case 'MatchSessionStep': return String(row.id);
        case 'MatchSessionHistory': return row.id;
        case 'MatchSessionStepHistory': return row.matchId;
    }
}

function formatCellValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'bigint') return value.toString();
    if (typeof value === 'object') {
        // Identity
        if (typeof value.toHexString === 'function') return value.toHexString().slice(0, 16) + '...';
        // Timestamp
        if (value.microsSinceUnixEpoch !== undefined) {
            return new Date(Number(value.microsSinceUnixEpoch / 1000n)).toLocaleString();
        }
        // Enum / tagged union
        if (value.tag !== undefined) return value.tag;
        // Arrays
        if (Array.isArray(value)) return `[${value.length} items]`;
        // Generic objects — compact JSON
        try {
            return JSON.stringify(value, (_, v) => typeof v === 'bigint' ? v.toString() : v);
        } catch {
            return String(value);
        }
    }
    return String(value);
}

export default function TableExplorer() {
    const { getConnection } = useSpacetimeDB();
    const [selectedTable, setSelectedTable] = useState<PublicTableName>('User');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ tableName: PublicTableName; pkJson: string; label: string } | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Subscribe to the selected table — useTable returns [rows, isReady]
    const [rows, isReady] = useTable(TABLE_MAP[selectedTable]);
    const isLoading = !isReady;
    const allRows = (rows || []) as any[];

    // Get column names from the first row
    const columns = useMemo(() => {
        if (allRows.length === 0) return [];
        return Object.keys(allRows[0]).filter(k => !k.startsWith('_'));
    }, [allRows]);

    // Filter rows by search query
    const filteredRows = useMemo(() => {
        if (!searchQuery.trim()) return allRows;
        const q = searchQuery.toLowerCase();
        return allRows.filter(row =>
            columns.some(col => {
                const val = formatCellValue(row[col]);
                return val.toLowerCase().includes(q);
            })
        );
    }, [allRows, searchQuery, columns]);

    const handleDelete = useCallback((row: any) => {
        const pkJson = getPrimaryKeyJson(selectedTable, row);
        // Build a human-readable label for the confirmation
        const label = columns.slice(0, 2).map(c => `${c}: ${formatCellValue(row[c])}`).join(', ');
        setDeleteConfirm({ tableName: selectedTable, pkJson, label });
    }, [selectedTable, columns]);

    const confirmDelete = useCallback(() => {
        if (!deleteConfirm) return;
        const conn = getConnection();
        if (!conn) {
            setMessage({ type: 'error', text: 'Not connected to SpacetimeDB' });
            return;
        }
        try {
            (conn.reducers as any).adminDeleteRow({
                tableName: deleteConfirm.tableName,
                primaryKeyJson: deleteConfirm.pkJson,
            });
            setMessage({ type: 'success', text: `Row deleted from ${deleteConfirm.tableName}` });
        } catch (e: any) {
            setMessage({ type: 'error', text: `Delete failed: ${e.message || e}` });
        }
        setDeleteConfirm(null);
    }, [deleteConfirm, getConnection]);

    return (
        <div className={styles.panel}>
            {message && (
                <div className={`${styles.message} ${message.type === 'success' ? styles.message_success : styles.message_error}`}>
                    {message.text}
                    <button
                        onClick={() => setMessage(null)}
                        style={{ float: 'right', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                    >
                        x
                    </button>
                </div>
            )}

            <div className={styles.explorer_controls}>
                <select
                    className={styles.select}
                    value={selectedTable}
                    onChange={(e) => {
                        setSelectedTable(e.target.value as PublicTableName);
                        setSearchQuery('');
                        setMessage(null);
                    }}
                >
                    {PUBLIC_TABLES.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                <input
                    type="text"
                    className={styles.search_input}
                    placeholder="Search rows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <span className={styles.row_count}>
                    {filteredRows.length}{searchQuery ? ` / ${allRows.length}` : ''} rows
                </span>
            </div>

            {isLoading ? (
                <div className={styles.loading}>Loading table data...</div>
            ) : allRows.length === 0 ? (
                <div className={styles.empty_state}>No rows in {selectedTable}</div>
            ) : (
                <div className={styles.table_wrapper}>
                    <table className={styles.data_table}>
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col}>{col}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row, i) => (
                                <tr key={i}>
                                    {columns.map(col => (
                                        <td key={col}>
                                            <span className={styles.cell_truncate} title={formatCellValue(row[col])}>
                                                {formatCellValue(row[col])}
                                            </span>
                                        </td>
                                    ))}
                                    <td>
                                        <button
                                            className={styles.btn_delete}
                                            onClick={() => handleDelete(row)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className={styles.confirm_overlay} onClick={() => setDeleteConfirm(null)}>
                    <div className={styles.confirm_dialog} onClick={e => e.stopPropagation()}>
                        <h3>Confirm Delete</h3>
                        <p>
                            Delete row from <strong>{deleteConfirm.tableName}</strong>?
                            <br />
                            <span style={{ fontSize: '0.8rem', color: 'rgb(107, 114, 128)' }}>
                                {deleteConfirm.label}
                            </span>
                        </p>
                        <div className={styles.confirm_actions}>
                            <button className={styles.btn_cancel_inline} onClick={() => setDeleteConfirm(null)}>
                                Cancel
                            </button>
                            <button className={styles.btn_delete} onClick={confirmDelete}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
