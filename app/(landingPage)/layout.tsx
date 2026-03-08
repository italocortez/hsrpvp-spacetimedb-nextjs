import React from 'react';
import Link from 'next/link';
import styles from './layout.module.css';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.layout_wrapper}>
            {/* Persistent Navigation Bar */}
            <nav className={styles.navbar}>
                <Link href="/" className={styles.nav_brand}>
                    IPC Battlegrounds
                </Link>
                <div className={styles.nav_links}>
                    <Link href="/lobby" className={styles.nav_link}>
                        Lobbies
                    </Link>
                    <Link href="/costs" className={styles.nav_link}>
                        Cost Tables
                    </Link>
                    <Link href="/teambuilder" className={styles.nav_link}>
                        Team Builder
                    </Link>
                </div>
            </nav>

            {/* Main Content Area - Next.js injects your page.tsx here */}
            <main className={styles.main_content}>
                {children}
            </main>

            {/* Optional Footer (if you want something below the contact section) */}
            <footer className={styles.footer}>
                <p>© {new Date().getFullYear()} The Genius Society. All rights reserved.</p>
            </footer>
        </div>
    );
}