'use client';

import { useState } from 'react';
import GlobalFilterBar, { CostTab } from '@/components/features/costs/components/global-filter-bar/GlobalFilterBar';
import CharacterCostTable from '@/components/features/costs/components/character-table/CharacterCostTable';
import LightconeCostTable from '@/components/features/costs/components/lightcone-table/LightconeCostTable';
import { LoadingSpinner } from '@/components/globals/icons';
import { useGameData } from '@/components/features/game-data/components/GameDataProvider';
import styles from './page.module.css';
import { DraftMode, RuleSet } from '@/components/features/types/enums';

export default function CostTable() {
    const { isReady } = useGameData();
    const [activeTab, setActiveTab] = useState<CostTab>('characters');
    const [gameMode, setGameMode] = useState<RuleSet>('ApocalypticShadow');
    const [draftMode, setDraftMode] = useState<DraftMode>('Classic');
    const isReadyToRender = isReady; // Only render once game data arrives

    if (!isReadyToRender) {
        return (
            <div className={styles.tableLoading}>
                <LoadingSpinner />
            </div>
        );
    }
    return (
        <div className={styles.container}>
            <GlobalFilterBar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                gameMode={gameMode}
                onGameModeChange={setGameMode}
                draftMode={draftMode}
                onDraftModeChange={setDraftMode}
            />

            {(activeTab === 'characters') ? (
                <CharacterCostTable gameMode={gameMode} draftMode={draftMode} />
            ) : (
                <LightconeCostTable draftMode={draftMode} />
            )}
        </div>
    );
}