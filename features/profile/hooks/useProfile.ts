"use client";

import { useMemo } from 'react';
import { useTable } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { useAuth } from '@/features/auth/hooks/useAuth';

export interface HsrCharacterRow {
    name: string;
    displayName: string;
    aliases: string[];
    rarity: number;
    imageUrl: string;
}

export function useProfile() {
    const auth = useAuth();

    const [characterRows, charsReady] = useTable(tables.HsrCharacter);
    const allCharacters = (characterRows || []) as unknown as HsrCharacterRow[];

    const avatarImageUrl = useMemo(() => {
        if (!auth.user || !charsReady) return null;
        const char = allCharacters.find(c => c.name === auth.user!.avatarCharacterName);
        return char?.imageUrl ?? null;
    }, [auth.user, allCharacters, charsReady]);

    return {
        ...auth,
        avatarImageUrl,
        isProfileReady: auth.isAuthenticated && charsReady,
    };
}
