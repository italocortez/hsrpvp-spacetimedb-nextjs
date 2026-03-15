'use client';

import React from 'react';
import DeletionBanner from '@/components/features/auth/components/DeletionBanner';
import Header from '@/components/globals/layout/Header';
import styles from './layout.module.css';
import Footer from '@/components/globals/layout/Footer';

export default function LandingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.layout_wrapper}>
            <DeletionBanner />

            {/* <main className={styles.main_content}>
            </main> */}
            {children}
        </div>
    );
}
