'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { useAuthContext } from '@/components/features/auth/components/AuthProvider';
import { PUBLIC_TABLES, PublicTableName } from '../types';
import DeleteConfirmModal from '@/components/globals/modals/DeleteConfirmModal';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';

// Map display name → tables accessor
const TABLE_MAP: Record<PublicTableName, any> = {
    User: tables.User,
    UserIdentity: tables.UserIdentity,
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
    const { user: currentUser } = useAuthContext();
    const [selectedTable, setSelectedTable] = useState<PublicTableName>('User');
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<{ tableName: PublicTableName; pkJson: string; label: string } | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [rows] = useTable(TABLE_MAP[selectedTable]);
    const allRows = (rows || []) as any[];

    // Get column names from the first row
    const columns = useMemo(() => {
        if (allRows.length === 0) return [];
        return Object.keys(allRows[0]).filter(k => !k.startsWith('_'));
    }, [allRows]);

    // Build HeroUI column definitions (data columns + actions)
    const tableColumns = useMemo(() => [
        ...columns.map(col => ({ key: col, label: col })),
        { key: '_actions', label: 'Actions' },
    ], [columns]);

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
        // Prevent admin from deleting themselves
        if (selectedTable === 'User' && currentUser && row.id === currentUser.id) {
            setMessage({ type: 'error', text: 'You cannot delete your own account.' });
            return;
        }
        // Prevent admin from deleting other admins
        if (selectedTable === 'User' && row.role?.tag === 'Admin') {
            setMessage({ type: 'error', text: 'Cannot delete an Admin user.' });
            return;
        }
        const pkJson = getPrimaryKeyJson(selectedTable, row);
        // Build a human-readable label for the confirmation
        const label = columns.slice(0, 2).map(c => `${c}: ${formatCellValue(row[c])}`).join(', ');
        setDeleteConfirm({ tableName: selectedTable, pkJson, label });
    }, [selectedTable, columns, currentUser]);

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
            setMessage({ type: 'success', text: `Delete requested for ${deleteConfirm.tableName} row` });
        } catch (e: any) {
            setMessage({ type: 'error', text: `Delete failed: ${e.message || e}` });
        }
        setDeleteConfirm(null);
    }, [deleteConfirm, getConnection]);

    const renderCell = useCallback((row: any, columnKey: React.Key) => {
        if (columnKey === '_actions') {
            return (
                <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    isIconOnly
                    onPress={() => handleDelete(row)}
                    aria-label="Delete row"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </Button>
            );
        }
        const value = formatCellValue(row[columnKey as string]);
        return (
            <span className="block max-w-[200px] truncate" title={value}>
                {value}
            </span>
        );
    }, [handleDelete]);

    return (
        <div className="flex flex-col gap-4 p-4">
            {message && (
                <Chip
                    color={message.type === 'success' ? 'success' : 'danger'}
                    variant="flat"
                    onClose={() => setMessage(null)}
                    classNames={{ base: 'max-w-full' }}
                >
                    {message.text}
                </Chip>
            )}

            <div className="flex items-end gap-3 flex-wrap">
                <Select
                    placeholder="Select table"
                    aria-label="Table"
                    selectedKeys={new Set([selectedTable])}
                    onSelectionChange={(keys) => {
                        const val = [...keys][0] as PublicTableName;
                        if (val) {
                            setSelectedTable(val);
                            setSearchQuery('');
                            setMessage(null);
                        }
                    }}
                    className="w-[220px]"
                    size="sm"
                    variant="bordered"
                    classNames={{
                        value: 'text-default-100',
                        trigger: 'border-content3',
                    }}
                >
                    {PUBLIC_TABLES.map(t => (
                        <SelectItem key={t}>{t}</SelectItem>
                    ))}
                </Select>

                <Input
                    placeholder="Search rows..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    isClearable
                    onClear={() => setSearchQuery('')}
                    className="w-[300px]"
                    size="sm"
                    variant="bordered"
                    classNames={{
                        inputWrapper: 'border-content3',
                    }}
                />

                <span className="text-sm text-default-300">
                    {filteredRows.length}{searchQuery ? ` / ${allRows.length}` : ''} rows
                </span>
            </div>

            <Table
                aria-label={`${selectedTable} table`}
                isHeaderSticky
                removeWrapper
                classNames={{
                    base: 'max-h-[600px] overflow-auto rounded-xl border border-content3 bg-content1',
                    table: 'min-w-full',
                    thead: '[&>tr]:border-b [&>tr]:border-content3',
                    th: 'bg-transparent text-default-300 text-xs uppercase tracking-wider font-semibold py-3 px-4 first:rounded-tl-xl last:rounded-tr-xl',
                    td: 'py-3 px-4 text-default-100 text-sm',
                    tr: 'border-b border-content3 last:border-b-0 hover:bg-content2 transition-colors',
                }}
            >
                <TableHeader columns={tableColumns}>
                    {(col) => (
                        <TableColumn key={col.key} align={col.key === '_actions' ? 'center' : 'start'}>
                            {col.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody items={filteredRows} emptyContent={`No rows in ${selectedTable}`}>
                    {(row: any) => (
                        <TableRow key={getPrimaryKeyJson(selectedTable, row)}>
                            {(columnKey) => (
                                <TableCell>{renderCell(row, columnKey)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <DeleteConfirmModal
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                tableName={deleteConfirm?.tableName ?? ''}
                rowLabel={deleteConfirm?.label ?? ''}
            />
        </div>
    );
}
