'use client';

import React, { useState } from 'react';
import { AdminTab } from '@/components/features/admin-view/types';
import AdminTabs from '@/components/features/admin-view/components/AdminTabs';
import TableExplorer from '@/components/features/admin-view/components/TableExplorer';
import BulkUpsert from '@/components/features/admin-view/components/BulkUpsert';
import UserManager from '@/components/features/admin-view/components/UserManager';

export default function AdminViewPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('tables');

    return (
        <>
            <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div style={{ display: activeTab === 'tables' ? 'block' : 'none' }}>
                <TableExplorer isActive={activeTab === 'tables'} />
            </div>
            <div style={{ display: activeTab === 'bulk-upsert' ? 'block' : 'none' }}>
                <BulkUpsert />
            </div>
            <div style={{ display: activeTab === 'users' ? 'block' : 'none' }}>
                <UserManager isActive={activeTab === 'users'} />
            </div>
        </>
    );
}
