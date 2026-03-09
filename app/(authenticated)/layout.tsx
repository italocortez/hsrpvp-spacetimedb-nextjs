'use client';

import React from 'react';
import Link from 'next/link';
import AuthGate from '@/features/auth/components/AuthGate';
import { useAuthContext } from '@/features/auth/components/AuthProvider';
import styles from './layout.module.css';

function Navbar() {
    const { user } = useAuthContext();
    const isAdmin = user?.role?.tag === 'Admin';

    return (
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

                {isAdmin && (
                    <Link href="/admin-view" className={styles.admin_icon_link} title="Admin Panel">
                        <svg
                            className={styles.profile_svg}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                            <circle cx="12" cy="12" r="3" />
                        </svg>
                    </Link>
                )}
            </div>
        </nav>
    );
}

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layout_wrapper}>
            <AuthGate message="Please login to access the Battlegrounds">
                <Navbar />

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
