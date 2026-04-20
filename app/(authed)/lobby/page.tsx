"use client";

import React from 'react';
import styles from './page.module.css';

export default function LobbyPage() {
    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Lobby List</h1>
            <p>Initializing active match sessions...</p>
            {/* Future: <LobbyList /> component goes here */}
        </div>
    );
}
