import { useMemo, useEffect, useCallback } from 'react';
import { useSession, signIn, signOut } from "next-auth/react";
import { useTable, useSpacetimeDB } from 'spacetimedb/react';
import { tables } from '@/src/module_bindings';
import { AuthState, User } from '../types';

export function useAuth() {
    // 1. External state: NextAuth session + SpacetimeDB connection
    const { data: session, status: nextAuthStatus } = useSession();
    const { isActive, identity, getConnection, connectionError } = useSpacetimeDB();

    // 2. Subscribe to User table
    const [rows, isReady] = useTable(tables.User);
    const allUsers = (rows || []) as unknown as User[];

    // 3. Find current user by matching SpacetimeDB identity
    const currentUser = useMemo(() => {
        if (!isActive || !identity || !isReady) return null;
        return allUsers.find(u =>
            u.identity.toHexString() === identity.toHexString()
        ) || null;
    }, [allUsers, identity, isReady, isActive]);

    // 4. Side effect: when Discord session is authenticated, sync to SpacetimeDB
    useEffect(() => {
        if (nextAuthStatus !== "authenticated" || !session?.user) return;
        const conn = getConnection();
        if (!conn || !isActive || !isReady) return;

        const discordUser = session.user as any;
        const needsSync = !currentUser || currentUser.isGuest || (currentUser.discordId !== discordUser.id);

        if (needsSync) {
            try {
                conn.reducers.registerDiscordUser({
                    discordId: discordUser.id,
                    discordUsername: discordUser.name || "DiscordUser",
                });
            } catch (e) {
                console.error("Failed to sync Discord user:", e);
            }
        }
    }, [nextAuthStatus, session, getConnection, isActive, currentUser, isReady]);

    // 5. Auth state
    const isConnecting = !isActive && !connectionError;
    const isLoadingData = isActive && !isReady;

    const authState: AuthState = {
        identity: identity || null,
        user: currentUser,
        isAuthenticated: !!currentUser,
        isConnecting,
        isLoadingData,
        connectionError,
    };

    // 6. Actions
    const loginGuest = useCallback(() => {
        const conn = getConnection();
        if (!conn) {
            console.error("SpacetimeDB connection not active. Cannot login as guest.");
            return;
        }
        try {
            conn.reducers.loginAsGuest({});
        } catch (err) {
            console.error("Failed to call loginAsGuest reducer:", err);
        }
    }, [getConnection]);

    const loginDiscord = useCallback(() => signIn("discord"), []);

    const logout = useCallback(() => {
        signOut();
        window.location.reload();
    }, []);

    return {
        ...authState,
        loginGuest,
        loginDiscord,
        logout,
    };
}
