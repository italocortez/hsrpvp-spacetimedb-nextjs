'use client';

import React from 'react';
import { GAME_MODE_VARIANTS } from '@/features/types/enums';

const GAME_MODE_LABELS: Record<string, string> = {
    MemoryOfChaos: 'Memory of Chaos',
    ApocalypticShadow: 'Apocalyptic Shadow',
    AnomalyArbitration: 'Anomaly Arbitration',
};

const DRAFT_MODE_LABELS: Record<string, string> = {
    classic: 'Classic Draft',
    auction: 'Auction Draft',
};

interface GlobalFilterBarProps {
    gameMode: string;
    onGameModeChange: (mode: string) => void;
    draftMode: 'classic' | 'auction';
    onDraftModeChange: (mode: 'classic' | 'auction') => void;
    showGameMode?: boolean;
}

export default function GlobalFilterBar({
    gameMode,
    onGameModeChange,
    draftMode,
    onDraftModeChange,
    showGameMode = true,
}: GlobalFilterBarProps) {
    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Game Mode — only for characters */}
            {showGameMode && (
                <div className="flex gap-1 rounded-lg border border-content3 bg-content1 p-1">
                    {GAME_MODE_VARIANTS.map(mode => (
                        <button
                            key={mode}
                            onClick={() => onGameModeChange(mode)}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                                gameMode === mode
                                    ? 'bg-primary/20 text-primary border border-primary/50'
                                    : 'text-default-400 hover:text-default-200 border border-transparent'
                            }`}
                        >
                            {GAME_MODE_LABELS[mode] || mode}
                        </button>
                    ))}
                </div>
            )}

            {/* Draft Mode */}
            <div className="flex gap-1 rounded-lg border border-content3 bg-content1 p-1">
                {(['classic', 'auction'] as const).map(mode => (
                    <button
                        key={mode}
                        onClick={() => onDraftModeChange(mode)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            draftMode === mode
                                ? 'bg-primary/20 text-primary border border-primary/50'
                                : 'text-default-400 hover:text-default-200 border border-transparent'
                        }`}
                    >
                        {DRAFT_MODE_LABELS[mode]}
                    </button>
                ))}
            </div>
        </div>
    );
}
