"use client";

import React from 'react';
import AuthGate from '@/features/auth/components/AuthGate'; // Use the gate we built!
import styles from './page.module.css';

export default function LobbyPage() {
    return (
        <AuthGate message="Please login to access the Battlegrounds">
            <div className={styles.container}>
                <h1 className={styles.title}>Lobby List</h1>
                <p>Initializing active match sessions...</p>
                {/* Future: <LobbyList /> component goes here */}
            </div>
        </AuthGate>
    );
}