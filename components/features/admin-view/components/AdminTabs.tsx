'use client';

import React from 'react';
import { Tabs, Tab } from '@heroui/tabs';
import { AdminTab, ADMIN_TABS } from '../types';

interface AdminTabsProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
}

export default function AdminTabs({ activeTab, onTabChange }: AdminTabsProps) {
    return (
        <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => onTabChange(key as AdminTab)}
            variant="underlined"
            color="primary"
            classNames={{
                base: 'w-full flex justify-center',
                tabList: 'gap-8 border-b border-divider',
                cursor: 'bg-primary',
                tab: 'data-[hover=true]:opacity-100',
                tabContent: '!text-white/70 group-data-[selected=true]:!text-primary group-data-[hover=true]:!text-white/90',
            }}
        >
            {ADMIN_TABS.map(({ key, label }) => (
                <Tab key={key} title={label} />
            ))}
        </Tabs>
    );
}
