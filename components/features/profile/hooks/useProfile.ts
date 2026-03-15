"use client";

import { useMemo } from 'react';
import { useAuthContext } from '@/components/features/auth/components/AuthProvider';
import { useGameData } from '@/components/features/game-data/components/GameDataProvider';

export function useProfile() {
    const auth = useAuthContext();
    const { charactersData, isReady: gameDataReady } = useGameData();

    const avatarImageUrl = useMemo(() => {
        if (!auth.user || !gameDataReady) return null;
        const char = charactersData.find(c => c.name === auth.user!.avatarCharacterName);
        return char?.imageUrl ?? null;
    }, [auth.user, charactersData, gameDataReady]);

    return {
        ...auth,
        avatarImageUrl,
        isProfileReady: auth.isAuthenticated && gameDataReady,
    };
}
