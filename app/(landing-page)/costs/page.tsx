'use client';

import { useState } from 'react';
import { Tabs, Tab } from '@heroui/tabs';
import GlobalFilterBar from '@/features/costs/components/GlobalFilterBar';
import CharacterCostTable from '@/features/costs/components/CharacterCostTable';
import LightconeCostTable from '@/features/costs/components/LightconeCostTable';
import styles from './page.module.css';

type CostTab = 'characters' | 'lightcones';

export default function CostTable() {
    const [activeTab, setActiveTab] = useState<CostTab>('characters');
    const [gameMode, setGameMode] = useState('ApocalypticShadow');
    const [draftMode, setDraftMode] = useState<'classic' | 'auction'>('classic');

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Costs</h1>

            <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as CostTab)}
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
                <Tab key="characters" title="Characters" />
                <Tab key="lightcones" title="Lightcones" />
            </Tabs>

            <GlobalFilterBar
                gameMode={gameMode}
                onGameModeChange={setGameMode}
                draftMode={draftMode}
                onDraftModeChange={setDraftMode}
                showGameMode={activeTab === 'characters'}
            />

            {activeTab === 'characters' ? (
                <CharacterCostTable gameMode={gameMode} draftMode={draftMode} />
            ) : (
                <LightconeCostTable draftMode={draftMode} />
            )}
        </div>
    );
}