"use client";

import React, { useState } from 'react';
import ProfileCard from '@/features/profile/components/ProfileCard';
import DiscordLink from '@/features/profile/components/DiscordLink';
import { useProfile } from '@/features/profile/hooks/useProfile';
import styles from './page.module.css';

function ProfileContent() {
    const { user, avatarImageUrl, isProfileReady, logout, deleteGuestAccount } = useProfile();
    const [showGuestWarning, setShowGuestWarning] = useState(false);

    if (!isProfileReady || !user) {
        return <p className={styles.loading}>Loading profile...</p>;
    }

    const handleLogout = () => {
        if (user.isGuest) {
            setShowGuestWarning(true);
        } else {
            logout();
        }
    };

    return (
        <div className={styles.grid}>
            <ProfileCard user={user} avatarImageUrl={avatarImageUrl} />
            <DiscordLink user={user} />

            {showGuestWarning && (
                <div className={styles.warning_card}>
                    <p className={styles.warning_title}>Delete guest account?</p>
                    <p className={styles.warning_text}>
                        Guest accounts cannot be recovered after logout. All your data
                        will be permanently lost. To keep your account, link your Discord first.
                    </p>
                    <div className={styles.warning_actions}>
                        <button
                            onClick={() => setShowGuestWarning(false)}
                            className={styles.btn_cancel}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={deleteGuestAccount}
                            className={styles.btn_delete}
                        >
                            Delete & Log Out
                        </button>
                    </div>
                </div>
            )}

            {!showGuestWarning && (
                <button onClick={handleLogout} className={styles.btn_logout}>
                    Log Out
                </button>
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Profile</h1>
            <ProfileContent />
        </div>
    );
}
