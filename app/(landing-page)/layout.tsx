'use client';

import React from 'react';
import DeletionBanner from '@/features/auth/components/DeletionBanner';
import Header from '@/components/layout/Header';
import styles from './layout.module.css';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.layout_wrapper}>
            <DeletionBanner />
            <Header />

            <main className={styles.main_content}>
                {children}
            </main>

            <footer className={styles.footer}>
                <p>&copy; {new Date().getFullYear()} The Genius Society. All rights reserved.</p>
            </footer>
        </div>
    );
}
