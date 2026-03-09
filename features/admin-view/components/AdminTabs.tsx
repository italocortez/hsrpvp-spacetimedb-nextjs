'use client';

import React from 'react';
import { AdminTab, ADMIN_TABS } from '../types';
import styles from './AdminTabs.module.css';

interface AdminTabsProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

export default function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
    return (
        <div className={styles.tab_bar}>
            {ADMIN_TABS.map(({ key, label }) => (
                <button
                    key={key}
                    className={activeTab === key ? styles.tab_active : styles.tab}
                    onClick={() => onTabChange(key)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
