"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useReducer } from 'spacetimedb/react';
import { reducers } from '@/src/module_bindings';
import styles from './ProfileCard.module.css';
import { User } from '@/components/features/auth/types';

interface ProfileCardProps {
    user: User;
    avatarImageUrl: string | null;
}

export default function ProfileCard({ user, avatarImageUrl }: ProfileCardProps) {
    const updateUsername = useReducer(reducers.updateUsername);
    const updateDisplayName = useReducer(reducers.updateDisplayName);
    const roleLabel = user.role.tag;

    const [username, setUsername] = useState(user.username);
    const [displayName, setDisplayName] = useState(user.displayName);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Sync local state when user prop updates (e.g. after a successful save)
    useEffect(() => {
        setUsername(user.username);
        setDisplayName(user.displayName);
    }, [user.username, user.displayName]);

    const usernameChanged = username.trim() !== user.username;
    const displayNameChanged = displayName.trim() !== user.displayName;
    const hasChanges = usernameChanged || displayNameChanged;

    const handleUsernameClick = () => {
        if (user.isGuest) {
            setMessage({ type: 'error', text: 'Guest users cannot change their username. Link your Discord account first.' });
        }
    };

    const handleSave = () => {
        setMessage(null);
        if (usernameChanged) {
            const trimmed = username.trim();
            if (!trimmed || trimmed.length > 32) {
                setMessage({ type: 'error', text: 'Username must be 1-32 characters.' });
                return;
            }
            updateUsername({ newUsername: trimmed }).catch((err: any) =>
                setMessage({ type: 'error', text: err?.message || 'Failed to update username.' })
            );
        }
        if (displayNameChanged) {
            const trimmed = displayName.trim();
            if (!trimmed || trimmed.length > 32) {
                setMessage({ type: 'error', text: 'Display name must be 1-32 characters.' });
                return;
            }
            updateDisplayName({ newDisplayName: trimmed }).catch((err: any) =>
                setMessage({ type: 'error', text: err?.message || 'Failed to update display name.' })
            );
        }
        setMessage({ type: 'success', text: 'Profile updated!' });
    };

    return (
        <div className={styles.card}>
            <div className={styles.avatar_wrapper}>
                {avatarImageUrl ? (
                    <Image
                        src={avatarImageUrl}
                        alt={user.avatarCharacterName}
                        width={120}
                        height={120}
                        className={styles.avatar_img}
                        unoptimized
                    />
                ) : (
                    <div className={styles.avatar_placeholder}>No image</div>
                )}
            </div>

            <div className={styles.info}>
                <div className={styles.field_group}>
                    <label className={styles.label}>
                        Username
                        {user.isGuest && (
                            <span className={styles.info_tooltip} title="Link your Discord account to change your username">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            </span>
                        )}
                    </label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        onClick={handleUsernameClick}
                        readOnly={user.isGuest}
                        maxLength={32}
                        className={user.isGuest ? styles.input_disabled : styles.input}
                        placeholder="Username"
                    />
                    {usernameChanged && (
                        <span className={styles.char_count}>{username.trim().length}/32</span>
                    )}
                </div>

                <div className={styles.field_group}>
                    <label className={styles.label}>Display Name</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        maxLength={32}
                        className={styles.input}
                        placeholder="Display name"
                    />
                    {displayNameChanged && (
                        <span className={styles.char_count}>{displayName.trim().length}/32</span>
                    )}
                </div>

                <div className={styles.field_row}>
                    <span className={styles.label}>Role</span>
                    <span className={styles.role_badge}>{roleLabel}</span>
                </div>

                <div className={styles.field_row}>
                    <span className={styles.label}>Status</span>
                    <span className={user.isGuest ? styles.guest : styles.verified}>
                        {user.isGuest ? 'Guest' : 'Verified'}
                    </span>
                </div>
            </div>

            {message && (
                <p className={`${styles.message} ${message.type === 'error' ? styles.error : styles.success}`}>
                    {message.text}
                </p>
            )}

            {hasChanges && (
                <button onClick={handleSave} className={styles.btn_save}>
                    Save Changes
                </button>
            )}
        </div>
    );
}
