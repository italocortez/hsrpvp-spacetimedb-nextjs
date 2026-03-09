'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { USER_ROLE_VARIANTS } from '../../types/enums';
import styles from './UserManager.module.css';

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

    const saveEdit = useCallback(() => {
        if (!editState) return;
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
                <input
                    type="text"
                    className={styles.search_input}
                    placeholder="Search users by name, role, or Discord ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <span className={styles.row_count}>
                    {sortedUsers.length} user{sortedUsers.length !== 1 ? 's' : ''}
                </span>
            </div>

            {sortedUsers.length === 0 ? (
                <div className={styles.empty_state}>No users found</div>
            ) : (
                <div className={styles.table_wrapper}>
                    <table className={styles.data_table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Username</th>
                                <th>Display Name</th>
                                <th>Role</th>
                                <th>Guest</th>
                                <th>Discord ID</th>
                                <th>Last Login</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedUsers.map((user) => (
                                <tr key={user.id} style={user.deletedAt ? { opacity: 0.5, textDecoration: 'line-through' } : undefined}>
                                    <td>{user.id}</td>
                                    <td>
                                        {isEditing(user.id) ? (
                                            <input
                                                type="text"
                                                className={styles.inline_input}
                                                value={editState!.username}
                                                onChange={(e) => setEditState({ ...editState!, username: e.target.value })}
                                                maxLength={32}
                                            />
                                        ) : (
                                            user.username
                                        )}
                                    </td>
                                    <td>
                                        {isEditing(user.id) ? (
                                            <input
                                                type="text"
                                                className={styles.inline_input}
                                                value={editState!.displayName}
                                                onChange={(e) => setEditState({ ...editState!, displayName: e.target.value })}
                                                maxLength={32}
                                            />
                                        ) : (
                                            user.displayName
                                        )}
                                    </td>
                                    <td>
                                        {isEditing(user.id) ? (
                                            <select
                                                className={styles.inline_select}
                                                value={editState!.roleTag}
                                                onChange={(e) => setEditState({ ...editState!, roleTag: e.target.value })}
                                            >
                                                {USER_ROLE_VARIANTS.map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className={`${styles.role_badge} ${
                                                user.role.tag === 'Admin' ? styles.role_admin :
                                                user.role.tag === 'TournamentHost' ? styles.role_tournament_host :
                                                styles.role_user
                                            }`}>
                                                {user.role.tag}
                                            </span>
                                        )}
                                    </td>
                                    <td>{user.isGuest ? 'Yes' : 'No'}</td>
                                    <td>
                                        <span className={styles.cell_truncate} title={user.discordId || ''}>
                                            {user.discordId || '-'}
                                        </span>
                                    </td>
                                    <td>{formatTimestamp(user.lastLoginAt)}</td>
                                    <td>
                                        <div className={styles.action_cell}>
                                            {isEditing(user.id) ? (
                                                <>
                                                    <button className={styles.btn_save_inline} onClick={saveEdit}>
                                                        Save
                                                    </button>
                                                    <button className={styles.btn_cancel_inline} onClick={cancelEdit}>
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className={styles.btn_primary}
                                                    onClick={() => startEdit(user)}
                                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                                    disabled={!!user.deletedAt}
                                                    title={user.deletedAt ? 'Pending deletion' : 'Edit user'}
                                                >
                                                    {user.deletedAt ? 'Deleting...' : 'Edit'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
