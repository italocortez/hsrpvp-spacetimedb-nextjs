import React from 'react';
import styles from './layout.module.css';

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.lobby_shell}>
            {/* You could add a specialized lobby sidebar here later */}
            {children}
        </div>
    );
}