'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/features/auth/components/AuthProvider';
import DeletionBanner from '@/features/auth/components/DeletionBanner';
import styles from './layout.module.css';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated } = useAuthContext();

    return (
        <div className={styles.layout_wrapper}>
            <DeletionBanner />
            <nav className={styles.navbar}>
                <Link href="/" className={styles.nav_brand}>
                    IPC Battlegrounds
                </Link>
                <div className={styles.nav_links}>
                    <Link href="/lobby" className={styles.nav_link}>Lobbies</Link>
                    <Link href="/costs" className={styles.nav_link}>Cost Tables</Link>
                    <Link href="/teambuilder" className={styles.nav_link}>Team Builder</Link>

                    {isAuthenticated && (
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
                    )}
                </div>
            </nav>

            <main className={styles.main_content}>
                {children}
            </main>

            <footer className={styles.footer}>
                <p>© {new Date().getFullYear()} The Genius Society. All rights reserved.</p>
            </footer>
        </div>
    );
}