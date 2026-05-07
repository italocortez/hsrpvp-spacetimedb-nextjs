'use client';

import React from 'react';
import { DRAFT_MODE_VARIANTS, DraftMode, GAME_MODE_VARIANTS, RuleSet } from '@/components/features/types/enums';
import styles from './GlobalFilterBar.module.css';

const GAME_MODE_LABELS: Record<RuleSet, string> = {
    MemoryOfChaos: 'Memory of Chaos',
    ApocalypticShadow: 'Apocalyptic Shadow',
    AnomalyArbitration: 'Anomaly Arbitration',
};

const DRAFT_MODE_LABELS: Record<DraftMode, string> = {
    Classic: 'Classic Draft',
    Auction: 'Auction Draft',
};

export type CostTab = 'characters' | 'lightcones';

const TAB_LABELS: Record<CostTab, string> = {
    characters: 'Characters',
    lightcones: 'Lightcones',
};

const COST_TABS: CostTab[] = ['characters', 'lightcones'];

interface GlobalFilterBarProps {
    activeTab: CostTab;
    onTabChange: (tab: CostTab) => void;
    gameMode: RuleSet;
    onGameModeChange: (mode: RuleSet) => void;
    draftMode: DraftMode;
    onDraftModeChange: (mode: DraftMode) => void;
}

export default function GlobalFilterBar({
    activeTab,
    onTabChange,
    gameMode,
    onGameModeChange,
    draftMode,
    onDraftModeChange,
}: GlobalFilterBarProps) {
    return (
        <div className={styles.bar}>
            {/* Table selector */}
            <div className={styles.group}>
                {COST_TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => onTabChange(tab)}
                        className={`${styles.btn} ${activeTab === tab ? styles.btnActive : ''}`}
                    >
                        {TAB_LABELS[tab]}
                    </button>
                ))}
            </div>

            {/* Draft Mode */}
            <div className={styles.group}>
                {DRAFT_MODE_VARIANTS.map((mode: DraftMode) => (
                    <button
                        key={mode}
                        onClick={() => onDraftModeChange(mode)}
                        className={`${styles.btn} ${draftMode === mode ? styles.btnActive : ''}`}
                    >
                        {DRAFT_MODE_LABELS[mode] || mode}
                    </button>
                ))}
            </div>

            {/* Game Mode — only for characters */}
            {activeTab === 'characters' && (
                <div className={styles.group}>
                    {GAME_MODE_VARIANTS.map((mode: RuleSet) => (
                        <button
                            key={mode}
                            onClick={() => onGameModeChange(mode)}
                            className={`${styles.btn} ${gameMode === mode ? styles.btnActive : ''}`}
                        >
                            {GAME_MODE_LABELS[mode] || mode}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
