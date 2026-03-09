'use client';

import React from 'react';
import { useAuthContext } from '@/features/auth/components/AuthProvider';
import styles from './layout.module.css';

export default function AdminViewLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuthContext();

    if (!user || user.role.tag !== 'Admin') {
        return (
            <div className={styles.access_denied}>
                <h2>Access Denied</h2>
                <p>This area is restricted to administrators.</p>
            </div>
        );
    }

    return (
        <div className={styles.admin_container}>
            {children}
        </div>
    );
}
