'use client';

import React from 'react';
import DeletionBanner from '@/features/auth/components/DeletionBanner';
import Header from '@/components/layout/Header';
import styles from './layout.module.css';
import Footer from '@/components/layout/Footer';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.layout_wrapper}>
            <DeletionBanner />

            <main className={styles.main_content}>
                {children}
            </main>
        </div>
    );
}
