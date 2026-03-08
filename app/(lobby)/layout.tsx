'use client';

import React from 'react';
import Link from 'next/link';
import AuthGate from '@/features/auth/components/AuthGate';
import styles from './layout.module.css';

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layout_wrapper}>
            <AuthGate message="Please login to access the Battlegrounds">
                <nav className={styles.navbar}>
                    <Link href="/" className={styles.nav_brand}>
                        IPC Battlegrounds
                    </Link>
                    <div className={styles.nav_links}>
                        <Link href="/lobby" className={styles.nav_link}>Lobbies</Link>
                        <Link href="/costs" className={styles.nav_link}>Cost Tables</Link>
                        <Link href="/teambuilder" className={styles.nav_link}>Team Builder</Link>

                        <Link href="/profile" className={styles.profile_icon_link} title="View Profile">
                            <svg
                                className={styles.profile_svg}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                        </Link>
                    </div>
                </nav>

                <main className={styles.main_content}>
                    {children}
                </main>

                <footer className={styles.footer}>
                    <p>&copy; {new Date().getFullYear()} The Genius Society. All rights reserved.</p>
                </footer>
            </AuthGate>
        </div>
    );
}
