'use client';

import React from 'react';
import AuthRequired from '@/components/features/auth/components/AuthRequired';
import DeletionBanner from '@/components/features/auth/components/DeletionBanner';
import Header from '@/components/globals/layout/Header';
import styles from './layout.module.css';

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={styles.layout_wrapper}>
            <AuthRequired>
                <DeletionBanner />

                {children}
            </AuthRequired>
        </div>
    );
}
