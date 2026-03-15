'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { USER_ROLE_VARIANTS } from '../../types/enums';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/table';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';

interface EditState {
    userId: number;
    username: string;
    displayName: string;
    roleTag: string;
}

function formatTimestamp(ts: any): string {
    if (!ts) return '';
    try {
        return new Date(Number(ts.microsSinceUnixEpoch / 1000n)).toLocaleString();
    } catch {
        return String(ts);
    }
}

const ROLE_COLOR_MAP: Record<string, 'danger' | 'warning' | 'default'> = {
    Admin: 'danger',
    TournamentHost: 'warning',
    User: 'default',
};

export default function UserManager() {
    const { getConnection } = useSpacetimeDB();
    const [userRows] = useTable(tables.User);
    const allUsers = (userRows || []) as any[];

    const [searchQuery, setSearchQuery] = useState('');
    const [editState, setEditState] = useState<EditState | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const sortedUsers = useMemo(() => {
        const users = [...allUsers].sort((a, b) => a.id - b.id);
        if (!searchQuery.trim()) return users;
        const q = searchQuery.toLowerCase();
        return users.filter(u =>
            u.username.toLowerCase().includes(q) ||
            u.displayName.toLowerCase().includes(q) ||
            u.role.tag.toLowerCase().includes(q) ||
            (u.discordId && u.discordId.toLowerCase().includes(q))
        );
    }, [allUsers, searchQuery]);

    const startEdit = useCallback((user: any) => {
        setEditState({
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            roleTag: user.role.tag,
        });
    }, []);

    const cancelEdit = useCallback(() => {
        setEditState(null);
    }, []);

    // Check if the user being edited is originally an Admin
    const editingUserOriginalRole = useMemo(() => {
        if (!editState) return null;
        const user = allUsers.find(u => u.id === editState.userId);
        return user?.role?.tag ?? null;
    }, [editState, allUsers]);

    const saveEdit = useCallback(() => {
        if (!editState) return;
        // Prevent demoting an Admin
        if (editingUserOriginalRole === 'Admin' && editState.roleTag !== 'Admin') {
            setMessage({ type: 'error', text: 'Cannot demote an Admin user.' });
            return;
        }
        const conn = getConnection();
        if (!conn) {
            setMessage({ type: 'error', text: 'Not connected to SpacetimeDB' });
            return;
        }

        try {
            (conn.reducers as any).adminUpdateUser({
                userId: editState.userId,
                displayName: editState.displayName.trim(),
                username: editState.username.trim(),
                roleTag: editState.roleTag,
            });
            setMessage({ type: 'success', text: `User #${editState.userId} updated` });
            setEditState(null);
        } catch (e: any) {
            setMessage({ type: 'error', text: `Update failed: ${e.message || e}` });
        }
    }, [editState, getConnection]);

    const isEditing = (userId: number) => editState?.userId === userId;

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

            <div className="flex items-end gap-3">
                <Input
                    placeholder="Search users by name, role, or Discord ID..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    isClearable
                    onClear={() => setSearchQuery('')}
                    className="w-[400px]"
                    size="sm"
                    variant="bordered"
                    classNames={{
                        inputWrapper: 'border-content3',
                    }}
                />
                <span className="text-sm text-default-300">
                    {sortedUsers.length} user{sortedUsers.length !== 1 ? 's' : ''}
                </span>
            </div>

            <Table
                aria-label="User manager table"
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
                <TableHeader>
                    <TableColumn>ID</TableColumn>
                    <TableColumn>Username</TableColumn>
                    <TableColumn>Display Name</TableColumn>
                    <TableColumn>Role</TableColumn>
                    <TableColumn>Guest</TableColumn>
                    <TableColumn>Discord ID</TableColumn>
                    <TableColumn>Last Login</TableColumn>
                    <TableColumn align="center">Actions</TableColumn>
                </TableHeader>
                <TableBody emptyContent="No users found">
                    {sortedUsers.map((user) => (
                        <TableRow
                            key={user.id}
                            className={user.deletedAt ? 'opacity-50 line-through' : ''}
                        >
                            <TableCell>{user.id}</TableCell>
                            <TableCell>
                                {isEditing(user.id) ? (
                                    <Input
                                        size="sm"
                                        variant="bordered"
                                        value={editState!.username}
                                        onValueChange={(v) => setEditState({ ...editState!, username: v })}
                                        maxLength={32}
                                        className="max-w-[160px]"
                                        classNames={{ inputWrapper: 'border-content3' }}
                                    />
                                ) : (
                                    user.username
                                )}
                            </TableCell>
                            <TableCell>
                                {isEditing(user.id) ? (
                                    <Input
                                        size="sm"
                                        variant="bordered"
                                        value={editState!.displayName}
                                        onValueChange={(v) => setEditState({ ...editState!, displayName: v })}
                                        maxLength={32}
                                        className="max-w-[160px]"
                                        classNames={{ inputWrapper: 'border-content3' }}
                                    />
                                ) : (
                                    user.displayName
                                )}
                            </TableCell>
                            <TableCell>
                                {isEditing(user.id) ? (
                                    <Select
                                        size="sm"
                                        variant="bordered"
                                        selectedKeys={new Set([editState!.roleTag])}
                                        onSelectionChange={(keys) => {
                                            const val = [...keys][0] as string;
                                            if (val) setEditState({ ...editState!, roleTag: val });
                                        }}
                                        className="max-w-[160px]"
                                        aria-label="Role"
                                        isDisabled={editingUserOriginalRole === 'Admin'}
                                        classNames={{ trigger: 'border-content3', value: 'text-default-100' }}
                                    >
                                        {USER_ROLE_VARIANTS.map(r => (
                                            <SelectItem key={r}>{r}</SelectItem>
                                        ))}
                                    </Select>
                                ) : (
                                    <Chip size="sm" color={ROLE_COLOR_MAP[user.role.tag] ?? 'default'} variant="flat">
                                        {user.role.tag}
                                    </Chip>
                                )}
                            </TableCell>
                            <TableCell>{user.isGuest ? 'Yes' : 'No'}</TableCell>
                            <TableCell>
                                <span className="block max-w-[120px] truncate" title={user.discordId || ''}>
                                    {user.discordId || '-'}
                                </span>
                            </TableCell>
                            <TableCell>{formatTimestamp(user.lastLoginAt)}</TableCell>
                            <TableCell>
                                <div className="flex justify-center gap-1">
                                {isEditing(user.id) ? (
                                    <>
                                        <Button isIconOnly size="sm" color="success" variant="flat" onPress={saveEdit}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                        </Button>
                                        <Button isIconOnly size="sm" variant="flat" onPress={cancelEdit}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        color="primary"
                                        variant="flat"
                                        onPress={() => startEdit(user)}
                                        isDisabled={!!user.deletedAt}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                                    </Button>
                                )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
